import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/Users.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, name } = req.body;
    
    // Validation
    if (
        [username, email, password, name].some(field => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required");
    }
    
    
    const existerUser = await User.findOne({
        $or: [{ email }, { username}]
    })
    
    if (existerUser) {
        throw new ApiError(400, "User already exists with this email or username");
    }
    
    // Upload avatar and cover image to cloudinary
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverLocalPath = req.files?.coverImage[0]?.path
    
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }


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
    const user = await User.create({
        username,
        avatar: avatar?.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        name,
        body
    })
    // const user = await User.create({body, avatar: avatar?.url, coverImage: coverImage?.url || ""})

    const createdUser = await User.findById(user._id).select("-password -refereshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));

});

export { registerUser };