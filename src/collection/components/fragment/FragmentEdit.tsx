import {
	Button,
	Column,
	convertToHtml,
	Form,
	FormGroup,
	Grid,
	IconName,
	MoreOptionsDropdown,
	TextInput,
	Thumbnail,
	Toggle,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { RichEditorState } from '@viaa/avo2-components/dist/esm/wysiwyg';
import { Avo } from '@viaa/avo2-types';
import { get, isEqual, isNil, isString } from 'lodash-es';
import React, {
	FunctionComponent,
	ReactNode,
	ReactText,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import { DeleteObjectModal, FlowPlayerWrapper } from '../../../shared/components';
import WYSIWYGWrapper from '../../../shared/components/WYSIWYGWrapper/WYSIWYGWrapper';
import {
	getMoreOptionsLabel,
	WYSIWYG_OPTIONS_AUTHOR,
	WYSIWYG_OPTIONS_DEFAULT,
} from '../../../shared/constants';
import { createDropdownMenuItem } from '../../../shared/helpers';
import withUser, { UserProps } from '../../../shared/hocs/withUser';
import { ToastService } from '../../../shared/services';
import { trackEvents } from '../../../shared/services/event-logging-service';
import { CollectionBlockType } from '../../collection.const';
import { CollectionAction } from '../CollectionOrBundleEdit';
import CutFragmentModal from '../modals/CutFragmentModal';

import FragmentAdd from './FragmentAdd';

interface FragmentEditProps {
	index: number;
	collectionId: string;
	numberOfFragments: number;
	changeCollectionState: (action: CollectionAction) => void;
	openOptionsId: number | string | null;
	setOpenOptionsId: (id: number | string | null) => void;
	isParentACollection: boolean;
	fragment: Avo.Collection.Fragment;
	allowedToAddLinks: boolean;
	renderWarning?: () => ReactNode | null;
}

const FragmentEdit: FunctionComponent<FragmentEditProps & UserProps> = ({
	index,
	collectionId,
	numberOfFragments,
	changeCollectionState,
	openOptionsId,
	setOpenOptionsId,
	isParentACollection,
	fragment,
	allowedToAddLinks,
	renderWarning = () => null,
	user,
}) => {
	const [t] = useTranslation();

	const [isCutModalOpen, setIsCutModalOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
	const [descriptionRichEditorState, setDescriptionRichEditorState] = useState<
		RichEditorState | undefined
	>(undefined);

	const isThisFragmentACollection = fragment.type === 'COLLECTION';

	// Check whether the current fragment is the first and/or last fragment in collection
	const isFirst = (fragmentIndex: number) => fragmentIndex === 0;
	const isLast = (fragmentIndex: number) => fragmentIndex === numberOfFragments - 1;

	const getTitle = useCallback(() => {
		if (fragment.use_custom_fields) {
			return fragment.custom_title || '';
		}
		return get(fragment.item_meta, 'title', '');
	}, [fragment.use_custom_fields, fragment.custom_title, fragment.item_meta]);

	// Cache title until the text field blurs, then pass title to collection edit reducer
	// Otherwise rerendering cannot keep up with type speed / delete speed
	const [tempTitle, setTempTitle] = useState<string>(getTitle());

	const FRAGMENT_DROPDOWN_ITEMS = [
		// TODO: DISABLED FEATURE
		// createDropdownMenuItem('duplicate', 'Dupliceren', 'copy'),
		// createDropdownMenuItem('move', 'Verplaatsen', 'arrow-right'),
		createDropdownMenuItem('delete', 'Verwijderen'),
		// TODO: DISABLED FEATURE
		// createDropdownMenuItem('copyToCollection', 'Kopiëren naar andere collectie', 'copy'),
		// createDropdownMenuItem('moveToCollection', 'Verplaatsen naar andere collectie', 'arrow-right'),
	];

	useEffect(() => {
		setTempTitle(getTitle());
	}, [fragment.use_custom_fields, getTitle]);

	const handleChangedValue = (
		fragmentProp: keyof Avo.Collection.Fragment,
		fragmentPropValue: any
	) => {
		if (fragmentProp === 'use_custom_fields') {
			setDescriptionRichEditorState(undefined);
		}
		changeCollectionState({
			index,
			fragmentProp,
			fragmentPropValue,
			type: 'UPDATE_FRAGMENT_PROP',
		});
	};

	const getDescription = (): string | undefined => {
		let description: string | undefined | null;
		if (fragment.use_custom_fields) {
			description = fragment.custom_description;
		} else {
			description = get(fragment, 'item_meta.description');
		}
		if (isString(description)) {
			description = convertToHtml(description);
		}
		return description || undefined;
	};

	const itemMetaData = (fragment as any).item_meta;

	const onDeleteFragment = () => {
		setDeleteModalOpen(false);
		setOpenOptionsId(null);

		changeCollectionState({
			index,
			type: 'DELETE_FRAGMENT',
		});

		const objectType = isThisFragmentACollection ? 'bundle' : 'collection';
		trackEvents(
			{
				object: collectionId,
				object_type: objectType,
				action: 'delete',
			},
			user
		);

		if (!isThisFragmentACollection) {
			if (fragment.type === 'TEXT') {
				// Text block
				ToastService.success(
					t(
						'collection/components/fragment/fragment-edit___tekst-is-succesvol-verwijderd-uit-de-collectie'
					)
				);
			} else {
				// video/audio fragment
				ToastService.success(
					t(
						'collection/components/fragment/fragment-edit___fragment-is-succesvol-verwijderd-uit-de-collectie'
					)
				);
			}
		} else {
			// Delete collection from bundle
			ToastService.success(
				t(
					'collection/components/fragment/fragment-edit___collectie-is-succesvol-verwijderd-uit-de-bundel'
				)
			);
		}
	};

	// TODO: DISABLED FEATURE
	// const onDuplicateFragment = () => {
	// 	setOpenOptionsId(null);
	// 	ToastService.success(t('collection/components/fragment/fragment-edit___fragment-is-succesvol-gedupliceerd'));
	// };

	// const onMoveFragment = () => {
	// 	setOpenOptionsId(null);
	// 	ToastService.success(t('collection/components/fragment/fragment-edit___fragment-is-succesvol-verplaatst'));
	// };

	// const onCopyFragmentToCollection = () => {
	// 	setOpenOptionsId(null);
	// 	ToastService.success(t('collection/components/fragment/fragment-edit___fragment-is-succesvol-gekopieerd-naar-collectie'));
	// };

	// const onMoveFragmentToCollection = () => {
	// 	setOpenOptionsId(null);
	// 	ToastService.success(t('collection/components/fragment/fragment-edit___fragment-is-succesvol-verplaatst-naar-collectie'));
	// };

	const onClickDropdownItem = (item: ReactText) => {
		setOpenOptionsId(null);
		switch (item) {
			// TODO: DISABLED FEATURE
			// case 'duplicate':
			// 	onDuplicateFragment();
			// 	break;
			// case 'move':
			// 	onMoveFragment();
			// 	break;
			case 'delete':
				setDeleteModalOpen(true);
				break;

			// TODO: DISABLED FEATURE
			// case 'copyToCollection':
			// 	onCopyFragmentToCollection();
			// 	break;
			// case 'moveToCollection':
			// 	onMoveFragmentToCollection();
			// 	break;
			default:
				return null;
		}
	};

	// Render functions
	const renderReorderButton = (index: number, direction: 'up' | 'down') => (
		<Button
			type="secondary"
			icon={`chevron-${direction}` as IconName}
			ariaLabel={
				direction === 'up'
					? t('collection/components/fragment/fragment-edit___verplaats-naar-boven')
					: t('collection/components/fragment/fragment-edit___verplaats-naar-onder')
			}
			title={
				direction === 'up'
					? t('collection/components/fragment/fragment-edit___verplaats-naar-boven')
					: t('collection/components/fragment/fragment-edit___verplaats-naar-onder')
			}
			onClick={() => {
				changeCollectionState({
					index,
					direction,
					type: 'SWAP_FRAGMENTS',
				});
			}}
		/>
	);

	const renderForm = () => {
		const disableVideoFields: boolean =
			!fragment.use_custom_fields && fragment.type !== CollectionBlockType.TEXT;

		return (
			<Form>
				{itemMetaData && (
					<FormGroup
						label={
							[CollectionBlockType.ITEM, CollectionBlockType.TEXT].includes(
								fragment.type as CollectionBlockType
							)
								? t(
										'collection/components/fragment/fragment-edit___alternatieve-tekst'
								  )
								: t(
										'collection/components/fragment/fragment-edit___eigen-collectie-titel'
								  )
						}
						labelFor="customFields"
					>
						<Toggle
							id="customFields"
							checked={fragment.use_custom_fields}
							onChange={(newUseCustomFields: boolean) =>
								handleChangedValue('use_custom_fields', newUseCustomFields)
							}
						/>
					</FormGroup>
				)}
				<FormGroup
					label={t('collection/components/fragment/fragment-edit___tekstblok-titel')}
					labelFor={`title_${fragment.id}`}
				>
					<TextInput
						id={`title_${fragment.id}`}
						type="text"
						value={tempTitle}
						placeholder={t(
							'collection/components/fragment/fragment-edit___geef-hier-de-titel-van-je-tekstblok-in'
						)}
						onChange={setTempTitle}
						onBlur={() => handleChangedValue('custom_title', tempTitle)}
						disabled={disableVideoFields}
					/>
				</FormGroup>
				{!isThisFragmentACollection && (
					<FormGroup
						label={t(
							'collection/components/fragment/fragment-edit___tekstblok-beschrijving'
						)}
						labelFor={`description_${fragment.id}`}
					>
						{!isNil(allowedToAddLinks) && (
							<WYSIWYGWrapper
								id={`description_${fragment.id}`}
								controls={
									allowedToAddLinks
										? WYSIWYG_OPTIONS_AUTHOR
										: WYSIWYG_OPTIONS_DEFAULT
								}
								placeholder={t(
									'collection/components/fragment/fragment-edit___geef-hier-de-inhoud-van-je-tekstblok-in'
								)}
								initialHtml={getDescription()}
								state={descriptionRichEditorState}
								onChange={setDescriptionRichEditorState}
								onBlur={() => {
									if (descriptionRichEditorState) {
										handleChangedValue(
											'custom_description' as any,
											descriptionRichEditorState.toHTML()
										);
									}
								}}
								disabled={disableVideoFields}
							/>
						)}
					</FormGroup>
				)}
			</Form>
		);
	};

	const getDeleteFragmentModalTitle = () => {
		if (isParentACollection) {
			// collection
			if (fragment.type === 'TEXT') {
				// text
				return t(
					'collection/components/fragment/fragment-edit___ben-je-zeker-dat-je-deze-tekst-blok-wil-verwijderen-uit-deze-collectie'
				);
			} else {
				// video/audio fragment
				return t(
					'collection/components/fragment/fragment-edit___ben-je-zeker-dat-je-dit-fragment-wil-verwijderen-uit-deze-collectie'
				);
			}
		} else {
			// bundle
			return t(
				'collection/components/fragment/fragment-edit___ben-je-zeker-dat-je-de-collectie-wil-verwijderen-uit-deze-bundel'
			);
		}
	};

	return (
		<>
			<div className="c-panel">
				<div className="c-panel__header">
					<Toolbar>
						<ToolbarLeft>
							<ToolbarItem>
								<div className="c-button-toolbar">
									{!isFirst(index) && renderReorderButton(index, 'up')}
									{!isLast(index) && renderReorderButton(index, 'down')}
									{itemMetaData && !isThisFragmentACollection && (
										<Button
											icon="scissors"
											label={t(
												'collection/components/fragment/fragment-edit___knippen'
											)}
											title={t(
												'collection/components/fragment/fragment-edit___knip-een-fragment-uit-dit-video-audio-fragment'
											)}
											type="secondary"
											onClick={() => setIsCutModalOpen(true)}
										/>
									)}
								</div>
							</ToolbarItem>
						</ToolbarLeft>
						<ToolbarRight>
							<ToolbarItem>
								<MoreOptionsDropdown
									isOpen={openOptionsId === fragment.id}
									onOpen={() => setOpenOptionsId(fragment.id)}
									onClose={() => setOpenOptionsId(null)}
									label={getMoreOptionsLabel()}
									menuItems={FRAGMENT_DROPDOWN_ITEMS}
									onOptionClicked={onClickDropdownItem}
								/>
							</ToolbarItem>
						</ToolbarRight>
					</Toolbar>
				</div>
				{renderWarning()}
				<div className="c-panel__body">
					{fragment.type !== CollectionBlockType.TEXT && itemMetaData ? (
						<Grid>
							<Column size="3-6">
								{!isThisFragmentACollection ? (
									<FlowPlayerWrapper
										item={itemMetaData}
										poster={
											fragment.thumbnail_path || itemMetaData.thumbnail_path
										}
										external_id={itemMetaData.external_id}
										duration={itemMetaData.duration}
										title={itemMetaData.title}
										cuePoints={{
											start: fragment.start_oc,
											end: fragment.end_oc,
										}}
										canPlay={!isCutModalOpen && !isDeleteModalOpen}
									/>
								) : (
									<Thumbnail
										category="collection"
										src={itemMetaData.thumbnail_path}
									/>
								)}
							</Column>
							<Column size="3-6">{renderForm()}</Column>
						</Grid>
					) : (
						<Form>{renderForm()}</Form>
					)}
				</div>
			</div>

			{!isThisFragmentACollection && (
				<FragmentAdd
					index={index}
					collectionId={collectionId}
					numberOfFragments={numberOfFragments}
					changeCollectionState={changeCollectionState}
				/>
			)}

			<DeleteObjectModal
				title={getDeleteFragmentModalTitle()}
				body={t(
					'collection/components/fragment/fragment-edit___deze-actie-kan-niet-ongedaan-gemaakt-worden'
				)}
				isOpen={isDeleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				confirmCallback={() => onDeleteFragment()}
			/>

			{itemMetaData && !isThisFragmentACollection && (
				<CutFragmentModal
					isOpen={isCutModalOpen}
					onClose={() => setIsCutModalOpen(false)}
					itemMetaData={itemMetaData}
					changeCollectionState={changeCollectionState}
					fragment={fragment}
					index={index}
				/>
			)}
		</>
	);
};

function areEqual(prevProps: FragmentEditProps, nextProps: FragmentEditProps) {
	return (
		prevProps.numberOfFragments === nextProps.numberOfFragments &&
		prevProps.collectionId === nextProps.collectionId &&
		isEqual(prevProps.fragment, nextProps.fragment) &&
		isEqual(prevProps.openOptionsId, nextProps.openOptionsId) &&
		prevProps.allowedToAddLinks === nextProps.allowedToAddLinks &&
		prevProps.index === nextProps.index
	);
}

export default React.memo(withUser(FragmentEdit) as FunctionComponent<FragmentEditProps>, areEqual);
