<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const user = ref(null);
const role = ref(null);

// State cho giỏ hàng
const cartItems = ref([]);
const isCartHover = ref(false);
const searchText = ref("");

const handleSearch = () => {
    if (searchText.value.trim()) {
        router.push({ name: 'sachApp', query: { q: searchText.value.trim() } });
    } else {
        router.push({ name: 'sachApp' });
    }
};

// --- LOGIC GIỮ NGUYÊN NHƯ CŨ ---
const refreshUserData = () => {
    const userStr = localStorage.getItem("user");
    const roleStr = localStorage.getItem("role");

    if (userStr) {
        user.value = JSON.parse(userStr);
        role.value = roleStr;
    } else {
        user.value = null;
        role.value = null;
    }
};

const refreshLocalStorageData = () => {
    localStorage.clear();
};

const refreshCartData = () => {
    try {
        const cartStr = localStorage.getItem("cart");
        if (cartStr) {
            cartItems.value = JSON.parse(cartStr);
        } else {
            cartItems.value = [];
        }
    } catch (e) {
        console.error("Lỗi đọc giỏ hàng:", e);
        cartItems.value = [];
    }
};

onMounted(() => {
    refreshUserData();
    refreshCartData();
    window.addEventListener('cart-updated', refreshCartData);
    window.addEventListener('storage', refreshCartData);
});

onUnmounted(() => {
    window.removeEventListener('cart-updated', refreshCartData);
    window.removeEventListener('storage', refreshCartData);
});

watch(route, () => {
    refreshUserData();
    refreshCartData();
});

const handleLogout = () => {
    refreshLocalStorageData();
    user.value = null;
    role.value = null;
    router.push('/dangnhap');
};

const isAdminOrStaff = computed(() => {
    return role.value === 'admin' || role.value === 'nhanvien';
});

const displayName = computed(() => {
    if (!user.value) return '';
    return user.value.tenDocGia || user.value.HoTenNV || 'Người dùng';
});

const cartCount = computed(() => {
    return cartItems.value.length;
});

const menuItems = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Sách', path: '/sach' },
];
</script>

