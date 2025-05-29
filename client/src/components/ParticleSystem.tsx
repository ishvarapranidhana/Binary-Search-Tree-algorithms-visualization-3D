import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, BufferGeometry, BufferAttribute, PointsMaterial } from "three";
import * as THREE from "three";

interface ParticleSystemProps {
  position: [number, number, number];
  isActive?: boolean;
}

export default function ParticleSystem({ position, isActive = false }: ParticleSystemProps) {
  const pointsRef = useRef<Points>(null);
  
  // Create particle geometry and materials
  const { geometry, material } = useMemo(() => {
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // Generate random particles around the sphere
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Random position in a sphere
      const radius = 1.5 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Random colors (green-orange spectrum)
      const colorMix = Math.random();
      colors[i3] = colorMix; // Red
      colors[i3 + 1] = 1.0; // Green
      colors[i3 + 2] = 0.2 + colorMix * 0.3; // Blue
      
      sizes[i] = Math.random() * 3 + 1;
    }
    
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(positions, 3));
    geo.setAttribute('color', new BufferAttribute(colors, 3));
    geo.setAttribute('size', new BufferAttribute(sizes, 1));
    
    const mat = new PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: isActive ? 0.8 : 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    return { geometry: geo, material: mat };
  }, [isActive]);
  
  useFrame((state) => {
    if (pointsRef.current && isActive) {
      // Rotate particles
      pointsRef.current.rotation.y += 0.02;
      pointsRef.current.rotation.x += 0.01;
      
      // Animate particle positions
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const time = state.clock.elapsedTime;
      
      for (let i = 0; i < positions.length; i += 3) {
        const originalY = positions[i + 1];
        positions[i + 1] = originalY + Math.sin(time * 2 + i) * 0.01;
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Update material opacity for pulsing effect
      if (pointsRef.current.material instanceof PointsMaterial) {
        pointsRef.current.material.opacity = 0.5 + Math.sin(time * 3) * 0.3;
      }
    }
  });
  
  if (!isActive) return null;
  
  return (
    <points ref={pointsRef} position={position}>
      <primitive object={geometry} />
      <primitive object={material} />
    </points>
  );
}
