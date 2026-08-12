# 部署到公网（关电脑也能用）

目标：把穿搭工作台放到云端，拿到一个 `https://` 永久地址，手机随时能开、能"添加到主屏"，**不依赖你电脑开机**。

已为你准备好 `outfit-workbench.zip`（含全部静态文件 + 60 条爬取数据），直接用下面任一方式即可上线。

---

## 方式一：Netlify 拖拽部署（最快，3 分钟，免费）

1. 打开 https://app.netlify.com/drop
2. 把 `outfit-workbench.zip` **拖进去**（或直接拖 `/workspace` 整个目录）
3. 等几秒，Netlify 会给出一个随机地址，如 `https://xxx.netlify.app`
4. 手机 Safari/Chrome 打开这个地址 → 点「分享 / 添加到主屏幕」即可安装
5. （可选）在 Site settings → Domain management 里绑定自己的域名，或改子域名

> 无需任何配置，`netlify.toml` 已内置（纯静态、SPA 回退、缓存策略）。

---

## 方式二：GitHub Pages（免费、永久）

1. 在 GitHub 新建一个仓库（如 `outfit-workbench`）
2. 把项目文件（不含 `scripts/`、`serve.py`、`.zip`）推上去
3. 仓库 Settings → Pages → Source 选 `main` 分支 / root → Save
4. 几分钟后拿到 `https://<用户名>.github.io/<仓库名>/`
5. 注意：GitHub Pages 是子路径部署，`manifest` 的 `start_url` 会自动相对解析，无需改动即可安装

---

## 方式三：Vercel（免费、自动 HTTPS）

1. 打开 https://vercel.com/new
2. 选「Import Git Repository」或「Upload」直接传目录
3. Framework 选 `Other` / `Static`，其余默认
4. 部署完拿到 `https://xxx.vercel.app`，手机打开安装即可

---

## 部署后你需要知道的事

- **数据仍在你手机本地**：衣物、搭配方案存在手机浏览器（IndexedDB），不上云。换手机/清缓存不互通；之后要云同步再加后端。
- **首页数据**：部署时打包的是 60 条爬取示例数据。要每天更新，定期在本地跑 `python scripts/crawler/build_feed.py` 重新生成 `public/crawl/feed.json` 并重新部署即可（或后续改成云端定时任务）。
- **AI 抠图**：首次使用需联网从 CDN 拉模型（几十 MB），之后浏览器缓存可离线；断网时自动降级为亮度去背。
- **改了代码想更新**：重新生成 zip 拖到 Netlify 的 Deploys → Upload 即可覆盖；或用 Git 方式自动更新。

---

## 我（AI）能帮你做的 vs 需要你做的

- ✅ 我能做：打包站点、写配置、本地验证、生成这份指引、甚至你给 GitHub 仓库地址我帮你推。
- ⚠️ 需要你做：用**你自己的账号**在 Netlify/GitHub/Vercel 上点一下完成部署（沙箱里没有你的登录态，无法替你登录第三方账号）。
- 🔑 如果你愿意提供 Netlify 的 **Deploy Token**，我可以用 Netlify CLI 全自动部署，连账号都不用你碰。
