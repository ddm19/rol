import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';

type ToggleChipProps = {
    checked: boolean;
    onChange: () => void;
    label: string;
    icon?: IconDefinition;
    disabled?: boolean;
};

const ToggleChip: React.FC<ToggleChipProps> = ({ checked, onChange, label, icon, disabled }) => (
    <label className={`adminRohPage__chip${checked ? ' is-active' : ''}${disabled ? ' is-disabled' : ''}`}>
        <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} />
        <FontAwesomeIcon icon={checked ? faCheck : icon || faPlus} />
        {label}
    </label>
);

export default ToggleChip;
