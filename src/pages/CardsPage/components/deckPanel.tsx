import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons'

interface ImgItem {
    key: string
    url: string
    alt: string
    group: string
}

interface DeckPanelProps {
    groupName: string
    items: ImgItem[]
    onSelect: (url: string) => void
}

const DeckPanel: React.FC<DeckPanelProps> = ({ groupName, items, onSelect }) => {
    const [collapsed, setCollapsed] = useState(false)

    return (
        <section className="cardsGroup">
            <h2 className="cardsTitle" onClick={() => setCollapsed(!collapsed)}>
                <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronDown} />
                {' '}{groupName}
            </h2>


            <div className={`cardsPage ${collapsed ? 'collapsed' : ''}`}>
                {items.map(({ key, url, alt }) => (
                    <article key={key} className="card" onClick={() => onSelect(url)}>
                        <img src={url} alt={alt} loading="lazy" />
                    </article>
                ))}
            </div>

        </section>
    )
}

export default DeckPanel
