import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import votingContractData from './Voting.json'; // Import your contract ABI
import './MetaMaskComponent.css'; // Import the CSS file for styling

const MetaMaskComponent = () => {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState('');
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [candidateVotes, setCandidateVotes] = useState([]);
  const [candidatesCount, setCandidatesCount] = useState(0);

  // Contract details
  const contractAddress = votingContractData.address; // Use the address from Voting.json
  const abi = votingContractData.abi;

  const SEPOLIA_CHAIN_ID = '0xaa36a7'; // Sepolia testnet chainId

  // Check if MetaMask is available
  const checkMetaMask = () => {
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask is installed!');
    } else {
      setError('Please install MetaMask!');
    }
  };

  // Check network
  const checkNetwork = async () => {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });

    if (chainId !== SEPOLIA_CHAIN_ID) {
      setError('Please switch to the Sepolia test network in MetaMask.');
    } else {
      setError('');
    }
  };

  // Get wallet address from MetaMask
  const getWalletAddress = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        // Get the wallet address
        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);
        console.log('Wallet Address:', accounts[0]);

        // Initialize the contract
        const contractInstance = new web3Instance.eth.Contract(abi, contractAddress);
        setContract(contractInstance);

        // Fetch candidates count
        const count = await contractInstance.methods.candidatesCount().call();
        setCandidatesCount(count);
        console.log('Candidates Count:', count);
      } catch (error) {
        setError('User denied account access or an error occurred.');
        console.error('Error while getting wallet or initializing contract:', error);
      }
    }
  };

  // Fetch candidates votes
  const getCandidateVotes = async () => {
    if (!contract || candidatesCount === 0) return;

    console.log("Fetching votes for candidates...");
    const votes = [];
    for (let i = 1; i <= candidatesCount; i++) {
      try {
        const result = await contract.methods.getCandidate(i).call();
        console.log(`Candidate ${i}:`, result); // Log each candidate's result
        votes.push({ id: i, name: result[0], voteCount: result[1] });
      } catch (error) {
        console.error('Error fetching candidate:', error);
      }
    }
    setCandidateVotes(votes);
  };

  // Vote for a candidate
  const voteForCandidate = async (candidateId) => {
    if (!contract || !account) {
      setError('Please connect to MetaMask and select a wallet.');
      return;
    }

    try {
      await contract.methods.vote(candidateId).send({ from: account });
      console.log(`Voted for candidate ${candidateId}`);

      // After voting, update the vote count
      getCandidateVotes();
    } catch (error) {
      console.error('Error casting vote:', error);
      setError('Error casting vote. Please try again.');
    }
  };

  // Fetch candidate votes dynamically based on candidatesCount
  useEffect(() => {
    if (contract && candidatesCount > 0) {
      getCandidateVotes();
    }
  }, [contract, candidatesCount]);

  // Check network on mount
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      checkNetwork();
    }
  }, []);

  return (
    <div className="voting-container">
      <h1 className="title">Decentralised Voting System</h1>
      <div className="meta-mask-buttons">
        <button className="check-button" onClick={checkMetaMask}>Check MetaMask</button>
        <button className="wallet-button" onClick={getWalletAddress}>Get Wallet Address</button>
      </div>

      {account && <p className="account-info">Wallet Address: {account}</p>}
      {error && <p className="error-message">{error}</p>}

      <h2 className="candidates-title">Candidates</h2>
      {candidateVotes.length > 0 ? (
        <div className="candidates-list">
          {candidateVotes.map((candidate, index) => (
            <div className="candidate-card" key={index}>
              <p className="candidate-name">{candidate.name}</p>
              <p className="vote-count">{candidate.voteCount} votes</p>
              <button className="vote-button" onClick={() => voteForCandidate(candidate.id)}>Vote</button>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-candidates">No candidates found.</p>
      )}
    </div>
  );
};

export default MetaMaskComponent;
