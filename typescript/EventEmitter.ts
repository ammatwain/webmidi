import { Listener } from "./Listener";

/**
 * The callback function is executed when the associated event is triggered via [`emit()`](#emit).
 * The [`emit()`](#emit) method relays all additional arguments it received to the callback
 * functions. Since [`emit()`](#emit) can be passed a variable number of arguments, it is up to
 * the developer to make sure the arguments match those of the associated callback. In addition,
 * the callback also separately receives all the arguments present in the listener's
 * [`arguments`](Listener#arguments) property. This makes it easy to pass data from where the
 * listener is added to where the listener is executed.
 *
 * @callback EventEmitterCallback
 * @param {...*} [args] A variable number of arguments matching the ones (if any) that were passed
 * to the [`emit()`](#emit) method (except, the first one) followed by the arguments found in the
 * listener's [`arguments`](Listener#arguments) array.
 */
export type EventEmitterCallback = (...args: any[]) => void;

/**
 * The `EventEmitter` class provides methods to implement the _observable_ design pattern. This
 * pattern allows one to _register_ a function to execute when a specific event is _emitted_ by the
 * emitter.
 *
 * It is intended to be an abstract class meant to be extended by (or mixed into) other objects.
 */
export class EventEmitter {
  /**
   * The callback function is executed when the associated event is triggered via [`emit()`](#emit).
   * The [`emit()`](#emit) method relays all additional arguments it received to the callback
   * functions. Since [`emit()`](#emit) can be passed a variable number of arguments, it is up to
   * the developer to make sure the arguments match those of the associated callback. In addition,
   * the callback also separately receives all the arguments present in the listener's
   * [`arguments`](Listener#arguments) property. This makes it easy to pass data from where the
   * listener is added to where the listener is executed.
   *
   * @callback EventEmitter~callback
   * @param {...*} [args] A variable number of arguments matching the ones (if any) that were passed
   * to the [`emit()`](#emit) method (except, the first one) followed by the arguments found in the
   * listener's [`arguments`](Listener#arguments) array.
   */


  /**
   * Identifier (Symbol) to use when adding or removing a listener that should be triggered when any
   * events occur.
   *
   * @type {Symbol}
   */
  static get ANY_EVENT(): Symbol {
    return Symbol.for("Any event");
  }


  /**
   * Creates a new `EventEmitter`object.
   *
   * @param {boolean} [eventsSuspended=false] Whether the `EventEmitter` is initially in a suspended
   * state (i.e. not executing callbacks).
   */
  constructor(eventsSuspended: boolean = false) {

    /**
     * An object containing a property for each event with at least one registered listener. Each
     * event property contains an array of all the [`Listener`]{@link Listener} objects registered
     * for the event.
     *
     * @type {Object}
     * @readonly
     */
    this.eventMap = {};

    /**
     * Whether or not the execution of callbacks is currently suspended for this emitter.
     *
     * @type {boolean}
     */
    this.eventsSuspended = eventsSuspended == true ? true : false;

  }


  /**
   * An object containing a property for each event with at least one registered listener. Each
   * event property contains an array of all the [`Listener`]{@link Listener} objects registered
   * for the event.
   *
   * @type {Object}
   * @readonly
   */
  eventMap: any;

  /**
   * Whether or not the execution of callbacks is currently suspended for this emitter.
   *
   * @type {boolean}
   */
  eventsSuspended: boolean;

  /**
   * Adds a listener for the specified event. It returns the [`Listener`]{@link Listener} object
   * that was created and attached to the event.
   *
   * To attach a global listener that will be triggered for any events, use
   * [`EventEmitter.ANY_EVENT`]{@link #ANY_EVENT} as the first parameter. Note that a global
   * listener will also be triggered by non-registered events.
   *
   * @param {string|Symbol} event The event to listen to.
   * @param {EventEmitterCallback} callback The callback function to execute when the event occurs.
   * @param {Object} [options={}]
   * @param {Object} [options.context=this] The value of `this` in the callback function.
   * @param {boolean} [options.prepend=false] Whether the listener should be added at the beginning
   * of the listeners array and thus executed first.
   * @param {number} [options.duration=Infinity] The number of milliseconds before the listener
   * automatically expires.
   * @param {number} [options.remaining=Infinity] The number of times after which the callback
   * should automatically be removed.
   * @param {array} [options.arguments] An array of arguments which will be passed separately to the
   * callback function. This array is stored in the [`arguments`]{@link Listener#arguments}
   * property of the [`Listener`]{@link Listener} object and can be retrieved or modified as
   * desired.
   *
   * @returns {Listener} The newly created [`Listener`]{@link Listener} object.
   *
   * @throws {TypeError} The `event` parameter must be a string or
   * [`EventEmitter.ANY_EVENT`]{@link EventEmitter#ANY_EVENT}.
   * @throws {TypeError} The `callback` parameter must be a function.
   */
  addListener(event: string | Symbol, callback: EventEmitterCallback, options?: {
    duration: number;
    context?: any;
    prepend?: boolean;
    remaining?: number;
    arguments?: any[];
  }): Listener | Listener[] {

    if (
      (typeof event === "string" && event.length < 1) ||
      (event instanceof String && event.length < 1) ||
      (typeof event !== "string" && !(event instanceof String) && event !== EventEmitter.ANY_EVENT)
    ) {
      throw new TypeError("The 'event' parameter must be a string or EventEmitter.ANY_EVENT.");
    }

    if (typeof callback !== "function") throw new TypeError("The callback must be a function.");

    const listener = new Listener(event, this, callback, options);

    if (!this.eventMap[String(event)]) this.eventMap[String(event)] = [];

    if (options.prepend) {
      this.eventMap[String(event)].unshift(listener);
    } else {
      this.eventMap[String(event)].push(listener);
    }

    return listener;

  }


