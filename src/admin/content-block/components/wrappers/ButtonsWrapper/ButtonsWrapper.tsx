import { BlockButtons, BlockButtonsProps } from '@viaa/avo2-components';
import { get } from 'lodash-es';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

const ButtonsWrapper: FunctionComponent<BlockButtonsProps> = (props) => {
	const [t] = useTranslation();

	// Add tooltips for download buttons
	const elements = props.elements;
	elements.forEach((element) => {
		if (get(element, 'buttonAction.type') === 'FILE') {
			element.tooltip = t(
				'admin/content-block/components/wrappers/buttons-wrapper/buttons-wrapper___gebruik-rechtermuisknop-en-kies-save-om-het-bestand-te-downloaden'
			);
		}
	});

	return <BlockButtons {...props} elements={elements} />;
};

export default ButtonsWrapper;
