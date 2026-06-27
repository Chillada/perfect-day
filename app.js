const STORAGE_KEY = "perfect-day-state-v1";

const defaultHabits = [
  { id: "meditation", name: "Meditation", frequency: "daily", type: "check", goal: 1, unit: "", enabled: true, order: 1 },
  { id: "breathwork", name: "Breathwork", frequency: "daily", type: "check", goal: 1, unit: "", enabled: true, order: 2 },
  { id: "cold-shower", name: "Cold shower", frequency: "daily", type: "check", goal: 1, unit: "", enabled: true, order: 3 },
  { id: "fast", name: "12 hour fast", frequency: "daily", type: "check", goal: 1, unit: "", enabled: true, order: 4 },
  { id: "sauna", name: "Sauna", frequency: "weekly", type: "check", goal: 1, unit: "", enabled: true, order: 5 },
  { id: "steps", name: "Steps", frequency: "weekly", type: "number", goal: 100000, unit: "steps", enabled: true, order: 6 }
];

const state = loadState();
let activeView = "today";

const icons = {
  today: '<svg viewBox="0 0 24 24"><path d="M8 2v4M16 2v4M3.5 9.5h17M6 5h12a2.5 2.5 0 0 1 2.5 2.5V18A2.5 2.5 0 0 1 18 20.5H6A2.5 2.5 0 0 1 3.5 18V7.5A2.5 2.5 0 0 1 6 5Z"/><path d="m8.5 14 2.1 2.1 4.9-5.2"/></svg>',
  week: '<svg viewBox="0 0 24 24"><path d="M4 19V5M20 19V5M8 19V8M16 19V10M12 19V3"/></svg>',
  stats: '<svg viewBox="0 0 24 24"><path d="M4 19h16M7 16V9M12 16V5M17 16v-3"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1A1.7 1.7 0 0 0 4.6 15 1.7 1.7 0 0 0 3 14H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  up: '<svg viewBox="0 0 24 24"><path d="m6 15 6-6 6 6"/></svg>',
  down: '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"/></svg>',
  download: '<svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>',
  reset: '<svg viewBox="0 0 24 24"><path d="M4 4v6h6"/><path d="M20 11a8 8 0 1 0-2.3 5.7"/></svg>'
};

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (parsed && Array.isArray(parsed.habits)) {
      return {
        habits: parsed.habits,
        entries: parsed.entries || {},
        createdAt: parsed.createdAt || todayKey()
      };
    }
  } catch (error) {
    console.warn("Could not load Perfect Day data", error);
  }

  return {
    habits: defaultHabits,
    entries: {},
    createdAt: todayKey()
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function todayKey(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return toDateKey(date);
}

function toDateKey(date) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const year = copy.getFullYear();
  const month = String(copy.getMonth() + 1).padStart(2, "0");
  const day = String(copy.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(key, style = "long") {
  return dateFromKey(key).toLocaleDateString(undefined, {
    weekday: style === "short" ? "short" : "long",
    month: "short",
    day: "numeric"
  });
}

function weekStartKey(dateKey = todayKey()) {
  const date = dateFromKey(dateKey);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return toDateKey(date);
}

function weekDates(dateKey = todayKey()) {
  const start = dateFromKey(weekStartKey(dateKey));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return toDateKey(date);
  });
}

