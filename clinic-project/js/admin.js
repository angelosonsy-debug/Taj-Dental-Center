const SUPABASE_URL = "https://rtwgbkhylyvoruyculwk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0d2dia2h5bHl2b3J1eWN1bHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNTA2MDYsImV4cCI6MjA5NjkyNjYwNn0.gIyEUyc7-cyJ2iEkmRX4EmaWpnxLNi4VpgjNgwo3jNU";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const VISIT_TYPE_OPTIONS = [
  { value: "checkup", label: "كشف" },
  { value: "session", label: "جلسة" },
  { value: "cleaning", label: "تنظيف" },
  { value: "extraction", label: "خلع" },
  { value: "prosthetics", label: "تركيب" },
  { value: "root_canal", label: "علاج الجذور" },
  { value: "other", label: "أخرى" }
];

const VISIT_TYPE_LABEL_BY_VALUE = Object.fromEntries(
  VISIT_TYPE_OPTIONS.map((x) => [x.value, x.label])
);

const VISIT_TYPE_VALUE_BY_LABEL = Object.fromEntries(
  VISIT_TYPE_OPTIONS.map((x) => [x.label, x.value])
);

function normalizeVisitType(value) {
  if (!value) return "checkup";

  const raw = String(value).trim();
  const lower = raw.toLowerCase();

  if (VISIT_TYPE_LABEL_BY_VALUE[raw]) return raw;
  if (VISIT_TYPE_LABEL_BY_VALUE[lower]) return lower;
  if (VISIT_TYPE_VALUE_BY_LABEL[raw]) return VISIT_TYPE_VALUE_BY_LABEL[raw];

  return VISIT_TYPE_VALUE_BY_LABEL[raw] || VISIT_TYPE_VALUE_BY_LABEL[lower] || lower;
}

function visitTypeLabel(value) {
  const code = normalizeVisitType(value);
  return VISIT_TYPE_LABEL_BY_VALUE[code] || value || "-";
}

function configureVisitTypeSelect(selectEl) {
  if (!selectEl) return;

  const current = normalizeVisitType(selectEl.value || "checkup");
  selectEl.innerHTML = VISIT_TYPE_OPTIONS
    .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
    .join("");

  selectEl.value = current;
}

// =========================
// DOM
// =========================
const loginSection = document.getElementById("passwordOverlay");
const adminApp = document.getElementById("adminApp");
const loginForm = document.getElementById("adminLoginForm");
const adminPasswordInput = document.getElementById("adminPasswordInput");
const logoutBtn = document.getElementById("logoutBtn");
const refreshAllBtn = document.getElementById("refreshAllBtn");

const profileName = document.getElementById("profileName");
const profileRole = document.getElementById("profileRole");

const AUTH_STORAGE_KEY = "taj_admin_auth";
const ROLE_STORAGE_KEY = "taj_admin_role";

const totalBookingsEl = document.getElementById("totalBookings");
const todayBookingsEl = document.getElementById("todayBookings");
const closedDaysCountEl = document.getElementById("closedDaysCount");
const servicesCountEl = document.getElementById("servicesCount");
const globalStatus = document.getElementById("globalStatus");
const todayLoadBadge = document.getElementById("todayLoadBadge");
const todayStatIcon = document.getElementById("todayStatIcon");

const dailyMaxInput = document.getElementById("dailyMaxInput");
const openCloseSelect = document.getElementById("openCloseSelect");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const closeAllBookingsBtn = document.getElementById("closeAllBookingsBtn");

const closedDateInput = document.getElementById("closedDateInput");
const addClosedDayBtn = document.getElementById("addClosedDayBtn");
const closedDaysList = document.getElementById("closedDaysList");

const searchInput = document.getElementById("searchInput");
const dayFilter = document.getElementById("dayFilter");
const bookingsTable = document.getElementById("bookingsTable");

const serviceForm = document.getElementById("serviceForm");
const resetServiceBtn = document.getElementById("resetServiceBtn");
const serviceId = document.getElementById("serviceId");
const serviceName = document.getElementById("serviceName");
const serviceCategory = document.getElementById("serviceCategory");
const servicePrice = document.getElementById("servicePrice");
const serviceSort = document.getElementById("serviceSort");
const servicesTable = document.getElementById("servicesTable");
const addServiceBtn = document.getElementById("addServiceBtn");
const newServiceInput = document.getElementById("newServiceInput");
const manualService = document.getElementById("manualService");

const visitForm = document.getElementById("visitForm");
const visitPatientSelect = document.getElementById("visitPatientSelect");
const visitType = document.getElementById("visitType");
const visitAmount = document.getElementById("visitAmount");
const visitPaymentStatus = document.getElementById("visitPaymentStatus");
const visitNotes = document.getElementById("visitNotes");
const visitServiceSelect = document.getElementById("visitServiceSelect");
const visitsTable = document.getElementById("visitsTable");

const patientForm = document.getElementById("patientForm");
const patientName = document.getElementById("patientName");
const patientPhone = document.getElementById("patientPhone");
const patientNotes = document.getElementById("patientNotes");
const patientsTable = document.getElementById("patientsTable");

const transactionForm = document.getElementById("transactionForm");
const txDate = document.getElementById("txDate");
const txType = document.getElementById("txType");
const txCategory = document.getElementById("txCategory");
const txAmount = document.getElementById("txAmount");
const txNote = document.getElementById("txNote");
const transactionsTable = document.getElementById("transactionsTable");

const reportBookingsCount = document.getElementById("reportBookingsCount");
const reportCheckupsCount = document.getElementById("reportCheckupsCount");
const reportSessionsCount = document.getElementById("reportSessionsCount");
const reportOtherCount = document.getElementById("reportOtherCount");
const reportIncome = document.getElementById("reportIncome");
const reportExpense = document.getElementById("reportExpense");
const reportNet = document.getElementById("reportNet");
const dailyReportNotes = document.getElementById("dailyReportNotes");
const snapshotTodayBtn = document.getElementById("snapshotTodayBtn");
const dailyReportsTable = document.getElementById("dailyReportsTable");

const monthPicker = document.getElementById("monthPicker");
const monthBookings = document.getElementById("monthBookings");
const monthCheckups = document.getElementById("monthCheckups");
const monthIncome = document.getElementById("monthIncome");
const monthNet = document.getElementById("monthNet");

const profilesTable = document.getElementById("profilesTable");

const manualBookingForm = document.getElementById("manualBookingForm");
const manualName = document.getElementById("manualName");
const manualPhone = document.getElementById("manualPhone");
const manualDate = document.getElementById("manualDate");

// =========================
// State
// =========================
let currentProfile = null;
let currentRole = null;

let bookingsCache = [];
let servicesCache = [];
let patientsCache = [];
let visitsCache = [];
let transactionsCache = [];
let reportsCache = [];
let profilesCache = [];
let closedDaysCache = [];

let activeVisitBooking = null;
let visitModalEl = null;
let visitModalInstance = null;
let visitModalListenerBound = false;

