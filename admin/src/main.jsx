import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import AdminContextProvider from './context/AdminContext.jsx'
import TestContextProvider from './context/TestContext.jsx'
import AppContextProvider from './context/AppContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <AdminContextProvider>
    <TestContextProvider>
      <AppContextProvider>
          <App />
      </AppContextProvider>
    </TestContextProvider>
  </AdminContextProvider>
  </BrowserRouter>
    
  
)
