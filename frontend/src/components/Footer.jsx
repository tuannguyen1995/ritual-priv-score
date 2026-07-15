import React from 'react';
import { Shield, ExternalLink, Code, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-brand">
          <Shield color="var(--neon-purple)" size={24} />
          <span className="footer-logo">RitualPrivScore</span>
        </div>
        
        <p className="footer-description">
          The first TEE-Powered Private Credit Scoring Agent built on the Ritual Testnet (Chain ID 1979). 
          We calculate on-chain and off-chain reputation completely privately using Large Language Models inside Enclaves.
        </p>

        <div className="footer-links">
          <a href="https://ritual.net" target="_blank" rel="noreferrer" className="footer-link">
            <ExternalLink size={14} /> About Ritual
          </a>
          <a href="https://docs.ritual.net" target="_blank" rel="noreferrer" className="footer-link">
            <ExternalLink size={14} /> TEE Docs
          </a>
          <a href="https://twitter.com/ritualnet" target="_blank" rel="noreferrer" className="footer-link">
            <Globe size={14} /> @ritualnet
          </a>
        </div>
        
        <div className="footer-copyright">
          &copy; {new Date().getFullYear()} RitualPrivScore. This is a hackathon project.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
