import { Button, Spacer } from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import { compact, map } from 'lodash-es';
import React, { FunctionComponent, useEffect, useState } from 'react';

import { EducationLevelsField, ShortDescriptionField, SubjectsField } from '..';
import { CollectionService } from '../../../collection/collection.service';
import { isCollection } from '../../../quick-lane/quick-lane.helpers';
import useTranslation from '../../../shared/hooks/useTranslation';
import withUser, { UserProps } from '../../hocs/withUser';
import LomFieldsInput from '../LomFieldsInput/LomFieldsInput';

import { isShareable } from './QuickLaneModal.helpers';
import { QuickLaneModalProps } from './QuickLaneModal.types';

interface QuickLaneModalPublicationTabProps {
	onComplete?: () => void;
}

type Props = QuickLaneModalProps & QuickLaneModalPublicationTabProps & UserProps;
const QuickLaneModalPublicationTab: FunctionComponent<Props> = ({
	content,
	content_label,
	user,
	onComplete,
	onUpdate,
}) => {
	const { tText } = useTranslation();

	const [model, setModel] = useState(content);

	useEffect(() => {
		setModel(content);
	}, [content]);

	const onSubmit = () => {
		if (user && content && model && isCollection({ content_label })) {
			CollectionService.updateCollection(
				content as Avo.Collection.Collection,
				{
					...(model as Avo.Collection.Collection),
					is_public: true,
				},
				user
			)
				.then((result) => {
					if (result) {
						onUpdate && onUpdate(result);
						onComplete && onComplete();
					} else {
						console.warn('Could not publish collection, validation errors occured');
					}
				})
				.catch((err) => {
					console.error('Could not update publication details of collection', err);
				});
		}
	};

	const handleLomsChange = (newLomFields: Avo.Lom.LomField[]) => {
		const newLoms: Avo.Lom.Lom[] = newLomFields.map((lomField) => ({
			lom_id: lomField.id,
			lom: lomField,
		}));

		setModel({ ...model, loms: newLoms } as Avo.Collection.Collection);
	};

	return model && content && content_label && isCollection({ content_label }) ? (
		<>
			{(model as Avo.Collection.Collection)?.loms ? (
				<LomFieldsInput
					loms={compact(map((model as Avo.Collection.Collection).loms, 'lom'))}
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
					placeholder={tText(
						'collection/components/collection-or-bundle-edit-meta-data___short-description-placeholder'
					)}
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

export default withUser(QuickLaneModalPublicationTab) as FunctionComponent<Props>;
