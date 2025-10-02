import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/Users.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefereshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefereshToken();
        
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, name, role, gender } = req.body;
    
    // Validation
    if (
        [username, email, password, name].some(field => (typeof field === 'string') ? field?.trim() === "" : !field)
    ){
        throw new ApiError(400, "All fields are required");
    }

    // Validate role and gender for specific roles
    const allowedRoles = ["student", "mentor", "orgAdmin", "superAdmin"]
    if (!allowedRoles.includes(role)) {
        throw new ApiError(400, "Invalid role provided")
    }
    if ((role === "student" || role === "mentor") && !["male","female","other"].includes(gender)) {
        throw new ApiError(400, "Gender is required for student and mentor roles")
    }
    
    const existerUser = await User.findOne({
        $or: [{ email }, { username}]
    })
    
    if (existerUser) {
        throw new ApiError(400, "User already exists with this email or username");
    }
    
    // Upload avatar and cover image to cloudinary
    const avatarLocalPath = req.files?.avatar[0]?.path || ""
    const coverLocalPath = req.files?.coverImage[0]?.path || ""


    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath)
        console.log("Avatar uploaded successfully:", avatar);
    } catch (error) {
        console.error("Error uploading avatar:", error);
        throw new ApiError(500, "Failed to upload avatar");
    }
    
    
    let coverImage;
    try {
        if (coverLocalPath) {
            coverImage = await uploadOnCloudinary(coverLocalPath)
            console.log("Cover image uploaded successfully:", coverImage);
        }
    } catch (error) {
        console.error("Error uploading cover image:", error);
        throw new ApiError(500, "Failed to upload cover image");
    }

    const body = req.body;
    body.email = body.email.toLowerCase().trim();
    body.username = body.username.trim();
    
    try {
        // Build creation payload honoring discriminator by role
        const createPayload = {
            username,
            avatar: avatar?.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            name,
            role,
        }
        // Attach role-specific fields
        if (role === "student") {
            createPayload.gender = gender
            // Optional extras
            if (body.year) createPayload.year = body.year
            if (body.branch) createPayload.branch = body.branch
            if (body.skills) createPayload.skills = Array.isArray(body.skills) ? body.skills : String(body.skills).split(",").map(s=>s.trim()).filter(Boolean)
            if (body.preferredTeamRoles) createPayload.preferredTeamRoles = Array.isArray(body.preferredTeamRoles) ? body.preferredTeamRoles : String(body.preferredTeamRoles).split(",").map(s=>s.trim()).filter(Boolean)
        } else if (role === "mentor") {
            createPayload.gender = gender
            if (body.expertise || body.skills) {
                const exp = body.expertise || body.skills
                createPayload.expertise = Array.isArray(exp) ? exp : String(exp).split(",").map(s=>s.trim()).filter(Boolean)
                createPayload.skills = createPayload.expertise
            }
            if (body.availability) createPayload.availability = body.availability
        } else if (role === "orgAdmin") {
            if (body.organizationName) createPayload.organizationName = body.organizationName
            if (body.designation) createPayload.designation = body.designation
        }

        const user = await User.create(createPayload)
    
        const createdUser = await User.findById(user._id).select("-password -refereshToken")
    
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering user");
        }

        const tokens = await generateAccessAndRefereshToken(createdUser._id);

        const isProd = process.env.NODE_ENV === "production";
        const options = {
            httpOnly: true,
            // In production we need cross-site cookies for frontend on different origin
            sameSite: isProd ? "none" : "lax",
            path: "/",
            secure: isProd,
        }

        return res
            .cookie("refreshToken", tokens.refreshToken, options)
            .cookie("accessToken", tokens.accessToken, options)
            .json(new ApiResponse(
                200, 
                { user: createdUser, tokens }, 
                "User logged in successfully"
            ));
            
    } catch (error) {
        console.error("User Creation failed");

        if (avatar){
            await deleteFromCloudinary(avatar.public_id);
        }

        if (coverImage) {
            await deleteFromCloudinary(coverImage.public_id);
        }

        throw new ApiError(500, "Something went wrong while registering user and images were deleated");
    }

});


const loginUser = asyncHandler(async (req, res) => {
    const { email, password} = req.body;
    
    // Validation
    if (!email) {
        throw new ApiError(400, "Email is required");
    }
    
    const user = await User.findOne({email});
    
    if (!user) {
        throw new ApiError(404, "User not found with this email or username");
    }
    
    // Validate password
    const isPasswordValid = await user.isPasswordCorrect(password);
    
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }
    
    const tokens = await generateAccessAndRefereshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refereshToken");

    const isProd = process.env.NODE_ENV === "production";
    const options = {
        httpOnly: true,
        // In production we need cross-site cookies for frontend on different origin
        sameSite: isProd ? "none" : "lax",
        path: "/",
        secure: isProd,
    }

    return res
        .cookie("refreshToken", tokens.refreshToken, options)
        .cookie("accessToken", tokens.accessToken, options)
        .json(new ApiResponse(
            200, 
            { user: loggedInUser, tokens }, 
            "User logged in successfully"
        ));
})

const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: "",
            }
        },
        {new: true}
    )

    const isProd = process.env.NODE_ENV === "production";
    const options = {
        httpOnly: true,
        sameSite: isProd ? "none" : "lax",
        path: "/",
        secure: isProd,
    }

    return res
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json( new ApiResponse(200, {}, "User loggout successfully"))

})

const getUser = asyncHandler(async (req, res) => {
  try {
    const userID = req.user._id; // JWT middleware should set req.id

    if (!userID) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Fetch user from DB
    const user = await User.findById(userID)
      .select("-password -refreshToken") // exclude sensitive info
      .lean(); // optional, returns plain JS object instead of Mongoose doc

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const refershAccessToken = asyncHandler(async (req, res) => {
    const incomingRefereshToken = req.cookies.refreshToken

    if (!incomingRefereshToken) {
        throw new ApiError(401, "Referesh token is required")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefereshToken,
            process.env.REFERESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid referesh token")
        } 

        if (incomingRefereshToken !== user.refreshToken) {
            throw new ApiError(401, "Invalid referesh token")
        }

        const isProd = process.env.NODE_ENV === "production";
        const options = {
            httpOnly: true,
            sameSite: isProd ? "none" : "lax",
            path: "/",
            secure: isProd,
        }

        const {accessToken, refreshToken: newRefereshToken} = await generateAccessAndRefereshToken(user._id)

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefereshToken, options)
        .json(
            new ApiResponse(
                200, 
                { accessToken, refreshToken: newRefereshToken }, 
                "Access Token refereshed successfully"
            ))

    } catch (error) {
        throw new ApiError(500, "Something went wrong while refereshing access token")
    }
})

export { registerUser, loginUser, getUser, refershAccessToken, logoutUser };