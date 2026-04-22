<template>
  <div class="container mt-5 mb-5 max-w-custom">
    <div class="d-flex align-items-center gap-3 mb-4">
        <div class="icon-wrapper bg-indigo-soft text-indigo rounded-circle d-flex align-items-center justify-content-center">
            <i class="fas fa-book-reader fs-4"></i>
        </div>
        <h2 class="page-title mb-0">Xác nhận mượn sách</h2>
    </div>

    <div v-if="cartItems.length > 0">
      <!-- Cảnh báo nợ/quá hạn -->
      <div v-if="hasDebt" class="alert alert-danger shadow-sm border-0 rounded-lg p-4 mb-4 d-flex align-items-start gap-3">
          <i class="fas fa-exclamation-circle fs-3 mt-1"></i>
          <div>
              <h5 class="fw-bold mb-1">Chặn mượn sách: Bạn có khoản nợ chưa thanh toán</h5>
              <p class="mb-2">Hệ thống ghi nhận bạn đang có sách quá hạn hoặc phí mượn/phí phạt chưa được thanh toán hoàn tất.</p>
              <router-link to="/lich-su" class="btn btn-sm btn-danger fw-bold rounded-pill px-3">
                  Xem lịch sử & phí nợ <i class="fas fa-arrow-right ms-1"></i>
              </router-link>
          </div>
      </div>

      <div class="custom-table-container mb-4">
        <table class="table custom-table align-middle mb-0 bg-white">
          <thead>
            <tr>
              <th class="ps-4">Mã Sách</th>
              <th>Tên Sách</th>
              <th class="text-center" style="width: 160px;">Số lượng</th>
              <th class="text-center" style="width: 100px;">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in cartItems" :key="index">
              <td class="ps-4">
                <span class="custom-badge">#{{ item.MaSach }}</span>
              </td>
              
              <td>
                <span class="fw-bold text-dark fs-6">{{ item.TenSach }}</span>
              </td>
              
              <td>
                <div class="d-flex justify-content-center align-items-center">
                  <div class="qty-wrapper">
                    <button class="btn-qty" type="button" @click="decreaseQty(index)">
                      <i class="fas fa-minus"></i>
                    </button>
                    
                    <input 
                      type="text" 
                      class="qty-input" 
                      :value="item.SoLuong || 1" 
                      readonly
                    >
                    
                    <button class="btn-qty" type="button" @click="increaseQty(index)">
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </td>

              <td class="text-center">
                <button class="btn-delete" @click="removeItem(index)" title="Xóa khỏi giỏ">
                   <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="user-info-card">
        <div class="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
            <i class="fas fa-id-card text-indigo fs-5"></i>
            <h5 class="mb-0 fw-bold text-dark">Thông tin người mượn</h5>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-6 mb-3 mb-md-0">
                <p class="text-muted mb-1 small text-uppercase fw-bold">Mã Độc Giả</p>
                <p class="fs-5 fw-500 text-dark mb-0">{{ currentUser.maDocGia }}</p>
            </div>
            <div class="col-md-6">
                <p class="text-muted mb-1 small text-uppercase fw-bold">Họ Tên Đầy Đủ</p>
                <p class="fs-5 fw-500 text-dark mb-0">{{ currentUser.hoLot }} {{ currentUser.tenDocGia }}</p>
            </div>
        </div>
        
        <div class="d-flex justify-content-end mt-2 pt-3 border-top">
            <button 
              class="btn-submit" 
              @click="submitRequest"
              :disabled="hasDebt || isCheckingDebt"
              :class="{ 'btn-disabled': hasDebt }"
            >
                <i v-if="isCheckingDebt" class="spinner-border spinner-border-sm me-2"></i>
                <i v-else class="bi bi-send-check me-2 fs-5"></i> 
                {{ hasDebt ? 'Không thể mượn do còn nợ phí' : 'Gửi Yêu Cầu Mượn Sách' }}
            </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state-container">
        <div class="empty-icon-wrapper mb-4">
            <i class="fas fa-shopping-basket"></i>
        </div>
        <h4 class="fw-bold text-dark mb-2">Giỏ hàng của bạn đang trống</h4>
        <p class="text-muted mb-4">Hãy quay lại kho sách để tìm những cuốn sách thú vị nhé!</p>
        <router-link to="/sach" class="btn-primary-custom">
            <i class="fas fa-arrow-left me-2"></i> Tiếp tục chọn sách
        </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios"; 
