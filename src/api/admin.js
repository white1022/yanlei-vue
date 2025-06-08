import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/admin/login/login',
    method: 'post',
    data
  })
}

export function getMenus() {
  return request({
    url: '/admin/admin/getMenu',
    method: 'get'
  })
}

export function getInfo() {
  return request({
    url: '/admin/admin/info',
    method: 'get'
  })
}

export function getRoles() {
  return request({
    url: '/admin/admin/role',
    method: 'get'
  })
}

export function list(query) {
  return request({
    url: '/admin/admin/lists',
    method: 'get',
    params: query
  })
}

export function add(data) {
  return request({
    url: '/admin/admin/add',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/admin/admin/edit',
    method: 'post',
    data
  })
}

export function deletes(data) {
  return request({
    url: '/admin/admin/delete',
    method: 'post',
    data
  })
}

export function changePassword(data) {
  return request({
    url: '/admin/admin/password',
    method: 'post',
    data
  })
}
