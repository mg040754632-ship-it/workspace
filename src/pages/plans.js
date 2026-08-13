import { getAllOutfits, getOutfitsBySeason, bumpOutfitUse, lsGet, lsSet } from '../lib/db.js';
import { SEASONS } from '../lib/categories.js';

export async function renderPlans(container, { goSeason } = {}) {
  container.innerHTML = `
    <div class="plans-page">
      <div class="section-label">最常穿的穿搭</div>
      <div class="fav-box" id="favBox">
        <div class="fav-empty" id="favEmpty"><div class="big">👗</div>还没有最常穿的穿搭<br/>去「个人主页→搭配衣物」创建吧</div>
      </div>

      <div class="section-label">四季穿搭</div>
      <div class="season-grid">
        ${SEASONS.map(s => `
          <div class="season-box ${s.cls}" data-season="${s.id}">
            <div class="season-name">${s.label}</div>
            <div class="season-count" data-count="${s.id}">0 套</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // 计算每个季节数量
  const all = await getAllOutfits();
  SEASONS.forEach(s => {
    const n = all.filter(o => o.season === s.id).length;
    container.querySelector(`[data-count="${s.id}"]`).textContent = `${n} 套`;
  });

  // 最常穿：每周更新，取 useCount 最高者
  const fav = pickWeeklyFav(all);
  if (fav) {
    const box = container.querySelector('#favBox');
    box.innerHTML = `<span class="fav-tag">本周最爱</span><img src="${fav.dataUrl}" alt="${fav.title||''}" />`;
    box.addEventListener('click', () => bumpOutfitUse(fav.id));
  }

  // 季节点击
  container.querySelectorAll('.season-box').forEach(el => {
    el.addEventListener('click', () => goSeason && goSeason(el.dataset.season));
  });
}

// 每周更新：周一为界缓存选中的最常穿 id
function pickWeeklyFav(all) {
  if (!all.length) return null;
  const now = new Date();
  const week = getWeekKey(now);
  const cached = lsGet('weekly_fav', {});
  if (cached.week === week && cached.id) {
    const found = all.find(o => o.id === cached.id);
    if (found) return found;
  }
  const top = [...all].sort((a,b) => (b.useCount||0)-(a.useCount||0))[0];
  lsSet('weekly_fav', { week, id: top.id });
  return top;
}

function getWeekKey(d) {
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

// 季节列表页（独立于 plans 主视图，由 main 切换）
export async function renderSeasonList(container, seasonId, { goBack, onOpenOutfit }) {
  const season = SEASONS.find(s => s.id === seasonId);
  container.innerHTML = `
    <div class="app-header" style="position:sticky">
      <button class="match-close" id="backBtn" style="position:static;transform:none;margin-right:10px">‹</button>
      <h1 class="app-title">${season.label}季穿搭</h1>
    </div>
    <div class="season-list" id="seasonList"></div>
  `;
  const list = container.querySelector('#seasonList');
  const items = await getOutfitsBySeason(seasonId);
  if (!items.length) {
    list.innerHTML = `<div class="empty-tip">还没有${season.label}季穿搭<br/>去「个人主页→搭配衣物」添加吧</div>`;
  } else {
    list.innerHTML = items.map(o => `
      <div class="plan-card" data-id="${o.id}">
        <img src="${o.dataUrl}" alt="" />
        <div class="pc-body">${escapeHtml(o.title || (season.label+'季穿搭'))} · ♥${(o.useCount||0)}</div>
      </div>
    `).join('');
    list.querySelectorAll('.plan-card').forEach(el => {
      el.addEventListener('click', () => { bumpOutfitUse(el.dataset.id); onOpenOutfit && onOpenOutfit(el.dataset.id); });
    });
  }
  container.querySelector('#backBtn').addEventListener('click', goBack);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
