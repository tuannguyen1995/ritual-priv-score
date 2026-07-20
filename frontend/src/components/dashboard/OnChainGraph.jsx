import React from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Network } from 'lucide-react';
import { motion } from 'framer-motion';

const OnChainGraph = ({ graphContainerRef, isSearching, graphData, graphWidth, theme }) => (
  <motion.div 
    ref={graphContainerRef}
    className="glass-panel-premium" 
    style={{ position: 'relative', overflow: 'hidden', padding: 0, height: '300px' }}
    whileHover={{ scale: 1.01 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
  >
    <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.5rem 1rem', borderRadius: '50px', border: '1px solid var(--border-color)', backdropFilter: 'blur(5px)' }}>
      <Network size={16} color="var(--neon-purple)" />
      <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>On-chain Footprint</span>
    </div>
    {isSearching ? (
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-card)', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '80%', height: '80%', borderRadius: '12px' }} className="skeleton-box"></div>
      </div>
    ) : (
      <ForceGraph2D
        graphData={graphData}
        width={graphWidth}
        height={300}
        backgroundColor="transparent"
        nodeRelSize={6}
        linkColor={() => theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.01}
        linkDirectionalParticleWidth={2}
        enableZoomPanInteraction={false}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = node.color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
          ctx.fill();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = theme === 'light' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)';
          ctx.fillText(label, node.x, node.y + node.val + (fontSize));
        }}
      />
    )}
  </motion.div>
);

export default OnChainGraph;