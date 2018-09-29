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

先将原型上的 `dispatch` 与 `commit` 方法代理到实例的 `dispatch` 与 `commit` 上，并且原型上的方法是绑定了当前 store 实例为上下文的。`dispatch` 与 `commit` 方法分别是用来调用 `action` 和 `mutation`。就个人感觉而言，其实不是一定要绑定了当前 store 实例为上下文的。因为只要保证调用 `dispatch` 方法的时候是 Store 实例作为上下文就可以。

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

从这个接口的实现来看，只有第一参数 `target` 是一个响应式的 `Array` 或者 `Object` 类型的对象时候，给它动态添加属性，才会去通知依赖这个响应式数据的 watcher 去更新。乍一看，我们实例化 `store` 的时候，因为 `parentState` 不是一个响应式的对象，直接进到 `if (!ob)` 逻辑，然后退出函数了，其实就是在父模块的 `state` 上挂载子模块的 `state`。那为什么不直接通过 `parentState[moduleName] = module.state` 这样的方式，这样反而更简洁点呢。我们细心地发现 `Store` 还有两个 `registerModule` 与 `unregisterModule` 方法是可以动态注册或者注销模块的，函数内部都会去执行 `installModule`，而这个时候 `state` 已经是一个响应式数据了，为了侦听 `state` 的变化，必须通过 `Vue.set` 去挂载子模块的 `state`，进而触发视图的更新。

```js
const local = module.context = makeLocalContext(store, namespace, path)

function makeLocalContext (store, namespace, path) {
  const noNamespace = namespace === ''

  const local = {
    dispatch: noNamespace ? store.dispatch : (_type, _payload, _options) => {
      const args = unifyObjectStyle(_type, _payload, _options)
      const { payload, options } = args
      let { type } = args

      if (!options || !options.root) {
        type = namespace + type
        if (process.env.NODE_ENV !== 'production' && !store._actions[type]) {
          console.error(`[vuex] unknown local action type: ${args.type}, global type: ${type}`)
          return
        }
      }

      return store.dispatch(type, payload)
    },

    commit: noNamespace ? store.commit : (_type, _payload, _options) => {
      const args = unifyObjectStyle(_type, _payload, _options)
      const { payload, options } = args
      let { type } = args

      if (!options || !options.root) {
        type = namespace + type
        if (process.env.NODE_ENV !== 'production' && !store._mutations[type]) {
          console.error(`[vuex] unknown local mutation type: ${args.type}, global type: ${type}`)
          return
        }
      }

      store.commit(type, payload, options)
    }
  }

  // getters and state object must be gotten lazily
  // because they will be changed by vm update
  Object.defineProperties(local, {
    getters: {
      get: noNamespace
        ? () => store.getters
        : () => makeLocalGetters(store, namespace)
    },
    state: {
      get: () => getNestedState(store.state, path)
    }
  })

  return local
}
```

我们来看下 `makeLocalContext` 内部的实现。这个函数的作用是为了构建模块的 dispatch, commit, getters and state。函数返回的是一个 `local` 对象，并且存储在 `module.context` 上。我们来分析它的每个 key 的实现：  


  1. **dispatch**  
  
      如果 `namespace` 不为空，说明该模块是有命名空间的。那么返回如下一个函数：  
      
      ```js
      (_type, _payload, _options) => {
        const args = unifyObjectStyle(_type, _payload, _options)
        const { payload, options } = args
        let { type } = args

        if (!options || !options.root) {
          type = namespace + type
          if (process.env.NODE_ENV !== 'production' && !store._actions[type]) {
            console.error(`[vuex] unknown local action type: ${args.type}, global type: ${type}`)
            return
          }
        }

        return store.dispatch(type, payload)
      }
      ```

      这个函数内部先根据 `namespace` 与 传入的 `type` 做一次拼接。这样就精确定位到了这个模块对应的 `action` 的回调函数。可以看到：如果 `{ options: true }`，直接忽略模块的 `namespace`，调用根 store 的 `action`。也就是通过 `local.dispatch` 派发的 `action` 就是该模块对应的 `action` 的回调函数，函数的底层还是通过根 store 的 `dispatch` 方法来触发的，因为 `type` 已经是补齐 `namespace`。

  2. **commit**  

      与 `dispatch` 大同小异。

  3. **getters**  

      我们先看下 `makeLocalGetters` 的实现：

      ```js
      function makeLocalGetters (store, namespace) {
        const gettersProxy = {}

        const splitPos = namespace.length
        Object.keys(store.getters).forEach(type => {
          // skip if the target getter is not match this namespace
          if (type.slice(0, splitPos) !== namespace) return

          // extract local getter type
          const localType = type.slice(splitPos)

          // Add a port to the getters proxy.
          // Define as getter property because
          // we do not want to evaluate the getters in this time.
          Object.defineProperty(gettersProxy, localType, {
            get: () => store.getters[type],
            enumerable: true
          })
        })

        return gettersProxy
      }
      ```
  
      通过 `namespace` 可以定位到 `store.getters` 下对应的值。这个是利用 Vue computed 的机制实现的，相当于 store 的计算属性。我们会在接下来的 `resetStoreVM` 涉及。函数返回的是当前模块对应 getters 的对象。

  4. **state** 

      `getNestedState` 函数传入 `state` 与 `path` 算出当前模块的 state。

