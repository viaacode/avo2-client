import { FILTER_TABLE_QUERY_PARAM_CONFIG, FilterTable } from '@meemoo/admin-core-ui/dist/admin.mjs';
import { IconName, type MenuItemInfo, MoreOptionsDropdown } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { type SearchOrderDirection } from '@viaa/avo2-types/types/search';
import { isEqual } from 'lodash-es';
import React, { type FC, useCallback, useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { useQueryParams } from 'use-query-params';

import type { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { APP_PATH } from '../../constants';
import { ConfirmModal } from '../../shared/components/ConfirmModal/ConfirmModal';
import { type LoadingInfo } from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { copyToClipboard } from '../../shared/helpers/clipboard';
import { CustomError } from '../../shared/helpers/custom-error';
import { navigate } from '../../shared/helpers/link';
import withUser from '../../shared/hocs/withUser';
import { useDebounce } from '../../shared/hooks/useDebounce';
import useTranslation from '../../shared/hooks/useTranslation';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ToastService } from '../../shared/services/toast-service';
import { ITEMS_PER_PAGE } from '../../workspace/workspace.const';
import { type EmbedCodeFilters, EmbedCodeService } from '../embed-code-service';
import { OVERVIEW_COLUMNS } from '../embed-code.const';
import {
	EMBED_CODE_DEFAULTS,
	type EmbedCode,
	type EmbedCodeOverviewFilterState,
	type EmbedCodeOverviewTableColumns,
} from '../embed-code.types';
import { toEmbedCodeIFrame } from '../helpers/links';
import { createResource } from '../helpers/resourceForTrackEvents';
import { useCreateEmbedCode } from '../hooks/useCreateEmbedCode';
import { useDeleteEmbedCode } from '../hooks/useDeleteEmbedCode';
import { useUpdateEmbedCode } from '../hooks/useUpdateEmbedCode';

import EmbedCodeFilterTableCell from './EmbedCodeFilterTableCell';
import EditEmbedCodeModal from './modals/EditEmbedCodeModal';

// Typings
interface EmbedCodeOverviewProps {
	numberOfItems: number;
	onUpdate: () => void | Promise<void>;
}

enum EmbedCodeAction {
	EDIT = 'EDIT',
	COPY_TO_CLIPBOARD = 'COPY_TO_CLIPBOARD',
	DUPLICATE = 'DUPLICATE',
	SHOW_ORIGINAL = 'SHOW_ORIGINAL',
	DELETE = 'DELETE',
}

// Component

const queryParamConfig = FILTER_TABLE_QUERY_PARAM_CONFIG([]);

const EmbedCodeOverview: FC<EmbedCodeOverviewProps & DefaultSecureRouteProps> = ({
	commonUser,
	history,
	onUpdate,
}) => {
	const { tText, tHtml } = useTranslation();

	// State
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [embedCodes, setEmbedCodes] = useState<EmbedCode[]>([]);
	const [selected, setSelected] = useState<Partial<EmbedCode> | undefined>(undefined);
	const [embedCodesCount, setEmbedCodesCount] = useState<number>(0);
	const [embedCodeForEditModal, setEmbedCodeForEditModal] = useState<
		Partial<EmbedCode> | undefined
	>(undefined);
	const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

	// Set default sorting
	const [query, setQuery] = useQueryParams({
		sort_order: queryParamConfig.sort_order,
		sort_column: queryParamConfig.sort_column,
	});

	const [filters, setFilters] = useState<EmbedCodeOverviewFilterState | undefined>(undefined);
	const debouncedFilters: EmbedCodeOverviewFilterState | undefined = useDebounce(filters, 250);
	const columns = OVERVIEW_COLUMNS();

	const { mutateAsync: duplicateEmbedCode } = useCreateEmbedCode();
	const { mutateAsync: deleteEmbedCode } = useDeleteEmbedCode();
	const { mutateAsync: updateEmbedCode } = useUpdateEmbedCode();

	// Data
	const fetchEmbedCodes = useCallback(async () => {
		setLoadingInfo({ state: 'loading' });

		try {
			if (!commonUser?.profileId || debouncedFilters === undefined) {
				setLoadingInfo({
					state: 'error',
					message: tHtml(
						'embed-code/components/embed-code-overview___er-is-onvoldoende-informatie-beschikbaar-om-ingesloten-fragmenten-op-te-halen'
					),
				});
				return;
			}

			const sortOrder =
				debouncedFilters.sort_order || query.sort_order || EMBED_CODE_DEFAULTS.sort_order;
			const sortColumn =
				debouncedFilters.sort_column ||
				query.sort_column ||
				EMBED_CODE_DEFAULTS.sort_column;
			const params: EmbedCodeFilters = {
				filterString: debouncedFilters.query,
				sortOrder: sortOrder as SearchOrderDirection,
				sortColumn: sortColumn,
				limit: ITEMS_PER_PAGE,
				offset: debouncedFilters.page * ITEMS_PER_PAGE,
			};

			const response = await EmbedCodeService.getEmbedCodes(params);

			setEmbedCodes(response.embedCodes);
			setEmbedCodesCount(response.count);

			setLoadingInfo({ state: 'loaded' });
		} catch (err) {
			console.error(
				new CustomError('Failed to get all embed codes for user', err, { commonUser })
			);

			setLoadingInfo({
				state: 'error',
				message: tHtml(
					'embed-code/components/embed-code-overview___het-ophalen-van-je-ingesloten-fragmenten-is-mislukt'
				),
			});
		}
	}, [commonUser, setEmbedCodes, setLoadingInfo, tText, debouncedFilters]); // eslint-disable-line

	const reloadEmbedCodes = async () => {
		await fetchEmbedCodes();
		onUpdate?.();
	};

	const duplicateSelectedEmbedCode = async (selected: Partial<EmbedCode>) => {
		try {
			await duplicateEmbedCode({
				title: selected.title,
				contentType: selected.contentType,
				contentId: (selected.content as Avo.Item.Item).external_id,
				descriptionType: selected.descriptionType,
				description: selected.description,
				start: selected.start,
				end: selected.end,
				externalWebsite: selected.externalWebsite,
			} as EmbedCode);

			ToastService.success(
				tHtml(
					'embed-code/components/embed-code-overview___het-fragment-werd-succesvol-gedupliceerd'
				)
			);

			setSelected(undefined);
			await reloadEmbedCodes();
		} catch (err) {
			console.error(err);
			ToastService.danger(
				tText('embed-code/components/embed-code-overview___fragment-dupliceren-mislukt')
			);
		}
	};

	const changeEmbedCode = async (data: EmbedCode) => {
		try {
			await updateEmbedCode(data);
			ToastService.success(
				tText('embed-code/components/embed-code-overview___fragment-succesvol-gewijzigd')
			);

			await reloadEmbedCodes();

			setEmbedCodeForEditModal(undefined);
		} catch (err) {
			console.error(err);
			ToastService.danger(
				tText('embed-code/components/embed-code-overview___fragment-wijzigen-mislukt')
			);
		}
	};

	const removeEmbedCode = async (id: EmbedCode['id']) => {
		try {
			await deleteEmbedCode(id);
			ToastService.success(
				tHtml(
					'embed-code/components/embed-code-overview___het-ingesloten-fragment-is-verwijderd'
				)
			);
		} catch (error) {
			console.error(error);

			ToastService.danger(
				tHtml(
					'embed-code/components/embed-code-overview___er-ging-iets-mis-bij-het-verwijderen-van-het-ingesloten-fragment'
				)
			);
		}

		await reloadEmbedCodes();

		setIsConfirmationModalOpen(false);
		setSelected(undefined);
	};

	const handleEditEmbedCode = async (embedCodeId: string) => {
		const correctEmbed = await EmbedCodeService.getEmbedCode(embedCodeId);

		setSelected(undefined);
		setEmbedCodeForEditModal(correctEmbed);
	};

	// Lifecycle

	useEffect(() => {
		fetchEmbedCodes();
	}, [fetchEmbedCodes]);

	useEffect(() => {
		setQuery({
			sort_column: query.sort_column || EMBED_CODE_DEFAULTS.sort_column,
			sort_order: query.sort_order || EMBED_CODE_DEFAULTS.sort_order,
		});
	}, []); // eslint-disable-line

	// Rendering

	const renderCell = (data: EmbedCode, id: EmbedCodeOverviewTableColumns) => (
		<EmbedCodeFilterTableCell
			id={id}
			data={data}
			onNameClick={(data) => handleEditEmbedCode(data?.id as string)}
			actions={(data) => {
				const items = [
					{
						icon: IconName.edit,
						id: EmbedCodeAction.EDIT,
						label: tText('embed-code/components/embed-code-overview___bewerken'),
					},
					{
						icon: IconName.clipboard,
						id: EmbedCodeAction.COPY_TO_CLIPBOARD,
						label: tText('embed-code/components/embed-code-overview___kopieer-code'),
					},
					{
						icon: IconName.copy,
						id: EmbedCodeAction.DUPLICATE,
						label: tText('embed-code/components/embed-code-overview___dupliceren'),
					},
					{
						icon: IconName.eye,
						id: EmbedCodeAction.SHOW_ORIGINAL,
						label: tText(
							'embed-code/components/embed-code-overview___origineel-fragment'
						),
					},
					{
						icon: IconName.delete,
						id: EmbedCodeAction.DELETE,
						label: tText('embed-code/components/embed-code-overview___verwijder'),
					},
				] as (MenuItemInfo & { id: EmbedCodeAction })[];

				return (
					data && (
						<MoreOptionsDropdown
							isOpen={data?.id === selected?.id}
							onOpen={() => setSelected(data as EmbedCode)}
							onClose={() => {
								const isAModalOpen =
									embedCodeForEditModal || isConfirmationModalOpen;

								!isAModalOpen && setSelected(undefined);
							}}
							label={tText('embed-code/components/embed-code-overview___meer-acties')}
							menuItems={items}
							onOptionClicked={async (action) => {
								if (selected === undefined) {
									return;
								}

								switch (action.toString() as EmbedCodeAction) {
									case EmbedCodeAction.EDIT:
										await handleEditEmbedCode(selected.id as string);
										break;

									case EmbedCodeAction.COPY_TO_CLIPBOARD:
										if (!selected?.id) {
											console.error(
												new CustomError(
													"EmbedCodeOverview: copyToClipboard called without selected embed code or embed doesn't have an id",
													undefined,
													{ selected }
												)
											);
											ToastService.danger(
												tHtml(
													'embed-code/components/embed-code-overview___er-ging-iets-mis-bij-het-kopieren-van-de-code'
												)
											);
											return;
										}
										trackEvents(
											{
												object: selected.id,
												object_type: 'embed_code',
												action: 'copy',
												resource: {
													...createResource(
														selected as EmbedCode,
														commonUser as Avo.User.CommonUser
													),
													pageUrl: window.location.href,
												},
											},
											commonUser
										);
										copyToClipboard(toEmbedCodeIFrame(selected?.id));
										ToastService.success(
											tHtml(
												'embed-code/components/embed-code-overview___de-code-werd-succesvol-gekopieerd'
											)
										);
										setSelected(undefined);
										break;

									case EmbedCodeAction.DUPLICATE:
										await duplicateSelectedEmbedCode(selected);
										break;

									case EmbedCodeAction.SHOW_ORIGINAL:
										navigate(history, APP_PATH.ITEM_DETAIL.route, {
											id: (selected.content as Avo.Item.Item).external_id,
										});
										break;

									case EmbedCodeAction.DELETE:
										setIsConfirmationModalOpen(true);
										break;

									default:
										break;
								}
							}}
						/>
					)
				);
			}}
		/>
	);

	return (
		<>
			<FilterTable
				columns={columns}
				data={embedCodes}
				dataCount={embedCodesCount}
				itemsPerPage={ITEMS_PER_PAGE}
				noContentMatchingFiltersMessage={
					loadingInfo.state === 'loaded'
						? tText(
								'embed-code/components/embed-code-overview___er-werden-geen-ingesloten-fragmenten-gevonden-die-voldoen-aan-de-opgegeven-criteria'
						  )
						: ''
				}
				onTableStateChanged={(state) => {
					// NOTE: prevents recursion loop but hits theoretical performance
					if (!isEqual(filters, state)) {
						setFilters(state as EmbedCodeOverviewFilterState);
					}
				}}
				renderCell={renderCell as any}
				renderNoResults={() => <h1>NoResults</h1>}
				searchTextPlaceholder={tText(
					'embed-code/components/embed-code-overview___zoek-op-titel-of-beschrijving'
				)}
				rowKey="id"
				variant="styled"
				isLoading={loadingInfo.state === 'loading'}
				hideTableColumnsButton
				showCheckboxes={false}
			/>

			<EditEmbedCodeModal
				isOpen={!!embedCodeForEditModal}
				embedCode={embedCodeForEditModal as EmbedCode}
				onClose={() => setEmbedCodeForEditModal(undefined)}
				handleUpdate={changeEmbedCode}
			/>

			<ConfirmModal
				title={tText('embed-code/components/embed-code-overview___fragment-verwijderen')}
				body={tText(
					'embed-code/components/embed-code-overview___opgelet-ben-je-zeker-dat-je-het-fragment-wil-verwijderen-het-zal-dan-niet-meer-werken-in-smartschool-en-book-widgets'
				)}
				isOpen={isConfirmationModalOpen}
				size="medium"
				onClose={() => {
					setIsConfirmationModalOpen(false);
					setSelected(undefined);
				}}
				confirmCallback={async () => selected?.id && removeEmbedCode(selected.id)}
			/>
		</>
	);
};

export default compose(withRouter, withUser)(EmbedCodeOverview) as FC<EmbedCodeOverviewProps>;
