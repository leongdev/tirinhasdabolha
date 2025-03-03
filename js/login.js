document.addEventListener('DOMContentLoaded', function() {
    // Verificar se já está autenticado
    if (isAuthenticated()) {
        window.location.href = 'admin.html';
        return;
    }
    
    // Adicionar evento ao formulário de login
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        // Credenciais padrão (em produção, use um sistema mais seguro)
        // Normalmente essas credenciais viriam de um backend
        const validUsername = 'admin';
        const validPassword = 'admin123';
        
        if (username === validUsername && password === validPassword) {
            // Login bem-sucedido
            const sessionToken = generateSessionToken();
            
            // Salvar token de autenticação (expira em 24 horas)
            const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
            localStorage.setItem('blog-auth', JSON.stringify({
                token: sessionToken,
                expiry: expiryTime
            }));
            
            // Redirecionar para a área admin
            window.location.href = 'admin.html';
        } else {
            // Login falhou
            document.getElementById('login-error').classList.remove('hidden');
            
            // Limpar senha
            document.getElementById('password').value = '';
        }
    });
    
    // Função para gerar um token de sessão aleatório
    function generateSessionToken() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }
    
    // Verificar se está autenticado
    function isAuthenticated() {
        try {
            const auth = JSON.parse(localStorage.getItem('blog-auth'));
            if (!auth) return false;
            
            // Verificar se a sessão expirou
            if (Date.now() > auth.expiry) {
                localStorage.removeItem('blog-auth');
                return false;
            }
            
            return true;
        } catch (error) {
            return false;
        }
    }
}); 