# aws-websocket-handler

This module is created to handle AWS Lambda websocket actions as a one default handler. There are multiple benefits of doing so:
- all actions are handled by one lambda function;
- no cold start for actions, which are rarely used;
- the codebase is sharable accross all actions;

### How it works?

When you want to use WebSocket API in API Gateway, which are integrated with Lambda functions it is required to specify two mandatory routes $connect and $disconnect. The approach is presented in detail [here](https://aws.amazon.com/blogs/compute/announcing-websocket-apis-in-amazon-api-gateway/). Instead of specifing all actions as separate functions we use here a power of $default route, which is invoked every time no matching expresion is found.

#### How to use?

...
