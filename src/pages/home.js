import { getHomeFeed, refreshHomeFeed, todayStr } from '../lib/crawlerData.js';

function fmtLikes(n) {
  if (n >= 10000) return (n/10000).toFixed(1).replace('.0','') + 'w';
  return String(n);
}

// 封面兜底：爬取数据无封面 URL 时，用标题首字生成彩色 SVG 封面
const COVER_BG = [['#ffd6e0','#ffe9c7'],['#c7e9ff','#e7f0ff'],['#ffe9c7','#ffd6e0'],['#d6ffe0','#c7f0ff'],['#efe0ff','#ffd6f0']];
function coverFallback(it, i) {
  if (it.cover) return it.cover;
  const p = COVER_BG[i % COVER_BG.length];
  const ch = (it.title || '穿')[0];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='360'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='${p[0]}'/><stop offset='1' stop-color='${p[1]}'/></linearGradient></defs>
    <rect width='300' height='360' fill='url(#g)'/>
    <text x='150' y='205' font-size='110' fill='#ffffff' font-family='sans-serif' text-anchor='middle' font-weight='700' opacity='0.9'>${escapeHtml(ch)}</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export async function renderHome(container, { setRefreshing } = {}) {
  container.innerHTML = `
    <div class="feed-date" id="feedDate"></div>
    <div class="feed" id="feed"></div>
    <div class="feed-refresh" id="feedRefresh">↓ 点击刷新今日爆款</div>
  `;
  const feedEl = container.querySelector('#feed');
  const dateEl = container.querySelector('#feedDate');
  const refreshEl = container.querySelector('#feedRefresh');

  function paint(items) {
    dateEl.textContent = `今日更新 · ${todayStr()} · 共 ${items.length} 条`;
    feedEl.innerHTML = items.map((it, i) => `
      <article class="feed-card">
        <div class="feed-cover-wrap">
          <span class="feed-badge ${it.badge}">${it.platform}</span>
          <img class="feed-cover" src="${coverFallback(it, i)}" alt="" loading="lazy" />
        </div>
        <div class="feed-body">
          <p class="feed-title">${escapeHtml(it.title)}</p>
          <div class="feed-meta">
            <span class="feed-author"><span class="dot"></span>${escapeHtml(it.author)}</span>
            <span class="feed-likes">♥ ${fmtLikes(it.likes)}</span>
          </div>
        </div>
      </article>
    `).join('');
  }

  let items = await getHomeFeed();
  paint(items);

  refreshEl.addEventListener('click', () => {
    refreshEl.textContent = '刷新中…';
    // 强制重新生成当天数据
    const nd = refreshHomeFeed();
    paint(nd);
    refreshEl.textContent = '↓ 已刷新，点击再换一批';
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
