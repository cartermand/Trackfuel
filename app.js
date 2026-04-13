// ── STATE ──────────────────────────────────────────────────────────
let tab        = "today";
let activeDay  = 0;
let viewCircuit = null;
let checked    = {};

// ── STORAGE ───────────────────────────────────────────────────────
function loadWeek() {
  try {
    const s = localStorage.getItem('tf_week');
    return s ? JSON.parse(s) : null;
  } catch (e) { return null; }
}

function saveWeek() {
  try { localStorage.setItem('tf_week', JSON.stringify(week)); }
  catch (e) {}
}

let week = loadWeek() || BLANK_WEEK();

// ── RESET ─────────────────────────────────────────────────────────
function askReset()    { document.getElementById("confirm-reset").classList.add("show"); }
function cancelReset() { document.getElementById("confirm-reset").classList.remove("show"); }
function confirmReset() {
  week = BLANK_WEEK();
  checked = {};
  activeDay = 0;
  tab = "today";
  saveWeek();
  document.getElementById("confirm-reset").classList.remove("show");
  render();
}

// ── HELPERS ───────────────────────────────────────────────────────
function totalBurn(wo, extra) {
  return 1850 + (CIRCUITS[wo]?.burn || 0) + (extra ? CIRCUITS.shotput.burn : 0);
}

// ── EXPORT ────────────────────────────────────────────────────────
function exportMFP(dayIndex) {
  const d = week[dayIndex];
  if (!d.calories && !d.protein) { alert("Log your calories and protein first!"); return; }
  const cal = parseInt(d.calories) || 0;
  const pro = parseInt(d.protein) || 0;
  const wo  = CIRCUITS[d.workout];
  let csv = "Date,Meal,Name,Quantity,Unit,Calories,Carbohydrates (g),Fat (g),Protein (g),Sodium (mg),Sugar (g)\n";
  csv += `${FULLDAYS[dayIndex]},Diary,Daily Total (TrackFuel),1,serving,${cal},0,0,${pro},0,0\n`;
  if (wo) csv += `${FULLDAYS[dayIndex]},Exercise,${wo.label},1,session,${-wo.burn},0,0,0,0,0\n`;
  if (d.shotExtra) csv += `${FULLDAYS[dayIndex]},Exercise,Shot Put Extra Session,1,session,${-CIRCUITS.shotput.burn},0,0,0,0,0\n`;
  downloadCSV(csv, `trackfuel_${FULLDAYS[dayIndex].toLowerCase()}_mfp.csv`);
}

