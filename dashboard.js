import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyAqIksPfjCCQZNQDVx3MEdDyJyNMaTvtlk",
  authDomain: "zenix-platform.firebaseapp.com",
  projectId: "zenix-platform",
  storageBucket: "zenix-platform.firebasestorage.app",
  messagingSenderId: "594936010622",
  appId: "1:594936010622:web:9f4159c80111245062052f",
  measurementId: "G-LXSGYB8WKM"
});

const auth = getAuth(app);
const db = getFirestore(app);

let uName = "";
let currLang = localStorage.getItem('zenix_lang') || 'fa';
let allMessages = [];
let currentUserId = null;
let activeNotifTab = 'all';

const ld = {
  fa: {
    wel: 'خوش آمدید', sub: 'پنل مدیریت کاربری', st: 'تایید شده', s1: 'موجودی', s2: 'زیرمجموعه',
    c1: 'کوانتیفیکیشن', d1: 'معاملات هوشمند', c2: 'واریز', d2: 'شارژ حساب', c3: 'برداشت', d3: 'برداشت دارایی',
    c4: 'تیم', d4: 'زیرمجموعه‌ها', c5: 'تراکنش‌ها', d5: 'تاریخچه مالی', c6: 'پروفایل', d6: 'تنظیمات امنیت',
    m1: 'صفحه اصلی', m2: 'کوانتیفیکیشن', m3: 'واریز', m4: 'برداشت', m5: 'تراکنش', m6: 'پروفایل', m7: 'پشتیبانی',
    m_about: 'درباره پلتفرم', m8: 'خروج', tMkt: 'بازار ارزهای دیجیتال (۳ ارز برتر از ۵۰ ارز رصد شده)',
    tLive: 'زنده', tNode: 'سرور فعال (US-East)', phoneErr: 'وارد کردن شماره تلفن الزامی است.',
    modalTitle: 'صندوق پیام‌ها و اطلاعیه‌ها', tabAll: 'همه', tabSystem: 'اطلاعیه‌ها', tabPersonal: 'پیام‌های شخصی',
    noMsg: 'هیچ پیام جدیدی وجود ندارد.', backMsg: 'بازگشت به لیست پیام‌ها', newBadge: 'جدید', helpTitle: 'راهنمای صفحه داشبورد',
    helpBtnTitle: 'راهنمای صفحه داشبورد',
    hpT1: 'کاربرد این صفحه (داشبورد) چیست؟', hpD1: 'داشبورد مرکز کنترل و خانه اصلی حساب کاربری شماست. از این صفحه می‌توانید کل دارایی‌ها، وضعیت حساب و وضعیت تیم خود را بررسی کنید و به تمام بخش‌های اصلی پلتفرم دسترسی سریع داشته باشید.',
    hpT2: 'کارت موجودی و زیرمجموعه‌ها', hpD2: 'در این قسمت می‌توانید مجموع کل دارایی‌های دلاری و تعداد اعضای تیم زیرمجموعه خود را به صورت لحظه‌ای مشاهده کنید.',
    hpT3: 'بخش‌های دسترسی سریع', hpD3: 'دکمه‌های میانبر (کوانتیفیکیشن، واریز، برداشت، تیم، تراکنش‌ها و پروفایل) برای ورود آنی به بخش‌های مختلف پلتفرم تعبیه شده‌اند.',
    hpT4: 'بازار زنده ارزهای دیجیتال', hpD4: 'نمایش لحظه‌ای تغییرات قیمت و درصد سود برترین ارزهای دیجیتال برای رصد بازار جهانی در یک نگاه.',
    abTitle: 'درباره پلتفرم Zenix (هدف، ماهیت و ساختار)',
    abDesc: 'پلتفرم Zenix یک اکوسیستم مالی نوین و هوشمند در حوزه ارزهای دیجیتال و پردازش‌های معاملاتی است که با هدف ایجاد بستری امن، خودکار و سودآور برای کاربران طراحی شده است.',
    abL1T: 'هدف اصلی:', abL1D: 'اتوماسیون فرآیندهای معاملاتی از طریق سیستم‌های هوش مصنوعی و الگوریتم‌های کوانتیفیکیشن (Quantification)، به‌طوری‌که کاربران بدون نیاز به تخصص پیچیده در ترید، بتوانند از نوسانات بازار جهانی سود کسب کنند.',
    abL2T: 'امنیت و زیرساخت:', abL2D: 'متکی بر پروتکل‌های رمزنگاری پیشرفته، اتصال به گره‌های پردازشی ابری پرسرعت و مدیریت یکپارچه دارایی‌ها در بستر پایگاه داده ابری امن (Firebase).',
    abL3T: 'ساختار چندسطحی (Referral & Team):', abL3D: 'ایجاد یک شبکه پویای معرفی دوستان تا کاربران بتوانند از فعالیت زیرمجموعه‌های خود در چند سطح مختلف پاداش و درآمد پایدار دریافت کنند.',
    abL4T: 'احساس واقع‌گرایی:', abL4D: 'وجود بازار لحظه‌ای رمزارزها، شاخص‌های زنده حجم معاملات، نرخ گاز شبکه و اطلاعیه‌های سیستم به کاربر این اطمینان را می‌دهد که با یک پلتفرم بین‌المللی و زنده سروکار دارد.'
  },
  en: {
    wel: 'Welcome', sub: 'User Control Panel', st: 'Verified', s1: 'Balance', s2: 'Referrals',
    c1: 'Quantification', d1: 'Smart Trading', c2: 'Deposit', d2: 'Fund Account', c3: 'Withdraw', d3: 'Withdraw Assets',
    c4: 'Team', d4: 'Referrals', c5: 'Transactions', d5: 'Financial History', c6: 'Profile', d6: 'Security Settings',
    m1: 'Home', m2: 'Quantification', m3: 'Deposit', m4: 'Withdraw', m5: 'Transactions', m6: 'Profile', m7: 'Support',
    m_about: 'About Platform', m8: 'Logout', tMkt: 'Crypto Market (Top 3 of 50 Monitored)',
    tLive: 'LIVE', tNode: 'Node Active (US-East)', phoneErr: 'Phone number is required.',
    modalTitle: 'Notifications & Announcements', tabAll: 'All', tabSystem: 'Announcements', tabPersonal: 'Personal Messages',
    noMsg: 'No new messages found.', backMsg: 'Back to Messages List', newBadge: 'NEW', helpTitle: 'Dashboard Guide',
    helpBtnTitle: 'Dashboard Page Guide',
    hpT1: 'What is the purpose of this page?', hpD1: 'The dashboard is your main control center. From here you can check total assets, account status, team status, and quickly access all key platform sections.',
    hpT2: 'Balance & Referral Cards', hpD2: 'Here you can view your total USD assets and the number of referral team members in real time.',
    hpT3: 'Quick Access Shortcuts', hpD3: 'Shortcut buttons (Quantification, Deposit, Withdraw, Team, Transactions, Profile) for instant access.',
    hpT4: 'Live Crypto Market', hpD4: 'Real-time price changes and profit percentage of top cryptocurrencies for instant global market tracking.',
    abTitle: 'About Zenix Platform (Goal, Nature & Structure)',
    abDesc: 'Zenix Platform is an innovative financial ecosystem in cryptocurrency and trading processing designed for a secure, automated, and profitable user experience.',
    abL1T: 'Main Goal:', abL1D: 'Automating trading processes via AI systems and quantification algorithms, enabling users to profit from market fluctuations without complex trading expertise.',
    abL2T: 'Security & Infrastructure:', abL2D: 'Backed by advanced encryption protocols, high-speed cloud processing nodes, and secure Firebase database storage.',
    abL3T: 'Multi-level Structure (Referral & Team):', abL3D: 'Creating a dynamic referral network so users receive multi-level rewards and sustainable passive income from team activity.',
    abL4T: 'Realism & Live Data:', abL4D: 'Live crypto ticker, volume indicators, network gas fees, and system notices ensure users interact with an active global platform.'
  },
  ar: {
    wel: 'أهلاً بك', sub: 'لوحة التحكم', st: 'موثق', s1: 'الرصيد', s2: 'الإحالات',
    c1: 'الكمية', d1: 'التداول الذكي', c2: 'إيداع', d2: 'شحن الرصيد', c3: 'سحب', d3: 'سحب الأصول',
    c4: 'الفريق', d4: 'الإحالات', c5: 'المعاملات', d5: 'السجل المالي', c6: 'الملف', d6: 'إعدادات الأمان',
    m1: 'الرئيسية', m2: 'الكمية', m3: 'إيداع', m4: 'سحب', m5: 'المعاملات', m6: 'الملف الشخصي', m7: 'الدعم',
    m_about: 'عن المنصة', m8: 'خروج', tMkt: 'سوق العملات الرقمية (أفضل ٣ من ٥٠)', tLive: 'مباشر', tNode: 'خادم نشط (US-East)',
    phoneErr: 'رقم الهاتف مطلوب.', modalTitle: 'صندوق الرسائل والإشعارات', tabAll: 'الكل', tabSystem: 'الإعلانات', tabPersonal: 'رسائل شخصية',
    noMsg: 'لا توجد رسائل جديدة.', backMsg: 'العودة إلى قائمة الرسائل', newBadge: 'جديد', helpTitle: 'دليل لوحة التحكم',
    helpBtnTitle: 'دليل صفحة لوحة التحكم',
    hpT1: 'ما هو هدف هذه الصفحة؟', hpD1: 'لوحة التحكم هي مركز إدارة حسابك الرئيسي. يمكنك من هنا متابعة رصيدك وحالة حسابك وفريقك والوصول السريع لجميع أقسام المنصة.',
    hpT2: 'بطاقة الرصيد والإحالات', hpD2: 'يمكنك هنا مشاهدة إجمالي أصولك بالدولار وعدد أعضاء فريقك بشكل مباشر.',
    hpT3: 'اختصارات الوصول السريع', hpD3: 'أزرار سريعة للانتقال الفوري إلى التداول والإيداع والسحب والفريق والمعاملات والملف الشخصي.',
    hpT4: 'سوق العملات المباشر', hpD4: 'عرض لحظي لتغيرات أسعار وأرباح أهم العملات الرقمية لمتابعة السوق العالمي.',
    abTitle: 'عن منصة Zenix (الهدف والطبيعة والهيكل)',
    abDesc: 'منصة Zenix هي بيئة مالية مبتكرة وذكية في مجال العملات الرقمية صُممت لتقديم تجربة آمنة وآلية ومربحة للمستخدمين.',
    abL1T: 'الهدف الرئيسي:', abL1D: 'أتمتة عمليات التداول عبر الذكاء الاصطناعي وخوارزميات الكمية لتمكين المستخدمين من تحقيق أرباح دون الحاجة لخبرة تداول معقدة.',
    abL2T: 'الأمان والبنية التحتية:', abL2D: 'تعتمد على بروتوكولات تشفير متقدمة وعقد معالجة سحابية سريعة وقاعدة بيانات Firebase آمنة.',
    abL3T: 'الهيكل متعدد المستويات:', abL3D: 'إنشاء شبكة إحالة ديناميكية لتمكين المستخدمين من الحصول على مكافآت مستمرة من نشاط فريقهم.',
    abL4T: 'بيانات حية وواقعية:', abL4D: 'مؤشرات أسعار وحجم تداول ورسوم شبكة حية تضمن التفاعل مع منصة عالمية حقيقية.'
  },
  tr: {
    wel: 'Hoş Geldiniz', sub: 'Kullanıcı Paneli', st: 'Doğrulanmış', s1: 'Bakiye', s2: 'Referanslar',
    c1: 'Kantifikasyon', d1: 'Akıllı Ticaret', c2: 'Para Yatırma', d2: 'Bakiye Yükle', c3: 'Çekim', d3: 'Varlık Çek',
    c4: 'Takım', d4: 'Referanslar', c5: 'İşlemler', d5: 'Finansal Geçmiş', c6: 'Profil', d6: 'Güvenlik Ayarları',
    m1: 'Ana Sayfa', m2: 'Kantifikasyon', m3: 'Para Yatırma', m4: 'Çekim', m5: 'İşlemler', m6: 'Profil', m7: 'Destek',
    m_about: 'Platform Hakkında', m8: 'Çıkış', tMkt: 'Kripto Piyasası (Top 3 / 50)', tLive: 'CANLI', tNode: 'Sunucu Aktif (US-East)',
    phoneErr: 'Telefon numarası gereklidir.', modalTitle: 'Mesajlar ve Duyurular', tabAll: 'Tümü', tabSystem: 'Duyurular', tabPersonal: 'Kişisel Mesajlar',
    noMsg: 'Yeni mesaj yok.', backMsg: 'Mesaj Listesine Dön', newBadge: 'YENİ', helpTitle: 'Dashboard Kılavuzu',
    helpBtnTitle: 'Dashboard Sayfası Kılavuzu',
    hpT1: 'Bu sayfanın amacı nedir?', hpD1: 'Dashboard, hesabınızın ana kontrol merkezidir. Buradan toplam varlıklarınızı, hesap durumunuzu kontrol edebilir ve tüm platform bölümlerine hızlıca erişebilirsiniz.',
    hpT2: 'Bakiye ve Referans Kartları', hpD2: 'Burada toplam USD varlığınızı ve referans ekibinizin üye sayısını canlı olarak görebilirsiniz.',
    hpT3: 'Hızlı Erişim Kısayolları', hpD3: 'Farklı bölümlere anında geçiş yapmak için kısayol butonları.',
    hpT4: 'Canlı Kripto Piyasası', hpD4: 'Küresel piyasayı takip etmek için en popüler kripto paraların anlık fiyat değişimleri.',
    abTitle: 'Zenix Platformu Hakkında (Amaç, Yapı ve Detaylar)',
    abDesc: 'Zenix Platformu, kripto para ticaretinde güvenli, otomatik ve kazançlı bir deneyim sunmak için tasarlanmış yenilikçi bir finansal ekosistemdir.',
    abL1T: 'Ana Amaç:', abL1D: 'Yapay zeka ve nicel ticaret algoritmaları ile işlem süreçlerini otomatikleştirmek, karmaşık analiz bilgisine gerek kalmadan kazanç sağlamak.',
    abL2T: 'Güvenlik ve Altyapı:', abL2D: 'Gelişmiş şifreleme protokolleri, hızlı bulut işleme düğümleri ve güvenli Firebase veritabanı altyapısı.',
    abL3T: 'Çok Seviyeli Ekip Yapısı:', abL3D: 'Kullanıcıların alt ekiplerinin faaliyetlerinden sürekli ödül ve pasif gelir elde edebileceği dinamik davet ağı.',
    abL4T: 'Gerçek Zamanlı Veriler:', abL4D: 'Canlı kripto fiyatları, işlem hacmi göstergeleri ve sistem bildirimleri ile şeffaf platform tecrübesi.'
  },
  ru: {
    wel: 'Добро пожаловать', sub: 'Панель управления', st: 'Проверено', s1: 'Баланс', s2: 'Рефералы',
    c1: 'Квантификация', d1: 'Умный трейдинг', c2: 'Депозит', d2: 'Пополнение', c3: 'Вывод', d3: 'Вывод средств',
    c4: 'Команда', d4: 'Рефералы', c5: 'Транзакции', d5: 'Финансовая история', c6: 'Профиль', d6: 'Настройки безопасности',
    m1: 'Главная', m2: 'Квантификация', m3: 'Депозит', m4: 'Вывод', m5: 'Транзакции', m6: 'Профиль', m7: 'Поддержка',
    m_about: 'О платформе', m8: 'Выйти', tMkt: 'Крипто Рынок (Топ 3 из 50)', tLive: 'LIVE', tNode: 'Сервер активен (US-East)',
    phoneErr: 'Номер телефона обязателен.', modalTitle: 'Сообщения и Уведомления', tabAll: 'Все', tabSystem: 'Объявления', tabPersonal: 'Личные сообщения',
    noMsg: 'Нет новых сообщений.', backMsg: 'Назад к списку сообщений', newBadge: 'НОВОЕ', helpTitle: 'Руководство по панели',
    helpBtnTitle: 'Справка по панели управления',
    hpT1: 'Каково назначение этой страницы?', hpD1: 'Панель управления — ваш главный центр контроля. Здесь вы можете проверить баланс, статус счета, статистику команды и быстро перейти во все разделы.',
    hpT2: 'Карточки баланса и рефералов', hpD2: 'Здесь отображаются ваш общий баланс в USD и количество участников вашей команды в реальном времени.',
    hpT3: 'Быстрый доступ', hpD3: 'Кнопки быстрого перехода в основные разделы платформы.',
    hpT4: 'Живой рынок криптовалют', hpD4: 'Отслеживание цен и процентов изменения топовых криптовалют в реальном времени.',
    abTitle: 'О платформе Zenix (Цель, суть и структура)',
    abDesc: 'Платформа Zenix — это инновационная финансовая экосистема в сфере криптовалют, созданная для безопасной, автоматизированной и прибыльной торговли.',
    abL1T: 'Главная цель:', abL1D: 'Автоматизация торговли с помощью ИИ и квантитативных алгоритмов, позволяющая получать прибыль без сложных навыков трейдинга.',
    abL2T: 'Безопасность и инфраструктура:', abL2D: 'Продвинутые протоколы шифрования, высокоскоростные облачные узлы и надежное хранилище Firebase.',
    abL3T: 'Многоуровневая структура:', abL3D: 'Динамичная реферальная сеть для получения стабильного дохода от активности вашей команды на нескольких уровнях.',
    abL4T: 'Реалистичность и данные:', abL4D: 'Живые котировки, индикаторы объема и уведомления гарантируют работу с современной международной платформой.'
  },
  es: {
    wel: 'Bienvenido', sub: 'Panel de Usuario', st: 'Verificado', s1: 'Saldo', s2: 'Referidos',
    c1: 'Cuantificación', d1: 'Trading Inteligente', c2: 'Depósito', d2: 'Fondear Cuenta', c3: 'Retiro', d3: 'Retirar Activos',
    c4: 'Equipo', d4: 'Referidos', c5: 'Transacciones', d5: 'Historial Financiero', c6: 'Perfil', d6: 'Configuración de Seguridad',
    m1: 'Inicio', m2: 'Cuantificación', m3: 'Depósito', m4: 'Retiro', m5: 'Transacciones', m6: 'Perfil', m7: 'Soporte',
    m_about: 'Acerca de', m8: 'Cerrar Sesión', tMkt: 'Mercado Cripto (Top 3 de 50)', tLive: 'EN VIVO', tNode: 'Servidor Activo (US-East)',
    phoneErr: 'El número de teléfono es obligatorio.', modalTitle: 'Mensajes y Anuncios', tabAll: 'Todos', tabSystem: 'Anuncios', tabPersonal: 'Mensajes Personales',
    noMsg: 'No hay mensajes nuevos.', backMsg: 'Volver a la Lista de Mensajes', newBadge: 'NUEVO', helpTitle: 'Guía del Panel',
    helpBtnTitle: 'Guía de la página de inicio',
    hpT1: '¿Cuál es el propósito de esta página?', hpD1: 'El panel es su centro de control principal. Desde aquí puede consultar sus activos totales, estado de cuenta, equipo y acceder rápidamente a todas las secciones.',
    hpT2: 'Tarjetas de Saldo y Referidos', hpD2: 'Aquí puede ver sus activos totales en USD y el número de miembros de su equipo en tiempo real.',
    hpT3: 'Accesos Rápidos', hpD3: 'Botones de acceso directo a Cuantificación, Depósito, Retiro, Equipo, Transacciones y Perfil.',
    hpT4: 'Mercado Cripto en Vivo', hpD4: 'Cambios de precio y porcentaje de ganancias en tiempo real de las principales criptomonedas.',
    abTitle: 'Acerca de la Plataforma Zenix (Objetivo y Estructura)',
    abDesc: 'La Plataforma Zenix es un ecosistema financiero innovador diseñado para ofrecer una experiencia de trading segura, automatizada y rentable.',
    abL1T: 'Objetivo Principal:', abL1D: 'Automatizar los procesos de trading mediante IA y algoritmos de cuantificación, permitiendo obtener ganancias sin necesidad de experiencia previa.',
    abL2T: 'Seguridad e Infraestructura:', abL2D: 'Respaldado por protocolos de encriptación avanzados, nodos en la nube de alta velocidad y almacenamiento seguro en Firebase.',
    abL3T: 'Estructura Multinivel:', abL3D: 'Red de referidos dinámica para recibir comisiones e ingresos pasivos continuos por la actividad del equipo.',
    abL4T: 'Datos en Tiempo Real:', abL4D: 'Precios en vivo, volumen de operaciones y alertas del sistema que garantizan transparencia constante.'
  },
  fr: {
    wel: 'Bienvenue', sub: 'Tableau de Bord', st: 'Vérifié', s1: 'Solde', s2: 'Filleuls',
    c1: 'Quantification', d1: 'Trading Intelligent', c2: 'Dépôt', d2: 'Alimenter Compte', c3: 'Retrait', d3: 'Retirer Actifs',
    c4: 'Équipe', d4: 'Filleuls', c5: 'Transactions', d5: 'Historique Financier', c6: 'Profil', d6: 'Paramètres de Sécurité',
    m1: 'Accueil', m2: 'Quantification', m3: 'Dépôt', m4: 'Retrait', m5: 'Transactions', m6: 'Profil', m7: 'Support',
    m_about: 'À propos', m8: 'Déconnexion', tMkt: 'Marché Crypto (Top 3 sur 50)', tLive: 'EN DIRECT', tNode: 'Serveur Actif (US-East)',
    phoneErr: 'Le numéro de téléphone est obligatoire.', modalTitle: 'Messages et Annonces', tabAll: 'Tous', tabSystem: 'Annonces', tabPersonal: 'Messages Personnels',
    noMsg: 'Aucun nouveau message.', backMsg: 'Retour à la Liste des Messages', newBadge: 'NOUVEAU', helpTitle: 'Guide du Tableau de Bord',
    helpBtnTitle: 'Guide de la page d’accueil',
    hpT1: 'Quel est le rôle de cette page ?', hpD1: 'Le tableau de bord est le centre de contrôle principal de votre compte. Vous pouvez y consulter vos avoirs, votre statut et accéder rapidement à toutes les fonctionnalités.',
    hpT2: 'Cartes Solde & Filleuls', hpD2: 'Consultez en temps réel le total de vos avoirs en USD et le nombre de membres de votre équipe.',
    hpT3: 'Raccourcis d’Accès Rapide', hpD3: 'Boutons d’accès direct vers la quantification, les dépôts, retraits, l’équipe, l’historique et le profil.',
    hpT4: 'Marché Crypto en Direct', hpD4: 'Suivi en temps réel des variations de prix et des taux de profit des principales cryptomonnaies.',
    abTitle: 'À propos de Zenix (Objectif, Nature & Structure)',
    abDesc: 'La plateforme Zenix est un écosystème financier moderne conçu pour offrir une expérience de trading automatisée, sécurisée et profitable.',
    abL1T: 'Objectif Principal :', abL1D: 'Automatiser le trading grâce à l’IA et à la quantification pour générer des profits sans compétences complexes.',
    abL2T: 'Sécurité & Infrastructure :', abL2D: 'Basé sur des protocoles de cryptage avancés, des nœuds cloud rapides et une base de données Firebase sécurisée.',
    abL3T: 'Structure Multiniveau :', abL3D: 'Réseau de parrainage dynamique permettant de percevoir des commissions régulières basées sur l’activité de votre équipe.',
    abL4T: 'Données en Temps Réel :', abL4D: 'Cours en direct, indicateurs de volume et notifications assurant une transparence totale.'
  },
  de: {
    wel: 'Willkommen', sub: 'Benutzer-Dashboard', st: 'Verifiziert', s1: 'Guthaben', s2: 'Empfehlungen',
    c1: 'Quantifizierung', d1: 'Intelligenter Handel', c2: 'Einzahlung', d2: 'Konto Aufladen', c3: 'Auszahlung', d3: 'Guthaben Abheben',
    c4: 'Team', d4: 'Empfehlungen', c5: 'Transaktionen', d5: 'Finanzhistorie', c6: 'Profil', d6: 'Sicherheitseinstellungen',
    m1: 'Startseite', m2: 'Quantifizierung', m3: 'Einzahlung', m4: 'Auszahlung', m5: 'Transaktionen', m6: 'Profil', m7: 'Support',
    m_about: 'Über Uns', m8: 'Abmelden', tMkt: 'Krypto-Markt (Top 3 von 50)', tLive: 'LIVE', tNode: 'Server Aktiv (US-East)',
    phoneErr: 'Telefonnummer ist erforderlich.', modalTitle: 'Nachrichten & Ankündigungen', tabAll: 'Alle', tabSystem: 'Ankündigungen', tabPersonal: 'Persönliche Nachrichten',
    noMsg: 'Keine neuen Nachrichten.', backMsg: 'Zurück zur Nachrichtenliste', newBadge: 'NEU', helpTitle: 'Dashboard-Anleitung',
    helpBtnTitle: 'Dashboard-Anleitung anzeigen',
    hpT1: 'Was ist der Zweck dieser Seite?', hpD1: 'Das Dashboard ist Ihre zentrale Steuerung. Hier können Sie Ihr Gesamtguthaben, Ihren Kontostatus und Ihr Team einsehen sowie schnell auf alle Funktionen zugreifen.',
    hpT2: 'Guthaben- und Empfehlungskarten', hpD2: 'Hier sehen Sie Ihr USD-Gesamtguthaben und die Anzahl Ihrer Teammitglieder in Echtzeit.',
    hpT3: 'Schnellzugriff-Verknüpfungen', hpD3: 'Direkte Buttons für Quantifizierung, Einzahlung, Auszahlung, Team, Transaktionen und Profil.',
    hpT4: 'Live Krypto-Markt', hpD4: 'Echtzeit-Preisänderungen und Gewinnprozente der führenden Kryptowährungen im Überblick.',
    abTitle: 'Über die Zenix Platform (Ziel, Natur & Struktur)',
    abDesc: 'Zenix ist ein modernes Finanz-Ökosystem für Kryptowährungen, das für sicheres, automatisiertes und profitables Trading entwickelt wurde.',
    abL1T: 'Hauptziel:', abL1D: 'Automatisierung von Handelsprozessen durch KI und Quantifizierungs-Algorithmen für Erträge ohne komplexes Fachwissen.',
    abL2T: 'Sicherheit & Infrastruktur:', abL2D: 'Unterstützt durch fortgeschrittene Verschlüsselung, schnelle Cloud-Knoten und sichere Firebase-Datenbanken.',
    abL3T: 'Mehrstufige Teamstruktur:', abL3D: 'Dynamisches Empfehlungsnetzwerk für nachhaltige Belohnungen und passives Einkommen durch Teamaktivitäten.',
    abL4T: 'Echtzeit-Transparenz:', abL4D: 'Live-Kurse, Handelsvolumen-Indikatoren und Systemnachrichten für eine aktive globale Plattform.'
  }
};

