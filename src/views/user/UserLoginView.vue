<template>
  <div id="userLoginView">
    <h2 style="margin-bottom: 16px; text-align: center">用户登录</h2>
    <a-form
      style="max-width: 480px; margin: 0 auto"
      label-align="left"
      auto-label-width
      :model="form"
      @submit="handleSubmit"
    >
      <a-form-item field="userAccount" label="账号">
        <a-input v-model="form.userAccount" placeholder="请输入账号" />
      </a-form-item>
      <a-form-item field="userPassword" tooltip="密码不少于 8 位" label="密码">
        <a-input-password
          v-model="form.userPassword"
          placeholder="请输入密码"
        />
      </a-form-item>
      <div style="display: flex; flex-direction: column; align-items: center">
        <a-form-item style="width: 100%">
          <a-button type="primary" html-type="submit" style="width: 100%"
            >登录</a-button
          >
        </a-form-item>
        <a-form-item style="width: 100%">
          <a-button @click="goToTargetPage" type="outline" style="width: 100%"
            >注册</a-button
          >
        </a-form-item>
      </div>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { UserControllerService, UserLoginRequest } from "../../../generated";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

/**
 * 表单信息
 */
const form = reactive({
  userAccount: "",
  userPassword: "",
} as UserLoginRequest);

const router = useRouter();
const store = useStore();

/**
 * 提交表单
 * @param data
 */
const handleSubmit = async () => {
  const res = await UserControllerService.userLoginUsingPost(form);
  // 登录成功，跳转到主页
  if (res.code === 0) {
    await store.dispatch("user/getLoginUser");
    router.push({
      path: "/",
      replace: true,
    });
    localStorage.setItem("userId", res.data.id);
  } else {
    message.error("登陆失败，" + res.message);
  }
};
const goToTargetPage = () => {
  router.push({ path: "/user/register" }); // 根据路由名称进行跳转
};
</script>
