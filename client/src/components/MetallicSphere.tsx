import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, Color } from "three";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface MetallicSphereProps {
  value: number;
  isHighlighted?: boolean;
  isInSearchPath?: boolean;
}

export default function MetallicSphere({ value, isHighlighted = false, isInSearchPath = false }: MetallicSphereProps) {
  const meshRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);
  
  // Create custom metallic material with white/silver base
  const material = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: isHighlighted ? '#ff6b35' : isInSearchPath ? '#00ff88' : '#f0f0f0',
      metalness: 0.95,
      roughness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      reflectivity: 1.0,
      envMapIntensity: 2.0,
      transmission: 0.1,
      ior: 2.4,
    });
    return mat;
  }, [isHighlighted, isInSearchPath]);

  // Create glow material
  const glowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: isHighlighted ? '#ff6b35' : isInSearchPath ? '#00ff88' : '#444444',
      transparent: true,
      opacity: isHighlighted ? 0.6 : isInSearchPath ? 0.4 : 0.2,
      side: THREE.BackSide,
    });
  }, [isHighlighted, isInSearchPath]);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2 + value) * 0.002;
      
      // Rotation for metallic reflection effects
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
    
    if (glowRef.current) {
      // Pulsing glow effect
      const pulseIntensity = isHighlighted ? 1.5 : isInSearchPath ? 1.2 : 1.0;
      const scale = 1.2 + Math.sin(state.clock.elapsedTime * 3) * 0.1 * pulseIntensity;
      glowRef.current.scale.setScalar(scale);
    }
  });

  // Format number to always show two digits
  const formattedValue = value.toString().padStart(2, '0');

  return (
    <group>
      {/* Glow effect */}
      <mesh ref={glowRef} scale={1.2}>
        <sphereGeometry args={[1, 32, 32]} />
        <primitive object={glowMaterial} />
      </mesh>
      
      {/* Main metallic sphere */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={material} />
      </mesh>
      
      {/* Neon number text */}
      <Text
        position={[0, 0, 1.1]}
        fontSize={0.6}
        color={isHighlighted ? '#ffffff' : isInSearchPath ? '#ffffff' : '#00ff88'}
        anchorX="center"
        anchorY="middle"
      >
        {formattedValue}
      </Text>
      
      {/* Additional sparkle effects for highlighted nodes */}
      {isHighlighted && (
        <>
          <pointLight
            position={[0, 0, 0]}
            intensity={2}
            distance={5}
            color="#ff6b35"
          />
          <mesh position={[2, 0, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#ff6b35" transparent opacity={0.8} />
          </mesh>
          <mesh position={[-2, 0, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#ff6b35" transparent opacity={0.8} />
          </mesh>
        </>
      )}
    </group>
  );
}
