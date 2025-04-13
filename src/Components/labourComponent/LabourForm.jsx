

import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify"

const LabourForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    customerId: "",
    department: "",
    area: "",
    city: "",
    pincode: "",
    telephone: "",
    aadhar: "",
    pancard: "", // Added pancard field
  });

  const [photo, setPhoto] = useState(null); // Separate photo state

  const [loading,setLoading]=useState(false)
  const [departments,setDepartments]=useState([])
  const [errorMessage, setErrorMessage] = useState(""); // ✅ New State for Error Message
  const [successMessage, setSuccessMessage] = useState(""); // ✅ New State for Success Message
  const [selectedImage, setSelectedImage] = useState(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null); // Reference for file input

  useEffect(() => {
    let isMounted = true; // Prevent updates after unmount
  
    const fetchDepartments = async () => {
      try {
        const response = await window.electron.invoke("get-departments");
        if (response.success && isMounted) {
          setDepartments(response.departments);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
  
    fetchDepartments();
    return () => { isMounted = false }; // Cleanup function
  }, []);
  
  const nameInputRef = useRef(null);

useEffect(() => {
  setPhoto(null);
  nameInputRef.current?.focus(); // Restore focus
}, [loading]); // Runs when formData updates


  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value.toUpperCase(),
    }));
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file); // Store photo separately
      setSelectedImage(URL.createObjectURL(file));
      setFileName(file.name);
    }
  };
  

  // Remove selected image
  const removeImage = () => {
    setFormData((prevData) => ({ ...prevData, photo: null }));
    setSelectedImage(null);
    setFileName("");

    // Reset file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(""); // Clear previous errors
    setSuccessMessage(""); // Clear previous success message
  
    try {
      let photoData = null;
      if (photo) {
        photoData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(photo);
          reader.onloadend = () => {
            const base64String = reader.result.split(",")[1]; // Remove metadata
            resolve({ name: photo.name, data: base64String });
          };
        });
      } else {
        throw new Error("Please upload Photo");
      }
  
      const dataToSend = {
        ...formData,
        name: formData.name.toUpperCase(),
        customerId: formData.customerId.toUpperCase(),
        department: formData.department.toUpperCase(),
        area: formData.area.toUpperCase(),
        city: formData.city.toUpperCase(),
        pincode: formData.pincode.toUpperCase(),
        telephone: formData.telephone.toUpperCase(),
        aadhar: formData.aadhar.toUpperCase(),
        pancard: formData.pancard.toUpperCase(),
        photo: photoData,
      };
  

      const response = await window.electron.invoke("insert-labour", dataToSend);
  
      if (response.success) {
        setSuccessMessage("Labour added successfully! ✅"); // ✅ Set Success Message
        // alert("Labour added successfully!");
  
        // **RESET FORM STATE SAFELY**
        setFormData({
          name: "",
          customerId: "",
          department: "",
          area: "",
          city: "",
          pincode: "",
          telephone: "",
          aadhar: "",
          pancard: ""
        });
  
        setPhoto(null);
        setSelectedImage(null);
        setFileName("");
        if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input
  
       
        // **Ensure Re-render by setting a fresh object reference**
        setTimeout(() => {
          setFormData((prev) => ({ ...prev })); 
          nameInputRef.current?.focus();
        }, 100);

        toast.success("Labour added successfully!!")
        
      } else {
        throw new Error(response.error || "Unknown error");
      }
    } catch (error) {
      toast.error(error.message)

      
      
    } finally {
      setLoading(false);
    }
  };
  

  

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
       

      
      <form onSubmit={submitForm} className="space-y-4">
        
        {/* Labour Name */}
        <div className="flex flex-col">
          <label htmlFor="name" className="font-semibold">Labour Name:</label>
          <input type="text" ref={nameInputRef} name="name" id="name" value={formData.name} onChange={handleChange} className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 uppercase" placeholder="Enter Labour Name" required />
        </div>

        {/* Photo Upload & Preview */}
        <div className="flex flex-col">
          <label className="font-semibold">Upload Photo:</label>
          <input
            type="file"
            name="photo"
            id="photo"
            accept="image/*"
            className="hidden"
            ref={fileInputRef} // Attach ref to input
            onChange={handleImageChange}
      
          />
          <label htmlFor="photo" className="cursor-pointer bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition w-[50%]">
            Select Image
          </label>
          {fileName && <p className="text-sm text-gray-600 mt-1">{fileName}</p>}
          {selectedImage && (
            <div className="mt-2">
              <p className="text-gray-600 text-sm">Selected Image:</p>
              <img src={selectedImage} alt="Preview" className="w-32 h-32 object-cover rounded-md shadow-md border" />
              <button type="button" onClick={removeImage} className="mt-2 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition">
                Remove Image
              </button>
            </div>
          )}
        </div>

         {/* Department Selection */}
         <div className="flex flex-col">
          <label className="font-semibold">Department:</label>
          <div className="flex items-center space-x-4">
            {departments.length > 0 ? (
              departments.map((dept) => (
                <label key={dept.department_id} className="flex items-center space-x-1">
                  <input
                    type="radio"
                    name="department"
                    value={dept.name}
                    onChange={handleChange}
                    className="mr-1 uppercase"
                    checked={formData.department === dept.name}
                  />
                  <span>{dept.name}</span>
                </label>
              ))
            ) : (
              <p className="text-gray-500">Loading departments...</p>
            )}
          </div>
        </div>

        {/* Customer ID */}
       
        <div className="flex flex-col">
          <label htmlFor="customerId" className="font-semibold">Customer ID No.:</label>
          <input type="text" name="customerId" id="customerId" value={formData.customerId} onChange={handleChange} className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 uppercase" required />
        </div>

       


        {/* Address Section */}
        <div className="flex flex-col space-y-2">
          <p className="font-semibold">Address:</p>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="area" id="area" value={formData.area} onChange={handleChange} className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 uppercase" placeholder="Area Name" required />
            <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 uppercase" placeholder="City Name" required />
          </div>
          <input type="text" name="pincode" id="pincode" value={formData.pincode} onChange={handleChange} className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 uppercase" placeholder="Enter Pincode" required />
        </div>

        {/* Mobile Number */}
        <div className="flex flex-col">
          <label htmlFor="telephone" className="font-semibold">Mobile No.:</label>
          <input type="tel" name="telephone" id="telephone" value={formData.telephone} onChange={handleChange} pattern="[0-9]{10}" className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 uppercase" placeholder="Enter 10-digit number" required />
        </div>

        {/* Aadhar Number */}
        <div className="flex flex-col">
          <label htmlFor="aadhar" className="font-semibold">Aadhar No.:</label>
          <input type="text" name="aadhar" id="aadhar" value={formData.aadhar} onChange={handleChange} pattern="\d{12}" inputMode="numeric" className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 uppercase" placeholder="Enter 12-digit number" required />
        </div>



<div className="flex flex-col">
  <label htmlFor="pancard" className="font-semibold">PAN Card No.:</label>
  <input 
    type="text" 
    name="pancard" 
    id="pancard" 
    value={formData.pancard} 
    onChange={handleChange} 
    pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}" 
    className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500" 
    placeholder="Enter PAN Card Number (e.g., ABCDE1234F)" 
    required 
  />
</div>

        {/* Submit Button */}
        <div>
          <button 
            type="submit" 
            className={`p-2 w-full rounded-md transition ${
              loading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Submit"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default LabourForm;

