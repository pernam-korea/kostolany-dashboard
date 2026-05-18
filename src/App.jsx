import { useState, useEffect } from "react";

const SAMPLE_KR = {
  generated_at: new Date().toISOString(),
  market: "KR",
  stats: { total: 7, fresh: 2, short: 3, long: 5 },
  analysis: {
    session_note: "폴란드 SMR 입찰 초기 신호 포착. SK하이닉스 HBM4 계약 연장 확인. 전력기기 수주 모멘텀 지속 중. 카카오는 어닝 쇼크 우려로 관망 필요.",
    macro_context: "미 연준 금리 동결 기조 유지로 성장주에 유리한 환경. 원달러 환율 1,380원대로 수출주 수혜. 지정학 리스크는 안정적이나 중국 경기 둔화는 변수.",
    long_bucket: {
      allocation: "70~80%", theme: "원전 르네상스 + AI 전력 인프라",
      theme_description: "AI 데이터센터의 전력 수요 폭증과 탄소중립 정책이 맞물리며 원전이 유일한 대안으로 부상하고 있습니다.",
      picks: [
        { ticker: "034020", name: "두산에너빌리티", sector: "원전 기자재",
          hold_period: "12~24개월", entry_strategy: "분할매수",
          entry_detail: "3회 분할 — 1차 현재가, 2차 -5%, 3차 -10%",
          stop_loss: "-15% 시 재검토",
          rationale: "폴란드 SMR 6기 입찰 공식 제출 소식이 니케이 단독 보도로 포착됐으며 국내 증권사는 아직 미반영 상태입니다. 체코 본계약 확정이 임박해 추가 모멘텀이 예상됩니다. 코스톨라니 관점에서 군중이 아직 모르는 초기 신호 단계로 선점 기회입니다. SMR 글로벌 수주 사이클은 최소 10년 이상 지속될 구조적 트렌드입니다.",
          news_source: "Nikkei 단독 보도 (발행 2시간 이내)",
          upside_scenario: "체코 본계약 + 폴란드 수주 시 목표가 38,000원",
          risk_scenario: "계약 지연 또는 경쟁사 수주 시 조정 가능",
          confidence: 87 },
        { ticker: "267260", name: "HD현대일렉트릭", sector: "변압기",
          hold_period: "12~18개월", entry_strategy: "분할매수",
          entry_detail: "2회 분할 — 1차 현재가, 2차 -7%",
          stop_loss: "없음 (장기보유)",
          rationale: "미 전력망 현대화법 통과로 10년간 $400B 투자 사이클이 시작됐습니다. 북미 변압기 수주잔고가 2년치를 초과해 실적 가시성이 매우 높습니다. 군중은 여전히 중공업주로 분류해 저평가 상태입니다. 코스톨라니가 말한 대중이 오해할 때 사라의 전형적인 케이스입니다.",
          news_source: "Reuters — US Grid Modernization Act",
          upside_scenario: "미국 추가 수주 발표 시 신고가 경신",
          risk_scenario: "미국 관세 정책 변화 시 수익성 압박",
          confidence: 88 },
      ]
    },
    short_bucket: {
      allocation: "20~30%",
      warning: "단기 버킷은 전체 자산의 20~30% 이내로 제한하세요. 한 종목에 버킷의 50% 이상 집중은 절대 금지입니다.",
      picks: [
        { ticker: "034020", name: "두산에너빌리티",
          trigger: "폴란드 SMR 입찰 단독 보도 — 국내 미반영",
          trigger_detail: "니케이 단독 보도 후 2시간 이내 포착된 초기 신호입니다. 국내 증권사 리포트가 나오기 전 선점 가능한 창이 열려 있습니다. 뉴스 확산 시 단기 급등 모멘텀이 예상됩니다.",
          expected_move: "+5~8% / 3~7일", risk_level: "높음",
          entry_window: "장 초반 09:00~09:30", entry_price: "현재가 시장가 진입",
          stop_loss: "-5% 손절", exit_signal: "주요 언론 보도 확산 후 or +7% 달성 시 전량 청산",
          confidence: 72 },
      ]
    },
    avoid_now: [
      { name: "카카오 (035720)", reason: "2분기 영업이익이 컨센서스를 27% 하회할 것으로 예상됩니다. 광고 매출 부진과 AI 전환 비용 증가가 겹쳐 실적 발표 전까지 매물 압력이 지속될 전망입니다." },
    ],
    early_signals: [
      { signal: "두산에너빌리티 폴란드 SMR 입찰 공식 제출",
        detail: "니케이 단독 보도로 발행 2시간 이내 포착됐습니다. 국내 증권사 리포트가 아직 없어 시장이 미반영 상태입니다.",
        related_stocks: "034020 두산에너빌리티, 010120 LS일렉트릭", time_window: "2~3주" }
    ],
    kostolany_today: "오늘 포착된 초기 신호는 전형적인 코스톨라니식 기회입니다. 군중이 아직 모르고, 뉴스가 막 나왔으며, 주가는 미반영 상태입니다. 단, 초기 신호는 항상 불확실성을 동반하므로 전체 자산의 5~10% 이내로 소량 진입 후 확인하는 것이 원칙입니다.",
    disclaimer: "이 분석은 코스톨라니 철학 기반 교육 목적이며 실제 투자 권유가 아닙니다."
  }
};

