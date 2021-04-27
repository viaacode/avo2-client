import H from 'history';
import { get } from 'lodash-es';
import React, { FunctionComponent, ReactNode, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	BlockHeading,
	Button,
	Container,
	DatePicker,
	Flex,
	FlexItem,
	Form,
	FormGroup,
	Select,
	Spacer,
	Spinner,
	Table,
	TextArea,
	TextInput,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { CustomError, formatDate } from '../../shared/helpers';
import { truncateTableValue } from '../../shared/helpers/truncate';
import withUser, { UserProps } from '../../shared/hocs/withUser';
import { ToastService } from '../../shared/services';
import {
	GET_MARCOM_CHANNEL_NAME_OPTIONS,
	GET_MARCOM_CHANNEL_TYPE_OPTIONS,
	GET_MARCOM_ENTRY_TABLE_COLUMNS,
} from '../collection.const';
import { CollectionService } from '../collection.service';
import { ContentTypeNumber, MarcomEntry } from '../collection.types';

import { CollectionAction } from './CollectionOrBundleEdit';

interface CollectionOrBundleEditMarcomProps {
	collection: Avo.Collection.Collection;
	changeCollectionState: (action: CollectionAction) => void;
	history: H.History;
}

const CollectionOrBundleEditMarcom: FunctionComponent<
	CollectionOrBundleEditMarcomProps & UserProps
> = ({ collection, changeCollectionState }) => {
	const [t] = useTranslation();

	const isCollection = collection.type_id === ContentTypeNumber.collection;

	const [marcomDate, setMarcomDate] = useState<Date | null>(new Date());
	const [marcomChannelType, setMarcomChannelType] = useState<string | null>();
	const [marcomChannelName, setMarcomChannelName] = useState<string | null>();
	const [marcomLink, setMarcomLink] = useState<string>('');
	const [marcomEntries, setMarcomEntries] = useState<MarcomEntry[] | null>(null);

	const fetchMarcomEntries = useCallback(async () => {
		try {
			setMarcomEntries(await CollectionService.getMarcomEntries(collection.id));
		} catch (err) {
			console.error(
				new CustomError('Failed to fetch marcom entries from the database', err, {
					collectionId: collection.id,
				})
			);
			ToastService.danger(
				t(
					'collection/components/collection-or-bundle-edit-marcom___het-ophalen-van-de-marcom-entries-is-mislukt'
				)
			);
		}
	}, [collection.id, t, setMarcomEntries]);

	useEffect(() => {
		fetchMarcomEntries();
	}, [fetchMarcomEntries]);

	const renderMarcomTableCell = (
		rowData: Partial<MarcomEntry>,
		columnId: keyof MarcomEntry
	): ReactNode => {
		const value = get(rowData, columnId);
		switch (columnId) {
			case 'publish_date':
				return formatDate(value) || '-';

			case 'external_link':
				const valueLink: string = (value || '').includes('//') ? value || '' : `//${value}`;
				return value ? (
					<a href={valueLink} target="_blank" rel="noopener noreferrer">
						{truncateTableValue(value)}
					</a>
				) : (
					'-'
				);

			case 'channel_type':
				return truncateTableValue(
					get(
						GET_MARCOM_CHANNEL_TYPE_OPTIONS().find((option) => option.value === value),
						'label',
						'-'
					)
				);

			case 'channel_name':
				return truncateTableValue(
					get(
						GET_MARCOM_CHANNEL_NAME_OPTIONS().find((option) => option.value === value),
						'label',
						'-'
					)
				);

			default:
				return truncateTableValue(value) || '-';
		}
	};

	const addMarcomEntry = async () => {
		let marcomEntry: Partial<MarcomEntry> | null = null;
		try {
			marcomEntry = {
				channel_type: marcomChannelType || null,
				channel_name: marcomChannelName || null,
				collection_id: collection.id,
				external_link: marcomLink.trim() || null,
				publish_date: marcomDate?.toISOString(),
			};
			await CollectionService.insertMarcomEntry([marcomEntry]);
			await fetchMarcomEntries();
			ToastService.success(
				t(
					'collection/components/collection-or-bundle-edit-marcom___het-toevoegen-van-de-marcom-entry-is-gelukt'
				)
			);

			setMarcomChannelType(null);
			setMarcomChannelName(null);
			setMarcomLink('');
		} catch (err) {
			console.error(
				new CustomError('Failed to insert a new marcom entry into the database', err, {
					collectionId: collection.id,
				})
			);
			ToastService.danger(
				t(
					'collection/components/collection-or-bundle-edit-marcom___het-toevoegen-van-de-marcom-entry-is-mislukt'
				)
			);
		}
	};

	return (
		<>
			<Container mode="vertical">
				<Container mode="horizontal">
					<Form>
						<BlockHeading type="h3">
							{t(
								'collection/components/collection-or-bundle-edit-marcom___meest-recente-communicatie'
							)}
						</BlockHeading>
						<Flex justify="between" spaced="wide">
							<FlexItem>
								<FormGroup
									label={t(
										'collection/components/collection-or-bundle-edit-marcom___datum-communicatie'
									)}
								>
									<DatePicker onChange={setMarcomDate} value={marcomDate} />
								</FormGroup>
							</FlexItem>
							<FlexItem>
								<FormGroup
									label={t(
										'collection/components/collection-or-bundle-edit-marcom___kanaal-type'
									)}
								>
									<Select
										options={GET_MARCOM_CHANNEL_TYPE_OPTIONS()}
										placeholder={'-'}
										onChange={setMarcomChannelType}
										value={marcomChannelType}
										clearable
									/>
								</FormGroup>
							</FlexItem>
							<FlexItem>
								<FormGroup
									label={t(
										'collection/components/collection-or-bundle-edit-marcom___kanaal-naam'
									)}
								>
									<Select
										options={GET_MARCOM_CHANNEL_NAME_OPTIONS()}
										placeholder={'-'}
										onChange={setMarcomChannelName}
										value={marcomChannelName}
										clearable
									/>
								</FormGroup>
							</FlexItem>
							<FlexItem>
								<FormGroup
									label={t(
										'collection/components/collection-or-bundle-edit-marcom___link'
									)}
								>
									<TextInput
										onChange={setMarcomLink}
										value={marcomLink || undefined}
									/>
								</FormGroup>
							</FlexItem>
							<FlexItem>
								<FormGroup label=" ">
									<Button
										label={t(
											'collection/components/collection-or-bundle-edit-marcom___toevoegen'
										)}
										onClick={addMarcomEntry}
										type="primary"
									/>
								</FormGroup>
							</FlexItem>
						</Flex>
						<Spacer margin={['top-extra-large', 'bottom-large']}>
							<BlockHeading type="h3">
								{t(
									'collection/components/collection-or-bundle-edit-marcom___eerdere-communicatie'
								)}
							</BlockHeading>
							{marcomEntries ? (
								<Table
									data={marcomEntries}
									columns={GET_MARCOM_ENTRY_TABLE_COLUMNS()}
									renderCell={renderMarcomTableCell as any}
									emptyStateMessage={
										isCollection
											? t(
													'collection/components/collection-or-bundle-edit-marcom___er-zijn-nog-geen-marcom-entries-voor-deze-collectie'
											  )
											: t(
													'collection/components/collection-or-bundle-edit-marcom___er-zijn-nog-geen-marcom-entries-voor-deze-bundel'
											  )
									}
									rowKey="id"
								/>
							) : (
								<Spacer margin={['top-large', 'bottom-large']}>
									<Flex center>
										<Spinner size="large" />
									</Flex>
								</Spacer>
							)}
						</Spacer>
						<FormGroup
							label={t(
								'collection/components/collection-or-bundle-edit-marcom___opmerkingen'
							)}
						>
							<TextArea
								value={get(collection, 'marcom_note.note', '')}
								onChange={(newNote: string) => {
									changeCollectionState({
										type: 'UPDATE_COLLECTION_PROP',
										collectionProp: 'marcom_note',
										collectionPropValue: {
											...get(collection, 'marcom_note', {}),
											note: newNote,
										},
									});
								}}
							/>
						</FormGroup>
					</Form>
				</Container>
			</Container>
		</>
	);
};

export default withUser(CollectionOrBundleEditMarcom) as FunctionComponent<
	CollectionOrBundleEditMarcomProps
>;
