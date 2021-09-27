import {EventEmitter} from "../node_modules/djipevents/dist/djipevents.esm.min.js";
import {WebMidi} from "./WebMidi.js";
import {Utilities} from "./Utilities.js";
import {Note} from "./Note.js";

/**
 * The `InputChannel` class represents a MIDI input channel (1-16) from a single input device. This
 * object is derived from the host's MIDI subsystem and cannot be instantiated directly.
 *
 * All 16 `InputChannel` objects can be found inside the input's [channels]{@link Input#channels}
 * property.
 *
 * The `InputChannel` class extends the
 * [EventEmitter](https://djipco.github.io/djipevents/EventEmitter.html) class from the
 * [djipevents]{@link https://djipco.github.io/djipevents/index.html} module. This means
 * it also includes methods such as
 * [addListener()](https://djipco.github.io/djipevents/EventEmitter.html#addListener),
 * [removeListener()](https://djipco.github.io/djipevents/EventEmitter.html#removeListener),
 * [hasListener()](https://djipco.github.io/djipevents/EventEmitter.html#hasListener) and several
 * others. Check out the
 * [documentation for EventEmitter](https://djipco.github.io/djipevents/EventEmitter.html) for more
 * details.
 *
 * @param {Input} input The `Input` object this channel belongs to
 * @param {number} number The MIDI channel's number (1-16)
 *
 * @fires InputChannel#midimessage
 *
 * @fires InputChannel#noteoff
 * @fires InputChannel#noteon
 * @fires InputChannel#keyaftertouch
 * @fires InputChannel#controlchange
 * @fires InputChannel#programchange
 * @fires InputChannel#channelaftertouch
 * @fires InputChannel#pitchbend
 *
 * @fires InputChannel#allnotesoff
 * @fires InputChannel#allsoundoff
 * @fires InputChannel#localcontrol
 * @fires InputChannel#monomode
 * @fires InputChannel#omnimode
 * @fires InputChannel#resetallcontrollers
 *
 * @since 3.0.0
 */
export class InputChannel extends EventEmitter {

  constructor(input, number) {

    super();

    /**
     * @type {Input}
     * @private
     */
    this._input = input;

    /**
     * @type {number}
     * @private
     */
    this._number = number;

    /**
     * @type {number}
     * @private
     */
    this._octaveOffset = 0;

    // /**
    //  * An array of the current NRPNs being constructed for this channel
    //  *
    //  * @private
    //  *
    //  * @type {string[]}
    //  */
    // this._nrpnBuffer = [];
    //
    // // Enable NRPN events by default
    // this.nrpnEventsEnabled = true;

  }

  /**
   * Destroys the `Input` by removing all listeners and severing the link with the MIDI subsystem's
   * input.
   */
  destroy() {
    this._input = null;
    this._number = null;
    this._octaveOffset = 0;
    // this._nrpnBuffer = null;
    // this._nrpnEventsEnabled = false;
    this.removeListener();
  }

  /**
   * @param e MIDIMessageEvent
   * @private
   */
  _processMidiMessageEvent(e) {

    // Create and emit a new 'midimessage' event based on the incoming one
    const event = Object.assign({}, e);
    event.target = this;
    event.type = "midimessage";

    /**
     * Event emitted when a MIDI message of any kind is received by an `InputChannel`
     *
     * @event InputChannel#midimessage
     *
     * @type {Object}
     *
     * @property {Input} target The `InputChannel` that triggered the event.
     * @property {Message} message A `Message` object containing information about the incoming MIDI
     * message.
     * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
     * milliseconds since the navigation start of the document).
     * @property {string} type `"midimessage"`
     *
     * @property {Array} event.data The MIDI message as an array of 8 bit values (deprecated, use
     * the `message` object instead).
     * @property {Uint8Array} event.rawData The raw MIDI message as a Uint8Array  (deprecated, use
     * the `message` object instead).
     * @property {number} event.statusByte The message's status byte  (deprecated, use the `message`
     * object instead).
     * @property {?number[]} event.dataBytes The message's data bytes as an array of 0, 1 or 2
     * integers. This will be null for `sysex` messages (deprecated, use the `message` object
     * instead).
     */
    this.emit(event.type, event);

    // Parse the inbound event for regular messages
    this._parseEventForStandardMessages(event);

    // Parse the event to see if its part of an NRPN sequence
    // this._parseEventForNrpnMessage(e);

  }

