<template>
  <div class="borrow-request-container">
    <h2>Xác nhận Yêu cầu Mượn Sách</h2>

    <div v-if="cart.length > 0" class="book-list-section">
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>STT</th>
            <th>Mã Sách</th>
            <th>Tên Sách</th>
            <th>Số lượng</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(book, index) in cart" :key="book.MaSach || index">
            <td>{{ index + 1 }}</td>
            <td>{{ book.MaSach }}</td>
            <td>{{ book.TenSach }}</td>
            <td class="text-center">{{ book.SoLuong || 1 }}</td>
            <td>
              <button @click="removeFromCart(index)" class="btn-danger">Xóa</button>
            </td>
          </tr>
        </tbody>
        <tfoot>
            <tr :class="{'bg-warning': isOverLimit}">
                <td colspan="3" class="text-right"><strong>Tổng số lượng:</strong></td>
                <td class="text-center">
                    <strong>{{ totalQuantity }} / {{ CONFIG.MAX_BOOKS_ALLOWED }}</strong>
                </td>
                <td></td>
            </tr>
        </tfoot>
      </table>
      
      <div v-if="isOverLimit" class="alert alert-danger">
          ⚠️ Bạn đang chọn <strong>{{ totalQuantity }}</strong> cuốn. 
          Chỉ được mượn tối đa <strong>{{ CONFIG.MAX_BOOKS_ALLOWED }}</strong> cuốn mỗi lần. 
          Vui lòng bỏ bớt sách.
      </div>
    </div>

    <div v-else class="empty-cart">
      <p>Giỏ sách đang trống. Vui lòng chọn sách trước.</p>
      <router-link to="/sach">Quay lại danh mục sách</router-link>
    </div>

    <div v-if="cart.length > 0" class="info-section">
      <div class="form-group">
        <label>Ngày yêu cầu:</label>
        <input type="text" :value="formatDate(new Date())" disabled class="input-readonly" />
      </div>

      <div class="form-group">
        <label>Ngày hẹn trả (Dự kiến):</label>
        <input type="date" v-model="ngayHenTra"  disabled class="input-control" />
        <small>Mặc định là {{ CONFIG.DEFAULT_DAYS }} ngày sau ngày mượn.</small>
      </div>

      <div class="form-group">
        <label>Ghi chú cho thủ thư:</label>
        <textarea 
          v-model="ghiChu" rows="3" class="input-control"
          placeholder="Ví dụ: Em sẽ đến lấy sách vào sáng thứ 2..."
        ></textarea>
      </div>

      <div v-if="serverMessage" :class="['alert', isError ? 'alert-danger' : 'alert-success']">
        {{ serverMessage }}
      </div>

      <div class="action-buttons">
        <button 
            @click="submitRequest" 
            :disabled="isLoading || isOverLimit" 
            class="btn-confirm"
            :class="{'btn-disabled': isOverLimit}"
        >
          {{ isLoading ? 'Đang xử lý...' : 'Gửi Yêu Cầu' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

// =========================================
// 1. CONFIGURATION & CONSTANTS
// =========================================
const CONFIG = {
  MAX_BOOKS_ALLOWED: 3,
  DEFAULT_DAYS: 7,
  API_URL: 'http://localhost:3000/api/yeucaumuonsach',
  REDIRECT_DELAY: 2000
};

const router = useRouter();

// =========================================
// 2. STATE MANAGEMENT (Biến dữ liệu)
// =========================================
const cart = ref([]);
const ngayHenTra = ref('');
const ghiChu = ref('');
const isLoading = ref(false);
const serverMessage = ref('');
const isError = ref(false);

// =========================================
// 3. COMPUTED PROPERTIES (Tính toán tự động)
// =========================================
// Tính tổng số lượng sách an toàn (ép kiểu số)
const totalQuantity = computed(() => {
  return cart.value.reduce((total, item) => {
    // Ưu tiên lấy SoLuong, nếu không có thì lấy 1, ép kiểu số nguyên
    const qty = parseInt(item.SoLuong || 1);
    return total + qty;
  }, 0);
});

// Kiểm tra giới hạn
const isOverLimit = computed(() => {
  return totalQuantity.value > CONFIG.MAX_BOOKS;
});

// =========================================
// 4. HELPER FUNCTIONS (Hàm tiện ích nhỏ)
// =========================================

// Lấy ID người dùng từ LocalStorage
const getMaDocGia = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.maDocGia || user.MSNV : null;
  } catch (e) {
    return null;
  }
};

// Format ngày tháng hiển thị giao diện
const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN');

// Tính ngày trả mặc định
const calculateDefaultReturnDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + CONFIG.DEFAULT_DAYS);
  return date.toISOString().split('T')[0];
};

// Cập nhật LocalStorage
const syncCartToStorage = () => {
  localStorage.setItem('cart', JSON.stringify(cart.value));
};

// =========================================
// 5. BUSINESS LOGIC (Nghiệp vụ chính)
// =========================================

