import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/dashboard/Header';
import UtilityBar from '../components/dashboard/UtilityBar';
import SearchBar from '../components/dashboard/SearchBar';
import RadarProfile from '../components/dashboard/RadarProfile';
import MetricsGrid from '../components/dashboard/MetricsGrid';
import OnChainGraph from '../components/dashboard/OnChainGraph';
import ScoreDisplay from '../components/dashboard/ScoreDisplay';
import VerificationSteps from '../components/dashboard/VerificationSteps';
import TerminalDisplay from '../components/dashboard/TerminalDisplay';
import { playBlipSound, playSuccessSound, playClickSound, setAudioEnabled } from '../utils/audio';
import { RITUAL_MODELS, TRENDING_PROFILES, generateGraphData, generateDeterministicMockData } from '../utils/mockData';
import { useAccount, useDisconnect, useBalance } from 'wagmi';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

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

  const { data: balanceData } = useBalance({
    address: address,
  });
  
  const ritualBalance = isConnected && balanceData 
    ? Number(balanceData.formatted).toFixed(3) 
    : "0.000";

  const terminalRef = useRef(null);
  const graphContainerRef = useRef(null);
  const [graphWidth, setGraphWidth] = useState(400);

  // Wagmi connection effect
  useEffect(() => {
    if (isConnected && address) {
      switchToMyWallet(address);
    } else {
      if (!isViewingDemo) {
        selectTrendingProfile(TRENDING_PROFILES[0]);
      }
    }
  }, [isConnected, address]);

  useEffect(() => {
    document.documentElement.className = theme === 'light' ? 'light-theme' : '';
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.body.classList.add('aurora-theme');
    return () => document.body.classList.remove('aurora-theme');
  }, []);

  useEffect(() => {
    setAudioEnabled(audioOn);
  }, [audioOn]);

  const toggleTheme = () => {
    playClickSound();
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: newTheme }));
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
    const handleResize = () => {
      if (graphContainerRef.current) {
        setGraphWidth(graphContainerRef.current.offsetWidth);
      }
    };
    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        if (isViewingDemo) {
          fetchUserData(TRENDING_PROFILES[0].address, TRENDING_PROFILES[0]);
          setTerminalLogs([
            `[SYSTEM] Connected to Ritual Network (ChainID: 1979)`,
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

  const fetchUserData = (targetAddress, userProfile) => {
    if (userProfile && userProfile.mockData) {
      setScore(userProfile.mockData.expectedScore);
      setHasCert(userProfile.mockData.expectedScore >= 700);
    } else {
      setScore(0);
      setHasCert(false);
    }
  };

  const switchToMyWallet = (addr) => {
    setIsViewingDemo(false);
    
    // Check if we already calculated this wallet's mock data
    const myWalletData = generateDeterministicMockData(addr);
    
    setActiveUser({
      name: "Your Wallet",
      address: addr,
      mockData: { age: "?", commits: "?", social: "?", tx: "?", protocols: "?", gasSpent: "?", modelsDeployed: "?", nodesRun: "?", inferTasks: "?", expectedScore: myWalletData.mockData.expectedScore },
      metrics: { onChain: 0, social: 0, financial: 0, nft: 0, sybilScore: 0 },
      aiAnalysis: ""
    });
    setGraphData(generateGraphData("Your Wallet"));
    fetchUserData(addr, null);
    setTerminalLogs([
      `[SYSTEM] Connected to wallet: ${addr}`,
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
    if (!address || isViewingDemo) return;
    try {
      setIsCalculating(true);
      setScore(0); 
      setCalcStep(1); 
      
      const mockResult = generateDeterministicMockData(address);
      simulateTerminalOutput(mockResult.aiAnalysis);
      
      setTimeout(() => setCalcStep(2), 2000); 
      setTimeout(() => setCalcStep(3), 4000);
      
      setTimeout(() => {
        setIsCalculating(false);
        setCalcStep(0);
        setActiveUser(mockResult);
        fetchUserData(address, mockResult);
        toast.success('Zero-Knowledge Proof Minted Successfully!');
      }, 5500);
      
    } catch (err) {
      console.error(err);
      setIsCalculating(false);
      setCalcStep(0);
      setTerminalLogs(prev => [...prev, `[ERROR] Transaction failed or rejected.`]);
      toast.error('Calculation failed');
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
      targetUser = generateDeterministicMockData(searchInput);
      targetUser.name = searchInput.length > 20 ? "Searched Wallet" : searchInput;
    }
    simulateTerminalOutput(targetUser.aiAnalysis);
    
    setTimeout(() => setCalcStep(2), 800);
    setTimeout(() => setCalcStep(3), 1600);
    
    setTimeout(() => {
      setActiveUser(targetUser);
      setGraphData(generateGraphData(targetUser.name));
      setIsSearching(false);
      setCalcStep(4);
      fetchUserData(targetUser.address, targetUser);
      setTimeout(() => setCalcStep(0), 1000);
    }, 3500);
  };

  const radarData = [
    { subject: `DeFi Volume: ${activeUser.metrics.financial}`, A: activeUser.metrics.financial, fullMark: 100 },
    { subject: `NFT Activity: ${activeUser.metrics.nft}`, A: activeUser.metrics.nft, fullMark: 100 },
    { subject: `Social Rep: ${activeUser.metrics.social}`, A: activeUser.metrics.social, fullMark: 100 },
    { subject: `Dev Commits: ${activeUser.metrics.onChain}`, A: activeUser.metrics.onChain, fullMark: 100 },
    { subject: `Trust/Sybil: ${activeUser.metrics.sybilScore}`, A: activeUser.metrics.sybilScore, fullMark: 100 },
  ];

  return (
    <>
      <Header 
        theme={theme} toggleTheme={toggleTheme}
        audioOn={audioOn} toggleAudio={toggleAudio}
        isViewingDemo={isViewingDemo}
        selectedModel={selectedModel} setSelectedModel={setSelectedModel}
        RITUAL_MODELS={RITUAL_MODELS}
        isCalculating={isCalculating} isSearching={isSearching}
        account={address}
        disconnectWallet={() => disconnect()}
        switchToMyWallet={switchToMyWallet}
      />

      <UtilityBar ritualBalance={ritualBalance} />

      <SearchBar 
        searchInput={searchInput} setSearchInput={setSearchInput}
        handleSearch={handleSearch} isSearching={isSearching}
        selectTrendingProfile={selectTrendingProfile} activeUser={activeUser}
      />

      <motion.div 
        className="dashboard-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <RadarProfile radarData={radarData} isSearching={isSearching} theme={theme} />
          <MetricsGrid activeUser={activeUser} />
          <OnChainGraph 
            graphContainerRef={graphContainerRef} isSearching={isSearching}
            graphData={graphData} graphWidth={graphWidth} theme={theme}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="right-panel-grid">
            <ScoreDisplay 
              displayedScore={displayedScore} isCalculating={isCalculating}
              isSearching={isSearching} isViewingDemo={isViewingDemo}
              account={address} calculateScoreFlow={calculateScoreFlow}
              navigate={navigate} activeUser={activeUser}
            />
            <VerificationSteps calcStep={calcStep} score={score} hasCert={hasCert} liveNodes={liveNodes} />
          </div>
          <TerminalDisplay 
            selectedModel={selectedModel} terminalRef={terminalRef}
            terminalLogs={terminalLogs} isCalculating={isCalculating} isSearching={isSearching}
          />
        </div>
      </motion.div>

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

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2rem;
          align-items: stretch;
        }

        .right-panel-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 2rem;
        }

        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .right-panel-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .right-panel-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default Dashboard;
