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
// 2. مدیریت مدال‌های پلتفرم
// ==========================================
window.openAboutModal = function() {
    document.getElementById('m-about-modal')?.classList.add('show');
    closeAllMenus();
};

window.closeAboutModal = function() {
    document.getElementById('m-about-modal')?.classList.remove('show');
};

window.openHelpModal = function() {
    document.getElementById('m-help-modal')?.classList.add('show');
    closeAllMenus();
};

window.closeHelpModal = function() {
    document.getElementById('m-help-modal')?.classList.remove('show');
};

window.openCasinoModal = function() {
    document.getElementById('m-casino-modal')?.classList.add('show');
    closeAllMenus();
};

window.closeCasinoModal = function() {
    document.getElementById('m-casino-modal')?.classList.remove('show');
};

// ==========================================
// 3. سیستم دریافت و نمایش بازار ارزهای دیجیتال
// ==========================================
async function fetchCryptoPrices() {
    const tickerContainer = document.getElementById('crypto-ticker-list');
    if (!tickerContainer) return;

    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=1&sparkline=false');
        if (!response.ok) throw new Error('خطا در دریافت قیمت ارزها');
        
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
                        <div class="crypto-icon">
                            <img src="${safeImage}" alt="${safeSymbol}">
                        </div>
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
        console.error('خطای دریافت قیمت ارزهای دیجیتال:', err);
        tickerContainer.innerHTML = `
            <div class="crypto-row">
                <div class="crypto-info"><strong style="color:#fff;">BTC</strong></div>
                <div style="text-align:right;"><span style="color:#fff;">$96,500.00</span><div class="price-up">+2.15%</div></div>
            </div>
            <div class="crypto-row">
                <div class="crypto-info"><strong style="color:#fff;">ETH</strong></div>
                <div style="text-align:right;"><span style="color:#fff;">$2,780.50</span><div class="price-up">+1.84%</div></div>
            </div>
            <div class="crypto-row">
                <div class="crypto-info"><strong style="color:#fff;">SOL</strong></div>
                <div style="text-align:right;"><span style="color:#fff;">$198.20</span><div class="price-down">-0.65%</div></div>
            </div>
        `;
    }
}

fetchCryptoPrices();
setInterval(fetchCryptoPrices, 30000);

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
    if (b) {
        b.textContent = unread;
        b.classList.toggle('show', unread > 0);
    }
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
        try {
            await supabaseClient.from('notifications').update({ read: true, is_read: true }).eq('id', m.id);
        } catch(e) {}
    }
    updateNotifBadges();
    renderMessageList();

    let titleEl = document.getElementById('detail-msg-title');
    let dateEl = document.getElementById('detail-msg-date');
    let bodyEl = document.getElementById('detail-msg-body');

    if (titleEl) titleEl.innerHTML = `<i class="fas fa-envelope-open"></i> ${escapeHtml(m.subject)}`;
    if (dateEl) {
        dateEl.textContent = m.time || '';
        dateEl.style.display = m.time ? 'block' : 'none';
    }
    if (bodyEl) bodyEl.textContent = m.body || '';

    document.getElementById('m-msg-detail')?.classList.add('show');
};

window.closeMessageModal = () => document.getElementById('m-msg')?.classList.remove('show');
window.closeMsgDetailModal = () => document.getElementById('m-msg-detail')?.classList.remove('show');

document.getElementById('bell-btn')?.addEventListener('click', e => { 
    e.stopPropagation(); 
    window.openMessageModal(); 
});


