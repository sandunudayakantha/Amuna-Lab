import React from 'react'
import {assets} from '../assets/assets'
import { useState } from 'react'
import { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import axios from 'axios'
import {toast} from 'react-toastify'
import { TestContext } from '../context/TestContext'

const Login = () => {
    const [state, setState] = useState('Admin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const {setAToken, backendUrl} = useContext(AdminContext)

    const onSubmitHandler = async (event) => {
        event.preventDefault()

        try {
            if(state === 'Admin'){
                const {data} = await axios.post(backendUrl + '/api/admin/login', {email, password})
                if(data.success){
                    localStorage.setItem('aToken', data.token)
                    setAToken(data.token)
                } else {
                    toast.error(data.message)
                }
            } else {
                const {data} = await axios.post(backendUrl + '/api/staff/login', {email, password})
                if(data.success){
                    localStorage.setItem('sToken', data.token)
                    localStorage.setItem('staffRole', data.staff.role)
                    // Redirect based on role from staff data
                    if(data.staff.role === 'Lab Technician') {
                        window.location.href = '/lab-technician/dashboard'
                    } else if(data.staff.role === 'Receptionist') {
                        window.location.href = '/receptionist/dashboard'
                    }
                } else {
                    toast.error(data.message)
                }
            }
        } catch (error) {
            toast.error('An error occurred during login')
        }
    }

    const menuItems = {
        'Lab Technician': [
            { name: 'Dashboard', path: '/lab-technician/dashboard' },
            { name: 'Add Test', path: '/lab-technician/add-test' },
            { name: 'Test List', path: '/lab-technician/test-list' },
            { name: 'Lab Patients', path: '/lab-technician/patients' },
            { name: 'Test Templates', path: '/lab-technician/templates' },
            { name: 'Inventory Management', path: '/lab-technician/inventory' }
        ],
        'Receptionist': [
            { name: 'Dashboard', path: '/receptionist/dashboard' },
            { name: 'Appointments', path: '/receptionist/appointments' },
            { name: 'Create Invoice', path: '/receptionist/create-invoice' },
            { name: 'Invoices', path: '/receptionist/invoices' }
        ]
    }

    return (
        <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
            <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
                <p className='text-2xl font-semibold m-auto'><span className='text-primary'>{state}</span> Login</p>
                
                <div className='w-full'>
                    <p>Email</p>
                    <input 
                        onChange={(e) => setEmail(e.target.value)} 
                        value={email} 
                        className='border border-[#DADADA] rounded w-full p-2 mt-1' 
                        type="email" 
                        required 
                    />
                </div>
                
                <div className='w-full'>
                    <p>Password</p>
                    <input 
                        onChange={(e) => setPassword(e.target.value)} 
                        value={password} 
                        className='border border-[#DADADA] rounded w-full p-2 mt-1' 
                        type="password" 
                        required 
                    />
                </div>
                
                <button className='bg-primary text-white w-full py-2 rounded-md text-base'>Login</button>
                
                <p className='text-center w-full'>
                    {state === 'Admin' 
                        ? <span>Staff Login? <span className='text-primary underline cursor-pointer' onClick={() => setState('Staff')}>Click here</span></span>
                        : <span>Admin Login? <span className='text-primary underline cursor-pointer' onClick={() => setState('Admin')}>Click here</span></span>
                    }
                </p>
            </div>
        </form>
    )
}

export default Login