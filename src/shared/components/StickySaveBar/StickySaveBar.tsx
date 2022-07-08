import { Button, Flex, FlexItem, Spacer, StickyEdgeBar } from '@viaa/avo2-components';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import './StickySaveBar.scss';
import { isMobileWidth } from '../../helpers';

export interface StickySaveBarProps {
	isVisible: boolean;
	onSave: () => void;
	onCancel: () => void;
}

export const StickySaveBar: FunctionComponent<StickySaveBarProps> = ({
	isVisible,
	onSave,
	onCancel,
}) => {
	const [t] = useTranslation();

	if (!isVisible) {
		return null;
	}
	return (
		<StickyEdgeBar className="c-sticky-save-bar">
			<Flex orientation={isMobileWidth() ? 'vertical' : 'horizontal'}>
				<FlexItem className="c-sticky-save-bar--description">
					<p>
						<strong>
							{t('assignment/views/assignment-edit___wijzigingen-opslaan')}
						</strong>
					</p>
				</FlexItem>

				<FlexItem shrink>
					{isMobileWidth() && <Spacer margin="top" />}
					<Flex>
						<Button
							label={t('assignment/views/assignment-edit___annuleer')}
							onClick={onCancel}
						/>
						<Button
							type="tertiary"
							label={t('assignment/views/assignment-edit___opslaan')}
							onClick={onSave}
						/>
					</Flex>
				</FlexItem>
			</Flex>
		</StickyEdgeBar>
	);
};
