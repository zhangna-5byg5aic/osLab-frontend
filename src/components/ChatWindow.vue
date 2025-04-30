<template>
  <div class="chat-container">
    <!-- 聊天记录 -->
    <div class="chat-box">
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="message"
        :class="{
          'user-message': message.sender === 'user',
          'bot-message': message.sender === 'bot',
        }"
      >
        <div class="bubble">{{ message.text }}</div>
      </div>
    </div>

    <!-- 输入框和发送按钮 -->
    <div class="chat-input">
      <input
        v-model="userMessage"
        @keyup.enter="sendMessage"
        placeholder="请输入问题..."
      />
      <button @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script>
import { ChatControllerService } from "../../generated";

export default {
  data() {
    return {
      userMessage: "", // 用户输入的消息
      messages: [], // 存储聊天记录
    };
  },
  methods: {
    async sendMessage() {
      if (this.userMessage.trim() === "") return;

      // 用户问题添加到聊天记录（右侧气泡）
      this.messages.push({ sender: "user", text: this.userMessage });

      // 清空输入框
      const message = this.userMessage;
      this.userMessage = "";

      try {
        // 请求后端获取答案
        const response = await this.getAnswerFromBackend(message);

        // 后端回答添加到聊天记录（左侧气泡）
        this.messages.push({ sender: "bot", text: response });
      } catch (error) {
        this.messages.push({
          sender: "bot",
          text: "无法获取回答，请稍后再试。",
        });
      }
    },

    async getAnswerFromBackend(question) {
      // 模拟请求后端的代码，你可以根据实际需求调整
      const response = await ChatControllerService.askQuestionUsingPost(
        question
      );
      return response.data; // 假设后端返回的是 { answer: "..." }
    },
  },
};
</script>

<style scoped>
.chat-container {
  width: 400px;
  height: 500px;
  border: 1px solid #ccc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.chat-box {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.message {
  margin-bottom: 10px;
  display: flex;
}

.user-message {
  justify-content: flex-end;
}

.bot-message {
  justify-content: flex-start;
}

.bubble {
  background-color: #f1f1f1;
  padding: 10px;
  border-radius: 20px;
  max-width: 70%;
}

.user-message .bubble {
  background-color: #165dff; /* 用户的气泡颜色 */
  color: white; /* 设置用户文字颜色为白色 */
}

.bot-message .bubble {
  background-color: #e0e0e0; /* 机器人的气泡颜色 */
}

.chat-input {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #f9f9f9;
  border-top: 1px solid #ccc;
}

input {
  width: 80%;
  padding: 5px;
  border-radius: 20px;
  border: 1px solid #ccc;
}

button {
  padding: 5px 10px;
  border-radius: 20px;
  background-color: #165dff;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #165dff;
}
</style>
