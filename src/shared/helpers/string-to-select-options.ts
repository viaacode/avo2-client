import { type TagInfo } from '@viaa/avo2-components';
import { AvoLomLomField } from '@viaa/avo2-types';

export function lomToTagInfo(lomEntry: AvoLomLomField): TagInfo {
  return {
    label: lomEntry.label,
    value: lomEntry.id,
  };
}