const SAMPLE_US = {
  generated_at: new Date().toISOString(),
  market: "US",
  stats: { total: 8, fresh: 2, short: 3, long: 5 },
  analysis: {
    session_note: "FDA 우선심사 초기 신호(LLY) 포착. 미 전력망법 통과로 GEV·VST 장기 수혜 확인. 엔비디아 HBM4 공급망 확대 뉴스가 MU 수혜로 연결될 가능성.",
    macro_context: "미 연준 금리 동결 기조 유지. 달러 강세 지속으로 수출 기업 실적 압박. AI 인프라 투자 사이클은 금리 환경과 무관하게 지속 중.",
    long_bucket: {
      allocation: "70~80%", theme: "AI 전력 인프라 + 비만치료제 슈퍼사이클",
      theme_description: "AI 데이터센터 전력 수요가 폭발적으로 증가하며 전력기기·원전 기업이 최대 수혜를 받고 있습니다. 동시에 비만치료제 시장은 글로벌 슈퍼사이클 초입으로 Eli Lilly가 독점적 지위를 구축 중입니다.",
      picks: [
        { ticker: "VST", name: "Vistra Energy", sector: "전력/원전",
          hold_period: "12~36개월", entry_strategy: "분할매수",
          entry_detail: "3회 분할 — 1차 현재가, 2차 -5%, 3차 -10%",
          stop_loss: "없음 (장기보유)",
          rationale: "AI 데이터센터향 장기 전력 PPA 계약을 다수 체결했습니다. 원전과 가스발전 포트폴리오로 안정적 수급이 가능합니다. 군중은 아직 유틸리티주로 분류해 성장주 프리미엄을 부여하지 않고 있습니다. 코스톨라니 관점에서 대중이 오해하는 종목의 전형입니다.",
          news_source: "Reuters — AI 데이터센터 전력 PPA",
          upside_scenario: "추가 PPA 계약 발표 시 신고가 경신",
          risk_scenario: "전력 규제 변화 또는 원전 허가 지연",
          confidence: 84 },
        { ticker: "LLY", name: "Eli Lilly", sector: "비만/당뇨 신약",
          hold_period: "18~36개월", entry_strategy: "분할매수",
          entry_detail: "2회 분할 — 1차 현재가, 2차 -8%",
          stop_loss: "없음 (장기보유)",
          rationale: "비만치료제 글로벌 시장을 사실상 독점하고 있습니다. NASH 적응증 우선심사로 시장 확대가 가속화될 전망입니다. 파이프라인이 풍부해 향후 5년간 신약 출시가 지속됩니다. 노령화 슈퍼사이클과 맞물려 구조적 성장이 보장된 종목입니다.",
          news_source: "STAT News — FDA 우선심사 부여",
          upside_scenario: "NASH 승인 + 추가 적응증 확대 시 목표가 $1,000",
          risk_scenario: "경쟁사 신약 등장 또는 가격 규제 강화",
          confidence: 86 },
      ]
    },
    short_bucket: {
      allocation: "20~30%",
      warning: "단기 버킷은 전체 자산의 20~30% 이내로 제한하세요. 한 종목에 버킷의 50% 이상 집중은 절대 금지입니다.",
      picks: [
        { ticker: "LLY", name: "Eli Lilly",
          trigger: "FDA 우선심사 부여 — 6개월 내 승인 기대",
          trigger_detail: "FDA 우선심사 뉴스가 발행 2시간 이내 포착됐습니다. 주가가 아직 미반영 상태로 장 초반 갭 상승 가능성이 높습니다. 승인 기대감이 확산되기 전 선점 가능한 창이 열려 있습니다.",
          expected_move: "+4~7% / 3~5일", risk_level: "보통",
          entry_window: "22:30~23:00", entry_price: "현재가 시장가 진입",
          stop_loss: "-5% 손절", exit_signal: "뉴스 확산 후 or +6% 달성 시 절반 익절",
          confidence: 74 },
      ]
    },
    avoid_now: [
      { name: "TSLA (롱 포지션)", reason: "2분기 딜리버리가 컨센서스를 10% 이상 하회하며 추가 하락 압력이 지속되고 있습니다. 반등 시마다 매물이 출회되는 패턴으로 단기 롱 포지션은 위험합니다." },
    ],
    early_signals: [
      { signal: "LLY FDA 우선심사 — 주요 미디어 미확산",
        detail: "STAT News 단독 보도로 발행 2시간 이내 포착됐습니다. 주요 금융 미디어가 아직 보도하지 않아 주가 미반영 상태입니다.",
        related_stocks: "LLY Eli Lilly", time_window: "1~2일" }
    ],
    kostolany_today: "FDA 소식은 빠르게 움직입니다. 초기 신호를 잡았다면 소량 진입 후 확인하는 것이 원칙입니다. 손절가를 반드시 설정하고 목표 달성 시 욕심을 부리지 마세요.",
    disclaimer: "이 분석은 코스톨라니 철학 기반 교육 목적이며 실제 투자 권유가 아닙니다."
  }
};

const SAMPLE_PORTFOLIO = {
  generated_at: new Date().toISOString(),
  positions: [
    { holding: { ticker: "000660.KS", name: "SK하이닉스", bucket: "long",
        buy_price: 178000, quantity: 10, buy_date: "2025-01-15",
        target_price: 230000, stop_loss: 155000, buy_reason: "HBM 공급 부족 구조적 수혜" },
      calc: { current_price: 198500, pnl_pct: 11.5, pnl_amt: 205000,
        hold_days: 84, target_reached: 38.9, at_stop: false, at_target: false } },
    { holding: { ticker: "NVDA", name: "NVIDIA", bucket: "long",
        buy_price: 480.0, quantity: 5, buy_date: "2024-10-20",
        target_price: 700.0, stop_loss: 400.0, buy_reason: "AI 인프라 슈퍼사이클" },
      calc: { current_price: 875.0, pnl_pct: 82.3, pnl_amt: 1975.0,
        hold_days: 117, target_reached: 177.3, at_stop: false, at_target: true } },
  ],
  analysis: {
    portfolio_summary: "NVDA가 목표가를 77% 초과 달성해 즉시 익절이 필요한 상황입니다. SK하이닉스는 안정적인 수익 구간으로 홀드 유지가 적절합니다.",
    market_alignment: "현재 보유 종목 모두 AI 인프라 슈퍼사이클 테마와 정렬돼 있습니다. NVDA 익절 후 에너지·바이오 섹터로 일부 분산을 검토할 시점입니다.",
    positions: [
      { ticker: "000660.KS", signal: "홀드", urgency: "유지",
        reason: "HBM4 엔비디아 독점 공급 지위가 유지되고 있으며 매수 근거가 완전히 유효합니다. 목표가 대비 38.9% 달성 수준으로 아직 인내가 필요한 구간입니다.",
        action_detail: "전량 홀드를 유지합니다. 다음 분기 실적 발표 시 HBM 매출 비중이 50% 미만으로 나오면 목표가를 하향 조정하고 일부 익절을 검토하세요.",
        stop_loss_status: "현재가 198,500원 대비 손절가 155,000원까지 22% 여유. 안전 구간.",
        next_catalyst: "다음 분기 실적 발표 — HBM 매출 비중 확인 필요",
        risk_flag: "정상" },
      { ticker: "NVDA", signal: "전량매도", urgency: "즉시",
        reason: "목표가 $700 대비 현재가 $875로 25% 초과 달성했습니다. AI 칩 낙관론이 주요 미디어 주류로 올라섰고 개인 투자자 유입이 급증하고 있습니다.",
        action_detail: "오늘 장 초반 전량 매도를 실행하세요. 수익금의 70%는 장기 버킷 재투자에 사용하고 30%는 단기 버킷 시드로 전환하세요.",
        stop_loss_status: "목표가 초과 달성. 즉시 익절이 우선.",
        next_catalyst: "GB300 출하 본격화 — 조정 후 재진입 타이밍 모니터링",
        risk_flag: "경고" },
    ],
    rebalancing_suggestion: "현재 포트폴리오가 AI 테마에 집중돼 있어 섹터 리스크가 높습니다. NVDA 익절 후 바이오나 전력기기 등 다른 섹터로 20~30% 분산을 권장합니다.",
    kostolany_advice: "NVDA는 지금 팔아야 합니다. 82%의 수익은 다시 오지 않을 수 있습니다. 최고점에서 파는 것은 신만 할 수 있고, 현명한 투자자는 충분히 올랐을 때 팝니다.",
    disclaimer: "이 분석은 코스톨라니 철학 기반 교육 목적이며 실제 투자 권유가 아닙니다."
  }
};

