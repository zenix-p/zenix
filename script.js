const translations={
fa:{home:"صفحه اصلی",quantification:"کوانتیفیکیشن",deposit:"واریز",receive:"برداشت",transactions:"تراکنش",profile:"پروفایل",support:"پشتیبانی",logout:"خروج",tradingLevels:"سطوح معاملاتی",subWel:"سطح خود را بررسی و ربات را فعال کنید",active:"فعال",adminMsg:"پیام مدیریت",welcomeText:"به پلتفرم زنیکس خوش آمدید.",bal:"موجودی",prof:"سود",yesterdayProfit:"سود دیروز",todayProfit:"سود امروز",stepText:"مرحله",of:"از",completed:"کوانتیفیکیشن امروز کامل شد",liveTrade:"وضعیت معامله جاری",tradingPair:"در حال معامله روی ارز",tradeHistory:"تاریخچه معاملات",noHistory:"هنوز معامله‌ای ثبت نشده است",nyTime:"ساعت نیویورک"},
en:{home:"Home",quantification:"Quantification",deposit:"Deposit",receive:"Withdraw",transactions:"Transactions",profile:"Profile",support:"Support",logout:"Logout",tradingLevels:"Trading Levels",subWel:"Check your level and activate the bot",active:"Active",adminMsg:"Admin Message",welcomeText:"Welcome to Zenix platform.",bal:"Balance",prof:"Profit",yesterdayProfit:"Yesterday's Profit",todayProfit:"Today's Profit",stepText:"Step",of:"of",completed:"Quantification completed today",liveTrade:"Live Trade Status",tradingPair:"Trading on pair",tradeHistory:"Trade History",noHistory:"No trades recorded yet",nyTime:"New York Time"},
ar:{home:"الصفحة الرئيسية",quantification:"التقدير الكمي",deposit:"إيداع",receive:"سحب",transactions:"المعاملات",profile:"الملف الشخصي",support:"الدعم",logout:"تسجيل الخروج",tradingLevels:"مستويات التداول",subWel:"تحقق من مستواك وقم بتفعيل الروبوت",active:"نشط",adminMsg:"رسالة الإدارة",welcomeText:"أهلاً بك في منصة زينيكس.",bal:"الرصيد",prof:"الربح",yesterdayProfit:"ربح الأمس",todayProfit:"ربح اليوم",stepText:"المرحلة",of:"من",completed:"اكتمل التقدير الكمي اليوم",liveTrade:"حالة التداول المباشر",tradingPair:"التداول على زوج",tradeHistory:"سجل التداول",noHistory:"لم يتم تسجيل معاملات بعد",nyTime:"وقت نيويورك"},
tr:{home:"Ana Sayfa",quantification:"Kuantizasyon",deposit:"Para Yatırma",receive:"Para Çekme",transactions:"İşlemler",profile:"Profil",support:"Destek",logout:"Çıkış Yap",tradingLevels:"İşlem Seviyeleri",subWel:"Seviyenizi kontrol edin ve botu etkinleştirin",active:"Aktif",adminMsg:"Yönetim Mesajı",welcomeText:"Zenix platformuna hoş geldiniz.",bal:"Bakiye",prof:"Kâr",yesterdayProfit:"Dünkü Kâr",todayProfit:"Bugünkü Kâr",stepText:"Adım",of:"/",completed:"Bugünkü kuantizasyon tamamlandı",liveTrade:"Canlı İşlem Durumu",tradingPair:"İşlem yapılan parite",tradeHistory:"İşlem Geçmişi",noHistory:"Henüz işlem kaydedilmedi",nyTime:"New York Saati"}
};
const rtlLangs=['fa','ar'];
function applyLanguage(lang){
const isRtl=rtlLangs.includes(lang);
document.documentElement.setAttribute('dir',isRtl?'rtl':'ltr');
document.documentElement.setAttribute('lang',lang);
const t=translations[lang]||translations['fa'];
document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.getAttribute('data-i18n');if(t[k])el.textContent=t[k];});
renderHistory();
}
document.addEventListener('DOMContentLoaded',()=>{applyLanguage(localStorage.getItem('zenix_lang')||'fa');});

