<script setup>
import { ref, onMounted } from 'vue';
// 1. Import thêm useRouter
import { useRoute, useRouter } from 'vue-router'; 
import SachService from "@/services/sach.service";
import NhaXuatBanService from "@/services/nhaxuatban.service";

const route = useRoute();
// 2. Khởi tạo router instance
const router = useRouter(); 

const book = ref(null); 
const quantity = ref(1); 
const isLoading = ref(true); 
const error = ref(null);

// Lấy role từ localStorage
const userRole = ref(localStorage.getItem('role') || null);

const nxb = ref({
    maNXB: "",
    tenNXB: "",
    diaChi: ""
});

// Tiêu đề trang động
// const pageTitle = computed(() => isEditMode.value ? "Cập Nhật Nhà Xuất Bản" : "Thêm NXB Mới");



// Hàm lấy dữ liệu từ Backend
const getBook = async () => {
    try {
        const id = route.params.id;
        const data = await SachService.get(id);
        const nxbData = await NhaXuatBanService.get(data.MaNXB);

        book.value = {
            id: data._id,           
            maSach: data.MaSach,    
            tenSach: data.TenSach,
            gia: data.DonGia || 0,  
            soLuongTon: data.SoQuyen || 0,
            // Lấy tên NXB từ populate (quan trọng)
            nhaXuatBan: nxbData.tenNXB || "Đang cập nhật...", 
            tacGia: data.TacGia,
            moTa: data.MoTa || "Đang cập nhật mô tả...",
            
            // --- SỬA DÒNG NÀY ---
            // Lúc nãy Backend đã lưu sẵn "/uploads/..." vào DB rồi
            // Nên ở đây chỉ cần nối domain vào thôi.
            // CŨ (Sai): .../uploads/${data.HinhAnh}
            // MỚI (Đúng): ...${data.HinhAnh}
            anhChinh: data.HinhAnh
                ? (data.HinhAnh.startsWith('http') ? data.HinhAnh : `http://localhost:3000${data.HinhAnh}`)
                : "https://via.placeholder.com/600x800?text=No+Image",
        };

    } catch (err) {
        console.log(err);
        error.value = "Không tìm thấy sách hoặc lỗi kết nối!";
    } finally {
        isLoading.value = false;
    }
};

const increaseQty = () => quantity.value++;
const decreaseQty = () => { if(quantity.value > 1) quantity.value--; };

const addToCart = () => {
    // --- KIỂM TRA ĐĂNG NHẬP ---
    const userJson = localStorage.getItem('user');
    
    // Nếu chưa đăng nhập
    if (!userJson) {
        const confirmLogin = confirm("Bạn cần đăng nhập để mượn sách. Đi đến trang đăng nhập ngay?");
        if (confirmLogin) {
            // Chuyển hướng đến trang đăng nhập (đảm bảo path '/dangnhap' đúng với file router của bạn)
            router.push("/dangnhap"); 
        }
        return; // Dừng hàm lại
    }
    // -------------------------------

    const itemToAdd = {
        _id: book.value.id,
        MaSach: book.value.maSach,
        TenSach: book.value.tenSach,
        HinhAnh: book.value.anhChinh, 
        TacGia: book.value.tacGia,
        DonGia: book.value.gia,
        SoLuong: quantity.value       
    };

    let cart = [];
    try {
        const savedCart = localStorage.getItem('cart');
        cart = savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
        console.error("Lỗi đọc giỏ hàng", e);
        cart = [];
    }

    const existingItemIndex = cart.findIndex(item => item._id === itemToAdd._id);

    if (existingItemIndex !== -1) {
        cart[existingItemIndex].SoLuong += quantity.value;
    } else {
        cart.push(itemToAdd);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));

    alert(`Đã thêm ${quantity.value} quyển "${book.value.tenSach}" vào giỏ!`);
};

onMounted(() => {
    getBook();
});
</script>

