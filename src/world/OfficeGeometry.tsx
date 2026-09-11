import { useEffect, useMemo } from 'react'
import { createOffice, disposeOffice } from './legacy/officeGeometry.js'
export function OfficeGeometry({ color = '#7c3aed', scale = 1 }: { color?: string; scale?: number }) {
  const office = useMemo(() => createOffice(color), [color])
  useEffect(() => () => disposeOffice(office), [office])
  return <primitive object={office} scale={scale} />
}
