/* 店舗・エリア処理の分離（第5段階） */

function startStoreRegistration() {
      const curMap = getCurrentMap();
      if (curMap.isShared) {
        alert('🔒 共有されたマップのため、店舗登録はできません。');
        return;
      }
      if (tempPinLocation) {
        openStoreRegisterModalFromPin();
        return;
      }
      pendingRegistrationType = 'store';
      alert('店舗を登録したい場所を地図上でタップしてください。');
    }

function openStoreRegisterModalFromPin(storeToEdit = null) {
      const curMap = getCurrentMap();

      if (curMap.isShared) {
        alert('🔒 共有されたマップのため、編集・登録操作は禁止されています。');
        return;
      }

      if (!storeToEdit && !tempPinLocation) {
        alert('先に地図上の登録したい場所をタップしてピンを立ててください。');
        return;
      }
      if (!storeToEdit && curMap.stores.length >= 200) {
        alert('⚠️ 1つのマップに登録できる店舗は上限200件までです。');
        return;
      }

      currentEditingImages = storeToEdit ? [...(storeToEdit.images || [])] : [];
      const isEdit = !!storeToEdit;
      const isFav = isEdit ? !!storeToEdit.isFavorite : false;
      
      let selectedListIds = isEdit ? (storeToEdit.listIds || (storeToEdit.listId ? [storeToEdit.listId] : [])) : [];

      const content = document.getElementById('modal-content');
      document.getElementById('modal-overlay').style.display = 'flex';
      content.classList.add('store-register-modal-content');

      const firstSelectedId = selectedListIds.length > 0 ? selectedListIds[0] : '';
      const additionalSelectedIds = selectedListIds.slice(1);

      content.innerHTML = `
        <div class="store-register-sticky-header">
          <div class="modal-header" style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
            <div class="store-register-title-wrap">
              <h3>${isEdit ? '✏️ 店舗情報の編集' : '📍 店舗情報の登録'}</h3>
              <div class="store-register-limit-text">リスト登録上限数: ${curMap.lists ? curMap.lists.length : 0}/50</div>
            </div>
            <div class="store-register-header-actions">
              <button type="button" onclick="saveStoreData('${isEdit ? storeToEdit.id : ''}')">${isEdit ? '更新保存' : '登録保存'}</button>
              <button type="button" onclick="closeModal()" class="btn-secondary">キャンセル</button>
            </div>
          </div>
          <div class="store-register-top-fav">
            <button type="button" id="reg-fav-btn" onclick="toggleFavBtn()" style="background:${isFav ? '#ff6b6b' : '#6c757d'}; color:#fff; padding:6px 12px; border:none; border-radius:var(--radius); font-weight:bold; cursor:pointer;">
              ${isFav ? '⭐ お気に入り（登録済み）' : '☆ お気に入りに追加'}
            </button>
            <input type="hidden" id="reg-store-fav" value="${isFav}">
          </div>
        </div>

        <div class="form-group">
          <label>リスト登録 (既存リストから追加)</label>
          <div id="existing-list-container">
            <div id="reg-store-list-tags" class="tag-grid">${renderListChoiceTags(selectedListIds)}</div>
          </div>
        </div>

        <div class="form-group">
          <label>新規リストを作成して追加</label>
          <div id="new-list-container">
            <div class="new-list-row" style="display:flex; gap:4px; margin-bottom:4px;">
              <input type="text" class="stylish-input new-list-input" placeholder="新規リスト名を入力" style="flex:1;">
              <button type="button" onclick="addNewListRow()" style="padding:4px 10px; font-weight:bold;">＋</button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>画像添付 (最大5枚 / .jpg, .png)</label>
          <input type="file" id="reg-store-file" accept="image/jpeg, image/png" multiple onchange="handleImageUploadStrict(event)">
          <div id="image-preview-container" class="image-preview-box"></div>
        </div>

        <div class="form-group">
          <label>店舗名*</label>
          <input type="text" id="reg-store-name" class="stylish-input" value="${isEdit ? storeToEdit.name : ''}" placeholder="">
        </div>

        <div class="form-group">
          <label>形式（複数選択可）</label>
          <div id="reg-store-form-tags" class="tag-grid">${renderChoiceTags('reg-form', FORM_OPTIONS, isEdit ? getStoreForms(storeToEdit) : [])}</div>
        </div>

        <div class="form-group">
          <label>ジャンル（複数選択可）</label>
          <div id="reg-store-genre-tags" class="tag-grid">${renderChoiceTags('reg-genre', GENRE_OPTIONS, isEdit ? getStoreGenres(storeToEdit) : [])}</div>
        </div>

        <div class="form-group">
          <label>予算</label>
          <select id="reg-store-budget" class="stylish-input">
            <option value="">選択してください</option>
            ${BUDGET_OPTIONS.map(b => `<option ${isEdit && storeToEdit.budget === b ? 'selected' : ''}>${b}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label>オプション（複数選択可）</label>
          ${renderStoreOptionChecks(isEdit ? getStoreOptions(storeToEdit) : [], 'reg-store-option')}
        </div>

        <div class="form-group">
          <label>店舗ピンの形状</label>
          <div class="store-pin-choice-grid">
            ${STORE_PIN_SHAPES.map(sh => `
              <button type="button" class="store-pin-choice ${(isEdit ? (storeToEdit.pinShape || 'heart') : 'heart') === sh.id ? 'selected' : ''}" onclick="selectStorePinShape('${sh.id}')" data-pin-shape="${sh.id}">
                <div class="store-custom-pin store-pin-preview ${sh.id === 'double-circle' ? 'store-pin-double-circle' : 'store-pin-' + sh.id}" style="background:${STORE_PIN_COLORS[0].bg};"><span class="store-pin-symbol">${sh.icon}</span></div>
                ${sh.label}
              </button>
            `).join('')}
          </div>
          <input type="hidden" id="reg-store-pin-shape" value="${isEdit ? (storeToEdit.pinShape || 'heart') : 'heart'}">
        </div>

        <div class="form-group">
          <label>店舗ピンの色味 (8段階)</label>
          <div class="color-picker-grid">
            ${STORE_PIN_COLORS.map(c => `
              <button type="button" class="color-btn" style="background:${c.bg}; border:${(isEdit ? (storeToEdit.pinColor || 'red') : 'red') === c.id ? '3px solid #000' : '2px solid #fff'};" onclick="selectStorePinColor('${c.id}')" title="${c.label}"></button>
            `).join('')}
          </div>
          <input type="hidden" id="reg-store-pin-color" value="${isEdit ? (storeToEdit.pinColor || 'red') : 'red'}">
        </div>

        <div class="form-group">
          <label>コスパ</label>
          <div class="range-control-row">
            <span class="range-label-left">[低]</span>
            <input type="range" id="reg-store-cospa" class="range-slider" min="1" max="5" step="1" value="${isEdit && storeToEdit.cospa ? storeToEdit.cospa : 3}">
            <span class="range-label-right">[高&lt;良&gt;]</span>
          </div>
        </div>

        <div class="form-group">
          <label>キャパ</label>
          <div class="range-control-row">
            <span class="range-label-left">[少人数]</span>
            <input type="range" id="reg-store-capa" class="range-slider" min="1" max="5" step="1" value="${isEdit && storeToEdit.capa ? storeToEdit.capa : 3}">
            <span class="range-label-right">[大人数向け]</span>
          </div>
        </div>

        <div class="form-group">
          <label>雰囲気</label>
          <div class="range-control-row">
            <span class="range-label-left">[落ち着いた]</span>
            <input type="range" id="reg-store-mood" class="range-slider" min="1" max="5" step="1" value="${isEdit && storeToEdit.mood ? storeToEdit.mood : 3}">
            <span class="range-label-right">[にぎやか]</span>
          </div>
        </div>

        <div class="form-group">
          <label>最寄り駅</label>
          <input type="text" id="reg-store-station" class="stylish-input" value="${isEdit ? (storeToEdit.station || '') : ''}" placeholder="例：横浜駅 徒歩5分">
        </div>

        <div class="form-group">
          <label>連絡先</label>
          <input type="text" id="reg-store-contact" class="stylish-input" value="${isEdit ? (storeToEdit.contact || '-') : '-'}">
        </div>

        <div class="form-group">
          <label>予約対応</label>
          <input type="text" id="reg-store-reserve" class="stylish-input" value="${isEdit ? (storeToEdit.reserve || '-') : '-'}">
        </div>

        <div class="form-group">
          <label>公式サイト</label>
          <input type="text" id="reg-store-official" class="stylish-input" value="${isEdit ? (storeToEdit.official || '-') : '-'}">
        </div>

        <div class="form-group">
          <label>食べログ</label>
          <input type="text" id="reg-store-tabelog" class="stylish-input" value="${isEdit ? (storeToEdit.tabelog || '-') : '-'}">
        </div>

        <div class="form-group">
          <label>ホットペッパー</label>
          <input type="text" id="reg-store-hotpepper" class="stylish-input" value="${isEdit ? (storeToEdit.hotpepper || '-') : '-'}">
        </div>

        <div class="form-group">
          <label>その他</label>
          <input type="text" id="reg-store-other" class="stylish-input" value="${isEdit ? (storeToEdit.other || '-') : '-'}">
        </div>

        <div class="form-group">
          <label>備考</label>
          <textarea id="reg-store-memo" class="stylish-input" rows="4" placeholder="">${isEdit ? (storeToEdit.memo || '') : ''}</textarea>
        </div>

      `;
      renderImagePreviews();
    }

function selectStorePinShape(shapeId) {
      const input = document.getElementById('reg-store-pin-shape');
      if (!input) return;
      input.value = shapeId;
      document.querySelectorAll('.store-pin-choice').forEach(btn => btn.classList.toggle('selected', btn.dataset.pinShape === shapeId));
    }

function selectStorePinColor(colorId) {
      const input = document.getElementById('reg-store-pin-color');
      if (!input) return;
      input.value = colorId;
      const colors = STORE_PIN_COLORS;
      document.querySelectorAll('#modal-content .color-btn').forEach(btn => {
        const bg = btn.getAttribute('style') || '';
        // selection is refreshed by rebuilding the modal on save/edit; keep the chosen color in the hidden field.
      });
      // Visually mark the chosen color without relying on the gradient string.
      document.querySelectorAll('#modal-content .color-btn').forEach((btn, i) => {
        if (i < colors.length) btn.style.border = `2px solid #fff`;
      });
      const idx = colors.findIndex(c => c.id === colorId);
      if (idx >= 0) document.querySelectorAll('#modal-content .color-btn')[idx].style.border = '3px solid #000';
    }

