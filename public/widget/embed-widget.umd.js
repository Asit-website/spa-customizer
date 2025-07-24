(function(e){typeof define=="function"&&define.amd?define(e):e()})(function(){"use strict";var e={exports:{}},n={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var d;function R(){if(d)return n;d=1;var u=Symbol.for("react.transitional.element"),i=Symbol.for("react.fragment");function o(x,r,t){var s=null;if(t!==void 0&&(s=""+t),r.key!==void 0&&(s=""+r.key),"key"in r){t={};for(var c in r)c!=="key"&&(t[c]=r[c])}else t=r;return r=t.ref,{$$typeof:u,type:x,key:s,ref:r!==void 0?r:null,props:t}}return n.Fragment=i,n.jsx=o,n.jsxs=o,n}var a;function f(){return a||(a=1,e.exports=R()),e.exports}var l=f();window.mountProductCustomizer=function(u="#customizer-root",i={}){const o=document.querySelector(u);if(!o){console.warn("No container found for customizer");return}ReactDOM.createRoot(o).render(l.jsx(ProductCustomizer,{...i}))}});
