OZZI Backend Phase 1 — Supabase

هذه النسخة تضيف Backend حقيقي للموقع باستخدام Supabase:
- PostgreSQL database للعقارات ومواد البناء والطلبات.
- Auth لتسجيل دخول المدير.
- Storage لصور العقارات والمنتجات.
- Admin Dashboard: admin.html.
- الموقع العام يقرأ العقارات من قاعدة البيانات عند ضبط بيانات Supabase.

خطوات التشغيل:
1) أنشئ مشروعًا جديدًا في Supabase.
2) افتح SQL Editor وشغّل ملف supabase-schema.sql كاملًا.
3) من Project Settings / API Keys انسخ Project URL و Publishable key (أو anon key للمشاريع القديمة).
4) افتح supabase-config.js وضع القيم في:
   window.OZZI_SUPABASE_URL = "...";
   window.OZZI_SUPABASE_KEY = "...";
5) ارفع كل الملفات إلى GitHub Pages.
6) افتح admin.html وأنشئ مستخدمًا من Supabase Auth Dashboard (Email/Password).
7) انسخ UUID للمستخدم من Authentication > Users.
8) في SQL Editor نفّذ:
   insert into public.admins(user_id) values ('UUID-HERE');
9) افتح admin.html وسجّل الدخول.
10) أضف العقارات ومواد البناء من لوحة التحكم.

الأمان:
- استخدم Publishable/anon key فقط في الواجهة.
- لا تضع service_role أو secret key في GitHub.
- RLS موجود في SQL لحماية الجداول، وعمليات الإدارة تتطلب حسابًا موجودًا في public.admins.

الموقع العام:
properties.html سيقرأ العقارات النشطة من قاعدة البيانات إذا كانت إعدادات Supabase صحيحة.
