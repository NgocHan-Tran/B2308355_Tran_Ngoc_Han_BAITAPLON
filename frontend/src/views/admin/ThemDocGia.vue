<template>
  <div class="container mt-4 pb-5">
    <div class="card shadow-sm border-0 rounded-lg overflow-hidden">
      <div class="card-header bg-indigo text-white py-3">
        <div class="d-flex align-items-center">
          <router-link to="/admin/docgia" class="btn btn-sm btn-light-soft me-3">
            <i class="fas fa-arrow-left"></i>
          </router-link>
          <h5 class="mb-0 fw-bold">Thêm Độc Giả Mới</h5>
        </div>
      </div>

      <div class="card-body p-4">
        <form @submit.prevent="handleCreate">
          <div class="row mb-4">
            <div class="col-md-6">
              <label for="hoLot" class="form-label fw-bold">Họ Lót <span class="text-danger">*</span></label>
              <input 
                type="text" 
                class="form-control form-control-lg" 
                id="hoLot" 
                v-model="reader.hoLot" 
                placeholder="Nhập họ lót" 
                required
              >
            </div>
            <div class="col-md-6">
              <label for="tenDocGia" class="form-label fw-bold">Tên Độc Giả <span class="text-danger">*</span></label>
              <input 
                type="text" 
                class="form-control form-control-lg" 
                id="tenDocGia" 
                v-model="reader.tenDocGia" 
                placeholder="Nhập tên" 
                required
              >
            </div>
          </div>

          <div class="row mb-4">
            <div class="col-md-6">
              <label for="email" class="form-label fw-bold">Email <span class="text-danger">*</span></label>
              <input 
                type="email" 
                class="form-control form-control-lg" 
                id="email" 
                v-model="reader.email" 
                placeholder="email@example.com" 
                required
              >
            </div>
            <div class="col-md-6">
              <label for="password" class="form-label fw-bold">Mật khẩu <span class="text-danger">*</span></label>
              <input 
                type="password" 
                class="form-control form-control-lg" 
                id="password" 
                v-model="reader.password" 
                placeholder="********" 
                required
              >
            </div>
          </div>

          <div class="row mb-4">
            <div class="col-md-6">
              <label for="dienThoai" class="form-label fw-bold">Số điện thoại</label>
              <input 
                type="tel" 
                class="form-control form-control-lg" 
                id="dienThoai" 
                v-model="reader.dienThoai" 
                placeholder="09xxxxxxxxx"
              >
            </div>
            <div class="col-md-6">
              <label for="ngaySinh" class="form-label fw-bold">Ngày sinh <span class="text-danger">*</span></label>
              <input 
                type="date" 
                class="form-control form-control-lg" 
                id="ngaySinh" 
                v-model="reader.ngaySinh" 
                required
              >
            </div>
          </div>

          <div class="mb-4">
            <label for="diaChi" class="form-label fw-bold">Địa chỉ</label>
            <textarea 
              v-model="reader.diaChi" 
              id="diaChi" 
              rows="3" 
              class="form-control" 
              placeholder="Nhập địa chỉ cư trú..."
            ></textarea>
          </div>

          <div class="d-flex justify-content-end gap-3 border-top pt-4 mt-4">
            <router-link to="/admin/docgia" class="btn btn-outline-secondary px-4 py-2">
              Hủy bỏ
            </router-link>
            <button type="submit" class="btn btn-indigo px-5 py-2 fw-bold" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                Thêm Mới
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import DocGiaService from "@/services/docgia.service";

const router = useRouter();
const isSubmitting = ref(false);

const reader = ref({
  hoLot: '',
  tenDocGia: '',
  email: '',
  password: '',
  dienThoai: '',
  diaChi: '',
  ngaySinh: ''
});

const handleCreate = async () => {
  isSubmitting.value = true;
  try {
    const result = await DocGiaService.create(reader.value);
    alert(`Thêm độc giả thành công! Mã ĐG: ${result.maDocGia}`);
    router.push('/admin/docgia');
  } catch (error) {
    console.error(error);
    alert('Thêm mới thất bại: ' + (error.response?.data?.message || 'Lỗi hệ thống'));
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.rounded-lg { border-radius: 1rem; }
.bg-indigo { background-color: #4f46e5; }
.btn-indigo { 
    background-color: #4f46e5; 
    color: white;
    transition: all 0.2s;
}
.btn-indigo:hover {
    background-color: #4338ca;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.4);
}
.btn-light-soft {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
    border: none;
}
.btn-light-soft:hover {
    background-color: rgba(255, 255, 255, 0.3);
    color: white;
}
.form-control:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 0.25rem rgba(79, 70, 229, 0.1);
}
</style>
