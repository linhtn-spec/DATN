import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { forget_password_form, forget_password_subject, forget_password_text } from "../form_mail/forget_password.js";
import user_model from "../models/user_model.js";
import { sendEmail } from "../nodemailer/nodemailer_config.js";
import { options } from "../paginate/options.js";
import crypto from "crypto";
import { verify_email_form, verify_email_subject, verify_email_text } from "../form_mail/verify_email.js";

const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE;
const parseTimeToMs = (timeStr) => {
    const unit = timeStr.slice(-1);
    const value = parseInt(timeStr.slice(0, -1));
    switch (unit) {
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 'm': return value * 60 * 1000;
        case 's': return value * 1000;
        default: return parseInt(timeStr);
    }
};

const getVerificationTokenLifeMs = () => {
    const life = process.env.VERIFICATION_TOKEN_LIFE || '24h';
    return parseTimeToMs(life);
};



export const login = async (req, res) => {
    try {
        const data = req.body;
        const user = await user_model.findOne({ email: data.email });
        if (!user) {
            return res.status(404).json({ message: "Email không tồn tại" });
        }
        if (!user.isActive) {
            return res.status(401).json({ message: "Tài khoản đang bị khóa" });
        }
        if (!user.isVerified) {
            return res.status(401).json({ message: "Vui lòng xác nhận email của bạn trước khi đăng nhập" });
        }
        const verify = await bcrypt.compare(data.password, user.password);
        if (!verify) {
            return res.status(404).json({ message: "Mật khẩu không chính xác" });
        }
        const dataForAccessToken = {
            username: user.username,
            role: user.role,
            user_id: user._id
        };

        const accessToken = jwt.sign(dataForAccessToken, accessTokenSecret, { expiresIn: accessTokenLife });
        if (!accessToken) {
            return res
                .status(503)
                .json({ message: 'Đăng nhập thất bại, thử lại' });
        }

        const dataForRefreshToken = {
            username: user.username,
            user_id: user._id
        };
        let refreshToken = jwt.sign(dataForRefreshToken, refreshTokenSecret, { expiresIn: refreshTokenLife });
        if (!refreshToken) {
            return res
                .status(503)
                .json({ message: 'Đăng nhập thất bại, thử lại' });
        }
        if (!user.refreshToken) {
            await user_model.findOneAndUpdate({ _id: user._id }, { refreshToken: refreshToken })
        }
        else {
            refreshToken = user.refreshToken;
        }
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie("refresh_token", refreshToken, { httpOnly: true, secure: isProduction, sameSite: isProduction ? "strict" : "lax", maxAge: 60 * 60 * 1000 * 24 });
        res.cookie("access_token", accessToken, { httpOnly: true, secure: isProduction, sameSite: isProduction ? "strict" : "lax", maxAge: 60 * 60 * 1000 * 24 });
        return res.status(200).json({
            user_id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            username: user.username,
            email: user.email,
            gender: user?.gender,
            address: user?.address,
            image: user?.image,
            phone: user?.phone,

        })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const register = async (req, res) => {

    try {
        const data = req.body;
        const checkUsername = await user_model.findOne({ username: data.username });
        if (checkUsername) {
            return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });
        }
        const checkEmail = await user_model.findOne({ email: data.email });
        if (checkEmail) {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }

        // Generate verification token and expiration
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = Date.now() + getVerificationTokenLifeMs();
        const user = await user_model.create({ ...data, verificationToken, verificationTokenExpires });

        if (user) {
            const from = process.env.NODEMAILER_EMAIL;
            await sendEmail(
                from,
                user.email,
                verify_email_subject,
                verify_email_text(verificationToken),
                verify_email_form(verificationToken)
            );

            return res.status(201).json({ message: "Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản." });
        }
        else {
            return res.status(400).json({ message: "Đăng ký thất bại" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await user_model.findOne({ verificationToken: token });

        if (!user) {
            console.log(`VerifyEmail: Token not found: ${token}`);
            return res.status(404).json({ message: "Mã xác thực không hợp lệ" });
        }

        const now = Date.now();
        const expiresAt = user.verificationTokenExpires ? user.verificationTokenExpires.getTime() : 0;

        console.log(`VerifyEmail Check:`, {
            email: user.email,
            expiresAt: new Date(expiresAt).toISOString(),
            now: new Date(now).toISOString(),
            isExpired: expiresAt < now
        });

        if (expiresAt < now) {
            return res.status(410).json({ 
                message: "Mã xác thực đã hết hạn", 
                email: user.email 
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        return res.status(200).json({ message: "Xác nhận email thành công. Bạn có thể đăng nhập ngay bây giờ." });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await user_model.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "Email không tồn tại" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Email này đã được xác nhận" });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const lifeMs = getVerificationTokenLifeMs();
        const verificationTokenExpires = Date.now() + lifeMs;
        
        console.log(`ResendVerification:`, {
            email: user.email,
            lifeMs,
            expiresAt: new Date(verificationTokenExpires).toISOString()
        });

        user.verificationToken = verificationToken;
        user.verificationTokenExpires = verificationTokenExpires;
        await user.save();

        const from = process.env.NODEMAILER_EMAIL;
        await sendEmail(
            from,
            user.email,
            verify_email_subject,
            verify_email_text(verificationToken),
            verify_email_form(verificationToken)
        );

        return res.status(200).json({ message: "Gửi lại email xác nhận thành công. Vui lòng kiểm tra hộp thư của bạn." });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("refresh_token")
        res.clearCookie("access_token")
        return res.status(200).json({ message: "Đăng xuất thành công" });
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const loginByGoogle = async (req, res) => {
    const user = req.user
    if (!user) return res
        .status(503)
        .json({ message: 'Đăng nhập thất bại, thử lại' });
    const dataForAccessToken = {
        username: user?.username,
        role: user?.role,
        user_id: user?._id
    };

    const accessToken = jwt.sign(dataForAccessToken, accessTokenSecret, { expiresIn: accessTokenLife });
    if (!accessToken) {
        return res
            .status(503)
            .json({ message: 'Đăng nhập thất bại, thử lại' });
    }

    const dataForRefreshToken = {
        username: user.username,
        user_id: user._id
    };
    let refreshToken = jwt.sign(dataForRefreshToken, refreshTokenSecret, { expiresIn: refreshTokenLife });
    if (!refreshToken) {
        return res
            .status(503)
            .json({ message: 'Đăng nhập thất bại, thử lại' });
    }
    if (!user.refreshToken) {
        await user_model.findOneAndUpdate({ _id: user._id }, { refreshToken: refreshToken })
    }
    else {
        refreshToken = user.refreshToken;
    }
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie("refresh_token", refreshToken, { httpOnly: true, secure: isProduction, sameSite: isProduction ? "strict" : "lax", maxAge: 60 * 60 * 1000 * 24 });
    res.cookie("access_token", accessToken, { httpOnly: true, secure: isProduction, sameSite: isProduction ? "strict" : "lax", maxAge: 60 * 60 * 1000 * 24 });
    return res.status(200).json({
        user_id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        username: user.username,
        email: user.email,
        address: user?.address,
        gender: user?.gender,
        phone: user?.phone,
        image: user?.image
    })
}


export const refresh_token = async (req, res) => {
    try {

        const accessToken = req.cookies.access_token;
        const refreshToken = req.cookies.refresh_token;


        if (!accessToken) {
            return res.status(401).json({ message: "Access token không khả dụng" });
        }
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token không khả dụng" });
        }

        let decoded;
        try {
            decoded = jwt.verify(accessToken, accessTokenSecret, { ignoreExpiration: true });
        } catch (err) {
            return res.status(401).json({ message: "Access token không hợp lệ" });
        }

        if (!decoded) {
            return res.status(404).json({ message: "Không khả dụng" });
        }
        const { user_id, role } = decoded
        const user = await user_model.findOne({ _id: user_id });
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        if (refreshToken !== user.refreshToken) {
            return res.status(403).json({ message: "Không được cho phép" });
        }
        let checkRT;
        try {
            checkRT = jwt.verify(refreshToken, refreshTokenSecret);
        } catch (err) {
            // Refresh token expired or invalid - create new one
            const dataForRefreshToken = {
                username: user.username,
                user_id: user._id
            };
            const refreshTokenNew = jwt.sign(dataForRefreshToken, refreshTokenSecret, { expiresIn: refreshTokenLife });
            if (!refreshTokenNew) {
                return res
                    .status(503)
                    .json({ message: 'Đăng nhập thất bại, thử lại' });
            }
            await user_model.findOneAndUpdate({ _id: user._id }, { refreshToken: refreshTokenNew })
            res.cookie("refresh_token", refreshTokenNew, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 60 * 60 * 1000 * 24 });
            checkRT = jwt.verify(refreshTokenNew, refreshTokenSecret);
        }
        if (checkRT.user_id !== user._id || checkRT.username !== user.username)
            return res.status(403).json({ message: "Không được cho phép" });

        const dataForAccessToken = {
            username: user.username,
            role
        };
        const accessTokenNew = jwt.sign(dataForAccessToken, accessTokenSecret, { expiresIn: accessTokenLife });
        if (!accessTokenNew) {
            return res
                .status(500).json({ message: "Lỗi hệ thống" });
        }
        res.cookie("access_token", accessTokenNew, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 60 * 60 * 1000 * 24 });
        return res.status(201).json({ message: "Làm mới access token thành công" });
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }

}



export const getAll = async (req, res) => {
    try {
        const data = await user_model.paginate({}, options);
        if (data.totalDocs === 0) {
            return res.status(404).json({ message: "Không có người dùng" });
        }
        return res.status(200).json({ ...data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const updateUser = async (req, res) => {
    const { firstName, lastName, phone, image, role, address, isActive } = req.body
    const { user_id } = req.params
    try {
        const updatedUser = await user_model.findOneAndUpdate({ _id: user_id }, req.body, { new: true })
        if (updatedUser) return res.status(200).json({ ...updatedUser });
        return res.status(404).json({ message: "Không khả dụng" });
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const detailUser = async (req, res) => {
    const { user_id } = req.params;
    try {
        const data = await user_model.findOne({ _id: user_id })
        return res.status(200).json({ ...data });
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const deleteUser = async (req, res) => {
    const { user_id } = req.params;
    try {
        const data = await user_model.findOneAndDelete({ _id: user_id })
        if (data) return res.status(200).json({ message: "Hoàn tất" });
        return res
            .status(404)
            .json({ message: 'Không tìm thấy người dùng' });
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const forgetPassword = async (req, res) => {
    const { email } = req.body;
    const from = process.env.NODEMAILER_EMAIL
    try {
        const data = await user_model.findOne({ email: email })
        if (!data) {
            return res.status(404).json({ message: 'Email không tồn tại' });
        }
        if (!data.isActive) {
            return res.status(401).json({ message: "Email đang bị khóa" });
        }
        
        const dataForRefreshToken = {
            username: data.username,
            user_id: data._id
        };
        const resetPasswordToken = jwt.sign(dataForRefreshToken, refreshTokenSecret, { expiresIn: 1000 * 60 * 10 });
        await sendEmail(from, email, forget_password_subject, forget_password_text, forget_password_form(resetPasswordToken))
        return res.status(200).json({ message: "Gửi email thành công" });
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const resetPassword = async (req, res) => {
    const { password, token } = req.body
    try {
        const { username, user_id } = jwt.verify(token, refreshTokenSecret)
        if (user_id) {
            const data = await user_model.findOneAndUpdate({ _id: user_id, username: username }, { password: password }, { new: true })
            if (data) {
                return res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
            }
            return res.status(503).json({ message: 'Đặt lại mật khẩu thất bại' });
        }
        return res.status(503).json({ message: 'Yêu cầu đã hết hạn' });
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const getCurrentUser = async (req, res) => {
    try {
        const user = req.user;
        return res.status(200).json({ ...user })
    } catch (error) {
        return res.status(500).json({ message: error.message })

    }
}





export const resetPasswordCurrentUser = async (req, res) => {
    try {
        const data = req.body;
        const currentUser = req.user
        const user = await user_model.findById(currentUser._id);
        if (!user) {
            return res.status(400).json({ message: "Không được cho phép" });
        }
        if (!user.isActive) {
            return res.status(401).json({ message: "Tài khoản đang bị khóa" });
        }
        const verify = await bcrypt.compare(data.current_password, user.password);
        if (!verify) {
            return res.status(404).json({ message: "Mật khẩu hiện tại không chính xác" });
        }
        const updatedUser = await user_model.findOneAndUpdate({ _id: currentUser._id }, { password: data.new_password }, { new: true })
        if (updatedUser) {
            return res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
        }
        return res.status(503).json({ message: 'Đặt lại mật khẩu thất bại' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const paginate_user = async (req, res) => {
    const { email, role, name, page, isActive } = req.query
    const user_role = req.user.role
    const user_id = req.user._id
    const query = {}
    if (email) query.email = email
    if (isActive) query.isActive = isActive

    if (role) {
        if (user_role !== 3)
            query.role = { $nin: [0, 3] };
        query.role = { $in: role };
    } else if (!role) {
        if (user_role !== 3)
            query.role = { $nin: [0, 3] };
        query.role = { $ne: 0 };
    }
    const nameQuery = name ? {
        $or: [
            { firstName: { $regex: new RegExp(name, "iuy") } },
            { lastName: { $regex: new RegExp(name, "iuy") } }
        ]
    } : {};
    const limit = 6;
    const skip = page ? (page - 1) * limit : 0;
    try {
        const results = await user_model.paginate({ ...query, ...nameQuery, _id: { $ne: user_id } }, {
            offset: skip, page: page, limit: limit, select: '-password -refreshToken', sort: { createdAt: -1 }
        })
        return res.status(200).json(results)
    } catch (error) {
        return res.status(500).json({ message: error.message });

    }
}

export const paginate_customer = async (req, res) => {
    const { email, isActive, name, page } = req.query
    const query = {}
    if (email) query.email = { $regex: new RegExp(email, "y") }
    if (isActive !== '') query.isActive = isActive

    query.role = 0
    const nameQuery = name ? {
        $or: [
            { firstName: { $regex: new RegExp(name, "iuy") } },
            { lastName: { $regex: new RegExp(name, "iuy") } },
            { name: { $regex: new RegExp(name, "iuy") } }
        ]
    } : {};
    const limit = 6;
    const skip = page ? (page - 1) * limit : 0;
    try {
        const results = await user_model.paginate({ ...query, ...nameQuery }, {
            offset: skip, page: page, limit: limit, select: '-password -refreshToken', sort: { createdAt: -1 }
        })
        return res.status(200).json(results)
    } catch (error) {
        return res.status(500).json({ message: error.message });

    }
}

export const get_all_user_available = async (req, res) => {
    const role = req.user.role
    const query = {}
    query.isActive = true
    if (role) query.role = { $nin: [0, 3] };
    try {
        const results = await user_model.find(query).select('-password -refreshToken');
        return res.status(200).json(results)
    } catch (error) {
        return res.status(500).json({ message: error.message });

    }
}

export const create_user = async (req, res) => {
    const user_role = req.user.role
    const { role } = req.body
    try {
        if (user_role === 2 && role !== 1) return res.status(401).json({ message: "Không được cho phép" });
        const createdUser = await user_model.create(req.body)
        if (!createdUser) return res.status(404).json({ message: "Tạo người dùng thất bại" });
        return res.status(201).json({ message: "Tạo người dùng thành công" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

}