function changeStorePin(storeId, key, value) {
      const curMap = getCurrentMap();
      if (curMap.isShared) return;
      const store = curMap.stores.find(s => s.id === storeId);
      if (!store) return;
      if (key === 'pinShape' && !STORE_PIN_SHAPES.some(x => x.id === value)) return;
      if (key === 'pinColor' && !STORE_PIN_COLORS.some(x => x.id === value)) return;
      store[key] = value;
      saveStorage();
      renderCurrentMap();
      showStoreDetail(storeId);
    }

function toggleFavBtn() {
      const hiddenInput = document.getElementById('reg-store-fav');
      const btn = document.getElementById('reg-fav-btn');
      const current = hiddenInput.value === 'true';
      hiddenInput.value = (!current).toString();
      btn.style.background = !current ? '#ff6b6b' : '#6c757d';
      btn.innerText = !current ? '⭐ お気に入り（登録済み）' : '☆ お気に入りに追加';
    }

function handleImageUploadStrict(e) {
      const files = Array.from(e.target.files);
      for (let file of files) {
        if (currentEditingImages.length >= 5) {
          alert('写真は最大5枚までです。');
          break;
        }
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
          alert('JPGまたはPNG形式の画像のみアップロード可能です。');
          continue;
        }
        const reader = new FileReader();
        reader.onload = function(evt) {
          if (currentEditingImages.length < 5) {
            currentEditingImages.push(evt.target.result);
            renderImagePreviews();
          }
        };
        reader.readAsDataURL(file);
      }
    }

