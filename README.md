# NodeJS code example by EVNE


A NodeJS Code Example server built with the KOA2 framework using TypeScript.

Technologies Used:

* [KOA2](http://koajs.com/)
* [TypeScript](https://www.typescriptlang.org/)
* [Travis CLI](https://travis-ci.org/)
* [Coveralls](https://coveralls.io/)
* [Jasmine](https://jasmine.github.io/)
* [Chai](http://www.chaijs.com/)
* [Istanbul/NYC](https://github.com/istanbuljs/nyc)
* [Lodash](https://lodash.com/)
* [Nodemon](https://nodemon.io/)
* [Docker](https://www.docker.com/)
* [Swagger](https://swagger.io/)
* [Bunyahn](https://github.com/trentm/node-bunyan)
* [Koa Bunyan Logger](https://github.com/koajs/bunyan-logger/)

## Prerequisites

* Node.js (8+): recommend using [nvm](https://github.com/creationix/nvm)
* Docker (if building a docker image) https://www.docker.com/docker-mac

## Installation

First, clone this repo and `cd` into the main directory. Then:

```shell
npm install
```

## Development

During development, the `/api` folder is being watched for changes.

All changes invoke the TypeScript compiler, which restarts the app upon completion.

```shell
npm run watch
```

## Build the Server

To compile the TypeScript code and place into the `/dist` folder:

```shell
npm build
```

## Code Linter

A TypeScript linter has been added to keep code consistent among developers.

```shell
npm run lint
```

To autofix linting errors (not all errors are auto-fixable):

```shell
npm run fix
```
