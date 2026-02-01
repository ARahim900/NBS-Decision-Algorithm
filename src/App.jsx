import { useState, useMemo } from "react";

const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
);
const CheckCircle = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
);

const wilayatMap = {
  sohar: { label: "Sohar", center: "Sohar Hospital", note: "Return to Sohar Hospital" },
  shinas_liwa: { label: "Shinas & Liwa", center: "Shinas Polyclinic", note: "Delivery Suite" },
  saham: { label: "Saham", center: "Saham Hospital", note: "" },
  khabourah_suwaiq: { label: "Al Khabourah & Al Suwaiq", center: "Al Suwaiq Hospital", note: "" },
};

function computeOutcome(ageHrs, canDelay, wilayat) {
  if (ageHrs >= 24) {
    return {
      scenario: "A",
      color: "#22c55e",
      bg: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
      bgFlat: "#f0fdf4",
      border: "#86efac",
      title: "Collect & Discharge",
      risk: "low",
      riskLabel: "LOW RISK",
      riskColor: "#22c55e",
      steps: [
        { text: "Collect NBS sample immediately", done: true },
        { text: "Complete documentation in Al Shifa", done: true },
        { text: "Discharge baby", done: true },
      ],
      referral: null,
      focalNeeded: false,
      urgency: "No follow-up needed. Standard pathway.",
      deadline: null,
    };
  }
  if (ageHrs >= 12 && canDelay) {
    const waitHrs = Math.ceil(24 - ageHrs);
    return {
      scenario: "B",
      color: "#f59e0b",
      bg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
      bgFlat: "#fffbeb",
      border: "#fde68a",
      title: "Delay Discharge",
      risk: "medium",
      riskLabel: "MEDIUM",
      riskColor: "#f59e0b",
      steps: [
        { text: `Delay discharge by ~${waitHrs} hour${waitHrs > 1 ? "s" : ""} until baby reaches 24 hrs`, done: false },
        { text: "Then collect NBS sample", done: false },
        { text: "Complete Al Shifa documentation", done: false },
        { text: "Discharge baby", done: false },
      ],
      referral: null,
      focalNeeded: false,
      urgency: `Wait ${waitHrs} more hour${waitHrs > 1 ? "s" : ""} before collecting sample.`,
      deadline: `${waitHrs}h until eligible`,
    };
  }
  const ref = wilayatMap[wilayat] || null;
  const hrsUntil48 = Math.max(0, 48 - ageHrs);
  return {
    scenario: "C",
    color: "#ef4444",
    bg: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
    bgFlat: "#fef2f2",
    border: "#fca5a5",
    title: "Early Discharge — Outpatient Follow-up",
    risk: "high",
    riskLabel: "HIGH RISK",
    riskColor: "#ef4444",
    steps: [
      { text: "Provide NBS Card to mother — mark Required Collection Date clearly", done: false },
      { text: "Complete all demographics & Al Shifa documentation before discharge", done: false },
      { text: ref ? `Direct mother to ${ref.center}${ref.note ? ` (${ref.note})` : ""}` : "Select Wilayat to determine collection center", done: false },
      { text: "Focal Point must track baby and confirm collection", done: false },
    ],
    referral: ref,
    focalNeeded: true,
    urgency: `Sample must be collected within ${Math.round(hrsUntil48)}h (48-hr window from birth).`,
    deadline: `${Math.round(hrsUntil48)} hours remaining`,
  };
}

