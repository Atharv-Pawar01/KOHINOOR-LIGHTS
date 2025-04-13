import React, { useState } from "react";
import { Upload } from "lucide-react";
import {  toast } from "react-toastify";


const AddMaterial = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // toast.info("Testing Toast!");
 
  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select an Excel file.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();

    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      try {
        const response = await window.electron.invoke("upload-excel", {
          name: file.name,
          data: Array.from(new Uint8Array(reader.result)), // Convert to array
        });

        toast.success("File uploaded successfully! 🎉");
      } catch (error) {
        toast.error("Upload failed. Please try again.");
        console.error("Upload failed", error);
      } finally {
        setUploading(false);
      }
    };
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg flex flex-col gap-4 items-center">
      <input 
        type="file" 
        accept=".xlsx, .xls" 
        onChange={handleFileChange} 
        className="border p-2 rounded w-full"
      />
      <button 
        onClick={handleUpload} 
        disabled={uploading} 
        className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        <Upload size={18} /> {uploading ? "Uploading..." : "Upload Excel"}
      </button>
    </div>
  );
};

export default AddMaterial;
