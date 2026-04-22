import YeuCauMuonSach from '../models/YeuCauMuonSach.js';
import TheoDoiMuonSach from '../models/TheoDoiMuonSach.js';
import Sach from '../models/Sach.js';

class SystemAdminService {
    /**
     * Recalculate late fines for all "DaDuyet" (Approved) requests
     */
    async recalculateFines() {
        const requests = await YeuCauMuonSach.find();
        let updateCount = 0;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        for (const req of requests) {
            let tienPhat = 0;
            let trangThaiPhat = req.TrangThaiPhat;
            let needsUpdate = false;

            if (req.TrangThai === "DaDuyet" && req.NgayHenTra) {
                const henTra = new Date(req.NgayHenTra);
                const henTraDate = new Date(henTra.getFullYear(), henTra.getMonth(), henTra.getDate());

                if (today > henTraDate) {
                    const diffTime = Math.abs(today - henTraDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const totalBooks = req.DanhSachSach.reduce((sum, item) => sum + (item.SoLuong || 1), 0);
                    tienPhat = diffDays * totalBooks * 5000;
                    trangThaiPhat = "ChuaThanhToan";
                    
                    if (req.TienPhat !== tienPhat || req.TrangThaiPhat !== trangThaiPhat) {
                        needsUpdate = true;
                    }
                }
            } else if (req.TrangThai === "DaTra" && req.TienPhat > 0) {
                // Heuristic to check if fine is correct based on actual return date
                const trackedBooks = await TheoDoiMuonSach.find({
                    MaDocGia: req.MaDocGia,
                    MaSach: { $in: req.DanhSachSach.map(b => b.MaSach) }
                }).sort({ NgayTra: -1 });

                if (trackedBooks.length > 0 && trackedBooks[0].NgayTra) {
                    const returnDate = new Date(trackedBooks[0].NgayTra);
                    const returnDateDay = new Date(returnDate.getFullYear(), returnDate.getMonth(), returnDate.getDate());
                    const henTra = new Date(req.NgayHenTra);
                    const henTraDate = new Date(henTra.getFullYear(), henTra.getMonth(), henTra.getDate());

                    if (returnDateDay > henTraDate) {
                        const diffTime = Math.abs(returnDateDay - henTraDate);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        const totalBooks = req.DanhSachSach.reduce((sum, item) => sum + (item.SoLuong || 1), 0);
                        tienPhat = diffDays * totalBooks * 5000;
                        
                        if (req.TienPhat !== tienPhat) {
                            needsUpdate = true;
                        }
                    } else if (req.TienPhat > 0) {
                        tienPhat = 0;
                        trangThaiPhat = "KhongPhat";
                        needsUpdate = true;
                    }
                }
            }

            if (needsUpdate) {
                req.TienPhat = tienPhat;
                req.TrangThaiPhat = trangThaiPhat;
                await req.save();
                updateCount++;
            }
        }
        return { totalProcessed: requests.length, updated: updateCount };
    }

    /**
     * Sync book prices and calculate totals for all requests
     */
    async syncPrices() {
        const requests = await YeuCauMuonSach.find();
        let updateCount = 0;

        for (const req of requests) {
            let totalBorrowPrice = 0;
            let needsUpdate = false;

            for (const item of req.DanhSachSach) {
                if (!item.DonGia || item.DonGia === 0) {
                    const book = await Sach.findOne({ MaSach: item.MaSach });
                    if (book) {
                        item.DonGia = book.DonGia;
                        needsUpdate = true;
                    }
                }
                totalBorrowPrice += (item.DonGia || 0) * (item.SoLuong || 1);
            }

            const currentFine = req.TienPhat || 0;
            const expectedTotal = totalBorrowPrice + currentFine;

            if (req.TienMuon !== totalBorrowPrice || req.TongTien !== expectedTotal || needsUpdate) {
                req.TienMuon = totalBorrowPrice;
                req.TongTien = expectedTotal;
                await req.save();
                updateCount++;
            }
        }
        return { totalProcessed: requests.length, updated: updateCount };
    }

    /**
     * Update payment statuses based on total amounts
     */
    async syncPaymentStatuses() {
        const requests = await YeuCauMuonSach.find();
        let updateCount = 0;

        for (const req of requests) {
            let needsUpdate = false;
            
            if (req.TongTien > 0 && req.TrangThaiPhat !== "DaThanhToan") {
                if (req.TrangThaiPhat !== "ChuaThanhToan") {
                    req.TrangThaiPhat = "ChuaThanhToan";
                    needsUpdate = true;
                }
            } else if (req.TongTien === 0) {
                if (req.TrangThaiPhat !== "KhongPhat") {
                    req.TrangThaiPhat = "KhongPhat";
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                await req.save();
                updateCount++;
            }
        }
        return { totalProcessed: requests.length, updated: updateCount };
    }
}

export default new SystemAdminService();