const Gauge = ({ value, max, color, label }) => {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600, letterSpacing: 0.2 }}>{label}</span>
        <span style={{ fontSize: 18, fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: 10, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${color}cc, ${color})`, borderRadius: 99, transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
    </div>
  );
};

const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: 11, fontWeight: 700, color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: 1.4,
    marginBottom: 16, display: "flex", alignItems: "center", gap: 8,
  }}>
    {children}
  </div>
);

const Card = ({ children, style }) => (
  <div style={{
    background: "#1e293b",
    borderRadius: 20,
    padding: "20px 20px",
    border: "1px solid #334155",
    boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
    ...style,
  }}>
    {children}
  </div>
);

export default function App() {
  const [ageHrs, setAgeHrs] = useState(20);
  const [canDelay, setCanDelay] = useState(true);
  const [wilayat, setWilayat] = useState("sohar");

  const outcome = useMemo(() => computeOutcome(ageHrs, canDelay, wilayat), [ageHrs, canDelay, wilayat]);

  const readiness = ageHrs >= 24 ? 100 : Math.round((ageHrs / 24) * 100);
  const riskScore = outcome.scenario === "A" ? 10 : outcome.scenario === "B" ? 45 : 90;

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: "#0f172a",
      minHeight: "100dvh",
      padding: "16px 12px 32px",
    }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>

        {/* ── HEADER ── */}
        <div style={{ textAlign: "center", marginBottom: 28, paddingTop: 8 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 48, height: 48, borderRadius: 14,
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            marginBottom: 12,
            boxShadow: "0 4px 16px rgba(59,130,246,0.3)",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <h1 style={{
            fontSize: 22, fontWeight: 900, color: "#f1f5f9",
            marginBottom: 4, letterSpacing: -0.5, lineHeight: 1.2,
          }}>
            NBS Decision Engine
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", fontWeight: 500, lineHeight: 1.4 }}>
            North Batinah Governorate — Newborn Screening Protocol
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* ── INPUT PANEL ── */}
          <Card>
            <SectionLabel>Input Parameters</SectionLabel>

            {/* Age slider */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: "#cbd5e1" }}>Baby Age at Discharge</label>
                <span style={{
                  fontSize: 28, fontWeight: 900, color: outcome.color,
                  fontVariantNumeric: "tabular-nums", lineHeight: 1, letterSpacing: -1,
                }}>{ageHrs}<span style={{ fontSize: 16, fontWeight: 600, color: "#64748b", marginLeft: 2 }}>hrs</span></span>
              </div>
              <input
                type="range" min={1} max={72} step={1} value={ageHrs}
                onChange={e => setAgeHrs(Number(e.target.value))}
                style={{ width: "100%", "--thumb-color": outcome.color }}
              />
              <div style={{
                display: "flex", justifyContent: "space-between",
                fontSize: 11, color: "#475569", marginTop: 8, fontWeight: 500,
              }}>
                <span>1h</span>
                <span style={{ color: "#ef4444", fontWeight: 700 }}>12h</span>
                <span style={{ color: "#f59e0b", fontWeight: 700 }}>24h</span>
                <span>48h</span>
                <span>72h</span>
              </div>
            </div>

            {/* Can delay toggle */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: "#cbd5e1", display: "block", marginBottom: 10 }}>
                Can Discharge Be Delayed?
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                {[true, false].map(v => (
                  <button key={String(v)} onClick={() => setCanDelay(v)} style={{
                    flex: 1,
                    padding: "14px 12px",
                    borderRadius: 14,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    background: canDelay === v ? (v ? "linear-gradient(135deg, #16a34a, #22c55e)" : "linear-gradient(135deg, #dc2626, #ef4444)") : "#0f172a",
                    color: canDelay === v ? "#fff" : "#64748b",
                    border: canDelay === v ? "2px solid transparent" : "2px solid #334155",
                    boxShadow: canDelay === v ? (v ? "0 4px 12px rgba(34,197,94,0.25)" : "0 4px 12px rgba(239,68,68,0.25)") : "none",
                    letterSpacing: 0.1,
                  }}>
                    {v ? "Yes — Can Wait" : "No — Must Go"}
                  </button>
                ))}
              </div>
            </div>

            {/* Wilayat */}
            <div>
              <label style={{ fontSize: 14, fontWeight: 600, color: "#cbd5e1", display: "block", marginBottom: 10 }}>
                Mother's Wilayat
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {Object.entries(wilayatMap).map(([k, v]) => (
                  <button key={k} onClick={() => setWilayat(k)} style={{
                    padding: "14px 14px",
                    borderRadius: 14,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    textAlign: "left",
                    lineHeight: 1.3,
                    background: wilayat === k ? "linear-gradient(135deg, #2563eb, #3b82f6)" : "#0f172a",
                    color: wilayat === k ? "#fff" : "#94a3b8",
                    border: wilayat === k ? "2px solid #60a5fa" : "2px solid #334155",
                    boxShadow: wilayat === k ? "0 4px 12px rgba(59,130,246,0.25)" : "none",
                  }}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* ── OUTCOME PANEL ── */}
          <div style={{
            background: outcome.bg,
            borderRadius: 20,
            padding: "22px 20px",
            border: `2px solid ${outcome.border}`,
            transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: `0 8px 32px ${outcome.color}18`,
          }}>

            {/* Scenario badge + risk */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: 12, marginBottom: 20,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{
                  background: `linear-gradient(135deg, ${outcome.color}dd, ${outcome.color})`,
                  color: "#fff", fontWeight: 900, fontSize: 20,
                  borderRadius: 14, width: 48, height: 48,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 4px 16px ${outcome.color}40`,
                  letterSpacing: -0.5,
                }}>
                  {outcome.scenario}
                </span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: "#0f172a", letterSpacing: -0.3 }}>
                    Scenario {outcome.scenario}
                  </div>
                  <div style={{ fontSize: 13, color: "#475569", fontWeight: 600, lineHeight: 1.3, marginTop: 2 }}>
                    {outcome.title}
                  </div>
                </div>
              </div>
              <span style={{
                background: `linear-gradient(135deg, ${outcome.riskColor}dd, ${outcome.riskColor})`,
                color: "#fff", fontWeight: 800, fontSize: 11,
                borderRadius: 10, padding: "7px 14px",
                letterSpacing: 0.8, textTransform: "uppercase",
                boxShadow: `0 2px 8px ${outcome.riskColor}30`,
              }}>
                {outcome.riskLabel}
              </span>
            </div>

            {/* Gauges */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
              marginBottom: 18, background: "#fff",
              borderRadius: 16, padding: "16px 18px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <Gauge value={readiness} max={100} color={readiness >= 100 ? "#22c55e" : readiness >= 50 ? "#f59e0b" : "#ef4444"} label="Sample Readiness" />
              <Gauge value={riskScore} max={100} color={outcome.riskColor} label="Follow-up Risk" />
            </div>

            {/* Urgency callout */}
            <div style={{
              background: "#fff", border: `1.5px solid ${outcome.border}`,
              borderRadius: 14, padding: "14px 16px", marginBottom: 18,
              display: "flex", alignItems: "center", gap: 12,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <span style={{ flexShrink: 0, display: "flex", color: outcome.color }}>
                {outcome.scenario === "A" ? <CheckCircle /> : <AlertIcon />}
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", lineHeight: 1.45, flex: 1 }}>
                {outcome.urgency}
              </span>
              {outcome.deadline && (
                <span style={{
                  flexShrink: 0,
                  background: `linear-gradient(135deg, ${outcome.color}dd, ${outcome.color})`,
                  color: "#fff", fontSize: 12, fontWeight: 700,
                  borderRadius: 8, padding: "5px 12px", whiteSpace: "nowrap",
                  boxShadow: `0 2px 8px ${outcome.color}30`,
                }}>{outcome.deadline}</span>
              )}
            </div>

            {/* Action Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {outcome.steps.map((s, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "12px 14px",
                  background: s.done ? "#f0fdf4" : "#fff",
                  borderRadius: 12,
                  border: s.done ? "1.5px solid #86efac" : "1.5px solid #e2e8f0",
                  transition: "all 0.2s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                }}>
                  <span style={{
                    fontSize: 13, fontWeight: 700, color: s.done ? "#22c55e" : "#94a3b8",
                    minWidth: 24, height: 24,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: s.done ? "#dcfce7" : "#f1f5f9",
                    borderRadius: 8, flexShrink: 0,
                  }}>
                    {s.done ? "\u2713" : i + 1}
                  </span>
                  <span style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.55, fontWeight: 500 }}>
                    {s.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Referral card (Scenario C) */}
            {outcome.referral && (
              <div style={{
                marginTop: 16, background: "#fff", borderRadius: 16,
                padding: "18px 18px", border: "2px solid #3b82f6",
                boxShadow: "0 4px 16px rgba(59,130,246,0.1)",
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: "#3b82f6",
                  textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10,
                }}>Referral Destination</div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", letterSpacing: -0.3 }}>
                    {outcome.referral.center}
                  </div>
                  {outcome.referral.note && (
                    <div style={{ fontSize: 14, color: "#64748b", marginTop: 2 }}>{outcome.referral.note}</div>
                  )}
                  <div style={{
                    fontSize: 12, color: "#94a3b8", marginTop: 6,
                    background: "#f8fafc", display: "inline-block",
                    padding: "4px 10px", borderRadius: 6,
                  }}>
                    Wilayat: {outcome.referral.label}
                  </div>
                </div>
              </div>
            )}

            {/* Focal point flag */}
            {outcome.focalNeeded && (
              <div style={{
                marginTop: 16, background: "linear-gradient(135deg, #fef3c7, #fde68a44)",
                border: "2px solid #fcd34d", borderRadius: 16,
                padding: "16px 18px", display: "flex", alignItems: "flex-start", gap: 12,
              }}>
                <span style={{
                  fontSize: 14, fontWeight: 700, color: "#92400e",
                  background: "#fde68a", borderRadius: 10,
                  width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>!</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#92400e", marginBottom: 4 }}>
                    Focal Point Activation Required
                  </div>
                  <div style={{ fontSize: 13, color: "#a16207", lineHeight: 1.5 }}>
                    Must track this baby, verify collection within 48h, and include in bi-weekly report to DGHSNBG.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── TRANSPORT ── */}
          <Card>
            <SectionLabel>Lab & Transport Protocol</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "SORTING", text: "Keep Sohar samples", highlight: "separate", rest: " from institution samples", hColor: "#f59e0b" },
                { label: "CENTRALIZE", text: "All regional samples \u2192 ", highlight: "Sohar Hospital", rest: "", hColor: "#3b82f6" },
                { label: "DISPATCH", text: "Daily at ", highlight: "5:00 AM", rest: " to Genetic Center, Muscat", hColor: "#22c55e", warning: "Except Fridays" },
              ].map((item, i) => (
                <div key={i} style={{
                  background: "#0f172a", borderRadius: 14, padding: "14px 16px",
                  border: "1px solid #1e293b",
                }}>
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, marginBottom: 6, letterSpacing: 1.2 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 14, color: "#e2e8f0", lineHeight: 1.5, fontWeight: 500 }}>
                    {item.text}<strong style={{ color: item.hColor }}>{item.highlight}</strong>{item.rest}
                    {item.warning && (
                      <><br/><span style={{ color: "#ef4444", fontWeight: 700, fontSize: 12 }}>
                        {item.warning}
                      </span></>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* ── CAUSE-EFFECT ── */}
          <Card>
            <SectionLabel>Cause & Effect Summary</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { cause: "Baby age above 24h", effect: "Direct collection & discharge (A)", c: "#22c55e" },
                { cause: "Age below 24h + delay OK", effect: "Wait for eligibility (B)", c: "#f59e0b" },
                { cause: "Age below 24h + no delay", effect: "Outpatient follow-up required (C)", c: "#ef4444" },
                { cause: "Wilayat changes", effect: "Referral destination updates (C)", c: "#3b82f6" },
                { cause: "No Focal Point activated", effect: "Risk of missed 48h window", c: "#ef4444" },
              ].map((r, i, arr) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  fontSize: 13, padding: "12px 0",
                  borderBottom: i < arr.length - 1 ? "1px solid #334155" : "none",
                }}>
                  <span style={{ color: "#94a3b8", fontWeight: 500, flex: "1 1 42%", lineHeight: 1.4 }}>
                    {r.cause}
                  </span>
                  <span style={{ color: r.c, flexShrink: 0, display: "flex" }}>
                    <ArrowRight />
                  </span>
                  <span style={{ color: r.c, fontWeight: 600, flex: "1 1 52%", lineHeight: 1.4 }}>
                    {r.effect}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          textAlign: "center", fontSize: 12, color: "#475569",
          marginTop: 28, lineHeight: 1.5, fontWeight: 500,
        }}>
          Sohar Hospital — Newborn Screening Program
          <br />
          <span style={{ color: "#334155" }}>Genetic Center, Muscat</span>
        </div>
      </div>
    </div>
  );
}
