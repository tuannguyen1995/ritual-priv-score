import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Award, Activity, History, Shield } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Footer from '../components/Footer';
import { playClickSound } from '../utils/audio';

const MOCK_HISTORY = [
  { month: 'Jan', score: 320 },
  { month: 'Feb', score: 450 },
  { month: 'Mar', score: 510 },
  { month: 'Apr', score: 680 },
  { month: 'May', score: 720 },
  { month: 'Jun', score: 850 }
];

const PROTOCOL_BREAKDOWN = [
  { name: 'Uniswap V3', action: 'Liquidity Provision', impact: '+45', color: '#ff007a' },
  { name: 'Aave V3', action: 'Borrowing (Healthy LTV)', impact: '+30', color: '#B6509E' },
  { name: 'Ethereum', action: 'Validator Node', impact: '+80', color: '#627EEA' },
  { name: 'Tornado Cash', action: 'Mixer usage detected', impact: '-50', color: '#ff3366' },
  { name: 'Github', action: 'Smart Contract Commits', impact: '+60', color: '#2b3137' }
];

const ScoreDetails = () => {
  const { address } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(location.state?.user || null);
  const [score, setScore] = useState(location.state?.score || 0);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    // Sync theme
    const checkTheme = setInterval(() => {
      const current = localStorage.getItem('theme') || 'dark';
      if (current !== theme) setTheme(current);
    }, 1000);
    return () => clearInterval(checkTheme);
  }, [theme]);

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>No data found for this address.</h2>
        <button className="primary" onClick={() => { playClickSound(); navigate('/dashboard'); }}>Go Back</button>
      </div>
    );
  }

  // Adjust history final point to match current score
  const historyData = [...MOCK_HISTORY];
  historyData[historyData.length - 1].score = score;

  const handleShare = () => {
    playClickSound();
    const text = `I just analyzed my on-chain footprint on RitualPrivScore!\nMy PrivScore is ${score} / 1000.\nCheck yours at https://ritualprivscore.vercel.app/`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <>
      <header style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => { playClickSound(); navigate('/dashboard'); }} style={{ padding: '0.5rem 1rem' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>Detailed Breakdown</span>
        </div>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '3rem' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass-panel" style={{ height: '350px' }}>
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <History size={20} color="var(--neon-blue)"/> Score Evolution (6 Months)
            </h3>
            <ResponsiveContainer width="100%" height="80%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'} />
                <XAxis dataKey="month" stroke="var(--text-secondary)" />
                <YAxis domain={[0, 1000]} stroke="var(--text-secondary)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="var(--neon-green)" 
                  strokeWidth={3}
                  dot={{ r: 5, fill: 'var(--neon-green)' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-panel">
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <Activity size={20} color="var(--neon-purple)"/> Protocol Interaction Analysis
            </h3>
            <div>
              {PROTOCOL_BREAKDOWN.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: p.color }}></div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.action}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: p.impact.startsWith('+') ? 'var(--neon-green)' : 'var(--neon-red)' }}>
                    {p.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="glass-panel" style={{ textAlign: 'center', position: 'sticky', top: '2rem' }}>
            <Shield size={48} color="var(--neon-blue)" style={{ margin: '0 auto 1rem auto' }} />
            <h2 style={{ margin: '0 0 0.5rem 0' }}>Soulbound Certificate</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Cryptographically verified by Ritual Network
            </p>
            
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(0,184,255,0.1))',
              border: '1px solid var(--neon-purple)',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '2rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}>
                <Award size={150} />
              </div>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--neon-green)', lineHeight: 1, marginBottom: '0.5rem' }}>
                {score}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {address}
              </div>
            </div>

            <button className="primary" style={{ width: '100%' }} onClick={handleShare}>
              <Share2 size={18} /> Share on X
            </button>
          </div>
        </div>

      </motion.div>
      <Footer />
    </>
  );
};

export default ScoreDetails;