async function fetchUserMessages(uid) {
  try {
    let messages = [];
    let snap = await getDocs(collection(db, "users", uid, "notifications"));
    snap.docs.forEach(d => {
      let dt = d.data();
      let typeVal = dt.type || dt.category || (dt.isGlobal ? 'system' : 'personal');
      messages.push({
        id: d.id,
        subject: dt.title || dt.subject || 'Announcement',
        body: dt.message || dt.text || dt.body || '',
        time: dt.createdAt || dt.timestamp || dt.time || new Date().toISOString(),
        read: dt.read === true || dt.isRead === true,
        type: typeVal,
        isGlobal: dt.isGlobal === true
      });
    });

    messages.sort((a, b) => {
      const getTimeMs = (timeVal) => {
        if (!timeVal) return 0;
        if (typeof timeVal.toDate === 'function') return timeVal.toDate().getTime();
        if (typeof timeVal.seconds === 'number') return timeVal.seconds * 1000;
        const parsed = new Date(timeVal).getTime();
        return isNaN(parsed) ? 0 : parsed;
      };
      return getTimeMs(b.time) - getTimeMs(a.time);
    });

    return messages;
  } catch (e) {
    console.error(e);
    return [];
  }
}

window.switchNotifTab = (tab) => {
  activeNotifTab = tab;
  document.querySelectorAll('.notif-tab').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tab);
  });
  renderMessageList();
};

