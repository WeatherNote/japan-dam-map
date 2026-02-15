/* ============================================
   Detail — Dam Detail Panel Module
   ============================================ */
const Detail = (() => {
    let currentDamId = null;

    function show(damId) {
        const dam = DamData.getById(damId);
        if (!dam) return;
        currentDamId = damId;

        const panel = document.getElementById('detail-panel');
        panel.classList.remove('hidden');

        // Basic info
        const displayName = I18n.getLang() === 'en' && dam.nameEn ? dam.nameEn : (dam.name || '');
        document.getElementById('detail-name').textContent = displayName;
        document.getElementById('detail-location').textContent = I18n.getPrefecture(dam.prefectureIndex) + (dam.location ? ' ' + dam.location : '');
        document.getElementById('detail-type').textContent = I18n.getDamType(dam.type);
        document.getElementById('detail-purpose').textContent = I18n.getPurpose(dam.purpose);
        document.getElementById('detail-operator').textContent = dam.operator || I18n.t('no_data');
        document.getElementById('detail-total-cap').textContent = dam.totalCapacity ? `${(dam.totalCapacity / 10000).toLocaleString()} ${I18n.t('unit_m3')}` : I18n.t('no_data');
        document.getElementById('detail-effective-cap').textContent = dam.effectiveCapacity ? `${(dam.effectiveCapacity / 10000).toLocaleString()} ${I18n.t('unit_m3')}` : I18n.t('no_data');

        // Realtime
        const rate = dam.rate !== null && dam.rate !== undefined ? dam.rate : null;
        let rateText = rate !== null ? `${rate.toFixed(1)}%` : '--%';
        if (dam.isApproximate) rateText += I18n.t('approx');
        document.getElementById('detail-rate').textContent = rateText;
        document.getElementById('detail-gauge-label').textContent = rateText;
        document.getElementById('detail-level').textContent = dam.level !== null && dam.level !== undefined ? `${dam.level.toFixed(2)} ${I18n.t('unit_m')}` : I18n.t('no_data');
        document.getElementById('detail-inflow').textContent = dam.inflow !== null && dam.inflow !== undefined ? `${dam.inflow.toFixed(2)} ${I18n.t('unit_m3s')}` : I18n.t('no_data');
        document.getElementById('detail-outflow').textContent = dam.outflow !== null && dam.outflow !== undefined ? `${dam.outflow.toFixed(2)} ${I18n.t('unit_m3s')}` : I18n.t('no_data');

        // Source attribution
        let sourceEl = document.getElementById('detail-source');
        if (!sourceEl) {
            sourceEl = document.createElement('div');
            sourceEl.id = 'detail-source';
            const basicSection = document.querySelector('#detail-panel .detail-section');
            if (basicSection) basicSection.appendChild(sourceEl);
        }
        const isNonPublic = dam.source && dam.source !== 'mlit';
        if (dam.sourceUrl) {
            if (isNonPublic) {
                sourceEl.innerHTML = `<div class="source-warning"><span class="source-badge"><a href="${dam.sourceUrl}" target="_blank" rel="noopener">※ ${I18n.t('source_label')}: ${I18n.t('source_' + dam.source)}</a></span><br><small>${I18n.t('source_note')}</small></div>`;
            } else {
                sourceEl.innerHTML = `<div class="source-info"><span class="source-badge source-badge-official"><a href="${dam.sourceUrl}" target="_blank" rel="noopener">🔗 ${I18n.t('source_label')}: ${I18n.t('source_mlit')}</a></span></div>`;
            }
            sourceEl.style.display = '';
        } else {
            sourceEl.style.display = 'none';
        }

        // Gauge
        const gaugeFill = document.getElementById('detail-gauge-fill');
        const fillPct = rate !== null ? Math.min(100, Math.max(0, rate)) : 0;
        gaugeFill.style.width = fillPct + '%';
        gaugeFill.style.background = rate !== null
            ? `linear-gradient(90deg, ${DamMap.getColor(rate)}, ${DamMap.getColor(Math.min(100, rate + 20))})`
            : 'var(--bg-tertiary)';
    }

    function hide() {
        document.getElementById('detail-panel').classList.add('hidden');
        currentDamId = null;
    }

    function getCurrentDamId() { return currentDamId; }

    return { show, hide, getCurrentDamId };
})();
