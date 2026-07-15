import { useEffect, useRef } from 'react'

const COLORS = [
  '#00f0f0', '#f0f000', '#a000f0', '#f0a000', '#f00000',
  '#00f000', '#ff6b9d', '#ffffff', '#47bfff', '#ff4500',
]

const CONFETTI_COLORS = ['#00f0f0', '#f0f000', '#a000f0', '#f0a000', '#ff6b9d', '#00f000']

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

function pickColors(count) {
  const shuffled = [...COLORS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function createRingBurst(x, y, color) {
  const count = 60
  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count
    const speed = randomBetween(3, 6)
    return {
      type: 'spark',
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: randomBetween(55, 90),
      maxLife: 90,
      size: randomBetween(2, 3.5),
      color,
      gravity: 0.05,
      friction: 0.98,
      glow: true,
    }
  })
}

function createChrysanthemum(x, y) {
  const colors = pickColors(3)
  const particles = []

  colors.forEach((color, ring) => {
    const count = 36 + ring * 12
    const speedBase = 2.5 + ring * 1.8
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + ring * 0.2
      const speed = speedBase + randomBetween(-0.5, 0.5)
      particles.push({
        type: 'spark',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: randomBetween(70, 110),
        maxLife: 110,
        size: randomBetween(1.5, 3),
        color,
        gravity: 0.04,
        friction: 0.985,
        glow: true,
        trail: [],
      })
    }
  })

  return particles
}

function createWillowBurst(x, y, color) {
  const count = 50
  return Array.from({ length: count }, () => {
    const angle = randomBetween(0, Math.PI * 2)
    const speed = randomBetween(2, 7)
    return {
      type: 'willow',
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: randomBetween(90, 140),
      maxLife: 140,
      size: randomBetween(1.5, 2.5),
      color,
      gravity: 0.07,
      friction: 0.99,
      glow: true,
      trail: [],
    }
  })
}

function createGlitterBurst(x, y) {
  const count = 80
  return Array.from({ length: count }, () => {
    const angle = randomBetween(0, Math.PI * 2)
    const speed = randomBetween(1, 8)
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
    return {
      type: 'glitter',
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: randomBetween(40, 80),
      maxLife: 80,
      size: randomBetween(1, 2.5),
      color,
      gravity: 0.03,
      friction: 0.97,
      twinkle: Math.random() * Math.PI * 2,
    }
  })
}

function createExplosion(x, y) {
  const roll = Math.random()
  if (roll < 0.35) return createChrysanthemum(x, y)
  if (roll < 0.6) {
    const colors = pickColors(2)
    return [
      ...createRingBurst(x, y, colors[0]),
      ...createWillowBurst(x, y, colors[1]),
    ]
  }
  if (roll < 0.85) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
    return [
      ...createRingBurst(x, y, color),
      ...createGlitterBurst(x, y),
    ]
  }
  const colors = pickColors(3)
  return colors.flatMap((color) => createRingBurst(x, y, color))
}

function createRocket(width, height) {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)]
  return {
    x: randomBetween(width * 0.08, width * 0.92),
    y: height + 10,
    vy: randomBetween(-10, -14),
    targetY: randomBetween(height * 0.08, height * 0.6),
    color,
    trail: [],
  }
}

function createConfetti(width) {
  return {
    type: 'confetti',
    x: randomBetween(0, width),
    y: randomBetween(-40, -10),
    vx: randomBetween(-1.5, 1.5),
    vy: randomBetween(2, 5),
    w: randomBetween(6, 12),
    h: randomBetween(4, 8),
    rotation: randomBetween(0, Math.PI * 2),
    spin: randomBetween(-0.15, 0.15),
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    life: randomBetween(120, 180),
    maxLife: 180,
    gravity: 0.04,
  }
}

