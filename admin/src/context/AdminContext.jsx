import { useState } from "react";
import { createContext } from "react";
import axios from 'axios'
import {toast} from 'react-toastify'

export const AdminContext = createContext()

const AdminContextProvider = (props) => {

    const [aToken, setAToken] = useState(localStorage.getItem('aToken') ? localStorage.getItem('aToken') : '')
    const [tests, setTests] = useState([])
    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState(false)

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const getAllTests = async () => {
        try {
            const {data} = await axios.post(backendUrl + '/api/admin/all-tests', {}, {headers:{aToken}})
            if(data.success){
                setTests(data.tests)
                console.log(data.tests)

            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    const changeAvailability = async (testId) => {
        try {
            const {data} = await axios.post(backendUrl + '/api/admin/change-availability', {testId}, {headers:{aToken}})
            if(data.success){
                toast.success(data.message)
                getAllTests()

            } else {
                toast.error(data.message)
            }
            
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getAllAppointments = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/admin/appointments', {headers:{aToken}})
            
            if(data.success){
                setAppointments(data.appointments)
                console.log(data.appointments)
            } else {
                toast.error(data.message)
            }
            
        } catch (error) {
            toast.error(error.message)
        }
    }

    const cancelAppointment = async (appointmentId) => {
        try {
            const {data} = await axios.post(backendUrl + '/api/admin/cancel-appointment',{appointmentId}, {headers:{aToken}})

            if(data.success){
                toast.success(data.message)
                getAllAppointments()
            } else {
                toast.error(data.message)
            }
            
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getDashData = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/admin/dashboard', {headers:{aToken}})

            if(data.success){
                setDashData(data.dashData)
                console.log(data.dashData)
            } else {
                toast.error(data.message)
            }
            
        } catch (error) {
            toast.error(error.message)
        }
    }

    const completeAppointment = async (appointmentId) => {
        try {
          const { data } = await axios.post(
            backendUrl + "/api/admin/complete-appointment",
            { appointmentId },
            { headers: { aToken } }
          );
      
          if (data.success) {
            toast.success(data.message);
            getAllAppointments(); // refresh list
          } else {
            toast.error(data.message);
          }
        } catch (error) {
          console.log(error);
          toast.error("Failed to complete appointment");
        }
      };

      const deleteTest = async (testId) => {
        try {
          const { data } = await axios.post(backendUrl + "/api/admin/delete-test", { testId }, { headers: { aToken } });
          if (data.success) {
            toast.success(data.message);
            getAllTests(); // refresh the tests list
          } else {
            toast.error(data.message);
          }
        } catch (error) {
          toast.error("Failed to delete test");
        }
      };
      
      
    
    const value = {
        aToken, setAToken,
        backendUrl,
        getAllTests,
        tests, setTests,
        changeAvailability,
        appointments, setAppointments,
        getAllAppointments,
        cancelAppointment,
        dashData, getDashData,
        completeAppointment,
        deleteTest
    }
    return(
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider