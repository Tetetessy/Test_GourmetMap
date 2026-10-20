// 分割移行：リスト／検索関連処理
// このファイルは index.html より前に読み込まれるため、既存のグローバル関数をそのまま利用します。

function toggleSearchPanel() {
  const panel = document.getElementById('search-panel');
  const isVisible = panel.style.display === 'block';
  closeSimplePanels();
  if (!isVisible) { panel.style.display = 'block'; filterStores(); }
}

function clearSearchFilters() {
  const name = document.getElementById('search-name');
  const fav = document.getElementById('search-fav-only');
  const ids = ['search-list','search-form','search-genre','search-budget','search-station'];
  if (name) name.value = '';
  if (fav) fav.checked = false;
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.querySelectorAll('.search-option-check').forEach(cb => { cb.checked = false; });
  filterStores();
}

function toggleSearchFilterSection(button) {
  const section = button.closest('.search-filter-section');
  if (!section) return;
  const body = section.querySelector('.search-filter-body');
  const arrow = button.querySelector('.search-filter-arrow');
  const isOpen = section.classList.toggle('open');
  if (body) body.style.display = isOpen ? 'block' : 'none';
  if (arrow) arrow.textContent = isOpen ? '▲' : '▼';
}


function getStoreForms(store) { return Array.isArray(store?.forms) ? store.forms : (store?.form ? [store.form] : []); }

function getStoreGenres(store) { return Array.isArray(store?.genres) ? store.genres : (store?.genre ? [store.genre] : []); }

function initSearchOptions() {
  const formSel = document.getElementById('search-form');
  const genreSel = document.getElementById('search-genre');
  const budgetSel = document.getElementById('search-budget');
  if (formSel) formSel.innerHTML = '<option value="">全ての形式</option>' + FORM_OPTIONS.map(f => `<option>${f}</option>`).join('');
  if (genreSel) genreSel.innerHTML = '<option value="">全てのジャンル</option>' + GENRE_OPTIONS.map(g => `<option>${g}</option>`).join('');
  if (budgetSel) budgetSel.innerHTML = '<option value="">全ての予算</option>' + BUDGET_OPTIONS.map(b => `<option>${b}</option>`).join('');
  const optionContainer = document.getElementById('search-options-container');
  if (optionContainer) optionContainer.innerHTML = STORE_OPTION_DEFS.map(o => `<label class="store-option-check"><input type="checkbox" class="search-option-check" value="${o.id}" onchange="filterStores()"><span>${o.label}</span></label>`).join('');
  updateSearchListDropdown();
  updateShareCodeStatus();
}
