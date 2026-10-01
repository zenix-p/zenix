import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// آدرس پایه پروژه Supabase شما
const SUPABASE_URL = 'https://ujyenmqdgivuxvxptwyl.supabase.co';
// ⚠️ کلید anon پروژه خود را (از بخش Project Settings > API) به جای مقدار زیر قرار دهید
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

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
 * بررسی وضعیت ورود و بارگذاری اطلاعات کاربر در صفحه پروفایل
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

      if (fullNameElem) {
        fullNameElem.textContent = userData.full_name || userData.fullName || 'کاربر Zenix';
      }
      
      if (userIdElem) {
        userIdElem.textContent = `UID: ${userData.id.slice(0, 8)}`;
      }

      // درج شماره تلفن ثبت‌شده در ورودی فرم
      const phone = userData.phone || userData.phone_number || userData.phoneNumber || '';
      if (phoneInput && phone) {
        phoneInput.value = phone;
      }
    }
  } catch (err) {
    console.error('خطای غیرمنتظره در بررسی نشست:', err);
  }
}

/**
 * تنظیم شنونده‌های رویداد برای فرم پروفایل
 */
function setupEventListeners() {
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileUpdate);
  }
}

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

  // به‌روزرسانی شماره تلفن در دیتابیس
  const { error } = await supabase
    .from('users')
    .update({ phone: newPhone })
    .eq('id', session.user.id);

  if (error) {
    alert('خطا در ثبت اطلاعات: ' + error.message);
  } else {
    alert('شماره تلفن با موفقیت ثبت شد.');
    // پس از ثبت دستی فرم توسط کاربر، انتقال به دشبورد صورت می‌گیرد
    window.location.href = 'dashboard.html';
  }
}
