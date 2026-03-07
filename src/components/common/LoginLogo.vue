<script setup lang="ts">
import logoSvg from '@/assets/logo.svg'
</script>

<template>
  <div class="icon-container">
    <div class="warehouse-icon">
      <div class="cube-wrapper">
        <div class="cube">
          <div class="cube-face cube-face-front">
            <img
              :src="logoSvg"
              alt="P9 WES"
              class="cube-logo"
            />
          </div>
          <div class="cube-face cube-face-back">
            <img
              :src="logoSvg"
              alt="P9 WES"
              class="cube-logo"
            />
          </div>
          <div class="cube-face cube-face-right">
            <img
              :src="logoSvg"
              alt="P9 WES"
              class="cube-logo"
            />
          </div>
          <div class="cube-face cube-face-left">
            <img
              :src="logoSvg"
              alt="P9 WES"
              class="cube-logo"
            />
          </div>
          <div class="cube-face cube-face-top">
            <img
              :src="logoSvg"
              alt="P9 WES"
              class="cube-logo"
            />
          </div>
          <div class="cube-face cube-face-bottom">
            <img
              :src="logoSvg"
              alt="P9 WES"
              class="cube-logo"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 3D 图标 */
.icon-container {
  margin-bottom: 40px;
  perspective: 1000px;
}

.warehouse-icon {
  width: 150px;
  height: 150px;
}

.cube-wrapper {
  width: 100%;
  height: 100%;
  animation: rotateCube 20s linear infinite;
}

@keyframes rotateCube {
  0% {
    transform: rotateX(-20deg) rotateY(0deg);
  }

  100% {
    transform: rotateX(-20deg) rotateY(360deg);
  }
}

.cube {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.cube-face {
  position: absolute;
  width: 150px;
  height: 150px;
  border: 1px solid rgb(0 243 255 / 30%);
  background: rgb(10 14 39 / 95%);
  box-shadow:
    inset 0 0 40px rgb(0 243 255 / 15%),
    0 0 30px rgb(0 243 255 / 15%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

/* 亮模式样式调整 */
html:not(.dark) .cube-face {
  border: 1px solid rgb(64 158 255 / 30%);
  background: rgb(255 255 255 / 95%);
  box-shadow:
    inset 0 0 40px rgb(64 158 255 / 15%),
    0 0 30px rgb(64 158 255 / 15%);
}

.cube-logo {
  width: 80%;
  height: 80%;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgb(0 243 255 / 50%));
}

html:not(.dark) .cube-logo {
  filter: drop-shadow(0 0 10px rgb(64 158 255 / 50%));
}

.cube-face-front {
  transform: translateZ(75px);
}

.cube-face-back {
  transform: rotateY(180deg) translateZ(75px);
}

.cube-face-right {
  transform: rotateY(90deg) translateZ(75px);
}

.cube-face-left {
  transform: rotateY(-90deg) translateZ(75px);
}

.cube-face-top {
  transform: rotateX(90deg) translateZ(75px);
}

.cube-face-bottom {
  transform: rotateX(-90deg) translateZ(75px);
}
</style>
