const result = ref(false)
let checked = false

function checkSupport(): boolean {
  if (typeof document === 'undefined') return false
  const canvas = document.createElement('canvas')
  canvas.width = 20
  canvas.height = 20
  const ctx = canvas.getContext('2d')
  if (!ctx) return false

  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, 20, 20)
  ctx.font = '14px serif'
  ctx.fillText('🏴󠁧󠁢󠁥󠁮󠁧󠁿', 0, 14)

  const data = ctx.getImageData(0, 0, 20, 20).data
  const hasColor = Array.from({ length: data.length / 4 }, (_, i) => i * 4)
    .some(i => {
      const r = data[i]!, g = data[i + 1]!, b = data[i + 2]!
      return !(r === 255 && g === 255 && b === 255) && !(r < 30 && g < 30 && b < 30)
    })

  return !hasColor
}

export function useSubdivisionFlagSupport() {
  if (!checked && import.meta.client) {
    checked = true
    result.value = checkSupport()
  }
  return result
}
