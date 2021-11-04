import { get } from 'lodash-es';
import React from 'react';
import { Link } from 'react-router-dom';

import { DutchContentType, Flex, FlexItem, Spacer, Thumbnail } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { CONTENT_LABEL_TO_ROUTE_PARTS } from '../../assignment/assignment.const';
import { getProfileId } from '../../authentication/helpers/get-profile-id';
import { toEnglishContentType } from '../../collection/collection.types';
import I18n from '../translations/i18n';

type ParentType = Pick<Avo.Assignment.Assignment, 'content_label' | 'content_id'>;
type ContentType = Avo.Assignment.Content | null;

export const renderContentLink = (
	parent: ParentType,
	content: ContentType,
	user: Avo.User.User
) => {
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
								I18n.t('assignment/assignment___de-opdracht-inhoud-is-verwijderd')}
						</p>
					</div>
				</FlexItem>
			</Flex>
		</div>
	);

	if (
		parent.content_label === 'COLLECTIE' &&
		content &&
		getProfileId(user) !== (content as Avo.Collection.Collection).owner_profile_id
	) {
		// During create we do not allow linking to the collection if you do not own the collection,
		// since we still need to make a copy when the user clicks on "save assignment" button
		return (
			<div
				title={I18n.t(
					'assignment/views/assignment-edit___u-kan-pas-doorklikken-naar-de-collectie-nadat-u-de-opdracht-hebt-aangemaakt'
				)}
			>
				{linkContent}
			</div>
		);
	}

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

export default renderContentLink;
