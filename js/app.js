Store.load();
const $=s=>document.querySelector(s),esc=s=>{const d=document.createElement('div');d.textContent=s;return d.innerHTML};
const fmt=n=>Math.abs(Math.round(n)).toLocaleString('fa-IR'),dt=ts=>new Date(ts).toLocaleDateString('fa-IR');
const lim=c=>c.limit||Store.d.set.limit,dys=c=>c.days||Store.d.set.days;
let tab='dash',pending=null;
function age(c){const t=Store.d.tx.filter(x=>x.cid===c.id);if(!t.length)return 0;const p=t.filter(x=>x.amt<0).map(x=>x.ts);return Math.floor((Date.now()-(p.length?Math.max(...p):Math.min(...t.map(x=>x.ts))))/864e5)}
const st=(c,b)=>b<=0?'ok':b>lim(c)?'bad':age(c)>dys(c)?'warn':'';
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;setTimeout(()=>t.hidden=true,2500)}
function sheet(h){$('#sheet').innerHTML=`<div class="box">${h}</div>`;$('#sheet').hidden=false}
function closeSheet(){$('#sheet').hidden=true;render()}
function render(){$('#total').innerHTML=`جمع بدهی‌ها<b>${fmt(Store.total())}</b> تومان`;
 document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===tab));
 $('#view').innerHTML=tab==='dash'?vDash():tab==='list'?vList():vSet()}
const find=id=>Store.d.customers.find(x=>x.id===id),sumTx=(id,f)=>Store.d.tx.filter(t=>t.cid===id&&f(t)).reduce((a,t)=>a+Math.abs(t.amt),0);
let qv='';
function vList(){return`<input class="sr" placeholder="جستجوی مشتری…" value="${esc(qv)}" oninput="qv=this.value;$('#lst').innerHTML=rows()"><div id="lst">${rows()}</div><div class="row"><button class="pri" onclick="editForm(null)">+ مشتری جدید</button></div>`}
function rows(){const cs=Store.d.customers.filter(c=>norm(c.name).includes(norm(qv))).map(c=>({c,b:Store.bal(c.id)})).sort((a,b)=>b.b-a.b);
 if(!cs.length)return'<p class="empty">مشتری‌ای پیدا نشد.<br>دستور بده یا «مشتری جدید» را بزن.</p>';
 return cs.map(({c,b})=>{const l=Store.d.tx.filter(t=>t.cid===c.id).map(t=>t.ts);
  return`<div class="card" onclick="profile('${c.id}')"><div><b>${esc(c.name)}</b><small>آخرین ثبت: ${l.length?dt(Math.max(...l)):'—'}${c.phone?' · '+esc(c.phone):''}</small></div><div class="amt ${st(c,b)}">${fmt(b)}<small>تومان${b<0?' (بستانکار)':''}</small></div></div>`}).join('')}
function profile(id){const c=find(id),b=Store.bal(id);
 sheet(`<div class="ph"><div class="av">${esc(c.name[0]||'؟')}</div><div><h2>${esc(c.name)}</h2><small>${c.phone?`<a href="tel:${esc(c.phone)}">${esc(c.phone)}</a>`:'بدون شماره'}</small></div></div>
 <div class="amt big ${st(c,b)}">${fmt(b)} <small>تومان</small></div>
 <div class="kpis"><div><small>کل نسیه</small><b>${fmt(sumTx(id,t=>t.amt>0))}</b></div><div><small>کل پرداخت</small><b>${fmt(sumTx(id,t=>t.amt<0))}</b></div><div><small>روز از آخرین پرداخت</small><b>${fmt(age(c))}</b></div></div>
 <small>حد بدهی: ${fmt(lim(c))} · مهلت: ${fmt(dys(c))} روز</small>${c.note?`<p class="note">${esc(c.note)}</p>`:''}
 <label>ثبت دستی</label><div class="row"><input id="ma" type="number" inputmode="numeric" placeholder="مبلغ (تومان)"><input id="mn" placeholder="توضیح"></div>
 <div class="row"><button class="pri" onclick="manual('${id}',1)">+ بدهی</button><button onclick="manual('${id}',-1)">− پرداخت</button></div>
 <label>تاریخچه</label>${Store.d.tx.filter(t=>t.cid===id).sort((a,b)=>b.ts-a.ts).map(t=>`<div class="tx"><span>${dt(t.ts)} ${esc(t.note)}</span><b class="${t.amt<0?'ok':''}">${t.amt<0?'−':'+'}${fmt(t.amt)}</b><button onclick="delTx('${t.id}','${id}')">✕</button></div>`).join('')||'<small>هنوز ثبتی نیست</small>'}
 <div class="row"><button onclick="editForm('${id}')">ویرایش پروفایل</button><button onclick="closeSheet()">بستن</button></div>`)}
