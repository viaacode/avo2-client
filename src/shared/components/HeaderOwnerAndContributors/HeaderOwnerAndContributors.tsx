import {
	Avatar,
	Flex,
	Spacer,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import React, { FC, ReactNode } from 'react';

import { getFullName } from '../../helpers';
import { tHtml } from '../../helpers/translate';

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

	const renderContributors = (): ReactNode => {
		if (contributors?.length) {
			if (contributors.length === 1) {
				return <span>en {getFullName(contributors[0].profile, false, false)}</span>;
			}

			return (
				<Tooltip position="right">
					<TooltipTrigger>
						<p>
							en
							<span className="c-contributors">
								{tHtml(
									'shared/components/header-owner-and-contributors/header-owner-and-contributors___count-anderen',
									{ count: contributors.length }
								)}
							</span>
						</p>
					</TooltipTrigger>

					<TooltipContent>
						<p>
							{contributors
								.map((contributor) => {
									return getFullName(contributor.profile, false, false);
								})
								.join(', ')}
							;
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
								)}{' '}
								{renderContributors()}
							</>
						) : (
							<>
								{getFullName(owner, false, false)} {renderContributors()}
							</>
						)}
					</p>
				</Spacer>
			</Flex>
		</Spacer>
	);
};
