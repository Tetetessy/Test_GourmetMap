/* 店舗・エリア処理の分離（第5段階） */

function getNearestStoreOrder(storeId) {
      const curMap = getCurrentMap();
      const stores = (curMap && curMap.stores ? curMap.stores : []).filter(s =>
        s && Number.isFinite(Number(s.lat)) && Number.isFinite(Number(s.lng))
      );
      const current = stores.find(s => s.id === storeId);
      if (!current) return [];
      const lat0 = Number(current.lat) * Math.PI / 180;
      const lng0 = Number(current.lng) * Math.PI / 180;
      const cosLat = Math.cos(lat0);
      return stores.map(s => {
        const lat = Number(s.lat) * Math.PI / 180;
        const lng = Number(s.lng) * Math.PI / 180;
        const dx = (lng - lng0) * cosLat;
        const dy = lat - lat0;
        return { store:s, distance: Math.sqrt(dx*dx + dy*dy) };
      }).sort((a,b) => a.distance - b.distance).map(x => x.store);
    }

function switchToNearbyStore(storeId, direction) {
      const order = getNearestStoreOrder(storeId);
      if (order.length < 2) return;
      const currentIndex = order.findIndex(s => s.id === storeId);
      if (currentIndex < 0) return;
      let nextIndex = currentIndex + (direction < 0 ? -1 : 1);
      // 現在店は常にNo.0、そこから近い順に巡回する。
      if (nextIndex < 0) nextIndex = order.length - 1;
      if (nextIndex >= order.length) nextIndex = 0;
      const nextStore = order[nextIndex];
      if (nextStore) showStoreDetail(nextStore.id);
    }

function getNearestStoreDistanceText(storeId) {
      const order = getNearestStoreOrder(storeId);
      if (order.length < 2) return '';
      const current = order[0];
      const next = order[1];
      const lat1 = Number(current.lat) * Math.PI / 180;
      const lat2 = Number(next.lat) * Math.PI / 180;
      const dLat = lat2 - lat1;
      const dLng = (Number(next.lng) - Number(current.lng)) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
      const meters = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return `${Math.round(meters)}m先: ${next.name}`;
    }

