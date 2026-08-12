// 通用 UI 工具：toast、底部弹层
export function showToast(msg, ms = 1800) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
}

// 弹出底部 sheet，content 为 HTML 字符串，返回 {close, root}
export function openSheet(title, contentHTML, { onMount } = {}) {
  const mask = document.createElement('div');
  mask.className = 'modal-mask';
  mask.innerHTML = `
    <div class="modal-sheet">
      <button class="sheet-close" aria-label="关闭">✕</button>
      <h3 class="modal-title">${title}</h3>
      ${contentHTML}
    </div>`;
  document.getElementById('modalRoot').appendChild(mask);
  const close = () => mask.remove();
  mask.querySelector('.sheet-close').addEventListener('click', close);
  mask.addEventListener('click', (e) => { if (e.target === mask) close(); });
  if (onMount) onMount(mask.querySelector('.modal-sheet'), { close });
  return { close, root: mask };
}
