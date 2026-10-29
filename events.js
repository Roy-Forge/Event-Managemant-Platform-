/* Forge Events - event creation prototype.
   Events created here are saved in this browser's localStorage.
   A shared, production-ready database/API is not included in this frontend ZIP. */
(function () {
  "use strict";
  const KEY = "forgeEvents";
  const readEvents = () => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch (_) { return []; }
  };
  const saveEvents = (events) => localStorage.setItem(KEY, JSON.stringify(events));
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[ch]);
  const formatDate = (date) => {
    if (!date) return "Date to be announced";
    const d = new Date(date + "T12:00:00");
    return Number.isNaN(d.getTime()) ? date : d.toLocaleDateString(undefined, {day:"2-digit", month:"short", year:"numeric"});
  };

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("event-form");
    const notice = document.getElementById("event-notice");
    const list = document.getElementById("created-events-list");
    const tableBody = document.getElementById("created-events-table");
    const publicGrid = document.getElementById("created-public-events");

    function renderAdmin() {
      const events = readEvents();
      if (list) {
        list.innerHTML = events.length ? events.map(ev => `
          <div class="row-item">
            <div><h3>${escapeHtml(ev.title)}</h3>
              <p>${escapeHtml(formatDate(ev.date))} · ${escapeHtml(ev.time || "Time TBC")} · ${escapeHtml(ev.venue)}</p>
              <p>${escapeHtml(ev.description || "No description added.")}</p>
              <p>${escapeHtml(ev.capacity)} places · ${escapeHtml(ev.status)}</p>
            </div>
            <button class="btn btn-outline btn-small" type="button" data-delete-event="${escapeHtml(ev.id)}">Delete</button>
          </div>`).join("") : '<p class="muted">No events created yet. Use “Add new event” to create your first event.</p>';
      }
      if (tableBody) {
        tableBody.innerHTML = events.length ? events.map(ev => `<tr>
          <td>${escapeHtml(ev.title)}</td><td>${escapeHtml(formatDate(ev.date))}</td>
          <td>0 / ${escapeHtml(ev.capacity)}</td><td><span class="status ${ev.status === "Open" ? "open" : ""}">${escapeHtml(ev.status)}</span></td>
          <td><button class="btn btn-outline btn-small" type="button" data-delete-event="${escapeHtml(ev.id)}">Delete</button></td>
        </tr>`).join("") : "";
      }
      if (publicGrid) {
        publicGrid.innerHTML = events.filter(ev => ev.status === "Open").map(ev => `<article class="card">
          <div class="card-body"><h3>${escapeHtml(ev.title)}</h3>
          <p>${escapeHtml(formatDate(ev.date))}${ev.time ? ", " + escapeHtml(ev.time) : ""} · ${escapeHtml(ev.venue)}</p>
          <p class="spots">${escapeHtml(ev.capacity)} places available</p>
          <p>${escapeHtml(ev.description || "")}</p></div></article>`).join("");
      }
    }
    document.addEventListener("click", (e) => {
      const button = e.target.closest("[data-delete-event]");
      if (!button) return;
      const id = button.getAttribute("data-delete-event");
      if (!window.confirm("Delete this event?")) return;
      saveEvents(readEvents().filter(ev => ev.id !== id));
      renderAdmin();
    });
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!form.reportValidity()) return;
        const data = new FormData(form);
        const events = readEvents();
        events.unshift({
          id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
          title: data.get("title").trim(),
          date: data.get("date"),
          time: data.get("time"),
          venue: data.get("venue").trim(),
          capacity: Math.max(1, Number(data.get("capacity")) || 1),
          status: data.get("status"),
          description: data.get("description").trim()
        });
        saveEvents(events);
        form.reset();
        if (notice) {
          notice.textContent = "Event saved in this browser. It is now listed on the Events page on this device.";
          notice.hidden = false;
        }
        renderAdmin();
      });
    }
    renderAdmin();
  });
})();