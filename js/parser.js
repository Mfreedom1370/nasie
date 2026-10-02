// تحلیل دستور فارسی: مبلغ + نام مشتری + نوع (بدهی/پرداخت)
const NW={صفر:0,یک:1,یه:1,دو:2,سه:3,چهار:4,پنج:5,شش:6,هفت:7,هشت:8,نه:9,ده:10,یازده:11,دوازده:12,سیزده:13,چهارده:14,پونزده:15,پانزده:15,شانزده:16,هفده:17,هجده:18,نوزده:19,بیست:20,سی:30,چهل:40,پنجاه:50,شصت:60,هفتاد:70,هشتاد:80,نود:90,صد:100,یکصد:100,دویست:200,سیصد:300,چهارصد:400,پانصد:500,ششصد:600,هفتصد:700,هشتصد:800,نهصد:900};
const MUL={هزار:1e3,میلیون:1e6,میلیارد:1e9};
const PAY=/(پرداخت|داد|تسویه|واریز|نقد|کسر|کم کن)/;
const NOISE2=new Set(['و','بزن','بزنش','به','حساب','رو','روی','را','از','اضافه','کن','ثبت','نسیه','بدهی','تومان','تومن','تومنی','ریال','مبلغ','این','برای','بنویس','کرد','بذار','آقای','خانم','آقا','اقا']);
const norm=s=>s.replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/\u200c/g,' ').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[,٬،.؟!?]/g,' ').replace(/\s+/g,' ').trim();
function lev(a,b){const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length]}
const sim=(a,b)=>1-lev(a,b)/Math.max(a.length,b.length,1);
function parseAmt(tk){let tot=0,cur=0,mul=0,any=false;const used=new Set();
 tk.forEach((t,i)=>{
  if(/^\d+(\.\d+)?$/.test(t)){cur+=+t;used.add(i);any=true}
  else if(t in NW){cur+=NW[t];used.add(i);any=true}
  else if(t in MUL){tot+=(cur||1)*MUL[t];cur=0;mul=MUL[t];used.add(i);any=true}
  else if(t==='نیم'&&mul){tot+=mul/2;used.add(i)}});
 return{amt:tot+cur,used,any}}
function parseCmd(raw){const t=norm(raw),tk=t.split(' ').filter(Boolean);
 const{amt,used}=parseAmt(tk),pay=PAY.test(t);
 const name=tk.filter((x,i)=>!used.has(i)&&!NOISE2.has(x)&&!PAY.test(x)).join(' ');
 let best=null,bs=0;
 for(const c of Store.d.customers){let s=sim(name,c.name);if(c.name.includes(name)||name.includes(c.name))s=Math.max(s,.8);if(s>bs){bs=s;best=c}}
 return{amt,pay,name,cust:bs>=.75?best:null}}
