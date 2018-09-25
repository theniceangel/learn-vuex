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

从而得知 `moduleColletion` 的作用是通过使用调用方传入的 `options` 构建**树状结构**，类的定义是位于 `src/module/module-collection.js`。

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

  register (path, rawModule, runtime = true) {
    if (process.env.NODE_ENV !== 'production') {
      assertRawModule(path, rawModule)
    }

    const newModule = new Module(rawModule, runtime)
    if (path.length === 0) {
      this.root = newModule
    } else {
      const parent = this.get(path.slice(0, -1))
      parent.addChild(path[path.length - 1], newModule)
    }

    // register nested modules
    if (rawModule.modules) {
      forEachValue(rawModule.modules, (rawChildModule, key) => {
        this.register(path.concat(key), rawChildModule, runtime)
      })
    }
  }
}
```

执行 `new moduleColletion`，构造函数内部执行  `register`，先看下 Module 类的定义。

```js
export default class Module {
  constructor (rawModule, runtime) {
    this.runtime = runtime
    // Store some children item
    this._children = Object.create(null)
    // Store the origin module object which passed by programmer
    this._rawModule = rawModule
    const rawState = rawModule.state

    // Store the origin module's state
    this.state = (typeof rawState === 'function' ? rawState() : rawState) || {}
  }
}
```

从上，我们可以看出 Module 这个类就是用来保存 实例化 Module 对象时传入的配置项以及 `state`，其中 `_children` 就是用来建立父子 Module 的联系，从而实例化的 `moduleColletion` 对象就是一个**树状结构**。

那么内部是怎么通过`_children`来绑定父子关系的呢？

我们再回到 `moduleColletion.register` 函数体当中。`path` 是用来维护父子 module 关系的路径数组。默认值是 `[]`，随着 Module 树的深度创建过程，`path` 会不断将子 Module 对应的属性名作为路径推入数组。如果 `path` 为空，就说明 `root` 属性是根 Module，否则根据 `path` 来获取父模块，并且将自己挂载到父模块的 `_children` 属性。并且递归 `modules` 属性，从而创建 Module 树结构。代码如下：

```js
if (path.length === 0) {
  this.root = newModule
} else {
  const parent = this.get(path.slice(0, -1))
  parent.addChild(path[path.length - 1], newModule)
}

// register nested modules
if (rawModule.modules) {
  forEachValue(rawModule.modules, (rawChildModule, key) => {
    this.register(path.concat(key), rawChildModule, runtime)
  })
}

// 通过以上步骤，我们可以得到类似下面的结构
const options = {
  modules: {
    a: {
      state: { test : 1}
    }
  }
}
const store = new Vuex.Store(options)
store._modules = {
  root: {
    state: {},
    runtime: false,
    _rawModule: '...',
    _children: {
      a: {
        state: { test : 1},
        runtime: false,
        _rawModule: '...'
        _children: Object.create(null)
      }
    }
  }
}
```

再来看这段代码，还有 Store 类的原型上的 `watch` 方法：

```js
this._watcherVM = new Vue()

watch (getter, cb, options) {
  if (process.env.NODE_ENV !== 'production') {
    assert(typeof getter === 'function', `store.watch only accepts a function.`)
  }
  return this._watcherVM.$watch(() => getter(this.state, this.getters), cb, options)
}
```

为了能让 Store 实例对外暴露一个可以监听 `state` 与 `getters` 变化的 API，`_watcherVM` 是一个 vm 实例，并且 `watch` 了 响应式数据 `store.state` 与 `store.getters` 的变化，进而执行调用方传入的 `getter` 回调。至于 `store.state` 与 `store.getters`是怎样做到响应式的，我们后面再讲。

### 第一步 总结

我们来对第一步做个总结吧。先在 Store 实例上声明了很多属性，再就是通过 `new ModuleCollection` 来解析调用方传入的 `options` 深度递归构建 Module 树。这些都是准备工作。我们接下来看第二步做了些什么？

## 第二步
    