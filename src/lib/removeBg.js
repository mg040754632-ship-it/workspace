// 前端白底抠图封装
// 优先：@imgly/background-removal（浏览器内离线 ONNX 推理，真正的 AI 去背）
// 降级：Canvas 亮度阈值去背（无网络/模型加载失败时仍可用）
let _bgRemoval = null;
let _loadPromise = null;

async function loadBgRemoval() {
  if (_bgRemoval) return _bgRemoval;
  if (_loadPromise) return _loadPromise;
  _loadPromise = (async () => {
    try {
      const mod = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/dist/index.min.mjs');
      _bgRemoval = mod.removeBackground;
      return _bgRemoval;
    } catch (e) {
      console.warn('AI 抠图模型加载失败，使用降级方案', e);
      _bgRemoval = null;
      return null;
    }
  })();
  return _loadPromise;
}

// 输入 File/Blob/Image -> 返回白底图片的 Blob(dataUrl 形式)
export async function removeBgToWhite(input, onStatus) {
  onStatus && onStatus('正在加载抠图模型…');
  const fn = await loadBgRemoval();
  if (fn) {
    try {
      onStatus && onStatus('AI 识别衣服中…');
      const blob = await fn(input, {
        output: { format: 'image/png' },
        progress: (k) => { if (k*100 % 20 < 1) onStatus && onStatus('处理中 ' + Math.round(k*100) + '%'); },
      });
      return await compositedWhite(blob);
    } catch (e) {
      console.warn('AI 抠图失败，降级', e);
    }
  }
  // 降级：canvas 亮度阈值
  onStatus && onStatus('使用快速去背…');
  return await fallbackWhite(input);
}

// 把去背后的 PNG 合成到白底（@imgly 输出已是透明 PNG）
async function compositedWhite(pngBlob) {
  const url = URL.createObjectURL(pngBlob);
  const img = await loadImage(url);
  const canvas = document.createElement('canvas');
  canvas.width = img.width; canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(img, 0, 0);
  URL.revokeObjectURL(url);
  return await canvasToBlob(canvas);
}

// 降级：基于亮度阈值去背（适合浅色背景照片）
async function fallbackWhite(input) {
  const url = input instanceof Blob ? URL.createObjectURL(input) : input;
  const img = await loadImage(url);
  const canvas = document.createElement('canvas');
  canvas.width = img.width; canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = data.data;
  // 采样四角判断背景色
  const corners = [[0,0],[canvas.width-1,0],[0,canvas.height-1],[canvas.width-1,canvas.height-1]];
  let br=0,bg=0,bb=0;
  corners.forEach(([x,y]) => { const i=(y*canvas.width+x)*4; br+=px[i];bg+=px[i+1];bb+=px[i+2]; });
  br/=4; bg/=4; bb/=4;
  for (let i=0;i<px.length;i+=4) {
    const r=px[i],g=px[i+1],b=px[i+2];
    const dist = Math.abs(r-br)+Math.abs(g-bg)+Math.abs(b-bb);
    if (dist < 60) { px[i+3] = 0; } // 接近背景 -> 透明
    px[i]=255; px[i+1]=255; px[i+2]=255; // 其余填白
  }
  ctx.putImageData(data,0,0);
  if (input instanceof Blob) URL.revokeObjectURL(url);
  return await canvasToBlob(canvas);
}

function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}
function canvasToBlob(canvas) {
  return new Promise((res) => canvas.toBlob(b => res(b), 'image/png'));
}
export function blobToDataURL(blob) {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(blob);
  });
}
