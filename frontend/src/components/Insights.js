import React, { useState, useEffect } from 'react';
import { fetchInsights } from '../api/api';

const Insights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await fetchInsights();
      setInsights(data);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  return (
    <div className="insights">
      <h2>AI Workload Insights</h2>
      <button onClick={loadInsights} className="refresh-insights-btn">
        Refresh Insights
      </button>
      
      {loading ? (
        <div className="loading">Loading insights...</div>
      ) : insights ? (
        <div className="insights-content">
          <div className="summary">
            <h3>Summary</h3>
            <p>{insights.summary}</p>
          </div>
          
          <div className="recommendations">
            <h3>Recommendations</h3>
            <ul>
              {insights.recommendations && insights.recommendations.length > 0 ? (
                insights.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))
              ) : (
                <li>No recommendations available</li>
              )}
            </ul>
          </div>
        </div>
      ) : (
        <div className="no-insights">No insights available</div>
      )}
    </div>
  );
};

export default Insights;