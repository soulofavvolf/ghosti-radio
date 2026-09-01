const audio = document.getElementById("audio");

let tracks = [];
let currentIndex = -1;

function $(id) {
return document.getElementById(id);
}

/* =========================
HELPERS
========================= */

function fmt(sec) {
if (!Number.isFinite(sec)) {
return "0:00";
}

var minutes = Math.floor(sec / 60);

var seconds = Math.floor(sec % 60)
.toString()
.padStart(2, "0");

return minutes + ":" + seconds;
}

function escapeHtml(value) {
var map = {
"&": "&",
"<": "<",
">": ">",
'"': """,
"'": "'"
};

return String(value).replace(
/[&<>"']/g,
function (char) {
return map[char];
}
);
}

/* =========================
LOAD TRACKS
========================= */

function loadTracks() {

fetch("tracks.json", {
cache: "no-store"
})
.then(function (response) {

```
  if (!response.ok) {
    throw new Error(
      "tracks.json: " + response.status
    );
  }

  return response.json();

})
.then(function (data) {

  tracks = Array.isArray(data)
    ? data
    : [];

  render();

})
.catch(function (error) {

  console.error(
    "GHOSTI RADIO:",
    error
  );

  tracks = [];

  if ($("trackCount")) {
    $("trackCount").textContent =
      "offline";
  }

  if ($("playlist")) {

    $("playlist").innerHTML =
      '<div class="empty">' +
        '<div class="empty-ghost">👻</div>' +
        '<p>کتابخانه موزیک در دسترس نیست.</p>' +
      '</div>';

  }

});
```

}

/* =========================
RENDER
========================= */

function render() {

var count = $("trackCount");
var playlist = $("playlist");

if (!count || !playlist) {
return;
}

count.textContent =
tracks.length +
" track" +
(tracks.length === 1 ? "" : "s");

if (tracks.length === 0) {

```
playlist.innerHTML =
  '<div class="empty">' +
    '<div class="empty-ghost">👻</div>' +
    '<p>هنوز موزیکی اضافه نشده.</p>' +
  '</div>';

if ($("player")) {
  $("player").classList.add("hidden");
}

return;
```

}

var html = "";

tracks.forEach(function (track, index) {

```
var active =
  index === currentIndex;

var title =
  escapeHtml(
    track.name || "Untitled"
  );

var artist =
  escapeHtml(
    track.artist || "GHOSTI"
  );

var icon =
  active && !audio.paused
    ? "Ⅱ"
    : "▶";


html +=
  '<div class="track ' +
  (active ? "is-playing" : "") +
  '">' +

    '<div class="track-index">' +
      String(index + 1).padStart(2, "0") +
    '</div>' +

    '<div class="track-info">' +

      '<div class="track-title">' +
        title +
      '</div>' +

      '<div class="track-artist">' +
        artist +
      '</div>' +

    '</div>' +

    '<div class="track-actions">' +

      '<button ' +
        'class="icon-btn" ' +
        'type="button" ' +
        'data-play="' + index + '" ' +
        'aria-label="Play">' +
        icon +
      '</button>' +

    '</div>' +

  '</div>';
```

});

playlist.innerHTML = html;

var buttons =
playlist.querySelectorAll(
"[data-play]"
);

buttons.forEach(function (button) {

```
button.addEventListener(
  "click",
  function () {

    playAt(
      Number(
        button.dataset.play
      )
    );

  }
);
```

});

}

/* =========================
PLAY TRACK
========================= */

function playAt(index) {

if (!tracks[index]) {
return;
}

var track =
tracks[index];

currentIndex =
index;

var source =
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

if ($("nowTitle")) {

```
$("nowTitle").textContent =
  track.name || "Untitled";
```

}

if ($("nowArtist")) {

```
$("nowArtist").textContent =
  track.artist || "GHOSTI";
```

}

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

if ($("player")) {

```
$("player").classList.remove(
  "hidden"
);
```

}

audio.play()
.catch(function (error) {

```
  console.error(
    "GHOSTI RADIO playback:",
    error
  );

});
```

render();

}

/* =========================
PLAY / PAUSE
========================= */

if ($("playBtn")) {

$("playBtn").addEventListener(
"click",
function () {

```
  if (!tracks.length) {
    return;
  }


  if (currentIndex < 0) {

    playAt(0);

    return;
  }


  if (audio.paused) {

    audio.play()
      .catch(function (error) {

        console.error(
          "GHOSTI RADIO playback:",
          error
        );

      });

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

if ($("prevBtn")) {

$("prevBtn").addEventListener(
"click",
function () {

```
  if (!tracks.length) {
    return;
  }


  var index;

  if (currentIndex <= 0) {
    index = tracks.length - 1;
  } else {
    index = currentIndex - 1;
  }


  playAt(index);

}
```

);

}

/* =========================
NEXT
========================= */

if ($("nextBtn")) {

$("nextBtn").addEventListener(
"click",
function () {

```
  if (!tracks.length) {
    return;
  }


  var index;

  if (
    currentIndex >=
    tracks.length - 1
  ) {

    index = 0;

  } else {

    index =
      currentIndex + 1;

  }


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
if ($("playBtn")) {

  $("playBtn").textContent =
    "Ⅱ";

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
if ($("playBtn")) {

  $("playBtn").textContent =
    "▶";

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
if ($("duration")) {

  $("duration").textContent =
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


if ($("progress")) {

  $("progress").value =
    (
      audio.currentTime /
      audio.duration
    ) * 100;

}


if ($("currentTime")) {

  $("currentTime").textContent =
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


var next;

if (
  currentIndex >=
  tracks.length - 1
) {

  next = 0;

} else {

  next =
    currentIndex + 1;

}


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

if ($("progress")) {

$("progress").addEventListener(
"input",
function (event) {

```
  if (!audio.duration) {
    return;
  }


  audio.currentTime =
    (
      Number(
        event.target.value
      ) / 100
    ) * audio.duration;

}
```

);

}

/* =========================
MANAGEMENT
========================= */

if ($("manageBtn")) {

$("manageBtn").addEventListener(
"click",
function () {

```
  var panel =
    $("managePanel");


  if (!panel) {
    return;
  }


  var show =
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
