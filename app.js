```javascript
const audio = document.getElementById("audio");

const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const trackNumber = document.getElementById("trackNumber");
const trackTitle = document.getElementById("trackTitle");
const trackArtist = document.getElementById("trackArtist");

const progressBar = document.getElementById("progressBar");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");
const trackCount = document.getElementById("trackCount");


let tracks = [];
let currentIndex = 0;


/* =========================
   FORMAT TIME
   ========================= */

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);

  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${secs}`;
}


/* =========================
   LOAD TRACKS
   ========================= */

async function loadTracks() {

  try {

    const response = await fetch("tracks.json", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        `tracks.json error: ${response.status}`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("tracks.json must contain an array");
    }

    tracks = data;

    trackCount.textContent =
      `${tracks.length} track${tracks.length === 1 ? "" : "s"}`;

    if (tracks.length > 0) {
      loadTrack(0);
    }

  } catch (error) {

    console.error("GHOSTI RADIO:", error);

    trackCount.textContent = "offline";

    trackTitle.textContent =
      "Library unavailable";

    trackArtist.textContent =
      "GHOSTI";

  }

}


/* =========================
   LOAD TRACK
   ========================= */

function loadTrack(index) {

  if (!tracks[index]) {
    return;
  }

  currentIndex = index;

  const track = tracks[index];

  audio.src = track.file;

  trackNumber.textContent =
    String(index + 1).padStart(2, "0");

  trackTitle.textContent =
    track.name || "Untitled";

  trackArtist.textContent =
    track.artist || "GHOSTI";

  currentTime.textContent = "0:00";

  duration.textContent = "0:00";

  progressBar.style.width = "0%";
}


/* =========================
   PLAY
   ========================= */

async function playTrack() {

  if (!tracks.length) {
    return;
  }

  try {

    await audio.play();

    playBtn.textContent = "Ⅱ";

  } catch (error) {

    console.error(
      "GHOSTI RADIO playback:",
      error
    );

  }

}


/* =========================
   PAUSE
   ========================= */

function pauseTrack() {

  audio.pause();

  playBtn.textContent = "▶";

}


/* =========================
   PLAY / PAUSE BUTTON
   ========================= */

playBtn.addEventListener(
  "click",
  () => {

    if (!tracks.length) {
      return;
    }

    if (audio.paused) {
      playTrack();
    } else {
      pauseTrack();
    }

  }
);


/* =========================
   PREVIOUS
   ========================= */

prevBtn.addEventListener(
  "click",
  () => {

    if (!tracks.length) {
      return;
    }

    let previous =
      currentIndex - 1;

    if (previous < 0) {
      previous = tracks.length - 1;
    }

    loadTrack(previous);

    playTrack();

  }
);


/* =========================
   NEXT
   ========================= */

nextBtn.addEventListener(
  "click",
  () => {

    if (!tracks.length) {
      return;
    }

    let next =
      currentIndex + 1;

    if (next >= tracks.length) {
      next = 0;
    }

    loadTrack(next);

    playTrack();

  }
);


/* =========================
   AUDIO PLAY
   ========================= */

audio.addEventListener(
  "play",
  () => {

    playBtn.textContent = "Ⅱ";

  }
);


/* =========================
   AUDIO PAUSE
   ========================= */

audio.addEventListener(
  "pause",
  () => {

    playBtn.textContent = "▶";

  }
);


/* =========================
   METADATA
   ========================= */

audio.addEventListener(
  "loadedmetadata",
  () => {

    duration.textContent =
      formatTime(audio.duration);

  }
);


/* =========================
   PROGRESS
   ========================= */

audio.addEventListener(
  "timeupdate",
  () => {

    if (!audio.duration) {
      return;
    }

    const percent =
      (audio.currentTime / audio.duration) * 100;

    progressBar.style.width =
      `${percent}%`;

    currentTime.textContent =
      formatTime(audio.currentTime);

  }
);


/* =========================
   SEEK
   ========================= */

document
  .querySelector(".progress")
  .addEventListener(
    "click",
    (event) => {

      if (!audio.duration) {
        return;
      }

      const rect =
        event.currentTarget.getBoundingClientRect();

      const position =
        (event.clientX - rect.left) /
        rect.width;

      audio.currentTime =
        position * audio.duration;

    }
  );


/* =========================
   NEXT WHEN ENDED
   ========================= */

audio.addEventListener(
  "ended",
  () => {

    if (!tracks.length) {
      return;
    }

    let next =
      currentIndex + 1;

    if (next >= tracks.length) {
      next = 0;
    }

    loadTrack(next);

    playTrack();

  }
);


/* =========================
   START
   ========================= */

loadTracks();
```
