
import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from "../models/user_model.js";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();


const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE;

export const connectToGoogle = () => {



    passport.use(
        new GoogleStrategy({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.CALLBACK_URL,
            scope: [
                'email',
                'profile'],
            // passReqToCallback: true
        }, async (accessToken, refreshToken, profile, done) => {
            if (profile.id) {
                const existingUser = await User.findOne({ $or: [{ googleID: profile?.id }, { email: profile?.emails[0]?.value }] });
                if (existingUser) {
                    if (existingUser.googleID !== profile?.id) {
                        const updatedUser = await User.findOneAndUpdate({ _id: existingUser._id }, { googleID: profile?.id })
                        return done(null, updatedUser);
                    }
                    return done(null, existingUser);
                } else {
                    const newUser = {
                        googleID: profile?.id,
                        email: profile?.emails[0]?.value,
                        firstName: profile?.name?.familyName || profile?.displayName || "Google",
                        lastName: profile?.name?.givenName || "User",
                        image: profile?.photos[0]?.value,
                        username: profile?.emails[0]?.value.split('@')[0] || profile?.id,
                        role: 0
                    }
                    const user = await User.create(newUser)
                    return done(null, user);
                }
            }
        })
    );

    passport.serializeUser((user, done) => {
        return done(null, user);
    })


    passport.deserializeUser(async (obj, cb) => {
        const user = await User.findById(obj._id);
        return user ? cb(null, user) : cb(null, null);
    });


}