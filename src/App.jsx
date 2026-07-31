import { useState, useEffect, useRef } from "react";
import { InlineWidget } from "react-calendly";
import "./App.css";

function useInView(t = 0.1) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: t });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, [t]);
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
    let cols = Math.floor(W / COL_W);
    let drops = Array.from({length: cols}, () => Math.random() * -50);
    let speeds = Array.from({length: cols}, () => 0.15 + Math.random() * 0.25);
    let brightCol = Array.from({length: cols}, () => Math.random() > 0.7);
    const mousePos = {x: -9999, y: -9999};

    const updatePos = (clientX, clientY) => {
      const r = canvas.getBoundingClientRect();
      mousePos.x = clientX - r.left;
      mousePos.y = clientY - r.top;
    };
    const onMouse = e => updatePos(e.clientX, e.clientY);
    const onTouch = e => {
      if (e.touches && e.touches[0]) {
        updatePos(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    canvas.addEventListener("mousemove", onMouse);
    canvas.addEventListener("touchstart", onTouch, { passive: true });
    canvas.addEventListener("touchmove", onTouch, { passive: true });

    const onResize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      cols = Math.floor(W / COL_W);
      drops = Array.from({length: cols}, () => Math.random() * -50);
      speeds = Array.from({length: cols}, () => 0.15 + Math.random() * 0.25);
      brightCol = Array.from({length: cols}, () => Math.random() > 0.7);
    };
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
    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener("mousemove", onMouse);
      canvas.removeEventListener("touchstart", onTouch);
      canvas.removeEventListener("touchmove", onTouch);
      window.removeEventListener("resize", onResize);
    };
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

    const updatePos = (clientX, clientY) => {
      const r = canvas.getBoundingClientRect();
      mousePos.x = clientX - r.left;
      mousePos.y = clientY - r.top;
    };
    const onMouse = e => updatePos(e.clientX, e.clientY);
    const onTouch = e => {
      if (e.touches && e.touches[0]) {
        updatePos(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    canvas.addEventListener("mousemove", onMouse);
    canvas.addEventListener("touchstart", onTouch, { passive: true });
    canvas.addEventListener("touchmove", onTouch, { passive: true });

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
    let frame;
    const isDark = theme === "dark";
    const draw = () => {
      frame = requestAnimationFrame(draw);
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
    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener("mousemove", onMouse);
      canvas.removeEventListener("touchstart", onTouch);
      canvas.removeEventListener("touchmove", onTouch);
      window.removeEventListener("resize", onResize);
    };
  }, [theme]);
  return <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />;
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
  }, [inView, target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

const MQ = ["627+ Websites Launched","48-Hour Delivery, Guaranteed","Zero Templates. 100% Custom.","Clients Report 3× More Leads","₹0 Upfront. Pay On Satisfaction.","627+ Websites Launched","48-Hour Delivery, Guaranteed","Zero Templates. 100% Custom.","Clients Report 3× More Leads","₹0 Upfront. Pay On Satisfaction."];

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
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("bb_theme") || "dark";
  });
  const dark = theme === "dark";

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("bb_theme", next);
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    document.body.style.backgroundColor = dark ? "#0f0f0f" : "#f5f2ee";
    document.body.style.color = dark ? "#f2eeea" : "#1a1008";
  }, [dark]);

  const [scrolled, setScrolled] = useState(false);
  const [heroVis, setHeroVis] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeP, setActiveP] = useState(0);

  const [aboutRef, aboutIn] = useInView();
  const [servRef, servIn] = useInView();
  const [procRef, procIn] = useInView();
  const [testRef, testIn] = useInView();
  const [ctaRef, ctaIn] = useInView();
  const [statsRef, statsIn] = useInView(0.2);
  const [liveRef, liveIn] = useInView(0.1);

  // Lock body scrolling when mobile navigation menu is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const t = setTimeout(() => setHeroVis(true), 80);
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => { clearTimeout(t); window.removeEventListener("scroll", onScroll); };
  }, []);

  // Touch Swipe for Project Showcase Carousel
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    if (e.targetTouches && e.targetTouches[0]) {
      touchStartX.current = e.targetTouches[0].clientX;
    }
  };

  const handleTouchMove = (e) => {
    if (e.targetTouches && e.targetTouches[0]) {
      touchEndX.current = e.targetTouches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 40) {
      setActiveP(prev => (prev + 1) % projects.length);
    } else if (diff < -40) {
      setActiveP(prev => (prev - 1 + projects.length) % projects.length);
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const go = id => document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });

  const T = {
    bg:       dark ? "#0f0f0f" : "#f5f2ee",
    bg2:      dark ? "#171717" : "#ece8e2",
    bg3:      dark ? "#1e1e1e" : "#e4dfd8",
    text:     dark ? "#f2eeea" : "#1a1008",
    muted:    dark ? "#6b6560" : "#8a7f75",
    border:   dark ? "rgba(240,113,39,0.14)" : "rgba(200,90,20,0.18)",
    navBg:    scrolled ? (dark ? "rgba(15,15,15,0.92)" : "rgba(245,242,238,0.94)") : "transparent",
    gridLine: dark ? "rgba(240,113,39,0.025)" : "rgba(200,90,20,0.06)",
    wmColor:  dark ? "rgba(240,113,39,0.04)" : "rgba(200,90,20,0.06)",
    card:     dark ? "#171717" : "#fff",
    shadow:   dark ? "none" : "0 2px 20px rgba(0,0,0,0.07)",
  };

  const services = [
    {n:".01",title:"Landing Machines That Convert",desc:"One page. One goal. Maximum ROI. We don't just build pages; we build high-performance sales engines that turn traffic into profit while your competitors are still 'loading'.",icon:"M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM13 2v7h7M9 13h6M9 17h3"},
    {n:".02",title:"Authority-Driven Business Sites",desc:"Your website is your digital handshake. We make sure yours is firm, premium, and impossible to ignore. Built to make you the only logical choice in your market.",icon:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10"},
    {n:".03",title:"High-Scale E-Commerce",desc:"Frictionless checkouts and trust-engineered product pages. We've taken stores from zero to ₹10L in 30 days. Don't just sell; dominate your category.",icon:"M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"},
    {n:".04",title:"Premium Personal Branding",desc:"For consultants and high-ticket service providers. Position yourself as the elite option and command the prices you actually deserve.",icon:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"},
    {n:".05",title:"Revenue-First Redesigns",desc:"If your current site isn't making you money, it's garbage. We take your legacy site and weaponize it into a modern, leads-generating asset.",icon:"M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"},
    {n:".06",title:"SEO That Actually Works",desc:"If you're not on Page 1, you might as well be invisible. Our SEO retainers get you there and keep you there. We focus on the keywords your customers are actually searching for.",icon:"M22 12A10 10 0 1 1 12 2a10 10 0 0 1 10 10zM12 6v6l4 2"},
  ];

  const projects = [
    {name:"Fokal Lamps",url:"https://fokallamps.com",cat:"Luxury E-Commerce",stack:["React","Tailwind","Vite"],color:"#fbbf24",score:99,desc:"High-end architectural lighting store with a focus on minimalist aesthetics and conversion-driven product storytelling.",stat:"400% sales increase in 60 days",tag:"D2C Lighting Brand"},
    {name:"Surat Sales",url:"https://suratsales.in",cat:"B2B E-Commerce",stack:["React","Tailwind","Vite"],color:"#38bdf8",score:98,desc:"Bulk electronics distribution platform with real-time inventory and dealer portal.",stat:"₹40L revenue in month 1",tag:"B2B Marketplace"},
    {name:"Mahadev Villa",url:"https://hotelmahadevvilla.com",cat:"Luxury Hospitality",stack:["React","GSAP","Tailwind"],color:"#fb923c",score:99,desc:"Boutique luxury villa website with integrated booking engine and high-fidelity room galleries.",stat:"85% increase in direct bookings",tag:"Boutique Hotel + Booking"},
    {name:"Stayra",url:"https://stayra.co",cat:"Real Estate SaaS",stack:["Next.js","React","Tailwind"],color:"#6366f1",score:98,desc:"Modern property management and vacation rental platform with automated booking and host dashboard.",stat:"120+ bookings in Month 1",tag:"Rental Marketplace"},
    {name:"Singh Billiards",url:"https://singhbilliards.com/",cat:"Luxury Manufacturing",stack:["React","Tailwind","Vite"],color:"#fbbf24",score:100,desc:"High-end manufacturing website for premium billiards and snooker tables with luxury design and scroll-triggered animations.",stat:"10× more leads via website",tag:"Heritage Brand"},
    {name:"Blando Studio",url:"https://blandostudiio.com/",cat:"Clothing E-Commerce",stack:["Shopify","Liquid","Bootstrap"],color:"#ec4899",score:98,desc:"Premium clothing brand storefront with curated collections, seamless checkout, and high-conversion product pages.",stat:"5× more inquiries in Month 1",tag:"Fashion Brand",screenshot:"/blando-preview.png"},
    {name:"Infusion Bizz",url:"https://infusionbizz.com/",cat:"Enterprise IT",stack:["React","Tailwind","Vite"],color:"#06b6d4",score:97,desc:"Full-scale business automation and IT consulting platform engineered for enterprise-level growth and scalability.",stat:"40% operational efficiency boost",tag:"IT Solutions"},
    {name:"Cnykra",url:"https://cnykra-web.vercel.app/",cat:"Fintech + Web3",stack:["Next.js","React","Tailwind"],color:"#8b5cf6",score:99,desc:"Advanced crypto-banking and digital asset management platform with real-time portfolio tracking and secure wallet integration.",stat:"₹20Cr+ transaction volume",tag:"Crypto Banking"},
  ];

  const testimonials = [
    {quote:"We sell premium architectural lamps and our old website looked like a free Wix template. Brand Buzzer completely transformed it. The new site actually feels as luxurious as our products. Customers comment on it all the time now.",name:"Fokal Lamps",role:"Founder, fokallamps.com"},
    {quote:"Running a boutique hotel, first impressions matter a lot. Our old site was driving guests to OTAs instead of booking directly with us. Brand Buzzer built us something that finally represents what Mahadev Villa actually is. Clean, warm, and trustworthy.",name:"Mahadev Villa",role:"Owner, hotelmahadevvilla.com"},
    {quote:"We've been making billiards tables for decades but our online presence was embarrassing. Brand Buzzer understood our heritage right away and built a site that carries the weight of that legacy. It's the first thing we're proud to show new clients.",name:"Singh Billiards",role:"Director, singhbilliards.com"},
  ];

  return (
    <div style={{fontFamily:"'Barlow','Arial Narrow',sans-serif",background:T.bg,color:T.text,overflowX:"hidden",minHeight:"100vh",transition:"background 0.4s,color 0.4s", "--bg": T.bg, "--txt": T.text, "--bdr": T.border}}>
      
      {/* ── NAV ── */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"0 6%",height:"68px",display:"flex",alignItems:"center",justifyContent:"space-between",background:T.navBg,backdropFilter:scrolled?"blur(20px)":"none",borderBottom:scrolled?`1px solid ${T.border}`:"none",transition:"all 0.4s"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px",cursor:"pointer"}} onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}>
          <img src="/logo.png" alt="BrandBuzzer Logo" style={{height:"40px",width:"auto"}} />
        </div>
        <div className="dnm" style={{display:"flex",gap:"28px",alignItems:"center"}}>
          {["Services","Process","Live Work","Results","Contact"].map(n=>(
            <button key={n} onClick={()=>go(n.toLowerCase().replace(" ","-"))} style={{background:"none",border:"none",color:T.muted,fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.8rem",fontWeight:500,letterSpacing:"0.14em",textTransform:"uppercase",cursor:"pointer",transition:"color 0.3s",padding:0}}
              onMouseOver={e=>e.target.style.color=T.text} onMouseOut={e=>e.target.style.color=T.muted}>{n}</button>
          ))}
          <ThemeToggle theme={theme} toggle={toggleTheme} />
          <button onClick={()=>go("contact")} style={{display:"inline-flex",alignItems:"center",gap:8,background:"#f07127",color:"#0f0f0f",border:"none",padding:"10px 22px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.72rem",fontWeight:500,letterSpacing:"0.16em",textTransform:"uppercase",cursor:"pointer",transition:"background 0.3s"}}
            onMouseOver={e=>e.currentTarget.style.background="#e8621a"} onMouseOut={e=>e.currentTarget.style.background="#f07127"}>Get a Website</button>
        </div>
        
        {/* Mobile Nav Toggle */}
        <div style={{display:"none", gap:"12px", alignItems:"center"}} className="hamburger-container">
           <ThemeToggle theme={theme} toggle={toggleTheme} />
           <button className={`hamburger ${mobileMenuOpen?"open":""}`} onClick={()=>setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle navigation menu">
             <span/><span/><span/>
           </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen?"open":""}`}>
        {["Services","Process","Live Work","Results","Contact"].map(n=>(
          <a key={n} href={`#${n.toLowerCase().replace(" ","-")}`} className="mobile-link" onClick={(e)=>{e.preventDefault(); go(n.toLowerCase().replace(" ","-")); setMobileMenuOpen(false);}}>{n}</a>
        ))}
        <div style={{marginTop:"15px", marginBottom:"5px"}}>
          <ThemeToggle theme={theme} toggle={toggleTheme} />
        </div>
        <button onClick={()=>{go("contact"); setMobileMenuOpen(false);}} style={{marginTop:"15px", background:"#f07127", color:"#0f0f0f", border:"none", padding:"16px 32px", fontFamily:"'Barlow Condensed',sans-serif", fontSize:"0.9rem", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer"}}>Get a Website</button>
      </div>

      {/* ══ HERO ══ */}
      <section className="hero-section" style={{position:"relative",minHeight:"100vh",display:"flex",alignItems:"center",padding:"100px 6% 100px",overflow:"hidden"}}>
        <div className="hero-background" style={{position:"absolute",right:"-4%",top:0,bottom:0,width:"56%",zIndex:0}}>
          <CodeMatrixRain theme={theme}/>
        </div>
        {/* glow orb */}
        <div style={{position:"absolute",right:"18%",top:"50%",transform:"translateY(-50%)",width:560,height:560,borderRadius:"50%",background:"radial-gradient(circle,rgba(240,113,39,0.12) 0%,transparent 65%)",pointerEvents:"none",zIndex:1}}/>
        {/* floating avatar */}
        <div className="hero-illustration" style={{position:"absolute",right:"5%",top:"50%",transform:"translateY(-50%)",zIndex:3,pointerEvents:"none",display:"flex",alignItems:"center",justifyContent:"center",width:"42%",maxWidth:480}}>
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
              mixBlendMode: dark ? "screen" : "normal",
              filter: "contrast(1.1) brightness(1.1)",
            }}
          />
        </div>
        <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(${T.gridLine} 1px,transparent 1px),linear-gradient(90deg,${T.gridLine} 1px,transparent 1px)`,backgroundSize:"80px 80px",pointerEvents:"none",zIndex:0}}/>
        <div style={{position:"absolute",left:"-2%",bottom:"-10%",fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(8rem,20vw,20rem)",fontWeight:600,fontStyle:"italic",color:"transparent",WebkitTextStroke:`1px ${T.wmColor}`,lineHeight:1,pointerEvents:"none",userSelect:"none",zIndex:0}}>WEB</div>
        <div className="hero-content" style={{position:"relative",zIndex:2,maxWidth:580}}>
          <div className="hero-sub-header" style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"36px",opacity:heroVis?1:0,transform:heroVis?"none":"translateY(14px)",transition:"all 0.9s ease 0.1s"}}>
            <div className="hero-sub-line" style={{width:32,height:1,background:"#f07127"}}/>
            <span style={{fontSize:"0.68rem",fontWeight:600,letterSpacing:"0.2em",textTransform:"uppercase",color:"#f07127"}}>India's Fastest Web Studio · Brand Buzzer</span>
          </div>
          <h1 className="hero-title" style={{fontFamily:"Impact, sans-serif",fontSize:"clamp(2.5rem,5vw,4.5rem)",fontWeight:400,lineHeight:1.1,letterSpacing:"-0.01em",marginBottom:"28px",textTransform:"uppercase",opacity:heroVis?1:0,transform:heroVis?"none":"translateY(24px)",transition:"all 0.9s ease 0.2s",color:T.text}}>
            Your website is<br/><em style={{color:"#f07127",fontStyle:"normal"}}>losing you money</em><br/>every single day<br/>it's not live.
          </h1>
          <p className="hero-desc" style={{color:T.muted,fontSize:"clamp(0.9rem,1.5vw,1.06rem)",lineHeight:1.88,maxWidth:460,marginBottom:"20px",opacity:heroVis?1:0,transition:"all 0.9s ease 0.38s"}}>
            We build premium, conversion-focused websites in <strong style={{color:T.text}}>48–72 hours.</strong> Not weeks. No waiting around.
          </p>

          <div className="hero-btns" style={{display:"flex",gap:"14px",flexWrap:"wrap",opacity:heroVis?1:0,transition:"all 0.9s ease 0.52s"}}>
            <button onClick={()=>go("contact")} style={{display:"inline-flex",alignItems:"center",gap:10,background:"#f07127",color:"#0f0f0f",border:"none",padding:"16px 36px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.85rem",fontWeight:500,letterSpacing:"0.16em",textTransform:"uppercase",cursor:"pointer",transition:"background 0.3s,transform 0.2s",clipPath:"polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))"}}
              onMouseOver={e=>{e.currentTarget.style.background="#e8621a";e.currentTarget.style.transform="translateY(-2px)"}} onMouseOut={e=>{e.currentTarget.style.background="#f07127";e.currentTarget.style.transform=""}}>Claim My Free Slot &nbsp;→</button>
            <button onClick={()=>go("services")} style={{display:"inline-flex",alignItems:"center",gap:10,background:"transparent",color:T.text,border:`1px solid ${dark?"rgba(242,238,234,0.18)":"rgba(26,16,8,0.2)"}`,padding:"15px 36px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.85rem",fontWeight:500,letterSpacing:"0.16em",textTransform:"uppercase",cursor:"pointer",transition:"border-color 0.3s,color 0.3s"}}
              onMouseOver={e=>{e.currentTarget.style.borderColor="#f07127";e.currentTarget.style.color="#f07127"}} onMouseOut={e=>{e.currentTarget.style.borderColor=dark?"rgba(242,238,234,0.18)":"rgba(26,16,8,0.2)";e.currentTarget.style.color=T.text}}>See What We Build</button>
          </div>
        </div>
        <div className="hero-stats" style={{position:"absolute",bottom:0,left:0,right:0,borderTop:`1px solid ${T.border}`,padding:"20px 6%",display:"flex",gap:"40px",flexWrap:"wrap",zIndex:2,opacity:heroVis?1:0,transition:"opacity 1.4s ease 0.8s",background:dark?"transparent":"rgba(245,242,238,0.7)"}}>
          {[["627+","Websites This Year"],["48h","Avg. Delivery"],["100%","Client Satisfaction"]].map(([v,l])=>(
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
            <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(1.6rem,3vw,2.6rem)",fontWeight:500,lineHeight:1.15,color:T.text}}>
              We Don't Just Build Sites. We Build <em style={{fontStyle:"italic",color:"#f07127"}}>Profit Engines.</em>
            </h2>
          </div>
        </div>
        <div style={{padding:"80px 6%",background:T.bg,transition:"background 0.4s"}}>
          <div style={{maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"80px",alignItems:"start"}} className="g2">
            <div className={`rv${aboutIn?" in":""}`}>
              <p style={{color:T.muted,lineHeight:1.9,fontSize:"0.92rem",marginBottom:"18px"}}>Most websites are quietly costing businesses money. They load too slow, look outdated, and push away the exact customers you're trying to reach.</p>
              <p style={{color:T.muted,lineHeight:1.9,fontSize:"0.92rem",marginBottom:"36px"}}>We've helped 600+ businesses fix this. Brand Buzzer builds websites that actually work for you, so there's less friction between your visitors and your revenue. <strong style={{color:T.text}}>Fast, honest, and built to last.</strong></p>
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
                  "Every day without a great website is a day handing customers to your competitors. We fix that in 72 hours. And if we don't deliver? <em style={{color:"#f07127"}}>You don't pay a single rupee.</em>"
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
        <div className="srow-container" style={{maxWidth:1200,margin:"0 auto",borderTop:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`,borderLeft:`1px solid ${T.border}`}}>
          <div style={{display:"flex"}} className="srow">
            {[{target:627,suffix:"+",label:"Sites Launched This Year"},{target:48,suffix:"h",label:"Avg. Delivery Time"},{target:100,suffix:"%",label:"On-Time, Every Time"},{target:50,suffix:"k+",label:"Leads Generated for Clients"}].map((s,i)=>(
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section id="process" ref={procRef} style={{padding:"90px 6% 110px",background:T.bg2,borderTop:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`,transition:"background 0.4s",position:"relative"}}>
        <div className="proc-wrapper">
          <div className={`rv${procIn?" in":""}`} style={{marginBottom:"64px",textAlign:"center"}}>
            <p style={{fontSize:"0.68rem",fontWeight:600,letterSpacing:"0.24em",textTransform:"uppercase",color:"#f07127",marginBottom:"14px"}}>The Velocity Framework</p>
            <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(2.1rem,3.8vw,3.2rem)",fontWeight:500,lineHeight:1.12,color:T.text}}>The 72-Hour Sprint to <em style={{fontStyle:"italic",color:"#f07127"}}>Market Dominance.</em></h2>
            <p style={{color:T.muted,maxWidth:540,margin:"14px auto 0",fontSize:"0.9rem",lineHeight:1.7}}>From initial strategy to a live, conversion-ready website in 3 focused days.</p>
          </div>

          <div className="proc-timeline-line"/>

          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"20px",position:"relative",zIndex:2}} className="g4">
            {[
              {
                n:"01",
                time:"Hour 0–2",
                title:"Discovery Call",
                desc:"A focused 30-min call where we dig into your goals, target audience, and biggest growth bottleneck.",
                icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f07127" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
              },
              {
                n:"02",
                time:"Hour 2–24",
                title:"Design in 24hrs",
                desc:"You wake up the next day to high-fidelity mockups of your full website. Most clients say 'yes' on the first revision.",
                icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f07127" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              },
              {
                n:"03",
                time:"Hour 24–48",
                title:"Built to Perform",
                desc:"Speed-optimised, mobile-perfect, SEO-ready code — handcrafted, never templated. Lighthouse 96+ guaranteed.",
                icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f07127" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              },
              {
                n:"04",
                time:"Hour 48–72",
                title:"Live & Growing",
                desc:"Your site goes live, you get full ownership, and we stay on call for 30 days to ensure everything converts.",
                icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f07127" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-3.05 11a22.35 22.35 0 0 1-3.95 2z"/></svg>
              }
            ].map((step,i)=>(
              <div 
                key={step.n} 
                className={`rv${procIn?" in":""} proc-card`} 
                style={{transitionDelay:`${i*0.12}s`, background: T.bg}}
              >
                <div className="proc-watermark">{step.n}</div>
                <div className="proc-chip">⚡ {step.time}</div>
                <div className="proc-icon-badge">
                  {step.icon}
                </div>
                <h4 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"1.25rem",fontWeight:600,marginBottom:"10px",color:T.text,letterSpacing:"-0.01em"}}>{step.title}</h4>
                <p style={{color:T.muted,fontSize:"0.84rem",lineHeight:1.75}}>{step.desc}</p>
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

          <div className={`p-tab-container rv${liveIn?" in":""}`} style={{marginBottom:"40px",position:"relative",display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"8px",background:dark?"rgba(255,255,255,0.02)":"rgba(0,0,0,0.02)",padding:"8px",borderRadius:"14px",width:"100%",maxWidth:850,margin:"0 auto 50px",border:`1px solid ${T.border}`}}>
            {projects.map((p,i)=>(
              <div key={p.name} className={`p-tab ${activeP===i?"active":""}`} onClick={()=>setActiveP(i)}>
                {p.name}
              </div>
            ))}
          </div>

          <div className={`p-dashboard rv${liveIn?" in":""}`} style={{display:"flex",gap:"40px",alignItems:"flex-start"}}>
            {/* Left: Preview */}
            <div className="p-preview-container" style={{flex:1.4, minWidth:0, width:"100%", position:"relative"}}>
              <button className="outside-nav-btn left" onClick={()=>setActiveP(prev=>(prev - 1 + projects.length) % projects.length)} aria-label="Previous project">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button className="outside-nav-btn right" onClick={()=>setActiveP(prev=>(prev + 1) % projects.length)} aria-label="Next project">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <div style={{width:"100%"}}>
                <div className="mockup-frame" style={{maxWidth:"100%"}}>
                  <div 
                    className="mockup-content"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",transition:"transform 0.5s cubic-bezier(0.4,0,0.2,1)",transform:`translateX(-${activeP*100}%)`,display:"flex"}}>
                      {projects.map((p,i)=>(
                        <div key={i} style={{minWidth:"100%",height:"100%",position:"relative",background:"#0d0d0d",display:"flex",flexDirection:"column",overflow:"hidden"}}>
                          {/* Browser Mockup Bar */}
                          <div style={{height:"28px",background:"#1a1a1a",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",padding:"0 12px",justify:"space-between",zIndex:3,flexShrink:0}}>
                            <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
                              <div style={{width:8,height:8,borderRadius:"50%",background:"#ff5f56"}}/>
                              <div style={{width:8,height:8,borderRadius:"50%",background:"#ffbd2e"}}/>
                              <div style={{width:8,height:8,borderRadius:"50%",background:"#27c93f"}}/>
                            </div>
                            <div style={{background:"rgba(255,255,255,0.06)",borderRadius:"4px",padding:"2px 14px",fontSize:"0.6rem",color:"rgba(255,255,255,0.6)",fontFamily:"'Courier New',monospace",display:"flex",alignItems:"center",gap:6,maxWidth:"60%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                              <span style={{color:"#4ade80"}}>🔒</span> {p.url}
                            </div>
                            <button 
                              onClick={()=>window.open(p.url, "_blank", "noopener,noreferrer")}
                              style={{background:"#f07127",color:"#0f0f0f",border:"none",borderRadius:"3px",padding:"2px 8px",fontSize:"0.58rem",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,cursor:"pointer",letterSpacing:"0.08em",textTransform:"uppercase"}}
                            >
                              Visit ↗
                            </button>
                          </div>

                          {/* Content Preview Container */}
                          <div style={{flex:1,position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justify:"center",background:"#0a0a0a"}}>
                            {p.screenshot ? (
                              <img src={p.screenshot} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top"}} />
                            ) : (
                              <div style={{width:"100%",height:"100%",position:"relative",overflow:"hidden"}}>
                                <iframe 
                                  src={p.url} 
                                  style={{width:"200%",height:"200%",border:"none",transform:"scale(0.5)",transformOrigin:"0 0",pointerEvents:"none"}} 
                                  title={p.name}
                                  loading="lazy"
                                />
                                <div 
                                  style={{position:"absolute",inset:0,zIndex:2,cursor:"pointer"}} 
                                  onClick={()=>window.open(p.url, "_blank", "noopener,noreferrer")} 
                                  title={`Click to open ${p.name} live`}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mockup-base" style={{width:"105%",margin:"0 -2.5%"}}/>
              </div>
            </div>

            {/* Right: Details */}
            <div className="p-details-container" style={{flex:1, display:"flex", flexDirection:"column", gap:"20px"}}>
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

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"8px"}}>
                {/* Metric 1: Performance */}
                <div style={{display:"flex",alignItems:"center",gap:"12px",background:T.bg2,padding:"14px",borderRadius:12,border:`1px solid ${T.border}`}}>
                  <div style={{width:36,height:36,borderRadius:8,background:"rgba(240,113,39,0.1)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(240,113,39,0.2)",flexShrink:0}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f07127" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  <div>
                    <p style={{fontSize:"0.55rem",color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"2px",whiteSpace:"nowrap"}}>Performance</p>
                    <p style={{fontSize:"0.9rem",fontWeight:600,color:T.text}}>{projects[activeP].score}/100</p>
                  </div>
                </div>

                {/* Metric 2: SEO Score */}
                <div style={{display:"flex",alignItems:"center",gap:"12px",background:T.bg2,padding:"14px",borderRadius:12,border:`1px solid ${T.border}`}}>
                  <div style={{width:36,height:36,borderRadius:8,background:"rgba(74,222,128,0.1)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(74,222,128,0.2)",flexShrink:0}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  </div>
                  <div>
                    <p style={{fontSize:"0.55rem",color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"2px",whiteSpace:"nowrap"}}>SEO Score</p>
                    <p style={{fontSize:"0.9rem",fontWeight:600,color:T.text}}>100/100</p>
                  </div>
                </div>

                {/* Metric 3: Load Speed */}
                <div style={{display:"flex",alignItems:"center",gap:"12px",background:T.bg2,padding:"14px",borderRadius:12,border:`1px solid ${T.border}`}}>
                  <div style={{width:36,height:36,borderRadius:8,background:"rgba(96,165,250,0.1)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(96,165,250,0.2)",flexShrink:0}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  </div>
                  <div>
                    <p style={{fontSize:"0.55rem",color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"2px",whiteSpace:"nowrap"}}>Avg. Load Time</p>
                    <p style={{fontSize:"0.9rem",fontWeight:600,color:T.text}}>0.8s (FCP)</p>
                  </div>
                </div>

                {/* Metric 4: Uptime */}
                <div style={{display:"flex",alignItems:"center",gap:"12px",background:T.bg2,padding:"14px",borderRadius:12,border:`1px solid ${T.border}`}}>
                  <div style={{width:36,height:36,borderRadius:8,background:"rgba(192,132,252,0.1)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(192,132,252,0.2)",flexShrink:0}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  </div>
                  <div>
                    <p style={{fontSize:"0.55rem",color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"2px",whiteSpace:"nowrap"}}>Reliability</p>
                    <p style={{fontSize:"0.9rem",fontWeight:600,color:T.text}}>99.99% Uptime</p>
                  </div>
                </div>
              </div>

              <button onClick={()=>window.open(projects[activeP].url,"_blank","noopener,noreferrer")} style={{display:"inline-flex",justifyContent:"center",alignItems:"center",gap:10,background:"transparent",color:T.text,border:`1px solid ${T.border}`,padding:"14px 24px",borderRadius:8,fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.8rem",fontWeight:500,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",transition:"all 0.3s"}}
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
            <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(1.9rem,3.2vw,2.9rem)",fontWeight:500,lineHeight:1.15,color:T.text}}>Don't take our word for it.<br/><em style={{fontStyle:"italic",color:"#f07127"}}>Here's what our clients say.</em></h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"16px"}} className="g3">
            {testimonials.map((t,i)=>(
              <div key={i} className={`rv${testIn?" in":""}`} style={{transitionDelay:`${i*0.12}s`,background:T.bg2,border:`1px solid ${T.border}`,padding:"36px 28px",transition:"border-color 0.35s,transform 0.35s,background 0.4s",boxShadow:T.shadow,borderRadius:"12px"}}
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
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"60px",alignItems:"start"}} className="g2">
            <div>
              <div className={`rv${ctaIn?" in":""}`} style={{marginBottom:"56px",maxWidth:520}}>
                <p style={{fontSize:"0.66rem",fontWeight:600,letterSpacing:"0.22em",textTransform:"uppercase",color:"#f07127",marginBottom:"14px"}}>Final Opportunity</p>
                <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(2rem,4.5vw,3.8rem)",fontWeight:500,lineHeight:1.1,color:T.text}}>Your Competitors Are<br/>Praying You Don't<br/><em style={{fontStyle:"italic",color:"#f07127"}}>Click This Button.</em></h2>
              </div>
              <div className={`rv${ctaIn?" in":""}`} style={{transitionDelay:"0.1s"}}>
                <p style={{color:T.muted,lineHeight:1.9,fontSize:"0.9rem",marginBottom:"10px"}}>Stop "thinking about it" while others are taking your market share. Book your <strong style={{color:T.text}}>Free Strategy Call</strong> right now.</p>
                <p style={{color:"rgba(240,113,39,0.7)",fontSize:"0.82rem",fontStyle:"italic",marginBottom:"28px"}}>No fluff. No high-pressure sales. Just a direct look at the money you're leaving on the table.</p>
              {["Full strategy roadmap included","See custom mockups in 24 hours","Launch in 3 days, not 3 months","Lifetime 24/7 priority support"].map(item=>(
                <div key={item} style={{display:"flex",gap:"14px",alignItems:"center",fontSize:"0.84rem",marginBottom:"13px"}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f07127" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                  <span style={{color:T.text}}>{item}</span>
                </div>
              ))}
              <div style={{marginTop:"36px",padding:"22px 24px",border:`1px solid ${T.border}`,display:"flex",gap:"16px",alignItems:"center",background:T.bg,borderRadius:"10px",transition:"background 0.4s"}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#f07127"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <div>
                  <div style={{fontSize:"0.66rem",color:T.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"3px"}}>Prefer WhatsApp? Message us now</div>
                  <a href="https://wa.me/917878584866" target="_blank" rel="noopener noreferrer" style={{color:"#f07127",fontSize:"0.95rem",fontWeight:600,textDecoration:"none"}}>+91 78785 84866</a>
                </div>
              </div>
              </div>
            </div>
            <div className={`rv${ctaIn?" in":""}`} style={{transitionDelay:"0.2s"}}>
              <div style={{background: dark ? "rgba(242,238,234,0.03)" : "rgba(26,16,8,0.04)", border: `1px solid ${T.border}`, borderRadius: "12px", overflow: "hidden", position: "relative"}}>
                <InlineWidget url="https://calendly.com/brandbuzzersocial" styles={{height: "660px", width: "100%"}} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{padding:"40px 6%",borderTop:`1px solid ${T.border}`,background:T.bg,transition:"background 0.4s"}}>
        <div className="footer-content" style={{maxWidth:1200,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"20px"}}>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"1.15rem",fontWeight:500,marginBottom:"4px",color:T.text}}>Brand<em style={{fontStyle:"italic",color:"#f07127"}}>Buzzer</em></div>
            <div style={{color:T.muted,fontSize:"0.72rem"}}>Your Competitors Already Have a Great Website. Do You?</div>
          </div>
          <div style={{color:T.muted,fontSize:"0.72rem",textAlign:"center",lineHeight:1.8}}>
            <div>brandbuzzersocial@gmail.com · +91 78785 84866</div>
          </div>
          <div style={{color:T.muted,fontSize:"0.72rem"}}>&copy; 2025 Brand Buzzer. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
