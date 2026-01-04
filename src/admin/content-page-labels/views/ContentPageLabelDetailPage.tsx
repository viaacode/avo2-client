import { PermissionName } from '@viaa/avo2-types';
import { type FC, lazy, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router';

import { PermissionGuard } from '../../../authentication/components/PermissionGuard';
import { FullPageSpinner } from '../../../shared/components/FullPageSpinner/FullPageSpinner';
import { goBrowserBackWithFallback } from '../../../shared/helpers/go-browser-back-with-fallback';
import { ADMIN_PATH } from '../../admin.const';

const ContentPageLabelDetail = lazy(() =>
  import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
    default: adminCoreModule.ContentPageLabelDetail,
  })),
);

export const ContentPageLabelDetailPage: FC = () => {
  const navigateFunc = useNavigate();
  const { id } = useParams<{ id: string }>();

  return (
    <Suspense
      fallback={
        <FullPageSpinner locationId="content-page-label-detail-page--loading" />
      }
    >
      <PermissionGuard permissions={[PermissionName.EDIT_CONTENT_PAGE_LABELS]}>
        {!!id && (
          <ContentPageLabelDetail
            contentPageLabelId={id}
            className="c-admin-core c-admin__content-page-label-detail"
            onGoBack={() =>
              goBrowserBackWithFallback(
                ADMIN_PATH.CONTENT_PAGE_LABEL_OVERVIEW,
                navigateFunc,
              )
            }
          />
        )}
      </PermissionGuard>
    </Suspense>
  );
};

export default ContentPageLabelDetailPage;