// =========================
// Helpers
// =========================
function toNum(v) {
  return Number(v) || 0;
}

function isDoctor() {
  return currentRole === "doctor";
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function monthStartStr(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
}

function money(v) {
  return `${Number(v || 0).toFixed(0)} ج`;
}

function normalizeDate(value) {
  return value ? String(value).slice(0, 10) : "";
}

function showSection(sectionId) {
  document.querySelectorAll(".tab-section").forEach((el) => el.classList.remove("active"));
  document.getElementById(sectionId)?.classList.add("active");

  document.querySelectorAll(".sidebar .nav-link[data-tab]").forEach((link) =>
    link.classList.remove("active")
  );
  document
    .querySelector(`.sidebar .nav-link[data-tab="${sectionId}"]`)
    ?.classList.add("active");
}

function setRoleVisibility(role) {
  document.querySelectorAll(".doctor-only").forEach((el) => {
    el.classList.toggle("d-none-role", role !== "doctor");
  });
}

function updateGlobalStatusUI() {
  if (!globalStatus) return;

  const isOpen = String(openCloseSelect?.value || "true") === "true";
  globalStatus.textContent = isOpen ? "Open" : "Closed";
  globalStatus.className = "badge " + (isOpen ? "badge-open" : "badge-closed");
}

function currentDailyMax() {
  const n = parseInt(dailyMaxInput?.value || "12", 10);
  return Number.isFinite(n) && n > 0 ? n : 12;
}

function updateTodayLoadUI(todayCount, dailyMax) {
  if (!todayLoadBadge || !todayStatIcon) return;

  todayLoadBadge.classList.remove("status-low", "status-mid", "status-full");
  todayStatIcon.classList.remove("icon-success", "icon-warning", "icon-danger");

  const ratio = dailyMax > 0 ? todayCount / dailyMax : 0;

  if (todayCount >= dailyMax) {
    todayLoadBadge.classList.add("status-full");
    todayLoadBadge.textContent = "مكتمل";
    todayStatIcon.classList.add("icon-danger");
  } else if (ratio >= 0.75) {
    todayLoadBadge.classList.add("status-mid");
    todayLoadBadge.textContent = "مرتفع";
    todayStatIcon.classList.add("icon-warning");
  } else {
    todayLoadBadge.classList.add("status-low");
    todayLoadBadge.textContent = "منخفض";
    todayStatIcon.classList.add("icon-success");
  }
}

function fillSelect(selectEl, items, placeholder, mapper) {
  if (!selectEl) return;

  selectEl.innerHTML = `<option value="" selected disabled>${placeholder}</option>`;
  items.forEach((item) => {
    const opt = document.createElement("option");
    const mapped = mapper(item);
    opt.value = mapped.value;
    opt.textContent = mapped.text;
    selectEl.appendChild(opt);
  });
}

function fillServiceSelects() {
  fillSelect(manualService, servicesCache, "الخدمة", (s) => ({
    value: s.id,
    text: `${s.name}${Number(s.price || 0) > 0 ? ` - ${Number(s.price).toFixed(0)} ج` : ""}`
  }));

  fillSelect(visitServiceSelect, servicesCache, "الخدمة", (s) => ({
    value: s.id,
    text: `${s.name}${Number(s.price || 0) > 0 ? ` - ${Number(s.price).toFixed(0)} ج` : ""}`
  }));
}

function fillPatientSelect() {
  fillSelect(visitPatientSelect, patientsCache, "المريض", (p) => ({
    value: p.id,
    text: `${p.name} - ${p.phone}`
  }));
}

function setDefaultInputs() {
  if (txDate) txDate.value = todayStr();
  if (manualDate) manualDate.value = todayStr();
  if (monthPicker) monthPicker.value = todayStr();
  if (openCloseSelect) openCloseSelect.value = "true";
  if (dailyMaxInput) dailyMaxInput.value = "12";
  if (visitPaymentStatus) visitPaymentStatus.value = "paid";
  if (visitType) configureVisitTypeSelect(visitType);
  if (txType) txType.value = "income";
  if (serviceCategory) serviceCategory.value = "checkup";
}

function showApp(profile) {
  currentProfile = profile;
  currentRole = profile.role || null;

  if (profileName) profileName.textContent = profile.full_name || (profile.role === "doctor" ? "الدكتور" : "المساعد");
  if (profileRole) profileRole.textContent = profile.role === "doctor" ? "دكتور" : "مساعد";

  setRoleVisibility(profile.role);
  loginSection?.classList.add("d-none");
  adminApp?.classList.remove("d-none");
}

function showLogin() {
  loginSection?.classList.remove("d-none");
  adminApp?.classList.add("d-none");
}

function unlock(role) {
  currentRole = role;
  currentProfile = {
    full_name: role === "doctor" ? "الدكتور" : "المساعد",
    role,
    active: true
  };

  sessionStorage.setItem(AUTH_STORAGE_KEY, "1");
  sessionStorage.setItem(ROLE_STORAGE_KEY, role);

  showApp(currentProfile);
}

function lock() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(ROLE_STORAGE_KEY);
  currentProfile = null;
  currentRole = null;
  showLogin();
}

async function login(email, password) {
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

async function logout() {
  await supabaseClient.auth.signOut();
  lock();
}

// =========================
// Settings / Closed Days
// =========================
async function loadSettings() {
  const { data, error } = await supabaseClient.from("settings").select("key,value");
  if (error) throw error;

  const map = Object.fromEntries((data || []).map((x) => [x.key, x.value]));
  if (openCloseSelect) openCloseSelect.value = String(map.is_open ?? "true");
  if (dailyMaxInput) dailyMaxInput.value = map.daily_max ?? "12";
  updateGlobalStatusUI();
}

async function saveSettings() {
  const values = [
    { key: "is_open", value: String(openCloseSelect?.value === "true") },
    { key: "daily_max", value: String(currentDailyMax()) }
  ];

  const { error } = await supabaseClient.from("settings").upsert(values, { onConflict: "key" });
  if (error) {
    console.error(error);
    alert("تعذر حفظ الإعدادات");
    return;
  }

  alert("تم حفظ الإعدادات ✅");
  await loadSettings();
  await refreshDashboard();
}

async function fetchClosedDays() {
  let res = await supabaseClient
    .from("closed_days")
    .select("*")
    .order("date", { ascending: false });

  if (res.error) {
    res = await supabaseClient
      .from("closed_days")
      .select("*")
      .order("day_date", { ascending: false });
  }

  if (res.error) {
    console.error("closed_days:", res.error);
    closedDaysCache = [];
  } else {
    closedDaysCache = res.data || [];
  }

  if (closedDaysList) {
    closedDaysList.innerHTML = "";

    if (!closedDaysCache.length) {
      closedDaysList.innerHTML = `<li class="justify-content-center text-muted">لا توجد أيام مغلقة</li>`;
    } else {
      closedDaysCache.forEach((row) => {
        const dayValue = row.date ?? row.day_date ?? "";
        const li = document.createElement("li");
        li.innerHTML = `
          <span>${dayValue}</span>
          <div class="d-flex gap-2 align-items-center">
            <span class="badge badge-closed">مغلق</span>
            <button class="btn btn-sm btn-link text-success p-0" data-open-day="${row.id}">فتح اليوم</button>
          </div>
        `;
        closedDaysList.appendChild(li);
      });

      closedDaysList.querySelectorAll("[data-open-day]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const { error } = await supabaseClient
            .from("closed_days")
            .delete()
            .eq("id", Number(btn.dataset.openDay));

          if (error) {
            console.error(error);
            alert("تعذر فتح اليوم");
            return;
          }

          await loadClosedDays();
        });
      });
    }
  }

  if (closedDaysCountEl) closedDaysCountEl.textContent = closedDaysCache.length;
}

