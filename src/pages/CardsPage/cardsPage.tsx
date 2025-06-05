// CardsPage.tsx
import React, { useState } from 'react'
import './cardsPage.scss'

// ahora apuntamos a la carpeta PNG clonada
const pngMods = import.meta.glob('../../cards-png/**/*.png', {
  eager: true,
  import: 'default', 
})

interface ImgItem {
  key: string
  url: string
  alt: string
  group: string
}

const imgItems: ImgItem[] = Object.entries(pngMods).map(([path, url]) => {
  const parts = path.split('/')
  const file = parts.pop()!
  const group = parts[3] ?? 'root'
  return { key: path, url: url as string, alt: file.replace('.png', ''), group }
})

const groups = imgItems.reduce<Record<string, ImgItem[]>>((acc, item) => {
  ;(acc[item.group] ||= []).push(item)
  return acc
}, {})

const CardsPage: React.FC = () => {
  const [active, setActive] = useState<string | null>(null)

  return (
    <>
      {Object.entries(groups).map(([groupName, items]) => (
        <section key={groupName} className="cardsGroup">
          <h2 className="cardsTitle">{groupName}</h2>

          <div className="cardsPage">
            {items.map(({ key, url, alt }) => (
              <article key={key} className="card" onClick={() => setActive(url)}>
                <img src={url} alt={alt} loading="lazy" />
              </article>
            ))}
          </div>
        </section>
      ))}

      {active && (
        <div
          className="modalBackdrop is-open"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <button className="closeBtn" aria-label="Cerrar" onClick={() => setActive(null)}>
              ✖
            </button>
            <img src={active} alt="" />
          </div>
        </div>
      )}
    </>
  )
}

export default React.memo(CardsPage)
