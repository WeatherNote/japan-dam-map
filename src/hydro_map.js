
const HydroMap = (() => {
    let map = null;
    let geoJsonLayer = null;

    // Region Prefectures Mapping (Same as hydro.html)
    // Region Prefectures Mapping (Corrected to match data.js)
    const regionPrefectures = {
        hokkaido: [0],
        tohoku: [1, 2, 3, 4, 5, 6],
        kanto: [7, 8, 9, 10, 11, 12, 13],
        chubu: [14, 15, 16, 17, 18, 19, 20, 21, 22],
        kinki: [23, 24, 25, 26, 27, 28, 29],
        chugoku: [30, 31, 32, 33, 34],
        shikoku: [35, 36, 37, 38],
        kyushu: [39, 40, 41, 42, 43, 44, 45, 46]
    };

    // Map Pref Name (from GeoJSON) to Index (0-46)
    // GeoJSON properties might have "nam" or "name"
    // We'll need to inspect the GeoJSON structure first.
    // Assuming standard order or name matching.

    async function init(hydroDams, regionRates) {
        if (map) return;

        // Initialize Map
        map = L.map('regional-map', {
            center: [36.0, 138.0],
            zoom: 5,
            zoomControl: false,
            scrollWheelZoom: false,
            dragging: true,
            attributionControl: false
        });

        const theme = Theme.get();
        // Use a simpler, cleaner tile for choropleth
        const tileUrl = theme === 'dark'
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

        L.tileLayer(tileUrl, { opacity: 0.5 }).addTo(map);

        // Region Rates are now passed in for consistency
        const regions = I18n.getRegions();

        // Load GeoJSON
        try {
            const res = await fetch('src/japan.geojson');
            const geoData = await res.json();

            geoJsonLayer = L.geoJSON(geoData, {
                style: (feature) => {
                    // Determine region for this feature
                    // GeoJSON likely has properties.nam_ja or similar (e.g. "北海道")
                    // We need to map feature -> prefIndex -> regionKey
                    const prefName = feature.properties.nam_ja || feature.properties.name;
                    const regionKey = getRegionKeyResult(prefName);

                    const rate = regionRates[regionKey];
                    const color = getColor(rate);

                    return {
                        fillColor: color,
                        weight: 1,
                        opacity: 1,
                        color: 'white',
                        dashArray: '3',
                        fillOpacity: 0.7
                    };
                },
                onEachFeature: (feature, layer) => {
                    const prefName = feature.properties.nam_ja || feature.properties.name;
                    const regionKey = getRegionKeyResult(prefName);
                    const rate = regionRates[regionKey];
                    const rateStr = rate !== null ? rate.toFixed(1) + '%' : '--%';

                    // Highlight on hover
                    layer.on({
                        mouseover: (e) => {
                            const l = e.target;
                            l.setStyle({
                                weight: 2,
                                color: '#666',
                                dashArray: '',
                                fillOpacity: 0.9
                            });
                            l.bringToFront();
                        },
                        mouseout: (e) => {
                            geoJsonLayer.resetStyle(e.target);
                        }
                    });

                    layer.bindTooltip(`
                        <div style="text-align:center">
                            <strong>${prefName}</strong><br>
                            <span style="font-size:14px;">${regions[regionKey] || ''}</span><br>
                            <span style="font-size:16px; font-weight:bold">${rateStr}</span>
                        </div>
                    `, { sticky: true });
                }
            }).addTo(map);

            // Fit bounds
            map.fitBounds(geoJsonLayer.getBounds());

        } catch (e) {
            console.error("Failed to load GeoJSON:", e);
        }
    }

    function getRegionKeyResult(prefName) {
        // Simple mapping based on known regions
        // Optimization: Could use a lookup map
        if (!prefName) return 'hokkaido'; // fallback

        // This is a bit Hacky, ideally we use IDs. 
        // But for now, let's map regionPrefectures to check indices?
        // Detailed pref mapping requires knowing pref name -> index.
        // Let's assume we can derive it or use a helper.
        // Actually, we can just look up which region this pref belongs to if we had a map.

        // Let's use a simplified approach: Map Pref Name -> Region Key directly here
        if (prefName.includes('北海道')) return 'hokkaido';
        if (['青森', '岩手', '宮城', '秋田', '山形', '福島'].some(p => prefName.includes(p))) return 'tohoku';
        if (['茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川'].some(p => prefName.includes(p))) return 'kanto';
        if (['新潟', '富山', '石川', '福井', '山梨', '長野', '岐阜', '静岡', '愛知'].some(p => prefName.includes(p))) return 'chubu';
        if (['三重', '滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山'].some(p => prefName.includes(p))) return 'kinki';
        if (['鳥取', '島根', '岡山', '広島', '山口'].some(p => prefName.includes(p))) return 'chugoku';
        if (['徳島', '香川', '愛媛', '高知'].some(p => prefName.includes(p))) return 'shikoku';
        if (['福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄'].some(p => prefName.includes(p))) return 'kyushu';

        return 'hokkaido';
    }

    function getColor(rate) {
        if (rate === null || rate === undefined) return '#94a3b8';
        if (rate >= 90) return '#2563eb';
        if (rate >= 70) return '#16a34a';
        if (rate >= 50) return '#eab308';
        if (rate >= 30) return '#ea580c';
        return '#dc2626';
    }

    return { init };
})();