import { useRouter } from "vue-router";

// --- CẤU HÌNH ---
const MAX_BOOKS_ALLOWED = 3; // Giới hạn số sách tối đa
const API_URL = "http://localhost:3000/api/yeucaumuonsach";

// --- STATE ---
const cartItems = ref([]);
const currentUser = ref({});
const router = useRouter();
const hasDebt = ref(false);
const isCheckingDebt = ref(false);

// --- COMPUTED (Tính toán tự động) ---
// Tính tổng số lượng sách đang có trong giỏ
const totalQuantity = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (Number(item.SoLuong) || 1), 0);
});

// --- HELPER FUNCTIONS ---
const updateCartStorage = () => {
  localStorage.setItem("cart", JSON.stringify(cartItems.value));
};

const checkUserDebt = async (maDocGia) => {
    try {
        isCheckingDebt.value = true;
        const response = await axios.get(`http://localhost:3000/api/yeucaumuonsach/check-debt/${maDocGia}`);
        hasDebt.value = response.data.hasDebt;
    } catch (error) {
        console.error("Lỗi kiểm tra nợ:", error);
    } finally {
        isCheckingDebt.value = false;
    }
};

// --- LIFECYCLE ---
onMounted(() => {
  // 1. Lấy sách
  const storedCart = localStorage.getItem("cart");
  if (storedCart) {
    cartItems.value = JSON.parse(storedCart);
  }

  // 2. Lấy User
  const storedUser = localStorage.getItem("user"); 
  if (storedUser) {
    currentUser.value = JSON.parse(storedUser);
    // 3. Kiểm tra nợ ngay khi load cart
    checkUserDebt(currentUser.value.maDocGia);
  } else {
    alert("Vui lòng đăng nhập để mượn sách!");
    router.push("/dangnhap");
  }
});

// --- ACTIONS (Tăng/Giảm/Xóa) ---
const increaseQty = (index) => {
  // Đảm bảo số lượng là số
  if (!cartItems.value[index].SoLuong) {
    cartItems.value[index].SoLuong = 1;
  }
  
  // Kiểm tra nóng: Nếu tăng lên mà vượt quá 3 thì chặn luôn (UX tốt hơn)
  if (totalQuantity.value >= MAX_BOOKS_ALLOWED) {
    alert(`Bạn chỉ được mượn tối đa ${MAX_BOOKS_ALLOWED} quyển sách!`);
    return;
  }

  cartItems.value[index].SoLuong++;
  updateCartStorage();
};

const decreaseQty = (index) => {
  if (cartItems.value[index].SoLuong > 1) {
    cartItems.value[index].SoLuong--;
  } else {
    if(confirm('Bạn muốn xóa sách này khỏi giỏ?')) {
        removeItem(index);
        return; // Đã xóa xong thì return luôn
    }
  }
  updateCartStorage();
};

const removeItem = (index) => {
  cartItems.value.splice(index, 1);
  updateCartStorage();
};

// --- SUBMIT (Gửi yêu cầu) ---
const submitRequest = async () => {
  // 1. Validate Giỏ hàng trống
  if (cartItems.value.length === 0) {
    alert("Giỏ hàng đang trống!");
    return;
  }

  // 2. Validate Tổng số lượng (Chốt chặn quan trọng nhất)
  if (totalQuantity.value > MAX_BOOKS_ALLOWED) {
    alert(`LỖI: Tổng số lượng sách là ${totalQuantity.value}. Bạn chỉ được mượn tối đa ${MAX_BOOKS_ALLOWED} quyển.`);
    return; // Dừng ngay lập tức
  }

  try {
    // 3. Chuẩn bị Payload (Thêm SoLuong vào để Backend lưu đúng)
    const payload = {
      // Luôn gửi mã độc giả định dạng chuỗi (DG001, DG002...) để backend quản lý dễ dàng
      MaDocGia: currentUser.value.maDocGia, 
      DanhSachSach: cartItems.value.map(book => ({
        MaSach: book.MaSach,
        TenSach: book.TenSach,
        DonGia: Number(book.DonGia || 0),
        SoLuong: Number(book.SoLuong || 1)
      })),
      NgayHenTra: new Date(new Date().setDate(new Date().getDate() + 7)), // Mặc định +7 ngày
      TrangThai: "DangCho"
    };

    // 4. Gọi API
    await axios.post(API_URL, payload);
    
    alert("Gửi yêu cầu thành công!");
    
    // 5. Dọn dẹp sau khi thành công
    localStorage.removeItem("cart");
    cartItems.value = [];
    router.push("/"); 

  } catch (error) {
    console.error(error);
    const msg = error.response?.data?.message || "Lỗi khi gửi yêu cầu!";
    alert(msg);
  }
};
</script>

