// ==========================================
// 1. تنظیمات اولیه و اتصال به سوبابیس
// ==========================================
import { createClient } from 'https://cdn.jsdmirror.com/npm/@supabase/supabase-js@2/+esm';
const SUPABASE_URL = "https://ujyenmqdgivuxvxptwyl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_tRJPNKN0KUFfcta6I3xsNw_icShZQhO";

function escapeHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function safeGetItem(key) { try { return localStorage.getItem(key); } catch(e) { return null; } }
function safeSetItem(key, val) { try { localStorage.setItem(key, val); } catch(e) {} }

const customStorage = {
    getItem: (key) => safeGetItem(key),
    setItem: (key, value) => safeSetItem(key, value),
    removeItem: (key) => { try { localStorage.removeItem(key); } catch(e) {} }
};

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        storage: customStorage,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

let currentUserId = null;
let currentUserName = '';
let allMessages = [];
let currentNotifFilter = 'all';

function generateUIDDigits(userId) {
    if (!userId) return '000000';
    let hash = 5381;
    let str = String(userId);
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    return (Math.abs(hash % 900000) + 100000).toString();
}

// ==========================================
// 2. مدیریت مدال‌ها + قفل اسکرول
// ==========================================
function lockBody() { document.body.classList.add('modal-open'); }
function unlockBody() {
    setTimeout(() => {
        const anyOpen = document.querySelector('.modal.show');
        if (!anyOpen) document.body.classList.remove('modal-open');
    }, 50);
}

window.openAboutModal = function() {
    document.getElementById('m-about-modal')?.classList.add('show');
    lockBody();
    closeAllMenus();
};
window.closeAboutModal = function() {
    document.getElementById('m-about-modal')?.classList.remove('show');
    unlockBody();
};

window.openHelpModal = function() {
    document.getElementById('m-help-modal')?.classList.add('show');
    lockBody();
    closeAllMenus();
};
window.closeHelpModal = function() {
    document.getElementById('m-help-modal')?.classList.remove('show');
    unlockBody();
};

window.openCasinoModal = function() {
    document.getElementById('m-casino-modal')?.classList.add('show');
    lockBody();
    closeAllMenus();
};
window.closeCasinoModal = function() {
    document.getElementById('m-casino-modal')?.classList.remove('show');
    unlockBody();
};

// آکاردئون راهنما
window.toggleHelpAccordion = function(btn) {
    const item = btn.closest('.help-accordion');
    if (!item) return;
    const wasOpen = item.classList.contains('open');
    item.classList.toggle('open');

    if (!wasOpen) {
        setTimeout(() => {
            const body = item.closest('.help-modal-body');
            if (!body) return;
            const itemTop = item.offsetTop;
            const itemBottom = itemTop + item.offsetHeight;
            const bodyScrollTop = body.scrollTop;
            const bodyHeight = body.clientHeight;

            if (itemBottom > bodyScrollTop + bodyHeight - 20) {
                body.scrollTo({ top: itemBottom - bodyHeight + 20, behavior: 'smooth' });
            } else if (itemTop < bodyScrollTop + 20) {
                body.scrollTo({ top: itemTop - 20, behavior: 'smooth' });
            }
        }, 320);
    }
};

// متن معرفی جمع‌شونده
window.toggleAboutBox = function() {
    const box = document.getElementById('platformInfoBox');
    if (!box) return;
    box.classList.toggle('expanded');
    const toggleText = document.getElementById('t-about-toggle');
    if (toggleText) {
        const t = ld[currLang] || ld.en;
        toggleText.textContent = box.classList.contains('expanded')
            ? (t.aboutToggleClose || 'بستن')
            : (t.aboutToggleOpen || 'مشاهده بیشتر');
    }
};

// ==========================================
// 3. بازار ارزهای دیجیتال — با توقف در تب مخفی
// ==========================================
let cryptoInterval = null;
let cryptoAbortController = null;

async function fetchCryptoPrices() {
    const tickerContainer = document.getElementById('crypto-ticker-list');
    if (!tickerContainer) return;

    // اگر تب مخفی است، درخواست نزن
    if (document.hidden) return;

    // لغو درخواست قبلی اگر هنوز در جریان است
    if (cryptoAbortController) cryptoAbortController.abort();
    cryptoAbortController = new AbortController();

    try {
        const response = await fetch(
            'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=1&sparkline=false',
            { signal: cryptoAbortController.signal }
        );
        if (!response.ok) throw new Error('خطا در دریافت قیمت');
        
        const data = await response.json();
        const top3 = data.slice(0, 3);

        let html = '';
        top3.forEach(coin => {
            const price = coin.current_price >= 1 ? coin.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : coin.current_price.toFixed(4);
            const change = coin.price_change_percentage_24h || 0;
            const changeClass = change >= 0 ? 'price-up' : 'price-down';
            const changeSign = change >= 0 ? '+' : '';
            const safeSymbol = escapeHtml(coin.symbol.toUpperCase());
            const safeName = escapeHtml(coin.name);
            const safeImage = escapeHtml(coin.image);

            html += `
                <div class="crypto-row">
                    <div class="crypto-info">
                        <div class="crypto-icon"><img src="${safeImage}" alt="${safeSymbol}" loading="lazy" decoding="async"></div>
                        <div>
                            <strong style="color:#fff;font-size:12px;">${safeSymbol}</strong>
                            <span style="font-size:10px;color:#94a3b8;display:block;">${safeName}</span>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div style="color:#fff;font-weight:bold;font-size:12px;">$${price}</div>
                        <div class="${changeClass}" style="font-size:10px;">${changeSign}${change.toFixed(2)}%</div>
                    </div>
                </div>
            `;
        });

        tickerContainer.innerHTML = html;
    } catch (err) {
        if (err.name === 'AbortError') return; // لغو شده، نادیده بگیر
        console.error('خطای دریافت قیمت:', err);
        tickerContainer.innerHTML = `
            <div class="crypto-row"><div class="crypto-info"><strong style="color:#fff;">BTC</strong></div><div style="text-align:right;"><span style="color:#fff;">$96,500.00</span><div class="price-up">+2.15%</div></div></div>
            <div class="crypto-row"><div class="crypto-info"><strong style="color:#fff;">ETH</strong></div><div style="text-align:right;"><span style="color:#fff;">$2,780.50</span><div class="price-up">+1.84%</div></div></div>
            <div class="crypto-row"><div class="crypto-info"><strong style="color:#fff;">SOL</strong></div><div style="text-align:right;"><span style="color:#fff;">$198.20</span><div class="price-down">-0.65%</div></div></div>
        `;
    }
}

function startCryptoTicker() {
    if (cryptoInterval) return;
    fetchCryptoPrices();
    cryptoInterval = setInterval(fetchCryptoPrices, 30000);
}
function stopCryptoTicker() {
    if (cryptoInterval) { clearInterval(cryptoInterval); cryptoInterval = null; }
}

// ★ توقف کامل وقتی تب مخفی است (ذخیره باتری و CPU)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopCryptoTicker();
    else startCryptoTicker();
});

startCryptoTicker();

