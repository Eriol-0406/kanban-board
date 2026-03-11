# Clawbot Kanban Board (2 Agents)

Simple project-management kanban board for `Agent-1` and `Agent-2`.

## Features
- Columns: Backlog, Ready, In Progress, Review, Blocked, Done
- Fixed assignees: Agent-1 and Agent-2
- Card fields: title, description, agent, priority, status, due date, label
- Optional fields shown on cards: dependencies, checklist, notes
- WIP limits:
  - Agent WIP limit in `In Progress`: 2 per agent
  - Column limits: `In Progress` = 4, `Review` = 3
- Activity history
- Filters: agent, priority, label, status
- Notifications for tasks moved to Review, Blocked, or Done
- Simple dashboard stats

## Run
Open `index.html` directly in a browser, or run a local server:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.
