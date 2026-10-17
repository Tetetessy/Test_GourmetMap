// ============================================================
// Gourmet Map - Panel UI
// パネル・操作メニューの表示制御
// ============================================================

function closeSimplePanels() {
  const searchPanel = document.getElementById('search-panel');
  const listPanel = document.getElementById('map-list-panel');
  const areaPanel = document.getElementById('area-move-panel');
  if (searchPanel) searchPanel.style.display = 'none';
  if (listPanel) listPanel.style.display = 'none';
  if (areaPanel) areaPanel.style.display = 'none';
}

function toggleMenu() {
  // 操作メニューを開閉したら、簡易表示（絞り込み／リスト展開）は自動で閉じる。
  closeSimplePanels();
  const dropdown = document.getElementById('menu-dropdown');
  dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
}

function closeDetailPanel() {
  pendingMoveTarget = null;
  const btn = document.getElementById('detail-move-btn');
  if (btn) { btn.style.display = 'none'; btn.dataset.type = ''; btn.dataset.id = ''; }
  document.getElementById('detail-area').style.display = 'none';
}
