import { useState, useEffect } from "react";

const GOLD = "#C9A84C";
const GOLD_DIM = "#7A6230";
const GOLD_LIGHT = "#E8C96A";
const BLACK = "#0A0A0A";
const DARK = "#111111";
const CARD = "#161616";
const BORDER = "#2A2A2A";
const WHITE = "#F5F0E8";
const MUTED = "#666";
const RED = "#C0392B";
const GREEN = "#27AE60";

const inputStyle = {
  width: "100%",
  background: "#111",
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  padding: "10px 14px",
  color: WHITE,
  fontSize: 14,
  fontFamily: "'Barlow', sans-serif",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  color: GOLD_DIM,
  marginBottom: 6,
  fontFamily: "'Barlow Condensed', sans-serif",
};

const selectStyle = { ...inputStyle, cursor: "pointer" };

function Field({ label, children, required }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={labelStyle}>{label}{required && <span style={{ color: GOLD, marginLeft: 4 }}>*</span>}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", required }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...inputStyle, borderColor: focused ? GOLD_DIM : BORDER }}
    />
  );
}

function Select({ value, onChange, options, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...selectStyle, borderColor: focused ? GOLD_DIM : BORDER, color: value ? WHITE : MUTED }}
    >
      <option value="" disabled style={{ color: MUTED }}>{placeholder || "Select..."}</option>
      {options.map(o => (
        <option key={o.value || o} value={o.value || o} style={{ background: DARK, color: WHITE }}>
          {o.label || o}
        </option>
      ))}
    </select>
  );
}

