<template>
  <div class="knowledge-graph-container">
    <div ref="chart" class="knowledge-graph-chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from "vue";
import * as echarts from "echarts";

// 接收外部传递的数据
const props = defineProps({
  nodes: {
    type: Array,
    required: true,
  },
  links: {
    type: Array,
    required: true,
  },
  categories: {
    type: Array,
    required: true,
  },
});

const chart = ref(null);
let myChart = null;

// 初始化图表
const initChart = () => {
  myChart = echarts.init(chart.value);

  const option = {
    tooltip: { trigger: "item" },
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

  // 监听点击事件，模拟展开和收起
  myChart.on("click", (params) => {
    if (params.dataType === "node") {
      const nodeId = params.data.id;
      console.log(`点击节点：${nodeId}，应调用接口加载更多相关节点`);
      // 示例：模拟展开新节点
    }
  });
};

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
