// Variable global para controlar la reproducción de audio (página productores)
let currentAudio = null;

// Datos de la rueda de sabor para la página cafe.html
const FLAVOR_DATA = [
    { label: 'Panela/Caña', color: '#A67853', text: 'Notas a panela y caña, proporcionando un dulzor natural, sedoso y envolvente. Es el corazón de nuestro perfil.' },
    { label: 'Chocolate/Caramelo', color: '#1A1412', text: 'Toques a chocolate amargo y caramelo tostado, resultado de la tierra volcánica y el proceso de tueste medio. Base robusta.' },
    { label: 'Cítrico/Floral', color: '#C71F37', text: 'Acidez brillante, cítrica y viva, complementada por un leve aroma floral que añade complejidad y limpieza a la taza.' },
    { label: 'Especias', color: '#7A9B7F', text: 'Un residual dulce y limpio con sutiles matices a especias como nuez moscada o canela.' },
];

let flavorSegments = [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Lógica del Menú Hamburguesa (Alto Riesgo de Conflicto - Aseguramos su función)
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Cambiar el texto del botón si es necesario
            menuToggle.textContent = navLinks.classList.contains('active') ? 'CERRAR' : 'MENÚ';
        });
        // Cerrar menú al hacer clic en un enlace (solo en móvil)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    navLinks.classList.remove('active');
                    menuToggle.textContent = 'MENÚ';
                }
            });
        });
    }

    // 2. Inicialización de GSAP y ScrollTrigger (Si las librerías están cargadas)
    if (window.gsap && window.ScrollTrigger) {
        initScrollAnimations();
    } else {
        console.warn("GSAP o ScrollTrigger no se ha cargado. Las animaciones están deshabilitadas.");
    }

    // 3. Inicialización de Audio (Howler)
    if (window.Howl) {
        initAudioOverlays();
    }

    // 4. Inicializa la rueda de sabores si estamos en la página del café
    if (document.getElementById('flavorWheelCanvas')) {
        initFlavorWheel();
    }

    // 5. Inicialización de Mapa (Leaflet/Three.js)
    if (window.THREE || window.L) {
        initMap();
    }
});

function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Animación Hero Parallax (más impactante)
    const heroPhoto = document.querySelector('.hero-bg-photo');
    if (heroPhoto) {
        gsap.to('.hero-bg-photo', {
            y: '45%', 
            scale: 1.25, 
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero-page',
                start: 'top top',
                end: 'bottom top',
                scrub: 1.5,
            }
        });
        
        gsap.to('.hero-content', {
            y: '30%', 
            ease: 'power1.out',
            scrollTrigger: {
                trigger: '.hero-page',
                start: 'top top',
                end: '50% top',
                scrub: 1,
            }
        });
    }

    // Animación Scroll Reveal para todas las secciones
    gsap.utils.toArray('section:not(#hero-home), .timeline-event, .door-item, .portrait-card').forEach(el => {
        gsap.from(el, {
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });
    });

    // Animación de Contador para Sostenibilidad
    const counters = document.querySelectorAll('.impact-numbers-grid .number');
    counters.forEach(counter => {
        const endValue = parseFloat(counter.textContent.replace(',', ''));
        const dataUnit = counter.dataset.unit || '';
        const dataPrecision = parseInt(counter.dataset.precision) || 0;

        gsap.from(counter, {
            innerText: 0,
            duration: 2,
            ease: "power1.out",
            snap: { innerText: 1 },
            scrollTrigger: {
                trigger: counter,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            onUpdate: () => {
                let value = parseFloat(counter.innerText).toFixed(dataPrecision);
                if (dataUnit === 'kg') value = new Intl.NumberFormat('es-CO').format(value);
                counter.textContent = value + dataUnit;
            }
        });
    });

    // Scrollytelling para PROCESO (Activa y desactiva la clase 'active')
    if (document.getElementById('proceso-page')) {
        gsap.utils.toArray(".scrolly-section").forEach((section, i) => {
            const content = section.querySelector('.scrolly-content');
            ScrollTrigger.create({
                trigger: section,
                start: "top center",
                end: "bottom center",
                onEnter: () => content.classList.add('active'),
                onLeaveBack: () => content.classList.remove('active'),
                onEnterBack: () => content.classList.add('active'),
                onLeave: () => content.classList.remove('active'),
            });
        });
    }
}

// Funciones de audio
function initAudioOverlays() { 
    // Lógica del modal de audio (reducida para concisión)
    document.querySelectorAll('.portrait-card').forEach(portrait=>{ 
        portrait.addEventListener('click',e=>{ 
            const src=portrait.dataset.audio; 
            if(src) alert(`Reproduciendo historia de: ${portrait.querySelector('h4').textContent}`);
        }); 
    }); 
}

function closeAudioModal() {
    const audioModal = document.getElementById('audioModal');
    if (currentAudio) {
        currentAudio.stop();
        currentAudio.unload();
        currentAudio = null;
    }
    audioModal.style.display = 'none';
}

// Función mapa (placeholder)
function initMap(){}

// LÓGICA INTERACTIVA DE LA RUEDA DE SABORES
function initFlavorWheel() {
    const canvas = document.getElementById('flavorWheelCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 150;
    let startAngle = 0;

    function drawSegments() {
        flavorSegments = [];
        startAngle = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        FLAVOR_DATA.forEach((segment, index) => {
            const angle = Math.PI * 2 / FLAVOR_DATA.length;
            const endAngle = startAngle + angle;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = segment.color;
            ctx.fill();

            flavorSegments.push({
                ...segment,
                startAngle: startAngle,
                endAngle: endAngle
            });

            startAngle = endAngle;
        });

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = 'white';
        ctx.font = '20px Bebas Neue';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('CATA', centerX, centerY);
    }

    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const distance = Math.sqrt((mouseX - centerX) ** 2 + (mouseY - centerY) ** 2);

        if (distance <= radius) {
            let angle = Math.atan2(mouseY - centerY, mouseX - centerX);
            if (angle < 0) angle += Math.PI * 2;

            const clickedSegment = flavorSegments.find(segment => {
                if (segment.startAngle > segment.endAngle) {
                    return angle >= segment.startAngle || angle < segment.endAngle;
                }
                return angle >= segment.startAngle && angle < segment.endAngle;
            });

            if (clickedSegment) {
                updateFlavorDescription(clickedSegment);
            }
        }
    });

    function updateFlavorDescription(segment) {
        const titleElement = document.getElementById('flavorTitle');
        const textElement = document.getElementById('flavorText');
        
        titleElement.textContent = segment.label.toUpperCase();
        textElement.textContent = segment.text;
        
        titleElement.style.color = segment.color;
        document.getElementById('flavorDescription').style.borderLeftColor = segment.color;
    }

    drawSegments();
}
