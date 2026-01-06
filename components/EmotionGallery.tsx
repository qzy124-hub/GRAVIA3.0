import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { User, JournalEntry, MoodType, VisualAttributes } from '../types';
import { MOOD_COLORS } from '../constants';
import EntryDetailModal from './EntryDetailModal';

interface EmotionGalleryProps {
  user: User;
  onClose: () => void;
}

// Helper to convert hex to rgba for softer glow effects
const hexToRgba = (hex: string, alpha: number) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})` : hex;
};

// Generate a texture representing a single emotional record with distinct shape and gradient
export const createMoodTexture = (moods: MoodType[], visuals: VisualAttributes): THREE.CanvasTexture => {
    const size = 512; // High resolution for very soft gradients
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
        ctx.clearRect(0, 0, size, size);
        
        const uniqueMoods = Array.from(new Set(moods)).slice(0, 3);
        const colors = uniqueMoods.map(m => MOOD_COLORS[m] || '#FFFFFF');
        const primaryColor = colors[0];
        
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size * 0.25; // Compact core to allow large glow

        // 1. ATMOSPHERIC GLOW (Background Layer)
        // A very large, soft radial gradient to create the "hazy" look
        const glowRadius = size * 0.48;
        const bgGlow = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, glowRadius);
        bgGlow.addColorStop(0, hexToRgba(primaryColor, 0.4));  // Soft core
        bgGlow.addColorStop(0.5, hexToRgba(primaryColor, 0.15));
        bgGlow.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = bgGlow;
        ctx.fillRect(0, 0, size, size);

        // 2. SHAPE DRAWING
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.beginPath();
        
        // Soften path rendering
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        if (visuals.shape === 'spiky') {
            // Starburst
            const spikes = 12;
            const outerRadius = radius * 1.3;
            const innerRadius = radius * 0.7;
            for (let i = 0; i < spikes * 2; i++) {
                const r = (i % 2 === 0) ? outerRadius : innerRadius;
                const angle = (Math.PI * i) / spikes;
                // Less jitter for cleaner gradient flow
                const jitter = (Math.random() - 0.5) * (radius * 0.05); 
                ctx.lineTo(Math.cos(angle) * (r + jitter), Math.sin(angle) * (r + jitter));
            }
        } else if (visuals.shape === 'distorted') {
            // Blob/Amoeba
            const points = 10;
            for (let i = 0; i <= points; i++) {
                const angle = (i / points) * Math.PI * 2;
                // Smooth organic variance
                const offset = Math.sin(i * 1.5) * (radius * 0.3) + Math.cos(i * 2.5) * (radius * 0.1);
                const r = radius + offset;
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
        } else {
            // Smooth / Cloud
            ctx.arc(0, 0, radius * 1.1, 0, Math.PI * 2);
        }

        ctx.closePath();
        ctx.restore();

        // 3. VIVID RADIAL FILL
        // Instead of linear, use radial to simulate a glowing core
        const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.5);
        
        // Center: Pure white/light for "Vivid" brightness
        coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)'); 
        
        // Mid: Primary Vivid Color
        coreGrad.addColorStop(0.25, hexToRgba(primaryColor, 0.9));
        
        // Outer: Blend to secondary or fade
        if (colors.length > 1) {
            coreGrad.addColorStop(0.6, hexToRgba(colors[1], 0.7));
        } else {
            coreGrad.addColorStop(0.6, hexToRgba(primaryColor, 0.6));
        }
        
        // Edge: Soft fade out
        coreGrad.addColorStop(1, hexToRgba(colors[colors.length-1], 0.0));

        ctx.fillStyle = coreGrad;

        // 4. SOFT EDGES
        // Use shadowBlur to eliminate hard pixel edges on the shape
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 40; 
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
};

const EmotionGallery: React.FC<EmotionGalleryProps> = ({ user, onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  
  // React state for content rendering only (not position)
  const [hoveredEntry, setHoveredEntry] = useState<JournalEntry | null>(null);
  
  // Mutable ref for animation loop to access without triggering re-renders
  const hoveredSpriteRef = useRef<THREE.Sprite | null>(null);

  // Extract unique topics to define lanes
  const laneTopics = useMemo(() => {
    const allTopics = new Set<string>();
    const defaults = ['Work', 'Family', 'Friend', 'Life'];
    defaults.forEach(t => allTopics.add(t));
    
    user.entries.forEach(e => {
        if(e.topics && e.topics.length > 0) {
            allTopics.add(e.topics[0]); 
        }
    });
    return Array.from(allTopics);
  }, [user]);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.002);

    const isMobile = window.innerWidth < 768;
    const initialZ = isMobile ? 100 : 60; // Further back on mobile
    const initialY = isMobile ? 25 : 12;   // Higher up on mobile

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, initialY, initialZ); 

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // --- RUNWAY LANES (TOPICS) ---
    const LANE_WIDTH = 12; // Wider lanes to prevent crowd
    const TOTAL_WIDTH = LANE_WIDTH * laneTopics.length;
    const START_X = -TOTAL_WIDTH / 2 + LANE_WIDTH / 2;

    const laneGroup = new THREE.Group();
    const labelGroup = new THREE.Group(); 
    
    laneTopics.forEach((topic, index) => {
        const xPos = START_X + index * LANE_WIDTH;
        
        // Lane Line
        const geometry = new THREE.PlaneGeometry(1.5, 2000); 
        const material = new THREE.MeshBasicMaterial({ 
            color: '#FFFFFF', 
            transparent: true, 
            opacity: 0.6, 
            side: THREE.DoubleSide
        });
        const lane = new THREE.Mesh(geometry, material);
        lane.position.set(xPos, 0, -500); 
        lane.rotation.x = -Math.PI / 2;
        laneGroup.add(lane);

        // Label
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 50px "Space Grotesk", Arial'; 
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(255,255,255,0.8)';
            ctx.shadowBlur = 20;
            ctx.fillText(topic.toUpperCase(), 256, 80);
        }
        const texture = new THREE.CanvasTexture(canvas);
        const labelGeo = new THREE.PlaneGeometry(8, 2); 
        const labelMat = new THREE.MeshBasicMaterial({ 
            map: texture, 
            transparent: true, 
            side: THREE.DoubleSide,
            depthTest: false 
        });
        const label = new THREE.Mesh(labelGeo, labelMat);
        label.position.set(xPos, 2, 0); 
        labelGroup.add(label);
    });
    scene.add(laneGroup);
    scene.add(labelGroup);

    // --- GRID ---
    const gridHelper = new THREE.GridHelper(400, 100, 0x222222, 0x080808);
    gridHelper.position.y = -0.2;
    gridHelper.position.z = -200;
    scene.add(gridHelper);

    // --- PARTICLES (SPRITES) ---
    const particlesGroup = new THREE.Group();
    const entrySprites: { sprite: THREE.Sprite, entry: JournalEntry }[] = [];

    // Limit to latest 50 entries
    const sortedEntries = [...user.entries]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 50);
        
    const textureCache: Record<string, THREE.CanvasTexture> = {};

    sortedEntries.forEach((entry) => {
        // Lane Logic
        const topic = (entry.topics && entry.topics.length > 0) ? entry.topics[0] : 'Life';
        let topicIndex = laneTopics.indexOf(topic);
        if (topicIndex === -1) topicIndex = laneTopics.indexOf('Life');
        if (topicIndex === -1) topicIndex = 0;

        // X Position with Deterministic Placement (No random accumulation)
        const xBase = START_X + topicIndex * LANE_WIDTH + (Math.random() - 0.5) * 8;
        
        // Z Position
        const index = sortedEntries.indexOf(entry);
        const zBase = 20 - (index * 4) + (Math.random() - 0.5) * 4;

        // Y Position
        const yBase = 3 + Math.random() * 8; 

        // Size logic
        const scale = 5.0; 

        // Texture with Shape Logic
        const moodKey = entry.moods.sort().join('-') + '-' + entry.visuals.shape;
        if (!textureCache[moodKey]) {
            textureCache[moodKey] = createMoodTexture(entry.moods, entry.visuals);
        }
        const texture = textureCache[moodKey];

        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 1.0, 
            depthWrite: false, 
            blending: THREE.AdditiveBlending 
        });

        const sprite = new THREE.Sprite(material);
        sprite.position.set(xBase, yBase, zBase);
        sprite.scale.set(scale, scale, 1);
        
        // Store base positions for stable animation
        sprite.userData = { 
            baseX: xBase, 
            baseY: yBase, 
            baseZ: zBase,
            entry: entry 
        };
        
        if (entry.visuals.shape !== 'smooth') {
             material.rotation = Math.random() * Math.PI * 2;
        }
        
        particlesGroup.add(sprite);
        entrySprites.push({ sprite, entry });
    });

    scene.add(particlesGroup);

    // --- LIGHTS ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // --- INTERACTION LOGIC (RAYCASTER) ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(particlesGroup.children);
        
        if (intersects.length > 0) {
            const hit = intersects[0].object as THREE.Sprite;
            // Only update if changed
            if (hoveredSpriteRef.current !== hit) {
                hoveredSpriteRef.current = hit;
                document.body.style.cursor = 'pointer';
                setHoveredEntry(hit.userData.entry);
            }
        } else {
            if (hoveredSpriteRef.current !== null) {
                hoveredSpriteRef.current = null;
                document.body.style.cursor = 'move';
                setHoveredEntry(null);
            }
        }
    };

    const onClick = (event: MouseEvent) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(particlesGroup.children);
        if (intersects.length > 0) {
            const hit = intersects[0].object;
            const match = entrySprites.find(em => em.sprite === hit);
            if (match) {
                setSelectedEntry(match.entry);
            }
        }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);

    // --- ANIMATION LOOP ---
    let targetZ = initialZ;
    let currentZ = initialZ;
    
    const onWheel = (e: WheelEvent) => {
        targetZ -= e.deltaY * 0.05; 
        targetZ = Math.max(-200, Math.min(initialZ + 20, targetZ)); 
    };
    window.addEventListener('wheel', onWheel);

    let animationId: number;
    const tempVec = new THREE.Vector3(); // Reuse vector for projection

    const animate = () => {
        animationId = requestAnimationFrame(animate);
        
        currentZ += (targetZ - currentZ) * 0.05;
        camera.position.z = currentZ;
        
        const labelZ = currentZ - (isMobile ? 50 : 30); 
        labelGroup.children.forEach((label) => {
             label.position.z = labelZ;
        });

        camera.lookAt(0, 5, currentZ - 100);

        // Update Date
        if (dateRef.current) {
            const particleIdx = Math.max(0, Math.floor((60 - currentZ) / 4));
            const targetEntry = sortedEntries[Math.min(particleIdx, sortedEntries.length - 1)];
            
            if (targetEntry) {
                dateRef.current.innerText = targetEntry.timestamp.toLocaleDateString('en-GB', { 
                    day: 'numeric', month: 'long', year: 'numeric' 
                });
            }
        }

        // --- MOTION DYNAMICS & SHIMMER ---
        const time = Date.now() * 0.001;
        entrySprites.forEach(({ sprite, entry }, idx) => {
            const { speed, shape } = entry.visuals;
            const base = sprite.userData;

            // 1. Stable Float Y (Oscillate around base)
            sprite.position.y = base.baseY + Math.sin(time * speed + idx) * (0.5 * speed);
            
            // 2. Stable Jitter X (Oscillate around base)
            if (speed > 1.5 && (shape === 'spiky' || shape === 'distorted')) {
                 sprite.position.x = base.baseX + Math.sin(time * speed * 2 + idx) * (0.2 * speed);
            }
            
            // 3. Pulse Scale (Controlled)
            const isHovered = hoveredSpriteRef.current === sprite;
            const baseScale = isHovered ? 8.0 : 5.0;
            const pulse = baseScale + Math.sin(time * speed * 2) * 0.3;
            sprite.scale.set(pulse, pulse, 1);

            sprite.material.opacity = 0.85 + Math.sin(time * 3 + idx) * 0.15;
        });

        // --- TOOLTIP & LINE TRACKING ---
        if (hoveredSpriteRef.current && tooltipRef.current) {
            const sprite = hoveredSpriteRef.current;
            
            // Get screen coordinates
            // Note: We use the sprite's world position updated above
            sprite.updateMatrixWorld(); // Ensure matrix is up to date
            tempVec.setFromMatrixPosition(sprite.matrixWorld);
            tempVec.project(camera);

            const x = (tempVec.x * .5 + .5) * window.innerWidth;
            const y = (-(tempVec.y * .5) + .5) * window.innerHeight;

            // Offset to prevent occlusion: Place tooltip significantly above particle
            // Gap between particle center and dashed line end
            const lineGap = 60; 

            // Position tooltip bottom-center at (x, y - lineGap)
            // Using translate(-50%, -100%) aligns the bottom of the tooltip to the top of the line
            tooltipRef.current.style.transform = `translate(${x}px, ${y - lineGap}px) translate(-50%, -100%)`;
            tooltipRef.current.style.opacity = '1';

            // Update Line (SVG)
            if (lineRef.current) {
                lineRef.current.parentElement!.style.opacity = '1';
                
                // Draw line from particle center to the bottom of the tooltip
                const startY = y; // Start at particle center
                const endY = y - lineGap; // End at tooltip bottom
                
                // M startX startY L endX endY
                lineRef.current.setAttribute('d', `M ${x} ${startY} L ${x} ${endY}`);
            }
        } else {
            if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
            if (lineRef.current && lineRef.current.parentElement) lineRef.current.parentElement.style.opacity = '0';
        }

        renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
        if (!mountRef.current) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('click', onClick);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('wheel', onWheel);
        cancelAnimationFrame(animationId);
        if (mountRef.current && renderer.domElement) {
            mountRef.current.removeChild(renderer.domElement);
        }
        Object.values(textureCache).forEach(t => t.dispose());
        renderer.dispose();
    };
    // Removed 'hoveredEntry' from dependency to prevent scene reset. 
    // 'laneTopics' and 'user' are memoized/stable enough.
  }, [user, laneTopics]); 

  return (
    <div className="fixed inset-0 z-[110] bg-black animate-scale-in">
        <div ref={mountRef} className="w-full h-full cursor-move" />
        
        {/* Date Display */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-[120] text-right pointer-events-none">
            <div ref={dateRef} className="text-xl md:text-5xl font-light text-white tracking-tighter opacity-80 font-mono"></div>
            <div className="text-[8px] md:text-xs text-blue-400 uppercase tracking-[0.3em] mt-1 border-t border-blue-900/50 pt-2 inline-block">
                Event Horizon
            </div>
        </div>

        {/* Close UI */}
        <button 
            onClick={onClose} 
            className="absolute top-4 left-4 md:top-8 md:left-8 z-[120] text-white/50 hover:text-white transition-colors bg-black/20 p-2 px-4 md:px-6 rounded-full border border-white/10 hover:border-white/50 flex items-center group text-xs md:text-base"
        >
            <span className="mr-2 opacity-50 group-hover:opacity-100 transition-opacity">←</span>
            BACK
        </button>

        {/* Legend */}
        <div className="absolute bottom-8 left-4 md:left-8 z-[120] pointer-events-none opacity-50">
            <h1 className="text-xl md:text-2xl font-thin tracking-widest text-white">EVENT ARCHIVE</h1>
            <p className="text-[8px] md:text-[10px] text-gray-500 mt-1 uppercase">Top 50 Recent Memories</p>
        </div>

        {/* --- DYNAMIC CONNECTION LINE SVG --- */}
        <svg className="fixed inset-0 z-[125] pointer-events-none transition-opacity duration-300 opacity-0 w-full h-full overflow-visible">
             <path 
                ref={lineRef}
                d="M0 0 L0 0" 
                stroke="white" 
                strokeWidth="1.5" 
                strokeDasharray="4 4" 
                strokeLinecap="round"
             />
        </svg>

        {/* --- PERSISTENT HOVER PREVIEW CARD --- */}
        {/* Position is handled via ref.style.transform in animation loop */}
        <div 
            ref={tooltipRef}
            className="fixed z-[130] pointer-events-none top-0 left-0 transition-opacity duration-300 opacity-0 origin-bottom"
            style={{ willChange: 'transform' }}
        >
            {hoveredEntry && (
                <div 
                    className="p-4 rounded-xl border backdrop-blur-xl shadow-2xl animate-fade-in-up flex flex-col items-center text-center w-48 mb-2"
                    style={{
                        backgroundColor: 'rgba(5, 5, 10, 0.8)',
                        borderColor: `${MOOD_COLORS[hoveredEntry.moods[0]]}60`,
                        boxShadow: `0 0 30px ${MOOD_COLORS[hoveredEntry.moods[0]]}20`
                    }}
                >
                     <div className="w-3 h-3 rounded-full mb-2" 
                        style={{ 
                            backgroundColor: MOOD_COLORS[hoveredEntry.moods[0]],
                            boxShadow: `0 0 10px ${MOOD_COLORS[hoveredEntry.moods[0]]}` 
                        }}
                     ></div>
                     
                     <span className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                        {hoveredEntry.moods[0]}
                     </span>
                     
                     <span className="text-[10px] text-gray-400 font-mono mb-2">
                        {hoveredEntry.timestamp.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                     </span>
                     
                     <p className="text-[10px] text-gray-300 line-clamp-2 leading-relaxed font-light italic opacity-80">
                        "{hoveredEntry.content}"
                     </p>
                </div>
            )}
        </div>

        {/* Detail Modal */}
        {selectedEntry && (
            <EntryDetailModal 
                entry={selectedEntry} 
                onClose={() => setSelectedEntry(null)} 
            />
        )}
    </div>
  );
};

export default EmotionGallery;