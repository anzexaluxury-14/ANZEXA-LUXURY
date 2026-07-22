const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Directories Setup
const publicDir = path.join(__dirname, 'public');
const uploadDir = path.join(__dirname, 'public/uploads');
[publicDir, uploadDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'))
});
const upload = multer({ storage });

const dataFile = path.join(__dirname, 'data.json');

const luxuryThemes = [
    { name: "Royal Sapphire", bg: "linear-gradient(180deg, #1e3a8a 0%, #0f172a 100%)", text: "#ffffff", primary: "#3b82f6" },
    { name: "Emerald Gold", bg: "linear-gradient(180deg, #064e3b 0%, #022c22 100%)", text: "#fef08a", primary: "#10b981" },
    { name: "Midnight Onyx", bg: "linear-gradient(180deg, #111111 0%, #000000 100%)", text: "#ffffff", primary: "#d4af37" },
    { name: "Rose Gold Velvet", bg: "linear-gradient(180deg, #4c0519 0%, #1c0208 100%)", text: "#fecdd3", primary: "#fb7185" },
    { name: "Pure Luxury Snow", bg: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)", text: "#111111", primary: "#2563eb" },
    { name: "Deep Violet", bg: "linear-gradient(180deg, #3b0764 0%, #1a022e 100%)", text: "#f5d0fe", primary: "#a855f7" },
    { name: "Ocean Breeze", bg: "linear-gradient(180deg, #0c4a6e 0%, #082f49 100%)", text: "#bae6fd", primary: "#38bdf8" },
    { name: "Sunset Gold", bg: "linear-gradient(180deg, #7c2d12 0%, #290e05 100%)", text: "#fef08a", primary: "#f97316" },
    { name: "Ruby Red Luxury", bg: "linear-gradient(180deg, #7f1d1d 0%, #450a0a 100%)", text: "#fca5a5", primary: "#ef4444" },
    { name: "Champagne Pearl", bg: "linear-gradient(180deg, #fef3c7 0%, #fffbeb 100%)", text: "#78350f", primary: "#d97706" },
    { name: "Cyber Neon", bg: "linear-gradient(180deg, #09090b 0%, #18181b 100%)", text: "#22c55e", primary: "#10b981" },
    { name: "Platinum Grey", bg: "linear-gradient(180deg, #334155 0%, #0f172a 100%)", text: "#f8fafc", primary: "#94a3b8" },
    { name: "Royal Velvet Blue", bg: "linear-gradient(180deg, #172554 0%, #050b14 100%)", text: "#93c5fd", primary: "#60a5fa" },
    { name: "Amethyst Glam", bg: "linear-gradient(180deg, #581c87 0%, #2e1065 100%)", text: "#e9d5ff", primary: "#c084fc" },
    { name: "Bronze Metal", bg: "linear-gradient(180deg, #451a03 0%, #1c0a00 100%)", text: "#fed7aa", primary: "#f97316" },
    { name: "Minimal Soft Slate", bg: "linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)", text: "#0f172a", primary: "#475569" },
    { name: "Copper Luxury", bg: "linear-gradient(180deg, #78350f 0%, #2e1205 100%)", text: "#ffedd5", primary: "#ea580c" },
    { name: "Forest Emerald", bg: "linear-gradient(180deg, #14532d 0%, #052e16 100%)", text: "#bbf7d0", primary: "#22c55e" },
    { name: "Imperial Purple", bg: "linear-gradient(180deg, #6b21a8 0%, #3b0764 100%)", text: "#f3e8ff", primary: "#a855f7" },
    { name: "Titanium Gold", bg: "linear-gradient(180deg, #1c1917 0%, #0c0a09 100%)", text: "#fde047", primary: "#eab308" },
    { name: "Nordic Minimal", bg: "linear-gradient(180deg, #fafafa 0%, #f4f4f5 100%)", text: "#18181b", primary: "#27272a" },
    { name: "Electric Blue", bg: "linear-gradient(180deg, #1d4ed8 0%, #1e40af 100%)", text: "#ffffff", primary: "#60a5fa" },
    { name: "Desert Sand", bg: "linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)", text: "#78350f", primary: "#b45309" },
    { name: "Rose Quartz", bg: "linear-gradient(180deg, #ffe4e6 0%, #fecdd3 100%)", text: "#881337", primary: "#e11d48" },
    { name: "Obsidian Gold", bg: "linear-gradient(180deg, #0a0a0a 0%, #171717 100%)", text: "#facc15", primary: "#eab308" },
    { name: "Frosted Mint", bg: "linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)", text: "#065f46", primary: "#059669" },
    { name: "Midnight Plum", bg: "linear-gradient(180deg, #2e1065 0%, #1e1b4b 100%)", text: "#e0e7ff", primary: "#818cf8" },
    { name: "Deep Charcoal", bg: "linear-gradient(180deg, #262626 0%, #171717 100%)", text: "#f5f5f5", primary: "#a3a3a3" },
    { name: "Luxe Golden Noir", bg: "linear-gradient(180deg, #000000 0%, #1c1917 100%)", text: "#eab308", primary: "#ca8a04" },
    { name: "Pure White Glow", bg: "linear-gradient(180deg, #ffffff 0%, #ffffff 100%)", text: "#000000", primary: "#2563eb" }
];

