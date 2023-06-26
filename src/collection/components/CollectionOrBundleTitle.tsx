import { BlockHeading } from '@meemoo/admin-core-ui';
import { ContentInput, Flex, Icon, IconName } from '@viaa/avo2-components';
import React, { FC, useMemo, useState } from 'react';

import useTranslation from '../../shared/hooks/useTranslation';

type CollectionOrBundleTitleProps = {
	title?: string;
	onChange?: (title: string) => void;
};

const CollectionLOrBundleTitle: FC<CollectionOrBundleTitleProps> = ({ title, onChange }) => {
	const { tText } = useTranslation();
	const [isActive, setIsActive] = useState<boolean>(false);

	return useMemo(
		() => (
			<Flex center className="c-inline-title-edit">
				<BlockHeading type="h2">
					<Flex align="start">
						<ContentInput
							value={title ?? undefined}
							placeholder={tText('Collection/views/Collection-create___placeholder')}
							nodeCancel={<Icon name={IconName.x} size="small" />}
							nodeSubmit={<Icon name={IconName.check} size="small" />}
							onChange={onChange}
							onOpen={() => setIsActive(true)}
							onClose={() => setIsActive(false)}
							iconEnd={() =>
								!isActive && <Icon name={IconName.edit4} size="small" subtle />
							}
						/>
					</Flex>
				</BlockHeading>
			</Flex>
		),
		[tText, title, onChange, isActive]
	);
};

export default CollectionLOrBundleTitle;
