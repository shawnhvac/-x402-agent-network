
// ── AgentPay Nav — injected safely so scripts execute ─────────────────────
(function() {
  function injectNav() {
    fetch('/nav.html')
      .then(r => r.text())
      .then(html => {
        // Parse out <style> and non-script HTML separately from <script>
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Insert styles
        doc.querySelectorAll('style').forEach(s => {
          const el = document.createElement('style');
          el.textContent = s.textContent;
          document.head.appendChild(el);
        });

        // Build nav HTML without <script> and <style> tags
        const body = doc.body;
        const scripts = Array.from(body.querySelectorAll('script'));
        scripts.forEach(s => s.remove());
        body.querySelectorAll('style').forEach(s => s.remove());

        const placeholder = document.getElementById('nav-placeholder');
        if (placeholder) {
          placeholder.innerHTML = body.innerHTML;
        } else {
          // No placeholder — prepend to body
          const div = document.createElement('div');
          div.innerHTML = body.innerHTML;
          document.body.insertBefore(div, document.body.firstChild);
        }

        // Now manually execute the nav scripts
        initNav();
      })
      .catch(() => console.warn('Nav load failed'));
  }

  function initNav() {
    // Use event delegation — works after dynamic injection
    document.addEventListener('click', function(e) {
      const toggleBtn = e.target.closest('[data-nav-toggle]');
      const openBtn   = e.target.closest('[data-nav-open-drawer]');
      const closeBtn  = e.target.closest('[data-nav-close-drawer]');

      if (toggleBtn) {
        e.stopPropagation();
        const id = toggleBtn.getAttribute('data-nav-toggle');
        document.querySelectorAll('.nav-menu').forEach(m => {
          m.style.display = (m.id === id && m.style.display !== 'block') ? 'block' : 'none';
        });
        return;
      }

      if (openBtn) {
        e.stopPropagation();
        const drawer  = document.getElementById('nav-drawer');
        const overlay = document.getElementById('nav-overlay');
        if (drawer)  { drawer.style.display = 'block'; setTimeout(() => drawer.classList.add('open'), 10); }
        if (overlay) { overlay.style.display = 'block'; setTimeout(() => overlay.classList.add('open'), 10); }
        document.body.style.overflow = 'hidden';
        return;
      }

      if (closeBtn) {
        e.stopPropagation();
        const drawer  = document.getElementById('nav-drawer');
        const overlay = document.getElementById('nav-overlay');
        if (drawer)  drawer.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
        document.body.style.overflow = '';
        setTimeout(() => {
          if (drawer && !drawer.classList.contains('open'))  drawer.style.display = 'none';
          if (overlay && !overlay.classList.contains('open')) overlay.style.display = 'none';
        }, 260);
        return;
      }

      // Close dropdowns when clicking outside
      if (!e.target.closest('.nav-dropdown')) {
        document.querySelectorAll('.nav-menu').forEach(m => m.style.display = 'none');
      }
    }, true); // capture phase so it fires before anything else
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNav);
  } else {
    injectNav();
  }
})();

/**
 * AgentPay AI Chatbot — powered by Llama 3.3 70B via NVIDIA NIM
 */
class AgentPayChatbot {
  constructor() {
    this.isOpen = false;
    this.messages = [
      { role: 'assistant', content: "Hi! 👋 I'm the AgentPay AI assistant. Ask me anything about how AgentPay works, pricing, integrations, the Android app, or how to get started as a provider or developer!" }
    ];
    this.init();
  }