// ==========================================
// 4. سیستم اعلان‌ها
// ==========================================
function getNotifCategory(m) {
    let t = (m.type || '').toLowerCase();
    let title = (m.subject || '').toLowerCase();
    if (t.includes('approved') || title.includes('تایید') || title.includes('approved')) return 'approved';
    if (t.includes('rejected') || title.includes('لغو') || title.includes('رد') || title.includes('rejected')) return 'rejected';
    return 'admin_message';
}

async function fetchUserMessages(uid) {
    try {
        const { data } = await supabaseClient.from('notifications').select('*').eq('user_id', uid).order('created_at', { ascending: false });
        return (data || []).map(dt => ({
            id: dt.id,
            subject: dt.title || dt.subject || 'اطلاعیه',
            body: dt.message || dt.text || dt.body || '',
            time: dt.created_at ? new Date(dt.created_at).toLocaleString() : '',
            read: dt.read === true || dt.is_read === true,
            type: dt.type || dt.category || 'admin_message'
        }));
    } catch (e) {
        return [];
    }
}

function updateNotifBadges() {
    let unread = allMessages.filter(m => !m.read).length;
    let b = document.getElementById('bell-badge');
    if (b) { b.textContent = unread; b.classList.toggle('show', unread > 0); }
    let cntAll = document.getElementById('cnt-tab-all');
    let cntApp = document.getElementById('cnt-tab-approved');
    let cntRej = document.getElementById('cnt-tab-rejected');
    let cntAdm = document.getElementById('cnt-tab-admin');
    if (cntAll) cntAll.textContent = allMessages.length;
    if (cntApp) cntApp.textContent = allMessages.filter(m => getNotifCategory(m) === 'approved').length;
    if (cntRej) cntRej.textContent = allMessages.filter(m => getNotifCategory(m) === 'rejected').length;
    if (cntAdm) cntAdm.textContent = allMessages.filter(m => getNotifCategory(m) === 'admin_message').length;
}

window.setNotifFilter = function(filter, el) {
    currentNotifFilter = filter;
    document.querySelectorAll('.notif-tab').forEach(b => b.classList.remove('active'));
    if (el) el.classList.add('active');
    renderMessageList();
};

window.openMessageModal = async () => {
    if (currentUserId) {
        allMessages = await fetchUserMessages(currentUserId);
        updateNotifBadges();
    }
    renderMessageList();
    document.getElementById('m-msg')?.classList.add('show');
    lockBody();
};

function renderMessageList() {
    let c = document.getElementById('modal-msg-container');
    if (!c) return;
    let t = ld[currLang] || ld.fa;
    let list = allMessages;
    if (currentNotifFilter !== 'all') {
        list = allMessages.filter(m => getNotifCategory(m) === currentNotifFilter);
    }

    if (!list || list.length === 0) {
        c.innerHTML = `<div style="text-align:center;padding:20px;color:#94a3b8">${t.noMsg || 'هیچ پیام جدیدی وجود ندارد.'}</div>`;
        return;
    }

    let html = '<div style="display:flex;flex-direction:column;gap:10px;">';
    list.forEach((m) => {
        let realIdx = allMessages.indexOf(m);
        let dTime = m.time || '';
        let unread = !m.read;
        let iconClass = 'fa-envelope-open-text';
        let iconColor = '#38bdf8';
        let cat = getNotifCategory(m);

        if (cat === 'approved') { iconClass = 'fa-check-circle'; iconColor = '#22c55e'; }
        else if (cat === 'rejected') { iconClass = 'fa-times-circle'; iconColor = '#ef4444'; }
        else { iconClass = 'fa-bullhorn'; iconColor = '#38bdf8'; }

        const safeSubject = escapeHtml(m.subject);
        const safeBody = escapeHtml(m.body);
        const safeTime = escapeHtml(dTime);

        html += `<div class="msg-body-box" style="cursor:pointer;border-right:${unread ? '3px solid #38bdf8' : '1px solid rgba(255,255,255,.08)'};" onclick="window.readAdminMessage(${realIdx})">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div class="msg-title-text" style="${unread ? 'color:#fff;font-weight:800;' : ''}"><i class="fas ${iconClass}" style="color:${iconColor};margin-left:5px;"></i> ${safeSubject}</div>
                ${unread ? `<span style="font-size:9px;background:#38bdf8;color:#0f172a;padding:2px 6px;border-radius:4px;font-weight:700;">${t.newBadge || 'جدید'}</span>` : ''}
            </div>
            <div class="msg-desc-text" style="margin-top:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${safeBody}</div>
            <div style="font-size:10px;color:#64748b;margin-top:6px;text-align:left" dir="ltr">${safeTime}</div>
        </div>`;
    });
    c.innerHTML = html + '</div>';
}

window.readAdminMessage = async idx => {
    let m = allMessages[idx]; if (!m) return;
    allMessages[idx].read = true;
    if (currentUserId && m.id) {
        try { await supabaseClient.from('notifications').update({ read: true, is_read: true }).eq('id', m.id); } catch(e) {}
    }
    updateNotifBadges();
    renderMessageList();

    let titleEl = document.getElementById('detail-msg-title');
    let dateEl = document.getElementById('detail-msg-date');
    let bodyEl = document.getElementById('detail-msg-body');

    if (titleEl) titleEl.innerHTML = `<i class="fas fa-envelope-open"></i> ${escapeHtml(m.subject)}`;
    if (dateEl) { dateEl.textContent = m.time || ''; dateEl.style.display = m.time ? 'block' : 'none'; }
    if (bodyEl) bodyEl.textContent = m.body || '';

    document.getElementById('m-msg-detail')?.classList.add('show');
};

window.closeMessageModal = () => {
    document.getElementById('m-msg')?.classList.remove('show');
    unlockBody();
};
window.closeMsgDetailModal = () => {
    document.getElementById('m-msg-detail')?.classList.remove('show');
    unlockBody();
};

document.getElementById('bell-btn')?.addEventListener('click', e => { 
    e.stopPropagation(); 
    window.openMessageModal(); 
});

// ==========================================
// 5. سیستم ترجمه کامل ۸ زبانه
// ==========================================
const SUPPORTED_LANGUAGES = ['en', 'fa', 'ar', 'tr', 'ru', 'es', 'fr', 'de'];
const savedLang = safeGetItem('zenix_lang');
let currLang = SUPPORTED_LANGUAGES.includes(savedLang) ? savedLang : 'en';

