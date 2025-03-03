document.addEventListener('DOMContentLoaded', function() {
    // Carregar os posts ao iniciar a página
    loadPosts();
    
    // Criar o modal para exibir posts (adicionado ao body)
    createPostModal();

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
}); 