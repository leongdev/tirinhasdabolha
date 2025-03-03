document.addEventListener('DOMContentLoaded', function() {
    // Carregar os posts ao iniciar a página
    loadBlogPosts();
    
    // Criar o modal para exibir posts (adicionado ao body)
    createPostModal();
    
    // Adicionar classe para animação suave ao scroll
    document.body.classList.add('smooth-scroll');
    
    // Detectar scroll para efeitos na navegação
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.site-header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Função para carregar os posts do localStorage
    function loadPosts() {
        const postsContainer = document.getElementById('posts-container');
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
                <div class="col-span-full bg-white p-6 rounded-lg shadow-md text-center">
                    <p class="text-gray-500">Nenhum post encontrado. Vá para a área Admin para criar posts.</p>
                </div>
            `;
            return;
        }
        
        // Ordenar posts por data (mais recentes primeiro)
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Mostrar os posts
        posts.forEach(post => {
            const postDate = new Date(post.date).toLocaleDateString('pt-BR');
            
            const postCard = document.createElement('article');
            postCard.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300';
            postCard.innerHTML = `
                <div class="relative pb-[56.25%]">
                    <img 
                        src="${post.cover || 'https://via.placeholder.com/800x450?text=Sem+Imagem'}" 
                        alt="${post.title}" 
                        class="absolute h-full w-full object-cover"
                        onerror="this.src='https://via.placeholder.com/800x450?text=Erro+na+Imagem'"
                    >
                </div>
                <div class="p-5">
                    <h3 class="text-xl font-bold text-gray-800 mb-2">${post.title}</h3>
                    <p class="text-gray-500 text-sm mb-3">Publicado em ${postDate}</p>
                    <p class="text-gray-600 mb-4 line-clamp-3">${post.summary || extractSummaryFromContent(post.content)}</p>
                    <button 
                        class="read-more-btn bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                        data-post-id="${post.id}"
                    >
                        Ler mais
                    </button>
                </div>
            `;
            
            postsContainer.appendChild(postCard);
            
            // Adicionar evento para o botão "Ler mais"
            postCard.querySelector('.read-more-btn').addEventListener('click', function() {
                showPostDetail(post);
            });
        });
    }
    
    // Função para extrair um resumo do conteúdo (caso não exista um resumo definido)
    function extractSummaryFromContent(content) {
        // Remover marcações Markdown
        const plainText = content
            .replace(/#+\s+(.*)/g, '$1') // Títulos
            .replace(/\*\*(.*)\*\*/g, '$1') // Negrito
            .replace(/\*(.*)\*/g, '$1') // Itálico
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
            .replace(/!\[([^\]]+)\]\([^)]+\)/g, '') // Imagens
            .replace(/>(.*)/g, '$1') // Citações
            .replace(/```[^`]*```/g, '') // Blocos de código
            .replace(/`([^`]+)`/g, '$1'); // Código inline
            
        // Limitar a 150 caracteres
        if (plainText.length > 150) {
            return plainText.substring(0, 147) + '...';
        }
        return plainText;
    }
    
    // Criar o modal para exibir posts
    function createPostModal() {
        const modalHtml = `
            <div id="post-modal" class="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-start overflow-y-auto pt-4 px-4 hidden">
                <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-full flex flex-col">
                    <div class="p-4 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-lg z-10">
                        <h2 id="modal-title" class="text-xl font-bold text-gray-800"></h2>
                        <button id="close-modal" class="text-gray-500 hover:text-gray-800 focus:outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div id="modal-content" class="overflow-y-auto p-6"></div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Adicionar evento para fechar o modal
        document.getElementById('close-modal').addEventListener('click', function() {
            document.getElementById('post-modal').classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        });
        
        // Fechar modal ao clicar fora do conteúdo
        document.getElementById('post-modal').addEventListener('click', function(e) {
            if (e.target === this) {
                document.getElementById('post-modal').classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
            }
        });
        
        // Fechar modal com a tecla ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !document.getElementById('post-modal').classList.contains('hidden')) {
                document.getElementById('post-modal').classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
            }
        });
    }
    
    // Função para mostrar um post completo no modal
    function showPostDetail(post) {
        // Obter elementos do modal
        const modal = document.getElementById('post-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');
        
        // Parser Markdown para HTML
        const htmlContent = marked.parse(post.content);
        
        // Definir título
        modalTitle.textContent = post.title;
        
        // Montar conteúdo
        modalContent.innerHTML = `
            ${post.cover ? `
            <div class="w-full h-[300px] md:h-[400px] relative mb-6">
                <img 
                    src="${post.cover}" 
                    alt="${post.title}" 
                    class="absolute h-full w-full object-cover rounded-lg"
                    onerror="this.src='https://via.placeholder.com/1200x400?text=Erro+na+Imagem'"
                >
            </div>
            ` : ''}
            
            <p class="text-gray-500 mb-6">Publicado em ${new Date(post.date).toLocaleDateString('pt-BR')}</p>
            
            <div class="post-content prose prose-indigo max-w-none">
                ${htmlContent}
            </div>
        `;
        
        // Exibir modal
        modal.classList.remove('hidden');
        
        // Impedir scroll no body
        document.body.classList.add('overflow-hidden');
    }

    // Adicionar função para verificar se a imagem está no localStorage
    function getImageSrc(imagePath) {
        // Verificar se a imagem está no localStorage
        const storedImages = JSON.parse(localStorage.getItem('storedImages') || '{}');
        if (storedImages[imagePath]) {
            return storedImages[imagePath];
        }
        // Se não estiver, retornar o caminho original
        return imagePath;
    }

    // Modificar a função de renderização para usar a função getImageSrc
    function renderPosts(posts) {
        // Find the container using the class name from index.html
        const postsContainer = document.querySelector('.blog-container');
        if (!postsContainer) {
            console.error('Blog container not found');
            return;
        }
        
        postsContainer.innerHTML = '';
        
        if (posts.length === 0) {
            postsContainer.innerHTML = '<p class="text-center text-gray-500 my-8">Nenhum post encontrado.</p>';
            return;
        }
        
        posts.forEach(post => {
            // Obter o caminho da imagem correto
            const coverImageSrc = getImageSrc(post.coverImage);
            
            const postElement = document.createElement('article');
            postElement.className = 'bg-white rounded-lg shadow-md overflow-hidden mb-8';
            postElement.innerHTML = `
                <div class="flex flex-col md:flex-row">
                    ${post.coverImage ? `
                    <div class="md:w-1/3 h-48 md:h-auto">
                        <img src="${coverImageSrc}" alt="${post.title}" class="w-full h-full object-cover">
                    </div>` : ''}
                    <div class="p-6 md:w-2/3">
                        <h2 class="text-2xl font-bold mb-2">${post.title}</h2>
                        <p class="text-gray-500 text-sm mb-4">${formatDate(post.createdAt)}</p>
                        <p class="text-gray-700 mb-4">${post.summary || ''}</p>
                        <a href="post.html?id=${post.id}" class="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">Ler mais</a>
                    </div>
                </div>
            `;
            postsContainer.appendChild(postElement);
        });
    }

    // Adicionar função para processar o conteúdo markdown e substituir imagens
    function processMarkdownContent(content) {
        // Substituir URLs de imagens no markdown
        const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
        const processedContent = content.replace(imgRegex, (match, alt, src) => {
            const imageSrc = getImageSrc(src);
            return `![${alt}](${imageSrc})`;
        });
        
        // Retornar o conteúdo processado
        return marked.parse(processedContent);
    }

    // Modificar a função de renderização do post para usar processMarkdownContent
    function renderPost(post) {
        document.title = `${post.title} - Meu Blog`;
        
        const postContainer = document.getElementById('post-container');
        
        // Obter o caminho da imagem correto para a capa
        const coverImageSrc = post.coverImage ? getImageSrc(post.coverImage) : null;
        
        postContainer.innerHTML = `
            <article class="bg-white rounded-lg shadow-md overflow-hidden">
                ${post.coverImage ? `
                <div class="h-64 md:h-96 w-full">
                    <img src="${coverImageSrc}" alt="${post.title}" class="w-full h-full object-cover">
                </div>` : ''}
                <div class="p-6">
                    <h1 class="text-3xl font-bold mb-2">${post.title}</h1>
                    <p class="text-gray-500 text-sm mb-6">${formatDate(post.createdAt)}</p>
                    <div class="prose max-w-none">
                        ${processMarkdownContent(post.content)}
                    </div>
                </div>
            </article>
        `;
    }

    // Configurações do blog
    const blogConfig = {
        postsPerPage: 6,
        currentPage: 1,
        totalPosts: 0
    };

    // Função para carregar os posts do blog
    function loadBlogPosts() {
        // Simulação de requisição a API ou dados do servidor
        fetch('api/posts.json')  // Ajuste para o endpoint real de sua API
            .then(response => response.json())
            .then(data => {
                blogConfig.totalPosts = data.length;
                displayFeaturedPosts(data.filter(post => post.featured));
                displayBlogPosts(data);
                setupPagination();
            })
            .catch(error => {
                console.error('Erro ao carregar os posts:', error);
                // Exibir mensagem de erro para o usuário
                document.getElementById('blog-posts-container').innerHTML = 
                    '<div class="error-message">Não foi possível carregar os posts. Tente novamente mais tarde.</div>';
            });
    }

    // Exibir posts em destaque
    function displayFeaturedPosts(featuredPosts) {
        const container = document.getElementById('featured-posts-container');
        
        if (!featuredPosts.length) {
            container.innerHTML = '<p>Não há posts em destaque no momento.</p>';
            return;
        }
        
        let html = '';
        
        featuredPosts.slice(0, 3).forEach(post => {
            html += `
                <div class="blog-card featured">
                    <img src="${post.image}" alt="${post.title}">
                    <div class="blog-content">
                        <h3 class="blog-title">${post.title}</h3>
                        <p class="blog-excerpt">${post.excerpt}</p>
                        <div class="blog-meta">
                            <span>${formatDate(post.date)}</span>
                            <span>${post.author}</span>
                        </div>
                        <a href="post.html?id=${post.id}" class="read-more">Ler mais</a>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    // Exibir todos os posts do blog (com paginação)
    function displayBlogPosts(posts) {
        const container = document.getElementById('blog-posts-container');
        const startIndex = (blogConfig.currentPage - 1) * blogConfig.postsPerPage;
        const endIndex = startIndex + blogConfig.postsPerPage;
        
        const postsToDisplay = posts.slice(startIndex, endIndex);
        
        if (!postsToDisplay.length) {
            container.innerHTML = '<p>Não há posts disponíveis no momento.</p>';
            return;
        }
        
        let html = '';
        
        postsToDisplay.forEach(post => {
            html += `
                <div class="blog-card">
                    <img src="${post.image}" alt="${post.title}">
                    <div class="blog-content">
                        <h3 class="blog-title">${post.title}</h3>
                        <p class="blog-excerpt">${post.excerpt}</p>
                        <div class="blog-meta">
                            <span>${formatDate(post.date)}</span>
                            <span>${post.author}</span>
                        </div>
                        <a href="post.html?id=${post.id}" class="read-more">Ler mais</a>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Animar o aparecimento dos cards
        const cards = container.querySelectorAll('.blog-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 * index);
        });
    }

    // Configurar a paginação
    function setupPagination() {
        const totalPages = Math.ceil(blogConfig.totalPosts / blogConfig.postsPerPage);
        const paginationContainer = document.getElementById('pagination');
        
        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }
        
        let html = '';
        
        // Botão anterior
        html += `<button class="pagination-button prev" ${blogConfig.currentPage === 1 ? 'disabled' : ''}>Anterior</button>`;
        
        // Botões de páginas
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 || 
                i === totalPages || 
                (i >= blogConfig.currentPage - 1 && i <= blogConfig.currentPage + 1)
            ) {
                html += `<button class="pagination-button page ${i === blogConfig.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            } else if (
                i === blogConfig.currentPage - 2 || 
                i === blogConfig.currentPage + 2
            ) {
                html += `<span class="pagination-ellipsis">...</span>`;
            }
        }
        
        // Botão próximo
        html += `<button class="pagination-button next" ${blogConfig.currentPage === totalPages ? 'disabled' : ''}>Próximo</button>`;
        
        paginationContainer.innerHTML = html;
        
        // Adicionar eventos aos botões de paginação
        paginationContainer.querySelectorAll('.pagination-button.page').forEach(button => {
            button.addEventListener('click', () => {
                blogConfig.currentPage = parseInt(button.dataset.page);
                loadBlogPosts();
                window.scrollTo({
                    top: document.querySelector('.blog-listing').offsetTop - 100,
                    behavior: 'smooth'
                });
            });
        });
        
        // Evento para botão anterior
        const prevButton = paginationContainer.querySelector('.pagination-button.prev');
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (blogConfig.currentPage > 1) {
                    blogConfig.currentPage--;
                    loadBlogPosts();
                    window.scrollTo({
                        top: document.querySelector('.blog-listing').offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            });
        }
        
        // Evento para botão próximo
        const nextButton = paginationContainer.querySelector('.pagination-button.next');
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                if (blogConfig.currentPage < totalPages) {
                    blogConfig.currentPage++;
                    loadBlogPosts();
                    window.scrollTo({
                        top: document.querySelector('.blog-listing').offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            });
        }
    }

    // Função auxiliar para formatar datas
    function formatDate(dateString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    }
}); 