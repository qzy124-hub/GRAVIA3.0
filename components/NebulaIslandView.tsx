import React, { useEffect, useMemo, useRef, useState } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';
import { User, JournalEntry, MoodType } from '../types';
import { MOOD_COLORS } from '../constants';
import { createMoodTexture } from './EmotionGallery';

interface NebulaIslandViewProps {
  users: User[]; // [currentUser, matchedUser?]
  currentUser: User;
  onEntryClick: (entry: JournalEntry) => void;
}

// Extended interface for entries with globe coordinates
interface GlobeJournalEntry extends JournalEntry {
    lat: number;
    lng: number;
    alt: number;
}

// --- SAFE COLORS (No Red/Ugly colors) ---
const SAFE_NEBULA_COLORS = [
    '#8b5cf6', // Violet
    '#a855f7', // Purple
    '#6366f1', // Indigo
    '#3b82f6', // Blue
    '#0ea5e9', // Sky
    '#06b6d4', // Cyan
    '#14b8a6', // Teal
    '#10b981', // Emerald
    '#eab308', // Yellow/Gold
    '#f472b6', // Pink (Light)
    '#d946ef', // Fuchsia
    '#818cf8', // Soft Indigo
];

// --- Enhanced Resonance Connection Line (The Glowing Bridge) ---
const ResonanceConnection = () => (
  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[900px] h-[400px] pointer-events-none z-0 flex items-center justify-center rotate-90 md:rotate-0">
     <svg width="100%" height="100%" viewBox="0 0 900 400" overflow="visible">
        <defs>
          <filter id="glow-white" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
              </feMerge>
          </filter>
        </defs>

        {/* S-Shaped Dashed Line */}
        <path 
          d="M 120,200 C 350,50 550,350 780,200" 
          fill="none" 
          stroke="white" 
          strokeWidth="2"
          strokeDasharray="10, 15" // Dashed line pattern
          strokeLinecap="round"
          filter="url(#glow-white)"
          className="opacity-90"
        >
           {/* Flowing animation for the dashes */}
           <animate attributeName="stroke-dashoffset" from="25" to="0" dur="1s" repeatCount="indefinite" />
        </path>

        {/* Optional: Add a subtle secondary glow line for depth */}
        <path 
          d="M 120,200 C 350,50 550,350 780,200" 
          fill="none" 
          stroke="rgba(255,255,255,0.3)" 
          strokeWidth="6"
          strokeLinecap="round"
          filter="url(#glow-white)"
          className="blur-sm"
        />
     </svg>
  </div>
);

// --- Individual Sphere Component ---
const NebulaSphere = ({ 
    user, 
    isCurrentUser, 
    onEntryClick,
    delay = 0,
    size, // Receive size from parent
}: { 
    user: User, 
    isCurrentUser: boolean,
    onEntryClick: (entry: JournalEntry) => void,
    delay?: number,
    size: number,
}) => {
    const globeRef = useRef<GlobeMethods | undefined>(undefined);
    const textureCache = useRef<Record<string, THREE.CanvasTexture>>({});
    const tooltipRef = useRef<HTMLDivElement>(null);

    // State for content only, Ref for position/data tracking to avoid re-renders
    const [hoveredEntry, setHoveredEntry] = useState<GlobeJournalEntry | null>(null);
    const hoveredEntryRef = useRef<GlobeJournalEntry | null>(null);
    
    // Select a display color that is NOT red, based on user ID for consistency
    const displayColor = useMemo(() => {
        let hash = 0;
        for (let i = 0; i < user.id.length; i++) {
            hash = user.id.charCodeAt(i) + ((hash << 5) - hash);
        }
        return SAFE_NEBULA_COLORS[Math.abs(hash) % SAFE_NEBULA_COLORS.length];
    }, [user.id]);

    // Cleanup textures
    useEffect(() => {
        return () => {
            Object.values(textureCache.current).forEach((t) => (t as THREE.CanvasTexture).dispose());
        };
    }, []);

    // --- TOOLTIP ANIMATION LOOP ---
    // This ensures silky smooth tracking of the floating particles without React render overhead
    useEffect(() => {
        let animationFrameId: number;

        const updateTooltipPosition = () => {
            if (hoveredEntryRef.current && globeRef.current && tooltipRef.current) {
                const d = hoveredEntryRef.current;
                const globe = globeRef.current;
                
                // Replicate the exact motion logic from customThreeObjectUpdate
                const t = Date.now() * 0.001;
                
                // Static Position: No drift on lat/lng
                // Subtle Pulse Altitude: Breathing effect only
                const pulseAlt = d.alt + Math.sin(t * 1.0 + d.lat) * 0.02;

                // Get 3D World Coordinates from Globe
                const coords = globe.getCoords(d.lat, d.lng, pulseAlt);
                
                // Project to 2D Screen Coordinates
                const vec = new THREE.Vector3(coords.x, coords.y, coords.z);
                const camera = globe.camera();
                vec.project(camera);

                // Convert Normalized Device Coordinates (-1 to +1) to Pixel Coordinates relative to container
                const x = (vec.x * 0.5 + 0.5) * size;
                const y = (-(vec.y * 0.5) + 0.5) * size;

                // Apply transform directly to DOM
                // Translate -50% -100% to center bottom of tooltip on the point, plus an offset
                tooltipRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%) translateY(-20px)`;
                tooltipRef.current.style.opacity = '1';
            } else if (tooltipRef.current) {
                tooltipRef.current.style.opacity = '0';
            }
            
            animationFrameId = requestAnimationFrame(updateTooltipPosition);
        };

        updateTooltipPosition();
        return () => cancelAnimationFrame(animationFrameId);
    }, [size]); // Re-init if size changes

    // --- PARTICLE GENERATION & DISTRIBUTION ---
    const visibleEntries = useMemo(() => {
        const MAX_PARTICLES = 50; 
        const entriesToShow = user.entries.slice(0, MAX_PARTICLES);
        const count = entriesToShow.length;
        
        // Fibonacci Sphere Algorithm Variables
        const goldenRatio = (1 + Math.sqrt(5)) / 2;

        return entriesToShow.map((e, i) => {
            // Calculate evenly distributed position
            const i2 = i + 0.5;
            const phi = Math.acos(1 - 2 * i2 / count);
            const theta = 2 * Math.PI * i2 / goldenRatio;

            // Convert spherical coords to lat/lng
            const lat = 90 - (phi * 180 / Math.PI);
            const lng = (theta * 180 / Math.PI) % 360;

            return {
                ...e,
                // Use calculated evenly distributed coordinates + tiny jitter for organic feel
                lat: lat + (Math.random() - 0.5) * 5, 
                lng: lng + (Math.random() - 0.5) * 5,
                // Increase altitude variance for better 3D separation and easier clicking
                alt: 0.25 + Math.random() * 0.15 
            } as GlobeJournalEntry;
        });
    }, [user]);

    // Material for the Sphere (Ghostly Planet Core)
    const sphereMaterial = useMemo(() => new THREE.MeshPhongMaterial({
        color: displayColor, 
        transparent: true,
        opacity: 0.05, 
        side: THREE.DoubleSide,
        shininess: 100, 
        emissive: new THREE.Color(displayColor), 
        emissiveIntensity: 0.1,
        depthWrite: false
    }), [displayColor]);

    // Particle Renderer
    const particleObject = (d: any) => {
        const entry = d as GlobeJournalEntry;
        const isPrivateAndOthers = !entry.isPublic && !isCurrentUser;

        const moodKey = entry.moods.sort().join('-') + entry.visuals.shape + (isPrivateAndOthers ? '-locked' : '');
        
        if (!textureCache.current[moodKey]) {
            textureCache.current[moodKey] = createMoodTexture(entry.moods, entry.visuals);
        }
        
        const material = new THREE.SpriteMaterial({
            map: textureCache.current[moodKey],
            transparent: true,
            opacity: 0.9, 
            depthWrite: false,
            blending: THREE.AdditiveBlending 
        });

        if (isPrivateAndOthers) {
            material.opacity = 0.3;          
            material.color = new THREE.Color(0x555555); 
            material.blending = THREE.NormalBlending;   
        }

        const sprite = new THREE.Sprite(material);
        
        // Large scale for easier visibility and clicking
        const scale = 12 + Math.random() * 6; 
        sprite.scale.set(scale, scale, 1); 
        
        if (entry.visuals.shape !== 'smooth' && !isPrivateAndOthers) {
             material.rotation = Math.random() * Math.PI * 2;
        }

        return sprite;
    };

    return (
        <div 
          className="relative group transition-all duration-1000 flex items-center justify-center"
          style={{ 
              width: size, 
              height: size,
              animation: `float 6s ease-in-out infinite`,
              animationDelay: `${delay}s`
          }}
        >
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes pulse-breath {
                    0% { opacity: 0.2; transform: scale(0.95); }
                    100% { opacity: 0.4; transform: scale(1.05); }
                }
                @keyframes shimmer-spin {
                    0% { transform: rotate(0deg); opacity: 0.1; }
                    50% { opacity: 0.3; }
                    100% { transform: rotate(360deg); opacity: 0.1; }
                }
            `}</style>

            {/* Title */}
            <div className="absolute -top-10 md:-top-14 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none w-max">
                <h3 className="text-xl md:text-3xl font-bold tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] whitespace-nowrap">
                   {isCurrentUser ? 'My Nebula' : user.name}
                </h3>
            </div>

            {/* Background Effects */}
            <div 
                className="absolute inset-8 md:inset-10 rounded-full blur-xl pointer-events-none transition-colors duration-1000"
                style={{ 
                    background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.3) 0%, ${displayColor} 55%, transparent 75%)`,
                    opacity: 0.5
                }}
            ></div>
            <div 
                className="absolute inset-0 rounded-full blur-3xl pointer-events-none transition-opacity duration-1000"
                style={{ 
                    background: `radial-gradient(circle at 50% 50%, ${displayColor}, transparent 65%)`,
                    animation: 'pulse-breath 6s ease-in-out infinite alternate',
                    animationDelay: `${delay}s`
                }}
            ></div>
            <div 
                 className="absolute inset-0 rounded-full pointer-events-none mix-blend-plus-lighter"
                 style={{
                     background: `conic-gradient(from 180deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.1) 45deg, transparent 90deg, transparent 180deg, rgba(255,255,255,0.1) 225deg, transparent 270deg)`,
                     animation: 'shimmer-spin 15s linear infinite',
                 }}
            ></div>

            {/* --- CUSTOM HIGH-PERFORMANCE TOOLTIP --- */}
            <div 
                ref={tooltipRef} 
                className="absolute top-0 left-0 pointer-events-none z-50 transition-opacity duration-200 opacity-0"
                style={{ willChange: 'transform' }} // Optimize compositing
            >
                {hoveredEntry && (() => {
                    const isLocked = !hoveredEntry.isPublic && !isCurrentUser;
                    const color = MOOD_COLORS[hoveredEntry.moods[0]] || '#ffffff';
                    
                    return (
                        <div 
                            className="flex items-center gap-2 backdrop-blur-xl border rounded-lg px-3 py-1.5 shadow-2xl"
                            style={{ 
                                backgroundColor: 'rgba(10, 10, 20, 0.75)',
                                borderColor: isLocked ? 'rgba(255,255,255,0.1)' : `${color}40`,
                                boxShadow: isLocked ? 'none' : `0 0 20px ${color}20`
                            }}
                        >
                            {isLocked ? (
                                <>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                    <span className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">Private</span>
                                </>
                            ) : (
                                <>
                                    <div 
                                        className="w-1.5 h-1.5 rounded-full" 
                                        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                                    ></div>
                                    <span 
                                        className="text-white text-[11px] font-bold uppercase tracking-widest"
                                        style={{ textShadow: `0 0 10px ${color}80` }}
                                    >
                                        {hoveredEntry.moods[0]}
                                    </span>
                                </>
                            )}
                        </div>
                    );
                })()}
            </div>

            <Globe
                ref={globeRef}
                width={size}
                height={size}
                backgroundColor="rgba(0,0,0,0)"
                globeMaterial={sphereMaterial}
                globeImageUrl={null}
                showAtmosphere={true} 
                atmosphereColor="#ffffff"
                atmosphereAltitude={0.05} 
                
                enablePointerInteraction={true} 

                onGlobeReady={() => {
                    if (globeRef.current) {
                        const controls = globeRef.current.controls();
                        controls.minDistance = 180;
                        controls.maxDistance = 600;
                        controls.enableDamping = true;
                        controls.dampingFactor = 0.05; 
                        controls.rotateSpeed = 0.6;   
                        controls.zoomSpeed = 0.8;
                    }
                }}
                
                customLayerData={visibleEntries}
                customThreeObject={particleObject}
                customThreeObjectUpdate={(obj: any, d: any) => {
                     const entry = d as JournalEntry;
                     const isPrivateAndOthers = !entry.isPublic && !isCurrentUser;

                     if (globeRef.current) {
                        const t = Date.now() * 0.001;
                        
                        // FIX: Remove lat/lng drift to prevent "particles moving randomly on their own"
                        // Keep only subtle altitude pulsing for life
                        const pulseAlt = d.alt + Math.sin(t * 1.0 + d.lat) * 0.02;

                        const coords = globeRef.current.getCoords(d.lat, d.lng, pulseAlt);
                        obj.position.set(coords.x, coords.y, coords.z);
                     }

                     if (isPrivateAndOthers) {
                         return; 
                     }
                     
                     const t = Date.now() * 0.001;
                     const { speed, shape } = entry.visuals;
                     const dynamicScale = 14 + Math.sin(t * speed * 2) * 3;
                     obj.scale.set(dynamicScale, dynamicScale, 1);

                     if (shape !== 'smooth') {
                         (obj.material as THREE.SpriteMaterial).rotation += 0.005 * speed;
                     }
                }}
                
                onCustomLayerClick={(d: any) => {
                    const entry = d as JournalEntry;
                    onEntryClick(entry);
                }}
                
                onCustomLayerHover={(d: any) => {
                     const entry = d as GlobeJournalEntry;
                     
                     // 1. Update Ref immediately for animation loop
                     hoveredEntryRef.current = entry;
                     
                     // 2. Update State only if changed (prevents thrashing)
                     if (entry?.id !== hoveredEntry?.id) {
                         setHoveredEntry(entry);
                     }
                     
                     // 3. Cursor style
                     const isLocked = entry && !entry.isPublic && !isCurrentUser;
                     document.body.style.cursor = entry ? (isLocked ? 'not-allowed' : 'pointer') : 'grab';
                }}
                
                // DISABLED NATIVE TOOLTIP to prevent lag
                customLayerLabel={() => ''}
            />
        </div>
    );
};

// --- Main View Component ---
const NebulaIslandView: React.FC<NebulaIslandViewProps> = ({ users, currentUser, onEntryClick }) => {
  const isMatchMode = users.length > 1;
  const [sphereSize, setSphereSize] = useState(300);
  
  useEffect(() => {
    const updateSize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const isMobile = w < 768;

        if (isMobile) {
            if (isMatchMode) {
                 const heightAvailable = (h - 180) / 2;
                 const widthAvailable = w - 40; 
                 setSphereSize(Math.min(heightAvailable * 0.9, widthAvailable * 0.9, 380));
            } else {
                 setSphereSize(Math.min(w - 40, h - 240, 420));
            }
        } else {
            if (isMatchMode) {
                 const widthAvailable = (w - 150) / 2; 
                 const heightAvailable = h - 260; 
                 setSphereSize(Math.min(widthAvailable * 0.9, heightAvailable * 0.9, 550));
            } else {
                 const heightAvailable = h - 260;
                 setSphereSize(Math.min(w * 0.6, heightAvailable * 0.9, 750));
            }
        }
    };

    window.addEventListener('resize', updateSize);
    updateSize(); 
    return () => window.removeEventListener('resize', updateSize);
  }, [isMatchMode]);

  return (
    <div className="flex-1 relative flex items-center justify-center perspective-[1000px] w-full h-full overflow-hidden">
        
        {isMatchMode && <ResonanceConnection />}

        <div className={`flex flex-col md:flex-row items-center justify-center relative z-10 transition-all duration-1000 ${isMatchMode ? 'gap-8 md:gap-32 mt-4 md:mt-0' : ''}`}>
            {users.map((user, idx) => (
                <div 
                    key={user.id} 
                    className={`relative transition-all duration-1000 ${isMatchMode ? (idx === 0 ? 'order-1' : 'order-2') : ''}`}
                >
                    <NebulaSphere 
                        user={user} 
                        isCurrentUser={user.id === currentUser.id}
                        onEntryClick={onEntryClick}
                        delay={idx * 1.5}
                        size={sphereSize} 
                    />
                </div>
            ))}
        </div>
    </div>
  );
};

export default NebulaIslandView;