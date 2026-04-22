<template>
  <div class="container mt-4 pb-5">
    <div class="card shadow-sm border-0 rounded-lg overflow-hidden">
      <div class="card-header bg-warning py-3">
        <div class="d-flex align-items-center">
          <router-link to="/admin/docgia" class="btn btn-sm btn-dark-soft me-3">
            <i class="fas fa-arrow-left"></i>
          </router-link>
          <h5 class="mb-0 fw-bold text-dark">Chỉnh Sửa Thông Tin Độc Giả</h5>
        </div>
      </div>

      <div class="card-body p-4">
        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-warning" role="status"></div>
          <p class="mt-2 text-muted">Đang tải dữ liệu độc giả...</p>
        </div>

        <form v-else @submit.prevent="handleUpdate">
          <div class="row mb-4">
            <div class="col-md-3">
              <label for="maDocGia" class="form-label fw-bold text-muted">Mã Độc Giả</label>
              <input 
                type="text" 
                class="form-control form-control-lg bg-light" 
                id="maDocGia" 
                v-model="reader.maDocGia" 
                readonly
                disabled
              >
            </div>
            <div class="col-md-4">
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
            <div class="col-md-5">
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
                <label for="dienThoai" class="form-label fw-bold">Số điện thoại</label>
                <input 
                  type="tel" 
                  class="form-control form-control-lg" 
                  id="dienThoai" 
                  v-model="reader.dienThoai" 
                  placeholder="09xxxxxxxxx"
                >
            </div>
          </div>

          <div class="row mb-4">
            <div class="col-md-6">
                <label for="ngaySinh" class="form-label fw-bold text-primary">Ngày sinh <span class="text-danger">*</span></label>
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
            <button type="submit" class="btn btn-warning px-5 py-2 fw-bold text-dark" :disabled="isSubmitting">
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
import DocGiaService from "@/services/docgia.service";

const props = defineProps({
    id: { type: String, required: true }
});

const router = useRouter();
const isLoading = ref(true);
const isSubmitting = ref(false);

const reader = ref({
  maDocGia: '',
  hoLot: '',
  tenDocGia: '',
  email: '',
  dienThoai: '',
  diaChi: '',
  ngaySinh: ''
});

const fetchReader = async () => {
    try {
        isLoading.value = true;
        const data = await DocGiaService.get(props.id);
        
        // Format ngày sinh cho input date (YYYY-MM-DD)
        let formattedDate = "";
        if (data.ngaySinh) {
            formattedDate = new Date(data.ngaySinh).toISOString().split('T')[0];
        }

        reader.value = {
            maDocGia: data.maDocGia,
            hoLot: data.hoLot,
            tenDocGia: data.tenDocGia,
            email: data.email,
            dienThoai: data.dienThoai || '',
            diaChi: data.diaChi || '',
            ngaySinh: formattedDate
        };
    } catch (error) {
        console.error(error);
        alert("Không thể tải dữ liệu độc giả!");
        router.push('/admin/docgia');
    } finally {
        isLoading.value = false;
    }
};

const handleUpdate = async () => {
  isSubmitting.value = true;
  try {
    await DocGiaService.update(props.id, reader.value);
    alert('Cập nhật độc giả thành công!');
    router.push('/admin/docgia');
  } catch (error) {
    console.error(error);
    alert('Cập nhật thất bại: ' + (error.response?.data?.message || 'Lỗi hệ thống'));
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
    fetchReader();
});
</script>

<style scoped>
.rounded-lg { border-radius: 1rem; }
.btn-warning {
    background-color: #f59e0b;
    border-color: #f59e0b;
    transition: all 0.2s;
}
.btn-warning:hover {
    background-color: #d97706;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.4);
}
.btn-dark-soft {
    background-color: rgba(0, 0, 0, 0.1);
    color: #1e293b;
    border: none;
}
.btn-dark-soft:hover {
    background-color: rgba(0, 0, 0, 0.2);
}
.form-control:focus {
    border-color: #f59e0b;
    box-shadow: 0 0 0 0.25rem rgba(245, 158, 11, 0.1);
}
</style>
