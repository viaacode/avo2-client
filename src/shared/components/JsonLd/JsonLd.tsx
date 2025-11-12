import { type FC } from 'react'

import { toIsoDate } from '../../helpers/formatters/date.js'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare global {
  interface Window {
    ga: any
  }
}

interface JsonLdProps {
  url: string
  title?: string
  description?: string | null
  image?: string | null
  isOrganisation?: boolean
  author?: string | null
  publishedAt?: string | null
  updatedAt?: string | null
  keywords?: string[] | null
}

export const JsonLd: FC<JsonLdProps> = ({
  url,
  title,
  description,
  image,
  isOrganisation = false,
  author,
  publishedAt,
  updatedAt,
  keywords = [],
}) => {
  document
    .querySelectorAll('script[type="application/ld+json"]')
    .forEach((script) => script.remove())

  const info = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    headline: title || '',
    description: description || '',
    image: image ? [image] : [],
    author: {
      '@type': isOrganisation ? 'Organization' : 'Person',
      name: author || '',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Meemoo',
      logo: {
        '@type': 'ImageObject',
        url: 'https://meemoo.be/img/logo-mobile.svg',
      },
    },
    datePublished: toIsoDate(publishedAt || null),
    dateModified: toIsoDate(updatedAt || ''),
    keywords: (keywords || []).join(','),
  }

  if (
    window.ga &&
    typeof window.ga.getAll === 'function' &&
    window.ga.getAll()[0]
  ) {
    const tracker = window.ga.getAll()[0].get('name')
    window.ga(`${tracker}.set`, 'title', title)
    window.ga(`${tracker}.send`, 'pageview')
  }

  const scriptElem = document.createElement('script')
  scriptElem.setAttribute('type', 'application/ld+json')
  scriptElem.innerHTML = JSON.stringify(info, null, 2)
  document.head.append(scriptElem)
  return null
}
