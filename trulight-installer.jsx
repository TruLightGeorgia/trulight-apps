import { useState, useEffect } from "react";

// ─── BACKEND URL ─────────────────────────────────────────────────────────────
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzFHc8MR_9O1wPoGW2aQofO59P_1O4rZ5pX3HhBVGECkiDvINeLHcuhsxLtynjqW_uh/exec";

// ─── THEME ───────────────────────────────────────────────────────────────────
const G = "#C9A84C";
const GD = "#7A6230";
const GL = "#E8C96A";
const BK = "#0A0A0A";
const DK = "#111111";
const CD = "#161616";
const BR = "#2A2A2A";
const WH = "#F5F0E8";
const MT = "#666";
const GR = "#27AE60";
const RD = "#C0392B";
const BL = "#2980B9";

// ─── MOCK JOBS ────────────────────────────────────────────────────────────────
const MOCK_JOBS = [
  {
    id: "JOB-001",
    customer: "Marcus & Lisa Thompson",
    address: "412 Windward Pkwy, Alpharetta, GA 30005",
    neighborhood: "Windward",
    date: "2026-04-22",
    time: "9:00 AM",
    linearFt: 210,
    homeStyle: "Two Story",
    roofline: ["Gutters Present", "Hip Roof", "Second Story Overhang"],
    notes: "Gate code: 4821. Dog in backyard — keep gate closed.",
    controller: true,
    status: "Scheduled",
    salesperson: "KJ Williams",
    phone: "(678) 555-0142",
  },
  {
    id: "JOB-002",
    customer: "Derek Holloway",
    address: "88 Milton Walk Ct, Milton, GA 30004",
    neighborhood: "Milton Walk",
    date: "2026-04-23",
    time: "10:00 AM",
    linearFt: 155,
    homeStyle: "Single Story",
    roofline: ["Steep Pitch", "Gutters Present"],
    notes: "Customer works from home. Ring doorbell on arrival.",
    controller: true,
    status: "Scheduled",
    salesperson: "Dee Johnson",
    phone: "(770) 555-0389",
  },
  {
    id: "JOB-003",
    customer: "Sandra & Phil Okafor",
    address: "2201 The Manor Dr, Alpharetta, GA 30022",
    neighborhood: "The Manor",
    date: "2026-04-21",
    time: "8:00 AM",
    linearFt: 290,
    homeStyle: "Estate / Large Custom",
    roofline: ["Hip Roof", "Dormers", "Wrap-Around", "Second Story Overhang"],
    notes: "Large estate — two-person crew required. Check in with Sandra before starting.",
    controller: true,
    status: "In Progress",
    salesperson: "KJ Williams",
    phone: "(404) 555-0771",
  },
];

const INSTALL_CHECKLIST = [
  { id: "c1", category: "Arrival", text: "Arrive on time — call customer 15 min before if running late" },
  { id: "c2", category: "Arrival", text: "Check in with homeowner, confirm scope and walkthrough" },
  { id: "c3", category: "Arrival", text: "Review roofline notes and job ticket before starting" },
  { id: "c4", category: "Safety", text: "Inspect ladder and equipment — no damaged gear on job" },
  { id: "c5", category: "Safety", text: "Set up safety cones / barriers if near driveway or street" },
  { id: "c6", category: "Safety", text: "Confirm someone knows your location (buddy system)" },
  { id: "c7", category: "Installation", text: "Measure and mark linear footage before cutting any channel" },
  { id: "c8", category: "Installation", text: "Mount channel track per spec — secure every 18 inches" },
  { id: "c9", category: "Installation", text: "Run LED strip — no sharp bends, no exposed wire at corners" },
  { id: "c10", category: "Installation", text: "Connect all zone runs to controller — label each zone" },
  { id: "c11", category: "Installation", text: "Seal all entry/exit points with weatherproof caulk" },
  { id: "c12", category: "Controller", text: "Mount controller in agreed location — secure and weatherproof" },
  { id: "c13", category: "Controller", text: "Connect controller to power — verify correct amperage" },
  { id: "c14", category: "Controller", text: "Connect to Wi-Fi and test app pairing with customer's phone" },
  { id: "c15", category: "Testing", text: "Test all zones — full white, full color, all scenes" },
  { id: "c16", category: "Testing", text: "Walk entire roofline — check for dark spots or loose sections" },
  { id: "c17", category: "Testing", text: "Confirm app control works from inside the home" },
  { id: "c18", category: "Closeout", text: "Complete walkthrough with homeowner — get verbal approval" },
  { id: "c19", category: "Closeout", text: "Collect remaining balance — confirm payment received" },
  { id: "c20", category: "Closeout", text: "Leave TruLight card and referral door hangers with customer" },
  { id: "c21", category: "Closeout", text: "Clean up — no debris, tools, or packaging left on property" },
  { id: "c22", category: "Closeout", text: "Submit job completion report and photos before leaving" },
];