  /**
   * Parses incoming channel events and emit standard MIDI message events (noteon, noteoff, etc.)
   * @param e Event
   * @private
   */
  _parseEventForStandardMessages(e) {

    const event = Object.assign({}, e);
    event.type = event.message.type || "unknownmidimessage";

    const data1 = e.message.dataBytes[0];
    const data2 = e.message.dataBytes[1];

    if ( event.type === "noteoff" || (event.type === "noteon" && data2 === 0) ) {

      /**
       * Event emitted when a **note off** MIDI message has been received on the channel.
       *
       * @event InputChannel#noteoff
       *
       * @type {Object}
       * @property {string} type `"noteoff"`
       *
       * @property {InputChannel} target The object that triggered the event (the `InputChannel`
       * object).
       * @property {Message} message A `Message` object containing information about the incoming
       * MIDI message.
       * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
       * milliseconds since the navigation start of the document).
       *
       * @property {Object} note A {@link Note} object containing information such as note name,
       * octave and release velocity.
       * @property {number} value The release velocity amount expressed as a float between 0 and 1.
       * @property {number} rawValue The release velocity amount expressed as an integer (between 0
       * and 127).
       */

      // The object created when a noteoff event arrives is a Note with an attack velocity of 0.
      event.note = new Note(
        Utilities.offsetNumber(
          data1, this.octaveOffset + this.input.octaveOffset + WebMidi.octaveOffset
        ),
        {
          rawAttack: 0,
          rawRelease: data2,
        }
      );

      event.value = Utilities.toNormalized(data2);
      event.rawValue = data2;

      // Those are kept for backwards-compatibility but are gone from the documentation. They will
      // be removed in future versions (@deprecated).
      event.velocity = event.note.release;
      event.rawVelocity = event.note.rawRelease;

    } else if (event.type === "noteon") {

      /**
       * Event emitted when a **note on** MIDI message has been received.
       *
       * @event InputChannel#noteon
       *
       * @type {Object}
       * @property {string} type `"noteon"`
       *
       * @property {InputChannel} channel The `InputChannel` object that triggered the event.
       * @property {Array} event.data The MIDI message as an array of 8 bit values.
       * @property {InputChannel} input The `Input` object where through which the message was
       * received.
       * @property {Uint8Array} event.rawData The raw MIDI message as a `Uint8Array`.
       * @property {InputChannel} target The object that triggered the event (the `InputChannel`
       * object).
       * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
       * milliseconds since the navigation start of the document).
       *
       * @property {Object} note A {@link Note} object containing information such as note name,
       * octave and attack velocity.
       *
       * @property {number} value The attack velocity amount expressed as a float between 0 and 1.
       * @property {number} rawValue The attack velocity amount expressed as an integer (between 0
       * and 127).
       */
      event.note = new Note(
        Utilities.offsetNumber(
          data1, this.octaveOffset + this.input.octaveOffset + WebMidi.octaveOffset
        ),
        { rawAttack: data2 }
      );

      event.value = Utilities.toNormalized(data2);
      event.rawValue = data2;

      // Those are kept for backwards-compatibility but are gone from the documentation. They will
      // be removed in future versions (@deprecated).
      event.velocity = event.note.attack;
      event.rawVelocity = event.note.rawAttack;

    } else if (event.type === "keyaftertouch") {

      /**
       * Event emitted when a **key-specific aftertouch** MIDI message has been received.
       *
       * @event InputChannel#keyaftertouch
       *
       * @type {Object}
       * @property {string} type `"keyaftertouch"`
       *
       * @property {InputChannel} target The object that triggered the event (the `InputChannel`
       * object).
       * @property {Message} message A `Message` object containing information about the incoming
       * MIDI message.
       * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
       * milliseconds since the navigation start of the document).
       *
       * @property {string} identifier The note identifier of the key to apply the aftertouch to.
       * This includes any octave offset applied at the channel, input or global level.
       * @property {number} key The MIDI note number of the key to apply the aftertouch to. This
       * includes any octave offset applied at the channel, input or global level.
       * @property {number} rawKey The MIDI note number of the key to apply the aftertouch to. This
       * excludes any octave offset defined at the channel, input or global level.
       * @property {number} value The aftertouch amount expressed as a float between 0 and 1.
       * @property {number} rawValue The aftertouch amount expressed as an integer (between 0 and
       * 127).
       */
      event.identifier = Utilities.toNoteIdentifier(
        data1, WebMidi.octaveOffset + this.input.octaveOffset + this.octaveOffset
      );

      event.key = Utilities.toNoteNumber(event.identifier);
      event.rawKey = data1;

      event.value = Utilities.toNormalized(data2);
      event.rawValue = data2;

      // This is kept for backwards-compatibility but is gone from the documentation. It will be
      // removed from future versions (@deprecated).
      event.note = new Note(
        Utilities.offsetNumber(
          data1, this.octaveOffset + this.input.octaveOffset + WebMidi.octaveOffset
        )
      );

    } else if (event.type === "controlchange") {

      /**
       * Event emitted when a **control change** MIDI message has been received.
       *
       * @event InputChannel#controlchange
       *
       * @type {Object}
       * @property {string} type `"controlchange"`
       *
       * @property {InputChannel} target The object that triggered the event (the `InputChannel`
       * object).
       * @property {Message} message A `Message` object containing information about the incoming
       * MIDI message.
       * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
       * milliseconds since the navigation start of the document).
       *
       * @property {Object} controller
       * @property {Object} controller.number The number of the controller.
       * @property {Object} controller.name The usual name or function of the controller.
       * @property {number} value The value expressed as a float between 0 and 1.
       * @property {number} rawValue The value expressed as an integer (between 0 and 127).
       */
      event.controller = {
        number: data1,
        name: this.getCcNameByNumber(data1)
      };

      event.value = Utilities.toNormalized(data2);
      event.rawValue = data2;

      // Also trigger channel mode message events when appropriate
      if (event.message.dataBytes[0] >= 120) this._parseChannelModeMessage(event);

    } else if (event.type === "programchange") {

      /**
       * Event emitted when a **program change** MIDI message has been received.
       *
       * @event InputChannel#programchange
       *
       * @type {Object}
       * @property {string} type `"programchange"`
       *
       * @property {InputChannel} target The object that triggered the event (the `InputChannel`
       * object).
       * @property {Message} message A `Message` object containing information about the incoming
       * MIDI message.
       * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
       * milliseconds since the navigation start of the document).
       *
       * @property {number} value The value expressed as an integer between 1 and 128.
       * @property {number} rawValue The value expressed as an integer between 0 and 127..
       */
      event.value = data1 + 1;
      event.rawValue = data1;

    } else if (event.type === "channelaftertouch") {

      /**
       * Event emitted when a control change MIDI message has been received.
       *
       * @event InputChannel#channelaftertouch
       *
       * @type {Object}
       * @property {string} type `"channelaftertouch"`
       *
       * @property {InputChannel} target The object that triggered the event (the `InputChannel`
       * object).
       * @property {Message} message A `Message` object containing information about the incoming
       * MIDI message.
       * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
       * milliseconds since the navigation start of the document).
       *
       * @property {number} value The value expressed as a float between 0 and 1.
       * @property {number} rawValue The value expressed as an integer (between 0 and 127).
       */
      event.value = Utilities.toNormalized(data1);
      event.rawValue = data1;

    } else if (event.type === "pitchbend") {

      /**
       * Event emitted when a pitch bend MIDI message has been received.
       *
       * @event InputChannel#pitchbend
       *
       * @type {Object}
       * @property {string} type `"pitchbend"`
       *
       * @property {InputChannel} target The object that triggered the event (the `InputChannel`
       * object).
       * @property {Message} message A `Message` object containing information about the incoming
       * MIDI message.
       * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
       * milliseconds since the navigation start of the document).
       *
       * @property {number} value The value expressed as a float between 0 and 1.
       * @property {number} rawValue The value expressed as an integer (between 0 and 16383).
       */
      event.value = ((data2 << 7) + data1 - 8192) / 8192;
      event.rawValue = (data2 << 7) + data1;

    } else {
      event.type = "unknownmessage";
    }

    this.emit(event.type, event);

  }

