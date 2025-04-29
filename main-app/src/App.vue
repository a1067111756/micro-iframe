<template>
  <div style="height: 100%; width: 100%; padding: 10px; display: flex; flex-direction: column;">
    <div style="display: flex; align-items: center; column-gap: 10px;">
      <p>基座主应用</p>
      <button @click="sendMsgToApp1">向子应用1发送消息</button>
      <button @click="sendMsgToApp2">向子应用2发送消息</button>
      <button @click="sendMsgToApp3">向子应用3发送消息</button>
      <button @click="sendMsgToApp4">向子应用4发送消息</button>
    </div>

    <div style="flex: 1; display: flex; column-gap: 10px;">
      <!-- 子应用1 -->
      <iframe id="child-app1" :src="childApp1Src" style="width: 50%; height: 100%; border: none;" />

      <!-- 子应用2 -->
      <iframe id="child-app2" :src="childApp2Src" style="width: 50%; height: 100%; border: none;" />
    </div>
  </div>
</template>

<script setup>
  import { onMounted } from 'vue'

  // 子应用1
  const childApp1Src = 'http://localhost:3001/'

  // 子应用2
  const childApp2Src = 'http://localhost:3002/'

  // 生命周期 - 挂载
  onMounted(() => {
    window.microIframe.$on('MainAppType', (message) => {
      console.log(message)
    })
  })

  // 方法 - 向子应用1发送消息
  const sendMsgToApp1 = () => {
    window.microIframe.$emit('CHILD_APP1', 'ChildApp1Type', '主应用 -> 子应用1的消息')
  }

  // 方法 - 向子应用2发送消息
  const sendMsgToApp2 = () => {
    window.microIframe.$emit('CHILD_APP2', 'ChildApp2Type', '主应用 -> 子应用2的消息')
  }

  // 方法 - 向子应用3发送消息
  const sendMsgToApp3 = () => {
    window.microIframe.$emit('CHILD_APP3', 'ChildApp3Type', '主应用 -> 子应用3的消息')
  }

  // 方法 - 向子应用4发送消息
  const sendMsgToApp4 = () => {
    window.microIframe.$emit('CHILD_APP4', 'ChildApp4Type', '主应用 -> 子应用4的消息')
  }
</script>
