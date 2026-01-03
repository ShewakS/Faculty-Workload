import React, { useState, useEffect } from 'react';
import './App_new.css';
import Navigation from './components/Navigation';
import Overview from './components/Overview';
import FacultyTable from './components/FacultyTable';
import DepartmentHeatmap from './components/DepartmentHeatmap';
import WorkloadChart from './components/WorkloadChart';
import Insights from './components/Insights';
import { fetchWorkloadData } from './api/api';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [workloadData, setWorkloadData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    department: 'All',
    dataType: 'All',
    searchTerm: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWorkloadData();
      
      if (data && data.error) {
        setError(data.error);
        setWorkloadData([]);
      } else if (Array.isArray(data)) {
        setWorkloadData(data);
      } else {
        setError('Invalid data format received');
        setWorkloadData([]);
      }
    } catch (error) {
      setError(error.message);
      setWorkloadData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = Array.isArray(workloadData) ? workloadData.filter(item => {
    const matchesDept = filters.department === 'All' || item.department === filters.department;
    const matchesType = filters.dataType === 'All' || item.data_type === filters.dataType;
    const matchesSearch = !filters.searchTerm || 
      item.faculty.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(filters.searchTerm.toLowerCase());
    return matchesDept && matchesType && matchesSearch;
  }) : [];

  const departments = Array.isArray(workloadData) ? 
    [...new Set(workloadData.map(item => item.department))] : [];

  const renderContent = () => {
    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    switch(activeTab) {
      case 'overview':
        return <Overview />;
      case 'workload':
        return (
          <div className="workload-section">
            <div className="filters">
              <input
                type="text"
                placeholder="Search faculty or subject..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                className="search-input"
              />
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
            <WorkloadChart data={filteredData} />
            <FacultyTable data={filteredData} />
          </div>
        );
      case 'heatmap':
        return <DepartmentHeatmap />;
      case 'faculty-detail':
        return <FacultyTable data={filteredData} />;
      case 'recommendations':
        return <Insights />;
      case 'reports':
        const handleExportPDF = async () => {
          try {
            const response = await fetch('http://localhost:5000/api/export-pdf', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(filteredData)
            });
            
            if (response.ok) {
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `Faculty_Workload_Report_${new Date().toISOString().split('T')[0]}.pdf`);
              document.body.appendChild(link);
              link.click();
              link.parentNode.removeChild(link);
            } else {
              alert('Failed to generate PDF');
            }
          } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Error exporting PDF: ' + error.message);
          }
        };
        
        return (
          <div className="reports">
            <h2>📋 Reports</h2>
            <div className="report-actions">
              <button onClick={handleExportPDF}>Export as PDF</button>
              <button onClick={loadData}>Refresh Data</button>
            </div>
            <WorkloadChart data={filteredData} />
            <FacultyTable data={filteredData} />
          </div>
        );
      default:
        return <Overview />;
    }
  };

  return (
    <div className="App">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;