  /**
   * Returns the channel mode name matching the specified number. If no match is found, the function
   * returns `false`.
   *
   * @param {number} number An integer representing the channel mode message.
   * @returns {string|false} The name of the matching channel mode or `false` if not match could be
   * found.
   *
   * @since 2.0.0
   */
  getChannelModeByNumber(number) {

    if (WebMidi.validation) {
      number = Math.floor(number);
    }

    if ( !(number >= 120 && number <= 127) ) return false;

    for (let cm in WebMidi.MIDI_CHANNEL_MODE_MESSAGES) {

      if (
        WebMidi.MIDI_CHANNEL_MODE_MESSAGES.hasOwnProperty(cm) &&
        number === WebMidi.MIDI_CHANNEL_MODE_MESSAGES[cm]
      ) {
        return cm;
      }

    }

    return false;

  }

  _parseChannelModeMessage(e) {

    // Make a shallow copy of the incoming event so we can use it as the new event.
    const event = Object.assign({}, e);
    event.type = event.controller.name;

    /**
     * Event emitted when an "all sound off" channel-mode MIDI message has been received.
     *
     * @event InputChannel#allsoundoff
     *
     * @type {Object}
     * @property {string} type `"allsoundoff"`
     *
     * @property {InputChannel} target The object that triggered the event (the `InputChannel`
     * object).
     * @property {Message} message A `Message` object containing information about the incoming
     * MIDI message.
     * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
     * milliseconds since the navigation start of the document).
     */

    /**
     * Event emitted when a "reset all controllers" channel-mode MIDI message has been received.
     *
     * @event InputChannel#resetallcontrollers
     *
     * @type {Object}
     * @property {string} type `"resetallcontrollers"`
     *
     * @property {InputChannel} target The object that triggered the event (the `InputChannel`
     * object).
     * @property {Message} message A `Message` object containing information about the incoming
     * MIDI message.
     * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
     * milliseconds since the navigation start of the document).
     */

    /**
     * Event emitted when a "local control" channel-mode MIDI message has been received. The value
     * property of the event is set to either `true` (local control on) of `false` (local control
     * off).
     *
     * @event InputChannel#localcontrol
     *
     * @type {Object}
     * @property {string} type `"localcontrol"`
     *
     * @property {InputChannel} target The object that triggered the event (the `InputChannel`
     * object).
     * @property {Message} message A `Message` object containing information about the incoming
     * MIDI message.
     * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
     * milliseconds since the navigation start of the document).
     *
     * @property {boolean} value For local control on, the value is `true`. For local control off,
     * the value is `false`.
     */
    if (event.type === "localcontrol") {
      event.value = event.message.data[2] === 127 ? true : false;
    }

    /**
     * Event emitted when an "all notes off" channel-mode MIDI message has been received.
     *
     * @event InputChannel#allnotesoff
     *
     * @type {Object}
     * @property {string} type `"allnotesoff"`
     *
     * @property {InputChannel} target The object that triggered the event (the `InputChannel`
     * object).
     * @property {Message} message A `Message` object containing information about the incoming
     * MIDI message.
     * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
     * milliseconds since the navigation start of the document).
     */

    /**
     * Event emitted when an "omni mode" channel-mode MIDI message has been received. The value
     * property of the event is set to either `true` (omni mode on) of `false` (omni mode off).
     *
     * @event InputChannel#omnimode
     *
     * @type {Object}
     * @property {string} type `"omnimode"`
     *
     * @property {InputChannel} target The object that triggered the event (the `InputChannel`
     * object).
     * @property {Message} message A `Message` object containing information about the incoming
     * MIDI message.
     * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
     * milliseconds since the navigation start of the document).
     *
     * @property {boolean} value The value is `true` for omni mode on and false for omni mode off.
     */
    if (event.type === "omnimodeon") {
      event.type = "omnimode";
      event.value = true;
    } else if (event.type === "omnimodeoff") {
      event.type = "omnimode";
      event.value = false;
    }

    /**
     * Event emitted when a "mono/poly mode" MIDI message has been received. The value property of
     * the event is set to either `true` (mono mode on / poly mode off) or `false` (mono mode off /
     * poly mode on).
     *
     * @event InputChannel#monomode
     *
     * @type {Object}
     * @property {string} type `"monomode"`
     *
     * @property {InputChannel} target The object that triggered the event (the `InputChannel`
     * object).
     * @property {Message} message A `Message` object containing information about the incoming
     * MIDI message.
     * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
     * milliseconds since the navigation start of the document).
     *
     * @property {boolean} value The value is `true` for omni mode on and false for omni mode off.
     */
    if (event.type === "monomodeon") {
      event.type = "monomode";
      event.value = true;
    } else if (event.type === "polymodeon") {
      event.type = "monomode";
      event.value = false;
    }

    this.emit(event.type, event);

  }

