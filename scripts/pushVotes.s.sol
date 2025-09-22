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
    uint256[] memory choices = new uint256[](3);
    choices[0] = 1;
    choices[1] = 1;
    choices[2] = 2;
    address[] memory voters = new address[](3);
    voters[0] = deployer;
    voters[1] = address(0x697D4D5d5e1990710E558c7008C28d40af176651);
    voters[2] = address(0x697d4d5d5e1990710e558c7008c28D40aF176652);
    hyGov.pushVotes(0, voters, choices);
    // log the L1Read address
    console.log('HyGov address:', address(hyGov));

    vm.stopBroadcast();
  }
}