const defaultData = {
    settings: {
        siteTitle: "ANZEXA | Boutique & Store",
        metaDescription: "Exclusive Collection & Premium Products",
        logoUrl: "",
        currency: "PKR Rs.",
        whatsappNumber: "971564390792",
        phoneNumber: "+971 56 439 0792",
        businessEmail: "anzexaluxury@gmail.com",
        address: "UAE / Pakistan",
        selectedThemeIndex: 4,
        flashSaleEndTime: Date.now() + (24 * 60 * 60 * 1000)
    },
    users: [
        {
            id: "usr_admin",
            name: "Super Admin",
            email: "admin@anzexa.com",
            password: "adnan1414",
            phone: "+971564390792",
            role: "Super Admin",
            status: "Approved",
            idCardNumber: "N/A"
        }
    ],
    categories: [],
    products: [],
    orders: [],
    coupons: [
        { code: "ANZEXA10", discountPercent: 10 }
    ],
    tickets: [],
    reviews: []
};

function loadData() {
    try {
        if (fs.existsSync(dataFile)) {
            const content = fs.readFileSync(dataFile, 'utf8');
            const parsed = content ? JSON.parse(content) : defaultData;
            parsed.settings.whatsappNumber = "971564390792";
            parsed.settings.phoneNumber = "+971 56 439 0792";
            parsed.settings.businessEmail = "anzexaluxury@gmail.com";
            if (!parsed.coupons) parsed.coupons = defaultData.coupons;
            if (!parsed.tickets) parsed.tickets = [];
            return parsed;
        } else {
            fs.writeFileSync(dataFile, JSON.stringify(defaultData, null, 2), 'utf8');
            return defaultData;
        }
    } catch (e) {
        return defaultData;
    }
}

function saveData(data) {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

let db = loadData();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(uploadDir));
app.use(session({
    secret: 'anzexa_mobile_lux_2026',
    resave: false,
    saveUninitialized: true
}));

function requireAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'Super Admin') return next();
    return res.redirect('/login');
}

function getThemeStyles() {
    const t = luxuryThemes[db.settings.selectedThemeIndex || 0];
    return `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background: ${t.bg};
            color: ${t.text};
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 480px;
            margin: 0 auto;
            min-height: 100vh;
            padding-bottom: 80px;
        }
        .btn-theme { background-color: ${t.primary}; color: #ffffff; }
        .glass-card { background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 1.25rem; }
    </style>
    `;
}

