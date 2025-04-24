import { IconName, type MenuItemInfo, MoreOptionsDropdown } from '@viaa/avo2-components';
import { type SearchOrderDirection } from '@viaa/avo2-types/types/search';
import { isEqual } from 'lodash-es';
import React, { type FC, useCallback, useEffect, useState } from 'react';
import { useQueryParams } from 'use-query-params';

import FilterTable, {
	type FilterableColumn,
} from '../../admin/shared/components/FilterTable/FilterTable';
import { FILTER_TABLE_QUERY_PARAM_CONFIG } from '../../admin/shared/components/FilterTable/FilterTable.const';
import { DeleteObjectModal, type LoadingInfo } from '../../shared/components';
import { CustomError, isMobileWidth } from '../../shared/helpers';
import withUser, { type UserProps } from '../../shared/hocs/withUser';
import { useDebounce } from '../../shared/hooks/useDebounce';
import useTranslation from '../../shared/hooks/useTranslation';
import { ToastService } from '../../shared/services/toast-service';
import { ITEMS_PER_PAGE } from '../../workspace/workspace.const';
import { type EmbedCodeFilters, EmbedCodeService } from '../embed-code-service';
import {
	EMBED_CODE_DEFAULTS,
	type EmbedCode,
	type EmbedCodeOverviewFilterState,
	type EmbedCodeOverviewTableColumns,
} from '../embed-code.types';

import EmbedCodeFilterTableCell from './EmbedCodeFilterTableCell';

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

const EmbedCodeOverview: FC<EmbedCodeOverviewProps & UserProps> = ({ commonUser }) => {
	const { tText, tHtml } = useTranslation();

	// State
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [embedCodes, setEmbedCodes] = useState<EmbedCode[]>([]);
	const [selected, setSelected] = useState<EmbedCode | undefined>(undefined);
	const [embedCodesCount, setEmbedCodesCount] = useState<number>(0);
	const [isEmbedCodeModalOpen, setIsEmbedCodeModalOpen] = useState(false);
	const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

	// Set default sorting
	const [query, setQuery] = useQueryParams({
		sort_order: queryParamConfig.sort_order,
		sort_column: queryParamConfig.sort_column,
	});

	const [filters, setFilters] = useState<EmbedCodeOverviewFilterState | undefined>(undefined);
	const debouncedFilters: EmbedCodeOverviewFilterState | undefined = useDebounce(filters, 250);

	// Configuration

	const columns: FilterableColumn<EmbedCodeOverviewTableColumns>[] = [
		{
			id: 'thumbnail',
			label: '',
			sortable: false,
			visibleByDefault: true,
		},
		{
			id: 'title',
			label: tText('Titel'),
			sortable: true,
			visibleByDefault: true,
		},
		...((isMobileWidth()
			? []
			: [
					{
						id: 'createdAt',
						label: tText('Aangemaakt'),
						sortable: true,
						visibleByDefault: true,
					},
					{
						id: 'updatedAt',
						label: tText('Laatst bewerkt'),
						sortable: true,
						visibleByDefault: true,
					},
					{
						id: 'start',
						label: tText('Tijdscode'),
						sortable: true,
						visibleByDefault: true,
					},
					{
						id: 'externalWebsite',
						label: tText('Gedeeld op'),
						col: '2',
						sortable: true,
						visibleByDefault: true,
					},
			  ]) as FilterableColumn<EmbedCodeOverviewTableColumns>[]),
		{
			id: 'action',
			tooltip: tText('Acties'),
			col: '1',
			sortable: false,
			visibleByDefault: true,
		},
	];

	// Data

	const fetchEmbedCodes = useCallback(async () => {
		setLoadingInfo({ state: 'loading' });

		try {
			if (!commonUser?.profileId || debouncedFilters === undefined) {
				setLoadingInfo({
					state: 'error',
					message: tHtml(
						'er is onvoldoende informatie beschikbaar om ingesloten fragmenten op te halen'
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
				message: tHtml('het ophalen van je ingesloten fragmenten is mislukt'),
			});
		}
	}, [commonUser, setEmbedCodes, setLoadingInfo, tText, debouncedFilters]); // eslint-disable-line

	const removeEmbedCode = async (id: EmbedCode['id']) => {
		if (!commonUser?.profileId) {
			return;
		}

		try {
			// TODO EMBED: delete code by id
			await fetchEmbedCodes();

			ToastService.success(tHtml('het ingesloten fragment is verwijderd'));
		} catch (error) {
			console.error(error);

			ToastService.danger(
				tHtml('er ging iets mis bij het verwijderen van het ingesloten fragment')
			);
		}

		setIsConfirmationModalOpen(false);
		setSelected(undefined);
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
			actions={(data) => {
				const items = [
					{
						icon: IconName.edit,
						id: EmbedCodeAction.EDIT,
						label: tText('Bewerken'),
					},
					{
						icon: IconName.clipboard,
						id: EmbedCodeAction.COPY_TO_CLIPBOARD,
						label: tText('kopieer code'),
					},
					{
						icon: IconName.copy,
						id: EmbedCodeAction.DUPLICATE,
						label: tText('Dupliceren'),
					},
					{
						icon: IconName.eye,
						id: EmbedCodeAction.SHOW_ORIGINAL,
						label: tText('Origineel fragment'),
					},
					{
						icon: IconName.delete,
						id: EmbedCodeAction.DELETE,
						label: tText('verwijder'),
					},
				] as (MenuItemInfo & { id: EmbedCodeAction })[];

				return (
					data && (
						<MoreOptionsDropdown
							isOpen={data?.id === selected?.id}
							onOpen={() => setSelected(data as EmbedCode)}
							onClose={() => {
								const isAModalOpen =
									isEmbedCodeModalOpen || isConfirmationModalOpen;

								!isAModalOpen && setSelected(undefined);
							}}
							label={tText('meer acties')}
							menuItems={items}
							onOptionClicked={async (action) => {
								if (selected === undefined) {
									return;
								}
								// TODO EMBED: implement actions

								switch (action.toString() as EmbedCodeAction) {
									case EmbedCodeAction.COPY_TO_CLIPBOARD:
										setSelected(undefined);
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
								'er werden geen ingesloten fragmenten gevonden die voldoen aan de opgegeven criteria'
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
				searchTextPlaceholder={tText('Zoek op titel of beschrijving')}
				rowKey="id"
				variant="styled"
				isLoading={loadingInfo.state === 'loading'}
				hideTableColumnsButton
				showCheckboxes={false}
			/>

			<DeleteObjectModal
				title={tText('ben je zeker dat je dit ingesloten fragment wilt verwijderen')}
				body={tText('deze actie kan niet ongedaan gemaakt worden')}
				isOpen={isConfirmationModalOpen}
				onClose={() => {
					setIsConfirmationModalOpen(false);
					setSelected(undefined);
				}}
				confirmCallback={async () => selected && removeEmbedCode(selected.id)}
			/>
		</>
	);
};

export default withUser(EmbedCodeOverview) as FC<EmbedCodeOverviewProps>;
