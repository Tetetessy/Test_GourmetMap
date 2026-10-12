/* 店舗・エリア処理の分離（第5段階） */

function generateListOptionsHtml(selectedId = '') {
      const curMap = getCurrentMap();
      let html = '<option value="">(選択なし)</option>';
      (curMap.lists || []).forEach(l => {
        const sel = (l.id === selectedId) ? 'selected' : '';
        html += `<option value="${l.id}" ${sel}>${l.name}</option>`;
      });
      return html;
    }

function addExistingListRow() {
      const container = document.getElementById('existing-list-container');
      const div = document.createElement('div');
      div.className = 'existing-list-row';
      div.style.cssText = 'display:flex; gap:4px; margin-bottom:4px;';
      div.innerHTML = `
        <select class="stylish-input existing-list-select scroll-select-10" size="10" style="flex:1;">
          ${generateListOptionsHtml()}
        </select>
        <button type="button" onclick="this.parentElement.remove()" style="padding:4px 8px; background:#dc3545; color:#fff;">✕</button>
      `;
      container.appendChild(div);
    }

function addNewListRow() {
      const container = document.getElementById('new-list-container');
      const div = document.createElement('div');
      div.className = 'new-list-row';
      div.style.cssText = 'display:flex; gap:4px; margin-bottom:4px;';
      div.innerHTML = `
        <input type="text" class="stylish-input new-list-input" placeholder="新規リスト名を入力" style="flex:1;">
        <button type="button" onclick="this.parentElement.remove()" style="padding:4px 8px; background:#dc3545; color:#fff;">✕</button>
      `;
      container.appendChild(div);
    }
