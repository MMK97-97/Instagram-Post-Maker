(()=>{
'use strict';
const get=(k,d=null)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch{return d}};
const set=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
async function waitPoster(){for(let i=0;i<100;i++){if(window.FWCWLPosterEditor)return window.FWCWLPosterEditor;await new Promise(r=>setTimeout(r,60))}return null}
async function dataUrlFile(dataUrl,name='mk97-upload.png'){const res=await fetch(dataUrl);const blob=await res.blob();return new File([blob],name,{type:blob.type||'image/png'})}
window.addEventListener('load',async()=>{const editor=await waitPoster();if(!editor)return;
 const selected=get('mk97.selectedTemplate');if(selected&&typeof editor.applyTemplate==='function'){try{editor.applyTemplate(selected,false)}catch{}}
 const brand=get('mk97.brand');if(brand){editor.state.brandName=brand.name||editor.state.brandName;editor.state.accent=brand.accent||editor.state.accent;editor.state.showLogo=brand.showLogo!==false}
 const style=get('mk97.textStyle');if(style){const headline=editor.state.layers?.find(x=>x.type==='text'&&(x.name==='Headline'||/headline/i.test(x.name||'')));if(headline){Object.assign(headline,{font:style.font||headline.font,size:Number(style.size||headline.size),letterSpacing:Number(style.spacing||headline.letterSpacing),lineHeight:Number(style.lineHeight||headline.lineHeight),weight:Number(style.weight||headline.weight),align:style.align||headline.align,shadowEnabled:!!style.shadow})}}
 const pending=get('mk97.pendingImage');if(pending&&typeof editor.importImages==='function'){try{const file=await dataUrlFile(pending);const ids=await editor.importImages([file]);if(ids?.length&&typeof editor.addImageLayer==='function')editor.addImageLayer(ids[ids.length-1]);localStorage.removeItem('mk97.pendingImage')}catch(e){console.warn('[MK97 bridge image]',e)}}
 editor.syncAllUI?.();editor.safeRender?.();editor.renderInspector?.();editor.safeRenderTemplates?.();
 ['exportTopBtn','downloadPosterBtn'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>{const a=get('mk97.analytics',{templatesUsed:0,exports:0,projects:0,aiActions:0,videoEdits:0});a.exports=(a.exports||0)+1;set('mk97.analytics',a)}));
});
})();