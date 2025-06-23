import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaDownload, FaChartBar, FaFilter } from 'react-icons/fa';
import { saveAs } from 'file-saver';

const IssuedItemsReport = () => {
  const [issuedItems, setIssuedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    fetchIssuedItems();
  }, [selectedMonth]);

  const fetchIssuedItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/inventory/issued-items${selectedMonth ? `?month=${selectedMonth}` : ''}`);
      if (response.data && Array.isArray(response.data)) {
        setIssuedItems(response.data);
        generateAnalysis(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching issued items:', err);
      setError(err.response?.data?.message || 'Error fetching issued items. Please try again later.');
      setIssuedItems([]);
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  const generateAnalysis = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      setAnalysis(null);
      return;
    }

    const analysis = {
      totalItems: items.length,
      totalQuantity: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
      departments: {},
      items: {},
      monthlyTrend: {}
    };

    items.forEach(item => {
      if (!item) return;

      // Department analysis
      if (item.department) {
        analysis.departments[item.department] = (analysis.departments[item.department] || 0) + (item.quantity || 0);
      }
      
      // Item analysis
      if (item.itemName) {
        analysis.items[item.itemName] = (analysis.items[item.itemName] || 0) + (item.quantity || 0);
      }
      
      // Monthly trend
      if (item.issueDate) {
        const month = new Date(item.issueDate).toLocaleString('default', { month: 'long' });
        analysis.monthlyTrend[month] = (analysis.monthlyTrend[month] || 0) + (item.quantity || 0);
      }
    });

    setAnalysis(analysis);
  };

  const handleDownloadReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/inventory/issued-items/report${selectedMonth ? `?month=${selectedMonth}` : ''}`,
        { responseType: 'blob' }
      );
      
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `issued-items-report-${selectedMonth || 'all'}.xlsx`);
    } catch (err) {
      setError('Error downloading report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMonths = () => {
    const months = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push(date.toISOString().slice(0, 7));
    }
    return months;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FaChartBar className="text-2xl text-primary" />
            <h1 className="text-2xl font-bold text-gray-800">Issued Items Report</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Time</option>
                {getMonths().map((month) => (
                  <option key={month} value={month}>
                    {new Date(month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleDownloadReport}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaDownload />
              Download Report
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && issuedItems.length === 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">No issued items found for the selected period.</p>
              </div>
            </div>
          </div>
        )}

        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Summary</h3>
              <div className="space-y-2">
                <p className="text-gray-600">Total Items Issued: <span className="font-medium">{analysis.totalItems}</span></p>
                <p className="text-gray-600">Total Quantity: <span className="font-medium">{analysis.totalQuantity}</span></p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Top Departments</h3>
              <div className="space-y-2">
                {Object.entries(analysis.departments)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([dept, count]) => (
                    <p key={dept} className="text-gray-600">
                      {dept}: <span className="font-medium">{count}</span>
                    </p>
                  ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Top Items</h3>
              <div className="space-y-2">
                {Object.entries(analysis.items)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([item, count]) => (
                    <p key={item} className="text-gray-600">
                      {item}: <span className="font-medium">{count}</span>
                    </p>
                  ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issued To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {issuedItems.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                      <div className="text-sm text-gray-500">{item.itemCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.issuedTo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.issueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.returnDate ? new Date(item.returnDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 'returned' 
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'overdue'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssuedItemsReport; 