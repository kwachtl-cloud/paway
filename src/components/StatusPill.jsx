export default function StatusPill({ 
  color = 'lime', 
  children,
  className = ''
}) {
  const colors = {
    lime: 'pill-lime',
    blue: 'pill-blue',
    coral: 'pill-coral',
    amber: 'pill-amber',
    teal: 'pill-teal',
  }
  
  return (
    <span className={`pill ${colors[color]} ${className}`}>
      {children}
    </span>
  )
}
