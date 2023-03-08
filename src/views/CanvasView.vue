<template>
  <v-container fluid>
    <v-container class="grey lighten-5" fluid>
      <v-row align="center" justify="center">
        <v-card
          width="200"
          height="200"
          class="pa-2 text-center"
          outlined
          tile
          @click="goToGrid(1)"
        >
          <div style="padding-top:80px" class="font-weight-black">
            Pixel 0-23
          </div>
        </v-card>
        <v-card
          width="200"
          height="200"
          class="pa-2 text-center"
          outlined
          tile
          @click="goToGrid(2)"
        >
          <div style="padding-top:80px" class="font-weight-black">
            Pixel 1250-2499
          </div>
        </v-card>
        <v-card
          width="200"
          height="200"
          class="pa-2 text-center"
          outlined
          tile
          @click="goToGrid(3)"
        >
          <div style="padding-top:80px" class="font-weight-black">
            Pixel 2500-3749
          </div>
        </v-card>
      </v-row>
    </v-container>
    <v-container class="grey lighten-5" fluid>
      <v-row align="center" justify="center">
        <v-card
          width="200"
          height="200"
          class="pa-2 text-center"
          outlined
          tile
          @click="goToGrid(4)"
        >
          <div style="padding-top:80px" class="font-weight-black">
            Pixel 3750-4999
          </div>
        </v-card>
        <v-card
          width="200"
          height="200"
          class="pa-2 text-center"
          outlined
          tile
          @click="goToGrid(5)"
        >
          <div style="padding-top:80px" class="font-weight-black">
            Pixel 5000-6249
          </div>
        </v-card>
        <v-card
          width="200"
          height="200"
          class="pa-2 text-center"
          outlined
          tile
          @click="goToGrid(6)"
        >
          <div style="padding-top:80px" class="font-weight-black">
            Pixel 6250-7499
          </div>
        </v-card>
      </v-row>
    </v-container>
    <v-container class="grey lighten-5" fluid>
      <v-row align="center" justify="center">
        <v-card
          width="200"
          height="200"
          class="pa-2 text-center"
          outlined
          tile
          @click="goToGrid(7)"
        >
          <div style="padding-top:80px" class="font-weight-black">
            Pixel 7500-8749
          </div>
        </v-card>
        <v-card
          width="200"
          height="200"
          class="pa-2 text-center"
          outlined
          tile
          @click="goToGrid(8)"
        >
          <div style="padding-top:80px" class="font-weight-black">
            Pixel 8750-9999
          </div>
        </v-card>
      
      </v-row>
    </v-container>
  </v-container>
</template>
<script>
export default {
  methods:{
    goToGrid(page){
      
    }
  }
};
</script>

<style></style>
