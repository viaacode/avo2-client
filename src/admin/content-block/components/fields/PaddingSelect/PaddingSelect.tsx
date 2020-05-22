import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { Form, FormGroup, Select, SelectOption, SpacerOption } from '@viaa/avo2-components';

import { PaddingFieldState } from '../../../../shared/types';

import './PaddingSelect.scss';

interface PaddingSelectProps {
	onChange: (value: PaddingFieldState) => void;
	value: PaddingFieldState;
}

type PaddingDirection = 'top' | 'bottom';

const PaddingSelect: FunctionComponent<PaddingSelectProps> = ({ onChange, value }) => {
	const [t] = useTranslation();

	const generateOptions = (direction: PaddingDirection) =>
		[
			{
				label: t(
					'admin/content-block/components/fields/padding-select/padding-select___geen'
				),
				value: 'none',
			},
			{
				label: t(
					'admin/content-block/components/fields/padding-select/padding-select___klein'
				),
				value: `${direction}-small`,
			},
			{
				label: t(
					'admin/content-block/components/fields/padding-select/padding-select___medium'
				),
				value: `${direction}`,
			},
			{
				label: t(
					'admin/content-block/components/fields/padding-select/padding-select___groot'
				),
				value: `${direction}-large`,
			},
			{
				label: t(
					'admin/content-block/components/fields/padding-select/padding-select___extra-groot'
				),
				value: `${direction}-extra-large`,
			},
		] as SelectOption<SpacerOption>[];

	const handleChange = (newValue: string, direction: PaddingDirection) => {
		onChange({ ...value, [direction]: newValue });
	};

	return (
		<Form type="inline" className="c-padding-select">
			<FormGroup label="Boven">
				<Select
					onChange={(value: string) => handleChange(value, 'top')}
					options={generateOptions('top')}
					value={value.top}
				/>
			</FormGroup>
			<FormGroup label="Onder">
				<Select
					onChange={(value: string) => handleChange(value, 'bottom')}
					options={generateOptions('bottom')}
					value={value.bottom}
				/>
			</FormGroup>
		</Form>
	);
};

export default PaddingSelect;
