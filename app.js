const columns = ["Backlog", "Ready", "In Progress", "Review", "Blocked", "Done"];
const columnLimits = { "In Progress": 4, "Review": 3 };
const agentWipLimit = 2;

const state = {
  tasks: [
    {
      id: crypto.randomUUID(),
      title: "Build RSS ingestion",
      description: "Scrape news sources from PRD section 2.1",
      agent: "Agent-1",
      priority: "High",
      status: "Ready",
      dueDate: "2026-03-13",
      label: "integration",
      dependencies: "None",
      checklist: ["Parse feed config", "Normalize items"],
      notes: "Seed example"
    },
    {
      id: crypto.randomUUID(),
      title: "Design PRD parser",
      description: "Extract sections into actionable tasks",
      agent: "Agent-2",
      priority: "Medium",
      status: "In Progress",
      dueDate: "2026-03-14",
      label: "agent-logic",
      dependencies: "None",
      checklist: ["Define schema", "Implement parser", "Add validation"],
      notes: "Seed example"
    },
    {
      id: crypto.randomUUID(),
      title: "Agent-1 Work Log",
      description: "What I did / doing / blocked",
      agent: "Agent-1",
      priority: "Medium",
      status: "Backlog",
      dueDate: "2026-03-16",
      label: "documentation",
      dependencies: "None",
      checklist: ["Update daily"],
      notes: "Agent log"
    },
    {
      id: crypto.randomUUID(),
      title: "Agent-2 Work Log",
      description: "What I did / doing / blocked",
      agent: "Agent-2",
      priority: "Medium",
      status: "Backlog",
      dueDate: "2026-03-16",
      label: "documentation",
      dependencies: "None",
      checklist: ["Update daily"],
      notes: "Agent log"
    }
  ],
  activity: []
};

const board = document.getElementById("board");
const stats = document.getElementById("stats");
const logEl = document.getElementById("activityLog");

function notify(msg) {
  state.activity.unshift(`${new Date().toLocaleTimeString()} - ${msg}`);
  state.activity = state.activity.slice(0, 20);
}

function getFilters() {
  return {
    agent: document.getElementById("filterAgent").value,
    priority: document.getElementById("filterPriority").value,
    label: document.getElementById("filterLabel").value,
    status: document.getElementById("filterStatus").value
  };
}

function visible(task, filters) {
  return [
    filters.agent === "all" || task.agent === filters.agent,
    filters.priority === "all" || task.priority === filters.priority,
    filters.label === "all" || task.label === filters.label,
    filters.status === "all" || task.status === filters.status
  ].every(Boolean);
}

function countAgentInProgress(agent) {
  return state.tasks.filter(t => t.agent === agent && t.status === "In Progress").length;
}

function moveTask(id, direction) {
  const task = state.tasks.find(t => t.id === id);
  const currentIndex = columns.indexOf(task.status);
  const newIndex = currentIndex + direction;
  if (newIndex < 0 || newIndex >= columns.length) return;
  const nextStatus = columns[newIndex];

  const targetCount = state.tasks.filter(t => t.status === nextStatus).length;
  if (columnLimits[nextStatus] && targetCount >= columnLimits[nextStatus]) {
    alert(`${nextStatus} is at limit (${columnLimits[nextStatus]}).`);
    return;
  }

  if (nextStatus === "In Progress" && countAgentInProgress(task.agent) >= agentWipLimit) {
    alert(`${task.agent} reached WIP limit (${agentWipLimit}).`);
    return;
  }

  task.status = nextStatus;
  notify(`${task.title} moved to ${nextStatus}`);

  if (nextStatus === "Review" || nextStatus === "Blocked" || nextStatus === "Done") {
    alert(`Notification: ${task.title} moved to ${nextStatus}`);
  }

  render();
}

function renderStats() {
  const done = state.tasks.filter(t => t.status === "Done").length;
  const inProgress = state.tasks.filter(t => t.status === "In Progress").length;
  const blocked = state.tasks.filter(t => t.status === "Blocked").length;
  const completionRate = state.tasks.length ? Math.round((done / state.tasks.length) * 100) : 0;

  stats.innerHTML = `
    <div class="stat">Tasks completed today: ${done}</div>
    <div class="stat">In progress: ${inProgress}</div>
    <div class="stat">Blocked: ${blocked}</div>
    <div class="stat">Completion rate: ${completionRate}%</div>
  `;
}

function renderActivity() {
  logEl.innerHTML = state.activity.map(e => `<li>${e}</li>`).join("");
}

function render() {
  const filters = getFilters();
  board.innerHTML = "";

  columns.forEach(col => {
    const colEl = document.createElement("section");
    colEl.className = "column";
    const tasks = state.tasks.filter(t => t.status === col && visible(t, filters));

    colEl.innerHTML = `
      <h3>${col}</h3>
      <div class="limit">Limit: ${columnLimits[col] ?? "none"}</div>
      <div class="cards"></div>
    `;

    const cards = colEl.querySelector(".cards");
    tasks.forEach(task => {
      const leftDisabled = columns.indexOf(task.status) === 0 ? "disabled" : "";
      const rightDisabled = columns.indexOf(task.status) === columns.length - 1 ? "disabled" : "";
      const agentInProgress = countAgentInProgress(task.agent);
      const showWarning = task.status === "In Progress" && agentInProgress >= agentWipLimit;

      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <h4>${task.title}</h4>
        <div class="meta">${task.agent} · ${task.priority} · Due ${task.dueDate}</div>
        <p>${task.description}</p>
        <div class="tags"><span class="tag">${task.label}</span><span class="tag">Deps: ${task.dependencies}</span></div>
        <ul class="checklist">${task.checklist.map(item => `<li>[ ] ${item}</li>`).join("")}</ul>
        <div class="meta">Notes: ${task.notes || "-"}</div>
        ${showWarning ? `<div class="warning">WIP warning: ${task.agent} at limit ${agentWipLimit}</div>` : ""}
        <div class="card-actions">
          <button class="small" ${leftDisabled} data-act="left">◀</button>
          <button class="small" ${rightDisabled} data-act="right">▶</button>
        </div>
      `;
      card.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", () => moveTask(task.id, btn.dataset.act === "left" ? -1 : 1));
      });
      cards.appendChild(card);
    });

    board.appendChild(colEl);
  });

  renderStats();
  renderActivity();
}

["filterAgent", "filterPriority", "filterLabel", "filterStatus"].forEach(id => {
  document.getElementById(id).addEventListener("change", render);
});

document.getElementById("taskForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const task = {
    id: crypto.randomUUID(),
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    agent: document.getElementById("agent").value,
    priority: document.getElementById("priority").value,
    status: "Backlog",
    dueDate: document.getElementById("dueDate").value,
    label: document.getElementById("label").value,
    dependencies: "None",
    checklist: [],
    notes: ""
  };
  state.tasks.push(task);
  notify(`Task created: ${task.title} (${task.agent})`);
  e.target.reset();
  render();
});

notify("Board initialized for Clawbot with Agent-1 and Agent-2");
render();
