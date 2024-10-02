import { createRouter, createWebHistory } from "vue-router";
import ShadowChat from "../views/ShadowChat.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Gate",
      component: ShadowChat,
      children: [
        {
          path: "/ShadowChat",
          name: "ShadowChat",
          component: ShadowChat
        }
      ]
    }
  ]
});

export default router;
