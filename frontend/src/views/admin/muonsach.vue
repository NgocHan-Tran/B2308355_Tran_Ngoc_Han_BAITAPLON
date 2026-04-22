<template>
  <div class="container-fluid mt-4 px-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="page-title mb-0">📋 Quản Lý Mượn Trả Sách</h2>
    </div>
    
    <div class="card custom-card border-0">
      <div class="card-body p-0">
        <table class="table table-hover align-middle custom-table mb-0">
          <thead class="text-center">
            <tr>
              <th>Ngày Yêu Cầu</th>
              <th class="text-start">Độc Giả</th>
              <th>Số lượng sách</th>
              <th>Trạng Thái</th>
              <th>Tiền mượn</th>
              <th>Phí Trễ Hạn</th>
              <th>Tổng cộng</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in requests" :key="req._id">
              <td class="text-center text-muted fw-500">{{ formatDate(req.NgayYeuCau) }}</td>
              
              <td class="text-start">
                <div v-if="req.MaDocGia" class="d-flex align-items-center gap-2">
                  <div class="avatar-sm bg-indigo-soft text-indigo rounded-circle d-flex align-items-center justify-content-center fw-bold">
                    <i class="fas fa-user-graduate"></i>
                  </div>
                  <strong class="text-dark">{{ req.MaDocGia }}</strong>
                </div>
                <div v-else class="text-danger fw-500"><i class="fas fa-exclamation-triangle me-1"></i>User không tồn tại</div>
              </td>
              
              <td class="text-center">
                 <button class="btn btn-action-soft btn-view" @click="viewDetails(req)">
                   <i class="fas fa-layer-group me-1"></i> Xem {{ getTotalQty(req) }} cuốn
                 </button>
              </td>

              <td class="text-center">
                <span :class="getStatusBadge(req.TrangThai === 'DaTra' && (req.TrangThaiPhat === 'DaThanhToan' || req.TrangThaiPhat === 'KhongPhat') ? 'HoanTat' : req.TrangThai) + ' custom-badge'">
                  <i class="fas fa-circle ms-1 small-dot"></i> {{ getStatusText(req.TrangThai, req) }}
                </span>
              </td>

              <td class="text-center fw-bold text-dark">
                {{ (req.TienMuon || 0).toLocaleString() }} đ
              </td>

              <td class="text-center">
                <div v-if="req.TienPhat && req.TienPhat > 0">
                  <div class="fw-bold" :class="req.IsTamTinh ? 'text-warning' : 'text-danger'">
                    {{ req.TienPhat.toLocaleString() }} đ
                    <div v-if="req.IsTamTinh" class="small">(Tạm tính)</div>
                  </div>
                  <span v-if="req.IsTamTinh" class="badge bg-warning text-dark"><i class="fas fa-clock"></i> Quá hạn</span>
                  <span v-else-if="req.TrangThaiPhat === 'ChuaThanhToan'" class="badge bg-warning text-dark"><i class="fas fa-exclamation-circle"></i> Chưa thu</span>
                  <span v-else class="badge bg-success"><i class="fas fa-check-circle"></i> Đã thu</span>
                </div>
                <div v-else class="text-muted small">-</div>
              </td>

              <td class="text-center">
                <div class="fw-bold text-primary">
                  {{ (req.TongTien || 0).toLocaleString() }} đ
                </div>
              </td>

              <td class="text-center">
                <div v-if="req.TrangThai === 'DangCho'" class="d-flex justify-content-center gap-2">
                  <button class="btn btn-action-soft btn-approve" @click="updateStatus(req._id, 'DaDuyet')" title="Phê duyệt">
                    <i class="bi bi-check-circle-fill me-1"></i> Duyệt
                  </button>
                  <button class="btn btn-action-soft btn-reject" @click="updateStatus(req._id, 'TuChoi')" title="Từ chối">
                    <i class="bi bi-x-circle-fill me-1"></i> Từ chối
                  </button>
                </div>
                
                <div v-if="req.TrangThai === 'DaDuyet'">
                   <button class="btn btn-action-soft btn-return" @click="updateStatus(req._id, 'DaTra')">
                    <i class="bi bi-arrow-return-left me-1"></i> Xác nhận đã trả
                  </button>
                </div>
                
                <div v-if="req.TrangThaiPhat === 'ChuaThanhToan' && req.TrangThai !== 'DangCho'" class="mt-2">
                   <button class="btn btn-sm btn-outline-danger w-100 fw-bold" @click="payFine(req)">
                    <i class="fas fa-money-bill-wave me-1"></i> Thu tiền
                  </button>
                </div>
                
                <div v-if="(req.TrangThai === 'DaTra' || req.TrangThai === 'TuChoi') && (req.TrangThaiPhat === 'DaThanhToan' || req.TrangThaiPhat === 'KhongPhat')">
                    <span class="badge bg-success-solid px-3 py-2 rounded-pill shadow-sm">
                        <i class="fas fa-check-double me-1"></i> Hoàn tất & Đã đóng
                    </span>
                </div>
                <div v-else-if="req.TrangThai === 'DaTra' && req.TrangThaiPhat === 'ChuaThanhToan'">
                    <span class="text-warning small fw-bold"><i class="fas fa-hourglass-half me-1"></i>Chờ thu tiền</span>
                </div>
              </td>
            </tr>
            
            <tr v-if="requests.length === 0">
              <td colspan="6" class="text-center py-5 text-muted empty-state">
                <i class="fas fa-clipboard-list fs-1 mb-3 text-light-gray"></i>
                <p class="mb-0">Chưa có yêu cầu mượn sách nào.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="selectedRequest" class="modal fade show d-block custom-modal-backdrop">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content custom-modal">
          <div class="modal-header">
            <h5 class="modal-title">
                <i class="fas fa-book-open text-primary me-2"></i>Chi tiết sách mượn
            </h5>
            <button type="button" class="btn-close" @click="selectedRequest = null"></button>
          </div>
          <div class="modal-body p-4 bg-light-gray">
            <ul class="list-group custom-list shadow-sm">
              <li v-for="book in selectedRequest.DanhSachSach" :key="book._id" class="list-group-item d-flex justify-content-between align-items-center border-0 mb-2 rounded-3">
                <div class="d-flex align-items-center gap-3">
                   <div class="book-icon bg-indigo-soft text-indigo rounded">
                       <i class="fas fa-book"></i>
                   </div>
                   <div>
                     <h6 class="mb-1 fw-bold text-dark">{{ book.TenSach }}</h6>
                     <small class="text-muted"><i class="fas fa-barcode me-1"></i>Mã sách: {{ book.MaSach }}</small>
                   </div>
                </div>
                <span class="badge bg-light text-dark border px-3 py-2 rounded-pill">
                  {{ book.SoLuong || 1 }} cuốn x {{ (book.DonGia || 0).toLocaleString() }}đ
                </span>
              </li>
            </ul>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-light px-4 rounded-pill fw-500" @click="selectedRequest = null">Đóng cửa sổ</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const requests = ref([]);
