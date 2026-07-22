export default function WhiteCard({ children, className = '', style = {} }) {
  return (
    <div 
      className={`card-white px-5 py-6 min-h-screen ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}