function orderedHabits(frequency) {
  return state.habits
    .filter((habit) => habit.frequency === frequency)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

function activeHabits(frequency) {
  return orderedHabits(frequency).filter((habit) => habit.enabled);
}

function entryFor(dateKey) {
  state.entries[dateKey] ||= {};
  return state.entries[dateKey];
}

function getValue(dateKey, habitId) {
  const entry = state.entries[dateKey] || {};
  return entry[habitId] ?? 0;
}

function setValue(dateKey, habitId, value) {
  entryFor(dateKey)[habitId] = value;
  saveState();
  render();
}

function isHabitComplete(habit, dateKeys) {
  if (habit.type === "check") {
    if (habit.frequency === "daily") return Boolean(getValue(dateKeys[0], habit.id));
    return dateKeys.some((dateKey) => Boolean(getValue(dateKey, habit.id)));
  }

  const total = dateKeys.reduce((sum, dateKey) => sum + Number(getValue(dateKey, habit.id) || 0), 0);
  return total >= Number(habit.goal || 0);
}

function isPerfectDay(dateKey) {
  const habits = activeHabits("daily");
  if (!habits.length) return false;
  return habits.every((habit) => isHabitComplete(habit, [dateKey]));
}

function weeklyCompletion(dateKey = todayKey()) {
  const dates = weekDates(dateKey);
  const habits = activeHabits("weekly");
  if (!habits.length) return { complete: 0, total: 0, percent: 0 };
  const complete = habits.filter((habit) => isHabitComplete(habit, dates)).length;
  return { complete, total: habits.length, percent: Math.round((complete / habits.length) * 100) };
}

function currentStreak() {
  let count = 0;
  for (let offset = 0; offset > -730; offset -= 1) {
    if (!isPerfectDay(todayKey(offset))) break;
    count += 1;
  }
  return count;
}

function bestStreak() {
  const allDates = knownDateRange();
  let best = 0;
  let running = 0;
  allDates.forEach((dateKey) => {
    if (isPerfectDay(dateKey)) {
      running += 1;
      best = Math.max(best, running);
    } else {
      running = 0;
    }
  });
  return best;
}

function knownDateRange() {
  const keys = Object.keys(state.entries);
  const start = keys.length ? keys.sort()[0] : state.createdAt;
  const startDate = dateFromKey(start);
  const endDate = dateFromKey(todayKey());
  const dates = [];
  for (const date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    dates.push(toDateKey(date));
  }
  return dates;
}

function perfectDayCount() {
  return knownDateRange().filter(isPerfectDay).length;
}

function render() {
  const app = document.querySelector("#app");
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        ${brandMarkup()}
        ${navMarkup("side")}
      </aside>
      <main class="main-panel">
        <header class="topbar">
          ${brandMarkup()}
          <div class="date-pill">${formatDate(todayKey())}</div>
        </header>
        ${viewMarkup()}
      </main>
      <nav class="bottom-nav">${navMarkup("bottom")}</nav>
    </div>
  `;

  bindNav();
  bindView();
}

function brandMarkup() {
  return `
    <div class="brand">
      <img src="icons/perfect-day.svg" alt="" />
      <div>
        <strong>Perfect Day</strong>
        <span>Private habit tracker</span>
      </div>
    </div>
  `;
}

function navMarkup(prefix) {
  const items = [
    ["today", "Today"],
    ["week", "Week"],
    ["stats", "Stats"],
    ["settings", "Settings"]
  ];

  return items
    .map(([view, label]) => {
      const active = activeView === view ? "active" : "";
      return `<button class="nav-button ${active}" data-view="${view}" aria-label="${label}" title="${label}">${icons[view]}<span>${label}</span></button>`;
    })
    .join("");
}

function viewMarkup() {
  if (activeView === "week") return weekView();
  if (activeView === "stats") return statsView();
  if (activeView === "settings") return settingsView();
  return todayView();
}

function todayView() {
  const dateKey = todayKey();
  const dailyHabits = activeHabits("daily");
  const perfect = isPerfectDay(dateKey);
  const completed = dailyHabits.filter((habit) => isHabitComplete(habit, [dateKey])).length;
  const percent = dailyHabits.length ? Math.round((completed / dailyHabits.length) * 100) : 0;
  const stepsHabit = activeHabits("weekly").find((habit) => habit.type === "number");

  return `
    <section class="hero-band">
      <div>
        <p class="eyebrow">Today</p>
        <h1>${perfect ? "Perfect day locked in." : "Build today's score."}</h1>
        <p>${completed} of ${dailyHabits.length} daily targets complete</p>
      </div>
      <div class="score-ring" style="--score:${percent}">
        <span>${percent}%</span>
      </div>
    </section>

    <section class="content-grid">
      <div class="panel">
        <div class="panel-heading">
          <h2>Daily targets</h2>
          <span>${formatDate(dateKey, "short")}</span>
        </div>
        <div class="habit-list">
          ${
            dailyHabits.length
              ? dailyHabits.map((habit) => dailyHabitMarkup(habit, dateKey)).join("")
              : `<p class="empty">No active daily targets.</p>`
          }
        </div>
      </div>

      <div class="panel accent-panel">
        <div class="panel-heading">
          <h2>Weekly steps</h2>
          <span>${weekRangeLabel()}</span>
        </div>
        ${stepsHabit ? stepInputMarkup(stepsHabit, dateKey) : `<p class="empty">No active step target.</p>`}
      </div>
    </section>
  `;
}

function dailyHabitMarkup(habit, dateKey) {
  const checked = Boolean(getValue(dateKey, habit.id));
  return `
    <label class="habit-row ${checked ? "done" : ""}">
      <input type="checkbox" data-action="toggle-check" data-date="${dateKey}" data-habit="${habit.id}" ${checked ? "checked" : ""} />
      <span class="check-ui"></span>
      <span>${escapeHtml(habit.name)}</span>
    </label>
  `;
}

function stepInputMarkup(habit, dateKey) {
  const dates = weekDates(dateKey);
  const total = dates.reduce((sum, key) => sum + Number(getValue(key, habit.id) || 0), 0);
  const percent = Math.min(100, Math.round((total / Number(habit.goal || 1)) * 100));

  return `
    <div class="meter-block">
      <div class="meter-copy">
        <strong>${formatNumber(total)} / ${formatNumber(habit.goal)} ${escapeHtml(habit.unit || "")}</strong>
        <span>${percent}% of weekly target</span>
      </div>
      <div class="meter"><span style="width:${percent}%"></span></div>
    </div>
    <label class="field">
      <span>Today's steps</span>
      <input type="number" inputmode="numeric" min="0" step="100" data-action="number-entry" data-date="${dateKey}" data-habit="${habit.id}" value="${Number(getValue(dateKey, habit.id) || 0)}" />
    </label>
  `;
}

function weekView() {
  const dates = weekDates();
  const weeklyHabits = activeHabits("weekly");

  return `
    <section class="section-heading">
      <div>
        <p class="eyebrow">This week</p>
        <h1>${weekRangeLabel()}</h1>
      </div>
      <div class="date-pill">${weeklyCompletion().complete} of ${weeklyCompletion().total} complete</div>
    </section>

    <section class="week-days">
      ${dates
        .map((dateKey) => `<div class="day-chip ${dateKey === todayKey() ? "active" : ""}"><span>${dateFromKey(dateKey).toLocaleDateString(undefined, { weekday: "short" })}</span><strong>${dateFromKey(dateKey).getDate()}</strong></div>`)
        .join("")}
    </section>

    <section class="panel">
      <div class="panel-heading">
        <h2>Weekly targets</h2>
        <span>Monday to Sunday</span>
      </div>
      <div class="habit-list">
        ${
          weeklyHabits.length
            ? weeklyHabits.map((habit) => weeklyHabitMarkup(habit, dates)).join("")
            : `<p class="empty">No active weekly targets.</p>`
        }
      </div>
    </section>
  `;
}

function weeklyHabitMarkup(habit, dates) {
  if (habit.type === "check") {
    const doneDate = dates.find((dateKey) => Boolean(getValue(dateKey, habit.id))) || todayKey();
    const checked = dates.some((dateKey) => Boolean(getValue(dateKey, habit.id)));
    return `
      <label class="habit-row ${checked ? "done" : ""}">
        <input type="checkbox" data-action="weekly-check" data-date="${doneDate}" data-habit="${habit.id}" ${checked ? "checked" : ""} />
        <span class="check-ui"></span>
        <span>${escapeHtml(habit.name)}</span>
      </label>
    `;
  }

  const total = dates.reduce((sum, dateKey) => sum + Number(getValue(dateKey, habit.id) || 0), 0);
  const percent = Math.min(100, Math.round((total / Number(habit.goal || 1)) * 100));
  return `
    <div class="weekly-number">
      <div class="meter-block">
        <div class="meter-copy">
          <strong>${escapeHtml(habit.name)}</strong>
          <span>${formatNumber(total)} / ${formatNumber(habit.goal)} ${escapeHtml(habit.unit || "")}</span>
        </div>
        <div class="meter"><span style="width:${percent}%"></span></div>
      </div>
      <div class="step-grid">
        ${dates
          .map(
            (dateKey) => `
              <label class="mini-field">
                <span>${dateFromKey(dateKey).toLocaleDateString(undefined, { weekday: "short" })}</span>
                <input type="number" inputmode="numeric" min="0" step="100" data-action="number-entry" data-date="${dateKey}" data-habit="${habit.id}" value="${Number(getValue(dateKey, habit.id) || 0)}" />
              </label>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function statsView() {
  const completion = weeklyCompletion();
  const range = knownDateRange();
  const lastSeven = Array.from({ length: 7 }, (_, index) => todayKey(index - 6));

  return `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Stats</p>
        <h1>Momentum at a glance.</h1>
      </div>
      <div class="date-pill">${completion.percent}% week</div>
    </section>

    <section class="stat-grid">
      ${statTile("Current streak", currentStreak(), "days")}
      ${statTile("Best streak", bestStreak(), "days")}
      ${statTile("Perfect days", perfectDayCount(), "total")}
      ${statTile("Tracked days", range.length, "days")}
    </section>

    <section class="panel">
      <div class="panel-heading">
        <h2>Last 7 days</h2>
        <span>${lastSeven.filter(isPerfectDay).length} perfect</span>
      </div>
      <div class="history-strip">
        ${lastSeven
          .map((dateKey) => `<div class="history-dot ${isPerfectDay(dateKey) ? "perfect" : ""}"><span>${dateFromKey(dateKey).toLocaleDateString(undefined, { weekday: "short" })}</span><strong>${dateFromKey(dateKey).getDate()}</strong></div>`)
          .join("")}
      </div>
    </section>
  `;
}

function statTile(label, value, unit) {
  return `
    <div class="stat-tile">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${unit}</small>
    </div>
  `;
}

function settingsView() {
  return `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Settings</p>
        <h1>Tune the challenge.</h1>
      </div>
      <button class="primary-action" data-action="add-habit">${icons.plus}<span>Add target</span></button>
    </section>

    <section class="panel">
      <div class="panel-heading">
        <h2>Targets</h2>
        <span>${state.habits.length} total</span>
      </div>
      <div class="settings-list">
        ${orderedAllHabits().map(settingsHabitMarkup).join("")}
      </div>
    </section>

    <section class="data-actions">
      <button class="secondary-action" data-action="export-data">${icons.download}<span>Export data</span></button>
      <label class="secondary-action file-action">
        <input type="file" accept="application/json" data-action="import-data" />
        <span>Import data</span>
      </label>
      <button class="danger-action" data-action="reset-data">${icons.reset}<span>Reset</span></button>
    </section>
  `;
}

function orderedAllHabits() {
  return [...state.habits].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

function settingsHabitMarkup(habit) {
  return `
    <article class="settings-row ${habit.enabled ? "" : "disabled"}" data-habit-row="${habit.id}">
      <div class="settings-main">
        <label class="toggle-line">
          <input type="checkbox" data-action="toggle-enabled" data-habit="${habit.id}" ${habit.enabled ? "checked" : ""} />
          <span>${escapeHtml(habit.name)}</span>
        </label>
        <span>${habit.frequency} · ${habit.type === "check" ? "checkbox" : `${formatNumber(habit.goal)} ${escapeHtml(habit.unit || "")}`}</span>
      </div>
      <div class="settings-controls">
        <button data-action="move-up" data-habit="${habit.id}" aria-label="Move ${escapeAttr(habit.name)} up" title="Move up">${icons.up}</button>
        <button data-action="move-down" data-habit="${habit.id}" aria-label="Move ${escapeAttr(habit.name)} down" title="Move down">${icons.down}</button>
        <button data-action="edit-habit" data-habit="${habit.id}" aria-label="Edit ${escapeAttr(habit.name)}" title="Edit">Edit</button>
        <button data-action="delete-habit" data-habit="${habit.id}" aria-label="Delete ${escapeAttr(habit.name)}" title="Delete">${icons.trash}</button>
      </div>
    </article>
  `;
}

function bindNav() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      activeView = button.dataset.view;
      render();
    });
  });
}

function bindView() {
  document.querySelectorAll("[data-action]").forEach((element) => {
    const action = element.dataset.action;

    if (action === "toggle-check") {
      element.addEventListener("change", () => setValue(element.dataset.date, element.dataset.habit, element.checked ? 1 : 0));
    }

    if (action === "weekly-check") {
      element.addEventListener("change", () => {
        const dates = weekDates();
        dates.forEach((dateKey) => {
          if (getValue(dateKey, element.dataset.habit)) entryFor(dateKey)[element.dataset.habit] = 0;
        });
        if (element.checked) entryFor(todayKey())[element.dataset.habit] = 1;
        saveState();
        render();
      });
    }

    if (action === "number-entry") {
      const saveNumber = () => {
        const value = Math.max(0, Number(element.value || 0));
        entryFor(element.dataset.date)[element.dataset.habit] = value;
        saveState();
      };
      element.addEventListener("input", saveNumber);
      element.addEventListener("change", () => {
        saveNumber();
        render();
      });
    }

    if (action === "add-habit") element.addEventListener("click", () => openHabitDialog());
    if (action === "edit-habit") element.addEventListener("click", () => openHabitDialog(findHabit(element.dataset.habit)));
    if (action === "delete-habit") element.addEventListener("click", () => deleteHabit(element.dataset.habit));
    if (action === "toggle-enabled") element.addEventListener("change", () => updateHabit(element.dataset.habit, { enabled: element.checked }));
    if (action === "move-up") element.addEventListener("click", () => moveHabit(element.dataset.habit, -1));
    if (action === "move-down") element.addEventListener("click", () => moveHabit(element.dataset.habit, 1));
    if (action === "export-data") element.addEventListener("click", exportData);
    if (action === "import-data") element.addEventListener("change", importData);
    if (action === "reset-data") element.addEventListener("click", resetData);
  });
}

let renderTimer = 0;
function renderSoon() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(render, 350);
}

function findHabit(id) {
  return state.habits.find((habit) => habit.id === id);
}

function updateHabit(id, patch) {
  const habit = findHabit(id);
  if (!habit) return;
  Object.assign(habit, patch);
  saveState();
  render();
}

function moveHabit(id, direction) {
  const habits = orderedAllHabits();
  const index = habits.findIndex((habit) => habit.id === id);
  const next = index + direction;
  if (next < 0 || next >= habits.length) return;
  const currentOrder = habits[index].order;
  habits[index].order = habits[next].order;
  habits[next].order = currentOrder;
  saveState();
  render();
}

function deleteHabit(id) {
  const habit = findHabit(id);
  if (!habit) return;
  const confirmed = window.confirm(`Delete "${habit.name}" and its tracked entries?`);
  if (!confirmed) return;

  state.habits = state.habits.filter((item) => item.id !== id);
  Object.values(state.entries).forEach((entry) => delete entry[id]);
  saveState();
  render();
}

function openHabitDialog(habit = null) {
  const isEdit = Boolean(habit);
  const dialog = document.createElement("dialog");
  dialog.className = "habit-dialog";
  dialog.innerHTML = `
    <form method="dialog" class="dialog-form">
      <div class="panel-heading">
        <h2>${isEdit ? "Edit target" : "Add target"}</h2>
        <button value="cancel" aria-label="Close">Close</button>
      </div>
      <label class="field">
        <span>Name</span>
        <input name="name" required maxlength="36" value="${escapeAttr(habit?.name || "")}" />
      </label>
      <div class="split-fields">
        <label class="field">
          <span>Frequency</span>
          <select name="frequency">
            <option value="daily" ${habit?.frequency === "daily" ? "selected" : ""}>Daily</option>
            <option value="weekly" ${habit?.frequency === "weekly" ? "selected" : ""}>Weekly</option>
          </select>
        </label>
        <label class="field">
          <span>Type</span>
          <select name="type">
            <option value="check" ${habit?.type === "check" ? "selected" : ""}>Checkbox</option>
            <option value="number" ${habit?.type === "number" ? "selected" : ""}>Number</option>
          </select>
        </label>
      </div>
      <div class="split-fields">
        <label class="field">
          <span>Goal</span>
          <input name="goal" type="number" min="1" step="1" value="${Number(habit?.goal || 1)}" />
        </label>
        <label class="field">
          <span>Unit</span>
          <input name="unit" maxlength="18" value="${escapeAttr(habit?.unit || "")}" />
        </label>
      </div>
      <menu class="dialog-actions">
        <button value="cancel" class="secondary-action">Cancel</button>
        <button value="save" class="primary-action">${isEdit ? "Save" : "Add"}</button>
      </menu>
    </form>
  `;

  document.body.append(dialog);
  dialog.showModal();
  dialog.addEventListener("close", () => dialog.remove());
  dialog.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    const submitter = event.submitter?.value;
    if (submitter !== "save") {
      dialog.close();
      return;
    }

    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get("name").toString().trim(),
      frequency: form.get("frequency").toString(),
      type: form.get("type").toString(),
      goal: Math.max(1, Number(form.get("goal") || 1)),
      unit: form.get("unit").toString().trim(),
      enabled: habit?.enabled ?? true
    };

    if (payload.type === "check") {
      payload.goal = 1;
      payload.unit = "";
    }

    if (isEdit) {
      Object.assign(habit, payload);
    } else {
      state.habits.push({
        ...payload,
      id: window.crypto?.randomUUID ? window.crypto.randomUUID() : `habit-${Date.now()}`,
        order: Math.max(0, ...state.habits.map((item) => item.order)) + 1
      });
    }

    saveState();
    dialog.close();
    render();
  });
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `perfect-day-${todayKey()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed || !Array.isArray(parsed.habits) || typeof parsed.entries !== "object") {
        throw new Error("Invalid Perfect Day file");
      }
      state.habits = parsed.habits;
      state.entries = parsed.entries || {};
      state.createdAt = parsed.createdAt || todayKey();
      saveState();
      render();
    } catch (error) {
      window.alert("That file could not be imported.");
    }
  };
  reader.readAsText(file);
}

function resetData() {
  const confirmed = window.confirm("Reset all Perfect Day targets and history on this device?");
  if (!confirmed) return;
  localStorage.removeItem(STORAGE_KEY);
  Object.assign(state, {
    habits: typeof structuredClone === "function" ? structuredClone(defaultHabits) : JSON.parse(JSON.stringify(defaultHabits)),
    entries: {},
    createdAt: todayKey()
  });
  activeView = "today";
  saveState();
  render();
}

function weekRangeLabel() {
  const dates = weekDates();
  const first = dateFromKey(dates[0]).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const last = dateFromKey(dates[6]).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${first} - ${last}`;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch((error) => console.warn("Service worker failed", error));
  });
}

render();