function manual(id,sg){const a=+$('#ma').value;if(!a)return toast('مبلغ را وارد کن');Store.addTx(id,sg*a,$('#mn').value);
 const c=find(id),b=Store.bal(id);if(sg>0&&b>lim(c))tg(`⚠️ بدهی ${c.name} به ${fmt(b)} تومان رسید (حد: ${fmt(lim(c))})`);profile(id)}
function editForm(id){const c=id?find(id):{};
 sheet(`<h2>${id?'ویرایش پروفایل':'مشتری جدید'}</h2><label>نام</label><input id="en" value="${esc(c.name||'')}"><label>شماره تماس</label><input id="ep" type="tel" value="${esc(c.phone||'')}">
 <label>یادداشت</label><textarea id="eo" rows="2">${esc(c.note||'')}</textarea><label>حد بدهی (تومان) — خالی = پیش‌فرض</label><input id="el" type="number" value="${c.limit||''}">
 <label>مهلت پرداخت (روز) — خالی = پیش‌فرض</label><input id="ed" type="number" value="${c.days||''}">
 <div class="row"><button class="pri" onclick="saveC(${id?`'${id}'`:'null'})">ذخیره</button><button onclick="${id?`profile('${id}')`:'closeSheet()'}">انصراف</button></div>
 ${id?`<div class="row"><button class="dng" onclick="delC('${id}')">حذف مشتری و تمام ثبت‌هایش</button></div>`:''}`)}
function saveC(id){const n=$('#en').value.trim();if(!n)return toast('نام را وارد کن');const c=id?find(id):Store.addC(n);
 Object.assign(c,{name:n,phone:$('#ep').value.trim(),note:$('#eo').value.trim(),limit:+$('#el').value||0,days:+$('#ed').value||0});Store.save();profile(c.id)}
function delC(id){if(!confirm('مشتری و تمام ثبت‌هایش حذف شود؟ این کار برگشت ندارد.'))return;
 Store.d.customers=Store.d.customers.filter(c=>c.id!==id);Store.d.tx=Store.d.tx.filter(t=>t.cid!==id);Store.save();closeSheet()}
function delTx(tid,id){if(!confirm('این ثبت حذف شود؟'))return;Store.d.tx=Store.d.tx.filter(t=>t.id!==tid);Store.save();profile(id)}
function months(){const out=[],n=new Date();
 for(let i=5;i>=0;i--){const s=new Date(n.getFullYear(),n.getMonth()-i,1).getTime(),e=new Date(n.getFullYear(),n.getMonth()-i+1,1).getTime(),t=Store.d.tx.filter(x=>x.ts>=s&&x.ts<e);
  out.push({l:new Date(s).toLocaleDateString('fa-IR',{month:'short'}),d:t.filter(x=>x.amt>0).reduce((a,x)=>a+x.amt,0),p:-t.filter(x=>x.amt<0).reduce((a,x)=>a+x.amt,0),net:Store.d.tx.filter(x=>x.ts<e).reduce((a,x)=>a+x.amt,0)})}return out}
function vDash(){const cs=Store.d.customers.map(c=>({c,b:Store.bal(c.id)})),db=cs.filter(x=>x.b>0),over=db.filter(x=>x.b>lim(x.c)),late=db.filter(x=>age(x.c)>dys(x.c)).sort((a,b)=>age(b.c)-age(a.c)),ms=months(),cur=ms[5];
 const top=[...db].sort((a,b)=>b.b-a.b).slice(0,5),mx=top[0]?.b||1,row=x=>`<div class="lr" onclick="profile('${x.c.id}')"><span>${esc(x.c.name)}</span><b>${fmt(x.b)}</b></div>`;
 const m=Math.max(...ms.flatMap(x=>[x.d,x.p]),1),bars=ms.map((x,i)=>`<rect x="${i*48+8}" y="${95-x.d/m*80}" width="16" height="${x.d/m*80}" rx="3" fill="var(--bad)"/><rect x="${i*48+25}" y="${95-x.p/m*80}" width="16" height="${x.p/m*80}" rx="3" fill="var(--ok)"/><text x="${i*48+25}" y="110" text-anchor="middle" font-size="10" fill="var(--mut)">${x.l}</text>`).join('');
 return`<div class="kpis"><div class="k-bad"><small>جمع بدهی‌ها</small><b>${fmt(Store.total())}</b></div><div><small>تعداد بدهکاران</small><b>${fmt(db.length)}</b></div><div class="k-warn"><small>عقب‌افتاده</small><b>${fmt(late.length)}</b></div><div class="k-bad"><small>بالای حد مجاز</small><b>${fmt(over.length)}</b></div><div><small>نسیه‌ی این ماه</small><b>${fmt(cur.d)}</b></div><div class="k-ok"><small>دریافتی این ماه</small><b>${fmt(cur.p)}</b></div></div>
 <div class="box2"><h3>نسیه و دریافتی ماهانه</h3><svg viewBox="0 0 290 118">${bars}</svg><div class="lg"><span><i style="background:var(--bad)"></i>نسیه</span><span><i style="background:var(--ok)"></i>دریافتی</span></div></div>
 <div class="box2"><h3>بیشترین بدهکاران</h3>${top.map(x=>`<div class="bar" onclick="profile('${x.c.id}')"><span>${esc(x.c.name)}</span><i style="width:${x.b/mx*100}%"></i><b>${fmt(x.b)}</b></div>`).join('')||'<p class="empty">داده‌ای نیست</p>'}</div>
 <div class="box2"><h3>عقب‌افتاده‌ها (بیشترین تاخیر)</h3>${late.slice(0,5).map(x=>`<div class="lr" onclick="profile('${x.c.id}')"><span>${esc(x.c.name)} <small>${fmt(age(x.c))} روز</small></span><b class="warn">${fmt(x.b)}</b></div>`).join('')||'<small>موردی نیست 👌</small>'}</div>
 <div class="box2"><h3>روند مانده‌ی کل</h3>${trend(ms)}</div>`}
