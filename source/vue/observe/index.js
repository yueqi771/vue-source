import Observer from './observer'
import Watcher from './watcher';
import { dependArray } from './array';
import Dep from './dep';

export function initState(vm) {
    // 做不同的初始化工作
    let opts = vm.$options;

    if(opts.data) {
        initData(vm);
    }

    if(opts.computed) {
        initComputed(vm);
    }

    if(opts.watch) {
        // initWatch(vm)
    }
}

// 数据代理
function proxy(vm, source, key) {
    Object.defineProperty(vm, key, {
        get() {
            return vm[source][key]
        },
        set(newValue) {
            vm[source][key] = newValue
        }
    })
}

function initData(vm) {
    // 将用户传入的数据使用object.defineProperty重新定义
    let data = vm.$options.data

    // 重新给用户传入的数据重新赋
    data = vm._data = typeof data === 'function' ? data.call(vm) : data || {};

    // 将数据代理到vm._data上
    for(let key in data) {
        proxy(vm, '_data', key)
    }

    observe(vm._data)
}

export function observe(data) {
    if(typeof data !== 'object' || data == null) {
        return
    }

    return new Observer(data)
}

function initComputed() {
    // 创建存储计算属性的watche的对象
    let watchers = vm._watchersComputed = Object.create(null)

    for(let key in computed) {
        let userDef = computed[key]
        // new Watcher 此时什么都不会做， 配置了lazy, dirty
        watchers[key] = new Watcher(vm, key, () => {}, {lazy: true}) // lazy: true 表示的是计算实行watcher， 默认刚开始这个方法不会执行
        
        // 将这个属性定义到vm上
        Object.defineProperty(vm, key, {
            get: createComputedGetter(vm, key)
        })
    }
}

function createComputedGetter() {
    let watcher = vm._watchersComputed[key]
    return function() {
        // 用户取之会执行此方法
        if(watcher) {
            // 如果页面取之， 而且dirty是true， 就会去调用watcher的get方法
            if(watcher.dirty) {
                watcher.evaluate()
            }

            if(Dep.target) {
                watcher.depend()
            }
        }

        return watcher.value
    }
}



// 创建watcher
function createWatcher(vm, key, handler) {
    // 内部最终也会使用$watch方法
    return vm.$watch(key, handler);
}

function initWatch(vm) {
    let watcher = vm.$options.watch;

    for(let key in watcher) {
        let handler = watcher[key];

        createWatcher(vm, key, handler)
    }
}