  /**
   * Adds a one-time listener for the specified event. The listener will be executed once and then
   * destroyed. It returns the [`Listener`]{@link Listener} object that was created and attached
   * to the event.
   *
   * To attach a global listener that will be triggered for any events, use
   * [`EventEmitter.ANY_EVENT`]{@link EventEmitter#ANY_EVENT} as the first parameter. Note that a
   * global listener will also be triggered by non-registered events.
   *
   * @param {string|Symbol} event The event to listen to
   * @param {EventEmitterCallback} callback The callback function to execute when the event occurs
   * @param {Object} [options={}]
   * @param {Object} [options.context=this] The context to invoke the callback function in.
   * @param {boolean} [options.prepend=false] Whether the listener should be added at the beginning
   * of the listeners array and thus executed first.
   * @param {number} [options.duration=Infinity] The number of milliseconds before the listener
   * automatically expires.
   * @param {array} [options.arguments] An array of arguments which will be passed separately to the
   * callback function. This array is stored in the [`arguments`]{@link Listener#arguments}
   * property of the [`Listener`]{@link Listener} object and can be retrieved or modified as
   * desired.
   *
   * @returns {Listener} The newly created [`Listener`]{@link Listener} object.
   *
   * @throws {TypeError} The `event` parameter must be a string or
   * [`EventEmitter.ANY_EVENT`]{@link EventEmitter#ANY_EVENT}.
   * @throws {TypeError} The `callback` parameter must be a function.
   */
  addOneTimeListener(event: string | Symbol, callback: EventEmitterCallback, options?: {
    duration: number;
    context?: any;
    prepend?: boolean;
    arguments?: any[];
    remaining?: number;
  }): Listener | Listener[] {
    options.remaining = 1;
    return this.addListener(event, callback, options);
  }

  /**
   * Returns `true` if the specified event has at least one registered listener. If no event is
   * specified, the method returns `true` if any event has at least one listener registered (this
   * includes global listeners registered to
   * [`EventEmitter.ANY_EVENT`]{@link EventEmitter#ANY_EVENT}).
   *
   * Note: to specifically check for global listeners added with
   * [`EventEmitter.ANY_EVENT`]{@link EventEmitter#ANY_EVENT}, use
   * [`EventEmitter.ANY_EVENT`]{@link EventEmitter#ANY_EVENT} as the parameter.
   *
   * @param {string|Symbol} [event=(any event)] The event to check
   * @param {function|Listener} [callback=(any callback)] The actual function that was added to the
   * event or the {@link Listener} object returned by `addListener()`.
   * @returns {boolean}
   */
  hasListener(event?: string | Symbol, callback?: Function | Listener): boolean {

    if (event === undefined) {

      // Check for ANY_EVENT
      if (
        this.eventMap[String(EventEmitter.ANY_EVENT)] && this.eventMap[String(EventEmitter.ANY_EVENT)].length > 0
      ) {
        return true;
      }

      // Check for any regular events
      return Object.entries(this.eventMap).some(([, value]) => {
        return String(value).length > 0;
      });

    } else {

      if (this.eventMap[String(event)] && this.eventMap[String(event)].length > 0) {

        if (callback instanceof Listener) {
          let result = this.eventMap[String(event)].filter((listener: any) => listener === callback);
          return result.length > 0;
        } else if (typeof callback === "function") {
          let result = this.eventMap[String(event)].filter(listener => listener.callback === callback);
          return result.length > 0;
        } else if (callback != undefined) {
          return false;
        }

        return true;

      } else {
        return false;
      }


    }

  }


