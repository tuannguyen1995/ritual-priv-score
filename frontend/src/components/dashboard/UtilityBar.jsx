import React from 'react';
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

export default UtilityBar;