
console.log("GoldBank iniciada");

// Verificar disponibilidade de vídeos
async function checkVideoAvailability() {
    const videoCards = document.querySelectorAll('.video-card[data-video]');
    
    for (const card of videoCards) {
        const videoUrl = card.dataset.video;
        const videoType = card.dataset.type;
        
        if (videoType === 'local') {
            try {
                const response = await fetch(videoUrl, { method: 'HEAD' });
                if (!response.ok) {
                    card.style.display = 'none';
                } else {
                    // Vídeo disponível - carregar e extrair capa
                    const video = card.querySelector('video');
                    if (video) {
                        video.muted = true;
                        video.preload = 'metadata';
                        
                        // Tentar carregar o primeiro frame como capa
                        video.addEventListener('loadedmetadata', function() {
                            video.currentTime = 0.5; // Pular para 0.5s para garantir frame
                        });
                        
                        video.addEventListener('seeked', function() {
                            // Frame carregado, pode usar como capa
                            video.pause();
                        });
                        
                        video.load();
                    }
                }
            } catch (error) {
                card.style.display = 'none';
            }
        } else if (videoType === 'youtube') {
            // Para YouTube, verificar se é um ID válido (não o placeholder)
            const youtubeId = videoUrl.match(/embed\/([^?]+)/);
            if (youtubeId && youtubeId[1] === 'dQw4w9WgXcQ') {
                // Este é um placeholder, esconder
                card.style.display = 'none';
            } else {
                // YouTube válido - adicionar thumbnail da imagem
                const iframe = card.querySelector('iframe');
                if (iframe && youtubeId) {
                    const videoId = youtubeId[1];
                    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                    
                    // Criar elemento de imagem como capa
                    const container = card.querySelector('.video-container');
                    const img = document.createElement('img');
                    img.src = thumbnailUrl;
                    img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;';
                    img.alt = card.dataset.title || 'Vídeo YouTube';
                    
                    // Adicionar antes do iframe
                    container.insertBefore(img, iframe);
                    
                    // Esconder iframe inicialmente
                    iframe.style.opacity = '0';
                    iframe.style.zIndex = '0';
                    
                    // Mostrar iframe ao clicar
                    card.addEventListener('click', function() {
                        img.style.display = 'none';
                        iframe.style.opacity = '1';
                        iframe.style.zIndex = '2';
                    });
                }
            }
        }
    }
    
    // Verificar se há vídeos visíveis e ajustar o grid
    const visibleCards = document.querySelectorAll('.video-card:not([style*="display: none"])');
    if (visibleCards.length === 0) {
        const videosGrid = document.querySelector('.videos-grid');
        if (videosGrid) {
            videosGrid.innerHTML = '<p style="text-align: center; color: var(--text-muted); grid-column: 1 / -1;">Nenhum vídeo disponível no momento.</p>';
        }
    }
}

// Executar verificação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', checkVideoAvailability);

const reveals = document.querySelectorAll('.card');

const videoBento = document.getElementById('videoBento');
const videoBentoCard = document.querySelector('.video-bento-card');

if(videoBento && videoBentoCard){
    videoBento.addEventListener('mousemove', (e) => {
        const rect = videoBento.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / centerY * -8;
        const rotateY = (x - centerX) / centerX * 8;
        
        videoBentoCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        videoBentoCard.style.boxShadow = `
            ${-rotateY * 2}px ${rotateX * 2}px 40px rgba(197,160,89,0.3),
            0 0 80px rgba(197,160,89,0.15)
        `;
    });
    
    videoBento.addEventListener('mouseleave', () => {
        videoBentoCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        videoBentoCard.style.boxShadow = `
            0 0 40px rgba(197,160,89,0.2),
            0 0 80px rgba(197,160,89,0.1),
            inset 0 0 30px rgba(197,160,89,0.05)
        `;
    });
}

function revealCards(){

    const trigger = window.innerHeight * 0.85;

    reveals.forEach(card=>{

        const top = card.getBoundingClientRect().top;

        if(top < trigger){
            card.classList.add('active');
        }

    });

}

reveals.forEach(card=>{
    card.classList.add('reveal');
});

window.addEventListener('scroll',revealCards);

revealCards();

