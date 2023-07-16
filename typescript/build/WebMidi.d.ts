import { EventEmitter } from "./EventEmitter";
import { Input } from "./Input";
import { WebMidiApi, WebMidiEventMap } from "./Interfaces";
import { Listener } from "./Listener";
import { Output } from "./Output";
/**
 * The `WebMidi` object makes it easier to work with the low-level Web MIDI API. Basically, it
 * simplifies sending outgoing MIDI messages and reacting to incoming MIDI messages.
 *
 * When using the WebMidi.js library, you should know that the `WebMidi` class has already been
 * instantiated. You cannot instantiate it yourself. If you use the **IIFE** version, you should
 * simply use the global object called `WebMidi`. If you use the **CJS** (CommonJS) or **ESM** (ES6
 * module) version, you get an already-instantiated object when you import the module.
 *
 * @fires WebMidi#connected
 * @fires WebMidi#disabled
 * @fires WebMidi#disconnected
 * @fires WebMidi#enabled
 * @fires WebMidi#error
 * @fires WebMidi#midiaccessgranted
 * @fires WebMidi#portschanged
 *
 * @extends EventEmitter
 * @license Apache-2.0
 */
export declare class WebMidi extends EventEmitter {
    static validation: boolean;
    /**
     * The WebMidi class is a singleton and you cannot instantiate it directly. It has already been
     * instantiated for you.
     */
    constructor();
    /**
     * @return {Promise<void>}
     * @private
     */
    private _destroyInputsAndOutputs;
    private _disconnectedInputs;
    private _disconnectedOutputs;
    private _inputs;
    private static _octaveOffset;
    private _onInterfaceStateChange;
    private _outputs;
    /**
     * @private
     */
    private _updateInputs;
    /**
     * @private
     */
    private _updateInputsAndOutputs;
    private _updateOutputs;
    _stateChangeQueue: any;
    /**
     * Object containing system-wide default values that can be changed to customize how the library
     * works.
     *
     * @type {object}
     *
     * @property {object}  defaults.note - Default values relating to note
     * @property {number}  defaults.note.attack - A number between 0 and 127 representing the
     * default attack velocity of notes. Initial value is 64.
     * @property {number}  defaults.note.release - A number between 0 and 127 representing the
     * default release velocity of notes. Initial value is 64.
     * @property {number}  defaults.note.duration - A number representing the default duration of
     * notes (in seconds). Initial value is Infinity.
     */
    static defaults: any;
    /**
     * The [`MIDIAccess`](https://developer.mozilla.org/en-US/docs/Web/API/MIDIAccess)
     * instance used to talk to the lower-level Web MIDI API. This should not be used directly
     * unless you know what you are doing.
     *
     * @type {WebMidiApi.MIDIAccess}
     * @readonly
     */
    interface: WebMidiApi.MIDIAccess;
    /**
     * Indicates whether argument validation and backwards-compatibility checks are performed
     * throughout the WebMidi.js library for object methods and property setters.
     *
     * This is an advanced setting that should be used carefully. Setting `validation` to `false`
     * improves performance but should only be done once the project has been thoroughly tested with
     * `validation` turned on.
     *
     * @type {boolean}
     */
    validation: boolean;
    /**
     * Adds an event listener that will trigger a function callback when the specified event is
     * dispatched.
     *
     * Here are the events you can listen to:   connected, disabled, disconnected, enabled,
     * midiaccessgranted, portschanged, error
     *
     * @param event {string | Symbol} The type of the event.
     *
     * @param listener {EventEmitterCallback} A callback function to execute when the specified event
     * is detected. This function will receive an event parameter object. For details on this object's
     * properties, check out the documentation for the various events (links above).
     *
     * @param {object} [options={}]
     *
     * @param {array} [options.arguments] An array of arguments which will be passed separately to the
     * callback function. This array is stored in the [`arguments`](Listener#arguments) property of
     * the [`Listener`](Listener) object and can be retrieved or modified as desired.
     *
     * @param {object} [options.context=this] The value of `this` in the callback function.
     *
     * @param {number} [options.duration=Infinity] The number of milliseconds before the listener
     * automatically expires.
     *
     * @param {boolean} [options.prepend=false] Whether the listener should be added at the beginning
     * of the listeners array and thus be triggered before others.
     *
     * @param {number} [options.remaining=Infinity] The number of times after which the callback
     * should automatically be removed.
     *
     * @returns {Listener} The listener object that was created
     */
    addListener<T extends keyof WebMidiEventMap>(e: Symbol | T, listener: WebMidiEventMap[T], options?: {
        "duration": number;
        "arguments"?: any[];
        "context"?: any;
        "prepend"?: boolean;
        "remaining"?: number;
    }): Listener | Listener[];
    /**
     * Adds a one-time event listener that will trigger a function callback when the specified event
     * is dispatched.
     *
     * Here are the events you can listen to:   connected, disabled, disconnected, enabled,
     * midiaccessgranted, portschanged, error
     *
     * @param event {string | Symbol} The type of the event.
     *
     * @param listener {EventEmitterCallback} A callback function to execute when the specified event
     * is detected. This function will receive an event parameter object. For details on this object's
     * properties, check out the documentation for the various events (links above).
     *
     * @param {object} [options={}]
     *
     * @param {array} [options.arguments] An array of arguments which will be passed separately to the
     * callback function. This array is stored in the [`arguments`](Listener#arguments) property of
     * the [`Listener`](Listener) object and can be retrieved or modified as desired.
     *
     * @param {object} [options.context=this] The value of `this` in the callback function.
     *
     * @param {number} [options.duration=Infinity] The number of milliseconds before the listener
     * automatically expires.
     *
     * @param {boolean} [options.prepend=false] Whether the listener should be added at the beginning
     * of the listeners array and thus be triggered before others.
     *
     * @returns {Listener} The listener object that was created
     */
    addOneTimeListener<T extends keyof WebMidiEventMap>(e: Symbol | T, listener: WebMidiEventMap[T], options?: {
        "duration": number;
        "arguments"?: any[];
        "context"?: any;
        "prepend"?: boolean;
    }): Listener | Listener[];
    /**
     * Completely disables **WebMidi.js** by unlinking the MIDI subsystem's interface and closing all
     * [`Input`](Input) and [`Output`](Output) objects that may have been opened. This also means that
     * listeners added to [`Input`](Input) objects, [`Output`](Output) objects or to `WebMidi` itself
     * are also destroyed.
     *
     * @async
     * @returns {Promise<Array>}
     *
     * @throws {Error} The Web MIDI API is not supported by your environment.
     *
     * @since 2.0.0
     */
    disable(): Promise<any[]>;
    /**
     * Checks if the Web MIDI API is available in the current environment and then tries to connect to
     * the host's MIDI subsystem. This is an asynchronous operation and it causes a security prompt to
     * be displayed to the user.
     *
     * To enable the use of MIDI system exclusive messages, the `sysex` option should be set to
     * `true`. However, under some environments (e.g. Jazz-Plugin), the `sysex` option is ignored
     * and system exclusive messages are always enabled. You can check the
     * [`sysexEnabled`](#sysexEnabled) property to confirm.
     *
     * To enable access to software synthesizers available on the host, you would set the `software`
     * option to `true`. However, this option is only there to future-proof the library as support for
     * software synths has not yet been implemented in any browser (as of September 2021).
     *
     * By the way, if you call the [`enable()`](#enable) method while WebMidi.js is already enabled,
     * the callback function will be executed (if any), the promise will resolve but the events
     * ([`"midiaccessgranted"`](#event:midiaccessgranted), [`"connected"`](#event:connected) and
     * [`"enabled"`](#event:enabled)) will not be fired.
     *
     * There are 3 ways to execute code after `WebMidi` has been enabled:
     *
     * - Pass a callback function in the `options`
     * - Listen to the [`"enabled"`](#event:enabled) event
     * - Wait for the promise to resolve
     *
     * In order, this is what happens towards the end of the enabling process:
     *
     * 1. [`"midiaccessgranted"`](#event:midiaccessgranted) event is triggered once the user has
     * granted access to use MIDI.
     * 2. [`"connected"`](#event:connected) events are triggered (for each available input and output)
     * 3. [`"enabled"`](#event:enabled) event is triggered when WebMidi.js is fully ready
     * 4. specified callback (if any) is executed
     * 5. promise is resolved and fulfilled with the `WebMidi` object.
     *
     * **Important note**: starting with Chrome v77, a page using Web MIDI API must be hosted on a
     * secure origin (`https://`, `localhost` or `file:///`) and the user will always be prompted to
     * authorize the operation (no matter if the `sysex` option is `true` or not).
     *
     * ##### Example
     * ```js
     * // Enabling WebMidi and using the promise
     * WebMidi.enable().then(() => {
     *   console.log("WebMidi.js has been enabled!");
     * })
     * ```
     *
     * @param [options] {object}
     *
     * @param [options.callback] {function} A function to execute once the operation completes. This
     * function will receive an `Error` object if enabling the Web MIDI API failed.
     *
     * @param [options.sysex=false] {boolean} Whether to enable MIDI system exclusive messages or not.
     *
     * @param [options.validation=true] {boolean} Whether to enable library-wide validation of method
     * arguments and setter values. This is an advanced setting that should be used carefully. Setting
     * [`validation`](#validation) to `false` improves performance but should only be done once the
     * project has been thoroughly tested with [`validation`](#validation)  turned on.
     *
     * @param [options.software=false] {boolean} Whether to request access to software synthesizers on
     * the host system. This is part of the spec but has not yet been implemented by most browsers as
     * of April 2020.
     *
     * @async
     *
     * @returns {Promise.<WebMidi>} The promise is fulfilled with the `WebMidi` object for
     * chainability
     *
     * @throws {Error} The Web MIDI API is not supported in your environment.
     * @throws {Error} Jazz-Plugin must be installed to use WebMIDIAPIShim.
     */
    enable(options?: {
        callback?: Function;
        sysex?: boolean;
        validation?: boolean;
        software?: boolean;
        requestMIDIAccessFunction?: Function;
    }): Promise<any>;
    /**
     * Returns the [`Input`](Input) object that matches the specified ID string or `false` if no
     * matching input is found. As per the Web MIDI API specification, IDs are strings (not integers).
     *
     * Please note that IDs change from one host to another. For example, Chrome does not use the same
     * kind of IDs as Jazz-Plugin.
     *
     * @param id {string} The ID string of the input. IDs can be viewed by looking at the
     * [`WebMidi.inputs`](WebMidi#inputs) array. Even though they sometimes look like integers, IDs
     * are strings.
     * @param [options] {object}
     * @param [options.disconnected] {boolean} Whether to retrieve a disconnected input
     *
     * @returns {Input} An [`Input`](Input) object matching the specified ID string or `undefined`
     * if no matching input can be found.
     *
     * @throws {Error} WebMidi is not enabled.
     *
     * @since 2.0.0
     */
    getInputById(id: string, options?: {
        disconnected?: boolean;
    }): Input;
    /**
     * Returns the first [`Input`](Input) object whose name **contains** the specified string. Note
     * that the port names change from one environment to another. For example, Chrome does not report
     * input names in the same way as the Jazz-Plugin does.
     *
     * @param name {string} The non-empty string to look for within the name of MIDI inputs (such as
     * those visible in the [inputs](WebMidi#inputs) array).
     *
     * @returns {Input | undefined} The [`Input`](Input) that was found or `undefined` if no input contained the
     * specified name.
     * @param [options] {object}
     * @param [options.disconnected] {boolean} Whether to retrieve a disconnected input
     *
     * @throws {Error} WebMidi is not enabled.
     *
     * @since 2.0.0
     */
    getInputByName(name: string, options?: {
        disconnected?: boolean;
    }): Input | undefined;
    /**
     * Returns the [`Output`](Output) object that matches the specified ID string or `false` if no
     * matching output is found. As per the Web MIDI API specification, IDs are strings (not
     * integers).
     *
     * Please note that IDs change from one host to another. For example, Chrome does not use the same
     * kind of IDs as Jazz-Plugin.
     *
     * @param id {string} The ID string of the port. IDs can be viewed by looking at the
     * [`WebMidi.outputs`](WebMidi#outputs) array.
     * @param [options] {object}
     * @param [options.disconnected] {boolean} Whether to retrieve a disconnected output
     *
     * @returns {Output | undefined} An [`Output`](Output) object matching the specified ID string. If no
     * matching output can be found, the method returns `undefined`.
     *
     * @throws {Error} WebMidi is not enabled.
     *
     * @since 2.0.0
     */
    getOutputById(id: string, options?: {
        disconnected?: boolean;
    }): Output | undefined;
    /**
     * Returns the first [`Output`](Output) object whose name **contains** the specified string. Note
     * that the port names change from one environment to another. For example, Chrome does not report
     * input names in the same way as the Jazz-Plugin does.
     *
     * @param name {string} The non-empty string to look for within the name of MIDI inputs (such as
     * those visible in the [`outputs`](#outputs) array).
     * @param [options] {object}
     * @param [options.disconnected] {boolean} Whether to retrieve a disconnected output
     *
     * @returns {Output} The [`Output`](Output) that was found or `undefined` if no output matched
     * the specified name.
     *
     * @throws {Error} WebMidi is not enabled.
     *
     * @since 2.0.0
     */
    getOutputByName(name: string, options?: {
        disconnected?: boolean;
    }): Output;
    /**
     * Checks if the specified event type is already defined to trigger the specified callback
     * function.
     *
     * @param event {string|Symbol} The type of the event.
     *
     * @param listener {EventEmitterCallback} The callback function to check for.
     *
     * @param {object} [options={}]
     *
     * @returns {boolean} Boolean value indicating whether or not the `Input` or `InputChannel`
     * already has this listener defined.
     */
    hasListener<T extends keyof WebMidiEventMap>(e: Symbol | T, listener: WebMidiEventMap[T]): boolean;
    /**
     * Removes the specified listener for the specified event. If no listener is specified, all
     * listeners for the specified event will be removed.
     *
     * @param [type] {string} The type of the event.
     *
     * @param [listener] {EventEmitterCallback} The callback function to check for.
     *
     * @param {object} [options={}]
     *
     * @param {*} [options.context] Only remove the listeners that have this exact context.
     *
     * @param {number} [options.remaining] Only remove the listener if it has exactly that many
     * remaining times to be executed.
     */
    removeListener<T extends keyof WebMidiEventMap>(type?: Symbol | T, listener?: WebMidiEventMap[T], options?: {
        "context"?: any;
        "remaining"?: number;
    }): void;
    /**
     * Indicates whether access to the host's MIDI subsystem is active or not.
     *
     * @readonly
     * @type {boolean}
     */
    get enabled(): boolean;
    /**
     * An array of all currently available MIDI inputs.
     *
     * @readonly
     * @type {Input[]}
     */
    get inputs(): Input[];
    /**
     * An integer to offset the octave of notes received from external devices or sent to external
     * devices.
     *
     * When a MIDI message comes in on an input channel the reported note name will be offset. For
     * example, if the `octaveOffset` is set to `-1` and a [`"noteon"`](InputChannel#event:noteon)
     * message with MIDI number 60 comes in, the note will be reported as C3 (instead of C4).
     *
     * By the same token, when [`OutputChannel.playNote()`](OutputChannel#playNote) is called, the
     * MIDI note number being sent will be offset. If `octaveOffset` is set to `-1`, the MIDI note
     * number sent will be 72 (instead of 60).
     *
     * @type {number}
     *
     * @since 2.1
     */
    static get octaveOffset(): number;
    static set octaveOffset(value: number);
    /**
     * An array of all currently available MIDI outputs as [`Output`](Output) objects.
     *
     * @readonly
     * @type {Output[]}
     */
    get outputs(): Output[];
    /**
     * Indicates whether the environment provides support for the Web MIDI API or not.
     *
     * **Note**: in environments that do not offer built-in MIDI support, this will report `true` if
     * the
     * [`navigator.requestMIDIAccess`](https://developer.mozilla.org/en-US/docs/Web/API/MIDIAccess)
     * function is available. For example, if you have installed WebMIDIAPIShim.js but no plugin, this
     * property will be `true` even though actual support might not be there.
     *
     * @readonly
     * @type {boolean}
     */
    get supported(): boolean;
    /**
     * Indicates whether MIDI system exclusive messages have been activated when WebMidi.js was
     * enabled via the [`enable()`](#enable) method.
     *
     * @readonly
     * @type boolean
     */
    get sysexEnabled(): boolean;
    /**
     * The elapsed time, in milliseconds, since the time
     * [origin](https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp#The_time_origin).
     * Said simply, it is the number of milliseconds that passed since the page was loaded. Being a
     * floating-point number, it has sub-millisecond accuracy. According to the
     * [documentation](https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp), the
     * time should be accurate to 5 µs (microseconds). However, due to various constraints, the
     * browser might only be accurate to one millisecond.
     *
     * Note: `WebMidi.time` is simply an alias to `performance.now()`.
     *
     * @type {DOMHighResTimeStamp}
     * @readonly
     */
    static get time(): number;
    /**
     * The version of the library as a [semver](https://semver.org/) string.
     *
     * @readonly
     * @type string
     */
    get version(): string;
    /**
     * The flavour of the library. Can be one of:
     *
     * * `esm`: ECMAScript Module
     * * `cjs`: CommonJS Module
     * * `iife`: Immediately-Invoked Function Expression
     *
     * @readonly
     * @type string
     * @since 3.0.25
     */
    get flavour(): string;
}
