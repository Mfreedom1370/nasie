// ذخیره‌سازی محلی. amt مثبت = نسیه، منفی = پرداخت. حذف‌ها اول به سطل زباله می‌روند.
const DEF={token:'',chat:'',limit:5000000,days:30,bkHour:22,lastBk:'',aiUrl:'https://api.openai.com/v1',aiKey:'',aiModel:'gpt-4o-mini'};
const Store={d:{customers:[],tx:[],trash:[],log:[],set:{...DEF},alerts:{}},
 load(){try{const x=JSON.parse(localStorage.getItem('nasie')||'{}');Object.assign(this.d,x);this.d.set={...DEF,...x.set}}catch(e){}},
 save(){localStorage.setItem('nasie',JSON.stringify(this.d))},
 uid:()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5),
 nm(id){return(this.d.customers.find(c=>c.id===id)||{}).name||'؟'},
 bal(id){return this.d.tx.filter(t=>t.cid===id).reduce((a,t)=>a+t.amt,0)},
 total(){return this.d.customers.reduce((a,c)=>a+Math.max(0,this.bal(c.id)),0)},
 log(t,n,a){this.d.log.push({ts:Date.now(),t,n,a});if(this.d.log.length>8000)this.d.log.splice(0,800)},
 addC(name,extra){const c={id:this.uid(),name,...extra};this.d.customers.push(c);this.log('c+',name);this.save();return c},
 addTx(cid,amt,note){const t={id:this.uid(),cid,amt,note:note||'',ts:Date.now()};this.d.tx.push(t);this.log('tx',this.nm(cid),amt);this.save();return t},
 delTx(id){const t=this.d.tx.find(x=>x.id===id);if(!t)return;this.d.tx=this.d.tx.filter(x=>x.id!==id);
  this.d.trash.push({id:this.uid(),k:'tx',data:t,ts:Date.now(),label:this.nm(t.cid)+' · '+t.amt});this.log('tx-',this.nm(t.cid),t.amt);this.save()},
 delC(id){const c=this.d.customers.find(x=>x.id===id);if(!c)return;const txs=this.d.tx.filter(t=>t.cid===id);
  this.d.customers=this.d.customers.filter(x=>x.id!==id);this.d.tx=this.d.tx.filter(t=>t.cid!==id);
  this.d.trash.push({id:this.uid(),k:'c',data:{c,txs},ts:Date.now(),label:c.name});this.log('c-',c.name);this.save()},
 restore(tid){const i=this.d.trash.find(x=>x.id===tid);if(!i)return false;
  if(i.k==='c'){this.d.customers.push(i.data.c);this.d.tx.push(...i.data.txs);this.log('rs',i.data.c.name)}
  else{if(!this.d.customers.some(c=>c.id===i.data.cid))return false;this.d.tx.push(i.data);this.log('rs',this.nm(i.data.cid))}
  this.d.trash=this.d.trash.filter(x=>x.id!==tid);this.save();return true},
 purge(tid){this.d.trash=this.d.trash.filter(x=>x.id!==tid);this.save()},
 exportJson(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(this.d)],{type:'application/json'}));a.download='nasie-backup.json';a.click()},
 importJson(txt){Object.assign(this.d,JSON.parse(txt));this.save()}};
