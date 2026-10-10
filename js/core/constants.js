// ============================================================
// Gourmet Map - Constants and shared option helpers
// 共通定数・選択肢
// ============================================================

const AREA_COLORS = [
  { id: 'teal', label: 'エメラルド', bg: 'linear-gradient(135deg, #4ecdc4, #2ab7ca)' },
  { id: 'rose', label: 'ローズ', bg: 'linear-gradient(135deg, #ff6b6b, #ee5253)' },
  { id: 'amber', label: 'アンバー', bg: 'linear-gradient(135deg, #ff9f43, #f39c12)' },
  { id: 'ocean', label: 'オーシャン', bg: 'linear-gradient(135deg, #54a0ff, #2e86de)' },
  { id: 'purple', label: 'パープル', bg: 'linear-gradient(135deg, #a55eea, #8e44ad)' },
  { id: 'mint', label: 'ティール', bg: 'linear-gradient(135deg, #1dd1a1, #10ac84)' },
  { id: 'dark', label: 'ダーク', bg: 'linear-gradient(135deg, #576574, #222f3e)' },
  { id: 'gold', label: 'ゴールド', bg: 'linear-gradient(135deg, #f1c40f, #d35400)' }
];

const STORE_PIN_SHAPES = [
  { id: 'heart', label: 'ハート', icon: '♥' },
  { id: 'star', label: '星型', icon: '★' },
  { id: 'triangle', label: '逆三角', icon: '▼' },
  { id: 'double-circle', label: '二重丸', icon: '◎' }
];

const STORE_PIN_COLORS = [
  { id: 'red', label: 'レッド', bg: 'linear-gradient(135deg, #ff6b6b, #e74c3c)' },
  { id: 'orange', label: 'オレンジ', bg: 'linear-gradient(135deg, #ffb347, #f39c12)' },
  { id: 'yellow', label: 'イエロー', bg: 'linear-gradient(135deg, #ffe66d, #f1c40f)' },
  { id: 'green', label: 'グリーン', bg: 'linear-gradient(135deg, #55efc4, #00b894)' },
  { id: 'cyan', label: 'シアン', bg: 'linear-gradient(135deg, #81ecec, #00cec9)' },
  { id: 'blue', label: 'ブルー', bg: 'linear-gradient(135deg, #74b9ff, #0984e3)' },
  { id: 'purple', label: 'パープル', bg: 'linear-gradient(135deg, #a29bfe, #6c5ce7)' },
  { id: 'pink', label: 'ピンク', bg: 'linear-gradient(135deg, #fd79a8, #e84393)' }
];

const FORM_OPTIONS = [
  'レストラン', 'ビストロ', 'ブッフェ', 'バイキング', 'ダイニング', 'カフェ', 'バル', 'カレー屋', 'ケーキ屋', 'パン屋', 'スイーツ系',
  '料亭', '定食屋', '郷土料理屋', '小料理屋', '寿司', '肉寿司', 'ラーメン屋', 'そば', 'うどん', 'パスタ', '焼肉屋', 'しゃぶしゃぶ',
  '居酒屋', 'バー', '屋台', 'キッチンカー', '野外', 'ビアガーデン', '販売店/ショップ', 'その他'
];

const GENRE_OPTIONS = [
  '和食', '洋食', '中華', '韓国', 'アジアン', 'エスニック', 'イタリアン', 'フレンチ', 'スペイン', 'ヨーロッパ', '欧米', '北米', '南米', 'ハワイ', '南国', '他国料理',
  '沖縄料理', '郷土料理', 'ジビエ', '寿司', '焼肉', 'ラーメン', 'カレー', '魚系',
  '肉系', '麺系', '野菜系', 'スイーツ系', 'カフェ', '居酒屋', 'ビーガン', 'ゲテモノ', 'お土産/ギフト', 'その他'
];

const BUDGET_OPTIONS = [
  '1000円以下', '1000～3000円以下', '3000～5000円以下',
  '5000～7000円以下', '7000～10000円以下', '10000円以上'
];

const STORE_OPTION_DEFS = [
  { id: 'private', label: '貸切' },
  { id: 'course', label: 'コースあり' },
  { id: 'allYouCanDrink', label: '飲み放題' },
  { id: 'allYouCanEat', label: '食べ放題' }
];

function getStoreOptions(store) {
  if (!store) return [];
  if (Array.isArray(store.options)) return store.options;
  return STORE_OPTION_DEFS.filter(o => store[o.id] === true).map(o => o.id);
}

function renderStoreOptionChecks(selected = [], prefix = 'store-option', disabled = false) {
  const set = new Set(selected || []);
  return `<div class="store-options-grid">${STORE_OPTION_DEFS.map(o => `
    <label class="store-option-check">
      <input type="checkbox" class="${prefix}" value="${o.id}" ${set.has(o.id) ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
      <span>${o.label}</span>
    </label>`).join('')}</div>`;
}
