// 分割移行：リスト／検索関連処理
// このファイルは index.html より前に読み込まれるため、既存のグローバル関数をそのまま利用します。

function openAreaListModal(scrollTop = null, openListId = null) {
  toggleMenu();
  const curMap = getCurrentMap();
  const content = document.getElementById('modal-content');
  document.getElementById('modal-overlay').style.display = 'flex';
  const listsHtml = (curMap.areaLists || []).map((l, index) => {
    const areaIds = Array.isArray(l.areaIds) ? l.areaIds : [];
    const assigned = areaIds.map(id => curMap.areas.find(a => a.id === id)).filter(Boolean);
    const boxId = 'area-manage-list-' + l.id;
    const rows = assigned.map((a, i) => `
      <div class="area-list-row">
        <span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">🚩 <b>No.${i + 1}</b>　${a.name}</span>
        ${!curMap.isShared ? `<span class="area-list-row-actions">
          <button onclick="moveAreaInList('${l.id}','${a.id}',-1)" style="padding:2px 5px;font-size:9px;">↑</button>
          <button onclick="moveAreaInList('${l.id}','${a.id}',1)" style="padding:2px 5px;font-size:9px;">↓</button>
          <button onclick="moveAreaInListToNo('${l.id}','${a.id}')" style="padding:2px 5px;font-size:9px;">No.</button>
          <button onclick="removeAreaFromList('${l.id}','${a.id}')" style="padding:2px 5px;font-size:9px;background:#dc3545;">削除</button>
        </span>` : ''}
      </div>`).join('');
    return `
      <div class="area-list-manage-box area-manage-list-box ${openListId === l.id ? 'open' : ''}" id="${boxId}">
        <div class="list-manage-header area-manage-list-toggle" onclick="toggleAreaManageList('${boxId}')">
          <span style="font-size:12px;min-width:0;">▶ 📁 <b>No.${index + 1}　${l.name}</b> <small>(${assigned.length}件)</small></span>
          ${!curMap.isShared ? `<span class="list-manage-actions" onclick="event.stopPropagation()">
            <button onclick="moveAreaListByDirection('${l.id}',-1)" style="padding:2px 5px;font-size:9px;">↑</button>
            <button onclick="moveAreaListByDirection('${l.id}',1)" style="padding:2px 5px;font-size:9px;">↓</button>
            <button onclick="moveAreaListToNo('${l.id}')" style="padding:2px 6px;font-size:9px;">No.</button>
            <button onclick="editAreaListName('${l.id}')" style="padding:2px 6px;font-size:9px;background:#ff9f43;">✏️</button>
            <button onclick="deleteAreaList('${l.id}')" style="padding:2px 6px;font-size:9px;background:#dc3545;">削除</button>
          </span>` : ''}
        </div>
        <div class="area-manage-list-body">
          <div class="area-list-assigned">${rows || '<div style="font-size:10px;color:#888;">エリアは登録されていません。</div>'}</div>
          ${!curMap.isShared ? `
            <div style="display:flex;gap:4px;align-items:stretch;margin-top:6px;">
              <select id="area-add-select-${l.id}" class="stylish-input scroll-select-10" size="10" style="flex:1;min-width:0;">
                <option value="">追加するエリアを選択</option>
                ${curMap.areas.filter(a => !assigned.some(x => x.id === a.id)).map(a => `<option value="${a.id}">🚩 ${a.name}</option>`).join('')}
              </select>
              <button onclick="addAreaToList('${l.id}')" style="white-space:nowrap;padding:5px 8px;">追加</button>
            </div>` : ''}
        </div>
      </div>`;
  }).join('');
  content.innerHTML = `
    <div class="modal-header"><h3>🚩 エリア管理</h3></div>
    <p style="font-size:11px;color:#666;margin-bottom:8px;">エリア専用リスト：${curMap.areaLists.length}/50</p>
    ${!curMap.isShared ? `<button onclick="createAreaListPrompt()" style="width:100%;margin-bottom:10px;">＋ 新しいエリアリストを追加</button>` : ''}
    <div id="area-manage-scroll" class="panel-scroll-10">${listsHtml || '<p style="color:#888;font-size:11px;">エリアリストが登録されていません。</p>'}</div>
    <button onclick="closeModal()" class="btn-secondary" style="width:100%;margin-top:10px;">閉じる</button>`;
  const scroll = document.getElementById('area-manage-scroll');
  if (scroll && scrollTop !== null) scroll.scrollTop = scrollTop;
}

function toggleAreaManageList(boxId) { const box=document.getElementById(boxId); if(box) box.classList.toggle('open'); }

