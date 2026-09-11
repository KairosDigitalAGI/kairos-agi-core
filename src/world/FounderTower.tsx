import { Float, Html, OrbitControls, PerspectiveCamera, Sparkles } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useState } from 'react'
import { OfficeGeometry } from './OfficeGeometry'
import type { Department } from './departments'
import type { FounderAgent } from '../types'

interface WorldProps { department: Department; agents: FounderAgent[]; onSelect: (agent: FounderAgent) => void }

function AgentNpc({ agent, selected, onSelect }: { agent: FounderAgent; selected: boolean; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Float speed={1.4} rotationIntensity={0.08} floatIntensity={0.16} position={agent.position}>
      <group
        onClick={(event) => { event.stopPropagation(); onSelect() }}
        onPointerOver={(event) => { event.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
        scale={hovered || selected ? .65 : .5}
      >
        <mesh position={[0, 1.18, 0]} castShadow><sphereGeometry args={[0.34, 24, 24]} /><meshStandardMaterial color="#111827" metalness={0.85} roughness={0.22} emissive={agent.color} emissiveIntensity={selected ? 0.8 : 0.22} /></mesh>
        <mesh position={[0, 0.58, 0]} castShadow><capsuleGeometry args={[0.32, 0.58, 8, 20]} /><meshStandardMaterial color="#10131d" metalness={0.72} roughness={0.28} /></mesh>
        <mesh position={[0, 1.2, 0.31]}><boxGeometry args={[0.3, 0.09, 0.04]} /><meshBasicMaterial color={agent.color} /></mesh>
        <mesh position={[-0.43, 0.62, 0]} rotation={[0, 0, -0.2]}><capsuleGeometry args={[0.075, 0.45, 6, 12]} /><meshStandardMaterial color={agent.color} metalness={0.5} /></mesh>
        <mesh position={[0.43, 0.62, 0]} rotation={[0, 0, 0.2]}><capsuleGeometry args={[0.075, 0.45, 6, 12]} /><meshStandardMaterial color={agent.color} metalness={0.5} /></mesh>
        <pointLight position={[0, 1.15, 0.35]} color={agent.color} intensity={selected ? 2.8 : 1.25} distance={3} />
        {(hovered || selected) && <Html position={[0, 2.05, 0]} center distanceFactor={7.5} transform={false}>
          <button className={`npc-bubble ${selected ? 'selected' : ''}`} onClick={onSelect}>
            <strong>{agent.name}</strong><span>{agent.task}</span><i><b style={{ width: `${agent.progress}%`, background: agent.color }} /></i>
          </button>
        </Html>}
      </group>
    </Float>
  )
}

function TowerScene({ department, agents, onSelect, selectedId }: WorldProps & { selectedId?: FounderAgent['id'] }) {
  return (
    <>
      <color attach="background" args={['#04050a']} />
      <fog attach="fog" args={['#060713', 8, 22]} />
      <PerspectiveCamera makeDefault position={department.camera.map(value => value * .3) as [number, number, number]} fov={55} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 8, 3]} intensity={2.2} color="#dbeafe" castShadow />
      <pointLight position={[-5, 2, -3]} color="#7c3aed" intensity={8} distance={12} />
      <pointLight position={[5, 2, 1]} color="#0ea5e9" intensity={5} distance={10} />
      <OfficeGeometry color={department.color} scale={0.3} />
      <Sparkles count={70} scale={[9, 4, 6]} size={1.4} speed={0.2} color="#8b5cf6" />
      {agents.map((agent) => <AgentNpc key={agent.id} agent={agent} selected={selectedId === agent.id} onSelect={() => onSelect(agent)} />)}
      <OrbitControls enablePan={false} minDistance={2.5} maxDistance={16} minPolarAngle={0.75} maxPolarAngle={1.35} target={department.target.map(value => value * .3) as [number, number, number]} />
    </>
  )
}

export function FounderTower({ department, agents, selected, onSelect }: WorldProps & { selected: FounderAgent }) {
  return (
    <div className="world-canvas" role="img" aria-label={`Escritório com ${agents.length} agentes configurados, executores desconectados`}>
      <Canvas shadows dpr={[1, 1.7]} gl={{ antialias: true }}>
        <Suspense fallback={null}><TowerScene department={department} agents={agents} selectedId={selected.id} onSelect={onSelect} /></Suspense>
      </Canvas>
    </div>
  )
}
