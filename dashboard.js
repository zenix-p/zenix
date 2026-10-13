// ==========================================
// 1. اتصال به سوبابیس و دریافت اطلاعات کاربر، موجودی و تیم
// ==========================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const SUPABASE_URL = "https://ujyenmqdgivuxvxptwyl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_tRJPNKN0KUFfcta6I3xsNw_icShZQhO";

const customStorage = {
    getItem: (key) => { try { return localStorage.getItem(key); } catch(e) { return null; } },
    setItem: (key, value) => { try { localStorage.setItem(key, value); } catch(e) {} },
    removeItem: (key) => { try { localStorage.removeItem(key); } catch(e) {} }
};

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
// 2. مدیریت سیستم اعلان‌ها و زنگوله (کاملاً هماهنگ با فایل تیم)
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
        const { data } = await supabase.from('notifications').select('*').eq('user_id', uid).order('created_at', { ascending: false });
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
    let list = allMessages;
    if (currentNotifFilter !== 'all') {
        list = allMessages.filter(m => getNotifCategory(m) === currentNotifFilter);
    }

    if (!list || list.length === 0) {
        c.innerHTML = `<div style="text-align:center;padding:20px;color:#94a3b8">هیچ پیام جدیدی وجود ندارد.</div>`;
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
                ${unread ? `<span style="font-size:9px;background:#38bdf8;color:#0f172a;padding:2px 6px;border-radius:4px;font-weight:700;">جدید</span>` : ''}
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
            await supabase.from('notifications').update({ read: true, is_read: true }).eq('id', m.id);
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

document.getElementById('bell-btn')?.addEventListener('click', e => { e.stopPropagation(); window.openMessageModal(); });


// ==========================================
// 3. دریافت اطلاعات کاربر، موجودی و زیرمجموعه‌ها
// ==========================================
async function loadDashboardUserData(user) {
    try {
        currentUserId = user.id;
        const { data: dbUser } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();
        const { data: dbProfile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        const meta = user.user_metadata || {};

        const balance = parseFloat(dbUser?.balance ?? dbProfile?.balance ?? meta.balance ?? 0);
        const valBalance = document.getElementById('val-balance');
        if (valBalance) {
            valBalance.textContent = `$${balance.toFixed(2)}`;
        }

        let codeDigits = generateUIDDigits(user.id);
        let myRefCode = dbProfile?.referral_code || ('MS-' + codeDigits);

        let rawList = [];
        try {
            const { data: dbProfiles } = await supabase.from('profiles').select('*');
            if (dbProfiles && Array.isArray(dbProfiles)) {
                rawList.push(...dbProfiles);
            }
        } catch(e) {}

        if (meta.team_members || meta.referrals || meta.invited_users) {
            let metaTeam = meta.team_members || meta.referrals || meta.invited_users;
            if (Array.isArray(metaTeam)) rawList.push(...metaTeam);
        }

        ['zenix_registered_users', 'zenix_users', 'zenix_referrals', 'zenix_team_' + user.id, 'zenix_all_users'].forEach(k => {
            try {
                let item = localStorage.getItem(k);
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

        let lvl1Users = allProfiles.filter(u => isReferredBy(u, user.id, myRefCode));
        let lvl2Users = [];
        if (lvl1Users.length > 0) {
            lvl2Users = allProfiles.filter(u => {
                let uUid = u.user_id || u.id;
                if (uUid === user.id || lvl1Users.some(l1 => (l1.user_id || l1.id) === uUid)) return false;
                return lvl1Users.some(l1 => isReferredBy(u, l1.user_id || l1.id, l1.referral_code));
            });
        }

        let lvl3Users = [];
        if (lvl2Users.length > 0) {
            lvl3Users = allProfiles.filter(u => {
                let uUid = u.user_id || u.id;
                if (uUid === user.id || lvl1Users.some(l1 => (l1.user_id || l1.id) === uUid) || lvl2Users.some(l2 => (l2.user_id || l2.id) === uUid)) return false;
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

        // بارگذاری اولیه پیام‌ها و تعداد خوانده‌نشده‌ها
        allMessages = await fetchUserMessages(user.id);
        updateNotifBadges();

    } catch (err) {
        console.error("خطا در دریافت اطلاعات کاربر:", err);
    }
}

supabase.auth.onAuthStateChange(async (event, session) => {
    if (session && session.user) {
        loadDashboardUserData(session.user);
    } else {
        window.location.href = 'index.html';
    }
});


// ==========================================
// 4. مدیریت منوی شناور کازینو و منوهای هدر
// ==========================================
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

const menuBtn = document.getElementById('menu-btn');
const navMenu = document.getElementById('nav-menu');
const langBtn = document.getElementById('lang-btn');
const langMenu = document.getElementById('lang-menu');
const helpBtn = document.getElementById('help-btn');

function closeAllMenus(except = '') {
    if (except !== 'nav' && navMenu) navMenu.classList.remove('show');
    if (except !== 'lang' && langMenu) langMenu.classList.remove('show');
    if (except !== 'casino' && casinoPopupMenu) casinoPopupMenu.classList.remove('show');
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

// دکمه راهنما
if (helpBtn) {
    helpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllMenus();
        const helpModal = document.getElementById('help-modal');
        if (helpModal) helpModal.classList.add('show');
        else alert('راهنمای داشبورد: از این پنل می‌توانید به بخش‌های مختلف دسترسی داشته باشید.');
    });
}

document.addEventListener('click', (e) => {
    if (navMenu && !navMenu.contains(e.target) && e.target !== menuBtn) navMenu.classList.remove('show');
    if (langMenu && !langMenu.contains(e.target) && e.target !== langBtn) langMenu.classList.remove('show');
});
