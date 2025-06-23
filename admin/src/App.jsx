import React from 'react'
import Login from './pages/Login'
import { ToastContainer, toast } from 'react-toastify';
import { Toaster } from 'react-hot-toast';
import { useContext } from 'react';
import { AdminContext } from './context/AdminContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import {Routes, Route,Navigate } from 'react-router-dom'
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddTest from './pages/Admin/AddTest';
import TestsList from './pages/Admin/TestsList';
import AdminPrescriptions from './pages/Admin/AdminPrescriptions';
import AllPatientsPage from './pages/Admin/AllPatientsPage';
import AddPatientPage from './pages/Admin/AddPatientPage';
import UpdatePatientPage from './pages/Admin/UpdatePatient';
import StaffManagement from './pages/Admin/StaffManagement';

// Import Invoice Management Components
import CreateInvoice from './pages/CreateInvoice';
import InvoiceManager from './pages/InvoiceManager';

// Import Template Management Components
import CreateTemplate from './pages/Templates/CreateTemplate';
import TestTemplates from './pages/Templates/TestTemplates';
import UpdateTemplate from './pages/Templates/UpdateTemplate';

// Import Report Management Components
import Reports from './pages/Reports/Reports';
import CreateReport from './pages/Reports/CreateReport';
import AllReports from './pages/Reports/AllReports';
import ReportView from './pages/Reports/ReportView';
import UpdateReport from './pages/Reports/UpdateReport';

// Import Inventory Management Components
import InventoryDashboard from "./pages/Inventory/Dashboard";
import AddItem from "./pages/Inventory/AddItem";
import EditItem from "./pages/Inventory/EditItem";
import ViewItem from "./pages/Inventory/ViewItem";
import Issuing from "./pages/Inventory/Issuing";
import IssuedItemsReport from "./pages/Inventory/IssuedItemsReport";
import InventoryManagement from "./pages/Inventory/InventoryManagement";

// Import Staff Dashboard Components
import LabTechnicianDashboard from './pages/Staff/LabTechnicianDashboard';
import ReceptionistDashboard from './pages/Staff/ReceptionistDashboard';
import UpdateStaffProfile from './pages/Staff/UpdateStaffProfile';

const App = () => {
  const {aToken} = useContext(AdminContext)
  const staffToken = localStorage.getItem('sToken')
  const staffRole = localStorage.getItem('staffRole')

  // Render based on user role
  if (staffToken && staffRole) {
    return (
      <div className='bg-[#F8F9FD]'>
        <ToastContainer/>
        <Toaster position="top-right" />
        <Routes>
          {staffRole === 'Lab Technician' ? (
            <>
              <Route path='/' element={<Navigate to="/lab-technician/dashboard" />}/>
              <Route path='/lab-technician/dashboard' element={<LabTechnicianDashboard/>}/>
              <Route path='/lab-technician/add-test' element={<AddTest/>}/>
              <Route path='/lab-technician/test-list' element={<TestsList/>}/>
              <Route path='/lab-technician/patients' element={<AllPatientsPage/>}/>
              <Route path='/lab-technician/templates' element={<TestTemplates/>}/>
              <Route path='/lab-technician/inventory' element={<InventoryManagement/>}/>
              <Route path='/staff/update-profile' element={<UpdateStaffProfile/>}/>
            </>
          ) : (
            <>
              <Route path='/' element={<Navigate to="/receptionist/dashboard" />}/>
              <Route path='/receptionist/dashboard' element={<ReceptionistDashboard/>}/>
              <Route path='/receptionist/appointments' element={<AllAppointments/>}/>
              <Route path='/receptionist/create-invoice' element={<CreateInvoice/>}/>
              <Route path='/receptionist/invoices' element={<InvoiceManager/>}/>
              <Route path='/staff/update-profile' element={<UpdateStaffProfile/>}/>
            </>
          )}
        </Routes>
      </div>
    )
  }

  return aToken ? (
    <div className='bg-[#F8F9FD]'>
       <ToastContainer/>
       <Toaster position="top-right" />
       <Navbar/>
       <div className='flex items-start'>
        <Sidebar/>
        <Routes>
          <Route path='/' element={<Navigate to="/admin-dashboard" />}/>
          <Route path='/admin-dashboard' element={<Dashboard/>}/>
          <Route path='/all-appointments' element={<AllAppointments/>}/>
          <Route path='/add-test' element={<AddTest/>}/>
          <Route path='/test-list' element={<TestsList/>}/>
          <Route path='/prescriptions' element={<AdminPrescriptions/>}/>
          <Route path='/patients' element={<AllPatientsPage/>}/>
          <Route path='/add-patient' element={<AddPatientPage/>}/>
          <Route path='/edit-patient/:id' element={<UpdatePatientPage/>}/>
          <Route path='/staff-management' element={<StaffManagement/>}/>

          {/* Invoice Management Routes */}
          <Route path="/invoices" element={<InvoiceManager />} />
          <Route path="/create-invoice" element={<CreateInvoice />} />

          {/* Template Management Routes */}
          <Route path="/alltemplates" element={<TestTemplates />} />
          <Route path="/create-template" element={<CreateTemplate />} />
          <Route path="/update-template/:id" element={<UpdateTemplate />} />

          {/* Report Management Routes */}
          <Route path="/reports" element={<Reports />} />
          <Route path="/create-report" element={<CreateReport />} />
          <Route path="/create-report/:id" element={<CreateReport />} />
          <Route path="/allreports" element={<AllReports />} />
          <Route path="/reports/:id" element={<ReportView />} />
          <Route path="/update-report/:id" element={<UpdateReport />} />

          {/* Inventory Management Routes */}
          <Route path="/inventory" element={<InventoryManagement />} />
          <Route path="/dashboard" element={<InventoryDashboard />} />
          <Route path="/add-item" element={<AddItem />} />
          <Route path="/edit-item/:id" element={<EditItem />} />
          <Route path="/view-item/:id" element={<ViewItem />} />
          <Route path="/inventory/issuing" element={<Issuing />} />
          <Route path="/issuing" element={<Issuing />} />
          <Route path="/inventory/issued-report" element={<IssuedItemsReport />} />
        </Routes>
       </div>
    </div>
  ) : (
    <>
      <Login/>
      <ToastContainer/>
      <Toaster position="top-right" />
    </>
  )
}

export default App