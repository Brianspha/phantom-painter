<template>
  <v-row justify="center">
    <v-dialog
      v-model="$store.state.showPixelDialog"
      persistent
      max-width="100%"
    >
      <v-card>
        <v-card-title class="text-h5"> Paint Pixel </v-card-title>
        <v-card-text
          >Paint Pixel <b>{{ $store.state.currentPixel.id }}</b></v-card-text
        >
        <v-container fluid>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-text-field
              label="Current Owner"
              v-model="$store.state.currentPixel.owner"
              readonly
              :color="$store.state.primaryColor"
            ></v-text-field>
            <div class="form__field">
              <div class="form__label">
                <strong>Please choose a color:</strong>
              </div>
              <div class="form__input">
                <v-swatches
                  v-model="$store.state.pickerColor"
                  show-fallback
                  fallback-input-type="color"
                ></v-swatches>
              </div>
            </div>
          </v-form>
        </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="$store.state.showPixelDialog = false">
            Close
          </v-btn>
          <v-btn
            v-if="valid"
            :color="$store.state.primaryColor"
            text
            @click="paintPixel"
          >
            Paint
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import VSwatches from "vue-swatches";
const { hexZeroPad } = require("essential-eth");
const utils = require("web3-utils");
// Import the styles too, typically in App.vue or main.js
import "vue-swatches/dist/vue-swatches.css";
export default {
  components: { VSwatches },
  data() {
    return {
      twitterUserName: "",
      usernameRules: [
        (v) => !!v || "Username required",
        (v) =>
          (v && v.length >= 4 && v.length <= 15) ||
          "Twitter username must be atleast 4 characters or less than equal to 15 characters",
      ],
      pickerColor: "#A463BF",
      valid: false,
      offerPrice: 0,
      priceRules: [
        (v) => !!v || "Offer Price is required",
        (v) =>
          (v && !isNaN(v) && parseFloat(v) > 0) ||
          "Offer Price must be a valid amount",
      ],
    };
  },
  mounted() {
    console.log("currentPixel: ", this.$store.state.currentPixel);
  },
  methods: {
    hexToRgb(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    },
    paintPixel: async function () {
      let _this = this;
      _this.$store.state.isLoading = true;
      if (this.$refs.form.validate()) {
        if (
          this.$store.state.currentPixel.owner.toUpperCase() ===
          this.$store.state.userAddress.toUpperCase()
        ) {
          this.$store.state.isLoading = false;
          _this.$store.state.showPixelDialog = true;
          var error = {
            error: "You cannot color a pixel you already own",
            onTap: () => {},
          };
          this.$store.dispatch("error", error);
        } else {
          try {
            const minCost = await _this.$store.state.fantomPainterContract.methods
              .minPaintCost()
              .call();
            const color = this.$store.state.pickerColor;
            await _this.$store.state.fantomPainterContract.methods
              .colorPixel(_this.$store.state.currentPixel.id, color)
              .send({
                value: minCost,
                from: _this.$store.state.userAddress,
              });
            
            _this.$store.state.isLoading = false;
            _this.$store.state.showPixelDialog = true;
            var message = {
              message:
                "Successfully painted pixel",
              onTap: () => {
                window.location.reload();
              },
            };
            this.$store.dispatch("successWithCallBack", message);
          } catch (error) {
            _this.$store.state.isLoading = false;
            _this.$store.state.showPixelDialog = true;
            var errorMessage = {
              error:
                "Something went wrong, please ensure you have enough tokens to make this transaction",
              onTap: () => {},
            };
            this.$store.dispatch("error", errorMessage);
          }
        }
      }
    },
  },
};
</script>

<style></style>
