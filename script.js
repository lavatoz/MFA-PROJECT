document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Management ---
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // --- Utility Functions ---
    const showAlert = (message, type = 'error') => {
        const alertBox = document.getElementById('alert');
        if (!alertBox) return;
        alertBox.textContent = message;
        alertBox.className = `alert alert-${type}`;
        alertBox.style.display = 'block';
        setTimeout(() => {
            alertBox.style.display = 'none';
        }, 5000);
    };

    const toggleLoader = (show) => {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = show ? 'inline-block' : 'none';
    };

    // --- Login Logic ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            toggleLoader(true);

            // Simulate server delay
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const user = users.find(u => u.email === email && u.password === password);

                if (user) {
                    // Set partial session (awaiting OTP)
                    localStorage.setItem('pendingUser', JSON.stringify(user));
                    window.location.href = 'otp.html';
                } else {
                    showAlert('Invalid email or password');
                    toggleLoader(false);
                }
            }, 1000);
        });
    }

    // --- Registration Logic ---
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            toggleLoader(true);

            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                if (users.some(u => u.email === email)) {
                    showAlert('Email already registered');
                    toggleLoader(false);
                    return;
                }

                users.push({ name, email, password });
                localStorage.setItem('users', JSON.stringify(users));
                showAlert('Registration successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }, 1000);
        });
    }

    // --- OTP Logic ---
    const otpForm = document.getElementById('otpForm');
    if (otpForm) {
        const inputs = document.querySelectorAll('.otp-input');
        const resendBtn = document.getElementById('resendBtn');
        const timerSpan = document.getElementById('timer');
        let timeLeft = 30;

        // Auto-focus next/prev input
        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value.length === 1 && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    inputs[index - 1].focus();
                }
            });
        });

        // Resend Timer
        const startTimer = () => {
            resendBtn.disabled = true;
            timeLeft = 30;
            const interval = setInterval(() => {
                timeLeft--;
                timerSpan.textContent = timeLeft;
                if (timeLeft <= 0) {
                    clearInterval(interval);
                    resendBtn.disabled = false;
                    resendBtn.innerHTML = 'Resend OTP';
                }
            }, 1000);
        };
        startTimer();

        resendBtn.addEventListener('click', () => {
            showAlert('OTP resent! (123456)', 'success');
            startTimer();
            resendBtn.innerHTML = 'Resend in <span id="timer">30</span>s';
        });

        otpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const enteredOtp = Array.from(inputs).map(i => i.value).join('');
            toggleLoader(true);

            setTimeout(() => {
                if (enteredOtp === '123456') {
                    const pendingUser = JSON.parse(localStorage.getItem('pendingUser'));
                    if (pendingUser) {
                        localStorage.setItem('currentUser', JSON.stringify(pendingUser));
                        localStorage.removeItem('pendingUser');
                        window.location.href = 'dashboard.html';
                    }
                } else {
                    showAlert('Invalid OTP. Please try again.');
                    toggleLoader(false);
                }
            }, 1000);
        });
    }

    // --- Dashboard logic & Protection ---
    const userNameSpan = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');

    if (userNameSpan || window.location.pathname.includes('dashboard.html')) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }

        if (userNameSpan) {
            userNameSpan.textContent = currentUser.name;
            const avatar = document.getElementById('avatar');
            if (avatar) avatar.textContent = currentUser.name[0].toUpperCase();
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            });
        }
    }
});
