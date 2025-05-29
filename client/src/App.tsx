import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { OrbitControls, Environment } from "@react-three/drei";
import BSTVisualizer from "./components/BSTVisualizer";
import ControlPanel from "./components/ControlPanel";
import "@fontsource/inter";
import "./index.css";

function App() {
  return (
    <div className="w-full h-screen relative overflow-hidden bg-gray-900">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{
          position: [0, 8, 15],
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          powerPreference: "high-performance"
        }}
      >
        <color attach="background" args={["#0a0a0a"]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff6b35" />
        <pointLight position={[10, -10, 10]} intensity={0.5} color="#00ff88" />
        
        {/* Environment for reflections */}
        <Environment preset="night" />
        
        {/* Camera Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          target={[0, 0, 0]}
        />
        
        {/* Main BST Visualizer */}
        <Suspense fallback={null}>
          <BSTVisualizer />
        </Suspense>
      </Canvas>
      
      {/* UI Overlay */}
      <ControlPanel />
    </div>
  );
}

export default App;
