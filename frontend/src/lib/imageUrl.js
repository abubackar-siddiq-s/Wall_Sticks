const FALLBACK = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1100" viewBox="0 0 800 1100"><rect width="800" height="1100" fill="%2318181b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23FFD000" font-family="sans-serif" font-size="48" font-weight="bold">WALLSTICKS</text></svg>'

export function imgSrc(image) {
  if (!image) return FALLBACK
  return typeof image === 'string' ? image : image.url || FALLBACK
}

const CLOUDINARY_UPLOAD_MARKER = '/upload/'

function isCloudinaryUrl(url) {
  return typeof url === 'string' && url.includes('res.cloudinary.com') && url.includes(CLOUDINARY_UPLOAD_MARKER)
}

function withTransform(url, transform) {
  return url.replace(CLOUDINARY_UPLOAD_MARKER, `${CLOUDINARY_UPLOAD_MARKER}${transform}/`)
}

const RESPONSIVE_WIDTHS = [400, 800, 1200, 1600]

export function responsiveImgProps(image, { sizes = '(max-width: 768px) 100vw, 50vw' } = {}) {
  const url = imgSrc(image)
  if (!isCloudinaryUrl(url)) return { src: url }

  const srcSet = RESPONSIVE_WIDTHS
    .map((w) => `${withTransform(url, `w_${w},q_auto,f_auto`)} ${w}w`)
    .join(', ')

  return { src: withTransform(url, 'w_800,q_auto,f_auto'), srcSet, sizes }
}
