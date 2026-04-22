import SystemAdminService from "../services/system-admin.service.js";
import ApiError from "../api-error.js";

export const runRecalculateFines = async (req, res, next) => {
    try {
        const result = await SystemAdminService.recalculateFines();
        res.send({
            message: "Tính toán lại tiền phạt thành công",
            ...result
        });
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi tính toán lại tiền phạt"));
    }
};

export const runSyncPrices = async (req, res, next) => {
    try {
        const result = await SystemAdminService.syncPrices();
        res.send({
            message: "Đồng bộ giá sách thành công",
            ...result
        });
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi đồng bộ giá sách"));
    }
};

export const runSyncPaymentStatus = async (req, res, next) => {
    try {
        const result = await SystemAdminService.syncPaymentStatuses();
        res.send({
            message: "Đồng bộ trạng thái thanh toán thành công",
            ...result
        });
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi đồng bộ trạng thái thanh toán"));
    }
};
