import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaMinus, FaTrash, FaExchangeAlt } from "react-icons/fa";

const Issuing = () => {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [issuedTo, setIssuedTo] = useState("");
  const [department, setDepartment] = useState("");
  const [purpose, setPurpose] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [quantityError, setQuantityError] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/inventory`);
      setItems(res.data);
    } catch (err) {
      setError("Error fetching items");
    }
  };

  const getAvailableItems = () => {
    const currentDate = new Date();
    return items.filter(item => 
      item.quantity > 0 && 
      (!item.expiryDate || new Date(item.expiryDate) > currentDate)
    );
  };

  const getAvailableQuantity = (itemId) => {
    const item = items.find(i => i._id === itemId);
    return item ? item.quantity : 0;
  };

  const handleAddItem = (item) => {
    const existingItem = selectedItems.find((i) => i.itemId === item._id);
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      if (newQuantity > item.quantity) {
        setQuantityError(`Cannot add more than ${item.quantity} items of ${item.itemName}`);
        return;
      }
      setSelectedItems(
        selectedItems.map((i) =>
          i.itemId === item._id
            ? { ...i, quantity: newQuantity }
            : i
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          itemId: item._id,
          itemName: item.itemName,
          itemCode: item.itemCode,
          quantity: 1,
        },
      ]);
    }
    setQuantityError(null);
  };

  const handleRemoveItem = (itemId) => {
    setSelectedItems(selectedItems.filter((item) => item.itemId !== itemId));
  };

  const handleQuantityChange = (itemId, change) => {
    const currentItem = selectedItems.find(item => item.itemId === itemId);
    const newQuantity = currentItem.quantity + change;
    const availableQuantity = getAvailableQuantity(itemId);

    if (newQuantity > availableQuantity) {
      setQuantityError(`Cannot add more than ${availableQuantity} items of ${currentItem.itemName}`);
      return;
    }

    if (newQuantity < 1) return;

    setSelectedItems(
      selectedItems.map((item) =>
        item.itemId === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
    setQuantityError(null);
  };

  const handleQuantityInput = (itemId, value) => {
    const newQuantity = parseInt(value);
    const availableQuantity = getAvailableQuantity(itemId);
    const currentItem = selectedItems.find(item => item.itemId === itemId);

    if (!isNaN(newQuantity)) {
      if (newQuantity < 1) return;
      if (newQuantity > availableQuantity) {
        setQuantityError(`Cannot add more than ${availableQuantity} items of ${currentItem.itemName}`);
        return;
      }

      setSelectedItems(
        selectedItems.map((item) =>
          item.itemId === itemId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      setQuantityError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/inventory/issue`, {
        items: selectedItems,
        issuedTo,
        department,
        purpose,
        returnDate: returnDate || undefined,
      });

      setSuccess("Items issued successfully");
      setSelectedItems([]);
      setIssuedTo("");
      setDepartment("");
      setPurpose("");
      setReturnDate("");
      fetchItems();
    } catch (err) {
      console.error("Error details:", err.response?.data);
      setError(err.response?.data?.message || "Error issuing items");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FaExchangeAlt className="text-2xl text-primary" />
          <h1 className="text-2xl font-bold text-gray-800">Issue Items</h1>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {quantityError && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{quantityError}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Available Items</h2>
            </div>
            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {getAvailableItems().map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-800">{item.itemName}</p>
                    <p className="text-sm text-gray-500">
                      Code: {item.itemCode} | Available: {item.quantity}
                      {item.expiryDate && (
                        <span className="ml-2 text-green-600">
                          (Expires: {new Date(item.expiryDate).toLocaleDateString()})
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddItem(item)}
                    className="p-2 text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <FaPlus />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Items and Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Selected Items</h2>
            </div>
            <div className="p-4 space-y-4">
              {selectedItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No items selected</p>
              ) : (
                <div className="space-y-3">
                  {selectedItems.map((item) => (
                    <div
                      key={item.itemId}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{item.itemName}</p>
                        <p className="text-sm text-gray-500">
                          Code: {item.itemCode}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.itemId, -1)}
                          className="p-1.5 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                        >
                          <FaMinus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityInput(item.itemId, e.target.value)}
                          className="w-16 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <button
                          onClick={() => handleQuantityChange(item.itemId, 1)}
                          className="p-1.5 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                        >
                          <FaPlus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.itemId)}
                          className="p-1.5 text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issued To
                  </label>
                  <input
                    type="text"
                    value={issuedTo}
                    onChange={(e) => setIssuedTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purpose
                  </label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Return Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || selectedItems.length === 0}
                  className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors
                    ${loading || selectedItems.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary-dark'
                    }`}
                >
                  {loading ? "Issuing..." : "Issue Items"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Issuing; 