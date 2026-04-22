// ============================================================
// TRULIGHT GEORGIA — GOOGLE APPS SCRIPT BACKEND
// ============================================================
// SETUP INSTRUCTIONS AT BOTTOM OF THIS FILE
// Paste this entire file into Google Apps Script
// Extensions > Apps Script > paste > Save > Deploy
// ============================================================

// ─── CONFIGURATION ───────────────────────────────────────────
const CONFIG = {
  // ⚙️ REPLACE THESE VALUES WITH YOUR OWN
  SPREADSHEET_ID:       "YOUR_GOOGLE_SHEET_ID_HERE",
  PM_EMAIL:             "pm@trulightgeorgia.com",
  OWNER_EMAIL:          "kenny@trulightgeorgia.com",
  COMPANY_NAME:         "TruLight Georgia",
  COMPANY_PHONE:        "(770) 555-0100",
  COMPANY_WEBSITE:      "trulightgeorgia.com",
  CALENDAR_ID:          "primary", // or your install calendar ID
  FROM_NAME:            "TruLight Georgia",
  REPLY_TO:             "info@trulightgeorgia.com",

  // Sheet tab names — must match exactly
  SHEETS: {
    LEADS:      "Leads",
    JOBS:       "Jobs",
    INSTALLS:   "Installs",
    FOLLOWUPS:  "FollowUps",
    MATERIALS:  "Materials",
    PHOTOS:     "Photos",
  }
};

// ─── SHEET COLUMN MAPS ───────────────────────────────────────
// These define the column order in each sheet tab
const COLS = {
  LEADS: [
    "LeadID","Timestamp","Salesperson","LeadDate","LeadTime",
    "LeadOriginCategory","LeadSourceDetail","ReferralName","ReferralAddress",
    "InstallerJobAddress","Neighborhood","CommissionTier",
    "FirstName","LastName","Address","City","ZIP","Phone","BestContactTime","Email",
    "HomeownerConfirmed","DecisionMaker",
    "HomeStyle","EstLinearFt","RooflineSelections","RooflineNotes","Obstacles","HomePhotoURL",
    "QuotedPricePerFt","TotalLinearFt","ControllerIncluded","TotalQuoteAmount",
    "LeadStatus","LostReason","DepositAmount","DepositCollected","PaymentMethod",
    "PreferredInstallDate","PreferredInstallTime","SpecialEvents","Notes",
    "CalendarEventID","EmailSent","PMNotified","JobCreated"
  ],
  JOBS: [
    "JobID","LeadID","CreatedAt","Customer","Address","Neighborhood",
    "InstallDate","InstallTime","LinearFt","HomeStyle","Roofline",
    "ControllerIncluded","Notes","AssignedInstaller","Status",
    "ChecklistComplete","PhotosSubmitted","BalanceCollected","CompletedAt",
    "ReviewRequested","ReferralRequested","FollowUp30Sent"
  ],
  INSTALLS: [
    "InstallID","JobID","InstallerName","StartTime","EndTime",
    "ChecklistJSON","MaterialsUsed","NotesFromField","Status"
  ],
  FOLLOWUPS: [
    "FollowUpID","LeadID","JobID","Type","ScheduledDate","SentAt","Status","Notes"
  ],
  MATERIALS: [
    "MaterialID","JobID","LinearFt","Zones","LEDStrip","Channel","EndCaps",
    "Connectors","Screws","Caulk","WireClips","ZipTies","Controller","GeneratedAt"
  ],
  PHOTOS: [
    "PhotoID","JobID","InstallerName","Before","During","AfterDay",
    "AfterNight","ControllerPhoto","AppConnected","Notes","SubmittedAt"
  ],
};

// ─── UTILITY ─────────────────────────────────────────────────
function generateID(prefix) {
  return prefix + "-" + new Date().getFullYear() +
    String(Math.floor(Math.random() * 90000) + 10000);
}

function getSheet(name) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Write headers
    const headers = COLS[Object.keys(CONFIG.SHEETS).find(k => CONFIG.SHEETS[k] === name)];
    if (headers) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground("#1a1400").setFontColor("#C9A84C")
      .setFontWeight("bold").setFontSize(10);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function appendRow(sheetName, colKey, data) {
  const sheet = getSheet(sheetName);
  const cols = COLS[colKey];
  const row = cols.map(col => data[col] !== undefined ? data[col] : "");
  sheet.appendRow(row);
  return sheet.getLastRow();
}

function findRowByID(sheetName, colKey, idCol, idValue) {
  const sheet = getSheet(sheetName);
  const cols = COLS[colKey];
  const idIdx = cols.indexOf(idCol);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx] === idValue) return { row: i + 1, data: data[i], cols };
  }
  return null;
}

