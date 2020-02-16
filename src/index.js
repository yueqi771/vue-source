import Vue from 'vue'

window.vm = new Vue({
    el: "#app",
    data() {
        return {
            message: "越祈"
        }
    },
    render(h) {
        return h('p', {id: 'a'}, this.message)
    }
})

setTimeout(() => {
    vm.message = '流翼'
}, 1000)