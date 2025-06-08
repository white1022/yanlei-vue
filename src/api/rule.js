import request from '@/utils/request'

export function getPids() {
  return request({
    url: '/admin/rule/pid',
    method: 'get'
  })
}

export function list(query) {
  return request({
    url: '/admin/rule/lists',
    method: 'get',
    params: query
  })
}

export function add(data) {
  return request({
    url: '/admin/rule/add',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/admin/rule/edit',
    method: 'post',
    data
  })
}

export function deletes(data) {
  return request({
    url: '/admin/rule/delete',
    method: 'post',
    data
  })
}
