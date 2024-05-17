import './AssignmentBlockTypeSearch.scss';

import { BlockHeading } from '@meemoo/admin-core-ui';
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
import classnames from 'classnames';
import React, { type FC } from 'react';

import { ReactComponent as NewPartSvg } from '../../../../assets/images/nieuw-onderdeel.svg';
import { CollectionFragmentRichText } from '../../../../collection/components';
import useTranslation from '../../../../shared/hooks/useTranslation';
import { type EducationLevelId } from '../../../helpers/lom';

import {
	GET_EDUCATION_LEVEL_DICT,
	GET_EDUCATION_LEVEL_TOOLTIP_DICT,
} from './AssignmentBlockTypeSearch.const';

export interface AssignmentBlockTypeSearchProps extends DefaultProps {
	block: Avo.Core.BlockItemBase;
	showCollectionButton: boolean;
	pastDeadline: boolean;
	educationLevelId?: EducationLevelId;
	onSearchButtonClicked: () => void;
	onCollectionButtonClicked: () => void;
}

const AssignmentBlockTypeSearch: FC<AssignmentBlockTypeSearchProps> = ({
	block,
	showCollectionButton,
	onCollectionButtonClicked,
	onSearchButtonClicked,
	educationLevelId,
	pastDeadline,
	className,
}) => {
	const { tText, tHtml } = useTranslation();

	const educationLevelLabel = educationLevelId && GET_EDUCATION_LEVEL_DICT()[educationLevelId];
	const educationLevelTooltip =
		educationLevelId && GET_EDUCATION_LEVEL_TOOLTIP_DICT()[educationLevelId];

	return (
		<div className={classnames('c-assignment-block-type-search', className)}>
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

export default AssignmentBlockTypeSearch;
