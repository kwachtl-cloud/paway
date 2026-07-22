export default function Card({ children, className = '', onClick }) {
  return (
    <div 
      className={`card-item ${onClick ? 'cursor-pointer hover:shadow-md' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
