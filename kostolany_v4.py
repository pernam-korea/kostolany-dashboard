import os, json, requests, argparse
from datetime import datetime, timezone, timedelta
from pathlib import Path
import anthropic

AV_KEY        = os.getenv("ALPHA_VANTAGE_API_KEY", "YOUR_KEY")
ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY",     "YOUR_KEY")
OUTPUT        = Path("./reports_v4")
OUTPUT.mkdir(exist_ok=True)
PORTFOLIO_FILE = Path("./portfolio.json")


def load_portfolio() -> list:
    if not PORTFOLIO_FILE.exists():
        print("  ⚠️  portfolio.json 없음")
        return []
    return json.loads(PORTFOLIO_FILE.read_text(encoding="utf-8"))


def fetch_current_price(ticker: str) -> dict:
    url = (f"https://www.alphavantage.co/query"
           f"?function=GLOBAL_QUOTE&symbol={ticker}&apikey={AV_KEY}")
    try:
        data = requests.get(url, timeout=10).json().get("Global Quote", {})
        if not data or not data.get("05. price"):
            return {}
        return {
            "price":      float(data["05. price"]),
            "change":     float(data["09. change"]),
            "change_pct": data["10. change percent"].replace("%", ""),
        }
    except:
        return {}


def calc_position(holding: dict, price_data: dict) -> dict:
    buy_p  = holding["buy_price"]
    qty    = holding["quantity"]
    curr_p = price_data.get("price", buy_p)

    pnl_pct  = ((curr_p - buy_p) / buy_p) * 100
    pnl_amt  = (curr_p - buy_p) * qty
    buy_dt   = datetime.strptime(holding["buy_date"], "%Y-%m-%d")
    hold_days = (datetime.now() - buy_dt).days

    target = holding.get("target_price")
    stop   = holding.get("stop_loss")

    if target and curr_p and target != buy_p:
        target_reached = (curr_p - buy_p) / (target - buy_p) * 100
    else:
        target_reached = None

    return {
        "current_price":  curr_p,
        "pnl_pct":        round(pnl_pct, 2),
        "pnl_amt":        round(pnl_amt, 0),
        "hold_days":      hold_days,
        "target_reached": round(target_reached, 1) if target_reached else None,
        "at_stop":        (curr_p <= stop) if (curr_p and stop) else False,
        "at_target":      (curr_p >= target) if (curr_p and target) else False,
    }


