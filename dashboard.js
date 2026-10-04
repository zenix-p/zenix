import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://ujyenmqdgivuxvxptwyl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tRJPNKN0KUFfcta6I3xsNw_icShZQhO';

// ==========================================
// پشتیبانی ایمن از حافظه مرورگر (مشابه team.html)
// ==========================================
function safeGetItem(key) {
  try { return localStorage.getItem(key); } catch(e) { return null; }
}
function safeSetItem(key, val) {
  try { localStorage.setItem(key, val); } catch(e) {}
}
function safeRemoveItem(key) {
  try { localStorage.removeItem(key); } catch(e) {}
}

const customStorage = {
  getItem: (key) => safeGetItem(key),
  setItem: (key, value) => safeSetItem(key, value),
  removeItem: (key) => safeRemoveItem(key)
};

// مقداردهی کلاینت Supabase همراه با customStorage
let supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    storage: customStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

function generateUIDDigits(userId) {
  if (!userId) return '000000';
  let hash = 5381;
  let str = String(userId);
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  const num = Math.abs(hash % 900000) + 100000;
  return num.toString();
}

// ==========================================
// متغیرها و توابع مدیریت اعلان‌ها (عیناً هماهنگ‌شده با transactions.html)
// ==========================================
window.cachedNotifications = [];
window.currentFilteredNotifs = [];
window.activeNotifFilter = 'all';

// تابع فرمت‌دهی تاریخ و ساعت به میلادی
window.formatGregorianDate = function(rawDate) {
  if (!rawDate) return '';
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

window.updateBellBadge = function() {
  const unreadCount = window.cachedNotifications.filter(n => !n.read && !n.isRead && !n.is_read).length;
  const badge = document.getElementById('bell-badge');
  if (badge) {
    badge.innerText = unreadCount;
    if (unreadCount > 0) badge.classList.add('show');
    else badge.classList.remove('show');
  }
};

window.setNotifFilter = function(filter, element) {
  window.activeNotifFilter = filter;
  const tabs = document.querySelectorAll('#notif-tabs .notif-tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  
  if (element) {
    element.classList.add('active');
  }
  
  window.renderNotifications();
};

window.getNotifCategory = function(n) {
  const type = (n.type || '').toLowerCase();
  const title = (n.title || '').toLowerCase();

  if (type.includes('approved') || type.includes('confirm') || title.includes('تایید') || title.includes('موفق') || title.includes('شارژ شد')) {
    return 'approved';
  }
  if (type.includes('rejected') || type.includes('canceled') || type.includes('cancel') || title.includes('رد') || title.includes('لغو') || title.includes('ناموفق')) {
    return 'rejected';
  }
  return 'admin_message';
};

window.closeMsgDetailModal = function() {
  const modal = document.getElementById('m-msg-detail');
  if (modal) modal.classList.remove('show');
};

window.openMsgDetail = async function(idx) {
  const n = window.currentFilteredNotifs[idx];
  if (!n) return;

  const isUnread = !n.read && !n.isRead && !n.is_read;

  if (isUnread) {
    // علامت‌گذاری فوری محلی در حافظه
    n.is_read = true;
    n.read = true;
    n.isRead = true;

    window.updateBellBadge();
    window.renderNotifications();

    // بروزرسانی دیتابیس Supabase
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', n.id)
        .select();

      if (error) {
        console.warn('خطا در ستون is_read، تلاش برای ثبت در ستون read:', error);
        const res2 = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', n.id);
          
        if (res2.error) {
          console.warn('خطا در ستون read، تلاش برای ثبت در ستون isRead:', res2.error);
          await supabase
            .from('notifications')
            .update({ isRead: true })
            .eq('id', n.id);
        }
      }
    } catch (err) {
      console.error('خطای ارتباط با Supabase در به‌روزرسانی اعلان:', err);
    }
  }

  const title = n.title || 'پیام سیستم';
  const msg = n.message || n.text || n.body || '';
  const category = window.getNotifCategory(n);
  const dateStr = window.formatGregorianDate(n.created_at || n.date || n.created_date);

  const detailTitle = document.getElementById('detail-msg-title');
  const detailDate = document.getElementById('detail-msg-date');
  const detailBody = document.getElementById('detail-msg-body');
  const detailSupport = document.getElementById('detail-msg-support');

  if (detailTitle) detailTitle.innerHTML = `<i class="fas fa-bell" style="color:#38bdf8"></i> ${title}`;
  
  if (detailDate) {
    if (dateStr) {
      detailDate.innerHTML = `<i class="far fa-clock" style="color:#38bdf8;margin-right:4px;"></i>${dateStr}`;
      detailDate.style.display = 'block';
    } else {
      detailDate.style.display = 'none';
    }
  }

  if (detailBody) detailBody.innerText = msg;

  if (detailSupport) {
      if (category === 'rejected') {
          detailSupport.innerHTML = `
          <div style="margin-top:15px;padding-top:10px;border-top:1px dashed rgba(239,68,68,0.3);display:flex;justify-content:flex-end;">
            <a href="support.html" onclick="sessionStorage.setItem('zenix_return_page', window.location.href);" style="display:inline-flex;align-items:center;gap:6px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);color:#f8fafc;padding:6px 12px;border-radius:6px;font-size:12px;text-decoration:none;font-weight:600;transition:0.2s;">
              <i class="fas fa-headset" style="color:#ef4444;"></i>
              <span>پیگیری از طریق پشتیبانی</span>
            </a>
          </div>`;
      } else {
          detailSupport.innerHTML = '';
      }
  }

  document.getElementById('m-msg-detail')?.classList.add('show');
};

window.renderNotifications = function() {
  const container = document.getElementById('modal-msg-container');
  if (!container) return;

  const filter = window.activeNotifFilter;
  const filtered = window.cachedNotifications.filter(n => {
    if (filter === 'all') return true;
    return window.getNotifCategory(n) === filter;
  });

  window.currentFilteredNotifs = filtered;

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:25px;color:#94a3b8;font-size:12px;"><i class="fas fa-inbox" style="font-size:24px;margin-bottom:8px;display:block;opacity:0.5;"></i>هیچ پیامی در این دسته‌بندی وجود ندارد.</div>`;
    return;
  }

  let html = '';
  filtered.forEach((n, idx) => {
    const title = n.title || 'پیام سیستم';
    const category = window.getNotifCategory(n);
    const isUnread = !n.read && !n.isRead && !n.is_read;
    const dateStr = window.formatGregorianDate(n.created_at || n.date || n.created_date);

    let borderStyle = "border:1px solid rgba(255,255,255,.08);";
    let bgStyle = "background:rgba(255,255,255,.02);";
    let icon = '<i class="fas fa-bullhorn" style="color:#38bdf8"></i>';
    let tagHtml = '<span style="font-size:10px;background:rgba(56,189,248,0.2);color:#38bdf8;padding:2px 6px;border-radius:4px;font-weight:700;">پیام مدیریت</span>';

    if (category === 'approved') {
      borderStyle = isUnread ? "border:1px solid rgba(34, 197, 94, 0.6);" : "border:1px solid rgba(34, 197, 94, 0.2);";
      bgStyle = isUnread ? "background:rgba(34, 197, 94, 0.12);" : "background:rgba(34, 197, 94, 0.03);";
      icon = '<i class="fas fa-check-circle" style="color:#22c55e"></i>';
      tagHtml = '<span style="font-size:10px;background:rgba(34,197,94,0.2);color:#22c55e;padding:2px 6px;border-radius:4px;font-weight:700;">تایید درخواست</span>';
    } else if (category === 'rejected') {
      borderStyle = isUnread ? "border:1px solid rgba(239, 68, 68, 0.6);" : "border:1px solid rgba(239, 68, 68, 0.2);";
      bgStyle = isUnread ? "background:rgba(239, 68, 68, 0.12);" : "background:rgba(239, 68, 68, 0.03);";
      icon = '<i class="fas fa-times-circle" style="color:#ef4444"></i>';
      tagHtml = '<span style="font-size:10px;background:rgba(239,68,68,0.2);color:#ef4444;padding:2px 6px;border-radius:4px;font-weight:700;">لغو درخواست</span>';
    } else {
      bgStyle = isUnread ? "background:rgba(56, 189, 248, 0.12);" : "background:rgba(255, 255, 255, 0.02);";
      borderStyle = isUnread ? "border:1px solid rgba(56, 189, 248, 0.5);" : "border:1px solid rgba(255, 255, 255, 0.08);";
    }

    const opacityStyle = isUnread ? "opacity:1;" : "opacity:0.65;";
    const unreadDot = isUnread ? '<span style="width:9px;height:9px;background:#ef4444;border-radius:50%;display:inline-block;box-shadow:0 0 8px #ef4444;" title="خوانده نشده"></span>' : '';
    const readBadge = isUnread 
      ? '<span style="font-size:10px;background:#ef4444;color:#fff;padding:2px 7px;border-radius:10px;font-weight:800;box-shadow:0 0 8px rgba(239,68,68,0.5);">جدید</span>' 
      : '<span style="font-size:10px;background:rgba(255,255,255,0.06);color:#94a3b8;padding:2px 6px;border-radius:10px;"><i class="fas fa-check" style="font-size:9px;color:#64748b;"></i> خوانده‌شده</span>';

    const dateDisplay = dateStr ? `<div style="font-size:11px;color:${isUnread ? '#cbd5e1' : '#64748b'};margin-top:6px;direction:ltr;text-align:left;"><i class="far fa-clock" style="margin-right:4px;"></i>${dateStr}</div>` : '';

    html += `<div class="msg-body-box" style="${borderStyle} ${bgStyle} ${opacityStyle} cursor:pointer; position:relative; transition:all 0.2s;" onclick="window.openMsgDetail(${idx})">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <div class="msg-title-text" style="display:flex;align-items:center;gap:8px;font-weight:${isUnread ? '800' : '500'};color:${isUnread ? '#f8fafc' : '#cbd5e1'};">
          ${unreadDot}
          ${icon}
          <span>${title}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${tagHtml}
          ${readBadge}
        </div>
      </div>
      ${dateDisplay}
    </div>`;
  });

  container.innerHTML = html;
};

// ==========================================
// تنظیمات زبان
// ==========================================
let currLang = safeGetItem('zenix_lang') || 'fa';

const ld = {
  fa: {
    m1: 'صفحه اصلی', m2: 'کوانتیفیکیشن', m_poker: 'پوکر کازینویی', m3: 'واریز', m4: 'برداشت', m5: 'تراکنش', m6: 'پروفایل', m7: 'پشتیبانی', mAbout: 'درباره پلتفرم', m8: 'خروج',
    wel: 'خوش آمدید', sub: 'پنل مدیریت کاربری', st: 'تایید شده',
    ts1: 'موجودی', ts2: 'اعضای کل تیم',
    c1: 'کوانتیفیکیشن', d1: 'معاملات هوشمند',
    c_poker: 'پوکر کازینویی', d_poker: 'رقابت با دیلر',
    c2: 'واریز', d2: 'شارژ حساب',
    c3: 'برداشت', d3: 'برداشت دارایی',
    c4: 'تیم', d4: 'زیرمجموعه‌ها',
    c5: 'تراکنش‌ها', d5: 'تاریخچه مالی',
    c6: 'پروفایل', d6: 'تنظیمات امنیت',
    tMkt: 'بازار ارزهای دیجیتال (۳ ارز برتر منبع زنده)', tLive: 'زنده',
    tAbTitle: 'درباره پلتفرم Zenix (هدف، ماهیت و ساختار)',
    tAbDesc: 'پلتفرم Zenix یک اکوسیستم مالی نوین و هوشمند در حوزه ارزهای دیجیتال و پردازش‌های معاملاتی است که با هدف ایجاد بستری امن، خودکار و سودآور برای کاربران طراحی شده است.',
    tAbL1t: 'هدف اصلی:', tAbL1d: 'اتوماسیون فرآیندهای معاملاتی از طریق سیستم‌های هوش مصنوعی و الگوریتم‌های کوانتیفیکیشن (Quantification)، به‌طوری‌که کاربران بدون نیاز به تخصص پیچیده در ترید، بتوانند از نوسانات بازار جهانی سود کسب کنند.',
    tAbL2t: 'امنیت و زیرساخت:', tAbL2d: 'متکی بر پروتکل‌های رمزنگاری پیشرفته، اتصال به گره‌های پردازشی ابری پرسرعت و مدیریت یکپارچه دارایی‌ها در بستر پایگاه داده ابری امن (Supabase).',
    tAbL3t: 'ساختار چندسطحی (Referral & Team):', tAbL3d: 'ایجاد یک شبکه پویای معرفی دوستان تا کاربران بتوانند از فعالیت زیرمجموعه‌های خود در چند سطح مختلف پاداش و درآمد پایدار دریافت کنند.',
    tAbL4t: 'احساس واقع‌گرایی:', tAbL4d: 'وجود بازار لحظه‌ای رمزارزها، شاخص‌های زنده حجم معاملات، نرخ گاز شبکه و اطلاعیه‌های سیستم به کاربر این اطمینان را می‌دهد که با یک پلتفرم بین‌المللی و زنده سروکار دارد.',
    modalTitle: 'صندوق پیام‌ها و اعلان‌ها', tabAll: 'همه', tabApproved: 'تایید درخواست', tabRejected: 'لغو درخواست', tabAdmin: 'پیام مدیریت',
    node: 'سرور فعال (US-East)',
    helpTitle: 'راهنمای صفحه داشبورد',
    hpT1: 'کاربرد این صفحه (داشبورد) چیست؟', hpD1: 'داشبورد مرکز کنترل و خانه اصلی حساب کاربری شماست. از این صفحه می‌توانید کل دارایی‌ها، وضعیت حساب و وضعیت تیم خود را بررسی کنید و به تمام بخش‌های اصلی پلتفرم دسترسی سریع داشته باشید.',
    hpT2: 'کارت موجودی و زیرمجموعه‌ها', hpD2: 'در این قسمت می‌توانید مجموع کل دارایی‌های دلاری و تعداد اعضای تیم زیرمجموعه خود را به صورت لحظه‌ای مشاهده کنید.',
    hpT3: 'بخش‌های دسترسی سریع', hpD3: 'دکمه‌های میانبر (کوانتیفیکیشن، پوکر کازینویی، واریز، برداشت، تیم، تراکنش‌ها و پروفایل) برای ورود آنی به بخش‌های مختلف پلتفرم تعبیه شده‌اند.',
    hpT4: 'بازار زنده ارزهای دیجیتال', hpD4: 'نمایش لحظه‌ای تغییرات قیمت و درصد سود برترین ارزهای دیجیتال برای رصد بازار جهانی در یک نگاه.'
  },
  en: {
    m1: 'Home', m2: 'Quantification', m_poker: 'Casino Poker', m3: 'Deposit', m4: 'Withdraw', m5: 'Transactions', m6: 'Profile', m7: 'Support', mAbout: 'About Platform', m8: 'Logout',
    wel: 'Welcome', sub: 'User Dashboard Panel', st: 'Verified',
    ts1: 'Balance', ts2: 'Total Team Members',
    c1: 'Quantification', d1: 'Smart Trading',
    c_poker: 'Casino Poker', d_poker: 'Play against dealer',
    c2: 'Deposit', d2: 'Account Recharge',
    c3: 'Withdraw', d3: 'Asset Withdrawal',
    c4: 'Team', d4: 'Referral Network',
    c5: 'Transactions', d5: 'Financial History',
    c6: 'Profile', d6: 'Security Settings',
    tMkt: 'Cryptocurrency Market (Top 3 Tracked Coins)', tLive: 'LIVE',
    tAbTitle: 'About Zenix Platform (Goal, Nature & Structure)',
    tAbDesc: 'Zenix Platform is an advanced and intelligent financial ecosystem in cryptocurrency and trading processing, designed to provide a secure, automated, and profitable platform for users.',
    tAbL1t: 'Main Goal:', tAbL1d: 'Automation of trading processes through AI systems and quantification algorithms, allowing users to profit from market fluctuations without complex trading expertise.',
    tAbL2t: 'Security & Infrastructure:', tAbL2d: 'Relies on advanced encryption protocols, high-speed cloud node connections, and unified asset management on Supabase secure cloud database.',
    tAbL3t: 'Multi-level Structure (Referral & Team):', tAbL3d: 'Creates a dynamic referral network enabling users to earn passive rewards from sub-level activities.',
    tAbL4t: 'Realism & Live Data:', tAbL4d: 'Live market rates, trading volumes, and network indicators ensure transparency and real-time reliability.',
    modalTitle: 'Inbox & Notifications', tabAll: 'All', tabApproved: 'Approved Requests', tabRejected: 'Rejected Requests', tabAdmin: 'Admin Messages',
    node: 'Active Server (US-East)',
    helpTitle: 'Dashboard Guide',
    hpT1: 'What is the purpose of this page?', hpD1: 'The dashboard is your main control center. Here you can inspect total assets, account status, team metrics, and access all core features quickly.',
    hpT2: 'Balance & Team Cards', hpD2: 'View your live USD balance and team member count in real-time.',
    hpT3: 'Quick Access Grid', hpD3: 'Shortcuts (Quantification, Casino Poker, Deposit, Withdraw, Team, Transactions, Profile) for instant navigation.',
    hpT4: 'Live Crypto Market', hpD4: 'Real-time price changes and trends of top cryptocurrencies at a glance.'
  }
};