const MATERIALS_PER_FT = {
  ledStrip: { label: "LED Strip (ft)", unit: "ft", factor: 1.05 },
  channel: { label: "Aluminum Channel (ft)", unit: "ft", factor: 1.05 },
  endCaps: { label: "End Caps", unit: "pairs", factor: 0.1 },
  connectors: { label: "Wire Connectors", unit: "pcs", factor: 0.15 },
  screws: { label: "Mounting Screws", unit: "pcs", factor: 0.5 },
  caulk: { label: "Weatherproof Caulk", unit: "tubes", factor: 0.03 },
  wireClips: { label: "Wire Clips", unit: "pcs", factor: 0.4 },
  zipTies: { label: "Zip Ties", unit: "pcs", factor: 0.3 },
};

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
const s = {
  input: {
    width: "100%", background: "#111", border: `1px solid ${BR}`,
    borderRadius: 6, padding: "10px 14px", color: WH, fontSize: 14,
    fontFamily: "'Barlow', sans-serif", outline: "none", boxSizing: "border-box",
  },
  label: {
    display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px",
    textTransform: "uppercase", color: GD, marginBottom: 6,
    fontFamily: "'Barlow Condensed', sans-serif",
  },
  card: {
    background: CD, border: `1px solid ${BR}`, borderRadius: 10, padding: "18px 20px",
  },
};

function Inp({ value, onChange, placeholder, type = "text" }) {
  const [f, setF] = useState(false);
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    onFocus={() => setF(true)} onBlur={() => setF(false)}
    style={{ ...s.input, borderColor: f ? GD : BR }} />;
}

function Sel({ value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ ...s.input, cursor: "pointer", color: value ? WH : MT }}>
      <option value="">{placeholder || "Select..."}</option>
      {options.map(o => <option key={o} value={o} style={{ background: DK }}>{o}</option>)}
    </select>
  );
}

function Tag({ label, color = GD }) {
  return (
    <span style={{
      fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase",
      padding: "2px 8px", borderRadius: 3, fontWeight: 700,
      background: `${color}18`, color: color,
      border: `1px solid ${color}44`, fontFamily: "'Barlow Condensed', sans-serif",
    }}>{label}</span>
  );
}

function StatusTag({ status }) {
  const map = { "Scheduled": [BL, "Scheduled"], "In Progress": [G, "In Progress"], "Complete": [GR, "Complete"] };
  const [c, l] = map[status] || [MT, status];
  return <Tag label={l} color={c} />;
}

