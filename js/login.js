document.addEventListener('DOMContentLoaded', function() {
    // Verificar se já está autenticado
    const isAuthenticated = localStorage.getItem('authenticated') === 'true';
    
    // Se já estiver autenticado e estiver na página de login, redirecionar
    if (isAuthenticated && window.location.pathname.includes('login.html')) {
        const params = new URLSearchParams(window.location.search);
        const fromPage = params.get('from');
        
        if (fromPage === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'index.html';
        }
        return;
    }
    
    // Configuração do formulário de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Verificação simples (substitua por sua própria lógica de autenticação)
            if (username === 'admin' && password === 'senha123') {
                localStorage.setItem('authenticated', 'true');
                
                // Redirecionar para a página correta
                const params = new URLSearchParams(window.location.search);
                const fromPage = params.get('from');
                
                if (fromPage === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'index.html';
                }
            } else {
                // Exibir mensagem de erro
                const errorMessage = document.getElementById('error-message');
                if (errorMessage) {
                    errorMessage.textContent = 'Usuário ou senha incorretos';
                    errorMessage.classList.remove('hidden');
                }
            }
        });
    }
}); 