/* 店舗・エリア処理の分離（第5段階） */

function showAreaDetail(areaId) {
      const curMap = getCurrentMap();
      const area = curMap.areas.find(a => a.id === areaId);
      if (!area) return;

      const detailPanel = document.getElementById('detail-area');
      const detailContent = document.getElementById('detail-content');
      detailPanel.style.display = 'block';
      setDetailMoveButton('area', area.id, curMap.isShared);

      const colorBtnsHtml = AREA_COLORS.map(c => `
        <div class="color-btn" style="background:${c.bg}; border: ${area.color === c.id ? '3px solid #000' : '2px solid #fff'};" 
             onclick="changeAreaColor('${area.id}', '${c.id}')" title="${c.label}"></div>
      `).join('');

      const actionButtons = curMap.isShared ? `
        <button onclick="openSharedImportModal()" style="background:#4ecdc4; font-size:11px; padding:6px; width:100%;">📥 共有データを取り込む</button>
      ` : `
        <button onclick="editAreaNameFromDetail('${area.id}')" style="background:#ff9f43; font-size:11px; padding:6px; width:100%;">✏️ 編集</button>
        <button onclick="deleteArea('${area.id}')" style="background:#dc3545; font-size:11px; padding:6px; width:100%;">削除</button>
      `;

      detailContent.innerHTML = `
        <h3 style="margin:0 0 8px 0; color:var(--primary-color); font-size:13px;">🚩 ${area.name}</h3>
        
        ${!curMap.isShared ? `
          <p style="font-size:11px; margin-top:6px; font-weight:bold;">🎨 ピンのカラーを選択 (8段階):</p>
          <div class="color-picker-grid" style="margin-bottom:12px;">
            ${colorBtnsHtml}
          </div>
        ` : ''}

        <div style="display:flex; flex-direction:column; gap:4px; margin-top:8px;">
          ${actionButtons}
          <div style="display:flex; gap:4px; margin-top:0;">
            ${curMap.isShared ? '' : `<button onclick="startPinMove('area','${area.id}')" style="flex:1; font-size:11px; padding:6px;">📍 移動</button>`}
            <button onclick="closeDetailPanel()" class="btn-secondary" style="flex:1; font-size:11px; padding:6px;">閉じる</button>
          </div>
        </div>
      `;
      map.setView([area.lat, area.lng], 15);
    }

function editAreaNameFromDetail(areaId) {
      const curMap = getCurrentMap();
      if (curMap.isShared) return;
      const area = curMap.areas.find(a => a.id === areaId);
      if (!area) return;
      const newName = prompt('エリア名を編集:', area.name);
      if (newName && newName.trim()) {
        area.name = newName.trim();
        saveStorage();
        showAreaDetail(areaId);
      }
    }

function changeAreaColor(areaId, colorId) {
      const curMap = getCurrentMap();
      if (curMap.isShared) return;
      const area = curMap.areas.find(a => a.id === areaId);
      if (area) {
        area.color = colorId;
        saveStorage();
        showAreaDetail(areaId);
      }
    }

function deleteArea(areaId) {
      const curMap = getCurrentMap();
      if (curMap.isShared) return;
      if (!confirm('このエリアピンを削除しますか？')) return;
      curMap.areas = curMap.areas.filter(a => a.id !== areaId);
      (curMap.areaLists || []).forEach(l => { l.areaIds = (l.areaIds || []).filter(id => id !== areaId); });
      saveStorage();
      closeDetailPanel();
    }
