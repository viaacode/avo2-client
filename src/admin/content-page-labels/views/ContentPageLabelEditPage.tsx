import { PermissionName } from '@viaa/avo2-types';
import { type FC, lazy, Suspense } from 'react';
import { useMatch, useNavigate } from 'react-router';

import { PermissionGuard } from '../../../authentication/components/PermissionGuard';
import { FullPageSpinner } from '../../../shared/components/FullPageSpinner/FullPageSpinner';
import { buildLink } from '../../../shared/helpers/build-link';
import { goBrowserBackWithFallback } from '../../../shared/helpers/go-browser-back-with-fallback';
import { ADMIN_PATH } from '../../admin.const';
import { CONTENT_PAGE_LABEL_PATH } from '../content-page-label.routes.ts';

const ContentPageLabelEdit = lazy(() =>
  import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
    default: adminCoreModule.ContentPageLabelEdit,
  })),
);

const ContentPageLabelEditPage: FC = () => {
  const navigateFunc = useNavigate();
  const matchContentPageLabelCreate = useMatch<'id', string>(
    CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_CREATE,
  );
  const matchContentPageLabelEdit = useMatch<'id', string>(
    CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_EDIT,
  );
  const match = matchContentPageLabelCreate || matchContentPageLabelEdit;

  const contentPageLabelId = match?.params.id;

  return (
    <Suspense fallback={<FullPageSpinner />}>
      <PermissionGuard permissions={[PermissionName.EDIT_CONTENT_PAGE_LABELS]}>
        <ContentPageLabelEdit
          className="c-admin-core c-admin__content-page-label-edit"
          contentPageLabelId={contentPageLabelId}
          onGoBack={() =>
            goBrowserBackWithFallback(
              buildLink(ADMIN_PATH.CONTENT_PAGE_DETAIL, {
                id: contentPageLabelId,
              }),
              navigateFunc,
            )
          }
        />
      </PermissionGuard>
    </Suspense>
  );
};

export default ContentPageLabelEditPage;
