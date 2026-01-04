import * as Yup from 'yup';

export const USER_ITEM_REQUEST_FORM_VALIDATION_SCHEMA = Yup.object().shape({
  description: Yup.string().required('De beschrijving is verplicht'),
});
