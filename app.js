const audio = document.getElementById("audio");

let tracks = [];
let currentIndex = -1;

const $ = (id) => document.getElementById(id);

/* =========================
HELPERS
========================= */

function fmt(sec) {
if (!Number.isFinite(sec)) return "0:00";

const m = Math.floor(sec / 60);

const s = Math.floor(sec % 60)
.toString()
.padStart(2, "0");

return `${m}:${s}`;
}

function escapeHtml(value) {
return String(value).replace(/[&<>"']/g, (char) => {

```
const map = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};

return map[char];
```

});
}

/* =========================
LOAD PLAYLIST
========================= */

async function loadTracks() {

try {

```
const response = await fetch("tracks.json", {
  cache: "no-store"
});

if (!response.ok) {
  throw new Error(
    `tracks.json: ${response.status}`
  );
}

const data = await response.json();

tracks = Array.isArray(data)
  ? data
  : [];

render();
```

} catch (error) {

```
console.error(
  "GHOSTI RADIO:",
  error
);

tracks = [];

$("trackCount").textContent =
  "offline";

$("playlist").innerHTML = `
  <div class="empty">
    <div class="empty-ghost">👻</div>
    <p>کتابخانه موزیک در دسترس نیست.</p>
  </div>
`;
```

}

}

/* =========================
PLAYLIST
========================= */

function render() {

$("trackCount").textContent =
`${tracks.length} track${tracks.length === 1 ? "" : "s"}`;

const playlist =
$("playlist");

if (!tracks.length) {

```
playlist.innerHTML = `
  <div class="empty">
    <div class="empty-ghost">👻</div>
    <p>هنوز موزیکی اضافه نشده.</p>
  </div>
`;

$("player")
  .classList
  .add("hidden");

return;
```

}

playlist.innerHTML =
tracks.map((track, index) => {

```
  const active =
    index === currentIndex;


  return `
    <div class="track ${active ? "is-playing" : ""}">

      <div class="track-index">
        ${String(index + 1).padStart(2, "0")}
      </div>

      <div class="track-info">

        <div class="track-title">
          ${escapeHtml(
            track.name || "Untitled"
          )}
        </div>

        <div class="track-artist">
          ${escapeHtml(
            track.artist || "GHOSTI"
          )}
        </div>

      </div>

      <div class="track-actions">

        <button
          class="icon-btn"
          type="button"
          data-play="${index}"
          aria-label="Play"
        >
          ${
            active && !audio.paused
              ? "Ⅱ"
              : "▶"
          }
        </button>

      </div>

    </div>
  `;

}).join("");
```

playlist
.querySelectorAll("[data-play]")
.forEach((button) => {

```
  button.addEventListener(
    "click",
    () => {

      playAt(
        Number(
          button.dataset.play
        )
      );

    }
  );

});
```

}

/* =========================
PLAY TRACK
========================= */

async function playAt(index) {

if (!tracks[index]) return;

const track =
tracks[index];

currentIndex =
index;

const source =
new URL(
track.file,
window.location.href
).href;

console.log(
"GHOSTI RADIO:",
source
);

audio.src =
source;

$("nowTitle").textContent =
track.name || "Untitled";

$("nowArtist").textContent =
track.artist || "GHOSTI";

if ($("nowTitleLarge")) {

```
$("nowTitleLarge").textContent =
  track.name || "Untitled";
```

}

if ($("nowArtistLarge")) {

```
$("nowArtistLarge").textContent =
  track.artist || "GHOSTI";
```

}

$("player")
.classList
.remove("hidden");

try {

```
await audio.play();
```

} catch (error) {

```
console.error(
  "Playback:",
  error
);
```

}

render();

}

/* =========================
PLAY / PAUSE
========================= */

$("playBtn")
.addEventListener(
"click",
async () => {

```
  if (!tracks.length) return;


  if (currentIndex < 0) {

    await playAt(0);

    return;

  }


  if (audio.paused) {

    try {

      await audio.play();

    } catch (error) {

      console.error(
        "Playback:",
        error
      );

    }

  } else {

    audio.pause();

  }

}
```

);

/* =========================
PREVIOUS
========================= */

$("prevBtn")
.addEventListener(
"click",
() => {

```
  if (!tracks.length) return;


  const index =
    currentIndex <= 0
      ? tracks.length - 1
      : currentIndex - 1;


  playAt(index);

}
```

);

/* =========================
NEXT
========================= */

$("nextBtn")
.addEventListener(
"click",
() => {

```
  if (!tracks.length) return;


  const index =
    currentIndex >= tracks.length - 1
      ? 0
      : currentIndex + 1;


  playAt(index);

}
```

);

/* =========================
AUDIO EVENTS
========================= */

audio.addEventListener(
"play",
() => {

```
$("playBtn").textContent =
  "Ⅱ";


document.body
  .classList
  .add("is-playing");


render();
```

}
);

audio.addEventListener(
"pause",
() => {

```
$("playBtn").textContent =
  "▶";


document.body
  .classList
  .remove("is-playing");


render();
```

}
);

audio.addEventListener(
"loadedmetadata",
() => {

```
$("duration").textContent =
  fmt(audio.duration);
```

}
);

audio.addEventListener(
"timeupdate",
() => {

```
if (!audio.duration) return;


const percent =
  (audio.currentTime /
    audio.duration) *
  100;


$("progress").value =
  percent;


$("currentTime").textContent =
  fmt(audio.currentTime);
```

}
);

audio.addEventListener(
"ended",
() => {

```
if (!tracks.length) return;


const next =
  currentIndex >= tracks.length - 1
    ? 0
    : currentIndex + 1;


playAt(next);
```

}
);

audio.addEventListener(
"error",
() => {

```
console.error(
  "GHOSTI RADIO audio error:",
  audio.src
);
```

}
);

/* =========================
PROGRESS
========================= */

$("progress")
.addEventListener(
"input",
(event) => {

```
  if (!audio.duration) return;


  audio.currentTime =
    (Number(
      event.target.value
    ) / 100) *
    audio.duration;

}
```

);

/* =========================
MANAGEMENT
========================= */

const manageBtn =
$("manageBtn");

if (manageBtn) {

manageBtn.addEventListener(
"click",
() => {

```
  const panel =
    $("managePanel");


  if (!panel) return;


  const show =
    panel.classList.contains(
      "hidden"
    );


  panel.classList.toggle(
    "hidden",
    !show
  );


  panel.setAttribute(
    "aria-hidden",
    String(!show)
  );


  document.body
    .classList
    .toggle(
      "manage-mode",
      show
    );

}
```

);

}

/* =========================
START
========================= */

loadTracks();
