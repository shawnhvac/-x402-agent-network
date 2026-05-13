"""
AgentPay Python SDK
pip install agentpay

Usage:
    from agentpay import AgentPay
    ap = AgentPay(api_key="your-key", agent_id="my-agent")
    ap.pay(to="ai-lawyer", capability="contract-review", amount=0.05)
"""
from .client import AgentPay
from .models import Capability, LedgerEntry, ReputationScore, PermissionGrant
__version__ = "1.0.0"
__all__ = ["AgentPay", "Capability", "LedgerEntry", "ReputationScore", "PermissionGrant"]