function updateCell(sheetName, colKey, rowNum, colName, value) {
  const sheet = getSheet(sheetName);
  const colIdx = COLS[colKey].indexOf(colName) + 1;
  if (colIdx > 0) sheet.getRange(rowNum, colIdx).setValue(value);
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const { action } = payload;

    const handlers = {
      submitLead:       () => handleLeadSubmission(payload),
      updateJobStatus:  () => handleJobStatusUpdate(payload),
      submitChecklist:  () => handleChecklistSubmit(payload),
      submitMaterials:  () => handleMaterialsLog(payload),
      submitPhotos:     () => handlePhotoSubmission(payload),
      captureOnSiteLead:() => handleOnSiteLead(payload),
    };

    if (handlers[action]) {
      const result = handlers[action]();
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, ...result }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: "Unknown action: " + action }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const { action, installer } = e.parameter;
  if (action === "getJobs") return getJobsForInstaller(installer);
  if (action === "ping") return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  return ContentService.createTextOutput(JSON.stringify({ error: "Unknown GET action" })).setMimeType(ContentService.MimeType.JSON);
}

// ─── 1. LEAD SUBMISSION ──────────────────────────────────────
function handleLeadSubmission(data) {
  const leadID = generateID("LEAD");
  const timestamp = new Date().toISOString();

  // Map commission tier
  const tierMap = {
    company:            "Standard — Company Gen",
    self:               "HIGH — Self Generated",
    referral_customer:  "Standard + Referral Bonus",
    referral_salesperson: "Standard — Salesperson Referral",
    installer:          "Installer Attribution",
    organic:            "Standard — Organic",
  };

  // 1a. Write lead row to Leads sheet
  appendRow("Leads", "LEADS", {
    LeadID: leadID,
    Timestamp: timestamp,
    Salesperson: data.salesperson || "",
    LeadDate: data.leadDate || "",
    LeadTime: data.leadTime || "",
    LeadOriginCategory: data.leadOriginCategory || "",
    LeadSourceDetail: data.companySourceType || data.selfGenType || data.organicNotes || "",
    ReferralName: data.referralCustomerName || "",
    ReferralAddress: data.referralCustomerAddress || "",
    InstallerJobAddress: data.installerJobAddress || "",
    Neighborhood: data.neighborhood || "",
    CommissionTier: tierMap[data.leadOriginCategory] || "Standard",
    FirstName: data.firstName || "",
    LastName: data.lastName || "",
    Address: data.address || "",
    City: data.city || "",
    ZIP: data.zip || "",
    Phone: data.phone || "",
    BestContactTime: data.bestContactTime || "",
    Email: data.email || "",
    HomeownerConfirmed: data.isHomeowner || "",
    DecisionMaker: data.isDecisionMaker || "",
    HomeStyle: data.homeStyle || "",
    EstLinearFt: data.estimatedLinearFt || "",
    RooflineSelections: (data.rooflineSelections || []).join(", "),
    RooflineNotes: data.rooflineNotes || "",
    Obstacles: data.obstacles || "",
    HomePhotoURL: data.homePhotoUrl || "",
    QuotedPricePerFt: data.quotedPricePerFt || "",
    TotalLinearFt: data.totalLinearFt || "",
    ControllerIncluded: data.controllerIncluded ? "Yes" : "No",
    TotalQuoteAmount: data.totalQuoteAmount || "",
    LeadStatus: data.leadStatus || "New",
    LostReason: data.lostReason || "",
    DepositAmount: data.depositAmount || "",
    DepositCollected: data.depositCollected ? "Yes" : "No",
    PaymentMethod: data.paymentMethod || "",
    PreferredInstallDate: data.preferredInstallDate || "",
    PreferredInstallTime: data.preferredInstallTime || "",
    SpecialEvents: data.specialEvents || "",
    Notes: data.notes || "",
    EmailSent: "No",
    PMNotified: "No",
    JobCreated: "No",
  });

  // 1b. Send confirmation email to client
  let calEventID = "";
  if (data.email) {
    sendClientConfirmationEmail(data, leadID);
    updateLeadField(leadID, "EmailSent", "Yes");
  }

  // 1c. Send salesperson task email
  sendSalespersonTaskEmail(data, leadID);

  // 1d. Schedule follow-up sequence
  scheduleFollowUpSequence(leadID, data);

  // 1e. Create Google Calendar event for install
  if (data.preferredInstallDate) {
    calEventID = createInstallCalendarEvent(data, leadID);
    updateLeadField(leadID, "CalendarEventID", calEventID);
  }

  // 1f. If Closed Won → create job + notify PM
  let jobID = "";
  if (data.leadStatus === "Closed Won") {
    jobID = createJobFromLead(data, leadID);
    notifyProjectManager(data, leadID, jobID);
    updateLeadField(leadID, "PMNotified", "Yes");
    updateLeadField(leadID, "JobCreated", jobID);
  }

  return { leadID, jobID, calEventID, message: "Lead submitted successfully" };
}

function updateLeadField(leadID, field, value) {
  const result = findRowByID("Leads", "LEADS", "LeadID", leadID);
  if (result) updateCell("Leads", "LEADS", result.row, field, value);
}