  /**
   * An array of all the unique event names for which the emitter has at least one registered
   * listener.
   *
   * Note: this excludes global events registered with
   * [`EventEmitter.ANY_EVENT`]{@link EventEmitter#ANY_EVENT} because they are not tied to a
   * specific event.
   *
   * @type {string[]}
   * @readonly
   */
  get eventNames(): string[] {
    return Object.keys(this.eventMap);
  }


  /**
   * Returns an array of all the [`Listener`]{@link Listener} objects that have been registered for
   * a specific event.
   *
   * Please note that global events (those added with
   * [`EventEmitter.ANY_EVENT`]{@link EventEmitter#ANY_EVENT}) are not returned for "regular"
   * events. To get the list of global listeners, specifically use
   * [`EventEmitter.ANY_EVENT`]{@link EventEmitter#ANY_EVENT} as the parameter.
   *
   * @param {string|Symbol} event The event to get listeners for.
   * @returns {Listener[]} An array of [`Listener`]{@link Listener} objects.
   */
  getListeners(event: string | Symbol): Listener[] {
    return this.eventMap[String(event)] || [];
  }


  /**
   * Suspends execution of all callbacks functions registered for the specified event type.
   *
   * You can suspend execution of callbacks registered with
   * [`EventEmitter.ANY_EVENT`]{@link EventEmitter#ANY_EVENT} by passing
   * [`EventEmitter.ANY_EVENT`]{@link EventEmitter#ANY_EVENT} to `suspendEvent()`. Beware that this
   * will not suspend all callbacks but only those registered with
   * [`EventEmitter.ANY_EVENT`]{@link EventEmitter#ANY_EVENT}. While this may seem counter-intuitive
   * at first glance, it allows the selective suspension of global listeners while leaving other
   * listeners alone. If you truly want to suspends all callbacks for a specific
   * [`EventEmitter`]{@link EventEmitter}, simply set its `eventsSuspended` property to `true`.
   *
   * @param {string|Symbol} event The event name (or `EventEmitter.ANY_EVENT`) for which to suspend
   * execution of all callback functions.
   */
  suspendEvent(event: string | Symbol): void {
    this.getListeners(event).forEach(listener => {
      listener.suspended = true;
    });
  }

  /**
   * Resumes execution of all suspended callback functions registered for the specified event type.
   *
   * You can resume execution of callbacks registered with
   * [`EventEmitter.ANY_EVENT`]{@link EventEmitter#ANY_EVENT} by passing
   * [`EventEmitter.ANY_EVENT`]{@link EventEmitter#ANY_EVENT} to `unsuspendEvent()`. Beware that
   * this will not resume all callbacks but only those registered with
   * [`EventEmitter.ANY_EVENT`]{@link EventEmitter#ANY_EVENT}. While this may seem
   * counter-intuitive, it allows the selective unsuspension of global listeners while leaving other
   * callbacks alone.
   *
   * @param {string|Symbol} event The event name (or `EventEmitter.ANY_EVENT`) for which to resume
   * execution of all callback functions.
   */
  unsuspendEvent(event: string | Symbol): void {
    this.getListeners(event).forEach(listener => {
      listener.suspended = false;
    });
  }

  /**
   * Returns the number of listeners registered for a specific event.
   *
   * Please note that global events (those added with
   * [`EventEmitter.ANY_EVENT`]{@link EventEmitter#ANY_EVENT}) do not count towards the remaining
   * number for a "regular" event. To get the number of global listeners, specifically use
   * [`EventEmitter.ANY_EVENT`]{@link EventEmitter#ANY_EVENT} as the parameter.
   *
   * @param {string|Symbol} event The event which is usually a string but can also be the special
   * [`EventEmitter.ANY_EVENT`]{@link EventEmitter#ANY_EVENT} symbol.
   * @returns {number} An integer representing the number of listeners registered for the specified
   * event.
   */
  getListenerCount(event: string | Symbol): number {
    return this.getListeners(event).length;
  }


