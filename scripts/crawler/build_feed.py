"""
合并小红书 + 抖音爬取结果到 public/crawl/feed.json（≥50 条）。
真实部署时先跑 xiaohongshu.py / douyin.py，再跑本脚本合并；
若两者都未配置真实 cookie，则各自回落示例数据，合并后仍为 60 条兜底数据，
保证网页端首页每天有 ≥50 条内容。

运行：python build_feed.py
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(ROOT, "public", "crawl", "feed.json")

sys.path.insert(0, HERE)
import xiaohongshu as xhs
import douyin as dy


def main():
    items = []
    items += xhs.crawl(limit=30)
    items += dy.crawl(limit=30)
    # 去重
    seen, uniq = set(), []
    for it in items:
        if it["id"] in seen:
            continue
        seen.add(it["id"])
        uniq.append(it)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(uniq, f, ensure_ascii=False, indent=2)
    print(f"[build_feed] 合并产出 {len(uniq)} 条 -> {OUT}")


if __name__ == "__main__":
    main()
