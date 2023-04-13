import request from '@/utils/request'

export function createBook(book) {
  return request({
    url: '/admin/index/create',
    method: 'post',
    data: book
  })
}

export function updateBook(book) {
  return request({
    url: '/admin/index/update',
    method: 'post',
    data: book
  })
}

export function getBook(fileName) {
  return request({
    url: '/admin/index/get',
    method: 'get',
    params: { fileName }
  })
}

