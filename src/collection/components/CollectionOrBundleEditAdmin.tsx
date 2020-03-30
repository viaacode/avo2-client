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
import { QualityLabel } from '../collection.types';
import { CollectionAction } from './CollectionOrBundleEdit';

interface CollectionOrBundleEditAdminProps {
	collection: Avo.Collection.Collection;
	changeCollectionState: (action: CollectionAction) => void;
}

const CollectionOrBundleEditAdmin: FunctionComponent<CollectionOrBundleEditAdminProps> = ({
	collection,
	changeCollectionState,
}) => {
	const [t] = useTranslation();

	// State
	const [qualityLabels, setQualityLabels] = useState<TagInfo[] | null>(null);

	useEffect(() => {
		CollectionService.fetchQualityLabels()
			.then(dbLabels =>
				setQualityLabels(
					dbLabels.map((dbLabel: QualityLabel) => ({
						label: dbLabel.description,
						value: dbLabel.value,
					}))
				)
			)
			.catch(err => {
				console.error(new CustomError('Failed to fetch quality labels', err));
				ToastService.danger(
					t(
						'collection/components/collection-or-bundle-edit-admin___het-ophalen-van-de-kwaliteitslabels-is-mislukt'
					)
				);
			});
	}, [setQualityLabels, t]);

	const updateCollectionMultiProperty = (
		selectedTagOptions: TagInfo[],
		collectionProp: keyof Avo.Collection.Collection | 'collection_labels' // TODO remove labels once update to typings v2.14.0
	) => {
		changeCollectionState({
			collectionProp,
			type: 'UPDATE_COLLECTION_PROP',
			collectionPropValue: (selectedTagOptions || []).map(tag => ({
				label: tag.value as string,
			})) as any, // TODO remove cast to any once update to typings v2.14.0
		});
	};

	const getCollectionLabels = (): TagInfo[] => {
		if (!qualityLabels) {
			return [];
		}
		// TODO remove cast to any once update to typings v2.14.0
		const labelIds = ((collection as any).collection_labels || []).map(
			(item: any) => item.label
		);
		return qualityLabels.filter(qualityLabel => labelIds.includes(qualityLabel.value));
	};

	return (
		<>
			<Container mode="vertical">
				<Container mode="horizontal">
					<Form>
						<Spacer margin="bottom">
							<Grid>
								<Column size="3-7">
									<FormGroup
										label={t(
											'collection/components/collection-or-bundle-edit-admin___kwaliteitslabels'
										)}
									>
										{!!qualityLabels && (
											<TagsInput
												options={qualityLabels}
												// TODO remove cast to any once update to typings v2.14.0
												value={getCollectionLabels()}
												onChange={(values: TagInfo[]) =>
													updateCollectionMultiProperty(
														values,
														'collection_labels'
													)
												}
											/>
										)}
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
