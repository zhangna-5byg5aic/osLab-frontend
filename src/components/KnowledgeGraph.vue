<template>
  <div class="knowledge-graph-container">
    <div ref="chart" class="knowledge-graph-chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, watch, reactive } from "vue";
import * as echarts from "echarts";
import { KnowledgeGraphControllerService } from "../../generated";

const props = defineProps({
  nodes: { type: Array, required: true },
  links: { type: Array, required: true },
  categories: { type: Array, required: true },
});
// 创建响应式副本
const chartData = reactive({
  nodes: [...props.nodes], // 复制初始的 nodes
  links: [...props.links], // 复制初始的 links
  categories: [...props.categories], // 复制初始的 categories
});

// eslint-disable-next-line no-undef
const emit = defineEmits(["node-click"]);

const chart = ref(null);
let myChart = null;

// 初始化图表
const initChart = () => {
  myChart = echarts.init(chart.value);
  updateChart();
  // 添加点击事件监听
  myChart.on("click", handleNodeClick);
};
// 点击节点事件处理
const handleNodeClick = async (params) => {
  // 只处理点击的是节点（避免点击边连接线等）
  if (params.dataType === "node") {
    const nodeName = params.data.name;

    // 请求新的数据
    try {
      const newData =
        await KnowledgeGraphControllerService.getKnowledgeGraphDataUsingGet(
          nodeName
        );

      // 使用副本来更新数据
      chartData.nodes = newData.data.nodes;
      chartData.links = newData.data.links;
      chartData.categories = newData.data.categories;

      // 重新渲染图表
      updateChart();
    } catch (error) {
      console.error("获取图表数据失败:", error);
    }
  }
  emit("node-click", params.data);
};

// 更新图表数据
const updateChart = () => {
  const option = {
    tooltip: {
      trigger: "item",
      confine: true, // 强制 tooltip 不超出图表区域
      extraCssText: `
      max-width: 300px;
      white-space: normal !important;
      word-wrap: break-word !important;
    `,
      formatter: (params) => {
        // 如果鼠标悬停在节点上
        if (params.dataType === "node") {
          const node = params.data;
          return `
            <div style="font-weight: bold; margin-bottom: 4px;">${
              node.name
            }</div>
            <div>${node.description || "暂无描述"}</div>
          `;
        }
        // 如果鼠标悬停在边上（连接线）
        else if (params.dataType === "edge") {
          const link = params.data;
          return `关系: ${link.label || link.value || "未知"}`;
        }
        return params.name;
      },
    },
    legend: [{ data: props.categories.map((c) => c.name) }],
    series: [
      {
        type: "graph",
        layout: "force",
        data: chartData.nodes,
        links: chartData.links,
        categories: chartData.categories,
        roam: true,
        label: { show: true },
        force: { repulsion: 200, edgeLength: 100 },
        edgeLabel: { show: true, formatter: "{c}" },
        emphasis: { focus: "adjacency" },
      },
    ],
  };
  myChart.setOption(option);
};

// 监听 props 变化，更新图表
watch(
  () => [props.nodes, props.links, props.categories],
  () => {
    if (myChart) {
      chartData.nodes = [...props.nodes];
      chartData.links = [...props.links];
      chartData.categories = [...props.categories];
      updateChart();
    }
  },
  { deep: true } // 深度监听，确保数组内容变化也能触发
);

onMounted(() => {
  initChart();
});
</script>

<style scoped>
.knowledge-graph-container {
  width: 100%;
  height: 100%;
}

.knowledge-graph-chart {
  width: 100%;
  height: 600px;
}
</style>
