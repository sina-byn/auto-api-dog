# auto-api-dog [![NPM version](https://img.shields.io/npm/v/auto-api-dog.svg?style=flat)](https://www.npmjs.com/package/auto-api-dog) [![NPM monthly downloads](https://img.shields.io/npm/dm/auto-api-dog.svg?style=flat)](https://npmjs.org/package/auto-api-dog) [![NPM total downloads](https://img.shields.io/npm/dt/auto-api-dog.svg?style=flat)](https://npmjs.org/package/auto-api-dog) 

> Easily document your REST APIs - auto-api-dog is a CLI tool that generates your [api-dog](https://apidog.com/) documentation file from your comments

Please consider following this project's author, [Sina Bayandorian](https://github.com/sina-byn), and consider starring the project to show your :heart: and support.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Format](#format)
  - [Fields](#fields)
  - [Notes ⚠️](#notes)
- [Options](#options)

## Install

Install with [npm](https://www.npmjs.com/package/auto-api-dog):

```sh
$ npm install -g auto-api-dog
```

## Usage

```json
// package.json

{
  "scripts": {
    "doc": "auto-api-dog"
  }
}
```

Then :

```sh
$ npm run doc
```

Running the command above will output `api.apidog.json` that you can import into the [api-dog](https://apidog.com/) application to have it generate your API documentation.

## Format

Below is the document comment format :

```js
/**
 * Description multi-line description
 * @name - Create A Post
 * @method POST
 * @endpoint /
 * @maintainer sina-byn
 * @status developing
 * @query {number} id the id of the post
 * 
 * @payload {object} - {
 *      "title": {
 *          "en": "this is the en title",
 *          "fa": "this is the fa title"
 *      }
 * }
 * 
 * @required {object} - {
 *      "title": {
 *         "required": true,
 *         "value": {
 *              "en": { "required": true },
 *              "fa": { "required": true }
 *         }
 *      }
 * }
 */
```

Visit [comment parser](https://www.npmjs.com/package/comment-parser), and [JSDoc](https://jsdoc.app/) to read more about the documentation comments.

Note that if you use [VS Code](https://code.visualstudio.com/) as your text editor it helps you with the asterisks.


### Fields

Below is the table of all the fields that are defined for the cli. Make sure to read the [notes](#notes) below the table.

| Name       | Type   | Default             | Description                                                         |
|------------|--------|---------------------|---------------------------------------------------------------------|
| name       | string | "Untitled Endpoint" | the name of the API endpoint - [special syntax](#name-syntax)                       |
| method     | string |                     | API endpoint's method - must be all in uppercase letters - required |
| status     | string | "released"          | API dog status - visit [api dog](https://apidog.com/) for more      |
| maintainer | string |                     | the maintainer id from the [api dog](https://apidog.com/) project                          |
| query      | [Param](#param-type)  |                     | defines a single query parameter                                    |
| header     | [Param](#param-type)  |                     | defines a single request header                                     |
| cookie     | [Param](#param-type)  |                     | defines a single request cookie                                     |
| payload    | JSON object |                     | defines the example payload for the request - [important](#req-body)           |
| required   | JSON object |                     | defines the required fields of the payload - [important](#req-body)        |

### Notes 

- <div id="name-syntax"></div>due to the [JSDoc](https://jsdoc.app/) convention the name should follow `@name - {endpoint_name}` the `-` is required or the first word of the name will be ignored

- <div id="req-body"></div>`payload` and `required`

  - defining the `required` without the `payload` will result in an error

  - `payload` is optional and is used to create a JSON schema and a sample request body

  - the `required` field optional and is used to define the required fields of the JSON schema

  - Note that generating the request body and JSON schema is a complex task, and the developer is responsible for ensuring accuracy and that the types match. For example, in some cases where `payload` and `required` do not match, you might end up with an error; in other cases, your schema might simply not include all the required fields.

- <div id="param-type"></div>the `Param` type is a special type

```js
{
  type: "string",
  name: "post_slug",
  description: "desc",
  required: true,
  example: "first_post",
}
```

Note that support for complex data types for the `Param` type is yet to be added.

**Example**

```js
/**
 * @header {number} id the id of the post
 */
```

is equal to

```
{
  type: "number",
  name: "id",
  description: "desc",
  required: true,
}
```

`[id]` : `{ required: false }`
`[id=12]` : `{ required: false, example: 12 }`
`[!id=12]` : `{ required: true, example: 12 }`

Note that `!` only works when an example is provided otherwise it will be included in the name of the param.

## Options

| Name        | Type   | Default   | Description                                                   |
|-------------|--------|-----------|---------------------------------------------------------------|
| -i, --input | string | "\*\*/\*.js" | glob pattern to match input files that have document comments |
| -n, --name  | string | "api"     | output json file name - {name}.apidog.json                    |
