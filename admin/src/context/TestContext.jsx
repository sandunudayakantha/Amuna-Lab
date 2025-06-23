import { useState } from "react";
import { createContext } from "react";

export const TestContext = createContext()

const TestContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [TToken, setTToken] = useState(localStorage.getItem('TToken') ? localStorage.getItem('TToken') : '')


    const value = {
        TToken, setTToken,
        backendUrl
    }
    return(
        <TestContext.Provider value={value}>
            {props.children}
        </TestContext.Provider>
    )
}

export default TestContextProvider