/*-----------------------------------------------------------------------
Template Name      : Zavique - Fashion and Lifestyle Ecommerce HTML Template
Author             : pus_infotech
Author Portfolio   : https://themeforest.net/user/pus_infotech
Version            : 1.0.0 
-------------------------------------------------------------------------
JS TABLE OF CONTENTS
-------------------------------------------------------------------------
1. mobile menu
2. offcanvas sidebar
3. header sticky
4. filters menu toggle
5. background image
6. hero slider 
7. testimonials slider
8. category slider
9. partners slider
10. related slider
11. gallery magnificPopup
12. video magnificPopup
13. counter
14. syotimer
15. quantity
16. mousecursor
17. wow animation
18. scroll to top
19. back-top
20. add active my account sidebar
21. remove active my account sidebar
22. preloader
-----------------------------------------------------------------------*/
(function($) {
    "use strict";      
    // start document ready function
    $(document).ready( function() {
        // ------------------------ 1. mobile menu
		$("#mobile-menu").meanmenu({
            meanMenuContainer: '.mobile-menu',
            meanScreenWidth: "1199",
            meanExpand: ['<i class="fa-solid fa-plus"></i>'],
        }); 

		// ------------------------ 2. offcanvas sidebar
		$(document).on("click", "#offcanvas-sidebar li.dropdown .dropdown-btn", function () {
			$(this).toggleClass('open');
			$(this).prev('ul').slideToggle(500);
		});

		// ------------------------ 3. header sticky
		$(window).on("scroll", function() {
            if ($(this).scrollTop() > 250) {
                $(".header").addClass("sticky");
            } else {
                $(".header").removeClass("sticky");
            }
        }); 

		// ------------------------ 4. filters menu toggle
		$(document).on("click", ".filter-icons, .filters-menu-close", function () {
			$(".filters-menu").toggleClass("active");
		});

        // ------------------------ 5. background image
		$("[data-img-src]").each(function () {
			var src = $(this).attr("data-img-src");
			$(this).css({
				"background-image": `url(${src})`,
				"background-position": "center",
				"background-size": "cover",
				"background-repeat": "no-repeat"
			}); 
			$(this).removeAttr("data-img-src");
		});

		// ------------------------ 6. hero slider 
		if($('.hero-slider').length > 0) {
            const heroSlider = new Swiper(".hero-slider", {
				loop: true,
				effect: "fade",
				fadeEffect: {
					crossFade: true
				},
				slidesPerView: 1,
				spaceBetween: 0,
				autoplay: {
					delay: 5000,
					disableOnInteraction: false,
				},
				pagination: {
                    el: ".dot",
                    clickable: true,
                },
            });
        } 

		// ------------------------ 7. testimonials slider
		if($('.testimonials-slider').length > 0) {
            const testimonialsSlider = new Swiper(".testimonials-slider", {
				loop: true,
				slidesPerView: 1,
				spaceBetween: 24,
				autoplay: {
					delay: 5500000,
					disableOnInteraction: false,
				},	
				pagination: {
                    el: ".dot",
                    clickable: true,
                },
				breakpoints: {
					320: {
						slidesPerView: 1,
					},
					567: {
						slidesPerView: 1,   
					},
					768: {
						slidesPerView: 2,
					},
					991: {
						slidesPerView: 2,
					},
					1199: {
						slidesPerView: 3,
					},
				}
            });
        }

		// ------------------------ 8. category slider
		if($('.category-slider').length > 0) {
            const testimonialsTwoSlider = new Swiper(".category-slider", {
				loop: true,
				slidesPerView: 1,
				spaceBetween: 24,
				autoplay: {
					delay: 3500,
					disableOnInteraction: false,
				},	
				pagination: {
                    el: ".dot",
                    clickable: true,
                },			
				breakpoints: {
					320: {
						slidesPerView: 1.5,
					},
					567: {
						slidesPerView: 2,   
					},
					768: {
						slidesPerView: 3,
					},
					991: {
						slidesPerView: 3,
					},
				}				 
            });
        } 

		// ------------------------ 9. partners slider
		if($('.partners-slider').length > 0) {
            const partnersSlider = new Swiper(".partners-slider", { 
				loop: true,
				slidesPerView: 2,
				spaceBetween: 30,
				autoplay: {
					delay: 3500,
					disableOnInteraction: false,
				},
				breakpoints: { 
					320: {
						slidesPerView: 2,
						spaceBetween: 20
					},
					567: {
						slidesPerView: 2,
					},
					767: {
						slidesPerView: 3,
					}, 
					991: {
						slidesPerView: 4,
					},
					1199: {
						slidesPerView: 5,
					} 
				} 
            });
        }

		// ------------------------ 10. related slider
		if($('.related-slider').length > 0) {
            const relatedSlider = new Swiper(".related-slider", {
                loop: true,
				slidesPerView: 1,
				spaceBetween: 30,
				autoplay: {
					delay: 3500,
					disableOnInteraction: false,
				},
				navigation: {
					nextEl: '.swiper-button-next',
					prevEl: '.swiper-button-prev',
				},
				pagination: {
                    el: ".dot",
                    clickable: true,
                },
				breakpoints: {  
					320: {
						slidesPerView: 2,
						spaceBetween: 20
					},
					767: {
						slidesPerView: 2,
						spaceBetween: 20
					},
					991: {
						slidesPerView: 3,
						spaceBetween: 20
					},
					1199: {
						slidesPerView: 4,
						spaceBetween: 20
					}
				},
            });
        }

        // ------------------------ 11. gallery magnificPopup 
		if ($(".photo-popup").length) {
			var groups = {};
			$(".photo-popup").each(function () {
				var id = parseInt($(this).attr("data-group"), 10);
				if (!groups[id]) {
					groups[id] = [];
				}
				groups[id].push(this);
			}); 
			$.each(groups, function () {
				$(this).magnificPopup({
					type: "image",
					closeOnContentClick: true,
					closeBtnInside: false,
					gallery: {
						enabled: true
					}
				});
			});
		}

		// ------------------------ 12. video magnificPopup
		$(".video-popup").magnificPopup({
			type:"iframe",
			mainClass:"mfp-fade",
			removalDelay:160,
			preloader:false,
			fixedContentPos:true
		});

        // ------------------------ 13. counter
		$(".counter-item").appear(function () {
			var $count = $(this),
			p = $count.find(".counter-value").attr("data-stop"),
			q = parseInt($count.find(".counter-value").attr("data-speed"), 10);

			if (!$count.hasClass('counted')) {
				$count.addClass('counted');
				$({
					countNum: $count.find(".counter-value").text()
				}).animate({
					countNum: p
				}, {
					duration: q,
					easing: "linear",
					step: function () {
						$count.find(".counter-value").text(Math.floor(this.countNum));
					},
					complete: function () {
						$count.find(".counter-value").text(this.countNum);
					}
				});
			}
		});

		// ------------------------ 14. syotimer
		$(".coming-soon-timer").syotimer({
            year: 2027, // Show Year
            month: 12, // Show Month
            day: 15, // Show Day
            hour: 20, // Show Hour
            minute: 30 // Show Minute
        }); 

		// ------------------------ 15. quantity 
		$(document).on("click", ".qty-btn-plus", function () {
			var $n = $(this).parent(".quantity-content").find(".input-qty");
			$n.val(Number($n.val()) + 1);
		}); 
		$(document).on("click", ".qty-btn-minus", function () {
			var $n = $(this).parent(".quantity-content").find(".input-qty");
			var amount = Number($n.val());
			if (amount > 0) {
				$n.val(amount - 1);
			}
		});

        // ------------------------ 16. mousecursor 
		const $cursorInner = document.querySelector(".cursor-inner");
        const $cursorOuter = document.querySelector(".cursor-outer");
        if ($("body").length && $cursorInner && $cursorOuter) {
            $(window).on("mousemove", function(e) {
                $cursorOuter.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
                $cursorInner.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
            });

            $("body").on("mouseenter", "a, .cursor-pointer", function () {
                $cursorInner.classList.add("cursor-hover");
                $cursorOuter.classList.add("cursor-hover");
            }).on("mouseleave", "a, .cursor-pointer", function () {
                if (!$(this).is("a") || !$(this).closest(".cursor-pointer").length) {
                    $cursorInner.classList.remove("cursor-hover");
                    $cursorOuter.classList.remove("cursor-hover");
                }
            });

            $cursorInner.style.visibility = "visible";
            $cursorOuter.style.visibility = "visible";
        }

        // ------------------------ 17. wow animation 
        new WOW({
			boxClass:     'wow',
			animateClass: 'animated',
			offset:       0,
			mobile:       false,
			live:         true
		}).init();

        // ------------------------ 18. scroll to top
        $(window).on("scroll", function () { 
			if ($(this).scrollTop() > 20) {
				$("#back-top").addClass("show");
			} else {
				$("#back-top").removeClass("show");
			}
		});
        
		// ------------------------ 19. back-top
		$(document).on("click", "#back-top", function() {
			$("html, body").animate({ 
				scrollTop: 0 
			}, 800);
			return false;
		});

		// ------------------------ 20. add active my account sidebar
		$(document).on("click", ".toggle-info span", function (e) { 
			$(".my-account-sidebar").addClass("show-mobile");
			$(".toggle-info").addClass("active");
		}); 

		// ------------------------ 21. remove active my account sidebar
		$(document).on("click", ".my-account-sidebar-close", function (e) { 
			$(".my-account-sidebar").removeClass("show-mobile");
			$(".toggle-info").removeClass("active");
		});
    });
    // end document ready function 
	
    // ------------------------ 22. preloader 
	function preloader() {
        $(window).on("load", function() { 
			$(".preloader").delay(600).fadeOut();
		});
    }
    preloader();
})(jQuery); // end jQuery