// FRONTEND STORE FRONT
app.get('/', (req, res) => {
    const s = db.settings;
    const selectedCat = req.query.category;
    const searchQuery = req.query.search ? req.query.search.toLowerCase() : '';
    const cart = req.session.cart || [];
    const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);
    const isReseller = req.session.user && req.session.user.role === 'Reseller' && req.session.user.status === 'Approved';

    let filteredProducts = db.products;
    if (selectedCat) filteredProducts = filteredProducts.filter(p => p.categoryId === selectedCat);
    if (searchQuery) filteredProducts = filteredProducts.filter(p => p.title.toLowerCase().includes(searchQuery));

    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>${s.siteTitle}</title>${getThemeStyles()}</head>
    <body class="flex flex-col relative">
        <header class="sticky top-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10 px-4 py-3 flex justify-between items-center">
            <a href="/" class="text-lg font-black tracking-wider">${s.siteTitle.split('|')[0]}</a>
            <div class="flex items-center gap-3">
                <a href="/cart" class="relative p-2 text-lg">
                    <i class="fa-solid fa-cart-shopping"></i>
                    ${cartCount > 0 ? `<span class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">${cartCount}</span>` : ''}
                </a>
                ${req.session.user ? `
                    <span class="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-1 rounded-lg">${req.session.user.role}</span>
                    <a href="${req.session.user.role === 'Super Admin' ? '/admin' : '/orders'}" class="text-xs font-bold"><i class="fa-solid fa-user"></i></a>
                    <a href="/logout" class="text-xs text-red-400 font-bold"><i class="fa-solid fa-right-from-bracket"></i></a>
                ` : `<a href="/login" class="text-xs font-bold bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">Login</a>`}
            </div>
        </header>

        <!-- Live Flash Sale Countdown Banner -->
        <div class="m-3 p-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 text-white text-center space-y-1">
            <div class="text-[10px] font-black uppercase tracking-widest">⚡ Limited Time Flash Sale ⚡</div>
            <div id="flashTimer" class="text-sm font-black tracking-widest">00h : 00m : 00s</div>
        </div>

        <!-- Live Search Bar -->
        <section class="px-3 mb-2">
            <form action="/" method="GET" class="relative">
                <input type="text" name="search" value="${searchQuery}" placeholder="Search products live..." class="w-full bg-white/10 border border-white/20 rounded-xl p-2.5 text-xs text-white placeholder-slate-400 focus:outline-none">
                <button type="submit" class="absolute right-3 top-2.5 text-xs text-slate-300"><i class="fa-solid fa-magnifying-glass"></i></button>
            </form>
        </section>

        <!-- Categories Slider -->
        <section class="px-3 py-2">
            <div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <a href="/" class="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold ${!selectedCat ? 'btn-theme' : 'bg-white/10'}">All</a>
                ${db.categories.map(c => `
                    <a href="/?category=${c.id}" class="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${selectedCat === c.id ? 'btn-theme' : 'bg-white/10'}">
                        ${c.coverPhoto ? `<img src="${c.coverPhoto}" class="w-5 h-5 rounded-lg object-cover">` : ''}
                        <span>${c.name}</span>
                    </a>
                `).join('')}
            </div>
        </section>

        <!-- Products List -->
        <section class="px-3 py-2 flex-1">
            <div class="grid grid-cols-2 gap-3">
                ${filteredProducts.map(p => {
                    const finalPrice = isReseller && p.wholesalePrice ? p.wholesalePrice : p.price;
                    const stock = p.stock !== undefined ? p.stock : 10;
                    return `
                    <div class="glass-card overflow-hidden flex flex-col justify-between p-2">
                        <a href="/product/${p.id}">
                            <img src="${(p.images && p.images[0]) || '/uploads/placeholder.jpg'}" class="w-full h-36 object-cover rounded-xl bg-black/20">
                            <div class="p-2 space-y-1">
                                <h3 class="font-bold text-xs line-clamp-1">${p.title}</h3>
                                ${stock <= 0 ? `<span class="bg-red-500/20 text-red-400 text-[9px] px-1.5 py-0.5 rounded font-bold">Out of Stock</span>` : `<span class="text-[9px] text-emerald-400 font-bold">In Stock (${stock})</span>`}
                                <div class="text-xs font-black">
                                    ${s.currency} ${Number(finalPrice).toLocaleString()}
                                    ${isReseller && p.wholesalePrice ? `<span class="text-[9px] text-purple-400 block">(Wholesale Rate)</span>` : ''}
                                </div>
                            </div>
                        </a>
                        ${stock > 0 ? `
                            <a href="/cart/add/${p.id}" class="w-full btn-theme text-center py-2 rounded-xl text-[11px] font-bold block mt-1">
                                <i class="fa-solid fa-cart-plus"></i> Add to Cart
                            </a>
                        ` : `<button disabled class="w-full bg-gray-500/30 text-gray-400 py-2 rounded-xl text-[11px] font-bold mt-1">Sold Out</button>`}
                    </div>
                    `;
                }).join('')}
            </div>
        </section>

        <nav class="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-black/80 backdrop-blur-md border-t border-white/10 px-6 py-2.5 flex justify-between items-center text-center z-50">
            <a href="/" class="flex flex-col items-center"><i class="fa-solid fa-house"></i><span class="text-[10px] mt-0.5">Home</span></a>
            <a href="/cart" class="flex flex-col items-center relative"><i class="fa-solid fa-cart-shopping"></i><span class="text-[10px] mt-0.5">Cart</span></a>
            <a href="https://wa.me/${s.whatsappNumber}" target="_blank" class="flex flex-col items-center text-emerald-400"><i class="fa-brands fa-whatsapp text-lg"></i><span class="text-[10px] mt-0.5">WhatsApp</span></a>
            <a href="/tickets" class="flex flex-col items-center text-purple-400"><i class="fa-solid fa-headset"></i><span class="text-[10px] mt-0.5">Support</span></a>
            <a href="/orders" class="flex flex-col items-center"><i class="fa-solid fa-box"></i><span class="text-[10px] mt-0.5">Orders</span></a>
        </nav>

        <script>
            let endTime = ${s.flashSaleEndTime};
            setInterval(() => {
                let now = Date.now();
                let diff = Math.max(0, endTime - now);
                let hrs = Math.floor(diff / 3600000).toString().padStart(2, '0');
                let mins = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
                let secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
                document.getElementById('flashTimer').innerText = `${hrs}h : ${mins}m : ${secs}s`;
            }, 1000);
        </script>
    </body>
    </html>
    `);
});

// SINGLE PRODUCT DETAILS
app.get('/product/:id', (req, res) => {
    const p = db.products.find(x => x.id === req.params.id);
    if (!p) return res.redirect('/');
    const s = db.settings;
    const isReseller = req.session.user && req.session.user.role === 'Reseller' && req.session.user.status === 'Approved';
    const finalPrice = isReseller && p.wholesalePrice ? p.wholesalePrice : p.price;

    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>${p.title}</title>${getThemeStyles()}</head>
    <body class="p-3 space-y-4">
        <a href="/" class="inline-block text-xs font-bold bg-white/10 px-3 py-1.5 rounded-lg"><i class="fa-solid fa-arrow-left"></i> Back</a>
        
        <div class="glass-card overflow-hidden">
            <img src="${(p.images && p.images[0]) || '/uploads/placeholder.jpg'}" class="w-full h-64 object-cover">
            <div class="p-4 space-y-2">
                <h1 class="text-lg font-black">${p.title}</h1>
                <div class="text-xl font-black">${s.currency} ${Number(finalPrice).toLocaleString()}</div>
                <p class="text-xs opacity-80 leading-relaxed">${p.description}</p>
                <a href="/cart/add/${p.id}" class="w-full btn-theme py-3 rounded-xl text-center text-xs font-bold block mt-3">
                    <i class="fa-solid fa-cart-plus mr-1"></i> Add to Cart
                </a>
            </div>
        </div>
    </body>
    </html>
    `);
});

