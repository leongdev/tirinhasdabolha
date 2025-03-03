// Constantes para armazenamento
const AUTH_TOKEN_KEY = 'blog_auth_token';
const POSTS_STORAGE_KEY = 'blogPosts';

// Verifica se o usuário está autenticado
function isAuthenticated() {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
}

// Atualiza a UI baseado no estado de autenticação
function updateAuthUI() {
    const adminLinks = document.querySelectorAll('.admin-link');
    const loginLink = document.getElementById('login-link');
    
    if (isAuthenticated()) {
        // Mostra links de admin e esconde login
        adminLinks.forEach(link => {
            link.style.display = 'inline-block';
        });
        if (loginLink) loginLink.style.display = 'none';
        
        // Configura o logout se existir
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
        
        // Configura link para área admin
        const adminLink = document.querySelector('.admin-link');
        if (adminLink && adminLink !== logoutBtn) {
            adminLink.href = 'admin.html';
        }
    } else {
        // Esconde links de admin e mostra login
        adminLinks.forEach(link => {
            link.style.display = 'none';
        });
        if (loginLink) loginLink.style.display = 'inline-block';
    }
}

// Protege páginas administrativas
function protectAdminRoute() {
    if (!isAuthenticated() && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
        return false;
    }
    return true;
}

// Login
function login(username, password) {
    // Simplificado para demo - em produção usaria backend
    if (username === 'admin' && password === 'admin123') {
        // Token simplificado - em produção usaria JWT
        const token = btoa(username + ':' + new Date().getTime());
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        return true;
    }
    return false;
}

// Logout
function logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    window.location.href = 'index.html';
} 