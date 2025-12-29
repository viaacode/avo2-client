import { FilterTable } from '@meemoo/admin-core-ui/admin';
import {
  IconName,
  type MenuItemInfo,
  MoreOptionsDropdown,
} from '@viaa/avo2-components';

import {
  AvoItemItem,
  AvoSearchOrderDirection,
  AvoUserCommonUser,
} from '@viaa/avo2-types';
import { isEqual } from 'es-toolkit';
import { useAtomValue } from 'jotai';
import { type FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { commonUserAtom } from '../../authentication/authentication.store';
import { APP_PATH } from '../../constants';
import { ConfirmModal } from '../../shared/components/ConfirmModal/ConfirmModal';
import { copyToClipboard } from '../../shared/helpers/clipboard';
import { CustomError } from '../../shared/helpers/custom-error';
import { navigate } from '../../shared/helpers/link';
import {
  StringParam,
  useQueryParams,
} from '../../shared/helpers/routing/use-query-params-ssr';
import { tHtml } from '../../shared/helpers/translate-html';
import { tText } from '../../shared/helpers/translate-text';
import { useDebounce } from '../../shared/hooks/useDebounce';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ToastService } from '../../shared/services/toast-service';
import { ITEMS_PER_PAGE } from '../../workspace/workspace.const';
import { OVERVIEW_COLUMNS } from '../embed-code.const';
import {
  EMBED_CODE_DEFAULTS,
  type EmbedCode,
  type EmbedCodeOverviewFilterState,
  type EmbedCodeOverviewTableColumns,
} from '../embed-code.types';
import { EmbedCodeService } from '../embed-code-service';
import { toEmbedCodeIFrame } from '../helpers/links';
import { createResource } from '../helpers/resourceForTrackEvents';
import { useCreateEmbedCode } from '../hooks/useCreateEmbedCode';
import { useDeleteEmbedCode } from '../hooks/useDeleteEmbedCode';
import { useGetEmbedCodes } from '../hooks/useGetEmbedCodes.ts';
import { useUpdateEmbedCode } from '../hooks/useUpdateEmbedCode';
import { EmbedCodeFilterTableCell } from './EmbedCodeFilterTableCell';
import { EditEmbedCodeModal } from './modals/EditEmbedCodeModal';

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

