import { get } from 'lodash-es';
import React, { FunctionComponent } from 'react';

import { ButtonAction, LinkTarget, Select } from '@viaa/avo2-components';

interface AnchorLinkSelectProps {
	onChange: (buttonAction: ButtonAction) => void;
	value: ButtonAction;
}

const AnchorLinkSelect: FunctionComponent<AnchorLinkSelectProps> = ({ onChange, value }) => {
	const getOptions = () => {
		const anchorIds: string[] = [];
		document.querySelectorAll('[data-anchor]').forEach(block => {
			const anchorId = block.getAttribute('data-anchor');
			if (anchorId) {
				anchorIds.push(anchorId);
			}
		});
		return anchorIds.map(anchorId => ({
			label: anchorId,
			value: anchorId,
		}));
	};
	return (
		<Select
			options={getOptions()}
			value={get(value, 'value', '').toString() || undefined}
			onChange={(anchorId: string) =>
				onChange({
					value: anchorId,
					type: 'ANCHOR_LINK',
					target: LinkTarget.Self,
				})
			}
		/>
	);
};

export default AnchorLinkSelect;
