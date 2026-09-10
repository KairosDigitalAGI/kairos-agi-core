import { Float, Grid, Html, OrbitControls, PerspectiveCamera, Sparkles } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useState } from 'react'
import type { FounderAgent } from '../types'
import { agents } from '../data/mock'

interface WorldProps { onSelect: (agent: FounderAgent) => void }

function AgentNpc({ agent, selected, onSelect }: { agent: FounderAgent; selected: boolean; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Float speed={1.4} rotationIntensity={0.08} floatIntensity={0.16} position={agent.position}>
      <group
        onClick={(event) => { event.stopPropagation(); onSelect() }}
        onPointerOver={(event) => { event.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
        scale={hovered || selected ? 1.08 : 1}
      >
        <mesh position={[0, 1.18, 0]} castShadow><sphereGeometry args={[0.34, 24, 24]} /><meshStandardMaterial color="#111827" metalness={0.85} roughness={0.22} emissive={agent.color} emissiveIntensity={selected ? 0.8 : 0.22} /></mesh>
        <mesh position={[0, 0.58, 0]} castShadow><capsuleGeometry args={[0.32, 0.58, 8, 20]} /><meshStandardMaterial color="#10131d" metalness={0.72} roughness={0.28} /></mesh>
        <mesh position={[0, 1.2, 0.31]}><boxGeometry args={[0.3, 0.09, 0.04]} /><meshBasicMaterial color={agent.color} /></mesh>
        <mesh position={[-0.43, 0.62, 0]} rotation={[0, 0, -0.2]}><capsuleGeometry args={[0.075, 0.45, 6, 12]} /><meshStandardMaterial color={agent.color} metalness={0.5} /></mesh>
        <mesh position={[0.43, 0.62, 0]} rotation={[0, 0, 0.2]}><capsuleGeometry args={[0.075, 0.45, 6, 12]} /><meshStandardMaterial color={agent.color} metalness={0.5} /></mesh>
        <pointLight position={[0, 1.15, 0.35]} color={agent.color} intensity={selected ? 2.8 : 1.25} distance={3} />
        <Html position={[0, 2.05, 0]} center distanceFactor={7.5} transform={false}>
          <button className={`npc-bubble ${selected ? 'selected' : ''}`} onClick={onSelect}>
            <strong>{agent.name}</strong><span>{agent.task}</span><i><b style={{ width: `${agent.progress}%`, background: agent.color }} /></i>
          </button>
        </Html>
      </group>
    </Float>
  )
}

function TowerScene({ onSelect, selectedId }: WorldProps & { selectedId?: FounderAgent['id'] }) {
  return (
    <>
      <color attach="background" args={['#04050a']} />
      <fog attach="fog" args={['#060713', 8, 22]} />
      <PerspectiveCamera makeDefault position={[0, 4.2, 8.5]} fov={46} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 8, 3]} intensity={2.2} color="#dbeafe" castShadow />
      <pointLight position={[-5, 2, -3]} color="#7c3aed" intensity={8} distance={12} />
      <pointLight position={[5, 2, 1]} color="#0ea5e9" intensity={5} distance={10} />
      <mesh position={[0, -0.1, 0]} receiveShadow><boxGeometry args={[10, 0.15, 7]} /><meshStandardMaterial color="#090b14" metalness={0.65} roughness={0.38} /></mesh>
      <Grid position={[0, 0, 0]} args={[10, 7]} cellColor="#241047" sectionColor="#7c3aed" cellSize={0.5} sectionSize={2} fadeDistance={14} infiniteGrid={false} />
      <mesh position={[0, 2.5, -3.45]}><boxGeometry args={[10, 5, 0.12]} /><meshStandardMaterial color="#080b15" metalness={0.72} roughness={0.25} /></mesh>
      <mesh position={[0, 2.5, -3.36]}><planeGeometry args={[5.5, 2.3]} /><meshBasicMaterial color="#0b1838" transparent opacity={0.7} /></mesh>
      <mesh position={[0, 2.5, -3.28]}><ringGeometry args={[0.85, 1, 64]} /><meshBasicMaterial color="#8b5cf6" /></mesh>
      <Sparkles count={70} scale={[9, 4, 6]} size={1.4} speed={0.2} color="#8b5cf6" />
      {agents.map((agent) => <AgentNpc key={agent.id} agent={agent} selected={selectedId === agent.id} onSelect={() => onSelect(agent)} />)}
      <OrbitControls enablePan={false} minDistance={6.5} maxDistance={11} minPolarAngle={0.75} maxPolarAngle={1.35} target={[0, 0.8, -0.4]} />
    </>
  )
}

export function FounderTower({ selected, onSelect }: { selected: FounderAgent; onSelect: (agent: FounderAgent) => void }) {
  return (
    <div className="world-canvas" role="img" aria-label="Sala futurista da Founder Tower com quatro agentes operacionais">
      <Canvas shadows dpr={[1, 1.7]} gl={{ antialias: true }}>
        <Suspense fallback={null}><TowerScene selectedId={selected.id} onSelect={onSelect} /></Suspense>
      </Canvas>
    </div>
  )
}
