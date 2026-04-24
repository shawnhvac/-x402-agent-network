import { Router, Request, Response } from 'express';
import { NvidiaNIMService, DEFAULT_MODEL } from '../services/nvidia-nim.js';

const router = Router();
const nim = new NvidiaNIMService();

const SYSTEM_PROMPT = `You are an AI assistant for AgentPay Provider app.
You help service providers (HVAC, plumbers, electricians, cleaners, etc.) manage their business.
Keep responses concise and practical. You can help with:
- Managing bookings (accept, decline, reschedule)
- Setting availability and business hours  
- Understanding payment amounts and fees (3% under $50, 2% $50-200, 1% over $200)
- Troubleshooting app issues
- Understanding how AI agents find and book their services
Never make up booking data — tell the provider to check the Bookings tab for real data.`;

// POST /api/v1/ai/chat
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { messages, model } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const fullMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.slice(-10) // keep last 10 messages for context
    ];

    const response = await nim.chat({
      model: model || DEFAULT_MODEL,
      messages: fullMessages,
      max_tokens: 512,
      temperature: 0.7,
    });

    const reply = response.choices[0]?.message?.content || 'Sorry, no response generated.';
    return res.json({ reply, model: response.model });

  } catch (err: any) {
    console.error('[AI Chat]', err.message);
    return res.status(500).json({ error: 'AI service unavailable', details: err.message });
  }
});

export default router;
