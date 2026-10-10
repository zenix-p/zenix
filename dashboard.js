// اضافه کردن مدیریت کلیک روی دکمه شناور کازینو برای نمایش منوی انتخاب بازی‌ها
const floatingCasinoBtn = document.getElementById('floating-casino-btn');
const casinoPopupMenu = document.getElementById('casino-popup-menu');

if (floatingCasinoBtn && casinoPopupMenu) {
  floatingCasinoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    casinoPopupMenu.classList.toggle('show');
    const navMenu = document.getElementById('nav-menu');
    const langMenu = document.getElementById('lang-menu');
    if (navMenu) navMenu.classList.remove('show');
    if (langMenu) langMenu.classList.remove('show');
  });

  document.addEventListener('click', (e) => {
    if (!casinoPopupMenu.contains(e.target) && e.target !== floatingCasinoBtn) {
      casinoPopupMenu.classList.remove('show');
    }
  });
}
