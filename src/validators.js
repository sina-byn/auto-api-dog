const Joi = require('joi');
const chalk = require('chalk');

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const paramSchema = Joi.object({
  type: Joi.string().min(1).required(),
  name: Joi.string().min(1).required(),
  description: Joi.string().min(1),
  required: Joi.boolean().required(),
  example: Joi.alternatives(Joi.string(), Joi.number()),
  enable: Joi.boolean(),
});

const bodySchema = Joi.object({
  type: Joi.string().valid('application/json'),
  jsonSchema: Joi.object(),
  example: Joi.object(),
});

const apiEndpointSchema = Joi.object({
  name: Joi.string().min(1),
  api: Joi.object({
    // prettier-ignore
    method: Joi.string().valid(...METHODS).required(),
    path: Joi.string().min(1).required(),
    parameters: Joi.object({
      query: Joi.array().items(paramSchema),
      header: Joi.array().items(paramSchema),
      cookie: Joi.array().items(paramSchema),
    }),
    status: Joi.string().min(1),
    description: Joi.string().min(1),
    maintainer: Joi.string().min(1),
    requestBody: Joi.alternatives().conditional('method', {
      is: Joi.string().valid(...METHODS.slice(1, 4)),
      then: bodySchema,
      otherwise: Joi.forbidden(),
    }),
  }),
});

exports.validateEndpoint = endpoint => {
  const { error } = apiEndpointSchema.validate(endpoint, { abortEarly: true });

  if (!error) return;
  throw new Error(chalk.redBright(error.details[0].message));
};
