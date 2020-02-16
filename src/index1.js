import { h, render, patch } from '../source/vue/virtual-dom/index'


let oldVnode = h('div', {id: 'container', style: {background: 'red'}, key: 1},
    h('li', {style: {background: '#0fc'}, key: 'a'}, 'a'),
    h('li', {style: {background: '#fc0'}, key: 'b'}, 'b'),
    h('li', {style: {background: '#0cf'}, key: 'c'}, 'c'),
    h('li', {style: {background: '#c0f'}, key: 'd'}, 'd'),
)

const container = document.getElementById('app');

render(oldVnode, container)


let newVnode = h('div', {id: 'aaa'}, 
        h('li', {style: {background: '#c1f'}, key: 'e'}, 'e'),
        h('li', {style: {background: '#0fc'}, key: 'a'}, 'a'),
        h('li', {style: {background: '#c0f'}, key: 'f'}, 'f'),
        h('li', {style: {background: '#0cf'}, key: 'c'}, 'c'),
        h('li', {style: {background: '#fc2'}, key: 'n'}, 'n'),
)

setTimeout(() => {
    patch(oldVnode, newVnode)
}, 1000)



