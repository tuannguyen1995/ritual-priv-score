import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Hexagon, Activity, Award, Database, Cpu, CheckCircle, Wallet, Code, Globe, Zap, RefreshCw, LogOut, TerminalSquare, Home, BarChart2, Search, TrendingUp, Network, Server, Volume2, VolumeX, Moon, Sun, ArrowRight, MessageSquare, BrainCircuit } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import ForceGraph2D from 'react-force-graph-2d';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { playClickSound, playBlipSound, playSuccessSound, setAudioEnabled, getAudioEnabled } from '../utils/audio';

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

const RITUAL_MODELS = [
  { id: 'llama-3-8b', name: 'Ritual-Llama-3 (Balanced)', hash: '0x8f3c...9a12' },
  { id: 'mistral-7b', name: 'Mistral-7B-DeFi-Expert', hash: '0x2b1e...f4cc' },
  { id: 'grok-alpha', name: 'Grok-Alpha (Social)', hash: '0x5d9a...1b8e' }
];

export const TRENDING_PROFILES = [
  { 
    name: "vitalik.eth", 
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", 
    mockData: { age: "8.2 Years", commits: "12,450", social: "Legendary", tx: "15,230 ETH", protocols: "124", gasSpent: "845 ETH", modelsDeployed: "12", nodesRun: "3", inferTasks: "14,200", expectedScore: 950 },
    metrics: { onChain: 99, social: 99, financial: 98, nft: 80, sybilScore: 99 },
    aiAnalysis: "LLM Analysis: Verified Ethereum co-founder. Massive on-chain footprint. Exceptional social reputation and developer activity. Risk profile: Zero."
  },
  { 
    name: "0xDefiWhale", 
    address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", 
    mockData: { age: "4.5 Years", commits: "340", social: "High", tx: "3,420 ETH", protocols: "45", gasSpent: "120 ETH", modelsDeployed: "0", nodesRun: "1", inferTasks: "840", expectedScore: 820 },
    metrics: { onChain: 95, social: 70, financial: 90, nft: 40, sybilScore: 85 },
    aiAnalysis: "LLM Analysis: High volume DeFi power user. Consistent liquidity provider. Moderate developer activity. Risk profile: Very Low."
  },
  { 
    name: "0xAirdropHunter", 
    address: "0x1111111111111111111111111111111111111111", 
    mockData: { age: "0.5 Years", commits: "12", social: "Low", tx: "2.1 ETH", protocols: "8", gasSpent: "0.4 ETH", modelsDeployed: "0", nodesRun: "0", inferTasks: "12", expectedScore: 510 },
    metrics: { onChain: 45, social: 20, financial: 30, nft: 10, sybilScore: 30 },
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

const generateGraphData = (seedName) => {
  const nodes = [{ id: 'wallet', name: seedName, val: 12, color: '#00FFA3' }];
  const links = [];
  const protocols = ['Uniswap', 'Aave', 'Compound', 'OpenSea', 'Blur', 'Lido', 'Maker'];
  
  protocols.forEach((p, i) => {
    nodes.push({ id: p, name: p, val: 5, color: '#8B5CF6' });
    links.push({ source: 'wallet', target: p });
    if (Math.random() > 0.3) {
      const subId = `${p}_pool_${i}`;
      nodes.push({ id: subId, name: `${p} Pool`, val: 3, color: '#00B8FF' });
      links.push({ source: p, target: subId });
      if (Math.random() > 0.5) links.push({ source: 'wallet', target: subId });
    }
  });
  return { nodes, links };
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [publicProvider, setPublicProvider] = useState(null);
  const [account, setAccount] = useState("");
  
  const [score, setScore] = useState(0);
  const [hasCert, setHasCert] = useState(false);
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcStep, setCalcStep] = useState(0); 
  
  const [displayedScore, setDisplayedScore] = useState(0);
  
  const [activeUser, setActiveUser] = useState(TRENDING_PROFILES[0]);
  const [isViewingDemo, setIsViewingDemo] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const [graphData, setGraphData] = useState(() => generateGraphData(TRENDING_PROFILES[0].name));
  
  const [selectedModel, setSelectedModel] = useState(RITUAL_MODELS[0]);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [liveNodes, setLiveNodes] = useState([]);
  
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [audioOn, setAudioOn] = useState(true);
  const [ritualBalance, setRitualBalance] = useState("0.000");

  const terminalRef = useRef(null);
  const graphContainerRef = useRef(null);
  const [graphWidth, setGraphWidth] = useState(400);

  useEffect(() => {
    document.documentElement.className = theme === 'light' ? 'light-theme' : '';
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    setAudioEnabled(audioOn);
  }, [audioOn]);

  const toggleTheme = () => {
    playClickSound();
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  const toggleAudio = () => {
    playClickSound();
    setAudioOn(!audioOn);
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newAttestation = {
        id: Math.random().toString(36).substring(2, 10),
        node: "0x" + Math.random().toString(16).substring(2, 6) + "..." + Math.random().toString(16).substring(2, 6),
        time: `${Math.floor(Math.random() * 50 + 10)}ms`
      };
      setLiveNodes(prev => [newAttestation, ...prev].slice(0, 5));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
          }
        } catch (err) {}
      }
    };
    checkPersistedWallet();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (graphContainerRef.current) {
        setGraphWidth(graphContainerRef.current.offsetWidth);
      }
    };
    handleResize(); // Initial measurement
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const pProvider = new ethers.JsonRpcProvider(RITUAL_RPC);
        setPublicProvider(pProvider);
        if (isViewingDemo) {
          fetchUserData(TRENDING_PROFILES[0].address, pProvider, TRENDING_PROFILES[0]);
          setTerminalLogs([
            `[SYSTEM] Connected to Ritual Network (ChainID: ${CHAIN_ID})`,
            `[TEE] Loaded previous inference for ${TRENDING_PROFILES[0].address}`,
            `[RESULT] ${TRENDING_PROFILES[0].aiAnalysis}`
          ]);
        }
      } catch (err) {}
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
      if (currentScore == 0 && isViewingDemo && userProfile) currentScore = userProfile.expectedScore; 
      setScore(Number(currentScore));
      const certId = await scoreContract.soulboundCertificates(targetAddress);
      setHasCert(certId > 0 || (isViewingDemo && currentScore >= 700));

      const pProvider = new ethers.JsonRpcProvider(RITUAL_RPC);
      const bal = await pProvider.getBalance(targetAddress);
      setRitualBalance(Number(ethers.formatEther(bal)).toFixed(3));
    } catch (err) {
      setRitualBalance("0.000");
    }
  };

  const connectWallet = async () => {
    playClickSound();
    if (window.ethereum) {
      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        await browserProvider.send("eth_requestAccounts", []);
        const signer = await browserProvider.getSigner();
        const address = await signer.getAddress();
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
    playClickSound();
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
      mockData: { age: "?", commits: "?", social: "?", tx: "?", protocols: "?", gasSpent: "?", modelsDeployed: "?", nodesRun: "?", inferTasks: "?" },
      metrics: { onChain: 0, social: 0, financial: 0, nft: 0, sybilScore: 0 },
      aiAnalysis: ""
    });
    setGraphData(generateGraphData("Your Wallet"));
    fetchUserData(address, browserProvider, null);
    setTerminalLogs([
      `[SYSTEM] Connected to wallet: ${address}`,
      `[INFO] Awaiting calculation command...`
    ]);
  };

  const simulateTerminalOutput = (analysisStr) => {
    const logs = [
      `[INFO] Initializing Secure Enclave...`,
      `[AUTH] Node verified cryptographic signature.`,
      `[PULL] Fetching on-chain historical data for ${activeUser.address.substring(0, 10)}...`,
      `[TEE] Encrypting payload into memory...`,
      `[MODEL] Booting ${selectedModel.name} (Hash: ${selectedModel.hash})...`,
      `[COMPUTE] Executing LLM inference...`,
      `[COMPUTE] Analyzing DeFi interactions...`,
      `[COMPUTE] Assessing social graphs and sybil resistance...`,
      `[ATTESTATION] Generating Zero-Knowledge Proof for result...`,
      `[RESULT] ${analysisStr}`,
      `[SYSTEM] Connection closed. Proof submitted on-chain.`
    ];
    
    setTerminalLogs([]);
    let currentLog = 0;
    
    const pushLog = () => {
      if (currentLog < logs.length) {
        setTerminalLogs(prev => [...prev, logs[currentLog]]);
        playBlipSound();
        currentLog++;
        const nextDelay = currentLog === logs.length - 1 ? 100 : Math.random() * 400 + 100;
        setTimeout(pushLog, nextDelay);
      } else {
        playSuccessSound();
      }
    };
    pushLog();
  };

  const calculateScoreFlow = async () => {
    playClickSound();
    if (!account || !provider || isViewingDemo) return;
    try {
      setIsCalculating(true);
      setScore(0); 
      setCalcStep(1); 
      
      const signer = await provider.getSigner();
      const agentContract = new ethers.Contract(AGENT_CONTRACT_ADDRESS, agentAbi, signer);
      
      const analysisStr = "LLM Analysis: Verified human identity. Healthy on-chain interaction with DeFi protocols. Github history indicates active developer. Excellent risk profile.";
      simulateTerminalOutput(analysisStr);
      
      setTimeout(() => setCalcStep(2), 2000); 
      const tx = await agentContract.calculateScore(account);
      setCalcStep(3); 
      await tx.wait();
      
      setCalcStep(4); 
      setTimeout(() => {
        setIsCalculating(false);
        setCalcStep(0);
        setActiveUser(prev => ({
          ...prev,
          mockData: { age: "2.1 Years", commits: "840", social: "Good", tx: "34 ETH", protocols: "22", gasSpent: "1.5 ETH", modelsDeployed: "1", nodesRun: "1", inferTasks: "450" },
          metrics: { onChain: 88, social: 75, financial: 85, nft: 60, sybilScore: 90 },
          aiAnalysis: analysisStr
        }));
        fetchUserData(account, provider, null);
      }, 1000);
      
    } catch (err) {
      console.error(err);
      setIsCalculating(false);
      setCalcStep(0);
      setTerminalLogs(prev => [...prev, `[ERROR] Transaction failed or rejected.`]);
    }
  };

  const selectTrendingProfile = (user) => {
    setSearchInput(user.name);
    handleSearch(user);
  };

  const handleSearch = (predefinedUser = null) => {
    playClickSound();
    if (!searchInput && !predefinedUser) return;
    
    setIsViewingDemo(true);
    setIsSearching(true);
    setScore(0);
    setCalcStep(1);
    
    let targetUser = predefinedUser;
    if (!targetUser) {
      targetUser = {
        name: searchInput.length > 20 ? "Searched Wallet" : searchInput,
        address: searchInput.length > 20 ? searchInput : "0x" + Math.random().toString(16).substr(2, 40),
        mockData: { 
          age: (Math.random() * 5 + 0.1).toFixed(1) + " Years", 
          commits: Math.floor(Math.random() * 500).toString(), 
          social: ["Low", "Neutral", "Good"][Math.floor(Math.random() * 3)], 
          tx: (Math.random() * 100).toFixed(1) + " ETH", 
          protocols: Math.floor(Math.random() * 50).toString(),
          gasSpent: (Math.random() * 5).toFixed(2) + " ETH",
          modelsDeployed: Math.floor(Math.random() * 5).toString(),
          nodesRun: Math.floor(Math.random() * 3).toString(),
          inferTasks: Math.floor(Math.random() * 2000).toString(),
          expectedScore: Math.floor(Math.random() * 400 + 400) 
        },
        metrics: { 
          onChain: Math.floor(Math.random() * 100), 
          social: Math.floor(Math.random() * 100), 
          financial: Math.floor(Math.random() * 100),
          nft: Math.floor(Math.random() * 100),
          sybilScore: Math.floor(Math.random() * 100)
        },
        aiAnalysis: "LLM Analysis: Wallet data fetched and analyzed via Enclave. Behavior appears normal with mixed signals on social presence."
      };
    }
    setActiveUser(targetUser);
    
    simulateTerminalOutput(targetUser.aiAnalysis);
    
    setTimeout(() => setCalcStep(2), 800);
    setTimeout(() => setCalcStep(3), 1600);
    
    setTimeout(() => {
      setGraphData(generateGraphData(targetUser.name));
      setIsSearching(false);
      setCalcStep(4);
      if (publicProvider) {
        fetchUserData(targetUser.address, publicProvider, targetUser);
      } else {
        setScore(targetUser.expectedScore);
      }
      setTimeout(() => setCalcStep(0), 1000);
    }, 3500);
  };

  const circumference = 2 * Math.PI * 110;
  const strokeDashoffset = circumference - (displayedScore / 850) * circumference;

  const radarData = [
    { subject: `DeFi Volume: ${activeUser.metrics.financial}`, A: activeUser.metrics.financial, fullMark: 100 },
    { subject: `NFT Activity: ${activeUser.metrics.nft}`, A: activeUser.metrics.nft, fullMark: 100 },
    { subject: `Social Rep: ${activeUser.metrics.social}`, A: activeUser.metrics.social, fullMark: 100 },
    { subject: `Dev Commits: ${activeUser.metrics.onChain}`, A: activeUser.metrics.onChain, fullMark: 100 },
    { subject: `Trust/Sybil: ${activeUser.metrics.sybilScore}`, A: activeUser.metrics.sybilScore, fullMark: 100 },
  ];

  return (
    <>
      <header style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield color="var(--neon-purple)" size={28} />
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>RitualPrivScore</span>
        </Link>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: 'auto' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <Cpu size={16} color="var(--neon-blue)" />
            <select 
              value={selectedModel.id} 
              onChange={(e) => { playClickSound(); setSelectedModel(RITUAL_MODELS.find(m => m.id === e.target.value)); }}
              style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none', outline: 'none', cursor: 'pointer' }}
              disabled={isCalculating || isSearching}
            >
              {RITUAL_MODELS.map(m => (
                <option key={m.id} value={m.id} style={{ background: 'var(--bg-dark)' }}>{m.name}</option>
              ))}
            </select>
          </div>

          <button onClick={toggleTheme} style={{ padding: '0.5rem', borderRadius: '50%' }}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          <button onClick={toggleAudio} style={{ padding: '0.5rem', borderRadius: '50%' }}>
            {audioOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <Link to="/">
            <button style={{ padding: '0.5rem 1rem' }} onClick={playClickSound}>
              <Home size={16} /> Home
            </button>
          </Link>

          {isViewingDemo ? (
            <div 
              onClick={() => {
                playClickSound();
                const searchInput = document.querySelector('.search-input');
                if(searchInput) {
                  searchInput.focus();
                  searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--neon-blue)', background: 'rgba(0,184,255,0.1)', padding: '0.5rem 1rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,184,255,0.2)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,184,255,0.1)'}
              title="Click to search an address"
            >
              <Search size={16} /> Explorer Mode
            </div>
          ) : (
            <div 
              onClick={() => {
                playClickSound();
                if (account && provider) {
                  switchToMyWallet(account, provider);
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--neon-green)', background: 'rgba(0,255,163,0.1)', padding: '0.5rem 1rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,255,163,0.2)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,255,163,0.1)'}
              title="View your connected wallet"
            >
              <Wallet size={16} /> My Wallet Connected
            </div>
          )}
          
          {!account ? (
            <button onClick={connectWallet} className="primary">
              <Wallet size={18} /> Connect
            </button>
          ) : (
            <button onClick={disconnectWallet} className="danger" style={{ padding: '0.5rem 1rem' }}>
              <LogOut size={16} /> Disconnect ({account.substring(0, 4)}...)
            </button>
          )}
        </div>
      </header>

      {/* Utility Bar */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', padding: '1rem', marginBottom: '2rem', background: 'rgba(139, 92, 246, 0.05)', borderBottom: '1px solid var(--border-color)', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>
          <Database size={16} color="var(--neon-blue)" />
          <span>Ritual Balance: <span style={{ color: 'var(--neon-green)' }}>{ritualBalance} RITUAL</span></span>
        </div>
        <a href="https://docs.ritual.net/faucet" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 600 }} className="hover-link">
          <Zap size={16} color="var(--neon-purple)" />
          <span>Testnet Faucet</span>
        </a>
        <a href="https://discord.gg/ritual" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 600 }} className="hover-link">
          <MessageSquare size={16} color="#5865F2" />
          <span>Join Discord</span>
        </a>
      </div>

      {/* Explorer Search Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem', width: '100%' }}>
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
          
          {/* Radar Chart Block */}
          <motion.div 
            className="glass-panel-premium" 
            style={{ flex: 1, position: 'relative', minHeight: '300px' }}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {isSearching && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-card)', zIndex: 10, borderRadius: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '90%', height: '90%', borderRadius: '12px' }} className="skeleton-box"></div>
              </div>
            )}
            
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', color: 'var(--text-primary)' }}>
              <BarChart2 size={20} color="var(--neon-blue)"/> <span className="text-gradient-blue">Radar Risk Profile</span>
            </h3>
            
            <div style={{ width: '100%', height: '250px', filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.2))' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke={theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(20,24,34,0.9)', borderColor: 'var(--neon-purple)', borderRadius: '8px', color: 'var(--text-primary)', boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)' }} itemStyle={{ color: 'var(--neon-purple)' }} />
                  <Radar name="Profile" dataKey="A" stroke="var(--neon-purple)" fill="var(--neon-purple)" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
              {[
                { label: 'Wallet Age', icon: <Wallet size={16} color="#38bdf8"/>, val: activeUser.mockData.age, bg: 'rgba(56, 189, 248, 0.15)' },
                { label: 'Commits', icon: <Code size={16} color="#4ade80"/>, val: activeUser.mockData.commits, bg: 'rgba(74, 222, 128, 0.15)', highlight: true },
                { label: 'Total Volume', icon: <Activity size={16} color="#c084fc"/>, val: activeUser.mockData.tx, bg: 'rgba(192, 132, 252, 0.15)' },
                { label: 'Social Rep', icon: <Globe size={16} color="#fbbf24"/>, val: activeUser.mockData.social, bg: 'rgba(251, 191, 36, 0.15)' },
                { label: 'Protocols', icon: <Network size={16} color="#f472b6"/>, val: activeUser.mockData.protocols, bg: 'rgba(244, 114, 182, 0.15)' },
                { label: 'Gas Spent', icon: <Zap size={16} color="#fb923c"/>, val: activeUser.mockData.gasSpent, bg: 'rgba(251, 146, 60, 0.15)' },
                { label: 'Models', icon: <BrainCircuit size={16} color="#818cf8"/>, val: activeUser.mockData.modelsDeployed, bg: 'rgba(129, 140, 248, 0.15)' },
                { label: 'Nodes', icon: <Server size={16} color="#2dd4bf"/>, val: activeUser.mockData.nodesRun, bg: 'rgba(45, 212, 191, 0.15)' },
                { label: 'Inferences', icon: <Cpu size={16} color="#a3e635"/>, val: activeUser.mockData.inferTasks, bg: 'rgba(163, 230, 53, 0.15)', highlight: true }
              ].map((item, idx) => (
                <motion.div 
                  key={idx} 
                  whileHover={{ scale: 1.05, y: -4, borderColor: 'rgba(255,255,255,0.2)' }} 
                  style={{ 
                    background: 'linear-gradient(145deg, rgba(20,24,34,0.6) 0%, rgba(30,35,45,0.8) 100%)', 
                    border: '1px solid rgba(255,255,255,0.05)', 
                    borderRadius: '16px', 
                    padding: '0.8rem', 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '0.8rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                    cursor: 'default',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {/* Icon Badge */}
                  <div style={{
                    background: item.bg,
                    borderRadius: '12px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexShrink: 0,
                    boxShadow: `0 0 15px ${item.bg.replace('0.15', '0.4')}`
                  }}>
                    {item.icon}
                  </div>
                  
                  {/* Data */}
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem', whiteSpace: 'nowrap' }}>{item.label}</span>
                    <span style={{ fontSize: '1rem', fontFamily: 'monospace', fontWeight: 'bold', color: item.highlight ? 'var(--text-primary)' : 'var(--text-primary)', textShadow: item.highlight ? '0 0 10px rgba(74,222,128,0.5)' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.val}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* On-chain Graph */}
          <motion.div 
            ref={graphContainerRef}
            className="glass-panel-premium" 
            style={{ position: 'relative', overflow: 'hidden', padding: 0, height: '300px' }}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.5rem 1rem', borderRadius: '50px', border: '1px solid var(--border-color)', backdropFilter: 'blur(5px)' }}>
              <Network size={16} color="var(--neon-purple)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>On-chain Footprint</span>
            </div>
            {isSearching ? (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-card)', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '80%', height: '80%', borderRadius: '12px' }} className="skeleton-box"></div>
              </div>
            ) : (
              <ForceGraph2D
                graphData={graphData}
                width={graphWidth}
                height={300}
                backgroundColor="transparent"
                nodeRelSize={6}
                linkColor={() => theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.01}
                linkDirectionalParticleWidth={2}
                enableZoomPanInteraction={false}
                nodeCanvasObject={(node, ctx, globalScale) => {
                  const label = node.name;
                  const fontSize = 12 / globalScale;
                  ctx.font = `${fontSize}px Sans-Serif`;
                  ctx.fillStyle = node.color;
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
                  ctx.fill();
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillStyle = theme === 'light' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)';
                  ctx.fillText(label, node.x, node.y + node.val + (fontSize));
                }}
              />
            )}
          </motion.div>
        </div>

        {/* Right Column: Score & AI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
            
            {/* Main Score Area */}
            <motion.div 
              className="glass-panel-premium" 
              style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="circular-score" style={{ marginBottom: '2rem' }}>
                <svg width="250" height="250" viewBox="0 0 250 250" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="125" cy="125" r="110" fill="none" stroke="var(--border-color)" strokeWidth="12" />
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
                  {isCalculating ? 'Computing in Enclave...' : 'Calculate Score'}
                </button>
              )}
              
              {/* Navigate to Details Button */}
              {displayedScore > 0 && !isCalculating && !isSearching && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '1rem', width: '80%' }}>
                  <button 
                    style={{ width: '100%', borderColor: 'var(--neon-purple)', color: 'var(--neon-purple)' }}
                    onClick={() => { playClickSound(); navigate(`/details/${activeUser.address}`, { state: { user: activeUser, score: displayedScore } }); }}
                  >
                    View Detailed Breakdown <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}
            </motion.div>

            {/* Verification Steps & Live Network */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="glass-panel" style={{ flex: 1 }}>
                <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontSize: '1.1rem' }}>
                  <Cpu size={18} color="var(--neon-purple)"/> Verification
                </h3>
                
                <div style={{ marginTop: '1rem' }}>
                  <div className={`step-item ${(calcStep >= 1 || score > 0) ? 'active' : ''} ${calcStep > 1 || score > 0 ? 'completed' : ''}`} style={{ marginBottom: '0.8rem', padding: '0.5rem' }}>
                    <div className="step-icon" style={{ width: '24px', height: '24px' }}><Database size={14} /></div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Private Fetch</div>
                    </div>
                  </div>
                  
                  <div className={`step-item ${(calcStep >= 2 || score > 0) ? 'active' : ''} ${calcStep > 2 || score > 0 ? 'completed' : ''}`} style={{ marginBottom: '0.8rem', padding: '0.5rem' }}>
                    <div className="step-icon" style={{ width: '24px', height: '24px' }}><Cpu size={14} /></div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>TEE LLM</div>
                    </div>
                  </div>

                  <div className={`step-item ${(calcStep >= 3 || score > 0) ? 'active' : ''} ${calcStep > 3 || score > 0 ? 'completed' : ''}`} style={{ padding: '0.5rem' }}>
                    <div className="step-icon" style={{ width: '24px', height: '24px' }}><Award size={14} /></div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>ZKP Mint</div>
                    </div>
                  </div>
                </div>

                {hasCert && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ 
                      marginTop: '1rem', padding: '0.5rem', 
                      background: 'rgba(0,255,163,0.1)', border: '1px solid var(--neon-green)',
                      borderRadius: '8px', display: 'flex', gap: '0.5rem', alignItems: 'center'
                    }}
                  >
                    <CheckCircle color="var(--neon-green)" size={16} />
                    <div style={{ fontSize: '0.8rem', color: 'var(--neon-green)' }}>Verified Soulbound</div>
                  </motion.div>
                )}
              </div>

              {/* Live Network Feed */}
              <div className="glass-panel" style={{ flex: 1, overflow: 'hidden' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <Server size={14} color="var(--neon-blue)" /> Live Attestations
                </h4>
                <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', minHeight: '130px' }}>
                  <AnimatePresence mode="popLayout">
                    {liveNodes.map(item => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.2rem' }}
                      >
                        <span style={{ color: 'var(--text-secondary)' }}>Node {item.node}</span>
                        <span style={{ color: 'var(--neon-green)' }}>{item.time}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

            </div>
          </div>

          {/* AI Inference Block - TEE Terminal */}
          <div className="glass-panel" style={{ background: 'var(--terminal-bg)', border: '1px solid var(--border-color)', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
              <TerminalSquare size={16} color="var(--neon-green)" /> <span className="text-gradient-green">TEE ENCLAVE TERMINAL</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Model: {selectedModel.id}</span>
            </h4>
            <div 
              className="ai-insights" 
              ref={terminalRef}
            >
              <div className="scanline"></div>
              {terminalLogs.map((log, i) => (
                <div key={i} style={{ marginBottom: '0.3rem', opacity: i === terminalLogs.length - 1 ? 1 : 0.7 }}>
                  {log.includes('[ERROR]') ? <span style={{color: '#ff4444'}}>{log}</span> :
                   log.includes('[RESULT]') ? <span style={{color: '#38bdf8', fontWeight: 'bold'}}>{log}</span> :
                   log}
                </div>
              ))}
              {(isCalculating || isSearching) && <div className="ai-cursor"></div>}
            </div>
          </div>
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
        
        .ai-cursor {
          display: inline-block;
          width: 8px;
          height: 15px;
          background-color: var(--neon-green);
          animation: blink 1s step-end infinite;
        }
        @keyframes blink { 50% { opacity: 0; } }

        .hover-link {
          transition: all 0.2s ease;
        }
        .hover-link:hover {
          color: var(--neon-purple) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </>
  );
};

export default Dashboard;
