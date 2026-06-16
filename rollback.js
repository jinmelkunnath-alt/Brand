const fs = require('fs');
let code = fs.readFileSync('/home/user/uploads/nova-with-pixie.html', 'utf8');

// 1. Revert nav scroll
code = code.replace(
  "let navScrollRaf=0;addEventListener('scroll', ()=>{if(!navScrollRaf){navScrollRaf=requestAnimationFrame(()=>{nav.classList.toggle('scrolled', scrollY > 12);navScrollRaf=0;});}}, {passive:true});",
  "addEventListener('scroll', ()=> nav.classList.toggle('scrolled', scrollY > 12), {passive:true});"
);

// 2. Revert dissolveHero
const dissolveNew = `  let dissolveRaf = 0;
  let winH = window.innerHeight;
  let lastProgress = -1;
  addEventListener('resize', ()=>{ winH = window.innerHeight; }, {passive:true});
  const dissolveHero = ()=>{
    if(!heroSection || dissolveRaf) return;
    dissolveRaf = requestAnimationFrame(()=>{
      const rect = heroSection.getBoundingClientRect();
      const start = winH * .10;
      const end = winH * .78;
      const progress = Math.min(1, Math.max(0, (start - rect.top) / end));
      if (progress !== lastProgress) {
        editorStage.style.setProperty('--editor-opacity', String(1 - progress * .30));
        editorStage.style.setProperty('--editor-y', \`\${progress * 40}px\`);
        editorStage.style.setProperty('--editor-blur', \`\${progress * 3.6}px\`);
        lastProgress = progress;
      }
      dissolveRaf = 0;
    });
  };
  dissolveHero();
  addEventListener('scroll', dissolveHero, {passive:true});`;

const dissolveOld = `  const dissolveHero = ()=>{
    if(!heroSection) return;
    const rect = heroSection.getBoundingClientRect();
    const start = window.innerHeight * .10;
    const end = window.innerHeight * .78;
    const progress = Math.min(1, Math.max(0, (start - rect.top) / end));
    editorStage.style.setProperty('--editor-opacity', String(1 - progress * .30));
    editorStage.style.setProperty('--editor-y', \`\${progress * 40}px\`);
    editorStage.style.setProperty('--editor-blur', \`\${progress * 3.6}px\`);
  };
  dissolveHero();
  addEventListener('scroll', dissolveHero, {passive:true});
  addEventListener('resize', dissolveHero, {passive:true});`;

code = code.replace(dissolveNew, dissolveOld);

// 3. Revert mousemove
const mousemoveNew = `  let raf = 0;
  let mouseX = 0, mouseY = 0;
  editorStage.addEventListener('mousemove', (e)=>{
    if(!editorWindow) return;
    mouseX = e.clientX;
    mouseY = e.clientY;
    if(!raf){
      raf = requestAnimationFrame(()=>{
        const r = editorStage.getBoundingClientRect();
        const cx = (mouseX - r.left) / r.width - .5;
        const cy = (mouseY - r.top) / r.height - .5;
        editorWindow.style.setProperty('--editor-rx', \`\${-cy * 4.8}deg\`);
        editorWindow.style.setProperty('--editor-ry', \`\${cx * 6.2}deg\`);
        editorWindow.style.setProperty('--editor-lift', '-4px');
        raf = 0;
      });
    }
  }, {passive:true});`;

const mousemoveOld = `  let raf = 0;
  editorStage.addEventListener('mousemove', (e)=>{
    if(!editorWindow) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(()=>{
      const r = editorStage.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width - .5;
      const cy = (e.clientY - r.top) / r.height - .5;
      editorWindow.style.setProperty('--editor-rx', \`\${-cy * 4.8}deg\`);
      editorWindow.style.setProperty('--editor-ry', \`\${cx * 6.2}deg\`);
      editorWindow.style.setProperty('--editor-lift', '-4px');
    });
  }, {passive:true});`;

code = code.replace(mousemoveNew, mousemoveOld);

// 4. Revert will-change CSS
code = code.replace(
  `.nova-pixie-mascot{
  will-change: transform, box-shadow;
  width:64px;
  height:64px;`,
  `.nova-pixie-mascot{
  width:64px;
  height:64px;`
);

code = code.replace(
  `.nova-pixie-chat{
  will-change: transform, opacity;
  position:fixed;
  bottom:96px;`,
  `.nova-pixie-chat{
  position:fixed;
  bottom:96px;`
);

code = code.replace(
  `.engineering-editor{will-change: transform;position:relative;z-index:4;`,
  `.engineering-editor{position:relative;z-index:4;`
);

fs.writeFileSync('/home/user/uploads/nova-with-pixie.html', code);
console.log("Rollback completed.");