通过上面四个步骤得到 `local` 之后，开始安装每个模块的 `mutations`, `actions`, `state`, `getters`，并且把 `local` 传入，这样就能在这些函数中，拿到自己模块的信息。我们先从 `mutations` 的安装下手。

  1.  **registerMutation**

      ```js
      function registerMutation (store, type, handler, local) {
        const entry = store._mutations[type] || (store._mutations[type] = [])
        entry.push(function wrappedMutationHandler (payload) {
          handler.call(store, local.state, payload)
        })
      }
      ```

      `mutation` 都是经过 `wrappedMutationHandler` 函数包装之后推入 `store._mutations` 对应的数组里面。这样使得多个模块能够对同一 mutation 作出响应（只要模块的 `namespace` 与 `mutation` 对应的 key 名都相同）。执行 `wrappedMutationHandler`，也就是执行了对应的 `mutation`，并且把当前模块的 `state` 传入。知道了如何注册 Mutation，那我们也就知道如何调用对应模块的 Mutation。看下面一个例子：

      ```js
      const options = {
        mutations: {
          count () {}
        },
        modules: {
          namespaced: true,
          moduleA: {
            mutations: { count() {} }
          }
        }
      }

      // 注册 mutation 之后
      store._mutations = {
        'count' : [function wrappedMutationHandler() { /* 根 module 的 mutation */  }]
        'moduleA/count': [function wrappedMutationHandler() { /* moduleA 的 mutation */  }]
      }
      ```

  2.  **registerAction**

      ```js
      function registerAction (store, type, handler, local) {
        const entry = store._actions[type] || (store._actions[type] = [])
        entry.push(function wrappedActionHandler (payload, cb) {
          let res = handler.call(store, {
            dispatch: local.dispatch,
            commit: local.commit,
            getters: local.getters,
            state: local.state,
            rootGetters: store.getters,
            rootState: store.state
          }, payload, cb)
          if (!isPromise(res)) {
            res = Promise.resolve(res)
          }
          if (store._devtoolHook) {
            return res.catch(err => {
              store._devtoolHook.emit('vuex:error', err)
              throw err
            })
          } else {
            return res
          }
        })
      }
      ```

      `action` 的存储方式与 `mutation` 相同，但是内部的逻辑略有不同。`wrappedActionHandler` 函数内部执行调用方定义的 `action` 函数的时候，传入了六个参数，前四个分别为：`dispatch`，`commit`，`getters`，`state`，这些都是当前模块的。调用这些方法或者获取这些属性都会自动帮你拼接 `namespace`，而这些逻辑都是在 `makeLocalContext` 里做的。后两个参数： `rootGetters` 与 `rootState` 都是根模块的。最后，我们可以看到，每一个 `action` 都返回了 Promise，所以我们可以像下面一样使用 `action`：

      ```js
      actions: {
        actionA ({ commit }) {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              commit('someMutation')
              resolve()
            }, 1000)
          })
        }
      }

      store.dispatch('actionA').then(() => {
        // ...
      })
      ```

  3.  **registerGetter**

      过程与 **registerMutation** 相似，这里就不做赘述了。

最后只要深度递归每个子模块，完成所有模块的安装即可。

### 第二步 总结

