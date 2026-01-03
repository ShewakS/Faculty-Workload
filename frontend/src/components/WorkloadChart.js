import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const WorkloadChart = ({ data }) => {
  // Handle empty or invalid data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="workload-chart">
        <h3>Faculty Workload Distribution</h3>
        <p>No data available to display chart.</p>
      </div>
    );
  }

  // Aggregate data by faculty
  const facultyData = {};
  data.forEach(item => {
    const key = `${item.faculty} (${item.department})`;
    if (!facultyData[key]) {
      facultyData[key] = {
        totalWorkload: 0,
        status: item.status
      };
    }
    facultyData[key].totalWorkload += item.workload_score || 0;
  });

  const labels = Object.keys(facultyData);
  const workloadScores = Object.values(facultyData).map(f => f.totalWorkload);
  const backgroundColors = Object.values(facultyData).map(f => {
    switch (f.status) {
      case 'Overloaded': return '#ff6b6b';
      case 'Underutilized': return '#51cf66';
      case 'Balanced': return '#ffd43b';
      default: return '#868e96';
    }
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Total Workload Score',
        data: workloadScores,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color.replace('0.6', '1')),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Faculty Workload Distribution',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="workload-chart">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default WorkloadChart;