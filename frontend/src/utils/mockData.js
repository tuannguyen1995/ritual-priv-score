export const RITUAL_MODELS = [
  { id: 'llama-3-8b', name: 'Ritual-Llama-3 (Balanced)', hash: '0x8f3c...9a12' },
  { id: 'mistral-7b', name: 'Mistral-7B-DeFi-Expert', hash: '0x2b1e...f4cc' },
  { id: 'grok-alpha', name: 'Grok-Alpha (Social)', hash: '0x5d9a...1b8e' }
];

export const TRENDING_PROFILES = [
  { 
    name: "vitalik.eth", 
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", 
    mockData: { age: "8.5 Years", commits: "15,320", social: "Legendary", tx: "24,500 ETH", protocols: "214", gasSpent: "1,240 ETH", modelsDeployed: "12", nodesRun: "3", inferTasks: "14,200", expectedScore: 990 },
    metrics: { onChain: 99, social: 99, financial: 99, nft: 85, sybilScore: 99 },
    aiAnalysis: "LLM Analysis: Verified Ethereum co-founder. Massive on-chain footprint and unmatched developer activity. High involvement in foundational protocols. Sybil risk: 0%."
  },
  { 
    name: "justinsun.eth", 
    address: "0x3DdfA8eC3052539b6C9549F12cEA2C295cfF5296", 
    mockData: { age: "6.1 Years", commits: "24", social: "High", tx: "1.2M ETH", protocols: "45", gasSpent: "3,420 ETH", modelsDeployed: "0", nodesRun: "0", inferTasks: "105", expectedScore: 850 },
    metrics: { onChain: 90, social: 85, financial: 99, nft: 60, sybilScore: 90 },
    aiAnalysis: "LLM Analysis: Known crypto founder / whale. Extremely high volume financial transactions across DeFi. Low GitHub commits but massive liquidity provision. Sybil risk: 2%."
  },
  { 
    name: "jaredfromsubway.eth", 
    address: "0xae2Fc483527B8EF99EB5D9B44875F005ba1FaE13", 
    mockData: { age: "1.2 Years", commits: "0", social: "Infamous", tx: "840k ETH", protocols: "12", gasSpent: "45,000 ETH", modelsDeployed: "1", nodesRun: "10", inferTasks: "2.4M", expectedScore: 610 },
    metrics: { onChain: 85, social: 20, financial: 95, nft: 5, sybilScore: 50 },
    aiAnalysis: "LLM Analysis: Highly active MEV bot operator. Exceptional transaction frequency and gas consumption. Zero social or standard protocol interaction. Flagged for bot-like behavior. Sybil risk: 85%."
  },
  { 
    name: "ai-researcher.eth", 
    address: "0x892555E75350E11f2058d086C72b9C94C9493d72", 
    mockData: { age: "2.4 Years", commits: "4,210", social: "Medium", tx: "45 ETH", protocols: "18", gasSpent: "2.1 ETH", modelsDeployed: "42", nodesRun: "15", inferTasks: "850,000", expectedScore: 880 },
    metrics: { onChain: 75, social: 60, financial: 40, nft: 30, sybilScore: 95 },
    aiAnalysis: "LLM Analysis: Dedicated AI agent developer. Massive usage of compute nodes and inference tasks on Ritual network. High commit frequency. Sybil risk: 5%."
  }
];

export const LEADERBOARD_DATA = [
  { address: "vitalik.eth", score: 950, rank: "S", time: "2 mins ago" },
  { address: "0x7a2...3f1c", score: 890, rank: "S", time: "1 hour ago" },
  { address: "0x111...1111", score: 820, rank: "A", time: "3 hours ago" },
  { address: "0x9b4...2e8a", score: 715, rank: "A", time: "5 hours ago" },
  { address: "0x333...3333", score: 400, rank: "C", time: "1 day ago" },
];

export const generateDeterministicMockData = (address) => {
  // A simple seeded random based on address hash (rudimentary)
  const seedStr = address.toLowerCase();
  let seed = 0;
  for(let i=0; i<seedStr.length; i++){
    seed += seedStr.charCodeAt(i);
  }
  
  const random = () => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const score = Math.floor(random() * 400 + 450); // 450-850 range for real connected wallets
  
  return {
    name: "Connected Wallet",
    address: address,
    mockData: {
      age: (random() * 4 + 0.1).toFixed(1) + " Years",
      commits: Math.floor(random() * 300).toString(),
      social: ["Low", "Neutral", "Good", "High"][Math.floor(random() * 4)],
      tx: (random() * 50).toFixed(1) + " ETH",
      protocols: Math.floor(random() * 25).toString(),
      gasSpent: (random() * 2).toFixed(2) + " ETH",
      modelsDeployed: Math.floor(random() * 3).toString(),
      nodesRun: Math.floor(random() * 2).toString(),
      inferTasks: Math.floor(random() * 1500).toString(),
      expectedScore: score
    },
    metrics: {
      onChain: Math.floor(random() * 50 + 40),
      social: Math.floor(random() * 50 + 20),
      financial: Math.floor(random() * 60 + 30),
      nft: Math.floor(random() * 40 + 10),
      sybilScore: Math.floor(random() * 60 + 30)
    },
    aiAnalysis: "LLM Analysis: Verified custom wallet signature. Normal transaction frequency with varying smart contract interaction. Acceptable risk profile detected."
  };
};

export const generateGraphData = (seedName) => {
  const nodes = [{ id: 'wallet', name: seedName, val: 12, color: '#00FFA3' }];
  const links = [];
  const protocols = ['Uniswap', 'Aave', 'Compound', 'OpenSea', 'Blur', 'Lido', 'Maker'];
  
  protocols.forEach((p, i) => {
    nodes.push({ id: p, name: p, val: 5, color: '#8B5CF6' });
    links.push({ source: 'wallet', target: p });
    if (Math.random() > 0.3) {
      const subId = `${p}_pool_${i}`;
      nodes.push({ id: subId, name: `${p} Pool`, val: 3, color: '#00B8FF' });
      links.push({ source: p, target: subId });
      if (Math.random() > 0.5) links.push({ source: 'wallet', target: subId });
    }
  });
  return { nodes, links };
};
