/**
 * ============================================================
 *  Ashish Kumar — Portfolio Scripts
 *  Refactored for maintainability, performance & safety
 *  No functional changes — all existing features preserved
 * ============================================================
 */

'use strict';

/* ------------------------------------------------------------
 *  1. UTILITY HELPERS
 * ---------------------------------------------------------- */

/** Safe element selector — returns null if not found */
const $ = (selector, context = document) => context.querySelector(selector);

/** Safe multi-element selector — returns empty array if none */
const $$ = (selector, context = document) =>
    Array.from(context.querySelectorAll(selector));

/** Run a function safely after DOM is ready */
const onReady = (fn) => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fn);
    } else {
        fn();
    }
};

/* ------------------------------------------------------------
 *  2. THEME MANAGEMENT (Dark / Light Mode)
 * ---------------------------------------------------------- */

const ThemeManager = (() => {
    const STORAGE_KEY = 'theme';
    const DARK_ATTR = 'data-theme';

    const getToggle = () => $('#theme-toggle');
    const getIcon = () => getToggle()?.querySelector('i');

    function applyTheme(theme) {
        const icon = getIcon();
        if (!icon) return;

        if (theme === 'dark') {
            document.body.setAttribute(DARK_ATTR, 'dark');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            document.body.removeAttribute(DARK_ATTR);
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
        localStorage.setItem(STORAGE_KEY, theme);
    }

    function init() {
        const toggle = getToggle();
        if (!toggle) return;

        // Restore saved theme
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'dark') applyTheme('dark');

        // Toggle on click
        toggle.addEventListener('click', () => {
            const current = document.body.getAttribute(DARK_ATTR);
            applyTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    return { init };
})();

/* ------------------------------------------------------------
 *  3. MOBILE NAVIGATION (Hamburger Menu)
 * ---------------------------------------------------------- */

const NavManager = (() => {
    const getHamburger = () => $('#hamburger');
    const getMenu = () => $('#nav-menu');

    function closeMenu() {
        const menu = getMenu();
        const burger = getHamburger();
        if (!menu || !burger) return;
        menu.classList.remove('active');
        burger.innerHTML = '<i class="fas fa-bars"></i>';
    }

    function init() {
        const hamburger = getHamburger();
        const menu = getMenu();
        if (!hamburger || !menu) return;

        hamburger.addEventListener('click', () => {
            const isOpen = menu.classList.toggle('active');
            hamburger.innerHTML = isOpen
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';
        });

        // Close menu on nav-link click
        $$('.nav-link').forEach((link) =>
            link.addEventListener('click', closeMenu)
        );
    }

    return { init, close: closeMenu };
})();

/* ------------------------------------------------------------
 *  4. EDUCATION SECTION (Read More + Filter)
 * ---------------------------------------------------------- */

const EducationManager = (() => {
    function initReadMore() {
        $$('#education .read-more').forEach((btn) => {
            btn.addEventListener('click', function () {
                const details = this.closest('.education-item')?.querySelector('.details');
                if (!details) return;

                const isOpen = details.classList.toggle('active');
                this.textContent = isOpen ? 'Read Less' : 'Read More';
            });
        });
    }

    function initFilter() {
        const buttons = $$('.filter-btn');
        const items = $$('.education-item');
        if (!buttons.length || !items.length) return;

        buttons.forEach((btn) => {
            btn.addEventListener('click', () => {
                buttons.forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');
                items.forEach((item) => {
                    const show =
                        filter === 'all' ||
                        item.getAttribute('data-category') === filter;
                    item.style.display = show ? 'block' : 'none';
                });
            });
        });
    }

    function init() {
        initReadMore();
        initFilter();
    }

    return { init };
})();

/* ------------------------------------------------------------
 *  5. PROJECT SECTION (Read More Toggle)
 * ---------------------------------------------------------- */

const ProjectManager = (() => {
    function init() {
        $$('#project .read-more').forEach((btn) => {
            btn.addEventListener('click', function () {
                const fullDesc =
                    this.closest('.project-content')?.querySelector('.full-description');
                if (!fullDesc) return;

                const isOpen = fullDesc.classList.toggle('show');
                this.classList.toggle('active', isOpen);
                this.innerHTML = isOpen
                    ? 'Read Less <i class="fas fa-chevron-up"></i>'
                    : 'Read More <i class="fas fa-chevron-down"></i>';
            });
        });
    }

    return { init };
})();

/* ------------------------------------------------------------
 *  6. RESEARCH SECTION (Read More Toggle)
 * ---------------------------------------------------------- */

const ResearchManager = (() => {
    function init() {
        $$('#Research .research-btn').forEach((btn) => {
            btn.addEventListener('click', function () {
                const targetId = this.getAttribute('data-research');
                const details = targetId ? document.getElementById(targetId) : null;
                if (!details) return;

                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                details.hidden = isExpanded;
                this.setAttribute('aria-expanded', String(!isExpanded));

                this.innerHTML = isExpanded
                    ? 'Read More <i class="fas fa-arrow-right"></i>'
                    : 'Show Less <i class="fas fa-arrow-up"></i>';
            });
        });
    }

    return { init };
})();

/* ------------------------------------------------------------
 *  7. CERTIFICATE MODAL (B.Tech Marksheets)
 * ---------------------------------------------------------- */

const CertificateModal = (() => {
    const getModal = () => document.getElementById('certificateModal');

    function open() {
        const modal = getModal();
        if (modal) modal.style.display = 'flex';
    }

    function close() {
        const modal = getModal();
        if (modal) modal.style.display = 'none';
    }

    function init() {
        const modal = getModal();
        if (!modal) return;

        // Click outside to close
        window.addEventListener('click', (e) => {
            if (e.target === modal) close();
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') close();
        });
    }

    // Expose globally for inline onclick in HTML
    window.showCertificates = open;
    window.hideCertificates = close;

    return { init, open, close };
})();

/* ------------------------------------------------------------
 *  8. SKILLS SLIDER + EXPANDABLE + BAR ANIMATION
 * ---------------------------------------------------------- */

const SkillsSlider = (() => {
    let currentSlide = 0;
    let slidesPerView = 1;

    const getSlider = () => document.getElementById('skillsSlider');
    const getPrev = () => document.getElementById('prevBtn');
    const getNext = () => document.getElementById('nextBtn');
    const getDots = () => document.getElementById('sliderDots');
    const getCategories = () => $$('.skill-category');

    function getSlidesPerView() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    function getMaxSlide() {
        const total = getCategories().length;
        return Math.max(0, Math.ceil(total / slidesPerView) - 1);
    }

    function createDots() {
        const dotsContainer = getDots();
        if (!dotsContainer) return;

        dotsContainer.innerHTML = '';
        const totalDots = getMaxSlide() + 1;

        for (let i = 0; i < totalDots; i++) {
            const dot = document.createElement('div');
            dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    function updateSlider() {
        const slider = getSlider();
        const categories = getCategories();
        if (!slider || !categories.length) return;

        const gap = 25; // matches CSS gap
        const slideWidth = categories[0].offsetWidth + gap;
        slider.style.transform = `translateX(-${currentSlide * slideWidth}px)`;

        // Update dots
        $$('.slider-dot').forEach((dot, i) =>
            dot.classList.toggle('active', i === currentSlide)
        );

        // Update nav buttons
        const prevBtn = getPrev();
        const nextBtn = getNext();
        if (prevBtn) prevBtn.disabled = currentSlide === 0;
        if (nextBtn) nextBtn.disabled = currentSlide >= getMaxSlide();
    }

    function goToSlide(index) {
        currentSlide = Math.max(0, Math.min(index, getMaxSlide()));
        updateSlider();
    }

    function next() {
        if (currentSlide < getMaxSlide()) {
            currentSlide++;
            updateSlider();
        }
    }

    function prev() {
        if (currentSlide > 0) {
            currentSlide--;
            updateSlider();
        }
    }

    function initExpandButtons() {
        $$('.expand-btn').forEach((btn) => {
            btn.addEventListener('click', function () {
                const targetId = this.getAttribute('data-target');
                const section = targetId ? document.getElementById(targetId) : null;
                if (!section) return;

                const isOpen = section.classList.toggle('show');
                const label = this.querySelector('span');
                if (label) label.textContent = isOpen ? 'Show Less' : 'Show More';
                this.classList.toggle('expanded', isOpen);
            });
        });
    }

    function initSkillBarAnimation() {
        const bars = $$('.skill-progress');
        if (!bars.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const bar = entry.target;
                    const targetWidth = bar.style.width;
                    bar.style.width = '0';
                    setTimeout(() => {
                        bar.style.width = targetWidth;
                    }, 300);
                    observer.unobserve(bar);
                });
            },
            { threshold: 0.5 }
        );

        bars.forEach((bar) => observer.observe(bar));
    }

    function init() {
        const slider = getSlider();
        if (!slider) return;

        slidesPerView = getSlidesPerView();
        createDots();
        updateSlider();

        getPrev()?.addEventListener('click', prev);
        getNext()?.addEventListener('click', next);

        // Debounced resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                slidesPerView = getSlidesPerView();
                currentSlide = 0;
                createDots();
                updateSlider();
            }, 150);
        });

        initExpandButtons();
        initSkillBarAnimation();
    }

    return { init };
})();