  /**
   * Executes the callback function of all the [`Listener`]{@link Listener} objects registered for
   * a given event. The callback functions are passed the additional arguments passed to `emit()`
   * (if any) followed by the arguments present in the [`arguments`](Listener#arguments) property of
   * the [`Listener`](Listener) object (if any).
   *
   * If the [`eventsSuspended`]{@link #eventsSuspended} property is `true` or the
   * [`Listener.suspended`]{@link Listener#suspended} property is `true`, the callback functions
   * will not be executed.
   *
   * This function returns an array containing the return values of each of the callbacks.
   *
   * It should be noted that the regular listeners are triggered first followed by the global
   * listeners (those added with [`EventEmitter.ANY_EVENT`]{@link EventEmitter#ANY_EVENT}).
   *
   * @param {string} event The event
   * @param {...*} args Arbitrary number of arguments to pass along to the callback functions
   *
   * @returns {Array} An array containing the return value of each of the executed listener
   * functions.
   *
   * @throws {TypeError} The `event` parameter must be a string.
   */
  emit(event: string, ...args: any[]): any[] {

    if (typeof event !== "string" && !(<any>event instanceof String)) {
      throw new TypeError("The 'event' parameter must be a string.");
    }

    if (this.eventsSuspended) return;

    // We collect return values from all listeners here
    let results = [];

    // We must make sure that we do not have undefined otherwise concat() will add an undefined
    // entry in the array.
    let listeners = this.eventMap[String(EventEmitter.ANY_EVENT)] || [];
    if (this.eventMap[event]) listeners = listeners.concat(this.eventMap[event]);

    listeners.forEach((listener: any) => {

      // This is the per-listener suspension check
      if (listener.suspended) return;

      let params = [...args];
      if (Array.isArray(listener.arguments)) params = params.concat(listener.arguments);

      if (listener.remaining > 0) {
        results.push(listener.callback.apply(listener.context, params));
        listener.count++;
      }

      if (--listener.remaining < 1) listener.remove();

    });

    return results;

  }


  /**
   * Removes all the listeners that match the specified criterias. If no parameters are passed, all
   * listeners will be removed. If only the `event` parameter is passed, all listeners for that
   * event will be removed. You can remove global listeners by using
   * [`EventEmitter.ANY_EVENT`]{@link EventEmitter#ANY_EVENT} as the first parameter.
   *
   * To use more granular options, you must at least define the `event`. Then, you can specify the
   * callback to match or one or more of the additional options.
   *
   * @param {string | Symbol} [event] The event name.
   * @param {EventEmitterCallback} [callback] Only remove the listeners that match this exact
   * callback function.
   * @param {Object} [options]
   * @param {*} [options.context] Only remove the listeners that have this exact context.
   * @param {number} [options.remaining] Only remove the listener if it has exactly that many
   * remaining times to be executed.
   */
  removeListener(
    event?: string | Symbol,
    callback?: EventEmitterCallback,
    options?: {
      context?: any;
      remaining?: number;
    }
  ): void {

    if (event === undefined) {
      this.eventMap = {};
      return;
    } else if (!this.eventMap[String(event)]) {
      return;
    }

    // Find listeners that do not match the criterias (those are the ones we will keep)
    let listeners = this.eventMap[String(event)].filter((listener: any) => {

      return (callback && listener.callback !== callback) ||
        (options.remaining && options.remaining !== listener.remaining) ||
        (options.context && options.context !== listener.context);

    });

    if (listeners.length) {
      this.eventMap[String(event)] = listeners;
    } else {
      delete this.eventMap[String(event)];
    }

  }


  /**
   * The `waitFor()` method is an async function which returns a promise. The promise is fulfilled
   * when the specified event occurs. The event can be a regular event or
   * [`EventEmitter.ANY_EVENT`]{@link EventEmitter#ANY_EVENT} (if you want to resolve as soon as any
   * event is emitted).
   *
   * If the `duration` option is set, the promise will only be fulfilled if the event is emitted
   * within the specified duration. If the event has not been fulfilled after the specified
   * duration, the promise is rejected. This makes it super easy to wait for an event and timeout
   * after a certain time if the event is not triggered.
   *
   * @param {string|Symbol} event The event to wait for
   * @param {Object} [options={}]
   * @param {number} [options.duration=Infinity] The number of milliseconds to wait before the
   * promise is automatically rejected.
   */
  /* async */ waitFor(event: string | Symbol, options?: {
    duration?: number;
  }): Promise<any> {

    options.duration = Number(options.duration);
    if (isNaN(options.duration) || options.duration <= 0) options.duration = Infinity;

    return new Promise((resolve, reject) => {

      let timeout: any;

      let listener = this.addListener(event, () => {
        clearTimeout(timeout);
        (<EventEmitterCallback>resolve)();
      }, {duration: options.duration, remaining: 1});

      if (options.duration !== Infinity) {
        timeout = setTimeout(() => {
          (<Listener>listener).remove();
          reject("The duration expired before the event was emitted.");
        }, options.duration);
      }

    });

  }

  /**
   * The number of unique events that have registered listeners.
   *
   * Note: this excludes global events registered with
   * [`EventEmitter.ANY_EVENT`]{@link EventEmitter#ANY_EVENT} because they are not tied to a
   * specific event.
   *
   * @type {number}
   * @readonly
   */
  get eventCount(): number {
    return Object.keys(this.eventMap).length;
  }

}
