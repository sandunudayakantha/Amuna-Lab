import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AdminContext } from '../../context/AdminContext';
import { useContext } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

const UpdateStaffProfile = () => {
    const navigate = useNavigate();
    const { backendUrl } = useContext(AdminContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        nic: '',
        dateOfBirth: ''
    });

    useEffect(() => {
        fetchStaffProfile();
    }, []);

    const fetchStaffProfile = async () => {
        try {
            const sToken = localStorage.getItem('sToken');
            if (!sToken) {
                navigate('/login');
                return;
            }

            const response = await axios.get(`${backendUrl}/api/staff/profile`, {
                headers: { Authorization: `Bearer ${sToken}` }
            });

            if (response.data.success) {
                const { name, email, phone, address, nic, dateOfBirth } = response.data.staff;
                setFormData({
                    name,
                    email,
                    phone,
                    address,
                    nic,
                    dateOfBirth: new Date(dateOfBirth).toISOString().split('T')[0]
                });
            }
        } catch (error) {
            console.error('Error fetching staff profile:', error);
            setError('Failed to fetch profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            const sToken = localStorage.getItem('sToken');
            if (!sToken) {
                navigate('/login');
                return;
            }

            const response = await axios.put(
                `${backendUrl}/api/staff/update`,
                formData,
                {
                    headers: { Authorization: `Bearer ${sToken}` }
                }
            );

            if (response.data.success) {
                setSuccess('Profile updated successfully');
                setTimeout(() => {
                    navigate('/staff/dashboard');
                }, 2000);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setError(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.6s]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
                >
                    <FaArrowLeft />
                    Back
                </button>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Update Profile</h1>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Phone
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Address
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                NIC
                            </label>
                            <input
                                type="text"
                                name="nic"
                                value={formData.nic}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
                            >
                                {loading ? 'Updating...' : 'Update Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdateStaffProfile; 