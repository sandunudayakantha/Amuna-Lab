import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AIAnalysisPage = () => {
  const [invoiceId, setInvoiceId] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ai-analysis`, { invoiceId });
      if (response.data.success) {
        setAnalysis(response.data.analysis);
        toast.success('Analysis completed successfully');
      } else {
        setError(response.data.message || 'Failed to analyze invoice');
        toast.error(response.data.message || 'Failed to analyze invoice');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error analyzing invoice');
      toast.error(err.response?.data?.message || 'Error analyzing invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Test Report Analysis</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="invoiceId" className="block text-sm font-medium text-gray-700 mb-2">
              Invoice ID
            </label>
            <input
              type="text"
              id="invoiceId"
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-primary text-white px-6 py-3 rounded-lg font-medium transition-colors
              ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-dark'}`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              'Analyze Invoice'
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {analysis && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Patient Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{analysis.patientInfo.name}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-medium">{analysis.patientInfo.age}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium">{analysis.patientInfo.gender}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Results</h2>
            <div className="space-y-4">
              {analysis.testResults.map((test, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">{test.testName}</h3>
                  <div className="flex items-center mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium
                      ${test.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                        test.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {test.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {test.results.map((result, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-gray-600">{result.testName}</span>
                        <span className="font-medium">
                          {result.result} {result.unit || ''}
                        </span>
                      </div>
                    ))}
                  </div>
                  {test.comments && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Comments: {test.comments}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Total Tests</p>
                <p className="text-2xl font-bold text-primary">{analysis.summary.totalTests}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Completed Tests</p>
                <p className="text-2xl font-bold text-green-600">{analysis.summary.completedTests}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Pending Tests</p>
                <p className="text-2xl font-bold text-yellow-600">{analysis.summary.pendingTests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">AI Analysis</h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{analysis.aiAnalysis}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisPage; 