  // /**
  //  * Parses channel events and constructs NRPN message parts in valid sequences.
  //  * Keeps a separate NRPN buffer for each channel.
  //  * Emits an event after it receives the final CC parts msb 127 lsb 127.
  //  * If a message is incomplete and other messages are received before
  //  * the final 127 bytes, the incomplete message is cleared.
  //  * @param e Event
  //  * @private
  //  *
  //  *
  //  * Uint8Array [ 176, 99, 12 ]
  //  * Uint8Array [ 176, 98, 34 ]
  //  * Uint8Array [ 176, 6, 56 ]
  //  * Uint8Array [ 176, 38, 78 ]
  //  * Uint8Array [ 176, 101, 127 ]
  //  * Uint8Array [ 176, 100, 127 ]
  //  */
  // _parseEventForNrpnMessage(e) {
  //
  //   if (!this.nrpnEventsEnabled) return;
  //
  //   // Extract basic data
  //   let command = e.data[0] >> 4;
  //   let channel = (e.data[0] & 0xf) + 1;
  //   let data1;
  //   let data2;
  //
  //   if (e.data.length > 1) {
  //     data1 = e.data[1];
  //     data2 = e.data.length > 2 ? e.data[2] : undefined;
  //   }
  //
  //   // Message not valid for NRPN
  //   if (
  //     !(
  //       command === WebMidi.MIDI_CHANNEL_MESSAGES.controlchange &&
  //       (
  //         (
  //           data1 >= WebMidi.MIDI_NRPN_MESSAGES.increment &&
  //           data1 <= WebMidi.MIDI_NRPN_MESSAGES.parammsb
  //         ) ||
  //         data1 === WebMidi.MIDI_NRPN_MESSAGES.entrymsb ||
  //         data1 === WebMidi.MIDI_NRPN_MESSAGES.entrylsb
  //       )
  //     )
  //   ) {
  //     return;
  //   }
  //
  //   // set up a CC event to parse as NRPN part
  //   let ccEvent = {
  //     target: this,
  //     type: "controlchange",
  //     data: Array.from(e.data),
  //     rawData: e.data,
  //     timestamp: e.timeStamp,
  //     channel: channel,
  //     controller: {
  //       number: data1,
  //       name: this.getCcNameByNumber(data1)
  //     },
  //     value: data2
  //   };
  //
  //   if (
  //     // if we get a starting MSB (CC99 - 0-126) vs an end MSB (CC99 - 127), destroy incomplete
  //     // NRPN and begin building again
  //     ccEvent.controller.number === WebMidi.MIDI_NRPN_MESSAGES.parammsb &&
  //     ccEvent.value != WebMidi.MIDI_NRPN_MESSAGES.nullactiveparameter
  //   ) {
  //     this._nrpnBuffer = [];
  //     this._nrpnBuffer[0] = ccEvent;
  //   } else if(
  //     // add the param LSB
  //     this._nrpnBuffer.length === 1 &&
  //     ccEvent.controller.number === WebMidi.MIDI_NRPN_MESSAGES.paramlsb
  //   ) {
  //     this._nrpnBuffer.push(ccEvent);
  //
  //   } else if(
  //     // add data inc/dec or value MSB for 14bit
  //     this._nrpnBuffer.length === 2 &&
  //     (ccEvent.controller.number === WebMidi.MIDI_NRPN_MESSAGES.increment ||
  //       ccEvent.controller.number === WebMidi.MIDI_NRPN_MESSAGES.decrement ||
  //       ccEvent.controller.number === WebMidi.MIDI_NRPN_MESSAGES.entrymsb)
  //   ) {
  //     this._nrpnBuffer.push(ccEvent);
  //   } else if(
  //     // if we have a value MSB, only add an LSB to pair with that
  //     this._nrpnBuffer.length === 3 &&
  //     this._nrpnBuffer[2].number === WebMidi.MIDI_NRPN_MESSAGES.entrymsb &&
  //     ccEvent.controller.number === WebMidi.MIDI_NRPN_MESSAGES.entrylsb
  //   ) {
  //     this._nrpnBuffer.push(ccEvent);
  //
  //   } else if(
  //     // add an end MSB (CC99 - 127)
  //     this._nrpnBuffer.length >= 3 &&
  //     this._nrpnBuffer.length <= 4 &&
  //     ccEvent.controller.number === WebMidi.MIDI_NRPN_MESSAGES.parammsb &&
  //     ccEvent.value === WebMidi.MIDI_NRPN_MESSAGES.nullactiveparameter
  //   ) {
  //     this._nrpnBuffer.push(ccEvent);
  //   } else if(
  //     // add an end LSB (CC99 - 127)
  //     this._nrpnBuffer.length >= 4 &&
  //     this._nrpnBuffer.length <= 5 &&
  //     ccEvent.controller.number === WebMidi.MIDI_NRPN_MESSAGES.paramlsb &&
  //     ccEvent.value === WebMidi.MIDI_NRPN_MESSAGES.nullactiveparameter
  //   ) {
  //     this._nrpnBuffer.push(ccEvent);
  //     // now we have a full inc or dec NRPN message, lets create that event!
  //
  //     let rawData = [];
  //
  //     this._nrpnBuffer.forEach(ev => rawData.push(ev.data));
  //
  //     let nrpnNumber = (this._nrpnBuffer[0].value<<7) | (this._nrpnBuffer[1].value);
  //     let nrpnValue = this._nrpnBuffer[2].value;
  //     if (this._nrpnBuffer.length === 6) {
  //       nrpnValue = (this._nrpnBuffer[2].value<<7) | (this._nrpnBuffer[3].value);
  //     }
  //
  //     let nrpnControllerType = "";
  //
  //     switch (this._nrpnBuffer[2].controller.number) {
  //     case WebMidi.MIDI_NRPN_MESSAGES.entrymsb:
  //       nrpnControllerType = InputChannel.NRPN_TYPES[0];
  //       break;
  //     case WebMidi.MIDI_NRPN_MESSAGES.increment:
  //       nrpnControllerType = InputChannel.NRPN_TYPES[1];
  //       break;
  //     case WebMidi.MIDI_NRPN_MESSAGES.decrement:
  //       nrpnControllerType = InputChannel.NRPN_TYPES[2];
  //       break;
  //     default:
  //       throw new Error("The NPRN type was unidentifiable.");
  //     }
  //
  //     // now we are done building an NRPN, so clear the NRPN buffer
  //     this._nrpnBuffer = [];
  //
  //     /**
  //      * Event emitted when a valid NRPN message sequence has been received.
  //      *
  //      * @event InputChannel#nrpn
  //      * @type {Object}
  //      * @property {InputChannel} target The `InputChannel` that triggered the event.
  //      * @property {Array} event.data The MIDI message as an array of 8 bit values.
  //      * @property {Uint8Array} event.rawData The raw MIDI message as a Uint8Array.
  //      * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred
  //      * (in milliseconds since the navigation start of the document).
  //      * @property {string} type `"nrpn"`
  //      * @property {Object} controller
  //      * @property {Object} controller.number The number of the NRPN.
  //      * @property {Object} controller.name The usual name or function of the controller.
  //      * @property {number} value The aftertouch amount expressed as a float between 0 and 1.
  //      * @property {number} rawValue The aftertouch amount expressed as an integer (between 0 and
  //      * 65535).
  //      */
  //     let nrpnEvent = {
  //       timestamp: ccEvent.timestamp,
  //       channel: ccEvent.channel,
  //       type: "nrpn",
  //       data: Array.from(rawData),
  //       rawData: rawData,
  //       controller: {
  //         number: nrpnNumber,
  //         type: nrpnControllerType,
  //         name: "Non-Registered Parameter " + nrpnNumber
  //       },
  //       value: nrpnValue / 65535,
  //       rawValue: nrpnValue
  //     };
  //
  //     this.emit(nrpnEvent.type, nrpnEvent);
  //
  //   } else {
  //     // something didn't match, clear the incomplete NRPN message buffer
  //     this._nrpnBuffer = [];
  //   }
  // }

