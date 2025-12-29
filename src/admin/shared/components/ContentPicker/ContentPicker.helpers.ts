import { AvoCoreContentPickerType } from '@viaa/avo2-types';
import type {
  PickerItem,
  PickerItemControls,
  PickerTypeOption,
} from '../../types/content-picker';

export declare type SingleValue<Option> = Option | null;
export declare type MultiValue<Option> = readonly Option[];
export declare type PropsValue<Option> =
  | MultiValue<Option>
  | SingleValue<Option>;

export const filterTypes = (
  types: PickerTypeOption<AvoCoreContentPickerType>[],
  allowedTypes: AvoCoreContentPickerType[],
): PickerTypeOption<AvoCoreContentPickerType>[] => {
  return types.filter((option: PickerTypeOption) => {
    return allowedTypes.length
      ? allowedTypes.includes(option.value)
      : option.value;
  });
};

export const setInitialInput = (
  type?: PickerTypeOption<AvoCoreContentPickerType>,
  initialValue?: PickerItem,
): string => {
  switch (type?.picker as PickerItemControls) {
    case 'TEXT_INPUT':
    case 'FILE_UPLOAD':
      return initialValue?.value || '';

    default:
      return '';
  }
};

export const setInitialItem = (
  options: PickerItem[],
  initialValue?: PickerItem,
): PropsValue<PickerItem> | undefined => {
  return options.find(
    (option: PickerItem) =>
      option.value === (initialValue?.value || 'EMPTY_SELECTION'),
  ) as PropsValue<PickerItem> | undefined;
};
