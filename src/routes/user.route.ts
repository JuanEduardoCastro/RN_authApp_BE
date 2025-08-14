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

userRoutes.get("/validatetoken", validateRefreshTokenMiddleware, validateNewAccessToken);
userRoutes.post("/checkemail", checkEmail);
userRoutes.post("/resetpassword", resetPassword);
userRoutes.post("/create", validateEmailTokenMiddleware, createUser);
userRoutes.post("/login", loginUser);
userRoutes.put("/updatepuser/:id", validateEmailTokenMiddleware, updatePssUser);
userRoutes.put("/edit/:id", validateAccessTokenMiddleware, editUser);
userRoutes.post("/logout", logoutUser);

export default userRoutes;
