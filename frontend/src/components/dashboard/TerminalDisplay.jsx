import React from 'react';
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

export default TerminalDisplay;