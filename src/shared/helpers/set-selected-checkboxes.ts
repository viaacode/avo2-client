import { AvoLomLomField } from '@viaa/avo2-types';
import { type CheckboxOption } from '../components/CheckboxDropdownModal/CheckboxDropdownModal';

export function lomToCheckboxOption(lomEntry: AvoLomLomField): CheckboxOption {
  return {
    label: lomEntry.label,
    id: lomEntry.id,
    checked: false,
  };
}