async function loadClosedDays() {
  await fetchClosedDays();
}

async function addClosedDay() {
  const date = closedDateInput?.value;
  if (!date) return;

  try {
    const { error } = await supabaseClient.from("closed_days").insert([{ date }]);
    if (error) throw error;

    if (closedDateInput) closedDateInput.value = "";
    await loadClosedDays();
  } catch (err) {
    console.error(err);
    alert("تعذر إضافة اليوم المغلق");
  }
}

// =========================
// Services
// =========================
async function loadServices() {
  const { data, error } = await supabaseClient
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;

  servicesCache = data || [];
  if (servicesCountEl) servicesCountEl.textContent = servicesCache.length;
  renderServices();
  fillServiceSelects();
}

function renderServices() {
  if (!servicesTable) return;

  servicesTable.innerHTML = "";
  if (!servicesCache.length) {
    servicesTable.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">لا توجد خدمات</td></tr>`;
    return;
  }

  servicesCache.forEach((s) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.name}</td>
      <td>${s.category}</td>
      <td>${money(s.price)}</td>
      <td><span class="badge ${s.active ? "badge-open" : "badge-closed"}">${s.active ? "نشط" : "موقوف"}</span></td>
      <td class="table-actions">
        <button class="btn btn-sm btn-outline-primary me-1" data-service-edit="${s.id}">تعديل</button>
        <button class="btn btn-sm btn-outline-danger" data-service-delete="${s.id}">حذف</button>
      </td>
    `;
    servicesTable.appendChild(tr);
  });

  servicesTable.querySelectorAll("[data-service-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("حذف الخدمة؟")) return;
      const id = Number(btn.dataset.serviceDelete);

      const { error } = await supabaseClient.from("services").delete().eq("id", id);
      if (error) {
        console.error(error);
        alert("تعذر حذف الخدمة");
        return;
      }

      await loadServices();
    });
  });

  servicesTable.querySelectorAll("[data-service-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const s = servicesCache.find((x) => Number(x.id) === Number(btn.dataset.serviceEdit));
      if (!s) return;

      serviceId.value = s.id;
      serviceName.value = s.name;
      serviceCategory.value = s.category;
      servicePrice.value = s.price;
      serviceSort.value = s.sort_order;
      showSection("services");
    });
  });
}

async function saveService(e) {
  e.preventDefault();

  const payload = {
    name: (serviceName?.value || "").trim(),
    category: serviceCategory?.value || "checkup",
    price: Number(servicePrice?.value || 0),
    sort_order: Number(serviceSort?.value || 0),
    active: true
  };

  if (!payload.name) {
    alert("اكتب اسم الخدمة");
    return;
  }

  try {
    const req = serviceId?.value
      ? supabaseClient.from("services").update(payload).eq("id", Number(serviceId.value))
      : supabaseClient.from("services").insert([payload]);

    const { error } = await req;
    if (error) throw error;

    if (serviceForm) serviceForm.reset();
    if (serviceId) serviceId.value = "";
    if (serviceCategory) serviceCategory.value = "checkup";
    if (servicePrice) servicePrice.value = 0;
    if (serviceSort) serviceSort.value = 0;

    await loadServices();
    await refreshDashboard();
    alert("تم حفظ الخدمة ✅");
  } catch (err) {
    console.error(err);
    alert("تعذر حفظ الخدمة");
  }
}

function resetServiceForm() {
  if (serviceForm) serviceForm.reset();
  if (serviceId) serviceId.value = "";
  if (serviceCategory) serviceCategory.value = "checkup";
  if (servicePrice) servicePrice.value = 0;
  if (serviceSort) serviceSort.value = 0;
}

async function addServiceFromQuickInput() {
  const name = (newServiceInput?.value || "").trim();
  if (!name) return;

  try {
    const { error } = await supabaseClient.from("services").insert([
      {
        name,
        category: "other",
        price: 0,
        active: true,
        sort_order: servicesCache.length + 1
      }
    ]);

    if (error) throw error;

    if (newServiceInput) newServiceInput.value = "";
    await loadServices();
  } catch (err) {
    console.error(err);
    alert("تعذر إضافة الخدمة");
  }
}

// =========================
// Bookings
// =========================
function sortBookings(list) {
  return [...list].sort((a, b) => {
    const dateCompare = String(a.date || "").localeCompare(String(b.date || ""));
    if (dateCompare !== 0) return dateCompare;

    const orderCompare = Number(a.sort_order || 0) - Number(b.sort_order || 0);
    if (orderCompare !== 0) return orderCompare;

    return Number(a.booking_number || 0) - Number(b.booking_number || 0);
  });
}

async function getNextSortOrderForDate(dateStr) {
  const { count, error } = await supabaseClient
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("date", dateStr)
    .neq("status", "cancelled");

  if (error) throw error;
  return Number(count || 0) + 1;
}

async function ensurePatientExists(name, phone) {
  const { data: existing, error: findError } = await supabaseClient
    .from("patients")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return existing;

  const { data: inserted, error } = await supabaseClient
    .from("patients")
    .insert([
      {
        name,
        phone,
        visits_count: 0
      }
    ])
    .select("*")
    .single();

  if (error) throw error;
  return inserted;
}

async function syncPatientAfterVisit(patient, visitDate) {
  if (!patient?.id) return;

  const { error } = await supabaseClient
    .from("patients")
    .update({
      name: patient.name || patient.full_name || "",
      last_visit_date: visitDate,
      visits_count: toNum(patient.visits_count) + 1
    })
    .eq("id", patient.id);

  if (error) throw error;
}

async function fetchBookings() {
  const { data, error } = await supabaseClient
    .from("bookings")
    .select("*")
    .order("date", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("booking_number", { ascending: true });

  if (error) {
    console.error("bookings:", error);
    bookingsCache = [];
  } else {
    bookingsCache = sortBookings(data || []);
  }

  populateDayFilter();
  renderBookings(bookingsCache);
  updateDashboardStats();
}

function renderBookings(rows) {
  if (!bookingsTable) return;
  bookingsTable.innerHTML = "";

  if (!rows.length) {
    bookingsTable.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">لا توجد حجوزات</td></tr>`;
    return;
  }

  rows.forEach((b) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="fw-bold">#${b.booking_number ?? "-"}</td>
      <td>${b.name ?? ""}</td>
      <td>${b.phone ?? ""}</td>
      <td>${b.service ?? ""}</td>
      <td>${b.date ?? ""}</td>
      <td><span class="badge ${b.status === "done" ? "text-bg-success" : b.status === "cancelled" ? "text-bg-danger" : "text-bg-secondary"}">${b.status ?? "pending"}</span></td>
      <td class="table-actions">
        <button class="btn btn-sm btn-outline-primary me-1" data-booking-done="${b.id}">تم</button>
        <button class="btn btn-sm btn-outline-secondary me-1" data-booking-up="${b.id}">↑</button>
        <button class="btn btn-sm btn-outline-secondary me-1" data-booking-down="${b.id}">↓</button>
        <button class="btn btn-sm btn-outline-danger" data-booking-delete="${b.id}">حذف</button>
      </td>
    `;
    bookingsTable.appendChild(tr);
  });

  bookingsTable.querySelectorAll("[data-booking-done]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.dataset.bookingDone);
      await openVisitModalForBooking(id);
    });
  });

  bookingsTable.querySelectorAll("[data-booking-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("حذف الحجز؟")) return;
      const id = Number(btn.dataset.bookingDelete);

      const { error } = await supabaseClient.from("bookings").delete().eq("id", id);
      if (error) {
        console.error(error);
        alert("تعذر حذف الحجز");
        return;
      }

      await loadAll();
    });
  });

  bookingsTable.querySelectorAll("[data-booking-up]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await moveBooking(Number(btn.dataset.bookingUp), "up");
    });
  });

  bookingsTable.querySelectorAll("[data-booking-down]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await moveBooking(Number(btn.dataset.bookingDown), "down");
    });
  });
}

function populateDayFilter() {
  if (!dayFilter) return;

  const uniqueDates = [...new Set(bookingsCache.map((b) => normalizeDate(b.date)).filter(Boolean))]
    .sort()
    .reverse();

  const current = dayFilter.value;
  dayFilter.innerHTML = `<option value="">كل الأيام</option>`;

  uniqueDates.forEach((d) => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    dayFilter.appendChild(opt);
  });

  if (uniqueDates.includes(current)) dayFilter.value = current;
}

function filterBookingsCache() {
  const search = (searchInput?.value || "").trim().toLowerCase();
  const date = dayFilter?.value || "";

  const filtered = bookingsCache.filter((b) => {
    const name = String(b.name || "").toLowerCase();
    const phone = String(b.phone || "");
    const service = String(b.service || "").toLowerCase();
    const bookingNumber = String(b.booking_number || "");

    const matchSearch =
      !search ||
      name.includes(search) ||
      phone.includes(search) ||
      service.includes(search) ||
      bookingNumber.includes(search);

    const matchDate = !date || normalizeDate(b.date) === date;
    return matchSearch && matchDate;
  });

  renderBookings(filtered);
}

searchInput?.addEventListener("input", filterBookingsCache);
dayFilter?.addEventListener("change", filterBookingsCache);

async function moveBooking(bookingId, direction) {
  const currentIndex = bookingsCache.findIndex((b) => Number(b.id) === Number(bookingId));
  if (currentIndex === -1) return;

  const currentBooking = bookingsCache[currentIndex];
  const currentDate = normalizeDate(currentBooking.date);

  const sameDayBookings = bookingsCache
    .filter((b) => normalizeDate(b.date) === currentDate)
    .sort((a, b) => {
      const orderDiff = Number(a.sort_order || 0) - Number(b.sort_order || 0);
      if (orderDiff !== 0) return orderDiff;
      return Number(a.booking_number || 0) - Number(b.booking_number || 0);
    });

  const localIndex = sameDayBookings.findIndex((b) => Number(b.id) === Number(bookingId));
  if (localIndex === -1) return;

  const swapIndex = direction === "up" ? localIndex - 1 : localIndex + 1;
  if (swapIndex < 0 || swapIndex >= sameDayBookings.length) return;

  const a = sameDayBookings[localIndex];
  const b = sameDayBookings[swapIndex];

  const aOrder = Number(a.sort_order || 0);
  const bOrder = Number(b.sort_order || 0);

  const { error: errorA } = await supabaseClient
    .from("bookings")
    .update({ sort_order: bOrder })
    .eq("id", a.id);

  if (errorA) {
    console.error(errorA);
    alert("تعذر إعادة الترتيب");
    return;
  }

  const { error: errorB } = await supabaseClient
    .from("bookings")
    .update({ sort_order: aOrder })
    .eq("id", b.id);

  if (errorB) {
    console.error(errorB);
    alert("تعذر إعادة الترتيب");
    return;
  }

  await fetchBookings();
}

async function manualBookingSubmit(e) {
  e.preventDefault();

  const name = (manualName?.value || "").trim();
  const phone = (manualPhone?.value || "").trim();
  const date = manualDate?.value || "";
  const serviceIdValue = Number(manualService?.value || 0);
  const service = servicesCache.find((s) => Number(s.id) === serviceIdValue);

  if (!name || !phone || !date || !service) {
    alert("املأ البيانات كاملة");
    return;
  }

  if (new Date(date).getDay() === 0) {
    alert("الأحد إجازة");
    return;
  }

  const sort_order = await getNextSortOrderForDate(date);

  try {
    await ensurePatientExists(name, phone);

    console.log({
      name,
      phone,
      service_id: service.id,
      service: service.name,
      service_price: service.price,
      date,
      status: "pending",
      sort_order
    });

    const { error } = await supabaseClient.from("bookings").insert([
      {
        name,
        phone,
        service_id: service.id,
        service: service.name,
        service_price: Number(service.price || 0),
        date,
        status: "pending",
        sort_order
      }
    ]);

    if (error) throw error;

    if (manualBookingForm) manualBookingForm.reset();
    if (manualDate) manualDate.value = todayStr();

    await loadAll();
    alert("تم حفظ الحجز ✅");
  } catch (err) {
    console.error("BOOKING ERROR", err);
    console.error(err);
    alert("تعذر حفظ الحجز");
    alert(JSON.stringify(err, null, 2));
  }
}

// =========================
// Patients
// =========================
async function fetchPatients() {
  let res = await supabaseClient
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });

  if (res.error) {
    res = await supabaseClient
      .from("patients")
      .select("*")
      .order("id", { ascending: false });
  }

  if (res.error) {
    console.error("patients:", res.error);
    patientsCache = [];
  } else {
    patientsCache = res.data || [];
  }

  fillPatientSelect();
  renderPatients();
}

function renderPatients() {
  if (!patientsTable) return;
  patientsTable.innerHTML = "";

  if (!patientsCache.length) {
    patientsTable.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">لا يوجد مرضى</td></tr>`;
    return;
  }

  patientsCache.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.name ?? ""}</td>
      <td>${p.phone ?? ""}</td>
      <td>${p.last_visit_date ?? "-"}</td>
      <td>${p.visits_count ?? 0}</td>
      <td>${p.notes ?? "-"}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger" data-patient-delete="${p.id}">حذف</button>
      </td>
    `;
    patientsTable.appendChild(tr);
  });

  patientsTable.querySelectorAll("[data-patient-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("حذف المريض؟")) return;

      const { error } = await supabaseClient
        .from("patients")
        .delete()
        .eq("id", Number(btn.dataset.patientDelete));

      if (error) {
        console.error(error);
        alert("تعذر حذف المريض");
        return;
      }

      await loadPatients();
    });
  });
}

async function savePatient(e) {
  e.preventDefault();

  const payload = {
    name: (patientName?.value || "").trim(),
    phone: (patientPhone?.value || "").trim(),
    notes: (patientNotes?.value || "").trim() || null
  };

  if (!payload.name || !payload.phone) {
    alert("املأ بيانات المريض");
    return;
  }

  try {
    const { error } = await supabaseClient.from("patients").upsert([payload], { onConflict: "phone" });
    if (error) throw error;

    if (patientForm) patientForm.reset();
    await loadPatients();
    alert("تم حفظ المريض ✅");
  } catch (err) {
    console.error(err);
    alert("تعذر حفظ المريض");
  }
}

async function loadPatients() {
  await fetchPatients();
}

// =========================
// Visits
// =========================
async function fetchVisits() {
  let res = await supabaseClient
    .from("visits")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (res.error) {
    res = await supabaseClient
      .from("visits")
      .select("*")
      .order("id", { ascending: false });
  }

  if (res.error) {
    console.error("visits:", res.error);
    visitsCache = [];
  } else {
    visitsCache = res.data || [];
  }

  renderVisits();
}

function renderVisits() {
  if (!visitsTable) return;
  visitsTable.innerHTML = "";

  if (!visitsCache.length) {
    visitsTable.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">لا توجد زيارات</td></tr>`;
    return;
  }

  visitsCache.forEach((v) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${v.date ?? v.visit_date ?? "-"}</td>
      <td>${v.patient_name ?? "-"}</td>
      <td>${v.service ?? "-"}</td>
      <td>${visitTypeLabel(v.visit_type)}</td>
      <td>${money(v.amount ?? v.total_amount)}</td>
      <td><span class="badge ${v.payment_status === "paid" ? "text-bg-success" : v.payment_status === "partial" ? "text-bg-warning" : "text-bg-secondary"}">${v.payment_status ?? "unpaid"}</span></td>
      <td>${v.notes ?? "-"}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger" data-visit-delete="${v.id}">حذف</button>
      </td>
    `;
    visitsTable.appendChild(tr);
  });

  visitsTable.querySelectorAll("[data-visit-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("حذف الزيارة؟")) return;

      const { error } = await supabaseClient
        .from("visits")
        .delete()
        .eq("id", Number(btn.dataset.visitDelete));

      if (error) {
        console.error(error);
        alert("تعذر حذف الزيارة");
        return;
      }

      await loadVisits();
    });
  });
}

async function loadVisits() {
  await fetchVisits();
}

function ensureVisitModal() {
  if (visitModalEl) return visitModalEl;

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div class="modal fade" id="visitCompleteModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 rounded-4">
          <div class="modal-header">
            <div>
              <h5 class="modal-title fw-bold mb-1">إتمام الزيارة</h5>
              <div class="small text-muted" id="visitModalBookingInfo">-</div>
            </div>
            <button type="button" class="btn-close ms-0" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body">
            <div class="row g-4">
              <div class="col-lg-5">
                <label class="form-label fw-semibold">نوع الزيارة</label>
                <select id="visitModalType" class="form-select mb-3"></select>

                <label class="form-label fw-semibold">ملاحظات</label>
                <textarea id="visitModalNotes" class="form-control mb-3" rows="5" placeholder="أي تفاصيل عن الحالة أو ما تم عمله..."></textarea>

                <div class="p-3 bg-light rounded-4">
                  <div class="small text-muted mb-1">الإجمالي</div>
                  <div class="h4 fw-bold mb-0" id="visitModalTotal">0 ج</div>
                </div>
              </div>

              <div class="col-lg-7">
                <label class="form-label fw-semibold">الخدمات المنفذة</label>
                <div id="visitModalServices" style="max-height: 420px; overflow:auto;"></div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">إلغاء</button>
            <button type="button" class="btn btn-primary" id="visitModalSaveBtn">حفظ الزيارة</button>
          </div>
        </div>
      </div>
    </div>
  `
  );

  visitModalEl = document.getElementById("visitCompleteModal");
  const saveBtn = document.getElementById("visitModalSaveBtn");
  const typeSelect = document.getElementById("visitModalType");
  const servicesWrap = document.getElementById("visitModalServices");

  configureVisitTypeSelect(typeSelect);

  if (servicesWrap && !visitModalListenerBound) {
    servicesWrap.addEventListener("change", updateVisitModalTotal);
    servicesWrap.addEventListener("input", updateVisitModalTotal);
    visitModalListenerBound = true;
  }

  saveBtn?.addEventListener("click", (e) => saveVisitFromModal(e));

  visitModalInstance = new bootstrap.Modal(visitModalEl);
  return visitModalEl;
}