function Divider({ title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0 16px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: G, opacity: 0.6, whiteSpace: "nowrap", fontFamily: "'Barlow Condensed', sans-serif" }}>{title}</div>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${GD}44, transparent)` }} />
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", disabled, small }) {
  const styles = {
    primary: { background: `linear-gradient(135deg, ${GD}, ${G})`, color: BK, border: "none" },
    outline: { background: "transparent", color: MT, border: `1px solid ${BR}` },
    success: { background: GR, color: WH, border: "none" },
    danger: { background: RD, color: WH, border: "none" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...styles[variant],
      borderRadius: 6, padding: small ? "8px 16px" : "11px 22px",
      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
      fontSize: small ? 11 : 13, letterSpacing: "1.5px", textTransform: "uppercase",
      cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1,
      transition: "opacity 0.15s",
    }}>{children}</button>
  );
}

// ─── VIEWS ────────────────────────────────────────────────────────────────────

// 1. JOB BOARD
function JobBoard({ onSelectJob }) {
  const today = new Date().toISOString().split("T")[0];
  const todayJobs = MOCK_JOBS.filter(j => j.date === today || j.status === "In Progress");
  const upcoming = MOCK_JOBS.filter(j => j.date > today && j.status === "Scheduled");

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, color: WH, marginBottom: 4 }}>
          MY <span style={{ color: G }}>JOBS</span>
        </div>
        <div style={{ fontSize: 12, color: MT }}>Tap a job to open the full install package</div>
      </div>

      {todayJobs.length > 0 && (
        <>
          <Divider title="Today / Active" />
          {todayJobs.map(job => <JobCard key={job.id} job={job} onSelect={onSelectJob} highlight />)}
        </>
      )}

      {upcoming.length > 0 && (
        <>
          <Divider title="Upcoming" />
          {upcoming.map(job => <JobCard key={job.id} job={job} onSelect={onSelectJob} />)}
        </>
      )}

      {MOCK_JOBS.filter(j => j.status === "Complete").length > 0 && (
        <>
          <Divider title="Completed" />
          {MOCK_JOBS.filter(j => j.status === "Complete").map(job => <JobCard key={job.id} job={job} onSelect={onSelectJob} />)}
        </>
      )}
    </div>
  );
}

function JobCard({ job, onSelect, highlight }) {
  return (
    <div onClick={() => onSelect(job)} style={{
      ...s.card,
      marginBottom: 10, cursor: "pointer",
      borderColor: highlight ? GD : BR,
      borderLeft: `3px solid ${highlight ? G : BR}`,
      background: highlight ? "linear-gradient(135deg, #1A1200, #161616)" : CD,
      transition: "transform 0.15s, border-color 0.15s",
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateX(3px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateX(0)"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 8 }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16, color: WH, letterSpacing: 0.5 }}>{job.customer}</div>
          <div style={{ fontSize: 12, color: MT, marginTop: 2 }}>{job.address}</div>
        </div>
        <StatusTag status={job.status} />
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
        <div style={{ fontSize: 11, color: G }}>📅 {new Date(job.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {job.time}</div>
        <div style={{ fontSize: 11, color: MT }}>📏 {job.linearFt} ft</div>
        <div style={{ fontSize: 11, color: MT }}>🏠 {job.homeStyle}</div>
        <div style={{ fontSize: 11, color: MT }}>🏘 {job.neighborhood}</div>
      </div>
    </div>
  );
}

// 2. JOB DETAIL
function JobDetail({ job, onBack, onOpenChecklist, onOpenMaterials, onOpenPhotos, onOpenLead }) {
  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: MT, cursor: "pointer", fontSize: 13, fontFamily: "'Barlow', sans-serif", marginBottom: 20, padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
        ← Back to Jobs
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 2, color: WH, lineHeight: 1 }}>{job.customer}</div>
          <div style={{ fontSize: 12, color: MT, marginTop: 4 }}>{job.id}</div>
        </div>
        <StatusTag status={job.status} />
      </div>

      {/* Job summary card */}
      <div style={{ ...s.card, borderLeft: `3px solid ${G}`, background: "linear-gradient(135deg, #1A1200, #161616)", marginBottom: 16 }}>
        <Divider title="Job Details" />
        {[
          ["📍 Address", job.address],
          ["📅 Date & Time", `${new Date(job.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at ${job.time}`],
          ["📏 Linear Footage", `${job.linearFt} ft`],
          ["🏠 Home Style", job.homeStyle],
          ["🏘 Neighborhood", job.neighborhood],
          ["📞 Customer Phone", job.phone],
          ["👤 Salesperson", job.salesperson],
          ["🔌 Controller", job.controller ? "Yes — included" : "No"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid #1e1e1e`, fontSize: 13 }}>
            <span style={{ color: MT }}>{k}</span>
            <span style={{ color: WH, fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{v}</span>
          </div>
        ))}

        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, color: GD, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 6 }}>Roofline</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {job.roofline.map(r => <Tag key={r} label={r} color={GD} />)}
          </div>
        </div>

        {job.notes && (
          <div style={{ marginTop: 12, padding: "10px 12px", background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: 6 }}>
            <div style={{ fontSize: 10, color: RD, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 4 }}>⚠ Job Notes</div>
            <div style={{ fontSize: 12, color: WH, lineHeight: 1.6 }}>{job.notes}</div>
          </div>
        )}
      </div>

      {/* Action tiles */}
      <Divider title="Install Package" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        {[
          { icon: "🔧", label: "Install Checklist", sub: `${INSTALL_CHECKLIST.length} steps`, action: onOpenChecklist, color: G },
          { icon: "📦", label: "Materials List", sub: `${job.linearFt} ft calculated`, action: onOpenMaterials, color: BL },
          { icon: "📸", label: "Submit Photos", sub: "Job completion required", action: onOpenPhotos, color: GR },
          { icon: "🏠", label: "Capture Lead", sub: "Prospect nearby homes", action: onOpenLead, color: "#E67E22" },
        ].map(tile => (
          <div key={tile.label} onClick={tile.action} style={{
            ...s.card, cursor: "pointer", textAlign: "center", padding: "20px 14px",
            borderColor: `${tile.color}44`,
            transition: "transform 0.15s, background 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.background = `${tile.color}0A`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = CD; }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{tile.icon}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, color: tile.color, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{tile.label}</div>
            <div style={{ fontSize: 11, color: MT }}>{tile.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. INSTALL CHECKLIST
function InstallChecklist({ job, onBack }) {
  const [checked, setChecked] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const categories = [...new Set(INSTALL_CHECKLIST.map(i => i.category))];
  const total = INSTALL_CHECKLIST.length;
  const done = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((done / total) * 100);

  const toggle = id => setChecked(p => ({ ...p, [id]: !p[id] }));

  if (submitted) {
    return (
      <div style={{ textAlign: "center", paddingTop: 40 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 2, color: WH, marginBottom: 8 }}>CHECKLIST <span style={{ color: G }}>COMPLETE</span></div>
        <div style={{ fontSize: 13, color: MT, marginBottom: 24 }}>All {total} steps confirmed for {job.customer}</div>
        <Btn onClick={onBack} variant="primary">← Back to Job</Btn>
      </div>
    );
  }

  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: MT, cursor: "pointer", fontSize: 13, fontFamily: "'Barlow', sans-serif", marginBottom: 20, padding: 0 }}>← Back to Job</button>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 2, color: WH }}>INSTALL <span style={{ color: G }}>CHECKLIST</span></div>
        <div style={{ fontSize: 12, color: MT }}>{job.customer} · {job.linearFt} ft</div>
      </div>

      {/* Progress bar */}
      <div style={{ ...s.card, marginBottom: 20, padding: "14px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: MT }}>Progress</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: pct === 100 ? GR : G, letterSpacing: 1 }}>{pct}%</div>
        </div>
        <div style={{ height: 6, background: BR, borderRadius: 3 }}>
          <div style={{ height: "100%", borderRadius: 3, background: pct === 100 ? GR : `linear-gradient(90deg, ${GD}, ${G})`, width: `${pct}%`, transition: "width 0.3s ease" }} />
        </div>
        <div style={{ fontSize: 11, color: MT, marginTop: 6 }}>{done} of {total} steps complete</div>
      </div>

      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: 20 }}>
          <Divider title={cat} />
          {INSTALL_CHECKLIST.filter(i => i.category === cat).map(item => (
            <div key={item.id} onClick={() => toggle(item.id)} style={{
              display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px",
              marginBottom: 6, borderRadius: 7, cursor: "pointer",
              background: checked[item.id] ? "rgba(39,174,96,0.07)" : "#111",
              border: `1px solid ${checked[item.id] ? "rgba(39,174,96,0.25)" : BR}`,
              transition: "all 0.15s",
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 4, flexShrink: 0, marginTop: 1,
                border: `2px solid ${checked[item.id] ? GR : BR}`,
                background: checked[item.id] ? GR : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}>
                {checked[item.id] && <span style={{ color: WH, fontSize: 11, fontWeight: 900 }}>✓</span>}
              </div>
              <div style={{ fontSize: 13, color: checked[item.id] ? MT : WH, lineHeight: 1.5, textDecoration: checked[item.id] ? "line-through" : "none", transition: "color 0.15s" }}>
                {item.text}
              </div>
            </div>
          ))}
        </div>
      ))}

      <div style={{ marginTop: 12 }}>
        <Btn onClick={async () => {
          try {
            await fetch(APPS_SCRIPT_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "submitChecklist", jobID: job.id, checkedItems: checked }) });
          } catch(e) {}
          setSubmitted(true);
        }} disabled={pct < 100} variant="success">
          {pct === 100 ? "Submit Checklist ✓" : `Complete All Steps (${total - done} remaining)`}
        </Btn>
      </div>
    </div>
  );
}

