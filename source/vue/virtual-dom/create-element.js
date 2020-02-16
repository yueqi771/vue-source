function vnode(tag, props, key, children, text) {
    return {
        tag, // 当前的标签名
        props, // 当前标签上的属性
        key, // 唯一表示
        children,
        text
    }
}

export {
    vnode
}