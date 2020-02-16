import { observe } from './index'
import { arrayMethods, observerArray, dependArray } from './array'
import Dep from './dep'

export function defineReactive(data, key, value) {
    // 如果vulue依旧是一个对象的话， 需要深度观察
    let childOb = observe(value)

    // if(typeof value === 'object') {
    //     observe(data) // 递归观察{}
    // }

    // dep里面可以收集依赖
    let dep = new Dep()
    // vue
    Object.defineProperty(data, key, {
        get() {
            // watcher是否有值
            if(Dep.target) {
                // 我们希望存入的watcher 不会重复， 因为一个变量可能会调用多次
                // dep.addSub(Dep.target)
                dep.depend() // 它想让dep中可以存watcher , 同时watcher中可以存放dep， 实现一个多对多的关系
            }
            console.log('访问数据')

            if(childOb) {
                childOb.dep.depend()
                dependArray(value)
            }

            return value
        },
        set(newValue) {

            if(value === newValue) {
                return;
            }

            observe(newValue)
            value = newValue
            dep.notify();
        }
    })
}

class Observer {
    constructor(data) {
        // 将用户的数据使用defineProperty重新定义

        // 如果是数组

        /**
         * 直接通过索引改变数组不会被改变
         * 改变leng， 不会被监测到
         * [{a:1}] // 内部会对数组离得对象进行架空
         * push, shift, unshift 这些方法可以被监控
         * vm.$set内部调用的就是数组的splice方法 
         */
        // 每个对象， 包括数组都有一个__ob__属性
        Object.defineProperty(data, '__ob__', {
            get: () => this
        })
        this.dep = new Dep() // 此deo 专门为数组而设

        if(Array.isArray(data)) {
            // 只能拦截数据的方法， 但是数组中的每一项也需要观测一下
            // 让数组通过原型链来定向到自己写的方法
            data.__proto__ = arrayMethods
            // 当调用数组的方法是， 手动通知
            observerArray(data)
        }else {
            this.walk(data);
        }
    }   

    walk(data) {
        const keys = Object.keys(data);

        for(let i = 0; i < keys.length; i++) {
            let key = keys[i];

            // 用户传入的值
            let value = data[key];  

            defineReactive(data, key, value)
        }
    }
}

export default Observer