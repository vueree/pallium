import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "../pages/LoginPage.vue";
import ChatPage from "../pages/ChatPage.vue";
import Register from "../pages/Register.vue";

const routes = [
  {
    path: "/",
    name: "Login",
    component: LoginPage
  },
  {
    path: "/register",
    name: "Registration",
    component: Register
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
