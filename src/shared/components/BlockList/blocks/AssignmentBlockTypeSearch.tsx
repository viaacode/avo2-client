import './AssignmentBlockTypeSearch.scss';

import { BlockHeading } from '@meemoo/admin-core-ui/client';
import {
	Button,
	convertToHtml,
	type DefaultProps,
	Flex,
	Icon,
	IconName,
	Pill,
	Spacer,
	Toolbar,
	ToolbarLeft,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { clsx } from 'clsx';
import React, { type FC } from 'react';

// eslint-disable-next-line import/no-unresolved
import NewPartSvg from '../../../../assets/images/nieuw-onderdeel.svg?react';
import { CollectionFragmentRichText } from '../../../../collection/components/CollectionFragmentRichText.js';
import { type EducationLevelId } from '../../../helpers/lom.js';
import { tHtml } from '../../../helpers/translate-html.js';
import { tText } from '../../../helpers/translate-text.js';

import {
	GET_EDUCATION_LEVEL_DICT,
	GET_EDUCATION_LEVEL_TOOLTIP_DICT,
} from './AssignmentBlockTypeSearch.const.js';

export interface AssignmentBlockTypeSearchProps extends DefaultProps {
	block: Avo.Core.BlockItemBase;
	showCollectionButton: boolean;
	pastDeadline: boolean;
	educationLevelId?: EducationLevelId;
	onSearchButtonClicked: () => void;
	onCollectionButtonClicked: () => void;
}

export const AssignmentBlockTypeSearch: FC<AssignmentBlockTypeSearchProps> = ({
	block,
	showCollectionButton,
	onCollectionButtonClicked,
	onSearchButtonClicked,
	educationLevelId,
	pastDeadline,
	className,
}) => {
	const educationLevelLabel = educationLevelId && GET_EDUCATION_LEVEL_DICT()[educationLevelId];
	const educationLevelTooltip =
		educationLevelId && GET_EDUCATION_LEVEL_TOOLTIP_DICT()[educationLevelId];

	return (
		<div className={clsx('c-assignment-block-type-search', className)}>
			<Flex orientation="vertical">
				<Toolbar>
					<ToolbarLeft>
						<BlockHeading type="h2" className="u-spacer-right">
							{tHtml(
								'shared/components/block-list/blocks/assignment-block-type-search___zoekoefening'
							)}
						</BlockHeading>

						{educationLevelId && (
							<Tooltip position="bottom">
								<TooltipTrigger>
									<Pill>
										<Icon name={IconName.userStudent} />
										{educationLevelLabel}
									</Pill>
								</TooltipTrigger>

								<TooltipContent>
									<>{educationLevelTooltip}</>
								</TooltipContent>
							</Tooltip>
						)}
					</ToolbarLeft>
				</Toolbar>
				<CollectionFragmentRichText
					content={convertToHtml(block.custom_description || '')}
				/>
				<Button
					type="primary"
					label={tText(
						'shared/components/block-list/blocks/assignment-block-type-search___start-met-zoeken'
					)}
					onClick={() => {
						onSearchButtonClicked();
						scrollTo({ top: 0 });
					}}
					disabled={pastDeadline}
				/>
				<Spacer margin="bottom-small" />
				{showCollectionButton && (
					<Button
						type="secondary"
						label={tText(
							'shared/components/block-list/blocks/assignment-block-type-search___naar-mijn-collectie'
						)}
						onClick={() => {
							onCollectionButtonClicked();
							scrollTo({ top: 0 });
						}}
					/>
				)}
			</Flex>
			<div>
				<NewPartSvg />
			</div>
		</div>
	);
};
