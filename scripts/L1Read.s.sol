// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Script} from 'forge-std/Script.sol';
import {StdCheats} from 'forge-std/StdCheats.sol';

import {L1Read} from 'contracts/L1Read.sol';

import {console} from 'forge-std/console.sol';

contract L1ReadScript is Script, StdCheats {
  address deployer;

  L1Read internal l1Read;

  function run() public virtual {
    uint256 deployerPrivateKey = vm.envUint('DEPLOYER_PRIVATE_KEY');

    vm.startBroadcast(deployerPrivateKey);
    deployer = vm.addr(deployerPrivateKey);
    l1Read = new L1Read();

    // log the L1Read address
    console.log('L1Read address:', address(l1Read));

    vm.stopBroadcast();
  }
}
