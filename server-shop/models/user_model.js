import bcrypt from 'bcryptjs';
import mongoose from "mongoose";
import moongosePaginate from 'mongoose-paginate-v2';

const user_schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        min: 3,
        max: 50,
        trim: true
    },
    email: {
        type: String,
        required: true,
        min: 6,
        max: 50,
        trim: true
    },
    address: {
        type: String,
        min: 3,
        max: 150,
        trim: true
    },
    password: {
        type: String,
        required: function () {
            // Only required if googleID is not present
            return !this.googleID;
        },
        min: 6,
        max: 50,
        trim: true
    },
    gender: {
        type: String,
        required: false,
        enum: ["female", "male", "other"],
        default: "other",
        trim: true
    },
    role: {
        type: Number,
        enum: [0, 1, 2, 3],
        default: 0,
    },
    firstName: {
        type: String,
        required: true,
        min: 3,
        max: 50,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        min: 3,
        max: 50,
        trim: true
    },
    phone: {
        type: String,
        min: 10,
        max: 13,
        trim: true
    },
    googleID: {
        type: String,
    },
    refreshToken: {
        type: String,
    },
    image: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    },
    verificationTokenExpires: {
        type: Date
    }
},
    {
        timestamps: true
    })

user_schema.plugin(moongosePaginate)

// Hash password before saving a new user or when password is modified
user_schema.pre('save', async function (next) {
    try {
        if (this.isModified && this.isModified('password')) {
            const salt = await bcrypt.genSalt(12);
            this.password = await bcrypt.hash(this.password, salt);
        }
        next();
    } catch (err) {
        next(err);
    }
});

// Hash password on findOneAndUpdate or update queries when password is present
user_schema.pre('findOneAndUpdate', async function (next) {
    try {
        const update = this.getUpdate();
        if (!update) return next();

        // password may be at top-level or under $set
        let newPassword = update.password || (update.$set && update.$set.password);
        if (newPassword) {
            const salt = await bcrypt.genSalt(12);
            const hashed = await bcrypt.hash(newPassword, salt);
            if (update.password) update.password = hashed;
            else {
                update.$set = update.$set || {};
                update.$set.password = hashed;
            }
            this.setUpdate(update);
        }
        next();
    } catch (err) {
        next(err);
    }
});
export default mongoose.model("User", user_schema);