window.openMessageModal = async () => {
  let c = document.getElementById('modal-msg-container'), t = ld[currLang] || ld.fa;
  if (currentUserId) {
    allMessages = await fetchUserMessages(currentUserId);
    let unread = allMessages.filter(m => !m.read).length, b = document.getElementById('bell-badge');
    if (b) { b.textContent = unread; b.classList.toggle('show', unread > 0); }
  }
  if (allMessages.length > 0) renderMessageList();
  else c.innerHTML = `<div style="text-align:center;padding:20px;color:#94a3b8">${t.noMsg}</div>`;
  document.getElementById('m-msg')?.classList.add('show');
};

function renderMessageList() {
  let c = document.getElementById('modal-msg-container'), t = ld[currLang] || ld.fa;
  
  let filtered = allMessages.filter(m => {
    if (activeNotifTab === 'system') return m.type === 'system' || m.type === 'global' || m.isGlobal;
    if (activeNotifTab === 'personal') return m.type !== 'system' && m.type !== 'global' && !m.isGlobal;
    return true;
  });

  if (filtered.length === 0) {
    c.innerHTML = `<div style="text-align:center;padding:20px;color:#94a3b8">${t.noMsg}</div>`;
    return;
  }

  let html = '<div style="display:flex;flex-direction:column;gap:10px;">';
  filtered.forEach((m) => {
    let originalIdx = allMessages.indexOf(m);
    let dTime = '';
    if (m.time) {
      let d = typeof m.time.toDate === 'function' ? m.time.toDate() : new Date(m.time);
      dTime = isNaN(d.getTime()) ? String(m.time) : d.toUTCString();
    }
    let unread = !m.read;
    let isSys = m.type === 'system' || m.type === 'global' || m.isGlobal;
    let iconCls = isSys ? 'fa-bullhorn' : (unread ? 'fa-envelope' : 'fa-envelope-open-text');
    let iconColor = isSys ? '#a855f7' : '#38bdf8';

    html += `<div class="msg-body-box" style="cursor:pointer;border-right:${unread ? '3px solid #38bdf8' : '1px solid rgba(255,255,255,.08)'};" onclick="window.readAdminMessage(${originalIdx})">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div class="msg-title-text" style="${unread ? 'color:#fff;font-weight:800;' : ''}"><i class="fas ${iconCls}" style="color:${iconColor};margin-left:5px;"></i> ${m.subject}</div>
        ${unread ? `<span style="font-size:9px;background:#38bdf8;color:#0f172a;padding:2px 6px;border-radius:4px;font-weight:700;">${t.newBadge}</span>` : ''}
      </div>
      <div class="msg-desc-text" style="margin-top:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${m.body}</div>
      <div style="font-size:10px;color:#64748b;margin-top:6px;text-align:left" dir="ltr">${dTime}</div>
    </div>`;
  });
  c.innerHTML = html + '</div>';
}

