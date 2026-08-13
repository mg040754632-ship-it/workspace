import { getAllClothes, addCloth } from '../lib/db.js';
import { CATEGORIES } from '../lib/categories.js';
import { openSheet, showToast } from '../lib/ui.js';
import { removeBgToWhite, blobToDataURL } from '../lib/removeBg.js';
import { openMatchPage } from './match.js';

export async function renderProfile(container, { openMatch } = {}) {
  container.innerHTML = `
    <div class="profile-page">
      <div class="profile-head">
        <div class="profile-avatar">🎀</div>
        <div>
          <div class="profile-name">Kitty 的衣橱</div>
          <div class="profile-sub" id="wardrobeSub">共 0 件甜甜单品 🍰</div>
        </div>
      </div>

      <div class="action-grid">
        <div class="action-box action-upload" id="actUpload">
          <div class="ab-icon">📤</div>
          <div class="ab-name">上传衣物</div>
          <div class="ab-desc">拍照/选图 · AI 抠白底</div>
        </div>
        <div class="action-box action-match" id="actMatch">
          <div class="ab-icon">🧩</div>
          <div class="ab-name">搭配衣物</div>
          <div class="ab-desc">拖拽拼搭 · 存四季</div>
        </div>
      </div>

      <div class="wardrobe-stats">
        <div class="section-label">我的服饰分类</div>
        <div class="cat-row" id="catRow"></div>
      </div>
    </div>
  `;

  await refreshStats(container);

  container.querySelector('#actUpload').addEventListener('click', () => openUploadSheet(container));
  container.querySelector('#actMatch').addEventListener('click', () => openMatch && openMatch());

  await renderCatRow(container);
}

async function refreshStats(container) {
  const all = await getAllClothes();
  container.querySelector('#wardrobeSub').textContent = `共 ${all.length} 件单品`;
}

async function renderCatRow(container) {
  const all = await getAllClothes();
  const row = container.querySelector('#catRow');
  row.innerHTML = CATEGORIES.map(c => {
    const n = all.filter(x => x.cat === c.id).length;
    return `<div class="cat-chip"><span>${c.icon}</span>${c.name}<span class="c-count">${n}</span></div>`;
  }).join('');
}

// 上传衣物 sheet
function openUploadSheet(container) {
  const sheet = openSheet('上传衣物', `
    <input type="file" accept="image/*" id="fileInput" style="display:none" />
    <button class="btn" id="pickBtn">从相册选择图片</button>
    <div class="crop-preview" id="preview" style="margin-top:12px">
      <span style="color:var(--text-soft);font-size:13px">选择后会自动抠出衣服并换白底</span>
    </div>
    <div class="section-label" style="margin-top:16px">选择服饰分类</div>
    <div class="cat-grid" id="catGrid">
      ${CATEGORIES.map((c,i)=>`<div class="cat-cell ${i===0?'sel':''}" data-cat="${c.id}"><span class="cc-icon">${c.icon}</span><span class="cc-name">${c.name}</span></div>`).join('')}
    </div>
    <button class="btn" id="saveBtn" disabled>保存到衣橱</button>
  `, { onMount: (root, { close }) => {
    const fileInput = root.querySelector('#fileInput');
    const pickBtn = root.querySelector('#pickBtn');
    const preview = root.querySelector('#preview');
    const saveBtn = root.querySelector('#saveBtn');
    const catGrid = root.querySelector('#catGrid');
    let curCat = CATEGORIES[0].id;
    let resultBlob = null;

    catGrid.querySelectorAll('.cat-cell').forEach(el => {
      el.addEventListener('click', () => {
        catGrid.querySelectorAll('.cat-cell').forEach(x=>x.classList.remove('sel'));
        el.classList.add('sel'); curCat = el.dataset.cat;
      });
    });

    pickBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;
      preview.innerHTML = '<span style="color:var(--text-soft);font-size:13px">处理中…</span>';
      try {
        const blob = await removeBgToWhite(file, (msg)=>{ preview.innerHTML = `<span style="color:var(--text-soft);font-size:13px">${msg}</span>`; });
        resultBlob = blob;
        const dataUrl = await blobToDataURL(blob);
        preview.innerHTML = `<img src="${dataUrl}" alt="白底衣物" />`;
        saveBtn.disabled = false;
      } catch (e) {
        preview.innerHTML = '<span style="color:#e00;font-size:13px">处理失败，请换张图片</span>';
      }
    });

    saveBtn.addEventListener('click', async () => {
      if (!resultBlob) return;
      const dataUrl = await blobToDataURL(resultBlob);
      await addCloth({
        id: 'cl_' + Date.now(),
        cat: curCat,
        name: CATEGORIES.find(c=>c.id===curCat).name,
        blobUrl: dataUrl,
        createdAt: Date.now(),
      });
      showToast('已加入「' + CATEGORIES.find(c=>c.id===curCat).name + '」✓');
      close();
      await refreshStats(container);
      await renderCatRow(container);
    });
  }});
}
