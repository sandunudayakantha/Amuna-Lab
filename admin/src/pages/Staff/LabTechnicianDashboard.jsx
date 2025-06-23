import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { FaSignOutAlt } from 'react-icons/fa'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'
import { useContext } from 'react'

const LabTechnicianDashboard = () => {
    const navigate = useNavigate()
    const { backendUrl, aToken } = useContext(AdminContext)
    const [stats, setStats] = useState({
        pendingTests: 0,
        completedToday: 0,
        lowStockItems: 0
    })
    const [recentActivity, setRecentActivity] = useState([])
    const [loading, setLoading] = useState(true)

    const handleLogout = () => {
        localStorage.removeItem('sToken')
        localStorage.removeItem('staffRole')
        navigate('/login')
    }

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch pending tests
                const pendingResponse = await axios.get(`${backendUrl}/api/tests/pending`, {
                    headers: { aToken }
                })
                
                // Fetch completed tests for today
                const completedResponse = await axios.get(`${backendUrl}/api/tests/completed-today`, {
                    headers: { aToken }
                })
                
                // Fetch low stock items
                const inventoryResponse = await axios.get(`${backendUrl}/api/inventory/low-stock`, {
                    headers: { aToken }
                })

                // Fetch recent activity
                const activityResponse = await axios.get(`${backendUrl}/api/tests/recent-activity`, {
                    headers: { aToken }
                })

                setStats({
                    pendingTests: pendingResponse.data.count || 0,
                    completedToday: completedResponse.data.count || 0,
                    lowStockItems: inventoryResponse.data.count || 0
                })

                setRecentActivity(activityResponse.data.activities || [])
                setLoading(false)
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    const menuItems = [
        { name: 'Dashboard', path: '/lab-technician/dashboard', icon: 'dashboard' },
        { name: 'Tests', path: '/lab-technician/tests', icon: 'tests' },
        { name: 'Inventory', path: '/lab-technician/inventory', icon: 'inventory' },
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
                    <h1 className="text-2xl font-bold text-primary">Lab Technician</h1>
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
                    <h1 className="text-2xl font-semibold text-gray-800">Lab Technician Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200"
                    >
                        <FaSignOutAlt />
                        Logout
                    </button>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-semibold mb-6">Welcome to Lab Technician Dashboard</h2>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-blue-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-blue-700">Pending Tests</h3>
                            <p className="text-3xl font-bold text-blue-900">{stats.pendingTests}</p>
                        </div>
                        <div className="bg-green-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-green-700">Completed Today</h3>
                            <p className="text-3xl font-bold text-green-900">{stats.completedToday}</p>
                        </div>
                        <div className="bg-yellow-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-yellow-700">Low Stock Items</h3>
                            <p className="text-3xl font-bold text-yellow-900">{stats.lowStockItems}</p>
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
                </div>
            </div>
        </div>
    )
}

export default LabTechnicianDashboard 