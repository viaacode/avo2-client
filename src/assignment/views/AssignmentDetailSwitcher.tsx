import { AvoAssignmentAssignment } from '@viaa/avo2-types';
import { compact } from 'es-toolkit';
import { useAtomValue } from 'jotai';
import { type FC } from 'react';
import { useLoaderData } from 'react-router';
import { SpecialUserGroupId } from '../../admin/user-groups/user-group.const';
import { commonUserAtom } from '../../authentication/authentication.store';
import { ALL_SEARCH_FILTERS } from '../../search/search.const';
import { SeoMetadata } from '../../shared/components/SeoMetadata/SeoMetadata.tsx';
import { tText } from '../../shared/helpers/translate-text.ts';
import { AssignmentDetail } from './AssignmentDetail';
import { AssignmentResponseEditPage } from './AssignmentResponseEdit/AssignmentResponseEditPage';
import './AssignmentEdit.scss';
import './AssignmentPage.scss';

export const AssignmentDetailSwitcher: FC = () => {
  const commonUser = useAtomValue(commonUserAtom);
  const loaderData = useLoaderData<{
    assignment: AvoAssignmentAssignment;
    url: string;
  }>();
  const assignmentFromLoader = loaderData?.assignment;

  if (
    [SpecialUserGroupId.PupilSecondary, SpecialUserGroupId.PupilElementary]
      .map(String)
      .includes(String(commonUser?.userGroup?.id))
  ) {
    // Render assignment response edit page
    return <AssignmentResponseEditPage />;
  }
  // Render teacher assignment detail page
  return (
    <>
      <SeoMetadata
        title={
          assignmentFromLoader?.title ||
          tText(
            'assignment/views/assignment-detail___opdracht-detail-pagina-titel',
          )
        }
        description={assignmentFromLoader?.description}
        image={assignmentFromLoader?.seo_image_path}
        url={loaderData?.url}
        updatedAt={assignmentFromLoader?.updated_at}
        publishedAt={assignmentFromLoader?.published_at}
        createdAt={assignmentFromLoader?.created_at}
        keywords={compact(
          (assignmentFromLoader?.loms || []).map((lom) => lom.lom?.label),
        )}
      />
      <AssignmentDetail
        enabledMetaData={ALL_SEARCH_FILTERS}
        initialAssignment={loaderData?.assignment}
      />
    </>
  );
};

export default AssignmentDetailSwitcher;