const ld = {
    fa: {
        m1: 'صفحه اصلی', m2: 'کوانتیفیکیشن', m3: 'واریز', m4: 'برداشت', m_team: 'تیم من', m5: 'تراکنش', m6: 'پروفایل', m7: 'پشتیبانی', m_about: 'درباره پلتفرم', m8: 'خروج',
        wel: 'خوش آمدید', sub: 'پنل مدیریت کاربری', st: 'تایید شده',
        ts1: 'موجودی', ts2: 'زیرمجموعه',
        c1: 'کوانتیفیکیشن', d1: 'معاملات هوشمند',
        c2: 'واریز', d2: 'شارژ حساب',
        c3: 'برداشت', d3: 'برداشت دارایی',
        c4: 'تیم', d4: 'زیرمجموعه‌ها',
        c5: 'تراکنش‌ها', d5: 'تاریخچه مالی',
        c6: 'پروفایل', d6: 'تنظیمات امنیت',
        tmkt: 'بازار ارزهای دیجیتال (۳ ارز برتر از ۳۰ ارز رصد شده)', tlive: 'زنده',
        aboutToggleOpen: 'مشاهده بیشتر', aboutToggleClose: 'بستن متن',
        aboutTitle: 'درباره پلتفرم هوشمند زِنیکس (Zenix)',
        aboutIntro: 'به زِنیکس (Zenix) خوش آمدید؛ جایی که افق‌های مالی دیجیتال و قدرت فناوری مدرن در هم می‌آمیزند تا مسیری به سوی آینده‌ای روشن‌تر را روشن کنند. زِنیکس بر پایه یک باور عمیق بنا شده است: دنیای دارایی‌های دیجیتال نباید یک هزارتوی پیچیده باشد، بلکه باید یک اکوسیستم شفاف، در دسترس و امن برای همه باشد.',
        aboutDesc: 'در عصری که با شتاب بی‌وقفه تعریف می‌شود، جایی که بازارهای جهانی هرگز نمی‌خوابند و تغییر تنها ثابتِ آن است، داشتن یک همراه مطمئن و هوشمند امری حیاتی است. زِنیکس با تکیه بر معماری ابری پیشرفته، الگوریتم‌های کوانتیفیکیشن نوین و لایه‌های امنیتی چندگانه و نفوذناپذیر، پناهگاهی یکپارچه و یکدست برای مدیریت ثروت شما فراهم کرده است. ما فقط در حال ساختن یک پلتفرم نیستیم؛ ما در حال خلق محیطی هستیم که در آن فناوری در خدمت جاه‌طلبی‌های انسانی قرار می‌گیرد، موانع را از بین می‌برد و آنچه را که در اقتصاد دیجیتال ممکن است، بازتعریف می‌کند.',
        aboutGoal: '<strong style="color:#38bdf8;">هدف ما:</strong> دموکراتیزه کردن امور استثنایی است. ما تلاش می‌کنیم همان ابزارهای مالی قدرتمندی که نخبگان نهادی از آن استفاده می‌کنند را در اختیار صاحبان دید روزمره قرار دهیم. چه در حال برداشتن اولین قدم خود باشید و چه یک متخصص کارکشته، زِنیکس به شما قدرت می‌دهد تا با اطمینان در بازارهای جهانی حرکت کنید، بدون نیاز به تخصص پیچیده، و تضمین می‌کند که سرمایه شما در محیطی از امنیت مطلق، شفافیت و پتانسیل پویا رشد کند.',
        aboutStrategy: '<strong style="color:#38bdf8;">استراتژی ما:</strong> بر یک سه‌گانه ناگسستنی بنا شده است—امنیت بدون سازش، شفافیت رادیکال و نوآوری بی‌وقفه. با ادغام الگوریتم‌های پردازش داده پیشرفته، یک سیستم پاداش چندلایه پویا و زیرساخت‌های بی‌نهایت مقیاس‌پذیر، ما تجربه‌ای بی‌نقص، فوق‌العاده سریع و بسیار قابل اعتماد را مهندسی می‌کنیم. ما پیچیدگی‌ها را مدیریت می‌کنیم تا تمرکز شما تنها روی مهم‌ترین چیز باقی بماند: رشد و موفقیت شما.',
        aboutConclusion: '<i class="fas fa-quote-right" style="color:#38bdf8;margin-left:4px;"></i> زِنیکس فراتر از تعریف یک پلتفرم صرف است؛ این یک اکوسیستم پرجنب‌وجوش است که در آن فناوری، سرمایه و جامعه‌ای از پیشروان اندیشه گرد هم می‌آیند. ما شریک استوار شما در این سفر هستیم و متعهد به هدایت شما به سوی آینده‌ای با آزادی مالی بیشتر، فرصت‌های بی‌کران و دستاوردهای عظیم هستیم. ما با هم نه تنها آینده را پیش‌بینی می‌کنیم—بلکه آن را می‌سازیم.',
        floatingCasino: 'کازینو', floatingCasinoTitle: 'بازی‌های کازینو',
        helpBtnTitle: 'راهنمای صفحه داشبورد',
        detailMsgTitle: 'مشاهده پیام',
        aboutModalTitle: '<i class="fas fa-info-circle"></i> درباره پلتفرم هوشمند زِنیکس',
        modalTitle: 'صندوق پیام‌ها و اعلان‌ها', noMsg: 'هیچ پیام جدیدی وجود ندارد.', newBadge: 'جدید',
        tabAll: 'همه', tabApproved: 'تایید درخواست', tabRejected: 'لغو درخواست', tabAdmin: 'پیام مدیریت',
        helpTitle: 'راهنمای جامع داشبورد زِنیکس',
        helpSubtitle: 'راهنمای کامل استفاده از پنل',
        helpIntro: 'به بخش مدیریت و داشبورد کاربری پلتفرم زِنیکس خوش آمدید. در این بخش می‌توانید خلاصه‌ای از عملکرد مالی و دسترسی سریع به بخش‌های اصلی داشته باشید.',
        helpS1Title: 'آمار و موجودی',
        helpS1Desc: 'در بالای صفحه، موجودی کل حساب (USDT) و تعداد اعضای زیرمجموعه به‌صورت زنده نمایش داده می‌شود. با هر تراکنش، موجودی به‌روز می‌شود.',
        helpS2Title: 'دسترسی سریع (میانبرها)',
        helpS2List: '<li><strong>کوانتیفیکیشن:</strong> ورود به معاملات هوشمند و رباتیک و دریافت سود روزانه.</li><li><strong>واریز:</strong> شارژ حساب با ولت‌های دیجیتال و تأیید شبکه.</li><li><strong>برداشت:</strong> ثبت درخواست برداشت به کیف پول شخصی.</li><li><strong>تیم:</strong> مشاهده اعضای زیرمجموعه (سطوح ۱ تا ۳) و لینک دعوت اختصاصی.</li><li><strong>تراکنش‌ها:</strong> تاریخچه کامل واریز، برداشت و سود.</li><li><strong>پروفایل:</strong> مدیریت امنیت، رمز عبور و تنظیمات.</li>',
        helpS3Title: 'بازار ارزهای دیجیتال',
        helpS3Desc: 'قیمت ۳ ارز برتر بازار به‌صورت زنده هر ۳۰ ثانیه به‌روزرسانی می‌شود. رنگ سبز نشان‌دهنده رشد و رنگ قرمز کاهش قیمت در ۲۴ ساعت گذشته است.',
        helpS4Title: 'اعلان‌ها و پیام‌ها',
        helpS4Desc: 'با کلیک روی آیکون زنگوله در هدر، پیام‌های مدیریت، تأیید یا لغو درخواست‌ها را ببینید. تعداد پیام‌های جدید روی آیکون زنگوله نمایش داده می‌شود.',
        helpS5Title: 'بازی‌های کازینو',
        helpS5Desc: 'با کلیک روی دکمه شناور گوشه صفحه، وارد بخش بازی‌های کازینو می‌شوید. رولت آنلاین و پلینکو در دسترس هستند و بازی‌ها با موجودی مجزا و به‌صورت دمو اجرا می‌شوند.',
        helpS6Title: 'نکات امنیتی مهم',
        helpS6Desc: 'هرگز رمز عبور خود را با کسی به اشتراک نگذارید. زِنیکس هرگز از شما رمز، کد تأیید یا کلید خصوصی نمی‌خواهد. برای برداشت، تأیید دو مرحله‌ای فعال کنید و از لینک‌های ناشناس وارد نشوید.',
        helpFooter: 'در صورت نیاز به راهنمایی بیشتر، با پشتیبانی زِنیکس از طریق صفحه پشتیبانی در ارتباط باشید.',
        casinoModalTitle: 'انتخاب بازی‌های کازینو',
        casinoPoker: 'رولت آنلاین', casinoPokerDesc: 'بازی هیجان‌انگیز و شانس',
        casinoPlinko: 'پلینکو (پاپالان)', casinoPlinkoDesc: 'بازی محبوب ریزش مهره‌ها'
    },
    en: {
        m1: 'Home', m2: 'Quantification', m3: 'Deposit', m4: 'Withdraw', m_team: 'My Team', m5: 'Transactions', m6: 'Profile', m7: 'Support', m_about: 'About Platform', m8: 'Logout',
        wel: 'Welcome', sub: 'User Management Panel', st: 'Verified',
        ts1: 'Balance', ts2: 'Referrals',
        c1: 'Quantification', d1: 'Smart Trading',
        c2: 'Deposit', d2: 'Account Top-up',
        c3: 'Withdraw', d3: 'Asset Withdrawal',
        c4: 'Team', d4: 'Sub-accounts',
        c5: 'Transactions', d5: 'Financial History',
        c6: 'Profile', d6: 'Security Settings',
        tmkt: 'Cryptocurrency Market (Top 3 of 30 tracked coins)', tlive: 'Live',
        aboutToggleOpen: 'Show more', aboutToggleClose: 'Show less',
        aboutTitle: 'About Zenix Smart Platform',
        aboutIntro: 'Welcome to Zenix, where the horizons of digital finance and the power of modern technology intertwine to illuminate a path toward a brighter future. Zenix was founded on a profound belief: the world of digital assets should not be a labyrinth of complexity, but a transparent, accessible, and secure ecosystem for everyone.',
        aboutDesc: 'In an era defined by relentless momentum, where global markets never sleep and change is the only constant, having a reliable and intelligent companion is paramount. Zenix, leveraging cutting-edge cloud architecture, advanced quantification algorithms, and impenetrable multi-layered security, provides you with a unified, seamless sanctuary for wealth management.',
        aboutGoal: '<strong style="color:#38bdf8;">Our Goal:</strong> To democratize the extraordinary. We strive to place the same powerful financial tools used by institutional elites into the hands of everyday visionaries.',
        aboutStrategy: '<strong style="color:#38bdf8;">Our Strategy:</strong> Built upon an unbreakable triad—uncompromising security, radical transparency, and relentless innovation.',
        aboutConclusion: '<i class="fas fa-quote-right" style="color:#38bdf8;margin-left:4px;"></i> Zenix transcends the definition of a mere platform; it is a vibrant ecosystem where technology, capital, and a community of forward-thinkers converge.',
        floatingCasino: 'Casino', floatingCasinoTitle: 'Casino Games',
        helpBtnTitle: 'Dashboard Help',
        detailMsgTitle: 'View Message',
        aboutModalTitle: '<i class="fas fa-info-circle"></i> About Zenix Smart Platform',
        modalTitle: 'Notifications & Messages', noMsg: 'No new messages.', newBadge: 'NEW',
        tabAll: 'All', tabApproved: 'Approved', tabRejected: 'Rejected', tabAdmin: 'Admin Msg',
        helpTitle: 'Zenix Dashboard Comprehensive Guide',
        helpSubtitle: 'Complete guide to the panel',
        helpIntro: 'Welcome to the Zenix user management dashboard. Here you can find a summary of your financial performance and quick access to core sections.',
        helpS1Title: 'Stats & Balance',
        helpS1Desc: 'At the top of the page, your total balance (USDT) and network referral count are displayed live. Balance updates with each transaction.',
        helpS2Title: 'Quick Shortcuts',
        helpS2List: '<li><strong>Quantification:</strong> Automated robotic trading.</li><li><strong>Deposit:</strong> Top up via digital wallets.</li><li><strong>Withdraw:</strong> Request asset withdrawals.</li><li><strong>Team:</strong> View members and referral link.</li><li><strong>Transactions:</strong> Full financial history.</li><li><strong>Profile:</strong> Security and settings.</li>',
        helpS3Title: 'Crypto Market',
        helpS3Desc: 'Top 3 crypto prices update every 30 seconds. Green = growth, red = 24h decline.',
        helpS4Title: 'Notifications & Messages',
        helpS4Desc: 'Click the bell icon in the header to view admin messages, approvals, or rejections.',
        helpS5Title: 'Casino Games',
        helpS5Desc: 'Click the floating button on the corner to enter casino games. Roulette and plinko available as demo.',
        helpS6Title: 'Important Security Notes',
        helpS6Desc: 'Never share your password. Zenix will never ask for your password, verification code, or private key.',
        helpFooter: 'For further assistance, contact Zenix Support.',
        casinoModalTitle: 'Select Casino Games',
        casinoPoker: 'Online Roulette', casinoPokerDesc: 'Exciting game of chance',
        casinoPlinko: 'Plinko', casinoPlinkoDesc: 'Popular dropping ball game'
    },
    ar: {
        m1: 'الرئيسية', m2: 'التكميم', m3: 'إيداع', m4: 'سحب', m_team: 'فريقي', m5: 'المعاملات', m6: 'الملف الشخصي', m7: 'الدعم', m_about: 'حول المنصة', m8: 'تسجيل الخروج',
        wel: 'أهلاً بك', sub: 'لوحة إدارة المستخدم', st: 'موثق',
        ts1: 'الرصيد', ts2: 'الإحالات',
        c1: 'التكميم', d1: 'التداول الذكي', c2: 'إيداع', d2: 'شحن الحساب', c3: 'سحب', d3: 'سحب الأصول',
        c4: 'الفريق', d4: 'الإحالات', c5: 'المعاملات', d5: 'السجل المالي', c6: 'الملف الشخصي', d6: 'إعدادات الأمان',
        tmkt: 'سوق العملات الرقمية', tlive: 'مباشر',
        aboutToggleOpen: 'عرض المزيد', aboutToggleClose: 'إظهار أقل',
        aboutTitle: 'حول منصة Zenix الذكية',
        aboutIntro: 'مرحباً بك في Zenix، حيث تتشابك آفاق التمويل الرقمي وقوة التكنولوجيا الحديثة.',
        aboutDesc: 'في عصر يتسم بالزخم الذي لا يلين، وجود رفيق موثوق وذكي أمر بالغ الأهمية.',
        aboutGoal: '<strong style="color:#38bdf8;">هدفنا:</strong> إضفاء الطابع الديمقراطي على الاستثنائي.',
        aboutStrategy: '<strong style="color:#38bdf8;">استراتيجيتنا:</strong> مبنية على ثلاثية غير قابلة للكسر.',
        aboutConclusion: '<i class="fas fa-quote-right" style="color:#38bdf8;margin-left:4px;"></i> تتجاوز Zenix تعريف مجرد منصة.',
        floatingCasino: 'كازينو', floatingCasinoTitle: 'ألعاب الكازينو',
        helpBtnTitle: 'مساعدة', detailMsgTitle: 'عرض الرسالة',
        aboutModalTitle: '<i class="fas fa-info-circle"></i> حول منصة Zenix الذكية',
        modalTitle: 'الرسائل والإشعارات', noMsg: 'لا توجد رسائل جديدة.', newBadge: 'جديد',
        tabAll: 'الكل', tabApproved: 'مقبولة', tabRejected: 'مرفوضة', tabAdmin: 'الإدارة',
        helpTitle: 'دليل لوحة التحكم', helpSubtitle: 'دليل شامل',
        helpIntro: 'مرحباً بك في لوحة تحكم Zenix.',
        helpS1Title: 'الإحصائيات والرصيد', helpS1Desc: 'في أعلى الصفحة عرض رصيدك وعدد إحالاتك.',
        helpS2Title: 'الاختصارات', helpS2List: '<li>التكميم</li><li>إيداع</li><li>سحب</li><li>الفريق</li><li>المعاملات</li><li>الملف الشخصي</li>',
        helpS3Title: 'سوق العملات', helpS3Desc: 'يتم تحديث الأسعار كل 30 ثانية.',
        helpS4Title: 'الإشعارات', helpS4Desc: 'انقر على الجرس لعرض الرسائل.',
        helpS5Title: 'ألعاب الكازينو', helpS5Desc: 'انقر على الزر العائم.',
        helpS6Title: 'الأمان', helpS6Desc: 'لا تشارك كلمة المرور.',
        helpFooter: 'للمزيد تواصل مع الدعم.',
        casinoModalTitle: 'اختر اللعبة', casinoPoker: 'رولت', casinoPokerDesc: 'لعبة حظ', casinoPlinko: 'بلينكو', casinoPlinkoDesc: 'لعبة كرات'
    },
    tr: {
        m1: 'Ana Sayfa', m2: 'Kuantifikasyon', m3: 'Yatırım', m4: 'Çekim', m_team: 'Ekibim', m5: 'İşlemler', m6: 'Profil', m7: 'Destek', m_about: 'Platform', m8: 'Çıkış',
        wel: 'Hoş Geldiniz', sub: 'Kullanıcı Paneli', st: 'Onaylandı',
        ts1: 'Bakiye', ts2: 'Referanslar',
        c1: 'Kuantifikasyon', d1: 'Akıllı İşlem', c2: 'Yatırım', d2: 'Hesap Yükleme', c3: 'Çekim', d3: 'Varlık Çekimi',
        c4: 'Ekip', d4: 'Alt Hesaplar', c5: 'İşlemler', d5: 'Finansal Geçmiş', c6: 'Profil', d6: 'Güvenlik',
        tmkt: 'Kripto Para Piyasası', tlive: 'Canlı',
        aboutToggleOpen: 'Daha fazla', aboutToggleClose: 'Daha az',
        aboutTitle: 'Zenix Platform Hakkında', aboutIntro: 'Zenix\'e hoş geldiniz.', aboutDesc: 'Dijital varlıklar dünyası.',
        aboutGoal: '<strong>Hedefimiz:</strong> Demokratikleştirmek.', aboutStrategy: '<strong>Stratejimiz:</strong> Güvenlik, şeffaflık, inovasyon.',
        aboutConclusion: '<i class="fas fa-quote-right"></i> Zenix bir ekosistemdir.',
        floatingCasino: 'Casino', floatingCasinoTitle: 'Casino',
        helpBtnTitle: 'Yardım', detailMsgTitle: 'Mesaj',
        aboutModalTitle: 'Zenix Hakkında', modalTitle: 'Bildirimler', noMsg: 'Yeni mesaj yok.', newBadge: 'YENİ',
        tabAll: 'Tümü', tabApproved: 'Onaylı', tabRejected: 'Red', tabAdmin: 'Yönetici',
        helpTitle: 'Zenix Rehberi', helpSubtitle: 'Kapsamlı rehber',
        helpIntro: 'Zenix paneline hoş geldiniz.',
        helpS1Title: 'Bakiye', helpS1Desc: 'Bakiyeniz ve referans sayınız üstte gösterilir.',
        helpS2Title: 'Kısayollar', helpS2List: '<li>Kuantifikasyon</li><li>Yatırım</li><li>Çekim</li><li>Ekip</li><li>İşlemler</li><li>Profil</li>',
        helpS3Title: 'Kripto', helpS3Desc: 'Her 30 saniyede güncellenir.',
        helpS4Title: 'Bildirimler', helpS4Desc: 'Zil simgesine tıklayın.',
        helpS5Title: 'Casino', helpS5Desc: 'Yüzen butona tıklayın.',
        helpS6Title: 'Güvenlik', helpS6Desc: 'Şifrenizi paylaşmayın.',
        helpFooter: 'Zenix Desteği ile iletişime geçin.',
        casinoModalTitle: 'Oyun Seç', casinoPoker: 'Rulet', casinoPokerDesc: 'Şans oyunu', casinoPlinko: 'Plinko', casinoPlinkoDesc: 'Top oyunu'
    },
    ru: {
        m1: 'Главная', m2: 'Квантификация', m3: 'Депозит', m4: 'Вывод', m_team: 'Команда', m5: 'Транзакции', m6: 'Профиль', m7: 'Поддержка', m_about: 'О платформе', m8: 'Выход',
        wel: 'Добро пожаловать', sub: 'Панель', st: 'Подтверждено',
        ts1: 'Баланс', ts2: 'Рефералы',
        c1: 'Квантификация', d1: 'Торговля', c2: 'Депозит', d2: 'Пополнение', c3: 'Вывод', d3: 'Вывод',
        c4: 'Команда', d4: 'Рефералы', c5: 'Транзакции', d5: 'История', c6: 'Профиль', d6: 'Безопасность',
        tmkt: 'Крипторынок', tlive: 'Онлайн',
        aboutToggleOpen: 'Больше', aboutToggleClose: 'Меньше',
        aboutTitle: 'О Zenix', aboutIntro: 'Добро пожаловать в Zenix.', aboutDesc: 'Цифровые финансы.',
        aboutGoal: '<strong>Цель:</strong> Демократизация.', aboutStrategy: '<strong>Стратегия:</strong> Безопасность.',
        aboutConclusion: '<i class="fas fa-quote-right"></i> Zenix — экосистема.',
        floatingCasino: 'Казино', floatingCasinoTitle: 'Казино',
        helpBtnTitle: 'Помощь', detailMsgTitle: 'Сообщение',
        aboutModalTitle: 'О Zenix', modalTitle: 'Уведомления', noMsg: 'Нет сообщений.', newBadge: 'НОВОЕ',
        tabAll: 'Все', tabApproved: 'Одобрено', tabRejected: 'Отклонено', tabAdmin: 'Админ',
        helpTitle: 'Zenix', helpSubtitle: 'Полное руководство',
        helpIntro: 'Добро пожаловать.',
        helpS1Title: 'Баланс', helpS1Desc: 'Баланс и рефералы.',
        helpS2Title: 'Ярлыки', helpS2List: '<li>Квантификация</li><li>Депозит</li><li>Вывод</li><li>Команда</li><li>Транзакции</li><li>Профиль</li>',
        helpS3Title: 'Рынок', helpS3Desc: 'Обновление каждые 30с.',
        helpS4Title: 'Уведомления', helpS4Desc: 'Нажмите на колокольчик.',
        helpS5Title: 'Казино', helpS5Desc: 'Нажмите на кнопку.',
        helpS6Title: 'Безопасность', helpS6Desc: 'Не делитесь паролем.',
        helpFooter: 'Поддержка Zenix.',
        casinoModalTitle: 'Выбор игры', casinoPoker: 'Рулетка', casinoPokerDesc: 'Шанс', casinoPlinko: 'Плинко', casinoPlinkoDesc: 'Шарики'
    },
    es: {
        m1: 'Inicio', m2: 'Cuantificación', m3: 'Depósito', m4: 'Retiro', m_team: 'Equipo', m5: 'Transacciones', m6: 'Perfil', m7: 'Soporte', m_about: 'Plataforma', m8: 'Salir',
        wel: 'Bienvenido', sub: 'Panel', st: 'Verificado',
        ts1: 'Saldo', ts2: 'Referidos',
        c1: 'Cuantificación', d1: 'Trading', c2: 'Depósito', d2: 'Recarga', c3: 'Retiro', d3: 'Retiro',
        c4: 'Equipo', d4: 'Subcuentas', c5: 'Transacciones', d5: 'Historial', c6: 'Perfil', d6: 'Seguridad',
        tmkt: 'Mercado cripto', tlive: 'En vivo',
        aboutToggleOpen: 'Ver más', aboutToggleClose: 'Ver menos',
        aboutTitle: 'Sobre Zenix', aboutIntro: 'Bienvenido a Zenix.', aboutDesc: 'Finanzas digitales.',
        aboutGoal: '<strong>Objetivo:</strong> Democratizar.', aboutStrategy: '<strong>Estrategia:</strong> Seguridad.',
        aboutConclusion: '<i class="fas fa-quote-right"></i> Zenix es un ecosistema.',
        floatingCasino: 'Casino', floatingCasinoTitle: 'Casino',
        helpBtnTitle: 'Ayuda', detailMsgTitle: 'Mensaje',
        aboutModalTitle: 'Sobre Zenix', modalTitle: 'Notificaciones', noMsg: 'Sin mensajes.', newBadge: 'NUEVO',
        tabAll: 'Todo', tabApproved: 'Aprobado', tabRejected: 'Rechazado', tabAdmin: 'Admin',
        helpTitle: 'Guía Zenix', helpSubtitle: 'Guía completa',
        helpIntro: 'Bienvenido.',
        helpS1Title: 'Saldo', helpS1Desc: 'Saldo y referidos.',
        helpS2Title: 'Accesos', helpS2List: '<li>Cuantificación</li><li>Depósito</li><li>Retiro</li><li>Equipo</li><li>Transacciones</li><li>Perfil</li>',
        helpS3Title: 'Mercado', helpS3Desc: 'Actualización cada 30s.',
        helpS4Title: 'Notificaciones', helpS4Desc: 'Clic en la campana.',
        helpS5Title: 'Casino', helpS5Desc: 'Clic en el botón flotante.',
        helpS6Title: 'Seguridad', helpS6Desc: 'No comparta contraseña.',
        helpFooter: 'Soporte Zenix.',
        casinoModalTitle: 'Elegir juego', casinoPoker: 'Ruleta', casinoPokerDesc: 'Azar', casinoPlinko: 'Plinko', casinoPlinkoDesc: 'Bolas'
    },
    fr: {
        m1: 'Accueil', m2: 'Quantification', m3: 'Dépôt', m4: 'Retrait', m_team: 'Équipe', m5: 'Transactions', m6: 'Profil', m7: 'Support', m_about: 'Plateforme', m8: 'Déconnexion',
        wel: 'Bienvenue', sub: 'Panneau', st: 'Vérifié',
        ts1: 'Solde', ts2: 'Parrainages',
        c1: 'Quantification', d1: 'Trading', c2: 'Dépôt', d2: 'Recharge', c3: 'Retrait', d3: 'Retrait',
        c4: 'Équipe', d4: 'Sous-comptes', c5: 'Transactions', d5: 'Historique', c6: 'Profil', d6: 'Sécurité',
        tmkt: 'Marché crypto', tlive: 'Direct',
        aboutToggleOpen: 'Voir plus', aboutToggleClose: 'Voir moins',
        aboutTitle: 'À propos de Zenix', aboutIntro: 'Bienvenue sur Zenix.', aboutDesc: 'Finance numérique.',
        aboutGoal: '<strong>Objectif:</strong> Démocratiser.', aboutStrategy: '<strong>Stratégie:</strong> Sécurité.',
        aboutConclusion: '<i class="fas fa-quote-right"></i> Zenix est un écosystème.',
        floatingCasino: 'Casino', floatingCasinoTitle: 'Casino',
        helpBtnTitle: 'Aide', detailMsgTitle: 'Message',
        aboutModalTitle: 'À propos', modalTitle: 'Notifications', noMsg: 'Aucun message.', newBadge: 'NOUVEAU',
        tabAll: 'Tout', tabApproved: 'Approuvé', tabRejected: 'Rejeté', tabAdmin: 'Admin',
        helpTitle: 'Guide Zenix', helpSubtitle: 'Guide complet',
        helpIntro: 'Bienvenue.',
        helpS1Title: 'Solde', helpS1Desc: 'Solde et parrainages.',
        helpS2Title: 'Raccourcis', helpS2List: '<li>Quantification</li><li>Dépôt</li><li>Retrait</li><li>Équipe</li><li>Transactions</li><li>Profil</li>',
        helpS3Title: 'Marché', helpS3Desc: 'Mise à jour toutes les 30s.',
        helpS4Title: 'Notifications', helpS4Desc: 'Cliquez sur la cloche.',
        helpS5Title: 'Casino', helpS5Desc: 'Cliquez sur le bouton flottant.',
        helpS6Title: 'Sécurité', helpS6Desc: 'Ne partagez pas votre mot de passe.',
        helpFooter: 'Support Zenix.',
        casinoModalTitle: 'Choisir un jeu', casinoPoker: 'Roulette', casinoPokerDesc: 'Hasard', casinoPlinko: 'Plinko', casinoPlinkoDesc: 'Balles'
    },
    de: {
        m1: 'Startseite', m2: 'Quantifizierung', m3: 'Einzahlung', m4: 'Auszahlung', m_team: 'Team', m5: 'Transaktionen', m6: 'Profil', m7: 'Hilfe', m_about: 'Plattform', m8: 'Abmelden',
        wel: 'Willkommen', sub: 'Benutzer-Panel', st: 'Verifiziert',
        ts1: 'Guthaben', ts2: 'Empfehlungen',
        c1: 'Quantifizierung', d1: 'Trading', c2: 'Einzahlung', d2: 'Aufladen', c3: 'Auszahlung', d3: 'Auszahlung',
        c4: 'Team', d4: 'Unterkonten', c5: 'Transaktionen', d5: 'Verlauf', c6: 'Profil', d6: 'Sicherheit',
        tmkt: 'Krypto-Markt', tlive: 'Live',
        aboutToggleOpen: 'Mehr', aboutToggleClose: 'Weniger',
        aboutTitle: 'Über Zenix', aboutIntro: 'Willkommen bei Zenix.', aboutDesc: 'Digitale Finanzen.',
        aboutGoal: '<strong>Ziel:</strong> Demokratisieren.', aboutStrategy: '<strong>Strategie:</strong> Sicherheit.',
        aboutConclusion: '<i class="fas fa-quote-right"></i> Zenix ist ein Ökosystem.',
        floatingCasino: 'Casino', floatingCasinoTitle: 'Casino',
        helpBtnTitle: 'Hilfe', detailMsgTitle: 'Nachricht',
        aboutModalTitle: 'Über Zenix', modalTitle: 'Benachrichtigungen', noMsg: 'Keine Nachrichten.', newBadge: 'NEU',
        tabAll: 'Alle', tabApproved: 'Genehmigt', tabRejected: 'Abgelehnt', tabAdmin: 'Admin',
        helpTitle: 'Zenix Handbuch', helpSubtitle: 'Vollständiges Handbuch',
        helpIntro: 'Willkommen.',
        helpS1Title: 'Guthaben', helpS1Desc: 'Guthaben und Empfehlungen.',
        helpS2Title: 'Schnellzugriff', helpS2List: '<li>Quantifizierung</li><li>Einzahlung</li><li>Auszahlung</li><li>Team</li><li>Transaktionen</li><li>Profil</li>',
        helpS3Title: 'Markt', helpS3Desc: 'Update alle 30s.',
        helpS4Title: 'Benachrichtigungen', helpS4Desc: 'Auf Glocke klicken.',
        helpS5Title: 'Casino', helpS5Desc: 'Auf schwebenden Button klicken.',
        helpS6Title: 'Sicherheit', helpS6Desc: 'Passwort nicht teilen.',
        helpFooter: 'Zenix Support.',
        casinoModalTitle: 'Spiel wählen', casinoPoker: 'Roulette', casinoPokerDesc: 'Glück', casinoPlinko: 'Plinko', casinoPlinkoDesc: 'Bälle'
    }
};

