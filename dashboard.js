// ==========================================
// 1. اتصال به سوبابیس و دریافت موجودی و آمار تیم (زیرمجموعه‌ها)
// ==========================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const SUPABASE_URL = 'https://ujyenmqdgivuxvxptwyl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tRJPNKN0KUFfcta6I3xsNw_icShZQhO';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// تابع کمکی برای تولید رقم‌های یکتا بر اساس شناسه کاربر (مشابه فایل تیم)
function generateUIDDigits(userId) {
  if (!userId) return '000000';
  let hash = 5381;
  let str = String(userId);
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return (Math.abs(hash % 900000) + 100000).toString();
}

async function loadDashboardUserData() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      window.location.href = 'index.html';
      return;
    }

    const userId = user.id;

    // ۱. دریافت موجودی و اطلاعات کاربر از جدول profiles یا users
    const { data: dbUser } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
    const { data: dbProfile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    const meta = user.user_metadata || {};

    const balance = parseFloat(dbUser?.balance ?? dbProfile?.balance ?? meta.balance ?? 0);
    const valBalance = document.getElementById('val-balance');
    if (valBalance) {
      valBalance.textContent = `$${balance.toFixed(2)}`;
    }

    // ۲. محاسبه دقیق تعداد زیرمجموعه‌ها (مشابه منطق صفحه تیم)[cite: 6]
    let codeDigits = generateUIDDigits(userId);
    let myRefCode = dbProfile?.referral_code || ('MS-' + codeDigits);

    let rawList = [];
    try {
      const { data: dbProfiles } = await supabase.from('profiles').select('*');
      if (dbProfiles && Array.isArray(dbProfiles)) {
        rawList.push(...dbProfiles);
      }
    } catch(e) {}

    if (meta.team_members || meta.referrals || meta.invited_users) {
      let metaTeam = meta.team_members || meta.referrals || meta.invited_users;
      if (Array.isArray(metaTeam)) rawList.push(...metaTeam);
    }

    ['zenix_registered_users', 'zenix_users', 'zenix_referrals', 'zenix_team_' + userId, 'zenix_all_users'].forEach(k => {
      try {
        let item = localStorage.getItem(k);
        if (item) {
          let parsed = JSON.parse(item);
          if (Array.isArray(parsed)) rawList.push(...parsed);
          else if (parsed && typeof parsed === 'object') rawList.push(parsed);
        }
      } catch(e) {}
    });

    let uniqueMap = new Map();
    rawList.forEach(u => {
      if (u) {
        let key = u.user_id || u.id || u.email || u.username || JSON.stringify(u);
        uniqueMap.set(key, u);
      }
    });
    let allProfiles = Array.from(uniqueMap.values());

    function isReferredBy(u, refUid, refCodeVal) {
      if (!u) return false;
      let uUid = u.user_id || u.id;
      if (uUid === refUid) return false;

      let digits = generateUIDDigits(refUid);
      let defaultCode = 'MS-' + digits;
      let legacyCode = 'SM-' + digits;

      let refs = [
        u.referred_by, u.referrer_id, u.invitation_code,
        u.ref_code, u.inviter, u.referral_code, u.ref
      ].map(x => x ? String(x).trim().toUpperCase() : '');

      const targetCodes = [
        String(refUid).toUpperCase(),
        defaultCode.toUpperCase(),
        legacyCode.toUpperCase(),
        digits.toUpperCase()
      ];
      if (refCodeVal) targetCodes.push(String(refCodeVal).toUpperCase());

      return refs.some(r => r && targetCodes.includes(r));
    }

    let lvl1Users = allProfiles.filter(u => isReferredBy(u, userId, myRefCode));
    let lvl2Users = [];
    if (lvl1Users.length > 0) {
      lvl2Users = allProfiles.filter(u => {
        let uUid = u.user_id || u.id;
        if (uUid === userId || lvl1Users.some(l1 => (l1.user_id || l1.id) === uUid)) return false;
        return lvl1Users.some(l1 => isReferredBy(u, l1.user_id || l1.id, l1.referral_code));
      });
    }

    let lvl3Users = [];
    if (lvl2Users.length > 0) {
      lvl3Users = allProfiles.filter(u => {
        let uUid = u.user_id || u.id;
        if (uUid === userId || lvl1Users.some(l1 => (l1.user_id || l1.id) === uUid) || lvl2Users.some(l2 => (l2.user_id || l2.id) === uUid)) return false;
        return lvl2Users.some(l2 => isReferredBy(u, l2.user_id || l2.id, l2.referral_code));
      });
    }

    let l1Count = lvl1Users.length;
    let l2Count = lvl2Users.length;
    let l3Count = lvl3Users.length;

    if (l1Count === 0 && (meta.referral_count || meta.invited_count)) {
      l1Count = Number(meta.referral_count || meta.invited_count || 0);
    }

    let totalTeamCount = l1Count + l2Count + l3Count;
    const valRef = document.getElementById('val-ref');
    if (valRef) {
      valRef.textContent = totalTeamCount;
    }

  } catch (err) {
    console.error("خطا در دریافت اطلاعات کاربر:", err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadDashboardUserData();
});

