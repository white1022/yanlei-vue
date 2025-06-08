import { constantRoutes, componentMap } from '@/router'
import Layout from '@/layout'

/**
 * 通过递归将后端返回的菜单和本地的组件映射到一起
 * @param menus
 */
export function filterAsyncRoutes(menus) {
  const res = menus.filter(menu => {
    if (menu.component) {
      if (menu.component === 'Layout') { // Layout组件特殊处理
        menu.component = Layout
      } else {
        menu.component = componentMap(menu.component) // 导入组件
      }
    }
    if (menu.children && menu.children.length) {
      menu.children = filterAsyncRoutes(menu.children)
    }
    return true
  })
  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  // 根据菜单生成可访问路由映射
  generateRoutes({ commit }, menus) {
    return new Promise(resolve => {
      const accessedRoutes = filterAsyncRoutes(menus)
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