window.readAdminMessage = async idx => {
  let m = allMessages[idx]; if (!m) return;
  if (!m.read && currentUserId && m.id) {
    allMessages[idx].read = true;
    try {
      await updateDoc(doc(db, "users", currentUserId, "notifications", m.id), { read: true, isRead: true });
      let unread = allMessages.filter(i => !i.read).length, b = document.getElementById('bell-badge');
      if (b) { b.textContent = unread; b.classList.toggle('show', unread > 0); }
    } catch (e) { console.error(e); }
  }
  let c = document.getElementById('modal-msg-container'), t = ld[currLang] || ld.fa, dTime = '';
  if (m.time) {
    let d = typeof m.time.toDate === 'function' ? m.time.toDate() : new Date(m.time);
    dTime = isNaN(d.getTime()) ? String(m.time) : d.toUTCString();
  }
  c.innerHTML = `<button onclick="window.openMessageModal()" style="background:none;border:none;color:#38bdf8;cursor:pointer;font-size:12px;margin-bottom:12px;display:flex;align-items:center;gap:5px;padding:0;"><i class="fas fa-arrow-right"></i> ${t.backMsg}</button>
  <div class="msg-body-box" style="padding:16px;">
    <div class="msg-title-text" style="font-size:15px;margin-bottom:8px;"><i class="fas fa-envelope-open-text" style="color:#38bdf8;"></i> ${m.subject}</div>
    <div class="msg-desc-text" style="font-size:13px;line-height:1.8;color:#f8fafc;white-space:pre-wrap;">${m.body}</div>
    <div style="font-size:11px;color:#64748b;margin-top:14px;text-align:left;border-top:1px solid rgba(255,255,255,.05);padding-top:8px;" dir="ltr">${dTime}</div>
  </div>`;
};

