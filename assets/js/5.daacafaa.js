(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{167:function(t,s,a){"use strict";a.r(s);var n=a(0),o=Object(n.a)({},function(){this.$createElement;this._self._c;return this._m(0)},[function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("div",{staticClass:"content"},[a("h1",{attrs:{id:"辅助函数-mapxxx"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#辅助函数-mapxxx","aria-hidden":"true"}},[t._v("#")]),t._v(" 辅助函数 mapXXX")]),t._v(" "),a("p",[t._v("辅助函数的定义都位于 "),a("code",[t._v("vuex/src/helpers.js")]),t._v("。分别导出了 "),a("code",[t._v("mapState")]),t._v("，"),a("code",[t._v("mapMutations")]),t._v("，"),a("code",[t._v("mapGetters")]),t._v("，"),a("code",[t._v("mapActions")]),t._v("，"),a("code",[t._v("createNamespacedHelpers")]),t._v("。前四个函数都是依赖 "),a("code",[t._v("normalizeNamespace")]),t._v(" 来处理 "),a("code",[t._v("namespace")]),t._v(" 的问题，我们先来看这个函数的定义。")]),t._v(" "),a("div",{staticClass:"language-js extra-class"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),a("span",{attrs:{class:"token function"}},[t._v("normalizeNamespace")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("fn"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),a("span",{attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("namespace"),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" map"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token keyword"}},[t._v("typeof")]),t._v(" namespace "),a("span",{attrs:{class:"token operator"}},[t._v("!==")]),t._v(" "),a("span",{attrs:{class:"token string"}},[t._v("'string'")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      map "),a("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" namespace\n      namespace "),a("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{attrs:{class:"token string"}},[t._v("''")]),t._v("\n    "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),a("span",{attrs:{class:"token keyword"}},[t._v("else")]),t._v(" "),a("span",{attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("namespace"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("charAt")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("namespace"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),t._v("length "),a("span",{attrs:{class:"token operator"}},[t._v("-")]),t._v(" "),a("span",{attrs:{class:"token number"}},[t._v("1")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token operator"}},[t._v("!==")]),t._v(" "),a("span",{attrs:{class:"token string"}},[t._v("'/'")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      namespace "),a("span",{attrs:{class:"token operator"}},[t._v("+=")]),t._v(" "),a("span",{attrs:{class:"token string"}},[t._v("'/'")]),t._v("\n    "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),a("span",{attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),a("span",{attrs:{class:"token function"}},[t._v("fn")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("namespace"),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" map"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n  "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),a("p",[a("code",[t._v("normalizeNamespace")]),t._v(" 接收一个 "),a("code",[t._v("fn")]),t._v(" 作为入参，返回一个新函数，接收 "),a("code",[t._v("namespace")]),t._v(" 与 "),a("code",[t._v("map")]),t._v(" 作为参数，调用 "),a("code",[t._v("fn")]),t._v("，将两个参数传入。新函数内部会自动帮你拼接 "),a("code",[t._v("/")]),t._v("，比如对于下面的例子")]),t._v(" "),a("div",{staticClass:"language-js extra-class"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{attrs:{class:"token keyword"}},[t._v("const")]),t._v(" options "),a("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  actions"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{attrs:{class:"token function"}},[t._v("count")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n  "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  modules"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    modulesA"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      namespaced"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{attrs:{class:"token boolean"}},[t._v("true")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n      actions"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),a("span",{attrs:{class:"token function"}},[t._v("childCount")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n      "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n  "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n如果想用调用 modulesA 的 childCount，我们一般可以这样调用：\n\nstore"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("dispatch")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token string"}},[t._v("'moudlesA'")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{attrs:{class:"token string"}},[t._v("'childCount'")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n或者\n\nstore"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("dispatch")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token string"}},[t._v("'moudlesA/'")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{attrs:{class:"token string"}},[t._v("'childCount'")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n")])])]),a("p",[t._v("分析完了 "),a("code",[t._v("normalizeNamespace")]),t._v(" 的作用，我们继续看下这几个 "),a("code",[t._v("mapXXX")]),t._v(" 辅助函数是做了些什么的吧。")]),t._v(" "),a("ol",[a("li",[a("strong",[t._v("mapState")])])]),t._v(" "),a("div",{staticClass:"language-js extra-class"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{attrs:{class:"token keyword"}},[t._v("export")]),t._v(" "),a("span",{attrs:{class:"token keyword"}},[t._v("const")]),t._v(" mapState "),a("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{attrs:{class:"token function"}},[t._v("normalizeNamespace")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("namespace"),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" states"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),a("span",{attrs:{class:"token keyword"}},[t._v("const")]),t._v(" res "),a("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n  "),a("span",{attrs:{class:"token function"}},[t._v("normalizeMap")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("states"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("forEach")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" key"),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" val "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    res"),a("span",{attrs:{class:"token punctuation"}},[t._v("[")]),t._v("key"),a("span",{attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" "),a("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),a("span",{attrs:{class:"token function"}},[t._v("mappedState")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      "),a("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" state "),a("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{attrs:{class:"token keyword"}},[t._v("this")]),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$store"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),t._v("state\n      "),a("span",{attrs:{class:"token keyword"}},[t._v("let")]),t._v(" getters "),a("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{attrs:{class:"token keyword"}},[t._v("this")]),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$store"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),t._v("getters\n      "),a("span",{attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("namespace"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),a("span",{attrs:{class:"token keyword"}},[t._v("const")]),t._v(" module "),a("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{attrs:{class:"token function"}},[t._v("getModuleByNamespace")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token keyword"}},[t._v("this")]),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),t._v("$store"),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{attrs:{class:"token string"}},[t._v("'mapState'")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" namespace"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n        "),a("span",{attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token operator"}},[t._v("!")]),t._v("module"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n          "),a("span",{attrs:{class:"token keyword"}},[t._v("return")]),t._v("\n        "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n        state "),a("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" module"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),t._v("context"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),t._v("state\n        getters "),a("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" module"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),t._v("context"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),t._v("getters\n      "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n      "),a("span",{attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),a("span",{attrs:{class:"token keyword"}},[t._v("typeof")]),t._v(" val "),a("span",{attrs:{class:"token operator"}},[t._v("===")]),t._v(" "),a("span",{attrs:{class:"token string"}},[t._v("'function'")]),t._v("\n        "),a("span",{attrs:{class:"token operator"}},[t._v("?")]),t._v(" val"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("call")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token keyword"}},[t._v("this")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" state"),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" getters"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n        "),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" state"),a("span",{attrs:{class:"token punctuation"}},[t._v("[")]),t._v("val"),a("span",{attrs:{class:"token punctuation"}},[t._v("]")]),t._v("\n    "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),a("span",{attrs:{class:"token comment"}},[t._v("// mark vuex getter for devtools")]),t._v("\n    res"),a("span",{attrs:{class:"token punctuation"}},[t._v("[")]),t._v("key"),a("span",{attrs:{class:"token punctuation"}},[t._v("]")]),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),t._v("vuex "),a("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{attrs:{class:"token boolean"}},[t._v("true")]),t._v("\n  "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n  "),a("span",{attrs:{class:"token keyword"}},[t._v("return")]),t._v(" res\n"),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n")])])]),a("p",[t._v("首先，"),a("code",[t._v("mapState")]),t._v(" 函数是接收 "),a("code",[t._v("namespace")]),t._v(" 与 "),a("code",[t._v("states")]),t._v("，"),a("code",[t._v("states")]),t._v(" 可以是一个对象也可以是一个数组。函数内部先通过 "),a("code",[t._v("normalizeMap")]),t._v(" 将我们传入的 "),a("code",[t._v("states")]),t._v(" 处理成预期的格式。先看下 "),a("code",[t._v("normalizeMap")]),t._v(" 的实现")]),t._v(" "),a("div",{staticClass:"language-js extra-class"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),a("span",{attrs:{class:"token function"}},[t._v("normalizeMap")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("map"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),a("span",{attrs:{class:"token keyword"}},[t._v("return")]),t._v(" Array"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("isArray")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("map"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    "),a("span",{attrs:{class:"token operator"}},[t._v("?")]),t._v(" map"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("map")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("key "),a("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" key"),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" val"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" key "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    "),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" Object"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("keys")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("map"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("map")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("key "),a("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" key"),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" val"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" map"),a("span",{attrs:{class:"token punctuation"}},[t._v("[")]),t._v("key"),a("span",{attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n"),a("span",{attrs:{class:"token function"}},[t._v("normalizeMap")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v("[")]),a("span",{attrs:{class:"token number"}},[t._v("1")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{attrs:{class:"token number"}},[t._v("2")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{attrs:{class:"token number"}},[t._v("3")]),a("span",{attrs:{class:"token punctuation"}},[t._v("]")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("[")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" key"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{attrs:{class:"token number"}},[t._v("1")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" val"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{attrs:{class:"token number"}},[t._v("1")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" key"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{attrs:{class:"token number"}},[t._v("2")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" val"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{attrs:{class:"token number"}},[t._v("2")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" key"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{attrs:{class:"token number"}},[t._v("3")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" val"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{attrs:{class:"token number"}},[t._v("3")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("]")]),t._v("\n"),a("span",{attrs:{class:"token function"}},[t._v("normalizeMap")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("a"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{attrs:{class:"token number"}},[t._v("1")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" b"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{attrs:{class:"token number"}},[t._v("2")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" c"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{attrs:{class:"token number"}},[t._v("3")]),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("[")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" key"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{attrs:{class:"token string"}},[t._v("'a'")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" val"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{attrs:{class:"token number"}},[t._v("1")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" key"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{attrs:{class:"token string"}},[t._v("'b'")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" val"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{attrs:{class:"token number"}},[t._v("2")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" key"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{attrs:{class:"token string"}},[t._v("'c'")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" val"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{attrs:{class:"token number"}},[t._v("3")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("]")]),t._v("\n")])])]),a("p",[t._v("如果是数组，变成了 "),a("code",[t._v("{ key, val: key }")]),t._v("；如果是对象，变成了 "),a("code",[t._v("{ key, val: map[key] }")]),t._v("。")]),t._v(" "),a("p",[t._v("最后将 "),a("code",[t._v("key")]),t._v(" 挂载在 "),a("code",[t._v("res")]),t._v(" 对象上，这个对象最终会被返回，这样我们通过 "),a("code",[t._v("...mapState({})")]),t._v(" 对象扩展符，就能定义到组件的 "),a("code",[t._v("computed")]),t._v(" 上面了。内部的逻辑很简单，先拿到 "),a("code",[t._v("store")]),t._v(" 实例上的 "),a("code",[t._v("state")]),t._v(" 与 "),a("code",[t._v("getter")]),t._v("。如果传入了 "),a("code",[t._v("namespace")]),t._v("，就通过 "),a("code",[t._v("store._modulesNamespaceMap")]),t._v(" 上去拿之前注册的模块。这个时候获取到的 "),a("code",[t._v("state")]),t._v(" 就是局部模块的 "),a("code",[t._v("state")]),t._v("了。")]),t._v(" "),a("ol",{attrs:{start:"2"}},[a("li",[a("strong",[t._v("mapMutations、 mapGetters、 mapActions")])])]),t._v(" "),a("p",[t._v("过程与 "),a("code",[t._v("mapState")]),t._v(" 类似。")]),t._v(" "),a("ol",{attrs:{start:"3"}},[a("li",[a("strong",[t._v("createNamespacedHelpers")])])]),t._v(" "),a("div",{staticClass:"language-js extra-class"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{attrs:{class:"token keyword"}},[t._v("export")]),t._v(" "),a("span",{attrs:{class:"token keyword"}},[t._v("const")]),t._v(" "),a("span",{attrs:{class:"token function-variable function"}},[t._v("createNamespacedHelpers")]),t._v(" "),a("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),t._v("namespace"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  mapState"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" mapState"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("bind")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token keyword"}},[t._v("null")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" namespace"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  mapGetters"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" mapGetters"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("bind")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token keyword"}},[t._v("null")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" namespace"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  mapMutations"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" mapMutations"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("bind")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token keyword"}},[t._v("null")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" namespace"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  mapActions"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" mapActions"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{attrs:{class:"token function"}},[t._v("bind")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token keyword"}},[t._v("null")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" namespace"),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n")])])]),a("p",[t._v("接收 "),a("code",[t._v("namespace")]),t._v("，利用 "),a("code",[t._v("bind")]),t._v(" 方法，对 "),a("code",[t._v("mapState")]),t._v("、"),a("code",[t._v("mapGetters")]),t._v("、"),a("code",[t._v("mapMutations")]),t._v("、"),a("code",[t._v("mapActions")]),t._v(" 做了一层包装。所以我们可以这样调用")]),t._v(" "),a("div",{staticClass:"language-js extra-class"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{attrs:{class:"token keyword"}},[t._v("import")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" createNamespacedHelpers "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),a("span",{attrs:{class:"token keyword"}},[t._v("from")]),t._v(" "),a("span",{attrs:{class:"token string"}},[t._v("'vuex'")]),t._v("\n\n"),a("span",{attrs:{class:"token keyword"}},[t._v("const")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" mapState"),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" mapActions "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),a("span",{attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{attrs:{class:"token function"}},[t._v("createNamespacedHelpers")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token string"}},[t._v("'some/nested/module'")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n"),a("span",{attrs:{class:"token keyword"}},[t._v("export")]),t._v(" "),a("span",{attrs:{class:"token keyword"}},[t._v("default")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  computed"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{attrs:{class:"token comment"}},[t._v("// 在 `some/nested/module` 中查找")]),t._v("\n    "),a("span",{attrs:{class:"token operator"}},[t._v("...")]),a("span",{attrs:{class:"token function"}},[t._v("mapState")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      a"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" state "),a("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" state"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),t._v("a"),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n      b"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" state "),a("span",{attrs:{class:"token operator"}},[t._v("=>")]),t._v(" state"),a("span",{attrs:{class:"token punctuation"}},[t._v(".")]),t._v("b\n    "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n  "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  methods"),a("span",{attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{attrs:{class:"token comment"}},[t._v("// 在 `some/nested/module` 中查找")]),t._v("\n    "),a("span",{attrs:{class:"token operator"}},[t._v("...")]),a("span",{attrs:{class:"token function"}},[t._v("mapActions")]),a("span",{attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{attrs:{class:"token punctuation"}},[t._v("[")]),t._v("\n      "),a("span",{attrs:{class:"token string"}},[t._v("'foo'")]),a("span",{attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n      "),a("span",{attrs:{class:"token string"}},[t._v("'bar'")]),t._v("\n    "),a("span",{attrs:{class:"token punctuation"}},[t._v("]")]),a("span",{attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n  "),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),a("span",{attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])])}],!1,null,null,null);o.options.__file="vuex-helper.md";s.default=o.exports}}]);