function updateNYClock(){
const clockEl=document.getElementById('ny-clock-val');
if(!clockEl)return;
const options={timeZone:'America/New_York',hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'};
clockEl.textContent=new Intl.DateTimeFormat([],options).format(new Date());
}
setInterval(updateNYClock,1000);
updateNYClock();

const mBtn=document.getElementById('menu-btn'),nMenu=document.getElementById('nav-menu');
const lBtn=document.getElementById('lang-btn'),lMenu=document.getElementById('lang-menu');
const bBtn=document.getElementById('bell-btn'),bMenu=document.getElementById('bell-menu');
if(mBtn&&nMenu)mBtn.onclick=(e)=>{e.stopPropagation();nMenu.classList.toggle('show');if(lMenu)lMenu.classList.remove('show');if(bMenu)bMenu.classList.remove('show');};
if(lBtn&&lMenu)lBtn.onclick=(e)=>{e.stopPropagation();lMenu.classList.toggle('show');if(nMenu)nMenu.classList.remove('show');if(bMenu)bMenu.classList.remove('show');};
if(bBtn&&bMenu)bBtn.onclick=(e)=>{e.stopPropagation();bMenu.classList.toggle('show');if(nMenu)nMenu.classList.remove('show');if(lMenu)lMenu.classList.remove('show');};
document.onclick=()=>{if(nMenu)nMenu.classList.remove('show');if(lMenu)lMenu.classList.remove('show');if(bMenu)bMenu.classList.remove('show');};
document.querySelectorAll('[data-lang]').forEach(item=>{
item.onclick=(e)=>{e.stopPropagation();const sl=item.getAttribute('data-lang');localStorage.setItem('zenix_lang',sl);applyLanguage(sl);if(lMenu)lMenu.classList.remove('show');window.location.reload();};
});

const qBtn=document.getElementById('quant-btn');
const tradeBox=document.getElementById('trade-box');
const tradeDetails=document.getElementById('trade-details');
const historyList=document.getElementById('history-list');

function getTokenIcon(pair){
const s='width="18" height="18" style="vertical-align:middle;margin-right:5px;"';
if(pair.includes("BTC"))return`<img src="https://assets.coincap.io/assets/icons/btc@2x.png" ${s}>`;
if(pair.includes("ETH"))return`<img src="https://assets.coincap.io/assets/icons/eth@2x.png" ${s}>`;
if(pair.includes("SOL"))return`<img src="https://assets.coincap.io/assets/icons/sol@2x.png" ${s}>`;
if(pair.includes("BNB"))return`<img src="https://assets.coincap.io/assets/icons/bnb@2x.png" ${s}>`;
if(pair.includes("ADA"))return`<img src="https://assets.coincap.io/assets/icons/ada@2x.png" ${s}>`;
if(pair.includes("XRP"))return`<img src="https://assets.coincap.io/assets/icons/xrp@2x.png" ${s}>`;
return`<img src="https://assets.coincap.io/assets/icons/usdt@2x.png" ${s}>`;
}

function renderHistory(){
const history=JSON.parse(localStorage.getItem('zenix_trade_history')||'[]');
const lang=localStorage.getItem('zenix_lang')||'fa';
const t=translations[lang];
if(!historyList)return;
if(history.length===0){
historyList.innerHTML=`<div style="font-size:12px;color:#94a3b8;text-align:center;" data-i18n="noHistory">${t.noHistory}</div>`;
return;
}
historyList.innerHTML=history.map(item=>`
<div style="display:flex;justify-content:space-between;align-items:center;background:rgba(15,23,42,0.6);padding:8px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.05);font-size:12px;">
<div style="color:#22c55e;font-weight:bold;">+${item.profit} USDT</div>
<div><span style="color:#94a3b8;font-size:11px;margin-left:6px;">(${item.time})</span><span style="color:#f8fafc;font-weight:bold;">${item.pair}</span>${getTokenIcon(item.pair)}</div>
</div>
`).join('');
}

if(qBtn){
const max=4;
const stepPairs=["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "ADA/USDT", "XRP/USDT"];

function checkNYDailyReset(){
const nyDate=new Date().toLocaleDateString('en-US',{timeZone:'America/New_York'});
const savedDate=localStorage.getItem('zenix_ny_date');
if(savedDate!==nyDate){
localStorage.setItem('zenix_ny_date',nyDate);
localStorage.setItem('zenix_q_count','0');
}
}

function getCount(){ 
checkNYDailyReset();
return parseInt(localStorage.getItem('zenix_q_count')||'0'); 
}

function updateButtonState(){
let count=getCount();
const lang=localStorage.getItem('zenix_lang')||'fa';
const t=translations[lang];
if(count>=max){
qBtn.disabled=true;
qBtn.style.opacity='0.6';
qBtn.innerHTML=`<i class="fas fa-check-circle"></i> <span>${t.completed}</span>`;
if(tradeBox)tradeBox.style.display='none';
}else{
qBtn.disabled=false;
qBtn.style.opacity='1';
qBtn.style.cursor='pointer';
qBtn.innerHTML=`<i class="fas fa-robot"></i> <span>${t.stepText} ${count+1} ${t.of} ${max}</span>`;
}
}

updateButtonState();
renderHistory();

qBtn.onclick=()=>{
let count=getCount();
if(count>=max)return;

qBtn.disabled=true;
qBtn.style.opacity='0.6';

if(tradeBox)tradeBox.style.display='block';
const currentPair=stepPairs[count%stepPairs.length];
if(tradeDetails){
tradeDetails.innerHTML=`<i class="fas fa-sync fa-spin"></i> ${translations[localStorage.getItem('zenix_lang')||'fa'].tradingPair || 'در حال معامله روی ارز'}: <span style="color:#38bdf8;">${currentPair}</span>${getTokenIcon(currentPair)}`;
}

let timeLeft=10;
const timerInterval=setInterval(()=>{
timeLeft--;
if(timeLeft>0){
qBtn.innerHTML=`<i class="fas fa-clock"></i> <span>مرحله ${count+1} (${timeLeft}s)...</span>`;
}else{
clearInterval(timerInterval);

checkNYDailyReset();
count=parseInt(localStorage.getItem('zenix_q_count')||'0')+1;
localStorage.setItem('zenix_q_count', count);

const simulatedProfit=(Math.random()*2 + 0.5).toFixed(2);
let history=JSON.parse(localStorage.getItem('zenix_trade_history')||'[]');
const nowTime=new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit', hour12: false});
history.unshift({pair: currentPair, profit: simulatedProfit, time: nowTime});
if(history.length>10)history.pop();
localStorage.setItem('zenix_trade_history', JSON.stringify(history));

renderHistory();
if(tradeBox)tradeBox.style.display='none';
updateButtonState();
}
},1000);
};
}
