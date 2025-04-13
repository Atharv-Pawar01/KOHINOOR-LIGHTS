import React, { useState, useEffect, useContext } from "react";
import Select from "react-select";
import { UserContext } from "../../authContext/userContext";
import { toast } from "react-toastify";


const Outward = () => {

  const {user}=useContext(UserContext)

  // console.log(user)


  const [labours, setLabours] = useState([]);
  const [receiptNo, setReceiptNo] = useState("");
  const [finalMaterials, setFinalMaterials] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [filteredLabours, setFilteredLabours] = useState([]);
  const [selectedLabour, setSelectedLabour] = useState(null);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [rawMaterials, setRawMaterials] = useState({});
  const [materialQuantities, setMaterialQuantities] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Default to today's date
  const [remarks, setRemarks] = useState("");
  const [assignedBy, setAssignedBy] = useState(user?.name ); // NEW: User assigning materials

  


  useEffect(() => {
    fetchLabours();
    fetchFinalMaterials();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
  
    return () => clearInterval(interval);
  }, []);

  const fetchLabours = async () => {
    const response = await window.electron.invoke("get-labours");
    setLabours(response);
  };

  const fetchFinalMaterials = async () => {
    const response = await window.electron.invoke("getFinalMaterialsWithRaw");
    setMaterials(response);
    const uniqueFinalMaterials = [...new Set(response.map((data) => data.final_material_name.toUpperCase()))];
    setFinalMaterials(uniqueFinalMaterials);
  };

  const handleCustomerIdChange = (e) => {
    const customerId = e.target.value.toUpperCase();
    setSelectedCustomerId(customerId);
    const filtered = labours.filter((labour) => labour.customerId.toUpperCase() === customerId);
    setFilteredLabours(filtered);
    if (filtered.length === 1) {
      setSelectedLabour(filtered[0].id);
    } else {
      setSelectedLabour(null);
    }
  };

  const handleLabourChange = (e) => {
    const labourId = e.target.value;
    setSelectedLabour(labourId);
    const labour = labours.find((lab) => lab.id === labourId);
    if (labour) {
      setSelectedCustomerId(labour.customerId.toUpperCase());
      setFilteredLabours(labours.filter((l) => l.customerId.toUpperCase() === labour.customerId.toUpperCase()));
    }
  };

  const handleMaterialSelection = (selectedOptions) => {
    const selectedNames = selectedOptions.map((option) => option.value.toUpperCase());
    setSelectedMaterials(selectedNames);
    setMaterialQuantities((prev) => {
      const updatedQuantities = { ...prev };
      selectedNames.forEach((name) => {
        if (!updatedQuantities[name]) {
          updatedQuantities[name] = 1;
        }
      });
      return updatedQuantities;
    });



    
    updateRawMaterials(selectedNames, materialQuantities);
  };
  const handleQuantityChange = (material, quantity) => {
    setMaterialQuantities((prev) => {
      const updatedQuantities = { ...prev, [material]: quantity };
      return updatedQuantities;
    });
  
    // Call updateRawMaterials after updating state using a useEffect hook
  };
  
  useEffect(() => {
    updateRawMaterials(selectedMaterials, materialQuantities);
  }, [materialQuantities, selectedMaterials]); // This ensures the latest values are used
  
  

  const updateRawMaterials = (selectedMaterials, quantities) => {
    const aggregatedMaterials = {};
    selectedMaterials.forEach((finalMaterialName) => {
      const relevantMaterials = materials.filter((mat) => mat.final_material_name.toUpperCase() === finalMaterialName);
      const quantityMultiplier = quantities[finalMaterialName] || 1;
      relevantMaterials.forEach((mat) => {
        const totalQuantity = mat.quantity * quantityMultiplier;
        const rawMaterialName = mat.raw_material_name.toUpperCase();
        if (aggregatedMaterials[rawMaterialName]) {
          aggregatedMaterials[rawMaterialName].quantity += totalQuantity;
        } else {
          aggregatedMaterials[rawMaterialName] = {
            name: rawMaterialName,
            unit: mat.unit.toUpperCase(),
            quantity: totalQuantity,
          };
        }
      });
    });
    setRawMaterials(aggregatedMaterials);
  };

  const handleAssign = async () => {
    if (!selectedLabour || selectedMaterials.length === 0) {
      return;
    }
  
    const rawMaterialsArray = Object.entries(rawMaterials).map(([key, value]) => ({
      name: value.name,
      unit: value.unit,
      quantity: value.quantity,
    }));



    try {

      const data = await window.electron.invoke("assign-materials", {
        labourId: selectedLabour,
        materials: selectedMaterials.map((mat) => ({
          name: mat.toUpperCase(),
          quantity: materialQuantities[mat],
        })),
        rawMaterials: rawMaterialsArray, // Include raw materials in the request
        receiptNo: receiptNo.toUpperCase(),
        date,
        assignedBy,
        remarks: remarks,
      });
    
      toast.success("Material Assigned Successfully")
    
      // Reset states
      setReceiptNo("");
      setSelectedCustomerId("");
      setSelectedLabour(null);
      setFilteredLabours([]);
      setSelectedMaterials([]);
      setMaterialQuantities({});
      setRawMaterials({});
      setRemarks("");
      
    } catch (error) {

      toast("something went wrong!!!")
      
    }
  
    
  };
  
  


  return (
    <div className="relative p-6 max-w-4xl mx-auto bg-white shadow-xl rounded-xl border border-gray-200">
    {/* Time Display */}
    <div className="absolute top-4 right-4 text-gray-500 text-sm font-medium">
      {currentTime.toLocaleString()}
    </div>
  
    <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Assign Final Materials</h2>

    <div className="p-4 bg-gray-50 rounded-lg shadow-sm border">
        <label className="block font-medium text-gray-700">Assigned By:</label>
        <div className="text-gray-800 font-semibold">{assignedBy || "Loading..."}</div>
      </div>

      {/* Receipt Number */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow-sm border">
        <label className="block font-medium text-gray-700 mb-2">Receipt No:</label>
        <input
          type="text"
          required
          className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-400 transition"
          value={receiptNo}
          onChange={(e) => setReceiptNo(e.target.value)}
          placeholder="Enter receipt number..."
        />
      </div>

       {/* Date Selection */}
       <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow-sm border">
        <label className="block font-medium text-gray-700 mb-2">Date:</label>
        <input
          type="date"
          className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-400 transition"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
  
    {/* Customer & Labour Selection */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      {/* Customer ID Selection */}
      <div className="p-4 bg-gray-50 rounded-lg shadow-sm border">
        <label className="block font-medium text-gray-700 mb-2">Select Customer ID:</label>
        <select
          className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-400 transition"
          value={selectedCustomerId}
          onChange={handleCustomerIdChange}
        >
          <option value="">-- Select Customer ID --</option>
          {[...new Set(labours.map((labour) => labour.customerId))].map((customerId) => (
            <option key={customerId} value={customerId}>
              {customerId}
            </option>
          ))}
        </select>
      </div>
  
      {/* Labour Selection */}
      <div className="p-4 bg-gray-50 rounded-lg shadow-sm border">
        <label className="block font-medium text-gray-700 mb-2">Selected Labourer:</label>
        <select
          className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-400 transition"
          value={selectedLabour || ""}
          onChange={handleLabourChange}
          disabled={!selectedCustomerId}
        >
          <option value="">-- Select Labourer --</option>
          {filteredLabours.map((labour) => (
            <option key={labour.id} value={labour.id}>
              {labour.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  
    {/* Final Materials Selection */}
    <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow-sm border">
      <label className="block font-medium text-gray-700 mb-2">Select Final Materials:</label>
      <Select
        isMulti
        options={finalMaterials.map((mat) => ({ value: mat, label: mat }))}
        onChange={handleMaterialSelection}
        className="mt-2"
      />
    </div>
  
    {/* Quantity Selection */}
    {selectedMaterials.length > 0 && (
      <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-sm border">
        <h3 className="font-bold text-lg text-gray-800 mb-2">Set Final Material Quantities:</h3>
        {selectedMaterials.map((mat) => (
          <div key={mat} className="mt-2 flex items-center">
            <span className="w-1/2 font-medium">{mat}:</span>
            <input
              type="number"
              value={materialQuantities[mat]}
              onChange={(e) => handleQuantityChange(mat, parseInt(e.target.value))}
              className="w-20 p-1 border rounded text-center bg-white shadow-sm"
            />
          </div>
        ))}
      </div>
    )}
  
    {/* Display Aggregated Raw Materials */}
    {Object.keys(rawMaterials).length > 0 && (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow-sm border">
        <h3 className="font-bold text-lg text-gray-800">Aggregated Raw Materials:</h3>
        <ul className="mt-2 space-y-1">
          {Object.entries(rawMaterials).map(([name, raw]) => (
            <li key={name} className="text-gray-700">
              <strong>{raw.name}</strong>: {raw.quantity} {raw.unit}
            </li>
          ))}
        </ul>
      </div>
    )}
    <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow-sm border">
  <label className="block font-medium text-gray-700 mb-2">Remarks:</label>
  <textarea
    className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-400 transition resize-none overflow-hidden"
    value={remarks}
    onChange={(e) => setRemarks(e.target.value)}
    onInput={(e) => {
      e.target.style.height = "auto"; // Reset height
      e.target.style.height = `${e.target.scrollHeight}px`; // Set height dynamically
    }}
    placeholder="Enter remarks (optional)..."
  />
</div>


  
   {/* Assign Button (Centered) */}
<div className="flex justify-center mt-6">
  <button
    onClick={handleAssign}
    className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:scale-105"
  >
    Assign Materials
  </button>
</div>
</div>
  
  );
};

export default Outward;
