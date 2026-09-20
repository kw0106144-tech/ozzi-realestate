const { createClient } = window.supabase;
const sb = createClient(window.OZZI_SUPABASE_URL, window.OZZI_SUPABASE_KEY);
const $ = s => document.querySelector(s);
const money = n => Number(n||0).toLocaleString("en-US") + " جنيه";

let currentUser = null;

function msg(text, error=false){
  const el=$("#msg"); el.textContent=text; el.className="msg"+(error?" error":""); el.style.display="block";
}
function clearMsg(){ $("#msg").style.display="none"; }

async function boot(){
  if(!window.OZZI_SUPABASE_READY){
    msg("أدخل Supabase URL و Publishable/Anon Key داخل supabase-config.js أولاً.", true);
    $("#loginForm").style.display="none"; return;
  }
  const {data:{session}}=await sb.auth.getSession();
  if(session) await showApp(session.user); else showLogin();
}
function showLogin(){
  $("#loginView").style.display="grid"; $("#app").style.display="none";
}
async function showApp(user){
  currentUser=user;
  $("#loginView").style.display="none"; $("#app").style.display="block";
  $("#adminEmail").textContent=user.email||"Admin";
  await refreshAll();
}
async function refreshAll(){
  const [{data:props},{data:mats},{data:inq}] = await Promise.all([
    sb.from("properties").select("*").order("created_at",{ascending:false}),
    sb.from("materials").select("*").order("created_at",{ascending:false}),
    sb.from("inquiries").select("*").order("created_at",{ascending:false})
  ]);
  $("#statProps").textContent=(props||[]).length;
  $("#statMats").textContent=(mats||[]).length;
  $("#statInq").textContent=(inq||[]).length;
  renderProps(props||[]); renderMats(mats||[]); renderInq(inq||[]);
}
function renderProps(rows){
  $("#propsBody").innerHTML=rows.map(p=>`<tr>
    <td>${p.image_url?`<img class="thumb" src="${p.image_url}">`:"—"}</td>
    <td>${escapeHtml(p.title)}</td><td>${p.purpose==="sale"?"بيع":"إيجار"}</td>
    <td>${money(p.price)}</td><td>${escapeHtml(p.location_name||p.location)}</td>
    <td><button class="btn danger" onclick="deleteProp(${p.id})">حذف</button></td>
  </tr>`).join("")||`<tr><td colspan="6" class="empty">لا توجد عقارات</td></tr>`;
}
function renderMats(rows){
  $("#matsBody").innerHTML=rows.map(p=>`<tr>
    <td>${p.image_url?`<img class="thumb" src="${p.image_url}">`:"—"}</td>
    <td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.category||"—")}</td>
    <td>${money(p.price)} / ${escapeHtml(p.unit)}</td><td>${p.stock??0}</td>
    <td><button class="btn danger" onclick="deleteMat(${p.id})">حذف</button></td>
  </tr>`).join("")||`<tr><td colspan="6" class="empty">لا توجد منتجات</td></tr>`;
}
function renderInq(rows){
  $("#inqBody").innerHTML=rows.map(x=>`<tr><td>${escapeHtml(x.customer_name)}</td><td>${escapeHtml(x.phone)}</td><td>${escapeHtml(x.request_type)}</td><td>${escapeHtml(x.message||"")}</td><td>${escapeHtml(x.status)}</td></tr>`).join("")||`<tr><td colspan="5" class="empty">لا توجد طلبات</td></tr>`;
}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

async function uploadImage(file, folder){
  if(!file) return "";
  const safe = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,"-");
  const path=`${folder}/${Date.now()}-${crypto.randomUUID()}-${safe}`;
  const {error}=await sb.storage.from("ozzi-images").upload(path,file,{upsert:false});
  if(error) throw error;
  return sb.storage.from("ozzi-images").getPublicUrl(path).data.publicUrl;
}
window.deleteProp=async id=>{if(confirm("حذف العقار؟")){const {error}=await sb.from("properties").delete().eq("id",id);if(error)msg(error.message,true);else refreshAll()}};
window.deleteMat=async id=>{if(confirm("حذف المنتج؟")){const {error}=await sb.from("materials").delete().eq("id",id);if(error)msg(error.message,true);else refreshAll()}};

$("#loginForm").addEventListener("submit",async e=>{
  e.preventDefault();clearMsg();
  const email=$("#loginEmail").value.trim(), password=$("#loginPassword").value;
  const {data,error}=await sb.auth.signInWithPassword({email,password});
  if(error){msg(error.message,true);return}
  // Check admin access immediately.
  const {data:admin}=await sb.from("admins").select("user_id").eq("user_id",data.user.id).maybeSingle();
  if(!admin){await sb.auth.signOut();msg("هذا الحساب ليس Admin.",true);return}
  await showApp(data.user);
});
$("#logout").addEventListener("click",async()=>{await sb.auth.signOut();showLogin()});

$("#propertyForm").addEventListener("submit",async e=>{
  e.preventDefault();clearMsg();
  try{
    const f=e.target, file=$("#propertyImage").files[0];
    const image_url=await uploadImage(file,"properties");
    const row={
      purpose:f.purpose.value,type:f.type.value,title:f.title.value.trim(),
      location:f.location.value,location_name:f.locationName.value.trim(),
      price:Number(f.price.value||0),area:Number(f.area.value||0),rooms:Number(f.rooms.value||0),
      bathrooms:Number(f.bathrooms.value||0),garages:Number(f.garages.value||0),
      description:f.description.value.trim(),features:f.features.value.split(",").map(x=>x.trim()).filter(Boolean),
      image_url,status:f.status.value
    };
    const {error}=await sb.from("properties").insert(row);
    if(error) throw error;
    f.reset();msg("تمت إضافة العقار بنجاح");await refreshAll();
  }catch(err){msg(err.message,true)}
});

$("#materialForm").addEventListener("submit",async e=>{
  e.preventDefault();clearMsg();
  try{
    const f=e.target,file=$("#materialImage").files[0],image_url=await uploadImage(file,"materials");
    const row={name:f.name.value.trim(),category:f.category.value.trim(),price:Number(f.price.value||0),unit:f.unit.value.trim()||"قطعة",stock:Number(f.stock.value||0),description:f.description.value.trim(),image_url,status:f.status.value};
    const {error}=await sb.from("materials").insert(row);
    if(error) throw error;
    f.reset();msg("تمت إضافة المنتج بنجاح");await refreshAll();
  }catch(err){msg(err.message,true)}
});

document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".nav-item").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
  document.querySelectorAll(".view").forEach(x=>x.style.display="none");
  $("#"+btn.dataset.view).style.display="block";
}));
boot();
