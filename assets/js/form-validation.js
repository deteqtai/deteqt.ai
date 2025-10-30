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
        const ADMIN_TEMPLATE_ID = 'template_xha3i59';
        const ADMIN_EMAIL = 'we@deteqt.ai';
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

        // Template parameters for admin notification email
        const submissionDate = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        });

        const adminTemplateParams = {
            to_email: ADMIN_EMAIL,
            user_email: userEmail,
            user_domain: userEmail.split('@')[1],
            industries: industriesList,
            submission_date: submissionDate,
            current_year: new Date().getFullYear()
        };

        // Send both emails (user thank you + admin notification)
        Promise.all([
            emailjs.send(SERVICE_ID, USER_TEMPLATE_ID, userTemplateParams),
            emailjs.send(SERVICE_ID, ADMIN_TEMPLATE_ID, adminTemplateParams)
        ])
        .then(function(responses) {
            console.log('Both emails sent successfully!', responses);

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
                submitButton.querySelector('.button-text').textContent = 'Submit';

                // Reset form state
                if (typeof window.resetFormState === 'function') {
                    window.resetFormState();
                }
            }, 5000);
        })
        .catch(function(error) {
            console.error('Failed to send emails:', error);

            // Reset reCAPTCHA
            if (typeof grecaptcha !== 'undefined') {
                grecaptcha.reset();
            }

            submitButton.querySelector('.button-text').textContent = 'Submit';

            // Reset form state
            if (typeof window.resetFormState === 'function') {
                window.resetFormState();
            }

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
        const submitButton = form.querySelector('.submit-button');

        // Form validation state
        const formState = {
            emailValid: false,
            industriesValid: false,
            recaptchaValid: false
        };

        // Update submit button state based on form validation
        function updateSubmitButton() {
            const isValid = formState.emailValid && formState.industriesValid && formState.recaptchaValid;
            submitButton.disabled = !isValid;

            console.log('🔘 Submit button state:', {
                emailValid: formState.emailValid,
                industriesValid: formState.industriesValid,
                recaptchaValid: formState.recaptchaValid,
                buttonEnabled: isValid
            });
        }

        // Initialize button as disabled
        submitButton.disabled = true;

        // Monitor reCAPTCHA completion
        let recaptchaCheckInterval = setInterval(function() {
            if (typeof grecaptcha !== 'undefined') {
                const recaptchaResponse = grecaptcha.getResponse();
                const wasValid = formState.recaptchaValid;
                formState.recaptchaValid = recaptchaResponse.length > 0;

                // Only update button if state changed
                if (wasValid !== formState.recaptchaValid) {
                    console.log('🔐 reCAPTCHA state changed:', formState.recaptchaValid);
                    updateSubmitButton();
                }
            }
        }, 500); // Check every 500ms

        // Clean up interval when form is removed
        window.addEventListener('beforeunload', function() {
            clearInterval(recaptchaCheckInterval);
        });

        // Global function to reset form state
        window.resetFormState = function() {
            formState.emailValid = false;
            formState.industriesValid = false;
            formState.recaptchaValid = false;
            updateSubmitButton();
            console.log('🔄 Form state reset');
        };

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

        // Check MX records using Google Public DNS API
        async function checkMXRecords(domain) {
            console.log('🔍 Checking MX records for domain:', domain);

            try {
                const url = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`;
                console.log('🌐 Fetching:', url);

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/dns-json'
                    }
                });

                console.log('📡 Response status:', response.status);

                if (!response.ok) {
                    // If DNS API fails, return true (fallback - don't block user)
                    console.warn('⚠️ DNS API request failed, allowing email:', response.status);
                    return { valid: true, fallback: true };
                }

                const data = await response.json();
                console.log('📦 DNS Response data:', data);

                // Status 0 means NOERROR (successful query)
                // Check if Answer array exists and has MX records
                if (data.Status === 0 && data.Answer && data.Answer.length > 0) {
                    // MX records found
                    console.log('✅ MX records found:', data.Answer.length);
                    return { valid: true, fallback: false };
                } else {
                    // No MX records found
                    console.log('❌ No MX records found. Status:', data.Status);
                    return { valid: false, fallback: false };
                }
            } catch (error) {
                // Network error or other issue - fallback to allowing the email
                console.error('❌ MX record check failed:', error);
                return { valid: true, fallback: true };
            }
        }

        // Email validation function (synchronous - basic checks only)
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

        // Async email validation with MX record check
        async function validateEmailWithMX(email) {
            console.log('🔍 validateEmailWithMX called for:', email);

            // First, do basic validation
            const basicValidation = validateEmail(email);
            console.log('📋 Basic validation result:', basicValidation);

            if (!basicValidation.valid) {
                return basicValidation;
            }

            // Extract domain
            const domain = email.split('@')[1]?.toLowerCase();
            console.log('🌐 Extracted domain:', domain);

            if (!domain) {
                return {
                    valid: false,
                    message: 'Please enter a valid email address.'
                };
            }

            // Check MX records
            console.log('⏳ Calling checkMXRecords...');
            const mxCheck = await checkMXRecords(domain);
            console.log('✔️ MX check result:', mxCheck);

            if (!mxCheck.valid) {
                return {
                    valid: false,
                    message: 'This email domain cannot receive emails. Please use a valid company email address.'
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

        // Real-time validation on input blur (with MX check)
        emailInput.addEventListener('blur', async function() {
            const email = this.value.trim();

            // If empty, mark as invalid and clear errors
            if (!email) {
                formState.emailValid = false;
                updateSubmitButton();
                clearError(this, emailError);
                return;
            }

            // Show verifying state
            this.classList.add('validating');
            emailError.textContent = 'Verifying email domain...';
            emailError.style.color = '#666';

            console.log('🔵 Blur event - validating email:', email);

            // Run async validation with MX check
            const validation = await validateEmailWithMX(email);

            console.log('🔵 Blur validation result:', validation);

            // Remove validating state
            this.classList.remove('validating');
            emailError.style.color = '';

            if (!validation.valid) {
                formState.emailValid = false;
                showError(this, emailError, validation.message);
            } else {
                formState.emailValid = true;
                clearError(this, emailError);
            }

            updateSubmitButton();
        });

        // Clear error on input focus (only if email is currently valid or empty)
        emailInput.addEventListener('focus', function() {
            // Don't clear error if email was marked as invalid
            // This keeps the error visible while user is typing corrections
            if (formState.emailValid || !this.value.trim()) {
                clearError(this, emailError);
            }
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

            // Debounced email validation (basic format check only)
            clearTimeout(typingTimer);
            if (this.value.trim()) {
                typingTimer = setTimeout(() => {
                    const validation = validateEmail(this.value.trim());
                    if (!validation.valid) {
                        // Show format errors (regex, free email)
                        showError(this, emailError, validation.message);
                    } else {
                        // Only clear error if email was previously valid
                        // Don't clear MX validation errors during typing
                        if (formState.emailValid) {
                            clearError(this, emailError);
                        }
                    }
                }, typingDelay);
            } else {
                // Only clear if no MX validation error exists
                if (formState.emailValid || !emailError.textContent) {
                    clearError(this, emailError);
                }
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
                    formState.industriesValid = false;
                    showError(industriesContainer, industriesError, validation.message);
                } else {
                    formState.industriesValid = true;
                    clearError(industriesContainer, industriesError);
                }

                updateSubmitButton();
            });
        });

        // Form submission
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📝 Form submitted');

            const email = emailInput.value.trim();
            console.log('📧 Email entered:', email);

            // Get selected industries from checkboxes
            const selectedIndustries = Array.from(industriesCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);
            const industriesValidation = validateIndustries(selectedIndustries);
            console.log('🏭 Industries selected:', selectedIndustries);

            // Validate industries first
            if (!industriesValidation.valid) {
                console.log('❌ Industries validation failed');
                showError(industriesContainer, industriesError, industriesValidation.message);
                if (industriesCheckboxes.length > 0) industriesCheckboxes[0].focus();
                return;
            }

            // Get reCAPTCHA response
            const recaptchaResponse = grecaptcha.getResponse();
            console.log('🔐 reCAPTCHA response:', recaptchaResponse ? 'Present' : 'Missing');

            if (!recaptchaResponse) {
                console.log('❌ reCAPTCHA validation failed');
                showError(emailInput, emailError, 'Please complete the reCAPTCHA verification.');
                return;
            }

            // Disable submit button and show verifying state
            submitButton.disabled = true;
            submitButton.querySelector('.button-text').textContent = 'Verifying email...';
            console.log('🔄 Starting MX validation...');

            // Validate email with MX record check (async)
            const emailValidation = await validateEmailWithMX(email);
            console.log('📊 Email validation result:', emailValidation);

            if (!emailValidation.valid) {
                console.log('❌ Email validation failed:', emailValidation.message);
                showError(emailInput, emailError, emailValidation.message);
                emailInput.focus();
                // Re-enable submit button based on form state
                formState.emailValid = false;
                updateSubmitButton();
                submitButton.querySelector('.button-text').textContent = 'Submit';
                return;
            }

            // Clear any previous errors
            clearError(emailInput, emailError);

            // Update button text to submitting
            submitButton.querySelector('.button-text').textContent = 'Submitting...';
            console.log('✅ All validations passed, sending emails...');

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