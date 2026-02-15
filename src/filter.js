/* ============================================
   Filter — Filter & Search Module
   ============================================ */
const Filter = (() => {
    let onFilterChange = null;

    function init(callback) {
        onFilterChange = callback;
        setupRegions();
        setupPrefectures();
        setupDamTypes();
        bindEvents();
    }

    function setupRegions() {
        const select = document.getElementById('filter-region');
        const regions = I18n.getRegions();
        // Keep the "All" option, clear the rest
        while (select.options.length > 1) select.remove(1);
        Object.entries(regions).forEach(([key, name]) => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = name;
            select.appendChild(opt);
        });
    }

    function setupPrefectures() {
        const select = document.getElementById('filter-prefecture');
        const prefs = I18n.getPrefectures();
        while (select.options.length > 1) select.remove(1);
        prefs.forEach((name, i) => {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = name;
            select.appendChild(opt);
        });
    }

    function setupDamTypes() {
        const container = document.getElementById('filter-dam-type');
        const types = I18n.getDamTypes();
        container.innerHTML = Object.entries(types).map(([key, name]) => `
      <label>
        <input type="checkbox" value="${key}" checked />
        ${name}
      </label>
    `).join('');
    }

    function bindEvents() {
        // Search
        const searchEl = document.getElementById('filter-search');
        let searchTimeout;
        searchEl.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(triggerFilter, 200);
        });

        // Region
        document.getElementById('filter-region').addEventListener('change', (e) => {
            // When region changes, update prefecture filter
            const regionKey = e.target.value;
            updatePrefecturesByRegion(regionKey);
            triggerFilter();
        });

        // Prefecture
        document.getElementById('filter-prefecture').addEventListener('change', triggerFilter);

        // Dam types
        document.getElementById('filter-dam-type').addEventListener('change', triggerFilter);

        // Rate range
        document.getElementById('filter-rate-min').addEventListener('input', e => {
            document.getElementById('rate-min-label').textContent = e.target.value + '%';
            triggerFilter();
        });
        document.getElementById('filter-rate-max').addEventListener('input', e => {
            document.getElementById('rate-max-label').textContent = e.target.value + '%';
            triggerFilter();
        });

        // Reset
        document.getElementById('btn-reset-filter').addEventListener('click', reset);
    }

    function updatePrefecturesByRegion(regionKey) {
        const select = document.getElementById('filter-prefecture');
        const prefs = I18n.getPrefectures();
        while (select.options.length > 1) select.remove(1);

        if (regionKey) {
            const indices = DamData.getRegionPrefectures()[regionKey] || [];
            indices.forEach(i => {
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = prefs[i];
                select.appendChild(opt);
            });
        } else {
            prefs.forEach((name, i) => {
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = name;
                select.appendChild(opt);
            });
        }
    }

    function getFilters() {
        const checkedTypes = [];
        document.querySelectorAll('#filter-dam-type input:checked').forEach(cb => {
            checkedTypes.push(cb.value);
        });
        const allTypes = document.querySelectorAll('#filter-dam-type input').length;

        return {
            search: document.getElementById('filter-search').value.trim(),
            region: document.getElementById('filter-region').value,
            prefecture: document.getElementById('filter-prefecture').value,
            damTypes: checkedTypes.length < allTypes ? checkedTypes : [], // empty = all
            rateMin: parseInt(document.getElementById('filter-rate-min').value),
            rateMax: parseInt(document.getElementById('filter-rate-max').value)
        };
    }

    function triggerFilter() {
        if (onFilterChange) onFilterChange(getFilters());
    }

    function reset() {
        document.getElementById('filter-search').value = '';
        document.getElementById('filter-region').value = '';
        document.getElementById('filter-prefecture').value = '';
        document.getElementById('filter-rate-min').value = 0;
        document.getElementById('filter-rate-max').value = 100;
        document.getElementById('rate-min-label').textContent = '0%';
        document.getElementById('rate-max-label').textContent = '100%';

        // Reset checkboxes
        document.querySelectorAll('#filter-dam-type input').forEach(cb => { cb.checked = true; });

        // Reset prefectures
        setupPrefectures();

        triggerFilter();
    }

    function updateStats(filteredDams) {
        document.getElementById('stats-count').textContent = filteredDams.length;
        const withRate = filteredDams.filter(d => d.rate !== null && d.rate !== undefined);
        const avg = withRate.length > 0
            ? (withRate.reduce((s, d) => s + d.rate, 0) / withRate.length).toFixed(1)
            : '--';
        document.getElementById('stats-avg-rate').textContent = avg + '%';
    }

    // Re-initialize on language change
    function refresh() {
        const currentFilters = getFilters();
        setupRegions();
        setupDamTypes();
        if (currentFilters.region) {
            document.getElementById('filter-region').value = currentFilters.region;
            updatePrefecturesByRegion(currentFilters.region);
        } else {
            setupPrefectures();
        }
        if (currentFilters.prefecture) {
            document.getElementById('filter-prefecture').value = currentFilters.prefecture;
        }
    }

    return { init, getFilters, reset, updateStats, refresh };
})();
