# 穿搭工作台 · 爬取脚本（参考实现）

首页需要 ≥50 条抖音 / 小红书热门穿搭内容，并每日更新。

## 重要说明（请先读）
抖音和小红书均有**登录态、请求签名（X-Bogus / a_bogus）、滑块验证与频率限制**，
纯脚本直接抓真实账号内容在技术和合规上都很困难，且可能违反平台规则。

因此本目录提供的是**「接口调用 + 解析」的参考框架**：
- 真实抓取逻辑已在 `_request_feed()` 中给出结构（含签名占位 `_sign()`）；
- 抓取失败或未配置 cookie 时，自动回落到内置示例数据，
  保证 `python xxx.py` 一定能产出 `public/crawl/feed.json`，网页端每天都有内容。

## 目录
- `xiaohongshu.py` —— 小红书搜索接口参考实现
- `douyin.py` —— 抖音搜索接口参考实现

## 运行
```bash
cd scripts/crawler
pip install requests
python xiaohongshu.py   # 产出 public/crawl/feed.json
# 或
python douyin.py
```

## 接入网页端
网页端 `src/lib/crawlerData.js` 的 `tryRealCrawl()` 会尝试读取 `./public/crawl/feed.json`。
把爬虫产出的 JSON 放到该路径，首页就会优先展示真实数据；否则用内置兜底示例。

JSON 单条结构：
```json
{
  "id": "xhs_1",
  "title": "氛围感早秋通勤穿搭",
  "author": "穿搭日记",
  "platform": "小红书",
  "badge": "xhs",
  "likes": 123000,
  "cover": "https://...封面url",
  "source": "crawler-sample"
}
```

## 想要真实数据怎么办？
1. 在登录后的浏览器中打开搜索页，用开发者工具抓取 `cookie` 与签名参数；
2. 在 `_sign()` 中接入平台 JS 签名算法（可借助 playwright 在浏览器上下文内执行）；
3. 把 `_request_feed()` 的返回解析为上面的 JSON 结构即可。
（建议仅用于个人学习，注意频率与合规。）