我们来总结下第二步做了什么？目的很明确，就是安装模块，将其对应的 `state`， `getters`， `actions`， `mutations` 的回调函数用一层包装函数去包裹，并且在包装函数的内部执行回调函数的时候传入当前模块以及根模块的属性或者方法。我们拿 `Vuex` 源码里的 `examples/shopping-cart` 下的 Store 配置做一个例子。

```js
const cart = {
  state: {
    items: [],
    checkoutStatus: null
  },
  getters: {
    cartProducts () {}
  },
  actions: {
    checkout () {}
  },
  mutations: {
    pushProductToCart () {}
  }
}
new Vuex.Store({
  modules: {
    cart
  }
})

// 经过 installModule 之后
store = {
  state: {
    cart: {
      items: [],
      checkoutStatus: null
    }
  },
  _wrappedGetters: {
    'cart/cartProducts': function wrappedGetter() {}
  },
  _actions: {
    'cart/checkout': function wrappedActionHandler() {}
  },
  _mutations: {
    'cart/pushProductToCart': function wrappedMutationHandler() {}
  }
}
```

## 第三步

为什么 Store 的 State 是响应式的呢，为什么我们能直接通过 `Store.getters.xxx` 获取到我们之前配置的 `getters` 函数的返回值呢，这些谜题的答案都能在 `resetStoreVM` 里面找到。

```js
function resetStoreVM (store, state, hot) {
  const oldVm = store._vm

  // bind store public getters
  store.getters = {}
  const wrappedGetters = store._wrappedGetters
  const computed = {}
  forEachValue(wrappedGetters, (fn, key) => {
    // use computed to leverage its lazy-caching mechanism
    computed[key] = () => fn(store)
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true // for local getters
    })
  })

  // use a Vue instance to store the state tree
  // suppress warnings just in case the user has added
  // some funky global mixins
  const silent = Vue.config.silent
  Vue.config.silent = true
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
  Vue.config.silent = silent

  // enable strict mode for new vm
  if (store.strict) {
    enableStrictMode(store)
  }

  if (oldVm) {
    if (hot) {
      // dispatch changes in all subscribed watchers
      // to force getter re-evaluation for hot reloading.
      store._withCommit(() => {
        oldVm._data.$$state = null
      })
    }
    Vue.nextTick(() => oldVm.$destroy())
  }
}
```

首先先通过 `oldVm` 缓存之前的 vue 实例，拿到 `store._wrappedGetters` 的 `key/value`，利用 `computed` 对象将 `key` 与 `() => value(store)` 进行键值对绑定，用来作为 `store._vm` 的计算属性，同时通过 `Object.defineProperty` 奖所有的 `key` 挂载在 `store.getters` 上，并且对 `store.getters` 求值的过程是代理到对 `store.vm` 求值的过程。如此按照整个链路来看，执行 `store.getters.XXX` 就是对 `store._vm.XXX` 求值，这是个 `computed` 属性。就会将当前 `watch` 实例加入到 `XXX` 属性的依赖当中，因为 `XXX` 属性又是通过 `() => fn(store)` 而来的，也就是依赖了 store 里面的 `state` 与 `getters` 的变化，只要store 里面的 `state` 与 `getters` 发生了变化，就能使得 `XXX` 属性重新求值。从这整个链路来讲，`Store` 的 `State` 的响应式实现是非常精妙的。

我们再来看下 `enableStrictMode`，内部的代码是这样的：

```js
function enableStrictMode (store) {
  store._vm.$watch(function () { return this._data.$$state }, () => {
    if (process.env.NODE_ENV !== 'production') {
      assert(store._committing, `do not mutate vuex store state outside mutation handlers.`)
    }
  }, { deep: true, sync: true })
}
```

`store._vm` 通过 `$watch` 去深度并且同步观测 `this._data.$$state` 的变化，只要这个响应式的数据发生变化，就会执行 `assert` 断言，如果发现 `store._committing` 的值为 `false`，就抛出错误。所以我们每次修改 `State`，必须是在 `store._withcommit` 这个函数的回调里面。 我们看下这个函数的定义：

```js
_withCommit (fn) {
  const committing = this._committing
  this._committing = true
  fn()
  this._committing = committing
}
```

这个函数其实就是个包装函数，用来包装 `fn`，在其之前，强制将 `this._committing` 设置为 `true`，这样你只要在 `fn` 里面修改 `state` 的时候，触发 `enableStrictMode` 里面的 `watch` 回调的时候，就不会抛出警告了。记住 `{ sync: true }` 这个配置是必须的，要不然 `watch` 回调都是在下一个 tick 里面执行的，这样就会导致先执行 `this._committing = committing` 后 `assert` 了。