<template>
    <header>
        <div class="top-bar py-2 text-white bg-dark">
            <div class="container d-flex flex-column flex-md-row justify-content-between align-items-center small">
                <div class="mb-1 mb-md-0 fw-bold">
                    <i class="fas fa-book-reader me-2"></i>Thế giới sách trong tầm tay bạn
                </div>
                
                <div class="d-flex gap-3 align-items-center">
                    <span><i class="fas fa-envelope me-1"></i> support@ebookstore.com</span>
                    <span class="d-none d-sm-inline">|</span>
                    <span><i class="fas fa-phone-alt me-1"></i> 1900 1000</span>
                </div>
            </div>
        </div>

        <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
            <div class="container">
                
                <router-link to="/" class="navbar-brand d-flex align-items-center gap-2">
                    <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 45px; height: 45px;">
                        <i class="fas fa-book-open fs-4"></i>
                    </div>
                    <div class="d-flex flex-column" style="line-height: 1.2;">
                        <span class="fw-bold text-primary text-uppercase" style="font-size: 1.25rem; letter-spacing: 1px;">Han Store</span>
                        <span class="text-secondary small fw-bold" style="font-size: 0.7rem;">Tri thức là sức mạnh</span>
                    </div>
                </router-link>

                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse justify-content-center" id="mainNavbar">
                    <ul class="navbar-nav mb-2 mb-lg-0 fw-500">
                        <li class="nav-item" v-for="item in menuItems" :key="item.name">
                            <router-link 
                                :to="item.path" 
                                class="nav-link px-3"
                                active-class="active-link"
                            >
                                {{ item.name }}
                            </router-link>
                        </li>
                        
                        <li class="nav-item dropdown" v-if="isAdminOrStaff">
                            <a class="nav-link dropdown-toggle text-danger fw-bold admin-link" href="#" role="button" data-bs-toggle="dropdown">
                                <i class="fas fa-cog me-1"></i>Quản trị
                            </a>
                            <ul class="dropdown-menu shadow border-0 solid-dropdown">
                                <li><router-link to="/nxb" class="dropdown-item">Quản lý Nhà Xuất Bản</router-link></li>
                                <li><router-link to="/admin/quanlysach" class="dropdown-item">Quản lý Đầu Sách</router-link></li>
                                <li><router-link to="/sach/them" class="dropdown-item">Thêm Sách Mới</router-link></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><router-link to="/admin/muonsach" class="dropdown-item">Quản Lý Mượn Trả</router-link></li>
                                <li><router-link to="/admin/docgia" class="dropdown-item">Quản lý Độc Giả</router-link></li>
                                <li><router-link to="/admin/maintenance" class="dropdown-item">Bảo Trì Hệ Thống</router-link></li>
                            </ul>
                        </li>
                    </ul>
                </div>

                <div class="d-flex align-items-center gap-3 action-icons">
                    <div class="d-none d-lg-block">
                        <div class="input-group search-header shadow-sm">
                            <input 
                                type="text" 
                                class="form-control form-control-sm border-0" 
                                placeholder="Tìm kiếm sách..." 
                                v-model="searchText"
                                @keyup.enter="handleSearch"
                            >
                            <button class="btn btn-sm btn-white border-0" @click="handleSearch">
                                <i class="fas fa-search text-muted"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="dropdown">
                        <button class="btn btn-link text-dark p-0 d-flex align-items-center gap-2 text-decoration-none user-btn" data-bs-toggle="dropdown">
                            <img v-if="user" :src="`https://ui-avatars.com/api/?name=${displayName}&background=6366f1&color=fff`" 
                                 class="rounded-circle border border-2 border-dark shadow-sm" width="38" height="38">
                            <div v-else class="d-flex align-items-center gap-1">
                                <div class="bg-light rounded-circle d-flex align-items-center justify-content-center guest-avatar">
                                    <i class="fas fa-user text-secondary"></i>
                                </div>
                            </div>
                        </button>
                        
                        <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2 user-dropdown solid-dropdown">
                            <div v-if="user">
                                <li class="px-3 py-2 text-center border-bottom mb-2">
                                    <div class="fw-bold text-primary fs-6">{{ displayName }}</div>
                                    <span class="badge bg-light text-dark border mt-1">{{ role === 'admin' ? 'Quản trị viên' : (role === 'nhanvien' ? 'Nhân viên' : 'Độc giả') }}</span>
                                </li>
                                <li><router-link to="/ho-so" class="dropdown-item"><i class="fas fa-id-card me-2 text-muted"></i>Hồ sơ cá nhân</router-link></li>
                                <li><router-link to="/lich-su" class="dropdown-item"><i class="fas fa-history me-2 text-muted"></i>Lịch sử mượn</router-link></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a href="#" @click.prevent="handleLogout" class="dropdown-item text-danger logout-item"><i class="fas fa-sign-out-alt me-2"></i>Đăng xuất</a></li>
                            </div>

                            <div v-if="!user">
                                <li><router-link to="/dangnhap" class="dropdown-item"><i class="fas fa-sign-in-alt me-2 text-muted"></i>Đăng nhập</router-link></li>
                                <li><router-link to="/dangky" class="dropdown-item"><i class="fas fa-user-plus me-2 text-muted"></i>Đăng ký thành viên</router-link></li>
                            </div>
                        </ul>
                    </div>

                    <div 
                        class="dropdown" 
                        @mouseenter="isCartHover = true" 
                        @mouseleave="isCartHover = false"
                    >
                        <router-link to="/gio-hang" class="btn btn-light position-relative rounded-circle d-flex align-items-center justify-content-center cart-btn">
                            <i class="fas fa-shopping-bag text-dark"></i>
                            <span v-if="cartCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-dark shadow-sm">
                                {{ cartCount }}
                            </span>
                        </router-link>

                        <div class="dropdown-menu dropdown-menu-end cart-dropdown p-0 border-0 solid-dropdown" 
                             :class="{ 'show': isCartHover }">
                            <div class="p-3 bg-white rounded-custom">
                                <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                                    <h6 class="mb-0 fw-bold text-dark">Giỏ hàng của bạn</h6>
                                    <span class="badge bg-primary rounded-pill">{{ cartCount }} mục</span>
                                </div>
                                
                                <div v-if="cartItems.length === 0" class="text-center py-4 empty-cart">
                                    <div class="empty-icon-wrapper mb-3">
                                        <i class="fas fa-shopping-basket fs-2"></i>
                                    </div>
                                    <p class="mb-0 text-muted fw-500">Giỏ hàng đang trống</p>
                                </div>

                                <div v-else class="cart-items-list pe-2">
                                    <div v-for="(book, index) in cartItems" :key="index" class="d-flex gap-3 mb-3 cart-item align-items-center">
                                        <div class="img-wrapper shadow-sm">
                                            <img :src="book.HinhAnh || 'https://via.placeholder.com/50'" 
                                                 class="rounded" width="50" height="65" alt="Book cover">
                                        </div>
                                        <div class="flex-grow-1 overflow-hidden">
                                            <div class="text-truncate small fw-bold text-dark mb-1">{{ book.TenSach }}</div>
                                            <div class="text-truncate small text-muted"><i class="fas fa-pen-nib me-1"></i>{{ book.TacGia }}</div>
                                            <div class="small fw-bold mt-1 text-danger">{{ Number(book.DonGia).toLocaleString() }} đ <span class="text-muted fw-normal">x {{ book.SoLuong || 1 }}</span></div>
                                        </div>
                                    </div>
                                </div>

                                <div v-if="cartItems.length > 0" class="border-top pt-3 mt-2">
                                    <router-link to="/gio-hang" class="btn btn-primary btn-sm w-100 fw-bold checkout-btn">
                                        Đến trang Giỏ hàng <i class="fas fa-arrow-right ms-1"></i>
                                    </router-link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    </header>