window.closeMessageModal = () => {
  document.getElementById('m-msg')?.classList.remove('show');
  document.getElementById('m-message')?.classList.remove('show');
};
window.closeMsgModal = window.closeMessageModal;

window.closeHelpModal = () => document.getElementById('m-help')?.classList.remove('show');
window.closeAboutModal = () => document.getElementById('m-about')?.classList.remove('show');

window.openHelpModal = () => document.getElementById('m-help')?.classList.add('show');
window.openAboutModal = () => document.getElementById('m-about')?.classList.add('show');

document.getElementById('bell-btn')?.addEventListener('click', e => { e.stopPropagation(); window.openMessageModal(); });
document.getElementById('help-btn')?.addEventListener('click', e => { e.stopPropagation(); window.openHelpModal(); });
window.addEventListener('pageshow', () => document.querySelectorAll('.menu').forEach(x => x.classList.remove('show')));

onAuthStateChanged(auth, async u => {
  if (!u) { window.location.href = 'index.html'; return; }
  currentUserId = u.uid;
  try {
    let d = await getDoc(doc(db, "users", u.uid));
    if (d.exists()) {
      let data = d.data();
      
      uName = data.fullName || data.fullname || data.name || "";
      setLang(currLang);

      let rawBalance = data.balance ?? data.depositAmount ?? data.wallet ?? data.amount ?? 0;
      let numericBalance = parseFloat(rawBalance);
      if (isNaN(numericBalance)) numericBalance = 0;
      
      let elBal = document.getElementById('val-balance');
      if (elBal) elBal.textContent = `$${numericBalance.toFixed(2)}`;

      let totalRef = 0;
      let refCode = data.referralCode;

      if (refCode) {
        try {
          let snapAll = await getDocs(collection(db, "users"));
          let allUsers = [];
          snapAll.forEach(ds => allUsers.push(ds.data()));
          
          let l1 = allUsers.filter(i => i.referredBy === refCode),
              l1c = l1.map(i => i.referralCode).filter(Boolean),
              l2 = allUsers.filter(i => l1c.includes(i.referredBy)),
              l2c = l2.map(i => l1c.includes(i.referredBy)),
              l3 = allUsers.filter(i => l2c.includes(i.referredBy));
          
          totalRef = l1.length + l2.length + l3.length;
        } catch (refErr) {
          totalRef = Number(data.totalReferrals || data.refCount || 0) ||
                     (Number(data.gen1Count || data.generation1 || 0) + 
                      Number(data.gen2Count || data.generation2 || 0) + 
                      Number(data.gen3Count || data.generation3 || 0));
        }
      } else {
        totalRef = Number(data.totalReferrals || data.refCount || 0) ||
                   (Number(data.gen1Count || data.generation1 || 0) + 
                    Number(data.gen2Count || data.generation2 || 0) + 
                    Number(data.gen3Count || data.generation3 || 0));
      }

      let elRef = document.getElementById('val-ref'); 
      if (elRef) elRef.textContent = totalRef;

      allMessages = await fetchUserMessages(u.uid);
      let unread = allMessages.filter(m => !m.read).length, b = document.getElementById('bell-badge');
      if (b && unread > 0) { b.textContent = unread; b.classList.add('show'); }

      let phone = data.phone || data.phoneNumber;
      if (!phone) {
        localStorage.setItem('profile_error', (ld[currLang] || ld.fa).phoneErr);
        window.location.replace('profile.html'); 
        return;
      }
    }
  } catch (e) { 
    console.error("خطا در دریافت اطلاعات کاربر:", e); 
  }
});

