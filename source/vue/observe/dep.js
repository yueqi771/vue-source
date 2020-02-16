let id = 0

// 用来收集依赖， 收集的是一个个watcher
class Dep {
    constructor() {
        this.id = id++;
        this.subs = [];
    }
    
    depend() {
        // 防止直接调用depend方法
        if(Dep.target) {
            // 渲染watcher
            Dep.target.addDep(this) // 希望可以在wacher中互相记忆
        }
    }

    addSub(watcher) {
        this.subs.push(watcher)
    }

    notify() {
        this.subs.forEach(watcher => watcher.update())
    }
    
}

let stack = []


// 用来保存当前的watcher
export function pushTarget(watcher) {
    Dep.target = watcher;
    stack.push(watcher);
}

//
export function popTarget(watcher) {
    stack.pop();
    Dep.target = stack[stack.length - 1]
}
 

export default Dep
