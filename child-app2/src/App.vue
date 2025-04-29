
<template>
  <div style="height: 100%; width: 100%; border: 1px dashed #000; display: flex; flex-direction: column;">
    <div style="display: flex; align-items: center;">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
      <span>子应用2-vue</span>

      <div style="display: flex; align-items: center; column-gap: 10px;">
        <p>基座主应用</p>
        <button @click="sendMsgToMainApp">向主应用发送消息</button>
        <button @click="sendMsgToChildApp1">向子应用1发送消息</button>
        <button @click="sendMsgToChildApp3">向子应用3发送消息</button>
        <button @click="sendMsgToChildApp4">向子应用4发送消息</button>
      </div>
    </div>

    <!-- 子应用4 -->
    <iframe id="child-app4" :src="childApp4Src" style="width: 100%; height: 100%; border: none; padding: 10px;" />
  </div>
</template>

<script setup>
  import { onMounted } from 'vue'

  onMounted(() => {
    window.microIframe.$on('ChildApp2Type', (message) => {
      console.log(message)
    })
  })

  // 子应用4
  const childApp4Src = 'http://localhost:3004/'

  // 方法 - 向主应用发送消息
  const sendMsgToMainApp = () => {
    window.microIframe.$emit('MAIN_APP', 'MainAppType', { c: '子应用2 -> 主应用的消息' })
  }

  // 方法 - 子应用1发送消息
  const sendMsgToChildApp1 = () => {
    window.microIframe.$emit('CHILD_APP1', 'ChildApp1Type', { c: '子应用2 -> 子应用1的消息' })
  }

  // 方法 - 子应用3发送消息
  const sendMsgToChildApp3 = () => {
    window.microIframe.$emit('CHILD_APP3', 'ChildApp3Type', { c: '子应用2 -> 子应用3的消息' })
  }

  // 方法 - 子应用4发送消息
  const sendMsgToChildApp4 = () => {
    window.microIframe.$emit('CHILD_APP4', 'ChildApp4Type', { c: '子应用2 -> 子应用4的消息' })
  }
</script>

