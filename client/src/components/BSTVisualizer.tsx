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

  // Debug logging
  console.log("BSTVisualizer render:", { tree, searchPath, isSearching });

  // Calculate positions for nodes in the tree
  const calculateNodePositions = (node: any, depth = 0, offset = 0, spread = 8): Map<number, NodePosition> => {
    const positions = new Map<number, NodePosition>();
    
    if (!node) return positions;
    
    const x = offset;
    const y = -depth * 3; // Vertical spacing between levels
    const z = 0;
    
    positions.set(node.value, { x, y, z });
    
    // Calculate positions for children
    const childSpread = spread / 2;
    
    if (node.left) {
      const leftPositions = calculateNodePositions(
        node.left, 
        depth + 1, 
        offset - childSpread, 
        childSpread
      );
      leftPositions.forEach((pos, value) => positions.set(value, pos));
    }
    
    if (node.right) {
      const rightPositions = calculateNodePositions(
        node.right, 
        depth + 1, 
        offset + childSpread, 
        childSpread
      );
      rightPositions.forEach((pos, value) => positions.set(value, pos));
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

  // Create connections between nodes
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
        
        connections.push(
          <group key={`connection-${index}`} position={[midpoint.x, midpoint.y, midpoint.z]}>
            <mesh rotation={[0, 0, Math.atan2(direction.y, direction.x)]}>
              <cylinderGeometry args={[0.05, 0.05, length, 8]} />
              <meshStandardMaterial 
                color="#333" 
                emissive="#111"
                transparent
                opacity={0.6}
              />
            </mesh>
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
