// در تابع بررسی نشست کاربر (checkUserSession) در اسکریپت پروفایل:

async function checkUserSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || !session.user) {
    window.location.href = 'index.html';
    return;
  }

  const u = session.user;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', u.id)
      .single();

    if (data) {
      // مقادیر کاربر را روی فرم پروفایل قرار دهید
      document.getElementById('user-fullname').textContent = data.full_name || data.fullName || 'کاربر Zenix';
      document.getElementById('user-id').textContent = `UID: ${data.id.slice(0, 8)}`;
      
      let phone = data.phone || data.phone_number || data.phoneNumber || '';
      if (phone) {
        document.getElementById('user-phone-input').value = phone;
      }

      // ❌ هرگونه خط زیر را که کاربر را به dashboard.html هدایت می‌کرد حذف کنید:
      // if (phone) { window.location.href = 'dashboard.html'; } <-- این خط را کلاً پاک کنید
    }
  } catch (e) {
    console.error("خطا در دریافت اطلاعات پروفایل:", e);
  }
}
