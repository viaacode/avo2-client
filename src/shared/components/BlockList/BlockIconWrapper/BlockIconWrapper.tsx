import { Container, Icon } from '@viaa/avo2-components';
import { AvoCoreBlockItemType, AvoCoreContentTypeId } from '@viaa/avo2-types';
import { type FC, type ReactNode } from 'react';
import { BLOCK_TYPE_TO_ICON_NAME } from './BlockIconWrapper.consts';
import { getBlockType } from './BlockIconWrapper.helpers';
import './BlockIconWrapper.scss';

interface BlockIconWrapperProps {
  backgroundColor?: string;
  key: string | number; // Needs to be defined where you use the component
  type: AvoCoreBlockItemType;
  typeId?: AvoCoreContentTypeId;
  children: ReactNode;
}

export const BlockIconWrapper: FC<BlockIconWrapperProps> = ({
  backgroundColor = '#fff',
  type,
  typeId,
  children,
}) => {
  return (
    <div
      className="u-p-0 c-block-list__item"
      style={{ backgroundColor, '--block-background': backgroundColor }}
    >
      <Container mode="horizontal">
        <div className="u-padding-top-l u-padding-bottom-l">
          <div className="c-icon-bar">
            <div className="c-icon-bar__sidebar">
              <Icon
                name={BLOCK_TYPE_TO_ICON_NAME[getBlockType(type, typeId)]}
              />
            </div>
            <div className="c-icon-bar__content">{children}</div>
          </div>
        </div>
      </Container>
    </div>
  );
};
