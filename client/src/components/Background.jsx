const Background = () => {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      zIndex: -50, pointerEvents: 'none',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'var(--bg)',
        transition: 'background 0.4s ease',
      }} />
      {/* Soft blue glow top */}
      <div style={{
        position: 'absolute', top: '-10%', left: '30%',
        width: '600px', height: '500px',
        background: 'radial-gradient(ellipse, rgba(53,99,233,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {/* Soft yellow glow bottom */}
      <div style={{
        position: 'absolute', bottom: '0', right: '10%',
        width: '500px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(245,200,66,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}

export default Background