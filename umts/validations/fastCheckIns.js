import Joi from 'joi'

const guestSchema = {
  primaryGuest: Joi.boolean().required(),
  guestId: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  gender: Joi.string().required(),
  birth: Joi.object({
    date: Joi.string().required(),
    country: Joi.string().required(),
    state: Joi.string().allow(''),
    city: Joi.string().allow(''),
  }),
  email: Joi.string()
    .email()
    .when('primaryGuest', { is: Joi.equal(true), then: Joi.required() }),
  nationality: Joi.string().required(),
  address: Joi.object({
    country: Joi.string().required(),
    state: Joi.string().allow(''),
    postalCode: Joi.string().allow(''),
    street: Joi.string().allow(''),
    city: Joi.string().allow(''),
  }).when('primaryGuest', { is: Joi.equal(true), then: Joi.required() }),
  document: Joi.object({
    type: Joi.string().required(),
    id: Joi.string().required(),
    issuingCountry: Joi.string().required(),
    issuingAuthority: Joi.string().allow(''),
    expireDate: Joi.string().required(),
  }).required(),
}

const schema = Joi.object({
  clientId: Joi.string().required(),
  domainId: Joi.string().required(),
  reservationId: Joi.string().required(),
  guests: Joi.array().items(guestSchema),
  kognitivReservation: Joi.bool().required(),
  language: Joi.string().required(),
  productId: Joi.string().required(),
})

export default schema
