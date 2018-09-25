# Store 的实现

Store 的设计是为了抽取应用的共享状态，并且以约定的方式对外暴露 API 来读取或者存储状态，允许分割成不同的 **module**，state 秉承了 Vue 的响应式概念，如果不同视图依赖同一 state，能够高效地去驱动不同视图的改变。我们先从 `src/store.js` 入手。

```js
export class Store {
  constructor (options = {}) {
    // Auto install if it is not done yet and `window` has `Vue`.
    // To allow users to avoid auto-installation in some cases,
    // this code should be placed here. See #731
    if (!Vue && typeof window !== 'undefined' && window.Vue) {
      install(window.Vue)
    }

    if (process.env.NODE_ENV !== 'production') {
      assert(Vue, `must call Vue.use(Vuex) before creating a store instance.`)
      assert(typeof Promise !== 'undefined', `vuex requires a Promise polyfill in this browser.`)
      assert(this instanceof Store, `store must be called with the new operator.`)
    }

    const {
      plugins = [],
      strict = false
    } = options
    // 第一步
    // store internal state
    this._committing = false  // 只能显性 commit mutation 的标志位
    this._actions = Object.create(null) // 存储所有的 actions 信息
    this._actionSubscribers = [] // 存储所有订阅了 actions 变化的回调
    this._mutations = Object.create(null) // 存储所有的 mutations 信息
    this._wrappedGetters = Object.create(null) // 存储所有的 getters 信息
    this._modules = new ModuleCollection(options) // 模块收集的实例，拥有 key 名为'root'，value 是对应根 Module实例。 
    this._modulesNamespaceMap = Object.create(null) // 存储所有的 module 信息
    this._subscribers = [] // 存储所有订阅了 mutations 变化的回调
    this._watcherVM = new Vue() // store.watch 需要用这个 vm 实例来订阅 state 与 getters 的变化。

    // bind commit and dispatch to self
    const store = this
    const { dispatch, commit } = this
    // 将原型上的 dispatch 与 commit 方法代理到 Store 实例
    this.dispatch = function boundDispatch (type, payload) {
      return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit (type, payload, options) {
      return commit.call(store, type, payload, options)
    }

    // 第二步
    // strict mode
    this.strict = strict

    const state = this._modules.root.state

    // init root module.
    // this also recursively registers all sub-modules
    // and collects all module getters inside this._wrappedGetters
    installModule(this, state, [], this._modules.root)

    // 第三步
    // initialize the store vm, which is responsible for the reactivity
    // (also registers _wrappedGetters as computed properties)
    resetStoreVM(this, state)

    // 第四步
    // apply plugins
    plugins.forEach(plugin => plugin(this))

    if (Vue.config.devtools) {
      devtoolPlugin(this)
    }
  }
}
```

我将 Store 的构造函数分为四个步骤，我们一步步分析。

## 第一步
    
首先，定义了很多属性，注意到 `new ModuleCollection` 并且把 `options` 传入。由于 Store 是可以被分割成不同的 module。如下：

```js
const moduleA = {
  state: { count: 1 },
  mutations: { ... },
  actions: { ... },
  getters: { ... }
}

const moduleB = {
  state: { count: 2 },
  mutations: { ... },
  actions: { ... }
}

const store = new Vuex.Store({
  modules: {
    a: moduleA,
    b: moduleB
  },
  state: { count: 0 },
  mutations: { ... },
  actions: { ... },
  getters: { ... }
})

store.state.count // -> root module 的 count -> 0
store.state.a.count // -> moduleA 的 count -> 1
store.state.b.count // -> moduleB 的 count -> 2
```

从而得知 `moduleColletion` 的作用是通过使用调用方传入的 `options` 组建一定的数据结构，类的定义是位于 `src/module/module-collection.js`。

```js
export default class ModuleCollection {
  constructor (rawRootModule) {
    // register root module (Vuex.Store options)
    this.register([], rawRootModule, false)
  }

  get (path) {
    return path.reduce((module, key) => {
      return module.getChild(key)
    }, this.root)
  }

  getNamespace (path) {
    let module = this.root
    return path.reduce((namespace, key) => {
      module = module.getChild(key)
      return namespace + (module.namespaced ? key + '/' : '')
    }, '')
  }
}
```
    