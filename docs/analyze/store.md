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
    this._watcherVM = new Vue() // store.watch这个 API 需要用这个 vm 实例来订阅 state 与 getters 的变化。

    // 第二步
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

// 通过以上步骤，我们可以得到类似下面的树状结构，保存在_modules属性上
const options = {
  modules: {
    a: {
      state: { test : 1 }
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
        _rawModule: '...',
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

我们来对第一步做个总结吧。先在 Store 实例上声明了很多属性，再就是通过 `new ModuleCollection` 来解析调用方传入的 `options` 深度递归构建 Module 树，保存在 `store` 实例的 `_modules` 属性上。当然这很多只是准备工作。我们接下来看第二步做了些什么？

## 第二步

先将原型上的 `dispatch` 与 `commit` 方法代理到实例的 `dispatch` 与 `commit` 上。`dispatch` 与 `commit` 方法分别是用来调用 `action` 和 `mutation`。那么问题就来了，为什么要把 `dispatch` 与 `commit` 都单独在 Store 实例上去实现呢，如果调用方直接通过 `store.dispatch` 也可以拿到原型上的 `dispatch`方法来派发 `action`的呀？这里我们先留着这个疑问，等到 `makeLocalContext` 来探讨。

我们通过`new ModuleCollection` 构建了 module 树状结构，并且赋值给了 `this._modules`。所以接下来就是安装每个 module。

```js
  // strict mode
  this.strict = strict

  const state = this._modules.root.state

  // init root module.
  // this also recursively registers all sub-modules
  // and collects all module getters inside this._wrappedGetters
  installModule(this, state, [], this._modules.root)
```

`strict` 是用来控制是否深度侦听 `store.state` 的变化。因为如果你不是通过 `mutation` 来改变 `state`，`vuex` 会在控制台抛出一个 Error。`this._modules.root.state` 是根 module 的 `state`。接下来就是把 `Store` 实例、`state`、父子 module 的关系路径、module 传进 `installModule`。我们先来分析这个函数的内部。

```js
function installModule (store, rootState, path, module, hot) {
  const isRoot = !path.length
  const namespace = store._modules.getNamespace(path)

  // register in namespace map
  if (module.namespaced) {
    store._modulesNamespaceMap[namespace] = module
  }

  // set state
  if (!isRoot && !hot) {
    const parentState = getNestedState(rootState, path.slice(0, -1))
    const moduleName = path[path.length - 1]
    store._withCommit(() => {
      Vue.set(parentState, moduleName, module.state)
    })
  }

  const local = module.context = makeLocalContext(store, namespace, path)

  module.forEachMutation((mutation, key) => {
    const namespacedType = namespace + key
    registerMutation(store, namespacedType, mutation, local)
  })

  module.forEachAction((action, key) => {
    const type = action.root ? key : namespace + key
    const handler = action.handler || action
    registerAction(store, type, handler, local)
  })

  module.forEachGetter((getter, key) => {
    const namespacedType = namespace + key
    registerGetter(store, namespacedType, getter, local)
  })

  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child, hot)
  })
}
```

我们先看这行代码，以及 `src/module/module-collection.js` 里的 ModuleCollection 类的 `getNamespace` 方法。

```js
const namespace = store._modules.getNamespace(path)

// src/module/module-collection.js
getNamespace (path) {
  let module = this.root
  return path.reduce((namespace, key) => {
    module = module.getChild(key)
    return namespace + (module.namespaced ? key + '/' : '')
  }, '')
}
```

通过 `path.reduce` 去循环 module 树来获取 `namespace`。那么什么是 `namespace` 呢。我们通过下面一个例子来说明下。

```js
const moduleA = {
  namespaced: true,
  state: '...'
  modules: {
    moduleC
  }
}

const moduleC = {
  state: '...'
}

const moduleB = {
  namespaced: true,
  state: '...',
  modules: {
    moduleD
  }
}

const moduleD = {
  namespaced: true,
  state: '...'
}

const store = new Vuex.Store({
  modules: {
    moduleA,
    moduleB
  }
})

我们分析下如上的 store 的结构
我们根 module 下面嵌套了两个 namespaced 为 true 的 moduleA 与 moduleB
moduleA 下面嵌套了无 namespaced 的moduleC，moduleB 嵌套了有 namespaced 的moduleC
那么我们根据 getNamespace 可以分析出他们四个模块的 namespace
moduleA -> 'moduleA/' 
moduleC -> 'moduleA/'
moduleB -> 'moduleB/'
moduleD -> 'moduleB/moduleD/'

因为我们可以看出：如果当前 module 是没有配置 namespaced，
他的 namespace 就是与父 module 的 namespace 相同。
namespace 是用于构建每个 module 的 actions，getters，mutations 映射表。
如果两个模块的 namespace 相同，
他们的 actions，getters，mutations 的属性对应的回调函数都注册在同一个 key 名之下。
你在 moduleC 触发一个 action，moduleA 下面的同名 action 也会被触发
```

我们知道 `namespace` 的作用之后，继续看接下来的代码

```js
// register in namespace map
  if (module.namespaced) {
    store._modulesNamespaceMap[namespace] = module
  }

  // set state
  if (!isRoot && !hot) {
    const parentState = getNestedState(rootState, path.slice(0, -1))
    const moduleName = path[path.length - 1]
    store._withCommit(() => {
      Vue.set(parentState, moduleName, module.state)
    })
  }
```

如果 module 配置项 `namepsaced` 设置为 true，我们就将其存在实例的 `_modulesNamespaceMap` 属性上，key 名就是模块的 `namespace`。接下来就是获取到父模块的 `state` 将子模块的 `state` 挂载在其之下。我们来看下 `getNestedState` 方法。

```js
function getNestedState (state, path) {
  return path.length
    ? path.reduce((state, key) => state[key], state)
    : state
}
```

其实就是根据 `path` 路径来推断它的父模块的 `state`。因为 `path` 存放了整个模块树的**深度递归**创建模块的全路径。

再看 `store._withCommit` 方法，定义如下：

```js
_withCommit (fn) {
  const committing = this._committing
  this._committing = true
  fn()
  this._committing = committing
}
```

其实就是在 `fn` 执行之前，强制将 `this._committing` 设置为 true，去绕过 Vuex 不能直接修改 `state` 的规则，而 Vuex 就是通过 `_committing` 属性来判断使用方是否通过 `mutation` 修改的 `state`。这个是如何做到的，我稍后会在 `resetStoreVM` 讲到。而 `_withCommit` 回调函数的 `Vue.set(parentState, moduleName, module.state)` 是什么呢？我们先把目光切换到 Vue 的源码，定义是位于 `vue/src/core/observer/index.js`。

```js
export function set (target: Array<any> | Object, key: any, val: any): any {
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot set reactive property on undefined, null, or primitive value: ${(target: any)}`)
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  const ob = (target: any).__ob__
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    )
    return val
  }
  if (!ob) {
    target[key] = val
    return val
  }
  defineReactive(ob.value, key, val)
  ob.dep.notify()
  return val
}
```

从这个接口的实现来看，只有第一参数 `target` 是一个响应式的 `Array` 或者 `Object` 类型的对象时候，给它动态添加属性，才会去通知依赖这个响应式数据的 watcher 去更新。乍一看，我们实例化 `store` 的时候，因为 `parentState` 不是一个响应式的对象，直接进到 `if (!ob)` 逻辑，然后退出函数了，其实就是在父模块的 `state` 上挂载子模块的 `state`。那为什么不直接通过 `parentState[moduleName] = module.state` 这样的方式，这样反而更简洁点呢。我们细心地发现 `Store` 还有两个 `registerModule` 与 `unregisterModule` 方法是可以动态注册或者注销模块的，函数内部都会去执行 `installModule`，而这个时候 `state` 已经是一个响应式数据了，为了侦听 `state` 的变化，必须通过 `Vue.set`去挂载子模块的 `state`，进而触发视图的更新。



    