function showStoreDetail(storeId) {
      const curMap = getCurrentMap();
      const store = curMap.stores.find(s => s.id === storeId);
      if (!store) return;

      const assignedLists = (curMap.lists || []).filter(l => (store.listIds || []).includes(l.id) || store.listId === l.id).map(l => l.name);
      const listDisp = assignedLists.length > 0 ? assignedLists.join(', ') : '未登録';

      let imgHtml = '';
      if (store.images && store.images.length > 0) {
        imgHtml = `<div style="display:flex; gap:4px; overflow-x:auto; margin:6px 0;">` + 
          store.images.map(img => `<img src="${img}" style="height:70px; border-radius:6px; object-fit:cover;">`).join('') +
          `</div>`;
      }

      const urls = [
        { label: '予約対応', val: store.reserve },
        { label: '公式サイト', val: store.official },
        { label: '食べログ', val: store.tabelog },
        { label: 'ホットペッパー', val: store.hotpepper }
      ].filter(u => u.val && u.val !== '-');

      let urlSectionHtml = '';
      if (urls.length > 0) {
        urlSectionHtml = `
          <div style="margin-top:6px; border:1px solid var(--border-color); border-radius:6px; padding:4px;">
            <button onclick="toggleUrlAccordion()" style="width:100%; text-align:left; background:none; color:var(--primary-color); border:none; padding:2px; font-weight:bold; font-size:11px; cursor:pointer;">
              ▶ 関連URL・各種リンク (${urls.length}件)
            </button>
            <div id="url-accordion-content" style="display:none; margin-top:4px; padding-top:4px; border-top:1px dashed var(--border-color);">
              ${urls.map(u => {
                const isLink = u.val.startsWith('http://') || u.val.startsWith('https://');
                return `<div style="font-size:11px; margin-bottom:2px;">
                  <b>${u.label}:</b> ${isLink ? `<a href="${u.val}" target="_blank" style="color:var(--primary-color); text-decoration:underline;">${u.val}</a>` : u.val}
                </div>`;
              }).join('')}
            </div>
          </div>
        `;
      } else {
        urlSectionHtml = `<div style="font-size:11px; margin-top:4px; color:#888;"><b>予約対応/各種URL:</b> -</div>`;
      }

      const detailPanel = document.getElementById('detail-area');
      const detailContent = document.getElementById('detail-content');
      detailPanel.style.display = 'block';
      setDetailMoveButton('store', store.id, curMap.isShared);

      const currentShape = STORE_PIN_SHAPES.find(x => x.id === store.pinShape) || STORE_PIN_SHAPES[0];
      const currentColor = STORE_PIN_COLORS.find(x => x.id === store.pinColor) || STORE_PIN_COLORS[0];
      const pinSettingsHtml = curMap.isShared ? '' : `
        <div style="margin-top:7px; padding:6px; border:1px solid var(--border-color); border-radius:6px;">
          <div style="font-size:10px; font-weight:bold; margin-bottom:4px;">📍 店舗ピン</div>
          <div class="store-pin-choice-grid">
            ${STORE_PIN_SHAPES.map(sh => `
              <button type="button" class="store-pin-choice ${currentShape.id === sh.id ? 'selected' : ''}" onclick="changeStorePin('${store.id}','pinShape','${sh.id}')">
                <div class="store-custom-pin store-pin-preview ${sh.id === 'double-circle' ? 'store-pin-double-circle' : 'store-pin-' + sh.id}" style="background:${currentColor.bg};"><span class="store-pin-symbol">${sh.icon}</span></div>${sh.label}
              </button>
            `).join('')}
          </div>
          <div style="font-size:10px; font-weight:bold; margin:5px 0 3px;">色味 (8段階)</div>
          <div class="color-picker-grid">
            ${STORE_PIN_COLORS.map(c => `<button type="button" class="color-btn" style="background:${c.bg}; border:${currentColor.id === c.id ? '3px solid #000' : '2px solid #fff'};" onclick="changeStorePin('${store.id}','pinColor','${c.id}')" title="${c.label}"></button>`).join('')}
          </div>
        </div>
      `;

      const actionButtons = curMap.isShared ? `
        <button onclick="reflectStoreToMyMap('${store.id}')" style="background:#4ecdc4; font-size:10px; padding:2px 6px;">📥 マイマップへ反映</button>
      ` : `
        <button onclick="openShareStoreModal('${store.id}')" style="background:#4ecdc4; font-size:10px; padding:2px 6px;">🔗 共有</button>
        <button onclick="openEditStoreModal('${store.id}')" style="background:#ff9f43; font-size:10px; padding:2px 6px;">✏️ 編集</button>
        <button onclick="deleteStore('${store.id}')" style="background:#dc3545; font-size:10px; padding:2px 6px;">削除</button>
      `;

      const nearbyOrder = getNearestStoreOrder(store.id);
      const hasNearbyStore = nearbyOrder.length > 1;
      const nearbyHint = getNearestStoreDistanceText(store.id);

      detailContent.innerHTML = `
        ${hasNearbyStore ? `
          <div style="display:flex; align-items:center; justify-content:space-between; gap:5px; margin:-2px 0 6px; padding-bottom:5px; border-bottom:1px solid var(--border-color);">
            <button type="button" onclick="switchToNearbyStore('${store.id}',-1)" title="近い店舗へ戻る" style="background:#6c757d; min-width:34px; font-size:16px; line-height:1; padding:4px 8px;">&lt;</button>
            <div style="flex:1; text-align:center; font-size:9.5px; color:#777; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">↔ 近い店舗へ移動${nearbyHint ? ` / ${nearbyHint}` : ''}</div>
            <button type="button" onclick="switchToNearbyStore('${store.id}',1)" title="近い店舗へ進む" style="background:#6c757d; min-width:34px; font-size:16px; line-height:1; padding:4px 8px;">&gt;</button>
          </div>
        ` : ''}
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <span style="font-size:10px; color:#ff6b6b; font-weight:bold;">${store.isFavorite ? '⭐ お気に入り' : '☆ 通常'}</span>
            <h3 style="margin:2px 0 0 0; color:var(--primary-color); font-size:14px;">${store.name}</h3>
          </div>
          <div style="display:flex; gap:4px;">
            ${actionButtons}
          </div>
        </div>

        <div style="font-size:11px; color:#555; margin-top:4px;"><b>リスト:</b> ${listDisp}</div>

        ${imgHtml}

        <div style="font-size:11px; margin-top:4px; background:rgba(0,0,0,0.02); padding:4px; border-radius:4px;">
          <div><b>形式:</b> ${getStoreForms(store).join(' / ') || '-'} / <b>ジャンル:</b> ${getStoreGenres(store).join(' / ') || '-'}</div>
          <div style="margin-top:2px;"><b>予算:</b> ${store.budget || '-'}</div>
          <div style="margin-top:5px;"><b>オプション:</b> ${getStoreOptions(store).length ? getStoreOptions(store).map(id => (STORE_OPTION_DEFS.find(o => o.id === id) || {}).label).filter(Boolean).join(' / ') : 'なし'}</div>
        </div>

        ${!curMap.isShared ? `
          <div style="margin-top:6px; padding:6px; border:1px solid var(--border-color); border-radius:6px;">
            <div style="font-size:10px; font-weight:bold; margin-bottom:4px;">オプション（複数選択可）</div>
            ${renderStoreOptionChecks(getStoreOptions(store), 'detail-store-option')}
            <button onclick="saveDetailStoreOptions('${store.id}')" style="margin-top:5px; width:100%; font-size:10px; padding:4px;">オプションを保存</button>
          </div>
        ` : ''}

        ${pinSettingsHtml}

        <div style="font-size:11px; margin-top:4px; display:flex; flex-direction:column; gap:2px;">
          <div><b>コスパ:</b> [低] ${'★'.repeat(store.cospa || 3)}${'☆'.repeat(5 - (store.cospa || 3))} [高&lt;良&gt;]</div>
          <div><b>キャパ:</b> [少人数] ${'★'.repeat(store.capa || 3)}${'☆'.repeat(5 - (store.capa || 3))} [大人数向け]</div>
          <div><b>雰囲気:</b> [落ち着いた] ${'★'.repeat(store.mood || 3)}${'☆'.repeat(5 - (store.mood || 3))} [にぎやか]</div>
        </div>

        <div style="font-size:11px; margin-top:4px;"><b>最寄り駅:</b> ${store.station || '-'}</div>
        <div style="font-size:11px; margin-top:4px;"><b>連絡先:</b> ${store.contact || '-'}</div>

        ${urlSectionHtml}

        <div style="font-size:11px; margin-top:4px;"><b>その他:</b> ${store.other || '-'}</div>

        <div style="font-size:11px; margin-top:6px; background:rgba(0,0,0,0.03); padding:6px; border-radius:6px; border-left:3px solid var(--accent-color);">
          <b>備考:</b><br>${store.memo ? store.memo.replace(/\n/g, '<br>') : 'なし'}
        </div>
      `;

      map.setView([store.lat, store.lng], 16);
    }

