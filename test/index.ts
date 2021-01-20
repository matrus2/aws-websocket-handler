import { Configuration, websocketHandler } from "../src";
import { expect } from "chai";
import { SinonStub, stub } from 'sinon'

describe('websocketHandler', () => {
    it('one action', async () => {
        const actionName = 'test'
        const expected = { statusCode: 200, body: 'resolved' }
        const simpleConfig: Configuration = {
            actions: [{
                name: actionName, handler: async () => {
                    return expected
                }
            }],
        }
        const handler = async () =>
            websocketHandler(<any>{
                body: JSON.stringify({ action: actionName })
            }, <any>{}, simpleConfig);
        const result = await handler();
        expect(result).to.eql(expected)
    })
    it('pass runData from middleware to action', async () => {
        const actionName = 'test'
        const expected = { statusCode: 200, body: { test: 'test' } }

        const simpleConfig: Configuration = {
            actions: [{
                name: actionName, handler: async (_event, _context, runData) => {
                    return { statusCode: 200, body: runData }
                }
            }],
            middlewares: [() => {
                return Promise.resolve({ test: 'test' })
            }]
        }
        const handler = async () =>
            websocketHandler(<any>{
                body: JSON.stringify({ action: actionName })
            }, <any>{}, simpleConfig);
        const result = await handler();
        expect(result).to.eql(expected)
    })
    it('pass runData from middlewares to action', async () => {
        const actionName = 'test'
        const expected = { statusCode: 200, body: { test1: 'test', test2: 'test' } }

        const simpleConfig: Configuration = {
            actions: [{
                name: actionName, handler: async (_event, _context, runData) => {
                    return { statusCode: 200, body: runData }
                }
            }],
            middlewares: [() => {
                return Promise.resolve({ test1: 'test' })
            }, (_event, _context, runData) => {
                return Promise.resolve({ test2: 'test', ...runData })
            }]
        }
        const handler = async () =>
            websocketHandler(<any>{
                body: JSON.stringify({ action: actionName })
            }, <any>{}, simpleConfig);
        const result = await handler();
        expect(result).to.eql(expected)
    })
    it('there is only fallback', async () => {
        const actionName = 'test'
        const expected = { statusCode: 200, body: 'test' }

        const simpleConfig: Configuration = {
            fallback: async () => {
                return { statusCode: 200, body: 'test' }
            }
        }
        const handler = async () =>
            websocketHandler(<any>{
                body: JSON.stringify({ action: actionName })
            }, <any>{}, simpleConfig);
        const result = await handler();
        expect(result).to.eql(expected)
    })
    it('action doesn\'t match there is only fallback', async () => {
        const actionName = 'test'
        const expected = { statusCode: 200, body: 'fallback' }

        const simpleConfig: Configuration = {
            actions: [{
                name: 'different', handler: async () => {
                    return { statusCode: 200, body: 'action' }
                }
            }],
            fallback: async () => {
                return { statusCode: 200, body: 'fallback' }
            }
        }
        const handler = async () =>
            websocketHandler(<any>{
                body: JSON.stringify({ action: actionName })
            }, <any>{}, simpleConfig);
        const result = await handler();
        expect(result).to.eql(expected)
    })
    it('no action no fallback', async () => {
        const actionName = 'test'
        const expected = { statusCode: 400, body: 'No action specified' }

        const simpleConfig: Configuration = {}
        const handler = async () =>
            websocketHandler(<any>{
                body: JSON.stringify({ action: actionName })
            }, <any>{}, simpleConfig);
        await handler().catch(e => {
            expect(e).to.eql(expected)
        });
    })
    describe('Logging', () => {
        let consoleStub: SinonStub;
        beforeEach(() => {
            consoleStub = stub(console, 'log');
        })
        afterEach(() => {
            consoleStub.restore()
        })

        it('Log action name', async () => {
            const actionName = 'test'
            const simpleConfig: Configuration = {
                actions: [{
                    name: actionName, handler: async () => {
                        return { statusCode: 200, body: 'resolved' }
                    }
                }],
                enableLogging: true
            }
            await websocketHandler(<any>{
                body: JSON.stringify({ action: actionName })
            }, <any>{}, simpleConfig);
            expect(consoleStub.callCount).to.eql(1)
            expect(consoleStub.calledOnceWith(`Executing action ${actionName}`)).to.eql(true)
        })
        it('Log if fallback', async () => {
            const actionName = 'test'
            const simpleConfig: Configuration = {
                fallback: async () => {
                    return { statusCode: 200, body: 'fallback' }
                },
                enableLogging: true
            }
            await websocketHandler(<any>{
                body: JSON.stringify({ action: actionName })
            }, <any>{}, simpleConfig);
            expect(consoleStub.callCount).to.eql(1)
            expect(consoleStub.calledOnceWith(`Executing fallback as there were no ${actionName}`)).to.eql(true)
        })
        it('No log when no set', async () => {
            const actionName = 'test'
            const simpleConfig: Configuration = {
                actions: [{
                    name: actionName, handler: async () => {
                        return { statusCode: 200, body: 'resolved' }
                    }
                }],
            }
            await websocketHandler(<any>{
                body: JSON.stringify({ action: actionName })
            }, <any>{}, simpleConfig);
            expect(consoleStub.callCount).to.eql(0)
        })
    })
});
