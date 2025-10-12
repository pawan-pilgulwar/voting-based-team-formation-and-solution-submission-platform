import { Router } from "express";

import { registerUser, loginUser, logoutUser, getUser, updateUser, changePassword } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../validations/user.validation.js";


const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },{
            name: "coverImage",
            maxCount: 1 
        }
    ]),
    validate(registerSchema),
    registerUser)
    
router.route("/login").post(validate(loginSchema), loginUser)

// router.get("/finduser",findUser);

router.route("/getuser").get(verifyJWT, getUser)

router.route("/logout").post(verifyJWT, logoutUser);

// Update user profile
router.route("/update-profile").patch(
  verifyJWT,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateUser
);

// Change password
router.route("/change-password").post(verifyJWT, changePassword);

export default router;