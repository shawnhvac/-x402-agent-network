#!/usr/bin/env python3
"""
AgentWorld / AgentPay Auto-Responder
Triggered by Postfix for support@ addresses.
Sends an auto-reply to the sender AND forwards original to Gmail.
"""
import sys, email, smtplib, re
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import parseaddr
from datetime import datetime

FORWARD_TO = "x402agentpay@gmail.com"
FROM_ADDR  = "support@x402-agent-pay.com"
SMTP_HOST  = "127.0.0.1"
SMTP_PORT  = 25

AUTO_REPLY_BODY = """Hi there,

Thanks for reaching out to AgentPay / AgentWorld support!

We received your message and will get back to you within 24 hours (usually much sooner).

In the meantime:
- API docs: https://agentworld.me/api/docs
- Platform: https://agentworld.me
- GitHub: https://github.com/shawnhvac/-x402-agent-network

— Shawn Lippert
AgentPay Team
"""

def send_autoreply(to_addr, subject, original_msg_id=""):
    msg = MIMEText(AUTO_REPLY_BODY, "plain")
    msg["From"]    = f"AgentPay Support <{FROM_ADDR}>"
    msg["To"]      = to_addr
    msg["Subject"] = f"Re: {subject}" if not subject.startswith("Re:") else subject
    msg["Auto-Submitted"] = "auto-replied"
    msg["X-Auto-Response-Suppress"] = "All"
    if original_msg_id:
        msg["In-Reply-To"] = original_msg_id
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
            s.sendmail(FROM_ADDR, [to_addr], msg.as_string())
    except Exception as e:
        sys.stderr.write(f"Auto-reply error: {e}\n")

def forward_to_gmail(raw, from_addr, subject):
    fwd = MIMEMultipart()
    fwd["From"]    = FROM_ADDR
    fwd["To"]      = FORWARD_TO
    fwd["Subject"] = f"[FWD] {subject}"
    fwd["X-Forwarded-From"] = from_addr
    fwd.attach(MIMEText(raw, "plain"))
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
            s.sendmail(FROM_ADDR, [FORWARD_TO], fwd.as_string())
    except Exception as e:
        sys.stderr.write(f"Forward error: {e}\n")

def main():
    raw = sys.stdin.read()
    try:
        msg = email.message_from_string(raw)
    except Exception:
        sys.exit(0)

    sender_name, sender_addr = parseaddr(msg.get("From",""))
    subject   = msg.get("Subject","(no subject)")
    msg_id    = msg.get("Message-ID","")
    auto_sub  = msg.get("Auto-Submitted","")
    precedence = msg.get("Precedence","")

    # Don't auto-reply to auto-replies, bulk mail, or no-reply addresses
    if auto_sub and auto_sub != "no":
        sys.exit(0)
    if precedence.lower() in ("bulk","list","junk"):
        sys.exit(0)
    if not sender_addr or re.search(r'no.?reply|noreply|mailer-daemon|postmaster', sender_addr, re.I):
        sys.exit(0)

    # Forward to Gmail first
    forward_to_gmail(raw, sender_addr, subject)

    # Send auto-reply
    send_autoreply(sender_addr, subject, msg_id)

if __name__ == "__main__":
    main()
