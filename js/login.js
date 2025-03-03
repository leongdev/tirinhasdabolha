document.addEventListener('DOMContentLoaded', function() {
    const AUTH_TOKEN_KEY = 'blog_auth_token';
    const loginForm = document.getElementById('login-form');
    const errorDiv = document.getElementById('login-error');
    
    // Se já está autenticado, redireciona
    if (localStorage.getItem(AUTH_TOKEN_KEY)) {
        const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'admin.html';
        window.location.href = redirectUrl;
        return;
    }
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Oculta mensagem de erro anterior
        errorDiv.classList.add('hidden');
        
        // Credenciais fixas para demonstração
        if (username === 'admin' && password === 'admin123') {
            // Token simplificado
            const token = btoa(username + ':' + new Date().getTime());
            localStorage.setItem(AUTH_TOKEN_KEY, token);
            
            // Redireciona após login
            const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'admin.html';
            window.location.href = redirectUrl;
        } else {
            // Mostra erro
            errorDiv.classList.remove('hidden');
        }
    });
}); 