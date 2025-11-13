/* SCRIPTS.JS V2.9 (Final)
*/
document.addEventListener('DOMContentLoaded', () => {

    gsap.registerPlugin(ScrollTrigger);

    // --- 1. LÓGICA DEL MENÚ HAMBURGUESA (GLOBAL) ---
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Cambiar texto del botón
            if (navLinks.classList.contains('active')) {
                menuToggle.textContent = 'CERRAR';
            } else {
                menuToggle.textContent = 'MENÚ';
            }
        });
    }

    // --- 2. LÓGICA DE NAVBAR SCROLL (GLOBAL) ---
    const mainNav = document.getElementById('mainNav');
    if (mainNav) {
        ScrollTrigger.create({
            trigger: document.body,
            start: "top top",
            end: "+=100", // Después de 100px de scroll
            onUpdate: self => {
                if (self.direction === 1) { // Scrolleando hacia abajo
                    mainNav.style.background = "rgba(17, 126, 57, 0.8)"; // Más opaco con blur
                } else { // Scrolleando hacia arriba
                    mainNav.style.background = "var(--verde-cafetal)"; // Color sólido
                }
            },
            onLeaveBack: () => {
                mainNav.style.background = "var(--verde-cafetal)"; // Sólido al volver al inicio
            }
        });
    }

    // --- 3. LÓGICA DE ANIMACIÓN (GLOBAL - MÓVIL Y ESCRITORIO) ---

    // 3.1. Efecto Parallax en TODOS los Hero (Re-activado para móvil)
    gsap.utils.toArray('.hero-bg-photo').forEach(bg => {
        gsap.to(bg, {
            scrollTrigger: {
                trigger: bg.parentElement, // El .hero-page que lo contiene
                start: "top top",
                end: "bottom top",
                scrub: true // Efecto "pegajoso" al scrollear
            },
            yPercent: 30 // Mueve la imagen (el % es la intensidad del parallax)
        });
    });

    // 3.2. Animación de aparición (Scrollytelling en proceso.html)
    gsap.utils.toArray('.scrolly-content').forEach(content => {
        gsap.fromTo(content, 
            { opacity: 0, y: 40 }, // Estado inicial (invisible)
            {
                scrollTrigger: {
                    trigger: content,
                    start: "top 85%", // Aparece cuando llega al 85% de la pantalla
                    toggleActions: "play none none reverse" // Se revierte si subes
                },
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power1.out"
            }
        );
    });
    
    // 3.3. Animador de Números (Impacto)
    const animatedNumbers = new Set();
    gsap.utils.toArray('.number').forEach(numEl => {
        
        ScrollTrigger.create({
            trigger: numEl,
            start: "top 90%",
            onEnter: () => {
                if (!animatedNumbers.has(numEl)) {
                    animatedNumbers.add(numEl);
                    
                    const endValue = parseFloat(numEl.textContent.replace(/,/g, ''));
                    const unit = numEl.dataset.unit || '';
                    const precision = parseInt(numEl.dataset.precision, 10) || 0;

                    gsap.fromTo(numEl, 
                        { textContent: 0 }, 
                        {
                            textContent: endValue,
                            duration: 3,
                            ease: "power1.out",
                            snap: { textContent: 1 }, 
                            onUpdate: function() {
                                let currentVal = parseFloat(this.targets()[0].textContent);
                                numEl.textContent = currentVal.toFixed(precision) + unit;
                            },
                            onComplete: () => {
                                numEl.textContent = endValue.toFixed(precision) + unit;
                            }
                        }
                    );
                }
            }
        });
    });

    // --- 4. LÓGICA DE VIDEO FACHADE (CARGA RÁPIDA) ---
    function initYouTubeFacade(containerId) {
        const facadeContainer = document.getElementById(containerId);
        
        if (facadeContainer) {
            const youtubeId = facadeContainer.dataset.youtubeId;

            facadeContainer.addEventListener('click', () => {
                // 1. Crear el iframe
                const iframe = document.createElement('iframe');
                iframe.setAttribute('src', `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`);
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                iframe.setAttribute('allowfullscreen', '');
                
                // 2. Limpiar el contenido INTERNO (el botón de play)
                facadeContainer.innerHTML = ''; 
                
                // 3. ¡¡LA LÍNEA QUE SOLUCIONA EL PROBLEMA DEL VELO BLANCO!!
                facadeContainer.style.backgroundImage = 'none';

                // 4. Añadir el video
                facadeContainer.appendChild(iframe);
            }, { once: true });
        }
    }

    // Iniciar el 'escuchador' para el video de YouTube
    initYouTubeFacade('youtube-facade');

}); // --- Fin del DOMContentLoaded ---
