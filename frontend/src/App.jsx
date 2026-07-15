import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Activity, Award, Database, Cpu, CheckCircle, Wallet, Code, Globe, Zap, RefreshCw } from 'lucide-react';
import './index.css';

const SCORE_CONTRACT_ADDRESS = "0x5320d14E4a86deF51723A806A38947498Ea09261";
const AGENT_CONTRACT_ADDRESS = "0x409F997461874371233154402cd106e3c3d37184";
const RITUAL_RPC = "https://rpc.ritualfoundation.org";
const CHAIN_ID = 1979;

const scoreAbi = [
  "function creditScores(address) view returns (uint256)",
  "function soulboundCertificates(address) view returns (uint256)"
];
const agentAbi = [
  "function calculateScore(address user)",
  "function mockMode() view returns (bool)"
];

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState("");
  const [score, setScore] = useState(0);
  const [hasCert, setHasCert] = useState(false);
  
  // TEE Process State
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcStep, setCalcStep] = useState(0); // 0: Idle, 1: Fetching, 2: LLM, 3: Minting, 4: Done
  
  const [isMockMode, setIsMockMode] = useState(true);
  const [displayedScore, setDisplayedScore] = useState(0);

  useEffect(() => {
    const initPublicData = async () => {
      try {
        const publicProvider = new ethers.JsonRpcProvider(RITUAL_RPC);
        setProvider(publicProvider);
        const agentContract = new ethers.Contract(AGENT_CONTRACT_ADDRESS, agentAbi, publicProvider);
        const mode = await agentContract.mockMode();
        setIsMockMode(mode);
      } catch (err) {
        console.error("Failed to connect to RPC:", err);
      }
    };
    initPublicData();
  }, []);

  useEffect(() => {
    if (account && provider && !isCalculating) {
      fetchUserData(account, provider);
    }
  }, [account, provider, isCalculating]);

  // Animate score counter
  useEffect(() => {
    if (score > 0) {
      let current = 0;
      const step = Math.ceil(score / 50);
      const timer = setInterval(() => {
        current += step;
        if (current >= score) {
          setDisplayedScore(score);
          clearInterval(timer);
        } else {
          setDisplayedScore(current);
        }
      }, 30);
      return () => clearInterval(timer);
    } else {
      setDisplayedScore(0);
    }
  }, [score]);

  const fetchUserData = async (userAddress, currentProvider) => {
    try {
      const scoreContract = new ethers.Contract(SCORE_CONTRACT_ADDRESS, scoreAbi, currentProvider);
      const currentScore = await scoreContract.creditScores(userAddress);
      setScore(Number(currentScore));
      
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
      } catch (err) {}
    } else {
      alert("Please install MetaMask!");
    }
  };

  const calculateScoreFlow = async () => {
    if (!account || !provider) return;
    try {
      setIsCalculating(true);
      setScore(0); // Reset for animation
      setCalcStep(1); // Fetching Data
      
      const signer = await provider.getSigner();
      const agentContract = new ethers.Contract(AGENT_CONTRACT_ADDRESS, agentAbi, signer);
      
      // We simulate the TEE steps visually before tx confirmation for UX
      setTimeout(() => setCalcStep(2), 2000); // LLM Evaluation
      
      const tx = await agentContract.calculateScore(account);
      
      setCalcStep(3); // Minting on-chain
      await tx.wait();
      
      setCalcStep(4); // Done
      setTimeout(() => {
        setIsCalculating(false);
        setCalcStep(0);
      }, 1000);
      
    } catch (err) {
      console.error(err);
      setIsCalculating(false);
      setCalcStep(0);
    }
  };

  const circumference = 2 * Math.PI * 110;
  const strokeDashoffset = circumference - (displayedScore / 850) * circumference;

  return (
    <>
      <div className="bg-grid"></div>
      
      <header>
        <motion.div 
          className="logo-text"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Shield color="var(--neon-purple)" size={28} /> RitualPrivScore
        </motion.div>
        
        <motion.button 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={connectWallet}
          style={{ 
            borderColor: account ? 'var(--neon-green)' : 'var(--border-color)',
            color: account ? 'var(--neon-green)' : 'inherit'
          }}
        >
          <Wallet size={18} />
          {account ? `${account.substring(0, 6)}...${account.substring(38)}` : 'Connect Wallet'}
        </motion.button>
      </header>

      <motion.div 
        className="dashboard-grid"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        
        {/* Left Column: Data Inputs */}
        <div className="glass-panel">
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={20} color="var(--neon-blue)"/> Off-chain Identity
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Mock data securely fed into the TEE via HTTP Precompile.
          </p>
          
          <div className="data-row">
            <span className="data-label"><Wallet size={14} style={{display:'inline', marginRight:'4px'}}/> Wallet Age</span>
            <span className="data-value">2.4 Years</span>
          </div>
          <div className="data-row">
            <span className="data-label"><Code size={14} style={{display:'inline', marginRight:'4px'}}/> Commits (1Y)</span>
            <span className="data-value value-highlight">1,204</span>
          </div>
          <div className="data-row">
            <span className="data-label"><Globe size={14} style={{display:'inline', marginRight:'4px'}}/> Social Rep</span>
            <span className="data-value value-highlight">Good</span>
          </div>
          <div className="data-row">
            <span className="data-label"><Activity size={14} style={{display:'inline', marginRight:'4px'}}/> Tx Volume</span>
            <span className="data-value">45.2 ETH</span>
          </div>
        </div>

        {/* Center Column: The Score */}
        <div className="glass-panel" style={{ textAlign: 'center', position: 'relative', padding: '3rem 2rem' }}>
          
          <div className="circular-score">
            <svg width="250" height="250" viewBox="0 0 250 250" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="125" cy="125" r="110" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
              <motion.circle 
                cx="125" cy="125" r="110" fill="none" 
                stroke="url(#gradient)" 
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset: isCalculating ? circumference : strokeDashoffset }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--neon-green)" />
                  <stop offset="100%" stopColor="var(--neon-blue)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="score-text">
              <div className="score-number">{displayedScore}</div>
              <div className="score-label">PrivScore</div>
            </div>
          </div>

          <button 
            className="primary" 
            style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}
            onClick={calculateScoreFlow}
            disabled={!account || isCalculating}
          >
            {isCalculating ? <RefreshCw className="lucide-spin" /> : <Zap />}
            {isCalculating ? 'Computing in Enclave...' : 'Calculate Private Score'}
          </button>
        </div>

        {/* Right Column: TEE Process */}
        <div className="glass-panel">
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={20} color="var(--neon-purple)"/> TEE Verification
          </h3>
          
          <div style={{ marginTop: '2rem' }}>
            <div className={`step-item ${(calcStep >= 1 || score > 0) ? 'active' : ''} ${calcStep > 1 || score > 0 ? 'completed' : ''}`}>
              <div className="step-icon"><Database size={16} /></div>
              <div>
                <div style={{ fontWeight: 600 }}>1. Fetch Data</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Via HTTP Precompile</div>
              </div>
            </div>
            
            <div className={`step-item ${(calcStep >= 2 || score > 0) ? 'active' : ''} ${calcStep > 2 || score > 0 ? 'completed' : ''}`}>
              <div className="step-icon"><Cpu size={16} /></div>
              <div>
                <div style={{ fontWeight: 600 }}>2. Evaluation</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ritual LLM in Enclave</div>
              </div>
            </div>

            <div className={`step-item ${(calcStep >= 3 || score > 0) ? 'active' : ''} ${calcStep > 3 || score > 0 ? 'completed' : ''}`}>
              <div className="step-icon"><Award size={16} /></div>
              <div>
                <div style={{ fontWeight: 600 }}>3. Certificate</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mint Soulbound NFT</div>
              </div>
            </div>
          </div>

          {hasCert && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ 
                marginTop: '2rem', padding: '1rem', 
                background: 'rgba(0,255,163,0.1)', border: '1px solid var(--neon-green)',
                borderRadius: '12px', display: 'flex', gap: '0.5rem', alignItems: 'center'
              }}
            >
              <CheckCircle color="var(--neon-green)" />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--neon-green)' }}>Verified Certificate</div>
                <div style={{ fontSize: '0.8rem' }}>ERC-721 Soulbound Minted</div>
              </div>
            </motion.div>
          )}

        </div>

      </motion.div>
      
      <style>{`
        .lucide-spin { animation: spin 2s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

export default App;
