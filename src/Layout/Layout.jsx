import React from 'react'
import Header from '../Components/Header/Header'
// import LabourForm from '../Components/labourComponent/LabourForm'
import Router from '../Router/Router'
import Footer from '../Components/Footer/Footer'



const Layout = () => {
  return (
    <>
    
    <Header/>
    <main className="pt-[40px] pb-[40px] min-h-[95vh] mt-2">
           <Router/>
    </main>
    <Footer/>
   
    </>
  )
}

export default Layout