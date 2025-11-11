// Variable global para controlar la reproducción de audio
let currentAudio = null;

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa ScrollTrigger y animaciones GSAP
    initScrollAnimations();
    
    // Solo inicializa los overlays de audio en la página de productores
    if (document.body.id === 'productores-page' || document.querySelector('.portrait-card')) {
        initAudioOverlays();
    }
});

function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Animación general para secciones
    gsap.utils.toArray('section').forEach(section => {
        gsap.from(section, {
            y: 50,
            opacity: 0,
            duration: 0.8, // Velocidad ajustada para un efecto más claro
            ease: "power2.out",
            scrollTrigger: {
                trigger: section,
                start: "top 85%", // Inicia cuando la parte superior de la sección está al 85% del viewport
                toggleActions: "play none none none"
            }
        });
    });

    // Animación específica para la línea de tiempo (historia.html)
    gsap.utils.toArray('.timeline-event').forEach(event => {
        gsap.from(event, {
            x: -50,
            opacity: 0,
            duration: 1.0,
            ease: "power1.out",
            scrollTrigger: {
                trigger: event,
                start: "top 90%",
                toggleActions: "play none none none"
            }
        });
    });

    // Animación Hero Parallax (index.html, historia.html)
    gsap.to(".hero-bg-photo", {
        y: "20%",
        ease: "none",
        scrollTrigger: {
            trigger: "#mainNav",
            start: "top top", 
            end: "bottom top", 
            scrub: true,
            invalidateOnRefresh: true
        }
    });
}

function initAudioOverlays() {
    const portraitCards = document.querySelectorAll('.portrait-card');
    const audioModal = document.getElementById('audioModal');
    const modalName = document.getElementById('modalName');
    const playPauseButton = document.getElementById('playPauseButton');
    const progressBar = document.getElementById('progressBar');
    
    // Función para actualizar la barra de progreso
    function updateProgress() {
        if (currentAudio && currentAudio.playing()) {
            const seek = currentAudio.seek();
            const duration = currentAudio.duration();
            const progress = (seek / duration) * 100;
            progressBar.style.width = progress + '%';
            
            // Solicitar el siguiente frame para actualizar fluidamente
            requestAnimationFrame(updateProgress);
        }
    }

    portraitCards.forEach(card => {
        card.addEventListener('click', () => {
            const audioSrc = card.dataset.audio;
            const producerName = card.dataset.name;

            // 1. Detener audio anterior si existe
            if (currentAudio) {
                currentAudio.stop();
            }

            // 2. Mostrar el modal y actualizar el nombre
            modalName.textContent = `Historia de ${producerName}`;
            audioModal.style.display = 'flex';
            progressBar.style.width = '0%';
            playPauseButton.textContent = 'Cargando...';

            // 3. Crear y cargar el nuevo audio
            currentAudio = new Howl({
                src: [audioSrc],
                html5: true, // Usar HTML5 Audio para streaming de archivos grandes
                onplay: () => {
                    playPauseButton.textContent = 'Pausar';
                    requestAnimationFrame(updateProgress);
                },
                onpause: () => {
                    playPauseButton.textContent = 'Reproducir';
                },
                onend: () => {
                    playPauseButton.textContent = 'Reproducir';
                    progressBar.style.width = '100%';
                },
                onloaderror: (id, error) => {
                    playPauseButton.textContent = 'Error al cargar';
                    console.error('Error cargando audio:', error);
                }
            });

            // 4. Iniciar la reproducción
            currentAudio.play();
        });
    });

    // 5. Controlar Play/Pause en el modal
    playPauseButton.addEventListener('click', () => {
        if (currentAudio) {
            if (currentAudio.playing()) {
                currentAudio.pause();
            } else {
                currentAudio.play();
            }
        }
    });
}

// Función global para cerrar el modal
function closeAudioModal() {
    const audioModal = document.getElementById('audioModal');
    if (currentAudio) {
        currentAudio.stop();
        currentAudio.unload(); // Libera la memoria
        currentAudio = null;
    }
    audioModal.style.display = 'none';
}
