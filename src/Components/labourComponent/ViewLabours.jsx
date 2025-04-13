import React, { useEffect, useState } from 'react'

const ViewLabours = () => {
   const [labours,setLabours]=useState([]);
    useEffect(()=>{
           fetchLabours();
       },[])


       const fetchLabours=async ()=>{
        const data=await window.electron.invoke('get-labours');
        setLabours(data);
    }
    

  return (
    <>
      
      <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Labour Management</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 bg-white shadow-md rounded-lg">
          <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
            <tr>
              <th className="px-4 py-2">Sr. No</th>
              <th className="px-4 py-2">Photo</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Customer ID</th>
              <th className="px-4 py-2">Department</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Area</th>
              <th className="px-4 py-2">City</th>
              <th className="px-4 py-2">Pincode</th>
              <th className="px-4 py-2">Aadhar</th>
              <th className="px-4 py-2">PAN Card</th>
            </tr>
          </thead>
          <tbody>
            {labours.map((labour, index) => (
              <tr key={labour.id} className="text-center border-b hover:bg-gray-50 transition">
                <td className="border px-4 py-2">{index + 1}</td>
                <td className="border px-4 py-2">
                  {labour.photo ? (
                    <img src={`${labour.photo}`} alt="Labour" className="w-12 h-12 object-cover rounded-full mx-auto" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <span>No Image</span>
                    </div>
                  )}
                </td>
                <td className="border px-4 py-2">{labour.name}</td>
                <td className="border px-4 py-2">{labour.customerId}</td>
                <td className="border px-4 py-2">{labour.department}</td>
                <td className="border px-4 py-2">{labour.telephone}</td>
                <td className="border px-4 py-2">{labour.area}</td>
                <td className="border px-4 py-2">{labour.city}</td>
                <td className="border px-4 py-2">{labour.pincode}</td>
                <td className="border px-4 py-2">{labour.aadhar}</td>
                <td className="border px-4 py-2">{labour.pancard}</td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>


    </>
  )
}

export default ViewLabours