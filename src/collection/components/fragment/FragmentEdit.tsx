import { get, isEqual, isNil } from 'lodash-es';
import React, {
	FunctionComponent,
	ReactText,
	SetStateAction,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import {
	Button,
	Column,
	convertToHtml,
	DropdownButton,
	DropdownContent,
	FlowPlayer,
	Form,
	FormGroup,
	Grid,
	IconName,
	MenuContent,
	TextInput,
	Thumbnail,
	Toggle,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
	WYSIWYG,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { ControlledDropdown, DeleteObjectModal } from '../../../shared/components';
import { WYSIWYG_OPTIONS_AUTHOR, WYSIWYG_OPTIONS_DEFAULT } from '../../../shared/constants';
import { createDropdownMenuItem, getEnv } from '../../../shared/helpers';
import { ToastService } from '../../../shared/services';
import { fetchPlayerTicket } from '../../../shared/services/player-ticket-service';

import { CollectionAction } from '../CollectionOrBundleEdit';
import CutFragmentModal from '../modals/CutFragmentModal';
import FragmentAdd from './FragmentAdd';

interface FragmentEditProps {
	type: 'itemOrText' | 'collection';
	index: number;
	collectionId: string;
	numberOfFragments: number;
	changeCollectionState: (action: CollectionAction) => void;
	openOptionsId: number | null;
	setOpenOptionsId: React.Dispatch<SetStateAction<number | null>>;
	fragment: Avo.Collection.Fragment;
	allowedToAddLinks: boolean;
}

const FragmentEdit: FunctionComponent<FragmentEditProps> = ({
	type,
	index,
	collectionId,
	numberOfFragments,
	changeCollectionState,
	openOptionsId,
	setOpenOptionsId,
	fragment,
	allowedToAddLinks,
}) => {
	const [t] = useTranslation();

	const [playerTicket, setPlayerTicket] = useState<string>();
	const [isCutModalOpen, setIsCutModalOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
	const [cuePoints, setCuePoints] = useState({
		start: fragment.start_oc,
		end: fragment.end_oc,
	});

	const isCollection = type === 'collection';

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
		changeCollectionState({
			index,
			fragmentProp,
			fragmentPropValue,
			type: 'UPDATE_FRAGMENT_PROP',
		});
	};

	const getDescription = () => {
		let description: string | undefined;
		if (fragment.use_custom_fields) {
			description = fragment.custom_description || '';
		} else {
			description = get(fragment, 'item_meta.description', '');
		}
		return convertToHtml(description);
	};

	const initFlowPlayer = () =>
		!playerTicket &&
		!isCollection &&
		fetchPlayerTicket(fragment.external_id)
			.then(data => setPlayerTicket(data))
			.catch(() =>
				ToastService.danger(
					t(
						'collection/components/fragment/fragment-edit___play-ticket-kon-niet-opgehaald-worden'
					)
				)
			);

	const itemMetaData = (fragment as any).item_meta;

	const onDeleteFragment = () => {
		setOpenOptionsId(null);

		changeCollectionState({
			index,
			type: 'DELETE_FRAGMENT',
		});

		ToastService.success(
			!isCollection
				? t(
						'collection/components/fragment/fragment-edit___fragment-is-succesvol-verwijderd-uit-de-collectie'
				  )
				: t(
						'collection/components/fragment/fragment-edit___collectie-is-succesvol-verwijderd-uit-de-bundel'
				  )
		);
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

		setOpenOptionsId(null);
	};

	// Render functions
	const renderReorderButton = (index: number, direction: 'up' | 'down') => (
		<Button
			type="secondary"
			icon={`chevron-${direction}` as IconName}
			ariaLabel={direction === 'up' ? t('Verplaats naar boven') : t('Verplaats naar onder')}
			title={direction === 'up' ? t('Verplaats naar boven') : t('Verplaats naar onder')}
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
		const disableVideoFields: boolean = !fragment.use_custom_fields && fragment.type !== 'TEXT';

		return (
			<Form>
				{itemMetaData && (
					<FormGroup
						label={
							type === 'itemOrText'
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
				{!isCollection && (
					<FormGroup
						label={t(
							'collection/components/fragment/fragment-edit___tekstblok-beschrijving'
						)}
						labelFor={`description_${fragment.id}`}
					>
						{!isNil(allowedToAddLinks) && (
							<WYSIWYG
								id={`description_${fragment.id}`}
								btns={
									allowedToAddLinks
										? WYSIWYG_OPTIONS_AUTHOR
										: WYSIWYG_OPTIONS_DEFAULT
								}
								placeholder={t(
									'collection/components/fragment/fragment-edit___geef-hier-de-inhoud-van-je-tekstblok-in'
								)}
								data={getDescription()}
								onChange={(newDescription: string) =>
									handleChangedValue('custom_description', newDescription)
								}
								disabled={disableVideoFields}
							/>
						)}
					</FormGroup>
				)}
			</Form>
		);
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
									{itemMetaData && !isCollection && (
										<Button
											icon="scissors"
											label={t(
												'collection/components/fragment/fragment-edit___knippen'
											)}
											title={t(
												'Knip een fragment uit dit video/audio fragment'
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
								<ControlledDropdown
									isOpen={openOptionsId === fragment.id}
									menuWidth="fit-content"
									onOpen={() => setOpenOptionsId(fragment.id)}
									onClose={() => setOpenOptionsId(null)}
									placement="bottom-end"
								>
									<DropdownButton>
										<Button
											type="secondary"
											icon="more-horizontal"
											ariaLabel={t(
												'collection/components/fragment/fragment-edit___meer-opties'
											)}
											title={t(
												'collection/components/fragment/fragment-edit___meer-opties'
											)}
										/>
									</DropdownButton>
									<DropdownContent>
										<MenuContent
											menuItems={FRAGMENT_DROPDOWN_ITEMS}
											onClick={onClickDropdownItem}
										/>
									</DropdownContent>
								</ControlledDropdown>
							</ToolbarItem>
						</ToolbarRight>
					</Toolbar>
				</div>
				<div className="c-panel__body">
					{fragment.type !== 'TEXT' && itemMetaData ? (
						<Grid>
							<Column size="3-6">
								{!isCollection ? (
									<FlowPlayer
										src={playerTicket ? playerTicket.toString() : null}
										poster={itemMetaData.thumbnail_path}
										title={itemMetaData.title}
										onInit={initFlowPlayer}
										subtitles={[
											itemMetaData.issued,
											get(itemMetaData, 'organisation.name', ''),
										]}
										token={getEnv('FLOW_PLAYER_TOKEN')}
										dataPlayerId={getEnv('FLOW_PLAYER_ID')}
										logo={get(itemMetaData, 'organisation.logo_url')}
										autoplay
										{...cuePoints}
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

			{!isCollection && (
				<FragmentAdd
					index={index}
					collectionId={collectionId}
					numberOfFragments={numberOfFragments}
					changeCollectionState={changeCollectionState}
				/>
			)}

			<DeleteObjectModal
				title={
					!isCollection
						? t(
								'collection/components/fragment/fragment-edit___ben-je-zeker-dat-je-dit-fragment-wil-verwijderen-uit-deze-collectie'
						  )
						: t(
								'collection/components/fragment/fragment-edit___ben-je-zeker-dat-je-de-collectie-wil-verwijderen-uit-deze-bundel'
						  )
				}
				body={t(
					'collection/components/fragment/fragment-edit___deze-actie-kan-niet-ongedaan-gemaakt-worden'
				)}
				isOpen={isDeleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				deleteObjectCallback={() => onDeleteFragment()}
			/>

			{itemMetaData && !isCollection && (
				<CutFragmentModal
					isOpen={isCutModalOpen}
					onClose={() => setIsCutModalOpen(false)}
					itemMetaData={itemMetaData}
					changeCollectionState={changeCollectionState}
					fragment={fragment}
					updateCuePoints={setCuePoints}
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
		prevProps.allowedToAddLinks === nextProps.allowedToAddLinks &&
		prevProps.index === nextProps.index &&
		prevProps.type === nextProps.type
	);
}

export default React.memo(FragmentEdit, areEqual);
