import express, { Router } from "express";
import {
  checkEmail,
  createUser,
  editUser,
  loginUser,
  logoutUser,
  resetPassword,
  updatePssUser,
  validateNewAccessToken,
} from "../controllers/user.controller";
import {
  validateAccessTokenMiddleware,
  validateEmailTokenMiddleware,
  validateRefreshTokenMiddleware,
} from "../middleware";

const userRoutes: Router = express.Router();

userRoutes.post("/checkemail", checkEmail); // OK!
userRoutes.post("/resetpassword", resetPassword);
userRoutes.post("/create", validateEmailTokenMiddleware, createUser); // OK!
userRoutes.post("/login", loginUser); // OK!
userRoutes.put("/updatepuser/:id", validateEmailTokenMiddleware, updatePssUser); // OK!
userRoutes.put("/edit/:id", validateAccessTokenMiddleware, editUser);
userRoutes.post("/logout", logoutUser);
userRoutes.get("/validatetoken", validateRefreshTokenMiddleware, validateNewAccessToken);

export default userRoutes;
