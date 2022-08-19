import { convertToHtml } from '@viaa/avo2-components';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { TitleDescriptionForm } from '../../../shared/components/TitleDescriptionForm/TitleDescriptionForm';
import { WYSIWYG_OPTIONS_AUTHOR } from '../../../shared/constants';
import { AssignmentBlockType, EditBlockProps } from '../../assignment.types';
import { AssignmentBlockToggle } from '../AssignmentBlockToggle';

import './AssignmentBlockEditSearch.scss';

export const AssignmentBlockEditSearch: FC<EditBlockProps> = ({ block, setBlock }) => {
	const [t] = useTranslation();

	return (
		<div className="c-assignment-block-edit--search">
			<TitleDescriptionForm
				className="u-padding-l"
				id={block.id}
				title={undefined}
				description={{
					label: t('assignment/hooks/assignment-blocks___omschrijving'),
					placeholder: t(
						'assignment/views/assignment-edit___beschrijf-je-instructies-of-geef-een-omschrijving-mee'
					),
					initialHtml: convertToHtml(block.custom_description),
					controls: WYSIWYG_OPTIONS_AUTHOR,
					onChange: (value) =>
						setBlock({
							...block,
							custom_description: value.toHTML(),
						}),
				}}
			/>

			<AssignmentBlockToggle
				heading={t('assignment/hooks/assignment-blocks___leerlingencollecties-toevoegen')}
				description={t(
					'assignment/hooks/assignment-blocks___met-leerlingencollecties-kunnen-de-leerlingen-hun-zoekresultaten-verzamelen-in-een-collectie-die-jij-als-leerkracht-nadien-kan-inkijken-en-verbeteren'
				)}
				checked={block.type === AssignmentBlockType.BOUW}
				onChange={() => {
					setBlock({
						...block,
						type:
							block.type === AssignmentBlockType.ZOEK
								? AssignmentBlockType.BOUW
								: AssignmentBlockType.ZOEK,
					});
				}}
			/>
		</div>
	);
};
