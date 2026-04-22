import express from "express";
import * as yeuCauMuonSachController from "../controllers/yeucaumuonsach.controller.js";

const router = express.Router();

// Đường dẫn gốc: /api/yeu-cau-muon
router
  .route("/")
  .get(yeuCauMuonSachController.findAll) // Admin: Lấy danh sách yêu cầu
  .post(yeuCauMuonSachController.create); // User: Gửi yêu cầu mượn sách

// Đường dẫn có tham số ID: /api/yeu-cau-muon/:id
router.route("/:id").put(yeuCauMuonSachController.updateStatus);
router.route("/:id/pay-fine").put(yeuCauMuonSachController.payFine);
router
  .route("/history/:maDocGia")
  .get(yeuCauMuonSachController.getHistoryByUser);

router.get("/check-debt/:maDocGia", yeuCauMuonSachController.checkDebt);

export default router;
