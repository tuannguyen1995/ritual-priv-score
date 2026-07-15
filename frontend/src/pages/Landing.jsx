import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Lock, Zap, Cpu, Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  // Simulated live stats counter
  const [stats, setStats] = useState({ profiles: 12450, attestations: 45210 });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        profiles: prev.profiles + Math.floor(Math.random() * 3),
        attestations: prev.attestations + Math.floor(Math.random() * 5)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: 'center', paddingTop: '4rem', paddingBottom: '4rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Shield color="var(--neon-purple)" size={64} style={{ margin: '0 auto 1.5rem auto' }} />
        <h1 style={{ fontSize: '4.5rem', marginBottom: '1rem', background: 'linear-gradient(135deg, #fff, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          RitualPrivScore
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
          The next generation of credit scoring. Powered by Ritual TEE (Trusted Execution Environment), we calculate your on-chain and off-chain reputation completely privately using LLMs.
        </p>

        <button 
          className="primary" 
          onClick={() => navigate('/dashboard')}
          style={{ padding: '1.2rem 3rem', fontSize: '1.2rem', margin: '0 auto', borderRadius: '50px' }}
        >
          Launch App <ArrowRight size={20} />
        </button>
      </motion.div>

      {/* Live Stats Section */}
      <motion.div 
        style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center', gap: '4rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '2rem 0' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1 }}
      >
        <div className="stat-box">
          <div className="stat-num">{stats.profiles.toLocaleString()}</div>
          <div className="stat-label">Profiles Scored</div>
        </div>
        <div className="stat-box" style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '4rem' }}>
          <div className="stat-num">{stats.attestations.toLocaleString()}</div>
          <div className="stat-label">TEE Attestations</div>
        </div>
        <div className="stat-box" style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '4rem' }}>
          <div className="stat-num">0 ms</div>
          <div className="stat-label">Data Leakage</div>
        </div>
      </motion.div>

      <motion.div 
        className="dashboard-grid" 
        style={{ marginTop: '4rem', gridTemplateColumns: 'repeat(3, 1fr)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}
      >
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <Lock size={32} color="var(--neon-green)" style={{ marginBottom: '1rem' }} />
          <h3>Absolute Privacy</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Your data never leaves the enclave. Raw off-chain metrics are processed securely via Ritual's HTTP and LLM precompiles.</p>
        </div>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <Cpu size={32} color="var(--neon-blue)" style={{ marginBottom: '1rem' }} />
          <h3>Verifiable TEE</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Computations are proven on-chain. Trust math and cryptography, not centralized credit bureaus.</p>
        </div>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <Zap size={32} color="var(--neon-purple)" style={{ marginBottom: '1rem' }} />
          <h3>Soulbound Certificates</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Achieve a high score and mint a non-transferable ERC-721 token representing your robust financial identity.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Landing;
