<template>
  <el-form ref="postForm" :model="postForm" :rules="rules">
    <sticky :class-name="'sub-navbar'">
      <el-button v-if="!isEdit" @click="showGuide">显示帮助</el-button>
      <el-button v-loading="loading" type="success" style="margin-left:10px" @click="submitForm">
        {{ isEdit ? '编辑电子书' : '新增电子书' }}
      </el-button>
    </sticky>
    <div class="detail-container">
      <el-row>
        <warning />
        <el-col :span="24">
          <ebook-upload
            :file-list="fileLists"
            :disabled="isEdit"
            @onSuccess="onUploadSuccess"
            @onRemove="onUploadRemove"
          />
        </el-col>
        <el-col :span="24">
          <el-form-item prop="title">
            <m-dinput v-model="postForm.title" :maxlength="100" name="name" required>
              书名
            </m-dinput>
          </el-form-item>
          <el-row>
            <el-col :span="12">
              <el-form-item prop="author" label="作者：" :label-width="labelWidth">
                <el-input v-model="postForm.author" placeholder="作者" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="publisher" label="出版社：" :label-width="labelWidth">
                <el-input v-model="postForm.publisher" placeholder="出版社" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item prop="language" label="语言：" :label-width="labelWidth">
                <el-input v-model="postForm.language" placeholder="语言" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="rootFile" label="根文件：" :label-width="labelWidth">
                <el-input v-model="postForm.rootFile" placeholder="根文件" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item prop="filePath" label="文件路径：" :label-width="labelWidth">
                <el-input v-model="postForm.filePath" placeholder="文件路径" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="unzipPath" label="解压路径：" :label-width="labelWidth">
                <el-input v-model="postForm.unzipPath" placeholder="解压路径" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item prop="coverPath" label="封面路径：" :label-width="labelWidth">
                <el-input v-model="postForm.coverPath" placeholder="封面路径" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="originalName" label="文件名称：" :label-width="labelWidth">
                <el-input v-model="postForm.originalName" placeholder="文件名称" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item prop="cover" label="封面：" :label-width="labelWidth">
                <a v-if="postForm.cover" :href="postForm.cover" target="_blank">
                  <img :src="postForm.cover" class="preview-img">
                </a>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item prop="contents" label="目录：" :label-width="labelWidth">
                <div v-if="postForm.contents && postForm.contents.length > 0" class="contents-wrapper">
                  <el-tree />
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>
  </el-form>
</template>

<script>
import Sticky from '@/components/Sticky/index.vue'
import Warning from './Warning.vue'
import EbookUpload from '@/components/EbookUpload/index.vue'
import MDinput from '@/components/MDinput/index.vue'
import { createBook, getBook, updateBook } from '@/api/book.js'

const fields = {
  title: '标题',
  author: '作者',
  publisher: '出版社',
  language: '语言'
}

export default {
  components: { Sticky, Warning, EbookUpload, MDinput },
  props: {
    isEdit: Boolean
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      // console.log(rule, value)
      if (value.length === 0) {
        callback(new Error(fields[rule.field] + '必须填写'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      postForm: {},
      fileLists: [],
      labelWidth: '120px',
      rules: {
        title: [{ validator: validateRequire }],
        author: [{ validator: validateRequire }],
        publisher: [{ validator: validateRequire }],
        language: [{ validator: validateRequire }]
      }
    }
  },
  created() {
    // console.log(this.$route.params)
    const fileName = this.$route.params.fileName
    this.getBookData(fileName)
  },
  methods: {
    getBookData(fileName) {
      getBook(fileName).then(response => {
        this.setData(response.data)
      })
    },
    setDefault() {
      this.fileLists = []
      this.$refs.postForm.resetFields()
    },
    setData(data) {
      const {
        title,
        author,
        publisher,
        language,
        rootFile,
        filePath,
        unzipPath,
        coverPath,
        originalName,
        cover,
        contents
      } = data
      this.postForm = {
        ...this.postForm,
        // title: data.title,
        title,
        author,
        publisher,
        language,
        rootFile,
        filePath,
        unzipPath,
        coverPath,
        originalName,
        cover,
        contents
      }
      this.fileLists = [{ name: originalName || 'food.jpg', url: 'https://xxx.cdn.com/xxx.jpg' }]
    },
    onUploadSuccess(data) {
      this.setData(data)
    },
    onUploadRemove() {
      this.setDefault()
    },
    submitForm() {
      const onSuccess = (response) => {
        const { data } = response
        this.$notify({
          title: '操作成功',
          message: data.message,
          type: 'success',
          duration: 2000
        })
        this.loading = false
      }
      if (!this.loading) {
        this.loading = true
        this.$refs.postForm.validate((valid, fields) => {
          // console.log(valid, fields)
          if (valid) {
            const book = Object.assign({}, this.postForm)
            // delete book.cover
            // delete book.contents
            if (!this.isEdit) {
              createBook(book).then(response => {
                // console.log(response)
                onSuccess(response)
                this.setDefault()
              }).catch(() => {
                this.loading = false
              })
            } else {
              updateBook(book).then(response => {
                // console.log(response)
                onSuccess(response)
              }).catch(() => {
                this.loading = false
              })
            }
          } else {
            const message = fields[Object.keys(fields)[0]][0].message
            this.$message({ message, type: 'error' })
            this.loading = false
          }
        })
      }
    },
    showGuide() {
      console.log('show guide...')
    }
  }
}
</script>

<style lang="scss" scoped>
  .detail-container {
    padding: 40px 50px 20px;
  }
  .preview-img {
    width: 200px;
    height: 270px;
  }
</style>
