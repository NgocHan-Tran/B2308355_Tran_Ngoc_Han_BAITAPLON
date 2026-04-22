import YeuCauMuonSachService from "../services/yeucaumuonsach.service.js";
import ApiError from "../api-error.js";

// Tạo yêu cầu mượn (User gửi từ giỏ hàng)
export const create = async (req, res, next) => {
  try {
    // Ktra xem user có sách mượn quá hạn chưa trả hay có phí phạt chưa đóng không
    if (req.body.MaDocGia) {
      const overdueAndUnpaid = await YeuCauMuonSachService.findOverdueOrUnpaid(req.body.MaDocGia);
      if (overdueAndUnpaid && overdueAndUnpaid.length > 0) {
        return next(new ApiError(400, "Bạn có sách quá hạn chưa trả hoặc phí phạt chưa thanh toán. Không thể mượn thêm!"));
      }
    }

    // req.body cần có: { MaDocGia: "...", DanhSachSach: [{MaSach: "...", TenSach: "..."}] }
    const document = await YeuCauMuonSachService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, `Lỗi khi tạo yêu cầu mượn: ${error.message}`));
  }
};

// Kiểm tra nợ/quá hạn (User)
export const checkDebt = async (req, res, next) => {
  try {
    const { maDocGia } = req.params;
    const overdueAndUnpaid = await YeuCauMuonSachService.findOverdueOrUnpaid(maDocGia);
    return res.send({
      hasDebt: overdueAndUnpaid && overdueAndUnpaid.length > 0,
      count: overdueAndUnpaid ? overdueAndUnpaid.length : 0
    });
  } catch (error) {
    return next(new ApiError(500, `Lỗi kiểm tra nợ: ${error.message}`));
  }
};

// Lấy danh sách (Admin)
export const findAll = async (req, res, next) => {
  try {
    const documents = await YeuCauMuonSachService.findAll();
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, `Lỗi khi lấy danh sách: ${error.message}`));
  }
};

// Duyệt yêu cầu (Admin cập nhật trạng thái)
export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { TrangThai } = req.body; // Ví dụ gửi lên: { "TrangThai": "DaDuyet" }
    
    // Check nếu TrangThai là DaTra thì sẽ tính phí bằng service
    let document;
    if (TrangThai === "DaTra") {
      document = await YeuCauMuonSachService.markAsReturnedWithFee(id);
    } else {
      document = await YeuCauMuonSachService.updateStatus(id, TrangThai);
    }

    if (!document) {
      return next(new ApiError(404, "Không tìm thấy yêu cầu"));
    }
    return res.send({ message: "Cập nhật trạng thái thành công", document });
  } catch (error) {
    return next(new ApiError(500, `Lỗi cập nhật: ${error.message}`));
  }
};

// Thu phí phạt (Admin)
export const payFine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await YeuCauMuonSachService.payFine(id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy yêu cầu"));
    }
    return res.send({ message: "Đã thu phí thành công", document });
  } catch (error) {
    return next(new ApiError(500, `Lỗi thu phí: ${error.message}`));
  }
};

export const getHistoryByUser = async (req, res, next) => {
  try {
    const { maDocGia } = req.params;

    // Gọi service tìm kiếm
    const documents = await YeuCauMuonSachService.findByMaDocGia(maDocGia);

    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi lấy lịch sử mượn: " + error.message)
    );
  }
};
