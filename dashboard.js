// ==========================================
// 1. تنظیمات اولیه و اتصال به سوبابیس
// ==========================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const SUPABASE_URL = "https://ujyenmqdgivuxvxptwyl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_tRJPNKN0KUFfcta6I3xsNw_icShZQhO";

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
// 2. مدیریت مدال‌های پلتفرم (درباره ما و راهنما)
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

// ==========================================
// 3. سیستم دریافت و نمایش بازار ارزهای دیجیتال (۳ ارز برتر از ۳0)
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

            html += `
                <div class="crypto-row">
                    <div class="crypto-info">
                        <div class="crypto-icon">
                            <img src="${coin.image}" alt="${coin.symbol}">
                        </div>
                        <div>
                            <strong style="color:#fff;font-size:12px;">${coin.symbol.toUpperCase()}</strong>
                            <span style="font-size:10px;color:#94a3b8;display:block;">${coin.name}</span>
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
// 4. سیستم اعلان‌ها و زنگوله
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

        html += `<div class="msg-body-box" style="cursor:pointer;border-right:${unread ? '3px solid #38bdf8' : '1px solid rgba(255,255,255,.08)'};" onclick="window.readAdminMessage(${realIdx})">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div class="msg-title-text" style="${unread ? 'color:#fff;font-weight:800;' : ''}"><i class="fas ${iconClass}" style="color:${iconColor};margin-left:5px;"></i> ${m.subject}</div>
                ${unread ? `<span style="font-size:9px;background:#38bdf8;color:#0f172a;padding:2px 6px;border-radius:4px;font-weight:700;">${t.newBadge || 'جدید'}</span>` : ''}
            </div>
            <div class="msg-desc-text" style="margin-top:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${m.body}</div>
            <div style="font-size:10px;color:#64748b;margin-top:6px;text-align:left" dir="ltr">${dTime}</div>
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

    if (titleEl) titleEl.innerHTML = `<i class="fas fa-envelope-open"></i> ${m.subject}`;
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
// 5. سیستم ترجمه کامل ۸ زبانه با رنگ آبی فعال
// ==========================================
let currLang = safeGetItem('zenix_lang') || 'fa';

