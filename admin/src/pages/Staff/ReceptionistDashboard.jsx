import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { FaSignOutAlt } from 'react-icons/fa'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'
import { useContext } from 'react'

const ReceptionistDashboard = () => {
    const navigate = useNavigate()
    const { backendUrl } = useContext(AdminContext)
    const [stats, setStats] = useState({
        todaysAppointments: 0,
        pendingInvoices: 0,
        totalRevenue: 0
    })
    const [recentActivity, setRecentActivity] = useState([])
    const [upcomingAppointments, setUpcomingAppointments] = useState([])
    const [loading, setLoading] = useState(true)

    const handleLogout = () => {
        localStorage.removeItem('sToken')
        localStorage.removeItem('staffRole')
        navigate('/login')
    }

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const sToken = localStorage.getItem('sToken')
                if (!sToken) {
                    navigate('/login')
                    return
                }

                // Fetch today's appointments
                const appointmentsResponse = await axios.get(`${backendUrl}/api/receptionist/appointments/today`, {
                    headers: { Authorization: `Bearer ${sToken}` }
                })
                
                // Fetch pending invoices
                const invoicesResponse = await axios.get(`${backendUrl}/api/receptionist/invoices/pending`, {
                    headers: { Authorization: `Bearer ${sToken}` }
                })
                
                // Fetch total revenue
                const revenueResponse = await axios.get(`${backendUrl}/api/receptionist/invoices/total-revenue`, {
                    headers: { Authorization: `Bearer ${sToken}` }
                })

                // Fetch recent activity
                const activityResponse = await axios.get(`${backendUrl}/api/receptionist/appointments/recent-activity`, {
                    headers: { Authorization: `Bearer ${sToken}` }
                })

                // Fetch upcoming appointments
                const upcomingResponse = await axios.get(`${backendUrl}/api/receptionist/appointments/upcoming`, {
                    headers: { Authorization: `Bearer ${sToken}` }
                })

                setStats({
                    todaysAppointments: appointmentsResponse.data.count || 0,
                    pendingInvoices: invoicesResponse.data.count || 0,
                    totalRevenue: revenueResponse.data.amount || 0
                })

                setRecentActivity(activityResponse.data.activities || [])
                setUpcomingAppointments(upcomingResponse.data.appointments || [])
                setLoading(false)
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
                if (error.response?.status === 401) {
                    handleLogout()
                }
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    const menuItems = [
        { name: 'Dashboard', path: '/receptionist/dashboard', icon: 'dashboard' },
        { name: 'Appointments', path: '/receptionist/appointments', icon: 'appointments' },
        { name: 'Create Invoice', path: '/receptionist/create-invoice', icon: 'create_invoice' },
        { name: 'Invoices', path: '/receptionist/invoices', icon: 'invoices' },
        { name: 'Update Profile', path: '/staff/update-profile', icon: 'profile' }
    ]

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.6s]"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
                <div className="p-4">
                    <h1 className="text-2xl font-bold text-primary">Receptionist</h1>
                </div>
                <nav className="mt-8">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
                        >
                            <img src={assets[item.icon]} alt={item.name} className="w-6 h-6 mr-3" />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="ml-64 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800">Receptionist Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200"
                    >
                        <FaSignOutAlt />
                        Logout
                    </button>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-semibold mb-6">Welcome to Receptionist Dashboard</h2>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-blue-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-blue-700">Today's Appointments</h3>
                            <p className="text-3xl font-bold text-blue-900">{stats.todaysAppointments}</p>
                        </div>
                        <div className="bg-green-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-green-700">Pending Invoices</h3>
                            <p className="text-3xl font-bold text-green-900">{stats.pendingInvoices}</p>
                        </div>
                        <div className="bg-yellow-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-yellow-700">Total Revenue</h3>
                            <p className="text-3xl font-bold text-yellow-900">${stats.totalRevenue}</p>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {recentActivity.map((activity, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">{activity.description}</p>
                                        <p className="text-sm text-gray-500">Patient: {activity.patientName}</p>
                                    </div>
                                    <span className="text-sm text-gray-500">{activity.timestamp}</span>
                                </div>
                            ))}
                            {recentActivity.length === 0 && (
                                <p className="text-center text-gray-500">No recent activity</p>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Appointments */}
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Upcoming Appointments</h3>
                        <div className="space-y-4">
                            {upcomingAppointments.map((appointment, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">{appointment.doctorName} - {appointment.service}</p>
                                        <p className="text-sm text-gray-500">Patient: {appointment.patientName}</p>
                                    </div>
                                    <span className="text-sm text-gray-500">{appointment.time}</span>
                                </div>
                            ))}
                            {upcomingAppointments.length === 0 && (
                                <p className="text-center text-gray-500">No upcoming appointments</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReceptionistDashboard 