// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HyGov {

    mapping(uint256 => Poll) public polls;
    uint256 public pollCount;


    struct Poll {
        string question;
        string description;
        uint256 startDate;
        uint256 endDate;
        uint256 minStake;
        address creator;
    }

    event PollCreated(uint256 indexedpollId);

    function createPoll(
        string memory question, 
        string memory description, 
        uint256 startDate, 
        uint256 endDate,
        uint256 minStake,
        address creator
        ) external returns (uint256 pollId) {
            pollId = pollCount;
            polls[pollId] = Poll(question, description, startDate, endDate, minStake, creator);
            pollCount++;
            emit PollCreated(pollId);
            return pollId;
        }

    function changeDescription(
        uint256 pollId,
        string memory description
    ) external {
        // check the user changing description is the creator
        require(polls[pollId].creator == msg.sender, "You are not the creator of this poll");
        polls[pollId].description = description;
    }
    

}