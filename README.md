# aws-websocket-handler
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

This module is created to handle AWS Lambda websocket actions as a one default handler. There are multiple benefits of doing so:
- all actions are handled by one lambda function;
- no cold start for actions, which are rarely used;
- the codebase is sharable accross all actions;

### How it works?

When you want to use WebSocket API in API Gateway, which are integrated with Lambda functions it is required to specify two mandatory routes $connect and $disconnect. The approach is presented in detail [here](https://aws.amazon.com/blogs/compute/announcing-websocket-apis-in-amazon-api-gateway/). Instead of specifing all actions as separate functions we use here a power of $default route, which is invoked every time no matching expresion is found. This package use `action` parameter from payload.

#### How to use?

1. Install the package:
```
npm i aws-websocket-handler
```

2. Use in your lambda handler:

```
// Typescript
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { Configuration, websocketHandler } from 'aws-websocket-handler';
import { validateToken } from './middlewares/validateToken';
import { simpleAction } from './actions/simple';

const config: Configuration = {
    actions: [
        {
            name: 'simple',
            handler: simpleAction,
        },
    ],
    middlewares: [validateToken],
};

exports.handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<AWSLambda.APIGatewayProxyResult | AWSLambda.APIGatewayProxyStructuredResultV2> => {
    return websocketHandler(event, context, config);
};

// Javascript
const { websocketHandler } = require("aws-websocket-handler");
const { validateToken } = require("./middlewares/validateToken");
const { simpleAction } = require("./actions/simple");
const config = {
    actions: [
        {
            name: 'simple',
            handler: simpleAction,
        }
    ],
    middlewares: [validateToken],
};
exports.handler = async (event, context) => {
    return websocketHandler(event, context, config);
};

```

#### Configuration:

| Param  | Description | Required
| ------------- | ------------- | ------------- |
| actions | Array of ActionsHandlers | optional 
| middlewares  | Array of Middlewares | optional
| fallback  | Fallback promise to be invoked if no action expression is found | optional
| enableLogging  | Boolean param to enable simple logging | optional

##### ActionsHandler example

Name corresponds to `Event.body.action`, if the expression matches, the handler function is invoked. 

```
const simpleAction = async (event, context, runData) => {
    console.log(runData);
    return {};
};

```
##### Middleware example

```
const validateToken = async (event, _context, runData) => {
    const { token } = JSON.parse(event.body);
    if (!token)
        throw new Error('No token');
    let tokenData;
    try {
        tokenData = JWT.verify(token, config_1.KEY);
    }
    catch (e) {
        throw new Error(e.message);
    }
    return { ...runData, tokenData };
};

```

##### Fallback
```
const fallback = async () => {
  return { statusCode: 200, body: 'fallback' }
},
```
