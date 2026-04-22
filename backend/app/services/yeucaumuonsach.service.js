// services/yeucaumuonsach.service.js
import YeuCauMuonSach from "../models/YeuCauMuonSach.js";
import Sach from "../models/Sach.js";

class YeuCauMuonSachService {
  async create(data) {
    // Tự động tính TienMuon dựa trên DonGia thực tế từ CSDL (không tin tưởng frontend)
    let tienMuon = 0;
    const danhSachSachThucTe = [];

    if (data.DanhSachSach) {
      for (const item of data.DanhSachSach) {
        // Tìm sách bằng MaSach để lấy DonGia chính xác
        const bookInfo = await Sach.findOne({ MaSach: item.MaSach });
        const donGia = bookInfo ? (bookInfo.DonGia || 0) : 0;
        const soLuong = Number(item.SoLuong) || 1;
        
        tienMuon += donGia * soLuong;
        
        danhSachSachThucTe.push({
          ...item,
          DonGia: donGia
        });
      }
    }
    
    const ngayYeuCau = data.NgayYeuCau ? new Date(data.NgayYeuCau) : new Date();
    const ngayHenTra = new Date(ngayYeuCau);
    ngayHenTra.setDate(ngayHenTra.getDate() + 7); // Luôn luôn là 7 ngày
    
    const trangThaiPhat = tienMuon > 0 ? "ChuaThanhToan" : "KhongPhat";

    const newYeuCau = new YeuCauMuonSach({
      ...data,
      DanhSachSach: danhSachSachThucTe,
      NgayYeuCau: ngayYeuCau,
      NgayHenTra: ngayHenTra,
      TrangThaiPhat: trangThaiPhat,
      TienMuon: tienMuon,
      TongTien: tienMuon // Phạt ban đầu = 0
    });
    return await newYeuCau.save();
  }

