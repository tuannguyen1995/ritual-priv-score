// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/RitualPrivScore.sol";
import "../src/PrivScoreAgent.sol";

// Mock Scheduler Contract to be etched
contract MockScheduler {
    uint256 public nextTaskId = 1;
    function schedule(
        address target,
        bytes memory data,
        uint256 value,
        uint256 gasLimit,
        uint256 startBlock,
        uint256 blockInterval,
        uint256 executionTimes,
        uint256 priorityFee,
        address refundAddress,
        bytes memory extraData
    ) external payable returns (uint256) {
        return nextTaskId++;
    }
}

contract RitualPrivScoreTest is Test {
    RitualPrivScore public scoreContract;
    PrivScoreAgent public agent;
    
    address public user1 = address(0x111);
    
    address constant SCHEDULER_ADDR = 0x0000000000000000000000000000000000000999;
    address constant HTTP_PRECOMPILE = 0x0000000000000000000000000000000000000801;
    address constant LLM_PRECOMPILE = 0x0000000000000000000000000000000000000802;

    function setUp() public {
        // Deploy Score Contract
        scoreContract = new RitualPrivScore();
        
        // Etch Mock Scheduler
        MockScheduler mockSched = new MockScheduler();
        vm.etch(SCHEDULER_ADDR, address(mockSched).code);
        
        // Deploy Agent Contract
        agent = new PrivScoreAgent(address(scoreContract), SCHEDULER_ADDR);
        
        // Transfer ownership of Score Contract to Agent
        scoreContract.transferOwnership(address(agent));
    }

    function test_CalculateScore_MockMode() public {
        assertTrue(agent.mockMode());
        
        // Call calculateScore
        vm.prank(user1);
        agent.calculateScore(user1);
        
        uint256 score = scoreContract.creditScores(user1);
        assertGt(score, 0); // score should be set
        
        // Check if certificate minted if score >= 700
        if (score >= 700) {
            uint256 tokenId = scoreContract.soulboundCertificates(user1);
            assertEq(tokenId, 1);
            assertEq(scoreContract.ownerOf(tokenId), user1);
        }
    }
    
    function test_NonTransferableCertificate() public {
        // Force set score manually via agent mock logic
        // We know mock score for user1 (0x111) is 650 + (0x111 % 200) = 650 + 73 = 723
        vm.prank(user1);
        agent.calculateScore(user1);
        
        uint256 tokenId = scoreContract.soulboundCertificates(user1);
        assertEq(tokenId, 1);
        
        // Try transferring
        vm.prank(user1);
        vm.expectRevert("RitualPrivScore: Soulbound certificates are non-transferable");
        scoreContract.transferFrom(user1, address(0x222), tokenId);
    }
    
    function test_SetupSchedule() public {
        vm.deal(address(this), 1 ether);
        agent.setupSchedule{value: 0.01 ether}(user1);
        // If it doesn't revert, success since we etched a MockScheduler that returns ID.
    }
}
