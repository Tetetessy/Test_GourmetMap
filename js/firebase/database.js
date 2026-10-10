// ============================================================
// Gourmet Map - Firebase Database Access
// Realtime Database へのアクセスを集約する層
// ============================================================

// パス生成
function getUserDatabaseRef(uid) {
  return database.ref(`users/${uid}`);
}

function getSharedMapDatabaseRef(code) {
  return database.ref(`sharedMaps/${code}`);
}

function getInvalidSharedCodeDatabaseRef(code) {
  return database.ref(`invalidSharedCodes/${code}`);
}

// ユーザーデータ
function readUserDatabase(uid) {
  return getUserDatabaseRef(uid).once('value');
}

function writeUserDatabase(uid, payload) {
  return getUserDatabaseRef(uid).set(payload);
}

// 共有マップ
function readSharedMapDatabase(code) {
  return getSharedMapDatabaseRef(code).once('value');
}

function writeSharedMapDatabase(code, payload) {
  return getSharedMapDatabaseRef(code).set(payload);
}

function removeSharedMapDatabase(code) {
  return getSharedMapDatabaseRef(code).remove();
}

function listenSharedMapDatabase(code, handler) {
  const ref = getSharedMapDatabaseRef(code);
  ref.on('value', handler);
  return { ref, handler };
}

function stopListeningSharedMapDatabase(listener) {
  if (!listener || !listener.ref || !listener.handler) return;
  listener.ref.off('value', listener.handler);
}

// 無効化済み共有コード
function readInvalidSharedCodeDatabase(code) {
  return getInvalidSharedCodeDatabaseRef(code).once('value');
}

function writeInvalidSharedCodeDatabase(code, payload) {
  return getInvalidSharedCodeDatabaseRef(code).set(payload);
}

function removeInvalidSharedCodeDatabase(code) {
  return getInvalidSharedCodeDatabaseRef(code).remove();
}
