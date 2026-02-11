const calendarGrid = document.getElementById("calendar-grid");
const monthLabel = document.getElementById("month-label");
const prevMonthButton = document.getElementById("prev-month");
const nextMonthButton = document.getElementById("next-month");
const selectedDateLabel = document.getElementById("selected-date-label");
const eventList = document.getElementById("event-list");
const eventForm = document.getElementById("event-form");
const eventTitleInput = document.getElementById("event-title");
const eventDateInput = document.getElementById("event-date");
const eventTimeInput = document.getElementById("event-time");
const eventDurationInput = document.getElementById("event-duration");
const eventRecurrenceInput = document.getElementById("event-recurrence");
const eventUntilInput = document.getElementById("event-until");

const state = {
    currentDate: new Date(),
    selectedDate: new Date(),
    events: loadEvents()
};

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

function padNumber(value) {
    return String(value).padStart(2, "0");
}

function formatDateKey(date) {
    return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
}

function parseDateKey(key) {
    const [year, month, day] = key.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function loadEvents() {
    const stored = localStorage.getItem("wushuEvents");
    if (!stored) {
        return [];
    }
    try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

function saveEvents() {
    localStorage.setItem("wushuEvents", JSON.stringify(state.events));
}

function eventOccursOnDate(eventItem, date) {
    const targetKey = formatDateKey(date);
    if (eventItem.recurrence === "none") {
        return eventItem.date === targetKey;
    }
    const startDate = parseDateKey(eventItem.date);
    if (date < startDate) {
        return false;
    }
    if (eventItem.until) {
        const untilDate = parseDateKey(eventItem.until);
        if (date > untilDate) {
            return false;
        }
    }
    if (eventItem.recurrence === "weekly") {
        return date.getDay() === startDate.getDay();
    }
    if (eventItem.recurrence === "monthly") {
        return date.getDate() === startDate.getDate();
    }
    return false;
}

function eventsForDate(date) {
    return state.events.filter((eventItem) => eventOccursOnDate(eventItem, date));
}

function renderCalendar() {
    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    monthLabel.textContent = monthFormatter.format(state.currentDate);
    calendarGrid.innerHTML = "";

    for (let i = 0; i < startOffset; i += 1) {
        const placeholder = document.createElement("div");
        placeholder.className = "calendar-cell placeholder";
        calendarGrid.appendChild(placeholder);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(year, month, day);
        const dateKey = formatDateKey(date);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "calendar-cell";
        button.dataset.date = dateKey;
        button.innerHTML = `<span>${day}</span>`;

        if (formatDateKey(state.selectedDate) === dateKey) {
            button.classList.add("selected");
        }

        if (formatDateKey(new Date()) === dateKey) {
            button.classList.add("today");
        }

        if (eventsForDate(date).length > 0) {
            button.classList.add("has-events");
        }

        calendarGrid.appendChild(button);
    }
}

function renderSelectedDate() {
    selectedDateLabel.textContent = dayFormatter.format(state.selectedDate);
    eventDateInput.value = formatDateKey(state.selectedDate);
}

function renderEventList() {
    const items = eventsForDate(state.selectedDate);
    eventList.innerHTML = "";

    if (items.length === 0) {
        const empty = document.createElement("li");
        empty.className = "event-empty";
        empty.textContent = "No events yet.";
        eventList.appendChild(empty);
        return;
    }

    items.forEach((eventItem) => {
        const listItem = document.createElement("li");
        listItem.className = "event-item";

        const info = document.createElement("div");
        info.className = "event-info";

        const title = document.createElement("h3");
        title.textContent = eventItem.title;

        const meta = document.createElement("p");
        const timeLabel = eventItem.time ? eventItem.time : "All day";
        const durationLabel = eventItem.duration ? `${eventItem.duration} mins` : "";
        const recurrenceLabel = eventItem.recurrence !== "none" ? `• ${eventItem.recurrence}` : "";
        const untilLabel = eventItem.until ? `• until ${eventItem.until}` : "";
        meta.textContent = [timeLabel, durationLabel, recurrenceLabel, untilLabel].filter(Boolean).join(" ");

        info.appendChild(title);
        info.appendChild(meta);

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "remove-button";
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", () => removeEvent(eventItem.id));

        listItem.appendChild(info);
        listItem.appendChild(removeButton);
        eventList.appendChild(listItem);
    });
}

function renderAll() {
    renderCalendar();
    renderSelectedDate();
    renderEventList();
}

function shiftMonth(direction) {
    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();
    state.currentDate = new Date(year, month + direction, 1);
    renderAll();
}

function selectDate(dateKey) {
    state.selectedDate = parseDateKey(dateKey);
    renderAll();
}

function addEvent(eventItem) {
    state.events.push(eventItem);
    saveEvents();
    renderAll();
}

function removeEvent(id) {
    state.events = state.events.filter((eventItem) => eventItem.id !== id);
    saveEvents();
    renderAll();
}

calendarGrid.addEventListener("click", (event) => {
    const target = event.target.closest(".calendar-cell");
    if (!target || target.classList.contains("placeholder")) {
        return;
    }
    selectDate(target.dataset.date);
});

prevMonthButton.addEventListener("click", () => shiftMonth(-1));
nextMonthButton.addEventListener("click", () => shiftMonth(1));

eventForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = eventTitleInput.value.trim();
    const date = eventDateInput.value;
    if (!title || !date) {
        return;
    }

    const newEvent = {
        id: `event-${Date.now()}`,
        title,
        date,
        time: eventTimeInput.value,
        duration: eventDurationInput.value,
        recurrence: eventRecurrenceInput.value,
        until: eventUntilInput.value
    };

    addEvent(newEvent);
    eventTitleInput.value = "";
    eventTimeInput.value = "";
    eventDurationInput.value = "";
    eventRecurrenceInput.value = "none";
    eventUntilInput.value = "";
});

renderAll();
