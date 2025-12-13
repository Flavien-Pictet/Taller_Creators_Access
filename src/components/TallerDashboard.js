import React, { useState, useEffect } from 'react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE = 'https://taller-dashboard-influ-back.vercel.app';

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

const formatCurrency = (num) => '$' + num.toFixed(2);

const calculateInfluencerCost = (creator) => {
  const costPerVideo = parseFloat(creator.costPerVideo?.replace('$', '') || 0);
  const cpm = parseFloat(creator.cpm?.replace('$', '') || 0);
  const bonusEligible = creator.bonusEligibility?.toLowerCase() === 'yes';

  let videosToCount = creator.videos || [];

  if (creator.contractHasChanged && creator.contractChangedDate) {
    try {
      const [month, day, year] = creator.contractChangedDate.split('/');
      const contractDate = new Date(year, month - 1, day);
      contractDate.setHours(0, 0, 0, 0);
      videosToCount = creator.videos.filter(v => new Date(v.date) >= contractDate);
    } catch (e) {}
  }

  // Séparer TikTok et Instagram
  const tiktokVideos = videosToCount.filter(v => v.platform === 'tiktok');
  const instagramVideos = videosToCount.filter(v => v.platform === 'instagram');

  const tiktokViews = tiktokVideos.reduce((sum, v) => sum + (v.views || 0), 0);
  const instagramViews = instagramVideos.reduce((sum, v) => sum + (v.views || 0), 0);
  const totalViews = tiktokViews + instagramViews;

  // TikTok: costPerVideo + CPM selon contrat
  const tiktokBaseCost = tiktokVideos.length * costPerVideo;
  const tiktokCpmCost = (tiktokViews / 1000) * cpm;
  const tiktokCost = tiktokBaseCost + tiktokCpmCost;

  // Instagram: CPM fixe $1 (pas de cost per video)
  const instagramCpm = 1;
  const instagramCost = (instagramViews / 1000) * instagramCpm;

  // Bonus basé sur les vues totales (TikTok + Instagram)
  let bonus = 0;
  if (bonusEligible) {
    if (totalViews >= 1500000) bonus = 600;
    else if (totalViews >= 1000000) bonus = 400;
    else if (totalViews >= 500000) bonus = 200;
  }

  const total = tiktokCost + instagramCost + bonus;

  return {
    total,
    tiktokCost,
    instagramCost,
    bonus,
    tiktokViews,
    instagramViews,
    tiktokVideos: tiktokVideos.length,
    instagramVideos: instagramVideos.length,
    breakdown: `TikTok: ${formatCurrency(tiktokCost)} | Instagram: ${formatCurrency(instagramCost)}${bonus > 0 ? ` | Bonus: ${formatCurrency(bonus)}` : ''}`,
    videosUsed: videosToCount.length,
    viewsUsed: totalViews
  };
};

// API Functions
const fetchData = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/fetch`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    return await res.json();
  } catch (e) { return { success: false, error: e.message }; }
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

// Instagram API Functions
const getInstagramCreatorSnapshots = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/instagram-creator-snapshots`);
    return await res.json();
  } catch (e) { return { success: false, error: e.message }; }
};

const getInstagramCreatorSnapshotDetails = async (username) => {
  try {
    const res = await fetch(`${API_BASE}/api/instagram-creator-snapshots?username=${username}`);
    return await res.json();
  } catch (e) { return { success: false, error: e.message }; }
};