const SIGNAL_CFG = {
  "홀드":         { color: "#78909c", bg: "rgba(120,144,156,0.12)", icon: "━", priority: 4 },
  "추가매수검토": { color: "#00e676", bg: "rgba(0,230,118,0.12)",  icon: "▲", priority: 3 },
  "일부익절":     { color: "#ffd54f", bg: "rgba(255,213,79,0.15)",  icon: "◐", priority: 2 },
  "전량매도":     { color: "#ff5252", bg: "rgba(255,82,82,0.15)",   icon: "▼", priority: 1 },
  "손절실행":     { color: "#ff1744", bg: "rgba(255,23,68,0.15)",   icon: "✕", priority: 0 },
};

const RISK_CFG = {
  "보통":     { color: "#ffd54f" },
  "높음":     { color: "#ff7043" },
  "매우높음": { color: "#ff1744" },
};

function StatBadge({ label, value, color }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: color || "#e8e6df", fontFamily: "monospace", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#5a5650", marginTop: 4 }}>{label}</div>
    </div>
  );
}

function AlertBanner({ positions, analysisMap }) {
  const alerts = positions.filter(p => {
    const sig = analysisMap[p.holding.ticker]?.signal;
    return sig === "전량매도" || sig === "손절실행";
  });
  if (!alerts.length) return null;
  return (
    <div style={{ background: "rgba(255,23,68,0.1)", border: "2px solid rgba(255,23,68,0.4)",
      borderRadius: 10, padding: "14px 18px", marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#ff1744", marginBottom: 8 }}>🚨 즉시 조치 필요</div>
      {alerts.map((p, i) => (
        <div key={i} style={{ fontSize: 13, color: "#ff8a80", marginBottom: 4 }}>
          • <strong>{p.holding.name}</strong> — {analysisMap[p.holding.ticker]?.action_detail?.slice(0, 60)}...
        </div>
      ))}
    </div>
  );
}

function LongCard({ pick }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(o => !o)} style={{
      border: `1px solid ${open ? "rgba(0,230,118,0.4)" : "rgba(0,230,118,0.15)"}`,
      borderLeft: "4px solid #00e676",
      background: open ? "rgba(0,230,118,0.07)" : "rgba(255,255,255,0.02)",
      borderRadius: 10, padding: "16px 18px", cursor: "pointer", marginBottom: 10, transition: "all 0.2s"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace" }}>{pick.ticker}</span>
            <span style={{ fontSize: 15, fontWeight: 500 }}>{pick.name}</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "#00e676", background: "rgba(0,230,118,0.1)", padding: "2px 8px", borderRadius: 6 }}>{pick.sector}</span>
            <span style={{ fontSize: 11, color: "#9a9488", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 6 }}>📅 {pick.hold_period}</span>
            <span style={{ fontSize: 11, color: "#9a9488", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 6 }}>진입: {pick.entry_strategy}</span>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#00e676", fontFamily: "monospace", lineHeight: 1 }}>{pick.confidence}%</div>
          <div style={{ fontSize: 10, color: "#5a5650", marginTop: 2 }}>신뢰도</div>
        </div>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginBottom: 10 }}>
        <div style={{ width: `${pick.confidence}%`, height: "100%", background: "#00e676", borderRadius: 2 }} />
      </div>
      <div style={{ fontSize: 13, color: "#9a9488", lineHeight: 1.7 }}>
        {pick.rationale?.slice(0, 80)}... <span style={{ color: "#5a5650" }}>{open ? "▲ 접기" : "▼ 더보기"}</span>
      </div>
      {open && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <Section title="📌 투자 근거" content={pick.rationale} />
          <Section title="📰 뉴스 출처" content={pick.news_source} />
          <Section title="📈 진입 전략" content={pick.entry_detail} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            <MiniCard title="✅ 상승 시나리오" content={pick.upside_scenario} color="#00e676" />
            <MiniCard title="⚠️ 하락 시나리오" content={pick.risk_scenario} color="#ff7043" />
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "#ff8a80", fontFamily: "monospace" }}>
            ✂️ 손절: {pick.stop_loss}
          </div>
        </div>
      )}
    </div>
  );
}