function saveDetailStoreOptions(storeId) {
      const curMap = getCurrentMap();
      if (curMap.isShared) return;
      const store = curMap.stores.find(s => s.id === storeId);
      if (!store) return;
      store.options = Array.from(document.querySelectorAll('.detail-store-option:checked')).map(el => el.value);
      saveStorage();
      showStoreDetail(storeId);
    }

function reflectStoreToMyMap(storeId) {
      const curMap = getCurrentMap();
      const store = curMap.stores.find(s => s.id === storeId);
      if (!store) return;

      const myMaps = maps.filter(m => !m.isShared);
      if (myMaps.length === 0) {
        alert('⚠️ 自作のマップが見つかりません。新規マップを作成してください。');
        return;
      }

      const targetMapId = prompt(`店舗「${store.name}」をどの自作マップに反映しますか？\n(対象のマップIDを入力してください)\n\n利用可能なマップ:\n` + myMaps.map(m => `${m.name} [ID: ${m.id}]`).join('\n'), myMaps[0].id);

      if (!targetMapId) return;
      const targetMap = myMaps.find(m => m.id === targetMapId.trim());
      if (!targetMap) {
        alert('⚠️ 指定されたマップが見つかりません。');
        return;
      }

      if (!targetMap.stores) targetMap.stores = [];
      if (targetMap.stores.length >= 200) {
        alert('⚠️ 対象のマップが店舗上限数（200件）に達しています。');
        return;
      }

      const copiedStore = JSON.parse(JSON.stringify(store));
      copiedStore.id = 'str_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      targetMap.stores.push(copiedStore);
      saveStorage();
      alert(`🎉 マップ「${targetMap.name}」に店舗情報を反映しました！`);
    }

