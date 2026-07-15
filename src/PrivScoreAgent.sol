// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./RitualPrivScore.sol";
import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

// Interfaces for Ritual Precompiles
interface IHTTP {
    function get(string memory url) external returns (string memory);
}

interface ILLM {
    function generate(string memory prompt) external returns (string memory);
}

interface IScheduler {
    // 10 parameters standard schedule function
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
    ) external payable returns (uint256 taskId);
}

contract PrivScoreAgent is Ownable {
    RitualPrivScore public scoreContract;
    
    bool public mockMode = true; // Bypass precompiles for demo stability

    // Precompile addresses on Ritual Testnet
    address constant HTTP_PRECOMPILE = 0x0000000000000000000000000000000000000801;
    address constant LLM_PRECOMPILE = 0x0000000000000000000000000000000000000802;
    address public schedulerAddress;

    event LogData(string message);

    constructor(address _scoreContract, address _schedulerAddress) Ownable(msg.sender) {
        scoreContract = RitualPrivScore(_scoreContract);
        schedulerAddress = _schedulerAddress;
    }

    function setMockMode(bool _mockMode) external onlyOwner {
        mockMode = _mockMode;
    }

    /**
     * @dev Main function to calculate score. Can be called manually or by scheduler.
     */
    function calculateScore(address user) external {
        uint256 finalScore;
        
        if (mockMode) {
            // Bypass precompiles: generate a mock score between 300 and 850
            finalScore = 650 + (uint160(user) % 200); // deterministically mock based on address
            emit LogData("Calculated score using Mock Mode");
        } else {
            // Call HTTP Precompile to fetch off-chain data privately
            string memory offchainData = IHTTP(HTTP_PRECOMPILE).get("https://api.example.com/user-data");
            emit LogData(offchainData);
            
            // Call LLM Precompile to evaluate score within TEE
            string memory prompt = string.concat("Calculate credit score based on: ", offchainData);
            string memory llmResult = ILLM(LLM_PRECOMPILE).generate(prompt);
            emit LogData(llmResult);
            
            // For demo purposes, parse a simple score from LLM or just assign a mock one if parsing is complex in Solidity
            finalScore = 750; // In reality, we would parse `llmResult`
        }

        // Update the score in the main contract
        scoreContract.updateScore(user, finalScore);
    }

    /**
     * @dev Setup an automated schedule to periodically update scores
     */
    function setupSchedule(address user) external payable onlyOwner {
        require(schedulerAddress != address(0), "Scheduler not set");
        
        // 10 parameter schedule call
        bytes memory callData = abi.encodeWithSelector(this.calculateScore.selector, user);
        
        IScheduler(schedulerAddress).schedule{value: msg.value}(
            address(this),       // target
            callData,            // data
            0,                   // value
            500000,              // gasLimit
            block.number + 10,   // startBlock
            100,                 // blockInterval
            5,                   // executionTimes (e.g., run 5 times)
            1 gwei,              // priorityFee
            msg.sender,          // refundAddress
            ""                   // extraData
        );
    }
}
