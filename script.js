
let reminders = [];

try {
  const saved = JSON.parse(
    localStorage.getItem("nudgeReminders") || "[]"
  );
  reminders = Array.isArray(saved) ? saved : [];
} catch {
  reminders = [];
}

function saveReminders() {
  localStorage.setItem("nudgeReminders", JSON.stringify(reminders));
}

function getPriority(reminder) {
  if (reminder.completed) return "COMPLETED";
  if (!reminder.dueDate) return "LOW";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(reminder.dueDate + "T00:00:00");
  const daysLeft = Math.round((due - today) / 86400000);

  if (daysLeft <= 1) return "HIGH";
  if (daysLeft <= 3) return "MEDIUM";
  return "LOW";
}

function getSmartSuggestion(reminder) {
  if (reminder.completed) return "Great job completing this task!";

  if (!reminder.dueDate) {
    return "Add a due date to plan your follow-up.";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(reminder.dueDate + "T00:00:00");
  const daysLeft = Math.round((due - today) / 86400000);

  if (daysLeft < 0) return "Overdue — follow up as soon as possible.";
  if (daysLeft === 0) return "Due today — take action today.";
  if (daysLeft === 1) return "Due tomorrow — prepare to take action.";
  if (daysLeft <= 3) return "Due soon — consider handling this next.";

  if (reminder.category === "Refund") {
    return "Keep your refund details ready for follow-up.";
  }

  if (reminder.category === "Bill") {
    return "Check payment details before the due date.";
  }

  if (reminder.category === "Warranty") {
    return "Keep your receipt and warranty details handy.";
  }

  return "You're on track. Check this reminder before its due date.";
}

function addReminder(title, category, dueDate) {
  reminders.push({
    id: Date.now(),
    title,
    category,
    dueDate,
    completed: false
  });

  saveReminders();
  renderReminders();
}

function completeReminder(id) {
  reminders = reminders.map(reminder =>
    reminder.id === id
      ? { ...reminder, completed: !reminder.completed }
      : reminder
  );

  saveReminders();
  renderReminders();
}

function deleteReminder(id) {
  reminders = reminders.filter(reminder => reminder.id !== id);
  saveReminders();
  renderReminders();
}

function renderReminders() {
  const list = document.getElementById("reminderList");
  const emptyMessage = document.getElementById("emptyMessage");

  if (!list) return;

  list.innerHTML = "";

  if (emptyMessage) {
    emptyMessage.style.display = reminders.length === 0 ? "block" : "none";
  }

  reminders.forEach(reminder => {
    const item = document.createElement("div");
    item.className = "card";
    item.style.marginBottom = "12px";

    const title = document.createElement("h3");
    title.textContent = reminder.title;

    if (reminder.completed) {
      title.style.textDecoration = "line-through";
      title.style.opacity = "0.6";
    }

    const details = document.createElement("p");
    details.textContent =
      `${reminder.category} · Due: ${reminder.dueDate || "No date"}`;

    const priority = getPriority(reminder);
    const priorityLabel = document.createElement("p");
    priorityLabel.textContent = `Priority: ${priority}`;
    priorityLabel.style.fontWeight = "bold";
    priorityLabel.style.color =
      priority === "HIGH" ? "#d94c65" :
      priority === "MEDIUM" ? "#c17b18" :
      priority === "COMPLETED" ? "#23845b" : "#6655e8";

    const suggestion = document.createElement("p");
    suggestion.textContent =
      "💡 Smart suggestion: " + getSmartSuggestion(reminder);

    const status = document.createElement("p");
    status.textContent = reminder.completed ? "✓ Completed" : "● Pending";

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "8px";
    actions.style.flexWrap = "wrap";

    const completeButton = document.createElement("button");
    completeButton.textContent = reminder.completed ? "Undo" : "Mark complete";
    completeButton.onclick = () => completeReminder(reminder.id);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.style.background = "#d94c65";
    deleteButton.onclick = () => {
      if (confirm("Delete this reminder?")) {
        deleteReminder(reminder.id);
      }
    };

    actions.append(completeButton, deleteButton);
    item.append(title, details, priorityLabel, suggestion, status, actions);
    list.appendChild(item);
  });

  document.getElementById("totalCount").textContent = reminders.length;
  document.getElementById("completedCount").textContent =
    reminders.filter(r => r.completed).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  document.getElementById("dueCount").textContent =
    reminders.filter(reminder => {
      if (reminder.completed || !reminder.dueDate) return false;
      const due = new Date(reminder.dueDate + "T00:00:00");
      return due >= today && due <= nextWeek;
    }).length;
}

document.addEventListener("DOMContentLoaded", () => {
  const addButton = document.getElementById("addReminderButton");
  const form = document.getElementById("reminderForm");
  const cancelButton = document.getElementById("cancelReminderButton");

  addButton.addEventListener("click", () => {
    form.hidden = false;
    document.getElementById("reminderTitle").focus();
  });

  cancelButton.addEventListener("click", () => {
    form.reset();
    form.hidden = true;
  });

  form.addEventListener("submit", event => {
    event.preventDefault();

    const title = document.getElementById("reminderTitle").value.trim();
    const category = document.getElementById("reminderCategory").value;
    const dueDate = document.getElementById("reminderDate").value;

    if (!title) return;

    addReminder(title, category, dueDate);
    form.reset();
    form.hidden = true;
  });

  renderReminders();
});