const mBtn = document.getElementById('menu-btn'), nMenu = document.getElementById('nav-menu'), lBtn = document.getElementById('lang-btn'), lMenu = document.getElementById('lang-menu');
function toggleM(m, e) { e?.stopPropagation(); [nMenu, lMenu].forEach(x => { if (x && x !== m) x.classList.remove('show'); }); m?.classList.toggle('show'); }
mBtn?.addEventListener('click', e => toggleM(nMenu, e));
lBtn?.addEventListener('click', e => toggleM(lMenu, e));
document.addEventListener('click', e => {
  if (!e.target.closest('.menu') && !e.target.closest('#menu-btn') && !e.target.closest('#lang-btn')) {
    [nMenu, lMenu].forEach(x => x?.classList.remove('show'));
  }
});
window.addEventListener('scroll', () => [nMenu, lMenu].forEach(x => x?.classList.remove('show')));
document.querySelectorAll('.menu').forEach(m => m.addEventListener('click', e => e.stopPropagation()));

function setLang(l) {
  currLang = l; 
  localStorage.setItem('zenix_lang', l);
  [nMenu, lMenu].forEach(x => x?.classList.remove('show'));
  
  document.querySelectorAll('#lang-menu .mi').forEach(el => {
    el.classList.toggle('active', el.dataset.lang === l);
  });

  let t = ld[l] || ld.fa;
  let r = l === 'fa' || l === 'ar';
  
  document.documentElement.setAttribute('dir', r ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', l);
  
  for (let i = 1; i <= 6; i++) { 
    let el = document.getElementById('i' + i); 
    if (el) el.className = r ? 'fas fa-chevron-left' : 'fas fa-chevron-right'; 
  }
  
  let elWel = document.getElementById('t-wel'); 
  if (elWel) {
    elWel.textContent = uName ? (t.wel + '، ' + uName) : t.wel;
  }
  
  const subKeys = ['sub', 'st', 's1', 's2'];
  const subIds = ['t-sub', 't-st', 'ts1', 'ts2'];
  subIds.forEach((id, idx) => {
    let el = document.getElementById(id);
    if (el) el.textContent = t[subKeys[idx]];
  });

  let elMkt = document.getElementById('t-mkt');
  if (elMkt) elMkt.innerHTML = '<i class="fas fa-chart-line" style="color:#22c55e"></i> ' + t.tMkt;
  
  let elLive = document.getElementById('t-live');
  if (elLive) elLive.textContent = t.tLive;
  
  let elNode = document.getElementById('t-node');
  if (elNode) elNode.textContent = t.tNode;
  
  let elModalTitle = document.getElementById('t-modal-title');
  if (elModalTitle) elModalTitle.textContent = t.modalTitle;

  // ترجمه عنوان تب‌های اعلانات
  let elTabAll = document.getElementById('t-tab-all'); if (elTabAll) elTabAll.textContent = t.tabAll;
  let elTabSys = document.getElementById('t-tab-system'); if (elTabSys) elTabSys.textContent = t.tabSystem;
  let elTabPer = document.getElementById('t-tab-personal'); if (elTabPer) elTabPer.textContent = t.tabPersonal;
  
  let elAbout = document.getElementById('m_about');
  if (elAbout) elAbout.textContent = t.m_about;

  let helpBtn = document.getElementById('help-btn');
  if (helpBtn) helpBtn.setAttribute('title', t.helpBtnTitle || '');

  let elHelpTitle = document.getElementById('t-help-title');
  if (elHelpTitle) elHelpTitle.textContent = t.helpTitle;

  for (let i = 1; i <= 4; i++) {
    let ht = document.getElementById('t-hp-t' + i);
    let hd = document.getElementById('t-hp-d' + i);
    if (ht) {
      const icons = ['fa-home', 'fa-wallet', 'fa-th-large', 'fa-chart-line'];
      const colors = ['#38bdf8', '#38bdf8', '#a855f7', '#22c55e'];
      ht.innerHTML = `<i class="fas ${icons[i-1]}" style="color:${colors[i-1]}"></i> ` + (t['hpT' + i] || '');
    }
    if (hd) hd.textContent = t['hpD' + i] || '';
  }

  ['t-ab-title', 't-about-title'].forEach(id => {
    let el = document.getElementById(id); if (el) el.textContent = t.abTitle;
  });
  ['t-ab-desc', 't-ab-m-desc'].forEach(id => {
    let el = document.getElementById(id); if (el) el.textContent = t.abDesc;
  });

  for (let i = 1; i <= 4; i++) {
    ['t-ab-l' + i + 't', 't-ab-m-l' + i + 't'].forEach(id => {
      let el = document.getElementById(id); if (el) el.textContent = t['abL' + i + 'T'];
    });
    ['t-ab-l' + i + 'd', 't-ab-m-l' + i + 'd'].forEach(id => {
      let el = document.getElementById(id); if (el) el.textContent = t['abL' + i + 'D'];
    });
  }

  for (let i = 1; i <= 6; i++) { 
    let c = document.getElementById('c' + i);
    let d = document.getElementById('d' + i); 
    if (c) c.textContent = t['c' + i] || ''; 
    if (d) d.textContent = t['d' + i] || ''; 
  }
  
  for (let i = 1; i <= 8; i++) { 
    let m = document.getElementById('m' + i); 
    if (m) m.textContent = t['m' + i] || ''; 
  }
}

document.querySelectorAll('#lang-menu .mi').forEach(i => i.addEventListener('click', () => setLang(i.dataset.lang)));

document.getElementById('logout-btn')?.addEventListener('click', async e => {
  e.preventDefault(); try { await signOut(auth); } catch (e) {}
  localStorage.clear(); window.location.href = 'index.html';
});
setLang(currLang);

const cryptoPool = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', price: 94517.19, cls: 'fab fa-bitcoin', color: '#f7931a', change: 1.85 },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', price: 3480.20, cls: 'fab fa-ethereum', color: '#627eea', change: 2.12 },
  { id: 'sol', name: 'Solana', symbol: 'SOL', price: 189.30, cls: 'fas fa-sun', color: '#14f195', change: 3.41 },
  { id: 'bnb', name: 'Binance Coin', symbol: 'BNB', price: 615.40, cls: 'fas fa-cube', color: '#f3ba2f', change: 0.95 },
  { id: 'xrp', name: 'XRP', symbol: 'XRP', price: 1.45, cls: 'fas fa-bolt', color: '#23292f', change: 4.20 },
  { id: 'doge', name: 'Dogecoin', symbol: 'DOGE', price: 0.38, cls: 'fas fa-dog', color: '#c2a633', change: 5.65 },
  { id: 'ada', name: 'Cardano', symbol: 'ADA', price: 0.75, cls: 'fas fa-circle-nodes', color: '#0033ad', change: 1.10 },
  { id: 'avax', name: 'Avalanche', symbol: 'AVAX', price: 32.40, cls: 'fas fa-mountain', color: '#e84142', change: 2.30 },
  { id: 'link', name: 'Chainlink', symbol: 'LINK', price: 18.50, cls: 'fas fa-link', color: '#375bd2', change: 2.80 },
  { id: 'matic', name: 'Polygon', symbol: 'MATIC', price: 0.55, cls: 'fas fa-chess-board', color: '#8247e5', change: 1.50 },
  { id: 'uni', name: 'Uniswap', symbol: 'UNI', price: 8.20, cls: 'fas fa-code-branch', color: '#ff007a', change: 0.40 },
  { id: 'dot', name: 'Polkadot', symbol: 'DOT', price: 7.10, cls: 'fas fa-circle', color: '#e6007a', change: -0.50 },
  { id: 'ltc', name: 'Litecoin', symbol: 'LTC', price: 85.40, cls: 'fas fa-litecoin', color: '#345d9d', change: 1.20 },
  { id: 'bch', name: 'Bitcoin Cash', symbol: 'BCH', price: 380.00, cls: 'fab fa-bitcoin', color: '#8dc351', change: 3.10 },
  { id: 'near', name: 'NEAR Protocol', symbol: 'NEAR', price: 5.40, cls: 'fas fa-network-wired', color: '#000000', change: 4.50 },
  { id: 'apt', name: 'Aptos', symbol: 'APT', price: 9.20, cls: 'fas fa-layer-group', color: '#222222', change: 2.10 },
  { id: 'sui', name: 'Sui', symbol: 'SUI', price: 3.10, cls: 'fas fa-water', color: '#3d70b2', change: 6.20 },
  { id: 'atom', name: 'Cosmos', symbol: 'ATOM', price: 6.50, cls: 'fas fa-globe', color: '#2e3148', change: -1.20 },
  { id: 'arb', name: 'Arbitrum', symbol: 'ARB', price: 0.75, cls: 'fas fa-feather', color: '#28a0f0', change: 1.80 },
  { id: 'op', name: 'Optimism', symbol: 'OP', price: 1.80, cls: 'fas fa-shield-alt', color: '#ff0420', change: 2.40 },
  { id: 'inj', name: 'Injective', symbol: 'INJ', price: 24.50, cls: 'fas fa-syringe', color: '#00f2fe', change: 5.10 },
  { id: 'render', name: 'Render', symbol: 'RENDER', price: 7.80, cls: 'fas fa-server', color: '#b53636', change: 3.80 },
  { id: 'fet', name: 'Artificial Superintelligence', symbol: 'FET', price: 1.40, cls: 'fas fa-brain', color: '#1d2859', change: 4.10 },
  { id: 'tao', name: 'Bittensor', symbol: 'TAO', price: 450.00, cls: 'fas fa-brain', color: '#ffffff', change: 7.50 },
  { id: 'shib', name: 'Shiba Inu', symbol: 'SHIB', price: 0.000025, cls: 'fas fa-dog', color: '#e4a81d', change: 3.20 },
  { id: 'pepe', name: 'Pepe', symbol: 'PEPE', price: 0.000012, cls: 'fas fa-frog', color: '#3d9970', change: 8.40 },
  { id: 'bonk', name: 'Bonk', symbol: 'BONK', price: 0.000022, cls: 'fas fa-bone', color: '#e65c00', change: 5.90 },
  { id: 'floki', name: 'Floki', symbol: 'FLOKI', price: 0.00015, cls: 'fas fa-shield-dog', color: '#b8860b', change: 2.60 },
  { id: 'trx', name: 'TRON', symbol: 'TRX', price: 0.24, cls: 'fas fa-gem', color: '#ff0000', change: 0.80 },
  { id: 'xlm', name: 'Stellar', symbol: 'XLM', price: 0.35, cls: 'fas fa-star', color: '#14b6eb', change: 1.90 },
  { id: 'etc', name: 'Ethereum Classic', symbol: 'ETC', price: 28.90, cls: 'fab fa-ethereum', color: '#3cfa70', change: -0.40 },
  { id: 'fil', name: 'Filecoin', symbol: 'FIL', price: 5.20, cls: 'fas fa-file', color: '#0090ff', change: 1.30 },
  { id: 'algo', name: 'Algorand', symbol: 'ALGO', price: 0.28, cls: 'fas fa-project-diagram', color: '#000000', change: 2.20 },
  { id: 'hbar', name: 'Hedera', symbol: 'HBAR', price: 0.18, cls: 'fas fa-cube', color: '#222222', change: 3.50 },
  { id: 'vet', name: 'VeChain', symbol: 'VET', price: 0.035, cls: 'fas fa-check-double', color: '#15abd8', change: 0.60 },
  { id: 'grt', name: 'The Graph', symbol: 'GRT', price: 0.21, cls: 'fas fa-project-diagram', color: '#6f4cff', change: 2.50 },
  { id: 'ftm', name: 'Fantom', symbol: 'FTM', price: 0.72, cls: 'fas fa-ghost', color: '#1969ff', change: 4.80 },
  { id: 'mkr', name: 'Maker', symbol: 'MKR', price: 2100.00, cls: 'fas fa-coins', color: '#1aab9b', change: 0.30 },
  { id: 'aave', name: 'Aave', symbol: 'AAVE', price: 180.00, cls: 'fas fa-ghost', color: '#b6509e', change: 3.60 },
  { id: 'kava', name: 'Kava', symbol: 'KAVA', price: 0.62, cls: 'fas fa-shield-alt', color: '#ff433e', change: 1.40 },
  { id: 'crv', name: 'Curve DAO', symbol: 'CRV', price: 0.42, cls: 'fas fa-chart-pie', color: '#ff3333', change: -0.80 },
  { id: 'snx', name: 'Synthetix', symbol: 'SNX', price: 1.90, cls: 'fas fa-wave-square', color: '#00d1b2', change: 2.00 },
  { id: 'comp', name: 'Compound', symbol: 'COMP', price: 58.00, cls: 'fas fa-university', color: '#00d395', change: 0.90 },
  { id: 'cake', name: 'PancakeSwap', symbol: 'CAKE', price: 2.40, cls: 'fas fa-birthday-cake', color: '#d18844', change: 1.70 },
  { id: 'flow', name: 'Flow', symbol: 'FLOW', price: 0.75, cls: 'fas fa-water', color: '#00ef8b', change: 2.30 },
  { id: 'sand', name: 'The Sandbox', symbol: 'SAND', price: 0.38, cls: 'fas fa-cube', color: '#0084ff', change: 3.90 },
  { id: 'mana', name: 'Decentraland', symbol: 'MANA', price: 0.39, cls: 'fas fa-vr-cardboard', color: '#ff2d55', change: 1.60 },
  { id: 'theta', name: 'Theta Network', symbol: 'THETA', price: 2.20, cls: 'fas fa-video', color: '#00a3e0', change: 2.70 },
  { id: 'axs', name: 'Axie Infinity', symbol: 'AXS', price: 5.10, cls: 'fas fa-gamepad', color: '#0055ff', change: 3.00 },
  { id: 'chz', name: 'Chiliz', symbol: 'CHZ', price: 0.075, cls: 'fas fa-futbol', color: '#cd0101', change: 1.90 }
];

