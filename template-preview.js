(() => {
  'use strict';

  const logo = new Image();
  let logoReady = false;
  logo.onload = () => { logoReady = true; document.dispatchEvent(new CustomEvent('mk97-template-logo-ready')); };
  logo.src = 'assets/fwcwl-logo.jpeg';

  const rgba = (hex, a) => {
    let v = String(hex || '#fff').replace('#','');
    if (v.length === 3) v = v.split('').map(c=>c+c).join('');
    const n = parseInt(v,16);
    if (Number.isNaN(n)) return `rgba(255,255,255,${a})`;
    return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;
  };

  function roundRect(ctx,x,y,w,h,r){
    r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
  }

  function grain(ctx,w,h,strength=.08){
    ctx.save();ctx.globalAlpha=strength;
    for(let i=0;i<380;i++){
      const x=Math.abs(Math.sin(i*91.17))*w;
      const y=Math.abs(Math.sin(i*43.73))*h;
      const s=1+Math.abs(Math.sin(i*7.2))*2;
      ctx.fillStyle=i%3?'#000':'#fff';ctx.fillRect(x,y,s,s);
    }
    ctx.restore();
  }

  function rays(ctx,w,h,accent){
    for(let i=0;i<18;i++){
      ctx.save();ctx.translate(w*.5,h*.42);ctx.rotate((i/18)*Math.PI*2);
      ctx.fillStyle=rgba(accent,i%2?.025:.055);ctx.fillRect(w*.12,-w*.008,w*.38,w*.016);ctx.restore();
    }
  }

  function pitch(ctx,w,h,accent){
    ctx.save();ctx.strokeStyle=rgba(accent,.28);ctx.lineWidth=Math.max(1,w*.006);
    ctx.strokeRect(w*.61,h*.18,w*.27,h*.52);
    ctx.beginPath();ctx.arc(w*.745,h*.44,w*.067,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(w*.68,h*.18);ctx.lineTo(w*.68,h*.70);ctx.moveTo(w*.81,h*.18);ctx.lineTo(w*.81,h*.70);ctx.stroke();ctx.restore();
  }

  function wickets(ctx,w,h,accent){
    ctx.save();ctx.translate(w*.78,h*.42);ctx.strokeStyle=rgba(accent,.42);ctx.lineWidth=Math.max(1,w*.012);
    [-.055,0,.055].forEach(dx=>{ctx.beginPath();ctx.moveTo(w*dx,-h*.09);ctx.lineTo(w*dx,h*.10);ctx.stroke();});
    ctx.beginPath();ctx.moveTo(-w*.07,-h*.09);ctx.lineTo(-w*.005,-h*.09);ctx.moveTo(w*.005,-h*.09);ctx.lineTo(w*.07,-h*.09);ctx.stroke();ctx.restore();
  }

  function playerSilhouette(ctx,w,h,accent){
    ctx.save();ctx.translate(w*.75,h*.43);ctx.fillStyle='rgba(255,255,255,.035)';ctx.strokeStyle=rgba(accent,.22);ctx.lineWidth=Math.max(1,w*.004);
    ctx.beginPath();ctx.arc(0,-h*.10,w*.045,0,Math.PI*2);ctx.fill();ctx.stroke();
    roundRect(ctx,-w*.075,-h*.055,w*.15,h*.20,w*.035);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(-w*.02,h*.14);ctx.lineTo(-w*.065,h*.27);ctx.moveTo(w*.02,h*.14);ctx.lineTo(w*.075,h*.27);ctx.stroke();
    ctx.beginPath();ctx.moveTo(w*.07,-h*.015);ctx.lineTo(w*.17,-h*.12);ctx.stroke();ctx.restore();
  }

  function pavilion(ctx,w,h,accent){
    ctx.save();ctx.strokeStyle=rgba(accent,.23);ctx.fillStyle='rgba(255,255,255,.025)';ctx.lineWidth=Math.max(1,w*.004);
    const x=w*.58,y=h*.28,pw=w*.34,ph=h*.34;
    ctx.beginPath();ctx.moveTo(x,y+h*.06);ctx.lineTo(x+pw*.5,y);ctx.lineTo(x+pw,y+h*.06);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeRect(x+w*.03,y+h*.06,pw-w*.06,ph);
    for(let i=0;i<4;i++){ctx.strokeRect(x+w*(.06+i*.07),y+h*.14,w*.045,h*.08)}
    ctx.restore();
  }

  function scorePanel(ctx,w,h,accent){
    ctx.save();ctx.fillStyle='rgba(0,0,0,.24)';roundRect(ctx,w*.08,h*.24,w*.84,h*.40,w*.03);ctx.fill();ctx.strokeStyle=rgba(accent,.3);ctx.lineWidth=Math.max(1,w*.004);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.06)';for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(w*.08,h*(.24+i*.10));ctx.lineTo(w*.92,h*(.24+i*.10));ctx.stroke();}ctx.restore();
  }

  function paperLines(ctx,w,h,accent){
    ctx.save();ctx.strokeStyle='rgba(55,35,20,.08)';ctx.lineWidth=1;
    for(let y=h*.12;y<h*.92;y+=h*.045){ctx.beginPath();ctx.moveTo(w*.06,y);ctx.lineTo(w*.94,y);ctx.stroke();}
    ctx.fillStyle=rgba(accent,.08);ctx.fillRect(0,h*.82,w,h*.035);ctx.restore();
  }

  function decor(ctx,w,h,t){
    const style=t.style,accent=t.palette[2];
    switch(style){
      case 'stadium': case 'cinematic':
        for(let i=0;i<7;i++){const x=w*(.08+i*.14);const g=ctx.createLinearGradient(x,0,w*.5,h*.76);g.addColorStop(0,'rgba(255,255,255,.12)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-w*.02,0);ctx.lineTo(x+w*.02,0);ctx.lineTo(w*.5,h*.76);ctx.closePath();ctx.fill();}
        ctx.strokeStyle=rgba(accent,.30);ctx.lineWidth=w*.004;ctx.beginPath();ctx.ellipse(w*.5,h*.88,w*.37,h*.065,0,0,Math.PI*2);ctx.stroke();
        break;
      case 'pitch': case 'lineup': case 'boundary': case 'blueprint': case 'chalkboard':
        pitch(ctx,w,h,accent); wickets(ctx,w,h,accent); break;
      case 'score': case 'scorebook':
        scorePanel(ctx,w,h,accent); if(style==='scorebook') paperLines(ctx,w,h,accent); break;
      case 'player': case 'award': case 'press-card': case 'silhouette': case 'cutout':
        playerSilhouette(ctx,w,h,accent); break;
      case 'pavilion': case 'clubhouse':
        pavilion(ctx,w,h,accent); break;
      case 'gold': case 'radial': case 'crest': case 'final': case 'gold-grit':
        rays(ctx,w,h,accent); break;
      case 'fixture': case 'lines':
        ctx.strokeStyle='rgba(255,255,255,.055)';ctx.lineWidth=1;for(let y=h*.15;y<h;y+=h*.055){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}break;
      case 'slash': case 'brutalist': case 'grit': case 'dust':
        for(let i=0;i<4;i++){ctx.save();ctx.translate(w*(.56+i*.11),h*.45);ctx.rotate(-.25);ctx.fillStyle=rgba(accent,.04+i*.015);ctx.fillRect(0,-h*.66,w*.075,h*1.32);ctx.restore();}break;
      case 'versus': case 'split':
        ctx.fillStyle=rgba(accent,.08);ctx.beginPath();ctx.moveTo(w*.62,0);ctx.lineTo(w,0);ctx.lineTo(w,h);ctx.lineTo(w*.40,h);ctx.closePath();ctx.fill();ctx.strokeStyle=rgba(accent,.28);ctx.lineWidth=w*.007;ctx.beginPath();ctx.arc(w*.5,h*.43,w*.18,0,Math.PI*2);ctx.stroke();break;
      case 'grid': case 'cards': case 'stack': case 'collage':
        for(let i=0;i<4;i++){ctx.save();ctx.translate(w*(.64+i*.055),h*(.34+i*.055));ctx.rotate((i-1.5)*.06);ctx.fillStyle=i===1?rgba(accent,.13):'rgba(255,255,255,.03)';roundRect(ctx,-w*.11,-h*.13,w*.22,h*.27,w*.016);ctx.fill();ctx.restore();}break;
      case 'news': case 'newspaper': case 'paper': case 'almanac': case 'retro-bill': case 'retro':
        paperLines(ctx,w,h,accent);ctx.strokeStyle=rgba(accent,.24);ctx.lineWidth=w*.004;ctx.strokeRect(w*.045,h*.04,w*.91,h*.92);break;
      case 'leather': case 'bat-grain': case 'film':
        ctx.fillStyle=rgba(accent,.055);ctx.fillRect(w*.62,0,w*.12,h);for(let i=0;i<10;i++){ctx.strokeStyle='rgba(255,255,255,.025)';ctx.beginPath();ctx.moveTo(0,h*(i/10));ctx.lineTo(w,h*(i/10+.06));ctx.stroke();}break;
      case 'magazine': case 'editorial':
        ctx.fillStyle='rgba(255,255,255,.10)';ctx.fillRect(w*.65,0,w*.35,h);ctx.fillStyle=rgba(accent,.10);ctx.fillRect(0,h*.75,w,h*.015);break;
      case 'frame':
        ctx.strokeStyle=rgba(accent,.32);ctx.lineWidth=w*.004;ctx.strokeRect(w*.05,h*.04,w*.90,h*.92);break;
      case 'milestone':
        ctx.strokeStyle=rgba(accent,.30);ctx.lineWidth=w*.015;ctx.beginPath();ctx.arc(w*.76,h*.39,w*.15,0,Math.PI*2);ctx.stroke();break;
      case 'confetti':
        for(let i=0;i<26;i++){const x=Math.abs(Math.sin(i*81.17))*w,y=Math.abs(Math.sin(i*13.71))*h;ctx.save();ctx.translate(x,y);ctx.rotate(i);ctx.fillStyle=i%3?'#fff':accent;ctx.globalAlpha=.16;ctx.fillRect(-w*.004,-w*.011,w*.008,w*.022);ctx.restore();}break;
      case 'torn-paper':
        ctx.fillStyle='rgba(255,255,255,.06)';ctx.beginPath();ctx.moveTo(0,h*.68);for(let i=0;i<8;i++)ctx.lineTo(w*(i/7),h*(.65+(i%2)*.05));ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();ctx.fill();break;
    }
  }

  function wrap(ctx,text,maxWidth){
    const out=[];String(text||'').split('\n').forEach(p=>{let cur='';p.split(/\s+/).forEach(word=>{const test=cur?cur+' '+word:word;if(ctx.measureText(test).width>maxWidth&&cur){out.push(cur);cur=word}else cur=test});out.push(cur)});return out;
  }

  function render(canvas,t){
    if(!canvas||!t)return;
    const dpr=Math.min(2,window.devicePixelRatio||1);
    const cssW=canvas.clientWidth||216,cssH=canvas.clientHeight||270;
    const w=Math.max(216,Math.round(cssW*dpr)),h=Math.max(270,Math.round(cssH*dpr));
    if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;
    const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return;
    const [a,b,accent]=t.palette;
    const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,a);g.addColorStop(1,b);ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    decor(ctx,w,h,t);
    if(t.texture)grain(ctx,w,h,.07);
    const shade=ctx.createLinearGradient(0,h*.45,0,h);shade.addColorStop(0,'rgba(0,0,0,0)');shade.addColorStop(1,'rgba(0,0,0,.42)');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);

    if(logoReady&&logo.naturalWidth){const s=Math.min((w*.16)/logo.naturalWidth,(h*.075)/logo.naturalHeight);ctx.drawImage(logo,w*.055,h*.035,logo.naturalWidth*s,logo.naturalHeight*s);}

    const align=t.align||'left',x=align==='center'?w/2:w*.065,maxWidth=w*((t.titleWidth||80)/100);
    ctx.textAlign=align;ctx.textBaseline='top';ctx.fillStyle=t.kickerColor||accent;ctx.font=`900 ${Math.max(8,w*.025)}px "DM Sans",sans-serif`;ctx.fillText(t.kicker,x,h*((t.titleY-10)/100));
    const fs=Math.max(20,w*((t.titleSize||120)/1080));ctx.fillStyle=t.titleColor||'#fff';ctx.font=`${t.font==='Bebas Neue'?400:900} ${fs}px "${t.font||'Montserrat'}",sans-serif`;
    let y=h*((t.titleY||50)/100);wrap(ctx,t.title,maxWidth).forEach(line=>{ctx.fillText(line,x,y);y+=fs*.84});
    ctx.fillStyle=t.detailColor||'#c8cbd0';ctx.globalAlpha=.84;ctx.font=`700 ${Math.max(7,w*.018)}px "DM Sans",sans-serif`;ctx.fillText(t.detail,x,h*(((t.titleY||50)+29)/100));ctx.globalAlpha=1;
    ctx.textAlign='right';ctx.fillStyle=t.footerColor||accent;ctx.globalAlpha=.48;ctx.font=`800 ${Math.max(6,w*.015)}px "DM Sans",sans-serif`;ctx.fillText(t.cta||'FWCWL',w*.94,h*.94);ctx.globalAlpha=1;
  }

  window.MK97TemplatePreview={render,renderAll(root=document){root.querySelectorAll('canvas[data-template-preview]').forEach(c=>{const id=c.dataset.templatePreview;const t=(window.MK97_TEMPLATES||[]).find(x=>x.id===id);if(t)render(c,t);});}};
  document.addEventListener('mk97-template-logo-ready',()=>window.MK97TemplatePreview.renderAll());
})();