const selectedRequest = ref(null);

// Hàm lấy dữ liệu
const fetchRequests = async () => {
  try {
    const res = await axios.get("http://localhost:3000/api/yeucaumuonsach")
    requests.value = res.data;
  } catch (error) {
    console.error("Lỗi lấy danh sách:", error);
  }
};

onMounted(() => {
  fetchRequests();
});

// Hàm cập nhật trạng thái
const updateStatus = async (id, status) => {
  if(!confirm("Bạn chắc chắn muốn đổi trạng thái?")) return;
  try {
    await axios.put(`http://localhost:3000/api/yeucaumuonsach/${id}`, { TrangThai: status });
    fetchRequests(); // Load lại bảng
  } catch (error) {
    alert("Lỗi cập nhật!");
  }
};

const payFine = async (req) => {
  const total = (req.TongTien || 0).toLocaleString();
  if(!confirm(`Xác nhận đã thu TỔNG CỘNG ${total} đ (bao gồm tiền mượn và phí trễ hạn nếu có)?`)) return;
  try {
    await axios.put(`http://localhost:3000/api/yeucaumuonsach/${req._id}/pay-fine`);
    fetchRequests(); // Load lại bảng
  } catch (error) {
    alert("Lỗi thu tiền: " + (error.response?.data?.message || error.message));
  }
};

const viewDetails = (req) => {
  selectedRequest.value = req;
};

// Helpers hiển thị
const formatDate = (date) => {
  return new Date(date).toLocaleString("vi-VN");
};

const getTotalQty = (req) => {
  if (!req || !req.DanhSachSach) return 0;
  return req.DanhSachSach.reduce((sum, item) => sum + (Number(item.SoLuong) || 1), 0);
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'DangCho': return 'badge bg-secondary';
    case 'DaDuyet': return 'badge bg-success';
    case 'DaTra': return 'badge bg-primary';
    case 'TuChoi': return 'badge bg-danger';
    case 'HoanTat': return 'badge bg-success-solid';
    default: return 'badge bg-light text-dark';
  }
};

