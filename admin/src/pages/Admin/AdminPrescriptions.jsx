import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AdminContext } from '../../context/AdminContext';
import {toast} from 'react-toastify'
import { FaTrash } from "react-icons/fa";
import { IoIosDownload } from "react-icons/io";
import { FaSearch } from "react-icons/fa";

const AdminPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const { backendUrl, aToken } = useContext(AdminContext);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch prescriptions on page load
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await axios.get(backendUrl + '/api/admin/prescriptions', {
          headers: { aToken },
        });
        setPrescriptions(response.data.data);  // Ensure the data includes image URL
        setFilteredPrescriptions(response.data.data);
      } catch (err) {
        setError('Failed to load prescriptions.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [backendUrl, aToken]);

  const handleViewImage = (url) => {
    setImageUrl(url);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const deletePrescription = async (prescriptionId) => {
    try {
      const response = await axios.delete(`${backendUrl}/api/admin/prescriptions/${prescriptionId}`, {
        headers: { aToken },
      });
  
      if (response.data.success) {
        const updatedList = prescriptions.filter((prescription) => prescription._id !== prescriptionId);
        setPrescriptions(updatedList);
        setFilteredPrescriptions(updatedList); // Important to reflect UI change
        toast.success("Prescription deleted successfully");
      } else {
        alert('Failed to delete prescription');
      }
    } catch (error) {
      console.error('Error deleting prescription:', error);
      alert('An error occurred while deleting the prescription');
    }
  };
  


  const downloadPrescriptionReport = async (prescriptionId) => {
    try {
      const response = await axios.get(`${backendUrl}/api/admin/report/prescriptions/${prescriptionId}`, {
        headers: { aToken },
        responseType: 'blob', // Important for handling PDF
      });
  
      // Create a blob from the response and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription_${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
  
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download prescription PDF');
    }
  };
  
  const handleSearch = () => {
    const result = prescriptions.filter((prescription) =>
      prescription.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.patientEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPrescriptions(result);
  };

  const resetSearch = () => {
    setSearchQuery('');
    setFilteredPrescriptions(prescriptions); // Reset the filtered prescriptions to all
  };

  const BouncingDots = () => {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-primary  rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-primary  rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.6s]"></div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <BouncingDots/>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Prescriptions</h1>

      {/* Search Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search by Patient Name or Email"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value === '') {
                resetSearch(); // Show all prescriptions if query is cleared
              }
            }}
            className="h-12 p-3 pl-6 pr-6 border border-gray-300 rounded-lg shadow-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-80 md:w-96 transition-all duration-300 ease-in-out"
          />
          <button
            onClick={handleSearch}
            className="h-12 w-12 flex items-center justify-center border border-primary text-primary font-bold text-lg rounded hover:bg-primary hover:text-white transition-all hover:scale-110 duration-500 ease-in-out ml-2"
          >
            <FaSearch />
          </button>
        </div>
      </div>


      <div className="overflow-x-auto bg-white shadow-md rounded-lg ">
        <table className="min-w-full table-auto">
          <thead className="bg-primary bg-opacity-40 text-black font-extralight">
            <tr>
              <th className="px-4 py-2 border-b">Patient Name</th>
              <th className="px-4 py-2 border-b">Address</th>
              <th className="px-4 py-2 border-b"> Email</th>
              <th className="px-4 py-2 border-b">Mobile</th>
              <th className="px-4 py-2 border-b">Date</th>
              <th className="px-4 py-2 border-b">Image</th>
              <th className="px-4 py-2 border-b">Action</th>
            </tr>
          </thead>
          <tbody className='text-gray-700 text-center text-sm'>
            
            {filteredPrescriptions.map((prescription) => (
              <tr key={prescription._id} className="text-center hover:bg-primary hover:bg-opacity-10 ">
                <td className="px-4 py-2 border-b">{prescription.patientName}</td>
                <td className="px-4 py-2 border-b">{prescription.patientAddress}</td>
                <td className="px-4 py-2 border-b">{prescription.patientEmail}</td>
                <td className="px-4 py-2 border-b">{prescription.patientPhone}</td>
                <td className="px-4 py-2 border-b">{new Date(prescription.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2 border-b">
                  {prescription.prescriptionImage ? (
                    
                    <button
                      className="border border-green-500 text-green-500 py-1 px-3 font-medium rounded text-sm hover:bg-green-500 hover:text-white transition-all hover:scale-110 duration-500 ease-in-out"
                      onClick={() => handleViewImage(prescription.prescriptionImage)}
                    >
                      View Image
                    </button>
                  ) : (
                    <span>No Image</span>
                  )}
                </td>
                
                <td className="px-4 py-2 border-b">
  <div className="flex items-center gap-2">
    
    <button
      onClick={() => downloadPrescriptionReport(prescription._id)}
      className="flex items-center gap-2 border border-primary text-primary py-1 px-3 rounded-md text-sm font-medium hover:bg-primary hover:text-white transition-transform transform hover:scale-105 duration-300"
    >
      <IoIosDownload className="text-lg" />
      Download
    </button>

    <button
      onClick={() => deletePrescription(prescription._id)}
      className="border border-red-500 text-red-500 py-1.5 px-3 rounded hover:bg-red-500 hover:text-white transition-all hover:scale-110 duration-500 ease-in-out"
    >
      <FaTrash />
    </button>
  </div>
</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal to view prescription image */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-lg">
            <img src={imageUrl} alt="Prescription"  className="max-w-[400px] w-full h-auto mx-auto" />
            <button
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white py-1 px-3 rounded"
              onClick={handleCloseModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrescriptions;
