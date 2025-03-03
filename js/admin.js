document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação apenas se estivermos na página admin.html
    if (window.location.pathname.includes('admin.html')) {
        // Verificar se o usuário está logado
        const isAuthenticated = localStorage.getItem('authenticated') === 'true';
        
        if (!isAuthenticated) {
            // Redirecionar para login apenas se não estiver autenticado
            // e adicionar um parâmetro para evitar loops
            if (!window.location.href.includes('redirected=true')) {
                window.location.href = 'login.html?redirected=true&from=admin';
            }
            return;
        }
        
        // Inicializar a interface admin apenas se autenticado
        initAdminInterface();
    }
});

function initAdminInterface() {
    // Inicializar editor Quill
    const quill = new Quill('#editor-container', {
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'color': [] }, { 'background': [] }],
                ['link'],
                ['clean']
            ]
        },
        placeholder: 'Escreva seu conteúdo aqui...',
        theme: 'snow'
    });
    
    // Variáveis para gerenciamento de estado
    let currentPostId = null;
    let currentMode = 'create';
    
    // Navegação entre seções
    const navigationLinks = document.querySelectorAll('.admin-menu a');
    const sections = document.querySelectorAll('.admin-section');
    
    navigationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            
            // Atualizar links ativos
            navigationLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar seção correta
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection + '-section') {
                    section.classList.add('active');
                }
            });
            
            // Carregar dados específicos da seção
            if (targetSection === 'posts') {
                loadPosts();
            } else if (targetSection === 'stats') {
                loadStats();
            }
        });
    });
    
    // Manipulação de upload de imagem de capa
    const postImageInput = document.getElementById('post-image');
    const imagePreview = document.getElementById('image-preview');
    
    postImageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            // Usar o ImageUploader para processar a imagem
            window.imageUploader.uploadImage(file)
                .then(result => {
                    // Salvar o ID da imagem no data do preview
                    imagePreview.dataset.imageId = result.id;
                    
                    // Atualizar preview
                    imagePreview.style.backgroundImage = `url(${result.url})`;
                    imagePreview.innerHTML = '';
                    imagePreview.classList.add('has-image');
                })
                .catch(error => {
                    alert('Erro ao carregar imagem: ' + error.message);
                });
        }
    });
    
    // Inserir imagem no conteúdo
    const insertImageBtn = document.getElementById('insert-image-btn');
    const contentImageInput = document.getElementById('content-image');
    
    insertImageBtn.addEventListener('click', function() {
        contentImageInput.click();
    });
    
    contentImageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            window.imageUploader.uploadImage(file)
                .then(result => {
                    // Inserir imagem no editor
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, 'image', result.url);
                    quill.setSelection(range.index + 1);
                })
                .catch(error => {
                    alert('Erro ao inserir imagem: ' + error.message);
                });
        }
    });
    
    // Formulário de criação/edição de post
    const postForm = document.getElementById('post-form');
    
    postForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obter valores do formulário
        const title = document.getElementById('post-title').value.trim();
        const excerpt = document.getElementById('post-excerpt').value.trim();
        const imageId = imagePreview.dataset.imageId || null;
        const content = quill.root.innerHTML;
        const isFeatured = document.getElementById('post-featured').checked;
        
        // Validação básica
        if (!title) {
            alert('O título é obrigatório');
            return;
        }
        
        // Criar objeto do post
        const post = {
            id: currentPostId || 'post_' + new Date().getTime(),
            title,
            excerpt,
            imageId,
            content,
            featured: isFeatured,
            date: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
        
        // Salvar post
        savePost(post);
        
        // Resetar formulário e estado
        resetForm();
        
        // Exibir feedback
        alert(currentMode === 'create' ? 'Post criado com sucesso!' : 'Post atualizado com sucesso!');
        
        // Redirecionar para a lista de posts
        document.querySelector('[data-section="posts"]').click();
    });
    
    // Função para salvar post
    function savePost(post) {
        // Obter posts existentes
        let posts = [];
        try {
            const storedPosts = localStorage.getItem('blog-posts');
            if (storedPosts) {
                posts = JSON.parse(storedPosts);
            }
        } catch (error) {
            console.error('Erro ao carregar posts:', error);
        }
        
        // Verificar se é edição ou criação
        const existingPostIndex = posts.findIndex(p => p.id === post.id);
        
        if (existingPostIndex !== -1) {
            // Atualizar post existente
            posts[existingPostIndex] = post;
        } else {
            // Adicionar novo post
            posts.push(post);
        }
        
        // Salvar no localStorage
        localStorage.setItem('blog-posts', JSON.stringify(posts));
    }
    
    // Função para resetar formulário
    function resetForm() {
        postForm.reset();
        quill.root.innerHTML = '';
        imagePreview.style.backgroundImage = '';
        imagePreview.innerHTML = '<span>Nenhuma imagem selecionada</span>';
        imagePreview.classList.remove('has-image');
        delete imagePreview.dataset.imageId;
        currentPostId = null;
        currentMode = 'create';
    }
    
    // Carregar lista de posts
    function loadPosts() {
        const postsList = document.getElementById('posts-list');
        let posts = [];
        
        try {
            const storedPosts = localStorage.getItem('blog-posts');
            if (storedPosts) {
                posts = JSON.parse(storedPosts);
            }
        } catch (error) {
            console.error('Erro ao carregar posts:', error);
        }
        
        // Limpar lista
        postsList.innerHTML = '';
        
        if (posts.length === 0) {
            postsList.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">Nenhum post encontrado</td>
                </tr>
            `;
            return;
        }
        
        // Ordenar posts (mais recentes primeiro)
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Mostrar posts na tabela
        posts.forEach(post => {
            const row = document.createElement('tr');
            
            const formattedDate = new Date(post.date).toLocaleDateString('pt-BR');
            
            row.innerHTML = `
                <td>${post.title}</td>
                <td>${formattedDate}</td>
                <td>${post.featured ? '<span class="featured-badge">Destaque</span>' : 'Regular'}</td>
                <td>
                    <div class="post-actions">
                        <button class="edit-btn" data-id="${post.id}">Editar</button>
                        <button class="delete-btn" data-id="${post.id}">Excluir</button>
                    </div>
                </td>
            `;
            
            postsList.appendChild(row);
        });
        
        // Adicionar eventos para os botões
        postsList.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                editPost(this.getAttribute('data-id'));
            });
        });
        
        postsList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                deletePost(this.getAttribute('data-id'));
            });
        });
    }
    
    // Função para editar post
    function editPost(postId) {
        let posts = [];
        try {
            const storedPosts = localStorage.getItem('blog-posts');
            if (storedPosts) {
                posts = JSON.parse(storedPosts);
            }
        } catch (error) {
            console.error('Erro ao carregar posts:', error);
        }
        
        const post = posts.find(p => p.id === postId);
        
        if (!post) {
            alert('Post não encontrado');
            return;
        }
        
        // Mudar para a seção de formulário
        document.querySelector('[data-section="new-post"]').click();
        
        // Preencher formulário
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-excerpt').value = post.excerpt || '';
        document.getElementById('post-featured').checked = post.featured || false;
        
        // Preencher editor
        quill.root.innerHTML = post.content;
        
        // Configurar imagem se existir
        if (post.imageId) {
            const imageUrl = window.imageUploader.getImageUrl(post.imageId);
            if (imageUrl) {
                imagePreview.style.backgroundImage = `url(${imageUrl})`;
                imagePreview.innerHTML = '';
                imagePreview.classList.add('has-image');
                imagePreview.dataset.imageId = post.imageId;
            }
        }
        
        // Atualizar estado
        currentPostId = postId;
        currentMode = 'edit';
    }
    
    // Função para excluir post
    function deletePost(postId) {
        if (!confirm('Tem certeza que deseja excluir este post?')) {
            return;
        }
        
        let posts = [];
        try {
            const storedPosts = localStorage.getItem('blog-posts');
            if (storedPosts) {
                posts = JSON.parse(storedPosts);
            }
        } catch (error) {
            console.error('Erro ao carregar posts:', error);
        }
        
        // Filtrar posts para remover o selecionado
        const updatedPosts = posts.filter(p => p.id !== postId);
        
        // Salvar no localStorage
        localStorage.setItem('blog-posts', JSON.stringify(updatedPosts));
        
        // Atualizar lista
        loadPosts();
        
        // Atualizar estatísticas
        if (document.getElementById('stats-section').classList.contains('active')) {
            loadStats();
        }
    }
    
    // Carregar estatísticas
    function loadStats() {
        let posts = [];
        try {
            const storedPosts = localStorage.getItem('blog-posts');
            if (storedPosts) {
                posts = JSON.parse(storedPosts);
            }
        } catch (error) {
            console.error('Erro ao carregar posts:', error);
        }
        
        // Total de posts
        document.getElementById('total-posts').textContent = posts.length;
        
        // Posts em destaque
        const featuredCount = posts.filter(p => p.featured).length;
        document.getElementById('featured-posts').textContent = featuredCount;
        
        // Data do último post
        let lastPostDate = '-';
        if (posts.length > 0) {
            posts.sort((a, b) => new Date(b.date) - new Date(a.date));
            lastPostDate = new Date(posts[0].date).toLocaleDateString('pt-BR');
        }
        document.getElementById('last-post-date').textContent = lastPostDate;
    }
    
    // Botão de pré-visualização
    document.getElementById('preview-btn').addEventListener('click', function() {
        const title = document.getElementById('post-title').value.trim();
        const content = quill.root.innerHTML;
        
        if (!title || !content) {
            alert('Preencha pelo menos o título e o conteúdo para pré-visualizar');
            return;
        }
        
        // Criar janela de pré-visualização
        const previewWindow = window.open('', '_blank');
        
        // Estilo e conteúdo
        previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Pré-visualização: ${title}</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
                <style>
                    body {
                        font-family: 'Roboto', sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    h1 {
                        font-size: 2rem;
                        margin-bottom: 1rem;
                    }
                    .content img {
                        max-width: 100%;
                        height: auto;
                        border-radius: 6px;
                        margin: 1rem 0;
                    }
                    .preview-info {
                        background-color: #f0f7ff;
                        padding: 10px;
                        border-radius: 6px;
                        margin-bottom: 20px;
                        border-left: 4px solid #0066cc;
                    }
                </style>
            </head>
            <body>
                <div class="preview-info">
                    <p><strong>PRÉ-VISUALIZAÇÃO</strong> - Este é apenas um preview e não representa o layout final do post publicado.</p>
                </div>
                <h1>${title}</h1>
                <div class="content">
                    ${content}
                </div>
            </body>
            </html>
        `);
    });
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('authenticated');
        window.location.href = 'login.html';
    });
    
    // Inicializar a página carregando a lista de posts
    loadPosts();
}

function setupEventListeners() {
    // Evento para logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('authenticated');
            window.location.href = 'login.html';
        });
    }
    
    // Outros event listeners globais podem ser adicionados aqui
}

setupEventListeners(); 