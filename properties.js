const properties = [
  {
    id:1, purpose:"sale", type:"villa", location:"sheikh-zayed", price:12500000,
    typeName:"فيلا مستقلة", title:"فيلا فاخرة بإطلالة مميزة", locationName:"الشيخ زايد - الجيزة",
    meta:"🛏 5 غرف • 🛁 4 حمامات • ▣ 450 م²",
    image:"https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id:2, purpose:"sale", type:"apartment", location:"new-cairo", price:3200000,
    typeName:"شقة سكنية", title:"شقة حديثة بتشطيب فاخر", locationName:"التجمع الخامس - القاهرة الجديدة",
    meta:"🛏 3 غرف • 🛁 3 حمامات • ▣ 180 م²",
    image:"https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id:3, purpose:"rent", type:"apartment", location:"alexandria", price:25000,
    typeName:"شقة للإيجار", title:"شقة مفروشة بإطلالة رائعة", locationName:"سموحة - الإسكندرية",
    meta:"🛏 2 غرف • 🛁 2 حمام • ▣ 140 م²",
    image:"https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id:4, purpose:"rent", type:"office", location:"sheikh-zayed", price:45000,
    typeName:"مكتب إداري", title:"مكتب إداري في موقع مميز", locationName:"الشيخ زايد - الجيزة",
    meta:"🚪 3 غرف • 🛁 2 حمام • ▣ 120 م²",
    image:"https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id:5, purpose:"sale", type:"apartment", location:"maadi", price:4800000,
    typeName:"شقة سكنية", title:"شقة راقية بالقرب من الخدمات", locationName:"المعادي - القاهرة",
    meta:"🛏 3 غرف • 🛁 2 حمام • ▣ 210 م²",
    image:"https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id:6, purpose:"sale", type:"chalet", location:"north-coast", price:7200000,
    typeName:"شاليه", title:"شاليه بإطلالة بحرية", locationName:"الساحل الشمالي",
    meta:"🛏 3 غرف • 🛁 2 حمام • ▣ 165 م²",
    image:"https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id:7, purpose:"rent", type:"shop", location:"new-cairo", price:60000,
    typeName:"محل تجاري", title:"محل تجاري على شارع رئيسي", locationName:"التجمع الخامس - القاهرة الجديدة",
    meta:"🚪 مساحة مفتوحة • ▣ 135 م²",
    image:"https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=80"
  },
  {
    id:8, purpose:"sale", type:"villa", location:"new-cairo", price:18500000,
    typeName:"فيلا مستقلة", title:"فيلا عصرية داخل كمبوند", locationName:"القاهرة الجديدة",
    meta:"🛏 5 غرف • 🛁 5 حمامات • ▣ 520 م²",
    image:"https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80"
  }
];

const grid = document.getElementById("propertyGrid");
const emptyState = document.getElementById("emptyState");
const purpose = document.getElementById("purpose");
const type = document.getElementById("type");
const locationSelect = document.getElementById("location");
const price = document.getElementById("price");
const keyword = document.getElementById("keyword");
const sort = document.getElementById("sort");

function money(value, purpose){
  return value.toLocaleString("en-US") + ' <small>جنيه' + (purpose === "rent" ? ' / شهرياً' : '') + '</small>';
}

function render(list){
  grid.innerHTML = list.map(p => `
    <article class="property-card">
      <div class="property-img" style="background-image:url('${p.image}')">
        <span class="badge">${p.purpose === "sale" ? "للبيع" : "للإيجار"}</span>
        <button class="heart" data-id="${p.id}" aria-label="إضافة للمفضلة">♡</button>
      </div>
      <div class="property-body">
        <span class="property-type">${p.typeName}</span>
        <h3 class="property-title">${p.title}</h3>
        <div class="location">📍 ${p.locationName}</div>
        <div class="meta">${p.meta}</div>
        <div class="price">${money(p.price,p.purpose)}</div>
        <button class="btn details" data-detail="${p.id}">عرض التفاصيل</button>
      </div>
    </article>
  `).join("");

  emptyState.classList.toggle("show", list.length === 0);

  grid.querySelectorAll(".heart").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      btn.textContent = btn.textContent === "♡" ? "♥" : "♡";
      showToast(btn.textContent === "♥" ? "تمت إضافة العقار للمفضلة" : "تمت إزالة العقار من المفضلة");
    });
  });

  grid.querySelectorAll("[data-detail]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      window.location.href = `property-details.html?id=${btn.dataset.detail}`;
    });
  });
}

function filterProperties(){
  let list = properties.filter(p=>{
    const matchesPurpose = purpose.value === "all" || p.purpose === purpose.value;
    const matchesType = type.value === "all" || p.type === type.value;
    const matchesLocation = locationSelect.value === "all" || p.location === locationSelect.value;
    const maxPrice = price.value === "all" ? Infinity : Number(price.value);
    const matchesPrice = p.price <= maxPrice;
    const q = keyword.value.trim().toLowerCase();
    const matchesKeyword = !q || `${p.title} ${p.locationName} ${p.typeName}`.toLowerCase().includes(q);
    return matchesPurpose && matchesType && matchesLocation && matchesPrice && matchesKeyword;
  });

  if(sort.value === "low") list.sort((a,b)=>a.price-b.price);
  if(sort.value === "high") list.sort((a,b)=>b.price-a.price);
  render(list);
}

[purpose,type,locationSelect,price,sort].forEach(el=>el.addEventListener("change",filterProperties));
keyword.addEventListener("input",filterProperties);

document.getElementById("resetBtn").addEventListener("click",()=>{
  purpose.value="all"; type.value="all"; locationSelect.value="all"; price.value="all"; sort.value="default"; keyword.value="";
  filterProperties();
});

document.getElementById("menuBtn").addEventListener("click",()=>{
  document.getElementById("navLinks").classList.toggle("open");
});
document.querySelectorAll(".nav-links a").forEach(a=>a.addEventListener("click",()=>{
  document.getElementById("navLinks").classList.remove("open");
}));

document.getElementById("contactBtn").addEventListener("click",()=>{
  window.open("https://wa.me/201015949282","_blank");
});

function showToast(message){
  const toast=document.getElementById("toast");
  toast.textContent=message;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer=setTimeout(()=>toast.classList.remove("show"),2600);
}

const params = new URLSearchParams(window.location.search);
if(params.get("purpose") === "sale" || params.get("purpose") === "rent") purpose.value = params.get("purpose");
filterProperties();
