/**
 * ERLUX Luxury Lifestyle — Cinematic Video Hero Slider Controller
 * Inspired by Kay Beauty cinematic advertising presentation.
 * Features:
 * - Multi-slide campaign switching (Beauty, Fragrance, Fashion, Lifestyle)
 * - Auto-advance with animated progress indicators
 * - Synchronized video playback (plays active slide, pauses inactive)
 * - Tab visibility listener (pauses playback when user switches browser tabs)
 * - Touch swipe support for mobile devices
 * - Fallback poster preservation & reduced motion compliance
 */

document.addEventListener('DOMContentLoaded', () => {
    const heroSection = document.querySelector('.erlux-cinematic-hero');
    if (!heroSection) return;

    const slides = Array.from(heroSection.querySelectorAll('.erlux-hero-slide'));
    const tabs = Array.from(heroSection.querySelectorAll('.erlux-hero-tab'));
    const prevBtn = document.getElementById('erluxHeroPrev');
    const nextBtn = document.getElementById('erluxHeroNext');
    const toggleAutoplayBtn = document.getElementById('erluxHeroToggleAutoplay');

    if (!slides.length) return;

    let currentIndex = 0;
    const duration = 7500; // 7.5 seconds per slide
    let isAutoplayActive = true;
    let slideTimer = null;
    let touchStartX = 0;
    let touchEndX = 0;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Initialize all video elements
    slides.forEach((slide, idx) => {
        const video = slide.querySelector('video');
        if (video) {
            video.playsInline = true;
            video.muted = true;
            video.loop = true;

            // Handle errors gracefully
            video.addEventListener('error', () => {
                console.warn(`ERLUX Hero Video #${idx} failed to load, falling back to poster image.`);
                if (video.parentElement) {
                    video.parentElement.classList.add('has-video-error');
                }
            });

            // Initially play only slide 0, pause others
            if (idx === 0) {
                video.play().catch(() => {
                    // Autoplay with sound restricted, muted should succeed
                });
            } else {
                video.pause();
            }
        }
    });

    function resetTabProgress() {
        tabs.forEach((tab) => {
            const bar = tab.querySelector('.tab-progress-bar');
            if (bar) {
                bar.style.transition = 'none';
                bar.style.width = '0%';
            }
        });
    }

    function triggerTabProgress(activeTab) {
        if (!activeTab || prefersReducedMotion) return;
        const bar = activeTab.querySelector('.tab-progress-bar');
        if (bar) {
            // Force reflow
            void bar.offsetWidth;
            if (isAutoplayActive) {
                bar.style.transition = `width ${duration}ms linear`;
                bar.style.width = '100%';
            } else {
                bar.style.transition = 'none';
                bar.style.width = '100%';
            }
        }
    }

    function goToSlide(targetIndex) {
        if (targetIndex === currentIndex && slides[currentIndex].classList.contains('active')) {
            return;
        }

        const normalizedIndex = (targetIndex + slides.length) % slides.length;
        const prevSlide = slides[currentIndex];
        const nextSlide = slides[normalizedIndex];

        // 1. Transition Slide Elements
        prevSlide.classList.remove('active');
        nextSlide.classList.add('active');

        // 2. Synchronize Video Playback
        const prevVideo = prevSlide.querySelector('video');
        if (prevVideo) {
            prevVideo.pause();
        }

        const nextVideo = nextSlide.querySelector('video');
        if (nextVideo) {
            // Reset to beginning if desired or continue
            try {
                nextVideo.currentTime = 0;
            } catch (e) {}
            nextVideo.play().catch(() => {});
        }

        // 3. Update Indicator Tabs
        tabs.forEach((tab, i) => {
            if (i === normalizedIndex) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        resetTabProgress();
        triggerTabProgress(tabs[normalizedIndex]);

        currentIndex = normalizedIndex;

        // 4. Reset Timer
        if (isAutoplayActive) {
            startTimer();
        }
    }

    function startTimer() {
        clearTimeout(slideTimer);
        slideTimer = setTimeout(() => {
            if (isAutoplayActive && !document.hidden) {
                goToSlide(currentIndex + 1);
            }
        }, duration);
    }

    function stopTimer() {
        clearTimeout(slideTimer);
    }

    // Prev / Next Controls
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            goToSlide(currentIndex - 1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            goToSlide(currentIndex + 1);
        });
    }

    // Tab Clicks
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            goToSlide(index);
        });
    });

    // Play / Pause Autoplay Toggle
    if (toggleAutoplayBtn) {
        toggleAutoplayBtn.addEventListener('click', () => {
            isAutoplayActive = !isAutoplayActive;
            const icon = toggleAutoplayBtn.querySelector('i');
            const activeVideo = slides[currentIndex]?.querySelector('video');

            if (isAutoplayActive) {
                if (icon) icon.className = 'fa-solid fa-pause';
                toggleAutoplayBtn.setAttribute('aria-label', 'Pause Auto-advance');
                if (activeVideo) activeVideo.play().catch(() => {});
                triggerTabProgress(tabs[currentIndex]);
                startTimer();
            } else {
                if (icon) icon.className = 'fa-solid fa-play';
                toggleAutoplayBtn.setAttribute('aria-label', 'Play Auto-advance');
                stopTimer();
                resetTabProgress();
                const activeBar = tabs[currentIndex]?.querySelector('.tab-progress-bar');
                if (activeBar) {
                    activeBar.style.transition = 'none';
                    activeBar.style.width = '100%';
                }
            }
        });
    }

    // Tab Inactivity Pause (visibilitychange)
    document.addEventListener('visibilitychange', () => {
        const activeVideo = slides[currentIndex]?.querySelector('video');
        if (document.hidden) {
            // User switched tab or minimized browser
            stopTimer();
            if (activeVideo) {
                activeVideo.pause();
            }
        } else {
            // User returned to tab
            if (activeVideo) {
                activeVideo.play().catch(() => {});
            }
            if (isAutoplayActive) {
                startTimer();
                triggerTabProgress(tabs[currentIndex]);
            }
        }
    });

    // Mobile Touch Swipe Handling
    heroSection.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    heroSection.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;
        const threshold = 50; // Minimum px to trigger swipe
        if (swipeDistance > threshold) {
            // Swiped right -> go to previous
            goToSlide(currentIndex - 1);
        } else if (swipeDistance < -threshold) {
            // Swiped left -> go to next
            goToSlide(currentIndex + 1);
        }
    }

    // Initial kickstart
    triggerTabProgress(tabs[0]);
    if (isAutoplayActive) {
        startTimer();
    }
});