// CART & CHECKOUT WITH COUPONS
app.get('/cart', (req, res) => {
    const cart = req.session.cart || [];
    const s = db.settings;
    const discount = req.session.discount || 0;
    const isReseller = req.session.user && req.session.user.role === 'Reseller' && req.session.user.status === 'Approved';

    let subtotal = cart.reduce((acc, item) => {
        const p = db.products.find(x => x.id === item.id);
        const itemPrice = isReseller && p && p.wholesalePrice ? p.wholesalePrice : item.price;
        return acc + (Number(itemPrice) * item.qty);
    }, 0);

    const total = Math.max(0, subtotal - (subtotal * (discount / 100)));

    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>My Cart</title>${getThemeStyles()}</head>
    <body class="p-3 space-y-4">
        <a href="/" class="inline-block text-xs font-bold bg-white/10 px-3 py-1.5 rounded-lg"><i class="fa-solid fa-arrow-left"></i> Back</a>
        <h1 class="text-base font-black"><i class="fa-solid fa-cart-shopping"></i> Shopping Cart</h1>

        ${cart.length === 0 ? `<div class="text-center py-12 glass-card text-xs opacity-60">Cart Khali Hai.</div>` : `
            <div class="space-y-2">
                ${cart.map(item => `
                    <div class="glass-card p-3 flex justify-between items-center">
                        <div class="flex-1">
                            <h4 class="font-bold text-xs">${item.title}</h4>
                            <div class="text-xs font-black">PKR ${item.price} x ${item.qty}</div>
                        </div>
                        <a href="/cart/remove/${item.id}" class="text-red-400 text-xs p-2"><i class="fa-solid fa-trash"></i></a>
                    </div>
                `).join('')}

                <!-- Coupon Form -->
                <form action="/cart/coupon" method="POST" class="glass-card p-3 flex gap-2">
                    <input type="text" name="code" placeholder="Coupon Code (e.g. ANZEXA10)" class="flex-1 bg-white/10 border border-white/20 p-2 rounded-xl text-xs text-white">
                    <button type="submit" class="btn-theme px-3 py-2 rounded-xl text-xs font-bold">Apply</button>
                </form>

                <div class="glass-card p-4 space-y-3">
                    <div class="space-y-1 text-xs">
                        <div class="flex justify-between"><span>Subtotal:</span><span>${s.currency} ${subtotal.toLocaleString()}</span></div>
                        ${discount > 0 ? `<div class="flex justify-between text-emerald-400"><span>Discount (${discount}%):</span><span>-${s.currency} ${(subtotal * (discount / 100)).toLocaleString()}</span></div>` : ''}
                        <div class="flex justify-between font-black text-sm pt-2 border-t border-white/10"><span>Total:</span><span>${s.currency} ${total.toLocaleString()}</span></div>
                    </div>

                    <form action="/cart/checkout" method="POST" class="space-y-2 pt-2 border-t border-white/10">
                        <input type="text" name="customerName" placeholder="Full Name" value="${req.session.user ? req.session.user.name : ''}" required class="w-full bg-white/10 border border-white/20 p-2.5 rounded-xl text-xs text-white">
                        <input type="text" name="phone" placeholder="Mobile Number" value="${req.session.user ? req.session.user.phone : ''}" required class="w-full bg-white/10 border border-white/20 p-2.5 rounded-xl text-xs text-white">
                        <input type="text" name="whatsapp" placeholder="WhatsApp Number (+971...)" required class="w-full bg-white/10 border border-white/20 p-2.5 rounded-xl text-xs text-white">
                        <textarea name="address" placeholder="Delivery Address..." required class="w-full bg-white/10 border border-white/20 p-2.5 rounded-xl text-xs h-16 text-white"></textarea>
                        
                        <button type="submit" class="w-full btn-theme font-bold py-3 rounded-xl text-xs uppercase tracking-wider">
                            Confirm Order
                        </button>
                    </form>
                </div>
            </div>
        `}
    </body>
    </html>
    `);
});

app.get('/cart/add/:id', (req, res) => {
    if (!req.session.cart) req.session.cart = [];
    const p = db.products.find(x => x.id === req.params.id);
    if (p) {
        const existing = req.session.cart.find(x => x.id === p.id);
        if (existing) existing.qty += 1;
        else req.session.cart.push({ id: p.id, title: p.title, price: p.price, qty: 1, image: (p.images && p.images[0]) || '' });
    }
    res.redirect('/cart');
});

app.get('/cart/remove/:id', (req, res) => {
    if (req.session.cart) req.session.cart = req.session.cart.filter(x => x.id !== req.params.id);
    res.redirect('/cart');
});

app.post('/cart/coupon', (req, res) => {
    const { code } = req.body;
    const found = db.coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (found) req.session.discount = found.discountPercent;
    res.redirect('/cart');
});

app.post('/cart/checkout', (req, res) => {
    const cart = req.session.cart || [];
    if (cart.length === 0) return res.redirect('/');
    const { customerName, phone, whatsapp, address } = req.body;
    const s = db.settings;
    const discount = req.session.discount || 0;

    let subtotal = cart.reduce((acc, item) => acc + (Number(item.price) * item.qty), 0);
    const total = Math.max(0, subtotal - (subtotal * (discount / 100)));

    cart.forEach(item => {
        const p = db.products.find(x => x.id === item.id);
        if (p && p.stock !== undefined) {
            p.stock = Math.max(0, p.stock - item.qty);
        }
    });

    const order = {
        id: "ORD_" + Date.now(),
        customerName,
        phone,
        whatsapp,
        address,
        items: cart,
        totalAmount: total,
        status: "Pending Admin Approval",
        courierName: "",
        trackingNumber: "",
        date: new Date().toLocaleString()
    };

    db.orders.push(order);
    saveData(db);
    req.session.cart = [];
    req.session.discount = 0;

    const waMsg = encodeURIComponent("Hello Admin, New Order Placed! Order ID: " + order.id + ", Total: PKR " + total + ", Name: " + customerName);
    res.send("<script>alert('Order placed successfully!'); window.location='https://wa.me/" + s.whatsappNumber + "?text=" + waMsg + "';</script>");
});

// INVOICE RECEIPT
app.get('/order/invoice/:id', (req, res) => {
    const o = db.orders.find(x => x.id === req.params.id);
    if (!o) return res.send("Order Not Found");
    const s = db.settings;

    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Invoice - ${o.id}</title><script src="https://cdn.tailwindcss.com"></script></head>
    <body class="p-6 bg-white text-black max-w-md mx-auto border font-sans">
        <div class="text-center border-b pb-4 mb-4">
            <h1 class="text-xl font-black">${s.siteTitle}</h1>
            <p class="text-xs text-gray-500">${s.businessEmail} | ${s.phoneNumber}</p>
            <h2 class="text-sm font-bold mt-2">OFFICIAL ORDER INVOICE</h2>
        </div>
        <div class="text-xs space-y-1 mb-4">
            <div><strong>Order ID:</strong> ${o.id}</div>
            <div><strong>Date:</strong> ${o.date}</div>
            <div><strong>Customer:</strong> ${o.customerName} (${o.phone})</div>
            <div><strong>Address:</strong> ${o.address}</div>
            <div><strong>Status:</strong> ${o.status}</div>
        </div>
        <table class="w-full text-xs text-left border-collapse mb-4">
            <thead>
                <tr class="border-b"><th class="py-1">Item</th><th class="py-1">Qty</th><th class="py-1">Price</th></tr>
            </thead>
            <tbody>
                ${o.items.map(i => `<tr class="border-b"><td class="py-1">${i.title}</td><td>${i.qty}</td><td>PKR ${i.price}</td></tr>`).join('')}
            </tbody>
        </table>
        <div class="text-right font-black text-sm border-t pt-2">Total Amount: PKR ${o.totalAmount}</div>
        ${o.courierName ? `<div class="mt-4 p-2 bg-gray-100 text-xs rounded"><strong>Courier:</strong> ${o.courierName} | <strong>Tracking:</strong> ${o.trackingNumber}</div>` : ''}
        <button onclick="window.print()" class="w-full bg-black text-white py-2 rounded text-xs font-bold mt-6">Print / Save Invoice</button>
    </body>
    </html>
    `);
});

