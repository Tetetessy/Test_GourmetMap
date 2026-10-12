/* 店舗・エリア処理の分離（第5段階） */

function startPinMoveFromDetail() {
      const btn = document.getElementById('detail-move-btn');
      const type = btn ? btn.dataset.type : '';
      const id = btn ? btn.dataset.id : '';
      if (type && id) startPinMove(type, id);
    }

function setDetailMoveButton(type, id, disabled) {
      const btn = document.getElementById('detail-move-btn');
      if (!btn) return;
      if (disabled) {
        btn.style.display = 'none';
        btn.dataset.type = '';
        btn.dataset.id = '';
        return;
      }
      btn.style.display = 'inline-block';
      btn.dataset.type = type;
      btn.dataset.id = id;
      btn.textContent = '📍 移動';
    }

function startPinMove(type, id) {
      const curMap = getCurrentMap();
      if (curMap.isShared) {
        alert('🔒 共有されたマップのため、ピンの移動はできません。');
        return;
      }
      const collection = type === 'store' ? (curMap.stores || []) : (curMap.areas || []);
      const target = collection.find(item => item.id === id);
      if (!target) return;
      pendingMoveTarget = { type, id };
      const detailContent = document.getElementById('detail-content');
      if (detailContent) {
        const label = type === 'store' ? '店舗' : 'エリア';
        const name = target.name || label;
        const notice = document.createElement('div');
        notice.style.cssText = 'margin:0 0 6px; padding:6px 8px; border-radius:6px; background:var(--primary-gradient); color:#fff; font-size:10.5px; font-weight:bold; text-align:center;';
        notice.textContent = `📍 「${name}」の新しい場所を地図上でタップしてください`;
        detailContent.prepend(notice);
      }
    }
