<script setup>
import { ref, computed, onMounted } from 'vue';
import SachService from "@/services/sach.service";
import { useRouter } from 'vue-router';

const router = useRouter();
const books = ref([]);
const searchText = ref("");
const isLoading = ref(true);

// 1. Hàm lấy danh sách sách
const retrieveBooks = async () => {
    try {
        books.value = await SachService.getAll();
    } catch (error) {
        console.error("Lỗi lấy danh sách sách:", error);
    } finally {
        isLoading.value = false;
    }
};

// 2. Computed: Lọc sách theo thanh tìm kiếm
const filteredBooks = computed(() => {
    if (!searchText.value) return books.value;
    return books.value.filter((book) => {
        const text = searchText.value.toLowerCase();
        return (
            book.TenSach.toLowerCase().includes(text) ||
            book.MaSach.toLowerCase().includes(text)
        );
    });
});

// 3. Hàm Xóa Sách
import axios from "axios"; // Nhớ import ở đầu file

const deleteBook = async (id, tenSach) => {
    if (confirm(`Bạn có chắc chắn muốn xóa sách "${tenSach}" không?`)) {
        try {
            // --- THAY ĐỔI Ở ĐÂY ---
            // Gọi trực tiếp Axios, dùng dấu backtick (`) để truyền biến id
            await axios.delete(`http://localhost:3000/api/sach/${id}`);
            
            alert("Đã xóa sách thành công!");
            retrieveBooks(); 
        } catch (error) {
            console.error(error);
            alert("Xóa thất bại.");
        }
    }
};

// 4. Hàm chuyển hướng sang trang sửa
const xemBook = (id) => {
    // Giả sử bạn dùng route tên 'sach.edit'
    router.push(`/sach/${id}`);
};

