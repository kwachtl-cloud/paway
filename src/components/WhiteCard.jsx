export default function WhiteCard({ children, className = '', style = {} }) {
  return (
    <div 
      className={`card-white px-5 py-5 min-h-[calc(100svh-8rem)] ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}
