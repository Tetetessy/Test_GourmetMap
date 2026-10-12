// 分割移行：リスト／検索関連処理
// このファイルは index.html より前に読み込まれるため、既存のグローバル関数をそのまま利用します。

function renderListChoiceTags(selectedIds = []) {
  const cur = getCurrentMap();
  const selected = new Set(selectedIds || []);
  return `<button type="button" class="choice-tag reg-list-tag ${selected.size === 0 ? 'selected' : ''}" data-value="" onclick="toggleListChoiceTag(this)">選択なし</button>` + (cur?.lists || []).map(l => `<button type="button" class="choice-tag reg-list-tag ${selected.has(l.id) ? 'selected' : ''}" data-value="${l.id}" onclick="toggleListChoiceTag(this)">${l.name}</button>`).join('');
}

function toggleListChoiceTag(el) {
  const all = document.querySelectorAll('.reg-list-tag');
  if (el.dataset.value === '') { all.forEach(x => x.classList.remove('selected')); el.classList.add('selected'); return; }
  el.classList.toggle('selected');
  const none = Array.from(all).find(x => x.dataset.value === '');
  if (none) none.classList.toggle('selected', !Array.from(all).some(x => x.dataset.value && x.classList.contains('selected')));
}

function openCustomListModal() {
  toggleMenu();
  const curMap = getCurrentMap();
  const content = document.getElementById('modal-content');
  content.classList.add('list-manage-modal-content');
  document.getElementById('modal-overlay').style.display = 'flex';

  const listsHtml = (curMap.lists || []).map((l, index) => {
    const assignedStores = (curMap.stores || []).filter(s => (s.listIds || []).includes(l.id) || s.listId === l.id);
    const storesHtml = assignedStores.map((s, sIndex) => `
      <div class="list-store-row" style="background:rgba(255,255,255,0.7); padding:3px 6px; margin-top:2px; border-radius:4px; font-size:11px;">
        <span style="min-width:0;">🍽️ <b>No.${sIndex + 1}</b>　${s.name}</span>
        ${!curMap.isShared ? `
          <div class="list-store-actions">
            <button onclick="moveStoreInList('${l.id}', '${s.id}')" style="padding:2px 6px; font-size:10px;">↕️ No.移動</button>
            <button onclick="removeStoreFromList('${l.id}', '${s.id}')" class="btn-sm-icon" style="background:#dc3545; color:#fff;">削除</button>
          </div>
        ` : ''}
      </div>
    `).join('');

    return `
      <li style="margin-bottom:8px; background:rgba(0,0,0,0.03); padding:8px; border-radius:8px; border:1px solid var(--border-color);">
        <div class="list-manage-header">
          <div class="list-manage-row-main" onclick="toggleListAccordion('list-stores-${l.id}')" style="cursor:pointer;">
            <span class="list-manage-name ${String(l.name || "").length > 18 ? "long" : ""} ${String(l.name || "").length > 28 ? "very-long" : ""}">▶ 📌 No.${index + 1}　${l.name}</span>
            <span class="list-manage-count">店舗数：${assignedStores.length}件</span>
          </div>
          ${!curMap.isShared ? `
            <div class="list-manage-actions">
              <button onclick="moveCustomList(${index},-1)" style="padding:2px 6px; font-size:10px;">↑</button>
              <button onclick="moveCustomList(${index},1)" style="padding:2px 6px; font-size:10px;">↓</button>
              <button onclick="moveCustomListToNo('${l.id}')" style="padding:2px 6px; font-size:10px;">↕️ No.移動</button>
              <button onclick="editCustomListName('${l.id}')" style="background:#ff9f43; padding:2px 6px; font-size:10px;">✏️ 編集</button>
              <button onclick="deleteCustomList('${l.id}')" style="background:#dc3545; padding:2px 6px; font-size:10px;">削除</button>
            </div>
          ` : ''}
        </div>
        <div id="list-stores-${l.id}" style="display:none; margin-top:6px; padding-left:6px; border-left:2px solid var(--primary-color);">
          ${storesHtml || '<p style="color:#888; font-size:10px; margin-top:2px;">店舗は登録されていません</p>'}
        </div>
      </li>
    `;
  }).join('');

  content.innerHTML = `
    <div class="modal-header"><h3>📋 リスト管理</h3></div>
    <p style="font-size:11px; color:#666; margin-bottom:8px;">リスト登録上限数: ${curMap.lists ? curMap.lists.length : 0}/50</p>
    ${!curMap.isShared ? `<button onclick="createCustomListPrompt()" class="theme-blue-action" style="width:100%; margin-bottom:10px;">＋ 新しいリストを追加</button>` : ''}
    <ul style="list-style:none; padding:0; max-height:50vh; overflow-y:auto;">${listsHtml.length > 0 ? listsHtml : '<p style="color:#888; font-size:11px;">リストが登録されていません。</p>'}</ul>
    <button onclick="closeModal()" class="btn-secondary" style="width:100%; margin-top:10px;">閉じる</button>
  `;
}