// CUSTOMER ORDERS
app.get('/orders', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>My Orders</title>${getThemeStyles()}</head>
    <body class="p-3 space-y-3">
        <a href="/" class="inline-block text-xs font-bold bg-white/10 px-3 py-1.5 rounded-lg"><i class="fa-solid fa-arrow-left"></i> Home</a>
        <h1 class="text-base font-black">My Orders</h1>

        ${db.orders.length === 0 ? `<p class="text-xs opacity-50">No orders found.</p>` : `
            <div class="space-y-3">
                ${db.orders.map(o => `
                    <div class="glass-card p-3 space-y-2 text-xs">
                        <div class="flex justify-between font-bold">
                            <span class="text-blue-400">${o.id}</span>
                            <span class="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold">${o.status}</span>
                        </div>
                        <div><strong>Total:</strong> PKR ${o.totalAmount}</div>
                        <div><strong>Address:</strong> ${o.address}</div>
                        ${o.courierName ? `<div class="bg-blue-500/20 p-2 rounded-xl text-blue-200">🚚 Courier: ${o.courierName}<br>📦 Tracking: ${o.trackingNumber}</div>` : ''}
                        <a href="/order/invoice/${o.id}" target="_blank" class="inline-block bg-white/20 px-3 py-1 rounded text-[10px] font-bold mt-1"><i class="fa-solid fa-file-invoice"></i> View Invoice</a>
                    </div>
                `).join('')}
            </div>
        `}
    </body>
    </html>
    `);
});

// SUPPORT TICKETS
app.get('/tickets', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Support Tickets</title>${getThemeStyles()}</head>
    <body class="p-3 space-y-3">
        <a href="/" class="inline-block text-xs font-bold bg-white/10 px-3 py-1.5 rounded-lg"><i class="fa-solid fa-arrow-left"></i> Home</a>
        <h1 class="text-base font-black"><i class="fa-solid fa-headset text-purple-400"></i> Support Tickets</h1>

        <form action="/tickets/add" method="POST" class="glass-card p-4 space-y-2">
            <h3 class="text-xs font-bold">Open Support Ticket</h3>
            <input type="text" name="subject" placeholder="Issue Subject" required class="w-full bg-white/10 border border-white/20 p-2.5 rounded-xl text-xs text-white">
            <textarea name="message" placeholder="Describe your problem..." required class="w-full bg-white/10 border border-white/20 p-2.5 rounded-xl text-xs h-16 text-white"></textarea>
            <button type="submit" class="w-full btn-theme font-bold py-2 rounded-xl text-xs">Submit Ticket</button>
        </form>

        <div class="space-y-2">
            ${db.tickets.map(t => `
                <div class="glass-card p-3 text-xs space-y-1">
                    <div class="flex justify-between font-bold">
                        <span>${t.subject}</span>
                        <span class="text-purple-300">${t.status}</span>
                    </div>
                    <p class="opacity-80">${t.message}</p>
                    ${t.reply ? `<div class="bg-emerald-500/20 p-2 rounded-lg text-emerald-300 mt-1"><strong>Admin Reply:</strong> ${t.reply}</div>` : ''}
                </div>
            `).join('')}
        </div>
    </body>
    </html>
    `);
});

