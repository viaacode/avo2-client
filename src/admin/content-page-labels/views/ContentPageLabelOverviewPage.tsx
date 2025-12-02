import { PermissionName } from '@viaa/avo2-types'
import { type FC, lazy, Suspense } from 'react'

import { PermissionGuard } from '../../../authentication/components/PermissionGuard';
import { FullPageSpinner } from '../../../shared/components/FullPageSpinner/FullPageSpinner';

const ContentPageLabelOverview = lazy(() =>
  import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
    default: adminCoreModule.ContentPageLabelOverview,
  })),
)

const ContentPageLabelOverviewPage: FC = () => {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <PermissionGuard permissions={[PermissionName.EDIT_CONTENT_PAGE_LABELS]}>
        <ContentPageLabelOverview className="c-admin-core c-admin__content-page-label-overview" />
      </PermissionGuard>
    </Suspense>
  )
}

export default ContentPageLabelOverviewPage
