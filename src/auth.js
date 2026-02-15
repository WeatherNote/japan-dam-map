/* ============================================
   Auth — Simple Password Authentication
   ============================================ */
const Auth = (() => {
    // SHA-256 hash of "ag2"
    const PASSWORD_HASH = '7c4ba5e81e7fafebaf8a84e24abd7cc4b23aeddf2cd81c19690e3dceb72df3ac';

    async function sha256(str) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    function isAuthenticated() {
        return sessionStorage.getItem('dam-map-auth') === 'true';
    }

    function init() {
        const overlay = document.getElementById('auth-overlay');
        const app = document.getElementById('app');
        const input = document.getElementById('auth-password');
        const submit = document.getElementById('auth-submit');
        const error = document.getElementById('auth-error');

        if (isAuthenticated()) {
            overlay.classList.add('hidden');
            app.classList.remove('hidden');
            return true;
        }

        overlay.classList.remove('hidden');
        app.classList.add('hidden');

        async function tryLogin() {
            const pw = input.value;
            const hash = await sha256(pw);
            if (hash === PASSWORD_HASH) {
                sessionStorage.setItem('dam-map-auth', 'true');
                overlay.style.animation = 'fadeOut 0.3s ease forwards';
                setTimeout(() => {
                    overlay.classList.add('hidden');
                    overlay.style.animation = '';
                    app.classList.remove('hidden');
                    // Initialize app after auth
                    if (typeof App !== 'undefined' && App.initAfterAuth) {
                        App.initAfterAuth();
                    }
                }, 300);
            } else {
                error.classList.add('visible');
                input.value = '';
                input.style.animation = 'shake 0.4s ease';
                setTimeout(() => { input.style.animation = ''; }, 400);
            }
        }

        submit.addEventListener('click', tryLogin);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); });

        // Focus input
        setTimeout(() => input.focus(), 100);
        return false;
    }

    return { init, isAuthenticated };
})();

// Add shake keyframe
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }
  @keyframes fadeOut { to { opacity: 0; } }
`;
document.head.appendChild(shakeStyle);
