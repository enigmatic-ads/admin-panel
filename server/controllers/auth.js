const { User } = require('../models');
const jwt = require("jsonwebtoken");

const login  = async (req, res) => {
    const { username, password } = req.body;

    let user;
    try {
        user = await User.findOne({ where: { username } });
    } catch(err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
    }

    if (!user || password !== user.password) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return res.json({ token, name: user.name });

};

module.exports = { login };