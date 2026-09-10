export function ProgressBar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${value}%`, background: color }} />
    </div>
  )
}
