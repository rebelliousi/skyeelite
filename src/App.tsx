import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowRight, Globe, Shield, Star, ChevronDown } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP
gsap.registerPlugin(ScrollTrigger);

const SkyEliteLanding = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // CONFIGURATION
  const frameCount = 150; 
  const images = useRef<HTMLImageElement[]>([]);
  const airship = useRef({ frame: 0 }).current;

  useEffect(() => {
    // 1. PRELOAD IMAGES FROM LOCAL FOLDER (/public/frames)
    const preloadImages = () => {
      let loadedCount = 0;
      const tempImages: HTMLImageElement[] = [];
      
      for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        const frameIndex = i.toString().padStart(3, '0');
        
        // This looks inside your /public/frames/ folder
        img.src = `/frames/ezgif-frame-${frameIndex}.jpg`;
        
        img.onload = () => {
          loadedCount++;
          setLoadProgress(Math.floor((loadedCount / frameCount) * 100));
          if (loadedCount === frameCount) {
            setIsLoading(false);
            initCanvas(); 
          }
        };
        tempImages.push(img);
      }
      images.current = tempImages;
    };

    const initCanvas = () => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      if (!canvas || !context) return;

      // SHARPNESS FIX: Scaling for Retina Displays
      const ratio = window.devicePixelRatio || 1;
      const setCanvasSize = () => {
        canvas.width = window.innerWidth * ratio;
        canvas.height = window.innerHeight * ratio;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
      };

      const drawImage = () => {
        const img = images.current[airship.frame];
        if (!img) return;
        const scale = Math.max(window.innerWidth / img.width, window.innerHeight / img.height);
        const x = (window.innerWidth / 2) - (img.width / 2) * scale;
        const y = (window.innerHeight / 2) - (img.height / 2) * scale;
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        context.drawImage(img, x, y, img.width * scale, img.height * scale);
      };

      // MAIN JOURNEY TIMELINE
      const mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        }
      });

      // Animate the frames sequence
      mainTl.to(airship, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        onUpdate: drawImage
      }, 0);

      // 3D STRETCH TEXT EFFECT (Oddy's Secret)
      mainTl.to(".hero-stretch", {
        opacity: 0,
        scaleY: 2.5,
        scaleX: 1.5,
        y: -300,
        filter: "blur(30px)",
        duration: 0.3
      }, 0);

      setCanvasSize();
      drawImage();
      window.addEventListener('resize', setCanvasSize);
    };

    preloadImages();

    // Mouse Parallax for Tech HUD
    const handleMouseMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 30;
        const y = (e.clientY / window.innerHeight - 0.5) * 30;
        gsap.to(".hud-element", { x: x, y: y, duration: 1.2, ease: "power2.out" });
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative bg-[#050505] font-sans antialiased text-white overflow-x-hidden">
      
      {/* LOADING SCREEN */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
           <div className="text-[10px] font-bold tracking-[1.5em] mb-8 text-white/30 uppercase animate-pulse">Initializing Flight Systems</div>
           <div className="w-64 h-[1px] bg-white/5 relative overflow-hidden">
              <div 
                className="absolute inset-0 bg-white transition-all duration-500" 
                style={{ width: `${loadProgress}%` }}
              />
           </div>
           <div className="mt-8 font-mono text-[9px] text-white/20 tracking-widest">{loadProgress}% STABLE</div>
        </div>
      )}

      <div className="h-[1200vh] w-full">
        
        {/* BACKGROUND CANVAS (Fixed) */}
        <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0 pointer-events-none opacity-80" />

        {/* HUD ELEMENTS */}
        <div className="fixed inset-0 z-10 pointer-events-none hidden md:block px-10">
            <div className="hud-element absolute top-40 left-20 border-l border-white/20 pl-4 py-2">
                <div className="text-[8px] tracking-[0.4em] text-white/40 uppercase">Altitude</div>
                <div className="text-xs font-mono">45,000 FT</div>
            </div>
            <div className="hud-element absolute bottom-40 right-20 border-r border-white/20 pr-4 py-2 text-right">
                <div className="text-[8px] tracking-[0.4em] text-white/40 uppercase">Mach Speed</div>
                <div className="text-xs font-mono">0.925</div>
            </div>
        </div>

        {/* UI OVERLAY */}
        <div className="relative z-20 flex flex-col">
          
          {/* NAVIGATION */}
          <nav className="fixed top-0 left-0 right-0 z-50 p-10 flex justify-between items-center mix-blend-difference">
              <div className="font-black italic text-2xl tracking-tighter">SKYELITE</div>
              <div className="hidden md:flex gap-16 text-[9px] uppercase tracking-[0.6em] font-medium opacity-40">
                 <a>Fleet</a><a>Experience</a><a>Membership</a>
              </div>
              <button className="px-8 py-3 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full text-[9px] tracking-widest uppercase hover:bg-white hover:text-black transition-all">
                 Inquire
              </button>
          </nav>

          {/* HERO */}
          <main className="h-screen flex flex-col items-center justify-center text-center">
             <div className="hero-stretch">
                <h1 className="text-[15vw] font-black uppercase tracking-tighter leading-[0.7] italic opacity-10">Premium</h1>
                <h1 className="text-[15vw] font-black uppercase tracking-tighter leading-[0.7] -mt-5">Aviation</h1>
             </div>
             <div className="absolute bottom-20 flex flex-col items-center gap-4 animate-bounce opacity-20">
                <div className="text-[8px] tracking-[0.5em] uppercase">Begin Descent</div>
                <ChevronDown size={14} />
             </div>
          </main>

          {/* BENTO SPECS */}
          <div className="px-10 py-32 space-y-[100vh]">
              <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-2 p-16 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] space-y-8">
                      <Star className="text-white/40" size={32} />
                      <h3 className="text-6xl font-light tracking-tighter">The Cabin Redefined.</h3>
                      <p className="text-white/40 leading-relaxed text-xl max-w-md">Master your schedule with zero-latency connectivity and whisper-quiet engines.</p>
                  </div>
                  <div className="p-12 bg-white text-black rounded-[3rem] flex flex-col justify-between shadow-2xl">
                      <Shield size={40} />
                      <div>
                        <h3 className="text-4xl font-bold leading-none mb-4 tracking-tighter italic">Safety First</h3>
                        <p className="text-black/50 text-sm font-medium">Platinum-rated protocols.</p>
                      </div>
                  </div>
              </section>

              {/* MEMBERSHIP */}
              <section className="max-w-5xl mx-auto py-20">
                 <div className="p-24 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-3xl border border-white/10 rounded-[4rem] text-center space-y-10 shadow-2xl">
                    <Globe size={40} className="mx-auto text-white/30" />
                    <h2 className="text-7xl md:text-9xl font-black tracking-tighter italic leading-none">Global<br/>Fleet</h2>
                    <p className="text-white/30 max-w-lg mx-auto tracking-widest leading-relaxed text-sm">
                        Access our entire fleet 24/7. From Mayfair to Manhattan.
                    </p>
                    <button className="px-12 py-6 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-transform">
                        Explore Membership
                    </button>
                 </div>
              </section>
          </div>
          
          <footer className="h-screen flex flex-col items-center justify-center">
             <h2 className="text-9xl md:text-[20vw] font-black uppercase tracking-tighter italic opacity-10 select-none">SkyElite</h2>
             <button className="px-24 py-10 bg-white text-black font-black uppercase italic tracking-tighter text-4xl hover:scale-110 transition-transform shadow-[0_0_100px_rgba(255,255,255,0.2)]">
                BOOK NOW
             </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default SkyEliteLanding;