  /**
   * Returns the name of a control change message matching the specified number. Some valid control
   * change numbers do not have a specific name or purpose assigned in the MIDI
   * [spec](https://midi.org/specifications-old/item/table-3-control-change-messages-data-bytes-2).
   * In this case, the method returns `false`.
   *
   * @param {number} number An integer representing the control change message
   * @returns {string|undefined} The matching control change name or `undefined` if not match was
   * found.
   *
   * @throws {RangeError} Invalid control change number.
   *
   * @since 2.0.0
   */
  getCcNameByNumber(number) {

    if (WebMidi.validation) {
      number = parseInt(number);
      if ( !(number >= 0 && number <= 127) ) throw new RangeError("Invalid control change number.");
    }

    return Utilities.getPropertyByValue(WebMidi.MIDI_CONTROL_CHANGE_MESSAGES, number);

  }

  /**
   * An integer to offset the reported octave of incoming note-specific messages (`noteon`,
   * `noteoff` and `keyaftertouch`). By default, middle C (MIDI note number 60) is placed on the 4th
   * octave (C4).
   *
   * If, for example, `octaveOffset` is set to 2, MIDI note number 60 will be reported as C6. If
   * `octaveOffset` is set to -1, MIDI note number 60 will be reported as C3.
   *
   * Note that this value is combined with the global offset value defined on the `WebMidi` object
   * and with the value defined on the parent `Input` object.
   *
   * @type {number}
   *
   * @since 3.0
   */
  get octaveOffset() {
    return this._octaveOffset;
  }
  set octaveOffset(value) {

    if (this.validation) {
      value = parseInt(value);
      if (isNaN(value)) throw new TypeError("The 'octaveOffset' property must be an integer.");
    }

    this._octaveOffset = value;

  }

