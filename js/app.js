// Builds the tour screens from the Markdown files in /tours.
// You shouldn't need to edit this file to change tour content. See README.md.

const TOURS_FOLDER = 'tours/';
const HOME_TITLE = '🏛️ White House Tour Guide';

// A "###" heading starting with one of these emojis becomes a colored box.
// Any other "###" heading becomes a list of talking points.
const BOX_STYLES = [
    { emoji: '🗺️', className: 'wayfinding' },
    { emoji: '💡', className: 'tips' },
    { emoji: '🔴', className: 'important-note' },
];

let home = null;      // { icon, title, heading, intro, tours: [{ label, file }] }
let tours = {};       // file name -> { title, stops: [...] }
let currentTour = null;
let currentIndex = 0;

// ---------- Reading Markdown ----------

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Plain text, plus **bold**.
function formatText(text) {
    return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

// "🔰 ARRIVAL & SECURITY" -> { icon: "🔰", title: "ARRIVAL & SECURITY" }
function splitIcon(heading) {
    const match = heading.match(/^(\S+)\s+(.*)$/);
    if (match && !/[A-Za-z0-9]/.test(match[1])) {
        return { icon: match[1], title: match[2] };
    }
    return { icon: '📍', title: heading };
}

function boxClassFor(heading) {
    const style = BOX_STYLES.find(s => heading.startsWith(s.emoji));
    return style ? style.className : 'talking-points';
}

// Turns a file into a list of lines with comments (<!-- like this -->) removed.
function toLines(markdown) {
    return markdown.replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/);
}

function parseTour(markdown) {
    const tour = { title: '', stops: [] };
    let stop = null;
    let box = null;
    let lastPart = null; // the list item or paragraph we're adding text to

    function startBox(heading) {
        box = { className: boxClassFor(heading), heading, parts: [] };
        stop.boxes.push(box);
        lastPart = null;
    }

    for (const raw of toLines(markdown)) {
        const line = raw.trim();
        if (line === '') { lastPart = null; continue; }

        if (/^#\s/.test(line) && !tour.title) {
            tour.title = line.replace(/^#\s+/, '');
        } else if (/^##\s/.test(line)) {
            stop = { ...splitIcon(line.replace(/^##\s+/, '')), boxes: [] };
            tour.stops.push(stop);
            box = null;
            lastPart = null;
        } else if (!stop) {
            continue; // text above the first stop is ignored
        } else if (/^###\s/.test(line)) {
            startBox(line.replace(/^###\s+/, ''));
        } else if (/^[-*]\s/.test(line)) {
            if (!box) startBox('What to Say:');
            lastPart = { type: 'item', text: line.replace(/^[-*]\s+/, '') };
            box.parts.push(lastPart);
        } else {
            if (!box) startBox('What to Say:');
            if (lastPart) {
                lastPart.text += ' ' + line; // wrapped line continues the last item
            } else {
                lastPart = { type: 'paragraph', text: line };
                box.parts.push(lastPart);
            }
        }
    }
    return tour;
}

function parseHome(markdown) {
    const result = { icon: '🏛️', title: '', heading: '', intro: '', tours: [] };
    for (const raw of toLines(markdown)) {
        const line = raw.trim();
        const link = line.match(/^[-*]\s+\[(.+?)\]\((.+?)\)/);
        if (link) {
            result.tours.push({ label: link[1], file: link[2] });
        } else if (/^#\s/.test(line)) {
            Object.assign(result, splitIcon(line.replace(/^#\s+/, '')));
        } else if (/^##\s/.test(line)) {
            result.heading = line.replace(/^##\s+/, '');
        } else if (line) {
            result.intro += (result.intro ? ' ' : '') + line;
        }
    }
    return result;
}

// ---------- Drawing screens ----------

function renderBox(box) {
    const isTalkingPoints = box.className === 'talking-points';
    const headingTag = isTalkingPoints ? 'h3' : 'h4';
    let html = `<div class="${box.className}"><${headingTag}>${formatText(box.heading)}</${headingTag}>`;
    let listOpen = false;
    for (const part of box.parts) {
        if (part.type === 'item' && !listOpen) { html += '<ul>'; listOpen = true; }
        if (part.type !== 'item' && listOpen) { html += '</ul>'; listOpen = false; }
        html += part.type === 'item'
            ? `<li>${formatText(part.text)}</li>`
            : `<p>${formatText(part.text)}</p>`;
    }
    if (listOpen) html += '</ul>';
    return html + '</div>';
}

function renderScreen(icon, title, count, body) {
    return '<div class="section-counter">' + count + '</div>' +
        '<div class="section-icon">' + icon + '</div>' +
        '<h2 class="section-title">' + formatText(title) + '</h2>' +
        body;
}

function updateDisplay() {
    const content = document.getElementById('content');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (!currentTour) {
        document.getElementById('title').textContent = HOME_TITLE;
        const buttons = home.tours.map(t =>
            `<button class="tour-button" data-tour="${escapeHtml(t.file)}">${formatText(t.label)}</button>`
        ).join('');
        content.innerHTML = renderScreen(home.icon, home.title, '1 of 1',
            `<div class="home"><h2>${formatText(home.heading)}</h2><p>${formatText(home.intro)}</p>` +
            `<div class="tour-list">${buttons}</div></div>`);
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        return;
    }

    const tour = tours[currentTour];
    const stop = tour.stops[currentIndex];
    document.getElementById('title').textContent = tour.title;
    content.innerHTML =
        '<div class="home-link"><button class="home-button" data-home>← Back to Home</button></div>' +
        renderScreen(stop.icon, stop.title, (currentIndex + 1) + ' of ' + tour.stops.length,
            stop.boxes.map(renderBox).join(''));

    prevBtn.style.display = 'block';
    nextBtn.style.display = 'block';
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === tour.stops.length - 1;
}

// ---------- Navigation ----------

function loadTour(file) {
    currentTour = file;
    currentIndex = 0;
    updateDisplay();
}

function goHome() {
    currentTour = null;
    currentIndex = 0;
    updateDisplay();
}

function nextSection() {
    if (currentIndex < tours[currentTour].stops.length - 1) {
        currentIndex++;
        updateDisplay();
    }
}

function previousSection() {
    if (currentIndex > 0) {
        currentIndex--;
        updateDisplay();
    }
}

document.getElementById('prevBtn').addEventListener('click', previousSection);
document.getElementById('nextBtn').addEventListener('click', nextSection);
document.getElementById('content').addEventListener('click', event => {
    const tourButton = event.target.closest('[data-tour]');
    if (tourButton) loadTour(tourButton.dataset.tour);
    if (event.target.closest('[data-home]')) goHome();
});

// ---------- Start up ----------

async function fetchText(file) {
    // no-cache: always check for the latest edits instead of using an old copy
    const response = await fetch(TOURS_FOLDER + file, { cache: 'no-cache' });
    if (!response.ok) throw new Error(file + ' (' + response.status + ')');
    return response.text();
}

async function start() {
    document.getElementById('prevBtn').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'none';
    try {
        home = parseHome(await fetchText('home.md'));
        // Load every tour up front so the app keeps working if signal drops mid-tour.
        const texts = await Promise.all(home.tours.map(t => fetchText(t.file)));
        home.tours.forEach((t, i) => { tours[t.file] = parseTour(texts[i]); });
        updateDisplay();
    } catch (error) {
        document.getElementById('content').innerHTML =
            '<p class="load-error">Couldn\'t load the tour files.<br>' + escapeHtml(error.message) +
            '<br><br>Check your connection and refresh the page.</p>';
    }
}

start();
