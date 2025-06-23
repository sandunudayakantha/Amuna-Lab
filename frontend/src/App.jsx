import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'
import Tests from './pages/Tests'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'
import Appointment from './pages/Appointment'
import Navbar from './components/Navbar'
import Prescription from './pages/Prescription'
import Footer from './components/Footer'
import { ToastContainer, toast } from 'react-toastify';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AIAnalysisPage from './pages/AIAnalysisPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%]'>
      <ToastContainer/>
      <Navbar/>
      <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/tests' element={<Tests/>}/>
          <Route path='/tests/:category' element={<Tests/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/about' element={<About/>}/>
          <Route path='/contact' element={<Contact/>}/>
          <Route path='/my-profile' element={<MyProfile/>}/>
          <Route path='/my-appointments' element={<MyAppointments/>}/>
          <Route path='/appointment/:testId' element={<Appointment/>}/>
          <Route path='/prescription' element={<Prescription/>}/>
          <Route path="/ai-analysis" element={<AIAnalysisPage />} />
      </Routes>
      <Footer/>

    </div>
  )
}

export default App