  async findAll() {
    const requests = await YeuCauMuonSach.find()
      .populate("ThongTinDocGia")
      .populate("DanhSachSach.ThongTinSach")
      .sort({ NgayYeuCau: -1 });

    // Tự động tính phí phạt dự kiến cho các bản ghi đang mượn (DaDuyet) mà đã quá hạn
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return requests.map(req => {
      const row = req.toObject();
      if (row.TrangThai === "DaDuyet" && row.NgayHenTra) {
        const henTra = new Date(row.NgayHenTra);
        const henTraDate = new Date(henTra.getFullYear(), henTra.getMonth(), henTra.getDate());
        
        if (today > henTraDate) {
          const diffTime = Math.abs(today - henTraDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const totalBooks = row.DanhSachSach.reduce((sum, item) => sum + (item.SoLuong || 1), 0);
          row.TienPhat = diffDays * totalBooks * 5000;
          row.TongTien = (row.TienMuon || 0) + row.TienPhat;
          row.IsTamTinh = true; // Cờ để frontend nhận biết đây là phí tạm tính
        } else {
          row.TongTien = (row.TienMuon || 0) + (row.TienPhat || 0);
        }
      } else if (row.TrangThai === "TuChoi") {
        row.TongTien = 0;
      } else {
        row.TongTien = (row.TienMuon || 0) + (row.TienPhat || 0);
      }
      return row;
    });
  }

  async updateStatus(id, trangThai) {
    const updateData = { TrangThai: trangThai };
    if (trangThai === "TuChoi") {
      updateData.TrangThaiPhat = "KhongPhat";
      updateData.TienPhat = 0;
      // Có thể giữ TienMuon để xem lại nhưng TongTien nên phản ánh là không cần thu
      updateData.TongTien = 0; 
    }
    return await YeuCauMuonSach.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  }

  async findOverdueOrUnpaid(maDocGia) {
    return await YeuCauMuonSach.find({
      MaDocGia: maDocGia,
      $or: [
        { TrangThai: "DaDuyet", NgayHenTra: { $lt: new Date() } },
        { TrangThaiPhat: "ChuaThanhToan" }
      ]
    });
  }

  async markAsReturnedWithFee(id) {
    const yeuCau = await YeuCauMuonSach.findById(id);
    if (!yeuCau) return null;

    let tienPhat = 0;
    let trangThaiPhat = "KhongPhat";

    const now = new Date();
    // Compare dates (ignore time)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const henTra = yeuCau.NgayHenTra ? new Date(yeuCau.NgayHenTra.getFullYear(), yeuCau.NgayHenTra.getMonth(), yeuCau.NgayHenTra.getDate()) : today;

    if (today > henTra) {
       // Tính số ngày trễ hẹn, mỗi ngày 5k/quyển
       const diffTime = Math.abs(today - henTra);
       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
       const totalBooks = yeuCau.DanhSachSach.reduce((sum, item) => sum + (item.SoLuong || 1), 0);
       tienPhat = diffDays * totalBooks * 5000;
       trangThaiPhat = "ChuaThanhToan";
    }

    yeuCau.TrangThai = "DaTra";
    yeuCau.TienPhat = tienPhat;
    yeuCau.TongTien = (yeuCau.TienMuon || 0) + tienPhat;

    // Phải thu nếu tổng tiền > 0 và trạng thái cũ chưa phải là đã thanh toán
    if (yeuCau.TongTien > 0 && yeuCau.TrangThaiPhat !== "DaThanhToan") {
      yeuCau.TrangThaiPhat = "ChuaThanhToan";
    } else if (yeuCau.TongTien === 0) {
      yeuCau.TrangThaiPhat = "KhongPhat";
    }

    return await yeuCau.save();
  }

  async payFine(id) {
    const yeuCau = await YeuCauMuonSach.findById(id);
    if (!yeuCau) return null;

    let tienPhat = yeuCau.TienPhat || 0;
    
    // Nếu chưa trả sách, tính phí phạt ngay tại thời điểm thanh toán
    if (yeuCau.TrangThai !== "DaTra") {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const henTra = yeuCau.NgayHenTra ? new Date(yeuCau.NgayHenTra.getFullYear(), yeuCau.NgayHenTra.getMonth(), yeuCau.NgayHenTra.getDate()) : today;

        if (today > henTra) {
            const diffTime = Math.abs(today - henTra);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const totalBooks = yeuCau.DanhSachSach.reduce((sum, item) => sum + (item.SoLuong || 1), 0);
            tienPhat = diffDays * totalBooks * 5000;
        }
    }

    return await YeuCauMuonSach.findByIdAndUpdate(
      id,
      { 
        TrangThaiPhat: "DaThanhToan",
        TrangThai: "DaTra",
        TienPhat: tienPhat,
        TongTien: (yeuCau.TienMuon || 0) + tienPhat
      },
      { new: true }
    );
  }
  async findByMaDocGia(maDocGia) {
    const requests = await YeuCauMuonSach.find({ MaDocGia: maDocGia })
      .populate({
        path: "DanhSachSach.ThongTinSach",
        select: "TenSach HinhAnh DonGia TacGia",
      })
      .sort({ NgayYeuCau: -1 });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return requests.map(req => {
      const row = req.toObject();
      if (row.TrangThai === "DaDuyet" && row.NgayHenTra) {
        const henTra = new Date(row.NgayHenTra);
        const henTraDate = new Date(henTra.getFullYear(), henTra.getMonth(), henTra.getDate());
        
        if (today > henTraDate) {
          const diffTime = Math.abs(today - henTraDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const totalBooks = row.DanhSachSach.reduce((sum, item) => sum + (item.SoLuong || 1), 0);
          row.TienPhat = diffDays * totalBooks * 5000;
          row.TongTien = (row.TienMuon || 0) + row.TienPhat;
          row.IsTamTinh = true;
        } else {
          row.TongTien = (row.TienMuon || 0) + (row.TienPhat || 0);
        }
      } else if (row.TrangThai === "TuChoi") {
        row.TongTien = 0;
      } else {
        row.TongTien = (row.TienMuon || 0) + (row.TienPhat || 0);
      }
      return row;
    });
  }
}

export default new YeuCauMuonSachService();
