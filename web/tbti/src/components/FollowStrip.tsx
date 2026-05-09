const FOLLOW_IMAGE_FILE = 'xiaohongshu-profile.jpg'

export function FollowStrip() {
  const imageSrc = `${import.meta.env.BASE_URL}${FOLLOW_IMAGE_FILE}`

  return (
    <section className="tbti-follow" aria-label="扫码关注">
      <div className="tbti-follow__copy">
        <h3 className="tbti-follow__title">喜欢这个测试？来小红书找我</h3>
        <p className="tbti-follow__text">扫码关注，后续继续更新旅行人格解读、AI 玩法和更多有趣小测试。</p>
      </div>
      <img
        src={imageSrc}
        alt="小红书主页二维码"
        className="tbti-follow__image"
        loading="lazy"
      />
    </section>
  )
}
