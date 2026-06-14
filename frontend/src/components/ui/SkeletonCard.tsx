interface Props {
  lines?: number
  height?: string
}

function Pulse({ className }: { className: string }) {
  return <div className={`bg-dark-200 rounded-lg animate-pulse ${className}`} />
}

export default function SkeletonCard({ lines = 3, height = 'h-40' }: Props) {
  return (
    <div className={`card p-5 ${height} flex flex-col gap-3`}>
      <div className="flex items-center gap-3">
        <Pulse className="w-10 h-10 rounded-xl" />
        <div className="flex-1 flex flex-col gap-2">
          <Pulse className="h-3 w-24" />
          <Pulse className="h-3 w-16" />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <Pulse key={i} className={`h-3 ${i % 2 === 0 ? 'w-full' : 'w-3/4'}`} />
      ))}
    </div>
  )
}