// ─── 2. CLIENT CONFIRMATION EMAIL ────────────────────────────
function sendClientConfirmationEmail(data, leadID) {
  const name = data.firstName || "Valued Customer";
  const date = data.preferredInstallDate
    ? new Date(data.preferredInstallDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    : "to be confirmed";
  const time = data.preferredInstallTime || "";
  const quote = parseFloat(data.totalQuoteAmount || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });

  const subject = `Your TruLight Georgia Quote — ${data.address}`;
  const body = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#161616;border:1px solid #2a2a2a;border-top:3px solid #C9A84C;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="padding:32px 36px 24px;border-bottom:1px solid #2a2a2a;">
          <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#C9A84C;margin-bottom:8px;">TruLight Georgia</div>
          <h1 style="margin:0;font-family:Arial,sans-serif;font-size:28px;font-weight:900;color:#F5F0E8;letter-spacing:1px;">Thank You, ${name}.</h1>
          <p style="margin:10px 0 0;font-size:14px;color:#666;line-height:1.6;">We've received your quote request and your install is tentatively scheduled. Here's a summary of everything.</p>
        </td></tr>

        <!-- Quote summary -->
        <tr><td style="padding:28px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:10px 0;border-bottom:1px solid #222;font-size:13px;color:#888;">Property</td>
                <td style="padding:10px 0;border-bottom:1px solid #222;font-size:13px;color:#F5F0E8;text-align:right;">${data.address}, ${data.city || ""}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #222;font-size:13px;color:#888;">Linear Footage</td>
                <td style="padding:10px 0;border-bottom:1px solid #222;font-size:13px;color:#F5F0E8;text-align:right;">${data.totalLinearFt} ft</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #222;font-size:13px;color:#888;">Controller</td>
                <td style="padding:10px 0;border-bottom:1px solid #222;font-size:13px;color:#F5F0E8;text-align:right;">${data.controllerIncluded ? "Included" : "Not included"}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #222;font-size:13px;color:#888;">Preferred Install</td>
                <td style="padding:10px 0;border-bottom:1px solid #222;font-size:13px;color:#F5F0E8;text-align:right;">${date}${time ? " · " + time : ""}</td></tr>
          </table>

          <!-- Total -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1a1400,#161616);border:1px solid #7A6230;border-radius:6px;margin:20px 0;">
            <tr><td style="padding:18px 20px;">
              <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7A6230;font-family:Arial,sans-serif;margin-bottom:6px;">Total Quote</div>
              <div style="font-size:36px;font-weight:900;color:#E8C96A;font-family:Arial,sans-serif;letter-spacing:1px;">${quote}</div>
            </td></tr>
          </table>

          <p style="font-size:13px;color:#888;line-height:1.7;margin:0 0 20px;">
            Your salesperson will follow up within 24 hours to confirm your install date and answer any questions. 
            In the meantime, feel free to reach out to us at <a href="tel:${CONFIG.COMPANY_PHONE}" style="color:#C9A84C;">${CONFIG.COMPANY_PHONE}</a>.
          </p>

          <table cellpadding="0" cellspacing="0"><tr><td style="background:#C9A84C;border-radius:5px;">
            <a href="https://${CONFIG.COMPANY_WEBSITE}" style="display:inline-block;padding:12px 28px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0a0a0a;text-decoration:none;">Visit Our Website</a>
          </td></tr></table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 36px;border-top:1px solid #2a2a2a;text-align:center;">
          <p style="margin:0;font-size:11px;color:#444;letter-spacing:1px;">
            ${CONFIG.COMPANY_NAME} · Alpharetta, GA · ${CONFIG.COMPANY_WEBSITE}<br>
            Lead ID: ${leadID}
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  MailApp.sendEmail({
    to: data.email,
    subject,
    htmlBody: body,
    name: CONFIG.FROM_NAME,
    replyTo: CONFIG.REPLY_TO,
  });
}

// ─── 3. SALESPERSON TASK EMAIL ────────────────────────────────
function sendSalespersonTaskEmail(data, leadID) {
  const salespersonEmail = getSalespersonEmail(data.salesperson);
  if (!salespersonEmail) return;

  const subject = `🔔 New Lead Logged — ${data.firstName} ${data.lastName} (${data.neighborhood})`;
  const body = `
<div style="font-family:Arial,sans-serif;background:#0a0a0a;padding:30px;color:#F5F0E8;">
  <div style="border-left:3px solid #C9A84C;padding-left:16px;margin-bottom:24px;">
    <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#C9A84C;margin-bottom:4px;">TruLight Georgia · New Lead</div>
    <h2 style="margin:0;font-size:22px;color:#F5F0E8;">${data.firstName} ${data.lastName}</h2>
    <div style="font-size:13px;color:#666;margin-top:4px;">${data.address}, ${data.city} · ${data.neighborhood}</div>
  </div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    ${[
      ["Lead ID", leadID],
      ["Status", data.leadStatus],
      ["Phone", data.phone],
      ["Best Time to Call", data.bestContactTime || "—"],
      ["Source", data.leadOriginCategory],
      ["Quote Total", "$" + parseFloat(data.totalQuoteAmount || 0).toFixed(2)],
      ["Install Date", data.preferredInstallDate || "TBD"],
    ].map(([k, v]) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #222;font-size:12px;color:#888;width:140px;">${k}</td>
      <td style="padding:8px 0;border-bottom:1px solid #222;font-size:12px;color:#F5F0E8;">${v}</td>
    </tr>`).join("")}
  </table>
  <div style="background:#1a1400;border:1px solid #7A6230;border-radius:6px;padding:16px;margin-bottom:20px;">
    <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7A6230;margin-bottom:8px;">📋 Your Next Actions</div>
    <div style="font-size:13px;color:#888;line-height:1.8;">
      ✓ Day 2 — Send visual mockup or neighborhood photo<br>
      ✓ Day 5 — Social proof follow-up<br>
      ✓ Day 10 — Urgency touchpoint<br>
      ✓ Day 21 — Soft check-in<br>
      ✓ Day 30–60 — Reactivation if no close
    </div>
  </div>
  <div style="font-size:11px;color:#444;">TruLight Georgia CRM · ${new Date().toLocaleDateString()}</div>
