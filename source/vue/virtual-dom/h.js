import { vnode } from './create-element'

let app = document.getElementById('app');



function h(tag, props, ...children) {
    let key = props.key;

    // 属性中不包括key属性
    delete props.key; 

    children = children.map(child =>  {
        if(typeof child === 'object') {
            return child
        }else {
            return vnode(undefined, undefined, undefined, undefined, child)
        }
    })

    // key的作用， 可以比对两个虚拟节点是否是同一个
    return vnode(tag, props, key, children) 
}

export default h