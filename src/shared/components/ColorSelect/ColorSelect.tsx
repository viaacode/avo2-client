import { Flex, Spacer } from '@viaa/avo2-components';
import clsx from 'clsx';
import React, { type FC, type ReactNode } from 'react';
import Select from 'react-select';

import './ColorSelect.scss';
import { type ReactSelectOption } from '../../types';

import { type ColorOption, type ColorSelectProps } from './ColorSelect.types';

export const ColorSelect: FC<ColorSelectProps> = ({
  className,
  noOptionsMessage = ({ inputValue }) => `Geen kleuren gevonden: ${inputValue}`,
  placeholder = '',
  id,
  options,
  value,
  onChange,
}) => {
  const renderLabel = ({
    label,
    value,
  }: ReactSelectOption<string>): ReactNode => {
    const option: ColorOption | undefined = options.find(
      (option) => option.value === value,
    );
    return (
      <div key={`color-select-${label}-${value}`}>
        <Flex>
          {!!option && (
            <div
              className={`c-color-select__preview`}
              style={{ backgroundColor: option.color || option.value }}
            />
          )}
          {!!label && <Spacer margin="left-small">{label}</Spacer>}
        </Flex>
      </div>
    );
  };

  return (
    <Select
      className={clsx(className, 'c-color-select')}
      noOptionsMessage={noOptionsMessage}
      placeholder={placeholder}
      options={options}
      id={id}
      value={value}
      onChange={(newSelectedOption) =>
        onChange(newSelectedOption as ColorOption | null)
      }
      classNamePrefix="react-select"
      formatOptionLabel={(data: unknown) =>
        renderLabel(data as ReactSelectOption<string>)
      }
    />
  );
};
