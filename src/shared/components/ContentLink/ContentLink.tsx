import { Flex, FlexItem, Spacer, Thumbnail } from '@viaa/avo2-components';
import {
  AvoAssignmentAssignment,
  AvoAssignmentContentLabel,
  AvoCollectionCollection,
  AvoContentTypeDutch,
  AvoItemItem,
} from '@viaa/avo2-types';
import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { CONTENT_LABEL_TO_ROUTE_PARTS } from '../../../assignment/assignment.const';
import { CONTENT_TYPE_TRANSLATIONS_NL_TO_EN } from '../../../collection/collection.types';
import { tHtml } from '../../helpers/translate-html';

type ParentType = {
  content_label: string | null;
  content_id: string;
};

interface ContentLinkProps {
  parent: ParentType;
  content: AvoAssignmentAssignment | AvoCollectionCollection | AvoItemItem;
}

export const ContentLink: FC<ContentLinkProps> = ({ parent, content }) => {
  const dutchLabel = ((content as any)?.type?.label ||
    (parent.content_label || '').toLowerCase()) as AvoContentTypeDutch;

  const linkContent = (
    <div className="c-box c-box--padding-small">
      <Flex orientation="vertical" center>
        <Spacer margin="right">
          <Thumbnail
            className="m-content-thumbnail"
            category={CONTENT_TYPE_TRANSLATIONS_NL_TO_EN[dutchLabel]}
            src={content?.thumbnail_path || undefined}
          />
        </Spacer>
        <FlexItem>
          <div className="c-overline-plus-p">
            {!!content && <p className="c-overline">{dutchLabel}</p>}
            <p>
              {content?.title ||
                content?.description ||
                tHtml(
                  'assignment/assignment___de-opdracht-inhoud-is-verwijderd',
                )}
            </p>
          </div>
        </FlexItem>
      </Flex>
    </div>
  );

  if (content) {
    return (
      <Link
        to={`/${
          CONTENT_LABEL_TO_ROUTE_PARTS[
            parent.content_label as AvoAssignmentContentLabel
          ]
        }/${parent.content_id}`}
      >
        {linkContent}
      </Link>
    );
  }
  return linkContent;
};
