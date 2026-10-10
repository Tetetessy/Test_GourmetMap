// ============================================================
// Gourmet Map - Map rendering
// 地図マーカーの再描画
// ============================================================

function renderMapMarkers(curMap) {
  mapStoreMarkers.forEach(marker => map.removeLayer(marker));
  mapAreaMarkers.forEach(marker => map.removeLayer(marker));
  mapStoreMarkers = [];
  mapAreaMarkers = [];

  if (!curMap) return;
  renderAreaMarkers(curMap.areas || []);
  renderStoreMarkers(curMap.stores || []);
}
