// app/services/nhaxuatban.service.js
import mongoose from 'mongoose'; // <-- THÊM DÒNG NÀY ĐỂ KIỂM TRA OBJECT ID
import NhaXuatBan from '../models/NhaXuatBan.js';
import ApiError from '../api-error.js';

class NhaXuatBanService {
    /**
     * Tạo mới hoặc cập nhật (upsert) NXB dựa trên maNXB
     * @param {object} payload Dữ liệu NXB
     * @returns {Promise<object>}
     */
    async create(payload) {
        const filter = { maNXB: payload.maNXB };
        const update = payload;
        
        try {
            return await NhaXuatBan.findOneAndUpdate(filter, update, {
                new: true,
                upsert: true,
                runValidators: true,
            });
        } catch (error) {
            throw new ApiError(500, "Lỗi khi tạo NXB: " + error.message);
        }
    }

    /**
     * Tìm kiếm NXB
     * @param {object} filter Bộ lọc
     * @returns {Promise<Array>}
     */
    async find(filter) {
        return await NhaXuatBan.find(filter);
    }

    /**
     * Tìm theo Tên NXB
     * @param {string} ten Tên NXB
     * @returns {Promise<Array>}
     */
    async findByTenNXB(ten) {
        return await this.find({ 
            tenNXB: { $regex: new RegExp(ten), $options: "i" } 
        });
    }

    /**
     * Tìm theo ID (Hỗ trợ cả ObjectId của Mongo và maNXB do người dùng đặt)
     * @param {string} id ID của tài liệu hoặc maNXB
     * @returns {Promise<object|null>}
     */
    async findById(id) {
        // Nếu id là định dạng chuẩn 24 ký tự của MongoDB
        if (mongoose.Types.ObjectId.isValid(id)) {
            return await NhaXuatBan.findById(id);
        }
        // Nếu id là mã tự đặt (VD: "NXB002")
        return await NhaXuatBan.findOne({ maNXB: id });
    }

    /**
     * Cập nhật NXB
     * @param {string} id ID của tài liệu hoặc maNXB
     * @param {object} payload Dữ liệu cập nhật
     * @returns {Promise<object|null>}
     */
    async update(id, payload) {
        if (payload.maNXB) { // Không cho phép cập nhật đổi mã NXB
            delete payload.maNXB;
        }

        const options = { new: true, runValidators: true };

        // Nếu id là định dạng chuẩn của MongoDB
        if (mongoose.Types.ObjectId.isValid(id)) {
            return await NhaXuatBan.findByIdAndUpdate(id, payload, options);
        }
        // Nếu id là mã tự đặt (VD: "NXB002")
        return await NhaXuatBan.findOneAndUpdate({ maNXB: id }, payload, options);
    }

    /**
     * Xóa NXB
     * @param {string} id ID của tài liệu hoặc maNXB
     * @returns {Promise<object|null>}
     */
    async delete(id) {
        // Nếu id là định dạng chuẩn của MongoDB
        if (mongoose.Types.ObjectId.isValid(id)) {
            return await NhaXuatBan.findByIdAndDelete(id);
        }
        // Nếu id là mã tự đặt (VD: "NXB002")
        return await NhaXuatBan.findOneAndDelete({ maNXB: id });
    }

    /**
     * Xóa tất cả
     * @returns {Promise<number>}
     */
    async deleteAll() {
        const result = await NhaXuatBan.deleteMany({});
        return result.deletedCount;
    }
}

export default new NhaXuatBanService();