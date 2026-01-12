import { isBoolean, isNil, isString } from 'es-toolkit';
import { get } from 'es-toolkit/compat';
import { type ReactElement, type ReactNode } from 'react';
import { Html } from '../../../shared/components/Html/Html';
import { formatDate } from '../../../shared/helpers/formatters/date';
import { tText } from '../../../shared/helpers/translate-text';

export function renderDetailRow(value: ReactNode, label: string): ReactElement {
  return (
    <tr key={`detail-row_${label}`}>
      <th>{label}</th>
      {isString(value) && (
        <td>
          <Html content={value} />
        </td>
      )}
      {!isString(value) && <td>{value}</td>}
    </tr>
  );
}

export function renderSimpleDetailRows(
  obj: any,
  propAndTranslations: [string, string][],
): ReactElement[] {
  return propAndTranslations.map((propAndTranslation) => {
    const prop = propAndTranslation?.[0];
    const label = propAndTranslation[1];
    let value = get(obj, prop);
    if (isBoolean(value)) {
      value = value
        ? tText('admin/shared/helpers/render-detail-fields___ja')
        : tText('admin/shared/helpers/render-detail-fields___nee');
    }
    return renderDetailRow(isNil(value) ? '-' : value, label);
  });
}

export function renderDateDetailRows(
  obj: any,
  propAndTranslations: [string, string][],
): ReactElement[] {
  return propAndTranslations.map((propAndTranslation) => {
    const prop = propAndTranslation?.[0];
    const label = propAndTranslation[1];
    const value = get(obj, prop);
    return renderDetailRow(value ? formatDate(value) : '-', label);
  });
}
