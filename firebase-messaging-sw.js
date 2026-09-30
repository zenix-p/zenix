importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAqIksPfjCCQZNQDVx3MEdDyJyNMaTvtlk",
  authDomain: "zenix-platform.firebaseapp.com",
  projectId: "zenix-platform",
  storageBucket: "zenix-platform.firebasestorage.app",
  messagingSenderId: "594936010622",
  appId: "1:594936010622:web:9f4159c80111245062052f"
});

const messaging = firebase.messaging();

// دریافت نوتیفیکیشن زمانی که مرورگر یا تب بسته است
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] پیام پس‌زمینه دریافت شد: ', payload);

  const notificationTitle = payload.notification.title || "اعلان جدید Zenix";
  const notificationOptions = {
    body: payload.notification.body || "",
    icon: "/favicon.ico",
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});