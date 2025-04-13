import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css";
import { UserProvider } from './authContext/userContext.jsx'



// const basename = import.meta.env.MODE === "development" ? "/" : "./";

createRoot(document.getElementById('root')).render(

  <UserProvider>
    <HashRouter>
    <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark" // Light, Dark, Colored
        toastStyle={{
          backgroundColor: "#333",
          color: "#fff",
          fontSize: "16px",
          borderRadius: "10px",
        }}
      />
    <App />
    </HashRouter>

    </UserProvider>

)
