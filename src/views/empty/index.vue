<!-- 为了路由表 component 参数不能为空，给一个空的组件文件，使该组件作为子组件的父组件 -->
<!-- https://panjiachen.github.io/vue-element-admin-site/zh/guide/essentials/router-and-nav.html#%E5%A4%9A%E7%BA%A7%E7%9B%AE%E5%BD%95-%E5%B5%8C%E5%A5%97%E8%B7%AF%E7%94%B1 -->
<template>
  <div style="padding:30px;">
    <router-view />
  </div>
</template>
