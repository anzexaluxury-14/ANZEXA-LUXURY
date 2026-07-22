const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Directory setup
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const dataFile = path.join(__dirname, 'data.json');
const defaultData = {
    settings: { siteTitle: "ANZEXA | Pure Gold Luxury" },
    categories: [
        { id: '1', name: 'Luxury Watches' },
        { id: '2', name: 'Gold Jewelry' },
        { id: '3', name: 'Premium Perfumes' }
    ], 
    products: [
        { id: '101', name: 'Pure Gold Watch', price: '999', category: 'Luxury Watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500' },
        { id: '102', name: 'Royal Gold Chain', price: '1499', category: 'Gold Jewelry', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500' },
        { id: '103', name: 'Onyx Oud Perfume', price: '299', category: 'Premium Perfumes', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500' }
    ],
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
        return defaultData;
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

// Main Full Store Interface
app.get('/', (req, res) => {
    try {
        res.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ANZEXA LUXURY STORE</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
            <style>
                body { background-color: #0a0a0a; color: #f3c623; }
                .gold-border { border-color: rgba(243, 198, 35, 0.3); }
                .gold-bg { background-color: #f3c623; color: #000; }
                .gold-text { color: #f3c623; }
                .card-bg { background-color: #121212; }
            </style>
        </head>
        <body class="font-sans min-h-screen pb-12">
            <!-- Header -->
            <header class="border-b gold-border sticky top-0 bg-black/90 backdrop-blur-md z-50">
                <div class="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 class="text-2xl font-serif font-black tracking-widest text-amber-400">ANZEXA</h1>
                    <div class="flex items-center gap-4">
                        <button class="text-amber-400 hover:text-amber-300"><i class="fa-solid fa-magnifying-glass text-lg"></i></button>
                        <button class="relative text-amber-400 hover:text-amber-300">
                            <i class="fa-solid fa-cart-shopping text-xl"></i>
                            <span class="absolute -top-2 -right-2 bg-amber-400 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">0</span>
                        </button>
                    </div>
                </div>
            </header>

            <!-- Hero Banner -->
            <section class="max-w-6xl mx-auto px-4 py-8">
                <div class="card-bg border gold-border rounded-3xl p-8 text-center space-y-3 relative overflow-hidden">
                    <span class="text-xs tracking-widest uppercase text-amber-400/80">Pure Gold & Onyx Black Edition</span>
                    <h2 class="text-3xl md:text-5xl font-serif font-bold text-amber-300">LUXURY REDEFINED</h2>
                    <p class="text-zinc-400 text-sm max-w-md mx-auto">Discover exclusive products crafted for elegance and perfection.</p>
                </div>
            </section>

            <!-- Categories -->
            <section class="max-w-6xl mx-auto px-4 py-4">
                <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                    <button class="gold-bg font-semibold px-5 py-2 rounded-full text-sm whitespace-nowrap">All Items</button>
                    ${storeData.categories.map(c => `<button class="card-bg border gold-border text-amber-300 px-5 py-2 rounded-full text-sm whitespace-nowrap hover:bg-zinc-800">${c.name}</button>`).join('')}
                </div>
            </section>

            <!-- Products Grid -->
            <section class="max-w-6xl mx-auto px-4 py-6">
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    ${storeData.products.map(p => `
                        <div class="card-bg border gold-border rounded-2xl overflow-hidden flex flex-col justify-between hover:border-amber-400 transition">
                            <div class="h-44 overflow-hidden bg-zinc-900">
                                <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover">
                            </div>
                            <div class="p-4 space-y-2 flex-1 flex flex-col justify-between">
                                <div>
                                    <span class="text-[10px] text-zinc-500 uppercase tracking-wider">${p.category}</span>
                                    <h3 class="font-semibold text-sm text-zinc-100 line-clamp-1">${p.name}</h3>
                                </div>
                                <div class="flex items-center justify-between pt-2 border-t border-zinc-800">
                                    <span class="font-bold text-amber-400">$${p.price}</span>
                                    <button class="gold-bg p-2 rounded-xl text-xs font-bold hover:bg-amber-300 transition">
                                        <i class="fa-solid fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
        </body>
        </html>`);
    } catch (err) {
        res.status(500).send("Server Error: " + err.message);
    }
});

app.listen(PORT, () => console.log('ANZEXA store running on port ' + PORT));
