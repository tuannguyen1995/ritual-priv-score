import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

const RadarProfile = ({ radarData, isSearching, theme }) => (
  <motion.div 
    className="glass-panel-premium" 
    style={{ flex: 1, position: 'relative', minHeight: '300px' }}
    whileHover={{ scale: 1.01 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
  >
    {isSearching && (
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-card)', zIndex: 10, borderRadius: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '90%', height: '90%', borderRadius: '12px' }} className="skeleton-box"></div>
      </div>
    )}
    
    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', color: 'var(--text-primary)' }}>
      <BarChart2 size={20} color="var(--neon-blue)"/> <span className="text-gradient-blue">Radar Risk Profile</span>
    </h3>
    
    <div style={{ width: '100%', height: '250px', filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.2))' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
          <PolarGrid stroke={theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'} />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--neon-purple)', borderRadius: '8px', color: 'var(--text-primary)', boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)' }} itemStyle={{ color: 'var(--neon-purple)' }} />
          <Radar name="Profile" dataKey="A" stroke="var(--neon-purple)" fill="var(--neon-purple)" fillOpacity={0.4} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

export default RadarProfile;