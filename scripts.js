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

        // CERRAR MENÚ AL HACER CLICK EN UN LINK
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.textContent = 'MENÚ';
            });
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
                            onUpdate: function () {
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

    // --- 5. EFECTO PARALLAX INTERACTIVO (FLAVOR MAP) ---
    const flavorMap = document.getElementById('flavorMap');
    if (flavorMap) {
        // Ahora apuntamos a los puntos de sabor (.flavor-spot) o directamente a las cajas (.popup-box)
        // Si queremos que se mueva todo el conjunto (punto + imagen), movemos .flavor-spot
        const ingredients = flavorMap.querySelectorAll('.flavor-spot');

        flavorMap.addEventListener('mousemove', (e) => {
            // Calcular el centro del mapa
            const rect = flavorMap.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Calcular la distancia del mouse al centro
            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;

            ingredients.forEach(ingredient => {
                // Asignamos velocidades distintas según el ingrediente para profundidad
                let speed = 0.05;
                if (ingredient.classList.contains('panela')) speed = 0.03;
                if (ingredient.classList.contains('chocolate')) speed = 0.06;
                if (ingredient.classList.contains('citrus')) speed = 0.04;

                // Movimiento invertido (Parallax)
                const x = -mouseX * speed;
                const y = -mouseY * speed;

                // Usamos GSAP para suavizar el movimiento (el "amortiguador")
                // IMPORTANTE: Como .flavor-spot tiene transform: translate(-50%, -50%),
                // debemos asegurarnos de que GSAP no sobrescriba eso, o usar xPercent/yPercent.
                // Sin embargo, GSAP maneja 'x' y 'y' como translate3d/translate, que se suma al layout.
                // Para evitar conflictos con el centrado CSS, animaremos el hijo .popup-box o usaremos x/y que se suman.

                gsap.to(ingredient, {
                    x: x,
                    y: y,
                    duration: 1, // Duración del suavizado
                    ease: "power2.out"
                });
            });
        });

        // Resetear al salir
        flavorMap.addEventListener('mouseleave', () => {
            ingredients.forEach(ingredient => {
                gsap.to(ingredient, {
                    x: 0,
                    y: 0,
                    duration: 1,
                    ease: "power2.out"
                });
            });
        });
    }

}); // --- Fin del DOMContentLoaded ---