// ==========================================
// 2. مدیریت منوی شناور کازینو
// ==========================================
const floatingCasinoBtn = document.getElementById('floating-casino-btn');
const casinoPopupMenu = document.getElementById('casino-popup-menu');

if (floatingCasinoBtn && casinoPopupMenu) {
  floatingCasinoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    casinoPopupMenu.classList.toggle('show');
    closeAllMenus('casino');
  });

  document.addEventListener('click', (e) => {
    if (!casinoPopupMenu.contains(e.target) && e.target !== floatingCasinoBtn) {
      casinoPopupMenu.classList.remove('show');
    }
  });
}

// ==========================================
// 3. مدیریت دکمه‌های هدر
// ==========================================
const menuBtn = document.getElementById('menu-btn');
const navMenu = document.getElementById('nav-menu');
const langBtn = document.getElementById('lang-btn');
const langMenu = document.getElementById('lang-menu');
const helpBtn = document.getElementById('help-btn');
const bellBtn = document.getElementById('bell-btn');

function closeAllMenus(except = '') {
  if (except !== 'nav' && navMenu) navMenu.classList.remove('show');
  if (except !== 'lang' && langMenu) langMenu.classList.remove('show');
  if (except !== 'casino' && casinoPopupMenu) casinoPopupMenu.classList.remove('show');
}

if (menuBtn && navMenu) {
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navMenu.classList.toggle('show');
    closeAllMenus('nav');
  });
}

if (langBtn && langMenu) {
  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langMenu.classList.toggle('show');
    closeAllMenus('lang');
  });
}

