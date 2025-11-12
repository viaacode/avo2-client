import {Button, Spacer} from '@viaa/avo2-components';
import {type Avo} from '@viaa/avo2-types';
import {useAtomValue} from 'jotai';
import {compact} from 'es-toolkit';
import React, {type FC, useEffect, useState} from 'react';

import {commonUserAtom} from '../../../authentication/authentication.store.js';
import {CollectionService} from '../../../collection/collection.service.js';
import {tText} from '../../helpers/translate-text.js';
import {EducationLevelsField} from '../EducationLevelsField/EducationLevelsField.js';
import {LomFieldsInput} from '../LomFieldsInput/LomFieldsInput.js';
import {ShortDescriptionField} from '../ShortDescriptionField/ShortDescriptionField.js';
import {SubjectsField} from '../SubjectsField/SubjectsField.js';

import {isShareable} from './QuickLaneContent.helpers.js';
import {type QuickLaneContentProps, QuickLaneTypeEnum} from './QuickLaneContent.types.js';

interface QuickLaneContentPublicationTabProps {
	onComplete?: () => void;
}

export const QuickLaneContentPublicationTab: FC<
	QuickLaneContentProps & QuickLaneContentPublicationTabProps
> = ({ content, content_label, onComplete, onUpdate }) => {
	const commonUser = useAtomValue(commonUserAtom);

	const [model, setModel] = useState(content);
	const isCollection = content_label === QuickLaneTypeEnum.COLLECTION;

	useEffect(() => {
		setModel(content);
	}, [content]);

	const onSubmit = async () => {
		if (commonUser && content && model && isCollection) {
			try {
				const result = await CollectionService.updateCollection(
					content as Avo.Collection.Collection,
					{
						...(model as Avo.Collection.Collection),
						is_public: true,
					},
					commonUser,
					true,
					true
				);

				if (result) {
					onUpdate?.(result);
				} else {
					console.warn('Could not publish collection, validation errors occurred');
				}
				onComplete?.();
			} catch (err) {
				console.error('Could not update publication details of collection', err);
			}
		}
	};

	const handleLomsChange = (newLomFields: Avo.Lom.LomField[]) => {
		const newLoms: Avo.Lom.Lom[] = newLomFields.map((lomField) => ({
			lom_id: lomField.id,
			lom: lomField,
		}));

		setModel({ ...model, loms: newLoms } as Avo.Collection.Collection);
	};

	return model && content && content_label && isCollection ? (
		<>
			{(model as Avo.Collection.Collection)?.loms ? (
				<LomFieldsInput
					loms={compact(((model as Avo.Collection.Collection).loms?.map(lom => lom.lom)) || [])}
					onChange={handleLomsChange}
				/>
			) : (
				<>
					<Spacer margin={'bottom'}>
						<EducationLevelsField
							value={(model as Avo.Item.Item).lom_context}
							onChange={(levels) => {
								setModel({
									...model,
									lom_context: (levels || []).map((item) =>
										item.value.toString()
									),
								} as Avo.Item.Item);
							}}
						/>
					</Spacer>
					<Spacer margin={'bottom'}>
						<SubjectsField
							value={(model as Avo.Item.Item).lom_classification}
							onChange={(subjects) => {
								setModel({
									...model,
									lom_classification: (subjects || []).map((item) =>
										item.value.toString()
									),
								} as Avo.Item.Item);
							}}
						/>
					</Spacer>
				</>
			)}

			<Spacer margin={'bottom'}>
				<ShortDescriptionField
					value={model.description}
					onChange={(description) => {
						setModel({
							...model,
							description,
						});
					}}
					placeholder={
						isCollection
							? tText(
									'collection/components/collection-or-bundle-edit-meta-data___korte-beschrijving-placeholder-collectie'
							  )
							: tText(
									'collection/components/collection-or-bundle-edit-meta-data___korte-beschrijving-placeholder-bundel'
							  )
					}
				/>
			</Spacer>
			<Button
				label={
					!isShareable(content)
						? tText(
								'shared/components/quick-lane-modal/quick-lane-modal-publication-tab___publiceren-en-opslaan'
						  )
						: tText(
								'shared/components/quick-lane-modal/quick-lane-modal-publication-tab___opslaan'
						  )
				}
				onClick={onSubmit}
			/>
		</>
	) : null;
};
