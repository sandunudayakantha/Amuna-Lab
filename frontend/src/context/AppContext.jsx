import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import {toast} from 'react-toastify'

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = 'LKR '
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [tests, setTests] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : false)
    const [userData, setUserData] = useState(false)

   
    const getTestsData = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/test/list')
            if(data.success){
                setTests(data.tests)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const loadUserProfileData = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/user/get-profile', {
                headers: {
                    'token': token
                }
            })
            if (data.success){
                setUserData(data.userData)
            } else {
                // Clear invalid token
                localStorage.removeItem('token')
                setToken(false)
                setUserData(false)
                toast.error("Session expired. Please login again.")
            }
        } catch (error) {
            console.log("Auth Error:", error)
            // Clear invalid token
            localStorage.removeItem('token')
            setToken(false)
            setUserData(false)
            toast.error("Session expired. Please login again.")
        }
    }

    const value = {
        tests, getTestsData,
        currencySymbol,
        token, setToken,
        backendUrl,
        userData, setUserData,
        loadUserProfileData,
    }

    useEffect(()=> {
        getTestsData()
    },[])

    useEffect(() => {
        if(token){
            loadUserProfileData()
        } else {
            setUserData(false)
        }
    },[token])

    return(
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider