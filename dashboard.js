import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// آدرس پایه و کلید عمومی پروژه Supabase شما
const SUPABASE_URL = 'https://ujyenmqdgivuxvxptwyl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tRJPNKN0KUFfcta6I3xsNw_icShZQhO';

let supabase = null;
if (SUPABASE_URL && SUPABASE_URL.startsWith('http')) {
  supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.error('لطفاً آدرس معتبر Supabase را در فایل dashboard.js وارد کنید.');
}

// ==========================================
// دیکشنری زبان‌ها و سیستم ترجمه
// ==========================================
let currLang = localStorage.getItem('zenix_lang') || 'fa';

const ld = {
  fa: {
    m1: 'صفحه اصلی', m2: 'کوانتیفیکیشن', m3: 'واریز', m4: 'برداشت', m5: 'تراکنش', m6: 'پروفایل', m7: 'پشتیبانی', mAbout: 'درباره پلتفرم', m8: 'خروج',
    wel: 'خوش آمدید', sub: 'پنل مدیریت کاربری', st: 'تایید شده',
    ts1: 'موجودی', ts2: 'زیرمجموعه',
    c1: 'کوانتیفیکیشن', d1: 'معاملات هوشمند',
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
    hpT3: 'بخش‌های دسترسی سریع', hpD3: 'دکمه‌های میانبر (کوانتیفیکیشن، واریز، برداشت، تیم، تراکنش‌ها و پروفایل) برای ورود آنی به بخش‌های مختلف پلتفرم تعبیه شده‌اند.',
    hpT4: 'بازار زنده ارزهای دیجیتال', hpD4: 'نمایش لحظه‌ای تغییرات قیمت و درصد سود برترین ارزهای دیجیتال برای رصد بازار جهانی در یک نگاه.'
  },
  en: {
    m1: 'Home', m2: 'Quantification', m3: 'Deposit', m4: 'Withdraw', m5: 'Transactions', m6: 'Profile', m7: 'Support', mAbout: 'About Platform', m8: 'Logout',
    wel: 'Welcome', sub: 'User Dashboard Panel', st: 'Verified',
    ts1: 'Balance', ts2: 'Referrals',
    c1: 'Quantification', d1: 'Smart Trading',
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
    hpT3: 'Quick Access Grid', hpD3: 'Shortcuts (Quantification, Deposit, Withdraw, Team, Transactions, Profile) for instant navigation.',
    hpT4: 'Live Crypto Market', hpD4: 'Real-time price changes and trends of top cryptocurrencies at a glance.'
  }
};

function setLang(lang) {
  currLang = lang;
  localStorage.setItem('zenix_lang', lang);

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
    'm1': t.m1, 'm2': t.m2, 'm3': t.m3, 'm4': t.m4, 'm5': t.m5, 'm6': t.m6, 'm7': t.m7, 'm_about': t.mAbout, 'm8': t.m8,
    't-wel': t.wel, 't-sub': t.sub, 't-st': t.st,
    'ts1': t.ts1, 'ts2': t.ts2,
    'c1': t.c1, 'd1': t.d1, 'c2': t.c2, 'd2': t.d2, 'c3': t.c3, 'd3': t.d3,
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

// ==========================================
// دریافت و رندر قیمت زنده ۳ ارز برتر بازار
// ==========================================
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

      html += `
        <div class="crypto-row">
          <div class="crypto-info">
            <div class="crypto-icon" style="background: rgba(255,255,255,0.08);">
              ${coin.code.slice(0, 1)}
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

document.addEventListener('DOMContentLoaded', async () => {
  setLang(currLang);
  setupEventListeners();
  
  fetchCryptoMarket();
  setInterval(fetchCryptoMarket, 10000);

  if (!supabase) return;
  await checkUserSession();
});

async function checkUserSession() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session || !session.user) {
      window.location.href = 'index.html';
      return;
    }

    const user = session.user;

    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError) {
      console.error('خطا در دریافت اطلاعات کاربر:', dbError);
      return;
    }

    if (userData) {
      const fullNameElem = document.getElementById('user-fullname');
      const userIdElem = document.getElementById('user-id');
      const phoneInput = document.getElementById('user-phone-input');
      const balanceElem = document.getElementById('val-balance');
      const refElem = document.getElementById('val-ref');

      if (fullNameElem) {
        fullNameElem.textContent = userData.full_name || userData.fullName || 'کاربر Zenix';
      }
      
      if (userIdElem) {
        userIdElem.textContent = `UID: ${userData.id.slice(0, 8)}`;
      }

      if (phoneInput) {
        const phone = userData.phone || userData.phone_number || userData.phoneNumber || '';
        if (phone) phoneInput.value = phone;
      }

      if (balanceElem && userData.balance !== undefined) {
        balanceElem.textContent = `$${Number(userData.balance).toFixed(2)}`;
      }

      if (refElem && userData.referrals_count !== undefined) {
        refElem.textContent = userData.referrals_count;
      }
    }
  } catch (err) {
    console.error('خطای غیرمنتظره در بررسی نشست:', err);
  }
}

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

  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileUpdate);
  }
}

// ==========================================
// توابع مدیریت مودال‌ها و فیلتر پیام‌ها (هماهنگ با کوانتیفیکیشن)
// ==========================================

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

window.setNotifFilter = function(filter, element) {
  const tabs = document.querySelectorAll('#notif-tabs .notif-tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  
  if (element) {
    element.classList.add('active');
  }
  
  if (typeof window.renderNotifications === 'function') {
    window.renderNotifications(filter);
  }
};

window.switchNotifTab = function(tabName) {
  window.setNotifFilter(tabName, document.querySelector(`.notif-tab[data-tab="${tabName}"]`));
};

async function handleProfileUpdate(e) {
  e.preventDefault();

  if (!supabase) return;

  const phoneInput = document.getElementById('user-phone-input');
  const newPhone = phoneInput ? phoneInput.value.trim() : '';

  if (!newPhone) {
    alert('لطفاً شماره تلفن همراه را وارد کنید.');
    return;
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session || !session.user) return;

  const { error } = await supabase
    .from('users')
    .update({ phone: newPhone })
    .eq('id', session.user.id);

  if (error) {
    alert('خطا در ثبت اطلاعات: ' + error.message);
  } else {
    alert('شماره تلفن با موفقیت ثبت شد.');
    window.location.href = 'dashboard.html';
  }
}