function openShareStoreModal(storeId) {
      const curMap = getCurrentMap();
      const store = curMap.stores.find(s => s.id === storeId);
      if (!store) return;

      const content = document.getElementById('modal-content');
      document.getElementById('modal-overlay').style.display = 'flex';

      const otherMaps = maps.filter(m => m.id !== curMap.id && !m.isShared);

      if (otherMaps.length === 0) {
        content.innerHTML = `
          <div class="modal-header"><h3>🔗 他のマップへ共有</h3></div>
          <p style="font-size:11.5px; color:#666;">他に登録されているマイマップがありません。新規マップを作成後にご利用ください。</p>
          <button onclick="closeModal()" class="btn-secondary" style="width:100%; margin-top:10px;">閉じる</button>
        `;
        return;
      }

      const mapCheckboxes = otherMaps.map(m => `
        <label style="display:flex; align-items:center; gap:6px; font-size:12px; margin-bottom:6px; cursor:pointer;">
          <input type="checkbox" class="share-map-checkbox" value="${m.id}">
          <span>🗺️ <b>${m.name}</b></span>
        </label>
      `).join('');

      content.innerHTML = `
        <div class="modal-header"><h3>🔗 「${store.name}」を共有</h3></div>
        <p style="font-size:11px; color:#666; margin-bottom:8px;">反映させたいマップをチェックしてください（複数選択可）。</p>
        <div style="max-height:40vh; overflow-y:auto; margin-bottom:10px;">
          ${mapCheckboxes}
        </div>
        <div class="btn-group">
          <button onclick="executeShareStore('${store.id}')">反映保存</button>
          <button onclick="closeModal()" class="btn-secondary">キャンセル</button>
        </div>
      `;
    }

function executeShareStore(storeId) {
      const curMap = getCurrentMap();
      const store = curMap.stores.find(s => s.id === storeId);
      if (!store) return;

      const checkboxes = document.querySelectorAll('.share-map-checkbox:checked');
      if (checkboxes.length === 0) {
        alert('共有先のマップを1つ以上選択してください。');
        return;
      }

      checkboxes.forEach(cb => {
        const targetMap = maps.find(m => m.id === cb.value);
        if (targetMap) {
          if (!targetMap.stores) targetMap.stores = [];
          if (targetMap.stores.length < 200) {
            const copiedStore = JSON.parse(JSON.stringify(store));
            copiedStore.id = 'str_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
            targetMap.stores.push(copiedStore);
          }
        }
      });

      saveStorage();
      closeModal();
      alert('🎉 選択したマップに店舗情報を共有・反映しました！');
    }

function toggleUrlAccordion() {
      const content = document.getElementById('url-accordion-content');
      if (content) {
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
      }
    }

function openEditStoreModal(storeId) {
      const curMap = getCurrentMap();
      if (curMap.isShared) return;
      const store = curMap.stores.find(s => s.id === storeId);
      if (store) openStoreRegisterModalFromPin(store);
    }

function deleteStore(storeId) {
      const curMap = getCurrentMap();
      if (curMap.isShared) return;
      if (!confirm('この店舗を削除しますか？')) return;
      curMap.stores = curMap.stores.filter(s => s.id !== storeId);
      saveStorage();
      closeDetailPanel();
    }
