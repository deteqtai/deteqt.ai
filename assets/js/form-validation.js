// Form Validation for Book Meeting Page
(function() {
    'use strict';

    // Show error message
    function showError(input, errorElement, message) {
        input.classList.add('error');
        errorElement.textContent = message;
    }

    // Clear error message
    function clearError(input, errorElement) {
        input.classList.remove('error');
        errorElement.textContent = '';
    }

    // EmailJS Integration
    function sendEmails(userEmail, selectedIndustries, submitButton, recaptchaResponse) {
        const form = document.getElementById('bookingForm');
        const emailError = document.getElementById('email-error');
        const successMessage = document.getElementById('successMessage');

        // Check if EmailJS is loaded
        if (typeof emailjs === 'undefined') {
            console.error('EmailJS is not loaded. Please check the script tag.');
            submitButton.disabled = false;
            submitButton.querySelector('.button-text').textContent = 'Submit';
            showError(
                document.getElementById('email'),
                emailError,
                'Failed to submit form. Please try again or contact us directly.'
            );
            return;
        }

        // Configuration - EmailJS credentials
        const SERVICE_ID = 'service_rh40qdg';
        const USER_TEMPLATE_ID = 'template_2tlcpty';
        const PUBLIC_KEY = 'H82v1rZUW3t2_Usfx';

        // Initialize EmailJS with your public key
        emailjs.init(PUBLIC_KEY);

        // Format industries for display
        const industriesLabels = {
            'banking-finance': 'Banking And Finance',
            'education': 'Education',
            'government': 'Government',
            'heavy-equipment': 'Heavy Equipment',
            'manufacturing': 'Manufacturing',
            'retail': 'Retail',
            'semiconductor': 'Semiconductor',
            'steel': 'Steel',
            'transportation': 'Transportation',
            'other': 'Other'
        };
        const industriesList = selectedIndustries.map(industry => industriesLabels[industry] || industry).join(', ');

        // Template parameters for user email
        const userTemplateParams = {
            to_email: userEmail,
            to_name: userEmail.split('@')[0],
            company_name: userEmail.split('@')[1],
            industries: industriesList,
            current_year: new Date().getFullYear(),
            'g-recaptcha-response': recaptchaResponse
        };

        // Send user thank you email
        emailjs.send(SERVICE_ID, USER_TEMPLATE_ID, userTemplateParams)
        .then(function(response) {
            console.log('Email sent successfully!', response);

            // Reset reCAPTCHA
            if (typeof grecaptcha !== 'undefined') {
                grecaptcha.reset();
            }

            // Hide form
            form.style.display = 'none';

            // Show success message
            successMessage.style.display = 'flex';

            // Track with Google Analytics if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submit', {
                    'event_category': 'engagement',
                    'event_label': 'book_meeting',
                    'value': 1
                });
            }

            // Reset form after 5 seconds
            setTimeout(() => {
                form.reset();
                form.style.display = 'flex';
                successMessage.style.display = 'none';
                submitButton.disabled = false;
                submitButton.querySelector('.button-text').textContent = 'Submit';
            }, 5000);
        })
        .catch(function(error) {
            console.error('Failed to send emails:', error);

            // Reset reCAPTCHA
            if (typeof grecaptcha !== 'undefined') {
                grecaptcha.reset();
            }

            submitButton.disabled = false;
            submitButton.querySelector('.button-text').textContent = 'Submit';
            showError(
                document.getElementById('email'),
                emailError,
                'Failed to submit form. Please try again or contact us directly.'
            );
        });
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initForm);
    } else {
        initForm();
    }

    function initForm() {
        const form = document.getElementById('bookingForm');
        if (!form) return; // Form doesn't exist on this page

        const emailInput = document.getElementById('email');
        const emailError = document.getElementById('email-error');
        const industriesContainer = document.getElementById('industries');
        const industriesCheckboxes = industriesContainer ? industriesContainer.querySelectorAll('input[type="checkbox"]') : [];
        const industriesError = document.getElementById('industries-error');
        const successMessage = document.getElementById('successMessage');

        // List of common free email providers
        const freeEmailProviders = [
            'gmail.com',
            'yahoo.com',
            'hotmail.com',
            'outlook.com',
            'aol.com',
            'icloud.com',
            'mail.com',
            'protonmail.com',
            'zoho.com',
            'yandex.com',
            'gmx.com',
            'mail.ru',
            'inbox.com',
            'live.com',
            'msn.com',
            'me.com',
            'mac.com'
        ];

        // Email validation function
        function validateEmail(email) {
            // Basic email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!email) {
                return {
                    valid: false,
                    message: 'Enter a value for this field.'
                };
            }

            if (!emailRegex.test(email)) {
                return {
                    valid: false,
                    message: 'Please enter a valid email address.'
                };
            }

            // Check if it's a free email provider
            const domain = email.split('@')[1]?.toLowerCase();
            if (freeEmailProviders.includes(domain)) {
                return {
                    valid: false,
                    message: 'Please use your company or organization email address.'
                };
            }

            return {
                valid: true,
                message: ''
            };
        }

        // Industries validation function
        function validateIndustries(selectedOptions) {
            if (!selectedOptions || selectedOptions.length === 0) {
                return {
                    valid: false,
                    message: 'Please select at least one industry.'
                };
            }
            return {
                valid: true,
                message: ''
            };
        }

        // Real-time validation on input blur
        emailInput.addEventListener('blur', function() {
            const validation = validateEmail(this.value.trim());
            if (!validation.valid) {
                showError(this, emailError, validation.message);
            } else {
                clearError(this, emailError);
            }
        });

        // Clear error on input focus
        emailInput.addEventListener('focus', function() {
            clearError(this, emailError);
        });

        // Real-time validation while typing (with debounce and Latin character restriction)
        let typingTimer;
        const typingDelay = 800; // milliseconds
        let latinCheckTimeout;

        emailInput.addEventListener('input', function() {
            const cursorPosition = this.selectionStart;
            const originalValue = this.value;

            // Allow only Latin letters, numbers, and email symbols (@, ., -, _, +)
            const latinOnly = originalValue.replace(/[^a-zA-Z0-9@.\-_+]/g, '');

            if (originalValue !== latinOnly) {
                this.value = latinOnly;
                // Restore cursor position
                this.setSelectionRange(cursorPosition - 1, cursorPosition - 1);

                // Show warning if non-Latin characters were removed
                showError(this, emailError, 'Only Latin characters are allowed.');

                // Clear error after 2 seconds
                clearTimeout(latinCheckTimeout);
                latinCheckTimeout = setTimeout(() => {
                    if (this.value === latinOnly && emailError.textContent === 'Only Latin characters are allowed.') {
                        clearError(this, emailError);
                    }
                }, 2000);
            } else {
                // Clear Latin character error if it exists
                if (emailError.textContent === 'Only Latin characters are allowed.') {
                    clearError(this, emailError);
                }
            }

            // Debounced email validation
            clearTimeout(typingTimer);
            if (this.value.trim()) {
                typingTimer = setTimeout(() => {
                    const validation = validateEmail(this.value.trim());
                    if (!validation.valid) {
                        showError(this, emailError, validation.message);
                    } else {
                        clearError(this, emailError);
                    }
                }, typingDelay);
            } else {
                clearError(this, emailError);
            }
        });

        // Industries validation on checkbox change
        industriesCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const selectedIndustries = Array.from(industriesCheckboxes)
                    .filter(cb => cb.checked)
                    .map(cb => cb.value);
                const validation = validateIndustries(selectedIndustries);
                if (!validation.valid) {
                    showError(industriesContainer, industriesError, validation.message);
                } else {
                    clearError(industriesContainer, industriesError);
                }
            });
        });

        // Form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = emailInput.value.trim();
            const emailValidation = validateEmail(email);

            // Get selected industries from checkboxes
            const selectedIndustries = Array.from(industriesCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);
            const industriesValidation = validateIndustries(selectedIndustries);

            // Validate fields
            let hasErrors = false;

            if (!emailValidation.valid) {
                showError(emailInput, emailError, emailValidation.message);
                emailInput.focus();
                hasErrors = true;
            }

            if (!industriesValidation.valid) {
                showError(industriesContainer, industriesError, industriesValidation.message);
                if (!hasErrors && industriesCheckboxes.length > 0) industriesCheckboxes[0].focus();
                hasErrors = true;
            }

            if (hasErrors) {
                return;
            }

            // Get reCAPTCHA response
            const recaptchaResponse = grecaptcha.getResponse();

            if (!recaptchaResponse) {
                showError(emailInput, emailError, 'Please complete the reCAPTCHA verification.');
                return;
            }

            // Disable submit button
            const submitButton = form.querySelector('.submit-button');
            submitButton.disabled = true;
            submitButton.querySelector('.button-text').textContent = 'Submitting...';

            // Send emails
            sendEmails(email, selectedIndustries, submitButton, recaptchaResponse);
        });

        // Prevent form submission on Enter key in input
        emailInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                form.dispatchEvent(new Event('submit'));
            }
        });
    }
})();