function setLang(lang) {
  currLang = lang;
  safeSetItem('zenix_lang', lang);

  document.querySelectorAll('#lang-menu .mi').forEach(item => {
    if (item.getAttribute('data-lang') === lang) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  const navMenu = document.getElementById('nav-menu');
  const langMenu = document.getElementById('lang-menu');
  if (navMenu) navMenu.classList.remove('show');
  if (langMenu) langMenu.classList.remove('show');

  const t = ld[lang] || ld.fa;
  const isRtl = lang === 'fa' || lang === 'ar';

  document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lang);

  const map = {
    'm1': t.m1, 'm2': t.m2, 'm_poker': t.m_poker, 'm3': t.m3, 'm4': t.m4, 'm5': t.m5, 'm6': t.m6, 'm7': t.m7, 'm_about': t.mAbout, 'm8': t.m8,
    't-wel': t.wel, 't-sub': t.sub, 't-st': t.st,
    'ts1': t.ts1, 'ts2': t.ts2,
    'c1': t.c1, 'd1': t.d1, 'c_poker': t.c_poker, 'd_poker': t.d_poker,
    'c2': t.c2, 'd2': t.d2, 'c3': t.c3, 'd3': t.d3,
    'c4': t.c4, 'd4': t.d4, 'c5': t.c5, 'd5': t.d5, 'c6': t.c6, 'd6': t.d6,
    't-live': t.tLive,
    't-ab-title': t.tAbTitle, 't-ab-desc': t.tAbDesc,
    't-ab-l1t': t.tAbL1t, 't-ab-l1d': t.tAbL1d,
    't-ab-l2t': t.tAbL2t, 't-ab-l2d': t.tAbL2d,
    't-ab-l3t': t.tAbL3t, 't-ab-l3d': t.tAbL3d,
    't-ab-l4t': t.tAbL4t, 't-ab-l4d': t.tAbL4d,
    't-about-title': t.tAbTitle, 't-ab-m-desc': t.tAbDesc,
    't-ab-m-l1t': t.tAbL1t, 't-ab-m-l1d': t.tAbL1d,
    't-ab-m-l2t': t.tAbL2t, 't-ab-m-l2d': t.tAbL2d,
    't-ab-m-l3t': t.tAbL3t, 't-ab-m-l3d': t.tAbL3d,
    't-ab-m-l4t': t.tAbL4t, 't-ab-m-l4d': t.tAbL4d,
    't-tab-all': t.tabAll, 't-tab-approved': t.tabApproved, 't-tab-rejected': t.tabRejected, 't-tab-admin': t.tabAdmin,
    't-node': t.node, 't-help-title': t.helpTitle,
    't-hp-d1': t.hpD1, 't-hp-d2': t.hpD2, 't-hp-d3': t.hpD3, 't-hp-d4': t.hpD4
  };

  Object.keys(map).forEach(id => {
    const el = document.getElementById(id);
    if (el && map[id]) el.textContent = map[id];
  });

  const modalTitleElem = document.getElementById('t-modal-title');
  if (modalTitleElem) {
    modalTitleElem.innerHTML = `<i class="fas fa-bell"></i> ${t.modalTitle}`;
  }

  const mktHeader = document.getElementById('t-mkt');
  if (mktHeader) {
    mktHeader.innerHTML = `<i class="fas fa-chart-line" style="color:#22c55e"></i> ${t.tMkt}`;
  }

  for (let i = 1; i <= 4; i++) {
    const ht = document.getElementById('t-hp-t' + i);
    if (ht && t['hpT' + i]) {
      const icons = ['fa-home', 'fa-wallet', 'fa-th-large', 'fa-chart-line'];
      const colors = ['#38bdf8', '#38bdf8', '#a855f7', '#22c55e'];
      ht.innerHTML = `<i class="fas ${icons[i - 1]}" style="color:${colors[i - 1]}"></i> ${t['hpT' + i]}`;
    }
  }
}

async function fetchCryptoMarket() {
  const container = document.getElementById('crypto-ticker-list') || 
                    document.getElementById('crypto-market-list') || 
                    document.getElementById('mkt-list');

  if (!container) return;

  const fallbackCoins = [
    { code: 'BTC', price: '64,820.50', change: '+2.15%' },
    { code: 'ETH', price: '3,450.80', change: '-0.65%' },
    { code: 'SOL', price: '148.30', change: '+4.80%' }
  ];

  function renderCoins(coins) {
    let html = '';
    coins.forEach(coin => {
      const isPos = !coin.change.startsWith('-');
      const changeClass = isPos ? 'price-up' : 'price-down';
      const codeLower = coin.code.toLowerCase();
      const iconUrl = `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${codeLower}.png`;
      const fallbackUrl = `https://assets.coincap.io/assets/icons/${codeLower}@2x.png`;

      html += `
        <div class="crypto-row">
          <div class="crypto-info">
            <div class="crypto-icon" style="background: rgba(255,255,255,0.05); overflow: hidden; display: flex; align-items: center; justify-content: center;">
              <img src="${iconUrl}" alt="${coin.code}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='${fallbackUrl}'; this.onerror=function(){ this.style.display='none'; this.parentElement.innerText='${coin.code.slice(0, 1)}'; };">
            </div>
            <div>
              <div style="color:#fff; font-weight:bold; font-size: 0.9rem;">${coin.code}</div>
              <div style="color:#a1a1aa; font-size:0.7rem;">USDT</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="color:#fff; font-weight:bold; font-size: 0.9rem;">$${coin.price}</div>
            <div class="${changeClass}" style="font-size:0.8rem;">${coin.change}</div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  }

  if (!container.children.length) {
    renderCoins(fallbackCoins);
  }

  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","SOLUSDT"]');
    if (!res.ok) throw new Error('Network error fetching crypto prices');
    
    const data = await res.json();
    const liveCoins = data.map(item => {
      const code = item.symbol.replace('USDT', '');
      const price = parseFloat(item.lastPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const changeVal = parseFloat(item.priceChangePercent);
      const isPositive = changeVal >= 0;
      return {
        code: code,
        price: price,
        change: (isPositive ? '+' : '') + changeVal.toFixed(2) + '%'
      };
    });

    renderCoins(liveCoins);
  } catch (err) {
    console.warn('استفاده از داده‌های پشتیبان بازار به دلیل عدم دسترسی به API:', err);
  }
}

// ==========================================
// محاسبه دقیق اعضای تیم (کاملاً عین الگوریتم team.html)
// ==========================================
async function calculateTeamMembersCount(uid, sessionUser) {
  try {
    let codeDigits = generateUIDDigits(uid);
    let myRefCode = 'MS-' + codeDigits;

    try {
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', uid)
        .maybeSingle();

      if (myProfile && myProfile.referral_code) {
        myRefCode = myProfile.referral_code;
      }
    } catch(e) {}

    let rawList = [];

    try {
      const { data: dbProfiles } = await supabase
        .from('profiles')
        .select('*');
      
      if (dbProfiles && Array.isArray(dbProfiles)) {
        rawList.push(...dbProfiles);
      }
    } catch(e) {}

    if (sessionUser && sessionUser.user_metadata) {
      let metaTeam = sessionUser.user_metadata.team_members || sessionUser.user_metadata.referrals || sessionUser.user_metadata.invited_users;
      if (Array.isArray(metaTeam)) rawList.push(...metaTeam);
    }

    ['zenix_registered_users', 'zenix_users', 'zenix_referrals', 'zenix_team_' + uid, 'zenix_all_users'].forEach(k => {
      let item = safeGetItem(k);
      if (item) {
        try {
          let parsed = JSON.parse(item);
          if (Array.isArray(parsed)) rawList.push(...parsed);
          else if (parsed && typeof parsed === 'object') rawList.push(parsed);
        } catch(e) {}
      }
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
        u.referred_by,
        u.referrer_id,
        u.invitation_code,
        u.ref_code,
        u.inviter,
        u.referral_code,
        u.ref
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

    let lvl1Users = allProfiles.filter(u => isReferredBy(u, uid, myRefCode));

    let lvl2Users = [];
    if (lvl1Users.length > 0) {
      lvl2Users = allProfiles.filter(u => {
        let uUid = u.user_id || u.id;
        if (uUid === uid || lvl1Users.some(l1 => (l1.user_id || l1.id) === uUid)) return false;
        return lvl1Users.some(l1 => isReferredBy(u, l1.user_id || l1.id, l1.referral_code));
      });
    }

    let lvl3Users = [];
    if (lvl2Users.length > 0) {
      lvl3Users = allProfiles.filter(u => {
        let uUid = u.user_id || u.id;
        if (uUid === uid || lvl1Users.some(l1 => (l1.user_id || l1.id) === uUid) || lvl2Users.some(l2 => (l2.user_id || l2.id) === uUid)) return false;
        return lvl2Users.some(l2 => isReferredBy(u, l2.user_id || l2.id, l2.referral_code));
      });
    }

    let l1Count = lvl1Users.length;
    let l2Count = lvl2Users.length;
    let l3Count = lvl3Users.length;

    if (l1Count === 0 && sessionUser && sessionUser.user_metadata) {
      let directCount = sessionUser.user_metadata.referral_count || sessionUser.user_metadata.invited_count || 0;
      if (Number(directCount) > 0) {
        l1Count = Number(directCount);
      }
    }

    return l1Count + l2Count + l3Count;
  } catch (err) {
    console.error("خطا در محاسبه تعداد اعضا:", err);
    return 0;
  }
}

async function checkUserSession(user) {
  if (!user) return;

  try {
    // بارگیری اعلان‌ها (منطبق بر transactions.html)
    try {
      const { data, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!notifError && data) {
        window.cachedNotifications = data;
        window.renderNotifications();
        window.updateBellBadge();
      }
    } catch (err) {}

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const fullNameElem = document.getElementById('user-fullname');
    const balanceElem = document.getElementById('val-balance');
    const refElem = document.getElementById('val-ref');

    if (userData) {
      if (fullNameElem) {
        fullNameElem.textContent = userData.fullname || userData.full_name || userData.fullName || user.user_metadata?.fullname || user.user_metadata?.full_name || user.email || 'کاربر Zenix';
      }
      if (balanceElem && userData.balance !== undefined) {
        balanceElem.textContent = `$${Number(userData.balance).toFixed(2)}`;
      }
    } else {
      if (fullNameElem) {
        fullNameElem.textContent = user.user_metadata?.fullname || user.user_metadata?.full_name || user.email?.split('@')[0] || 'کاربر Zenix';
      }
      if (balanceElem) {
        balanceElem.textContent = '$0.00';
      }
    }

    // به‌‌روزرسانی کارت اعضای کل تیم روی داشبورد
    if (refElem) {
      const totalTeamCount = await calculateTeamMembersCount(user.id, user);
      refElem.textContent = totalTeamCount;
    }

  } catch (err) {
    console.error('خطا در به‌‌‌‌روزرسانی اطلاعات کاربر:', err);
  }
}

// ==========================================
// شنونده وضعیت ورود کاربر (عین team.html)
// ==========================================
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session && session.user) {
    await checkUserSession(session.user);
  } else {
    window.location.href = "index.html";
  }
});

document.addEventListener('DOMContentLoaded', () => {
  setLang(currLang);
  setupEventListeners();
  fetchCryptoMarket();
  setInterval(fetchCryptoMarket, 10000);
});

function setupEventListeners() {
  const menuBtn = document.getElementById('menu-btn');
  const navMenu = document.getElementById('nav-menu');
  const langBtn = document.getElementById('lang-btn');
  const langMenu = document.getElementById('lang-menu');

  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('show');
      if (langMenu) langMenu.classList.remove('show');
    });
  }

  if (langBtn && langMenu) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langMenu.classList.toggle('show');
      if (navMenu) navMenu.classList.remove('show');
    });
  }

  document.querySelectorAll('#lang-menu .mi').forEach(item => {
    item.addEventListener('click', () => {
      const selectedLang = item.getAttribute('data-lang');
      if (selectedLang) setLang(selectedLang);
    });
  });

  document.addEventListener('click', (e) => {
    if (navMenu && !navMenu.contains(e.target) && e.target !== menuBtn) {
      navMenu.classList.remove('show');
    }
    if (langMenu && !langMenu.contains(e.target) && e.target !== langBtn) {
      langMenu.classList.remove('show');
    }
  });

  const bellBtn = document.getElementById('bell-btn');
  if (bellBtn) {
    bellBtn.addEventListener('click', () => {
      const modal = document.getElementById('m-msg');
      if (modal) modal.classList.add('show');
    });
  }

  const helpBtn = document.getElementById('help-btn');
  if (helpBtn) {
    helpBtn.addEventListener('click', () => {
      const modal = document.getElementById('m-help');
      if (modal) modal.classList.add('show');
    });
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (supabase) {
        await supabase.auth.signOut();
      }
      window.location.href = 'index.html';
    });
  }
}

window.openAboutModal = function() {
  const modal = document.getElementById('m-about');
  if (modal) modal.classList.add('show');
};

window.closeAboutModal = function() {
  const modal = document.getElementById('m-about');
  if (modal) modal.classList.remove('show');
};

window.closeHelpModal = function() {
  const modal = document.getElementById('m-help');
  if (modal) modal.classList.remove('show');
};

window.closeMessageModal = function() {
  const modal = document.getElementById('m-msg');
  if (modal) modal.classList.remove('show');
};