function toggleListAccordion(elemId) {
  const el = document.getElementById(elemId);
  if (el) {
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
  }
}

function moveCustomListToNo(listId) {
  const curMap = getCurrentMap();
  if (curMap.isShared) return;
  const currentIndex = curMap.lists.findIndex(l => l.id === listId);
  if (currentIndex < 0) return;
  const list = curMap.lists[currentIndex];
  const input = prompt(`「${list.name}」を何番目に移動しますか？\n現在: No.${currentIndex + 1} / 範囲: No.1～No.${curMap.lists.length}`, String(currentIndex + 1));
  if (input === null) return;
  const targetNo = parseInt(input, 10);
  if (!Number.isInteger(targetNo) || targetNo < 1 || targetNo > curMap.lists.length) {
    alert(`No.は1～${curMap.lists.length}の範囲で指定してください。`);
    return;
  }
  const [moved] = curMap.lists.splice(currentIndex, 1);
  curMap.lists.splice(targetNo - 1, 0, moved);
  saveStorage();
  openCustomListModal();
}

function moveCustomList(index, direction) {
  const curMap = getCurrentMap();
  if (curMap.isShared) return;
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= curMap.lists.length) return;
  const temp = curMap.lists[index];
  curMap.lists[index] = curMap.lists[targetIndex];
  curMap.lists[targetIndex] = temp;
  saveStorage();
  openCustomListModal();
}

function editCustomListName(listId) {
  const curMap = getCurrentMap();
  if (curMap.isShared) return;
  const list = curMap.lists.find(l => l.id === listId);
  if (!list) return;
  const newName = prompt('リスト名を編集:', list.name);
  if (newName && newName.trim()) {
    list.name = newName.trim();
    saveStorage();
    openCustomListModal();
  }
}

function moveStoreInList(listId, storeId) {
  const curMap = getCurrentMap();
  if (curMap.isShared) return;
  const assignedStores = (curMap.stores || []).filter(s => (s.listIds || []).includes(listId) || s.listId === listId);
  const currentIndex = assignedStores.findIndex(s => s.id === storeId);
  if (currentIndex < 0) return;
  const currentNo = currentIndex + 1;
  const store = assignedStores[currentIndex];
  const input = prompt(`「${store.name}」を何番目に移動しますか？\n現在: No.${currentNo} / 範囲: No.1～No.${assignedStores.length}`, String(currentNo));
  if (input === null) return;
  const targetNo = parseInt(input, 10);
  if (!Number.isInteger(targetNo) || targetNo < 1 || targetNo > assignedStores.length) {
    alert(`No.は1～${assignedStores.length}の範囲で指定してください。`);
    return;
  }
  const targetIndex = targetNo - 1;
  if (targetIndex === currentIndex) return;

  // リスト内では「入れ替え」ではなく、指定Noへ割り込ませる。
  // 実データは店舗配列を、リスト内の並びを保ったまま組み替える。
  const idxA = curMap.stores.findIndex(s => s.id === storeId);
  if (idxA < 0) return;
  const targetStore = assignedStores[targetIndex];
  const idxTarget = curMap.stores.findIndex(s => s.id === targetStore.id);
  if (idxTarget < 0) return;

  const [moved] = curMap.stores.splice(idxA, 1);
  const adjustedTargetIndex = curMap.stores.findIndex(s => s.id === targetStore.id);
  if (adjustedTargetIndex < 0) return;
  curMap.stores.splice(adjustedTargetIndex, 0, moved);

  saveStorage();
  openCustomListModal();
  toggleListAccordion('list-stores-' + listId);
}

