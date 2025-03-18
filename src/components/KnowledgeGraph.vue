<template>
  <div class="knowledge-graph-container">
    <div ref="chart" class="knowledge-graph-chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as echarts from "echarts";

const chart = ref(null);
let myChart = null;

// 模拟数据
const mockData = {
  nodes: [
    { id: "1", name: "操作系统", category: 0 },
    { id: "2", name: "进程管理", category: 1 },
    { id: "3", name: "内存管理", category: 1 },
  ],
  links: [
    { source: "1", target: "2" },
    { source: "1", target: "3" },
  ],
  categories: [{ name: "核心概念" }, { name: "子概念" }],
};

// 初始化图表
const initChart = () => {
  myChart = echarts.init(chart.value);

  const option = {
    tooltip: { trigger: "item" },
    legend: [{ data: mockData.categories.map((c) => c.name) }],
    series: [
      {
        type: "graph",
        layout: "force",
        data: mockData.nodes,
        links: mockData.links,
        categories: mockData.categories,
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
      // TODO: 调用后端接口，根据 nodeId 加载更多数据
      console.log(`点击节点：${nodeId}，应调用接口加载更多相关节点`);
      // 示例：模拟展开新节点
      expandNode(nodeId);
    }
  });
};

// 模拟展开节点
const expandNode = (nodeId) => {
  const newNodeId = `${nodeId}-new`;
  const newNode = { id: newNodeId, name: `新节点 ${newNodeId}`, category: 1 };
  const newLink = { source: nodeId, target: newNodeId };

  mockData.nodes.push(newNode);
  mockData.links.push(newLink);

  myChart.setOption({
    series: [
      {
        data: mockData.nodes,
        links: mockData.links,
      },
    ],
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