const ld = {
    fa: {
        m1: 'صفحه اصلی', m2: 'کوانتیفیکیشن', m3: 'واریز', m4: 'برداشت', m5: 'تراکنش', m6: 'پروفایل', m7: 'پشتیبانی', m_about: 'درباره پلتفرم', m8: 'خروج',
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
        aboutIntro: 'به زِنیکس (Zenix) خوش آمدید؛ پلتفرمی پیشرو که با نگاهی نوین به دنیای اقتصاد دیجیتال و فناوری‌های مالی متولد شده است.',
        aboutDesc: 'در دنیای پرسرعت امروز، دسترسی به ابزارهای امن و هوشمند برای مدیریت و رشد سرمایه اهمیت حیاتی دارد. زِنیکس با بهره‌گیری از زیرساخت‌های مدرن ابری و پروتکل‌های امنیتی پیشرفته، بستری یکپارچه برای معاملات هوشمند، کوانتیفیکیشن و توسعه شبکه مالی شما فراهم کرده است.',
        aboutGoal: '<strong style="color:#38bdf8;">هدف ما:</strong> دموکراتیزه کردن دسترسی به ابزارهای مالی پیشرفته، ایجاد شفافیت کامل در تراکنش‌ها و فراهم کردن محیطی امن، پویا و سودآور برای تمامی کاربران، از مبتدی تا حرفه‌ای است.',
        aboutStrategy: '<strong style="color:#38bdf8;">استراتژی ما:</strong> تمرکز بر امنیت حداکثری و حریم خصوصی، پردازش آنی تراکنش‌ها با الگوریتم‌های مدرن، و خلق ارزش پایدار از طریق سیستم‌های پیشرفته پاداش‌دهی و توسعه تیمی.',
        aboutConclusion: '<i class="fas fa-quote-right" style="color:#38bdf8;margin-left:4px;"></i> زِنیکس تنها یک پلتفرم نیست؛ بلکه همراه مطمئن شما در مسیر هوشمندسازی و ساخت آینده‌ای روشن‌تر در دنیای مالی دیجیتال است. با ما همراه شوید تا مرزهای جدیدی از موفقیت را فتح کنید.',
        
        helpTitle: 'راهنمای جامع بخش داشبورد',
        helpP1: '<strong style="color:#38bdf8;">موجودی و آمار حساب:</strong> در بالای صفحه، موجودی حساب دلاری و مجموع تعداد زیرمجموعه‌های تیمی شما به صورت زنده نمایش داده می‌شود.',
        helpP2: '<strong style="color:#38bdf8;">دسترسی سریع به بخش‌ها:</strong> از طریق کارت‌های میانبر می‌توانید مستقیماً به بخش‌های کوانتیفیکیشن (معاملات هوشمند)، واریز، برداشت، تیم، تاریخچه تراکنش‌ها و تنظیمات پروفایل منتقل شوید.',
        helpP3: '<strong style="color:#38bdf8;">بازار ارزهای دیجیتال:</strong> این بخش لحظه‌ای ۳ ارز برتر بازار را به همراه قیمت و درصد تغییرات ۲۴ ساعته برای بررسی سریع روند بازار نمایش می‌دهد.',
        helpP4: '<strong style="color:#38bdf8;">صندوق پیام‌ها و اعلان‌ها:</strong> با کلیک روی آیکون زنگوله در هدر، می‌توانید آخرین اطلاعیه‌ها، پیام‌های مدیریت و وضعیت تایید یا لغو درخواست‌های مالی خود را مشاهده کنید.',
        helpP5: '<strong style="color:#38bdf8;">منوی همبرگری و زبان‌ها:</strong> از منوی بالایی می‌توانید بین زبان‌های مختلف جابجا شوید، به بخش «درباره پلتفرم» دسترسی داشته باشید یا از حساب خود خارج شوید.',

        floatingCasino: 'کازینو',
        modalTitle: 'صندوق پیام‌ها و اعلان‌ها', noMsg: 'هیچ پیام جدیدی وجود ندارد.', newBadge: 'جدید',
        tabAll: 'همه', tabApproved: 'تایید درخواست', tabRejected: 'لغو درخواست', tabAdmin: 'پیام مدیریت'
    },
    en: {
        m1: 'Home', m2: 'Quantification', m3: 'Deposit', m4: 'Withdraw', m5: 'Transactions', m6: 'Profile', m7: 'Support', m_about: 'About Platform', m8: 'Logout',
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
        aboutIntro: 'Welcome to Zenix, a leading platform born with a modern vision for the digital economy and financial technologies.',
        aboutDesc: 'In today\'s fast-paced world, access to secure and smart tools for asset management and growth is vital. Zenix provides an integrated environment for smart trading, quantification, and digital asset management.',
        aboutGoal: '<strong style="color:#38bdf8;">Our Goal:</strong> To democratize access to advanced financial tools, ensure complete transparency, and provide a secure, dynamic, and profitable environment for all users worldwide.',
        aboutStrategy: '<strong style="color:#38bdf8;">Our Strategy:</strong> Focusing on maximum security and privacy, instant transaction processing using modern algorithms, and creating sustainable value through advanced reward systems and team development.',
        aboutConclusion: '<i class="fas fa-quote-right" style="color:#38bdf8;margin-left:4px;"></i> Zenix is more than just a platform; it is your reliable partner on the path to smarter investing and building a brighter future in digital finance. Join us to conquer new heights of success.',
        
        helpTitle: 'Dashboard Comprehensive Guide',
        helpP1: '<strong style="color:#38bdf8;">Balance & Stats:</strong> Your current dollar balance and total team referrals are displayed live at the top.',
        helpP2: '<strong style="color:#38bdf8;">Quick Access Cards:</strong> Use shortcut cards to easily jump to Quantification, Deposit, Withdraw, Team, Transactions, and Profile settings.',
        helpP3: '<strong style="color:#38bdf8;">Crypto Market:</strong> Displays live pricing and 24h change for the top 3 tracked cryptocurrencies.',
        helpP4: '<strong style="color:#38bdf8;">Notifications:</strong> Click the bell icon in the header to view admin announcements and request statuses.',
        helpP5: '<strong style="color:#38bdf8;">Menu & Languages:</strong> Switch languages, check platform info, or log out using the header menus.',

        floatingCasino: 'Casino',
        modalTitle: 'Notifications & Messages', noMsg: 'No new messages.', newBadge: 'NEW',
        tabAll: 'All', tabApproved: 'Approved', tabRejected: 'Rejected', tabAdmin: 'Admin Msg'
    },
    ar: {
        m1: 'الرئيسية', m2: 'التكميم', m3: 'إيداع', m4: 'سحب', m5: 'المعاملات', m6: 'الملف الشخصي', m7: 'الدعم', m_about: 'حول المنصة', m8: 'تسجيل الخروج',
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
        aboutIntro: 'مرحباً بك في Zenix، المنصة الرائدة التي ولدت برؤية حديثة للاقتصاد الرقمي والتقنيات المالية.',
        aboutDesc: 'في عالم اليوم سريع الخطى، يعد الوصول إلى أدوات آمنة وذكية لإدارة الأصول ونموها أمراً بالغ الأهمية.',
        aboutGoal: '<strong style="color:#38bdf8;">هدفنا:</strong> إضفاء الطابع الديمقراطي على الوصول إلى الأدوات المالية المتقدمة، وضمان الشفافية الكاملة، وتوفير بيئة آمنة ومربحة.',
        aboutStrategy: '<strong style="color:#38bdf8;">استراتيجيتنا:</strong> التركيز على أقصى درجات الأمان والخصوصية والمعالجة الفورية للمعاملات.',
        aboutConclusion: 'Zenix هي أكثر من مجرد منصة؛ إنها شريكك الموثوق لبناء مستقبل مشرق.',
        
        helpTitle: 'دليل لوحة التحكم الشامل',
        helpP1: '<strong style="color:#38bdf8;">الرصيد والإحصائيات:</strong> يتم عرض رصيدك الحالي وإحالات فريقك في الأعلى.',
        helpP2: '<strong style="color:#38bdf8;">الوصول السريع:</strong> الانتقال مباشرة إلى التكميم، الإيداع، السحب، الفريق وغيرها.',
        helpP3: '<strong style="color:#38bdf8;">سوق العملات:</strong> تتبع أسعار أفضل 3 عملات رقمية مباشرة.',
        helpP4: '<strong style="color:#38bdf8;">الإشعارات:</strong> عرض الرسائل والطلبات عبر أيقونة الجرس.',
        helpP5: '<strong style="color:#38bdf8;">القائمة واللغات:</strong> تبديل اللغات وإدارة الحساب.',

        floatingCasino: 'كازينو',
        modalTitle: 'صندوق الرسائل والإشعارات', noMsg: 'لا توجد رسائل جديدة.', newBadge: 'جديد',
        tabAll: 'الكل', tabApproved: 'طلبات مقبولة', tabRejected: 'طلبات مرفوضة', tabAdmin: 'رسائل الإدارة'
    },
    tr: {
        m1: 'Ana Sayfa', m2: 'Kuantifikasyon', m3: 'Yatırım', m4: 'Çekim', m5: 'İşlemler', m6: 'Profil', m7: 'Destek', m_about: 'Platform Hakkında', m8: 'Çıkış',
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
        aboutIntro: 'Dijital ekonomi ve finansal teknolojilere modern bir vizyonla doğan öncü platform Zenix\'e hoş geldiniz.',
        aboutDesc: 'Günümüzün hızlı dünyasında varlık yönetimi için güvenli araçlara erişim hayati önem taşır.',
        aboutGoal: '<strong style="color:#38bdf8;">Hedefimiz:</strong> Gelişmiş finansal araçlara erişimi demokratikleştirerek güvenli ortam sağlamak.',
        aboutStrategy: '<strong style="color:#38bdf8;">Stratejimiz:</strong> Maksimum güvenlik ve gizlilik odaklı modern algoritmalar.',
        aboutConclusion: 'Zenix sadece bir platform değil; geleceğinizi inşa eden güvenilir ortağınızdır.',
        
        helpTitle: 'Kontrol Paneli Kapsamlı Rehberi',
        helpP1: '<strong style="color:#38bdf8;">Bakiye ve İstatistikler:</strong> Güncel bakiyeniz ve referanslarınız üst kısımda görünür.',
        helpP2: '<strong style="color:#38bdf8;">Hızlı Erişim:</strong> Kuantifikasyon, yatırım, çekim gibi işlemlere kolayca ulaşın.',
        helpP3: '<strong style="color:#38bdf8;">Kripto Piyasası:</strong> En iyi 3 coinin canlı fiyatlarını takip edin.',
        helpP4: '<strong style="color:#38bdf8;">Bildirimler:</strong> Duyuruları zil ikonundan inceleyin.',
        helpP5: '<strong style="color:#38bdf8;">Menü ve Diller:</strong> Dil değişimi ve platform bilgisi.',

        floatingCasino: 'Casino',
        modalTitle: 'Bildirimler ve Mesajlar', noMsg: 'Yeni mesaj yok.', newBadge: 'YENİ',
        tabAll: 'Tümü', tabApproved: 'Onaylanan', tabRejected: 'Reddedilen', tabAdmin: 'Yönetici'
    },
    ru: {
        m1: 'Главная', m2: 'Квантификация', m3: 'Депозит', m4: 'Вывод', m5: 'Транзакции', m6: 'Профиль', m7: 'Поддержка', m_about: 'О платформе', m8: 'Выход',
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
        aboutIntro: 'Добро пожаловать в Zenix — ведущую платформу с современным взглядом на цифровую экономику.',
        aboutDesc: 'В современном мире доступ к надежным и умным инструментам управления активами имеет жизненно важное значение.',
        aboutGoal: '<strong style="color:#38bdf8;">Наша цель:</strong> демократизировать доступ к передовым финансовым инструментам.',
        aboutStrategy: '<strong style="color:#38bdf8;">Наша стратегия:</strong> фокус на максимальной безопасности и конфиденциальности.',
        aboutConclusion: 'Zenix — ваш надежный партнер на пути к успеху в цифровых финансах.',
        
        helpTitle: 'Руководство по панели управления',
        helpP1: '<strong style="color:#38bdf8;">Баланс и статистика:</strong> Ваш баланс и рефералы отображаются вверху.',
        helpP2: '<strong style="color:#38bdf8;">Быстрый доступ:</strong> Переход к квантификации, депозитам, выводу.',
        helpP3: '<strong style="color:#38bdf8;">Крипторынок:</strong> Цены топ-3 монет в реальном времени.',
        helpP4: '<strong style="color:#38bdf8;">Уведомления:</strong> Просмотр объявлений через колокольчик.',
        helpP5: '<strong style="color:#38bdf8;">Меню и языки:</strong> Настройка языка и профиля.',

        floatingCasino: 'Казино',
        modalTitle: 'Уведомления', noMsg: 'Нет новых сообщений.', newBadge: 'НОВОЕ',
        tabAll: 'Все', tabApproved: 'Одобрено', tabRejected: 'Отклонено', tabAdmin: 'Админ'
    },
    es: {
        m1: 'Inicio', m2: 'Cuantificación', m3: 'Depósito', m4: 'Retiro', m5: 'Transacciones', m6: 'Perfil', m7: 'Soporte', m_about: 'Sobre la plataforma', m8: 'Cerrar sesión',
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
        aboutIntro: 'Bienvenido a Zenix, una plataforma líder con una visión moderna de la economía digital.',
        aboutDesc: 'En el acelerado mundo actual, el acceso a herramientas seguras e inteligentes es vital.',
        aboutGoal: '<strong style="color:#38bdf8;">Nuestro objetivo:</strong> Democratizar el acceso a herramientas financieras avanzadas.',
        aboutStrategy: '<strong style="color:#38bdf8;">Nuestra estrategia:</strong> Enfoque en la máxima seguridad y privacidad.',
        aboutConclusion: 'Zenix es tu socio confiable en el camino hacia un futuro financiero más brillante.',
        
        helpTitle: 'Guía del Panel de Control',
        helpP1: '<strong style="color:#38bdf8;">Saldo y Estadísticas:</strong> Tu saldo actual y referidos.',
        helpP2: '<strong style="color:#38bdf8;">Acceso rápido:</strong> Ir a cuantificación, depósitos, retiros, etc.',
        helpP3: '<strong style="color:#38bdf8;">Mercado cripto:</strong> Top 3 monedas en vivo.',
        helpP4: '<strong style="color:#38bdf8;">Notificaciones:</strong> Revisa anuncios y estados.',
        helpP5: '<strong style="color:#38bdf8;">Menú:</strong> Idiomas y opciones de cuenta.',

        floatingCasino: 'Casino',
        modalTitle: 'Notificaciones', noMsg: 'No hay mensajes nuevos.', newBadge: 'NUEVO',
        tabAll: 'Todo', tabApproved: 'Aprobado', tabRejected: 'Rechazado', tabAdmin: 'Admin'
    },
    fr: {
        m1: 'Accueil', m2: 'Quantification', m3: 'Dépôt', m4: 'Retrait', m5: 'Transactions', m6: 'Profil', m7: 'Support', m_about: 'À propos', m8: 'Déconnexion',
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
        aboutIntro: 'Bienvenue sur Zenix, une plateforme de premier plan dotée d\'une vision moderne.',
        aboutDesc: 'Dans le monde en évolution rapide d\'aujourd\'hui, l\'accès à des outils sécurisés est essentiel.',
        aboutGoal: '<strong style="color:#38bdf8;">Notre objectif:</strong> Démocratiser l\'accès aux outils financiers.',
        aboutStrategy: '<strong style="color:#38bdf8;">Notre stratégie:</strong> Se concentrer sur une sécurité maximale.',
        aboutConclusion: 'Zenix est votre partenaire de confiance vers le succès financier.',
        
        helpTitle: 'Guide du Tableau de Bord',
        helpP1: '<strong style="color:#38bdf8;">Solde et stats:</strong> Votre solde et parrainages.',
        helpP2: '<strong style="color:#38bdf8;">Accès rapide:</strong> Quantification, dépôt, retrait.',
        helpP3: '<strong style="color:#38bdf8;">Marché:</strong> Top 3 cryptos en direct.',
        helpP4: '<strong style="color:#38bdf8;">Notifications:</strong> Vos messages admin.',
        helpP5: '<strong style="color:#38bdf8;">Menu:</strong> Langues et paramètres.',

        floatingCasino: 'Casino',
        modalTitle: 'Notifications', noMsg: 'Aucun nouveau message.', newBadge: 'NOUVEAU',
        tabAll: 'Tout', tabApproved: 'Approuvé', tabRejected: 'Rejeté', tabAdmin: 'Admin'
    },
    de: {
        m1: 'Startseite', m2: 'Quantifizierung', m3: 'Einzahlung', m4: 'Auszahlung', m5: 'Transaktionen', m6: 'Profil', m7: 'Unterstützung', m_about: 'Über die Plattform', m8: 'Abmelden',
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
        aboutIntro: 'Willkommen bei Zenix, einer führenden Plattform mit einer modernen Vision für die digitale Wirtschaft.',
        aboutDesc: 'In der heutigen schnelllebigen Welt ist der Zugang zu sicheren und intelligenten Tools von entscheidender Bedeutung.',
        aboutGoal: '<strong style="color:#38bdf8;">Unser Ziel:</strong> Den Zugang zu fortschrittlichen Finanzinstrumenten zu demokratisieren.',
        aboutStrategy: '<strong style="color:#38bdf8;">Unsere Strategie:</strong> Fokus auf maximale Sicherheit und Privatsphäre.',
        aboutConclusion: 'Zenix ist Ihr zuverlässiger Partner auf dem Weg zu einer besseren finanziellen Zukunft.',
        
        helpTitle: 'Dashboard-Handbuch',
        helpP1: '<strong style="color:#38bdf8;">Guthaben & Statistik:</strong> Ihr Guthaben oben.',
        helpP2: '<strong style="color:#38bdf8;">Schnellzugriff:</strong> Zu Quantifizierung, Einzahlung, Auszahlung.',
        helpP3: '<strong style="color:#38bdf8;">Kryptomarkt:</strong> Top 3 Kurse.',
        helpP4: '<strong style="color:#38bdf8;">Benachrichtigungen:</strong> Admin-Meldungen.',
        helpP5: '<strong style="color:#38bdf8;">Menü:</strong> Sprachen und Kontoeinstellungen.',

        floatingCasino: 'Casino',
        modalTitle: 'Benachrichtigungen', noMsg: 'Keine neuen Nachrichten.', newBadge: 'NEU',
        tabAll: 'Alle', tabApproved: 'Genehmigt', tabRejected: 'Abgelehnt', tabAdmin: 'Admin'
    }
};

