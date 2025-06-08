<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="listQuery">
        <el-form-item label="名称">
          <el-input v-model="listQuery.name" placeholder="请输入" @keyup.enter.native="handleFilter" />
        </el-form-item>

        <el-form-item label="是否启用">
          <el-select v-model="listQuery.is_use" placeholder="请选择" clearable>
            <el-option value="1" label="是" />
            <el-option value="2" label="否" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button v-waves type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div style="margin-top: 10px; margin-bottom: 10px">
      <el-button-group>
        <el-button type="primary" size="small" @click="handleAdd">添加</el-button>
        <el-button type="primary" size="small" @click="handleMoreDelete">删除</el-button>
      </el-button-group>
    </div>

    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" fixed="left" align="center" />
      <el-table-column label="主键" width="100" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column label="名称" min-width="180" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="规则" min-width="180" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.rules }}</span>
        </template>
      </el-table-column>

      <el-table-column label="是否启用" min-width="180" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.is_use | isUseFilter">
            {{ row.is_use == 1 ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="创建时间" min-width="180" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.create_time }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200" fixed="right" align="center">
        <template slot-scope="{row,$index}">
          <el-button-group>
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="primary" size="small" @click="handleDelete(row,$index)">
              删除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="auto" style="width: 400px; margin-left:50px;">
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name" placeholder="请输入" />
        </el-form-item>

        <el-form-item label="规则" prop="rules">
          <el-tree
            ref="tree"
            :data="ruleList"
            show-checkbox
            node-key="id"
            highlight-current
            :props="{
              children: 'children',
              label: function(data, node) {
                return data.meta.title
              }
            }"
          />
        </el-form-item>

        <el-form-item label="是否启用" prop="is_use">
          <el-radio v-model="temp.is_use" :label="1">是</el-radio>
          <el-radio v-model="temp.is_use" :label="2">否</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?addData():editData()">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getRules, list, add, edit, deletes } from '@/api/role'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'RoleList',
  components: { Pagination },
  directives: { waves },
  filters: {
    isUseFilter(is_use) {
      const isUseMap = {
        1: 'success',
        2: 'danger'
      }
      return isUseMap[is_use]
    }
  },
  data() {
    return {
      ruleList: null,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        name: undefined,
        is_use: undefined
      },
      selectedId: [],
      temp: {},
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '添加'
      },
      rules: {
        name: [{ type: 'string', required: true, message: '不能为空', trigger: 'blur' }],
        rules: [{ type: 'string', required: true, message: '不能为空', trigger: 'chang' }],
        is_use: [{ type: 'enum', enum: [1, 2], required: true, message: '不能为空', trigger: 'chang' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      list(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.count
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    getAllRule() {
      this.listLoading = true
      getRules().then(response => {
        this.ruleList = response.data
        this.listLoading = false
      })
    },
    handleAdd() {
      this.getAllRule()
      this.temp = {
        id: undefined,
        name: '',
        rules: '',
        is_use: 2
      }
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
        this.$refs.tree.setCheckedKeys([]) // 注意：setCheckedKeys需要在dom更新结束后执行所以放在nextTick函数里
      })
    },
    addData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.rules = this.$refs.tree.getCheckedKeys().join(',') // 数组转字符串
          add(this.temp).then(response => {
            // this.list.unshift(this.temp)
            this.getList() // 重载表格
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: response.message,
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleEdit(row) {
      this.getAllRule()
      this.temp = Object.assign({}, row)
      delete this.temp.create_time
      delete this.temp.update_time
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
        this.$refs.tree.setCheckedKeys(this.temp.rules.split(',').map(Number)) // 字符串转数组数字，注意：setCheckedKeys需要在dom更新结束后执行所以放在nextTick函数里
      })
    },
    editData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.rules = this.$refs.tree.getCheckedKeys().join(',') // 数组转字符串
          edit(this.temp).then(response => {
            // const index = this.list.findIndex(v => v.id === this.temp.id)
            // this.list.splice(index, 1, this.temp)
            this.getList() // 重载表格
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: response.message,
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleSelectionChange(val) {
      this.selectedId = []
      for (const item of val) {
        this.selectedId.push(item.id)
      }
    },
    handleDelete(row, index) {
      this.$confirm('确定删除该行吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = row.id.toString()
        deletes({ id: ids }).then(response => {
          // this.list.splice(index, 1)
          this.getList() // 重载表格
          this.$notify({
            title: 'Success',
            message: response.message,
            type: 'success',
            duration: 2000
          })
        })
      }).catch(() => {
        this.$message({
          showClose: true,
          message: '已取消删除',
          type: 'info'
        })
      })
    },
    handleMoreDelete() {
      this.$confirm('确定删除选中行吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = this.selectedId.join(',')
        deletes({ id: ids }).then(response => {
          this.getList() // 重载表格
          this.$notify({
            title: 'Success',
            message: response.message,
            type: 'success',
            duration: 2000
          })
        })
      }).catch(() => {
        this.$message({
          showClose: true,
          message: '已取消删除',
          type: 'info'
        })
      })
    }
  }
}
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
