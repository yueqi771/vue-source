import { observe } from ".";

// 拦截用户调用的push， shift, unshift pop reverse sort splice

// 现获取老方法, 只改写7个方法
let oldArrayProtoMethods =  Array.prototype;

// 靠背的i个新的对象， 可以查找到老得方法
export let arrayMethods = Object.create(oldArrayProtoMethods);

let methods = [
    'push', 'pop', 'unshift', 'reverse', 'sort', 'splice'
];

export function observerArray(inserted) {
    // 要循环数组 以此对数组中每一项进行观测
    for(let i = 0; i < inserted.length; i++)  {
        observe(inserted[i])
    }
}

export function dependArray(value) {
    for(let i = 0; i < value.length; i++) {
        // 有啃呢个也是一个数组
        let currentItem = value[i]

        currentItem['__ob__'] && currentItem['__ob__'].dep.denpend()

        if(Array.isArray(currentItem)) {
            // 递归收集数组中的依赖关系
            dependArray(currentItem)
        }
    }
}

methods.forEach(methods => {
    arrayMethods[methods] = function(...args) {
        // 函数劫持 切片编程
        let r = oldArrayProtoMethods[methods].apply(this, args)
        let inserted; 
        switch(methods) {
            case 'push':
                inserted = args;
                break
            case 'splice':  
                inserted = args.slice(2) 
            case 'unshift':
                inserted  = args;
                break
            default:
                break;
        }

        if(inserted) {
            observerArray(inserted) 
        }

        this['__ob__'].dep.noryfy()

        // 如果新增的属性也是对象类型， 那么 需要对这个对象也进行观察
        return r

    }
})

