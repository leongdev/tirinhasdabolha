console.log('Blog.js loaded successfully');

// Constants
const STORAGE_KEY = 'blogPosts';

// Main function to load posts
function loadPosts() {
    console.log('loadPosts function called');
    
    try {
        // Get container elements
        const featuredContainer = document.getElementById('featured-posts-container');
        const postsContainer = document.getElementById('blog-posts-container');
        
        if (!featuredContainer && !postsContainer) {
            console.log('Not on index page, containers not found');
            return; // Not on index page
        }
        
        // Get posts from localStorage
        const posts = getPostsFromStorage();
        console.log(`Retrieved ${posts.length} posts from storage`);
        
        // Handle empty posts case
        if (posts.length === 0) {
            const emptyMessage = '<div class="no-posts">Nenhum post encontrado. Adicione posts na área administrativa.</div>';
            if (featuredContainer) featuredContainer.innerHTML = emptyMessage;
            if (postsContainer) postsContainer.innerHTML = emptyMessage;
            return;
        }
        
        // Display featured posts
        if (featuredContainer) {
            let featured = posts.filter(post => post.featured).slice(0, 3);
            
            // If no featured posts, use most recent
            if (featured.length === 0) {
                featured = [...posts]
                    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                    .slice(0, 3);
            }
            
            console.log(`Displaying ${featured.length} featured posts`);
            featuredContainer.innerHTML = featured.map(renderPostCard).join('');
        }
        
        // Display all posts
        if (postsContainer) {
            console.log(`Displaying all ${posts.length} posts`);
            postsContainer.innerHTML = posts.map(renderPostCard).join('');
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        
        // Show error message
        const errorMsg = '<div class="no-posts">Erro ao carregar posts. Por favor, tente novamente.</div>';
        const featuredContainer = document.getElementById('featured-posts-container');
        const postsContainer = document.getElementById('blog-posts-container');
        
        if (featuredContainer) featuredContainer.innerHTML = errorMsg;
        if (postsContainer) postsContainer.innerHTML = errorMsg;
    }
}

// Helper function to get posts from storage
function getPostsFromStorage() {
    try {
        // Check primary storage key first
        let storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            const parsed = JSON.parse(storedData);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
        
        // Try legacy keys
        const legacyKeys = ['posts', 'allPosts', 'blog-posts'];
        for (const key of legacyKeys) {
            storedData = localStorage.getItem(key);
            if (storedData) {
                try {
                    const parsed = JSON.parse(storedData);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        // Save to the new key for future use
                        localStorage.setItem(STORAGE_KEY, storedData);
                        console.log(`Migrated posts from "${key}" to "${STORAGE_KEY}"`);
                        return parsed;
                    }
                } catch (e) {
                    console.warn(`Failed to parse data from "${key}":`, e);
                }
            }
        }
        
        // No posts found
        return [];
    } catch (error) {
        console.error('Error getting posts from storage:', error);
        return [];
    }
}

// Helper to render a post card
function renderPostCard(post) {
    return `
        <div class="blog-card">
            ${post.imageSrc ? `<div class="post-image"><img src="${escapeHtml(post.imageSrc)}" alt="${escapeHtml(post.title || 'Imagem do post')}"></div>` : ''}
            <div class="card-content">
                <h3>${escapeHtml(post.title || 'Sem título')}</h3>
                <p class="post-date">${formatDate(post.date)}</p>
                <div class="post-excerpt">${getExcerpt(post.excerpt || post.content || '')}</div>
                <a href="post.html?id=${post.id || ''}" class="read-more">Ler mais</a>
            </div>
        </div>
    `;
}

// Utility functions
function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatDate(dateString) {
    if (!dateString) return 'Data não especificada';
    
    try {
        return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (e) {
        return 'Data inválida';
    }
}

function getExcerpt(content) {
    if (!content) return 'Sem conteúdo';
    
    // Remove HTML tags
    const plainText = String(content).replace(/<[^>]*>/g, '');
    
    // Limit to 150 characters
    return plainText.length > 150 
        ? plainText.substring(0, 150) + '...' 
        : plainText;
}

// Aliases for backward compatibility
const loadBlogPosts = loadPosts;
const loadAndDisplayPosts = loadPosts;

// Auto-load when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOMContentLoaded event fired in blog.js');
    });
} else {
    console.log('Document already loaded when blog.js executed');
}

console.log('Blog.js finished loading'); 