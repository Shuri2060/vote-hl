// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {L1Read} from "contracts/L1Read.sol";

contract HyGov {
    mapping(uint256 => Vote) public votes;
    mapping(uint256 => Poll) public polls;
    mapping(uint256 => mapping(uint256 => uint256)) public tallies;

    L1Read public read;
    address public oracle;
    uint256 public pollCount;

    constructor(address _oracle, address _read) {
        oracle = _oracle;
        read = L1Read(_read);
    }

    struct Poll {
        string question;
        string[] choices;
        uint256 startDate;
        uint256 endDate;
        uint256 minStake;
        address creator;
    }

    struct Vote {
        address[] voters;
        uint256[] choices;
        uint256 timestamp;
    }

    event PollCreated(uint256 indexed pollId);
    event PollEnded(uint256 indexed pollId);
    event VotePushed(
        uint256 indexed pollId
    );

    function createPoll(
        string memory question, 
        string[] memory choices, 
        uint256 startDate, 
        uint256 endDate,
        uint256 minStake,
        address creator
        ) external returns (uint256 pollId) {
            pollId = pollCount;
            polls[pollId] = Poll(question, choices, startDate, endDate, minStake, creator);
            pollCount++;
            emit PollCreated(pollId);
            return pollId;
        }

    function endPoll(uint256 pollId) external {
        require(polls[pollId].endDate < block.timestamp, "Poll has not ended");
        require(votes[pollId].timestamp > 0, "Votes have not been pushed");
        tally(pollId);
        emit PollEnded(pollId);
    }

    function tally(uint256 pollId) internal {
        for (uint256 i = 0; i < votes[pollId].voters.length; i++) {
            L1Read.Delegation[] memory delegations = read.delegations(
                votes[pollId].voters[i]
            );
            for (uint256 j = 0; j < delegations.length; j++) {
                tallies[pollId][votes[pollId].choices[i]] += delegations[j]
                    .amount;
            }
        }
    }

    function pushVotes(
        uint256 pollId,
        address[] memory voters,
        uint256[] memory choices
    ) external {
        require(msg.sender == oracle, "Only the oracle can push votes");
        require(
            voters.length == choices.length,
            "Voters and choices must be the same length"
        );

        // Push each voter individually
        for (uint256 i = 0; i < voters.length; i++) {
            votes[pollId].voters.push(voters[i]);
        }

        // Push each choice individually
        for (uint256 i = 0; i < choices.length; i++) {
            votes[pollId].choices.push(choices[i]);
        }

        votes[pollId].timestamp = block.timestamp;
        emit VotePushed(pollId);
    }

    function getChoicesFromPoll(uint256 pollId) external view returns (string[] memory) {
        return polls[pollId].choices;
    }

    function getVotersFromVote(uint256 pollId) external view returns (address[] memory) {
        return votes[pollId].voters;
    }

    function getChoicesFromVote(uint256 pollId) external view returns (uint256[] memory) {
        return votes[pollId].choices;
    }
    
}
