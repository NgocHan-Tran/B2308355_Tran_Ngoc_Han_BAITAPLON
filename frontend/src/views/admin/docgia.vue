<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="text-primary page-title">📋 Quản Lý Độc Giả</h2>
      <button class="btn btn-primary" @click="goToCreatePage">
        <i class="bi bi-person-plus-fill"></i> Thêm Độc Giả
      </button>
    </div>

    <div class="input-group mb-4 shadow-sm custom-search-bar">
      <input 
        type="text" 
        class="form-control border-0" 
        placeholder="Tìm kiếm theo tên, mã ĐG, email hoặc SĐT..." 
        v-model="searchText"
        @keyup.enter="searchReaders"
      />
      <button class="btn btn-search" type="button" @click="searchReaders">
        <i class="bi bi-search"></i> Tìm
      </button>
      <button class="btn btn-cancel" type="button" @click="resetSearch">
        <i class="bi bi-x-lg"></i> Hủy
      </button>
    </div>

    <div class="card custom-card">
      <div class="card-body p-0">
        <table class="table table-hover mb-0 align-middle custom-table">
          <thead class="text-center">
            <tr>
              <th>Mã ĐG</th>
              <th>Họ và Tên</th>
              <th>Email</th>
              <th>Điện Thoại</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(reader, index) in readers" :key="reader._id" @click="showDetail(reader)">
              <td class="text-center fw-bold text-indigo">{{ reader.maDocGia }}</td>
              <td class="fw-500 text-dark">{{ reader.hoLot }} {{ reader.tenDocGia }}</td>
              <td class="text-muted">{{ reader.email }}</td>
              <td class="text-center text-muted">{{ reader.dienThoai || '---' }}</td>
              <td class="text-center">
                <button class="btn btn-sm btn-action btn-edit me-2" @click.stop="goToEdit(reader._id)" title="Chỉnh sửa">
                  <i class="fas fa-user-edit"></i>
                </button>
                <button class="btn btn-sm btn-action btn-delete" @click.stop="deleteReader(reader._id)" title="Xóa">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
            <tr v-if="readers.length === 0">
              <td colspan="5" class="text-center py-5 text-muted empty-state">
                <i class="fas fa-inbox fs-1 mb-3 text-light-gray"></i>
                <p class="mb-0">Không tìm thấy dữ liệu độc giả.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="selectedReader" class="modal fade show d-block custom-modal-backdrop">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content custom-modal">
          <div class="modal-header">
            <h5 class="modal-title text-white">
              <i class="bi bi-person-badge me-2"></i> Thông tin chi tiết
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="selectedReader = null"></button>
          </div>
          <div class="modal-body p-4">
            <div class="text-center mb-4">
                <div class="avatar-placeholder rounded-circle d-inline-flex align-items-center justify-content-center">
                    {{ selectedReader.tenDocGia.charAt(0).toUpperCase() }}
                </div>
                <h5 class="mt-3 fw-bold text-dark">{{ selectedReader.hoLot }} {{ selectedReader.tenDocGia }}</h5>
                <span class="badge bg-indigo-soft text-indigo px-3 py-2 rounded-pill">{{ selectedReader.maDocGia }}</span>
            </div>
            <ul class="list-group list-group-flush custom-list">
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <span class="text-muted">Email</span> 
                <span class="fw-500">{{ selectedReader.email }}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <span class="text-muted">Điện thoại</span> 
                <span class="fw-500">{{ selectedReader.dienThoai || 'Chưa cập nhật' }}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center text-end">
                <span class="text-muted me-4">Địa chỉ</span> 
                <span class="fw-500">{{ selectedReader.diaChi || 'Chưa cập nhật' }}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <span class="text-muted">Ngày sinh</span> 
                <span class="fw-500">{{ formatDate(selectedReader.ngaySinh) }}</span>
              </li>
            </ul>
          </div>
          <div class="modal-footer border-0 pb-4 pe-4">
            <button type="button" class="btn btn-light rounded-pill px-4" @click="selectedReader = null">Đóng</button>
            <button type="button" class="btn btn-warning-soft rounded-pill px-4" @click="goToEdit(selectedReader._id)">
                <i class="bi bi-pencil-square me-1"></i> Chỉnh sửa
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const readers = ref([]);
const searchText = ref("");
const selectedReader = ref(null);
const router = useRouter();

// 1. Hàm lấy danh sách độc giả (Khớp với route GET /)
const fetchReaders = async () => {
  try {
    let url = "http://localhost:3000/api/docgia";
    
    // Nếu có tìm kiếm, thêm query param ?search=...
    if (searchText.value) {
      url += `?search=${searchText.value}`;
    }

    const response = await axios.get(url);
    readers.value = response.data;
  } catch (error) {
    console.error("Lỗi tải danh sách:", error);
    alert("Không thể tải danh sách độc giả.");
  }
};

// 2. Hàm tìm kiếm
const searchReaders = () => {
  fetchReaders();
};

const resetSearch = () => {
  searchText.value = "";
  fetchReaders();
};

// 3. Hàm hiển thị chi tiết
const showDetail = (reader) => {
  selectedReader.value = reader;
};

