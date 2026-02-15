/* ============================================
   Main — Application Entry Point
   ============================================ */
const App = (() => {
    let allDams = [];
    let filteredDams = [];
    let currentView = 'map'; // 'map' or 'list'
    let currentSort = 'name';

    async function init() {
        // Theme first
        Theme.init();
        I18n.applyTranslations();

        // Auth check — if not authenticated, wait for auth
        const authed = Auth.init();
        if (!authed) return; // Auth will call initAfterAuth on success

        await initAfterAuth();
    }

    async function initAfterAuth() {
        // Load data
        allDams = await DamData.load();
        filteredDams = [...allDams];

        // Init modules
        DamMap.init();
        I18n.applyTranslations();
        Filter.init(onFilterChange);
        Export.init();

        // Initial render
        applyFilterAndRender();
        updateTimestamp();

        // Bind events
        bindEvents();
    }

    function bindEvents() {
        // View toggle
        document.getElementById('btn-map-view').addEventListener('click', () => switchView('map'));
        document.getElementById('btn-list-view').addEventListener('click', () => switchView('list'));

        // Theme
        document.getElementById('btn-theme').addEventListener('click', () => {
            Theme.toggle();
            // Refresh chart if open
            const damId = Detail.getCurrentDamId();
            if (damId) Detail.show(damId);
        });

        // Language
        document.getElementById('btn-lang').addEventListener('click', () => {
            I18n.toggleLang();
            Filter.refresh();
            applyFilterAndRender();
            updateTimestamp();
        });

        // Sort
        document.getElementById('sort-select').addEventListener('change', e => {
            currentSort = e.target.value;
            applyFilterAndRender();
        });

        // Table header sort
        document.querySelectorAll('.list-table th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const key = th.dataset.sort;
                const sortMap = {
                    name: 'name',
                    prefecture: 'prefecture',
                    type: 'name',
                    capacity: 'capacity-desc',
                    effective: 'capacity-desc',
                    rate: 'rate-desc',
                    level: 'rate-desc'
                };
                currentSort = sortMap[key] || 'name';
                document.getElementById('sort-select').value = currentSort;
                applyFilterAndRender();
            });
        });

        // Detail close
        document.getElementById('detail-close').addEventListener('click', () => Detail.hide());


    }

    function switchView(view) {
        currentView = view;
        const mapContainer = document.getElementById('map-container');
        const listContainer = document.getElementById('list-container');
        const btnMap = document.getElementById('btn-map-view');
        const btnList = document.getElementById('btn-list-view');

        if (view === 'map') {
            mapContainer.classList.remove('hidden');
            listContainer.classList.add('hidden');
            btnMap.classList.add('active');
            btnList.classList.remove('active');
            DamMap.invalidateSize();
        } else {
            mapContainer.classList.add('hidden');
            listContainer.classList.remove('hidden');
            btnMap.classList.remove('active');
            btnList.classList.add('active');
        }
    }

    function onFilterChange(filters) {
        applyFilterAndRender(filters);
    }

    function applyFilterAndRender(filters) {
        if (!filters) filters = Filter.getFilters();

        // Filter
        filteredDams = DamData.filterData(allDams, filters);

        // Sort
        filteredDams = DamData.sortData(filteredDams, currentSort);

        // Update views
        DamMap.setMarkers(filteredDams);
        DamList.render(filteredDams);
        Filter.updateStats(filteredDams);
    }

    function updateTimestamp() {
        const ts = DamData.getTimestamp();
        const el = document.getElementById('data-timestamp');
        if (ts) {
            el.textContent = I18n.t('updated_at', { time: new Date(ts).toLocaleString(I18n.getLang() === 'ja' ? 'ja-JP' : 'en-US') });
        } else {
            el.textContent = '';
        }
    }

    return { init, initAfterAuth };
})();

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
