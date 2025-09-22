// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Script} from 'forge-std/Script.sol';
import {StdCheats} from 'forge-std/StdCheats.sol';

import {HyGov} from 'contracts/HyGov.sol';

import {console} from 'forge-std/console.sol';

contract HyGovScript is Script, StdCheats {
  address deployer;

  HyGov internal hyGov;

  function run() public virtual {
    uint256 deployerPrivateKey = vm.envUint('TESTNET_PRIVATE_KEY');

    vm.startBroadcast(deployerPrivateKey);
    deployer = vm.addr(deployerPrivateKey);
    hyGov = new HyGov(0x697D4D5d5e1990710E558c7008C28d40af176651, 0xA19F925Db7F0425bd9B87Ad1599F4D502A3ec685);

    // log the L1Read address
    console.log('HyGov address:', address(hyGov));

    vm.stopBroadcast();
  }
}
