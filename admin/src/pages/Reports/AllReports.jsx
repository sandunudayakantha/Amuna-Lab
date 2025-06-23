import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const ReportsPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [testReports, setTestReports] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [invoicesResponse, reportsResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/invoices`),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/testReports`).catch(error => {
          // If we get a 404, return an empty array
          if (error.response && error.response.status === 404) {
            return { data: [] };
          }
          throw error;
        })
      ]);
      
      console.log("Fetched invoices:", invoicesResponse.data);
      console.log("Fetched reports:", reportsResponse.data);

      // Ensure we have the full invoice data with populated fields
      const populatedInvoices = await Promise.all(
        invoicesResponse.data.map(async (invoice) => {
          try {
            const populatedInvoice = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/invoices/${invoice._id}`);
            console.log("Populated invoice:", populatedInvoice.data);
            return populatedInvoice.data;
          } catch (error) {
            console.error(`Error fetching invoice ${invoice._id}:`, error);
            return invoice;
          }
        })
      );

      setInvoices(populatedInvoices);
      setTestReports(reportsResponse.data);
      filterData(populatedInvoices, reportsResponse.data, activeTab, searchQuery);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Initialize empty arrays on error
      setInvoices([]);
      setTestReports([]);
      setFilteredData([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filterData = (invoices, reports, tab, query) => {
    let filtered = [];

    if (tab === "pending") {
      // Filter invoices that have tests but no completed reports
      filtered = invoices.filter((invoice) => {
        // Check if invoice has testTemplates array with at least one item
        const hasTests = Array.isArray(invoice.testTemplates) && invoice.testTemplates.length > 0;
        
        // Check if there are any completed reports for this invoice
        const hasCompletedReports = reports.some(
          report => report.invoiceId === invoice._id && report.completeStatus
        );

        // Debug logging for each invoice
        console.log("Invoice:", invoice._id);
        console.log("Has tests:", hasTests);
        console.log("Has completed reports:", hasCompletedReports);
        console.log("Test templates:", invoice.testTemplates);
        console.log("Patient ID:", invoice.userId?._id);
        console.log("Invoice ID:", invoice._id);

        return hasTests && !hasCompletedReports;
      });
    } else if (tab === "completed") {
      // Filter completed test reports and get their associated invoice data
      const completedReports = reports.filter(report => report.completeStatus);
      filtered = completedReports.map(report => {
        const invoice = invoices.find(inv => inv._id === report.invoiceId);
        return {
          ...report,
          invoiceData: invoice || null
        };
      });
    }

    if (query) {
      if (tab === "pending") {
        filtered = filtered.filter(
          (invoice) =>
            invoice._id.toString().includes(query) ||
            (invoice.userId && (
              invoice.userId.name?.toLowerCase().includes(query.toLowerCase()) ||
              invoice.userId.phone?.includes(query)
            ))
        );
      } else {
        filtered = filtered.filter(
          (report) =>
            report._id.toString().includes(query) ||
            report.invoiceId.toString().includes(query) ||
            (report.invoiceData?.userId && (
              report.invoiceData.userId.name?.toLowerCase().includes(query.toLowerCase()) ||
              report.invoiceData.userId.phone?.includes(query)
            ))
        );
      }
    }

    setFilteredData(filtered);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    filterData(invoices, testReports, tab, searchQuery);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterData(invoices, testReports, activeTab, query);
  };

  const handleViewReport = (reportId) => {
    navigate(`/reports/${reportId}`);
  };

  const handleUpdateReport = (reportId) => {
    navigate(`/update-report/${reportId}`);
  };

  const handleDeleteClick = (report) => {
    setReportToDelete(report);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/testReports/${reportToDelete._id}`);
      setShowDeleteConfirm(false);
      setReportToDelete(null);
      fetchData(); // Refresh the data
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("Failed to delete report. Please try again.");
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setReportToDelete(null);
  };

  // Function to refresh data
  const refreshData = () => {
    fetchData();
  };

  return (
    <div className="p-6 bg-gray-100 rounded-xl">
      <h1 className="text-2xl font-bold mb-4">Test Reports</h1>

      <div className="mb-6">
        <input 
          type="text"
          placeholder={activeTab === "pending" 
            ? "Search by Invoice ID, Patient Name, or Phone"
            : "Search by Report ID, Invoice ID, or Patient Name"}
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-2 border border-black rounded-xl"

        />
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => handleTabChange("pending")}
          className={`px-4 py-2 rounded-xl ${
            activeTab === "pending"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => handleTabChange("completed")}
          className={`px-4 py-2 rounded-xl ${
            activeTab === "completed"
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Completed
        </button>
      </div>

      <div className="bg-white p-4  shadow border border-black rounded-xl">
        <h2 className="text-xl font-bold mb-4">
          {activeTab === "pending" ? "Pending Reports" : "Completed Reports"}
        </h2>
        {filteredData.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border border-black rounded-xl">
                {activeTab === "pending" ? (
                  <>
                    <th className="p-2 text-left">Invoice ID</th>
                    <th className="p-2 text-left">Patient Name</th>
                    <th className="p-2 text-left">Phone</th>
                    <th className="p-2 text-left">Tests</th>
                    <th className="p-2 text-left">Actions</th>
                  </>
                ) : (
                  <>
                    <th className="p-2 text-left">Report ID</th>
                    <th className="p-2 text-left">Invoice ID</th>
                    <th className="p-2 text-left">Patient Name</th>
                    <th className="p-2 text-left">Template</th>
                    <th className="p-2 text-left">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {activeTab === "pending" ? (
                filteredData.map((invoice) => (
                  <tr key={invoice._id} className="border-b">
                    <td className="p-2">{invoice._id}</td>
                    <td className="p-2">{invoice.userId?.name || 'N/A'}</td>
                    <td className="p-2">{invoice.userId?.phone || 'N/A'}</td>
                    <td className="p-2">
                      {invoice.testTemplates?.map(test => test.name).join(', ') || 'N/A'}
                    </td>
                    <td className="p-2">
                      {invoice.testTemplates?.map((template, index) => {
                        console.log("Creating link for template:", template);
                        console.log("Invoice ID:", invoice._id);
                        console.log("Patient ID:", invoice.userId?._id);
                        return (
                          <Link
                            key={template._id}
                            to={`/create-report/${template._id}?invoiceId=${invoice._id}&patientId=${invoice.userId?._id}`}
                            className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 ml-5"
                          >
                            Enter Results {template.name}
                          </Link>
                        );
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                filteredData.map((report) => (
                  <tr key={report._id} className="border-b">
                    <td className="p-2">{report._id}</td>
                    <td className="p-2">{report.invoiceId}</td>
                    <td className="p-2">{report.invoiceData?.userId?.name || 'N/A'}</td>
                    <td className="p-2">{report.templateId?.templateName || 'N/A'}</td>
                    <td className="p-2 flex space-x-2">
                      <button
                        onClick={() => handleViewReport(report._id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-2xl hover:bg-blue-600"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleUpdateReport(report._id)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-2xl hover:bg-yellow-600"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDeleteClick(report)}
                        className="px-4 py-2 bg-red-500 text-white rounded-2xl hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <p>No {activeTab === "pending" ? "pending" : "completed"} reports found.</p>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="mb-4">
              Are you sure you want to delete this report? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;