<template>
    <div class="container py-5">
        <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Đang tải thông tin sách...</p>
        </div>

        <div v-else-if="error" class="alert alert-danger text-center">
            {{ error }}
            <br>
            <router-link to="/sach" class="btn btn-sm btn-outline-danger mt-2">Quay lại danh sách</router-link>
        </div>

        <div v-else-if="book" class="row bg-white p-4 rounded shadow-sm">
            <nav aria-label="breadcrumb" class="col-12 mb-4">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><router-link to="/">Trang chủ</router-link></li>
                    <li class="breadcrumb-item"><router-link to="/sach">Sách</router-link></li>
                    <li class="breadcrumb-item active">{{ book.tenSach }}</li>
                </ol>
            </nav>

            <div class="col-md-5 mb-4">
                <div class="book-image-wrapper">
                    <img :src="book.anhChinh" class="book-cover" alt="Book Cover">
                </div>
            </div>

            <div class="col-md-7 ps-md-4">
                <div class="badge bg-indigo-soft text-indigo mb-2">Mã: {{ book.maSach }}</div>
                <h2 class="fw-bold text-dark">{{ book.tenSach }}</h2>
                
                <div class="mt-3 text-secondary">
                    <p class="mb-1"><strong>Tác giả:</strong> {{ book.tacGia }}</p>
                    <p class="mb-1"><strong>Nhà xuất bản:</strong> {{ book.nhaXuatBan }}</p>
                    <p class="mb-1"><strong>Tình trạng:</strong> 
                        <span v-if="book.soLuongTon > 0" class="text-success fw-bold">Còn hàng ({{ book.soLuongTon }})</span>
                        <span v-else class="text-danger fw-bold">Hết hàng</span>
                    </p>
                </div>

                <div class="my-4">
                    <h3 class="text-danger fw-bold">{{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.gia) }}</h3>
                </div>

                <div v-if="book.moTa" class="description mb-4 p-3 bg-light rounded shadow-sm">
                    <h6 class="fw-bold text-primary mb-2"><i class="fas fa-info-circle me-2"></i>Giới thiệu nội dung:</h6>
                    <p class="mb-0 text-muted" style="white-space: pre-line;">{{ book.moTa }}</p>
                </div>



                <div class="d-flex align-items-center gap-3">
                    <!-- Nếu là Admin hoặc Nhân viên: hiển thị nút cập nhật sách -->
                    <div v-if="userRole === 'admin' || userRole === 'nhanvien'" class="w-100">
                        <router-link :to="`/sach/${book.id}/edit`" class="btn btn-primary btn-lg w-100">
                            <i class="fas fa-edit me-2"></i> Cập nhật thông tin sách
                        </router-link>
                    </div>

                    <!-- Nếu là độc giả: hiển thị nút mượn sách -->
                    <template v-else>
                        <div class="input-group" style="width: 140px;">
                            <button class="btn btn-outline-secondary" @click="decreaseQty">-</button>
                            <input type="text" class="form-control text-center bg-white" :value="quantity" readonly>
                            <button class="btn btn-outline-secondary" @click="increaseQty">+</button>
                        </div>
                        <button class="btn btn-primary btn-lg flex-grow-1" @click="addToCart" :disabled="book.soLuongTon <= 0">
                            <i class="fas fa-cart-plus me-2"></i> 
                            {{ book.soLuongTon > 0 ? 'Thêm vào giỏ mượn' : 'Tạm hết hàng' }}
                        </button>
                    </template>
                </div>
                
                <!-- Thông báo cho khách chưa đăng nhập -->
                <div v-if="!userRole" class="mt-4 p-3 guest-notice d-flex align-items-center gap-3">
                    <div class="notice-icon">
                        <i class="fas fa-user-lock"></i>
                    </div>
                    <div>
                        <p class="mb-0 fw-bold">Bạn đang xem sách với tư cách khách</p>
                        <small class="text-muted">Vui lòng <router-link to="/dangnhap" class="text-primary fw-600">đăng nhập</router-link> để thực hiện mượn sách về nhà.</small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* ===== CARD BỌC NGOÀI ===== */
