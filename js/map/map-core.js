// ============================================================
// Gourmet Map - Map initialization and map click interactions
// 地図初期化・地図クリック処理
// ============================================================

function initializeMapAndInteractions() {
      map = L.map('map').setView([35.681236, 139.767125], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map);

      map.on('click', function(e) {
        const curMap = getCurrentMap();

        // 詳細ウィンドウの「📍 移動」を押した後は、次の地図タップ／クリック位置へ
        // 対象ピンを移動する。店舗・エリアの双方に対応する。
        if (pendingMoveTarget) {
          if (curMap.isShared) {
            pendingMoveTarget = null;
            alert('🔒 共有されたマップのため、ピンの移動はできません。');
            return;
          }
          const target = pendingMoveTarget;
          pendingMoveTarget = null;
          if (target.type === 'store') {
            const store = (curMap.stores || []).find(s => s.id === target.id);
            if (!store) return;
            store.lat = e.latlng.lat;
            store.lng = e.latlng.lng;
            saveStorage();
            renderCurrentMap();
            showStoreDetail(store.id);
          } else if (target.type === 'area') {
            const area = (curMap.areas || []).find(a => a.id === target.id);
            if (!area) return;
            area.lat = e.latlng.lat;
            area.lng = e.latlng.lng;
            saveStorage();
            renderCurrentMap();
            showAreaDetail(area.id);
          }
          return;
        }

        // 店舗・エリア詳細を開いている間は、地図の空白部分をクリック／タッチしても
        // 詳細ウィンドウを消したり内容を上書きしたりしない。
        // 店舗登録・エリア登録中だけは、従来どおり地図タップで位置を指定できる。
        const detailArea = document.getElementById('detail-area');
        if (detailArea && detailArea.style.display === 'block' && !pendingRegistrationType) return;

        if (curMap.isShared) {
          alert('🔒 共有されたマップのため、ピンの作成はできません。');
          return;
        }

        tempPinLocation = e.latlng;
        if (tempMarker) map.removeLayer(tempMarker);
        tempMarker = L.marker(e.latlng, { opacity: 0.9 }).addTo(map);
        
        const detailPanel = document.getElementById('detail-area');
        const detailContent = document.getElementById('detail-content');
        detailPanel.style.display = 'block';

        detailContent.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <p style="color:var(--primary-color); font-weight:bold; margin:0;">📍 ピンを置きました</p>
          </div>
          <p style="font-size:11.5px; color:#666; margin-top:4px;">「📍 店舗登録」または「🚩 エリア登録」を押すと登録できます。</p>
        `;

        // 登録ボタンを先に押した場合でも、ここではピンを置くだけにする。
        // ピンを置いた直後に登録ウィンドウを自動表示することはしない。
        if (pendingRegistrationType) {
          pendingRegistrationType = null;
        }
      });
}
