import { get, isNil, orderBy } from 'lodash-es';
import React, { FunctionComponent, ReactText, SetStateAction, useEffect, useState } from 'react';
import { withApollo } from 'react-apollo';
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

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import {
	PermissionNames,
	PermissionService,
} from '../../../authentication/helpers/permission-service';
import { ControlledDropdown, DeleteObjectModal } from '../../../shared/components';
import { WYSIWYG_OPTIONS_AUTHOR, WYSIWYG_OPTIONS_DEFAULT } from '../../../shared/constants';
import { createDropdownMenuItem, getEnv } from '../../../shared/helpers';
import { fetchPlayerTicket } from '../../../shared/services/player-ticket-service';
import toastService from '../../../shared/services/toast-service';
import { isMediaFragment } from '../../helpers';

import { CollectionAction } from '../CollectionOrBundleEdit';
import CutFragmentModal from '../modals/CutFragmentModal';
import FragmentAdd from './FragmentAdd';

interface FragmentEditProps extends DefaultSecureRouteProps {
	type: 'itemOrText' | 'collection';
	index: number;
	collection: Avo.Collection.Collection;
	changeCollectionState: (action: CollectionAction) => void;
	openOptionsId: number | null;
	setOpenOptionsId: React.Dispatch<SetStateAction<number | null>>;
	fragment: Avo.Collection.Fragment;
	reorderFragments: (fragments: Avo.Collection.Fragment[]) => Avo.Collection.Fragment[];
}

