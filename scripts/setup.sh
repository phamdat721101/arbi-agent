#!/bin/bash
set -e

echo "╔══════════════════════════════════════╗"
echo "║       ArbiAgent — Setup              ║"
echo "╚══════════════════════════════════════╝"
echo ""

# 1. Install backend deps
echo "[1/3] Installing backend dependencies..."
npm install

# 2. Install dashboard deps
if [ -d "dashboard" ]; then
  echo "[2/3] Installing dashboard dependencies..."
  cd dashboard && npm install && cd ..
else
  echo "[2/3] Dashboard not found, skipping..."
fi

# 3. Copy .env if not exists
if [ ! -f .env ]; then
  cp .env.example .env
  echo "[3/3] Created .env from .env.example"
else
  echo "[3/3] .env already exists, skipping..."
fi

echo ""
echo "═══════════════════════════════════════"
echo "  Setup complete! Next steps:"
echo ""
echo "  1. Add AGENT_PRIVATE_KEY to .env"
echo "  2. Add OPENAI_API_KEY to .env"
echo "  3. Fund wallet with USDC on Arbitrum Sepolia"
echo "     Faucet: https://faucet.circle.com/"
echo "  4. Run: npm run dev:all"
echo "═══════════════════════════════════════"
