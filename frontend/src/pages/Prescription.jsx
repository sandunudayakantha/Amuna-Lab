import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';  // Import toast
import 'react-toastify/dist/ReactToastify.css';  // Import toast styles

const Prescription = () => {
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAddress, setPatientAddress] = useState('');
  const [prescriptionImage, setPrescriptionImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'patientName') setPatientName(value);
    if (name === 'patientEmail') setPatientEmail(value);
    if (name === 'patientPhone') setPatientPhone(value);
    if (name === 'patientAddress') setPatientAddress(value);
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setPrescriptionImage(e.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!patientName || !patientEmail || !patientPhone || !patientAddress || !prescriptionImage) {
      setError('All fields are required.');
      return;
    }

    const formData = new FormData();
    formData.append('patientName', patientName);
    formData.append('patientEmail', patientEmail);
    formData.append('patientPhone', patientPhone);
    formData.append('patientAddress', patientAddress);
    formData.append('prescriptionImage', prescriptionImage);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/prescription`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Prescription uploaded successfully!');
      
        setTimeout(() => {
          toast.info('We will contact you shortly.', {
            position: "top-right",
            autoClose: 4500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }, 500); 
      
        setSuccess('Prescription uploaded successfully!');
        setPatientName('');
        setPatientEmail('');
        setPatientPhone('');
        setPatientAddress('');
        setPrescriptionImage(null);
      }
      
    } catch (err) {
      setError('Error uploading prescription. Please try again.');
      toast.error('Error uploading prescription. Please try again.')
    }
  };

 
  return (
    <div className="max-w-lg mx-auto p-8 bg-primary  bg-opacity-20 shadow-md rounded-lg mt-8 hover:scale-105 duration-500 ease-in-out">
      <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">Upload Prescription</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="patientName" className="block text-sm font-medium text-gray-700">Patient Name</label>
          <input
            id="patientName"
            type="text"
            name="patientName"
            value={patientName}
            onChange={handleInputChange}
            className="mt-1 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter patient's name"
          />
        </div>

        <div>
          <label htmlFor="patientEmail" className="block text-sm font-medium text-gray-700">Patient Email</label>
          <input
            id="patientEmail"
            type="email"
            name="patientEmail"
            value={patientEmail}
            onChange={handleInputChange}
            className="mt-1 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter patient's email"
          />
        </div>

        <div>
          <label htmlFor="patientPhone" className="block text-sm font-medium text-gray-700">Patient Phone</label>
          <input
            id="patientPhone"
            type="text"
            name="patientPhone"
            value={patientPhone}
            maxLength={10}
            onChange={handleInputChange}
            className="mt-1 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter patient's phone number"
          />
        </div>

        <div>
          <label htmlFor="patientAddress" className="block text-sm font-medium text-gray-700">Patient Address</label>
          <input
            id="patientAddress"
            type="text"
            name="patientAddress"
            value={patientAddress}
            onChange={handleInputChange}
            className="mt-1 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter patient's address"
          />
        </div>

        <div>
          <label htmlFor="prescriptionImage" className="block text-sm font-medium text-gray-700">Prescription Image</label>
          <input
            id="prescriptionImage"
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="mt-1 p-3 border border-gray-300 rounded-md w-full"
          />
        </div>

        

        <button
          type="submit"
          className="w-full py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition hover:scale-105 duration-500 ease-in-out"
        >
          Upload Prescription
        </button>
      </form>
    </div>
  );
};

export default Prescription;
