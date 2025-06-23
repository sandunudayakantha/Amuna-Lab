import React, { useState } from 'react'
import { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { BsPersonAdd, BsFileEarmarkText, BsFileEarmarkPlus, BsPeople, BsPlusCircle } from "react-icons/bs";
import { IoDocumentAttach, IoDocumentAttachOutline } from "react-icons/io5";
import { FaExchangeAlt, FaChartBar, FaFileInvoice, FaFileAlt, FaClipboardList } from "react-icons/fa";
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

const Sidebar = () => {
    const {aToken} = useContext(AdminContext)
    const [isOpen, setIsOpen] = useState(true)
    const location = useLocation()

    return (
        <div className='min-h-screen bg-white border-r'>
            {
                aToken && <ul className='text-[#515151] mt-5'>
                    <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} 
                    to={'/admin-dashboard'}>
                        <img src={assets.home_icon} alt="" />
                        <p className='hidden md:block'>Dashboard</p>
                    </NavLink>

                    <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}
                    to={'/all-appointments'}>
                        <img src={assets.appointment_icon} alt="" />
                        <p className='hidden md:block'>Appointments</p>
                    </NavLink>

                    <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}
                    to={'/add-test'}>
                        <img src={assets.add_icon} alt="" />
                        <p className='hidden md:block'>Add Test</p>
                    </NavLink>

                    <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}
                    to={'/test-list'}>
                        <img src={assets.people_icon} alt="" />
                        <p className='hidden md:block'>Test List</p>
                    </NavLink>

                    <NavLink className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} 
                    to={'/prescriptions'}>
                        <IoDocumentAttachOutline className='text-2xl'/>
                        <p className='hidden md:block'>Prescriptions</p>
                    </NavLink>

                    <NavLink className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} 
                    to={'/patients'}>
                        <BsPersonAdd className='text-2xl'/>
                        <p className='hidden md:block'>Lab Patients</p>
                    </NavLink>

                    {/* Staff Management */}
                    <div className="relative group">
                        <NavLink className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} 
                        to={'/staff-management'}>
                            <BsPeople className='text-2xl'/>
                            <p className='hidden md:block'>Staff Management</p>
                        </NavLink>
                        <Link to="/staff-management" className="absolute right-2 top-1/2 -translate-y-1/2">
                            <button className="p-1 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors">
                                <BsPlusCircle className="text-lg" />
                            </button>
                        </Link>
                    </div>

                    {/* Invoice Management */}
                    <NavLink className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} 
                    to={'/invoices'}>
                        <FaFileInvoice className='text-2xl'/>
                        <p className='hidden md:block'>Invoices</p>
                    </NavLink>

                    <NavLink className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} 
                    to={'/create-invoice'}>
                        <BsFileEarmarkPlus className='text-2xl'/>
                        <p className='hidden md:block'>Create Invoice</p>
                    </NavLink>

                    {/* Template Management
                    <NavLink className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} 
                    to={'/templates'}>
                        <FaFileAlt className='text-2xl'/>
                        <p className='hidden md:block'>Create Template</p>
                    </NavLink> */}

                    <NavLink className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} 
                    to={'/alltemplates'}>
                        <FaClipboardList className='text-2xl'/>
                        <p className='hidden md:block'>Test Templates</p>
                    </NavLink>

                    {/* Report Management
                    <NavLink className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} 
                    to={'/reports'}>
                        <BsFileEarmarkText className='text-2xl'/>
                        <p className='hidden md:block'>Reports</p>
                    </NavLink> */}

                    <NavLink className={({ isActive }) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} 
                    to={'/allreports'}>
                        <FaFileAlt className='text-2xl'/>
                        <p className='hidden md:block'>All Reports</p>
                    </NavLink>

                    {/* Inventory Management */}
                    <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}
                    to={'/inventory'}>
                        <BsFileEarmarkText className='text-2xl'/>
                        <p className='hidden md:block'>Inventory Management</p>
                    </NavLink>
{/* 
                    <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}
                    to={'/dashboard'}>
                        <FaChartBar className="text-2xl" />
                        <p className='hidden md:block'>Inventory Dashboard</p>
                    </NavLink>

                    <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}
                    to={'/issuing'}>
                        <FaExchangeAlt className="text-2xl" />
                        <p className='hidden md:block'>Issue Items</p>
                    </NavLink>

                    <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`}
                    to={'/inventory/issued-report'}>
                        <FaChartBar className="text-2xl" />
                        <p className='hidden md:block'>Issued Items Report</p>
                    </NavLink> */}
                </ul>
            }
        </div>
    )
}

export default Sidebar