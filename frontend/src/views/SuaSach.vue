<template>
  <div class="container mt-4 pb-5">
    <div class="card shadow-sm border-0 rounded-lg overflow-hidden">
      
      <div class="card-header bg-primary text-white py-3">
        <div class="d-flex align-items-center">
          <router-link :to="`/sach/${id}`" class="btn btn-sm btn-light me-3">
            <i class="fas fa-arrow-left"></i>
          </router-link>
          <h5 class="mb-0 fw-bold">Cập Nhật Thông Tin Sách</h5>
        </div>
      </div>

      <div class="card-body p-4">
        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 text-muted">Đang tải dữ liệu sách...</p>
        </div>

        <form v-else @submit.prevent="updateBook" enctype="multipart/form-data">
          
          <div class="row mb-4">
            <div class="col-md-4">
              <label for="maSach" class="form-label fw-bold">Mã Sách <span class="text-danger">*</span></label>
              <input 
                type="text" 
                class="form-control form-control-lg bg-light" 
                id="maSach" 
                v-model="book.MaSach" 
                readonly
                disabled
              >
              <small class="text-muted">Mã sách không thể thay đổi</small>
            </div>
            <div class="col-md-8">
              <label for="tenSach" class="form-label fw-bold">Tên Sách <span class="text-danger">*</span></label>
              <input 
                type="text" 
                class="form-control form-control-lg" 
                id="tenSach" 
                v-model="book.TenSach" 
                placeholder="Nhập tên sách" 
                required
              >
            </div>
          </div>

          <div class="row mb-4">
            <div class="col-md-4">
              <label for="donGia" class="form-label fw-bold">Đơn Giá</label>
              <div class="input-group input-group-lg">
                <input 
                  type="number" 
                  class="form-control" 
                  id="donGia" 
                  v-model="book.DonGia" 
                  min="0"
                >
                <span class="input-group-text">VNĐ</span>
              </div>
            </div>
            <div class="col-md-4">
              <label for="soQuyen" class="form-label fw-bold">Số Quyển</label>
              <input 
                type="number" 
                class="form-control form-control-lg" 
                id="soQuyen" 
                v-model="book.SoQuyen" 
                min="0"
              >
            </div>
            <div class="col-md-4">
              <label for="namXB" class="form-label fw-bold">Năm Xuất Bản</label>
              <input 
                type="number" 
                class="form-control form-control-lg" 
                id="namXB" 
                v-model="book.NamXuatBan" 
                placeholder="2025"
              >
            </div>
          </div>

          <div class="row mb-4">
            <div class="col-md-6">
              <label for="maNXB" class="form-label fw-bold">Nhà Xuất Bản</label>
              <select class="form-select form-select-lg" id="maNXB" v-model="book.MaNXB">
                <option value="" disabled>-- Chọn Nhà Xuất Bản --</option>
                <option 
                  v-for="nxb in publishers" 
                  :key="nxb._id" 
                  :value="nxb._id" 
                >
                  {{ nxb.tenNXB }} 
                </option>
              </select>
            </div>
            <div class="col-md-6">
              <label for="tacGia" class="form-label fw-bold">Tác Giả</label>
              <input 
                type="text" 
                class="form-control form-control-lg" 
                id="tacGia" 
                v-model="book.TacGia"
                placeholder="Nhập tên tác giả"
              >
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label fw-bold">Ảnh bìa hiện tại</label>
            <div class="mb-3">
                <img 
                    v-if="currentImage" 
                    :src="currentImage" 
                    alt="Current cover" 
                    class="img-thumbnail" 
                    style="max-height: 150px;"
                >
                <p v-else class="text-muted italic">Chưa có ảnh bìa</p>
            </div>
            
            <label for="hinhAnh" class="form-label fw-bold font-sm">Thay đổi ảnh bìa mới</label>
            <input 
              type="file" 
              class="form-control" 
              id="hinhAnh" 
              ref="fileInput"
              @change="handleFileUpload"
              accept="image/*"
            >
          </div>

          <div class="mb-4">
            <label for="moTa" class="form-label fw-bold">Mô tả sách</label>
            <textarea 
              v-model="book.MoTa" 
              id="moTa" 
              rows="4" 
              class="form-control" 
              placeholder="Nhập giới thiệu tóm tắt về sách..."
            ></textarea>
          </div>

          <div class="d-flex justify-content-end gap-3 border-top pt-4 mt-4">
            <router-link :to="`/sach/${id}`" class="btn btn-outline-secondary px-4 py-2">
              Hủy bỏ
            </router-link>
            <button type="submit" class="btn btn-primary px-5 py-2 fw-bold" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                Lưu Thay Đổi
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import SachService from "@/services/sach.service";
import NhaXuatBanService from "@/services/nhaxuatban.service";
import axios from 'axios';

