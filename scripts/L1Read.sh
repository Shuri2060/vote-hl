#!/bin/bash
source script/.env
echo "guh"
export HYPEREVMSCAN_API_KEY=U24WPQ4QBTC6868984E1WQDNCG1EB1BS5B
forge script scripts/L1Read.s.sol:L1ReadScript --sig "run()" --fork-url "https://silent-young-bird.hype-mainnet.quiknode.pro/a83e2b2c0886515e2dbe831521255c4ace480ec3/evm" --broadcast -vv --sender 0x9d68BBb2D8933034dF17d3dC07496e66Ed6a2728 --etherscan-api-key $HYPEREVMSCAN_API_KEY --verify