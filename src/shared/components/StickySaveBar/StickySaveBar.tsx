import React, { type FC } from 'react';

import { tHtml } from '../../helpers/translate-html.js';
import { tText } from '../../helpers/translate-text.js';
import { StickyBar } from '../StickyBar/StickyBar.js';

interface StickySaveBarProps {
  isVisible: boolean;
  isSaving: boolean;
  onSave: (() => void) | (() => Promise<void>);
  onCancel: () => void;
}

export const StickySaveBar: FC<StickySaveBarProps> = ({
  isVisible,
  isSaving,
  onSave,
  onCancel,
}) => {
  if (!isVisible) {
    return null;
  }
  return (
    <StickyBar
      title={tHtml('assignment/views/assignment-edit___wijzigingen-opslaan')}
      isVisible={isVisible}
      actionButtonProps={{
        label: isSaving
          ? tText('shared/components/sticky-save-bar/sticky-save-bar___bezig')
          : tText('assignment/views/assignment-edit___opslaan'),
        onClick: onSave,
        type: 'tertiary',
      }}
      cancelButtonProps={{
        label: tText('assignment/views/assignment-edit___annuleer'),
        onClick: onCancel,
      }}
    />
  );
};
