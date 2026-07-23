// Product images come in two shapes depending on data source:
//   - demo data:      a plain URL string ("https://picsum.photos/...")
//   - live API:       { url, publicId } (publicId is a Cloudinary asset ID)
// imgSrc() normalizes either into a usable <img src>. srcSet() additionally builds a
// responsive srcset using Cloudinary's URL-based transforms when a Cloudinary URL is
// detected, so a phone doesn't download the same 2400px poster photo as a 4K desktop.

const FALLBACK = 'https://picsum.photos/seed/posterwall-placeholder/800/1100'

export function imgSrc(image) {
  if (!image) return FALLBACK
  return typeof image === 'string' ? image : image.url || FALLBACK
}

const CLOUDINARY_UPLOAD_MARKER = '/upload/'

function isCloudinaryUrl(url) {
  return typeof url === 'string' && url.includes('res.cloudinary.com') && url.includes(CLOUDINARY_UPLOAD_MARKER)
}

// Inserts a Cloudinary transformation string right after `/upload/`, e.g.
// https://res.cloudinary.com/x/image/upload/v123/f.jpg
//   -> https://res.cloudinary.com/x/image/upload/w_600,q_auto,f_auto/v123/f.jpg
function withTransform(url, transform) {
  return url.replace(CLOUDINARY_UPLOAD_MARKER, `${CLOUDINARY_UPLOAD_MARKER}${transform}/`)
}

const RESPONSIVE_WIDTHS = [400, 800, 1200, 1600]

// Returns { src, srcSet, sizes } ready to spread onto an <img>. Falls back to a plain
// src with no srcSet for non-Cloudinary images (demo data, or before Cloudinary is wired up).
export function responsiveImgProps(image, { sizes = '(max-width: 768px) 100vw, 50vw' } = {}) {
  const url = imgSrc(image)
  if (!isCloudinaryUrl(url)) return { src: url }

  const srcSet = RESPONSIVE_WIDTHS
    .map((w) => `${withTransform(url, `w_${w},q_auto,f_auto`)} ${w}w`)
    .join(', ')

  return { src: withTransform(url, 'w_800,q_auto,f_auto'), srcSet, sizes }
}
