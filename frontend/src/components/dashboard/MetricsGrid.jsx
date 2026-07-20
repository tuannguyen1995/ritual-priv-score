import React from 'react';
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
            boxShadow: `0 0 15px ${item.bg.replace('0.15', '0.4')}`
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

export default MetricsGrid;