app.post('/tickets/add', (req, res) => {
    const { subject, message } = req.body;
    db.tickets.push({ id: "tkt_" + Date.now(), subject, message, status: "Open", reply: "", date: new Date().toLocaleDateString() });
    saveData(db);
    res.redirect('/tickets');
});

// AUTH SYSTEM
app.get('/login', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Login</title>${getThemeStyles()}</head>
    <body class="flex items-center justify-center min-h-screen p-4">
        <form action="/login" method="POST" class="glass-card p-6 w-full space-y-4">
            <h2 class="text-xl font-black text-center">Account Login</h2>
            <input type="email" name="email" placeholder="Email Address" required class="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-xs text-white">
            <input type="password" name="password" placeholder="Password" required class="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-xs text-white">
            <button type="submit" class="w-full btn-theme font-bold p-3 rounded-xl text-xs">Sign In</button>
            
            <div class="pt-2 text-center space-y-2">
                <a href="/register" class="block text-xs font-bold text-blue-400">Create Customer Account</a>
                <a href="/register-reseller" class="block text-xs font-bold text-purple-400">Apply as Reseller / Wholesale Partner</a>
            </div>
        </form>
    </body>
    </html>
    `);
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) return res.send("<script>alert('Invalid Email/Password'); window.location='/login';</script>");
    if (user.role === 'Reseller' && user.status !== 'Approved') {
        return res.send("<script>alert('Reseller Account Pending Approval.'); window.location='/login';</script>");
    }
    req.session.user = user;
    if (user.role === 'Super Admin') return res.redirect('/admin');
    return res.redirect('/');
});

app.get('/register', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Register</title>${getThemeStyles()}</head>
    <body class="flex items-center justify-center min-h-screen p-4">
        <form action="/register" method="POST" class="glass-card p-6 w-full space-y-3">
            <h2 class="text-xl font-black text-center">Customer Sign Up</h2>
            <input type="text" name="name" placeholder="Full Name" required class="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-xs text-white">
            <input type="email" name="email" placeholder="Email Address" required class="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-xs text-white">
            <input type="text" name="phone" placeholder="Phone Number" required class="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-xs text-white">
            <input type="password" name="password" placeholder="Password" required class="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-xs text-white">
            <button type="submit" class="w-full btn-theme font-bold p-3 rounded-xl text-xs">Register</button>
            <a href="/login" class="block text-center text-xs opacity-60">Back to Login</a>
        </form>
    </body>
    </html>
    `);
});

app.post('/register', (req, res) => {
    const { name, email, phone, password } = req.body;
    db.users.push({ id: "usr_" + Date.now(), name, email, phone, password, role: "Customer", status: "Approved" });
    saveData(db);
    res.send("<script>alert('Account Created!'); window.location='/login';</script>");
});

