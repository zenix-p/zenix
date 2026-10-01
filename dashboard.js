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
// نام فایل: dashboard.js
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
  if (!supabase) return;
  await checkUserSession();
  setupEventListeners();
});

/**
 * بررسی وضعیت ورود و بارگذاری اطلاعات کاربر
 */
async function checkUserSession() {
  try {
    // ۱. دریافت نشست فعال کاربر از Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // اگر کاربر وارد نشده باشد، به صفحه ورود هدایت می‌شود
    if (sessionError || !session || !session.user) {
      window.location.href = 'index.html';
      return;
    }

    const user = session.user;

    // ۲. دریافت اطلاعات تکمیلی کاربر از جدول users
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
      // مقداردهی عناصر رابط کاربری
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

/**
 * تنظیم رویدادهای هدر، منوها، مودال‌ها و فرم‌ها
 */
function setupEventListeners() {
  const menuBtn = document.getElementById('menu-btn');
  const navMenu = document.getElementById('nav-menu');
  const langBtn = document.getElementById('lang-btn');
  const langMenu = document.getElementById('lang-menu');

  // ۱. باز و بستن منوی اصلی (همبرگری)
  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('show');
      if (langMenu) langMenu.classList.remove('show');
    });
  }

  // ۲. باز و بستن منوی انتخاب زبان
  if (langBtn && langMenu) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langMenu.classList.toggle('show');
      if (navMenu) navMenu.classList.remove('show');
    });
  }

  // بستن منوها هنگام کلیک در خارج از آن‌ها
  document.addEventListener('click', (e) => {
    if (navMenu && !navMenu.contains(e.target) && e.target !== menuBtn) {
      navMenu.classList.remove('show');
    }
    if (langMenu && !langMenu.contains(e.target) && e.target !== langBtn) {
      langMenu.classList.remove('show');
    }
  });

  // ۳. دکمه اعلانات (زنگوله)
  const bellBtn = document.getElementById('bell-btn');
  if (bellBtn) {
    bellBtn.addEventListener('click', () => {
      const modal = document.getElementById('m-msg');
      if (modal) modal.classList.add('show');
    });
  }

  // ۴. دکمه راهنمای صفحه
  const helpBtn = document.getElementById('help-btn');
  if (helpBtn) {
    helpBtn.addEventListener('click', () => {
      const modal = document.getElementById('m-help');
      if (modal) modal.classList.add('show');
    });
  }

  // ۵. دکمه خروج از حساب کاربری
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

  // ۶. شنونده فرم پروفایل (در صورت وجود)
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileUpdate);
  }
}

// ==========================================
// توابع عمومی مدیریت مودال‌ها (برای فراخوانی از HTML)
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

window.switchNotifTab = function(tabName) {
  const tabs = document.querySelectorAll('.notif-tab');
  tabs.forEach(tab => {
    if (tab.getAttribute('data-tab') === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
};

/**
 * ذخیره و به‌روزرسانی اطلاعات پروفایل
 */
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
