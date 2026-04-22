<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const requests = ref([]); // Chứa danh sách phiếu mượn
const isLoading = ref(true);
const currentUser = ref(null);

// 1. Hàm định dạng tiền tệ
const formatCurrency = (value) => {
    if (!value) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// 2.5. Hàm tính tổng số lượng sách trong một phiếu mượn
const getTotalQty = (req) => {
    if (!req || !req.DanhSachSach) return 0;
    return req.DanhSachSach.reduce((sum, item) => sum + (Number(item.SoLuong) || 1), 0);
};

// 2. Hàm định dạng ngày tháng
const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

// 3. Hàm hiển thị trạng thái đẹp hơn
const getStatusInfo = (status) => {
    switch (status) {
        case 'DangCho': return { text: 'Đang chờ duyệt', class: 'bg-warning text-dark' };
        case 'DaDuyet': return { text: 'Đang mượn', class: 'bg-primary' };
        case 'DaTra': return { text: 'Đã trả', class: 'bg-success' };
        case 'TuChoi': return { text: 'Từ chối', class: 'bg-danger' };
        default: return { text: status, class: 'bg-secondary' };
    }
};

// 4. Hàm lấy đường dẫn ảnh (Xử lý link từ backend)
const getImageUrl = (bookDetail) => {
    // bookDetail là object bên trong mảng DanhSachSach
    // Sau khi populate, nó sẽ có field ThongTinSach chứa HinhAnh
    if (bookDetail.ThongTinSach && bookDetail.ThongTinSach.HinhAnh) {
        const img = bookDetail.ThongTinSach.HinhAnh;
        if (img.startsWith('http')) return img;
        return `http://localhost:3000${img}`;
    }
    return "https://via.placeholder.com/60x80?text=No+Img";
};

// 5. Hàm gọi API lấy dữ liệu
const fetchHistory = async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
        router.push("/dangnhap");
        return;
    }
    
    currentUser.value = JSON.parse(userStr);
    
    // SỬA ĐIỂM 1: Đảo ngược lại, ưu tiên lấy _id giống hệt lúc mượn sách
    const maDocGia = currentUser.value._id || currentUser.value.maDocGia;

    if (!maDocGia) {
        console.error("Không tìm thấy mã độc giả");
        isLoading.value = false;
        return;
    }

    try {
        // SỬA ĐIỂM 2: Đổi URL thành định dạng Query Param chuẩn
        const response = await axios.get(`http://localhost:3000/api/yeucaumuonsach?MaDocGia=${maDocGia}`);
        
        // Sắp xếp lịch sử mới nhất lên đầu (Tùy chọn cho đẹp)
        requests.value = response.data.sort((a, b) => new Date(b.NgayYeuCau) - new Date(a.NgayYeuCau));
        
    } catch (error) {
        console.error("Lỗi tải lịch sử:", error);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchHistory();
});
</script>

<template>
    <div class="container py-5">
        <h2 class="mb-4 fw-bold text-primary"><i class="fas fa-history me-2"></i>Lịch sử mượn sách</h2>

        <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Đang tải dữ liệu...</p>
        </div>

        <div v-else-if="requests.length === 0" class="text-center py-5 bg-light rounded">
            <i class="fas fa-box-open fs-1 text-muted mb-3"></i>
            <h5>Bạn chưa có lịch sử mượn sách nào.</h5>
            <router-link to="/sach" class="btn btn-primary mt-3">Mượn sách ngay</router-link>
        </div>

        <div v-else>
            <div v-for="req in requests" :key="req._id" class="card shadow-sm mb-4 border-0">
                <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
                    <div>
                        <div class="fw-bold text-dark">Mã phiếu: #{{ req._id.slice(-6).toUpperCase() }}</div>
                        <small class="text-muted">Ngày tạo: {{ formatDate(req.NgayYeuCau) }}</small>
                    </div>
                    <span class="badge rounded-pill px-3 py-2" :class="getStatusInfo(req.TrangThai).class">
                        {{ getStatusInfo(req.TrangThai).text }}
                    </span>
                </div>

                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table mb-0 align-middle">
                            <thead class="bg-light">
                                <tr>
                                    <th class="ps-4">Sách</th>
                                    <th class="text-center">Số lượng</th>
                                    <th class="text-end pe-4">Đơn giá</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, idx) in req.DanhSachSach" :key="idx">
                                    <td class="ps-4">
                                        <div class="d-flex align-items-center">
                                            <img :src="getImageUrl(item)" 
                                                 class="rounded border me-3 object-fit-cover"
                                                 width="50" height="70" 
                                                 alt="Book cover">
                                            
                                            <div>
                                                <div class="fw-bold text-dark">
                                                    {{ item.ThongTinSach?.TenSach || item.TenSach || 'Sách không tồn tại' }}
                                                </div>
                                                <small class="text-muted">Mã: {{ item.MaSach }}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="text-center">{{ item.SoLuong || 1 }}</td> <td class="text-end pe-4 text-primary fw-bold">
                                        {{ formatCurrency(item.ThongTinSach?.DonGia) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="card-footer bg-light d-flex flex-column gap-2 py-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <div v-if="req.TienPhat && req.TienPhat > 0" class="d-flex flex-column gap-1">
                            <span class="badge" :class="req.IsTamTinh ? 'bg-warning text-dark' : 'bg-danger'">
                                <i class="fas fa-exclamation-triangle me-1"></i>
                                Phí trễ hạn: {{ formatCurrency(req.TienPhat) }}
                                <span v-if="req.IsTamTinh" class="ms-1 small">(Tạm tính)</span>
                            </span>
                        </div>
                        <div v-else></div>
                        <small class="text-muted">Tổng số lượng: <strong>{{ getTotalQty(req) }}</strong> quyển</small>
                    </div>

                    <div class="border-top pt-2 d-flex justify-content-between align-items-end">
                        <div class="text-secondary small">
                            <div>Tiền mượn: {{ formatCurrency(req.TienMuon) }}</div>
                            <div v-if="req.TienPhat > 0">Phí phạt: {{ formatCurrency(req.TienPhat) }}</div>
                        </div>
                        <div class="text-end">
                            <span class="text-muted small">Tổng cộng:</span>
                            <div class="fw-bold fs-4 text-primary line-height-1">
                                {{ formatCurrency(req.TongTien) }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.object-fit-cover {
    object-fit: cover;
}
.line-height-1 {
    line-height: 1;
}
.fw-500 { font-weight: 500; }
</style>