/* ============================================
   Map — Leaflet Map Module
   ============================================ */
const DamMap = (() => {
    let map = null;
    let markerCluster = null;
    let markers = {};
    let tileLayer = null;

    const TILE_URLS = {
        light: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    };

    const TILE_ATTR = {
        light: '&copy; <a href="https://www.openstreetmap.org/">OSM</a>',
        dark: '&copy; <a href="https://www.openstreetmap.org/">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
    };

    function init() {
        map = L.map('map', {
            center: [36.5, 137.5],
            zoom: 6,
            zoomControl: true,
            attributionControl: true
        });

        const theme = Theme.get();
        tileLayer = L.tileLayer(TILE_URLS[theme], {
            attribution: TILE_ATTR[theme],
            maxZoom: 18
        }).addTo(map);

        markerCluster = L.markerClusterGroup({
            maxClusterRadius: 40,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            iconCreateFunction: function (cluster) {
                const count = cluster.getChildCount();
                let size = 'small';
                if (count > 50) size = 'large';
                else if (count > 20) size = 'medium';
                return L.divIcon({
                    html: `<div class="cluster-icon cluster-${size}">${count}</div>`,
                    className: 'custom-cluster',
                    iconSize: L.point(40, 40)
                });
            }
        });
        map.addLayer(markerCluster);

        // Add cluster styles
        const clusterStyle = document.createElement('style');
        clusterStyle.textContent = `
      .custom-cluster { background: none !important; }
      .cluster-icon {
        display: flex; align-items: center; justify-content: center;
        width: 40px; height: 40px; border-radius: 50%;
        color: #fff; font-weight: 700; font-size: 13px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid rgba(255,255,255,0.7);
      }
      .cluster-small { background: #3b82f6; }
      .cluster-medium { background: #8b5cf6; }
      .cluster-large { background: #e11d48; }
    `;
        document.head.appendChild(clusterStyle);
    }

    function updateTileLayer(theme) {
        if (!map || !tileLayer) return;
        map.removeLayer(tileLayer);
        tileLayer = L.tileLayer(TILE_URLS[theme] || TILE_URLS.light, {
            attribution: TILE_ATTR[theme] || TILE_ATTR.light,
            maxZoom: 18
        }).addTo(map);
    }

    function getColor(rate) {
        if (rate === null || rate === undefined) return '#94a3b8';
        if (rate >= 90) return '#2563eb';
        if (rate >= 70) return '#16a34a';
        if (rate >= 50) return '#eab308';
        if (rate >= 30) return '#ea580c';
        return '#dc2626';
    }

    function getRateClass(rate) {
        if (rate === null || rate === undefined) return 'rate-unknown';
        if (rate >= 90) return 'rate-high';
        if (rate >= 70) return 'rate-good';
        if (rate >= 50) return 'rate-mid';
        if (rate >= 30) return 'rate-low';
        return 'rate-critical';
    }

    function setMarkers(dams) {
        markerCluster.clearLayers();
        markers = {};

        dams.forEach(dam => {
            if (!dam.lat || !dam.lng) return;

            const color = getColor(dam.rate);
            const size = 12;

            const icon = L.divIcon({
                className: 'dam-marker',
                html: '',
                iconSize: [size, size],
                iconAnchor: [size / 2, size / 2]
            });

            const marker = L.marker([dam.lat, dam.lng], { icon });

            // Apply color via style
            marker.on('add', function () {
                const el = this.getElement();
                if (el) {
                    el.style.backgroundColor = color;
                    el.style.width = size + 'px';
                    el.style.height = size + 'px';
                }
            });

            // Popup
            const approxTag = dam.isApproximate ? `<span class="approx-tag">${I18n.t('approx')}</span>` : '';
            const rateText = dam.rate !== null && dam.rate !== undefined ? `${dam.rate.toFixed(1)}%${approxTag}` : I18n.t('no_data');
            const displayName = I18n.getLang() === 'en' && dam.nameEn ? dam.nameEn : (dam.name || '');
            const isNonPublic = dam.source && dam.source !== 'mlit';
            const sourceTag = dam.sourceUrl
                ? `<div class="popup-source ${isNonPublic ? '' : 'popup-source-official'}"><a href="${dam.sourceUrl}" target="_blank" rel="noopener">${isNonPublic ? '※ ' : '🔗 '}${I18n.t('source_' + (dam.source || 'mlit'))}</a></div>`
                : '';
            const popupHtml = `
        <div class="dam-popup">
          <h3>${displayName}</h3>
          <div class="popup-info">
            ${I18n.getPrefecture(dam.prefectureIndex)}<br/>
            ${I18n.getDamType(dam.type)}
          </div>
          <div class="popup-rate" style="color:${color}">${rateText}</div>
          ${sourceTag}
          <button class="popup-btn" onclick="Detail.show('${dam.id}')">${I18n.t('popup_detail')}</button>
        </div>
      `;
            marker.bindPopup(popupHtml);

            markers[dam.id] = marker;
            markerCluster.addLayer(marker);
        });
    }

    function focusDam(damId) {
        const marker = markers[damId];
        if (!marker) return;
        map.setView(marker.getLatLng(), 12);
        marker.openPopup();
    }

    function invalidateSize() {
        if (map) setTimeout(() => map.invalidateSize(), 100);
    }

    return { init, setMarkers, updateTileLayer, getColor, getRateClass, focusDam, invalidateSize };
})();
