"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Listener = void 0;
const EventEmitter_1 = require("./EventEmitter");
/**
 * The `Listener` class represents a single event listener object. Such objects keep all relevant
 * contextual information such as the event being listened to, the object the listener was attached
 * to, the callback function and so on.
 *
 */
class Listener {
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
    constructor(event, target, callback, options, ...args) {
        if (typeof event !== "string" &&
            !(event instanceof String) &&
            event !== EventEmitter_1.EventEmitter.ANY_EVENT) {
            throw new TypeError("The 'event' parameter must be a string or EventEmitter.ANY_EVENT.");
        }
        if (!target) {
            throw new ReferenceError("The 'target' parameter is mandatory.");
        }
        if (typeof callback !== "function") {
            throw new TypeError("The 'callback' must be a function.");
        }
        // Convert single value argument to array
        if (options.arguments !== undefined && !Array.isArray(options.arguments)) {
            options.arguments = [options.arguments];
        }
        // Define default options and merge declared options into them,
        options = Object.assign({
            context: target,
            remaining: Infinity,
            arguments: undefined,
            duration: Infinity,
        }, options);
        // Make sure it is eventually deleted if a duration is supplied
        if (options.duration !== Infinity) {
            setTimeout(() => this.remove(), options.duration);
        }
        /**
         * An array of arguments to pass to the callback function upon execution.
         * @type {array}
         */
        this.arguments = options.arguments;
        /**
         * The callback function to execute.
         * @type {Function}
         */
        this.callback = callback;
        /**
         * The context to execute the callback function in (a.k.a. the value of `this` inside the
         * callback function)
         * @type {Object}
         */
        this.context = options.context;
        /**
         * The number of times the listener function was executed.
         * @type {number}
         */
        this.count = 0;
        /**
         * The event name.
         * @type {string}
         */
        this.event = event;
        /**
         * The remaining number of times after which the callback should automatically be removed.
         * @type {number}
         */
        this.remaining = parseInt(options.remaining) >= 1 ? parseInt(options.remaining) : Infinity;
        /**
         * Whether this listener is currently suspended or not.
         * @type {boolean}
         */
        this.suspended = false;
        /**
         * The object that the event is attached to (or that emitted the event).
         * @type {EventEmitter}
         */
        this.target = target;
    }
    /**
     * Removes the listener from its target.
     */
    remove() {
        this.target.removeListener(this.event, this.callback, { context: this.context, remaining: this.remaining });
    }
}
exports.Listener = Listener;
//# sourceMappingURL=Listener.js.map