app.get('/register-reseller', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Reseller Apply</title>${getThemeStyles()}</head>
    <body class="flex items-center justify-center min-h-screen p-4">
        <form action="/register-reseller" method="POST" class="glass-card p-6 w-full space-y-3">
            <h2 class="text-lg font-black text-center text-purple-400">Reseller Application</h2>
            <input type="text" name="name" placeholder="Business / Store Name" required class="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-xs text-white">
            <input type="email" name="email" placeholder="Email Address" required class="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-xs text-white">
            <input type="text" name="phone" placeholder="Phone / WhatsApp" required class="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-xs text-white">
            <input type="text" name="idCardNumber" placeholder="ID Card / Business Reg No" required class="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-xs text-white">
            <input type="password" name="password" placeholder="Password" required class="w-full bg-white/10 border border-white/20 p-3 rounded-xl text-xs text-white">
            <button type="submit" class="w-full bg-purple-600 text-white font-bold p-3 rounded-xl text-xs">Submit Application</button>
            <a href="/login" class="block text-center text-xs opacity-60">Back to Login</a>
        </form>
    </body>
    </html>
    `);
});

app.post('/register-reseller', (req, res) => {
    const { name, email, phone, idCardNumber, password } = req.body;
    db.users.push({ id: "res_" + Date.now(), name, email, phone, idCardNumber, password, role: "Reseller", status: "Pending Approval" });
    saveData(db);
    res.send("<script>alert('Reseller Application Submitted!'); window.location='/login';</script>");
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// SUPER ADMIN HUB
app.get('/admin', requireAdmin, (req, res) => {
    const resellers = db.users.filter(u => u.role === 'Reseller');

    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Admin Hub</title>${getThemeStyles()}</head>
    <body class="p-3 space-y-4">
        <div class="flex justify-between items-center glass-card p-3">
            <div>
                <h1 class="font-black text-sm">ADMIN HUB</h1>
                <p class="text-[10px] opacity-60">Control Panel</p>
            </div>
            <a href="/" target="_blank" class="btn-theme px-3 py-1.5 rounded-xl text-xs font-bold">
                <i class="fa-solid fa-globe mr-1"></i> View Site
            </a>
        </div>

        <!-- 30 LUXURY THEMES CHANGER -->
        <section class="glass-card p-4 space-y-3">
            <h2 class="text-xs font-black uppercase"><i class="fa-solid fa-palette text-amber-400"></i> Select Store Theme (30 Luxury Combos)</h2>
            <form action="/admin/theme/select" method="POST" class="space-y-2">
                <select name="themeIndex" class="w-full bg-black/40 border border-white/20 p-2.5 rounded-xl text-xs font-bold text-white">
                    ${luxuryThemes.map((t, idx) => `<option value="${idx}" ${db.settings.selectedThemeIndex == idx ? 'selected' : ''}>Theme ${idx + 1}: ${t.name}</option>`).join('')}
                </select>
                <button type="submit" class="w-full btn-theme font-bold py-2 rounded-xl text-xs">Apply Selected Theme</button>
            </form>
        </section>

        <!-- ORDERS APPROVAL -->
        <section class="glass-card p-4 space-y-3">
            <h2 class="text-xs font-black uppercase"><i class="fa-solid fa-box text-emerald-400"></i> Customer Orders (${db.orders.length})</h2>
            <div class="space-y-3">
                ${db.orders.map(o => `
                    <div class="bg-black/30 border border-white/10 p-3 rounded-xl space-y-2 text-xs">
                        <div class="flex justify-between font-bold">
                            <span class="text-blue-400">${o.id}</span>
                            <span class="text-emerald-400">PKR ${o.totalAmount}</span>
                        </div>
                        <div>${o.customerName} | Mobile: ${o.phone} | WA: ${o.whatsapp}</div>
                        <div>Address: ${o.address}</div>

                        <form action="/admin/orders/approve" method="POST" class="pt-2 border-t border-white/10 space-y-2">
                            <input type="hidden" name="orderId" value="${o.id}">
                            <div class="grid grid-cols-2 gap-2">
                                <input type="text" name="courierName" placeholder="Courier Name" value="${o.courierName}" required class="bg-white/10 border p-2 rounded-lg text-xs text-white">
                                <input type="text" name="trackingNumber" placeholder="Tracking No" value="${o.trackingNumber}" required class="bg-white/10 border p-2 rounded-lg text-xs text-white">
                            </div>
                            <button type="submit" class="w-full bg-emerald-600 text-white font-bold py-2 rounded-lg text-xs">
                                Approve & Send Dispatch Alert
                            </button>
                        </form>
                    </div>
                `).join('')}
            </div>
        </section>

        <!-- RESELLER APPROVALS -->
        <section class="glass-card p-4 space-y-3">
            <h2 class="text-xs font-black uppercase text-purple-400"><i class="fa-solid fa-user-gear"></i> Reseller Applications (${resellers.length})</h2>
            <div class="space-y-2">
                ${resellers.map(r => `
                    <div class="bg-black/30 border border-white/10 p-3 rounded-xl text-xs space-y-1">
                        <div class="flex justify-between font-bold">
                            <span>${r.name}</span>
                            <span class="text-amber-300">${r.status}</span>
                        </div>
                        <div>Phone: ${r.phone} | ID Reg: ${r.idCardNumber}</div>
                        ${r.status !== 'Approved' ? `<a href="/admin/reseller/approve/${r.id}" class="inline-block bg-purple-600 text-white px-3 py-1 rounded text-[10px] font-bold mt-1">Approve Reseller</a>` : ''}
                    </div>
                `).join('')}
            </div>
        </section>

        <!-- CATEGORIES -->
        <section class="glass-card p-4 space-y-3">
            <h2 class="text-xs font-black uppercase">Categories (Add & Delete)</h2>
            <form action="/admin/categories/add" method="POST" enctype="multipart/form-data" class="space-y-2">
                <input type="text" name="name" placeholder="Category Name" required class="w-full bg-white/10 border p-2.5 rounded-xl text-xs text-white">
                <input type="file" name="coverPhoto" accept="image/*" required class="w-full text-xs">
                <button type="submit" class="w-full btn-theme font-bold py-2 rounded-xl text-xs">Add Category</button>
            </form>
            <div class="space-y-1 pt-2 border-t border-white/10">
                ${db.categories.map(c => `
                    <div class="flex justify-between items-center bg-black/20 p-2 rounded-lg text-xs">
                        <span>${c.name}</span>
                        <a href="/admin/categories/delete/${c.id}" class="text-red-400"><i class="fa-solid fa-trash"></i></a>
                    </div>
                `).join('')}
            </div>
        </section>

        <!-- PRODUCTS -->
        <section class="glass-card p-4 space-y-3">
            <h2 class="text-xs font-black uppercase">Products (Add & Inventory Control)</h2>
            <form action="/admin/products/add" method="POST" enctype="multipart/form-data" class="space-y-2">
                <input type="text" name="title" placeholder="Product Title" required class="w-full bg-white/10 border p-2.5 rounded-xl text-xs text-white">
                <div class="grid grid-cols-2 gap-2">
                    <input type="text" name="price" placeholder="Retail Price (PKR)" required class="bg-white/10 border p-2.5 rounded-xl text-xs text-white">
                    <input type="text" name="wholesalePrice" placeholder="Reseller Price (PKR)" class="bg-white/10 border p-2.5 rounded-xl text-xs text-white">
                </div>
                <input type="number" name="stock" placeholder="Initial Stock Quantity" value="10" required class="w-full bg-white/10 border p-2.5 rounded-xl text-xs text-white">
                <select name="categoryId" class="w-full bg-black/40 border p-2.5 rounded-xl text-xs font-bold text-white">
                    ${db.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
                <input type="file" name="productImages" accept="image/*" multiple required class="w-full text-xs">
                <textarea name="description" placeholder="Description..." class="w-full bg-white/10 border p-2.5 rounded-xl text-xs h-16 text-white"></textarea>
                <button type="submit" class="w-full btn-theme font-bold py-2.5 rounded-xl text-xs">Publish Product</button>
            </form>

            <div class="space-y-2 pt-2 border-t border-white/10">
                ${db.products.map(p => `
                    <div class="flex justify-between items-center bg-black/20 p-2 rounded-lg text-xs">
                        <div>
                            <span class="font-bold">${p.title}</span>
                            <span class="text-[10px] block opacity-60">Stock: ${p.stock !== undefined ? p.stock : 10} | Price: ${p.price}</span>
                        </div>
                        <a href="/admin/products/delete/${p.id}" class="text-red-400 p-2"><i class="fa-solid fa-trash"></i></a>
                    </div>
                `).join('')}
            </div>
        </section>

        <!-- SUPPORT TICKETS -->
        <section class="glass-card p-4 space-y-3">
            <h2 class="text-xs font-black uppercase text-purple-400"><i class="fa-solid fa-headset"></i> Support Tickets (${db.tickets.length})</h2>
            <div class="space-y-2">
                ${db.tickets.map(t => `
                    <div class="bg-black/30 border border-white/10 p-3 rounded-xl text-xs space-y-2">
                        <div class="font-bold text-purple-300">${t.subject}</div>
                        <p>${t.message}</p>
                        <form action="/admin/tickets/reply" method="POST" class="flex gap-2">
                            <input type="hidden" name="ticketId" value="${t.id}">
                            <input type="text" name="reply" placeholder="Type reply..." value="${t.reply}" required class="flex-1 bg-white/10 border p-2 rounded-lg text-xs text-white">
                            <button type="submit" class="btn-theme px-3 py-2 rounded-lg text-xs font-bold">Reply</button>
                        </form>
                    </div>
                `).join('')}
            </div>
        </section>
    </body>
    </html>
    `);
});

