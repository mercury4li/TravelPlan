import QRCode from 'qrcode'
import { AXIS_KEYS, AXIS_LABELS, type AxisDelta, type TravelType } from './scoring'
import { AXIS_VERDICTS, gradeOf } from './persona'

const CARD_WIDTH = 1080
const CARD_HEIGHT = 1800
const PAD = 76
const BG = '#f7f5ee'
const SURFACE = '#fffaf0'
const INK = '#253327'
const TEXT = '#4f5d51'
const MUTED = '#7d887d'
const ACCENT = '#4f8f5b'
const ACCENT_SOFT = '#dfeedd'
const BORDER = '#d9dfd5'

type Point = { x: number; y: number }

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string,
) {
  ctx.fillStyle = fillStyle
  roundedRect(ctx, x, y, width, height, radius)
  ctx.fill()
}

function strokeRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  strokeStyle: string,
) {
  ctx.strokeStyle = strokeStyle
  roundedRect(ctx, x, y, width, height, radius)
  ctx.stroke()
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  point: Point,
  options: {
    font: string
    fillStyle?: string
    align?: CanvasTextAlign
    maxWidth?: number
    lineHeight?: number
    maxLines?: number
  },
) {
  const {
    font,
    fillStyle = TEXT,
    align = 'left',
    maxWidth = CARD_WIDTH - PAD * 2,
    lineHeight = 42,
    maxLines = 3,
  } = options
  ctx.font = font
  ctx.fillStyle = fillStyle
  ctx.textAlign = align
  ctx.textBaseline = 'top'

  const chars = Array.from(text)
  const lines: string[] = []
  let line = ''
  for (const ch of chars) {
    const next = `${line}${ch}`
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = ch
      if (lines.length >= maxLines) break
    } else {
      line = next
    }
  }
  if (line && lines.length < maxLines) lines.push(line)

  lines.forEach((lineText, i) => {
    const suffix = i === maxLines - 1 && chars.join('').length > lines.join('').length ? '...' : ''
    ctx.fillText(`${lineText}${suffix}`, point.x, point.y + i * lineHeight)
  })

  return point.y + lines.length * lineHeight
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image load failed'))
    img.src = src
  })
}

function portraitUrl(typeId: number, siteUrl: string) {
  const imageId = String(typeId).padStart(2, '0')
  const extension = typeId === 18 ? 'svg' : 'png'
  return new URL(`tbti-types/type-${imageId}.${extension}`, siteUrl).toString()
}

function drawImageContain(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight)
  const drawWidth = image.naturalWidth * scale
  const drawHeight = image.naturalHeight * scale
  ctx.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  )
}

function drawPortrait(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  fillRoundRect(ctx, x, y, width, height, 28, '#ffffff')
  strokeRoundRect(ctx, x, y, width, height, 28, BORDER)

  ctx.save()
  roundedRect(ctx, x + 10, y + 10, width - 20, height - 20, 22)
  ctx.clip()
  fillRoundRect(ctx, x + 10, y + 10, width - 20, height - 20, 22, '#f2eadb')
  drawImageContain(ctx, image, x + 16, y + 16, width - 32, height - 32)
  ctx.restore()
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function formatAxisValue(value: number) {
  if (value === 0) return '0.00'
  return `${value > 0 ? '+' : '-'}${Math.abs(value).toFixed(2)}`
}

function drawAxis(
  ctx: CanvasRenderingContext2D,
  label: string,
  left: string,
  right: string,
  value: number,
  y: number,
) {
  const x = PAD
  const width = CARD_WIDTH - PAD * 2
  const markerX = x + ((value + 1) / 2) * width

  drawText(ctx, label, { x, y }, {
    font: '700 28px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
    fillStyle: INK,
    maxWidth: 60,
  })
  drawText(ctx, `${left} / ${right}`, { x: x + 52, y: y + 2 }, {
    font: '400 24px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
    fillStyle: MUTED,
    maxWidth: width - 220,
  })
  drawText(ctx, formatAxisValue(value), { x: x + width, y: y + 2 }, {
    font: '700 24px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
    fillStyle: ACCENT,
    align: 'right',
    maxWidth: 120,
  })

  fillRoundRect(ctx, x, y + 44, width, 14, 8, '#e8e1d2')
  fillRoundRect(ctx, x + width / 2 - 2, y + 40, 4, 22, 2, '#b8c0b5')
  fillRoundRect(ctx, markerX - 13, y + 36, 26, 26, 13, ACCENT)
}

async function buildQrImage(siteUrl: string) {
  const dataUrl = await QRCode.toDataURL(siteUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 220,
    color: {
      dark: INK,
      light: '#ffffff',
    },
  })
  return loadImage(dataUrl)
}

