// ==================== 共有コード管理 ====================
// 共有マップは「共有元を正本」とし、共有先は閲覧専用でリアルタイム同期する。
// 共有コード自体には有効期限を設けない。同じコードを複数人で利用できる。
function getShareSnapshot(mapObj) {
  if (!mapObj) return '';
  return JSON.stringify({
    name: mapObj.name || '',
    stores: mapObj.stores || [],
    areas: mapObj.areas || [],
    lists: mapObj.lists || [],
    areaLists: mapObj.areaLists || []
  });
}

function getShareCodeStatus(mapObj = getCurrentMap()) {
  if (!mapObj || mapObj.isShared) return { type:'none', text:'共有マップ' };
  const code = mapObj.shareCode || '';
  if (!code) return { type:'none', text:'未発行', code:'' };
  const dirty = !mapObj.shareSnapshot || getShareSnapshot(mapObj) !== mapObj.shareSnapshot;
  if (dirty) return { type:'syncing', text:'同期中', code };
  return { type:'ready', text:'発行済み / 更新なし', code };
}

function updateShareCodeStatus() {
  const cur = getCurrentMap();
  const st = getShareCodeStatus(cur);
  const menu = document.getElementById('menu-share-status');
  if (menu) {
    menu.className = `share-status-mini ${st.type}`;
    menu.textContent = st.type === 'ready'
      ? `🟢 ${st.text}：${st.code}`
      : st.type === 'syncing'
        ? `🟠 ${st.text}：${st.code}`
        : (cur && cur.isShared ? '🔵 共有マップ' : '⚪ 未発行');
  }
  const box = document.getElementById('share-code-status-box');
  const text = document.getElementById('share-code-status-text');
  const note = box ? box.querySelector('[data-share-status-note]') : null;
  if (!box || !text) return;
  box.className = `share-code-status-box ${st.type}`;
  if (st.type === 'ready') {
    text.textContent = '現在の状態：🟢 発行済み / 更新なし';
    if (note) note.innerHTML = `発行済みコード：<b>${st.code}</b><br>共有先へ自動反映中です。再発行は不要です。`;
  } else if (st.type === 'syncing') {
    text.textContent = '現在の状態：🟠 自動同期中';
    if (note) note.innerHTML = `共有コード：<b>${st.code}</b><br>変更内容を共有先へ自動反映しています。`;
  } else {
    text.textContent = '現在の状態：⚪ 未発行';
    if (note) note.textContent = 'まだ共有コードは発行されていません。';
  }
}

function getJapaneseFirebaseError(error, fallback = '処理に失敗しました。') {
  if (!error) return fallback;
  const code = error.code || '';
  const message = String(error.message || '');
  const map = {
    'PERMISSION_DENIED': 'Firebaseの権限設定により、この操作が拒否されました。Realtime Database の Security Rules を確認してください。',
    'permission_denied': 'Firebaseの権限設定により、この操作が拒否されました。Realtime Database の Security Rules を確認してください。',
    'auth/requires-recent-login': 'セキュリティ確認のため、いったんログインし直してからお試しください。',
    'auth/network-request-failed': '通信に失敗しました。ネットワーク接続を確認してください。',
    'NETWORK_ERROR': 'Firebaseとの通信に失敗しました。ネットワーク接続を確認してください。'
  };
  if (map[code]) return map[code];
  if (/PERMISSION_DENIED|permission denied/i.test(message)) return map.PERMISSION_DENIED;
  if (/network/i.test(message)) return map.NETWORK_ERROR;
  return message || fallback;
}

