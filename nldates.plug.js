var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// https://deno.land/x/silverbullet@0.10.4/lib/plugos/worker_runtime.ts
var workerPostMessage = (_msg) => {
  throw new Error("Not initialized yet");
};
var runningAsWebWorker = typeof window === "undefined" && // @ts-ignore: globalThis
typeof globalThis.WebSocketPair === "undefined";
if (typeof Deno === "undefined") {
  self.Deno = {
    args: [],
    // @ts-ignore: Deno hack
    build: {
      arch: "x86_64"
    },
    env: {
      // @ts-ignore: Deno hack
      get() {
      }
    }
  };
}
var pendingRequests = /* @__PURE__ */ new Map();
var syscallReqId = 0;
if (runningAsWebWorker) {
  globalThis.syscall = async (name, ...args) => {
    return await new Promise((resolve, reject) => {
      syscallReqId++;
      pendingRequests.set(syscallReqId, { resolve, reject });
      workerPostMessage({
        type: "sys",
        id: syscallReqId,
        name,
        args
      });
    });
  };
}
function setupMessageListener(functionMapping2, manifest2, postMessageFn) {
  if (!runningAsWebWorker) {
    return;
  }
  workerPostMessage = postMessageFn;
  self.addEventListener("message", (event) => {
    (async () => {
      const data = event.data;
      switch (data.type) {
        case "inv":
          {
            const fn2 = functionMapping2[data.name];
            if (!fn2) {
              throw new Error(`Function not loaded: ${data.name}`);
            }
            try {
              const result = await Promise.resolve(fn2(...data.args || []));
              workerPostMessage({
                type: "invr",
                id: data.id,
                result
              });
            } catch (e) {
              console.error(
                "An exception was thrown as a result of invoking function",
                data.name,
                "error:",
                e.message
              );
              workerPostMessage({
                type: "invr",
                id: data.id,
                error: e.message
              });
            }
          }
          break;
        case "sysr":
          {
            const syscallId = data.id;
            const lookup = pendingRequests.get(syscallId);
            if (!lookup) {
              throw Error("Invalid request id");
            }
            pendingRequests.delete(syscallId);
            if (data.error) {
              lookup.reject(new Error(data.error));
            } else {
              lookup.resolve(data.result);
            }
          }
          break;
      }
    })().catch(console.error);
  });
  workerPostMessage({
    type: "manifest",
    manifest: manifest2
  });
}
function base64Decode(s7) {
  const binString = atob(s7);
  const len = binString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binString.charCodeAt(i);
  }
  return bytes;
}
function base64Encode(buffer) {
  if (typeof buffer === "string") {
    buffer = new TextEncoder().encode(buffer);
  }
  let binary = "";
  const len = buffer.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}
async function sandboxFetch(reqInfo, options) {
  if (typeof reqInfo !== "string") {
    const body = new Uint8Array(await reqInfo.arrayBuffer());
    const encodedBody = body.length > 0 ? base64Encode(body) : void 0;
    options = {
      method: reqInfo.method,
      headers: Object.fromEntries(reqInfo.headers.entries()),
      base64Body: encodedBody
    };
    reqInfo = reqInfo.url;
  }
  return syscall("sandboxFetch.fetch", reqInfo, options);
}
globalThis.nativeFetch = globalThis.fetch;
function monkeyPatchFetch() {
  globalThis.fetch = async function(reqInfo, init) {
    const encodedBody = init && init.body ? base64Encode(
      new Uint8Array(await new Response(init.body).arrayBuffer())
    ) : void 0;
    const r = await sandboxFetch(
      reqInfo,
      init && {
        method: init.method,
        headers: init.headers,
        base64Body: encodedBody
      }
    );
    return new Response(r.base64Body ? base64Decode(r.base64Body) : null, {
      status: r.status,
      headers: r.headers
    });
  };
}
if (runningAsWebWorker) {
  monkeyPatchFetch();
}

// https://esm.sh/dayjs@1.11.18/denonext/plugin/quarterOfYear.mjs
var O = Object.create;
var c = Object.defineProperty;
var b = Object.getOwnPropertyDescriptor;
var v = Object.getOwnPropertyNames;
var j = Object.getPrototypeOf;
var q = Object.prototype.hasOwnProperty;
var g = (r, t) => () => (t || r((t = { exports: {} }).exports, t), t.exports);
var $ = (r, t, e, u) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (let n of v(t))
      !q.call(r, n) && n !== e && c(r, n, { get: () => t[n], enumerable: !(u = b(t, n)) || u.enumerable });
  return r;
};
var T = (r, t, e) => (e = r != null ? O(j(r)) : {}, $(t || !r || !r.__esModule ? c(e, "default", { value: r, enumerable: true }) : e, r));
var l = g((a, f2) => {
  (function(r, t) {
    typeof a == "object" && typeof f2 < "u" ? f2.exports = t() : typeof define == "function" && define.amd ? define(t) : (r = typeof globalThis < "u" ? globalThis : r || self).dayjs_plugin_quarterOfYear = t();
  })(a, function() {
    "use strict";
    var r = "month", t = "quarter";
    return function(e, u) {
      var n = u.prototype;
      n.quarter = function(i) {
        return this.$utils().u(i) ? Math.ceil((this.month() + 1) / 3) : this.month(this.month() % 3 + 3 * (i - 1));
      };
      var m = n.add;
      n.add = function(i, s7) {
        return i = Number(i), this.$utils().p(s7) === t ? this.add(3 * i, r) : m.bind(this)(i, s7);
      };
      var p = n.startOf;
      n.startOf = function(i, s7) {
        var d2 = this.$utils(), y = !!d2.u(s7) || s7;
        if (d2.p(i) === t) {
          var h2 = this.quarter() - 1;
          return y ? this.month(3 * h2).startOf(r).startOf("day") : this.month(3 * h2 + 2).endOf(r).endOf("day");
        }
        return p.bind(this)(i, s7);
      };
    };
  });
});
var o = T(l());
var x = o.default ?? o;

// https://esm.sh/dayjs@1.11.18/denonext/dayjs.mjs
var X = Object.create;
var E = Object.defineProperty;
var tt = Object.getOwnPropertyDescriptor;
var et = Object.getOwnPropertyNames;
var nt = Object.getPrototypeOf;
var rt = Object.prototype.hasOwnProperty;
var it = (h2, c3) => () => (c3 || h2((c3 = { exports: {} }).exports, c3), c3.exports);
var st = (h2, c3, g3, _2) => {
  if (c3 && typeof c3 == "object" || typeof c3 == "function")
    for (let M2 of et(c3))
      !rt.call(h2, M2) && M2 !== g3 && E(h2, M2, { get: () => c3[M2], enumerable: !(_2 = tt(c3, M2)) || _2.enumerable });
  return h2;
};
var ut = (h2, c3, g3) => (g3 = h2 != null ? X(nt(h2)) : {}, st(c3 || !h2 || !h2.__esModule ? E(g3, "default", { value: h2, enumerable: true }) : g3, h2));
var P = it((F2, J2) => {
  (function(h2, c3) {
    typeof F2 == "object" && typeof J2 < "u" ? J2.exports = c3() : typeof define == "function" && define.amd ? define(c3) : (h2 = typeof globalThis < "u" ? globalThis : h2 || self).dayjs = c3();
  })(F2, function() {
    "use strict";
    var h2 = 1e3, c3 = 6e4, g3 = 36e5, _2 = "millisecond", M2 = "second", k2 = "minute", T3 = "hour", D2 = "day", W2 = "week", v3 = "month", z2 = "quarter", p = "year", Y2 = "date", V2 = "Invalid Date", Q2 = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, G2 = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, K2 = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(i) {
      var n = ["th", "st", "nd", "rd"], t = i % 100;
      return "[" + i + (n[(t - 20) % 10] || n[t] || n[0]) + "]";
    } }, N2 = function(i, n, t) {
      var r = String(i);
      return !r || r.length >= n ? i : "" + Array(n + 1 - r.length).join(t) + i;
    }, R2 = { s: N2, z: function(i) {
      var n = -i.utcOffset(), t = Math.abs(n), r = Math.floor(t / 60), e = t % 60;
      return (n <= 0 ? "+" : "-") + N2(r, 2, "0") + ":" + N2(e, 2, "0");
    }, m: function i(n, t) {
      if (n.date() < t.date())
        return -i(t, n);
      var r = 12 * (t.year() - n.year()) + (t.month() - n.month()), e = n.clone().add(r, v3), s7 = t - e < 0, u = n.clone().add(r + (s7 ? -1 : 1), v3);
      return +(-(r + (t - e) / (s7 ? e - u : u - e)) || 0);
    }, a: function(i) {
      return i < 0 ? Math.ceil(i) || 0 : Math.floor(i);
    }, p: function(i) {
      return { M: v3, y: p, w: W2, d: D2, D: Y2, h: T3, m: k2, s: M2, ms: _2, Q: z2 }[i] || String(i || "").toLowerCase().replace(/s$/, "");
    }, u: function(i) {
      return i === void 0;
    } }, j3 = "en", w2 = {};
    w2[j3] = K2;
    var q2 = "$isDayjsObject", U2 = function(i) {
      return i instanceof A2 || !(!i || !i[q2]);
    }, C2 = function i(n, t, r) {
      var e;
      if (!n)
        return j3;
      if (typeof n == "string") {
        var s7 = n.toLowerCase();
        w2[s7] && (e = s7), t && (w2[s7] = t, e = s7);
        var u = n.split("-");
        if (!e && u.length > 1)
          return i(u[0]);
      } else {
        var o2 = n.name;
        w2[o2] = n, e = o2;
      }
      return !r && e && (j3 = e), e || !r && j3;
    }, d2 = function(i, n) {
      if (U2(i))
        return i.clone();
      var t = typeof n == "object" ? n : {};
      return t.date = i, t.args = arguments, new A2(t);
    }, a = R2;
    a.l = C2, a.i = U2, a.w = function(i, n) {
      return d2(i, { locale: n.$L, utc: n.$u, x: n.$x, $offset: n.$offset });
    };
    var A2 = function() {
      function i(t) {
        this.$L = C2(t.locale, null, true), this.parse(t), this.$x = this.$x || t.x || {}, this[q2] = true;
      }
      var n = i.prototype;
      return n.parse = function(t) {
        this.$d = function(r) {
          var e = r.date, s7 = r.utc;
          if (e === null)
            return /* @__PURE__ */ new Date(NaN);
          if (a.u(e))
            return /* @__PURE__ */ new Date();
          if (e instanceof Date)
            return new Date(e);
          if (typeof e == "string" && !/Z$/i.test(e)) {
            var u = e.match(Q2);
            if (u) {
              var o2 = u[2] - 1 || 0, f2 = (u[7] || "0").substring(0, 3);
              return s7 ? new Date(Date.UTC(u[1], o2, u[3] || 1, u[4] || 0, u[5] || 0, u[6] || 0, f2)) : new Date(u[1], o2, u[3] || 1, u[4] || 0, u[5] || 0, u[6] || 0, f2);
            }
          }
          return new Date(e);
        }(t), this.init();
      }, n.init = function() {
        var t = this.$d;
        this.$y = t.getFullYear(), this.$M = t.getMonth(), this.$D = t.getDate(), this.$W = t.getDay(), this.$H = t.getHours(), this.$m = t.getMinutes(), this.$s = t.getSeconds(), this.$ms = t.getMilliseconds();
      }, n.$utils = function() {
        return a;
      }, n.isValid = function() {
        return this.$d.toString() !== V2;
      }, n.isSame = function(t, r) {
        var e = d2(t);
        return this.startOf(r) <= e && e <= this.endOf(r);
      }, n.isAfter = function(t, r) {
        return d2(t) < this.startOf(r);
      }, n.isBefore = function(t, r) {
        return this.endOf(r) < d2(t);
      }, n.$g = function(t, r, e) {
        return a.u(t) ? this[r] : this.set(e, t);
      }, n.unix = function() {
        return Math.floor(this.valueOf() / 1e3);
      }, n.valueOf = function() {
        return this.$d.getTime();
      }, n.startOf = function(t, r) {
        var e = this, s7 = !!a.u(r) || r, u = a.p(t), o2 = function(b3, m) {
          var S = a.w(e.$u ? Date.UTC(e.$y, m, b3) : new Date(e.$y, m, b3), e);
          return s7 ? S : S.endOf(D2);
        }, f2 = function(b3, m) {
          return a.w(e.toDate()[b3].apply(e.toDate("s"), (s7 ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(m)), e);
        }, $2 = this.$W, l3 = this.$M, y = this.$D, H2 = "set" + (this.$u ? "UTC" : "");
        switch (u) {
          case p:
            return s7 ? o2(1, 0) : o2(31, 11);
          case v3:
            return s7 ? o2(1, l3) : o2(0, l3 + 1);
          case W2:
            var O3 = this.$locale().weekStart || 0, x3 = ($2 < O3 ? $2 + 7 : $2) - O3;
            return o2(s7 ? y - x3 : y + (6 - x3), l3);
          case D2:
          case Y2:
            return f2(H2 + "Hours", 0);
          case T3:
            return f2(H2 + "Minutes", 1);
          case k2:
            return f2(H2 + "Seconds", 2);
          case M2:
            return f2(H2 + "Milliseconds", 3);
          default:
            return this.clone();
        }
      }, n.endOf = function(t) {
        return this.startOf(t, false);
      }, n.$set = function(t, r) {
        var e, s7 = a.p(t), u = "set" + (this.$u ? "UTC" : ""), o2 = (e = {}, e[D2] = u + "Date", e[Y2] = u + "Date", e[v3] = u + "Month", e[p] = u + "FullYear", e[T3] = u + "Hours", e[k2] = u + "Minutes", e[M2] = u + "Seconds", e[_2] = u + "Milliseconds", e)[s7], f2 = s7 === D2 ? this.$D + (r - this.$W) : r;
        if (s7 === v3 || s7 === p) {
          var $2 = this.clone().set(Y2, 1);
          $2.$d[o2](f2), $2.init(), this.$d = $2.set(Y2, Math.min(this.$D, $2.daysInMonth())).$d;
        } else
          o2 && this.$d[o2](f2);
        return this.init(), this;
      }, n.set = function(t, r) {
        return this.clone().$set(t, r);
      }, n.get = function(t) {
        return this[a.p(t)]();
      }, n.add = function(t, r) {
        var e, s7 = this;
        t = Number(t);
        var u = a.p(r), o2 = function(l3) {
          var y = d2(s7);
          return a.w(y.date(y.date() + Math.round(l3 * t)), s7);
        };
        if (u === v3)
          return this.set(v3, this.$M + t);
        if (u === p)
          return this.set(p, this.$y + t);
        if (u === D2)
          return o2(1);
        if (u === W2)
          return o2(7);
        var f2 = (e = {}, e[k2] = c3, e[T3] = g3, e[M2] = h2, e)[u] || 1, $2 = this.$d.getTime() + t * f2;
        return a.w($2, this);
      }, n.subtract = function(t, r) {
        return this.add(-1 * t, r);
      }, n.format = function(t) {
        var r = this, e = this.$locale();
        if (!this.isValid())
          return e.invalidDate || V2;
        var s7 = t || "YYYY-MM-DDTHH:mm:ssZ", u = a.z(this), o2 = this.$H, f2 = this.$m, $2 = this.$M, l3 = e.weekdays, y = e.months, H2 = e.meridiem, O3 = function(m, S, L2, I2) {
          return m && (m[S] || m(r, s7)) || L2[S].slice(0, I2);
        }, x3 = function(m) {
          return a.s(o2 % 12 || 12, m, "0");
        }, b3 = H2 || function(m, S, L2) {
          var I2 = m < 12 ? "AM" : "PM";
          return L2 ? I2.toLowerCase() : I2;
        };
        return s7.replace(G2, function(m, S) {
          return S || function(L2) {
            switch (L2) {
              case "YY":
                return String(r.$y).slice(-2);
              case "YYYY":
                return a.s(r.$y, 4, "0");
              case "M":
                return $2 + 1;
              case "MM":
                return a.s($2 + 1, 2, "0");
              case "MMM":
                return O3(e.monthsShort, $2, y, 3);
              case "MMMM":
                return O3(y, $2);
              case "D":
                return r.$D;
              case "DD":
                return a.s(r.$D, 2, "0");
              case "d":
                return String(r.$W);
              case "dd":
                return O3(e.weekdaysMin, r.$W, l3, 2);
              case "ddd":
                return O3(e.weekdaysShort, r.$W, l3, 3);
              case "dddd":
                return l3[r.$W];
              case "H":
                return String(o2);
              case "HH":
                return a.s(o2, 2, "0");
              case "h":
                return x3(1);
              case "hh":
                return x3(2);
              case "a":
                return b3(o2, f2, true);
              case "A":
                return b3(o2, f2, false);
              case "m":
                return String(f2);
              case "mm":
                return a.s(f2, 2, "0");
              case "s":
                return String(r.$s);
              case "ss":
                return a.s(r.$s, 2, "0");
              case "SSS":
                return a.s(r.$ms, 3, "0");
              case "Z":
                return u;
            }
            return null;
          }(m) || u.replace(":", "");
        });
      }, n.utcOffset = function() {
        return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
      }, n.diff = function(t, r, e) {
        var s7, u = this, o2 = a.p(r), f2 = d2(t), $2 = (f2.utcOffset() - this.utcOffset()) * c3, l3 = this - f2, y = function() {
          return a.m(u, f2);
        };
        switch (o2) {
          case p:
            s7 = y() / 12;
            break;
          case v3:
            s7 = y();
            break;
          case z2:
            s7 = y() / 3;
            break;
          case W2:
            s7 = (l3 - $2) / 6048e5;
            break;
          case D2:
            s7 = (l3 - $2) / 864e5;
            break;
          case T3:
            s7 = l3 / g3;
            break;
          case k2:
            s7 = l3 / c3;
            break;
          case M2:
            s7 = l3 / h2;
            break;
          default:
            s7 = l3;
        }
        return e ? s7 : a.a(s7);
      }, n.daysInMonth = function() {
        return this.endOf(v3).$D;
      }, n.$locale = function() {
        return w2[this.$L];
      }, n.locale = function(t, r) {
        if (!t)
          return this.$L;
        var e = this.clone(), s7 = C2(t, r, true);
        return s7 && (e.$L = s7), e;
      }, n.clone = function() {
        return a.w(this.$d, this);
      }, n.toDate = function() {
        return new Date(this.valueOf());
      }, n.toJSON = function() {
        return this.isValid() ? this.toISOString() : null;
      }, n.toISOString = function() {
        return this.$d.toISOString();
      }, n.toString = function() {
        return this.$d.toUTCString();
      }, i;
    }(), B2 = A2.prototype;
    return d2.prototype = B2, [["$ms", _2], ["$s", M2], ["$m", k2], ["$H", T3], ["$W", D2], ["$M", v3], ["$y", p], ["$D", Y2]].forEach(function(i) {
      B2[i[1]] = function(n) {
        return this.$g(n, i[0], i[1]);
      };
    }), d2.extend = function(i, n) {
      return i.$i || (i(n, A2, d2), i.$i = true), d2;
    }, d2.locale = C2, d2.isDayjs = U2, d2.unix = function(i) {
      return d2(1e3 * i);
    }, d2.en = w2[j3], d2.Ls = w2, d2.p = {}, d2;
  });
});
var Z = ut(P());
var ot = Z.default ?? Z;