function trend(ms){const mx=Math.max(...ms.map(p=>p.net),1),xy=ms.map((p,i)=>[25+i*48,90-Math.max(p.net,0)/mx*70]);
 return`<svg viewBox="0 0 290 118"><polyline fill="none" stroke="var(--ac)" stroke-width="3" points="${xy.map(a=>a.join(',')).join(' ')}"/>${xy.map((a,i)=>`<circle cx="${a[0]}" cy="${a[1]}" r="4" fill="var(--ac)"/><text x="${a[0]}" y="110" text-anchor="middle" font-size="10" fill="var(--mut)">${ms[i].l}</text>`).join('')}</svg>`}
function vSet(){const s=Store.d.set;
 return`<label>توکن ربات تلگرام</label><input value="${esc(s.token)}" onchange="setv('token',this.value)" dir="ltr">
 <label>Chat ID</label><input value="${esc(s.chat)}" onchange="setv('chat',this.value)" dir="ltr">
 <label>حد بدهی پیش‌فرض (تومان)</label><input type="number" value="${s.limit}" onchange="setv('limit',+this.value)">
 <label>مهلت پیش‌فرض پرداخت (روز)</label><input type="number" value="${s.days}" onchange="setv('days',+this.value)">
 <div class="row"><button onclick="tg('✅ پیام آزمایشی دفتر نسیه').then(o=>toast(o?'ارسال شد':'ارسال نشد؛ توکن/Chat ID را بررسی کن'))">تست تلگرام</button></div>
 <div class="row"><button onclick="Store.exportJson()">خروجی پشتیبان</button><button onclick="$('#imp').click()">بازیابی</button></div>
 <input type="file" id="imp" accept=".json" hidden onchange="this.files[0].text().then(t=>{Store.importJson(t);render();toast('بازیابی شد')})">`}
function setv(k,v){Store.d.set[k]=v;Store.save()}
function run(text){if(!text.trim())return;const r=parseCmd(text);
 if(!r.amt)return toast('مبلغ تشخیص داده نشد');if(!r.name)return toast('نام مشتری تشخیص داده نشد');
 pending=r;sheet(`<h2>تایید ثبت</h2><small>«${esc(text)}»</small><p>${r.pay?'پرداخت':'بدهی'} <b>${fmt(r.amt)}</b> تومان ${r.pay?'از':'به حساب'} <b>${esc(r.cust?r.cust.name:r.name)}</b> ${r.cust?'':'<span class="tag">مشتری جدید</span>'}</p>
 <div class="row"><button class="pri" onclick="okCmd()">تایید</button><button onclick="closeSheet()">لغو</button></div>`)}
function okCmd(){const r=pending,c=r.cust||Store.addC(r.name);Store.addTx(c.id,r.pay?-r.amt:r.amt);$('#cmd').value='';closeSheet();
 const b=Store.bal(c.id);if(!r.pay&&b>lim(c))tg(`⚠️ بدهی ${c.name} به ${fmt(b)} تومان رسید (حد: ${fmt(lim(c))})`)}
function sweep(){const today=new Date().toDateString();
 for(const c of Store.d.customers){const b=Store.bal(c.id);if(b>0&&age(c)>dys(c)&&Store.d.alerts[c.id]!==today){Store.d.alerts[c.id]=today;tg(`⏰ ${c.name}: ${age(c)} روز از آخرین پرداخت گذشته، مانده ${fmt(b)} تومان`)}}Store.save()}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{tab=b.dataset.t;render()});
$('#go').onclick=()=>run($('#cmd').value);$('#cmd').onkeydown=e=>{if(e.key==='Enter')run(e.target.value)};
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
if(!SR)$('#mic').hidden=true;else{const rec=new SR();rec.lang='fa-IR';
 rec.onresult=e=>{const s=e.results[0][0].transcript;$('#cmd').value=s;run(s)};
 rec.onerror=e=>toast(e.error==='not-allowed'?'مجوز میکروفون نیست؛ از میکروفون کیبورد استفاده کن':'خطا: '+e.error);
 $('#mic').onclick=()=>{try{rec.start();toast('بگو…')}catch(e){}}}
render();sweep();
