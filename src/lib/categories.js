// 11 个服饰分类（图标 + 文字，自上而下）
// 用基础 Unicode 符号代替 emoji，确保所有设备都能正常显示
export const CATEGORIES = [
  { id: 'top',      name: '上衣',   icon: '👚' },
  { id: 'coat',     name: '外套',   icon: '🧥' },
  { id: 'pants',    name: '裤子',   icon: '👖' },
  { id: 'skirt',    name: '裙子',   icon: '👗' },
  { id: 'belt',     name: '腰带',   icon: '🪢' },
  { id: 'necklace', name: '项链',   icon: '📿' },
  { id: 'earring',  name: '耳环',   icon: '💎' },
  { id: 'bracelet', name: '手链',   icon: '⌚' },
  { id: 'ring',     name: '戒指',   icon: '💍' },
  { id: 'headwear', name: '头饰',   icon: '🎀' },
  { id: 'other',    name: '其他',   icon: '🧷' },
];

export function catById(id) { return CATEGORIES.find(c => c.id === id); }

// 四季：name 是单字（用在标题），label 是两个字（用在方格显示），icon 是基础符号
export const SEASONS = [
  { id: 'spring', name: '春', label: '春日', cls: 'season-spring', icon: '✿' },
  { id: 'summer', name: '夏', label: '夏日', cls: 'season-summer', icon: '☀' },
  { id: 'autumn', name: '秋', label: '秋日', cls: 'season-autumn', icon: '✦' },
  { id: 'winter', name: '冬', label: '冬日', cls: 'season-winter', icon: '❅' },
];

export function seasonById(id) { return SEASONS.find(s => s.id === id); }