export async function exportShareCard(
  primary: TravelType,
  normalized: AxisDelta,
  siteUrl: string,
) {
  const canvas = document.createElement('canvas')
  canvas.width = CARD_WIDTH
  canvas.height = CARD_HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas unavailable')

  const portrait = await loadImage(portraitUrl(primary.id, siteUrl))

  ctx.fillStyle = BG
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)
  fillRoundRect(ctx, 36, 36, CARD_WIDTH - 72, CARD_HEIGHT - 72, 36, SURFACE)
  strokeRoundRect(ctx, 36, 36, CARD_WIDTH - 72, CARD_HEIGHT - 72, 36, BORDER)

  drawText(ctx, '旅格测试 TBTI', { x: PAD, y: 86 }, {
    font: '700 30px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
    fillStyle: ACCENT,
  })
  drawText(ctx, '我的旅行人格是', { x: PAD, y: 170 }, {
    font: '500 34px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
    fillStyle: MUTED,
  })
  drawText(ctx, primary.code, { x: PAD, y: 230 }, {
    font: '800 96px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
    fillStyle: INK,
    maxWidth: 590,
    lineHeight: 108,
    maxLines: 1,
  })
  drawText(ctx, primary.enTag, { x: PAD, y: 346 }, {
    font: '800 34px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
    fillStyle: ACCENT,
  })

  drawPortrait(ctx, portrait, CARD_WIDTH - PAD - 280, 132, 280, 420)

  fillRoundRect(ctx, PAD, 590, CARD_WIDTH - PAD * 2, 128, 24, ACCENT_SOFT)
  drawText(ctx, `「${primary.hook}」`, { x: PAD + 34, y: 626 }, {
    font: '700 34px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
    fillStyle: INK,
    maxWidth: CARD_WIDTH - PAD * 2 - 68,
    lineHeight: 44,
    maxLines: 2,
  })

  const descEnd = drawText(ctx, primary.description, { x: PAD, y: 776 }, {
    font: '400 30px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
    fillStyle: TEXT,
    maxWidth: CARD_WIDTH - PAD * 2,
    lineHeight: 46,
    maxLines: 3,
  })

  drawText(ctx, '维度画像', { x: PAD, y: descEnd + 42 }, {
    font: '800 28px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
    fillStyle: INK,
  })

  let axisY = descEnd + 96
  for (const axis of AXIS_KEYS) {
    drawAxis(
      ctx,
      axis === 'xing' ? '行' : axis === 'qian' ? '钱' : axis === 'xian' ? '险' : '人',
      AXIS_LABELS[axis].left,
      AXIS_LABELS[axis].right,
      normalized[axis],
      axisY,
    )
    axisY += 94
  }

  const verdicts = AXIS_KEYS
    .map((axis) => AXIS_VERDICTS[axis][gradeOf(normalized[axis])])
    .slice(0, 2)
    .join('；')
  drawText(ctx, verdicts, { x: PAD, y: axisY + 12 }, {
    font: '400 26px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
    fillStyle: MUTED,
    maxWidth: CARD_WIDTH - PAD * 2,
    lineHeight: 38,
    maxLines: 2,
  })

  const qrImage = await buildQrImage(siteUrl)
  fillRoundRect(ctx, PAD, CARD_HEIGHT - 250, 178, 178, 18, '#ffffff')
  ctx.drawImage(qrImage, PAD + 12, CARD_HEIGHT - 238, 154, 154)
  drawText(ctx, '扫码测你的旅格', { x: PAD + 212, y: CARD_HEIGHT - 228 }, {
    font: '800 34px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
    fillStyle: INK,
    maxWidth: 520,
  })
  drawText(ctx, siteUrl.replace(/^https?:\/\//, ''), { x: PAD + 212, y: CARD_HEIGHT - 176 }, {
    font: '400 24px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
    fillStyle: MUTED,
    maxWidth: 650,
  })

  await new Promise<void>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('share card encode failed'))
          return
        }
        downloadBlob(blob, `TBTI-${primary.enTag}-${primary.code}.jpg`)
        resolve()
      },
      'image/jpeg',
      0.82,
    )
  })
}
