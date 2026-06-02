# TruLight Georgia — Operations Suite

Three connected web apps sharing one Google Sheet as the single source of truth.

## Files — Upload All to GitHub

| File | Purpose | URL |
|------|---------|-----|
| `repcard.html` | Sales Rep Card + Lead Tracker | `salescard.trulightgeorgia.com` |
| `crm.html` | Field CRM + Install Tracker | `crm.trulightgeorgia.com` |
| `trulight-backend-v2.gs` | Google Apps Script backend | *(Apps Script, not uploaded to GitHub)* |

The Operations Dashboard (`trulight-georgia-financials.html`) lives separately and connects via the same Apps Script URL.

---

## Shared localStorage Keys

All three apps read/write the same browser keys so data is consistent on any device:

| Key | Data | Used by |
|-----|------|---------|
| `tl_opportunities` | All leads / opportunities | Dashboard + CRM |
| `tl_jobs` | Active jobs | Dashboard + CRM |
| `tl_calendar` | Calendar events | Dashboard + CRM + RepCard |
| `tl_gs_script_url` | Apps Script endpoint | All three |

---

## Login Credentials

| Email | Password | Role |
|-------|----------|------|
| `kj@trulightgeorgia.com` | `kj123` | Admin |
| `deontai@trulightgeorgia.com` | `dee123` | Sales |
| `admin@trulightgeorgia.com` | `admin` | Admin |

**Change passwords in the `USERS` array inside each HTML file after deploying.**

---

## Apps Script Setup (one-time)

1. Go to [script.google.com](https://script.google.com) → paste `trulight-backend-v2.gs`
2. Run `setupSheets()` once to create all tabs
3. Deploy → New Deployment → Web App → Execute as Me → Access: Anyone
4. Copy the `/exec` URL
5. Paste it into each app under **Settings → Apps Script URL** (RepCard) or **Sync → Apps Script URL** (CRM) or **HR/Admin → Data & Sync** (Dashboard)

---

## GitHub Pages Setup

1. Create repo `trulight-apps` (or whatever name)
2. Upload `repcard.html` and `crm.html`
3. Settings → Pages → Branch: main → Save
4. Apps live at `https://yourusername.github.io/trulight-apps/repcard.html` etc.
5. Point your subdomains (`salescard.trulightgeorgia.com`, `crm.trulightgeorgia.com`) to GitHub Pages via CNAME

---

## How Sync Works

```
RepCard  →  gsSync('saveLead', record)  →  Apps Script  →  Google Sheet (Leads tab)
CRM      →  gsSync('saveLead', record)  →  Apps Script  →  Google Sheet (Leads tab)
Dashboard → gsSync('saveLead', record) →  Apps Script  →  Google Sheet (Leads tab)

Pull (any app) → GET ?action=getLeads → Apps Script reads Sheet → merge into local
```

- **Writes** use `no-cors` POST (fire-and-forget — write happens, response is opaque)
- **Reads** use plain GET with `?action=` param (fully readable response)
- **Calendar events** sync through the same `tl_calendar` localStorage key — any event added in any app appears in all three instantly on the same browser, and syncs to Sheets/other devices via push/pull

---

*TruLight Georgia LLC · 11720 Amber Park Dr, STE 160 PMB 1032 · Alpharetta, GA · (888) 316-4687*
