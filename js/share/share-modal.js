function exportCode() {
  toggleMenu();
  const curMap = getCurrentMap();
  if (!curMap || curMap.isShared) { alert('🔒 共有されたマップでは共有コードを変更できません。'); return; }
  if (!currentUser.loggedIn || !auth.currentUser) { alert('🔐 共有コードを発行するにはログインしてください。'); return; }
  const activeCode = curMap.shareCode || '';
  const content = document.getElementById('modal-content');
  document.getElementById('modal-overlay').style.display = 'flex';
  content.innerHTML = `
    <div class="modal-header"><h3>✨ 共有コードの設定・表示</h3><span style="cursor:pointer;font-size:16px;opacity:.6" onclick="closeModal()">✕</span></div>
    <p style="font-size:11.5px;color:#666;margin-bottom:10px;line-height:1.5;">
      このコードには<strong>有効期限がありません。</strong>同じコードを複数人へ渡して利用できます。<br>
      店舗・エリア・リストを登録・編集・削除すると、発行済みコードへ自動反映され、共有先もリアルタイムで更新されます。<br>
      共有元以外は閲覧のみで、共有データを自分のマップへ取り込む操作だけ可能です。
    </p>
    <div class="form-group"><label>共有コード（数字＋半角英字 6〜20文字）</label>
      <div class="share-code-row"><input type="text" id="custom-share-code" class="stylish-input" value="${activeCode}" minlength="6" maxlength="20" placeholder="例: gourmet2026"><button type="button" class="copy-code-btn" onclick="copyShareCode()">📋 コピー</button></div>
      <div id="share-code-error" class="error-msg"></div><div id="share-code-success" class="success-msg"></div>
    </div>
    <div id="share-code-status-box" class="share-code-status-box none" style="margin:8px 0;padding:8px;border-radius:8px;border:2px solid #aaa;">
      <div id="share-code-status-text" style="font-size:12px;font-weight:bold;">現在の状態：⚪ 未発行</div><div data-share-status-note style="font-size:10.5px;margin-top:3px;color:#666;"></div>
    </div>
    <div class="btn-group"><button onclick="saveCustomShareCode()">${activeCode ? 'コードを再発行・更新' : '共有コードを発行'}</button><button onclick="closeModal()" class="btn-secondary">閉じる</button></div>`;
  updateShareCodeStatus();
}

async function copyShareCode() {
  const input=document.getElementById('custom-share-code'), ok=document.getElementById('share-code-success'), err=document.getElementById('share-code-error');
  if(!input || !input.value.trim())return;
  try { if(navigator.clipboard&&window.isSecureContext) await navigator.clipboard.writeText(input.value.trim()); else {input.focus();input.select();document.execCommand('copy');input.setSelectionRange(input.value.length,input.value.length);} if(err)err.style.display='none'; if(ok){ok.textContent='✅ 共有コードをコピーしました。';ok.style.display='block';} }
  catch(e){if(err){err.textContent='⚠️ コピーできませんでした。手動でコピーしてください。';err.style.display='block';}}
}

async function saveCustomShareCode() {
  const curMap=getCurrentMap(), input=document.getElementById('custom-share-code'), err=document.getElementById('share-code-error'), ok=document.getElementById('share-code-success');
  if(!curMap||curMap.isShared||!input||!err||!ok)return;
  const newCode=input.value.trim(); err.style.display='none';ok.style.display='none';
  if(!currentUser.loggedIn||!currentUser.uid||!auth.currentUser){err.textContent='🔐 共有コードを発行するにはログインしてください。';err.style.display='block';return;}
  if(newCode.length<6||newCode.length>20||!/^[a-zA-Z0-9]+$/.test(newCode)||!/[a-zA-Z]/.test(newCode)||!/[0-9]/.test(newCode)){err.textContent='⚠️ 共有コードは数字と半角英字を組み合わせた6〜20文字です。';err.style.display='block';return;}
  const statusText=document.getElementById('share-code-status-text'), statusBox=document.getElementById('share-code-status-box'), note=statusBox?statusBox.querySelector('[data-share-status-note]'):null;
  if(statusText)statusText.textContent='現在の状態：🟠 発行・更新処理中…'; if(note)note.textContent='共有データをFirebaseへ反映しています。';
  try{
    if(curMap.shareCode&&curMap.shareCode!==newCode){
      const oldCode=curMap.shareCode; await removeSharedMapDatabase(oldCode);
      await writeInvalidSharedCodeDatabase(oldCode, {ownerUid:currentUser.uid,reason:'共有元で共有コードが変更されたため、このコードは利用できません。',replacedBy:newCode,invalidatedAt:firebase.database.ServerValue.TIMESTAMP});
      curMap.shareCode='';curMap.shareSnapshot='';
    }
    await publishShareCode(curMap,newCode);
    await saveStorage(false);
    input.value=curMap.shareCode; ok.textContent=`🎉 共有コード「${curMap.shareCode}」を発行・更新しました。以後の登録・編集・削除は自動共有されます。`;ok.style.display='block';
    updateShareCodeStatus();
  }catch(e){console.error('共有コード発行失敗:',e);err.textContent='⚠️ '+getJapaneseFirebaseError(e,'共有コードの発行に失敗しました。');err.style.display='block';}
}