// 4. MATERIALS CALCULATOR
function MaterialsCalc({ job, onBack }) {
  const [ft, setFt] = useState(String(job.linearFt));
  const [zones, setZones] = useState("2");
  const [printed, setPrinted] = useState(false);

  const calc = parseFloat(ft) || 0;
  const materials = Object.entries(MATERIALS_PER_FT).map(([key, m]) => ({
    ...m,
    qty: Math.ceil(calc * m.factor) + (key === "endCaps" ? parseInt(zones) * 2 : 0),
  }));

  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: MT, cursor: "pointer", fontSize: 13, fontFamily: "'Barlow', sans-serif", marginBottom: 20, padding: 0 }}>← Back to Job</button>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 2, color: WH }}>MATERIALS <span style={{ color: G }}>CALCULATOR</span></div>
        <div style={{ fontSize: 12, color: MT }}>{job.customer} · {job.homeStyle}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div>
          <div style={s.label}>Linear Footage</div>
          <Inp type="number" value={ft} onChange={setFt} placeholder="e.g. 210" />
        </div>
        <div>
          <div style={s.label}>Number of Zones</div>
          <Sel value={zones} onChange={setZones} options={["1", "2", "3", "4", "5", "6"]} />
        </div>
      </div>

      {/* Materials list */}
      <div style={{ ...s.card, marginBottom: 16 }}>
        <Divider title="Required Materials" />
        {materials.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < materials.length - 1 ? `1px solid #1e1e1e` : "none" }}>
            <div style={{ fontSize: 13, color: WH }}>{m.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: GL, letterSpacing: 1 }}>{m.qty}</div>
              <div style={{ fontSize: 11, color: MT }}>{m.unit}</div>
            </div>
          </div>
        ))}
        {job.controller && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
            <div style={{ fontSize: 13, color: WH }}>🔌 Smart Controller</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: GL, letterSpacing: 1 }}>1</div>
              <div style={{ fontSize: 11, color: MT }}>unit</div>
            </div>
          </div>
        )}
      </div>

      {/* Cost summary */}
      <div style={{ background: "linear-gradient(135deg, #1A1200, #161616)", border: `1px solid ${GD}`, borderRadius: 10, padding: "16px 18px", marginBottom: 20 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: GD, marginBottom: 6 }}>Estimated Material Cost</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, color: GL, letterSpacing: 2 }}>
          ${(calc * 15).toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: 11, color: MT, marginTop: 2 }}>Based on ~$15/ft equipment cost</div>
        {job.controller && <div style={{ fontSize: 11, color: MT }}>Controller not included in per-ft estimate</div>}
      </div>

      {!printed ? (
        <Btn onClick={() => setPrinted(true)} variant="primary">Generate Job Sheet ↓</Btn>
      ) : (
        <div style={{ ...s.card, borderColor: `${GR}44` }}>
          <div style={{ fontSize: 12, color: GR, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>✓ Job Sheet Ready</div>
          <div style={{ fontSize: 12, color: MT, lineHeight: 1.7 }}>
            Job sheet for <strong style={{ color: WH }}>{job.customer}</strong> has been generated with all material quantities, roofline notes, and install specs. Share with crew before dispatch.
          </div>
        </div>
      )}
    </div>
  );
}

