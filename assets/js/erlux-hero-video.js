/**
 * ERLUX Luxury Lifestyle — Cinematic Video Hero Slider Controller
 * High-performance horizontal slide motion, video playback sync,
 * animated progress indicators, and arrow / swipe navigation.
 */

(function () {
    function initHeroSlider() {
        const heroSection = document.querySelector('.erlux-cinematic-hero');
        if (!heroSection || heroSection.dataset.initialized) return;
        heroSection.dataset.initialized = 'true';

        const slides = Array.from(heroSection.querySelectorAll('.erlux-hero-slide'));
        const tabs = Array.from(heroSection.querySelectorAll('.erlux-hero-tab'));
        const prevBtn = document.getElementById('erluxHeroPrev');
        const nextBtn = document.getElementById('erluxHeroNext');
        const toggleAutoplayBtn = document.getElementById('erluxHeroToggleAutoplay');

        if (!slides.length) return;

        let currentIndex = 0;
        const duration = 6000; // 6 seconds per slide
        let isAutoplayActive = true;
        let isTransitioning = false;
        let slideTimer = null;
        let touchStartX = 0;
        let touchEndX = 0;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Ensure slide 0 is active and other slides wait offscreen
        slides.forEach((slide, idx) => {
            const video = slide.querySelector('video');
            if (video) {
                video.playsInline = true;
                video.muted = true;
                video.loop = true;

                video.addEventListener('error', () => {
                    console.warn(`ERLUX Hero Video #${idx} failed to load, falling back to poster.`);
                    if (video.parentElement) {
                        video.parentElement.classList.add('has-video-error');
                    }
                });

                if (idx === 0) {
                    slide.classList.add('active');
                    slide.classList.remove('slide-to-left', 'slide-to-right', 'from-left', 'from-right');
                    video.play().catch(() => {});
                } else {
                    slide.classList.remove('active', 'slide-to-left', 'from-left');
                    slide.classList.add('slide-to-right');
                    video.pause();
                }
            }
        });

        function resetAllTabProgress() {
            tabs.forEach((tab) => {
                const bar = tab.querySelector('.tab-progress-bar');
                if (bar) {
                    bar.style.transition = 'none';
                    bar.style.width = '0%';
                    void bar.offsetWidth;
                }
            });
        }

        function triggerTabProgress(activeTab) {
            if (!activeTab || prefersReducedMotion) return;
            const bar = activeTab.querySelector('.tab-progress-bar');
            if (bar) {
                bar.style.transition = 'none';
                bar.style.width = '0%';
                void bar.offsetWidth; // Force reflow
                if (isAutoplayActive) {
                    bar.style.transition = `width ${duration}ms linear`;
                    bar.style.width = '100%';
                }
            }
        }

        function goToSlide(targetIndex, explicitDirection = null) {
            if (isTransitioning) return;

            const total = slides.length;
            const normalizedIndex = ((targetIndex % total) + total) % total;

            if (normalizedIndex === currentIndex && slides[currentIndex].classList.contains('active')) {
                return;
            }

            isTransitioning = true;

            // Determine slide direction
            let direction = explicitDirection;
            if (!direction) {
                if (targetIndex > currentIndex || (currentIndex === total - 1 && normalizedIndex === 0)) {
                    direction = 'forward';
                } else {
                    direction = 'backward';
                }
            }

            const prevSlide = slides[currentIndex];
            const nextSlide = slides[normalizedIndex];

            // 1. Horizontal Slide Animation
            if (direction === 'forward') {
                prevSlide.classList.remove('active', 'from-left', 'from-right');
                prevSlide.classList.add('slide-to-left');

                nextSlide.classList.remove('slide-to-left', 'slide-to-right', 'active');
                nextSlide.classList.add('from-right');
                void nextSlide.offsetWidth; // Force reflow

                nextSlide.classList.remove('from-right');
                nextSlide.classList.add('active');
            } else {
                prevSlide.classList.remove('active', 'from-left', 'from-right');
                prevSlide.classList.add('slide-to-right');

                nextSlide.classList.remove('slide-to-left', 'slide-to-right', 'active');
                nextSlide.classList.add('from-left');
                void nextSlide.offsetWidth; // Force reflow

                nextSlide.classList.remove('from-left');
                nextSlide.classList.add('active');
            }

            // 2. Synchronize Video Playback
            const prevVideo = prevSlide.querySelector('video');
            if (prevVideo) {
                prevVideo.pause();
            }

            const nextVideo = nextSlide.querySelector('video');
            if (nextVideo) {
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

            resetAllTabProgress();
            triggerTabProgress(tabs[normalizedIndex]);

            currentIndex = normalizedIndex;

            // Clean up transition lock and extra classes after animation completes (850ms)
            setTimeout(() => {
                slides.forEach((s, idx) => {
                    if (idx !== currentIndex) {
                        s.classList.remove('slide-to-left', 'from-left', 'from-right', 'active');
                        s.classList.add('slide-to-right');
                    }
                });
                isTransitioning = false;
            }, 850);

            // 4. Reset Timer
            if (isAutoplayActive) {
                startTimer();
            }
        }

        function startTimer() {
            clearTimeout(slideTimer);
            slideTimer = setTimeout(() => {
                if (isAutoplayActive) {
                    goToSlide(currentIndex + 1, 'forward');
                }
            }, duration);
        }

        function stopTimer() {
            clearTimeout(slideTimer);
        }

        // Prev / Next Button Controls
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                goToSlide(currentIndex - 1, 'backward');
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                goToSlide(currentIndex + 1, 'forward');
            });
        }

        // Tab Clicks
        tabs.forEach((tab, index) => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const dir = index > currentIndex ? 'forward' : (index < currentIndex ? 'backward' : null);
                goToSlide(index, dir);
            });
        });

        // Autoplay Toggle (if button exists)
        if (toggleAutoplayBtn) {
            toggleAutoplayBtn.addEventListener('click', () => {
                isAutoplayActive = !isAutoplayActive;
                if (isAutoplayActive) {
                    triggerTabProgress(tabs[currentIndex]);
                    startTimer();
                } else {
                    stopTimer();
                    resetAllTabProgress();
                }
            });
        }

        // Visibility Change (pause when switching tab, resume on return)
        document.addEventListener('visibilitychange', () => {
            const activeVideo = slides[currentIndex]?.querySelector('video');
            if (document.hidden) {
                stopTimer();
                if (activeVideo) activeVideo.pause();
            } else {
                if (activeVideo) activeVideo.play().catch(() => {});
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
            const swipeDistance = touchEndX - touchStartX;
            const threshold = 40;
            if (swipeDistance > threshold) {
                goToSlide(currentIndex - 1, 'backward');
            } else if (swipeDistance < -threshold) {
                goToSlide(currentIndex + 1, 'forward');
            }
        }, { passive: true });

        // Initial Kickstart
        resetAllTabProgress();
        triggerTabProgress(tabs[0]);
        if (isAutoplayActive) {
            startTimer();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeroSlider);
    } else {
        initHeroSlider();
    }
})();