function renderVisitServices(selectedServiceIds = []) {
  const servicesWrap = document.getElementById("visitModalServices");
  if (!servicesWrap) return;

  if (!servicesCache.length) {
    servicesWrap.innerHTML = `
      <div class="alert alert-warning mb-0">
        لا توجد خدمات. أضف الخدمات أولاً من تبويب الخدمات.
      </div>
    `;
    return;
  }

  servicesWrap.innerHTML = servicesCache
    .map((service) => {
      const checked = selectedServiceIds.includes(Number(service.id)) ? "checked" : "";
      return `
      <div class="border rounded-4 p-3 mb-2 bg-white visit-service-row" data-service-id="${service.id}">
        <div class="d-flex align-items-start justify-content-between gap-3">
          <label class="d-flex align-items-start gap-2 m-0 flex-grow-1">
            <input type="checkbox" class="form-check-input visit-service-check mt-1" data-service-id="${service.id}" ${checked}>
            <div>
              <div class="fw-bold">${service.name}</div>
              <div class="small text-muted">${service.category || "other"} • ${money(service.price || 0)}</div>
            </div>
          </label>

          <div style="width: 92px;">
            <label class="form-label small mb-1">الكمية</label>
            <input type="number" min="1" value="1" class="form-control form-control-sm visit-service-qty" data-service-id="${service.id}">
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  updateVisitModalTotal();
}

function getSelectedVisitServices() {
  const servicesWrap = document.getElementById("visitModalServices");
  if (!servicesWrap) return [];

  const selected = [];

  servicesWrap.querySelectorAll(".visit-service-row").forEach((row) => {
    const serviceIdValue = Number(row.dataset.serviceId);
    const checkbox = row.querySelector(".visit-service-check");
    const qtyInput = row.querySelector(".visit-service-qty");
    const service = servicesCache.find((s) => Number(s.id) === serviceIdValue);

    if (!checkbox?.checked || !service) return;

    const qty = Math.max(1, Number(qtyInput?.value || 1));

    selected.push({
      id: service.id,
      name: service.name,
      price: Number(service.price || 0),
      qty,
      category: service.category || "other",
      lineTotal: Number(service.price || 0) * qty
    });
  });

  return selected;
}

function updateVisitModalTotal() {
  const totalEl = document.getElementById("visitModalTotal");
  if (!totalEl) return 0;

  const total = getSelectedVisitServices().reduce((sum, item) => sum + item.lineTotal, 0);
  totalEl.textContent = money(total);
  return total;
}

async function openVisitModalForBooking(bookingId) {
  const booking = bookingsCache.find((b) => Number(b.id) === Number(bookingId));
  if (!booking) {
    alert("الحجز غير موجود");
    return;
  }

  activeVisitBooking = booking;
  ensureVisitModal();

  const info = document.getElementById("visitModalBookingInfo");
  const typeSelect = document.getElementById("visitModalType");
  const notesInput = document.getElementById("visitModalNotes");

  if (info) {
    info.textContent = `#${booking.booking_number || "-"} | ${booking.name || ""} | ${booking.phone || ""} | ${booking.date || ""}`;
  }

  if (typeSelect) typeSelect.value = "checkup";
  if (notesInput) notesInput.value = "";

  const defaultServiceIds = [];
  if (booking.service_id) defaultServiceIds.push(Number(booking.service_id));

  renderVisitServices(defaultServiceIds);
  visitModalInstance?.show();
  updateVisitModalTotal();
}

async function saveVisitFromModal(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (!activeVisitBooking) return;

  const typeSelect = document.getElementById("visitModalType");
  const notesInput = document.getElementById("visitModalNotes");
  const saveBtn = document.getElementById("visitModalSaveBtn");

  const selectedServices = getSelectedVisitServices();

  if (!selectedServices.length) {
    alert("اختار خدمة واحدة على الأقل");
    return;
  }

  const visitTypeValue = normalizeVisitType(typeSelect?.value || "checkup");
  const notesValue = notesInput?.value?.trim() || null;
  const totalAmount = selectedServices.reduce((sum, item) => sum + item.lineTotal, 0);

  saveBtn.disabled = true;
  const originalText = saveBtn.innerHTML;
  saveBtn.innerHTML = "جاري الحفظ...";

  try {
    const visitDate = todayStr();

    const patient = await ensurePatientExists(
      activeVisitBooking.name || "",
      activeVisitBooking.phone || ""
    );

    const serviceSummary = selectedServices
      .map((item) => `${item.name}${item.qty > 1 ? ` x${item.qty}` : ""}`)
      .join(" + ");

    const { data: visitRow, error: visitError } = await supabaseClient
      .from("visits")
      .insert([
        {
          booking_id: activeVisitBooking.id,
          patient_id: patient?.id || null,
          patient_name: activeVisitBooking.name || "",
          service_id: selectedServices[0]?.id || null,
          service: serviceSummary,
          date: visitDate,
          visit_date: visitDate,
          visit_type: visitTypeValue,
          amount: totalAmount,
          total_amount: totalAmount,
          payment_status: "paid",
          notes: notesValue,
          status: "done"
        }
      ])
      .select()
      .single();

    if (visitError) throw visitError;

    const visitItems = selectedServices.map((item) => ({
      visit_id: visitRow.id,
      service_id: item.id,
      service_name: item.name,
      service_price: item.price,
      quantity: item.qty,
      line_total: item.lineTotal
    }));

    const { error: itemsError } = await supabaseClient
      .from("visit_items")
      .insert(visitItems);

    if (itemsError) throw itemsError;

    const { error: bookingUpdateError } = await supabaseClient
      .from("bookings")
      .update({
        status: "done",
        service_price: totalAmount
      })
      .eq("id", activeVisitBooking.id);

    if (bookingUpdateError) throw bookingUpdateError;

    await syncPatientAfterVisit(patient, visitDate);

    const txNote = [
      `زيارة: ${activeVisitBooking.name || ""}`,
      `الخدمات: ${selectedServices.map((x) => `${x.name} x${x.qty}`).join(" | ")}`
    ].join(" - ");

    const { error: txError } = await supabaseClient
      .from("transactions")
      .insert([
        {
          tx_date: visitDate,
          tx_type: "income",
          category: visitTypeValue,
          amount: totalAmount,
          note: txNote,
          booking_id: activeVisitBooking.id,
          visit_id: visitRow.id
        }
      ]);

    if (txError) throw txError;

    await loadAll();

    visitModalInstance?.hide();
    activeVisitBooking = null;

    alert("تم حفظ الزيارة وتسجيلها في الحسابات ✅");
  } catch (err) {
    console.error("SAVE VISIT ERROR:", err);
    alert("حصل خطأ أثناء حفظ الزيارة");
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = originalText;
  }
}

async function saveManualVisit(e) {
  e.preventDefault();
  e.stopPropagation();

  const patientId = Number(visitPatientSelect?.value || 0);
  const serviceIdValue = Number(visitServiceSelect?.value || 0);
  const patient = patientsCache.find((p) => Number(p.id) === patientId);
  const service = servicesCache.find((s) => Number(s.id) === serviceIdValue);

  if (!patient) {
    alert("اختار المريض");
    return;
  }

  if (!service) {
    alert("اختار الخدمة");
    return;
  }

  const visitTypeValue = normalizeVisitType(visitType?.value || "checkup");
  const amount = toNum(visitAmount?.value || service.price || 0);
  const paymentStatusValue = visitPaymentStatus?.value || "paid";
  const notesValue = visitNotes?.value?.trim() || null;
  const visitDate = todayStr();

  const submitBtn =
    visitForm?.querySelector('button[type="submit"]') ||
    visitForm?.querySelector("button");

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.dataset.originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = "جاري الحفظ...";
  }

  try {
    const { data: visitRow, error: visitError } = await supabaseClient
      .from("visits")
      .insert([
        {
          patient_id: patient.id,
          patient_name: patient.name || "",
          service_id: service.id,
          service: service.name,
          date: visitDate,
          visit_date: visitDate,
          visit_type: visitTypeValue,
          amount,
          total_amount: amount,
          payment_status: paymentStatusValue,
          notes: notesValue,
          status: "done"
        }
      ])
      .select()
      .single();

    if (visitError) throw visitError;

    await syncPatientAfterVisit(patient, visitDate);

    if (amount > 0) {
      const { error: txError } = await supabaseClient.from("transactions").insert([
        {
          tx_date: visitDate,
          tx_type: "income",
          category: visitTypeValue,
          amount,
          note: `زيارة يدوية: ${patient.name || ""} - ${service.name}`,
          visit_id: visitRow.id
        }
      ]);

      if (txError) throw txError;
    }

    if (visitForm) visitForm.reset();
    if (visitType) visitType.value = "checkup";
    if (visitPaymentStatus) visitPaymentStatus.value = "paid";
    if (visitAmount) visitAmount.value = 0;
    if (visitNotes) visitNotes.value = "";

    await loadAll();
    alert("تم حفظ الزيارة ✅");
  } catch (err) {
    console.error("MANUAL VISIT ERROR:", err);
    alert("حصل خطأ أثناء حفظ الزيارة");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      if (submitBtn.dataset.originalText) {
        submitBtn.innerHTML = submitBtn.dataset.originalText;
        delete submitBtn.dataset.originalText;
      }
    }
  }
}

