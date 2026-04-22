<template>
  <div class="container mt-3">
    <div class="row">
      <div class="col-12 mb-3">
        <h3 class="text-primary fw-bold">Thư Viện Sách</h3>
        <div class="input-group">
            <span class="input-group-text bg-white"><i class="fas fa-search"></i></span>
            <input 
              type="text" 
              class="form-control" 
              placeholder="Tìm kiếm sách theo tên..." 
              v-model="searchText"
            />
        </div>
      </div>
    </div>

    <div class="row">
      <div 
        class="col-md-3 col-sm-6 mb-4" 
        v-for="sach in filteredSachs" 
        :key="sach._id"
      >
        <div class="card h-100 shadow-sm book-card" @click="xemChiTiet(sach._id)">
          <div class="img-container">
              <img 
               :src="getImageUrl(sach.HinhAnh)" 
                class="card-img-top" 
                alt="Ảnh bìa"
                @error="handleImageError" 
              >
          </div>
          
          <div class="card-body d-flex flex-column">
            <h5 class="card-title text-primary text-truncate" :title="sach.TenSach">
                {{ sach.TenSach }}
            </h5>
            
            <div class="mt-auto">
                <p class="card-text mb-1">
                  <strong>Giá:</strong> <span class="text-danger fw-bold">{{ formatCurrency(sach.DonGia) }}</span>
                </p>
                <p class="card-text d-flex justify-content-between">
                  <small class="text-muted">Kho: {{ sach.SoQuyen }}</small>
                  <small class="text-muted fst-italic">{{ sach.TacGia }}</small>
                </p>
            </div>
          </div>
          
          <div class="card-footer bg-white border-top-0">
            <button class="btn btn-outline-primary w-100">
                <i class="fas fa-eye me-1"></i> Chi tiết
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredSachs.length === 0" class="col-12 text-center mt-4">
          <p class="text-muted">Không tìm thấy sách nào phù hợp.</p>
      </div>
    </div>
  </div>
</template>

<script>
import SachService from "@/services/sach.service";

