document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    if (postId) {
        loadAndDisplayPost(postId);
    } else {
        redirectToHome();
    }
});

function loadAndDisplayPost(postId) {
    const posts = JSON.parse(localStorage.getItem('blog-posts') || '[]');
    const post = posts.find(p => p.id === postId);
    
    if (post) {
        renderPost(post);
    } else {
        redirectToHome();
    }
}

function redirectToHome() {
    window.location.href = 'index.html';
}

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

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

function getImageSrc(imagePath) {
    // Verificar se a imagem está no localStorage
    const storedImages = JSON.parse(localStorage.getItem('storedImages') || '{}');
    if (storedImages[imagePath]) {
        return storedImages[imagePath];
    }
    // Se não estiver, retornar o caminho original
    return imagePath;
}

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