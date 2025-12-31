import type { ContentPageInfo } from '@meemoo/admin-core-ui/admin';
import { PermissionName } from '@viaa/avo2-types';
import { useAtomValue } from 'jotai';
import { type FC, lazy, Suspense, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { commonUserAtom } from '../../../authentication/authentication.store';
import { PermissionGuard } from '../../../authentication/components/PermissionGuard';
import { FullPageSpinner } from '../../../shared/components/FullPageSpinner/FullPageSpinner';
import { SeoMetadata } from '../../../shared/components/SeoMetadata/SeoMetadata.tsx';
import { goBrowserBackWithFallback } from '../../../shared/helpers/go-browser-back-with-fallback';
import { tText } from '../../../shared/helpers/translate-text';
import { ADMIN_PATH } from '../../admin.const';

const ContentPageDetail = lazy(() =>
  import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
    default: adminCoreModule.ContentPageDetail,
  })),
);

export const ContentPageDetailPage: FC = () => {
  const navigateFunc = useNavigate();
  const { id } = useParams<{ id: string }>();
  const commonUser = useAtomValue(commonUserAtom);

  const [item, setItem] = useState<ContentPageInfo | undefined>(undefined);

  return (
    <>
      {item && (
        <SeoMetadata
          title={
            (item.title,
            tText(
              'admin/content-page/views/content-page-detail-page___contentpagina-detail',
            ))
          }
          description={item.seoDescription || ''}
        />
      )}
      <Suspense
        fallback={
          <FullPageSpinner locationId="content-page-detail-page--loading" />
        }
      >
        <PermissionGuard
          permissions={[
            PermissionName.EDIT_OWN_CONTENT_PAGES,
            PermissionName.EDIT_ANY_CONTENT_PAGES,
          ]}
        >
          {!!id && (
            <ContentPageDetail
              className="c-admin-core p-content-page-detail"
              id={id}
              loaded={setItem}
              commonUser={commonUser}
              onGoBack={() =>
                goBrowserBackWithFallback(
                  ADMIN_PATH.CONTENT_PAGE_OVERVIEWS,
                  navigateFunc,
                )
              }
            />
          )}
        </PermissionGuard>
      </Suspense>
    </>
  );
};

export default ContentPageDetailPage;
