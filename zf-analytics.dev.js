(function () {
    'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol, Iterator */


    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    const defaultConfig = {
        eventEndpoint: 'https://events.zerofirst.io/api/v1/gateway/events',
        writeKey: ''
    };

    class ValidationError extends Error {
        constructor(field, message) {
            super(`${field} ${message}`);
            this.field = field;
        }
    }

    function isDefined(value) {
        return value !== undefined && value !== null;
    }
    function isObject(value) {
        return typeof value === 'object';
    }
    function isString(value) {
        return typeof value === 'string';
    }
    function isNumber(value) {
        return typeof value === 'number';
    }
    function isValidUserId(userId) {
        return isString(userId) || isNumber(userId);
    }
    function isPlainObject(value) {
        return (value !== null &&
            typeof value === 'object' &&
            Object.prototype.toString.call(value) === '[object Object]');
    }
    function isValidProperties(value) {
        if (value === null || value === undefined)
            return true;
        return isPlainObject(value);
    }

    const byteToHex = [];
    for (let i = 0; i < 256; ++i) {
        byteToHex.push((i + 0x100).toString(16).slice(1));
    }
    function unsafeStringify(arr, offset = 0) {
        return (byteToHex[arr[offset + 0]] +
            byteToHex[arr[offset + 1]] +
            byteToHex[arr[offset + 2]] +
            byteToHex[arr[offset + 3]] +
            '-' +
            byteToHex[arr[offset + 4]] +
            byteToHex[arr[offset + 5]] +
            '-' +
            byteToHex[arr[offset + 6]] +
            byteToHex[arr[offset + 7]] +
            '-' +
            byteToHex[arr[offset + 8]] +
            byteToHex[arr[offset + 9]] +
            '-' +
            byteToHex[arr[offset + 10]] +
            byteToHex[arr[offset + 11]] +
            byteToHex[arr[offset + 12]] +
            byteToHex[arr[offset + 13]] +
            byteToHex[arr[offset + 14]] +
            byteToHex[arr[offset + 15]]).toLowerCase();
    }

    let getRandomValues;
    const rnds8 = new Uint8Array(16);
    function rng() {
        if (!getRandomValues) {
            if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
                throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
            }
            getRandomValues = crypto.getRandomValues.bind(crypto);
        }
        return getRandomValues(rnds8);
    }

    const randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
    var native = { randomUUID };

    function v4(options, buf, offset) {
        if (native.randomUUID && !buf && !options) {
            return native.randomUUID();
        }
        options = options || {};
        const rnds = options.random || (options.rng || rng)();
        rnds[6] = (rnds[6] & 0x0f) | 0x40;
        rnds[8] = (rnds[8] & 0x3f) | 0x80;
        return unsafeStringify(rnds);
    }

    class EventFactory {
        constructor(user) {
            this.user = user;
        }
        identify(userId, traits) {
            const event = {
                type: 'identify',
                userId,
                traits: traits || undefined,
            };
            this.validate(event);
            return this.populateEvent(event);
        }
        page(name, properties, ctx) {
            let prop = properties || {};
            prop = Object.assign(Object.assign({}, ctx), prop);
            const event = {
                type: 'page',
                name: name || undefined,
                properties: prop,
            };
            this.validate(event);
            return this.populateEvent(event);
        }
        track(eventName, properties) {
            const event = {
                type: 'track',
                event: eventName,
                properties: properties || undefined,
            };
            this.validate(event);
            return this.populateEvent(event);
        }
        populateEvent(event) {
            event.anonymousId = this.user.getAnonymousId();
            event.userId = this.user.getUserId();
            event.timestamp = new Date().toISOString();
            event.messageId = v4();
            return event;
        }
        validate(event) {
            if (!isDefined(event)) {
                throw new ValidationError('event', 'Event is null or undefined');
            }
            if (!isObject(event)) {
                throw new ValidationError('event', 'Event is not an object');
            }
            if (!isString(event.type)) {
                throw new ValidationError('event.type', 'Event type is required');
            }
            if (isDefined(event.userId) &&
                !isValidUserId(event.userId)) {
                throw new ValidationError('event.userId', 'Event userId must be a string or number');
            }
            if (event.type === 'identify') {
                if (!isPlainObject(event.traits)) {
                    throw new ValidationError('event.traits', 'Event traits must be an object');
                }
            }
            else if (event.type === 'track') {
                if (!isString(event.event)) {
                    throw new ValidationError('event.event', 'Event field "event" is required and must be a string for track events');
                }
                if (!isValidProperties(event.properties)) {
                    throw new ValidationError('event.properties', 'Event properties must be an object');
                }
            }
            else if (event.type === 'page') {
                if (isDefined(event.name) && !isString(event.name)) {
                    throw new ValidationError('event.name', 'Event field "name" must be a string');
                }
                if (!isValidProperties(event.properties)) {
                    throw new ValidationError('event.properties', 'Event properties must be an object');
                }
            }
        }
    }

    function getPageContext() {
        return {
            url: window.location.href,
            title: document.title,
        };
    }

    /*! js-cookie v3.0.5 | MIT */
    /* eslint-disable no-var */
    function assign (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          target[key] = source[key];
        }
      }
      return target
    }
    /* eslint-enable no-var */

    /* eslint-disable no-var */
    var defaultConverter = {
      read: function (value) {
        if (value[0] === '"') {
          value = value.slice(1, -1);
        }
        return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
      },
      write: function (value) {
        return encodeURIComponent(value).replace(
          /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
          decodeURIComponent
        )
      }
    };
    /* eslint-enable no-var */

    /* eslint-disable no-var */

    function init (converter, defaultAttributes) {
      function set (name, value, attributes) {
        if (typeof document === 'undefined') {
          return
        }

        attributes = assign({}, defaultAttributes, attributes);

        if (typeof attributes.expires === 'number') {
          attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
        }
        if (attributes.expires) {
          attributes.expires = attributes.expires.toUTCString();
        }

        name = encodeURIComponent(name)
          .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
          .replace(/[()]/g, escape);

        var stringifiedAttributes = '';
        for (var attributeName in attributes) {
          if (!attributes[attributeName]) {
            continue
          }

          stringifiedAttributes += '; ' + attributeName;

          if (attributes[attributeName] === true) {
            continue
          }

          // Considers RFC 6265 section 5.2:
          // ...
          // 3.  If the remaining unparsed-attributes contains a %x3B (";")
          //     character:
          // Consume the characters of the unparsed-attributes up to,
          // not including, the first %x3B (";") character.
          // ...
          stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
        }

        return (document.cookie =
          name + '=' + converter.write(value, name) + stringifiedAttributes)
      }

      function get (name) {
        if (typeof document === 'undefined' || (arguments.length && !name)) {
          return
        }

        // To prevent the for loop in the first place assign an empty array
        // in case there are no cookies at all.
        var cookies = document.cookie ? document.cookie.split('; ') : [];
        var jar = {};
        for (var i = 0; i < cookies.length; i++) {
          var parts = cookies[i].split('=');
          var value = parts.slice(1).join('=');

          try {
            var found = decodeURIComponent(parts[0]);
            jar[found] = converter.read(value, found);

            if (name === found) {
              break
            }
          } catch (e) {}
        }

        return name ? jar[name] : jar
      }

      return Object.create(
        {
          set,
          get,
          remove: function (name, attributes) {
            set(
              name,
              '',
              assign({}, attributes, {
                expires: -1
              })
            );
          },
          withAttributes: function (attributes) {
            return init(this.converter, assign({}, this.attributes, attributes))
          },
          withConverter: function (converter) {
            return init(assign({}, this.converter, converter), this.attributes)
          }
        },
        {
          attributes: { value: Object.freeze(defaultAttributes) },
          converter: { value: Object.freeze(converter) }
        }
      )
    }

    var api = init(defaultConverter, { path: '/' });

    class LocalStore {
        get(key) {
            return localStorage.getItem(key);
        }
        set(key, value) {
            localStorage.setItem(key, value);
        }
        delete(key) {
            localStorage.removeItem(key);
        }
    }
    class CookieStore {
        constructor() {
            this.defaultOptions = {
                expires: 365,
                path: '/',
            };
        }
        get(key) {
            const value = api.get(key);
            return value ? value : null;
        }
        set(key, value) {
            api.set(key, value, this.defaultOptions);
        }
        delete(key) {
            api.remove(key, this.defaultOptions);
        }
    }
    class Storage {
        constructor(stores) {
            this.stores = stores;
        }
        get(key) {
            for (const store of this.stores) {
                const value = store.get(key);
                if (value)
                    return value;
            }
            return null;
        }
        set(key, value) {
            for (const store of this.stores) {
                store.set(key, value);
            }
        }
        delete(key) {
            for (const store of this.stores) {
                store.delete(key);
            }
        }
        getAndSync(key) {
            const value = this.get(key);
            if (value)
                this.set(key, value);
            return value;
        }
    }

    class User {
        constructor(storage) {
            this.userIdKey = 'zf_userId';
            this.anonymousIdKey = 'zf_anonymousId';
            this.storage = storage;
            this.getAnonymousId();
        }
        getUserId() {
            return this.storage.getAndSync(this.userIdKey);
        }
        setUserId(userId) {
            const prevId = this.storage.getAndSync(this.userIdKey);
            if (userId) {
                this.storage.set(this.userIdKey, userId);
                if (prevId !== userId && prevId !== null && prevId !== null) {
                    this.storage.delete(this.anonymousIdKey);
                }
            }
            else {
                this.storage.delete(this.userIdKey);
            }
        }
        getAnonymousId() {
            const value = this.storage.getAndSync(this.anonymousIdKey);
            if (value) {
                return value;
            }
            this.setAnonymousId(v4());
            return this.storage.getAndSync(this.anonymousIdKey);
        }
        setAnonymousId(anonymousId) {
            if (anonymousId) {
                this.storage.set(this.anonymousIdKey, anonymousId);
            }
            else {
                this.storage.delete(this.anonymousIdKey);
            }
        }
        identify(userId) {
            if (userId !== undefined && isValidUserId(userId)) {
                this.setUserId(userId);
            }
        }
    }

    class Analytics {
        constructor(options = {}) {
            console.log('Initializing Analytics');
            this.settings = Object.assign(Object.assign({}, defaultConfig), options);
            const stores = [new CookieStore(), new LocalStore()];
            this.storage = new Storage(stores);
            this._user = new User(this.storage);
            this._eventFactory = new EventFactory(this._user);
            console.log(this.settings.writeKey, this.settings, options);
        }
        identify(userIdOrTraits_1) {
            return __awaiter(this, arguments, void 0, function* (userIdOrTraits, traits = {}) {
                let userId;
                let finalTraits = {};
                if (typeof userIdOrTraits === 'object') {
                    userId = undefined;
                    if (userIdOrTraits !== null) {
                        finalTraits = userIdOrTraits;
                    }
                }
                else {
                    userId = userIdOrTraits;
                    finalTraits = traits;
                }
                this._user.identify(userId);
                const event = this._eventFactory.identify(userId, finalTraits);
                yield this.sendEvent(event);
            });
        }
        page(name_1) {
            return __awaiter(this, arguments, void 0, function* (name, properties = {}) {
                const ctx = getPageContext();
                const event = this._eventFactory.page(name, properties, ctx);
                yield this.sendEvent(event);
            });
        }
        track(event_1) {
            return __awaiter(this, arguments, void 0, function* (event, properties = {}) {
                const eventObj = this._eventFactory.track(event, properties);
                yield this.sendEvent(eventObj);
            });
        }
        sendEvent(event) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield fetch(this.settings.eventEndpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-Api-Key': this.settings.writeKey },
                        body: JSON.stringify(event),
                    });
                    if (!response.ok)
                        throw new Error(`HTTP error! status: ${response.status}`);
                }
                catch (error) {
                    console.error('Failed to send event:', error);
                    throw error;
                }
            });
        }
    }

    const win = window;
    if (win.analytics && win.analytics.initialized) {
        console.warn('Analytics has already been initialized');
    }
    else {
        const analytics = new Analytics({
            writeKey: '7KMB5dEHVEUfsp9V14ghbXA6HTF0tAqY'
        });
        win.analytics = analytics;
        win.analytics.initialized = true;
    }

})();
//# sourceMappingURL=zf-analytics.dev.js.map
