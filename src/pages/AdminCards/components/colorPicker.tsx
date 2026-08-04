import React from 'react';
import { CARD_COLOR_PALETTE } from 'services/cardsService';

type Props = {
    label: string;
    value: string | null;
    onChange: (value: string | null) => void;
};

const ColorPicker: React.FC<Props> = ({ label, value, onChange }) => {
    return (
        <div className="adminCardForm__colorPicker">
            <label>{label}</label>
            <div className="adminCardForm__colorCircles">
                {CARD_COLOR_PALETTE.map((c) => (
                    <button
                        type="button"
                        key={c}
                        title={c}
                        className={`adminCardForm__colorCircle${value === c ? ' is-selected' : ''}`}
                        style={{ backgroundColor: c }}
                        onClick={() => onChange(c)}
                    />
                ))}
                <button
                    type="button"
                    title="Sin color"
                    className={`adminCardForm__colorCircle adminCardForm__colorCircle--clear${!value ? ' is-selected' : ''}`}
                    onClick={() => onChange(null)}
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default ColorPicker;
