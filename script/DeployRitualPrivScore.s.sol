// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/RitualPrivScore.sol";
import "../src/PrivScoreAgent.sol";

contract DeployRitualPrivScore is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address schedulerAddress = vm.envOr("SCHEDULER_ADDRESS", address(0x0000000000000000000000000000000000000999));

        vm.startBroadcast(deployerPrivateKey);

        // Deploy Main Contract
        RitualPrivScore scoreContract = new RitualPrivScore();
        
        // Deploy Agent Contract
        PrivScoreAgent agentContract = new PrivScoreAgent(address(scoreContract), schedulerAddress);
        
        // Transfer Ownership to Agent
        scoreContract.transferOwnership(address(agentContract));

        vm.stopBroadcast();

        // Log addresses
        console.log("RitualPrivScore deployed to:", address(scoreContract));
        console.log("PrivScoreAgent deployed to:", address(agentContract));
    }
}
