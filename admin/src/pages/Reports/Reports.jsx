import React from 'react'
import { useNavigate } from 'react-router-dom'

const Reports = () => {
const navigate = useNavigate();
    const handleCreateReportClick = () => {
        navigate("/create-report"); // Navigate to the create report page
      };

  return (
    <div>
      reports

      <button
        onClick={handleCreateReportClick}
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Create Report
      </button>
    </div>
  )
}

export default Reports
