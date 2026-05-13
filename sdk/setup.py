from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as f:
    long_description = f.read()

setup(
    name="x402-agentpay",
    version="1.0.0",
    author="Shawn Lippert",
    author_email="x402agentpay@gmail.com",
    description="Machine-to-machine payments for AI agents — x402 protocol on Base L2",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/shawnhvac/-x402-agent-network",
    project_urls={
        "Homepage":    "https://agentworld.me",
        "API Docs":    "https://agentworld.me/api/agentpay/v2/status",
        "Bug Tracker": "https://github.com/shawnhvac/-x402-agent-network/issues",
    },
    packages=find_packages(),
    python_requires=">=3.8",
    install_requires=[],          # zero dependencies — pure stdlib
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Intended Audience :: Developers",
    ],
    keywords="ai agents payments x402 usdc base blockchain machine-to-machine",
)
