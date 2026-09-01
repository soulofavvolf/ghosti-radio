let tracks = [];
let currentIndex = -1;
const $ = (id) => document.getElementById(id);
const audio = $("audio");

function fmt(sec) {
  if (!Number.isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

async function loadTracks() {
  const response = await fetch("tracks.json", {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("tracks.json could not be loaded");
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("tracks.json must contain an array");
  }

  tracks = data.filter(
    (track) =>
      track &&
      typeof track.name === "string" &&
      typeof track.file === "string"
  );

  render();
}

function render() {
  $("trackCount").textContent =
    `${tracks.length} track${tracks.length === 1 ? "" : "s"}`;

  const el = $("playlist");

  if (!tracks.length) {
    el.innerHTML = `
      <div class="empty">
        <div class="empty-ghost">👻</div>
        <p>هنوز موزیکی اضافه نشده.</p>
      </div>
    `;

    $("player").classList.add("hidden");
    return;
  }

  el.innerHTML = tracks.map((t, i) => `
    <div class="track">
      <div class="track-index">${String(i + 1).padStart(2, "0")}</div>

      <div class="track-info">
        <div class="track-title">${escapeHtml(t.name)}</div>
        <div class="track-artist">
          ${escapeHtml(t.artist || "GHOSTI")}
        </div>
      </div>

      <div class="track-actions">
        <button
          class="icon-btn"
          data-play="${i}"
          aria-label="Play"
          type="button"
        >
          ${i === currentIndex && !audio.paused ? "Ⅱ" : "▶"}
        </button>
      </div>
    </div>
  `).join("");

  el.querySelectorAll("[data-play]").forEach((button) => {
    button.onclick = () => playAt(Number(button.dataset.play));
  });
}

async function playAt(index) {
  if (!tracks[index]) return;

  currentIndex = index;

  audio.src = tracks[index].file;

  $("nowTitle").textContent = tracks[index].name;
  $("nowArtist").textContent = tracks[index].artist || "GHOSTI";

  $("player").classList.remove("hidden");

  try {
    await audio.play();
  } catch (error) {
    console.log("Playback waiting for user interaction.");
  }

  render();
}

$("manageBtn").onclick = () => {
  const panel = $("managePanel");
  const show = panel.classList.contains("hidden");

  panel.classList.toggle("hidden", !show);
  panel.setAttribute("aria-hidden", String(!show));
  document.body.classList.toggle("manage-mode", show);
};

$("playBtn").onclick = async () => {
  if (currentIndex < 0) {
    await playAt(0);
    return;
  }

  if (audio.paused) {
    await audio.play();
  } else {
    audio.pause();
  }
};

$("prevBtn").onclick = () => {
  if (!tracks.length) return;

  playAt(
    currentIndex <= 0
      ? tracks.length - 1
      : currentIndex - 1
  );
};

$("nextBtn").onclick = () => {
  if (!tracks.length) return;

  playAt(
    currentIndex >= tracks.length - 1
      ? 0
      : currentIndex + 1
  );
};

audio.addEventListener("play", () => {
  $("playBtn").textContent = "Ⅱ";
  render();
});

audio.addEventListener("pause", () => {
  $("playBtn").textContent = "▶";
  render();
});

audio.addEventListener("ended", () => {
  if (!tracks.length) return;

  const nextIndex =
    currentIndex >= tracks.length - 1
      ? 0
      : currentIndex + 1;

  playAt(nextIndex);
});

audio.addEventListener("loadedmetadata", () => {
  $("duration").textContent = fmt(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  const percentage = audio.duration
    ? (audio.currentTime / audio.duration) * 100
    : 0;

  $("progress").value = percentage;
  $("currentTime").textContent = fmt(audio.currentTime);
});

$("progress").oninput = (event) => {
  if (audio.duration) {
    audio.currentTime =
      (Number(event.target.value) / 100) * audio.duration;
  }
};

(async () => {
  try {
    await loadTracks();
  } catch (error) {
    console.error(error);

    $("trackCount").textContent = "0 tracks";

    $("playlist").innerHTML = `
      <div class="empty">
        <div class="empty-ghost">👻</div>
        <p>خطا در بارگذاری لیست موزیک.</p>
      </div>
    `;
  }
})();
