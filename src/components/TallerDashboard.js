import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE = 'https://taller-dashboard-influ-back-read-on.vercel.app';

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
  return num.toString();
};

const formatNumberNoDecimals = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(0) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
  return Math.round(num).toString();
};

const getCachedData = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/data`);
    return await res.json();
  } catch (e) { return { success: false, error: e.message }; }
};

const getCreatorSnapshots = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/creator-snapshots`);
    return await res.json();
  } catch (e) { return { success: false, error: e.message }; }
};

const getCreatorSnapshotDetails = async (username) => {
  try {
    const res = await fetch(`${API_BASE}/api/creator-snapshots?username=${username}`);
    return await res.json();
  } catch (e) { return { success: false, error: e.message }; }
};

const getInstagramCreatorSnapshots = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/instagram-creator-snapshots`);
    return await res.json();
  } catch (e) { return { success: false, error: e.message }; }
};

const styles = {
  card: { backgroundColor: '#1e293b', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' },
  cardIcon: { fontSize: '28px', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', borderRadius: '10px' },
  cardContent: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 },
  cardLabel: { color: '#94a3b8', fontSize: '12px', fontWeight: '500', margin: 0 },
  cardValue: { fontSize: '22px', fontWeight: '700', color: '#f1f5f9', margin: 0 },
  growthBadge: { fontSize: '13px', fontWeight: '600', padding: '2px 8px', borderRadius: '6px' },
  chartContainer: { background: '#1e293b', padding: '24px', borderRadius: '12px', marginBottom: '20px' },
  chartTitle: { fontSize: '16px', fontWeight: '600', color: '#f1f5f9', margin: '0 0 16px 0' },
  empty: { height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', borderRadius: '8px', color: '#64748b', fontSize: '14px' },
  tableContainer: { background: '#1e293b', padding: '24px', borderRadius: '12px', marginBottom: '20px' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', background: '#0f172a' },
  td: { padding: '14px 16px', borderBottom: '1px solid #334155', color: '#f1f5f9', fontSize: '14px' },
  rankCell: { fontWeight: '700', color: '#60a5fa' },
  badge: { padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' },
  badgeTiktok: { background: '#000', color: 'white' },
  badgeInstagram: { background: '#e1306c', color: 'white' },
};

const StatCard = ({ icon, label, value, change = undefined }) => (
  <div style={styles.card}>
    <div style={styles.cardIcon}>{icon}</div>
    <div style={styles.cardContent}>
      <p style={styles.cardLabel}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <h2 style={styles.cardValue}>{formatNumber(value)}</h2>
        {change !== undefined && change !== 0 && (
          <span style={{ ...styles.growthBadge, background: change > 0 ? '#10b98120' : '#ef444420', color: change > 0 ? '#10b981' : '#ef4444' }}>
            {change > 0 ? '+' : ''}{formatNumberNoDecimals(change)}
          </span>
        )}
      </div>
    </div>
  </div>
);

const Chart = ({ snapshots, timeframe, selectedAccount, platformFilter, creatorMapping }) => {
  const [chartType, setChartType] = useState('area');
  const [creatorChartData, setCreatorChartData] = useState(null);

  useEffect(() => {
    if (selectedAccount && selectedAccount !== 'all') {
      const accountLC = selectedAccount.toLowerCase();
      
      if (platformFilter === 'instagram') {
        const instagramUsername = creatorMapping[accountLC]?.instagram || accountLC;
        const getInstagramCreatorSnapshotDetails = async (username) => {
          try {
            const res = await fetch(`${API_BASE}/api/instagram-creator-snapshots?username=${username}`);
            return await res.json();
          } catch (e) { return { success: false, error: e.message }; }
        };
        getInstagramCreatorSnapshotDetails(instagramUsername).then(r => setCreatorChartData(r.success ? r.data : null));
      } else {
        const tiktokUsername = creatorMapping[accountLC]?.tiktok || accountLC;
        getCreatorSnapshotDetails(tiktokUsername).then(r => setCreatorChartData(r.success ? r.data : null));
      }
    } else setCreatorChartData(null);
  }, [selectedAccount, platformFilter, creatorMapping]);

  if (selectedAccount && selectedAccount !== 'all' && creatorChartData?.dailyGrowth) {
    let chartData = creatorChartData.dailyGrowth.map(d => {
      const viewsValue = d.viewsGrowth !== undefined ? d.viewsGrowth : d.views !== undefined ? d.views : 0;
      const numericViews = typeof viewsValue === 'number' ? viewsValue : (typeof viewsValue === 'string' ? parseFloat(viewsValue) || 0 : 0);
      
      let dateObj = typeof d.date === 'string' ? new Date(d.date) : d.date instanceof Date ? d.date : new Date();
      
      return {
        date: `${dateObj.getMonth() + 1}/${dateObj.getDate()}`,
        views: numericViews,
        fullDate: d.date
      };
    });

    chartData.sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    if (timeframe === '1') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      chartData = chartData.filter(d => {
        if (!d.fullDate) return false;
        const dataDate = new Date(d.fullDate);
        if (isNaN(dataDate.getTime())) return false;
        dataDate.setHours(0, 0, 0, 0);
        return dataDate >= yesterday && dataDate <= now;
      });
    } else if (timeframe === '7') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      chartData = chartData.filter(d => {
        if (!d.fullDate) return false;
        const dataDate = new Date(d.fullDate);
        if (isNaN(dataDate.getTime())) return false;
        dataDate.setHours(0, 0, 0, 0);
        return dataDate >= sevenDaysAgo && dataDate <= now;
      });
    } else if (timeframe === '30') {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      chartData = chartData.filter(d => {
        if (!d.fullDate) return false;
        const dataDate = new Date(d.fullDate);
        if (isNaN(dataDate.getTime())) return false;
        dataDate.setHours(0, 0, 0, 0);
        return dataDate >= thirtyDaysAgo && dataDate <= now;
      });
    }

    return (
      <div style={styles.chartContainer}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ ...styles.chartTitle, margin: 0 }}>📈 Daily View Growth</h3>
          <div style={{ display: 'flex', background: '#0f172a', borderRadius: '8px', padding: '4px', gap: '4px' }}>
            {['area', 'bar'].map(t => (
              <button key={t} onClick={() => setChartType(t)} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', background: chartType === t ? '#10b981' : 'transparent', color: chartType === t ? '#000' : '#94a3b8' }}>{t === 'area' ? 'Line' : 'Bar'}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width='100%' height={300}>
          {chartType === 'area' ? (
            <AreaChart data={chartData}>
              <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.05)' />
              <XAxis dataKey='date' stroke='rgba(255,255,255,0.1)' tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke='rgba(255,255,255,0.1)' tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={formatNumber} />
              <Tooltip content={({ active, payload }) => active && payload?.length ? (
                <div style={{ background: '#1e293b', borderRadius: '8px', padding: '12px' }}>
                  <p style={{ margin: 0, color: '#f1f5f9', fontWeight: '600', fontSize: '12px' }}>{payload[0].payload.date}</p>
                  <p style={{ margin: '4px 0 0 0', color: '#10b981', fontWeight: '700', fontSize: '12px' }}>{payload[0].value > 0 ? '+' : ''}{formatNumber(payload[0].value)} views</p>
                </div>
              ) : null} />
              <Area type='monotone' dataKey='views' stroke='#10b981' strokeWidth={3} fill='url(#cg)' />
            </AreaChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.05)' />
              <XAxis dataKey='date' stroke='rgba(255,255,255,0.1)' tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke='rgba(255,255,255,0.1)' tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={formatNumber} />
              <Tooltip content={({ active, payload }) => active && payload?.length ? (
                <div style={{ background: '#1e293b', borderRadius: '8px', padding: '12px' }}>
                  <p style={{ margin: 0, color: '#f1f5f9', fontWeight: '600', fontSize: '12px' }}>{payload[0].payload.date}</p>
                  <p style={{ margin: '4px 0 0 0', color: '#10b981', fontWeight: '700', fontSize: '12px' }}>{payload[0].value > 0 ? '+' : ''}{formatNumber(payload[0].value)} views</p>
                </div>
              ) : null} />
              <Bar dataKey='views' fill='#10b981' radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  }

  return <div style={styles.chartContainer}><h3 style={styles.chartTitle}>📈 Daily View Growth</h3><div style={styles.empty}>No data yet</div></div>;
};

export default function TallerDashboard() {
  const { username: urlUsername } = useParams();
  const navigate = useNavigate();

  const [allCreators, setAllCreators] = useState([]);
  const [filteredStats, setFilteredStats] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [validUsername, setValidUsername] = useState(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState('all');
  const [snapshots, setSnapshots] = useState([]);
  const [creatorSnapshotsData, setCreatorSnapshotsData] = useState([]);
  const [instagramCreatorSnapshotsData, setInstagramCreatorSnapshotsData] = useState([]);
  const [creatorMapping, setCreatorMapping] = useState({});

  const filterTallerVideos = (video, username) => {
    const uLC = username?.toLowerCase() || '';
    const dLC = video.description?.toLowerCase() || '';
    return uLC.includes('taller') || dLC.includes('taller') || dLC.includes('heightprediction');
  };

  const filterStatsByDate = (stats, days) => {
    if (days === 'all') return stats;
    const now = new Date();
    return stats.map(c => {
      let filtered;
      if (days === 'current_month') {
        filtered = c.videos.filter(v => {
          const d = new Date(v.date);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
      } else {
        const daysAgo = new Date(now.getTime() - (parseInt(days) * 86400000));
        filtered = c.videos.filter(v => new Date(v.date) >= daysAgo);
      }
      return {
        ...c,
        videos: filtered,
        publishedVideos: filtered.length,
        views: filtered.reduce((s, v) => s + (v.views || 0), 0),
        likes: filtered.reduce((s, v) => s + (v.likes || 0), 0),
        comments: filtered.reduce((s, v) => s + (v.comments || 0), 0)
      };
    }).filter(c => c.publishedVideos > 0);
  };

  const updateData = (data) => {
    const stats = (data.stats || []).filter(s => s.username && s.username !== 'null');
    const filtered = stats.map(c => {
      const tallerVideos = c.videos.filter(v => filterTallerVideos(v, c.username));
      return {
        ...c,
        videos: tallerVideos,
        publishedVideos: tallerVideos.length,
        views: tallerVideos.reduce((s, v) => s + (v.views || 0), 0),
        likes: tallerVideos.reduce((s, v) => s + (v.likes || 0), 0),
        comments: tallerVideos.reduce((s, v) => s + (v.comments || 0), 0)
      };
    }).filter(c => c.publishedVideos > 0);
    
    // Create mapping of main username to platform-specific usernames
    const mapping = {};
    stats.forEach(s => {
      mapping[s.username.toLowerCase()] = {
        tiktok: s.tiktok?.toLowerCase(),
        instagram: s.instagram?.toLowerCase()
      };
    });
    
    setAllCreators(filtered);
    setAccounts(filtered.map(s => s.username).sort());
    setCreatorMapping(mapping);
  };

  const loadCachedData = async () => {
    try {
      const result = await getCachedData();
      if (result.success && result.data) updateData(result.data);
    } catch (e) {}
  };

  const loadSnapshots = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/snapshots`);
      const result = await res.json();
      if (result.success && result.data) setSnapshots(result.data);
    } catch (e) {}
  };

  const loadCreatorSnapshots = async () => {
    try {
      const result = await getCreatorSnapshots();
      if (result.success && result.data) setCreatorSnapshotsData(result.data);
    } catch (e) {}
  };

  const loadInstagramCreatorSnapshots = async () => {
    try {
      const result = await getInstagramCreatorSnapshots();
      if (result.success && result.data) setInstagramCreatorSnapshotsData(result.data);
    } catch (e) {}
  };

  const applyFilters = () => {
    if (!allCreators.length) return;

    let tallerOnlyStats = allCreators;
    let dateFiltered = filterStatsByDate(tallerOnlyStats, selectedDateFilter);
    let accountFiltered = !validUsername ? dateFiltered : dateFiltered.filter(s => s.username.toLowerCase() === validUsername.toLowerCase());
    
    let filtered = accountFiltered;
    if (selectedPlatformFilter !== 'all') {
      filtered = accountFiltered.map(c => {
        const platformVideos = c.videos.filter(v => v.platform === selectedPlatformFilter);
        return {
          ...c,
          videos: platformVideos,
          publishedVideos: platformVideos.length,
          views: platformVideos.reduce((s, v) => s + (v.views || 0), 0),
          likes: platformVideos.reduce((s, v) => s + (v.likes || 0), 0),
          comments: platformVideos.reduce((s, v) => s + (v.comments || 0), 0)
        };
      }).filter(c => c.publishedVideos > 0);
    }

    setFilteredStats(filtered);

    const global = filtered.reduce((acc, c) => {
      acc.publishedVideos += c.publishedVideos;
      acc.views += c.views;
      acc.likes += c.likes;
      acc.comments += c.comments;
      return acc;
    }, { publishedVideos: 0, views: 0, likes: 0, comments: 0 });

    let dailyViewsChange = 0;
    if (validUsername) {
      const usernameLC = validUsername.toLowerCase();
      if (selectedPlatformFilter === 'all') {
        const tiktokUsername = creatorMapping[usernameLC]?.tiktok || usernameLC;
        const instagramUsername = creatorMapping[usernameLC]?.instagram || usernameLC;
        const tiktokGrowth = creatorSnapshotsData.find(c => c.username.toLowerCase() === tiktokUsername)?.todayGrowth || 0;
        const instagramGrowth = instagramCreatorSnapshotsData.find(c => c.username.toLowerCase() === instagramUsername)?.todayGrowth || 0;
        dailyViewsChange = tiktokGrowth + instagramGrowth;
      } else if (selectedPlatformFilter === 'tiktok') {
        const tiktokUsername = creatorMapping[usernameLC]?.tiktok || usernameLC;
        dailyViewsChange = creatorSnapshotsData.find(c => c.username.toLowerCase() === tiktokUsername)?.todayGrowth || 0;
      } else if (selectedPlatformFilter === 'instagram') {
        const instagramUsername = creatorMapping[usernameLC]?.instagram || usernameLC;
        dailyViewsChange = instagramCreatorSnapshotsData.find(c => c.username.toLowerCase() === instagramUsername)?.todayGrowth || 0;
      }
    }

    setGlobalStats({ ...global, dailyViewsChange });
  };

  const extractUsername = (input) => {
    let username = input.trim();
    const tiktokUrlMatch = username.match(/tiktok\.com\/@([^\/\?]+)/i);
    if (tiktokUrlMatch) username = tiktokUrlMatch[1];
    if (username.startsWith('@')) username = username.substring(1).trim();
    return username;
  };

  const handleSearch = () => {
    const username = extractUsername(searchUsername);
    if (!username) return;

    const found = accounts.find(a => a.toLowerCase() === username.toLowerCase());
    if (found) {
      setValidUsername(found);
      setSearchUsername(found);
      navigate(`/${found}`);
    } else {
      setValidUsername(null);
    }
  };

  useEffect(() => { loadCachedData(); loadSnapshots(); loadCreatorSnapshots(); loadInstagramCreatorSnapshots(); }, []);

  // Handle URL username parameter
  useEffect(() => {
    if (urlUsername && accounts.length > 0) {
      const found = accounts.find(a => a.toLowerCase() === urlUsername.toLowerCase());
      if (found) {
        setValidUsername(found);
        setSearchUsername(found);
      }
    }
  }, [urlUsername, accounts]);
  
  useEffect(() => {
    if (accounts.length > 0 && searchUsername.trim() && !validUsername) {
      const username = extractUsername(searchUsername);
      if (username) {
        const found = accounts.find(a => a.toLowerCase() === username.toLowerCase());
        if (found) {
          setValidUsername(found);
          setSearchUsername(found);
        }
      }
    }
  }, [accounts, searchUsername, validUsername]);
  
  useEffect(() => { applyFilters(); }, [validUsername, selectedDateFilter, selectedPlatformFilter, allCreators, creatorSnapshotsData, instagramCreatorSnapshotsData, creatorMapping]);

  if (!validUsername) {
    return (
      <div style={{ minHeight: '100vh', padding: '0', margin: '0', background: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '600px', padding: '20px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '600', color: '#f1f5f9', marginBottom: '40px', marginTop: 0 }}>Taller Analytics</h1>
          <div style={{ width: '100%' }}>
            <input
              type="text"
              placeholder="Enter your tiktok username"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={{
                width: '100%',
                padding: '16px 24px',
                border: '2px solid #334155',
                borderRadius: '24px',
                fontSize: '16px',
                outline: 'none',
                background: '#1e293b',
                color: '#f1f5f9',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
              }}
            />
            {searchUsername.trim() && accounts.length > 0 && (() => {
              const username = extractUsername(searchUsername);
              return username && !accounts.find(a => a.toLowerCase() === username.toLowerCase());
            })() && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '12px', marginBottom: 0 }}>
                Username not found. Please check your spelling.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Collect all videos from all creators
  const getAllVideos = () => {
    const allVideos = [];
    allCreators.forEach(creator => {
      creator.videos.forEach(video => {
        allVideos.push({
          ...video,
          username: creator.username
        });
      });
    });
    return allVideos.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  };

  const topVideos = getAllVideos();

  return (
    <div style={{ minHeight: '100vh', padding: '0', margin: '0', background: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ maxWidth: '100%', padding: '20px' }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#f1f5f9', margin: 0 }}>{validUsername} Analytics</h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={selectedDateFilter} onChange={(e) => setSelectedDateFilter(e.target.value)} style={{ padding: '10px 16px', border: '1px solid #334155', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#1e293b', color: '#f1f5f9', cursor: 'pointer' }}>
              <option value='1'>Last 24 hours</option>
              <option value='7'>Last 7 days</option>
              <option value='30'>Last 30 days</option>
              <option value='all'>All time</option>
            </select>
            <select value={selectedPlatformFilter} onChange={(e) => setSelectedPlatformFilter(e.target.value)} style={{ padding: '10px 16px', border: '1px solid #334155', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#1e293b', color: '#f1f5f9', cursor: 'pointer' }}>
              <option value='all'>All Platforms</option>
              <option value='tiktok'>TikTok</option>
              <option value='instagram'>Instagram</option>
            </select>
          </div>
        </div>

        {globalStats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '20px' }}>
            <StatCard icon="📹" label="Total Videos" value={globalStats.publishedVideos} />
            <StatCard icon="👁️" label="Total Views" value={globalStats.views} change={globalStats.dailyViewsChange} />
            <StatCard icon="👍" label="Total Likes" value={globalStats.likes} />
            <StatCard icon="💬" label="Total Comments" value={globalStats.comments} />
          </div>
        )}

        <Chart snapshots={snapshots} timeframe={selectedDateFilter} selectedAccount={validUsername} platformFilter={selectedPlatformFilter} creatorMapping={creatorMapping} />
        
        {topVideos.length > 0 && (
          <div style={styles.tableContainer}>
            <h3 style={styles.chartTitle}>🏆 Top 5 Videos (Overall Views)</h3>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Rank</th>
                    <th style={styles.th}>Creator</th>
                    <th style={styles.th}>Platform</th>
                    <th style={styles.th}>Description</th>
                    <th style={styles.th}>Views</th>
                    <th style={styles.th}>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {topVideos.map((video, i) => (
                    <tr key={i}>
                      <td style={{ ...styles.td, ...styles.rankCell }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</td>
                      <td style={styles.td}>
                        <a href={`https://www.tiktok.com/@${video.username}`} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: '600' }}>@{video.username}</a>
                      </td>
                      <td style={styles.td}><span style={{ ...styles.badge, ...(video.platform === 'tiktok' ? styles.badgeTiktok : styles.badgeInstagram) }}>{video.platform?.toUpperCase()}</span></td>
                      <td style={styles.td}><div style={{ maxWidth: '300px', color: '#cbd5e1', fontSize: '13px' }}>{video.description?.slice(0, 80) || 'No description'}</div></td>
                      <td style={styles.td}><strong>{formatNumber(video.views || 0)}</strong></td>
                      <td style={styles.td}>{video.url ? <a href={video.url} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: '600' }}>View 🔗</a> : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredStats.length > 0 && filteredStats[0].videos && filteredStats[0].videos.length > 0 && (
          <>
            <div style={styles.tableContainer}>
              <h3 style={styles.chartTitle}>🔥 Your Top 5 Videos</h3>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Rank</th>
                      <th style={styles.th}>Platform</th>
                      <th style={styles.th}>Description</th>
                      <th style={styles.th}>Views</th>
                      <th style={styles.th}>Likes</th>
                      <th style={styles.th}>Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStats[0].videos.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map((v, i) => (
                      <tr key={i}>
                        <td style={{ ...styles.td, ...styles.rankCell }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</td>
                        <td style={styles.td}><span style={{ ...styles.badge, ...(v.platform === 'tiktok' ? styles.badgeTiktok : styles.badgeInstagram) }}>{v.platform?.toUpperCase()}</span></td>
                        <td style={styles.td}><div style={{ maxWidth: '300px', color: '#cbd5e1', fontSize: '13px' }}>{v.description?.slice(0, 80) || 'No description'}</div></td>
                        <td style={styles.td}><strong>{formatNumber(v.views || 0)}</strong></td>
                        <td style={styles.td}><strong>{formatNumber(v.likes || 0)}</strong></td>
                        <td style={styles.td}>{v.url ? <a href={v.url} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: '600' }}>View 🔗</a> : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={styles.tableContainer}>
              <h3 style={styles.chartTitle}>📹 All Your Videos ({filteredStats[0].videos.length})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {filteredStats[0].videos.sort((a, b) => (b.views || 0) - (a.views || 0)).map((v, vi) => (
                  <div key={vi} style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ ...styles.badge, ...(v.platform === 'tiktok' ? styles.badgeTiktok : styles.badgeInstagram) }}>{v.platform?.toUpperCase()}</span>
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '12px', marginBottom: '8px', maxHeight: '40px', overflow: 'hidden' }}>{v.description || 'No description'}</div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>
                      <span>👁️ {formatNumber(v.views || 0)}</span>
                      <span>👍 {formatNumber(v.likes || 0)}</span>
                      <span>💬 {formatNumber(v.comments || 0)}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>{v.date ? new Date(v.date).toLocaleDateString() : ''}</div>
                    {v.url && <a href={v.url} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '12px', fontWeight: '600' }}>View 🔗</a>}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}