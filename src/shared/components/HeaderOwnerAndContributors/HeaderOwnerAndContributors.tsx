import {
	Avatar,
	Flex,
	Spacer,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { isEmpty, isNil, join } from 'lodash-es';
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
		if (!isEmpty(contributors) && !isNil(contributors)) {
			console.log(contributors);
			if (contributors.length === 1) {
				return <span>en {getFullName(contributors[0].profile, false, false)}</span>;
			}

			return (
				<Tooltip position="right">
					<TooltipTrigger>
						<p>
							en
							<span className="c-contributors">
								{tHtml(' {{count}} anderen', { count: contributors.length })}
							</span>
						</p>
					</TooltipTrigger>

					<TooltipContent>
						<p>
							{join(
								contributors.map((contributor) => {
									return getFullName(contributor.profile, false, false);
								}),
								', '
							)}
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
					/>
				)}

				<Spacer margin={'left-small'}>
					<p>
						{isOwner ? (
							<>
								{tHtml('Ik')} {renderContributors()}
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