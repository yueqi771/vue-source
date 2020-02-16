// 这个文件除了第一次的初始化渲染之外， 还要做比对操作

// 将虚拟阶段渲染成真实节点
export function render(vnode, container) {
    let el = createElm(vnode);
    container.appendChild(el)

    return el;
}

// 创建真实即诶单
function createElm(vnode) {
    let { tag, children, key, props, text } = vnode;

    if(typeof tag === 'string') {
        // 标签, 一个虚拟节点对应个一个真实节点
        vnode.el = document.createElement(tag)

        // 更新属性
        updateProperties(vnode);

        children.forEach(child => {
            return render(child, vnode.el)
        })
    }else {
        // 文本
        vnode.el = document.createTextNode(text)
    }

    return vnode.el
}

// 更新属性
function updateProperties(vnode, oldProps = {}) {
    // 获取当前节点的属性
    let props = vnode.props || {};
    // 当前的真实节点
    let el = vnode.el;

    let newStyle = props.style || {}
    let oldStyle = oldProps.style || {} 

    // 稍后会用到这个更新操作， 根据新的虚拟节点， 修改dom元素
    for(let key in oldStyle) {
        if(!newStyle[key]) {
            el.style[key] = ""
        }
    }

    // 下次更新是， 应该用新的属性， 替换老的节点
    // 如果老得有属性， 新的没有， 删除老得节点
    for(let key in oldProps) {
        if(!props[key]) {
            // 如果新的中没有这个属性， 那么直接删除掉dom上的这个属性
            delete el[key]
        }
    }

    // 此时先考虑之前有没有
    for(let key in props) {
        if(key === 'style') {
            for(let  styleName in props.style) {
                el.style[styleName] = props.style[styleName]
            }
        }else {
            // 给元素添加属性， 值就是对应的值
            el[key] = props[key]
        }
    }
}

// 更新虚拟节点
export function patch(oldVnode, newVnode) {
    // 第一： 先比对是否为同一个标签。 父级如果不一样， 直接换掉自元素
    if(oldVnode.tag !== newVnode.tag) {
        oldVnode.el.parentNode.replaceChild(createElm(newVnode), oldVnode.el)
    }

    // 第二： 如果标签一样， 可能是undefinde
    if(!oldVnode.tag) {
        // 如果内容不一致， 直接根据新元素中的内容， 替换掉文本即诶单
        if(oldVnode.text !== newVnode.text) {
            oldVnode.el.textContent = newVnode.text
        }
    }

    // 第三： 如果标签一样， 可能属性不一样, 这里直接复用老得标签
    let el = newVnode.el = oldVnode.el; // 直接复用标签
    
    // 做属性的比对
    updateProperties(newVnode, oldVnode.props);


    // 属性比较完了， 比较孩子
    let oldChildren = oldVnode.children || [];
    let newChildren = newVnode.children || []; 

   
    // 三. 老得有孩子， 新的有孩子
    if(oldChildren.length > 0 && newChildren.length > 0) {
        // 比较他们的孩子
        updateChildren(el, oldChildren, newChildren)
    }else if(oldChildren.length > 0) {   // 一. 老的有孩子， 新的没孩子
        el.innerHTML = ""
    }else if(newChildren.length > 0) {  // 二. 老得没孩子， 新的有孩子
        for(let i = 0; i < newChildren.length; i++) {
            let child = newChildren[i]
            el.appendChild(createElm(child))
        }
    }

    return el
}

// patchVnode: 用新的虚拟节点， 和老得虚拟节点做对比， 更新真实的dom元素

