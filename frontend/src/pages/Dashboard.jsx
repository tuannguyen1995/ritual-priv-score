import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { Shield, Activity, Award, Database, Cpu, CheckCircle, Wallet, Code, Globe, Zap, RefreshCw, Users, LogOut, TerminalSquare } from 'lucide-react';
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

const DEMO_USERS = [
  { 
    name: "Demo User A (High Rep)", 
    address: "0x1111111111111111111111111111111111111111", 
    mockData: { age: "4.5 Years", commits: "3,450", social: "Excellent", tx: "120.5 ETH", expectedScore: 820 },
    aiAnalysis: "LLM Analysis: Strong on-chain history with significant Tx volume. Consistent github activity indicates high developer reputation. Low risk profile."
  },
  { 
    name: "Demo User B (Average)", 
    address: "0x2222222222222222222222222222222222222222", 
    mockData: { age: "1.2 Years", commits: "120", social: "Neutral", tx: "5.2 ETH", expectedScore: 610 },
    aiAnalysis: "LLM Analysis: Moderate activity. Wallet is relatively young. Social reputation is neutral. Acceptable risk but lacks long-term track record."
  },
  { 
    name: "Demo User C (Newbie)", 
    address: "0x3333333333333333333333333333333333333333", 
    mockData: { age: "0.1 Years", commits: "0", social: "None", tx: "0.1 ETH", expectedScore: 400 },
    aiAnalysis: "LLM Analysis: Sybil risk detected. Minimal on-chain footprint. No verifiable off-chain developer or social activity. High risk profile."
  }
];

