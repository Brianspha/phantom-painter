<template>
  <!-- App.vue -->

  <v-app>
    <v-app-bar app>
      <v-app-bar-title><div>Fantom Painter</div></v-app-bar-title>
      <v-row justify="end" align="end">
        <vac
          v-if="$store.state.connected && $store.state.userAddress.length > 0"
          style="font-weight: normal; color: black; padding-bottom: 7px"
          :end-time="$store.state.artistDetails.coolDownTimer"
        >
          <template v-slot:process="{ timeObj }">
            <span
              >Cooldown Timer for minting
              {{ `${timeObj.d}  days ${timeObj.h}:${timeObj.m}:${timeObj.s}` }}
            </span>
          </template>
          <template v-slot:finish>
            <span>Cool down ended</span>
          </template>
        </vac>
        <v-btn
          width="230"
          v-if="
            !$store.state.connected && $store.state.userAddress.length === 0
          "
          @click="connectWallet"
          text
        >
          <v-icon left dark> mdi-ethereum</v-icon>
          Connect
        </v-btn>
        <v-btn
          width="230"
          v-if="$store.state.connected || $store.state.userAddress.length > 0"
          text
        >
          <v-icon left dark> mdi-ethereum</v-icon>
          {{
            $store.state.userAddress.substring(0, 6) +
            ".." +
            $store.state.userAddress.substring(
              $store.state.userAddress - 4,
              $store.state.userAddress.length
            )
          }}
        </v-btn>
      </v-row>
    </v-app-bar>

    <!-- Sizes your content based upon application components -->
    <v-main>
      <!-- Provides the application the proper gutter -->
      <v-container fluid>
        <!-- If using vue-router -->
        <router-view></router-view>
      </v-container>
      <v-overlay
        :z-index="$store.state.loadingZIndex"
        :value="$store.state.isLoading"
        class="align-center justify-center"
      >
        <v-progress-circular
          :color="$store.state.primaryColor"
          indeterminate
          size="64"
        ></v-progress-circular>
      </v-overlay>
    </v-main>
    <v-footer app>
      <!-- -->
    </v-footer>
  </v-app>
</template>

<script>
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";

export default {
  data() {
    return {
      drawer: false,
    };
  },
  components: {},
  mounted() {
    this.init().then((val) => {
      console.log("init completed: ", val);
    });
  },
  methods: {
    connectWallet: async function () {
      if (typeof ethereum !== "undefined") {
        ethereum.enable();
        ethereum
          .request({
            method: "eth_requestAccounts",
          })
          .then((accounts) => {
            this.$store.state.userAddress = accounts[0];
            this.$store.state.connected = true;
            this.$store.state.fantomPainterContract =
              new this.$store.state.Web3EthContract(
                this.$store.state.FANTOM_PAINTER_ABI,
                this.$store.state.FantomPainterAddress
              );
            this.$store.state.tokenContract =
              new this.$store.state.Web3EthContract(
                this.$store.state.TOKEN_CONTRACT_ABI,
                this.$store.state.tokenContractAddress
              );
          })
          .catch((error) => {
            console.error("error: ", error);
            this.$store.dispatch("error", {
              error: "There was an error getting enabling metamask",
            });
          });
      } else {
        this.$store.dispatch(
          "errorWithFooterMetamask",
          "Seems like you don't have metamask installed please use the below link to download"
        );
      }
    },
    detectPageReload() {
      if (window.performance) {
        console.info("window.performance works fine on this browser");
      }
      console.info(performance.navigation.type);
      if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
        console.info("This page is reloaded");
        window.location.href = "./index.html";
      } else {
        console.info("This page is not reloaded");
      }
    },
    init: async function () {
      let _this = this;
      this.detectPageReload();
      const provider = await detectEthereumProvider();
      if (provider && !this.$store.state.connected) {
        this.$store.state.Web3EthContract.setProvider(provider);
        await this.connectWallet();
        this.$store.state.connected = true;
        if (typeof ethereum !== "undefined") {
          // Supports EIP-1102 injected Ethereum providers.
          window.web3 = new Web3(ethereum);
        } else if (typeof web3 !== "undefined") {
          // Supports legacy injected Ethereum providers.
          window.web3 = new Web3(web3.currentProvider);
        } else {
          window.web3 = new Web3(
            new Web3.providers.HttpProvider("http://localhost:8546")
          );
        }
        window.web3.eth.net.getId((err, netId) => {
          console.log("netId: ", netId);
          switch (netId) {
            case 3:
              this.$store.state.connected = true;
              break;
            default:
              this.$store.state.connected = true;

              /*  this.$store.state.connected = true;
        require("sweetalert2")
        .fire({
          title:
            "Incompatible network detected please switch to the ropsten test network",
          confirmButtonText: `Close`,
        })
        .then((result) => {
          window.location.reload();
        });*/
              break;
          }
        });
        window.ethereum.on("accountsChanged", function (accounts) {
          _this.$store.state.userAddress = accounts[0];
          // window.location.reload();
        });
        window.ethereum.on("networkChanged", function (netId) {
          _this.$store.state.userAddress = accounts[0];
          //window.location.reload();
        });
      } else {
        console.log("Please install MetaMask!");
        this.$store.dispatch(
          "errorWithFooterMetamask",
          "Metamask not installed"
        );
      }
    },
  },
};
</script>

<style></style>
