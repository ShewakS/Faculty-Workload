import React, { useState, useEffect } from 'react';
import { fetchWorkloadData } from '../api/api';
import './DepartmentHeatmap.css';

const DepartmentHeatmap = () => {
  const [data, setData] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const workloadData = await fetchWorkloadData();
      setData(workloadData);
      processDepartmentData(workloadData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processDepartmentData = (data) => {
    const deptMap = {};
    
    data.forEach(item => {
      if (!deptMap[item.department]) {
        deptMap[item.department] = {
          department: item.department,
          totalWorkload: 0,
          facultyCount: new Set(),
          overloaded: 0,
          balanced: 0,
          underutilized: 0
        };
      }
      
      deptMap[item.department].totalWorkload += item.workload_score;
      deptMap[item.department].facultyCount.add(item.faculty);
      
      if (item.status === 'Overloaded') deptMap[item.department].overloaded++;
      else if (item.status === 'Balanced') deptMap[item.department].balanced++;
      else if (item.status === 'Underutilized') deptMap[item.department].underutilized++;
    });

    const processed = Object.values(deptMap).map(dept => ({
      ...dept,
      facultyCount: dept.facultyCount.size,
      avgWorkload: (dept.totalWorkload / dept.facultyCount.size).toFixed(2)
    }));

    setDeptData(processed);
  };

  const getHeatmapColor = (avgWorkload) => {
    const score = parseFloat(avgWorkload);
    if (score > 15) return 'high';
    if (score > 10) return 'medium';
    return 'low';
  };

  if (loading) return <div className="loading">Loading heatmap...</div>;

  return (
    <div className="department-heatmap">
      <h2>🔥 Department Heatmap</h2>
      
      <div className="heatmap-grid">
        {deptData.map(dept => (
          <div key={dept.department} className={`dept-card ${getHeatmapColor(dept.avgWorkload)}`}>
            <h3>{dept.department}</h3>
            <div className="dept-stats">
              <div className="stat">
                <span className="label">Faculty:</span>
                <span className="value">{dept.facultyCount}</span>
              </div>
              <div className="stat">
                <span className="label">Avg Workload:</span>
                <span className="value">{dept.avgWorkload}</span>
              </div>
              <div className="status-breakdown">
                <div className="status-item overloaded">
                  <span>{dept.overloaded}</span>
                  <small>Overloaded</small>
                </div>
                <div className="status-item balanced">
                  <span>{dept.balanced}</span>
                  <small>Balanced</small>
                </div>
                <div className="status-item underutilized">
                  <span>{dept.underutilized}</span>
                  <small>Under</small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="heatmap-legend">
        <h4>Workload Intensity</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="color-box low"></div>
            <span>Low (≤10)</span>
          </div>
          <div className="legend-item">
            <div className="color-box medium"></div>
            <span>Medium (10-15)</span>
          </div>
          <div className="legend-item">
            <div className="color-box high"></div>
            <span>High (≥15)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentHeatmap;