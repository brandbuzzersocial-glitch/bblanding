import { useState, useEffect, useRef } from "react";

function useInView(t = 0.1) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: t });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return [ref, v];
}

function CodeMatrixRain({ theme }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const chars = ["<div>","</div>","const","=>","{","}","function","return","import","export","async","await","null","true","false","[ ]","( )","===","!==","0px","var(","rem","vh","&&","||","?.","??","npm","git","API","SQL","CSS","JSX","TSX","*.js","404","200"];
    const COL_W = 22;
    const cols = Math.floor(W / COL_W);
    const drops = Array.from({length: cols}, () => Math.random() * -50);
    const speeds = Array.from({length: cols}, () => 0.15 + Math.random() * 0.25);
    const brightCol = Array.from({length: cols}, () => Math.random() > 0.7);
    const mousePos = {x: -9999, y: -9999};
    const onMouse = e => { const r = canvas.getBoundingClientRect(); mousePos.x = e.clientX - r.left; mousePos.y = e.clientY - r.top; };
    canvas.addEventListener("mousemove", onMouse);
    const onResize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    window.addEventListener("resize", onResize);
    let frame;
    const isDark = theme === "dark";
    const draw = () => {
      frame = requestAnimationFrame(draw);
      ctx.fillStyle = isDark ? "rgba(15,15,15,0.18)" : "rgba(245,242,238,0.18)";
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < cols; i++) {
        const x = i * COL_W;
        const y = drops[i] * 18;
        const dx = x - mousePos.x, dy = y - mousePos.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const near = dist < 120;
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.font = `bold 9px 'Courier New',monospace`;
        if (near) {
          ctx.fillStyle = isDark ? "#fff" : "#111";
          ctx.shadowColor = "#f07127"; ctx.shadowBlur = 12;
        } else if (brightCol[i]) {
          ctx.fillStyle = "#f07127"; ctx.shadowColor = "#f07127"; ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = isDark ? "rgba(240,113,39,0.35)" : "rgba(180,80,20,0.3)";
          ctx.shadowBlur = 0;
        }
        ctx.fillText(char, x, y);
        ctx.shadowBlur = 0;
        drops[i] += speeds[i];
        if (drops[i] * 18 > H + 40) { drops[i] = Math.random() * -30; brightCol[i] = Math.random() > 0.7; }
      }
    };
    draw();
    return () => { cancelAnimationFrame(frame); canvas.removeEventListener("mousemove", onMouse); window.removeEventListener("resize", onResize); };
  }, [theme]);
  return <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%",cursor:"crosshair"}} />;
}

