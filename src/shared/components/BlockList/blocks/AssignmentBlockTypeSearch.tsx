import {
	BlockHeading,
	Button,
	convertToHtml,
	DefaultProps,
	Flex,
	Spacer,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import classnames from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import searchBlockImage from '../../../../assets/images/assignment-search-block.png';
import CollectionFragmentRichText from '../../../../collection/components/CollectionFragmentRichText';
import { CollapsibleColumn } from '../../index';

import './AssignmentBlockTypeSearch.scss';

export interface AssignmentBlockTypeSearchProps extends DefaultProps {
	block: Avo.Core.BlockItemBase;
	showCollectionButton: boolean;
	onSearchButtonClicked: () => void;
	onCollectionButtonClicked: () => void;
}

const AssignmentBlockTypeSearch: FC<AssignmentBlockTypeSearchProps> = ({
	block,
	showCollectionButton,
	onCollectionButtonClicked,
	onSearchButtonClicked,
	className,
}) => {
	const [t] = useTranslation();

	return (
		<>
			<CollapsibleColumn
				className={classnames(className, 'c-assignment-block-type-search')}
				enableScrollable={false}
				grow={
					<Flex orientation="vertical">
						<BlockHeading type="h2">
							{t(
								'shared/components/block-list/blocks/assignment-block-type-search___zoekoefening'
							)}
						</BlockHeading>
						<CollectionFragmentRichText
							content={convertToHtml(block.custom_description || '')}
						/>
						<Button
							type="primary"
							label={t(
								'shared/components/block-list/blocks/assignment-block-type-search___start-met-zoeken'
							)}
							onClick={onSearchButtonClicked}
						/>
						<Spacer margin="bottom-small" />
						{showCollectionButton && (
							<Button
								type="secondary"
								label={t(
									'shared/components/block-list/blocks/assignment-block-type-search___naar-mijn-collectie'
								)}
								onClick={onCollectionButtonClicked}
							/>
						)}
					</Flex>
				}
				bound={
					<img
						src={searchBlockImage}
						alt={t(
							'shared/components/block-list/blocks/assignment-block-type-search___user-typing-on-keyboard'
						)}
					/>
				}
			/>
		</>
	);
};

export default AssignmentBlockTypeSearch;