  /**
   * The {@link Input} this channel belongs to
   * @type {Input}
   * @since 3.0
   */
  get input() {
    return this._input;
  }

  /**
   * This channel's MIDI number (1-16)
   * @type {number}
   * @since 3.0
   */
  get number() {
    return this._number;
  }

  // /**
  //  * An `OutputChannel` object (or a list of `OutputChannel` objects) to send a copy of all
  //  * inbound messages to. This is inspired by the THRU port on numerous MIDI devices.
  //  *
  //  * To stop forwarding messages, simply set `forwardTo` to `undefined` or `null`.
  //  *
  //  * If you want to forward messages from all channels of an input, you should instead use the
  //  * input's [forwardTo]{@link Input#forwardTo} property.
  //  *
  //  * @type {OutputChannel|[OutputChannel]}
  //  * @readonly
  //  */
  // get forwardTo() {
  //   return this._forwardTo;
  // }
  // set forwardTo(value) {
  //
  //   // @todo THIS NEEDS TO BE COMPLETED!!!
  //
  //   if (value === undefined || value === null) {
  //     this._forwardTo = undefined;
  //     return;
  //   }
  //
  //   if (!Array.isArray(value)) value = [value];
  //
  //   if (this.validation) {
  //     value.forEach(v => {
  //       // if (typeof v)
  //       console.log(typeof v);
  //     });
  //   }
  //
  //   this._forwardTo = value;
  //
  // }

  // /**
  //  * Indicates whether events for **Non-Registered Parameter Number** should be dispatched. NRPNs
  //  * are composed of a sequence of specific **control change** messages. When a valid sequence of
  //  * such control change messages is received, an `nrpn` event will fire. If an invalid or out of
  //  * order control change message is received, it will fall through the collector logic and all
  //  * buffered control change messages will be discarded as incomplete.
  //  *
  //  * @type Boolean
  //  */
  // get nrpnEventsEnabled() {
  //   return this._nrpnEventsEnabled;
  // }
  // set nrpnEventsEnabled(enabled) {
  //   this._nrpnEventsEnabled = !!enabled;
  // }

  // /**
  //  * Array of valid **non-registered parameter number** (NRPNs) types.
  //  *
  //  * @type {string[]}
  //  * @readonly
  //  */
  // static get NRPN_TYPES() {
  //   return ["entry", "increment", "decrement"];
  // }

}
