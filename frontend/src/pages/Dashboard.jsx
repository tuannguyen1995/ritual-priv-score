import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { Shield, Activity, Award, Database, Cpu, CheckCircle, Wallet, Code, Globe, Zap, RefreshCw, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

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

// Mock Users for Demo
const DEMO_USERS = [
  { 
    name: "Demo User A (High Rep)", 
    address: "0x1111111111111111111111111111111111111111", 
    mockData: { age: "4.5 Years", commits: "3,450", social: "Excellent", tx: "120.5 ETH", expectedScore: 820 } 
  },
  { 
    name: "Demo User B (Average)", 
    address: "0x2222222222222222222222222222222222222222", 
    mockData: { age: "1.2 Years", commits: "120", social: "Neutral", tx: "5.2 ETH", expectedScore: 610 } 
  },
  { 
    name: "Demo User C (Newbie)", 
    address: "0x3333333333333333333333333333333333333333", 
    mockData: { age: "0.1 Years", commits: "0", social: "None", tx: "0.1 ETH", expectedScore: 400 } 
  }
];

const Dashboard = () => {
  const [provider, setProvider] = useState(null);
  const [publicProvider, setPublicProvider] = useState(null);
  const [account, setAccount] = useState("");
  
  const [score, setScore] = useState(0);
  const [hasCert, setHasCert] = useState(false);
  
  // TEE Process State
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcStep, setCalcStep] = useState(0); 
  
  const [isMockMode, setIsMockMode] = useState(true);
  const [displayedScore, setDisplayedScore] = useState(0);
  
  const [activeUser, setActiveUser] = useState(DEMO_USERS[0]);
  const [isViewingDemo, setIsViewingDemo] = useState(true);

  // Init Public Read-Only Provider
  useEffect(() => {
    const init = async () => {
      try {
        const pProvider = new ethers.JsonRpcProvider(RITUAL_RPC);
        setPublicProvider(pProvider);
        const agentContract = new ethers.Contract(AGENT_CONTRACT_ADDRESS, agentAbi, pProvider);
        const mode = await agentContract.mockMode();
        setIsMockMode(mode);
        // Fetch initial demo data
        fetchUserData(DEMO_USERS[0].address, pProvider, DEMO_USERS[0]);
      } catch (err) {
        console.error("Public RPC Failed:", err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (score > 0) {
      let current = 0;
      const step = Math.ceil(score / 40);
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

  const fetchUserData = async (targetAddress, targetProvider, userProfile) => {
    try {
      const scoreContract = new ethers.Contract(SCORE_CONTRACT_ADDRESS, scoreAbi, targetProvider);
      
      let currentScore = await scoreContract.creditScores(targetAddress);
      
      // If demo user hasn't been scored on-chain yet, we simulate the public dashboard read
      if (currentScore == 0 && isViewingDemo) {
        currentScore = userProfile.expectedScore; 
      }
      
      setScore(Number(currentScore));
      
      const certId = await scoreContract.soulboundCertificates(targetAddress);
      // Mock cert status for demo visual if score >= 700
      setHasCert(certId > 0 || (isViewingDemo && currentScore >= 700));
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        await browserProvider.send("eth_requestAccounts", []);
        const signer = await browserProvider.getSigner();
        const address = await signer.getAddress();
        
        // Ensure network
        const network = await browserProvider.getNetwork();
        if (Number(network.chainId) !== CHAIN_ID) {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ethers.toBeHex(CHAIN_ID) }],
          });
        }
        
        setProvider(browserProvider);
        setAccount(address);
        setIsViewingDemo(false);
        setActiveUser({
          name: "Your Wallet",
          address: address,
          mockData: { age: "?", commits: "?", social: "?", tx: "?" } // Will be evaluated by TEE
        });
        
        // Fetch actual chain data for this wallet
        fetchUserData(address, browserProvider, null);
      } catch (err) {}
    } else {
      alert("Please install MetaMask!");
    }
  };

  const calculateScoreFlow = async () => {
    if (!account || !provider || isViewingDemo) return;
    try {
      setIsCalculating(true);
      setScore(0); 
      setCalcStep(1); 
      
      const signer = await provider.getSigner();
      const agentContract = new ethers.Contract(AGENT_CONTRACT_ADDRESS, agentAbi, signer);
      
      setTimeout(() => setCalcStep(2), 2000); 
      
      const tx = await agentContract.calculateScore(account);
      
      setCalcStep(3); 
      await tx.wait();
      
      setCalcStep(4); 
      setTimeout(() => {
        setIsCalculating(false);
        setCalcStep(0);
        fetchUserData(account, provider, null);
        // Simulate data fetch populating
        setActiveUser(prev => ({
          ...prev,
          mockData: { age: "1.5 Years", commits: "500", social: "Good", tx: "10 ETH" }
        }));
      }, 1000);
      
    } catch (err) {
      console.error(err);
      setIsCalculating(false);
      setCalcStep(0);
    }
  };

  const selectDemoUser = (user) => {
    setIsViewingDemo(true);
    setActiveUser(user);
    setAccount(""); // Disconnect UI state to show read-only
    setScore(0);
    if (publicProvider) {
      fetchUserData(user.address, publicProvider, user);
    }
  };

  const circumference = 2 * Math.PI * 110;
  const strokeDashoffset = circumference - (displayedScore / 850) * circumference;

  return (
    <>
      <header style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield color="var(--neon-purple)" size={28} />
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>RitualPrivScore</span>
        </Link>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          {isViewingDemo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--neon-blue)', background: 'rgba(0,184,255,0.1)', padding: '0.5rem 1rem', borderRadius: '12px' }}>
              <Users size={16} /> Public Read-Only Mode
            </div>
          )}
          <button 
            onClick={connectWallet}
            style={{ 
              borderColor: account ? 'var(--neon-green)' : 'var(--border-color)',
              color: account ? 'var(--neon-green)' : 'inherit'
            }}
          >
            <Wallet size={18} />
            {account ? `${account.substring(0, 6)}...${account.substring(38)}` : 'Connect Wallet to Compute'}
          </button>
        </div>
      </header>

      {/* Random Demo Selector */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ alignSelf: 'center', color: 'var(--text-secondary)', marginRight: '1rem' }}>Mock Users:</div>
        {DEMO_USERS.map((user, idx) => (
          <button 
            key={idx}
            onClick={() => selectDemoUser(user)}
            style={{ 
              background: activeUser.address === user.address ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderColor: activeUser.address === user.address ? 'var(--text-primary)' : 'var(--border-color)'
            }}
          >
            {user.name}
          </button>
        ))}
      </div>

      <motion.div 
        className="dashboard-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Left Column: Data Inputs */}
        <div className="glass-panel">
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={20} color="var(--neon-blue)"/> Target Profile
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Address: <span style={{ fontFamily: 'monospace' }}>{activeUser.address.substring(0,8)}...</span>
          </p>
          
          <div className="data-row">
            <span className="data-label"><Wallet size={14} style={{display:'inline', marginRight:'4px'}}/> Wallet Age</span>
            <span className="data-value">{activeUser.mockData.age}</span>
          </div>
          <div className="data-row">
            <span className="data-label"><Code size={14} style={{display:'inline', marginRight:'4px'}}/> Commits (1Y)</span>
            <span className="data-value value-highlight">{activeUser.mockData.commits}</span>
          </div>
          <div className="data-row">
            <span className="data-label"><Globe size={14} style={{display:'inline', marginRight:'4px'}}/> Social Rep</span>
            <span className="data-value value-highlight">{activeUser.mockData.social}</span>
          </div>
          <div className="data-row">
            <span className="data-label"><Activity size={14} style={{display:'inline', marginRight:'4px'}}/> Tx Volume</span>
            <span className="data-value">{activeUser.mockData.tx}</span>
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
            disabled={!account || isCalculating || isViewingDemo}
          >
            {isCalculating ? <RefreshCw className="lucide-spin" /> : <Zap />}
            {isViewingDemo ? 'Connect to Compute' : (isCalculating ? 'Computing in Enclave...' : 'Calculate My Private Score')}
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
};

export default Dashboard;
