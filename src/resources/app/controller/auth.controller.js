const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const User = require('../model/user.model');
const Role = require('../model/role.model');
const {
	generateAccessToken,
	generateRefreshToken,
	verifyRefreshToken,
} = require('../../util/jwt');

class AuthController {
	/** [POST] /auth/register */
	async register(req, res) {
		try {
			const { email, password, username, first_name, last_name } = req.body;
			if (!email || !password) {
				return res.status(400).json({
					message: 'Vui lòng điền đầy đủ email và password.',
				});
			}
			if (password.length < 6) {
				return res.status(400).json({
					message: 'Mật khẩu phải có ít nhất 6 ký tự.',
				});
			}

			const existConditions = [{ email }];
			if (username) existConditions.push({ username });
			const existUser = await User.scope('withPassword').findOne({
				where: { [Op.or]: existConditions },
			});
			if (existUser) {
				const field = existUser.email === email ? 'email' : 'username';
				return res.status(400).json({
					message: `${field === 'email' ? 'Email' : 'Tên đăng nhập'} đã được sử dụng.`,
				});
			}

			const role = await Role.findOne({ where: { name: 'customer' } });
			if (!role) {
				return res.status(500).json({ message: 'Cấu hình role chưa đúng. Vui lòng thêm role customer.' });
			}

			const password_hash = await bcrypt.hash(password, 10);
			const full_name = [first_name, last_name].filter(Boolean).join(' ').trim() || null;
			const user = await User.create({
				email,
				username: username || null,
				password_hash,
				role_id: role.id,
				first_name: first_name || null,
				last_name: last_name || null,
				full_name,
				status: 'active',
			});

			const accessToken = generateAccessToken({ userId: user.id });
			const refreshToken = generateRefreshToken({ userId: user.id });
			await user.update({ refreshToken });

			const userJson = user.toJSON();
			delete userJson.password_hash;
			delete userJson.refreshToken;

			return res.status(201).json({
				message: 'Đăng ký thành công.',
				user: userJson,
				accessToken,
				refreshToken,
				expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
			});
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: error.message || 'Lỗi server.' });
		}
	}

	/** [POST] /auth/login - Đăng nhập bằng email hoặc username */
	async login(req, res) {
		try {
			const { email, username, password } = req.body;
			const loginBy = email ? { email } : username ? { username } : null;
			if (!loginBy || !password) {
				return res.status(400).json({
					message: 'Vui lòng điền email hoặc username và password.',
				});
			}

			const user = await User.scope('withPassword').findOne({
				where: loginBy,
				include: [{ model: Role, attributes: ['id', 'name'] }],
			});
			if (!user) {
				return res.status(401).json({ message: 'Email/username hoặc mật khẩu không đúng.' });
			}

			if (user.status !== 'active') {
				return res.status(403).json({ message: 'Tài khoản chưa được kích hoạt hoặc đã bị khóa.' });
			}

			const match = await bcrypt.compare(password, user.password_hash);
			if (!match) {
				return res.status(401).json({ message: 'Email/username hoặc mật khẩu không đúng.' });
			}

			const accessToken = generateAccessToken({ userId: user.id });
			const refreshToken = generateRefreshToken({ userId: user.id });
			await user.update({
				refreshToken,
				last_login_at: new Date(),
				login_count: (user.login_count || 0) + 1,
			});

			const userJson = user.toJSON();
			delete userJson.password_hash;
			delete userJson.refreshToken;

			return res.status(200).json({
				message: 'Đăng nhập thành công.',
				user: userJson,
				accessToken,
				refreshToken,
				expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
			});
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: error.message || 'Lỗi server.' });
		}
	}

	/** [POST] /auth/refresh-token */
	async refreshToken(req, res) {
		try {
			const { refreshToken: token } = req.body;
			if (!token) {
				return res.status(400).json({ message: 'Thiếu refresh token.' });
			}

			const decoded = verifyRefreshToken(token);
			if (!decoded) {
				return res.status(401).json({ message: 'Refresh token không hợp lệ hoặc đã hết hạn.' });
			}

			const user = await User.scope('withPassword').findByPk(decoded.userId);
			if (!user || user.refreshToken !== token) {
				return res.status(401).json({ message: 'Refresh token không hợp lệ.' });
			}

			if (user.status !== 'active') {
				return res.status(403).json({ message: 'Tài khoản đã bị khóa.' });
			}

			const accessToken = generateAccessToken({ userId: user.id });
			const newRefreshToken = generateRefreshToken({ userId: user.id });
			await user.update({ refreshToken: newRefreshToken });

			return res.status(200).json({
				accessToken,
				refreshToken: newRefreshToken,
				expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
			});
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: error.message || 'Lỗi server.' });
		}
	}

	/** [POST] /auth/logout */
	async logout(req, res) {
		try {
			const userId = req.userId || req.user?.id;
			if (userId) {
				await User.update({ refreshToken: null }, { where: { id: userId } });
			}
			return res.status(200).json({ message: 'Đăng xuất thành công.' });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: error.message || 'Lỗi server.' });
		}
	}

	/** [GET] /auth/me */
	async me(req, res) {
		try {
			const user = req.user;
			if (!user) {
				return res.status(401).json({ message: 'Chưa đăng nhập.' });
			}
			const u = await User.findByPk(user.id, { include: [{ model: Role, as: 'Role', attributes: ['id', 'name'] }] });
			return res.status(200).json({ user: u ? u.toJSON() : user.toJSON() });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: error.message || 'Lỗi server.' });
		}
	}
}

module.exports = new AuthController();
