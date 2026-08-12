import { renderPlans, renderSeasonList } from './pages/plans.js';
import { renderProfile } from './pages/profile.js';
import { openMatchPage } from './pages/match.js';

const pageContainer = document.getElementById('pageContainer');
const pageTitle = document.getElementById('pageTitle');
const tabBar = document.getElementById('tabBar');

const TITLES = { plans: '穿搭方案', profile: '个人主页' };

let currentTab = 'plans';
let view = 'main'; // main | season

async function showTab(tab) {
  currentTab = tab;
  view = 'main';
  pageTitle.textContent = TITLES[tab];
  tabBar.style.display = 'flex';
  setActiveTab(tab);
  pageContainer.scrollTop = 0;
  if (tab === 'plans') await renderPlans(pageContainer, { goSeason: showSeason });
  else if (tab === 'profile') await renderProfile(pageContainer, { openMatch: openMatch });
}

function setActiveTab(tab) {
  tabBar.querySelectorAll('.tab-item').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
}

function showSeason(seasonId) {
  view = 'season';
  tabBar.style.display = 'none';
  renderSeasonList(pageContainer, seasonId, {
    goBack: () => showTab('plans'),
    onOpenOutfit: () => showToastTip(),
  });
}
function showToastTip() { /* 可扩展为打开方案大图 */ }

function openMatch() {
  tabBar.style.display = 'none';
  openMatchPage(document.body, {
    onClose: () => { tabBar.style.display = 'flex'; showTab('profile'); },
  });
}

tabBar.querySelectorAll('.tab-item').forEach(btn => {
  btn.addEventListener('click', () => showTab(btn.dataset.tab));
});

// 启动（默认进入穿搭方案）
showTab('plans');

// ===== PWA 安装引导 =====
let deferredPrompt = null;
const installBanner = document.getElementById('installBanner');
const installBtn = document.getElementById('installBtn');
const installClose = document.getElementById('installClose');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const dismissed = localStorage.getItem('install_dismissed');
  if (!dismissed) installBanner.classList.remove('hidden');
});

installBtn?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBanner.classList.add('hidden');
});

installClose?.addEventListener('click', () => {
  installBanner.classList.add('hidden');
  localStorage.setItem('install_dismissed', '1');
});

if (!window.matchMedia('(display-mode: standalone)').matches && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
  if (!localStorage.getItem('install_dismissed')) installBanner.classList.remove('hidden');
}