function createAreaListPrompt() {
  const curMap = getCurrentMap();
  if (curMap.isShared) return;
  if (!curMap.areaLists) curMap.areaLists = [];
  if (curMap.areaLists.length >= 50) { alert('⚠️ エリアリスト上限数（50個）に達しています。'); return; }
  const name = prompt('新しいエリアリスト名:');
  if (!name || !name.trim()) return;
  curMap.areaLists.push({id:'alst_' + Date.now(), name:name.trim(), areaIds:[]});
  saveStorage();
  openAreaListModal();
}

function moveAreaListByDirection(listId,direction){const c=getCurrentMap();if(c.isShared)return;const arr=c.areaLists||[];const i=arr.findIndex(l=>l.id===listId);const j=i+direction;if(i<0||j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];saveStorage();openAreaListModal();}

function moveAreaListToNo(listId) {
  const curMap=getCurrentMap(); if(curMap.isShared)return;
  const arr=curMap.areaLists||[]; const i=arr.findIndex(l=>l.id===listId); if(i<0)return;
  const input=prompt(`「${arr[i].name}」を何番目に移動しますか？\n現在: No.${i+1} / 範囲: No.1～No.${arr.length}`,String(i+1));
  if(input===null)return; const n=parseInt(input,10);
  if(!Number.isInteger(n)||n<1||n>arr.length){alert(`No.は1～${arr.length}の範囲で指定してください。`);return;}
  const [m]=arr.splice(i,1); arr.splice(n-1,0,m); saveStorage(); openAreaListModal();
}

function editAreaListName(listId){const c=getCurrentMap();if(c.isShared)return;const l=(c.areaLists||[]).find(x=>x.id===listId);if(!l)return;const n=prompt('エリアリスト名を編集:',l.name);if(n&&n.trim()){l.name=n.trim();saveStorage();openAreaListModal();}}

function deleteAreaList(listId){const c=getCurrentMap();if(c.isShared)return;if(!confirm('このエリアリストを削除しますか？'))return;c.areaLists=c.areaLists.filter(l=>l.id!==listId);c.areas.forEach(a=>{if(Array.isArray(a.listIds))a.listIds=a.listIds.filter(id=>id!==listId);});saveStorage();openAreaListModal();}

function moveAreaInList(listId, areaId, direction){const c=getCurrentMap();if(c.isShared)return;const l=(c.areaLists||[]).find(x=>x.id===listId);if(!l)return;if(!Array.isArray(l.areaIds))l.areaIds=[];const i=l.areaIds.indexOf(areaId);const j=i+direction;if(i<0||j<0||j>=l.areaIds.length)return;[l.areaIds[i],l.areaIds[j]]=[l.areaIds[j],l.areaIds[i]];saveStorage();openAreaListModal();}

function moveAreaInListToNo(listId, areaId){const c=getCurrentMap();if(c.isShared)return;const l=(c.areaLists||[]).find(x=>x.id===listId);if(!l)return;if(!Array.isArray(l.areaIds))l.areaIds=[];const i=l.areaIds.indexOf(areaId);if(i<0)return;const input=prompt(`「${(c.areas.find(a=>a.id===areaId)||{}).name||''}」を何番目に移動しますか？\n現在: No.${i+1} / 範囲: No.1～No.${l.areaIds.length}`,String(i+1));if(input===null)return;const n=parseInt(input,10);if(!Number.isInteger(n)||n<1||n>l.areaIds.length){alert(`No.は1～${l.areaIds.length}の範囲で指定してください。`);return;}const [m]=l.areaIds.splice(i,1);l.areaIds.splice(n-1,0,m);saveStorage();openAreaListModal();}

function addAreaToList(listId) {
  const c=getCurrentMap();
  if(c.isShared)return;
  const l=(c.areaLists||[]).find(x=>x.id===listId); if(!l)return;
  const sel=document.getElementById('area-add-select-'+listId); const areaId=sel ? sel.value : '';
  if(!areaId){alert('追加するエリアを選択してください。');return;}
  if(!Array.isArray(l.areaIds))l.areaIds=[];
  if(l.areaIds.includes(areaId)){alert('このエリアはすでに登録されています。');return;}
  l.areaIds.push(areaId);
  const a=c.areas.find(x=>x.id===areaId);
  if(a){if(!Array.isArray(a.listIds))a.listIds=[];if(!a.listIds.includes(listId))a.listIds.push(listId);}
  const scroll=document.getElementById('area-manage-scroll'); const top=scroll?scroll.scrollTop:null; saveStorage(); openAreaListModal(top,listId);
}

function removeAreaFromList(listId,areaId){const c=getCurrentMap();if(c.isShared)return;const l=(c.areaLists||[]).find(x=>x.id===listId);if(!l)return;l.areaIds=(l.areaIds||[]).filter(id=>id!==areaId);const a=c.areas.find(x=>x.id===areaId);if(a&&Array.isArray(a.listIds))a.listIds=a.listIds.filter(id=>id!==listId);const scroll=document.getElementById('area-manage-scroll'); const top=scroll?scroll.scrollTop:null; saveStorage();openAreaListModal(top,listId);}
