import { login, getMenus, getInfo } from '@/api/admin'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  introduction: ''
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  }
}

const actions = {
  // 登录
  login({ commit }, adminInfo) {
    const { email, password } = adminInfo
    return new Promise((resolve, reject) => {
      login({ email: email.trim(), password: password }).then(response => {
        const { data } = response
        data.token && (data.token = 'Bearer ' + data.token)
        commit('SET_TOKEN', data.token) // vuex存储token
        setToken(data.token) // cookie存储token
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 获取个人信息
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          reject('获取用户信息失败，请重新登录。')
        }

        const { name, avatar, introduction } = data

        commit('SET_NAME', name)
        commit('SET_AVATAR', process.env.VUE_APP_STORAGE_DOMAIN + avatar)
        commit('SET_INTRODUCTION', introduction)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 获取权限菜单（由服务端生成的）
  getMenus({ commit, state }) {
    return new Promise((resolve, reject) => {
      getMenus(state.token).then(response => {
        const { data } = response

        if (!data) {
          reject('获取权限菜单失败，请重新登录。')
        }

        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 退出登录
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      try {
        commit('SET_TOKEN', '')
        removeToken()
        resetRouter()

        // reset visited views and cached views
        // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
        dispatch('tagsView/delAllViews', null, { root: true })

        resolve()
      } catch (error) {
        reject(error)
      }
    })
  },

  // 删除token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      removeToken()
      resolve()
    })
  },

  // 动态修改权限
  async changePermissionRoutes({ commit, dispatch }, role) {
    const menus = await dispatch('getMenus')

    resetRouter()

    // 根据菜单生成可访问路由映射
    const accessRoutes = await dispatch('permission/generateRoutes', menus, { root: true })
    // 动态添加可访问路由
    router.addRoutes(accessRoutes)

    // 重置访问过的视图和缓存的视图
    dispatch('tagsView/delAllViews', null, { root: true })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