// =========================
// Transactions / Reports / Profiles
// =========================
async function fetchTransactions() {
  if (!transactionsTable) return;

  const { data, error } = await supabaseClient
    .from("transactions")
    .select("*")
    .order("tx_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("transactions:", error);
    transactionsCache = [];
    transactionsTable.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">تعذر تحميل الحركات المالية</td></tr>`;
    return;
  }

  transactionsCache = data || [];
  renderTransactions();
}

function renderTransactions() {
  if (!transactionsTable) return;

  transactionsTable.innerHTML = "";

  if (!transactionsCache.length) {
    transactionsTable.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">لا توجد حركات مالية</td></tr>`;
    return;
  }

  transactionsCache.forEach((t) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.tx_date || "-"}</td>
      <td><span class="badge ${t.tx_type === "income" ? "text-bg-success" : "text-bg-danger"}">${t.tx_type === "income" ? "إيراد" : "مصروف"}</span></td>
      <td>${visitTypeLabel(t.category) !== "-" ? visitTypeLabel(t.category) : (t.category || "-")}</td>
      <td>${money(t.amount)}</td>
      <td>${t.note || "-"}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger" data-tx-delete="${t.id}">حذف</button>
      </td>
    `;
    transactionsTable.appendChild(tr);
  });

  transactionsTable.querySelectorAll("[data-tx-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("حذف الحركة؟")) return;

      const { error } = await supabaseClient
        .from("transactions")
        .delete()
        .eq("id", Number(btn.dataset.txDelete));

      if (error) {
        console.error(error);
        alert("تعذر حذف الحركة");
        return;
      }

      await loadTransactions();
      await fetchDashboardSummary();
      await fetchMonthlyRevenue();
    });
  });
}

async function loadTransactions() {
  await fetchTransactions();
}

async function fetchReports() {
  if (!dailyReportsTable) return;

  const { data, error } = await supabaseClient
    .from("daily_reports")
    .select("*")
    .order("report_date", { ascending: false })
    .limit(30);

  if (error) {
    console.error("daily_reports:", error);
    reportsCache = [];
    dailyReportsTable.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">تعذر تحميل التقارير</td></tr>`;
    return;
  }

  reportsCache = data || [];
  renderDailyReports();
}