</template>

<style scoped>
/* ===== ĐỊNH NGHĨA BIẾN MÀU DARK THEME ===== */
:root {
    --primary-color: #6366f1; /* Xanh Indigo sáng hơn cho Dark Mode */
    --primary-hover: #818cf8;
    --dark-bg: #430942; /* Nền tối (Slate 900) */
    --dark-surface: #1e293b; /* Nền các thẻ Card/Dropdown đặc (Slate 800) */
    --dark-border: #858e9b; /* Viền tối */
    --text-main: #f8fafc; /* Chữ trắng sáng */
    --text-muted: #94a3b8; /* Chữ xám nhạt */
    --shadow-heavy: 0 20px 40px -10px rgba(0, 0, 0, 0.7); /* Bóng đổ đậm hơn cho dropdown */
}

/* ===== ÉP CÁC CLASS BOOTSTRAP THÀNH DARK MODE ===== */
.bg-white { background-color: var(--dark-bg) !important; }
.text-dark { color: var(--text-main) !important; }
.text-muted { color: var(--text-muted) !important; }
.text-secondary { color: #cbd5e1 !important; }
.border-bottom { border-color: var(--dark-border) !important; }
.border-top { border-color: var(--dark-border) !important; }
.bg-light { background-color: var(--dark-surface) !important; border-color: var(--dark-border) !important; color: var(--text-main) !important; }
.border { border-color: var(--dark-border) !important; }

/* ===== TOP BAR ===== */
.top-bar {
    background: linear-gradient(135deg, #09090b 0%, #18181b 100%) !important; 
    border-bottom: 1px solid rgba(255,255,255,0.05);
    letter-spacing: 0.3px;
    color: #a1a1aa !important;
}

/* ===== NAVBAR (GIẢM ĐỘ TRONG SUỐT) ===== */
.navbar {
    background-color: rgba(87, 9, 100, 0.95) !important; /* Gần như đặc hoàn toàn */
    backdrop-filter: blur(8px); /* Giảm blur để tránh nhòe nền */
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4) !important;
    padding-top: 0.8rem;
    padding-bottom: 0.8rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.bg-primary { background-color: var(--primary-color) !important; }
.text-primary { color: var(--primary-color) !important; }
.btn-primary { background-color: var(--primary-color) !important; border-color: var(--primary-color) !important; color: #fff !important; }
.btn-primary:hover { background-color: var(--primary-hover) !important; }

.navbar-toggler { border-color: var(--dark-border); }
.navbar-toggler-icon { filter: invert(1); }

/* ===== NAV LINKS ===== */
.navbar-nav .nav-link {
    color: #cbd5e1 !important;
    font-weight: 500;
    font-size: 0.95rem;
    padding: 8px 18px !important;
    margin: 0 4px;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.navbar-nav .nav-link:hover {
    color: #fff !important;
    background-color: var(--dark-surface);
}

.active-link {
    color: var(--primary-color) !important;
    background-color: rgba(99, 102, 241, 0.1);
}

.admin-link { color: #fca5a5 !important; }
.admin-link.active-link {
    background-color: rgba(239, 68, 68, 0.1); 
    color: #ef4444 !important;
}

/* ===== NÚT ICON ===== */
.search-btn i, .user-btn i {
    color: #94a3b8 !important;
    transition: all 0.2s ease;
}
.search-btn:hover i, .user-btn:hover i {
    color: var(--primary-color) !important;
    transform: scale(1.1);
}

.guest-avatar {
    width: 38px; 
    height: 38px;
    background-color: var(--dark-surface) !important;
    border: 1px solid var(--dark-border);
}
.user-btn:hover .guest-avatar {
    border-color: var(--primary-color);
}

.cart-btn {
    width: 42px; 
    height: 42px;
    background-color: var(--dark-surface) !important;
    border: 1px solid var(--dark-border) !important;
    transition: all 0.3s ease;
}
.cart-btn:hover {
    background-color: var(--primary-color) !important;
    border-color: var(--primary-hover) !important;
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
    transform: translateY(-2px);
}
.cart-btn i { color: #cbd5e1 !important; }
.cart-btn:hover i { color: #fff !important; }

.bg-danger { background-color: #ef4444 !important; color: #fff !important; }

/* ===== DROPDOWN MENUS (ĐẶC VÀ RÕ RÀNG) ===== */
.solid-dropdown {
    background-color: #1e293b !important; /* Nền Slate 800 đặc 100% */
    backdrop-filter: none !important; /* Loại bỏ hiệu ứng kính mờ gây khó nhìn */
    -webkit-backdrop-filter: none !important;
    border-radius: 16px !important;
    box-shadow: var(--shadow-heavy) !important; /* Bóng đổ đậm để nổi bật */
    padding: 10px !important;
    border: 1px solid #334155 !important;
    animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    transform-origin: top right;
    z-index: 1050; /* Đảm bảo luôn nằm trên cùng */
}

.dropdown-item {
    border-radius: 8px;
    padding: 10px 16px;
    font-weight: 500;
    color: #f8fafc !important; /* Chữ trắng rõ ràng */
    transition: all 0.2s ease;
}
.dropdown-item:hover {
    background-color: rgba(99, 102, 241, 0.15) !important; /* Highlight nền Indigo khi hover */
    color: #818cf8 !important; /* Chữ sáng màu khi hover */
    transform: translateX(4px);
}
.dropdown-item i { color: #94a3b8; }
.dropdown-item:hover i { color: #818cf8; }

.logout-item:hover {
    background-color: rgba(239, 68, 68, 0.15) !important;
    color: #fca5a5 !important;
}

/* ===== CART DROPDOWN SPECIFIC ===== */
.cart-dropdown {
    width: 360px;
    margin-top: 15px !important;
    background: transparent !important; 
}

.rounded-custom {
    border-radius: 16px;
    box-shadow: var(--shadow-heavy);
    border: 1px solid var(--dark-border);
    background-color: #1e293b !important; /* Đảm bảo Giỏ hàng cũng đặc màu */
}

.cart-items-list {
    max-height: 320px;
    overflow-y: auto;
}

.cart-items-list::-webkit-scrollbar { width: 6px; }
.cart-items-list::-webkit-scrollbar-track { background: var(--dark-bg); border-radius: 10px; }
.cart-items-list::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
.cart-items-list::-webkit-scrollbar-thumb:hover { background: #64748b; }

.img-wrapper img {
    object-fit: cover;
    transition: transform 0.3s ease;
    border: 1px solid var(--dark-border);
}
.cart-item:hover .img-wrapper img { transform: scale(1.05); }

.empty-icon-wrapper {
    width: 60px;
    height: 60px;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    color: #475569;
}

.checkout-btn {
    padding: 10px;
    border-radius: 10px;
    letter-spacing: 0.3px;
    color: #fff !important;
}

@keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
}

.fw-500 { font-weight: 500; }
.text-danger { color: #fca5a5 !important; }

.search-header {
    background: var(--dark-surface);
    border-radius: 10px;
    width: 250px;
    border: 1px solid var(--dark-border);
}
.search-header .form-control {
    background: transparent !important;
    color: var(--text-main);
    box-shadow: none;
}
.search-header .btn-white {
    background: transparent;
}
.search-header:focus-within {
    border-color: var(--primary-color);
}
</style>