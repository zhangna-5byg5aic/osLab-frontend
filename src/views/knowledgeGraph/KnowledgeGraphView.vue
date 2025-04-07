<template>
  <div class="knowledge-graph-container">
    <a-page-header
      title="知识图谱一览"
      sub-title="浏览和探索完整的知识网络"
      @back="() => router.go(-1)"
    >
      <template #extra>
        <a-space>
          <a-button type="primary" @click="refreshGraph">
            <template #icon><icon-refresh /></template>
            刷新图谱
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <a-row :gutter="16" class="content-row">
      <!-- 左侧筛选面板 -->
      <a-col :span="6">
        <a-card title="筛选条件" class="filter-card">
          <a-input-search
            v-model="searchText"
            placeholder="搜索知识点..."
            allow-clear
            @search="handleSearch"
            @clear="handleSearch"
          />

          <a-divider orientation="left">分类筛选</a-divider>
          <a-checkbox-group v-model="selectedCategories" direction="vertical">
            <a-checkbox
              v-for="category in availableCategories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </a-checkbox>
          </a-checkbox-group>

          <a-divider orientation="left">节点类型</a-divider>
          <a-radio-group v-model="nodeTypeFilter" direction="vertical">
            <a-radio value="all">全部节点</a-radio>
            <a-radio value="core">核心概念</a-radio>
            <a-radio value="sub">子概念</a-radio>
          </a-radio-group>

          <a-divider />
          <a-button type="primary" block @click="applyFilters">
            应用筛选
          </a-button>
          <a-button block @click="resetFilters" style="margin-top: 8px">
            重置筛选
          </a-button>
        </a-card>

        <a-card title="统计信息" class="stats-card" style="margin-top: 16px">
          <a-descriptions :column="1" bordered>
            <a-descriptions-item label="总节点数">
              {{ stats.totalNodes }}
            </a-descriptions-item>
            <a-descriptions-item label="总关系数">
              {{ stats.totalLinks }}
            </a-descriptions-item>
            <a-descriptions-item label="分类数量">
              {{ stats.totalCategories }}
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>

      <!-- 主图谱区域 -->
      <a-col :span="12">
        <a-card class="graph-card">
          <KnowledgeGraph
            ref="graphRef"
            :nodes="filteredNodes"
            :links="filteredLinks"
            :categories="filteredCategories"
            @node-click="handleNodeClick"
          />
        </a-card>
      </a-col>

      <!-- 右侧详情面板 -->
      <a-col :span="6">
        <a-card
          v-if="selectedNode"
          title="节点详情"
          class="detail-card"
          :bordered="false"
        >
          <a-descriptions :column="1" bordered>
            <a-descriptions-item label="名称">
              {{ selectedNode.name }}
            </a-descriptions-item>
            <a-descriptions-item label="分类">
              {{ selectedNode.category }}
            </a-descriptions-item>
            <a-descriptions-item label="描述" v-if="selectedNode.description">
              {{ selectedNode.description }}
            </a-descriptions-item>
          </a-descriptions>

          <a-divider orientation="left">关联节点</a-divider>
          <a-tag
            v-for="node in relatedNodes"
            :key="node.name"
            color="blue"
            style="margin-bottom: 4px; margin-right: 8px; cursor: pointer"
            @click="focusNode(node.id || '')"
          >
            {{ node.name }}
          </a-tag>
        </a-card>

        <a-card
          v-else
          title="帮助"
          class="detail-card"
          style="margin-top: 16px"
          :bordered="false"
        >
          <p>点击图谱中的节点查看详细信息</p>
          <p>使用左侧面板筛选节点</p>
          <p>拖动可以平移视图</p>
          <p>滚轮可以缩放视图</p>
        </a-card>

        <a-card title="最近浏览" class="history-card" style="margin-top: 16px">
          <a-timeline>
            <a-timeline-item
              v-for="item in browseHistory"
              :key="item.id"
              :color="item.id === selectedNode?.id ? 'blue' : 'gray'"
            >
              <a
                @click="focusNode(item.id)"
                style="cursor: pointer; transition: color 0.3s"
                class="hoverable-link"
                >{{ item.name }}</a
              >
              <br />
              <small>{{ formatTime(item.time) }}</small>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

import KnowledgeGraph from "@/components/KnowledgeGraph.vue";
import { Message } from "@arco-design/web-vue";
import {
  CategoryDTO,
  KnowledgeGraphControllerService,
  LinkDTO,
  NodeDTO,
} from "../../../generated";

const router = useRouter();

// 图谱数据
const nodes = ref<NodeDTO[]>([]);
const links = ref<LinkDTO[]>([]);
const categories = ref<CategoryDTO[]>([]);
const graphRef = ref();

// 筛选状态
const searchText = ref("");
const selectedCategories = ref<string[]>([]);
const nodeTypeFilter = ref("all");

// 选中节点状态
const selectedNode = ref<NodeDTO | null>(null);
const browseHistory = ref<Array<{ id: string; name: string; time: Date }>>([]);

// 统计信息
const stats = computed(() => ({
  totalNodes: nodes.value.length,
  totalLinks: links.value.length,
  totalCategories: categories.value.length,
}));

