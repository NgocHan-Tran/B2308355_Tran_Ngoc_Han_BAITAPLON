import express from "express";
import * as systemAdminController from "../controllers/system-admin.controller.js";

const router = express.Router();

router.post("/recalculate-fines", systemAdminController.runRecalculateFines);
router.post("/sync-prices", systemAdminController.runSyncPrices);
router.post("/sync-payment-status", systemAdminController.runSyncPaymentStatus);

export default router;
