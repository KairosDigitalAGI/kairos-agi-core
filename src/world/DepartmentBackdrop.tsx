import { Component, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { OfficeGeometry } from './OfficeGeometry'
import type { Department } from './departments'
function CameraJourney({ department, reduced }: { department: Department; reduced: boolean }) {
  const { camera, invalidate } = useThree()
  const target = useRef(new Vector3(...department.target))
  const destination = useMemo(() => new Vector3(...department.camera), [department])
  const gaze = useMemo(() => new Vector3(...department.target), [department])
  useEffect(() => { invalidate() }, [department, invalidate, reduced])
  useFrame((_, delta) => {
    const alpha = reduced ? 1 : 1 - Math.exp(-Math.min(delta, .05) * 4)
    camera.position.lerp(destination, alpha); target.current.lerp(gaze, alpha); camera.lookAt(target.current)
    if (camera.position.distanceTo(destination) > .01 || target.current.distanceTo(gaze) > .01) invalidate()
  })
  return null
}
class BackgroundBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? null : this.props.children }
}
export function DepartmentBackdrop({ department, reduced }: { department: Department; reduced: boolean }) {
  return <div className="department-backdrop" aria-hidden="true"><BackgroundBoundary>
    <Canvas frameloop="demand" dpr={[1, 1.25]} camera={{ position: department.camera, fov: 55 }} gl={{ antialias: false, powerPreference: 'low-power' }} fallback={<div />}>
      <color attach="background" args={['#070910']} /><fog attach="fog" args={['#070910', 25, 65]} />
      <ambientLight intensity={1.3} /><hemisphereLight args={['#a9c4ff', '#261132', 2]} />
      <pointLight position={[-12, 7, -4]} color={department.color} intensity={180} distance={50} />
      <pointLight position={[12, 7, 5]} color="#1287f8" intensity={160} distance={50} />
      <OfficeGeometry color={department.color} /><CameraJourney department={department} reduced={reduced} />
    </Canvas>
  </BackgroundBoundary></div>
}
