 // Funcionalidad del menú hamburguesa
        const menuToggle = document.getElementById('menuToggle');
        const mainNav = document.getElementById('mainNav');
        const menuOverlay = document.getElementById('menuOverlay');
        const navLinks = document.querySelectorAll('nav a');
        
        function toggleMenu() {
            menuToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
            menuOverlay.classList.toggle('active');
            
            // Prevenir scroll del body cuando el menú está abierto
            if (mainNav.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
        
        function closeMenu() {
            menuToggle.classList.remove('active');
            mainNav.classList.remove('active');
            menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // Event listeners para el menú
        menuToggle.addEventListener('click', toggleMenu);
        menuOverlay.addEventListener('click', closeMenu);
        
        // Cerrar menú al hacer click en cualquier enlace
        navLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });
        
        // Toast de bienvenida
        window.addEventListener('load', function() {
            setTimeout(function() {
                const toast = document.getElementById('welcomeToast');
                toast.classList.add('show');
                
                // Auto-ocultar después de 5 segundos
                setTimeout(function() {
                    closeToast();
                }, 5000);
            }, 500);
        });
        
        function closeToast() {
            const toast = document.getElementById('welcomeToast');
            toast.classList.remove('show');
        }
        
        // Smooth scroll para la navegación
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    // Cerrar toast si está abierto al navegar
                    closeToast();
                    
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Efecto de parallax suave en el scroll
        let ticking = false;
        
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    const scrolled = window.pageYOffset;
                    const parallaxElements = document.querySelectorAll('.product-card');
                    
                    parallaxElements.forEach((el, index) => {
                        const speed = 0.5;
                        const yPos = -(scrolled * speed);
                        el.style.transform = `translateY(${yPos * 0.05}px)`;
                    });
                    
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Animación de entrada para elementos cuando entran en viewport
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.section-title').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });