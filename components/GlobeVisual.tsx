import React, { useEffect, useRef, useState, useMemo } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';
import { User, Connection, JournalEntry } from '../types';
import { createMoodTexture } from './EmotionGallery';

interface GlobeVisualProps {
  users: User[];
  connections: Connection[];
  currentUser: User | null;
  onUserClick: (user: User) => void;
  settings: {
    brightness: number;
    color: string;
    language: 'zh' | 'en';
  };
}

const GlobeVisual: React.FC<GlobeVisualProps> = ({ users, connections, currentUser, onUserClick, settings }) => {
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  const [globeWidth, setGlobeWidth] = useState(window.innerWidth);
  const [globeHeight, setGlobeHeight] = useState(window.innerHeight);
  const [countries, setCountries] = useState({ features: []});
  
  // Cache for generated textures to improve performance
  const textureCache = useRef<Record<string, THREE.CanvasTexture>>({});

  // Filter users to only show those with recent activity (last 24 hours) for the main globe
  const activeUsers = useMemo(() => {
     const now = Date.now();
     const ONE_DAY_MS = 24 * 60 * 60 * 1000;
     
     return users.filter(user => {
         // Always show current user if they exist
         if (user.id === 'current-user') return true;
         // Always show connections
         if (connections.some(c => c.toUserId === user.id)) return true;
         
         // For others, check latest entry timestamp
         if (user.entries && user.entries.length > 0) {
             const latest = user.entries[0].timestamp.getTime();
             return (now - latest) < ONE_DAY_MS;
         }
         return false;
     });
  }, [users, connections]);

  useEffect(() => {
    // Load GeoJSON for country borders
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(setCountries);

    // Cleanup textures on unmount
    return () => {
        Object.values(textureCache.current).forEach(t => (t as THREE.Texture).dispose());
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setGlobeWidth(window.innerWidth);
      setGlobeHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (currentUser && globeEl.current) {
      globeEl.current.pointOfView({
        lat: currentUser.location.lat,
        lng: currentUser.location.lng,
        altitude: 2.5 
      }, 2000);
    }
  }, [currentUser]);

  const globeMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      color: '#000000',
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    });
  }, []);

  // --- VISUALIZATION LOGIC ---

  const threeObject = (d: any) => {
    const user = d as User;
    const entry = user.entries[0]; // Visualize the latest entry
    
    // Fallback if no entry
    if (!entry) return new THREE.Object3D();

    const visual = entry.visuals;
    const moodKey = entry.moods.sort().join('-') + '-' + visual.shape;

    // Generate or retrieve texture
    if (!textureCache.current[moodKey]) {
        textureCache.current[moodKey] = createMoodTexture(entry.moods, visual);
    }

    const material = new THREE.SpriteMaterial({
        map: textureCache.current[moodKey],
        transparent: true,
        opacity: 0.9,
        depthWrite: false, 
        blending: THREE.AdditiveBlending // Soft glowing look
    });

    const sprite = new THREE.Sprite(material);
    
    // Base scale determinations
    const isCurrentUser = user.id === currentUser?.id;
    const isHighlight = isCurrentUser || connections.some(c => c.toUserId === user.id);
    const baseScale = isHighlight ? 8 : 4;
    
    sprite.scale.set(baseScale, baseScale, 1);

    // Initial rotation for irregular shapes
    if (visual.shape !== 'smooth') {
         material.rotation = Math.random() * Math.PI * 2;
    }

    return sprite;
  };

  return (
    <div 
      className="absolute inset-0 z-0 bg-black transition-all duration-700" 
      style={{ filter: `brightness(${settings.brightness})` }}
    >
      <Globe
        ref={globeEl}
        width={globeWidth}
        height={globeHeight}
        
        globeMaterial={globeMaterial}
        globeImageUrl={null} 
        backgroundColor="#000000"
        atmosphereColor={settings.color}
        atmosphereAltitude={0.15}

        polygonsData={countries.features}
        polygonCapColor={() => 'rgba(20, 20, 30, 0.2)'}
        polygonSideColor={() => 'rgba(0, 0, 0, 0)'}
        polygonStrokeColor={() => settings.color}
        polygonAltitude={0.005}

        // Only pass filtered users (Last 24h)
        customLayerData={activeUsers}
        customThreeObject={threeObject}
        
        // Animation Loop for Sprites
        customThreeObjectUpdate={(obj: any, d: any) => {
           const time = Date.now();
           // Random offset based on location to desync animations
           const randomOffset = (d.location.lat + d.location.lng) * 100;
           
           // Floating Effect: Sine wave on altitude
           const initialAlt = 0.05;
           const floatSpeed = 0.002;
           const floatHeight = 0.015;
           const newAlt = initialAlt + Math.sin(time * floatSpeed + randomOffset) * floatHeight;
           
           // Update position on globe surface
           Object.assign(obj.position, globeEl.current?.getCoords(d.location.lat, d.location.lng, newAlt));
           
           // --- EMOTION DYNAMICS ---
           const entry = d.entries[0] as JournalEntry;
           if (entry) {
               const { speed, shape } = entry.visuals;
               
               // 1. Rotation (Spin)
               // Only spin non-smooth/cloud shapes to show "agitation" or "distortion"
               if (shape !== 'smooth' && shape !== 'cloud') {
                   // Cast to SpriteMaterial to access rotation
                   (obj.material as THREE.SpriteMaterial).rotation += 0.01 * speed;
               }

               // 2. Pulsing (Scale)
               // Fast intense pulse for Anger/Fear, slow breath for Joy/Sadness
               const pulseFreq = speed * 3; 
               const pulseAmp = shape === 'spiky' ? 0.2 : 0.1;
               const pulse = 1 + Math.sin(time * 0.002 * pulseFreq + randomOffset) * pulseAmp;
               
               const isHighlight = d.id === currentUser?.id || connections.some(c => c.toUserId === d.id);
               const baseScale = isHighlight ? 8 : 4;
               
               obj.scale.set(baseScale * pulse, baseScale * pulse, 1);

               // 3. Shimmer (Opacity)
               // Breathing opacity effect
               (obj.material as THREE.SpriteMaterial).opacity = 0.85 + Math.sin(time * 0.003 + randomOffset) * 0.15;
           }
        }}
        onCustomLayerClick={(d: any) => onUserClick(d)}
        onCustomLayerHover={(d: any) => {
             document.body.style.cursor = d ? 'pointer' : 'default';
        }}

        arcsData={connections.map(conn => {
          const toUser = users.find(u => u.id === conn.toUserId);
          if (!currentUser || !toUser) return null;
          return {
            startLat: currentUser.location.lat,
            startLng: currentUser.location.lng,
            endLat: toUser.location.lat,
            endLng: toUser.location.lng,
            color: ['#ffffff', settings.color]
          };
        }).filter(Boolean)}
        arcColor="color"
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        arcStroke={1.0} 
        arcAltitude={0.3} 
        
        animateIn={true}
      />
      
      <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-60 z-[-1]"></div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-purple-900/20 via-transparent to-transparent z-[-1]"></div>
    </div>
  );
};

export default GlobeVisual;