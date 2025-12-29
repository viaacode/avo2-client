import { type LinkTarget } from '@viaa/avo2-components';
import { AvoCoreContentPickerType } from '@viaa/avo2-types';

export type PickerItemControls = 'SELECT' | 'TEXT_INPUT' | 'FILE_UPLOAD';

export interface PickerItem {
  label?: string;
  type: AvoCoreContentPickerType;
  value: string;
  target?: LinkTarget;
}

export interface PickerTypeOption<T = AvoCoreContentPickerType> {
  value: T;
  label: string;
  disabled?: boolean;
  picker: PickerItemControls;
  fetch?: (keyword: string | null, limit: number) => Promise<PickerItem[]>;
  placeholder?: string;
}