export const EmbedCodeOverview: FC<EmbedCodeOverviewProps> = ({ onUpdate }) => {
  const navigateFunc = useNavigate();
  const commonUser = useAtomValue(commonUserAtom);

  // State
  const [selected, setSelected] = useState<Partial<EmbedCode> | undefined>(
    undefined,
  );
  const [embedCodeForEditModal, setEmbedCodeForEditModal] = useState<
    Partial<EmbedCode> | undefined
  >(undefined);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  // Set default sorting
  const [query, setQuery] = useQueryParams({
    sort_order: StringParam,
    sort_column: StringParam,
  });

  const [filters, setFilters] = useState<
    EmbedCodeOverviewFilterState | undefined
  >(undefined);
  const debouncedFilters: EmbedCodeOverviewFilterState | undefined =
    useDebounce(filters, 250);
  const columns = OVERVIEW_COLUMNS();

  const { mutateAsync: duplicateEmbedCode } = useCreateEmbedCode();
  const { mutateAsync: deleteEmbedCode } = useDeleteEmbedCode();
  const { mutateAsync: updateEmbedCode } = useUpdateEmbedCode();

  const {
    data: embedCodesResponse,
    isLoading: isLoadingEmbedCodes,
    refetch: refetchEmbedCodes,
  } = useGetEmbedCodes({
    filterString: debouncedFilters?.query,
    sortOrder: (debouncedFilters?.sort_order ||
      query.sort_order ||
      EMBED_CODE_DEFAULTS.sort_order) as AvoSearchOrderDirection,
    sortColumn:
      debouncedFilters?.sort_column ||
      query.sort_column ||
      EMBED_CODE_DEFAULTS.sort_column,
    limit: ITEMS_PER_PAGE,
    offset: (debouncedFilters?.page || 0) * ITEMS_PER_PAGE,
  });
  const embedCodes = embedCodesResponse?.embedCodes || [];
  const embedCodesCount = embedCodesResponse?.count || 0;

  // Data

  const reloadEmbedCodes = async () => {
    await refetchEmbedCodes();
    onUpdate?.();
  };

  const duplicateSelectedEmbedCode = async (selected: Partial<EmbedCode>) => {
    try {
      await duplicateEmbedCode({
        title: selected.title,
        contentType: selected.contentType,
        contentId: (selected.content as AvoItemItem).external_id,
        descriptionType: selected.descriptionType,
        description: selected.description,
        start: selected.start,
        end: selected.end,
        externalWebsite: selected.externalWebsite,
      } as EmbedCode);

      ToastService.success(
        tHtml(
          'embed-code/components/embed-code-overview___het-fragment-werd-succesvol-gedupliceerd',
        ),
      );

      setSelected(undefined);
      await reloadEmbedCodes();
    } catch (err) {
      console.error(err);
      ToastService.danger(
        tText(
          'embed-code/components/embed-code-overview___fragment-dupliceren-mislukt',
        ),
      );
    }
  };

  const changeEmbedCode = async (data: EmbedCode) => {
    try {
      await updateEmbedCode(data);
      ToastService.success(
        tText(
          'embed-code/components/embed-code-overview___fragment-succesvol-gewijzigd',
        ),
      );

      await reloadEmbedCodes();

      setEmbedCodeForEditModal(undefined);
    } catch (err) {
      console.error(err);
      ToastService.danger(
        tText(
          'embed-code/components/embed-code-overview___fragment-wijzigen-mislukt',
        ),
      );
    }
  };

  const removeEmbedCode = async (id: EmbedCode['id']) => {
    try {
      await deleteEmbedCode(id);
      ToastService.success(
        tHtml(
          'embed-code/components/embed-code-overview___het-ingesloten-fragment-is-verwijderd',
        ),
      );
    } catch (error) {
      console.error(error);

      ToastService.danger(
        tHtml(
          'embed-code/components/embed-code-overview___er-ging-iets-mis-bij-het-verwijderen-van-het-ingesloten-fragment',
        ),
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
            label: tText(
              'embed-code/components/embed-code-overview___bewerken',
            ),
          },
          {
            icon: IconName.clipboard,
            id: EmbedCodeAction.COPY_TO_CLIPBOARD,
            label: tText(
              'embed-code/components/embed-code-overview___kopieer-code',
            ),
          },
          {
            icon: IconName.copy,
            id: EmbedCodeAction.DUPLICATE,
            label: tText(
              'embed-code/components/embed-code-overview___dupliceren',
            ),
          },
          {
            icon: IconName.eye,
            id: EmbedCodeAction.SHOW_ORIGINAL,
            label: tText(
              'embed-code/components/embed-code-overview___origineel-fragment',
            ),
          },
          {
            icon: IconName.delete,
            id: EmbedCodeAction.DELETE,
            label: tText(
              'embed-code/components/embed-code-overview___verwijder',
            ),
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
              label={tText(
                'embed-code/components/embed-code-overview___meer-acties',
              )}
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
                          { selected },
                        ),
                      );
                      ToastService.danger(
                        tHtml(
                          'embed-code/components/embed-code-overview___er-ging-iets-mis-bij-het-kopieren-van-de-code',
                        ),
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
                            commonUser as AvoUserCommonUser,
                          ),
                          pageUrl: window.location.href,
                        },
                      },
                      commonUser,
                    );
                    copyToClipboard(toEmbedCodeIFrame(selected?.id));
                    ToastService.success(
                      tHtml(
                        'embed-code/components/embed-code-overview___de-code-werd-succesvol-gekopieerd',
                      ),
                    );
                    setSelected(undefined);
                    break;

                  case EmbedCodeAction.DUPLICATE:
                    await duplicateSelectedEmbedCode(selected);
                    break;

                  case EmbedCodeAction.SHOW_ORIGINAL:
                    navigate(navigateFunc, APP_PATH.ITEM_DETAIL.route, {
                      id: (selected.content as AvoItemItem).external_id,
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
          isLoadingEmbedCodes
            ? tText(
                'embed-code/components/embed-code-overview___er-werden-geen-ingesloten-fragmenten-gevonden-die-voldoen-aan-de-opgegeven-criteria',
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
          'embed-code/components/embed-code-overview___zoek-op-titel-of-beschrijving',
        )}
        rowKey="id"
        variant="styled"
        isLoading={isLoadingEmbedCodes}
        showColumnsVisibility={false}
        showCheckboxes={false}
      />

      <EditEmbedCodeModal
        isOpen={!!embedCodeForEditModal}
        embedCode={embedCodeForEditModal as EmbedCode}
        onClose={() => setEmbedCodeForEditModal(undefined)}
        handleUpdate={changeEmbedCode}
      />

      <ConfirmModal
        title={tText(
          'embed-code/components/embed-code-overview___fragment-verwijderen',
        )}
        body={tText(
          'embed-code/components/embed-code-overview___opgelet-ben-je-zeker-dat-je-het-fragment-wil-verwijderen-het-zal-dan-niet-meer-werken-in-smartschool-en-book-widgets',
        )}
        isOpen={isConfirmationModalOpen}
        size="medium"
        onClose={() => {
          setIsConfirmationModalOpen(false);
          setSelected(undefined);
        }}
        confirmCallback={async () =>
          selected?.id && removeEmbedCode(selected.id)
        }
      />
    </>
  );
};
