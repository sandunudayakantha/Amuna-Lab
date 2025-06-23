import { AdminContext } from '../../context/AdminContext';
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory
import {toast} from 'react-toastify'
import { IoMdArrowRoundBack } from "react-icons/io";

const AddPatientPage = () => {
    const [patientData, setPatientData] = useState({
        Rname: '',
        Rnic: '',
        Rage: '',
        Rgender: '',
        Remail: '',
        Raddress: '',
        Rmobile: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Use navigate hook for navigation

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
    
        if (!/\S+@\S+\.\S+/.test(Remail)) {
            toast.error("Please enter a valid email.");
            return false;
        }

        if (!(Rnic.length === 10 || Rnic.length === 12)) {
        toast.error("NIC must be either 10 or 12 characters long.");
            return false;
          }
          
         
          const nicPattern = /^[0-9]{9}[vV]$|^[0-9]{12}$/; // 10 char (9 digits + v/V) or 12 digits
          if (!nicPattern.test(Rnic)) {
            toast.error("Invalid NIC format.");
            return false;
          }

          if (!/^\d{10}$/.test(Rmobile)) {
            toast.error("Mobile number must be exactly 10 digits.");
            return false;
          }
          
    
        return true;
    };
    

    const handleChange = (e) => {
        const { name, value } = e.target;
      
        if (name === 'Rmobile') {
          // Allow only digits and limit to 10 characters
          const formattedValue = value.replace(/\D/g, ''); // remove non-digits
      
          if (formattedValue.length > 10) return;
      
          setPatientData({
            ...patientData,
            [name]: formattedValue
          });
        } 
        else if (name === 'Rnic') {
          const formattedValue = value.replace(/[^0-9vV]/g, '').toUpperCase();
          if (formattedValue.length > 12) return;
      
          setPatientData({
            ...patientData,
            [name]: formattedValue
          });
        } 
        else {
          setPatientData({
            ...patientData,
            [name]: value
          });
        }
      };
      

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        try {
            const response = await axios.post(backendUrl + '/api/admin/add-patient', patientData, {
                headers: { aToken },
            }); // API endpoint to add patient
            setLoading(false);
            toast.success("Patient Added Successfully")
            navigate('/patients');
        } catch (err) {
            setLoading(false);
            toast.error('Error adding patient. Please try again');
        }
    };

     const handleBack = () => {
        navigate('/patients'); // Navigate back to the patient page
    };

    return (
        <div className="container mx-auto p-4 max-w-6xl max-h-[100vh] overflow-y-scroll">
            <div>
                <button onClick={handleBack}
                 className="mb-5 border border-primary text-primary py-1 px-3 rounded text-sm hover:bg-primary hover:text-white transition-all hover:scale-110 duration-500 ease-in-out">
                    <IoMdArrowRoundBack className='text-2xl'/></button>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-center">Add Patient</h1>

            {error && <div className="text-red-500 mb-4">{error}</div>}
            <div className="bg-primary bg-opacity-20 p-10 rounded-lg shadow-lg mb-6 max-w-lg mx-auto">
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                        type="text"
                        name="Rname"
                        value={patientData.Rname}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">NIC</label>
                    <input
                        type="text"
                        name="Rnic"
                        value={patientData.Rnic}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Age</label>
                    <input
                        type="number"
                        name="Rage"
                        value={patientData.Rage}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select
                        name="Rgender"
                        value={patientData.Rgender}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        name="Remail"
                        value={patientData.Remail}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <input
                        type="text"
                        name="Raddress"
                        value={patientData.Raddress}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Mobile</label>
                    <input
                        type="text"
                        name="Rmobile"
                        value={patientData.Rmobile}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full p-2 bg-blue-500 text-white rounded"
                    disabled={loading}
                >
                    {loading ? 'Adding Patient...' : 'Add Patient'}
                </button>
            </form>
            </div>
        </div>
    );
};

export default AddPatientPage;
