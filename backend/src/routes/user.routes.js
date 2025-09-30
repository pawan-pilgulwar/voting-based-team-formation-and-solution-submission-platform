import { Router } from "express";

import { registerUser, loginUser, logoutUser, getUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


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
    registerUser)
    
router.route("/login").post(loginUser)

// router.get("/finduser",findUser);

router.route("/getuser").get(verifyJWT, getUser)

router.route("/logout").post(verifyJWT, logoutUser)

export default router