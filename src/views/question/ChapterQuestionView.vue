<template>
  <div id="chapterQuestionView">
    <a-card>
      <a-table
        :columns="columns"
        :data-source="mainTableData"
        :row-key="(record) => record.id"
        :expandedRowKeys="expandedRowKeys"
        @expand="handleExpand"
        class="my-custom-table"
      >
        <template #expandedRowRender="{ record }">
          <a-table
            :columns="innerColumns"
            :data-source="getChildrenData(record.id)"
            :loading="childLoading[record.id]"
            :pagination="false"
            :row-key="(childRecord) => childRecord.id"
          >
            <template #action="{ record: childRecord }">
              <a-button type="primary" @click="handleChildAction(childRecord)">
                去做题
              </a-button>
            </template>
            <template #tags="{ text: tags }">
              <a-space wrap>
                <a-tag v-for="tag in tags" :key="tag" color="blue">
                  {{ tag }}
                </a-tag>
              </a-space>
            </template>
          </a-table>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from "vue";
import { Table, Button, message } from "ant-design-vue";
import { QuestionControllerService } from "../../../generated";
import { useRouter } from "vue-router";

export default {
  components: {
    ATable: Table,
    AButton: Button,
  },
  setup() {
    // 主表列定义
    const columns = [
      {
        title: "名称",
        dataIndex: "setName",
        key: "setName",
      },
      {
        title: "描述",
        dataIndex: "description",
        key: "description",
      },
      /*{
        title: "id",
        dataIndex: "id",
        key: "id",
      },*/
    ];

    // 子表列定义
    const innerColumns = [
      /*{
        title: "题号",
        dataIndex: "id",
        key: "id",
      },*/
      {
        title: "题目名称",
        dataIndex: "title",
        key: "title",
      },
      {
        title: "关联知识点",
        dataIndex: "tags",
        key: "tags",
        slots: { customRender: "tags" },
      },
      {
        title: "操作",
        key: "action",
        slots: { customRender: "action" },
      },
    ];

    // 主表数据
    const mainTableData = ref([]);
    const mainTableLoading = ref(false);

    // 子表数据存储
    const childrenData = reactive({});
    // 加载状态
    const childLoading = reactive({});
    // 展开的行keys
    const expandedRowKeys = ref([]);

    // 获取主表数据
    const fetchMainTableData = async () => {
      mainTableLoading.value = true;
      try {
        const response =
          await QuestionControllerService.getQuestionSetsUsingGet();
        if (response.data) {
          mainTableData.value = response.data;
        }
      } catch (error) {
        message.error("加载题目集失败");
      } finally {
        mainTableLoading.value = false;
      }
    };

    // 获取子表数据
    const getChildrenData = (setId) => {
      return childrenData[setId] || [];
    };

    // 处理展开事件
    const handleExpand = async (expanded, record) => {
      if (expanded) {
        expandedRowKeys.value = [record.id];

        // 如果还没有加载过子数据
        if (!childrenData[record.id]) {
          childLoading[record.id] = true;
          try {
            const response =
              await QuestionControllerService.getQuestionBySetsUsingGet(
                record.id
              );
            if (response.data) {
              childrenData[record.id] = response.data;
            }
          } catch (error) {
            message.error("加载题目数据失败");
          } finally {
            childLoading[record.id] = false;
          }
        }
      } else {
        expandedRowKeys.value = [];
      }
    };
    const router = useRouter();
    // 子表操作
    const handleChildAction = (record) => {
      message.info(`操作题目: ${record.title}`);
      router.push({
        path: `/view/question/${record.id}`,
      });
    };

    // 组件挂载时获取主表数据
    onMounted(() => {
      fetchMainTableData();
    });

    return {
      columns,
      innerColumns,
      mainTableData,
      expandedRowKeys,
      childLoading,
      getChildrenData,
      handleExpand,
      handleChildAction,
    };
  },
};
</script>

<style>
#chapterQuestionView {
  max-width: 90%;
  margin: 0 auto;
}
/* 自定义样式 */
.ant-table-expanded-row .ant-table {
  margin: 0;
}
</style>