// 5. Tiện ích: Format tiền và Ảnh
const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const getImageUrl = (imagePath) => {
    if (imagePath) {
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:3000${imagePath}`;
    }
    return "https://via.placeholder.com/50x75?text=No+Img";
};

onMounted(() => {
    retrieveBooks();
});
</script>

<template>
    <div class="container py-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold text-primary"><i class="fas fa-cogs me-2"></i>Quản Lý Sách</h2>
            <router-link to="/sach/them" class="btn btn-success shadow-sm">
                <i class="fas fa-plus me-1"></i> Thêm Sách Mới
            </router-link>
        </div>

        <div class="card shadow border-0">
            <div class="card-header bg-white py-3">
                <div class="input-group">
                    <span class="input-group-text bg-white border-end-0"><i class="fas fa-search text-muted"></i></span>
                    <input 
                        type="text" 
                        class="form-control border-start-0 ps-0" 
                        placeholder="Tìm kiếm theo tên sách hoặc mã sách..."
                        v-model="searchText"
                    >
                </div>
            </div>

            <div class="card-body p-0">
                <div v-if="isLoading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status"></div>
                </div>

                <div v-else class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="bg-light text-secondary">
                            <tr>
                                <th class="ps-4">Sách</th>
                                <th>Mã Sách</th>
                                <th>Giá bán</th>
                                <th>Kho</th>
                                <th>Năm XB</th>
                                <th class="text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="book in filteredBooks" :key="book._id">
                                <td class="ps-4">
                                    <div class="d-flex align-items-center">
                                        <img :src="getImageUrl(book.HinhAnh)" 
                                             class="rounded border me-3 object-fit-cover"
                                             width="40" height="60">
                                        <div>
                                            <div class="fw-bold text-dark">{{ book.TenSach }}</div>
                                            <small class="text-muted">{{ book.TacGia }}</small>
                                        </div>
                                    </div>
                                </td>
                                <td><span class="badge bg-light text-dark border">{{ book.MaSach }}</span></td>
                                <td class="fw-bold text-primary">{{ formatCurrency(book.DonGia) }}</td>
                                <td>
                                    <span :class="book.SoQuyen > 0 ? 'text-success fw-bold' : 'text-danger fw-bold'">
                                        {{ book.SoQuyen > 0 ? book.SoQuyen : 'Hết hàng' }}
                                    </span>
                                </td>
                                <td>{{ book.NamXuatBan }}</td>
                                <td class="text-center">
                                    <button class="btn btn-sm btn-outline-primary me-2" @click="xemBook(book._id)" title="Xem">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deleteBook(book._id, book.TenSach)" title="Xóa">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="filteredBooks.length === 0">
                                <td colspan="6" class="text-center py-5 text-muted">
                                    <i class="fas fa-search fs-1 mb-3 text-light"></i>
                                    <p class="mb-0">Không tìm thấy sách nào phù hợp.</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="card-footer bg-white py-3 text-end">
                <small class="text-muted">Tổng cộng: <strong class="text-dark">{{ filteredBooks.length }}</strong> đầu sách</small>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* ===== GHI ĐÈ MÀU CHỦ ĐẠO ===== */
.text-primary {
    color: #4f46e5 !important; /* Xanh Indigo */
}

/* ===== NÚT THÊM MỚI (Ghi đè btn-success) ===== */
.btn-success {
    background-color: #4f46e5 !important;
    border-color: #4f46e5 !important;
    border-radius: 12px;
    padding: 10px 20px;
    font-weight: 500;
    transition: all 0.3s ease;
}
.btn-success:hover {
    background-color: #4338ca !important;
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3) !important;
}

/* ===== KHUNG CARD CHÍNH ===== */
.card {
    border-radius: 16px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05) !important;
    overflow: hidden;
}
.card-header, .card-footer {
    border-color: #f1f5f9;
}

/* ===== THANH TÌM KIẾM ===== */
.input-group-text {
    border-color: #e2e8f0;
}
.form-control {
    border-color: #e2e8f0;
    box-shadow: none !important;
    padding: 12px 0;
}
.form-control:focus {
    background-color: transparent;
}
.input-group:focus-within .input-group-text,
.input-group:focus-within .form-control {
    border-color: #4f46e5;
}

/* ===== BẢNG (TABLE) ===== */
.table {
    border-collapse: separate;
    border-spacing: 0;
}
.table thead th {
    background-color: #f8fafc !important;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 0.5px;
    padding: 16px;
    border-bottom: 2px solid #e2e8f0;
}
.table tbody td {
    padding: 16px;
    vertical-align: middle;
    border-bottom: 1px solid #f1f5f9;
    color: #475569;
}
.table-hover tbody tr {
    transition: background-color 0.2s ease;
}
.table-hover tbody tr:hover td {
    background-color: #f8fafc;
}

/* Badge Mã Sách */
.badge.bg-light {
    background-color: #f1f5f9 !important;
    color: #475569 !important;
    border: 1px solid #e2e8f0 !important;
    padding: 6px 10px;
    border-radius: 8px;
    font-weight: 500;
}

/* Tình trạng Kho */
.text-success { color: #10b981 !important; }
.text-danger { color: #ef4444 !important; }

/* ===== ẢNH BÌA SÁCH ===== */
.object-fit-cover {
    object-fit: cover;
    transition: transform 0.3s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
/* Hiệu ứng phóng to ảnh khi hover vào cả dòng (tr) */
tr:hover .object-fit-cover {
    transform: scale(1.1);
}

/* ===== NÚT THAO TÁC (Ghi đè outline bootstrap) ===== */
.btn-outline-primary {
    background-color: #e0e7ff;
    color: #4f46e5;
    border: none;
    border-radius: 8px;
    padding: 8px 12px;
    transition: all 0.2s ease;
}
.btn-outline-primary:hover {
    background-color: #c7d2fe;
    color: #4338ca;
    transform: scale(1.05);
}

.btn-outline-danger {
    background-color: #fee2e2;
    color: #ef4444;
    border: none;
    border-radius: 8px;
    padding: 8px 12px;
    transition: all 0.2s ease;
}
.btn-outline-danger:hover {
    background-color: #fecaca;
    color: #dc2626;
    transform: scale(1.05);
}

/* Helper text */
.text-light {
    color: #e2e8f0 !important;
}
</style>