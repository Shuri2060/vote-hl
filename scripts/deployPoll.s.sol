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
    hyGov = HyGov(0xDB6b3d45EA9a77E5B14E30c570294bE3EEA802Cd);
    string[] memory choices = new string[](3);
    choices[0] = "Yes";
    choices[1] = "Definitely";
    choices[2] = "Mega Bozo";
    hyGov.createPoll("Is Shuri a bozo?", choices, block.timestamp, block.timestamp + 30 days, 1000000000000000000, deployer);
    // log the L1Read address
    console.log('HyGov address:', address(hyGov));

    vm.stopBroadcast();
  }
}
