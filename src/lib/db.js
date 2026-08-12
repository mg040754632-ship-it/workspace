// IndexedDB 封装：衣物图片、搭配方案；localStorage 存最常穿穿搭与首页日期
const DB_NAME = 'outfit_workbench';
const DB_VERSION = 1;
const STORE_CLOTHES = 'clothes';     // 衣物：{id, cat, name, blobUrl, createdAt}
const STORE_OUTFITS = 'outfits';     // 方案：{id, season, title, dataUrl, items:[catId...], createdAt, useCount}

let _db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (_db) return resolve(_db);
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_CLOTHES)) {
        db.createObjectStore(STORE_CLOTHES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_OUTFITS)) {
        db.createObjectStore(STORE_OUTFITS, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}

function tx(store, mode) {
  return openDB().then(db => db.transaction(store, mode).objectStore(store));
}

export async function addCloth(rec) {
  const store = await tx(STORE_CLOTHES, 'readwrite');
  return new Promise((res, rej) => {
    const r = store.add(rec);
    r.onsuccess = () => res(rec);
    r.onerror = () => rej(r.error);
  });
}

export async function getAllClothes() {
  const store = await tx(STORE_CLOTHES, 'readonly');
  return new Promise((res, rej) => {
    const r = store.getAll();
    r.onsuccess = () => res(r.result || []);
    r.onerror = () => rej(r.error);
  });
}

export async function getClothesByCat(cat) {
  const all = await getAllClothes();
  return all.filter(c => c.cat === cat);
}

export async function addOutfit(rec) {
  const store = await tx(STORE_OUTFITS, 'readwrite');
  return new Promise((res, rej) => {
    const r = store.add(rec);
    r.onsuccess = () => res(rec);
    r.onerror = () => rej(r.error);
  });
}

export async function getAllOutfits() {
  const store = await tx(STORE_OUTFITS, 'readonly');
  return new Promise((res, rej) => {
    const r = store.getAll();
    r.onsuccess = () => res(r.result || []);
    r.onerror = () => rej(r.error);
  });
}

export async function getOutfitsBySeason(season) {
  const all = await getAllOutfits();
  return all.filter(o => o.season === season);
}

export async function bumpOutfitUse(id) {
  const store = await tx(STORE_OUTFITS, 'readwrite');
  return new Promise((res, rej) => {
    const g = store.get(id);
    g.onsuccess = () => {
      const rec = g.result;
      if (!rec) return res(null);
      rec.useCount = (rec.useCount || 0) + 1;
      const p = store.put(rec);
      p.onsuccess = () => res(rec);
      p.onerror = () => rej(p.error);
    };
    g.onerror = () => rej(g.error);
  });
}

// localStorage 辅助
export function lsGet(k, def) {
  try { const v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); }
  catch { return def; }
}
export function lsSet(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
