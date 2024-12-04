import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "../pages/LoginPage.vue";
import ChatPage from "../pages/ChatPage.vue";
import RegisterPage from "../pages/RegisterPage.vue";

const routes = [
  {
    path: "/",
    name: "Login",
    component: LoginPage
  },
  {
    path: "/register",
    name: "Registration",
    component: RegisterPage
  },
  {
    path: "/chat",
    name: "Chat",
    component: ChatPage
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
