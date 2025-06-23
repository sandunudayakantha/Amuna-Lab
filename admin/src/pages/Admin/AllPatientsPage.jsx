import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AdminContext } from '../../context/AdminContext';
import { FaTrash } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import { IoPersonAddSharp } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IoIosDownload } from "react-icons/io";
import { FaSearch } from "react-icons/fa";

const AllPatientsPage = () => {
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]); // For filtered patients
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState(''); // For search input

    const { backendUrl, aToken } = useContext(AdminContext);
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate('/add-patient'); // Navigate to the patients list page on button click
    };

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`${backendUrl}/api/admin/delete-patient/${id}`, {
                headers: { aToken }
            });
    
            if (response.data.success) {
                toast.success(response.data.message); // Show success toast
                // Remove the deleted patient from both the patients and filteredPatients state
                setPatients((prevPatients) => prevPatients.filter(patient => patient._id !== id));
                setFilteredPatients((prevFilteredPatients) => prevFilteredPatients.filter(patient => patient._id !== id));
            } else {
                toast.error(response.data.message); // Show error toast
            }
        } catch (err) {
            console.error('Delete error:', err);
            toast.error('Failed to delete patient');
        }
    };
    

    const navigateEdit = (id) => {
        navigate(`/edit-patient/${id}`);
    };

    useEffect(() => {
        // Fetch all patients from the backend
        const fetchPatients = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/admin/all-patient`, {
                    headers: { aToken },
                }); // Adjust the API URL if necessary
                setPatients(response.data.patients);  // Assuming the response has a 'patients' field
                setFilteredPatients(response.data.patients); // Set both for initial display
                setLoading(false);
            } catch (err) {
                setError('Error fetching patients');
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);


    const handleDownloadReport = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/admin/report/patients`, {
                headers: { aToken },
                responseType: 'blob', // Important for binary file
            });
    
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'Patients_Report.xlsx';
            link.click();
            toast.success("Patients report downloaded successfully");
        } catch (err) {
            console.error("Download error:", err);
            toast.error("Failed to download patient report");
        }
    };
    

    // Filter patients based on the search query
    const handleSearch = () => {
        if (!patients || !Array.isArray(patients)) {
            setFilteredPatients([]);
            return;
        }

        const result = patients.filter(patient => {
            if (!patient) return false;
            const name = patient.name || '';
            const nic = patient.nic || '';
            return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   nic.toLowerCase().includes(searchQuery.toLowerCase());
        });
        setFilteredPatients(result);
    };

    // Reset search query and show all patients
    const resetSearch = () => {
        setSearchQuery('');
        setFilteredPatients(patients); // Reset the filtered patients to all
    };

    const BouncingDots = () => {
        return (
            <div className="w-screen h-screen flex items-center justify-center">
                <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.6s]"></div>
                </div>
            </div>
        );
    };

    if (loading) {
        return <BouncingDots />;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
  <h1 className="text-2xl font-bold mb-4">Lab Patients</h1>

  {/* Flex container to hold both sides */}
  <div className="flex justify-between items-center mb-4 flex-wrap gap-2">

    {/* Search Bar on the left */}
    <div className="flex items-center">
      <input
        type="text"
        placeholder="Search by Name or NIC"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          if (e.target.value === '') {
            resetSearch(); // Show all patients if query is cleared
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

    {/* Buttons on the right */}
    <div className="flex items-center gap-3">
      <button
        onClick={handleNavigate}
        className="flex items-center gap-2 border border-primary text-primary bg-white py-2 px-4 rounded-md text-base font-medium shadow-sm hover:bg-primary hover:text-white transition-all hover:scale-105 duration-300 ease-in-out"
      >
        <IoPersonAddSharp className="text-lg" />
        Add Patient
      </button>

      <button
        onClick={handleDownloadReport}
        className="flex items-center gap-2 border border-primary text-primary bg-white py-2 px-4 rounded-md text-base font-medium shadow-sm hover:bg-primary hover:text-white transition-all hover:scale-105 duration-300 ease-in-out"
      >
        <IoIosDownload className="text-lg" />
        Download Report
      </button>
    </div>

  </div>


            
            {/* No results message */}
            {filteredPatients.length === 0 && searchQuery && (
                <div className="text-center text-gray-500 mt-4">No results found for "{searchQuery}"</div>
            )}
    
            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="min-w-full table-auto">
                    <thead className="bg-primary bg-opacity-40 text-black font-extralight rounded-lg">
                        <tr>
                            <th className="px-4 py-2 border-b">Name</th>
                            <th className="px-4 py-2 border-b">NIC</th>
                            <th className="px-4 py-2 border-b">Age</th>
                            <th className="px-4 py-2 border-b">Gender</th>
                            <th className="px-4 py-2 border-b">Email</th>
                            <th className="px-4 py-2 border-b">Address</th>
                            <th className="px-4 py-2 border-b">Mobile</th>
                            <th className="px-4 py-2 border-b">Action</th>
                        </tr>
                    </thead>
                    <tbody className='text-gray-700 text-center text-sm'>
                        {filteredPatients.map((patient) => (
                            <tr key={patient._id} className='text-center hover:bg-primary hover:bg-opacity-10'>
                                <td className="px-4 py-2 border-b">{patient.Rname}</td>
                                <td className="px-4 py-2 border-b">{patient.Rnic}</td>
                                <td className="px-4 py-2 border-b">{patient.Rage}</td>
                                <td className="px-4 py-2 border-b">{patient.Rgender}</td>
                                <td className="px-4 py-2 border-b">{patient.Remail}</td>
                                <td className="px-4 py-2 border-b">{patient.Raddress}</td>
                                <td className="px-4 py-2 border-b">{patient.Rmobile}</td>
                                <td className="px-4 py-2 border-b">
                                    <div className='flex flex-row justify-between'>
                                        <button onClick={() => navigateEdit(patient._id)} className="border border-green-500 text-green-500 py-1.5 px-3 rounded text-sm hover:bg-green-500 hover:text-white transition-all hover:scale-110 duration-500 ease-in-out">
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleDelete(patient._id)} className="border border-red-500 text-red-500 py-1.5 px-3 rounded text-sm hover:bg-red-500 hover:text-white transition-all hover:scale-110 duration-500 ease-in-out">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
};

export default AllPatientsPage;