export default {
  name: "BookList",
  data() {
    return {
      sachs: [],
      searchText: "",
    };
  },
  computed: {
    filteredSachs() {
      if (!this.searchText) return this.sachs;
      return this.sachs.filter((sach) =>
        sach.TenSach.toLowerCase().includes(this.searchText.toLowerCase())
      );
    },
  },
  methods: {
    async retrieveSachs() {
      try {
        this.sachs = await SachService.getAll();
      } catch (error) {
        console.log("Lỗi lấy danh sách sách: ", error);
      }
    },

    // --- ĐÂY LÀ PHẦN ĐÃ SỬA ---
    getImageUrl(imagePath) {
        if (imagePath) {
            // Backend đã lưu "/uploads/tenfile.jpg"
            if (imagePath.startsWith('http')) return imagePath;
            return `http://localhost:3000${imagePath}`;
        }
        // Ảnh mặc định nếu không có dữ liệu
        return "https://placehold.co/400x600?text=No+Image";
    },

    // Xử lý nếu ảnh bị lỗi (link chết) thì hiện ảnh mặc định
    handleImageError(e) {
        e.target.src = "https://placehold.co/400x600?text=Error";
    },

    formatCurrency(value) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    },

    xemChiTiet(bookId) {
        // Lưu ý: Bạn cần chắc chắn route 'chi-tiet-sach' đã được khai báo trong router/index.js
        this.$router.push({ name: 'chi-tiet-sach', params: { id: bookId } });
    }
  },
  mounted() {
    this.retrieveSachs();
    if (this.$route.query.q) {
      this.searchText = this.$route.query.q;
    }
  },
  watch: {
    '$route.query.q': {
      handler(newQ) {
        this.searchText = newQ || "";
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
/* ===== ĐỊNH NGHĨA BIẾN MÀU DARK THEME ===== */
:root {
    --primary-color: #6366f1; /* Xanh Indigo sáng */
    --primary-hover: #818cf8;
    --dark-bg: #0f172a; /* Nền tối tổng thể */
    --dark-surface: #1e293b; /* Nền các khối Card (Slate 800) ĐẶC 100% */
    --dark-border: #334155; /* Viền tối */
    --text-main: #f8fafc; /* Chữ trắng sáng */
    --text-muted: #94a3b8; /* Chữ xám nhạt */
}

/* ===== GHI ĐÈ CLASS BOOTSTRAP TẠI COMPONENT NÀY ===== */
.bg-white { background-color: var(--dark-surface) !important; }
.text-primary { color: var(--primary-hover) !important; }
.text-danger { color: #fca5a5 !important; } /* Đỏ pastel dễ nhìn trên nền đen */
.text-muted { color: var(--text-muted) !important; }

/* ===== TIÊU ĐỀ ===== */
h3.text-primary {
    font-size: 2rem;
    font-weight: 800 !important;
    letter-spacing: -0.5px;
    margin-bottom: 20px;
    text-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
}

/* ===== THANH TÌM KIẾM ĐẶC MÀU ===== */
.input-group {
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    border-radius: 14px;
    overflow: hidden;
}
.input-group-text {
    background-color: var(--dark-surface) !important;
    border: 1px solid var(--dark-border);
    border-right: none;
    color: var(--text-muted);
    padding: 0 20px;
}
.form-control {
    background-color: var(--dark-surface) !important;
    border: 1px solid var(--dark-border);
    border-left: none;
    color: var(--text-main);
    padding: 16px 20px 16px 0;
    font-size: 1.05rem;
    box-shadow: none !important;
}
.form-control::placeholder {
    color: #64748b;
}
.input-group:focus-within .input-group-text,
.input-group:focus-within .form-control {
    border-color: var(--primary-color);
}
.input-group:focus-within .input-group-text i {
    color: var(--primary-color);
}

/* ===== CARD SÁCH (THẺ ĐẶC KHÔNG TRONG SUỐT) ===== */
.book-card {
    background-color: var(--dark-surface) !important;
    border: 1px solid var(--dark-border) !important;
    border-radius: 20px !important;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.book-card:hover {
    transform: translateY(-8px);
    border-color: var(--primary-color) !important;
    box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.2) !important;
}

/* ===== KHUNG ẢNH BÌA ===== */
.img-container {
    height: 280px;
    background-color: #020617; /* Đen tuyền để làm nền cho ảnh nổi bật */
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 15px;
    overflow: hidden;
    border-bottom: 1px solid var(--dark-border);
}

.card-img-top {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: transform 0.5s ease;
    filter: drop-shadow(0 10px 15px rgba(0,0,0,0.5)); /* Đổ bóng cho quyển sách */
}

.book-card:hover .card-img-top {
    transform: scale(1.08) rotate(2deg); /* Phóng to và nghiêng nhẹ sách khi hover */
}

/* ===== PHẦN TEXT BÊN TRONG CARD ===== */
.card-body {
    padding: 20px;
}

.card-title {
    color: var(--text-main) !important;
    font-size: 1.15rem;
    font-weight: 700;
    margin-bottom: 15px;
    letter-spacing: 0.2px;
}

.card-text strong {
    color: var(--text-muted);
}

/* ===== FOOTER VÀ NÚT BẤM ===== */
.card-footer {
    background-color: transparent !important;
    padding: 0 20px 20px 20px;
}

.btn-outline-primary {
    background-color: rgba(255, 255, 255, 0.05);
    color: var(--text-main) !important;
    border: 1px solid var(--dark-border) !important;
    border-radius: 12px;
    padding: 12px;
    font-weight: 600;
    transition: all 0.3s ease;
}

/* Khi hover vào Card, nút bấm cũng tự động đổi màu phát sáng */
.book-card:hover .btn-outline-primary, 
.btn-outline-primary:hover {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important;
    border-color: transparent !important;
    color: #fff !important;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
    transform: translateY(-2px);
}
</style>