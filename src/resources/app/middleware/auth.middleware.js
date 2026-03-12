const { verifyAccessToken } = require('../../util/jwt');
const User = require('../model/user.model');

async function authMiddleware(req, res, next) {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

	if (!token) {
		return res.status(401).json({ message: 'Chưa đăng nhập. Vui lòng gửi access token.' });
	}

	const decoded = verifyAccessToken(token);
	if (!decoded) {
		return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
	}

	try {
		const user = await User.findByPk(decoded.userId);
		if (!user) {
			return res.status(401).json({ message: 'Người dùng không tồn tại.' });
		}
		req.user = user;
		req.userId = user.id;
		next();
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Lỗi xác thực.' });
	}
}

function optionalAuth(req, res, next) {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
	if (!token) {
		return next();
	}
	const decoded = verifyAccessToken(token);
	if (decoded) {
		User.findByPk(decoded.userId)
			.then(user => {
				if (user) {
					req.user = user;
					req.userId = user.id;
				}
				next();
			})
			.catch(() => next());
	} else {
		next();
	}
}

module.exports = { authMiddleware, optionalAuth };
