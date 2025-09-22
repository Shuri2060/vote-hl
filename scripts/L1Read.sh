#!/bin/bash
source script/.env
echo "guh"
export HYPEREVMSCAN_API_KEY=U24WPQ4QBTC6868984E1WQDNCG1EB1BS5B
forge script scripts/L1Read.s.sol:L1ReadScript --sig "run()" --fork-url https://rpc.hyperliquid-testnet.xyz/evm --broadcast -vv --sender 0x697D4D5d5e1990710E558c7008C28d40af176651 --etherscan-api-key $HYPEREVMSCAN_API_KEY --verify