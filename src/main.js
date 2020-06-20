import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
/* eslint-disable no-unused-vars */

// 导入全局样式表
import './assets/css/global.css'

// 导入字体图标
import './assets/font_1891662_ejo2y4xfx79/iconfont.css'

import axios from 'axios'
import qs from 'qs'
Vue.use(qs)

// 配置请求的根路径
axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'
axios.interceptors.requset.use(config => {
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios
Vue.use(ElementUI)
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