const Dashboard = () => {
  const [provider, setProvider] = useState(null);
  const [publicProvider, setPublicProvider] = useState(null);
  const [account, setAccount] = useState("");
  
  const [score, setScore] = useState(0);
  const [hasCert, setHasCert] = useState(false);
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcStep, setCalcStep] = useState(0); 
  
  const [isMockMode, setIsMockMode] = useState(true);
  const [displayedScore, setDisplayedScore] = useState(0);
  
  const [activeUser, setActiveUser] = useState(DEMO_USERS[0]);
  const [isViewingDemo, setIsViewingDemo] = useState(true);

  // AI Typing Effect State
  const [displayedAiText, setDisplayedAiText] = useState("");
  
  // Wallet Persistence
  useEffect(() => {
    const checkPersistedWallet = async () => {
      const savedAccount = localStorage.getItem("ritual_connected_account");
      if (savedAccount && window.ethereum) {
        try {
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await browserProvider.send("eth_accounts", []);
          if (accounts.length > 0 && accounts[0].toLowerCase() === savedAccount.toLowerCase()) {
            setProvider(browserProvider);
            setAccount(accounts[0]);
            switchToMyWallet(accounts[0], browserProvider);
          } else {
            localStorage.removeItem("ritual_connected_account");
          }
        } catch (err) {
          console.error("Failed to restore wallet session");
        }
      }
    };
    checkPersistedWallet();
  }, []);

  // Init Public Read-Only Provider
  useEffect(() => {
    const init = async () => {
      try {
        const pProvider = new ethers.JsonRpcProvider(RITUAL_RPC);
        setPublicProvider(pProvider);
        const agentContract = new ethers.Contract(AGENT_CONTRACT_ADDRESS, agentAbi, pProvider);
        const mode = await agentContract.mockMode();
        setIsMockMode(mode);
        
        // If not already viewing personal wallet from persistence
        if (isViewingDemo) {
          fetchUserData(DEMO_USERS[0].address, pProvider, DEMO_USERS[0]);
        }
      } catch (err) {
        console.error("Public RPC Failed:", err);
      }
    };
    init();
  }, [isViewingDemo]);

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

  // AI Text Typing Effect
  useEffect(() => {
    if (activeUser.aiAnalysis && score > 0) {
      let i = 0;
      setDisplayedAiText("");
      const typingTimer = setInterval(() => {
        setDisplayedAiText(prev => prev + activeUser.aiAnalysis.charAt(i));
        i++;
        if (i >= activeUser.aiAnalysis.length) clearInterval(typingTimer);
      }, 20);
      return () => clearInterval(typingTimer);
    } else {
      setDisplayedAiText("");
    }
  }, [activeUser, score]);

  const fetchUserData = async (targetAddress, targetProvider, userProfile) => {
    try {
      const scoreContract = new ethers.Contract(SCORE_CONTRACT_ADDRESS, scoreAbi, targetProvider);
      let currentScore = await scoreContract.creditScores(targetAddress);
      
      if (currentScore == 0 && isViewingDemo && userProfile) {
        currentScore = userProfile.expectedScore; 
      }
      
      setScore(Number(currentScore));
      
      const certId = await scoreContract.soulboundCertificates(targetAddress);
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
        
        const network = await browserProvider.getNetwork();
        if (Number(network.chainId) !== CHAIN_ID) {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ethers.toBeHex(CHAIN_ID) }],
          });
        }
        
        localStorage.setItem("ritual_connected_account", address);
        setProvider(browserProvider);
        setAccount(address);
        switchToMyWallet(address, browserProvider);
      } catch (err) {}
    } else {
      alert("Please install MetaMask!");
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem("ritual_connected_account");
    setAccount("");
    setProvider(null);
    selectDemoUser(DEMO_USERS[0]);
  };

  const switchToMyWallet = (address, browserProvider) => {
    setIsViewingDemo(false);
    setActiveUser({
      name: "Your Wallet",
      address: address,
      mockData: { age: "?", commits: "?", social: "?", tx: "?" },
      aiAnalysis: ""
    });
    fetchUserData(address, browserProvider, null);
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
        
        // Populate actual mock result
        const analysisStr = "LLM Analysis: Verified human identity. Healthy on-chain interaction with DeFi protocols. Github history indicates active developer. Excellent risk profile.";
        setActiveUser(prev => ({
          ...prev,
          mockData: { age: "2.1 Years", commits: "840", social: "Good", tx: "34 ETH" },
          aiAnalysis: analysisStr
        }));
        
        fetchUserData(account, provider, null);
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
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {isViewingDemo ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--neon-blue)', background: 'rgba(0,184,255,0.1)', padding: '0.5rem 1rem', borderRadius: '12px' }}>
              <Users size={16} /> Public Read-Only Mode
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--neon-green)', background: 'rgba(0,255,163,0.1)', padding: '0.5rem 1rem', borderRadius: '12px' }}>
              <Wallet size={16} /> My Wallet Connected
            </div>
          )}
          
          {!account ? (
            <button onClick={connectWallet} className="primary">
              <Wallet size={18} /> Connect Wallet
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {isViewingDemo && (
                 <button onClick={() => switchToMyWallet(account, provider)} style={{ borderColor: 'var(--neon-green)', color: 'var(--neon-green)' }}>
                   View My Score
                 </button>
              )}
              <button onClick={disconnectWallet} className="danger">
                <LogOut size={18} /> Disconnect ({account.substring(0, 4)}...{account.substring(38)})
              </button>
            </div>
          )}
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
              background: (activeUser.address === user.address && isViewingDemo) ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderColor: (activeUser.address === user.address && isViewingDemo) ? 'var(--text-primary)' : 'var(--border-color)'
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
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={20} color="var(--neon-blue)"/> Target Profile
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Address: <span style={{ fontFamily: 'monospace' }}>{activeUser.address.substring(0,10)}...</span>
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

          {/* AI LLM Inference Insights */}
          <div style={{ flex: 1, marginTop: '2rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0' }}>
              <TerminalSquare size={16} color="var(--neon-purple)" /> TEE LLM Inference
            </h4>
            <div className="ai-insights">
              {displayedAiText}
              {(score > 0 && activeUser.aiAnalysis) && <span className="ai-cursor"></span>}
              {(score === 0 || !activeUser.aiAnalysis) && <span style={{opacity: 0.5}}>Waiting for computation...</span>}
            </div>
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
            {isViewingDemo ? 'Connect Wallet to Compute' : (isCalculating ? 'Computing in Enclave...' : 'Calculate My Private Score')}
          </button>
        </div>

        {/* Right Column: TEE Process */}
        <div className="glass-panel">
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={20} color="var(--neon-purple)"/> Verification Steps
          </h3>
          
          <div style={{ marginTop: '2rem' }}>
            <div className={`step-item ${(calcStep >= 1 || score > 0) ? 'active' : ''} ${calcStep > 1 || score > 0 ? 'completed' : ''}`}>
              <div className="step-icon"><Database size={16} /></div>
              <div>
                <div style={{ fontWeight: 600 }}>1. Fetch Private Data</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Via Ritual HTTP Precompile</div>
              </div>
            </div>
            
            <div className={`step-item ${(calcStep >= 2 || score > 0) ? 'active' : ''} ${calcStep > 2 || score > 0 ? 'completed' : ''}`}>
              <div className="step-icon"><Cpu size={16} /></div>
              <div>
                <div style={{ fontWeight: 600 }}>2. LLM Evaluation</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Run model inside Enclave</div>
              </div>
            </div>

            <div className={`step-item ${(calcStep >= 3 || score > 0) ? 'active' : ''} ${calcStep > 3 || score > 0 ? 'completed' : ''}`}>
              <div className="step-icon"><Award size={16} /></div>
              <div>
                <div style={{ fontWeight: 600 }}>3. Attestation & Mint</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Generate ERC-721 Certificate</div>
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

      {/* TEE Node Status Badge */}
      <div className="tee-status">
        <div className={`status-dot ${isCalculating ? 'computing' : ''}`}></div>
        <div>
          <div style={{ fontWeight: 'bold', color: isCalculating ? 'var(--neon-purple)' : 'var(--neon-green)' }}>
            {isCalculating ? 'ENCLAVE COMPUTING' : 'ENCLAVE SECURE'}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Ritual Testnet • ID 1979</div>
        </div>
      </div>
      
      <style>{`
        .lucide-spin { animation: spin 2s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default Dashboard;
