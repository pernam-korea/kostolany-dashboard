import { useState, useEffect } from "react";

const SAMPLE_KR = {
  generated_at: new Date().toISOString(),
  market: "KR",
  stats: { total: 7, fresh: 2, short: 3, long: 5 },
  analysis: {
    session_note: "폴란드 SMR 입찰 초기 신호 포착. 전력기기 수주 모멘텀 지속.",
    long_bucket: {
      allocation: "70~80%",
      theme: "원전 르네상스 + AI 전력 인프라",
      picks: [
        { ticker: "034020", name: "두산에너빌리티", sector: "원전 기자재",
          hold_period: "12~24개월", entry_strategy: "분할매수",
          stop_loss: "-15% 시 재검토",
          rationale: "폴란드 SMR 입찰 초기 신호. 체코 본계약 임박.",
          confidence: 87 },
        { ticker: "267260", name: "HD현대일렉트릭", sector: "변압기",
          hold_period: "12~18개월", entry_strategy: "분할매수",
          stop_loss: "없음 (장기보유)",
          rationale: "미 전력망 현대화 10년 사이클 직접 수혜.",
          confidence: 88 },
        { ticker: "000660", name: "SK하이닉스", sector: "HBM/메모리",
          hold_period: "6~12개월", entry_strategy: "분할매수",
          stop_loss: "-15% 시 재검토",
          rationale: "HBM4 엔비디아 독점 공급 지위 확인.",
          confidence: 85 },
      ]
    },
    short_bucket: {
      allocation: "20~30%",
      warning: "한 종목에 버킷의 50% 이상 집중 금지. 손절 라인 반드시 준수.",
      picks: [
        { ticker: "034020", name: "두산에너빌리티",
          trigger: "폴란드 SMR 입찰 단독 보도 — 미반영",
          expected_move: "+5~8% / 3~7일", risk_level: "높음",
          entry_window: "09:00~09:30",
          stop_loss: "-5% 손절",
          exit_signal: "주요 언론 보도 후 or +7% 달성",
          confidence: 72 },
        { ticker: "010120", name: "LS일렉트릭",
          trigger: "미 전력망법 통과 — 국내 수혜 미반영",
          expected_move: "+3~5% / 5~7일", risk_level: "보통",
          entry_window: "09:00~10:00",
          stop_loss: "-5% 손절",
          exit_signal: "+5% 달성 시",
          confidence: 68 },
      ]
    },
    avoid_now: [
      { name: "카카오", reason: "2Q 어닝 쇼크 우려. 실적 발표 전 관망." },
      { name: "에코프로·포스코퓨처엠", reason: "EV 캐즘 장기화. 반등 시 매물 출회." },
    ],
    kostolany_today: "초기 신호를 장기 종목에서 발견했다면, 단기 버킷으로도 소량 편승할 수 있다. 단, 손절 라인 없이 들어가는 것은 투기가 아닌 도박이다.",
    disclaimer: "이 분석은 교육 목적이며 실제 투자 권유가 아닙니다."
  }
};

