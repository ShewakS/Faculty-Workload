import React, { useState, useEffect } from 'react';
import { fetchWorkloadData } from '../api/api';
import './Overview.css';

const Overview = () => {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const workloadData = await fetchWorkloadData();
      setData(workloadData);
      calculateStats(workloadData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const totalFaculty = new Set(data.map(d => d.faculty)).size;
    const totalDepartments = new Set(data.map(d => d.department)).size;
    const overloaded = data.filter(d => d.status === 'Overloaded').length;
    const balanced = data.filter(d => d.status === 'Balanced').length;
    const underutilized = data.filter(d => d.status === 'Underutilized').length;
    const avgWorkload = data.reduce((sum, d) => sum + d.workload_score, 0) / data.length;

    setStats({
      totalFaculty,
      totalDepartments,
      totalSubjects: data.length,
      overloaded,
      balanced,
      underutilized,
      avgWorkload: avgWorkload.toFixed(2)
    });
  };

  if (loading) return <div className="loading">Loading overview...</div>;

  return (
    <div className="overview">
      <h2>📊 Overview Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.totalFaculty}</h3>
            <p>Total Faculty</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            <h3>{stats.totalDepartments}</h3>
            <p>Departments</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>{stats.totalSubjects}</h3>
            <p>Total Subjects</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⚖️</div>
          <div className="stat-info">
            <h3>{stats.avgWorkload}</h3>
            <p>Avg Workload</p>
          </div>
        </div>
      </div>

      <div className="status-overview">
        <h3>Workload Distribution</h3>
        <div className="status-cards">
          <div className="status-card overloaded">
            <h4>{stats.overloaded}</h4>
            <p>Overloaded</p>
          </div>
          <div className="status-card balanced">
            <h4>{stats.balanced}</h4>
            <p>Balanced</p>
          </div>
          <div className="status-card underutilized">
            <h4>{stats.underutilized}</h4>
            <p>Underutilized</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;