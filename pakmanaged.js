var global = Function("return this;")()
/*!
  * Ender: open module JavaScript framework (client-lib)
  * copyright Dustin Diaz & Jacob Thornton 2011 (@ded @fat)
  * http://ender.no.de
  * License MIT
  */
!function (context) {

  // a global object for node.js module compatiblity
  // ============================================

  context['global'] = context

  // Implements simple module system
  // losely based on CommonJS Modules spec v1.1.1
  // ============================================

  var modules = {}
    , old = context.$

  function require (identifier) {
    // modules can be required from ender's build system, or found on the window
    var module = modules[identifier] || window[identifier]
    if (!module) throw new Error("Requested module '" + identifier + "' has not been defined.")
    return module
  }

  function provide (name, what) {
    return (modules[name] = what)
  }

  context['provide'] = provide
  context['require'] = require

  function aug(o, o2) {
    for (var k in o2) k != 'noConflict' && k != '_VERSION' && (o[k] = o2[k])
    return o
  }

  function boosh(s, r, els) {
    // string || node || nodelist || window
    if (typeof s == 'string' || s.nodeName || (s.length && 'item' in s) || s == window) {
      els = ender._select(s, r)
      els.selector = s
    } else els = isFinite(s.length) ? s : [s]
    return aug(els, boosh)
  }

  function ender(s, r) {
    return boosh(s, r)
  }

  aug(ender, {
      _VERSION: '0.3.6'
    , fn: boosh // for easy compat to jQuery plugins
    , ender: function (o, chain) {
        aug(chain ? boosh : ender, o)
      }
    , _select: function (s, r) {
        return (r || document).querySelectorAll(s)
      }
  })

  aug(boosh, {
    forEach: function (fn, scope, i) {
      // opt out of native forEach so we can intentionally call our own scope
      // defaulting to the current item and be able to return self
      for (i = 0, l = this.length; i < l; ++i) i in this && fn.call(scope || this[i], this[i], i, this)
      // return self for chaining
      return this
    },
    $: ender // handy reference to self
  })

  ender.noConflict = function () {
    context.$ = old
    return this
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = ender
  // use subscript notation as extern for Closure compilation
  context['ender'] = context['$'] = context['ender'] || ender

}(this);
// ender:querystring as querystring
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.
  
  // Query String Utilities
  
  (typeof define === "undefined" ? function($) { $(require, exports, module) } : define)(function(require, exports, module, undefined) {
  "use strict";
  
  var QueryString = exports;
  
  function charCode(c) {
    return c.charCodeAt(0);
  }
  
  QueryString.unescape = decodeURIComponent;
  QueryString.escape = encodeURIComponent;
  
  var stringifyPrimitive = function(v) {
    switch (typeof v) {
      case 'string':
        return v;
  
      case 'boolean':
        return v ? 'true' : 'false';
  
      case 'number':
        return isFinite(v) ? v : '';
  
      default:
        return '';
    }
  };
  
  
  QueryString.stringify = QueryString.encode = function(obj, sep, eq, name) {
    sep = sep || '&';
    eq = eq || '=';
    obj = (obj === null) ? undefined : obj;
  
    switch (typeof obj) {
      case 'object':
        return Object.keys(obj).map(function(k) {
          if (Array.isArray(obj[k])) {
            return obj[k].map(function(v) {
              return QueryString.escape(stringifyPrimitive(k)) +
                     eq +
                     QueryString.escape(stringifyPrimitive(v));
            }).join(sep);
          } else {
            return QueryString.escape(stringifyPrimitive(k)) +
                   eq +
                   QueryString.escape(stringifyPrimitive(obj[k]));
          }
        }).join(sep);
  
      default:
        if (!name) return '';
        return QueryString.escape(stringifyPrimitive(name)) + eq +
               QueryString.escape(stringifyPrimitive(obj));
    }
  };
  
  // Parse a key=val string.
  QueryString.parse = QueryString.decode = function(qs, sep, eq) {
    sep = sep || '&';
    eq = eq || '=';
    var obj = {};
  
    if (typeof qs !== 'string' || qs.length === 0) {
      return obj;
    }
  
    qs.split(sep).forEach(function(kvp) {
      var x = kvp.split(eq);
      var k = QueryString.unescape(x[0], true);
      var v = QueryString.unescape(x.slice(1).join(eq), true);
  
      if (!(k in obj)) {
        obj[k] = v;
      } else if (!Array.isArray(obj[k])) {
        obj[k] = [obj[k], v];
      } else {
        obj[k].push(v);
      }
    });
  
    return obj;
  };
  
  });
  

  provide("querystring", module.exports);
  provide("querystring", module.exports);
  $.ender(module.exports);
}(global));

// ender:punycode as punycode
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*! http://mths.be/punycode by @mathias */
  ;(function(root) {
  
  	/**
  	 * The `punycode` object.
  	 * @name punycode
  	 * @type Object
  	 */
  	var punycode,
  
  	/** Detect free variables `define`, `exports`, `module` and `require` */
  	freeDefine = typeof define == 'function' && typeof define.amd == 'object' &&
  		define.amd && define,
  	freeExports = typeof exports == 'object' && exports,
  	freeModule = typeof module == 'object' && module,
  	freeRequire = typeof require == 'function' && require,
  
  	/** Highest positive signed 32-bit float value */
  	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1
  
  	/** Bootstring parameters */
  	base = 36,
  	tMin = 1,
  	tMax = 26,
  	skew = 38,
  	damp = 700,
  	initialBias = 72,
  	initialN = 128, // 0x80
  	delimiter = '-', // '\x2D'
  
  	/** Regular expressions */
  	regexNonASCII = /[^ -~]/, // unprintable ASCII chars + non-ASCII chars
  	regexPunycode = /^xn--/,
  
  	/** Error messages */
  	errors = {
  		'overflow': 'Overflow: input needs wider integers to process.',
  		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
  		'invalid-input': 'Invalid input'
  	},
  
  	/** Convenience shortcuts */
  	baseMinusTMin = base - tMin,
  	floor = Math.floor,
  	stringFromCharCode = String.fromCharCode,
  
  	/** Temporary variable */
  	key;
  
  	/*--------------------------------------------------------------------------*/
  
  	/**
  	 * A generic error utility function.
  	 * @private
  	 * @param {String} type The error type.
  	 * @returns {Error} Throws a `RangeError` with the applicable error message.
  	 */
  	function error(type) {
  		throw RangeError(errors[type]);
  	}
  
  	/**
  	 * A generic `Array#map` utility function.
  	 * @private
  	 * @param {Array} array The array to iterate over.
  	 * @param {Function} callback The function that gets called for every array
  	 * item.
  	 * @returns {Array} A new array of values returned by the callback function.
  	 */
  	function map(array, fn) {
  		var length = array.length;
  		while (length--) {
  			array[length] = fn(array[length]);
  		}
  		return array;
  	}
  
  	/**
  	 * A simple `Array#map`-like wrapper to work with domain name strings.
  	 * @private
  	 * @param {String} domain The domain name.
  	 * @param {Function} callback The function that gets called for every
  	 * character.
  	 * @returns {Array} A new string of characters returned by the callback
  	 * function.
  	 */
  	function mapDomain(string, fn) {
  		var glue = '.';
  		return map(string.split(glue), fn).join(glue);
  	}
  
  	/**
  	 * Creates an array containing the decimal code points of each Unicode
  	 * character in the string. While JavaScript uses UCS-2 internally,
  	 * this function will convert a pair of surrogate halves (each of which
  	 * UCS-2 exposes as separate characters) into a single code point,
  	 * matching UTF-16.
  	 * @see `punycode.ucs2.encode`
  	 * @see <http://mathiasbynens.be/notes/javascript-encoding>
  	 * @memberOf punycode.ucs2
  	 * @name decode
  	 * @param {String} string The Unicode input string (UCS-2).
  	 * @returns {Array} The new array of code points.
  	 */
  	function ucs2decode(string) {
  		var output = [],
  		    counter = 0,
  		    length = string.length,
  		    value,
  		    extra;
  		while (counter < length) {
  			value = string.charCodeAt(counter++);
  			if ((value & 0xF800) == 0xD800 && counter < length) {
  				// high surrogate, and there is a next character
  				extra = string.charCodeAt(counter++);
  				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
  					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
  				} else {
  					output.push(value, extra);
  				}
  			} else {
  				output.push(value);
  			}
  		}
  		return output;
  	}
  
  	/**
  	 * Creates a string based on an array of decimal code points.
  	 * @see `punycode.ucs2.decode`
  	 * @memberOf punycode.ucs2
  	 * @name encode
  	 * @param {Array} codePoints The array of decimal code points.
  	 * @returns {String} The new Unicode string (UCS-2).
  	 */
  	function ucs2encode(array) {
  		return map(array, function(value) {
  			var output = '';
  			if (value > 0xFFFF) {
  				value -= 0x10000;
  				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
  				value = 0xDC00 | value & 0x3FF;
  			}
  			output += stringFromCharCode(value);
  			return output;
  		}).join('');
  	}
  
  	/**
  	 * Converts a basic code point into a digit/integer.
  	 * @see `digitToBasic()`
  	 * @private
  	 * @param {Number} codePoint The basic (decimal) code point.
  	 * @returns {Number} The numeric value of a basic code point (for use in
  	 * representing integers) in the range `0` to `base - 1`, or `base` if
  	 * the code point does not represent a value.
  	 */
  	function basicToDigit(codePoint) {
  		return codePoint - 48 < 10
  			? codePoint - 22
  			: codePoint - 65 < 26
  				? codePoint - 65
  				: codePoint - 97 < 26
  					? codePoint - 97
  					: base;
  	}
  
  	/**
  	 * Converts a digit/integer into a basic code point.
  	 * @see `basicToDigit()`
  	 * @private
  	 * @param {Number} digit The numeric value of a basic code point.
  	 * @returns {Number} The basic code point whose value (when used for
  	 * representing integers) is `digit`, which needs to be in the range
  	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
  	 * used; else, the lowercase form is used. The behavior is undefined
  	 * if flag is non-zero and `digit` has no uppercase form.
  	 */
  	function digitToBasic(digit, flag) {
  		//  0..25 map to ASCII a..z or A..Z
  		// 26..35 map to ASCII 0..9
  		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
  	}
  
  	/**
  	 * Bias adaptation function as per section 3.4 of RFC 3492.
  	 * http://tools.ietf.org/html/rfc3492#section-3.4
  	 * @private
  	 */
  	function adapt(delta, numPoints, firstTime) {
  		var k = 0;
  		delta = firstTime ? floor(delta / damp) : delta >> 1;
  		delta += floor(delta / numPoints);
  		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
  			delta = floor(delta / baseMinusTMin);
  		}
  		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
  	}
  
  	/**
  	 * Converts a basic code point to lowercase is `flag` is falsy, or to
  	 * uppercase if `flag` is truthy. The code point is unchanged if it's
  	 * caseless. The behavior is undefined if `codePoint` is not a basic code
  	 * point.
  	 * @private
  	 * @param {Number} codePoint The numeric value of a basic code point.
  	 * @returns {Number} The resulting basic code point.
  	 */
  	function encodeBasic(codePoint, flag) {
  		codePoint -= (codePoint - 97 < 26) << 5;
  		return codePoint + (!flag && codePoint - 65 < 26) << 5;
  	}
  
  	/**
  	 * Converts a Punycode string of ASCII code points to a string of Unicode
  	 * code points.
  	 * @memberOf punycode
  	 * @param {String} input The Punycode string of ASCII code points.
  	 * @returns {String} The resulting string of Unicode code points.
  	 */
  	function decode(input) {
  		// Don't use UCS-2
  		var output = [],
  		    inputLength = input.length,
  		    out,
  		    i = 0,
  		    n = initialN,
  		    bias = initialBias,
  		    basic,
  		    j,
  		    index,
  		    oldi,
  		    w,
  		    k,
  		    digit,
  		    t,
  		    length,
  		    /** Cached calculation results */
  		    baseMinusT;
  
  		// Handle the basic code points: let `basic` be the number of input code
  		// points before the last delimiter, or `0` if there is none, then copy
  		// the first basic code points to the output.
  
  		basic = input.lastIndexOf(delimiter);
  		if (basic < 0) {
  			basic = 0;
  		}
  
  		for (j = 0; j < basic; ++j) {
  			// if it's not a basic code point
  			if (input.charCodeAt(j) >= 0x80) {
  				error('not-basic');
  			}
  			output.push(input.charCodeAt(j));
  		}
  
  		// Main decoding loop: start just after the last delimiter if any basic code
  		// points were copied; start at the beginning otherwise.
  
  		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {
  
  			// `index` is the index of the next character to be consumed.
  			// Decode a generalized variable-length integer into `delta`,
  			// which gets added to `i`. The overflow checking is easier
  			// if we increase `i` as we go, then subtract off its starting
  			// value at the end to obtain `delta`.
  			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {
  
  				if (index >= inputLength) {
  					error('invalid-input');
  				}
  
  				digit = basicToDigit(input.charCodeAt(index++));
  
  				if (digit >= base || digit > floor((maxInt - i) / w)) {
  					error('overflow');
  				}
  
  				i += digit * w;
  				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
  
  				if (digit < t) {
  					break;
  				}
  
  				baseMinusT = base - t;
  				if (w > floor(maxInt / baseMinusT)) {
  					error('overflow');
  				}
  
  				w *= baseMinusT;
  
  			}
  
  			out = output.length + 1;
  			bias = adapt(i - oldi, out, oldi == 0);
  
  			// `i` was supposed to wrap around from `out` to `0`,
  			// incrementing `n` each time, so we'll fix that now:
  			if (floor(i / out) > maxInt - n) {
  				error('overflow');
  			}
  
  			n += floor(i / out);
  			i %= out;
  
  			// Insert `n` at position `i` of the output
  			output.splice(i++, 0, n);
  
  		}
  
  		return ucs2encode(output);
  	}
  
  	/**
  	 * Converts a string of Unicode code points to a Punycode string of ASCII
  	 * code points.
  	 * @memberOf punycode
  	 * @param {String} input The string of Unicode code points.
  	 * @returns {String} The resulting Punycode string of ASCII code points.
  	 */
  	function encode(input) {
  		var n,
  		    delta,
  		    handledCPCount,
  		    basicLength,
  		    bias,
  		    j,
  		    m,
  		    q,
  		    k,
  		    t,
  		    currentValue,
  		    output = [],
  		    /** `inputLength` will hold the number of code points in `input`. */
  		    inputLength,
  		    /** Cached calculation results */
  		    handledCPCountPlusOne,
  		    baseMinusT,
  		    qMinusT;
  
  		// Convert the input in UCS-2 to Unicode
  		input = ucs2decode(input);
  
  		// Cache the length
  		inputLength = input.length;
  
  		// Initialize the state
  		n = initialN;
  		delta = 0;
  		bias = initialBias;
  
  		// Handle the basic code points
  		for (j = 0; j < inputLength; ++j) {
  			currentValue = input[j];
  			if (currentValue < 0x80) {
  				output.push(stringFromCharCode(currentValue));
  			}
  		}
  
  		handledCPCount = basicLength = output.length;
  
  		// `handledCPCount` is the number of code points that have been handled;
  		// `basicLength` is the number of basic code points.
  
  		// Finish the basic string - if it is not empty - with a delimiter
  		if (basicLength) {
  			output.push(delimiter);
  		}
  
  		// Main encoding loop:
  		while (handledCPCount < inputLength) {
  
  			// All non-basic code points < n have been handled already. Find the next
  			// larger one:
  			for (m = maxInt, j = 0; j < inputLength; ++j) {
  				currentValue = input[j];
  				if (currentValue >= n && currentValue < m) {
  					m = currentValue;
  				}
  			}
  
  			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
  			// but guard against overflow
  			handledCPCountPlusOne = handledCPCount + 1;
  			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
  				error('overflow');
  			}
  
  			delta += (m - n) * handledCPCountPlusOne;
  			n = m;
  
  			for (j = 0; j < inputLength; ++j) {
  				currentValue = input[j];
  
  				if (currentValue < n && ++delta > maxInt) {
  					error('overflow');
  				}
  
  				if (currentValue == n) {
  					// Represent delta as a generalized variable-length integer
  					for (q = delta, k = base; /* no condition */; k += base) {
  						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
  						if (q < t) {
  							break;
  						}
  						qMinusT = q - t;
  						baseMinusT = base - t;
  						output.push(
  							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
  						);
  						q = floor(qMinusT / baseMinusT);
  					}
  
  					output.push(stringFromCharCode(digitToBasic(q, 0)));
  					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
  					delta = 0;
  					++handledCPCount;
  				}
  			}
  
  			++delta;
  			++n;
  
  		}
  		return output.join('');
  	}
  
  	/**
  	 * Converts a Punycode string representing a domain name to Unicode. Only the
  	 * Punycoded parts of the domain name will be converted, i.e. it doesn't
  	 * matter if you call it on a string that has already been converted to
  	 * Unicode.
  	 * @memberOf punycode
  	 * @param {String} domain The Punycode domain name to convert to Unicode.
  	 * @returns {String} The Unicode representation of the given Punycode
  	 * string.
  	 */
  	function toUnicode(domain) {
  		return mapDomain(domain, function(string) {
  			return regexPunycode.test(string)
  				? decode(string.slice(4).toLowerCase())
  				: string;
  		});
  	}
  
  	/**
  	 * Converts a Unicode string representing a domain name to Punycode. Only the
  	 * non-ASCII parts of the domain name will be converted, i.e. it doesn't
  	 * matter if you call it with a domain that's already in ASCII.
  	 * @memberOf punycode
  	 * @param {String} domain The domain name to convert, as a Unicode string.
  	 * @returns {String} The Punycode representation of the given domain name.
  	 */
  	function toASCII(domain) {
  		return mapDomain(domain, function(string) {
  			return regexNonASCII.test(string)
  				? 'xn--' + encode(string)
  				: string;
  		});
  	}
  
  	/*--------------------------------------------------------------------------*/
  
  	/** Define the public API */
  	punycode = {
  		/**
  		 * A string representing the current Punycode.js version number.
  		 * @memberOf punycode
  		 * @type String
  		 */
  		'version': '1.1.1',
  		/**
  		 * An object of methods to convert from JavaScript's internal character
  		 * representation (UCS-2) to decimal Unicode code points, and back.
  		 * @see <http://mathiasbynens.be/notes/javascript-encoding>
  		 * @memberOf punycode
  		 * @type Object
  		 */
  		'ucs2': {
  			'decode': ucs2decode,
  			'encode': ucs2encode
  		},
  		'decode': decode,
  		'encode': encode,
  		'toASCII': toASCII,
  		'toUnicode': toUnicode
  	};
  
  	/** Expose `punycode` */
  	if (freeExports) {
  		if (freeModule && freeModule.exports == freeExports) {
  			// in Node.js or Ringo 0.8+
  			freeModule.exports = punycode;
  		} else {
  			// in Narwhal or Ringo 0.7-
  			for (key in punycode) {
  				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
  			}
  		}
  	} else if (freeDefine) {
  		// via curl.js or RequireJS
  		define('punycode', punycode);
  	} else {
  		// in a browser or Rhino
  		root.punycode = punycode;
  	}
  
  }(this));

  provide("punycode", module.exports);
  provide("punycode", module.exports);
  $.ender(module.exports);
}(global));

// ender:future as future
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jshint laxcomma:true node:true es5:true onevar:true */
  (function () {
    "use strict";
  
    var MAX_INT = Math.pow(2,52);
  
    function isFuture(obj) {
      return obj instanceof Future;
    }
  
    function FutureTimeoutException(time) {
      this.name = "FutureTimeout";
      this.message = "timeout " + time + "ms";
    }
  
    //
    function privatize(obj, pubs) {
      var result = {};
      pubs.forEach(function (pub) {
        result[pub] = function () {
          obj[pub].apply(obj, arguments);
          return result;
        };
      });
      return result;
    }
  
    function Future(global_context, options) {
      if (!isFuture(this)) {
        return new Future(global_context, options);
      }
  
      var self = this
        ;
        
      self._everytimers = {};
      self._onetimers = {};
      self._index = 0;
      self._deliveries = 0;
      self._time = 0;
      //self._asap = false;
      self._asap =  true;
  
      //self._data;
      //self._timeout_id;
  
      self._passenger = null;
      self.fulfilled = false;
  
      self._global_context = global_context;
  
      // TODO change `null` to `this`
      self._global_context = ('undefined' === typeof self._global_context ? null : self._global_context);
  
      self._options = options || {};
      self._options.error = self._options.error || function (err) {
        throw err;
      };
  
      self.errback = function () {
        if (arguments.length < 2) {
          self.deliver.call(self, arguments[0] || new Error("`errback` called without Error"));
        } else {
          self.deliver.apply(self, arguments);
        }
      };
  
      self.callback = function () {
        var args = Array.prototype.slice.call(arguments);
  
        args.unshift(undefined);
        self.deliver.apply(self, args);
      };
  
      self.fulfill = function () {
        if (arguments.length) {
          self.deliver.apply(self, arguments);
        } else {
          self.deliver();
        }
        self.fulfilled = true;
      };
  
      self.when = function (callback, local_context) {
        // this self._index will be the id of the everytimer
        self._onetimers[self._index] = true;
        self.whenever(callback, local_context);
  
        return self;
      };
  
      self.whenever = function (callback, local_context) {
        var id = self._index,
          everytimer;
  
        if ('function' !== typeof callback) {
          self._options.error(new Error("Future().whenever(callback, [context]): callback must be a function."));
          return;
        }
  
        if (self._findCallback(callback, local_context)) {
          // TODO log
          self._options.error(new Error("Future().everytimers is a strict set. Cannot add already subscribed `callback, [context]`."));
          return;
        }
  
        everytimer = self._everytimers[id] = {
          id: id,
          callback: callback,
          context: (null === local_context) ? null : (local_context || self._global_context)
        };
  
        if (self._asap && self._deliveries > 0) {
          // doesn't raise deliver count on purpose
          everytimer.callback.apply(everytimer.context, self._data);
          if (self._onetimers[id]) {
            delete self._onetimers[id];
            delete self._everytimers[id];
          }
        }
  
        self._index += 1;
        if (self._index >= MAX_INT) {
          self._cleanup(); // Works even for long-running processes
        }
  
        return self;
      };
  
      self.deliver = function () {
        if (self.fulfilled) {
          self._options.error(new Error("`Future().fulfill(err, data, ...)` renders future deliveries useless"));
          return;
        }
  
        var args = Array.prototype.slice.call(arguments);
        self._data = args;
  
        self._deliveries += 1; // Eventually reaches `Infinity`...
  
        Object.keys(self._everytimers).forEach(function (id) {
          var everytimer = self._everytimers[id],
            callback = everytimer.callback,
            context = everytimer.context;
  
          if (self._onetimers[id]) {
            delete self._everytimers[id];
            delete self._onetimers[id];
          }
  
          // TODO
          callback.apply(context, args);
          /*
          callback.apply(('undefined' !== context ? context : newme), args);
          context = newme;
          context = ('undefined' !== global_context ? global_context : context)
          context = ('undefined' !== local_context ? local_context : context)
          */
        });
  
        if (args[0] && "FutureTimeout" !== args[0].name) {
          self._resetTimeout();
        }
  
  
        return self;
      };
    }
  
    Future.prototype.setContext = function (context) {
      var self = this
        ;
  
      self._global_context = context;
    };
  
    Future.prototype.setTimeout = function (new_time) {
      var self = this
        ;
  
      self._time = new_time;
      self._resetTimeout();
    };
  
    Future.prototype._resetTimeout = function () {
      var self = this
        ;
  
      if (self._timeout_id) {
        clearTimeout(self._timeout_id);
        self._timeout_id = undefined;
      }
  
      if (self._time > 0) {
        self._timeout_id = setTimeout(function () {
          self.deliver(new FutureTimeoutException(self._time));
          self._timeout_id = undefined;
        }, self._time);
      }
    };
  
    Future.prototype.callbackCount = function() {
      var self = this
        ;
  
      return Object.keys(self._everytimers).length;
    };
  
    Future.prototype.deliveryCount = function() {
      var self = this
        ;
  
      return self._deliveries;
    };
  
    Future.prototype.setAsap = function(new_asap) {
      var self = this
        ;
  
      if (undefined === new_asap) {
        new_asap = true;
      }
  
      if (true !== new_asap && false !== new_asap) {
        self._options.error(new Error("Future.setAsap(asap) accepts literal true or false, not " + new_asap));
        return;
      }
  
      self._asap = new_asap;
    };
  
    Future.prototype._findCallback = function (callback, context) {
      var self = this
        , result
        ;
  
      Object.keys(self._everytimers).forEach(function (id) {
        var everytimer = self._everytimers[id]
          ;
  
        if (callback === everytimer.callback) {
          if (context === everytimer.context || everytimer.context === self._global_context) {
            result = everytimer;
          }
        }
      });
  
      return result;
    };
  
    Future.prototype.hasCallback = function () {
      var self = this
        ;
  
      return !!self._findCallback.apply(self, arguments);
    };
  
    Future.prototype.removeCallback = function(callback, context) {
      var self = this
        , everytimer = self._findCallback(callback, context)
        ;
        
      if (everytimer) {
        delete self._everytimers[everytimer.id];
        self._onetimers[everytimer.id] = undefined;
        delete self._onetimers[everytimer.id];
      }
  
      return self;
    };
  
    Future.prototype.passable = function () {
      var self = this
        ;
  
      self._passenger = privatize(self, [
        "when",
        "whenever"
      ]);
  
      return self._passenger;
    };
  
    // this will probably never get called and, hence, is not yet well tested
    Future.prototype._cleanup = function () {
      var self = this
        , new_everytimers = {}
        , new_onetimers = {}
        ;
  
      self._index = 0;
      Object.keys(self._everytimers).forEach(function (id) {
        var newtimer = new_everytimers[self._index] = self._everytimers[id];
  
        if (self._onetimers[id]) {
          new_onetimers[self._index] = true;
        }
  
        newtimer.id = self._index;
        self._index += 1;
      });
  
      self._onetimers = new_onetimers;
      self._everytimers = new_everytimers;
    };
  
    function create(context, options) {
      // TODO use prototype hack instead of new?
      return new Future(context, options);
    }
  
    Future.prototype.isFuture = isFuture;
  
    Future.isFuture = isFuture;
    Future.create = create;
    module.exports = Future;
  }());
  

  provide("future", module.exports);
  provide("future", module.exports);
  $.ender(module.exports);
}(global));

// ender:events.node as events
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  if ('undefined' === typeof process) {
    process = {};
  }
  (function () {
    "use strict";
  
    process.EventEmitter = process.EventEmitter || function () {};
  
  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.
  
  var EventEmitter = exports.EventEmitter = process.EventEmitter;
  var isArray = Array.isArray;
  
  // By default EventEmitters will print a warning if more than
  // 10 listeners are added to it. This is a useful default which
  // helps finding memory leaks.
  //
  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.
  var defaultMaxListeners = 10;
  EventEmitter.prototype.setMaxListeners = function(n) {
    if (!this._events) this._events = {};
    this._events.maxListeners = n;
  };
  
  
  EventEmitter.prototype.emit = function(type) {
    // If there is no 'error' event listener then throw.
    if (type === 'error') {
      if (!this._events || !this._events.error ||
          (isArray(this._events.error) && !this._events.error.length))
      {
        if (arguments[1] instanceof Error) {
          throw arguments[1]; // Unhandled 'error' event
        } else {
          throw new Error("Uncaught, unspecified 'error' event.");
        }
        return false;
      }
    }
  
    if (!this._events) return false;
    var handler = this._events[type];
    if (!handler) return false;
  
    if (typeof handler == 'function') {
      switch (arguments.length) {
        // fast cases
        case 1:
          handler.call(this);
          break;
        case 2:
          handler.call(this, arguments[1]);
          break;
        case 3:
          handler.call(this, arguments[1], arguments[2]);
          break;
        // slower
        default:
          var args = Array.prototype.slice.call(arguments, 1);
          handler.apply(this, args);
      }
      return true;
  
    } else if (isArray(handler)) {
      var args = Array.prototype.slice.call(arguments, 1);
  
      var listeners = handler.slice();
      for (var i = 0, l = listeners.length; i < l; i++) {
        listeners[i].apply(this, args);
      }
      return true;
  
    } else {
      return false;
    }
  };
  
  // EventEmitter is defined in src/node_events.cc
  // EventEmitter.prototype.emit() is also defined there.
  EventEmitter.prototype.addListener = function(type, listener) {
    if ('function' !== typeof listener) {
      throw new Error('addListener only takes instances of Function');
    }
  
    if (!this._events) this._events = {};
  
    // To avoid recursion in the case that type == "newListeners"! Before
    // adding it to the listeners, first emit "newListeners".
    this.emit('newListener', type, listener);
  
    if (!this._events[type]) {
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener;
    } else if (isArray(this._events[type])) {
  
      // If we've already got an array, just append.
      this._events[type].push(listener);
  
      // Check for listener leak
      if (!this._events[type].warned) {
        var m;
        if (this._events.maxListeners !== undefined) {
          m = this._events.maxListeners;
        } else {
          m = defaultMaxListeners;
        }
  
        if (m && m > 0 && this._events[type].length > m) {
          this._events[type].warned = true;
          console.error('(node) warning: possible EventEmitter memory ' +
                        'leak detected. %d listeners added. ' +
                        'Use emitter.setMaxListeners() to increase limit.',
                        this._events[type].length);
          console.trace();
        }
      }
    } else {
      // Adding the second element, need to change to array.
      this._events[type] = [this._events[type], listener];
    }
  
    return this;
  };
  
  EventEmitter.prototype.on = EventEmitter.prototype.addListener;
  
  EventEmitter.prototype.once = function(type, listener) {
    var self = this;
    function g() {
      self.removeListener(type, g);
      listener.apply(this, arguments);
    };
  
    g.listener = listener;
    self.on(type, g);
  
    return this;
  };
  
  EventEmitter.prototype.removeListener = function(type, listener) {
    if ('function' !== typeof listener) {
      throw new Error('removeListener only takes instances of Function');
    }
  
    // does not use listeners(), so no side effect of creating _events[type]
    if (!this._events || !this._events[type]) return this;
  
    var list = this._events[type];
  
    if (isArray(list)) {
      var position = -1;
      for (var i = 0, length = list.length; i < length; i++) {
        if (list[i] === listener ||
            (list[i].listener && list[i].listener === listener))
        {
          position = i;
          break;
        }
      }
  
      if (position < 0) return this;
      list.splice(position, 1);
      if (list.length == 0)
        delete this._events[type];
    } else if (list === listener ||
               (list.listener && list.listener === listener))
    {
      delete this._events[type];
    }
  
    return this;
  };
  
  EventEmitter.prototype.removeAllListeners = function(type) {
    // does not use listeners(), so no side effect of creating _events[type]
    if (type && this._events && this._events[type]) this._events[type] = null;
    return this;
  };
  
  EventEmitter.prototype.listeners = function(type) {
    if (!this._events) this._events = {};
    if (!this._events[type]) this._events[type] = [];
    if (!isArray(this._events[type])) {
      this._events[type] = [this._events[type]];
    }
    return this._events[type];
  };
  
  }());
  

  provide("events.node", module.exports);
  provide("events", module.exports);
  $.ender(module.exports);
}(global));

// ender:url as url
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
  (function () {
    "use strict";
  
  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.
  
  var punycode = require('punycode');
  
  exports.parse = urlParse;
  exports.resolve = urlResolve;
  exports.resolveObject = urlResolveObject;
  exports.format = urlFormat;
  
  // Reference: RFC 3986, RFC 1808, RFC 2396
  
  // define these here so at least they only have to be
  // compiled once on the first module load.
  var protocolPattern = /^([a-z0-9.+-]+:)/i,
      portPattern = /:[0-9]*$/,
  
      // RFC 2396: characters reserved for delimiting URLs.
      // We actually just auto-escape these.
      delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],
  
      // RFC 2396: characters not allowed for various reasons.
      unwise = ['{', '}', '|', '\\', '^', '~', '`'].concat(delims),
  
      // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
      autoEscape = ['\''].concat(delims),
      // Characters that are never ever allowed in a hostname.
      // Note that any invalid chars are also handled, but these
      // are the ones that are *expected* to be seen, so we fast-path
      // them.
      nonHostChars = ['%', '/', '?', ';', '#']
        .concat(unwise).concat(autoEscape),
      nonAuthChars = ['/', '@', '?', '#'].concat(delims),
      hostnameMaxLen = 255,
      hostnamePartPattern = /^[a-zA-Z0-9][a-z0-9A-Z_-]{0,62}$/,
      hostnamePartStart = /^([a-zA-Z0-9][a-z0-9A-Z_-]{0,62})(.*)$/,
      // protocols that can allow "unsafe" and "unwise" chars.
      unsafeProtocol = {
        'javascript': true,
        'javascript:': true
      },
      // protocols that never have a hostname.
      hostlessProtocol = {
        'javascript': true,
        'javascript:': true
      },
      // protocols that always have a path component.
      pathedProtocol = {
        'http': true,
        'https': true,
        'ftp': true,
        'gopher': true,
        'file': true,
        'http:': true,
        'ftp:': true,
        'gopher:': true,
        'file:': true
      },
      // protocols that always contain a // bit.
      slashedProtocol = {
        'http': true,
        'https': true,
        'ftp': true,
        'gopher': true,
        'file': true,
        'http:': true,
        'https:': true,
        'ftp:': true,
        'gopher:': true,
        'file:': true
      },
      querystring = require('querystring');
  
  function urlParse(url, parseQueryString, slashesDenoteHost) {
    if (url && typeof(url) === 'object' && url.href) return url;
  
    if (typeof url !== 'string') {
      throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
    }
  
    var out = {},
        rest = url;
  
    // trim before proceeding.
    // This is to support parse stuff like "  http://foo.com  \n"
    rest = rest.trim();
  
    var proto = protocolPattern.exec(rest);
    if (proto) {
      proto = proto[0];
      var lowerProto = proto.toLowerCase();
      out.protocol = lowerProto;
      rest = rest.substr(proto.length);
    }
  
    // figure out if it's got a host
    // user@server is *always* interpreted as a hostname, and url
    // resolution will treat //foo/bar as host=foo,path=bar because that's
    // how the browser resolves relative URLs.
    if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
      var slashes = rest.substr(0, 2) === '//';
      if (slashes && !(proto && hostlessProtocol[proto])) {
        rest = rest.substr(2);
        out.slashes = true;
      }
    }
  
    if (!hostlessProtocol[proto] &&
        (slashes || (proto && !slashedProtocol[proto]))) {
      // there's a hostname.
      // the first instance of /, ?, ;, or # ends the host.
      // don't enforce full RFC correctness, just be unstupid about it.
  
      // If there is an @ in the hostname, then non-host chars *are* allowed
      // to the left of the first @ sign, unless some non-auth character
      // comes *before* the @-sign.
      // URLs are obnoxious.
      var atSign = rest.indexOf('@');
      if (atSign !== -1) {
        var auth = rest.slice(0, atSign);
  
        // there *may be* an auth
        var hasAuth = true;
        for (var i = 0, l = nonAuthChars.length; i < l; i++) {
          if (auth.indexOf(nonAuthChars[i]) !== -1) {
            // not a valid auth.  Something like http://foo.com/bar@baz/
            hasAuth = false;
            break;
          }
        }
  
        if (hasAuth) {
          // pluck off the auth portion.
          out.auth = decodeURIComponent(auth);
          rest = rest.substr(atSign + 1);
        }
      }
  
      var firstNonHost = -1;
      for (var i = 0, l = nonHostChars.length; i < l; i++) {
        var index = rest.indexOf(nonHostChars[i]);
        if (index !== -1 &&
            (firstNonHost < 0 || index < firstNonHost)) firstNonHost = index;
      }
  
      if (firstNonHost !== -1) {
        out.host = rest.substr(0, firstNonHost);
        rest = rest.substr(firstNonHost);
      } else {
        out.host = rest;
        rest = '';
      }
  
      // pull out port.
      var p = parseHost(out.host);
      var keys = Object.keys(p);
      for (var i = 0, l = keys.length; i < l; i++) {
        var key = keys[i];
        out[key] = p[key];
      }
  
      // we've indicated that there is a hostname,
      // so even if it's empty, it has to be present.
      out.hostname = out.hostname || '';
  
      // if hostname begins with [ and ends with ]
      // assume that it's an IPv6 address.
      var ipv6Hostname = out.hostname[0] === '[' &&
          out.hostname[out.hostname.length - 1] === ']';
  
      // validate a little.
      if (out.hostname.length > hostnameMaxLen) {
        out.hostname = '';
      } else if (!ipv6Hostname) {
        var hostparts = out.hostname.split(/\./);
        for (var i = 0, l = hostparts.length; i < l; i++) {
          var part = hostparts[i];
          if (!part) continue;
          if (!part.match(hostnamePartPattern)) {
            var newpart = '';
            for (var j = 0, k = part.length; j < k; j++) {
              if (part.charCodeAt(j) > 127) {
                // we replace non-ASCII char with a temporary placeholder
                // we need this to make sure size of hostname is not
                // broken by replacing non-ASCII by nothing
                newpart += 'x';
              } else {
                newpart += part[j];
              }
            }
            // we test again with ASCII char only
            if (!newpart.match(hostnamePartPattern)) {
              var validParts = hostparts.slice(0, i);
              var notHost = hostparts.slice(i + 1);
              var bit = part.match(hostnamePartStart);
              if (bit) {
                validParts.push(bit[1]);
                notHost.unshift(bit[2]);
              }
              if (notHost.length) {
                rest = '/' + notHost.join('.') + rest;
              }
              out.hostname = validParts.join('.');
              break;
            }
          }
        }
      }
  
      // hostnames are always lower case.
      out.hostname = out.hostname.toLowerCase();
  
      if (!ipv6Hostname) {
        // IDNA Support: Returns a puny coded representation of "domain".
        // It only converts the part of the domain name that
        // has non ASCII characters. I.e. it dosent matter if
        // you call it with a domain that already is in ASCII.
        var domainArray = out.hostname.split('.');
        var newOut = [];
        for (var i = 0; i < domainArray.length; ++i) {
          var s = domainArray[i];
          newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
              'xn--' + punycode.encode(s) : s);
        }
        out.hostname = newOut.join('.');
      }
  
      out.host = (out.hostname || '') +
          ((out.port) ? ':' + out.port : '');
      out.href += out.host;
  
      // strip [ and ] from the hostname
      if (ipv6Hostname) {
        out.hostname = out.hostname.substr(1, out.hostname.length - 2);
        if (rest[0] !== '/') {
          rest = '/' + rest;
        }
      }
    }
  
    // now rest is set to the post-host stuff.
    // chop off any delim chars.
    if (!unsafeProtocol[lowerProto]) {
  
      // First, make 100% sure that any "autoEscape" chars get
      // escaped, even if encodeURIComponent doesn't think they
      // need to be.
      for (var i = 0, l = autoEscape.length; i < l; i++) {
        var ae = autoEscape[i];
        var esc = encodeURIComponent(ae);
        if (esc === ae) {
          esc = escape(ae);
        }
        rest = rest.split(ae).join(esc);
      }
    }
  
  
    // chop off from the tail first.
    var hash = rest.indexOf('#');
    if (hash !== -1) {
      // got a fragment string.
      out.hash = rest.substr(hash);
      rest = rest.slice(0, hash);
    }
    var qm = rest.indexOf('?');
    if (qm !== -1) {
      out.search = rest.substr(qm);
      out.query = rest.substr(qm + 1);
      if (parseQueryString) {
        out.query = querystring.parse(out.query);
      }
      rest = rest.slice(0, qm);
    } else if (parseQueryString) {
      // no query string, but parseQueryString still requested
      out.search = '';
      out.query = {};
    }
    if (rest) out.pathname = rest;
    if (slashedProtocol[proto] &&
        out.hostname && !out.pathname) {
      out.pathname = '/';
    }
  
    //to support http.request
    if (out.pathname || out.search) {
      out.path = (out.pathname ? out.pathname : '') +
                 (out.search ? out.search : '');
    }
  
    // finally, reconstruct the href based on what has been validated.
    out.href = urlFormat(out);
    return out;
  }
  
  // format a parsed object into a url string
  function urlFormat(obj) {
    // ensure it's an object, and not a string url.
    // If it's an obj, this is a no-op.
    // this way, you can call url_format() on strings
    // to clean up potentially wonky urls.
    if (typeof(obj) === 'string') obj = urlParse(obj);
  
    var auth = obj.auth || '';
    if (auth) {
      auth = encodeURIComponent(auth);
      auth = auth.replace(/%3A/i, ':');
      auth += '@';
    }
  
    var protocol = obj.protocol || '',
        pathname = obj.pathname || '',
        hash = obj.hash || '',
        host = false,
        query = '';
  
    if (obj.host !== undefined) {
      host = auth + obj.host;
    } else if (obj.hostname !== undefined) {
      host = auth + (obj.hostname.indexOf(':') === -1 ?
          obj.hostname :
          '[' + obj.hostname + ']');
      if (obj.port) {
        host += ':' + obj.port;
      }
    }
  
    if (obj.query && typeof obj.query === 'object' &&
        Object.keys(obj.query).length) {
      query = querystring.stringify(obj.query);
    }
  
    var search = obj.search || (query && ('?' + query)) || '';
  
    if (protocol && protocol.substr(-1) !== ':') protocol += ':';
  
    // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
    // unless they had them to begin with.
    if (obj.slashes ||
        (!protocol || slashedProtocol[protocol]) && host !== false) {
      host = '//' + (host || '');
      if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
    } else if (!host) {
      host = '';
    }
  
    if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
    if (search && search.charAt(0) !== '?') search = '?' + search;
  
    return protocol + host + pathname + search + hash;
  }
  
  function urlResolve(source, relative) {
    return urlFormat(urlResolveObject(source, relative));
  }
  
  function urlResolveObject(source, relative) {
    if (!source) return relative;
  
    source = urlParse(urlFormat(source), false, true);
    relative = urlParse(urlFormat(relative), false, true);
  
    // hash is always overridden, no matter what.
    source.hash = relative.hash;
  
    if (relative.href === '') {
      source.href = urlFormat(source);
      return source;
    }
  
    // hrefs like //foo/bar always cut to the protocol.
    if (relative.slashes && !relative.protocol) {
      relative.protocol = source.protocol;
      //urlParse appends trailing / to urls like http://www.example.com
      if (slashedProtocol[relative.protocol] &&
          relative.hostname && !relative.pathname) {
        relative.path = relative.pathname = '/';
      }
      relative.href = urlFormat(relative);
      return relative;
    }
  
    if (relative.protocol && relative.protocol !== source.protocol) {
      // if it's a known url protocol, then changing
      // the protocol does weird things
      // first, if it's not file:, then we MUST have a host,
      // and if there was a path
      // to begin with, then we MUST have a path.
      // if it is file:, then the host is dropped,
      // because that's known to be hostless.
      // anything else is assumed to be absolute.
      if (!slashedProtocol[relative.protocol]) {
        relative.href = urlFormat(relative);
        return relative;
      }
      source.protocol = relative.protocol;
      if (!relative.host && !hostlessProtocol[relative.protocol]) {
        var relPath = (relative.pathname || '').split('/');
        while (relPath.length && !(relative.host = relPath.shift()));
        if (!relative.host) relative.host = '';
        if (!relative.hostname) relative.hostname = '';
        if (relPath[0] !== '') relPath.unshift('');
        if (relPath.length < 2) relPath.unshift('');
        relative.pathname = relPath.join('/');
      }
      source.pathname = relative.pathname;
      source.search = relative.search;
      source.query = relative.query;
      source.host = relative.host || '';
      source.auth = relative.auth;
      source.hostname = relative.hostname || relative.host;
      source.port = relative.port;
      //to support http.request
      if (source.pathname !== undefined || source.search !== undefined) {
        source.path = (source.pathname ? source.pathname : '') +
                      (source.search ? source.search : '');
      }
      source.slashes = source.slashes || relative.slashes;
      source.href = urlFormat(source);
      return source;
    }
  
    var isSourceAbs = (source.pathname && source.pathname.charAt(0) === '/'),
        isRelAbs = (
            relative.host !== undefined ||
            relative.pathname && relative.pathname.charAt(0) === '/'
        ),
        mustEndAbs = (isRelAbs || isSourceAbs ||
                      (source.host && relative.pathname)),
        removeAllDots = mustEndAbs,
        srcPath = source.pathname && source.pathname.split('/') || [],
        relPath = relative.pathname && relative.pathname.split('/') || [],
        psychotic = source.protocol &&
            !slashedProtocol[source.protocol];
  
    // if the url is a non-slashed url, then relative
    // links like ../.. should be able
    // to crawl up to the hostname, as well.  This is strange.
    // source.protocol has already been set by now.
    // Later on, put the first path part into the host field.
    if (psychotic) {
  
      delete source.hostname;
      delete source.port;
      if (source.host) {
        if (srcPath[0] === '') srcPath[0] = source.host;
        else srcPath.unshift(source.host);
      }
      delete source.host;
      if (relative.protocol) {
        delete relative.hostname;
        delete relative.port;
        if (relative.host) {
          if (relPath[0] === '') relPath[0] = relative.host;
          else relPath.unshift(relative.host);
        }
        delete relative.host;
      }
      mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
    }
  
    if (isRelAbs) {
      // it's absolute.
      source.host = (relative.host || relative.host === '') ?
                        relative.host : source.host;
      source.hostname = (relative.hostname || relative.hostname === '') ?
                        relative.hostname : source.hostname;
      source.search = relative.search;
      source.query = relative.query;
      srcPath = relPath;
      // fall through to the dot-handling below.
    } else if (relPath.length) {
      // it's relative
      // throw away the existing file, and take the new path instead.
      if (!srcPath) srcPath = [];
      srcPath.pop();
      srcPath = srcPath.concat(relPath);
      source.search = relative.search;
      source.query = relative.query;
    } else if ('search' in relative) {
      // just pull out the search.
      // like href='?foo'.
      // Put this after the other two cases because it simplifies the booleans
      if (psychotic) {
        source.hostname = source.host = srcPath.shift();
        //occationaly the auth can get stuck only in host
        //this especialy happens in cases like
        //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
        var authInHost = source.host && source.host.indexOf('@') > 0 ?
                         source.host.split('@') : false;
        if (authInHost) {
          source.auth = authInHost.shift();
          source.host = source.hostname = authInHost.shift();
        }
      }
      source.search = relative.search;
      source.query = relative.query;
      //to support http.request
      if (source.pathname !== undefined || source.search !== undefined) {
        source.path = (source.pathname ? source.pathname : '') +
                      (source.search ? source.search : '');
      }
      source.href = urlFormat(source);
      return source;
    }
    if (!srcPath.length) {
      // no path at all.  easy.
      // we've already handled the other stuff above.
      delete source.pathname;
      //to support http.request
      if (!source.search) {
        source.path = '/' + source.search;
      } else {
        delete source.path;
      }
      source.href = urlFormat(source);
      return source;
    }
    // if a url ENDs in . or .., then it must get a trailing slash.
    // however, if it ends in anything else non-slashy,
    // then it must NOT get a trailing slash.
    var last = srcPath.slice(-1)[0];
    var hasTrailingSlash = (
        (source.host || relative.host) && (last === '.' || last === '..') ||
        last === '');
  
    // strip single dots, resolve double dots to parent dir
    // if the path tries to go above the root, `up` ends up > 0
    var up = 0;
    for (var i = srcPath.length; i >= 0; i--) {
      last = srcPath[i];
      if (last == '.') {
        srcPath.splice(i, 1);
      } else if (last === '..') {
        srcPath.splice(i, 1);
        up++;
      } else if (up) {
        srcPath.splice(i, 1);
        up--;
      }
    }
  
    // if the path is allowed to go above the root, restore leading ..s
    if (!mustEndAbs && !removeAllDots) {
      for (; up--; up) {
        srcPath.unshift('..');
      }
    }
  
    if (mustEndAbs && srcPath[0] !== '' &&
        (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
      srcPath.unshift('');
    }
  
    if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
      srcPath.push('');
    }
  
    var isAbsolute = srcPath[0] === '' ||
        (srcPath[0] && srcPath[0].charAt(0) === '/');
  
    // put the host back
    if (psychotic) {
      source.hostname = source.host = isAbsolute ? '' :
                                      srcPath.length ? srcPath.shift() : '';
      //occationaly the auth can get stuck only in host
      //this especialy happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = source.host && source.host.indexOf('@') > 0 ?
                       source.host.split('@') : false;
      if (authInHost) {
        source.auth = authInHost.shift();
        source.host = source.hostname = authInHost.shift();
      }
    }
  
    mustEndAbs = mustEndAbs || (source.host && srcPath.length);
  
    if (mustEndAbs && !isAbsolute) {
      srcPath.unshift('');
    }
  
    source.pathname = srcPath.join('/');
    //to support request.http
    if (source.pathname !== undefined || source.search !== undefined) {
      source.path = (source.pathname ? source.pathname : '') +
                    (source.search ? source.search : '');
    }
    source.auth = relative.auth || source.auth;
    source.slashes = source.slashes || relative.slashes;
    source.href = urlFormat(source);
    return source;
  }
  
  function parseHost(host) {
    var out = {};
    var port = portPattern.exec(host);
    if (port) {
      port = port[0];
      if (port !== ':') {
        out.port = port.substr(1);
      }
      host = host.substr(0, host.length - port.length);
    }
    if (host) out.hostname = host;
    return out;
  }
  
  }());
  

  provide("url", module.exports);
  provide("url", module.exports);
  $.ender(module.exports);
}(global));

// ender:join as join
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true*/
  (function () {
    "use strict";
  
    var Future = require('future');
  
    function isJoin(obj) {
      return obj instanceof Join;
    }
  
    function Join(global_context) {
      var self = this
        , data = []
        , ready = []
        , subs = []
        , promise_only = false
        , begun = false
        , updated = 0
        , join_future = Future.create(global_context)
        ;
  
      global_context = global_context || null;
  
      if (!isJoin(this)) {
        return new Join(global_context);
      }
  
      function relay() {
        var i;
        if (!begun || updated !== data.length) {
          return;
        }
        updated = 0;
        join_future.deliver.apply(join_future, data);
        data = new Array(data.length);
        ready = new Array(ready.length);
        //for (i = 0; i < data.length; i += 1) {
        //  data[i] = undefined;
        //}
      }
  
      function init() {
        var type = (promise_only ? "when" : "whenever");
  
        begun = true;
        data = new Array(subs.length);
        ready = new Array(ready.length);
  
        subs.forEach(function (sub, id) {
          sub[type](function () {
            var args = Array.prototype.slice.call(arguments);
            data[id] = args;
            if (!ready[id]) {
              ready[id] = true;
              updated += 1;
            }
            relay();
          });
        });
      }
  
      self.deliverer = function () {
        var future = Future.create();
        self.add(future);
        return future.deliver;
      };
      self.newCallback = self.deliverer;
  
      // fn, ctx
      self.when = function () {
        if (!begun) {
          init();
        }
        join_future.when.apply(join_future, arguments);
      };
  
      // fn, ctx
      self.whenever = function () {
        if (!begun) {
          init();
        }
        join_future.whenever.apply(join_future, arguments);
      };
  
      self.add = function () {
        if (begun) {
          throw new Error("`Join().add(Array<future> | subs1, [subs2, ...])` requires that all additions be completed before the first `when()` or `whenever()`");
        }
        var args = Array.prototype.slice.call(arguments);
        if (0 === args.length) {
          return self.newCallback();
        }
        args = Array.isArray(args[0]) ? args[0] : args;
        args.forEach(function (sub) {
          if (!sub.whenever) {
            promise_only = true;
          }
          if (!sub.when) {
            throw new Error("`Join().add(future)` requires either a promise or future");
          }
          subs.push(sub);
        });
      };
    }
  
    function createJoin(context) {
      // TODO use prototype instead of new
      return (new Join(context));
    }
  
    Join.create = createJoin;
    Join.isJoin = isJoin;
    module.exports = Join;
  }());
  

  provide("join", module.exports);
  provide("join", module.exports);
  $.ender(module.exports);
}(global));

// ender:domready as domready
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*!
    * domready (c) Dustin Diaz 2012 - License MIT
    */
  !function (name, definition) {
    if (typeof module != 'undefined') module.exports = definition()
    else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
    else this[name] = definition()
  }('domready', function (ready) {
  
    var fns = [], fn, f = false
      , doc = document
      , testEl = doc.documentElement
      , hack = testEl.doScroll
      , domContentLoaded = 'DOMContentLoaded'
      , addEventListener = 'addEventListener'
      , onreadystatechange = 'onreadystatechange'
      , readyState = 'readyState'
      , loaded = /^loade|c/.test(doc[readyState])
  
    function flush(f) {
      loaded = 1
      while (f = fns.shift()) f()
    }
  
    doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {
      doc.removeEventListener(domContentLoaded, fn, f)
      flush()
    }, f)
  
  
    hack && doc.attachEvent(onreadystatechange, fn = function () {
      if (/^c/.test(doc[readyState])) {
        doc.detachEvent(onreadystatechange, fn)
        flush()
      }
    })
  
    return (ready = hack ?
      function (fn) {
        self != top ?
          loaded ? fn() : fns.push(fn) :
          function () {
            try {
              testEl.doScroll('left')
            } catch (e) {
              return setTimeout(function() { ready(fn) }, 50)
            }
            fn()
          }()
      } :
      function (fn) {
        loaded ? fn() : fns.push(fn)
      })
  })

  provide("domready", module.exports);
  provide("domready", module.exports);
  $.ender(module.exports);
}(global));

// ender:domready/ender-bridge as domready/ender-bridge
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  !function ($) {
    var ready =  require('domready')
    $.ender({domReady: ready})
    $.ender({
      ready: function (f) {
        ready(f)
        return this
      }
    }, true)
  }(ender);

  provide("domready/ender-bridge", module.exports);
  provide("domready/ender-bridge", module.exports);
  $.ender(module.exports);
}(global));


// ender:qwery/ender-bridge as qwery/ender-bridge
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function ($) {
    var q = function () {
      var r
      try {
        r =  require('qwery')
      } catch (ex) {
        r = require('qwery-mobile')
      } finally {
        return r
      }
    }()
  
    $.pseudos = q.pseudos
  
    $._select = function (s, r) {
      // detect if sibling module 'bonzo' is available at run-time
      // rather than load-time since technically it's not a dependency and
      // can be loaded in any order
      // hence the lazy function re-definition
      return ($._select = (function () {
        var b
        if (typeof $.create == 'function') return function (s, r) {
          return /^\s*</.test(s) ? $.create(s, r) : q(s, r)
        }
        try {
          b = require('bonzo')
          return function (s, r) {
            return /^\s*</.test(s) ? b.create(s, r) : q(s, r)
          }
        } catch (e) { }
        return q
      })())(s, r)
    }
  
    $.ender({
        find: function (s) {
          var r = [], i, l, j, k, els
          for (i = 0, l = this.length; i < l; i++) {
            els = q(s, this[i])
            for (j = 0, k = els.length; j < k; j++) r.push(els[j])
          }
          return $(q.uniq(r))
        }
      , and: function (s) {
          var plus = $(s)
          for (var i = this.length, j = 0, l = this.length + plus.length; i < l; i++, j++) {
            this[i] = plus[j]
          }
          this.length += plus.length
          return this
        }
      , is: function(s, r) {
          var i, l
          for (i = 0, l = this.length; i < l; i++) {
            if (q.is(this[i], s, r)) {
              return true
            }
          }
          return false
        }
    }, true)
  }(ender));
  

  provide("qwery/ender-bridge", module.exports);
  provide("qwery/ender-bridge", module.exports);
  $.ender(module.exports);
}(global));

// ender:bonzo as bonzo
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*!
    * Bonzo: DOM Utility (c) Dustin Diaz 2012
    * https://github.com/ded/bonzo
    * License MIT
    */
  (function (name, definition, context) {
    if (typeof module != 'undefined' && module.exports) module.exports = definition()
    else if (typeof context['define'] == 'function' && context['define']['amd']) define(name, definition)
    else context[name] = definition()
  })('bonzo', function() {
    var win = window
      , doc = win.document
      , html = doc.documentElement
      , parentNode = 'parentNode'
      , query = null // used for setting a selector engine host
      , specialAttributes = /^(checked|value|selected|disabled)$/i
      , specialTags = /^(select|fieldset|table|tbody|tfoot|td|tr|colgroup)$/i // tags that we have trouble inserting *into*
      , table = ['<table>', '</table>', 1]
      , td = ['<table><tbody><tr>', '</tr></tbody></table>', 3]
      , option = ['<select>', '</select>', 1]
      , noscope = ['_', '', 0, 1]
      , tagMap = { // tags that we have trouble *inserting*
            thead: table, tbody: table, tfoot: table, colgroup: table, caption: table
          , tr: ['<table><tbody>', '</tbody></table>', 2]
          , th: td , td: td
          , col: ['<table><colgroup>', '</colgroup></table>', 2]
          , fieldset: ['<form>', '</form>', 1]
          , legend: ['<form><fieldset>', '</fieldset></form>', 2]
          , option: option, optgroup: option
          , script: noscope, style: noscope, link: noscope, param: noscope, base: noscope
        }
      , stateAttributes = /^(checked|selected|disabled)$/
      , ie = /msie/i.test(navigator.userAgent)
      , hasClass, addClass, removeClass
      , uidMap = {}
      , uuids = 0
      , digit = /^-?[\d\.]+$/
      , dattr = /^data-(.+)$/
      , px = 'px'
      , setAttribute = 'setAttribute'
      , getAttribute = 'getAttribute'
      , byTag = 'getElementsByTagName'
      , features = function() {
          var e = doc.createElement('p')
          e.innerHTML = '<a href="#x">x</a><table style="float:left;"></table>'
          return {
            hrefExtended: e[byTag]('a')[0][getAttribute]('href') != '#x' // IE < 8
          , autoTbody: e[byTag]('tbody').length !== 0 // IE < 8
          , computedStyle: doc.defaultView && doc.defaultView.getComputedStyle
          , cssFloat: e[byTag]('table')[0].style.styleFloat ? 'styleFloat' : 'cssFloat'
          , transform: function () {
              var props = ['webkitTransform', 'MozTransform', 'OTransform', 'msTransform', 'Transform'], i
              for (i = 0; i < props.length; i++) {
                if (props[i] in e.style) return props[i]
              }
            }()
          , classList: 'classList' in e
          , opasity: function () {
              return typeof doc.createElement('a').style.opacity !== 'undefined'
            }()
          }
        }()
      , trimReplace = /(^\s*|\s*$)/g
      , whitespaceRegex = /\s+/
      , toString = String.prototype.toString
      , unitless = { lineHeight: 1, zoom: 1, zIndex: 1, opacity: 1, boxFlex: 1, WebkitBoxFlex: 1, MozBoxFlex: 1 }
      , trim = String.prototype.trim ?
          function (s) {
            return s.trim()
          } :
          function (s) {
            return s.replace(trimReplace, '')
          }
  
  
    /**
     * @param {string} c a class name to test
     * @return {boolean}
     */
    function classReg(c) {
      return new RegExp("(^|\\s+)" + c + "(\\s+|$)")
    }
  
  
    /**
     * @param {Bonzo|Array} ar
     * @param {function(Object, number, (Bonzo|Array))} fn
     * @param {Object=} opt_scope
     * @param {boolean=} opt_rev
     * @return {Bonzo|Array}
     */
    function each(ar, fn, opt_scope, opt_rev) {
      var ind, i = 0, l = ar.length
      for (; i < l; i++) {
        ind = opt_rev ? ar.length - i - 1 : i
        fn.call(opt_scope || ar[ind], ar[ind], ind, ar)
      }
      return ar
    }
  
  
    /**
     * @param {Bonzo|Array} ar
     * @param {function(Object, number, (Bonzo|Array))} fn
     * @param {Object=} opt_scope
     * @return {Bonzo|Array}
     */
    function deepEach(ar, fn, opt_scope) {
      for (var i = 0, l = ar.length; i < l; i++) {
        if (isNode(ar[i])) {
          deepEach(ar[i].childNodes, fn, opt_scope)
          fn.call(opt_scope || ar[i], ar[i], i, ar)
        }
      }
      return ar
    }
  
  
    /**
     * @param {string} s
     * @return {string}
     */
    function camelize(s) {
      return s.replace(/-(.)/g, function (m, m1) {
        return m1.toUpperCase()
      })
    }
  
  
    /**
     * @param {string} s
     * @return {string}
     */
    function decamelize(s) {
      return s ? s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() : s
    }
  
  
    /**
     * @param {Element} el
     * @return {*}
     */
    function data(el) {
      el[getAttribute]('data-node-uid') || el[setAttribute]('data-node-uid', ++uuids)
      var uid = el[getAttribute]('data-node-uid')
      return uidMap[uid] || (uidMap[uid] = {})
    }
  
  
    /**
     * removes the data associated with an element
     * @param {Element} el
     */
    function clearData(el) {
      var uid = el[getAttribute]('data-node-uid')
      if (uid) delete uidMap[uid]
    }
  
  
    function dataValue(d) {
      var f
      try {
        return (d === null || d === undefined) ? undefined :
          d === 'true' ? true :
            d === 'false' ? false :
              d === 'null' ? null :
                (f = parseFloat(d)) == d ? f : d;
      } catch(e) {}
      return undefined
    }
  
    function isNode(node) {
      return node && node.nodeName && (node.nodeType == 1 || node.nodeType == 11)
    }
  
  
    /**
     * @param {Bonzo|Array} ar
     * @param {function(Object, number, (Bonzo|Array))} fn
     * @param {Object=} opt_scope
     * @return {boolean} whether `some`thing was found
     */
    function some(ar, fn, opt_scope) {
      for (var i = 0, j = ar.length; i < j; ++i) if (fn.call(opt_scope || null, ar[i], i, ar)) return true
      return false
    }
  
  
    /**
     * this could be a giant enum of CSS properties
     * but in favor of file size sans-closure deadcode optimizations
     * we're just asking for any ol string
     * then it gets transformed into the appropriate style property for JS access
     * @param {string} p
     * @return {string}
     */
    function styleProperty(p) {
        (p == 'transform' && (p = features.transform)) ||
          (/^transform-?[Oo]rigin$/.test(p) && (p = features.transform + "Origin")) ||
          (p == 'float' && (p = features.cssFloat))
        return p ? camelize(p) : null
    }
  
    var getStyle = features.computedStyle ?
      function (el, property) {
        var value = null
          , computed = doc.defaultView.getComputedStyle(el, '')
        computed && (value = computed[property])
        return el.style[property] || value
      } :
  
      (ie && html.currentStyle) ?
  
      /**
       * @param {Element} el
       * @param {string} property
       * @return {string|number}
       */
      function (el, property) {
        if (property == 'opacity' && !features.opasity) {
          var val = 100
          try {
            val = el['filters']['DXImageTransform.Microsoft.Alpha'].opacity
          } catch (e1) {
            try {
              val = el['filters']('alpha').opacity
            } catch (e2) {}
          }
          return val / 100
        }
        var value = el.currentStyle ? el.currentStyle[property] : null
        return el.style[property] || value
      } :
  
      function (el, property) {
        return el.style[property]
      }
  
    // this insert method is intense
    function insert(target, host, fn, rev) {
      var i = 0, self = host || this, r = []
        // target nodes could be a css selector if it's a string and a selector engine is present
        // otherwise, just use target
        , nodes = query && typeof target == 'string' && target.charAt(0) != '<' ? query(target) : target
      // normalize each node in case it's still a string and we need to create nodes on the fly
      each(normalize(nodes), function (t, j) {
        each(self, function (el) {
          fn(t, r[i++] = j > 0 ? cloneNode(self, el) : el)
        }, null, rev)
      }, this, rev)
      self.length = i
      each(r, function (e) {
        self[--i] = e
      }, null, !rev)
      return self
    }
  
  
    /**
     * sets an element to an explicit x/y position on the page
     * @param {Element} el
     * @param {?number} x
     * @param {?number} y
     */
    function xy(el, x, y) {
      var $el = bonzo(el)
        , style = $el.css('position')
        , offset = $el.offset()
        , rel = 'relative'
        , isRel = style == rel
        , delta = [parseInt($el.css('left'), 10), parseInt($el.css('top'), 10)]
  
      if (style == 'static') {
        $el.css('position', rel)
        style = rel
      }
  
      isNaN(delta[0]) && (delta[0] = isRel ? 0 : el.offsetLeft)
      isNaN(delta[1]) && (delta[1] = isRel ? 0 : el.offsetTop)
  
      x != null && (el.style.left = x - offset.left + delta[0] + px)
      y != null && (el.style.top = y - offset.top + delta[1] + px)
  
    }
  
    // classList support for class management
    // altho to be fair, the api sucks because it won't accept multiple classes at once
    if (features.classList) {
      hasClass = function (el, c) {
        return el.classList.contains(c)
      }
      addClass = function (el, c) {
        el.classList.add(c)
      }
      removeClass = function (el, c) {
        el.classList.remove(c)
      }
    }
    else {
      hasClass = function (el, c) {
        return classReg(c).test(el.className)
      }
      addClass = function (el, c) {
        el.className = trim(el.className + ' ' + c)
      }
      removeClass = function (el, c) {
        el.className = trim(el.className.replace(classReg(c), ' '))
      }
    }
  
  
    /**
     * this allows method calling for setting values
     *
     * @example
     * bonzo(elements).css('color', function (el) {
     *   return el.getAttribute('data-original-color')
     * })
     *
     * @param {Element} el
     * @param {function (Element)|string}
     * @return {string}
     */
    function setter(el, v) {
      return typeof v == 'function' ? v(el) : v
    }
  
    /**
     * @constructor
     * @param {Array.<Element>|Element|Node|string} elements
     */
    function Bonzo(elements) {
      this.length = 0
      if (elements) {
        elements = typeof elements !== 'string' &&
          !elements.nodeType &&
          typeof elements.length !== 'undefined' ?
            elements :
            [elements]
        this.length = elements.length
        for (var i = 0; i < elements.length; i++) this[i] = elements[i]
      }
    }
  
    Bonzo.prototype = {
  
        /**
         * @param {number} index
         * @return {Element|Node}
         */
        get: function (index) {
          return this[index] || null
        }
  
        // itetators
        /**
         * @param {function(Element|Node)} fn
         * @param {Object=} opt_scope
         * @return {Bonzo}
         */
      , each: function (fn, opt_scope) {
          return each(this, fn, opt_scope)
        }
  
        /**
         * @param {Function} fn
         * @param {Object=} opt_scope
         * @return {Bonzo}
         */
      , deepEach: function (fn, opt_scope) {
          return deepEach(this, fn, opt_scope)
        }
  
  
        /**
         * @param {Function} fn
         * @param {Function=} opt_reject
         * @return {Array}
         */
      , map: function (fn, opt_reject) {
          var m = [], n, i
          for (i = 0; i < this.length; i++) {
            n = fn.call(this, this[i], i)
            opt_reject ? (opt_reject(n) && m.push(n)) : m.push(n)
          }
          return m
        }
  
      // text and html inserters!
  
      /**
       * @param {string} h the HTML to insert
       * @param {boolean=} opt_text whether to set or get text content
       * @return {Bonzo|string}
       */
      , html: function (h, opt_text) {
          var method = opt_text
                ? html.textContent === undefined ? 'innerText' : 'textContent'
                : 'innerHTML'
            , that = this
            , append = function (el, i) {
                each(normalize(h, that, i), function (node) {
                  el.appendChild(node)
                })
              }
            , updateElement = function (el, i) {
                try {
                  if (opt_text || (typeof h == 'string' && !specialTags.test(el.tagName))) {
                    return el[method] = h
                  }
                } catch (e) {}
                append(el, i)
              }
          return typeof h != 'undefined'
            ? this.empty().each(updateElement)
            : this[0] ? this[0][method] : ''
        }
  
        /**
         * @param {string=} opt_text the text to set, otherwise this is a getter
         * @return {Bonzo|string}
         */
      , text: function (opt_text) {
          return this.html(opt_text, true)
        }
  
        // more related insertion methods
  
        /**
         * @param {Bonzo|string|Element|Array} node
         * @return {Bonzo}
         */
      , append: function (node) {
          var that = this
          return this.each(function (el, i) {
            each(normalize(node, that, i), function (i) {
              el.appendChild(i)
            })
          })
        }
  
  
        /**
         * @param {Bonzo|string|Element|Array} node
         * @return {Bonzo}
         */
      , prepend: function (node) {
          var that = this
          return this.each(function (el, i) {
            var first = el.firstChild
            each(normalize(node, that, i), function (i) {
              el.insertBefore(i, first)
            })
          })
        }
  
  
        /**
         * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
         * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
         * @return {Bonzo}
         */
      , appendTo: function (target, opt_host) {
          return insert.call(this, target, opt_host, function (t, el) {
            t.appendChild(el)
          })
        }
  
  
        /**
         * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
         * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
         * @return {Bonzo}
         */
      , prependTo: function (target, opt_host) {
          return insert.call(this, target, opt_host, function (t, el) {
            t.insertBefore(el, t.firstChild)
          }, 1)
        }
  
  
        /**
         * @param {Bonzo|string|Element|Array} node
         * @return {Bonzo}
         */
      , before: function (node) {
          var that = this
          return this.each(function (el, i) {
            each(normalize(node, that, i), function (i) {
              el[parentNode].insertBefore(i, el)
            })
          })
        }
  
  
        /**
         * @param {Bonzo|string|Element|Array} node
         * @return {Bonzo}
         */
      , after: function (node) {
          var that = this
          return this.each(function (el, i) {
            each(normalize(node, that, i), function (i) {
              el[parentNode].insertBefore(i, el.nextSibling)
            }, null, 1)
          })
        }
  
  
        /**
         * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
         * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
         * @return {Bonzo}
         */
      , insertBefore: function (target, opt_host) {
          return insert.call(this, target, opt_host, function (t, el) {
            t[parentNode].insertBefore(el, t)
          })
        }
  
  
        /**
         * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
         * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
         * @return {Bonzo}
         */
      , insertAfter: function (target, opt_host) {
          return insert.call(this, target, opt_host, function (t, el) {
            var sibling = t.nextSibling
            sibling ?
              t[parentNode].insertBefore(el, sibling) :
              t[parentNode].appendChild(el)
          }, 1)
        }
  
  
        /**
         * @param {Bonzo|string|Element|Array} node
         * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
         * @return {Bonzo}
         */
      , replaceWith: function (node, opt_host) {
          var ret = bonzo(normalize(node)).insertAfter(this, opt_host)
          this.remove()
          Bonzo.call(opt_host || this, ret)
          return opt_host || this
        }
  
        // class management
  
        /**
         * @param {string} c
         * @return {Bonzo}
         */
      , addClass: function (c) {
          c = toString.call(c).split(whitespaceRegex)
          return this.each(function (el) {
            // we `each` here so you can do $el.addClass('foo bar')
            each(c, function (c) {
              if (c && !hasClass(el, setter(el, c)))
                addClass(el, setter(el, c))
            })
          })
        }
  
  
        /**
         * @param {string} c
         * @return {Bonzo}
         */
      , removeClass: function (c) {
          c = toString.call(c).split(whitespaceRegex)
          return this.each(function (el) {
            each(c, function (c) {
              if (c && hasClass(el, setter(el, c)))
                removeClass(el, setter(el, c))
            })
          })
        }
  
  
        /**
         * @param {string} c
         * @return {boolean}
         */
      , hasClass: function (c) {
          c = toString.call(c).split(whitespaceRegex)
          return some(this, function (el) {
            return some(c, function (c) {
              return c && hasClass(el, c)
            })
          })
        }
  
  
        /**
         * @param {string} c classname to toggle
         * @param {boolean=} opt_condition whether to add or remove the class straight away
         * @return {Bonzo}
         */
      , toggleClass: function (c, opt_condition) {
          c = toString.call(c).split(whitespaceRegex)
          return this.each(function (el) {
            each(c, function (c) {
              if (c) {
                typeof opt_condition !== 'undefined' ?
                  opt_condition ? addClass(el, c) : removeClass(el, c) :
                  hasClass(el, c) ? removeClass(el, c) : addClass(el, c)
              }
            })
          })
        }
  
        // display togglers
  
        /**
         * @param {string=} opt_type useful to set back to anything other than an empty string
         * @return {Bonzo}
         */
      , show: function (opt_type) {
          opt_type = typeof opt_type == 'string' ? opt_type : ''
          return this.each(function (el) {
            el.style.display = opt_type
          })
        }
  
  
        /**
         * @return {Bonzo}
         */
      , hide: function () {
          return this.each(function (el) {
            el.style.display = 'none'
          })
        }
  
  
        /**
         * @param {Function=} opt_callback
         * @param {string=} opt_type
         * @return {Bonzo}
         */
      , toggle: function (opt_callback, opt_type) {
          opt_type = typeof opt_type == 'string' ? opt_type : '';
          typeof opt_callback != 'function' && (opt_callback = null)
          return this.each(function (el) {
            el.style.display = (el.offsetWidth || el.offsetHeight) ? 'none' : opt_type;
            opt_callback && opt_callback.call(el)
          })
        }
  
  
        // DOM Walkers & getters
  
        /**
         * @return {Element|Node}
         */
      , first: function () {
          return bonzo(this.length ? this[0] : [])
        }
  
  
        /**
         * @return {Element|Node}
         */
      , last: function () {
          return bonzo(this.length ? this[this.length - 1] : [])
        }
  
  
        /**
         * @return {Element|Node}
         */
      , next: function () {
          return this.related('nextSibling')
        }
  
  
        /**
         * @return {Element|Node}
         */
      , previous: function () {
          return this.related('previousSibling')
        }
  
  
        /**
         * @return {Element|Node}
         */
      , parent: function() {
          return this.related(parentNode)
        }
  
  
        /**
         * @private
         * @param {string} method the directional DOM method
         * @return {Element|Node}
         */
      , related: function (method) {
          return this.map(
            function (el) {
              el = el[method]
              while (el && el.nodeType !== 1) {
                el = el[method]
              }
              return el || 0
            },
            function (el) {
              return el
            }
          )
        }
  
  
        /**
         * @return {Bonzo}
         */
      , focus: function () {
          this.length && this[0].focus()
          return this
        }
  
  
        /**
         * @return {Bonzo}
         */
      , blur: function () {
          this.length && this[0].blur()
          return this
        }
  
        // style getter setter & related methods
  
        /**
         * @param {Object|string} o
         * @param {string=} opt_v
         * @return {Bonzo|string}
         */
      , css: function (o, opt_v) {
          var p, iter = o
          // is this a request for just getting a style?
          if (opt_v === undefined && typeof o == 'string') {
            // repurpose 'v'
            opt_v = this[0]
            if (!opt_v) return null
            if (opt_v === doc || opt_v === win) {
              p = (opt_v === doc) ? bonzo.doc() : bonzo.viewport()
              return o == 'width' ? p.width : o == 'height' ? p.height : ''
            }
            return (o = styleProperty(o)) ? getStyle(opt_v, o) : null
          }
  
          if (typeof o == 'string') {
            iter = {}
            iter[o] = opt_v
          }
  
          if (ie && iter.opacity) {
            // oh this 'ol gamut
            iter.filter = 'alpha(opacity=' + (iter.opacity * 100) + ')'
            // give it layout
            iter.zoom = o.zoom || 1;
            delete iter.opacity;
          }
  
          function fn(el, p, v) {
            for (var k in iter) {
              if (iter.hasOwnProperty(k)) {
                v = iter[k];
                // change "5" to "5px" - unless you're line-height, which is allowed
                (p = styleProperty(k)) && digit.test(v) && !(p in unitless) && (v += px)
                try { el.style[p] = setter(el, v) } catch(e) {}
              }
            }
          }
          return this.each(fn)
        }
  
  
        /**
         * @param {number=} opt_x
         * @param {number=} opt_y
         * @return {Bonzo|number}
         */
      , offset: function (opt_x, opt_y) {
          if (typeof opt_x == 'number' || typeof opt_y == 'number') {
            return this.each(function (el) {
              xy(el, opt_x, opt_y)
            })
          }
          if (!this[0]) return {
              top: 0
            , left: 0
            , height: 0
            , width: 0
          }
          var el = this[0]
            , width = el.offsetWidth
            , height = el.offsetHeight
            , top = el.offsetTop
            , left = el.offsetLeft
          while (el = el.offsetParent) {
            top = top + el.offsetTop
            left = left + el.offsetLeft
  
            if (el != doc.body) {
              top -= el.scrollTop
              left -= el.scrollLeft
            }
          }
  
          return {
              top: top
            , left: left
            , height: height
            , width: width
          }
        }
  
  
        /**
         * @return {number}
         */
      , dim: function () {
          if (!this.length) return { height: 0, width: 0 }
          var el = this[0]
            , orig = !el.offsetWidth && !el.offsetHeight ?
               // el isn't visible, can't be measured properly, so fix that
               function (t) {
                 var s = {
                     position: el.style.position || ''
                   , visibility: el.style.visibility || ''
                   , display: el.style.display || ''
                 }
                 t.first().css({
                     position: 'absolute'
                   , visibility: 'hidden'
                   , display: 'block'
                 })
                 return s
              }(this) : null
            , width = el.offsetWidth
            , height = el.offsetHeight
  
          orig && this.first().css(orig)
          return {
              height: height
            , width: width
          }
        }
  
        // attributes are hard. go shopping
  
        /**
         * @param {string} k an attribute to get or set
         * @param {string=} opt_v the value to set
         * @return {Bonzo|string}
         */
      , attr: function (k, opt_v) {
          var el = this[0]
          if (typeof k != 'string' && !(k instanceof String)) {
            for (var n in k) {
              k.hasOwnProperty(n) && this.attr(n, k[n])
            }
            return this
          }
          return typeof opt_v == 'undefined' ?
            !el ? null : specialAttributes.test(k) ?
              stateAttributes.test(k) && typeof el[k] == 'string' ?
                true : el[k] : (k == 'href' || k =='src') && features.hrefExtended ?
                  el[getAttribute](k, 2) : el[getAttribute](k) :
            this.each(function (el) {
              specialAttributes.test(k) ? (el[k] = setter(el, opt_v)) : el[setAttribute](k, setter(el, opt_v))
            })
        }
  
  
        /**
         * @param {string} k
         * @return {Bonzo}
         */
      , removeAttr: function (k) {
          return this.each(function (el) {
            stateAttributes.test(k) ? (el[k] = false) : el.removeAttribute(k)
          })
        }
  
  
        /**
         * @param {string=} opt_s
         * @return {Bonzo|string}
         */
      , val: function (s) {
          return (typeof s == 'string') ?
            this.attr('value', s) :
            this.length ? this[0].value : null
        }
  
        // use with care and knowledge. this data() method uses data attributes on the DOM nodes
        // to do this differently costs a lot more code. c'est la vie
        /**
         * @param {string|Object=} opt_k the key for which to get or set data
         * @param {Object=} opt_v
         * @return {Bonzo|Object}
         */
      , data: function (opt_k, opt_v) {
          var el = this[0], o, m
          if (typeof opt_v === 'undefined') {
            if (!el) return null
            o = data(el)
            if (typeof opt_k === 'undefined') {
              each(el.attributes, function (a) {
                (m = ('' + a.name).match(dattr)) && (o[camelize(m[1])] = dataValue(a.value))
              })
              return o
            } else {
              if (typeof o[opt_k] === 'undefined')
                o[opt_k] = dataValue(this.attr('data-' + decamelize(opt_k)))
              return o[opt_k]
            }
          } else {
            return this.each(function (el) { data(el)[opt_k] = opt_v })
          }
        }
  
        // DOM detachment & related
  
        /**
         * @return {Bonzo}
         */
      , remove: function () {
          this.deepEach(clearData)
  
          return this.each(function (el) {
            el[parentNode] && el[parentNode].removeChild(el)
          })
        }
  
  
        /**
         * @return {Bonzo}
         */
      , empty: function () {
          return this.each(function (el) {
            deepEach(el.childNodes, clearData)
  
            while (el.firstChild) {
              el.removeChild(el.firstChild)
            }
          })
        }
  
  
        /**
         * @return {Bonzo}
         */
      , detach: function () {
          return this.each(function (el) {
            el[parentNode].removeChild(el)
          })
        }
  
        // who uses a mouse anyway? oh right.
  
        /**
         * @param {number} y
         */
      , scrollTop: function (y) {
          return scroll.call(this, null, y, 'y')
        }
  
  
        /**
         * @param {number} x
         */
      , scrollLeft: function (x) {
          return scroll.call(this, x, null, 'x')
        }
  
    }
  
    function normalize(node, host, clone) {
      var i, l, ret
      if (typeof node == 'string') return bonzo.create(node)
      if (isNode(node)) node = [ node ]
      if (clone) {
        ret = [] // don't change original array
        for (i = 0, l = node.length; i < l; i++) ret[i] = cloneNode(host, node[i])
        return ret
      }
      return node
    }
  
    function cloneNode(host, el) {
      var c = el.cloneNode(true)
        , cloneElems
        , elElems
  
      // check for existence of an event cloner
      // preferably https://github.com/fat/bean
      // otherwise Bonzo won't do this for you
      if (host.$ && typeof host.cloneEvents == 'function') {
        host.$(c).cloneEvents(el)
  
        // clone events from every child node
        cloneElems = host.$(c).find('*')
        elElems = host.$(el).find('*')
  
        for (var i = 0; i < elElems.length; i++)
          host.$(cloneElems[i]).cloneEvents(elElems[i])
      }
      return c
    }
  
    function scroll(x, y, type) {
      var el = this[0]
      if (!el) return this
      if (x == null && y == null) {
        return (isBody(el) ? getWindowScroll() : { x: el.scrollLeft, y: el.scrollTop })[type]
      }
      if (isBody(el)) {
        win.scrollTo(x, y)
      } else {
        x != null && (el.scrollLeft = x)
        y != null && (el.scrollTop = y)
      }
      return this
    }
  
    function isBody(element) {
      return element === win || (/^(?:body|html)$/i).test(element.tagName)
    }
  
    function getWindowScroll() {
      return { x: win.pageXOffset || html.scrollLeft, y: win.pageYOffset || html.scrollTop }
    }
  
    /**
     * @param {Array.<Element>|Element|Node|string} els
     * @return {Bonzo}
     */
    function bonzo(els) {
      return new Bonzo(els)
    }
  
    bonzo.setQueryEngine = function (q) {
      query = q;
      delete bonzo.setQueryEngine
    }
  
    bonzo.aug = function (o, target) {
      // for those standalone bonzo users. this love is for you.
      for (var k in o) {
        o.hasOwnProperty(k) && ((target || Bonzo.prototype)[k] = o[k])
      }
    }
  
    bonzo.create = function (node) {
      // hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
      return typeof node == 'string' && node !== '' ?
        function () {
          var tag = /^\s*<([^\s>]+)/.exec(node)
            , el = doc.createElement('div')
            , els = []
            , p = tag ? tagMap[tag[1].toLowerCase()] : null
            , dep = p ? p[2] + 1 : 1
            , ns = p && p[3]
            , pn = parentNode
            , tb = features.autoTbody && p && p[0] == '<table>' && !(/<tbody/i).test(node)
  
          el.innerHTML = p ? (p[0] + node + p[1]) : node
          while (dep--) el = el.firstChild
          // for IE NoScope, we may insert cruft at the begining just to get it to work
          if (ns && el && el.nodeType !== 1) el = el.nextSibling
          do {
            // tbody special case for IE<8, creates tbody on any empty table
            // we don't want it if we're just after a <thead>, <caption>, etc.
            if ((!tag || el.nodeType == 1) && (!tb || el.tagName.toLowerCase() != 'tbody')) {
              els.push(el)
            }
          } while (el = el.nextSibling)
          // IE < 9 gives us a parentNode which messes up insert() check for cloning
          // `dep` > 1 can also cause problems with the insert() check (must do this last)
          each(els, function(el) { el[pn] && el[pn].removeChild(el) })
          return els
        }() : isNode(node) ? [node.cloneNode(true)] : []
    }
  
    bonzo.doc = function () {
      var vp = bonzo.viewport()
      return {
          width: Math.max(doc.body.scrollWidth, html.scrollWidth, vp.width)
        , height: Math.max(doc.body.scrollHeight, html.scrollHeight, vp.height)
      }
    }
  
    bonzo.firstChild = function (el) {
      for (var c = el.childNodes, i = 0, j = (c && c.length) || 0, e; i < j; i++) {
        if (c[i].nodeType === 1) e = c[j = i]
      }
      return e
    }
  
    bonzo.viewport = function () {
      return {
          width: ie ? html.clientWidth : self.innerWidth
        , height: ie ? html.clientHeight : self.innerHeight
      }
    }
  
    bonzo.isAncestor = 'compareDocumentPosition' in html ?
      function (container, element) {
        return (container.compareDocumentPosition(element) & 16) == 16
      } : 'contains' in html ?
      function (container, element) {
        return container !== element && container.contains(element);
      } :
      function (container, element) {
        while (element = element[parentNode]) {
          if (element === container) {
            return true
          }
        }
        return false
      }
  
    return bonzo
  }, this); // the only line we care about using a semi-colon. placed here for concatenation tools
  

  provide("bonzo", module.exports);
  provide("bonzo", module.exports);
  $.ender(module.exports);
}(global));

// ender:bonzo/ender-bridge as bonzo/ender-bridge
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function ($) {
  
    var b =  require('bonzo')
    b.setQueryEngine($)
    $.ender(b)
    $.ender(b(), true)
    $.ender({
      create: function (node) {
        return $(b.create(node))
      }
    })
  
    $.id = function (id) {
      return $([document.getElementById(id)])
    }
  
    function indexOf(ar, val) {
      for (var i = 0; i < ar.length; i++) if (ar[i] === val) return i
      return -1
    }
  
    function uniq(ar) {
      var r = [], i = 0, j = 0, k, item, inIt
      for (; item = ar[i]; ++i) {
        inIt = false
        for (k = 0; k < r.length; ++k) {
          if (r[k] === item) {
            inIt = true; break
          }
        }
        if (!inIt) r[j++] = item
      }
      return r
    }
  
    $.ender({
      parents: function (selector, closest) {
        if (!this.length) return this
        var collection = $(selector), j, k, p, r = []
        for (j = 0, k = this.length; j < k; j++) {
          p = this[j]
          while (p = p.parentNode) {
            if (~indexOf(collection, p)) {
              r.push(p)
              if (closest) break;
            }
          }
        }
        return $(uniq(r))
      }
  
    , parent: function() {
        return $(uniq(b(this).parent()))
      }
  
    , closest: function (selector) {
        return this.parents(selector, true)
      }
  
    , first: function () {
        return $(this.length ? this[0] : this)
      }
  
    , last: function () {
        return $(this.length ? this[this.length - 1] : [])
      }
  
    , next: function () {
        return $(b(this).next())
      }
  
    , previous: function () {
        return $(b(this).previous())
      }
  
    , appendTo: function (t) {
        return b(this.selector).appendTo(t, this)
      }
  
    , prependTo: function (t) {
        return b(this.selector).prependTo(t, this)
      }
  
    , insertAfter: function (t) {
        return b(this.selector).insertAfter(t, this)
      }
  
    , insertBefore: function (t) {
        return b(this.selector).insertBefore(t, this)
      }
  
    , replaceWith: function (t) {
        return b(this.selector).replaceWith(t, this)
      }
  
    , siblings: function () {
        var i, l, p, r = []
        for (i = 0, l = this.length; i < l; i++) {
          p = this[i]
          while (p = p.previousSibling) p.nodeType == 1 && r.push(p)
          p = this[i]
          while (p = p.nextSibling) p.nodeType == 1 && r.push(p)
        }
        return $(r)
      }
  
    , children: function () {
        var i, l, el, r = []
        for (i = 0, l = this.length; i < l; i++) {
          if (!(el = b.firstChild(this[i]))) continue;
          r.push(el)
          while (el = el.nextSibling) el.nodeType == 1 && r.push(el)
        }
        return $(uniq(r))
      }
  
    , height: function (v) {
        return dimension.call(this, 'height', v)
      }
  
    , width: function (v) {
        return dimension.call(this, 'width', v)
      }
    }, true)
  
    /**
     * @param {string} type either width or height
     * @param {number=} opt_v becomes a setter instead of a getter
     * @return {number}
     */
    function dimension(type, opt_v) {
      return typeof opt_v == 'undefined'
        ? b(this).dim()[type]
        : this.css(type, opt_v)
    }
  }(ender));

  provide("bonzo/ender-bridge", module.exports);
  provide("bonzo/ender-bridge", module.exports);
  $.ender(module.exports);
}(global));

// ender:bean as bean
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*!
    * bean.js - copyright Jacob Thornton 2011
    * https://github.com/fat/bean
    * MIT License
    * special thanks to:
    * dean edwards: http://dean.edwards.name/
    * dperini: https://github.com/dperini/nwevents
    * the entire mootools team: github.com/mootools/mootools-core
    */
  !function (name, context, definition) {
    if (typeof module !== 'undefined') module.exports = definition(name, context);
    else if (typeof define === 'function' && typeof define.amd  === 'object') define(definition);
    else context[name] = definition(name, context);
  }('bean', this, function (name, context) {
    var win = window
      , old = context[name]
      , overOut = /over|out/
      , namespaceRegex = /[^\.]*(?=\..*)\.|.*/
      , nameRegex = /\..*/
      , addEvent = 'addEventListener'
      , attachEvent = 'attachEvent'
      , removeEvent = 'removeEventListener'
      , detachEvent = 'detachEvent'
      , ownerDocument = 'ownerDocument'
      , targetS = 'target'
      , qSA = 'querySelectorAll'
      , doc = document || {}
      , root = doc.documentElement || {}
      , W3C_MODEL = root[addEvent]
      , eventSupport = W3C_MODEL ? addEvent : attachEvent
      , slice = Array.prototype.slice
      , mouseTypeRegex = /click|mouse(?!(.*wheel|scroll))|menu|drag|drop/i
      , mouseWheelTypeRegex = /mouse.*(wheel|scroll)/i
      , textTypeRegex = /^text/i
      , touchTypeRegex = /^touch|^gesture/i
      , ONE = {} // singleton for quick matching making add() do one()
  
      , nativeEvents = (function (hash, events, i) {
          for (i = 0; i < events.length; i++)
            hash[events[i]] = 1
          return hash
        }({}, (
            'click dblclick mouseup mousedown contextmenu ' +                  // mouse buttons
            'mousewheel mousemultiwheel DOMMouseScroll ' +                     // mouse wheel
            'mouseover mouseout mousemove selectstart selectend ' +            // mouse movement
            'keydown keypress keyup ' +                                        // keyboard
            'orientationchange ' +                                             // mobile
            'focus blur change reset select submit ' +                         // form elements
            'load unload beforeunload resize move DOMContentLoaded '+          // window
            'readystatechange message ' +                                      // window
            'error abort scroll ' +                                            // misc
            (W3C_MODEL ? // element.fireEvent('onXYZ'... is not forgiving if we try to fire an event
                         // that doesn't actually exist, so make sure we only do these on newer browsers
              'show ' +                                                          // mouse buttons
              'input invalid ' +                                                 // form elements
              'touchstart touchmove touchend touchcancel ' +                     // touch
              'gesturestart gesturechange gestureend ' +                         // gesture
              'readystatechange pageshow pagehide popstate ' +                   // window
              'hashchange offline online ' +                                     // window
              'afterprint beforeprint ' +                                        // printing
              'dragstart dragenter dragover dragleave drag drop dragend ' +      // dnd
              'loadstart progress suspend emptied stalled loadmetadata ' +       // media
              'loadeddata canplay canplaythrough playing waiting seeking ' +     // media
              'seeked ended durationchange timeupdate play pause ratechange ' +  // media
              'volumechange cuechange ' +                                        // media
              'checking noupdate downloading cached updateready obsolete ' +     // appcache
              '' : '')
          ).split(' ')
        ))
  
      , customEvents = (function () {
          var cdp = 'compareDocumentPosition'
            , isAncestor = cdp in root
                ? function (element, container) {
                    return container[cdp] && (container[cdp](element) & 16) === 16
                  }
                : 'contains' in root
                  ? function (element, container) {
                      container = container.nodeType === 9 || container === window ? root : container
                      return container !== element && container.contains(element)
                    }
                  : function (element, container) {
                      while (element = element.parentNode) if (element === container) return 1
                      return 0
                    }
  
          function check(event) {
            var related = event.relatedTarget
            return !related
              ? related === null
              : (related !== this && related.prefix !== 'xul' && !/document/.test(this.toString()) && !isAncestor(related, this))
          }
  
          return {
              mouseenter: { base: 'mouseover', condition: check }
            , mouseleave: { base: 'mouseout', condition: check }
            , mousewheel: { base: /Firefox/.test(navigator.userAgent) ? 'DOMMouseScroll' : 'mousewheel' }
          }
        }())
  
      , fixEvent = (function () {
          var commonProps = 'altKey attrChange attrName bubbles cancelable ctrlKey currentTarget detail eventPhase getModifierState isTrusted metaKey relatedNode relatedTarget shiftKey srcElement target timeStamp type view which'.split(' ')
            , mouseProps = commonProps.concat('button buttons clientX clientY dataTransfer fromElement offsetX offsetY pageX pageY screenX screenY toElement'.split(' '))
            , mouseWheelProps = mouseProps.concat('wheelDelta wheelDeltaX wheelDeltaY wheelDeltaZ axis'.split(' ')) // 'axis' is FF specific
            , keyProps = commonProps.concat('char charCode key keyCode keyIdentifier keyLocation'.split(' '))
            , textProps = commonProps.concat(['data'])
            , touchProps = commonProps.concat('touches targetTouches changedTouches scale rotation'.split(' '))
            , messageProps = commonProps.concat(['data', 'origin', 'source'])
            , preventDefault = 'preventDefault'
            , createPreventDefault = function (event) {
                return function () {
                  if (event[preventDefault])
                    event[preventDefault]()
                  else
                    event.returnValue = false
                }
              }
            , stopPropagation = 'stopPropagation'
            , createStopPropagation = function (event) {
                return function () {
                  if (event[stopPropagation])
                    event[stopPropagation]()
                  else
                    event.cancelBubble = true
                }
              }
            , createStop = function (synEvent) {
                return function () {
                  synEvent[preventDefault]()
                  synEvent[stopPropagation]()
                  synEvent.stopped = true
                }
              }
            , copyProps = function (event, result, props) {
                var i, p
                for (i = props.length; i--;) {
                  p = props[i]
                  if (!(p in result) && p in event) result[p] = event[p]
                }
              }
  
          return function (event, isNative) {
            var result = { originalEvent: event, isNative: isNative }
            if (!event)
              return result
  
            var props
              , type = event.type
              , target = event[targetS] || event.srcElement
  
            result[preventDefault] = createPreventDefault(event)
            result[stopPropagation] = createStopPropagation(event)
            result.stop = createStop(result)
            result[targetS] = target && target.nodeType === 3 ? target.parentNode : target
  
            if (isNative) { // we only need basic augmentation on custom events, the rest is too expensive
              if (type.indexOf('key') !== -1) {
                props = keyProps
                result.keyCode = event.keyCode || event.which
              } else if (mouseTypeRegex.test(type)) {
                props = mouseProps
                result.rightClick = event.which === 3 || event.button === 2
                result.pos = { x: 0, y: 0 }
                if (event.pageX || event.pageY) {
                  result.clientX = event.pageX
                  result.clientY = event.pageY
                } else if (event.clientX || event.clientY) {
                  result.clientX = event.clientX + doc.body.scrollLeft + root.scrollLeft
                  result.clientY = event.clientY + doc.body.scrollTop + root.scrollTop
                }
                if (overOut.test(type))
                  result.relatedTarget = event.relatedTarget || event[(type === 'mouseover' ? 'from' : 'to') + 'Element']
              } else if (touchTypeRegex.test(type)) {
                props = touchProps
              } else if (mouseWheelTypeRegex.test(type)) {
                props = mouseWheelProps
              } else if (textTypeRegex.test(type)) {
                props = textProps
              } else if (type === 'message') {
                props = messageProps
              }
              copyProps(event, result, props || commonProps)
            }
            return result
          }
        }())
  
        // if we're in old IE we can't do onpropertychange on doc or win so we use doc.documentElement for both
      , targetElement = function (element, isNative) {
          return !W3C_MODEL && !isNative && (element === doc || element === win) ? root : element
        }
  
        // we use one of these per listener, of any type
      , RegEntry = (function () {
          function entry(element, type, handler, original, namespaces) {
            var isNative = this.isNative = nativeEvents[type] && element[eventSupport]
            this.element = element
            this.type = type
            this.handler = handler
            this.original = original
            this.namespaces = namespaces
            this.custom = customEvents[type]
            this.eventType = W3C_MODEL || isNative ? type : 'propertychange'
            this.customType = !W3C_MODEL && !isNative && type
            this[targetS] = targetElement(element, isNative)
            this[eventSupport] = this[targetS][eventSupport]
          }
  
          entry.prototype = {
              // given a list of namespaces, is our entry in any of them?
              inNamespaces: function (checkNamespaces) {
                var i, j
                if (!checkNamespaces)
                  return true
                if (!this.namespaces)
                  return false
                for (i = checkNamespaces.length; i--;) {
                  for (j = this.namespaces.length; j--;) {
                    if (checkNamespaces[i] === this.namespaces[j])
                      return true
                  }
                }
                return false
              }
  
              // match by element, original fn (opt), handler fn (opt)
            , matches: function (checkElement, checkOriginal, checkHandler) {
                return this.element === checkElement &&
                  (!checkOriginal || this.original === checkOriginal) &&
                  (!checkHandler || this.handler === checkHandler)
              }
          }
  
          return entry
        }())
  
      , registry = (function () {
          // our map stores arrays by event type, just because it's better than storing
          // everything in a single array. uses '$' as a prefix for the keys for safety
          var map = {}
  
            // generic functional search of our registry for matching listeners,
            // `fn` returns false to break out of the loop
            , forAll = function (element, type, original, handler, fn) {
                if (!type || type === '*') {
                  // search the whole registry
                  for (var t in map) {
                    if (t.charAt(0) === '$')
                      forAll(element, t.substr(1), original, handler, fn)
                  }
                } else {
                  var i = 0, l, list = map['$' + type], all = element === '*'
                  if (!list)
                    return
                  for (l = list.length; i < l; i++) {
                    if (all || list[i].matches(element, original, handler))
                      if (!fn(list[i], list, i, type))
                        return
                  }
                }
              }
  
            , has = function (element, type, original) {
                // we're not using forAll here simply because it's a bit slower and this
                // needs to be fast
                var i, list = map['$' + type]
                if (list) {
                  for (i = list.length; i--;) {
                    if (list[i].matches(element, original, null))
                      return true
                  }
                }
                return false
              }
  
            , get = function (element, type, original) {
                var entries = []
                forAll(element, type, original, null, function (entry) { return entries.push(entry) })
                return entries
              }
  
            , put = function (entry) {
                (map['$' + entry.type] || (map['$' + entry.type] = [])).push(entry)
                return entry
              }
  
            , del = function (entry) {
                forAll(entry.element, entry.type, null, entry.handler, function (entry, list, i) {
                  list.splice(i, 1)
                  if (list.length === 0)
                    delete map['$' + entry.type]
                  return false
                })
              }
  
              // dump all entries, used for onunload
            , entries = function () {
                var t, entries = []
                for (t in map) {
                  if (t.charAt(0) === '$')
                    entries = entries.concat(map[t])
                }
                return entries
              }
  
          return { has: has, get: get, put: put, del: del, entries: entries }
        }())
  
      , selectorEngine = doc[qSA]
          ? function (s, r) {
              return r[qSA](s)
            }
          : function () {
              throw new Error('Bean: No selector engine installed') // eeek
            }
  
      , setSelectorEngine = function (e) {
          selectorEngine = e
        }
  
        // add and remove listeners to DOM elements
      , listener = W3C_MODEL ? function (element, type, fn, add) {
          element[add ? addEvent : removeEvent](type, fn, false)
        } : function (element, type, fn, add, custom) {
          if (custom && add && element['_on' + custom] === null)
            element['_on' + custom] = 0
          element[add ? attachEvent : detachEvent]('on' + type, fn)
        }
  
      , nativeHandler = function (element, fn, args) {
          var beanDel = fn.__beanDel
            , handler = function (event) {
            event = fixEvent(event || ((this[ownerDocument] || this.document || this).parentWindow || win).event, true)
            if (beanDel) // delegated event, fix the fix
              event.currentTarget = beanDel.ft(event[targetS], element)
            return fn.apply(element, [event].concat(args))
          }
          handler.__beanDel = beanDel
          return handler
        }
  
      , customHandler = function (element, fn, type, condition, args, isNative) {
          var beanDel = fn.__beanDel
            , handler = function (event) {
            var target = beanDel ? beanDel.ft(event[targetS], element) : this // deleated event
            if (condition ? condition.apply(target, arguments) : W3C_MODEL ? true : event && event.propertyName === '_on' + type || !event) {
              if (event) {
                event = fixEvent(event || ((this[ownerDocument] || this.document || this).parentWindow || win).event, isNative)
                event.currentTarget = target
              }
              fn.apply(element, event && (!args || args.length === 0) ? arguments : slice.call(arguments, event ? 0 : 1).concat(args))
            }
          }
          handler.__beanDel = beanDel
          return handler
        }
  
      , once = function (rm, element, type, fn, originalFn) {
          // wrap the handler in a handler that does a remove as well
          return function () {
            rm(element, type, originalFn)
            fn.apply(this, arguments)
          }
        }
  
      , removeListener = function (element, orgType, handler, namespaces) {
          var i, l, entry
            , type = (orgType && orgType.replace(nameRegex, ''))
            , handlers = registry.get(element, type, handler)
  
          for (i = 0, l = handlers.length; i < l; i++) {
            if (handlers[i].inNamespaces(namespaces)) {
              if ((entry = handlers[i])[eventSupport])
                listener(entry[targetS], entry.eventType, entry.handler, false, entry.type)
              // TODO: this is problematic, we have a registry.get() and registry.del() that
              // both do registry searches so we waste cycles doing this. Needs to be rolled into
              // a single registry.forAll(fn) that removes while finding, but the catch is that
              // we'll be splicing the arrays that we're iterating over. Needs extra tests to
              // make sure we don't screw it up. @rvagg
              registry.del(entry)
            }
          }
        }
  
      , addListener = function (element, orgType, fn, originalFn, args) {
          var entry
            , type = orgType.replace(nameRegex, '')
            , namespaces = orgType.replace(namespaceRegex, '').split('.')
  
          if (registry.has(element, type, fn))
            return element // no dupe
          if (type === 'unload')
            fn = once(removeListener, element, type, fn, originalFn) // self clean-up
          if (customEvents[type]) {
            if (customEvents[type].condition)
              fn = customHandler(element, fn, type, customEvents[type].condition, args, true)
            type = customEvents[type].base || type
          }
          entry = registry.put(new RegEntry(element, type, fn, originalFn, namespaces[0] && namespaces))
          entry.handler = entry.isNative ?
            nativeHandler(element, entry.handler, args) :
            customHandler(element, entry.handler, type, false, args, false)
          if (entry[eventSupport])
            listener(entry[targetS], entry.eventType, entry.handler, true, entry.customType)
        }
  
      , del = function (selector, fn, $) {
              //TODO: findTarget (therefore $) is called twice, once for match and once for
              // setting e.currentTarget, fix this so it's only needed once
          var findTarget = function (target, root) {
                var i, array = typeof selector === 'string' ? $(selector, root) : selector
                for (; target && target !== root; target = target.parentNode) {
                  for (i = array.length; i--;) {
                    if (array[i] === target)
                      return target
                  }
                }
              }
            , handler = function (e) {
                var match = findTarget(e[targetS], this)
                match && fn.apply(match, arguments)
              }
  
          handler.__beanDel = {
              ft: findTarget // attach it here for customEvents to use too
            , selector: selector
            , $: $
          }
          return handler
        }
  
      , remove = function (element, typeSpec, fn) {
          var k, type, namespaces, i
            , rm = removeListener
            , isString = typeSpec && typeof typeSpec === 'string'
  
          if (isString && typeSpec.indexOf(' ') > 0) {
            // remove(el, 't1 t2 t3', fn) or remove(el, 't1 t2 t3')
            typeSpec = typeSpec.split(' ')
            for (i = typeSpec.length; i--;)
              remove(element, typeSpec[i], fn)
            return element
          }
          type = isString && typeSpec.replace(nameRegex, '')
          if (type && customEvents[type])
            type = customEvents[type].type
          if (!typeSpec || isString) {
            // remove(el) or remove(el, t1.ns) or remove(el, .ns) or remove(el, .ns1.ns2.ns3)
            if (namespaces = isString && typeSpec.replace(namespaceRegex, ''))
              namespaces = namespaces.split('.')
            rm(element, type, fn, namespaces)
          } else if (typeof typeSpec === 'function') {
            // remove(el, fn)
            rm(element, null, typeSpec)
          } else {
            // remove(el, { t1: fn1, t2, fn2 })
            for (k in typeSpec) {
              if (typeSpec.hasOwnProperty(k))
                remove(element, k, typeSpec[k])
            }
          }
          return element
        }
  
        // 5th argument, $=selector engine, is deprecated and will be removed
      , add = function (element, events, fn, delfn, $) {
          var type, types, i, args
            , originalFn = fn
            , isDel = fn && typeof fn === 'string'
  
          if (events && !fn && typeof events === 'object') {
            for (type in events) {
              if (events.hasOwnProperty(type))
                add.apply(this, [ element, type, events[type] ])
            }
          } else {
            args = arguments.length > 3 ? slice.call(arguments, 3) : []
            types = (isDel ? fn : events).split(' ')
            isDel && (fn = del(events, (originalFn = delfn), $ || selectorEngine)) && (args = slice.call(args, 1))
            // special case for one()
            this === ONE && (fn = once(remove, element, events, fn, originalFn))
            for (i = types.length; i--;) addListener(element, types[i], fn, originalFn, args)
          }
          return element
        }
  
      , one = function () {
          return add.apply(ONE, arguments)
        }
  
      , fireListener = W3C_MODEL ? function (isNative, type, element) {
          var evt = doc.createEvent(isNative ? 'HTMLEvents' : 'UIEvents')
          evt[isNative ? 'initEvent' : 'initUIEvent'](type, true, true, win, 1)
          element.dispatchEvent(evt)
        } : function (isNative, type, element) {
          element = targetElement(element, isNative)
          // if not-native then we're using onpropertychange so we just increment a custom property
          isNative ? element.fireEvent('on' + type, doc.createEventObject()) : element['_on' + type]++
        }
  
      , fire = function (element, type, args) {
          var i, j, l, names, handlers
            , types = type.split(' ')
  
          for (i = types.length; i--;) {
            type = types[i].replace(nameRegex, '')
            if (names = types[i].replace(namespaceRegex, ''))
              names = names.split('.')
            if (!names && !args && element[eventSupport]) {
              fireListener(nativeEvents[type], type, element)
            } else {
              // non-native event, either because of a namespace, arguments or a non DOM element
              // iterate over all listeners and manually 'fire'
              handlers = registry.get(element, type)
              args = [false].concat(args)
              for (j = 0, l = handlers.length; j < l; j++) {
                if (handlers[j].inNamespaces(names))
                  handlers[j].handler.apply(element, args)
              }
            }
          }
          return element
        }
  
      , clone = function (element, from, type) {
          var i = 0
            , handlers = registry.get(from, type)
            , l = handlers.length
            , args, beanDel
  
          for (;i < l; i++) {
            if (handlers[i].original) {
              beanDel = handlers[i].handler.__beanDel
              if (beanDel) {
                args = [ element, beanDel.selector, handlers[i].type, handlers[i].original, beanDel.$]
              } else
                args = [ element, handlers[i].type, handlers[i].original ]
              add.apply(null, args)
            }
          }
          return element
        }
  
      , bean = {
            add: add
          , one: one
          , remove: remove
          , clone: clone
          , fire: fire
          , setSelectorEngine: setSelectorEngine
          , noConflict: function () {
              context[name] = old
              return this
            }
        }
  
    if (win[attachEvent]) {
      // for IE, clean up on unload to avoid leaks
      var cleanup = function () {
        var i, entries = registry.entries()
        for (i in entries) {
          if (entries[i].type && entries[i].type !== 'unload')
            remove(entries[i].element, entries[i].type)
        }
        win[detachEvent]('onunload', cleanup)
        win.CollectGarbage && win.CollectGarbage()
      }
      win[attachEvent]('onunload', cleanup)
    }
  
    return bean
  })
  

  provide("bean", module.exports);
  provide("bean", module.exports);
  $.ender(module.exports);
}(global));

// ender:bean/ender-bridge as bean/ender-bridge
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  !function ($) {
    var b =  require('bean')
      , integrate = function (method, type, method2) {
          var _args = type ? [type] : []
          return function () {
            for (var i = 0, l = this.length; i < l; i++) {
              if (!arguments.length && method == 'add' && type) method = 'fire'
              b[method].apply(this, [this[i]].concat(_args, Array.prototype.slice.call(arguments, 0)))
            }
            return this
          }
        }
      , add = integrate('add')
      , remove = integrate('remove')
      , fire = integrate('fire')
  
      , methods = {
            on: add // NOTE: .on() is likely to change in the near future, don't rely on this as-is see https://github.com/fat/bean/issues/55
          , addListener: add
          , bind: add
          , listen: add
          , delegate: add
  
          , one: integrate('one')
  
          , off: remove
          , unbind: remove
          , unlisten: remove
          , removeListener: remove
          , undelegate: remove
  
          , emit: fire
          , trigger: fire
  
          , cloneEvents: integrate('clone')
  
          , hover: function (enter, leave, i) { // i for internal
              for (i = this.length; i--;) {
                b.add.call(this, this[i], 'mouseenter', enter)
                b.add.call(this, this[i], 'mouseleave', leave)
              }
              return this
            }
        }
  
      , shortcuts =
           ('blur change click dblclick error focus focusin focusout keydown keypress '
          + 'keyup load mousedown mouseenter mouseleave mouseout mouseover mouseup '
          + 'mousemove resize scroll select submit unload').split(' ')
  
    for (var i = shortcuts.length; i--;) {
      methods[shortcuts[i]] = integrate('add', shortcuts[i])
    }
  
    b.setSelectorEngine($)
  
    $.ender(methods, true)
  }(ender)
  

  provide("bean/ender-bridge", module.exports);
  provide("bean/ender-bridge", module.exports);
  $.ender(module.exports);
}(global));

// ender:ahr2/utils as ahr2/utils
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jslint white: false, onevar: true, undef: true, node: true, nomen: true, regexp: false, plusplus: true, bitwise: true, es5: true, newcap: true, maxerr: 5 */
  (function () {
    "use strict";
  
    var utils = exports
      , jsonpRegEx = /\s*([\$\w]+)\s*\(\s*(.*)\s*\)\s*/;
  
    utils.clone = function (obj) {
      return JSON.parse(JSON.stringify(obj));
    };
  
    // useful for extending global options onto a local variable
    utils.extend = function (global, local) {
      //global = utils.clone(global);
      Object.keys(local).forEach(function (key) {
        global[key] = local[key] || global[key];
      });
      return global;
    };
  
    // useful for extending global options onto a local variable
    utils.preset = function (local, global) {
      // TODO copy functions
      // TODO recurse / deep copy
      global = utils.clone(global);
      Object.keys(global).forEach(function (key) {
        if ('undefined' === typeof local[key]) {
          local[key] = global[key];
        }
      });
      return local;
    };
  
    utils.objectToLowerCase = function (obj, recurse) {
      // Make headers all lower-case
      Object.keys(obj).forEach(function (key) {
        var value;
  
        value = obj[key];
        delete obj[key];
        key = key.toLowerCase();
        /*
        if ('string' === typeof value) {
          obj[key] = value.toLowerCase();
        } else {
          obj[key] = value;
        }
        */
        obj[key] = value;
      });
      return obj;
    };
  
    utils.parseJsonp = function (jsonpCallback, jsonp) {
      var match = jsonp.match(jsonpRegEx)
        , data
        , json;
  
      if (!match || !match[1] || !match[2]) {
        throw new Error('No JSONP matched');
      }
      if (jsonpCallback !== match[1]) {
        throw new Error('JSONP callback doesn\'t match');
      }
      json = match[2];
  
      data = JSON.parse(json);
      return data;
    };
  
    utils.uriEncodeObject = function(json) {
      var query = '';
  
      try {
        JSON.parse(JSON.stringify(json));
      } catch(e) {
        return 'ERR_CYCLIC_DATA_STRUCTURE';
      }
  
      if ('object' !== typeof json) {
        return 'ERR_NOT_AN_OBJECT';
      }
  
      Object.keys(json).forEach(function (key) {
        var param, value;
  
        // assume that the user meant to delete this element
        if ('undefined' === typeof json[key]) {
          return;
        }
  
        param = encodeURIComponent(key);
        value = encodeURIComponent(json[key]);
        query += '&' + param;
  
        // assume that the user wants just the param name sent
        if (null !== json[key]) {
          query += '=' + value;
        }
      });
  
      // remove first '&'
      return query.substring(1);
    };
  
    utils.addParamsToUri = function(uri, params) {
      var query
        , anchor = ''
        , anchorpos;
  
      uri = uri || "";
      anchor = '';
      params = params || {};
  
      // just in case this gets used client-side
      if (-1 !== (anchorpos = uri.indexOf('#'))) {
        anchor = uri.substr(anchorpos);
        uri = uri.substr(0, anchorpos);
      }
  
      query = utils.uriEncodeObject(params);
  
      // cut the leading '&' if no other params have been written
      if (query.length > 0) {
        if (!uri.match(/\?/)) {
          uri += '?' + query;
        } else {
          uri += '&' + query;
        }
      }
  
      return uri + anchor;
    };
  }());
  

  provide("ahr2/utils", module.exports);
  provide("ahr2/utils", module.exports);
  $.ender(module.exports);
}(global));

// ender:ahr2/browser/jsonp as ahr2/browser/jsonp
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
  /*
     loadstart;
     progress;
     abort;
     error;
     load;
     timeout;
     loadend;
  */
  (function () {
    "use strict";
  
    function browserJsonpClient(req, res) {
      // TODO check for Same-domain / XHR2/CORS support
      // before attempting to insert script tag
      // Those support headers and such, which are good
      var options = req.userOptions
        , cbkey = options.jsonpCallback
        , window = require('window')
        , document = require('document')
        , script = document.createElement("script")
        , head = document.getElementsByTagName("head")[0] || document.documentElement
        , addParamsToUri =  require('ahr2/utils').addParamsToUri
        , timeout
        , fulfilled; // TODO move this logic elsewhere into the emitter
  
      // cleanup: cleanup window and dom
      function cleanup() {
        fulfilled = true;
        window[cbkey] = undefined;
        try {
          delete window[cbkey];
          // may have already been removed
          head.removeChild(script);
        } catch(e) {}
      }
  
      function abortRequest() {
        req.emit('abort');
        cleanup();
      }
  
      function abortResponse() {
        res.emit('abort');
        cleanup();
      }
  
      function prepareResponse() {
        // Sanatize data, Send, Cleanup
        function onSuccess(data) {
          var ev = {
            lengthComputable: false,
            loaded: 1,
            total: 1
          };
          if (fulfilled) {
            return;
          }
  
          clearTimeout(timeout);
          res.emit('loadstart', ev);
          // sanitize
          data = JSON.parse(JSON.stringify(data));
          res.emit('progress', ev);
          ev.target = { result: data };
          res.emit('load', ev);
          cleanup();
        }
  
        function onTimeout() {
          res.emit('timeout', {});
          res.emit('error', new Error('timeout'));
          cleanup();
        }
  
        window[cbkey] = onSuccess;
        // onError: Set timeout if script tag fails to load
        if (options.timeout) {
          //timeout = setTimeout(onTimeout, options.timeout);
        }
      }
  
      function makeRequest() {
        var ev = {}
          , jsonp = {};
  
        function onError(ev) {
          res.emit('error', ev);
        }
  
        // ?search=kittens&jsonp=jsonp123456
        jsonp[options.jsonp] = options.jsonpCallback;
        options.href = addParamsToUri(options.href, jsonp);
  
        // Insert JSONP script into the DOM
        // set script source to the service that responds with thepadded JSON data
        req.emit('loadstart', ev);
        try {
          script.setAttribute("type", "text/javascript");
          script.setAttribute("async", "async");
          script.setAttribute("src", options.href);
          // Note that this only works in some browsers,
          // but it's better than nothing
          script.onerror = onError;
          head.insertBefore(script, head.firstChild);
        } catch(e) {
          req.emit('error', e);
        }
  
        // failsafe cleanup
        setTimeout(cleanup, 2 * 60 * 1000);
        // a moot point since the "load" occurs so quickly
        req.emit('progress', ev);
        req.emit('load', ev);
      }
  
      setTimeout(makeRequest, 0);
      req.abort = abortRequest;
      res.abort = abortResponse;
      prepareResponse();
  
      return res;
    }
  
    module.exports = browserJsonpClient;
  }());
  

  provide("ahr2/browser/jsonp", module.exports);
  provide("ahr2/browser/jsonp", module.exports);
  $.ender(module.exports);
}(global));

// ender:ahr2/options as ahr2/options
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
  (function () {
    "use strict";
  
    var globalOptions
      , ahrOptions = exports
      , url = require('url')
      , querystring = require('querystring')
      , File = require('File')
      , FileList = require('FileList')
      , btoa = require('btoa')
      , utils =  require('ahr2/utils')
      , location
      , uriEncodeObject
      , clone
      , preset
      , objectToLowerCase
      ;
  
    /*
     * Some browsers don't yet have support for FormData.
     * This isn't a real fix, but it stops stuff from crashing.
     * 
     * This should probably be replaced with a real FormData impl, but whatever.
     */
    function FormData() {
    }
    
    try {
      FormData = require('FormData');
    } catch (e) {
      console.warn('FormData does not exist; using a NOP instead');
    }
  
    // TODO get the "root" dir... somehow
    try {
      location = require('./location');
    } catch(e) {
      location = require('location');
    }
  
    uriEncodeObject = utils.uriEncodeObject;
    clone = utils.clone;
    preset = utils.preset;
    objectToLowerCase = utils.objectToLowerCase;
  
    globalOptions = {
      ssl: false,
      method: 'GET',
      headers: {
        //'accept': "application/json; charset=utf-8, */*; q=0.5"
      },
      redirectCount: 0,
      redirectCountMax: 5,
      // contentType: 'json',
      // accept: 'json',
      followRedirect: true,
      timeout: 20000
    };
  
  
    //
    // Manage global options while keeping state safe
    //
    ahrOptions.globalOptionKeys = function () {
      return Object.keys(globalOptions);
    };
  
    ahrOptions.globalOption = function (key, val) {
      if ('undefined' === typeof val) {
        return globalOptions[key];
      }
      if (null === val) {
        val = undefined;
      }
      globalOptions[key] = val;
    };
  
    ahrOptions.setGlobalOptions = function (bag) {
      Object.keys(bag).forEach(function (key) {
        globalOptions[key] = bag[key];
      });
    };
  
  
    /*
     * About the HTTP spec and which methods allow bodies, etc:
     * http://stackoverflow.com/questions/299628/is-an-entity-body-allowed-for-an-http-delete-request
     */
    function checkBodyAllowed(options) {
      var method = options.method.toUpperCase();
      if ('HEAD' !== method && 'GET' !== method && 'DELETE' !== method && 'OPTIONS' !== method) {
        return true;
      }
      if (options.body && !options.forceAllowBody) {
        throw new Error("The de facto standard is that '" + method + "' should not have a body.\n" +
          "Most web servers just ignore it. Please use 'query' rather than 'body'.\n" +
          "Also, you may consider filing this as a bug - please give an explanation.\n" +
          "Finally, you may allow this by passing { forceAllowBody: 'true' } ");
      }
      if (options.body && options.jsonp) {
        throw new Error("The de facto standard is that 'jsonp' should not have a body (and I don't see how it could have one anyway).\n" +
          "If you consider filing this as a bug please give an explanation.");
      }
    }
  
  
    /*
      Node.js
  
      > var url = require('url');
      > var urlstring = 'http://user:pass@host.com:8080/p/a/t/h?query=string#hash';
      > url.parse(urlstring, true);
      { href: 'http://user:pass@host.com:8080/p/a/t/h?query=string#hash',
        protocol: 'http:',
        host: 'user:pass@host.com:8080',
        auth: 'user:pass',
        hostname: 'host.com',
        port: '8080',
        pathname: '/p/a/t/h',
        search: '?query=string',
        hash: '#hash',
  
        slashes: true,
        query: {'query':'string'} } // 'query=string'
    */
  
    /*
      Browser
  
        href: "http://user:pass@host.com:8080/p/a/t/h?query=string#hash"
        protocol: "http:" 
        host: "host.com:8080"
        hostname: "host.com"
        port: "8080"
        pathname: "/p/a/t/h"
        search: '?query=string',
        hash: "#hash"
  
        origin: "http://host.com:8080"
     */
  
    function handleUri(options) {
      var presets
        , urlObj
        , auth
        ;
  
      presets = clone(globalOptions);
  
      if (!options) {
        throw new Error('ARe yOu kiddiNg me? You have to provide some sort of options');
      }
  
      if ('string' === typeof options) {
        options = {
          href: options
        };
      }
      if (options.uri || options.url) {
        console.warn('Use `options.href`. `options.url` and `options.uri` are obsolete');
        options.href = options.href || options.url || options.url;
      }
      if (options.params) {
        console.warn('Use `options.query`. `options.params` is obsolete');
        options.query = options.query || options.params;
      }
  
  
      //
      // pull `urlObj` from `options`
      //
      if (options.href) {
        urlObj = url.parse(options.href, true, true);
        if (urlObj.query && options.query) {
          Object.keys(options.query).forEach(function (key) {
            urlObj.query[key] = options.query[key];
          });
        }
        // ignored anyway
        delete urlObj.href;
        // these trump other options
        delete urlObj.host;
        delete urlObj.search;
      } else {
        urlObj = {
            protocol: options.protocol || location.protocol
        //  host trumps auth, hostname, and port
          , host: options.host
          , auth: options.auth
          , hostname: options.hostname || location.hostname
          , port: options.port || location.port
          , pathname: url.resolve(location.pathname, options.pathname || '') || '/'
        // search trumps query
        //, search: options.search
          , query: options.query || querystring.parse(options.search||"")
          , hash: options.hash
        };
      }
      delete options.href;
      delete options.host;
      delete options.auth;
      delete options.hostname;
      delete options.port;
      delete options.path;
      delete options.search;
      delete options.query;
      delete options.hash;
  
      // Use SSL if desired
      if ('https:' === urlObj.protocol || '443' === urlObj.port || true === options.ssl) {
        options.ssl = true;
        urlObj.port = urlObj.port || '443';
        // hopefully no one would set prt 443 to standard http
        urlObj.protocol = 'https:';
      }
  
      if ('tcp:' === urlObj.protocol || 'tcps:' === urlObj.protocol || 'udp:' === urlObj.protocol) {
        options.method = options.method || 'POST';
      }
  
      if (!options.method && (options.body || options.encodedBody)) {
        options.method = 'POST';
      }
  
      if (options.jsonp) {
        // i.e. /path/to/res?x=y&jsoncallback=jsonp8765
        // i.e. /path/to/res?x=y&json=jsonp_ae75f
        options.jsonpCallback = 'jsonp_' + (new Date()).valueOf();
        options.dataType = 'jsonp';
        urlObj.query[options.jsonp] = options.jsonpCallback;
      }
  
      // for the sake of the browser, but it doesn't hurt node
      if (!urlObj.auth && options.username && options.password) {
        urlObj.auth = options.username + ':' + options.password;
      } else if (urlObj.auth) {
        urlObj.username = urlObj.auth.split(':')[0];
        urlObj.password = urlObj.auth.split(':')[1];
      }
  
      auth = urlObj.auth;
      urlObj.auth = undefined;
      urlObj.href = url.format(urlObj);
      urlObj = url.parse(urlObj.href, true, true);
      urlObj.auth = urlObj.auth || auth;
  
      preset(options, presets);
      preset(options, urlObj);
      options.syncback = options.syncback || function () {};
  
      return options;
    }
  
    function handleHeaders(options) {
      var presets
        , ua
        ;
  
      presets = clone(globalOptions);
  
      options.headers = options.headers || {};
      if (options.jsonp) {
        options.headers.accept = "text/javascript";
      }
      // TODO user-agent should retain case
      options.headers = objectToLowerCase(options.headers || {});
      options.headers = preset(options.headers, presets.headers);
      // TODO port?
      options.headers.host = options.hostname;
      options.headers = objectToLowerCase(options.headers);
      if (options.contentType) {
        options.headers['content-type'] = options.contentType;
      }
  
      // for the sake of node, but it doesn't hurt the browser
      if (options.auth) {
        options.headers.authorization = 'Basic ' + btoa(options.auth);
      }
      delete options.auth;
  
      return options;
    }
  
    function hasFiles(body, formData) {
      var hasFile = false;
      if ('object' !== typeof body) {
        return false;
      }
      Object.keys(body).forEach(function (key) {
        var item = body[key];
        if (item instanceof File) {
          hasFile = true;
        } else if (item instanceof FileList) {
          hasFile = true;
        }
      });
      return hasFile;
    }
    function addFiles(body, formData) {
  
      Object.keys(body).forEach(function (key) {
        var item = body[key];
  
        if (item instanceof File) {
          formData.append(key, item);
        } else if (item instanceof FileList) {
          item.forEach(function (file) {
            formData.append(key, file);
          });
        } else {
          formData.append(key, item);
        }
      });
    }
  
    // TODO convert object/map body into array body
    // { "a": 1, "b": 2 } --> [ "name": "a", "value": 1, "name": "b", "value": 2 ]
    // this would be more appropriate and in better accordance with the http spec
    // as it allows for a value such as "a" to have multiple values rather than
    // having to do "a1", "a2" etc
    function handleBody(options) {
      function bodyEncoder() {
        checkBodyAllowed(options);
  
        if (options.encodedBody) {
          return;
        }
  
        //
        // Check for HTML5 FileApi files
        //
        if (hasFiles(options.body)) {
          options.encodedBody = new FormData(); 
          addFiles(options.body, options.encodedBody);
        }
        if (options.body instanceof FormData) {
          options.encodedBody = options.body;
        }
        if (options.encodedBody instanceof FormData) {
            // TODO: is this necessary? This breaks in the browser
  //        options.headers["content-type"] = "multipart/form-data";
          return;
        }
  
        if ('string' === typeof options.body) {
          options.encodedBody = options.body;
        }
  
        if (!options.headers["content-type"]) {
          //options.headers["content-type"] = "application/x-www-form-urlencoded";
          options.headers["content-type"] = "application/json";
        }
  
        if ('undefined' !== typeof Buffer) {
          if (options.body instanceof Buffer) {
            options.encodedBody = options.body;
            options.headers["content-type"] = 'application/octect-stream';
          }
        }
  
        if (!options.encodedBody) {
          if (options.headers["content-type"].match(/application\/json/) || 
              options.headers["content-type"].match(/text\/javascript/)) {
            options.encodedBody = JSON.stringify(options.body);
          } else if (options.headers["content-type"].match(/application\/x-www-form-urlencoded/)) {
            options.encodedBody = uriEncodeObject(options.body);
          }
  
          if (!options.encodedBody) {
            throw new Error("'" + options.headers["content-type"] + "'" + "is not yet supported and you have not specified 'encodedBody'");
          }
  
          options.headers["content-length"] = options.encodedBody.length;
        }
      }
  
      function removeContentBodyAndHeaders() {
        if (options.body) {
          throw new Error('You gave a body for one of HEAD, GET, DELETE, or OPTIONS');
        }
  
        options.encodedBody = "";
        options.headers["content-type"] = undefined;
        options.headers["content-length"] = undefined;
        options.headers["transfer-encoding"] = undefined;
        delete options.headers["content-type"];
        delete options.headers["content-length"];
        delete options.headers["transfer-encoding"];
      }
  
      if ('file:' === options.protocol) {
        options.header = undefined;
        delete options.header;
        return;
      }
  
      // Create & Send body
      // TODO support streaming uploads
      options.headers["transfer-encoding"] = undefined;
      delete options.headers["transfer-encoding"];
  
      if (options.body || options.encodedBody) {
        bodyEncoder(options);
      } else { // no body || body not allowed
        removeContentBodyAndHeaders(options);
      }
    }
  
    ahrOptions.handleOptions = function (options) {
      handleUri(options);
      handleHeaders(options);
      handleBody(options);
  
      return options;
    };
  }());
  

  provide("ahr2/options", module.exports);
  provide("ahr2/options", module.exports);
  $.ender(module.exports);
}(global));

// ender:ahr2/browser as ahr2/browser
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
  /*jslint devel: true, debug: true, es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
  // This module is meant for modern browsers. Not much abstraction or 1337 majic
  (function (undefined) {
    "use strict";
  
    var url //= require('url')
      , browserJsonpClient =  require('ahr2/browser/jsonp')
      , triedHeaders = {}
      , nativeHttpClient
      , globalOptions
      , restricted
      , window = require('window')
      , debug = false
      ; // TODO underExtend localOptions
  
    // Restricted Headers
    // http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader-method
    restricted = [
        "Accept-Charset"
      , "Accept-Encoding"
      , "Connection"
      , "Content-Length"
      , "Cookie"
      , "Cookie2"
      , "Content-Transfer-Encoding"
      , "Date"
      , "Expect"
      , "Host"
      , "Keep-Alive"
      , "Referer"
      , "TE"
      , "Trailer"
      , "Transfer-Encoding"
      , "Upgrade"
      , "User-Agent"
      , "Via"
    ];
    restricted.forEach(function (val, i, arr) {
      arr[i] = val.toLowerCase();
    });
  
    if (!window.XMLHttpRequest) {
      window.XMLHttpRequest = function() {
        var ActiveXObject = require('ActiveXObject');
        return new ActiveXObject('Microsoft.XMLHTTP');
      };
    }
    if (window.XDomainRequest) {
      // TODO fix IE's XHR/XDR to act as normal XHR2
      // check if the location.host is the same (name, port, not protocol) as origin
    }
  
  
    function encodeData(options, xhr2) {
      var data
        , ct = options.overrideResponseType || xhr2.getResponseHeader("content-type") || ""
        , text
        , len
        ;
  
      ct = ct.toLowerCase();
  
      if (xhr2.responseType && xhr2.response) {
        text = xhr2.response;
      } else {
        text = xhr2.responseText;
      }
  
      len = text.length;
  
      if ('binary' === ct) {
        if (window.ArrayBuffer && xhr2.response instanceof window.ArrayBuffer) {
          return xhr2.response;
        }
  
        // TODO how to wrap this for the browser and Node??
        if (options.responseEncoder) {
          return options.responseEncoder(text);
        }
  
        // TODO only Chrome 13 currently handles ArrayBuffers well
        // imageData could work too
        // http://synth.bitsnbites.eu/
        // http://synth.bitsnbites.eu/play.html
        // var ui8a = new Uint8Array(data, 0);
        var i
          , ui8a = new Array(len)
          ;
  
        for (i = 0; i < text.length; i += 1) {
          ui8a[i] = (text.charCodeAt(i) & 0xff);
        }
  
        return ui8a;
      }
  
      if (ct.indexOf("xml") >= 0) {
        return xhr2.responseXML;
      }
  
      if (ct.indexOf("jsonp") >= 0 || ct.indexOf("javascript") >= 0) {
        console.log("forcing of jsonp not yet supported");
        return text;
      }
  
      if (ct.indexOf("json") >= 0) {
        try {
          data = JSON.parse(text);
        } catch(e) {
          data = text;
        }
        return data;
      }
  
      return xhr2.responseText;
    }
  
    function browserHttpClient(req, res) {
      var options = req.userOptions
        , xhr2
        , xhr2Request
        , timeoutToken
        ;
  
      function onTimeout() {
        req.emit("timeout", new Error("timeout after " + options.timeout + "ms"));
      }
  
      function resetTimeout() {
        clearTimeout(timeoutToken);
        //timeoutToken = setTimeout(onTimeout, options.timeout);
      }
  
      function sanatizeHeaders(header) {
        var value = options.headers[header]
          , headerLc = header.toLowerCase()
          ;
  
        // only warn the user once about bad headers
        if (-1 !== restricted.indexOf(header.toLowerCase())) {
          if (!triedHeaders[headerLc]) {
            console.warn('Ignoring all attempts to set restricted header ' + header + '. See (http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader-method)');
          }
          triedHeaders[headerLc] = true;
          return;
        }
  
        try {
          // throws INVALID_STATE_ERROR if called before `open()`
          xhr2.setRequestHeader(header, value);
        } catch(e) {
          console.error('failed to set header: ' + header);
          console.error(e);
        }
      }
  
      // A little confusing that the request object gives you
      // the response handlers and that the upload gives you
      // the request handlers, but oh well
      xhr2 = new window.XMLHttpRequest();
      xhr2Request = xhr2.upload;
  
      /* Proper States */
      xhr2.addEventListener('loadstart', function (ev) {
          // this fires when the request starts,
          // but shouldn't fire until the request has loaded
          // and the response starts
          req.emit('loadstart', ev);
          //resetTimeout();
      }, true);
      xhr2.addEventListener('progress', function (ev) {
          if (!req.loaded) {
            req.loaded = true;
            req.emit('progress', {});
            req.emit('load', {});
          }
          if (!res.loadstart) {
            res.headers = xhr2.getAllResponseHeaders();
            res.loadstart = true;
            res.emit('loadstart', ev);
          }
          res.emit('progress', ev);
          //resetTimeout();
      }, true);
      xhr2.addEventListener('load', function (ev) {
        if (xhr2.status >= 400) {
          ev.error = new Error(xhr2.status);
        }
        ev.target.result = encodeData(options, xhr2);
        res.emit('load', ev);
      }, true);
      /*
      xhr2Request.addEventListener('loadstart', function (ev) {
        req.emit('loadstart', ev);
        //resetTimeout();
      }, true);
      */
      xhr2Request.addEventListener('load', function (ev) {
        //resetTimeout();
        req.loaded = true;
        req.emit('load', ev);
        res.loadstart = true;
        res.emit('loadstart', {});
      }, true);
      xhr2Request.addEventListener('progress', function (ev) {
        resetTimeout();
        req.emit('progress', ev);
      }, true);
  
  
      /* Error States */
      xhr2.addEventListener('abort', function (ev) {
        res.emit('abort', ev);
      }, true);
      xhr2Request.addEventListener('abort', function (ev) {
        req.emit('abort', ev);
      }, true);
      xhr2.addEventListener('error', function (ev) {
        res.emit('error', ev);
      }, true);
      xhr2Request.addEventListener('error', function (ev) {
        req.emit('error', ev);
      }, true);
      // the "Request" is what timeouts
      // the "Response" will timeout as well
      xhr2.addEventListener('timeout', function (ev) {
        req.emit('timeout', ev);
      }, true);
      xhr2Request.addEventListener('timeout', function (ev) {
        req.emit('timeout', ev);
      }, true);
  
      /* Cleanup */
      res.on('loadend', function () {
        // loadend is managed by AHR
        req.status = xhr2.status;
        res.status = xhr2.status;
        clearTimeout(timeoutToken);
      });
  
      if (options.username) {
        xhr2.open(options.method, options.href, true, options.username, options.password);
      } else {
        xhr2.open(options.method, options.href, true);
      }
  
      Object.keys(options.headers).forEach(sanatizeHeaders);
  
      setTimeout(function () {
        if ('binary' === options.overrideResponseType) {
          xhr2.overrideMimeType("text/plain; charset=x-user-defined");
          xhr2.responseType = 'arraybuffer';
        }
        try {
          xhr2.send(options.encodedBody);
        } catch(e) {
          req.emit('error', e);
        }
      }, 1);
      
  
      req.abort = function () {
        xhr2.abort();
      };
      res.abort = function () {
        xhr2.abort();
      };
  
      res.browserRequest = xhr2;
      return res;
    }
  
    function send(req, res) {
      var options = req.userOptions;
      // TODO fix this ugly hack
      url = url || require('url');
      if (options.jsonp && options.jsonpCallback) {
        return browserJsonpClient(req, res);
      }
      return browserHttpClient(req, res);
    }
  
    module.exports = send;
  }());
  

  provide("ahr2/browser", module.exports);
  provide("ahr2/browser", module.exports);
  $.ender(module.exports);
}(global));

// ender:ahr2 as ahr2
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
  (function () {
    "use strict";
  
    var EventEmitter = require('events').EventEmitter
      , Future = require('future')
      , Join = require('join')
      , ahrOptions
      , utils
      , preset
      ;
  
    function nextTick(fn, a, b, c, d) {
      try {
        process.nextTick(fn, a, b, c, d);
      } catch(e) {
        setTimeout(fn, 0, a, b, c, d);
      }
    }
  
    ahrOptions =  require('ahr2/options');
    utils =  require('ahr2/utils');
    
    preset = utils.preset;
  
    // The normalization starts here!
    function newEmitter() {
      var emitter = new EventEmitter()
        , promise = Future.create()
        , ev = {
              lengthComputable: false
            , loaded: 0
            , total: undefined
          };
  
      function loadend(ev, errmsg) {
        ev.error = errmsg && new Error(errmsg);
        nextTick(function () {
          emitter.emit('loadend', ev);
        });
      }
  
      emitter.done = 0;
  
      // any error in the quest causes the response also to fail
      emitter.on('loadend', function (ev) {
        emitter.done += 1;
  
        if (emitter.done > 1) {
          console.warn('loadend called ' + emitter.done + ' times');
          return;
        }
  
        // in FF this is only a getter, setting is not allowed
        if (!ev.target) {
          ev.target = {};
        }
  
        promise.fulfill(emitter.error || ev.error, emitter, ev.target.result, ev.error ? false : true);
      });
  
      emitter.on('timeout', function (ev) {
        emitter.error = ev;
        loadend(ev, 'timeout');
      });
  
      emitter.on('abort', function (ev) {
        loadend(ev, 'abort');
      });
  
      emitter.on('error', function (err, evn) {
        // TODO rethrow the error if there are no listeners (incl. promises)
        //if (respEmitter.listeners.loadend) {}
  
        emitter.error = err;
        ev.error = err;
        if (evn) {
          ev.lengthComputable = evn.lengthComputable || true;
          ev.loaded = evn.loaded || 0;
          ev.total = evn.total;
        }
        loadend(ev);
      });
  
      // TODO there can actually be multiple load events per request
      // as is the case with mjpeg, streaming media, and ad-hoc socket-ish things
      emitter.on('load', function (evn) {
        // ensure that `loadend` is after `load` for all interested parties
        loadend(evn);
      });
  
      // TODO 3.0 remove when
      emitter.when = promise.when;
  
      return emitter;
    }
  
  
    // backwards compat
    function ahr(options, callback) {
      return ahr.http(options, callback);
    }
  
    //
    // Emulate `request`
    //
    function abstractHttpRequest(options, callback) {
      var NativeHttpClient
        , req = newEmitter()
        , res = newEmitter()
        ;
  
      if (callback || options.callback) {
        // TODO 3.0 remove when
        return ahr.http(options).when(callback);
      }
  
      if ('string' === typeof options) {
        options = {
          href: options
        };
      }
  
      ahrOptions.handleOptions(options);
  
      // todo throw all the important properties in the request
      req.userOptions = options;
      // in the browser tradition
      res.upload = req;
  
      // if the request fails, then the response must also fail
      req.on('error', function (err, ev) {
        if (!res.error) {
          res.emit('error', err, ev);
        }
      });
      req.on('timeout', function (ev) {
        if (!res.error) {
          res.emit('timeout', ev);
        }
      });
      req.on('abort', function (ev) {
        if (!res.error) {
          res.emit('abort', ev);
        }
      });
  
      try {
        // tricking pakmanager to ignore the node stuff
        var client = './node';
        NativeHttpClient = require(client);
      } catch(e) {
        NativeHttpClient =  require('ahr2/browser');
      }
  
      return NativeHttpClient(req, res);
    }
    ahr.globalOptionKeys = ahrOptions.globalOptionKeys;
    ahr.globalOption = ahrOptions.globalOption;
    ahr.setGlobalOptions = ahrOptions.setGlobalOptions;
    ahr.handleOptions = ahrOptions.handleOptions;
  
  
    // TODO 3.0 remove join
    ahr.join = Join;
  
  
    //
    //
    // All of these convenience methods are safe to cut if needed to save kb
    //
    //
    function allRequests(method, href, query, body, jsonp, options, callback) {
      options = options || {};
  
      if (method) { options.method = method; }
      if (href) {
        // XXX better definition for what a scheme could be
        // I believe that `wtp:localhost` is a valid url
        if (/^[\w\-]{1,8}:.+/.exec(href)) {
          options.href = href;
        } else {
          options.pathname = href;
        }
      }
      if (jsonp) { options.jsonp = jsonp; }
  
      if (query) { options.query = preset((query || {}), (options.query || {})); }
      if (body) { options.body = body; }
  
      return ahr.http(options, callback);
    }
  
    ahr.http = abstractHttpRequest;
    ahr.file = abstractHttpRequest;
    // TODO copy the jquery / reqwest object syntax
    // ahr.ajax = ahr;
  
    // HTTP jQuery-like body-less methods
    ['HEAD', 'GET', 'DELETE', 'OPTIONS'].forEach(function (verb) {
      verb = verb.toLowerCase();
      ahr[verb] = function (href, query, options, callback) {
        return allRequests(verb, href, query, undefined, undefined, options, callback);
      };
    });
  
    // Correcting an oversight of jQuery.
    // POST and PUT can have both query (in the URL) and data (in the body)
    ['POST', 'PUT'].forEach(function (verb) {
      verb = verb.toLowerCase();
      ahr[verb] = function (href, query, body, options, callback) {
        return allRequests(verb, href, query, body, undefined, options, callback);
      };
    });
  
    // JSONP
    ahr.jsonp = function (href, jsonp, query, options, callback) {
      if (!jsonp || 'string' !== typeof jsonp) {
        throw new Error("'jsonp' is not an optional parameter.\n" +
          "If you believe that this should default to 'callback' rather" +
          "than throwing an error, please file a bug");
      }
  
      return allRequests('GET', href, query, undefined, jsonp, options, callback);
    };
  
    // HTTPS
    ahr.https = function (options, callback) {
      if ('string' === typeof options) {
        options = {
          href: options
        };
      }
  
      options.ssl = true;
      options.protocol = "https:";
  
      return ahr.http(options, callback);
    };
  
    ahr.tcp = function (options, callback) {
      if ('string' === typeof options) {
        options = {
          href: options
        };
      }
  
      options.protocol = "tcp:";
  
      return ahr.http(options, callback);
    };
  
    ahr.udp = function (options, callback) {
      if ('string' === typeof options) {
        options = {
          href: options
        };
      }
  
      options.protocol = "udp:";
  
      return ahr.http(options, callback);
    };
  
    module.exports = ahr;
  }());
  

  provide("ahr2", module.exports);
  provide("ahr2", module.exports);
  $.ender(module.exports);
}(global));

// ender:remedial as remedial
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jslint onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true */
  (function () {
      "use strict";
  
      var global = Function('return this')()
        , classes = "Boolean Number String Function Array Date RegExp Object".split(" ")
        , i
        , name
        , class2type = {}
        ;
  
      for (i in classes) {
        if (classes.hasOwnProperty(i)) {
          name = classes[i];
          class2type["[object " + name + "]"] = name.toLowerCase();
        }
      }
  
      function typeOf(obj) {
        return (null === obj || undefined === obj) ? String(obj) : class2type[Object.prototype.toString.call(obj)] || "object";
      }
  
      function isEmpty(o) {
          var i, v;
          if (typeOf(o) === 'object') {
              for (i in o) { // fails jslint
                  v = o[i];
                  if (v !== undefined && typeOf(v) !== 'function') {
                      return false;
                  }
              }
          }
          return true;
      }
  
      if (!String.prototype.entityify) {
          String.prototype.entityify = function () {
              return this.replace(/&/g, "&amp;").replace(/</g,
                  "&lt;").replace(/>/g, "&gt;");
          };
      }
  
      if (!String.prototype.quote) {
          String.prototype.quote = function () {
              var c, i, l = this.length, o = '"';
              for (i = 0; i < l; i += 1) {
                  c = this.charAt(i);
                  if (c >= ' ') {
                      if (c === '\\' || c === '"') {
                          o += '\\';
                      }
                      o += c;
                  } else {
                      switch (c) {
                      case '\b':
                          o += '\\b';
                          break;
                      case '\f':
                          o += '\\f';
                          break;
                      case '\n':
                          o += '\\n';
                          break;
                      case '\r':
                          o += '\\r';
                          break;
                      case '\t':
                          o += '\\t';
                          break;
                      default:
                          c = c.charCodeAt();
                          o += '\\u00' + Math.floor(c / 16).toString(16) +
                              (c % 16).toString(16);
                      }
                  }
              }
              return o + '"';
          };
      } 
  
      if (!String.prototype.supplant) {
          String.prototype.supplant = function (o) {
              return this.replace(/{([^{}]*)}/g,
                  function (a, b) {
                      var r = o[b];
                      return typeof r === 'string' || typeof r === 'number' ? r : a;
                  }
              );
          };
      }
  
      if (!String.prototype.trim) {
          String.prototype.trim = function () {
              return this.replace(/^\s*(\S*(?:\s+\S+)*)\s*$/, "$1");
          };
      }
  
      // CommonJS / npm / Ender.JS
      module.exports = {
          typeOf: typeOf,
          isEmpty: isEmpty
      };
      global.typeOf = global.typeOf || typeOf;
      global.isEmpty = global.isEmpty || isEmpty;
  }());
  

  provide("remedial", module.exports);
  provide("remedial", module.exports);
  $.ender(module.exports);
}(global));

// ender:jsonapi as jsonapi
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jslint es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
  (function () {
    "use strict";
  
    var request = require('ahr2'),
      Future = require('future'),
      querystring = require('querystring'),
      createRestClient;
    /**
     * Scaffold
     *
     * This produces an API skeleton based on the JSON-API doc.
     * When printed as a string this provides a nice starting point for your API
     */
    createRestClient = function (doc) {
      var factory = {};
      // TODO allow for multiple versions
      // TODO move creation params to doc
      factory.create = function (api_key) {
      
        var api = {}, api_req;
        // Base API / REST request
        api_req = function(action, params, options) {
          var promise = Future()
            , result
            ;
  
          // Uses abstractHttpRequest
          params[doc.key.name] = api_key;
          Object.keys(doc.api_params).forEach(function (key) {
            if ('undefined' === typeof params[key]) {
              params[key] = doc.api_params[key];
            }
          });
  
          result = request.jsonp(doc.api_url + action + '?' + querystring.stringify(params), doc.jsonp_callback, params, options);
          result.when(function (err, xhr, data) {
            if (data && data.response && data.response.errors) {
              err = data.response.errors;
            }
            promise.fulfill(err, xhr, data);
          });
          return promise;
        };
        doc.requests.forEach(function (module) {
          // example: CampusBooks.search(params, options);
          api[module.name] = function (params, options) {
            var pdoc = module.parameters,
              promise = Future(),
              validates = true,
              undocumented = [],
              msg = "",
              result;
  
            if (pdoc) {
              // TODO move to validations model
              if (pdoc.required) {
                pdoc.required.forEach(function (pname) {
                  if ('undefined' === typeof params[pname] || !params[pname].toString()) {
                    validates = false;
                    msg += "All of the params '" + pdoc.required.toString() + "' must be specified for the '" + module.name  + "' call.";
                  }
                });
              }
              if ('undefined' !== typeof pdoc.oneOf) {
                Object.keys(params).forEach(function (pname) {
                  var exists = false;
                  pdoc.oneOf.forEach(function (ename) {
                    if (pname === ename) {
                      exists = true;
                    }
                  });
                  if (true !== exists) {
                    undocumented.push(pname);
                  }
                });
                if (0 !== undocumented.length) {
                  validates = false;
                  msg += "The params '" + undocumented.toString() + "' are useless for this call.";
                }
              }
              // TODO end move to validations model block
              
              if (pdoc.validation) {
                validates = pdoc.validation(params);
                msg = validates;
              }
              if (true !== validates) {
                promise.fulfill(msg);
                return promise;
              }
            }
  
            result = api_req(module.name, params, options);
            return result;
          };
        });
        return api;
      };
      return factory;
    };
  
    module.exports = {
      createRestClient: createRestClient
    };
  
  }());
  

  provide("jsonapi", module.exports);
  provide("jsonapi", module.exports);
  $.ender(module.exports);
}(global));

// ender:json-storage as json-storage
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  
    var Store
      , delim = ':'
      ;
  
    function Stringify(obj) {
      var str;
      try {
        str = JSON.stringify(obj);
      } catch(e) {
        str = "";
      }
  
      return str;
    }
  
    function Parse(str) {
      var obj = null;
      try {
        obj = JSON.parse(str);
      } catch(e) {}
  
      return obj;
    }
  
    function escapeRegExp(str) {
      return str.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }
  
    function upgradeStorage(jss, w3cs) {
      var i
        , key
        , val
        , json = {}
        ;
  
      if (jss._store.getItem('_json-storage-namespaced_', true)) {
        return;
      }
  
      // we can't modify the db while were reading or
      // the keys will shift all over the place
      for (i = 0; i < w3cs.length; i += 1) {
        key = w3cs.key(i);
        try {
          val = JSON.parse(w3cs.getItem(key));
        } catch(e) {
          return;
        }
        json[key] = val;
      }
      w3cs.clear();
  
      Object.keys(json).forEach(function (key) {
        jss.set(key, json[key]);
      });
  
      jss._store.setItem('_json-storage-namespaced_', true);
    }
  
    function JsonStorage(w3cStorage, namespace) {
      // called without new or create
      // global will be undefined
      if (!this) {
        return new JsonStorage(w3cStorage, namespace);
      }
  
      // if we didn't always add at least the delimeter
      // then if a keyname with the delim, it would be more
      // complicated to figure it out
      this._namespace = delim;
      this._namespace += (namespace || 'jss');
  
      this._store = w3cStorage;
      this._keysAreDirty = true;
      this._keys = [];
      if (!this._store.getItem('_json-storage-namespaced_')) {
        upgradeStorage(this, w3cStorage);
      }
    }
    Store = JsonStorage;
    
    Store.prototype.clear = function () {
      this._keysAreDirty = true;
      this.keys().forEach(function (key) {
        this.remove(key);
      }, this);
    };
  
    Store.prototype.remove = function (key) {
      this._keysAreDirty = true;
      this._store.removeItem(key + this._namespace);
    };
  
    Store.prototype.get = function (key) {
      return Parse(this._store.getItem(key + this._namespace));
    };
  
    Store.prototype.set = function (key, val) {
      this._keysAreDirty = true;
      return this._store.setItem(key + this._namespace, Stringify(val));
    };
  
    Store.prototype.keys = function () {
      var i
        , key
        , delimAt
        ;
  
      if (!this._keysAreDirty) {
        return this._keys.concat([]);
      }
  
      this._keys = [];
      for (i = 0; i < this._store.length; i += 1) {
        key = this._store.key(i) || '';
  
        delimAt = key.lastIndexOf(this._namespace);
        // test if this key belongs to this widget
        if (-1 !== delimAt) {
          this._keys.push(key.substr(0, delimAt));
        }
      }
      this._keysAreDirty = false;
  
      return this._keys.concat([]);
    };
  
    Store.prototype.size = function () {
      return this._store.length;
    };
  
    Store.prototype.toJSON = function () {
      var json = {}
        ;
  
      this.keys().forEach(function (key) {
        json[key] = this.get(key);
      }, this);
  
      return json;
    };
  
    Store.create = function (w3cStorage, namespace) {
      return new JsonStorage(w3cStorage, namespace);
    }
  
    module.exports = Store;
  }());
  

  provide("json-storage", module.exports);
  provide("json-storage", module.exports);
  $.ender(module.exports);
}(global));

// ender:serialize-form as serialize-form
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  
    function serializeForm(formid, toNativeType) {
      var els = []; 
  
      function handleElement(e) {
        var name = $(e).attr('name')
          , value = $(e).val()
          ;   
  
        if (toNativeType) {
          value = Number(value) || value;
        }
        if ('true' === value) {
          value = true;
        }
        if ('false' === value) {
          value = false;
        }
        if ('null' === value) {
          value = null;
        }
        /*
        // Not yet convinced that this is a good idea
        if ('undefined' === value) {
          value = undefined;
        }
        */
  
        if (!name || '' === value) {
          return;
        }   
  
        els.push({
            name: name
          , value: value
        }); 
      }   
  
      // TODO insert these in the array in the order
      // they appear in the form rather than by element
      $(formid + ' input').forEach(handleElement);
      $(formid + ' select').forEach(handleElement);
      $(formid + ' textarea').forEach(handleElement);
  
      return els;
    }
  
    // Note that this is a potentially lossy conversion.
    // By convention arrays are specified as `xyz[]`,
    // but objects have no such standard
    function mapFormData(data) {
      var obj = {}; 
  
      function map(datum) {
        var arr
          , name
          , len
          ;
  
        name = datum.name;
        len = datum.name.length;
  
        if ('[]' === datum.name.substr(len - 2)) {
          name = datum.name.substr(0, len - 2);
          arr = obj[name] = (obj[name] || []);
          arr.push(datum.value);
        } else {
          obj[datum.name] = datum.value;
        }
      }   
  
      data.forEach(map);
  
      return obj;
    }
  
    function serializeFormObject() {
      return mapFormData(serializeForm.apply(null, arguments));
    }
  
    function serializeFormUriEncoded() {
      var data = serializeForm.apply(null, arguments)
        , str = ''
        ;
  
      data.forEach(function (obj) {
        str += '&' + encodeURIComponent(obj.name) + '=' + encodeURIComponent(obj.value);
      });
      
      // remove leading '&'
      str = str.substr(1);
  
      return str;
    }
  
    module.exports.serializeForm = serializeForm;
    module.exports.serializeFormUriEncoded = serializeFormUriEncoded;
    module.exports.serializeFormArray = serializeForm;
    module.exports.serializeFormObject = serializeFormObject;
  }());
  

  provide("serialize-form", module.exports);
  provide("serialize-form", module.exports);
  $.ender(module.exports);
}(global));

// ender:md5 as md5
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  /**
   * md5.js
   * Copyright (c) 2011, Yoshinori Kohyama (http://algobit.jp/)
   * all rights reserved.
   */
  
  exports.digest = function (M) {
    var originalLength
      , i
      , j
      , k
      , l
      , A
      , B
      , C
      , D
      , AA
      , BB
      , CC
      , DD
      , X
      , rval
      ;
  
  	function F(x, y, z) { return (x & y) | (~x & z); }
  	function G(x, y, z) { return (x & z) | (y & ~z); }
  	function H(x, y, z) { return x ^ y ^ z;          }
  	function I(x, y, z) { return y ^ (x | ~z);       }
  
  	function to4bytes(n) {
  		return [n&0xff, (n>>>8)&0xff, (n>>>16)&0xff, (n>>>24)&0xff];
  	}
  
  	originalLength = M.length; // for Step.2
  
  	// 3.1 Step 1. Append Padding Bits
  	M.push(0x80);
  	l = (56 - M.length)&0x3f;
  	for (i = 0; i < l; i++)
  		M.push(0);
  
  	// 3.2 Step 2. Append Length
  	to4bytes(8*originalLength).forEach(function (e) { M.push(e); });
  	[0, 0, 0, 0].forEach(function (e) { M.push(e); });
  
  	// 3.3 Step 3. Initialize MD Buffer
  	A = [0x67452301];
  	B = [0xefcdab89];
  	C = [0x98badcfe];
  	D = [0x10325476];
  
  	// 3.4 Step 4. Process Message in 16-Word Blocks
  	function rounds(a, b, c, d, k, s, t, f) {
  		a[0] += f(b[0], c[0], d[0]) + X[k] + t;
  		a[0] = ((a[0]<<s)|(a[0]>>>(32 - s)));
  		a[0] += b[0];
  	}
  
  	for (i = 0; i < M.length; i += 64) {
  		X = [];
  		for (j = 0; j < 64; j += 4) {
  			k = i + j;
  			X.push(M[k]|(M[k + 1]<<8)|(M[k + 2]<<16)|(M[k + 3]<<24));
  		}
  		AA = A[0];
  		BB = B[0];
  		CC = C[0];
  		DD = D[0];
  
  		// Round 1.
  		rounds(A, B, C, D,  0,  7, 0xd76aa478, F);
  		rounds(D, A, B, C,  1, 12, 0xe8c7b756, F);
  		rounds(C, D, A, B,  2, 17, 0x242070db, F);
  		rounds(B, C, D, A,  3, 22, 0xc1bdceee, F);
  		rounds(A, B, C, D,  4,  7, 0xf57c0faf, F);
  		rounds(D, A, B, C,  5, 12, 0x4787c62a, F);
  		rounds(C, D, A, B,  6, 17, 0xa8304613, F);
  		rounds(B, C, D, A,  7, 22, 0xfd469501, F);
  		rounds(A, B, C, D,  8,  7, 0x698098d8, F);
  		rounds(D, A, B, C,  9, 12, 0x8b44f7af, F);
  		rounds(C, D, A, B, 10, 17, 0xffff5bb1, F);
  		rounds(B, C, D, A, 11, 22, 0x895cd7be, F);
  		rounds(A, B, C, D, 12,  7, 0x6b901122, F);
  		rounds(D, A, B, C, 13, 12, 0xfd987193, F);
  		rounds(C, D, A, B, 14, 17, 0xa679438e, F);
  		rounds(B, C, D, A, 15, 22, 0x49b40821, F);
  
  		// Round 2.
  		rounds(A, B, C, D,  1,  5, 0xf61e2562, G);
  		rounds(D, A, B, C,  6,  9, 0xc040b340, G);
  		rounds(C, D, A, B, 11, 14, 0x265e5a51, G);
  		rounds(B, C, D, A,  0, 20, 0xe9b6c7aa, G);
  		rounds(A, B, C, D,  5,  5, 0xd62f105d, G);
  		rounds(D, A, B, C, 10,  9, 0x02441453, G);
  		rounds(C, D, A, B, 15, 14, 0xd8a1e681, G);
  		rounds(B, C, D, A,  4, 20, 0xe7d3fbc8, G);
  		rounds(A, B, C, D,  9,  5, 0x21e1cde6, G);
  		rounds(D, A, B, C, 14,  9, 0xc33707d6, G);
  		rounds(C, D, A, B,  3, 14, 0xf4d50d87, G);
  		rounds(B, C, D, A,  8, 20, 0x455a14ed, G);
  		rounds(A, B, C, D, 13,  5, 0xa9e3e905, G);
  		rounds(D, A, B, C,  2,  9, 0xfcefa3f8, G);
  		rounds(C, D, A, B,  7, 14, 0x676f02d9, G);
  		rounds(B, C, D, A, 12, 20, 0x8d2a4c8a, G);
  
  		// Round 3.
  		rounds(A, B, C, D,  5,  4, 0xfffa3942, H);
  		rounds(D, A, B, C,  8, 11, 0x8771f681, H);
  		rounds(C, D, A, B, 11, 16, 0x6d9d6122, H);
  		rounds(B, C, D, A, 14, 23, 0xfde5380c, H);
  		rounds(A, B, C, D,  1,  4, 0xa4beea44, H);
  		rounds(D, A, B, C,  4, 11, 0x4bdecfa9, H);
  		rounds(C, D, A, B,  7, 16, 0xf6bb4b60, H);
  		rounds(B, C, D, A, 10, 23, 0xbebfbc70, H);
  		rounds(A, B, C, D, 13,  4, 0x289b7ec6, H);
  		rounds(D, A, B, C,  0, 11, 0xeaa127fa, H);
  		rounds(C, D, A, B,  3, 16, 0xd4ef3085, H);
  		rounds(B, C, D, A,  6, 23, 0x04881d05, H);
  		rounds(A, B, C, D,  9,  4, 0xd9d4d039, H);
  		rounds(D, A, B, C, 12, 11, 0xe6db99e5, H);
  		rounds(C, D, A, B, 15, 16, 0x1fa27cf8, H);
  		rounds(B, C, D, A,  2, 23, 0xc4ac5665, H);
  
  		// Round 4.
  		rounds(A, B, C, D,  0,  6, 0xf4292244, I);
  		rounds(D, A, B, C,  7, 10, 0x432aff97, I);
  		rounds(C, D, A, B, 14, 15, 0xab9423a7, I);
  		rounds(B, C, D, A,  5, 21, 0xfc93a039, I);
  		rounds(A, B, C, D, 12,  6, 0x655b59c3, I);
  		rounds(D, A, B, C,  3, 10, 0x8f0ccc92, I);
  		rounds(C, D, A, B, 10, 15, 0xffeff47d, I);
  		rounds(B, C, D, A,  1, 21, 0x85845dd1, I);
  		rounds(A, B, C, D,  8,  6, 0x6fa87e4f, I);
  		rounds(D, A, B, C, 15, 10, 0xfe2ce6e0, I);
  		rounds(C, D, A, B,  6, 15, 0xa3014314, I);
  		rounds(B, C, D, A, 13, 21, 0x4e0811a1, I);
  		rounds(A, B, C, D,  4,  6, 0xf7537e82, I);
  		rounds(D, A, B, C, 11, 10, 0xbd3af235, I);
  		rounds(C, D, A, B,  2, 15, 0x2ad7d2bb, I);
  		rounds(B, C, D, A,  9, 21, 0xeb86d391, I);
  
  		A[0] += AA;
  		B[0] += BB;
  		C[0] += CC;
  		D[0] += DD;
  	}
  
  	rval = [];
  	to4bytes(A[0]).forEach(function (e) { rval.push(e); });
  	to4bytes(B[0]).forEach(function (e) { rval.push(e); });
  	to4bytes(C[0]).forEach(function (e) { rval.push(e); });
  	to4bytes(D[0]).forEach(function (e) { rval.push(e); });
  
  	return rval;
  }
  
  exports.digest_s = function (s) {
  	var M = []
      , i
      , d
      , rstr
      , s
      ;
  
  	for (i = 0; i < s.length; i++)
  		M.push(s.charCodeAt(i));
  
  	d = exports.digest(M);
  	rstr = '';
  
  	d.forEach(function (e) {
  		s = e.toString(16);
  		while (s.length < 2)
  			s = '0' + s;
  		rstr += s;
  	});
  
  	return rstr;
  }
  
  }());
  

  provide("md5", module.exports);
  provide("md5", module.exports);
  $.ender(module.exports);
}(global));

// ender:campusbooks as campusbooks
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jslint es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
  (function () {
    "use strict";
  
    var jsonapi = require('jsonapi'),
      CampusBooks = {},
      documentation;
  
    /**
     * Documention
     * TODO: list all params
     * 
     */
    documentation = {
      requests: [
        {
          name: "constants",
          description: "The Constants call just returns a list of each of the types of constants, and their available id/value pairs",
          parameters: {
            oneOf: []
          }
        },
        {
          name: "prices",
          parameters: {
            oneOf: [
              "isbn"
            ],
            required: [
              "isbn"
            ]
          },
          description: "The prices call requires a single valid ISBN to be passed in via a 'isbn' parameter:\n" +
            "<br/>\n" +
            "<pre>http://api.campusbooks.com/10/rest/prices?key=YOUR_API_KEY_HERE&isbn=ISBN_HERE</pre>\n" +
            "<br/>\n" +
            "It returns groupings for each condition where each group contains multiple offers.\n" + 
            "Each offer contains the following fields:",
          response: [
            {
              name: "isbn",
              description: "The thirteen digit ISBN for this offer"
            },
            {
              name: "merchant_id",
              description: "A numeric merchant ID (Note, this value may be signed)"
            },
            {
              name: "merchant_name",
              description: "The Name of the merchant (looked up from the defined constants)"
            },
            {
              name: "merchant_image",
              description: "URL of the merchant logo"
            },
            {
              name: "price",
              description: "The price that this merchant is listing this item for"
            },
            {
              name: "shipping_ground",
              description: "The cost to ship to an address in the US via ground services"
            },
            {
              name: "total_price",
              description: "Seller price plus the ground shipping price"
            },
            {
              name: "link",
              description: "Link to purchase the book"
            },
            {
              name: "condition_id",
              description: "Numeric representation of the condition (see constants)"
            },
            {
              name: "condition_text",
              description: "Text representation of the condition"
            },
            {
              name: "availability_id",
              description: "Numeric representation of the availability (how long it takes for the seller to ship it)"
            },
            {
              name: "availability_text",
              description: "Text representation of the availability"
            },
            {
              name: "location",
              description: "Geographic location where this item ships from (not always present)"
            },
            {
              name: "their_id",
              description: "The merchant's id for this offer (not always present)"
            },
            {
              name: "comments",
              description: "Comments about this offering"
            },
            {
              name: "condition_text",
              description: "Text representation of the condition"
            },
            {
              name: "rental_detail",
              description: "This node is available only for offers from book rental companies.\n" + 
                "If available, each sub-node indicates a price for one of three rental periods (SEMESTER, TERM, or SUMMER)",
              values: [
                {
                  name: "days",
                  description: "The exact number of days that this book may be rented for"
                },
                {
                  name: "price",
                  description: "The price for this rental period"
                },
                {
                  name: "link",
                  description: "A link that will take the visitor to a page specific to this rental period\n" + 
                    "(if supported by the merchant)"
                }
              ]
            }
          ]
        },
        {
          name: "bookinfo",
          parameters: {
            oneOf: [
              "isbn",
              "image_height",
              "image_width"
            ],
            required: [
              "isbn"
            ]
          },
          description: "The bookinfo call requires a single valid ISBN to be passed in via a 'isbn' parameter:\n" +
            "<br/>\n" +
            "<pre>http://api.campusbooks.com/10/rest/bookinfo?key=YOUR_API_KEY_HERE&isbn=0824828917[&image_height=HEIGHT][&image_width=WIDTH]</pre>\n" +
            "<br/>\n" +
            "It returns a 'page' element with all of the book attributes.",
          response: [
            {
              name: "isbn10",
              description: "Ten-Digit ISBN for this book"
            },
            {
              name: "isbn13",
              description: "Thirteen-Digit ISBN for this book"
            },
            {
              name: "title",
              description: "Book Title"
            },
            {
              name: "author",
              description: "Book Author"
            },
            {
              name: "binding",
              description: "Book Binding"
            },
            {
              name: "msrp",
              description: "List price for the book"
            },
            {
              name: "pages",
              description: "Number of pages in the book"
            },
            {
              name: "publisher",
              description: "Book Publisher"
            },
            {
              name: "published_date",
              description: "Published Date"
            },
            {
              name: "edition",
              description: "Book Edition (ie: 2nd, 3rd, etc)"
            },
            {
              name: "description",
              description: "A text description for the book"
            }
          ]
        },
        {
          name: "search",
          cimplate: "div.book",
          values: {
            "image": ".image[src={value}]",
            "title": ".title",
            "author": ".author",
            "isbn10": ".isbn10",
            "isbn13": ".isbn13",
            "edition": ".edition"
          },
          render: function (result) {
            var me = this,
              dimplset = [];
  
            function find_or_create(css) {
              // parse css
              // loop through from parentto child
              // find
              // if length 0, create in parent (or body)
            }
            //try {
              result.response.page.results.book.forEach(function (book) {
                var html = $('#templates ' + me.cimplate).clone();
                Object.keys(book).forEach(function (key) {
                  // TODO parse css to produce subtemplates
                  if ("image" === key) {
                    html.find('.'+key).attr("src", book[key]);
                    return;
                  }
                  html.find('.'+key).html(book[key]);
                });
                dimplset.push(html);
              });
            //} catch(e) {}
            return dimplset;
          },
          parameters: {
            oneOf: [
              "author",
              "title",
              "keywords",
              "page",
              "image_height",
              "image_width"
            ],
            validation: function(parameters) {
              var msg = true;
              if (0 === parameters.length) {
                msg = "you must specify at least one search parameter";
              }
              return msg;
            }
          },
          description: "The search call can be used to do an author, title, or keyword search.\n" +
            "It returns a list of books that match the search criteria\n" +
            "<br/>\n" +
            "<pre>http://api.campusbooks.com/10/rest/search?key=YOUR_API_KEY_HERE&[&author=AUTHOR][&title=TITLE][&keywords=KEYWORDS][&page=1][&image_height=HEIGHT][&image_width=WIDTH]</pre>\n" +
            "<br/>\n" +
            "At least one of 'author', 'title', or 'keywords' must be specified.\n" +
            "The result contains up to 10 results on the page. You can specify a page with the 'page' parameter'",
          response: [
            {
              name: "count",
              description: "The number of results for your search results (only 10 are displayed on this page)"
            },
            {
              name: "pages",
              description: "The number of pages of results available"
            },
            {
              name: "current_page",
              description: "The current page you are on"
            },
            {
              name: "results",
              description: "A list of books. The format of each is the same as from the bookinfo call defined above"
            }
          ]
        },
        {
          name: "bookprices",
          parameters: {
            oneOf: [
              "isbn",
              "image_height",
              "image_width"
            ],
            required: [
              "isbn"
            ]
          },
          description: "This function combines the bookinfo and prices functions into a single call.\n" +
            " It requires an ISBN and returns the book information as well as all of the pricing data\n" +
            "<br/>\n" +
            "<pre>http://api.campusbooks.com/10/rest/bookprices?key=YOUR_API_KEY_HERE&isbn=ISBN[&image_height=HEIGHT][&image_width=WIDTH]</pre>\n",
          response: [
            {
              name: "book",
              description: "A book item. The contents of this item are the same as which is returned with the bookinfo function"
            },
            {
              name: "offers",
              description: "This node contains all of the pricing data that a call to the price function returns"
            }
          ]
        },
        {
          name: "buybackprices",
          parameters: {
            oneOf: [
              "isbn",
              "image_height",
              "image_width"
            ],
            required: [
              "isbn"
            ]
          },
          description: "This function combines the bookinfo request with buyback pricing information.\n" +
            "It requires an ISBN and returns buyback prices for all of the merchants that you have enabled." +
            "<br/>\n" +
            "<pre>http://api.campusbooks.com/10/rest/buybackprices?key=YOUR_API_KEY_HERE&isbn=ISBN[&image_height=HEIGHT][&image_width=WIDTH]</pre>\n",
          response: [
            {
              name: "book",
              description: "A book item. The contents of this item are the same as which is returned with the bookinfo function"
            },
            {
              name: "offers",
              description: "This node contains an array of merchant nodes, each with the following structure",
              values: [
                {
                  name: "merchant_id",
                  description: "A numeric merchant ID"
                },
                {
                  name: "merchant_image",
                  description: "URL of the merchant logo"
                },
                {
                  name: "name",
                  description: "The name of the merchant"
                },
                {
                  name: "notes",
                  description: "A text description about this merchant. It contains payment and shipping information about this merchant"
                },
                {
                  name: "prices",
                  description: "prices contains a price node for each condition (new and used)"
                },
                {
                  name: "link",
                  description: "The link for directing visitors to this merchant."
                }
              ]
            }
          ],
          example: "<pre><code>" +
            "&lt;merchant&gt;" +
            "    &lt;merchant_id&gt;108&lt;/merchant_id&gt;" +
            "    &lt;merchant_image&gt;http://www.campusbooks.com/images/markets/firstclassbooks.gif&lt;/merchant_iamge&gt;" +
            "    &lt;name&gt;First Class Books&lt;/name&gt;" +
            "    &lt;notes&gt;Free shipping via USPS or FedEx. Books must be ....&lt;/notes&gt;" +
            "    &lt;prices&gt;" +
            "        &lt;price condition=\"new\"&gt;13.55&lt;/price&gt;" +
            "        &lt;price condition=\"used\"&gt;13.55&lt;/price&gt;" +
            "        &lt;/prices&gt;" +
            "    &lt;link&gt; http://partners.campusbooks.com/link.php?params=b3...&lt;/link&gt;" +
            "&lt;/merchant&gt;" +
          "</code></pre>"
        },
        {
          name: "merchant",
          parameters: {
            oneOf: [
              "buyback",
              "coupons"
            ]
          },
          description: "This function returns a list of merchants and their home page links you can use for direct promotions.\n" +
            "It can also return a list of available coupons for that merchant" +
            "<br/>\n" +
            "<pre>http://api.campusbooks.com/10/rest/merchants?key=YOUR_API_KEY_HERE[&coupons][&buyback=TYPE]</pre>\n",
          response: [
            {
              name: "name", 
              description: "The name of the merchant"
            },
            {
              name: "type",
              description: "The type of the merchant (BUY, BUYBACK)"
            },
            {
              name: "merchant_id",
              description: "A numeric merchant ID"
            },
            {
              name: "homepage_link",
              description: "A link for directing visitors to this merchants homepage"
            },
            {
              name: "coupon",
              description: "This node contains the coupon information"
            }
          ]
        }
      ],
      version: "10",
      compatible: ["10","9","8","7","6","5","4","3","2","1"],
      jsonp_callback: "callback",
      api_url: "http://api.campusbooks.com/10/rest/",
      api_params: {
        format: "json"
      },
      required_keys: [
        "api"
      ],
      key: {
        name: "key"
      }
    };
  
    CampusBooks = jsonapi.createRestClient(documentation);
    CampusBooks.documentation = documentation;
  
    module.exports = CampusBooks
  }());
  

  provide("campusbooks", module.exports);
  provide("campusbooks", module.exports);
  $.ender(module.exports);
}(global));

// ender:isbn as isbn
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  module = module || window;
  exports = exports || window;
  module.exports = exports;
  
  (function () {
    "use strict";
  
  var ISBN = {
    VERSION: '0.01',
    GROUPS: {
      '0': {
        'name': 'English speaking area',
        'ranges': [['00', '19'], ['200', '699'], ['7000', '8499'], ['85000', '89999'], ['900000', '949999'], ['9500000', '9999999']]
      },
      '1': {
        'name': 'English speaking area',
        'ranges': [['00', '09'], ['100', '399'], ['4000', '5499'], ['55000', '86979'], ['869800', '998999']]
      },
      '4': {
        'name': 'Japan',
        'ranges': [['00','19'], ['200','699'], ['7000','8499'], ['85000','89999'], ['900000','949999'], ['9500000','9999999']]
      }
    },
  
    isbn: function () {
      this.initialize.apply(this, arguments);
    },
  
    parse: function(val, groups) {
      var me = new ISBN.isbn(val, groups ? groups : ISBN.GROUPS);
      return me.isValid() ? me : null;
    },
  
    hyphenate: function(val) {
      var me = ISBN.parse(val);
      return me ? me.isIsbn13() ? me.asIsbn13(true) : me.asIsbn10(true) : null;
    },
  
    asIsbn13: function(val, hyphen) {
      var me = ISBN.parse(val);
      return me ? me.asIsbn13(hyphen) : null;
    },
  
    asIsbn10: function(val, hyphen) {
      var me = ISBN.parse(val);
      return me ? me.asIsbn10(hyphen) : null;
    }
  };
  
  ISBN.isbn.prototype = {
    isValid: function() {
      return this.codes && this.codes.isValid;
    },
  
    isIsbn13: function() {
      return this.isValid() && this.codes.isIsbn13;
    },
  
    isIsbn10: function() {
      return this.isValid() && this.codes.isIsbn10;
    },
  
    asIsbn10: function(hyphen) {
      return this.isValid() ? hyphen ? this.codes.isbn10h : this.codes.isbn10 : null;
    },
  
    asIsbn13: function(hyphen) {
      return this.isValid() ? hyphen ? this.codes.isbn13h : this.codes.isbn13 : null;
    },
  
    initialize: function(val, groups) {
      this.groups = groups;
      this.codes = this.parse(val);
    },
  
    merge: function(lobj, robj) {
      var key;
      if (!lobj || !robj) {
        return null;
      }
      for (key in robj) {
        if (robj.hasOwnProperty(key)) {
          lobj[key] = robj[key];
        }
      }
      return lobj;
    },
  
    parse: function(val) {
      var ret;
      // correct for misplaced hyphens
      // val = val.replace(/ -/,'');
      ret =
        val.match(/^\d{9}[\dX]$/) ?
          this.fill(
            this.merge({source: val, isValid: true, isIsbn10: true, isIsbn13: false}, this.split(val))) :
        val.length === 13 && val.match(/^(\d+)-(\d+)-(\d+)-([\dX])$/) ?
          this.fill({
            source: val, isValid: true, isIsbn10: true, isIsbn13: false, group: RegExp.$1, publisher: RegExp.$2,
            article: RegExp.$3, check: RegExp.$4}) :
        val.match(/^(978|979)(\d{9}[\dX]$)/) ?
          this.fill(
            this.merge({source: val, isValid: true, isIsbn10: false, isIsbn13: true, prefix: RegExp.$1},
            this.split(RegExp.$2))) :
        val.length === 17 && val.match(/^(978|979)-(\d+)-(\d+)-(\d+)-([\dX])$/) ?
          this.fill({
            source: val, isValid: true, isIsbn10: false, isIsbn13: true, prefix: RegExp.$1, group: RegExp.$2,
            publisher: RegExp.$3, article: RegExp.$4, check: RegExp.$5}) :
          null;
  
      if (!ret) {
        return {source: val, isValid: false};
      }
  
      return this.merge(ret, {isValid: ret.check === (ret.isIsbn13 ? ret.check13 : ret.check10)});
    },
  
    split: function(isbn) {
      return (
        !isbn ?
          null :
        isbn.length === 13 ?
          this.merge(this.split(isbn.substr(3)), {prefix: isbn.substr(0, 3)}) :
        isbn.length === 10 ?
          this.splitToObject(isbn) :
          null);
    },
  
    splitToArray: function(isbn10) {
      var rec, key, rest, i, m;
      rec = this.getGroupRecord(isbn10);
      if (!rec) {
        return null;
      }
  
      for (key, i = 0, m = rec.record.ranges.length; i < m; i += 1) {
        key = rec.rest.substr(0, rec.record.ranges[i][0].length);
        if (rec.record.ranges[i][0] <= key && rec.record.ranges[i][1] >= key) {
          rest = rec.rest.substr(key.length);
          return [rec.group, key, rest.substr(0, rest.length - 1), rest.charAt(rest.length - 1)];
        }
      }
      return null;
    },
  
    splitToObject: function(isbn10) {
      var a = this.splitToArray(isbn10);
      if (!a || a.length !== 4) {
        return null;
      }
      return {group: a[0], publisher: a[1], article: a[2], check: a[3]};
    },
  
    fill: function(codes) {
      var rec, prefix, ck10, ck13, parts13, parts10;
  
      if (!codes) {
        return null;
      }
  
      rec = this.groups[codes.group];
      if (!rec) {
        return null;
      }
  
      prefix = codes.prefix ? codes.prefix : '978';
      ck10 = this.calcCheckDigit([
        codes.group, codes.publisher, codes.article].join(''));
      if (!ck10) {
        return null;
      }
  
      ck13 = this.calcCheckDigit([prefix, codes.group, codes.publisher, codes.article].join(''));
      if (!ck13) {
        return null;
      }
  
      parts13 = [prefix, codes.group, codes.publisher, codes.article, ck13];
      this.merge(codes, {
        isbn13: parts13.join(''),
        isbn13h: parts13.join('-'),
        check10: ck10,
        check13: ck13,
        groupname: rec.name
      });
  
      if (prefix === '978') {
        parts10 = [codes.group, codes.publisher, codes.article, ck10];
        this.merge(codes, {isbn10: parts10.join(''), isbn10h: parts10.join('-')});
      }
  
      return codes;
    },
  
    getGroupRecord: function(isbn10) {
      var key;
      for (key in this.groups) {
        if (isbn10.match('^' + key + '(.+)')) {
          return {group: key, record: this.groups[key], rest: RegExp.$1};
        }
      }
      return null;
    },
  
    calcCheckDigit: function(isbn) {
      var c, n;
      if (isbn.match(/^\d{9}[\dX]?$/)) {
        c = 0;
        for (n = 0; n < 9; n += 1) {
          c += (10 - n) * isbn.charAt(n);
        }
        c = (11 - c % 11) % 11;
        return c === 10 ? 'X' : String(c);
  
      } else if (isbn.match(/(?:978|979)\d{9}[\dX]?/)) {
        c = 0;
        for (n = 0; n < 12; n += 2) {
          c += Number(isbn.charAt(n)) + 3 * isbn.charAt(n + 1);
        }
        return String((10 - c % 10) % 10);
      }
  
      return null;
    }
  };
  
    exports.ISBN = ISBN;
  }());
  

  provide("isbn", module.exports);
  provide("isbn", module.exports);
  $.ender(module.exports);
}(global));

// ender:blyph-client/lib/target-info as blyph-client/lib/target-info
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  
    module.exports = function () {
      return location.protocol + '//' + location.host + location.pathname;
    };
  }());
  

  provide("blyph-client/lib/target-info", module.exports);
  provide("blyph-client/lib/target-info", module.exports);
  $.ender(module.exports);
}(global));

// ender:blyph-client/lib/cache as blyph-client/lib/cache
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  
    var localStorage = require('localStorage')
      , JsonStorage = require('json-storage')
      , jsonStorage = JsonStorage(localStorage)
      ;
  
    module.exports = jsonStorage;
  }());
  

  provide("blyph-client/lib/cache", module.exports);
  provide("blyph-client/lib/cache", module.exports);
  $.ender(module.exports);
}(global));

// ender:blyph-client/lib/booklist as blyph-client/lib/booklist
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  
    var request = require('ahr2')
      , targetInfo =  require('blyph-client/lib/target-info')
      , Future = require('future')
      , cache =  require('blyph-client/lib/cache')
      ;
  
    function Booklist(user) {
      var self = this
        ;
  
      self.staletime = Date.now();
  
      // prevent circular reference to user
      // but still allow non-logged in users to work
      self.getUrl = function () {
        return user.userToken ? ('booklist/' + user.userToken) : null;
      }
  
      self.getUser = function () {
        return user;
      }
  
      self.list = (cache.get('booklist'));
    }
  
    Booklist.prototype.keepAlive = function () {
      // TODO setInterval to freshen by retrieval
      // 5 minutes from now
      self.staletime = Date.now() + (5 * 60 * 1000);
    };
  
    Booklist.prototype.get = function () {
      var self = this
        , future = Future()
        , url = self.getUrl()
        , saved
        ;
  
      // TODO grace period between stale data and useless data
      if (!url || (self.list && Date.now() < self.staletime)) {
        future.fulfill(null, self.list);;
        return future;
      }
  
      request.get(targetInfo() + url).when(function (err, ahr, data) {
        // TODO merge previous with new
        if (data.error) {
          alert(data.errors);
        }
  
        self.list = data.result.booklist
        cache.set('booklist', self.list);
  
        self.keepAlive();
        future.fulfill(err, self.list);
      });
  
      return future;
    };
  
    //Booklist.prototype.add
    //Booklist.prototype.remove
  
    Booklist.prototype.save = function (list, _future) {
      var self = this
        , future = _future || Future()
        , url = self.getUrl()
        ;
  
      if (!url) {
        cache.set('booklist', self.list);
        future.fulfill();
        return future;
      }
  
      if (self.pending) {
        clearTimeout(self.pending);
  
        self.pending = setTimeout(function () {
          self.pending = false;
          self.save(list || self.list, future);
        }, 5 * 1000);
  
        return future;
      }
      self.pending = true;
  
      request.post(targetInfo() + url, null, {
          booklist: JSON.stringify({
              userToken: self.getUser().userToken
            , timestamp: Date.now()
            // TODO add 'booklist' serverside
            , type: 'booklist'
            , booklist: self.list
          })
      }).when(function (err, ahr, data) {
        console.log('booklist post', data);
        setTimeout(function () {
          self.pending = false;
        }, 5 * 1000);
        // 5 minutes from now
        self.keepAlive();
        future.fulfill(err);
      });
  
      return future;
    };
  
    Booklist.create = function (user) {
      return new Booklist(user);
    };
  
    module.exports = Booklist;
  }());
  

  provide("blyph-client/lib/booklist", module.exports);
  provide("blyph-client/lib/booklist", module.exports);
  $.ender(module.exports);
}(global));

// ender:blyph-client/lib/regexp-escape as blyph-client/lib/regexp-escape
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  
    function escapeRegExp(str) {
      return str.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }
  
    module.exports = escapeRegExp;
  }());
  

  provide("blyph-client/lib/regexp-escape", module.exports);
  provide("blyph-client/lib/regexp-escape", module.exports);
  $.ender(module.exports);
}(global));

// ender:blyph-client/lib/user as blyph-client/lib/user
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  // Test Data
  // http://blyph.com/booklist/0a8b345ddcfc5401f578c850442f1e1b
  (function () {
    "use strict";
  
    var request = require('ahr2')
      , EventEmitter = require('events').EventEmitter
      , MD5 = require('md5')
      , Future = require('future')
      , Booklist =  require('blyph-client/lib/booklist')
      , targetInfo =  require('blyph-client/lib/target-info')
      , cache =  require('blyph-client/lib/cache')
      ;
  
    function User() {
      var self = this
        , saved
        ;
  
      self.events = new EventEmitter();
      // TODO why is this of type Object rather than Booklist?
      self.booklist = Booklist.create(self);
  
      saved = cache.get('user');
  
      if (saved) {
        Object.keys(saved).forEach(function (key) {
          self[key] = saved[key];
        });
      }
  
      if (!saved || !saved.email || !saved.school) {
        return;
      }
  
      self.login(saved.email, saved.school);
    }
  
    User.prototype.login = function (email, school) {
      var err
        , self = this
        , future = Future()
        ;
  
      self.email = email.trim().toLowerCase();
      self.nickname = self.email.replace(/@.*/, '');
      self.school = school || self.school;
  
      if (/@/.exec(self.email)) {
        self.userToken = MD5.digest_s(self.email);
      } else {
        self.error = new Error('Invalid User Token');
      }
  
      self.gravatar = 'http://www.gravatar.com/avatar/' + self.userToken + '?s=50&r=pg&d=identicon';
  
      if (self.isLoggedIn) {
        console.warn('Why are you trying to login again?');
        future.fulfill(null, self);
        return future;
      }
      self.isLoggedIn = true;
  
      self.save().when(future.fulfill);
  
      return future;
    };
  
    User.prototype.destroy = function () {
      cache.set('user', null);
      // TODO booklist destroy
    };
  
    User.prototype.logout = function () {
      self.destroy()
    };
  
    User.prototype.save = function () {
      var self = this
        , future = Future()
        ;
  
      cache.set('user', self);
  
      if (!self.email) {
        future.fulfill(null, self);
        return future;
      }
  
      // TODO rename /subscribe
      request.post(targetInfo() + '/subscribe', null, self).when(function (err, ahr, data) {
        console.log('user.save', data);
        Object.keys(data.couchdb).forEach(function (key) {
          self[key] = data.couchdb[key];
        });
  
        future.fulfill(err, self);
      });
  
      return future;
    };
  
  
    User.create = function (email) {
      return new User(email);
    };
  
    module.exports = User;
  }());
  

  provide("blyph-client/lib/user", module.exports);
  provide("blyph-client/lib/user", module.exports);
  $.ender(module.exports);
}(global));

// ender:blyph-client/lib/search as blyph-client/lib/search
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  
  
    var CampusBooks = require('campusbooks')
      //, campusbooks = CampusBooks.create("BLCg7q5VrmUBxsrETg5c")
      , campusbooks = CampusBooks.create("BDz21GvuL6RgTKiSbwe3")
      , ISBN = require('isbn').ISBN
      , searchCache = {}
      , patternIsbn = /\d{10}|\d{13}/
      , punctRe = /[\.\-_'":!\$\?]/g
      , escapeRegExp =  require('blyph-client/lib/regexp-escape')
      , keywordCache = {}
      ;
  
    function searchInCache(title) {
      var results = []
        , pattern
        ;
  
      title = (title || '').replace(punctRe, '');
      pattern = new RegExp('\\b' + escapeRegExp(title), 'i');
  
      if (pattern.exec('zzzzz')) {
        return [];
      }
  
      Object.keys(searchCache).forEach(function (isbn) {
        // TODO romanize titles (as does mediabox)
        var book = searchCache[isbn]
          , title = (book.title||'').replace(punctRe, '')
          ;
  
        if (pattern.exec(title)) {
          results.push(book);
        }
      });
  
      return results.slice(0, 10);
    }
  
  
    function normalizeCampusBookResult(searchType, input, data) {
      var books
        , error
        , now = new Date().valueOf()
        ;
  
      books = data 
          && data.response 
          && data.response.page 
          && data.response.page.results 
          && data.response.page.results.book
          || undefined;
  
      if ('bookinfo' === searchType) {
        books = data 
            && data.response 
            && data.response.page
            || undefined;
      }
  
      books = books && (Array.isArray(books) ? books : [books]);
  
      error = data && data.repsonse && data.response.errors;
  
      if (error) {
        // TODO unobtrusive alert('params: ' + JSON.stringify(params));
        console.error("something erred", error);
        return { error: error };
      }
  
      if (!books) {
        books = [];
        console.warn("missing data", data);
        return { error: "missing data" };
      } else {
        keywordCache[input] = data;
      }
  
      function cacheBook(book) {
        searchCache[book.isbn13||book.isbn||book.isbn10] = book;
        book.timestamp = new Date().valueOf();
      }
  
      books.forEach(cacheBook);
  
      return books;
    }
  
    function searchForBook(callback, input) {
      var isbn
        , isbnText
        , opts = {}
        , searchType
        , results
        ;
  
      input = String(input||'').toLowerCase().trim();
  
      if (!(input.length >= 3)) {
        callback(null, []);
        return;
      }
  
      isbnText = input.replace(/[\s\.\-_]/g, '');
      isbn = ISBN.parse(isbnText);
  
      if (isbn || patternIsbn.exec(isbnText)) {
        opts.isbn = isbnText;
        searchType = 'bookinfo';
        results = searchCache[isbnText];
        results = results && [results];
      } else {
        opts.title = input;
        searchType = 'search'
        // TODO search school cache
      }
  
      // TODO merge in both results
      results = results || keywordCache[input] || searchInCache(input);
  
      // 150px seems a good size
      opts.image_height = 150;
  
      if (!results || !results.length) {
        console.log('options', opts);
        campusbooks[searchType](opts).when(function (err, ahr, data) {
          results = normalizeCampusBookResult(searchType, input, data);
          callback(results.error, results);
        });
      } else {
        callback(results.error, results);
      }
    }
  
    module.exports = searchForBook;
  }());
  

  provide("blyph-client/lib/search", module.exports);
  provide("blyph-client/lib/search", module.exports);
  $.ender(module.exports);
}(global));

// ender:blyph-client/lib/delay-key-up as blyph-client/lib/delay-key-up
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  
    function delayKeyUp(params) {
      var key_timeout = 0
        , ignore_me = false
        , lastData
        , wait = params.timeout
        , getData = params.getter
        , shouldWait = params.validater
        , cb = params.callback
        ;
  
      return {
        keyup: function (ev) {
          ev.preventDefault();
  
          if (ignore_me) {
            ignore_me = false;
            return;
          }
  
          var data = getData();
          if (lastData === data) {
            return;
          }
          lastData = data;
  
          clearTimeout(key_timeout);
          if (shouldWait(data)) {
            key_timeout = 0;
            cb(data);
          } else {
            key_timeout = setTimeout(cb, wait, data);
          }
        },
        submit: function (ev) {
          ev.preventDefault();
          clearTimeout(key_timeout);
  
          var data = getData();
          /*
          if (lastData === data) {
            return;
          }
          lastData = data;
          */
  
          ignore_me = true;
          cb(data);
        }
      };
    }
  
    module.exports = delayKeyUp;
  }());
  

  provide("blyph-client/lib/delay-key-up", module.exports);
  provide("blyph-client/lib/delay-key-up", module.exports);
  $.ender(module.exports);
}(global));

// ender:blyph-client as blyph-client
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  
    var User =  require('blyph-client/lib/user')
      , Booklist =  require('blyph-client/lib/booklist')
      , searchForBooks =  require('blyph-client/lib/search')
      , targetInfo =  require('blyph-client/lib/target-info')
      , DelayKeyUp =  require('blyph-client/lib/delay-key-up')
      , $ = require('ender')
      , serializeForm = require('serialize-form').serializeFormObject
      , user = User.create()
      , booklist = Booklist.create(user)
      ;
  
    function login() {
      $('#saveyourinfo').hide();
      $('#logout').show();
    }
  
    function showBookResults(err, books) {
      if (err) {
        console.error(err);
      }
      if (!books || !books.length) {
        console.warn('no books found');
        return;
      }
      console.log(books);
    }
  
    function createOrGetUser(ev) {
      ev.preventDefault();
  
      var values = serializeForm('form#email_form')
        ;
  
      console.log('login', values);
  
      user.login(values.email, values.school).when(function (err) {
        if (err) {
          alert(err.message);
          return;
        }
  
        login();
      });
    }
  
    function logout(ev) {
      ev.preventDefault();
  
      user.logout();
      user = User.create();
  
      $('#saveyourinfo').show();
      $('#logout').hide();
    }
  
    function attachHandlers() {
      $('body').delegate('form#email_form', 'submit', createOrGetUser);
      $('body').delegate('#logout a', 'click', logout);
  
      // TODO use booklist as part of user
      console.log('user.booklist', user.booklist);
      booklist.get().when(function (err, list) {
        console.log('booklist', list);
      });
  
      console.log('isLoggedIn', user.isLoggedIn);
      if (user.isLoggedIn) {
        $('#saveyourinfo').hide();
        $('#logout').show();
      } else {
        $('#saveyourinfo').show();
        $('#logout').hide();
      }
  
      (function () {
        var respondon
          ;
  
        respondon = DelayKeyUp({
            timeout: 500
          , getter: function () {
              return $('#search').val();
            }
          , validater: function (input) {
              if (!/\w$/.exec(input) && input.length >= 5) {
                return true;
              }
              return false;
            }
          , callback: function (input) {
              console.log("submit: " + input);
              searchForBooks(showBookResults, input);
            }
        });
  
        $("body").delegate("#search", "keyup", respondon.keyup);
        $("body").delegate("form#search_form", "submit", respondon.submit);
      }());
    }
  
    $.domReady(attachHandlers);
  }());
  

  provide("blyph-client", module.exports);
  provide("blyph-client", module.exports);
  $.ender(module.exports);
}(global));window.FormData = window.FormData || function FormData() {};
var global = Function("return this;")()
/*!
  * Ender: open module JavaScript framework (client-lib)
  * copyright Dustin Diaz & Jacob Thornton 2011 (@ded @fat)
  * http://ender.no.de
  * License MIT
  */
!function (context) {

  // a global object for node.js module compatiblity
  // ============================================

  context['global'] = context

  // Implements simple module system
  // losely based on CommonJS Modules spec v1.1.1
  // ============================================

  var modules = {}
    , old = context.$

  function require (identifier) {
    // modules can be required from ender's build system, or found on the window
    var module = modules[identifier] || window[identifier]
    if (!module) throw new Error("Requested module '" + identifier + "' has not been defined.")
    return module
  }

  function provide (name, what) {
    return (modules[name] = what)
  }

  context['provide'] = provide
  context['require'] = require

  function aug(o, o2) {
    for (var k in o2) k != 'noConflict' && k != '_VERSION' && (o[k] = o2[k])
    return o
  }

  function boosh(s, r, els) {
    // string || node || nodelist || window
    if (typeof s == 'string' || s.nodeName || (s.length && 'item' in s) || s == window) {
      els = ender._select(s, r)
      els.selector = s
    } else els = isFinite(s.length) ? s : [s]
    return aug(els, boosh)
  }

  function ender(s, r) {
    return boosh(s, r)
  }

  aug(ender, {
      _VERSION: '0.3.6'
    , fn: boosh // for easy compat to jQuery plugins
    , ender: function (o, chain) {
        aug(chain ? boosh : ender, o)
      }
    , _select: function (s, r) {
        return (r || document).querySelectorAll(s)
      }
  })

  aug(boosh, {
    forEach: function (fn, scope, i) {
      // opt out of native forEach so we can intentionally call our own scope
      // defaulting to the current item and be able to return self
      for (i = 0, l = this.length; i < l; ++i) i in this && fn.call(scope || this[i], this[i], i, this)
      // return self for chaining
      return this
    },
    $: ender // handy reference to self
  })

  ender.noConflict = function () {
    context.$ = old
    return this
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = ender
  // use subscript notation as extern for Closure compilation
  context['ender'] = context['$'] = context['ender'] || ender

}(this);
// ender:querystring as querystring
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.
  
  // Query String Utilities
  
  (typeof define === "undefined" ? function($) { $(require, exports, module) } : define)(function(require, exports, module, undefined) {
  "use strict";
  
  var QueryString = exports;
  
  function charCode(c) {
    return c.charCodeAt(0);
  }
  
  QueryString.unescape = decodeURIComponent;
  QueryString.escape = encodeURIComponent;
  
  var stringifyPrimitive = function(v) {
    switch (typeof v) {
      case 'string':
        return v;
  
      case 'boolean':
        return v ? 'true' : 'false';
  
      case 'number':
        return isFinite(v) ? v : '';
  
      default:
        return '';
    }
  };
  
  
  QueryString.stringify = QueryString.encode = function(obj, sep, eq, name) {
    sep = sep || '&';
    eq = eq || '=';
    obj = (obj === null) ? undefined : obj;
  
    switch (typeof obj) {
      case 'object':
        return Object.keys(obj).map(function(k) {
          if (Array.isArray(obj[k])) {
            return obj[k].map(function(v) {
              return QueryString.escape(stringifyPrimitive(k)) +
                     eq +
                     QueryString.escape(stringifyPrimitive(v));
            }).join(sep);
          } else {
            return QueryString.escape(stringifyPrimitive(k)) +
                   eq +
                   QueryString.escape(stringifyPrimitive(obj[k]));
          }
        }).join(sep);
  
      default:
        if (!name) return '';
        return QueryString.escape(stringifyPrimitive(name)) + eq +
               QueryString.escape(stringifyPrimitive(obj));
    }
  };
  
  // Parse a key=val string.
  QueryString.parse = QueryString.decode = function(qs, sep, eq) {
    sep = sep || '&';
    eq = eq || '=';
    var obj = {};
  
    if (typeof qs !== 'string' || qs.length === 0) {
      return obj;
    }
  
    qs.split(sep).forEach(function(kvp) {
      var x = kvp.split(eq);
      var k = QueryString.unescape(x[0], true);
      var v = QueryString.unescape(x.slice(1).join(eq), true);
  
      if (!(k in obj)) {
        obj[k] = v;
      } else if (!Array.isArray(obj[k])) {
        obj[k] = [obj[k], v];
      } else {
        obj[k].push(v);
      }
    });
  
    return obj;
  };
  
  });
  

  provide("querystring", module.exports);
  provide("querystring", module.exports);
  $.ender(module.exports);
}(global));

// ender:punycode as punycode
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*! http://mths.be/punycode by @mathias */
  ;(function(root) {
  
  	/**
  	 * The `punycode` object.
  	 * @name punycode
  	 * @type Object
  	 */
  	var punycode,
  
  	/** Detect free variables `define`, `exports`, `module` and `require` */
  	freeDefine = typeof define == 'function' && typeof define.amd == 'object' &&
  		define.amd && define,
  	freeExports = typeof exports == 'object' && exports,
  	freeModule = typeof module == 'object' && module,
  	freeRequire = typeof require == 'function' && require,
  
  	/** Highest positive signed 32-bit float value */
  	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1
  
  	/** Bootstring parameters */
  	base = 36,
  	tMin = 1,
  	tMax = 26,
  	skew = 38,
  	damp = 700,
  	initialBias = 72,
  	initialN = 128, // 0x80
  	delimiter = '-', // '\x2D'
  
  	/** Regular expressions */
  	regexNonASCII = /[^ -~]/, // unprintable ASCII chars + non-ASCII chars
  	regexPunycode = /^xn--/,
  
  	/** Error messages */
  	errors = {
  		'overflow': 'Overflow: input needs wider integers to process.',
  		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
  		'invalid-input': 'Invalid input'
  	},
  
  	/** Convenience shortcuts */
  	baseMinusTMin = base - tMin,
  	floor = Math.floor,
  	stringFromCharCode = String.fromCharCode,
  
  	/** Temporary variable */
  	key;
  
  	/*--------------------------------------------------------------------------*/
  
  	/**
  	 * A generic error utility function.
  	 * @private
  	 * @param {String} type The error type.
  	 * @returns {Error} Throws a `RangeError` with the applicable error message.
  	 */
  	function error(type) {
  		throw RangeError(errors[type]);
  	}
  
  	/**
  	 * A generic `Array#map` utility function.
  	 * @private
  	 * @param {Array} array The array to iterate over.
  	 * @param {Function} callback The function that gets called for every array
  	 * item.
  	 * @returns {Array} A new array of values returned by the callback function.
  	 */
  	function map(array, fn) {
  		var length = array.length;
  		while (length--) {
  			array[length] = fn(array[length]);
  		}
  		return array;
  	}
  
  	/**
  	 * A simple `Array#map`-like wrapper to work with domain name strings.
  	 * @private
  	 * @param {String} domain The domain name.
  	 * @param {Function} callback The function that gets called for every
  	 * character.
  	 * @returns {Array} A new string of characters returned by the callback
  	 * function.
  	 */
  	function mapDomain(string, fn) {
  		var glue = '.';
  		return map(string.split(glue), fn).join(glue);
  	}
  
  	/**
  	 * Creates an array containing the decimal code points of each Unicode
  	 * character in the string. While JavaScript uses UCS-2 internally,
  	 * this function will convert a pair of surrogate halves (each of which
  	 * UCS-2 exposes as separate characters) into a single code point,
  	 * matching UTF-16.
  	 * @see `punycode.ucs2.encode`
  	 * @see <http://mathiasbynens.be/notes/javascript-encoding>
  	 * @memberOf punycode.ucs2
  	 * @name decode
  	 * @param {String} string The Unicode input string (UCS-2).
  	 * @returns {Array} The new array of code points.
  	 */
  	function ucs2decode(string) {
  		var output = [],
  		    counter = 0,
  		    length = string.length,
  		    value,
  		    extra;
  		while (counter < length) {
  			value = string.charCodeAt(counter++);
  			if ((value & 0xF800) == 0xD800 && counter < length) {
  				// high surrogate, and there is a next character
  				extra = string.charCodeAt(counter++);
  				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
  					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
  				} else {
  					output.push(value, extra);
  				}
  			} else {
  				output.push(value);
  			}
  		}
  		return output;
  	}
  
  	/**
  	 * Creates a string based on an array of decimal code points.
  	 * @see `punycode.ucs2.decode`
  	 * @memberOf punycode.ucs2
  	 * @name encode
  	 * @param {Array} codePoints The array of decimal code points.
  	 * @returns {String} The new Unicode string (UCS-2).
  	 */
  	function ucs2encode(array) {
  		return map(array, function(value) {
  			var output = '';
  			if (value > 0xFFFF) {
  				value -= 0x10000;
  				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
  				value = 0xDC00 | value & 0x3FF;
  			}
  			output += stringFromCharCode(value);
  			return output;
  		}).join('');
  	}
  
  	/**
  	 * Converts a basic code point into a digit/integer.
  	 * @see `digitToBasic()`
  	 * @private
  	 * @param {Number} codePoint The basic (decimal) code point.
  	 * @returns {Number} The numeric value of a basic code point (for use in
  	 * representing integers) in the range `0` to `base - 1`, or `base` if
  	 * the code point does not represent a value.
  	 */
  	function basicToDigit(codePoint) {
  		return codePoint - 48 < 10
  			? codePoint - 22
  			: codePoint - 65 < 26
  				? codePoint - 65
  				: codePoint - 97 < 26
  					? codePoint - 97
  					: base;
  	}
  
  	/**
  	 * Converts a digit/integer into a basic code point.
  	 * @see `basicToDigit()`
  	 * @private
  	 * @param {Number} digit The numeric value of a basic code point.
  	 * @returns {Number} The basic code point whose value (when used for
  	 * representing integers) is `digit`, which needs to be in the range
  	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
  	 * used; else, the lowercase form is used. The behavior is undefined
  	 * if flag is non-zero and `digit` has no uppercase form.
  	 */
  	function digitToBasic(digit, flag) {
  		//  0..25 map to ASCII a..z or A..Z
  		// 26..35 map to ASCII 0..9
  		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
  	}
  
  	/**
  	 * Bias adaptation function as per section 3.4 of RFC 3492.
  	 * http://tools.ietf.org/html/rfc3492#section-3.4
  	 * @private
  	 */
  	function adapt(delta, numPoints, firstTime) {
  		var k = 0;
  		delta = firstTime ? floor(delta / damp) : delta >> 1;
  		delta += floor(delta / numPoints);
  		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
  			delta = floor(delta / baseMinusTMin);
  		}
  		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
  	}
  
  	/**
  	 * Converts a basic code point to lowercase is `flag` is falsy, or to
  	 * uppercase if `flag` is truthy. The code point is unchanged if it's
  	 * caseless. The behavior is undefined if `codePoint` is not a basic code
  	 * point.
  	 * @private
  	 * @param {Number} codePoint The numeric value of a basic code point.
  	 * @returns {Number} The resulting basic code point.
  	 */
  	function encodeBasic(codePoint, flag) {
  		codePoint -= (codePoint - 97 < 26) << 5;
  		return codePoint + (!flag && codePoint - 65 < 26) << 5;
  	}
  
  	/**
  	 * Converts a Punycode string of ASCII code points to a string of Unicode
  	 * code points.
  	 * @memberOf punycode
  	 * @param {String} input The Punycode string of ASCII code points.
  	 * @returns {String} The resulting string of Unicode code points.
  	 */
  	function decode(input) {
  		// Don't use UCS-2
  		var output = [],
  		    inputLength = input.length,
  		    out,
  		    i = 0,
  		    n = initialN,
  		    bias = initialBias,
  		    basic,
  		    j,
  		    index,
  		    oldi,
  		    w,
  		    k,
  		    digit,
  		    t,
  		    length,
  		    /** Cached calculation results */
  		    baseMinusT;
  
  		// Handle the basic code points: let `basic` be the number of input code
  		// points before the last delimiter, or `0` if there is none, then copy
  		// the first basic code points to the output.
  
  		basic = input.lastIndexOf(delimiter);
  		if (basic < 0) {
  			basic = 0;
  		}
  
  		for (j = 0; j < basic; ++j) {
  			// if it's not a basic code point
  			if (input.charCodeAt(j) >= 0x80) {
  				error('not-basic');
  			}
  			output.push(input.charCodeAt(j));
  		}
  
  		// Main decoding loop: start just after the last delimiter if any basic code
  		// points were copied; start at the beginning otherwise.
  
  		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {
  
  			// `index` is the index of the next character to be consumed.
  			// Decode a generalized variable-length integer into `delta`,
  			// which gets added to `i`. The overflow checking is easier
  			// if we increase `i` as we go, then subtract off its starting
  			// value at the end to obtain `delta`.
  			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {
  
  				if (index >= inputLength) {
  					error('invalid-input');
  				}
  
  				digit = basicToDigit(input.charCodeAt(index++));
  
  				if (digit >= base || digit > floor((maxInt - i) / w)) {
  					error('overflow');
  				}
  
  				i += digit * w;
  				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
  
  				if (digit < t) {
  					break;
  				}
  
  				baseMinusT = base - t;
  				if (w > floor(maxInt / baseMinusT)) {
  					error('overflow');
  				}
  
  				w *= baseMinusT;
  
  			}
  
  			out = output.length + 1;
  			bias = adapt(i - oldi, out, oldi == 0);
  
  			// `i` was supposed to wrap around from `out` to `0`,
  			// incrementing `n` each time, so we'll fix that now:
  			if (floor(i / out) > maxInt - n) {
  				error('overflow');
  			}
  
  			n += floor(i / out);
  			i %= out;
  
  			// Insert `n` at position `i` of the output
  			output.splice(i++, 0, n);
  
  		}
  
  		return ucs2encode(output);
  	}
  
  	/**
  	 * Converts a string of Unicode code points to a Punycode string of ASCII
  	 * code points.
  	 * @memberOf punycode
  	 * @param {String} input The string of Unicode code points.
  	 * @returns {String} The resulting Punycode string of ASCII code points.
  	 */
  	function encode(input) {
  		var n,
  		    delta,
  		    handledCPCount,
  		    basicLength,
  		    bias,
  		    j,
  		    m,
  		    q,
  		    k,
  		    t,
  		    currentValue,
  		    output = [],
  		    /** `inputLength` will hold the number of code points in `input`. */
  		    inputLength,
  		    /** Cached calculation results */
  		    handledCPCountPlusOne,
  		    baseMinusT,
  		    qMinusT;
  
  		// Convert the input in UCS-2 to Unicode
  		input = ucs2decode(input);
  
  		// Cache the length
  		inputLength = input.length;
  
  		// Initialize the state
  		n = initialN;
  		delta = 0;
  		bias = initialBias;
  
  		// Handle the basic code points
  		for (j = 0; j < inputLength; ++j) {
  			currentValue = input[j];
  			if (currentValue < 0x80) {
  				output.push(stringFromCharCode(currentValue));
  			}
  		}
  
  		handledCPCount = basicLength = output.length;
  
  		// `handledCPCount` is the number of code points that have been handled;
  		// `basicLength` is the number of basic code points.
  
  		// Finish the basic string - if it is not empty - with a delimiter
  		if (basicLength) {
  			output.push(delimiter);
  		}
  
  		// Main encoding loop:
  		while (handledCPCount < inputLength) {
  
  			// All non-basic code points < n have been handled already. Find the next
  			// larger one:
  			for (m = maxInt, j = 0; j < inputLength; ++j) {
  				currentValue = input[j];
  				if (currentValue >= n && currentValue < m) {
  					m = currentValue;
  				}
  			}
  
  			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
  			// but guard against overflow
  			handledCPCountPlusOne = handledCPCount + 1;
  			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
  				error('overflow');
  			}
  
  			delta += (m - n) * handledCPCountPlusOne;
  			n = m;
  
  			for (j = 0; j < inputLength; ++j) {
  				currentValue = input[j];
  
  				if (currentValue < n && ++delta > maxInt) {
  					error('overflow');
  				}
  
  				if (currentValue == n) {
  					// Represent delta as a generalized variable-length integer
  					for (q = delta, k = base; /* no condition */; k += base) {
  						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
  						if (q < t) {
  							break;
  						}
  						qMinusT = q - t;
  						baseMinusT = base - t;
  						output.push(
  							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
  						);
  						q = floor(qMinusT / baseMinusT);
  					}
  
  					output.push(stringFromCharCode(digitToBasic(q, 0)));
  					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
  					delta = 0;
  					++handledCPCount;
  				}
  			}
  
  			++delta;
  			++n;
  
  		}
  		return output.join('');
  	}
  
  	/**
  	 * Converts a Punycode string representing a domain name to Unicode. Only the
  	 * Punycoded parts of the domain name will be converted, i.e. it doesn't
  	 * matter if you call it on a string that has already been converted to
  	 * Unicode.
  	 * @memberOf punycode
  	 * @param {String} domain The Punycode domain name to convert to Unicode.
  	 * @returns {String} The Unicode representation of the given Punycode
  	 * string.
  	 */
  	function toUnicode(domain) {
  		return mapDomain(domain, function(string) {
  			return regexPunycode.test(string)
  				? decode(string.slice(4).toLowerCase())
  				: string;
  		});
  	}
  
  	/**
  	 * Converts a Unicode string representing a domain name to Punycode. Only the
  	 * non-ASCII parts of the domain name will be converted, i.e. it doesn't
  	 * matter if you call it with a domain that's already in ASCII.
  	 * @memberOf punycode
  	 * @param {String} domain The domain name to convert, as a Unicode string.
  	 * @returns {String} The Punycode representation of the given domain name.
  	 */
  	function toASCII(domain) {
  		return mapDomain(domain, function(string) {
  			return regexNonASCII.test(string)
  				? 'xn--' + encode(string)
  				: string;
  		});
  	}
  
  	/*--------------------------------------------------------------------------*/
  
  	/** Define the public API */
  	punycode = {
  		/**
  		 * A string representing the current Punycode.js version number.
  		 * @memberOf punycode
  		 * @type String
  		 */
  		'version': '1.1.1',
  		/**
  		 * An object of methods to convert from JavaScript's internal character
  		 * representation (UCS-2) to decimal Unicode code points, and back.
  		 * @see <http://mathiasbynens.be/notes/javascript-encoding>
  		 * @memberOf punycode
  		 * @type Object
  		 */
  		'ucs2': {
  			'decode': ucs2decode,
  			'encode': ucs2encode
  		},
  		'decode': decode,
  		'encode': encode,
  		'toASCII': toASCII,
  		'toUnicode': toUnicode
  	};
  
  	/** Expose `punycode` */
  	if (freeExports) {
  		if (freeModule && freeModule.exports == freeExports) {
  			// in Node.js or Ringo 0.8+
  			freeModule.exports = punycode;
  		} else {
  			// in Narwhal or Ringo 0.7-
  			for (key in punycode) {
  				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
  			}
  		}
  	} else if (freeDefine) {
  		// via curl.js or RequireJS
  		define('punycode', punycode);
  	} else {
  		// in a browser or Rhino
  		root.punycode = punycode;
  	}
  
  }(this));

  provide("punycode", module.exports);
  provide("punycode", module.exports);
  $.ender(module.exports);
}(global));

// ender:future as future
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jshint laxcomma:true node:true es5:true onevar:true */
  (function () {
    "use strict";
  
    var MAX_INT = Math.pow(2,52);
  
    function isFuture(obj) {
      return obj instanceof Future;
    }
  
    function FutureTimeoutException(time) {
      this.name = "FutureTimeout";
      this.message = "timeout " + time + "ms";
    }
  
    //
    function privatize(obj, pubs) {
      var result = {};
      pubs.forEach(function (pub) {
        result[pub] = function () {
          obj[pub].apply(obj, arguments);
          return result;
        };
      });
      return result;
    }
  
    function Future(global_context, options) {
      if (!isFuture(this)) {
        return new Future(global_context, options);
      }
  
      var self = this
        ;
        
      self._everytimers = {};
      self._onetimers = {};
      self._index = 0;
      self._deliveries = 0;
      self._time = 0;
      //self._asap = false;
      self._asap =  true;
  
      //self._data;
      //self._timeout_id;
  
      self._passenger = null;
      self.fulfilled = false;
  
      self._global_context = global_context;
  
      // TODO change `null` to `this`
      self._global_context = ('undefined' === typeof self._global_context ? null : self._global_context);
  
      self._options = options || {};
      self._options.error = self._options.error || function (err) {
        throw err;
      };
  
      self.errback = function () {
        if (arguments.length < 2) {
          self.deliver.call(self, arguments[0] || new Error("`errback` called without Error"));
        } else {
          self.deliver.apply(self, arguments);
        }
      };
  
      self.callback = function () {
        var args = Array.prototype.slice.call(arguments);
  
        args.unshift(undefined);
        self.deliver.apply(self, args);
      };
  
      self.fulfill = function () {
        if (arguments.length) {
          self.deliver.apply(self, arguments);
        } else {
          self.deliver();
        }
        self.fulfilled = true;
      };
  
      self.when = function (callback, local_context) {
        // this self._index will be the id of the everytimer
        self._onetimers[self._index] = true;
        self.whenever(callback, local_context);
  
        return self;
      };
  
      self.whenever = function (callback, local_context) {
        var id = self._index,
          everytimer;
  
        if ('function' !== typeof callback) {
          self._options.error(new Error("Future().whenever(callback, [context]): callback must be a function."));
          return;
        }
  
        if (self._findCallback(callback, local_context)) {
          // TODO log
          self._options.error(new Error("Future().everytimers is a strict set. Cannot add already subscribed `callback, [context]`."));
          return;
        }
  
        everytimer = self._everytimers[id] = {
          id: id,
          callback: callback,
          context: (null === local_context) ? null : (local_context || self._global_context)
        };
  
        if (self._asap && self._deliveries > 0) {
          // doesn't raise deliver count on purpose
          everytimer.callback.apply(everytimer.context, self._data);
          if (self._onetimers[id]) {
            delete self._onetimers[id];
            delete self._everytimers[id];
          }
        }
  
        self._index += 1;
        if (self._index >= MAX_INT) {
          self._cleanup(); // Works even for long-running processes
        }
  
        return self;
      };
  
      self.deliver = function () {
        if (self.fulfilled) {
          self._options.error(new Error("`Future().fulfill(err, data, ...)` renders future deliveries useless"));
          return;
        }
  
        var args = Array.prototype.slice.call(arguments);
        self._data = args;
  
        self._deliveries += 1; // Eventually reaches `Infinity`...
  
        Object.keys(self._everytimers).forEach(function (id) {
          var everytimer = self._everytimers[id],
            callback = everytimer.callback,
            context = everytimer.context;
  
          if (self._onetimers[id]) {
            delete self._everytimers[id];
            delete self._onetimers[id];
          }
  
          // TODO
          callback.apply(context, args);
          /*
          callback.apply(('undefined' !== context ? context : newme), args);
          context = newme;
          context = ('undefined' !== global_context ? global_context : context)
          context = ('undefined' !== local_context ? local_context : context)
          */
        });
  
        if (args[0] && "FutureTimeout" !== args[0].name) {
          self._resetTimeout();
        }
  
  
        return self;
      };
    }
  
    Future.prototype.setContext = function (context) {
      var self = this
        ;
  
      self._global_context = context;
    };
  
    Future.prototype.setTimeout = function (new_time) {
      var self = this
        ;
  
      self._time = new_time;
      self._resetTimeout();
    };
  
    Future.prototype._resetTimeout = function () {
      var self = this
        ;
  
      if (self._timeout_id) {
        clearTimeout(self._timeout_id);
        self._timeout_id = undefined;
      }
  
      if (self._time > 0) {
        self._timeout_id = setTimeout(function () {
          self.deliver(new FutureTimeoutException(self._time));
          self._timeout_id = undefined;
        }, self._time);
      }
    };
  
    Future.prototype.callbackCount = function() {
      var self = this
        ;
  
      return Object.keys(self._everytimers).length;
    };
  
    Future.prototype.deliveryCount = function() {
      var self = this
        ;
  
      return self._deliveries;
    };
  
    Future.prototype.setAsap = function(new_asap) {
      var self = this
        ;
  
      if (undefined === new_asap) {
        new_asap = true;
      }
  
      if (true !== new_asap && false !== new_asap) {
        self._options.error(new Error("Future.setAsap(asap) accepts literal true or false, not " + new_asap));
        return;
      }
  
      self._asap = new_asap;
    };
  
    Future.prototype._findCallback = function (callback, context) {
      var self = this
        , result
        ;
  
      Object.keys(self._everytimers).forEach(function (id) {
        var everytimer = self._everytimers[id]
          ;
  
        if (callback === everytimer.callback) {
          if (context === everytimer.context || everytimer.context === self._global_context) {
            result = everytimer;
          }
        }
      });
  
      return result;
    };
  
    Future.prototype.hasCallback = function () {
      var self = this
        ;
  
      return !!self._findCallback.apply(self, arguments);
    };
  
    Future.prototype.removeCallback = function(callback, context) {
      var self = this
        , everytimer = self._findCallback(callback, context)
        ;
        
      if (everytimer) {
        delete self._everytimers[everytimer.id];
        self._onetimers[everytimer.id] = undefined;
        delete self._onetimers[everytimer.id];
      }
  
      return self;
    };
  
    Future.prototype.passable = function () {
      var self = this
        ;
  
      self._passenger = privatize(self, [
        "when",
        "whenever"
      ]);
  
      return self._passenger;
    };
  
    // this will probably never get called and, hence, is not yet well tested
    Future.prototype._cleanup = function () {
      var self = this
        , new_everytimers = {}
        , new_onetimers = {}
        ;
  
      self._index = 0;
      Object.keys(self._everytimers).forEach(function (id) {
        var newtimer = new_everytimers[self._index] = self._everytimers[id];
  
        if (self._onetimers[id]) {
          new_onetimers[self._index] = true;
        }
  
        newtimer.id = self._index;
        self._index += 1;
      });
  
      self._onetimers = new_onetimers;
      self._everytimers = new_everytimers;
    };
  
    function create(context, options) {
      // TODO use prototype hack instead of new?
      return new Future(context, options);
    }
  
    Future.prototype.isFuture = isFuture;
  
    Future.isFuture = isFuture;
    Future.create = create;
    module.exports = Future;
  }());
  

  provide("future", module.exports);
  provide("future", module.exports);
  $.ender(module.exports);
}(global));

// ender:events.node as events
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  if ('undefined' === typeof process) {
    process = {};
  }
  (function () {
    "use strict";
  
    process.EventEmitter = process.EventEmitter || function () {};
  
  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.
  
  var EventEmitter = exports.EventEmitter = process.EventEmitter;
  var isArray = Array.isArray;
  
  // By default EventEmitters will print a warning if more than
  // 10 listeners are added to it. This is a useful default which
  // helps finding memory leaks.
  //
  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.
  var defaultMaxListeners = 10;
  EventEmitter.prototype.setMaxListeners = function(n) {
    if (!this._events) this._events = {};
    this._events.maxListeners = n;
  };
  
  
  EventEmitter.prototype.emit = function(type) {
    // If there is no 'error' event listener then throw.
    if (type === 'error') {
      if (!this._events || !this._events.error ||
          (isArray(this._events.error) && !this._events.error.length))
      {
        if (arguments[1] instanceof Error) {
          throw arguments[1]; // Unhandled 'error' event
        } else {
          throw new Error("Uncaught, unspecified 'error' event.");
        }
        return false;
      }
    }
  
    if (!this._events) return false;
    var handler = this._events[type];
    if (!handler) return false;
  
    if (typeof handler == 'function') {
      switch (arguments.length) {
        // fast cases
        case 1:
          handler.call(this);
          break;
        case 2:
          handler.call(this, arguments[1]);
          break;
        case 3:
          handler.call(this, arguments[1], arguments[2]);
          break;
        // slower
        default:
          var args = Array.prototype.slice.call(arguments, 1);
          handler.apply(this, args);
      }
      return true;
  
    } else if (isArray(handler)) {
      var args = Array.prototype.slice.call(arguments, 1);
  
      var listeners = handler.slice();
      for (var i = 0, l = listeners.length; i < l; i++) {
        listeners[i].apply(this, args);
      }
      return true;
  
    } else {
      return false;
    }
  };
  
  // EventEmitter is defined in src/node_events.cc
  // EventEmitter.prototype.emit() is also defined there.
  EventEmitter.prototype.addListener = function(type, listener) {
    if ('function' !== typeof listener) {
      throw new Error('addListener only takes instances of Function');
    }
  
    if (!this._events) this._events = {};
  
    // To avoid recursion in the case that type == "newListeners"! Before
    // adding it to the listeners, first emit "newListeners".
    this.emit('newListener', type, listener);
  
    if (!this._events[type]) {
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener;
    } else if (isArray(this._events[type])) {
  
      // If we've already got an array, just append.
      this._events[type].push(listener);
  
      // Check for listener leak
      if (!this._events[type].warned) {
        var m;
        if (this._events.maxListeners !== undefined) {
          m = this._events.maxListeners;
        } else {
          m = defaultMaxListeners;
        }
  
        if (m && m > 0 && this._events[type].length > m) {
          this._events[type].warned = true;
          console.error('(node) warning: possible EventEmitter memory ' +
                        'leak detected. %d listeners added. ' +
                        'Use emitter.setMaxListeners() to increase limit.',
                        this._events[type].length);
          console.trace();
        }
      }
    } else {
      // Adding the second element, need to change to array.
      this._events[type] = [this._events[type], listener];
    }
  
    return this;
  };
  
  EventEmitter.prototype.on = EventEmitter.prototype.addListener;
  
  EventEmitter.prototype.once = function(type, listener) {
    var self = this;
    function g() {
      self.removeListener(type, g);
      listener.apply(this, arguments);
    };
  
    g.listener = listener;
    self.on(type, g);
  
    return this;
  };
  
  EventEmitter.prototype.removeListener = function(type, listener) {
    if ('function' !== typeof listener) {
      throw new Error('removeListener only takes instances of Function');
    }
  
    // does not use listeners(), so no side effect of creating _events[type]
    if (!this._events || !this._events[type]) return this;
  
    var list = this._events[type];
  
    if (isArray(list)) {
      var position = -1;
      for (var i = 0, length = list.length; i < length; i++) {
        if (list[i] === listener ||
            (list[i].listener && list[i].listener === listener))
        {
          position = i;
          break;
        }
      }
  
      if (position < 0) return this;
      list.splice(position, 1);
      if (list.length == 0)
        delete this._events[type];
    } else if (list === listener ||
               (list.listener && list.listener === listener))
    {
      delete this._events[type];
    }
  
    return this;
  };
  
  EventEmitter.prototype.removeAllListeners = function(type) {
    // does not use listeners(), so no side effect of creating _events[type]
    if (type && this._events && this._events[type]) this._events[type] = null;
    return this;
  };
  
  EventEmitter.prototype.listeners = function(type) {
    if (!this._events) this._events = {};
    if (!this._events[type]) this._events[type] = [];
    if (!isArray(this._events[type])) {
      this._events[type] = [this._events[type]];
    }
    return this._events[type];
  };
  
  }());
  

  provide("events.node", module.exports);
  provide("events", module.exports);
  $.ender(module.exports);
}(global));

// ender:url as url
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
  (function () {
    "use strict";
  
  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.
  
  var punycode = require('punycode');
  
  exports.parse = urlParse;
  exports.resolve = urlResolve;
  exports.resolveObject = urlResolveObject;
  exports.format = urlFormat;
  
  // Reference: RFC 3986, RFC 1808, RFC 2396
  
  // define these here so at least they only have to be
  // compiled once on the first module load.
  var protocolPattern = /^([a-z0-9.+-]+:)/i,
      portPattern = /:[0-9]*$/,
  
      // RFC 2396: characters reserved for delimiting URLs.
      // We actually just auto-escape these.
      delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],
  
      // RFC 2396: characters not allowed for various reasons.
      unwise = ['{', '}', '|', '\\', '^', '~', '`'].concat(delims),
  
      // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
      autoEscape = ['\''].concat(delims),
      // Characters that are never ever allowed in a hostname.
      // Note that any invalid chars are also handled, but these
      // are the ones that are *expected* to be seen, so we fast-path
      // them.
      nonHostChars = ['%', '/', '?', ';', '#']
        .concat(unwise).concat(autoEscape),
      nonAuthChars = ['/', '@', '?', '#'].concat(delims),
      hostnameMaxLen = 255,
      hostnamePartPattern = /^[a-zA-Z0-9][a-z0-9A-Z_-]{0,62}$/,
      hostnamePartStart = /^([a-zA-Z0-9][a-z0-9A-Z_-]{0,62})(.*)$/,
      // protocols that can allow "unsafe" and "unwise" chars.
      unsafeProtocol = {
        'javascript': true,
        'javascript:': true
      },
      // protocols that never have a hostname.
      hostlessProtocol = {
        'javascript': true,
        'javascript:': true
      },
      // protocols that always have a path component.
      pathedProtocol = {
        'http': true,
        'https': true,
        'ftp': true,
        'gopher': true,
        'file': true,
        'http:': true,
        'ftp:': true,
        'gopher:': true,
        'file:': true
      },
      // protocols that always contain a // bit.
      slashedProtocol = {
        'http': true,
        'https': true,
        'ftp': true,
        'gopher': true,
        'file': true,
        'http:': true,
        'https:': true,
        'ftp:': true,
        'gopher:': true,
        'file:': true
      },
      querystring = require('querystring');
  
  function urlParse(url, parseQueryString, slashesDenoteHost) {
    if (url && typeof(url) === 'object' && url.href) return url;
  
    if (typeof url !== 'string') {
      throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
    }
  
    var out = {},
        rest = url;
  
    // trim before proceeding.
    // This is to support parse stuff like "  http://foo.com  \n"
    rest = rest.trim();
  
    var proto = protocolPattern.exec(rest);
    if (proto) {
      proto = proto[0];
      var lowerProto = proto.toLowerCase();
      out.protocol = lowerProto;
      rest = rest.substr(proto.length);
    }
  
    // figure out if it's got a host
    // user@server is *always* interpreted as a hostname, and url
    // resolution will treat //foo/bar as host=foo,path=bar because that's
    // how the browser resolves relative URLs.
    if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
      var slashes = rest.substr(0, 2) === '//';
      if (slashes && !(proto && hostlessProtocol[proto])) {
        rest = rest.substr(2);
        out.slashes = true;
      }
    }
  
    if (!hostlessProtocol[proto] &&
        (slashes || (proto && !slashedProtocol[proto]))) {
      // there's a hostname.
      // the first instance of /, ?, ;, or # ends the host.
      // don't enforce full RFC correctness, just be unstupid about it.
  
      // If there is an @ in the hostname, then non-host chars *are* allowed
      // to the left of the first @ sign, unless some non-auth character
      // comes *before* the @-sign.
      // URLs are obnoxious.
      var atSign = rest.indexOf('@');
      if (atSign !== -1) {
        var auth = rest.slice(0, atSign);
  
        // there *may be* an auth
        var hasAuth = true;
        for (var i = 0, l = nonAuthChars.length; i < l; i++) {
          if (auth.indexOf(nonAuthChars[i]) !== -1) {
            // not a valid auth.  Something like http://foo.com/bar@baz/
            hasAuth = false;
            break;
          }
        }
  
        if (hasAuth) {
          // pluck off the auth portion.
          out.auth = decodeURIComponent(auth);
          rest = rest.substr(atSign + 1);
        }
      }
  
      var firstNonHost = -1;
      for (var i = 0, l = nonHostChars.length; i < l; i++) {
        var index = rest.indexOf(nonHostChars[i]);
        if (index !== -1 &&
            (firstNonHost < 0 || index < firstNonHost)) firstNonHost = index;
      }
  
      if (firstNonHost !== -1) {
        out.host = rest.substr(0, firstNonHost);
        rest = rest.substr(firstNonHost);
      } else {
        out.host = rest;
        rest = '';
      }
  
      // pull out port.
      var p = parseHost(out.host);
      var keys = Object.keys(p);
      for (var i = 0, l = keys.length; i < l; i++) {
        var key = keys[i];
        out[key] = p[key];
      }
  
      // we've indicated that there is a hostname,
      // so even if it's empty, it has to be present.
      out.hostname = out.hostname || '';
  
      // if hostname begins with [ and ends with ]
      // assume that it's an IPv6 address.
      var ipv6Hostname = out.hostname[0] === '[' &&
          out.hostname[out.hostname.length - 1] === ']';
  
      // validate a little.
      if (out.hostname.length > hostnameMaxLen) {
        out.hostname = '';
      } else if (!ipv6Hostname) {
        var hostparts = out.hostname.split(/\./);
        for (var i = 0, l = hostparts.length; i < l; i++) {
          var part = hostparts[i];
          if (!part) continue;
          if (!part.match(hostnamePartPattern)) {
            var newpart = '';
            for (var j = 0, k = part.length; j < k; j++) {
              if (part.charCodeAt(j) > 127) {
                // we replace non-ASCII char with a temporary placeholder
                // we need this to make sure size of hostname is not
                // broken by replacing non-ASCII by nothing
                newpart += 'x';
              } else {
                newpart += part[j];
              }
            }
            // we test again with ASCII char only
            if (!newpart.match(hostnamePartPattern)) {
              var validParts = hostparts.slice(0, i);
              var notHost = hostparts.slice(i + 1);
              var bit = part.match(hostnamePartStart);
              if (bit) {
                validParts.push(bit[1]);
                notHost.unshift(bit[2]);
              }
              if (notHost.length) {
                rest = '/' + notHost.join('.') + rest;
              }
              out.hostname = validParts.join('.');
              break;
            }
          }
        }
      }
  
      // hostnames are always lower case.
      out.hostname = out.hostname.toLowerCase();
  
      if (!ipv6Hostname) {
        // IDNA Support: Returns a puny coded representation of "domain".
        // It only converts the part of the domain name that
        // has non ASCII characters. I.e. it dosent matter if
        // you call it with a domain that already is in ASCII.
        var domainArray = out.hostname.split('.');
        var newOut = [];
        for (var i = 0; i < domainArray.length; ++i) {
          var s = domainArray[i];
          newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
              'xn--' + punycode.encode(s) : s);
        }
        out.hostname = newOut.join('.');
      }
  
      out.host = (out.hostname || '') +
          ((out.port) ? ':' + out.port : '');
      out.href += out.host;
  
      // strip [ and ] from the hostname
      if (ipv6Hostname) {
        out.hostname = out.hostname.substr(1, out.hostname.length - 2);
        if (rest[0] !== '/') {
          rest = '/' + rest;
        }
      }
    }
  
    // now rest is set to the post-host stuff.
    // chop off any delim chars.
    if (!unsafeProtocol[lowerProto]) {
  
      // First, make 100% sure that any "autoEscape" chars get
      // escaped, even if encodeURIComponent doesn't think they
      // need to be.
      for (var i = 0, l = autoEscape.length; i < l; i++) {
        var ae = autoEscape[i];
        var esc = encodeURIComponent(ae);
        if (esc === ae) {
          esc = escape(ae);
        }
        rest = rest.split(ae).join(esc);
      }
    }
  
  
    // chop off from the tail first.
    var hash = rest.indexOf('#');
    if (hash !== -1) {
      // got a fragment string.
      out.hash = rest.substr(hash);
      rest = rest.slice(0, hash);
    }
    var qm = rest.indexOf('?');
    if (qm !== -1) {
      out.search = rest.substr(qm);
      out.query = rest.substr(qm + 1);
      if (parseQueryString) {
        out.query = querystring.parse(out.query);
      }
      rest = rest.slice(0, qm);
    } else if (parseQueryString) {
      // no query string, but parseQueryString still requested
      out.search = '';
      out.query = {};
    }
    if (rest) out.pathname = rest;
    if (slashedProtocol[proto] &&
        out.hostname && !out.pathname) {
      out.pathname = '/';
    }
  
    //to support http.request
    if (out.pathname || out.search) {
      out.path = (out.pathname ? out.pathname : '') +
                 (out.search ? out.search : '');
    }
  
    // finally, reconstruct the href based on what has been validated.
    out.href = urlFormat(out);
    return out;
  }
  
  // format a parsed object into a url string
  function urlFormat(obj) {
    // ensure it's an object, and not a string url.
    // If it's an obj, this is a no-op.
    // this way, you can call url_format() on strings
    // to clean up potentially wonky urls.
    if (typeof(obj) === 'string') obj = urlParse(obj);
  
    var auth = obj.auth || '';
    if (auth) {
      auth = encodeURIComponent(auth);
      auth = auth.replace(/%3A/i, ':');
      auth += '@';
    }
  
    var protocol = obj.protocol || '',
        pathname = obj.pathname || '',
        hash = obj.hash || '',
        host = false,
        query = '';
  
    if (obj.host !== undefined) {
      host = auth + obj.host;
    } else if (obj.hostname !== undefined) {
      host = auth + (obj.hostname.indexOf(':') === -1 ?
          obj.hostname :
          '[' + obj.hostname + ']');
      if (obj.port) {
        host += ':' + obj.port;
      }
    }
  
    if (obj.query && typeof obj.query === 'object' &&
        Object.keys(obj.query).length) {
      query = querystring.stringify(obj.query);
    }
  
    var search = obj.search || (query && ('?' + query)) || '';
  
    if (protocol && protocol.substr(-1) !== ':') protocol += ':';
  
    // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
    // unless they had them to begin with.
    if (obj.slashes ||
        (!protocol || slashedProtocol[protocol]) && host !== false) {
      host = '//' + (host || '');
      if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
    } else if (!host) {
      host = '';
    }
  
    if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
    if (search && search.charAt(0) !== '?') search = '?' + search;
  
    return protocol + host + pathname + search + hash;
  }
  
  function urlResolve(source, relative) {
    return urlFormat(urlResolveObject(source, relative));
  }
  
  function urlResolveObject(source, relative) {
    if (!source) return relative;
  
    source = urlParse(urlFormat(source), false, true);
    relative = urlParse(urlFormat(relative), false, true);
  
    // hash is always overridden, no matter what.
    source.hash = relative.hash;
  
    if (relative.href === '') {
      source.href = urlFormat(source);
      return source;
    }
  
    // hrefs like //foo/bar always cut to the protocol.
    if (relative.slashes && !relative.protocol) {
      relative.protocol = source.protocol;
      //urlParse appends trailing / to urls like http://www.example.com
      if (slashedProtocol[relative.protocol] &&
          relative.hostname && !relative.pathname) {
        relative.path = relative.pathname = '/';
      }
      relative.href = urlFormat(relative);
      return relative;
    }
  
    if (relative.protocol && relative.protocol !== source.protocol) {
      // if it's a known url protocol, then changing
      // the protocol does weird things
      // first, if it's not file:, then we MUST have a host,
      // and if there was a path
      // to begin with, then we MUST have a path.
      // if it is file:, then the host is dropped,
      // because that's known to be hostless.
      // anything else is assumed to be absolute.
      if (!slashedProtocol[relative.protocol]) {
        relative.href = urlFormat(relative);
        return relative;
      }
      source.protocol = relative.protocol;
      if (!relative.host && !hostlessProtocol[relative.protocol]) {
        var relPath = (relative.pathname || '').split('/');
        while (relPath.length && !(relative.host = relPath.shift()));
        if (!relative.host) relative.host = '';
        if (!relative.hostname) relative.hostname = '';
        if (relPath[0] !== '') relPath.unshift('');
        if (relPath.length < 2) relPath.unshift('');
        relative.pathname = relPath.join('/');
      }
      source.pathname = relative.pathname;
      source.search = relative.search;
      source.query = relative.query;
      source.host = relative.host || '';
      source.auth = relative.auth;
      source.hostname = relative.hostname || relative.host;
      source.port = relative.port;
      //to support http.request
      if (source.pathname !== undefined || source.search !== undefined) {
        source.path = (source.pathname ? source.pathname : '') +
                      (source.search ? source.search : '');
      }
      source.slashes = source.slashes || relative.slashes;
      source.href = urlFormat(source);
      return source;
    }
  
    var isSourceAbs = (source.pathname && source.pathname.charAt(0) === '/'),
        isRelAbs = (
            relative.host !== undefined ||
            relative.pathname && relative.pathname.charAt(0) === '/'
        ),
        mustEndAbs = (isRelAbs || isSourceAbs ||
                      (source.host && relative.pathname)),
        removeAllDots = mustEndAbs,
        srcPath = source.pathname && source.pathname.split('/') || [],
        relPath = relative.pathname && relative.pathname.split('/') || [],
        psychotic = source.protocol &&
            !slashedProtocol[source.protocol];
  
    // if the url is a non-slashed url, then relative
    // links like ../.. should be able
    // to crawl up to the hostname, as well.  This is strange.
    // source.protocol has already been set by now.
    // Later on, put the first path part into the host field.
    if (psychotic) {
  
      delete source.hostname;
      delete source.port;
      if (source.host) {
        if (srcPath[0] === '') srcPath[0] = source.host;
        else srcPath.unshift(source.host);
      }
      delete source.host;
      if (relative.protocol) {
        delete relative.hostname;
        delete relative.port;
        if (relative.host) {
          if (relPath[0] === '') relPath[0] = relative.host;
          else relPath.unshift(relative.host);
        }
        delete relative.host;
      }
      mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
    }
  
    if (isRelAbs) {
      // it's absolute.
      source.host = (relative.host || relative.host === '') ?
                        relative.host : source.host;
      source.hostname = (relative.hostname || relative.hostname === '') ?
                        relative.hostname : source.hostname;
      source.search = relative.search;
      source.query = relative.query;
      srcPath = relPath;
      // fall through to the dot-handling below.
    } else if (relPath.length) {
      // it's relative
      // throw away the existing file, and take the new path instead.
      if (!srcPath) srcPath = [];
      srcPath.pop();
      srcPath = srcPath.concat(relPath);
      source.search = relative.search;
      source.query = relative.query;
    } else if ('search' in relative) {
      // just pull out the search.
      // like href='?foo'.
      // Put this after the other two cases because it simplifies the booleans
      if (psychotic) {
        source.hostname = source.host = srcPath.shift();
        //occationaly the auth can get stuck only in host
        //this especialy happens in cases like
        //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
        var authInHost = source.host && source.host.indexOf('@') > 0 ?
                         source.host.split('@') : false;
        if (authInHost) {
          source.auth = authInHost.shift();
          source.host = source.hostname = authInHost.shift();
        }
      }
      source.search = relative.search;
      source.query = relative.query;
      //to support http.request
      if (source.pathname !== undefined || source.search !== undefined) {
        source.path = (source.pathname ? source.pathname : '') +
                      (source.search ? source.search : '');
      }
      source.href = urlFormat(source);
      return source;
    }
    if (!srcPath.length) {
      // no path at all.  easy.
      // we've already handled the other stuff above.
      delete source.pathname;
      //to support http.request
      if (!source.search) {
        source.path = '/' + source.search;
      } else {
        delete source.path;
      }
      source.href = urlFormat(source);
      return source;
    }
    // if a url ENDs in . or .., then it must get a trailing slash.
    // however, if it ends in anything else non-slashy,
    // then it must NOT get a trailing slash.
    var last = srcPath.slice(-1)[0];
    var hasTrailingSlash = (
        (source.host || relative.host) && (last === '.' || last === '..') ||
        last === '');
  
    // strip single dots, resolve double dots to parent dir
    // if the path tries to go above the root, `up` ends up > 0
    var up = 0;
    for (var i = srcPath.length; i >= 0; i--) {
      last = srcPath[i];
      if (last == '.') {
        srcPath.splice(i, 1);
      } else if (last === '..') {
        srcPath.splice(i, 1);
        up++;
      } else if (up) {
        srcPath.splice(i, 1);
        up--;
      }
    }
  
    // if the path is allowed to go above the root, restore leading ..s
    if (!mustEndAbs && !removeAllDots) {
      for (; up--; up) {
        srcPath.unshift('..');
      }
    }
  
    if (mustEndAbs && srcPath[0] !== '' &&
        (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
      srcPath.unshift('');
    }
  
    if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
      srcPath.push('');
    }
  
    var isAbsolute = srcPath[0] === '' ||
        (srcPath[0] && srcPath[0].charAt(0) === '/');
  
    // put the host back
    if (psychotic) {
      source.hostname = source.host = isAbsolute ? '' :
                                      srcPath.length ? srcPath.shift() : '';
      //occationaly the auth can get stuck only in host
      //this especialy happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = source.host && source.host.indexOf('@') > 0 ?
                       source.host.split('@') : false;
      if (authInHost) {
        source.auth = authInHost.shift();
        source.host = source.hostname = authInHost.shift();
      }
    }
  
    mustEndAbs = mustEndAbs || (source.host && srcPath.length);
  
    if (mustEndAbs && !isAbsolute) {
      srcPath.unshift('');
    }
  
    source.pathname = srcPath.join('/');
    //to support request.http
    if (source.pathname !== undefined || source.search !== undefined) {
      source.path = (source.pathname ? source.pathname : '') +
                    (source.search ? source.search : '');
    }
    source.auth = relative.auth || source.auth;
    source.slashes = source.slashes || relative.slashes;
    source.href = urlFormat(source);
    return source;
  }
  
  function parseHost(host) {
    var out = {};
    var port = portPattern.exec(host);
    if (port) {
      port = port[0];
      if (port !== ':') {
        out.port = port.substr(1);
      }
      host = host.substr(0, host.length - port.length);
    }
    if (host) out.hostname = host;
    return out;
  }
  
  }());
  

  provide("url", module.exports);
  provide("url", module.exports);
  $.ender(module.exports);
}(global));

// ender:join as join
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true*/
  (function () {
    "use strict";
  
    var Future = require('future');
  
    function isJoin(obj) {
      return obj instanceof Join;
    }
  
    function Join(global_context) {
      var self = this
        , data = []
        , ready = []
        , subs = []
        , promise_only = false
        , begun = false
        , updated = 0
        , join_future = Future.create(global_context)
        ;
  
      global_context = global_context || null;
  
      if (!isJoin(this)) {
        return new Join(global_context);
      }
  
      function relay() {
        var i;
        if (!begun || updated !== data.length) {
          return;
        }
        updated = 0;
        join_future.deliver.apply(join_future, data);
        data = new Array(data.length);
        ready = new Array(ready.length);
        //for (i = 0; i < data.length; i += 1) {
        //  data[i] = undefined;
        //}
      }
  
      function init() {
        var type = (promise_only ? "when" : "whenever");
  
        begun = true;
        data = new Array(subs.length);
        ready = new Array(ready.length);
  
        subs.forEach(function (sub, id) {
          sub[type](function () {
            var args = Array.prototype.slice.call(arguments);
            data[id] = args;
            if (!ready[id]) {
              ready[id] = true;
              updated += 1;
            }
            relay();
          });
        });
      }
  
      self.deliverer = function () {
        var future = Future.create();
        self.add(future);
        return future.deliver;
      };
      self.newCallback = self.deliverer;
  
      // fn, ctx
      self.when = function () {
        if (!begun) {
          init();
        }
        join_future.when.apply(join_future, arguments);
      };
  
      // fn, ctx
      self.whenever = function () {
        if (!begun) {
          init();
        }
        join_future.whenever.apply(join_future, arguments);
      };
  
      self.add = function () {
        if (begun) {
          throw new Error("`Join().add(Array<future> | subs1, [subs2, ...])` requires that all additions be completed before the first `when()` or `whenever()`");
        }
        var args = Array.prototype.slice.call(arguments);
        if (0 === args.length) {
          return self.newCallback();
        }
        args = Array.isArray(args[0]) ? args[0] : args;
        args.forEach(function (sub) {
          if (!sub.whenever) {
            promise_only = true;
          }
          if (!sub.when) {
            throw new Error("`Join().add(future)` requires either a promise or future");
          }
          subs.push(sub);
        });
      };
    }
  
    function createJoin(context) {
      // TODO use prototype instead of new
      return (new Join(context));
    }
  
    Join.create = createJoin;
    Join.isJoin = isJoin;
    module.exports = Join;
  }());
  

  provide("join", module.exports);
  provide("join", module.exports);
  $.ender(module.exports);
}(global));

// ender:domready as domready
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*!
    * domready (c) Dustin Diaz 2012 - License MIT
    */
  !function (name, definition) {
    if (typeof module != 'undefined') module.exports = definition()
    else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
    else this[name] = definition()
  }('domready', function (ready) {
  
    var fns = [], fn, f = false
      , doc = document
      , testEl = doc.documentElement
      , hack = testEl.doScroll
      , domContentLoaded = 'DOMContentLoaded'
      , addEventListener = 'addEventListener'
      , onreadystatechange = 'onreadystatechange'
      , readyState = 'readyState'
      , loaded = /^loade|c/.test(doc[readyState])
  
    function flush(f) {
      loaded = 1
      while (f = fns.shift()) f()
    }
  
    doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {
      doc.removeEventListener(domContentLoaded, fn, f)
      flush()
    }, f)
  
  
    hack && doc.attachEvent(onreadystatechange, fn = function () {
      if (/^c/.test(doc[readyState])) {
        doc.detachEvent(onreadystatechange, fn)
        flush()
      }
    })
  
    return (ready = hack ?
      function (fn) {
        self != top ?
          loaded ? fn() : fns.push(fn) :
          function () {
            try {
              testEl.doScroll('left')
            } catch (e) {
              return setTimeout(function() { ready(fn) }, 50)
            }
            fn()
          }()
      } :
      function (fn) {
        loaded ? fn() : fns.push(fn)
      })
  })

  provide("domready", module.exports);
  provide("domready", module.exports);
  $.ender(module.exports);
}(global));

// ender:domready/ender-bridge as domready/ender-bridge
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  !function ($) {
    var ready =  require('domready')
    $.ender({domReady: ready})
    $.ender({
      ready: function (f) {
        ready(f)
        return this
      }
    }, true)
  }(ender);

  provide("domready/ender-bridge", module.exports);
  provide("domready/ender-bridge", module.exports);
  $.ender(module.exports);
}(global));


// ender:qwery/ender-bridge as qwery/ender-bridge
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function ($) {
    var q = function () {
      var r
      try {
        r =  require('qwery')
      } catch (ex) {
        r = require('qwery-mobile')
      } finally {
        return r
      }
    }()
  
    $.pseudos = q.pseudos
  
    $._select = function (s, r) {
      // detect if sibling module 'bonzo' is available at run-time
      // rather than load-time since technically it's not a dependency and
      // can be loaded in any order
      // hence the lazy function re-definition
      return ($._select = (function () {
        var b
        if (typeof $.create == 'function') return function (s, r) {
          return /^\s*</.test(s) ? $.create(s, r) : q(s, r)
        }
        try {
          b = require('bonzo')
          return function (s, r) {
            return /^\s*</.test(s) ? b.create(s, r) : q(s, r)
          }
        } catch (e) { }
        return q
      })())(s, r)
    }
  
    $.ender({
        find: function (s) {
          var r = [], i, l, j, k, els
          for (i = 0, l = this.length; i < l; i++) {
            els = q(s, this[i])
            for (j = 0, k = els.length; j < k; j++) r.push(els[j])
          }
          return $(q.uniq(r))
        }
      , and: function (s) {
          var plus = $(s)
          for (var i = this.length, j = 0, l = this.length + plus.length; i < l; i++, j++) {
            this[i] = plus[j]
          }
          this.length += plus.length
          return this
        }
      , is: function(s, r) {
          var i, l
          for (i = 0, l = this.length; i < l; i++) {
            if (q.is(this[i], s, r)) {
              return true
            }
          }
          return false
        }
    }, true)
  }(ender));
  

  provide("qwery/ender-bridge", module.exports);
  provide("qwery/ender-bridge", module.exports);
  $.ender(module.exports);
}(global));

// ender:bonzo as bonzo
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*!
    * Bonzo: DOM Utility (c) Dustin Diaz 2012
    * https://github.com/ded/bonzo
    * License MIT
    */
  (function (name, definition, context) {
    if (typeof module != 'undefined' && module.exports) module.exports = definition()
    else if (typeof context['define'] == 'function' && context['define']['amd']) define(name, definition)
    else context[name] = definition()
  })('bonzo', function() {
    var win = window
      , doc = win.document
      , html = doc.documentElement
      , parentNode = 'parentNode'
      , query = null // used for setting a selector engine host
      , specialAttributes = /^(checked|value|selected|disabled)$/i
      , specialTags = /^(select|fieldset|table|tbody|tfoot|td|tr|colgroup)$/i // tags that we have trouble inserting *into*
      , table = ['<table>', '</table>', 1]
      , td = ['<table><tbody><tr>', '</tr></tbody></table>', 3]
      , option = ['<select>', '</select>', 1]
      , noscope = ['_', '', 0, 1]
      , tagMap = { // tags that we have trouble *inserting*
            thead: table, tbody: table, tfoot: table, colgroup: table, caption: table
          , tr: ['<table><tbody>', '</tbody></table>', 2]
          , th: td , td: td
          , col: ['<table><colgroup>', '</colgroup></table>', 2]
          , fieldset: ['<form>', '</form>', 1]
          , legend: ['<form><fieldset>', '</fieldset></form>', 2]
          , option: option, optgroup: option
          , script: noscope, style: noscope, link: noscope, param: noscope, base: noscope
        }
      , stateAttributes = /^(checked|selected|disabled)$/
      , ie = /msie/i.test(navigator.userAgent)
      , hasClass, addClass, removeClass
      , uidMap = {}
      , uuids = 0
      , digit = /^-?[\d\.]+$/
      , dattr = /^data-(.+)$/
      , px = 'px'
      , setAttribute = 'setAttribute'
      , getAttribute = 'getAttribute'
      , byTag = 'getElementsByTagName'
      , features = function() {
          var e = doc.createElement('p')
          e.innerHTML = '<a href="#x">x</a><table style="float:left;"></table>'
          return {
            hrefExtended: e[byTag]('a')[0][getAttribute]('href') != '#x' // IE < 8
          , autoTbody: e[byTag]('tbody').length !== 0 // IE < 8
          , computedStyle: doc.defaultView && doc.defaultView.getComputedStyle
          , cssFloat: e[byTag]('table')[0].style.styleFloat ? 'styleFloat' : 'cssFloat'
          , transform: function () {
              var props = ['webkitTransform', 'MozTransform', 'OTransform', 'msTransform', 'Transform'], i
              for (i = 0; i < props.length; i++) {
                if (props[i] in e.style) return props[i]
              }
            }()
          , classList: 'classList' in e
          , opasity: function () {
              return typeof doc.createElement('a').style.opacity !== 'undefined'
            }()
          }
        }()
      , trimReplace = /(^\s*|\s*$)/g
      , whitespaceRegex = /\s+/
      , toString = String.prototype.toString
      , unitless = { lineHeight: 1, zoom: 1, zIndex: 1, opacity: 1, boxFlex: 1, WebkitBoxFlex: 1, MozBoxFlex: 1 }
      , trim = String.prototype.trim ?
          function (s) {
            return s.trim()
          } :
          function (s) {
            return s.replace(trimReplace, '')
          }
  
  
    /**
     * @param {string} c a class name to test
     * @return {boolean}
     */
    function classReg(c) {
      return new RegExp("(^|\\s+)" + c + "(\\s+|$)")
    }
  
  
    /**
     * @param {Bonzo|Array} ar
     * @param {function(Object, number, (Bonzo|Array))} fn
     * @param {Object=} opt_scope
     * @param {boolean=} opt_rev
     * @return {Bonzo|Array}
     */
    function each(ar, fn, opt_scope, opt_rev) {
      var ind, i = 0, l = ar.length
      for (; i < l; i++) {
        ind = opt_rev ? ar.length - i - 1 : i
        fn.call(opt_scope || ar[ind], ar[ind], ind, ar)
      }
      return ar
    }
  
  
    /**
     * @param {Bonzo|Array} ar
     * @param {function(Object, number, (Bonzo|Array))} fn
     * @param {Object=} opt_scope
     * @return {Bonzo|Array}
     */
    function deepEach(ar, fn, opt_scope) {
      for (var i = 0, l = ar.length; i < l; i++) {
        if (isNode(ar[i])) {
          deepEach(ar[i].childNodes, fn, opt_scope)
          fn.call(opt_scope || ar[i], ar[i], i, ar)
        }
      }
      return ar
    }
  
  
    /**
     * @param {string} s
     * @return {string}
     */
    function camelize(s) {
      return s.replace(/-(.)/g, function (m, m1) {
        return m1.toUpperCase()
      })
    }
  
  
    /**
     * @param {string} s
     * @return {string}
     */
    function decamelize(s) {
      return s ? s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() : s
    }
  
  
    /**
     * @param {Element} el
     * @return {*}
     */
    function data(el) {
      el[getAttribute]('data-node-uid') || el[setAttribute]('data-node-uid', ++uuids)
      var uid = el[getAttribute]('data-node-uid')
      return uidMap[uid] || (uidMap[uid] = {})
    }
  
  
    /**
     * removes the data associated with an element
     * @param {Element} el
     */
    function clearData(el) {
      var uid = el[getAttribute]('data-node-uid')
      if (uid) delete uidMap[uid]
    }
  
  
    function dataValue(d) {
      var f
      try {
        return (d === null || d === undefined) ? undefined :
          d === 'true' ? true :
            d === 'false' ? false :
              d === 'null' ? null :
                (f = parseFloat(d)) == d ? f : d;
      } catch(e) {}
      return undefined
    }
  
    function isNode(node) {
      return node && node.nodeName && (node.nodeType == 1 || node.nodeType == 11)
    }
  
  
    /**
     * @param {Bonzo|Array} ar
     * @param {function(Object, number, (Bonzo|Array))} fn
     * @param {Object=} opt_scope
     * @return {boolean} whether `some`thing was found
     */
    function some(ar, fn, opt_scope) {
      for (var i = 0, j = ar.length; i < j; ++i) if (fn.call(opt_scope || null, ar[i], i, ar)) return true
      return false
    }
  
  
    /**
     * this could be a giant enum of CSS properties
     * but in favor of file size sans-closure deadcode optimizations
     * we're just asking for any ol string
     * then it gets transformed into the appropriate style property for JS access
     * @param {string} p
     * @return {string}
     */
    function styleProperty(p) {
        (p == 'transform' && (p = features.transform)) ||
          (/^transform-?[Oo]rigin$/.test(p) && (p = features.transform + "Origin")) ||
          (p == 'float' && (p = features.cssFloat))
        return p ? camelize(p) : null
    }
  
    var getStyle = features.computedStyle ?
      function (el, property) {
        var value = null
          , computed = doc.defaultView.getComputedStyle(el, '')
        computed && (value = computed[property])
        return el.style[property] || value
      } :
  
      (ie && html.currentStyle) ?
  
      /**
       * @param {Element} el
       * @param {string} property
       * @return {string|number}
       */
      function (el, property) {
        if (property == 'opacity' && !features.opasity) {
          var val = 100
          try {
            val = el['filters']['DXImageTransform.Microsoft.Alpha'].opacity
          } catch (e1) {
            try {
              val = el['filters']('alpha').opacity
            } catch (e2) {}
          }
          return val / 100
        }
        var value = el.currentStyle ? el.currentStyle[property] : null
        return el.style[property] || value
      } :
  
      function (el, property) {
        return el.style[property]
      }
  
    // this insert method is intense
    function insert(target, host, fn, rev) {
      var i = 0, self = host || this, r = []
        // target nodes could be a css selector if it's a string and a selector engine is present
        // otherwise, just use target
        , nodes = query && typeof target == 'string' && target.charAt(0) != '<' ? query(target) : target
      // normalize each node in case it's still a string and we need to create nodes on the fly
      each(normalize(nodes), function (t, j) {
        each(self, function (el) {
          fn(t, r[i++] = j > 0 ? cloneNode(self, el) : el)
        }, null, rev)
      }, this, rev)
      self.length = i
      each(r, function (e) {
        self[--i] = e
      }, null, !rev)
      return self
    }
  
  
    /**
     * sets an element to an explicit x/y position on the page
     * @param {Element} el
     * @param {?number} x
     * @param {?number} y
     */
    function xy(el, x, y) {
      var $el = bonzo(el)
        , style = $el.css('position')
        , offset = $el.offset()
        , rel = 'relative'
        , isRel = style == rel
        , delta = [parseInt($el.css('left'), 10), parseInt($el.css('top'), 10)]
  
      if (style == 'static') {
        $el.css('position', rel)
        style = rel
      }
  
      isNaN(delta[0]) && (delta[0] = isRel ? 0 : el.offsetLeft)
      isNaN(delta[1]) && (delta[1] = isRel ? 0 : el.offsetTop)
  
      x != null && (el.style.left = x - offset.left + delta[0] + px)
      y != null && (el.style.top = y - offset.top + delta[1] + px)
  
    }
  
    // classList support for class management
    // altho to be fair, the api sucks because it won't accept multiple classes at once
    if (features.classList) {
      hasClass = function (el, c) {
        return el.classList.contains(c)
      }
      addClass = function (el, c) {
        el.classList.add(c)
      }
      removeClass = function (el, c) {
        el.classList.remove(c)
      }
    }
    else {
      hasClass = function (el, c) {
        return classReg(c).test(el.className)
      }
      addClass = function (el, c) {
        el.className = trim(el.className + ' ' + c)
      }
      removeClass = function (el, c) {
        el.className = trim(el.className.replace(classReg(c), ' '))
      }
    }
  
  
    /**
     * this allows method calling for setting values
     *
     * @example
     * bonzo(elements).css('color', function (el) {
     *   return el.getAttribute('data-original-color')
     * })
     *
     * @param {Element} el
     * @param {function (Element)|string}
     * @return {string}
     */
    function setter(el, v) {
      return typeof v == 'function' ? v(el) : v
    }
  
    /**
     * @constructor
     * @param {Array.<Element>|Element|Node|string} elements
     */
    function Bonzo(elements) {
      this.length = 0
      if (elements) {
        elements = typeof elements !== 'string' &&
          !elements.nodeType &&
          typeof elements.length !== 'undefined' ?
            elements :
            [elements]
        this.length = elements.length
        for (var i = 0; i < elements.length; i++) this[i] = elements[i]
      }
    }
  
    Bonzo.prototype = {
  
        /**
         * @param {number} index
         * @return {Element|Node}
         */
        get: function (index) {
          return this[index] || null
        }
  
        // itetators
        /**
         * @param {function(Element|Node)} fn
         * @param {Object=} opt_scope
         * @return {Bonzo}
         */
      , each: function (fn, opt_scope) {
          return each(this, fn, opt_scope)
        }
  
        /**
         * @param {Function} fn
         * @param {Object=} opt_scope
         * @return {Bonzo}
         */
      , deepEach: function (fn, opt_scope) {
          return deepEach(this, fn, opt_scope)
        }
  
  
        /**
         * @param {Function} fn
         * @param {Function=} opt_reject
         * @return {Array}
         */
      , map: function (fn, opt_reject) {
          var m = [], n, i
          for (i = 0; i < this.length; i++) {
            n = fn.call(this, this[i], i)
            opt_reject ? (opt_reject(n) && m.push(n)) : m.push(n)
          }
          return m
        }
  
      // text and html inserters!
  
      /**
       * @param {string} h the HTML to insert
       * @param {boolean=} opt_text whether to set or get text content
       * @return {Bonzo|string}
       */
      , html: function (h, opt_text) {
          var method = opt_text
                ? html.textContent === undefined ? 'innerText' : 'textContent'
                : 'innerHTML'
            , that = this
            , append = function (el, i) {
                each(normalize(h, that, i), function (node) {
                  el.appendChild(node)
                })
              }
            , updateElement = function (el, i) {
                try {
                  if (opt_text || (typeof h == 'string' && !specialTags.test(el.tagName))) {
                    return el[method] = h
                  }
                } catch (e) {}
                append(el, i)
              }
          return typeof h != 'undefined'
            ? this.empty().each(updateElement)
            : this[0] ? this[0][method] : ''
        }
  
        /**
         * @param {string=} opt_text the text to set, otherwise this is a getter
         * @return {Bonzo|string}
         */
      , text: function (opt_text) {
          return this.html(opt_text, true)
        }
  
        // more related insertion methods
  
        /**
         * @param {Bonzo|string|Element|Array} node
         * @return {Bonzo}
         */
      , append: function (node) {
          var that = this
          return this.each(function (el, i) {
            each(normalize(node, that, i), function (i) {
              el.appendChild(i)
            })
          })
        }
  
  
        /**
         * @param {Bonzo|string|Element|Array} node
         * @return {Bonzo}
         */
      , prepend: function (node) {
          var that = this
          return this.each(function (el, i) {
            var first = el.firstChild
            each(normalize(node, that, i), function (i) {
              el.insertBefore(i, first)
            })
          })
        }
  
  
        /**
         * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
         * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
         * @return {Bonzo}
         */
      , appendTo: function (target, opt_host) {
          return insert.call(this, target, opt_host, function (t, el) {
            t.appendChild(el)
          })
        }
  
  
        /**
         * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
         * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
         * @return {Bonzo}
         */
      , prependTo: function (target, opt_host) {
          return insert.call(this, target, opt_host, function (t, el) {
            t.insertBefore(el, t.firstChild)
          }, 1)
        }
  
  
        /**
         * @param {Bonzo|string|Element|Array} node
         * @return {Bonzo}
         */
      , before: function (node) {
          var that = this
          return this.each(function (el, i) {
            each(normalize(node, that, i), function (i) {
              el[parentNode].insertBefore(i, el)
            })
          })
        }
  
  
        /**
         * @param {Bonzo|string|Element|Array} node
         * @return {Bonzo}
         */
      , after: function (node) {
          var that = this
          return this.each(function (el, i) {
            each(normalize(node, that, i), function (i) {
              el[parentNode].insertBefore(i, el.nextSibling)
            }, null, 1)
          })
        }
  
  
        /**
         * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
         * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
         * @return {Bonzo}
         */
      , insertBefore: function (target, opt_host) {
          return insert.call(this, target, opt_host, function (t, el) {
            t[parentNode].insertBefore(el, t)
          })
        }
  
  
        /**
         * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
         * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
         * @return {Bonzo}
         */
      , insertAfter: function (target, opt_host) {
          return insert.call(this, target, opt_host, function (t, el) {
            var sibling = t.nextSibling
            sibling ?
              t[parentNode].insertBefore(el, sibling) :
              t[parentNode].appendChild(el)
          }, 1)
        }
  
  
        /**
         * @param {Bonzo|string|Element|Array} node
         * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
         * @return {Bonzo}
         */
      , replaceWith: function (node, opt_host) {
          var ret = bonzo(normalize(node)).insertAfter(this, opt_host)
          this.remove()
          Bonzo.call(opt_host || this, ret)
          return opt_host || this
        }
  
        // class management
  
        /**
         * @param {string} c
         * @return {Bonzo}
         */
      , addClass: function (c) {
          c = toString.call(c).split(whitespaceRegex)
          return this.each(function (el) {
            // we `each` here so you can do $el.addClass('foo bar')
            each(c, function (c) {
              if (c && !hasClass(el, setter(el, c)))
                addClass(el, setter(el, c))
            })
          })
        }
  
  
        /**
         * @param {string} c
         * @return {Bonzo}
         */
      , removeClass: function (c) {
          c = toString.call(c).split(whitespaceRegex)
          return this.each(function (el) {
            each(c, function (c) {
              if (c && hasClass(el, setter(el, c)))
                removeClass(el, setter(el, c))
            })
          })
        }
  
  
        /**
         * @param {string} c
         * @return {boolean}
         */
      , hasClass: function (c) {
          c = toString.call(c).split(whitespaceRegex)
          return some(this, function (el) {
            return some(c, function (c) {
              return c && hasClass(el, c)
            })
          })
        }
  
  
        /**
         * @param {string} c classname to toggle
         * @param {boolean=} opt_condition whether to add or remove the class straight away
         * @return {Bonzo}
         */
      , toggleClass: function (c, opt_condition) {
          c = toString.call(c).split(whitespaceRegex)
          return this.each(function (el) {
            each(c, function (c) {
              if (c) {
                typeof opt_condition !== 'undefined' ?
                  opt_condition ? addClass(el, c) : removeClass(el, c) :
                  hasClass(el, c) ? removeClass(el, c) : addClass(el, c)
              }
            })
          })
        }
  
        // display togglers
  
        /**
         * @param {string=} opt_type useful to set back to anything other than an empty string
         * @return {Bonzo}
         */
      , show: function (opt_type) {
          opt_type = typeof opt_type == 'string' ? opt_type : ''
          return this.each(function (el) {
            el.style.display = opt_type
          })
        }
  
  
        /**
         * @return {Bonzo}
         */
      , hide: function () {
          return this.each(function (el) {
            el.style.display = 'none'
          })
        }
  
  
        /**
         * @param {Function=} opt_callback
         * @param {string=} opt_type
         * @return {Bonzo}
         */
      , toggle: function (opt_callback, opt_type) {
          opt_type = typeof opt_type == 'string' ? opt_type : '';
          typeof opt_callback != 'function' && (opt_callback = null)
          return this.each(function (el) {
            el.style.display = (el.offsetWidth || el.offsetHeight) ? 'none' : opt_type;
            opt_callback && opt_callback.call(el)
          })
        }
  
  
        // DOM Walkers & getters
  
        /**
         * @return {Element|Node}
         */
      , first: function () {
          return bonzo(this.length ? this[0] : [])
        }
  
  
        /**
         * @return {Element|Node}
         */
      , last: function () {
          return bonzo(this.length ? this[this.length - 1] : [])
        }
  
  
        /**
         * @return {Element|Node}
         */
      , next: function () {
          return this.related('nextSibling')
        }
  
  
        /**
         * @return {Element|Node}
         */
      , previous: function () {
          return this.related('previousSibling')
        }
  
  
        /**
         * @return {Element|Node}
         */
      , parent: function() {
          return this.related(parentNode)
        }
  
  
        /**
         * @private
         * @param {string} method the directional DOM method
         * @return {Element|Node}
         */
      , related: function (method) {
          return this.map(
            function (el) {
              el = el[method]
              while (el && el.nodeType !== 1) {
                el = el[method]
              }
              return el || 0
            },
            function (el) {
              return el
            }
          )
        }
  
  
        /**
         * @return {Bonzo}
         */
      , focus: function () {
          this.length && this[0].focus()
          return this
        }
  
  
        /**
         * @return {Bonzo}
         */
      , blur: function () {
          this.length && this[0].blur()
          return this
        }
  
        // style getter setter & related methods
  
        /**
         * @param {Object|string} o
         * @param {string=} opt_v
         * @return {Bonzo|string}
         */
      , css: function (o, opt_v) {
          var p, iter = o
          // is this a request for just getting a style?
          if (opt_v === undefined && typeof o == 'string') {
            // repurpose 'v'
            opt_v = this[0]
            if (!opt_v) return null
            if (opt_v === doc || opt_v === win) {
              p = (opt_v === doc) ? bonzo.doc() : bonzo.viewport()
              return o == 'width' ? p.width : o == 'height' ? p.height : ''
            }
            return (o = styleProperty(o)) ? getStyle(opt_v, o) : null
          }
  
          if (typeof o == 'string') {
            iter = {}
            iter[o] = opt_v
          }
  
          if (ie && iter.opacity) {
            // oh this 'ol gamut
            iter.filter = 'alpha(opacity=' + (iter.opacity * 100) + ')'
            // give it layout
            iter.zoom = o.zoom || 1;
            delete iter.opacity;
          }
  
          function fn(el, p, v) {
            for (var k in iter) {
              if (iter.hasOwnProperty(k)) {
                v = iter[k];
                // change "5" to "5px" - unless you're line-height, which is allowed
                (p = styleProperty(k)) && digit.test(v) && !(p in unitless) && (v += px)
                try { el.style[p] = setter(el, v) } catch(e) {}
              }
            }
          }
          return this.each(fn)
        }
  
  
        /**
         * @param {number=} opt_x
         * @param {number=} opt_y
         * @return {Bonzo|number}
         */
      , offset: function (opt_x, opt_y) {
          if (typeof opt_x == 'number' || typeof opt_y == 'number') {
            return this.each(function (el) {
              xy(el, opt_x, opt_y)
            })
          }
          if (!this[0]) return {
              top: 0
            , left: 0
            , height: 0
            , width: 0
          }
          var el = this[0]
            , width = el.offsetWidth
            , height = el.offsetHeight
            , top = el.offsetTop
            , left = el.offsetLeft
          while (el = el.offsetParent) {
            top = top + el.offsetTop
            left = left + el.offsetLeft
  
            if (el != doc.body) {
              top -= el.scrollTop
              left -= el.scrollLeft
            }
          }
  
          return {
              top: top
            , left: left
            , height: height
            , width: width
          }
        }
  
  
        /**
         * @return {number}
         */
      , dim: function () {
          if (!this.length) return { height: 0, width: 0 }
          var el = this[0]
            , orig = !el.offsetWidth && !el.offsetHeight ?
               // el isn't visible, can't be measured properly, so fix that
               function (t) {
                 var s = {
                     position: el.style.position || ''
                   , visibility: el.style.visibility || ''
                   , display: el.style.display || ''
                 }
                 t.first().css({
                     position: 'absolute'
                   , visibility: 'hidden'
                   , display: 'block'
                 })
                 return s
              }(this) : null
            , width = el.offsetWidth
            , height = el.offsetHeight
  
          orig && this.first().css(orig)
          return {
              height: height
            , width: width
          }
        }
  
        // attributes are hard. go shopping
  
        /**
         * @param {string} k an attribute to get or set
         * @param {string=} opt_v the value to set
         * @return {Bonzo|string}
         */
      , attr: function (k, opt_v) {
          var el = this[0]
          if (typeof k != 'string' && !(k instanceof String)) {
            for (var n in k) {
              k.hasOwnProperty(n) && this.attr(n, k[n])
            }
            return this
          }
          return typeof opt_v == 'undefined' ?
            !el ? null : specialAttributes.test(k) ?
              stateAttributes.test(k) && typeof el[k] == 'string' ?
                true : el[k] : (k == 'href' || k =='src') && features.hrefExtended ?
                  el[getAttribute](k, 2) : el[getAttribute](k) :
            this.each(function (el) {
              specialAttributes.test(k) ? (el[k] = setter(el, opt_v)) : el[setAttribute](k, setter(el, opt_v))
            })
        }
  
  
        /**
         * @param {string} k
         * @return {Bonzo}
         */
      , removeAttr: function (k) {
          return this.each(function (el) {
            stateAttributes.test(k) ? (el[k] = false) : el.removeAttribute(k)
          })
        }
  
  
        /**
         * @param {string=} opt_s
         * @return {Bonzo|string}
         */
      , val: function (s) {
          return (typeof s == 'string') ?
            this.attr('value', s) :
            this.length ? this[0].value : null
        }
  
        // use with care and knowledge. this data() method uses data attributes on the DOM nodes
        // to do this differently costs a lot more code. c'est la vie
        /**
         * @param {string|Object=} opt_k the key for which to get or set data
         * @param {Object=} opt_v
         * @return {Bonzo|Object}
         */
      , data: function (opt_k, opt_v) {
          var el = this[0], o, m
          if (typeof opt_v === 'undefined') {
            if (!el) return null
            o = data(el)
            if (typeof opt_k === 'undefined') {
              each(el.attributes, function (a) {
                (m = ('' + a.name).match(dattr)) && (o[camelize(m[1])] = dataValue(a.value))
              })
              return o
            } else {
              if (typeof o[opt_k] === 'undefined')
                o[opt_k] = dataValue(this.attr('data-' + decamelize(opt_k)))
              return o[opt_k]
            }
          } else {
            return this.each(function (el) { data(el)[opt_k] = opt_v })
          }
        }
  
        // DOM detachment & related
  
        /**
         * @return {Bonzo}
         */
      , remove: function () {
          this.deepEach(clearData)
  
          return this.each(function (el) {
            el[parentNode] && el[parentNode].removeChild(el)
          })
        }
  
  
        /**
         * @return {Bonzo}
         */
      , empty: function () {
          return this.each(function (el) {
            deepEach(el.childNodes, clearData)
  
            while (el.firstChild) {
              el.removeChild(el.firstChild)
            }
          })
        }
  
  
        /**
         * @return {Bonzo}
         */
      , detach: function () {
          return this.each(function (el) {
            el[parentNode].removeChild(el)
          })
        }
  
        // who uses a mouse anyway? oh right.
  
        /**
         * @param {number} y
         */
      , scrollTop: function (y) {
          return scroll.call(this, null, y, 'y')
        }
  
  
        /**
         * @param {number} x
         */
      , scrollLeft: function (x) {
          return scroll.call(this, x, null, 'x')
        }
  
    }
  
    function normalize(node, host, clone) {
      var i, l, ret
      if (typeof node == 'string') return bonzo.create(node)
      if (isNode(node)) node = [ node ]
      if (clone) {
        ret = [] // don't change original array
        for (i = 0, l = node.length; i < l; i++) ret[i] = cloneNode(host, node[i])
        return ret
      }
      return node
    }
  
    function cloneNode(host, el) {
      var c = el.cloneNode(true)
        , cloneElems
        , elElems
  
      // check for existence of an event cloner
      // preferably https://github.com/fat/bean
      // otherwise Bonzo won't do this for you
      if (host.$ && typeof host.cloneEvents == 'function') {
        host.$(c).cloneEvents(el)
  
        // clone events from every child node
        cloneElems = host.$(c).find('*')
        elElems = host.$(el).find('*')
  
        for (var i = 0; i < elElems.length; i++)
          host.$(cloneElems[i]).cloneEvents(elElems[i])
      }
      return c
    }
  
    function scroll(x, y, type) {
      var el = this[0]
      if (!el) return this
      if (x == null && y == null) {
        return (isBody(el) ? getWindowScroll() : { x: el.scrollLeft, y: el.scrollTop })[type]
      }
      if (isBody(el)) {
        win.scrollTo(x, y)
      } else {
        x != null && (el.scrollLeft = x)
        y != null && (el.scrollTop = y)
      }
      return this
    }
  
    function isBody(element) {
      return element === win || (/^(?:body|html)$/i).test(element.tagName)
    }
  
    function getWindowScroll() {
      return { x: win.pageXOffset || html.scrollLeft, y: win.pageYOffset || html.scrollTop }
    }
  
    /**
     * @param {Array.<Element>|Element|Node|string} els
     * @return {Bonzo}
     */
    function bonzo(els) {
      return new Bonzo(els)
    }
  
    bonzo.setQueryEngine = function (q) {
      query = q;
      delete bonzo.setQueryEngine
    }
  
    bonzo.aug = function (o, target) {
      // for those standalone bonzo users. this love is for you.
      for (var k in o) {
        o.hasOwnProperty(k) && ((target || Bonzo.prototype)[k] = o[k])
      }
    }
  
    bonzo.create = function (node) {
      // hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
      return typeof node == 'string' && node !== '' ?
        function () {
          var tag = /^\s*<([^\s>]+)/.exec(node)
            , el = doc.createElement('div')
            , els = []
            , p = tag ? tagMap[tag[1].toLowerCase()] : null
            , dep = p ? p[2] + 1 : 1
            , ns = p && p[3]
            , pn = parentNode
            , tb = features.autoTbody && p && p[0] == '<table>' && !(/<tbody/i).test(node)
  
          el.innerHTML = p ? (p[0] + node + p[1]) : node
          while (dep--) el = el.firstChild
          // for IE NoScope, we may insert cruft at the begining just to get it to work
          if (ns && el && el.nodeType !== 1) el = el.nextSibling
          do {
            // tbody special case for IE<8, creates tbody on any empty table
            // we don't want it if we're just after a <thead>, <caption>, etc.
            if ((!tag || el.nodeType == 1) && (!tb || el.tagName.toLowerCase() != 'tbody')) {
              els.push(el)
            }
          } while (el = el.nextSibling)
          // IE < 9 gives us a parentNode which messes up insert() check for cloning
          // `dep` > 1 can also cause problems with the insert() check (must do this last)
          each(els, function(el) { el[pn] && el[pn].removeChild(el) })
          return els
        }() : isNode(node) ? [node.cloneNode(true)] : []
    }
  
    bonzo.doc = function () {
      var vp = bonzo.viewport()
      return {
          width: Math.max(doc.body.scrollWidth, html.scrollWidth, vp.width)
        , height: Math.max(doc.body.scrollHeight, html.scrollHeight, vp.height)
      }
    }
  
    bonzo.firstChild = function (el) {
      for (var c = el.childNodes, i = 0, j = (c && c.length) || 0, e; i < j; i++) {
        if (c[i].nodeType === 1) e = c[j = i]
      }
      return e
    }
  
    bonzo.viewport = function () {
      return {
          width: ie ? html.clientWidth : self.innerWidth
        , height: ie ? html.clientHeight : self.innerHeight
      }
    }
  
    bonzo.isAncestor = 'compareDocumentPosition' in html ?
      function (container, element) {
        return (container.compareDocumentPosition(element) & 16) == 16
      } : 'contains' in html ?
      function (container, element) {
        return container !== element && container.contains(element);
      } :
      function (container, element) {
        while (element = element[parentNode]) {
          if (element === container) {
            return true
          }
        }
        return false
      }
  
    return bonzo
  }, this); // the only line we care about using a semi-colon. placed here for concatenation tools
  

  provide("bonzo", module.exports);
  provide("bonzo", module.exports);
  $.ender(module.exports);
}(global));

// ender:bonzo/ender-bridge as bonzo/ender-bridge
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function ($) {
  
    var b =  require('bonzo')
    b.setQueryEngine($)
    $.ender(b)
    $.ender(b(), true)
    $.ender({
      create: function (node) {
        return $(b.create(node))
      }
    })
  
    $.id = function (id) {
      return $([document.getElementById(id)])
    }
  
    function indexOf(ar, val) {
      for (var i = 0; i < ar.length; i++) if (ar[i] === val) return i
      return -1
    }
  
    function uniq(ar) {
      var r = [], i = 0, j = 0, k, item, inIt
      for (; item = ar[i]; ++i) {
        inIt = false
        for (k = 0; k < r.length; ++k) {
          if (r[k] === item) {
            inIt = true; break
          }
        }
        if (!inIt) r[j++] = item
      }
      return r
    }
  
    $.ender({
      parents: function (selector, closest) {
        if (!this.length) return this
        var collection = $(selector), j, k, p, r = []
        for (j = 0, k = this.length; j < k; j++) {
          p = this[j]
          while (p = p.parentNode) {
            if (~indexOf(collection, p)) {
              r.push(p)
              if (closest) break;
            }
          }
        }
        return $(uniq(r))
      }
  
    , parent: function() {
        return $(uniq(b(this).parent()))
      }
  
    , closest: function (selector) {
        return this.parents(selector, true)
      }
  
    , first: function () {
        return $(this.length ? this[0] : this)
      }
  
    , last: function () {
        return $(this.length ? this[this.length - 1] : [])
      }
  
    , next: function () {
        return $(b(this).next())
      }
  
    , previous: function () {
        return $(b(this).previous())
      }
  
    , appendTo: function (t) {
        return b(this.selector).appendTo(t, this)
      }
  
    , prependTo: function (t) {
        return b(this.selector).prependTo(t, this)
      }
  
    , insertAfter: function (t) {
        return b(this.selector).insertAfter(t, this)
      }
  
    , insertBefore: function (t) {
        return b(this.selector).insertBefore(t, this)
      }
  
    , replaceWith: function (t) {
        return b(this.selector).replaceWith(t, this)
      }
  
    , siblings: function () {
        var i, l, p, r = []
        for (i = 0, l = this.length; i < l; i++) {
          p = this[i]
          while (p = p.previousSibling) p.nodeType == 1 && r.push(p)
          p = this[i]
          while (p = p.nextSibling) p.nodeType == 1 && r.push(p)
        }
        return $(r)
      }
  
    , children: function () {
        var i, l, el, r = []
        for (i = 0, l = this.length; i < l; i++) {
          if (!(el = b.firstChild(this[i]))) continue;
          r.push(el)
          while (el = el.nextSibling) el.nodeType == 1 && r.push(el)
        }
        return $(uniq(r))
      }
  
    , height: function (v) {
        return dimension.call(this, 'height', v)
      }
  
    , width: function (v) {
        return dimension.call(this, 'width', v)
      }
    }, true)
  
    /**
     * @param {string} type either width or height
     * @param {number=} opt_v becomes a setter instead of a getter
     * @return {number}
     */
    function dimension(type, opt_v) {
      return typeof opt_v == 'undefined'
        ? b(this).dim()[type]
        : this.css(type, opt_v)
    }
  }(ender));

  provide("bonzo/ender-bridge", module.exports);
  provide("bonzo/ender-bridge", module.exports);
  $.ender(module.exports);
}(global));

// ender:bean as bean
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*!
    * bean.js - copyright Jacob Thornton 2011
    * https://github.com/fat/bean
    * MIT License
    * special thanks to:
    * dean edwards: http://dean.edwards.name/
    * dperini: https://github.com/dperini/nwevents
    * the entire mootools team: github.com/mootools/mootools-core
    */
  !function (name, context, definition) {
    if (typeof module !== 'undefined') module.exports = definition(name, context);
    else if (typeof define === 'function' && typeof define.amd  === 'object') define(definition);
    else context[name] = definition(name, context);
  }('bean', this, function (name, context) {
    var win = window
      , old = context[name]
      , overOut = /over|out/
      , namespaceRegex = /[^\.]*(?=\..*)\.|.*/
      , nameRegex = /\..*/
      , addEvent = 'addEventListener'
      , attachEvent = 'attachEvent'
      , removeEvent = 'removeEventListener'
      , detachEvent = 'detachEvent'
      , ownerDocument = 'ownerDocument'
      , targetS = 'target'
      , qSA = 'querySelectorAll'
      , doc = document || {}
      , root = doc.documentElement || {}
      , W3C_MODEL = root[addEvent]
      , eventSupport = W3C_MODEL ? addEvent : attachEvent
      , slice = Array.prototype.slice
      , mouseTypeRegex = /click|mouse(?!(.*wheel|scroll))|menu|drag|drop/i
      , mouseWheelTypeRegex = /mouse.*(wheel|scroll)/i
      , textTypeRegex = /^text/i
      , touchTypeRegex = /^touch|^gesture/i
      , ONE = {} // singleton for quick matching making add() do one()
  
      , nativeEvents = (function (hash, events, i) {
          for (i = 0; i < events.length; i++)
            hash[events[i]] = 1
          return hash
        }({}, (
            'click dblclick mouseup mousedown contextmenu ' +                  // mouse buttons
            'mousewheel mousemultiwheel DOMMouseScroll ' +                     // mouse wheel
            'mouseover mouseout mousemove selectstart selectend ' +            // mouse movement
            'keydown keypress keyup ' +                                        // keyboard
            'orientationchange ' +                                             // mobile
            'focus blur change reset select submit ' +                         // form elements
            'load unload beforeunload resize move DOMContentLoaded '+          // window
            'readystatechange message ' +                                      // window
            'error abort scroll ' +                                            // misc
            (W3C_MODEL ? // element.fireEvent('onXYZ'... is not forgiving if we try to fire an event
                         // that doesn't actually exist, so make sure we only do these on newer browsers
              'show ' +                                                          // mouse buttons
              'input invalid ' +                                                 // form elements
              'touchstart touchmove touchend touchcancel ' +                     // touch
              'gesturestart gesturechange gestureend ' +                         // gesture
              'readystatechange pageshow pagehide popstate ' +                   // window
              'hashchange offline online ' +                                     // window
              'afterprint beforeprint ' +                                        // printing
              'dragstart dragenter dragover dragleave drag drop dragend ' +      // dnd
              'loadstart progress suspend emptied stalled loadmetadata ' +       // media
              'loadeddata canplay canplaythrough playing waiting seeking ' +     // media
              'seeked ended durationchange timeupdate play pause ratechange ' +  // media
              'volumechange cuechange ' +                                        // media
              'checking noupdate downloading cached updateready obsolete ' +     // appcache
              '' : '')
          ).split(' ')
        ))
  
      , customEvents = (function () {
          var cdp = 'compareDocumentPosition'
            , isAncestor = cdp in root
                ? function (element, container) {
                    return container[cdp] && (container[cdp](element) & 16) === 16
                  }
                : 'contains' in root
                  ? function (element, container) {
                      container = container.nodeType === 9 || container === window ? root : container
                      return container !== element && container.contains(element)
                    }
                  : function (element, container) {
                      while (element = element.parentNode) if (element === container) return 1
                      return 0
                    }
  
          function check(event) {
            var related = event.relatedTarget
            return !related
              ? related === null
              : (related !== this && related.prefix !== 'xul' && !/document/.test(this.toString()) && !isAncestor(related, this))
          }
  
          return {
              mouseenter: { base: 'mouseover', condition: check }
            , mouseleave: { base: 'mouseout', condition: check }
            , mousewheel: { base: /Firefox/.test(navigator.userAgent) ? 'DOMMouseScroll' : 'mousewheel' }
          }
        }())
  
      , fixEvent = (function () {
          var commonProps = 'altKey attrChange attrName bubbles cancelable ctrlKey currentTarget detail eventPhase getModifierState isTrusted metaKey relatedNode relatedTarget shiftKey srcElement target timeStamp type view which'.split(' ')
            , mouseProps = commonProps.concat('button buttons clientX clientY dataTransfer fromElement offsetX offsetY pageX pageY screenX screenY toElement'.split(' '))
            , mouseWheelProps = mouseProps.concat('wheelDelta wheelDeltaX wheelDeltaY wheelDeltaZ axis'.split(' ')) // 'axis' is FF specific
            , keyProps = commonProps.concat('char charCode key keyCode keyIdentifier keyLocation'.split(' '))
            , textProps = commonProps.concat(['data'])
            , touchProps = commonProps.concat('touches targetTouches changedTouches scale rotation'.split(' '))
            , messageProps = commonProps.concat(['data', 'origin', 'source'])
            , preventDefault = 'preventDefault'
            , createPreventDefault = function (event) {
                return function () {
                  if (event[preventDefault])
                    event[preventDefault]()
                  else
                    event.returnValue = false
                }
              }
            , stopPropagation = 'stopPropagation'
            , createStopPropagation = function (event) {
                return function () {
                  if (event[stopPropagation])
                    event[stopPropagation]()
                  else
                    event.cancelBubble = true
                }
              }
            , createStop = function (synEvent) {
                return function () {
                  synEvent[preventDefault]()
                  synEvent[stopPropagation]()
                  synEvent.stopped = true
                }
              }
            , copyProps = function (event, result, props) {
                var i, p
                for (i = props.length; i--;) {
                  p = props[i]
                  if (!(p in result) && p in event) result[p] = event[p]
                }
              }
  
          return function (event, isNative) {
            var result = { originalEvent: event, isNative: isNative }
            if (!event)
              return result
  
            var props
              , type = event.type
              , target = event[targetS] || event.srcElement
  
            result[preventDefault] = createPreventDefault(event)
            result[stopPropagation] = createStopPropagation(event)
            result.stop = createStop(result)
            result[targetS] = target && target.nodeType === 3 ? target.parentNode : target
  
            if (isNative) { // we only need basic augmentation on custom events, the rest is too expensive
              if (type.indexOf('key') !== -1) {
                props = keyProps
                result.keyCode = event.keyCode || event.which
              } else if (mouseTypeRegex.test(type)) {
                props = mouseProps
                result.rightClick = event.which === 3 || event.button === 2
                result.pos = { x: 0, y: 0 }
                if (event.pageX || event.pageY) {
                  result.clientX = event.pageX
                  result.clientY = event.pageY
                } else if (event.clientX || event.clientY) {
                  result.clientX = event.clientX + doc.body.scrollLeft + root.scrollLeft
                  result.clientY = event.clientY + doc.body.scrollTop + root.scrollTop
                }
                if (overOut.test(type))
                  result.relatedTarget = event.relatedTarget || event[(type === 'mouseover' ? 'from' : 'to') + 'Element']
              } else if (touchTypeRegex.test(type)) {
                props = touchProps
              } else if (mouseWheelTypeRegex.test(type)) {
                props = mouseWheelProps
              } else if (textTypeRegex.test(type)) {
                props = textProps
              } else if (type === 'message') {
                props = messageProps
              }
              copyProps(event, result, props || commonProps)
            }
            return result
          }
        }())
  
        // if we're in old IE we can't do onpropertychange on doc or win so we use doc.documentElement for both
      , targetElement = function (element, isNative) {
          return !W3C_MODEL && !isNative && (element === doc || element === win) ? root : element
        }
  
        // we use one of these per listener, of any type
      , RegEntry = (function () {
          function entry(element, type, handler, original, namespaces) {
            var isNative = this.isNative = nativeEvents[type] && element[eventSupport]
            this.element = element
            this.type = type
            this.handler = handler
            this.original = original
            this.namespaces = namespaces
            this.custom = customEvents[type]
            this.eventType = W3C_MODEL || isNative ? type : 'propertychange'
            this.customType = !W3C_MODEL && !isNative && type
            this[targetS] = targetElement(element, isNative)
            this[eventSupport] = this[targetS][eventSupport]
          }
  
          entry.prototype = {
              // given a list of namespaces, is our entry in any of them?
              inNamespaces: function (checkNamespaces) {
                var i, j
                if (!checkNamespaces)
                  return true
                if (!this.namespaces)
                  return false
                for (i = checkNamespaces.length; i--;) {
                  for (j = this.namespaces.length; j--;) {
                    if (checkNamespaces[i] === this.namespaces[j])
                      return true
                  }
                }
                return false
              }
  
              // match by element, original fn (opt), handler fn (opt)
            , matches: function (checkElement, checkOriginal, checkHandler) {
                return this.element === checkElement &&
                  (!checkOriginal || this.original === checkOriginal) &&
                  (!checkHandler || this.handler === checkHandler)
              }
          }
  
          return entry
        }())
  
      , registry = (function () {
          // our map stores arrays by event type, just because it's better than storing
          // everything in a single array. uses '$' as a prefix for the keys for safety
          var map = {}
  
            // generic functional search of our registry for matching listeners,
            // `fn` returns false to break out of the loop
            , forAll = function (element, type, original, handler, fn) {
                if (!type || type === '*') {
                  // search the whole registry
                  for (var t in map) {
                    if (t.charAt(0) === '$')
                      forAll(element, t.substr(1), original, handler, fn)
                  }
                } else {
                  var i = 0, l, list = map['$' + type], all = element === '*'
                  if (!list)
                    return
                  for (l = list.length; i < l; i++) {
                    if (all || list[i].matches(element, original, handler))
                      if (!fn(list[i], list, i, type))
                        return
                  }
                }
              }
  
            , has = function (element, type, original) {
                // we're not using forAll here simply because it's a bit slower and this
                // needs to be fast
                var i, list = map['$' + type]
                if (list) {
                  for (i = list.length; i--;) {
                    if (list[i].matches(element, original, null))
                      return true
                  }
                }
                return false
              }
  
            , get = function (element, type, original) {
                var entries = []
                forAll(element, type, original, null, function (entry) { return entries.push(entry) })
                return entries
              }
  
            , put = function (entry) {
                (map['$' + entry.type] || (map['$' + entry.type] = [])).push(entry)
                return entry
              }
  
            , del = function (entry) {
                forAll(entry.element, entry.type, null, entry.handler, function (entry, list, i) {
                  list.splice(i, 1)
                  if (list.length === 0)
                    delete map['$' + entry.type]
                  return false
                })
              }
  
              // dump all entries, used for onunload
            , entries = function () {
                var t, entries = []
                for (t in map) {
                  if (t.charAt(0) === '$')
                    entries = entries.concat(map[t])
                }
                return entries
              }
  
          return { has: has, get: get, put: put, del: del, entries: entries }
        }())
  
      , selectorEngine = doc[qSA]
          ? function (s, r) {
              return r[qSA](s)
            }
          : function () {
              throw new Error('Bean: No selector engine installed') // eeek
            }
  
      , setSelectorEngine = function (e) {
          selectorEngine = e
        }
  
        // add and remove listeners to DOM elements
      , listener = W3C_MODEL ? function (element, type, fn, add) {
          element[add ? addEvent : removeEvent](type, fn, false)
        } : function (element, type, fn, add, custom) {
          if (custom && add && element['_on' + custom] === null)
            element['_on' + custom] = 0
          element[add ? attachEvent : detachEvent]('on' + type, fn)
        }
  
      , nativeHandler = function (element, fn, args) {
          var beanDel = fn.__beanDel
            , handler = function (event) {
            event = fixEvent(event || ((this[ownerDocument] || this.document || this).parentWindow || win).event, true)
            if (beanDel) // delegated event, fix the fix
              event.currentTarget = beanDel.ft(event[targetS], element)
            return fn.apply(element, [event].concat(args))
          }
          handler.__beanDel = beanDel
          return handler
        }
  
      , customHandler = function (element, fn, type, condition, args, isNative) {
          var beanDel = fn.__beanDel
            , handler = function (event) {
            var target = beanDel ? beanDel.ft(event[targetS], element) : this // deleated event
            if (condition ? condition.apply(target, arguments) : W3C_MODEL ? true : event && event.propertyName === '_on' + type || !event) {
              if (event) {
                event = fixEvent(event || ((this[ownerDocument] || this.document || this).parentWindow || win).event, isNative)
                event.currentTarget = target
              }
              fn.apply(element, event && (!args || args.length === 0) ? arguments : slice.call(arguments, event ? 0 : 1).concat(args))
            }
          }
          handler.__beanDel = beanDel
          return handler
        }
  
      , once = function (rm, element, type, fn, originalFn) {
          // wrap the handler in a handler that does a remove as well
          return function () {
            rm(element, type, originalFn)
            fn.apply(this, arguments)
          }
        }
  
      , removeListener = function (element, orgType, handler, namespaces) {
          var i, l, entry
            , type = (orgType && orgType.replace(nameRegex, ''))
            , handlers = registry.get(element, type, handler)
  
          for (i = 0, l = handlers.length; i < l; i++) {
            if (handlers[i].inNamespaces(namespaces)) {
              if ((entry = handlers[i])[eventSupport])
                listener(entry[targetS], entry.eventType, entry.handler, false, entry.type)
              // TODO: this is problematic, we have a registry.get() and registry.del() that
              // both do registry searches so we waste cycles doing this. Needs to be rolled into
              // a single registry.forAll(fn) that removes while finding, but the catch is that
              // we'll be splicing the arrays that we're iterating over. Needs extra tests to
              // make sure we don't screw it up. @rvagg
              registry.del(entry)
            }
          }
        }
  
      , addListener = function (element, orgType, fn, originalFn, args) {
          var entry
            , type = orgType.replace(nameRegex, '')
            , namespaces = orgType.replace(namespaceRegex, '').split('.')
  
          if (registry.has(element, type, fn))
            return element // no dupe
          if (type === 'unload')
            fn = once(removeListener, element, type, fn, originalFn) // self clean-up
          if (customEvents[type]) {
            if (customEvents[type].condition)
              fn = customHandler(element, fn, type, customEvents[type].condition, args, true)
            type = customEvents[type].base || type
          }
          entry = registry.put(new RegEntry(element, type, fn, originalFn, namespaces[0] && namespaces))
          entry.handler = entry.isNative ?
            nativeHandler(element, entry.handler, args) :
            customHandler(element, entry.handler, type, false, args, false)
          if (entry[eventSupport])
            listener(entry[targetS], entry.eventType, entry.handler, true, entry.customType)
        }
  
      , del = function (selector, fn, $) {
              //TODO: findTarget (therefore $) is called twice, once for match and once for
              // setting e.currentTarget, fix this so it's only needed once
          var findTarget = function (target, root) {
                var i, array = typeof selector === 'string' ? $(selector, root) : selector
                for (; target && target !== root; target = target.parentNode) {
                  for (i = array.length; i--;) {
                    if (array[i] === target)
                      return target
                  }
                }
              }
            , handler = function (e) {
                var match = findTarget(e[targetS], this)
                match && fn.apply(match, arguments)
              }
  
          handler.__beanDel = {
              ft: findTarget // attach it here for customEvents to use too
            , selector: selector
            , $: $
          }
          return handler
        }
  
      , remove = function (element, typeSpec, fn) {
          var k, type, namespaces, i
            , rm = removeListener
            , isString = typeSpec && typeof typeSpec === 'string'
  
          if (isString && typeSpec.indexOf(' ') > 0) {
            // remove(el, 't1 t2 t3', fn) or remove(el, 't1 t2 t3')
            typeSpec = typeSpec.split(' ')
            for (i = typeSpec.length; i--;)
              remove(element, typeSpec[i], fn)
            return element
          }
          type = isString && typeSpec.replace(nameRegex, '')
          if (type && customEvents[type])
            type = customEvents[type].type
          if (!typeSpec || isString) {
            // remove(el) or remove(el, t1.ns) or remove(el, .ns) or remove(el, .ns1.ns2.ns3)
            if (namespaces = isString && typeSpec.replace(namespaceRegex, ''))
              namespaces = namespaces.split('.')
            rm(element, type, fn, namespaces)
          } else if (typeof typeSpec === 'function') {
            // remove(el, fn)
            rm(element, null, typeSpec)
          } else {
            // remove(el, { t1: fn1, t2, fn2 })
            for (k in typeSpec) {
              if (typeSpec.hasOwnProperty(k))
                remove(element, k, typeSpec[k])
            }
          }
          return element
        }
  
        // 5th argument, $=selector engine, is deprecated and will be removed
      , add = function (element, events, fn, delfn, $) {
          var type, types, i, args
            , originalFn = fn
            , isDel = fn && typeof fn === 'string'
  
          if (events && !fn && typeof events === 'object') {
            for (type in events) {
              if (events.hasOwnProperty(type))
                add.apply(this, [ element, type, events[type] ])
            }
          } else {
            args = arguments.length > 3 ? slice.call(arguments, 3) : []
            types = (isDel ? fn : events).split(' ')
            isDel && (fn = del(events, (originalFn = delfn), $ || selectorEngine)) && (args = slice.call(args, 1))
            // special case for one()
            this === ONE && (fn = once(remove, element, events, fn, originalFn))
            for (i = types.length; i--;) addListener(element, types[i], fn, originalFn, args)
          }
          return element
        }
  
      , one = function () {
          return add.apply(ONE, arguments)
        }
  
      , fireListener = W3C_MODEL ? function (isNative, type, element) {
          var evt = doc.createEvent(isNative ? 'HTMLEvents' : 'UIEvents')
          evt[isNative ? 'initEvent' : 'initUIEvent'](type, true, true, win, 1)
          element.dispatchEvent(evt)
        } : function (isNative, type, element) {
          element = targetElement(element, isNative)
          // if not-native then we're using onpropertychange so we just increment a custom property
          isNative ? element.fireEvent('on' + type, doc.createEventObject()) : element['_on' + type]++
        }
  
      , fire = function (element, type, args) {
          var i, j, l, names, handlers
            , types = type.split(' ')
  
          for (i = types.length; i--;) {
            type = types[i].replace(nameRegex, '')
            if (names = types[i].replace(namespaceRegex, ''))
              names = names.split('.')
            if (!names && !args && element[eventSupport]) {
              fireListener(nativeEvents[type], type, element)
            } else {
              // non-native event, either because of a namespace, arguments or a non DOM element
              // iterate over all listeners and manually 'fire'
              handlers = registry.get(element, type)
              args = [false].concat(args)
              for (j = 0, l = handlers.length; j < l; j++) {
                if (handlers[j].inNamespaces(names))
                  handlers[j].handler.apply(element, args)
              }
            }
          }
          return element
        }
  
      , clone = function (element, from, type) {
          var i = 0
            , handlers = registry.get(from, type)
            , l = handlers.length
            , args, beanDel
  
          for (;i < l; i++) {
            if (handlers[i].original) {
              beanDel = handlers[i].handler.__beanDel
              if (beanDel) {
                args = [ element, beanDel.selector, handlers[i].type, handlers[i].original, beanDel.$]
              } else
                args = [ element, handlers[i].type, handlers[i].original ]
              add.apply(null, args)
            }
          }
          return element
        }
  
      , bean = {
            add: add
          , one: one
          , remove: remove
          , clone: clone
          , fire: fire
          , setSelectorEngine: setSelectorEngine
          , noConflict: function () {
              context[name] = old
              return this
            }
        }
  
    if (win[attachEvent]) {
      // for IE, clean up on unload to avoid leaks
      var cleanup = function () {
        var i, entries = registry.entries()
        for (i in entries) {
          if (entries[i].type && entries[i].type !== 'unload')
            remove(entries[i].element, entries[i].type)
        }
        win[detachEvent]('onunload', cleanup)
        win.CollectGarbage && win.CollectGarbage()
      }
      win[attachEvent]('onunload', cleanup)
    }
  
    return bean
  })
  

  provide("bean", module.exports);
  provide("bean", module.exports);
  $.ender(module.exports);
}(global));

// ender:bean/ender-bridge as bean/ender-bridge
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  !function ($) {
    var b =  require('bean')
      , integrate = function (method, type, method2) {
          var _args = type ? [type] : []
          return function () {
            for (var i = 0, l = this.length; i < l; i++) {
              if (!arguments.length && method == 'add' && type) method = 'fire'
              b[method].apply(this, [this[i]].concat(_args, Array.prototype.slice.call(arguments, 0)))
            }
            return this
          }
        }
      , add = integrate('add')
      , remove = integrate('remove')
      , fire = integrate('fire')
  
      , methods = {
            on: add // NOTE: .on() is likely to change in the near future, don't rely on this as-is see https://github.com/fat/bean/issues/55
          , addListener: add
          , bind: add
          , listen: add
          , delegate: add
  
          , one: integrate('one')
  
          , off: remove
          , unbind: remove
          , unlisten: remove
          , removeListener: remove
          , undelegate: remove
  
          , emit: fire
          , trigger: fire
  
          , cloneEvents: integrate('clone')
  
          , hover: function (enter, leave, i) { // i for internal
              for (i = this.length; i--;) {
                b.add.call(this, this[i], 'mouseenter', enter)
                b.add.call(this, this[i], 'mouseleave', leave)
              }
              return this
            }
        }
  
      , shortcuts =
           ('blur change click dblclick error focus focusin focusout keydown keypress '
          + 'keyup load mousedown mouseenter mouseleave mouseout mouseover mouseup '
          + 'mousemove resize scroll select submit unload').split(' ')
  
    for (var i = shortcuts.length; i--;) {
      methods[shortcuts[i]] = integrate('add', shortcuts[i])
    }
  
    b.setSelectorEngine($)
  
    $.ender(methods, true)
  }(ender)
  

  provide("bean/ender-bridge", module.exports);
  provide("bean/ender-bridge", module.exports);
  $.ender(module.exports);
}(global));

// ender:ahr2/utils as ahr2/utils
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jslint white: false, onevar: true, undef: true, node: true, nomen: true, regexp: false, plusplus: true, bitwise: true, es5: true, newcap: true, maxerr: 5 */
  (function () {
    "use strict";
  
    var utils = exports
      , jsonpRegEx = /\s*([\$\w]+)\s*\(\s*(.*)\s*\)\s*/;
  
    utils.clone = function (obj) {
      return JSON.parse(JSON.stringify(obj));
    };
  
    // useful for extending global options onto a local variable
    utils.extend = function (global, local) {
      //global = utils.clone(global);
      Object.keys(local).forEach(function (key) {
        global[key] = local[key] || global[key];
      });
      return global;
    };
  
    // useful for extending global options onto a local variable
    utils.preset = function (local, global) {
      // TODO copy functions
      // TODO recurse / deep copy
      global = utils.clone(global);
      Object.keys(global).forEach(function (key) {
        if ('undefined' === typeof local[key]) {
          local[key] = global[key];
        }
      });
      return local;
    };
  
    utils.objectToLowerCase = function (obj, recurse) {
      // Make headers all lower-case
      Object.keys(obj).forEach(function (key) {
        var value;
  
        value = obj[key];
        delete obj[key];
        key = key.toLowerCase();
        /*
        if ('string' === typeof value) {
          obj[key] = value.toLowerCase();
        } else {
          obj[key] = value;
        }
        */
        obj[key] = value;
      });
      return obj;
    };
  
    utils.parseJsonp = function (jsonpCallback, jsonp) {
      var match = jsonp.match(jsonpRegEx)
        , data
        , json;
  
      if (!match || !match[1] || !match[2]) {
        throw new Error('No JSONP matched');
      }
      if (jsonpCallback !== match[1]) {
        throw new Error('JSONP callback doesn\'t match');
      }
      json = match[2];
  
      data = JSON.parse(json);
      return data;
    };
  
    utils.uriEncodeObject = function(json) {
      var query = '';
  
      try {
        JSON.parse(JSON.stringify(json));
      } catch(e) {
        return 'ERR_CYCLIC_DATA_STRUCTURE';
      }
  
      if ('object' !== typeof json) {
        return 'ERR_NOT_AN_OBJECT';
      }
  
      Object.keys(json).forEach(function (key) {
        var param, value;
  
        // assume that the user meant to delete this element
        if ('undefined' === typeof json[key]) {
          return;
        }
  
        param = encodeURIComponent(key);
        value = encodeURIComponent(json[key]);
        query += '&' + param;
  
        // assume that the user wants just the param name sent
        if (null !== json[key]) {
          query += '=' + value;
        }
      });
  
      // remove first '&'
      return query.substring(1);
    };
  
    utils.addParamsToUri = function(uri, params) {
      var query
        , anchor = ''
        , anchorpos;
  
      uri = uri || "";
      anchor = '';
      params = params || {};
  
      // just in case this gets used client-side
      if (-1 !== (anchorpos = uri.indexOf('#'))) {
        anchor = uri.substr(anchorpos);
        uri = uri.substr(0, anchorpos);
      }
  
      query = utils.uriEncodeObject(params);
  
      // cut the leading '&' if no other params have been written
      if (query.length > 0) {
        if (!uri.match(/\?/)) {
          uri += '?' + query;
        } else {
          uri += '&' + query;
        }
      }
  
      return uri + anchor;
    };
  }());
  

  provide("ahr2/utils", module.exports);
  provide("ahr2/utils", module.exports);
  $.ender(module.exports);
}(global));

// ender:ahr2/browser/jsonp as ahr2/browser/jsonp
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
  /*
     loadstart;
     progress;
     abort;
     error;
     load;
     timeout;
     loadend;
  */
  (function () {
    "use strict";
  
    function browserJsonpClient(req, res) {
      // TODO check for Same-domain / XHR2/CORS support
      // before attempting to insert script tag
      // Those support headers and such, which are good
      var options = req.userOptions
        , cbkey = options.jsonpCallback
        , window = require('window')
        , document = require('document')
        , script = document.createElement("script")
        , head = document.getElementsByTagName("head")[0] || document.documentElement
        , addParamsToUri =  require('ahr2/utils').addParamsToUri
        , timeout
        , fulfilled; // TODO move this logic elsewhere into the emitter
  
      // cleanup: cleanup window and dom
      function cleanup() {
        fulfilled = true;
        window[cbkey] = undefined;
        try {
          delete window[cbkey];
          // may have already been removed
          head.removeChild(script);
        } catch(e) {}
      }
  
      function abortRequest() {
        req.emit('abort');
        cleanup();
      }
  
      function abortResponse() {
        res.emit('abort');
        cleanup();
      }
  
      function prepareResponse() {
        // Sanatize data, Send, Cleanup
        function onSuccess(data) {
          var ev = {
            lengthComputable: false,
            loaded: 1,
            total: 1
          };
          if (fulfilled) {
            return;
          }
  
          clearTimeout(timeout);
          res.emit('loadstart', ev);
          // sanitize
          data = JSON.parse(JSON.stringify(data));
          res.emit('progress', ev);
          ev.target = { result: data };
          res.emit('load', ev);
          cleanup();
        }
  
        function onTimeout() {
          res.emit('timeout', {});
          res.emit('error', new Error('timeout'));
          cleanup();
        }
  
        window[cbkey] = onSuccess;
        // onError: Set timeout if script tag fails to load
        if (options.timeout) {
          //timeout = setTimeout(onTimeout, options.timeout);
        }
      }
  
      function makeRequest() {
        var ev = {}
          , jsonp = {};
  
        function onError(ev) {
          res.emit('error', ev);
        }
  
        // ?search=kittens&jsonp=jsonp123456
        jsonp[options.jsonp] = options.jsonpCallback;
        options.href = addParamsToUri(options.href, jsonp);
  
        // Insert JSONP script into the DOM
        // set script source to the service that responds with thepadded JSON data
        req.emit('loadstart', ev);
        try {
          script.setAttribute("type", "text/javascript");
          script.setAttribute("async", "async");
          script.setAttribute("src", options.href);
          // Note that this only works in some browsers,
          // but it's better than nothing
          script.onerror = onError;
          head.insertBefore(script, head.firstChild);
        } catch(e) {
          req.emit('error', e);
        }
  
        // failsafe cleanup
        setTimeout(cleanup, 2 * 60 * 1000);
        // a moot point since the "load" occurs so quickly
        req.emit('progress', ev);
        req.emit('load', ev);
      }
  
      setTimeout(makeRequest, 0);
      req.abort = abortRequest;
      res.abort = abortResponse;
      prepareResponse();
  
      return res;
    }
  
    module.exports = browserJsonpClient;
  }());
  

  provide("ahr2/browser/jsonp", module.exports);
  provide("ahr2/browser/jsonp", module.exports);
  $.ender(module.exports);
}(global));

// ender:ahr2/options as ahr2/options
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
  (function () {
    "use strict";
  
    var globalOptions
      , ahrOptions = exports
      , url = require('url')
      , querystring = require('querystring')
      , File = require('File')
      , FileList = require('FileList')
      , btoa = require('btoa')
      , utils =  require('ahr2/utils')
      , location
      , uriEncodeObject
      , clone
      , preset
      , objectToLowerCase
      ;
  
    /*
     * Some browsers don't yet have support for FormData.
     * This isn't a real fix, but it stops stuff from crashing.
     * 
     * This should probably be replaced with a real FormData impl, but whatever.
     */
    function FormData() {
    }
    
    try {
      FormData = require('FormData');
    } catch (e) {
      console.warn('FormData does not exist; using a NOP instead');
    }
  
    // TODO get the "root" dir... somehow
    try {
      location = require('./location');
    } catch(e) {
      location = require('location');
    }
  
    uriEncodeObject = utils.uriEncodeObject;
    clone = utils.clone;
    preset = utils.preset;
    objectToLowerCase = utils.objectToLowerCase;
  
    globalOptions = {
      ssl: false,
      method: 'GET',
      headers: {
        //'accept': "application/json; charset=utf-8, */*; q=0.5"
      },
      redirectCount: 0,
      redirectCountMax: 5,
      // contentType: 'json',
      // accept: 'json',
      followRedirect: true,
      timeout: 20000
    };
  
  
    //
    // Manage global options while keeping state safe
    //
    ahrOptions.globalOptionKeys = function () {
      return Object.keys(globalOptions);
    };
  
    ahrOptions.globalOption = function (key, val) {
      if ('undefined' === typeof val) {
        return globalOptions[key];
      }
      if (null === val) {
        val = undefined;
      }
      globalOptions[key] = val;
    };
  
    ahrOptions.setGlobalOptions = function (bag) {
      Object.keys(bag).forEach(function (key) {
        globalOptions[key] = bag[key];
      });
    };
  
  
    /*
     * About the HTTP spec and which methods allow bodies, etc:
     * http://stackoverflow.com/questions/299628/is-an-entity-body-allowed-for-an-http-delete-request
     */
    function checkBodyAllowed(options) {
      var method = options.method.toUpperCase();
      if ('HEAD' !== method && 'GET' !== method && 'DELETE' !== method && 'OPTIONS' !== method) {
        return true;
      }
      if (options.body && !options.forceAllowBody) {
        throw new Error("The de facto standard is that '" + method + "' should not have a body.\n" +
          "Most web servers just ignore it. Please use 'query' rather than 'body'.\n" +
          "Also, you may consider filing this as a bug - please give an explanation.\n" +
          "Finally, you may allow this by passing { forceAllowBody: 'true' } ");
      }
      if (options.body && options.jsonp) {
        throw new Error("The de facto standard is that 'jsonp' should not have a body (and I don't see how it could have one anyway).\n" +
          "If you consider filing this as a bug please give an explanation.");
      }
    }
  
  
    /*
      Node.js
  
      > var url = require('url');
      > var urlstring = 'http://user:pass@host.com:8080/p/a/t/h?query=string#hash';
      > url.parse(urlstring, true);
      { href: 'http://user:pass@host.com:8080/p/a/t/h?query=string#hash',
        protocol: 'http:',
        host: 'user:pass@host.com:8080',
        auth: 'user:pass',
        hostname: 'host.com',
        port: '8080',
        pathname: '/p/a/t/h',
        search: '?query=string',
        hash: '#hash',
  
        slashes: true,
        query: {'query':'string'} } // 'query=string'
    */
  
    /*
      Browser
  
        href: "http://user:pass@host.com:8080/p/a/t/h?query=string#hash"
        protocol: "http:" 
        host: "host.com:8080"
        hostname: "host.com"
        port: "8080"
        pathname: "/p/a/t/h"
        search: '?query=string',
        hash: "#hash"
  
        origin: "http://host.com:8080"
     */
  
    function handleUri(options) {
      var presets
        , urlObj
        , auth
        ;
  
      presets = clone(globalOptions);
  
      if (!options) {
        throw new Error('ARe yOu kiddiNg me? You have to provide some sort of options');
      }
  
      if ('string' === typeof options) {
        options = {
          href: options
        };
      }
      if (options.uri || options.url) {
        console.warn('Use `options.href`. `options.url` and `options.uri` are obsolete');
        options.href = options.href || options.url || options.url;
      }
      if (options.params) {
        console.warn('Use `options.query`. `options.params` is obsolete');
        options.query = options.query || options.params;
      }
  
  
      //
      // pull `urlObj` from `options`
      //
      if (options.href) {
        urlObj = url.parse(options.href, true, true);
        if (urlObj.query && options.query) {
          Object.keys(options.query).forEach(function (key) {
            urlObj.query[key] = options.query[key];
          });
        }
        // ignored anyway
        delete urlObj.href;
        // these trump other options
        delete urlObj.host;
        delete urlObj.search;
      } else {
        urlObj = {
            protocol: options.protocol || location.protocol
        //  host trumps auth, hostname, and port
          , host: options.host
          , auth: options.auth
          , hostname: options.hostname || location.hostname
          , port: options.port || location.port
          , pathname: url.resolve(location.pathname, options.pathname || '') || '/'
        // search trumps query
        //, search: options.search
          , query: options.query || querystring.parse(options.search||"")
          , hash: options.hash
        };
      }
      delete options.href;
      delete options.host;
      delete options.auth;
      delete options.hostname;
      delete options.port;
      delete options.path;
      delete options.search;
      delete options.query;
      delete options.hash;
  
      // Use SSL if desired
      if ('https:' === urlObj.protocol || '443' === urlObj.port || true === options.ssl) {
        options.ssl = true;
        urlObj.port = urlObj.port || '443';
        // hopefully no one would set prt 443 to standard http
        urlObj.protocol = 'https:';
      }
  
      if ('tcp:' === urlObj.protocol || 'tcps:' === urlObj.protocol || 'udp:' === urlObj.protocol) {
        options.method = options.method || 'POST';
      }
  
      if (!options.method && (options.body || options.encodedBody)) {
        options.method = 'POST';
      }
  
      if (options.jsonp) {
        // i.e. /path/to/res?x=y&jsoncallback=jsonp8765
        // i.e. /path/to/res?x=y&json=jsonp_ae75f
        options.jsonpCallback = 'jsonp_' + (new Date()).valueOf();
        options.dataType = 'jsonp';
        urlObj.query[options.jsonp] = options.jsonpCallback;
      }
  
      // for the sake of the browser, but it doesn't hurt node
      if (!urlObj.auth && options.username && options.password) {
        urlObj.auth = options.username + ':' + options.password;
      } else if (urlObj.auth) {
        urlObj.username = urlObj.auth.split(':')[0];
        urlObj.password = urlObj.auth.split(':')[1];
      }
  
      auth = urlObj.auth;
      urlObj.auth = undefined;
      urlObj.href = url.format(urlObj);
      urlObj = url.parse(urlObj.href, true, true);
      urlObj.auth = urlObj.auth || auth;
  
      preset(options, presets);
      preset(options, urlObj);
      options.syncback = options.syncback || function () {};
  
      return options;
    }
  
    function handleHeaders(options) {
      var presets
        , ua
        ;
  
      presets = clone(globalOptions);
  
      options.headers = options.headers || {};
      if (options.jsonp) {
        options.headers.accept = "text/javascript";
      }
      // TODO user-agent should retain case
      options.headers = objectToLowerCase(options.headers || {});
      options.headers = preset(options.headers, presets.headers);
      // TODO port?
      options.headers.host = options.hostname;
      options.headers = objectToLowerCase(options.headers);
      if (options.contentType) {
        options.headers['content-type'] = options.contentType;
      }
  
      // for the sake of node, but it doesn't hurt the browser
      if (options.auth) {
        options.headers.authorization = 'Basic ' + btoa(options.auth);
      }
      delete options.auth;
  
      return options;
    }
  
    function hasFiles(body, formData) {
      var hasFile = false;
      if ('object' !== typeof body) {
        return false;
      }
      Object.keys(body).forEach(function (key) {
        var item = body[key];
        if (item instanceof File) {
          hasFile = true;
        } else if (item instanceof FileList) {
          hasFile = true;
        }
      });
      return hasFile;
    }
    function addFiles(body, formData) {
  
      Object.keys(body).forEach(function (key) {
        var item = body[key];
  
        if (item instanceof File) {
          formData.append(key, item);
        } else if (item instanceof FileList) {
          item.forEach(function (file) {
            formData.append(key, file);
          });
        } else {
          formData.append(key, item);
        }
      });
    }
  
    // TODO convert object/map body into array body
    // { "a": 1, "b": 2 } --> [ "name": "a", "value": 1, "name": "b", "value": 2 ]
    // this would be more appropriate and in better accordance with the http spec
    // as it allows for a value such as "a" to have multiple values rather than
    // having to do "a1", "a2" etc
    function handleBody(options) {
      function bodyEncoder() {
        checkBodyAllowed(options);
  
        if (options.encodedBody) {
          return;
        }
  
        //
        // Check for HTML5 FileApi files
        //
        if (hasFiles(options.body)) {
          options.encodedBody = new FormData(); 
          addFiles(options.body, options.encodedBody);
        }
        if (options.body instanceof FormData) {
          options.encodedBody = options.body;
        }
        if (options.encodedBody instanceof FormData) {
            // TODO: is this necessary? This breaks in the browser
  //        options.headers["content-type"] = "multipart/form-data";
          return;
        }
  
        if ('string' === typeof options.body) {
          options.encodedBody = options.body;
        }
  
        if (!options.headers["content-type"]) {
          //options.headers["content-type"] = "application/x-www-form-urlencoded";
          options.headers["content-type"] = "application/json";
        }
  
        if ('undefined' !== typeof Buffer) {
          if (options.body instanceof Buffer) {
            options.encodedBody = options.body;
            options.headers["content-type"] = 'application/octect-stream';
          }
        }
  
        if (!options.encodedBody) {
          if (options.headers["content-type"].match(/application\/json/) || 
              options.headers["content-type"].match(/text\/javascript/)) {
            options.encodedBody = JSON.stringify(options.body);
          } else if (options.headers["content-type"].match(/application\/x-www-form-urlencoded/)) {
            options.encodedBody = uriEncodeObject(options.body);
          }
  
          if (!options.encodedBody) {
            throw new Error("'" + options.headers["content-type"] + "'" + "is not yet supported and you have not specified 'encodedBody'");
          }
  
          options.headers["content-length"] = options.encodedBody.length;
        }
      }
  
      function removeContentBodyAndHeaders() {
        if (options.body) {
          throw new Error('You gave a body for one of HEAD, GET, DELETE, or OPTIONS');
        }
  
        options.encodedBody = "";
        options.headers["content-type"] = undefined;
        options.headers["content-length"] = undefined;
        options.headers["transfer-encoding"] = undefined;
        delete options.headers["content-type"];
        delete options.headers["content-length"];
        delete options.headers["transfer-encoding"];
      }
  
      if ('file:' === options.protocol) {
        options.header = undefined;
        delete options.header;
        return;
      }
  
      // Create & Send body
      // TODO support streaming uploads
      options.headers["transfer-encoding"] = undefined;
      delete options.headers["transfer-encoding"];
  
      if (options.body || options.encodedBody) {
        bodyEncoder(options);
      } else { // no body || body not allowed
        removeContentBodyAndHeaders(options);
      }
    }
  
    ahrOptions.handleOptions = function (options) {
      handleUri(options);
      handleHeaders(options);
      handleBody(options);
  
      return options;
    };
  }());
  

  provide("ahr2/options", module.exports);
  provide("ahr2/options", module.exports);
  $.ender(module.exports);
}(global));

// ender:ahr2/browser as ahr2/browser
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
  /*jslint devel: true, debug: true, es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
  // This module is meant for modern browsers. Not much abstraction or 1337 majic
  (function (undefined) {
    "use strict";
  
    var url //= require('url')
      , browserJsonpClient =  require('ahr2/browser/jsonp')
      , triedHeaders = {}
      , nativeHttpClient
      , globalOptions
      , restricted
      , window = require('window')
      , debug = false
      ; // TODO underExtend localOptions
  
    // Restricted Headers
    // http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader-method
    restricted = [
        "Accept-Charset"
      , "Accept-Encoding"
      , "Connection"
      , "Content-Length"
      , "Cookie"
      , "Cookie2"
      , "Content-Transfer-Encoding"
      , "Date"
      , "Expect"
      , "Host"
      , "Keep-Alive"
      , "Referer"
      , "TE"
      , "Trailer"
      , "Transfer-Encoding"
      , "Upgrade"
      , "User-Agent"
      , "Via"
    ];
    restricted.forEach(function (val, i, arr) {
      arr[i] = val.toLowerCase();
    });
  
    if (!window.XMLHttpRequest) {
      window.XMLHttpRequest = function() {
        var ActiveXObject = require('ActiveXObject');
        return new ActiveXObject('Microsoft.XMLHTTP');
      };
    }
    if (window.XDomainRequest) {
      // TODO fix IE's XHR/XDR to act as normal XHR2
      // check if the location.host is the same (name, port, not protocol) as origin
    }
  
  
    function encodeData(options, xhr2) {
      var data
        , ct = options.overrideResponseType || xhr2.getResponseHeader("content-type") || ""
        , text
        , len
        ;
  
      ct = ct.toLowerCase();
  
      if (xhr2.responseType && xhr2.response) {
        text = xhr2.response;
      } else {
        text = xhr2.responseText;
      }
  
      len = text.length;
  
      if ('binary' === ct) {
        if (window.ArrayBuffer && xhr2.response instanceof window.ArrayBuffer) {
          return xhr2.response;
        }
  
        // TODO how to wrap this for the browser and Node??
        if (options.responseEncoder) {
          return options.responseEncoder(text);
        }
  
        // TODO only Chrome 13 currently handles ArrayBuffers well
        // imageData could work too
        // http://synth.bitsnbites.eu/
        // http://synth.bitsnbites.eu/play.html
        // var ui8a = new Uint8Array(data, 0);
        var i
          , ui8a = new Array(len)
          ;
  
        for (i = 0; i < text.length; i += 1) {
          ui8a[i] = (text.charCodeAt(i) & 0xff);
        }
  
        return ui8a;
      }
  
      if (ct.indexOf("xml") >= 0) {
        return xhr2.responseXML;
      }
  
      if (ct.indexOf("jsonp") >= 0 || ct.indexOf("javascript") >= 0) {
        console.log("forcing of jsonp not yet supported");
        return text;
      }
  
      if (ct.indexOf("json") >= 0) {
        try {
          data = JSON.parse(text);
        } catch(e) {
          data = text;
        }
        return data;
      }
  
      return xhr2.responseText;
    }
  
    function browserHttpClient(req, res) {
      var options = req.userOptions
        , xhr2
        , xhr2Request
        , timeoutToken
        ;
  
      function onTimeout() {
        req.emit("timeout", new Error("timeout after " + options.timeout + "ms"));
      }
  
      function resetTimeout() {
        clearTimeout(timeoutToken);
        //timeoutToken = setTimeout(onTimeout, options.timeout);
      }
  
      function sanatizeHeaders(header) {
        var value = options.headers[header]
          , headerLc = header.toLowerCase()
          ;
  
        // only warn the user once about bad headers
        if (-1 !== restricted.indexOf(header.toLowerCase())) {
          if (!triedHeaders[headerLc]) {
            console.warn('Ignoring all attempts to set restricted header ' + header + '. See (http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader-method)');
          }
          triedHeaders[headerLc] = true;
          return;
        }
  
        try {
          // throws INVALID_STATE_ERROR if called before `open()`
          xhr2.setRequestHeader(header, value);
        } catch(e) {
          console.error('failed to set header: ' + header);
          console.error(e);
        }
      }
  
      // A little confusing that the request object gives you
      // the response handlers and that the upload gives you
      // the request handlers, but oh well
      xhr2 = new window.XMLHttpRequest();
      xhr2Request = xhr2.upload;
  
      /* Proper States */
      xhr2.addEventListener('loadstart', function (ev) {
          // this fires when the request starts,
          // but shouldn't fire until the request has loaded
          // and the response starts
          req.emit('loadstart', ev);
          //resetTimeout();
      }, true);
      xhr2.addEventListener('progress', function (ev) {
          if (!req.loaded) {
            req.loaded = true;
            req.emit('progress', {});
            req.emit('load', {});
          }
          if (!res.loadstart) {
            res.headers = xhr2.getAllResponseHeaders();
            res.loadstart = true;
            res.emit('loadstart', ev);
          }
          res.emit('progress', ev);
          //resetTimeout();
      }, true);
      xhr2.addEventListener('load', function (ev) {
        if (xhr2.status >= 400) {
          ev.error = new Error(xhr2.status);
        }
        ev.target.result = encodeData(options, xhr2);
        res.emit('load', ev);
      }, true);
      /*
      xhr2Request.addEventListener('loadstart', function (ev) {
        req.emit('loadstart', ev);
        //resetTimeout();
      }, true);
      */
      xhr2Request.addEventListener('load', function (ev) {
        //resetTimeout();
        req.loaded = true;
        req.emit('load', ev);
        res.loadstart = true;
        res.emit('loadstart', {});
      }, true);
      xhr2Request.addEventListener('progress', function (ev) {
        resetTimeout();
        req.emit('progress', ev);
      }, true);
  
  
      /* Error States */
      xhr2.addEventListener('abort', function (ev) {
        res.emit('abort', ev);
      }, true);
      xhr2Request.addEventListener('abort', function (ev) {
        req.emit('abort', ev);
      }, true);
      xhr2.addEventListener('error', function (ev) {
        res.emit('error', ev);
      }, true);
      xhr2Request.addEventListener('error', function (ev) {
        req.emit('error', ev);
      }, true);
      // the "Request" is what timeouts
      // the "Response" will timeout as well
      xhr2.addEventListener('timeout', function (ev) {
        req.emit('timeout', ev);
      }, true);
      xhr2Request.addEventListener('timeout', function (ev) {
        req.emit('timeout', ev);
      }, true);
  
      /* Cleanup */
      res.on('loadend', function () {
        // loadend is managed by AHR
        req.status = xhr2.status;
        res.status = xhr2.status;
        clearTimeout(timeoutToken);
      });
  
      if (options.username) {
        xhr2.open(options.method, options.href, true, options.username, options.password);
      } else {
        xhr2.open(options.method, options.href, true);
      }
  
      Object.keys(options.headers).forEach(sanatizeHeaders);
  
      setTimeout(function () {
        if ('binary' === options.overrideResponseType) {
          xhr2.overrideMimeType("text/plain; charset=x-user-defined");
          xhr2.responseType = 'arraybuffer';
        }
        try {
          xhr2.send(options.encodedBody);
        } catch(e) {
          req.emit('error', e);
        }
      }, 1);
      
  
      req.abort = function () {
        xhr2.abort();
      };
      res.abort = function () {
        xhr2.abort();
      };
  
      res.browserRequest = xhr2;
      return res;
    }
  
    function send(req, res) {
      var options = req.userOptions;
      // TODO fix this ugly hack
      url = url || require('url');
      if (options.jsonp && options.jsonpCallback) {
        return browserJsonpClient(req, res);
      }
      return browserHttpClient(req, res);
    }
  
    module.exports = send;
  }());
  

  provide("ahr2/browser", module.exports);
  provide("ahr2/browser", module.exports);
  $.ender(module.exports);
}(global));

// ender:ahr2 as ahr2
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
  (function () {
    "use strict";
  
    var EventEmitter = require('events').EventEmitter
      , Future = require('future')
      , Join = require('join')
      , ahrOptions
      , utils
      , preset
      ;
  
    function nextTick(fn, a, b, c, d) {
      try {
        process.nextTick(fn, a, b, c, d);
      } catch(e) {
        setTimeout(fn, 0, a, b, c, d);
      }
    }
  
    ahrOptions =  require('ahr2/options');
    utils =  require('ahr2/utils');
    
    preset = utils.preset;
  
    // The normalization starts here!
    function newEmitter() {
      var emitter = new EventEmitter()
        , promise = Future.create()
        , ev = {
              lengthComputable: false
            , loaded: 0
            , total: undefined
          };
  
      function loadend(ev, errmsg) {
        ev.error = errmsg && new Error(errmsg);
        nextTick(function () {
          emitter.emit('loadend', ev);
        });
      }
  
      emitter.done = 0;
  
      // any error in the quest causes the response also to fail
      emitter.on('loadend', function (ev) {
        emitter.done += 1;
  
        if (emitter.done > 1) {
          console.warn('loadend called ' + emitter.done + ' times');
          return;
        }
  
        // in FF this is only a getter, setting is not allowed
        if (!ev.target) {
          ev.target = {};
        }
  
        promise.fulfill(emitter.error || ev.error, emitter, ev.target.result, ev.error ? false : true);
      });
  
      emitter.on('timeout', function (ev) {
        emitter.error = ev;
        loadend(ev, 'timeout');
      });
  
      emitter.on('abort', function (ev) {
        loadend(ev, 'abort');
      });
  
      emitter.on('error', function (err, evn) {
        // TODO rethrow the error if there are no listeners (incl. promises)
        //if (respEmitter.listeners.loadend) {}
  
        emitter.error = err;
        ev.error = err;
        if (evn) {
          ev.lengthComputable = evn.lengthComputable || true;
          ev.loaded = evn.loaded || 0;
          ev.total = evn.total;
        }
        loadend(ev);
      });
  
      // TODO there can actually be multiple load events per request
      // as is the case with mjpeg, streaming media, and ad-hoc socket-ish things
      emitter.on('load', function (evn) {
        // ensure that `loadend` is after `load` for all interested parties
        loadend(evn);
      });
  
      // TODO 3.0 remove when
      emitter.when = promise.when;
  
      return emitter;
    }
  
  
    // backwards compat
    function ahr(options, callback) {
      return ahr.http(options, callback);
    }
  
    //
    // Emulate `request`
    //
    function abstractHttpRequest(options, callback) {
      var NativeHttpClient
        , req = newEmitter()
        , res = newEmitter()
        ;
  
      if (callback || options.callback) {
        // TODO 3.0 remove when
        return ahr.http(options).when(callback);
      }
  
      if ('string' === typeof options) {
        options = {
          href: options
        };
      }
  
      ahrOptions.handleOptions(options);
  
      // todo throw all the important properties in the request
      req.userOptions = options;
      // in the browser tradition
      res.upload = req;
  
      // if the request fails, then the response must also fail
      req.on('error', function (err, ev) {
        if (!res.error) {
          res.emit('error', err, ev);
        }
      });
      req.on('timeout', function (ev) {
        if (!res.error) {
          res.emit('timeout', ev);
        }
      });
      req.on('abort', function (ev) {
        if (!res.error) {
          res.emit('abort', ev);
        }
      });
  
      try {
        // tricking pakmanager to ignore the node stuff
        var client = './node';
        NativeHttpClient = require(client);
      } catch(e) {
        NativeHttpClient =  require('ahr2/browser');
      }
  
      return NativeHttpClient(req, res);
    }
    ahr.globalOptionKeys = ahrOptions.globalOptionKeys;
    ahr.globalOption = ahrOptions.globalOption;
    ahr.setGlobalOptions = ahrOptions.setGlobalOptions;
    ahr.handleOptions = ahrOptions.handleOptions;
  
  
    // TODO 3.0 remove join
    ahr.join = Join;
  
  
    //
    //
    // All of these convenience methods are safe to cut if needed to save kb
    //
    //
    function allRequests(method, href, query, body, jsonp, options, callback) {
      options = options || {};
  
      if (method) { options.method = method; }
      if (href) {
        // XXX better definition for what a scheme could be
        // I believe that `wtp:localhost` is a valid url
        if (/^[\w\-]{1,8}:.+/.exec(href)) {
          options.href = href;
        } else {
          options.pathname = href;
        }
      }
      if (jsonp) { options.jsonp = jsonp; }
  
      if (query) { options.query = preset((query || {}), (options.query || {})); }
      if (body) { options.body = body; }
  
      return ahr.http(options, callback);
    }
  
    ahr.http = abstractHttpRequest;
    ahr.file = abstractHttpRequest;
    // TODO copy the jquery / reqwest object syntax
    // ahr.ajax = ahr;
  
    // HTTP jQuery-like body-less methods
    ['HEAD', 'GET', 'DELETE', 'OPTIONS'].forEach(function (verb) {
      verb = verb.toLowerCase();
      ahr[verb] = function (href, query, options, callback) {
        return allRequests(verb, href, query, undefined, undefined, options, callback);
      };
    });
  
    // Correcting an oversight of jQuery.
    // POST and PUT can have both query (in the URL) and data (in the body)
    ['POST', 'PUT'].forEach(function (verb) {
      verb = verb.toLowerCase();
      ahr[verb] = function (href, query, body, options, callback) {
        return allRequests(verb, href, query, body, undefined, options, callback);
      };
    });
  
    // JSONP
    ahr.jsonp = function (href, jsonp, query, options, callback) {
      if (!jsonp || 'string' !== typeof jsonp) {
        throw new Error("'jsonp' is not an optional parameter.\n" +
          "If you believe that this should default to 'callback' rather" +
          "than throwing an error, please file a bug");
      }
  
      return allRequests('GET', href, query, undefined, jsonp, options, callback);
    };
  
    // HTTPS
    ahr.https = function (options, callback) {
      if ('string' === typeof options) {
        options = {
          href: options
        };
      }
  
      options.ssl = true;
      options.protocol = "https:";
  
      return ahr.http(options, callback);
    };
  
    ahr.tcp = function (options, callback) {
      if ('string' === typeof options) {
        options = {
          href: options
        };
      }
  
      options.protocol = "tcp:";
  
      return ahr.http(options, callback);
    };
  
    ahr.udp = function (options, callback) {
      if ('string' === typeof options) {
        options = {
          href: options
        };
      }
  
      options.protocol = "udp:";
  
      return ahr.http(options, callback);
    };
  
    module.exports = ahr;
  }());
  

  provide("ahr2", module.exports);
  provide("ahr2", module.exports);
  $.ender(module.exports);
}(global));

// ender:remedial as remedial
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jslint onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true */
  (function () {
      "use strict";
  
      var global = Function('return this')()
        , classes = "Boolean Number String Function Array Date RegExp Object".split(" ")
        , i
        , name
        , class2type = {}
        ;
  
      for (i in classes) {
        if (classes.hasOwnProperty(i)) {
          name = classes[i];
          class2type["[object " + name + "]"] = name.toLowerCase();
        }
      }
  
      function typeOf(obj) {
        return (null === obj || undefined === obj) ? String(obj) : class2type[Object.prototype.toString.call(obj)] || "object";
      }
  
      function isEmpty(o) {
          var i, v;
          if (typeOf(o) === 'object') {
              for (i in o) { // fails jslint
                  v = o[i];
                  if (v !== undefined && typeOf(v) !== 'function') {
                      return false;
                  }
              }
          }
          return true;
      }
  
      if (!String.prototype.entityify) {
          String.prototype.entityify = function () {
              return this.replace(/&/g, "&amp;").replace(/</g,
                  "&lt;").replace(/>/g, "&gt;");
          };
      }
  
      if (!String.prototype.quote) {
          String.prototype.quote = function () {
              var c, i, l = this.length, o = '"';
              for (i = 0; i < l; i += 1) {
                  c = this.charAt(i);
                  if (c >= ' ') {
                      if (c === '\\' || c === '"') {
                          o += '\\';
                      }
                      o += c;
                  } else {
                      switch (c) {
                      case '\b':
                          o += '\\b';
                          break;
                      case '\f':
                          o += '\\f';
                          break;
                      case '\n':
                          o += '\\n';
                          break;
                      case '\r':
                          o += '\\r';
                          break;
                      case '\t':
                          o += '\\t';
                          break;
                      default:
                          c = c.charCodeAt();
                          o += '\\u00' + Math.floor(c / 16).toString(16) +
                              (c % 16).toString(16);
                      }
                  }
              }
              return o + '"';
          };
      } 
  
      if (!String.prototype.supplant) {
          String.prototype.supplant = function (o) {
              return this.replace(/{([^{}]*)}/g,
                  function (a, b) {
                      var r = o[b];
                      return typeof r === 'string' || typeof r === 'number' ? r : a;
                  }
              );
          };
      }
  
      if (!String.prototype.trim) {
          String.prototype.trim = function () {
              return this.replace(/^\s*(\S*(?:\s+\S+)*)\s*$/, "$1");
          };
      }
  
      // CommonJS / npm / Ender.JS
      module.exports = {
          typeOf: typeOf,
          isEmpty: isEmpty
      };
      global.typeOf = global.typeOf || typeOf;
      global.isEmpty = global.isEmpty || isEmpty;
  }());
  

  provide("remedial", module.exports);
  provide("remedial", module.exports);
  $.ender(module.exports);
}(global));

// ender:jsonapi as jsonapi
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jslint es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
  (function () {
    "use strict";
  
    var request = require('ahr2'),
      Future = require('future'),
      querystring = require('querystring'),
      createRestClient;
    /**
     * Scaffold
     *
     * This produces an API skeleton based on the JSON-API doc.
     * When printed as a string this provides a nice starting point for your API
     */
    createRestClient = function (doc) {
      var factory = {};
      // TODO allow for multiple versions
      // TODO move creation params to doc
      factory.create = function (api_key) {
      
        var api = {}, api_req;
        // Base API / REST request
        api_req = function(action, params, options) {
          var promise = Future()
            , result
            ;
  
          // Uses abstractHttpRequest
          params[doc.key.name] = api_key;
          Object.keys(doc.api_params).forEach(function (key) {
            if ('undefined' === typeof params[key]) {
              params[key] = doc.api_params[key];
            }
          });
  
          result = request.jsonp(doc.api_url + action + '?' + querystring.stringify(params), doc.jsonp_callback, params, options);
          result.when(function (err, xhr, data) {
            if (data && data.response && data.response.errors) {
              err = data.response.errors;
            }
            promise.fulfill(err, xhr, data);
          });
          return promise;
        };
        doc.requests.forEach(function (module) {
          // example: CampusBooks.search(params, options);
          api[module.name] = function (params, options) {
            var pdoc = module.parameters,
              promise = Future(),
              validates = true,
              undocumented = [],
              msg = "",
              result;
  
            if (pdoc) {
              // TODO move to validations model
              if (pdoc.required) {
                pdoc.required.forEach(function (pname) {
                  if ('undefined' === typeof params[pname] || !params[pname].toString()) {
                    validates = false;
                    msg += "All of the params '" + pdoc.required.toString() + "' must be specified for the '" + module.name  + "' call.";
                  }
                });
              }
              if ('undefined' !== typeof pdoc.oneOf) {
                Object.keys(params).forEach(function (pname) {
                  var exists = false;
                  pdoc.oneOf.forEach(function (ename) {
                    if (pname === ename) {
                      exists = true;
                    }
                  });
                  if (true !== exists) {
                    undocumented.push(pname);
                  }
                });
                if (0 !== undocumented.length) {
                  validates = false;
                  msg += "The params '" + undocumented.toString() + "' are useless for this call.";
                }
              }
              // TODO end move to validations model block
              
              if (pdoc.validation) {
                validates = pdoc.validation(params);
                msg = validates;
              }
              if (true !== validates) {
                promise.fulfill(msg);
                return promise;
              }
            }
  
            result = api_req(module.name, params, options);
            return result;
          };
        });
        return api;
      };
      return factory;
    };
  
    module.exports = {
      createRestClient: createRestClient
    };
  
  }());
  

  provide("jsonapi", module.exports);
  provide("jsonapi", module.exports);
  $.ender(module.exports);
}(global));

// ender:json-storage as json-storage
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  
    var Store
      , delim = ':'
      ;
  
    function Stringify(obj) {
      var str;
      try {
        str = JSON.stringify(obj);
      } catch(e) {
        str = "";
      }
  
      return str;
    }
  
    function Parse(str) {
      var obj = null;
      try {
        obj = JSON.parse(str);
      } catch(e) {}
  
      return obj;
    }
  
    function escapeRegExp(str) {
      return str.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }
  
    function upgradeStorage(jss, w3cs) {
      var i
        , key
        , val
        , json = {}
        ;
  
      if (jss._store.getItem('_json-storage-namespaced_', true)) {
        return;
      }
  
      // we can't modify the db while were reading or
      // the keys will shift all over the place
      for (i = 0; i < w3cs.length; i += 1) {
        key = w3cs.key(i);
        try {
          val = JSON.parse(w3cs.getItem(key));
        } catch(e) {
          return;
        }
        json[key] = val;
      }
      w3cs.clear();
  
      Object.keys(json).forEach(function (key) {
        jss.set(key, json[key]);
      });
  
      jss._store.setItem('_json-storage-namespaced_', true);
    }
  
    function JsonStorage(w3cStorage, namespace) {
      // called without new or create
      // global will be undefined
      if (!this) {
        return new JsonStorage(w3cStorage, namespace);
      }
  
      // if we didn't always add at least the delimeter
      // then if a keyname with the delim, it would be more
      // complicated to figure it out
      this._namespace = delim;
      this._namespace += (namespace || 'jss');
  
      this._store = w3cStorage;
      this._keysAreDirty = true;
      this._keys = [];
      if (!this._store.getItem('_json-storage-namespaced_')) {
        upgradeStorage(this, w3cStorage);
      }
    }
    Store = JsonStorage;
    
    Store.prototype.clear = function () {
      this._keysAreDirty = true;
      this.keys().forEach(function (key) {
        this.remove(key);
      }, this);
    };
  
    Store.prototype.remove = function (key) {
      this._keysAreDirty = true;
      this._store.removeItem(key + this._namespace);
    };
  
    Store.prototype.get = function (key) {
      return Parse(this._store.getItem(key + this._namespace));
    };
  
    Store.prototype.set = function (key, val) {
      this._keysAreDirty = true;
      return this._store.setItem(key + this._namespace, Stringify(val));
    };
  
    Store.prototype.keys = function () {
      var i
        , key
        , delimAt
        ;
  
      if (!this._keysAreDirty) {
        return this._keys.concat([]);
      }
  
      this._keys = [];
      for (i = 0; i < this._store.length; i += 1) {
        key = this._store.key(i) || '';
  
        delimAt = key.lastIndexOf(this._namespace);
        // test if this key belongs to this widget
        if (-1 !== delimAt) {
          this._keys.push(key.substr(0, delimAt));
        }
      }
      this._keysAreDirty = false;
  
      return this._keys.concat([]);
    };
  
    Store.prototype.size = function () {
      return this._store.length;
    };
  
    Store.prototype.toJSON = function () {
      var json = {}
        ;
  
      this.keys().forEach(function (key) {
        json[key] = this.get(key);
      }, this);
  
      return json;
    };
  
    Store.create = function (w3cStorage, namespace) {
      return new JsonStorage(w3cStorage, namespace);
    }
  
    module.exports = Store;
  }());
  

  provide("json-storage", module.exports);
  provide("json-storage", module.exports);
  $.ender(module.exports);
}(global));

// ender:serialize-form as serialize-form
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  
    function serializeForm(formid, toNativeType) {
      var els = []; 
  
      function handleElement(e) {
        var name = $(e).attr('name')
          , value = $(e).val()
          ;   
  
        if (toNativeType) {
          value = Number(value) || value;
        }
        if ('true' === value) {
          value = true;
        }
        if ('false' === value) {
          value = false;
        }
        if ('null' === value) {
          value = null;
        }
        /*
        // Not yet convinced that this is a good idea
        if ('undefined' === value) {
          value = undefined;
        }
        */
  
        if (!name || '' === value) {
          return;
        }   
  
        els.push({
            name: name
          , value: value
        }); 
      }   
  
      // TODO insert these in the array in the order
      // they appear in the form rather than by element
      $(formid + ' input').forEach(handleElement);
      $(formid + ' select').forEach(handleElement);
      $(formid + ' textarea').forEach(handleElement);
  
      return els;
    }
  
    // Note that this is a potentially lossy conversion.
    // By convention arrays are specified as `xyz[]`,
    // but objects have no such standard
    function mapFormData(data) {
      var obj = {}; 
  
      function map(datum) {
        var arr
          , name
          , len
          ;
  
        name = datum.name;
        len = datum.name.length;
  
        if ('[]' === datum.name.substr(len - 2)) {
          name = datum.name.substr(0, len - 2);
          arr = obj[name] = (obj[name] || []);
          arr.push(datum.value);
        } else {
          obj[datum.name] = datum.value;
        }
      }   
  
      data.forEach(map);
  
      return obj;
    }
  
    function serializeFormObject() {
      return mapFormData(serializeForm.apply(null, arguments));
    }
  
    function serializeFormUriEncoded() {
      var data = serializeForm.apply(null, arguments)
        , str = ''
        ;
  
      data.forEach(function (obj) {
        str += '&' + encodeURIComponent(obj.name) + '=' + encodeURIComponent(obj.value);
      });
      
      // remove leading '&'
      str = str.substr(1);
  
      return str;
    }
  
    module.exports.serializeForm = serializeForm;
    module.exports.serializeFormUriEncoded = serializeFormUriEncoded;
    module.exports.serializeFormArray = serializeForm;
    module.exports.serializeFormObject = serializeFormObject;
  }());
  

  provide("serialize-form", module.exports);
  provide("serialize-form", module.exports);
  $.ender(module.exports);
}(global));

// ender:md5 as md5
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  /**
   * md5.js
   * Copyright (c) 2011, Yoshinori Kohyama (http://algobit.jp/)
   * all rights reserved.
   */
  
  exports.digest = function (M) {
    var originalLength
      , i
      , j
      , k
      , l
      , A
      , B
      , C
      , D
      , AA
      , BB
      , CC
      , DD
      , X
      , rval
      ;
  
  	function F(x, y, z) { return (x & y) | (~x & z); }
  	function G(x, y, z) { return (x & z) | (y & ~z); }
  	function H(x, y, z) { return x ^ y ^ z;          }
  	function I(x, y, z) { return y ^ (x | ~z);       }
  
  	function to4bytes(n) {
  		return [n&0xff, (n>>>8)&0xff, (n>>>16)&0xff, (n>>>24)&0xff];
  	}
  
  	originalLength = M.length; // for Step.2
  
  	// 3.1 Step 1. Append Padding Bits
  	M.push(0x80);
  	l = (56 - M.length)&0x3f;
  	for (i = 0; i < l; i++)
  		M.push(0);
  
  	// 3.2 Step 2. Append Length
  	to4bytes(8*originalLength).forEach(function (e) { M.push(e); });
  	[0, 0, 0, 0].forEach(function (e) { M.push(e); });
  
  	// 3.3 Step 3. Initialize MD Buffer
  	A = [0x67452301];
  	B = [0xefcdab89];
  	C = [0x98badcfe];
  	D = [0x10325476];
  
  	// 3.4 Step 4. Process Message in 16-Word Blocks
  	function rounds(a, b, c, d, k, s, t, f) {
  		a[0] += f(b[0], c[0], d[0]) + X[k] + t;
  		a[0] = ((a[0]<<s)|(a[0]>>>(32 - s)));
  		a[0] += b[0];
  	}
  
  	for (i = 0; i < M.length; i += 64) {
  		X = [];
  		for (j = 0; j < 64; j += 4) {
  			k = i + j;
  			X.push(M[k]|(M[k + 1]<<8)|(M[k + 2]<<16)|(M[k + 3]<<24));
  		}
  		AA = A[0];
  		BB = B[0];
  		CC = C[0];
  		DD = D[0];
  
  		// Round 1.
  		rounds(A, B, C, D,  0,  7, 0xd76aa478, F);
  		rounds(D, A, B, C,  1, 12, 0xe8c7b756, F);
  		rounds(C, D, A, B,  2, 17, 0x242070db, F);
  		rounds(B, C, D, A,  3, 22, 0xc1bdceee, F);
  		rounds(A, B, C, D,  4,  7, 0xf57c0faf, F);
  		rounds(D, A, B, C,  5, 12, 0x4787c62a, F);
  		rounds(C, D, A, B,  6, 17, 0xa8304613, F);
  		rounds(B, C, D, A,  7, 22, 0xfd469501, F);
  		rounds(A, B, C, D,  8,  7, 0x698098d8, F);
  		rounds(D, A, B, C,  9, 12, 0x8b44f7af, F);
  		rounds(C, D, A, B, 10, 17, 0xffff5bb1, F);
  		rounds(B, C, D, A, 11, 22, 0x895cd7be, F);
  		rounds(A, B, C, D, 12,  7, 0x6b901122, F);
  		rounds(D, A, B, C, 13, 12, 0xfd987193, F);
  		rounds(C, D, A, B, 14, 17, 0xa679438e, F);
  		rounds(B, C, D, A, 15, 22, 0x49b40821, F);
  
  		// Round 2.
  		rounds(A, B, C, D,  1,  5, 0xf61e2562, G);
  		rounds(D, A, B, C,  6,  9, 0xc040b340, G);
  		rounds(C, D, A, B, 11, 14, 0x265e5a51, G);
  		rounds(B, C, D, A,  0, 20, 0xe9b6c7aa, G);
  		rounds(A, B, C, D,  5,  5, 0xd62f105d, G);
  		rounds(D, A, B, C, 10,  9, 0x02441453, G);
  		rounds(C, D, A, B, 15, 14, 0xd8a1e681, G);
  		rounds(B, C, D, A,  4, 20, 0xe7d3fbc8, G);
  		rounds(A, B, C, D,  9,  5, 0x21e1cde6, G);
  		rounds(D, A, B, C, 14,  9, 0xc33707d6, G);
  		rounds(C, D, A, B,  3, 14, 0xf4d50d87, G);
  		rounds(B, C, D, A,  8, 20, 0x455a14ed, G);
  		rounds(A, B, C, D, 13,  5, 0xa9e3e905, G);
  		rounds(D, A, B, C,  2,  9, 0xfcefa3f8, G);
  		rounds(C, D, A, B,  7, 14, 0x676f02d9, G);
  		rounds(B, C, D, A, 12, 20, 0x8d2a4c8a, G);
  
  		// Round 3.
  		rounds(A, B, C, D,  5,  4, 0xfffa3942, H);
  		rounds(D, A, B, C,  8, 11, 0x8771f681, H);
  		rounds(C, D, A, B, 11, 16, 0x6d9d6122, H);
  		rounds(B, C, D, A, 14, 23, 0xfde5380c, H);
  		rounds(A, B, C, D,  1,  4, 0xa4beea44, H);
  		rounds(D, A, B, C,  4, 11, 0x4bdecfa9, H);
  		rounds(C, D, A, B,  7, 16, 0xf6bb4b60, H);
  		rounds(B, C, D, A, 10, 23, 0xbebfbc70, H);
  		rounds(A, B, C, D, 13,  4, 0x289b7ec6, H);
  		rounds(D, A, B, C,  0, 11, 0xeaa127fa, H);
  		rounds(C, D, A, B,  3, 16, 0xd4ef3085, H);
  		rounds(B, C, D, A,  6, 23, 0x04881d05, H);
  		rounds(A, B, C, D,  9,  4, 0xd9d4d039, H);
  		rounds(D, A, B, C, 12, 11, 0xe6db99e5, H);
  		rounds(C, D, A, B, 15, 16, 0x1fa27cf8, H);
  		rounds(B, C, D, A,  2, 23, 0xc4ac5665, H);
  
  		// Round 4.
  		rounds(A, B, C, D,  0,  6, 0xf4292244, I);
  		rounds(D, A, B, C,  7, 10, 0x432aff97, I);
  		rounds(C, D, A, B, 14, 15, 0xab9423a7, I);
  		rounds(B, C, D, A,  5, 21, 0xfc93a039, I);
  		rounds(A, B, C, D, 12,  6, 0x655b59c3, I);
  		rounds(D, A, B, C,  3, 10, 0x8f0ccc92, I);
  		rounds(C, D, A, B, 10, 15, 0xffeff47d, I);
  		rounds(B, C, D, A,  1, 21, 0x85845dd1, I);
  		rounds(A, B, C, D,  8,  6, 0x6fa87e4f, I);
  		rounds(D, A, B, C, 15, 10, 0xfe2ce6e0, I);
  		rounds(C, D, A, B,  6, 15, 0xa3014314, I);
  		rounds(B, C, D, A, 13, 21, 0x4e0811a1, I);
  		rounds(A, B, C, D,  4,  6, 0xf7537e82, I);
  		rounds(D, A, B, C, 11, 10, 0xbd3af235, I);
  		rounds(C, D, A, B,  2, 15, 0x2ad7d2bb, I);
  		rounds(B, C, D, A,  9, 21, 0xeb86d391, I);
  
  		A[0] += AA;
  		B[0] += BB;
  		C[0] += CC;
  		D[0] += DD;
  	}
  
  	rval = [];
  	to4bytes(A[0]).forEach(function (e) { rval.push(e); });
  	to4bytes(B[0]).forEach(function (e) { rval.push(e); });
  	to4bytes(C[0]).forEach(function (e) { rval.push(e); });
  	to4bytes(D[0]).forEach(function (e) { rval.push(e); });
  
  	return rval;
  }
  
  exports.digest_s = function (s) {
  	var M = []
      , i
      , d
      , rstr
      , s
      ;
  
  	for (i = 0; i < s.length; i++)
  		M.push(s.charCodeAt(i));
  
  	d = exports.digest(M);
  	rstr = '';
  
  	d.forEach(function (e) {
  		s = e.toString(16);
  		while (s.length < 2)
  			s = '0' + s;
  		rstr += s;
  	});
  
  	return rstr;
  }
  
  }());
  

  provide("md5", module.exports);
  provide("md5", module.exports);
  $.ender(module.exports);
}(global));

// ender:campusbooks as campusbooks
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jslint es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
  (function () {
    "use strict";
  
    var jsonapi = require('jsonapi'),
      CampusBooks = {},
      documentation;
  
    /**
     * Documention
     * TODO: list all params
     * 
     */
    documentation = {
      requests: [
        {
          name: "constants",
          description: "The Constants call just returns a list of each of the types of constants, and their available id/value pairs",
          parameters: {
            oneOf: []
          }
        },
        {
          name: "prices",
          parameters: {
            oneOf: [
              "isbn"
            ],
            required: [
              "isbn"
            ]
          },
          description: "The prices call requires a single valid ISBN to be passed in via a 'isbn' parameter:\n" +
            "<br/>\n" +
            "<pre>http://api.campusbooks.com/10/rest/prices?key=YOUR_API_KEY_HERE&isbn=ISBN_HERE</pre>\n" +
            "<br/>\n" +
            "It returns groupings for each condition where each group contains multiple offers.\n" + 
            "Each offer contains the following fields:",
          response: [
            {
              name: "isbn",
              description: "The thirteen digit ISBN for this offer"
            },
            {
              name: "merchant_id",
              description: "A numeric merchant ID (Note, this value may be signed)"
            },
            {
              name: "merchant_name",
              description: "The Name of the merchant (looked up from the defined constants)"
            },
            {
              name: "merchant_image",
              description: "URL of the merchant logo"
            },
            {
              name: "price",
              description: "The price that this merchant is listing this item for"
            },
            {
              name: "shipping_ground",
              description: "The cost to ship to an address in the US via ground services"
            },
            {
              name: "total_price",
              description: "Seller price plus the ground shipping price"
            },
            {
              name: "link",
              description: "Link to purchase the book"
            },
            {
              name: "condition_id",
              description: "Numeric representation of the condition (see constants)"
            },
            {
              name: "condition_text",
              description: "Text representation of the condition"
            },
            {
              name: "availability_id",
              description: "Numeric representation of the availability (how long it takes for the seller to ship it)"
            },
            {
              name: "availability_text",
              description: "Text representation of the availability"
            },
            {
              name: "location",
              description: "Geographic location where this item ships from (not always present)"
            },
            {
              name: "their_id",
              description: "The merchant's id for this offer (not always present)"
            },
            {
              name: "comments",
              description: "Comments about this offering"
            },
            {
              name: "condition_text",
              description: "Text representation of the condition"
            },
            {
              name: "rental_detail",
              description: "This node is available only for offers from book rental companies.\n" + 
                "If available, each sub-node indicates a price for one of three rental periods (SEMESTER, TERM, or SUMMER)",
              values: [
                {
                  name: "days",
                  description: "The exact number of days that this book may be rented for"
                },
                {
                  name: "price",
                  description: "The price for this rental period"
                },
                {
                  name: "link",
                  description: "A link that will take the visitor to a page specific to this rental period\n" + 
                    "(if supported by the merchant)"
                }
              ]
            }
          ]
        },
        {
          name: "bookinfo",
          parameters: {
            oneOf: [
              "isbn",
              "image_height",
              "image_width"
            ],
            required: [
              "isbn"
            ]
          },
          description: "The bookinfo call requires a single valid ISBN to be passed in via a 'isbn' parameter:\n" +
            "<br/>\n" +
            "<pre>http://api.campusbooks.com/10/rest/bookinfo?key=YOUR_API_KEY_HERE&isbn=0824828917[&image_height=HEIGHT][&image_width=WIDTH]</pre>\n" +
            "<br/>\n" +
            "It returns a 'page' element with all of the book attributes.",
          response: [
            {
              name: "isbn10",
              description: "Ten-Digit ISBN for this book"
            },
            {
              name: "isbn13",
              description: "Thirteen-Digit ISBN for this book"
            },
            {
              name: "title",
              description: "Book Title"
            },
            {
              name: "author",
              description: "Book Author"
            },
            {
              name: "binding",
              description: "Book Binding"
            },
            {
              name: "msrp",
              description: "List price for the book"
            },
            {
              name: "pages",
              description: "Number of pages in the book"
            },
            {
              name: "publisher",
              description: "Book Publisher"
            },
            {
              name: "published_date",
              description: "Published Date"
            },
            {
              name: "edition",
              description: "Book Edition (ie: 2nd, 3rd, etc)"
            },
            {
              name: "description",
              description: "A text description for the book"
            }
          ]
        },
        {
          name: "search",
          cimplate: "div.book",
          values: {
            "image": ".image[src={value}]",
            "title": ".title",
            "author": ".author",
            "isbn10": ".isbn10",
            "isbn13": ".isbn13",
            "edition": ".edition"
          },
          render: function (result) {
            var me = this,
              dimplset = [];
  
            function find_or_create(css) {
              // parse css
              // loop through from parentto child
              // find
              // if length 0, create in parent (or body)
            }
            //try {
              result.response.page.results.book.forEach(function (book) {
                var html = $('#templates ' + me.cimplate).clone();
                Object.keys(book).forEach(function (key) {
                  // TODO parse css to produce subtemplates
                  if ("image" === key) {
                    html.find('.'+key).attr("src", book[key]);
                    return;
                  }
                  html.find('.'+key).html(book[key]);
                });
                dimplset.push(html);
              });
            //} catch(e) {}
            return dimplset;
          },
          parameters: {
            oneOf: [
              "author",
              "title",
              "keywords",
              "page",
              "image_height",
              "image_width"
            ],
            validation: function(parameters) {
              var msg = true;
              if (0 === parameters.length) {
                msg = "you must specify at least one search parameter";
              }
              return msg;
            }
          },
          description: "The search call can be used to do an author, title, or keyword search.\n" +
            "It returns a list of books that match the search criteria\n" +
            "<br/>\n" +
            "<pre>http://api.campusbooks.com/10/rest/search?key=YOUR_API_KEY_HERE&[&author=AUTHOR][&title=TITLE][&keywords=KEYWORDS][&page=1][&image_height=HEIGHT][&image_width=WIDTH]</pre>\n" +
            "<br/>\n" +
            "At least one of 'author', 'title', or 'keywords' must be specified.\n" +
            "The result contains up to 10 results on the page. You can specify a page with the 'page' parameter'",
          response: [
            {
              name: "count",
              description: "The number of results for your search results (only 10 are displayed on this page)"
            },
            {
              name: "pages",
              description: "The number of pages of results available"
            },
            {
              name: "current_page",
              description: "The current page you are on"
            },
            {
              name: "results",
              description: "A list of books. The format of each is the same as from the bookinfo call defined above"
            }
          ]
        },
        {
          name: "bookprices",
          parameters: {
            oneOf: [
              "isbn",
              "image_height",
              "image_width"
            ],
            required: [
              "isbn"
            ]
          },
          description: "This function combines the bookinfo and prices functions into a single call.\n" +
            " It requires an ISBN and returns the book information as well as all of the pricing data\n" +
            "<br/>\n" +
            "<pre>http://api.campusbooks.com/10/rest/bookprices?key=YOUR_API_KEY_HERE&isbn=ISBN[&image_height=HEIGHT][&image_width=WIDTH]</pre>\n",
          response: [
            {
              name: "book",
              description: "A book item. The contents of this item are the same as which is returned with the bookinfo function"
            },
            {
              name: "offers",
              description: "This node contains all of the pricing data that a call to the price function returns"
            }
          ]
        },
        {
          name: "buybackprices",
          parameters: {
            oneOf: [
              "isbn",
              "image_height",
              "image_width"
            ],
            required: [
              "isbn"
            ]
          },
          description: "This function combines the bookinfo request with buyback pricing information.\n" +
            "It requires an ISBN and returns buyback prices for all of the merchants that you have enabled." +
            "<br/>\n" +
            "<pre>http://api.campusbooks.com/10/rest/buybackprices?key=YOUR_API_KEY_HERE&isbn=ISBN[&image_height=HEIGHT][&image_width=WIDTH]</pre>\n",
          response: [
            {
              name: "book",
              description: "A book item. The contents of this item are the same as which is returned with the bookinfo function"
            },
            {
              name: "offers",
              description: "This node contains an array of merchant nodes, each with the following structure",
              values: [
                {
                  name: "merchant_id",
                  description: "A numeric merchant ID"
                },
                {
                  name: "merchant_image",
                  description: "URL of the merchant logo"
                },
                {
                  name: "name",
                  description: "The name of the merchant"
                },
                {
                  name: "notes",
                  description: "A text description about this merchant. It contains payment and shipping information about this merchant"
                },
                {
                  name: "prices",
                  description: "prices contains a price node for each condition (new and used)"
                },
                {
                  name: "link",
                  description: "The link for directing visitors to this merchant."
                }
              ]
            }
          ],
          example: "<pre><code>" +
            "&lt;merchant&gt;" +
            "    &lt;merchant_id&gt;108&lt;/merchant_id&gt;" +
            "    &lt;merchant_image&gt;http://www.campusbooks.com/images/markets/firstclassbooks.gif&lt;/merchant_iamge&gt;" +
            "    &lt;name&gt;First Class Books&lt;/name&gt;" +
            "    &lt;notes&gt;Free shipping via USPS or FedEx. Books must be ....&lt;/notes&gt;" +
            "    &lt;prices&gt;" +
            "        &lt;price condition=\"new\"&gt;13.55&lt;/price&gt;" +
            "        &lt;price condition=\"used\"&gt;13.55&lt;/price&gt;" +
            "        &lt;/prices&gt;" +
            "    &lt;link&gt; http://partners.campusbooks.com/link.php?params=b3...&lt;/link&gt;" +
            "&lt;/merchant&gt;" +
          "</code></pre>"
        },
        {
          name: "merchant",
          parameters: {
            oneOf: [
              "buyback",
              "coupons"
            ]
          },
          description: "This function returns a list of merchants and their home page links you can use for direct promotions.\n" +
            "It can also return a list of available coupons for that merchant" +
            "<br/>\n" +
            "<pre>http://api.campusbooks.com/10/rest/merchants?key=YOUR_API_KEY_HERE[&coupons][&buyback=TYPE]</pre>\n",
          response: [
            {
              name: "name", 
              description: "The name of the merchant"
            },
            {
              name: "type",
              description: "The type of the merchant (BUY, BUYBACK)"
            },
            {
              name: "merchant_id",
              description: "A numeric merchant ID"
            },
            {
              name: "homepage_link",
              description: "A link for directing visitors to this merchants homepage"
            },
            {
              name: "coupon",
              description: "This node contains the coupon information"
            }
          ]
        }
      ],
      version: "10",
      compatible: ["10","9","8","7","6","5","4","3","2","1"],
      jsonp_callback: "callback",
      api_url: "http://api.campusbooks.com/10/rest/",
      api_params: {
        format: "json"
      },
      required_keys: [
        "api"
      ],
      key: {
        name: "key"
      }
    };
  
    CampusBooks = jsonapi.createRestClient(documentation);
    CampusBooks.documentation = documentation;
  
    module.exports = CampusBooks
  }());
  

  provide("campusbooks", module.exports);
  provide("campusbooks", module.exports);
  $.ender(module.exports);
}(global));

// ender:isbn as isbn
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  module = module || window;
  exports = exports || window;
  module.exports = exports;
  
  (function () {
    "use strict";
  
  var ISBN = {
    VERSION: '0.01',
    GROUPS: {
      '0': {
        'name': 'English speaking area',
        'ranges': [['00', '19'], ['200', '699'], ['7000', '8499'], ['85000', '89999'], ['900000', '949999'], ['9500000', '9999999']]
      },
      '1': {
        'name': 'English speaking area',
        'ranges': [['00', '09'], ['100', '399'], ['4000', '5499'], ['55000', '86979'], ['869800', '998999']]
      },
      '4': {
        'name': 'Japan',
        'ranges': [['00','19'], ['200','699'], ['7000','8499'], ['85000','89999'], ['900000','949999'], ['9500000','9999999']]
      }
    },
  
    isbn: function () {
      this.initialize.apply(this, arguments);
    },
  
    parse: function(val, groups) {
      var me = new ISBN.isbn(val, groups ? groups : ISBN.GROUPS);
      return me.isValid() ? me : null;
    },
  
    hyphenate: function(val) {
      var me = ISBN.parse(val);
      return me ? me.isIsbn13() ? me.asIsbn13(true) : me.asIsbn10(true) : null;
    },
  
    asIsbn13: function(val, hyphen) {
      var me = ISBN.parse(val);
      return me ? me.asIsbn13(hyphen) : null;
    },
  
    asIsbn10: function(val, hyphen) {
      var me = ISBN.parse(val);
      return me ? me.asIsbn10(hyphen) : null;
    }
  };
  
  ISBN.isbn.prototype = {
    isValid: function() {
      return this.codes && this.codes.isValid;
    },
  
    isIsbn13: function() {
      return this.isValid() && this.codes.isIsbn13;
    },
  
    isIsbn10: function() {
      return this.isValid() && this.codes.isIsbn10;
    },
  
    asIsbn10: function(hyphen) {
      return this.isValid() ? hyphen ? this.codes.isbn10h : this.codes.isbn10 : null;
    },
  
    asIsbn13: function(hyphen) {
      return this.isValid() ? hyphen ? this.codes.isbn13h : this.codes.isbn13 : null;
    },
  
    initialize: function(val, groups) {
      this.groups = groups;
      this.codes = this.parse(val);
    },
  
    merge: function(lobj, robj) {
      var key;
      if (!lobj || !robj) {
        return null;
      }
      for (key in robj) {
        if (robj.hasOwnProperty(key)) {
          lobj[key] = robj[key];
        }
      }
      return lobj;
    },
  
    parse: function(val) {
      var ret;
      // correct for misplaced hyphens
      // val = val.replace(/ -/,'');
      ret =
        val.match(/^\d{9}[\dX]$/) ?
          this.fill(
            this.merge({source: val, isValid: true, isIsbn10: true, isIsbn13: false}, this.split(val))) :
        val.length === 13 && val.match(/^(\d+)-(\d+)-(\d+)-([\dX])$/) ?
          this.fill({
            source: val, isValid: true, isIsbn10: true, isIsbn13: false, group: RegExp.$1, publisher: RegExp.$2,
            article: RegExp.$3, check: RegExp.$4}) :
        val.match(/^(978|979)(\d{9}[\dX]$)/) ?
          this.fill(
            this.merge({source: val, isValid: true, isIsbn10: false, isIsbn13: true, prefix: RegExp.$1},
            this.split(RegExp.$2))) :
        val.length === 17 && val.match(/^(978|979)-(\d+)-(\d+)-(\d+)-([\dX])$/) ?
          this.fill({
            source: val, isValid: true, isIsbn10: false, isIsbn13: true, prefix: RegExp.$1, group: RegExp.$2,
            publisher: RegExp.$3, article: RegExp.$4, check: RegExp.$5}) :
          null;
  
      if (!ret) {
        return {source: val, isValid: false};
      }
  
      return this.merge(ret, {isValid: ret.check === (ret.isIsbn13 ? ret.check13 : ret.check10)});
    },
  
    split: function(isbn) {
      return (
        !isbn ?
          null :
        isbn.length === 13 ?
          this.merge(this.split(isbn.substr(3)), {prefix: isbn.substr(0, 3)}) :
        isbn.length === 10 ?
          this.splitToObject(isbn) :
          null);
    },
  
    splitToArray: function(isbn10) {
      var rec, key, rest, i, m;
      rec = this.getGroupRecord(isbn10);
      if (!rec) {
        return null;
      }
  
      for (key, i = 0, m = rec.record.ranges.length; i < m; i += 1) {
        key = rec.rest.substr(0, rec.record.ranges[i][0].length);
        if (rec.record.ranges[i][0] <= key && rec.record.ranges[i][1] >= key) {
          rest = rec.rest.substr(key.length);
          return [rec.group, key, rest.substr(0, rest.length - 1), rest.charAt(rest.length - 1)];
        }
      }
      return null;
    },
  
    splitToObject: function(isbn10) {
      var a = this.splitToArray(isbn10);
      if (!a || a.length !== 4) {
        return null;
      }
      return {group: a[0], publisher: a[1], article: a[2], check: a[3]};
    },
  
    fill: function(codes) {
      var rec, prefix, ck10, ck13, parts13, parts10;
  
      if (!codes) {
        return null;
      }
  
      rec = this.groups[codes.group];
      if (!rec) {
        return null;
      }
  
      prefix = codes.prefix ? codes.prefix : '978';
      ck10 = this.calcCheckDigit([
        codes.group, codes.publisher, codes.article].join(''));
      if (!ck10) {
        return null;
      }
  
      ck13 = this.calcCheckDigit([prefix, codes.group, codes.publisher, codes.article].join(''));
      if (!ck13) {
        return null;
      }
  
      parts13 = [prefix, codes.group, codes.publisher, codes.article, ck13];
      this.merge(codes, {
        isbn13: parts13.join(''),
        isbn13h: parts13.join('-'),
        check10: ck10,
        check13: ck13,
        groupname: rec.name
      });
  
      if (prefix === '978') {
        parts10 = [codes.group, codes.publisher, codes.article, ck10];
        this.merge(codes, {isbn10: parts10.join(''), isbn10h: parts10.join('-')});
      }
  
      return codes;
    },
  
    getGroupRecord: function(isbn10) {
      var key;
      for (key in this.groups) {
        if (isbn10.match('^' + key + '(.+)')) {
          return {group: key, record: this.groups[key], rest: RegExp.$1};
        }
      }
      return null;
    },
  
    calcCheckDigit: function(isbn) {
      var c, n;
      if (isbn.match(/^\d{9}[\dX]?$/)) {
        c = 0;
        for (n = 0; n < 9; n += 1) {
          c += (10 - n) * isbn.charAt(n);
        }
        c = (11 - c % 11) % 11;
        return c === 10 ? 'X' : String(c);
  
      } else if (isbn.match(/(?:978|979)\d{9}[\dX]?/)) {
        c = 0;
        for (n = 0; n < 12; n += 2) {
          c += Number(isbn.charAt(n)) + 3 * isbn.charAt(n + 1);
        }
        return String((10 - c % 10) % 10);
      }
  
      return null;
    }
  };
  
    exports.ISBN = ISBN;
  }());
  

  provide("isbn", module.exports);
  provide("isbn", module.exports);
  $.ender(module.exports);
}(global));

// ender:blyph-client/lib/target-info as blyph-client/lib/target-info
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  
    module.exports = function () {
      return location.protocol + '//' + location.host + location.pathname;
    };
  }());
  

  provide("blyph-client/lib/target-info", module.exports);
  provide("blyph-client/lib/target-info", module.exports);
  $.ender(module.exports);
}(global));

// ender:blyph-client/lib/cache as blyph-client/lib/cache
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  
    var localStorage = require('localStorage')
      , JsonStorage = require('json-storage')
      , jsonStorage = JsonStorage(localStorage)
      ;
  
    module.exports = jsonStorage;
  }());
  

  provide("blyph-client/lib/cache", module.exports);
  provide("blyph-client/lib/cache", module.exports);
  $.ender(module.exports);
}(global));

// ender:blyph-client/lib/booklist as blyph-client/lib/booklist
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  
    var request = require('ahr2')
      , targetInfo =  require('blyph-client/lib/target-info')
      , Future = require('future')
      , cache =  require('blyph-client/lib/cache')
      ;
  
    function Booklist(user) {
      var self = this
        ;
  
      self.staletime = Date.now();
  
      // prevent circular reference to user
      // but still allow non-logged in users to work
      self.getUrl = function () {
        return user.userToken ? ('booklist/' + user.userToken) : null;
      }
  
      self.getUser = function () {
        return user;
      }
  
      self.list = (cache.get('booklist'));
    }
  
    Booklist.prototype.keepAlive = function () {
      // TODO setInterval to freshen by retrieval
      // 5 minutes from now
      self.staletime = Date.now() + (5 * 60 * 1000);
    };
  
    Booklist.prototype.get = function () {
      var self = this
        , future = Future()
        , url = self.getUrl()
        , saved
        ;
  
      // TODO grace period between stale data and useless data
      if (!url || (self.list && Date.now() < self.staletime)) {
        future.fulfill(null, self.list);;
        return future;
      }
  
      request.get(targetInfo() + url).when(function (err, ahr, data) {
        // TODO merge previous with new
        if (data.error) {
          alert(data.errors);
        }
  
        self.list = data.result.booklist
        cache.set('booklist', self.list);
  
        self.keepAlive();
        future.fulfill(err, self.list);
      });
  
      return future;
    };
  
    //Booklist.prototype.add
    //Booklist.prototype.remove
  
    Booklist.prototype.save = function (list, _future) {
      var self = this
        , future = _future || Future()
        , url = self.getUrl()
        ;
  
      if (!url) {
        cache.set('booklist', self.list);
        future.fulfill();
        return future;
      }
  
      if (self.pending) {
        clearTimeout(self.pending);
  
        self.pending = setTimeout(function () {
          self.pending = false;
          self.save(list || self.list, future);
        }, 5 * 1000);
  
        return future;
      }
      self.pending = true;
  
      request.post(targetInfo() + url, null, {
          booklist: JSON.stringify({
              userToken: self.getUser().userToken
            , timestamp: Date.now()
            // TODO add 'booklist' serverside
            , type: 'booklist'
            , booklist: self.list
          })
      }).when(function (err, ahr, data) {
        console.log('booklist post', data);
        setTimeout(function () {
          self.pending = false;
        }, 5 * 1000);
        // 5 minutes from now
        self.keepAlive();
        future.fulfill(err);
      });
  
      return future;
    };
  
    Booklist.create = function (user) {
      return new Booklist(user);
    };
  
    module.exports = Booklist;
  }());
  

  provide("blyph-client/lib/booklist", module.exports);
  provide("blyph-client/lib/booklist", module.exports);
  $.ender(module.exports);
}(global));

// ender:blyph-client/lib/regexp-escape as blyph-client/lib/regexp-escape
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  
    function escapeRegExp(str) {
      return str.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }
  
    module.exports = escapeRegExp;
  }());
  

  provide("blyph-client/lib/regexp-escape", module.exports);
  provide("blyph-client/lib/regexp-escape", module.exports);
  $.ender(module.exports);
}(global));

// ender:blyph-client/lib/user as blyph-client/lib/user
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  // Test Data
  // http://blyph.com/booklist/0a8b345ddcfc5401f578c850442f1e1b
  (function () {
    "use strict";
  
    var request = require('ahr2')
      , EventEmitter = require('events').EventEmitter
      , MD5 = require('md5')
      , Future = require('future')
      , Booklist =  require('blyph-client/lib/booklist')
      , targetInfo =  require('blyph-client/lib/target-info')
      , cache =  require('blyph-client/lib/cache')
      ;
  
    function User() {
      var self = this
        , saved
        ;
  
      self.events = new EventEmitter();
      // TODO why is this of type Object rather than Booklist?
      self.booklist = Booklist.create(self);
  
      saved = cache.get('user');
  
      if (saved) {
        Object.keys(saved).forEach(function (key) {
          self[key] = saved[key];
        });
      }
  
      if (!saved || !saved.email || !saved.school) {
        return;
      }
  
      self.login(saved.email, saved.school);
    }
  
    User.prototype.login = function (email, school) {
      var err
        , self = this
        , future = Future()
        ;
  
      self.email = email.trim().toLowerCase();
      self.nickname = self.email.replace(/@.*/, '');
      self.school = school || self.school;
  
      if (/@/.exec(self.email)) {
        self.userToken = MD5.digest_s(self.email);
      } else {
        self.error = new Error('Invalid User Token');
      }
  
      self.gravatar = 'http://www.gravatar.com/avatar/' + self.userToken + '?s=50&r=pg&d=identicon';
  
      if (self.isLoggedIn) {
        console.warn('Why are you trying to login again?');
        future.fulfill(null, self);
        return future;
      }
      self.isLoggedIn = true;
  
      self.save().when(future.fulfill);
  
      return future;
    };
  
    User.prototype.destroy = function () {
      cache.set('user', null);
      // TODO booklist destroy
    };
  
    User.prototype.logout = function () {
      self.destroy()
    };
  
    User.prototype.save = function () {
      var self = this
        , future = Future()
        ;
  
      cache.set('user', self);
  
      if (!self.email) {
        future.fulfill(null, self);
        return future;
      }
  
      // TODO rename /subscribe
      request.post(targetInfo() + '/subscribe', null, self).when(function (err, ahr, data) {
        console.log('user.save', data);
        Object.keys(data.couchdb).forEach(function (key) {
          self[key] = data.couchdb[key];
        });
  
        future.fulfill(err, self);
      });
  
      return future;
    };
  
  
    User.create = function (email) {
      return new User(email);
    };
  
    module.exports = User;
  }());
  

  provide("blyph-client/lib/user", module.exports);
  provide("blyph-client/lib/user", module.exports);
  $.ender(module.exports);
}(global));

// ender:blyph-client/lib/search as blyph-client/lib/search
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  
  
    var CampusBooks = require('campusbooks')
      //, campusbooks = CampusBooks.create("BLCg7q5VrmUBxsrETg5c")
      , campusbooks = CampusBooks.create("BDz21GvuL6RgTKiSbwe3")
      , ISBN = require('isbn').ISBN
      , searchCache = {}
      , patternIsbn = /\d{10}|\d{13}/
      , punctRe = /[\.\-_'":!\$\?]/g
      , escapeRegExp =  require('blyph-client/lib/regexp-escape')
      , keywordCache = {}
      ;
  
    function searchInCache(title) {
      var results = []
        , pattern
        ;
  
      title = (title || '').replace(punctRe, '');
      pattern = new RegExp('\\b' + escapeRegExp(title), 'i');
  
      if (pattern.exec('zzzzz')) {
        return [];
      }
  
      Object.keys(searchCache).forEach(function (isbn) {
        // TODO romanize titles (as does mediabox)
        var book = searchCache[isbn]
          , title = (book.title||'').replace(punctRe, '')
          ;
  
        if (pattern.exec(title)) {
          results.push(book);
        }
      });
  
      return results.slice(0, 10);
    }
  
  
    function normalizeCampusBookResult(searchType, input, data) {
      var books
        , error
        , now = new Date().valueOf()
        ;
  
      books = data 
          && data.response 
          && data.response.page 
          && data.response.page.results 
          && data.response.page.results.book
          || undefined;
  
      if ('bookinfo' === searchType) {
        books = data 
            && data.response 
            && data.response.page
            || undefined;
      }
  
      books = books && (Array.isArray(books) ? books : [books]);
  
      error = data && data.repsonse && data.response.errors;
  
      if (error) {
        // TODO unobtrusive alert('params: ' + JSON.stringify(params));
        console.error("something erred", error);
        return { error: error };
      }
  
      if (!books) {
        books = [];
        console.warn("missing data", data);
        return { error: "missing data" };
      } else {
        keywordCache[input] = data;
      }
  
      function cacheBook(book) {
        searchCache[book.isbn13||book.isbn||book.isbn10] = book;
        book.timestamp = new Date().valueOf();
      }
  
      books.forEach(cacheBook);
  
      return books;
    }
  
    function searchForBook(callback, input) {
      var isbn
        , isbnText
        , opts = {}
        , searchType
        , results
        ;
  
      input = String(input||'').toLowerCase().trim();
  
      if (!(input.length >= 3)) {
        callback(null, []);
        return;
      }
  
      isbnText = input.replace(/[\s\.\-_]/g, '');
      isbn = ISBN.parse(isbnText);
  
      if (isbn || patternIsbn.exec(isbnText)) {
        opts.isbn = isbnText;
        searchType = 'bookinfo';
        results = searchCache[isbnText];
        results = results && [results];
      } else {
        opts.title = input;
        searchType = 'search'
        // TODO search school cache
      }
  
      // TODO merge in both results
      results = results || keywordCache[input] || searchInCache(input);
  
      // 150px seems a good size
      opts.image_height = 150;
  
      if (!results || !results.length) {
        console.log('options', opts);
        campusbooks[searchType](opts).when(function (err, ahr, data) {
          results = normalizeCampusBookResult(searchType, input, data);
          callback(results.error, results);
        });
      } else {
        callback(results.error, results);
      }
    }
  
    module.exports = searchForBook;
  }());
  

  provide("blyph-client/lib/search", module.exports);
  provide("blyph-client/lib/search", module.exports);
  $.ender(module.exports);
}(global));

// ender:blyph-client/lib/delay-key-up as blyph-client/lib/delay-key-up
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  
    function delayKeyUp(params) {
      var key_timeout = 0
        , ignore_me = false
        , lastData
        , wait = params.timeout
        , getData = params.getter
        , shouldWait = params.validater
        , cb = params.callback
        ;
  
      return {
        keyup: function (ev) {
          ev.preventDefault();
  
          if (ignore_me) {
            ignore_me = false;
            return;
          }
  
          var data = getData();
          if (lastData === data) {
            return;
          }
          lastData = data;
  
          clearTimeout(key_timeout);
          if (shouldWait(data)) {
            key_timeout = 0;
            cb(data);
          } else {
            key_timeout = setTimeout(cb, wait, data);
          }
        },
        submit: function (ev) {
          ev.preventDefault();
          clearTimeout(key_timeout);
  
          var data = getData();
          /*
          if (lastData === data) {
            return;
          }
          lastData = data;
          */
  
          ignore_me = true;
          cb(data);
        }
      };
    }
  
    module.exports = delayKeyUp;
  }());
  

  provide("blyph-client/lib/delay-key-up", module.exports);
  provide("blyph-client/lib/delay-key-up", module.exports);
  $.ender(module.exports);
}(global));

// ender:blyph-client as blyph-client
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  
    var User =  require('blyph-client/lib/user')
      , Booklist =  require('blyph-client/lib/booklist')
      , searchForBooks =  require('blyph-client/lib/search')
      , targetInfo =  require('blyph-client/lib/target-info')
      , DelayKeyUp =  require('blyph-client/lib/delay-key-up')
      , $ = require('ender')
      , serializeForm = require('serialize-form').serializeFormObject
      , user = User.create()
      , booklist = Booklist.create(user)
      ;
  
    function login() {
      $('#saveyourinfo').hide();
      $('#logout').show();
    }
  
    function showBookResults(err, books) {
      if (err) {
        console.error(err);
      }
      if (!books || !books.length) {
        console.warn('no books found');
        return;
      }
      console.log(books);
    }
  
    function createOrGetUser(ev) {
      ev.preventDefault();
  
      var values = serializeForm('form#email_form')
        ;
  
      console.log('login', values);
  
      user.login(values.email, values.school).when(function (err) {
        if (err) {
          alert(err.message);
          return;
        }
  
        login();
      });
    }
  
    function logout(ev) {
      ev.preventDefault();
  
      user.logout();
      user = User.create();
  
      $('#saveyourinfo').show();
      $('#logout').hide();
    }
  
    function attachHandlers() {
      $('body').delegate('form#email_form', 'submit', createOrGetUser);
      $('body').delegate('#logout a', 'click', logout);
  
      // TODO use booklist as part of user
      console.log('user.booklist', user.booklist);
      booklist.get().when(function (err, list) {
        console.log('booklist', list);
      });
  
      console.log('isLoggedIn', user.isLoggedIn);
      if (user.isLoggedIn) {
        $('#saveyourinfo').hide();
        $('#logout').show();
      } else {
        $('#saveyourinfo').show();
        $('#logout').hide();
      }
  
      (function () {
        var respondon
          ;
  
        respondon = DelayKeyUp({
            timeout: 500
          , getter: function () {
              return $('#search').val();
            }
          , validater: function (input) {
              if (!/\w$/.exec(input) && input.length >= 5) {
                return true;
              }
              return false;
            }
          , callback: function (input) {
              console.log("submit: " + input);
              searchForBooks(showBookResults, input);
            }
        });
  
        $("body").delegate("#search", "keyup", respondon.keyup);
        $("body").delegate("form#search_form", "submit", respondon.submit);
      }());
    }
  
    $.domReady(attachHandlers);
  }());
  

  provide("blyph-client", module.exports);
  provide("blyph-client", module.exports);
  $.ender(module.exports);
}(global));