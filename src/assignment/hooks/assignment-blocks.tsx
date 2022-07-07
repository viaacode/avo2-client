import { convertToHtml } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
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

import { AssignmentBlockMeta } from '../components/AssignmentBlockMeta';
import { AssignmentBlockToggle } from '../components/AssignmentBlockToggle';
import { useBlockDescriptionButtons } from './assignment-block-description-buttons';

export function useTextBlock(
	setBlock: (block: Avo.Core.BlockItemBase, update: Partial<Avo.Core.BlockItemBase>) => void
): (block: Avo.Core.BlockItemBase) => ReactNode {
	const [t] = useTranslation();

	return useCallback(
		(block: Avo.Core.BlockItemBase) => (
			<TitleDescriptionForm
				className="u-padding-l"
				id={block.id}
				title={{
					label: t('assignment/views/assignment-edit___titel'),
					placeholder: t(
						'assignment/views/assignment-edit___instructies-of-omschrijving'
					),
					value: block.custom_title || '',
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

export function useItemBlock(
	setBlock: (block: Avo.Core.BlockItemBase, update: Partial<Avo.Core.BlockItemBase>) => void
): (block: Avo.Core.BlockItemBase) => ReactNode | null {
	const [t] = useTranslation();

	const getButtons = useBlockDescriptionButtons(setBlock);

	return useCallback(
		(block: Avo.Core.BlockItemBase) => {
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
						value:
							(!block.use_custom_fields
								? (block as AssignmentBlock).original_title ||
								  block.item_meta?.title
								: block.custom_title) || undefined,
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
											? (block as AssignmentBlock).original_description ||
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

export function useSearchBlock(
	setBlock: (block: Avo.Core.BlockItemBase, update: Partial<Avo.Core.BlockItemBase>) => void
) {
	const [t] = useTranslation();

	return useCallback(
		(block: Avo.Core.BlockItemBase) => (
			<>
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
							setBlock(block, {
								custom_description: value.toHTML(),
							}),
					}}
				/>

				<AssignmentBlockToggle
					heading={t(
						'assignment/hooks/assignment-blocks___leerlingencollecties-toevoegen'
					)}
					description={t(
						'assignment/hooks/assignment-blocks___met-leerlingencollecties-kunnen-de-leerlingen-hun-zoekresultaten-verzamelen-in-een-collectie-die-jij-als-leerkracht-nadien-kan-inkijken-en-verbeteren'
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

export function useBlocks(
	setBlock: (block: Avo.Core.BlockItemBase, update: Partial<Avo.Core.BlockItemBase>) => void
): (block: Avo.Core.BlockItemBase) => ReactNode | null {
	const [t] = useTranslation();

	const search = useSearchBlock(setBlock);
	const text = useTextBlock(setBlock);
	const item = useItemBlock(setBlock);

	return useCallback(
		(block: Avo.Core.BlockItemBase) => {
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