// 可用分类
const availableCategories = computed(() => {
  return Array.from(new Set(categories.value.map((c) => c.name)));
});

// 相关链接
const relatedLinks = computed(() => {
  if (!selectedNode.value) return [];
  return links.value.filter(
    (link) =>
      link.source === selectedNode.value?.id ||
      link.target === selectedNode.value?.id
  );
});
const relatedNodes = computed(() => {
  if (!selectedNode.value) return [];
  const filteredLinks = links.value.filter(
    (link) =>
      link.source === selectedNode.value?.id ||
      link.target === selectedNode.value?.id
  );
  const relatedNodeIds = new Set(
    filteredLinks.map((link) => [link.source, link.target].flat()).flat()
  );
  return nodes.value.filter((node) => relatedNodeIds.has(node.id));
});

// 过滤后的数据
const filteredNodes = computed(() => {
  let result = nodes.value;

  // 按搜索文本过滤
  if (searchText.value) {
    result = result.filter((node) =>
      (node.name || "").toLowerCase().includes(searchText.value.toLowerCase())
    );
  }

  // 按分类过滤
  if (selectedCategories.value.length > 0) {
    result = result.filter((node) =>
      selectedCategories.value.includes(node.category || "")
    );
  }

  // 按节点类型过滤
  if (nodeTypeFilter.value !== "all") {
    result = result.filter((node) =>
      nodeTypeFilter.value === "core"
        ? node.category?.includes("核心")
        : node.category?.includes("子")
    );
  }

  return result;
});

const filteredLinks = computed(() => {
  const visibleNodeIds = new Set(filteredNodes.value.map((n) => n.id));
  return links.value.filter(
    (link) => visibleNodeIds.has(link.source) && visibleNodeIds.has(link.target)
  );
});

const filteredCategories = computed(() => {
  return categories.value;
});

// 加载图谱数据
const loadGraphData = async () => {
  try {
    const res =
      await KnowledgeGraphControllerService.getAllKnowledgeGraphDataUsingGet();
    if (res.code === 0 && res.data) {
      nodes.value = res.data.nodes || [];
      links.value = res.data.links || [];
      categories.value = res.data.categories || [];
    } else {
      Message.error("加载知识图谱失败: " + res.message);
    }
  } catch (error) {
    Message.error("加载知识图谱失败");
    console.error(error);
  }
};

// 节点点击处理
const handleNodeClick = (node: NodeDTO) => {
  selectedNode.value = node;

  // 添加到浏览历史
  const existingIndex = browseHistory.value.findIndex(
    (item) => item.id === node.id
  );
  if (existingIndex >= 0) {
    browseHistory.value.splice(existingIndex, 1);
  }
  browseHistory.value.unshift({
    id: node.id || "",
    name: node.name || "default",
    time: new Date(),
  });

  // 保留最近10条记录
  if (browseHistory.value.length > 10) {
    browseHistory.value.pop();
  }
};

// 聚焦到特定节点
const focusNode = async (nodeId: string) => {
  const node = nodes.value.find((n) => n.id === nodeId);
  if (node) {
    handleNodeClick(node);
    // graphRef.value?.focusNode(nodeId);
    const newData =
      await KnowledgeGraphControllerService.getKnowledgeGraphDataUsingGet(
        node.name
      );
    nodes.value = newData.data?.nodes || [];
    links.value = newData.data?.links || [];
    categories.value = newData.data?.categories || [];
  }
};

// 获取节点名称
const getNodeName = (nodeId: string) => {
  return nodes.value.find((n) => n.id === nodeId)?.name || nodeId;
};

// 搜索处理
const handleSearch = () => {
  // 计算属性会自动更新
};

// 应用筛选
const applyFilters = () => {
  // 计算属性会自动更新
};

// 重置筛选
const resetFilters = () => {
  searchText.value = "";
  selectedCategories.value = [];
  nodeTypeFilter.value = "all";
};

// 刷新图谱
const refreshGraph = async () => {
  await loadGraphData();
  Message.success("图谱已刷新");
};

// 格式化时间
const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString();
};

onMounted(() => {
  loadGraphData();
});
</script>

<style scoped>
.knowledge-graph-container {
  display: flex;
  flex-direction: column;
}

.content-row {
  flex: 1;
  margin-top: 16px;
}

.filter-card,
.graph-card,
.detail-card,
.history-card,
.stats-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.graph-card {
  padding: 0 !important;
  overflow: hidden; /* 添加这行确保内容不会溢出 */
}

:deep(.graph-card .arco-card-body) {
  padding: 0;
  flex: 1;
  min-height: 600px;
}

.filter-card :deep(.arco-card-body),
.detail-card :deep(.arco-card-body),
.history-card :deep(.arco-card-body),
.stats-card :deep(.arco-card-body) {
  flex: 1;
  overflow-y: auto;
}

.filter-card :deep(.arco-divider) {
  margin: 12px 0;
}
.hoverable-link:hover {
  color: #1890ff; /* 悬停时变成蓝色 */
  text-decoration: underline; /* 添加下划线 */
}
</style>
