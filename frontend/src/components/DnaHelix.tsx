import { useEffect, useRef } from 'react'

export default function DnaHelix() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let animationId: number
    let time = 0

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const w = rect.width
      const h = rect.height

      ctx.clearRect(0, 0, w, h)

      const helixCount = 2
      const amplitude = Math.min(w * 0.08, 60)
      const verticalSpacing = 18
      const basePairGap = 4 // gap between base pair rungs and strand
      const numPoints = Math.ceil(h / verticalSpacing) + 1

      for (let helix = 0; helix < helixCount; helix++) {
        const centerX = helix === 0 ? w * 0.7 : w * 0.35
        const phaseOffset = helix * 1.5

        // Collect points for both strands
        const strand1: { x: number; y: number; z: number }[] = []
        const strand2: { x: number; y: number; z: number }[] = []

        for (let i = 0; i < numPoints; i++) {
          const y = i * verticalSpacing
          const t = (y / h) * Math.PI * 4 + time * 0.6 + phaseOffset
          const x1 = centerX + Math.sin(t) * amplitude
          const x2 = centerX + Math.sin(t + Math.PI) * amplitude
          const z1 = Math.cos(t)
          const z2 = Math.cos(t + Math.PI)
          strand1.push({ x: x1, y, z: z1 })
          strand2.push({ x: x2, y, z: z2 })
        }

        // Draw base pairs (rungs) behind strands
        for (let i = 0; i < numPoints; i++) {
          if (i % 2 !== 0) continue
          const p1 = strand1[i]
          const p2 = strand2[i]
          const depth = (p1.z + p2.z) / 2
          const alpha = 0.08 + depth * 0.04

          // Shorten the rung so it doesn't overlap the strand dots
          const dx = p2.x - p1.x
          const dy = p2.y - p1.y
          const len = Math.sqrt(dx * dx + dy * dy)
          if (len < basePairGap * 2) continue
          const ux = dx / len
          const uy = dy / len
          const startX = p1.x + ux * basePairGap
          const startY = p1.y + uy * basePairGap
          const endX = p2.x - ux * basePairGap
          const endY = p2.y - uy * basePairGap

          // Alternate base pair colors (ATGC-inspired)
          const colors = [
            `rgba(78, 186, 111, ${alpha})`,  // green (A)
            `rgba(86, 152, 214, ${alpha})`,  // blue (T)
            `rgba(241, 179, 0, ${alpha})`,   // gold (G)
            `rgba(214, 86, 86, ${alpha})`,   // red (C)
          ]
          ctx.strokeStyle = colors[i % 4]
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.moveTo(startX, startY)
          ctx.lineTo(endX, endY)
          ctx.stroke()
        }

        // Draw strands
        for (let s = 0; s < 2; s++) {
          const strand = s === 0 ? strand1 : strand2
          ctx.beginPath()
          for (let i = 0; i < strand.length; i++) {
            const { x, y } = strand[i]
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.strokeStyle = 'rgba(241, 179, 0, 0.25)'
          ctx.lineWidth = 2
          ctx.stroke()

          // Draw nodes at each point
          for (let i = 0; i < strand.length; i++) {
            const { x, y, z } = strand[i]
            const size = 2 + z * 1
            const alpha = 0.2 + z * 0.1
            ctx.beginPath()
            ctx.arc(x, y, Math.max(size, 1), 0, Math.PI * 2)
            ctx.fillStyle = `rgba(241, 179, 0, ${alpha})`
            ctx.fill()
          }
        }
      }

      if (!prefersReducedMotion) {
        time += 0.015
      }
      animationId = requestAnimationFrame(draw)
    }

    resize()
    draw()

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    return () => {
      cancelAnimationFrame(animationId)
      observer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.4 }}
      aria-hidden="true"
    />
  )
}
