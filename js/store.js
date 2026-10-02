// ذخیره‌سازی محلی (localStorage). amt مثبت = بدهی، منفی = پرداخت
const Store={d:{customers:[],tx:[],set:{token:'',chat:'',limit:5000000,days:30},alerts:{}},
 load(){try{Object.assign(this.d,JSON.parse(localStorage.getItem('nasie')||'{}'))}catch(e){}},
 save(){localStorage.setItem('nasie',JSON.stringify(this.d))},
 uid:()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5),
 bal(id){return this.d.tx.filter(t=>t.cid===id).reduce((a,t)=>a+t.amt,0)},
 total(){return this.d.customers.reduce((a,c)=>a+Math.max(0,this.bal(c.id)),0)},
 addC(name){const c={id:this.uid(),name};this.d.customers.push(c);return c},
 addTx(cid,amt,note){const t={id:this.uid(),cid,amt,note:note||'',ts:Date.now()};this.d.tx.push(t);this.save();return t},
 exportJson(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(this.d)],{type:'application/json'}));a.download='nasie-backup.json';a.click()},
 importJson(txt){this.d=Object.assign(this.d,JSON.parse(txt));this.save()}};
