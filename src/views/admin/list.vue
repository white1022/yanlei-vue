<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="listQuery">
        <el-form-item label="昵称">
          <el-input v-model="listQuery.nickname" placeholder="请输入" @keyup.enter.native="handleFilter" />
        </el-form-item>

        <el-form-item label="邮箱">
          <el-input v-model="listQuery.email" placeholder="请输入" @keyup.enter.native="handleFilter" />
        </el-form-item>

        <el-form-item label="手机号">
          <el-input v-model="listQuery.mobile" placeholder="请输入" @keyup.enter.native="handleFilter" />
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

      <el-table-column label="昵称" min-width="180" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.nickname }}</span>
        </template>
      </el-table-column>

      <el-table-column label="头像" min-width="180" align="center">
        <template slot-scope="scope">
          <el-avatar :src="$storageDomain + scope.row.avatar" />
        </template>
      </el-table-column>

      <el-table-column label="邮箱" min-width="180" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.email }}</span>
        </template>
      </el-table-column>

      <el-table-column label="手机号" min-width="180" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.mobile }}</span>
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

      <el-table-column label="操作" width="250" fixed="right" align="center">
        <template slot-scope="{row,$index}">
          <el-button-group>
            <el-button type="primary" size="small" @click="handleChangePassword(row)">
              修改密码
            </el-button>
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
        <el-form-item label="邮箱账号" prop="email">
          <el-input v-model="temp.email" placeholder="请输入" />
        </el-form-item>

        <el-form-item v-if="dialogStatus === 'create'" label="账号密码" prop="password">
          <el-input v-model="temp.password" placeholder="请输入" />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-checkbox-group v-model="temp.role">
            <el-checkbox v-for="(item, index) in roles" :key="index" :label="parseInt(index)">{{ item }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="temp.nickname" placeholder="请输入" />
        </el-form-item>

        <el-form-item label="姓名" prop="name">
          <el-input v-model="temp.name" placeholder="请输入" />
        </el-form-item>

        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="temp.mobile" placeholder="请输入" />
        </el-form-item>

        <el-form-item label="头像" prop="avatar">
          <el-input v-model="temp.avatar" :readonly="true" placeholder="请输入" style="width: 75%;" />
          <el-upload
            :action="$baseApi + '/admin/oss/upload'"
            name="file"
            accept="image/*"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            style="display: inline-block; margin-left:10px;"
          >
            <el-button type="primary">上传</el-button>
          </el-upload>
        </el-form-item>

        <el-form-item label="简介" prop="introduction">
          <el-input v-model="temp.introduction" :autosize="{ minRows: 5, maxRows: 15}" type="textarea" placeholder="请输入" />
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
import { getRoles, list, add, edit, deletes, changePassword } from '@/api/admin'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'AdminList',
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
      roles: null,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        nickname: undefined,
        email: undefined,
        mobile: undefined,
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
        email: [{ type: 'string', required: true, message: '不能为空', trigger: 'blur' }],
        password: [{ type: 'string', required: true, message: '不能为空', trigger: 'blur' }],
        role: [{ type: 'array', required: true, message: '不能为空', trigger: 'chang' }],
        nickname: [{ type: 'string', required: true, message: '不能为空', trigger: 'blur' }],
        name: [{ type: 'string', required: true, message: '不能为空', trigger: 'blur' }],
        mobile: [{ type: 'string', required: true, message: '不能为空', trigger: 'blur' }],
        avatar: [{ type: 'string', required: true, message: '不能为空', trigger: 'blur' }],
        introduction: [{ type: 'string', required: true, message: '不能为空', trigger: 'blur' }],
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
    getAllRole() {
      this.listLoading = true
      getRoles().then(response => {
        this.roles = response.data
        this.listLoading = false
      })
    },
    handleAvatarSuccess(res, file) {
      this.listLoading = false
      if (res.code === 200) {
        this.temp.avatar = res.data.url
      }
      this.$message({
        showClose: true,
        message: res.message,
        type: 'success'
      })
    },
    beforeAvatarUpload(file) {
      this.listLoading = true
    },
    handleAdd() {
      this.getAllRole()
      this.temp = {
        id: undefined,
        email: '',
        password: '',
        role: [],
        nickname: '',
        name: '',
        mobile: '',
        avatar: '',
        introduction: '',
        is_use: 2
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
      this.getAllRole()
      this.temp = Object.assign({}, row)
      delete this.temp.password
      delete this.temp.create_time
      delete this.temp.update_time
      this.temp.role = this.temp.role.map((item) => {
        return item.id
      })
      // const role = []
      // for (const item of this.temp.role) {
      //   role.push(item.id.toString())
      // }
      // this.temp.role = role
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
    },
    handleChangePassword(row) {
      this.$prompt('请输入新密码，并确认', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        const password = value
        this.$prompt('再次输入新密码，并确认', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(({ value }) => {
          const confirm_password = value
          if (password === confirm_password) {
            changePassword({ id: row.id, password: password, confirm_password: confirm_password }).then(response => {
              this.$notify({
                title: 'Success',
                message: response.message,
                type: 'success',
                duration: 2000
              })
            })
          } else {
            this.$message({
              showClose: true,
              message: '两次输入密码不一致，请确认后再试',
              type: 'warning'
            })
          }
        }).catch(() => {
          this.$message({
            showClose: true,
            message: '已取消输入',
            type: 'info'
          })
        })
      }).catch(() => {
        this.$message({
          showClose: true,
          message: '已取消输入',
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
