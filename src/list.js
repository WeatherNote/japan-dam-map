/* ============================================
   List — Table List View Module
   ============================================ */
const DamList = (() => {
  let currentData = [];

  function render(dams) {
    currentData = dams;
    const tbody = document.getElementById('list-tbody');
    const countEl = document.getElementById('list-count');

    if (!tbody) return;

    countEl.textContent = I18n.t('list_showing', { count: dams.length });

    if (dams.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted);">${I18n.t('no_data')}</td></tr>`;
      return;
    }

    tbody.innerHTML = dams.map(dam => {
      const rate = dam.rate !== null && dam.rate !== undefined ? dam.rate.toFixed(1) : '--';
      const approxTag = dam.isApproximate ? `<span style="font-size:0.8em;color:#f59e0b;">${I18n.t('approx')}</span>` : '';
      const rateClass = DamMap.getRateClass(dam.rate);
      const capacity = dam.totalCapacity ? (dam.totalCapacity / 10000).toFixed(0) : '--';
      const effective = dam.effectiveCapacity ? (dam.effectiveCapacity / 10000).toFixed(0) : '--';
      const level = dam.level !== null && dam.level !== undefined ? dam.level.toFixed(2) : '--';
      const pref = I18n.getPrefecture(dam.prefectureIndex);
      const type = I18n.getDamType(dam.type);
      const displayName = I18n.getLang() === 'en' && dam.nameEn ? dam.nameEn : (dam.name || '');
      const isNonPublic = dam.source && dam.source !== 'mlit';
      const sourceTag = dam.sourceUrl
        ? `<span class="source-badge ${isNonPublic ? '' : 'source-badge-official'}"><a href="${dam.sourceUrl}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${isNonPublic ? '※ ' : '🔗 '}${I18n.t('source_' + (dam.source || 'mlit'))}</a></span>`
        : '';

      return `
        <tr data-dam-id="${dam.id}" onclick="Detail.show('${dam.id}')">
          <td><strong>${displayName}</strong>${sourceTag}</td>
          <td>${pref}</td>
          <td>${type}</td>
          <td style="text-align:right">${capacity}</td>
          <td style="text-align:right">${effective}</td>
          <td style="text-align:center"><span class="rate-badge ${rateClass}">${rate}%${approxTag}</span></td>
          <td style="text-align:right">${level}</td>
        </tr>
      `;
    }).join('');
  }

  function getData() { return currentData; }

  return { render, getData };
})();
