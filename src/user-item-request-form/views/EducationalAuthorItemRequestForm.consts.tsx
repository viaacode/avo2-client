import * as Yup from 'yup'

export const EDUCATIONAL_AUTHOR_ITEM_REQUEST_FORM_VALIDATION_SCHEMA =
  Yup.object().shape({
    description: Yup.string().required('De vraag omschrijving is verplicht'),
    organisation: Yup.string().required('Dit uitgeverij is verplicht'),
    method: Yup.string().required('De Methode is verplicht'),
    educationLevels: Yup.array().min(1, 'Onderwijsniveau is verplicht'),
  })
