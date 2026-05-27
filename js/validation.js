/**
 * She Can Foundation - Internship & Volunteer Form Validation
 * Fully interactive and validation-rich.
 */

document.addEventListener('DOMContentLoaded', () => {
    initFormValidation();
});

function initFormValidation() {
    const form = document.getElementById('joinForm');
    if (!form) return;

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const roleInput = document.getElementById('role');
    const termsInput = document.getElementById('terms');
    const charCounter = document.getElementById('charCount');
    const submitBtn = document.getElementById('submitBtn');
    const successModal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    // Validation patterns
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Live Message Character Counter
    if (messageInput && charCounter) {
        messageInput.addEventListener('input', () => {
            const count = messageInput.value.length;
            charCounter.textContent = `${count}/500`;
            if (count > 450) {
                charCounter.style.color = 'var(--danger)';
            } else {
                charCounter.style.color = 'var(--text-muted)';
            }
        });
    }

    // Input validations
    const validateField = (input, validatorFn, errorMsgId) => {
        const errorMsg = document.getElementById(errorMsgId);
        const isValid = validatorFn(input.value);

        if (isValid) {
            input.classList.remove('invalid');
            input.classList.add('valid');
            if (errorMsg) errorMsg.style.display = 'none';
            return true;
        } else {
            input.classList.remove('valid');
            input.classList.add('invalid');
            if (errorMsg) errorMsg.style.display = 'flex';
            return false;
        }
    };

    // Validators
    const nameValidator = (val) => val.trim().length >= 3 && /^[A-Za-z\s]+$/.test(val.trim());
    const emailValidator = (val) => emailRegex.test(val.trim());
    const roleValidator = (val) => val !== "";
    const messageValidator = (val) => val.trim().length >= 10 && val.trim().length <= 500;
    const termsValidator = () => termsInput.checked;

    // Attach listeners for live feedback on typing/focus-out
    nameInput.addEventListener('blur', () => validateField(nameInput, nameValidator, 'nameError'));
    nameInput.addEventListener('input', () => {
        if (nameInput.classList.contains('invalid')) {
            validateField(nameInput, nameValidator, 'nameError');
        }
    });

    emailInput.addEventListener('blur', () => validateField(emailInput, emailValidator, 'emailError'));
    emailInput.addEventListener('input', () => {
        if (emailInput.classList.contains('invalid')) {
            validateField(emailInput, emailValidator, 'emailError');
        }
    });

    roleInput.addEventListener('change', () => validateField(roleInput, roleValidator, 'roleError'));

    messageInput.addEventListener('blur', () => validateField(messageInput, messageValidator, 'messageError'));
    messageInput.addEventListener('input', () => {
        if (messageInput.classList.contains('invalid')) {
            validateField(messageInput, messageValidator, 'messageError');
        }
    });

    // Form submit intercept
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Perform check across all fields
        const isNameValid = validateField(nameInput, nameValidator, 'nameError');
        const isEmailValid = validateField(emailInput, emailValidator, 'emailError');
        const isRoleValid = validateField(roleInput, roleValidator, 'roleError');
        const isMessageValid = validateField(messageInput, messageValidator, 'messageError');
        
        let isTermsValid = true;
        if (termsInput) {
            const termsError = document.getElementById('termsError');
            isTermsValid = termsValidator();
            if (isTermsValid) {
                termsInput.classList.remove('invalid');
                if (termsError) termsError.style.display = 'none';
            } else {
                termsInput.classList.add('invalid');
                if (termsError) termsError.style.display = 'flex';
            }
        }

        if (isNameValid && isEmailValid && isRoleValid && isMessageValid && isTermsValid) {
            // Disable button, show loading animation
            submitBtn.disabled = true;
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = `
                <span class="btn-loader-text">Submitting...</span>
                <span class="btn-spinner"></span>
            `;

            // Real server POST request
            fetch('/api/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: nameInput.value,
                    email: emailInput.value,
                    role: roleInput.value,
                    message: messageInput.value
                })
            })
            .then(response => response.json().then(data => {
                if (response.ok && data.success) {
                    // Show Success Modal
                    successModal.classList.add('active');
                    document.body.style.overflow = 'hidden';

                    // Reset Form
                    form.reset();
                    
                    // Remove green/red helper classes
                    [nameInput, emailInput, roleInput, messageInput].forEach(input => {
                        input.classList.remove('valid', 'invalid');
                    });
                    
                    if (charCounter) charCounter.textContent = '0/500';
                } else {
                    // Show validation error on screen
                    alert(data.error || 'Submission failed. Please verify your fields.');
                }
            }))
            .catch(err => {
                console.error('Error submitting form:', err);
                alert('Connection error. Please try again later.');
            })
            .finally(() => {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            });
        } else {
            // Find first error element and scroll to it
            const firstError = form.querySelector('.invalid');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
        }
    });

    // Close Modal listeners
    const hideModal = () => {
        successModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideModal);
    }
    
    if (successModal) {
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) hideModal();
        });
    }
}
