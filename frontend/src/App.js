import React, { useState, useEffect } from 'react';
import './App.css';
import FacultyTable from './components/FacultyTable';
import WorkloadChart from './components/WorkloadChart';
import Insights from './components/Insights';
import { fetchWorkloadData } from './api/api';

function App() {
  const [workloadData, setWorkloadData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    department: 'All',
    dataType: 'All'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWorkloadData();
      
      // Handle different response formats
      if (data && data.error) {
        setError(data.error);
        setWorkloadData([]);
      } else if (Array.isArray(data)) {
        setWorkloadData(data);
      } else {
        console.log('Received data:', data);
        setError('Invalid data format received');
        setWorkloadData([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.message);
      setWorkloadData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = Array.isArray(workloadData) ? workloadData.filter(item => {
    return (filters.department === 'All' || item.department === filters.department) &&
           (filters.dataType === 'All' || item.data_type === filters.dataType);
  }) : [];

  const departments = Array.isArray(workloadData) ? 
    [...new Set(workloadData.map(item => item.department))] : [];

  return (
    <div className="App">
      <header className="App-header">
        <h1>Faculty Workload Dashboard</h1>
        <button onClick={loadData} className="refresh-btn">
          Refresh Data
        </button>
      </header>

      <div className="filters">
        <select 
          value={filters.department} 
          onChange={(e) => setFilters({...filters, department: e.target.value})}
        >
          <option value="All">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        <select 
          value={filters.dataType} 
          onChange={(e) => setFilters({...filters, dataType: e.target.value})}
        >
          <option value="All">All Data Types</option>
          <option value="Demo">Demo</option>
          <option value="Real">Real</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading workload data...</div>
      ) : error ? (
        <div className="error">
          <h3>Error: {error}</h3>
          <p>Check console for details and ensure your Google Apps Script is deployed correctly.</p>
        </div>
      ) : (
        <div className="dashboard">
          <div className="chart-section">
            <WorkloadChart data={filteredData} />
          </div>
          
          <div className="table-section">
            <FacultyTable data={filteredData} />
          </div>
          
          <div className="insights-section">
            <Insights />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;