// 5. PHOTO SUBMISSION
function PhotoSubmit({ job, onBack }) {
  const [photos, setPhotos] = useState({ before: false, during: false, after_front: false, after_night: false, controller: false, app: false });
  const [notes, setNotes] = useState("");
  const [balance, setBalance] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const required = ["before", "during", "after_front", "after_night", "controller", "app"];
  const allDone = required.every(k => photos[k]);

  const labels = {
    before: { label: "Before Photo", sub: "Full roofline before install begins", req: true },
    during: { label: "During Install", sub: "Mid-install showing channel/strip work", req: true },
    after_front: { label: "After — Day", sub: "Full front of home, daytime", req: true },
    after_night: { label: "After — Night (Lit)", sub: "Lights on, full glow shot", req: true },
    controller: { label: "Controller Installed", sub: "Mounted and wired controller closeup", req: true },
    app: { label: "App Connected", sub: "Screenshot of customer's app showing connected", req: true },
  };

  if (submitted) {
    return (
      <div style={{ textAlign: "center", paddingTop: 40 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📸</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 2, color: WH, marginBottom: 8 }}>PHOTOS <span style={{ color: G }}>SUBMITTED</span></div>
        <div style={{ fontSize: 13, color: MT, marginBottom: 8 }}>Job {job.id} marked complete.</div>
        <div style={{ fontSize: 12, color: MT, marginBottom: 24, lineHeight: 1.7 }}>
          Customer follow-up sequence, review request, and referral ask will fire automatically within 24 hours.
        </div>
        <Btn onClick={onBack} variant="primary">← Back to Job</Btn>
      </div>
    );
  }

  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: MT, cursor: "pointer", fontSize: 13, fontFamily: "'Barlow', sans-serif", marginBottom: 20, padding: 0 }}>← Back to Job</button>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 2, color: WH }}>PHOTO <span style={{ color: G }}>SUBMISSION</span></div>
        <div style={{ fontSize: 12, color: MT }}>{job.customer} · Required before job closes</div>
      </div>

      <div style={{ background: "rgba(201,168,76,0.06)", border: `1px solid ${GD}44`, borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: G, lineHeight: 1.6 }}>
          ⚠ All 6 photos are required to close this job. Photos protect TruLight and the customer — no exceptions.
        </div>
      </div>

      <Divider title="Required Photos" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {Object.entries(labels).map(([key, meta]) => (
          <div key={key} onClick={() => setPhotos(p => ({ ...p, [key]: !p[key] }))} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
            borderRadius: 8, cursor: "pointer",
            background: photos[key] ? "rgba(39,174,96,0.07)" : "#111",
            border: `1px solid ${photos[key] ? "rgba(39,174,96,0.3)" : BR}`,
            transition: "all 0.15s",
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
              border: `2px solid ${photos[key] ? GR : BR}`,
              background: photos[key] ? GR : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s",
            }}>
              {photos[key] && <span style={{ color: WH, fontSize: 12, fontWeight: 900 }}>✓</span>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: photos[key] ? MT : WH, fontWeight: 600, fontFamily: "'Barlow', sans-serif" }}>{meta.label}</div>
              <div style={{ fontSize: 11, color: MT, marginTop: 2 }}>{meta.sub}</div>
            </div>
            <div style={{ fontSize: 22 }}>{photos[key] ? "✅" : "📷"}</div>
          </div>
        ))}
      </div>

      <Divider title="Closeout" />
      <div style={{ marginBottom: 16 }}>
        <div style={s.label}>Completion Notes (optional)</div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Any issues, customer feedback, or notes for the PM..."
          style={{ ...s.input, minHeight: 80, resize: "vertical" }} />
      </div>

      <div onClick={() => setBalance(b => !b)} style={{
        display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
        padding: "12px 14px", borderRadius: 7, marginBottom: 20,
        background: balance ? "rgba(39,174,96,0.07)" : "#111",
        border: `1px solid ${balance ? "rgba(39,174,96,0.3)" : BR}`,
      }}>
        <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${balance ? GR : BR}`, background: balance ? GR : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {balance && <span style={{ color: WH, fontSize: 10, fontWeight: 900 }}>✓</span>}
        </div>
        <span style={{ fontSize: 13, color: balance ? WH : MT }}>✓ Remaining balance collected from customer</span>
      </div>

      <Btn onClick={async () => {
          try {
            await fetch(APPS_SCRIPT_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "submitPhotos", jobID: job.id, photos, notes, balanceCollected: balance }) });
          } catch(e) {}
          setSubmitted(true);
        }} disabled={!allDone || !balance} variant="success">
        {!allDone ? `Submit Photos (${required.filter(k => photos[k]).length}/6 complete)` : !balance ? "Confirm Balance Collected" : "Close Job & Submit ✓"}
      </Btn>
    </div>
  );
}

// 6. ON-SITE LEAD CAPTURE
function LeadCapture({ job, onBack }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", address: "", phone: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  if (submitted) {
    return (
      <div style={{ textAlign: "center", paddingTop: 40 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🏠</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 2, color: WH, marginBottom: 8 }}>LEAD <span style={{ color: G }}>CAPTURED</span></div>
        <div style={{ fontSize: 13, color: MT, marginBottom: 8 }}>
          {form.firstName} {form.lastName} added to pipeline.
        </div>
        <div style={{ fontSize: 12, color: MT, marginBottom: 24, lineHeight: 1.7 }}>
          Attributed to you as <strong style={{ color: G }}>Installer-Generated</strong>. Salesperson will be notified for follow-up.
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Btn onClick={() => { setForm({ firstName: "", lastName: "", address: "", phone: "", notes: "" }); setSubmitted(false); }} variant="outline">Capture Another</Btn>
          <Btn onClick={onBack} variant="primary">← Back to Job</Btn>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: MT, cursor: "pointer", fontSize: 13, fontFamily: "'Barlow', sans-serif", marginBottom: 20, padding: 0 }}>← Back to Job</button>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 2, color: WH }}>ON-SITE <span style={{ color: G }}>LEAD CAPTURE</span></div>
        <div style={{ fontSize: 12, color: MT }}>Prospecting near {job.address}</div>
      </div>

      <div style={{ background: "rgba(230,126,34,0.07)", border: "1px solid rgba(230,126,34,0.25)", borderRadius: 8, padding: "12px 14px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "#E67E22", lineHeight: 1.7 }}>
          🏘 You're at <strong>{job.neighborhood}</strong>. Every neighbor you knock earns you installer attribution credit. The more you capture, the higher your commission potential.
        </div>
      </div>

      <Divider title="Homeowner Info" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div>
          <div style={s.label}>First Name *</div>
          <Inp value={form.firstName} onChange={v => set("firstName", v)} placeholder="First" />
        </div>
        <div>
          <div style={s.label}>Last Name *</div>
          <Inp value={form.lastName} onChange={v => set("lastName", v)} placeholder="Last" />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={s.label}>Their Address *</div>
        <Inp value={form.address} onChange={v => set("address", v)} placeholder="Street address" />
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={s.label}>Phone Number</div>
        <Inp type="tel" value={form.phone} onChange={v => set("phone", v)} placeholder="(555) 000-0000" />
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={s.label}>Quick Notes</div>
        <Inp value={form.notes} onChange={v => set("notes", v)} placeholder="Interested, said call back next week, HOA concern..." />
      </div>

      <div style={{ ...s.card, borderColor: `${GD}44`, marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: GD, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 4 }}>Auto Attribution</div>
        <div style={{ fontSize: 12, color: MT, lineHeight: 1.6 }}>
          This lead will be tagged as <span style={{ color: G }}>Installer-Generated</span> from job <span style={{ color: G }}>{job.id}</span> in {job.neighborhood}. Your name will be attached for commission tracking.
        </div>
      </div>

      <Btn onClick={async () => {
          try {
            await fetch(APPS_SCRIPT_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "captureOnSiteLead", ...form, activeJobAddress: job.address, neighborhood: job.neighborhood }) });
          } catch(e) {}
          setSubmitted(true);
        }} disabled={!form.firstName || !form.lastName || !form.address} variant="primary">
        Submit Lead →
      </Btn>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: "jobs", icon: "📋", label: "Jobs" },
  { id: "schedule", icon: "📅", label: "Schedule" },
];

function Schedule({ onSelectJob }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, color: WH, marginBottom: 4 }}>
        INSTALL <span style={{ color: G }}>SCHEDULE</span>
      </div>
      <div style={{ fontSize: 12, color: MT, marginBottom: 24 }}>Your next 7 days</div>

      {days.map(day => {
        const ds = day.toISOString().split("T")[0];
        const dayJobs = MOCK_JOBS.filter(j => j.date === ds);
        const isToday = ds === new Date().toISOString().split("T")[0];
        return (
          <div key={ds} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13,
                letterSpacing: 1, textTransform: "uppercase",
                color: isToday ? G : MT,
              }}>
                {isToday ? "Today — " : ""}{day.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              </div>
              {isToday && <Tag label="Today" color={G} />}
              {dayJobs.length === 0 && <span style={{ fontSize: 11, color: "#333" }}>— No jobs</span>}
            </div>
            {dayJobs.map(job => <JobCard key={job.id} job={job} onSelect={onSelectJob} highlight={isToday} />)}
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("jobs");
  const [selectedJob, setSelectedJob] = useState(null);
  const [view, setView] = useState("detail"); // detail | checklist | materials | photos | lead

  const handleSelectJob = (job) => { setSelectedJob(job); setView("detail"); };
  const backToDetail = () => setView("detail");
  const backToJobs = () => setSelectedJob(null);

  return (
    <div style={{ background: BK, minHeight: "100vh", fontFamily: "'Barlow', sans-serif", color: WH, backgroundImage: "linear-gradient(rgba(201,168,76,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.02) 1px, transparent 1px)", backgroundSize: "36px 36px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600&family=Barlow+Condensed:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${BR}`, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "rgba(10,10,10,0.97)", zIndex: 10, backdropFilter: "blur(8px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: G, boxShadow: `0 0 8px ${G}` }} />
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 3, color: WH }}>
            TRULIGHT <span style={{ color: G }}>INSTALLER</span>
          </div>
        </div>
        <Tag label="Field Portal" color={GD} />
      </div>

      {/* Body */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 18px 100px" }}>
        {!selectedJob && tab === "jobs" && <JobBoard onSelectJob={handleSelectJob} />}
        {!selectedJob && tab === "schedule" && <Schedule onSelectJob={handleSelectJob} />}

        {selectedJob && view === "detail" && (
          <JobDetail
            job={selectedJob}
            onBack={backToJobs}
            onOpenChecklist={() => setView("checklist")}
            onOpenMaterials={() => setView("materials")}
            onOpenPhotos={() => setView("photos")}
            onOpenLead={() => setView("lead")}
          />
        )}
        {selectedJob && view === "checklist" && <InstallChecklist job={selectedJob} onBack={backToDetail} />}
        {selectedJob && view === "materials" && <MaterialsCalc job={selectedJob} onBack={backToDetail} />}
        {selectedJob && view === "photos" && <PhotoSubmit job={selectedJob} onBack={backToDetail} />}
        {selectedJob && view === "lead" && <LeadCapture job={selectedJob} onBack={backToDetail} />}
      </div>

      {/* Bottom nav */}
      {!selectedJob && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(10,10,10,0.97)", borderTop: `1px solid ${BR}`, display: "flex", backdropFilter: "blur(8px)", zIndex: 10 }}>
          {TABS.map(t => (
            <div key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              padding: "12px 0", cursor: "pointer",
              borderTop: `2px solid ${tab === t.id ? G : "transparent"}`,
              transition: "border-color 0.2s",
            }}>
              <span style={{ fontSize: 20, marginBottom: 3 }}>{t.icon}</span>
              <span style={{ fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: tab === t.id ? G : MT }}>{t.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
