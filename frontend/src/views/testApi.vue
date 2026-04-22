<template>
  <div class="test-container">
    <h1>🛠️ API Test Dashboard</h1>
    
    <div class="section">
      <h3>Chức năng chung</h3>
      <div class="controls">
        <button @click="testGetAll" class="btn btn-primary">
          Test: Lấy tất cả (getAll)
        </button>

        <button @click="testCreate" class="btn btn-success">
          Test: Tạo mới (create)
        </button>

        <button @click="clearLog" class="btn btn-outline">
          Xóa màn hình
        </button>
      </div>
    </div>

    <hr />

    <div class="section">
      <h3>Chức năng theo ID</h3>
      <div class="input-group">
        <input 
          v-model="inputID" 
          type="text" 
          placeholder="Nhập ID (ví dụ: 654a...)" 
          class="form-input"
        />
        <button @click="testGetById" class="btn btn-warning">
          Test: Lấy theo ID
        </button>
        <button @click="testUpdate" class="btn btn-info">
            Test: Update theo ID
        </button>
        <button @click="testDelete" class="btn btn-danger">
            Test: Xóa theo ID
        </button>
      </div>
    </div>

    <div v-if="loading" class="status loading">⏳ Đang gọi API...</div>
    <div v-if="error" class="status error">❌ Lỗi: {{ error.message }}</div>

    <div class="result-box">
      <h3>Kết quả trả về:</h3>
      <pre>{{ output }}</pre>
    </div>
  </div>
</template>

<script>
// Nhớ import đúng đường dẫn Service của bạn
import NhaxuatbanService from "@/services/nhaxuatban.service"; 

export default {
  data() {
    return {
      output: "Chưa có dữ liệu...",
      loading: false,
      error: null,
      inputID: "", // Biến lưu ID người dùng nhập
    };
  },
  methods: {
    logResult(data) {
      this.output = JSON.stringify(data, null, 2);
      console.log("Data:", data);
    },

    // --- CÁC HÀM CŨ ---
    async testGetAll() {
      this.loading = true; this.error = null;
      try {
        const res = await NhaxuatbanService.getAll();
        this.logResult(res);
      } catch (err) { this.error = err; this.output = err.toString(); } 
      finally { this.loading = false; }
    },

    async testCreate() {
      this.loading = true; this.error = null;
      try {
        const payload = { ten: "NXB Test " + Date.now(), diachi: "Demo Address" };
        const res = await NhaxuatbanService.create(payload);
        this.logResult(res);
        // Tự động điền ID vừa tạo vào ô input để test luôn
        if(res._id || res.insertedId) this.inputID = res._id || res.insertedId;
      } catch (err) { this.error = err; this.output = err.toString(); } 
      finally { this.loading = false; }
    },

    // --- CÁC HÀM MỚI (THEO ID) ---
    async testGetById() {
      if (!this.inputID) { alert("Vui lòng nhập ID vào ô trống!"); return; }
      
      this.loading = true; this.error = null;
      this.output = `Đang tìm ID: ${this.inputID}...`;

      try {
        // Lưu ý: Kiểm tra file service xem hàm tên là get(id) hay getById(id)
        const res = await NhaxuatbanService.get(this.inputID); 
        // res+= res.data.maNXB;
        this.logResult(res);
        this.logResult(res.maNXB);
      } catch (err) {
        this.error = err;
        this.output = `Không tìm thấy hoặc lỗi server: ${err.toString()}`;
      } finally {
        this.loading = false;
      }
    },

    async testUpdate() {
        if (!this.inputID) { alert("Cần ID để update!"); return; }
        this.loading = true; 
        try {
            const payload = { ten: "Tên Đã Update " + Date.now() };
            const res = await NhaxuatbanService.update(this.inputID, payload);
            this.logResult(res);
        } catch (err) { this.error = err; this.output = err.toString(); }
        finally { this.loading = false; }
    },

    async testDelete() {
        if (!this.inputID) { alert("Cần ID để xóa!"); return; }
        if (!confirm("Bạn có chắc muốn xóa ID này?")) return;

        this.loading = true; 
        try {
            const res = await NhaxuatbanService.delete(this.inputID);
            this.logResult(res);
        } catch (err) { this.error = err; this.output = err.toString(); }
        finally { this.loading = false; }
    },

    clearLog() {
      this.output = "Đã xóa.";
      this.error = null;
    }
  },
};
</script>

<style scoped>
/* CSS Đã nâng cấp để dễ nhìn hơn */
.test-container { padding: 20px; max-width: 900px; margin: 0 auto; font-family: monospace; }
.section { margin-bottom: 20px; }
h3 { margin-bottom: 10px; color: #333; }

.controls button, .input-group button { margin-right: 8px; margin-bottom: 8px; padding: 8px 12px; cursor: pointer; border-radius: 4px; border: none; color: white; font-weight: bold;}
.form-input { padding: 8px; border: 1px solid #ccc; border-radius: 4px; width: 250px; margin-right: 10px; }

/* Màu nút */
.btn-primary { background: #007bff; }
.btn-success { background: #28a745; }
.btn-warning { background: #ffc107; color: #000 !important; } /* Màu vàng chữ đen */
.btn-danger { background: #dc3545; }
.btn-info { background: #17a2b8; }
.btn-outline { background: white; color: #333; border: 1px solid #ccc !important; }

/* Result Box */
.result-box { background: #1e1e1e; color: #00ff00; padding: 15px; border-radius: 5px; min-height: 300px; overflow: auto; margin-top: 20px;}
.status { padding: 10px; margin: 10px 0; font-weight: bold; border-radius: 4px;}
.status.error { color: #721c24; background: #f8d7da; border: 1px solid #f5c6cb; }
.status.loading { color: #004085; background: #cce5ff; border: 1px solid #b8daff; }
</style>