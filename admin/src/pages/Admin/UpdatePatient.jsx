import { AdminContext } from '../../context/AdminContext';
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IoMdArrowRoundBack } from "react-icons/io";

const UpdatePatientPage = () => {
    const { id } = useParams();
    const [patientData, setPatientData] = useState({
        Rname: '',
        Rnic: '',
        Rage: '',
        Rgender: '',
        Remail: '',
        Raddress: '',
        Rmobile: ''
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { backendUrl, aToken } = useContext(AdminContext);

    const validateForm = () => {
        const { Rnic, Rname, Rage, Rgender, Remail, Raddress, Rmobile } = patientData;
    
        if (!Rnic || !Rname || !Rage || !Rgender || !Remail || !Raddress || !Rmobile) {
            toast.error("All fields are required!");
            return false;
        }
    
        if (Rnic.trim() === '') {
            toast.error("NIC cannot be empty.");
            return false;
        }
    
        if (!(Rnic.length === 10 || Rnic.length === 12)) {
            toast.error("NIC must be either 10 or 12 characters long.");
            return false;
        }
    
        const nicPattern = /^[0-9]{9}[vV]$|^[0-9]{12}$/;
        if (!nicPattern.test(Rnic)) {
            toast.error("Invalid NIC format. Must be numbers and optionally end with 'V'.");
            return false;
        }
    
        if (!/\S+@\S+\.\S+/.test(Remail)) {
            toast.error("Please enter a valid email address.");
            return false;
        }

        if (!/^\d{10}$/.test(Rmobile)) {
            toast.error("Mobile number must be exactly 10 digits.");
            return false;
        }
        
    
        return true;
    };
    

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                setFetching(true);
                const response = await axios.get(`${backendUrl}/api/admin/patient/${id}`, {
                    headers: { aToken }
                });
                
                if (response.data.patient) {
                    // Exclude id and v from the patient data if they are present
                    const { _id, __v, ...filteredData } = response.data.patient;
                    setPatientData(filteredData);
                } else {
                    throw new Error('Patient data not found in response');
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.response?.data?.message || 'Error fetching patient data');
                toast.error('Failed to load patient data');
            } finally {
                setFetching(false);
            }
        };

        if (id) {
            fetchPatient();
        }
    }, [id, backendUrl, aToken]);

    
    const handleChange = (e) => {
        const { name, value } = e.target;
    
        if (name === 'Rnic') {
            let formattedValue = value.replace(/[^0-9vV]/g, '').toUpperCase();
            if (formattedValue.length > 12) return;
    
            setPatientData({
                ...patientData,
                [name]: formattedValue,
            });
        } else if (name === 'Rmobile') {
            // Only allow digits and limit to 10 characters
            const formattedValue = value.replace(/\D/g, '');
            if (formattedValue.length > 10) return;
    
            setPatientData({
                ...patientData,
                [name]: formattedValue,
            });
        } else {
            setPatientData({
                ...patientData,
                [name]: value,
            });
        }
    };
    
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return; 
        setLoading(true);
        setError('');
    
        try {
            const response = await axios.put(
                `${backendUrl}/api/admin/edit-patient/${id}`,
                patientData,
                { headers: { aToken } }
            );
    
            console.log('Update Response:', response);  // Log the full response to verify
    
            // Check for the success message in response
            if (response.data.message === 'Patient updated successfully') {
                toast.success("Patient updated successfully!");
                navigate('/patients');
            } else {
                // If something goes wrong and the message is not as expected, show an error
                throw new Error(response.data.message || 'Update failed');
            }
        } catch (err) {
            console.error('Update error:', err);
            setError(err.response?.data?.message || 'Error updating patient');
            toast.error(err.response?.data?.message || 'Failed to update patient');
        } finally {
            setLoading(false);
        }
    };
    

    const handleBack = () => {
        navigate('/patients');
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


    if (fetching) {
        return (
            <BouncingDots/>
            
        );
    }

    if (error && !fetching) {
        return (
            <div className="container mx-auto p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
                <button 
                    onClick={handleBack}
                    className="bg-primary text-white py-2 px-4 rounded"
                >
                    Back to Patients
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-6xl max-h-[100vh] overflow-y-scroll">
            <div>
                <button 
                    onClick={handleBack}
                    className="mb-5 border border-primary text-primary py-1 px-3 rounded text-sm hover:bg-primary hover:text-white transition-all hover:scale-110 duration-500 ease-in-out"
                >
                    <IoMdArrowRoundBack className='text-2xl' />
                </button>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-center">Edit Patient</h1>

            <div className="bg-primary bg-opacity-20 p-10 rounded-lg shadow-lg mb-6 max-w-lg mx-auto">
                <form onSubmit={handleSubmit}>
                    {Object.entries(patientData).map(([field, value]) => (
                        <div className="mb-4" key={field}>
                            <label className="block text-sm font-medium mb-1 capitalize">
                                {field.slice(1)}
                            </label>
                            {field === 'Rgender' ? (
                                <select
                                    name={field}
                                    value={value}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            ) : (
                                <input
                                    type={field === 'Rage' ? 'number' : 
                                          field === 'Remail' ? 'email' : 
                                          field === 'Rmobile' ? 'text' : 'text'}
                                    name={field}
                                    value={value}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    required
                                    min={field === 'Rage' ? 0 : undefined}
                                />
                            )}
                        </div>
                    ))}
                    <button
                        type="submit"
                        className={`w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Updating...
                            </span>
                        ) : 'Update Patient'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdatePatientPage;
