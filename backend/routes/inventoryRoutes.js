import express from "express";
import {
  getAllItems,
  getItemById,
  addItem,
  updateItem,
  deleteItem,
  searchItems,
  getLowStockItems,
  addUsageRecord,
  getExpiringItems,
  getExpiredItems,
  getExpirySummary,
  issueItems,
  returnItems,
  getAllIssuedItems,
  getIssuedItemById,
  getIssuedItems,
  generateIssuedItemsReport
} from "../controllers/inventoryController.js";
import { generateInventoryReport } from '../controllers/reportController.js';

const router = express.Router();

// Define routes
router.post('/', addItem);
router.get('/search', searchItems);
router.get('/low-stock', getLowStockItems);
router.get('/expiring', getExpiringItems);
router.get('/expired', getExpiredItems);
router.get('/expiry-summary', getExpirySummary);
router.get('/issued-items', getIssuedItems);
router.get('/issued-items/report', generateIssuedItemsReport);
router.post('/issue', issueItems);
router.post('/return', returnItems);
router.get('/:id', getItemById);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
router.get('/', getAllItems);

// Parameterized routes first
router.post("/:id/usage", addUsageRecord);

// Report generation routes
router.get('/reports/inventory', (req, res) => generateInventoryReport(req, res, 'inventory', req.query.format));
router.get('/reports/low-stock', (req, res) => generateInventoryReport(req, res, 'low-stock', req.query.format));
router.get('/reports/expired', (req, res) => generateInventoryReport(req, res, 'expired', req.query.format));
router.get('/reports/expiring', (req, res) => generateInventoryReport(req, res, 'expiring', req.query.format));

export default router;