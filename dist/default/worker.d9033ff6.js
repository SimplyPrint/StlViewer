// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (modules, entry, mainEntry, parcelRequireName, globalName) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        this
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"h1UYz":[function(require,module,exports) {
"use strict";
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = 1234;
var HMR_SECURE = false;
var HMR_ENV_HASH = "6b8f77648603cadf";
module.bundle.HMR_BUNDLE_ID = "ac528cc6d9033ff6";
/* global HMR_HOST, HMR_PORT, HMR_ENV_HASH, HMR_SECURE, chrome, browser, globalThis, __parcel__import__, __parcel__importScripts__, ServiceWorkerGlobalScope */ /*::
import type {
  HMRAsset,
  HMRMessage,
} from '@parcel/reporter-dev-server/src/HMRServer.js';
interface ParcelRequire {
  (string): mixed;
  cache: {|[string]: ParcelModule|};
  hotData: mixed;
  Module: any;
  parent: ?ParcelRequire;
  isParcelRequire: true;
  modules: {|[string]: [Function, {|[string]: string|}]|};
  HMR_BUNDLE_ID: string;
  root: ParcelRequire;
}
interface ParcelModule {
  hot: {|
    data: mixed,
    accept(cb: (Function) => void): void,
    dispose(cb: (mixed) => void): void,
    // accept(deps: Array<string> | string, cb: (Function) => void): void,
    // decline(): void,
    _acceptCallbacks: Array<(Function) => void>,
    _disposeCallbacks: Array<(mixed) => void>,
  |};
}
interface ExtensionContext {
  runtime: {|
    reload(): void,
    getURL(url: string): string;
    getManifest(): {manifest_version: number, ...};
  |};
}
declare var module: {bundle: ParcelRequire, ...};
declare var HMR_HOST: string;
declare var HMR_PORT: string;
declare var HMR_ENV_HASH: string;
declare var HMR_SECURE: boolean;
declare var chrome: ExtensionContext;
declare var browser: ExtensionContext;
declare var __parcel__import__: (string) => Promise<void>;
declare var __parcel__importScripts__: (string) => Promise<void>;
declare var globalThis: typeof self;
declare var ServiceWorkerGlobalScope: Object;
*/ var OVERLAY_ID = "__parcel__error__overlay__";
var OldModule = module.bundle.Module;
function Module(moduleName) {
    OldModule.call(this, moduleName);
    this.hot = {
        data: module.bundle.hotData,
        _acceptCallbacks: [],
        _disposeCallbacks: [],
        accept: function(fn) {
            this._acceptCallbacks.push(fn || function() {});
        },
        dispose: function(fn) {
            this._disposeCallbacks.push(fn);
        }
    };
    module.bundle.hotData = undefined;
}
module.bundle.Module = Module;
var checkedAssets, acceptedAssets, assetsToAccept /*: Array<[ParcelRequire, string]> */ ;
function getHostname() {
    return HMR_HOST || (location.protocol.indexOf("http") === 0 ? location.hostname : "localhost");
}
function getPort() {
    return HMR_PORT || location.port;
} // eslint-disable-next-line no-redeclare
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== "undefined") {
    var hostname = getHostname();
    var port = getPort();
    var protocol = HMR_SECURE || location.protocol == "https:" && !/localhost|127.0.0.1|0.0.0.0/.test(hostname) ? "wss" : "ws";
    var ws = new WebSocket(protocol + "://" + hostname + (port ? ":" + port : "") + "/"); // Web extension context
    var extCtx = typeof chrome === "undefined" ? typeof browser === "undefined" ? null : browser : chrome; // Safari doesn't support sourceURL in error stacks.
    // eval may also be disabled via CSP, so do a quick check.
    var supportsSourceURL = false;
    try {
        (0, eval)('throw new Error("test"); //# sourceURL=test.js');
    } catch (err) {
        supportsSourceURL = err.stack.includes("test.js");
    } // $FlowFixMe
    ws.onmessage = async function(event) {
        checkedAssets = {} /*: {|[string]: boolean|} */ ;
        acceptedAssets = {} /*: {|[string]: boolean|} */ ;
        assetsToAccept = [];
        var data = JSON.parse(event.data);
        if (data.type === "update") {
            // Remove error overlay if there is one
            if (typeof document !== "undefined") removeErrorOverlay();
            let assets = data.assets.filter((asset)=>asset.envHash === HMR_ENV_HASH); // Handle HMR Update
            let handled = assets.every((asset)=>{
                return asset.type === "css" || asset.type === "js" && hmrAcceptCheck(module.bundle.root, asset.id, asset.depsByBundle);
            });
            if (handled) {
                console.clear(); // Dispatch custom event so other runtimes (e.g React Refresh) are aware.
                if (typeof window !== "undefined" && typeof CustomEvent !== "undefined") window.dispatchEvent(new CustomEvent("parcelhmraccept"));
                await hmrApplyUpdates(assets);
                for(var i = 0; i < assetsToAccept.length; i++){
                    var id = assetsToAccept[i][1];
                    if (!acceptedAssets[id]) hmrAcceptRun(assetsToAccept[i][0], id);
                }
            } else fullReload();
        }
        if (data.type === "error") {
            // Log parcel errors to console
            for (let ansiDiagnostic of data.diagnostics.ansi){
                let stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
                console.error("\uD83D\uDEA8 [parcel]: " + ansiDiagnostic.message + "\n" + stack + "\n\n" + ansiDiagnostic.hints.join("\n"));
            }
            if (typeof document !== "undefined") {
                // Render the fancy html overlay
                removeErrorOverlay();
                var overlay = createErrorOverlay(data.diagnostics.html); // $FlowFixMe
                document.body.appendChild(overlay);
            }
        }
    };
    ws.onerror = function(e) {
        console.error(e.message);
    };
    ws.onclose = function() {
        console.warn("[parcel] \uD83D\uDEA8 Connection to the HMR server was lost");
    };
}
function removeErrorOverlay() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.remove();
        console.log("[parcel] ✨ Error resolved");
    }
}
function createErrorOverlay(diagnostics) {
    var overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    let errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';
    for (let diagnostic of diagnostics){
        let stack = diagnostic.frames.length ? diagnostic.frames.reduce((p, frame)=>{
            return `${p}
<a href="/__parcel_launch_editor?file=${encodeURIComponent(frame.location)}" style="text-decoration: underline; color: #888" onclick="fetch(this.href); return false">${frame.location}</a>
${frame.code}`;
        }, "") : diagnostic.stack;
        errorHTML += `
      <div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          🚨 ${diagnostic.message}
        </div>
        <pre>${stack}</pre>
        <div>
          ${diagnostic.hints.map((hint)=>"<div>\uD83D\uDCA1 " + hint + "</div>").join("")}
        </div>
        ${diagnostic.documentation ? `<div>📝 <a style="color: violet" href="${diagnostic.documentation}" target="_blank">Learn more</a></div>` : ""}
      </div>
    `;
    }
    errorHTML += "</div>";
    overlay.innerHTML = errorHTML;
    return overlay;
}
function fullReload() {
    if ("reload" in location) location.reload();
    else if (extCtx && extCtx.runtime && extCtx.runtime.reload) extCtx.runtime.reload();
}
function getParents(bundle, id) /*: Array<[ParcelRequire, string]> */ {
    var modules = bundle.modules;
    if (!modules) return [];
    var parents = [];
    var k, d, dep;
    for(k in modules)for(d in modules[k][1]){
        dep = modules[k][1][d];
        if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) parents.push([
            bundle,
            k
        ]);
    }
    if (bundle.parent) parents = parents.concat(getParents(bundle.parent, id));
    return parents;
}
function updateLink(link) {
    var newLink = link.cloneNode();
    newLink.onload = function() {
        if (link.parentNode !== null) // $FlowFixMe
        link.parentNode.removeChild(link);
    };
    newLink.setAttribute("href", link.getAttribute("href").split("?")[0] + "?" + Date.now()); // $FlowFixMe
    link.parentNode.insertBefore(newLink, link.nextSibling);
}
var cssTimeout = null;
function reloadCSS() {
    if (cssTimeout) return;
    cssTimeout = setTimeout(function() {
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for(var i = 0; i < links.length; i++){
            // $FlowFixMe[incompatible-type]
            var href = links[i].getAttribute("href");
            var hostname = getHostname();
            var servedFromHMRServer = hostname === "localhost" ? new RegExp("^(https?:\\/\\/(0.0.0.0|127.0.0.1)|localhost):" + getPort()).test(href) : href.indexOf(hostname + ":" + getPort());
            var absolute = /^https?:\/\//i.test(href) && href.indexOf(location.origin) !== 0 && !servedFromHMRServer;
            if (!absolute) updateLink(links[i]);
        }
        cssTimeout = null;
    }, 50);
}
function hmrDownload(asset) {
    if (asset.type === "js") {
        if (typeof document !== "undefined") {
            let script = document.createElement("script");
            script.src = asset.url + "?t=" + Date.now();
            if (asset.outputFormat === "esmodule") script.type = "module";
            return new Promise((resolve, reject)=>{
                var _document$head;
                script.onload = ()=>resolve(script);
                script.onerror = reject;
                (_document$head = document.head) === null || _document$head === void 0 || _document$head.appendChild(script);
            });
        } else if (typeof importScripts === "function") {
            // Worker scripts
            if (asset.outputFormat === "esmodule") return import(asset.url + "?t=" + Date.now());
            else return new Promise((resolve, reject)=>{
                try {
                    importScripts(asset.url + "?t=" + Date.now());
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }
    }
}
async function hmrApplyUpdates(assets) {
    global.parcelHotUpdate = Object.create(null);
    let scriptsToRemove;
    try {
        // If sourceURL comments aren't supported in eval, we need to load
        // the update from the dev server over HTTP so that stack traces
        // are correct in errors/logs. This is much slower than eval, so
        // we only do it if needed (currently just Safari).
        // https://bugs.webkit.org/show_bug.cgi?id=137297
        // This path is also taken if a CSP disallows eval.
        if (!supportsSourceURL) {
            let promises = assets.map((asset)=>{
                var _hmrDownload;
                return (_hmrDownload = hmrDownload(asset)) === null || _hmrDownload === void 0 ? void 0 : _hmrDownload.catch((err)=>{
                    // Web extension bugfix for Chromium
                    // https://bugs.chromium.org/p/chromium/issues/detail?id=1255412#c12
                    if (extCtx && extCtx.runtime && extCtx.runtime.getManifest().manifest_version == 3) {
                        if (typeof ServiceWorkerGlobalScope != "undefined" && global instanceof ServiceWorkerGlobalScope) {
                            extCtx.runtime.reload();
                            return;
                        }
                        asset.url = extCtx.runtime.getURL("/__parcel_hmr_proxy__?url=" + encodeURIComponent(asset.url + "?t=" + Date.now()));
                        return hmrDownload(asset);
                    }
                    throw err;
                });
            });
            scriptsToRemove = await Promise.all(promises);
        }
        assets.forEach(function(asset) {
            hmrApply(module.bundle.root, asset);
        });
    } finally{
        delete global.parcelHotUpdate;
        if (scriptsToRemove) scriptsToRemove.forEach((script)=>{
            if (script) {
                var _document$head2;
                (_document$head2 = document.head) === null || _document$head2 === void 0 || _document$head2.removeChild(script);
            }
        });
    }
}
function hmrApply(bundle, asset) {
    var modules = bundle.modules;
    if (!modules) return;
    if (asset.type === "css") reloadCSS();
    else if (asset.type === "js") {
        let deps = asset.depsByBundle[bundle.HMR_BUNDLE_ID];
        if (deps) {
            if (modules[asset.id]) {
                // Remove dependencies that are removed and will become orphaned.
                // This is necessary so that if the asset is added back again, the cache is gone, and we prevent a full page reload.
                let oldDeps = modules[asset.id][1];
                for(let dep in oldDeps)if (!deps[dep] || deps[dep] !== oldDeps[dep]) {
                    let id = oldDeps[dep];
                    let parents = getParents(module.bundle.root, id);
                    if (parents.length === 1) hmrDelete(module.bundle.root, id);
                }
            }
            if (supportsSourceURL) // Global eval. We would use `new Function` here but browser
            // support for source maps is better with eval.
            (0, eval)(asset.output);
             // $FlowFixMe
            let fn = global.parcelHotUpdate[asset.id];
            modules[asset.id] = [
                fn,
                deps
            ];
        } else if (bundle.parent) hmrApply(bundle.parent, asset);
    }
}
function hmrDelete(bundle, id) {
    let modules = bundle.modules;
    if (!modules) return;
    if (modules[id]) {
        // Collect dependencies that will become orphaned when this module is deleted.
        let deps = modules[id][1];
        let orphans = [];
        for(let dep in deps){
            let parents = getParents(module.bundle.root, deps[dep]);
            if (parents.length === 1) orphans.push(deps[dep]);
        } // Delete the module. This must be done before deleting dependencies in case of circular dependencies.
        delete modules[id];
        delete bundle.cache[id]; // Now delete the orphans.
        orphans.forEach((id)=>{
            hmrDelete(module.bundle.root, id);
        });
    } else if (bundle.parent) hmrDelete(bundle.parent, id);
}
function hmrAcceptCheck(bundle, id, depsByBundle) {
    if (hmrAcceptCheckOne(bundle, id, depsByBundle)) return true;
     // Traverse parents breadth first. All possible ancestries must accept the HMR update, or we'll reload.
    let parents = getParents(module.bundle.root, id);
    let accepted = false;
    while(parents.length > 0){
        let v = parents.shift();
        let a = hmrAcceptCheckOne(v[0], v[1], null);
        if (a) // If this parent accepts, stop traversing upward, but still consider siblings.
        accepted = true;
        else {
            // Otherwise, queue the parents in the next level upward.
            let p = getParents(module.bundle.root, v[1]);
            if (p.length === 0) {
                // If there are no parents, then we've reached an entry without accepting. Reload.
                accepted = false;
                break;
            }
            parents.push(...p);
        }
    }
    return accepted;
}
function hmrAcceptCheckOne(bundle, id, depsByBundle) {
    var modules = bundle.modules;
    if (!modules) return;
    if (depsByBundle && !depsByBundle[bundle.HMR_BUNDLE_ID]) {
        // If we reached the root bundle without finding where the asset should go,
        // there's nothing to do. Mark as "accepted" so we don't reload the page.
        if (!bundle.parent) return true;
        return hmrAcceptCheck(bundle.parent, id, depsByBundle);
    }
    if (checkedAssets[id]) return true;
    checkedAssets[id] = true;
    var cached = bundle.cache[id];
    assetsToAccept.push([
        bundle,
        id
    ]);
    if (!cached || cached.hot && cached.hot._acceptCallbacks.length) return true;
}
function hmrAcceptRun(bundle, id) {
    var cached = bundle.cache[id];
    bundle.hotData = {};
    if (cached && cached.hot) cached.hot.data = bundle.hotData;
    if (cached && cached.hot && cached.hot._disposeCallbacks.length) cached.hot._disposeCallbacks.forEach(function(cb) {
        cb(bundle.hotData);
    });
    delete bundle.cache[id];
    bundle(id);
    cached = bundle.cache[id];
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) cached.hot._acceptCallbacks.forEach(function(cb) {
        var assetsToAlsoAccept = cb(function() {
            return getParents(module.bundle.root, id);
        });
        if (assetsToAlsoAccept && assetsToAccept.length) // $FlowFixMe[method-unbinding]
        assetsToAccept.push.apply(assetsToAccept, assetsToAlsoAccept);
    });
    acceptedAssets[id] = true;
}

},{}],"au4a9":[function(require,module,exports) {
var _parser = require("./parser");
//1.13
//load STL file info geometry and returns it
const MSG_DATA = 0;
const MSG_LOAD = 1;
const MSG_ERROR = 2;
const MSG_STL_LOADED = 3;
const MSG_LOAD_IN_PROGRESS = 4;
let filename = null;
let local_file = null;
let load_from_blob_or_ab = null; //from ArrayBuffer
let x = 0;
let y = 0;
let z = 0;
let model_id = -1;
let get_progress = false;
onmessage = function(e) {
    switch(e.data.msg_type){
        case MSG_DATA:
            if (!e.data.data) {
                send_error("no data");
                break;
            }
            if (!e.data.data.filename && !e.data.data.local_file) {
                send_error("no file");
                break;
            }
            if (e.data.data.local_file) {
                filename = e.data.data.local_file.name ? e.data.data.local_file.name : e.data.data.filename; //filename property is usefull for blob files, 10x Fraser
                local_file = e.data.data.local_file ? e.data.data.local_file : null;
            } else if (e.data.data.filename) filename = e.data.data.filename;
            if (e.data.data.x) {
                if (isNumeric(e.data.data.x)) x = e.data.data.x;
            }
            if (e.data.data.y) {
                if (isNumeric(e.data.data.y)) y = e.data.data.y;
            }
            if (e.data.data.y) {
                if (isNumeric(e.data.data.z)) z = e.data.data.z;
            }
            load_from_blob_or_ab = null;
            if (e.data.load_from_blob_or_ab) load_from_blob_or_ab = e.data.load_from_blob_or_ab;
            model_id = e.data.data.id ? e.data.data.id : -1;
            get_progress = e.data.get_progress ? e.data.get_progress : false;
            break;
        case MSG_LOAD:
            if (load_from_blob_or_ab) {
                //blob/arraybuffer ready to be parsed
                if (load_from_blob_or_ab instanceof ArrayBuffer) after_file_load(load_from_blob_or_ab); //arraybuffer
                else read_file(load_from_blob_or_ab); //blob
            } else if (local_file) //local server file (not to confuse with local computer file)
            read_file(local_file);
            else if (filename) //url file (assuming accessible for this domain (if NOT, get help here - https://www.viewstl.com/local_url/)
            download_from_local(filename);
            break;
        default:
            console.log("invalid msg: " + e.data.msg_type);
    }
};
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
function send_error(s) {
    postMessage({
        msg_type: MSG_ERROR,
        data: s
    });
}
function download_from_local(filename) {
    if (fetch) download_from_local_fetch(filename);
    else download_from_local_xhr(filename);
}
function download_from_local_xhr(filename) {
    let xhr = new XMLHttpRequest();
    if (get_progress) xhr.onprogress = function(e) {
        postMessage({
            msg_type: MSG_LOAD_IN_PROGRESS,
            id: model_id,
            loaded: e.loaded,
            total: e.total
        });
    };
    xhr.onreadystatechange = function(e) {
        if (xhr.readyState == 4) //console.log('status: '+xhr.status);
        {
            if (xhr.status == 200) //console.log('done');
            after_file_load(xhr.response);
        }
    };
    xhr.open("GET", filename, true);
    //xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.responseType = "arraybuffer";
    xhr.send(null);
}
async function download_from_local_fetch(filename) {
    const response = await fetch(filename);
    after_file_load(await response.arrayBuffer());
}
function after_file_load(s) {
    let vf_data;
    if (!s) {
        send_error("no data");
        return;
    }
    try {
        vf_data = (0, _parser.parse_3d_file)(filename, s, after_file_parse);
    } catch (err) {
        console.log(err);
        send_error("Error parsing the file");
        return;
    }
/*if (typeof vf_data === 'string') {
        send_error(vf_data);
        return;
    }

    postMessage({ msg_type: MSG_STL_LOADED, vertices: vf_data.vertices, faces: vf_data.faces, colors: vf_data.colors });*/ }
function after_file_parse(vf_data) {
    if (typeof vf_data === "string") {
        send_error(vf_data);
        return;
    }
    postMessage({
        msg_type: MSG_STL_LOADED,
        vertices: vf_data.vertices,
        faces: vf_data.faces,
        colors: vf_data.colors
    });
}
function read_file(f) {
    let reader = new FileReader();
    reader.onerror = function(e) {
        let error_str = "";
        switch(e.target.error.code){
            case e.target.error.NOT_FOUND_ERR:
                error_str = "File not found";
                break;
            case e.target.error.NOT_READABLE_ERR:
                error_str = "Can't read file - too large?";
                break;
            case e.target.error.ABORT_ERR:
                error_str = "Read operation aborted";
                break;
            case e.target.error.SECURITY_ERR:
                error_str = "File is locked";
                break;
            case e.target.error.ENCODING_ERR:
                error_str = "File too large";
                break;
            default:
                error_str = "Error reading file";
        }
        send_error(error_str);
    };
    reader.onprogress = function(e) {
        postMessage({
            msg_type: MSG_LOAD_IN_PROGRESS,
            id: model_id,
            loaded: e.loaded,
            total: e.total
        });
    };
    reader.onload = function(e) {
        after_file_load(e.target.result);
    };
    reader.readAsArrayBuffer(f);
}

},{"./parser":"6Io03"}],"6Io03":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
// module.exports.parse_3d_file = parse_3d_file;
parcelHelpers.export(exports, "parse_3d_file", ()=>parse_3d_file);
//1.13.1
//1.13.1 support for MagicLab colored-STL method
function parse_3d_file(filename, s, callback) {
    //determine type of file
    //console.log(filename.split('.').pop().toLowerCase());
    //switch (filename.split('.').pop().toLowerCase())
    var res = null;
    switch(filename.split(".").pop().split("?")[0].toLowerCase()){
        case "stl":
            res = parse_stl_bin(s);
            break;
        case "obj":
            res = parse_obj(s);
            break;
        case "vf":
            res = parse_vf(arrayBufferToString(s));
            break;
        default:
            res = parse_stl_bin(s);
            break;
    }
    if (callback) callback(res);
}
function arrayBufferToString(buffer, onSuccess, onFail) {
    if (typeof TextDecoder != "undefined") return new TextDecoder("utf-8").decode(buffer);
    var bufView = new Uint8Array(buffer);
    var length = bufView.length;
    var result = "";
    for(var i1 = 0; i1 < length; i1 += 16383){
        var addition = 16383;
        if (i1 + 16383 > length) addition = length - i1;
        result += String.fromCharCode.apply(null, bufView.subarray(i1, i1 + addition));
    }
    return result;
}
function parse_stl_ascii(s) {
    try {
        var stl_string = arrayBufferToString(s);
        var vertices = [];
        var faces = [];
        var vert_hash = {};
        stl_string = stl_string.replace(/\r/, "\n");
        stl_string = stl_string.replace(/^solid[^\n]*/, "");
        stl_string = stl_string.replace(/\n/g, " ");
        stl_string = stl_string.replace(/facet normal /g, "");
        stl_string = stl_string.replace(/outer loop/g, "");
        stl_string = stl_string.replace(/vertex /g, "");
        stl_string = stl_string.replace(/endloop/g, "");
        stl_string = stl_string.replace(/endfacet/g, "");
        stl_string = stl_string.replace(/endsolid[^\n]*/, "");
        stl_string = stl_string.replace(/facet/g, "");
        stl_string = stl_string.replace(/\s+/g, " ");
        stl_string = stl_string.replace(/^\s+/, "");
        var facet_count = 0;
        var block_start = 0;
        var vertex;
        var vertexIndex;
        var points = stl_string.split(" ");
        var face_indices = [];
        var len = points.length / 12 - 1;
        for(var i1 = 0; i1 < len; i1++){
            face_indices = [];
            for(var x = 0; x < 3; x++){
                f1 = parseFloat(points[block_start + x * 3 + 3]);
                f2 = parseFloat(points[block_start + x * 3 + 4]);
                f3 = parseFloat(points[block_start + x * 3 + 5]);
                vertexIndex = vert_hash[[
                    f1,
                    f2,
                    f3
                ]];
                if (vertexIndex == null) {
                    vertexIndex = vertices.length;
                    vertices.push(new Array(f1, f2, f3));
                    vert_hash[[
                        f1,
                        f2,
                        f3
                    ]] = vertexIndex;
                }
                face_indices.push(vertexIndex);
            }
            faces.push(new Array(face_indices[0], face_indices[1], face_indices[2]));
            block_start = block_start + 12;
        }
        return {
            vertices: vertices,
            faces: faces,
            colors: false
        };
    } catch (err) {
        //return "Can't parse file";
        return "ERROR1: " + err.message;
    }
}
function parse_stl_bin(s) {
    var vertices = [];
    var faces = [];
    var vert_hash = {};
    var vertexIndex;
    var f11, f21, f31;
    var v1, v2, v3;
    var color_bit = 0;
    var color_method_mt = false; //face colors are encoded Materialise Magics method (othereise it can be Meshlab method)
    if (!s) return null;
    //see if this is colored STL
    var cpos = arrayBufferToString(s.slice(0, 80)).toLowerCase().indexOf("color");
    //cpos=true;
    var fdata = new DataView(s, 0);
    var have_face_colors = false;
    var def_red_color = -1;
    var def_green_color = -1;
    var def_blue_color = -1;
    if (cpos > -1) {
        //there is a color (Materialise Magics format), get the default color
        color_method_mt = true;
        def_red_color = fdata.getUint8(cpos + 6, true) / 31;
        def_green_color = fdata.getUint8(cpos + 7, true) / 31;
        def_blue_color = fdata.getUint8(cpos + 8, true) / 31;
    }
    var pos = 80;
    try {
        var tcount = fdata.getUint32(pos, true);
    } catch (err) {
        //return "Can't parse file";
        return "ERROR2: " + err.message;
    }
    //check if we're binary or ascii - comparing the actual file size to the "what is written in the file" file size
    var predictedSize = 84 /* count */  + 50 * tcount;
    if (!(s.byteLength == predictedSize)) return parse_stl_ascii(s);
    try {
        pos += 4;
        while(tcount--){
            pos += 12;
            f11 = fdata.getFloat32(pos, true);
            f21 = fdata.getFloat32(pos + 4, true);
            f31 = fdata.getFloat32(pos + 8, true);
            vertexIndex = vert_hash[[
                f11,
                f21,
                f31
            ]];
            if (vertexIndex == null) {
                vertexIndex = vertices.length;
                vertices.push(new Array(f11, f21, f31));
                vert_hash[[
                    f11,
                    f21,
                    f31
                ]] = vertexIndex;
            }
            v1 = vertexIndex;
            pos += 12;
            f11 = fdata.getFloat32(pos, true);
            f21 = fdata.getFloat32(pos + 4, true);
            f31 = fdata.getFloat32(pos + 8, true);
            vertexIndex = vert_hash[[
                f11,
                f21,
                f31
            ]];
            if (vertexIndex == null) {
                vertexIndex = vertices.length;
                vertices.push(new Array(f11, f21, f31));
                vert_hash[[
                    f11,
                    f21,
                    f31
                ]] = vertexIndex;
            }
            v2 = vertexIndex;
            pos += 12;
            f11 = fdata.getFloat32(pos, true);
            f21 = fdata.getFloat32(pos + 4, true);
            f31 = fdata.getFloat32(pos + 8, true);
            vertexIndex = vert_hash[[
                f11,
                f21,
                f31
            ]];
            if (vertexIndex == null) {
                vertexIndex = vertices.length;
                vertices.push(new Array(f11, f21, f31));
                vert_hash[[
                    f11,
                    f21,
                    f31
                ]] = vertexIndex;
            }
            v3 = vertexIndex;
            //color data (if any)
            pos += 12;
            var face_color = fdata.getUint16(pos, true);
            //color_bit=color_method_mt?1:(face_color & 1); //0000000000000001 => 1=have face color, 0=nope
            color_bit = color_method_mt ? 1 : (face_color & 32768) >> 15; //1000000000000000 => 1=have face color, 0=nope
            //console.log('color_bit', color_bit, face_color);
            if (color_bit) {
                var color_red, color_green, color_blue;
                if (color_method_mt) {
                    if (face_color == 32768 || face_color == 65535) {
                        //default color
                        color_red = def_red_color;
                        color_green = def_green_color;
                        color_blue = def_blue_color;
                    } else {
                        have_face_colors = true;
                        color_red = (face_color & 31) / 31; //0000000000011111
                        color_green = ((face_color & 992) >> 5) / 31; //0000001111100000
                        color_blue = ((face_color & 31744) >> 10) / 31; //0111110000000000
                    //the rgb are saved in values from 0 to 31 ... for us, we want it to be 0 to 1 - hence the 31)
                    }
                } else {
                    //meshlab color format
                    have_face_colors = true;
                    color_blue = (face_color & 31) / 31; //0000000000011111
                    color_green = ((face_color & 992) >> 5) / 31; //0000001111100000
                    color_red = ((face_color & 31744) >> 10) / 31; //0111110000000000
                }
                faces.push(new Array(v1, v2, v3, color_red, color_green, color_blue));
            } else //no color for face
            faces.push(new Array(v1, v2, v3));
            pos += 2;
        }
        vert_hash = null;
        return {
            vertices: vertices,
            faces: faces,
            colors: have_face_colors
        };
    } catch (err1) {
        //return "Can't parse file";
        return "ERROR3: " + err1.message;
    }
}
function parse_vf(s) {
    var o = JSON.parse(s);
    var vertices = [];
    var faces = [];
    try {
        var len = o.vertices.length;
        for(i = 0; i < len; i++)vertices.push(new Array(o.vertices[i][0], o.vertices[i][1], o.vertices[i][2]));
        var len = o.faces.length;
        for(i = 0; i < len; i++)faces.push(new Array(o.faces[i][0], o.faces[i][1], o.faces[i][2]));
        return {
            vertices: vertices,
            faces: faces,
            colors: false
        };
    } catch (err) {
        // return "Can't parse file";
        return "ERROR4: " + err.message;
    }
}
if (!ArrayBuffer.prototype.slice) //Returns a new ArrayBuffer whose contents are a copy of this ArrayBuffer's
//bytes from `begin`, inclusive, up to `end`, exclusive
ArrayBuffer.prototype.slice = function(begin, end) {
    //If `begin` is unspecified, Chrome assumes 0, so we do the same
    if (begin === void 0) begin = 0;
    //If `end` is unspecified, the new ArrayBuffer contains all
    //bytes from `begin` to the end of this ArrayBuffer.
    if (end === void 0) end = this.byteLength;
    //Chrome converts the values to integers via flooring
    begin = Math.floor(begin);
    end = Math.floor(end);
    //If either `begin` or `end` is negative, it refers to an
    //index from the end of the array, as opposed to from the beginning.
    if (begin < 0) begin += this.byteLength;
    if (end < 0) end += this.byteLength;
    //The range specified by the `begin` and `end` values is clamped to the 
    //valid index range for the current array.
    begin = Math.min(Math.max(0, begin), this.byteLength);
    end = Math.min(Math.max(0, end), this.byteLength);
    //If the computed length of the new ArrayBuffer would be negative, it 
    //is clamped to zero.
    if (end - begin <= 0) return new ArrayBuffer(0);
    var result = new ArrayBuffer(end - begin);
    var resultBytes = new Uint8Array(result);
    var sourceBytes = new Uint8Array(this, begin, end - begin);
    resultBytes.set(sourceBytes);
    return result;
};
function parse_obj(s) {
    var obj_string = arrayBufferToString(s);
    function vector(x, y, z) {
        return new Array(parseFloat(x), parseFloat(y), parseFloat(z));
    }
    function uv(u, v) {
        return new Array(parseFloat(u), parseFloat(v));
    }
    function face3(a, b, c, normals) {
        return new Array(a, b, c, normals);
    }
    function parseVertexIndex(index) {
        index = parseInt(index);
        return index >= 0 ? index - 1 : index + vertices.length;
    }
    function parseNormalIndex(index) {
        index = parseInt(index);
        return index >= 0 ? index - 1 : index + normals.length;
    }
    function parseUVIndex(index) {
        index = parseInt(index);
        return index >= 0 ? index - 1 : index + uvs.length;
    }
    function add_face(a, b, c, normals_inds) {
        //faces.push( new Array (vertices[ parseVertexIndex( a ) ] - 1,vertices[ parseVertexIndex( b ) ] - 1,vertices[ parseVertexIndex( c ) ] - 1));
        faces.push(new Array(parseVertexIndex(a), parseVertexIndex(b), parseVertexIndex(c)));
    }
    function add_uvs(a, b, c) {
    //geometry.faceVertexUvs[ 0 ].push( [
    //	uvs[ parseUVIndex( a ) ].clone(),
    //	uvs[ parseUVIndex( b ) ].clone(),
    //	uvs[ parseUVIndex( c ) ].clone()
    //] );
    }
    function handle_face_line(faces, uvs, normals_inds) {
        if (faces[3] === undefined) {
            add_face(faces[0], faces[1], faces[2], normals_inds);
            if (uvs !== undefined && uvs.length > 0) add_uvs(uvs[0], uvs[1], uvs[2]);
        } else {
            if (normals_inds !== undefined && normals_inds.length > 0) {
                add_face(faces[0], faces[1], faces[3], [
                    normals_inds[0],
                    normals_inds[1],
                    normals_inds[3]
                ]);
                add_face(faces[1], faces[2], faces[3], [
                    normals_inds[1],
                    normals_inds[2],
                    normals_inds[3]
                ]);
            } else {
                add_face(faces[0], faces[1], faces[3]);
                add_face(faces[1], faces[2], faces[3]);
            }
            if (uvs !== undefined && uvs.length > 0) {
                add_uvs(uvs[0], uvs[1], uvs[3]);
                add_uvs(uvs[1], uvs[2], uvs[3]);
            }
        }
    }
    var vertices = [];
    var normals = [];
    var uvs = [];
    var faces = [];
    // v float float float
    var vertex_pattern = /v( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
    // vn float float float
    var normal_pattern = /vn( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
    // vt float float
    var uv_pattern = /vt( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
    // f vertex vertex vertex ...
    var face_pattern1 = /f( +-?\d+)( +-?\d+)( +-?\d+)( +-?\d+)?/;
    // f vertex/uv vertex/uv vertex/uv ...
    var face_pattern2 = /f( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))?/;
    // f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...
    var face_pattern3 = /f( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))?/;
    // f vertex//normal vertex//normal vertex//normal ... 
    var face_pattern4 = /f( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))?/;
    //
    var lines = obj_string.split("\n");
    for(var i1 = 0; i1 < lines.length; i1++){
        var line = lines[i1];
        line = line.trim();
        var result;
        if (line.length === 0 || line.charAt(0) === "#") continue;
        else if ((result = vertex_pattern.exec(line)) !== null) // ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
        vertices.push(//geometry.vertices.push(
        //vertices.push(
        vector(result[1], result[2], result[3]));
        else if ((result = normal_pattern.exec(line)) !== null) // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
        normals.push(vector(result[1], result[2], result[3]));
        else if ((result = uv_pattern.exec(line)) !== null) // ["vt 0.1 0.2", "0.1", "0.2"]
        uvs.push(uv(result[1], result[2]));
        else if ((result = face_pattern1.exec(line)) !== null) // ["f 1 2 3", "1", "2", "3", undefined]
        handle_face_line([
            result[1],
            result[2],
            result[3],
            result[4]
        ]);
        else if ((result = face_pattern2.exec(line)) !== null) // ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]
        handle_face_line([
            result[2],
            result[5],
            result[8],
            result[11]
        ], [
            result[3],
            result[6],
            result[9],
            result[12]
        ] //uv
        );
        else if ((result = face_pattern3.exec(line)) !== null) // ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]
        handle_face_line([
            result[2],
            result[6],
            result[10],
            result[14]
        ], [
            result[3],
            result[7],
            result[11],
            result[15]
        ], [
            result[4],
            result[8],
            result[12],
            result[16]
        ] //normal
        );
        else if ((result = face_pattern4.exec(line)) !== null) // ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]
        handle_face_line([
            result[2],
            result[5],
            result[8],
            result[11]
        ], [], [
            result[3],
            result[6],
            result[9],
            result[12]
        ] //normal
        );
    }
    return {
        vertices: vertices,
        faces: faces,
        colors: false
    };
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"fn8Fk"}],"fn8Fk":[function(require,module,exports) {
exports.interopDefault = function(a) {
    return a && a.__esModule ? a : {
        default: a
    };
};
exports.defineInteropFlag = function(a) {
    Object.defineProperty(a, "__esModule", {
        value: true
    });
};
exports.exportAll = function(source, dest) {
    Object.keys(source).forEach(function(key) {
        if (key === "default" || key === "__esModule" || dest.hasOwnProperty(key)) return;
        Object.defineProperty(dest, key, {
            enumerable: true,
            get: function() {
                return source[key];
            }
        });
    });
    return dest;
};
exports.export = function(dest, destName, get) {
    Object.defineProperty(dest, destName, {
        enumerable: true,
        get: get
    });
};

},{}]},["h1UYz","au4a9"], "au4a9", "parcelRequire97d1")

//# sourceMappingURL=worker.d9033ff6.js.map
