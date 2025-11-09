// Full scripts for Multi-Page Structure
document.addEventListener('DOMContentLoaded',function(){
    // 1. Navegación a las nuevas páginas
    document.querySelectorAll('a[href]').forEach(a=>{
        if (a.getAttribute('href').startsWith('#')) {
             a.addEventListener('click',e=>{e.preventDefault();const t=document.querySelector(a.getAttribute('href'));if(t)t.scrollIntoView({behavior:'smooth',block:'start'});});
        }
    });

    // 2. Observer para todas las secciones (Scroll Reveal)
    const observer=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');}})},{threshold:0.1,rootMargin:'0px 0px -50px 0px'});
    document.querySelectorAll('section, .timeline-event, .scrolly-section').forEach(sec=>observer.observe(sec));

    // 3. GSAP Animations (activas solo en páginas específicas)
    if(window.gsap && window.ScrollTrigger){
        gsap.registerPlugin(ScrollTrigger);

        // Parallax para Hero (si existe)
        const heroPhoto = document.querySelector('.hero-bg-photo');
        if (heroPhoto) {
            gsap.to('.hero-bg-photo', {
                y: '30%',
                scale: 1.15,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.hero-page',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1.5,
                }
            });
            
            gsap.to('.hero-content', {
                y: '20%',
                ease: 'power1.out',
                scrollTrigger: {
                    trigger: '.hero-page',
                    start: 'top top',
                    end: '50% top',
                    scrub: 1,
                }
            });
        }

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

        // Scrollytelling para PROCESO
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

        // Timeline Historia
        if (document.getElementById('historia-page')) {
            gsap.utils.toArray(".timeline-event").forEach(event => {
                gsap.from(event, {
                    x: 50,
                    opacity: 0,
                    duration: 1,
                    scrollTrigger: {
                        trigger: event,
                        start: "top 80%",
                        toggleActions: "play none none reverse"
                    }
                });
            });
        }
    }

    // 4. Lógica B2B y otros toggles
    const langSwitch=document.getElementById('langSwitch');
    if(langSwitch){langSwitch.addEventListener('change',e=>{document.documentElement.lang=e.target.value;});}

    // 5. Inicialización de Audio (Howler)
    if (window.Howl) {
        initSound();
        initAudioOverlays();
    }

    // 6. Inicialización de Mapa (Leaflet/Three.js)
    if (window.THREE || window.L) {
        initMap();
    }

});

// Funciones de audio
let soundEnabled=false;let sounds={};
function initSound(){}
function initAudioOverlays(){ 
    document.querySelectorAll('.portrait-card').forEach(portrait=>{ 
        portrait.addEventListener('click',e=>{ 
            const src=portrait.dataset.audio; 
            if(src) alert(`Reproduciendo historia de: ${portrait.querySelector('h4').textContent}`);
        }); 
    }); 
}

// Función mapa (placeholder)
function initMap(){}

function scrollTo(section){
    const el=document.querySelector(section);
    if(el) el.scrollIntoView({behavior:'smooth'});
}
