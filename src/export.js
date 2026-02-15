/* ============================================
   Export — CSV Download Module
   ============================================ */
const Export = (() => {
    function init() {
        document.getElementById('btn-export-csv').addEventListener('click', downloadCSV);
    }

    function downloadCSV() {
        const dams = DamList.getData();
        if (!dams || dams.length === 0) {
            alert(I18n.getLang() === 'ja' ? 'エクスポートするデータがありません' : 'No data to export');
            return;
        }

        const lang = I18n.getLang();
        const headers = lang === 'ja'
            ? ['ダム名', '都道府県', '形式', '目的', '総貯水量(m³)', '有効貯水量(m³)', '貯水率(%)', '水位(m)', '流入量(m³/s)', '放流量(m³/s)', '緯度', '経度']
            : ['Dam Name', 'Prefecture', 'Type', 'Purpose', 'Total Capacity(m³)', 'Effective Capacity(m³)', 'Rate(%)', 'Level(m)', 'Inflow(m³/s)', 'Outflow(m³/s)', 'Latitude', 'Longitude'];

        const rows = dams.map(dam => [
            dam.name || '',
            I18n.getPrefecture(dam.prefectureIndex),
            I18n.getDamType(dam.type),
            I18n.getPurpose(dam.purpose),
            dam.totalCapacity ?? '',
            dam.effectiveCapacity ?? '',
            dam.rate !== null && dam.rate !== undefined ? dam.rate.toFixed(1) : '',
            dam.level !== null && dam.level !== undefined ? dam.level.toFixed(2) : '',
            dam.inflow !== null && dam.inflow !== undefined ? dam.inflow.toFixed(2) : '',
            dam.outflow !== null && dam.outflow !== undefined ? dam.outflow.toFixed(2) : '',
            dam.lat ?? '',
            dam.lng ?? ''
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        // UTF-8 BOM for Excel compatibility
        const bom = '\uFEFF';
        const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `japan_dam_data_${timestamp}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return { init };
})();
