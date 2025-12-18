/* ---------------- Local Storage Helpers ---------------- */
const LS_KEYS = {
  NAMES: "att_names",
  SELECTED: "att_selected",
  MONTH: "att_month"
};

const getNames = () => JSON.parse(localStorage.getItem(LS_KEYS.NAMES) || "[]");
const setNames = (arr) => localStorage.setItem(LS_KEYS.NAMES, JSON.stringify(arr));
const getSelected = () => JSON.parse(localStorage.getItem(LS_KEYS.SELECTED) || "[]");
const setSelected = (arr) => localStorage.setItem(LS_KEYS.SELECTED, JSON.stringify(arr));

/* ---------------- UI Elements ---------------- */
const nameInput = document.getElementById("nameInput");
const addNameBtn = document.getElementById("addNameBtn");
const nameList = document.getElementById("nameList");

const selectAllBtn = document.getElementById("selectAllBtn");
const clearSelectionBtn = document.getElementById("clearSelectionBtn");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");

const monthEl = document.getElementById("month");
const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");

const output = document.getElementById("output");

/* ---------------- Init ---------------- */
(function init() {
  const savedMonth = localStorage.getItem(LS_KEYS.MONTH);
  if (savedMonth) {
    monthEl.value = savedMonth;
  } else {
    const d = new Date();
    monthEl.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  renderNameList();
})();

/* ---------------- Render Name Checkboxes ---------------- */
function renderNameList() {
  const names = getNames();
  const selected = new Set(getSelected());
  nameList.innerHTML = "";

  if (!names.length) {
    nameList.innerHTML = `<div class="muted" style="padding:8px 2px;">No names saved yet. Add a name above.</div>`;
    return;
  }

  names.forEach((n, idx) => {
    const item = document.createElement("label");
    item.className = "name-item";
    item.innerHTML = `
      <input type="checkbox" data-index="${idx}" ${selected.has(n) ? "checked" : ""} />
      <span>${escapeHtml(n)}</span>
    `;
    nameList.appendChild(item);
  });

  nameList.querySelectorAll("input[type=checkbox]").forEach(cb => {
    cb.addEventListener("change", () => {
      const names = getNames();
      const name = names[parseInt(cb.dataset.index, 10)];
      const sel = new Set(getSelected());
      cb.checked ? sel.add(name) : sel.delete(name);
      setSelected([...sel]);
    });
  });
}

/* ---------------- Name Actions ---------------- */
/* ✅ helper: add name(s) + select them */
function addName() {
  const raw = (nameInput.value || "").trim();
  if (!raw) return;

  const names = getNames();
  raw.split(",").map(s => s.trim()).filter(Boolean).forEach(n => {
    if (!names.includes(n)) names.push(n);
  });
  setNames(names);

  const sel = new Set(getSelected());
  raw.split(",").map(s => s.trim()).filter(Boolean).forEach(n => sel.add(n));
  setSelected([...sel]);

  nameInput.value = "";
  renderNameList();
}

/* click -> add */
addNameBtn.addEventListener("click", addName);

/* ✅ Enter key -> add */
nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addName();
  }
});

selectAllBtn.addEventListener("click", () => { setSelected(getNames()); renderNameList(); });
clearSelectionBtn.addEventListener("click", () => { setSelected([]); renderNameList(); });
deleteSelectedBtn.addEventListener("click", () => {
  const selected = new Set(getSelected());
  if (!selected.size) return;
  setNames(getNames().filter(n => !selected.has(n)));
  setSelected([]);
  renderNameList();
});

/* ---------------- Generate Sheets ---------------- */
generateBtn.addEventListener("click", generate);
downloadBtn.addEventListener("click", downloadPDF);
monthEl.addEventListener("change", () => localStorage.setItem(LS_KEYS.MONTH, monthEl.value));

function generate() {
  output.innerHTML = "";

  const monthInput = monthEl.value;
  if (!monthInput) { alert("Please select a month!"); return; }
  localStorage.setItem(LS_KEYS.MONTH, monthInput);

  const year = parseInt(monthInput.split("-")[0], 10);
  const month = parseInt(monthInput.split("-")[1], 10) - 1;

  const selectedNames = getSelected();
  if (!selectedNames.length) { alert("Please select at least one name!"); return; }

  selectedNames.forEach((name) => {
    const page = document.createElement("div");
    page.className = "page";

    // Banner (deep green) + separate name line
    const banner = document.createElement("div");
    banner.className = "banner";
    banner.innerHTML = `
      <div class="title">ATTENDANCE SHEET</div>
      <div class="month">${formatMonthHyphen(year, month)}</div>
    `;
    page.appendChild(banner);

    const nameLine = document.createElement("div");
    nameLine.className = "name-line";
    nameLine.textContent = (name || "").toString().trim().toUpperCase();
    page.appendChild(nameLine);

    // Table
    const table = document.createElement("table");
    table.className = "table";
    table.innerHTML = `
      <tr>
        <th style="width:70px">Date</th>
        <th style="width:140px">Day</th>
        <th>IN</th>
        <th>OUT</th>
        <th>SIGN</th>
        <th>REMARK</th>
      </tr>
    `;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
      const tr = document.createElement("tr");
      if (dayName === "Friday") tr.className = "friday";
      tr.innerHTML = `
        <td>${String(d).padStart(2, "0")}</td>
        <td>${dayName}</td>
        <td></td><td></td><td></td><td></td>
      `;
      table.appendChild(tr);
    }

    page.appendChild(table);

    // (Optional signature block was commented out in your version)
    const foot = document.createElement("div");
    page.appendChild(foot);

    /* ✅ credit line at bottom */
    const credit = document.createElement("div");
    credit.className = "credit-footer";
    // credit.innerHTML = `Made by <strong>Murad</strong>`;
    page.appendChild(credit);

    output.appendChild(page);
  });

  window.scrollTo({ top: output.offsetTop - 10, behavior: "smooth" });
}

/* ---------------- Download PDF ---------------- */
function downloadPDF() {
  if (!output.children.length) {
    alert("Please generate the attendance sheet first."); return;
  }

  // Turn on PDF mode CSS to remove outer lines & perfectly center
  document.documentElement.classList.add('pdf-mode');

  const opt = {
    margin:       0,                               // browser margin 0
    filename:     'Attendance-Sheet.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: ['avoid-all'] }          // keep each .page to one A4
  };

  html2pdf().set(opt).from(output).save().then(() => {
    // revert back to screen mode after save
    document.documentElement.classList.remove('pdf-mode');
  }).catch(() => {
    document.documentElement.classList.remove('pdf-mode');
  });
}

/* ---------------- Utils ---------------- */
function escapeHtml(str){
  return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function formatMonthHyphen(year, monthIdx){
  const d = new Date(year, monthIdx, 1);
  const label = d.toLocaleString('en-US', { month: 'long' });
  return `${label}-${year}`;
}