.row.bg-white {
    border-radius: 24px !important;
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.08) !important;
    border: 1px solid #f1f5f9;
}

/* ===== ĐIỀU HƯỚNG (BREADCRUMB) ===== */
.breadcrumb {
    margin-bottom: 0;
}
.breadcrumb-item a {
    color: #64748b;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
}
.breadcrumb-item a:hover {
    color: #4f46e5;
}
.breadcrumb-item.active {
    color: #1e293b;
    font-weight: 600;
}
.breadcrumb-item + .breadcrumb-item::before {
    color: #cbd5e1;
}

/* ===== ẢNH BÌA SÁCH ===== */
.book-image-wrapper {
    border-radius: 20px !important;
    border: 1px solid #e2e8f0 !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05) !important;
    background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%);
    height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    padding: 1rem;
}

img.book-cover {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    filter: drop-shadow(0 15px 30px rgba(0,0,0,0.12));
    /* image-rendering auto giúp ảnh chất lượng cao trông mượt mà */
    image-rendering: auto;
}

.book-image-wrapper:hover img.book-cover {
    transform: scale(1.06) translateY(-10px);
    filter: drop-shadow(0 25px 45px rgba(0,0,0,0.18));
}

/* ===== BADGE VÀ TIÊU ĐỀ ===== */
.badge.bg-warning {
    background-color: #fef3c7 !important;
    color: #d97706 !important;
    padding: 6px 12px;
    border-radius: 8px;
    font-weight: 600;
    letter-spacing: 0.5px;
}
h2.text-dark {
    color: #0f172a !important;
    letter-spacing: -0.5px;
    margin-top: 10px;
}

/* ===== CHI TIẾT SÁCH (THÔNG SỐ) ===== */
.text-secondary {
    color: #475569 !important;
    font-size: 1.05rem;
}
.text-success { color: #10b981 !important; }
.text-danger { color: #ef4444 !important; }
h3.text-danger {
    font-size: 2.2rem;
    letter-spacing: -1px;
}

/* ===== MÔ TẢ NỘI DUNG ===== */
.description.bg-light {
    background-color: #f8fafc !important;
    border-left: 4px solid #4f46e5;
    border-radius: 0 12px 12px 0 !important;
}
.description h6 {
    color: #1e293b;
    font-size: 1.1rem;
    letter-spacing: 0.2px;
}
.description p.text-muted {
    color: #64748b !important;
    line-height: 1.7;
    font-size: 0.95rem;
}

/* ===== CHỌN SỐ LƯỢNG ===== */
.input-group {
    background-color: #f1f5f9;
    border-radius: 12px;
    padding: 4px;
    border: 1px solid #e2e8f0;
}
.btn-outline-secondary {
    border: none !important;
    background: white;
    color: #4f46e5;
    font-weight: bold;
    border-radius: 8px !important;
    width: 36px;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}
.btn-outline-secondary:hover {
    background: #e0e7ff;
    transform: scale(1.05);
}
.btn-outline-secondary:active {
    transform: scale(0.95);
}
.input-group .form-control {
    border: none;
    background: transparent !important;
    font-weight: 700;
    color: #1e293b;
    font-size: 1.1rem;
}

/* ===== NÚT THÊM VÀO GIỎ MƯỢN ===== */
.btn-primary {
    background-color: #4f46e5 !important;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    padding: 12px 24px;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
}
.btn-primary:hover:not(:disabled) {
    background-color: #4338ca !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(79, 70, 229, 0.4);
}
.btn-primary:disabled {
    background-color: #cbd5e1 !important;
    color: #f8fafc !important;
    box-shadow: none;
    cursor: not-allowed;
}

.guest-notice {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    border-left: 4px solid #6366f1;
}
.notice-icon {
    width: 45px;
    height: 45px;
    background: #e0e7ff;
    color: #6366f1;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}
.fw-600 { font-weight: 600; }
</style>