function setLang(l) {
    if (!SUPPORTED_LANGUAGES.includes(l)) l = 'en';
    currLang = l;
    safeSetItem('zenix_lang', l);
    let t = ld[l] || ld.en;
    let r = l === 'fa' || l === 'ar';
    
    document.documentElement.setAttribute('dir', r ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', l);

    document.querySelectorAll('#lang-menu .mi').forEach(item => {
        if (item.dataset.lang === l) item.classList.add('active');
        else item.classList.remove('active');
    });

    for (let i = 1; i <= 8; i++) {
        let m = document.getElementById('m' + i);
        if (m) m.textContent = t['m' + i] || '';
    }

    let mTeam = document.getElementById('m_team');
    if (mTeam) mTeam.textContent = t.m_team;
    let mAbout = document.getElementById('m_about');
    if (mAbout) mAbout.textContent = t.m_about;

    document.getElementById('help-btn')?.setAttribute('title', t.helpBtnTitle);
    document.getElementById('floating-casino-btn')?.setAttribute('title', t.floatingCasinoTitle);

    let detailMsgTitle = document.getElementById('detail-msg-title');
    if (detailMsgTitle) detailMsgTitle.innerHTML = `<i class="fas fa-envelope-open"></i> ${t.detailMsgTitle}`;

    const setTxt = (id, text) => {
        const el = document.getElementById(id);
        if (el && text) el.textContent = text;
    };
    const setHtml = (id, html) => {
        const el = document.getElementById(id);
        if (el && html) el.innerHTML = html;
    };

    const welEl = document.getElementById('t-wel');
    if (welEl) welEl.textContent = currentUserName ? `${t.wel} ${currentUserName}` : t.wel;
    setTxt('t-sub', t.sub);
    setTxt('t-st', t.st);
    setTxt('ts1', t.ts1); setTxt('ts2', t.ts2);
    setTxt('c1', t.c1); setTxt('d1', t.d1);
    setTxt('c2', t.c2); setTxt('d2', t.d2);
    setTxt('c3', t.c3); setTxt('d3', t.d3);
    setTxt('c4', t.c4); setTxt('d4', t.d4);
    setTxt('c5', t.c5); setTxt('d5', t.d5);
    setTxt('c6', t.c6); setTxt('d6', t.d6);
    setTxt('t-mkt', t.tmkt);
    setTxt('t-live', t.tlive);
    
    setTxt('t-about-box-title', t.aboutTitle);
    setTxt('t-about-box-intro', t.aboutIntro);
    setTxt('t-about-box-desc', t.aboutDesc);
    setHtml('t-about-box-goal', t.aboutGoal);
    setHtml('t-about-box-strategy', t.aboutStrategy);
    setHtml('t-about-box-conclusion', t.aboutConclusion);
    setTxt('t-about-toggle', t.aboutToggleOpen);

    setHtml('t-about-modal-title', t.aboutModalTitle);
    setTxt('t-about-modal-intro', t.aboutIntro);
    setTxt('t-about-modal-desc', t.aboutDesc);
    setHtml('t-about-modal-goal', t.aboutGoal);
    setHtml('t-about-modal-strategy', t.aboutStrategy);
    setHtml('t-about-modal-conclusion', t.aboutConclusion);

    setHtml('t-help-modal-title', t.helpTitle);
    setTxt('t-help-modal-subtitle', t.helpSubtitle);
    setTxt('t-help-intro', t.helpIntro);
    setTxt('t-help-s1-title', t.helpS1Title); setTxt('t-help-s1-desc', t.helpS1Desc);
    setTxt('t-help-s2-title', t.helpS2Title); setHtml('t-help-s2-list', t.helpS2List);
    setTxt('t-help-s3-title', t.helpS3Title); setTxt('t-help-s3-desc', t.helpS3Desc);
    setTxt('t-help-s4-title', t.helpS4Title); setTxt('t-help-s4-desc', t.helpS4Desc);
    setTxt('t-help-s5-title', t.helpS5Title); setTxt('t-help-s5-desc', t.helpS5Desc);
    setTxt('t-help-s6-title', t.helpS6Title); setTxt('t-help-s6-desc', t.helpS6Desc);
    setTxt('t-help-footer', t.helpFooter);

    setHtml('t-casino-modal-title', `<i class="fas fa-dice" style="color:#f43f5e;"></i> ${t.casinoModalTitle}`);
    setTxt('t-casino-poker', t.casinoPoker);
    setTxt('t-casino-poker-desc', t.casinoPokerDesc);
    setTxt('t-casino-plinko', t.casinoPlinko);
    setTxt('t-casino-plinko-desc', t.casinoPlinkoDesc);
    setTxt('t-floating-casino', t.floatingCasino);

    let elModalTitle = document.getElementById('t-modal-title');
    if (elModalTitle) elModalTitle.innerHTML = `<i class="fas fa-bell"></i> ${t.modalTitle}`;

    setTxt('t-tab-all', t.tabAll);
    setTxt('t-tab-approved', t.tabApproved);
    setTxt('t-tab-rejected', t.tabRejected);
    setTxt('t-tab-admin', t.tabAdmin);
}

document.querySelectorAll('#lang-menu .mi').forEach(i => {
    i.addEventListener('click', (e) => {
        e.stopPropagation();
        setLang(i.dataset.lang);
        document.getElementById('lang-menu')?.classList.remove('show');
    });
});

setLang(currLang);

// ==========================================
// 6. دریافت اطلاعات کاربر
// ==========================================
async function loadDashboardUserData(uid, sessionUser) {
    try {
        currentUserId = uid;
        const { data: dbUser } = await supabaseClient.from('users').select('*').eq('id', uid).maybeSingle();
        const { data: dbProfile } = await supabaseClient.from('profiles').select('*').eq('id', uid).maybeSingle();
        const meta = sessionUser.user_metadata || {};

        const userFullName =
            dbUser?.fullname || dbUser?.full_name ||
            dbProfile?.fullname || dbProfile?.full_name ||
            meta.fullname || meta.full_name || '';
        if (userFullName) {
            currentUserName = userFullName;
            const t = ld[currLang] || ld.en;
            const welEl = document.getElementById('t-wel');
            if (welEl) welEl.textContent = `${t.wel} ${currentUserName}`;
        }

        const balance = parseFloat(dbUser?.balance ?? dbProfile?.balance ?? meta.balance ?? 0);
        const valBalance = document.getElementById('val-balance');
        if (valBalance) valBalance.textContent = `$${balance.toFixed(2)}`;

        let codeDigits = generateUIDDigits(uid);
        let myRefCode = dbProfile?.referral_code || ('MS-' + codeDigits);

        let rawList = [];
        try {
            const { data: dbProfiles } = await supabaseClient.from('profiles').select('*');
            if (dbProfiles && Array.isArray(dbProfiles)) rawList.push(...dbProfiles);
        } catch(e) {}

        if (meta.team_members || meta.referrals || meta.invited_users) {
            let metaTeam = meta.team_members || meta.referrals || meta.invited_users;
            if (Array.isArray(metaTeam)) rawList.push(...metaTeam);
        }

        ['zenix_registered_users', 'zenix_users', 'zenix_referrals', 'zenix_team_' + uid, 'zenix_all_users'].forEach(k => {
            try {
                let item = safeGetItem(k);
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
            let targetCodes = [
                String(refUid).toUpperCase(),
                ('MS-' + digits).toUpperCase(),
                ('SM-' + digits).toUpperCase(),
                digits.toUpperCase()
            ];
            if (refCodeVal) targetCodes.push(String(refCodeVal).toUpperCase());
            let refs = [u.referred_by, u.referrer_id, u.invitation_code, u.ref_code, u.inviter, u.referral_code, u.ref]
                .map(x => x ? String(x).trim().toUpperCase() : '');
            return refs.some(r => r && targetCodes.includes(r));
        }

        let lvl1Users = allProfiles.filter(u => isReferredBy(u, uid, myRefCode));
        let lvl2Users = [], lvl3Users = [];
        if (lvl1Users.length > 0) {
            lvl2Users = allProfiles.filter(u => {
                let uUid = u.user_id || u.id;
                if (uUid === uid || lvl1Users.some(l1 => (l1.user_id || l1.id) === uUid)) return false;
                return lvl1Users.some(l1 => isReferredBy(u, l1.user_id || l1.id, l1.referral_code));
            });
        }
        if (lvl2Users.length > 0) {
            lvl3Users = allProfiles.filter(u => {
                let uUid = u.user_id || u.id;
                if (uUid === uid || lvl1Users.some(l1 => (l1.user_id || l1.id) === uUid) || lvl2Users.some(l2 => (l2.user_id || l2.id) === uUid)) return false;
                return lvl2Users.some(l2 => isReferredBy(u, l2.user_id || l2.id, l2.referral_code));
            });
        }

        let l1Count = lvl1Users.length;
        if (l1Count === 0 && (meta.referral_count || meta.invited_count)) {
            l1Count = Number(meta.referral_count || meta.invited_count || 0);
        }
        let totalTeamCount = l1Count + lvl2Users.length + lvl3Users.length;
        const valRef = document.getElementById('val-ref');
        if (valRef) valRef.textContent = totalTeamCount;

        allMessages = await fetchUserMessages(uid);
        updateNotifBadges();
    } catch (err) {
        console.error("خطا در دریافت اطلاعات:", err);
    }
}

supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (session && session.user) {
        currentUserId = session.user.id;
        loadDashboardUserData(session.user.id, session.user);
        fetchUserMessages(session.user.id).then(msgs => {
            allMessages = msgs;
            updateNotifBadges();
        });
    } else {
        window.location.href = 'index.html';
    }
});

// ==========================================
// 7. مدیریت منوها
// ==========================================
const menuBtn = document.getElementById('menu-btn');
const navMenu = document.getElementById('nav-menu');
const langBtn = document.getElementById('lang-btn');
const langMenu = document.getElementById('lang-menu');
const helpBtn = document.getElementById('help-btn');

function closeAllMenus(except = '') {
    if (except !== 'nav' && navMenu) navMenu.classList.remove('show');
    if (except !== 'lang' && langMenu) langMenu.classList.remove('show');
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
if (helpBtn) {
    helpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllMenus();
        window.openHelpModal();
    });
}

document.addEventListener('click', (e) => {
    if (navMenu && !navMenu.contains(e.target) && e.target !== menuBtn) navMenu.classList.remove('show');
    if (langMenu && !langMenu.contains(e.target) && e.target !== langBtn) langMenu.classList.remove('show');
});

document.querySelectorAll('.modal').forEach(m => {
    m.addEventListener('click', (e) => {
        if (e.target === m) { m.classList.remove('show'); unlockBody(); }
    });
});

document.getElementById('logout-btn')?.addEventListener('click', async e => {
    e.preventDefault();
    try { await supabaseClient.auth.signOut(); } catch(e) {}
    window.location.href = 'index.html';
});