</div>`;

  MailApp.sendEmail({ to: salespersonEmail, subject, htmlBody: body, name: CONFIG.FROM_NAME });
}

function getSalespersonEmail(name) {
  // Map salesperson names to emails — extend this as team grows
  const map = {
    "KJ Williams": "kj@trulightgeorgia.com",
    "Dee Johnson": "dee@trulightgeorgia.com",
  };
  return map[name] || CONFIG.OWNER_EMAIL;
}

// ─── 4. FOLLOW-UP SEQUENCE SCHEDULER ─────────────────────────
function scheduleFollowUpSequence(leadID, data) {
  const sequences = [
    { day: 0,  type: "Day0_ThankYou",      label: "Thank You / Recap" },
    { day: 2,  type: "Day2_VisualNudge",   label: "Visual Nudge — Mockup" },
    { day: 5,  type: "Day5_SocialProof",   label: "Social Proof" },
    { day: 10, type: "Day10_Urgency",      label: "Urgency Touchpoint" },
    { day: 21, type: "Day21_KeepAlive",    label: "Soft Keep-Alive" },
    { day: 30, type: "Day30_Reactivation", label: "Reactivation" },
    { day: 60, type: "Day60_FinalAttempt", label: "Final Attempt" },
  ];

  // Skip follow-up sequence if already closed
  if (data.leadStatus === "Closed Won" || data.leadStatus === "Closed Lost") return;

  const sheet = getSheet("FollowUps");
  sequences.forEach(seq => {
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + seq.day);
    appendRow("FollowUps", "FOLLOWUPS", {
      FollowUpID: generateID("FU"),
      LeadID: leadID,
      JobID: "",
      Type: seq.type,
      ScheduledDate: scheduledDate.toISOString().split("T")[0],
      SentAt: "",
      Status: "Pending",
      Notes: seq.label,
    });
  });
}

// ─── 5. GOOGLE CALENDAR EVENT ─────────────────────────────────
function createInstallCalendarEvent(data, leadID) {
  try {
    const calendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID) || CalendarApp.getDefaultCalendar();
    const dateStr = data.preferredInstallDate;
    const timeStr = data.preferredInstallTime || "9:00 AM";

    // Parse time
    const [timePart, meridiem] = timeStr.split(" — ").pop().split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);
    if (meridiem === "PM" && hours !== 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;

    const startDate = new Date(dateStr + "T00:00:00");
    startDate.setHours(hours, minutes || 0, 0);
    const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // 4 hour default

    const event = calendar.createEvent(
      `🔧 TruLight Install — ${data.firstName} ${data.lastName}`,
      startDate,
      endDate,
      {
        location: `${data.address}, ${data.city}, GA ${data.zip}`,
        description: `
Lead ID: ${leadID}
Customer: ${data.firstName} ${data.lastName}
Phone: ${data.phone}
Address: ${data.address}, ${data.city}
Neighborhood: ${data.neighborhood}
Linear Footage: ${data.totalLinearFt} ft
Home Style: ${data.homeStyle}
Roofline: ${(data.rooflineSelections || []).join(", ")}
Controller: ${data.controllerIncluded ? "Yes" : "No"}
Salesperson: ${data.salesperson}
Quote Total: $${parseFloat(data.totalQuoteAmount || 0).toFixed(2)}
Notes: ${data.notes || "None"}
        `.trim(),
      }
    );

    // Add reminder 24h before
    event.addPopupReminder(60 * 24);
    event.addEmailReminder(60 * 24);

    return event.getId();
  } catch (err) {
    Logger.log("Calendar error: " + err.message);
    return "ERROR: " + err.message;
  }
}

// ─── 6. CREATE JOB FROM CLOSED LEAD ──────────────────────────
function createJobFromLead(data, leadID) {
  const jobID = generateID("JOB");
  appendRow("Jobs", "JOBS", {
    JobID: jobID,
    LeadID: leadID,
    CreatedAt: new Date().toISOString(),
    Customer: `${data.firstName} ${data.lastName}`,
    Address: `${data.address}, ${data.city}, GA ${data.zip}`,
    Neighborhood: data.neighborhood,
    InstallDate: data.preferredInstallDate || "",
    InstallTime: data.preferredInstallTime || "",
    LinearFt: data.totalLinearFt || "",
    HomeStyle: data.homeStyle || "",
    Roofline: (data.rooflineSelections || []).join(", "),
    ControllerIncluded: data.controllerIncluded ? "Yes" : "No",
    Notes: data.notes || "",
    AssignedInstaller: "",
    Status: "Scheduled",
    ChecklistComplete: "No",
    PhotosSubmitted: "No",
    BalanceCollected: "No",
    CompletedAt: "",
    ReviewRequested: "No",
    ReferralRequested: "No",
    FollowUp30Sent: "No",
  });

  // Auto-generate materials record
  generateMaterialsRecord(jobID, data);

  return jobID;
}

// ─── 7. NOTIFY PROJECT MANAGER ───────────────────────────────
function notifyProjectManager(data, leadID, jobID) {
  const subject = `🚀 New Job Created — ${data.firstName} ${data.lastName} · ${data.neighborhood}`;
  const installDate = data.preferredInstallDate
    ? new Date(data.preferredInstallDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : "TBD";

  const body = `