const getStatusText = (status, req) => {
    if (status === 'DaTra') {
        if (req.TrangThaiPhat === 'DaThanhToan' || req.TrangThaiPhat === 'KhongPhat') {
            return 'Hoàn tất';
        }
        return 'Đã trả - Chờ thu';
    }
    const map = {
        'DangCho': 'Chờ duyệt',
        'DaDuyet': 'Đang mượn',
        'TuChoi': 'Từ chối'
    };
    return map[status] || status;
};
</script>

<style scoped>
/* ===== TIÊU ĐỀ VÀ THẺ BỌC CHÍNH ===== */
.page-title {
    font-weight: 700;
    color: #1e293b;
    letter-spacing: -0.5px;
}

.custom-card {
    border-radius: 16px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05) !important;
    overflow: hidden;
    background-color: #fff;
}

/* ===== BẢNG (TABLE) ===== */
.custom-table {
    border-collapse: separate;
    border-spacing: 0;
}

.custom-table thead th {
    background-color: #f8fafc !important;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 0.5px;
    padding: 16px;
    border-bottom: 2px solid #e2e8f0;
}

.custom-table tbody td {
    padding: 16px;
    vertical-align: middle;
    border-bottom: 1px solid #f1f5f9;
    color: #475569;
}

.custom-table tbody tr {
    transition: background-color 0.2s ease;
}
.custom-table tbody tr:hover td {
    background-color: #f8fafc;
}

/* ===== BADGES TRẠNG THÁI (GHI ĐÈ BOOTSTRAP) ===== */
.custom-badge {
    padding: 8px 14px;
    border-radius: 30px;
    font-weight: 600;
    font-size: 0.85rem;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}
.small-dot {
    font-size: 6px;
}

/* Ghi đè màu nền cho các class trả về từ getStatusBadge() */
:deep(.bg-secondary) { background-color: #fef3c7 !important; color: #d97706 !important; } /* Chờ duyệt: Vàng nhạt */
:deep(.bg-success) { background-color: #dcfce7 !important; color: #166534 !important; } /* Đang mượn: Xanh lá nhạt */
:deep(.bg-primary) { background-color: #e0e7ff !important; color: #4338ca !important; } /* Đã trả: Xanh dương nhạt */
:deep(.bg-danger) { background-color: #fee2e2 !important; color: #dc2626 !important; } /* Từ chối: Đỏ nhạt */
:deep(.bg-success-solid) { background-color: #059669 !important; color: #ffffff !important; } /* Hoàn tất: Xanh đậm */

/* ===== NÚT THAO TÁC (SOFT BUTTONS) ===== */
.btn-action-soft {
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.85rem;
    padding: 8px 16px;
    transition: all 0.2s ease;
    border: none;
}

.btn-view { background-color: #f1f5f9; color: #475569; }
.btn-view:hover { background-color: #e2e8f0; color: #1e293b; transform: translateY(-1px); }

.btn-approve { background-color: #dcfce7; color: #166534; }
.btn-approve:hover { background-color: #bbf7d0; transform: translateY(-1px); }

.btn-reject { background-color: #fee2e2; color: #dc2626; }
.btn-reject:hover { background-color: #fecaca; transform: translateY(-1px); }

.btn-return { background-color: #e0e7ff; color: #4338ca; }
.btn-return:hover { background-color: #c7d2fe; transform: translateY(-1px); }

.btn-pay-complete { background-color: #dcfce7; color: #166534; border: 1px solid #166534 !important; }
.btn-pay-complete:hover { background-color: #bbf7d0; transform: translateY(-1px); }

/* ===== MODAL ===== */
.custom-modal-backdrop {
    background: rgba(15, 23, 42, 0.6) !important;
    backdrop-filter: blur(4px);
}

.custom-modal {
    border-radius: 20px;
    border: none;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
    background: #fff;
    border-bottom: 1px solid #f1f5f9;
    padding: 20px 24px;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
}

.modal-title {
    font-weight: 700;
    color: #1e293b;
    font-size: 1.25rem;
}

.bg-light-gray {
    background-color: #f8fafc;
}

.book-icon {
    width: 45px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}

.bg-indigo-soft { background-color: #e0e7ff; }
.text-indigo { color: #4f46e5; }
.fw-500 { font-weight: 500; }
.text-light-gray { color: #cbd5e1; }

.btn-light {
    background-color: #e2e8f0;
    color: #475569;
    transition: all 0.2s;
}
.btn-light:hover {
    background-color: #cbd5e1;
}

/* Avatar nhỏ cho phần hiển thị người mượn */
.avatar-sm {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
}
</style>