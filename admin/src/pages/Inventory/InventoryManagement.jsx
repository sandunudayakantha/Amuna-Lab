import React from 'react';
import { Link } from 'react-router-dom';
import { FaChartBar, FaExchangeAlt, FaFileAlt, FaPlus } from 'react-icons/fa';
import { assets } from '../../assets/assets';

const InventoryManagement = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Inventory Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Dashboard Card */}
          <Link 
            to="/dashboard" 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex flex-col items-center text-center">
              <FaChartBar className="text-4xl text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Dashboard</h2>
              <p className="text-gray-600">View inventory overview and analytics</p>
            </div>
          </Link>

          {/* Add Item Card */}
          <Link 
            to="/add-item" 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex flex-col items-center text-center">
              <FaPlus className="text-4xl text-orange-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Add Item</h2>
              <p className="text-gray-600">Add new items to inventory</p>
            </div>
          </Link>

          {/* Issuing Card */}
          <Link 
            to="/issuing" 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex flex-col items-center text-center">
              <FaExchangeAlt className="text-4xl text-green-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Issue Items</h2>
              <p className="text-gray-600">Issue items to departments or staff</p>
            </div>
          </Link>

          {/* Issued Report Card */}
          <Link 
            to="/inventory/issued-report" 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex flex-col items-center text-center">
              <FaFileAlt className="text-4xl text-purple-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Issued Report</h2>
              <p className="text-gray-600">View issued items and their status</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement; 