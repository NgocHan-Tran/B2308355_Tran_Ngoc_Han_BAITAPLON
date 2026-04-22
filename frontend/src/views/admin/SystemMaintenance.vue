<template>
  <div class="container mt-4 pb-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="text-primary page-title">🛠️ Bảo Trì Hệ Thống</h2>
    </div>

    <div class="row g-4">
      <!-- Card 1: Recalculate Fines -->
      <div class="col-md-6 col-lg-4">
        <div class="card h-100 border-0 shadow-sm custom-card">
          <div class="card-body p-4 text-center">
            <div class="icon-wrapper mb-3 bg-danger-soft text-danger">
              <i class="fas fa-calculator fs-2"></i>
            </div>
            <h5 class="fw-bold mb-3">Tính Toán Lại Tiền Phạt</h5>
            <p class="text-muted small mb-4">
              Duyệt qua tất cả các yêu cầu mượn đã quá hạn để tính toán chính xác số tiền phạt dựa trên ngày hiện tại.
            </p>
            <button 
              @click="handleAction('recalculate-fines')" 
              class="btn btn-action w-100"
              :disabled="loadingStates['recalculate-fines']"
            >
              <span v-if="loadingStates['recalculate-fines']" class="spinner-border spinner-border-sm me-2"></span>
              Bắt đầu tính toán
            </button>
          </div>
        </div>
      </div>

      <!-- Card 2: Sync Prices -->
      <div class="col-md-6 col-lg-4">
        <div class="card h-100 border-0 shadow-sm custom-card">
          <div class="card-body p-4 text-center">
            <div class="icon-wrapper mb-3 bg-primary-soft text-primary">
              <i class="fas fa-sync-alt fs-2"></i>
            </div>
            <h5 class="fw-bold mb-3">Đồng Bộ Giá Sách</h5>
            <p class="text-muted small mb-4">
              Cập nhật giá sách trong các yêu cầu mượn dựa trên danh mục sách hiện tại (dùng khi bạn cập nhật giá hàng loạt).
            </p>
            <button 
              @click="handleAction('sync-prices')" 
              class="btn btn-action w-100 btn-primary-custom"
              :disabled="loadingStates['sync-prices']"
            >
              <span v-if="loadingStates['sync-prices']" class="spinner-border spinner-border-sm me-2"></span>
              Đồng bộ ngay
            </button>
          </div>
        </div>
      </div>

      <!-- Card 3: Sync Payment Status -->
      <div class="col-md-6 col-lg-4">
        <div class="card h-100 border-0 shadow-sm custom-card">
          <div class="card-body p-4 text-center">
            <div class="icon-wrapper mb-3 bg-success-soft text-success">
              <i class="fas fa-file-invoice-dollar fs-2"></i>
            </div>
            <h5 class="fw-bold mb-3">Đồng Bộ Trạng Thái Thanh Toán</h5>
            <p class="text-muted small mb-4">
              Đảm bảo các trạng thái thanh toán (Chưa thanh toán/Không phạt) khớp chính xác với tổng số tiền.
            </p>
            <button 
              @click="handleAction('sync-payment-status')" 
              class="btn btn-action w-100 btn-success-custom"
              :disabled="loadingStates['sync-payment-status']"
            >
              <span v-if="loadingStates['sync-payment-status']" class="spinner-border spinner-border-sm me-2"></span>
              Cập nhật trạng thái
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Result Area -->
    <div v-if="lastResult" class="mt-5 animate__animated animate__fadeInUp">
      <div class="card border-0 shadow-heavy result-card" :class="lastResult.success ? 'border-success-left' : 'border-danger-left'">
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h5 class="fw-bold d-flex align-items-center">
              <i class="fas fa-check-circle text-success me-2" v-if="lastResult.success"></i>
              <i class="fas fa-exclamation-triangle text-danger me-2" v-else></i>
              Kết quả thực hiện gần nhất
            </h5>
            <button @click="lastResult = null" class="btn-close"></button>
          </div>
          
          <div class="alert bg-light border-0 mb-0">
            <p class="mb-2 fw-bold text-indigo">{{ lastResult.message }}</p>
            <div class="row g-2 text-dark">
              <div class="col-6 col-md-3">
                <span class="text-muted d-block small">Tổng số bản ghi:</span>
                <span class="fs-5 fw-bold">{{ lastResult.totalProcessed || 0 }}</span>
              </div>
              <div class="col-6 col-md-3">
                <span class="text-muted d-block small text-success">Đã cập nhật:</span>
                <span class="fs-5 fw-bold text-success">{{ lastResult.updated || 0 }}</span>
              </div>
              <div class="col-12 col-md-6 text-md-end align-self-end mt-2 mt-md-0">
                <span class="text-muted small italic">Hoàn thành lúc: {{ lastResult.timestamp }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import axios from 'axios';

const loadingStates = reactive({
  'recalculate-fines': false,
  'sync-prices': false,
  'sync-payment-status': false
});

const lastResult = ref(null);

const handleAction = async (action) => {
  loadingStates[action] = true;
  lastResult.value = null;

  try {
    const response = await axios.post(`http://localhost:3000/api/system-admin/${action}`);
    lastResult.value = {
      success: true,
      message: response.data.message,
      totalProcessed: response.data.totalProcessed,
      updated: response.data.updated,
      timestamp: new Date().toLocaleTimeString('vi-VN')
    };
  } catch (error) {
    console.error(`Lỗi khi thực hiện ${action}:`, error);
    lastResult.value = {
      success: false,
      message: error.response?.data?.message || "Đã xảy ra lỗi không xác định.",
      timestamp: new Date().toLocaleTimeString('vi-VN')
    };
  } finally {
    loadingStates[action] = false;
  }
};
</script>

<style scoped>
.page-title {
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.5px;
}

.custom-card {
  border-radius: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.custom-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
}

.icon-wrapper {
  width: 70px;
  height: 70px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.bg-danger-soft { background-color: #fee2e2; }
.bg-primary-soft { background-color: #e0e7ff; }
.bg-success-soft { background-color: #dcfce7; }

.btn-action {
  background-color: #f1f5f9;
  border: none;
  font-weight: 600;
  padding: 12px 20px;
  border-radius: 14px;
  color: #ef4444;
  transition: all 0.2s;
}
.btn-action:hover { background-color: #fecaca; }

.btn-primary-custom { color: #4f46e5; }
.btn-primary-custom:hover { background-color: #e0e7ff; }

.btn-success-custom { color: #10b981; }
.btn-success-custom:hover { background-color: #dcfce7; }

.result-card {
  border-radius: 20px;
  overflow: hidden;
  background: white;
}

.border-success-left { border-left: 6px solid #10b981 !important; }
.border-danger-left { border-left: 6px solid #ef4444 !important; }

.text-indigo { color: #4f46e5; }
.italic { font-style: italic; }

.shadow-heavy {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate__fadeInUp {
  animation: fadeInUp 0.4s ease-out;
}
</style>
