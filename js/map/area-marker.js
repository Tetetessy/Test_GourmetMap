// ============================================================
// Gourmet Map - Area markers
// エリアマーカー生成
// ============================================================

function renderAreaMarkers(areas) {
  (areas || []).forEach(area => {
    const colorObj = AREA_COLORS.find(c => c.id === area.color) || AREA_COLORS[0];
    const areaIcon = L.divIcon({
      className: '',
      html: `<div class="area-custom-pin" style="background: ${colorObj.bg};">🚩 ${area.name}</div>`,
      iconSize: [null, null],
      iconAnchor: [30, 15]
    });
    const marker = L.marker([area.lat, area.lng], { icon: areaIcon }).addTo(map);
    marker.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      showAreaDetail(area.id);
    });
    mapAreaMarkers.push(marker);
  });
}
