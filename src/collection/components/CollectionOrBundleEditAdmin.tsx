import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Column,
	Container,
	Form,
	FormGroup,
	Grid,
	Spacer,
	TagInfo,
	TagsInput,
	TextArea,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { CustomError } from '../../shared/helpers';
import { ToastService } from '../../shared/services';

import { CollectionService } from '../collection.service';
import { CollectionAction } from './CollectionOrBundleEdit';

interface CollectionOrBundleEditAdminProps {
	type: 'collection' | 'bundle';
	collection: Avo.Collection.Collection;
	changeCollectionState: (action: CollectionAction) => void;
}

const CollectionOrBundleEditAdmin: FunctionComponent<CollectionOrBundleEditAdminProps> = ({
	type,
	collection,
	changeCollectionState,
}) => {
	const [t] = useTranslation();

	// State
	const [qualityLabels, setQualityLabels] = useState<TagInfo[]>([]);

	// @ts-ignore
	const isCollection = type === 'collection';

	useEffect(() => {
		CollectionService.fetchQualityLabels()
			.then(dbLabels =>
				setQualityLabels(
					dbLabels.map((dbLabel: any) => ({
						label: dbLabel.description,
						value: dbLabel.value,
					}))
				)
			)
			.catch(err => {
				console.error(new CustomError('Failed to fetch quality labels', err));
				ToastService.danger(t('Het ophalen van de kwaliteitslabels is mislukt.'));
			});
	}, [setQualityLabels, t]);

	// const updateCollectionMultiProperty = (
	// 	selectedTagOptions: TagInfo[],
	// 	collectionProp: keyof Avo.Collection.Collection
	// ) => {
	// 	changeCollectionState({
	// 		collectionProp,
	// 		type: 'UPDATE_COLLECTION_PROP',
	// 		collectionPropValue: (selectedTagOptions || []).map(tag => tag.value as string),
	// 	});
	// };

	return (
		<>
			<Container mode="vertical">
				<Container mode="horizontal">
					<Form>
						<Spacer margin="bottom">
							<Grid>
								<Column size="3-7">
									<FormGroup label={t('Kwaliteitslabels')}>
										<TagsInput
											options={qualityLabels}
											value={[].map(
												// TODO fill quality labels once database is fill in
												(item: string) => ({
													value: item,
													label: item,
												})
											)}
											// onChange={(values: TagInfo[]) => // TODO update once database is fill in
											// 	updateCollectionMultiProperty(values, 'labels')
											// }
										/>
									</FormGroup>
									<FormGroup
										label={t(
											'collection/views/collection-edit-meta-data___persoonlijke-opmerkingen-notities'
										)}
										labelFor="personalRemarkId"
									>
										<TextArea
											name="personalRemarkId"
											value={collection.note || ''}
											id="personalRemarkId"
											height="medium"
											placeholder={t(
												'collection/views/collection-edit-meta-data___geef-hier-je-persoonlijke-opmerkingen-notities-in'
											)}
											onChange={(value: string) =>
												changeCollectionState({
													type: 'UPDATE_COLLECTION_PROP',
													collectionProp: 'note',
													collectionPropValue: value,
												})
											}
										/>
									</FormGroup>
								</Column>
								<Column size="3-5">
									<></>
								</Column>
							</Grid>
						</Spacer>
					</Form>
				</Container>
			</Container>
		</>
	);
};

export default CollectionOrBundleEditAdmin;
