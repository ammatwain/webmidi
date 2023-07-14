import { EventEmitter, EventEmitterCallback } from "./EventEmitter";

/**
 * The `Listener` class represents a single event listener object. Such objects keep all relevant
 * contextual information such as the event being listened to, the object the listener was attached
 * to, the callback function and so on.
 *
 */
export class Listener {

  /**
   * The event name.
   * @type {string}
   */
  public event: string | Symbol;

  /**
   * An array of arguments to pass to the callback function upon execution.
   * @type {array}
   */
  public arguments: any[];

  /**
   * The callback function to execute.
   * @type {Function}
   */
  public callback: EventEmitterCallback;

  /**
   * The context to execute the callback function in (a.k.a. the value of `this` inside the
   * callback function)
   * @type {Object}
   */
  public context: any;

  /**
   * The number of times the listener function was executed.
   * @type {number}
   */
  public count: number;

  /**
   * The remaining number of times after which the callback should automatically be removed.
   * @type {number}
   */
  public remaining: number;

  /**
   * Whether this listener is currently suspended or not.
   * @type {boolean}
   */
  public suspended: boolean;

  /**
   * The object that the event is attached to (or that emitted the event).
   * @type {EventEmitter}
   */
  public target: EventEmitter;


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
  }, ...args: any[]) {

    if (
      typeof event !== "string" &&
      !(event instanceof String) &&
      event !== EventEmitter.ANY_EVENT
    ) {
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

    this.arguments = options.arguments;

    this.callback = callback;

    this.context = options.context;

    this.count = 0;

    this.event = event;

    this.remaining = Number(options.remaining) >= 1 ? Number(options.remaining) : Infinity;

    this.suspended = false;

    this.target = target;

  }

  /**
   * Removes the listener from its target.
   */
  public remove(): void {
    this.target.removeListener(
      this.event,
      this.callback,
      {context: this.context, remaining: this.remaining}
    );
  }

}
