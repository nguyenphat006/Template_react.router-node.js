import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default 
[
    index("routes/home.tsx"),
    route("login", "./routes/auth/login-page.tsx"),
    route("signup", "./routes/auth/signup-page.tsx")

] satisfies RouteConfig;