function removeStoreFromList(listId, storeId) {
  const curMap = getCurrentMap();
  if (curMap.isShared) return;
  const store = curMap.stores.find(s => s.id === storeId);
  if (store) {
    if (store.listIds) store.listIds = store.listIds.filter(id => id !== listId);
    if (store.listId === listId) store.listId = '';
    saveStorage();
    openCustomListModal();
    toggleListAccordion('list-stores-' + listId);
  }
}

function createCustomListPrompt() {
  const curMap = getCurrentMap();
  if (curMap.isShared) return;
  if (!curMap.lists) curMap.lists = [];
  if (curMap.lists.length >= 50) { alert('⚠️ リスト上限数（50個）に達しています。'); return; }
  const name = prompt('新しいリスト名:');
  if (!name || !name.trim()) return;
  curMap.lists.push({ id: 'lst_' + Date.now(), name: name.trim() });
  saveStorage();
  openCustomListModal();
}

function deleteCustomList(listId) {
  const curMap = getCurrentMap();
  if (curMap.isShared) return;
  if (!confirm('このリストを削除しますか？')) return;
  curMap.lists = curMap.lists.filter(l => l.id !== listId);
  curMap.stores.forEach(s => {
    if (s.listIds) s.listIds = s.listIds.filter(id => id !== listId);
    if (s.listId === listId) s.listId = '';
  });
  saveStorage();
  openCustomListModal();
}

function moveStoreInRegisteredList(index, direction) {
  const curMap = getCurrentMap();
  if (curMap.isShared) return;
  const arr = curMap.stores || [];
  const target = index + direction;
  if (index < 0 || target < 0 || target >= arr.length) return;
  [arr[index], arr[target]] = [arr[target], arr[index]];
  saveStorage();
  openStoreListModal();
}

function moveStoreInRegisteredListToNo(storeId) {
  const curMap = getCurrentMap();
  if (curMap.isShared) return;
  const arr = curMap.stores || [];
  const index = arr.findIndex(s => s.id === storeId);
  if (index < 0) return;
  const input = prompt(`「${arr[index].name}」を何番目に移動しますか？\n現在: No.${index + 1} / 範囲: No.1～No.${arr.length}`, String(index + 1));
  if (input === null) return;
  const n = parseInt(input, 10);
  if (!Number.isInteger(n) || n < 1 || n > arr.length) {
    alert(`No.は1～${arr.length}の範囲で指定してください。`);
    return;
  }
  const [moved] = arr.splice(index, 1);
  arr.splice(n - 1, 0, moved);
  saveStorage();
  openStoreListModal();
}

function openStoreListModal() {
  const curMap = getCurrentMap();
  const content = document.getElementById('modal-content');
  document.getElementById('modal-overlay').style.display = 'flex';

  let listHtml = (curMap.stores || []).map((s, index) => `
    <div class="registered-store-row">
      <span class="registered-store-fav" style="color:${s.isFavorite ? '#111' : '#999'};" title="${s.isFavorite ? 'お気に入り' : '通常'}">${s.isFavorite ? '★' : '☆'}</span>
      <div style="min-width:0; cursor:pointer;" onclick="closeModal(); showStoreDetail('${s.id}');">
        <div class="registered-store-name">No.${index + 1}　${s.name}</div>
        <div class="registered-store-meta">${s.genre || '-'} / ${s.station || '-'}</div>
      </div>
      ${!curMap.isShared ? `
        <div style="display:flex; gap:2px; flex-shrink:0;">
          <button onclick="moveStoreInRegisteredList(${index},-1)" style="padding:2px 5px;font-size:9px;">↑</button>
          <button onclick="moveStoreInRegisteredList(${index},1)" style="padding:2px 5px;font-size:9px;">↓</button>
          <button onclick="moveStoreInRegisteredListToNo('${s.id}')" style="padding:2px 5px;font-size:9px;">No.</button>
        </div>
      ` : ''}
    </div>
  `).join('');

  content.innerHTML = `
    <div class="modal-header"><h3>登録店舗一覧 (${curMap.stores.length}件)</h3></div>
    ${curMap.isShared ? '' : '<div class="registered-store-legend">★＝お気に入り　☆＝通常</div>'}
    <div style="max-height:60vh; overflow-y:auto; margin-bottom:10px;">${listHtml || '<p style="color:#888;">登録店舗がありません</p>'}</div>
    <button onclick="closeModal()" class="btn-secondary" style="width:100%;">閉じる</button>
  `;
}