/* ------------------------------------------------------------
 *  9. CONTACT FORM (EmailJS)
 * ---------------------------------------------------------- */

const ContactForm = (() => {
    const EMAILJS_PUBLIC_KEY = 'I-4jo9KNWHQCi4KB_';
    const SERVICE_ID = 'service_illdc18';
    const TEMPLATE_ID = 'template_wug3hno';
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function showAlert(msg) {
        window.alert(msg);
    }

    async function send(templateParams) {
        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS library not loaded');
        }
        return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
    }

    function init() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        // Init EmailJS only if library is loaded
        if (typeof emailjs !== 'undefined') {
            emailjs.init(EMAILJS_PUBLIC_KEY);
        }

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const name = form.querySelector('#name')?.value.trim() || '';
            const email = form.querySelector('#email')?.value.trim() || '';
            const message = form.querySelector('#message')?.value.trim() || '';

            // Validation
            if (!name || !email || !message) {
                showAlert('Please fill in all fields.');
                return;
            }
            if (!EMAIL_REGEX.test(email)) {
                showAlert('Please enter a valid email address.');
                return;
            }

            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            try {
                await send({
                    from_name: name,
                    from_email: email,
                    message: message,
                    to_name: 'Ashish Kumar',
                    date: new Date().toLocaleString()
                });

                showAlert('Thank you! Your message has been sent successfully.');
                form.reset();
            } catch (err) {
                console.error('EmailJS Error:', err);
                showAlert('Failed to send message. Please try again later.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    return { init };
})();

/* ------------------------------------------------------------
 * 10. FOOTER (Current Year)
 * ---------------------------------------------------------- */

const Footer = (() => {
    function init() {
        const yearEl = document.getElementById('currentYear');
        if (yearEl) yearEl.textContent = new Date().getFullYear();
    }
    return { init };
})();

/* ------------------------------------------------------------
 * 11. BOOTSTRAP — Initialize Everything
 * ---------------------------------------------------------- */

onReady(() => {
    ThemeManager.init();
    NavManager.init();
    EducationManager.init();
    ProjectManager.init();
    ResearchManager.init();
    CertificateModal.init();
    SkillsSlider.init();
    ContactForm.init();
    Footer.init();

    console.log('%c✅ Portfolio initialized successfully', 'color:#3498db;font-weight:bold;');
});
