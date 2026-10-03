// موتور دفتر: وضعیت هر بدهی با روش FIFO، سررسید واقعی، سن بدهی و قدیمی‌ترین بدهی باز.
// پرداخت‌ها (و تعدیل‌های منفی) ابتدا روی قدیمی‌ترین بدهی باز اعمال می‌شوند؛ dueDate هیچ بدهی با پرداخت جزئی تغییر نمی‌کند.
const Ledger={_c:new Map(),_v:-1,
 day(ts){const d=new Date(ts);d.setHours(0,0,0,0);return d.getTime()},
 analyze(cid,now){
  const cached=now===undefined;if(cached){if(this._v!==Store.ver){this._c.clear();this._v=Store.ver}const h=this._c.get(cid);if(h&&h.k===this.day(Date.now()))return h.r}
  const n=cached?Date.now():now,today=this.day(n),c=Store.d.customers.find(x=>x.id===cid)||{},txs=Store.live().filter(t=>t.customerId===cid&&this.day(t.date)<=today);   // فقط تراکنش‌های تا امروز
  const debts=txs.filter(t=>t.type==='credit'||(t.type==='adjustment'&&t.amount>0)).sort((a,b)=>a.date-b.date||a.createdAt-b.createdAt)
   .map(t=>({id:t.id,tx:t,amount:t.amount,date:t.date,dueDate:t.dueDate||null,paid:0,remaining:t.amount,state:'paid',overdueDays:0,daysLeft:0}));
  const pays=txs.filter(t=>t.type==='payment'||(t.type==='adjustment'&&t.amount<0));
  let pool=pays.reduce((a,t)=>a+Math.abs(t.amount),0);
  for(const d of debts){const u=Math.min(d.remaining,pool);d.paid=u;d.remaining-=u;pool-=u}   // FIFO
  for(const d of debts){if(d.remaining<=0){d.state='paid';continue}
   if(!d.dueDate){d.state='nodue';continue}
   const dd=this.day(d.dueDate);
   if(dd<today){d.state='overdue';d.overdueDays=Math.round((today-dd)/DAY)}else if(dd===today)d.state='today';else{d.state='notdue';d.daysLeft=Math.round((dd-today)/DAY)}}
  const open=debts.filter(d=>d.remaining>0),overdue=open.filter(d=>d.state==='overdue'),oldest=open[0]||null,
   lp=Math.max(0,...pays.map(t=>t.date),c.lastPay||0)||null,notdue=open.filter(d=>d.state==='notdue').sort((a,b)=>a.dueDate-b.dueDate);
  const r={debts,open,oldestUnpaidDebt:oldest,remaining:open.reduce((a,d)=>a+d.remaining,0),prepaid:pool,balance:open.reduce((a,d)=>a+d.remaining,0)-pool,
   lastPaymentDate:lp,daysSinceLastPayment:lp?Math.round((today-this.day(lp))/DAY):null,
   daysSinceOldestDebt:oldest?Math.round((today-this.day(oldest.date))/DAY):null,
   overdue,overdueDays:overdue.reduce((m,d)=>Math.max(m,d.overdueDays),0),todayDue:open.some(d=>d.state==='today'),nextDue:notdue[0]||null,
   status:overdue.length?'overdue':open.some(d=>d.state==='today')?'today':open.length?'notdue':'clear'};
  if(cached)this._c.set(cid,{k:today,r});return r}};
