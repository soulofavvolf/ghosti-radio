const audio = document.getElementById("audio");

let tracks = [];
let currentIndex = -1;

const $ = (id) => document.getElementById(id);

/* =========================
HELPERS
========================= */

function fmt(sec) {
if (!Number.isFinite(sec)) {
return "0:00";
}

const minutes = Math.floor(sec / 60);

const seconds = Math.floor(sec % 60)
.toString()
.padStart(2, "0");

return `${minutes}:${seconds}`;
}

function escapeHtml(value) {
return String(value).replace(/[&<>"']/g, function (char) {

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
LOAD TRACKS
========================= */

async function loadTracks() {

try {

```
const response = await fetch(
  "tracks.json",
  {
    cache: "no-store"
  }
);

if (!response.ok) {
  throw new Error(
    "tracks.json: " + response.status
  );
}

const data = await response.json();

if (Array.isArray(data)) {
  tracks = data;
} else {
  tracks = [];
}

render();
```

} catch (error) {

```
console.error(
  "GHOSTI RADIO:",
  error
);

tracks = [];

const count =
  $("trackCount");

const playlist =
  $("playlist");

if (count) {
  count.textContent = "offline";
}

if (playlist) {

  playlist.innerHTML = `
    <div class="empty">
      <div class="empty-ghost">👻</div>
      <p>کتابخانه موزیک در دسترس نیست.</p>
    </div>
  `;

}
```

}

}

/* =========================
RENDER PLAYLIST
========================= */

function render() {

const count =
$("trackCount");

const playlist =
$("playlist");

if (!count || !playlist) {
return;
}

count.textContent =
tracks.length +
" track" +
(tracks.length === 1 ? "" : "s");

if (tracks.length === 0) {

```
playlist.innerHTML = `
  <div class="empty">
    <div class="empty-ghost">👻</div>
    <p>هنوز موزیکی اضافه نشده.</p>
  </div>
`;

const player =
  $("player");

if (player) {
  player.classList.add("hidden");
}

return;
```

}

playlist.innerHTML =
tracks.map(function (track, index) {

```
  const active =
    index === currentIndex;


  const title =
    escapeHtml(
      track.name || "Untitled"
    );


  const artist =
    escapeHtml(
      track.artist || "GHOSTI"
    );


  const icon =
    active && !audio.paused
      ? "Ⅱ"
      : "▶";


  return `
    <div class="track ${active ? "is-playing" : ""}">

      <div class="track-index">
        ${String(index + 1).padStart(2, "0")}
      </div>

      <div class="track-info">

        <div class="track-title">
          ${title}
        </div>

        <div class="track-artist">
          ${artist}
        </div>

      </div>

      <div class="track-actions">

        <button
          class="icon-btn"
          type="button"
          data-play="${index}"
          aria-label="Play"
        >
          ${icon}
        </button>

      </div>

    </div>
  `;

}).join("");
```

playlist
.querySelectorAll("[data-play]")
.forEach(function (button) {

```
  button.addEventListener(
    "click",
    function () {

      const index =
        Number(
          button.dataset.play
        );

      playAt(index);

    }
  );

});
```

}

/* =========================
PLAY TRACK
========================= */

async function playAt(index) {

if (!tracks[index]) {
return;
}

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

const nowTitle =
$("nowTitle");

const nowArtist =
$("nowArtist");

if (nowTitle) {
nowTitle.textContent =
track.name || "Untitled";
}

if (nowArtist) {
nowArtist.textContent =
track.artist || "GHOSTI";
}

const nowTitleLarge =
$("nowTitleLarge");

const nowArtistLarge =
$("nowArtistLarge");

if (nowTitleLarge) {
nowTitleLarge.textContent =
track.name || "Untitled";
}

if (nowArtistLarge) {
nowArtistLarge.textContent =
track.artist || "GHOSTI";
}

const player =
$("player");

if (player) {
player.classList.remove("hidden");
}

try {

```
await audio.play();
```

} catch (error) {

```
console.error(
  "GHOSTI RADIO playback:",
  error
);
```

}

render();

}

/* =========================
PLAY / PAUSE
========================= */

const playButton =
$("playBtn");

if (playButton) {

playButton.addEventListener(
"click",
async function () {

```
  if (!tracks.length) {
    return;
  }


  if (currentIndex < 0) {

    await playAt(0);

    return;
  }


  if (audio.paused) {

    try {

      await audio.play();

    } catch (error) {

      console.error(
        "GHOSTI RADIO playback:",
        error
      );

    }

  } else {

    audio.pause();

  }

}
```

);

}

/* =========================
PREVIOUS
========================= */

const previousButton =
$("prevBtn");

if (previousButton) {

previousButton.addEventListener(
"click",
function () {

```
  if (!tracks.length) {
    return;
  }


  const index =
    currentIndex <= 0
      ? tracks.length - 1
      : currentIndex - 1;


  playAt(index);

}
```

);

}

/* =========================
NEXT
========================= */

const nextButton =
$("nextBtn");

if (nextButton) {

nextButton.addEventListener(
"click",
function () {

```
  if (!tracks.length) {
    return;
  }


  const index =
    currentIndex >= tracks.length - 1
      ? 0
      : currentIndex + 1;


  playAt(index);

}
```

);

}

/* =========================
AUDIO EVENTS
========================= */

audio.addEventListener(
"play",
function () {

```
const button =
  $("playBtn");

if (button) {
  button.textContent = "Ⅱ";
}


document.body.classList.add(
  "is-playing"
);


render();
```

}
);

audio.addEventListener(
"pause",
function () {

```
const button =
  $("playBtn");

if (button) {
  button.textContent = "▶";
}


document.body.classList.remove(
  "is-playing"
);


render();
```

}
);

audio.addEventListener(
"loadedmetadata",
function () {

```
const duration =
  $("duration");

if (duration) {

  duration.textContent =
    fmt(audio.duration);

}
```

}
);

audio.addEventListener(
"timeupdate",
function () {

```
if (!audio.duration) {
  return;
}


const progress =
  $("progress");


if (progress) {

  progress.value =
    (
      audio.currentTime /
      audio.duration
    ) * 100;

}


const currentTime =
  $("currentTime");


if (currentTime) {

  currentTime.textContent =
    fmt(audio.currentTime);

}
```

}
);

audio.addEventListener(
"ended",
function () {

```
if (!tracks.length) {
  return;
}


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
function () {

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

const progress =
$("progress");

if (progress) {

progress.addEventListener(
"input",
function (event) {

```
  if (!audio.duration) {
    return;
  }


  audio.currentTime =
    (
      Number(event.target.value) /
      100
    ) * audio.duration;

}
```

);

}

/* =========================
MANAGEMENT
========================= */

const manageButton =
$("manageBtn");

if (manageButton) {

manageButton.addEventListener(
"click",
function () {

```
  const panel =
    $("managePanel");


  if (!panel) {
    return;
  }


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


  document.body.classList.toggle(
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
