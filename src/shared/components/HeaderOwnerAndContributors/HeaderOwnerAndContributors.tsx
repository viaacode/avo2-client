import {
	Avatar,
	Flex,
	Spacer,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import React, { FC, ReactNode } from 'react';

import { getFullName } from '../../helpers';
import { tHtml, tText } from '../../helpers/translate';
import { ContributorInfoRights } from '../ShareWithColleagues/ShareWithColleagues.types';

import './HeaderOwnerAndContributors.scss';

type HeaderOwnerAndContributorsProps = {
	user: Avo.User.User;
	subject: Avo.Assignment.Assignment | Avo.Collection.Collection;
};

export const HeaderOwnerAndContributors: FC<HeaderOwnerAndContributorsProps> = ({
	user,
	subject,
}) => {
	const { contributors, profile: owner } = subject;
	const isOwner = owner?.id === user?.profile?.id;
	const nonPendingContributors = (
		(contributors || []) as
			| Omit<Avo.Assignment.Contributor, 'assignment_id'>[]
			| Omit<Avo.Collection.Contributor, 'collection_id'>[]
	).filter(
		(contrib) => !!contrib.profile_id && !(contrib.rights === ContributorInfoRights.VIEWER)
	);

	const renderOwner = () => {
		const organisation = owner?.organisation?.name ? ` (${owner?.organisation?.name})` : '';

		return getFullName(owner, false, false) + organisation;
	};

	const renderContributors = (): ReactNode => {
		if (nonPendingContributors?.length) {
			const couplingWord = ` ${tText(
				'shared/components/header-owner-and-contributors/header-owner-and-contributors___en'
			)} `;
			if (nonPendingContributors.length === 1) {
				return (
					<span>
						{couplingWord}
						{getFullName(nonPendingContributors[0].profile, false, false)}
					</span>
				);
			}

			return (
				<Tooltip position="right">
					<TooltipTrigger>
						<p>
							{couplingWord}
							<span className="c-contributors">
								{tHtml(
									'shared/components/header-owner-and-contributors/header-owner-and-contributors___count-anderen',
									{ count: nonPendingContributors.length }
								)}
							</span>
						</p>
					</TooltipTrigger>

					<TooltipContent>
						<p>
							{nonPendingContributors
								.map((contributor) => {
									return getFullName(contributor.profile, false, false);
								})
								.join(', ')}
						</p>
					</TooltipContent>
				</Tooltip>
			);
		}
	};

	return (
		<Spacer margin={'top-small'}>
			<Flex center>
				{owner && (
					<Avatar
						dark
						image={owner.avatar || owner.organisation?.logo_url || undefined}
						initials={`${owner?.user?.first_name?.[0] || ''} ${
							owner?.user?.last_name?.[0] || ''
						}`}
					/>
				)}

				<Spacer margin={'left-small'}>
					<p>
						{isOwner ? (
							<>
								{tHtml(
									'shared/components/header-owner-and-contributors/header-owner-and-contributors___ik'
								)}
								{renderContributors()}
							</>
						) : (
							<>
								{renderOwner()}
								{renderContributors()}
							</>
						)}
					</p>
				</Spacer>
			</Flex>
		</Spacer>
	);
};
