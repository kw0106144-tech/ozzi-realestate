const menuBtn=document.getElementById("menuBtn");
const mainNav=document.getElementById("mainNav");
menuBtn.addEventListener("click",()=>mainNav.classList.toggle("open"));
document.querySelectorAll("#mainNav a").forEach(a=>a.addEventListener("click",()=>mainNav.classList.remove("open")));

const images=document.getElementById("images");
const preview=document.getElementById("preview");
images.addEventListener("change",()=>{
  preview.innerHTML="";
  [...images.files].forEach(file=>{
    if(!file.type.startsWith("image/")) return;
    const img=document.createElement("img");
    img.src=URL.createObjectURL(file);
    img.onload=()=>URL.revokeObjectURL(img.src);
    preview.appendChild(img);
  });
});

const form=document.getElementById("sellForm");
const toast=document.getElementById("toast");
form.addEventListener("submit",(e)=>{
  e.preventDefault();
  const phone=form.phone.value.trim();
  if(phone.length<8){
    alert("من فضلك أدخل رقم هاتف صحيح.");
    return;
  }
  toast.classList.add("show");
  form.reset();
  preview.innerHTML="";
  setTimeout(()=>toast.classList.remove("show"),5000);
});