type TypePortraitProps = {
  typeId: number
  label: string
}

export function TypePortrait({ typeId, label }: TypePortraitProps) {
  const imageId = String(typeId).padStart(2, '0')
  const extension = typeId === 18 ? 'svg' : 'png'
  const imagePath = `${import.meta.env.BASE_URL}tbti-types/type-${imageId}.${extension}`

  return (
    <img
      className="tbti-type-portrait"
      src={imagePath}
      alt={label}
      width={1024}
      height={1536}
      loading="eager"
    />
  )
}
