// Função para gerar um nome de arquivo único
function generateUniqueFileName(file) {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    return `image_${timestamp}_${randomString}.${extension}`;
}

// Gerenciador de Upload de Imagens
class ImageUploader {
    constructor() {
        this.storedImages = this.loadStoredImages();
        this.uploadPath = 'assets/images/';
        this.setupEventListeners();
        this.ensureUploadDirectoryExists();
    }
    
    // Carregar imagens do localStorage
    loadStoredImages() {
        try {
            const storedImages = localStorage.getItem('storedImages');
            return storedImages ? JSON.parse(storedImages) : {};
        } catch (error) {
            console.error('Erro ao carregar imagens:', error);
            return {};
        }
    }
    
    // Salvar imagens no localStorage
    saveStoredImages() {
        localStorage.setItem('storedImages', JSON.stringify(this.storedImages));
    }
    
    // Processar upload de imagem
    uploadImage(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('Nenhum arquivo fornecido'));
                return;
            }
            
            // Verificar se é uma imagem
            if (!file.type.match('image.*')) {
                reject(new Error('O arquivo deve ser uma imagem'));
                return;
            }
            
            // Verificar tamanho do arquivo (máximo 2MB)
            if (file.size > 2 * 1024 * 1024) {
                reject(new Error('A imagem deve ter no máximo 2MB'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const imageId = 'image_' + new Date().getTime();
                const imageData = e.target.result;
                
                // Armazenar imagem
                this.storedImages[imageId] = imageData;
                this.saveStoredImages();
                
                resolve({
                    id: imageId,
                    url: imageData
                });
            };
            
            reader.onerror = () => {
                reject(new Error('Erro ao processar a imagem'));
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    // Obter URL da imagem a partir do ID
    getImageUrl(imageId) {
        return this.storedImages[imageId] || null;
    }
    
    // Remover imagem
    removeImage(imageId) {
        if (this.storedImages[imageId]) {
            delete this.storedImages[imageId];
            this.saveStoredImages();
            return true;
        }
        return false;
    }

    ensureUploadDirectoryExists() {
        // Em um ambiente de navegador, precisamos confiar que o diretório existe no servidor
        // Essa verificação seria feita pelo servidor
        console.log('Assumindo que o diretório de uploads existe:', this.uploadPath);
    }

    setupEventListeners() {
        // Configurar o upload da imagem de capa
        const coverUploadInput = document.getElementById('cover-upload-input');
        if (coverUploadInput) {
            coverUploadInput.addEventListener('change', (e) => this.handleCoverImageUpload(e));
        }

        // Configurar o EasyMDE para suportar upload de imagens
        this.setupMarkdownEditorImageUpload();
    }

    handleCoverImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione uma imagem válida.');
            return;
        }

        // Gerar preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const coverPreview = document.getElementById('cover-preview');
            const coverPreviewImg = document.getElementById('cover-preview-img');
            
            coverPreviewImg.src = e.target.result;
            coverPreview.classList.remove('hidden');
            
            // Simular o upload e obter o caminho
            const fileName = generateUniqueFileName(file);
            const filePath = this.uploadPath + fileName;
            
            // Atualizar o campo de URL com o caminho da imagem
            document.getElementById('post-cover').value = filePath;
            
            // Em um ambiente real, aqui faríamos o upload para o servidor
            this.uploadImageToStorage(file, filePath);
        };
        
        reader.readAsDataURL(file);
    }

    setupMarkdownEditorImageUpload() {
        // Obter a instância do EasyMDE
        const easyMDE = window.easyMDEInstance;
        
        if (easyMDE) {
            const originalImageButton = easyMDE.toolbar.find(item => item.name === 'image');
            if (originalImageButton) {
                // Substituir a ação padrão do botão de imagem
                originalImageButton.action = (editor) => {
                    this.handleMarkdownImageUpload(editor);
                };
            }
        }
    }

    handleMarkdownImageUpload(editor) {
        // Criar um input de arquivo oculto
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) {
                document.body.removeChild(fileInput);
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione uma imagem válida.');
                document.body.removeChild(fileInput);
                return;
            }
            
            // Simular o upload e obter o caminho
            const fileName = generateUniqueFileName(file);
            const filePath = this.uploadPath + fileName;
            
            // Inserir a marcação da imagem no editor
            const cm = editor.codemirror;
            const stat = editor.getState();
            const options = editor.options;
            const imageUrl = filePath;
            
            const imageSyntax = stat.image ? 
                '![' + options.imageTexts.sbText + '](' + imageUrl + ')' : 
                '![' + options.imageTexts.sText + '](' + imageUrl + ')';
            
            cm.replaceSelection(imageSyntax);
            
            // Em um ambiente real, aqui faríamos o upload para o servidor
            this.uploadImageToStorage(file, filePath);
            
            document.body.removeChild(fileInput);
        });
        
        fileInput.click();
    }

    uploadImageToStorage(file, filePath) {
        // Em um ambiente de navegador, não podemos salvar arquivos diretamente no sistema de arquivos
        // Em um projeto real, esta função faria uma solicitação para um endpoint no servidor
        console.log('Simulando upload da imagem:', file.name);
        console.log('Caminho onde seria salvo:', filePath);
        
        // Em um ambiente real com servidor, você teria um código como este:
        // const formData = new FormData();
        // formData.append('image', file);
        // formData.append('path', filePath);
        // 
        // fetch('/api/upload-image', {
        //     method: 'POST',
        //     body: formData
        // }).then(response => response.json())
        //   .then(data => {
        //     if (data.success) {
        //       console.log('Imagem enviada com sucesso para o servidor');
        //     }
        //   });
        
        // Para este exemplo, continuamos armazenando no localStorage, mas com caminhos
        // que simulam uma estrutura de diretórios real
        this.saveImageDataToLocalStorage(file, filePath);
    }

    saveImageDataToLocalStorage(file, filePath) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            
            // Obter imagens existentes ou inicializar array vazio
            const storedImages = JSON.parse(localStorage.getItem('storedImages') || '{}');
            
            // Adicionar nova imagem
            storedImages[filePath] = imageData;
            
            // Salvar de volta ao localStorage
            try {
                localStorage.setItem('storedImages', JSON.stringify(storedImages));
                console.log('Imagem salva com sucesso no localStorage (simulação)');
            } catch (e) {
                console.error('Erro ao salvar imagem no localStorage:', e);
                if (e.name === 'QuotaExceededError') {
                    alert('Erro: Espaço de armazenamento excedido. Considere limpar algumas imagens.');
                }
            }
        };
        
        reader.readAsDataURL(file);
    }
}

// Função para inicializar o uploader após o carregamento da página
document.addEventListener('DOMContentLoaded', () => {
    window.imageUploader = new ImageUploader();
});

// Exportar a classe se estiver em um ambiente que suporte módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageUploader;
} else {
    // Criar instância global
    window.imageUploader = new ImageUploader();
} 