const SAMPLE_US = {
  generated_at: new Date().toISOString(),
  market: "US",
  stats: { total: 8, fresh: 2, short: 4, long: 5 },
  analysis: {
    session_note: "FDA 우선심사 초기 신호(LLY). 미 전력망법 통과로 GEV 장기 수혜 확인.",
    long_bucket: {
      allocation: "70~80%",
      theme: "AI 전력 인프라 + 비만치료제 슈퍼사이클",
      picks: [
        { ticker: "VST", name: "Vistra Energy", sector: "전력/원전",
          hold_period: "12~36개월", entry_strategy: "분할매수",
          stop_loss: "없음 (장기보유)",
          rationale: "AI 데이터센터 전력 PPA + 원전 보유.",
          confidence: 84 },
        { ticker: "GEV", name: "GE Vernova", sector: "전력기기",
          hold_period: "12~24개월", entry_strategy: "분할매수",
          stop_loss: "-15% 시 재검토",
          rationale: "전력망법 직접 수혜. 수주잔고 사상 최대.",
          confidence: 83 },
        { ticker: "LLY", name: "Eli Lilly", sector: "비만/당뇨",
          hold_period: "18~36개월", entry_strategy: "분할매수",
          stop_loss: "없음 (장기보유)",
          rationale: "비만치료제 글로벌 슈퍼사이클. NASH 우선심사.",
          confidence: 86 },
      ]
    },
    short_bucket: {
      allocation: "20~30%",
      warning: "한 종목에 버킷의 50% 이상 집중 금지. 손절 반드시 준수.",
      picks: [
        { ticker: "LLY", name: "Eli Lilly",
          trigger: "FDA 우선심사 — 6개월 내 승인 기대",
          expected_move: "+4~7% / 3~5일", risk_level: "보통",
          entry_window: "22:30~23:00",
          stop_loss: "-5% 손절",
          exit_signal: "+6% 달성 시 절반 익절",
          confidence: 74 },
        { ticker: "MU", name: "Micron",
          trigger: "엔비디아 HBM4 공급 확대 수혜 미반영",
          expected_move: "+3~5% / 5~7일", risk_level: "높음",
          entry_window: "23:00~00:00",
          stop_loss: "-6% 손절",
          exit_signal: "+5% 달성",
          confidence: 65 },
      ]
    },
    avoid_now: [
      { name: "TSLA (롱)", reason: "딜리버리 미스 후 추가 하락 압력." },
      { name: "중국 노출 높은 종목", reason: "관세 불확실성 지속." },
    ],
    kostolany_today: "FDA 소식은 빠르게 움직인다. 초기 신호 잡았다면 소량 진입 후 확인하라.",
    disclaimer: "이 분석은 교육 목적이며 실제 투자 권유가 아닙니다."
  }
};

const SAMPLE_PORTFOLIO = {
  generated_at: new Date().toISOString(),
  positions: [
    { holding: { ticker: "000660.KS", name: "SK하이닉스", bucket: "long",
        buy_price: 178000, quantity: 10, buy_date: "2025-01-15",
        target_price: 230000, stop_loss: 155000,
        buy_reason: "HBM 공급 부족 구조적 수혜" },
      calc: { current_price: 198500, pnl_pct: 11.5, pnl_amt: 205000,
        hold_days: 84, target_reached: 38.9, at_stop: false, at_target: false } },
    { holding: { ticker: "034020.KS", name: "두산에너빌리티", bucket: "long",
        buy_price: 24500, quantity: 30, buy_date: "2025-01-01",
        target_price: 38000, stop_loss: 20000,
        buy_reason: "SMR 글로벌 수주 기대" },
      calc: { current_price: 31200, pnl_pct: 27.3, pnl_amt: 201000,
        hold_days: 67, target_reached: 49.6, at_stop: false, at_target: false } },
    { holding: { ticker: "NVDA", name: "NVIDIA", bucket: "long",
        buy_price: 480.0, quantity: 5, buy_date: "2024-10-20",
        target_price: 700.0, stop_loss: 400.0,
        buy_reason: "AI 인프라 슈퍼사이클" },
      calc: { current_price: 875.0, pnl_pct: 82.3, pnl_amt: 1975.0,
        hold_days: 117, target_reached: 177.3, at_stop: false, at_target: true } },
  ],
  analysis: {
    portfolio_summary: "NVDA 목표가 초과 달성 → 익절 우선. 두산에너빌리티 모멘텀 강화.",
    positions: [
      { ticker: "000660.KS", signal: "홀드", urgency: "유지",
        reason: "HBM4 공급 독점 지위 유지. 목표가 39% 달성 수준으로 인내 구간.",
        action_detail: "전량 홀드. 분기 실적 발표 시 재평가.",
        risk_flag: "정상" },
      { ticker: "034020.KS", signal: "일부익절", urgency: "이번주내",
        reason: "폴란드 입찰 뉴스 확산으로 군중 유입 조짐. 목표가 50% 달성.",
        action_detail: "보유량 30% 익절. 나머지는 본계약 확정 시까지 홀드.",
        risk_flag: "주의" },
      { ticker: "NVDA", signal: "전량매도", urgency: "즉시",
        reason: "목표가 $700 대비 $875로 25% 초과. AI 낙관론 미디어 주류화.",
        action_detail: "즉시 전량 매도. 수익금 70% 장기 버킷 재투자.",
        risk_flag: "경고" },
    ],
    kostolany_advice: "NVDA는 이미 군중이 알고 있다. 82% 수익은 지금 실현하라.",
    disclaimer: "이 분석은 교육 목적이며 실제 투자 권유가 아닙니다."
  }
};

