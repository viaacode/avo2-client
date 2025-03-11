import { BlockHeading } from '@meemoo/admin-core-ui/dist/client.mjs';
import {
	Button,
	ButtonToolbar,
	Container,
	DatePicker,
	Flex,
	FlexItem,
	Form,
	FormGroup,
	IconName,
	Select,
	Spacer,
	Spinner,
	Table,
	TextArea,
	TextInput,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { get, uniq } from 'lodash-es';
import React, { type FC, type ReactNode, useCallback, useEffect, useState } from 'react';
import { Link, type RouteComponentProps } from 'react-router-dom';

import { APP_PATH } from '../../constants';
import { FileUpload } from '../../shared/components';
import { type App_Collection_Marcom_Log_Insert_Input } from '../../shared/generated/graphql-db-types';
import { buildLink, CustomError, formatDate } from '../../shared/helpers';
import { ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list';
import { truncateTableValue } from '../../shared/helpers/truncate';
import withUser, { type UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import { KlascementService } from '../../shared/services/klascement-service';
import { ToastService } from '../../shared/services/toast-service';
import {
	GET_MARCOM_CHANNEL_NAME_OPTIONS,
	GET_MARCOM_CHANNEL_TYPE_OPTIONS,
	GET_MARCOM_ENTRY_TABLE_COLUMNS,
} from '../collection.const';
import { CollectionService } from '../collection.service';
import {
	CollectionCreateUpdateTab,
	ContentTypeNumber,
	type MarcomEntry,
} from '../collection.types';

import { type CollectionAction, type MarcomNoteInfo } from './CollectionOrBundleEdit.types';

interface CollectionOrBundleEditMarcomProps {
	collection: Avo.Collection.Collection & { marcom_note?: MarcomNoteInfo };
	changeCollectionState: (action: CollectionAction) => void;
	history: RouteComponentProps['history'];
	onFocus?: () => void;
}

const CollectionOrBundleEditMarcom: FC<CollectionOrBundleEditMarcomProps & UserProps> = ({
	collection,
	changeCollectionState,
	onFocus,
}) => {
	const { tText, tHtml } = useTranslation();

	const isCollection = collection.type_id === ContentTypeNumber.collection;

	const [marcomDate, setMarcomDate] = useState<Date | null>(new Date());
	const [marcomChannelType, setMarcomChannelType] = useState<string | null>();
	const [marcomChannelName, setMarcomChannelName] = useState<string | null>();
	const [marcomLink, setMarcomLink] = useState<string>('');
	const [marcomEntries, setMarcomEntries] = useState<MarcomEntry[] | null>(null);
	const [klascementAlt, setKlascementAlt] = useState<string | undefined>();
	const [klascementSource, setKlascementSource] = useState<string | undefined>();
	const [klascementImage, setKlascementImage] = useState<string | null>();
	const [isPublishing, setIsPublishing] = useState<boolean>(false);

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
				tHtml(
					'collection/components/collection-or-bundle-edit-marcom___het-ophalen-van-de-marcom-entries-is-mislukt'
				)
			);
		}
	}, [collection.id, tHtml]);

	const handlePublish = async () => {
		setIsPublishing(true);

		const publishData = {
			collectionId: collection.id,
			altText: klascementAlt,
			source: klascementSource,
			imageUrl: klascementImage,
		};

		try {
			await KlascementService.publishCollection(publishData);
		} catch (err) {
			setIsPublishing(false);

			ToastService.danger(tText('publiceren-naar-klascement-mislukt'));
		}

		ToastService.success(tText('publiceren-naar-klascement-gelukt'));
		setIsPublishing(false);
	};

	useEffect(() => {
		fetchMarcomEntries();
	}, [fetchMarcomEntries]);

	const renderMarcomTableCell = (
		rowData: Partial<MarcomEntry>,
		columnId: keyof MarcomEntry | typeof ACTIONS_TABLE_COLUMN_ID
	): ReactNode => {
		const value = get(rowData, columnId);
		switch (columnId) {
			case 'publish_date':
				return formatDate(value) || '-';

			case 'external_link': {
				const valueLink: string = (value || '').includes('//') ? value || '' : `//${value}`;
				return value ? (
					<a href={valueLink} target="_blank" rel="noopener noreferrer">
						{truncateTableValue(value)}
					</a>
				) : (
					'-'
				);
			}

			case 'channel_type':
				return truncateTableValue(
					GET_MARCOM_CHANNEL_TYPE_OPTIONS().find((option) => option.value === value)
						?.label || '-'
				);

			case 'channel_name':
				return truncateTableValue(
					GET_MARCOM_CHANNEL_NAME_OPTIONS().find((option) => option.value === value)
						?.label || '-'
				);

			case 'parent_collection':
				return value ? (
					<Link
						to={buildLink(APP_PATH.BUNDLE_EDIT_TAB.route, {
							id: get(value, 'id'),
							tabId: CollectionCreateUpdateTab.MARCOM,
						})}
					>
						<span>{get(value, 'title')}</span>
					</Link>
				) : (
					''
				);

			case ACTIONS_TABLE_COLUMN_ID:
				return (
					<ButtonToolbar>
						<Button
							icon={IconName.delete}
							onClick={() => {
								if (rowData.id) {
									deleteMarcomEntry(rowData);
								}
							}}
							size="small"
							title={tText(
								'collection/components/collection-or-bundle-edit-marcom___verwijder-de-marcom-entry'
							)}
							ariaLabel={tText(
								'collection/components/collection-or-bundle-edit-marcom___verwijder-de-marcom-entry'
							)}
							type="danger-hover"
						/>
					</ButtonToolbar>
				);

			default:
				return truncateTableValue(value) || '-';
		}
	};

	const addMarcomEntry = async () => {
		let marcomEntry: App_Collection_Marcom_Log_Insert_Input | null = null;
		try {
			marcomEntry = {
				channel_type: marcomChannelType || null,
				channel_name: marcomChannelName || null,
				collection_id: collection.id,
				external_link: marcomLink.trim() || null,
				publish_date: marcomDate?.toISOString(),
			};
			await CollectionService.insertMarcomEntry([marcomEntry]);
			if (!isCollection) {
				// It's a bundle: add this entry to all included collections
				const collections = collection.collection_fragments.filter(
					(fragment) => fragment.type === 'COLLECTION'
				);
				const collectionIds = uniq(collections.map((fragment) => fragment.external_id));
				await CollectionService.insertMarcomEntriesForBundleCollections(
					collection.id,
					collectionIds,
					{
						collection_id: marcomEntry.collection_id,
						channel_name: marcomEntry.channel_name,
						channel_type: marcomEntry.channel_type,
						external_link: marcomEntry.external_link,
						publish_date: marcomEntry.publish_date,
					}
				);
			}
			await fetchMarcomEntries();
			ToastService.success(
				tHtml(
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
				tHtml(
					'collection/components/collection-or-bundle-edit-marcom___het-toevoegen-van-de-marcom-entry-is-mislukt'
				)
			);
		}
	};

	const deleteMarcomEntry = async (marcomEntry: Partial<MarcomEntry>) => {
		try {
			if (marcomEntry.id) {
				if (!isCollection) {
					// bundle => delete all marcom entries with the same values from child collections (parent_collection_id) in de bundle: https://meemoo.atlassian.net/browse/AVO-1892
					await CollectionService.deleteMarcomEntryByParentId(marcomEntry);
				}
				// Delete the communication entry for the current collection/bundle
				await CollectionService.deleteMarcomEntryById(marcomEntry.id);
			}
			await fetchMarcomEntries();
			ToastService.success(
				isCollection
					? tHtml(
							'collection/components/collection-or-bundle-edit-marcom___de-communicatie-entry-is-verwijderd-voor-deze-collectie'
					  )
					: tHtml(
							'collection/components/collection-or-bundle-edit-marcom___de-communicatie-entry-is-verwijderd-voor-de-bundel-en-alle-collecties-in-deze-bundel'
					  )
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to remove marcom entry from the database', err, {
					marcomEntry,
				})
			);
			ToastService.danger(
				tHtml(
					'collection/components/collection-or-bundle-edit-marcom___het-verwijderen-van-de-marcom-entry-is-mislukt'
				)
			);
		}
	};

	const getEmptyMarcomTableMessage = () => {
		if (isCollection) {
			// Collection
			// Without filters
			return tText(
				'collection/components/collection-or-bundle-edit-marcom___er-zijn-nog-geen-marcom-entries-voor-deze-collectie'
			);
		} else {
			// Bundle
			// Without filters
			return tText(
				'collection/components/collection-or-bundle-edit-marcom___er-zijn-nog-geen-marcom-entries-voor-deze-collectie'
			);
		}
	};

	return (
		<>
			<Container mode="vertical">
				<Container mode="horizontal">
					<Form>
						<BlockHeading type="h3">
							{tText(
								'collection/components/collection-or-bundle-edit-marcom___meest-recente-communicatie'
							)}
						</BlockHeading>
						<Flex justify="between" spaced="wide">
							<FlexItem>
								<FormGroup
									label={tText(
										'collection/components/collection-or-bundle-edit-marcom___datum-communicatie'
									)}
								>
									<DatePicker onChange={setMarcomDate} value={marcomDate} />
								</FormGroup>
							</FlexItem>
							<FlexItem>
								<FormGroup
									label={tText(
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
									label={tText(
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
									label={tText(
										'collection/components/collection-or-bundle-edit-marcom___link'
									)}
								>
									<TextInput
										onChange={setMarcomLink}
										value={marcomLink || undefined}
										onFocus={onFocus}
									/>
								</FormGroup>
							</FlexItem>
							<FlexItem>
								<FormGroup label=" ">
									<Button
										label={tText(
											'collection/components/collection-or-bundle-edit-marcom___toevoegen'
										)}
										onClick={addMarcomEntry}
										type="primary"
									/>
								</FormGroup>
							</FlexItem>
						</Flex>
						<Spacer margin={['top-extra-large', 'bottom-large']}>
							<BlockHeading type="h3" className="u-padding-top u-padding-bottom">
								{tText(
									'collection/components/collection-or-bundle-edit-marcom___eerdere-communicatie'
								)}
							</BlockHeading>
							{marcomEntries ? (
								<>
									<Table
										data={marcomEntries}
										columns={GET_MARCOM_ENTRY_TABLE_COLUMNS(isCollection)}
										renderCell={renderMarcomTableCell as any}
										emptyStateMessage={getEmptyMarcomTableMessage()}
										rowKey="id"
									/>
								</>
							) : (
								<Spacer margin={['top-large', 'bottom-large']}>
									<Flex center>
										<Spinner size="large" />
									</Flex>
								</Spacer>
							)}
						</Spacer>
						<FormGroup
							label={tText(
								'collection/components/collection-or-bundle-edit-marcom___opmerkingen'
							)}
						>
							<TextArea
								value={collection?.marcom_note?.note || ''}
								onChange={(newNote: string) => {
									changeCollectionState({
										type: 'UPDATE_COLLECTION_PROP',
										collectionProp: 'marcom_note',
										collectionPropValue: {
											id: collection?.marcom_note?.id || undefined,
											note: newNote,
										},
									});
								}}
								onFocus={onFocus}
							/>
						</FormGroup>
						<BlockHeading type="h3">{tText('klascement-titel')}</BlockHeading>
						<Flex spaced="wide">
							<FlexItem>
								<FileUpload
									label={tText('upload-een-klascement-afbeelding')}
									urls={klascementImage ? [klascementImage] : []}
									allowMulti={false}
									assetType="KLASCEMENT_VIDEO_IMAGE"
									allowedDimensions={{
										minWidth: 680,
										maxWidth: 680,
										minHeight: 380,
										maxHeight: 380,
									}}
									ownerId={collection.id}
									onChange={(urls) => setKlascementImage(urls[0] || null)}
								/>
							</FlexItem>
							<FlexItem>
								<FormGroup label={tText('klascement-alt-text')}>
									<TextInput value={klascementAlt} onChange={setKlascementAlt} />
								</FormGroup>
								<FormGroup label={tText('klascement-bron-text')}>
									<TextInput
										value={klascementSource}
										onChange={setKlascementSource}
									/>
								</FormGroup>
								<Button
									label={tText('klascement-publiceren')}
									type="primary"
									disabled={
										!collection.is_public ||
										!!collection.klascement ||
										isPublishing
									}
									onClick={handlePublish}
								/>
							</FlexItem>
						</Flex>
					</Form>
				</Container>
			</Container>
		</>
	);
};

export default withUser(CollectionOrBundleEditMarcom) as FC<CollectionOrBundleEditMarcomProps>;