// https://esm.sh/chrono-node@2.7.7/denonext/chrono-node.mjs
var Ea = Object.defineProperty;
var j2 = (s7, e) => {
  for (var r in e)
    Ea(s7, r, { get: e[r], enumerable: true });
};
var Bi = {};
j2(Bi, { Chrono: () => g2, GB: () => Wm, Meridiem: () => d, ParsingComponents: () => l2, ParsingResult: () => h, ReferenceWithTimezone: () => x2, Weekday: () => T2, casual: () => Nr, configuration: () => cn, parse: () => km, parseDate: () => Sm, strict: () => Zn });
var d;
(function(s7) {
  s7[s7.AM = 0] = "AM", s7[s7.PM = 1] = "PM";
})(d || (d = {}));
var T2;
(function(s7) {
  s7[s7.SUNDAY = 0] = "SUNDAY", s7[s7.MONDAY = 1] = "MONDAY", s7[s7.TUESDAY = 2] = "TUESDAY", s7[s7.WEDNESDAY = 3] = "WEDNESDAY", s7[s7.THURSDAY = 4] = "THURSDAY", s7[s7.FRIDAY = 5] = "FRIDAY", s7[s7.SATURDAY = 6] = "SATURDAY";
})(T2 || (T2 = {}));
var v2;
(function(s7) {
  s7[s7.JANUARY = 1] = "JANUARY", s7[s7.FEBRUARY = 2] = "FEBRUARY", s7[s7.MARCH = 3] = "MARCH", s7[s7.APRIL = 4] = "APRIL", s7[s7.MAY = 5] = "MAY", s7[s7.JUNE = 6] = "JUNE", s7[s7.JULY = 7] = "JULY", s7[s7.AUGUST = 8] = "AUGUST", s7[s7.SEPTEMBER = 9] = "SEPTEMBER", s7[s7.OCTOBER = 10] = "OCTOBER", s7[s7.NOVEMBER = 11] = "NOVEMBER", s7[s7.DECEMBER = 12] = "DECEMBER";
})(v2 || (v2 = {}));
function re(s7, e) {
  e = e.add(1, "day"), E2(s7, e), L(s7, e);
}
function pi(s7, e) {
  e = e.add(1, "day"), ye(s7, e), L(s7, e);
}
function E2(s7, e) {
  s7.assign("day", e.date()), s7.assign("month", e.month() + 1), s7.assign("year", e.year());
}
function nn(s7, e) {
  s7.assign("hour", e.hour()), s7.assign("minute", e.minute()), s7.assign("second", e.second()), s7.assign("millisecond", e.millisecond()), s7.get("hour") < 12 ? s7.assign("meridiem", d.AM) : s7.assign("meridiem", d.PM);
}
function ye(s7, e) {
  s7.imply("day", e.date()), s7.imply("month", e.month() + 1), s7.imply("year", e.year());
}
function L(s7, e) {
  s7.imply("hour", e.hour()), s7.imply("minute", e.minute()), s7.imply("second", e.second()), s7.imply("millisecond", e.millisecond());
}
var Aa = { ACDT: 630, ACST: 570, ADT: -180, AEDT: 660, AEST: 600, AFT: 270, AKDT: -480, AKST: -540, ALMT: 360, AMST: -180, AMT: -240, ANAST: 720, ANAT: 720, AQTT: 300, ART: -180, AST: -240, AWDT: 540, AWST: 480, AZOST: 0, AZOT: -60, AZST: 300, AZT: 240, BNT: 480, BOT: -240, BRST: -120, BRT: -180, BST: 60, BTT: 360, CAST: 480, CAT: 120, CCT: 390, CDT: -300, CEST: 120, CET: { timezoneOffsetDuringDst: 2 * 60, timezoneOffsetNonDst: 60, dstStart: (s7) => ci(s7, v2.MARCH, T2.SUNDAY, 2), dstEnd: (s7) => ci(s7, v2.OCTOBER, T2.SUNDAY, 3) }, CHADT: 825, CHAST: 765, CKT: -600, CLST: -180, CLT: -240, COT: -300, CST: -360, CT: { timezoneOffsetDuringDst: -5 * 60, timezoneOffsetNonDst: -6 * 60, dstStart: (s7) => me(s7, v2.MARCH, T2.SUNDAY, 2, 2), dstEnd: (s7) => me(s7, v2.NOVEMBER, T2.SUNDAY, 1, 2) }, CVT: -60, CXT: 420, ChST: 600, DAVT: 420, EASST: -300, EAST: -360, EAT: 180, ECT: -300, EDT: -240, EEST: 180, EET: 120, EGST: 0, EGT: -60, EST: -300, ET: { timezoneOffsetDuringDst: -4 * 60, timezoneOffsetNonDst: -5 * 60, dstStart: (s7) => me(s7, v2.MARCH, T2.SUNDAY, 2, 2), dstEnd: (s7) => me(s7, v2.NOVEMBER, T2.SUNDAY, 1, 2) }, FJST: 780, FJT: 720, FKST: -180, FKT: -240, FNT: -120, GALT: -360, GAMT: -540, GET: 240, GFT: -180, GILT: 720, GMT: 0, GST: 240, GYT: -240, HAA: -180, HAC: -300, HADT: -540, HAE: -240, HAP: -420, HAR: -360, HAST: -600, HAT: -90, HAY: -480, HKT: 480, HLV: -210, HNA: -240, HNC: -360, HNE: -300, HNP: -480, HNR: -420, HNT: -150, HNY: -540, HOVT: 420, ICT: 420, IDT: 180, IOT: 360, IRDT: 270, IRKST: 540, IRKT: 540, IRST: 210, IST: 330, JST: 540, KGT: 360, KRAST: 480, KRAT: 480, KST: 540, KUYT: 240, LHDT: 660, LHST: 630, LINT: 840, MAGST: 720, MAGT: 720, MART: -510, MAWT: 300, MDT: -360, MESZ: 120, MEZ: 60, MHT: 720, MMT: 390, MSD: 240, MSK: 180, MST: -420, MT: { timezoneOffsetDuringDst: -6 * 60, timezoneOffsetNonDst: -7 * 60, dstStart: (s7) => me(s7, v2.MARCH, T2.SUNDAY, 2, 2), dstEnd: (s7) => me(s7, v2.NOVEMBER, T2.SUNDAY, 1, 2) }, MUT: 240, MVT: 300, MYT: 480, NCT: 660, NDT: -90, NFT: 690, NOVST: 420, NOVT: 360, NPT: 345, NST: -150, NUT: -660, NZDT: 780, NZST: 720, OMSST: 420, OMST: 420, PDT: -420, PET: -300, PETST: 720, PETT: 720, PGT: 600, PHOT: 780, PHT: 480, PKT: 300, PMDT: -120, PMST: -180, PONT: 660, PST: -480, PT: { timezoneOffsetDuringDst: -7 * 60, timezoneOffsetNonDst: -8 * 60, dstStart: (s7) => me(s7, v2.MARCH, T2.SUNDAY, 2, 2), dstEnd: (s7) => me(s7, v2.NOVEMBER, T2.SUNDAY, 1, 2) }, PWT: 540, PYST: -180, PYT: -240, RET: 240, SAMT: 240, SAST: 120, SBT: 660, SCT: 240, SGT: 480, SRT: -180, SST: -660, TAHT: -600, TFT: 300, TJT: 300, TKT: 780, TLT: 540, TMT: 300, TVT: 720, ULAT: 480, UTC: 0, UYST: -120, UYT: -180, UZT: 300, VET: -210, VLAST: 660, VLAT: 660, VUT: 660, WAST: 120, WAT: 60, WEST: 60, WESZ: 60, WET: 0, WEZ: 0, WFT: 720, WGST: -120, WGT: -180, WIB: 420, WIT: 540, WITA: 480, WST: 780, WT: 0, YAKST: 600, YAKT: 600, YAPT: 600, YEKST: 360, YEKT: 360 };
function me(s7, e, r, t, n = 0) {
  let i = 0, o2 = 0;
  for (; o2 < t; )
    i++, new Date(s7, e - 1, i).getDay() === r && o2++;
  return new Date(s7, e - 1, i, n);
}
function ci(s7, e, r, t = 0) {
  let n = r === 0 ? 7 : r, i = new Date(s7, e - 1 + 1, 1, 12), o2 = i.getDay() === 0 ? 7 : i.getDay(), a;
  return o2 === n ? a = 7 : o2 < n ? a = 7 + o2 - n : a = o2 - n, i.setDate(i.getDate() - a), new Date(s7, e - 1, i.getDate(), t);
}
function sn(s7, e, r = {}) {
  if (s7 == null)
    return null;
  if (typeof s7 == "number")
    return s7;
  let t = r[s7] ?? Aa[s7];
  return t == null ? null : typeof t == "number" ? t : e == null ? null : ot(e).isAfter(t.dstStart(e.getFullYear())) && !ot(e).isAfter(t.dstEnd(e.getFullYear())) ? t.timezoneOffsetDuringDst : t.timezoneOffsetNonDst;
}
ot.extend(x);
var x2 = class {
  constructor(e) {
    e = e ?? /* @__PURE__ */ new Date(), e instanceof Date ? this.instant = e : (this.instant = e.instant ?? /* @__PURE__ */ new Date(), this.timezoneOffset = sn(e.timezone, this.instant));
  }
  getDateWithAdjustedTimezone() {
    return new Date(this.instant.getTime() + this.getSystemTimezoneAdjustmentMinute(this.instant) * 6e4);
  }
  getSystemTimezoneAdjustmentMinute(e, r) {
    (!e || e.getTime() < 0) && (e = /* @__PURE__ */ new Date());
    let t = -e.getTimezoneOffset(), n = r ?? this.timezoneOffset ?? t;
    return t - n;
  }
};
var l2 = class s {
  constructor(e, r) {
    if (this._tags = /* @__PURE__ */ new Set(), this.reference = e, this.knownValues = {}, this.impliedValues = {}, r)
      for (let n in r)
        this.knownValues[n] = r[n];
    let t = ot(e.instant);
    this.imply("day", t.date()), this.imply("month", t.month() + 1), this.imply("year", t.year()), this.imply("hour", 12), this.imply("minute", 0), this.imply("second", 0), this.imply("millisecond", 0);
  }
  get(e) {
    return e in this.knownValues ? this.knownValues[e] : e in this.impliedValues ? this.impliedValues[e] : null;
  }
  isCertain(e) {
    return e in this.knownValues;
  }
  getCertainComponents() {
    return Object.keys(this.knownValues);
  }
  imply(e, r) {
    return e in this.knownValues ? this : (this.impliedValues[e] = r, this);
  }
  assign(e, r) {
    return this.knownValues[e] = r, delete this.impliedValues[e], this;
  }
  delete(e) {
    delete this.knownValues[e], delete this.impliedValues[e];
  }
  clone() {
    let e = new s(this.reference);
    e.knownValues = {}, e.impliedValues = {};
    for (let r in this.knownValues)
      e.knownValues[r] = this.knownValues[r];
    for (let r in this.impliedValues)
      e.impliedValues[r] = this.impliedValues[r];
    return e;
  }
  isOnlyDate() {
    return !this.isCertain("hour") && !this.isCertain("minute") && !this.isCertain("second");
  }
  isOnlyTime() {
    return !this.isCertain("weekday") && !this.isCertain("day") && !this.isCertain("month") && !this.isCertain("year");
  }
  isOnlyWeekdayComponent() {
    return this.isCertain("weekday") && !this.isCertain("day") && !this.isCertain("month");
  }
  isDateWithUnknownYear() {
    return this.isCertain("month") && !this.isCertain("year");
  }
  isValidDate() {
    let e = this.dateWithoutTimezoneAdjustment();
    return !(e.getFullYear() !== this.get("year") || e.getMonth() !== this.get("month") - 1 || e.getDate() !== this.get("day") || this.get("hour") != null && e.getHours() != this.get("hour") || this.get("minute") != null && e.getMinutes() != this.get("minute"));
  }
  toString() {
    return `[ParsingComponents {
            tags: ${JSON.stringify(Array.from(this._tags).sort())}, 
            knownValues: ${JSON.stringify(this.knownValues)}, 
            impliedValues: ${JSON.stringify(this.impliedValues)}}, 
            reference: ${JSON.stringify(this.reference)}]`;
  }
  dayjs() {
    return ot(this.date());
  }
  date() {
    let e = this.dateWithoutTimezoneAdjustment(), r = this.reference.getSystemTimezoneAdjustmentMinute(e, this.get("timezoneOffset"));
    return new Date(e.getTime() + r * 6e4);
  }
  addTag(e) {
    return this._tags.add(e), this;
  }
  addTags(e) {
    for (let r of e)
      this._tags.add(r);
    return this;
  }
  tags() {
    return new Set(this._tags);
  }
  dateWithoutTimezoneAdjustment() {
    let e = new Date(this.get("year"), this.get("month") - 1, this.get("day"), this.get("hour"), this.get("minute"), this.get("second"), this.get("millisecond"));
    return e.setFullYear(this.get("year")), e;
  }
  static createRelativeFromReference(e, r) {
    let t = ot(e.instant);
    for (let i in r)
      t = t.add(r[i], i);
    let n = new s(e);
    return r.hour || r.minute || r.second ? (nn(n, t), E2(n, t), e.timezoneOffset !== null && n.assign("timezoneOffset", -e.instant.getTimezoneOffset())) : (L(n, t), e.timezoneOffset !== null && n.imply("timezoneOffset", -e.instant.getTimezoneOffset()), r.d ? (n.assign("day", t.date()), n.assign("month", t.month() + 1), n.assign("year", t.year())) : r.week ? (n.assign("day", t.date()), n.assign("month", t.month() + 1), n.assign("year", t.year()), n.imply("weekday", t.day())) : (n.imply("day", t.date()), r.month ? (n.assign("month", t.month() + 1), n.assign("year", t.year())) : (n.imply("month", t.month() + 1), r.year ? n.assign("year", t.year()) : n.imply("year", t.year())))), n;
  }
};
var h = class s2 {
  constructor(e, r, t, n, i) {
    this.reference = e, this.refDate = e.instant, this.index = r, this.text = t, this.start = n || new l2(e), this.end = i;
  }
  clone() {
    let e = new s2(this.reference, this.index, this.text);
    return e.start = this.start ? this.start.clone() : null, e.end = this.end ? this.end.clone() : null, e;
  }
  date() {
    return this.start.date();
  }
  tags() {
    let e = new Set(this.start.tags());
    if (this.end)
      for (let r of this.end.tags())
        e.add(r);
    return e;
  }
  toString() {
    let e = Array.from(this.tags()).sort();
    return `[ParsingResult {index: ${this.index}, text: '${this.text}', tags: ${JSON.stringify(e)} ...}]`;
  }
};
function Y(s7, e, r = "\\s{0,5},?\\s{0,5}") {
  let t = e.replace(/\((?!\?)/g, "(?:");
  return `${s7}${t}(?:${r}${t}){0,10}`;
}
function Na(s7) {
  let e;
  return s7 instanceof Array ? e = [...s7] : s7 instanceof Map ? e = Array.from(s7.keys()) : e = Object.keys(s7), e;
}
function c2(s7) {
  return `(?:${Na(s7).sort((r, t) => t.length - r.length).join("|").replace(/\./g, "\\.")})`;
}
function z(s7) {
  return s7 < 100 && (s7 > 50 ? s7 = s7 + 1900 : s7 = s7 + 2e3), s7;
}
function R(s7, e, r) {
  let t = ot(s7), n = t;
  n = n.month(r - 1), n = n.date(e), n = n.year(t.year());
  let i = n.add(1, "y"), o2 = n.add(-1, "y");
  return Math.abs(i.diff(t)) < Math.abs(n.diff(t)) ? n = i : Math.abs(o2.diff(t)) < Math.abs(n.diff(t)) && (n = o2), n.year();
}
var jn = { sunday: 0, sun: 0, "sun.": 0, monday: 1, mon: 1, "mon.": 1, tuesday: 2, tue: 2, "tue.": 2, wednesday: 3, wed: 3, "wed.": 3, thursday: 4, thurs: 4, "thurs.": 4, thur: 4, "thur.": 4, thu: 4, "thu.": 4, friday: 5, fri: 5, "fri.": 5, saturday: 6, sat: 6, "sat.": 6 };
var Ln = { january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12 };
var H = { ...Ln, jan: 1, "jan.": 1, feb: 2, "feb.": 2, mar: 3, "mar.": 3, apr: 4, "apr.": 4, jun: 6, "jun.": 6, jul: 7, "jul.": 7, aug: 8, "aug.": 8, sep: 9, "sep.": 9, sept: 9, "sept.": 9, oct: 10, "oct.": 10, nov: 11, "nov.": 11, dec: 12, "dec.": 12 };
var vn = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };
var Fn = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12, thirteenth: 13, fourteenth: 14, fifteenth: 15, sixteenth: 16, seventeenth: 17, eighteenth: 18, nineteenth: 19, twentieth: 20, "twenty first": 21, "twenty-first": 21, "twenty second": 22, "twenty-second": 22, "twenty third": 23, "twenty-third": 23, "twenty fourth": 24, "twenty-fourth": 24, "twenty fifth": 25, "twenty-fifth": 25, "twenty sixth": 26, "twenty-sixth": 26, "twenty seventh": 27, "twenty-seventh": 27, "twenty eighth": 28, "twenty-eighth": 28, "twenty ninth": 29, "twenty-ninth": 29, thirtieth: 30, "thirty first": 31, "thirty-first": 31 };
var yi = { second: "second", seconds: "second", minute: "minute", minutes: "minute", hour: "hour", hours: "hour", day: "d", days: "d", week: "week", weeks: "week", month: "month", months: "month", quarter: "quarter", quarters: "quarter", year: "year", years: "year" };
var rr = { s: "second", sec: "second", second: "second", seconds: "second", m: "minute", min: "minute", mins: "minute", minute: "minute", minutes: "minute", h: "hour", hr: "hour", hrs: "hour", hour: "hour", hours: "hour", d: "d", day: "d", days: "d", w: "w", week: "week", weeks: "week", mo: "month", mon: "month", mos: "month", month: "month", months: "month", qtr: "quarter", quarter: "quarter", quarters: "quarter", y: "year", yr: "year", year: "year", years: "year", ...yi };
var Ti = `(?:${c2(vn)}|[0-9]+|[0-9]+\\.[0-9]+|half(?:\\s{0,2}an?)?|an?\\b(?:\\s{0,2}few)?|few|several|the|a?\\s{0,2}couple\\s{0,2}(?:of)?)`;
function Oa(s7) {
  let e = s7.toLowerCase();
  return vn[e] !== void 0 ? vn[e] : e === "a" || e === "an" || e == "the" ? 1 : e.match(/few/) ? 3 : e.match(/half/) ? 0.5 : e.match(/couple/) ? 2 : e.match(/several/) ? 7 : parseFloat(e);
}
var $e = `(?:${c2(Fn)}|[0-9]{1,2}(?:st|nd|rd|th)?)`;
function Ye(s7) {
  let e = s7.toLowerCase();
  return Fn[e] !== void 0 ? Fn[e] : (e = e.replace(/(?:st|nd|rd|th)$/i, ""), parseInt(e));
}
var fe = "(?:[1-9][0-9]{0,3}\\s{0,2}(?:BE|AD|BC|BCE|CE)|[1-2][0-9]{3}|[5-9][0-9]|2[0-5])";
function de(s7) {
  if (/BE/i.test(s7))
    return s7 = s7.replace(/BE/i, ""), parseInt(s7) - 543;
  if (/BCE?/i.test(s7))
    return s7 = s7.replace(/BCE?/i, ""), -parseInt(s7);
  if (/(AD|CE)/i.test(s7))
    return s7 = s7.replace(/(AD|CE)/i, ""), parseInt(s7);
  let e = parseInt(s7);
  return z(e);
}
var hi = `(${Ti})\\s{0,3}(${c2(rr)})`;
var gi = new RegExp(hi, "i");
var Ca = `(${Ti})\\s{0,3}(${c2(yi)})`;
var Pi = "\\s{0,5},?(?:\\s*and)?\\s{0,5}";
var se = Y("(?:(?:about|around)\\s{0,3})?", hi, Pi);
var ue = Y("(?:(?:about|around)\\s{0,3})?", Ca, Pi);
function V(s7) {
  let e = {}, r = s7, t = gi.exec(r);
  for (; t; )
    Ma(e, t), r = r.substring(t[0].length).trim(), t = gi.exec(r);
  return Object.keys(e).length == 0 ? null : e;
}
function Ma(s7, e) {
  if (e[0].match(/^[a-zA-Z]+$/))
    return;
  let r = Oa(e[1]), t = rr[e[2].toLowerCase()];
  s7[t] = r;
}
var f = class {
  constructor() {
    this.cachedInnerPattern = null, this.cachedPattern = null;
  }
  innerPatternHasChange(e, r) {
    return this.innerPattern(e) !== r;
  }
  patternLeftBoundary() {
    return "(\\W|^)";
  }
  pattern(e) {
    return this.cachedInnerPattern && !this.innerPatternHasChange(e, this.cachedInnerPattern) ? this.cachedPattern : (this.cachedInnerPattern = this.innerPattern(e), this.cachedPattern = new RegExp(`${this.patternLeftBoundary()}${this.cachedInnerPattern.source}`, this.cachedInnerPattern.flags), this.cachedPattern);
  }
  extract(e, r) {
    let t = r[1] ?? "";
    r.index = r.index + t.length, r[0] = r[0].substring(t.length);
    for (let n = 2; n < r.length; n++)
      r[n - 1] = r[n];
    return this.innerExtract(e, r);
  }
};
var Ia = new RegExp(`(?:(?:within|in|for)\\s*)?(?:(?:about|around|roughly|approximately|just)\\s*(?:~\\s*)?)?(${se})(?=\\W|$)`, "i");
var Da = new RegExp(`(?:within|in|for)\\s*(?:(?:about|around|roughly|approximately|just)\\s*(?:~\\s*)?)?(${se})(?=\\W|$)`, "i");
var Ua = new RegExp(`(?:within|in|for)\\s*(?:(?:about|around|roughly|approximately|just)\\s*(?:~\\s*)?)?(${ue})(?=\\W|$)`, "i");
var tr = class extends f {
  constructor(e) {
    super(), this.strictMode = e;
  }
  innerPattern(e) {
    return this.strictMode ? Ua : e.option.forwardDate ? Ia : Da;
  }
  innerExtract(e, r) {
    if (r[0].match(/^for\s*the\s*\w+/))
      return null;
    let t = V(r[1]);
    return t ? l2.createRelativeFromReference(e.reference, t) : null;
  }
};
var ba = new RegExp(`(?:on\\s{0,3})?(${$e})(?:\\s{0,3}(?:to|\\-|\\\u2013|until|through|till)?\\s{0,3}(${$e}))?(?:-|/|\\s{0,3}(?:of)?\\s{0,3})(${c2(H)})(?:(?:-|/|,?\\s{0,3})(${fe}(?!\\w)))?(?=\\W|$)`, "i");
var xi = 1;
var Ri = 2;
var Wa = 3;
var Ei = 4;
var nr = class extends f {
  innerPattern() {
    return ba;
  }
  innerExtract(e, r) {
    let t = e.createParsingResult(r.index, r[0]), n = H[r[Wa].toLowerCase()], i = Ye(r[xi]);
    if (i > 31)
      return r.index = r.index + r[xi].length, null;
    if (t.start.assign("month", n), t.start.assign("day", i), r[Ei]) {
      let o2 = de(r[Ei]);
      t.start.assign("year", o2);
    } else {
      let o2 = R(e.refDate, i, n);
      t.start.imply("year", o2);
    }
    if (r[Ri]) {
      let o2 = Ye(r[Ri]);
      t.end = t.start.clone(), t.end.assign("day", o2);
    }
    return t;
  }
};
var ka = new RegExp(`(${c2(H)})(?:-|/|\\s*,?\\s*)(${$e})(?!\\s*(?:am|pm))\\s*(?:(?:to|\\-)\\s*(${$e})\\s*)?(?:(?:-|/|\\s*,\\s*|\\s+)(${fe}))?(?=\\W|$)(?!\\:\\d)`, "i");
var Sa = 1;
var Ai = 2;
var zn = 3;
var Hn = 4;
var sr = class extends f {
  constructor(e) {
    super(), this.shouldSkipYearLikeDate = e;
  }
  innerPattern() {
    return ka;
  }
  innerExtract(e, r) {
    let t = H[r[Sa].toLowerCase()], n = Ye(r[Ai]);
    if (n > 31 || this.shouldSkipYearLikeDate && !r[zn] && !r[Hn] && r[Ai].match(/^2[0-5]$/))
      return null;
    let i = e.createParsingComponents({ day: n, month: t }).addTag("parser/ENMonthNameMiddleEndianParser");
    if (r[Hn]) {
      let m = de(r[Hn]);
      i.assign("year", m);
    } else {
      let m = R(e.refDate, n, t);
      i.imply("year", m);
    }
    if (!r[zn])
      return i;
    let o2 = Ye(r[zn]), a = e.createParsingResult(r.index, r[0]);
    return a.start = i, a.end = i.clone(), a.end.assign("day", o2), a;
  }
};
var $a = new RegExp(`((?:in)\\s*)?(${c2(H)})\\s*(?:[,-]?\\s*(${fe})?)?(?=[^\\s\\w]|\\s+[^0-9]|\\s+$|$)`, "i");
var Ya = 1;
var Ga = 2;
var wi = 3;
var ir = class extends f {
  innerPattern() {
    return $a;
  }
  innerExtract(e, r) {
    let t = r[Ga].toLowerCase();
    if (r[0].length <= 3 && !Ln[t])
      return null;
    let n = e.createParsingResult(r.index + (r[Ya] || "").length, r.index + r[0].length);
    n.start.imply("day", 1), n.start.addTag("parser/ENMonthNameParser");
    let i = H[t];
    if (n.start.assign("month", i), r[wi]) {
      let o2 = de(r[wi]);
      n.start.assign("year", o2);
    } else {
      let o2 = R(e.refDate, 1, i);
      n.start.imply("year", o2);
    }
    return n;
  }
};
var Ba = new RegExp(`([0-9]{4})[-\\.\\/\\s](?:(${c2(H)})|([0-9]{1,2}))[-\\.\\/\\s]([0-9]{1,2})(?=\\W|$)`, "i");
var va = 1;
var Fa = 2;
var Ni = 3;
var ja = 4;
var or = class extends f {
  constructor(e) {
    super(), this.strictMonthDateOrder = e;
  }
  innerPattern() {
    return Ba;
  }
  innerExtract(e, r) {
    let t = parseInt(r[va]), n = parseInt(r[ja]), i = r[Ni] ? parseInt(r[Ni]) : H[r[Fa].toLowerCase()];
    if (i < 1 || i > 12) {
      if (this.strictMonthDateOrder)
        return null;
      n >= 1 && n <= 12 && ([i, n] = [n, i]);
    }
    return n < 1 || n > 31 ? null : { day: n, month: i, year: t };
  }
};
var La = new RegExp("([0-9]|0[1-9]|1[012])/([0-9]{4})", "i");
var za = 1;
var Ha = 2;
var ar = class extends f {
  innerPattern() {
    return La;
  }
  innerExtract(e, r) {
    let t = parseInt(r[Ha]), n = parseInt(r[za]);
    return e.createParsingComponents().imply("day", 1).assign("month", n).assign("year", t);
  }
};
function Va(s7, e, r, t) {
  return new RegExp(`${s7}${e}(\\d{1,4})(?:(?:\\.|:|\uFF1A)(\\d{1,2})(?:(?::|\uFF1A)(\\d{2})(?:\\.(\\d{1,6}))?)?)?(?:\\s*(a\\.m\\.|p\\.m\\.|am?|pm?))?${r}`, t);
}
function Ka(s7, e) {
  return new RegExp(`^(${s7})(\\d{1,4})(?:(?:\\.|\\:|\\\uFF1A)(\\d{1,2})(?:(?:\\.|\\:|\\\uFF1A)(\\d{1,2})(?:\\.(\\d{1,6}))?)?)?(?:\\s*(a\\.m\\.|p\\.m\\.|am?|pm?))?${e}`, "i");
}
var _i = 2;
var Ge = 3;
var an = 4;
var mn = 5;
var mr = 6;
var C = class {
  constructor(e = false) {
    this.cachedPrimaryPrefix = null, this.cachedPrimarySuffix = null, this.cachedPrimaryTimePattern = null, this.cachedFollowingPhase = null, this.cachedFollowingSuffix = null, this.cachedFollowingTimePatten = null, this.strictMode = e;
  }
  patternFlags() {
    return "i";
  }
  primaryPatternLeftBoundary() {
    return "(^|\\s|T|\\b)";
  }
  primarySuffix() {
    return "(?!/)(?=\\W|$)";
  }
  followingSuffix() {
    return "(?!/)(?=\\W|$)";
  }
  pattern(e) {
    return this.getPrimaryTimePatternThroughCache();
  }
  extract(e, r) {
    let t = this.extractPrimaryTimeComponents(e, r);
    if (!t)
      return r[0].match(/^\d{4}/) ? (r.index += 4, null) : (r.index += r[0].length, null);
    let n = r.index + r[1].length, i = r[0].substring(r[1].length), o2 = e.createParsingResult(n, i, t);
    r.index += r[0].length;
    let a = e.text.substring(r.index), p = this.getFollowingTimePatternThroughCache().exec(a);
    return i.match(/^\d{3,4}/) && p && (p[0].match(/^\s*([+-])\s*\d{2,4}$/) || p[0].match(/^\s*([+-])\s*\d{2}\W\d{2}/)) ? null : !p || p[0].match(/^\s*([+-])\s*\d{3,4}$/) ? this.checkAndReturnWithoutFollowingPattern(o2) : (o2.end = this.extractFollowingTimeComponents(e, p, o2), o2.end && (o2.text += p[0]), this.checkAndReturnWithFollowingPattern(o2));
  }
  extractPrimaryTimeComponents(e, r, t = false) {
    let n = e.createParsingComponents(), i = 0, o2 = null, a = parseInt(r[_i]);
    if (a > 100) {
      if (this.strictMode || r[Ge] != null)
        return null;
      i = a % 100, a = Math.floor(a / 100);
    }
    if (a > 24)
      return null;
    if (r[Ge] != null) {
      if (r[Ge].length == 1 && !r[mr])
        return null;
      i = parseInt(r[Ge]);
    }
    if (i >= 60)
      return null;
    if (a > 12 && (o2 = d.PM), r[mr] != null) {
      if (a > 12)
        return null;
      let m = r[mr][0].toLowerCase();
      m == "a" && (o2 = d.AM, a == 12 && (a = 0)), m == "p" && (o2 = d.PM, a != 12 && (a += 12));
    }
    if (n.assign("hour", a), n.assign("minute", i), o2 !== null ? n.assign("meridiem", o2) : a < 12 ? n.imply("meridiem", d.AM) : n.imply("meridiem", d.PM), r[mn] != null) {
      let m = parseInt(r[mn].substring(0, 3));
      if (m >= 1e3)
        return null;
      n.assign("millisecond", m);
    }
    if (r[an] != null) {
      let m = parseInt(r[an]);
      if (m >= 60)
        return null;
      n.assign("second", m);
    }
    return n;
  }
  extractFollowingTimeComponents(e, r, t) {
    let n = e.createParsingComponents();
    if (r[mn] != null) {
      let m = parseInt(r[mn].substring(0, 3));
      if (m >= 1e3)
        return null;
      n.assign("millisecond", m);
    }
    if (r[an] != null) {
      let m = parseInt(r[an]);
      if (m >= 60)
        return null;
      n.assign("second", m);
    }
    let i = parseInt(r[_i]), o2 = 0, a = -1;
    if (r[Ge] != null ? o2 = parseInt(r[Ge]) : i > 100 && (o2 = i % 100, i = Math.floor(i / 100)), o2 >= 60 || i > 24)
      return null;
    if (i >= 12 && (a = d.PM), r[mr] != null) {
      if (i > 12)
        return null;
      let m = r[mr][0].toLowerCase();
      m == "a" && (a = d.AM, i == 12 && (i = 0, n.isCertain("day") || n.imply("day", n.get("day") + 1))), m == "p" && (a = d.PM, i != 12 && (i += 12)), t.start.isCertain("meridiem") || (a == d.AM ? (t.start.imply("meridiem", d.AM), t.start.get("hour") == 12 && t.start.assign("hour", 0)) : (t.start.imply("meridiem", d.PM), t.start.get("hour") != 12 && t.start.assign("hour", t.start.get("hour") + 12)));
    }
    return n.assign("hour", i), n.assign("minute", o2), a >= 0 ? n.assign("meridiem", a) : t.start.isCertain("meridiem") && t.start.get("hour") > 12 ? t.start.get("hour") - 12 > i ? n.imply("meridiem", d.AM) : i <= 12 && (n.assign("hour", i + 12), n.assign("meridiem", d.PM)) : i > 12 ? n.imply("meridiem", d.PM) : i <= 12 && n.imply("meridiem", d.AM), n.date().getTime() < t.start.date().getTime() && n.imply("day", n.get("day") + 1), n;
  }
  checkAndReturnWithoutFollowingPattern(e) {
    if (e.text.match(/^\d$/) || e.text.match(/^\d\d\d+$/) || e.text.match(/\d[apAP]$/))
      return null;
    let r = e.text.match(/[^\d:.](\d[\d.]+)$/);
    if (r) {
      let t = r[1];
      if (this.strictMode || t.includes(".") && !t.match(/\d(\.\d{2})+$/) || parseInt(t) > 24)
        return null;
    }
    return e;
  }
  checkAndReturnWithFollowingPattern(e) {
    if (e.text.match(/^\d+-\d+$/))
      return null;
    let r = e.text.match(/[^\d:.](\d[\d.]+)\s*-\s*(\d[\d.]+)$/);
    if (r) {
      if (this.strictMode)
        return null;
      let t = r[1], n = r[2];
      if (n.includes(".") && !n.match(/\d(\.\d{2})+$/))
        return null;
      let i = parseInt(n), o2 = parseInt(t);
      if (i > 24 || o2 > 24)
        return null;
    }
    return e;
  }
  getPrimaryTimePatternThroughCache() {
    let e = this.primaryPrefix(), r = this.primarySuffix();
    return this.cachedPrimaryPrefix === e && this.cachedPrimarySuffix === r ? this.cachedPrimaryTimePattern : (this.cachedPrimaryTimePattern = Va(this.primaryPatternLeftBoundary(), e, r, this.patternFlags()), this.cachedPrimaryPrefix = e, this.cachedPrimarySuffix = r, this.cachedPrimaryTimePattern);
  }
  getFollowingTimePatternThroughCache() {
    let e = this.followingPhase(), r = this.followingSuffix();
    return this.cachedFollowingPhase === e && this.cachedFollowingSuffix === r ? this.cachedFollowingTimePatten : (this.cachedFollowingTimePatten = Ka(e, r), this.cachedFollowingPhase = e, this.cachedFollowingSuffix = r, this.cachedFollowingTimePatten);
  }
};
var fr = class extends C {
  constructor(e) {
    super(e);
  }
  followingPhase() {
    return "\\s*(?:\\-|\\\u2013|\\~|\\\u301C|to|until|through|till|\\?)\\s*";
  }
  primaryPrefix() {
    return "(?:(?:at|from)\\s*)??";
  }
  primarySuffix() {
    return "(?:\\s*(?:o\\W*clock|at\\s*night|in\\s*the\\s*(?:morning|afternoon)))?(?!/)(?=\\W|$)";
  }
  extractPrimaryTimeComponents(e, r) {
    let t = super.extractPrimaryTimeComponents(e, r);
    if (!t)
      return t;
    if (r[0].endsWith("night")) {
      let n = t.get("hour");
      n >= 6 && n < 12 ? (t.assign("hour", t.get("hour") + 12), t.assign("meridiem", d.PM)) : n < 6 && t.assign("meridiem", d.AM);
    }
    if (r[0].endsWith("afternoon")) {
      t.assign("meridiem", d.PM);
      let n = t.get("hour");
      n >= 0 && n <= 6 && t.assign("hour", t.get("hour") + 12);
    }
    return r[0].endsWith("morning") && (t.assign("meridiem", d.AM), t.get("hour") < 12 && t.assign("hour", t.get("hour"))), t.addTag("parser/ENTimeExpressionParser");
  }
};
function A(s7) {
  let e = {};
  for (let r in s7)
    e[r] = -s7[r];
  return e;
}
function fn(s7, e) {
  let r = s7.clone(), t = s7.dayjs();
  for (let n in e)
    t = t.add(e[n], n);
  return ("day" in e || "d" in e || "week" in e || "month" in e || "year" in e) && (r.imply("day", t.date()), r.imply("month", t.month() + 1), r.imply("year", t.year())), ("second" in e || "minute" in e || "hour" in e) && (r.imply("second", t.second()), r.imply("minute", t.minute()), r.imply("hour", t.hour())), r;
}
var qa = new RegExp(`(${se})\\s{0,5}(?:ago|before|earlier)(?=\\W|$)`, "i");
var Za = new RegExp(`(${ue})\\s{0,5}(?:ago|before|earlier)(?=\\W|$)`, "i");
var dr = class extends f {
  constructor(e) {
    super(), this.strictMode = e;
  }
  innerPattern() {
    return this.strictMode ? Za : qa;
  }
  innerExtract(e, r) {
    let t = V(r[1]);
    if (!t)
      return null;
    let n = A(t);
    return l2.createRelativeFromReference(e.reference, n);
  }
};
var Xa = new RegExp(`(${se})\\s{0,5}(?:later|after|from now|henceforth|forward|out)(?=(?:\\W|$))`, "i");
var Ja = new RegExp(`(${ue})\\s{0,5}(later|after|from now)(?=\\W|$)`, "i");
var Qa = 1;
var ur = class extends f {
  constructor(e) {
    super(), this.strictMode = e;
  }
  innerPattern() {
    return this.strictMode ? Ja : Xa;
  }
  innerExtract(e, r) {
    let t = V(r[Qa]);
    return t ? l2.createRelativeFromReference(e.reference, t) : null;
  }
};
var dn = class {
  refine(e, r) {
    return r.filter((t) => this.isValid(e, t));
  }
};
var K = class {
  refine(e, r) {
    if (r.length < 2)
      return r;
    let t = [], n = r[0], i = null;
    for (let o2 = 1; o2 < r.length; o2++) {
      i = r[o2];
      let a = e.text.substring(n.index + n.text.length, i.index);
      if (!this.shouldMergeResults(a, n, i, e))
        t.push(n), n = i;
      else {
        let m = n, p = i, u = this.mergeResults(a, m, p, e);
        e.debug(() => {
          console.log(`${this.constructor.name} merged ${m} and ${p} into ${u}`);
        }), n = u;
      }
    }
    return n != null && t.push(n), t;
  }
};
var w = class extends K {
  shouldMergeResults(e, r, t) {
    return !r.end && !t.end && e.match(this.patternBetween()) != null;
  }
  mergeResults(e, r, t) {
    if (!r.start.isOnlyWeekdayComponent() && !t.start.isOnlyWeekdayComponent() && (t.start.getCertainComponents().forEach((i) => {
      r.start.isCertain(i) || r.start.imply(i, t.start.get(i));
    }), r.start.getCertainComponents().forEach((i) => {
      t.start.isCertain(i) || t.start.imply(i, r.start.get(i));
    })), r.start.date().getTime() > t.start.date().getTime()) {
      let i = r.start.dayjs(), o2 = t.start.dayjs();
      t.start.isOnlyWeekdayComponent() && o2.add(7, "days").isAfter(i) ? (o2 = o2.add(7, "days"), t.start.imply("day", o2.date()), t.start.imply("month", o2.month() + 1), t.start.imply("year", o2.year())) : r.start.isOnlyWeekdayComponent() && i.add(-7, "days").isBefore(o2) ? (i = i.add(-7, "days"), r.start.imply("day", i.date()), r.start.imply("month", i.month() + 1), r.start.imply("year", i.year())) : t.start.isDateWithUnknownYear() && o2.add(1, "years").isAfter(i) ? (o2 = o2.add(1, "years"), t.start.imply("year", o2.year())) : r.start.isDateWithUnknownYear() && i.add(-1, "years").isBefore(o2) ? (i = i.add(-1, "years"), r.start.imply("year", i.year())) : [t, r] = [r, t];
    }
    let n = r.clone();
    return n.start = r.start, n.end = t.start, n.index = Math.min(r.index, t.index), r.index < t.index ? n.text = r.text + e + t.text : n.text = t.text + e + r.text, n;
  }
};
var pr = class extends w {
  patternBetween() {
    return /^\s*(to|-|–|until|through|till)\s*$/i;
  }
};
function Vn(s7, e) {
  let r = s7.clone(), t = s7.start, n = e.start;
  if (r.start = Oi(t, n), s7.end != null || e.end != null) {
    let i = s7.end == null ? s7.start : s7.end, o2 = e.end == null ? e.start : e.end, a = Oi(i, o2);
    if (s7.end == null && a.date().getTime() < r.start.date().getTime()) {
      let m = a.dayjs().add(1, "day");
      a.isCertain("day") ? E2(a, m) : ye(a, m);
    }
    r.end = a;
  }
  return r;
}
function Oi(s7, e) {
  let r = s7.clone();
  return e.isCertain("hour") ? (r.assign("hour", e.get("hour")), r.assign("minute", e.get("minute")), e.isCertain("second") ? (r.assign("second", e.get("second")), e.isCertain("millisecond") ? r.assign("millisecond", e.get("millisecond")) : r.imply("millisecond", e.get("millisecond"))) : (r.imply("second", e.get("second")), r.imply("millisecond", e.get("millisecond")))) : (r.imply("hour", e.get("hour")), r.imply("minute", e.get("minute")), r.imply("second", e.get("second")), r.imply("millisecond", e.get("millisecond"))), e.isCertain("timezoneOffset") && r.assign("timezoneOffset", e.get("timezoneOffset")), e.isCertain("meridiem") ? r.assign("meridiem", e.get("meridiem")) : e.get("meridiem") != null && r.get("meridiem") == null && r.imply("meridiem", e.get("meridiem")), r.get("meridiem") == d.PM && r.get("hour") < 12 && (e.isCertain("hour") ? r.assign("hour", r.get("hour") + 12) : r.imply("hour", r.get("hour") + 12)), r.addTags(s7.tags()), r.addTags(e.tags()), r;
}
var N = class extends K {
  shouldMergeResults(e, r, t) {
    return (r.start.isOnlyDate() && t.start.isOnlyTime() || t.start.isOnlyDate() && r.start.isOnlyTime()) && e.match(this.patternBetween()) != null;
  }
  mergeResults(e, r, t) {
    let n = r.start.isOnlyDate() ? Vn(r, t) : Vn(t, r);
    return n.index = r.index, n.text = r.text + e + t.text, n;
  }
};
var Be = class extends N {
  patternBetween() {
    return new RegExp("^\\s*(T|at|after|before|on|of|,|-|\\.|\u2219|:)?\\s*$");
  }
};
var em = new RegExp("^\\s*,?\\s*\\(?([A-Z]{2,4})\\)?(?=\\W|$)", "i");
var lr = class {
  constructor(e) {
    this.timezoneOverrides = e;
  }
  refine(e, r) {
    let t = e.option.timezones ?? {};
    return r.forEach((n) => {
      let i = e.text.substring(n.index + n.text.length), o2 = em.exec(i);
      if (!o2)
        return;
      let a = o2[1].toUpperCase(), m = n.start.date() ?? n.refDate ?? /* @__PURE__ */ new Date(), p = { ...this.timezoneOverrides, ...t }, u = sn(a, m, p);
      if (u == null)
        return;
      e.debug(() => {
        console.log(`Extracting timezone: '${a}' into: ${u} for: ${n.start}`);
      });
      let y = n.start.get("timezoneOffset");
      y !== null && u != y && (n.start.isCertain("timezoneOffset") || a != o2[1]) || n.start.isOnlyDate() && a != o2[1] || (n.text += o2[0], n.start.isCertain("timezoneOffset") || n.start.assign("timezoneOffset", u), n.end != null && !n.end.isCertain("timezoneOffset") && n.end.assign("timezoneOffset", u));
    }), r;
  }
};
var rm = new RegExp("^\\s*(?:\\(?(?:GMT|UTC)\\s?)?([+-])(\\d{1,2})(?::?(\\d{2}))?\\)?", "i");
var tm = 1;
var nm = 2;
var sm = 3;
var te = class {
  refine(e, r) {
    return r.forEach(function(t) {
      if (t.start.isCertain("timezoneOffset"))
        return;
      let n = e.text.substring(t.index + t.text.length), i = rm.exec(n);
      if (!i)
        return;
      e.debug(() => {
        console.log(`Extracting timezone: '${i[0]}' into : ${t}`);
      });
      let o2 = parseInt(i[nm]), a = parseInt(i[sm] || "0"), m = o2 * 60 + a;
      m > 14 * 60 || (i[tm] === "-" && (m = -m), t.end != null && t.end.assign("timezoneOffset", m), t.start.assign("timezoneOffset", m), t.text += i[0]);
    }), r;
  }
};
var pe = class {
  refine(e, r) {
    if (r.length < 2)
      return r;
    let t = [], n = r[0];
    for (let i = 1; i < r.length; i++) {
      let o2 = r[i];
      if (o2.index >= n.index + n.text.length) {
        t.push(n), n = o2;
        continue;
      }
      let a = null, m = null;
      o2.text.length > n.text.length ? (a = o2, m = n) : (a = n, m = o2), e.debug(() => {
        console.log(`${this.constructor.name} remove ${m} by ${a}`);
      }), n = a;
    }
    return n != null && t.push(n), t;
  }
};
var cr = class {
  refine(e, r) {
    return e.option.forwardDate && r.forEach((t) => {
      let n = ot(e.refDate);
      if (t.start.isOnlyTime() && n.isAfter(t.start.dayjs()) && (n = n.add(1, "day"), ye(t.start, n), t.end && t.end.isOnlyTime() && (ye(t.end, n), t.start.dayjs().isAfter(t.end.dayjs()) && (n = n.add(1, "day"), ye(t.end, n))), e.debug(() => {
        console.log(`${this.constructor.name} adjusted ${t} time result (${t.start})`);
      })), t.start.isOnlyWeekdayComponent() && n.isAfter(t.start.dayjs()) && (n.day() >= t.start.get("weekday") ? n = n.day(t.start.get("weekday") + 7) : n = n.day(t.start.get("weekday")), t.start.imply("day", n.date()), t.start.imply("month", n.month() + 1), t.start.imply("year", n.year()), e.debug(() => {
        console.log(`${this.constructor.name} adjusted ${t} weekday (${t.start})`);
      }), t.end && t.end.isOnlyWeekdayComponent() && (n.day() > t.end.get("weekday") ? n = n.day(t.end.get("weekday") + 7) : n = n.day(t.end.get("weekday")), t.end.imply("day", n.date()), t.end.imply("month", n.month() + 1), t.end.imply("year", n.year()), e.debug(() => {
        console.log(`${this.constructor.name} adjusted ${t} weekday (${t.end})`);
      }))), t.start.isDateWithUnknownYear() && n.isAfter(t.start.dayjs()))
        for (let i = 0; i < 3 && n.isAfter(t.start.dayjs()); i++)
          t.start.imply("year", t.start.get("year") + 1), e.debug(() => {
            console.log(`${this.constructor.name} adjusted ${t} year (${t.start})`);
          }), t.end && !t.end.isCertain("year") && (t.end.imply("year", t.end.get("year") + 1), e.debug(() => {
            console.log(`${this.constructor.name} adjusted ${t} month (${t.start})`);
          }));
    }), r;
  }
};
var gr = class extends dn {
  constructor(e) {
    super(), this.strictMode = e;
  }
  isValid(e, r) {
    return r.text.replace(" ", "").match(/^\d*(\.\d*)?$/) ? (e.debug(() => {
      console.log(`Removing unlikely result '${r.text}'`);
    }), false) : r.start.isValidDate() ? r.end && !r.end.isValidDate() ? (e.debug(() => {
      console.log(`Removing invalid result: ${r} (${r.end})`);
    }), false) : this.strictMode ? this.isStrictModeValid(e, r) : true : (e.debug(() => {
      console.log(`Removing invalid result: ${r} (${r.start})`);
    }), false);
  }
  isStrictModeValid(e, r) {
    return r.start.isOnlyWeekdayComponent() ? (e.debug(() => {
      console.log(`(Strict) Removing weekday only component: ${r} (${r.end})`);
    }), false) : r.start.isOnlyTime() && (!r.start.isCertain("hour") || !r.start.isCertain("minute")) ? (e.debug(() => {
      console.log(`(Strict) Removing uncertain time component: ${r} (${r.end})`);
    }), false) : true;
  }
};
var om = new RegExp("([0-9]{4})\\-([0-9]{1,2})\\-([0-9]{1,2})(?:T([0-9]{1,2}):([0-9]{1,2})(?::([0-9]{1,2})(?:\\.(\\d{1,4}))?)?(Z|([+-]\\d{2}):?(\\d{2})?)?)?(?=\\W|$)", "i");
var am = 1;
var mm = 2;
var fm = 3;
var Ci = 4;
var dm = 5;
var Mi = 6;
var Ii = 7;
var um = 8;
var Di = 9;
var Ui = 10;
var ie = class extends f {
  innerPattern() {
    return om;
  }
  innerExtract(e, r) {
    let t = e.createParsingComponents({ year: parseInt(r[am]), month: parseInt(r[mm]), day: parseInt(r[fm]) });
    if (r[Ci] != null && (t.assign("hour", parseInt(r[Ci])), t.assign("minute", parseInt(r[dm])), r[Mi] != null && t.assign("second", parseInt(r[Mi])), r[Ii] != null && t.assign("millisecond", parseInt(r[Ii])), r[um] != null)) {
      let n = 0;
      if (r[Di]) {
        let i = parseInt(r[Di]), o2 = 0;
        r[Ui] != null && (o2 = parseInt(r[Ui])), n = i * 60, n < 0 ? n -= o2 : n += o2;
      }
      t.assign("timezoneOffset", n);
    }
    return t.addTag("parser/ISOFormatParser");
  }
};
var yr = class extends K {
  mergeResults(e, r, t) {
    let n = t.clone();
    return n.index = r.index, n.text = r.text + e + n.text, n.start.assign("weekday", r.start.get("weekday")), n.end && n.end.assign("weekday", r.start.get("weekday")), n;
  }
  shouldMergeResults(e, r, t) {
    return r.start.isOnlyWeekdayComponent() && !r.start.isCertain("hour") && t.start.isCertain("day") && e.match(/^,?\s*$/) != null;
  }
};
function _(s7, e = false) {
  return s7.parsers.unshift(new ie()), s7.refiners.unshift(new yr()), s7.refiners.unshift(new te()), s7.refiners.unshift(new pe()), s7.refiners.push(new lr()), s7.refiners.push(new pe()), s7.refiners.push(new cr()), s7.refiners.push(new gr(e)), s7;
}
function U(s7) {
  let e = ot(s7.instant), r = new l2(s7, {});
  return E2(r, e), nn(r, e), s7.timezoneOffset !== null && r.assign("timezoneOffset", e.utcOffset()), r.addTag("casualReference/now"), r;
}
function M(s7) {
  let e = ot(s7.instant), r = new l2(s7, {});
  return E2(r, e), L(r, e), r.addTag("casualReference/today"), r;
}
function b2(s7) {
  return he(s7, 1).addTag("casualReference/yesterday");
}
function he(s7, e) {
  return le(s7, -e);
}
function W(s7) {
  return le(s7, 1).addTag("casualReference/tomorrow");
}
function le(s7, e) {
  let r = ot(s7.instant), t = new l2(s7, {});
  return r = r.add(e, "day"), E2(t, r), L(t, r), t;
}
function bi(s7, e = 22) {
  let r = ot(s7.instant), t = new l2(s7, {});
  return E2(t, r), t.imply("hour", e), t.imply("meridiem", d.PM), t.addTag("casualReference/tonight"), t;
}
function un(s7, e = 0) {
  let r = ot(s7.instant), t = new l2(s7, {});
  return r.hour() < 6 && (r = r.add(-1, "day")), E2(t, r), t.imply("hour", e), t;
}
function ve(s7, e = 20) {
  let r = new l2(s7, {});
  return r.imply("meridiem", d.PM), r.imply("hour", e), r.addTag("casualReference/evening"), r;
}
function pn(s7, e = 20) {
  let r = ot(s7.instant), t = new l2(s7, {});
  return r = r.add(-1, "day"), E2(t, r), t.imply("hour", e), t.imply("meridiem", d.PM), t.addTag("casualReference/yesterday"), t.addTag("casualReference/evening"), t;
}
function Pe(s7) {
  let e = new l2(s7, {}), r = ot(s7.instant);
  return r.hour() > 2 && pi(e, r), e.assign("hour", 0), e.imply("minute", 0), e.imply("second", 0), e.imply("millisecond", 0), e.addTag("casualReference/midnight"), e;
}
function Fe(s7, e = 6) {
  let r = new l2(s7, {});
  return r.imply("meridiem", d.AM), r.imply("hour", e), r.imply("minute", 0), r.imply("second", 0), r.imply("millisecond", 0), r.addTag("casualReference/morning"), r;
}
function Wi(s7, e = 15) {
  let r = new l2(s7, {});
  return r.imply("meridiem", d.PM), r.imply("hour", e), r.imply("minute", 0), r.imply("second", 0), r.imply("millisecond", 0), r.addTag("casualReference/afternoon"), r;
}
function je(s7) {
  let e = new l2(s7, {});
  return e.imply("meridiem", d.AM), e.imply("hour", 12), e.imply("minute", 0), e.imply("second", 0), e.imply("millisecond", 0), e.addTag("casualReference/noon"), e;
}
var lm = /(now|today|tonight|tomorrow|tmr|tmrw|yesterday|last\s*night)(?=\W|$)/i;
var Tr = class extends f {
  innerPattern(e) {
    return lm;
  }
  innerExtract(e, r) {
    let t = ot(e.refDate), n = r[0].toLowerCase(), i = e.createParsingComponents();
    switch (n) {
      case "now":
        i = U(e.reference);
        break;
      case "today":
        i = M(e.reference);
        break;
      case "yesterday":
        i = b2(e.reference);
        break;
      case "tomorrow":
      case "tmr":
      case "tmrw":
        i = W(e.reference);
        break;
      case "tonight":
        i = bi(e.reference);
        break;
      default:
        n.match(/last\s*night/) && (t.hour() > 6 && (t = t.add(-1, "day")), E2(i, t), i.imply("hour", 0));
        break;
    }
    return i.addTag("parser/ENCasualDateParser"), i;
  }
};
var cm = /(?:this)?\s{0,3}(morning|afternoon|evening|night|midnight|midday|noon)(?=\W|$)/i;
var hr = class extends f {
  innerPattern() {
    return cm;
  }
  innerExtract(e, r) {
    let t = null;
    switch (r[1].toLowerCase()) {
      case "afternoon":
        t = Wi(e.reference);
        break;
      case "evening":
      case "night":
        t = ve(e.reference);
        break;
      case "midnight":
        t = Pe(e.reference);
        break;
      case "morning":
        t = Fe(e.reference);
        break;
      case "noon":
      case "midday":
        t = je(e.reference);
        break;
    }
    return t && t.addTag("parser/ENCasualTimeParser"), t;
  }
};
function k(s7, e, r) {
  let t = s7.getDateWithAdjustedTimezone(), n = gm(t, e, r), i = new l2(s7);
  return i = fn(i, { day: n }), i.assign("weekday", e), i;
}
function gm(s7, e, r) {
  let t = s7.getDay();
  switch (r) {
    case "this":
      return ln(s7, e);
    case "last":
      return ki(s7, e);
    case "next":
      return t == T2.SUNDAY ? e == T2.SUNDAY ? 7 : e : t == T2.SATURDAY ? e == T2.SATURDAY ? 7 : e == T2.SUNDAY ? 8 : 1 + e : e < t && e != T2.SUNDAY ? ln(s7, e) : ln(s7, e) + 7;
  }
  return ym(s7, e);
}
function ym(s7, e) {
  let r = ki(s7, e), t = ln(s7, e);
  return t < -r ? t : r;
}
function ln(s7, e) {
  let r = s7.getDay(), t = e - r;
  return t < 0 && (t += 7), t;
}
function ki(s7, e) {
  let r = s7.getDay(), t = e - r;
  return t >= 0 && (t -= 7), t;
}
var Tm = new RegExp(`(?:(?:\\,|\\(|\\\uFF08)\\s*)?(?:on\\s*?)?(?:(this|last|past|next)\\s*)?(${c2(jn)})(?:\\s*(?:\\,|\\)|\\\uFF09))?(?:\\s*(this|last|past|next)\\s*week)?(?=\\W|$)`, "i");
var hm = 1;
var Pm = 2;
var xm = 3;
var Pr = class extends f {
  innerPattern() {
    return Tm;
  }
  innerExtract(e, r) {
    let t = r[Pm].toLowerCase(), n = jn[t], i = r[hm], o2 = r[xm], a = i || o2;
    a = a || "", a = a.toLowerCase();
    let m = null;
    return a == "last" || a == "past" ? m = "last" : a == "next" ? m = "next" : a == "this" && (m = "this"), k(e.reference, n, m);
  }
};
var Em = new RegExp(`(this|last|past|next|after\\s*this)\\s*(${c2(rr)})(?=\\s*)(?=\\W|$)`, "i");
var Am = 1;
var wm = 2;
var xr = class extends f {
  innerPattern() {
    return Em;
  }
  innerExtract(e, r) {
    let t = r[Am].toLowerCase(), n = r[wm].toLowerCase(), i = rr[n];
    if (t == "next" || t.startsWith("after")) {
      let m = {};
      return m[i] = 1, l2.createRelativeFromReference(e.reference, m);
    }
    if (t == "last" || t == "past") {
      let m = {};
      return m[i] = -1, l2.createRelativeFromReference(e.reference, m);
    }
    let o2 = e.createParsingComponents(), a = ot(e.reference.instant);
    return n.match(/week/i) ? (a = a.add(-a.get("d"), "d"), o2.imply("day", a.date()), o2.imply("month", a.month() + 1), o2.imply("year", a.year())) : n.match(/month/i) ? (a = a.add(-a.date() + 1, "d"), o2.imply("day", a.date()), o2.assign("year", a.year()), o2.assign("month", a.month() + 1)) : n.match(/year/i) && (a = a.add(-a.date() + 1, "d"), a = a.add(-a.month(), "month"), o2.imply("day", a.date()), o2.imply("month", a.month() + 1), o2.assign("year", a.year())), o2;
  }
};
var Nm = new RegExp("([^\\d]|^)([0-3]{0,1}[0-9]{1})[\\/\\.\\-]([0-3]{0,1}[0-9]{1})(?:[\\/\\.\\-]([0-9]{4}|[0-9]{2}))?(\\W|$)", "i");
var _m = 1;
var Om = 5;
var Si = 2;
var $i = 3;
var Kn = 4;
var O2 = class {
  constructor(e) {
    this.groupNumberMonth = e ? $i : Si, this.groupNumberDay = e ? Si : $i;
  }
  pattern() {
    return Nm;
  }
  extract(e, r) {
    let t = r.index + r[_m].length, n = r.index + r[0].length - r[Om].length;
    if (t > 0 && e.text.substring(0, t).match("\\d/?$") || n < e.text.length && e.text.substring(n).match("^/?\\d"))
      return;
    let i = e.text.substring(t, n);
    if (i.match(/^\d\.\d$/) || i.match(/^\d\.\d{1,2}\.\d{1,2}\s*$/) || !r[Kn] && i.indexOf("/") < 0)
      return;
    let o2 = e.createParsingResult(t, i), a = parseInt(r[this.groupNumberMonth]), m = parseInt(r[this.groupNumberDay]);
    if ((a < 1 || a > 12) && a > 12)
      if (m >= 1 && m <= 12 && a <= 31)
        [m, a] = [a, m];
      else
        return null;
    if (m < 1 || m > 31)
      return null;
    if (o2.start.assign("day", m), o2.start.assign("month", a), r[Kn]) {
      let p = parseInt(r[Kn]), u = z(p);
      o2.start.assign("year", u);
    } else {
      let p = R(e.refDate, m, a);
      o2.start.imply("year", p);
    }
    return o2;
  }
};
var Cm = new RegExp(`(this|last|past|next|after|\\+|-)\\s*(${se})(?=\\W|$)`, "i");
var Mm = new RegExp(`(this|last|past|next|after|\\+|-)\\s*(${ue})(?=\\W|$)`, "i");
var Rr = class extends f {
  constructor(e = true) {
    super(), this.allowAbbreviations = e;
  }
  innerPattern() {
    return this.allowAbbreviations ? Cm : Mm;
  }
  innerExtract(e, r) {
    let t = r[1].toLowerCase(), n = V(r[2]);
    if (!n)
      return null;
    switch (t) {
      case "last":
      case "past":
      case "-":
        n = A(n);
        break;
    }
    return l2.createRelativeFromReference(e.reference, n);
  }
};
function Im(s7) {
  return s7.text.match(/^[+-]/i) != null;
}
function Yi(s7) {
  return s7.text.match(/^-/i) != null;
}
var Er = class extends K {
  shouldMergeResults(e, r, t) {
    return e.match(/^\s*$/i) ? Im(t) || Yi(t) : false;
  }
  mergeResults(e, r, t, n) {
    let i = V(t.text);
    Yi(t) && (i = A(i));
    let o2 = l2.createRelativeFromReference(new x2(r.start.date()), i);
    return new h(r.reference, r.index, `${r.text}${e}${t.text}`, o2);
  }
};
function Gi(s7) {
  return s7.text.match(/\s+(before|from)$/i) != null;
}
function Dm(s7) {
  return s7.text.match(/\s+(after|since)$/i) != null;
}
var Ar = class extends K {
  patternBetween() {
    return /^\s*$/i;
  }
  shouldMergeResults(e, r, t) {
    return !e.match(this.patternBetween()) || !Gi(r) && !Dm(r) ? false : !!t.start.get("day") && !!t.start.get("month") && !!t.start.get("year");
  }
  mergeResults(e, r, t) {
    let n = V(r.text);
    Gi(r) && (n = A(n));
    let i = l2.createRelativeFromReference(new x2(t.start.date()), n);
    return new h(t.reference, r.index, `${r.text}${e}${t.text}`, i);
  }
};
var Um = new RegExp(`^\\s*(${fe})`, "i");
var bm = 1;
var wr = class {
  refine(e, r) {
    return r.forEach(function(t) {
      if (!t.start.isDateWithUnknownYear())
        return;
      let n = e.text.substring(t.index + t.text.length), i = Um.exec(n);
      if (!i)
        return;
      e.debug(() => {
        console.log(`Extracting year: '${i[0]}' into : ${t}`);
      });
      let o2 = de(i[bm]);
      t.end != null && t.end.assign("year", o2), t.start.assign("year", o2), t.text += i[0];
    }), r;
  }
};
var xe = class {
  createCasualConfiguration(e = false) {
    let r = this.createConfiguration(false, e);
    return r.parsers.push(new Tr()), r.parsers.push(new hr()), r.parsers.push(new ir()), r.parsers.push(new xr()), r.parsers.push(new Rr()), r;
  }
  createConfiguration(e = true, r = false) {
    let t = _({ parsers: [new O2(r), new tr(e), new nr(), new sr(r), new Pr(), new ar(), new fr(e), new dr(e), new ur(e)], refiners: [new Be()] }, e);
    return t.parsers.unshift(new or(e)), t.refiners.unshift(new Ar()), t.refiners.unshift(new Er()), t.refiners.unshift(new pe()), t.refiners.push(new Be()), t.refiners.push(new wr()), t.refiners.push(new pr()), t;
  }
};
var g2 = class s3 {
  constructor(e) {
    this.defaultConfig = new xe(), e = e || this.defaultConfig.createCasualConfiguration(), this.parsers = [...e.parsers], this.refiners = [...e.refiners];
  }
  clone() {
    return new s3({ parsers: [...this.parsers], refiners: [...this.refiners] });
  }
  parseDate(e, r, t) {
    let n = this.parse(e, r, t);
    return n.length > 0 ? n[0].start.date() : null;
  }
  parse(e, r, t) {
    let n = new qn(e, r, t), i = [];
    return this.parsers.forEach((o2) => {
      let a = s3.executeParser(n, o2);
      i = i.concat(a);
    }), i.sort((o2, a) => o2.index - a.index), this.refiners.forEach(function(o2) {
      i = o2.refine(n, i);
    }), i;
  }
  static executeParser(e, r) {
    let t = [], n = r.pattern(e), i = e.text, o2 = e.text, a = n.exec(o2);
    for (; a; ) {
      let m = a.index + i.length - o2.length;
      a.index = m;
      let p = r.extract(e, a);
      if (!p) {
        o2 = i.substring(a.index + 1), a = n.exec(o2);
        continue;
      }
      let u = null;
      p instanceof h ? u = p : p instanceof l2 ? (u = e.createParsingResult(a.index, a[0]), u.start = p) : u = e.createParsingResult(a.index, a[0], p);
      let y = u.index, ae = u.text;
      e.debug(() => console.log(`${r.constructor.name} extracted (at index=${y}) '${ae}'`)), t.push(u), o2 = i.substring(y + ae.length), a = n.exec(o2);
    }
    return t;
  }
};
var qn = class {
  constructor(e, r, t) {
    this.text = e, this.reference = new x2(r), this.option = t ?? {}, this.refDate = this.reference.instant;
  }
  createParsingComponents(e) {
    return e instanceof l2 ? e : new l2(this.reference, e);
  }
  createParsingResult(e, r, t, n) {
    let i = typeof r == "string" ? r : this.text.substring(e, r), o2 = t ? this.createParsingComponents(t) : null, a = n ? this.createParsingComponents(n) : null;
    return new h(this.reference, e, i, o2, a);
  }
  debug(e) {
    this.option.debug && (this.option.debug instanceof Function ? this.option.debug(e) : this.option.debug.debug(e));
  }
};
var cn = new xe();
var Nr = new g2(cn.createCasualConfiguration(false));
var Zn = new g2(cn.createConfiguration(true, false));
var Wm = new g2(cn.createCasualConfiguration(true));
function km(s7, e, r) {
  return Nr.parse(s7, e, r);
}
function Sm(s7, e, r) {
  return Nr.parseDate(s7, e, r);
}
var eo = {};
j2(eo, { Chrono: () => g2, Meridiem: () => d, ParsingComponents: () => l2, ParsingResult: () => h, ReferenceWithTimezone: () => x2, Weekday: () => T2, casual: () => ts, createCasualConfiguration: () => Qi, createConfiguration: () => ns, parse: () => Qm, parseDate: () => ef, strict: () => Jm });
var _r = class extends C {
  primaryPrefix() {
    return "(?:(?:um|von)\\s*)?";
  }
  followingPhase() {
    return "\\s*(?:\\-|\\\u2013|\\~|\\\u301C|bis)\\s*";
  }
  extractPrimaryTimeComponents(e, r) {
    return r[0].match(/^\s*\d{4}\s*$/) ? null : super.extractPrimaryTimeComponents(e, r);
  }
};
var Jn = { sonntag: 0, so: 0, montag: 1, mo: 1, dienstag: 2, di: 2, mittwoch: 3, mi: 3, donnerstag: 4, do: 4, freitag: 5, fr: 5, samstag: 6, sa: 6 };
var Qn = { januar: 1, j\u00E4nner: 1, janner: 1, jan: 1, "jan.": 1, februar: 2, feber: 2, feb: 2, "feb.": 2, m\u00E4rz: 3, maerz: 3, m\u00E4r: 3, "m\xE4r.": 3, mrz: 3, "mrz.": 3, april: 4, apr: 4, "apr.": 4, mai: 5, juni: 6, jun: 6, "jun.": 6, juli: 7, jul: 7, "jul.": 7, august: 8, aug: 8, "aug.": 8, september: 9, sep: 9, "sep.": 9, sept: 9, "sept.": 9, oktober: 10, okt: 10, "okt.": 10, november: 11, nov: 11, "nov.": 11, dezember: 12, dez: 12, "dez.": 12 };
var Xn = { eins: 1, eine: 1, einem: 1, einen: 1, einer: 1, zwei: 2, drei: 3, vier: 4, f\u00FCnf: 5, fuenf: 5, sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10, elf: 11, zw\u00F6lf: 12, zwoelf: 12 };
var Or = { sek: "second", sekunde: "second", sekunden: "second", min: "minute", minute: "minute", minuten: "minute", h: "hour", std: "hour", stunde: "hour", stunden: "hour", tag: "d", tage: "d", tagen: "d", woche: "week", wochen: "week", monat: "month", monate: "month", monaten: "month", monats: "month", quartal: "quarter", quartals: "quarter", quartale: "quarter", quartalen: "quarter", a: "year", j: "year", jr: "year", jahr: "year", jahre: "year", jahren: "year", jahres: "year" };
var es = `(?:${c2(Xn)}|[0-9]+|[0-9]+\\.[0-9]+|halb?|halbe?|einigen?|wenigen?|mehreren?)`;
function rs(s7) {
  let e = s7.toLowerCase();
  return Xn[e] !== void 0 ? Xn[e] : e === "ein" || e === "einer" || e === "einem" || e === "einen" || e === "eine" ? 1 : e.match(/wenigen/) ? 2 : e.match(/halb/) || e.match(/halben/) ? 0.5 : e.match(/einigen/) ? 3 : e.match(/mehreren/) ? 7 : parseFloat(e);
}
var Fi = "(?:[0-9]{1,4}(?:\\s*[vn]\\.?\\s*(?:C(?:hr)?|(?:u\\.?|d\\.?(?:\\s*g\\.?)?)?\\s*Z)\\.?|\\s*(?:u\\.?|d\\.?(?:\\s*g\\.)?)\\s*Z\\.?)?)";
function ji(s7) {
  if (/v/i.test(s7))
    return -parseInt(s7.replace(/[^0-9]+/gi, ""));
  if (/n/i.test(s7))
    return parseInt(s7.replace(/[^0-9]+/gi, ""));
  if (/z/i.test(s7))
    return parseInt(s7.replace(/[^0-9]+/gi, ""));
  let e = parseInt(s7);
  return z(e);
}
var Li = `(${es})\\s{0,5}(${c2(Or)})\\s{0,5}`;
var vi = new RegExp(Li, "i");
var zi = Y("", Li);
function Hi(s7) {
  let e = {}, r = s7, t = vi.exec(r);
  for (; t; )
    $m(e, t), r = r.substring(t[0].length), t = vi.exec(r);
  return e;
}
function $m(s7, e) {
  let r = rs(e[1]), t = Or[e[2].toLowerCase()];
  s7[t] = r;
}
var Ym = new RegExp(`(?:(?:\\,|\\(|\\\uFF08)\\s*)?(?:a[mn]\\s*?)?(?:(diese[mn]|letzte[mn]|n(?:\xE4|ae)chste[mn])\\s*)?(${c2(Jn)})(?:\\s*(?:\\,|\\)|\\\uFF09))?(?:\\s*(diese|letzte|n(?:\xE4|ae)chste)\\s*woche)?(?=\\W|$)`, "i");
var Gm = 1;
var Bm = 3;
var vm = 2;
var Cr = class extends f {
  innerPattern() {
    return Ym;
  }
  innerExtract(e, r) {
    let t = r[vm].toLowerCase(), n = Jn[t], i = r[Gm], o2 = r[Bm], a = i || o2;
    a = a || "", a = a.toLowerCase();
    let m = null;
    return a.match(/letzte/) ? m = "last" : a.match(/chste/) ? m = "next" : a.match(/diese/) && (m = "this"), k(e.reference, n, m);
  }
};
var Fm = new RegExp("(^|\\s|T)(?:(?:um|von)\\s*)?(\\d{1,2})(?:h|:)?(?:(\\d{1,2})(?:m|:)?)?(?:(\\d{1,2})(?:s)?)?(?:\\s*Uhr)?(?:\\s*(morgens|vormittags|nachmittags|abends|nachts|am\\s+(?:Morgen|Vormittag|Nachmittag|Abend)|in\\s+der\\s+Nacht))?(?=\\W|$)", "i");
var jm = new RegExp("^\\s*(\\-|\\\u2013|\\~|\\\u301C|bis(?:\\s+um)?|\\?)\\s*(\\d{1,2})(?:h|:)?(?:(\\d{1,2})(?:m|:)?)?(?:(\\d{1,2})(?:s)?)?(?:\\s*Uhr)?(?:\\s*(morgens|vormittags|nachmittags|abends|nachts|am\\s+(?:Morgen|Vormittag|Nachmittag|Abend)|in\\s+der\\s+Nacht))?(?=\\W|$)", "i");
var Lm = 2;
var Vi = 3;
var Ki = 4;
var qi = 5;
var Mr = class s4 {
  pattern(e) {
    return Fm;
  }
  extract(e, r) {
    let t = e.createParsingResult(r.index + r[1].length, r[0].substring(r[1].length));
    if (t.text.match(/^\d{4}$/) || (t.start = s4.extractTimeComponent(t.start.clone(), r), !t.start))
      return r.index += r[0].length, null;
    let n = e.text.substring(r.index + r[0].length), i = jm.exec(n);
    return i && (t.end = s4.extractTimeComponent(t.start.clone(), i), t.end && (t.text += i[0])), t;
  }
  static extractTimeComponent(e, r) {
    let t = 0, n = 0, i = null;
    if (t = parseInt(r[Lm]), r[Vi] != null && (n = parseInt(r[Vi])), n >= 60 || t > 24)
      return null;
    if (t >= 12 && (i = d.PM), r[qi] != null) {
      if (t > 12)
        return null;
      let o2 = r[qi].toLowerCase();
      o2.match(/morgen|vormittag/) && (i = d.AM, t == 12 && (t = 0)), o2.match(/nachmittag|abend/) && (i = d.PM, t != 12 && (t += 12)), o2.match(/nacht/) && (t == 12 ? (i = d.AM, t = 0) : t < 6 ? i = d.AM : (i = d.PM, t += 12));
    }
    if (e.assign("hour", t), e.assign("minute", n), i !== null ? e.assign("meridiem", i) : t < 12 ? e.imply("meridiem", d.AM) : e.imply("meridiem", d.PM), r[Ki] != null) {
      let o2 = parseInt(r[Ki]);
      if (o2 >= 60)
        return null;
      e.assign("second", o2);
    }
    return e;
  }
};
var Ir = class extends w {
  patternBetween() {
    return /^\s*(bis(?:\s*(?:am|zum))?|-)\s*$/i;
  }
};
var Dr = class extends N {
  patternBetween() {
    return new RegExp("^\\s*(T|um|am|,|-)?\\s*$");
  }
};
var Re = class s5 extends f {
  innerPattern(e) {
    return /(diesen)?\s*(morgen|vormittag|mittags?|nachmittag|abend|nacht|mitternacht)(?=\W|$)/i;
  }
  innerExtract(e, r) {
    let t = ot(e.refDate), n = r[2].toLowerCase(), i = e.createParsingComponents();
    return L(i, t), s5.extractTimeComponents(i, n);
  }
  static extractTimeComponents(e, r) {
    switch (r) {
      case "morgen":
        e.imply("hour", 6), e.imply("minute", 0), e.imply("second", 0), e.imply("meridiem", d.AM);
        break;
      case "vormittag":
        e.imply("hour", 9), e.imply("minute", 0), e.imply("second", 0), e.imply("meridiem", d.AM);
        break;
      case "mittag":
      case "mittags":
        e.imply("hour", 12), e.imply("minute", 0), e.imply("second", 0), e.imply("meridiem", d.AM);
        break;
      case "nachmittag":
        e.imply("hour", 15), e.imply("minute", 0), e.imply("second", 0), e.imply("meridiem", d.PM);
        break;
      case "abend":
        e.imply("hour", 18), e.imply("minute", 0), e.imply("second", 0), e.imply("meridiem", d.PM);
        break;
      case "nacht":
        e.imply("hour", 22), e.imply("minute", 0), e.imply("second", 0), e.imply("meridiem", d.PM);
        break;
      case "mitternacht":
        e.get("hour") > 1 && (e = fn(e, { day: 1 })), e.imply("hour", 0), e.imply("minute", 0), e.imply("second", 0), e.imply("meridiem", d.AM);
        break;
    }
    return e;
  }
};
var Vm = new RegExp("(jetzt|heute|morgen|\xFCbermorgen|uebermorgen|gestern|vorgestern|letzte\\s*nacht)(?:\\s*(morgen|vormittag|mittags?|nachmittag|abend|nacht|mitternacht))?(?=\\W|$)", "i");
var Km = 1;
var qm = 2;
var Ur = class extends f {
  innerPattern(e) {
    return Vm;
  }
  innerExtract(e, r) {
    let t = ot(e.refDate), n = (r[Km] || "").toLowerCase(), i = (r[qm] || "").toLowerCase(), o2 = e.createParsingComponents();
    switch (n) {
      case "jetzt":
        o2 = U(e.reference);
        break;
      case "heute":
        o2 = M(e.reference);
        break;
      case "morgen":
        re(o2, t);
        break;
      case "\xFCbermorgen":
      case "uebermorgen":
        t = t.add(1, "day"), re(o2, t);
        break;
      case "gestern":
        t = t.add(-1, "day"), E2(o2, t), L(o2, t);
        break;
      case "vorgestern":
        t = t.add(-2, "day"), E2(o2, t), L(o2, t);
        break;
      default:
        n.match(/letzte\s*nacht/) && (t.hour() > 6 && (t = t.add(-1, "day")), E2(o2, t), o2.imply("hour", 0));
        break;
    }
    return i && (o2 = Re.extractTimeComponents(o2, i)), o2;
  }
};
var Zm = new RegExp(`(?:am\\s*?)?(?:den\\s*?)?([0-9]{1,2})\\.(?:\\s*(?:bis(?:\\s*(?:am|zum))?|\\-|\\\u2013|\\s)\\s*([0-9]{1,2})\\.?)?\\s*(${c2(Qn)})(?:(?:-|/|,?\\s*)(${Fi}(?![^\\s]\\d)))?(?=\\W|$)`, "i");
var Zi = 1;
var Xi = 2;
var Xm = 3;
var Ji = 4;
var br = class extends f {
  innerPattern() {
    return Zm;
  }
  innerExtract(e, r) {
    let t = e.createParsingResult(r.index, r[0]), n = Qn[r[Xm].toLowerCase()], i = parseInt(r[Zi]);
    if (i > 31)
      return r.index = r.index + r[Zi].length, null;
    if (t.start.assign("month", n), t.start.assign("day", i), r[Ji]) {
      let o2 = ji(r[Ji]);
      t.start.assign("year", o2);
    } else {
      let o2 = R(e.refDate, i, n);
      t.start.imply("year", o2);
    }
    if (r[Xi]) {
      let o2 = parseInt(r[Xi]);
      t.end = t.start.clone(), t.end.assign("day", o2);
    }
    return t;
  }
};
var Wr = class extends f {
  constructor() {
    super();
  }
  innerPattern() {
    return new RegExp(`(?:\\s*((?:n\xE4chste|kommende|folgende|letzte|vergangene|vorige|vor(?:her|an)gegangene)(?:s|n|m|r)?|vor|in)\\s*)?(${es})?(?:\\s*(n\xE4chste|kommende|folgende|letzte|vergangene|vorige|vor(?:her|an)gegangene)(?:s|n|m|r)?)?\\s*(${c2(Or)})`, "i");
  }
  innerExtract(e, r) {
    let t = r[2] ? rs(r[2]) : 1, n = Or[r[4].toLowerCase()], i = {};
    i[n] = t;
    let o2 = r[1] || r[3] || "";
    if (o2 = o2.toLowerCase(), !!o2)
      return (/vor/.test(o2) || /letzte/.test(o2) || /vergangen/.test(o2)) && (i = A(i)), l2.createRelativeFromReference(e.reference, i);
  }
};
var kr = class extends f {
  innerPattern() {
    return new RegExp(`(?:in|f\xFCr|w\xE4hrend)\\s*(${zi})(?=\\W|$)`, "i");
  }
  innerExtract(e, r) {
    let t = Hi(r[1]);
    return l2.createRelativeFromReference(e.reference, t);
  }
};
var ts = new g2(Qi());
var Jm = new g2(ns(true));
function Qm(s7, e, r) {
  return ts.parse(s7, e, r);
}
function ef(s7, e, r) {
  return ts.parseDate(s7, e, r);
}
function Qi(s7 = true) {
  let e = ns(false, s7);
  return e.parsers.unshift(new Re()), e.parsers.unshift(new Ur()), e.parsers.unshift(new Wr()), e;
}
function ns(s7 = true, e = true) {
  return _({ parsers: [new ie(), new O2(e), new _r(), new Mr(), new br(), new Cr(), new kr()], refiners: [new Ir(), new Dr()] }, s7);
}
var lo = {};
j2(lo, { Chrono: () => g2, Meridiem: () => d, ParsingComponents: () => l2, ParsingResult: () => h, ReferenceWithTimezone: () => x2, Weekday: () => T2, casual: () => us, createCasualConfiguration: () => po, createConfiguration: () => ps, parse: () => lf, parseDate: () => cf, strict: () => pf });
var Sr = class extends f {
  innerPattern(e) {
    return /(maintenant|aujourd'hui|demain|hier|cette\s*nuit|la\s*veille)(?=\W|$)/i;
  }
  innerExtract(e, r) {
    let t = ot(e.refDate), n = r[0].toLowerCase(), i = e.createParsingComponents();
    switch (n) {
      case "maintenant":
        return U(e.reference);
      case "aujourd'hui":
        return M(e.reference);
      case "hier":
        return b2(e.reference);
      case "demain":
        return W(e.reference);
      default:
        n.match(/cette\s*nuit/) ? (E2(i, t), i.imply("hour", 22), i.imply("meridiem", d.PM)) : n.match(/la\s*veille/) && (t = t.add(-1, "day"), E2(i, t), i.imply("hour", 0));
    }
    return i;
  }
};
var $r = class extends f {
  innerPattern(e) {
    return /(cet?)?\s*(matin|soir|après-midi|aprem|a midi|à minuit)(?=\W|$)/i;
  }
  innerExtract(e, r) {
    let t = r[2].toLowerCase(), n = e.createParsingComponents();
    switch (t) {
      case "apr\xE8s-midi":
      case "aprem":
        n.imply("hour", 14), n.imply("minute", 0), n.imply("meridiem", d.PM);
        break;
      case "soir":
        n.imply("hour", 18), n.imply("minute", 0), n.imply("meridiem", d.PM);
        break;
      case "matin":
        n.imply("hour", 8), n.imply("minute", 0), n.imply("meridiem", d.AM);
        break;
      case "a midi":
        n.imply("hour", 12), n.imply("minute", 0), n.imply("meridiem", d.AM);
        break;
      case "\xE0 minuit":
        n.imply("hour", 0), n.imply("meridiem", d.AM);
        break;
    }
    return n;
  }
};
var Yr = class extends C {
  primaryPrefix() {
    return "(?:(?:[\xE0a])\\s*)?";
  }
  followingPhase() {
    return "\\s*(?:\\-|\\\u2013|\\~|\\\u301C|[\xE0a]|\\?)\\s*";
  }
  extractPrimaryTimeComponents(e, r) {
    return r[0].match(/^\s*\d{4}\s*$/) ? null : super.extractPrimaryTimeComponents(e, r);
  }
};
var Gr = class extends N {
  patternBetween() {
    return new RegExp("^\\s*(T|\xE0|a|au|vers|de|,|-)?\\s*$");
  }
};
var Br = class extends w {
  patternBetween() {
    return /^\s*(à|a|au|-)\s*$/i;
  }
};
var is = { dimanche: 0, dim: 0, lundi: 1, lun: 1, mardi: 2, mar: 2, mercredi: 3, mer: 3, jeudi: 4, jeu: 4, vendredi: 5, ven: 5, samedi: 6, sam: 6 };
var os = { janvier: 1, jan: 1, "jan.": 1, f\u00E9vrier: 2, f\u00E9v: 2, "f\xE9v.": 2, fevrier: 2, fev: 2, "fev.": 2, mars: 3, mar: 3, "mar.": 3, avril: 4, avr: 4, "avr.": 4, mai: 5, juin: 6, jun: 6, juillet: 7, juil: 7, jul: 7, "jul.": 7, ao\u00FBt: 8, aout: 8, septembre: 9, sep: 9, "sep.": 9, sept: 9, "sept.": 9, octobre: 10, oct: 10, "oct.": 10, novembre: 11, nov: 11, "nov.": 11, d\u00E9cembre: 12, decembre: 12, dec: 12, "dec.": 12 };
var ss = { un: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10, onze: 11, douze: 12, treize: 13 };
var vr = { sec: "second", seconde: "second", secondes: "second", min: "minute", mins: "minute", minute: "minute", minutes: "minute", h: "hour", hr: "hour", hrs: "hour", heure: "hour", heures: "hour", jour: "d", jours: "d", semaine: "week", semaines: "week", mois: "month", trimestre: "quarter", trimestres: "quarter", ans: "year", ann\u00E9e: "year", ann\u00E9es: "year" };
var as = `(?:${c2(ss)}|[0-9]+|[0-9]+\\.[0-9]+|une?\\b|quelques?|demi-?)`;
function ms(s7) {
  let e = s7.toLowerCase();
  return ss[e] !== void 0 ? ss[e] : e === "une" || e === "un" ? 1 : e.match(/quelques?/) ? 3 : e.match(/demi-?/) ? 0.5 : parseFloat(e);
}
var fs = "(?:[0-9]{1,2}(?:er)?)";
function ds(s7) {
  let e = s7.toLowerCase();
  return e = e.replace(/(?:er)$/i, ""), parseInt(e);
}
var to = "(?:[1-9][0-9]{0,3}\\s*(?:AC|AD|p\\.\\s*C(?:hr?)?\\.\\s*n\\.)|[1-2][0-9]{3}|[5-9][0-9])";
function no(s7) {
  if (/AC/i.test(s7))
    return s7 = s7.replace(/BC/i, ""), -parseInt(s7);
  if (/AD/i.test(s7) || /C/i.test(s7))
    return s7 = s7.replace(/[^\d]+/i, ""), parseInt(s7);
  let e = parseInt(s7);
  return e < 100 && (e > 50 ? e = e + 1900 : e = e + 2e3), e;
}
var so = `(${as})\\s{0,5}(${c2(vr)})\\s{0,5}`;
var ro = new RegExp(so, "i");
var gn = Y("", so);
function yn(s7) {
  let e = {}, r = s7, t = ro.exec(r);
  for (; t; )
    tf(e, t), r = r.substring(t[0].length), t = ro.exec(r);
  return e;
}
function tf(s7, e) {
  let r = ms(e[1]), t = vr[e[2].toLowerCase()];
  s7[t] = r;
}
var nf = new RegExp(`(?:(?:\\,|\\(|\\\uFF08)\\s*)?(?:(?:ce)\\s*)?(${c2(is)})(?:\\s*(?:\\,|\\)|\\\uFF09))?(?:\\s*(dernier|prochain)\\s*)?(?=\\W|\\d|$)`, "i");
var sf = 1;
var of = 2;
var Fr = class extends f {
  innerPattern() {
    return nf;
  }
  innerExtract(e, r) {
    let t = r[sf].toLowerCase(), n = is[t];
    if (n === void 0)
      return null;
    let i = r[of];
    i = i || "", i = i.toLowerCase();
    let o2 = null;
    return i == "dernier" ? o2 = "last" : i == "prochain" && (o2 = "next"), k(e.reference, n, o2);
  }
};
var af = new RegExp("(^|\\s|T)(?:(?:[\xE0a])\\s*)?(\\d{1,2})(?:h|:)?(?:(\\d{1,2})(?:m|:)?)?(?:(\\d{1,2})(?:s|:)?)?(?:\\s*(A\\.M\\.|P\\.M\\.|AM?|PM?))?(?=\\W|$)", "i");
var mf = new RegExp("^\\s*(\\-|\\\u2013|\\~|\\\u301C|[\xE0a]|\\?)\\s*(\\d{1,2})(?:h|:)?(?:(\\d{1,2})(?:m|:)?)?(?:(\\d{1,2})(?:s|:)?)?(?:\\s*(A\\.M\\.|P\\.M\\.|AM?|PM?))?(?=\\W|$)", "i");
var ff = 2;
var io = 3;
var oo = 4;
var ao = 5;
var jr = class s6 {
  pattern(e) {
    return af;
  }
  extract(e, r) {
    let t = e.createParsingResult(r.index + r[1].length, r[0].substring(r[1].length));
    if (t.text.match(/^\d{4}$/) || (t.start = s6.extractTimeComponent(t.start.clone(), r), !t.start))
      return r.index += r[0].length, null;
    let n = e.text.substring(r.index + r[0].length), i = mf.exec(n);
    return i && (t.end = s6.extractTimeComponent(t.start.clone(), i), t.end && (t.text += i[0])), t;
  }
  static extractTimeComponent(e, r) {
    let t = 0, n = 0, i = null;
    if (t = parseInt(r[ff]), r[io] != null && (n = parseInt(r[io])), n >= 60 || t > 24)
      return null;
    if (t >= 12 && (i = d.PM), r[ao] != null) {
      if (t > 12)
        return null;
      let o2 = r[ao][0].toLowerCase();
      o2 == "a" && (i = d.AM, t == 12 && (t = 0)), o2 == "p" && (i = d.PM, t != 12 && (t += 12));
    }
    if (e.assign("hour", t), e.assign("minute", n), i !== null ? e.assign("meridiem", i) : t < 12 ? e.imply("meridiem", d.AM) : e.imply("meridiem", d.PM), r[oo] != null) {
      let o2 = parseInt(r[oo]);
      if (o2 >= 60)
        return null;
      e.assign("second", o2);
    }
    return e;
  }
};
var df = new RegExp(`(?:on\\s*?)?(${fs})(?:\\s*(?:au|\\-|\\\u2013|jusqu'au?|\\s)\\s*(${fs}))?(?:-|/|\\s*(?:de)?\\s*)(${c2(os)})(?:(?:-|/|,?\\s*)(${to}(?![^\\s]\\d)))?(?=\\W|$)`, "i");
var mo = 1;
var fo = 2;
var uf = 3;
var uo = 4;
var Lr = class extends f {
  innerPattern() {
    return df;
  }
  innerExtract(e, r) {
    let t = e.createParsingResult(r.index, r[0]), n = os[r[uf].toLowerCase()], i = ds(r[mo]);
    if (i > 31)
      return r.index = r.index + r[mo].length, null;
    if (t.start.assign("month", n), t.start.assign("day", i), r[uo]) {
      let o2 = no(r[uo]);
      t.start.assign("year", o2);
    } else {
      let o2 = R(e.refDate, i, n);
      t.start.imply("year", o2);
    }
    if (r[fo]) {
      let o2 = ds(r[fo]);
      t.end = t.start.clone(), t.end.assign("day", o2);
    }
    return t;
  }
};
var zr = class extends f {
  constructor() {
    super();
  }
  innerPattern() {
    return new RegExp(`il y a\\s*(${gn})(?=(?:\\W|$))`, "i");
  }
  innerExtract(e, r) {
    let t = yn(r[1]), n = A(t);
    return l2.createRelativeFromReference(e.reference, n);
  }
};
var Hr = class extends f {
  innerPattern() {
    return new RegExp(`(?:dans|en|pour|pendant|de)\\s*(${gn})(?=\\W|$)`, "i");
  }
  innerExtract(e, r) {
    let t = yn(r[1]);
    return l2.createRelativeFromReference(e.reference, t);
  }
};
var Vr = class extends f {
  constructor() {
    super();
  }
  innerPattern() {
    return new RegExp(`(?:les?|la|l'|du|des?)\\s*(${as})?(?:\\s*(prochaine?s?|derni[e\xE8]re?s?|pass[\xE9e]e?s?|pr[\xE9e]c[\xE9e]dents?|suivante?s?))?\\s*(${c2(vr)})(?:\\s*(prochaine?s?|derni[e\xE8]re?s?|pass[\xE9e]e?s?|pr[\xE9e]c[\xE9e]dents?|suivante?s?))?`, "i");
  }
  innerExtract(e, r) {
    let t = r[1] ? ms(r[1]) : 1, n = vr[r[3].toLowerCase()], i = {};
    i[n] = t;
    let o2 = r[2] || r[4] || "";
    if (o2 = o2.toLowerCase(), !!o2)
      return (/derni[eè]re?s?/.test(o2) || /pass[ée]e?s?/.test(o2) || /pr[ée]c[ée]dents?/.test(o2)) && (i = A(i)), l2.createRelativeFromReference(e.reference, i);
  }
};
var us = new g2(po());
var pf = new g2(ps(true));
function lf(s7, e, r) {
  return us.parse(s7, e, r);
}
function cf(s7, e, r) {
  return us.parseDate(s7, e, r);
}
function po(s7 = true) {
  let e = ps(false, s7);
  return e.parsers.unshift(new Sr()), e.parsers.unshift(new $r()), e.parsers.unshift(new Vr()), e;
}
function ps(s7 = true, e = true) {
  return _({ parsers: [new O2(e), new Lr(), new Yr(), new jr(), new zr(), new Hr(), new Fr()], refiners: [new Gr(), new Br()] }, s7);
}
var yo = {};
j2(yo, { Chrono: () => g2, Meridiem: () => d, ParsingComponents: () => l2, ParsingResult: () => h, ReferenceWithTimezone: () => x2, Weekday: () => T2, casual: () => cs, createCasualConfiguration: () => go, createConfiguration: () => gs, parse: () => _f, parseDate: () => Of, strict: () => Nf });
function Tn(s7) {
  return String(s7).replace(/\u2019/g, "'").replace(/\u201D/g, '"').replace(/\u3000/g, " ").replace(/\uFFE5/g, "\xA5").replace(/[\uFF01\uFF03-\uFF06\uFF08\uFF09\uFF0C-\uFF19\uFF1C-\uFF1F\uFF21-\uFF3B\uFF3D\uFF3F\uFF41-\uFF5B\uFF5D\uFF5E]/g, gf);
}
function gf(s7) {
  return String.fromCharCode(s7.charCodeAt(0) - 65248);
}
var Tf = /(?:(?:([同今本])|((昭和|平成|令和)?([0-9０-９]{1,4}|元)))年\s*)?([0-9０-９]{1,2})月\s*([0-9０-９]{1,2})日/i;
var co = 1;
var hf = 2;
var ls = 3;
var Pf = 4;
var xf = 5;
var Rf = 6;
var Kr = class {
  pattern() {
    return Tf;
  }
  extract(e, r) {
    let t = parseInt(Tn(r[xf])), n = parseInt(Tn(r[Rf])), i = e.createParsingComponents({ day: n, month: t });
    if (r[co] && r[co].match("\u540C|\u4ECA|\u672C")) {
      let o2 = ot(e.refDate);
      i.assign("year", o2.year());
    }
    if (r[hf]) {
      let o2 = r[Pf], a = o2 == "\u5143" ? 1 : parseInt(Tn(o2));
      r[ls] == "\u4EE4\u548C" ? a += 2018 : r[ls] == "\u5E73\u6210" ? a += 1988 : r[ls] == "\u662D\u548C" && (a += 1925), i.assign("year", a);
    } else {
      let o2 = R(e.refDate, n, t);
      i.imply("year", o2);
    }
    return i;
  }
};
var qr = class extends w {
  patternBetween() {
    return /^\s*(から|ー|-)\s*$/i;
  }
};
var Af = /今日|きょう|当日|とうじつ|昨日|きのう|明日|あした|今夜|こんや|今夕|こんゆう|今晩|こんばん|今朝|けさ/i;
function wf(s7) {
  switch (s7) {
    case "\u304D\u3087\u3046":
      return "\u4ECA\u65E5";
    case "\u3068\u3046\u3058\u3064":
      return "\u5F53\u65E5";
    case "\u304D\u306E\u3046":
      return "\u6628\u65E5";
    case "\u3042\u3057\u305F":
      return "\u660E\u65E5";
    case "\u3053\u3093\u3084":
      return "\u4ECA\u591C";
    case "\u3053\u3093\u3086\u3046":
      return "\u4ECA\u5915";
    case "\u3053\u3093\u3070\u3093":
      return "\u4ECA\u6669";
    case "\u3051\u3055":
      return "\u4ECA\u671D";
    default:
      return s7;
  }
}
var Zr = class {
  pattern() {
    return Af;
  }
  extract(e, r) {
    let t = wf(r[0]), n = ot(e.refDate), i = e.createParsingComponents();
    switch (t) {
      case "\u6628\u65E5":
        return b2(e.reference);
      case "\u660E\u65E5":
        return W(e.reference);
      case "\u4ECA\u65E5":
      case "\u5F53\u65E5":
        return M(e.reference);
    }
    return t == "\u4ECA\u591C" || t == "\u4ECA\u5915" || t == "\u4ECA\u6669" ? (i.imply("hour", 22), i.assign("meridiem", d.PM)) : t.match("\u4ECA\u671D") && (i.imply("hour", 6), i.assign("meridiem", d.AM)), i.assign("day", n.date()), i.assign("month", n.month() + 1), i.assign("year", n.year()), i;
  }
};
var cs = new g2(go());
var Nf = new g2(gs());
function _f(s7, e, r) {
  return cs.parse(s7, e, r);
}
function Of(s7, e, r) {
  return cs.parseDate(s7, e, r);
}
function go() {
  let s7 = gs();
  return s7.parsers.unshift(new Zr()), s7;
}
function gs() {
  return { parsers: [new Kr()], refiners: [new qr()] };
}
var Ao = {};
j2(Ao, { Chrono: () => g2, Meridiem: () => d, ParsingComponents: () => l2, ParsingResult: () => h, ReferenceWithTimezone: () => x2, Weekday: () => T2, casual: () => hs, createCasualConfiguration: () => Eo, createConfiguration: () => Ps, parse: () => Sf, parseDate: () => $f, strict: () => kf });
var ys = { domingo: 0, dom: 0, segunda: 1, "segunda-feira": 1, seg: 1, ter\u00E7a: 2, "ter\xE7a-feira": 2, ter: 2, quarta: 3, "quarta-feira": 3, qua: 3, quinta: 4, "quinta-feira": 4, qui: 4, sexta: 5, "sexta-feira": 5, sex: 5, s\u00E1bado: 6, sabado: 6, sab: 6 };
var Ts = { janeiro: 1, jan: 1, "jan.": 1, fevereiro: 2, fev: 2, "fev.": 2, mar\u00E7o: 3, mar: 3, "mar.": 3, abril: 4, abr: 4, "abr.": 4, maio: 5, mai: 5, "mai.": 5, junho: 6, jun: 6, "jun.": 6, julho: 7, jul: 7, "jul.": 7, agosto: 8, ago: 8, "ago.": 8, setembro: 9, set: 9, "set.": 9, outubro: 10, out: 10, "out.": 10, novembro: 11, nov: 11, "nov.": 11, dezembro: 12, dez: 12, "dez.": 12 };
var To = "[0-9]{1,4}(?![^\\s]\\d)(?:\\s*[a|d]\\.?\\s*c\\.?|\\s*a\\.?\\s*d\\.?)?";
function ho(s7) {
  if (s7.match(/^[0-9]{1,4}$/)) {
    let e = parseInt(s7);
    return e < 100 && (e > 50 ? e = e + 1900 : e = e + 2e3), e;
  }
  return s7.match(/a\.?\s*c\.?/i) ? (s7 = s7.replace(/a\.?\s*c\.?/i, ""), -parseInt(s7)) : parseInt(s7);
}
var Cf = new RegExp(`(?:(?:\\,|\\(|\\\uFF08)\\s*)?(?:(este|esta|passado|pr[o\xF3]ximo)\\s*)?(${c2(ys)})(?:\\s*(?:\\,|\\)|\\\uFF09))?(?:\\s*(este|esta|passado|pr[\xF3o]ximo)\\s*semana)?(?=\\W|\\d|$)`, "i");
var Mf = 1;
var If = 2;
var Df = 3;
var Xr = class extends f {
  innerPattern() {
    return Cf;
  }
  innerExtract(e, r) {
    let t = r[If].toLowerCase(), n = ys[t];
    if (n === void 0)
      return null;
    let i = r[Mf], o2 = r[Df], a = i || o2 || "";
    a = a.toLowerCase();
    let m = null;
    return a == "passado" ? m = "this" : a == "pr\xF3ximo" || a == "proximo" ? m = "next" : a == "este" && (m = "this"), k(e.reference, n, m);
  }
};
var Jr = class extends C {
  primaryPrefix() {
    return "(?:(?:ao?|\xE0s?|das|da|de|do)\\s*)?";
  }
  followingPhase() {
    return "\\s*(?:\\-|\\\u2013|\\~|\\\u301C|a(?:o)?|\\?)\\s*";
  }
};
var Qr = class extends N {
  patternBetween() {
    return new RegExp("^\\s*(?:,|\xE0)?\\s*$");
  }
};
var et2 = class extends w {
  patternBetween() {
    return /^\s*(?:-)\s*$/i;
  }
};
var Uf = new RegExp(`([0-9]{1,2})(?:\xBA|\xAA|\xB0)?(?:\\s*(?:desde|de|\\-|\\\u2013|ao?|\\s)\\s*([0-9]{1,2})(?:\xBA|\xAA|\xB0)?)?\\s*(?:de)?\\s*(?:-|/|\\s*(?:de|,)?\\s*)(${c2(Ts)})(?:\\s*(?:de|,)?\\s*(${To}))?(?=\\W|$)`, "i");
var Po = 1;
var xo = 2;
var bf = 3;
var Ro = 4;
var rt2 = class extends f {
  innerPattern() {
    return Uf;
  }
  innerExtract(e, r) {
    let t = e.createParsingResult(r.index, r[0]), n = Ts[r[bf].toLowerCase()], i = parseInt(r[Po]);
    if (i > 31)
      return r.index = r.index + r[Po].length, null;
    if (t.start.assign("month", n), t.start.assign("day", i), r[Ro]) {
      let o2 = ho(r[Ro]);
      t.start.assign("year", o2);
    } else {
      let o2 = R(e.refDate, i, n);
      t.start.imply("year", o2);
    }
    if (r[xo]) {
      let o2 = parseInt(r[xo]);
      t.end = t.start.clone(), t.end.assign("day", o2);
    }
    return t;
  }
};
var tt2 = class extends f {
  innerPattern(e) {
    return /(agora|hoje|amanha|amanhã|ontem)(?=\W|$)/i;
  }
  innerExtract(e, r) {
    let t = r[0].toLowerCase(), n = e.createParsingComponents();
    switch (t) {
      case "agora":
        return U(e.reference);
      case "hoje":
        return M(e.reference);
      case "amanha":
      case "amanh\xE3":
        return W(e.reference);
      case "ontem":
        return b2(e.reference);
    }
    return n;
  }
};
var nt2 = class extends f {
  innerPattern() {
    return /(?:esta\s*)?(manha|manhã|tarde|meia-noite|meio-dia|noite)(?=\W|$)/i;
  }
  innerExtract(e, r) {
    let t = ot(e.refDate), n = e.createParsingComponents();
    switch (r[1].toLowerCase()) {
      case "tarde":
        n.imply("meridiem", d.PM), n.imply("hour", 15);
        break;
      case "noite":
        n.imply("meridiem", d.PM), n.imply("hour", 22);
        break;
      case "manha":
      case "manh\xE3":
        n.imply("meridiem", d.AM), n.imply("hour", 6);
        break;
      case "meia-noite":
        re(n, t), n.imply("hour", 0), n.imply("minute", 0), n.imply("second", 0);
        break;
      case "meio-dia":
        n.imply("meridiem", d.AM), n.imply("hour", 12);
        break;
    }
    return n;
  }
};
var hs = new g2(Eo());
var kf = new g2(Ps(true));
function Sf(s7, e, r) {
  return hs.parse(s7, e, r);
}
function $f(s7, e, r) {
  return hs.parseDate(s7, e, r);
}
function Eo(s7 = true) {
  let e = Ps(false, s7);
  return e.parsers.push(new tt2()), e.parsers.push(new nt2()), e;
}
function Ps(s7 = true, e = true) {
  return _({ parsers: [new O2(e), new Xr(), new Jr(), new rt2()], refiners: [new Qr(), new et2()] }, s7);
}
var Uo = {};
j2(Uo, { Chrono: () => g2, Meridiem: () => d, ParsingComponents: () => l2, ParsingResult: () => h, ReferenceWithTimezone: () => x2, Weekday: () => T2, casual: () => Ns, createCasualConfiguration: () => Do, createConfiguration: () => _s, parse: () => Rd, parseDate: () => Ed, strict: () => xd });
var st2 = class extends w {
  patternBetween() {
    return /^\s*(tot|-)\s*$/i;
  }
};
var it2 = class extends N {
  patternBetween() {
    return new RegExp("^\\s*(om|na|voor|in de|,|-)?\\s*$");
  }
};
var ot2 = class extends f {
  innerPattern(e) {
    return /(nu|vandaag|morgen|morgend|gisteren)(?=\W|$)/i;
  }
  innerExtract(e, r) {
    let t = r[0].toLowerCase(), n = e.createParsingComponents();
    switch (t) {
      case "nu":
        return U(e.reference);
      case "vandaag":
        return M(e.reference);
      case "morgen":
      case "morgend":
        return W(e.reference);
      case "gisteren":
        return b2(e.reference);
    }
    return n;
  }
};
var Gf = 1;
var Bf = 2;
var at = class extends f {
  innerPattern() {
    return /(deze)?\s*(namiddag|avond|middernacht|ochtend|middag|'s middags|'s avonds|'s ochtends)(?=\W|$)/i;
  }
  innerExtract(e, r) {
    let t = ot(e.refDate), n = e.createParsingComponents();
    switch (r[Gf] === "deze" && (n.assign("day", e.refDate.getDate()), n.assign("month", e.refDate.getMonth() + 1), n.assign("year", e.refDate.getFullYear())), r[Bf].toLowerCase()) {
      case "namiddag":
      case "'s namiddags":
        n.imply("meridiem", d.PM), n.imply("hour", 15);
        break;
      case "avond":
      case "'s avonds'":
        n.imply("meridiem", d.PM), n.imply("hour", 20);
        break;
      case "middernacht":
        re(n, t), n.imply("hour", 0), n.imply("minute", 0), n.imply("second", 0);
        break;
      case "ochtend":
      case "'s ochtends":
        n.imply("meridiem", d.AM), n.imply("hour", 6);
        break;
      case "middag":
      case "'s middags":
        n.imply("meridiem", d.AM), n.imply("hour", 12);
        break;
    }
    return n;
  }
};
var Es = { zondag: 0, zon: 0, "zon.": 0, zo: 0, "zo.": 0, maandag: 1, ma: 1, "ma.": 1, dinsdag: 2, din: 2, "din.": 2, di: 2, "di.": 2, woensdag: 3, woe: 3, "woe.": 3, wo: 3, "wo.": 3, donderdag: 4, dond: 4, "dond.": 4, do: 4, "do.": 4, vrijdag: 5, vrij: 5, "vrij.": 5, vr: 5, "vr.": 5, zaterdag: 6, zat: 6, "zat.": 6, za: 6, "za.": 6 };
var oe = { januari: 1, jan: 1, "jan.": 1, februari: 2, feb: 2, "feb.": 2, maart: 3, mar: 3, "mar.": 3, mrt: 3, "mrt.": 3, april: 4, apr: 4, "apr.": 4, mei: 5, juni: 6, jun: 6, "jun.": 6, juli: 7, jul: 7, "jul.": 7, augustus: 8, aug: 8, "aug.": 8, september: 9, sep: 9, "sep.": 9, sept: 9, "sept.": 9, oktober: 10, okt: 10, "okt.": 10, november: 11, nov: 11, "nov.": 11, december: 12, dec: 12, "dec.": 12 };
var xs = { een: 1, twee: 2, drie: 3, vier: 4, vijf: 5, zes: 6, zeven: 7, acht: 8, negen: 9, tien: 10, elf: 11, twaalf: 12 };
var Rs = { eerste: 1, tweede: 2, derde: 3, vierde: 4, vijfde: 5, zesde: 6, zevende: 7, achtste: 8, negende: 9, tiende: 10, elfde: 11, twaalfde: 12, dertiende: 13, veertiende: 14, vijftiende: 15, zestiende: 16, zeventiende: 17, achttiende: 18, negentiende: 19, twintigste: 20, eenentwintigste: 21, twee\u00EBntwintigste: 22, drieentwintigste: 23, vierentwintigste: 24, vijfentwintigste: 25, zesentwintigste: 26, zevenentwintigste: 27, achtentwintig: 28, negenentwintig: 29, dertigste: 30, eenendertigste: 31 };
var mt = { sec: "second", second: "second", seconden: "second", min: "minute", mins: "minute", minute: "minute", minuut: "minute", minuten: "minute", minuutje: "minute", h: "hour", hr: "hour", hrs: "hour", uur: "hour", u: "hour", uren: "hour", dag: "d", dagen: "d", week: "week", weken: "week", maand: "month", maanden: "month", jaar: "year", jr: "year", jaren: "year" };
var vf = `(?:${c2(xs)}|[0-9]+|[0-9]+[\\.,][0-9]+|halve?|half|paar)`;
function Ff(s7) {
  let e = s7.toLowerCase();
  return xs[e] !== void 0 ? xs[e] : e === "paar" ? 2 : e === "half" || e.match(/halve?/) ? 0.5 : parseFloat(e.replace(",", "."));
}
var As = `(?:${c2(Rs)}|[0-9]{1,2}(?:ste|de)?)`;
function ws(s7) {
  let e = s7.toLowerCase();
  return Rs[e] !== void 0 ? Rs[e] : (e = e.replace(/(?:ste|de)$/i, ""), parseInt(e));
}
var hn = "(?:[1-9][0-9]{0,3}\\s*(?:voor Christus|na Christus)|[1-2][0-9]{3}|[5-9][0-9])";
function Pn(s7) {
  if (/voor Christus/i.test(s7))
    return s7 = s7.replace(/voor Christus/i, ""), -parseInt(s7);
  if (/na Christus/i.test(s7))
    return s7 = s7.replace(/na Christus/i, ""), parseInt(s7);
  let e = parseInt(s7);
  return z(e);
}
var No = `(${vf})\\s{0,5}(${c2(mt)})\\s{0,5}`;
var wo = new RegExp(No, "i");
var ne = Y("(?:(?:binnen|in)\\s*)?", No);
function ce(s7) {
  let e = {}, r = s7, t = wo.exec(r);
  for (; t; )
    jf(e, t), r = r.substring(t[0].length), t = wo.exec(r);
  return e;
}
function jf(s7, e) {
  let r = Ff(e[1]), t = mt[e[2].toLowerCase()];
  s7[t] = r;
}
var ft = class extends f {
  innerPattern() {
    return new RegExp("(?:binnen|in|binnen de|voor)\\s*(" + ne + ")(?=\\W|$)", "i");
  }
  innerExtract(e, r) {
    let t = ce(r[1]);
    return l2.createRelativeFromReference(e.reference, t);
  }
};
var Lf = new RegExp(`(?:(?:\\,|\\(|\\\uFF08)\\s*)?(?:op\\s*?)?(?:(deze|vorige|volgende)\\s*(?:week\\s*)?)?(${c2(Es)})(?=\\W|$)`, "i");
var zf = 1;
var Hf = 2;
var Vf = 3;
var dt = class extends f {
  innerPattern() {
    return Lf;
  }
  innerExtract(e, r) {
    let t = r[Hf].toLowerCase(), n = Es[t], i = r[zf], o2 = r[Vf], a = i || o2;
    a = a || "", a = a.toLowerCase();
    let m = null;
    return a == "vorige" ? m = "last" : a == "volgende" ? m = "next" : a == "deze" && (m = "this"), k(e.reference, n, m);
  }
};
var Kf = new RegExp(`(?:on\\s*?)?(${As})(?:\\s*(?:tot|\\-|\\\u2013|until|through|till|\\s)\\s*(${As}))?(?:-|/|\\s*(?:of)?\\s*)(` + c2(oe) + `)(?:(?:-|/|,?\\s*)(${hn}(?![^\\s]\\d)))?(?=\\W|$)`, "i");
var qf = 3;
var _o = 1;
var Oo = 2;
var Co = 4;
var ut2 = class extends f {
  innerPattern() {
    return Kf;
  }
  innerExtract(e, r) {
    let t = oe[r[qf].toLowerCase()], n = ws(r[_o]);
    if (n > 31)
      return r.index = r.index + r[_o].length, null;
    let i = e.createParsingComponents({ day: n, month: t });
    if (r[Co]) {
      let m = Pn(r[Co]);
      i.assign("year", m);
    } else {
      let m = R(e.refDate, n, t);
      i.imply("year", m);
    }
    if (!r[Oo])
      return i;
    let o2 = ws(r[Oo]), a = e.createParsingResult(r.index, r[0]);
    return a.start = i, a.end = i.clone(), a.end.assign("day", o2), a;
  }
};
var Zf = new RegExp(`(${c2(oe)})\\s*(?:[,-]?\\s*(${hn})?)?(?=[^\\s\\w]|\\s+[^0-9]|\\s+$|$)`, "i");
var Xf = 1;
var Mo = 2;
var Le = class extends f {
  innerPattern() {
    return Zf;
  }
  innerExtract(e, r) {
    let t = e.createParsingComponents();
    t.imply("day", 1);
    let n = r[Xf], i = oe[n.toLowerCase()];
    if (t.assign("month", i), r[Mo]) {
      let o2 = Pn(r[Mo]);
      t.assign("year", o2);
    } else {
      let o2 = R(e.refDate, 1, i);
      t.imply("year", o2);
    }
    return t;
  }
};
var Jf = new RegExp("([0-9]|0[1-9]|1[012])/([0-9]{4})", "i");
var Qf = 1;
var ed = 2;
var pt = class extends f {
  innerPattern() {
    return Jf;
  }
  innerExtract(e, r) {
    let t = parseInt(r[ed]), n = parseInt(r[Qf]);
    return e.createParsingComponents().imply("day", 1).assign("month", n).assign("year", t);
  }
};
var lt = class extends C {
  primaryPrefix() {
    return "(?:(?:om)\\s*)?";
  }
  followingPhase() {
    return "\\s*(?:\\-|\\\u2013|\\~|\\\u301C|om|\\?)\\s*";
  }
  primarySuffix() {
    return "(?:\\s*(?:uur))?(?!/)(?=\\W|$)";
  }
  extractPrimaryTimeComponents(e, r) {
    return r[0].match(/^\s*\d{4}\s*$/) ? null : super.extractPrimaryTimeComponents(e, r);
  }
};
var rd = new RegExp(`([0-9]{4})[\\.\\/\\s](?:(${c2(oe)})|([0-9]{1,2}))[\\.\\/\\s]([0-9]{1,2})(?=\\W|$)`, "i");
var td = 1;
var nd = 2;
var Io = 3;
var sd = 4;
var ct = class extends f {
  innerPattern() {
    return rd;
  }
  innerExtract(e, r) {
    let t = r[Io] ? parseInt(r[Io]) : oe[r[nd].toLowerCase()];
    if (t < 1 || t > 12)
      return null;
    let n = parseInt(r[td]);
    return { day: parseInt(r[sd]), month: t, year: n };
  }
};
var od = 1;
var ad = 2;
var gt = class extends f {
  innerPattern(e) {
    return /(gisteren|morgen|van)(ochtend|middag|namiddag|avond|nacht)(?=\W|$)/i;
  }
  innerExtract(e, r) {
    let t = r[od].toLowerCase(), n = r[ad].toLowerCase(), i = e.createParsingComponents(), o2 = ot(e.refDate);
    switch (t) {
      case "gisteren":
        E2(i, o2.add(-1, "day"));
        break;
      case "van":
        E2(i, o2);
        break;
      case "morgen":
        re(i, o2);
        break;
    }
    switch (n) {
      case "ochtend":
        i.imply("meridiem", d.AM), i.imply("hour", 6);
        break;
      case "middag":
        i.imply("meridiem", d.AM), i.imply("hour", 12);
        break;
      case "namiddag":
        i.imply("meridiem", d.PM), i.imply("hour", 15);
        break;
      case "avond":
        i.imply("meridiem", d.PM), i.imply("hour", 20);
        break;
    }
    return i;
  }
};
var md = new RegExp(`(dit|deze|vorig|afgelopen|(?:aan)?komend|over|\\+|-)e?\\s*(${ne})(?=\\W|$)`, "i");
var fd = 1;
var dd = 2;
var yt = class extends f {
  innerPattern() {
    return md;
  }
  innerExtract(e, r) {
    let t = r[fd].toLowerCase(), n = ce(r[dd]);
    switch (t) {
      case "vorig":
      case "afgelopen":
      case "-":
        n = A(n);
        break;
    }
    return l2.createRelativeFromReference(e.reference, n);
  }
};
var pd = new RegExp(`(dit|deze|(?:aan)?komend|volgend|afgelopen|vorig)e?\\s*(${c2(mt)})(?=\\s*)(?=\\W|$)`, "i");
var ld = 1;
var cd = 2;
var Tt = class extends f {
  innerPattern() {
    return pd;
  }
  innerExtract(e, r) {
    let t = r[ld].toLowerCase(), n = r[cd].toLowerCase(), i = mt[n];
    if (t == "volgend" || t == "komend" || t == "aankomend") {
      let m = {};
      return m[i] = 1, l2.createRelativeFromReference(e.reference, m);
    }
    if (t == "afgelopen" || t == "vorig") {
      let m = {};
      return m[i] = -1, l2.createRelativeFromReference(e.reference, m);
    }
    let o2 = e.createParsingComponents(), a = ot(e.reference.instant);
    return n.match(/week/i) ? (a = a.add(-a.get("d"), "d"), o2.imply("day", a.date()), o2.imply("month", a.month() + 1), o2.imply("year", a.year())) : n.match(/maand/i) ? (a = a.add(-a.date() + 1, "d"), o2.imply("day", a.date()), o2.assign("year", a.year()), o2.assign("month", a.month() + 1)) : n.match(/jaar/i) && (a = a.add(-a.date() + 1, "d"), a = a.add(-a.month(), "month"), o2.imply("day", a.date()), o2.imply("month", a.month() + 1), o2.assign("year", a.year())), o2;
  }
};
var gd = new RegExp("(" + ne + ")(?:geleden|voor|eerder)(?=(?:\\W|$))", "i");
var yd = new RegExp("(" + ne + ")geleden(?=(?:\\W|$))", "i");
var ht = class extends f {
  constructor(e) {
    super(), this.strictMode = e;
  }
  innerPattern() {
    return this.strictMode ? yd : gd;
  }
  innerExtract(e, r) {
    let t = ce(r[1]), n = A(t);
    return l2.createRelativeFromReference(e.reference, n);
  }
};
var Td = new RegExp("(" + ne + ")(later|na|vanaf nu|voortaan|vooruit|uit)(?=(?:\\W|$))", "i");
var hd = new RegExp("(" + ne + ")(later|vanaf nu)(?=(?:\\W|$))", "i");
var Pd = 1;
var Pt = class extends f {
  constructor(e) {
    super(), this.strictMode = e;
  }
  innerPattern() {
    return this.strictMode ? hd : Td;
  }
  innerExtract(e, r) {
    let t = ce(r[Pd]);
    return l2.createRelativeFromReference(e.reference, t);
  }
};
var Ns = new g2(Do());
var xd = new g2(_s(true));
function Rd(s7, e, r) {
  return Ns.parse(s7, e, r);
}
function Ed(s7, e, r) {
  return Ns.parseDate(s7, e, r);
}
function Do(s7 = true) {
  let e = _s(false, s7);
  return e.parsers.unshift(new ot2()), e.parsers.unshift(new at()), e.parsers.unshift(new gt()), e.parsers.unshift(new Le()), e.parsers.unshift(new Tt()), e.parsers.unshift(new yt()), e;
}
function _s(s7 = true, e = true) {
  return _({ parsers: [new O2(e), new ft(), new ut2(), new Le(), new dt(), new ct(), new pt(), new lt(s7), new ht(s7), new Pt(s7)], refiners: [new it2(), new st2()] }, s7);
}
var Lo = {};
j2(Lo, { Chrono: () => g2, Meridiem: () => d, ParsingComponents: () => l2, ParsingResult: () => h, ReferenceWithTimezone: () => x2, Weekday: () => T2, casual: () => vs, createCasualConfiguration: () => jo, createConfiguration: () => Fs, hans: () => Bs, hant: () => Ss, parse: () => mu, parseDate: () => fu, strict: () => au });
var I = { \u96F6: 0, "\u3007": 0, \u4E00: 1, \u4E8C: 2, \u4E24: 2, \u4E09: 3, \u56DB: 4, \u4E94: 5, \u516D: 6, \u4E03: 7, \u516B: 8, \u4E5D: 9, \u5341: 10 };
var ze = { \u5929: 0, \u65E5: 0, \u4E00: 1, \u4E8C: 2, \u4E09: 3, \u56DB: 4, \u4E94: 5, \u516D: 6 };
function Z2(s7) {
  let e = 0;
  for (let r = 0; r < s7.length; r++) {
    let t = s7[r];
    t === "\u5341" ? e = e === 0 ? I[t] : e * I[t] : e += I[t];
  }
  return e;
}
function bo(s7) {
  let e = "";
  for (let r = 0; r < s7.length; r++) {
    let t = s7[r];
    e = e + I[t];
  }
  return parseInt(e);
}
var Os = 1;
var Wo = 2;
var Cs = 3;
var Ee = class extends f {
  innerPattern() {
    return new RegExp("(\\d{2,4}|[" + Object.keys(I).join("") + "]{4}|[" + Object.keys(I).join("") + "]{2})?(?:\\s*)(?:\u5E74)?(?:[\\s|,|\uFF0C]*)(\\d{1,2}|[" + Object.keys(I).join("") + "]{1,3})(?:\\s*)(?:\u6708)(?:\\s*)(\\d{1,2}|[" + Object.keys(I).join("") + "]{1,3})?(?:\\s*)(?:\u65E5|\u53F7)?");
  }
  innerExtract(e, r) {
    let t = ot(e.refDate), n = e.createParsingResult(r.index, r[0]), i = parseInt(r[Wo]);
    if (isNaN(i) && (i = Z2(r[Wo])), n.start.assign("month", i), r[Cs]) {
      let o2 = parseInt(r[Cs]);
      isNaN(o2) && (o2 = Z2(r[Cs])), n.start.assign("day", o2);
    } else
      n.start.imply("day", t.date());
    if (r[Os]) {
      let o2 = parseInt(r[Os]);
      isNaN(o2) && (o2 = bo(r[Os])), n.start.assign("year", o2);
    } else
      n.start.imply("year", t.year());
    return n;
  }
};
var Nd = new RegExp("(\\d+|[" + Object.keys(I).join("") + "]+|\u534A|\u51E0)(?:\\s*)(?:\u4E2A)?(\u79D2(?:\u949F)?|\u5206\u949F|\u5C0F\u65F6|\u949F|\u65E5|\u5929|\u661F\u671F|\u793C\u62DC|\u6708|\u5E74)(?:(?:\u4E4B|\u8FC7)?\u540E|(?:\u4E4B)?\u5185)", "i");
var Ms = 1;
var _d = 2;
var Ae = class extends f {
  innerPattern() {
    return Nd;
  }
  innerExtract(e, r) {
    let t = e.createParsingResult(r.index, r[0]), n = parseInt(r[Ms]);
    if (isNaN(n) && (n = Z2(r[Ms])), isNaN(n)) {
      let m = r[Ms];
      if (m === "\u51E0")
        n = 3;
      else if (m === "\u534A")
        n = 0.5;
      else
        return null;
    }
    let i = ot(e.refDate), a = r[_d][0];
    return a.match(/[日天星礼月年]/) ? (a == "\u65E5" || a == "\u5929" ? i = i.add(n, "d") : a == "\u661F" || a == "\u793C" ? i = i.add(n * 7, "d") : a == "\u6708" ? i = i.add(n, "month") : a == "\u5E74" && (i = i.add(n, "year")), t.start.assign("year", i.year()), t.start.assign("month", i.month() + 1), t.start.assign("day", i.date()), t) : (a == "\u79D2" ? i = i.add(n, "second") : a == "\u5206" ? i = i.add(n, "minute") : (a == "\u5C0F" || a == "\u949F") && (i = i.add(n, "hour")), t.start.imply("year", i.year()), t.start.imply("month", i.month() + 1), t.start.imply("day", i.date()), t.start.assign("hour", i.hour()), t.start.assign("minute", i.minute()), t.start.assign("second", i.second()), t);
  }
};
var Cd = new RegExp("(?<prefix>\u4E0A|\u4E0B|\u8FD9)(?:\u4E2A)?(?:\u661F\u671F|\u793C\u62DC|\u5468)(?<weekday>" + Object.keys(ze).join("|") + ")");
var we = class extends f {
  innerPattern() {
    return Cd;
  }
  innerExtract(e, r) {
    let t = e.createParsingResult(r.index, r[0]), n = r.groups.weekday, i = ze[n];
    if (i === void 0)
      return null;
    let o2 = null, a = r.groups.prefix;
    a == "\u4E0A" ? o2 = "last" : a == "\u4E0B" ? o2 = "next" : a == "\u8FD9" && (o2 = "this");
    let m = ot(e.refDate), p = false, u = m.day();
    return o2 == "last" || o2 == "past" ? (m = m.day(i - 7), p = true) : o2 == "next" ? (m = m.day(i + 7), p = true) : o2 == "this" ? m = m.day(i) : Math.abs(i - 7 - u) < Math.abs(i - u) ? m = m.day(i - 7) : Math.abs(i + 7 - u) < Math.abs(i - u) ? m = m.day(i + 7) : m = m.day(i), t.start.assign("weekday", i), p ? (t.start.assign("day", m.date()), t.start.assign("month", m.month() + 1), t.start.assign("year", m.year())) : (t.start.imply("day", m.date()), t.start.imply("month", m.month() + 1), t.start.imply("year", m.year())), t;
  }
};
var Id = new RegExp("(?:\u4ECE|\u81EA)?(?:(\u4ECA|\u660E|\u524D|\u5927\u524D|\u540E|\u5927\u540E|\u6628)(\u65E9|\u671D|\u665A)|(\u4E0A(?:\u5348)|\u65E9(?:\u4E0A)|\u4E0B(?:\u5348)|\u665A(?:\u4E0A)|\u591C(?:\u665A)?|\u4E2D(?:\u5348)|\u51CC(?:\u6668))|(\u4ECA|\u660E|\u524D|\u5927\u524D|\u540E|\u5927\u540E|\u6628)(?:\u65E5|\u5929)(?:[\\s,\uFF0C]*)(?:(\u4E0A(?:\u5348)|\u65E9(?:\u4E0A)|\u4E0B(?:\u5348)|\u665A(?:\u4E0A)|\u591C(?:\u665A)?|\u4E2D(?:\u5348)|\u51CC(?:\u6668)))?)?(?:[\\s,\uFF0C]*)(?:(\\d+|[" + Object.keys(I).join("") + "]+)(?:\\s*)(?:\u70B9|\u65F6|:|\uFF1A)(?:\\s*)(\\d+|\u534A|\u6B63|\u6574|[" + Object.keys(I).join("") + "]+)?(?:\\s*)(?:\u5206|:|\uFF1A)?(?:\\s*)(\\d+|[" + Object.keys(I).join("") + "]+)?(?:\\s*)(?:\u79D2)?)(?:\\s*(A.M.|P.M.|AM?|PM?))?", "i");
var Dd = new RegExp("(?:^\\s*(?:\u5230|\u81F3|\\-|\\\u2013|\\~|\\\u301C)\\s*)(?:(\u4ECA|\u660E|\u524D|\u5927\u524D|\u540E|\u5927\u540E|\u6628)(\u65E9|\u671D|\u665A)|(\u4E0A(?:\u5348)|\u65E9(?:\u4E0A)|\u4E0B(?:\u5348)|\u665A(?:\u4E0A)|\u591C(?:\u665A)?|\u4E2D(?:\u5348)|\u51CC(?:\u6668))|(\u4ECA|\u660E|\u524D|\u5927\u524D|\u540E|\u5927\u540E|\u6628)(?:\u65E5|\u5929)(?:[\\s,\uFF0C]*)(?:(\u4E0A(?:\u5348)|\u65E9(?:\u4E0A)|\u4E0B(?:\u5348)|\u665A(?:\u4E0A)|\u591C(?:\u665A)?|\u4E2D(?:\u5348)|\u51CC(?:\u6668)))?)?(?:[\\s,\uFF0C]*)(?:(\\d+|[" + Object.keys(I).join("") + "]+)(?:\\s*)(?:\u70B9|\u65F6|:|\uFF1A)(?:\\s*)(\\d+|\u534A|\u6B63|\u6574|[" + Object.keys(I).join("") + "]+)?(?:\\s*)(?:\u5206|:|\uFF1A)?(?:\\s*)(\\d+|[" + Object.keys(I).join("") + "]+)?(?:\\s*)(?:\u79D2)?)(?:\\s*(A.M.|P.M.|AM?|PM?))?", "i");
var xn = 1;
var Rn = 2;
var En = 3;
var An = 4;
var wn = 5;
var Nn = 6;
var X2 = 7;
var He = 8;
var _n = 9;
var Ne = class extends f {
  innerPattern() {
    return Id;
  }
  innerExtract(e, r) {
    if (r.index > 0 && e.text[r.index - 1].match(/\w/))
      return null;
    let t = ot(e.refDate), n = e.createParsingResult(r.index, r[0]), i = t.clone();
    if (r[xn]) {
      let u = r[xn];
      u == "\u660E" ? t.hour() > 1 && (i = i.add(1, "day")) : u == "\u6628" ? i = i.add(-1, "day") : u == "\u524D" ? i = i.add(-2, "day") : u == "\u5927\u524D" ? i = i.add(-3, "day") : u == "\u540E" ? i = i.add(2, "day") : u == "\u5927\u540E" && (i = i.add(3, "day")), n.start.assign("day", i.date()), n.start.assign("month", i.month() + 1), n.start.assign("year", i.year());
    } else if (r[An]) {
      let u = r[An];
      u == "\u660E" ? i = i.add(1, "day") : u == "\u6628" ? i = i.add(-1, "day") : u == "\u524D" ? i = i.add(-2, "day") : u == "\u5927\u524D" ? i = i.add(-3, "day") : u == "\u540E" ? i = i.add(2, "day") : u == "\u5927\u540E" && (i = i.add(3, "day")), n.start.assign("day", i.date()), n.start.assign("month", i.month() + 1), n.start.assign("year", i.year());
    } else
      n.start.imply("day", i.date()), n.start.imply("month", i.month() + 1), n.start.imply("year", i.year());
    let o2 = 0, a = 0, m = -1;
    if (r[He]) {
      let u = parseInt(r[He]);
      if (isNaN(u) && (u = Z2(r[He])), u >= 60)
        return null;
      n.start.assign("second", u);
    }
    if (o2 = parseInt(r[Nn]), isNaN(o2) && (o2 = Z2(r[Nn])), r[X2] ? r[X2] == "\u534A" ? a = 30 : r[X2] == "\u6B63" || r[X2] == "\u6574" ? a = 0 : (a = parseInt(r[X2]), isNaN(a) && (a = Z2(r[X2]))) : o2 > 100 && (a = o2 % 100, o2 = Math.floor(o2 / 100)), a >= 60 || o2 > 24)
      return null;
    if (o2 >= 12 && (m = 1), r[_n]) {
      if (o2 > 12)
        return null;
      let u = r[_n][0].toLowerCase();
      u == "a" && (m = 0, o2 == 12 && (o2 = 0)), u == "p" && (m = 1, o2 != 12 && (o2 += 12));
    } else if (r[Rn]) {
      let y = r[Rn][0];
      y == "\u65E9" ? (m = 0, o2 == 12 && (o2 = 0)) : y == "\u665A" && (m = 1, o2 != 12 && (o2 += 12));
    } else if (r[En]) {
      let y = r[En][0];
      y == "\u4E0A" || y == "\u65E9" || y == "\u51CC" ? (m = 0, o2 == 12 && (o2 = 0)) : (y == "\u4E0B" || y == "\u665A") && (m = 1, o2 != 12 && (o2 += 12));
    } else if (r[wn]) {
      let y = r[wn][0];
      y == "\u4E0A" || y == "\u65E9" || y == "\u51CC" ? (m = 0, o2 == 12 && (o2 = 0)) : (y == "\u4E0B" || y == "\u665A") && (m = 1, o2 != 12 && (o2 += 12));
    }
    if (n.start.assign("hour", o2), n.start.assign("minute", a), m >= 0 ? n.start.assign("meridiem", m) : o2 < 12 ? n.start.imply("meridiem", 0) : n.start.imply("meridiem", 1), r = Dd.exec(e.text.substring(n.index + n.text.length)), !r)
      return n.text.match(/^\d+$/) ? null : n;
    let p = i.clone();
    if (n.end = e.createParsingComponents(), r[xn]) {
      let u = r[xn];
      u == "\u660E" ? t.hour() > 1 && (p = p.add(1, "day")) : u == "\u6628" ? p = p.add(-1, "day") : u == "\u524D" ? p = p.add(-2, "day") : u == "\u5927\u524D" ? p = p.add(-3, "day") : u == "\u540E" ? p = p.add(2, "day") : u == "\u5927\u540E" && (p = p.add(3, "day")), n.end.assign("day", p.date()), n.end.assign("month", p.month() + 1), n.end.assign("year", p.year());
    } else if (r[An]) {
      let u = r[An];
      u == "\u660E" ? p = p.add(1, "day") : u == "\u6628" ? p = p.add(-1, "day") : u == "\u524D" ? p = p.add(-2, "day") : u == "\u5927\u524D" ? p = p.add(-3, "day") : u == "\u540E" ? p = p.add(2, "day") : u == "\u5927\u540E" && (p = p.add(3, "day")), n.end.assign("day", p.date()), n.end.assign("month", p.month() + 1), n.end.assign("year", p.year());
    } else
      n.end.imply("day", p.date()), n.end.imply("month", p.month() + 1), n.end.imply("year", p.year());
    if (o2 = 0, a = 0, m = -1, r[He]) {
      let u = parseInt(r[He]);
      if (isNaN(u) && (u = Z2(r[He])), u >= 60)
        return null;
      n.end.assign("second", u);
    }
    if (o2 = parseInt(r[Nn]), isNaN(o2) && (o2 = Z2(r[Nn])), r[X2] ? r[X2] == "\u534A" ? a = 30 : r[X2] == "\u6B63" || r[X2] == "\u6574" ? a = 0 : (a = parseInt(r[X2]), isNaN(a) && (a = Z2(r[X2]))) : o2 > 100 && (a = o2 % 100, o2 = Math.floor(o2 / 100)), a >= 60 || o2 > 24)
      return null;
    if (o2 >= 12 && (m = 1), r[_n]) {
      if (o2 > 12)
        return null;
      let u = r[_n][0].toLowerCase();
      u == "a" && (m = 0, o2 == 12 && (o2 = 0)), u == "p" && (m = 1, o2 != 12 && (o2 += 12)), n.start.isCertain("meridiem") || (m == 0 ? (n.start.imply("meridiem", 0), n.start.get("hour") == 12 && n.start.assign("hour", 0)) : (n.start.imply("meridiem", 1), n.start.get("hour") != 12 && n.start.assign("hour", n.start.get("hour") + 12)));
    } else if (r[Rn]) {
      let y = r[Rn][0];
      y == "\u65E9" ? (m = 0, o2 == 12 && (o2 = 0)) : y == "\u665A" && (m = 1, o2 != 12 && (o2 += 12));
    } else if (r[En]) {
      let y = r[En][0];
      y == "\u4E0A" || y == "\u65E9" || y == "\u51CC" ? (m = 0, o2 == 12 && (o2 = 0)) : (y == "\u4E0B" || y == "\u665A") && (m = 1, o2 != 12 && (o2 += 12));
    } else if (r[wn]) {
      let y = r[wn][0];
      y == "\u4E0A" || y == "\u65E9" || y == "\u51CC" ? (m = 0, o2 == 12 && (o2 = 0)) : (y == "\u4E0B" || y == "\u665A") && (m = 1, o2 != 12 && (o2 += 12));
    }
    return n.text = n.text + r[0], n.end.assign("hour", o2), n.end.assign("minute", a), m >= 0 ? n.end.assign("meridiem", m) : n.start.isCertain("meridiem") && n.start.get("meridiem") == 1 && n.start.get("hour") > o2 ? n.end.imply("meridiem", 0) : o2 > 12 && n.end.imply("meridiem", 1), n.end.date().getTime() < n.start.date().getTime() && n.end.imply("day", n.end.get("day") + 1), n;
  }
};
var bd = new RegExp("(?:\u661F\u671F|\u793C\u62DC|\u5468)(?<weekday>" + Object.keys(ze).join("|") + ")");
var _e = class extends f {
  innerPattern() {
    return bd;
  }
  innerExtract(e, r) {
    let t = e.createParsingResult(r.index, r[0]), n = r.groups.weekday, i = ze[n];
    if (i === void 0)
      return null;
    let o2 = ot(e.refDate), a = false, m = o2.day();
    return Math.abs(i - 7 - m) < Math.abs(i - m) ? o2 = o2.day(i - 7) : Math.abs(i + 7 - m) < Math.abs(i - m) ? o2 = o2.day(i + 7) : o2 = o2.day(i), t.start.assign("weekday", i), a ? (t.start.assign("day", o2.date()), t.start.assign("month", o2.month() + 1), t.start.assign("year", o2.year())) : (t.start.imply("day", o2.date()), t.start.imply("month", o2.month() + 1), t.start.imply("year", o2.year())), t;
  }
};
var kd = 1;
var ko = 2;
var Sd = 3;
var So = 4;
var $o = 5;
var $d = 6;
var Oe = class extends f {
  innerPattern(e) {
    return new RegExp("(\u800C\u5BB6|\u7ACB(?:\u523B|\u5373)|\u5373\u523B)|(\u4ECA|\u660E|\u524D|\u5927\u524D|\u5F8C|\u5927\u5F8C|\u807D|\u6628|\u5C0B|\u7434)(\u65E9|\u671D|\u665A)|(\u4E0A(?:\u5348|\u665D)|\u671D(?:\u65E9)|\u65E9(?:\u4E0A)|\u4E0B(?:\u5348|\u665D)|\u664F(?:\u665D)|\u665A(?:\u4E0A)|\u591C(?:\u665A)?|\u4E2D(?:\u5348)|\u51CC(?:\u6668))|(\u4ECA|\u660E|\u524D|\u5927\u524D|\u5F8C|\u5927\u5F8C|\u807D|\u6628|\u5C0B|\u7434)(?:\u65E5|\u5929)(?:[\\s|,|\uFF0C]*)(?:(\u4E0A(?:\u5348|\u665D)|\u671D(?:\u65E9)|\u65E9(?:\u4E0A)|\u4E0B(?:\u5348|\u665D)|\u664F(?:\u665D)|\u665A(?:\u4E0A)|\u591C(?:\u665A)?|\u4E2D(?:\u5348)|\u51CC(?:\u6668)))?", "i");
  }
  innerExtract(e, r) {
    let t = r.index, n = e.createParsingResult(t, r[0]), i = ot(e.refDate), o2 = i;
    if (r[kd])
      n.start.imply("hour", i.hour()), n.start.imply("minute", i.minute()), n.start.imply("second", i.second()), n.start.imply("millisecond", i.millisecond());
    else if (r[ko]) {
      let a = r[ko], m = r[Sd];
      a == "\u660E" || a == "\u807D" ? i.hour() > 1 && (o2 = o2.add(1, "day")) : a == "\u6628" || a == "\u5C0B" || a == "\u7434" ? o2 = o2.add(-1, "day") : a == "\u524D" ? o2 = o2.add(-2, "day") : a == "\u5927\u524D" ? o2 = o2.add(-3, "day") : a == "\u5F8C" ? o2 = o2.add(2, "day") : a == "\u5927\u5F8C" && (o2 = o2.add(3, "day")), m == "\u65E9" || m == "\u671D" ? n.start.imply("hour", 6) : m == "\u665A" && (n.start.imply("hour", 22), n.start.imply("meridiem", 1));
    } else if (r[So]) {
      let m = r[So][0];
      m == "\u65E9" || m == "\u671D" || m == "\u4E0A" ? n.start.imply("hour", 6) : m == "\u4E0B" || m == "\u664F" ? (n.start.imply("hour", 15), n.start.imply("meridiem", 1)) : m == "\u4E2D" ? (n.start.imply("hour", 12), n.start.imply("meridiem", 1)) : m == "\u591C" || m == "\u665A" ? (n.start.imply("hour", 22), n.start.imply("meridiem", 1)) : m == "\u51CC" && n.start.imply("hour", 0);
    } else if (r[$o]) {
      let a = r[$o];
      a == "\u660E" || a == "\u807D" ? i.hour() > 1 && (o2 = o2.add(1, "day")) : a == "\u6628" || a == "\u5C0B" || a == "\u7434" ? o2 = o2.add(-1, "day") : a == "\u524D" ? o2 = o2.add(-2, "day") : a == "\u5927\u524D" ? o2 = o2.add(-3, "day") : a == "\u5F8C" ? o2 = o2.add(2, "day") : a == "\u5927\u5F8C" && (o2 = o2.add(3, "day"));
      let m = r[$d];
      if (m) {
        let p = m[0];
        p == "\u65E9" || p == "\u671D" || p == "\u4E0A" ? n.start.imply("hour", 6) : p == "\u4E0B" || p == "\u664F" ? (n.start.imply("hour", 15), n.start.imply("meridiem", 1)) : p == "\u4E2D" ? (n.start.imply("hour", 12), n.start.imply("meridiem", 1)) : p == "\u591C" || p == "\u665A" ? (n.start.imply("hour", 22), n.start.imply("meridiem", 1)) : p == "\u51CC" && n.start.imply("hour", 0);
      }
    }
    return n.start.assign("day", o2.date()), n.start.assign("month", o2.month() + 1), n.start.assign("year", o2.year()), n;
  }
};
var D = { \u96F6: 0, \u4E00: 1, \u4E8C: 2, \u5169: 2, \u4E09: 3, \u56DB: 4, \u4E94: 5, \u516D: 6, \u4E03: 7, \u516B: 8, \u4E5D: 9, \u5341: 10, \u5EFF: 20, \u5345: 30 };
var Ve = { \u5929: 0, \u65E5: 0, \u4E00: 1, \u4E8C: 2, \u4E09: 3, \u56DB: 4, \u4E94: 5, \u516D: 6 };
function J(s7) {
  let e = 0;
  for (let r = 0; r < s7.length; r++) {
    let t = s7[r];
    t === "\u5341" ? e = e === 0 ? D[t] : e * D[t] : e += D[t];
  }
  return e;
}
function Yo(s7) {
  let e = "";
  for (let r = 0; r < s7.length; r++) {
    let t = s7[r];
    e = e + D[t];
  }
  return parseInt(e);
}
var Is = 1;
var Go = 2;
var Ds = 3;
var Ce = class extends f {
  innerPattern() {
    return new RegExp("(\\d{2,4}|[" + Object.keys(D).join("") + "]{4}|[" + Object.keys(D).join("") + "]{2})?(?:\\s*)(?:\u5E74)?(?:[\\s|,|\uFF0C]*)(\\d{1,2}|[" + Object.keys(D).join("") + "]{1,2})(?:\\s*)(?:\u6708)(?:\\s*)(\\d{1,2}|[" + Object.keys(D).join("") + "]{1,2})?(?:\\s*)(?:\u65E5|\u865F)?");
  }
  innerExtract(e, r) {
    let t = ot(e.refDate), n = e.createParsingResult(r.index, r[0]), i = parseInt(r[Go]);
    if (isNaN(i) && (i = J(r[Go])), n.start.assign("month", i), r[Ds]) {
      let o2 = parseInt(r[Ds]);
      isNaN(o2) && (o2 = J(r[Ds])), n.start.assign("day", o2);
    } else
      n.start.imply("day", t.date());
    if (r[Is]) {
      let o2 = parseInt(r[Is]);
      isNaN(o2) && (o2 = Yo(r[Is])), n.start.assign("year", o2);
    } else
      n.start.imply("year", t.year());
    return n;
  }
};
var Bd = new RegExp("(\\d+|[" + Object.keys(D).join("") + "]+|\u534A|\u5E7E)(?:\\s*)(?:\u500B)?(\u79D2(?:\u9418)?|\u5206\u9418|\u5C0F\u6642|\u9418|\u65E5|\u5929|\u661F\u671F|\u79AE\u62DC|\u6708|\u5E74)(?:(?:\u4E4B|\u904E)?\u5F8C|(?:\u4E4B)?\u5167)", "i");
var Us = 1;
var vd = 2;
var Me = class extends f {
  innerPattern() {
    return Bd;
  }
  innerExtract(e, r) {
    let t = e.createParsingResult(r.index, r[0]), n = parseInt(r[Us]);
    if (isNaN(n) && (n = J(r[Us])), isNaN(n)) {
      let m = r[Us];
      if (m === "\u5E7E")
        n = 3;
      else if (m === "\u534A")
        n = 0.5;
      else
        return null;
    }
    let i = ot(e.refDate), a = r[vd][0];
    return a.match(/[日天星禮月年]/) ? (a == "\u65E5" || a == "\u5929" ? i = i.add(n, "d") : a == "\u661F" || a == "\u79AE" ? i = i.add(n * 7, "d") : a == "\u6708" ? i = i.add(n, "month") : a == "\u5E74" && (i = i.add(n, "year")), t.start.assign("year", i.year()), t.start.assign("month", i.month() + 1), t.start.assign("day", i.date()), t) : (a == "\u79D2" ? i = i.add(n, "second") : a == "\u5206" ? i = i.add(n, "minute") : (a == "\u5C0F" || a == "\u9418") && (i = i.add(n, "hour")), t.start.imply("year", i.year()), t.start.imply("month", i.month() + 1), t.start.imply("day", i.date()), t.start.assign("hour", i.hour()), t.start.assign("minute", i.minute()), t.start.assign("second", i.second()), t);
  }
};
var jd = new RegExp("(?<prefix>\u4E0A|\u4ECA|\u4E0B|\u9019|\u5462)(?:\u500B)?(?:\u661F\u671F|\u79AE\u62DC|\u9031)(?<weekday>" + Object.keys(Ve).join("|") + ")");
var Ie = class extends f {
  innerPattern() {
    return jd;
  }
  innerExtract(e, r) {
    let t = e.createParsingResult(r.index, r[0]), n = r.groups.weekday, i = Ve[n];
    if (i === void 0)
      return null;
    let o2 = null, a = r.groups.prefix;
    a == "\u4E0A" ? o2 = "last" : a == "\u4E0B" ? o2 = "next" : (a == "\u4ECA" || a == "\u9019" || a == "\u5462") && (o2 = "this");
    let m = ot(e.refDate), p = false, u = m.day();
    return o2 == "last" || o2 == "past" ? (m = m.day(i - 7), p = true) : o2 == "next" ? (m = m.day(i + 7), p = true) : o2 == "this" ? m = m.day(i) : Math.abs(i - 7 - u) < Math.abs(i - u) ? m = m.day(i - 7) : Math.abs(i + 7 - u) < Math.abs(i - u) ? m = m.day(i + 7) : m = m.day(i), t.start.assign("weekday", i), p ? (t.start.assign("day", m.date()), t.start.assign("month", m.month() + 1), t.start.assign("year", m.year())) : (t.start.imply("day", m.date()), t.start.imply("month", m.month() + 1), t.start.imply("year", m.year())), t;
  }
};
var zd = new RegExp("(?:\u7531|\u5F9E|\u81EA)?(?:(\u4ECA|\u660E|\u524D|\u5927\u524D|\u5F8C|\u5927\u5F8C|\u807D|\u6628|\u5C0B|\u7434)(\u65E9|\u671D|\u665A)|(\u4E0A(?:\u5348|\u665D)|\u671D(?:\u65E9)|\u65E9(?:\u4E0A)|\u4E0B(?:\u5348|\u665D)|\u664F(?:\u665D)|\u665A(?:\u4E0A)|\u591C(?:\u665A)?|\u4E2D(?:\u5348)|\u51CC(?:\u6668))|(\u4ECA|\u660E|\u524D|\u5927\u524D|\u5F8C|\u5927\u5F8C|\u807D|\u6628|\u5C0B|\u7434)(?:\u65E5|\u5929)(?:[\\s,\uFF0C]*)(?:(\u4E0A(?:\u5348|\u665D)|\u671D(?:\u65E9)|\u65E9(?:\u4E0A)|\u4E0B(?:\u5348|\u665D)|\u664F(?:\u665D)|\u665A(?:\u4E0A)|\u591C(?:\u665A)?|\u4E2D(?:\u5348)|\u51CC(?:\u6668)))?)?(?:[\\s,\uFF0C]*)(?:(\\d+|[" + Object.keys(D).join("") + "]+)(?:\\s*)(?:\u9EDE|\u6642|:|\uFF1A)(?:\\s*)(\\d+|\u534A|\u6B63|\u6574|[" + Object.keys(D).join("") + "]+)?(?:\\s*)(?:\u5206|:|\uFF1A)?(?:\\s*)(\\d+|[" + Object.keys(D).join("") + "]+)?(?:\\s*)(?:\u79D2)?)(?:\\s*(A.M.|P.M.|AM?|PM?))?", "i");
var Hd = new RegExp("(?:^\\s*(?:\u5230|\u81F3|\\-|\\\u2013|\\~|\\\u301C)\\s*)(?:(\u4ECA|\u660E|\u524D|\u5927\u524D|\u5F8C|\u5927\u5F8C|\u807D|\u6628|\u5C0B|\u7434)(\u65E9|\u671D|\u665A)|(\u4E0A(?:\u5348|\u665D)|\u671D(?:\u65E9)|\u65E9(?:\u4E0A)|\u4E0B(?:\u5348|\u665D)|\u664F(?:\u665D)|\u665A(?:\u4E0A)|\u591C(?:\u665A)?|\u4E2D(?:\u5348)|\u51CC(?:\u6668))|(\u4ECA|\u660E|\u524D|\u5927\u524D|\u5F8C|\u5927\u5F8C|\u807D|\u6628|\u5C0B|\u7434)(?:\u65E5|\u5929)(?:[\\s,\uFF0C]*)(?:(\u4E0A(?:\u5348|\u665D)|\u671D(?:\u65E9)|\u65E9(?:\u4E0A)|\u4E0B(?:\u5348|\u665D)|\u664F(?:\u665D)|\u665A(?:\u4E0A)|\u591C(?:\u665A)?|\u4E2D(?:\u5348)|\u51CC(?:\u6668)))?)?(?:[\\s,\uFF0C]*)(?:(\\d+|[" + Object.keys(D).join("") + "]+)(?:\\s*)(?:\u9EDE|\u6642|:|\uFF1A)(?:\\s*)(\\d+|\u534A|\u6B63|\u6574|[" + Object.keys(D).join("") + "]+)?(?:\\s*)(?:\u5206|:|\uFF1A)?(?:\\s*)(\\d+|[" + Object.keys(D).join("") + "]+)?(?:\\s*)(?:\u79D2)?)(?:\\s*(A.M.|P.M.|AM?|PM?))?", "i");
var On = 1;
var Cn = 2;
var Mn = 3;
var In = 4;
var Dn = 5;
var Un = 6;
var Q = 7;
var Ke = 8;
var bn = 9;
var De = class extends f {
  innerPattern() {
    return zd;
  }
  innerExtract(e, r) {
    if (r.index > 0 && e.text[r.index - 1].match(/\w/))
      return null;
    let t = ot(e.refDate), n = e.createParsingResult(r.index, r[0]), i = t.clone();
    if (r[On]) {
      var o2 = r[On];
      o2 == "\u660E" || o2 == "\u807D" ? t.hour() > 1 && (i = i.add(1, "day")) : o2 == "\u6628" || o2 == "\u5C0B" || o2 == "\u7434" ? i = i.add(-1, "day") : o2 == "\u524D" ? i = i.add(-2, "day") : o2 == "\u5927\u524D" ? i = i.add(-3, "day") : o2 == "\u5F8C" ? i = i.add(2, "day") : o2 == "\u5927\u5F8C" && (i = i.add(3, "day")), n.start.assign("day", i.date()), n.start.assign("month", i.month() + 1), n.start.assign("year", i.year());
    } else if (r[In]) {
      var a = r[In];
      a == "\u660E" || a == "\u807D" ? i = i.add(1, "day") : a == "\u6628" || a == "\u5C0B" || a == "\u7434" ? i = i.add(-1, "day") : a == "\u524D" ? i = i.add(-2, "day") : a == "\u5927\u524D" ? i = i.add(-3, "day") : a == "\u5F8C" ? i = i.add(2, "day") : a == "\u5927\u5F8C" && (i = i.add(3, "day")), n.start.assign("day", i.date()), n.start.assign("month", i.month() + 1), n.start.assign("year", i.year());
    } else
      n.start.imply("day", i.date()), n.start.imply("month", i.month() + 1), n.start.imply("year", i.year());
    let m = 0, p = 0, u = -1;
    if (r[Ke]) {
      var y = parseInt(r[Ke]);
      if (isNaN(y) && (y = J(r[Ke])), y >= 60)
        return null;
      n.start.assign("second", y);
    }
    if (m = parseInt(r[Un]), isNaN(m) && (m = J(r[Un])), r[Q] ? r[Q] == "\u534A" ? p = 30 : r[Q] == "\u6B63" || r[Q] == "\u6574" ? p = 0 : (p = parseInt(r[Q]), isNaN(p) && (p = J(r[Q]))) : m > 100 && (p = m % 100, m = Math.floor(m / 100)), p >= 60 || m > 24)
      return null;
    if (m >= 12 && (u = 1), r[bn]) {
      if (m > 12)
        return null;
      var ae = r[bn][0].toLowerCase();
      ae == "a" && (u = 0, m == 12 && (m = 0)), ae == "p" && (u = 1, m != 12 && (m += 12));
    } else if (r[Cn]) {
      var Yn = r[Cn], ge = Yn[0];
      ge == "\u671D" || ge == "\u65E9" ? (u = 0, m == 12 && (m = 0)) : ge == "\u665A" && (u = 1, m != 12 && (m += 12));
    } else if (r[Mn]) {
      var Gn = r[Mn], S = Gn[0];
      S == "\u4E0A" || S == "\u671D" || S == "\u65E9" || S == "\u51CC" ? (u = 0, m == 12 && (m = 0)) : (S == "\u4E0B" || S == "\u664F" || S == "\u665A") && (u = 1, m != 12 && (m += 12));
    } else if (r[Dn]) {
      var Bn = r[Dn], $2 = Bn[0];
      $2 == "\u4E0A" || $2 == "\u671D" || $2 == "\u65E9" || $2 == "\u51CC" ? (u = 0, m == 12 && (m = 0)) : ($2 == "\u4E0B" || $2 == "\u664F" || $2 == "\u665A") && (u = 1, m != 12 && (m += 12));
    }
    if (n.start.assign("hour", m), n.start.assign("minute", p), u >= 0 ? n.start.assign("meridiem", u) : m < 12 ? n.start.imply("meridiem", 0) : n.start.imply("meridiem", 1), r = Hd.exec(e.text.substring(n.index + n.text.length)), !r)
      return n.text.match(/^\d+$/) ? null : n;
    let P2 = i.clone();
    if (n.end = e.createParsingComponents(), r[On]) {
      var o2 = r[On];
      o2 == "\u660E" || o2 == "\u807D" ? t.hour() > 1 && (P2 = P2.add(1, "day")) : o2 == "\u6628" || o2 == "\u5C0B" || o2 == "\u7434" ? P2 = P2.add(-1, "day") : o2 == "\u524D" ? P2 = P2.add(-2, "day") : o2 == "\u5927\u524D" ? P2 = P2.add(-3, "day") : o2 == "\u5F8C" ? P2 = P2.add(2, "day") : o2 == "\u5927\u5F8C" && (P2 = P2.add(3, "day")), n.end.assign("day", P2.date()), n.end.assign("month", P2.month() + 1), n.end.assign("year", P2.year());
    } else if (r[In]) {
      var a = r[In];
      a == "\u660E" || a == "\u807D" ? P2 = P2.add(1, "day") : a == "\u6628" || a == "\u5C0B" || a == "\u7434" ? P2 = P2.add(-1, "day") : a == "\u524D" ? P2 = P2.add(-2, "day") : a == "\u5927\u524D" ? P2 = P2.add(-3, "day") : a == "\u5F8C" ? P2 = P2.add(2, "day") : a == "\u5927\u5F8C" && (P2 = P2.add(3, "day")), n.end.assign("day", P2.date()), n.end.assign("month", P2.month() + 1), n.end.assign("year", P2.year());
    } else
      n.end.imply("day", P2.date()), n.end.imply("month", P2.month() + 1), n.end.imply("year", P2.year());
    if (m = 0, p = 0, u = -1, r[Ke]) {
      var y = parseInt(r[Ke]);
      if (isNaN(y) && (y = J(r[Ke])), y >= 60)
        return null;
      n.end.assign("second", y);
    }
    if (m = parseInt(r[Un]), isNaN(m) && (m = J(r[Un])), r[Q] ? r[Q] == "\u534A" ? p = 30 : r[Q] == "\u6B63" || r[Q] == "\u6574" ? p = 0 : (p = parseInt(r[Q]), isNaN(p) && (p = J(r[Q]))) : m > 100 && (p = m % 100, m = Math.floor(m / 100)), p >= 60 || m > 24)
      return null;
    if (m >= 12 && (u = 1), r[bn]) {
      if (m > 12)
        return null;
      var ae = r[bn][0].toLowerCase();
      ae == "a" && (u = 0, m == 12 && (m = 0)), ae == "p" && (u = 1, m != 12 && (m += 12)), n.start.isCertain("meridiem") || (u == 0 ? (n.start.imply("meridiem", 0), n.start.get("hour") == 12 && n.start.assign("hour", 0)) : (n.start.imply("meridiem", 1), n.start.get("hour") != 12 && n.start.assign("hour", n.start.get("hour") + 12)));
    } else if (r[Cn]) {
      var Yn = r[Cn], ge = Yn[0];
      ge == "\u671D" || ge == "\u65E9" ? (u = 0, m == 12 && (m = 0)) : ge == "\u665A" && (u = 1, m != 12 && (m += 12));
    } else if (r[Mn]) {
      var Gn = r[Mn], S = Gn[0];
      S == "\u4E0A" || S == "\u671D" || S == "\u65E9" || S == "\u51CC" ? (u = 0, m == 12 && (m = 0)) : (S == "\u4E0B" || S == "\u664F" || S == "\u665A") && (u = 1, m != 12 && (m += 12));
    } else if (r[Dn]) {
      var Bn = r[Dn], $2 = Bn[0];
      $2 == "\u4E0A" || $2 == "\u671D" || $2 == "\u65E9" || $2 == "\u51CC" ? (u = 0, m == 12 && (m = 0)) : ($2 == "\u4E0B" || $2 == "\u664F" || $2 == "\u665A") && (u = 1, m != 12 && (m += 12));
    }
    return n.text = n.text + r[0], n.end.assign("hour", m), n.end.assign("minute", p), u >= 0 ? n.end.assign("meridiem", u) : n.start.isCertain("meridiem") && n.start.get("meridiem") == 1 && n.start.get("hour") > m ? n.end.imply("meridiem", 0) : m > 12 && n.end.imply("meridiem", 1), n.end.date().getTime() < n.start.date().getTime() && n.end.imply("day", n.end.get("day") + 1), n;
  }
};
var Kd = new RegExp("(?:\u661F\u671F|\u79AE\u62DC|\u9031)(?<weekday>" + Object.keys(Ve).join("|") + ")");
var Ue = class extends f {
  innerPattern() {
    return Kd;
  }
  innerExtract(e, r) {
    let t = e.createParsingResult(r.index, r[0]), n = r.groups.weekday, i = Ve[n];
    if (i === void 0)
      return null;
    let o2 = ot(e.refDate), a = false, m = o2.day();
    return Math.abs(i - 7 - m) < Math.abs(i - m) ? o2 = o2.day(i - 7) : Math.abs(i + 7 - m) < Math.abs(i - m) ? o2 = o2.day(i + 7) : o2 = o2.day(i), t.start.assign("weekday", i), a ? (t.start.assign("day", o2.date()), t.start.assign("month", o2.month() + 1), t.start.assign("year", o2.year())) : (t.start.imply("day", o2.date()), t.start.imply("month", o2.month() + 1), t.start.imply("year", o2.year())), t;
  }
};
var be = class extends w {
  patternBetween() {
    return /^\s*(至|到|\-|\~|～|－|ー)\s*$/i;
  }
};
var We = class extends N {
  patternBetween() {
    return /^\s*$/i;
  }
};
var Ss = {};
j2(Ss, { Chrono: () => g2, Meridiem: () => d, ParsingComponents: () => l2, ParsingResult: () => h, ReferenceWithTimezone: () => x2, Weekday: () => T2, casual: () => bs, createCasualConfiguration: () => Ws, createConfiguration: () => ks, hant: () => qd, parse: () => Xd, parseDate: () => Jd, strict: () => Zd });
var qd = new g2(Ws());
var bs = new g2(Ws());
var Zd = new g2(ks());
function Xd(s7, e, r) {
  return bs.parse(s7, e, r);
}
function Jd(s7, e, r) {
  return bs.parseDate(s7, e, r);
}
function Ws() {
  let s7 = ks();
  return s7.parsers.unshift(new Oe()), s7;
}
function ks() {
  let s7 = _({ parsers: [new Ce(), new Ie(), new Ue(), new De(), new Me()], refiners: [new be(), new We()] });
  return s7.refiners = s7.refiners.filter((e) => !(e instanceof te)), s7;
}
var Bs = {};
j2(Bs, { Chrono: () => g2, Meridiem: () => d, ParsingComponents: () => l2, ParsingResult: () => h, ReferenceWithTimezone: () => x2, Weekday: () => T2, casual: () => $s, createCasualConfiguration: () => Ys, createConfiguration: () => Gs, hans: () => nu, parse: () => iu, parseDate: () => ou, strict: () => su });
var eu = 1;
var Bo = 2;
var ru = 3;
var vo = 4;
var Fo = 5;
var tu = 6;
var xt = class extends f {
  innerPattern(e) {
    return new RegExp("(\u73B0\u5728|\u7ACB(?:\u523B|\u5373)|\u5373\u523B)|(\u4ECA|\u660E|\u524D|\u5927\u524D|\u540E|\u5927\u540E|\u6628)(\u65E9|\u665A)|(\u4E0A(?:\u5348)|\u65E9(?:\u4E0A)|\u4E0B(?:\u5348)|\u665A(?:\u4E0A)|\u591C(?:\u665A)?|\u4E2D(?:\u5348)|\u51CC(?:\u6668))|(\u4ECA|\u660E|\u524D|\u5927\u524D|\u540E|\u5927\u540E|\u6628)(?:\u65E5|\u5929)(?:[\\s|,|\uFF0C]*)(?:(\u4E0A(?:\u5348)|\u65E9(?:\u4E0A)|\u4E0B(?:\u5348)|\u665A(?:\u4E0A)|\u591C(?:\u665A)?|\u4E2D(?:\u5348)|\u51CC(?:\u6668)))?", "i");
  }
  innerExtract(e, r) {
    let t = r.index, n = e.createParsingResult(t, r[0]), i = ot(e.refDate), o2 = i;
    if (r[eu])
      n.start.imply("hour", i.hour()), n.start.imply("minute", i.minute()), n.start.imply("second", i.second()), n.start.imply("millisecond", i.millisecond());
    else if (r[Bo]) {
      let a = r[Bo], m = r[ru];
      a == "\u660E" ? i.hour() > 1 && (o2 = o2.add(1, "day")) : a == "\u6628" ? o2 = o2.add(-1, "day") : a == "\u524D" ? o2 = o2.add(-2, "day") : a == "\u5927\u524D" ? o2 = o2.add(-3, "day") : a == "\u540E" ? o2 = o2.add(2, "day") : a == "\u5927\u540E" && (o2 = o2.add(3, "day")), m == "\u65E9" ? n.start.imply("hour", 6) : m == "\u665A" && (n.start.imply("hour", 22), n.start.imply("meridiem", 1));
    } else if (r[vo]) {
      let m = r[vo][0];
      m == "\u65E9" || m == "\u4E0A" ? n.start.imply("hour", 6) : m == "\u4E0B" ? (n.start.imply("hour", 15), n.start.imply("meridiem", 1)) : m == "\u4E2D" ? (n.start.imply("hour", 12), n.start.imply("meridiem", 1)) : m == "\u591C" || m == "\u665A" ? (n.start.imply("hour", 22), n.start.imply("meridiem", 1)) : m == "\u51CC" && n.start.imply("hour", 0);
    } else if (r[Fo]) {
      let a = r[Fo];
      a == "\u660E" ? i.hour() > 1 && (o2 = o2.add(1, "day")) : a == "\u6628" ? o2 = o2.add(-1, "day") : a == "\u524D" ? o2 = o2.add(-2, "day") : a == "\u5927\u524D" ? o2 = o2.add(-3, "day") : a == "\u540E" ? o2 = o2.add(2, "day") : a == "\u5927\u540E" && (o2 = o2.add(3, "day"));
      let m = r[tu];
      if (m) {
        let p = m[0];
        p == "\u65E9" || p == "\u4E0A" ? n.start.imply("hour", 6) : p == "\u4E0B" ? (n.start.imply("hour", 15), n.start.imply("meridiem", 1)) : p == "\u4E2D" ? (n.start.imply("hour", 12), n.start.imply("meridiem", 1)) : p == "\u591C" || p == "\u665A" ? (n.start.imply("hour", 22), n.start.imply("meridiem", 1)) : p == "\u51CC" && n.start.imply("hour", 0);
      }
    }
    return n.start.assign("day", o2.date()), n.start.assign("month", o2.month() + 1), n.start.assign("year", o2.year()), n;
  }
};
var Rt = class extends w {
  patternBetween() {
    return /^\s*(至|到|-|~|～|－|ー)\s*$/i;
  }
};
var Et = class extends N {
  patternBetween() {
    return /^\s*$/i;
  }
};
var nu = new g2(Ys());
var $s = new g2(Ys());
var su = new g2(Gs());
function iu(s7, e, r) {
  return $s.parse(s7, e, r);
}
function ou(s7, e, r) {
  return $s.parseDate(s7, e, r);
}
function Ys() {
  let s7 = Gs();
  return s7.parsers.unshift(new xt()), s7;
}
function Gs() {
  let s7 = _({ parsers: [new Ee(), new we(), new _e(), new Ne(), new Ae()], refiners: [new Rt(), new Et()] });
  return s7.refiners = s7.refiners.filter((e) => !(e instanceof te)), s7;
}
var vs = new g2(jo());
var au = new g2(Fs());
function mu(s7, e, r) {
  return vs.parse(s7, e, r);
}
function fu(s7, e, r) {
  return vs.parseDate(s7, e, r);
}
function jo() {
  let s7 = Fs();
  return s7.parsers.unshift(new Oe()), s7;
}
function Fs() {
  let s7 = _({ parsers: [new Ce(), new Ee(), new Ie(), new we(), new Ue(), new _e(), new De(), new Ne(), new Me(), new Ae()], refiners: [new be(), new We()] });
  return s7.refiners = s7.refiners.filter((e) => !(e instanceof te)), s7;
}
var Qo = {};
j2(Qo, { Chrono: () => g2, Meridiem: () => d, ParsingComponents: () => l2, ParsingResult: () => h, ReferenceWithTimezone: () => x2, Weekday: () => T2, casual: () => Zs, createCasualConfiguration: () => Jo, createConfiguration: () => Xs, parse: () => Au, parseDate: () => wu, strict: () => Eu });
var F = { leftBoundary: "([^\\p{L}\\p{N}_]|^)", rightBoundary: "(?=[^\\p{L}\\p{N}_]|$)", flags: "iu" };
var Hs = { \u0432\u043E\u0441\u043A\u0440\u0435\u0441\u0435\u043D\u044C\u0435: 0, \u0432\u043E\u0441\u043A\u0440\u0435\u0441\u0435\u043D\u044C\u044F: 0, \u0432\u0441\u043A: 0, "\u0432\u0441\u043A.": 0, \u043F\u043E\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u0438\u043A: 1, \u043F\u043E\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u0438\u043A\u0430: 1, \u043F\u043D: 1, "\u043F\u043D.": 1, \u0432\u0442\u043E\u0440\u043D\u0438\u043A: 2, \u0432\u0442\u043E\u0440\u043D\u0438\u043A\u0430: 2, \u0432\u0442: 2, "\u0432\u0442.": 2, \u0441\u0440\u0435\u0434\u0430: 3, \u0441\u0440\u0435\u0434\u044B: 3, \u0441\u0440\u0435\u0434\u0443: 3, \u0441\u0440: 3, "\u0441\u0440.": 3, \u0447\u0435\u0442\u0432\u0435\u0440\u0433: 4, \u0447\u0435\u0442\u0432\u0435\u0440\u0433\u0430: 4, \u0447\u0442: 4, "\u0447\u0442.": 4, \u043F\u044F\u0442\u043D\u0438\u0446\u0430: 5, \u043F\u044F\u0442\u043D\u0438\u0446\u0443: 5, \u043F\u044F\u0442\u043D\u0438\u0446\u044B: 5, \u043F\u0442: 5, "\u043F\u0442.": 5, \u0441\u0443\u0431\u0431\u043E\u0442\u0430: 6, \u0441\u0443\u0431\u0431\u043E\u0442\u0443: 6, \u0441\u0443\u0431\u0431\u043E\u0442\u044B: 6, \u0441\u0431: 6, "\u0441\u0431.": 6 };
var Vs = { \u044F\u043D\u0432\u0430\u0440\u044C: 1, \u044F\u043D\u0432\u0430\u0440\u044F: 1, \u044F\u043D\u0432\u0430\u0440\u0435: 1, \u0444\u0435\u0432\u0440\u0430\u043B\u044C: 2, \u0444\u0435\u0432\u0440\u0430\u043B\u044F: 2, \u0444\u0435\u0432\u0440\u0430\u043B\u0435: 2, \u043C\u0430\u0440\u0442: 3, \u043C\u0430\u0440\u0442\u0430: 3, \u043C\u0430\u0440\u0442\u0435: 3, \u0430\u043F\u0440\u0435\u043B\u044C: 4, \u0430\u043F\u0440\u0435\u043B\u044F: 4, \u0430\u043F\u0440\u0435\u043B\u0435: 4, \u043C\u0430\u0439: 5, \u043C\u0430\u044F: 5, \u043C\u0430\u0435: 5, \u0438\u044E\u043D\u044C: 6, \u0438\u044E\u043D\u044F: 6, \u0438\u044E\u043D\u0435: 6, \u0438\u044E\u043B\u044C: 7, \u0438\u044E\u043B\u044F: 7, \u0438\u044E\u043B\u0435: 7, \u0430\u0432\u0433\u0443\u0441\u0442: 8, \u0430\u0432\u0433\u0443\u0441\u0442\u0430: 8, \u0430\u0432\u0433\u0443\u0441\u0442\u0435: 8, \u0441\u0435\u043D\u0442\u044F\u0431\u0440\u044C: 9, \u0441\u0435\u043D\u0442\u044F\u0431\u0440\u044F: 9, \u0441\u0435\u043D\u0442\u044F\u0431\u0440\u0435: 9, \u043E\u043A\u0442\u044F\u0431\u0440\u044C: 10, \u043E\u043A\u0442\u044F\u0431\u0440\u044F: 10, \u043E\u043A\u0442\u044F\u0431\u0440\u0435: 10, \u043D\u043E\u044F\u0431\u0440\u044C: 11, \u043D\u043E\u044F\u0431\u0440\u044F: 11, \u043D\u043E\u044F\u0431\u0440\u0435: 11, \u0434\u0435\u043A\u0430\u0431\u0440\u044C: 12, \u0434\u0435\u043A\u0430\u0431\u0440\u044F: 12, \u0434\u0435\u043A\u0430\u0431\u0440\u0435: 12 };
var qe = { ...Vs, \u044F\u043D\u0432: 1, "\u044F\u043D\u0432.": 1, \u0444\u0435\u0432: 2, "\u0444\u0435\u0432.": 2, \u043C\u0430\u0440: 3, "\u043C\u0430\u0440.": 3, \u0430\u043F\u0440: 4, "\u0430\u043F\u0440.": 4, \u0430\u0432\u0433: 8, "\u0430\u0432\u0433.": 8, \u0441\u0435\u043D: 9, "\u0441\u0435\u043D.": 9, \u043E\u043A\u0442: 10, "\u043E\u043A\u0442.": 10, \u043D\u043E\u044F: 11, "\u043D\u043E\u044F.": 11, \u0434\u0435\u043A: 12, "\u0434\u0435\u043A.": 12 };
var Ls = { \u043E\u0434\u0438\u043D: 1, \u043E\u0434\u043D\u0430: 1, \u043E\u0434\u043D\u043E\u0439: 1, \u043E\u0434\u043D\u0443: 1, \u0434\u0432\u0435: 2, \u0434\u0432\u0430: 2, \u0434\u0432\u0443\u0445: 2, \u0442\u0440\u0438: 3, \u0442\u0440\u0435\u0445: 3, \u0442\u0440\u0451\u0445: 3, \u0447\u0435\u0442\u044B\u0440\u0435: 4, \u0447\u0435\u0442\u044B\u0440\u0435\u0445: 4, \u0447\u0435\u0442\u044B\u0440\u0451\u0445: 4, \u043F\u044F\u0442\u044C: 5, \u043F\u044F\u0442\u0438: 5, \u0448\u0435\u0441\u0442\u044C: 6, \u0448\u0435\u0441\u0442\u0438: 6, \u0441\u0435\u043C\u044C: 7, \u0441\u0435\u043C\u0438: 7, \u0432\u043E\u0441\u0435\u043C\u044C: 8, \u0432\u043E\u0441\u044C\u043C\u0438: 8, \u0434\u0435\u0432\u044F\u0442\u044C: 9, \u0434\u0435\u0432\u044F\u0442\u0438: 9, \u0434\u0435\u0441\u044F\u0442\u044C: 10, \u0434\u0435\u0441\u044F\u0442\u0438: 10, \u043E\u0434\u0438\u043D\u043D\u0430\u0434\u0446\u0430\u0442\u044C: 11, \u043E\u0434\u0438\u043D\u043D\u0430\u0434\u0446\u0430\u0442\u0438: 11, \u0434\u0432\u0435\u043D\u0430\u0434\u0446\u0430\u0442\u044C: 12, \u0434\u0432\u0435\u043D\u0430\u0434\u0446\u0430\u0442\u0438: 12 };
var zs = { \u043F\u0435\u0440\u0432\u043E\u0435: 1, \u043F\u0435\u0440\u0432\u043E\u0433\u043E: 1, \u0432\u0442\u043E\u0440\u043E\u0435: 2, \u0432\u0442\u043E\u0440\u043E\u0433\u043E: 2, \u0442\u0440\u0435\u0442\u044C\u0435: 3, \u0442\u0440\u0435\u0442\u044C\u0435\u0433\u043E: 3, \u0447\u0435\u0442\u0432\u0435\u0440\u0442\u043E\u0435: 4, \u0447\u0435\u0442\u0432\u0435\u0440\u0442\u043E\u0433\u043E: 4, \u043F\u044F\u0442\u043E\u0435: 5, \u043F\u044F\u0442\u043E\u0433\u043E: 5, \u0448\u0435\u0441\u0442\u043E\u0435: 6, \u0448\u0435\u0441\u0442\u043E\u0433\u043E: 6, \u0441\u0435\u0434\u044C\u043C\u043E\u0435: 7, \u0441\u0435\u0434\u044C\u043C\u043E\u0433\u043E: 7, \u0432\u043E\u0441\u044C\u043C\u043E\u0435: 8, \u0432\u043E\u0441\u044C\u043C\u043E\u0433\u043E: 8, \u0434\u0435\u0432\u044F\u0442\u043E\u0435: 9, \u0434\u0435\u0432\u044F\u0442\u043E\u0433\u043E: 9, \u0434\u0435\u0441\u044F\u0442\u043E\u0435: 10, \u0434\u0435\u0441\u044F\u0442\u043E\u0433\u043E: 10, \u043E\u0434\u0438\u043D\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0435: 11, \u043E\u0434\u0438\u043D\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E: 11, \u0434\u0432\u0435\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0435: 12, \u0434\u0432\u0435\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E: 12, \u0442\u0440\u0438\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0435: 13, \u0442\u0440\u0438\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E: 13, \u0447\u0435\u0442\u044B\u0440\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0435: 14, \u0447\u0435\u0442\u044B\u0440\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E: 14, \u043F\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0435: 15, \u043F\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E: 15, \u0448\u0435\u0441\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0435: 16, \u0448\u0435\u0441\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E: 16, \u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0435: 17, \u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E: 17, \u0432\u043E\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0435: 18, \u0432\u043E\u0441\u0435\u043C\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E: 18, \u0434\u0435\u0432\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0435: 19, \u0434\u0435\u0432\u044F\u0442\u043D\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E: 19, \u0434\u0432\u0430\u0434\u0446\u0430\u0442\u043E\u0435: 20, \u0434\u0432\u0430\u0434\u0446\u0430\u0442\u043E\u0433\u043E: 20, "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u044C \u043F\u0435\u0440\u0432\u043E\u0435": 21, "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u044C \u043F\u0435\u0440\u0432\u043E\u0433\u043E": 21, "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u044C \u0432\u0442\u043E\u0440\u043E\u0435": 22, "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u044C \u0432\u0442\u043E\u0440\u043E\u0433\u043E": 22, "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u044C \u0442\u0440\u0435\u0442\u044C\u0435": 23, "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u044C \u0442\u0440\u0435\u0442\u044C\u0435\u0433\u043E": 23, "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u044C \u0447\u0435\u0442\u0432\u0435\u0440\u0442\u043E\u0435": 24, "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u044C \u0447\u0435\u0442\u0432\u0435\u0440\u0442\u043E\u0433\u043E": 24, "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u044C \u043F\u044F\u0442\u043E\u0435": 25, "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u044C \u043F\u044F\u0442\u043E\u0433\u043E": 25, "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u044C \u0448\u0435\u0441\u0442\u043E\u0435": 26, "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u044C \u0448\u0435\u0441\u0442\u043E\u0433\u043E": 26, "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u044C \u0441\u0435\u0434\u044C\u043C\u043E\u0435": 27, "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u044C \u0441\u0435\u0434\u044C\u043C\u043E\u0433\u043E": 27, "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u044C \u0432\u043E\u0441\u044C\u043C\u043E\u0435": 28, "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u044C \u0432\u043E\u0441\u044C\u043C\u043E\u0433\u043E": 28, "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u044C \u0434\u0435\u0432\u044F\u0442\u043E\u0435": 29, "\u0434\u0432\u0430\u0434\u0446\u0430\u0442\u044C \u0434\u0435\u0432\u044F\u0442\u043E\u0433\u043E": 29, \u0442\u0440\u0438\u0434\u0446\u0430\u0442\u043E\u0435: 30, \u0442\u0440\u0438\u0434\u0446\u0430\u0442\u043E\u0433\u043E: 30, "\u0442\u0440\u0438\u0434\u0446\u0430\u0442\u044C \u043F\u0435\u0440\u0432\u043E\u0435": 31, "\u0442\u0440\u0438\u0434\u0446\u0430\u0442\u044C \u043F\u0435\u0440\u0432\u043E\u0433\u043E": 31 };
var At = { \u0441\u0435\u043A: "second", \u0441\u0435\u043A\u0443\u043D\u0434\u0430: "second", \u0441\u0435\u043A\u0443\u043D\u0434: "second", \u0441\u0435\u043A\u0443\u043D\u0434\u044B: "second", \u0441\u0435\u043A\u0443\u043D\u0434\u0443: "second", \u0441\u0435\u043A\u0443\u043D\u0434\u043E\u0447\u043A\u0430: "second", \u0441\u0435\u043A\u0443\u043D\u0434\u043E\u0447\u043A\u0438: "second", \u0441\u0435\u043A\u0443\u043D\u0434\u043E\u0447\u0435\u043A: "second", \u0441\u0435\u043A\u0443\u043D\u0434\u043E\u0447\u043A\u0443: "second", \u043C\u0438\u043D: "minute", \u043C\u0438\u043D\u0443\u0442\u0430: "minute", \u043C\u0438\u043D\u0443\u0442: "minute", \u043C\u0438\u043D\u0443\u0442\u044B: "minute", \u043C\u0438\u043D\u0443\u0442\u0443: "minute", \u043C\u0438\u043D\u0443\u0442\u043E\u043A: "minute", \u043C\u0438\u043D\u0443\u0442\u043A\u0438: "minute", \u043C\u0438\u043D\u0443\u0442\u043A\u0443: "minute", \u043C\u0438\u043D\u0443\u0442\u043E\u0447\u0435\u043A: "minute", \u043C\u0438\u043D\u0443\u0442\u043E\u0447\u043A\u0438: "minute", \u043C\u0438\u043D\u0443\u0442\u043E\u0447\u043A\u0443: "minute", \u0447\u0430\u0441: "hour", \u0447\u0430\u0441\u043E\u0432: "hour", \u0447\u0430\u0441\u0430: "hour", \u0447\u0430\u0441\u0443: "hour", \u0447\u0430\u0441\u0438\u043A\u043E\u0432: "hour", \u0447\u0430\u0441\u0438\u043A\u0430: "hour", \u0447\u0430\u0441\u0438\u043A\u0435: "hour", \u0447\u0430\u0441\u0438\u043A: "hour", \u0434\u0435\u043D\u044C: "d", \u0434\u043D\u044F: "d", \u0434\u043D\u0435\u0439: "d", \u0441\u0443\u0442\u043E\u043A: "d", \u0441\u0443\u0442\u043A\u0438: "d", \u043D\u0435\u0434\u0435\u043B\u044F: "week", \u043D\u0435\u0434\u0435\u043B\u0435: "week", \u043D\u0435\u0434\u0435\u043B\u0438: "week", \u043D\u0435\u0434\u0435\u043B\u044E: "week", \u043D\u0435\u0434\u0435\u043B\u044C: "week", \u043D\u0435\u0434\u0435\u043B\u044C\u043A\u0435: "week", \u043D\u0435\u0434\u0435\u043B\u044C\u043A\u0438: "week", \u043D\u0435\u0434\u0435\u043B\u0435\u043A: "week", \u043C\u0435\u0441\u044F\u0446: "month", \u043C\u0435\u0441\u044F\u0446\u0435: "month", \u043C\u0435\u0441\u044F\u0446\u0435\u0432: "month", \u043C\u0435\u0441\u044F\u0446\u0430: "month", \u043A\u0432\u0430\u0440\u0442\u0430\u043B: "quarter", \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u0435: "quarter", \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u043E\u0432: "quarter", \u0433\u043E\u0434: "year", \u0433\u043E\u0434\u0430: "year", \u0433\u043E\u0434\u0443: "year", \u0433\u043E\u0434\u043E\u0432: "year", \u043B\u0435\u0442: "year", \u0433\u043E\u0434\u0438\u043A: "year", \u0433\u043E\u0434\u0438\u043A\u0430: "year", \u0433\u043E\u0434\u0438\u043A\u043E\u0432: "year" };
var du = `(?:${c2(Ls)}|[0-9]+|[0-9]+\\.[0-9]+|\u043F\u043E\u043B|\u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E|\u043F\u0430\u0440(?:\u044B|\u0443)|\\s{0,3})`;
function uu(s7) {
  let e = s7.toLowerCase();
  return Ls[e] !== void 0 ? Ls[e] : e.match(/несколько/) ? 3 : e.match(/пол/) ? 0.5 : e.match(/пар/) ? 2 : e === "" ? 1 : parseFloat(e);
}
var Ks = `(?:${c2(zs)}|[0-9]{1,2}(?:\u0433\u043E|\u043E\u0433\u043E|\u0435|\u043E\u0435)?)`;
function qs(s7) {
  let e = s7.toLowerCase();
  return zs[e] !== void 0 ? zs[e] : parseInt(e);
}
var js = "(?:\\s+(?:\u0433\u043E\u0434\u0443|\u0433\u043E\u0434\u0430|\u0433\u043E\u0434|\u0433|\u0433.))?";
var Wn = `(?:[1-9][0-9]{0,3}${js}\\s*(?:\u043D.\u044D.|\u0434\u043E \u043D.\u044D.|\u043D. \u044D.|\u0434\u043E \u043D. \u044D.)|[1-2][0-9]{3}${js}|[5-9][0-9]${js})`;
function kn(s7) {
  if (/(год|года|г|г.)/i.test(s7) && (s7 = s7.replace(/(год|года|г|г.)/i, "")), /(до н.э.|до н. э.)/i.test(s7))
    return s7 = s7.replace(/(до н.э.|до н. э.)/i, ""), -parseInt(s7);
  if (/(н. э.|н.э.)/i.test(s7))
    return s7 = s7.replace(/(н. э.|н.э.)/i, ""), parseInt(s7);
  let e = parseInt(s7);
  return z(e);
}
var Ho = `(${du})\\s{0,3}(${c2(At)})`;
var zo = new RegExp(Ho, "i");
var Ze = Y("(?:(?:\u043E\u043A\u043E\u043B\u043E|\u043F\u0440\u0438\u043C\u0435\u0440\u043D\u043E)\\s{0,3})?", Ho);
function Xe(s7) {
  let e = {}, r = s7, t = zo.exec(r);
  for (; t; )
    pu(e, t), r = r.substring(t[0].length).trim(), t = zo.exec(r);
  return e;
}
function pu(s7, e) {
  let r = uu(e[1]), t = At[e[2].toLowerCase()];
  s7[t] = r;
}
var Vo = `(?:(?:\u043E\u043A\u043E\u043B\u043E|\u043F\u0440\u0438\u043C\u0435\u0440\u043D\u043E)\\s*(?:~\\s*)?)?(${Ze})${F.rightBoundary}`;
var wt = class extends f {
  patternLeftBoundary() {
    return F.leftBoundary;
  }
  innerPattern(e) {
    return e.option.forwardDate ? new RegExp(Vo, F.flags) : new RegExp(`(?:\u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435|\u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0438)\\s*${Vo}`, F.flags);
  }
  innerExtract(e, r) {
    let t = Xe(r[1]);
    return l2.createRelativeFromReference(e.reference, t);
  }
};
var ke = class extends f {
  patternLeftBoundary() {
    return F.leftBoundary;
  }
  innerPattern(e) {
    return new RegExp(this.innerPatternString(e), F.flags);
  }
  innerPatternHasChange(e, r) {
    return false;
  }
};
var G = class extends ke {
  innerPattern(e) {
    return new RegExp(`${this.innerPatternString(e)}${F.rightBoundary}`, F.flags);
  }
};
var Ko = 1;
var qo = 2;
var lu = 3;
var Zo = 4;
var Nt = class extends G {
  innerPatternString(e) {
    return `(?:\u0441)?\\s*(${Ks})(?:\\s{0,3}(?:\u043F\u043E|-|\u2013|\u0434\u043E)?\\s{0,3}(${Ks}))?(?:-|\\/|\\s{0,3}(?:of)?\\s{0,3})(${c2(qe)})(?:(?:-|\\/|,?\\s{0,3})(${Wn}(?![^\\s]\\d)))?`;
  }
  innerExtract(e, r) {
    let t = e.createParsingResult(r.index, r[0]), n = qe[r[lu].toLowerCase()], i = qs(r[Ko]);
    if (i > 31)
      return r.index = r.index + r[Ko].length, null;
    if (t.start.assign("month", n), t.start.assign("day", i), r[Zo]) {
      let o2 = kn(r[Zo]);
      t.start.assign("year", o2);
    } else {
      let o2 = R(e.refDate, i, n);
      t.start.imply("year", o2);
    }
    if (r[qo]) {
      let o2 = qs(r[qo]);
      t.end = t.start.clone(), t.end.assign("day", o2);
    }
    return t;
  }
};
var cu = 2;
var Xo = 3;
var _t = class extends ke {
  innerPatternString(e) {
    return `((?:\u0432)\\s*)?(${c2(qe)})\\s*(?:[,-]?\\s*(${Wn})?)?(?=[^\\s\\w]|\\s+[^0-9]|\\s+$|$)`;
  }
  innerExtract(e, r) {
    let t = r[cu].toLowerCase();
    if (r[0].length <= 3 && !Vs[t])
      return null;
    let n = e.createParsingResult(r.index, r.index + r[0].length);
    n.start.imply("day", 1);
    let i = qe[t];
    if (n.start.assign("month", i), r[Xo]) {
      let o2 = kn(r[Xo]);
      n.start.assign("year", o2);
    } else {
      let o2 = R(e.refDate, 1, i);
      n.start.imply("year", o2);
    }
    return n;
  }
};
var Ot = class extends C {
  constructor(e) {
    super(e);
  }
  patternFlags() {
    return F.flags;
  }
  primaryPatternLeftBoundary() {
    return "(^|\\s|T|(?:[^\\p{L}\\p{N}_]))";
  }
  followingPhase() {
    return "\\s*(?:\\-|\\\u2013|\\~|\\\u301C|\u0434\u043E|\u0438|\u043F\u043E|\\?)\\s*";
  }
  primaryPrefix() {
    return "(?:(?:\u0432|\u0441)\\s*)??";
  }
  primarySuffix() {
    return `(?:\\s*(?:\u0443\u0442\u0440\u0430|\u0432\u0435\u0447\u0435\u0440\u0430|\u043F\u043E\u0441\u043B\u0435 \u043F\u043E\u043B\u0443\u0434\u043D\u044F))?(?!\\/)${F.rightBoundary}`;
  }
  extractPrimaryTimeComponents(e, r) {
    let t = super.extractPrimaryTimeComponents(e, r);
    if (t) {
      if (r[0].endsWith("\u0432\u0435\u0447\u0435\u0440\u0430")) {
        let n = t.get("hour");
        n >= 6 && n < 12 ? (t.assign("hour", t.get("hour") + 12), t.assign("meridiem", d.PM)) : n < 6 && t.assign("meridiem", d.AM);
      }
      if (r[0].endsWith("\u043F\u043E\u0441\u043B\u0435 \u043F\u043E\u043B\u0443\u0434\u043D\u044F")) {
        t.assign("meridiem", d.PM);
        let n = t.get("hour");
        n >= 0 && n <= 6 && t.assign("hour", t.get("hour") + 12);
      }
      r[0].endsWith("\u0443\u0442\u0440\u0430") && (t.assign("meridiem", d.AM), t.get("hour") < 12 && t.assign("hour", t.get("hour")));
    }
    return t;
  }
};
var Ct = class extends ke {
  innerPatternString(e) {
    return `(${Ze})\\s{0,5}\u043D\u0430\u0437\u0430\u0434(?=(?:\\W|$))`;
  }
  innerExtract(e, r) {
    let t = Xe(r[1]), n = A(t);
    return l2.createRelativeFromReference(e.reference, n);
  }
};
var Mt = class extends w {
  patternBetween() {
    return /^\s*(и до|и по|до|по|-)\s*$/i;
  }
};
var It = class extends N {
  patternBetween() {
    return new RegExp("^\\s*(T|\u0432|,|-)?\\s*$");
  }
};
var Dt = class extends G {
  innerPatternString(e) {
    return "(?:\u0441|\u0441\u043E)?\\s*(\u0441\u0435\u0433\u043E\u0434\u043D\u044F|\u0432\u0447\u0435\u0440\u0430|\u0437\u0430\u0432\u0442\u0440\u0430|\u043F\u043E\u0441\u043B\u0435\u0437\u0430\u0432\u0442\u0440\u0430|\u043F\u043E\u0441\u043B\u0435\u043F\u043E\u0441\u043B\u0435\u0437\u0430\u0432\u0442\u0440\u0430|\u043F\u043E\u0437\u0430\u043F\u043E\u0437\u0430\u0432\u0447\u0435\u0440\u0430|\u043F\u043E\u0437\u0430\u0432\u0447\u0435\u0440\u0430)";
  }
  innerExtract(e, r) {
    let t = r[1].toLowerCase(), n = e.createParsingComponents();
    switch (t) {
      case "\u0441\u0435\u0433\u043E\u0434\u043D\u044F":
        return M(e.reference);
      case "\u0432\u0447\u0435\u0440\u0430":
        return b2(e.reference);
      case "\u0437\u0430\u0432\u0442\u0440\u0430":
        return W(e.reference);
      case "\u043F\u043E\u0441\u043B\u0435\u0437\u0430\u0432\u0442\u0440\u0430":
        return le(e.reference, 2);
      case "\u043F\u043E\u0441\u043B\u0435\u043F\u043E\u0441\u043B\u0435\u0437\u0430\u0432\u0442\u0440\u0430":
        return le(e.reference, 3);
      case "\u043F\u043E\u0437\u0430\u0432\u0447\u0435\u0440\u0430":
        return he(e.reference, 2);
      case "\u043F\u043E\u0437\u0430\u043F\u043E\u0437\u0430\u0432\u0447\u0435\u0440\u0430":
        return he(e.reference, 3);
    }
    return n;
  }
};
var Ut = class extends G {
  innerPatternString(e) {
    return "(\u0441\u0435\u0439\u0447\u0430\u0441|\u043F\u0440\u043E\u0448\u043B\u044B\u043C\\s*\u0432\u0435\u0447\u0435\u0440\u043E\u043C|\u043F\u0440\u043E\u0448\u043B\u043E\u0439\\s*\u043D\u043E\u0447\u044C\u044E|\u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439\\s*\u043D\u043E\u0447\u044C\u044E|\u0441\u0435\u0433\u043E\u0434\u043D\u044F\\s*\u043D\u043E\u0447\u044C\u044E|\u044D\u0442\u043E\u0439\\s*\u043D\u043E\u0447\u044C\u044E|\u043D\u043E\u0447\u044C\u044E|\u044D\u0442\u0438\u043C \u0443\u0442\u0440\u043E\u043C|\u0443\u0442\u0440\u043E\u043C|\u0443\u0442\u0440\u0430|\u0432\\s*\u043F\u043E\u043B\u0434\u0435\u043D\u044C|\u0432\u0435\u0447\u0435\u0440\u043E\u043C|\u0432\u0435\u0447\u0435\u0440\u0430|\u0432\\s*\u043F\u043E\u043B\u043D\u043E\u0447\u044C)";
  }
  innerExtract(e, r) {
    let t = ot(e.refDate), n = r[0].toLowerCase(), i = e.createParsingComponents();
    if (n === "\u0441\u0435\u0439\u0447\u0430\u0441")
      return U(e.reference);
    if (n === "\u0432\u0435\u0447\u0435\u0440\u043E\u043C" || n === "\u0432\u0435\u0447\u0435\u0440\u0430")
      return ve(e.reference);
    if (n.endsWith("\u0443\u0442\u0440\u043E\u043C") || n.endsWith("\u0443\u0442\u0440\u0430"))
      return Fe(e.reference);
    if (n.match(/в\s*полдень/))
      return je(e.reference);
    if (n.match(/прошлой\s*ночью/))
      return un(e.reference);
    if (n.match(/прошлым\s*вечером/))
      return pn(e.reference);
    if (n.match(/следующей\s*ночью/)) {
      let o2 = t.hour() < 22 ? 1 : 2;
      t = t.add(o2, "day"), E2(i, t), i.imply("hour", 0);
    }
    return n.match(/в\s*полночь/) || n.endsWith("\u043D\u043E\u0447\u044C\u044E") ? Pe(e.reference) : i;
  }
};
var yu = 1;
var Tu = 2;
var hu = 3;
var bt = class extends G {
  innerPatternString(e) {
    return `(?:(?:,|\\(|\uFF08)\\s*)?(?:\u0432\\s*?)?(?:(\u044D\u0442\u0443|\u044D\u0442\u043E\u0442|\u043F\u0440\u043E\u0448\u043B\u044B\u0439|\u043F\u0440\u043E\u0448\u043B\u0443\u044E|\u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439|\u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0443\u044E|\u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E)\\s*)?(${c2(Hs)})(?:\\s*(?:,|\\)|\uFF09))?(?:\\s*\u043D\u0430\\s*(\u044D\u0442\u043E\u0439|\u043F\u0440\u043E\u0448\u043B\u043E\u0439|\u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439)\\s*\u043D\u0435\u0434\u0435\u043B\u0435)?`;
  }
  innerExtract(e, r) {
    let t = r[Tu].toLowerCase(), n = Hs[t], i = r[yu], o2 = r[hu], a = i || o2;
    a = a || "", a = a.toLowerCase();
    let m = null;
    return a == "\u043F\u0440\u043E\u0448\u043B\u044B\u0439" || a == "\u043F\u0440\u043E\u0448\u043B\u0443\u044E" || a == "\u043F\u0440\u043E\u0448\u043B\u043E\u0439" ? m = "last" : a == "\u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439" || a == "\u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0443\u044E" || a == "\u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439" || a == "\u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E" ? m = "next" : (a == "\u044D\u0442\u043E\u0442" || a == "\u044D\u0442\u0443" || a == "\u044D\u0442\u043E\u0439") && (m = "this"), k(e.reference, n, m);
  }
};
var xu = 1;
var Ru = 2;
var Wt = class extends G {
  innerPatternString(e) {
    return `(\u0432 \u043F\u0440\u043E\u0448\u043B\u043E\u043C|\u043D\u0430 \u043F\u0440\u043E\u0448\u043B\u043E\u0439|\u043D\u0430 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439|\u0432 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u043C|\u043D\u0430 \u044D\u0442\u043E\u0439|\u0432 \u044D\u0442\u043E\u043C)\\s*(${c2(At)})`;
  }
  innerExtract(e, r) {
    let t = r[xu].toLowerCase(), n = r[Ru].toLowerCase(), i = At[n];
    if (t == "\u043D\u0430 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439" || t == "\u0432 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u043C") {
      let m = {};
      return m[i] = 1, l2.createRelativeFromReference(e.reference, m);
    }
    if (t == "\u0432 \u043F\u0440\u043E\u0448\u043B\u043E\u043C" || t == "\u043D\u0430 \u043F\u0440\u043E\u0448\u043B\u043E\u0439") {
      let m = {};
      return m[i] = -1, l2.createRelativeFromReference(e.reference, m);
    }
    let o2 = e.createParsingComponents(), a = ot(e.reference.instant);
    return i.match(/week/i) ? (a = a.add(-a.get("d"), "d"), o2.imply("day", a.date()), o2.imply("month", a.month() + 1), o2.imply("year", a.year())) : i.match(/month/i) ? (a = a.add(-a.date() + 1, "d"), o2.imply("day", a.date()), o2.assign("year", a.year()), o2.assign("month", a.month() + 1)) : i.match(/year/i) && (a = a.add(-a.date() + 1, "d"), a = a.add(-a.month(), "month"), o2.imply("day", a.date()), o2.imply("month", a.month() + 1), o2.assign("year", a.year())), o2;
  }
};
var kt = class extends G {
  innerPatternString(e) {
    return `(\u044D\u0442\u0438|\u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435|\u043F\u0440\u043E\u0448\u043B\u044B\u0435|\u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0435|\u043F\u043E\u0441\u043B\u0435|\u0441\u043F\u0443\u0441\u0442\u044F|\u0447\u0435\u0440\u0435\u0437|\\+|-)\\s*(${Ze})`;
  }
  innerExtract(e, r) {
    let t = r[1].toLowerCase(), n = Xe(r[2]);
    switch (t) {
      case "\u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435":
      case "\u043F\u0440\u043E\u0448\u043B\u044B\u0435":
      case "-":
        n = A(n);
        break;
    }
    return l2.createRelativeFromReference(e.reference, n);
  }
};
var Zs = new g2(Jo());
var Eu = new g2(Xs(true));
function Au(s7, e, r) {
  return Zs.parse(s7, e, r);
}
function wu(s7, e, r) {
  return Zs.parseDate(s7, e, r);
}
function Jo() {
  let s7 = Xs(false);
  return s7.parsers.unshift(new Dt()), s7.parsers.unshift(new Ut()), s7.parsers.unshift(new _t()), s7.parsers.unshift(new Wt()), s7.parsers.unshift(new kt()), s7;
}
function Xs(s7 = true) {
  return _({ parsers: [new O2(true), new wt(), new Nt(), new bt(), new Ot(s7), new Ct()], refiners: [new It(), new Mt()] }, s7);
}
var ua = {};
j2(ua, { Chrono: () => g2, Meridiem: () => d, ParsingComponents: () => l2, ParsingResult: () => h, ReferenceWithTimezone: () => x2, Weekday: () => T2, casual: () => ri, createCasualConfiguration: () => da, createConfiguration: () => ti, parse: () => Su, parseDate: () => $u, strict: () => ku });
var Qs = { domingo: 0, dom: 0, lunes: 1, lun: 1, martes: 2, mar: 2, mi\u00E9rcoles: 3, miercoles: 3, mi\u00E9: 3, mie: 3, jueves: 4, jue: 4, viernes: 5, vie: 5, s\u00E1bado: 6, sabado: 6, s\u00E1b: 6, sab: 6 };
var ei = { enero: 1, ene: 1, "ene.": 1, febrero: 2, feb: 2, "feb.": 2, marzo: 3, mar: 3, "mar.": 3, abril: 4, abr: 4, "abr.": 4, mayo: 5, may: 5, "may.": 5, junio: 6, jun: 6, "jun.": 6, julio: 7, jul: 7, "jul.": 7, agosto: 8, ago: 8, "ago.": 8, septiembre: 9, setiembre: 9, sep: 9, "sep.": 9, octubre: 10, oct: 10, "oct.": 10, noviembre: 11, nov: 11, "nov.": 11, diciembre: 12, dic: 12, "dic.": 12 };
var Js = { uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, trece: 13 };
var ra = { sec: "second", segundo: "second", segundos: "second", min: "minute", mins: "minute", minuto: "minute", minutos: "minute", h: "hour", hr: "hour", hrs: "hour", hora: "hour", horas: "hour", d\u00EDa: "d", d\u00EDas: "d", semana: "week", semanas: "week", mes: "month", meses: "month", cuarto: "quarter", cuartos: "quarter", a\u00F1o: "year", a\u00F1os: "year" };
var Nu = `(?:${c2(Js)}|[0-9]+|[0-9]+\\.[0-9]+|un?|uno?|una?|algunos?|unos?|demi-?)`;
function _u(s7) {
  let e = s7.toLowerCase();
  return Js[e] !== void 0 ? Js[e] : e === "un" || e === "una" || e === "uno" ? 1 : e.match(/algunos?/) || e.match(/unos?/) ? 3 : e.match(/media?/) ? 0.5 : parseFloat(e);
}
var ta = "[0-9]{1,4}(?![^\\s]\\d)(?:\\s*[a|d]\\.?\\s*c\\.?|\\s*a\\.?\\s*d\\.?)?";
function na(s7) {
  if (s7.match(/^[0-9]{1,4}$/)) {
    let e = parseInt(s7);
    return e < 100 && (e > 50 ? e = e + 1900 : e = e + 2e3), e;
  }
  return s7.match(/a\.?\s*c\.?/i) ? (s7 = s7.replace(/a\.?\s*c\.?/i, ""), -parseInt(s7)) : parseInt(s7);
}
var sa = `(${Nu})\\s{0,5}(${c2(ra)})\\s{0,5}`;
var ea = new RegExp(sa, "i");
var ia = Y("", sa);
function oa(s7) {
  let e = {}, r = s7, t = ea.exec(r);
  for (; t; )
    Ou(e, t), r = r.substring(t[0].length), t = ea.exec(r);
  return e;
}
function Ou(s7, e) {
  let r = _u(e[1]), t = ra[e[2].toLowerCase()];
  s7[t] = r;
}
var Cu = new RegExp(`(?:(?:\\,|\\(|\\\uFF08)\\s*)?(?:(este|esta|pasado|pr[o\xF3]ximo)\\s*)?(${c2(Qs)})(?:\\s*(?:\\,|\\)|\\\uFF09))?(?:\\s*(este|esta|pasado|pr[\xF3o]ximo)\\s*semana)?(?=\\W|\\d|$)`, "i");
var Mu = 1;
var Iu = 2;
var Du = 3;
var St = class extends f {
  innerPattern() {
    return Cu;
  }
  innerExtract(e, r) {
    let t = r[Iu].toLowerCase(), n = Qs[t];
    if (n === void 0)
      return null;
    let i = r[Mu], o2 = r[Du], a = i || o2 || "";
    a = a.toLowerCase();
    let m = null;
    return a == "pasado" ? m = "this" : a == "pr\xF3ximo" || a == "proximo" ? m = "next" : a == "este" && (m = "this"), k(e.reference, n, m);
  }
};
var $t = class extends C {
  primaryPrefix() {
    return "(?:(?:aslas|deslas|las?|al?|de|del)\\s*)?";
  }
  followingPhase() {
    return "\\s*(?:\\-|\\\u2013|\\~|\\\u301C|a(?:l)?|\\?)\\s*";
  }
};
var Yt = class extends N {
  patternBetween() {
    return new RegExp("^\\s*(?:,|de|aslas|a)?\\s*$");
  }
};
var Gt = class extends w {
  patternBetween() {
    return /^\s*(?:-)\s*$/i;
  }
};
var Uu = new RegExp(`([0-9]{1,2})(?:\xBA|\xAA|\xB0)?(?:\\s*(?:desde|de|\\-|\\\u2013|ao?|\\s)\\s*([0-9]{1,2})(?:\xBA|\xAA|\xB0)?)?\\s*(?:de)?\\s*(?:-|/|\\s*(?:de|,)?\\s*)(${c2(ei)})(?:\\s*(?:de|,)?\\s*(${ta}))?(?=\\W|$)`, "i");
var aa = 1;
var ma = 2;
var bu = 3;
var fa = 4;
var Bt = class extends f {
  innerPattern() {
    return Uu;
  }
  innerExtract(e, r) {
    let t = e.createParsingResult(r.index, r[0]), n = ei[r[bu].toLowerCase()], i = parseInt(r[aa]);
    if (i > 31)
      return r.index = r.index + r[aa].length, null;
    if (t.start.assign("month", n), t.start.assign("day", i), r[fa]) {
      let o2 = na(r[fa]);
      t.start.assign("year", o2);
    } else {
      let o2 = R(e.refDate, i, n);
      t.start.imply("year", o2);
    }
    if (r[ma]) {
      let o2 = parseInt(r[ma]);
      t.end = t.start.clone(), t.end.assign("day", o2);
    }
    return t;
  }
};
var vt = class extends f {
  innerPattern(e) {
    return /(ahora|hoy|mañana|ayer)(?=\W|$)/i;
  }
  innerExtract(e, r) {
    let t = r[0].toLowerCase(), n = e.createParsingComponents();
    switch (t) {
      case "ahora":
        return U(e.reference);
      case "hoy":
        return M(e.reference);
      case "ma\xF1ana":
        return W(e.reference);
      case "ayer":
        return b2(e.reference);
    }
    return n;
  }
};
var Ft = class extends f {
  innerPattern() {
    return /(?:esta\s*)?(mañana|tarde|medianoche|mediodia|mediodía|noche)(?=\W|$)/i;
  }
  innerExtract(e, r) {
    let t = ot(e.refDate), n = e.createParsingComponents();
    switch (r[1].toLowerCase()) {
      case "tarde":
        n.imply("meridiem", d.PM), n.imply("hour", 15);
        break;
      case "noche":
        n.imply("meridiem", d.PM), n.imply("hour", 22);
        break;
      case "ma\xF1ana":
        n.imply("meridiem", d.AM), n.imply("hour", 6);
        break;
      case "medianoche":
        re(n, t), n.imply("hour", 0), n.imply("minute", 0), n.imply("second", 0);
        break;
      case "mediodia":
      case "mediod\xEDa":
        n.imply("meridiem", d.AM), n.imply("hour", 12);
        break;
    }
    return n;
  }
};
var jt = class extends f {
  innerPattern() {
    return new RegExp(`(?:en|por|durante|de|dentro de)\\s*(${ia})(?=\\W|$)`, "i");
  }
  innerExtract(e, r) {
    let t = oa(r[1]);
    return l2.createRelativeFromReference(e.reference, t);
  }
};
var ri = new g2(da());
var ku = new g2(ti(true));
function Su(s7, e, r) {
  return ri.parse(s7, e, r);
}
function $u(s7, e, r) {
  return ri.parseDate(s7, e, r);
}
function da(s7 = true) {
  let e = ti(false, s7);
  return e.parsers.push(new vt()), e.parsers.push(new Ft()), e;
}
function ti(s7 = true, e = true) {
  return _({ parsers: [new O2(e), new St(), new $t(), new Bt(), new jt()], refiners: [new Yt(), new Gt()] }, s7);
}
var xa = {};
j2(xa, { Chrono: () => g2, Meridiem: () => d, ParsingComponents: () => l2, ParsingResult: () => h, ReferenceWithTimezone: () => x2, Weekday: () => T2, casual: () => di, createCasualConfiguration: () => Pa, createConfiguration: () => ui, parse: () => Xu, parseDate: () => Ju, strict: () => Zu });
var ee = { leftBoundary: "([^\\p{L}\\p{N}_]|^)", rightBoundary: "(?=[^\\p{L}\\p{N}_]|$)", flags: "iu" };
var oi = { \u043D\u0435\u0434\u0456\u043B\u044F: 0, \u043D\u0435\u0434\u0456\u043B\u0456: 0, \u043D\u0435\u0434\u0456\u043B\u044E: 0, \u043D\u0434: 0, "\u043D\u0434.": 0, \u043F\u043E\u043D\u0435\u0434\u0456\u043B\u043E\u043A: 1, \u043F\u043E\u043D\u0435\u0434\u0456\u043B\u043A\u0430: 1, \u043F\u043D: 1, "\u043F\u043D.": 1, \u0432\u0456\u0432\u0442\u043E\u0440\u043E\u043A: 2, \u0432\u0456\u0432\u0442\u043E\u0440\u043A\u0430: 2, \u0432\u0442: 2, "\u0432\u0442.": 2, \u0441\u0435\u0440\u0435\u0434\u0430: 3, \u0441\u0435\u0440\u0435\u0434\u0438: 3, \u0441\u0435\u0440\u0435\u0434\u0443: 3, \u0441\u0440: 3, "\u0441\u0440.": 3, \u0447\u0435\u0442\u0432\u0435\u0440: 4, \u0447\u0435\u0442\u0432\u0435\u0440\u0433\u0430: 4, \u0447\u0435\u0442\u0432\u0435\u0440\u0433\u0443: 4, \u0447\u0442: 4, "\u0447\u0442.": 4, "\u043F'\u044F\u0442\u043D\u0438\u0446\u044F": 5, "\u043F'\u044F\u0442\u043D\u0438\u0446\u0456": 5, "\u043F'\u044F\u0442\u043D\u0438\u0446\u044E": 5, \u043F\u0442: 5, "\u043F\u0442.": 5, \u0441\u0443\u0431\u043E\u0442\u0430: 6, \u0441\u0443\u0431\u043E\u0442\u0438: 6, \u0441\u0443\u0431\u043E\u0442\u0443: 6, \u0441\u0431: 6, "\u0441\u0431.": 6 };
var ai = { \u0441\u0456\u0447\u0435\u043D\u044C: 1, \u0441\u0456\u0447\u043D\u044F: 1, \u0441\u0456\u0447\u043D\u0456: 1, \u043B\u044E\u0442\u0438\u0439: 2, \u043B\u044E\u0442\u043E\u0433\u043E: 2, \u043B\u044E\u0442\u043E\u043C\u0443: 2, \u0431\u0435\u0440\u0435\u0437\u0435\u043D\u044C: 3, \u0431\u0435\u0440\u0435\u0437\u043D\u044F: 3, \u0431\u0435\u0440\u0435\u0437\u043D\u0456: 3, \u043A\u0432\u0456\u0442\u0435\u043D\u044C: 4, \u043A\u0432\u0456\u0442\u043D\u044F: 4, \u043A\u0432\u0456\u0442\u043D\u0456: 4, \u0442\u0440\u0430\u0432\u0435\u043D\u044C: 5, \u0442\u0440\u0430\u0432\u043D\u044F: 5, \u0442\u0440\u0430\u0432\u043D\u0456: 5, \u0447\u0435\u0440\u0432\u0435\u043D\u044C: 6, \u0447\u0435\u0440\u0432\u043D\u044F: 6, \u0447\u0435\u0440\u0432\u043D\u0456: 6, \u043B\u0438\u043F\u0435\u043D\u044C: 7, \u043B\u0438\u043F\u043D\u044F: 7, \u043B\u0438\u043F\u043D\u0456: 7, \u0441\u0435\u0440\u043F\u0435\u043D\u044C: 8, \u0441\u0435\u0440\u043F\u043D\u044F: 8, \u0441\u0435\u0440\u043F\u043D\u0456: 8, \u0432\u0435\u0440\u0435\u0441\u0435\u043D\u044C: 9, \u0432\u0435\u0440\u0435\u0441\u043D\u044F: 9, \u0432\u0435\u0440\u0435\u0441\u043D\u0456: 9, \u0436\u043E\u0432\u0442\u0435\u043D\u044C: 10, \u0436\u043E\u0432\u0442\u043D\u044F: 10, \u0436\u043E\u0432\u0442\u043D\u0456: 10, \u043B\u0438\u0441\u0442\u043E\u043F\u0430\u0434: 11, \u043B\u0438\u0441\u0442\u043E\u043F\u0430\u0434\u0430: 11, \u043B\u0438\u0441\u0442\u043E\u043F\u0430\u0434\u0443: 11, \u0433\u0440\u0443\u0434\u0435\u043D\u044C: 12, \u0433\u0440\u0443\u0434\u043D\u044F: 12, \u0433\u0440\u0443\u0434\u043D\u0456: 12 };
var Je = { ...ai, \u0441\u0456\u0447: 1, "\u0441\u0456\u0447.": 1, \u043B\u044E\u0442: 2, "\u043B\u044E\u0442.": 2, \u0431\u0435\u0440: 3, "\u0431\u0435\u0440.": 3, \u043A\u0432\u0456\u0442: 4, "\u043A\u0432\u0456\u0442.": 4, \u0442\u0440\u0430\u0432: 5, "\u0442\u0440\u0430\u0432.": 5, \u0447\u0435\u0440\u0432: 6, "\u0447\u0435\u0440\u0432.": 6, \u043B\u0438\u043F: 7, "\u043B\u0438\u043F.": 7, \u0441\u0435\u0440\u043F: 8, "\u0441\u0435\u0440\u043F.": 8, \u0441\u0435\u0440: 8, "c\u0435\u0440.": 8, \u0432\u0435\u0440: 9, "\u0432\u0435\u0440.": 9, \u0432\u0435\u0440\u0435\u0441: 9, "\u0432\u0435\u0440\u0435\u0441.": 9, \u0436\u043E\u0432\u0442: 10, "\u0436\u043E\u0432\u0442.": 10, \u043B\u0438\u0441\u0442\u043E\u043F: 11, "\u043B\u0438\u0441\u0442\u043E\u043F.": 11, \u0433\u0440\u0443\u0434: 12, "\u0433\u0440\u0443\u0434.": 12 };
var si = { \u043E\u0434\u0438\u043D: 1, \u043E\u0434\u043D\u0430: 1, \u043E\u0434\u043D\u043E\u0457: 1, \u043E\u0434\u043D\u0443: 1, \u0434\u0432\u0456: 2, \u0434\u0432\u0430: 2, \u0434\u0432\u043E\u0445: 2, \u0442\u0440\u0438: 3, \u0442\u0440\u044C\u043E\u0445: 3, \u0447\u043E\u0442\u0438\u0440\u0438: 4, \u0447\u043E\u0442\u0438\u0440\u044C\u043E\u0445: 4, "\u043F'\u044F\u0442\u044C": 5, "\u043F'\u044F\u0442\u0438": 5, \u0448\u0456\u0441\u0442\u044C: 6, \u0448\u0435\u0441\u0442\u0438: 6, \u0441\u0456\u043C: 7, \u0441\u0435\u043C\u0438: 7, \u0432\u0456\u0441\u0456\u043C: 8, \u0432\u043E\u0441\u044C\u043C\u0438: 8, "\u0434\u0435\u0432'\u044F\u0442\u044C": 9, "\u0434\u0435\u0432'\u044F\u0442\u0438": 9, \u0434\u0435\u0441\u044F\u0442\u044C: 10, \u0434\u0435\u0441\u044F\u0442\u0438: 10, \u043E\u0434\u0438\u043D\u0430\u0434\u0446\u044F\u0442\u044C: 11, \u043E\u0434\u0438\u043D\u0430\u0434\u0446\u044F\u0442\u0438: 11, \u0434\u0432\u0430\u043D\u0430\u0434\u0446\u044F\u0442\u044C: 12, \u0434\u0432\u0430\u043D\u0430\u0434\u0446\u044F\u0442\u0438: 12 };
var ii = { \u043F\u0435\u0440\u0448\u0435: 1, \u043F\u0435\u0440\u0448\u043E\u0433\u043E: 1, \u0434\u0440\u0443\u0433\u0435: 2, \u0434\u0440\u0443\u0433\u043E\u0433\u043E: 2, \u0442\u0440\u0435\u0442\u0454: 3, \u0442\u0440\u0435\u0442\u044C\u043E\u0433\u043E: 3, \u0447\u0435\u0442\u0432\u0435\u0440\u0442\u0435: 4, \u0447\u0435\u0442\u0432\u0435\u0440\u0442\u043E\u0433\u043E: 4, "\u043F'\u044F\u0442\u0435": 5, "\u043F'\u044F\u0442\u043E\u0433\u043E": 5, \u0448\u043E\u0441\u0442\u0435: 6, \u0448\u043E\u0441\u0442\u043E\u0433\u043E: 6, \u0441\u044C\u043E\u043C\u0435: 7, \u0441\u044C\u043E\u043C\u043E\u0433\u043E: 7, \u0432\u043E\u0441\u044C\u043C\u0435: 8, \u0432\u043E\u0441\u044C\u043C\u043E\u0433\u043E: 8, "\u0434\u0435\u0432'\u044F\u0442\u0435": 9, "\u0434\u0435\u0432'\u044F\u0442\u043E\u0433\u043E": 9, \u0434\u0435\u0441\u044F\u0442\u0435: 10, \u0434\u0435\u0441\u044F\u0442\u043E\u0433\u043E: 10, \u043E\u0434\u0438\u043D\u0430\u0434\u0446\u044F\u0442\u0435: 11, \u043E\u0434\u0438\u043D\u0430\u0434\u0446\u044F\u0442\u043E\u0433\u043E: 11, \u0434\u0432\u0430\u043D\u0430\u0434\u0446\u044F\u0442\u0435: 12, \u0434\u0432\u0430\u043D\u0430\u0434\u0446\u044F\u0442\u043E\u0433\u043E: 12, \u0442\u0440\u0438\u043D\u0430\u0434\u0446\u044F\u0442\u0435: 13, \u0442\u0440\u0438\u043D\u0430\u0434\u0446\u044F\u0442\u043E\u0433\u043E: 13, \u0447\u043E\u0442\u0438\u0440\u043D\u0430\u0434\u0446\u044F\u0442\u0435: 14, \u0447\u043E\u0442\u0438\u043D\u0440\u043D\u0430\u0434\u0446\u044F\u0442\u043E\u0433\u043E: 14, "\u043F'\u044F\u0442\u043D\u0430\u0434\u0446\u044F\u0442\u0435": 15, "\u043F'\u044F\u0442\u043D\u0430\u0434\u0446\u044F\u0442\u043E\u0433\u043E": 15, \u0448\u0456\u0441\u0442\u043D\u0430\u0434\u0446\u044F\u0442\u0435: 16, \u0448\u0456\u0441\u0442\u043D\u0430\u0434\u0446\u044F\u0442\u043E\u0433\u043E: 16, \u0441\u0456\u043C\u043D\u0430\u0434\u0446\u044F\u0442\u0435: 17, \u0441\u0456\u043C\u043D\u0430\u0434\u0446\u044F\u0442\u043E\u0433\u043E: 17, \u0432\u0456\u0441\u0456\u043C\u043D\u0430\u0434\u0446\u044F\u0442\u0435: 18, \u0432\u0456\u0441\u0456\u043C\u043D\u0430\u0434\u0446\u044F\u0442\u043E\u0433\u043E: 18, "\u0434\u0435\u0432'\u044F\u0442\u043D\u0430\u0434\u0446\u044F\u0442\u0435": 19, "\u0434\u0435\u0432'\u044F\u0442\u043D\u0430\u0434\u0446\u044F\u0442\u043E\u0433\u043E": 19, \u0434\u0432\u0430\u0434\u0446\u044F\u0442\u0435: 20, \u0434\u0432\u0430\u0434\u0446\u044F\u0442\u043E\u0433\u043E: 20, "\u0434\u0432\u0430\u0434\u0446\u044F\u0442\u044C \u043F\u0435\u0440\u0448\u0435": 21, "\u0434\u0432\u0430\u0434\u0446\u044F\u0442\u044C \u043F\u0435\u0440\u0448\u043E\u0433\u043E": 21, "\u0434\u0432\u0430\u0434\u0446\u044F\u0442\u044C \u0434\u0440\u0443\u0433\u0435": 22, "\u0434\u0432\u0430\u0434\u0446\u044F\u0442\u044C \u0434\u0440\u0443\u0433\u043E\u0433\u043E": 22, "\u0434\u0432\u0430\u0434\u0446\u044F\u0442\u044C \u0442\u0440\u0435\u0442\u0454": 23, "\u0434\u0432\u0430\u0434\u0446\u044F\u0442\u044C \u0442\u0440\u0435\u0442\u044C\u043E\u0433\u043E": 23, "\u0434\u0432\u0430\u0434\u0446\u044F\u0442\u044C \u0447\u0435\u0442\u0432\u0435\u0440\u0442\u0435": 24, "\u0434\u0432\u0430\u0434\u0446\u044F\u0442\u044C \u0447\u0435\u0442\u0432\u0435\u0440\u0442\u043E\u0433\u043E": 24, "\u0434\u0432\u0430\u0434\u0446\u044F\u0442\u044C \u043F'\u044F\u0442\u0435": 25, "\u0434\u0432\u0430\u0434\u0446\u044F\u0442\u044C \u043F'\u044F\u0442\u043E\u0433\u043E": 25, "\u0434\u0432\u0430\u0434\u0446\u044F\u0442\u044C \u0448\u043E\u0441\u0442\u0435": 26, "\u0434\u0432\u0430\u0434\u0446\u044F\u0442\u044C \u0448\u043E\u0441\u0442\u043E\u0433\u043E": 26, "\u0434\u0432\u0430\u0434\u0446\u044F\u0442\u044C \u0441\u044C\u043E\u043C\u0435": 27, "\u0434\u0432\u0430\u0434\u0446\u044F\u0442\u044C \u0441\u044C\u043E\u043C\u043E\u0433\u043E": 27, "\u0434\u0432\u0430\u0434\u0446\u044F\u0442\u044C \u0432\u043E\u0441\u044C\u043C\u0435": 28, "\u0434\u0432\u0430\u0434\u0446\u044F\u0442\u044C \u0432\u043E\u0441\u044C\u043C\u043E\u0433\u043E": 28, "\u0434\u0432\u0430\u0434\u0446\u044F\u0442\u044C \u0434\u0435\u0432'\u044F\u0442\u0435": 29, "\u0434\u0432\u0430\u0434\u0446\u044F\u0442\u044C \u0434\u0435\u0432'\u044F\u0442\u043E\u0433\u043E": 29, \u0442\u0440\u0438\u0434\u0446\u044F\u0442\u0435: 30, \u0442\u0440\u0438\u0434\u0446\u044F\u0442\u043E\u0433\u043E: 30, "\u0442\u0440\u0438\u0434\u0446\u044F\u0442\u044C \u043F\u0435\u0440\u0448\u0435": 31, "\u0442\u0440\u0438\u0434\u0446\u044F\u0442\u044C \u043F\u0435\u0440\u0448\u043E\u0433\u043E": 31 };
var Lt = { \u0441\u0435\u043A: "second", \u0441\u0435\u043A\u0443\u043D\u0434\u0430: "second", \u0441\u0435\u043A\u0443\u043D\u0434: "second", \u0441\u0435\u043A\u0443\u043D\u0434\u0438: "second", \u0441\u0435\u043A\u0443\u043D\u0434\u0443: "second", \u0441\u0435\u043A\u0443\u043D\u0434\u043E\u0447\u043E\u043A: "second", \u0441\u0435\u043A\u0443\u043D\u0434\u043E\u0447\u043A\u0438: "second", \u0441\u0435\u043A\u0443\u043D\u0434\u043E\u0447\u043A\u0443: "second", \u0445\u0432: "minute", \u0445\u0432\u0438\u043B\u0438\u043D\u0430: "minute", \u0445\u0432\u0438\u043B\u0438\u043D: "minute", \u0445\u0432\u0438\u043B\u0438\u043D\u0438: "minute", \u0445\u0432\u0438\u043B\u0438\u043D\u0443: "minute", \u0445\u0432\u0438\u043B\u0438\u043D\u043E\u043A: "minute", \u0445\u0432\u0438\u043B\u0438\u043D\u043A\u0438: "minute", \u0445\u0432\u0438\u043B\u0438\u043D\u043A\u0443: "minute", \u0445\u0432\u0438\u043B\u0438\u043D\u043E\u0447\u043E\u043A: "minute", \u0445\u0432\u0438\u043B\u0438\u043D\u043E\u0447\u043A\u0438: "minute", \u0445\u0432\u0438\u043B\u0438\u043D\u043E\u0447\u043A\u0443: "minute", \u0433\u043E\u0434: "hour", \u0433\u043E\u0434\u0438\u043D\u0430: "hour", \u0433\u043E\u0434\u0438\u043D: "hour", \u0433\u043E\u0434\u0438\u043D\u0438: "hour", \u0433\u043E\u0434\u0438\u043D\u0443: "hour", \u0433\u043E\u0434\u0438\u043D\u043A\u0430: "hour", \u0433\u043E\u0434\u0438\u043D\u043E\u043A: "hour", \u0433\u043E\u0434\u0438\u043D\u043A\u0438: "hour", \u0433\u043E\u0434\u0438\u043D\u043A\u0443: "hour", \u0434\u0435\u043D\u044C: "d", \u0434\u043D\u044F: "d", \u0434\u043D\u0456\u0432: "d", \u0434\u043D\u0456: "d", \u0434\u043E\u0431\u0430: "d", \u0434\u043E\u0431\u0443: "d", \u0442\u0438\u0436\u0434\u0435\u043D\u044C: "week", \u0442\u0438\u0436\u043D\u044E: "week", \u0442\u0438\u0436\u043D\u044F: "week", \u0442\u0438\u0436\u043D\u0456: "week", \u0442\u0438\u0436\u043D\u0456\u0432: "week", \u043C\u0456\u0441\u044F\u0446\u044C: "month", \u043C\u0456\u0441\u044F\u0446\u0456\u0432: "month", \u043C\u0456\u0441\u044F\u0446\u0456: "month", \u043C\u0456\u0441\u044F\u0446\u044F: "month", \u043A\u0432\u0430\u0440\u0442\u0430\u043B: "quarter", \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u0443: "quarter", \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u0430: "quarter", \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u0456\u0432: "quarter", \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u0456: "quarter", \u0440\u0456\u043A: "year", \u0440\u043E\u043A\u0443: "year", \u0440\u043E\u0446\u0456: "year", \u0440\u043E\u043A\u0456\u0432: "year", \u0440\u043E\u043A\u0438: "year" };
var Yu = `(?:${c2(si)}|[0-9]+|[0-9]+\\.[0-9]+|\u043F\u0456\u0432|\u0434\u0435\u043A\u0456\u043B\u044C\u043A\u0430|\u043F\u0430\u0440(?:\u0443)|\\s{0,3})`;
function Gu(s7) {
  let e = s7.toLowerCase();
  return si[e] !== void 0 ? si[e] : e.match(/декілька/) ? 2 : e.match(/пів/) ? 0.5 : e.match(/пар/) ? 2 : e === "" ? 1 : parseFloat(e);
}
var mi = `(?:${c2(ii)}|[0-9]{1,2}(?:\u0433\u043E|\u043E\u0433\u043E|\u0435)?)`;
function fi(s7) {
  let e = s7.toLowerCase();
  return ii[e] !== void 0 ? ii[e] : parseInt(e);
}
var ni = "(?:\\s+(?:\u0440\u043E\u043A\u0443|\u0440\u0456\u043A|\u0440|\u0440.))?";
var Sn = `(?:[1-9][0-9]{0,3}${ni}\\s*(?:\u043D.\u0435.|\u0434\u043E \u043D.\u0435.|\u043D. \u0435.|\u0434\u043E \u043D. \u0435.)|[1-2][0-9]{3}${ni}|[5-9][0-9]${ni})`;
function $n(s7) {
  if (/(рік|року|р|р.)/i.test(s7) && (s7 = s7.replace(/(рік|року|р|р.)/i, "")), /(до н.е.|до н. е.)/i.test(s7))
    return s7 = s7.replace(/(до н.е.|до н. е.)/i, ""), -parseInt(s7);
  if (/(н. е.|н.е.)/i.test(s7))
    return s7 = s7.replace(/(н. е.|н.е.)/i, ""), parseInt(s7);
  let e = parseInt(s7);
  return z(e);
}
var la = `(${Yu})\\s{0,3}(${c2(Lt)})`;
var pa = new RegExp(la, "i");
var Qe = Y("(?:(?:\u0431\u043B\u0438\u0437\u044C\u043A\u043E|\u043F\u0440\u0438\u0431\u043B\u0438\u0437\u043D\u043E)\\s{0,3})?", la);
function er(s7) {
  let e = {}, r = s7, t = pa.exec(r);
  for (; t; )
    Bu(e, t), r = r.substring(t[0].length).trim(), t = pa.exec(r);
  return e;
}
function Bu(s7, e) {
  let r = Gu(e[1]), t = Lt[e[2].toLowerCase()];
  s7[t] = r;
}
var ca = `(?:(?:\u043F\u0440\u0438\u0431\u043B\u0438\u0437\u043D\u043E|\u043E\u0440\u0456\u0454\u043D\u0442\u043E\u0432\u043D\u043E)\\s*(?:~\\s*)?)?(${Qe})${ee.rightBoundary}`;
var zt = class extends f {
  patternLeftBoundary() {
    return ee.leftBoundary;
  }
  innerPattern(e) {
    return e.option.forwardDate ? new RegExp(ca, "i") : new RegExp(`(?:\u043F\u0440\u043E\u0442\u044F\u0433\u043E\u043C|\u043D\u0430 \u043F\u0440\u043E\u0442\u044F\u0437\u0456|\u043F\u0440\u043E\u0442\u044F\u0433\u043E\u043C|\u0443\u043F\u0440\u043E\u0434\u043E\u0432\u0436|\u0432\u043F\u0440\u043E\u0434\u043E\u0432\u0436)\\s*${ca}`, ee.flags);
  }
  innerExtract(e, r) {
    let t = er(r[1]);
    return l2.createRelativeFromReference(e.reference, t);
  }
};
var Se = class extends f {
  patternLeftBoundary() {
    return ee.leftBoundary;
  }
  innerPattern(e) {
    return new RegExp(this.innerPatternString(e), ee.flags);
  }
  innerPatternHasChange(e, r) {
    return false;
  }
};
var B = class extends Se {
  innerPattern(e) {
    return new RegExp(`${this.innerPatternString(e)}${ee.rightBoundary}`, ee.flags);
  }
};
var ga = 1;
var ya = 2;
var vu = 3;
var Ta = 4;
var Ht = class extends B {
  innerPatternString(e) {
    return `(?:\u0437|\u0456\u0437)?\\s*(${mi})(?:\\s{0,3}(?:\u043F\u043E|-|\u2013|\u0434\u043E)?\\s{0,3}(${mi}))?(?:-|\\/|\\s{0,3}(?:of)?\\s{0,3})(${c2(Je)})(?:(?:-|\\/|,?\\s{0,3})(${Sn}(?![^\\s]\\d)))?`;
  }
  innerExtract(e, r) {
    let t = e.createParsingResult(r.index, r[0]), n = Je[r[vu].toLowerCase()], i = fi(r[ga]);
    if (i > 31)
      return r.index = r.index + r[ga].length, null;
    if (t.start.assign("month", n), t.start.assign("day", i), r[Ta]) {
      let o2 = $n(r[Ta]);
      t.start.assign("year", o2);
    } else {
      let o2 = R(e.reference.instant, i, n);
      t.start.imply("year", o2);
    }
    if (r[ya]) {
      let o2 = fi(r[ya]);
      t.end = t.start.clone(), t.end.assign("day", o2);
    }
    return t;
  }
};
var Fu = 2;
var ha = 3;
var Vt = class extends Se {
  innerPatternString(e) {
    return `((?:\u0432|\u0443)\\s*)?(${c2(Je)})\\s*(?:[,-]?\\s*(${Sn})?)?(?=[^\\s\\w]|\\s+[^0-9]|\\s+$|$)`;
  }
  innerExtract(e, r) {
    let t = r[Fu].toLowerCase();
    if (r[0].length <= 3 && !ai[t])
      return null;
    let n = e.createParsingResult(r.index, r.index + r[0].length);
    n.start.imply("day", 1);
    let i = Je[t];
    if (n.start.assign("month", i), r[ha]) {
      let o2 = $n(r[ha]);
      n.start.assign("year", o2);
    } else {
      let o2 = R(e.reference.instant, 1, i);
      n.start.imply("year", o2);
    }
    return n;
  }
};
var Kt = class extends C {
  constructor(e) {
    super(e);
  }
  patternFlags() {
    return ee.flags;
  }
  primaryPatternLeftBoundary() {
    return "(^|\\s|T|(?:[^\\p{L}\\p{N}_]))";
  }
  followingPhase() {
    return "\\s*(?:\\-|\\\u2013|\\~|\\\u301C|\u0434\u043E|\u0456|\u043F\u043E|\\?)\\s*";
  }
  primaryPrefix() {
    return "(?:(?:\u0432|\u0443|\u043E|\u043E\u0431|\u0437|\u0456\u0437|\u0432\u0456\u0434)\\s*)??";
  }
  primarySuffix() {
    return `(?:\\s*(?:\u0440\u0430\u043D\u043A\u0443|\u0432\u0435\u0447\u043E\u0440\u0430|\u043F\u043E \u043E\u0431\u0456\u0434\u0456|\u043F\u0456\u0441\u043B\u044F \u043E\u0431\u0456\u0434\u0443))?(?!\\/)${ee.rightBoundary}`;
  }
  extractPrimaryTimeComponents(e, r) {
    let t = super.extractPrimaryTimeComponents(e, r);
    if (t) {
      if (r[0].endsWith("\u0432\u0435\u0447\u043E\u0440\u0430")) {
        let n = t.get("hour");
        n >= 6 && n < 12 ? (t.assign("hour", t.get("hour") + 12), t.assign("meridiem", d.PM)) : n < 6 && t.assign("meridiem", d.AM);
      }
      if (r[0].endsWith("\u043F\u043E \u043E\u0431\u0456\u0434\u0456") || r[0].endsWith("\u043F\u0456\u0441\u043B\u044F \u043E\u0431\u0456\u0434\u0443")) {
        t.assign("meridiem", d.PM);
        let n = t.get("hour");
        n >= 0 && n <= 6 && t.assign("hour", t.get("hour") + 12);
      }
      r[0].endsWith("\u0440\u0430\u043D\u043A\u0443") && (t.assign("meridiem", d.AM), t.get("hour") < 12 && t.assign("hour", t.get("hour")));
    }
    return t;
  }
};
var qt = class extends Se {
  innerPatternString(e) {
    return `(${Qe})\\s{0,5}\u0442\u043E\u043C\u0443(?=(?:\\W|$))`;
  }
  innerExtract(e, r) {
    let t = er(r[1]), n = A(t);
    return l2.createRelativeFromReference(e.reference, n);
  }
};
var Zt = class extends w {
  patternBetween() {
    return /^\s*(і до|і по|до|по|-)\s*$/i;
  }
};
var Xt = class extends N {
  patternBetween() {
    return new RegExp("^\\s*(T|\u0432|\u0443|\u043E|,|-)?\\s*$");
  }
};
var Jt = class extends B {
  innerPatternString(e) {
    return "(?:\u0437|\u0456\u0437|\u0432\u0456\u0434)?\\s*(\u0441\u044C\u043E\u0433\u043E\u0434\u043D\u0456|\u0432\u0447\u043E\u0440\u0430|\u0437\u0430\u0432\u0442\u0440\u0430|\u043F\u0456\u0441\u043B\u044F\u0437\u0430\u0432\u0442\u0440\u0430|\u043F\u0456\u0441\u043B\u044F\u043F\u0456\u0441\u043B\u044F\u0437\u0430\u0432\u0442\u0440\u0430|\u043F\u043E\u0437\u0430\u043F\u043E\u0437\u0430\u0432\u0447\u043E\u0440\u0430|\u043F\u043E\u0437\u0430\u0432\u0447\u043E\u0440\u0430)";
  }
  innerExtract(e, r) {
    let t = r[1].toLowerCase(), n = e.createParsingComponents();
    switch (t) {
      case "\u0441\u044C\u043E\u0433\u043E\u0434\u043D\u0456":
        return M(e.reference);
      case "\u0432\u0447\u043E\u0440\u0430":
        return b2(e.reference);
      case "\u0437\u0430\u0432\u0442\u0440\u0430":
        return W(e.reference);
      case "\u043F\u0456\u0441\u043B\u044F\u0437\u0430\u0432\u0442\u0440\u0430":
        return le(e.reference, 2);
      case "\u043F\u0456\u0441\u043B\u044F\u043F\u0456\u0441\u043B\u044F\u0437\u0430\u0432\u0442\u0440\u0430":
        return le(e.reference, 3);
      case "\u043F\u043E\u0437\u0430\u0432\u0447\u043E\u0440\u0430":
        return he(e.reference, 2);
      case "\u043F\u043E\u0437\u0430\u043F\u043E\u0437\u0430\u0432\u0447\u043E\u0440\u0430":
        return he(e.reference, 3);
    }
    return n;
  }
};
var Qt = class extends B {
  innerPatternString(e) {
    return "(\u0437\u0430\u0440\u0430\u0437|\u043C\u0438\u043D\u0443\u043B\u043E\u0433\u043E\\s*\u0432\u0435\u0447\u043E\u0440\u0430|\u043C\u0438\u043D\u0443\u043B\u043E\u0457\\s*\u043D\u043E\u0447\u0456|\u043D\u0430\u0441\u0442\u0443\u043F\u043D\u043E\u0457\\s*\u043D\u043E\u0447\u0456|\u0441\u044C\u043E\u0433\u043E\u0434\u043D\u0456\\s*\u0432\u043D\u043E\u0447\u0456|\u0446\u0456\u0454\u0457\\s*\u043D\u043E\u0447\u0456|\u0446\u044C\u043E\u0433\u043E \u0440\u0430\u043D\u043A\u0443|\u0432\u0440\u0430\u043D\u0446\u0456|\u0440\u0430\u043D\u043A\u0443|\u0437\u0440\u0430\u043D\u043A\u0443|\u043E\u043F\u0456\u0432\u0434\u043D\u0456|\u0432\u0432\u0435\u0447\u0435\u0440\u0456|\u0432\u0435\u0447\u043E\u0440\u0430|\u043E\u043F\u0456\u0432\u043D\u043E\u0447\u0456|\u0432\u043D\u043E\u0447\u0456)";
  }
  innerExtract(e, r) {
    let t = ot(e.reference.instant), n = r[0].toLowerCase(), i = e.createParsingComponents();
    if (n === "\u0437\u0430\u0440\u0430\u0437")
      return U(e.reference);
    if (n === "\u0432\u0432\u0435\u0447\u0435\u0440\u0456" || n === "\u0432\u0435\u0447\u043E\u0440\u0430")
      return ve(e.reference);
    if (n.endsWith("\u0432\u0440\u0430\u043D\u0446\u0456") || n.endsWith("\u0440\u0430\u043D\u043A\u0443") || n.endsWith("\u0437\u0440\u0430\u043D\u043A\u0443"))
      return Fe(e.reference);
    if (n.endsWith("\u043E\u043F\u0456\u0432\u0434\u043D\u0456"))
      return je(e.reference);
    if (n.match(/минулої\s*ночі/))
      return un(e.reference);
    if (n.match(/минулого\s*вечора/))
      return pn(e.reference);
    if (n.match(/наступної\s*ночі/)) {
      let o2 = t.hour() < 22 ? 1 : 2;
      t = t.add(o2, "day"), E2(i, t), i.imply("hour", 1);
    }
    return n.match(/цієї\s*ночі/) ? Pe(e.reference) : n.endsWith("\u043E\u043F\u0456\u0432\u043D\u043E\u0447\u0456") || n.endsWith("\u0432\u043D\u043E\u0447\u0456") ? Pe(e.reference) : i;
  }
};
var Lu = 1;
var zu = 2;
var Hu = 3;
var en = class extends B {
  innerPatternString(e) {
    return `(?:(?:,|\\(|\uFF08)\\s*)?(?:\u0432\\s*?)?(?:\u0443\\s*?)?(?:(\u0446\u0435\u0439|\u043C\u0438\u043D\u0443\u043B\u043E\u0433\u043E|\u043C\u0438\u043D\u0443\u043B\u0438\u0439|\u043F\u043E\u043F\u0435\u0440\u0435\u0434\u043D\u0456\u0439|\u043F\u043E\u043F\u0435\u0440\u0435\u0434\u043D\u044C\u043E\u0433\u043E|\u043D\u0430\u0441\u0442\u0443\u043F\u043D\u043E\u0433\u043E|\u043D\u0430\u0441\u0442\u0443\u043F\u043D\u0438\u0439|\u043D\u0430\u0441\u0442\u0443\u043F\u043D\u043E\u043C\u0443)\\s*)?(${c2(oi)})(?:\\s*(?:,|\\)|\uFF09))?(?:\\s*(\u043D\u0430|\u0443|\u0432)\\s*(\u0446\u044C\u043E\u043C\u0443|\u043C\u0438\u043D\u0443\u043B\u043E\u043C\u0443|\u043D\u0430\u0441\u0442\u0443\u043F\u043D\u043E\u043C\u0443)\\s*\u0442\u0438\u0436\u043D\u0456)?`;
  }
  innerExtract(e, r) {
    let t = r[zu].toLocaleLowerCase(), n = oi[t], i = r[Lu], o2 = r[Hu], a = i || o2;
    a = a || "", a = a.toLocaleLowerCase();
    let m = null;
    return a == "\u043C\u0438\u043D\u0443\u043B\u043E\u0433\u043E" || a == "\u043C\u0438\u043D\u0443\u043B\u0438\u0439" || a == "\u043F\u043E\u043F\u0435\u0440\u0435\u0434\u043D\u0456\u0439" || a == "\u043F\u043E\u043F\u0435\u0440\u0435\u0434\u043D\u044C\u043E\u0433\u043E" ? m = "last" : a == "\u043D\u0430\u0441\u0442\u0443\u043F\u043D\u043E\u0433\u043E" || a == "\u043D\u0430\u0441\u0442\u0443\u043F\u043D\u0438\u0439" ? m = "next" : (a == "\u0446\u0435\u0439" || a == "\u0446\u044C\u043E\u0433\u043E" || a == "\u0446\u044C\u043E\u043C\u0443") && (m = "this"), k(e.reference, n, m);
  }
};
var Ku = 1;
var qu = 2;
var rn = class extends B {
  innerPatternString(e) {
    return `(\u0432 \u043C\u0438\u043D\u0443\u043B\u043E\u043C\u0443|\u0443 \u043C\u0438\u043D\u0443\u043B\u043E\u043C\u0443|\u043D\u0430 \u043C\u0438\u043D\u0443\u043B\u043E\u043C\u0443|\u043C\u0438\u043D\u0443\u043B\u043E\u0433\u043E|\u043D\u0430 \u043D\u0430\u0441\u0442\u0443\u043F\u043D\u043E\u043C\u0443|\u0432 \u043D\u0430\u0441\u0442\u0443\u043F\u043D\u043E\u043C\u0443|\u0443 \u043D\u0430\u0441\u0442\u0443\u043F\u043D\u043E\u043C\u0443|\u043D\u0430\u0441\u0442\u0443\u043F\u043D\u043E\u0433\u043E|\u043D\u0430 \u0446\u044C\u043E\u043C\u0443|\u0432 \u0446\u044C\u043E\u043C\u0443|\u0443 \u0446\u044C\u043E\u043C\u0443|\u0446\u044C\u043E\u0433\u043E)\\s*(${c2(Lt)})(?=\\s*)`;
  }
  innerExtract(e, r) {
    let t = r[Ku].toLowerCase(), n = r[qu].toLowerCase(), i = Lt[n];
    if (t == "\u043D\u0430 \u043D\u0430\u0441\u0442\u0443\u043F\u043D\u043E\u043C\u0443" || t == "\u0432 \u043D\u0430\u0441\u0442\u0443\u043F\u043D\u043E\u043C\u0443" || t == "\u0443 \u043D\u0430\u0441\u0442\u0443\u043F\u043D\u043E\u043C\u0443" || t == "\u043D\u0430\u0441\u0442\u0443\u043F\u043D\u043E\u0433\u043E") {
      let m = {};
      return m[i] = 1, l2.createRelativeFromReference(e.reference, m);
    }
    if (t == "\u043D\u0430 \u043C\u0438\u043D\u0443\u043B\u043E\u043C\u0443" || t == "\u0432 \u043C\u0438\u043D\u0443\u043B\u043E\u043C\u0443" || t == "\u0443 \u043C\u0438\u043D\u0443\u043B\u043E\u043C\u0443" || t == "\u043C\u0438\u043D\u0443\u043B\u043E\u0433\u043E") {
      let m = {};
      return m[i] = -1, l2.createRelativeFromReference(e.reference, m);
    }
    let o2 = e.createParsingComponents(), a = ot(e.reference.instant);
    return i.match(/week/i) ? (a = a.add(-a.get("d"), "d"), o2.imply("day", a.date()), o2.imply("month", a.month() + 1), o2.imply("year", a.year())) : i.match(/month/i) ? (a = a.add(-a.date() + 1, "d"), o2.imply("day", a.date()), o2.assign("year", a.year()), o2.assign("month", a.month() + 1)) : i.match(/year/i) && (a = a.add(-a.date() + 1, "d"), a = a.add(-a.month(), "month"), o2.imply("day", a.date()), o2.imply("month", a.month() + 1), o2.assign("year", a.year())), o2;
  }
};
var tn = class extends B {
  innerPatternString(e) {
    return `(\u0446\u0456|\u043E\u0441\u0442\u0430\u043D\u043D\u0456|\u043C\u0438\u043D\u0443\u043B\u0456|\u043C\u0430\u0439\u0431\u0443\u0442\u043D\u0456|\u043D\u0430\u0441\u0442\u0443\u043F\u043D\u0456|\u043F\u0456\u0441\u043B\u044F|\u0447\u0435\u0440\u0435\u0437|\\+|-)\\s*(${Qe})`;
  }
  innerExtract(e, r) {
    let t = r[1].toLowerCase(), n = er(r[3]);
    switch (t) {
      case "\u043E\u0441\u0442\u0430\u043D\u043D\u0456":
      case "\u043C\u0438\u043D\u0443\u043B\u0456":
      case "-":
        n = A(n);
        break;
    }
    return l2.createRelativeFromReference(e.reference, n);
  }
};
var di = new g2(Pa());
var Zu = new g2(ui(true));
function Pa() {
  let s7 = ui(false);
  return s7.parsers.unshift(new Jt()), s7.parsers.unshift(new Qt()), s7.parsers.unshift(new Vt()), s7.parsers.unshift(new rn()), s7.parsers.unshift(new tn()), s7;
}
function ui(s7) {
  return _({ parsers: [new ie(), new O2(true), new zt(), new Ht(), new en(), new Kt(s7), new qt()], refiners: [new Xt(), new Zt()] }, s7);
}
function Xu(s7, e, r) {
  return di.parse(s7, e, r);
}
function Ju(s7, e, r) {
  return di.parseDate(s7, e, r);
}
var Ra = Nr;
function DA(s7, e, r) {
  return Ra.parse(s7, e, r);
}

// https://jsr.io/@silverbulletmd/silverbullet/2.0.0/plug-api/syscall.ts
if (typeof self === "undefined") {
  self = {
    syscall: () => {
      throw new Error("Not implemented here");
    }
  };
}
function syscall2(name, ...args) {
  return globalThis.syscall(name, ...args);
}

// https://jsr.io/@silverbulletmd/silverbullet/2.0.0/plug-api/syscalls/system.ts
var system_exports = {};
__export(system_exports, {
  getConfig: () => getConfig,
  getMode: () => getMode,
  getVersion: () => getVersion,
  invokeCommand: () => invokeCommand,
  invokeFunction: () => invokeFunction,
  listCommands: () => listCommands,
  listSyscalls: () => listSyscalls,
  reloadPlugs: () => reloadPlugs,
  wipeClient: () => wipeClient
});
function invokeFunction(name, ...args) {
  return syscall2("system.invokeFunction", name, ...args);
}
function invokeCommand(name, args) {
  return syscall2("system.invokeCommand", name, args);
}
function listCommands() {
  return syscall2("system.listCommands");
}
function listSyscalls() {
  return syscall2("system.listSyscalls");
}
function reloadPlugs() {
  return syscall2("system.reloadPlugs");
}
function getMode() {
  return syscall2("system.getMode");
}
function getVersion() {
  return syscall2("system.getVersion");
}
function getConfig(key, defaultValue = void 0) {
  return syscall2("system.getConfig", key, defaultValue);
}
function wipeClient(logout = false) {
  return syscall2("system.wipeClient", logout);
}

// ../home/dnarayan/Projects/silverbullet-nldates/nldates.ts
var cachedConfig = {
  dateFormat: "yyyy-MM-dd HH:mm",
  includeTime: true,
  timezone: void 0
};
var lastConfigUpdate = 0;
var parseHistory = [];
var MAX_PARSE_HISTORY = 4;
async function updateConfig() {
  if (Date.now() < lastConfigUpdate + 5e3)
    return;
  lastConfigUpdate = Date.now();
  const config = await system_exports.getConfig("nldates");
  if (config) {
    cachedConfig = {
      dateFormat: config.dateFormat || "yyyy-MM-dd HH:mm",
      includeTime: config.includeTime !== false,
      timezone: config.timezone
    };
  }
}
function formatDate(date, hasTime) {
  const format = cachedConfig.dateFormat || "yyyy-MM-dd HH:mm";
  let finalFormat = format;
  if (!hasTime && !cachedConfig.includeTime) {
    finalFormat = format.replace(/\s*[HhKkmsSaAzZOXx:]+\s*/g, "").trim();
  }
  return formatDateWithPattern(date, finalFormat);
}
function formatDateWithPattern(date, pattern) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  const monthsShort = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];
  const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const pad = (n, width = 2) => String(n).padStart(width, "0");
  const replacements = {
    "yyyy": () => String(date.getFullYear()),
    "yy": () => String(date.getFullYear()).slice(-2),
    "MMMM": () => months[date.getMonth()],
    "MMM": () => monthsShort[date.getMonth()],
    "MM": () => pad(date.getMonth() + 1),
    "M": () => String(date.getMonth() + 1),
    "dd": () => pad(date.getDate()),
    "d": () => String(date.getDate()),
    "EEEE": () => days[date.getDay()],
    "EEE": () => daysShort[date.getDay()],
    "HH": () => pad(date.getHours()),
    "H": () => String(date.getHours()),
    "hh": () => pad(date.getHours() % 12 || 12),
    "h": () => String(date.getHours() % 12 || 12),
    "mm": () => pad(date.getMinutes()),
    "m": () => String(date.getMinutes()),
    "ss": () => pad(date.getSeconds()),
    "s": () => String(date.getSeconds()),
    "a": () => date.getHours() >= 12 ? "PM" : "AM",
    "A": () => date.getHours() >= 12 ? "PM" : "AM"
  };
  let result = pattern;
  const sortedKeys = Object.keys(replacements).sort((a, b3) => b3.length - a.length);
  for (const key of sortedKeys) {
    result = result.replace(new RegExp(key, "g"), replacements[key]());
  }
  return result;
}
function nlDateCompleter({ linePrefix, pos, parentNodes }) {
  updateConfig();
  const match = /!!(.*)$/.exec(linePrefix);
  if (!match) {
    return null;
  }
  if (parentNodes.find(
    (node) => node === "LuaDirective" || node.startsWith("FencedCode")
  )) {
    return null;
  }
  const [fullMatch, naturalLanguageInput] = match;
  const currentDate = /* @__PURE__ */ new Date();
  const options = [];
  let hasParseResult = false;
  if (naturalLanguageInput && naturalLanguageInput.trim()) {
    const parseResults = DA(naturalLanguageInput, currentDate, {
      forwardDate: true
      // Prefer future dates for ambiguous cases
    });
    if (parseResults.length > 0) {
      const result = parseResults[0];
      const parsedDate = result.start.date();
      const hasTime = result.start.isCertain("hour") || result.start.isCertain("minute");
      const formattedDate = formatDate(parsedDate, hasTime);
      const existingIndex = parseHistory.findIndex(
        (h2) => h2.formatted === formattedDate
      );
      if (existingIndex !== -1) {
        parseHistory.splice(existingIndex, 1);
      }
      parseHistory.unshift({
        input: naturalLanguageInput.trim(),
        date: parsedDate,
        hasTime,
        formatted: formattedDate
      });
      if (parseHistory.length > MAX_PARSE_HISTORY) {
        parseHistory = parseHistory.slice(0, MAX_PARSE_HISTORY);
      }
      hasParseResult = true;
    }
  }
  for (const item of parseHistory) {
    let detailString = "\u{1F4C5} " + item.date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    if (item.hasTime) {
      detailString += " " + item.date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
    }
    detailString += ` [${item.input}]`;
    options.push({
      label: item.formatted,
      detail: detailString,
      type: "date",
      apply: item.formatted,
      boost: 100 - parseHistory.indexOf(item)
      // Most recent gets highest boost
    });
  }
  if (!hasParseResult) {
    options.push({
      label: formatDate(currentDate, false),
      detail: "\u{1F4C5} " + currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }) + " [today]",
      type: "date",
      apply: formatDate(currentDate, false),
      boost: 10
    });
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    options.push({
      label: formatDate(tomorrow, false),
      detail: "\u{1F4C5} " + tomorrow.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }) + " [tomorrow]",
      type: "date",
      apply: formatDate(tomorrow, false),
      boost: 9
    });
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    options.push({
      label: formatDate(yesterday, false),
      detail: "\u{1F4C5} " + yesterday.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }) + " [yesterday]",
      type: "date",
      apply: formatDate(yesterday, false),
      boost: 8
    });
  }
  return {
    from: pos - fullMatch.length,
    filter: false,
    options
  };
}

// d3ea523cc9293709.js
var functionMapping = {
  nlDateCompleter
};
var manifest = {
  "name": "nldates",
  "config": {
    "schema.config.properties": {
      "nldates": {
        "type": "object",
        "properties": {
          "dateFormat": {
            "type": "string",
            "description": "Output format for dates (using Unicode date format patterns)",
            "default": "yyyy-MM-dd HH:mm"
          },
          "includeTime": {
            "type": "boolean",
            "description": "Include time in output if parsed",
            "default": true
          },
          "timezone": {
            "type": "string",
            "description": "Timezone for date parsing and formatting",
            "nullable": true
          }
        },
        "nullable": true
      }
    }
  },
  "functions": {
    "nlDateCompleter": {
      "path": "./nldates.ts:nlDateCompleter",
      "events": [
        "editor:complete",
        "minieditor:complete"
      ]
    }
  },
  "assets": {}
};
var plug = { manifest, functionMapping };
setupMessageListener(functionMapping, manifest, self.postMessage);
export {
  plug
};
//# sourceMappingURL=nldates.plug.js.map