function RadioGroup({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {options.map(opt => (
        <div
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "10px 14px",
            borderRadius: 6,
            border: `1px solid ${value === opt.value ? GOLD_DIM : BORDER}`,
            background: value === opt.value ? "rgba(201,168,76,0.06)" : "#111",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          <div style={{
            width: 16, height: 16, borderRadius: "50%",
            border: `2px solid ${value === opt.value ? GOLD : BORDER}`,
            background: value === opt.value ? GOLD : "transparent",
            flexShrink: 0, marginTop: 2,
            transition: "all 0.15s",
          }} />
          <div>
            <div style={{ fontSize: 13, color: WHITE, fontWeight: 600, fontFamily: "'Barlow', sans-serif" }}>{opt.label}</div>
            {opt.sub && <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{opt.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function CheckRow({ label, value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "6px 0"
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: 4,
        border: `2px solid ${value ? GOLD : BORDER}`,
        background: value ? GOLD : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "all 0.15s",
      }}>
        {value && <span style={{ color: BLACK, fontSize: 11, fontWeight: 900 }}>✓</span>}
      </div>
      <span style={{ fontSize: 13, color: value ? WHITE : MUTED, fontFamily: "'Barlow', sans-serif" }}>{label}</span>
    </div>
  );
}

function SectionDivider({ title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0 18px" }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: GOLD, opacity: 0.6, whiteSpace: "nowrap" }}>{title}</div>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${GOLD_DIM}44, transparent)` }} />
    </div>
  );
}

const STEPS = [
  { id: 1, label: "Lead Source", icon: "📡" },
  { id: 2, label: "Contact Info", icon: "👤" },
  { id: 3, label: "Property", icon: "🏠" },
  { id: 4, label: "Quote", icon: "💰" },
  { id: 5, label: "Timing", icon: "📅" },
  { id: 6, label: "Review & Submit", icon: "✅" },
];

const initialForm = {
  // Meta
  salesperson: "",
  leadDate: new Date().toISOString().split("T")[0],
  leadTime: new Date().toTimeString().slice(0, 5),

  // Lead Source
  leadOriginCategory: "",
  companySourceType: "",
  selfGenType: "",
  referralCustomerName: "",
  referralCustomerAddress: "",
  referralSalesperson: "",
  installerJobAddress: "",
  organicNotes: "",
  neighborhood: "",

  // Contact
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  zip: "",
  phone: "",
  bestContactTime: "",
  email: "",
  isHomeowner: "yes",
  isDecisionMaker: "",

  // Property
  homeStyle: "",
  estimatedLinearFt: "",
  rooflineSelections: [],
  obstacles: "",
  homePhotoUrl: "",

  // Quote
  quotedPricePerFt: "38.50",
  totalLinearFt: "",
  controllerIncluded: true,
  totalQuoteAmount: "",
  depositAmount: "",
  depositCollected: false,
  paymentMethod: "",
  leadStatus: "New",
  lostReason: "",

  // Timing
  preferredInstallDate: "",
  preferredInstallTime: "",
  specialEvents: "",
  notes: "",
};

function calcQuote(form) {
  const ft = parseFloat(form.totalLinearFt) || 0;
  const ppf = parseFloat(form.quotedPricePerFt) || 0;
  const controller = form.controllerIncluded ? 650 : 0;
  return (ft * ppf + controller).toFixed(2);
}

function commissionTier(source) {
  if (source === "self") return "Self-Gen — Higher Commission Tier";
  if (source === "installer") return "Installer-Gen — Installer Attribution";
  if (source === "referral_customer") return "Customer Referral — Standard + Referral Bonus";
  if (source === "company") return "Company-Gen — Standard Commission";
  return "";
}

export default function App() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  useEffect(() => {
    const total = calcQuote(form);
    setForm(f => ({ ...f, totalQuoteAmount: total }));
  }, [form.totalLinearFt, form.quotedPricePerFt, form.controllerIncluded]);

  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!form.salesperson) e.salesperson = true;
      if (!form.leadOriginCategory) e.leadOriginCategory = true;
      if (!form.neighborhood) e.neighborhood = true;
    }
    if (step === 2) {
      if (!form.firstName) e.firstName = true;
      if (!form.lastName) e.lastName = true;
      if (!form.address) e.address = true;
      if (!form.phone) e.phone = true;
      if (!form.isHomeowner) e.isHomeowner = true;
      if (!form.isDecisionMaker) e.isDecisionMaker = true;
    }
    if (step === 3) {
      if (!form.homeStyle) e.homeStyle = true;
      if (!form.estimatedLinearFt) e.estimatedLinearFt = true;
    }
    if (step === 4) {
      if (!form.quotedPricePerFt) e.quotedPricePerFt = true;
      if (!form.totalLinearFt) e.totalLinearFt = true;
      if (!form.leadStatus) e.leadStatus = true;
    }
    if (step === 5) {
      if (!form.preferredInstallDate) e.preferredInstallDate = true;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => Math.min(s + 1, 6)); };
  const back = () => setStep(s => Math.max(s - 1, 1));

  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzFHc8MR_9O1wPoGW2aQofO59P_1O4rZ5pX3HhBVGECkiDvINeLHcuhsxLtynjqW_uh/exec";

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submitLead", ...form }),
      });
      setSubmitted(true);
    } catch (err) {
      alert("Submission error — check your connection and try again.\n\n" + err.message);
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div style={{ background: BLACK, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backgroundImage: "linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px)", backgroundSize: "36px 36px" }}>
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600&family=Barlow+Condensed:wght@400;600;700&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, letterSpacing: 3, color: WHITE, marginBottom: 8 }}>LEAD <span style={{ color: GOLD }}>SUBMITTED</span></div>
          <div style={{ fontSize: 14, color: MUTED, marginBottom: 32, lineHeight: 1.7 }}>
            Lead for <strong style={{ color: WHITE }}>{form.firstName} {form.lastName}</strong> has been logged.<br />
            Automated follow-up sequence is now active.
          </div>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20, textAlign: "left", marginBottom: 24 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: 2, color: GOLD, textTransform: "uppercase", marginBottom: 14, opacity: 0.7 }}>What Happens Next</div>
            {[
              { icon: "📧", text: `Confirmation email queued to ${form.email || "client"}` },
              { icon: "📋", text: "Salesperson task created for Day 2 follow-up" },
              { icon: "📅", text: `Google Calendar event created — ${form.preferredInstallDate ? new Date(form.preferredInstallDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "date TBD"}${form.preferredInstallTime ? " at " + form.preferredInstallTime : ""}` },
              { icon: "🔔", text: "Follow-up sequence Days 0→60 activated" },
              { icon: form.leadStatus === "Closed Won" ? "🚀" : "⏳", text: form.leadStatus === "Closed Won" ? "Job opportunity sent to Project Manager" : "Pipeline status: " + form.leadStatus },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: MUTED, fontFamily: "'Barlow', sans-serif" }}>{item.text}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => { setForm(initialForm); setStep(1); setSubmitted(false); }}
            style={{ background: GOLD, color: BLACK, border: "none", borderRadius: 6, padding: "12px 32px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}
          >
            Enter New Lead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: BLACK, minHeight: "100vh", fontFamily: "'Barlow', sans-serif", color: WHITE, backgroundImage: "linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px)", backgroundSize: "36px 36px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600&family=Barlow+Condensed:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "rgba(10,10,10,0.97)", zIndex: 10, backdropFilter: "blur(8px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: GOLD, boxShadow: `0 0 10px ${GOLD}` }} />
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3, color: WHITE }}>
            TRULIGHT <span style={{ color: GOLD }}>GEORGIA</span>
          </div>
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: 2, color: MUTED, textTransform: "uppercase" }}>
          Lead Intake — Step {step} of 6
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: BORDER }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg, ${GOLD_DIM}, ${GOLD})`, width: `${(step / 6) * 100}%`, transition: "width 0.3s ease" }} />
      </div>

      {/* Step tabs */}
      <div style={{ display: "flex", overflowX: "auto", borderBottom: `1px solid ${BORDER}`, padding: "0 16px" }}>
        {STEPS.map(s => (
          <div
            key={s.id}
            onClick={() => s.id < step && setStep(s.id)}
            style={{
              padding: "12px 16px",
              display: "flex", alignItems: "center", gap: 6,
              borderBottom: `2px solid ${step === s.id ? GOLD : "transparent"}`,
              color: step === s.id ? GOLD : s.id < step ? MUTED : "#333",
              cursor: s.id < step ? "pointer" : "default",
              whiteSpace: "nowrap",
              transition: "color 0.2s",
              fontSize: 12,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            <span style={{ fontSize: 14 }}>{s.icon}</span>
            {s.label}
            {s.id < step && <span style={{ color: GREEN, fontSize: 12 }}>✓</span>}
          </div>
        ))}
      </div>

      {/* Form body */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px 120px" }}>

        {/* STEP 1: LEAD SOURCE */}
        {step === 1 && (
          <div>
            <StepTitle icon="📡" title="Lead Source" sub="Where did this lead come from and who captured it?" />

            <SectionDivider title="Salesperson Info" />
            <Field label="Your Name" required>
              <Input value={form.salesperson} onChange={v => set("salesperson", v)} placeholder="Full name" />
              {errors.salesperson && <ErrMsg />}
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Date">
                <Input type="date" value={form.leadDate} onChange={v => set("leadDate", v)} />
              </Field>
              <Field label="Time">
                <Input type="time" value={form.leadTime} onChange={v => set("leadTime", v)} />
              </Field>
            </div>

            <SectionDivider title="Lead Origin" />
            <Field label="How did this lead originate?" required>
              <RadioGroup
                value={form.leadOriginCategory}
                onChange={v => set("leadOriginCategory", v)}
                options={[
                  { value: "company", label: "Company-Generated", sub: "Meta ad, Google ad, yard sign scan, door hanger QR, website form" },
                  { value: "self", label: "Self-Generated by Salesperson", sub: "Cold knock, cold call, personal network — higher commission tier" },
                  { value: "referral_customer", label: "Customer Referral", sub: "Existing client referred this homeowner" },
                  { value: "referral_salesperson", label: "Salesperson Referral Network", sub: "Your personal referral contact sent them" },
                  { value: "installer", label: "Installer-Generated", sub: "Installer canvassed this home while on a nearby job" },
                  { value: "organic", label: "Organic / Unknown", sub: "Saw lights on a house, called in directly, source unclear" },
                ]}
              />
              {errors.leadOriginCategory && <ErrMsg />}
            </Field>

            {/* Conditional sub-fields */}
            {form.leadOriginCategory === "company" && (
              <Field label="Which company channel?">
                <Select value={form.companySourceType} onChange={v => set("companySourceType", v)} placeholder="Select channel" options={["Meta Ad", "Google Ad", "Yard Sign QR Scan", "Door Hanger QR", "Website Form", "Truck Wrap", "Company Event"]} />
              </Field>
            )}
            {form.leadOriginCategory === "self" && (
              <Field label="How did you generate this lead?">
                <Select value={form.selfGenType} onChange={v => set("selfGenType", v)} placeholder="Select method" options={["Cold Door Knock", "Cold Call", "Personal Network", "Social Media (Personal)", "Community Group", "Other"]} />
              </Field>
            )}
            {form.leadOriginCategory === "referral_customer" && (
              <>
                <Field label="Referring Customer Name" required>
                  <Input value={form.referralCustomerName} onChange={v => set("referralCustomerName", v)} placeholder="Full name of referring customer" />
                </Field>
                <Field label="Referring Customer Address">
                  <Input value={form.referralCustomerAddress} onChange={v => set("referralCustomerAddress", v)} placeholder="Their address (for commission tracking)" />
                </Field>
              </>
            )}
            {form.leadOriginCategory === "installer" && (
              <Field label="Active Job Address (where installer was working)">
                <Input value={form.installerJobAddress} onChange={v => set("installerJobAddress", v)} placeholder="Address of the job being installed" />
              </Field>
            )}
            {form.leadOriginCategory === "organic" && (
              <Field label="Any notes on how they found us?">
                <Input value={form.organicNotes} onChange={v => set("organicNotes", v)} placeholder="Optional details..." />
              </Field>
            )}

            {form.leadOriginCategory && (
              <div style={{ background: "rgba(201,168,76,0.06)", border: `1px solid ${GOLD_DIM}44`, borderRadius: 8, padding: "10px 14px", marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: GOLD_DIM, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>
                  💼 Commission Attribution: <span style={{ color: GOLD }}>{commissionTier(form.leadOriginCategory)}</span>
                </div>
              </div>
            )}

            <Field label="Neighborhood / Subdivision" required>
              <Input value={form.neighborhood} onChange={v => set("neighborhood", v)} placeholder="e.g. Windward, Milton Walk, The Manor..." />
              {errors.neighborhood && <ErrMsg />}
            </Field>
          </div>
        )}

        {/* STEP 2: CONTACT */}
        {step === 2 && (
          <div>
            <StepTitle icon="👤" title="Contact Information" sub="Homeowner details and best way to reach them" />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="First Name" required>
                <Input value={form.firstName} onChange={v => set("firstName", v)} placeholder="First" />
                {errors.firstName && <ErrMsg />}
              </Field>
              <Field label="Last Name" required>
                <Input value={form.lastName} onChange={v => set("lastName", v)} placeholder="Last" />
                {errors.lastName && <ErrMsg />}
              </Field>
            </div>

            <Field label="Street Address" required>
              <Input value={form.address} onChange={v => set("address", v)} placeholder="123 Main Street" />
              {errors.address && <ErrMsg />}
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
              <Field label="City">
                <Input value={form.city} onChange={v => set("city", v)} placeholder="City" />
              </Field>
              <Field label="ZIP">
                <Input value={form.zip} onChange={v => set("zip", v)} placeholder="ZIP" />
              </Field>
            </div>

            <SectionDivider title="Contact Details" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Phone Number" required>
                <Input type="tel" value={form.phone} onChange={v => set("phone", v)} placeholder="(555) 000-0000" />
                {errors.phone && <ErrMsg />}
              </Field>
              <Field label="Best Time to Contact">
                <Select value={form.bestContactTime} onChange={v => set("bestContactTime", v)} placeholder="Select time" options={["Morning (8–11 AM)", "Midday (11 AM–2 PM)", "Afternoon (2–5 PM)", "Evening (5–8 PM)", "Anytime"]} />
              </Field>
            </div>
            <Field label="Email Address">
              <Input type="email" value={form.email} onChange={v => set("email", v)} placeholder="homeowner@email.com" />
            </Field>

            <SectionDivider title="Qualification" />
            <Field label="Confirmed homeowner?" required>
              <RadioGroup value={form.isHomeowner} onChange={v => set("isHomeowner", v)} options={[
                { value: "yes", label: "Yes — confirmed homeowner" },
                { value: "unknown", label: "Unconfirmed — need to verify" },
              ]} />
              {errors.isHomeowner && <ErrMsg />}
            </Field>
            {form.isHomeowner === "unknown" && (
              <div style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.3)", borderRadius: 8, padding: "12px 14px", marginBottom: 18 }}>
                <div style={{ fontSize: 12, color: "#E74C3C", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>⚠ Verify Before Proceeding</div>
                <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>TruLight Georgia only installs for homeowners. Confirm ownership before investing further time in this lead. Only homeowners can approve permanent exterior installations.</div>
              </div>
            )}
            <Field label="Are they the decision maker?" required>
              <RadioGroup value={form.isDecisionMaker} onChange={v => set("isDecisionMaker", v)} options={[
                { value: "yes", label: "Yes — sole decision maker" },
                { value: "shared", label: "Shared decision (spouse / partner)" },
                { value: "no", label: "No — need to involve someone else" },
              ]} />
              {errors.isDecisionMaker && <ErrMsg />}
            </Field>
          </div>
        )}

        {/* STEP 3: PROPERTY */}
        {step === 3 && (
          <div>
            <StepTitle icon="🏠" title="Property Details" sub="Home specifications for accurate quoting and install planning" />

            <Field label="Home Style" required>
              <Select value={form.homeStyle} onChange={v => set("homeStyle", v)} placeholder="Select style" options={["Single Story", "Two Story", "Ranch / Sprawling", "Multi-Level / Split", "Townhome", "Estate / Large Custom"]} />
              {errors.homeStyle && <ErrMsg />}
            </Field>

            <Field label="Estimated Linear Footage" required>
              <Input type="number" value={form.estimatedLinearFt} onChange={v => { set("estimatedLinearFt", v); set("totalLinearFt", v); }} placeholder="e.g. 180" />
              {errors.estimatedLinearFt && <ErrMsg />}
              {form.estimatedLinearFt && (
                <div style={{ fontSize: 11, color: GOLD_DIM, marginTop: 6 }}>
                  Estimated range: {(parseFloat(form.estimatedLinearFt) * 35).toFixed(0)} – {(parseFloat(form.estimatedLinearFt) * 42).toFixed(0)} ft² at $35–$42/ft
                </div>
              )}
            </Field>

            <Field label="Roofline Characteristics">
              {[
                "Steep Pitch", "Gutters Present", "Dormers", "Hip Roof", "Gable Roof",
                "Flat / Low Slope", "Second Story Overhang", "Wrap-Around", "HOA Restrictions", "Hard Access"
              ].map(opt => (
                <CheckRow
                  key={opt}
                  label={opt}
                  value={(form.rooflineSelections || []).includes(opt)}
                  onChange={checked => {
                    const current = form.rooflineSelections || [];
                    set("rooflineSelections", checked ? [...current, opt] : current.filter(x => x !== opt));
                  }}
                />
              ))}
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, color: GOLD_DIM, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 6 }}>Other Notes</div>
                <Input value={form.rooflineNotes} onChange={v => set("rooflineNotes", v)} placeholder="Any additional roofline details..." />
              </div>
            </Field>

            <Field label="Obstacles or Access Issues">
              <Input value={form.obstacles} onChange={v => set("obstacles", v)} placeholder="e.g. large trees, steep driveway, HOA restrictions..." />
            </Field>

            <Field label="Home Photo URL (optional)">
              <Input value={form.homePhotoUrl} onChange={v => set("homePhotoUrl", v)} placeholder="Google Drive link, iCloud, etc." />
              <div style={{ fontSize: 11, color: MUTED, marginTop: 5 }}>Upload photo to Drive and paste the share link. Used for mockup demo.</div>
            </Field>
          </div>
        )}

        {/* STEP 4: QUOTE */}
        {step === 4 && (
          <div>
            <StepTitle icon="💰" title="Quote Details" sub="Pricing, status, and deposit collection" />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Price Per Linear Foot ($)" required>
                <Input type="number" value={form.quotedPricePerFt} onChange={v => set("quotedPricePerFt", v)} placeholder="38.50" />
                {errors.quotedPricePerFt && <ErrMsg />}
              </Field>
              <Field label="Total Linear Feet" required>
                <Input type="number" value={form.totalLinearFt} onChange={v => set("totalLinearFt", v)} placeholder="e.g. 180" />
                {errors.totalLinearFt && <ErrMsg />}
              </Field>
            </div>

            <Field label="">
              <CheckRow label="Controller included (+$650)" value={form.controllerIncluded} onChange={v => set("controllerIncluded", v)} />
            </Field>

            {/* Quote total callout */}
            <div style={{ background: "linear-gradient(135deg, #1C1500, #161616)", border: `1px solid ${GOLD_DIM}`, borderRadius: 8, padding: "16px 20px", marginBottom: 20 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: GOLD_DIM, marginBottom: 4 }}>Calculated Quote Total</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, color: GOLD_LIGHT, letterSpacing: 2 }}>
                ${parseFloat(form.totalQuoteAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                {form.totalLinearFt} ft × ${form.quotedPricePerFt}/ft{form.controllerIncluded ? " + $650 controller" : ""}
              </div>
            </div>

            <Field label="Lead Status" required>
              <Select value={form.leadStatus} onChange={v => set("leadStatus", v)} placeholder="Select status" options={[
                { value: "New", label: "New — Just contacted" },
                { value: "Quoted", label: "Quoted — Proposal sent" },
                { value: "Follow-Up", label: "Follow-Up — Pending response" },
                { value: "Hot", label: "Hot — Ready to close" },
                { value: "Closed Won", label: "Closed Won ✓" },
                { value: "Closed Lost", label: "Closed Lost ✗" },
              ]} />
              {errors.leadStatus && <ErrMsg />}
            </Field>

            {form.leadStatus === "Closed Lost" && (
              <Field label="Lost Reason">
                <Select value={form.lostReason} onChange={v => set("lostReason", v)} placeholder="Select reason" options={["Price too high", "Went with competitor", "Not ready / timing", "HOA restrictions", "No longer interested", "No response", "Other"]} />
              </Field>
            )}

            {form.leadStatus === "Closed Won" && (
              <>
                <SectionDivider title="Deposit Collection" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="Deposit Amount ($)">
                    <Input type="number" value={form.depositAmount} onChange={v => set("depositAmount", v)} placeholder="e.g. 500" />
                  </Field>
                  <Field label="Payment Method">
                    <Select value={form.paymentMethod} onChange={v => set("paymentMethod", v)} placeholder="Select" options={["Cash", "Check", "Venmo", "Zelle", "Credit Card", "Square", "Other"]} />
                  </Field>
                </div>
                <Field label="">
                  <CheckRow label="Deposit collected" value={form.depositCollected} onChange={v => set("depositCollected", v)} />
                </Field>
              </>
            )}
          </div>
        )}

        {/* STEP 5: TIMING */}
        {step === 5 && (
          <div>
            <StepTitle icon="📅" title="Scheduling & Notes" sub="Pick an install date directly on the calendar" />

            <Field label="Preferred Install Date" required>
              <Input
                type="date"
                value={form.preferredInstallDate || ""}
                onChange={v => set("preferredInstallDate", v)}
              />
              {errors.preferredInstallDate && <ErrMsg />}
            </Field>

            <Field label="Preferred Install Time">
              <Select
                value={form.preferredInstallTime || ""}
                onChange={v => set("preferredInstallTime", v)}
                placeholder="Select time slot"
                options={[
                  "Morning — 8:00 AM",
                  "Morning — 9:00 AM",
                  "Morning — 10:00 AM",
                  "Midday — 11:00 AM",
                  "Midday — 12:00 PM",
                  "Afternoon — 1:00 PM",
                  "Afternoon — 2:00 PM",
                  "Afternoon — 3:00 PM",
                  "Late Afternoon — 4:00 PM",
                ]}
              />
            </Field>

            {/* Calendar visual block */}
            {form.preferredInstallDate && (
              <div style={{ background: "linear-gradient(135deg, #1C1500, #161616)", border: `1px solid ${GOLD_DIM}`, borderRadius: 8, padding: "14px 18px", marginBottom: 18, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ fontSize: 32 }}>📅</div>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: GOLD_DIM, marginBottom: 2 }}>Install Scheduled</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: GOLD_LIGHT, letterSpacing: 1 }}>
                    {new Date(form.preferredInstallDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  </div>
                  {form.preferredInstallTime && (
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{form.preferredInstallTime}</div>
                  )}
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>This will create a Google Calendar event for the install team on submit.</div>
                </div>
              </div>
            )}

            <Field label="Special Events / Occasions">
              <Input value={form.specialEvents} onChange={v => set("specialEvents", v)} placeholder="e.g. Christmas, birthday party, HOA event, home sale..." />
            </Field>

            <Field label="Additional Notes">
              <textarea
                value={form.notes}
                onChange={e => set("notes", e.target.value)}
                placeholder="Anything else the PM or installer should know..."
                style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
              />
            </Field>
          </div>
        )}

        {/* STEP 6: REVIEW */}
        {step === 6 && (
          <div>
            <StepTitle icon="✅" title="Review & Submit" sub="Confirm all details before submitting to the pipeline" />

            {[
              {
                section: "Lead Source",
                rows: [
                  ["Salesperson", form.salesperson],
                  ["Date / Time", `${form.leadDate} at ${form.leadTime}`],
                  ["Origin", form.leadOriginCategory],
                  ["Neighborhood", form.neighborhood],
                  ["Commission Tier", commissionTier(form.leadOriginCategory)],
                ],
              },
              {
                section: "Contact",
                rows: [
                  ["Name", `${form.firstName} ${form.lastName}`],
                  ["Address", `${form.address}, ${form.city} ${form.zip}`],
                  ["Phone", form.phone],
                  ["Email", form.email || "—"],
                  ["Best Contact Time", form.bestContactTime || "—"],
                  ["Homeowner Confirmed", form.isHomeowner === "yes" ? "✓ Yes" : "⚠ Unconfirmed"],
                  ["Decision Maker", form.isDecisionMaker],
                ],
              },
              {
                section: "Property",
                rows: [
                  ["Home Style", form.homeStyle],
                  ["Est. Linear Footage", `${form.estimatedLinearFt} ft`],
                  ["Roofline", [...(form.rooflineSelections || []), form.rooflineNotes].filter(Boolean).join(", ") || "—"],
                  ["Obstacles", form.obstacles || "—"],
                ],
              },
              {
                section: "Quote",
                rows: [
                  ["Price Per Foot", `$${form.quotedPricePerFt}`],
                  ["Total Footage", `${form.totalLinearFt} ft`],
                  ["Controller", form.controllerIncluded ? "Yes (+$650)" : "No"],
                  ["Total Quote", `$${parseFloat(form.totalQuoteAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`],
                  ["Status", form.leadStatus],
                  ["Deposit Collected", form.depositCollected ? `Yes — $${form.depositAmount} via ${form.paymentMethod}` : "No"],
                ],
              },
              {
                section: "Timing",
                rows: [
                  ["Install Date", form.preferredInstallDate ? new Date(form.preferredInstallDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "—"],
                  ["Install Time", form.preferredInstallTime || "—"],
                  ["Special Events", form.specialEvents || "—"],
                  ["Notes", form.notes || "—"],
                ],
              },
            ].map(block => (
              <div key={block.section} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "14px 16px", marginBottom: 12 }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: GOLD, marginBottom: 10, opacity: 0.7 }}>{block.section}</div>
                {block.rows.map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid #1e1e1e`, fontSize: 13 }}>
                    <span style={{ color: MUTED, fontWeight: 400 }}>{k}</span>
                    <span style={{ color: WHITE, fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{v || "—"}</span>
                  </div>
                ))}
              </div>
            ))}

            {/* Automation preview */}
            <div style={{ background: "rgba(39,174,96,0.06)", border: "1px solid rgba(39,174,96,0.2)", borderRadius: 8, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: GREEN, marginBottom: 10, opacity: 0.8 }}>🚀 Actions That Will Fire On Submit</div>
              {[
                form.email && "✉️ Confirmation email sent to client",
                "📋 Salesperson Day-2 follow-up task created",
                "📅 Follow-up sequence (Day 0→60) activated",
                form.leadStatus === "Closed Won" && "🏗 Job opportunity pushed to Project Manager",
                form.leadStatus === "Closed Won" && "📦 Vendor job + install calendar event created",
                form.leadStatus === "Closed Won" && "🔧 Vendor material checklist generated",
              ].filter(Boolean).map((item, i) => (
                <div key={i} style={{ fontSize: 12, color: MUTED, marginBottom: 6, fontFamily: "'Barlow', sans-serif" }}>{item}</div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, gap: 12 }}>
          {step > 1 ? (
            <button onClick={back} style={{ flex: 1, background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 6, padding: "12px 20px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>
              ← Back
            </button>
          ) : <div style={{ flex: 1 }} />}

          {step < 6 ? (
            <button onClick={next} style={{ flex: 2, background: `linear-gradient(135deg, ${GOLD_DIM}, ${GOLD})`, color: BLACK, border: "none", borderRadius: 6, padding: "12px 20px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>
              Continue →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} style={{ flex: 2, background: submitting ? MUTED : GREEN, color: WHITE, border: "none", borderRadius: 6, padding: "12px 20px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: "uppercase", cursor: submitting ? "default" : "pointer", transition: "background 0.2s" }}>
              {submitting ? "Submitting..." : "Submit Lead ✓"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepTitle({ icon, title, sub }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, color: WHITE }}>
          {title}
        </div>
      </div>
      <div style={{ fontSize: 13, color: MUTED, fontWeight: 300, paddingLeft: 34 }}>{sub}</div>
    </div>
  );
}

function ErrMsg() {
  return <div style={{ fontSize: 11, color: RED, marginTop: 4, fontFamily: "'Barlow', sans-serif" }}>This field is required</div>;
}