function exportWeekMFP() {
  const logged = week.filter(d => d.calories);
  if (!logged.length) { alert("Log at least one day first!"); return; }
  let csv = "Date,Meal,Name,Quantity,Unit,Calories,Carbohydrates (g),Fat (g),Protein (g),Sodium (mg),Sugar (g)\n";
  week.forEach((d, i) => {
    if (!d.calories) return;
    const cal = parseInt(d.calories) || 0;
    const pro = parseInt(d.protein)  || 0;
    const wo  = CIRCUITS[d.workout];
    csv += `${FULLDAYS[i]},Diary,Daily Total (TrackFuel),1,serving,${cal},0,0,${pro},0,0\n`;
    if (wo) csv += `${FULLDAYS[i]},Exercise,${wo.label},1,session,${-wo.burn},0,0,0,0,0\n`;
    if (d.shotExtra) csv += `${FULLDAYS[i]},Exercise,Shot Put Extra,1,session,${-CIRCUITS.shotput.burn},0,0,0,0,0\n`;
  });
  downloadCSV(csv, 'trackfuel_week_mfp.csv');
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── TABS & NAV ────────────────────────────────────────────────────
function renderTabs() {
  document.getElementById("tabs").innerHTML = ["today", "circuits", "stats"].map(t => {
    const labels = { today: "Log", circuits: "Circuits", stats: "Stats" };
    return `<button onclick="setTab('${t}')" style="background:none;border:none;border-bottom:2px solid ${tab === t ? "#ff4d00" : "transparent"};color:${tab === t ? "#ff4d00" : "#444"};font-family:'Barlow Condensed',sans-serif;font-size:17px;font-weight:700;letter-spacing:1px;cursor:pointer;padding:8px 12px;">${labels[t]}</button>`;
  }).join("");
}

function setTab(t)      { tab = t; if (t !== "circuits") viewCircuit = null; render(); }
function setDay(i)      { activeDay = i; render(); }
function setField(f, v) { week[activeDay][f] = v; saveWeek(); render(); }
function toggleExtra()  { week[activeDay].shotExtra = !week[activeDay].shotExtra; saveWeek(); render(); }
function setWorkout(k)  { week[activeDay].workout = k; saveWeek(); render(); }
function openCircuit(k) { viewCircuit = k; tab = "circuits"; render(); }
function backCircuits() { viewCircuit = null; render(); }
function toggleCheck(k, i) { const key = `${k}-${i}`; checked[key] = !checked[key]; render(); }

// ── RENDER: TODAY ─────────────────────────────────────────────────
function renderToday() {
  const d   = week[activeDay];
  const sug = SCHED[activeDay];
  const sc  = sug.workout ? CIRCUITS[sug.workout] : null;
  const burn = totalBurn(d.workout, d.shotExtra);
  const eaten = parseInt(d.calories) || 0;
  const net  = eaten - burn;
  const pro  = parseInt(d.protein) || 0;

  let html = `<div class="fade" style="display:flex;flex-direction:column;gap:14px;">`;

  // Day pills
  html += `<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;">`;
  DAYS.forEach((dy, i) => {
    const dot = week[i].calories
      ? `<span style="position:absolute;top:-2px;right:-2px;width:6px;height:6px;background:#ff4d00;border-radius:50%;"></span>`
      : "";
    html += `<button onclick="setDay(${i})" class="pill ${activeDay === i ? "active" : ""}" style="flex-shrink:0;">${dy}${dot}</button>`;
  });
  html += `</div>`;

  // Suggested workout
  if (sc) {
    html += `<div style="background:${sc.color}14;border:1px solid ${sc.color}44;border-radius:12px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;">
      <div>
        <div style="font-size:10px;color:#555;text-transform:uppercase;letter-spacing:1px;">Suggested for ${sug.day}</div>
        <div class="bc" style="font-weight:700;font-size:20px;color:${sc.color};margin-top:2px;">${sc.icon} ${sc.label}</div>
      </div>
      <button onclick="openCircuit('${sug.workout}')" style="background:${sc.color};border:none;border-radius:8px;padding:7px 12px;color:#000;font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;cursor:pointer;">VIEW →</button>
    </div>`;
  } else {
    html += `<div class="card"><div style="font-size:13px;color:#555;">Rest day — eat at maintenance (~2,000 cal)</div></div>`;
  }

  // Workout selector
  html += `<div class="card">
    <div style="font-size:10px;color:#444;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">What did you actually do?</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">`;
  Object.entries(CIRCUITS).forEach(([key, c]) => {
    const sel = d.workout === key;
    html += `<button onclick="setWorkout('${key}')" class="wbtn" style="${sel ? `border-color:${c.color};color:${c.color};background:${c.color}18;` : ""}">
      <div style="font-size:20px;margin-bottom:3px;">${c.icon}</div>
      <div style="font-size:10px;line-height:1.3;">${c.label}</div>
      <div style="font-size:9px;color:#444;margin-top:2px;">~${c.burn} cal</div>
    </button>`;
  });
  html += `</div>
    <div style="margin-top:12px;">
      <button onclick="toggleExtra()" style="background:${d.shotExtra ? "#ffcc0011" : "#13131f"};border:1.5px solid ${d.shotExtra ? "#ffcc00" : "#1e1e30"};border-radius:100px;padding:7px 14px;display:flex;align-items:center;gap:8px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:12px;color:${d.shotExtra ? "#ffcc00" : "#888"};width:100%;">
        <span style="font-size:14px;">🏋️</span>
        <span style="flex:1;text-align:left;">+ Extra shot put session</span>
        <span style="font-size:14px;">${d.shotExtra ? "✅" : "⭕"}</span>
      </button>
    </div>
  </div>`;

  // Nutrition inputs
  html += `<div class="card">
    <div style="font-size:10px;color:#444;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Nutrition</div>
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div>
        <div style="font-size:12px;color:#666;margin-bottom:5px;">Calories eaten</div>
        <input type="number" placeholder="e.g. 2200" value="${d.calories}" oninput="setField('calories',this.value)">
      </div>
      <div>
        <div style="font-size:12px;color:#666;margin-bottom:5px;">Protein (grams)</div>
        <input type="number" placeholder="e.g. 140" value="${d.protein}" oninput="setField('protein',this.value)">
      </div>
    </div>
  </div>`;

  // Balance card
  if (d.calories) {
    const netColor = net < -600 ? "#ff4444" : net < 0 ? "#00e676" : "#ffcc00";
    const msg = net < -600
      ? "Too big a deficit — eat more, you're still growing!"
      : net < -50  ? "Perfect cut deficit. Stay consistent!"
      : net < 250  ? "Near maintenance — fine on a hard throw day"
      : "Slight surplus — adjust tomorrow";
    html += `<div class="card fade" style="border-color:${net < 0 ? "#ff4d0033" : "#1c1c2e"}">
      <div style="font-size:10px;color:#444;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Today's balance</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;">
        ${[["eaten", eaten.toLocaleString(), "#fff"], ["burned", burn.toLocaleString(), "#666"], ["net", (net > 0 ? "+" : "") + net.toLocaleString(), netColor]].map(([l, v, c]) => `
        <div style="text-align:center;background:#0d0d18;border-radius:10px;padding:10px 6px;">
          <div class="bc" style="font-weight:700;font-size:24px;color:${c};line-height:1;">${v}</div>
          <div style="font-size:9px;color:#444;margin-top:3px;text-transform:uppercase;letter-spacing:1px;">${l}</div>
        </div>`).join("")}
      </div>
      <div style="font-size:12px;color:#777;background:#0d0d18;border-radius:8px;padding:8px 12px;margin-bottom:12px;">${msg}</div>
      ${pro ? `<div style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
          <span style="font-size:11px;color:#555;">Protein</span>
          <span style="font-size:11px;color:#fff;">${pro}g / ${GOAL_PRO}g</span>
        </div>
        <div class="bar"><div class="bar-fill" style="width:${Math.min((pro / GOAL_PRO) * 100, 100)}%;background:${pro >= GOAL_PRO ? "#00e676" : "#ff4d00"};"></div></div>
      </div>` : ""}
      <button onclick="exportMFP(${activeDay})" style="width:100%;background:#0070d2;border:none;border-radius:12px;padding:13px;color:#fff;font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:700;letter-spacing:1px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;">
        <span style="font-size:16px;">📲</span> EXPORT TODAY TO MYFITNESSPAL
      </button>
      <div style="font-size:10px;color:#444;text-align:center;margin-top:6px;">Downloads CSV → open MFP → Food Diary → Import</div>
    </div>`;
  }

  html += `</div>`;
  return html;
}

// ── RENDER: CIRCUITS ──────────────────────────────────────────────
function renderCircuits() {
  if (viewCircuit) {
    const c    = CIRCUITS[viewCircuit];
    const done = c.exercises.filter((_, i) => checked[`${viewCircuit}-${i}`]).length;
    const pct  = (done / c.exercises.length) * 100;
    let html   = `<div class="fade">
      <button onclick="backCircuits()" style="background:#13131f;border:1px solid #1e1e30;border-radius:8px;padding:6px 14px;color:#888;font-family:'DM Sans',sans-serif;font-size:12px;cursor:pointer;margin-bottom:14px;">← Back</button>
      <div style="background:${c.color}0f;border:1px solid ${c.color}33;border-radius:16px;padding:16px;margin-bottom:14px;">
        <div style="font-size:30px;">${c.icon}</div>
        <div class="bc" style="font-weight:800;font-size:26px;color:${c.color};letter-spacing:1px;">${c.label.toUpperCase()}</div>
        <div style="font-size:12px;color:#555;">~${c.burn} cal · ${c.exercises.length} exercises</div>
        <div style="margin-top:10px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
            <span style="font-size:11px;color:#555;">Progress</span>
            <span style="font-size:11px;color:${c.color};">${done}/${c.exercises.length}</span>
          </div>
          <div class="bar"><div class="bar-fill" style="width:${pct}%;background:${c.color};"></div></div>
        </div>
      </div>
      <div class="card">`;
    c.exercises.forEach((ex, i) => {
      const dn = !!checked[`${viewCircuit}-${i}`];
      html += `<div class="exrow" onclick="toggleCheck('${viewCircuit}',${i})">
        <div class="cb ${dn ? "done" : ""}">${dn ? "✓" : ""}</div>
        <div style="flex:1;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;">
            <span class="bc" style="font-weight:700;font-size:16px;color:${dn ? "#555" : "#ddd"};text-decoration:${dn ? "line-through" : "none"};">${ex.name}</span>
            <span style="font-size:11px;color:${c.color};background:${c.color}1e;padding:2px 7px;border-radius:100px;">${ex.sets} × ${ex.reps}</span>
          </div>
          <div style="font-size:11px;color:#444;margin-top:2px;">${ex.note}</div>
        </div>
      </div>`;
    });
    html += `</div>`;
    if (done === c.exercises.length) {
      html += `<div class="fade" style="text-align:center;padding:18px 0;">
        <div style="font-size:40px;">🔥</div>
        <div class="bc" style="font-weight:800;font-size:26px;color:${c.color};margin-top:6px;">WORKOUT DONE!</div>
        <div style="font-size:12px;color:#555;margin-top:3px;">~${c.burn} cal burned. Go log it!</div>
      </div>`;
    }
    return html + `</div>`;
  }

  // Circuit list
  let html = `<div class="fade" style="display:flex;flex-direction:column;gap:12px;">
    <div class="bc" style="font-weight:800;font-size:24px;color:#fff;letter-spacing:1px;">SUMMER CIRCUITS</div>
    <div style="font-size:12px;color:#555;margin-top:-6px;">Tap any workout to see exercises + check them off</div>
    <div style="background:linear-gradient(135deg,#1a1500,#0f0f1c);border:1.5px solid #ffcc0033;border-radius:14px;padding:14px;cursor:pointer;" onclick="openCircuit('shotput')">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:10px;color:#ffcc0077;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">You have a shot put at home</div>
          <div class="bc" style="font-weight:800;font-size:22px;color:#ffcc00;">🏋️ THROW ANYTIME</div>
          <div style="font-size:12px;color:#666;margin-top:3px;">8 exercises · ~350 cal</div>
        </div>
        <span style="font-size:24px;color:#444;">→</span>
      </div>
    </div>`;

  Object.entries(CIRCUITS).forEach(([key, c]) => {
    const done = c.exercises.filter((_, i) => checked[`${key}-${i}`]).length;
    const pct  = (done / c.exercises.length) * 100;
    html += `<div onclick="openCircuit('${key}')" style="background:${c.color}0d;border:1.5px solid ${c.color}2a;border-radius:14px;padding:14px;cursor:pointer;">
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="font-size:30px;">${c.icon}</span>
        <div style="flex:1;">
          <div class="bc" style="font-weight:700;font-size:20px;color:${c.color};">${c.label}</div>
          <div style="font-size:11px;color:#555;">${c.exercises.length} exercises · ~${c.burn} cal</div>
          ${done > 0 ? `<div style="margin-top:6px;">
            <div class="bar"><div class="bar-fill" style="width:${pct}%;background:${c.color};"></div></div>
            <div style="font-size:10px;color:#555;margin-top:3px;">${done}/${c.exercises.length} done</div>
          </div>` : ""}
        </div>
        <span style="color:#333;font-size:18px;">→</span>
      </div>
    </div>`;
  });

  return html + `</div>`;
}

// ── RENDER: STATS ─────────────────────────────────────────────────
function renderStats() {
  const wE   = week.reduce((s, d) => s + (parseInt(d.calories) || 0), 0);
  const wB   = week.reduce((s, d) => s + totalBurn(d.workout, d.shotExtra), 0);
  const wP   = week.reduce((s, d) => s + (parseInt(d.protein) || 0), 0);
  const days = week.filter(d => d.calories).length;
  const net  = wE - wB;
  const avgP = days > 0 ? Math.round(wP / days) : 0;

  let html = `<div class="fade" style="display:flex;flex-direction:column;gap:14px;">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      ${[
        ["Weekly Eaten",  wE.toLocaleString(), "cal",     "#fff"],
        ["Weekly Burned", wB.toLocaleString(), "cal",     "#888"],
        ["Net Balance",   (net > 0 ? "+" : "") + net.toLocaleString(), net < 0 ? "deficit 🔥" : "surplus", net < 0 ? "#00e676" : "#ff4d00"],
        ["Avg Protein",   avgP + "g", "per day", avgP >= 130 ? "#00e676" : "#ffcc00"]
      ].map(([l, v, s, c]) => `
        <div class="card">
          <div style="font-size:10px;color:#444;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">${l}</div>
          <div class="bc" style="font-weight:700;font-size:30px;color:${c};line-height:1;">${v}</div>
          <div style="font-size:10px;color:#444;margin-top:3px;">${s}</div>
        </div>`).join("")}
    </div>

    <div class="card">
      <div style="font-size:10px;color:#444;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Daily calories vs goal</div>
      ${week.map((d, i) => {
        const e   = parseInt(d.calories) || 0;
        const pct = Math.min((e / GOAL_CAL) * 100, 120);
        const c   = CIRCUITS[d.workout];
        return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span style="font-size:11px;color:#444;width:24px;">${d.day}</span>
          ${c ? `<span style="font-size:12px;">${c.icon}</span>` : `<span style="width:16px;"></span>`}
          <div class="bar" style="flex:1;">
            <div class="bar-fill" style="width:${pct}%;background:${e === 0 ? "#1a1a26" : e <= GOAL_CAL ? "#ff4d00" : "#ffcc00"};"></div>
          </div>
          <span style="font-size:11px;color:#555;width:38px;text-align:right;">${e > 0 ? e : "—"}</span>
        </div>`;
      }).join("")}
    </div>

    <button onclick="exportWeekMFP()" style="width:100%;background:#0070d2;border:none;border-radius:12px;padding:14px;color:#fff;font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:700;letter-spacing:1px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;">
      <span style="font-size:16px;">📲</span> EXPORT FULL WEEK TO MYFITNESSPAL
    </button>
    <div style="font-size:10px;color:#444;text-align:center;margin-top:-8px;">Exports all logged days · MFP → Food Diary → Import CSV</div>

    <div class="card" style="border-color:#ff4d0022;">
      <div class="bc" style="font-weight:800;font-size:20px;color:#ff4d00;letter-spacing:1px;margin-bottom:10px;">EST. FAT LOSS THIS WEEK</div>
      <div class="bc" style="font-weight:700;font-size:44px;color:#fff;line-height:1;">
        ${net < 0 ? (Math.abs(net) / 3500).toFixed(2) : "0.00"}<span style="font-size:18px;color:#666;"> lbs</span>
      </div>
      <div style="font-size:11px;color:#444;margin-top:5px;">${days > 0 ? `Based on ${days} day${days !== 1 ? "s" : ""} logged` : "Log days to see progress"}</div>
      ${net < 0 ? `<div style="margin-top:10px;background:#0d0d18;border-radius:8px;padding:8px 12px;font-size:11px;color:#555;">At this rate → ~${((Math.abs(net) / 3500) * 4).toFixed(1)} lbs/month</div>` : ""}
    </div>

    <div class="card">
      <div class="bc" style="font-weight:800;font-size:20px;color:#fff;letter-spacing:1px;margin-bottom:10px;">ABS TIMELINE @ 167 LBS</div>
      ${[
        ["18–22%", "You are here",       "Now",      "#555"],
        ["15–18%", "Top abs visible",    "~2 mo",    "#ffcc00"],
        ["12–15%", "Full 6-pack",        "~4–5 mo",  "#ff4d00"]
      ].map(([r, l, e, c]) => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #13131f;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:7px;height:7px;border-radius:50%;background:${c};flex-shrink:0;"></div>
          <div>
            <div class="bc" style="font-weight:700;font-size:16px;color:${c};">${r} body fat</div>
            <div style="font-size:11px;color:#444;">${l}</div>
          </div>
        </div>
        <span style="font-size:11px;color:#555;background:#13131f;padding:3px 9px;border-radius:100px;">${e}</span>
      </div>`).join("")}
    </div>

    <button onclick="askReset()" style="width:100%;background:#13131f;border:1.5px solid #ff4d0033;border-radius:12px;padding:12px;color:#ff4d00;font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:700;letter-spacing:1px;cursor:pointer;">
      🗑️ START NEW WEEK
    </button>
  </div>`;
  return html;
}

// ── MAIN RENDER ───────────────────────────────────────────────────
function render() {
  renderTabs();
  const c = document.getElementById("content");
  if      (tab === "today")   c.innerHTML = renderToday();
  else if (tab === "circuits") c.innerHTML = renderCircuits();
  else                         c.innerHTML = renderStats();
}

render();
