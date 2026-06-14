document.addEventListener('DOMContentLoaded', function() {
    
    // 1. تأثير السكرول على النافبار (Navbar Scroll Effect)
    const navbar = document.getElementById('main-nav');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }


    // 2. التنقل السلس بين أقسام الصفحة (Smooth Scrolling for Anchor Links)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if(this.getAttribute('href') === '#') return;
            
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if(targetElement) {
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
  
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // ==========================================
    // 3. ربط استمارة الحجز بـ Supabase الفعلي
    // ==========================================

    // إعداد الاتصال بقاعدة بيانات مركز تاج
    const SUPABASE_URL = "https://rtwgbkhylyvoruyculwk.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0d2dia2h5bHl2b3J1eWN1bHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNTA2MDYsImV4cCI6MjA5NjkyNjYwNn0.gIyEUyc7-cyJ2iEkmRX4EmaWpnxLNi4VpgjNgwo3jNU";
    
    // التأكد من أن مكتبة Supabase تم تحميلها في الصفحة أولاً
    if (typeof supabase === 'undefined') {
        console.error("مكتبة Supabase لم يتم تحميلها في ملف الـ HTML. يرجى إضافة الـ CDN الخاص بها.");
        return;
    }
    
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    // ===========================
// تحميل الخدمات من Supabase
// ===========================
async function loadServices() {

    const serviceSelect = document.getElementById("service");

    if (!serviceSelect) return;

    try {

        const { data, error } = await supabaseClient
            .from("services")
            .select("*")
            .order("id", { ascending: true });

        if (error) throw error;

        serviceSelect.innerHTML =
            '<option value="" disabled selected>اختر الخدمة</option>';

        data.forEach(service => {

            const option = document.createElement("option");

            option.value = service.name;
            option.textContent = service.name;

            serviceSelect.appendChild(option);

        });

    } catch (err) {

        console.error("Services Error:", err);

        serviceSelect.innerHTML =
            '<option value="" disabled selected>تعذر تحميل الخدمات</option>';
    }
}

// تشغيل تحميل الخدمات
loadServices();
    const bookingForm = document.getElementById("booking-form");
    const dateInput = document.getElementById("date");

    if (dateInput) {
        // منع الحجز في الأيام السابقة (تحديد أدنى تاريخ وهو اليوم)
        const todayStr = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', todayStr);

        // [الشرط الأول] منع اختيار يوم الأحد تلقائياً فور الاختيار من النتيجة
        dateInput.addEventListener("change", function () {
            const selectedDate = this.value;
            const day = new Date(selectedDate).getDay();

            if (day === 0) { // 0 يمثل الأحد
                alert("عذراً، العيادة مغلقة تماماً يوم الأحد. برجاء اختيار يوم آخر.");
                this.value = "";
            }
        });
    }

    if (bookingForm) {
        bookingForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const btn = bookingForm.querySelector("button[type='submit']");
            const originalText = btn.innerHTML;

            // تفعيل الـ Spinner وتغيير النص لجمالية الواجهة أثناء الفحص والرفع
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin ms-2"></i> جاري التحقق والإرسال...';
            btn.disabled = true;

            const name = document.getElementById("name").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const service = document.getElementById("service").value;
            const selectedDate = dateInput.value;

            if (!selectedDate) {
                alert("الرجاء اختيار تاريخ الحجز.");
                btn.innerHTML = originalText;
                btn.disabled = false;
                return;
            }

            try {
                // [الشرط الثاني] التحقق من حالة الحجوزات العامة للعيادة (مفتوحة أم مغلقة)
                const { data: globalStatus } = await supabaseClient
                    .from('settings')
                    .select('value')
                    .eq('key', 'is_open')
                    .single();

                if (globalStatus && globalStatus.value === 'false') {
                    alert('عذراً، استقبال الحجوزات مغلق حالياً بطلب من إدارة العيادة.');
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    return;
                }

                // [الشرط الثالث] التحقق مما إذا كان اليوم مغلقاً يدوياً من الطبيب (إجازة طارئة)
                const { data: isClosed } = await supabaseClient
                    .from('closed_days')
                    .select('*')
                    .eq('date', selectedDate);

                if (isClosed && isClosed.length > 0) {
                    alert('عذراً، هذا اليوم غير متاح للحجوزات (إجازة طارئة للعيادة).');
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    return;
                }

                // جلب الحد الأقصى اليومي الديناميكي من جدول الإعدادات
                const { data: maxSetting } = await supabaseClient
                    .from('settings')
                    .select('value')
                    .eq('key', 'daily_max')
                    .single();
                const dailyMax = maxSetting ? parseInt(maxSetting.value) : 12;

                // [الشرط الرابع] التحقق من عدد الحجوزات الحالية في نفس اليوم لضمان عدم تخطي الـ 12 حجز
                const { count, error: countError } = await supabaseClient
                    .from('bookings')
                    .select('*', { count: 'exact', head: true })
                    .eq('date', selectedDate);

                if (count >= dailyMax) {
                    alert(`عذراً، اكتمل الحد الأقصى للحجوزات لهذا اليوم (${dailyMax} حجز). يرجى اختيار تاريخ آخر.`);
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    return;
                }

                // خطوة الإدخال الفعلي للبيانات في قاعدة البيانات السحابية
                const { data, error } = await supabaseClient
                    .from('bookings')
                    .insert([{ name, phone, service, date: selectedDate }]);

                if (error) {
                    throw error;
                } else {
                    alert("تم تسجيل حجزك بنجاح في مركز تاج! ننتظرك في موعدك. ✅");
                    bookingForm.reset();
                }

            } catch (err) {
                console.error(err);
                alert("حصل خطأ أثناء إرسال الحجز، برجاء المحاولة مرة أخرى ❌");
            } finally {
                // إعادة الزرار لوضعه الطبيعي بعد الانتهاء
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }
});



loadServices();