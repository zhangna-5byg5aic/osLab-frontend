<template>
  <div class="form-container">
    <a-form
      ref="formRef"
      :rules="rules"
      :model="form"
      :style="{ width: '600px' }"
      @submit="handleSubmit"
    >
      <a-form-item field="userAccount" label="Username" validate-trigger="blur">
        <a-input v-model="form.userAccount" placeholder="请输入用户名" />
      </a-form-item>
      <a-form-item field="userPassword" label="密码" validate-trigger="blur">
        <a-input-password
          v-model="form.userPassword"
          placeholder="请输入密码"
        />
      </a-form-item>
      <a-form-item
        field="checkPassword"
        label="确认密码"
        validate-trigger="blur"
      >
        <a-input-password
          v-model="form.checkPassword"
          placeholder="请确认密码"
        />
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button html-type="submit" type="primary">提交</a-button>
          <a-button @click="$refs.formRef.resetFields()" type="outline"
            >重置
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { reactive } from "vue";
import { UserControllerService } from "../../../generated";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

export default {
  setup() {
    const router = useRouter();
    const handleSubmit = async ({ values, errors }) => {
      console.log("values:", values, "\nerrors:", errors);
      const res = await UserControllerService.userRegisterUsingPost(form);
      // 登录成功，跳转到主页
      if (res.code === 0) {
        router.push({ path: "/user/login" });
      } else {
        message.error("登陆失败，" + res.message);
      }
    };

    const form = reactive({
      userAccount: "",
      userPassword: "",
      checkPassword: "",
    });

    const rules = {
      userAccount: [
        {
          required: true,
          message: "name is required",
        },
      ],
      userPassword: [
        {
          required: true,
          message: "password is required",
        },
      ],
      checkPassword: [
        {
          required: true,
          message: "password is required",
        },
        {
          validator: (value, cb) => {
            if (value !== form.userPassword) {
              cb("two passwords do not match");
            } else {
              cb();
            }
          },
        },
      ],
    };

    return {
      form,
      rules,
      handleSubmit,
    };
  },
};
</script>

<style scoped>
.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