function renderTop3() {
  let c = document.getElementById('crypto-ticker-list'); if (!c) return;
  const famousCoins = cryptoPool.filter(coin => ['btc', 'eth', 'sol'].includes(coin.id));
  c.innerHTML = '';
  famousCoins.forEach(coin => {
    let up = coin.change >= 0, pCls = up ? 'price-up' : 'price-down';
    c.innerHTML += `<div class="crypto-row" id="crypto-row-${coin.id}">
      <div class="crypto-info">
        <div class="crypto-icon" style="background:${coin.color};"><i class="${coin.cls}"></i></div>
        <div>
          <div style="font-weight:bold;color:#f8fafc;">${coin.symbol}</div>
          <div style="font-size:10px;color:#94a3b8;">${coin.name}</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div class="${pCls}">$${coin.price < 1 ? coin.price.toFixed(6) : (coin.price < 10 ? coin.price.toFixed(3) : coin.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}</div>
        <div style="font-size:10px;" class="${pCls}">${up ? '+' : ''}${coin.change.toFixed(2)}%</div>
      </div>
    </div>`;
  });
}

setInterval(() => {
  cryptoPool.forEach(coin => {
    coin.price = Math.max(0.000001, coin.price + (Math.random() - 0.48) * (coin.price * 0.001));
    coin.change += (Math.random() - 0.47) * 0.15;
  });
  renderTop3();
}, 2000);

renderTop3();