function renderDailyReports() {
  if (!dailyReportsTable) return;
  dailyReportsTable.innerHTML = "";

  if (!reportsCache.length) {
    dailyReportsTable.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">لا توجد تقارير محفوظة</td></tr>`;
    return;
  }

  reportsCache.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.report_date || "-"}</td>
      <td>${r.bookings_count || 0}</td>
      <td>${r.checkups_count || 0}</td>
      <td>${r.sessions_count || 0}</td>
      <td>${money(r.income_total)}</td>
      <td>${money(r.expense_total)}</td>
      <td>${money(r.net_total)}</td>
    `;
    dailyReportsTable.appendChild(tr);
  });
}

async function loadReports() {
  await fetchReports();
}

async function fetchProfiles() {
  if (!profilesTable) return;

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("profiles:", error);
    profilesCache = [];
    profilesTable.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-4">تعذر تحميل الصلاحيات</td></tr>`;
    return;
  }

  profilesCache = data || [];
  renderProfiles();
}

function renderProfiles() {
  if (!profilesTable) return;
  profilesTable.innerHTML = "";

  if (!profilesCache.length) {
    profilesTable.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-4">لا توجد حسابات</td></tr>`;
    return;
  }

  profilesCache.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.full_name || "-"}</td>
      <td>${p.role || "-"}</td>
      <td><span class="badge ${p.active ? "text-bg-success" : "text-bg-secondary"}">${p.active ? "نشط" : "موقوف"}</span></td>
    `;
    profilesTable.appendChild(tr);
  });
}

async function loadProfiles() {
  await fetchProfiles();
}

// =========================
// Dashboard / Summary
// =========================
function calcDashboardSummary() {
  const today = todayStr();
  const dayVisits = visitsCache.filter((v) => normalizeDate(v.date || v.visit_date) === today);
  const dayTransactions = transactionsCache.filter((t) => normalizeDate(t.tx_date) === today);

  const checkups = dayVisits.filter((v) => normalizeVisitType(v.visit_type) === "checkup").length;
  const sessions = dayVisits.filter((v) => normalizeVisitType(v.visit_type) === "session").length;
  const other = Math.max(0, dayVisits.length - checkups - sessions);

  const income = dayTransactions
    .filter((t) => t.tx_type === "income")
    .reduce((sum, t) => sum + toNum(t.amount), 0);

  const expense = dayTransactions
    .filter((t) => t.tx_type === "expense")
    .reduce((sum, t) => sum + toNum(t.amount), 0);

  return {
    bookings_count: dayVisits.length,
    checkups_count: checkups,
    sessions_count: sessions,
    other_count: other,
    income_total: income,
    expense_total: expense,
    net_total: income - expense
  };
}

async function fetchDashboardSummary() {
  const summary = calcDashboardSummary();

  if (totalBookingsEl) totalBookingsEl.textContent = bookingsCache.length;
  if (todayBookingsEl) todayBookingsEl.textContent = summary.bookings_count;
  if (closedDaysCountEl) closedDaysCountEl.textContent = closedDaysCache.length;
  if (servicesCountEl) servicesCountEl.textContent = servicesCache.length;

  if (reportBookingsCount) reportBookingsCount.textContent = summary.bookings_count;
  if (reportCheckupsCount) reportCheckupsCount.textContent = summary.checkups_count;
  if (reportSessionsCount) reportSessionsCount.textContent = summary.sessions_count;
  if (reportOtherCount) reportOtherCount.textContent = summary.other_count;
  if (reportIncome) reportIncome.textContent = money(summary.income_total);
  if (reportExpense) reportExpense.textContent = money(summary.expense_total);
  if (reportNet) reportNet.textContent = money(summary.net_total);

  updateTodayLoadUI(summary.bookings_count, currentDailyMax());
  updateGlobalStatusUI();
}

async function fetchMonthlyRevenue() {
  if (!isDoctor()) return;
  if (!monthBookings || !monthCheckups || !monthIncome || !monthNet) return;

  const selectedMonth = monthPicker?.value || todayStr();
  const start = monthStartStr(selectedMonth);
  const end = new Date(new Date(start).getFullYear(), new Date(start).getMonth() + 1, 1)
    .toISOString()
    .split("T")[0];

  const monthVisitsData = visitsCache.filter((v) => {
    const d = normalizeDate(v.date || v.visit_date);
    return d >= start && d < end;
  });

  const monthTransactionsData = transactionsCache.filter((t) => {
    const d = normalizeDate(t.tx_date);
    return d >= start && d < end;
  });

  const monthCheckupsCount = monthVisitsData.filter(
    (v) => normalizeVisitType(v.visit_type) === "checkup"
  ).length;

  const income = monthTransactionsData
    .filter((t) => t.tx_type === "income")
    .reduce((sum, t) => sum + toNum(t.amount), 0);

  const expense = monthTransactionsData
    .filter((t) => t.tx_type === "expense")
    .reduce((sum, t) => sum + toNum(t.amount), 0);

  if (monthBookings) monthBookings.textContent = monthVisitsData.length;
  if (monthCheckups) monthCheckups.textContent = monthCheckupsCount;
  if (monthIncome) monthIncome.textContent = money(income);
  if (monthNet) monthNet.textContent = money(income - expense);
}

async function refreshDashboard() {
  await loadServices();
  await fetchPatients();
  await fetchVisits();
  await fetchTransactions();
  await fetchBookings();
  await fetchClosedDays();
  await fetchReports();
  await fetchProfiles();
  await fetchDashboardSummary();
  await fetchMonthlyRevenue();
}

async function loadAll() {
  await refreshDashboard();
}

function updateDashboardStats() {
  fetchDashboardSummary().catch(console.error);
}

async function loadBookings() {
  await fetchBookings();
}

// =========================
// Transactions / Snapshot
// =========================
async function saveTransaction(e) {
  e.preventDefault();

  const payload = {
    tx_date: txDate?.value || todayStr(),
    tx_type: txType?.value || "income",
    category: (txCategory?.value || "").trim(),
    amount: Number(txAmount?.value || 0),
    note: (txNote?.value || "").trim() || null
  };

  if (!payload.category || !payload.amount) {
    alert("املأ بيانات الحركة المالية");
    return;
  }

  try {
    const { error } = await supabaseClient.from("transactions").insert([payload]);
    if (error) throw error;

    if (transactionForm) transactionForm.reset();
    if (txDate) txDate.value = todayStr();
    if (txType) txType.value = "income";

    await loadTransactions();
    await fetchDashboardSummary();
    await fetchMonthlyRevenue();
    alert("تم حفظ الحركة ✅");
  } catch (err) {
    console.error(err);
    alert("تعذر حفظ الحركة");
  }
}

async function snapshotToday() {
  const summary = calcDashboardSummary();

  try {
    const { error } = await supabaseClient.from("daily_reports").upsert(
      [
        {
          report_date: todayStr(),
          bookings_count: summary.bookings_count,
          checkups_count: summary.checkups_count,
          sessions_count: summary.sessions_count,
          other_count: summary.other_count,
          income_total: summary.income_total,
          expense_total: summary.expense_total,
          net_total: summary.net_total,
          notes: (dailyReportNotes?.value || "").trim() || null
        }
      ],
      { onConflict: "report_date" }
    );

    if (error) throw error;

    await loadReports();
    alert("تم تسجيل تقرير اليوم ✅");
  } catch (err) {
    console.error(err);
    alert("تعذر تسجيل تقرير اليوم");
  }
}

// =========================
// Events
// =========================
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const entered = (adminPasswordInput?.value || "").trim();

  let email = "";
  let role = "";
  
  if (entered === "taj558dc") {
    email = "doctor@taj.com";
    role = "doctor";
  } else if (entered === "tajdc1010") {
    email = "assistant@taj.com";
    role = "assistant";
  } else {
    alert("كلمة المرور غير صحيحة");
    if (adminPasswordInput) adminPasswordInput.value = "";
    adminPasswordInput?.focus();
    return;
  }

  // تسجيل الدخول الحقيقي من قاعدة البيانات
  const btn = loginForm.querySelector('button');
  const originalText = btn.innerHTML;
  btn.innerHTML = "جاري الدخول...";
  btn.disabled = true;

  try {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: entered
    });

    if (error) throw error;

    unlock(role);
    await loadAll();
  } catch (err) {
    console.error(err);
    alert("تعذر الاتصال بقاعدة البيانات، تأكد من صحة البيانات.");
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
});

logoutBtn?.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  lock();
});

refreshAllBtn?.addEventListener("click", async () => {
  await loadAll();
});

saveSettingsBtn?.addEventListener("click", async () => {
  await saveSettings();
});

closeAllBookingsBtn?.addEventListener("click", async () => {
  if (!confirm("إغلاق كل الحجوزات؟")) return;
  if (openCloseSelect) openCloseSelect.value = "false";
  await saveSettings();
});

addClosedDayBtn?.addEventListener("click", addClosedDay);
addServiceBtn?.addEventListener("click", addServiceFromQuickInput);
serviceForm?.addEventListener("submit", saveService);
resetServiceBtn?.addEventListener("click", resetServiceForm);
patientForm?.addEventListener("submit", savePatient);
transactionForm?.addEventListener("submit", saveTransaction);
manualBookingForm?.addEventListener("submit", manualBookingSubmit);
visitForm?.addEventListener("submit", saveManualVisit);
snapshotTodayBtn?.addEventListener("click", snapshotToday);

monthPicker?.addEventListener("change", async () => {
  await fetchMonthlyRevenue();
});

document.querySelectorAll(".sidebar .nav-link[data-tab]").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const tab = link.dataset.tab;
    showSection(tab);
    if (tab === "monthlyRevenue") fetchMonthlyRevenue().catch(console.error);
  });
});

// expose handlers
window.openVisitModalForBooking = openVisitModalForBooking;
window.moveBooking = moveBooking;
window.addClosedDay = addClosedDay;
window.deleteService = async function (id) {
  if (!confirm("حذف الخدمة؟")) return;
  const { error } = await supabaseClient.from("services").delete().eq("id", Number(id));
  if (error) {
    console.error(error);
    alert("تعذر حذف الخدمة");
    return;
  }
  await loadServices();
};
window.deleteClosedDay = async function (id) {
  const { error } = await supabaseClient.from("closed_days").delete().eq("id", Number(id));
  if (error) {
    console.error(error);
    alert("تعذر فتح اليوم");
    return;
  }
  await loadClosedDays();
};

// =========================
// Boot
// =========================
window.addEventListener("DOMContentLoaded", async () => {
  setDefaultInputs();
  configureVisitTypeSelect(visitType);

  // التحقق من وجود جلسة حقيقية مسجلة في Supabase
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (session) {
    const email = session.user.email;
    const role = email.includes('doctor') ? 'doctor' : 'assistant';
    unlock(role);
    await loadAll();
  } else {
    showLogin();
  }
});