// ==========================================
// 5. سیستم ترجمه کامل ۸ زبانه (متن‌های معرفی جدید)
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
        helpIntro: 'به بخش مدیریت و داشبورد کاربری پلتفرم زِنیکس خوش آمدید. در این بخش می‌توانید خلاصه‌ای از عملکرد مالی و دسترسی سریع به بخش‌های اصلی داشته باشید.',
        helpS1Title: '<i class="fas fa-wallet" style="margin-left:5px;"></i> ۱. آمار و موجودی',
        helpS1Desc: 'در بالای صفحه، کل موجودی حساب (USDT) و تعداد کاربران زیرمجموعه شبکه شما به صورت زنده نمایش داده می‌شود.',
        helpS2Title: '<i class="fas fa-th-large" style="margin-left:5px;"></i> ۲. دسترسی سریع (میانبرها)',
        helpS2List: '<li><strong>کوانتیفیکیشن:</strong> ورود به بخش معاملات هوشمند و رباتیک و دریافت سود روزانه.</li><li><strong>واریز:</strong> شارژ حساب کاربری از طریق ولت‌های دیجیتال با تأیید شبکه.</li><li><strong>برداشت:</strong> ثبت درخواست برداشت درآمدها و دارایی‌ها به کیف پول شخصی.</li><li><strong>تیم:</strong> مشاهده آمار کامل اعضا و لینک اختصاصی دعوت زیرمجموعه‌ها (سطوح ۱ تا ۳).</li><li><strong>تراکنش‌ها:</strong> بررسی تاریخچه کامل وضیعت ریز تراکنش‌های مالی، واریزی‌ها و برداشت‌ها.</li><li><strong>پروفایل:</strong> مدیریت امنیت حساب، رمز عبور و تنظیمات کاربری.</li>',
        helpS3Title: '<i class="fas fa-chart-line" style="margin-left:5px;"></i> ۳. بازار ارزهای دیجیتال و اعلان‌ها',
        helpS3Desc: 'قیمت ۳ ارز برتر بازار به صورت زنده به‌روزرسانی می‌شود. همچنین با کلیک روی آیکون زنگوله هدر می‌توانید پیام‌ها و اطلاعیه‌های سیستم را مشاهده کنید.',
        helpFooter: '<i class="fas fa-headset" style="color:#a855f7;margin-left:4px;"></i> در صورت نیاز به راهنمایی بیشتر می‌توانید با پشتیبانی زِنیکس در ارتباط باشید.',
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
        aboutTitle: 'About Zenix Smart Platform',
        aboutIntro: 'Welcome to Zenix, where the horizons of digital finance and the power of modern technology intertwine to illuminate a path toward a brighter future. Zenix was founded on a profound belief: the world of digital assets should not be a labyrinth of complexity, but a transparent, accessible, and secure ecosystem for everyone.',
        aboutDesc: 'In an era defined by relentless momentum, where global markets never sleep and change is the only constant, having a reliable and intelligent companion is paramount. Zenix, leveraging cutting-edge cloud architecture, advanced quantification algorithms, and impenetrable multi-layered security, provides you with a unified, seamless sanctuary for wealth management. We are not just building a platform; we are crafting an environment where technology serves human ambition, breaking down barriers and redefining what is possible in the digital economy.',
        aboutGoal: '<strong style="color:#38bdf8;">Our Goal:</strong> To democratize the extraordinary. We strive to place the same powerful financial tools used by institutional elites into the hands of everyday visionaries. Whether you are taking your first step or are a seasoned expert, Zenix empowers you to navigate global markets with confidence, without the need for complex expertise, ensuring your capital grows in an environment of absolute security, transparency, and dynamic potential.',
        aboutStrategy: '<strong style="color:#38bdf8;">Our Strategy:</strong> Built upon an unbreakable triad—uncompromising security, radical transparency, and relentless innovation. By integrating state-of-the-art data processing algorithms, a dynamic multi-tiered reward system, and infinitely scalable infrastructure, we engineer a flawless, lightning-fast, and highly reliable experience. We handle the complexities, so your focus remains solely on what matters most: your growth and success.',
        aboutConclusion: '<i class="fas fa-quote-right" style="color:#38bdf8;margin-left:4px;"></i> Zenix transcends the definition of a mere platform; it is a vibrant ecosystem where technology, capital, and a community of forward-thinkers converge. We are your steadfast partner on this journey, committed to guiding you toward a future of greater financial freedom, boundless opportunities, and monumental achievements. Together, we are not just predicting the future—we are building it.',
        floatingCasino: 'Casino', floatingCasinoTitle: 'Casino Games',
        helpBtnTitle: 'Dashboard Help',
        detailMsgTitle: 'View Message',
        aboutModalTitle: '<i class="fas fa-info-circle"></i> About Zenix Smart Platform',
        modalTitle: 'Notifications & Messages', noMsg: 'No new messages.', newBadge: 'NEW',
        tabAll: 'All', tabApproved: 'Approved', tabRejected: 'Rejected', tabAdmin: 'Admin Msg',
        helpTitle: 'Zenix Dashboard Comprehensive Guide',
        helpIntro: 'Welcome to the Zenix user management dashboard. Here you can find a summary of your financial performance and quick access to core sections.',
        helpS1Title: '<i class="fas fa-wallet" style="margin-right:5px;"></i> 1. Stats & Balance',
        helpS1Desc: 'At the top of the page, your total balance (USDT) and network referral count are displayed live.',
        helpS2Title: '<i class="fas fa-th-large" style="margin-right:5px;"></i> 2. Quick Shortcuts',
        helpS2List: '<li><strong>Quantification:</strong> Enter automated robotic trading to earn daily profit.</li><li><strong>Deposit:</strong> Top up your account via digital wallets.</li><li><strong>Withdraw:</strong> Request asset withdrawals to your crypto wallet.</li><li><strong>Team:</strong> View member stats and get your referral link (Levels 1-3).</li><li><strong>Transactions:</strong> Review full history of financial deposits and withdrawals.</li><li><strong>Profile:</strong> Manage account security, password, and settings.</li>',
        helpS3Title: '<i class="fas fa-chart-line" style="margin-right:5px;"></i> 3. Crypto Market & Notifications',
        helpS3Desc: 'Top 3 crypto prices are updated live. Click the bell icon on the header to view notifications and admin messages.',
        helpFooter: '<i class="fas fa-headset" style="color:#a855f7;margin-right:4px;"></i> If you need further assistance, feel free to contact Zenix Support.',
        casinoModalTitle: 'Select Casino Games',
        casinoPoker: 'Online Roulette', casinoPokerDesc: 'Exciting game of chance',
        casinoPlinko: 'Plinko', casinoPlinkoDesc: 'Popular dropping ball game'
    },
    ar: {
        m1: 'الرئيسية', m2: 'التكميم', m3: 'إيداع', m4: 'سحب', m_team: 'فريقي', m5: 'المعاملات', m6: 'الملف الشخصي', m7: 'الدعم', m_about: 'حول المنصة', m8: 'تسجيل الخروج',
        wel: 'أهلاً بك', sub: 'لوحة إدارة المستخدم', st: 'موثق',
        ts1: 'الرصيد', ts2: 'الإحالات',
        c1: 'التكميم', d1: 'التداول الذكي',
        c2: 'إيداع', d2: 'شحن الحساب',
        c3: 'سحب', d3: 'سحب الأصول',
        c4: 'الفريق', d4: 'الإحالات',
        c5: 'المعاملات', d5: 'السجل المالي',
        c6: 'الملف الشخصي', d6: 'إعدادات الأمان',
        tmkt: 'سوق العملات الرقمية (أفضل 3 من 30 عملة مراقبة)', tlive: 'مباشر',
        aboutTitle: 'حول منصة Zenix الذكية',
        aboutIntro: 'مرحباً بك في Zenix، حيث تتشابك آفاق التمويل الرقمي وقوة التكنولوجيا الحديثة لإضاءة طريق نحو مستقبل أكثر إشراقاً. تأسست Zenix على إيمان عميق: يجب ألا يكون عالم الأصول الرقمية متاهة معقدة، بل نظاماً بيئياً شفافاً وسهلاً وآمناً للجميع.',
        aboutDesc: 'في عصر يتسم بالزخم الذي لا يلين، حيث لا تنام الأسواق العالمية أبداً والتغيير هو الثابت الوحيد، يعد وجود رفيق موثوق وذكي أمراً بالغ الأهمية. بناءً على بنية سحابية متطورة وخوارزميات تكميم متقدمة وطبقات أمان متعددة لا يمكن اختراقها، توفر لك Zenix ملاذاً موحداً وسلساً لإدارة الثروة. نحن لا نبني منصة فحسب؛ بل نصمم بيئة تخدم فيها التكنولوجيا الطموح البشري، وتكسر الحواجز وتعيد تعريف ما هو ممكن في الاقتصاد الرقمي.',
        aboutGoal: '<strong style="color:#38bdf8;">هدفنا:</strong> إضفاء الطابع الديمقراطي على الاستثنائي. نحن نسعى جاهدين لوضع نفس الأدوات المالية القوية التي تستخدمها النخب المؤسسية في أيدي أصحاب الرؤى العاديين. سواء كنت تخطو خطوتك الأولى أو كنت خبيراً متمرساً، فإن Zenix يمكّنك من التنقل في الأسواق العالمية بثقة، دون الحاجة إلى خبرة معقدة، مما يضمن نمو رأس مالك في بيئة من الأمان المطلق والشفافية والإمكانات الديناميكية.',
        aboutStrategy: '<strong style="color:#38bdf8;">استراتيجيتنا:</strong> مبنية على ثلاثية غير قابلة للكسر - أمان بلا هوادة، شفافية جذرية، وابتكار لا هوادة فيه. من خلال دمج خوارزميات معالجة البيانات الحديثة ونظام مكافآت ديناميكي متعدد المستويات وبنية تحتية قابلة للتطوير بلا حدود، نصمم تجربة لا تشوبها شائبة وسريعة للغاية وموثوقة للغاية. نحن نتعامل مع التعقيدات، لذلك يظل تركيزك فقط على ما يهم أكثر: نموك ونجاحك.',
        aboutConclusion: '<i class="fas fa-quote-right" style="color:#38bdf8;margin-left:4px;"></i> تتجاوز Zenix تعريف مجرد منصة؛ إنها نظام بيئي نابض بالحياة حيث تتلاقى التكنولوجيا ورأس المال ومجتمع من المفكرين المتقدمين. نحن شريكك الثابت في هذه الرحلة، وملتزمون بإرشادك نحو مستقبل من حرية مالية أكبر وفرص لا حدود لها وإنجازات هائلة. معاً، نحن لا نتوقع المستقبل فقط — بل نبنيه.',
        floatingCasino: 'كازينو', floatingCasinoTitle: 'ألعاب الكازينو',
        helpBtnTitle: 'مساعدة لوحة التحكم',
        detailMsgTitle: 'عرض الرسالة',
        aboutModalTitle: '<i class="fas fa-info-circle"></i> حول منصة Zenix الذكية',
        modalTitle: 'صندوق الرسائل والإشعارات', noMsg: 'لا توجد رسائل جديدة.', newBadge: 'جديد',
        tabAll: 'الكل', tabApproved: 'طلبات مقبولة', tabRejected: 'طلبات مرفوضة', tabAdmin: 'رسائل الإدارة',
        helpTitle: 'دليل لوحة تحكم Zenix الشامل',
        helpIntro: 'مرحباً بك في لوحة تحكم إدارة المستخدمين في Zenix. يمكنك هنا العثور على ملخص لأدائك المالي والوصول السريع للأقسام الأساسية.',
        helpS1Title: '<i class="fas fa-wallet" style="margin-left:5px;"></i> ١. الإحصائيات والرصيد',
        helpS1Desc: 'في أعلى الصفحة، يتم عرض إجمالي رصيدك (USDT) عدد إحالات شبكتك بشكل مباشر.',
        helpS2Title: '<i class="fas fa-th-large" style="margin-left:5px;"></i> ٢. الاختصارات السريعة',
        helpS2List: '<li><strong>التكميم:</strong> الدخول إلى التداول الآلي لكسب الأرباح اليومية.</li><li><strong>إيداع:</strong> شحن حسابك عبر المحافظ الرقمية.</li><li><strong>سحب:</strong> طلب سحب الأصول إلى محفظتك الخاصة.</li><li><strong>الفريق:</strong> عرض إحصائيات الأعضاء ورابط الإحالة الخاص بك.</li><li><strong>المعاملات:</strong> مراجعة السجل الكامل لعمليات الإيداع والسحب.</li><li><strong>الملف الشخصي:</strong> إدارة أمان الحساب والإعدادات.</li>',
        helpS3Title: '<i class="fas fa-chart-line" style="margin-left:5px;"></i> ٣. سوق العملات والإشعارات',
        helpS3Desc: 'يتم تحديث أسعار العملات بشكل مباشر. انقر فوق أيقونة الجرس لعرض الإشعارات.',
        helpFooter: '<i class="fas fa-headset" style="color:#a855f7;margin-left:4px;"></i> إذا كنت بحاجة إلى مساعدة إضافية، تواصل مع دعم Zenix.',
        casinoModalTitle: 'اختر ألعاب الكازينو',
        casinoPoker: 'رولت مباشر', casinoPokerDesc: 'لعبة حظ مثيرة',
        casinoPlinko: 'بلينكو', casinoPlinkoDesc: 'لعبة سقوط الكرات الشهيرة'
    },
    tr: {
        m1: 'Ana Sayfa', m2: 'Kuantifikasyon', m3: 'Yatırım', m4: 'Çekim', m_team: 'Ekibim', m5: 'İşlemler', m6: 'Profil', m7: 'Destek', m_about: 'Platform Hakkında', m8: 'Çıkış',
        wel: 'Hoş Geldiniz', sub: 'Kullanıcı Yönetim Paneli', st: 'Onaylandı',
        ts1: 'Bakiye', ts2: 'Referanslar',
        c1: 'Kuantifikasyon', d1: 'Akıllı İşlem',
        c2: 'Yatırım', d2: 'Hesap Yükleme',
        c3: 'Çekim', d3: 'Varlık Çekimi',
        c4: 'Ekip', d4: 'Alt Hesaplar',
        c5: 'İşlemler', d5: 'Finansal Geçmiş',
        c6: 'Profil', d6: 'Güvenlik Ayarları',
        tmkt: 'Kripto Para Piyasası (Takip edilen 30 coinden en iyi 3ü)', tlive: 'Canlı',
        aboutTitle: 'Zenix Akıllı Platform Hakkında',
        aboutIntro: 'Zenix\'e hoş geldiniz; dijital finansın ufukları ile modern teknolojinin gücünün, daha aydınlık bir geleceğe giden yolu aydınlatmak için iç içe geçtiği yer. Zenix, derin bir inanç üzerine kurulmuştur: dijital varlıklar dünyası karmaşık bir labirent değil, herkes için şeffaf, erişilebilir ve güvenli bir ekosistem olmalıdır.',
        aboutDesc: 'Küresel piyasaların asla uyumadığı ve tek sabitin değişim olduğu, amansız bir ivmeyle tanımlanan bir çağda, güvenilir ve akıllı bir yol arkadaşına sahip olmak çok önemlidir. Zenix, en son bulut mimarisi, gelişmiş kuantifikasyon algoritmaları ve aşılamaz çok katmanlı güvenlikten yararlanarak size servet yönetimi için birleşik ve kusursuz bir sığınak sunar. Sadece bir platform inşa etmiyoruz; teknolojinin insan hırsına hizmet ettiği, engelleri yıktığı ve dijital ekonomide nelerin mümkün olduğunu yeniden tanımladığı bir ortam yaratıyoruz.',
        aboutGoal: '<strong style="color:#38bdf8;">Hedefimiz:</strong> Olağanüstüyü demokratikleştirmek. Kurumsal seçkinlerin kullandığı aynı güçlü finansal araçları günlük vizyonerlerin eline vermeye çalışıyoruz. İster ilk adımınızı atıyor olun ister deneyimli bir uzman olun, Zenix karmaşık uzmanlığa ihtiyaç duymadan küresel piyasalarda güvenle yol almanızı sağlar ve sermayenizin mutlak güvenlik, şeffaflık ve dinamik potansiyel ortamında büyümesini garanti eder.',
        aboutStrategy: '<strong style="color:#38bdf8;">Stratejimiz:</strong> yıkılmaz bir üçlü üzerine inşa edilmiştir: ödünsüz güvenlik, radikal şeffaflık ve amansız inovasyon. En son veri işleme algoritmalarını, dinamik çok katmanlı bir ödül sistemini ve sonsuz ölçeklenebilir altyapıyı entegre ederek kusursuz, yıldırım hızında ve son derece güvenilir bir deneyim tasarlıyoruz. Karmaşıklıkları biz yönetiyoruz, böylece odağınız yalnızca en önemli şeyde kalıyor: büyümeniz ve başarınız.',
        aboutConclusion: '<i class="fas fa-quote-right" style="color:#38bdf8;margin-left:4px;"></i> Zenix, sadece bir platform tanımını aşar; teknolojinin, sermayenin ve ileri görüşlü bir topluluğun bir araya geldiği canlı bir ekosistemdir. Bu yolculukta sizin kararlı ortağınızız ve sizi daha fazla finansal özgürlük, sınırsız fırsat ve anıtsal başarıların olduğu bir geleceğe yönlendirmeye kararlıyız. Birlikte, sadece geleceği tahmin etmiyoruz—onu inşa ediyoruz.',
        floatingCasino: 'Casino', floatingCasinoTitle: 'Casino Oyunları',
        helpBtnTitle: 'Panel Yardımı',
        detailMsgTitle: 'Mesajı Görüntüle',
        aboutModalTitle: '<i class="fas fa-info-circle"></i> Zenix Akıllı Platform Hakkında',
        modalTitle: 'Bildirimler ve Mesajlar', noMsg: 'Yeni mesaj yok.', newBadge: 'YENİ',
        tabAll: 'Tümü', tabApproved: 'Onaylanan', tabRejected: 'Reddedilen', tabAdmin: 'Yönetici',
        helpTitle: 'Zenix Kontrol Paneli Kapsamlı Rehberi',
        helpIntro: 'Zenix kullanıcı yönetim paneline hoş geldiniz. Burada finansal performansınızın bir özetini bulabilirsiniz.',
        helpS1Title: '<i class="fas fa-wallet" style="margin-right:5px;"></i> 1. İstatistikler ve Bakiye',
        helpS1Desc: 'Sayfanın üst kısmında toplam bakiyeniz (USDT) canlı olarak görüntülenir.',
        helpS2Title: '<i class="fas fa-th-large" style="margin-right:5px;"></i> 2. Hızlı Kısayollar',
        helpS2List: '<li><strong>Kuantifikasyon:</strong> Otomatik işlemler.</li><li><strong>Yatırım:</strong> Bakiye yükleme.</li><li><strong>Çekim:</strong> Varlık çekme.</li><li><strong>Ekip:</strong> Üye istatistikleri.</li><li><strong>İşlemler:</strong> Geçmiş.</li><li><strong>Profil:</strong> Güvenlik.</li>',
        helpS3Title: '<i class="fas fa-chart-line" style="margin-right:5px;"></i> 3. Kripto Piyasası ve Bildirimler',
        helpS3Desc: 'Canlı fiyatlar ve bildirimler.',
        helpFooter: '<i class="fas fa-headset" style="color:#a855f7;margin-right:4px;"></i> Zenix Desteği ile iletişime geçin.',
        casinoModalTitle: 'Casino Oyunları Seçimi',
        casinoPoker: 'Canlı Rulet', casinoPokerDesc: 'Heyecan verici şans oyunu',
        casinoPlinko: 'Plinko', casinoPlinkoDesc: 'Popüler top bırakma oyunu'
    },
    ru: {
        m1: 'Главная', m2: 'Квантификация', m3: 'Депозит', m4: 'Вывод', m_team: 'Команда', m5: 'Транзакции', m6: 'Профиль', m7: 'Поддержка', m_about: 'О платформе', m8: 'Выход',
        wel: 'Добро пожаловать', sub: 'Панель управления', st: 'Подтверждено',
        ts1: 'Баланс', ts2: 'Рефералы',
        c1: 'Квантификация', d1: 'Умная торговля',
        c2: 'Депозит', d2: 'Пополнение счета',
        c3: 'Вывод', d3: 'Вывод средств',
        c4: 'Команда', d4: 'Рефералы',
        c5: 'Транзакции', d5: 'История финансов',
        c6: 'Профиль', d6: 'Настройки безопасности',
        tmkt: 'Криптовалютный рынок (топ-3 из 30 монет)', tlive: 'Онлайн',
        aboutTitle: 'О смарт-платформе Zenix',
        aboutIntro: 'Добро пожаловать в Zenix — место, где горизонты цифровых финансов и мощь современных технологий переплетаются, чтобы осветить путь к светлому будущему. Zenix основан на глубоком убеждении: мир цифровых активов не должен быть лабиринтом сложности, а должен быть прозрачной, доступной и безопасной экосистемой для всех.',
        aboutDesc: 'В эпоху, определяемую неустанным импульсом, когда мировые рынки никогда не спят и единственная константа — это перемены, наличие надежного и умного спутника имеет первостепенное значение. Опираясь на передовую облачную архитектуру, современные алгоритмы квантификации и непроницаемую многоуровневую безопасность, Zenix предоставляет вам единое, бесшовное убежище для управления капиталом. Мы не просто строим платформу; мы создаем среду, в которой технологии служат человеческим амбициям, разрушая барьеры и переопределяя то, что возможно в цифровой экономике.',
        aboutGoal: '<strong style="color:#38bdf8;">Наша цель:</strong> демократизировать выдающееся. Мы стремимся вложить те же мощные финансовые инструменты, используемые институциональной элитой, в руки обычных мечтателей. Делаете ли вы свой первый шаг или являетесь опытным экспертом, Zenix дает вам возможность уверенно ориентироваться на мировых рынках без необходимости сложных знаний, гарантируя, что ваш капитал будет расти в условиях абсолютной безопасности, прозрачности и динамичного потенциала.',
        aboutStrategy: '<strong style="color:#38bdf8;">Наша стратегия:</strong> построена на незыблемой триаде — бескомпромиссная безопасность, радикальная прозрачность и неустанные инновации. Интегрируя новейшие алгоритмы обработки данных, динамическую многоуровневую систему вознаграждений и бесконечно масштабируемую инфраструктуру, мы создаем безупречный, молниеносно быстрый и высоконадежный опыт. Мы берем на себя все сложности, чтобы ваше внимание оставалось сосредоточенным только на самом важном: вашем росте и успехе.',
        aboutConclusion: '<i class="fas fa-quote-right" style="color:#38bdf8;margin-left:4px;"></i> Zenix выходит за рамки определения простой платформы; это яркая экосистема, где сходятся технологии, капитал и сообщество прогрессивных мыслителей. Мы ваш верный партнер в этом путешествии, призванный вести вас к будущему с большей финансовой свободой, безграничными возможностями и колоссальными достижениями. Вместе мы не просто предсказываем будущее — мы строим его.',
        floatingCasino: 'Казино', floatingCasinoTitle: 'Игры казино',
        helpBtnTitle: 'Помощь',
        detailMsgTitle: 'Просмотр сообщения',
        aboutModalTitle: '<i class="fas fa-info-circle"></i> О смарт-платформе Zenix',
        modalTitle: 'Уведомления', noMsg: 'Нет новых сообщений.', newBadge: 'НОВОЕ',
        tabAll: 'Все', tabApproved: 'Одобрено', tabRejected: 'Отклонено', tabAdmin: 'Админ',
        helpTitle: 'Руководство панели управления Zenix',
        helpIntro: 'Добро пожаловать в панель управления.',
        helpS1Title: '<i class="fas fa-wallet" style="margin-right:5px;"></i> 1. Баланс',
        helpS1Desc: 'Общий баланс.',
        helpS2Title: '<i class="fas fa-th-large" style="margin-right:5px;"></i> 2. Быстрый доступ',
        helpS2List: '<li>Квантификация</li><li>Депозит</li><li>Вывод</li>',
        helpS3Title: '<i class="fas fa-chart-line" style="margin-right:5px;"></i> 3. Рынок',
        helpS3Desc: 'Цены в реальном времени.',
        helpFooter: 'Поддержка Zenix.',
        casinoModalTitle: 'Выбор игр казино',
        casinoPoker: 'Онлайн Рулетка', casinoPokerDesc: 'Захватывающая игра',
        casinoPlinko: 'Плинко', casinoPlinkoDesc: 'Популярная игра с шариками'
    },
    es: {
        m1: 'Inicio', m2: 'Cuantificación', m3: 'Depósito', m4: 'Retiro', m_team: 'Equipo', m5: 'Transacciones', m6: 'Perfil', m7: 'Soporte', m_about: 'Sobre la plataforma', m8: 'Cerrar sesión',
        wel: 'Bienvenido', sub: 'Panel de gestión de usuario', st: 'Verificado',
        ts1: 'Saldo', ts2: 'Referidos',
        c1: 'Cuantificación', d1: 'Comercio inteligente',
        c2: 'Depósito', d2: 'Recarga de cuenta',
        c3: 'Retiro', d3: 'Retiro de activos',
        c4: 'Equipo', d4: 'Subcuentas',
        c5: 'Transacciones', d5: 'Historial financiero',
        c6: 'Perfil', d6: 'Configuración de seguridad',
        tmkt: 'Mercado de criptomonedas (Top 3 de 30 monedas)', tlive: 'En vivo',
        aboutTitle: 'Sobre la plataforma inteligente Zenix',
        aboutIntro: 'Bienvenido a Zenix, donde los horizontes de las finanzas digitales y el poder de la tecnología moderna se entrelazan para iluminar un camino hacia un futuro más brillante. Zenix se fundó sobre una profunda convicción: el mundo de los activos digitales no debería ser un laberinto de complejidad, sino un ecosistema transparente, accesible y seguro para todos.',
        aboutDesc: 'En una era definida por un impulso implacable, donde los mercados globales nunca duermen y el cambio es la única constante, contar con un compañero confiable e inteligente es primordial. Zenix, aprovechando la arquitectura en la nube de vanguardia, los avanzados algoritmos de cuantificación y la impenetrable seguridad de múltiples capas, le proporciona un santuario unificado y perfecto para la gestión de patrimonios. No solo estamos construyendo una plataforma; estamos creando un entorno donde la tecnología sirve a la ambición humana, derribando barreras y redefiniendo lo que es posible en la economía digital.',
        aboutGoal: '<strong style="color:#38bdf8;">Nuestro objetivo:</strong> democratizar lo extraordinario. Nos esforzamos por poner las mismas herramientas financieras poderosas utilizadas por las élites institucionales en manos de visionarios cotidianos. Ya sea que esté dando su primer paso o sea un experto experimentado, Zenix le permite navegar por los mercados globales con confianza, sin la necesidad de una experiencia compleja, asegurando que su capital crezca en un entorno de seguridad absoluta, transparencia y potencial dinámico.',
        aboutStrategy: '<strong style="color:#38bdf8;">Nuestra estrategia:</strong> se basa en una tríada inquebrantable: seguridad sin concesiones, transparencia radical e innovación implacable. Al integrar algoritmos de procesamiento de datos de última generación, un sistema dinámico de recompensas de varios niveles y una infraestructura infinitamente escalable, diseñamos una experiencia impecable, ultrarrápida y altamente confiable. Nos encargamos de las complejidades para que su enfoque siga estando únicamente en lo que más importa: su crecimiento y éxito.',
        aboutConclusion: '<i class="fas fa-quote-right" style="color:#38bdf8;margin-left:4px;"></i> Zenix trasciende la definición de una mera plataforma; es un ecosistema vibrante donde convergen la tecnología, el capital y una comunidad de pensadores avanzados. Somos su firme socio en este viaje, comprometido a guiarle hacia un futuro de mayor libertad financiera, oportunidades ilimitadas y logros monumentales. Juntos, no solo predecimos el futuro, lo estamos construyendo.',
        floatingCasino: 'Casino', floatingCasinoTitle: 'Juegos de Casino',
        helpBtnTitle: 'Ayuda',
        detailMsgTitle: 'Ver mensaje',
        aboutModalTitle: '<i class="fas fa-info-circle"></i> Sobre la plataforma inteligente Zenix',
        modalTitle: 'Notificaciones', noMsg: 'No hay mensajes nuevos.', newBadge: 'NUEVO',
        tabAll: 'Todo', tabApproved: 'Aprobado', tabRejected: 'Rechazado', tabAdmin: 'Admin',
        helpTitle: 'Guía de Zenix',
        helpIntro: 'Bienvenido.',
        helpS1Title: '1. Saldo',
        helpS1Desc: 'Saldo total.',
        helpS2Title: '2. Accesos',
        helpS2List: '<li>Cuantificación</li><li>Depósito</li>',
        helpS3Title: '3. Mercado',
        helpS3Desc: 'Precios en vivo.',
        helpFooter: 'Soporte Zenix.',
        casinoModalTitle: 'Selección de Juegos de Casino',
        casinoPoker: 'Ruleta Online', casinoPokerDesc: 'Emocionante juego de azar',
        casinoPlinko: 'Plinko', casinoPlinkoDesc: 'Popular juego de caída'
    },
    fr: {
        m1: 'Accueil', m2: 'Quantification', m3: 'Dépôt', m4: 'Retrait', m_team: 'Équipe', m5: 'Transactions', m6: 'Profil', m7: 'Support', m_about: 'À propos', m8: 'Déconnexion',
        wel: 'Bienvenue', sub: 'Panneau de gestion', st: 'Vérifié',
        ts1: 'Solde', ts2: 'Parrainages',
        c1: 'Quantification', d1: 'Trading intelligent',
        c2: 'Dépôt', d2: 'Recharge de compte',
        c3: 'Retrait', d3: 'Retrait d\'actifs',
        c4: 'Équipe', d4: 'Sous-comptes',
        c5: 'Transactions', d5: 'Historique financier',
        c6: 'Profil', d6: 'Paramètres de sécurité',
        tmkt: 'Marché des crypto-monnaies (Top 3 sur 30)', tlive: 'En direct',
        aboutTitle: 'À propos de la plateforme intelligente Zenix',
        aboutIntro: 'Bienvenue sur Zenix, où les horizons de la finance numérique et la puissance de la technologie moderne s\'entrelacent pour éclairer la voie vers un avenir plus radieux. Zenix a été fondé sur une conviction profonde : le monde des actifs numériques ne doit pas être un labyrinthe de complexité, mais un écosystème transparent, accessible et sécurisé pour tous.',
        aboutDesc: 'À une époque définie par un élan implacable, où les marchés mondiaux ne dorment jamais et où le changement est la seule constante, avoir un compagnon fiable et intelligent est primordial. Zenix, en tirant parti d\'une architecture cloud de pointe, d\'algorithmes de quantification avancés et d\'une sécurité multicouche impénétrable, vous offre un sanctuaire unifié et transparent pour la gestion de patrimoine. Nous ne construisons pas seulement une plateforme ; nous créons un environnement où la technologie sert l\'ambition humaine, brisant les barrières et redéfinissant ce qui est possible dans l\'économie numérique.',
        aboutGoal: '<strong style="color:#38bdf8;">Notre objectif :</strong> démocratiser l\'extraordinaire. Nous nous efforçons de mettre les mêmes outils financiers puissants utilisés par les élites institutionnelles entre les mains de visionnaires ordinaires. Que vous fassiez votre premier pas ou que vous soyez un expert chevronné, Zenix vous permet de naviguer sur les marchés mondiaux en toute confiance, sans avoir besoin d\'une expertise complexe, en veillant à ce que votre capital croisse dans un environnement de sécurité absolue, de transparence et de potentiel dynamique.',
        aboutStrategy: '<strong style="color:#38bdf8;">Notre stratégie :</strong> repose sur une triade indestructible : sécurité sans compromis, transparence radicale et innovation incessante. En intégrant des algorithmes de traitement de données de pointe, un système de récompenses dynamique à plusieurs niveaux et une infrastructure infiniment évolutive, nous concevons une expérience impeccable, ultra-rapide et hautement fiable. Nous gérons les complexités afin que votre attention reste uniquement concentrée sur ce qui compte le plus : votre croissance et votre succès.',
        aboutConclusion: '<i class="fas fa-quote-right" style="color:#38bdf8;margin-left:4px;"></i> Zenix transcende la définition d\'une simple plateforme ; c\'est un écosystème dynamique où convergent la technologie, le capital et une communauté de penseurs avant-gardistes. Nous sommes votre partenaire indéfectible dans ce voyage, engagé à vous guider vers un avenir de plus grande liberté financière, d\'opportunités illimitées et de réalisations monumentales. Ensemble, nous ne prédisons pas seulement l\'avenir — nous le construisons.',
        floatingCasino: 'Casino', floatingCasinoTitle: 'Jeux de casino',
        helpBtnTitle: 'Aide',
        detailMsgTitle: 'Voir le message',
        aboutModalTitle: '<i class="fas fa-info-circle"></i> À propos de la plateforme intelligente Zenix',
        modalTitle: 'Notifications', noMsg: 'Aucun nouveau message.', newBadge: 'NOUVEAU',
        tabAll: 'Tout', tabApproved: 'Approuvé', tabRejected: 'Rejeté', tabAdmin: 'Admin',
        helpTitle: 'Guide Zenix',
        helpIntro: 'Bienvenue.',
        helpS1Title: '1. Solde',
        helpS1Desc: 'Solde total.',
        helpS2Title: '2. Raccourcis',
        helpS2List: '<li>Quantification</li><li>Dépôt</li>',
        helpS3Title: '3. Marché',
        helpS3Desc: 'Prix en direct.',
        helpFooter: 'Support Zenix.',
        casinoModalTitle: 'Sélection des Jeux de Casino',
        casinoPoker: 'Roulette en ligne', casinoPokerDesc: 'Jeu de hasard excitant',
        casinoPlinko: 'Plinko', casinoPlinkoDesc: 'Jeu populaire de balles'
    },
    de: {
        m1: 'Startseite', m2: 'Quantifizierung', m3: 'Einzahlung', m4: 'Auszahlung', m_team: 'Team', m5: 'Transaktionen', m6: 'Profil', m7: 'Unterstützung', m_about: 'Über die Plattform', m8: 'Abmelden',
        wel: 'Willkommen', sub: 'Benutzer-Management-Panel', st: 'Verifiziert',
        ts1: 'Guthaben', ts2: 'Empfehlungen',
        c1: 'Quantifizierung', d1: 'Smart Trading',
        c2: 'Einzahlung', d2: 'Konto aufladen',
        c3: 'Auszahlung', d3: 'Vermögensauszahlung',
        c4: 'Team', d4: 'Unterkonten',
        c5: 'Transaktionen', d5: 'Finanzhistorie',
        c6: 'Profil', d6: 'Sicherheitseinstellungen',
        tmkt: 'Kryptowährungsmarkt (Top 3 von 30 Münzen)', tlive: 'Live',
        aboutTitle: 'Über die intelligente Zenix-Plattform',
        aboutIntro: 'Willkommen bei Zenix, wo die Horizonte der digitalen Finanzwelt und die Kraft moderner Technologie ineinandergreifen, um den Weg in eine hellere Zukunft zu beleuchten. Zenix wurde auf der tiefen Überzeugung gegründet, dass die Welt der digitalen Vermögenswerte kein Labyrinth der Komplexität sein sollte, sondern ein transparentes, zugängliches und sicheres Ökosystem für alle.',
        aboutDesc: 'In einer Ära des unaufhaltsamen Wandels, in der globale Märkte niemals schlafen und Veränderung die einzige Konstante ist, ist ein zuverlässiger und intelligenter Begleiter von größter Bedeutung. Zenix bietet Ihnen durch modernste Cloud-Architektur, fortschrittliche Quantifizierungsalgorithmen und undurchdringliche mehrschichtige Sicherheit einen einheitlichen, nahtlosen Zufluchtsort für die Vermögensverwaltung. Wir bauen nicht nur eine Plattform; wir schaffen eine Umgebung, in der Technologie dem menschlichen Ehrgeiz dient, Barrieren abbaut und neu definiert, was in der digitalen Wirtschaft möglich ist.',
        aboutGoal: '<strong style="color:#38bdf8;">Unser Ziel:</strong> Das Außergewöhnliche zu demokratisieren. Wir sind bestrebt, dieselben leistungsstarken Finanzwerkzeuge, die von institutionellen Eliten genutzt werden, in die Hände alltäglicher Visionäre zu legen. Ob Sie Ihren ersten Schritt machen oder ein erfahrener Experte sind, Zenix befähigt Sie, sich mit Zuversicht auf globalen Märkten zurechtzufinden, ohne komplexe Fachkenntnisse zu benötigen, und stellt sicher, dass Ihr Kapital in einer Umgebung absoluter Sicherheit, Transparenz und dynamischen Potenzials wächst.',
        aboutStrategy: '<strong style="color:#38bdf8;">Unsere Strategie:</strong> baut auf einer unzerbrechlichen Triade auf – kompromisslose Sicherheit, radikale Transparenz und unermüdliche Innovation. Durch die Integration modernster Datenverarbeitungsalgorithmen, eines dynamischen mehrstufigen Belohnungssystems und einer unendlich skalierbaren Infrastruktur entwickeln wir ein makelloses, blitzschnelles und hochzuverlässiges Erlebnis. Wir kümmern uns um die Komplexität, damit Ihr Fokus ausschließlich auf dem Wichtigsten bleibt: Ihrem Wachstum und Erfolg.',
        aboutConclusion: '<i class="fas fa-quote-right" style="color:#38bdf8;margin-left:4px;"></i> Zenix geht über die Definition einer bloßen Plattform hinaus; es ist ein lebendiges Ökosystem, in dem Technologie, Kapital und eine Gemeinschaft von Vordenkern zusammenkommen. Wir sind Ihr standhafter Partner auf dieser Reise und verpflichtet, Sie in eine Zukunft mit größerer finanzieller Freiheit, grenzenlosen Möglichkeiten und monumentalen Erfolgen zu führen. Gemeinsam sagen wir die Zukunft nicht nur voraus – wir bauen sie.',
        floatingCasino: 'Casino', floatingCasinoTitle: 'Casino-Spiele',
        helpBtnTitle: 'Hilfe',
        detailMsgTitle: 'Nachricht anzeigen',
        aboutModalTitle: '<i class="fas fa-info-circle"></i> Über die intelligente Zenix-Plattform',
        modalTitle: 'Benachrichtigungen', noMsg: 'Keine neuen Nachrichten.', newBadge: 'NEU',
        tabAll: 'Alle', tabApproved: 'Genehmigt', tabRejected: 'Abgelehnt', tabAdmin: 'Admin',
        helpTitle: 'Zenix Leitfaden',
        helpIntro: 'Willkommen.',
        helpS1Title: '1. Guthaben',
        helpS1Desc: 'Gesamtguthaben.',
        helpS2Title: '2. Schnellzugriff',
        helpS2List: '<li>Quantifizierung</li>',
        helpS3Title: '3. Markt',
        helpS3Desc: 'Live-Preise.',
        helpFooter: 'Zenix Support.',
        casinoModalTitle: 'Casino-Spiele Auswahl',
        casinoPoker: 'Online Roulette', casinoPokerDesc: 'Spannendes Glücksspiel',
        casinoPlinko: 'Plinko', casinoPlinkoDesc: 'Beliebtes Ballspiel'
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
        if (item.dataset.lang === l) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
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

    setTxt('t-wel', t.wel);
    setTxt('t-sub', t.sub);
    setTxt('t-st', t.st);
    setTxt('ts1', t.ts1);
    setTxt('ts2', t.ts2);
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

    setHtml('t-about-modal-title', t.aboutModalTitle);
    setTxt('t-about-modal-intro', t.aboutIntro);
    setTxt('t-about-modal-desc', t.aboutDesc);
    setHtml('t-about-modal-goal', t.aboutGoal);
    setHtml('t-about-modal-strategy', t.aboutStrategy);
    setHtml('t-about-modal-conclusion', t.aboutConclusion);

    setHtml('t-help-modal-title', `<i class="fas fa-circle-question" style="color:#38bdf8;"></i> ${t.helpTitle}`);
    setTxt('t-help-intro', t.helpIntro);
    setHtml('t-help-s1-title', t.helpS1Title);
    setTxt('t-help-s1-desc', t.helpS1Desc);
    setHtml('t-help-s2-title', t.helpS2Title);
    setHtml('t-help-s2-list', t.helpS2List);
    setHtml('t-help-s3-title', t.helpS3Title);
    setTxt('t-help-s3-desc', t.helpS3Desc);
    setHtml('t-help-footer', t.helpFooter);

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
// 6. دریافت اطلاعات کاربر و محاسبه زیرمجموعه‌ها
// ==========================================
async function loadDashboardUserData(uid, sessionUser) {
    try {
        currentUserId = uid;
        const { data: dbUser } = await supabaseClient.from('users').select('*').eq('id', uid).maybeSingle();
        const { data: dbProfile } = await supabaseClient.from('profiles').select('*').eq('id', uid).maybeSingle();
        const meta = sessionUser.user_metadata || {};

        const balance = parseFloat(dbUser?.balance ?? dbProfile?.balance ?? meta.balance ?? 0);
        const valBalance = document.getElementById('val-balance');
        if (valBalance) {
            valBalance.textContent = `$${balance.toFixed(2)}`;
        }

        let codeDigits = generateUIDDigits(uid);
        let myRefCode = dbProfile?.referral_code || ('MS-' + codeDigits);

        let rawList = [];
        try {
            const { data: dbProfiles } = await supabaseClient.from('profiles').select('*');
            if (dbProfiles && Array.isArray(dbProfiles)) {
                rawList.push(...dbProfiles);
            }
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
            let defaultCode = 'MS-' + digits;
            let legacyCode = 'SM-' + digits;

            let refs = [
                u.referred_by, u.referrer_id, u.invitation_code,
                u.ref_code, u.inviter, u.referral_code, u.ref
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

        if (l1Count === 0 && (meta.referral_count || meta.invited_count)) {
            l1Count = Number(meta.referral_count || meta.invited_count || 0);
        }

        let totalTeamCount = l1Count + l2Count + l3Count;
        const valRef = document.getElementById('val-ref');
        if (valRef) {
            valRef.textContent = totalTeamCount;
        }

        allMessages = await fetchUserMessages(uid);
        updateNotifBadges();

    } catch (err) {
        console.error("خطا در دریافت اطلاعات کاربر:", err);
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
// 7. مدیریت منوهای هدر
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

document.getElementById('logout-btn')?.addEventListener('click', async e => {
    e.preventDefault();
    try { await supabaseClient.auth.signOut(); } catch(e) {}
    window.location.href = 'index.html';
});
