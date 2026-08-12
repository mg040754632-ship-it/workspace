"""
抖音穿搭视频/图文爬取（参考实现）
================================
说明：
- 抖音接口同样需要登录态、a_bogus 签名与设备参数，且有强反爬，
  真实抓取需在登录后的环境中提取参数，并遵守平台规则与法律。
- 本脚本为「接口调用 + 解析」参考框架，并内置示例数据，
  运行 `python douyin.py` 可直接产出 public/crawl/feed.json（与小红书脚本二选一/合并使用）。

运行：python douyin.py
依赖：pip install requests
"""
import json
import os
import random

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "public", "crawl")
OUT_FILE = os.path.join(OUT_DIR, "feed.json")

KEYWORD = "穿搭"
LIMIT = 30

TITLES = [
    "氛围感拉满早秋通勤穿搭",
    "小个子显高穿搭公式",
    "今年最火美拉德风",
    "多巴胺穿搭太快乐了",
    "极简老钱风穿搭",
    "梨形身材救星穿搭",
    "甜酷风穿搭指南",
    "约会温柔奶系穿搭",
]
AUTHORS = ["穿搭日记", "潮流侦察兵", "衣柜改造家", "搭配师阿May", "衣品进化论"]


def _sign(params: dict) -> str:
    """a_bogus 签名占位（真实环境需调用抖音 JS 签名算法）。"""
    return "PLACEHOLDER_A_BOGUS"


def _request_feed(keyword: str, cursor: int) -> list:
    """抖音搜索接口（参考）。

    真实接口（示意）：
    GET https://www.douyin.com/aweme/v1/web/general/search/single/
    params: keyword, cursor, count, ...
    headers: cookie=<登录cookie>, user-agent, a_bogus=<签名>
    """
    return []  # 演示返回空 -> 走兜底


def crawl(keyword: str = KEYWORD, limit: int = LIMIT) -> list:
    items, cursor = [], 0
    while len(items) < limit:
        real = _request_feed(keyword, cursor)
        if not real:
            break
        items.extend(real)
        cursor += 10
    if not items:
        items = _fallback(keyword, limit)
    return items[:limit]


def _fallback(keyword: str, limit: int) -> list:
    return [{
        "id": f"dy_{i}",
        "title": f"【{keyword}】{random.choice(TITLES)}",
        "author": random.choice(AUTHORS),
        "platform": "抖音",
        "badge": "douyin",
        "likes": random.randint(8000, 1999000),
        "cover": "",  # 真实抓取填入视频封面 URL
        "source": "crawler-sample",
    } for i in range(limit)]


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    data = crawl()
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[douyin] 产出 {len(data)} 条 -> {os.path.abspath(OUT_FILE)}")


if __name__ == "__main__":
    main()
