import { PermissionName } from '@viaa/avo2-types';
import { useAtomValue } from 'jotai';
import { type FC, lazy, Suspense, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { commonUserAtom } from '../../../authentication/authentication.store';
import { PermissionGuard } from '../../../authentication/components/PermissionGuard';
import { BeforeUnloadPrompt } from '../../../shared/components/BeforeUnloadPrompt/BeforeUnloadPrompt';
import { FullPageSpinner } from '../../../shared/components/FullPageSpinner/FullPageSpinner';
import { buildLink } from '../../../shared/helpers/build-link';
import { goBrowserBackWithFallback } from '../../../shared/helpers/go-browser-back-with-fallback';
import { useWarningBeforeUnload } from '../../../shared/hooks/useWarningBeforeUnload';
import { ADMIN_PATH } from '../../admin.const';

const ContentPageEdit = lazy(() =>
  import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
    default: adminCoreModule.ContentPageEdit,
  })),
);

export const ContentPageEditPage: FC = () => {
  const navigateFunc = useNavigate();
  const { id: contentPageId } = useParams<{ id: string }>();

  const commonUser = useAtomValue(commonUserAtom);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  useWarningBeforeUnload({
    when: hasUnsavedChanges,
  });

  return (
    <Suspense
      fallback={
        <FullPageSpinner locationId="content-page-edit-page--loading" />
      }
    >
      <PermissionGuard
        permissions={[
          PermissionName.EDIT_OWN_CONTENT_PAGES,
          PermissionName.EDIT_ANY_CONTENT_PAGES,
        ]}
      >
        <ContentPageEdit
          className="c-admin-core c-admin__content-page-edit"
          id={contentPageId}
          commonUser={commonUser}
          onHasUnsavedChangesChanged={(state) => {
            setHasUnsavedChanges(state);
          }}
          onGoBack={() =>
            goBrowserBackWithFallback(
              buildLink(ADMIN_PATH.CONTENT_PAGE_DETAIL, { id: contentPageId }),
              navigateFunc,
            )
          }
        />
        <BeforeUnloadPrompt when={hasUnsavedChanges} />
      </PermissionGuard>
    </Suspense>
  );
};

export default ContentPageEditPage;