// ==========================================
// 4. سیستم ترجمه 8 زبانه
// ==========================================
const translations = {
  fa: {
    m1: "صفحه اصلی", m2: "کوانتیفیکیشن", m3: "واریز", m4: "برداشت", m5: "تراکنش", m6: "پروفایل", m7: "پشتیبانی", m_about: "درباره پلتفرم", m8: "خروج",
    wel: "خوش آمدید", sub: "پنل مدیریت کاربری", st: "تایید شده",
    ts1: "موجودی", ts2: "زیرمجموعه",
    c1: "کوانتیفیکیشن", d1: "معاملات هوشمند",
    c2: "واریز", d2: "شارژ حساب",
    c3: "برداشت", d3: "برداشت دارایی",
    c4: "تیم", d4: "زیرمجموعه‌ها",
    c5: "تراکنش‌ها", d5: "تاریخچه مالی",
    c6: "پروفایل", d6: "تنظیمات امنیت",
    tmkt: "بازار ارزهای دیجیتال (۳ ارز برتر از ۳۰ ارز رصد شده)", tlive: "زنده",
    floatingCasino: "کازینو"
  },
  en: {
    m1: "Home", m2: "Quantification", m3: "Deposit", m4: "Withdraw", m5: "Transactions", m6: "Profile", m7: "Support", m_about: "About Platform", m8: "Logout",
    wel: "Welcome", sub: "User Management Panel", st: "Verified",
    ts1: "Balance", ts2: "Referrals",
    c1: "Quantification", d1: "Smart Trading",
    c2: "Deposit", d2: "Account Top-up",
    c3: "Withdraw", d3: "Asset Withdrawal",
    c4: "Team", d4: "Sub-accounts",
    c5: "Transactions", d5: "Financial History",
    c6: "Profile", d6: "Security Settings",
    tmkt: "Cryptocurrency Market (Top 3 of 30 tracked coins)", tlive: "Live",
    floatingCasino: "Casino"
  },
  ar: {
    m1: "الرئيسية", m2: "التكميم", m3: "إيداع", m4: "سحب", m5: "المعاملات", m6: "الملف الشخصي", m7: "الدعم", m_about: "حول المنصة", m8: "تسجيل الخروج",
    wel: "أهلاً بك", sub: "لوحة إدارة المستخدم", st: "موثق",
    ts1: "الرصيد", ts2: "الإحالات",
    c1: "التكميم", d1: "التداول الذكي",
    c2: "إيداع", d2: "شحن الحساب",
    c3: "سحب", d3: "سحب الأصول",
    c4: "الفريق", d4: "الإحالات",
    c5: "المعاملات", d5: "السجل المالي",
    c6: "الملف الشخصي", d6: "إعدادات الأمان",
    tmkt: "سوق العملات الرقمية (أفضل 3 من 30 عملة مراقبة)", tlive: "مباشر",
    floatingCasino: "كازينو"
  },
  tr: {
    m1: "Ana Sayfa", m2: "Kuantifikasyon", m3: "Yatırım", m4: "Çekim", m5: "İşlemler", m6: "Profil", m7: "Destek", m_about: "Platform Hakkında", m8: "Çıkış",
    wel: "Hoş Geldiniz", sub: "Kullanıcı Yönetim Paneli", st: "Onaylandı",
    ts1: "Bakiye", ts2: "Referanslar",
    c1: "Kuantifikasyon", d1: "Akıllı İşlem",
    c2: "Yatırım", d2: "Hesap Yükleme",
    c3: "Çekim", d3: "Varlık Çekimi",
    c4: "Ekip", d4: "Alt Hesaplar",
    c5: "İşlemler", d5: "Finansal Geçmiş",
    c6: "Profil", d6: "Güvenlik Ayarları",
    tmkt: "Kripto Para Piyasası (Takip edilen 30 coinden en iyi 3ü)", tlive: "Canlı",
    floatingCasino: "Casino"
  },
  ru: {
    m1: "Главная", m2: "Квантификация", m3: "Депозит", m4: "Вывод", m5: "Транзакции", m6: "Профиль", m7: "Поддержка", m_about: "О платформе", m8: "Выход",
    wel: "Добро пожаловать", sub: "Панель управления", st: "Подтверждено",
    ts1: "Баланс", ts2: "Рефералы",
    c1: "Квантификация", d1: "Умная торговля",
    c2: "Депозит", d2: "Пополнение счета",
    c3: "Вывод", d3: "Вывод средств",
    c4: "Команда", d4: "Рефералы",
    c5: "Транзакции", d5: "История финансов",
    c6: "Профиль", d6: "Настройки безопасности",
    tmkt: "Криптовалютный рынок (топ-3 из 30 монет)", tlive: "Онлайн",
    floatingCasino: "Казино"
  },
  es: {
    m1: "Inicio", m2: "Cuantificación", m3: "Depósito", m4: "Retiro", m5: "Transacciones", m6: "Perfil", m7: "Soporte", m_about: "Sobre la plataforma", m8: "Cerrar sesión",
    wel: "Bienvenido", sub: "Panel de gestión de usuario", st: "Verificado",
    ts1: "Saldo", ts2: "Referidos",
    c1: "Cuantificación", d1: "Comercio inteligente",
    c2: "Depósito", d2: "Recarga de cuenta",
    c3: "Retiro", d3: "Retiro de activos",
    c4: "Equipo", d4: "Subcuentas",
    c5: "Transacciones", d5: "Historial financiero",
    c6: "Perfil", d6: "Configuración de seguridad",
    tmkt: "Mercado de criptomonedas (Top 3 de 30 monedas)", tlive: "En vivo",
    floatingCasino: "Casino"
  },
  fr: {
    m1: "Accueil", m2: "Quantification", m3: "Dépôt", m4: "Retrait", m5: "Transactions", m6: "Profil", m7: "Support", m_about: "À propos", m8: "Déconnexion",
    wel: "Bienvenue", sub: "Panneau de gestion", st: "Vérifié",
    ts1: "Solde", ts2: "Parrainages",
    c1: "Quantification", d1: "Trading intelligent",
    c2: "Dépôt", d2: "Recharge de compte",
    c3: "Retrait", d3: "Retrait d'actifs",
    c4: "Équipe", d4: "Sous-comptes",
    c5: "Transactions", d5: "Historique financier",
    c6: "Profil", d6: "Paramètres de sécurité",
    tmkt: "Marché des crypto-monnaies (Top 3 sur 30)", tlive: "En direct",
    floatingCasino: "Casino"
  },
  de: {
    m1: "Startseite", m2: "Quantifizierung", m3: "Einzahlung", m4: "Auszahlung", m5: "Transaktionen", m6: "Profil", m7: "Unterstützung", m_about: "Über die Plattform", m8: "Abmelden",
    wel: "Willkommen", sub: "Benutzer-Management-Panel", st: "Verifiziert",
    ts1: "Guthaben", ts2: "Empfehlungen",
    c1: "Quantifizierung", d1: "Smart Trading",
    c2: "Einzahlung", d2: "Konto aufladen",
    c3: "Auszahlung", d3: "Vermögensauszahlung",
    c4: "Team", d4: "Unterkonten",
    c5: "Transaktionen", d5: "Finanzhistorie",
    c6: "Profil", d6: "Sicherheitseinstellungen",
    tmkt: "Kryptowährungsmarkt (Top 3 von 30 Münzen)", tlive: "Live",
    floatingCasino: "Casino"
  }
};

