const practiceGrid = document.getElementById("practice-grid");

const WEEKDAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Used only the very first time the site loads on a browser with no saved schedule yet.
const DEFAULT_PRACTICE_TIMES = [
    { id: "default-1", day: "Monday", start: "18:00", end: "20:00" },
    { id: "default-2", day: "Wednesday", start: "18:00", end: "20:00" },
    { id: "default-3", day: "Friday", start: "18:00", end: "20:00" },
    { id: "default-4", day: "Saturday", start: "10:00", end: "12:00" }
];

function loadPracticeTimes() {
    const stored = localStorage.getItem("wushuPracticeTimes");
    if (!stored) {
        localStorage.setItem("wushuPracticeTimes", JSON.stringify(DEFAULT_PRACTICE_TIMES));
        return [...DEFAULT_PRACTICE_TIMES];
    }
    try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [...DEFAULT_PRACTICE_TIMES];
    } catch (error) {
        return [...DEFAULT_PRACTICE_TIMES];
    }
}

function formatTime12h(value) {
    if (!value) {
        return "";
    }
    const [hoursStr, minutesStr] = value.split(":");
    let hours = Number(hoursStr);
    const suffix = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) {
        hours = 12;
    }
    return `${hours}:${minutesStr} ${suffix}`;
}

function renderPracticeGrid() {
    if (!practiceGrid) {
        return;
    }

    const practiceTimes = loadPracticeTimes().slice().sort((a, b) => {
        const dayDiff = WEEKDAY_ORDER.indexOf(a.day) - WEEKDAY_ORDER.indexOf(b.day);
        if (dayDiff !== 0) {
            return dayDiff;
        }
        return a.start.localeCompare(b.start);
    });

    if (practiceTimes.length === 0) {
        practiceGrid.innerHTML = `<p class="schedule-empty">Schedule coming soon — check back later!</p>`;
        return;
    }

    practiceGrid.innerHTML = practiceTimes
        .map(
            (slot) => `
                <article class="practice-item">
                    <h3>${slot.day}</h3>
                    <p>${formatTime12h(slot.start)} - ${formatTime12h(slot.end)}</p>
                </article>
            `
        )
        .join("");
}

renderPracticeGrid();

// If an admin updates the schedule in another tab, keep this page in sync live.
window.addEventListener("storage", (event) => {
    if (event.key === "wushuPracticeTimes") {
        renderPracticeGrid();
    }
});
