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
  const [activeP, setActiveP] = useState(0);

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
    {n:".01",title:"Landing Machines That Convert",desc:"One page. One goal. Maximum ROI. We don't just build pages; we build high-performance sales engines that turn traffic into profit while your competitors are still 'loading'.",icon:"M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM13 2v7h7M9 13h6M9 17h3"},
    {n:".02",title:"Authority-Driven Business Sites",desc:"Your website is your digital handshake. We make sure yours is firm, premium, and impossible to ignore. Built to make you the only logical choice in your market.",icon:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10"},
    {n:".03",title:"High-Scale E-Commerce",desc:"Frictionless checkouts and trust-engineered product pages. We've taken stores from zero to ₹10L in 30 days. Don't just sell; dominate your category.",icon:"M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"},
    {n:".04",title:"Premium Personal Branding",desc:"For consultants and high-ticket service providers. Position yourself as the elite option and command the prices you actually deserve.",icon:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"},
    {n:".05",title:"Revenue-First Redesigns",desc:"If your current site isn't making you money, it's garbage. We take your legacy site and weaponize it into a modern, leads-generating asset.",icon:"M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"},
    {n:".06",title:"Aggressive SEO & Domination",desc:"If you're not on Page 1, you don't exist. Our SEO retainers don't just 'help' — they ensure you own the keywords your customers are searching for.",icon:"M22 12A10 10 0 1 1 12 2a10 10 0 0 1 10 10zM12 6v6l4 2"},
  ];

  const projects = [
    {name:"Fokal Lamps",url:"https://fokallamps.com",cat:"Luxury E-Commerce",stack:["React","Shopify","Node"],color:"#fbbf24",score:99,desc:"High-end architectural lighting store with a focus on minimalist aesthetics and conversion-driven product storytelling.",stat:"400% sales increase in 60 days",tag:"D2C Lighting Brand"},
    {name:"Surat Sales",url:"https://suratsales.in",cat:"B2B E-Commerce",stack:["Next.js","PostgreSQL","Vercel"],color:"#38bdf8",score:98,desc:"Bulk electronics distribution platform with real-time inventory and dealer portal.",stat:"₹40L revenue in month 1",tag:"B2B Marketplace"},
    {name:"Mahadev Villa",url:"https://hotelmahadevvilla.com",cat:"Luxury Hospitality",stack:["Next.js","Stripe","Sanity"],color:"#fb923c",score:99,desc:"Boutique luxury villa website with integrated booking engine and high-fidelity room galleries.",stat:"85% increase in direct bookings",tag:"Boutique Hotel + Booking"},
    {name:"Stayra",url:"https://stayra.co",cat:"Real Estate SaaS",stack:["React","Node.js","AWS"],color:"#6366f1",score:98,desc:"Modern property management and vacation rental platform with automated booking and host dashboard.",stat:"120+ bookings in Month 1",tag:"Rental Marketplace"},
    {name:"Singh Billiards",url:"https://singh-billiards.vercel.app/",cat:"Luxury Manufacturing",stack:["Next.js","Framer","GSAP"],color:"#fbbf24",score:100,desc:"High-end manufacturing website for premium billiards and snooker tables with luxury design and scroll-triggered animations.",stat:"10× more leads via website",tag:"Heritage Brand"},
    {name:"NestCraft Interiors",url:"https://nestcraft.in",cat:"Interior Design",stack:["React","Tailwind","Framer"],color:"#8b5cf6",score:99,desc:"High-end interior studio with 3D room walkthrough and lead capture.",stat:"3× more inquiries in week 1",tag:"E-Commerce + Lead Gen"},
    {name:"Bloom Skincare",url:"https://bloomskincare.in",cat:"Beauty & Wellness",stack:["Next.js","Shopify","SEO"],color:"#ec4899",score:97,desc:"Full e-commerce store with custom product pages and influencer landing zones.",stat:"14% conversion rate",tag:"Online Store"},
    {name:"Apex Ventures",url:"https://apexventures.co.in",cat:"Finance & Consulting",stack:["Vue","GSAP","Node"],color:"#22d3ee",score:100,desc:"Premium consulting firm website with animated case studies and booking system.",stat:"Top 3 Google Jaipur",tag:"Corporate + SEO"},
    {name:"FreshBite Cloud Kitchen",url:"https://freshbite.in",cat:"Food & Beverage",stack:["React","Firebase","PWA"],color:"#f59e0b",score:98,desc:"PWA ordering platform with real-time order tracking and loyalty rewards.",stat:"2,400 orders in month 1",tag:"SaaS + PWA"},
    {name:"ZenFit Studios",url:"https://zenfit.in",cat:"Health & Fitness",stack:["Next.js","Stripe","Auth"],color:"#4ade80",score:99,desc:"Membership platform with class scheduling, trainer profiles, and payment integration.",stat:"800 memberships in 6 weeks",tag:"Membership Platform"},
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
    @keyframes floatAvatar{
      0%  {transform:translateY(0px)   rotate(-0.4deg);filter:drop-shadow(0 10px 30px rgba(240,113,39,0.2))}
      50% {transform:translateY(-3px)  rotate(0.4deg); filter:drop-shadow(0 15px 35px rgba(240,113,39,0.3))}
      100%{transform:translateY(0px)   rotate(-0.4deg);filter:drop-shadow(0 10px 30px rgba(240,113,39,0.2))}
    }
    @keyframes avatarRingPulse{
      0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.15}
      50%{transform:translate(-50%,-50%) scale(1.08);opacity:0.06}
    }
    .rv{opacity:0;transform:translateY(28px);transition:opacity 0.85s ease,transform 0.85s ease}
    .rv.in{opacity:1;transform:translateY(0)}
    .srv-row{position:relative;display:flex;align-items:center;gap:40px;padding:48px 32px;border-bottom:1px solid var(--bdr);transition:all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);cursor:pointer;overflow:hidden}
    .srv-row:hover{background:rgba(240,113,39,0.03);padding-left:44px}
    .srv-icon-box{width:72px;height:72px;border-radius:20px;background:rgba(240,113,39,0.12);display:flex;align-items:center;justify-content:center;border:1px solid rgba(240,113,39,0.25);transition:all 0.4s;flex-shrink:0;box-shadow:0 10px 20px rgba(0,0,0,0.1)}
    .srv-row:hover .srv-icon-box{background:rgba(240,113,39,0.2);border-color:#f07127;transform:scale(1.05) rotate(0deg);box-shadow:0 0 30px rgba(240,113,39,0.3)}
    .srv-num{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:0.9rem;color:var(--mut);transition:all 0.4s;min-width:32px;opacity:0.4;letter-spacing:0.1em}
    .srv-row:hover .srv-num{color:#f07127;opacity:1}
    .srv-title{font-family:'Barlow Condensed',sans-serif;font-size:clamp(1.4rem,2.5vw,1.8rem);font-weight:600;margin-bottom:10px;color:var(--txt);transition:color 0.3s;letter-spacing:-0.01em}
    .srv-row:hover .srv-title{color:#f07127}
    .srv-desc{color:var(--mut);fontSize:0.95rem;lineHeight:1.75;maxWidth:80%;transition:color 0.3s}
    .srv-row:hover .srv-desc{color:var(--txt)}
    .srv-arrow{font-size:1.6rem;color:rgba(240,113,39,0.3);transition:all 0.4s ease}
    .srv-row:hover .srv-arrow{color:#f07127;transform:translateX(10px)}
    @keyframes spin3d{
      0%{transform:rotateY(0deg) translateY(0px)}
      25%{transform:rotateY(90deg) translateY(-8px)}
      50%{transform:rotateY(180deg) translateY(0px)}
      75%{transform:rotateY(270deg) translateY(8px)}
      100%{transform:rotateY(360deg) translateY(0px)}
    }
    .p-tab{position:relative;padding:12px 24px;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:0.9rem;font-weight:500;letter-spacing:0.05em;color:var(--mut);transition:all 0.3s;border-radius:8px;z-index:2}
    .p-tab.active{color:#f07127}
    .p-indicator{position:absolute;height:100%;background:rgba(240,113,39,0.08);border:1px solid rgba(240,113,39,0.2);border-radius:8px;transition:all 0.4s cubic-bezier(0.4,0,0.2,1);z-index:1}
    .mockup-frame{position:relative;width:100%;max-width:760px;margin:0 auto;background:#111;border-radius:12px 12px 0 0;padding:8px;border:4px solid #222;box-shadow:0 20px 80px rgba(0,0,0,0.4)}
    .mockup-content{width:100%;aspect-ratio:16/10;background:#000;overflow:hidden;position:relative}
    .mockup-base{width:820px;max-width:110%;height:10px;background:#333;margin:0 auto;border-radius:0 0 10px 10px;position:relative;box-shadow:0 10px 30px rgba(0,0,0,0.3)}
    @media(max-width:768px){.dnm{display:none!important}.g2{grid-template-columns:1fr!important}.g3{grid-template-columns:1fr!important}.g4{grid-template-columns:repeat(2,1fr)!important}.srow{flex-direction:column!important}.srv-row{flex-direction:column;align-items:flex-start;gap:16px;padding:30px 15px}}
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
        {/* glow orb */}
        <div style={{position:"absolute",right:"18%",top:"50%",transform:"translateY(-50%)",width:560,height:560,borderRadius:"50%",background:"radial-gradient(circle,rgba(240,113,39,0.12) 0%,transparent 65%)",pointerEvents:"none",zIndex:1}}/>
        {/* floating avatar */}
        <div style={{position:"absolute",right:"5%",top:"50%",transform:"translateY(-50%)",zIndex:3,pointerEvents:"none",display:"flex",alignItems:"center",justifyContent:"center",width:"42%",maxWidth:480}}>
          {/* pulsing ring behind avatar */}
          <div style={{position:"absolute",top:"50%",left:"50%",width:"90%",paddingBottom:"90%",borderRadius:"50%",border:"1.5px solid rgba(240,113,39,0.35)",animation:"avatarRingPulse 4s ease-in-out infinite",zIndex:0}}/>
          <div style={{position:"absolute",top:"50%",left:"50%",width:"70%",paddingBottom:"70%",borderRadius:"50%",border:"1px solid rgba(240,113,39,0.18)",animation:"avatarRingPulse 4s ease-in-out infinite",animationDelay:"1s",zIndex:0}}/>
          <img
            src="/avatar.png"
            alt="Web developer avatar"
            style={{
              width:"100%",
              maxWidth:420,
              height:"auto",
              animation:"floatAvatar 4s ease-in-out infinite",
              position:"relative",
              zIndex:1,
              opacity: heroVis ? 1 : 0,
              transition:"opacity 1.2s ease 0.6s",
              mixBlendMode: "screen",
              filter: "contrast(1.1) brightness(1.1)",
            }}
          />
        </div>
        <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(${T.gridLine} 1px,transparent 1px),linear-gradient(90deg,${T.gridLine} 1px,transparent 1px)`,backgroundSize:"80px 80px",pointerEvents:"none",zIndex:0}}/>
        <div style={{position:"absolute",left:"-2%",bottom:"-10%",fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(8rem,20vw,20rem)",fontWeight:600,fontStyle:"italic",color:"transparent",WebkitTextStroke:`1px ${T.wmColor}`,lineHeight:1,pointerEvents:"none",userSelect:"none",zIndex:0}}>WEB</div>
        <div style={{position:"relative",zIndex:2,maxWidth:580}}>
          <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"36px",opacity:heroVis?1:0,transform:heroVis?"none":"translateY(14px)",transition:"all 0.9s ease 0.1s"}}>
            <div style={{width:32,height:1,background:"#f07127"}}/>
            <span style={{fontSize:"0.68rem",fontWeight:600,letterSpacing:"0.2em",textTransform:"uppercase",color:"#f07127"}}>India's Fastest Web Studio · Brand Buzzer</span>
          </div>
          <h1 style={{fontFamily:"Impact, sans-serif",fontSize:"clamp(2.5rem,5vw,4.5rem)",fontWeight:400,lineHeight:1.1,letterSpacing:"-0.01em",marginBottom:"28px",textTransform:"uppercase",opacity:heroVis?1:0,transform:heroVis?"none":"translateY(24px)",transition:"all 0.9s ease 0.2s",color:T.text}}>
            Your website is<br/><em style={{color:"#f07127",fontStyle:"normal"}}>losing you money</em><br/>every single day<br/>it's not live.
          </h1>
          <p style={{color:T.muted,fontSize:"clamp(0.9rem,1.5vw,1.06rem)",lineHeight:1.88,maxWidth:460,marginBottom:"20px",opacity:heroVis?1:0,transition:"all 0.9s ease 0.38s"}}>
            We build premium, conversion-engineered websites in <strong style={{color:T.text}}>48–72 hours</strong> — not weeks.
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
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",zIndex:2,perspective:1000}}>
            <img
              src="/dollar.png"
              alt="Revenue machine symbol"
              style={{
                width: 140,
                height: "auto",
                position: "absolute",
                top: "-120px",
                left: "calc(50% - 70px)",
                opacity: 0.15,
                animation: "spin3d 8s linear infinite",
                pointerEvents: "none",
                filter: "blur(1px) contrast(1.2) brightness(1.2)",
              }}
            />
            <p style={{fontSize:"0.66rem",fontWeight:600,letterSpacing:"0.22em",textTransform:"uppercase",color:"#f07127",marginBottom:"8px"}}>The Brand Buzzer Advantage</p>
            <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(1.6rem,3vw,2.6rem)",fontWeight:500,lineHeight:1.15,whiteSpace:"nowrap",color:T.text}}>
              We Don't Just Build Sites. We Build <em style={{fontStyle:"italic",color:"#f07127"}}>Profit Engines.</em>
            </h2>
          </div>
        </div>
        <div style={{padding:"80px 6%",background:T.bg,transition:"background 0.4s"}}>
          <div style={{maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"80px",alignItems:"start"}} className="g2">
            <div className={`rv${aboutIn?" in":""}`}>
              <p style={{color:T.muted,lineHeight:1.9,fontSize:"0.92rem",marginBottom:"18px"}}>Most websites are <strong style={{color:T.text}}>expensive liabilities</strong>. They load slow, look cheap, and repel your best customers without you even knowing it.</p>
              <p style={{color:T.muted,lineHeight:1.9,fontSize:"0.92rem",marginBottom:"36px"}}>Brand Buzzer is the "Unfair Advantage" for 600+ businesses. We eliminate the friction between your traffic and your bank account. <strong style={{color:T.text}}>Fast delivery. Zero excuses. Maximum impact.</strong></p>
              {["Custom code, zero bloated templates","High-fidelity designs in 24 hours","Launch-ready assets in 48-72 hours","Rank Page 1 or we keep working for free"].map(item=>(
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
              <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(1.9rem,3.2vw,2.9rem)",fontWeight:500,lineHeight:1.15,color:T.text}}>Engineered to <em style={{fontStyle:"italic",color:"#f07127"}}>Outrank</em>,<br/>Outperform, & Outlast<br/>Your Competition.</h2>
              <p style={{color:T.muted,maxWidth:320,fontSize:"0.86rem",lineHeight:1.75}}>We don't do "pretty" for the sake of it. We do "effective" for the sake of your bottom line.</p>
            </div>
          </div>
          <div style={{borderTop:`1px solid ${T.border}`}}>
            {services.map((s,i)=>(
              <div key={s.n} className={`rv${servIn?" in":""} srv-row`} style={{transitionDelay:`${i*0.07}s`, "--bdr": T.border, "--mut": T.muted, "--txt": T.text}}>
                <div style={{position:"absolute",left:0,top:0,bottom:0,width:0,background:"linear-gradient(90deg,rgba(240,113,39,0.05),transparent)",transition:"width 0.6s"}} className="srv-reveal"/>
                
                <div className="srv-icon-box">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f07127" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={s.icon}/>
                  </svg>
                </div>

                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:"12px",marginBottom:"8px"}}>
                    <span className="srv-num">{s.n}</span>
                    <h3 className="srv-title" style={{margin:0}}>{s.title}</h3>
                  </div>
                  <p className="srv-desc">{s.desc}</p>
                </div>

                <span className="srv-arrow">→</span>
                <style>{`
                  .srv-row:hover .srv-reveal { width: 100% !important; }
                `}</style>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section id="process" ref={procRef} style={{padding:"80px 6% 100px",background:T.bg2,borderTop:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`,transition:"background 0.4s"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div className={`rv${procIn?" in":""}`} style={{marginBottom:"64px",textAlign:"center"}}>
            <p style={{fontSize:"0.66rem",fontWeight:600,letterSpacing:"0.22em",textTransform:"uppercase",color:"#f07127",marginBottom:"14px"}}>The Velocity Framework</p>
            <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(1.9rem,3.2vw,2.9rem)",fontWeight:500,lineHeight:1.15,color:T.text}}>The 72-Hour Sprint to <em style={{fontStyle:"italic",color:"#f07127"}}>Market Dominance.</em></h2>
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

          <div className={`rv${liveIn?" in":""}`} style={{marginBottom:"40px",position:"relative",display:"flex",background:dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)",padding:"4px",borderRadius:"14px",width:"100%",maxWidth:800,margin:"0 auto 50px",border:`1px solid ${T.border}`}}>
            <div className="p-indicator" style={{width:`calc(100% / ${projects.length})`, left: `calc(${activeP} * (100% / ${projects.length}))`, height:"calc(100% - 8px)", top:4, borderRadius:"10px" }}/>
            {projects.map((p,i)=>(
              <div key={p.name} className={`p-tab ${activeP===i?"active":""}`} onClick={()=>setActiveP(i)} style={{flex:1,textAlign:"center",zIndex:2,position:"relative",padding:"14px 0"}}>
                {p.name}
              </div>
            ))}
          </div>

          <div className={`rv${liveIn?" in":""}`} style={{display:"flex",gap:"40px",alignItems:"flex-start"}} className="g2">
            {/* Left: Preview */}
            <div style={{flex:1.4, minWidth:0}}>
              <div className="mockup-frame" style={{maxWidth:"100%"}}>
                <div className="mockup-content">
                  <div style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",transition:"transform 0.6s cubic-bezier(0.4,0,0.2,1)",transform:`translateX(-${activeP*100}%)`,display:"flex"}}>
                    {projects.map((p,i)=>(
                      <div key={i} style={{minWidth:"100%",height:"100%",position:"relative"}}>
                        <iframe 
                          src={p.url} 
                          style={{width:"200%",height:"200%",border:"none",transform:"scale(0.5)",transformOrigin:"0 0"}} 
                          title={p.name}
                        />
                        <div style={{position:"absolute",inset:0,background:"transparent"}} onClick={()=>window.open(p.url,"_blank")}/>
                        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:T.bg2,zIndex:-1}}>
                          <div style={{textAlign:"center"}}>
                            <p style={{color:T.muted,fontSize:"0.8rem",marginBottom:"8px"}}>Previewing {p.url}</p>
                            <button style={{color:"#f07127",background:"transparent",border:"1px solid #f07127",padding:"6px 12px",borderRadius:4,fontSize:"0.7rem",cursor:"pointer"}}>Open Live Site</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mockup-base" style={{width:"105%",margin:"0 -2.5%"}}/>
            </div>

            {/* Right: Details */}
            <div style={{flex:1, display:"flex", flexDirection:"column", gap:"20px"}}>
              <div style={{background:T.bg2,padding:"32px",borderRadius:16,border:`1px solid ${T.border}`,boxShadow:T.shadow}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"20px"}}>
                  <div>
                    <h3 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"1.6rem",fontWeight:600,color:T.text,marginBottom:"2px"}}>{projects[activeP].name}</h3>
                    <p style={{color:"#f07127",fontSize:"0.75rem",fontWeight:500,letterSpacing:"0.1em",textTransform:"uppercase"}}>{projects[activeP].tag}</p>
                  </div>
                  <div style={{background:projects[activeP].color+"22",color:projects[activeP].color,padding:"5px 10px",borderRadius:6,fontSize:"0.65rem",fontWeight:600,border:`1px solid ${projects[activeP].color}44`}}>
                    {projects[activeP].cat}
                  </div>
                </div>
                <p style={{color:T.muted,lineHeight:1.7,fontSize:"0.88rem",marginBottom:"24px"}}>{projects[activeP].desc}</p>
                <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                  {projects[activeP].stack.map(s=>(
                    <span key={s} style={{background:T.bg,padding:"5px 12px",borderRadius:6,fontSize:"0.65rem",color:T.text,border:`1px solid ${T.border}`,fontFamily:"'Courier New',monospace"}}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"16px",background:T.bg2,padding:"16px 20px",borderRadius:12,border:`1px solid ${T.border}`}}>
                  <div style={{width:44,height:44,borderRadius:10,background:"rgba(74,222,128,0.1)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(74,222,128,0.2)"}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/></svg>
                  </div>
                  <div>
                    <p style={{fontSize:"0.6rem",color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"2px"}}>Key Achievement</p>
                    <p style={{fontSize:"1rem",fontWeight:600,color:"#4ade80"}}>{projects[activeP].stat}</p>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"16px",background:T.bg2,padding:"16px 20px",borderRadius:12,border:`1px solid ${T.border}`}}>
                  <div style={{width:44,height:44,borderRadius:10,background:"rgba(240,113,39,0.1)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(240,113,39,0.2)"}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f07127" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  <div>
                    <p style={{fontSize:"0.6rem",color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"2px"}}>Performance Score</p>
                    <p style={{fontSize:"1rem",fontWeight:600,color:T.text}}>{projects[activeP].score}/100</p>
                  </div>
                </div>
              </div>

              <button onClick={()=>window.open(projects[activeP].url,"_blank")} style={{display:"inline-flex",justifyContent:"center",alignItems:"center",gap:10,background:"transparent",color:T.text,border:`1px solid ${T.border}`,padding:"14px 24px",borderRadius:8,fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.8rem",fontWeight:500,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",transition:"all 0.3s"}}
                onMouseOver={e=>{e.currentTarget.style.borderColor="#f07127";e.currentTarget.style.color="#f07127"}} onMouseOut={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.text}}>
                Visit Live Website &nbsp;↗
              </button>
            </div>
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
            <p style={{fontSize:"0.66rem",fontWeight:600,letterSpacing:"0.22em",textTransform:"uppercase",color:"#f07127",marginBottom:"14px"}}>Final Opportunity</p>
            <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(2rem,4.5vw,3.8rem)",fontWeight:500,lineHeight:1.1,color:T.text}}>Your Competitors Are<br/>Praying You Don't<br/><em style={{fontStyle:"italic",color:"#f07127"}}>Click This Button.</em></h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"60px",alignItems:"start"}} className="g2">
  

            <div className={`rv${ctaIn?" in":""}`} style={{transitionDelay:"0.1s"}}>
              <p style={{color:T.muted,lineHeight:1.9,fontSize:"0.9rem",marginBottom:"10px"}}>Stop "thinking about it" while others are taking your market share. Book your <strong style={{color:T.text}}>Free Strategy Call</strong> right now.</p>
              <p style={{color:"rgba(240,113,39,0.7)",fontSize:"0.82rem",fontStyle:"italic",marginBottom:"28px"}}>No fluff. No high-pressure sales. Just a direct look at the money you're leaving on the table.</p>
              {["Full strategy roadmap included","See custom mockups in 24 hours","Launch in 3 days, not 3 months","Lifetime 24/7 priority support"].map(item=>(
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