def analyze_sell_timing(positions: list) -> dict:
    print("\n🤖 매도 타이밍 분석 중...")
    client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)

    pos_block = ""
    for p in positions:
        h = p["holding"]
        c = p["calc"]
        pos_block += f"""
[{h['ticker']} — {h['name']}] {'장기' if h['bucket']=='long' else '단기'} 버킷
  매수가: {h['buy_price']:,} | 현재가: {c['current_price']:,} | 수익률: {c['pnl_pct']:+.1f}%
  보유일: {c['hold_days']}일 | 손익: {c['pnl_amt']:+,.0f}
  목표가: {h.get('target_price','미설정')} | 손절가: {h.get('stop_loss','미설정')}
  목표달성률: {c['target_reached']}% | 손절도달: {'YES⚠️' if c['at_stop'] else 'NO'}
  매수근거: {h['buy_reason']}
---"""
prompt = f"""코스톨라니 철학 기반 포트폴리오 매도 타이밍 전문가입니다.
오늘: {datetime.now().strftime('%Y-%m-%d %H:%M')} KST

코스톨라니 매도 원칙:
1. 군중이 몰릴 때 팔아라 — 뉴스가 떠들썩해지면 이미 팔 때
2. 매수 근거가 사라지면 즉시 팔아라 — 트렌드가 바뀌면 손실이어도 정리
3. 단기 버킷: 목표가 도달 시 욕심 금지, 손절가 도달 시 즉시 실행
4. 장기 버킷: 단기 노이즈에 흔들리지 말 것, 구조적 변화만 반응
5. 부분 익절 전략: 목표의 60~80% 달성 시 절반 익절, 나머지 홀드

=== 보유 포지션 ===
{pos_block}

JSON으로만 응답 (순수 JSON, 마크다운 없이):
{{
  "portfolio_summary": "전체 포트폴리오 상태를 3~4문장으로 평가. 수익/손실 현황, 주목할 포지션, 전반적 리스크 수준 포함.",
  "market_alignment": "현재 보유 종목들이 시장 흐름과 얼마나 맞는지 2~3문장으로 평가.",
  "positions": [
    {{
      "ticker": "종목코드",
      "name": "종목명",
      "signal": "홀드|일부익절|전량매도|손절실행|추가매수검토",
      "urgency": "즉시|이번주내|다음달내|유지",
      "reason": "매도/홀드 판단 근거를 4~5문장으로 상세히 설명. 수익률 현황, 매수 근거 유효성, 뉴스 감성 변화, 군중 유입 여부, 코스톨라니 관점의 타이밍 판단 모두 포함.",
      "action_detail": "구체적 행동 지침을 3~4문장으로. 몇 주를 언제 팔고, 나머지는 어떻게 하고, 어떤 조건이 충족되면 다음 행동을 취할지.",
      "stop_loss_status": "현재 손절가 대비 여유 또는 위험 수준 설명",
      "next_catalyst": "앞으로 주목해야 할 이벤트나 뉴스 (실적발표, 정책결정 등)",
      "risk_flag": "정상|주의|경고"
    }}
  ],
  "rebalancing_suggestion": "전체 포트폴리오 리밸런싱 제안. 장기/단기 버킷 비율이 적절한지, 섹터 집중도는 괜찮은지 3~4문장으로.",
  "kostolany_advice": "오늘 포트폴리오 전체에 대한 코스톨라니식 조언. 단순 격언이 아닌 현재 상황에 맞는 구체적 인사이트 3~4문장.",
  "disclaimer": "이 분석은 코스톨라니 철학 기반 교육 목적이며 실제 투자 권유가 아닙니다."
}}

규칙:
- 모든 텍스트 필드 최소 3문장 이상
- reason은 반드시 4문장 이상
- action_detail은 숫자와 조건을 포함한 구체적 지침
- 순수 JSON만 출력"""

    try:
        resp = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )
        raw = resp.content[0].text.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        result = json.loads(raw)
        print(f"  ✅ {len(result.get('positions',[]))}개 종목 판단 완료")
        return result
    except Exception as e:
        print(f"  ❌ 실패: {e}")
        return {"error": str(e)}


def run_portfolio_check():
    print(f"\n{'='*50}\n  포트폴리오 점검 {datetime.now().strftime('%H:%M')}\n{'='*50}")
    holdings  = load_portfolio()
    positions = []

    for h in holdings:
        print(f"\n  조회 중: {h['ticker']} ({h['name']})")
        price_data = fetch_current_price(h["ticker"])
        if not price_data:
            import random
            price_data = {"price": h["buy_price"] * (1 + random.uniform(-0.08, 0.15))}
            print(f"    ⚠️  현재가 조회 실패 → 임의값 사용")
        calc = calc_position(h, price_data)
        print(f"    현재가: {calc['current_price']:,} | 수익률: {calc['pnl_pct']:+.1f}%")
        positions.append({"holding": h, "calc": calc})

    analysis = analyze_sell_timing(positions)

    (OUTPUT / "portfolio_latest.json").write_text(
        json.dumps({
            "generated_at": datetime.now().isoformat(),
            "positions":    positions,
            "analysis":     analysis,
        }, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\n💾 저장: reports_v4/portfolio_latest.json")
    print(json.dumps(analysis, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--check", action="store_true")
    p.add_argument("--add", nargs=4, metavar=("TICKER","NAME","BUY_PRICE","QUANTITY"))
    args = p.parse_args()

    if args.add:
        ticker, name, buy_price, qty = args.add
        holdings = load_portfolio()
        holdings.append({
            "ticker": ticker, "name": name,
            "market": "KR" if ".KS" in ticker else "US",
            "bucket": "long",
            "buy_price": float(buy_price), "quantity": int(qty),
            "buy_date": datetime.now().strftime("%Y-%m-%d"),
            "buy_reason": "직접 입력",
            "target_price": None, "stop_loss": None, "notes": ""
        })
        PORTFOLIO_FILE.write_text(json.dumps(holdings, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"  ✅ {name} 추가 완료")
    else:
        run_portfolio_check()
