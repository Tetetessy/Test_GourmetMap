// ============================================================
// Gourmet Map - Store markers
// 店舗マーカー生成
// ============================================================

function renderStoreMarkers(stores) {
  (stores || []).forEach(store => {
    const shape = STORE_PIN_SHAPES.find(x => x.id === store.pinShape) || STORE_PIN_SHAPES[0];
    const color = STORE_PIN_COLORS.find(x => x.id === store.pinColor) || STORE_PIN_COLORS[0];
    const shapeClass = shape.id === 'double-circle' ? 'store-pin-double-circle' : `store-pin-${shape.id}`;
    const activeList = window.activeMapListId || '';
    const inActiveList = !activeList || ((store.listIds || []).includes(activeList) || store.listId === activeList);
    const iconHtml = `<div class="store-custom-pin ${shapeClass}${inActiveList ? '' : ' store-pin-dimmed'}" style="background:${color.bg};"><span class="store-pin-symbol">${shape.icon}</span></div>`;
    const storeIcon = L.divIcon({
      className: '', html: iconHtml, iconSize: [34,34], iconAnchor: [17,17]
    });
    const marker = L.marker([store.lat, store.lng], { icon: storeIcon }).addTo(map);
    marker.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      showStoreDetail(store.id);
    });
    mapStoreMarkers.push(marker);
  });
}
