<template>
  <a-spin :spinning="loading">
    <a-card v-if="userInfo" class="user-center-card">
      <div class="user-profile">
        <!-- 头像部分 -->
        <div class="avatar-section">
          <!--          <a-avatar :src="require('@/assets/avatar.png')" :size="120" />-->
          <img :src="require('@/assets/avatar.png')" class="avatar" />
          <div class="user-name">
            <h1>{{ userInfo.userName }}</h1>
            <a-tag v-if="userInfo.userRole" color="blue">{{
              userRoleMap[userInfo.userRole]
            }}</a-tag>
          </div>
        </div>

        <!-- 详细信息 -->
        <a-divider />
        <div class="user-details">
          <a-descriptions bordered :column="1">
            <a-descriptions-item label="用户ID">{{
              userInfo.id
            }}</a-descriptions-item>
            <a-descriptions-item label="个人简介">
              {{ userInfo.userProfile || "暂无简介" }}
            </a-descriptions-item>
            <a-descriptions-item label="注册时间">
              {{ formatTime(userInfo.createTime) }}
            </a-descriptions-item>
            <a-descriptions-item label="最后更新时间">
              {{ formatTime(userInfo.updateTime) }}
            </a-descriptions-item>
          </a-descriptions>
        </div>
      </div>
    </a-card>
    <div>
      <input type="file" @change="handleFileChange" accept=".xlsx,.csv" />
      <button @click="uploadAndDownload" :disabled="!file">上传文件</button>
      <p v-if="uploading">上传中...</p>
      <p v-if="error" style="color: red">{{ error }}</p>
      <p v-if="success" style="color: green">上传成功！</p>
    </div>
    <!-- 错误提示 -->
    <a-result
      v-if="error"
      status="error"
      title="数据加载失败"
      :sub-title="error"
    >
      <template #extra>
        <a-button type="primary" @click="loadUserData">重试</a-button>
      </template>
    </a-result>
  </a-spin>
</template>

<script setup lang="ts">
import { ref, onMounted, handleError } from "vue";
import dayjs from "dayjs";
import {
  LoginUserVO,
  StudentsControllerService,
  UserControllerService,
} from "../../../generated";
import { message } from "ant-design-vue";

// 用户角色映射
const userRoleMap: Record<string, string> = {
  user: "普通用户",
  admin: "管理员",
  // 可根据实际角色扩展
};

// 响应式数据
const userInfo = ref<LoginUserVO | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// 时间格式化
const formatTime = (time?: string) => {
  return time ? dayjs(time).format("YYYY-MM-DD HH:mm") : "未知时间";
};

// 加载用户数据
const loadUserData = async () => {
  try {
    loading.value = true;
    error.value = null;
    const res = await UserControllerService.getLoginUserUsingGet();
    userInfo.value = res.data || null;
  } catch (err) {
    error.value = "无法获取用户信息，请检查网络连接或重新登录";
    console.error("用户信息加载失败:", err);
  } finally {
    loading.value = false;
  }
};
const file = ref<Blob | null>(null);
const uploading = ref(false);
const success = ref(false);
// 处理文件选择
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    file.value = target.files[0];
    error.value = null;
    success.value = false;
  }
};

// 上传并处理下载
const uploadAndDownload = async () => {
  if (!file.value) return;

  uploading.value = true;
  error.value = null;

  try {
    // 假设 API 返回的是 Blob 类型文件
    await StudentsControllerService.uploadStudentsFileUsingPost(file.value);
  } catch (err: any) {
    handleUploadError(err);
  } finally {
    uploading.value = false;
  }
};

// 处理上传错误
const handleUploadError = (err: any) => {
  if (err.status === 401) {
    error.value = "未授权，请先登录";
  } else if (err.status === 403) {
    error.value = "无权限访问此功能";
  } else if (err.status === 404) {
    error.value = "接口不存在";
  } else {
    error.value = `上传失败: ${err.message || "未知错误"}`;
  }
  console.error("上传错误:", err);
};
// 生命周期钩子
onMounted(() => {
  loadUserData();
});
</script>

<style scoped>
.user-center-card {
  max-width: 800px;
  margin: 20px auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px;
}

.user-name h1 {
  margin-bottom: 8px;
  font-size: 24px;
}

.user-details {
  margin-top: 24px;
}
.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  object-fit: cover;
  transition: all 0.3s ease;
  cursor: pointer;
}

.avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .avatar-section {
    flex-direction: column;
    text-align: center;
  }

  .user-center-card {
    margin: 10px;
  }
}
</style>
