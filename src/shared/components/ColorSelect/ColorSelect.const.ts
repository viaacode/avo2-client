import { tText } from '../../helpers/translate-text';

import { type ColorOption } from './ColorSelect.types';

export const GET_ASSIGNMENT_WHITE = () => ({
  label: tText('shared/components/color-select/color-select___wit'),
  value: '#FFFFFF',
})

export const GET_ASSIGNMENT_GREY = () => ({
  label: tText('shared/components/color-select/color-select___grijs'),
  value: '#EDEFF2',
})

const GET_ASSIGNMENT_GREEN = () => ({
  label: tText('shared/components/color-select/color-select___groen'),
  value: '#D2E7EC',
})

export const GET_ASSIGNMENT_COLORS: () => ColorOption[] = () => [
  GET_ASSIGNMENT_WHITE(),
  GET_ASSIGNMENT_GREY(),
  GET_ASSIGNMENT_GREEN(),
]
