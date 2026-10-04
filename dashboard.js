import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// تنظیمات اتصال به Supabase
const SUPABASE_URL = 'https://YOUR_SUPABASE_PROJECT_URL.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentMessages = [];
let activeFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    initNavigation();
    initLanguage();
    initHelpAndAboutModals();
    await loadUserData();
    await loadCryptoMarket();
    await loadNotifications();
});

// مدیریت منوها و ناوبری
function initNavigation() {
    const menuBtn = document.getElementById('menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const langBtn = document.getElementById('lang-btn');
    const langMenu = document.getElementById('lang-menu');
    const bellBtn = document.getElementById('bell-btn');

    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('show');
            if (langMenu) langMenu.classList.remove('show');
        });
    }

    if (langBtn && langMenu) {
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langMenu.classList.toggle('show');
            if (navMenu) navMenu.classList.remove('show');
        });
    }

    document.addEventListener('click', () => {
        if (navMenu) navMenu.classList.remove('show');
        if (langMenu) langMenu.classList.remove('show');
    });

    if (bellBtn) {
        bellBtn.addEventListener('click', () => {
            window.openMessageModal();
        });
    }
}

// انتخاب زبان
function initLanguage() {
    const langItems = document.querySelectorAll('#lang-menu .mi');
    langItems.forEach(item => {
        item.addEventListener('click', () => {
            const lang = item.getAttribute('data-lang');
            localStorage.setItem('zenix_lang', lang);
        });
    });
}

// بارگیری اطلاعات کاربر و آمار
async function loadUserData() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profile) {
            const balEl = document.getElementById('val-balance');
            const refEl = document.getElementById('val-ref');
            if (balEl) balEl.textContent = `$${parseFloat(profile.balance || 0).toFixed(2)}`;
            if (refEl) refEl.textContent = profile.referral_count || 0;
        }
    } catch (err) {
        console.error('خطا در دریافت اطلاعات کاربر:', err);
    }
}

