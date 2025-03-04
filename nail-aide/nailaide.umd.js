const { Children } = require("react");

(function(p,o){typeof exports=="object"&&typeof module!="undefined"?o(exports,require("react"),require("react-dom")):typeof define=="function"&&define.amd?define(["exports","react","react-dom"],o):(p=typeof globalThis!="undefined"?globalThis:p||self,o(p.NailAide={},p.React,p.ReactDOM))})(this,function(p,o,v){"use strict";var Yr=Object.defineProperty,zr=Object.defineProperties;var Br=Object.getOwnPropertyDescriptors;var ue=Object.getOwnPropertySymbols;var er=Object.prototype.hasOwnProperty,rr=Object.prototype.propertyIsEnumerable;var $e=(p,o,v)=>o in p?Yr(p,o,{enumerable:!0,configurable:!0,writable:!0,value:v}):p[o]=v,J=(p,o)=>{for(var v in o||(o={}))er.call(o,v)&&$e(p,v,o[v]);if(ue)for(var v of ue(o))rr.call(o,v)&&$e(p,v,o[v]);return p},fe=(p,o)=>zr(p,Br(o));var tr=(p,o)=>{var v={};for(var E in p)er.call(p,E)&&o.indexOf(E)<0&&(v[E]=p[E]);if(p!=null&&ue)for(var E of ue(p))o.indexOf(E)<0&&rr.call(p,E)&&(v[E]=p[E]);return v};var H=(p,o,v)=>new Promise((E,F)=>{var re=D=>{try{W(v.next(D))}catch(G){F(G)}},X=D=>{try{W(v.throw(D))}catch(G){F(G)}},W=D=>D.done?E(D.value):Promise.resolve(D.value).then(re,X);W((v=v.apply(p,o)).next())});

// Fix 1: Properly handle ReactDOM's createRoot
var E;
var F = v;

// Fix 2: Replace process.env check with a safer environment detection
var isDevelopment = typeof window !== 'undefined' && 
                   window.process && 
                   window.process.env && 
                   window.process.env.NODE_ENV !== 'production';

if (!isDevelopment) {
  E = F.createRoot || function(root, options) {
    return {
      render: function(element) {
        F.render(element, root, options);
      },
      unmount: function() {
        F.unmountComponentAtNode(root);
      }
    };
  };
} else {
  var re = F.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  E = function(a, n) {
    if (re && re.usingClientEntryPoint !== undefined) {
      re.usingClientEntryPoint = true;
      try {
        return F.createRoot(a, n);
      } finally {
        re.usingClientEntryPoint = false;
      }
    } else {
      // Fallback if internal API is not available
      return F.createRoot ? F.createRoot(a, n) : {
        render: function(element) {
          F.render(element, a, n);
        },
        unmount: function() {
          F.unmountComponentAtNode(a);
        }
      };
    }
  };
}

var X={exports:{}},W={};/**
 * @license React
 * react-jsx-dev-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var D;function G(){if(D)return W;D=1;var a=Symbol.for("react.fragment");return W.Fragment=a,W.jsxDEV=void 0,W}var te={};/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Se;function nr(){return Se||(Se=1,process.env.NODE_ENV!=="production"&&function(){var a=o,n=Symbol.for("react.element"),R=Symbol.for("react.portal"),l=Symbol.for("react.fragment"),N=Symbol.for("react.strict_mode"),I=Symbol.for("react.profiler"),j=Symbol.for("react.provider"),C=Symbol.for("react.context"),T=Symbol.for("react.forward_ref"),U=Symbol.for("react.suspense"),M=Symbol.for("react.suspense_list"),P=Symbol.for("react.memo"),_=Symbol.for("react.lazy"),z=Symbol.for("react.offscreen"),O=Symbol.iterator,pe="@@iterator";function me(e){if(e===null||typeof e!="object")return null;var r=O&&e[O]||e[pe];return typeof r=="function"?r:null}var V=a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;function y(e){{for(var r=arguments.length,t=new Array(r>1?r-1:0),i=1;i<r;i++)t[i-1]=arguments[i];Z("error",e,t)}}function Z(e,r,t){{var i=V.ReactDebugCurrentFrame,f=i.getStackAddendum();f!==""&&(r+="%s",t=t.concat([f]));var m=t.map(function(c){return String(c)});m.unshift("Warning: "+r),Function.prototype.apply.call(console[e],console,m)}}var be=!1,ve=!1,he=!1,ie=!1,ae=!1,oe;oe=Symbol.for("react.module.reference");function ge(e){return!!(typeof e=="string"||typeof e=="function"||e===l||e===I||ae||e===N||e===U||e===M||ie||e===z||be||ve||he||typeof e=="object"&&e!==null&&(e.$$typeof===_||e.$$typeof===P||e.$$typeof===j||e.$$typeof===C||e.$$typeof===T||e.$$typeof===oe||e.getModuleId!==void 0))}function ye(e,r,t){var i=e.displayName;if(i)return i;var f=r.displayName||r.name||"";return f!==""?t+"("+f+")":t}function u(e){return e.displayName||"Context"}function b(e){if(e==null)return null;if(typeof e.tag=="number"&&y("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."),typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case l:return"Fragment";case R:return"Portal";case I:return"Profiler";case N:return"StrictMode";case U:return"Suspense";case M:return"SuspenseList"}if(typeof e=="object")switch(e.$$typeof){case C:var r=e;return u(r)+".Consumer";case j:var t=e;return u(t._context)+".Provider";case T:return ye(e,e.render,"ForwardRef");case P:var i=e.displayName||null;return i!==null?i:b(e.type)||"Memo";case _:{var f=e,m=f._payload,c=f._init;try{return b(c(m))}catch(s){return null}}}return null}var A=Object.assign,Q=0,Ce,Pe,Oe,Ie,Ve,We,Me;function Fe(){}Fe.__reactDisabledLog=!0;function hr(){{if(Q===0){Ce=console.log,Pe=console.info,Oe=console.warn,Ie=console.error,Ve=console.group,We=console.groupCollapsed,Me=console.groupEnd;var e={configurable:!0,enumerable:!0,value:Fe,writable:!0};Object.defineProperties(console,{info:e,log:e,warn:e,error:e,group:e,groupCollapsed:e,groupEnd:e})}Q++}}function gr(){{if(Q--,Q===0){var e={configurable:!0,enumerable:!0,writable:!0};Object.defineProperties(console,{log:A({},e,{value:Ce}),info:A({},e,{value:Pe}),warn:A({},e,{value:Oe}),error:A({},e,{value:Ie}),group:A({},e,{value:Ve}),groupCollapsed:A({},e,{value:We}),groupEnd:A({},e,{value:Me})})}Q<0&&y("disabledDepth fell below zero. This is a bug in React. Please file an issue.")}}var xe=V.ReactCurrentDispatcher,Ne;function se(e,r,t){{if(Ne===void 0)try{throw Error()}catch(f){var i=f.stack.trim().match(/\n( *(at )?)/);Ne=i&&i[1]||""}return`
`+Ne+e}}var Ee=!1,le;{var yr=typeof WeakMap=="function"?WeakMap:Map;le=new yr}function Ue(e,r){if(!e||Ee)return"";{var t=le.get(e);if(t!==void 0)return t}var i;Ee=!0;var f=Error.prepareStackTrace;Error.prepareStackTrace=void 0;var m;m=xe.current,xe.current=null,hr();try{if(r){var c=function(){throw Error()};if(Object.defineProperty(c.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(c,[])}catch(k){i=k}Reflect.construct(e,[],c)}else{try{c.call()}catch(k){i=k}e.call(c.prototype)}}else{try{throw Error()}catch(k){i=k}e()}}catch(k){if(k&&i&&typeof k.stack=="string"){for(var s=k.stack.split(`
`),w=i.stack.split(`
`),h=s.length-1,g=w.length-1;h>=1&&g>=0&&s[h]!==w[g];)g--;for(;h>=1&&g>=0;h--,g--)if(s[h]!==w[g]){if(h!==1||g!==1)do if(h--,g--,g<0||s[h]!==w[g]){var S=`
`+s[h].replace(" at new "," at ");return e.displayName&&S.includes("<anonymous>")&&(S=S.replace("<anonymous>",e.displayName)),typeof e=="function"&&le.set(e,S),S}while(h>=1&&g>=0);break}}}finally{Ee=!1,xe.current=m,gr(),Error.prepareStackTrace=f}var K=e?e.displayName||e.name:"",L=K?se(K):"";return typeof e=="function"&&le.set(e,L),L}function xr(e,r,t){return Ue(e,!1)}function Nr(e){var r=e.prototype;return!!(r&&r.isReactComponent)}function ce(e,r,t){if(e==null)return"";if(typeof e=="function")return Ue(e,Nr(e));if(typeof e=="string")return se(e);switch(e){case U:return se("Suspense");case M:return se("SuspenseList")}if(typeof e=="object")switch(e.$$typeof){case T:return xr(e.render);case P:return ce(e.type,r,t);case _:{var i=e,f=i._payload,m=i._init;try{return ce(m(f),r,t)}catch(c){}}}return""}var $=Object.prototype.hasOwnProperty,Le={},Ye=V.ReactDebugCurrentFrame;function de(e){if(e){var r=e._owner,t=ce(e.type,e._source,r?r.type:null);Ye.setExtraStackFrame(t)}else Ye.setExtraStackFrame(null)}function Er(e,r,t,i,f){{var m=Function.call.bind($);for(var c in e)if(m(e,c)){var s=void 0;try{if(typeof e[c]!="function"){var w=Error((i||"React class")+": "+t+" type `"+c+"` is invalid; it must be a function, usually from the `prop-types` package, but received `"+typeof e[c]+"`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");throw w.name="Invariant Violation",w}s=e[c](r,c,i,t,null,"SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED")}catch(h){s=h}s&&!(s instanceof Error)&&(de(f),y("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).",i||"React class",t,c,typeof s),de(null)),s instanceof Error&&!(s.message in Le)&&(Le[s.message]=!0,de(f),y("Failed %s type: %s",t,s.message),de(null))}}}var Rr=Array.isArray;function Re(e){return Rr(e)}function jr(e){{var r=typeof Symbol=="function"&&Symbol.toStringTag,t=r&&e[Symbol.toStringTag]||e.constructor.name||"Object";return t}}function wr(e){try{return ze(e),!1}catch(r){return!0}}function ze(e){return""+e}function Be(e){if(wr(e))return y("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.",jr(e)),ze(e)}var ee=V.ReactCurrentOwner,kr={key:!0,ref:!0,__self:!0,__source:!0},Ke,Je,je;je={};function Ar(e){if($.call(e,"ref")){var r=Object.getOwnPropertyDescriptor(e,"ref").get;if(r&&r.isReactWarning)return!1}return e.ref!==void 0}function _r(e){if($.call(e,"key")){var r=Object.getOwnPropertyDescriptor(e,"key").get;if(r&&r.isReactWarning)return!1}return e.key!==void 0}function Sr(e,r){if(typeof e.ref=="string"&&ee.current&&r&&ee.current.stateNode!==r){var t=b(ee.current.type);je[t]||(y('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref',b(ee.current.type),e.ref),je[t]=!0)}}function Tr(e,r){{var t=function(){Ke||(Ke=!0,y("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)",r))};t.isReactWarning=!0,Object.defineProperty(e,"key",{get:t,configurable:!0})}}function Dr(e,r){{var t=function(){Je||(Je=!0,y("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)",r))};t.isReactWarning=!0,Object.defineProperty(e,"ref",{get:t,configurable:!0})}}var Cr=function(e,r,t,i,f,m,c){var s={$$typeof:n,type:e,key:r,ref:t,props:c,_owner:m};return s._store={},Object.defineProperty(s._store,"validated",{configurable:!1,enumerable:!1,writable:!0,value:!1}),Object.defineProperty(s,"_self",{configurable:!1,enumerable:!1,writable:!1,value:i}),Object.defineProperty(s,"_source",{configurable:!1,enumerable:!1,writable:!1,value:f}),Object.freeze&&(Object.freeze(s.props),Object.freeze(s)),s};function Pr(e,r,t,i,f){{var m,c={},s=null,w=null;t!==void 0&&(Be(t),s=""+t),_r(r)&&(Be(r.key),s=""+r.key),Ar(r)&&(w=r.ref,Sr(r,f));for(m in r)$.call(r,m)&&!kr.hasOwnProperty(m)&&(c[m]=r[m]);if(e&&e.defaultProps){var h=e.defaultProps;for(m in h)c[m]===void 0&&(c[m]=h[m])}if(s||w){var g=typeof e=="function"?e.displayName||e.name||"Unknown":e;s&&Tr(c,g),w&&Dr(c,g)}return Cr(e,s,w,f,i,ee.current,c)}}var we=V.ReactCurrentOwner,He=V.ReactDebugCurrentFrame;function B(e){if(e){var r=e._owner,t=ce(e.type,e._source,r?r.type:null);He.setExtraStackFrame(t)}else He.setExtraStackFrame(null)}var ke;ke=!1;function Ae(e){return typeof e=="object"&&e!==null&&e.$$typeof===n}function Xe(){{if(we.current){var e=b(we.current.type);if(e)return`

Check the render method of \``+e+"`."}return""}}function Or(e){{if(e!==void 0){var r=e.fileName.replace(/^.*[\\\/]/,""),t=e.lineNumber;return`

Check your code at `+r+":"+t+"."}return""}}var Ge={};function Ir(e){{var r=Xe();if(!r){var t=typeof e=="string"?e:e.displayName||e.name;t&&(r=`

Check the top-level render call using <`+t+">.")}return r}}function qe(e,r){{if(!e._store||e._store.validated||e.key!=null)return;e._store.validated=!0;var t=Ir(r);if(Ge[t])return;Ge[t]=!0;var i="";e&&e._owner&&e._owner!==we.current&&(i=" It was passed a child from "+b(e._owner.type)+"."),B(e),y('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.',t,i),B(null)}}function Ze(e,r){{if(typeof e!="object")return;if(Re(e))for(var t=0;t<e.length;t++){var i=e[t];Ae(i)&&qe(i,r)}else if(Ae(e))e._store&&(e._store.validated=!0);else if(e){var f=me(e);if(typeof f=="function"&&f!==e.entries)for(var m=f.call(e),c;!(c=m.next()).done;)Ae(c.value)&&qe(c.value,r)}}}function Vr(e){{var r=e.type;if(r==null||typeof r=="string")return;var t;if(typeof r=="function")t=r.propTypes;else if(typeof r=="object"&&(r.$$typeof===T||r.$$typeof===P))t=r.propTypes;else return;if(t){var i=b(r);Er(t,e.props,"prop",i,e)}else if(r.PropTypes!==void 0&&!ke){ke=!0;var f=b(r);y("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?",f||"Unknown")}typeof r.getDefaultProps=="function"&&!r.getDefaultProps.isReactClassApproved&&y("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.")}}function Wr(e){{for(var r=Object.keys(e.props),t=0;t<r.length;t++){var i=r[t];if(i!=="children"&&i!=="key"){B(e),y("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.",i),B(null);break}}e.ref!==null&&(B(e),y("Invalid attribute `ref` supplied to `React.Fragment`."),B(null))}}var Qe={};function Mr(e,r,t,i,f,m){{var c=ge(e);if(!c){var s="";(e===void 0||typeof e=="object"&&e!==null&&Object.keys(e).length===0)&&(s+=" You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");var w=Or(f);w?s+=w:s+=Xe();var h;e===null?h="null":Re(e)?h="array":e!==void 0&&e.$$typeof===n?(h="<"+(b(e.type)||"Unknown")+" />",s=" Did you accidentally export a JSX literal instead of a component?"):h=typeof e,y("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s",h,s)}var g=Pr(e,r,t,f,m);if(g==null)return g;if(c){var S=r.children;if(S!==void 0)if(i)if(Re(S)){for(var K=0;K<S.length;K++)Ze(S[K],e);Object.freeze&&Object.freeze(S)}else y("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");else Ze(S,e)}if($.call(r,"key")){var L=b(e),k=Object.keys(r).filter(function(Lr){return Lr!=="key"}),_e=k.length>0?"{key: someKey, "+k.join(": ..., ")+": ...}":"{key: someKey}";if(!Qe[L+_e]){var Ur=k.length>0?"{"+k.join(": ..., ")+": ...}":"{}";y(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,_e,L,Ur,L),Qe[L+_e]=!0}}return e===l?Wr(g):Vr(g),g}}var Fr=Mr;te.Fragment=l,te.jsxDEV=Fr}()),te}process.env.NODE_ENV==="production"?X.exports=G():X.exports=nr();var d=X.exports;/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var ir={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ar=a=>a.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase().trim(),q=(a,n)=>{const R=o.forwardRef((P,M)=>{var _=P,{color:l="currentColor",size:N=24,strokeWidth:I=2,absoluteStrokeWidth:j,className:C="",children:T}=_,U=tr(_,["color","size","strokeWidth","absoluteStrokeWidth","className","children"]);return o.createElement("svg",J(fe(J({ref:M},ir),{width:N,height:N,stroke:l,strokeWidth:j?Number(I)*24/Number(N):I,className:["lucide",`lucide-${ar(a)}`,C].join(" ")}),U),[...n.map(([z,O])=>o.createElement(z,O)),...Array.isArray(T)?T:[T]])});return R.displayName=`${a}`,R};/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const or=q("MessageSquare",[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const sr=q("MicOff",[["line",{x1:"2",x2:"22",y1:"2",y2:"22",key:"a6p6uj"}],["path",{d:"M18.89 13.23A7.12 7.12 0 0 0 19 12v-2",key:"80xlxr"}],["path",{d:"M5 10v2a7 7 0 0 0 12 5",key:"p2k8kg"}],["path",{d:"M15 9.34V5a3 3 0 0 0-5.68-1.33",key:"1gzdoj"}],["path",{d:"M9 9v3a3 3 0 0 0 5.12 2.12",key:"r2i35w"}],["line",{x1:"12",x2:"12",y1:"19",y2:"22",key:"x3vr5v"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const lr=q("Mic",[["path",{d:"M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z",key:"131961"}],["path",{d:"M19 10v2a7 7 0 0 1-14 0v-2",key:"1vc78b"}],["line",{x1:"12",x2:"12",y1:"19",y2:"22",key:"x3vr5v"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const cr=q("Send",[["path",{d:"m22 2-7 20-4-9-9-4Z",key:"1q3vgg"}],["path",{d:"M22 2 11 13",key:"nzbqef"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const dr=q("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);let ne;const ur=new Uint8Array(16);function fr(){if(!ne&&(ne=typeof crypto!="undefined"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!ne))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return ne(ur)}const x=[];for(let a=0;a<256;++a)x.push((a+256).toString(16).slice(1));function pr(a,n=0){return x[a[n+0]]+x[a[n+1]]+x[a[n+2]]+x[a[n+3]]+"-"+x[a[n+4]]+x[a[n+5]]+"-"+x[a[n+6]]+x[a[n+7]]+"-"+x[a[n+8]]+x[a[n+9]]+"-"+x[a[n+10]]+x[a[n+11]]+x[a[n+12]]+x[a[n+13]]+x[a[n+14]]+x[a[n+15]]}const Te={randomUUID:typeof crypto!="undefined"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto)};

// Fix 3: Properly export NailAide
if (typeof exports === 'object' && typeof module !== 'undefined') {
  module.exports = p;
} else if (typeof define === 'function' && define.amd) {
  define([], function() {
    return p;
  });
} else {
  this.NailAide = p;
}
// Closing the function and IIFE
});