function renderImagePreviews() {
      const box = document.getElementById('image-preview-container');
      if (!box) return;
      box.innerHTML = currentEditingImages.map((img, idx) => `
        <div class="preview-thumb">
          <img src="${img}">
          <button class="del-btn" onclick="removeImage(${idx})">✕</button>
        </div>
      `).join('');
    }

function removeImage(idx) {
      currentEditingImages.splice(idx, 1);
      renderImagePreviews();
    }

function saveStoreData(editStoreId = '') {
      const curMap = getCurrentMap();
      if (curMap.isShared) {
        alert('🔒 共有されたマップのため保存できません。');
        return;
      }

      const name = document.getElementById('reg-store-name').value.trim();
      if (!name) {
        alert('店舗名を入力してください。');
        return;
      }
      if (!curMap.lists) curMap.lists = [];

      const selectedListIds = Array.from(document.querySelectorAll('.reg-list-tag.selected')).map(el => el.dataset.value);

      const newListInputs = document.querySelectorAll('.new-list-input');
      newListInputs.forEach(input => {
        const val = input.value.trim();
        if (val) {
          if (curMap.lists.length < 50) {
            const newList = { id: 'lst_' + Date.now() + '_' + Math.floor(Math.random()*1000), name: val };
            curMap.lists.push(newList);
            selectedListIds.push(newList.id);
          }
        }
      });

      const storeData = {
        name: name,
        isFavorite: document.getElementById('reg-store-fav').value === 'true',
        listIds: selectedListIds,
        images: [...currentEditingImages],
        forms: getSelectedTagValues('reg-form'),
        genres: getSelectedTagValues('reg-genre'),
        form: getSelectedTagValues('reg-form')[0] || '',
        genre: getSelectedTagValues('reg-genre')[0] || '',
        budget: document.getElementById('reg-store-budget').value,
        options: Array.from(document.querySelectorAll('.reg-store-option:checked')).map(el => el.value),
        pinShape: document.getElementById('reg-store-pin-shape').value || 'heart',
        pinColor: document.getElementById('reg-store-pin-color').value || 'red',
        cospa: parseInt(document.getElementById('reg-store-cospa').value, 10),
        capa: parseInt(document.getElementById('reg-store-capa').value, 10),
        mood: parseInt(document.getElementById('reg-store-mood').value, 10),
        station: document.getElementById('reg-store-station').value.trim(),
        contact: document.getElementById('reg-store-contact').value.trim(),
        reserve: document.getElementById('reg-store-reserve').value.trim(),
        official: document.getElementById('reg-store-official').value.trim(),
        tabelog: document.getElementById('reg-store-tabelog').value.trim(),
        hotpepper: document.getElementById('reg-store-hotpepper').value.trim(),
        other: document.getElementById('reg-store-other').value.trim(),
        memo: document.getElementById('reg-store-memo').value
      };

      if (editStoreId) {
        const target = curMap.stores.find(s => s.id === editStoreId);
        if (target) Object.assign(target, storeData);
        saveStorage();
        closeModal();
        showStoreDetail(editStoreId);
      } else {
        const newStore = {
          id: 'str_' + Date.now(),
          lat: tempPinLocation.lat,
          lng: tempPinLocation.lng,
          ...storeData
        };
        curMap.stores.push(newStore);
        if (tempMarker) { map.removeLayer(tempMarker); tempMarker = null; }
        tempPinLocation = null;
        saveStorage();
        closeModal();
        showStoreDetail(newStore.id);
      }
    }
