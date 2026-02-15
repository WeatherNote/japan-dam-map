/* ============================================
   Data — Data Loading & Processing Module
   ============================================ */
const DamData = (() => {
    let masterData = [];
    let realtimeData = {};
    let mergedData = [];

    // Prefectures by region
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

    async function load() {
        try {
            const [masterRes, realtimeRes] = await Promise.all([
                fetch('data/dams.json').then(r => r.json()),
                fetch('data/realtime.json').then(r => r.json()).catch(() => ({}))
            ]);
            masterData = masterRes.dams || masterRes || [];
            realtimeData = realtimeRes;
            // Only include dams that have rate data from Kawabou
            mergedData = merge(masterData, realtimeData).filter(d => d.rate !== null && d.rate !== undefined);
            return mergedData;
        } catch (err) {
            console.error('Failed to load data:', err);
            return [];
        }
    }

    function merge(master, realtime) {
        return master.map(dam => {
            const rt = realtime[dam.id] || {};
            return {
                ...dam,
                rate: rt.rate ?? null,
                level: rt.level ?? null,
                inflow: rt.inflow ?? null,
                outflow: rt.outflow ?? null,
                updatedAt: rt.updatedAt || null,
                isApproximate: rt.isApproximate || false
            };
        });
    }

    function getAll() { return mergedData; }

    function getById(id) {
        return mergedData.find(d => d.id === id);
    }

    function getRegionForPrefecture(prefIndex) {
        for (const [region, indices] of Object.entries(regionPrefectures)) {
            if (indices.includes(prefIndex)) return region;
        }
        return null;
    }

    function getRegionPrefectures() { return regionPrefectures; }

    function filterData(dams, filters) {
        return dams.filter(dam => {
            // Search
            if (filters.search) {
                const q = filters.search.toLowerCase();
                const nameJa = (dam.name || '').toLowerCase();
                const nameEn = (dam.nameEn || '').toLowerCase();
                if (!nameJa.includes(q) && !nameEn.includes(q)) return false;
            }
            // Region
            if (filters.region) {
                const region = getRegionForPrefecture(dam.prefectureIndex);
                if (region !== filters.region) return false;
            }
            // Prefecture
            if (filters.prefecture !== undefined && filters.prefecture !== '') {
                if (dam.prefectureIndex !== parseInt(filters.prefecture)) return false;
            }
            // Dam type
            if (filters.damTypes && filters.damTypes.length > 0) {
                if (!filters.damTypes.includes(dam.type)) return false;
            }
            // Rate range
            if (filters.rateMin !== undefined || filters.rateMax !== undefined) {
                if (dam.rate === null || dam.rate === undefined) return true; // show dams with no data
                if (filters.rateMin !== undefined && dam.rate < filters.rateMin) return false;
                if (filters.rateMax !== undefined && dam.rate > filters.rateMax) return false;
            }
            return true;
        });
    }

    function sortData(dams, sortKey) {
        const sorted = [...dams];
        switch (sortKey) {
            case 'name':
                sorted.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ja'));
                break;
            case 'rate-desc':
                sorted.sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1));
                break;
            case 'rate-asc':
                sorted.sort((a, b) => (a.rate ?? 999) - (b.rate ?? 999));
                break;
            case 'capacity-desc':
                sorted.sort((a, b) => (b.totalCapacity || 0) - (a.totalCapacity || 0));
                break;
            case 'prefecture':
                sorted.sort((a, b) => (a.prefectureIndex || 0) - (b.prefectureIndex || 0));
                break;
        }
        return sorted;
    }



    function getTimestamp() {
        if (realtimeData && realtimeData._timestamp) return realtimeData._timestamp;
        return null;
    }

    return { load, getAll, getById, filterData, sortData, getRegionPrefectures, getRegionForPrefecture, getTimestamp };
})();