function setLang(l) {
    currLang = l;
    safeSetItem('zenix_lang', l);
    let t = ld[l] || ld.fa;
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

    let mAbout = document.getElementById('m_about');
    if (mAbout) mAbout.textContent = t.m_about;

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
    
    // درباره پلتفرم
    setTxt('t-about-box-title', t.aboutTitle);
    setTxt('t-about-box-intro', t.aboutIntro);
    setTxt('t-about-box-desc', t.aboutDesc);
    setHtml('t-about-box-goal', t.aboutGoal);
    setHtml('t-about-box-strategy', t.aboutStrategy);
    setHtml('t-about-box-conclusion', t.aboutConclusion);

    setTxt('t-about-modal-title', t.aboutTitle);
    setTxt('t-about-modal-intro', t.aboutIntro);
    setTxt('t-about-modal-desc', t.aboutDesc);
    setHtml('t-about-modal-goal', t.aboutGoal);
    setHtml('t-about-modal-strategy', t.aboutStrategy);
    setHtml('t-about-modal-conclusion', t.aboutConclusion);

    // راهنمای داشبورد
    let elHelpTitle = document.getElementById('t-help-modal-title');
    if (elHelpTitle) elHelpTitle.innerHTML = `<i class="fas fa-circle-question"></i> ${t.helpTitle}`;
    setHtml('t-help-p1', t.helpP1);
    setHtml('t-help-p2', t.helpP2);
    setHtml('t-help-p3', t.helpP3);
    setHtml('t-help-p4', t.helpP4);
    setHtml('t-help-p5', t.helpP5);

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
