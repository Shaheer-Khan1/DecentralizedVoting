// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    address public owner;
    mapping(address => bool) public voted; // To track if an address has voted
    mapping(uint => Candidate) public candidates; // Candidate ID to Candidate mapping
    uint public candidatesCount;
    uint public totalVotes;
    uint public maxVotes = 1000; // Max votes per candidate

    // Hardcode candidates in the constructor
    constructor() {
        owner = msg.sender;
        addCandidate("Alice");
        addCandidate("Bob");
        addCandidate("Charlie");
    }

    // Register a new candidate (hardcoded, owner can add more)
    function addCandidate(string memory _name) internal {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    // Vote for a candidate
    function vote(uint _candidateId) public {
        require(!voted[msg.sender], "You have already voted");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate");
        require(candidates[_candidateId].voteCount < maxVotes, "Candidate has reached max votes");

        // Mark the sender as having voted
        voted[msg.sender] = true;

        // Increment the vote count for the chosen candidate
        candidates[_candidateId].voteCount++;
        totalVotes++;
    }

    // Get the details of a candidate
    function getCandidate(uint _candidateId) public view returns (string memory, uint) {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate");
        Candidate memory c = candidates[_candidateId];
        return (c.name, c.voteCount);
    }

    // Get the total number of votes
    function getTotalVotes() public view returns (uint) {
        return totalVotes;
    }
}
