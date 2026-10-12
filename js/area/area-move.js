/* 店舗・エリア処理の分離（第5段階） */

function toggleAreaMovePanel() {
      const panel = document.getElementById('area-move-panel');
      if (!panel) return;
      const open = panel.style.display === 'block';
      closeSimplePanels();
      if (!open) { panel.style.display = 'block'; updateAreaMovePanel(); }
    }

function toggleAreaMoveSection(sectionId) {
      const el = document.getElementById(sectionId);
      if (!el) return;
      const willOpen = el.style.display !== 'block';
      document.querySelectorAll('#area-move-content .area-move-items').forEach(item => {
        item.style.display = 'none';
      });
      document.querySelectorAll('#area-move-content [data-area-section-arrow]').forEach(arrow => {
        arrow.textContent = '▶';
      });
      if (willOpen) {
        el.style.display = 'block';
        const arrow = document.querySelector(`[data-area-section-arrow="${sectionId}"]`);
        if (arrow) arrow.textContent = '▼';
      }
    }

function updateAreaMovePanel() {
      const container = document.getElementById('area-move-content');
      const cur = getCurrentMap();
      if (!container || !cur) return;
      if (!cur.areaLists) cur.areaLists = [];
      if (!cur.areas) cur.areas = [];

      let html = '';
      cur.areaLists.forEach((list, index) => {
        const areaIds = Array.isArray(list.areaIds) ? list.areaIds : [];
        const assigned = areaIds.map(id => cur.areas.find(a => a.id === id)).filter(Boolean);
        const sectionId = 'area-move-list-' + list.id;
        html += `
          <div class="area-move-section">
            <div class="area-move-section-title" onclick="toggleAreaMoveSection('${sectionId}')">
              <span class="area-move-list-label">📁 No.${index + 1}　${list.name}<span class="area-move-list-count">(${assigned.length}件)</span></span>
              <span class="area-move-arrow" data-area-section-arrow="${sectionId}">▶</span>
            </div>
            <div id="${sectionId}" class="area-move-items">
              ${assigned.length ? assigned.map((a,i) => `<div class="area-move-item" role="button" tabindex="0" onclick="moveToArea('${a.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();moveToArea('${a.id}')}">🚩 No.${i + 1}　${a.name}</div>`).join('') : '<div class="area-move-empty">このリストにはエリアがありません。</div>'}
            </div>
          </div>`;
      });

      const allId = 'area-move-all';
      html += `
        <div class="area-move-section">
          <div class="area-move-section-title" onclick="toggleAreaMoveSection('${allId}')">
            <span class="area-move-list-label">📍 すべてのエリア<span class="area-move-list-count">(${cur.areas.length}件)</span></span>
            <span class="area-move-arrow" data-area-section-arrow="${allId}">▶</span>
          </div>
          <div id="${allId}" class="area-move-items">
            ${cur.areas.length ? cur.areas.map((a,i) => `<div class="area-move-item" role="button" tabindex="0" onclick="moveToArea('${a.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();moveToArea('${a.id}')}">🚩 No.${i + 1}　${a.name}</div>`).join('') : '<div class="area-move-empty">登録エリアはありません。</div>'}
          </div>
        </div>`;
      container.innerHTML = html;
    }

function moveToArea(areaId) {
      if (!areaId) return;
      const cur = getCurrentMap();
      const area = (cur.areas || []).find(a => a.id === areaId);
      if (!area || !Number.isFinite(Number(area.lat)) || !Number.isFinite(Number(area.lng))) return;
      const target = [Number(area.lat), Number(area.lng)];
      const currentZoom = map.getZoom();
      const travelZoom = Math.max(10, Math.min(12, currentZoom - 2));
      // いったんズームアウトしてから、目的地へスライド移動しつつ近づく。
      map.flyTo(map.getCenter(), travelZoom, { duration: 1.4, easeLinearity: 0.2 });
      setTimeout(() => {
        map.flyTo(target, 15, { duration: 1.6, easeLinearity: 0.2 });
      }, 1400);
      const areaPanel = document.getElementById('area-move-panel');
      if (areaPanel) areaPanel.style.display = 'none';
    }
