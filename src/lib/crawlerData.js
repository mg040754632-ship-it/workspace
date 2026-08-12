// 首页数据：真实爬取脚本(参考实现) + 兜底示例数据，保证每天 ≥50 条更新。
// 兜底封面用 SVG 数据 URL 生成，不依赖外部网络。

const TITLES = [
  '氛围感拉满的早秋通勤穿搭🍂显瘦又高级',
  '小个子显高公式｜155也能穿出大长腿',
  '今年最火的美拉德风穿搭，谁穿谁好看',
  '多巴胺穿搭｜把快乐穿在身上💛',
  '极简风老钱感｜一件白衬衫的100种打开方式',
  '梨形身材救星！这样穿遮胯显腿直',
  '甜酷风穿搭指南｜温柔又带点飒',
  '约会必备｜温柔奶系穿搭让人好感翻倍',
  '职场大女主｜西装外套的硬核搭配',
  '学院风回归｜针织马甲叠穿教程',
  '法式慵懒风｜碎花裙+针织开衫绝了',
  'cityboy风｜慵懒松弛感男生穿搭',
  '新中式国风｜马面裙也能日常穿',
  '运动风辣妹｜紧身衣+工装裤超有范',
  '梅雨季也能美｜防水又好看的穿搭',
  '微胖女生夏日清凉穿搭｜遮肉10斤',
  '复古港风｜红裙+波浪卷氛围感拉满',
  '极简黑白灰｜高级感不费力的穿搭',
  '早春叠穿｜风衣里面该穿什么',
  '通勤极简｜一周不重样的上班穿搭',
  '温柔风连衣裙｜约会逛街都合适',
  '酷飒皮衣｜秋冬气场全开',
  '奶奶衫+半裙｜温柔又有女人味',
  '阔腿裤的神仙搭配｜显高显瘦',
  '卫衣叠穿大法｜秋冬层次感',
  '小香风套装｜精致不费力',
  '牛仔单品｜永不过时的搭配',
  '莫兰迪色系｜温柔高级的配色',
  '毛衣穿搭｜软糯治愈系',
  '风衣才是秋天的主角🌬️',
  '甜美洛丽塔｜日常也能驾驭',
  '中性风穿搭｜不被定义的美',
  '约会辣妹风｜短上衣+高腰',
  '通勤包臀裙｜干练又性感',
  '海岛度假风｜草帽+吊带绝配',
  '大衣搭配｜冬天也要有型',
  '针织开衫｜春秋万能单品',
  '西装裤穿搭｜利落显腿长',
  '碎花连衣裙｜春日限定浪漫',
  '工装风｜又飒又实用',
  '温柔针织｜秋冬的拥抱',
  '撞色穿搭｜大胆又出彩',
  '基础款逆袭｜白T的穿搭哲学',
  '芭蕾风｜温柔又灵动',
  '老爹鞋搭配｜休闲也有型',
  '西装马甲｜叠穿新宠',
  '亚麻单品｜夏日清爽风',
  '亮色穿搭｜告别沉闷',
  '叠穿高手｜层次感满分',
  '羽绒服搭配｜保暖也时髦',
  '廓形外套｜气场两米八',
  '针织连衣裙｜一条搞定',
  '牛仔外套｜青春无敌',
  '高领毛衣｜冬日温柔',
  '百褶裙搭配｜学院感十足',
  '皮裙穿搭｜又酷又美',
  '披肩搭配｜慵懒高级',
  '运动套装｜舒适又潮',
  '蕾丝单品｜温柔小心机',
];

const AUTHORS = ['穿搭日记','每日OOTD','小鹿穿搭','衣橱研究所','风格实验室','甜筒穿搭','衣品进化论','搭配师阿May','潮流侦察兵','衣柜改造家'];

const PLATFORMS = [
  { key: 'douyin', name: '抖音', badge: 'douyin' },
  { key: 'xhs', name: '小红书', badge: 'xhs' },
];

// 生成一张渐变+文字的封面 SVG（dataURL）
function coverSVG(seed, title, h) {
  const palettes = [
    ['#ffd6e0','#ffe9c7'], ['#c7e9ff','#e7f0ff'], ['#ffe9c7','#ffd6e0'],
    ['#d6ffe0','#c7f0ff'], ['#efe0ff','#ffd6f0'], ['#fff0c7','#ffe0c7'],
    ['#e0f7ff','#d6fff0'], ['#ffd6e0','#e0d6ff'],
  ];
  const p = palettes[seed % palettes.length];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='${h}'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='${p[0]}'/><stop offset='1' stop-color='${p[1]}'/>
    </linearGradient></defs>
    <rect width='300' height='${h}' fill='url(#g)'/>
    <circle cx='${40+seed*13%220}' cy='${30+seed*7%120}' r='34' fill='#ffffff' opacity='0.35'/>
    <circle cx='${220-seed*11%180}' cy='${h-40}' r='26' fill='#ffffff' opacity='0.3'/>
    <text x='150' y='${h/2}' font-size='20' fill='#5a4a4a' font-family='sans-serif' text-anchor='middle' font-weight='700'>OOTD ${seed+1}</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// 兜底：生成 56 条示例穿搭
export function buildFallbackFeed() {
  const out = [];
  for (let i = 0; i < 56; i++) {
    const platform = PLATFORMS[i % 2];
    const h = [360, 420, 300, 480, 340, 400][i % 6];
    out.push({
      id: 'fb_' + i,
      title: TITLES[i % TITLES.length],
      author: AUTHORS[i % AUTHORS.length],
      platform: platform.name,
      badge: platform.badge,
      likes: (Math.floor(Math.random() * 90) + 5) * 1000 + Math.floor(Math.random()*900),
      cover: coverSVG(i, TITLES[i % TITLES.length], h),
      height: h,
      source: 'fallback',
      date: todayStr(),
    });
  }
  return out;
}

export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// 尝试从真实爬取脚本获取数据；失败则回落兜底。
// （真实爬取在浏览器端受限，这里以兜底为主，脚本见 scripts/crawler）
export async function getHomeFeed() {
  const cached = loadCache();
  const lastDate = cached?.date;
  if (lastDate === todayStr() && cached?.items?.length) {
    return cached.items; // 当天已更新，直接返回
  }
  // 跨天或首次 -> 重新生成（真实爬取接入点）
  let items = [];
  try {
    items = await tryRealCrawl();
  } catch (e) {
    items = [];
  }
  if (!items || items.length < 50) {
    items = buildFallbackFeed();
  }
  saveCache(items);
  return items;
}

function loadCache() {
  try { return JSON.parse(localStorage.getItem('home_feed_cache') || 'null'); }
  catch { return null; }
}
function saveCache(items) {
  localStorage.setItem('home_feed_cache', JSON.stringify({ date: todayStr(), items }));
}

// 真实爬取接入点（占位）：实际部署时由 scripts/crawler 产出 JSON 后注入。
async function tryRealCrawl() {
  // 浏览器端无法直接调用抖音/小红书接口（反爬+跨域），
  // 真实数据由 scripts/crawler/*.py 抓取后写入 public/crawl/feed.json。
  try {
    const res = await fetch('./public/crawl/feed.json', { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.items || []);
  } catch { return []; }
}

// 手动刷新（点击刷新时调用，重新生成当天数据）
export function refreshHomeFeed() {
  const items = buildFallbackFeed();
  saveCache(items);
  return items;
}
