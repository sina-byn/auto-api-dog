#!/usr/bin/env node
const { program } = require('commander');
const fg = require('fast-glob');
const chalk = require('chalk');
const Joi = require('joi');
const fs = require('fs');

const extractEndpoint = require('./extract');

const optionsSchema = Joi.object({
  input: Joi.string().min(1),
  name: Joi.string().min(1),
});

program
  .name('doc')
  .description('generate api dog json doc from your code comments')
  .option('-i, --input [string]', 'glob pattern to match input files')
  .option('-n, --name [string]', 'api name')
  .action(options => {
    const { error } = optionsSchema.validate(options, { abortEarly: true });
    if (error) throw new Error(chalk.redBright(error.details[0].message));

    const { input = '**/*.js', name = 'api' } = options;
    const inputs = fg.globSync(input, { ignore: ['node_modules'] });

    if (!inputs.length) throw new Error(chalk.redBright('no files matched your pattern'));

    const commentRegex = /\/\*\*[\s\S]*?\*\//g;
    const endpoints = {
      apiCollection: [],
    };

    for (const input of inputs) {
      const source = fs.readFileSync(input, 'utf-8');
      let match;

      while ((match = commentRegex.exec(source))) {
        const endpointSource = match[0];
        const endpoint = extractEndpoint(endpointSource);

        endpoints.apiCollection.push(endpoint);
      }
    }

    if (!endpoints.apiCollection.length) {
      throw new Error(chalk.redBright('no endpoints were found'));
    }

    const filename = `${name}.apidog.json`;
    fs.writeFileSync(filename, JSON.stringify(endpoints), 'utf-8');
    console.log(chalk.greenBright(filename, 'was generated successfully =)'));
  });

program.parse(process.argv);
