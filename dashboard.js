<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>پنل کاربری</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: Tahoma, Arial, sans-serif;
        }

        body {
            background-color: #f4f6f9;
            padding: 20px;
            direction: rtl;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .tabs {
            display: flex;
            background-color: #e9ecef;
            border-bottom: 2px solid #dee2e6;
        }

        .tab-button {
            flex: 1;
            padding: 15px;
            text-align: center;
            background: none;
            border: none;
            outline: none;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            color: #495057;
            position: relative;
            transition: background 0.3s;
        }

        .tab-button:hover {
            background-color: #f1f3f5;
        }

        .tab-button.active {
            background-color: #ffffff;
            color: #0d6efd;
            border-bottom: 3px solid #0d6efd;
        }

        /* استایل نشانگر تعداد (Badge) */
        .badge {
            display: inline-block;
            background-color: #dc3545;
            color: white;
            border-radius: 12px;
            padding: 2px 8px;
            font-size: 12px;
            margin-right: 6px;
            vertical-align: middle;
        }

        .tab-content {
            display: none;
            padding: 20px;
        }

        .tab-content.active {
            display: block;
        }

        .notification-item {
            padding: 12px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .notification-item.unread {
            background-color: #e7f5ff;
        }

        .btn-read {
            background-color: #198754;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        }
    </style>
</head>
<body>

<div class="container">
    <div class="tabs">
        <button class="tab-button active" onclick="openTab(event, 'home')">خانه</button>
        <button class="tab-button" onclick="openTab(event, 'notifications')">
            اعلا‌ن‌ها
            <span id="notificationBadge" class="badge">0</span>
        </button>
        <button class="tab-button" onclick="openTab(event, 'settings')">تنظیمات</button>
    </div>

    <div id="home" class="tab-content active">
        <h2>صفحه اصلی</h2>
        <p>به پنل کاربری خوش آمدید.</p>
    </div>

    <div id="notifications" class="tab-content">
        <h2>اعلا‌ن‌های شما</h2>
        <div id="notificationList">
            <!-- لیست اعلانات -->
        </div>
    </div>

    <div id="settings" class="tab-content">
        <h2>تنظیمات</h2>
        <p>تنظیمات حساب کاربری در این بخش قرار دارد.</p>
    </div>
</div>

<script>
    // داده‌های اولیه (بدون تغییر)
    const notificationsData = [
        { id: 1, title: 'پیام جدید از پشتیبانی', isRead: false },
        { id: 2, title: 'تخفیف ویژه روز خریدار', isRead: false },
        { id: 3, title: 'ورود موفق به حساب کاربری', isRead: true },
        { id: 4, title: 'به‌روزرسانی سیستم انجام شد', isRead: false }
    ];

    // تابع تعویض تب‌ها
    function openTab(evt, tabName) {
        const tabContents = document.getElementsByClassName("tab-content");
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].classList.remove("active");
        }

        const tabButtons = document.getElementsByClassName("tab-button");
        for (let i = 0; i < tabButtons.length; i++) {
            tabButtons[i].classList.remove("active");
        }

        document.getElementById(tabName).classList.add("active");
        evt.currentTarget.classList.add("active");
    }

    // [بخش اصلاح شده]: تابع به‌روزرسانی نشانگر تب اعلانات
    function updateNotificationBadge() {
        const unreadCount = notificationsData.filter(item => !item.isRead).length;
        const badgeElement = document.getElementById("notificationBadge");

        if (unreadCount > 0) {
            badgeElement.textContent = unreadCount;
            badgeElement.style.display = "inline-block";
        } else {
            badgeElement.style.display = "none";
        }
    }

    // رندر کردن لیست اعلانات
    function renderNotifications() {
        const listContainer = document.getElementById("notificationList");
        listContainer.innerHTML = "";

        notificationsData.forEach(item => {
            const div = document.createElement("div");
            div.className = `notification-item ${item.isRead ? '' : 'unread'}`;
            div.innerHTML = `
                <span>${item.title}</span>
                ${!item.isRead ? `<button class="btn-read" onclick="markAsRead(${item.id})">علامت به عنوان خوانده شده</button>` : '<span>خوانده شده</span>'}
            `;
            listContainer.appendChild(div);
        });

        // به‌روزرسانی تعداد روی تب
        updateNotificationBadge();
    }

    // تغییر وضعیت خوانده شدن اعلان
    function markAsRead(id) {
        const notification = notificationsData.find(item => item.id === id);
        if (notification) {
            notification.isRead = true;
            renderNotifications();
        }
    }

    // اجرای اولیه هنگام بارگذاری صفحه
    document.addEventListener("DOMContentLoaded", () => {
        renderNotifications();
    });
</script>

</body>
</html>
