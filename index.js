require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

// 1. KẾT NỐI MONGODB ĐÁM MÂY
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Đã kết nối thành công với MongoDB Cloud! ☁️'))
  .catch(err => console.error('Lỗi kết nối MongoDB:', err));

// ==========================================
// CẤU TRÚC DỮ LIỆU (NHÀ KHO & TÀI KHOẢN)
// ==========================================
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'viewer' },
    isApproved: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    permissions: {
        canView: { type: Boolean, default: true },
        canEdit: { type: Boolean, default: false },
        canDelete: { type: Boolean, default: false }
    }
});
const User = mongoose.model('User', userSchema);

const sessionSchema = new mongoose.Schema({
    name: String,
    start_date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    end_date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    so_tien_cua_kien: { type: Number, default: 0 },
    so_tien_giat_ui: { type: Number, default: 0 },
    tong_sl_nhap: { type: Number, default: 0 },
    tong_sl_ban: { type: Number, default: 0 },
    tong_doanh_thu: { type: Number, default: 0 }
});
const Session = mongoose.model('Session', sessionSchema);

const dailySchema = new mongoose.Schema({
    session_id: String,
    ngay_ban: String,
    ten_san_pham: String,
    link_san_pham: String,
    so_luong_nhap: Number,
    so_luong: Number,
    so_tien_ban_duoc: Number
});
const Daily = mongoose.model('Daily', dailySchema);

const baleSchema = new mongoose.Schema({
    session_id: String,
    name: String,
    cost: Number,
    qty: Number
});
const Bale = mongoose.model('Bale', baleSchema);

const otpStore = new Map();

