// Email Protection Script - Prevents bot scraping
(function() {
    'use strict';

    // Wait for DOM to be ready
    function initEmailProtection() {
        const emailLink = document.getElementById('contactEmail');

        if (!emailLink) return;

        // Get obfuscated data
        const user = emailLink.getAttribute('data-user');
        const domain = emailLink.getAttribute('data-domain');

        if (!user || !domain) return;

        // Reverse the strings (they are stored reversed)
        const actualUser = user.split('').reverse().join('');
        const actualDomain = domain.split('').reverse().join('');

        // Construct email
        const email = actualUser + '@' + actualDomain;

        // Set mailto link
        emailLink.href = 'mailto:' + email;

        // Update display text on hover to show actual email
        const emailText = emailLink.querySelector('.email-text');

        if (emailText) {
            emailLink.addEventListener('mouseenter', function() {
                emailText.textContent = email;
            });

            emailLink.addEventListener('mouseleave', function() {
                emailText.textContent = 'Contact Us';
            });

            // For mobile - show email on click
            emailLink.addEventListener('touchstart', function(e) {
                if (emailText.textContent === 'Contact Us') {
                    e.preventDefault();
                    emailText.textContent = email;

                    // Open mailto after showing email
                    setTimeout(function() {
                        window.location.href = emailLink.href;
                    }, 800);
                }
            }, { passive: false });
        }

        // Remove data attributes to prevent easy scraping
        emailLink.removeAttribute('data-user');
        emailLink.removeAttribute('data-domain');

        // Add click analytics if gtag exists
        emailLink.addEventListener('click', function() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'contact_click', {
                    'event_category': 'engagement',
                    'event_label': 'email_contact'
                });
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEmailProtection);
    } else {
        initEmailProtection();
    }
})();