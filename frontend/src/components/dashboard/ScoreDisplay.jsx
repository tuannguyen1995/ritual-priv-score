import React from 'react';
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
            onClick={() => navigate(`/details/${activeUser.address}`, { state: { user: activeUser, score: displayedScore } })}
          >
            View Detailed Breakdown <ArrowRight size={16} />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ScoreDisplay;