<div style="font-family:Arial,sans-serif;background:#0a0a0a;padding:30px;color:#F5F0E8;">
  <div style="border-left:3px solid #27AE60;padding-left:16px;margin-bottom:24px;">
    <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#27AE60;margin-bottom:4px;">TruLight Georgia · New Job</div>
    <h2 style="margin:0;font-size:22px;color:#F5F0E8;">${data.firstName} ${data.lastName}</h2>
    <div style="font-size:13px;color:#666;margin-top:4px;">${data.address}, ${data.city} · ${data.neighborhood}</div>
  </div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    ${[
      ["Job ID", jobID],
      ["Lead ID", leadID],
      ["Install Date", installDate],
      ["Time Slot", data.preferredInstallTime || "TBD"],
      ["Linear Footage", (data.totalLinearFt || "?") + " ft"],
      ["Home Style", data.homeStyle || "—"],
      ["Controller", data.controllerIncluded ? "Yes" : "No"],
      ["Quote Total", "$" + parseFloat(data.totalQuoteAmount || 0).toFixed(2)],
      ["Deposit", data.depositCollected ? "Yes — $" + (data.depositAmount || 0) : "Not collected"],
      ["Salesperson", data.salesperson || "—"],
    ].map(([k, v]) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #222;font-size:12px;color:#888;width:140px;">${k}</td>
      <td style="padding:8px 0;border-bottom:1px solid #222;font-size:12px;color:#F5F0E8;">${v}</td>
    </tr>`).join("")}
  </table>
  ${data.notes ? `<div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:6px;padding:14px;margin-bottom:20px;">
    <div style="font-size:10px;letter-spacing:2px;color:#888;margin-bottom:6px;text-transform:uppercase;">Job Notes</div>
    <div style="font-size:13px;color:#F5F0E8;">${data.notes}</div>
  </div>` : ""}
  <div style="background:#1a1400;border:1px solid #7A6230;border-radius:6px;padding:16px;">
    <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7A6230;margin-bottom:8px;">📋 Action Required</div>
    <div style="font-size:13px;color:#888;line-height:1.8;">
      1. Assign installer to Job ${jobID}<br>
      2. Confirm install date with customer<br>
      3. Verify materials are staged for ${data.totalLinearFt} ft<br>
      4. Update installer portal with assignment
    </div>
  </div>
  <div style="font-size:11px;color:#444;margin-top:20px;">TruLight Georgia · ${new Date().toLocaleDateString()}</div>
</div>`;

  MailApp.sendEmail({ to: CONFIG.PM_EMAIL, subject, htmlBody: body, name: CONFIG.FROM_NAME });
  // Also CC owner
  MailApp.sendEmail({ to: CONFIG.OWNER_EMAIL, subject: "[CC] " + subject, htmlBody: body, name: CONFIG.FROM_NAME });
}

// ─── 8. MATERIALS AUTO-GENERATION ────────────────────────────
function generateMaterialsRecord(jobID, data) {
  const ft = parseFloat(data.totalLinearFt) || 0;
  const zones = 2; // default
  appendRow("Materials", "MATERIALS", {
    MaterialID: generateID("MAT"),
    JobID: jobID,
    LinearFt: ft,
    Zones: zones,
    LEDStrip: Math.ceil(ft * 1.05),
    Channel: Math.ceil(ft * 1.05),
    EndCaps: Math.ceil(ft * 0.1) + (zones * 2),
    Connectors: Math.ceil(ft * 0.15),
    Screws: Math.ceil(ft * 0.5),
    Caulk: Math.ceil(ft * 0.03),
    WireClips: Math.ceil(ft * 0.4),
    ZipTies: Math.ceil(ft * 0.3),
    Controller: data.controllerIncluded ? 1 : 0,
    GeneratedAt: new Date().toISOString(),
  });
}

// ─── 9. CHECKLIST SUBMISSION ──────────────────────────────────
function handleChecklistSubmit(data) {
  const { jobID, installerName, checkedItems, startTime, endTime } = data;
  const installID = generateID("INST");

  appendRow("Installs", "INSTALLS", {
    InstallID: installID,
    JobID: jobID,
    InstallerName: installerName || "",
    StartTime: startTime || "",
    EndTime: endTime || new Date().toISOString(),
    ChecklistJSON: JSON.stringify(checkedItems || {}),
    MaterialsUsed: "",
    NotesFromField: data.notes || "",
    Status: "Checklist Complete",
  });

  // Update job record
  const jobRow = findRowByID("Jobs", "JOBS", "JobID", jobID);
  if (jobRow) updateCell("Jobs", "JOBS", jobRow.row, "ChecklistComplete", "Yes");

  return { installID, message: "Checklist submitted" };
}

// ─── 10. PHOTO SUBMISSION + JOB CLOSE ────────────────────────
function handlePhotoSubmission(data) {
  const { jobID, installerName, photos, notes, balanceCollected } = data;

  appendRow("Photos", "PHOTOS", {
    PhotoID: generateID("PHO"),
    JobID: jobID,
    InstallerName: installerName || "",
    Before: photos.before ? "Yes" : "No",
    During: photos.during ? "Yes" : "No",
    AfterDay: photos.after_front ? "Yes" : "No",
    AfterNight: photos.after_night ? "Yes" : "No",
    ControllerPhoto: photos.controller ? "Yes" : "No",
    AppConnected: photos.app ? "Yes" : "No",
    Notes: notes || "",
    SubmittedAt: new Date().toISOString(),
  });

  // Update job status to Complete
  const jobRow = findRowByID("Jobs", "JOBS", "JobID", jobID);
  if (jobRow) {
    updateCell("Jobs", "JOBS", jobRow.row, "PhotosSubmitted", "Yes");
    updateCell("Jobs", "JOBS", jobRow.row, "BalanceCollected", balanceCollected ? "Yes" : "No");
    updateCell("Jobs", "JOBS", jobRow.row, "Status", "Complete");
    updateCell("Jobs", "JOBS", jobRow.row, "CompletedAt", new Date().toISOString());

    // Get lead ID from job to trigger post-install sequence
    const leadID = jobRow.data[COLS.JOBS.indexOf("LeadID")];
    triggerPostInstallSequence(jobID, leadID, data);
  }

  return { message: "Job closed successfully. Post-install sequence triggered." };
}

// ─── 11. POST-INSTALL SEQUENCE ────────────────────────────────
function triggerPostInstallSequence(jobID, leadID, data) {
  // Get customer info from leads sheet
  const leadRow = findRowByID("Leads", "LEADS", "LeadID", leadID);
  if (!leadRow) return;

  const cols = COLS.LEADS;
  const leadData = {};
  cols.forEach((col, i) => leadData[col] = leadRow.data[i]);

  // Send delivery confirmation to customer
  if (leadData.Email) {
    sendJobCompleteEmail(leadData, jobID);
  }

  // Schedule review request (Day 1)
  schedulePostInstallEmail(jobID, leadID, "ReviewRequest", 1, leadData);

  // Schedule referral ask (Day 3)
  schedulePostInstallEmail(jobID, leadID, "ReferralAsk", 3, leadData);

  // Schedule 30-day follow-up
  schedulePostInstallEmail(jobID, leadID, "Day30FollowUp", 30, leadData);

  // Update job flags
  const jobRow = findRowByID("Jobs", "JOBS", "JobID", jobID);
  if (jobRow) {
    updateCell("Jobs", "JOBS", jobRow.row, "ReviewRequested", "Scheduled");
    updateCell("Jobs", "JOBS", jobRow.row, "ReferralRequested", "Scheduled");
  }
}

function sendJobCompleteEmail(leadData, jobID) {
  const name = leadData.FirstName || "Customer";
  const subject = `✨ Your TruLight Lights Are Live — ${leadData.Address}`;
  const body = `
<div style="font-family:Arial,sans-serif;background:#0a0a0a;padding:30px;color:#F5F0E8;">
  <div style="text-align:center;padding:32px 0 24px;border-bottom:1px solid #2a2a2a;margin-bottom:28px;">
    <div style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#C9A84C;margin-bottom:8px;">TruLight Georgia</div>
    <h1 style="margin:0 0 8px;font-size:28px;color:#F5F0E8;">Your Lights Are Live, ${name}! ✨</h1>
    <p style="margin:0;font-size:14px;color:#666;">Welcome to the TruLight family.</p>
  </div>
  <p style="font-size:14px;color:#888;line-height:1.8;margin-bottom:20px;">
    Your permanent LED lighting installation is complete. Your home is now ready to shine year-round — from holidays to everyday curb appeal.
  </p>
  <div style="background:#1a1400;border:1px solid #7A6230;border-radius:6px;padding:20px;margin-bottom:24px;">
    <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7A6230;margin-bottom:10px;">Quick Start Tips</div>
    <div style="font-size:13px;color:#888;line-height:2;">
      💡 Open your TruLight app to access all lighting scenes<br>
      🎨 Try the "Holiday" and "Patriotic" presets tonight<br>
      📱 Set a schedule so lights come on automatically at sunset<br>
      📞 Call us anytime at ${CONFIG.COMPANY_PHONE} if you need help
    </div>
  </div>
  <p style="font-size:13px;color:#666;line-height:1.7;margin-bottom:20px;">
    We'll follow up in a day or two to make sure everything is perfect. Your happiness is our priority.
  </p>
  <div style="font-size:11px;color:#444;border-top:1px solid #222;padding-top:16px;">
    ${CONFIG.COMPANY_NAME} · Job ${jobID} · ${CONFIG.COMPANY_WEBSITE}
  </div>
</div>`;

  MailApp.sendEmail({ to: leadData.Email, subject, htmlBody: body, name: CONFIG.FROM_NAME });
}

function schedulePostInstallEmail(jobID, leadID, type, daysFromNow, leadData) {
  const scheduledDate = new Date();
  scheduledDate.setDate(scheduledDate.getDate() + daysFromNow);
  appendRow("FollowUps", "FOLLOWUPS", {
    FollowUpID: generateID("FU"),
    LeadID: leadID,
    JobID: jobID,
    Type: type,
    ScheduledDate: scheduledDate.toISOString().split("T")[0],
    SentAt: "",
    Status: "Pending",
    Notes: `${leadData.FirstName} ${leadData.LastName} — ${leadData.Address}`,
  });
}

// ─── 12. DAILY FOLLOW-UP TRIGGER (Time-based trigger) ────────
// This function runs automatically every day via a time trigger
function runDailyFollowUps() {
  const today = new Date().toISOString().split("T")[0];
  const sheet = getSheet("FollowUps");
  const data = sheet.getDataRange().getValues();
  const cols = COLS.FOLLOWUPS;

  for (let i = 1; i < data.length; i++) {
    const row = {};
    cols.forEach((c, j) => row[c] = data[i][j]);

    if (row.Status !== "Pending") continue;
    if (row.ScheduledDate > today) continue;

    // Get lead data
    const leadRow = findRowByID("Leads", "LEADS", "LeadID", row.LeadID);
    if (!leadRow) continue;

    const leadCols = COLS.LEADS;
    const lead = {};
    leadCols.forEach((c, j) => lead[c] = leadRow.data[j]);

    if (!lead.Email) continue;

    // Send appropriate email based on type
    try {
      sendFollowUpEmail(row.Type, lead, row.JobID);
      updateCell("FollowUps", "FOLLOWUPS", i + 1, "SentAt", new Date().toISOString());
      updateCell("FollowUps", "FOLLOWUPS", i + 1, "Status", "Sent");
    } catch (err) {
      updateCell("FollowUps", "FOLLOWUPS", i + 1, "Status", "Error: " + err.message);
    }
  }
}

function sendFollowUpEmail(type, lead, jobID) {
  const name = lead.FirstName || "there";
  const templates = {
    Day0_ThankYou: {
      subject: `Thanks for your time today, ${name} — TruLight Georgia`,
      headline: `Great meeting you, ${name}.`,
      body: `We appreciate you taking the time to learn about TruLight Georgia. We've put together your custom quote and we're excited about the possibility of lighting up your home at ${lead.Address}.`,
    },
    Day2_VisualNudge: {
      subject: `Here's what your home could look like, ${name} 💡`,
      headline: `Picture this on your home.`,
      body: `We've been thinking about your home in ${lead.Neighborhood}. Homes with permanent LED lighting see an average increase in curb appeal — and your neighbors will notice. Your quote is still active at $${parseFloat(lead.TotalQuoteAmount || 0).toFixed(2)}.`,
    },
    Day5_SocialProof: {
      subject: `What your neighbors are saying — TruLight Georgia`,
      headline: `Your neighborhood is lighting up.`,
      body: `This week alone we've installed on several homes in the ${lead.Neighborhood} area. Homeowners love having full control from their phone — holiday displays, security lighting, and everyday curb appeal all from one app.`,
    },
    Day10_Urgency: {
      subject: `Quick update on your install slot, ${name}`,
      headline: `Your install window may be filling.`,
      body: `We wanted to give you a heads up — our install calendar for your area is filling up. We'd hate for you to miss your preferred date. Locking in takes just a few minutes.`,
    },
    Day21_KeepAlive: {
      subject: `Still thinking about it? — TruLight Georgia`,
      headline: `No pressure — just checking in.`,
      body: `We know you're busy. We wanted to make sure your quote is still handy and answer any questions you might have. Your custom quote for ${lead.Address} is still on file.`,
    },
    Day30_Reactivation: {
      subject: `A new reason to light up your home, ${name}`,
      headline: `The season is changing — is your home ready?`,
      body: `With the holidays approaching, now is the perfect time to have your permanent LED lighting installed. No more climbing ladders every season — one install lasts forever.`,
    },
    Day60_FinalAttempt: {
      subject: `Last check-in from TruLight Georgia`,
      headline: `We're still here when you're ready.`,
      body: `We'll keep this brief — we're still available to install at ${lead.Address} whenever the timing is right for you. No pressure, no expiration on your quote.`,
    },
    ReviewRequest: {
      subject: `How did we do, ${name}? ⭐`,
      headline: `We'd love your feedback.`,
      body: `We hope you're loving your new TruLight installation! If you have a moment, a quick Google review would mean the world to our small team. It takes less than a minute and helps other homeowners find us.`,
    },
    ReferralAsk: {
      subject: `Know anyone who'd love TruLight, ${name}?`,
      headline: `Share the light.`,
      body: `You're now part of the TruLight family — and we'd love to meet your neighbors! If you know anyone who'd love permanent outdoor LED lighting, send them our way. We take great care of referrals.`,
    },
    Day30FollowUp: {
      subject: `30 days in — how are your lights, ${name}? 💡`,
      headline: `Checking in on your install.`,
      body: `It's been about a month since we installed your TruLight system at ${lead.Address}. We hope everything is working perfectly. If you ever have questions, need a firmware update, or want to add more zones — just call us.`,
    },
  };

  const t = templates[type];
  if (!t) return;

  const body = `
<div style="font-family:Arial,sans-serif;background:#0a0a0a;padding:30px;color:#F5F0E8;">
  <div style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#C9A84C;margin-bottom:16px;">TruLight Georgia</div>
  <h2 style="font-size:22px;color:#F5F0E8;margin:0 0 16px;">${t.headline}</h2>
  <p style="font-size:14px;color:#888;line-height:1.8;margin-bottom:20px;">${t.body}</p>
  <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td style="background:#C9A84C;border-radius:5px;">
    <a href="https://${CONFIG.COMPANY_WEBSITE}" style="display:inline-block;padding:11px 24px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0a0a0a;text-decoration:none;">Get In Touch</a>
  </td></tr></table>
  <div style="font-size:11px;color:#444;border-top:1px solid #1e1e1e;padding-top:14px;">${CONFIG.COMPANY_NAME} · ${CONFIG.COMPANY_PHONE} · ${CONFIG.COMPANY_WEBSITE}</div>
</div>`;

  MailApp.sendEmail({ to: lead.Email, subject: t.subject, htmlBody: body, name: CONFIG.FROM_NAME });
}

// ─── 13. ON-SITE LEAD CAPTURE (from installer) ───────────────
function handleOnSiteLead(data) {
  const leadID = generateID("LEAD");
  appendRow("Leads", "LEADS", {
    LeadID: leadID,
    Timestamp: new Date().toISOString(),
    Salesperson: data.installerName || "",
    LeadDate: new Date().toISOString().split("T")[0],
    LeadDate: new Date().toTimeString().slice(0,5),
    LeadOriginCategory: "installer",
    InstallerJobAddress: data.activeJobAddress || "",
    Neighborhood: data.neighborhood || "",
    CommissionTier: "Installer Attribution",
    FirstName: data.firstName || "",
    LastName: data.lastName || "",
    Address: data.address || "",
    Phone: data.phone || "",
    Notes: data.notes || "",
    LeadStatus: "New",
  });

  // Notify salesperson team of new installer-gen lead
  MailApp.sendEmail({
    to: CONFIG.OWNER_EMAIL,
    subject: `🏠 Installer Lead — ${data.firstName} ${data.lastName} · ${data.neighborhood}`,
    body: `New installer-generated lead captured on-site.\n\nName: ${data.firstName} ${data.lastName}\nAddress: ${data.address}\nPhone: ${data.phone}\nNotes: ${data.notes}\nCapture by: ${data.installerName}\nActive Job: ${data.activeJobAddress}\nLead ID: ${leadID}`,
    name: CONFIG.FROM_NAME,
  });

  return { leadID, message: "On-site lead captured" };
}

// ─── 14. GET JOBS FOR INSTALLER (GET endpoint) ───────────────
function getJobsForInstaller(installerName) {
  const sheet = getSheet("Jobs");
  const data = sheet.getDataRange().getValues();
  const cols = COLS.JOBS;
  const jobs = [];

  for (let i = 1; i < data.length; i++) {
    const row = {};
    cols.forEach((c, j) => row[c] = data[i][j]);
    if (
      (row.AssignedInstaller === installerName || row.AssignedInstaller === "") &&
      (row.Status === "Scheduled" || row.Status === "In Progress")
    ) {
      jobs.push(row);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ jobs }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── 15. JOB STATUS UPDATE ────────────────────────────────────
function handleJobStatusUpdate(data) {
  const { jobID, status, installerName } = data;
  const jobRow = findRowByID("Jobs", "JOBS", "JobID", jobID);
  if (!jobRow) return { error: "Job not found" };

  updateCell("Jobs", "JOBS", jobRow.row, "Status", status);
  if (installerName) updateCell("Jobs", "JOBS", jobRow.row, "AssignedInstaller", installerName);
  return { message: "Job updated" };
}

// ─── 16. SETUP FUNCTION (Run once manually) ──────────────────
// Run this once from Apps Script to initialize all sheets and triggers
function setupTruLightBackend() {
  // Create all sheet tabs
  Object.values(CONFIG.SHEETS).forEach(name => getSheet(name));

  // Delete existing triggers to avoid duplicates
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  // Create daily follow-up trigger (runs at 8 AM)
  ScriptApp.newTrigger("runDailyFollowUps")
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();

  Logger.log("✅ TruLight Georgia backend initialized successfully.");
  Logger.log("Sheet tabs created: " + Object.values(CONFIG.SHEETS).join(", "));
  Logger.log("Daily follow-up trigger set for 8 AM.");
  Logger.log("Next step: Deploy as Web App and copy the URL into both frontend apps.");
}
