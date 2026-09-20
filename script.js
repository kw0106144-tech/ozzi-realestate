const menuBtn = document.getElementById("menuBtn");
  const navLinks = document.getElementById("navLinks");
  menuBtn.addEventListener("click",()=>navLinks.classList.toggle("open"));
  navLinks.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>navLinks.classList.remove("open")));

  document.querySelectorAll(".search-tab").forEach(tab=>{
    tab.addEventListener("click",()=>{
      document.querySelectorAll(".search-tab").forEach(t=>t.classList.remove("active"));
      tab.classList.add("active");
    });
  });

  document.getElementById("searchForm").addEventListener("submit",(e)=>{
    e.preventDefault();
    showToast("تم تنفيذ البحث — سيتم عرض النتائج هنا");
  });

  document.querySelectorAll(".heart").forEach(btn=>{
    btn.addEventListener("click",()=>{
      btn.textContent = btn.textContent === "♡" ? "♥" : "♡";
      showToast(btn.textContent === "♥" ? "تمت إضافة العقار للمفضلة" : "تمت إزالة العقار من المفضلة");
    });
  });

  function showToast(message){
    const toast=document.getElementById("toast");
    toast.textContent=message;
    toast.classList.add("show");
    clearTimeout(window.toastTimer);
    window.toastTimer=setTimeout(()=>toast.classList.remove("show"),2600);
  }

  function contactOZZI(){
    window.open("https://wa.me/201015949282","_blank");
  }
