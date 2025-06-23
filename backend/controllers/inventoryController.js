import Inventory from "../models/Inventory.js";
import IssuedItem from "../models/IssuedItem.js";
import ExcelJS from 'exceljs';

// Get all items with optional filtering
export const getAllItems = async (req, res) => {
  try {
    const { category, lowStock } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (lowStock === 'true') {
      query.quantity = { $lte: '$minStockLevel' };
    }

    const items = await Inventory.find(query).sort({ lastUpdated: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single item
export const getItemById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add new item
export const addItem = async (req, res) => {
  try {
    console.log('Received request body:', req.body);

    // Validate required fields
    const requiredFields = ['itemCode', 'itemName', 'category', 'quantity', 'minStockLevel'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Validate category
    const validCategories = ['Reagents', 'Lab Equipment', 'Consumables', 'Glassware', 'Safety Equipment', 'Diagnostic Kits'];
    if (!validCategories.includes(req.body.category)) {
      return res.status(400).json({ 
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
      });
    }

    // Validate numeric fields
    if (isNaN(req.body.quantity) || isNaN(req.body.minStockLevel)) {
      return res.status(400).json({ 
        message: 'Quantity and minimum stock level must be numbers' 
      });
    }

    if (req.body.quantity < 0 || req.body.minStockLevel < 0) {
      return res.status(400).json({ 
        message: 'Quantity and minimum stock level cannot be negative' 
      });
    }

    // Check for duplicate item code
    const existingItem = await Inventory.findOne({ itemCode: req.body.itemCode });
    if (existingItem) {
      return res.status(400).json({ message: "Item code already exists" });
    }

    // Format the data
    const itemData = {
      ...req.body,
      quantity: Number(req.body.quantity),
      minStockLevel: Number(req.body.minStockLevel),
      lastUpdated: new Date()
    };

    // Handle expiration date if provided
    if (req.body.expirationDate) {
      itemData.expirationDate = new Date(req.body.expirationDate);
    }

    console.log('Creating item with data:', itemData);
    const item = new Inventory(itemData);
    const savedItem = await item.save();
    console.log('Item saved successfully:', savedItem);
    
    res.status(201).json(savedItem);
  } catch (err) {
    console.error('Error in addItem controller:', err);
    // Check for specific Mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ message: 'Validation Error', errors });
    }
    // Check for duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Item code already exists' });
    }
    // Check for MongoDB connection error
    if (err.name === 'MongoServerError') {
      return res.status(500).json({ 
        message: 'Database connection error',
        error: err.message
      });
    }
    // General error
    res.status(500).json({ 
      message: 'Error adding item',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Update item
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If updating itemCode, check for duplicates
    if (updates.itemCode) {
      const existingItem = await Inventory.findOne({ 
        itemCode: updates.itemCode,
        _id: { $ne: id } // Exclude current item from the check
      });
      if (existingItem) {
        return res.status(400).json({ 
          message: "Item code already exists",
          details: `The item code '${updates.itemCode}' is already in use by another item`
        });
      }
    }

    // Format numeric fields
    if (updates.quantity) {
      updates.quantity = Number(updates.quantity);
    }
    if (updates.minStockLevel) {
      updates.minStockLevel = Number(updates.minStockLevel);
    }

    // Update lastUpdated timestamp
    updates.lastUpdated = new Date();

    const updatedItem = await Inventory.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(updatedItem);
  } catch (err) {
    console.error('Error in updateItem controller:', err);
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ message: 'Validation Error', errors });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: 'Item code already exists',
        details: 'The item code you are trying to use is already in use by another item'
      });
    }

    res.status(500).json({ 
      message: 'Error updating item',
      error: err.message
    });
  }
};

