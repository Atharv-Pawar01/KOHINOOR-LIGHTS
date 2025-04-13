import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { UserContext } from "../../authContext/userContext";



const OrdersByReceipt = () => {
  const [receiptNo, setReceiptNo] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [producedQuantities, setProducedQuantities] = useState({});
  // const [damagedQuantities, setDamagedQuantities] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [damagedQuantities, setDamagedQuantities] = useState({});
  const [remarks, setRemarks] = useState({});
  const [receivingDate, setReceivingDate] = useState(new Date().toISOString().split("T")[0]);
  const [amountPerProduction, setAmountPerProduction] = useState({});



  const {user}=useContext(UserContext)

  


  const fetchOrders = async (e) => {
    e.preventDefault();
    setOrders([])
    if (!receiptNo.trim()) {
      toast.warning("Please enter a receipt number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await window.electron.invoke("getOrderByReceipt", receiptNo);


      // console.log(response);
      

      if (response.success) {
        const filteredOrders = response.orders.filter(order => !order.is_fulfilled);

      if (filteredOrders.length === 0) {
        setError("No unfulfilled orders found.");
        toast.info("All orders are already fulfilled.");
      } else {
        setOrders(filteredOrders);
        toast.success("Orders Retrieved Successfully");
      }
      setOrders(filteredOrders)
      } else {
        setError(response.message);
        toast.error(response.message);
      }
    } catch (err) {
      toast.error("Failed to fetch data.");
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Group orders by receipt number
  const groupedOrders = orders.reduce((acc, order) => {
    if (!acc[order.receipt_no]) {
      acc[order.receipt_no] = [];
    }
    acc[order.receipt_no].push(order);
    return acc;
  }, {});


  

  // 🔹 Handle Receive Button Click
  const handleReceiveClick = (receipt) => {
    setSelectedReceipt(receipt);
    const initialQuantities = {};
    groupedOrders[receipt].forEach((order) => {
      initialQuantities[order.order_id] = "";
    });
    setProducedQuantities(initialQuantities);
    setShowModal(true);
  };

  // 🔹 Handle Quantity Input Change
  const handleQuantityChange = (orderId, type, value) => {
    const parsedValue = value ? parseFloat(value) : ""; // Ensuring numeric input
    
    if (type === "produced") {
      setProducedQuantities((prev) => ({
        ...prev,
        [orderId]: parsedValue,
      }));
    } else if (type === "damaged") {
      setDamagedQuantities((prev) => ({
        ...prev,
        [orderId]: parsedValue,
      }));
    } else if (type === "remarks") {
      setRemarks((prev) => ({
        ...prev,
        [orderId]: value,
      }));
    } else if (type === "amount") { // Handle amount input
      setAmountPerProduction((prev) => ({
        ...prev,
        [orderId]: parsedValue,
      }));
    }



  
    
  };
  


  // console.log(user);
  
  // console.log(orders)
  
  
  
  const totalAmount = Object.entries(producedQuantities).reduce((total, [orderId, quantity]) => {
    const amount = amountPerProduction[orderId] || 0;
    return total + quantity * amount;
  }, 0);
  

  // 🔹 Submit Receipt Data
  const handleSubmitReceipt = async () => {
    if (!receivingDate) {
      toast.warning("Please select a receiving date.");
      return;
    }




    // console.log("clicked");
    
  
    try {
      const receiptData = Object.entries(producedQuantities).map(([orderId, producedQuantity]) => ({
        order_id: orderId,
        produced_quantity: producedQuantity,
        damaged_quantity: damagedQuantities[orderId] || "0", // Default to 0 if not entered
        remarks: remarks[orderId] || "", // Default to empty string if not entered
        amount_per_production: amountPerProduction[orderId] * producedQuantity || "0",
      }));




    
  
      const res=await window.electron.invoke("receiveMaterials", {
        receiptNo: selectedReceipt,
        receivingDate,
        items: receiptData,
        worker_id:user.worker_id,
        total_amount: totalAmount,
      });

    // console.log("clicked");


      if(!res.success)
      {
          throw Error(res.message)
      }

    // console.log("clicked");

  
      toast.success("Receipt Generated Successfully!");
      setShowModal(false);
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  console.log(groupedOrders[selectedReceipt])
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Search Input */}
      <form onSubmit={fetchOrders}>
      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          className="border rounded-lg p-2 w-full focus:ring focus:ring-blue-300"
          placeholder="Enter Receipt Number"
          value={receiptNo}
          onChange={(e) => setReceiptNo(e.target.value)}
        />
        <button
        type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          
        >
          Search
        </button>
      </div>
      </form>

      {/* Display Orders */}
      {loading && <p className="text-center text-gray-500 text-lg mt-5">Loading...</p>}
      {error && <p className="text-center text-red-500 text-lg mt-5">{error}</p>}

      {Object.keys(groupedOrders).length === 0 && !loading && !error && (
        <p className="text-center text-gray-500">No orders found.</p>
      )}

      {/* 🔹 Horizontal Receipt-Style Layout */}
      <div className="space-y-6">
        {Object.entries(groupedOrders).map(([receipt, orders]) => (
          <div
            key={receipt}
            className="bg-white shadow-lg rounded-lg border border-gray-300 p-5 w-full overflow-x-auto"
          >
            {/* Receipt Header */}
            <div className="border-b pb-3 mb-3 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                Receipt No: <span className="text-blue-600">{receipt}</span>
              </h3>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                onClick={() => handleReceiveClick(receipt)}
              >
                Receive
              </button>
            </div>

            {/* Order Details in a horizontal row */}
             {/* Order Details in a horizontal row */}
             <div className="flex flex-row gap-6 overflow-x-auto">
              {orders.map((order) => (
                <div
                  key={order.order_id}
                  className="flex flex-col min-w-[300px] bg-gray-100 rounded-md p-4 border border-gray-200 shadow-sm"
                >
                  <h4 className="text-md font-semibold text-gray-800 mb-2">
                    🔹 {order.final_material_name}
                  </h4>
                  <p className="text-gray-700">
                    <span className="font-semibold">Given Date:</span> {order.given_date}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Worker:</span> {order.worker_name}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Labour:</span> {order.labour_name}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Quantity:</span> {order.final_material_expected_quantity}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Produced Quantity:</span> {order.total_produced_quantity || "N/A"}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Damaged Quantity:</span> {order.total_damaged_quantity || "N/A"}
                  </p>

                  <p className="text-gray-700">
                    <span className="font-semibold">Status:</span> {order.status}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Remarks:</span> {order.given_remarks || "N/A"}
                  </p>

                  {/* Used Raw Materials */}
                  <h5 className="text-sm font-semibold mt-2 text-blue-700">
                    🔸 Raw Materials Used:
                  </h5>
                  {order.usedRawMaterials.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-700 text-sm">
                      {order.usedRawMaterials.map((raw) => (
                        <li key={raw.raw_material_name}>
                          {raw.raw_material_name} - {raw.quantity} {raw.unit}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">No raw materials used.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 Modal for Receiving Final Materials */}
      {showModal && selectedReceipt && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
    <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[85vh] flex flex-col">

      {/* Header */}
      <div className="p-5 border-b flex justify-between items-center bg-gray-100">
        <h3 className="text-xl font-bold text-gray-900">
          Receipt No: {selectedReceipt}
        </h3>
        <button
          className="text-gray-500 hover:text-gray-700 text-lg"
          onClick={() => setShowModal(false)}
        >
          ✖
        </button>
      </div>

      {/* Modal Content */}
      <div className="p-5 overflow-y-auto flex-grow">

        {/* Worker & Labour Details */}
        <div className="mb-4 p-4 bg-gray-50 border rounded-lg">
          <h4 className="font-semibold text-gray-700">Worker & Labour Details</h4>
          <p className="text-gray-700">
            <span className="font-semibold">Worker:</span> {groupedOrders[selectedReceipt][0].worker_name}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Labour:</span> {groupedOrders[selectedReceipt][0].labour_name}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Given Date:</span> {groupedOrders[selectedReceipt][0].given_date}
          </p>
        </div>

        {/* Receiving Date */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-1">Receiving Date</label>
          <input
            type="date"
            className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-400"
            value={receivingDate}
            onChange={(e) => setReceivingDate(e.target.value)}
          />
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border text-left text-sm bg-white shadow-md rounded-lg">
            <thead className="bg-gray-100 text-gray-700 uppercase">
              <tr>
                <th className="p-2 border">Final Material</th>
                <th className="p-2 border text-center">Produced Qty</th>
                <th className="p-2 border text-center">Damaged Qty</th>
                <th className="p-2 border text-center">Amount per Unit </th>
                <th className="p-2 border text-center">Amount</th>
                <th className="p-2 border text-center">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {groupedOrders[selectedReceipt].map((order) => (
                <tr key={order.order_id} className="border-b hover:bg-gray-50">
                  <td className="p-2 border">{order.final_material_name}</td>
                  <td className="p-2 border text-center">
                    <input
                      type="text"
                      className="w-16 border rounded p-1 text-center"
                      value={producedQuantities[order.order_id] || ""}
                      onChange={(e) => handleQuantityChange(order.order_id, "produced", e.target.value)}
                      min="0"
                    />
                  </td>
                  <td className="p-2 border text-center">
                    <input
                      type="text"
                      // defaultValue={0}
                      className="w-16 border rounded p-1 text-center"
                      value={damagedQuantities[order.order_id] || ''}
                      onChange={(e) => handleQuantityChange(order.order_id, "damaged", e.target.value)}
                      min="0"
                    />
                  </td>
                  <td className="p-2 border text-center">
                    <input
                      type="text"
                      className="w-24 border rounded p-1 text-center"
                      value={amountPerProduction[order.order_id] || ""}
                      onChange={(e) => handleQuantityChange(order.order_id, "amount", e.target.value)}
                      min="0"
                    />
                  </td>
                  <td className="p-2 border">
                    <p className="w-24 border rounded p-1 text-center">
                      {amountPerProduction[order.order_id] * producedQuantities[order.order_id] }
                    </p>
                  </td>
                  <td className="p-2 border">
                    <input
                      type="text"
                      className="w-full border rounded p-1"
                      value={remarks[order.order_id] || ""}
                      onChange={(e) => handleQuantityChange(order.order_id, "remarks", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Total Amount Display */}
      <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">Total Amount:</h3>
        <span className="text-xl font-semibold text-green-600">₹ {totalAmount.toFixed(2)}</span>
      </div>

      {/* Footer Buttons */}
      <div className="p-5 border-t flex justify-end gap-3 bg-gray-100">
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
          onClick={() => setShowModal(false)}
        >
          Cancel
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          onClick={handleSubmitReceipt}
        >
          Receive
        </button>
      </div>
      
    </div>
  </div>
)}


    </div>
  );
};

export default OrdersByReceipt;