function CircuitNetwork({ theme }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const mousePos = {x: -999, y: -999};
    const onMouse = e => { const r = canvas.getBoundingClientRect(); mousePos.x = e.clientX - r.left; mousePos.y = e.clientY - r.top; };
    canvas.addEventListener("mousemove", onMouse);
    const NUM = 36;
    const nodes = Array.from({length: NUM}, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random()-0.5)*0.3, vy: (Math.random()-0.5)*0.3,
      r: 2 + Math.random()*3, pulse: Math.random()*Math.PI*2,
    }));
    const packets = Array.from({length: 12}, () => ({
      from: Math.floor(Math.random()*NUM), progress: Math.random(), speed: 0.004+Math.random()*0.006,
    }));
    const onResize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; nodes.forEach(n=>{n.x=Math.random()*W;n.y=Math.random()*H;}); };
    window.addEventListener("resize", onResize);
    let frame; let t = 0;
    const isDark = theme === "dark";
    const draw = () => {
      frame = requestAnimationFrame(draw);
      t += 0.016;
      ctx.clearRect(0, 0, W, H);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.04;
        if (n.x < 0||n.x > W) n.vx *= -1;
        if (n.y < 0||n.y > H) n.vy *= -1;
      });
      const DIST = 140;
      const edges = [];
      for (let i = 0; i < NUM; i++) for (let j = i+1; j < NUM; j++) {
        const dx = nodes[i].x-nodes[j].x, dy = nodes[i].y-nodes[j].y;
        const d = Math.sqrt(dx*dx+dy*dy);
        if (d < DIST) {
          const alpha = (1-d/DIST)*0.5;
          ctx.strokeStyle = `rgba(240,113,39,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.moveTo(nodes[i].x,nodes[i].y); ctx.lineTo(nodes[j].x,nodes[j].y); ctx.stroke();
          edges.push({i,j});
        }
      }
      packets.forEach(p => {
        p.progress += p.speed;
        if (p.progress >= 1) { p.progress=0; p.from=Math.floor(Math.random()*NUM); }
        let bestJ=-1, bestD=9999;
        for(const e of edges){
          if(e.i===p.from||e.j===p.from){
            const other=e.i===p.from?e.j:e.i;
            const dx=nodes[p.from].x-nodes[other].x,dy=nodes[p.from].y-nodes[other].y;
            const d=Math.sqrt(dx*dx+dy*dy);
            if(d<bestD){bestD=d;bestJ=other;}
          }
        }
        if(bestJ>=0){
          const px=nodes[p.from].x+(nodes[bestJ].x-nodes[p.from].x)*p.progress;
          const py=nodes[p.from].y+(nodes[bestJ].y-nodes[p.from].y)*p.progress;
          ctx.beginPath(); ctx.arc(px,py,3,0,Math.PI*2);
          ctx.fillStyle= isDark ? "#fff" : "#333";
          ctx.shadowColor="#f07127"; ctx.shadowBlur=10; ctx.fill(); ctx.shadowBlur=0;
        }
      });
      nodes.forEach(n => {
        const dx=n.x-mousePos.x,dy=n.y-mousePos.y;
        const near=Math.sqrt(dx*dx+dy*dy)<80;
        const glow=near?1:0.3+0.2*Math.sin(n.pulse);
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r+(near?3:0),0,Math.PI*2);
        ctx.fillStyle=`rgba(240,113,39,${glow})`;
        if(near){ctx.shadowColor="#f07127";ctx.shadowBlur=18;}
        ctx.fill(); ctx.shadowBlur=0;
        ctx.strokeStyle=`rgba(240,113,39,${glow*0.5})`; ctx.lineWidth=0.5;
        const s=n.r*2.5; ctx.strokeRect(n.x-s/2,n.y-s/2,s,s);
      });
    };
    draw();
    return () => { cancelAnimationFrame(frame); canvas.removeEventListener("mousemove", onMouse); window.removeEventListener("resize", onResize); };
  }, [theme]);
  return <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />;
}

function TerminalDeploy({ theme }) {
  const [lines, setLines] = useState([]);
  const termRef = useRef(null);
  const isDark = theme === "dark";
  const deployLines = [
    {t:"cmd",txt:"$ git push origin main"},{t:"info",txt:"Enumerating objects: 24, done."},
    {t:"info",txt:"Counting objects: 100% (24/24), done."},{t:"info",txt:"Delta compression using up to 8 threads"},
    {t:"ok",txt:"Writing objects: 100% (18/18), 42.8 KiB"},{t:"ok",txt:"Branch 'main' set up to track remote."},
    {t:"sep",txt:""},{t:"cmd",txt:"$ npm run build"},{t:"info",txt:"▶  Building for production..."},
    {t:"info",txt:"  ✓  Compiled 142 modules in 2.3s"},{t:"ok",txt:"  ✓  Bundle: main.js 87.2 KB (gzip: 24.1 KB)"},
    {t:"sep",txt:""},{t:"cmd",txt:"$ vercel deploy --prod"},
    {t:"info",txt:"  🔗  Linked to brandbuzzer/client-site"},
    {t:"info",txt:"  📦  Uploading build output..."},{t:"info",txt:"  🌍  Propagating to 98 edge locations..."},
    {t:"ok",txt:"  ✅  Production deployment complete!"},{t:"url",txt:"  🚀  https://client-site.brandbuzzer.co"},
    {t:"sep",txt:""},{t:"perf",txt:"  ⚡  Lighthouse: Performance 99 / SEO 100"},
    {t:"perf",txt:"  ⚡  FCP: 0.4s  |  LCP: 0.9s  |  CLS: 0"},
  ];
  useEffect(() => {
    let idx = 0;
    const add = () => {
      if (idx >= deployLines.length) { setTimeout(()=>{setLines([]);idx=0;setTimeout(add,800)},2200); return; }
      setLines(prev => [...prev, deployLines[idx++]]);
      if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
      setTimeout(add, 140 + Math.random()*160);
    };
    const t = setTimeout(add, 400);
    return () => clearTimeout(t);
  }, []);
  const color = t => t==="cmd"?"#f07127":t==="ok"?"#4ade80":t==="url"?"#60a5fa":t==="perf"?"#facc15":t==="sep"?"transparent": isDark ? "rgba(242,238,234,0.55)" : "rgba(60,50,40,0.75)";
  return (
    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
      <div style={{width:"100%",maxWidth:460,background: isDark ? "rgba(10,10,10,0.92)" : "rgba(255,255,255,0.95)",border: isDark ? "1px solid rgba(240,113,39,0.25)" : "1px solid rgba(240,113,39,0.3)",borderRadius:"8px",overflow:"hidden",boxShadow: isDark ? "0 0 60px rgba(240,113,39,0.12)" : "0 8px 40px rgba(240,113,39,0.15)"}}>
        <div style={{padding:"10px 16px",borderBottom: isDark ? "1px solid rgba(240,113,39,0.15)" : "1px solid rgba(240,113,39,0.18)",display:"flex",alignItems:"center",gap:"8px",background: isDark ? "rgba(240,113,39,0.06)" : "rgba(240,113,39,0.05)"}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:"#ff5f57"}}/><div style={{width:10,height:10,borderRadius:"50%",background:"#febc2e"}}/><div style={{width:10,height:10,borderRadius:"50%",background:"#28c840"}}/>
          <span style={{marginLeft:8,fontFamily:"'Courier New',monospace",fontSize:"0.7rem",color:"rgba(240,113,39,0.6)",letterSpacing:"0.08em"}}>brandbuzzer — deploy</span>
        </div>
        <div ref={termRef} style={{padding:"16px",fontFamily:"'Courier New',monospace",fontSize:"0.72rem",lineHeight:1.7,height:320,overflowY:"auto",scrollbarWidth:"none",background: isDark ? "transparent" : "rgba(252,249,245,0.9)"}}>
          {lines.map((l,i) => l.t==="sep"?<div key={i} style={{height:8}}/> : (
            <div key={i} style={{color:color(l.t),display:"flex",alignItems:"baseline",gap:6}}>
              <span style={{opacity:0.3,userSelect:"none",minWidth:16,fontSize:"0.6rem"}}>{(i+1).toString().padStart(2,"0")}</span>
              <span>{l.txt}</span>
            </div>
          ))}
          <span style={{display:"inline-block",width:7,height:13,background:"#f07127",animation:"cursorblink 1s step-end infinite",verticalAlign:"text-bottom",marginLeft:2}}/>
        </div>
      </div>
    </div>
  );
}

function Counter({ target, suffix }) {
  const [val, setVal] = useState(0);
  const [ref, inView] = useInView(0.3);
  useEffect(() => {
    if (!inView) return;
    const dur = 1800, start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      setVal(Math.floor((1 - Math.pow(1-p,3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setVal(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);
  return <span ref={ref}>{val}{suffix}</span>;
}

const MQ = ["627+ Websites Launched","48-Hour Delivery — Guaranteed","Zero Templates. 100% Custom.","Clients Report 3× More Leads","₹0 Upfront. Pay On Satisfaction.","627+ Websites Launched","48-Hour Delivery — Guaranteed","Zero Templates. 100% Custom.","Clients Report 3× More Leads","₹0 Upfront. Pay On Satisfaction."];

// ── Theme Toggle Button ──
function ThemeToggle({ theme, toggle }) {
  const dark = theme === "dark";
  return (
    <button onClick={toggle} title="Toggle theme" style={{background:dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)",border:dark?"1px solid rgba(255,255,255,0.13)":"1px solid rgba(0,0,0,0.13)",borderRadius:"999px",padding:"6px 14px 6px 10px",display:"flex",alignItems:"center",gap:"8px",cursor:"pointer",transition:"all 0.3s",color:dark?"#f2eeea":"#1a1008"}}>
      <span style={{width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:dark?"rgba(240,113,39,0.2)":"rgba(240,113,39,0.15)",transition:"all 0.3s"}}>
        {dark
          ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f07127" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f07127" strokeWidth="2.2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        }
      </span>
      <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.72rem",fontWeight:500,letterSpacing:"0.12em",textTransform:"uppercase"}}>{dark ? "Light" : "Dark"}</span>
    </button>
  );
}

export default function App() {
  const [theme, setTheme] = useState("dark");
  const dark = theme === "dark";
  const toggle = () => setTheme(t => t === "dark" ? "light" : "dark");

  const [scrolled, setScrolled] = useState(false);
  const [heroVis, setHeroVis] = useState(false);
  const [form, setForm] = useState({ name:"",email:"",business:"",phone:"" });
  const [submitted, setSubmitted] = useState(false);

  const [aboutRef, aboutIn] = useInView();
  const [servRef, servIn] = useInView();
  const [procRef, procIn] = useInView();
  const [testRef, testIn] = useInView();
  const [ctaRef, ctaIn] = useInView();
  const [statsRef, statsIn] = useInView(0.2);
  const [liveRef, liveIn] = useInView(0.1);

  useEffect(() => {
    const t = setTimeout(() => setHeroVis(true), 80);
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => { clearTimeout(t); window.removeEventListener("scroll", onScroll); };
  }, []);

  const go = id => document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });

  // ── Theme tokens ──
  const T = {
    bg:       dark ? "#0f0f0f" : "#f5f2ee",
    bg2:      dark ? "#171717" : "#ece8e2",
    bg3:      dark ? "#1e1e1e" : "#e4dfd8",
    text:     dark ? "#f2eeea" : "#1a1008",
    muted:    dark ? "#6b6560" : "#8a7f75",
    border:   dark ? "rgba(240,113,39,0.14)" : "rgba(200,90,20,0.18)",
    navBg:    scrolled ? (dark ? "rgba(15,15,15,0.92)" : "rgba(245,242,238,0.94)") : "transparent",
    navBdr:   scrolled ? (dark ? "rgba(240,113,39,0.14)" : "rgba(200,90,20,0.18)") : "none",
    gridLine: dark ? "rgba(240,113,39,0.025)" : "rgba(200,90,20,0.06)",
    wmColor:  dark ? "rgba(240,113,39,0.04)" : "rgba(200,90,20,0.06)",
    scanBg:   dark ? "rgba(15,15,15,0.18)" : "rgba(245,242,238,0.18)",
    card:     dark ? "#171717" : "#fff",
    cardBrd:  dark ? "rgba(240,113,39,0.14)" : "rgba(200,90,20,0.2)",
    shadow:   dark ? "none" : "0 2px 20px rgba(0,0,0,0.07)",
    termBg:   dark ? "rgba(10,10,10,0.92)" : "rgba(255,255,255,0.95)",
    termLine: dark ? "rgba(242,238,234,0.55)" : "rgba(60,50,40,0.7)",
    inpBg:    dark ? "rgba(242,238,234,0.03)" : "rgba(30,20,10,0.03)",
    quote:    dark ? "#f2eeea" : "#1a1008",
  };

  const services = [
    {n:".01",title:"Landing Pages That Actually Convert",desc:"One page. One goal. One obsession. We build landing pages that pull leads like magnets — with avg. conversion rates our clients brag about to investors."},
    {n:".02",title:"Business Websites That Close Deals",desc:"Multi-page custom sites built to make your brand look like the obvious choice — so visitors call you, not your competitor."},
    {n:".03",title:"E-Commerce Stores Built to Scale",desc:"Beautiful product pages, frictionless checkout, and trust signals that kill cart abandonment. We've helped stores hit ₹10L in month one."},
    {n:".04",title:"Portfolio & Personal Brand Sites",desc:"Whether you're a CA, consultant, or creative — we build sites that position you as the premium option and command premium prices."},
    {n:".05",title:"Website Redesigns That Transform Revenue",desc:"Ugly or slow websites repel customers silently. We take your existing site and rebuild it into something you'd be proud to show any investor."},
    {n:".06",title:"Ongoing SEO & Growth Support",desc:"Getting found on Google isn't optional anymore. Our monthly retainers handle speed, content, and rankings so you dominate your local market."},
  ];

  const testimonials = [
    {quote:"I was sceptical — 48 hours sounded like a gimmick. But they delivered a site that made my interiors business look like a ₹10 crore company. Inquiries tripled in the first week. I've since referred six friends.",name:"Arjun Mehta",role:"Founder, NestCraft Interiors"},
    {quote:"Our old site had a 1.2% conversion rate. Brand Buzzer rebuilt it in 3 days and we hit 14% in the first month. That's 11× more leads from the same traffic. The ROI is insane.",name:"Sneha Agarwal",role:"CEO, Bloom Skincare"},
    {quote:"They've now built four of our brand websites. Every single one ranks on Page 1 in Jaipur within 60 days. They're not just a vendor — they're our unfair advantage.",name:"Rohit Sharma",role:"Director, Apex Ventures"},
  ];

  const cs = `
    @import url('https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=Barlow+Condensed:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&display=swap');
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
    html{scroll-behavior:smooth}
    ::-webkit-scrollbar{width:3px}
    ::-webkit-scrollbar-thumb{background:#f0712744}
    @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
    @keyframes grain{0%,100%{transform:translate(0,0)}25%{transform:translate(-2%,-2%)}50%{transform:translate(2%,1%)}75%{transform:translate(-1%,3%)}}
    @keyframes cursorblink{0%,100%{opacity:1}50%{opacity:0}}
    @keyframes scanline{0%{top:-10%}100%{top:110%}}
    .rv{opacity:0;transform:translateY(28px);transition:opacity 0.85s ease,transform 0.85s ease}
    .rv.in{opacity:1;transform:translateY(0)}
    @media(max-width:768px){.dnm{display:none!important}.g2{grid-template-columns:1fr!important}.g3{grid-template-columns:1fr!important}.g4{grid-template-columns:repeat(2,1fr)!important}.srow{flex-direction:column!important}}
  `;

  return (
    <div style={{fontFamily:"'Barlow','Arial Narrow',sans-serif",background:T.bg,color:T.text,overflowX:"hidden",minHeight:"100vh",transition:"background 0.4s,color 0.4s"}}>
      <style>{cs}</style>

      {/* ── NAV ── */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"0 6%",height:"68px",display:"flex",alignItems:"center",justifyContent:"space-between",background:T.navBg,backdropFilter:scrolled?"blur(20px)":"none",borderBottom:scrolled?`1px solid ${T.border}`:"none",transition:"all 0.4s"}}>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"1.25rem",fontWeight:500,cursor:"pointer",color:T.text}} onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}>
          Brand<em style={{fontStyle:"italic",color:"#f07127"}}>Buzzer</em>
        </div>
        <div className="dnm" style={{display:"flex",gap:"32px",alignItems:"center"}}>
          {["Services","Process","Live Work","Results","Contact"].map(n=>(
            <button key={n} onClick={()=>go(n.toLowerCase().replace(" ","-"))} style={{background:"none",border:"none",color:T.muted,fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.8rem",fontWeight:500,letterSpacing:"0.14em",textTransform:"uppercase",cursor:"pointer",transition:"color 0.3s",padding:0}}
              onMouseOver={e=>e.target.style.color=T.text} onMouseOut={e=>e.target.style.color=T.muted}>{n}</button>
          ))}
          <ThemeToggle theme={theme} toggle={toggle}/>
          <button onClick={()=>go("contact")} style={{display:"inline-flex",alignItems:"center",gap:8,background:"#f07127",color:"#0f0f0f",border:"none",padding:"10px 22px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.72rem",fontWeight:500,letterSpacing:"0.16em",textTransform:"uppercase",cursor:"pointer",transition:"background 0.3s"}}
            onMouseOver={e=>e.currentTarget.style.background="#e8621a"} onMouseOut={e=>e.currentTarget.style.background="#f07127"}>Get a Website</button>
        </div>
        {/* Mobile toggle */}
        <div className="dnm" style={{display:"none"}}/>
        <div style={{display:"flex",gap:10,alignItems:"center"}} id="mobileNav">
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{position:"relative",minHeight:"100vh",display:"flex",alignItems:"center",padding:"100px 6% 100px",overflow:"hidden"}}>
        <div style={{position:"absolute",right:"-4%",top:0,bottom:0,width:"56%",zIndex:0}}>
          <CodeMatrixRain theme={theme}/>
        </div>
        <div style={{position:"absolute",right:"18%",top:"50%",transform:"translateY(-50%)",width:560,height:560,borderRadius:"50%",background:"radial-gradient(circle,rgba(240,113,39,0.12) 0%,transparent 65%)",pointerEvents:"none",zIndex:1}}/>
        <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(${T.gridLine} 1px,transparent 1px),linear-gradient(90deg,${T.gridLine} 1px,transparent 1px)`,backgroundSize:"80px 80px",pointerEvents:"none",zIndex:0}}/>
        <div style={{position:"absolute",left:"-2%",bottom:"-10%",fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(8rem,20vw,20rem)",fontWeight:600,fontStyle:"italic",color:"transparent",WebkitTextStroke:`1px ${T.wmColor}`,lineHeight:1,pointerEvents:"none",userSelect:"none",zIndex:0}}>WEB</div>
        <div style={{position:"relative",zIndex:2,maxWidth:580}}>
          <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"36px",opacity:heroVis?1:0,transform:heroVis?"none":"translateY(14px)",transition:"all 0.9s ease 0.1s"}}>
            <div style={{width:32,height:1,background:"#f07127"}}/>
            <span style={{fontSize:"0.68rem",fontWeight:600,letterSpacing:"0.2em",textTransform:"uppercase",color:"#f07127"}}>India's Fastest Web Studio · Brand Buzzer</span>
          </div>
          <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(3rem,6vw,5.8rem)",fontWeight:600,lineHeight:1.06,letterSpacing:"-0.02em",marginBottom:"28px",opacity:heroVis?1:0,transform:heroVis?"none":"translateY(24px)",transition:"all 0.9s ease 0.2s",color:T.text}}>
            Your website is<br/><em style={{color:"#f07127"}}>losing you money</em><br/>every single day<br/>it's not live.
          </h1>
          <p style={{color:T.muted,fontSize:"clamp(0.9rem,1.5vw,1.06rem)",lineHeight:1.88,maxWidth:460,marginBottom:"20px",opacity:heroVis?1:0,transition:"all 0.9s ease 0.38s"}}>
            We build premium, conversion-engineered websites in <strong style={{color:T.text}}>48–72 hours</strong> — not weeks.
          </p>
          <p style={{color:"rgba(240,113,39,0.7)",fontSize:"0.8rem",lineHeight:1.7,maxWidth:400,marginBottom:"44px",opacity:heroVis?1:0,transition:"all 0.9s ease 0.44s",fontStyle:"italic"}}>
            ⚡ 3 consultation slots left this week. Once they're gone, next availability is in 2 weeks.
          </p>
          <div style={{display:"flex",gap:"14px",flexWrap:"wrap",opacity:heroVis?1:0,transition:"all 0.9s ease 0.52s"}}>
            <button onClick={()=>go("contact")} style={{display:"inline-flex",alignItems:"center",gap:10,background:"#f07127",color:"#0f0f0f",border:"none",padding:"16px 40px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.85rem",fontWeight:500,letterSpacing:"0.16em",textTransform:"uppercase",cursor:"pointer",transition:"background 0.3s,transform 0.2s",clipPath:"polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))"}}
              onMouseOver={e=>{e.currentTarget.style.background="#e8621a";e.currentTarget.style.transform="translateY(-2px)"}} onMouseOut={e=>{e.currentTarget.style.background="#f07127";e.currentTarget.style.transform=""}}>Claim My Free Slot &nbsp;→</button>
            <button onClick={()=>go("services")} style={{display:"inline-flex",alignItems:"center",gap:10,background:"transparent",color:T.text,border:`1px solid ${dark?"rgba(242,238,234,0.18)":"rgba(26,16,8,0.2)"}`,padding:"15px 40px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.85rem",fontWeight:500,letterSpacing:"0.16em",textTransform:"uppercase",cursor:"pointer",transition:"border-color 0.3s,color 0.3s"}}
              onMouseOver={e=>{e.currentTarget.style.borderColor="#f07127";e.currentTarget.style.color="#f07127"}} onMouseOut={e=>{e.currentTarget.style.borderColor=dark?"rgba(242,238,234,0.18)":"rgba(26,16,8,0.2)";e.currentTarget.style.color=T.text}}>See What We Build</button>
          </div>
        </div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,borderTop:`1px solid ${T.border}`,padding:"20px 6%",display:"flex",gap:"40px",flexWrap:"wrap",zIndex:2,opacity:heroVis?1:0,transition:"opacity 1.4s ease 0.8s",background:dark?"transparent":"rgba(245,242,238,0.7)"}}>
          {[["627+","Websites This Month"],["48h","Avg. Delivery"],["100%","Client Satisfaction"]].map(([v,l])=>(
            <div key={l} style={{display:"flex",alignItems:"baseline",gap:"10px"}}>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"1.55rem",fontWeight:500,fontStyle:"italic",color:"#f07127"}}>{v}</span>
              <span style={{color:T.muted,fontSize:"0.74rem",letterSpacing:"0.06em"}}>{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{borderTop:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`,padding:"12px 0",overflow:"hidden",background: dark?"#121212":T.bg3,transition:"background 0.4s"}}>
        <div style={{display:"flex",animation:"marquee 40s linear infinite",width:"max-content"}}>
          {MQ.map((item,i)=>(
            <span key={i} style={{padding:"0 48px",color:i%2===0?"#f07127":T.muted,fontSize:"0.7rem",fontWeight:500,letterSpacing:"0.15em",textTransform:"uppercase",whiteSpace:"nowrap"}}>
              {item}<span style={{marginLeft:"48px",color:"rgba(240,113,39,0.22)"}}>◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ══ ABOUT ══ */}
      <section ref={aboutRef} style={{position:"relative"}}>
        <div style={{position:"relative",height:"280px",overflow:"hidden",borderBottom:`1px solid ${T.border}`}}>
          {aboutIn && <CircuitNetwork theme={theme}/>}
          <div style={{position:"absolute",inset:0,background:`linear-gradient(to bottom,${T.bg},transparent 30%,transparent 70%,${T.bg})`,pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",zIndex:2}}>
            <p style={{fontSize:"0.66rem",fontWeight:600,letterSpacing:"0.22em",textTransform:"uppercase",color:"#f07127",marginBottom:"8px"}}>Why Businesses Choose Us</p>
            <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(1.6rem,3vw,2.6rem)",fontWeight:500,lineHeight:1.15,whiteSpace:"nowrap",color:T.text}}>
              We Don't Build Websites. We Build <em style={{fontStyle:"italic",color:"#f07127"}}>Revenue Machines.</em>
            </h2>
          </div>
        </div>
        <div style={{padding:"80px 6%",background:T.bg,transition:"background 0.4s"}}>
          <div style={{maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"80px",alignItems:"start"}} className="g2">
            <div className={`rv${aboutIn?" in":""}`}>
              <p style={{color:T.muted,lineHeight:1.9,fontSize:"0.92rem",marginBottom:"18px"}}>Most businesses are <strong style={{color:T.text}}>bleeding money</strong> on a website that looks like 2012, loads in 6 seconds, and converts at under 1%.</p>
              <p style={{color:T.muted,lineHeight:1.9,fontSize:"0.92rem",marginBottom:"36px"}}>Brand Buzzer has delivered 627+ projects this month alone. Every site is custom-built, mobile-perfect, and engineered around one goal: <strong style={{color:T.text}}>turning strangers into paying customers.</strong></p>
              {["Zero templates — every pixel built for your brand","Designs delivered in 24 hrs, live in 48–72 hrs","Average client sees 3× more leads in week one","Lighthouse score 96+ on every project we ship"].map(item=>(
                <div key={item} style={{display:"flex",gap:"14px",alignItems:"center",fontSize:"0.85rem",marginBottom:"11px"}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f07127" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                  <span style={{color:T.text}}>{item}</span>
                </div>
              ))}
            </div>
            <div className={`rv${aboutIn?" in":""}`} style={{transitionDelay:"0.2s"}}>
              <div style={{border:`1px solid ${T.border}`,background:T.bg2,padding:"36px",position:"relative",boxShadow:T.shadow,transition:"all 0.4s"}}>
                <div style={{position:"absolute",top:0,left:0,width:"30%",height:"2px",background:"#f07127"}}/>
                <p style={{fontFamily:"'Barlow Condensed',sans-serif",fontStyle:"italic",fontSize:"1.1rem",lineHeight:1.7,color:T.text,marginBottom:"26px"}}>
                  "Every day without a high-converting website is a day handing customers to your competitors. We fix that in 72 hours — or <em style={{color:"#f07127"}}>you don't pay a rupee.</em>"
                </p>
                <div style={{borderTop:`1px solid ${T.border}`,paddingTop:"18px",display:"flex",gap:"14px",alignItems:"center"}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#f07127,#b04010)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:500,color:"#fff",fontSize:"0.82rem"}}>BB</div>
                  <div><div style={{fontSize:"0.86rem",fontWeight:600,color:T.text}}>Brand Buzzer Team</div><div style={{fontSize:"0.72rem",color:T.muted}}>Web Development Division</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef} style={{padding:"0 0 80px",background:T.bg,transition:"background 0.4s"}}>
        <div style={{maxWidth:1200,margin:"0 auto",borderTop:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`,borderLeft:`1px solid ${T.border}`}}>
          <div style={{display:"flex"}} className="srow">
            {[{target:627,suffix:"+",label:"Sites Launched This Month"},{target:48,suffix:"h",label:"Avg. Delivery Time"},{target:100,suffix:"%",label:"On-Time, Every Time"},{target:50,suffix:"k+",label:"Leads Generated for Clients"}].map((s,i)=>(
              <div key={i} style={{borderRight:`1px solid ${T.border}`,padding:"40px 28px",background:T.bg2,textAlign:"center",flex:1,minWidth:0,transition:"background 0.4s"}}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(2.2rem,3.5vw,3rem)",fontWeight:600,fontStyle:"italic",color:"#f07127",marginBottom:"6px",lineHeight:1}}>
                  {statsIn?<Counter target={s.target} suffix={s.suffix}/>:`0${s.suffix}`}
                </div>
                <div style={{color:T.muted,fontSize:"0.72rem",letterSpacing:"0.12em",textTransform:"uppercase"}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" ref={servRef} style={{padding:"60px 6% 100px",background:T.bg,transition:"background 0.4s"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div className={`rv${servIn?" in":""}`} style={{marginBottom:"56px"}}>
            <p style={{fontSize:"0.66rem",fontWeight:600,letterSpacing:"0.22em",textTransform:"uppercase",color:"#f07127",marginBottom:"14px"}}>What We Build</p>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:"20px"}}>
              <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(1.9rem,3.2vw,2.9rem)",fontWeight:500,lineHeight:1.15,color:T.text}}>Every service built to<br/><em style={{fontStyle:"italic",color:"#f07127"}}>outrank, outperform</em><br/>& outlast your rivals.</h2>
              <p style={{color:T.muted,maxWidth:320,fontSize:"0.86rem",lineHeight:1.75}}>Not a single one of our clients has gone back to their old website. There's a reason for that.</p>
            </div>
          </div>
          <div style={{borderTop:`1px solid ${T.border}`}}>
            {services.map((s,i)=>(
              <div key={s.n} className={`rv${servIn?" in":""}`} style={{transitionDelay:`${i*0.07}s`,display:"flex",alignItems:"flex-start",gap:"24px",padding:"26px 0",borderBottom:`1px solid ${T.border}`,transition:"padding-left 0.3s"}}
                onMouseOver={e=>e.currentTarget.style.paddingLeft="20px"} onMouseOut={e=>e.currentTarget.style.paddingLeft="0"}>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontStyle:"italic",fontSize:"0.82rem",color:T.muted,minWidth:44,paddingTop:4}}>{s.n}</span>
                <div style={{flex:1}}>
                  <h3 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(1rem,1.7vw,1.3rem)",fontWeight:500,marginBottom:"5px",color:T.text}}>{s.title}</h3>
                  <p style={{color:T.muted,fontSize:"0.84rem",lineHeight:1.65}}>{s.desc}</p>
                </div>
                <span style={{fontSize:"1rem",color:"#f07127"}}>→</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section id="process" ref={procRef} style={{padding:"80px 6% 100px",background:T.bg2,borderTop:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`,transition:"background 0.4s"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div className={`rv${procIn?" in":""}`} style={{marginBottom:"64px",textAlign:"center"}}>
            <p style={{fontSize:"0.66rem",fontWeight:600,letterSpacing:"0.22em",textTransform:"uppercase",color:"#f07127",marginBottom:"14px"}}>How It Works</p>
            <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(1.9rem,3.2vw,2.9rem)",fontWeight:500,lineHeight:1.15,color:T.text}}>From "I need a website" to <em style={{fontStyle:"italic",color:"#f07127"}}>Live & Getting Leads</em> — in 3 days.</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1px"}} className="g4">
            {[{n:"01",title:"Discovery Call",desc:"A focused 30-min call where we dig into your goals, target audience, and biggest growth bottleneck."},{n:"02",title:"Design in 24hrs",desc:"You wake up the next day to high-fidelity mockups of your full website. Most clients say 'yes' on the first revision."},{n:"03",title:"Built to Perform",desc:"Speed-optimised, mobile-perfect, SEO-ready code — handcrafted, never templated. Lighthouse 96+ guaranteed."},{n:"04",title:"Live & Growing",desc:"Your site goes live, you get full ownership, and we stay on call for 30 days to ensure everything converts."}].map((step,i)=>(
              <div key={step.n} className={`rv${procIn?" in":""}`} style={{transitionDelay:`${i*0.1}s`,background:T.bg,border:`1px solid ${T.border}`,padding:"40px 28px",position:"relative",overflow:"hidden",transition:"border-color 0.35s,transform 0.35s,background 0.4s",boxShadow:T.shadow}}
                onMouseOver={e=>{e.currentTarget.style.borderColor="rgba(240,113,39,0.45)";e.currentTarget.style.transform="translateY(-6px)"}} onMouseOut={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.transform=""}}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"4.5rem",fontWeight:900,fontStyle:"italic",color:"transparent",WebkitTextStroke:`1px rgba(240,113,39,${dark?0.2:0.3})`,lineHeight:1,marginBottom:"18px",userSelect:"none"}}>{step.n}</div>
                <div style={{width:22,height:1,background:"#f07127",marginBottom:"18px"}}/>
                <h4 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"1.05rem",fontWeight:500,marginBottom:"10px",color:T.text}}>{step.title}</h4>
                <p style={{color:T.muted,fontSize:"0.82rem",lineHeight:1.7}}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE WORK ── */}
      <section id="live-work" ref={liveRef} style={{padding:"80px 6% 100px",background:T.bg,borderTop:`1px solid ${T.border}`,transition:"background 0.4s"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div className={`rv${liveIn?" in":""}`} style={{marginBottom:"60px"}}>
            <p style={{fontSize:"0.66rem",fontWeight:400,letterSpacing:"0.22em",textTransform:"uppercase",color:"#f07127",marginBottom:"14px"}}>Proof, Not Promises</p>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:"16px"}}>
              <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(1.9rem,3.2vw,2.9rem)",letterSpacing:"0.04em",lineHeight:1.1,color:T.text}}>Real websites. Real clients.<br/><em style={{fontStyle:"normal",color:"#f07127"}}>Open any of them right now.</em></h2>
              <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:"#4ade80",display:"inline-block",boxShadow:"0 0 8px #4ade80",animation:"cursorblink 2s ease-in-out infinite"}}/>
                <span style={{color:T.muted,fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase"}}>All systems live</span>
              </div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1px",background:T.border}} className="g3">
            {[
              {name:"NestCraft Interiors",url:"https://nestcraft.in",cat:"Interior Design",stack:["React","Tailwind","Framer"],color:"#8b5cf6",score:99,desc:"High-end interior studio with 3D room walkthrough and lead capture.",stat:"3× more inquiries in week 1",tag:"E-Commerce + Lead Gen"},
              {name:"Bloom Skincare",url:"https://bloomskincare.in",cat:"Beauty & Wellness",stack:["Next.js","Shopify","SEO"],color:"#ec4899",score:97,desc:"Full e-commerce store with custom product pages and influencer landing zones.",stat:"14% conversion rate",tag:"Online Store"},
              {name:"Apex Ventures",url:"https://apexventures.co.in",cat:"Finance & Consulting",stack:["Vue","GSAP","Node"],color:"#22d3ee",score:100,desc:"Premium consulting firm website with animated case studies and booking system.",stat:"Top 3 Google Jaipur",tag:"Corporate + SEO"},
              {name:"FreshBite Cloud Kitchen",url:"https://freshbite.in",cat:"Food & Beverage",stack:["React","Firebase","PWA"],color:"#f59e0b",score:98,desc:"PWA ordering platform with real-time order tracking and loyalty rewards.",stat:"2,400 orders in month 1",tag:"SaaS + PWA"},
              {name:"LegalEdge Advisors",url:"https://legaledge.in",cat:"Legal Services",stack:["WordPress","Custom CSS","CRM"],color:"#f07127",score:96,desc:"Multi-practice law firm with automated consultation booking and case portal.",stat:"60% fewer phone calls",tag:"Professional Services"},
              {name:"ZenFit Studios",url:"https://zenfit.in",cat:"Health & Fitness",stack:["Next.js","Stripe","Auth"],color:"#4ade80",score:99,desc:"Membership platform with class scheduling, trainer profiles, and payment integration.",stat:"800 memberships in 6 weeks",tag:"Membership Platform"},
            ].map((proj,i)=>(
              <div key={proj.name} className={`rv${liveIn?" in":""}`} style={{transitionDelay:`${i*0.08}s`,background:T.card,overflow:"hidden",position:"relative",cursor:"pointer",transition:"transform 0.35s,box-shadow 0.35s,background 0.4s"}}
                onMouseOver={e=>{e.currentTarget.style.transform="translateY(-6px)";e.currentTarget.style.boxShadow=dark?"0 20px 60px rgba(240,113,39,0.12)":"0 20px 60px rgba(0,0,0,0.12)"}} onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=""}}>
                <div style={{background:dark?"#111":T.bg3,padding:"8px 12px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:"6px",transition:"background 0.4s"}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:"#ff5f57"}}/><div style={{width:7,height:7,borderRadius:"50%",background:"#febc2e"}}/><div style={{width:7,height:7,borderRadius:"50%",background:"#28c840"}}/>
                  <div style={{flex:1,background:dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)",borderRadius:3,padding:"2px 8px",marginLeft:6,display:"flex",alignItems:"center",gap:5}}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="rgba(240,113,39,0.5)" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
                    <span style={{fontFamily:"'Courier New',monospace",fontSize:"0.58rem",color:"rgba(240,113,39,0.6)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{proj.url}</span>
                  </div>
                  <span style={{width:5,height:5,borderRadius:"50%",background:"#4ade80",boxShadow:"0 0 4px #4ade80"}}/>
                  <span style={{fontSize:"0.52rem",color:"#4ade80",fontFamily:"'Courier New',monospace"}}>LIVE</span>
                </div>
                <div style={{height:160,background:dark?"linear-gradient(135deg,#0a0a0a,#111)":"linear-gradient(135deg,#ede8e2,#e4dfd8)",position:"relative",overflow:"hidden",borderBottom:`1px solid ${T.border}`,transition:"background 0.4s"}}>
                  <div style={{position:"absolute",inset:0,padding:"14px 16px",display:"flex",flexDirection:"column",gap:8}}>
                    <div style={{height:28,background:`linear-gradient(90deg,${proj.color}22,${proj.color}08)`,borderRadius:3,display:"flex",alignItems:"center",padding:"0 10px",gap:6}}>
                      <div style={{width:12,height:12,borderRadius:"50%",background:proj.color,opacity:0.7}}/>
                      <div style={{height:4,width:"40%",background:proj.color,opacity:0.3,borderRadius:2}}/>
                      <div style={{marginLeft:"auto",display:"flex",gap:4}}>{[1,2,3].map(x=><div key={x} style={{height:3,width:20,background:dark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)",borderRadius:2}}/>)}</div>
                    </div>
                    <div style={{display:"flex",gap:8,flex:1}}>
                      <div style={{flex:2,display:"flex",flexDirection:"column",gap:5}}>
                        <div style={{height:5,width:"85%",background:dark?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)",borderRadius:2}}/>
                        <div style={{height:5,width:"60%",background:proj.color,opacity:0.4,borderRadius:2}}/>
                        <div style={{height:4,width:"90%",background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",borderRadius:2}}/>
                        <div style={{height:4,width:"75%",background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",borderRadius:2}}/>
                        <div style={{marginTop:6,height:18,width:70,background:proj.color,opacity:0.8,borderRadius:2}}/>
                      </div>
                      <div style={{flex:1,background:`${proj.color}15`,borderRadius:4,border:`1px solid ${proj.color}30`}}/>
                    </div>
                    <div style={{display:"flex",gap:6}}>{[1,2,3].map(x=><div key={x} style={{flex:1,height:20,background:dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.05)",borderRadius:2,border:`1px solid ${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.08)"}`}}/>)}</div>
                  </div>
                  <div style={{position:"absolute",left:0,right:0,height:"1px",background:`linear-gradient(90deg,transparent,${proj.color}50,transparent)`,animation:`scanline ${3+i*0.5}s linear infinite`,animationDelay:`${i*0.4}s`}}/>
                  <div style={{position:"absolute",top:8,right:8,background:dark?"rgba(0,0,0,0.7)":"rgba(255,255,255,0.85)",border:`1px solid ${proj.score>=98?"#4ade80":proj.score>=96?"#facc15":"#f07127"}`,borderRadius:4,padding:"2px 6px",display:"flex",alignItems:"center",gap:3}}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill={proj.score>=98?"#4ade80":proj.score>=96?"#facc15":"#f07127"}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    <span style={{fontSize:"0.58rem",color:proj.score>=98?"#4ade80":proj.score>=96?"#facc15":"#f07127",fontFamily:"'Courier New',monospace"}}>{proj.score}</span>
                  </div>
                </div>
                <div style={{padding:"18px 20px 20px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div>
                      <h3 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.95rem",letterSpacing:"0.06em",marginBottom:2,color:T.text}}>{proj.name}</h3>
                      <div style={{fontSize:"0.65rem",color:"#f07127",letterSpacing:"0.12em",textTransform:"uppercase"}}>{proj.tag}</div>
                    </div>
                    <div style={{background:`${proj.color}18`,border:`1px solid ${proj.color}35`,borderRadius:3,padding:"2px 7px",fontSize:"0.58rem",color:proj.color,letterSpacing:"0.08em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{proj.cat}</div>
                  </div>
                  <p style={{color:T.muted,fontSize:"0.75rem",lineHeight:1.6,marginBottom:12}}>{proj.desc}</p>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
                    {proj.stack.map(s=><span key={s} style={{background:"rgba(240,113,39,0.08)",border:"1px solid rgba(240,113,39,0.18)",borderRadius:3,padding:"1px 6px",fontSize:"0.6rem",color:"#f07127",fontFamily:"'Courier New',monospace"}}>{s}</span>)}
                  </div>
                  <div style={{borderTop:`1px solid ${T.border}`,paddingTop:10,display:"flex",alignItems:"center",gap:6}}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/></svg>
                    <span style={{color:"#4ade80",fontSize:"0.68rem",letterSpacing:"0.06em"}}>{proj.stat}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={`rv${liveIn?" in":""}`} style={{marginTop:"40px",textAlign:"center",transitionDelay:"0.5s"}}>
            <p style={{color:T.muted,fontSize:"0.78rem",marginBottom:"20px"}}>Every one of these sites was built in under 72 hours. Every one is still converting today.</p>
            <button onClick={()=>go("contact")} style={{display:"inline-flex",alignItems:"center",gap:10,background:"transparent",color:T.text,border:`1px solid ${dark?"rgba(242,238,234,0.18)":"rgba(26,16,8,0.2)"}`,padding:"15px 40px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.85rem",fontWeight:500,letterSpacing:"0.16em",textTransform:"uppercase",cursor:"pointer",transition:"border-color 0.3s,color 0.3s"}}
              onMouseOver={e=>{e.currentTarget.style.borderColor="#f07127";e.currentTarget.style.color="#f07127"}} onMouseOut={e=>{e.currentTarget.style.borderColor=dark?"rgba(242,238,234,0.18)":"rgba(26,16,8,0.2)";e.currentTarget.style.color=T.text}}>I Want Results Like These &nbsp;→</button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="results" ref={testRef} style={{padding:"100px 6%",background:T.bg,transition:"background 0.4s"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div className={`rv${testIn?" in":""}`} style={{marginBottom:"60px"}}>
            <p style={{fontSize:"0.66rem",fontWeight:600,letterSpacing:"0.22em",textTransform:"uppercase",color:"#f07127",marginBottom:"14px"}}>Real Results. Real Clients.</p>
            <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(1.9rem,3.2vw,2.9rem)",fontWeight:500,lineHeight:1.15,color:T.text}}>Don't take our word for it —<br/><em style={{fontStyle:"italic",color:"#f07127"}}>take theirs.</em></h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1px"}} className="g3">
            {testimonials.map((t,i)=>(
              <div key={i} className={`rv${testIn?" in":""}`} style={{transitionDelay:`${i*0.12}s`,background:T.bg2,border:`1px solid ${T.border}`,padding:"36px 28px",transition:"border-color 0.35s,transform 0.35s,background 0.4s",boxShadow:T.shadow}}
                onMouseOver={e=>{e.currentTarget.style.borderColor="rgba(240,113,39,0.4)";e.currentTarget.style.transform="translateY(-5px)"}} onMouseOut={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.transform=""}}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"3.5rem",fontWeight:600,color:"#f07127",opacity:0.2,lineHeight:1,marginBottom:"14px",userSelect:"none"}}>&ldquo;</div>
                <p style={{color:T.muted,lineHeight:1.82,fontSize:"0.88rem",marginBottom:"26px",fontStyle:"italic"}}>{t.quote}</p>
                <div style={{borderTop:`1px solid ${T.border}`,paddingTop:"18px"}}>
                  <div style={{fontWeight:600,fontSize:"0.86rem",marginBottom:"3px",color:T.text}}>{t.name}</div>
                  <div style={{color:T.muted,fontSize:"0.74rem",marginBottom:"10px"}}>{t.role}</div>
                  <div style={{display:"flex",gap:"3px"}}>{[...Array(5)].map((_,j)=><svg key={j} width="11" height="11" viewBox="0 0 24 24" fill="#f07127"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section id="contact" ref={ctaRef} style={{position:"relative",background:T.bg2,borderTop:`1px solid ${T.border}`,overflow:"hidden",transition:"background 0.4s"}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"80px 6% 100px",position:"relative",zIndex:2}}>
          <div className={`rv${ctaIn?" in":""}`} style={{marginBottom:"56px",maxWidth:520}}>
            <p style={{fontSize:"0.66rem",fontWeight:600,letterSpacing:"0.22em",textTransform:"uppercase",color:"#f07127",marginBottom:"14px"}}>Last Step</p>
            <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(2rem,4.5vw,3.8rem)",fontWeight:500,lineHeight:1.1,color:T.text}}>Stop losing customers<br/>to a website that<br/><em style={{fontStyle:"italic",color:"#f07127"}}>isn't good enough.</em></h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"60px",alignItems:"start"}} className="g2">
  

            <div className={`rv${ctaIn?" in":""}`} style={{transitionDelay:"0.1s"}}>
              <p style={{color:T.muted,lineHeight:1.9,fontSize:"0.9rem",marginBottom:"10px"}}>Book your <strong style={{color:T.text}}>free strategy call</strong> right now. Within 2 hours our team will reach out.</p>
              <p style={{color:"rgba(240,113,39,0.7)",fontSize:"0.82rem",fontStyle:"italic",marginBottom:"28px"}}>No hard sell. No agency jargon. Just a direct conversation about what's costing you leads — and how fast we can fix it.</p>
              {["Free strategy session — we come prepared","You see real mockups before paying anything","Website live within 72 hours of green light","30-day post-launch support, no extra charge"].map(item=>(
                <div key={item} style={{display:"flex",gap:"14px",alignItems:"center",fontSize:"0.84rem",marginBottom:"13px"}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f07127" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                  <span style={{color:T.text}}>{item}</span>
                </div>
              ))}
              <div style={{marginTop:"36px",padding:"22px 24px",border:`1px solid ${T.border}`,display:"flex",gap:"16px",alignItems:"center",background:T.bg,transition:"background 0.4s"}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#f07127"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <div>
                  <div style={{fontSize:"0.66rem",color:T.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"3px"}}>Prefer WhatsApp? Message us now</div>
                  <a href="https://wa.me/917878584866" style={{color:"#f07127",fontSize:"0.95rem",fontWeight:600,textDecoration:"none"}}>+91 78785 84866</a>
                </div>
              </div>
            </div>
            <div className={`rv${ctaIn?" in":""}`} style={{transitionDelay:"0.2s"}}>
              {!submitted ? (
                <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                  {[["name","Your Full Name","text"],["email","Email Address","email"],["business","Business / Brand Name","text"],["phone","WhatsApp Number","tel"]].map(([key,ph,type])=>(
                    <input key={key} type={type} placeholder={ph} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}
                      style={{width:"100%",background:dark?"rgba(242,238,234,0.03)":"rgba(26,16,8,0.04)",border:`1px solid ${T.border}`,padding:"15px 20px",color:T.text,fontFamily:"'Barlow',sans-serif",fontSize:"0.9rem",fontWeight:400,outline:"none",transition:"border-color 0.3s,background 0.4s"}}
                      onFocus={e=>e.target.style.borderColor="#f07127"} onBlur={e=>e.target.style.borderColor=T.border}/>
                  ))}
                  <button onClick={()=>{if(form.name&&form.email)setSubmitted(true);}} style={{marginTop:"8px",display:"flex",justifyContent:"center",alignItems:"center",gap:8,background:"#f07127",color:"#0f0f0f",border:"none",padding:"17px 24px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.82rem",fontWeight:500,letterSpacing:"0.16em",textTransform:"uppercase",cursor:"pointer",transition:"background 0.3s"}}
                    onMouseOver={e=>e.currentTarget.style.background="#e8621a"} onMouseOut={e=>e.currentTarget.style.background="#f07127"}>Get My Free Strategy Session &nbsp;→</button>
                  <p style={{textAlign:"center",color:T.muted,fontSize:"0.7rem",marginTop:"4px"}}>Takes 30 seconds. Zero obligation. We respond in under 2 hours.</p>
                </div>
              ) : (
                <div style={{border:`1px solid ${T.border}`,padding:"60px 40px",textAlign:"center",position:"relative",overflow:"hidden",background:T.bg,transition:"background 0.4s"}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,#f07127,transparent)"}}/>
                  <div style={{width:40,height:1,background:"#f07127",margin:"0 auto 24px"}}/>
                  <h3 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"1.8rem",fontWeight:500,marginBottom:"12px",color:T.text}}>You're locked in, {form.name}.</h3>
                  <p style={{color:T.muted,lineHeight:1.75,fontSize:"0.88rem"}}>Our team will call or message you within <strong style={{color:T.text}}>2 hours</strong>. Check your WhatsApp.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{padding:"40px 6%",borderTop:`1px solid ${T.border}`,background:T.bg,transition:"background 0.4s"}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"20px"}}>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"1.15rem",fontWeight:500,marginBottom:"4px",color:T.text}}>Brand<em style={{fontStyle:"italic",color:"#f07127"}}>Buzzer</em></div>
            <div style={{color:T.muted,fontSize:"0.72rem"}}>Your Competitors Already Have a Great Website. Do You?</div>
          </div>
          <div style={{color:T.muted,fontSize:"0.72rem",textAlign:"center",lineHeight:1.8}}>
            <div>D-186-A, Bhrigu Marg, Bani Park, Jaipur, Rajasthan 302016</div>
            <div>brandbuzzersocial@gmail.com · +91 78785 84866</div>
          </div>
          <div style={{color:T.muted,fontSize:"0.72rem"}}>&copy; 2025 Brand Buzzer. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
