<template>
  <div id="questionSubmitView">
    <a-form :model="searchParams" layout="inline">
      <a-form-item field="questionId" label="题号" style="min-width: 240px">
        <a-input v-model="searchParams.questionId" placeholder="请输入" />
      </a-form-item>
      <a-form-item field="language" label="编程语言" style="min-width: 240px">
        <a-select
          v-model="searchParams.language"
          :style="{ width: '320px' }"
          placeholder="选择编程语言"
        >
          <a-option>java</a-option>
          <a-option>cpp</a-option>
          <a-option>go</a-option>
          <a-option>html</a-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="doSubmit">搜索</a-button>
      </a-form-item>
    </a-form>
    <a-divider size="0" />
    <a-table
      :ref="tableRef"
      :columns="columns"
      :data="dataList"
      :pagination="{
        showTotal: true,
        pageSize: searchParams.pageSize,
        current: searchParams.current,
        total,
      }"
      @page-change="onPageChange"
    >
      <template #judgeInfo="{ record }">
        <a-tag v-if="record.judgeInfo.message === 'Accepted'" color="green">
          {{ record.judgeInfo.message }}
        </a-tag>
        <a-tag v-if="record.judgeInfo.message === 'Wrong Answer'" color="red">
          {{ record.judgeInfo.message }}
        </a-tag>
      </template>
      <template #createTime="{ record }">
        {{ moment(record.createTime).format("YYYY-MM-DD") }}
      </template>
      <template #JudgeStatus="{ record }">
        <div>
          <span v-if="record.status === 0">等待中</span>
          <span v-else-if="record.status === 1">判题中</span>
          <span v-else-if="record.status === 2">判题成功</span>
          <span v-else-if="record.status === 3">判题失败</span>
        </div>
      </template>
      <template #question="{ record }">
        {{ record.questionVO?.title }}
      </template>
      <!-- 新增操作列 -->
      <template #action="{ record }">
        <a-button @click="handleViewDetail(record.id)">查看详情</a-button>
      </template>
    </a-table>
    <!-- 详情模态框 -->
    <a-modal
      v-model:visible="visible"
      title="提交详情"
      width="700px"
      :footer="false"
    >
      <a-descriptions :column="1" bordered v-if="detail">
        <a-descriptions-item label="题目名称">{{
          detail.questionVO?.title
        }}</a-descriptions-item>
        <a-descriptions-item label="编程语言">{{
          detail.language
        }}</a-descriptions-item>
        <a-descriptions-item label="提交代码">
          <pre class="code-block">{{ detail.code }}</pre>
        </a-descriptions-item>
        <a-descriptions-item label="判题信息">
          {{ detail.judgeInfo?.message }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import {
  Question,
  QuestionControllerService,
  QuestionSubmitQueryRequest,
  QuestionSubmitVO,
} from "../../../generated";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";
import moment from "moment";

const tableRef = ref();

// 新增响应式变量
const visible = ref(false);
const detail = ref<QuestionSubmitVO>();

const dataList = ref([]);
const total = ref(0);
const searchParams = ref<QuestionSubmitQueryRequest>({
  questionId: undefined,
  language: undefined,
  pageSize: 10,
  current: 1,
});

const loadData = async () => {
  const res = await QuestionControllerService.listQuestionSubmitByPageUsingPost(
    {
      ...searchParams.value,
      sortField: "createTime",
      sortOrder: "descend",
    }
  );
  if (res.code === 0) {
    dataList.value = res.data.records;
    total.value = res.data.total;
  } else {
    message.error("加载失败，" + res.message);
  }
};

/**
 * 监听 searchParams 变量，改变时触发页面的重新加载
 */
watchEffect(() => {
  loadData();
});

/**
 * 页面加载时，请求数据
 */
onMounted(() => {
  loadData();
});

const columns = [
  {
    title: "提交号",
    dataIndex: "id",
  },
  {
    title: "编程语言",
    dataIndex: "language",
  },
  {
    title: "判题信息",
    slotName: "judgeInfo",
  },
  {
    title: "判题状态",
    // dataIndex: "status",
    slotName: "JudgeStatus",
  },
  {
    title: "题目",
    slotName: "question",
  },
  {
    title: "提交者 id",
    dataIndex: "userId",
  },
  {
    title: "创建时间",
    slotName: "createTime",
  },
  {
    title: "操作",
    slotName: "action",
  },
];

const onPageChange = (page: number) => {
  searchParams.value = {
    ...searchParams.value,
    current: page,
  };
};

const router = useRouter();

/**
 * 跳转到做题页面
 * @param question
 */
const toQuestionPage = (question: Question) => {
  router.push({
    path: `/view/question/${question.id}`,
  });
};

/**
 * 确认搜索，重新加载数据
 */
const doSubmit = () => {
  // 这里需要重置搜索页号
  searchParams.value = {
    ...searchParams.value,
    current: 1,
  };
};
// 新增查看详情处理函数
const handleViewDetail = async (id: number) => {
  try {
    const res = await QuestionControllerService.getQuestionSubmitByIdUsingGet(
      id
    );
    if (res.code === 0) {
      detail.value = res.data;
      visible.value = true;
    } else {
      message.error("获取详情失败: " + res.message);
    }
  } catch (error) {
    message.error("请求失败，请重试");
  }
};
</script>

<style scoped>
#questionSubmitView {
  max-width: 1280px;
  margin: 0 auto;
}
/* 新增代码块样式 */
.code-block {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  max-height: 400px;
  white-space: pre-wrap;
}
</style>
