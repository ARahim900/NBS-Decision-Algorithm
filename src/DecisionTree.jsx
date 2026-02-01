import { useState } from "react";

/* ─── Tree Data ─── */
const treeData = {
  id: "root",
  label: "Baby Born",
  sub: "Sohar Hospital — North Batinah",
  icon: "👶",
  color: "#3b82f6",
  children: [
    {
      id: "age_gte_24",
      label: "Age ≥ 24 hours",
      sub: "Sample-ready at discharge",
      icon: "✓",
      condition: "yes",
      color: "#22c55e",
      scenarios: ["A"],
      children: [
        {
          id: "scenario_a",
          label: "Scenario A",
          sub: "Collect & Discharge",
          icon: "A",
          color: "#22c55e",
          scenarios: ["A"],
          risk: "LOW RISK",
          actions: [
            "Collect NBS sample immediately",
            "Complete Al Shifa documentation",
            "Discharge baby",
          ],
          children: [],
        },
      ],
    },
    {
      id: "age_lt_24",
      label: "Age < 24 hours",
      sub: "Too early for NBS sample",
      icon: "⏳",
      condition: "no",
      color: "#f59e0b",
      scenarios: ["B", "C"],
      children: [
        {
          id: "can_delay",
          label: "Can Delay Discharge?",
          sub: "Clinical decision point",
          icon: "?",
          color: "#f59e0b",
          scenarios: ["B", "C"],
          children: [
            {
              id: "delay_yes",
              label: "Yes — Delay",
              sub: "Wait until 24h then collect",
              icon: "⏸",
              condition: "yes",
              color: "#f59e0b",
              scenarios: ["B"],
              children: [
                {
                  id: "scenario_b",
                  label: "Scenario B",
                  sub: "Delay Discharge",
                  icon: "B",
                  color: "#f59e0b",
                  scenarios: ["B"],
                  risk: "MEDIUM",
                  actions: [
                    "Delay discharge until 24h",
                    "Collect NBS sample",
                    "Complete Al Shifa documentation",
                    "Discharge baby",
                  ],
                  children: [],
                },
              ],
            },
            {
              id: "delay_no",
              label: "No — Must Discharge",
              sub: "Outpatient follow-up required",
              icon: "⚡",
              condition: "no",
              color: "#ef4444",
              scenarios: ["C"],
              children: [
                {
                  id: "scenario_c",
                  label: "Scenario C",
                  sub: "Early Discharge — Follow-up",
                  icon: "C",
                  color: "#ef4444",
                  scenarios: ["C"],
                  risk: "HIGH RISK",
                  actions: [
                    "Provide NBS Card to mother",
                    "Complete all documentation",
                    "Direct to collection center",
                    "Focal Point must track baby",
                  ],
                  children: [
                    {
                      id: "ref_sohar",
                      label: "Sohar",
                      sub: "Sohar Hospital",
                      icon: "📍",
                      color: "#6366f1",
                      wilayat: "sohar",
                      children: [],
                    },
                    {
                      id: "ref_shinas",
                      label: "Shinas & Liwa",
                      sub: "Shinas Polyclinic",
                      icon: "📍",
                      color: "#6366f1",
                      wilayat: "shinas_liwa",
                      children: [],
                    },
                    {
                      id: "ref_saham",
                      label: "Saham",
                      sub: "Saham Hospital",
                      icon: "📍",
                      color: "#6366f1",
                      wilayat: "saham",
                      children: [],
                    },
                    {
                      id: "ref_khabourah",
                      label: "Khabourah & Suwaiq",
                      sub: "Al Suwaiq Hospital",
                      icon: "📍",
                      color: "#6366f1",
                      wilayat: "khabourah_suwaiq",
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

/* ─── Determine which nodes are on the active path ─── */
function getActivePath(scenario, wilayat) {
  const active = new Set(["root"]);
  if (scenario === "A") {
    active.add("age_gte_24");
    active.add("scenario_a");
  } else {
    active.add("age_lt_24");
    active.add("can_delay");
    if (scenario === "B") {
      active.add("delay_yes");
      active.add("scenario_b");
    } else {
      active.add("delay_no");
      active.add("scenario_c");
      // Add the matching wilayat referral
      const wMap = { sohar: "ref_sohar", shinas_liwa: "ref_shinas", saham: "ref_saham", khabourah_suwaiq: "ref_khabourah" };
      if (wMap[wilayat]) active.add(wMap[wilayat]);
    }
  }
  return active;
}

/* ─── Single Tree Node ─── */
function TreeNode({ node, depth, activePath, expanded, onToggle }) {
  const isActive = activePath.has(node.id);
  const isExpanded = expanded.has(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const isScenario = node.risk != null;
  const isReferral = node.wilayat != null;

  const nodeColor = isActive ? node.color : "#475569";
  const bgColor = isActive ? `${node.color}18` : "#0f172a";
  const borderColor = isActive ? `${node.color}60` : "#334155";

  return (
    <div style={{ position: "relative" }}>
      {/* The node itself */}
      <button
        onClick={() => hasChildren && onToggle(node.id)}
        style={{
          display: "flex", alignItems: "flex-start", gap: 12,
          width: "100%", textAlign: "left",
          padding: isScenario ? "16px 16px" : "12px 14px",
          background: bgColor,
          border: `1.5px solid ${borderColor}`,
          borderRadius: 14,
          cursor: hasChildren ? "pointer" : "default",
          transition: "all 0.25s ease",
          marginBottom: 0,
          boxShadow: isActive ? `0 2px 12px ${node.color}20` : "none",
          opacity: isActive ? 1 : 0.55,
        }}
      >
        {/* Icon badge */}
        <span style={{
          width: isScenario ? 40 : 32, height: isScenario ? 40 : 32,
          borderRadius: 10, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: isScenario ? 18 : 14, fontWeight: 800,
          background: isActive ? `${node.color}25` : "#1e293b",
          color: nodeColor,
          border: `1.5px solid ${isActive ? `${node.color}50` : "#334155"}`,
        }}>
          {node.icon}
        </span>

        {/* Text content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
          }}>
            <span style={{
              fontSize: isScenario ? 16 : 14, fontWeight: 700,
              color: isActive ? "#f1f5f9" : "#94a3b8",
              lineHeight: 1.3,
            }}>
              {node.label}
            </span>
            {node.condition && (
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                padding: "2px 8px", borderRadius: 6,
                background: node.condition === "yes" ? "#22c55e20" : "#ef444420",
                color: node.condition === "yes" ? "#22c55e" : "#ef4444",
                textTransform: "uppercase",
              }}>
                {node.condition}
              </span>
            )}
            {node.risk && (
              <span style={{
                fontSize: 10, fontWeight: 800, letterSpacing: 0.8,
                padding: "3px 10px", borderRadius: 6,
                background: `${node.color}25`,
                color: node.color,
                textTransform: "uppercase",
              }}>
                {node.risk}
              </span>
            )}
          </div>
          <div style={{
            fontSize: 12, color: isActive ? "#94a3b8" : "#64748b",
            marginTop: 3, lineHeight: 1.4, fontWeight: 500,
          }}>
            {node.sub}
          </div>

          {/* Actions list for scenario nodes */}
          {isScenario && isActive && node.actions && isExpanded && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
              {node.actions.map((a, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  fontSize: 12, color: "#cbd5e1", fontWeight: 500,
                }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700,
                    background: `${node.color}20`, color: node.color,
                  }}>{i + 1}</span>
                  {a}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expand/collapse indicator */}
        {hasChildren && (
          <span style={{
            flexShrink: 0, fontSize: 12, color: "#64748b",
            transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease", marginTop: 4,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </span>
        )}
      </button>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div style={{
          marginLeft: 16, paddingLeft: 16,
          borderLeft: `2px solid ${isActive ? `${node.color}40` : "#1e293b"}`,
          display: "flex", flexDirection: "column", gap: 8,
          paddingTop: 8, paddingBottom: 4,
        }}>
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              activePath={activePath}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Decision Tree Section ─── */
export default function DecisionTree({ scenario, wilayat }) {
  const activePath = getActivePath(scenario, wilayat);

  // Start with active-path nodes expanded
  const [expanded, setExpanded] = useState(() => {
    return new Set(["root", "age_gte_24", "age_lt_24", "can_delay", "delay_yes", "delay_no", "scenario_a", "scenario_b", "scenario_c"]);
  });

  const onToggle = (id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpanded(new Set([
      "root", "age_gte_24", "age_lt_24", "can_delay",
      "delay_yes", "delay_no", "scenario_a", "scenario_b", "scenario_c",
    ]));
  };

  const collapseAll = () => {
    setExpanded(new Set(["root"]));
  };

  return (
    <div>
      {/* Controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={expandAll} style={{
          padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600,
          background: "#0f172a", color: "#94a3b8", border: "1.5px solid #334155",
          cursor: "pointer", transition: "all 0.15s ease",
        }}>
          Expand All
        </button>
        <button onClick={collapseAll} style={{
          padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600,
          background: "#0f172a", color: "#94a3b8", border: "1.5px solid #334155",
          cursor: "pointer", transition: "all 0.15s ease",
        }}>
          Collapse All
        </button>
        <div style={{
          marginLeft: "auto", display: "flex", alignItems: "center", gap: 6,
          fontSize: 12, color: "#64748b", fontWeight: 500,
        }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: "#22c55e40", border: "1px solid #22c55e", display: "inline-block" }}/>
          Active path
        </div>
      </div>

      {/* Tree */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <TreeNode
          node={treeData}
          depth={0}
          activePath={activePath}
          expanded={expanded}
          onToggle={onToggle}
        />
      </div>
    </div>
  );
}
