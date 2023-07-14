import { EventEmitter, EventEmitterCallback } from "./EventEmitter";
/**
 * The `Listener` class represents a single event listener object. Such objects keep all relevant
 * contextual information such as the event being listened to, the object the listener was attached
 * to, the callback function and so on.
 *
 */
export declare class Listener {
    /**
     * The event name.
     * @type {string}
     */
    event: string | Symbol;
    /**
     * An array of arguments to pass to the callback function upon execution.
     * @type {array}
     */
    arguments: any[];
    /**
     * The callback function to execute.
     * @type {Function}
     */
    callback: EventEmitterCallback;
    /**
     * The context to execute the callback function in (a.k.a. the value of `this` inside the
     * callback function)
     * @type {Object}
     */
    context: any;
    /**
     * The number of times the listener function was executed.
     * @type {number}
     */
    count: number;
    /**
     * The remaining number of times after which the callback should automatically be removed.
     * @type {number}
     */
    remaining: number;
    /**
     * Whether this listener is currently suspended or not.
     * @type {boolean}
     */
    suspended: boolean;
    /**
     * The object that the event is attached to (or that emitted the event).
     * @type {EventEmitter}
     */
    target: EventEmitter;
    /**
     * Creates a new `Listener` object
     *
     * @param {string|Symbol} event The event being listened to
     * @param {EventEmitter} target The [`EventEmitter`]{@link EventEmitter} object that the listener
     * is attached to.
     * @param {EventEmitterCallback} callback The function to call when the listener is triggered
     * @param {Object} [options={}]
     * @param {Object} [options.context=target] The context to invoke the listener in (a.k.a. the
     * value of `this` inside the callback function).
     * @param {number} [options.remaining=Infinity] The remaining number of times after which the
     * callback should automatically be removed.
     * @param {array} [options.arguments] An array of arguments that will be passed separately to the
     * callback function upon execution. The array is stored in the [`arguments`]{@link #arguments}
     * property and can be retrieved or modified as desired.
     *
     * @throws {TypeError} The `event` parameter must be a string or
     * [`EventEmitter.ANY_EVENT`]{@link EventEmitter#ANY_EVENT}.
     * @throws {ReferenceError} The `target` parameter is mandatory.
     * @throws {TypeError} The `callback` must be a function.
     */
    constructor(event: string | Symbol, target: EventEmitter, callback: EventEmitterCallback, options?: {
        duration: number;
        context?: any;
        remaining?: number;
        arguments?: any[];
    }, ...args: any[]);
    /**
     * Removes the listener from its target.
     */
    remove(): void;
}
