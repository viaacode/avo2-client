import {
  Button,
  Flex,
  FlexItem,
  FormGroup,
  IconName,
  LinkTarget,
  TextInput,
} from '@viaa/avo2-components';
import {
  AvoCoreContentPickerType,
  AvoFileUploadAssetType,
} from '@viaa/avo2-types';
import { isNull } from 'es-toolkit';
import { type FC, useCallback, useEffect, useState } from 'react';
import ReactSelect from 'react-select';
import AsyncSelect from 'react-select/async';

import { FileUpload } from '../../../../shared/components/FileUpload/FileUpload';
import { CustomError } from '../../../../shared/helpers/custom-error';
import { tHtml } from '../../../../shared/helpers/translate-html';
import { tText } from '../../../../shared/helpers/translate-text';
import { ToastService } from '../../../../shared/services/toast-service';
import {
  type PickerItem,
  type PickerTypeOption,
} from '../../types/content-picker';

import {
  DEFAULT_ALLOWED_TYPES,
  GET_CONTENT_TYPES,
  REACT_SELECT_DEFAULT_OPTIONS,
} from './ContentPicker.const';
import {
  filterTypes,
  setInitialInput,
  setInitialItem,
} from './ContentPicker.helpers';
import './ContentPicker.scss';

interface ContentPickerProps {
  allowedTypes?: AvoCoreContentPickerType[];
  initialValue: PickerItem | undefined | null;
  onSelect: (value: PickerItem | null) => void;
  placeholder?: string;
  hideTypeDropdown?: boolean;
  hideTargetSwitch?: boolean;
  errors?: string | string[];
}

export const ContentPicker: FC<ContentPickerProps> = ({
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  initialValue,
  onSelect,
  placeholder,
  hideTypeDropdown = false,
  hideTargetSwitch = false,
  errors = [],
}) => {
  // filter available options for the type picker
  const typeOptions = filterTypes(
    GET_CONTENT_TYPES(),
    allowedTypes as AvoCoreContentPickerType[],
  );

  // apply initial type from `initialValue`, default to first available type
  const currentTypeObject = typeOptions.find(
    (type) => type.value === initialValue?.type,
  );
  const [selectedType, setSelectedType] = useState<
    PickerTypeOption<AvoCoreContentPickerType>
  >(currentTypeObject || typeOptions[0]);

  // available options for the item picker.
  const [itemOptions, setItemOptions] = useState<PickerItem[]>([]);

  // selected option, keep track of whether initial item from `initialValue` has been applied
  const [selectedItem, setSelectedItem] = useState<PickerItem | null>(null);
  const [hasAppliedInitialItem, setHasAppliedInitialItem] =
    useState<boolean>(false);

  // apply initial input if INPUT-based type, default to ''
  const [input, setInput] = useState<string>(
    setInitialInput(currentTypeObject, initialValue || undefined),
  );

  const [isTargetSelf, setIsTargetSelf] = useState<boolean>(
    (initialValue?.target || LinkTarget.Self) === LinkTarget.Self,
  );

  // inflate item picker
  const fetchPickerOptions = useCallback(
    async (keyword: string | null): Promise<PickerItem[]> => {
      try {
        if (!selectedType || !selectedType.fetch) {
          return []; // Search query and external link don't have a fetch function
        }
        let items: PickerItem[] = await selectedType.fetch(keyword, 20);

        if (!hasAppliedInitialItem && initialValue) {
          items = [
            {
              label: initialValue?.label || '',
              type: initialValue?.type as AvoCoreContentPickerType,
              value: initialValue?.value || '',
            },
            ...items.filter(
              (item: PickerItem) => item.label !== initialValue?.label,
            ),
          ];
        }

        setItemOptions(items);
        if (
          keyword &&
          keyword.length &&
          (items[0]?.value || null) === keyword
        ) {
          setSelectedItem(items[0] as any);
        }
        return items;
      } catch (err) {
        console.error(
          new CustomError('[Content Picker] - Failed to inflate.', err, {
            keyword,
            selectedType,
          }),
        );
        ToastService.danger(
          tHtml(
            'admin/shared/components/content-picker/content-picker___het-ophalen-van-de-opties-is-mislukt',
          ),
        );
        return [];
      }
    },
    [selectedType, hasAppliedInitialItem, initialValue],
  );

  // when selecting a type, reset `selectedItem` and retrieve new item options
  useEffect(() => {
    fetchPickerOptions(null);
  }, [fetchPickerOptions]);

  // during the first update of `itemOptions`, set the initial value of the item picker
  useEffect(() => {
    if (itemOptions.length && !hasAppliedInitialItem) {
      setInitialItem(itemOptions, initialValue || undefined);
      setSelectedItem(initialValue || null);
      setHasAppliedInitialItem(true);
    }
  }, [itemOptions, hasAppliedInitialItem, initialValue]);

  // events
  const onSelectType = async (selected: PickerTypeOption) => {
    if (selectedType !== selected) {
      const selectedOption =
        selected as PickerTypeOption<AvoCoreContentPickerType>;
      setSelectedType(selectedOption);
      setSelectedItem(null);
      propertyChanged('selectedItem', null);
    }
  };

  const onSelectItem = (selectedItem: PickerItem, event?: any) => {
    // reset `selectedItem` when clearing item picker
    if (event?.action === 'clear') {
      propertyChanged('selectedItem', null);
      setSelectedItem(null);
      return null;
    }

    const value = (selectedItem as PickerItem)?.value || null;

    // if value of selected item is `null`, throw error
    if (!value) {
      propertyChanged('value', null);
      setSelectedItem(null);
      console.error(
        new CustomError(
          '[Content Picker] - Selected item has no value.',
          null,
          {
            selectedItem,
          },
        ),
      );
      ToastService.danger(
        tHtml(
          'admin/shared/components/content-picker/content-picker___voor-deze-content-pagina-is-geen-pad-geconfigureerd',
        ),
      );
      return null;
    }

    propertyChanged('selectedItem', selectedItem);

    // update `selectedItem`
    setSelectedItem(selectedItem);
  };

  const onChangeInput = (value: string) => {
    setInput(value);
    propertyChanged('value', value);
  };

  const propertyChanged = (
    prop: 'type' | 'selectedItem' | 'value' | 'target' | 'label',
    propValue:
      | AvoCoreContentPickerType
      | PickerItem
      | string
      | number
      | null
      | LinkTarget,
  ) => {
    let newType: AvoCoreContentPickerType;
    if (prop === 'type') {
      newType = propValue as AvoCoreContentPickerType;
    } else {
      newType = selectedType.value;
    }

    let newValue: string | null;
    let newLabel: string | undefined;
    if (prop === 'value') {
      newValue = propValue as string | null;
    } else if (prop === 'selectedItem') {
      newValue = (propValue as PickerItem)?.value || null;
      newLabel = (propValue as PickerItem)?.label;
    } else if (selectedType.picker === 'TEXT_INPUT') {
      newValue = input;
    } else if (selectedType.picker === 'SELECT' && selectedItem) {
      newLabel = (selectedItem as PickerItem).label;
      newValue = (selectedItem as PickerItem).value;
    } else {
      newValue = null;
    }

    let newTarget: LinkTarget;
    if (prop === 'target') {
      newTarget = propValue as LinkTarget;
    } else if (newType === 'FILE') {
      newTarget = LinkTarget.Blank;
      newLabel = (newValue && newValue.split('/').pop()) || undefined;
    } else {
      newTarget = isTargetSelf ? LinkTarget.Self : LinkTarget.Blank;
    }

    if (isNull(newValue)) {
      onSelect(null);
    } else {
      onSelect({
        type: newType,
        value: newValue,
        target: newTarget,
        label: newLabel,
      });
    }
  };

  // render controls
  const renderTypePicker = () => {
    if (hideTypeDropdown) {
      return null;
    }
    return (
      <FlexItem shrink>
        <ReactSelect
          {...REACT_SELECT_DEFAULT_OPTIONS}
          id="content-picker-type"
          placeholder={tText(
            'admin/shared/components/content-picker/content-picker___type',
          )}
          aria-label={tText(
            'admin/shared/components/content-picker/content-picker___selecteer-een-type',
          )}
          options={typeOptions}
          onChange={(newValue: unknown) =>
            onSelectType(newValue as PickerTypeOption)
          }
          value={selectedType}
          isSearchable={false}
          isOptionDisabled={(option: PickerTypeOption) => !!option.disabled}
          noOptionsMessage={() =>
            tText(
              'admin/shared/components/content-picker/content-picker___geen-types',
            )
          }
        />
      </FlexItem>
    );
  };

  const renderItemControl = () => {
    if (!selectedType) {
      return null;
    }

    switch (selectedType.picker) {
      case 'SELECT':
        return <FlexItem>{renderItemPicker()}</FlexItem>;
      case 'TEXT_INPUT':
        return <FlexItem>{renderTextInputPicker()}</FlexItem>;
      case 'FILE_UPLOAD':
        return <FlexItem>{renderFileUploadPicker()}</FlexItem>;
      default:
        return null;
    }
  };

  const renderItemPicker = () => (
    <AsyncSelect
      {...REACT_SELECT_DEFAULT_OPTIONS}
      id="content-picker-item"
      placeholder={
        placeholder ||
        tText(
          'admin/shared/components/content-picker/content-picker___selecteer-een-item',
        )
      }
      aria-label={
        placeholder ||
        tText(
          'admin/shared/components/content-picker/content-picker___selecteer-een-item',
        )
      }
      loadOptions={fetchPickerOptions}
      onChange={(newSelectedOption: unknown) =>
        onSelectItem(newSelectedOption as PickerItem)
      }
      onFocus={() => fetchPickerOptions(null)}
      value={selectedItem}
      defaultOptions={itemOptions as any} // TODO: type
      isClearable
      noOptionsMessage={() =>
        tText(
          'admin/shared/components/content-picker/content-picker___geen-resultaten',
        )
      }
      loadingMessage={() =>
        tText('admin/shared/components/content-picker/content-picker___laden')
      }
    />
  );

  const renderTextInputPicker = () => (
    <TextInput
      value={input}
      onChange={onChangeInput}
      placeholder={selectedType.placeholder}
    />
  );

  const renderFileUploadPicker = () => {
    return (
      <FileUpload
        assetType={AvoFileUploadAssetType.CONTENT_BLOCK_FILE}
        ownerId=""
        urls={[input]}
        allowMulti={false}
        showDeleteButton
        onChange={(urls: string[]) => {
          onChangeInput(urls[0]);
        }}
        allowedTypes={[]}
      />
    );
  };

  const renderLinkTargetControl = () => {
    if (hideTargetSwitch) {
      return null;
    }

    return (
      <FlexItem shrink>
        <Button
          size="large"
          type={'borderless'}
          icon={isTargetSelf ? IconName.arrowDownCircle : IconName.externalLink}
          title={
            isTargetSelf
              ? tText(
                  'admin/shared/components/content-picker/content-picker___open-de-link-in-hetzelfde-tablad',
                )
              : tText(
                  'admin/shared/components/content-picker/content-picker___open-de-link-in-een-nieuw-tabblad',
                )
          }
          onClick={() => {
            setIsTargetSelf(!isTargetSelf);
            propertyChanged(
              'target',
              isTargetSelf ? LinkTarget.Blank : LinkTarget.Self,
            );
          }}
          disabled={
            !(selectedType.picker === 'TEXT_INPUT' ? input : selectedItem)
          }
        />
      </FlexItem>
    );
  };

  // render content picker
  return (
    <FormGroup error={errors} className="c-content-picker">
      <Flex spaced="regular">
        {renderTypePicker()}
        {renderItemControl()}
        {renderLinkTargetControl()}
      </Flex>
    </FormGroup>
  );
};
