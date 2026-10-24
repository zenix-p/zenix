/* ============================================
   Zenix - Device Fingerprinting
   برای تشخیص دستگاه کاربر در لاگین و تغییر رمز
   ============================================ */

(function(global) {
    'use strict';

    /**
     * محاسبه hash ساده از رشته (djb2)
     * نتیجه: ۱۶ کاراکتر hex
     */
    function hashString(str) {
        let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
        for (let i = 0; i < str.length; i++) {
            const ch = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        const lo = (h2 >>> 0).toString(16).padStart(8, '0');
        const hi = (h1 >>> 0).toString(16).padStart(8, '0');
        return lo + hi;
    }

    /**
     * جمع‌آوری اطلاعات دستگاه
     * این تابع اطلاعاتی رو جمع می‌کنه که روی دستگاه ثابت می‌مونن
     */
    function collectDeviceInfo() {
        const nav = navigator;
        const scr = screen;

        // استخراج برند از userAgent (برای اندروید)
        let brand = 'unknown';
        const ua = nav.userAgent || '';
        if (/iPhone/i.test(ua))          brand = 'Apple iPhone';
        else if (/iPad/i.test(ua))        brand = 'Apple iPad';
        else if (/Samsung|SM-|GT-/i.test(ua)) brand = 'Samsung';
        else if (/Xiaomi|Redmi|POCO/i.test(ua)) brand = 'Xiaomi';
        else if (/Huawei|HONOR/i.test(ua)) brand = 'Huawei';
        else if (/OnePlus/i.test(ua))     brand = 'OnePlus';
        else if (/OPPO|CPH/i.test(ua))    brand = 'OPPO';
        else if (/vivo/i.test(ua))        brand = 'Vivo';
        else if (/Pixel/i.test(ua))       brand = 'Google Pixel';
        else if (/Android/i.test(ua))     brand = 'Android (other)';
        else if (/Windows/i.test(ua))     brand = 'Windows';
        else if (/Macintosh|Mac OS X/i.test(ua)) brand = 'Mac';
        else if (/Linux/i.test(ua))       brand = 'Linux';

        // نوع دستگاه
        let deviceType = 'desktop';
        if (/iPad|Tablet/i.test(ua))          deviceType = 'tablet';
        else if (/iPhone|Android.*Mobile/i.test(ua)) deviceType = 'mobile';
        else if (/Android/i.test(ua))         deviceType = 'tablet';

        // سیستم‌عامل
        let os = 'unknown';
        const iOSMatch = ua.match(/OS (\d+[._]\d+)/);
        const androidMatch = ua.match(/Android (\d+(\.\d+)?)/);
        const windowsMatch = ua.match(/Windows NT (\d+\.\d+)/);
        if (iOSMatch)          os = 'iOS ' + iOSMatch[1].replace('_', '.');
        else if (androidMatch) os = 'Android ' + androidMatch[1];
        else if (windowsMatch) os = 'Windows ' + windowsMatch[1];
        else if (/Mac OS X/.test(ua)) os = 'macOS';
        else if (/Linux/.test(ua)) os = 'Linux';

        // مرورگر
        let browser = 'unknown';
        if (/Edg\//i.test(ua))             browser = 'Edge';
        else if (/OPR|Opera/i.test(ua))    browser = 'Opera';
        else if (/Chrome\/(\d+)/i.test(ua)) browser = 'Chrome ' + (ua.match(/Chrome\/(\d+)/i) || [])[1];
        else if (/Firefox\/(\d+)/i.test(ua)) browser = 'Firefox ' + (ua.match(/Firefox\/(\d+)/i) || [])[1];
        else if (/Safari\/(\d+)/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';

        return {
            user_agent:  ua,
            platform:    nav.platform || 'unknown',
            language:    nav.language || 'unknown',
            languages:   (nav.languages || []).join(','),
            timezone:    (Intl.DateTimeFormat().resolvedOptions().timeZone) || 'unknown',
            screen:      `${scr.width}x${scr.height}`,
            color_depth: scr.colorDepth || 0,
            pixel_ratio: window.devicePixelRatio || 1,
            cpu_cores:   nav.hardwareConcurrency || 0,
            memory:      nav.deviceMemory || 0,
            touch:       ('ontouchstart' in window) ? 1 : 0,
            brand:       brand,
            device_type: deviceType,
            os:          os,
            browser:     browser
        };
    }

    /**
     * محاسبه fingerprint از اطلاعات دستگاه
     * فقط فیلدهایی که روی یک دستگاه ثابت می‌مونن استفاده می‌شن
     * (نسخه مرورگر رو عمداً حذف کردیم چون با آپدیت تغییر می‌کنه)
     */
    function computeFingerprint(info) {
        // فقط ویژگی‌های سخت‌افزاری/پلتفرمی
        const stable = [
            info.platform,
            info.screen,
            info.color_depth,
            info.pixel_ratio,
            info.cpu_cores,
            info.memory,
            info.touch,
            info.timezone,
            info.device_type,
            info.brand,
            info.os
        ].join('|');
        return hashString(stable);
    }

    /**
     * تابع اصلی: گرفتن اطلاعات کامل + fingerprint
     */
    function getDeviceFingerprint() {
        const info = collectDeviceInfo();
        const fp = computeFingerprint(info);
        return {
            fingerprint: fp,
            info: info
        };
    }

    /**
     * ثبت فعالیت در دیتابیس Supabase
     * @param {object} supabaseClient - کلاینت Supabase
     * @param {string} email          - ایمیل کاربر
     * @param {string} action         - نوع فعالیت ('login' | 'password_change' | 'password_reset' | 'register')
     */
    async function logDeviceActivity(supabaseClient, email, action) {
        if (!supabaseClient) {
            console.error('[Device] supabase client missing');
            return null;
        }
        if (!email) {
            console.warn('[Device] email missing, skipping log');
            return null;
        }
        try {
            const { fingerprint, info } = getDeviceFingerprint();
            const { data, error } = await supabaseClient.rpc('log_device_activity', {
                p_user_email:  email,
                p_fingerprint: fingerprint,
                p_action:      action || 'login',
                p_user_agent:  info.user_agent,
                p_platform:    info.platform,
                p_device_info: info
            });
            if (error) {
                console.error('[Device] RPC error:', error);
                return null;
            }
            console.log(`[Device] logged ${action} | fp=${fingerprint} | ${info.brand} / ${info.os} / ${info.browser}`);
            return data;
        } catch (e) {
            console.error('[Device] logDeviceActivity error:', e);
            return null;
        }
    }

    /**
     * توضیح خوانا از دستگاه (برای نمایش به ادمین)
     */
    function describeDevice(info) {
        if (!info) return 'نامشخص';
        const parts = [];
        if (info.brand && info.brand !== 'unknown') parts.push(info.brand);
        if (info.os && info.os !== 'unknown') parts.push(info.os);
        if (info.browser && info.browser !== 'unknown') parts.push(info.browser);
        if (info.screen) parts.push(info.screen);
        return parts.join(' • ') || 'نامشخص';
    }

    // اکسپورت به window
    global.ZenixDevice = {
        getFingerprint:    getDeviceFingerprint,
        logActivity:       logDeviceActivity,
        describe:          describeDevice,
        collectInfo:       collectDeviceInfo
    };

    console.log('[Zenix Device] loaded ✅');

})(window);