async function publishShareCode(mapObj, code) {
  const firebaseUser = auth.currentUser;
  if (!mapObj || !currentUser.uid || !firebaseUser || firebaseUser.uid !== currentUser.uid) {
    throw new Error('共有コードを発行するには、Firebaseにログインしている必要があります。');
  }
  const snapshot = getShareSnapshot(mapObj);
  const version = (mapObj.shareVersion || 0) + 1;
  const payload = {
    ownerUid: currentUser.uid,
    mapId: mapObj.id,
    name: mapObj.name || 'マイグルメマップ',
    stores: JSON.parse(JSON.stringify(mapObj.stores || [])),
    areas: JSON.parse(JSON.stringify(mapObj.areas || [])),
    lists: JSON.parse(JSON.stringify(mapObj.lists || [])),
    areaLists: JSON.parse(JSON.stringify(mapObj.areaLists || [])),
    version,
    snapshot,
    createdAt: mapObj.shareCreatedAt || firebase.database.ServerValue.TIMESTAMP,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  };
  await writeSharedMapDatabase(code, payload);
  try { await removeInvalidSharedCodeDatabase(code); } catch (e) { console.warn('無効コード記録の削除はスキップ:', e); }
  mapObj.shareCode = code;
  mapObj.shareSnapshot = snapshot;
  mapObj.shareVersion = version;
  mapObj.shareCreatedAt = mapObj.shareCreatedAt || Date.now();
  mapObj.shareInvalidated = false;
  mapObj.shareInvalidationReason = '';
  return payload;
}

async function readSharedCode(code) {
  const snapshot = await readSharedMapDatabase(code);
  if (snapshot.exists()) return { status: 'valid', data: snapshot.val() };
  const invalid = await readInvalidSharedCodeDatabase(code);
  if (invalid.exists()) return { status: 'invalid', data: invalid.val() };
  return { status: 'missing', data: null };
}

function stopSharedMapListener(mapId) {
  const listener = sharedMapListeners[mapId];
  if (!listener) return;
  try { stopListeningSharedMapDatabase(listener); } catch (e) { console.warn('共有同期解除警告:', e); }
  delete sharedMapListeners[mapId];
}

function startSharedMapListener(sharedMap) {
  if (!sharedMap || !sharedMap.isShared || !sharedMap.sourceShareCode) return;
  const code = sharedMap.sourceShareCode;
  if (sharedMapListeners[sharedMap.id]) return;
  const handler = (snapshot) => {
    if (!snapshot.exists()) return;
    const latest = snapshot.val() || {};
    const target = maps.find(m => m.id === sharedMap.id);
    if (!target) return;
    target.name = `${latest.name || '共有マップ'} (共有)`;
    target.stores = JSON.parse(JSON.stringify(latest.stores || []));
    target.areas = JSON.parse(JSON.stringify(latest.areas || []));
    target.lists = JSON.parse(JSON.stringify(latest.lists || []));
    target.areaLists = JSON.parse(JSON.stringify(latest.areaLists || []));
    target.shareVersion = latest.version || target.shareVersion || 1;
    target.sourceOwnerUid = latest.ownerUid || target.sourceOwnerUid || '';
    target.shareUpdatedAt = latest.updatedAt || Date.now();
    target.shareSnapshot = latest.snapshot || getShareSnapshot(latest);
    try {
      if (currentUser.uid) {
        localStorage.setItem(`gourmet_user_maps_${currentUser.uid}`, JSON.stringify(maps));
        localStorage.setItem(`gourmet_user_map_id_${currentUser.uid}`, currentMapId);
      }
    } catch (e) { console.warn('共有マップのローカル保存警告:', e); }
    if (currentMapId === target.id) {
      normalizeMapData();
      if (typeof renderCurrentMap === 'function') renderCurrentMap();
      updateShareCodeStatus();
    }
  };
  sharedMapListeners[sharedMap.id] = listenSharedMapDatabase(code, handler);
}

function startAllSharedMapListeners() {
  Object.values(sharedMapListeners).forEach(listener => {
    try { stopListeningSharedMapDatabase(listener); } catch (e) {}
  });
  sharedMapListeners = {};
  (maps || []).filter(m => m && m.isShared && m.sourceShareCode).forEach(startSharedMapListener);
}