function drawParticle(ctx, particle) {
  const alpha = particle.life / particle.maxLife

  if (particle.type === 'confetti') {
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.translate(particle.x, particle.y)
    ctx.rotate(particle.rotation)
    ctx.fillStyle = particle.color
    ctx.fillRect(-particle.w / 2, -particle.h / 2, particle.w, particle.h)
    ctx.restore()
    return
  }

  if (particle.trail?.length) {
    particle.trail.forEach((point, index) => {
      const trailAlpha = (index / particle.trail.length) * alpha * 0.5
      ctx.globalAlpha = trailAlpha
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(point.x, point.y, particle.size * 0.7, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  let displayAlpha = alpha
  if (particle.type === 'glitter') {
    displayAlpha *= 0.5 + 0.5 * Math.abs(Math.sin(particle.twinkle))
  }

  ctx.globalAlpha = displayAlpha
  ctx.fillStyle = particle.color

  if (particle.glow) {
    ctx.shadowBlur = 12
    ctx.shadowColor = particle.color
  }

  ctx.beginPath()
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
  ctx.fill()

  if (particle.glow) {
    ctx.shadowBlur = 0
  }

  ctx.globalAlpha = 1
}

export default function Fireworks({ active }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId = 0
    let particles = []
    let rockets = []
    let frame = 0
    const duration = 360
    const timeouts = []

    const schedule = (fn, delay) => {
      const id = setTimeout(fn, delay)
      timeouts.push(id)
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 5; i++) {
      schedule(() => {
        rockets.push(createRocket(canvas.width, canvas.height))
      }, i * 120)
    }

    for (let i = 0; i < 40; i++) {
      particles.push(createConfetti(canvas.width))
    }

    const tick = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      frame++

      if (frame % 10 === 0 && frame < duration - 40) {
        rockets.push(createRocket(canvas.width, canvas.height))
      }

      if (frame % 8 === 0 && frame < duration - 20) {
        particles.push(createConfetti(canvas.width))
      }

      if (frame % 45 === 0 && frame < duration - 80) {
        const x = randomBetween(canvas.width * 0.2, canvas.width * 0.8)
        const y = randomBetween(canvas.height * 0.15, canvas.height * 0.45)
        particles.push(...createExplosion(x, y))
      }

      rockets = rockets.filter((rocket) => {
        rocket.y += rocket.vy
        rocket.trail.push({ x: rocket.x, y: rocket.y })
        if (rocket.trail.length > 14) rocket.trail.shift()

        rocket.trail.forEach((point, index) => {
          const trailAlpha = index / rocket.trail.length
          ctx.globalAlpha = trailAlpha
          ctx.fillStyle = rocket.color
          ctx.shadowBlur = 8
          ctx.shadowColor = rocket.color
          ctx.beginPath()
          ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        })
        ctx.globalAlpha = 1

        ctx.fillStyle = '#fff'
        ctx.shadowBlur = 10
        ctx.shadowColor = '#fff'
        ctx.beginPath()
        ctx.arc(rocket.x, rocket.y, 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        if (rocket.y <= rocket.targetY) {
          particles.push(...createExplosion(rocket.x, rocket.y))
          if (Math.random() > 0.4) {
            schedule(() => {
              particles.push(...createGlitterBurst(rocket.x, rocket.y))
            }, 150)
          }
          return false
        }

        return true
      })

      particles = particles.filter((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy += particle.gravity ?? 0.05
        if (particle.friction) {
          particle.vx *= particle.friction
          particle.vy *= particle.friction
        }
        if (particle.type === 'confetti') {
          particle.rotation += particle.spin
        }
        if (particle.twinkle !== undefined) {
          particle.twinkle += 0.3
        }
        if (particle.trail) {
          particle.trail.push({ x: particle.x, y: particle.y })
          if (particle.trail.length > 6) particle.trail.shift()
        }
        particle.life -= 1

        drawParticle(ctx, particle)
        return particle.life > 0
      })

      if (frame < duration) {
        animationId = requestAnimationFrame(tick)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    animationId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animationId)
      timeouts.forEach(clearTimeout)
      window.removeEventListener('resize', resize)
    }
  }, [active])

  if (!active) return null

  return <canvas ref={canvasRef} className="fireworks-canvas" aria-hidden="true" />
}
