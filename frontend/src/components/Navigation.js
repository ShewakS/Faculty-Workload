import React from 'react';
import './Navigation.css';

const Navigation = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview Dashboard', icon: '📊' },
    { id: 'workload', label: 'Faculty Workload', icon: '👥' },
    { id: 'heatmap', label: 'Department Heatmap', icon: '🔥' },
    { id: 'faculty-detail', label: 'Faculty Detail', icon: '👤' },
    { id: 'recommendations', label: 'AI Recommendations', icon: '🤖' },
    { id: 'reports', label: 'Reports', icon: '📋' }
  ];

  return (
    <nav className="navigation">
      <div className="nav-header">
        <h1>Faculty Workload Management System</h1>
        <div className="subtitle">Academic Resource Planning & Analytics</div>
      </div>
      <ul className="nav-menu">
        {menuItems.map(item => (
          <li key={item.id} className={activeTab === item.id ? 'active' : ''}>
            <button onClick={() => setActiveTab(item.id)}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;