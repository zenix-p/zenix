// تابع بررسی وضعیت لاگین و بارگذاری داده‌ها
async function initAuth() {
  try {
    // ۱. دریافت جلسه فعال به صورت مستقیم و Async
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session || !session.user) {
      window.location.href = 'index.html';
      return;
    }

    // ۲. بارگذاری اطلاعات کاربر در صورت وجود جلسه فعال
    await loadUserData(session.user);

    // ۳. گوش دادن به تغییرات وضعیت (فقط برای خروج)
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        window.location.href = 'index.html';
      }
    });

  } catch (err) {
    console.error("Auth Exception:", err);
    window.location.href = 'index.html';
  }
}

// تابع بارگذاری داده‌های کاربر از دیتابیس
async function loadUserData(u) {
  currentUserId = u.id;
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', u.id)
      .maybeSingle(); // استفاده از maybeSingle جهت جلوگیری از خطای نبود رکورد

    if (error) {
      console.error("خطا در دریافت اطلاعات کاربر:", error);
    }

    if (data) {
      uName = data.fullName || data.fullname || data.full_name || data.name || "";
      setLang(currLang);

      let rawBalance = data.balance ?? data.depositAmount ?? data.deposit_amount ?? data.wallet ?? data.amount ?? 0;
      let numericBalance = parseFloat(rawBalance);
      if (isNaN(numericBalance)) numericBalance = 0;
      
      let elBal = document.getElementById('val-balance');
      if (elBal) elBal.textContent = `$${numericBalance.toFixed(2)}`;

      let totalRef = 0;
      let refCode = data.referralCode || data.referral_code;

      if (refCode) {
        try {
          const { data: allUsers } = await supabase.from('users').select('*');
          if (allUsers) {
            let l1 = allUsers.filter(i => (i.referredBy || i.referred_by) === refCode),
                l1c = l1.map(i => i.referralCode || i.referral_code).filter(Boolean),
                l2 = allUsers.filter(i => l1c.includes(i.referredBy || i.referred_by)),
                l2c = l2.map(i => i.referralCode || i.referral_code).filter(Boolean),
                l3 = allUsers.filter(i => l2c.includes(i.referredBy || i.referred_by));
            
            totalRef = l1.length + l2.length + l3.length;
          }
        } catch (refErr) {
          totalRef = Number(data.totalReferrals || data.total_referrals || data.refCount || 0) || 0;
        }
      } else {
        totalRef = Number(data.totalReferrals || data.total_referrals || data.refCount || 0) || 0;
      }

      let elRef = document.getElementById('val-ref'); 
      if (elRef) elRef.textContent = totalRef;

      allMessages = await fetchUserMessages(u.id);
      let unread = allMessages.filter(m => !m.read).length, b = document.getElementById('bell-badge');
      if (b && unread > 0) { b.textContent = unread; b.classList.add('show'); }

      // چک کردن شماره تلفن (در صورت عدم وجود، انتقال به پروفایل)
      let phone = data.phone || data.phoneNumber || data.phone_number;
      if (!phone) {
        localStorage.setItem('profile_error', (ld[currLang] || ld.fa).phoneErr);
        window.location.replace('profile.html'); 
        return;
      }
    }
  } catch (e) { 
    console.error("خطا در پردازش اطلاعات کاربر:", e); 
  }
}

// شروع فرایند تایید هویت هنگام لود صفحه
initAuth();