### 第三步 总结

通过第三步，`getters` 与 `state` 变成了响应式，我们用一个列子来概括下 `getters` 与 `state` 怎么做到响应式的。

```js
const options = {
  state: {
    musicList: ['innocence']
  },
  getters: {
    firstMusic ({ musicList }) {
      return musicList[0]
    }
  }
}

const store = new Vuex.Store(options)

// 先分析 state 是如何做到响应式的
首先如果我在组件里面执行 `this.$store.state.musicList`，其实是执行了 `store._vm._data.$$state.musicList`，因为 `store._vm._data.$$state` 是一个响应式数据，所以会将当前 watch 添加进它的依赖，只要这个数据发生了赋值变化，就能通知到所有对 `state` 进行求值的 watch。

// 再分析下 getters 是怎么作为 store 的计算属性的
传入了 getters，store 实例化的过程中会安装模块，也就是执行下面的伪代码

store._wrappedGetters = function wrappedGetter (store) {
  return firstMusic(
    local.state, // local state
    local.getters, // local getters
    store.state, // root state
    store.getters // root getters
  )
}

store._vm = new Vue({
  data: {
    $$state: {
      musicList: ['innocence']
    }
  },
  computed: {
    firstMusic () {
      return wrappedGetter(store)
    }
  }
})

而我们执行 `store.getters.firstMusic`，相当于执行 `store._vm.firstMusic`，因为 `firstMusic` 函数内部是对 `store.state` 进行求值的，而且是个计算属性，所以当 `musicList` 发生变化，`firstMusic` 也重新求值了。
```

## 第四步

store 是拥有一种让插件订阅自己变化的能力。我们看如下代码：

```js
// apply plugins
plugins.forEach(plugin => plugin(this))
```

store 在实例化的时候是接收 `plugins` 的配置项，默认是一个空数组，数组的每一项是插件导出的函数，会在构造函数里执行这个函数，并且将自身实例传入。Vuex 是自带了 `logger` 插件，它允许我们能够在 `state` 的变化前后生成 `snapshots`。插件的代码是位于 `src/plugins/logger.js`

```js
export default function createLogger ({
  collapsed = true,
  filter = (mutation, stateBefore, stateAfter) => true,
  transformer = state => state,
  mutationTransformer = mut => mut,
  logger = console
} = {}) {
  return store => {
    let prevState = deepCopy(store.state)

    store.subscribe((mutation, state) => {
      if (typeof logger === 'undefined') {
        return
      }
      const nextState = deepCopy(state)

      if (filter(mutation, prevState, nextState)) {
        const time = new Date()
        const formattedTime = ` @ ${pad(time.getHours(), 2)}:${pad(time.getMinutes(), 2)}:${pad(time.getSeconds(), 2)}.${pad(time.getMilliseconds(), 3)}`
        const formattedMutation = mutationTransformer(mutation)
        const message = `mutation ${mutation.type}${formattedTime}`
        const startMessage = collapsed
          ? logger.groupCollapsed
          : logger.group

        // render
        try {
          startMessage.call(logger, message)
        } catch (e) {
          console.log(message)
        }

        logger.log('%c prev state', 'color: #9E9E9E; font-weight: bold', transformer(prevState))
        logger.log('%c mutation', 'color: #03A9F4; font-weight: bold', formattedMutation)
        logger.log('%c next state', 'color: #4CAF50; font-weight: bold', transformer(nextState))

        try {
          logger.groupEnd()
        } catch (e) {
          logger.log('—— log end ——')
        }
      }

      prevState = nextState
    })
  }
}
```

`logger` 插件是导出的函数是默认返回一个新匿名函数，这个函数接收 `store` 作为参数。先保存之前  `state` 的变化值，然后订阅 `mutation` 的变化，我们先看下 `Store` 类上面的 `subscribe` 的定义。

```js
subscribe (fn) {
  return genericSubscribe(fn, this._subscribers)
}

// genericSubscribe
function genericSubscribe (fn, subs) {
  if (subs.indexOf(fn) < 0) {
    subs.push(fn)
  }
  return () => {
    const i = subs.indexOf(fn)
    if (i > -1) {
      subs.splice(i, 1)
    }
  }
}
```

