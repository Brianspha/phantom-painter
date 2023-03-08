<template>
  <v-container fluid>
    <v-row justify="center" align="center" style="padding-bottom: 10px">
      <v-btn @click="togglePixels">Show Pixel Numbers</v-btn>
    </v-row>
    <v-row justify="center" align="center">
      <canvas
        id="myCanvasOwned"
        class="gridCanvas"
        :width="width"
        :height="height"
      ></canvas
    ></v-row>
    <pixel-modal />
  </v-container>
</template>

<script>
import pixelModal from "../modals/PixelModal.vue";

export default {
  name: "xon-GridCanvas",
  components: {
    "pixel-modal": pixelModal,
  },
  data() {
    return {
      width: window.innerWidth,
      height: window.innerHeight - 10,
      validPositions: [],
      paintablePoints: [],
      pixelID: 0,
      indexY: 0,
      board: {},
      gridSize: 13000,
      grid: [],
      pixelsToggled: false,
      pixelData: [],
    };
  },

  methods: {
    togglePixels: async function () {
      this.$store.state.isLoading = true;
      /* */ await this.init2();
      this.pixelsToggled = !this.pixelsToggled;
      this.$store.state.isLoading = false;
    },
    init2: async function () {
      // console.log("grid: ", this.board);
    },
    resizeCanvas() {
      var canvas = document.getElementById("myCanvasOwned");
      canvas.width = this.width;
      canvas.height = this.height;
    },
  },
  mounted() {
    this.$store.state.loadingZIndex = 0;
    this.init2();
  },
};
</script>

<style scoped>
.gridCanvas {
  position: relative !important;
  border: lightgrey 1px solid;
  border-radius: 5px;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
}
body {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: whitesmoke;
}

canvas {
  border: 1px solid red;
  background-color: rgb(255, 255, 255);
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
