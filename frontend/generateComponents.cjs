const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components', 'dashboard');
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

const files = {
  'UtilityBar.jsx': `import React from 'react';
import { Database, Zap, MessageSquare } from 'lucide-react';

const UtilityBar = ({ ritualBalance }) => (
  <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', padding: '1rem', marginBottom: '2rem', background: 'rgba(139, 92, 246, 0.05)', borderBottom: '1px solid var(--border-color)', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>
      <Database size={16} color="var(--neon-blue)" />
      <span>Ritual Balance: <span style={{ color: 'var(--neon-green)' }}>{ritualBalance} RITUAL</span></span>
    </div>
    <a href="https://faucet.ritualfoundation.org/" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 600 }} className="hover-link">
      <Zap size={16} color="var(--neon-purple)" />
      <span>Testnet Faucet</span>
    </a>
    <a href="https://discord.gg/ritual" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 600 }} className="hover-link">
      <MessageSquare size={16} color="#5865F2" />
      <span>Join Discord</span>
    </a>
  </div>
);

export default UtilityBar;`,

  'SearchBar.jsx': `import React from 'react';
import { Search, RefreshCw, TrendingUp } from 'lucide-react';
import { TRENDING_PROFILES } from '../../utils/mockData';

const SearchBar = ({ searchInput, setSearchInput, handleSearch, isSearching, selectTrendingProfile, activeUser }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem', width: '100%' }}>
    <div className="search-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', width: '100%', maxWidth: '800px' }}>
      <input 
        type="text" 
        className="search-input" 
        placeholder="Enter ETH Address, ENS, or Lens handle..." 
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        style={{ flex: 1, minWidth: '300px' }}
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
    
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
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
);

export default SearchBar;`,

  'RadarProfile.jsx': `import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

const RadarProfile = ({ radarData, isSearching, theme }) => (
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
          <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--neon-purple)', borderRadius: '8px', color: 'var(--text-primary)', boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)' }} itemStyle={{ color: 'var(--neon-purple)' }} />
          <Radar name="Profile" dataKey="A" stroke="var(--neon-purple)" fill="var(--neon-purple)" fillOpacity={0.4} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

export default RadarProfile;`,

  'MetricsGrid.jsx': `import React from 'react';
import { Wallet, Code, Activity, Globe, Network, Zap, BrainCircuit, Server, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const MetricsGrid = ({ activeUser }) => {
  const items = [
    { label: 'Wallet Age', icon: <Wallet size={16} color="#38bdf8"/>, val: activeUser.mockData.age, bg: 'rgba(56, 189, 248, 0.15)' },
    { label: 'Commits', icon: <Code size={16} color="#4ade80"/>, val: activeUser.mockData.commits, bg: 'rgba(74, 222, 128, 0.15)', highlight: true },
    { label: 'Total Volume', icon: <Activity size={16} color="#c084fc"/>, val: activeUser.mockData.tx, bg: 'rgba(192, 132, 252, 0.15)' },
    { label: 'Social Rep', icon: <Globe size={16} color="#fbbf24"/>, val: activeUser.mockData.social, bg: 'rgba(251, 191, 36, 0.15)' },
    { label: 'Protocols', icon: <Network size={16} color="#f472b6"/>, val: activeUser.mockData.protocols, bg: 'rgba(244, 114, 182, 0.15)' },
    { label: 'Gas Spent', icon: <Zap size={16} color="#fb923c"/>, val: activeUser.mockData.gasSpent, bg: 'rgba(251, 146, 60, 0.15)' },
    { label: 'Models', icon: <BrainCircuit size={16} color="#818cf8"/>, val: activeUser.mockData.modelsDeployed, bg: 'rgba(129, 140, 248, 0.15)' },
    { label: 'Nodes', icon: <Server size={16} color="#2dd4bf"/>, val: activeUser.mockData.nodesRun, bg: 'rgba(45, 212, 191, 0.15)' },
    { label: 'Inferences', icon: <Cpu size={16} color="#a3e635"/>, val: activeUser.mockData.inferTasks, bg: 'rgba(163, 230, 53, 0.15)', highlight: true }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
      {items.map((item, idx) => (
        <motion.div 
          key={idx} 
          whileHover={{ scale: 1.05, y: -4, borderColor: 'rgba(255,255,255,0.2)' }} 
          style={{ 
            background: 'linear-gradient(145deg, var(--grid-bg-1) 0%, var(--grid-bg-2) 100%)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '16px', 
            padding: '0.8rem', 
            display: 'flex', 
            alignItems: 'center',
            gap: '0.8rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            cursor: 'default',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{
            background: item.bg,
            borderRadius: '12px',
            width: '36px',
            height: '36px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
            boxShadow: \`0 0 15px \${item.bg.replace('0.15', '0.4')}\`
          }}>
            {item.icon}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem', whiteSpace: 'nowrap' }}>{item.label}</span>
            <span style={{ fontSize: '1rem', fontFamily: 'monospace', fontWeight: 'bold', color: item.highlight ? 'var(--text-primary)' : 'var(--text-primary)', textShadow: item.highlight ? '0 0 10px rgba(74,222,128,0.5)' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.val}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MetricsGrid;`,

  'OnChainGraph.jsx': `import React from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Network } from 'lucide-react';
import { motion } from 'framer-motion';

const OnChainGraph = ({ graphContainerRef, isSearching, graphData, graphWidth, theme }) => (
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
          ctx.font = \`\${fontSize}px Sans-Serif\`;
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
);

export default OnChainGraph;`,

  'ScoreDisplay.jsx': `import React from 'react';
import { Zap, RefreshCw, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ScoreDisplay = ({ displayedScore, isCalculating, isSearching, isViewingDemo, account, calculateScoreFlow, navigate, activeUser }) => {
  const circumference = 2 * Math.PI * 110;
  const strokeDashoffset = circumference - (displayedScore / 850) * circumference;

  return (
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
      
      {displayedScore > 0 && !isCalculating && !isSearching && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '1rem', width: '80%' }}>
          <button 
            style={{ width: '100%', borderColor: 'var(--neon-purple)', color: 'var(--neon-purple)' }}
            onClick={() => navigate(\`/details/\${activeUser.address}\`, { state: { user: activeUser, score: displayedScore } })}
          >
            View Detailed Breakdown <ArrowRight size={16} />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ScoreDisplay;`,

  'VerificationSteps.jsx': `import React from 'react';
import { Cpu, Database, Award, CheckCircle, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VerificationSteps = ({ calcStep, score, hasCert, liveNodes }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div className="glass-panel" style={{ flex: 1 }}>
      <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontSize: '1.1rem' }}>
        <Cpu size={18} color="var(--neon-purple)"/> Verification
      </h3>
      
      <div style={{ marginTop: '1rem' }}>
        <div className={\`step-item \${(calcStep >= 1 || score > 0) ? 'active' : ''} \${calcStep > 1 || score > 0 ? 'completed' : ''}\`} style={{ marginBottom: '0.8rem', padding: '0.5rem' }}>
          <div className="step-icon" style={{ width: '24px', height: '24px' }}><Database size={14} /></div>
          <div><div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Private Fetch</div></div>
        </div>
        
        <div className={\`step-item \${(calcStep >= 2 || score > 0) ? 'active' : ''} \${calcStep > 2 || score > 0 ? 'completed' : ''}\`} style={{ marginBottom: '0.8rem', padding: '0.5rem' }}>
          <div className="step-icon" style={{ width: '24px', height: '24px' }}><Cpu size={14} /></div>
          <div><div style={{ fontWeight: 600, fontSize: '0.9rem' }}>TEE LLM</div></div>
        </div>

        <div className={\`step-item \${(calcStep >= 3 || score > 0) ? 'active' : ''} \${calcStep > 3 || score > 0 ? 'completed' : ''}\`} style={{ padding: '0.5rem' }}>
          <div className="step-icon" style={{ width: '24px', height: '24px' }}><Award size={14} /></div>
          <div><div style={{ fontWeight: 600, fontSize: '0.9rem' }}>ZKP Mint</div></div>
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
);

export default VerificationSteps;`,

  'TerminalDisplay.jsx': `import React from 'react';
import { TerminalSquare } from 'lucide-react';

const TerminalDisplay = ({ selectedModel, terminalRef, terminalLogs, isCalculating, isSearching }) => (
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
);

export default TerminalDisplay;`
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(componentsDir, filename), content);
}
console.log('Components created!');
