import { AvoCoreContentType } from '@viaa/avo2-types';
import { type ReactNode } from 'react';
import { type NavigateFunction } from 'react-router';
import { Link } from 'react-router-dom';
import { generateContentLinkString } from './link';

export const defaultGoToDetailLink =
  (navigate: NavigateFunction) =>
  (id: string, type: AvoCoreContentType): void => {
    navigate(generateContentLinkString(type, id));
  };

export const defaultRenderDetailLink = (
  linkText: string | ReactNode,
  id: string,
  type: AvoCoreContentType,
): ReactNode => {
  return (
    <Link
      className="c-button--relative-link"
      to={generateContentLinkString(type, id)}
      onClick={() => scrollTo({ top: 0 })}
    >
      {linkText}
    </Link>
  );
};
