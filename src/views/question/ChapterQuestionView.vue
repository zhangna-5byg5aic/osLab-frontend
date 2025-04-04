<template>
  <a-table
    :columns="columns"
    :data-source="mainTableData"
    :row-key="(record) => record.key"
    :expandIconColumnIndex="columns.length"
    :expandedRowKeys="expandedRowKeys"
    @expand="handleExpand"
  >
    <template #expandedRowRender="{ record }">
      <a-table
        :columns="innerColumns"
        :data-source="getChildrenData(record.key)"
        :loading="childLoading[record.key]"
        :pagination="false"
        :row-key="(childRecord) => childRecord.key"
      >
        <template #action="{ record: childRecord }">
          <a-button type="link" @click="handleChildAction(childRecord)">
            操作
          </a-button>
        </template>
      </a-table>
    </template>
  </a-table>
</template>

<script>
import { ref, reactive } from "vue";
import { Table, Button, message } from "ant-design-vue";

// 模拟API请求
const mockFetchChildren = (parentKey) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData = {
        1: [
          { key: 11, date: "2023-01-01", description: "张三的子数据1" },
          { key: 12, date: "2023-01-02", description: "张三的子数据2" },
        ],
        2: [{ key: 21, date: "2023-01-03", description: "李四的子数据1" }],
        3: [
          { key: 31, date: "2023-01-04", description: "王五的子数据1" },
          { key: 32, date: "2023-01-05", description: "王五的子数据2" },
          { key: 33, date: "2023-01-06", description: "王五的子数据3" },
        ],
      };
      resolve(mockData[parentKey] || []);
    }, 800);
  });
};

export default {
  components: {
    ATable: Table,
    AButton: Button,
  },
  setup() {
    // 主表列定义
    const columns = [
      {
        title: "姓名",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "年龄",
        dataIndex: "age",
        key: "age",
      },
      {
        title: "地址",
        dataIndex: "address",
        key: "address",
      },
    ];

    // 子表列定义
    const innerColumns = [
      {
        title: "日期",
        dataIndex: "date",
        key: "date",
      },
      {
        title: "详情",
        dataIndex: "description",
        key: "description",
      },
      {
        title: "操作",
        key: "action",
        slots: { customRender: "action" },
      },
    ];

    // 主表数据 - 不包含children
    const mainTableData = ref([
      {
        key: 1,
        name: "张三",
        age: 32,
        address: "北京市朝阳区",
      },
      {
        key: 2,
        name: "李四",
        age: 42,
        address: "上海市浦东新区",
      },
      {
        key: 3,
        name: "王五",
        age: 28,
        address: "广州市天河区",
      },
    ]);

    // 子表数据存储
    const childrenData = reactive({});
    // 加载状态
    const childLoading = reactive({});
    // 展开的行keys
    const expandedRowKeys = ref([]);

    // 获取子表数据
    const getChildrenData = (parentKey) => {
      return childrenData[parentKey] || [];
    };

    // 处理展开事件
    const handleExpand = async (expanded, record) => {
      if (expanded) {
        expandedRowKeys.value = [record.key];

        // 如果还没有加载过子数据
        if (!childrenData[record.key]) {
          childLoading[record.key] = true;
          try {
            childrenData[record.key] = await mockFetchChildren(record.key);
          } catch (error) {
            message.error("加载子数据失败");
          } finally {
            childLoading[record.key] = false;
          }
        }
      } else {
        expandedRowKeys.value = [];
      }
    };

    // 子表操作
    const handleChildAction = (record) => {
      message.info(`操作子表数据: ${record.description}`);
    };

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
/* 自定义样式 */
.ant-table-expanded-row {
  background: #fafafa;
}
.ant-table-expanded-row .ant-table {
  margin: 0;
}
</style>
