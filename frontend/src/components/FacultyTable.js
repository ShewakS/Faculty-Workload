import React from 'react';

const FacultyTable = ({ data }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Overloaded': return '#ffcdd2';
      case 'Underutilized': return '#c8e6c9';
      case 'Balanced': return '#fff9c4';
      default: return '#ffffff';
    }
  };

  return (
    <div className="faculty-table">
      <h2>Faculty Workload Details</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Faculty</th>
              <th>Department</th>
              <th>Subject</th>
              <th>Teaching Hours</th>
              <th>Lab Hours</th>
              <th>Workload Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} style={{ backgroundColor: getStatusColor(item.status) }}>
                <td>{item.faculty}</td>
                <td>{item.department}</td>
                <td>{item.subject}</td>
                <td>{item.teaching_hours}</td>
                <td>{item.lab_hours}</td>
                <td>{item.workload_score}</td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacultyTable;