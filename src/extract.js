const { parse } = require('comment-parser');
const toJsonSchema = require('to-json-schema');

const { validateEndpoint } = require('./validators');

const get = (field, tags) => (tags.find(t => t.tag === field) ?? {}).name;

const params = (tagType, tags) => {
  const fieldsMap = [['type'], ['name'], ['description'], ['required'], ['example', 'default']];
  const defaults = { enable: true };

  const queries = tags.reduce((queries, t) => {
    if (t.tag !== tagType) return queries;
    t.required = !t.optional;

    const query = {};

    for (const [key, mappedTo] of fieldsMap) {
      if ((mappedTo ?? key) in t) query[key] = t[mappedTo ?? key];
    }

    if (query.example) {
      if (query.name.startsWith('!')) {
        query.name = query.name.slice(1);
        query.required = true;
      }

      if (query.type === 'number') query.example = +query.example;
    }

    if (Object.keys(query).length > 0) queries.push({ ...query, ...defaults });

    return queries;
  }, []);

  return queries;
};

const schemaRequired = required => {
  if (!required) return;
  required = typeof required === 'string' ? JSON.parse(required) : required;
  const requiredFields = [];

  for (const [requiredField, fieldConfig] of Object.entries(required)) {
    if (fieldConfig.required) requiredFields.push(requiredField);

    if (typeof fieldConfig.value === 'object' && !Array.isArray(fieldConfig.value)) {
      requiredFields.push(schemaRequired(fieldConfig.value));
    }
  }

  return requiredFields;
};

const insertRequired = (schema, required) => {
  if (!schema || !required.length) return schema;

  schema = {
    ...schema,
    required: required.filter(r => typeof r !== 'object'),
    properties: insertRequired(
      schema.properties,
      required.filter(r => typeof r !== 'string').flat(1)
    ),
  };

  return schema;
};

const extractEndpoint = comment => {
  const parsedComment = parse(comment)[0];
  const description = parsedComment.description;
  const tags = parsedComment.tags;

  const name = (tags.find(t => t.tag === 'name') ?? {}).description || 'Untitled Endpoint';
  const method = get('method', tags);
  const endpoint = get('endpoint', tags);
  const maintainer = get('maintainer', tags);
  const status = get('status', tags) ?? 'released';

  const query = params('query', tags);
  const header = params('header', tags);
  const cookie = params('cookie', tags);

  const apiEndpoint = {
    name,
    api: {
      method,
      path: endpoint,
      parameters: {
        query,
        header,
        cookie,
      },
      status,
      description,
      maintainer,
    },
  };

  const required = (tags.find(t => t.tag === 'required') ?? { description: '' }).description.trim();
  const payload = (tags.find(t => t.tag === 'payload') ?? { description: '' }).description.trim();

  if (required && !payload) throw new Error('"payload" is required if "required" is specified');

  if (payload) {
    const requiredFields = schemaRequired(required);
    const jsonSchema = toJsonSchema(JSON.parse(payload));

    apiEndpoint.api.requestBody = {
      type: 'application/json',
      jsonSchema: required ? insertRequired(jsonSchema, requiredFields) : jsonSchema,
      example: JSON.parse(payload),
    };
  }

  validateEndpoint(apiEndpoint);

  return apiEndpoint;
};

module.exports = extractEndpoint;