// 双指针的方式
function updateChildren(parent, oldChildren, newChildren) {
    // vue中增加了很多优化操作， 因为自爱浏览器中操作dom最常见的方法是开头或者结尾插入
    // 涉及到郑旭和倒叙

    let oldStartIndex = 0; // 老的索引开始
    let oldStartVnode = oldChildren[0]; // 老的节点的结束索引
    let oldEndIndex = oldChildren.length - 1; 
    let oldEndVnode = oldChildren[oldEndIndex];

    let newStartIndex = 0; // 新的索引开始
    let newStartVnode = newChildren[0]; // 新的节点的结束索引
    let newEndIndex = newChildren.length - 1; 
    let newEndVnode = newChildren[newEndIndex];

    let map = makeIndexByKey(oldChildren)
    console.log(map)
    while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        console.log('循环')
        // 如果当前节点没有值， 那么直接往后移， 乱序比较的时候会把当前节点赋值为undefined
        if(!oldStartVnode) {
            oldStartVnode = oldChildren[++oldStartIndex];
        }else if(!oldEndVnode) {
            oldEndVnode = oldChildren[--oldEndIndex]
        }else if(isSameVNode(oldStartVnode, newStartVnode)) { // 如果起始指针指向的一样的话 逐个比较
            // 内部一样的话， 会用新的属性来替换老得属性
            patch(oldStartVnode, newStartVnode); // 递归更新属性， 比较孩子
            oldStartVnode = oldChildren[++oldStartIndex]
            newStartVnode = newChildren[++newStartIndex]
        }else if(isSameVNode(oldEndVnode, newEndVnode)) { // 如果尾指针指向的vnode一样的话
            patch(oldEndVnode, newEndVnode); // 递归更新属性， 比较孩子
            oldEndVnode = oldChildren[--oldEndIndex];
            newEndVnode = newChildren[--newEndIndex]
        }else if(isSameVNode(oldStartVnode, newEndVnode)) { // 倒叙
            patch(oldEndVnode, newEndVnode); // 递归更新属性， 比较孩子
            parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSilbing)
            oldStartVnode = oldChildren[++oldStartIndex]
            newEndVnode = newChildren[--newEndIndex]
        }else if(isSameVNode(oldEndVnode, newStartVnode)) { // 老的尾比新的头。 老得尾移动到新的头
            patch(oldEndVnode, newStartVnode); // 递归更新属性， 比较孩子
            // 将旧的最后一个插入到最前面
            parent.insertBefore(oldEndVnode.el, oldStartVnode.el)
            // 旧的往前移动
            oldEndVnode = oldChildren[--oldEndIndex];
            // 新的往后移
            newStartVnode = newChildren[++newStartIndex]
        }else  {  // 两个列表， 乱序， 不复用
            // 会先拿新节点的第一项，  去老节点中匹配， 如果匹配不到， 直接将这个节点插入到老节点开头的前面
            // 如果能查到， 则直接移动老节点
            // 最后可能老节点中还有剩余， 则直接删除老节点中剩余的节点
            let moveIndex = map[newStartVnode.key]; 

            if(moveIndex == undefined) {
                // 如果没有找到的话， 插入到当前位置之前
                parent.insertBefore(createElm(newStartVnode), oldStartVnode.el);
            }else {
                // 移动这个元素
                let moveVnode = oldChildren[moveIndex]
                // 避免数组塌陷问题， 旧位置需要变为一个undefined
                oldChildren[moveIndex] = undefined;
                // 插入到目标元素之前
                parent.insertBefore(moveVnode.el, oldStartVnode.el);

                patch(moveVnode, newStartVnode); // 递归更新属性， 比较孩子
            }
            // 新节点的指针向后移动
            newStartVnode = newChildren[++newStartIndex]
        }
    }

    // 如果到最后还剩余的话， 那么直接插入
    if(newStartIndex <= newEndIndex) {
        for(let i = newStartIndex; i <= newEndIndex; i++) {
            // 参考元素 即要插入的元素
            let ele = newChildren[newEndIndex+1] == null ? null : newChildren[newEndIndex+1].el
            // 可能是往前面插入， 也可能是往后面插入
            // parent.appendChild(createElm(newChildren[i]))

            parent.insertBefore(createElm(newChildren[i]), ele)
        }
    }

    // 如果老得索引 <= 老得结束指针
    if(oldStartIndex <= oldEndIndex) {
        for(let i = oldStartIndex; i <= oldEndIndex; i++) {
            let child = oldChildren[i];
            if(child != undefined) {
                parent.removeChild(child.el)
            }
        }
    }

    // 循环的时候， 尽量不要使用索引作为key, 可能会导致重新创建当前元素的所有子元素
}


// 通过key
function makeIndexByKey(children) {
    let map = {};

    children.forEach((item, index) => {
        map[item.key] = index
    })

    return map
}

function isSameVNode(oldVnode, newVnode) {
    // 如果两个节点的标签和key一样， 则认为是同一个节点， 那么可以复用真实节点
    return (oldVnode.tag === newVnode.tag) && (oldVnode.key === newVnode.key)
}