function ShortCard({ pick }) {
  const [open, setOpen] = useState(false);
  const rc = RISK_CFG[pick.risk_level] || RISK_CFG["보통"];
  return (
    <div onClick={() => setOpen(o => !o)} style={{
      border: `1px solid ${rc.color}30`, borderLeft: `4px solid ${rc.color}`,
      background: open ? `${rc.color}0d` : "rgba(255,255,255,0.02)",
      borderRadius: 10, padding: "16px 18px", cursor: "pointer", marginBottom: 10, transition: "all 0.2s"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace" }}>{pick.ticker}</span>
            <span style={{ fontSize: 15, fontWeight: 500 }}>{pick.name}</span>
            <span style={{ fontSize: 11, color: rc.color, background: `${rc.color}20`, padding: "2px 8px", borderRadius: 6 }}>위험 {pick.risk_level}</span>
          </div>
          <div style={{ fontSize: 13, color: "#9a9488" }}>{pick.trigger}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#69f0ae", fontFamily: "monospace", lineHeight: 1 }}>{pick.expected_move.split('/')[0]}</div>
          <div style={{ fontSize: 11, color: "#5a5650", marginTop: 2 }}>{pick.expected_move.split('/')[1]}</div>
        </div>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginBottom: 10 }}>
        <div style={{ width: `${pick.confidence}%`, height: "100%", background: rc.color, borderRadius: 2 }} />
      </div>
      <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
        <span style={{ color: "#5a5650" }}>진입: <strong style={{ color: "#e8e6df" }}>{pick.entry_window}</strong></span>
        <span style={{ color: "#ff5252" }}>손절: <strong>{pick.stop_loss.split('(')[0]}</strong></span>
      </div>
      {open && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <Section title="💡 진입 근거" content={pick.trigger_detail} />
          <Section title="🎯 진입가" content={pick.entry_price} />
          <Section title="🚪 익절/청산" content={pick.exit_signal} />
        </div>
      )}
    </div>
  );
}

