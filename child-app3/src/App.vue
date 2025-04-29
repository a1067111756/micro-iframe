
<template>
  <div style="height: 100%; width: 100%; border: 1px dashed #000;">
    <div style="display: flex; align-items: center;">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
      <span>子应用3-vue</span>

      <div style="display: flex; align-items: center; column-gap: 10px; margin-left: 10px;">
        <button @click="sendMsgToMainApp">向主应用发送消息</button>
        <button @click="sendMsgToChildApp1">向子应用1发送消息</button>
        <button @click="sendMsgToChildApp2">向子应用2发送消息</button>
        <button @click="sendMsgToChildApp4">向子应用4发送消息</button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { onMounted } from 'vue'

  // 生命周期 - 挂载
  onMounted(() => {
    window.microIframe.$on('ChildApp3Type', (message) => {
      console.log(message)
    })
  })

  // 方法 - 向主应用发送消息
  const sendMsgToMainApp = () => {
    window.microIframe.$emit('MAIN_APP', 'MainAppType', { c: '子应用3 -> 主应用的消息' })
  }

  // 方法 - 子应用1发送消息
  const sendMsgToChildApp1 = () => {
    window.microIframe.$emit('CHILD_APP1', 'ChildApp1Type', { c: '子应用3 -> 子应用1的消息' })
  }

    // 方法 - 子应用2发送消息
  const sendMsgToChildApp2 = () => {
    window.microIframe.$emit('CHILD_APP2', 'ChildApp2Type', { c: '子应用3 -> 子应用2的消息' })
  }

    // 方法 - 子应用1发送消息
  const sendMsgToChildApp4 = () => {
    window.microIframe.$emit('CHILD_APP4', 'ChildApp4Type', { c: '子应用3 -> 子应用4的消息' })
  }
</script>