// Khởi tạo dữ liệu khi vào trang
const initializePage = () => {
  const storedCart = localStorage.getItem('cart');
  if (storedCart) {
    try {
      cart.value = JSON.parse(storedCart);
    } catch (e) {
      cart.value = [];
    }
  }
  ngayHenTra.value = calculateDefaultReturnDate();
};

// Hàm xóa sách
const removeFromCart = (index) => {
  cart.value.splice(index, 1);
  syncCartToStorage(); // Gọi hàm helper lưu storage

  // Reset lỗi nếu số lượng đã hợp lệ
  if (!isOverLimit.value && isError.value) {
    serverMessage.value = '';
    isError.value = false;
  }
};

// Hàm Validate (Kiểm tra lỗi trước khi gửi)
// Trả về true nếu HỢP LỆ, false nếu có LỖI
const validateForm = (maDocGia) => {
  // 1. Check Login
  if (!maDocGia) {
    showError("Bạn chưa đăng nhập. Vui lòng đăng nhập để mượn sách.");
    return false;
  }

  // 2. Check Giỏ hàng trống
  if (cart.value.length === 0) {
    showError("Giỏ sách trống.");
    return false;
  }

  // 3. Check Số lượng (Quan trọng)
  if (isOverLimit.value) {
    showError(`Bạn chỉ được mượn tối đa ${CONFIG.MAX_BOOKS} quyển sách mỗi lần.`);
    return false;
  }

  return true; // Tất cả ok
};

// Hàm chuẩn bị dữ liệu gửi đi (Payload)
const user = JSON.parse(localStorage.getItem('user'));
const maDocGia = user ? user.maDocGia : null;
const preparePayload = (maDocGia) => {
  return {
    MaDocGia: maDocGia,
    DanhSachSach: cart.value.map(item => ({
      MaSach: item.MaSach,
      TenSach: item.TenSach,
      SoLuong: parseInt(item.SoLuong || 1) // Ép kiểu lần nữa cho chắc
    })),
    NgayHenTra: ngayHenTra.value,
    GhiChu: ghiChu.value,
    TrangThai: "ChoDuyet"
  };
};

// Hàm hiển thị lỗi UI
const showError = (msg) => {
  isError.value = true;
  serverMessage.value = msg;
};

// Hàm hiển thị thành công UI
const showSuccess = (msg) => {
  isError.value = false;
  serverMessage.value = msg;
};
// =========================================
// 6. MAIN CONTROLLER (Hàm điều khiển chính)
// =========================================

const submitRequest = async () => {
  // Reset trạng thái cũ
  serverMessage.value = '';
  isError.value = false;
  


  // BƯỚC 1: Validate
  if (!validateForm(get)) return; // Nếu sai thì dừng luôn

  // BƯỚC 2: Chuẩn bị dữ liệu
  const payload = preparePayload(maDocGia);

  // BƯỚC 3: Gọi API
  isLoading.value = true;
  try {
    // Có thể tách dòng này ra file service riêng nếu muốn
    await axios.post(CONFIG.API_URL, payload);

    // BƯỚC 4: Xử lý thành công
    showSuccess("Gửi yêu cầu thành công! Đang chuyển hướng...");
    localStorage.removeItem('cart');
    cart.value = [];

    // Chuyển trang sau thời gian delay
    setTimeout(() => {
      router.push('/lich-su-muon'); 
    }, CONFIG.REDIRECT_DELAY);

  } catch (error) {
    // BƯỚC 5: Xử lý lỗi từ Server
    console.error(error);
    const msg = error.response?.data?.message || "Có lỗi xảy ra khi gửi yêu cầu.";
    showError(msg);
  } finally {
    isLoading.value = false;
  }
};

// =========================================
// 7. LIFECYCLE HOOKS
// =========================================
onMounted(() => {
  initializePage();
});
</script>

<style scoped>
/* CSS bổ sung */
.text-right { text-align: right; }
.text-center { text-align: center; }
.bg-warning { background-color: #fff3cd; }
.btn-disabled { opacity: 0.6; cursor: not-allowed; background-color: #999; }

/* ... Các CSS cũ giữ nguyên ... */
.borrow-request-container { max-width: 800px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #fff; }
.table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
.table th, .table td { padding: 10px; border: 1px solid #ccc; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; font-weight: bold; margin-bottom: 5px; }
.input-control { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-weight: bold;}
.input-readonly { background-color: #f9f9f9; border: none; font-weight: bold; }
.btn-danger { background-color: #ff4d4f; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px; }
.btn-confirm { background-color: #1890ff; color: white; border: none; padding: 10px 20px; font-size: 16px; cursor: pointer; border-radius: 4px; }
.alert { padding: 10px; margin-bottom: 15px; border-radius: 4px; margin-top: 10px; }
.alert-success { background-color: #d4edda; color: #155724; }
.alert-danger { background-color: #f8d7da; color: #721c24; }
</style>