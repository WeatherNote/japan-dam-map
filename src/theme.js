/* ============================================
   Theme — Dark/Light Toggle Module
   ============================================ */
const Theme = (() => {
    let currentTheme = localStorage.getItem('dam-map-theme') || 'light';

    function init() {
        document.documentElement.setAttribute('data-theme', currentTheme);
        updateIcon();
    }

    function toggle() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('dam-map-theme', currentTheme);
        updateIcon();

        // Notify map to switch tile layer
        if (typeof DamMap !== 'undefined' && DamMap.updateTileLayer) {
            DamMap.updateTileLayer(currentTheme);
        }
    }

    function get() { return currentTheme; }

    function updateIcon() {
        const icon = document.getElementById('theme-icon');
        if (icon) icon.textContent = currentTheme === 'light' ? '🌙' : '☀️';
    }

    return { init, toggle, get };
})();
