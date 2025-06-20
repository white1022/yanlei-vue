import request from '@/utils/request'

export function getRules() {
  return request({
    url: '/admin/role/rule',
    method: 'get'
  })
}

export function list(query) {
  return request({
    url: '/admin/role/lists',
    method: 'get',
    params: query
  })
}

export function add(data) {
  return request({
    url: '/admin/role/add',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/admin/role/edit',
    method: 'post',
    data
  })
}

export function deletes(data) {
  return request({
    url: '/admin/role/delete',
    method: 'post',
    data
  })
}
