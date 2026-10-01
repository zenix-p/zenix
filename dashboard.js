// ==========================================
// نام فایل: profile.js
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
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

      /* 
        ❌ کد حذف‌شده:
        در این بخش هیچ دستور هدایتی مانند (window.location.href = 'dashboard.html') 
        نباید وجود داشته باشد تا کاربر بتواند در صفحه پروفایل بماند.
      */
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
