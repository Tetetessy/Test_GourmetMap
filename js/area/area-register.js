/* 店舗・エリア処理の分離（第5段階） */

function startAreaRegistration() {
      const curMap = getCurrentMap();
      if (curMap.isShared) {
        alert('🔒 共有されたマップのため、エリア登録はできません。');
        return;
      }
      if (tempPinLocation) {
        openAreaRegisterModalPrompt();
        return;
      }
      pendingRegistrationType = 'area';
      alert('エリアの中心にしたい場所を地図上でタップしてください。');
    }

function openAreaRegisterModalPrompt() {
      const curMap = getCurrentMap();

      if (curMap.isShared) {
        alert('🔒 共有されたマップのため、エリア編集・登録操作は禁止されています。');
        return;
      }

      if (!curMap.areas) curMap.areas = [];
      if (!curMap.areaLists) curMap.areaLists = [];
      
      const content = document.getElementById('modal-content');
      document.getElementById('modal-overlay').style.display = 'flex';

      const areasHtml = curMap.areas.map((a, index) => `
        <li style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.03); padding:6px 8px; margin-bottom:4px; border-radius:6px;">
          <span style="font-size:12px;">🚩 <b>No.${index + 1}</b>　${a.name}</span>
          <div>
            <button onclick="moveAreaToNo('${a.id}')" style="padding:2px 6px; font-size:10px;">↕️ No.移動</button>
            <button onclick="editAreaName('${a.id}')" style="background:#ff9f43; padding:2px 6px; font-size:10px;">✏️ 編集</button>
            <button onclick="deleteArea('${a.id}'); openAreaRegisterModalPrompt();" style="background:#dc3545; padding:2px 6px; font-size:10px;">削除</button>
          </div>
        </li>
      `).join('');

      content.classList.add('area-register-modal-content');
      content.innerHTML = `
        <div class="area-register-sticky-header">
          <div class="modal-header area-register-header-row">
            <div class="area-register-title-wrap">
              <h3>🚩 エリアの登録・管理</h3>
              <div class="area-register-limit-text">登録上限数: ${curMap.areas.length}/100</div>
            </div>
            <button type="button" onclick="closeModal()" class="btn-secondary area-register-close-btn">閉じる</button>
          </div>
        </div>
        <div style="margin-bottom:12px; border-bottom:1px solid var(--border-color); padding-bottom:10px;">
          <label style="font-weight:bold; font-size:11.5px;">新規エリア追加</label>
          <div style="display:flex; gap:4px; margin-top:4px;">
            <input type="text" id="reg-area-name" class="stylish-input" placeholder="例: 横浜駅周辺エリア" style="flex:1;">
            <button onclick="saveNewArea()" style="white-space:nowrap;">登録</button>
          </div>
          <small style="color:#888; font-size:10px;">※地図上にピンを立ててから登録ボタンを押してください。</small>
          <div style="margin-top:8px;">
            <label style="font-weight:bold; font-size:11px;">エリアリスト登録（複数可）</label>
            <div id="area-list-select-container" style="margin-top:4px;">${generateAreaListOptionsHtml()}</div>
            <div style="display:flex; gap:4px; margin-top:4px;">
              <input type="text" id="new-area-list-name" class="stylish-input" placeholder="新規エリアリスト名" style="flex:1;">
              <button type="button" onclick="createAreaListAndSelect()" style="white-space:nowrap;">＋作成</button>
            </div>
          </div>
        </div>

        <label style="font-weight:bold; font-size:11.5px;">登録済みエリア一覧</label>
        <ul style="list-style:none; padding:0; max-height:40vh; overflow-y:auto; margin-top:4px;">
          ${areasHtml.length > 0 ? areasHtml : '<p style="color:#888; font-size:11px;">登録エリアはありません。</p>'}
        </ul>
      `;
    }

