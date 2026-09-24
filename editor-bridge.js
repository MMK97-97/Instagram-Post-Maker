(()=>{
'use strict';
const get=(k,d=null)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch{return d}};
function boot(){const e=window.FWCWLPosterEditor;if(!e){setTimeout(boot,120);return}
 const tid=get('mk97.selectedTemplate'); if(tid&&typeof e.applyTemplate==='function'){try{e.applyTemplate(tid,false)}catch{}}
 const brand=get('mk97.brand'); if(brand){e.state.brandName=brand.name||e.state.brandName;e.state.accent=brand.accent||e.state.accent;e.state.showLogo=brand.showLogo!==false;}
 const style=get('mk97.textStyle'); if(style){const h=e.state.layers?.find(x=>x.type==='text'&&(x.name==='Headline'||x.name==='Custom Headline'));if(h){h.font=style.font||h.font;h.size=style.size||h.size;h.letterSpacing=Number(style.spacing??h.letterSpacing);h.lineHeight=Number(style.lineHeight??h.lineHeight);h.weight=Number(style.weight??h.weight);h.align=style.align||h.align;h.shadowEnabled=!!style.shadow;if(style.glow){h.shadowEnabled=true;h.shadowColor=e.state.accent;h.shadowBlur=34;}}}
 const pending=get('mk97.pendingImage'); if(pending&&!sessionStorage.getItem('mk97.pendingImageApplied')){const img=new Image();img.onload=()=>{const id='asset-'+Date.now().toString(36);e.assets.set(id,{id,name:'Imported image',url:pending,image:img});e.addImageLayer?.(id);sessionStorage.setItem('mk97.pendingImageApplied','1')};img.src=pending}
 e.syncAllUI?.();e.safeRender?.();e.renderInspector?.();e.safeRenderTemplates?.();}
boot();
})();
