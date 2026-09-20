(function(){
  "use strict";

  function start(){
    try{
      if(!window.supabase){
        showLoginMsg("لم يتم تحميل Supabase. تأكد من اتصال الإنترنت ثم أعد تحميل الصفحة.", true);
        return;
      }
      if(!window.OZZI_SUPABASE_READY){
        showLoginMsg("بيانات Supabase غير موجودة في supabase-config.js.", true);
        return;
      }

      const sb = window.supabase.createClient(window.OZZI_SUPABASE_URL, window.OZZI_SUPABASE_KEY);
      const $ = s => document.querySelector(s);
      const money = n => Number(n||0).toLocaleString("en-US") + " جنيه";
      let currentUser = null;

      function showLoginMsg(text,error=false){
        const el=document.querySelector("#loginMsg");
        if(el){ el.textContent=text; el.className="msg"+(error?" error":""); el.style.display="block"; }
      }
      function showAppMsg(text,error=false){
        const el=document.querySelector("#appMsg");
        if(el){ el.textContent=text; el.className="msg"+(error?" error":""); el.style.display="block"; }
      }
      function clearMsg(){
        ["#loginMsg","#appMsg"].forEach(id=>{const el=$(id); if(el) el.style.display="none";});
      }
      function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

      async function boot(){
        clearMsg();
        try{
          const {data,error}=await sb.auth.getSession();
          if(error) throw error;
          if(data && data.session) await verifyAdminAndShow(data.session.user);
          else showLogin();
        }catch(err){
          console.error("OZZI boot error:",err);
          showLoginMsg("حدث خطأ في الاتصال بـ Supabase: "+(err.message||err),true);
        }
      }
      function showLogin(){
        $("#loginView").style.display="grid";
        $("#app").style.display="none";
      }
      async function verifyAdminAndShow(user){
        const {data:admin,error}=await sb.from("admins").select("user_id").eq("user_id",user.id).maybeSingle();
        if(error){
          console.error("Admin check error:",error);
          showLoginMsg("تم تسجيل الدخول لكن تعذر التحقق من صلاحيات Admin: "+error.message,true);
          await sb.auth.signOut();
          return;
        }
        if(!admin){
          await sb.auth.signOut();
          showLoginMsg("الحساب صحيح، لكنه غير مضاف كـ Admin في جدول admins.",true);
          return;
        }
        await showApp(user);
      }
      async function showApp(user){
        currentUser=user;
        $("#loginView").style.display="none";
        $("#app").style.display="block";
        $("#adminEmail").textContent=user.email||"Admin";
        await refreshAll();
      }
      async function refreshAll(){
        try{
          const results=await Promise.all([
            sb.from("properties").select("*").order("created_at",{ascending:false}),
            sb.from("materials").select("*").order("created_at",{ascending:false}),
            sb.from("inquiries").select("*").order("created_at",{ascending:false})
          ]);
          for(const r of results) if(r.error) throw r.error;
          const [props,mats,inq]=results.map(r=>r.data||[]);
          $("#statProps").textContent=props.length;
          $("#statMats").textContent=mats.length;
          $("#statInq").textContent=inq.length;
          renderProps(props); renderMats(mats); renderInq(inq);
        }catch(err){
          console.error("refreshAll error:",err);
          showAppMsg("تعذر تحميل بيانات لوحة التحكم: "+err.message,true);
        }
      }
      function renderProps(rows){
        $("#propsBody").innerHTML=rows.map(p=>`<tr><td>${p.image_url?`<img class="thumb" src="${escapeHtml(p.image_url)}">`:"—"}</td><td>${escapeHtml(p.title)}</td><td>${p.purpose==="sale"?"بيع":"إيجار"}</td><td>${money(p.price)}</td><td>${escapeHtml(p.location_name||p.location)}</td><td><button class="btn danger" data-delete-prop="${p.id}">حذف</button></td></tr>`).join("")||`<tr><td colspan="6" class="empty">لا توجد عقارات</td></tr>`;
      }
      function renderMats(rows){
        $("#matsBody").innerHTML=rows.map(p=>`<tr><td>${p.image_url?`<img class="thumb" src="${escapeHtml(p.image_url)}">`:"—"}</td><td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.category||"—")}</td><td>${money(p.price)} / ${escapeHtml(p.unit)}</td><td>${p.stock??0}</td><td><button class="btn danger" data-delete-mat="${p.id}">حذف</button></td></tr>`).join("")||`<tr><td colspan="6" class="empty">لا توجد منتجات</td></tr>`;
      }
      function renderInq(rows){
        $("#inqBody").innerHTML=rows.map(x=>`<tr><td>${escapeHtml(x.customer_name)}</td><td>${escapeHtml(x.phone)}</td><td>${escapeHtml(x.request_type)}</td><td>${escapeHtml(x.message||"")}</td><td>${escapeHtml(x.status)}</td></tr>`).join("")||`<tr><td colspan="5" class="empty">لا توجد طلبات</td></tr>`;
      }
      async function uploadImage(file,folder){
        if(!file) return "";
        const safe=file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,"-");
        const path=`${folder}/${Date.now()}-${crypto.randomUUID()}-${safe}`;
        const {error}=await sb.storage.from("ozzi-images").upload(path,file,{upsert:false});
        if(error) throw error;
        return sb.storage.from("ozzi-images").getPublicUrl(path).data.publicUrl;
      }

      $("#loginForm").addEventListener("submit",async e=>{
        e.preventDefault();
        clearMsg();
        const email=$("#loginEmail").value.trim();
        const password=$("#loginPassword").value;
        const button=e.submitter || $("#loginForm button[type=submit]");
        if(button) button.disabled=true;
        try{
          if(!email || !password){showLoginMsg("اكتب البريد الإلكتروني وكلمة المرور.",true);return;}
          showLoginMsg("جاري تسجيل الدخول...",false);
          const {data,error}=await sb.auth.signInWithPassword({email,password});
          if(error){showLoginMsg("فشل تسجيل الدخول: "+error.message,true);return;}
          await verifyAdminAndShow(data.user);
        }catch(err){
          console.error("Login error:",err);
          showLoginMsg("حدث خطأ غير متوقع: "+(err.message||err),true);
        }finally{
          if(button) button.disabled=false;
        }
      });

      $("#logout").addEventListener("click",async()=>{await sb.auth.signOut();showLogin();clearMsg();});

      document.addEventListener("click",async e=>{
        const prop=e.target.closest("[data-delete-prop]");
        if(prop){if(confirm("حذف العقار؟")){const {error}=await sb.from("properties").delete().eq("id",prop.dataset.deleteProp);if(error)showAppMsg(error.message,true);else await refreshAll();}return;}
        const mat=e.target.closest("[data-delete-mat]");
        if(mat){if(confirm("حذف المنتج؟")){const {error}=await sb.from("materials").delete().eq("id",mat.dataset.deleteMat);if(error)showAppMsg(error.message,true);else await refreshAll();}return;}
      });

      $("#propertyForm").addEventListener("submit",async e=>{
        e.preventDefault();clearMsg();
        try{
          const f=e.target,file=$("#propertyImage").files[0],image_url=await uploadImage(file,"properties");
          const row={purpose:f.purpose.value,type:f.type.value,title:f.title.value.trim(),location:f.location.value,location_name:f.locationName.value.trim(),price:Number(f.price.value||0),area:Number(f.area.value||0),rooms:Number(f.rooms.value||0),bathrooms:Number(f.bathrooms.value||0),garages:Number(f.garages.value||0),description:f.description.value.trim(),features:f.features.value.split(",").map(x=>x.trim()).filter(Boolean),image_url,status:f.status.value};
          const {error}=await sb.from("properties").insert(row); if(error)throw error;
          f.reset();showAppMsg("تمت إضافة العقار بنجاح");await refreshAll();
        }catch(err){showAppMsg(err.message,true);}
      });
      $("#materialForm").addEventListener("submit",async e=>{
        e.preventDefault();clearMsg();
        try{
          const f=e.target,file=$("#materialImage").files[0],image_url=await uploadImage(file,"materials");
          const row={name:f.name.value.trim(),category:f.category.value.trim(),price:Number(f.price.value||0),unit:f.unit.value.trim()||"قطعة",stock:Number(f.stock.value||0),description:f.description.value.trim(),image_url,status:f.status.value};
          const {error}=await sb.from("materials").insert(row); if(error)throw error;
          f.reset();showAppMsg("تمت إضافة المنتج بنجاح");await refreshAll();
        }catch(err){showAppMsg(err.message,true);}
      });
      document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".nav-item").forEach(x=>x.classList.remove("active"));btn.classList.add("active");document.querySelectorAll(".view").forEach(x=>x.style.display="none");$("#"+btn.dataset.view).style.display="block";}));

      boot();
    }catch(err){
      console.error("OZZI Admin fatal error:",err);
      const el=document.querySelector("#loginMsg");
      if(el){el.textContent="خطأ في تحميل لوحة التحكم: "+(err.message||err);el.className="msg error";el.style.display="block";}
    }
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start); else start();
})();
