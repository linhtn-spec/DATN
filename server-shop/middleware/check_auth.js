import jwt from "jsonwebtoken";
import { filterXSS } from 'xss';
import user_model from "../models/user_model.js";
export const checkAuth = async (req, res, next) => {
    try {
        const accessToken = filterXSS(req.cookies.access_token);
        if (!accessToken) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
        
        // Use callback-based jwt.verify (not await)
        jwt.verify(
            accessToken,
            accessTokenSecret,
            async (err, decoded) => {
                try {
                    if (err) {
                        if (err.name === 'TokenExpiredError') {
                            return res
                                .status(401)
                                .json({ message: err.message });
                        }
                        if (err.name === 'JsonWebTokenError') {
                            return res
                                .status(403)
                                .json({ message: err.message });
                        }
                        // Catch-all for other errors
                        return res.status(403).json({ message: "Invalid token" });
                    }
                    const user = await user_model.findOne({ username: decoded.username })
                    if (!user) {
                        return res.status(404).json({ message: "Not found user" });
                    }
                    if (decoded.role < 0 || decoded.role > 4) {
                        return res.status(405).json({ message: "Not allowed to access" });
                    }
                    const { password, refreshToken, ...userWithoutPassword } = user._doc;
                    req.user = userWithoutPassword;
                    next();
                } catch (innerErr) {
                    return res.status(500).json({ message: innerErr.message });
                }
            });

    } catch (err) {
        return res.status(501).json({ message: err.message });
    }
};


export const authRole = (minRole) => {
    return (req, res, next) => {
        const { role } = req.user
        if (role >= minRole) next()
        else return res.status(403).json({ message: "You have no permission" })
    }
}