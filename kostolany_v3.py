import os, json, requests, schedule, time, argparse
from datetime import datetime, timezone, timedelta
from pathlib import Path
import anthropic

AV_KEY        = os.getenv("ALPHA_VANTAGE_API_KEY", "YOUR_KEY")
ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY",     "YOUR_KEY")

FRESH_HOURS = 6
TOPICS_KR = ["technology", "manufacturing", "energy_transportation", "finance"]
TOPICS_US = ["technology", "energy_transportation", "finance", "earnings"]

SHORT_TRIGGERS = [
    "fda approval", "fda approved", "earnings beat", "earnings surprise",
    "short squeeze", "buyout", "acquisition", "merger", "takeover",
    "upgrade", "initiated", "guidance raised", "buyback",
    "승인", "어닝", "실적 서프라이즈", "인수", "합병", "자사주",
]
LONG_TRIGGERS = [
    "infrastructure", "policy", "regulation", "nuclear", "smr",
    "semiconductor", "ai infrastructure", "grid", "demographic",
    "인프라", "정책", "원전", "반도체", "전력망", "고령화",
]

OUTPUT = Path("./reports_v4")
OUTPUT.mkdir(exist_ok=True)


def fetch_news(market: str) -> dict:
    topics = TOPICS_KR if market == "KR" else TOPICS_US
    print(f"\n📡 뉴스 수집 중 [{market}장 모드]...")
    url = (
        "https://www.alphavantage.co/query"
        f"?function=NEWS_SENTIMENT&topics={','.join(topics)}"
        f"&limit=40&sort=LATEST&apikey={AV_KEY}"
    )
    try:
        data = requests.get(url, timeout=15).json()
        raw  = data.get("feed", [])
        if not raw:
            print("  ⚠️  API 응답 없음 → 샘플 사용")
            raw = _sample(market)
    except Exception as e:
        print(f"  ❌ {e} → 샘플 사용")
        raw = _sample(market)

    now_utc = datetime.now(timezone.utc)
    articles = []
    for item in raw:
        pub_str = item.get("time_published", "")
        try:
            pub_dt    = datetime.strptime(pub_str[:15], "%Y%m%dT%H%M%S").replace(tzinfo=timezone.utc)
            hours_ago = (now_utc - pub_dt).total_seconds() / 3600
        except:
            hours_ago = 999

        combined   = (item.get("title","") + " " + item.get("summary","")).lower()
        short_hit  = sum(1 for kw in SHORT_TRIGGERS if kw in combined)
        long_hit   = sum(1 for kw in LO
