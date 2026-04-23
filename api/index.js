const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// --- CONFIG DARI VERCEL ENV ---
const MONGO_URI = process.env.MONGO_URI;
const GIT_TOKEN = process.env.GIT_TOKEN;
const GIT_OWNER = 'ReyZ4YouXGod';
const GIT_REPO = 'keamanan';
const GIT_PATH = 'Dbnomor.json';

const gitUrl = `https://api.github.com/repos/${GIT_OWNER}/${GIT_REPO}/contents/${GIT_PATH}`;

// Koneksi MongoDB
mongoose.connect(MONGO_URI).catch(err => console.log("DB Error: ", err));

// Schema User untuk Login
const UserSchema = new mongoose.Schema({ username: String, pass: String });
const UserModel = mongoose.model('users', UserSchema);

// Middleware Auth Sederhana
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    // Akun Admin Utama (Hardcoded sesuai request)
    if (username === 'reycloud' && password === '190327') {
        return res.json({ success: true, role: 'owner' });
    }

    // Cek User lain di MongoDB
    const user = await UserModel.findOne({ username, pass: password });
    if (user) return res.json({ success: true, role: 'admin' });
    
    res.status(401).json({ success: false, message: 'Invalid Login' });
});

// Tambah User ke MongoDB
app.post('/api/add-user', async (req, res) => {
    try {
        const { username, password } = req.body;
        const newUser = new UserModel({ username, pass: password });
        await newUser.save();
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Proxy GitHub (Ambil & Simpan Nomor)
app.get('/api/github-db', async (req, res) => {
    try {
        const { data } = await axios.get(gitUrl, { headers: { Authorization: `token ${GIT_TOKEN}` } });
        res.json(data);
    } catch (e) { res.status(500).json({ error: "Gagal ambil data GitHub" }); }
});

app.put('/api/github-db', async (req, res) => {
    try {
        const { data } = await axios.put(gitUrl, req.body, { headers: { Authorization: `token ${GIT_TOKEN}` } });
        res.json(data);
    } catch (e) { res.status(500).json({ error: "Gagal update GitHub" }); }
});

module.exports = app;
