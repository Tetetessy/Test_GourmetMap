/* 店舗・エリア処理の分離（第5段階） */

function generateAreaListOptionsHtml(selectedIds = []) {
      const curMap = getCurrentMap();
      if (!curMap.areaLists || curMap.areaLists.length === 0) return '<div style="font-size:10px;color:#888;">エリアリストがありません。</div>';
      const selected = new Set(selectedIds || []);
      return curMap.areaLists.map(l => `
        <label style="display:flex;align-items:center;gap:5px;font-size:10.5px;margin:3px 0;cursor:pointer;">
          <input type="checkbox" class="existing-area-list-check" value="${l.id}" ${selected.has(l.id) ? 'checked' : ''}>
          <span>📁 ${l.name}</span>
        </label>`).join('');
    }
