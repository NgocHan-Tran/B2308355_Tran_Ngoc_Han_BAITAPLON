<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const handleBorrowClick = () => {
    const user = localStorage.getItem('user');
    if (!user) {
        const ok = confirm('Để mượn sách bạn cần đăng nhập trước. Đến trang đăng nhập ngay?');
        if (ok) router.push('/dangnhap');
        return;
    }
    router.push('/sach');
};

// Dữ liệu sách nổi bật (Giữ nguyên)
const featuredBooks = ref([
    { _id: 'BK01', title: 'Tư duy phản biện', price: 150000, img: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400' },
    { _id: 'BK02', title: 'Đắc Nhân Tâm', price: 89000, img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400' },
    { _id: 'BK03', title: 'Nhà Giả Kim', price: 75000, img: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400' },
    { _id: 'BK04', title: 'Cà phê cùng Tony', price: 110000, img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400' },
]);

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};
</script>

<template>
    <div class="dark-page-wrapper">
        
        <div class="p-5 mb-4 bg-light rounded-3 border-bottom hero-section">
            <div class="container-fluid py-5 text-center">
                <h1 class="display-5 fw-bold text-primary">Han Store</h1>
                <p class="col-md-8 fs-4 mx-auto text-muted description-text">
                    Thế giới tri thức trong tầm tay. Hơn 10.000 đầu sách đang chờ bạn khám phá.
                    Mượn sách dễ dàng, giao nhận nhanh chóng.
                </p>
                <div class="d-flex justify-content-center gap-3 mt-4">
                    <button @click="handleBorrowClick" class="btn btn-primary btn-lg px-4 shadow-sm main-btn">
                        <i class="fas fa-shopping-cart me-2"></i>Mượn sách ngay
                    </button>
                    <router-link to="/sach" class="btn btn-outline-secondary btn-lg px-4 secondary-btn">
                        Xem danh mục
                    </router-link>
                </div>
            </div>
        </div>

        <div class="container py-5">
            <div class="row g-4 py-3 row-cols-1 row-cols-lg-3">
                <div class="col">
                    <div class="d-flex align-items-center p-3 border rounded shadow-sm h-100 feature-card">
                        <div class="fs-1 text-primary me-3 icon-box"><i class="fas fa-truck-fast"></i></div>
                        <div>
                            <h5 class="mb-0 fw-bold text-light">Giao nhanh 2h</h5>
                            <small class="text-muted">Nội ô Cần Thơ</small>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="d-flex align-items-center p-3 border rounded shadow-sm h-100 feature-card">
                        <div class="fs-1 text-primary me-3 icon-box"><i class="fas fa-shield-alt"></i></div>
                        <div>
                            <h5 class="mb-0 fw-bold text-light">Sách chính hãng</h5>
                            <small class="text-muted">Cam kết chất lượng 100%</small>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="d-flex align-items-center p-3 border rounded shadow-sm h-100 feature-card">
                        <div class="fs-1 text-primary me-3 icon-box"><i class="fas fa-tags"></i></div>
                        <div>
                            <h5 class="mb-0 fw-bold text-light">Giá thuê rẻ</h5>
                            <small class="text-muted">Chỉ từ 2.000đ/ngày</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-dark text-white py-5 mt-5 cta-section">
            <div class="container text-center">
                <h2 class="fw-bold">Bạn chưa tìm thấy sách ưng ý?</h2>
                <p class="lead text-white-50">Kho sách của chúng tôi còn rất nhiều điều thú vị đang chờ bạn.</p>
                <router-link to="/sach" class="btn btn-warning btn-lg fw-bold mt-3 explorer-btn">
                    Khám phá Kho Sách Ngay
                </router-link>
            </div>
        </div>

    </div>
</template>

<style scoped>
/* Reset & Base Styles */
.dark-page-wrapper {
    background-color: #2e0418; /* Slate 900 */
    color: #f1f5f9;
    min-height: 100vh;
    font-family: 'Plus Jakarta Sans', sans-serif;
    overflow-x: hidden;
}

/* Hero Section */
.hero-section {
    background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.1), transparent),
                radial-gradient(circle at bottom left, rgba(99, 102, 241, 0.05), transparent) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
    padding-top: 100px !important;
}

h1.text-primary {
    font-size: clamp(2.5rem, 8vw, 4.5rem);
    background: linear-gradient(to bottom right, #fff 30%, #94a3b8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.04em;
    margin-bottom: 1.5rem;
}

.description-text {
    color: #94a3b8 !important;
    max-width: 700px;
    line-height: 1.6;
}

/* Buttons */
.main-btn {
    background-color: #3b82f6 !important; /* Blue 500 */
    border: none !important;
    border-radius: 12px;
    padding: 16px 32px !important;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.25s ease;
}

.main-btn:hover {
    background-color: #2563eb !important;
    transform: translateY(-2px);
    box-shadow: 0 12px 24px -8px rgba(59, 130, 246, 0.5) !important;
}

.secondary-btn {
    background-color: transparent !important;
    color: #f1f5f9 !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 12px;
    padding: 16px 32px !important;
    transition: all 0.2s ease;
}

.secondary-btn:hover {
    background-color: rgba(255, 255, 255, 0.05) !important;
    border-color: rgba(255, 255, 255, 0.4) !important;
}

/* Feature Cards */
.feature-card {
    background: rgba(30, 41, 59, 0.7) !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
    border-radius: 20px !important;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
}

.feature-card:hover {
    border-color: #3b82f6 !important;
    transform: translateY(-5px);
    background: rgba(30, 41, 59, 0.9) !important;
}

.icon-box {
    color: #60a5fa !important; /* Blue 400 */
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.feature-card:hover .icon-box {
    transform: scale(1.2) rotate(-5deg);
}

/* CTA Section */
.cta-section {
    background-color: #020617 !important;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding: 80px 0 !important;
}

.cta-section h2 {
    font-size: 2.25rem;
    margin-bottom: 1rem;
}

.explorer-btn {
    background: #f59e0b !important;
    color: #000 !important;
    border: none !important;
    border-radius: 12px;
    padding: 16px 40px !important;
    font-size: 1.1rem;
    transition: all 0.3s ease;
}

.explorer-btn:hover {
    background: #fbbf24 !important;
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(245, 158, 11, 0.3) !important;
}

/* Animation */
@keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}

.container-fluid, .container {
    animation: slideUp 0.8s ease-out forwards;
}

/* Mobile Tweaks */
@media (max-width: 768px) {
    .hero-section { padding-top: 60px !important; }
    h1.text-primary { font-size: 2.5rem; }
    .d-flex.gap-3 { flex-direction: column; }
}
</style>