// بارگیری نرخ ارزهای دیجیتال
async function loadCryptoMarket() {
    const tickerContainer = document.getElementById('crypto-ticker-list');
    if (!tickerContainer) return;

    try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd&include_24hr_change=true');
        const data = await res.json();

        const cryptos = [
            { name: 'Bitcoin', symbol: 'BTC', price: data.bitcoin?.usd || 0, change: data.bitcoin?.usd_24h_change || 0, icon: 'fa-btc', color: '#f7931a' },
            { name: 'Ethereum', symbol: 'ETH', price: data.ethereum?.usd || 0, change: data.ethereum?.usd_24h_change || 0, icon: 'fa-ethereum', color: '#627eea' },
            { name: 'Tether', symbol: 'USDT', price: data.tether?.usd || 1, change: data.tether?.usd_24h_change || 0, icon: 'fa-dollar-sign', color: '#26a17b' }
        ];

        tickerContainer.innerHTML = cryptos.map(c => {
            const isUp = c.change >= 0;
            const changeClass = isUp ? 'price-up' : 'price-down';
            const changeSign = isUp ? '+' : '';
            return `
                <div class="crypto-row">
                    <div class="crypto-info">
                        <div class="crypto-icon" style="background:${c.color}"><i class="fab ${c.icon}"></i></div>
                        <div><strong>${c.symbol}</strong></div>
                    </div>
                    <div>
                        <div>$${c.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                        <div class="${changeClass}">${changeSign}${c.change.toFixed(2)}%</div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('خطا در دریافت نرخ ارزها:', err);
    }
}

// بارگیری پیام‌ها و محاسبه پویای تعداد پیام هر تب
async function loadNotifications() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: msgs, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        currentMessages = msgs || [];

        // به‌روزرسانی بج زنگوله اصلی
        const unreadCount = currentMessages.filter(m => !m.is_read).length;
        const bellBadge = document.getElementById('bell-badge');
        if (bellBadge) {
            bellBadge.textContent = unreadCount;
            if (unreadCount > 0) {
                bellBadge.classList.add('show');
            } else {
                bellBadge.classList.remove('show');
            }
        }

        // محاسبه و قرار دادن تعداد واقعی پیام‌ها روی تب‌ها
        updateTabBadges(currentMessages);

    } catch (err) {
        console.error('خطا در دریافت پیام‌ها:', err);
    }
}

// تابع شمارش و به‌روزرسانی اعداد روی تب‌های اعلان
function updateTabBadges(msgs) {
    const allCnt = msgs.length;
    const approvedCnt = msgs.filter(m => m.type === 'approved' || m.status === 'approved' || m.type === 'deposit_success' || m.type === 'withdraw_success').length;
    const rejectedCnt = msgs.filter(m => m.type === 'rejected' || m.status === 'rejected' || m.type === 'deposit_rejected' || m.type === 'withdraw_rejected').length;
    const adminCnt = msgs.filter(m => m.type === 'admin_message' || m.type === 'admin' || m.type === 'system').length;

    const elAll = document.getElementById('cnt-tab-all');
    const elApproved = document.getElementById('cnt-tab-approved');
    const elRejected = document.getElementById('cnt-tab-rejected');
    const elAdmin = document.getElementById('cnt-tab-admin');

    if (elAll) elAll.textContent = allCnt;
    if (elApproved) elApproved.textContent = approvedCnt;
    if (elRejected) elRejected.textContent = rejectedCnt;
    if (elAdmin) elAdmin.textContent = adminCnt;
}

// رندر کردن لیست پیام‌ها داخل مودال
function renderMessages() {
    const container = document.getElementById('modal-msg-container');
    if (!container) return;

    let filtered = currentMessages;

    if (activeFilter === 'approved') {
        filtered = currentMessages.filter(m => m.type === 'approved' || m.status === 'approved' || m.type === 'deposit_success' || m.type === 'withdraw_success');
    } else if (activeFilter === 'rejected') {
        filtered = currentMessages.filter(m => m.type === 'rejected' || m.status === 'rejected' || m.type === 'deposit_rejected' || m.type === 'withdraw_rejected');
    } else if (activeFilter === 'admin_message') {
        filtered = currentMessages.filter(m => m.type === 'admin_message' || m.type === 'admin' || m.type === 'system');
    }

    if (filtered.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:20px;color:#94a3b8">هیچ پیام جدیدی وجود ندارد.</div>';
        return;
    }

    container.innerHTML = filtered.map(m => `
        <div class="msg-body-box" onclick="window.openMsgDetail('${m.id}')" style="cursor:pointer;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                <div class="msg-title-text">${m.title || 'اعلان جدید'}</div>
                <div style="font-size:10px;color:#64748b;">${new Date(m.created_at).toLocaleDateString('fa-IR')}</div>
            </div>
            <div class="msg-desc-text">${m.message || m.body || ''}</div>
        </div>
    `).join('');
}

// توابع مودال متصل به شیء window
window.openMessageModal = () => {
    const modal = document.getElementById('m-msg');
    if (modal) {
        modal.classList.add('show');
        renderMessages();
    }
};

window.closeMessageModal = () => {
    const modal = document.getElementById('m-msg');
    if (modal) modal.classList.remove('show');
};

window.setNotifFilter = (filterType, btnEl) => {
    activeFilter = filterType;
    const tabs = document.querySelectorAll('.notif-tab');
    tabs.forEach(t => t.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    renderMessages();
};

window.openMsgDetail = (msgId) => {
    const msg = currentMessages.find(m => m.id === msgId);
    if (!msg) return;

    const detailModal = document.getElementById('m-msg-detail');
    const titleEl = document.getElementById('detail-msg-title');
    const bodyEl = document.getElementById('detail-msg-body');
    const dateEl = document.getElementById('detail-msg-date');

    if (titleEl) titleEl.innerHTML = `<i class="fas fa-envelope-open"></i> ${msg.title || 'جزئیات پیام'}`;
    if (bodyEl) bodyEl.textContent = msg.message || msg.body || '';
    if (dateEl) {
        dateEl.style.display = 'block';
        dateEl.textContent = new Date(msg.created_at).toLocaleString('fa-IR');
    }

    if (detailModal) detailModal.classList.add('show');
};

window.closeMsgDetailModal = () => {
    const detailModal = document.getElementById('m-msg-detail');
    if (detailModal) detailModal.classList.remove('show');
};

function initHelpAndAboutModals() {
    const helpBtn = document.getElementById('help-btn');
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            const helpModal = document.getElementById('m-help');
            if (helpModal) helpModal.classList.add('show');
        });
    }
}

window.closeHelpModal = () => {
    const helpModal = document.getElementById('m-help');
    if (helpModal) helpModal.classList.remove('show');
};

window.openAboutModal = () => {
    const aboutModal = document.getElementById('m-about');
    if (aboutModal) aboutModal.classList.add('show');
};

window.closeAboutModal = () => {
    const aboutModal = document.getElementById('m-about');
    if (aboutModal) aboutModal.classList.remove('show');
};
