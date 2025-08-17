import React, { useEffect, useState } from "react";
import "./cardsPage.scss";
import DeckPanel from "./components/deckPanel";
import { DeckDTO, fetchDecks, CardDTO } from "./actions";
import Loading from "components/Loading/Loading";

interface ImgItem {
  key: string;
  url: string;
  alt: string;
  group: string;
}

const CardsPage: React.FC = () => {
  const [groups, setGroups] = useState<Record<string, ImgItem[]>>({});
  const [active, setActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const decks: DeckDTO[] = await fetchDecks();

        const collected: Record<string, ImgItem[]> = {};
        decks.forEach((deck) => {
          collected[deck.title] = deck.cards.map((card: CardDTO) => ({
            key: `${deck.title}/${card.name}`,
            url: card.url,
            alt: card.name,
            group: deck.title,
          }));
        });

        setGroups(collected);
      } catch (err) {
        console.error("Error fetching decks:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      {Object.entries(groups).map(([groupName, items]) => (
        <DeckPanel
          key={groupName}
          groupName={groupName}
          items={items}
          onSelect={setActive}
        />
      ))}

      {active && (
        <div
          className="modalBackdrop is-open"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <button
              className="closeBtn"
              aria-label="Cerrar"
              onClick={() => setActive(null)}
            >
              ✖
            </button>
            <img src={active} alt="" />
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(CardsPage);
