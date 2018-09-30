# 辅助函数 mapXXX

辅助函数的定义都位于 `vuex/src/helpers.js`。分别导出了 `mapState`，`mapMutations`，`mapGetters`，`mapActions`，`createNamespacedHelpers`。前四个函数都是依赖 `normalizeNamespace` 来处理 `namespace` 的问题，我们先来看这个函数的定义。

```js
function normalizeNamespace (fn) {
  return (namespace, map) => {
    if (typeof namespace !== 'string') {
      map = namespace
      namespace = ''
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      namespace += '/'
    }
    return fn(namespace, map)
  }
}
```

`normalizeNamespace` 接收一个 `fn` 作为入参，返回一个新函数，接收 `namespace` 与 `map` 作为参数，调用 `fn`，将两个参数传入。新函数内部会自动帮你拼接 `/`，比如对于下面的例子

```js
const options = {
  actions: {
    count () {}
  },
  modules: {
    modulesA: {
      namespaced: true,
      actions: {
        childCount () {}
      }
    }
  }
}

如果想用调用 modulesA 的 childCount，我们一般可以这样调用：

store.dispatch('moudlesA', 'childCount')

或者

store.dispatch('moudlesA/', 'childCount')
```

分析完了 `normalizeNamespace` 的作用，我们继续看下这几个 `mapXXX` 辅助函数是做了些什么的吧。

1. **mapState**

```js
export const mapState = normalizeNamespace((namespace, states) => {
  const res = {}
  normalizeMap(states).forEach(({ key, val }) => {
    res[key] = function mappedState () {
      let state = this.$store.state
      let getters = this.$store.getters
      if (namespace) {
        const module = getModuleByNamespace(this.$store, 'mapState', namespace)
        if (!module) {
          return
        }
        state = module.context.state
        getters = module.context.getters
      }
      return typeof val === 'function'
        ? val.call(this, state, getters)
        : state[val]
    }
    // mark vuex getter for devtools
    res[key].vuex = true
  })
  return res
})
```

首先，`mapState` 函数是接收 `namespace` 与 `states`，`states` 可以是一个对象也可以是一个数组。函数内部先通过 `normalizeMap` 将我们传入的 `states` 处理成预期的格式。先看下 `normalizeMap` 的实现

```js
function normalizeMap (map) {
  return Array.isArray(map)
    ? map.map(key => ({ key, val: key }))
    : Object.keys(map).map(key => ({ key, val: map[key] }))
}

normalizeMap([1, 2, 3]) => [ { key: 1, val: 1 }, { key: 2, val: 2 }, { key: 3, val: 3 } ]
normalizeMap({a: 1, b: 2, c: 3}) => [ { key: 'a', val: 1 }, { key: 'b', val: 2 }, { key: 'c', val: 3 } ]
```
如果是数组，变成了 `{ key, val: key }`；如果是对象，变成了 `{ key, val: map[key] }`。

最后将 `key` 挂载在 `res` 对象上，这个对象最终会被返回，这样我们通过 `...mapState({})` 对象扩展符，就能定义到组件的 `computed` 上面了。内部的逻辑很简单，先拿到 `store` 实例上的 `state` 与 `getter`。如果传入了 `namespace`，就通过 `store._modulesNamespaceMap` 上去拿之前注册的模块。这个时候获取到的 `state` 就是局部模块的 `state`了。

2. **mapMutations、 mapGetters、 mapActions**

过程与 `mapState` 类似。

3. **createNamespacedHelpers**

```js
export const createNamespacedHelpers = (namespace) => ({
  mapState: mapState.bind(null, namespace),
  mapGetters: mapGetters.bind(null, namespace),
  mapMutations: mapMutations.bind(null, namespace),
  mapActions: mapActions.bind(null, namespace)
})
```

接收 `namespace`，利用 `bind` 方法，对 `mapState`、`mapGetters`、`mapMutations`、`mapActions` 做了一层包装。所以我们可以这样调用

```js
import { createNamespacedHelpers } from 'vuex'

const { mapState, mapActions } = createNamespacedHelpers('some/nested/module')

export default {
  computed: {
    // 在 `some/nested/module` 中查找
    ...mapState({
      a: state => state.a,
      b: state => state.b
    })
  },
  methods: {
    // 在 `some/nested/module` 中查找
    ...mapActions([
      'foo',
      'bar'
    ])
  }
}
```
