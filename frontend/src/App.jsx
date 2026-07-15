import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Shield, Activity, Award, RefreshCw, Zap } from 'lucide-react';
import './index.css';

// Deployed Addresses
const SCORE_CONTRACT_ADDRESS = "0x5320d14E4a86deF51723A806A38947498Ea09261";
const AGENT_CONTRACT_ADDRESS = "0x409F997461874371233154402cd106e3c3d37184";
const RITUAL_RPC = "https://rpc.ritualfoundation.org";
const CHAIN_ID = 1979;

// Minimal ABIs
const scoreAbi = [
  "function creditScores(address) view returns (uint256)",
  "function soulboundCertificates(address) view returns (uint256)",
  "event ScoreUpdated(address indexed user, uint256 oldScore, uint256 newScore)",
  "event CertificateMinted(address indexed user, uint256 tokenId)"
];

const agentAbi = [
  "function calculateScore(address user)",
  "function mockMode() view returns (bool)"
];

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState("");
  const [score, setScore] = useState(null);
  const [hasCert, setHasCert] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isMockMode, setIsMockMode] = useState(true);

  // Initialize read-only provider for public RPC
  useEffect(() => {
    const initPublicData = async () => {
      try {
        const publicProvider = new ethers.JsonRpcProvider(RITUAL_RPC);
        setProvider(publicProvider);
        
        // Fetch Agent Mock Mode state
        const agentContract = new ethers.Contract(AGENT_CONTRACT_ADDRESS, agentAbi, publicProvider);
        const mode = await agentContract.mockMode();
        setIsMockMode(mode);
      } catch (err) {
        console.error("Failed to connect to public RPC:", err);
      }
    };
    initPublicData();
  }, []);

  // Fetch user data when account changes
  useEffect(() => {
    if (account && provider) {
      fetchUserData(account, provider);
    }
  }, [account, provider]);

  const fetchUserData = async (userAddress, currentProvider) => {
    try {
      const scoreContract = new ethers.Contract(SCORE_CONTRACT_ADDRESS, scoreAbi, currentProvider);
      
      const currentScore = await scoreContract.creditScores(userAddress);
      setScore(currentScore > 0 ? currentScore.toString() : "N/A");
      
      const certId = await scoreContract.soulboundCertificates(userAddress);
      setHasCert(certId > 0);
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        await browserProvider.send("eth_requestAccounts", []);
        const signer = await browserProvider.getSigner();
        const address = await signer.getAddress();
        
        // Ensure connected to Ritual Testnet
        const network = await browserProvider.getNetwork();
        if (Number(network.chainId) !== CHAIN_ID) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: ethers.toBeHex(CHAIN_ID) }],
            });
          } catch (switchError) {
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: ethers.toBeHex(CHAIN_ID),
                  chainName: 'Ritual Testnet',
                  rpcUrls: [RITUAL_RPC],
                  nativeCurrency: { name: 'Ritual', symbol: 'RITUAL', decimals: 18 }
                }]
              });
            }
          }
        }
        
        setProvider(browserProvider);
        setAccount(address);
      } catch (err) {
        console.error("Wallet connection failed:", err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const calculateScore = async () => {
    if (!account || !provider) return;
    try {
      setIsCalculating(true);
      const signer = await provider.getSigner();
      const agentContract = new ethers.Contract(AGENT_CONTRACT_ADDRESS, agentAbi, signer);
      
      const tx = await agentContract.calculateScore(account);
      await tx.wait();
      
      // Refresh data after calculation
      await fetchUserData(account, provider);
    } catch (err) {
      console.error("Score calculation failed:", err);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="App">
      <header>
        <h1>RitualPrivScore</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>
          TEE-Powered Private Credit Scoring Agent on Ritual Testnet
        </p>
      </header>

      <main>
        <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
          
          <div className={`status-badge ${account ? 'status-connected' : 'status-disconnected'}`}>
            {account ? `Connected: ${account.substring(0, 6)}...${account.substring(38)}` : 'Wallet Disconnected'}
          </div>

          {!account ? (
            <div style={{ padding: '2rem 0' }}>
              <button onClick={connectWallet} style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
                Connect MetaMask
              </button>
            </div>
          ) : (
            <>
              <div style={{ padding: '2rem 0' }}>
                <div style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)' }}>Your Private Credit Score</div>
                <div className="score-display">
                  {isCalculating ? (
                    <RefreshCw className="lucide-spin" size={64} style={{ animation: 'spin 2s linear infinite' }} />
                  ) : (
                    score || "---"
                  )}
                </div>
                
                <button 
                  onClick={calculateScore} 
                  disabled={isCalculating}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
                >
                  <Zap size={18} />
                  {isCalculating ? "Calculating via TEE..." : "Calculate Score"}
                </button>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={16} /> Privacy Mode
                  </div>
                  <div className="info-value" style={{ color: isMockMode ? '#f59e0b' : '#10b981' }}>
                    {isMockMode ? "Mock Bypass Active" : "TEE Enclave Active"}
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Award size={16} /> Certificate
                  </div>
                  <div className="info-value" style={{ color: hasCert ? '#3b82f6' : 'rgba(255,255,255,0.5)' }}>
                    {hasCert ? "Soulbound Minted" : "Not Eligible Yet"}
                  </div>
                </div>
              </div>
            </>
          )}

        </div>

        <div style={{ marginTop: '3rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
          <p>Powered by Ritual Network • Smart Contracts on Chain 1979</p>
        </div>
      </main>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default App;
