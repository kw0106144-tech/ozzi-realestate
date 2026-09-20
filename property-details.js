const photos = [
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1400&q=85"
];

let current = 0;
const mainPhoto = document.getElementById("mainPhoto");
const thumbs = document.getElementById("thumbs");

photos.forEach((photo,index)=>{
  const thumb=document.createElement("button");
  thumb.className="thumb" + (index===0 ? " active" : "");
  thumb.style.backgroundImage=`url("${photo}")`;
  thumb.setAttribute("aria-label",`الصورة ${index+1}`);
  thumb.addEventListener("click",()=>setPhoto(index));
  thumbs.appendChild(thumb);
});

function setPhoto(index){
  current=(index+photos.length)%photos.length;
  mainPhoto.style.backgroundImage=`url("${photos[current]}")`;
  document.querySelectorAll(".thumb").forEach((t,i)=>t.classList.toggle("active",i===current));
}
document.getElementById("nextPhoto").addEventListener("click",()=>setPhoto(current+1));
document.getElementById("prevPhoto").addEventListener("click",()=>setPhoto(current-1));

document.getElementById("favorite").addEventListener("click",function(){
  this.textContent=this.textContent==="♡" ? "♥" : "♡";
  showToast(this.textContent==="♥" ? "تمت إضافة العقار للمفضلة" : "تمت إزالة العقار من المفضلة");
});

function contactWhatsApp(){
  const message=encodeURIComponent("مرحباً OZZI، أرغب في الاستفسار عن الفيلا رقم OZZI-001 وترتيب معاينة.");
  window.open(`https://wa.me/201015949282?text=${message}`,"_blank");
}
document.getElementById("whatsappBtn").addEventListener("click",contactWhatsApp);
document.getElementById("sideWhatsapp").addEventListener("click",contactWhatsApp);
document.getElementById("contactTop").addEventListener("click",()=>{
  window.open("https://wa.me/201015949282","_blank");
});

document.getElementById("menuBtn").addEventListener("click",()=>{
  document.getElementById("navLinks").classList.toggle("open");
});
document.querySelectorAll(".nav-links a").forEach(a=>a.addEventListener("click",()=>{
  document.getElementById("navLinks").classList.remove("open");
}));

function showToast(message){
  const toast=document.getElementById("toast");
  toast.textContent=message;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer=setTimeout(()=>toast.classList.remove("show"),2600);
}

setPhoto(0);
