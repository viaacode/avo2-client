import { DutchContentType, Flex, FlexItem, Spacer, Thumbnail } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { get } from 'lodash-es';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { CONTENT_LABEL_TO_ROUTE_PARTS } from '../../../assignment/assignment.const';
import { toEnglishContentType } from '../../../collection/collection.types';

type ParentType = Pick<Avo.Assignment.Assignment, 'content_label' | 'content_id'>; // TODO switch to assignments v2
type ContentType = Avo.Assignment.Content | null;

export interface ContentLinkProps {
	parent: ParentType;
	content: ContentType;
}

export const ContentLink: FunctionComponent<ContentLinkProps> = ({ parent, content }) => {
	const [t] = useTranslation();

	const dutchLabel = get(
		content,
		'type.label',
		(parent.content_label || '').toLowerCase()
	) as DutchContentType;

	const linkContent = (
		<div className="c-box c-box--padding-small">
			<Flex orientation="vertical" center>
				<Spacer margin="right">
					<Thumbnail
						className="m-content-thumbnail"
						category={toEnglishContentType(dutchLabel)}
						src={get(content, 'thumbnail_path') || undefined}
					/>
				</Spacer>
				<FlexItem>
					<div className="c-overline-plus-p">
						{!!content && <p className="c-overline">{dutchLabel}</p>}
						<p>
							{get(content, 'title') ||
								get(content, 'description') ||
								t('assignment/assignment___de-opdracht-inhoud-is-verwijderd')}
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
						parent.content_label as Avo.Assignment.ContentLabel
					]
				}/${parent.content_id}`}
			>
				{linkContent}
			</Link>
		);
	}
	return linkContent;
};
