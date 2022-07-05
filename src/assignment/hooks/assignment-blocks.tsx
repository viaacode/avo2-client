import { convertToHtml } from '@viaa/avo2-components';
import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import { ItemSchema } from '@viaa/avo2-types/types/item';
import React, { ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { FlowPlayerWrapper } from '../../shared/components';
import { CustomiseItemForm } from '../../shared/components/CustomiseItemForm';
import { TitleDescriptionForm } from '../../shared/components/TitleDescriptionForm/TitleDescriptionForm';
import { WYSIWYG_OPTIONS_AUTHOR } from '../../shared/constants';
import { isRichTextEmpty } from '../../shared/helpers';
import { AssignmentBlockType } from '../assignment.types';

import { useAssignmentBlockDescriptionButtons } from './assignment-block-description-buttons';
import { AssignmentBlockMeta } from '../components/AssignmentBlockMeta';
import { AssignmentBlockToggle } from '../components/AssignmentBlockToggle';

export function useAssignmentTextBlock(
	setBlock: (block: AssignmentBlock, update: Partial<AssignmentBlock>) => void
): (block: AssignmentBlock) => ReactNode {
	const [t] = useTranslation();

	return useCallback(
		(block: AssignmentBlock) => (
			<TitleDescriptionForm
				className="u-padding-l"
				id={block.id}
				title={{
					label: t('assignment/views/assignment-edit___titel'),
					placeholder: t(
						'assignment/views/assignment-edit___instructies-of-omschrijving'
					),
					value: block.custom_title,
					onChange: (value) => setBlock(block, { custom_title: value }),
				}}
				description={{
					placeholder: t(
						'assignment/views/assignment-edit___beschrijf-je-instructies-of-geef-een-omschrijving-mee'
					),
					initialHtml: convertToHtml(block.custom_description),
					controls: WYSIWYG_OPTIONS_AUTHOR,
					onChange: (value) =>
						setBlock(block, {
							custom_description: value.toHTML(),
						}),
				}}
			/>
		),
		[t, setBlock]
	);
}

export function useAssignmentItemBlock(
	setBlock: (block: AssignmentBlock, update: Partial<AssignmentBlock>) => void
) {
	const [t] = useTranslation();

	const getButtons = useAssignmentBlockDescriptionButtons(setBlock);

	return useCallback(
		(block: AssignmentBlock) => {
			if (!block.item_meta) {
				return null;
			}

			return (
				<CustomiseItemForm
					className="u-padding-l"
					id={block.item_meta.id}
					preview={() => {
						const item = block.item_meta as ItemSchema;

						return (
							<FlowPlayerWrapper
								item={item}
								poster={item.thumbnail_path}
								external_id={item.external_id}
								duration={item.duration}
								title={item.title}
								cuePoints={{
									start: block.start_oc,
									end: block.end_oc,
								}}
							/>
						);
					}}
					buttons={getButtons(block)}
					title={{
						label: t('assignment/views/assignment-edit___titel-fragment'),
						placeholder: t(
							'assignment/views/assignment-edit___instructies-of-omschrijving'
						),
						value: !block.use_custom_fields
							? block.original_title || block.item_meta?.title
							: block.custom_title,
						disabled: !block.use_custom_fields,
						onChange: (value) => setBlock(block, { custom_title: value }),
					}}
					description={
						!isRichTextEmpty(block.custom_description) || !block.use_custom_fields
							? {
									label: t(
										'assignment/views/assignment-edit___beschrijving-fragment'
									),
									initialHtml: convertToHtml(
										!block.use_custom_fields
											? block.original_description ||
													block.item_meta?.description
											: block.custom_description
									),
									controls: WYSIWYG_OPTIONS_AUTHOR,
									disabled: !block.use_custom_fields,
									onChange: (value) =>
										setBlock(block, {
											custom_description: value.toHTML(),
										}),
							  }
							: undefined
					}
				>
					<AssignmentBlockMeta block={block} />
				</CustomiseItemForm>
			);
		},
		[t, setBlock, getButtons]
	);
}

export function useAssignmentSearchBlock(
	setBlock: (block: AssignmentBlock, update: Partial<AssignmentBlock>) => void
) {
	const [t] = useTranslation();

	return useCallback(
		(block: AssignmentBlock) => (
			<>
				<TitleDescriptionForm
					className="u-padding-l"
					id={block.id}
					title={undefined}
					description={{
						label: t('Omschrijving'),
						placeholder: t(
							'assignment/views/assignment-edit___beschrijf-je-instructies-of-geef-een-omschrijving-mee'
						),
						initialHtml: convertToHtml(block.custom_description),
						controls: WYSIWYG_OPTIONS_AUTHOR,
						onChange: (value) =>
							setBlock(block, {
								custom_description: value.toHTML(),
							}),
					}}
				/>

				<AssignmentBlockToggle
					heading={t('Leerlingencollecties toevoegen')}
					description={t(
						'Met leerlingencollecties kunnen de leerlingen hun zoekresultaten verzamelen in een collectie die jij als leerkracht nadien kan inkijken en verbeteren.'
					)}
					checked={block.type === AssignmentBlockType.BOUW}
					onChange={() => {
						setBlock(block, {
							type:
								block.type === AssignmentBlockType.ZOEK
									? AssignmentBlockType.BOUW
									: AssignmentBlockType.ZOEK,
						});
					}}
				/>
			</>
		),
		[t, setBlock]
	);
}

export function useAssignmentBlocks(
	setBlock: (block: AssignmentBlock, update: Partial<AssignmentBlock>) => void
) {
	const [t] = useTranslation();

	const text = useAssignmentTextBlock(setBlock);
	const item = useAssignmentItemBlock(setBlock);
	const search = useAssignmentSearchBlock(setBlock);

	return useCallback(
		(block: AssignmentBlock) => {
			switch (block.type) {
				case AssignmentBlockType.TEXT:
					return text(block);

				case AssignmentBlockType.ITEM:
					return item(block);

				case AssignmentBlockType.ZOEK:
				case AssignmentBlockType.BOUW:
					return search(block);

				default:
					break;
			}
		},
		[t, text, item]
	);
}
