interface IconoCerrarProps {
    color: string;
  }
export const IconoCerrar: React.FC<IconoCerrarProps>  = ({ color}) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeinecap="round" strokeLinejoin="round"><path d="m9 6-6 6 6 6"/><path d="M3 12h14"/><path d="M21 19V5"/></svg>
  )
}