<style scoped>
/* ===== BIẾN & THIẾT LẬP CHUNG ===== */
.max-w-custom {
    max-width: 900px; /* Giới hạn chiều rộng giỏ hàng cho đẹp */
    margin: 0 auto;
}

.page-title {
    font-weight: 800;
    color: #1e293b;
    letter-spacing: -0.5px;
}

.icon-wrapper {
    width: 48px;
    height: 48px;
    background-color: #e0e7ff;
    color: #4f46e5;
}

.text-indigo { color: #4f46e5 !important; }
.bg-indigo-soft { background-color: #e0e7ff !important; }
.fw-500 { font-weight: 500; }

/* ===== BẢNG GIỎ HÀNG (TABLE) ===== */
.custom-table-container {
    border-radius: 16px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    border: 1px solid #f1f5f9;
    overflow: hidden;
}

.custom-table {
    border-collapse: separate;
    border-spacing: 0;
}

.custom-table thead th {
    background-color: #f8fafc;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 0.5px;
    padding: 16px;
    border-bottom: 2px solid #e2e8f0;
}

.custom-table tbody td {
    padding: 20px 16px;
    vertical-align: middle;
    border-bottom: 1px solid #f1f5f9;
}

.custom-table tbody tr {
    transition: background-color 0.2s ease;
}
.custom-table tbody tr:hover td {
    background-color: #fcfcfd;
}

/* Badge Mã sách */
.custom-badge {
    background-color: #f1f5f9;
    color: #64748b;
    padding: 6px 12px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.85rem;
    border: 1px solid #e2e8f0;
}

/* ===== Ô NHẬP SỐ LƯỢNG (QUANTITY SELECTOR) ===== */
.qty-wrapper {
    background-color: #f8fafc;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    display: inline-flex;
    align-items: center;
    overflow: hidden;
    padding: 4px;
}

.btn-qty {
    background: transparent;
    border: none;
    color: #4f46e5;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}
.btn-qty:hover {
    background-color: #e0e7ff;
}
.btn-qty:active {
    transform: scale(0.9);
}

.qty-input {
    border: none;
    background: transparent;
    width: 40px;
    text-align: center;
    font-weight: 700;
    color: #1e293b;
    font-size: 1rem;
    padding: 0;
    outline: none;
}

/* ===== NÚT XÓA ===== */
.btn-delete {
    background-color: #fee2e2;
    color: #ef4444;
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    transition: all 0.2s ease;
}
.btn-delete:hover {
    background-color: #fecaca;
    transform: scale(1.1) rotate(5deg);
}

/* ===== THẺ THÔNG TIN USER ===== */
.user-info-card {
    background: linear-gradient(145deg, #ffffff, #f8fafc);
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 30px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
}

/* ===== NÚT GỬI YÊU CẦU ===== */
.btn-submit {
    background-color: #4f46e5;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 14px 32px;
    font-weight: 600;
    font-size: 1.05rem;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
}
.btn-submit:hover {
    background-color: #4338ca;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(79, 70, 229, 0.4);
}
.btn-submit:active {
    transform: translateY(0);
}

.btn-submit.btn-disabled {
    background-color: #94a3b8 !important;
    box-shadow: none !important;
    cursor: not-allowed;
    opacity: 0.7;
}

.rounded-lg {
    border-radius: 1rem !important;
}

/* ===== GIỎ HÀNG TRỐNG (EMPTY STATE) ===== */
.empty-state-container {
    text-align: center;
    padding: 60px 20px;
    background-color: #fff;
    border-radius: 16px;
    border: 1px dashed #cbd5e1;
}

.empty-icon-wrapper {
    width: 100px;
    height: 100px;
    background-color: #f1f5f9;
    color: #94a3b8;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    margin: 0 auto;
}

.btn-primary-custom {
    display: inline-block;
    background-color: #4f46e5;
    color: white;
    padding: 12px 28px;
    border-radius: 12px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
}
.btn-primary-custom:hover {
    background-color: #4338ca;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
}
</style>