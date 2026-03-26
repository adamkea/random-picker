import { memo } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

const LottieRacer = memo(function LottieRacer({ src, size = 40, speed = 1, playing = true, className = '' }) {
  return (
    <div
      className={`lottie-racer ${className}`}
      style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <DotLottieReact
        src={src}
        loop
        autoplay={playing}
        speed={speed}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
})

export default LottieRacer
