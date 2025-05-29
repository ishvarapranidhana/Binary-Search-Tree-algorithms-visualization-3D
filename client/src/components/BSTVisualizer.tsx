import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { useBST } from "../lib/stores/useBST";
import MetallicSphere from "./MetallicSphere";
import ParticleSystem from "./ParticleSystem";
import * as THREE from "three";

interface NodePosition {
  x: number;
  y: number;
  z: number;
}

export default function BSTVisualizer() {
  const groupRef = useRef<Group>(null);
  const { tree, searchPath, isSearching } = useBST();



  // Calculate node subtree width to prevent edge crossings
  const getSubtreeWidth = (node: any): number => {
    if (!node) return 0;
    if (!node.left && !node.right) return 1;
    
    const leftWidth = getSubtreeWidth(node.left);
    const rightWidth = getSubtreeWidth(node.right);
    return leftWidth + rightWidth;
  };

  // Calculate positions for nodes in the tree preventing edge crossings
  const calculateNodePositions = (node: any, depth = 0, leftBound = -50, rightBound = 50): Map<number, NodePosition> => {
    const positions = new Map<number, NodePosition>();
    
    if (!node) return positions;
    
    // Sphere radius is 1, minimum padding is 1/3 = 0.33
    const sphereRadius = 1;
    const minPadding = sphereRadius / 3;
    const minVerticalSpacing = (sphereRadius * 2) + (minPadding * 2);
    const actualVerticalSpacing = Math.max(3.5, minVerticalSpacing * 1.0);
    
    // Calculate subtree widths
    const leftSubtreeWidth = getSubtreeWidth(node.left);
    const rightSubtreeWidth = getSubtreeWidth(node.right);
    const totalWidth = leftSubtreeWidth + rightSubtreeWidth;
    
    // Position this node in the center of its allocated space
    const centerX = (leftBound + rightBound) / 2;
    const y = -depth * actualVerticalSpacing;
    const z = 0;
    
    positions.set(node.value, { x: centerX, y, z });
    
    // Allocate space for children based on their subtree sizes
    if (node.left || node.right) {
      const availableWidth = rightBound - leftBound;
      const minSpacing = 2; // Minimum spacing between subtrees (50% closer)
      
      if (totalWidth > 0) {
        const leftRatio = leftSubtreeWidth / totalWidth;
        const rightRatio = rightSubtreeWidth / totalWidth;
        
        // Calculate boundaries ensuring minimum spacing
        const leftWidth = Math.max(leftRatio * (availableWidth - minSpacing), minSpacing);
        const rightWidth = Math.max(rightRatio * (availableWidth - minSpacing), minSpacing);
        
        const leftRightBound = leftBound + leftWidth;
        const rightLeftBound = leftRightBound + minSpacing;
        
        if (node.left) {
          const leftPositions = calculateNodePositions(
            node.left, 
            depth + 1, 
            leftBound,
            leftRightBound
          );
          leftPositions.forEach((pos, value) => positions.set(value, pos));
        }
        
        if (node.right) {
          const rightPositions = calculateNodePositions(
            node.right, 
            depth + 1, 
            rightLeftBound,
            rightBound
          );
          rightPositions.forEach((pos, value) => positions.set(value, pos));
        }
      }
    }
    
    return positions;
  };

  // Get all nodes in the tree
  const getAllNodes = (node: any): any[] => {
    if (!node) return [];
    return [node, ...getAllNodes(node.left), ...getAllNodes(node.right)];
  };

  const nodePositions = tree ? calculateNodePositions(tree) : new Map();
  const allNodes = tree ? getAllNodes(tree) : [];

  // Create neon connections between nodes
  const createConnections = () => {
    const connections: JSX.Element[] = [];
    
    const addConnection = (parent: any, child: any, index: number) => {
      const parentPos = nodePositions.get(parent.value);
      const childPos = nodePositions.get(child.value);
      
      if (parentPos && childPos) {
        const start = new THREE.Vector3(parentPos.x, parentPos.y, parentPos.z);
        const end = new THREE.Vector3(childPos.x, childPos.y, childPos.z);
        const direction = end.clone().sub(start);
        const length = direction.length();
        const midpoint = start.clone().add(direction.clone().multiplyScalar(0.5));
        
        // Check if this connection is part of the search path
        const isInSearchPath = searchPath.includes(parent.value) && searchPath.includes(child.value);
        const parentIndex = searchPath.indexOf(parent.value);
        const childIndex = searchPath.indexOf(child.value);
        const isConsecutiveInPath = isInSearchPath && Math.abs(parentIndex - childIndex) === 1;
        
        // Calculate rotation to align cylinder with the connection line
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
        
        // Colors based on search path
        const tubeColor = isConsecutiveInPath ? "#ff6b35" : "#00ff44";
        const coreColor = isConsecutiveInPath ? "#ffaa66" : "#88ff88";
        const glowColor = isConsecutiveInPath ? "#ff6b35" : "#00ff44";
        const lightColor = isConsecutiveInPath ? "#ff6b35" : "#00ff44";
        const intensity = isConsecutiveInPath ? 1.2 : 0.8;
        const glowIntensity = isConsecutiveInPath ? 0.8 : 0.5;
        
        connections.push(
          <group key={`connection-${index}`} position={[midpoint.x, midpoint.y, midpoint.z]}>
            {/* Main neon tube */}
            <mesh quaternion={quaternion}>
              <cylinderGeometry args={[0.08, 0.08, length, 16]} />
              <meshStandardMaterial 
                color={tubeColor} 
                emissive={tubeColor}
                emissiveIntensity={intensity}
                transparent
                opacity={0.9}
              />
            </mesh>
            
            {/* Inner bright core */}
            <mesh quaternion={quaternion}>
              <cylinderGeometry args={[0.04, 0.04, length, 8]} />
              <meshBasicMaterial 
                color={coreColor}
                transparent
                opacity={1.0}
              />
            </mesh>
            
            {/* Outer glow effect */}
            <mesh quaternion={quaternion}>
              <cylinderGeometry args={[0.15, 0.15, length, 8]} />
              <meshBasicMaterial 
                color={glowColor}
                transparent
                opacity={isConsecutiveInPath ? 0.4 : 0.2}
                side={THREE.BackSide}
              />
            </mesh>
            
            {/* Point light for neon glow */}
            <pointLight
              position={[0, 0, 0]}
              intensity={glowIntensity}
              distance={3}
              color={lightColor}
            />
          </group>
        );
      }
    };

    const traverse = (node: any) => {
      if (!node) return;
      
      if (node.left) {
        addConnection(node, node.left, connections.length);
        traverse(node.left);
      }
      
      if (node.right) {
        addConnection(node, node.right, connections.length);
        traverse(node.right);
      }
    };

    if (tree) traverse(tree);
    return connections;
  };

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle rotation animation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Render connections */}
      {createConnections()}
      
      {/* Render nodes */}
      {allNodes.map((node, index) => {
        const position = nodePositions.get(node.value);
        if (!position) return null;
        
        const isInSearchPath = searchPath.includes(node.value);
        const isCurrentlySearching = isSearching && isInSearchPath;
        
        return (
          <group key={node.value} position={[position.x, position.y, position.z]}>
            <MetallicSphere 
              value={node.value}
              isHighlighted={isCurrentlySearching}
              isInSearchPath={isInSearchPath}
            />
            <ParticleSystem 
              position={[0, 0, 0]}
              isActive={isCurrentlySearching}
            />
          </group>
        );
      })}
      
      {/* Ground plane for reference */}
      <mesh position={[0, -8, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color="#111" 
          transparent 
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}