function PortfolioCard({ position, analysisMap }) {
  const [open, setOpen] = useState(false);
  const h = position.holding;
  const c = position.calc;
  const a = analysisMap[h.ticker] || {};
  const sig = SIGNAL_CFG[a.signal] || SIGNAL_CFG["홀드"];
  const isUrgent = a.urgency === "즉시";
  return (
    <div onClick={() => setOpen(o => !o)} style={{
      border: `${isUrgent ? "2px" : "1px"} solid ${isUrgent ? sig.color : "rgba(255,255,255,0.08)"}`,
      borderLeft: `4px solid ${sig.color}`,
      background: "rgba(255,255,255,0.02)", borderRadius: 10,
      padding: "16px 18px", cursor: "pointer", marginBottom: 10, transition: "all 0.2s"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>{h.name}</span>
            <span style={{ fontSize: 12, fontFamily: "monospace", color: "#5a5650" }}>{h.ticker}</span>
            <span style={{ fontSize: 11, color: h.bucket === "long" ? "#00e676" : "#ffd54f",
              background: h.bucket === "long" ? "rgba(0,230,118,0.1)" : "rgba(255,213,79,0.1)",
              padding: "2px 8px", borderRadius: 6 }}>
              {h.bucket === "long" ? "📈 장기" : "⚡ 단기"}
            </span>
            <span style={{ fontSize: 11, color: "#5a5650" }}>{c.hold_days}일 보유</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, Math.abs(c.pnl_pct) * 1.5)}%`, height: "100%",
                background: c.pnl_pct >= 0 ? "#00e676" : "#ff5252", borderRadius: 4 }} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "monospace", minWidth: 70,
              color: c.pnl_pct >= 0 ? "#00e676" : "#ff5252" }}>
              {c.pnl_pct >= 0 ? "+" : ""}{c.pnl_pct.toFixed(1)}%
            </span>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 12, flexWrap: "wrap" }}>
            <span style={{ color: "#5a5650" }}>매수 <strong style={{ color: "#e8e6df" }}>{h.buy_price.toLocaleString()}</strong></span>
            <span style={{ color: "#5a5650" }}>현재 <strong style={{ color: "#e8e6df" }}>{c.current_price.toLocaleString()}</strong></span>
            <span style={{ color: "#5a5650" }}>손익 <strong style={{ color: c.pnl_amt >= 0 ? "#00e676" : "#ff5252" }}>{c.pnl_amt >= 0 ? "+" : ""}{c.pnl_amt.toLocaleString()}</strong></span>
            {c.target_reached && <span style={{ color: "#5a5650" }}>목표달성 <strong style={{ color: c.target_reached > 100 ? "#ffd54f" : "#e8e6df" }}>{c.target_reached}%</strong></span>}
          </div>
        </div>
        <div style={{ marginLeft: 16, flexShrink: 0, textAlign: "right" }}>
          <div style={{ fontSize: 22, color: sig.color, marginBottom: 4 }}>{sig.icon}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: sig.color, background: sig.bg,
            padding: "6px 12px", borderRadius: 8, border: `1px solid ${sig.color}40` }}>
            {a.signal || "홀드"}
          </div>
          <div style={{ fontSize: 11, color: sig.color, marginTop: 4, fontFamily: "monospace" }}>{a.urgency}</div>
        </div>
      </div>
      {open && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <Section title="📋 행동 지침" content={a.action_detail} highlight />
          <Section title="💬 판단 근거" content={a.reason} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            <MiniCard title="🔔 다음 이벤트" content={a.next_catalyst} color="#c8a84b" />
            <MiniCard title="✂️ 손절 현황" content={a.stop_loss_status} color={c.at_stop ? "#ff1744" : "#00e676"} />
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, content, highlight }) {
  if (!content) return null;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, color: "#c8a84b", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: highlight ? "#e8e6df" : "#b8b0a4", lineHeight: 1.8,
        background: highlight ? "rgba(200,168,75,0.08)" : "transparent",
        padding: highlight ? "10px 12px" : "0", borderRadius: highlight ? 6 : 0,
        border: highlight ? "1px solid rgba(200,168,75,0.2)" : "none" }}>
        {content}
      </div>
    </div>
  );
}

function MiniCard({ title, content, color }) {
  if (!content) return null;
  return (
    <div style={{ background: `${color}0d`, border: `1px solid ${color}25`, borderRadius: 8, padding: "10px 12px" }}>
      <div style={{ fontSize: 11, color, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: "#9a9488", lineHeight: 1.6 }}>{content}</div>
    </div>
  );
}

export default function App() {
  const [tab, setTab]       = useState("KR");
  const [krData, setKrData] = useState(SAMPLE_KR);
  const [usData, setUsData] = useState(SAMPLE_US);
  const [pfData, setPfData] = useState(SAMPLE_PORTFOLIO);

  useEffect(() => {
    fetch('/reports_v4/latest_kr.json').then(r => r.json()).then(d => { if (d.analysis) setKrData(d); }).catch(() => {});
    fetch('/reports_v4/latest_us.json').then(r => r.json()).then(d => { if (d.analysis) setUsData(d); }).catch(() => {});
    fetch('/reports_v4/portfolio_latest.json').then(r => r.json()).then(d => { if (d.analysis) setPfData(d); }).catch(() => {});
  }, []);

  const currentData = tab === "US" ? usData : krData;
  const a = currentData?.analysis;
  const analysisMap = Object.fromEntries((pfData?.analysis?.positions || []).map(p => [p.ticker, p]));

  const TABS = [
    { id: "KR", label: "🌅 한국장", sub: "07:00" },
    { id: "US", label: "🌆 미국장", sub: "20:00" },
    { id: "PF", label: "💼 포트폴리오", sub: "08:00" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#07090e", color: "#e8e6df", fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(200,168,75,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(200,168,75,0.02) 1px,transparent 1px)",
        backgroundSize: "48px 48px" }} />
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 16px 80px", position: "relative" }}>

        {/* 헤더 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontFamily: "monospace", color: "#c8a84b", letterSpacing: "0.3em", marginBottom: 6 }}>KOSTOLANY INVESTMENT SYSTEM</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>코스톨라니 투자 대시보드</h1>
            <div style={{ fontSize: 11, color: "#5a5650", fontFamily: "monospace" }}>{new Date().toLocaleString("ko-KR")}</div>
          </div>
        </div>

        {/* 탭 */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, background: tab === t.id ? "rgba(200,168,75,0.15)" : "rgba(255,255,255,0.03)",
              border: tab === t.id ? "1px solid rgba(200,168,75,0.4)" : "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10, padding: "12px 8px", cursor: "pointer",
              color: tab === t.id ? "#c8a84b" : "#5a5650", transition: "all 0.15s", textAlign: "center"
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{t.label}</div>
              <div style={{ fontSize: 10, opacity: 0.7, fontFamily: "monospace" }}>{t.sub} KST</div>
            </button>
          ))}
        </div>

        {/* 한국장 / 미국장 */}
        {(tab === "KR" || tab === "US") && a && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
              <StatBadge label="전체 뉴스" value={currentData.stats.total} />
              <StatBadge label="🆕 초기신호" value={currentData.stats.fresh} color="#ff9800" />
              <StatBadge label="⚡ 단기" value={currentData.stats.short} color="#69f0ae" />
              <StatBadge label="📈 장기" value={currentData.stats.long} color="#00e676" />
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "#c8a84b", fontFamily: "monospace", marginBottom: 8 }}>오늘의 시장 흐름</div>
              <p style={{ margin: "0 0 10px", fontSize: 14, color: "#b8b0a4", lineHeight: 1.8 }}>{a.session_note}</p>
              {a.macro_context && (
                <>
                  <div style={{ fontSize: 11, color: "#5a5650", fontFamily: "monospace", margin: "10px 0 6px" }}>거시경제 배경</div>
                  <p style={{ margin: 0, fontSize: 13, color: "#7a7068", lineHeight: 1.7 }}>{a.macro_context}</p>
                </>
              )}
            </div>

            {a.early_signals?.length > 0 && (
              <div style={{ background: "rgba(255,152,0,0.08)", border: "1px solid rgba(255,152,0,0.3)",
                borderRadius: 10, padding: "14px 18px", marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#ff9800", fontWeight: 600, marginBottom: 10 }}>🆕 초기 신호 — 군중이 아직 모른다</div>
                {a.early_signals.map((s, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 14, color: "#e8e6df", fontWeight: 500, marginBottom: 4 }}>{s.signal}</div>
                    <div style={{ fontSize: 13, color: "#9a9488", lineHeight: 1.7, marginBottom: 6 }}>{s.detail}</div>
                    <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#5a5650" }}>
                      <span>관련: <strong style={{ color: "#ff9800" }}>{s.related_stocks}</strong></span>
                      <span>선점 기간: <strong style={{ color: "#ff9800" }}>{s.time_window}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>📈 장기 버킷</span>
                <span style={{ fontSize: 12, color: "#5a5650", fontFamily: "monospace" }}>{a.long_bucket.allocation}</span>
              </div>
              <div style={{ fontSize: 13, color: "#c8a84b", marginBottom: 6 }}>{a.long_bucket.theme}</div>
              <div style={{ fontSize: 13, color: "#7a7068", lineHeight: 1.7, marginBottom: 12 }}>{a.long_bucket.theme_description}</div>
              {a.long_bucket.picks.map((p, i) => <LongCard key={i} pick={p} />)}
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>⚡ 단기 버킷</span>
                <span style={{ fontSize: 12, color: "#5a5650", fontFamily: "monospace" }}>{a.short_bucket.allocation}</span>
              </div>
              <div style={{ fontSize: 12, color: "#ff8a80", background: "rgba(255,82,82,0.06)",
                border: "1px solid rgba(255,82,82,0.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
                ⚠️ {a.short_bucket.warning}
              </div>
              {a.short_bucket.picks.map((p, i) => <ShortCard key={i} pick={p} />)}
            </div>

            {a.avoid_now?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>⛔ 현재 회피</div>
                {a.avoid_now.map((av, i) => (
                  <div key={i} style={{ borderLeft: "4px solid #ff5252", background: "rgba(255,82,82,0.05)",
                    borderRadius: "0 10px 10px 0", padding: "12px 16px", marginBottom: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#ff8a80", marginBottom: 6 }}>{av.name}</div>
                    <div style={{ fontSize: 13, color: "#9a9488", lineHeight: 1.7 }}>{av.reason}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background: "rgba(200,168,75,0.07)", border: "1px solid rgba(200,168,75,0.2)",
              borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ fontSize: 11, color: "#c8a84b", fontFamily: "monospace", marginBottom: 10, letterSpacing: "0.15em" }}>🎩 오늘의 코스톨라니</div>
              <p style={{ margin: 0, fontSize: 14, color: "#b8b0a4", lineHeight: 1.9, fontStyle: "italic" }}>"{a.kostolany_today}"</p>
            </div>
          </>
        )}

        {/* 포트폴리오 */}
        {tab === "PF" && (
          <>
            <AlertBanner positions={pfData.positions} analysisMap={analysisMap} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
              <StatBadge label="총 평가손익"
                value={`${pfData.positions.reduce((s,p)=>s+p.calc.pnl_amt,0)>=0?"+":""}${pfData.positions.reduce((s,p)=>s+p.calc.pnl_amt,0).toLocaleString()}`}
                color={pfData.positions.reduce((s,p)=>s+p.calc.pnl_amt,0)>=0?"#00e676":"#ff5252"} />
              <StatBadge label="보유 종목" value={`${pfData.positions.length}개`} />
              <StatBadge label="즉시 조치"
                value={`${pfData.positions.filter(p=>analysisMap[p.holding.ticker]?.urgency==="즉시").length}개`}
                color={pfData.positions.filter(p=>analysisMap[p.holding.ticker]?.urgency==="즉시").length>0?"#ff5252":"#00e676"} />
            </div>

            <div style={{ background: "rgba(200,168,75,0.06)", border: "1px solid rgba(200,168,75,0.18)",
              borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "#c8a84b", fontFamily: "monospace", marginBottom: 8 }}>포트폴리오 진단</div>
              <p style={{ margin: "0 0 10px", fontSize: 14, color: "#b8b0a4", lineHeight: 1.8 }}>{pfData.analysis.portfolio_summary}</p>
              {pfData.analysis.market_alignment && (
                <p style={{ margin: "0 0 10px", fontSize: 13, color: "#7a7068", lineHeight: 1.7 }}>{pfData.analysis.market_alignment}</p>
              )}
              <p style={{ margin: 0, fontSize: 13, color: "#9a8848", fontStyle: "italic", lineHeight: 1.7 }}>"{pfData.analysis.kostolany_advice}"</p>
            </div>

            <div style={{ fontSize: 12, color: "#5a5650", marginBottom: 10, fontFamily: "monospace" }}>조치 우선순위 순 · 카드 클릭 시 상세</div>
            {[...pfData.positions]
              .sort((a, b) => {
                const order = { "즉시": 0, "이번주내": 1, "다음달내": 2, "유지": 3 };
                return (order[analysisMap[a.holding.ticker]?.urgency] ?? 3) - (order[analysisMap[b.holding.ticker]?.urgency] ?? 3);
              })
              .map((pos, i) => <PortfolioCard key={i} position={pos} analysisMap={analysisMap} />)
            }

            {pfData.analysis.rebalancing_suggestion && (
              <div style={{ marginTop: 16, background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 18px" }}>
                <div style={{ fontSize: 11, color: "#5a5650", fontFamily: "monospace", marginBottom: 8 }}>리밸런싱 제안</div>
                <p style={{ margin: 0, fontSize: 13, color: "#9a9488", lineHeight: 1.8 }}>{pfData.analysis.rebalancing_suggestion}</p>
              </div>
            )}
          </>
        )}

        <div style={{ marginTop: 32, fontSize: 11, color: "#3a3830", textAlign: "center", lineHeight: 1.6 }}>
          {a?.disclaimer || pfData?.analysis?.disclaimer}
        </div>
      </div>
    </div>
  );
}
