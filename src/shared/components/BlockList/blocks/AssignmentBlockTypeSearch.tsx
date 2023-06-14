import { BlockHeading } from '@meemoo/admin-core-ui';
import { Button, convertToHtml, DefaultProps, Flex, Spacer } from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import classnames from 'classnames';
import React, { FC } from 'react';

import { ReactComponent as NewPartSvg } from '../../../../assets/images/nieuw-onderdeel.svg';
import { CollectionFragmentRichText } from '../../../../collection/components';
import useTranslation from '../../../../shared/hooks/useTranslation';

import './AssignmentBlockTypeSearch.scss';

export interface AssignmentBlockTypeSearchProps extends DefaultProps {
	block: Avo.Core.BlockItemBase;
	showCollectionButton: boolean;
	pastDeadline: boolean;
	onSearchButtonClicked: () => void;
	onCollectionButtonClicked: () => void;
}

const AssignmentBlockTypeSearch: FC<AssignmentBlockTypeSearchProps> = ({
	block,
	showCollectionButton,
	onCollectionButtonClicked,
	onSearchButtonClicked,
	pastDeadline,
	className,
}) => {
	const { tText, tHtml } = useTranslation();

	return (
		<div className={classnames('c-assignment-block-type-search', className)}>
			<Flex orientation="vertical">
				<BlockHeading type="h2">
					{tHtml(
						'shared/components/block-list/blocks/assignment-block-type-search___zoekoefening'
					)}
				</BlockHeading>
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
