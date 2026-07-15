import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { Shield, Activity, Award, Database, Cpu, CheckCircle, Wallet, Code, Globe, Zap, RefreshCw, Users, LogOut, TerminalSquare, Home, BarChart2, Search, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

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

const TRENDING_PROFILES = [
  { 
    name: "vitalik.eth", 
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", 
    mockData: { age: "8.2 Years", commits: "12,450", social: "Legendary", tx: "15,230 ETH", expectedScore: 950 },
    metrics: { onChain: 99, social: 99, financial: 98 },
    aiAnalysis: "LLM Analysis: Verified Ethereum co-founder. Massive on-chain footprint. Exceptional social reputation and developer activity. Risk profile: Zero."
  },
  { 
    name: "0xDefiWhale", 
    address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", 
    mockData: { age: "4.5 Years", commits: "340", social: "High", tx: "3,420 ETH", expectedScore: 820 },
    metrics: { onChain: 95, social: 70, financial: 90 },
    aiAnalysis: "LLM Analysis: High volume DeFi power user. Consistent liquidity provider. Moderate developer activity. Risk profile: Very Low."
  },
  { 
    name: "0xAirdropHunter", 
    address: "0x1111111111111111111111111111111111111111", 
    mockData: { age: "0.5 Years", commits: "12", social: "Low", tx: "2.1 ETH", expectedScore: 510 },
    metrics: { onChain: 45, social: 20, financial: 30 },
    aiAnalysis: "LLM Analysis: High frequency of low-value transactions across multiple chains. Typical sybil pattern detected. Risk profile: High."
  }
];

const LEADERBOARD_DATA = [
  { address: "vitalik.eth", score: 950, rank: "S", time: "2 mins ago" },
  { address: "0x7a2...3f1c", score: 890, rank: "S", time: "1 hour ago" },
  { address: "0x111...1111", score: 820, rank: "A", time: "3 hours ago" },
  { address: "0x9b4...2e8a", score: 715, rank: "A", time: "5 hours ago" },
  { address: "0x333...3333", score: 400, rank: "C", time: "1 day ago" },
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
  
  const [activeUser, setActiveUser] = useState(TRENDING_PROFILES[0]);
  const [isViewingDemo, setIsViewingDemo] = useState(true);

  const [displayedAiText, setDisplayedAiText] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
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

  useEffect(() => {
    const init = async () => {
      try {
        const pProvider = new ethers.JsonRpcProvider(RITUAL_RPC);
        setPublicProvider(pProvider);
        const agentContract = new ethers.Contract(AGENT_CONTRACT_ADDRESS, agentAbi, pProvider);
        const mode = await agentContract.mockMode();
        setIsMockMode(mode);
        
        if (isViewingDemo) {
          fetchUserData(TRENDING_PROFILES[0].address, pProvider, TRENDING_PROFILES[0]);
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
    selectTrendingProfile(TRENDING_PROFILES[0]);
  };

  const switchToMyWallet = (address, browserProvider) => {
    setIsViewingDemo(false);
    setActiveUser({
      name: "Your Wallet",
      address: address,
      mockData: { age: "?", commits: "?", social: "?", tx: "?" },
      metrics: { onChain: 0, social: 0, financial: 0 },
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
        
        const analysisStr = "LLM Analysis: Verified human identity. Healthy on-chain interaction with DeFi protocols. Github history indicates active developer. Excellent risk profile.";
        setActiveUser(prev => ({
          ...prev,
          mockData: { age: "2.1 Years", commits: "840", social: "Good", tx: "34 ETH" },
          metrics: { onChain: 88, social: 75, financial: 85 },
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

  const selectTrendingProfile = (user) => {
    setSearchInput(user.name);
    handleSearch(user);
  };

  const handleSearch = (predefinedUser = null) => {
    if (!searchInput && !predefinedUser) return;
    
    setIsViewingDemo(true);
    setIsSearching(true);
    setScore(0);
    setCalcStep(1);
    
    // Simulate TEE loading process
    setTimeout(() => setCalcStep(2), 800);
    setTimeout(() => setCalcStep(3), 1600);
    
    setTimeout(() => {
      let targetUser = predefinedUser;
      
      // If user typed a random address, generate a random profile
      if (!targetUser) {
        targetUser = {
          name: searchInput.length > 20 ? "Searched Wallet" : searchInput,
          address: searchInput.length > 20 ? searchInput : "0x" + Math.random().toString(16).substr(2, 40),
          mockData: { 
            age: (Math.random() * 5 + 0.1).toFixed(1) + " Years", 
            commits: Math.floor(Math.random() * 500).toString(), 
            social: ["Low", "Neutral", "Good"][Math.floor(Math.random() * 3)], 
            tx: (Math.random() * 100).toFixed(1) + " ETH", 
            expectedScore: Math.floor(Math.random() * 400 + 400) 
          },
          metrics: { 
            onChain: Math.floor(Math.random() * 100), 
            social: Math.floor(Math.random() * 100), 
            financial: Math.floor(Math.random() * 100) 
          },
          aiAnalysis: "LLM Analysis: Wallet data fetched and analyzed via Enclave. Behavior appears normal with mixed signals on social presence."
        };
      }
      
      setActiveUser(targetUser);
      setIsSearching(false);
      setCalcStep(4);
      
      if (publicProvider) {
        fetchUserData(targetUser.address, publicProvider, targetUser);
      } else {
        setScore(targetUser.expectedScore);
      }
      
      setTimeout(() => setCalcStep(0), 1000);
      
    }, 2400);
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
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: 'auto' }}>
          <Link to="/">
            <button style={{ padding: '0.5rem 1rem' }}>
              <Home size={16} /> Home
            </button>
          </Link>
          {isViewingDemo ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--neon-blue)', background: 'rgba(0,184,255,0.1)', padding: '0.5rem 1rem', borderRadius: '12px' }}>
              <Search size={16} /> Explorer Mode
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

      {/* Explorer Search Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem' }}>
        <div className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Enter ETH Address, ENS, or Lens handle..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            className="primary" 
            style={{ padding: '0 2rem' }}
            onClick={() => handleSearch()}
            disabled={isSearching || !searchInput}
          >
            {isSearching ? <RefreshCw className="lucide-spin" size={20} /> : <Search size={20} />}
            {isSearching ? 'Scanning...' : 'Analyze'}
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={16} /> Trending Profiles:
          </span>
          {TRENDING_PROFILES.map((user, idx) => (
            <div 
              key={idx}
              className="trending-tag"
              onClick={() => selectTrendingProfile(user)}
              style={{
                borderColor: activeUser.name === user.name && !isSearching ? 'var(--neon-blue)' : 'var(--border-color)',
                color: activeUser.name === user.name && !isSearching ? 'var(--neon-blue)' : 'var(--text-secondary)'
              }}
            >
              #{user.name}
            </div>
          ))}
        </div>
      </div>

      <motion.div 
        style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'stretch' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Left Column: Metrics & Data */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Data Inputs */}
          <div className="glass-panel" style={{ flex: 1, position: 'relative' }}>
            {isSearching && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10, borderRadius: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <RefreshCw className="lucide-spin" size={32} color="var(--neon-purple)" />
              </div>
            )}
            
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <Database size={20} color="var(--neon-blue)"/> Wallet Analytics
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Address: <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{activeUser.address.substring(0,20)}...</span>
            </p>
            
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px', marginTop: '1rem' }}>
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

            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart2 size={16} /> Data Sources Breakdown
              </h4>
              
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span>On-chain Health</span>
                  <span style={{ color: 'var(--neon-green)' }}>{activeUser.metrics.onChain}%</span>
                </div>
                <div className="progress-container">
                  <div className="progress-fill" style={{ width: `${(score > 0) ? activeUser.metrics.onChain : 0}%`, background: 'var(--neon-green)' }}></div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span>Social Reputation</span>
                  <span style={{ color: 'var(--neon-blue)' }}>{activeUser.metrics.social}%</span>
                </div>
                <div className="progress-container">
                  <div className="progress-fill" style={{ width: `${(score > 0) ? activeUser.metrics.social : 0}%`, background: 'var(--neon-blue)' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span>Financial Capacity</span>
                  <span style={{ color: 'var(--neon-purple)' }}>{activeUser.metrics.financial}%</span>
                </div>
                <div className="progress-container">
                  <div className="progress-fill" style={{ width: `${(score > 0) ? activeUser.metrics.financial : 0}%`, background: 'var(--neon-purple)' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Score & AI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', flex: 1 }}>
            
            {/* Main Score Area */}
            <div className="glass-panel" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              <div className="circular-score" style={{ marginBottom: '2rem' }}>
                <svg width="250" height="250" viewBox="0 0 250 250" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="125" cy="125" r="110" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                  <motion.circle 
                    cx="125" cy="125" r="110" fill="none" 
                    stroke="url(#gradient)" 
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset: (isCalculating || isSearching) ? circumference : strokeDashoffset }}
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
                  <div className="score-number" style={{ fontSize: '4.5rem', opacity: (isCalculating || isSearching) ? 0.3 : 1 }}>
                    {displayedScore}
                  </div>
                  <div className="score-label" style={{ fontSize: '1rem', fontWeight: 600 }}>PrivScore</div>
                </div>
              </div>

              {!isViewingDemo && (
                <button 
                  className="primary" 
                  style={{ width: '80%', fontSize: '1.1rem', padding: '1rem' }}
                  onClick={calculateScoreFlow}
                  disabled={!account || isCalculating}
                >
                  {isCalculating ? <RefreshCw className="lucide-spin" /> : <Zap />}
                  {isCalculating ? 'Computing in Enclave...' : 'Calculate Private Score'}
                </button>
              )}
            </div>

            {/* Verification Steps */}
            <div className="glass-panel">
              <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <Cpu size={20} color="var(--neon-purple)"/> Verification Steps
              </h3>
              
              <div style={{ marginTop: '1.5rem' }}>
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
          </div>

          {/* AI Inference Block spanning Right Column */}
          <div className="glass-panel">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0' }}>
              <TerminalSquare size={16} color="var(--neon-purple)" /> TEE LLM Inference Log
            </h4>
            <div className="ai-insights" style={{ minHeight: '80px', fontSize: '1rem' }}>
              {displayedAiText}
              {(score > 0 && activeUser.aiAnalysis && !isSearching) && <span className="ai-cursor"></span>}
              {(score === 0 || isSearching) && <span style={{opacity: 0.5}}>Waiting for computation...</span>}
            </div>
          </div>

        </div>

      </motion.div>

      {/* Leaderboard Section */}
      <motion.div 
        className="glass-panel"
        style={{ marginTop: '2rem' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={20} color="var(--neon-blue)" /> Recent TEE Attestations (Leaderboard)
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Address</th>
                <th>PrivScore</th>
                <th>Reputation Rank</th>
                <th>Time (Block)</th>
              </tr>
            </thead>
            <tbody>
              {LEADERBOARD_DATA.map((item, index) => (
                <tr key={index}>
                  <td style={{ fontFamily: 'monospace' }}>{item.address}</td>
                  <td style={{ fontWeight: 'bold' }}>{item.score}</td>
                  <td>
                    <span className={`rank-badge rank-${item.rank.toLowerCase()}`}>
                      Class {item.rank}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* TEE Node Status Badge */}
      <div className="tee-status">
        <div className={`status-dot ${isCalculating || isSearching ? 'computing' : ''}`}></div>
        <div>
          <div style={{ fontWeight: 'bold', color: isCalculating || isSearching ? 'var(--neon-purple)' : 'var(--neon-green)' }}>
            {isCalculating || isSearching ? 'ENCLAVE COMPUTING' : 'ENCLAVE SECURE'}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Ritual Testnet • ID 1979</div>
        </div>
      </div>

      <Footer />
      
      <style>{`
        .lucide-spin { animation: spin 2s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default Dashboard;
