"""
AgentWorld Model Router
========================
Tiered model routing:
  Tier 1 (LOCAL FAST)  — llama3.2:1b     — simple NPC chatter, quick replies
  Tier 2 (LOCAL SMART) — gemma3:4b        — complex reasoning, negotiations, jobs
  Tier 3 (CLOUD)       — OpenRouter       — fallback when local fails, or 'think' tasks
                          default: google/gemma-2-9b-it (free tier)
                          premium: anthropic/claude-haiku-3 (paid, ~0.0001/token)

Usage:
  from model_router import chat, TIER_FAST, TIER_SMART, TIER_CLOUD

  reply = chat(messages, tier=TIER_SMART)
  reply = chat(messages, tier=TIER_CLOUD, model='meta-llama/llama-3.1-8b-instruct:free')
"""

import os, json, urllib.request as _req, urllib.error

TIER_FAST  = 'fast'    # llama3.2:1b  — ~0.3s
TIER_SMART = 'smart'   # gemma3:4b    — ~1-2s, better reasoning
TIER_CLOUD = 'cloud'   # OpenRouter   — fallback / heavy tasks

OLLAMA_URL       = 'http://localhost:11434/api/chat'
OPENROUTER_URL   = 'https://openrouter.ai/api/v1/chat/completions'
# Load from .env if not already in environment
_env_path = '/root/agentworld/.env'
if os.path.exists(_env_path):
    with open(_env_path) as _ef:
        for _el in _ef:
            _el = _el.strip()
            if '=' in _el and not _el.startswith('#'):
                _ek, _ev = _el.split('=', 1)
                if _ek not in os.environ:
                    os.environ[_ek] = _ev
OPENROUTER_KEY   = os.environ.get('OPENROUTER_API_KEY', '')

TIER_MODELS = {
    TIER_FAST:  'llama3.2:1b',
    TIER_SMART: 'gemma3:4b',
}

# OpenRouter free models (no credit cost) — ordered by quality
OR_FREE_MODELS = [
    'google/gemma-4-31b-it:free',
    'google/gemma-4-26b-a4b-it:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'nousresearch/hermes-3-llama-3.1-405b:free',
]

# OpenRouter paid fallback (tiny cost, high quality)
OR_PAID_MODEL = 'google/gemma-4-31b-it:free'


def _ollama_chat(messages, model, max_tokens=200, temperature=0.8, timeout=60):
    """Call local Ollama. Returns (reply_str, tokens_int) or raises."""
    payload = json.dumps({
        'model': model,
        'messages': messages,
        'stream': False,
        'keep_alive': '60m',
        'options': {
            'num_predict': max_tokens,
            'temperature': temperature,
            'num_ctx': 1024,
        }
    }).encode()
    req = _req.Request(OLLAMA_URL, data=payload,
                       headers={'Content-Type': 'application/json'})
    with _req.urlopen(req, timeout=timeout) as r:
        data = json.loads(r.read())
    reply = data.get('message', {}).get('content', '').strip()
    tokens = data.get('eval_count', 0)
    if not reply:
        raise ValueError('empty ollama response')
    return reply, tokens


def _openrouter_chat(messages, model=None, max_tokens=300, temperature=0.8, timeout=45):
    """Call OpenRouter API. Tries free models first, then paid fallback."""
    if not OPENROUTER_KEY:
        raise ValueError('OPENROUTER_API_KEY not set')

    models_to_try = [model] if model else OR_FREE_MODELS

    for m in models_to_try:
        try:
            payload = json.dumps({
                'model': m,
                'messages': messages,
                'max_tokens': max_tokens,
                'temperature': temperature,
            }).encode()
            req = _req.Request(
                OPENROUTER_URL,
                data=payload,
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {OPENROUTER_KEY}',
                    'HTTP-Referer': 'https://agentworld.me',
                    'X-Title': 'AgentWorld',
                }
            )
            with _req.urlopen(req, timeout=timeout) as r:
                data = json.loads(r.read())
            reply = data['choices'][0]['message']['content'].strip()
            tokens = data.get('usage', {}).get('completion_tokens', 0)
            if reply:
                return reply, tokens, m
        except Exception as e:
            print(f'[router] OpenRouter {m} failed: {e}')
            continue

    raise RuntimeError('All OpenRouter models failed')


def chat(messages, tier=TIER_FAST, model=None, max_tokens=200,
         temperature=0.8, fallback_to_cloud=True):
    """
    Main entry point. Returns dict:
      {'reply': str, 'tokens': int, 'model_used': str, 'tier': str}
    """
    # --- Tier 1 or 2: try local Ollama first ---
    if tier in (TIER_FAST, TIER_SMART):
        local_model = TIER_MODELS[tier]
        try:
            reply, tokens = _ollama_chat(
                messages, local_model, max_tokens=max_tokens,
                temperature=temperature
            )
            return {'reply': reply, 'tokens': tokens,
                    'model_used': local_model, 'tier': tier}
        except Exception as e:
            print(f'[router] Local {local_model} failed: {e}')
            if not fallback_to_cloud:
                # Try the other local model before giving up
                other = TIER_MODELS[TIER_FAST if tier == TIER_SMART else TIER_SMART]
                try:
                    reply, tokens = _ollama_chat(messages, other, max_tokens=max_tokens)
                    return {'reply': reply, 'tokens': tokens,
                            'model_used': other, 'tier': 'local_fallback'}
                except Exception:
                    pass
                return {'reply': "I'm processing something complex — try again in a moment.",
                        'tokens': 0, 'model_used': 'none', 'tier': 'failed'}

    # --- Tier 3 or local failed with fallback_to_cloud=True ---
    try:
        reply, tokens, used_model = _openrouter_chat(
            messages, model=model, max_tokens=max_tokens,
            temperature=temperature
        )
        return {'reply': reply, 'tokens': tokens,
                'model_used': used_model, 'tier': TIER_CLOUD}
    except Exception as e:
        print(f'[router] OpenRouter failed: {e}')
        # Last resort: try local fast
        try:
            reply, tokens = _ollama_chat(messages, TIER_MODELS[TIER_FAST],
                                          max_tokens=100)
            return {'reply': reply, 'tokens': tokens,
                    'model_used': TIER_MODELS[TIER_FAST], 'tier': 'emergency_local'}
        except Exception:
            pass
        return {'reply': "I'm offline for maintenance. Back shortly!",
                'tokens': 0, 'model_used': 'none', 'tier': 'failed'}


def health_check():
    """Returns status of all model tiers."""
    status = {}
    for tier, model in TIER_MODELS.items():
        try:
            _ollama_chat([{'role':'user','content':'hi'}], model, max_tokens=5, timeout=10)
            status[tier] = {'ok': True, 'model': model}
        except Exception as e:
            status[tier] = {'ok': False, 'model': model, 'error': str(e)}
    try:
        _openrouter_chat([{'role':'user','content':'hi'}],
                         model=OR_FREE_MODELS[0], max_tokens=5, timeout=15)
        status['cloud'] = {'ok': True, 'model': OR_FREE_MODELS[0]}
    except Exception as e:
        status['cloud'] = {'ok': False, 'error': str(e)}
    return status