// ADMIN CONTROLLERS
app.post('/admin/theme/select', requireAdmin, (req, res) => {
    db.settings.selectedThemeIndex = parseInt(req.body.themeIndex);
    saveData(db);
    res.redirect('/admin');
});

app.post('/admin/categories/add', requireAdmin, upload.single('coverPhoto'), (req, res) => {
    const { name } = req.body;
    const coverPhoto = req.file ? '/uploads/' + req.file.filename : '';
    db.categories.push({ id: "cat_" + Date.now(), name, coverPhoto });
    saveData(db);
    res.redirect('/admin');
});

app.get('/admin/categories/delete/:id', requireAdmin, (req, res) => {
    db.categories = db.categories.filter(c => c.id !== req.params.id);
    saveData(db);
    res.redirect('/admin');
});

app.post('/admin/products/add', requireAdmin, upload.array('productImages', 10), (req, res) => {
    const { title, price, wholesalePrice, stock, categoryId, description } = req.body;
    const images = req.files ? req.files.map(f => '/uploads/' + f.filename) : [];
    db.products.push({ id: "prod_" + Date.now(), title, price, wholesalePrice, stock: parseInt(stock) || 10, categoryId, description, images });
    saveData(db);
    res.redirect('/admin');
});

app.get('/admin/products/delete/:id', requireAdmin, (req, res) => {
    db.products = db.products.filter(p => p.id !== req.params.id);
    saveData(db);
    res.redirect('/admin');
});

app.post('/admin/orders/approve', requireAdmin, (req, res) => {
    const { orderId, courierName, trackingNumber } = req.body;
    const order = db.orders.find(o => o.id === orderId);
    if (order) {
        order.status = "Approved & Dispatched";
        order.courierName = courierName;
        order.trackingNumber = trackingNumber;
        saveData(db);
    }
    res.send("<script>alert('Order Approved! Dispatch Alert sent to Customer Mobile.'); window.location='/admin';</script>");
});

app.get('/admin/reseller/approve/:id', requireAdmin, (req, res) => {
    const reseller = db.users.find(u => u.id === req.params.id);
    if (reseller) {
        reseller.status = "Approved";
        saveData(db);
    }
    res.redirect('/admin');
});

app.post('/admin/tickets/reply', requireAdmin, (req, res) => {
    const { ticketId, reply } = req.body;
    const ticket = db.tickets.find(t => t.id === ticketId);
    if (ticket) {
        ticket.reply = reply;
        ticket.status = "Replied";
        saveData(db);
    }
    res.redirect('/admin');
});

app.listen(PORT, () => console.log('ANZEXA Super Store Running on Port ' + PORT));