function createAreaListAndSelect() {
      const curMap = getCurrentMap();
      if (curMap.isShared) return;
      const input = document.getElementById('new-area-list-name');
      const name = input ? input.value.trim() : '';
      if (!name) { alert('エリアリスト名を入力してください。'); return; }
      if (!curMap.areaLists) curMap.areaLists = [];
      if (curMap.areaLists.length >= 50) { alert('⚠️ エリアリスト上限数（50個）に達しています。'); return; }
      const newList = { id:'alst_' + Date.now() + '_' + Math.floor(Math.random()*1000), name, areaIds:[] };
      curMap.areaLists.push(newList);
      saveStorage();
      openAreaRegisterModalPrompt();
      setTimeout(() => {
        const cb = document.querySelector(`.existing-area-list-check[value="${newList.id}"]`);
        if (cb) cb.checked = true;
      }, 0);
    }

function saveNewArea() {
      const curMap = getCurrentMap();
      if (curMap.isShared) {
        alert('🔒 共有されたマップのため操作できません。');
        return;
      }

      if (!tempPinLocation) {
        alert('先に地図上でエリアの中心となる場所をタップしてください。');
        return;
      }
      const name = document.getElementById('reg-area-name').value.trim();
      if (!name) {
        alert('エリア名を入力してください。');
        return;
      }

      if (!curMap.areas) curMap.areas = [];
      if (curMap.areas.length >= 100) {
        alert('⚠️ エリアの登録上限数（100件）に達しています。');
        return;
      }

      const selectedAreaListIds = Array.from(document.querySelectorAll('.existing-area-list-check:checked')).map(el => el.value);
      const newAreaListName = (document.getElementById('new-area-list-name')?.value || '').trim();
      if (newAreaListName) {
        if (!curMap.areaLists) curMap.areaLists = [];
        if (curMap.areaLists.length >= 50) {
          alert('⚠️ エリアリスト上限数（50個）に達しています。');
          return;
        }
        const newList = { id: 'alst_' + Date.now() + '_' + Math.floor(Math.random()*1000), name: newAreaListName, areaIds: [] };
        curMap.areaLists.push(newList);
        selectedAreaListIds.push(newList.id);
      }
      const newAreaId = 'area_' + Date.now() + '_' + Math.floor(Math.random()*1000);
      curMap.areas.push({
        id: newAreaId,
        name: name,
        color: 'teal',
        lat: tempPinLocation.lat,
        lng: tempPinLocation.lng,
        listIds: [...new Set(selectedAreaListIds)]
      });
      curMap.areaLists.forEach(l => {
        if (selectedAreaListIds.includes(l.id)) {
          if (!Array.isArray(l.areaIds)) l.areaIds = [];
          l.areaIds.push(newAreaId);
        }
      });

      if (tempMarker) { map.removeLayer(tempMarker); tempMarker = null; }
      tempPinLocation = null;

      saveStorage();
      renderCurrentMap();
      openAreaRegisterModalPrompt();
    }

function editAreaName(areaId) {
      const curMap = getCurrentMap();
      if (curMap.isShared) { alert('🔒 共有されたマップのため操作できません。'); return; }
      const area = curMap.areas.find(a => a.id === areaId);
      if (!area) return;
      const newName = prompt('エリア名を変更:', area.name);
      if (newName && newName.trim()) {
        area.name = newName.trim();
        saveStorage();
        openAreaRegisterModalPrompt();
      }
    }

function moveAreaToNo(areaId) {
      const curMap = getCurrentMap();
      if (curMap.isShared) return;
      const currentIndex = curMap.areas.findIndex(a => a.id === areaId);
      if (currentIndex < 0) return;
      const currentNo = currentIndex + 1;
      const input = prompt(`「${curMap.areas[currentIndex].name}」を何番目に移動しますか？\n現在: No.${currentNo} / 範囲: No.1～No.${curMap.areas.length}`, String(currentNo));
      if (input === null) return;
      const targetNo = parseInt(input, 10);
      if (!Number.isInteger(targetNo) || targetNo < 1 || targetNo > curMap.areas.length) {
        alert(`No.は1～${curMap.areas.length}の範囲で指定してください。`);
        return;
      }
      const targetIndex = targetNo - 1;
      if (targetIndex === currentIndex) return;
      const [moved] = curMap.areas.splice(currentIndex, 1);
      curMap.areas.splice(targetIndex, 0, moved);
      saveStorage();
      openAreaRegisterModalPrompt();
    }
