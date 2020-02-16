// ?:匹配不捕获 不捕获当前分组
// + 至少一个
// ? 尽可能少匹配
const defaultRe = /\{\{((?:.|\r?\n)+?)\}\}/

const utils = {
    getValue(vm, expr) {
        let keys = expr.split('.')
        let value;
        // reduce具备迭代的功能
        keys.reduce((memo, current) => {
            value = memo = memo[current.trim()]
            return memo
        }, vm)

        return JSON.stringify(value)
    },
    // 编译文本 替换{{}}
    compilerText(node, vm) {
        if(!node.expr) {
            node.expr = node.textContent
        }
        // let expr
        node.textContent = node.expr.replace(defaultRe, function(...args) {
            return utils.getValue(vm, args[1])
        })
    }
}

export default utils