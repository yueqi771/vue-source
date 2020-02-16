import { pushTarget, popTarget } from './dep'
import utils  from '../utils/index'

let id = 0
// 每次产生的watcher都要一个id
class Watcher {
    /**
     * vm 当前组件的实例
     * exprOrFn 用户传入的一个表达式， 也有啃呢个是一个函数
     * cb 用户传入的回调函数 vm.$watch('msg', cb)
     * opts 一些其他参数
     */
    constructor(vm, exprOrFunc,  cb, opts) {
        this.vm = vm 
        this.exprOrFn  = exprOrFunc ? exprOrFunc : ""
        this.deps = [];
        this.depsId = new Set()
        this.cb = cb 

        if(typeof exprOrFunc === 'function') {
            this.getter = exprOrFunc;
        }else {
            this.getter = () => {
                return utils.getValue(vm, this.exprOrFn)
            }
        }

        if(opts && opts.user) {
            this.user = true;
        }

        this.lazy = opts && opts.lazy // 是否是计算属性
        this.dirty =  this.lazy // 将计算实行进行缓存
        this.opts = opts
        this.id = id++

        // 创建watcher的时候， 现将表达式对应的值取出来 （oldValue）
        // 如果是计算属性的化， 不会默认调用get方法
        this.value = this.lazy ? undefined : this.get() // 默认创建一个watcher 会调用自身的getfangfa 
    }

    get() {
        // 渲染watcher Dep.target = watcher
        pushTarget(this) 
        // 默认创建watcher会执行该方法
        let value = this.getter.call(this.vm)
        popTarget()

        return value;
    }

    evaluate() {
        this.value = this.get();
        this.dirty = true
    }

    depend() {
        let i = this.deps.length;

        while(i--) {
            this.deps[i].depend()
        }
    }

    addDep(dep) {
        let id = dep.id;
        // 同一个watcher， 不应该重复记录Dep
        if(!this.depsId.has(id)) {
            this.depsId.add(id)
            this.deps.push(dep) // 这样就让watcher记住了当前的dep
            dep.addSub(this);
        }
    }

    update() { // 如果立即调用get， 会导致页面重复刷新， 可以采用异步刷新的方式来解决这个问题
        // this.get()
        if(this.lazy) {
            this.dirty = true
        }else {
            queueWatcher(this)
        }
    }

    run() {
        // 新值
        let value = this.get()

        if(this.value !== value) {
            this.cb(value, this.value)
        }
    }

}

let has = {};
let queue = []

function flushQueue() {

    // 等待当前这一轮全部更新后， 再去让watcher依次执行
    queue.forEach(watcher => watcher.run())
    // 下一轮更新时继续使用
    has = {}
    queue = []
}

// 对重复的watcher进行过滤操作
function queueWatcher(watcher) {
    let id = watcher.id;
    console.log('id', id)
    if(has[id] == null) {
        has[id] = true
        queue.push(watcher) // 相同的watcher只会存入一个queen

        // 延迟清空队列
        nextTick(flushQueue)
        // setTimeout(flushQueue, 0) 
    }
}

let callbacks  = [];

function flushCallbacks() {
    callbacks.forEach(cb => cb())
}

function nextTick(cb) {
    // cb就是flushQueue
    callbacks.push(cb)


    // 要异步刷新这个callbacks， 获取一个异步的方法
    // 异步是分顺序执行的， 会先执行(promise mutationObserver) 微任务 （setImmediate setTimeout） 宏任务

    let timerFunc = () => {
        flushCallbacks()
    }

    if(Promise) {
        return Promise.resolve().then(timerFunc)
    }

    if(MutationObserver) {
        let observer = new MutationObserver(timerFunc)
        let textNode = document.createTextNode(1);
        observer.observe(textNode, { characterData: true })
        textNode.textContent = 2
        return
    } 

    if(setImmediate) {
       return setImmediate(timerFunc)
    }

    setTimeout(timerFunc, 0)
}


// 渲染使用， 计算属性要用它， vm.$watch要用它
export default  Watcher