  init() {
    const btn = document.createElement('div');
    btn.id = 'chatbot-btn';
    btn.innerHTML = '💬';
    btn.title = 'Chat with AgentPay AI';
    btn.style.cssText = `
      position:fixed; bottom:24px; right:24px; width:56px; height:56px;
      background:linear-gradient(135deg,#3b82f6,#6366f1); border-radius:50%;
      display:flex; align-items:center; justify-content:center; cursor:pointer;
      font-size:24px; box-shadow:0 4px 20px rgba(59,130,246,0.5);
      z-index:9998; transition:transform 0.2s;
    `;
    btn.onmouseenter = () => btn.style.transform = 'scale(1.1)';
    btn.onmouseleave = () => btn.style.transform = 'scale(1)';
    btn.onclick = () => this.toggle();
    document.body.appendChild(btn);

    const win = document.createElement('div');
    win.id = 'chatbot-win';
    win.style.cssText = `
      position:fixed; bottom:90px; right:24px; width:360px; max-height:520px;
      background:#0f172a; border:1px solid #334155; border-radius:16px;
      display:none; flex-direction:column; z-index:9999;
      box-shadow:0 20px 60px rgba(0,0,0,0.5); overflow:hidden;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    `;
    win.innerHTML = `
      <div style="background:linear-gradient(135deg,#1e293b,#0f172a);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #334155;">
        <div>
          <div style="color:#fff;font-weight:700;font-size:15px;">🤖 AgentPay AI</div>
          <div style="color:#3b82f6;font-size:11px;">Powered by Llama 3.3 70B</div>
        </div>
        <button onclick="agentPayBot.toggle()" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:20px;padding:0;">×</button>
      </div>
      <div id="chatbot-msgs" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;max-height:340px;"></div>
      <div style="padding:12px;border-top:1px solid #334155;display:flex;gap:8px;background:#1e293b;">
        <input id="chatbot-input" type="text" placeholder="Ask me anything..."
          style="flex:1;background:#0f172a;border:1px solid #334155;border-radius:8px;padding:10px 14px;color:#fff;font-size:14px;outline:none;"
          onkeydown="if(event.key==='Enter')agentPayBot.send()"/>
        <button onclick="agentPayBot.send()" id="chatbot-send"
          style="background:#3b82f6;border:none;border-radius:8px;padding:10px 14px;color:#fff;cursor:pointer;font-size:16px;">➤</button>
      </div>
    `;
    document.body.appendChild(win);
    this.renderMessages();
  }

  toggle() {
    this.isOpen = !this.isOpen;
    document.getElementById('chatbot-win').style.display = this.isOpen ? 'flex' : 'none';
    if (this.isOpen) setTimeout(() => document.getElementById('chatbot-input').focus(), 100);
  }

  renderMessages() {
    const box = document.getElementById('chatbot-msgs');
    if (!box) return;
    box.innerHTML = '';
    this.messages.forEach(m => {
      const isUser = m.role === 'user';
      const el = document.createElement('div');
      el.style.cssText = `display:flex;justify-content:${isUser?'flex-end':'flex-start'};`;
      el.innerHTML = `
        <div style="max-width:80%;background:${isUser?'#3b82f6':'#1e293b'};color:#fff;
          padding:10px 14px;border-radius:${isUser?'16px 16px 4px 16px':'16px 16px 16px 4px'};
          font-size:14px;line-height:1.5;white-space:pre-wrap;">${m.content}</div>
      `;
      box.appendChild(el);
    });
    box.scrollTop = box.scrollHeight;
  }

  async send() {
    const input = document.getElementById('chatbot-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    this.messages.push({ role: 'user', content: text });
    this.renderMessages();

    // Loading bubble
    const box = document.getElementById('chatbot-msgs');
    const loader = document.createElement('div');
    loader.id = 'chatbot-loader';
    loader.style.cssText = 'display:flex;justify-content:flex-start;';
    loader.innerHTML = '<div style="background:#1e293b;color:#64748b;padding:10px 14px;border-radius:16px 16px 16px 4px;font-size:14px;">⏳ Thinking...</div>';
    box.appendChild(loader);
    box.scrollTop = box.scrollHeight;

    try {
      const res = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: this.messages.slice(-8) })
      });
      const data = await res.json();
      const reply = data.reply || "Sorry, I couldn't get a response. Try again!";
      this.messages.push({ role: 'assistant', content: reply });
    } catch(e) {
      this.messages.push({ role: 'assistant', content: "Connection error — please try again in a moment." });
    }
    document.getElementById('chatbot-loader')?.remove();
    this.renderMessages();
  }
}

const agentPayBot = new AgentPayChatbot();
