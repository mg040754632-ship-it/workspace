import { CATEGORIES, SEASONS } from '../lib/categories.js';
import { getClothesByCat, addOutfit, getAllClothes } from '../lib/db.js';
import { showToast } from '../lib/ui.js';

// 搭配衣物全屏页
// 左上角小圆点击 -> 弹出服饰分类浮层（覆盖画布下方 2/3 区域，不完全盖住画布）
// 右下角浮完成键
// 底部添加键 -> 保存当前画布到选定季节
export async function openMatchPage(mountRoot, { onClose }) {
  const page = document.createElement('div');
  page.className = 'match-page';
  page.innerHTML = `
    <div class="match-head">
      <button class="match-close" id="mOpen" title="服饰分类">○</button>
      <div class="mh-title">搭配衣物</div>
    </div>

    <div class="match-canvas" id="mCanvas"></div>

    <!-- 服饰分类浮层：默认隐藏，点击左上角小圆才弹出（下 2/3 区） -->
    <div class="match-bottom hidden" id="matchBottom">
      <div class="cat-side" id="catSide">
        ${CATEGORIES.map((c,i)=>`
          <div class="cat-side-item ${i===0?'active':''}" data-cat="${c.id}">
            <span class="csi-icon">${c.icon}</span><span>${c.name}</span>
          </div>`).join('')}
      </div>
      <div class="item-tray" id="itemTray"></div>
    </div>

    <div class="match-bar">
      <div class="season-pick" id="seasonPick">
        ${SEASONS.map((s,i)=>`<button data-season="${s.id}" class="${i===0?'sel':''}">${s.icon}${s.name}</button>`).join('')}
      </div>
      <button class="btn" id="mAdd">添加</button>
    </div>

    <button class="fab-done" id="mDone" title="完成">✓<span>完成</span></button>
  `;
  mountRoot.appendChild(page);

  const canvas = page.querySelector('#mCanvas');
  const bottom = page.querySelector('#matchBottom');
  const tray = page.querySelector('#itemTray');
  const catSide = page.querySelector('#catSide');
  let curCat = CATEGORIES[0].id;
  let curSeason = SEASONS[0].id;

  async function loadTray(cat) {
    const items = await getClothesByCat(cat);
    if (!items.length) {
      tray.innerHTML = `<div class="ti-empty">该分类暂无衣物<br/>去「上传衣物」添加</div>`;
      return;
    }
    tray.innerHTML = items.map(it => `
      <div class="tray-item" data-id="${it.id}" draggable="false">
        <img src="${it.blobUrl}" alt="${it.name||''}" />
      </div>`).join('');
    tray.querySelectorAll('.tray-item').forEach(el => {
      el.addEventListener('click', () => addToCanvas(el.dataset.id, el.querySelector('img').src));
    });
  }

  catSide.querySelectorAll('.cat-side-item').forEach(el => {
    el.addEventListener('click', () => {
      catSide.querySelectorAll('.cat-side-item').forEach(x=>x.classList.remove('active'));
      el.classList.add('active');
      curCat = el.dataset.cat;
      loadTray(curCat);
    });
  });

  // 左上角小圆 -> 弹出/收起分类浮层
  page.querySelector('#mOpen').addEventListener('click', async () => {
    const opening = bottom.classList.contains('hidden');
    bottom.classList.toggle('hidden');
    if (opening) await loadTray(curCat);
  });

  function addToCanvas(id, src) {
    const img = document.createElement('img');
    img.className = 'draggable-item';
    img.src = src;
    img.dataset.id = id;
    img.style.left = (20 + Math.random()*40) + 'px';
    img.style.top = (20 + Math.random()*40) + 'px';
    canvas.appendChild(img);
    makeDraggable(img, canvas);
  }

  function makeDraggable(el, parent) {
    let sx, sy, ox, oy, dragging = false;
    const down = (e) => {
      dragging = true;
      const p = point(e);
      sx = p.x; sy = p.y;
      ox = parseFloat(el.style.left)||0; oy = parseFloat(el.style.top)||0;
      el.style.zIndex = 10;
      e.preventDefault();
    };
    const move = (e) => {
      if (!dragging) return;
      const p = point(e);
      let nx = ox + (p.x - sx);
      let ny = oy + (p.y - sy);
      nx = Math.max(-20, Math.min(parent.clientWidth-40, nx));
      ny = Math.max(-20, Math.min(parent.clientHeight-40, ny));
      el.style.left = nx + 'px';
      el.style.top = ny + 'px';
    };
    const up = () => { dragging = false; el.style.zIndex=''; };
    const point = (e) => {
      if (e.touches && e.touches[0]) return { x:e.touches[0].clientX, y:e.touches[0].clientY };
      return { x:e.clientX, y:e.clientY };
    };
    el.addEventListener('mousedown', down);
    el.addEventListener('touchstart', down, {passive:false});
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, {passive:false});
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
  }

  page.querySelector('#seasonPick').querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => {
      page.querySelectorAll('#seasonPick button').forEach(x=>x.classList.remove('sel'));
      b.classList.add('sel');
      curSeason = b.dataset.season;
    });
  });

  page.querySelector('#mAdd').addEventListener('click', async () => {
    const imgs = canvas.querySelectorAll('.draggable-item');
    if (!imgs.length) { showToast('先放点衣服到画布上吧'); return; }
    const dataUrl = await snapshotCanvas(canvas);
    const rec = {
      id: 'of_' + Date.now(),
      season: curSeason,
      title: SEASONS.find(s=>s.id===curSeason).name + '季穿搭',
      dataUrl,
      items: Array.from(imgs).map(i=>i.dataset.id),
      createdAt: Date.now(),
      useCount: 0,
    };
    await addOutfit(rec);
    showToast('已添加到' + SEASONS.find(s=>s.id===curSeason).name + '季 ✓');
    canvas.innerHTML = '';
  });

  page.querySelector('#mDone').addEventListener('click', () => close());

  function close() {
    page.remove();
    onClose && onClose();
  }

  await loadTray(curCat);
}

async function snapshotCanvas(canvasEl) {
  const w = canvasEl.clientWidth, h = canvasEl.clientHeight;
  const out = document.createElement('canvas');
  out.width = w; out.height = h;
  const ctx = out.getContext('2d');
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,w,h);
  const items = Array.from(canvasEl.querySelectorAll('.draggable-item'));
  for (const it of items) {
    const img = new Image();
    img.src = it.src;
    await new Promise(r => { img.onload = r; img.onerror = r; });
    const x = parseFloat(it.style.left)||0, y = parseFloat(it.style.top)||0;
    const dw = it.clientWidth || 84, dh = it.clientHeight || 84;
    try { ctx.drawImage(img, x, y, dw, dh); } catch(e){}
  }
  return out.toDataURL('image/png');
}