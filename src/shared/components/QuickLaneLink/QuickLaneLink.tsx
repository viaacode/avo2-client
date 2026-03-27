import { clsx } from 'clsx';
import { type FC } from 'react';

import { generateQuickLaneHref } from '../../helpers/generate-quick-lane-href';

import './QuickLaneLink.scss';
import { Link } from 'react-router-dom';
import { getEnv } from '../../helpers/env.ts';

interface QuickLaneLinkProps {
  id: string;
  label?: string;
  short?: boolean;
}

const defaultLabel = (id: string) => {
  return `${getEnv('CLIENT_URL')}${generateQuickLaneHref(id)}`;
};

export const QuickLaneLink: FC<QuickLaneLinkProps> = ({ id, label, short }) => {
  const className = clsx({
    'c-quick-lane-link': true,
    'c-quick-lane-link--short': short === true,
  });

  const href = generateQuickLaneHref(id);

  return (
    <Link
      className={className}
      to={href}
      rel="noopener noreferrer"
      target="_blank"
      title={id}
    >
      {label ? label : defaultLabel(id)}
    </Link>
  );
};