接收一个订阅者 `fn`，并且将其推入到 `this._subscribers` 队列当中，同时利用闭包的原理返回一个取消剔除订阅者的回调。而 `this._subscribers` 队列里的订阅者什么时候执行呢，我们来看 `Store` 类上面的 `commit` 的定义。

```js
commit (_type, _payload, _options) {
    //...

    this._subscribers.forEach(sub => sub(mutation, this.state))

    // ...
  }
```
也就是只要执行了 `commit`，订阅者都会被执行一遍。这也就是我们 `logger` 插件的原理所在。它订阅了 `state` 的变化，只要你执行 `commit`，通过注入 `logger` 插件时的订阅者 `fn` 都会被通知到。我们来看下 `fn` 的定义。

```js
(mutation, state) => {
  if (typeof logger === 'undefined') {
    return
  }
  const nextState = deepCopy(state)

  if (filter(mutation, prevState, nextState)) {
    const time = new Date()
    const formattedTime = ` @ ${pad(time.getHours(), 2)}:${pad(time.getMinutes(), 2)}:${pad(time.getSeconds(), 2)}.${pad(time.getMilliseconds(), 3)}`
    const formattedMutation = mutationTransformer(mutation)
    const message = `mutation ${mutation.type}${formattedTime}`
    const startMessage = collapsed
      ? logger.groupCollapsed
      : logger.group

    // render
    try {
      startMessage.call(logger, message)
    } catch (e) {
      console.log(message)
    }

    logger.log('%c prev state', 'color: #9E9E9E; font-weight: bold', transformer(prevState))
    logger.log('%c mutation', 'color: #03A9F4; font-weight: bold', formattedMutation)
    logger.log('%c next state', 'color: #4CAF50; font-weight: bold', transformer(nextState))

    try {
      logger.groupEnd()
    } catch (e) {
      logger.log('—— log end ——')
    }
  }

  prevState = nextState
})
```

首先拿到变化后的 `state`，并且格式化加上美化通过 `console` 输出，最后将当前 `state` 赋值给 `prevState`，为下一次 `commit` 执行 `fn` 做准备。

### 第四步 总结

`Store` 是可以允许订阅者订阅其变化的，这些订阅者是通过 `plugins` 的形式加入的，并且利用闭包，能够随时清理这些订阅者。这种设计师非常的精致与灵活。 

## 原型上的方法

我们来讲一下 `Store` 类上的方法，这些方法是允许调用方修改 `store` 实例。

1. **commit**
   
   ```js
    // check object-style commit
    const {
      type,
      payload,
      options
    } = unifyObjectStyle(_type, _payload, _options)

    const mutation = { type, payload }
    const entry = this._mutations[type]
    if (!entry) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`[vuex] unknown mutation type: ${type}`)
      }
      return
    }
    this._withCommit(() => {
      entry.forEach(function commitIterator (handler) {
        handler(payload)
      })
    })
    this._subscribers.forEach(sub => sub(mutation, this.state))

    if (
      process.env.NODE_ENV !== 'production' &&
      options && options.silent
    ) {
      console.warn(
        `[vuex] mutation type: ${type}. Silent option has been removed. ` +
        'Use the filter functionality in the vue-devtools'
      )
    }
   ```
   修改 `state` 的唯一方式，而且必须是同步代码。因为要生成 `state` 修改前后的快照。不管是根模块还是子模块提交 `mutation`，都是底层都是调用了这个函数，只不过子模块的调用是通过 `makeLocalContext` 拼接了 `namespace`，函数最后会执行所有订阅者 `fn`。

2. **dispatch**   

   ```js
    dispatch (_type, _payload) {
      // check object-style dispatch
      const {
        type,
        payload
      } = unifyObjectStyle(_type, _payload)

      const action = { type, payload }
      const entry = this._actions[type]
      if (!entry) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(`[vuex] unknown action type: ${type}`)
        }
        return
      }

      this._actionSubscribers.forEach(sub => sub(action, this.state))

      return entry.length > 1
        ? Promise.all(entry.map(handler => handler(payload)))
        : entry[0](payload)
    }
   ```

   与 `commit` 相似，唯一不同的是 `action` 内部是可以支持异步的，而且 `action` 是一定返回一个 `Promise`。`dispatch` 在不同模块中可以触发多个 `action` 函数。在这种情况下，只有当所有触发函数完成后，返回的 Promise 才会执行。这个就是通过 `Promise.all` 这个 API 做到的。

