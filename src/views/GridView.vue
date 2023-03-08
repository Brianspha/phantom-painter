<template>
  <v-container fluid>
    <v-row justify="center" align="center">
      <v-col sm="9">
        <v-text-field
          v-model="$store.state.selectedPixelID"
          type="number"
          :color="$store.state.primaryColor"
          label="Pixel Number"
          hint="0"
          required
        ></v-text-field>
        <v-row align="center" justify="center" no-gutters>
          <v-col cols="8" sm="6">
            <v-btn max-width="100" @click="colorPixel">Color</v-btn>
          </v-col>
          <v-col cols="8" sm="6">
            <v-btn @click="togglePixels">Show Pixel Numbers</v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row justify="center" align="center">
      <canvas
        id="myCanvas"
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
      width: window.innerWidth * 0.75,
      height: window.innerHeight * 0.85,
      validPositions: [],
      paintablePoints: [],
      pixelID: 0,
      indexY: 0,
      board: {},
      gridSize: 500,
      grid: [],
      pixelsToggled: true,
      pixelData: [],
    };
  },
  watch: {
    "$store.state.fantomPainterContract": async function (newVal, oldVal) {
      if (newVal) {
        this.init2();
        const details = await this.$store.state.fantomPainterContract.methods
          .getArtistDetails(this.$store.state.userAddress)
          .call({
            from: this.$store.state.userAddress,
            gas: 6000000,
          });
        this.$store.state.artistDetails = {
          ownedPixels: Number(details[0]),
          coolDownTimer: Number(details[1]* 1000) ,
        };
      }
    },
  },
  methods: {
    togglePixels: async function () {
      this.$store.state.isLoading = true;
      /* */ await this.init2();
      this.pixelsToggled = !this.pixelsToggled;
      this.$store.state.isLoading = false;
    },
    init: function () {
      let _this = this;
      this.$store.state.isLoading = true;
      var Grid = require("../js/grid/grid.js").Grid;
      var canvas = document.getElementById("myCanvas");
      this.resizeCanvas();
      const grid = new Grid(
        this.gridSize,
        30,
        canvas,
        this.$store.state.selectedQaudrantStart,
        this.pixelsToggled
      );

      this.grid = grid.getGrid();
      this.board = grid;
      this.$store.state.board = this.board;
      this.$store.state.grid = this.grid;
      for (var cell in this.$store.state.grid) {
        var innerCells = [];
        for (var innerGridCell in this.$store.state.grid[cell]) {
          var gridCell = this.$store.state.grid[cell][innerGridCell];
          gridCell.fillColor = "transparent";
          gridCell.strokeColor = "transparent";
          grid.set(gridCell.row, gridCell.col, gridCell, true);
          innerCells.push(gridCell);
        }
        this.pixelData.push(innerCells);
      }
      this.$store.state.isLoading = false;
    },
    init2: async function () {
      let _this = this;
      this.$store.state.isLoading = true;
      var Grid = require("../js/grid/grid.js").Grid;
      var canvas = document.getElementById("myCanvas");
      this.resizeCanvas();
      const grid = new Grid(
        this.gridSize,
        30,
        canvas,
        this.$store.state.selectedQaudrantStart,
        this.pixelsToggled
      );
      this.grid = grid.getGrid();
      this.board = grid;
      this.$store.state.board = this.board;
      this.$store.state.grid = this.grid;
      var coloredPixels = await this.$store.state.fantomPainterContract.methods
        .getPixelIndexes()
        .call({ from: _this.$store.state.userAddress, gas: 6000000 });
      for (var cell in this.$store.state.grid) {
        var innerCells = [];
        for (var innerGridCell in this.$store.state.grid[cell]) {
          var gridCell = this.$store.state.grid[cell][innerGridCell];
          if (coloredPixels.includes(gridCell.id.toString())) {
            var pixelDetails =
              await _this.$store.state.fantomPainterContract.methods
                .getPixelDetails(gridCell.id)
                .call({
                  from: _this.$store.state.userAddress,
                  gas: 6000000,
                });
            console.log("pixelDetails: ", pixelDetails);
            const fillColor = pixelDetails[3];
            const owner = pixelDetails[2];
            gridCell.owner = owner;
            gridCell.occupied = true;
            gridCell.fillColor = fillColor;
            gridCell.strokeColor = gridCell.fillColor;
            grid.set(gridCell.row, gridCell.col, gridCell, true);
            innerCells.push(gridCell);
          } else {
            gridCell.occupied = false;
            gridCell.fillColor = "transparent";
            gridCell.strokeColor = "transparent";
            grid.set(gridCell.row, gridCell.col, gridCell, true);
            innerCells.push(gridCell);
          }
        }
        this.pixelData.push(innerCells);
      }
      this.$store.state.isLoading = false;
    },
    colorPixel() {
      if (
        parseInt(this.$store.state.selectedPixelID) >= 0 &&
        parseInt(this.$store.state.selectedPixelID) <= 784
      ) {
        this.$store.state.isLoading = true;
        this.pixelData.map((cell) => {
          var tempCell = cell.filter(
            (gridCell) =>
              gridCell.id === parseInt(this.$store.state.selectedPixelID)
          );
          if (tempCell.length > 0) {
            tempCell = tempCell[0];
            this.$store.state.isLoading = false;
            this.$store.state.currentPixel = tempCell;
            this.$store.state.showPixelDialog = true;
            if (tempCell.fillColor !== undefined) {
              this.$store.state.currentPixel = tempCell;
            }
          }
          return cell;
        });
      } else {
        var message = {
          warning: "Please enter a Pixel within the size of the canvas",
          onTap: () => {},
        };
        this.$store.dispatch("warning", message);
      }
    },
    resizeCanvas() {
      var canvas = document.getElementById("myCanvas");
      if (canvas) {
        canvas.width = this.width;
        canvas.height = this.height;
      }
    },
  },
  mounted() {
    this.$store.state.loadingZIndex = 0;
    this.init();
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
