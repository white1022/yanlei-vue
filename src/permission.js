import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // 开始进度条
  NProgress.start()

  // 设置页面标题
  document.title = getPageTitle(to.meta.title)

  // 判断用户是否已登录
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // 如果已登录，则重定向到主页
      next({ path: '/' })
      NProgress.done() // hack: https://github.com/PanJiaChen/vue-element-admin/pull/2939
    } else {
      // 通过getInfo判断是否获取到用户信息
      const hasGetAdminInfo = store.getters.name && store.getters.name.length > 0
      if (hasGetAdminInfo) {
        next()
      } else {
        try {
          // 获取个人信息
          await store.dispatch('admin/getInfo')

          // 获取权限菜单
          // 注意:菜单必须是一个对象数组!如: [{"id": 63,"pid": 0,"title": "控制台","icon": "layui-icon-component","jump": "/","spread": false}, {}, ...]
          const menus = await store.dispatch('admin/getMenus')
          // 404页必须放在最后 !!!
          menus.push({ path: '*', redirect: '/404', hidden: true })

          // 根据菜单生成可访问路由映射
          const accessRoutes = await store.dispatch('permission/generateRoutes', menus)

          // 动态添加可访问路由
          router.addRoutes(accessRoutes)

          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          next({ ...to, replace: true })
        } catch (error) {
          // 删除令牌并转到登录页面重新登录
          await store.dispatch('admin/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    // 没有令牌
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单中，直接进入
      next()
    } else {
      // 其他没有访问权限的页面被重定向到登录页面
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // 完成进度条
  NProgress.done()
})
