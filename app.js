const DB_NAME = "ghosti-radio-db";
const STORE = "tracks";
let tracks = [];
let currentIndex = -1;
let objectUrl = null;

const $ = (id) => document.getElementById(id);
const audio = $("audio");

function openDB(){
  return new Promise((resolve,reject)=>{
    const req = indexedDB.open(DB_NAME,1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if(!db.objectStoreNames.contains(STORE)){
        db.createObjectStore(STORE,{keyPath:"id",autoIncrement:true});
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getAll(){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(STORE,"readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}

async function addTrack(file){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readwrite");
    tx.objectStore(STORE).add({
      name:file.name.replace(/\.[^/.]+$/,""),
      artist:"GHOSTI",
      blob:file,
      createdAt:Date.now()
    });
    tx.oncomplete=resolve;
    tx.onerror=()=>reject(tx.error);
  });
}

async function deleteTrack(id){
  const db=await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete=resolve;
    tx.onerror=()=>reject(tx.error);
  });
}

async function clearTracks(){
  const db=await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete=resolve;
    tx.onerror=()=>reject(tx.error);
  });
}

function fmt(sec){
  if(!Number.isFinite(sec)) return "0:00";
  const m=Math.floor(sec/60);
  const s=Math.floor(sec%60).toString().padStart(2,"0");
  return `${m}:${s}`;
}

function render(){
  $("trackCount").textContent = `${tracks.length} track${tracks.length===1?"":"s"}`;
  const el=$("playlist");
  if(!tracks.length){
    el.innerHTML=`<div class="empty"><div class="empty-ghost">👻</div><p>هنوز موزیکی اضافه نشده.</p><button id="emptyManageBtn" class="small-btn" type="button">اضافه کردن موزیک</button></div>`;
    $("emptyManageBtn").onclick=()=>toggleManage(true);
    $("player").classList.add("hidden");
    return;
  }
  el.innerHTML=tracks.map((t,i)=>`
    <div class="track">
      <div class="track-index">${String(i+1).padStart(2,"0")}</div>
      <div class="track-info">
        <div class="track-title">${escapeHtml(t.name)}</div>
        <div class="track-artist">${escapeHtml(t.artist||"GHOSTI")}</div>
      </div>
      <div class="track-actions">
        <button class="icon-btn delete-btn" data-delete="${t.id}" aria-label="Delete">×</button>
        <button class="icon-btn" data-play="${i}" aria-label="Play">${i===currentIndex && !audio.paused ? "Ⅱ" : "▶"}</button>
      </div>
    </div>`).join("");
  el.querySelectorAll("[data-play]").forEach(b=>b.onclick=()=>playAt(Number(b.dataset.play)));
  el.querySelectorAll("[data-delete]").forEach(b=>b.onclick=async()=>{
    await deleteTrack(Number(b.dataset.delete));
    if(currentIndex>=0 && tracks[currentIndex]?.id===Number(b.dataset.delete)){
      audio.pause(); currentIndex=-1; $("player").classList.add("hidden");
    }
    tracks=await getAll(); render();
  });
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

async function playAt(index){
  if(!tracks[index]) return;
  currentIndex=index;
  if(objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl=URL.createObjectURL(tracks[index].blob);
  audio.src=objectUrl;
  $("nowTitle").textContent=tracks[index].name;
  $("nowArtist").textContent=tracks[index].artist||"GHOSTI";
  $("player").classList.remove("hidden");
  try{await audio.play();}catch(e){}
  render();
}

function toggleManage(force){
  const panel=$("managePanel");
  const show=force ?? panel.classList.contains("hidden");
  panel.classList.toggle("hidden",!show);
  panel.setAttribute("aria-hidden",String(!show));
  document.body.classList.toggle("manage-mode",show);
}

$("manageBtn").onclick=()=>toggleManage();
$("audioInput").onchange=async(e)=>{
  const files=[...e.target.files].filter(f=>f.type.startsWith("audio/"));
  if(!files.length) return;
  $("uploadStatus").textContent="در حال اضافه کردن...";
  for(const f of files) await addTrack(f);
  tracks=await getAll();
  $("uploadStatus").textContent=`${files.length} موزیک اضافه شد.`;
  e.target.value="";
  render();
};
$("clearBtn").onclick=async()=>{
  if(!tracks.length) return;
  if(confirm("همه آهنگ‌ها حذف شوند؟")){
    await clearTracks();
    audio.pause(); currentIndex=-1;
    tracks=await getAll(); render();
  }
};

$("playBtn").onclick=async()=>{
  if(currentIndex<0){await playAt(0);return;}
  if(audio.paused) await audio.play(); else audio.pause();
  render();
};
$("prevBtn").onclick=()=>playAt(Math.max(0,currentIndex-1));
$("nextBtn").onclick=()=>playAt(Math.min(tracks.length-1,currentIndex+1));

audio.addEventListener("play",()=>{ $("playBtn").textContent="Ⅱ"; render(); });
audio.addEventListener("pause",()=>{ $("playBtn").textContent="▶"; render(); });
audio.addEventListener("ended",()=>{
  if(currentIndex<tracks.length-1) playAt(currentIndex+1);
  else { $("playBtn").textContent="▶"; render(); }
});
audio.addEventListener("loadedmetadata",()=>{$("duration").textContent=fmt(audio.duration);});
audio.addEventListener("timeupdate",()=>{
  const p=audio.duration?(audio.currentTime/audio.duration)*100:0;
  $("progress").value=p;
  $("currentTime").textContent=fmt(audio.currentTime);
});
$("progress").oninput=(e)=>{
  if(audio.duration) audio.currentTime=(Number(e.target.value)/100)*audio.duration;
};

(async()=>{
  try{
    tracks=await getAll();
    render();
  }catch(e){
    $("uploadStatus").textContent="مرورگر اجازه ذخیره‌سازی محلی را نداد. Chrome/Edge/Safari جدید را امتحان کن.";
  }
})();
