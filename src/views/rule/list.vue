<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="listQuery">
        <el-form-item label="标题">
          <el-input v-model="listQuery.title" placeholder="请输入" @keyup.enter.native="handleFilter" />
        </el-form-item>

        <el-form-item label="路径">
          <el-input v-model="listQuery.path" placeholder="请输入" @keyup.enter.native="handleFilter" />
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

      <el-table-column label="路径" min-width="180" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.path }}</span>
        </template>
      </el-table-column>

      <el-table-column label="组件" min-width="180" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.component }}</span>
        </template>
      </el-table-column>

      <el-table-column label="元数据" min-width="180" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.meta }}</span>
        </template>
      </el-table-column>

      <el-table-column label="重定向" min-width="180" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.redirect }}</span>
        </template>
      </el-table-column>

      <el-table-column label="是否不在侧边栏显示" min-width="180" align="center">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.hidden"
            active-color="#409eff"
            inactive-color="#dcdfe6"
            active-text="是"
            inactive-text="否"
            :active-value="true"
            :inactive-value="false"
            disabled
          />
        </template>
      </el-table-column>

      <el-table-column label="是否一直显示根路由" min-width="180" align="center">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.always_show"
            active-color="#409eff"
            inactive-color="#dcdfe6"
            active-text="是"
            inactive-text="否"
            :active-value="true"
            :inactive-value="false"
            disabled
          />
        </template>
      </el-table-column>

      <el-table-column label="排序" min-width="180" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.sort }}</span>
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
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="auto" style="width: 600px; margin-left:50px;">
        <el-form-item label="父级菜单" prop="pid">
          <el-select v-model="temp.pid" placeholder="请选择" clearable filterable>
            <el-option :value="0" label="请选择" />
            <el-option v-for="(item, index) in pids" :key="index" :label="item" :value="parseInt(index)" />
          </el-select>
        </el-form-item>

        <el-form-item label="路由名称" prop="name">
          <el-input v-model="temp.name" placeholder="请输入" />
        </el-form-item>

        <el-form-item label="URL路径" prop="path">
          <el-input v-model="temp.path" placeholder="请输入" style="width: 75%;" />
          <el-tooltip effect="dark" content="不以/开头时，会继承父级菜单的路径（第一级菜单需要以/开头）。" placement="top-start" style="margin-left:10px;">
            <i class="el-icon-info" />
          </el-tooltip>
        </el-form-item>

        <el-form-item label="路由组件" prop="component">
          <el-input v-model="temp.component" placeholder="请输入" style="width: 75%;" />
          <el-tooltip effect="dark" placement="top-start" style="margin-left:10px;">
            <template slot="content">
              <div>
                <p>在多级菜单中，</p>
                <p>第一级是layout/index组件（可以使用Layout表示，因为在写组件映射时做了判断），</p>
                <p>中间级都是views/empty/index组件，</p>
                <p>最后一级才是视图组件。</p>
              </div>
            </template>
            <i class="el-icon-info" />
          </el-tooltip>
        </el-form-item>

        <el-form-item label="元数据 · 标题" prop="meta.title">
          <el-input v-model="temp.meta.title" placeholder="请输入" />
        </el-form-item>

        <el-form-item label="元数据 · 图标" prop="meta.icon">
          <el-input v-model="temp.meta.icon" :readonly="true" placeholder="请输入" style="width: 75%;" />
          <el-button type="primary" style="margin-left:10px;">选择</el-button>
        </el-form-item>

        <el-form-item label="元数据 · 是否不被keep-alive缓存" prop="meta.noCache">
          <el-switch
            v-model="temp.meta.noCache"
            active-color="#409eff"
            inactive-color="#dcdfe6"
            active-text="是"
            inactive-text="否"
            :active-value="true"
            :inactive-value="false"
          />
        </el-form-item>

        <el-form-item label="元数据 · 是否在面包屑中显示" prop="meta.breadcrumb">
          <el-switch
            v-model="temp.meta.breadcrumb"
            active-color="#409eff"
            inactive-color="#dcdfe6"
            active-text="是"
            inactive-text="否"
            :active-value="true"
            :inactive-value="false"
          />
        </el-form-item>

        <el-form-item label="元数据 · 是否固定在tags-view中" prop="meta.affix">
          <el-switch
            v-model="temp.meta.affix"
            active-color="#409eff"
            inactive-color="#dcdfe6"
            active-text="是"
            inactive-text="否"
            :active-value="true"
            :inactive-value="false"
          />
        </el-form-item>

        <el-form-item label="元数据 · 高亮相对应的侧边栏" prop="meta.activeMenu">
          <el-input v-model="temp.meta.activeMenu" placeholder="请输入" style="width: 75%;" />
          <el-tooltip effect="dark" content="当路由设置了该属性，则会高亮相对应的侧边栏。" placement="top-start" style="margin-left:10px;">
            <i class="el-icon-info" />
          </el-tooltip>
        </el-form-item>

        <el-form-item label="重定向" prop="redirect">
          <el-input v-model="temp.redirect" placeholder="请输入" style="width: 75%;" />
          <el-tooltip effect="dark" content="在面包屑中点击会重定向去的地址，当设置为noRedirect的时候该路由在面包屑导航中不可被点击。" placement="top-start" style="margin-left:10px;">
            <i class="el-icon-info" />
          </el-tooltip>
        </el-form-item>

        <el-form-item label="是否不在侧边栏显示" prop="hidden">
          <el-switch
            v-model="temp.hidden"
            active-color="#409eff"
            inactive-color="#dcdfe6"
            active-text="是"
            inactive-text="否"
            :active-value="true"
            :inactive-value="false"
          />
        </el-form-item>

        <el-form-item label="是否一直显示根路由" prop="always_show">
          <el-switch
            v-model="temp.always_show"
            active-color="#409eff"
            inactive-color="#dcdfe6"
            active-text="是"
            inactive-text="否"
            :active-value="true"
            :inactive-value="false"
          />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input v-model="temp.sort" type="number" placeholder="请输入" />
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
import { getPids, list, add, edit, deletes } from '@/api/rule'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'RuleList',
  components: { Pagination },
  directives: { waves },
  filters: {},
  data() {
    return {
      pids: null,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        title: undefined,
        path: undefined
      },
      selectedId: [],
      temp: {
        meta: {}
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '添加'
      },
      rules: {
        pid: [{ type: 'number', required: true, message: '不能为空', trigger: 'chang' }],
        name: [{ type: 'string', required: true, message: '不能为空', trigger: 'blur' }],
        path: [{ type: 'string', required: true, message: '不能为空', trigger: 'blur' }],
        component: [{ type: 'string', required: true, message: '不能为空', trigger: 'blur' }],
        meta: {
          title: [{ type: 'string', required: true, message: '不能为空', trigger: 'blur' }],
          icon: [{ type: 'string', required: true, message: '不能为空', trigger: 'blur' }],
          noCache: [{ type: 'enum', enum: [true, false], required: true, message: '不在枚举值中', trigger: 'blur' }],
          breadcrumb: [{ type: 'enum', enum: [true, false], required: true, message: '不在枚举值中', trigger: 'blur' }],
          affix: [{ type: 'enum', enum: [true, false], required: true, message: '不在枚举值中', trigger: 'blur' }],
          activeMenu: [{ type: 'string', message: '不能为空', trigger: 'blur' }]
        },
        redirect: [{ type: 'string', required: true, message: '不能为空', trigger: 'blur' }],
        hidden: [{ type: 'enum', enum: [true, false], required: true, message: '不在枚举值中', trigger: 'blur' }],
        always_show: [{ type: 'enum', enum: [true, false], required: true, message: '不在枚举值中', trigger: 'blur' }],
        sort: [{ type: 'number', required: true, message: '不能为空', trigger: 'blur' }]
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
    getAllPid() {
      this.listLoading = true
      getPids().then(response => {
        this.pids = response.data
        this.listLoading = false
      })
    },
    handleAdd() {
      this.getAllPid()
      this.temp = {
        id: undefined,
        pid: 0,
        name: '',
        path: '',
        component: '',
        meta: {
          title: '',
          icon: 'el-icon-menu',
          noCache: false,
          breadcrumb: true,
          affix: false,
          activeMenu: ''
        },
        redirect: 'noRedirect',
        hidden: false,
        always_show: true,
        sort: 100
      }
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    addData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
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
      this.getAllPid()
      this.temp = Object.assign({}, row)
      delete this.temp.create_time
      delete this.temp.update_time
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    editData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
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
