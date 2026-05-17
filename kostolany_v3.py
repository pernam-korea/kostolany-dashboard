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
        long_hit   = sum(1 for kw in LONG_TRIGGERS  if kw in combined)

        articles.append({
            "title":       item.get("title",""),
            "summary":     item.get("summary","")[:280],
            "source":      item.get("source",""),
            "hours_ago":   round(hours_ago, 1),
            "freshness":   max(0, 1 - hours_ago / 24),
            "sentiment":   item.get("overall_sentiment_label","Neutral"),
            "sent_score":  float(item.get("overall_sentiment_score", 0)),
            "tickers":     [t["ticker"] for t in item.get("ticker_sentiment", [])],
            "short_score": short_hit,
            "long_score":  long_hit,
            "is_fresh":    hours_ago <= FRESH_HOURS,
        })

    fresh = [a for a in articles if a["is_fresh"]]
    short = sorted([a for a in articles if a["short_score"] > 0], key=lambda x: -x["short_score"])
    long_ = sorted([a for a in articles if a["long_score"]  > 0], key=lambda x: -x["long_score"])

    print(f"  ✅ 전체 {len(articles)}건 | 🆕 초기 {len(fresh)}건 | ⚡ 단기 {len(short)}건 | 📈 장기 {len(long_)}건")
    return {"all": articles, "fresh": fresh, "short": short, "long": long_,
            "stats": {"total": len(articles), "fresh": len(fresh),
                      "short": len(short), "long": len(long_)}}


def analyze(classified: dict, market: str) -> dict:
    print(f"\n🤖 Claude 분석 중 [{market}장]...")
    client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)

    def fmt(articles, label, n=6):
        if not articles: return f"[{label}: 없음]\n"
        out = f"[{label}]\n"
        for a in articles[:n]:
            out += (f"  제목: {a['title']}\n"
                    f"  요약: {a['summary']}\n"
                    f"  감성: {a['sentiment']}({a['sent_score']:+.2f}) | "
                    f"신선도:{a['freshness']:.2f} | {a['hours_ago']}시간 전\n---\n")
        return out

    news_block = (
        fmt(classified["fresh"], "🆕 초기 신호 (6h 이내)")
        + fmt(classified["short"][:5], "⚡ 단기 모멘텀 트리거")
        + fmt(classified["long"][:6],  "📈 장기 구조 트리거")
    )

    market_ctx = {
        "KR": "한국장(KRX) 09:00 개장 전 분석.",
        "US": "미국장(NYSE/NASDAQ) 22:30 개장 전 분석."
    }[market]

    prompt = f"""당신은 코스톨라니 철학 기반 투자 애널리스트입니다.
오늘: {datetime.now().strftime('%Y-%m-%d %H:%M')} KST | {market_ctx}

포트폴리오 원칙:
- 장기 버킷 (70~80%): 구조적 트렌드, 6개월~3년 보유
- 단기 버킷 (20~30%): 모멘텀, 수일~2주, 목표 주 2~3%
- 주 10%+ 신호는 반드시 고위험 태그

=== 뉴스 ===
{news_block}

JSON으로만 응답:
{{
  "market": "{market}",
  "session_note": "한 줄 요약",
  "long_bucket": {{
    "allocation": "70~80%",
    "theme": "핵심 장기 테마",
    "picks": [
      {{
        "ticker": "코드",
        "name": "종목명",
        "sector": "섹터",
        "hold_period": "보유기간",
        "rationale": "근거",
        "entry_strategy": "분할매수|일괄매수",
        "stop_loss": "손절기준",
        "confidence": 82
      }}
    ]
  }},
  "short_bucket": {{
    "allocation": "20~30%",
    "warning": "리스크 경고",
    "picks": [
      {{
        "ticker": "코드",
        "name": "종목명",
        "trigger": "트리거",
        "expected_move": "기대수익",
        "risk_level": "보통|높음|매우높음",
        "entry_window": "진입시간",
        "stop_loss": "손절기준",
        "exit_signal": "익절신호",
        "confidence": 65
      }}
    ]
  }},
  "avoid_now": [{{"name": "종목/섹터", "reason": "이유"}}],
  "kostolany_today": "한마디",
  "disclaimer": "교육 목적이며 투자 권유 아님"
}}"""

    try:
        resp = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2500,
            messages=[{"role": "user", "content": prompt}]
        )
        raw = resp.content[0].text.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        return json.loads(raw)
    except Exception as e:
        print(f"  ❌ 실패: {e}")
        return {"error": str(e)}


def save(analysis: dict, classified: dict, market: str):
    key = market.lower()
    (OUTPUT / f"latest_{key}.json").write_text(
        json.dumps({
            "generated_at": datetime.now().isoformat(),
            "market": market,
            "stats": classified["stats"],
            "analysis": analysis,
        }, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\n💾 저장: reports_v4/latest_{key}.json")


def run(market: str):
    market = market.upper()
    print(f"\n{'='*50}\n  {market}장 분석 시작 {datetime.now().strftime('%H:%M')}\n{'='*50}")
    classified = fetch_news(market)
    analysis   = analyze(classified, market)
    save(analysis, classified, market)
    print(json.dumps(analysis, ensure_ascii=False, indent=2))


def _sample(market: str):
    now = datetime.now(timezone.utc)
    def ts(h): return (now - timedelta(hours=h)).strftime("%Y%m%dT%H%M%S")
    if market == "KR":
        return [
            {"title": "두산에너빌리티 폴란드 SMR 입찰 공식 제출",
             "summary": "두산에너빌리티가 폴란드 SMR 프로그램 공식 입찰서 제출. 국내 증권사 미반영.",
             "source": "Nikkei", "time_published": ts(2),
             "overall_sentiment_label": "Bullish", "overall_sentiment_score": "0.65",
             "topics": [{"topic":"energy_transportation"}], "ticker_sentiment": []},
            {"title": "SK하이닉스 HBM4 엔비디아 공급 계약 연장",
             "summary": "SK하이닉스 2026년 HBM4 물량 85% 엔비디아 독점 공급 계약 체결.",
             "source": "Bloomberg", "time_published": ts(4),
             "overall_sentiment_label": "Bullish", "overall_sentiment_score": "0.72",
             "topics": [{"topic":"technology"}], "ticker_sentiment": []},
        ]
    else:
        return [
            {"title": "Nvidia expands HBM4 to three suppliers",
             "summary": "Nvidia broadening HBM4 supply beyond SK Hynix for GB300 ramp.",
             "source": "The Information", "time_published": ts(3),
             "overall_sentiment_label": "Bullish", "overall_sentiment_score": "0.60",
             "topics": [{"topic":"technology"}], "ticker_sentiment": []},
            {"title": "US Grid Modernization Act passes: $400B for transmission",
             "summary": "Bipartisan bill unlocks decade-long transformer investment cycle.",
             "source": "Reuters", "time_published": ts(8),
             "overall_sentiment_label": "Bullish", "overall_sentiment_score": "0.52",
             "topics": [{"topic":"energy_transportation"}], "ticker_sentiment": []},
        ]


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--market", choices=["KR","US","kr","us"], default=None)
    p.add_argument("--schedule", action="store_true")
    args = p.parse_args()

    if args.schedule:
        schedule.every().day.at("07:00").do(run, market="KR")
        schedule.every().day.at("20:00").do(run, market="US")
        auto = "KR" if datetime.now().hour < 12 else "US"
        run(auto)
        while True:
            schedule.run_pending()
            time.sleep(60)
    elif args.market:
        run(args.market)
    else:
        auto = "KR" if datetime.now().hour < 12 else "US"
        run(auto)
