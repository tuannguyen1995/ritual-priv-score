import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Hexagon, ArrowRight, Lock, Zap, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const Landing = () => {
  const navigate = useNavigate();
  const [init, setInit] = useState(false);
  const [stats, setStats] = useState({ profiles: 12450, attestations: 45210 });

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });

    const interval = setInterval(() => {
      setStats(prev => ({
        profiles: prev.profiles + Math.floor(Math.random() * 3),
        attestations: prev.attestations + Math.floor(Math.random() * 5)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const particlesOptions = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 120,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push",
          },
          onHover: {
            enable: true,
            mode: "grab",
          },
        },
        modes: {
          push: {
            quantity: 4,
          },
          grab: {
            distance: 150,
            links: {
              opacity: 1,
            }
          },
        },
      },
      particles: {
        color: {
          value: ["#00B8FF", "#8B5CF6", "#00FFA3"],
        },
        links: {
          color: "#8B5CF6",
          distance: 150,
          enable: true,
          opacity: 0.3,
          width: 1,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "bounce",
          },
          random: false,
          speed: 1,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            width: 1000,
            height: 1000,
          },
          value: 100,
        },
        opacity: {
          value: 0.5,
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 3 },
        },
      },
      detectRetina: true,
    }),
    [],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      
      {/* Background Particles */}
      {init && (
        <Particles
          id="tsparticles"
          options={particlesOptions}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1
          }}
        />
      )}

      <div style={{ textAlign: 'center', paddingTop: '4rem', paddingBottom: '4rem', flex: 1, zIndex: 1 }}>
        
        {/* Animated Hero 3D Core */}
        <motion.div
          style={{
            position: 'relative',
            width: '160px',
            height: '160px',
            margin: '0 auto 2rem auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, type: "spring" }}
        >
          {/* Glowing Orbits */}
          <motion.div
            style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '2px dashed var(--neon-blue)', opacity: 0.5 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            style={{ position: 'absolute', width: '130%', height: '130%', borderRadius: '50%', border: '1px solid var(--neon-purple)', opacity: 0.3 }}
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
          
          {/* The Core */}
          <motion.div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-purple))',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px var(--neon-purple)'
            }}
            animate={{
              boxShadow: ['0 0 20px var(--neon-purple)', '0 0 60px var(--neon-blue)', '0 0 20px var(--neon-purple)'],
              scale: [1, 1.05, 1],
              borderRadius: ['20px', '50%', '20px']
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Shield color="white" size={40} />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
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
          style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center', gap: '4rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '2rem 0', background: 'rgba(11, 14, 20, 0.5)', backdropFilter: 'blur(10px)' }}
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

      <Footer />
    </div>
  );
};

export default Landing;