const SIGNAL_CFG = {
  "홀드":         { color: "#888", icon: "⬜" },
  "추가매수검토": { color: "#00e676", icon: "🟢" },
  "일부익절":     { color: "#ffd54f", icon: "🟡" },
  "전량매도":     { color: "#ff5252", icon: "🔴" },
  "손절실행":     { color: "#ff1744", icon: "🚨" },
};

const RISK_CFG = {
  "보통":     { color: "#ffd54f" },
  "높음":     { color: "#ff7043" },
  "매우높음": { color: "#ff1744" },
};

function ConfBar({ value, color }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:5 }}>
      <div style={{ flex:1, height:3, background:"rgba(255,255,255,0.1)", borderRadius:2 }}>
        <div style={{ width:`${value}%`, height:"100%", background:color||"#c8a84b", borderRadius:2 }} />
      </div>
      <span style={{ fontSize:11, fontFamily:"monospace", color:color||"#c8a84b", minWidth:28 }}>{value}</span>
    </div>
  );
}

function LongCard({ pick }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(o=>!o)} style={{
      border:"1px solid rgba(0,230,118,0.25)", borderLeft:"3px solid #00e676",
      background: open?"rgba(0,230,118,0.07)":"rgba(255,255,255,0.02)",
      borderRadius:8, padding:"14px 16px", cursor:"pointer", marginBottom:8, transition:"all 0.2s"
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontFamily:"monospace", fontWeight:700, fontSize:14 }}>{pick.ticker}</span>
          <span style={{ fontSize:13, color:"#9a9488" }}>{pick.name}</span>
          <span style={{ fontSize:10, color:"#00e676", background:"rgba(0,230,118,0.1)", padding:"2px 7px", borderRadius:8 }}>{pick.sector}</span>
        </div>
        <span style={{ fontSize:11, color:"#5a5650", fontFamily:"monospace" }}>{pick.hold_period}</span>
      </div>
      <ConfBar value={pick.confidence} color="#00e676" />
      {open && (
        <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize:13, color:"#b8b0a4", lineHeight:1.7, marginBottom:8 }}>{pick.rationale}</div>
          <div style={{ fontSize:12, color:"#5a5650", fontFamily:"monospace" }}>
            진입: {pick.entry_strategy} | 손절: {pick.stop_loss}
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
    <div onClick={() => setOpen(o=>!o)} style={{
      border:`1px solid ${rc.color}40`, borderLeft:`3px solid ${rc.color}`,
      background: open?`${rc.color}10`:"rgba(255,255,255,0.02)",
      borderRadius:8, padding:"14px 16px", cursor:"pointer", marginBottom:8, transition:"all 0.2s"
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontFamily:"monospace", fontWeight:700, fontSize:14 }}>{pick.ticker}</span>
          <span style={{ fontSize:13, color:"#9a9488" }}>{pick.name}</span>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <span style={{ fontSize:12, color:"#69f0ae", fontFamily:"monospace" }}>{pick.expected_move}</span>
          <span style={{ fontSize:10, color:rc.color, background:`${rc.color}15`, padding:"2px 8px", borderRadius:8 }}>{pick.risk_level}</span>
        </div>
      </div>
      <ConfBar value={pick.confidence} color={rc.color} />
      {open && (
        <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize:13, color:"#b8b0a4", lineHeight:1.7, marginBottom:10 }}>트리거: {pick.trigger}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, fontSize:12 }}>
            <div><span style={{ color:"#5a5650" }}>진입: </span>{pick.entry_window}</div>
            <div><span style={{ color:"#ff5252" }}>손절: </span><strong style={{ color:"#ff5252" }}>{pick.stop_loss}</strong></div>
            <div style={{ gridColumn:"1/-1" }}><span style={{ color:"#5a5650" }}>익절: </span>{pick.exit_signal}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function PortfolioCard({ position, analysisMap }) {
  const [open, setOpen] = useState(false);
  const h   = position.holding;
  const c   = position.calc;
  const a   = analysisMap[h.ticker] || {};
  const sig = SIGNAL_CFG[a.signal] || SIGNAL_CFG["홀드"];
  const isAlert = a.signal === "전량매도" || a.signal === "손절실행";

  return (
    <div onClick={() => setOpen(o=>!o)} style={{
      border:`1px solid ${isAlert?"rgba(255,82,82,0.4)":"rgba(255,255,255,0.08)"}`,
      borderLeft:`4px solid ${isAlert?"#ff5252":a.signal==="일부익절"?"#ffd54f":"rgba(255,255,255,0.15)"}`,
      background:"rgba(255,255,255,0.02)", borderRadius:8, padding:"16px 18px",
      cursor:"pointer", marginBottom:10, transition:"all 0.2s"
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
            <span style={{ fontSize:15, fontWeight:500 }}>{h.name}</span>
            <span style={{ fontSize:12, fontFamily:"monospace", color:"#5a5650" }}>{h.ticker}</span>
            <span style={{ fontSize:10, color: h.bucket==="long"?"#00e676":"#ffd54f",
              background: h.bucket==="long"?"rgba(0,230,118,0.1)":"rgba(255,213,79,0.1)",
              padding:"1px 7px", borderRadius:8 }}>
              {h.bucket==="long"?"📈 장기":"⚡ 단기"}
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ flex:1, height:6, background:"rgba(255,255,255,0.08)", borderRadius:3, overflow:"hidden" }}>
              <div style={{ width:`${Math.min(100, Math.abs(c.pnl_pct)*2)}%`, height:"100%", borderRadius:3,
                background: c.pnl_pct>=0?"#00e676":"#ff5252" }} />
            </div>
            <span style={{ fontSize:13, fontFamily:"monospace", fontWeight:500, minWidth:50,
              color: c.pnl_pct>=0?"#00e676":"#ff5252" }}>
              {c.pnl_pct>=0?"+":""}{c.pnl_pct.toFixed(1)}%
            </span>
          </div>
        </div>
        <div style={{ marginLeft:16, flexShrink:0, textAlign:"right" }}>
          <div style={{ fontSize:13, color:sig.color, background:`${sig.color}15`,
            padding:"4px 10px", borderRadius:8, marginBottom:4, border:`1px solid ${sig.color}30` }}>
            {sig.icon} {a.signal||"홀드"}
          </div>
          <div style={{ fontSize:11, color:"#5a5650", fontFamily:"monospace" }}>{a.urgency}</div>
        </div>
      </div>
      {open && (
        <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize:13, color:"#b8b0a4", lineHeight:1.7, marginBottom:10,
            background:"rgba(255,255,255,0.03)", padding:"10px 12px", borderRadius:6 }}>
            {a.action_detail}
          </div>
          <div style={{ fontSize:13, color:"#9a9488", lineHeight:1.7, marginBottom:10 }}>{a.reason}</div>
          <div style={{ display:"flex", gap:16, fontSize:12, color:"#5a5650", flexWrap:"wrap" }}>
            <span>매수가: <strong style={{ color:"#e8e6df" }}>{h.buy_price.toLocaleString()}</strong></span>
            <span>현재가: <strong style={{ color:"#e8e6df" }}>{c.current_price.toLocaleString()}</strong></span>
            <span>보유: <strong style={{ color:"#e8e6df" }}>{c.hold_days}일</strong></span>
            <span>손익: <strong style={{ color:c.pnl_amt>=0?"#00e676":"#ff5252" }}>{c.pnl_amt>=0?"+":""}{c.pnl_amt.toLocaleString()}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab]     = useState("KR");
  const [krData, setKrData] = useState(SAMPLE_KR);
  const [usData, setUsData] = useState(SAMPLE_US);
  const [pfData, setPfData] = useState(SAMPLE_PORTFOLIO);

  useEffect(() => {
    fetch('/reports_v4/latest_kr.json').then(r=>r.json()).then(d=>{ if(d.analysis) setKrData(d); }).catch(()=>{});
    fetch('/reports_v4/latest_us.json').then(r=>r.json()).then(d=>{ if(d.analysis) setUsData(d); }).catch(()=>{});
    fetch('/reports_v4/portfolio_latest.json').then(r=>r.json()).then(d=>{ if(d.analysis) setPfData(d); }).catch(()=>{});
  }, []);

  const data = tab==="KR" ? krData : tab==="US" ? usData : null;
  const a    = data?.analysis;

  const analysisMap = Object.fromEntries(
    (pfData?.analysis?.positions||[]).map(p=>[p.ticker, p])
  );

  const TABS = [
    { id:"KR", label:"🌅 한국장", sub:"07:00" },
    { id:"US", label:"🌆 미국장", sub:"20:00" },
    { id:"PF", label:"💼 포트폴리오", sub:"08:00" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#080c12", color:"#e8e6df", fontFamily:"Georgia, serif" }}>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(200,168,75,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(200,168,75,0.02) 1px,transparent 1px)",
        backgroundSize:"48px 48px" }} />

      <div style={{ maxWidth:800, margin:"0 auto", padding:"28px 20px 80px", position:"relative" }}>

        {/* 헤더 */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:10, fontFamily:"monospace", color:"#c8a84b", letterSpacing:"0.3em", marginBottom:8 }}>
            KOSTOLANY INVESTMENT SYSTEM
          </div>
          <h1 style={{ fontSize:26, fontWeight:400, margin:"0 0 4px", letterSpacing:"-0.02em" }}>
            코스톨라니 투자 대시보드
          </h1>
          <div style={{ fontSize:12, color:"#5a5650", fontFamily:"monospace" }}>
            {new Date().toLocaleString("ko-KR")} 기준
          </div>
        </div>

        {/* 탭 */}
        <div style={{ display:"flex", gap:4, borderBottom:"1px solid rgba(255,255,255,0.07)", marginBottom:24 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              background:"transparent", border:"none",
              borderBottom: tab===t.id?"2px solid #c8a84b":"2px solid transparent",
              color: tab===t.id?"#c8a84b":"#5a5650",
              padding:"10px 16px", fontSize:13, fontFamily:"monospace",
              cursor:"pointer", marginBottom:-1, transition:"all 0.15s",
            }}>
              {t.label}<br/>
              <span style={{ fontSize:10, opacity:0.6 }}>{t.sub} KST</span>
            </button>
          ))}
        </div>

        {/* 한국장 / 미국장 */}
        {(tab==="KR"||tab==="US") && a && (
          <>
            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:10, padding:"16px 20px", marginBottom:20 }}>
              <div style={{ display:"flex", gap:20, marginBottom:10, flexWrap:"wrap" }}>
                {[
                  { label:"전체", value:data.stats.total, color:"#9a9488" },
                  { label:"🆕 초기", value:data.stats.fresh, color:"#ff9800" },
                  { label:"⚡ 단기", value:data.stats.short, color:"#69f0ae" },
                  { label:"📈 장기", value:data.stats.long, color:"#00e676" },
                ].map(b=>(
                  <div key={b.label} style={{ display:"flex", alignItems:"baseline", gap:5 }}>
                    <span style={{ fontSize:20, fontFamily:"monospace", color:b.color, fontWeight:500 }}>{b.value}</span>
                    <span style={{ fontSize:11, color:"#5a5650" }}>{b.label}</span>
                  </div>
                ))}
              </div>
              <p style={{ margin:0, fontSize:14, color:"#9a9488", lineHeight:1.7 }}>{a.session_note}</p>
            </div>

            <div style={{ marginBottom:24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <span style={{ fontSize:15, fontWeight:500 }}>📈 장기 버킷</span>
                <span style={{ fontSize:11, color:"#00e676", fontFamily:"monospace" }}>{a.long_bucket.allocation}</span>
              </div>
              <div style={{ fontSize:12, color:"#c8a84b", marginBottom:10 }}>테마: {a.long_bucket.theme}</div>
              {a.long_bucket.picks.map((p,i)=><LongCard key={i} pick={p}/>)}
            </div>

            <div style={{ marginBottom:24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <span style={{ fontSize:15, fontWeight:500 }}>⚡ 단기 버킷</span>
                <span style={{ fontSize:11, color:"#ffd54f", fontFamily:"monospace" }}>{a.short_bucket.allocation}</span>
              </div>
              <div style={{ fontSize:12, color:"#ff8a80", background:"rgba(255,82,82,0.06)",
                border:"1px solid rgba(255,82,82,0.15)", borderRadius:6, padding:"8px 12px", marginBottom:10 }}>
                ⚠️ {a.short_bucket.warning}
              </div>
              {a.short_bucket.picks.map((p,i)=><ShortCard key={i} pick={p}/>)}
            </div>

            {a.avoid_now?.length > 0 && (
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:15, fontWeight:500, marginBottom:10 }}>⛔ 현재 회피</div>
                {a.avoid_now.map((av,i)=>(
                  <div key={i} style={{ borderLeft:"3px solid #ff5252", background:"rgba(255,82,82,0.05)",
                    borderRadius:"0 8px 8px 0", padding:"10px 14px", marginBottom:8 }}>
                    <div style={{ fontSize:13, color:"#ff8a80", marginBottom:4 }}>{av.name}</div>
                    <div style={{ fontSize:12, color:"#9a9488" }}>{av.reason}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background:"rgba(200,168,75,0.06)", border:"1px solid rgba(200,168,75,0.18)",
              borderRadius:10, padding:"16px 20px", textAlign:"center" }}>
              <div style={{ fontSize:11, fontFamily:"monospace", color:"#c8a84b", marginBottom:8 }}>오늘의 코스톨라니</div>
              <p style={{ margin:0, fontSize:14, color:"#b8b0a4", lineHeight:1.8, fontStyle:"italic" }}>
                "{a.kostolany_today}"
              </p>
            </div>
          </>
        )}

        {/* 포트폴리오 */}
        {tab==="PF" && (
          <>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
              {[
                { label:"총 평가손익", value:`${pfData.positions.reduce((s,p)=>s+p.calc.pnl_amt,0)>=0?"+":""}${pfData.positions.reduce((s,p)=>s+p.calc.pnl_amt,0).toLocaleString()}`,
                  color: pfData.positions.reduce((s,p)=>s+p.calc.pnl_amt,0)>=0?"#00e676":"#ff5252" },
                { label:"보유 종목", value:`${pfData.positions.length}개`, color:"#e8e6df" },
                { label:"즉시 조치", value:`${pfData.positions.filter(p=>analysisMap[p.holding.ticker]?.urgency==="즉시").length}개`,
                  color: pfData.positions.filter(p=>analysisMap[p.holding.ticker]?.urgency==="즉시").length>0?"#ff5252":"#00e676" },
              ].map(item=>(
                <div key={item.label} style={{ background:"rgba(255,255,255,0.03)",
                  border:"1px solid rgba(255,255,255,0.07)", borderRadius:8, padding:"14px 16px" }}>
                  <div style={{ fontSize:11, color:"#5a5650", fontFamily:"monospace", marginBottom:6 }}>{item.label}</div>
                  <div style={{ fontSize:20, fontWeight:500, color:item.color, fontFamily:"monospace" }}>{item.value}</div>
                </div>
              ))}
            </div>

            <div style={{ background:"rgba(200,168,75,0.06)", border:"1px solid rgba(200,168,75,0.18)",
              borderRadius:10, padding:"14px 18px", marginBottom:20 }}>
              <p style={{ margin:"0 0 8px", fontSize:14, color:"#b8b0a4", lineHeight:1.7 }}>
                {pfData.analysis.portfolio_summary}
              </p>
              <p style={{ margin:0, fontSize:13, color:"#9a8848", fontStyle:"italic", lineHeight:1.7 }}>
                "{pfData.analysis.kostolany_advice}"
              </p>
            </div>

            <div style={{ fontSize:12, color:"#5a5650", fontFamily:"monospace", marginBottom:12 }}>
              조치 우선순위 순 · 카드 클릭 시 상세 확인
            </div>
            {[...pfData.positions]
              .sort((a,b)=>{
                const order = {"즉시":0,"이번주내":1,"다음달내":2,"유지":3};
                return (order[analysisMap[a.holding.ticker]?.urgency]??3) - (order[analysisMap[b.holding.ticker]?.urgency]??3);
              })
              .map((pos,i)=><PortfolioCard key={i} position={pos} analysisMap={analysisMap}/>)
            }

            <div style={{ marginTop:24, background:"rgba(255,255,255,0.02)",
              border:"1px solid rgba(255,255,255,0.07)", borderRadius:8, padding:"14px 18px" }}>
              <div style={{ fontSize:11, fontFamily:"monospace", color:"#5a5650", marginBottom:8 }}>종목 추가 방법</div>
              <div style={{ fontFamily:"monospace", fontSize:12, color:"#6a6460", lineHeight:2 }}>
                <div>portfolio.json 직접 수정 (GitHub 웹에서 편집 가능)</div>
              </div>
            </div>
          </>
        )}

        <div style={{ marginTop:32, fontSize:11, color:"#3a3830", textAlign:"center" }}>
          {a?.disclaimer || pfData?.analysis?.disclaimer}
        </div>
      </div>
    </div>
  );
}
