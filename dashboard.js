// مدیریت منوی شناور کازینو
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

// مدیریت دکمه‌های هدر (منوی سه خط، زبان، راهنما، زنگوله اعلانات)
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

// منوی سه خط (همبرگری)
if (menuBtn && navMenu) {
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navMenu.classList.toggle('show');
    closeAllMenus('nav');
  });
}

// منوی انتخاب زبان
if (langBtn && langMenu) {
  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langMenu.classList.toggle('show');
    closeAllMenus('lang');
  });
}

// تغییر زبان از منو
const langItems = document.querySelectorAll('#lang-menu .mi');
langItems.forEach(item => {
  item.addEventListener('click', (e) => {
    const lang = item.getAttribute('data-lang');
    if (lang) {
      localStorage.setItem('zenix_lang', lang);
      location.reload();
    }
  });
});

// دکمه راهنما
if (helpBtn) {
  helpBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllMenus();
    const helpModal = document.getElementById('help-modal');
    if (helpModal) {
      helpModal.classList.add('show');
    } else {
      alert('راهنمای داشبورد: از این پنل می‌توانید به بخش‌های کوانتیفیکیشن، واریز، برداشت، تراکنش‌ها و تنظیمات حساب خود دسترسی داشته باشید.');
    }
  });
}

// دکمه زنگوله اعلانات
if (bellBtn) {
  bellBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllMenus();
    const notifModal = document.getElementById('notif-modal') || document.getElementById('notification-modal');
    if (notifModal) {
      notifModal.classList.add('show');
    } else {
      if (typeof window.openNotifModal === 'function') {
        window.openNotifModal();
      } else {
        alert('اعلانی برای نمایش وجود ندارد.');
      }
    }
  });
}

// بستن تمامی منوها با کلیک در خارج از آن‌ها
document.addEventListener('click', (e) => {
  if (navMenu && !navMenu.contains(e.target) && e.target !== menuBtn) {
    navMenu.classList.remove('show');
  }
  if (langMenu && !langMenu.contains(e.target) && e.target !== langBtn) {
    langMenu.classList.remove('show');
  }
});
