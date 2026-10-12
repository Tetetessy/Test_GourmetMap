// 分割移行：リスト／検索関連処理
// このファイルは index.html より前に読み込まれるため、既存のグローバル関数をそのまま利用します。

function updateSearchListDropdown() {
  const cur = getCurrentMap();
  const select = document.getElementById('search-list');
  if (!select) return;
  const currentVal = select.value;
  let html = '<option value="">全店舗</option>';
  if (cur && cur.lists) cur.lists.forEach(l => { html += `<option value="${l.id}">${l.name}</option>`; });
  select.innerHTML = html;
  select.value = currentVal;
  if (select.value !== currentVal) select.value = '';
}

function updateMapListDropdown() {
  const cur = getCurrentMap();
  const container = document.getElementById('map-list-select');
  if (!container) return;
  const currentVal = window.activeMapListId || '';
  const lists = (cur && cur.lists ? cur.lists : []);
  container.innerHTML = lists.length ? lists.map(l => `
    <button type="button" class="map-list-choice ${l.id === currentVal ? 'selected' : ''}"
      role="option" aria-selected="${l.id === currentVal ? 'true' : 'false'}"
      onclick="applyMapListView('${l.id}')">
      <span>📋 ${l.name}</span><span class="arrow">${l.id === currentVal ? '▼' : '▶'}</span>
    </button>
  `).join('') : '<div style="padding:12px 8px; text-align:center; color:var(--text-color); font-size:11px;">登録されたリストはありません。</div>';
  updateMapListStoreSummary();
}

function moveToMapListStore(storeId) {
  if (!storeId || !map) return;
  const cur = getCurrentMap();
  const store = (cur && cur.stores ? cur.stores : []).find(s => s.id === storeId);
  if (!store || !Number.isFinite(Number(store.lat)) || !Number.isFinite(Number(store.lng))) return;
  map.flyTo([Number(store.lat), Number(store.lng)], Math.max(map.getZoom(), 16), { duration: 0.8, easeLinearity: 0.25 });
  showStoreDetail(store.id);
}

function updateMapListStoreSummary() {
  const container = document.getElementById('map-list-store-summary');
  const status = document.getElementById('map-list-status');
  if (!container) return;
  const cur = getCurrentMap();
  const listId = window.activeMapListId || '';
  const list = (cur && cur.lists ? cur.lists : []).find(l => l.id === listId);
  const badge = document.getElementById('map-list-status-badge');
  const banner = document.getElementById('active-map-list-banner');
  if (!list) {
    container.style.display = 'none';
    container.innerHTML = '';
    if (status) status.textContent = 'リストを選ぶと対象外の店舗ピンがグレーになります。';
    if (badge) { badge.textContent = 'リスト未選択'; badge.className = 'map-list-status-badge unselected'; }
    if (banner) { banner.style.display = 'none'; banner.textContent = ''; }
    return;
  }
  const stores = (cur.stores || []).filter(s => (s.listIds || []).includes(list.id) || s.listId === list.id);
  if (status) status.textContent = 'リストを選ぶと対象外の店舗ピンがグレーになります。';
  if (badge) { badge.textContent = 'リスト選択中'; badge.className = 'map-list-status-badge selected'; }
  if (banner) { banner.style.display = 'block'; banner.textContent = `📋 リスト選択中：${list.name}`; }
  container.style.display = 'block';
  container.innerHTML = `
    <div class="map-list-store-summary-head">
      <div style="font-size:11px; font-weight:bold; margin-bottom:4px;">📍 リスト内の店舗（タップで移動）</div>
      <div class="map-list-selected-summary">「${list.name}」：${stores.length}店舗</div>
    </div>
    <div class="map-list-store-summary-list">
      ${stores.length ? stores.map(s => `
        <button type="button" class="map-list-store-item" style="background:var(--panel-solid-bg) !important;background-image:none !important;color:var(--text-color) !important;border:1px solid var(--border-color) !important;box-shadow:none !important;" onclick="moveToMapListStore('${s.id}')">
          <b>${s.isFavorite ? '⭐ ' : ''}${s.name}</b>
          <small>${getStoreForms(s).join(' / ') || '-'} / ${getStoreGenres(s).join(' / ') || '-'}${s.station ? ' / 🚉 ' + s.station : ''}</small>
        </button>
      `).join('') : '<div style="font-size:10px; color:#888; text-align:center; padding:8px 0;">このリストには店舗がありません。</div>'}
    </div>
  `;
}

function closeMapListPanel(event) {
  if (event) { event.preventDefault(); event.stopPropagation(); }
  const panel = document.getElementById('map-list-panel');
  if (panel) panel.style.display = 'none';
}

function toggleMapListPanel() {
  const panel = document.getElementById('map-list-panel');
  if (!panel) return;
  const isVisible = panel.style.display !== 'none' && panel.style.display !== '';
  closeSimplePanels();
  closeSearchResultsPanel();
  if (!isVisible) {
    panel.style.display = 'flex';
    updateMapListDropdown();
    updateMapListStoreSummary();
  }
}

function applyMapListView(listId) {
  window.activeMapListId = listId || '';
  updateMapListDropdown();
  updateMapListStoreSummary();
  renderCurrentMap();
}

function clearMapListView() {
  window.activeMapListId = '';
  updateMapListStoreSummary();
  renderCurrentMap();
}
