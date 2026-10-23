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

    const t = ld[currLang] || ld.en;
    const cat = getNotifCategory(m);
    const isWithdrawalReject = (cat === 'rejected') && isWithdrawalMessage(m);

    let titleEl = document.getElementById('detail-msg-title');
    let dateEl = document.getElementById('detail-msg-date');
    let bodyEl = document.getElementById('detail-msg-body');
    let supportEl = document.getElementById('detail-msg-support');

    if (titleEl) titleEl.innerHTML = `<i class="fas fa-envelope-open"></i> ${escapeHtml(m.subject)}`;
    if (dateEl) {
        dateEl.textContent = m.time || '';
        dateEl.style.display = m.time ? 'block' : 'none';
    }

    let bodyText = '';
    if (isWithdrawalReject) {
        const defaultText = t.rejectWithdrawDefault || '';
        const adminText = (m.body || '').trim();
        bodyText = defaultText;
        if (adminText && adminText.length > 15 && adminText !== defaultText) {
            bodyText += '\n\n———\n\n' + adminText;
        }
    } else {
        bodyText = m.body || '';
    }
    if (bodyEl) bodyEl.textContent = bodyText;

    // ★ دکمه ارتباط با پشتیبانی — برای رد برداشت، موضوع withdraw از قبل انتخاب می‌شود
    if (supportEl) {
        if (cat === 'rejected') {
            const supportUrl = isWithdrawalReject ? 'support.html?topic=withdraw' : 'support.html';
            const supportLabel = escapeHtml(t.contactSupport || 'Contact Support');
            supportEl.innerHTML = `
                <a href="${supportUrl}" style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:8px;padding:11px 16px;background:linear-gradient(135deg,#a855f7,#ec4899);color:#fff;text-decoration:none;border-radius:10px;font-size:12.5px;font-weight:700;box-shadow:0 6px 20px rgba(168,85,247,.35);transition:transform .15s, box-shadow .2s;" onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='0 8px 26px rgba(168,85,247,.5)';" onmouseout="this.style.transform='';this.style.boxShadow='0 6px 20px rgba(168,85,247,.35)';">
                    <i class="fas fa-headset" style="font-size:13px;"></i>
                    <span>${supportLabel}</span>
                </a>`;
        } else {
            supportEl.innerHTML = '';
        }
    }

    document.getElementById('m-msg-detail')?.classList.add('show');
};
