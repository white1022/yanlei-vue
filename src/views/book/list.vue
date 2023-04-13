<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.title"
        placeholder="书名"
        style="width:200px"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
        @blur="handleFilter"
      />
    </div>
    <el-table />
    <pagination :total="0" />
  </div>
</template>
<script>
import Pagination from '@/components/Pagination/index.vue'

export default {
  components: { Pagination },
  data() {
    return {
      listQuery: {}
    }
  },
  methods: {
    handleFilter() {
      console.log('handleFilter')
    }

  }
}
</script>

<style lang="scss" scoped>
</style>
