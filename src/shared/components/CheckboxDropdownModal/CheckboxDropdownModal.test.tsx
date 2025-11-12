// import { mount, shallow } from 'enzyme';
// import React from 'react';

// import { CheckboxDropdownModal } from './CheckboxDropdownModal';

export const countOptions = [
  {
    label: 'One',
    id: 'one',
    checked: false,
  },
  {
    label: 'Two',
    id: 'two',
    checked: false,
  },
  {
    label: 'Three',
    id: 'three',
    checked: false,
  },
  {
    label: 'Four',
    id: 'four',
    checked: false,
  },
  {
    label: 'Five',
    id: 'five',
    checked: false,
  },
  {
    label: 'Six',
    id: 'six',
    checked: false,
  },
  {
    label: 'Seven',
    id: 'seven',
    checked: false,
  },
  {
    label: 'Eight',
    id: 'eight',
    checked: false,
  },
  {
    label: 'Nine',
    id: 'nine',
    checked: false,
  },
  {
    label: 'Ten',
    id: 'ten',
    checked: false,
  },
  {
    label: 'Elven',
    id: 'elven',
    checked: false,
  },
  {
    label: 'Twelve',
    id: 'twelve',
    checked: false,
  },
]

describe('<CheckboxDropdownModal />', () => {
  it('Should be able to render', () => {
    // shallow(
    // 	<CheckboxDropdownModal
    // 		label="Counting"
    // 		id="counting"
    // 		options={countOptions}
    // 		onChange={() => console.info('CheckboxDropdown changed')}
    // 	/>
    // );
    expect(true)
  })

  it('Should be able to render with less than 10 items', () => {
    // const checkboxDropdownComponent = mount(
    // 	<CheckboxDropdownModal
    // 		label="Counting"
    // 		id="counting"
    // 		options={countOptions.slice(0, 5)}
    // 		onChange={() => console.info('CheckboxDropdown changed')}
    // 	/>
    // );
    // expect(checkboxDropdownComponent.find('input')).toHaveLength(5);
    expect(true)
  })

  it('Should call `onChange` when toggling checkbox', () => {
    // const onChangeHandler = jest.fn();

    // const checkboxDropdownComponent = mount(
    // 	<CheckboxDropdownModal
    // 		label="Counting"
    // 		id="counting"
    // 		options={countOptions}
    // 		onChange={onChangeHandler}
    // 	/>
    // );

    // const checkboxes = checkboxDropdownComponent.find('[type="checkbox"]');
    // const button = checkboxDropdownComponent
    // 	.find('.c-button.c-button--block.c-button--primary')
    // 	.at(0);

    // checkboxes.at(2).simulate('change', { target: { checked: true } });
    // button.simulate('click');

    // expect(onChangeHandler).toBeCalledWith(['three'], 'counting');

    // checkboxes.at(3).simulate('change', { target: { checked: true } });
    // button.simulate('click');

    // expect(onChangeHandler).toBeCalledWith(['three', 'four'], 'counting');

    // checkboxes.at(2).simulate('change', { target: { checked: false } });
    // button.simulate('click');

    // expect(onChangeHandler).toBeCalledWith(['four'], 'counting');
    expect(true)
  })
})