// Delete item
export const deleteItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search items
export const searchItems = async (req, res) => {
  try {
    const { query, category } = req.query;
    let searchQuery = {};

    if (query) {
      searchQuery.$or = [
        { itemName: { $regex: query, $options: "i" } },
        { itemCode: { $regex: query, $options: "i" } }
      ];
    }

    if (category) {
      searchQuery.category = category;
    }

    const items = await Inventory.find(searchQuery).sort({ lastUpdated: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get low stock items
export const getLowStockItems = async (req, res) => {
  try {
    const items = await Inventory.find({
      $expr: {
        $lte: ["$quantity", "$minStockLevel"]
      }
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add usage record
export const addUsageRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantityUsed, usedBy, purpose } = req.body;

    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.quantity < quantityUsed) {
      return res.status(400).json({ message: "Insufficient quantity available" });
    }

    // Add usage record and update quantity
    item.usageHistory.push({
      date: new Date(),
      quantityUsed,
      usedBy,
      purpose
    });
    item.quantity -= quantityUsed;
    item.lastUpdated = new Date();

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get expiring items
export const getExpiringItems = async (req, res) => {
  try {
    const { days = 30 } = req.query; // Default to 30 days
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + parseInt(days));

    const items = await Inventory.find({
      expirationDate: {
        $exists: true,
        $ne: null,
        $gte: today,
        $lte: futureDate
      }
    }).sort({ expirationDate: 1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get expired items
export const getExpiredItems = async (req, res) => {
  try {
    const today = new Date();

    const items = await Inventory.find({
      expirationDate: {
        $exists: true,
        $ne: null,
        $lt: today
      }
    }).sort({ expirationDate: 1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get expiry summary
export const getExpirySummary = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(today.getDate() + 90);

    const [expired, expiringThirtyDays, expiringNinetyDays] = await Promise.all([
      // Get expired items count
      Inventory.countDocuments({
        expirationDate: { $lt: today }
      }),
      // Get items expiring in 30 days count
      Inventory.countDocuments({
        expirationDate: {
          $gte: today,
          $lte: thirtyDaysFromNow
        }
      }),
      // Get items expiring in 90 days count
      Inventory.countDocuments({
        expirationDate: {
          $gte: today,
          $lte: ninetyDaysFromNow
        }
      })
    ]);

    res.json({
      expired,
      expiringThirtyDays,
      expiringNinetyDays
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Issue items
export const issueItems = async (req, res) => {
  try {
    const { items, issuedTo, department, purpose, returnDate } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "At least one item must be issued" });
    }

    if (!issuedTo || !department || !purpose) {
      return res.status(400).json({ message: "Issued to, department, and purpose are required" });
    }

    const issuedItems = [];
    const errors = [];

    // Process each item
    for (const item of items) {
      const { itemId, quantity } = item;

      try {
        const inventoryItem = await Inventory.findById(itemId);
        if (!inventoryItem) {
          errors.push(`Item not found: ${itemId}`);
          continue;
        }

        if (inventoryItem.quantity < quantity) {
          errors.push(`Insufficient quantity for item: ${inventoryItem.itemName}`);
          continue;
        }

        // Create issued item record
        const issuedItem = {
          itemId,
          itemName: inventoryItem.itemName,
          itemCode: inventoryItem.itemCode,
          quantity,
          issuedTo,
          department,
          purpose,
          issueDate: new Date(),
          returnDate: returnDate ? new Date(returnDate) : null,
          status: 'issued'
        };

        // Update inventory quantity
        inventoryItem.quantity -= quantity;
        await inventoryItem.save();

        issuedItems.push(issuedItem);
      } catch (err) {
        errors.push(`Error processing item ${itemId}: ${err.message}`);
      }
    }

    if (issuedItems.length === 0) {
      return res.status(400).json({ 
        message: "No items were issued",
        errors 
      });
    }

    // Save issued items to database
    const savedIssuedItems = await IssuedItem.insertMany(issuedItems);

    res.status(201).json({
      message: "Items issued successfully",
      issuedItems: savedIssuedItems,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Return issued items
export const returnItems = async (req, res) => {
  try {
    const { issuedItemIds } = req.body;

    if (!issuedItemIds || !Array.isArray(issuedItemIds)) {
      return res.status(400).json({ message: "Issued item IDs are required" });
    }

    const returnedItems = [];
    const errors = [];

    for (const issuedItemId of issuedItemIds) {
      try {
        const issuedItem = await IssuedItem.findById(issuedItemId);
        if (!issuedItem) {
          errors.push(`Issued item not found: ${issuedItemId}`);
          continue;
        }

        if (issuedItem.status === 'returned') {
          errors.push(`Item already returned: ${issuedItem.itemName}`);
          continue;
        }

        // Update inventory quantity
        const inventoryItem = await Inventory.findById(issuedItem.itemId);
        if (inventoryItem) {
          inventoryItem.quantity += issuedItem.quantity;
          await inventoryItem.save();
        }

        // Update issued item status
        issuedItem.status = 'returned';
        issuedItem.returnDate = new Date();
        await issuedItem.save();

        returnedItems.push(issuedItem);
      } catch (err) {
        errors.push(`Error processing return for item ${issuedItemId}: ${err.message}`);
      }
    }

    if (returnedItems.length === 0) {
      return res.status(400).json({ 
        message: "No items were returned",
        errors 
      });
    }

    res.json({
      message: "Items returned successfully",
      returnedItems,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all issued items
export const getAllIssuedItems = async (req, res) => {
  try {
    const { status, department } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (department) {
      query.department = department;
    }

    const issuedItems = await IssuedItem.find(query)
      .sort({ issueDate: -1 })
      .populate('itemId', 'itemName itemCode');

    res.json(issuedItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get issued items by ID
export const getIssuedItemById = async (req, res) => {
  try {
    const issuedItem = await IssuedItem.findById(req.params.id)
      .populate('itemId', 'itemName itemCode');

    if (!issuedItem) {
      return res.status(404).json({ message: "Issued item not found" });
    }

    res.json(issuedItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get issued items with optional month filter
export const getIssuedItems = async (req, res) => {
  try {
    const { month } = req.query;
    let query = {};

    if (month) {
      try {
        const startDate = new Date(month);
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        query.issueDate = {
          $gte: startDate,
          $lte: endDate
        };
      } catch (error) {
        return res.status(400).json({ 
          message: 'Invalid month format',
          error: 'Please provide a valid month in YYYY-MM format'
        });
      }
    }

    const issuedItems = await IssuedItem.find(query)
      .populate({
        path: 'itemId',
        select: 'itemName itemCode',
        options: { lean: true }
      })
      .sort({ issueDate: -1 });

    if (!issuedItems || !Array.isArray(issuedItems)) {
      return res.status(500).json({ 
        message: 'Error processing issued items',
        error: 'Invalid data format received from database'
      });
    }

    // Transform the data to include item details
    const transformedItems = issuedItems.map(item => {
      if (!item) return null;

      // Check if itemId exists and has the required properties
      const itemName = item.itemId?.itemName || item.itemName || 'Unknown Item';
      const itemCode = item.itemId?.itemCode || item.itemCode || 'N/A';

      return {
        _id: item._id,
        itemName,
        itemCode,
        quantity: item.quantity || 0,
        issuedTo: item.issuedTo || 'Unknown',
        department: item.department || 'Unknown',
        purpose: item.purpose || 'Not specified',
        issueDate: item.issueDate,
        returnDate: item.returnDate,
        status: item.status || 'issued'
      };
    }).filter(item => item !== null); // Remove any null items

    res.json(transformedItems);
  } catch (error) {
    console.error('Error fetching issued items:', error);
    res.status(500).json({ 
      message: 'Error fetching issued items',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Generate Excel report for issued items
export const generateIssuedItemsReport = async (req, res) => {
  try {
    const { month, format } = req.query;
    let query = {};

    if (month) {
      const startDate = new Date(month);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      query.issueDate = {
        $gte: startDate,
        $lte: endDate
      };
    }

    if (format === 'excel' || format === 'xlsx' || !format) {
    const issuedItems = await IssuedItem.find(query)
      .populate('itemId', 'itemName itemCode')
      .sort({ issueDate: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Issued Items');

    // Add headers
    worksheet.columns = [
      { header: 'Item Name', key: 'itemName', width: 30 },
      { header: 'Item Code', key: 'itemCode', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Issued To', key: 'issuedTo', width: 20 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Purpose', key: 'purpose', width: 30 },
      { header: 'Issue Date', key: 'issueDate', width: 15 },
      { header: 'Return Date', key: 'returnDate', width: 15 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    // Style the headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data
    issuedItems.forEach(item => {
      worksheet.addRow({
        itemName: item.itemId.itemName,
        itemCode: item.itemId.itemCode,
        quantity: item.quantity,
        issuedTo: item.issuedTo,
        department: item.department,
        purpose: item.purpose,
        issueDate: item.issueDate.toLocaleDateString(),
        returnDate: item.returnDate ? item.returnDate.toLocaleDateString() : 'N/A',
        status: item.status
      });
    });

    // Add summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    
    // Add summary data
    const totalItems = issuedItems.length;
    const totalQuantity = issuedItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Department analysis
    const departmentAnalysis = {};
    issuedItems.forEach(item => {
      departmentAnalysis[item.department] = (departmentAnalysis[item.department] || 0) + item.quantity;
    });

    // Item analysis
    const itemAnalysis = {};
    issuedItems.forEach(item => {
      itemAnalysis[item.itemId.itemName] = (itemAnalysis[item.itemId.itemName] || 0) + item.quantity;
    });

    // Add summary headers
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 }
    ];

    // Style summary headers
    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add summary data
    summarySheet.addRow({ metric: 'Total Items Issued', value: totalItems });
    summarySheet.addRow({ metric: 'Total Quantity', value: totalQuantity });
    summarySheet.addRow({ metric: '', value: '' }); // Empty row

    // Add department analysis
    summarySheet.addRow({ metric: 'Department Analysis', value: '' });
    Object.entries(departmentAnalysis)
      .sort(([, a], [, b]) => b - a)
      .forEach(([dept, count]) => {
        summarySheet.addRow({ metric: dept, value: count });
      });

    summarySheet.addRow({ metric: '', value: '' }); // Empty row

    // Add item analysis
    summarySheet.addRow({ metric: 'Item Analysis', value: '' });
    Object.entries(itemAnalysis)
      .sort(([, a], [, b]) => b - a)
      .forEach(([item, count]) => {
        summarySheet.addRow({ metric: item, value: count });
      });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=issued-items-report-${month || 'all'}.xlsx`);

      // Write to response
      const buffer = await workbook.xlsx.writeBuffer();
      res.send(buffer);
      return;
    }
    // ... existing code ...
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
};