const FragmentEdit: FunctionComponent<FragmentEditProps> = ({
	type,
	index,
	collection,
	changeCollectionState,
	openOptionsId,
	setOpenOptionsId,
	fragment,
	reorderFragments,
	user,
}) => {
	const [t] = useTranslation();

	const [playerTicket, setPlayerTicket] = useState<string>();
	const [isCutModalOpen, setIsCutModalOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
	const [cuePoints, setCuePoints] = useState({
		start: fragment.start_oc,
		end: fragment.end_oc,
	});
	const [allowedToAddLinks, setAllowedToAddLinks] = useState<boolean | null>(null);

	const isCollection = type === 'collection';

	// Check whether the current fragment is the first and/or last fragment in collection
	const isFirst = (fragmentIndex: number) => fragmentIndex === 0;
	const isLast = (fragmentIndex: number) =>
		fragmentIndex === collection.collection_fragments.length - 1;

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
		PermissionService.hasPermission(PermissionNames.ADD_HYPERLINK_COLLECTIONS, null, user)
			.then(hasPermission => {
				setAllowedToAddLinks(hasPermission);
			})
			.catch(err => {
				console.error(
					'Failed to check permissions for adding hyperlinks in collection fragment editors',
					err,
					{ user, permission: PermissionNames.ADD_HYPERLINK_COLLECTIONS }
				);
				toastService.danger(
					t(
						'collection/components/fragment/fragment-edit___het-controleren-van-je-account-rechten-is-mislukt'
					)
				);
			});
	}, [user, t]);

	const handleChangedValue = (
		fragmentProp: keyof Avo.Collection.Fragment,
		fragmentPropValue: any
	) => {
		changeCollectionState({
			fragmentProp,
			fragmentPropValue,
			type: 'UPDATE_FRAGMENT_PROP',
			fragmentId: fragment.id,
		});
		// }
	};

	const getTitle = () => {
		if (fragment.use_custom_fields) {
			return fragment.custom_title || '';
		}
		return get(fragment, 'item_meta.title', '');
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
				toastService.danger(
					t('collection/components/fragment/fragment-edit___play-ticket-kon-niet-opgehaald-worden')
				)
			);

	const itemMetaData = (fragment as any).item_meta;

	const onDeleteFragment = (fragmentId: number) => {
		setOpenOptionsId(null);

		// Sort fragments by position
		const orderedFragments = orderBy(
			collection.collection_fragments.filter(
				({ id: collectionFragmentId }: Avo.Collection.Fragment) =>
					collectionFragmentId !== fragmentId
			),
			['position'],
			['asc']
		);

		const positionedFragments = reorderFragments(orderedFragments);

		changeCollectionState({
			type: 'UPDATE_COLLECTION_PROP',
			collectionProp: 'collection_fragments',
			collectionPropValue: positionedFragments,
		});

		toastService.success(
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
	// 	toastService.success(t('collection/components/fragment/fragment-edit___fragment-is-succesvol-gedupliceerd'));
	// };

	// const onMoveFragment = () => {
	// 	setOpenOptionsId(null);
	// 	toastService.success(t('collection/components/fragment/fragment-edit___fragment-is-succesvol-verplaatst'));
	// };

	// const onCopyFragmentToCollection = () => {
	// 	setOpenOptionsId(null);
	// 	toastService.success(t('collection/components/fragment/fragment-edit___fragment-is-succesvol-gekopieerd-naar-collectie'));
	// };

	// const onMoveFragmentToCollection = () => {
	// 	setOpenOptionsId(null);
	// 	toastService.success(t('collection/components/fragment/fragment-edit___fragment-is-succesvol-verplaatst-naar-collectie'));
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
	const renderReorderButton = (fragmentId: number, direction: 'up' | 'down') => (
		<Button
			type="secondary"
			icon={`chevron-${direction}` as IconName}
			onClick={() => {
				changeCollectionState({
					direction,
					type: 'SWAP_FRAGMENTS',
					currentFragmentId: fragmentId,
				});
			}}
		/>
	);

	const renderForm = () => {
		const disableVideoFields: boolean = !fragment.use_custom_fields && !!isMediaFragment(fragment);

		return (
			<Form>
				{itemMetaData && (
					<FormGroup
						label={t('collection/components/fragment/fragment-edit___alternatieve-tekst')}
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
						value={getTitle()}
						placeholder={t(
							'collection/components/fragment/fragment-edit___geef-hier-de-titel-van-je-tekstblok-in'
						)}
						onChange={(newTitle: string) => handleChangedValue('custom_title', newTitle)}
						disabled={disableVideoFields}
					/>
				</FormGroup>
				{!isCollection && (
					<FormGroup
						label={t('collection/components/fragment/fragment-edit___tekstblok-beschrijving')}
						labelFor={`description_${fragment.id}`}
					>
						{!isNil(allowedToAddLinks) && (
							<WYSIWYG
								id={`description_${fragment.id}`}
								btns={allowedToAddLinks ? WYSIWYG_OPTIONS_AUTHOR : WYSIWYG_OPTIONS_DEFAULT}
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
									{!isFirst(index) && renderReorderButton(fragment.position, 'up')}
									{!isLast(index) && renderReorderButton(fragment.position, 'down')}
									{itemMetaData && !isCollection && (
										<Button
											icon="scissors"
											label={t('collection/components/fragment/fragment-edit___knippen')}
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
											ariaLabel={t('collection/components/fragment/fragment-edit___meer-opties')}
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
					{(isMediaFragment(fragment) && itemMetaData) || isCollection ? (
						<Grid>
							<Column size="3-6">
								{!isCollection ? (
									<FlowPlayer
										src={playerTicket ? playerTicket.toString() : null}
										poster={itemMetaData.thumbnail_path}
										title={itemMetaData.title}
										onInit={initFlowPlayer}
										subtitles={[itemMetaData.issued, get(itemMetaData, 'organisation.name', '')]}
										token={getEnv('FLOW_PLAYER_TOKEN')}
										dataPlayerId={getEnv('FLOW_PLAYER_ID')}
										logo={get(itemMetaData, 'organisation.logo_url')}
										{...cuePoints}
									/>
								) : (
									<Thumbnail category="collection" src={itemMetaData.thumbnail_path} />
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
					collection={collection}
					changeCollectionState={changeCollectionState}
					reorderFragments={reorderFragments}
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
				deleteObjectCallback={() => onDeleteFragment(fragment.id)}
			/>

			{itemMetaData && !isCollection && (
				<CutFragmentModal
					isOpen={isCutModalOpen}
					onClose={() => setIsCutModalOpen(false)}
					itemMetaData={itemMetaData}
					changeCollectionState={changeCollectionState}
					fragment={fragment}
					updateCuePoints={setCuePoints}
				/>
			)}
		</>
	);
};

export default withApollo(FragmentEdit);
