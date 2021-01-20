import { APIGatewayProxyEvent, Context, APIGatewayProxyResult, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

export const websocketHandler = async (
    event: APIGatewayProxyEvent,
    context: Context,
    config: Configuration
): Promise<APIGatewayProxyResult | APIGatewayProxyStructuredResultV2> => {
    const { action } = JSON.parse(<string>event.body);
    let runData = {};
    if (config.middlewares) {
        for (const configMW of config.middlewares) {
            runData = await configMW(event, context, runData);
        }
    }

    let handler;
    if (config.actions) {
        for (const configAction of config.actions) {
            if (configAction.name === action) {
                !config.enableLogging || console.log(`Executing action ${action}`);
                handler = configAction.handler(event, context, runData);
            }
        }
    }
    if (!handler && config.fallback) {
        !config.enableLogging || console.log(`Executing fallback as there were no ${action}`);
        handler = config.fallback(event, context, runData);
    }
    if (!handler) {
        handler = Promise.reject({ statusCode: 400, body: 'No action specified' });
    }
    return handler;
};

export interface Configuration {
    actions?: ActionsHandlers[];
    middlewares?: Array<(event?: APIGatewayProxyEvent, context?: Context, runData?: any) => Promise<any>>;
    fallback?: handlerFn;
    enableLogging?: boolean;
}

export interface ActionsHandlers {
    name: string;
    handler: handlerFn;
}

type handlerFn = (
    event?: APIGatewayProxyEvent,
    context?: Context,
    runData?: any
) => Promise<APIGatewayProxyResult | APIGatewayProxyStructuredResultV2>;