3. **subscribe 与 subscribeAction**   
  
    ```js
    subscribe (fn) {
      return genericSubscribe(fn, this._subscribers)
    }
    subscribeAction (fn) {
      return genericSubscribe(fn, this._actionSubscribers)
    }
    function genericSubscribe (fn, subs) {
      if (subs.indexOf(fn) < 0) {
        subs.push(fn)
      }
      return () => {
        const i = subs.indexOf(fn)
        if (i > -1) {
          subs.splice(i, 1)
        }
      }
    }
    ```

    `fn` 订阅 `action` 与 `mutation`。只要执行了 `dipatch` 或者 `commit`，都会执行 `fn`，注册订阅者的时候同时返回一个可以注销 `fn` 的新匿名函数。

3. **watch**

    ```js
    watch (getter, cb, options) {
      if (process.env.NODE_ENV !== 'production') {
        assert(typeof getter === 'function', `store.watch only accepts a function.`)
      }
      return this._watcherVM.$watch(() => getter(this.state, this.getters), cb, options)
    }
    ```

    `store.watch` 是一个对外暴露可以侦听 `state` 与 `getters` 变化的 API，只要侦听的数据发生变化，就会执行调用方传入的 `getter` 回调函数。

4. **replaceState**

    ```js
    replaceState (state) {
      this._withCommit(() => {
        this._vm._data.$$state = state
      })
    }
    ```

    `replaceState` 替换 store 的根状态，仅用状态合并或时光旅行调试。

5. **registerModule**

    ```js
    registerModule (path, rawModule, options = {}) {
      if (typeof path === 'string') path = [path]

      if (process.env.NODE_ENV !== 'production') {
        assert(Array.isArray(path), `module path must be a string or an Array.`)
        assert(path.length > 0, 'cannot register the root module by using registerModule.')
      }

      this._modules.register(path, rawModule)
      installModule(this, this.state, path, this._modules.get(path), options.preserveState)
      // reset store to update getters...
      resetStoreVM(this, this.state)
    }
    ```

    动态注册模块，无法注册根模块，否则会影响之前通过 `new` 创建的 store 实例。

6. **unregisterModule**

    ```js
    unregisterModule (path) {
      if (typeof path === 'string') path = [path]

      if (process.env.NODE_ENV !== 'production') {
        assert(Array.isArray(path), `module path must be a string or an Array.`)
      }

      this._modules.unregister(path)
      this._withCommit(() => {
        const parentState = getNestedState(this.state, path.slice(0, -1))
        Vue.delete(parentState, path[path.length - 1])
      })
      resetStore(this)
    }
    ```

    动态卸载模块，不能使用此方法卸载静态模块（即创建 store 时声明的模块）。那这个是怎么做到的呢。看下面代码：
    ```js
    this._modules.unregister(path)

    // module-collection
    unregister (path) {
      const parent = this.get(path.slice(0, -1))
      const key = path[path.length - 1]
      // 这一行是用来控制无法卸载静态模块
      if (!parent.getChild(key).runtime) return

      parent.removeChild(key)
    }
    ```

    因为我们注册的静态模块的 `runtime` 默认是 `false`，而通过 `registerModule` 注册的模块的 `runtime` 默认是 `true`。

5. **_withCommit**

    ```js
      _withCommit (fn) {
      const committing = this._committing
      this._committing = true
      fn()
      this._committing = committing
    }
    ```

    用来包裹内部能够修改 `state`的 `fn` 的函数。`Vuex` 约定只能显性 `commit` 一个 `mutation` 来改变 `state`，所以对 `state` 发生修改的函数都是用 `_widthCommit` 进行包装了一层。

## 大总结

以上是对 `Store` 类的细节的剖析。我们知道了它是对我们传入的配置项做了哪些处理，怎样实现 `state` 响应式与 `getters` 计算属性的，以及怎样去分模块的，并且能够在模块的内部拿到模块的属性。但是我们发现，如果每次都是通过 `this.$store.state.xxx`，`this.$store.dispatch` 等去获取或者修改 `state` 是很麻烦的。幸好 `Vuex` 是给我们提供了一些 `mapXXX` 的辅助函数来帮我们的代码能够写的更清爽，这也是我们设计 `js` 库该学习的。怎样让用的人感觉很爽？