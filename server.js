const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Upload Directory Setup
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Data Storage Setup
const dataFile = path.join(__dirname, 'data.json');
const defaultData = {
    settings: {
        siteTitle: "ANZEXA | Pure Gold Collection"
    },
    categories: [], 
    products: [],
    users: [],
    orders: []
};

function loadStoreData() {
    try {
        if (fs.existsSync(dataFile)) {
            const rawData = fs.readFileSync(dataFile, 'utf8');
            return rawData ? JSON.parse(rawData) : defaultData;
        } else {
            fs.writeFileSync(dataFile, JSON.stringify(defaultData, null, 2), 'utf8');
            return defaultData;
        }
    } catch (err) {
        console.error("Error reading data.json", err);
        return defaultData;
    }
}

function saveStoreData() {
    try {
        fs.writeFileSync(dataFile, JSON.stringify(storeData, null, 2), 'utf8');
    } catch (err) {
        console.error("Error writing data.json", err);
    }
}

let storeData = loadStoreData();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

app.use(session({
    secret: 'anzexa_luxury_secret_key_2026',
    resave: false,
    saveUninitialized: true
}));

// Root Route
app.get('/', (req, res) => {
    try {
        res.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ANZEXA | Pure Gold Luxury</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-zinc-950 text-amber-300 flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <div class="border border-amber-500/40 bg-zinc-900/80 p-8 rounded-3xl space-y-4 max-w-sm shadow-2xl">
                <h1 class="text-3xl font-serif font-black tracking-widest text-amber-400">👑 ANZEXA</h1>
                <p class="text-xs text-zinc-400">Pure Gold & Onyx Black Edition</p>
                <div class="p-3 bg-zinc-950 rounded-2xl border border-amber-500/20 text-xs text-zinc-300">
                    Store is Live & Running Perfectly! ✨
                </div>
            </div>
        </body>
        </html>`);
    } catch (err) {
        res.status(500).send("Server Error: " + err.message);
    }
});

app.listen(PORT, () => console.log('Server running on port ' + PORT));
