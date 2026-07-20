import React from 'react';
import { Cpu, Database, Award, CheckCircle, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VerificationSteps = ({ calcStep, score, hasCert, liveNodes }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div className="glass-panel" style={{ flex: 1 }}>
      <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontSize: '1.1rem' }}>
        <Cpu size={18} color="var(--neon-purple)"/> Verification
      </h3>
      
      <div style={{ marginTop: '1rem' }}>
        <div className={`step-item ${(calcStep >= 1 || score > 0) ? 'active' : ''} ${calcStep > 1 || score > 0 ? 'completed' : ''}`} style={{ marginBottom: '0.8rem', padding: '0.5rem' }}>
          <div className="step-icon" style={{ width: '24px', height: '24px' }}><Database size={14} /></div>
          <div><div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Private Fetch</div></div>
        </div>
        
        <div className={`step-item ${(calcStep >= 2 || score > 0) ? 'active' : ''} ${calcStep > 2 || score > 0 ? 'completed' : ''}`} style={{ marginBottom: '0.8rem', padding: '0.5rem' }}>
          <div className="step-icon" style={{ width: '24px', height: '24px' }}><Cpu size={14} /></div>
          <div><div style={{ fontWeight: 600, fontSize: '0.9rem' }}>TEE LLM</div></div>
        </div>

        <div className={`step-item ${(calcStep >= 3 || score > 0) ? 'active' : ''} ${calcStep > 3 || score > 0 ? 'completed' : ''}`} style={{ padding: '0.5rem' }}>
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

export default VerificationSteps;