document.querySelectorAll('a').forEach(link=>{

    link.addEventListener('mouseenter',()=>{

        link.style.transform = "scale(1.03)";

    });

    link.addEventListener('mouseleave',()=>{

        link.style.transform = "scale(1)";

    });

});

window.addEventListener('scroll',()=>{
    const scrolled = window.pageYOffset;
    const goldCircle = document.querySelector('.gold-circle');
    const videoBento = document.getElementById('videoBento');
    const floatingElements = document.querySelectorAll('.floating-element');

    if(goldCircle){
        goldCircle.style.transform = `translateY(${scrolled * 0.3}px)`;
    }

    if(videoBento){
        videoBento.style.transform = `translateY(${scrolled * 0.15}px)`;
    }

    floatingElements.forEach((element, index) => {
        const speed = 0.1 + (index * 0.05);
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Carrossel de vídeos
const videoCarousel = document.getElementById('videoCarousel');
if(videoCarousel){
    const carouselItems = videoCarousel.querySelectorAll('.carousel-item');
    const videos = videoCarousel.querySelectorAll('.carousel-video');
    let currentIndex = 1; // Começa com o item do meio como ativo
    let autoRotateInterval;
    let isMuted = false;

    // Criar botão de mute/unmute
    const muteButton = document.createElement('button');
    muteButton.className = 'mute-button';
    muteButton.innerHTML = '🔊';
    muteButton.setAttribute('aria-label', 'Ativar/Desativar som');
    
    // Check if mobile to adjust position
    const isMobile = window.innerWidth <= 768;
    const rightPos = isMobile ? '10px' : '20px';
    
    muteButton.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: ${rightPos};
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 50%, var(--gold) 100%);
        border: 2px solid var(--gold-dark);
        color: var(--petrol-dark);
        font-size: 20px;
        cursor: pointer;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        box-shadow: 0 4px 20px rgba(212,175,55,0.4);
    `;
    document.body.appendChild(muteButton);

    // Criar tooltip com efeito de digitação
    const tooltip = document.createElement('div');
    tooltip.className = 'mute-tooltip';
    tooltip.style.cssText = `
        position: fixed;
        bottom: 90px;
        right: 20px;
        background: rgba(8, 20, 35, 0.95);
        border: 1px solid rgba(212, 175, 55, 0.3);
        border-radius: 12px;
        padding: 10px 16px;
        color: var(--gold);
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        font-weight: 500;
        z-index: 1000;
        white-space: nowrap;
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        opacity: 1;
        transform: translateY(0);
        transition: opacity 0.3s ease, transform 0.3s ease;
    `;
    document.body.appendChild(tooltip);

    // Efeito de digitação
    const messages = [
        'Clique para ativar som',
        'Controle de áudio',
        'Gerenciar volume'
    ];
    let currentMessageIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let typingInterval;

    function typeMessage() {
        const currentMessage = messages[currentMessageIndex];
        
        if (isDeleting) {
            tooltip.textContent = currentMessage.substring(0, currentCharIndex - 1);
            currentCharIndex--;
        } else {
            tooltip.textContent = currentMessage.substring(0, currentCharIndex + 1);
            currentCharIndex++;
        }

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && currentCharIndex === currentMessage.length) {
            typeSpeed = 2000; // Pausa antes de deletar
            isDeleting = true;
        } else if (isDeleting && currentCharIndex === 0) {
            isDeleting = false;
            currentMessageIndex = (currentMessageIndex + 1) % messages.length;
            typeSpeed = 500; // Pausa antes de começar próxima mensagem
        }

        typingInterval = setTimeout(typeMessage, typeSpeed);
    }

    // Iniciar efeito de digitação imediatamente
    currentCharIndex = 0;
    isDeleting = false;
    typeMessage();

    // Função para atualizar estado de mute
    function updateMuteState() {
        videos.forEach((video, index) => {
            // Apenas o vídeo do centro deve ter som controlado pelo botão
            if (index === currentIndex) {
                video.muted = isMuted;
            } else {
                video.muted = true;
            }
        });
        muteButton.innerHTML = isMuted ? '🔇' : '🔊';
        muteButton.setAttribute('aria-label', isMuted ? 'Ativar som' : 'Desativar som');
    }

    // Evento do botão de mute
    muteButton.addEventListener('click', () => {
        isMuted = !isMuted;
        updateMuteState();
    });

    // Função para atualizar posições do carrossel
    function updateCarouselPositions() {
        carouselItems.forEach((item, index) => {
            item.classList.remove('active', 'carousel-center', 'carousel-left', 'carousel-right');
            
            if (index === currentIndex) {
                item.classList.add('active', 'carousel-center');
                // Esconder botão de fullscreen no centro
                const fullscreenBtn = item.querySelector('.fullscreen-btn');
                if(fullscreenBtn){
                    fullscreenBtn.style.display = 'none';
                }
            } else if (index === (currentIndex - 1 + carouselItems.length) % carouselItems.length) {
                item.classList.add('carousel-left');
                // Mostrar botão de fullscreen nos laterais
                const fullscreenBtn = item.querySelector('.fullscreen-btn');
                if(fullscreenBtn){
                    fullscreenBtn.style.display = 'flex';
                }
            } else if (index === (currentIndex + 1) % carouselItems.length) {
                item.classList.add('carousel-right');
                // Mostrar botão de fullscreen nos laterais
                const fullscreenBtn = item.querySelector('.fullscreen-btn');
                if(fullscreenBtn){
                    fullscreenBtn.style.display = 'flex';
                }
            }
        });
    }

    // Função para rotacionar para o próximo
    function rotateNext() {
        currentIndex = (currentIndex + 1) % carouselItems.length;
        updateCarouselPositions();
        updateMuteState();
    }

    // Função para rotacionar para o anterior
    function rotatePrev() {
        currentIndex = (currentIndex - 1 + carouselItems.length) % carouselItems.length;
        updateCarouselPositions();
        updateMuteState();
    }

    // Evento de clique nos itens
    carouselItems.forEach((item, index) => {
        item.addEventListener('click', (e) => {
            // Se clicou no botão de fullscreen, não mudar a posição
            if(e.target.classList.contains('fullscreen-btn')){
                return;
            }
            
            // O vídeo clicado sempre vai para o centro
            currentIndex = index;
            updateCarouselPositions();
            updateMuteState();
            
            // Garantir que o vídeo central dê play
            const centerVideo = carouselItems[currentIndex].querySelector('.carousel-video');
            if(centerVideo){
                centerVideo.play().catch(e => console.log('Erro ao reproduzir vídeo:', e));
            }
        });
    });

    // Evento de clique nos botões de fullscreen
    const fullscreenBtns = document.querySelectorAll('.fullscreen-btn');
    fullscreenBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que o clique afete o item do carrossel
            
            const videoIndex = parseInt(btn.dataset.index);
            const video = carouselItems[videoIndex].querySelector('.carousel-video');
            
            if(video){
                if(video.requestFullscreen){
                    video.requestFullscreen();
                } else if(video.webkitRequestFullscreen){
                    video.webkitRequestFullscreen();
                } else if(video.msRequestFullscreen){
                    video.msRequestFullscreen();
                }
            }
        });
    });

    // Inicializar
    updateCarouselPositions();
    
    // Iniciar com som desativado para permitir autoplay
    isMuted = true;
    updateMuteState();
    
    // Garantir que todos os vídeos comecem a reproduzir
    videos.forEach(video => {
        video.play().catch(e => console.log('Erro ao reproduzir vídeo:', e));
    });
}

// Botão "Mostrar todas" para atividades secundárias
const showMoreBtn = document.getElementById('showMoreBtn');
if(showMoreBtn){
    showMoreBtn.addEventListener('click', () => {
        const hiddenActivities = document.querySelectorAll('.activity-hidden');
        const visibleActivities = document.querySelectorAll('.activity-visible');
        
        if(showMoreBtn.textContent === 'Mostrar todas'){
            hiddenActivities.forEach(item => {
                item.classList.remove('activity-hidden');
                item.classList.add('activity-visible');
            });
            showMoreBtn.textContent = 'Mostrar menos';
        } else {
            // Manter apenas os 3 primeiros visíveis
            visibleActivities.forEach((item, index) => {
                if(index >= 3){
                    item.classList.remove('activity-visible');
                    item.classList.add('activity-hidden');
                }
            });
            showMoreBtn.textContent = 'Mostrar todas';
        }
    });
}
