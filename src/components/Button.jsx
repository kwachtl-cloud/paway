export default function Button({ 
  variant = 'primary', 
  children, 
  className = '',
  disabled = false,
  ...props 
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-lime-1 to-lime-2 text-lime-dark shadow-md hover:shadow-lg',
    secondary: 'bg-card-2 text-text-dark border border-border',
    ghost: 'bg-transparent text-text-dark',
    outline: 'bg-transparent text-lime-2 border-2 border-lime-2 hover:bg-lime-1/10',
  }
  
  return (
    <button
      className={`
        font-poppins font-semibold px-6 py-3 rounded-xl 
        active:scale-95 transition-transform
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