const props = defineProps({
    id: { type: String, required: true }
});

const router = useRouter();

const book = ref({
  MaSach: '',
  TenSach: '',
  DonGia: 0,
  SoQuyen: 0,
  NamXuatBan: new Date().getFullYear(),
  MaNXB: '',
  TacGia: '',
  MoTa: ''
});

const publishers = ref([]);
const selectedFile = ref(null);
const fileInput = ref(null);
const isLoading = ref(true);
const isSubmitting = ref(false);
const currentImage = ref(null);

const fetchData = async () => {
    try {
        isLoading.value = true;
        // 1. Lấy danh sách NXB
        publishers.value = await NhaXuatBanService.getAll();
        
        // 2. Lấy thông tin sách hiện tại
        const data = await SachService.get(props.id);
        book.value = {
            MaSach: data.MaSach,
            TenSach: data.TenSach,
            DonGia: data.DonGia || 0,
            SoQuyen: data.SoQuyen || 0,
            NamXuatBan: data.NamXuatBan,
            MaNXB: data.MaNXB,
            TacGia: data.TacGia,
            MoTa: data.MoTa || ''
        };
        
        // Xử lý hiển thị ảnh hiện tại
        if (data.HinhAnh) {
            currentImage.value = data.HinhAnh.startsWith('http') 
                ? data.HinhAnh 
                : `http://localhost:3000${data.HinhAnh}`;
        }
    } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
        alert("Không thể tải thông tin sách!");
        router.push('/sach');
    } finally {
        isLoading.value = false;
    }
};

const handleFileUpload = (event) => {
  selectedFile.value = event.target.files[0];
};

const updateBook = async () => {
  if (!book.value.TenSach) {
    alert("Vui lòng nhập Tên Sách!");
    return;
  }

  isSubmitting.value = true;
  const formData = new FormData();
  formData.append('TenSach', book.value.TenSach);
  formData.append('DonGia', book.value.DonGia);
  formData.append('SoQuyen', book.value.SoQuyen);
  formData.append('NamXuatBan', book.value.NamXuatBan);
  formData.append('MaNXB', book.value.MaNXB);
  formData.append('TacGia', book.value.TacGia);
  formData.append('MoTa', book.value.MoTa);

  if (selectedFile.value) {
    formData.append('HinhAnh', selectedFile.value);
  }

  try {
    // Gọi PUT API để cập nhật
    await axios.put(`http://localhost:3000/api/sach/${props.id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    alert('Cập nhật sách thành công!');
    router.push(`/sach/${props.id}`);
  } catch (error) {
    console.error(error);
    alert('Cập nhật thất bại: ' + (error.response?.data?.message || 'Lỗi hệ thống'));
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.rounded-lg { border-radius: 1rem; }
.card {
    transition: transform 0.3s ease;
}
.form-control:focus, .form-select:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 0.25rem rgba(79, 70, 229, 0.25);
}
.btn-primary:hover {
    background-color: #4338ca;
    transform: translateY(-2px);
}
.italic { font-style: italic; }
.font-sm { font-size: 0.85rem; }
</style>
