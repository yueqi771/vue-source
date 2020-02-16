import { initState } from './observe/index'
import Watcher from './observe/watcher';
import utils from './utils'
import { render, patch, h } from './virtual-dom'

/**
 * ！！！！ 一
 * 个数据的属性会有一个Dep。 
 * 但是watcher默认只会有一个
 * @param {*} options 
 */
function Vue(options) {
    this._init(options) // 初始化vue， 并且将用户选项传入
}

Vue.prototype._init = function (options) {
    // vue中初始化， this.$options 表示的vu中的参数
    let vm = this;
    vm.$options = options;
 
    // MVVM原理 需要数据初始化
    // 拦截数组的方法和对象的属性
    initState(vm) 
    
    if(vm.$options.el) {
        vm.$mount()
    }
}

Vue.prototype.$watch = function(expr, handler) {
    // 原理： 创建一个watcher
    new Watcher(this, expr, handler, {user: true}); // 用户自己定义的watcher
}

function query(el) {
    if(typeof el === 'string') {
        return document.querySelector(el)
    }

    return el
}

function compiler(node, vm) {
    let childNodes = node.childNodes;

    // 将类数组 转化成数组
    [...childNodes].forEach(child => {
        // 1: 元素， 3: 文本
        if(child.nodeType === 1) {
            // 编译当前元素的孩子即诶单
            compiler(child, vm); 
        }else if(child.nodeType === 3) {
            utils.compilerText(child, vm)
        }
    })
}

Vue.prototype._update1 = function() {
    console.log('更新页面')
    let vm = this;
    // 用户传入的数据去更新试图
    let el = vm.$el;

    // 要循环这个元素， 将里面的内容， 换成我们的数据

    // 需要匹配 {{}}ji进行替换
    let node = document.createDocumentFragment();

    let firstChild;

    // 每次拿到第一个 元素， 就将这个元素放入到文档碎片中
    while(firstChild = el.firstChild ) {
        node.appendChild(firstChild) // appendChild 是具有移动的功能
    }
    compiler(node, vm)

    // 对文本进行替换
    el.appendChild(node)
}

Vue.prototype._update = function(vnode) {
    let vm = this;
    let el = vm.$el;
    // 第一次没有vnode
    let preVnode = vm.preVnode;

    if(!preVnode) {
        // 初次渲染
        vm.preVnode = vnode // 把上一次的节点保存起来
        render(vnode, el)
    }else {
        // vue的更新操作
        vm.$el = patch(preVnode, vnode)
    }

}

// render
Vue.prototype._render = function() {
    let vm = this;
    // 获取用户编写的render方法
    let render = vm.$options.render;

    let vnode = render.call(vm, h) // h(')

    return vnode
}

// 渲染页面， 将组件进行挂载
Vue.prototype.$mount = function() {
    let vm = this;
    let el = vm.$options.el;
    // 获取当前挂载的节点

    // vm.$el就是我要挂载的元素
    el = vm.$el = query(el)

    // 渲染是通过watcher来渲染的
    // 渲染watcher 用于渲染的watcher
    // vue 2.0 组件级别更新

    // 更新组件， 渲染 的逻辑
    let updateComponent = () => {
        vm._update(vm._render())
    }

    new Watcher(vm, updateComponent) // 渲染watcher 默认回调用updateComponent方法

    // 数据更新后需要重新渲染页面
}

export default Vue