#!/usr/bin/env bash
# scripts/vps-start.sh
# Deploy and start ArbiAgent + Facilitator on VPS.
# Run from project root: bash scripts/vps-start.sh

set -euo pipefail

KEY="$(dirname "$0")/../nim-claw.pem"
HOST="bitnami@13.212.80.72"
SSH_CMD="ssh -i $KEY -o StrictHostKeyChecking=no $HOST"

echo "=== 1. Fix Caddy (handle_path for prefix stripping) ==="
$SSH_CMD "sudo tee /etc/caddy/Caddyfile > /dev/null << 'EOF'
13-212-80-72.sslip.io {
    handle_path /facilitator/* {
        reverse_proxy localhost:3002
    }
    handle {
        reverse_proxy localhost:4021
    }
}
EOF
sudo systemctl reload caddy && echo 'Caddy reloaded'"

echo "=== 2. Stop existing processes ==="
$SSH_CMD "pkill -f facilitator.ts || true; pkill -f arbi-agent/src/index || true; sleep 2"

echo "=== 3. Start Facilitator (port 3002) ==="
$SSH_CMD "cd ~/arbi-agent && nohup node_modules/.bin/tsx src/facilitator.ts </dev/null >> logs/facilitator.log 2>&1 & disown"
echo "Waiting 8s for facilitator..."
sleep 8

echo "=== 4. Start Agent (port 4021) ==="
$SSH_CMD "cd ~/arbi-agent && nohup node_modules/.bin/tsx src/index.ts </dev/null >> logs/agent.log 2>&1 & disown"
echo "Waiting 15s for agent x402 init..."
sleep 15

echo "=== 5. Health check ==="
$SSH_CMD "curl -sf http://localhost:3002/supported && echo 'Facilitator OK' || echo 'Facilitator FAIL'"
$SSH_CMD "curl -sf http://localhost:4021/ && echo 'Agent OK' || echo 'Agent FAIL (may still be starting)'"

echo ""
echo "=== 6. Logs ==="
$SSH_CMD "tail -6 ~/arbi-agent/logs/facilitator.log"
echo "---"
$SSH_CMD "tail -12 ~/arbi-agent/logs/agent.log"

echo ""
echo "Done!"
echo "  Agent API:   https://13-212-80-72.sslip.io"
echo "  Facilitator: https://13-212-80-72.sslip.io/facilitator"