// Styles
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
  dealBadge: { padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', background: '#334155', color: '#cbd5e1' },
  contractChangedBadge: { padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', background: '#2c80ce', color: '#fff', marginLeft: '8px' },
  activityBadge: { padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', marginLeft: '8px' },
  activityGreen: { background: '#10b981', color: '#fff' },
  activityOrange: { background: '#f59e0b', color: '#fff' },
  activityRed: { background: '#ef4444', color: '#fff' },
  warningBadge: { padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', background: '#ef4444', color: '#fff', marginLeft: '8px' },
};

// StatCard Component
const StatCard = ({ icon, label, value, change = undefined, isCurrency = false }) => (
    <div style={styles.card}>
      <div style={styles.cardIcon}>{icon}</div>
      <div style={styles.cardContent}>
        <p style={styles.cardLabel}>{label}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <h2 style={styles.cardValue}>{isCurrency ? formatCurrency(value) : formatNumber(value)}</h2>
          {change !== undefined && change !== 0 && (
          <span style={{ ...styles.growthBadge, background: change > 0 ? '#10b98120' : '#ef444420', color: change > 0 ? '#10b981' : '#ef4444' }}>
              {change > 0 ? '+' : ''}{isCurrency ? formatCurrency(change) : formatNumberNoDecimals(change)}
            </span>
          )}
        </div>
      </div>
    </div>
  );

// TopPerformers Component
const TopPerformers = ({ creatorSnapshotsData }) => {
  const [expandedCreator, setExpandedCreator] = useState(null);
  const [creatorChartData, setCreatorChartData] = useState(null);
  const [loadingChart, setLoadingChart] = useState(false);

  if (!creatorSnapshotsData || creatorSnapshotsData.length === 0) {
      return (
      <div style={styles.tableContainer}>
        <h3 style={styles.chartTitle}>🏆 Top Performers (24h Growth)</h3>
        <div style={styles.empty}>No performance data yet. Fetch data to start tracking!</div>
        </div>
      );
    }

  const sortedPerformers = [...creatorSnapshotsData].filter(c => c.todayGrowth !== undefined).sort((a, b) => b.todayGrowth - a.todayGrowth);

  const handleRowClick = async (username) => {
    if (expandedCreator === username) {
      setExpandedCreator(null);
      setCreatorChartData(null);
      return;
    }
    setExpandedCreator(username);
    setLoadingChart(true);
    try {
      const result = await getCreatorSnapshotDetails(username);
      if (result.success && result.data) setCreatorChartData(result.data);
    } catch (e) {} 
    finally { setLoadingChart(false); }
  };

  const CreatorGrowthChart = ({ data }) => {
    if (!data?.dailyGrowth?.length) return <div style={styles.empty}>No growth data</div>;
    const chartData = data.dailyGrowth.map(d => ({
      date: `${new Date(d.date).getMonth() + 1}/${new Date(d.date).getDate()}`,
      views: d.views, recentViews: d.recentViews, totalViews: d.totalViews
    }));

    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" stroke="rgba(255,255,255,0.1)" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis stroke="rgba(255,255,255,0.1)" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatNumber} />
          <Tooltip content={({ active, payload }) => active && payload?.length ? (
            <div style={{ background: '#1e293b', borderRadius: '8px', padding: '12px' }}>
              <p style={{ margin: 0, color: '#f1f5f9', fontSize: '13px', fontWeight: '600' }}>{payload[0].payload.date}</p>
              <p style={{ margin: '4px 0 0 0', color: '#fbbf24', fontSize: '14px', fontWeight: '700' }}>{payload[0].payload.views > 0 ? '+' : ''}{formatNumber(payload[0].payload.views)} views</p>
              <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '12px' }}>Recent: {formatNumber(payload[0].payload.recentViews)}</p>
            </div>
          ) : null} />
          <Bar dataKey="views" fill="#fbbf24" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

        return (
    <div style={styles.tableContainer}>
      <h3 style={styles.chartTitle}>🏆 Top Performers (24h Growth)</h3>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Rank</th>
              <th style={styles.th}>Creator</th>
              <th style={styles.th}>24h Growth</th>
              <th style={styles.th}>Recent Views (13d)</th>
              <th style={styles.th}>Total Views</th>
            </tr>
          </thead>
          <tbody>
            {sortedPerformers.slice(0, 20).map((p, i) => {
              const isExpanded = expandedCreator === p.username;
              const isPos = p.todayGrowth > 0, isNeg = p.todayGrowth < 0;
              return (
                <React.Fragment key={p.username}>
                  <tr style={{ cursor: 'pointer', background: isExpanded ? '#0f172a' : 'transparent' }} onClick={() => handleRowClick(p.username)}>
                    <td style={{ ...styles.td, ...styles.rankCell }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#60a5fa' }}>{isExpanded ? '▼' : '▶'}</span>
                        <a href={`https://www.tiktok.com/@${p.username}`} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: '600' }} onClick={e => e.stopPropagation()}>@{p.username}</a>
          </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', background: isPos ? '#10b98120' : isNeg ? '#ef444420' : '#64748b20', color: isPos ? '#10b981' : isNeg ? '#ef4444' : '#94a3b8' }}>
                        {isPos ? '+' : ''}{formatNumber(p.todayGrowth)}
                      </span>
                    </td>
                    <td style={styles.td}><strong>{formatNumber(p.latestRecentViews || 0)}</strong></td>
                    <td style={styles.td}><strong>{formatNumber(p.latestTotalViews || 0)}</strong></td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={5} style={{ padding: 0, borderBottom: '1px solid #334155', background: '#0f172a' }}>
                        <div style={{ padding: '20px' }}>
                          <h4 style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: '600', marginBottom: '16px', marginTop: 0 }}>📈 Daily View Growth - @{p.username}</h4>
                          {loadingChart ? <div style={styles.empty}>Loading...</div> : creatorChartData ? <CreatorGrowthChart data={creatorChartData} /> : <div style={styles.empty}>No data</div>}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Chart Component
const Chart = ({ snapshots, timeframe, selectedAccount }) => {
  const [chartType, setChartType] = useState('area');
  const [creatorChartData, setCreatorChartData] = useState(null);

  useEffect(() => {
    if (selectedAccount && selectedAccount !== 'all') {
      getCreatorSnapshotDetails(selectedAccount).then(r => setCreatorChartData(r.success ? r.data : null));
    } else setCreatorChartData(null);
  }, [selectedAccount]);

  // Creator specific view
  if (selectedAccount && selectedAccount !== 'all' && creatorChartData?.dailyGrowth) {
    let chartData = creatorChartData.dailyGrowth.map(d => {
      // Essayer différents noms de champs possibles
      const viewsValue = d.views !== undefined ? d.views : 
                        d.viewGrowth !== undefined ? d.viewGrowth :
                        d.growth !== undefined ? d.growth : 0;
      
      // S'assurer que views est un nombre
      const numericViews = typeof viewsValue === 'number' ? viewsValue : 
                          (typeof viewsValue === 'string' ? parseFloat(viewsValue) || 0 : 0);
      
      // S'assurer que la date est correctement formatée
      let dateObj;
      if (typeof d.date === 'string') {
        dateObj = new Date(d.date);
      } else if (d.date instanceof Date) {
        dateObj = d.date;
      } else {
        dateObj = new Date();
      }
      
      return {
        date: `${dateObj.getMonth() + 1}/${dateObj.getDate()}`,
        views: numericViews,
        recentViews: d.recentViews || 0,
        totalViews: d.totalViews || 0,
        fullDate: d.date // Garder la date originale pour le filtrage
      };
    });

    // Trier par date pour s'assurer que les données sont dans l'ordre
    chartData.sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

    // Si views est 0 mais que recentViews ou totalViews existe, 
    // calculer la croissance comme la différence entre les jours successifs
    if (chartData.length > 1 && chartData.every(d => d.views === 0)) {
      // Essayer de calculer la croissance à partir de totalViews
      for (let i = 1; i < chartData.length; i++) {
        const prevTotal = chartData[i - 1].totalViews || chartData[i - 1].recentViews || 0;
        const currTotal = chartData[i].totalViews || chartData[i].recentViews || 0;
        chartData[i].views = currTotal - prevTotal;
      }
    }

    // Filtrer par date réelle selon le timeframe (même logique que DailyVideosChart)
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Début de la journée
    
    // Debug: log avant filtrage
    console.log('Before filtering - Total data points:', chartData.length);
    console.log('First date:', chartData[0]?.fullDate, 'Last date:', chartData[chartData.length - 1]?.fullDate);
    console.log('Timeframe:', timeframe);
    
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
      // Utiliser la même logique que DailyVideosChart pour 30 jours
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      console.log('Filtering 30 days - from:', thirtyDaysAgo, 'to:', now);
      chartData = chartData.filter(d => {
        if (!d.fullDate) {
          console.log('Missing fullDate:', d);
          return false;
        }
        const dataDate = new Date(d.fullDate);
        if (isNaN(dataDate.getTime())) {
          console.log('Invalid date:', d.fullDate);
          return false;
        }
        dataDate.setHours(0, 0, 0, 0);
        const isInRange = dataDate >= thirtyDaysAgo && dataDate <= now;
        if (!isInRange) {
          console.log('Date out of range:', dataDate, 'not between', thirtyDaysAgo, 'and', now);
        }
        return isInRange;
      });
      console.log('After filtering 30 days - Data points:', chartData.length);
    }
    // Si timeframe === 'all', on garde toutes les données

    // Debug: log les données pour vérifier
    console.log('Chart data for', selectedAccount, 'after filtering:', chartData.length, 'points');
    if (chartData.length > 0) {
      console.log('First date after filter:', chartData[0]?.fullDate, 'Last date:', chartData[chartData.length - 1]?.fullDate);
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

  // Global view
  if (!snapshots?.length) return <div style={styles.chartContainer}><h3 style={styles.chartTitle}>📈 Daily View Growth</h3><div style={styles.empty}>No data yet</div></div>;

  let filtered = [...snapshots];
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Début de la journée
  
  if (timeframe === '1') {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    filtered = snapshots.filter(s => {
      const snapshotDate = new Date(s.date);
      snapshotDate.setHours(0, 0, 0, 0);
      return snapshotDate >= yesterday && snapshotDate <= now;
    });
  } else if (timeframe === '7') {
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    filtered = snapshots.filter(s => {
      const snapshotDate = new Date(s.date);
      snapshotDate.setHours(0, 0, 0, 0);
      return snapshotDate >= sevenDaysAgo && snapshotDate <= now;
    });
  } else if (timeframe === '30') {
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    filtered = snapshots.filter(s => {
      if (!s.date) return false;
      const snapshotDate = new Date(s.date);
      if (isNaN(snapshotDate.getTime())) return false; // Vérifier si la date est valide
      snapshotDate.setHours(0, 0, 0, 0);
      return snapshotDate >= thirtyDaysAgo && snapshotDate <= now;
    });
  }
  // Si timeframe === 'all', on garde toutes les données

  const chartData = filtered.map(s => ({ date: `${new Date(s.date).getMonth() + 1}/${new Date(s.date).getDate()}`, views: s.viewGrowth || 0, totalViews: s.totalViews }));

  return (
    <div style={styles.chartContainer}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ ...styles.chartTitle, margin: 0 }}>📈 Daily View Growth (Global)</h3>
        <div style={{ display: 'flex', background: '#0f172a', borderRadius: '8px', padding: '4px', gap: '4px' }}>
          {['area', 'bar'].map(t => (
            <button key={t} onClick={() => setChartType(t)} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', background: chartType === t ? '#34d399' : 'transparent', color: chartType === t ? '#000' : '#94a3b8' }}>{t === 'area' ? 'Line' : 'Bar'}</button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width='100%' height={300}>
        {chartType === 'area' ? (
          <AreaChart data={chartData}>
            <defs><linearGradient id="gv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#34d399" stopOpacity={0.4}/><stop offset="95%" stopColor="#34d399" stopOpacity={0}/></linearGradient></defs>
          <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.05)' />
            <XAxis dataKey='date' stroke='rgba(255,255,255,0.1)' tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis stroke='rgba(255,255,255,0.1)' tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={formatNumber} />
            <Tooltip content={({ active, payload }) => active && payload?.length ? (
              <div style={{ background: '#1e293b', borderRadius: '8px', padding: '12px' }}>
                <p style={{ margin: 0, color: '#f1f5f9', fontWeight: '600', fontSize: '12px' }}>{payload[0].payload.date}</p>
                <p style={{ margin: '4px 0 0 0', color: '#34d399', fontWeight: '700', fontSize: '12px' }}>+{formatNumber(payload[0].value)} new views</p>
                <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '11px' }}>Total: {formatNumber(payload[0].payload.totalViews)}</p>
              </div>
            ) : null} />
            <Area type='monotone' dataKey='views' stroke='#34d399' strokeWidth={3} fill='url(#gv)' />
        </AreaChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.05)' />
            <XAxis dataKey='date' stroke='rgba(255,255,255,0.1)' tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis stroke='rgba(255,255,255,0.1)' tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={formatNumber} />
            <Tooltip content={({ active, payload }) => active && payload?.length ? (
              <div style={{ background: '#1e293b', borderRadius: '8px', padding: '12px' }}>
                <p style={{ margin: 0, color: '#f1f5f9', fontWeight: '600', fontSize: '12px' }}>{payload[0].payload.date}</p>
                <p style={{ margin: '4px 0 0 0', color: '#34d399', fontWeight: '700', fontSize: '12px' }}>+{formatNumber(payload[0].value)} new views</p>
              </div>
            ) : null} />
            <Bar dataKey='views' fill='#34d399' radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

// DailyVideosChart Component
const DailyVideosChart = ({ stats, timeframe, selectedAccount, selectedPlatform }) => {
  const [chartType, setChartType] = useState('bar');

  if (!stats || stats.length === 0) {
    return (
      <div style={styles.chartContainer}>
        <h3 style={styles.chartTitle}>📹 Daily Videos Posted</h3>
        <div style={styles.empty}>No video data available</div>
      </div>
    );
  }

  // Filtrer les stats selon le compte sélectionné
  let filteredStats = selectedAccount === 'all' || !selectedAccount
    ? stats 
    : stats.filter(creator => creator.username === selectedAccount);

  // Filtrer par plateforme si nécessaire
  if (selectedPlatform && selectedPlatform !== 'all') {
    filteredStats = filteredStats.map(creator => ({
      ...creator,
      videos: (creator.videos || []).filter(v => v.platform === selectedPlatform)
    })).filter(creator => creator.videos.length > 0);
  }

  // Collecter toutes les vidéos avec leurs dates
  const allVideos = [];
  filteredStats.forEach(creator => {
    if (creator.videos && Array.isArray(creator.videos)) {
      creator.videos.forEach(video => {
        if (video.date) {
          allVideos.push({
            date: new Date(video.date).toISOString().split('T')[0], // Format YYYY-MM-DD
            username: creator.username
          });
        }
      });
    }
  });

  // Grouper par date
  const videosByDate = {};
  allVideos.forEach(video => {
    if (!videosByDate[video.date]) {
      videosByDate[video.date] = 0;
    }
    videosByDate[video.date]++;
  });

  // Trier par date et filtrer selon la timeframe
  const sortedDates = Object.keys(videosByDate).sort();
  let filteredDates = sortedDates;
  const now = new Date();
  
  // Créer une plage de dates complète pour remplir les jours manquants
  const fillMissingDates = (dates, startDate, endDate) => {
    const allDates = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      allDates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return allDates;
  };

  let startDate, endDate;
  
  if (timeframe === 'current_month') {
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    startDate = new Date(currentYear, currentMonth, 1);
    endDate = now;
    filteredDates = fillMissingDates(sortedDates, startDate, endDate);
  } else if (timeframe === '1') {
    if (chartType === 'bar') {
      filteredDates = sortedDates.slice(-1);
    } else {
      filteredDates = sortedDates.slice(-2);
    }
  } else if (timeframe !== 'all') {
    const days = parseInt(timeframe);
    startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    endDate = now;
    filteredDates = fillMissingDates(sortedDates, startDate, endDate);
  } else {
    filteredDates = sortedDates;
  }

  const chartData = filteredDates.map(dateStr => {
    const date = new Date(dateStr);
    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      videos: videosByDate[dateStr] || 0,
      fullDate: dateStr
    };
  });

  const getChartTitle = () => {
    switch (timeframe) {
      case 'current_month':
        return '📹 Daily Videos Posted (Current Month)';
      case '1':
        return '📹 Daily Videos Posted (Last 24 hours)';
      case '7':
        return '📹 Daily Videos Posted (Last 7 days)';
      case '30':
        return '📹 Daily Videos Posted (Last 30 days)';
      case 'all':
        return '📹 Daily Videos Posted (All Time)';
      default:
        return '📹 Daily Videos Posted';
    }
  };

  return (
    <div style={styles.chartContainer}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ ...styles.chartTitle, margin: 0 }}>{getChartTitle()}</h3>
        <div style={{ display: 'flex', background: '#0f172a', borderRadius: '8px', padding: '4px', gap: '4px' }}>
          {['area', 'bar'].map(t => (
            <button key={t} onClick={() => setChartType(t)} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', background: chartType === t ? '#3b82f6' : 'transparent', color: chartType === t ? '#000' : '#94a3b8' }}>{t === 'area' ? 'Line' : 'Bar'}</button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width='100%' height={300}>
        {chartType === 'bar' ? (
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.05)' />
            <XAxis dataKey='date' stroke='rgba(255,255,255,0.1)' tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis stroke='rgba(255,255,255,0.1)' tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip content={({ active, payload }) => active && payload?.length ? (
              <div style={{ background: '#1e293b', borderRadius: '8px', padding: '12px' }}>
                <p style={{ margin: 0, color: '#f1f5f9', fontSize: '12px', fontWeight: '600' }}>{payload[0].payload.date}</p>
                <p style={{ margin: '4px 0 0 0', color: '#3b82f6', fontSize: '12px', fontWeight: '700' }}>{payload[0].value} video{payload[0].value !== 1 ? 's' : ''} posted</p>
              </div>
            ) : null} />
            <Bar dataKey='videos' fill='#3b82f6' radius={[4, 4, 0, 0]} />
        </BarChart>
        ) : (
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs><linearGradient id="colorVideos" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.05)' />
            <XAxis dataKey='date' stroke='rgba(255,255,255,0.1)' tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis stroke='rgba(255,255,255,0.1)' tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip content={({ active, payload }) => active && payload?.length ? (
              <div style={{ background: '#1e293b', borderRadius: '8px', padding: '12px' }}>
                <p style={{ margin: 0, color: '#f1f5f9', fontSize: '12px', fontWeight: '600' }}>{payload[0].payload.date}</p>
                <p style={{ margin: '4px 0 0 0', color: '#3b82f6', fontSize: '12px', fontWeight: '700' }}>{payload[0].value} video{payload[0].value !== 1 ? 's' : ''} posted</p>
              </div>
            ) : null} />
            <Area type='monotone' dataKey='videos' stroke='#3b82f6' strokeWidth={3} fill='url(#colorVideos)' />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

// DailyCostChart Component
const DailyCostChart = ({ stats, timeframe, selectedAccount, selectedPlatform }) => {
  const [chartType, setChartType] = useState('bar');

  if (!stats || stats.length === 0) {
    return (
      <div style={styles.chartContainer}>
        <h3 style={styles.chartTitle}>💰 Daily Spending</h3>
        <div style={styles.empty}>No cost data available</div>
      </div>
    );
  }

  // Filtrer les stats selon le compte sélectionné
  let filteredStats = selectedAccount === 'all' || !selectedAccount
    ? stats 
    : stats.filter(creator => creator.username === selectedAccount);

  // Filtrer par plateforme si nécessaire
  if (selectedPlatform && selectedPlatform !== 'all') {
    filteredStats = filteredStats.map(creator => ({
      ...creator,
      videos: (creator.videos || []).filter(v => v.platform === selectedPlatform)
    })).filter(creator => creator.videos.length > 0);
  }

  // Collecter toutes les vidéos avec leur coût
  const videosByDate = {};
  
  filteredStats.forEach(creator => {
    const costPerVideo = parseFloat(creator.costPerVideo?.replace('$', '') || 0);
    const cpm = parseFloat(creator.cpm?.replace('$', '') || 0);
    
    if (creator.videos && Array.isArray(creator.videos)) {
      creator.videos.forEach(video => {
        if (video.date) {
          const dateStr = new Date(video.date).toISOString().split('T')[0];
          
          // Vérifier si le contrat a changé
          let shouldCount = true;
          if (creator.contractHasChanged && creator.contractChangedDate) {
            try {
              const [month, day, year] = creator.contractChangedDate.split('/');
              const contractDate = new Date(year, month - 1, day);
              contractDate.setHours(0, 0, 0, 0);
              const videoDate = new Date(video.date);
              shouldCount = videoDate >= contractDate;
            } catch (e) {}
          }
          
          if (shouldCount) {
            if (!videosByDate[dateStr]) {
              videosByDate[dateStr] = 0;
            }
            
            // Coût selon la plateforme
            if (video.platform === 'instagram') {
              // Instagram: CPM fixe $1
              const instagramCpm = 1;
              videosByDate[dateStr] += ((video.views || 0) / 1000) * instagramCpm;
            } else {
              // TikTok: costPerVideo + CPM
              const baseCost = costPerVideo;
              const cpmCost = ((video.views || 0) / 1000) * cpm;
              videosByDate[dateStr] += baseCost + cpmCost;
            }
          }
        }
      });
    }
  });

  // Trier par date et filtrer selon la timeframe
  const sortedDates = Object.keys(videosByDate).sort();
  let filteredDates = sortedDates;
  const now = new Date();
  
  // Créer une plage de dates complète pour remplir les jours manquants
  const fillMissingDates = (dates, startDate, endDate) => {
    const allDates = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      allDates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return allDates;
  };

  let startDate, endDate;
  
  if (timeframe === 'current_month') {
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    startDate = new Date(currentYear, currentMonth, 1);
    endDate = now;
    filteredDates = fillMissingDates(sortedDates, startDate, endDate);
  } else if (timeframe === '1') {
    if (chartType === 'bar') {
      filteredDates = sortedDates.slice(-1);
    } else {
      filteredDates = sortedDates.slice(-2);
    }
  } else if (timeframe !== 'all') {
    const days = parseInt(timeframe);
    startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    endDate = now;
    filteredDates = fillMissingDates(sortedDates, startDate, endDate);
  } else {
    filteredDates = sortedDates;
  }

  const chartData = filteredDates.map(dateStr => {
    const date = new Date(dateStr);
    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      cost: videosByDate[dateStr] || 0,
      fullDate: dateStr
    };
  });

  const getChartTitle = () => {
    switch (timeframe) {
      case 'current_month':
        return '💰 Daily Spending (Current Month)';
      case '1':
        return '💰 Daily Spending (Last 24 hours)';
      case '7':
        return '💰 Daily Spending (Last 7 days)';
      case '30':
        return '💰 Daily Spending (Last 30 days)';
      case 'all':
        return '💰 Daily Spending (All Time)';
      default:
        return '💰 Daily Spending';
    }
  };

  return (
    <div style={styles.chartContainer}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ ...styles.chartTitle, margin: 0 }}>{getChartTitle()}</h3>
        <div style={{ display: 'flex', background: '#0f172a', borderRadius: '8px', padding: '4px', gap: '4px' }}>
          {['area', 'bar'].map(t => (
            <button key={t} onClick={() => setChartType(t)} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', background: chartType === t ? '#C582FF' : 'transparent', color: chartType === t ? '#000' : '#94a3b8' }}>{t === 'area' ? 'Line' : 'Bar'}</button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width='100%' height={300}>
        {chartType === 'bar' ? (
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.05)' />
            <XAxis dataKey='date' stroke='rgba(255,255,255,0.1)' tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis stroke='rgba(255,255,255,0.1)' tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => '$' + value.toFixed(0)} />
            <Tooltip content={({ active, payload }) => active && payload?.length ? (
              <div style={{ background: '#1e293b', borderRadius: '8px', padding: '12px' }}>
                <p style={{ margin: 0, color: '#f1f5f9', fontSize: '12px', fontWeight: '600' }}>{payload[0].payload.date}</p>
                <p style={{ margin: '4px 0 0 0', color: '#C582FF', fontSize: '12px', fontWeight: '700' }}>{formatCurrency(payload[0].value)} spent</p>
              </div>
            ) : null} />
            <Bar dataKey='cost' fill='#C582FF' radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs><linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#C582FF" stopOpacity={0.4}/><stop offset="95%" stopColor="#C582FF" stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.05)' />
            <XAxis dataKey='date' stroke='rgba(255,255,255,0.1)' tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis stroke='rgba(255,255,255,0.1)' tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => '$' + value.toFixed(0)} />
            <Tooltip content={({ active, payload }) => active && payload?.length ? (
              <div style={{ background: '#1e293b', borderRadius: '8px', padding: '12px' }}>
                <p style={{ margin: 0, color: '#f1f5f9', fontSize: '12px', fontWeight: '600' }}>{payload[0].payload.date}</p>
                <p style={{ margin: '4px 0 0 0', color: '#C582FF', fontSize: '12px', fontWeight: '700' }}>{formatCurrency(payload[0].value)} spent</p>
              </div>
            ) : null} />
            <Area type='monotone' dataKey='cost' stroke='#C582FF' strokeWidth={3} fill='url(#colorCost)' />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

// CreatorTable Component
const CreatorTable = ({ stats }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'views', direction: 'desc' });
  const [expandedCreator, setExpandedCreator] = useState(null);
  const validStats = stats.filter(s => s.username && s.username !== 'null');
  
  if (!validStats.length) return <div style={styles.tableContainer}><h3 style={styles.chartTitle}>All Creators</h3><div style={styles.empty}>No data</div></div>;

  const getLastPostInfo = (c) => {
    if (!c.videos?.length) return { text: 'No posts', style: styles.activityRed, daysSince: 999 };
    const sorted = [...c.videos].sort((a, b) => new Date(b.date) - new Date(a.date));
    const days = Math.floor(Math.abs(new Date() - new Date(sorted[0].date)) / 86400000);
    if (days === 0) return { text: 'Today', style: styles.activityGreen, daysSince: 0 };
    if (days === 1) return { text: 'Yesterday', style: styles.activityGreen, daysSince: 1 };
    if (days <= 2) return { text: `${days}d ago`, style: styles.activityGreen, daysSince: days };
    if (days <= 4) return { text: `${days}d ago`, style: styles.activityOrange, daysSince: days };
    return { text: `${days}d ago`, style: styles.activityRed, daysSince: days };
  };

  const handleSort = (key) => setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc' });

  let displayStats = [...validStats];
    displayStats.sort((a, b) => {
    let aV, bV;
    if (sortConfig.key === 'views') { aV = a.views; bV = b.views; }
    else if (sortConfig.key === 'videos') { aV = a.publishedVideos || 0; bV = b.publishedVideos || 0; }
    else if (sortConfig.key === 'cost') { aV = calculateInfluencerCost(a).total; bV = calculateInfluencerCost(b).total; }
    else if (sortConfig.key === 'lastPost') { aV = getLastPostInfo(a).daysSince; bV = getLastPostInfo(b).daysSince; }
    else if (sortConfig.key === 'realCPM') {
        const aCost = calculateInfluencerCost(a);
        const bCost = calculateInfluencerCost(b);
      aV = aCost.viewsUsed > 0 ? (aCost.total / aCost.viewsUsed) * 1000 : 0;
      bV = bCost.viewsUsed > 0 ? (bCost.total / bCost.viewsUsed) * 1000 : 0;
    }
    return sortConfig.direction === 'asc' ? aV - bV : bV - aV;
  });

  const SortHeader = ({ label, k }) => (
    <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => handleSort(k)}>
      {label} {sortConfig.key === k ? (sortConfig.direction === 'desc' ? '▼' : '▲') : '▼'}
      </th>
    );

  const shouldShowWarning = (creator, realCPM) => {
    const videoCount = creator.publishedVideos || 0;
    // Règle universelle: CPM > 10$ peu importe le nombre de vidéos
    if (realCPM > 10) {
      return true;
    }
    // Règle 1: CPM > 5$ ET entre 5 et 9 vidéos (inclus)
    if (realCPM > 5 && videoCount >= 5 && videoCount <= 9) {
      return true;
    }
    // Règle 2: CPM > 2.5$ ET plus de 10 vidéos
    if (realCPM > 2.5 && videoCount > 10) {
      return true;
    }
    return false;
  };

  return (
    <div style={styles.tableContainer}>
      <h3 style={styles.chartTitle}>All Creators</h3>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <SortHeader label="Username" k="lastPost" />
              <SortHeader label="Videos" k="videos" />
              <SortHeader label="Views" k="views" />
              <th style={styles.th}>Deal Type</th>
              <SortHeader label="Cost" k="cost" />
              <SortHeader label="Real CPM" k="realCPM" />
            </tr>
          </thead>
          <tbody>
            {displayStats.map((c, i) => {
              const cost = calculateInfluencerCost(c);
              const realCPM = cost.viewsUsed > 0 ? (cost.total / cost.viewsUsed) * 1000 : 0;
              const isExp = expandedCreator === c.username;
              const lastPost = getLastPostInfo(c);
              const showWarning = shouldShowWarning(c, realCPM);
              
              return (
                <React.Fragment key={c.username}>
                  <tr style={{ cursor: 'pointer', background: isExp ? '#0f172a' : 'transparent' }} onClick={() => setExpandedCreator(isExp ? null : c.username)}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#60a5fa' }}>{isExp ? '▼' : '▶'}</span>
                        <a href={`https://www.tiktok.com/@${c.username}`} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: '600' }} onClick={e => e.stopPropagation()}>@{c.username}</a>
                        <span style={{ ...styles.activityBadge, ...lastPost.style }}>{lastPost.text}</span>
                        {c.contractHasChanged && <span style={styles.contractChangedBadge}>NEW CA</span>}
                      </div>
                    </td>
                    <td style={styles.td}><strong>{c.publishedVideos}</strong></td>
                    <td style={styles.td}><strong>{formatNumber(c.views)}</strong></td>
                    <td style={styles.td}><span style={styles.dealBadge}>{c.dealType || 'N/A'}</span></td>
                    <td style={styles.td}><strong style={{ color: '#34d399' }}>{formatCurrency(cost.total)}</strong></td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ color: '#60a5fa' }}>{formatCurrency(realCPM)}</strong>
                        {showWarning && <span style={styles.warningBadge}>WARNING</span>}
                          </div>
                    </td>
                  </tr>
                  {isExp && (
                    <tr>
                      <td colSpan={6} style={{ padding: 0, borderBottom: '1px solid #334155', background: '#0f172a' }}>
                        <div style={{ padding: '20px' }}>
                          <h4 style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: '600', marginBottom: '16px', marginTop: 0 }}>📹 Videos ({c.videos?.length || 0})</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                            {[...(c.videos || [])].sort((a, b) => (b.views || 0) - (a.views || 0)).map((v, vi) => (
                              <div key={vi} style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
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
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// TopVideosTable Component
const TopVideosTable = ({ stats }) => {
  const allVideos = [];
  stats.filter(s => s.username).forEach(c => {
    (c.videos || []).forEach(v => allVideos.push({ ...v, username: c.username }));
  });
  const topVideos = allVideos.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  if (!topVideos.length) return <div style={styles.tableContainer}><h3 style={styles.chartTitle}>🔥 Your top 5 videos by views</h3><div style={styles.empty}>No videos</div></div>;

  return (
    <div style={styles.tableContainer}>
      <h3 style={styles.chartTitle}>🔥 Your top 5 videos by views</h3>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Rank</th>
              <th style={styles.th}>Creator</th>
              <th style={styles.th}>Platform</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Views</th>
              <th style={styles.th}>Likes</th>
              <th style={styles.th}>Link</th>
            </tr>
          </thead>
          <tbody>
            {topVideos.map((v, i) => (
              <tr key={i}>
                <td style={{ ...styles.td, ...styles.rankCell }}>#{i + 1}</td>
                <td style={styles.td}><a href={`https://www.tiktok.com/@${v.username}`} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: '600' }}>@{v.username}</a></td>
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
  );
};

// Main Dashboard Component
export default function TallerDashboard() {
  const [loading, setLoading] = useState(false);
  const [allCreators, setAllCreators] = useState([]);
  const [filteredStats, setFilteredStats] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [validUsername, setValidUsername] = useState(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState('all');
  const [totalCost, setTotalCost] = useState(0);
  const [tiktokCost, setTiktokCost] = useState(0);
  const [instagramCost, setInstagramCost] = useState(0);
  const [globalRealCPM, setGlobalRealCPM] = useState(0);
  const [snapshots, setSnapshots] = useState([]);
  const [creatorSnapshotsData, setCreatorSnapshotsData] = useState([]);
  const [instagramCreatorSnapshotsData, setInstagramCreatorSnapshotsData] = useState([]);
  const [platformStats, setPlatformStats] = useState({ tiktok: { views: 0, videos: 0 }, instagram: { views: 0, videos: 0 } });

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
    
    setAllCreators(filtered);
    const usernames = filtered.map(s => s.username).sort();
    setAccounts(usernames);
  };

  const loadCachedData = async () => {
    try {
      const result = await getCachedData();
      if (result.success && result.data) updateData(result.data);
    } catch (e) {}
  };

  const handleFetchData = async () => {
      setLoading(true);
    try {
      const result = await fetchData();
      if (result.success) {
        updateData(result.data);
        await loadSnapshots();
        await loadCreatorSnapshots();
        await loadInstagramCreatorSnapshots();
        alert('✅ Data fetched!');
      } else alert('❌ Error: ' + result.error);
    } catch (e) { alert('❌ Failed'); }
    finally { setLoading(false); }
  };

const applyFilters = () => {
  if (!allCreators.length) return;

  const allVideosData = [];

  let tallerOnlyStats = allCreators.map(c => {
    const tallerVideos = c.videos.filter(v => filterTallerVideos(v, c.username));
    const totalViews = tallerVideos.reduce((s, v) => s + (v.views || 0), 0);

    tallerVideos.forEach(v => {
      allVideosData.push({
        username: c.username,
        platform: v.platform,
        date: v.date,
        views: v.views || 0,
        likes: v.likes || 0,
        comments: v.comments || 0,
        description: v.description?.substring(0, 100) || 'N/A',
        url: v.url || 'N/A'
      });
    });

    return {
      ...c,
      videos: tallerVideos,
      publishedVideos: tallerVideos.length,
      views: totalViews,
      likes: tallerVideos.reduce((s, v) => s + (v.likes || 0), 0),
      comments: tallerVideos.reduce((s, v) => s + (v.comments || 0), 0)
    };
  }).filter(c => c.publishedVideos > 0);

  let dateFiltered = filterStatsByDate(tallerOnlyStats, selectedDateFilter);
  // Filtrer par username valide
  let accountFiltered = !validUsername ? dateFiltered : dateFiltered.filter(s => s.username.toLowerCase() === validUsername.toLowerCase());
  
  // Filtrer par plateforme
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

  // Calculer les stats par plateforme
  const platformData = filtered.reduce((acc, c) => {
    c.videos.forEach(v => {
      const platform = v.platform || 'tiktok';
      if (!acc[platform]) {
        acc[platform] = { views: 0, videos: 0, likes: 0, comments: 0 };
      }
      acc[platform].views += v.views || 0;
      acc[platform].videos += 1;
      acc[platform].likes += v.likes || 0;
      acc[platform].comments += v.comments || 0;
    });
    return acc;
  }, { tiktok: { views: 0, videos: 0, likes: 0, comments: 0 }, instagram: { views: 0, videos: 0, likes: 0, comments: 0 } });

  setPlatformStats(platformData);

  const activeCount = filtered.filter(c => {
    if (!c.videos?.length) return false;
    const sorted = [...c.videos].sort((a, b) => new Date(b.date) - new Date(a.date));
    const daysSinceLastPost = Math.floor(Math.abs(new Date() - new Date(sorted[0].date)) / 86400000);
    return daysSinceLastPost <= 10;
  }).length;

  // Calculer le changement de vues par plateforme et créateur
  let dailyViewsChange = 0;
  
  // Si un créateur spécifique est sélectionné, filtrer par ce créateur
  if (validUsername) {
    if (selectedPlatformFilter === 'all') {
      // Pour "all", combiner TikTok et Instagram pour ce créateur
      const tiktokGrowth = creatorSnapshotsData
        .find(c => c.username.toLowerCase() === validUsername.toLowerCase())?.todayGrowth || 0;
      const instagramGrowth = instagramCreatorSnapshotsData
        .find(c => c.username.toLowerCase() === validUsername.toLowerCase())?.todayGrowth || 0;
      dailyViewsChange = tiktokGrowth + instagramGrowth;
    } else if (selectedPlatformFilter === 'tiktok') {
      // Pour TikTok, utiliser creatorSnapshotsData pour ce créateur
      dailyViewsChange = creatorSnapshotsData
        .find(c => c.username.toLowerCase() === validUsername.toLowerCase())?.todayGrowth || 0;
    } else if (selectedPlatformFilter === 'instagram') {
      // Pour Instagram, utiliser instagramCreatorSnapshotsData pour ce créateur
      dailyViewsChange = instagramCreatorSnapshotsData
        .find(c => c.username.toLowerCase() === validUsername.toLowerCase())?.todayGrowth || 0;
    }
  } else {
    // Si aucun créateur spécifique, utiliser la logique globale
    if (selectedPlatformFilter === 'all') {
      // Pour "all", utiliser les snapshots globaux
      dailyViewsChange = snapshots?.length >= 2 ? snapshots[snapshots.length - 1].viewGrowth || 0 : 0;
    } else if (selectedPlatformFilter === 'tiktok') {
      // Pour TikTok, utiliser creatorSnapshotsData et sommer les todayGrowth des créateurs filtrés
      const filteredUsernames = new Set(filtered.map(c => c.username));
      dailyViewsChange = creatorSnapshotsData
        .filter(c => filteredUsernames.has(c.username) && c.todayGrowth !== undefined)
        .reduce((sum, c) => sum + (c.todayGrowth || 0), 0);
    } else if (selectedPlatformFilter === 'instagram') {
      // Pour Instagram, utiliser instagramCreatorSnapshotsData et sommer les todayGrowth des créateurs filtrés
      const filteredUsernames = new Set(filtered.map(c => c.username));
      dailyViewsChange = instagramCreatorSnapshotsData
        .filter(c => filteredUsernames.has(c.username) && c.todayGrowth !== undefined)
        .reduce((sum, c) => sum + (c.todayGrowth || 0), 0);
    }
  }

    setGlobalStats({
      ...global,
      totalAccounts: filtered.length,
    activeAccounts: activeCount,
      dailyViewsChange
    });

  // Calculer les coûts par plateforme
  const costs = filtered.reduce((acc, c) => {
    const cost = calculateInfluencerCost(c);
    acc.total += cost.total;
    acc.tiktok += cost.tiktokCost;
    acc.instagram += cost.instagramCost;
    acc.bonus += cost.bonus;
    return acc;
  }, { total: 0, tiktok: 0, instagram: 0, bonus: 0 });

  setTotalCost(costs.total);
  setTiktokCost(costs.tiktok);
  setInstagramCost(costs.instagram);
  setGlobalRealCPM(global.views > 0 ? (costs.total / global.views) * 1000 : 0);

  // 🔥 LOG COMPLET AVEC TOUTES LES VIDÉOS ET LE CALCUL
  const calculatedTotal = allVideosData.reduce((sum, v) => sum + v.views, 0);

  console.log(JSON.stringify({
    allVideos: allVideosData,
    platformStats: platformData,
    costs: costs,
    calculation: {
      method: "allVideos.reduce((sum, v) => sum + v.views, 0)",
      result: calculatedTotal,
      breakdown: allVideosData.map(v => `${v.username}: ${v.views} vues`),
      totalVideos: allVideosData.length
    }
  }, null, 2));
};
  const extractUsername = (input) => {
    let username = input.trim();
    
    // Si c'est un lien TikTok, extraire le username après @
    const tiktokUrlMatch = username.match(/tiktok\.com\/@([^\/\?]+)/i);
    if (tiktokUrlMatch) {
      username = tiktokUrlMatch[1];
    }
    
    // Supprimer le @ au début si présent
    if (username.startsWith('@')) {
      username = username.substring(1).trim();
    }
    
    return username;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const username = extractUsername(searchUsername);
    if (!username) return;
    
    const found = accounts.find(a => a.toLowerCase() === username.toLowerCase());
    if (found) {
      setValidUsername(found);
      setSearchUsername(found); // Normaliser l'username
    } else {
      setValidUsername(null);
    }
  };

  useEffect(() => { loadCachedData(); loadSnapshots(); loadCreatorSnapshots(); loadInstagramCreatorSnapshots(); }, []);
  
  // Vérifier automatiquement l'username après chargement des données
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
  
  useEffect(() => { applyFilters(); }, [validUsername, selectedDateFilter, selectedPlatformFilter, allCreators, snapshots, creatorSnapshotsData, instagramCreatorSnapshotsData]);

  // Page d'accueil si pas d'username valide
  if (!validUsername) {
    return (
      <div style={{ minHeight: '100vh', padding: '0', margin: '0', background: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`body { margin: 0 !important; } input::placeholder { color: #64748b; }`}</style>
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '600px', padding: '20px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '600', color: '#f1f5f9', marginBottom: '40px', marginTop: 0 }}>Taller Analytics</h1>
          <form onSubmit={handleSearch} style={{ width: '100%' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <img 
                src="/images/Tiktok-icon.png"
                alt="TikTok"
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '24px',
                  height: '24px',
                  objectFit: 'contain',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              />
              <input
                type="text"
                placeholder="Enter your tiktok username"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  paddingLeft: '60px',
                  border: '2px solid #334155',
                  borderRadius: '24px',
                  fontSize: '16px',
                  outline: 'none',
                  background: '#1e293b',
                  color: '#f1f5f9',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              />
            </div>
            {searchUsername.trim() && accounts.length > 0 && (() => {
              const username = extractUsername(searchUsername);
              return username && !accounts.find(a => a.toLowerCase() === username.toLowerCase());
            })() && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '12px', marginBottom: 0 }}>
                Username not found. Please check your spelling.
              </p>
            )}
          </form>
        </div>
      </div>
    );
  }

  // Dashboard avec données
  return (
    <div style={{ minHeight: '100vh', padding: '0', margin: '0', background: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <style>{`body { margin: 0 !important; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } input::placeholder { color: #64748b; }`}</style>
      <div style={{ maxWidth: '100%', padding: '20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => { setValidUsername(null); setSearchUsername(''); }}
              style={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                cursor: 'pointer',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#1e293b';
                e.target.style.borderColor = '#475569';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#0f172a';
                e.target.style.borderColor = '#334155';
              }}
            >
              <img src="/Arrow_Left_SM.svg" alt="Back" style={{ width: '20px', height: '20px' }} />
            </button>
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#f1f5f9', margin: 0 }}>{validUsername} Analytics</h1>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={selectedDateFilter} onChange={(e) => setSelectedDateFilter(e.target.value)} style={{
                padding: '10px 16px',
                paddingRight: '32px',
                border: '1px solid #334155',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                background: '#1e293b',
                backgroundImage: 'url(/arrow.svg)',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '8px 8px',
                color: '#f1f5f9',
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
            }}>
              <option value='1'>Last 24 hours</option>
              <option value='7'>Last 7 days</option>
              <option value='30'>Last 30 days</option>
              <option value='all'>All time</option>
            </select>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {selectedPlatformFilter === 'all' ? (
                <>
                  <img 
                    src="/images/Tiktok-icon.png"
                    alt=""
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '18px',
                      height: '18px',
                      objectFit: 'contain',
                      pointerEvents: 'none',
                      zIndex: 1
                    }}
                  />
                  <img 
                    src="/images/instagram-icon.png"
                    alt=""
                    style={{
                      position: 'absolute',
                      left: '38px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '18px',
                      height: '18px',
                      objectFit: 'contain',
                      pointerEvents: 'none',
                      zIndex: 1
                    }}
                  />
                </>
              ) : (
                <img 
                  src={selectedPlatformFilter === 'tiktok' ? '/images/Tiktok-icon.png' : '/images/instagram-icon.png'}
                  alt=""
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px',
                    objectFit: 'contain',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}
                />
              )}
              <select 
                value={selectedPlatformFilter} 
                onChange={(e) => setSelectedPlatformFilter(e.target.value)} 
                style={{
                  padding: '10px 16px',
                  paddingLeft: selectedPlatformFilter === 'all' ? '66px' : '42px',
                  paddingRight: '32px',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  background: '#1e293b',
                  backgroundImage: 'url(/arrow.svg)',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '8px 8px',
                  color: '#f1f5f9',
                  cursor: 'pointer',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                }}
              >
                <option value='all'>All Platforms</option>
                <option value='tiktok'>TikTok</option>
                <option value='instagram'>Instagram</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ background: '#1e293b', padding: '40px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #334155', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 15px' }} />
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Fetching data...</p>
          </div>
        )}

        {/* Stats Cards */}
        {globalStats && (
          <>
            {/* Same cards for all filters, but data is filtered by platform */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '20px' }}>
              <StatCard icon="📹" label="Total Videos" value={globalStats.publishedVideos} />
              <StatCard icon="👁️" label="Total Views" value={globalStats.views} change={globalStats.dailyViewsChange} />
              <StatCard icon="👍" label="Total Likes" value={globalStats.likes} />
              <StatCard icon="💬" label="Total Comments" value={globalStats.comments} />
            </div>
          </>
        )}

        {/* Charts & Tables */}
        <Chart snapshots={snapshots} timeframe={selectedDateFilter} selectedAccount={validUsername} />
        <DailyVideosChart stats={allCreators} timeframe={selectedDateFilter} selectedAccount={validUsername} selectedPlatform={selectedPlatformFilter} />
        <TopPerformers creatorSnapshotsData={creatorSnapshotsData} />
        <TopVideosTable stats={filteredStats} />
      </div>
    </div>
  );
}