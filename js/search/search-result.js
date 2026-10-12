// 分割移行：リスト／検索関連処理
// このファイルは index.html より前に読み込まれるため、既存のグローバル関数をそのまま利用します。

function closeSearchResultsPanel() {
  document.getElementById('search-results-panel').style.display = 'none';
}

function filterStores() {
  const nameVal = document.getElementById('search-name').value.toLowerCase();
  const listVal = document.getElementById('search-list').value;
  const favOnly = document.getElementById('search-fav-only')?.checked || false;
  const formVal = document.getElementById('search-form').value;
  const genreVal = document.getElementById('search-genre').value;
  const budgetVal = document.getElementById('search-budget').value;
  const stationVal = document.getElementById('search-station').value.trim().toLowerCase();
  const optionVals = Array.from(document.querySelectorAll('.search-option-check:checked')).map(el => el.value);

  const curMap = getCurrentMap();
  const filtered = (curMap.stores || []).filter(s => {
    if (nameVal && !s.name.toLowerCase().includes(nameVal)) return false;
    if (stationVal && !(s.station || '').toLowerCase().includes(stationVal)) return false;
    if (listVal && !(s.listIds || []).includes(listVal) && s.listId !== listVal) return false;
    if (favOnly && !s.isFavorite) return false;
    const storeForms = getStoreForms(s);
    const storeGenres = getStoreGenres(s);
    if (formVal && !storeForms.includes(formVal)) return false;
    if (genreVal && !storeGenres.includes(genreVal)) return false;
    if (budgetVal && s.budget !== budgetVal) return false;
    const storeOptions = getStoreOptions(s);
    if (optionVals.length && !optionVals.every(v => storeOptions.includes(v))) return false;
    return true;
  });

  const resultsPanel = document.getElementById('search-results-panel');
  const container = document.getElementById('search-results-container');
  
  resultsPanel.style.display = 'block';
  const countEl = document.getElementById('search-results-count');
  if (countEl) countEl.textContent = `一致：${filtered.length}店舗`;

  if (filtered.length === 0) {
    container.innerHTML = `<p style="font-size:11px; color:#888; text-align:center; padding:10px 0;">該当する店舗が見つかりません</p>`;
    return;
  }

  container.innerHTML = filtered.map(s => `
    <div style="padding:6px 8px; margin-top:4px; background:rgba(0,0,0,0.03); border-radius:6px; cursor:pointer; border-left:3px solid var(--primary-color);" onclick="showStoreDetail('${s.id}')">
      <b style="font-size:12px;">${s.isFavorite ? '⭐ ' : ''}${s.name}</b>
      <div style="font-size:10px; color:#666; margin-top:2px;">${getStoreForms(s).join(' / ') || '-'} / ${getStoreGenres(s).join(' / ') || '-'}</div>
      <div style="font-size:10px; color:#666; margin-top:1px;">💰 ${s.budget || '-'}</div>
      <div style="font-size:10px; color:#777; margin-top:1px;">🚉 ${s.station || '-'}</div>
    </div>
  `).join('');
}
