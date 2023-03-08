import Vue from "vue";
import VueRouter from "vue-router";
import GridView from "../views/GridView.vue";
import Canvas from "../views/CanvasView.vue";
import Leaderboard from "../views/LeaderboardView.vue";
import OwnedPixels from "../views/OwnedPixels.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "Grid",
  },
  {
    path: "/canvas",
    name: "Canvas",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: Canvas,
  },
  {
    path: "/grid",
    name: "Grid",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: GridView,
  },
  {
    path: "/leaderboard",
    name: "Leaderboard",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: Leaderboard,
  },
  {
    path: "/owned",
    name: "Owned",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: OwnedPixels,
  },
  {
    path: "/heatmap",
    name: "HeatMap",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/HeatMapView.vue"),
  },
];

const router = new VueRouter({
  mode: "hash",
  routes: routes,
});

export default router;