// 4. Hàm xóa độc giả (Khớp với route DELETE /:id)
const deleteReader = async (id) => {
  if (confirm("Bạn có chắc chắn muốn xóa độc giả này? Hành động này không thể hoàn tác.")) {
    try {
      await axios.delete(`http://localhost:3000/api/docgia/${id}`);
      alert("Đã xóa thành công!");
      // Tải lại danh sách, giữ nguyên trạng thái tìm kiếm nếu có
      fetchReaders();
      // Nếu đang xem chi tiết người vừa xóa thì đóng modal
      if (selectedReader.value && selectedReader.value._id === id) {
        selectedReader.value = null;
      }
    } catch (error) {
      console.error(error);
      alert("Xóa thất bại!");
    }
  }
};

// Điều hướng
const goToCreatePage = () => {
    router.push("/admin/docgia/add"); 
};

const goToEdit = (id) => {
    router.push(`/admin/docgia/edit/${id}`);
};

// Format ngày tháng hiển thị cho đẹp
const formatDate = (dateString) => {
  if (!dateString) return "Chưa cập nhật";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
};

// Gọi khi component được load
onMounted(() => {
  fetchReaders();
});
</script>

<style scoped>
/* ===== TIÊU ĐỀ VÀ NÚT CHÍNH ===== */
.page-title {
    font-weight: 700;
    color: #1e293b !important;
    letter-spacing: -0.5px;
}

.btn-primary {
    background-color: #4f46e5 !important;
    border-color: #4f46e5 !important;
    border-radius: 12px;
    padding: 10px 20px;
    font-weight: 500;
    box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
    transition: all 0.3s ease;
}
.btn-primary:hover {
    background-color: #4338ca !important;
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
}

/* ===== THANH TÌM KIẾM (SEARCH BAR) ===== */
.custom-search-bar {
    background-color: #fff;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
}

.custom-search-bar .form-control {
    padding: 14px 24px;
    font-size: 1rem;
    box-shadow: none !important;
}
.custom-search-bar .form-control:focus {
    background-color: #f8fafc;
}

.btn-search {
    background-color: #f1f5f9;
    color: #4f46e5;
    border: none;
    font-weight: 600;
    padding: 0 24px;
    transition: all 0.2s;
}
.btn-search:hover {
    background-color: #e2e8f0;
}

.btn-cancel {
    background-color: #fef2f2;
    color: #ef4444;
    border: none;
    font-weight: 600;
    padding: 0 20px;
    transition: all 0.2s;
}
.btn-cancel:hover {
    background-color: #fee2e2;
}

/* ===== THẺ CARD & BẢNG (TABLE) ===== */
.custom-card {
    border-radius: 16px !important;
    border: 1px solid #f1f5f9 !important;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05) !important;
    overflow: hidden;
}

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
    cursor: pointer;
}
.custom-table tbody tr:hover td {
    background-color: #f8fafc;
}

/* Custom Text Colors */
.text-indigo { color: #4f46e5 !important; }
.fw-500 { font-weight: 500; }
.text-light-gray { color: #cbd5e1; }

/* Nút Thao tác (Mắt, Thùng rác) */
.btn-action {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.btn-edit {
    background-color: #fef3c7 !important;
    color: #d97706 !important;
}
.btn-edit:hover {
    background-color: #fde68a !important;
    transform: scale(1.1);
}

.btn-delete {
    background-color: #fee2e2 !important;
    color: #ef4444 !important;
}
.btn-delete:hover {
    background-color: #fecaca !important;
    transform: scale(1.1);
}

/* ===== MODAL (CỬA SỔ CHI TIẾT) ===== */
.custom-modal-backdrop {
    background: rgba(15, 23, 42, 0.6) !important;
    backdrop-filter: blur(4px);
}

.custom-modal {
    border-radius: 24px;
    border: none;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    overflow: hidden;
}

.modal-header {
    background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
    border-bottom: none;
    padding: 20px 24px;
}

.modal-header .modal-title {
    font-weight: 600;
    letter-spacing: 0.5px;
}

.avatar-placeholder {
    width: 80px; 
    height: 80px; 
    font-size: 2.5rem; 
    font-weight: 700;
    background-color: #e0f2fe;
    color: #0284c7;
    border: 4px solid #fff;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    user-select: none;
}

.bg-indigo-soft { background-color: #e0e7ff; }

.custom-list .list-group-item {
    border-color: #f1f5f9;
    padding: 16px 0;
    border-left: none;
    border-right: none;
}
.custom-list .list-group-item:first-child { border-top: none; }
.custom-list .list-group-item:last-child { border-bottom: none; }

.btn-warning-soft {
    background-color: #fef3c7;
    color: #d97706;
    border: none;
    font-weight: 600;
    transition: all 0.2s ease;
}
.btn-warning-soft:hover {
    background-color: #fde68a;
    transform: translateY(-2px);
}

.btn-light {
    font-weight: 600;
    color: #64748b;
    background-color: #f1f5f9;
    border: none;
}
.btn-light:hover {
    background-color: #e2e8f0;
    color: #334155;
}
</style>