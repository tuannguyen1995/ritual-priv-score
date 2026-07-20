import React from 'react';
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

export default SearchBar;