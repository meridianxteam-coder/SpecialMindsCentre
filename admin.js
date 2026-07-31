/* ==========================================================================
   Staff Admin Dashboard
   Note: this is a lightweight, browser-only tool. The passcode is a soft
   gate to keep casual visitors out — it is NOT secure authentication, since
   anyone can view this file's source. Data is stored in this browser only
   (localStorage), per-device. For multi-device sync or real access control,
   a small backend/shared form service would be needed.
   ========================================================================== */

const ADMIN_PASSCODE = "SpecialMinds2025"; // change this to your own passcode
const STORAGE_KEY = "smc_inquiries";

let inquiries = [];
let activeFilter = "all";

document.addEventListener("DOMContentLoaded", () => {
  const lockScreen = document.getElementById("lockScreen");
  const dashboard = document.getElementById("dashboard");
  const passInput = document.getElementById("passInput");
  const unlockBtn = document.getElementById("unlockBtn");
  const lockError = document.getElementById("lockError");
  const lockOutBtn = document.getElementById("lockOutBtn");

  function unlock() {
    if (passInput.value === ADMIN_PASSCODE) {
      sessionStorage.setItem("smc_admin_unlocked", "1");
      lockScreen.style.display = "none";
      dashboard.style.display = "block";
      loadInquiries();
      render();
    } else {
      lockError.textContent = "Incorrect passcode. Please try again.";
      passInput.value = "";
      passInput.focus();
    }
  }

  unlockBtn.addEventListener("click", unlock);
  passInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") unlock();
  });

  lockOutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("smc_admin_unlocked");
    dashboard.style.display = "none";
    lockScreen.style.display = "block";
    passInput.value = "";
  });

  // Stay unlocked for the tab session (not across browser restarts)
  if (sessionStorage.getItem("smc_admin_unlocked") === "1") {
    lockScreen.style.display = "none";
    dashboard.style.display = "block";
    loadInquiries();
    render();
  }

  /* ---------- Data ---------- */
  function loadInquiries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      inquiries = raw ? JSON.parse(raw) : [];
    } catch (err) {
      inquiries = [];
    }
  }

  function saveInquiries() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inquiries));
  }

  /* ---------- Add inquiry ---------- */
  const addForm = document.getElementById("addInquiryForm");
  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      name: document.getElementById("addName").value.trim(),
      phone: document.getElementById("addPhone").value.trim(),
      email: document.getElementById("addEmail").value.trim(),
      sessionType: document.getElementById("addType").value,
      source: document.getElementById("addSource").value,
      notes: document.getElementById("addNotes").value.trim(),
      date: new Date().toISOString(),
      status: "pending"
    };
    if (!entry.name || !entry.phone) return;
    inquiries.unshift(entry);
    saveInquiries();
    addForm.reset();
    render();
  });

  /* ---------- Filters & search ---------- */
  document.querySelectorAll(".admin-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".admin-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      activeFilter = tab.dataset.filter;
      render();
    });
  });

  document.getElementById("searchBox").addEventListener("input", render);

  /* ---------- Export ---------- */
  document.getElementById("exportBtn").addEventListener("click", exportCSV);

  function exportCSV() {
    const rows = [["Name", "Phone", "Email", "Session Type", "Source", "Notes", "Date", "Status"]];
    inquiries.forEach(i => {
      rows.push([i.name, i.phone, i.email, i.sessionType, i.source, i.notes, i.date, i.status]);
    });
    const csv = rows.map(r => r.map(cell => `"${String(cell || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ---------- Render ---------- */
  window.toggleStatus = function (id) {
    const item = inquiries.find(i => i.id === id);
    if (item) {
      item.status = item.status === "pending" ? "done" : "pending";
      saveInquiries();
      render();
    }
  };

  window.deleteInquiry = function (id) {
    if (!confirm("Remove this inquiry? This can't be undone.")) return;
    inquiries = inquiries.filter(i => i.id !== id);
    saveInquiries();
    render();
  };

  function render() {
    const tbody = document.getElementById("inquiryTbody");
    const emptyState = document.getElementById("emptyState");
    const search = document.getElementById("searchBox").value.trim().toLowerCase();

    let list = inquiries.filter(i => {
      if (activeFilter !== "all" && i.status !== activeFilter) return false;
      if (search) {
        const hay = `${i.name} ${i.phone} ${i.email}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });

    document.getElementById("statTotal").textContent = inquiries.length;
    document.getElementById("statPending").textContent = inquiries.filter(i => i.status === "pending").length;
    document.getElementById("statDone").textContent = inquiries.filter(i => i.status === "done").length;

    tbody.innerHTML = "";

    if (!list.length) {
      emptyState.classList.add("show");
      return;
    }
    emptyState.classList.remove("show");

    list.forEach(i => {
      const tr = document.createElement("tr");
      const dateStr = new Date(i.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
      tr.innerHTML = `
        <td class="name-cell"><strong>${escapeHTML(i.name)}</strong><small>${escapeHTML(i.source || "")}</small></td>
        <td>${escapeHTML(i.phone)}${i.email ? `<br><small>${escapeHTML(i.email)}</small>` : ""}</td>
        <td>${escapeHTML(i.sessionType || "")}</td>
        <td>${escapeHTML(i.notes || "")}</td>
        <td>${dateStr}</td>
        <td><span class="status-pill ${i.status}">${i.status === "done" ? "Dealt With" : "Pending"}</span></td>
        <td>
          <div class="row-actions">
            <button data-action="toggle">${i.status === "done" ? "Mark Pending" : "Mark Done"}</button>
            <button data-action="delete" class="danger">Delete</button>
          </div>
        </td>
      `;
      tr.querySelector('[data-action="toggle"]').addEventListener("click", () => toggleStatus(i.id));
      tr.querySelector('[data-action="delete"]').addEventListener("click", () => deleteInquiry(i.id));
      tbody.appendChild(tr);
    });
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
});
