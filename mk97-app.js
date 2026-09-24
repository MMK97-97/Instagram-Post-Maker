(() => {
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const drawer=$('#drawer');
  const open=()=>drawer?.classList.add('open');
  const close=()=>drawer?.classList.remove('open');
  $('#menuBtn')?.addEventListener('click',open);
  $('#drawerBack')?.addEventListener('click',close);
  $('#drawerClose')?.addEventListener('click',close);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  window.addEventListener('pageshow',()=>document.body.classList.remove('leaving'));
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href]');
    if(!a||a.target==='_blank'||a.hasAttribute('download')||a.href.startsWith('mailto:')||a.href.startsWith('tel:'))return;
    const url=new URL(a.href,location.href);
    if(url.origin!==location.origin)return;
    if(url.pathname===location.pathname&&url.search===location.search)return;
    document.body.classList.add('leaving');
  });
  const installBtn=$('#installBtn');
  let deferred;
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;installBtn?.removeAttribute('hidden')});
  installBtn?.addEventListener('click',async()=>{if(!deferred)return;deferred.prompt();await deferred.userChoice;deferred=null;installBtn.setAttribute('hidden','')});
  if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
