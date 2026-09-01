const audio = document.getElementById("audio");

let tracks = [];
let currentIndex = -1;

/* =========================
HELPERS
========================= */

const $ = (id) => document.getElementById(id);

function fmt(sec){

if(!Number.isFinite(sec)){
return "0:00";
}

const minutes = Math.floor(sec / 60);

const seconds = Math.floor(sec % 60)
.toString()
.padStart(2, "0");

return `${minutes}:${seconds}`;

}

function escapeHtml(value){

return String(value).replace(
/[&<>"']/g,
(char) => ({
"&": "&",
"<": "<",
">": ">",
'"': """,
"'": "'"
}[char])
);

}

/* =========================
LOAD PUBLIC PLAYLIST
========================= */

async function loadTracks(){

try{

```
const response = await fetch(
  "tracks.json",
  {
    cache: "no-store"
  }
);


if(!response.ok){

  throw new Error(
    `tracks.json: ${response.status}`
  );

}


const data = await response.json();


if(!Array.isArray(data)){

  throw new Error(
    "tracks.json must contain an array"
  );

}


tracks = data;


render();
```

}catch(error){

```
console.error(
  "GHOSTI RADIO:",
  error
);


tracks = [];


if($("trackCount")){
  $("trackCount").textContent = "offline";
}


if($("playlist")){

  $("playlist").innerHTML = `
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
PLAYLIST
========================= */

function render(){

if(!$("playlist")) return;

$("trackCount").textContent =
`${tracks.length} track${tracks.length === 1 ? "" : "s"}`;

const playlist = $("playlist");

if(!tracks.length){

```
playlist.innerHTML = `
  <div class="empty">
    <div class="empty-ghost">👻</div>
    <p>هنوز موزیکی اضافه نشده.</p>
  </div>
`;


if($("player")){
  $("player").classList.add("hidden");
}


return;
```

}

playlist.innerHTML = tracks.map(
(track, index) => {

```
  const isActive =
    index === currentIndex;


  return `
    <div
      class="track ${isActive ? "is-playing" : ""}"
      data-track="${index}"
    >

      <div class="track-index">
        ${String(index + 1).padStart(2, "0")}
      </div>


      <div class="track-info">

        <div class="track-title">
          ${escapeHtml(track.name || "Untitled")}
        </div>

        <div class="track-artist">
          ${escapeHtml(track.artist || "GHOSTI")}
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
            isActive && !audio.paused
              ? "Ⅱ"
              : "▶"
          }
        </button>

      </div>

    </div>
  `;

}
```

).join("");

playlist
.querySelectorAll("[data-play]")
.forEach((button) => {

```
  button.addEventListener(
    "click",
    () => {

      playAt(
        Number(button.dataset.play)
      );

    }
  );

});
```

}

/* =========================
PLAY TRACK
========================= */

async function playAt(index){

if(!tracks[index]){
return;
}

const track = tracks[index];

currentIndex = index;

const source = new URL(
track.file,
window.location.href
).href;

console.log(
"GHOSTI RADIO playing:",
source
);

audio.src = source;

if($("nowTitle")){
$("nowTitle").textContent =
track.name || "Untitled";
}

if($("nowArtist")){
$("nowArtist").textContent =
track.artist || "GHOSTI";
}

if($("nowTitleLarge")){
$("nowTitleLarge").textContent =
track.name || "Untitled";
}

if($("nowArtistLarge")){
$("nowArtistLarge").textContent =
track.artist || "GHOSTI";
}

if($("player")){
$("player").classList.remove("hidden");
}

try{

```
await audio.play();
```

}catch(error){

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

$("playBtn").addEventListener(
"click",
async () => {

```
if(!tracks.length){
  return;
}


if(currentIndex < 0){

  await playAt(0);

  return;

}


if(audio.paused){

  try{

    await audio.play();

  }catch(error){

    console.error(
      "GHOSTI RADIO:",
      error
    );

  }

}else{

  audio.pause();

}
```

}
);

/* =========================
PREVIOUS
========================= */

$("prevBtn").addEventListener(
"click",
() => {

```
if(!tracks.length){
  return;
}


if(currentIndex <= 0){

  playAt(
    tracks.length - 1
  );

}else{

  playAt(
    currentIndex - 1
  );

}
```

}
);

/* =========================
NEXT
========================= */

$("nextBtn").addEventListener(
"click",
() => {

```
if(!tracks.length){
  return;
}


if(
  currentIndex >=
  tracks.length - 1
){

  playAt(0);

}else{

  playAt(
    currentIndex + 1
  );

}
```

}
);

/* =========================
AUDIO EVENTS
========================= */

audio.addEventListener(
"play",
() => {

```
$("playBtn").textContent = "Ⅱ";

document.body.classList.add(
  "is-playing"
);

render();
```

}
);

audio.addEventListener(
"pause",
() => {

```
$("playBtn").textContent = "▶";

document.body.classList.remove(
  "is-playing"
);

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
if(!audio.duration){
  return;
}


const percent =
  (audio.currentTime /
   audio.duration) * 100;


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
if(!tracks.length){
  return;
}


if(
  currentIndex <
  tracks.length - 1
){

  playAt(
    currentIndex + 1
  );

}else{

  playAt(0);

}
```

}
);

audio.addEventListener(
"error",
() => {

```
console.error(
  "GHOSTI RADIO: audio error",
  audio.src
);
```

}
);

/* =========================
PROGRESS
========================= */

$("progress").addEventListener(
"input",
(event) => {

```
if(!audio.duration){
  return;
}


const percent =
  Number(event.target.value);


audio.currentTime =
  (percent / 100) *
  audio.duration;
```

}
);

/* =========================
MANAGEMENT PANEL
========================= */

function toggleManage(force){

const panel =
$("managePanel");

if(!panel){
return;
}

const show =
force ??
panel.classList.contains("hidden");

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

const manageBtn =
$("manageBtn");

if(manageBtn){

manageBtn.addEventListener(
"click",
() => toggleManage()
);

}

/* =========================
INITIALIZE
========================= */

loadTracks();