const currentLang = localStorage.getItem('zenix_lang') || 'fa';
document.documentElement.lang = currentLang;
document.documentElement.dir = (currentLang === 'fa' || currentLang === 'ar') ? 'rtl' : 'ltr';

function applyTranslations(lang) {
  const t = translations[lang] || translations['fa'];
  const setTxt = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setTxt('m1', t.m1); setTxt('m2', t.m2); setTxt('m3', t.m3);
  setTxt('m4', t.m4); setTxt('m5', t.m5); setTxt('m6', t.m6);
  setTxt('m7', t.m7); setTxt('m_about', t.m_about); setTxt('m8', t.m8);
  setTxt('t-wel', t.wel); setTxt('t-sub', t.sub); setTxt('t-st', t.st);
  setTxt('ts1', t.ts1); setTxt('ts2', t.ts2);
  setTxt('c1', t.c1); setTxt('d1', t.d1); setTxt('c2', t.c2); setTxt('d2', t.d2);
  setTxt('c3', t.c3); setTxt('d3', t.d3); setTxt('c4', t.c4); setTxt('d4', t.d4);
  setTxt('c5', t.c5); setTxt('d5', t.d5); setTxt('c6', t.c6); setTxt('d6', t.d6);
  setTxt('t-mkt', t.tmkt); setTxt('t-live', t.tlive); setTxt('t-floating-casino', t.floatingCasino);
}

applyTranslations(currentLang);

const langItems = document.querySelectorAll('#lang-menu .mi');
langItems.forEach(item => {
  if (item.getAttribute('data-lang') === currentLang) item.classList.add('active');
  item.addEventListener('click', () => {
    langItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    const lang = item.getAttribute('data-lang');
    if (lang) {
      localStorage.setItem('zenix_lang', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = (lang === 'fa' || lang === 'ar') ? 'rtl' : 'ltr';
      applyTranslations(lang);
      if (langMenu) langMenu.classList.remove('show');
    }
  });
});

if (helpBtn) {
  helpBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllMenus();
    const helpModal = document.getElementById('help-modal');
    if (helpModal) helpModal.classList.add('show');
    else alert('راهنمای داشبورد: از این پنل می‌توانید به بخش‌های مختلف دسترسی داشته باشید.');
  });
}

if (bellBtn) {
  bellBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllMenus();
    const notifModal = document.getElementById('notif-modal') || document.getElementById('notification-modal');
    if (notifModal) notifModal.classList.add('show');
    else alert('اعلانی برای نمایش وجود ندارد.');
  });
}

document.addEventListener('click', (e) => {
  if (navMenu && !navMenu.contains(e.target) && e.target !== menuBtn) navMenu.classList.remove('show');
  if (langMenu && !langMenu.contains(e.target) && e.target !== langBtn) langMenu.classList.remove('show');
});
