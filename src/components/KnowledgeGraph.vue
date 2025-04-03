<template>
  <div class="knowledge-graph-container">
    <div ref="chart" class="knowledge-graph-chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, watch } from "vue";
import * as echarts from "echarts";

const props = defineProps({
  nodes: { type: Array, required: true },
  links: { type: Array, required: true },
  categories: { type: Array, required: true },
});

const chart = ref(null);
let myChart = null;

// 初始化图表
const initChart = () => {
  myChart = echarts.init(chart.value);
  updateChart();
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
        data: props.nodes,
        links: props.links,
        categories: props.categories,
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
