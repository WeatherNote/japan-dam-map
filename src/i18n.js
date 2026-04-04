/* ============================================
   i18n — Internationalization Module
   ============================================ */
const I18n = (() => {
  const translations = {
    ja: {
      app_title: '日本ダム貯水量マップ',
      csv_download: 'CSV',
      view_map: '🗺 マップ',
      view_list: '📋 リスト',
      filter_title: 'フィルター',
      filter_reset: 'リセット',
      filter_search: 'ダム名検索',
      filter_search_placeholder: 'ダム名を入力...',
      filter_region: '地方',
      filter_prefecture: '都道府県',
      filter_dam_type: 'ダム形式',
      filter_reservoir_rate: '貯水率',
      filter_all: 'すべて',
      stats_showing: '表示中',
      stats_dams: 'ダム',
      stats_avg_rate: '平均貯水率',
      legend_title: '貯水率',
      legend_nodata: 'データなし',
      sort_by: '並び替え:',
      sort_name: 'ダム名',
      sort_rate_desc: '貯水率 (高→低)',
      sort_rate_asc: '貯水率 (低→高)',
      sort_capacity_desc: '総貯水量 (大→小)',
      sort_prefecture: '都道府県',
      col_name: 'ダム名',
      col_prefecture: '都道府県',
      col_type: '形式',
      col_capacity: '総貯水量 (万m³)',
      col_effective: '有効貯水量 (万m³)',
      col_rate: '貯水率 (%)',
      col_level: '水位 (m)',
      detail_basic: '基本情報',
      detail_realtime: 'リアルタイム情報',
      detail_history: '過去データ',
      detail_location: '所在地',
      detail_type: '形式',
      detail_purpose: '目的',
      detail_operator: '事業者',
      detail_total_cap: '総貯水容量',
      detail_effective_cap: '有効貯水容量',
      detail_rate: '貯水率',
      detail_level: '水位',
      detail_inflow: '流入量',
      detail_outflow: '放流量',
      period_week: '1週間',
      period_month: '1ヶ月',
      period_year: '1年',
      period_all: '全期間',
      footer_source: 'データ出典: 国土交通省 国土数値情報 / 川の防災情報 / 水文水質データベース',
      footer_license: 'CC BY 4.0 ライセンスに基づき利用',
      auth_title: 'パスワードを入力してください',
      auth_desc: 'このアプリケーションは社内利用限定です。',
      auth_placeholder: 'パスワード / Password',
      auth_submit: 'ログイン / Login',
      auth_error: 'パスワードが正しくありません',
      popup_detail: '詳細を見る',
      list_showing: '{count} 件表示中',
      no_data: 'データなし',
      unit_m3: '万m³',
      unit_m: 'm',
      unit_m3s: 'm³/s',
      updated_at: '最終更新: {time}',
      source_mlit: '国土交通省',
      source_wikipedia: 'Wikipedia',
      source_damnet: 'ダム便覧',
      source_note: '※ このデータは公的機関以外の情報源から取得しています。正確性について保証するものではありません。',
      source_label: '出典',
      source_public: '公的データ',
      nav_hydro: '水力発電',
      approx: ' (概算)',
      refresh_data: 'データ更新',
      refreshing: '更新中...',
    },
    en: {
      app_title: 'Japan Dam Reservoir Map',
      csv_download: 'CSV',
      view_map: '🗺 Map',
      view_list: '📋 List',
      filter_title: 'Filters',
      filter_reset: 'Reset',
      filter_search: 'Search Dam',
      filter_search_placeholder: 'Enter dam name...',
      filter_region: 'Region',
      filter_prefecture: 'Prefecture',
      filter_dam_type: 'Dam Type',
      filter_reservoir_rate: 'Reservoir Rate',
      filter_all: 'All',
      stats_showing: 'Showing',
      stats_dams: 'dams',
      stats_avg_rate: 'Avg. Rate',
      legend_title: 'Reservoir Rate',
      legend_nodata: 'No Data',
      sort_by: 'Sort by:',
      sort_name: 'Name',
      sort_rate_desc: 'Rate (High→Low)',
      sort_rate_asc: 'Rate (Low→High)',
      sort_capacity_desc: 'Capacity (Large→Small)',
      sort_prefecture: 'Prefecture',
      col_name: 'Dam Name',
      col_prefecture: 'Prefecture',
      col_type: 'Type',
      col_capacity: 'Total Cap. (×10⁴m³)',
      col_effective: 'Eff. Cap. (×10⁴m³)',
      col_rate: 'Rate (%)',
      col_level: 'Level (m)',
      detail_basic: 'Basic Info',
      detail_realtime: 'Real-time Data',
      detail_history: 'Historical Data',
      detail_location: 'Location',
      detail_type: 'Type',
      detail_purpose: 'Purpose',
      detail_operator: 'Operator',
      detail_total_cap: 'Total Capacity',
      detail_effective_cap: 'Effective Capacity',
      detail_rate: 'Reservoir Rate',
      detail_level: 'Water Level',
      detail_inflow: 'Inflow',
      detail_outflow: 'Outflow',
      period_week: '1 Week',
      period_month: '1 Month',
      period_year: '1 Year',
      period_all: 'All',
      footer_source: 'Data: MLIT National Land Numerical Info / River Disaster Prevention / Hydrology DB',
      footer_license: 'Used under CC BY 4.0 License',
      auth_title: 'Login Required',
      auth_desc: 'Internal use only',
      auth_placeholder: 'Password',
      auth_submit: 'Login',
      auth_error: 'Invalid Password',
      popup_detail: 'View Details',
      list_showing: 'Showing {count} dams',
      no_data: 'N/A',
      unit_m3: '×10⁴m³',
      unit_m: 'm',
      unit_m3s: 'm³/s',
      updated_at: 'Updated: {time}',
      source_mlit: 'MLIT',
      source_wikipedia: 'Wikipedia',
      source_damnet: 'Dam Handbook',
      source_note: '※ This data is sourced from non-governmental references. Accuracy is not guaranteed.',
      source_label: 'Source',
      source_public: 'Public Data',
      nav_hydro: 'Hydro Stats',
      approx: ' (Approx)',
      refresh_data: 'Refresh',
      refreshing: 'Refreshing...',
    }
  };

  // Prefecture names
  const prefectureNames = {
    ja: ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県', '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県', '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'],
    en: ['Hokkaido', 'Aomori', 'Iwate', 'Miyagi', 'Akita', 'Yamagata', 'Fukushima', 'Ibaraki', 'Tochigi', 'Gunma', 'Saitama', 'Chiba', 'Tokyo', 'Kanagawa', 'Niigata', 'Toyama', 'Ishikawa', 'Fukui', 'Yamanashi', 'Nagano', 'Gifu', 'Shizuoka', 'Aichi', 'Mie', 'Shiga', 'Kyoto', 'Osaka', 'Hyogo', 'Nara', 'Wakayama', 'Tottori', 'Shimane', 'Okayama', 'Hiroshima', 'Yamaguchi', 'Tokushima', 'Kagawa', 'Ehime', 'Kochi', 'Fukuoka', 'Saga', 'Nagasaki', 'Kumamoto', 'Oita', 'Miyazaki', 'Kagoshima', 'Okinawa']
  };

  const regionNames = {
    ja: { hokkaido: '北海道', tohoku: '東北', kanto: '関東', chubu: '中部', kinki: '近畿', chugoku: '中国', shikoku: '四国', kyushu: '九州・沖縄' },
    en: { hokkaido: 'Hokkaido', tohoku: 'Tohoku', kanto: 'Kanto', chubu: 'Chubu', kinki: 'Kinki', chugoku: 'Chugoku', shikoku: 'Shikoku', kyushu: 'Kyushu/Okinawa' }
  };

  const damTypeNames = {
    ja: { gravity: '重力式コンクリート', arch: 'アーチ式コンクリート', rockfill: 'ロックフィル', earth: 'アースフィル', combined: '複合型', buttress: 'バットレス', hydroelectric: '水力発電', other: 'その他' },
    en: { gravity: 'Gravity', arch: 'Arch', rockfill: 'Rockfill', earth: 'Earthfill', combined: 'Combined', buttress: 'Buttress', hydroelectric: 'Hydroelectric', other: 'Other' }
  };

  const purposeNames = {
    ja: { F: '洪水調節', N: '流水機能維持', A: 'かんがい', W: '上水道', I: '工業用水', P: '発電', S: '消雪', R: 'レクリエーション' },
    en: { F: 'Flood Control', N: 'Flow Maintenance', A: 'Irrigation', W: 'Water Supply', I: 'Industrial', P: 'Power Generation', S: 'Snow Melting', R: 'Recreation' }
  };

  let currentLang = localStorage.getItem('dam-map-lang') || 'ja';

  function t(key, params) {
    let str = translations[currentLang]?.[key] || translations['ja']?.[key] || key;
    if (params) {
      Object.keys(params).forEach(k => {
        str = str.replace(`{${k}}`, params[k]);
      });
    }
    return str;
  }

  function getLang() { return currentLang; }

  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('dam-map-lang', lang);
    applyTranslations();
  }

  function toggleLang() {
    setLang(currentLang === 'ja' ? 'en' : 'ja');
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = t(key);
    });
    document.getElementById('lang-label').textContent = currentLang === 'ja' ? 'EN' : 'JA';
  }

  function getPrefecture(index) {
    return (prefectureNames[currentLang] || prefectureNames.ja)[index] || '';
  }

  function getPrefectures() {
    return prefectureNames[currentLang] || prefectureNames.ja;
  }

  function getRegions() {
    return regionNames[currentLang] || regionNames.ja;
  }

  function getDamType(type) {
    return (damTypeNames[currentLang] || damTypeNames.ja)[type] || type || t('no_data');
  }

  function getDamTypes() {
    return damTypeNames[currentLang] || damTypeNames.ja;
  }

  function getPurpose(code) {
    if (!code) return t('no_data');
    return code.split('').map(c => (purposeNames[currentLang] || purposeNames.ja)[c] || c).join(', ');
  }

  return { t, getLang, setLang, toggleLang, applyTranslations, getPrefecture, getPrefectures, getRegions, getDamType, getDamTypes, getPurpose };
})();
