import { createRouter, createWebHistory } from "vue-router";
import ChatArea from "@/views/ChatArea.vue";
import LoginPage from "@/views/LoginPage.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "LoginPage",
      component: LoginPage,
      children: [
        {
          path: "/ChatArea",
          name: "ChatArea",
          component: ChatArea
        }
      ]
    }
  ]
});

export default router;
