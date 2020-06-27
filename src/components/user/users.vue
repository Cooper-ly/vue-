
<template>
  <!-- eslint-disable -->
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 内容区域 -->
    <el-card class="box-card">
      <!-- 搜搜区域 -->
      <el-row :gutter="20">
        <el-col :span="8">

          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            class="input-with-select"
            @input="change($event)"
            clearable
            @clear="getUserList"
          >

            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="16">
          <el-button
            type="primary"
            class="adduser"
            @click="addDialogVisible = true"
          >添加用户</el-button>
        </el-col>

      </el-row>
      <!-- 用户列表 -->
      <el-table
        :data="userList"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column type="index">
        </el-table-column>
        <el-table-column
          prop="username"
          label="姓名"
        >
        </el-table-column>

        <el-table-column
          prop="email"
          label="邮箱"
        >
        </el-table-column>

        <el-table-column
          prop="mobile"
          label="电话"
        >
        </el-table-column>

        <el-table-column
          prop="role_name"
          label="角色"
        >
        </el-table-column>
        <el-table-column
          label="状态"
          prop="mg_state"
        >
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>

        <el-table-column label="操作">
          <!--  eslint-disable-next-line  -->
          <template slot-scope="scope">

            <!-- 修改用户 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editDialogVisible(scope.row.id)"
            ></el-button>

            <!-- 删除用户 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>

            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用户 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >

      <el-form
        ref="addFormRef"
        :model="addUserForm"
        label-width="70px"
        :rules="addFormRules"
      >
        <el-form-item
          label="用户名"
          prop="username"
        >
          <el-input
            v-model="addUserForm.username"
            @input="change($event)"
          ></el-input>
        </el-form-item>

        <el-form-item
          label="密码"
          prop="password"
        >
          <el-input
            v-model="addUserForm.password"
            @input="change($event)"
            type="password"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="邮箱"
          prop="useremail"
        >
          <el-input
            v-model="addUserForm.useremail"
            @input="change($event)"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="手机"
          prop="usermobile"
        >
          <el-input
            v-model="addUserForm.usermobile"
            @input="change($event)"
          ></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="addUser"
        >确 定</el-button>
      </div>
    </el-dialog>

    <!-- 修改用户 -->
    <el-dialog
      title="修改用户"
      :visible.sync="showDialogVisible"
      width="50%"
      @close="editFormClosed"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        label-width="70px"
        :rules="editFormRules"
      >
        <el-form-item label="姓名">
          <el-input
            v-model="editForm.username"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item
          label="手机"
          prop="mobile"
        >
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
        <el-form-item
          label="邮箱"
          prop="email"
        >
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button @click="showDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="editUserInfo"
        >确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 校验邮箱规则
    const checkEmail = (rule, value, callback) => {
      const regEmail = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的邮箱'))
    }
    // 校验手机号规则
    const checkMobile = (rule, value, callback) => {
      const regMobile = /^[1][3,4,5,7,8,9][0-9]{9}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的手机号'))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      addUserForm: {
        username: '',
        password: '',
        useremail: '',
        usermobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { require: true, min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { require: true, min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }

        ],
        useremail: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }

        ],
        usermobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }

        ]
      },
      showDialogVisible: false,
      editForm: {},
      editFormRules: {
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }

        ],
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }

        ]
      }

    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    // 获取用户列表数据
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
      this.userList = res.data.users
      this.total = res.data.total
      // console.log('total:' + this.total)
      // console.log(this.userList)
    },
    // 更改页面数据条数
    handleSizeChange (newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 页面跳转
    handleCurrentChange (newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 更改用户状态
    async userStateChanged (userinfo) {
      console.log(userinfo)

      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      console.log(res)

      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    // 强制input刷新
    change (e) {
      this.$forceUpdate()
    },
    // 增加用户模态框关闭后刷新
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户
    addUser () {
      // 添加用户信息
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return false
        const { data: res } = await this.$http.post('users', this.addUserForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        // 添加成功后隐藏模态框
        this.addDialogVisible = false
        // 重新获取用户列表数据
        this.getUserList()
        console.log(this.addUserform)
      })
    },

    // 修改用户信息
    async editDialogVisible (id) {
      const { data: res } = await this.$http.get(`users/${id}`)
      console.dir('res' + res)
      console.dir('data' + res.data)

      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.editForm = res.data
      this.showDialogVisible = true
    },

    // 修改表单数据重置
    editFormClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 提交修改用户表单
    editUserInfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.put(`users/${this.editForm.id}`, {
          mobile: this.editForm.mobile,
          email: this.editForm.email
        })
        if (res.meta.status !== 200) return this.$message.error('修改用户信息失败')

        // 关闭对话框
        this.showDialogVisible = false
        // 刷新列表数据
        this.getUserList()
        // 成功修改提示
        this.$message.success('修改用户信息成功')
      })
    },
    removeUserById (id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`users/${id}`)
        this.getUserList()
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }

  }
}
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
.el-pagination {
  margin-top: 15px;
}
.adduser {
  float: right;
  margin-right: 40px;
}
</style>
