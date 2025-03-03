document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação antes de tudo
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Adicionar botão de logout ao cabeçalho
    const nav = document.querySelector('header nav ul');
    const logoutItem = document.createElement('li');
    logoutItem.innerHTML = `
        <button id="logout-btn" class="text-gray-600 hover:text-red-600 transition-colors">Logout</button>
    `;
    nav.appendChild(logoutItem);
    
    // Adicionar evento ao botão de logout
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem('blog-auth');
        window.location.href = 'login.html';
    });
    
    // Variáveis globais
    let editor;
    let currentPostId = null;
    
    // Inicializar o editor de Markdown
    initEditor();
    
    // Carregar os posts existentes
    loadAdminPosts();
    
    // Adicionar event listeners
    document.getElementById('new-post-btn').addEventListener('click', showPostEditor);
    document.getElementById('save-post-btn').addEventListener('click', savePost);
    document.getElementById('cancel-post-btn').addEventListener('click', hidePostEditor);
    document.getElementById('export-btn').addEventListener('click', exportPosts);
    document.getElementById('import-file').addEventListener('change', importPosts);
    document.getElementById('clear-btn').addEventListener('click', clearAllPosts);
    
    // Inicializar o editor de Markdown
    function initEditor() {
        editor = new EasyMDE({
            element: document.getElementById('post-content'),
            autofocus: true,
            spellChecker: false,
            placeholder: "Escreva seu post usando Markdown...",
            status: ['lines', 'words', 'cursor'],
            toolbar: [
                'bold', 'italic', 'heading', '|',
                'quote', 'unordered-list', 'ordered-list', '|',
                'link', 'image', '|',
                'preview', 'side-by-side', 'fullscreen', '|',
                'guide'
            ],
            uploadImage: true,
            imageUploadFunction: function(file, onSuccess, onError) {
                // Exemplo: converter a imagem para base64 e inserir
                const reader = new FileReader();
                reader.onload = function() {
                    onSuccess(reader.result);
                };
                reader.onerror = function() {
                    onError('Erro ao carregar a imagem');
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Mostrar o editor de posts
    function showPostEditor() {
        // Resetar o editor
        currentPostId = null;
        document.getElementById('post-title').value = '';
        document.getElementById('post-cover').value = '';
        document.getElementById('post-summary').value = '';
        editor.value('');
        
        // Mostrar o editor
        document.getElementById('post-editor').classList.remove('hidden');
        
        // Rolar até o editor
        document.getElementById('post-editor').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Esconder o editor de posts
    function hidePostEditor() {
        document.getElementById('post-editor').classList.add('hidden');
    }
    
    // Salvar um post
    function savePost() {
        const title = document.getElementById('post-title').value.trim();
        const cover = document.getElementById('post-cover').value.trim();
        const summary = document.getElementById('post-summary').value.trim();
        const content = editor.value().trim();
        
        // Validação básica
        if (!title) {
            alert('Por favor, insira um título para o post.');
            return;
        }
        
        if (!content) {
            alert('Por favor, escreva algum conteúdo para o post.');
            return;
        }
        
        // Carregar posts existentes
        let posts = [];
        try {
            const storedPosts = localStorage.getItem('blog-posts');
            if (storedPosts) {
                posts = JSON.parse(storedPosts);
            }
        } catch (error) {
            console.error('Erro ao carregar posts:', error);
        }
        
        // Criar ou atualizar o post
        if (currentPostId) {
            // Atualizar post existente
            const index = posts.findIndex(post => post.id === currentPostId);
            
            if (index !== -1) {
                posts[index] = {
                    ...posts[index],
                    title,
                    cover,
                    summary,
                    content,
                    updated: new Date().toISOString()
                };
            }
        } else {
            // Criar novo post
            const newPost = {
                id: Date.now().toString(),
                title,
                cover,
                summary,
                content,
                date: new Date().toISOString(),
                updated: null
            };
            
            posts.push(newPost);
        }
        
        // Salvar os posts
        try {
            localStorage.setItem('blog-posts', JSON.stringify(posts));
            hidePostEditor();
            loadAdminPosts();
            
            // Feedback
            alert(`Post ${currentPostId ? 'atualizado' : 'criado'} com sucesso!`);
        } catch (error) {
            console.error('Erro ao salvar post:', error);
            alert('Erro ao salvar o post. Consulte o console para mais detalhes.');
        }
    }
    
    // Carregar posts na área admin
    function loadAdminPosts() {
        const postsContainer = document.getElementById('admin-posts-container');
        let posts = [];
        
        try {
            const storedPosts = localStorage.getItem('blog-posts');
            if (storedPosts) {
                posts = JSON.parse(storedPosts);
            }
        } catch (error) {
            console.error('Erro ao carregar posts:', error);
        }
        
        // Limpar o container
        postsContainer.innerHTML = '';
        
        if (posts.length === 0) {
            postsContainer.innerHTML = `
                <p class="py-4 text-gray-500">Nenhum post encontrado. Clique em "Novo Post" para começar.</p>
            `;
            return;
        }
        
        // Ordenar posts por data (mais recentes primeiro)
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Mostrar os posts
        posts.forEach(post => {
            const postDate = new Date(post.date).toLocaleDateString('pt-BR');
            const postItem = document.createElement('div');
            postItem.className = 'py-4';
            postItem.innerHTML = `
                <div class="flex justify-between items-center">
                    <div>
                        <h4 class="text-lg font-semibold">${post.title}</h4>
                        <p class="text-sm text-gray-500">Publicado em ${postDate}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button class="edit-post-btn bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors" data-post-id="${post.id}">
                            Editar
                        </button>
                        <button class="delete-post-btn bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors" data-post-id="${post.id}">
                            Excluir
                        </button>
                    </div>
                </div>
            `;
            
            postsContainer.appendChild(postItem);
            
            // Adicionar eventos aos botões
            postItem.querySelector('.edit-post-btn').addEventListener('click', function() {
                editPost(post.id);
            });
            
            postItem.querySelector('.delete-post-btn').addEventListener('click', function() {
                deletePost(post.id);
            });
        });
    }
    
    // Editar um post existente
    function editPost(postId) {
        try {
            const storedPosts = localStorage.getItem('blog-posts');
            if (storedPosts) {
                const posts = JSON.parse(storedPosts);
                const post = posts.find(p => p.id === postId);
                
                if (post) {
                    // Preencher o editor com os dados do post
                    currentPostId = postId;
                    document.getElementById('post-title').value = post.title;
                    document.getElementById('post-cover').value = post.cover || '';
                    document.getElementById('post-summary').value = post.summary || '';
                    editor.value(post.content);
                    
                    // Mostrar o editor
                    document.getElementById('post-editor').classList.remove('hidden');
                    
                    // Rolar até o editor
                    document.getElementById('post-editor').scrollIntoView({ behavior: 'smooth' });
                }
            }
        } catch (error) {
            console.error('Erro ao editar post:', error);
        }
    }
    
    // Excluir um post
    function deletePost(postId) {
        if (!confirm('Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.')) {
            return;
        }
        
        try {
            const storedPosts = localStorage.getItem('blog-posts');
            if (storedPosts) {
                let posts = JSON.parse(storedPosts);
                posts = posts.filter(post => post.id !== postId);
                
                localStorage.setItem('blog-posts', JSON.stringify(posts));
                loadAdminPosts();
                
                // Feedback
                alert('Post excluído com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao excluir post:', error);
        }
    }
    
    // Exportar todos os posts
    function exportPosts() {
        try {
            const storedPosts = localStorage.getItem('blog-posts');
            if (!storedPosts || JSON.parse(storedPosts).length === 0) {
                alert('Não há posts para exportar.');
                return;
            }
            
            // Criar arquivo para download
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(storedPosts);
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "blog-posts-" + new Date().toISOString().split('T')[0] + ".json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            
            // Feedback
            alert('Posts exportados com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar posts:', error);
            alert('Erro ao exportar posts. Consulte o console para mais detalhes.');
        }
    }
    
    // Importar posts
    function importPosts(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const importedPosts = JSON.parse(e.target.result);
                
                if (!Array.isArray(importedPosts)) {
                    throw new Error('Formato de arquivo inválido.');
                }
                
                if (!confirm(`Tem certeza que deseja importar ${importedPosts.length} posts? Isso substituirá todos os posts existentes.`)) {
                    return;
                }
                
                localStorage.setItem('blog-posts', JSON.stringify(importedPosts));
                loadAdminPosts();
                
                // Resetar o input de arquivo
                document.getElementById('import-file').value = '';
                
                // Feedback
                alert('Posts importados com sucesso!');
            } catch (error) {
                console.error('Erro ao importar posts:', error);
                alert('Erro ao importar posts. Verifique se o arquivo está no formato correto.');
            }
        };
        
        reader.readAsText(file);
    }
    
    // Limpar todos os posts
    function clearAllPosts() {
        if (!confirm('ATENÇÃO: Tem certeza que deseja excluir TODOS os posts? Esta ação não pode ser desfeita.')) {
            return;
        }
        
        if (!confirm('Esta ação excluirá permanentemente todos os seus posts. Digite CONFIRMAR para prosseguir.')) {
            return;
        }
        
        try {
            localStorage.removeItem('blog-posts');
            loadAdminPosts();
            
            // Feedback
            alert('Todos os posts foram excluídos com sucesso!');
        } catch (error) {
            console.error('Erro ao limpar posts:', error);
            alert('Erro ao limpar posts. Consulte o console para mais detalhes.');
        }
    }
    
    // Função para verificar autenticação
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