// 2. CẤU HÌNH GMAIL (Đã lấy tự động từ Render Environment)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ==========================================
// API ĐĂNG KÝ / ĐĂNG NHẬP
// ==========================================
app.post('/api/send-otp', async (req, res) => {
    const { email, type } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (type === 'register' && userExists) return res.status(400).json({ error: 'Email đã được sử dụng!' });
        if (type === 'forgot' && !userExists) return res.status(400).json({ error: 'Không tìm thấy tài khoản!' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(email, { otp, expires: Date.now() + 5 * 60000 });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Mã xác minh Dolphin_97ers',
            text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 5 phút.`
        });
        res.json({ success: true, message: 'Đã gửi OTP!' });
    } catch (error) { res.status(500).json({ error: 'Lỗi máy chủ khi gửi mail.' }); }
});

app.post('/api/register', async (req, res) => {
    const { name, email, password, otp } = req.body;
    try {
        const storedData = otpStore.get(email);
        if (!storedData || storedData.otp !== otp || Date.now() > storedData.expires) {
            return res.status(400).json({ error: 'Mã OTP không hợp lệ hoặc đã hết hạn!' });
        }
        const userCount = await User.countDocuments();
        const isFirstUser = userCount === 0;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({
            name, email, password: hashedPassword,
            role: isFirstUser ? 'admin' : 'viewer',
            isApproved: isFirstUser ? true : false,
            permissions: { canView: true, canEdit: isFirstUser, canDelete: isFirstUser }
        });
        await newUser.save();
        otpStore.delete(email); 
        res.json({ success: true, message: 'Tạo tài khoản thành công!' });
    } catch (error) { res.status(500).json({ error: 'Lỗi đăng ký.' }); }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Email hoặc mật khẩu không đúng!' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Email hoặc mật khẩu không đúng!' });

        if (user.isBanned) return res.status(403).json({ error: 'Tài khoản của bạn đã bị khóa vĩnh viễn!' });
        if (!user.isApproved) return res.status(403).json({ error: 'Tài khoản bạn đang chờ duyệt.' });

        const secret = process.env.JWT_SECRET || 'dolphin_secret';
        const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '1d' });

        res.json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, permissions: user.permissions },
            token
        });
    } catch (error) { res.status(500).json({ error: 'Lỗi đăng nhập.' }); }
});

app.post('/api/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const storedData = otpStore.get(email);
        if (!storedData || storedData.otp !== otp || Date.now() > storedData.expires) return res.status(400).json({ error: 'OTP không hợp lệ' });
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.updateOne({ email }, { password: hashedPassword });
        otpStore.delete(email);
        res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
    } catch (error) { res.status(500).json({ error: 'Lỗi đổi mật khẩu.' }); }
});

// ==========================================
// API ADMIN (QUẢN LÝ NHÂN SỰ)
// ==========================================
app.get('/api/users', async (req, res) => {
    try { res.json(await User.find().select('-password')); } catch (e) { res.status(500).json({ error: 'Lỗi' }); }
});
app.put('/api/users/:id', async (req, res) => {
    try { await User.findByIdAndUpdate(req.params.id, req.body); res.json({ success: true }); } catch (e) { res.status(500).json({ error: 'Lỗi' }); }
});
app.delete('/api/users/:id', async (req, res) => {
    try { await User.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (e) { res.status(500).json({ error: 'Lỗi' }); }
});

// ==========================================
// API DỮ LIỆU SẢN PHẨM & ĐỢT BÁN (NHÀ KHO)
// ==========================================
const calcSessionStats = async (sessionId) => {
    const daily = await Daily.find({ session_id: sessionId });
    let tong_sl_nhap = 0, tong_sl_ban = 0, tong_doanh_thu = 0;
    daily.forEach(d => {
        tong_sl_nhap += (d.so_luong_nhap || 0);
        tong_sl_ban += (d.so_luong || 0);
        tong_doanh_thu += (d.so_tien_ban_duoc || 0);
    });
    await Session.findByIdAndUpdate(sessionId, { tong_sl_nhap, tong_sl_ban, tong_doanh_thu });
};

app.get('/api/sessions', async (req, res) => {
    try { 
        const sessions = await Session.find().sort({ _id: -1 });
        res.json(sessions.map(s => ({ id: s._id, ...s._doc })));
    } catch (e) { res.status(500).json({error: "Lỗi"}); }
});
app.post('/api/sessions', async (req, res) => {
    try {
        const newSession = new Session({ name: req.body.name });
        await newSession.save();
        res.json({ id: newSession._id, ...newSession._doc });
    } catch (e) { res.status(500).json({error: "Lỗi"}); }
});
app.put('/api/sessions/:id', async (req, res) => {
    try { await Session.findByIdAndUpdate(req.params.id, req.body); res.json({success: true}); } catch (e) { res.status(500).json({error: "Lỗi"}); }
});
app.delete('/api/sessions/:id', async (req, res) => {
    try {
        await Session.findByIdAndDelete(req.params.id);
        await Daily.deleteMany({ session_id: req.params.id });
        await Bale.deleteMany({ session_id: req.params.id });
        res.json({success: true});
    } catch (e) { res.status(500).json({error: "Lỗi"}); }
});

app.get('/api/data/:sessionId', async (req, res) => {
    try {
        const session = await Session.findById(req.params.sessionId);
        if (!session) return res.status(404).json({error: "Không tìm thấy"});
        
        const daily = await Daily.find({ session_id: req.params.sessionId }).sort({ _id: 1 });
        let tong_sl_nhap = 0, tong_sl_ban = 0, tong_doanh_thu = 0;
        const mappedDaily = daily.map((d, i) => {
            tong_sl_nhap += (d.so_luong_nhap || 0);
            tong_sl_ban += (d.so_luong || 0);
            tong_doanh_thu += (d.so_tien_ban_duoc || 0);
            return { id: d._id, stt: i + 1, ...d._doc };
        });
        let trung_binh = tong_sl_nhap > 0 ? (session.so_tien_cua_kien || 0) / tong_sl_nhap : 0;

        res.json({
            id: session._id,
            ...session._doc,
            daily: mappedDaily,
            computed: { tong_sl_nhap, tong_sl_ban, tong_doanh_thu, trung_binh }
        });
    } catch (e) { res.status(500).json({error: "Lỗi"}); }
});
app.post('/api/daily', async (req, res) => {
    try { 
        const d = new Daily(req.body); await d.save(); await calcSessionStats(req.body.session_id);
        res.json({id: d._id, ...d._doc}); 
    } catch (e) { res.status(500).json({error: "Lỗi"}); }
});
app.put('/api/daily/:id', async (req, res) => {
    try { 
        await Daily.findByIdAndUpdate(req.params.id, req.body); 
        const d = await Daily.findById(req.params.id);
        if (d) await calcSessionStats(d.session_id);
        res.json({success: true}); 
    } catch (e) { res.status(500).json({error: "Lỗi"}); }
});
app.delete('/api/daily/:id', async (req, res) => {
    try { 
        const d = await Daily.findById(req.params.id);
        await Daily.findByIdAndDelete(req.params.id); 
        if (d) await calcSessionStats(d.session_id);
        res.json({success: true}); 
    } catch (e) { res.status(500).json({error: "Lỗi"}); }
});

app.get('/api/bales/:sessionId', async (req, res) => {
    try { const bales = await Bale.find({ session_id: req.params.sessionId }); res.json(bales.map(b => ({id: b._id, ...b._doc}))); } catch (e) { res.json([]); }
});
app.post('/api/bales', async (req, res) => {
    try { const b = new Bale(req.body); await b.save(); res.json({id: b._id, ...b._doc}); } catch (e) { res.status(500).json({error: "Lỗi"}); }
});
app.delete('/api/bales/:id', async (req, res) => {
    try { await Bale.findByIdAndDelete(req.params.id); res.json({success: true}); } catch (e) { res.status(500).json({error: "Lỗi"}); }
});

// Các tính năng tắt server (giữ lại để giao diện không báo lỗi)
app.post('/api/shutdown', (req, res) => res.json({success:true}));
app.get('/api/backup', (req, res) => res.json({msg:"Đã lên mây, không cần backup .db"}));
app.post('/api/restore', (req, res) => res.json({success:true}));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Backend Server is running on port ${PORT}`);
});