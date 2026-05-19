import Vue from 'vue'
import Router from 'vue-router'
import Editor from '@/components/editor/Editor.vue'
import Simulator from '@/components/simulator/Simulator.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/editor',
      name: 'editor',
      component: Editor
    },
    {
      path: '/simulator',
      name: 'simulator',
      component: Simulator
    },
    {
      path: '*',
      redirect: '/editor'
    }
  ]
})
