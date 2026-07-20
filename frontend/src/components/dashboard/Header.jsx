import React from 'react';
import { Shield, Cpu, Moon, Sun, Home, Search, Wallet, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { playClickSound } from '../../utils/audio';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header = ({ theme, toggleTheme, audioOn, toggleAudio, isViewingDemo, selectedModel, setSelectedModel, RITUAL_MODELS, isCalculating, isSearching, account, disconnectWallet, switchToMyWallet }) => {
  return (
    <header style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Shield color="var(--neon-purple)" size={28} />
        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>RitualPrivScore</span>
      </Link>
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: 'auto', flexWrap: 'wrap' }}>
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
            title="Click to search an address"
          >
            <Search size={16} /> Explorer Mode
          </div>
        ) : (
          <div 
            onClick={() => {
              playClickSound();
              if (account) switchToMyWallet(account);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--neon-green)', background: 'rgba(0,255,163,0.1)', padding: '0.5rem 1rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
            title="View your connected wallet"
          >
            <Wallet size={16} /> My Wallet Connected
          </div>
        )}
        
        <ConnectButton showBalance={false} chainStatus="icon" />
      </div>
    </header>
  );
};

export default Header;
