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

const defaultData = {
    settings: {
        siteTitle: "ANZEXA | Boutique & Store",
        metaDescription: "Exclusive Collection & Premium Products",
        logoUrl: "",
        currency: "PKR Rs.",
        whatsappNumber: "923000000000",
        phoneNumber: "+92 300 0000000",
        businessEmail: "info@anzexa.com",
        address: "Pakistan"
    },
    users: [
        {
            id: "usr_admin",
            name: "Super Admin",
            email: "admin@anzexa.com",
            password: "adnan1414",
            phone: "03000000000",
            role: "Super Admin",
            status: "Approved",
            idCardNumber: "N/A"
        }
    ],
    categories: [],
    products: [],
    orders: [],
    complaints: [],
    reviews: []
};

function loadData() {
    try {
        if (fs.existsSync(dataFile)) {
            const content = fs.readFileSync(dataFile, 'utf8');
            return content ? JSON.parse(content) : defaultData;
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

// Mobile-First Pure Styling Head
const themeHeadStyles = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --pure-white: #FFFFFF;
            --soft-white: #F8FAFC;
            --deep-black: #111111;
            --royal-blue: #2563EB;
            --emerald-green: #10B981;
            --soft-purple: #7C3AED;
            --luxury-gold: #D4AF37;
        }

        body {
            background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);
            color: #111111;
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 480px;
            margin: 0 auto;
            min-height: 100vh;
            border-left: 1px solid #E5E7EB;
            border-right: 1px solid #E5E7EB;
            padding-bottom: 70px;
        }

        .btn-primary-grad { background: linear-gradient(135deg, #2563EB 0%, #60A5FA 100%); color: #FFF; }
        .hero-dark-grad { background: linear-gradient(135deg, #111111 0%, #0F172A 55%, #1E3A8A 100%); color: #FFF; }
        .blue-emerald-grad { background: linear-gradient(135deg, #2563EB 0%, #10B981 100%); color: #FFF; }
        .purple-grad { background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%); color: #FFF; }
        .glass-card { background: #FFFFFF; border: 1px solid #E5E7EB; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border-radius: 1.25rem; }
    </style>
`;

// ================= FRONTEND MOBILE STORE ================= //

app.get('/', (req, res) => {
    const s = db.settings;
    const selectedCat = req.query.category;
    const cart = req.session.cart || [];
    const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

    let filteredProducts = db.products;
    if (selectedCat) {
        filteredProducts = db.products.filter(p => p.categoryId === selectedCat);
    }

    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>${s.siteTitle}</title>
        ${themeHeadStyles}
    </head>
    <body class="flex flex-col relative">
        <!-- Top App Header -->
        <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex justify-between items-center">
            <a href="/" class="flex items-center gap-2">
                ${s.logoUrl ? `<img src="${s.logoUrl}" class="h-8 object-contain">` : `<span class="text-xl font-black text-[#111111] tracking-wider">${s.siteTitle.split('|')[0]}</span>`}
            </a>
            <div class="flex items-center gap-3">
                <a href="/cart" class="relative p-2 text-stone-800 text-lg">
                    <i class="fa-solid fa-cart-shopping"></i>
                    ${cartCount > 0 ? `<span class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">${cartCount}</span>` : ''}
                </a>
                ${req.session.user ? `
                    <a href="${req.session.user.role === 'Super Admin' ? '/admin' : '/orders'}" class="text-xs font-bold text-[#2563EB]"><i class="fa-solid fa-user"></i></a>
                    <a href="/logout" class="text-xs text-red-500 font-bold"><i class="fa-solid fa-right-from-bracket"></i></a>
                ` : `
                    <a href="/login" class="text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-lg border">Login</a>
                `}
            </div>
        </header>

        <!-- Hero Banner -->
        <section class="m-3 p-5 rounded-2xl hero-dark-grad text-center space-y-2 shadow-lg">
            <span class="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-400 text-black tracking-wider">Store Front</span>
            <h1 class="text-2xl font-black">${s.siteTitle}</h1>
            <p class="text-slate-300 text-xs">${s.metaDescription}</p>
        </section>

        <!-- Categories Slider/Grid -->
        <section class="px-3 py-2">
            <div class="flex items-center justify-between mb-2">
                <h2 class="text-xs font-black uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span> Categories
                </h2>
                ${selectedCat ? `<a href="/" class="text-[11px] text-red-500 font-bold">Clear Filter</a>` : ''}
            </div>
            
            <div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <a href="/" class="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold ${!selectedCat ? 'bg-[#111111] text-white' : 'bg-slate-100 text-slate-700'}">
                    All Products
                </a>
                ${db.categories.map(c => `
                    <a href="/?category=${c.id}" class="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${selectedCat === c.id ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-slate-700'}">
                        ${c.coverPhoto ? `<img src="${c.coverPhoto}" class="w-5 h-5 rounded-lg object-cover">` : ''}
                        <span>${c.name}</span>
                    </a>
                `).join('')}
            </div>
        </section>

        <!-- Products List -->
        <section class="px-3 py-2 flex-1">
            <h2 class="text-xs font-black mb-3 uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span> Products (${filteredProducts.length})
            </h2>

            ${filteredProducts.length === 0 ? `<div class="text-center py-12 text-slate-400 border border-dashed rounded-2xl text-xs">Is Category Mein Koi Product Nahi Hai.</div>` : `
                <div class="grid grid-cols-2 gap-3">
                    ${filteredProducts.map(p => `
                        <div class="glass-card overflow-hidden flex flex-col justify-between">
                            <a href="/product/${p.id}">
                                <img src="${(p.images && p.images[0]) || '/uploads/placeholder.jpg'}" class="w-full h-36 object-cover bg-slate-100">
                                <div class="p-2.5 space-y-1">
                                    <h3 class="font-bold text-xs text-[#111111] line-clamp-1">${p.title}</h3>
                                    <div class="text-amber-500 text-[10px]"><i class="fa-solid fa-star"></i> 5.0</div>
                                    <div class="text-sm font-black text-[#111111]">${s.currency} ${Number(p.price).toLocaleString()}</div>
                                </div>
                            </a>
                            <div class="p-2.5 pt-0">
                                <a href="/cart/add/${p.id}" class="w-full blue-emerald-grad text-white text-center py-2 rounded-xl text-[11px] font-bold block">
                                    <i class="fa-solid fa-cart-plus"></i> Add to Cart
                                </a>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </section>

        <!-- Footer Bar -->
        <nav class="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t border-slate-200 px-6 py-2.5 flex justify-between items-center text-slate-600 text-center z-50">
            <a href="/" class="flex flex-col items-center text-[#2563EB]"><i class="fa-solid fa-house text-base"></i><span class="text-[10px] font-bold mt-0.5">Home</span></a>
            <a href="/cart" class="flex flex-col items-center relative"><i class="fa-solid fa-cart-shopping text-base"></i><span class="text-[10px] font-bold mt-0.5">Cart</span>${cartCount > 0 ? `<span class="absolute -top-1.5 right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">${cartCount}</span>` : ''}</a>
            <a href="https://wa.me/${s.whatsappNumber}" target="_blank" class="flex flex-col items-center text-emerald-600"><i class="fa-brands fa-whatsapp text-lg"></i><span class="text-[10px] font-bold mt-0.5">WhatsApp</span></a>
            <a href="/orders" class="flex flex-col items-center"><i class="fa-solid fa-box text-base"></i><span class="text-[10px] font-bold mt-0.5">My Orders</span></a>
        </nav>
    </body>
    </html>
    `);
});

// Single Product Page with Comments & Ratings
app.get('/product/:id', (req, res) => {
    const p = db.products.find(x => x.id === req.params.id);
    if (!p) return res.redirect('/');
    const s = db.settings;
    const prodReviews = db.reviews.filter(r => r.productId === p.id);

    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>${p.title}</title>${themeHeadStyles}</head>
    <body class="p-3 space-y-4">
        <a href="/" class="inline-block text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg mb-2"><i class="fa-solid fa-arrow-left"></i> Back to Shop</a>
        
        <div class="glass-card overflow-hidden">
            <div class="flex overflow-x-auto snap-x h-64 bg-slate-100">
                ${(p.images && p.images.length > 0 ? p.images : ['/uploads/placeholder.jpg']).map(img => `
                    <img src="${img}" class="w-full h-full object-cover flex-shrink-0 snap-center">
                `).join('')}
            </div>
            <div class="p-4 space-y-2">
                <h1 class="text-lg font-black text-[#111111]">${p.title}</h1>
                <div class="text-xl font-black text-[#2563EB]">${s.currency} ${Number(p.price).toLocaleString()}</div>
                <p class="text-xs text-slate-600 leading-relaxed">${p.description}</p>
                <a href="/cart/add/${p.id}" class="w-full btn-primary-grad py-3 rounded-xl text-center text-xs font-bold block mt-3">
                    <i class="fa-solid fa-cart-plus mr-1"></i> Add to Cart
                </a>
            </div>
        </div>

        <!-- Comments & Reviews -->
        <div class="glass-card p-4 space-y-3">
            <h3 class="text-xs font-black uppercase text-[#111111]"><i class="fa-solid fa-comments text-[#7C3AED]"></i> Customer Reviews & Ratings</h3>
            <form action="/product/review/add" method="POST" class="space-y-2">
                <input type="hidden" name="productId" value="${p.id}">
                <input type="text" name="name" placeholder="Your Name" required class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs">
                <select name="rating" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-bold text-amber-500">
                    <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value="4">⭐⭐⭐⭐ (4/5)</option>
                    <option value="3">⭐⭐⭐ (3/5)</option>
                </select>
                <textarea name="comment" placeholder="Write your feedback..." required class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs h-16"></textarea>
                <button type="submit" class="w-full purple-grad text-xs font-bold py-2.5 rounded-xl">Post Review</button>
            </form>

            <div class="space-y-2 pt-2 border-t">
                ${prodReviews.length === 0 ? `<p class="text-[11px] text-slate-400">No comments yet. Be the first to review!</p>` : `
                    ${prodReviews.map(r => `
                        <div class="bg-slate-50 p-2.5 rounded-xl space-y-1 text-xs">
                            <div class="flex justify-between font-bold">
                                <span>${r.name}</span>
                                <span class="text-amber-500">${'⭐'.repeat(Number(r.rating))}</span>
                            </div>
                            <p class="text-slate-600 text-[11px]">${r.comment}</p>
                        </div>
                    `).join('')}
                `}
            </div>
        </div>
    </body>
    </html>
    `);
});

app.post('/product/review/add', (req, res) => {
    const { productId, name, rating, comment } = req.body;
    db.reviews.push({ id: "rev_" + Date.now(), productId, name, rating, comment, date: new Date().toLocaleDateString() });
    saveData(db);
    res.redirect('/product/' + productId);
});

// CART ENGINE & CHECKOUT
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

app.get('/cart', (req, res) => {
    const cart = req.session.cart || [];
    const s = db.settings;
    const total = cart.reduce((acc, item) => acc + (Number(item.price) * item.qty), 0);

    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>My Cart</title>${themeHeadStyles}</head>
    <body class="p-3 space-y-4">
        <a href="/" class="inline-block text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg"><i class="fa-solid fa-arrow-left"></i> Continue Shopping</a>
        <h1 class="text-base font-black text-[#111111]"><i class="fa-solid fa-cart-shopping text-[#2563EB]"></i> Shopping Cart</h1>

        ${cart.length === 0 ? `<div class="text-center py-12 glass-card text-xs text-slate-400">Cart Khali Hai.</div>` : `
            <div class="space-y-2">
                ${cart.map(item => `
                    <div class="glass-card p-3 flex justify-between items-center gap-3">
                        <img src="${item.image || '/uploads/placeholder.jpg'}" class="w-12 h-12 rounded-lg object-cover">
                        <div class="flex-1">
                            <h4 class="font-bold text-xs line-clamp-1">${item.title}</h4>
                            <div class="text-xs font-black text-[#2563EB]">PKR ${item.price} x ${item.qty}</div>
                        </div>
                        <a href="/cart/remove/${item.id}" class="text-red-500 text-xs p-2"><i class="fa-solid fa-trash"></i></a>
                    </div>
                `).join('')}

                <div class="glass-card p-4 space-y-3">
                    <div class="flex justify-between font-black text-sm text-[#111111]">
                        <span>Total Amount:</span>
                        <span>${s.currency} ${total.toLocaleString()}</span>
                    </div>

                    <form action="/cart/checkout" method="POST" class="space-y-2 pt-2 border-t">
                        <h4 class="text-xs font-bold text-slate-700">Enter Delivery Address & Mobile Details:</h4>
                        <input type="text" name="customerName" placeholder="Full Name" required class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs">
                        <input type="text" name="phone" placeholder="Mobile Number" required class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs">
                        <input type="text" name="whatsapp" placeholder="WhatsApp Number" required class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs">
                        <textarea name="address" placeholder="Complete Delivery Address..." required class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs h-16"></textarea>
                        
                        <button type="submit" class="w-full blue-emerald-grad font-bold py-3 rounded-xl text-xs uppercase tracking-wider">
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

app.get('/cart/remove/:id', (req, res) => {
    if (req.session.cart) {
        req.session.cart = req.session.cart.filter(x => x.id !== req.params.id);
    }
    res.redirect('/cart');
});

app.post('/cart/checkout', (req, res) => {
    const cart = req.session.cart || [];
    if (cart.length === 0) return res.redirect('/');
    const { customerName, phone, whatsapp, address } = req.body;
    const s = db.settings;
    const total = cart.reduce((acc, item) => acc + (Number(item.price) * item.qty), 0);

    const order = {
        id: "ORD_" + Date.now(),
        customerName,
        phone,
        whatsapp,
        address,
        items: cart,
        totalAmount: total,
        status: "Pending Admin Approval & WhatsApp Payment",
        courierName: "",
        trackingNumber: "",
        date: new Date().toLocaleString()
    };

    db.orders.push(order);
    saveData(db);
    req.session.cart = [];

    // Redirect to WhatsApp for Direct Payment
    const waMsg = encodeURIComponent(`Hello ANZEXA Admin,\nNew Order Placed!\nOrder ID: ${order.id}\nTotal: PKR ${total}\nName: ${customerName}\nAddress: ${address}\nPlease share WhatsApp payment details.`);
    res.send(`<script>alert('Order placed successfully! Redirecting to Admin WhatsApp for payment.'); window.location='https://wa.me/${s.whatsappNumber}?text=${waMsg}';</script>`);
});

// User Orders Tracking
app.get('/orders', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>My Orders</title>${themeHeadStyles}</head>
    <body class="p-3 space-y-3">
        <a href="/" class="inline-block text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg"><i class="fa-solid fa-arrow-left"></i> Home</a>
        <h1 class="text-base font-black text-[#111111]">My Orders</h1>

        ${db.orders.length === 0 ? `<p class="text-xs text-slate-400">No orders found.</p>` : `
            <div class="space-y-3">
                ${db.orders.map(o => `
                    <div class="glass-card p-3 space-y-2 text-xs">
                        <div class="flex justify-between font-bold border-b pb-1">
                            <span class="text-[#2563EB]">${o.id}</span>
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${o.status.includes('Approved') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${o.status}</span>
                        </div>
                        <div><strong>Total:</strong> PKR ${o.totalAmount}</div>
                        <div><strong>Delivery Address:</strong> ${o.address}</div>
                        ${o.courierName ? `
                            <div class="bg-blue-50 border border-blue-200 p-2 rounded-xl text-blue-900 font-bold">
                                🚚 Courier: ${o.courierName}<br>
                                📦 Tracking No: ${o.trackingNumber}
                            </div>
                        ` : '<div class="text-[11px] text-amber-600">Awaiting Admin Approval & Courier Tracking</div>'}
                    </div>
                `).join('')}
            </div>
        `}
    </body>
    </html>
    `);
});

// AUTH SYSTEM
app.get('/login', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Login</title>${themeHeadStyles}</head>
    <body class="flex items-center justify-center min-h-screen p-4">
        <form action="/login" method="POST" class="glass-card p-6 w-full space-y-4">
            <h2 class="text-xl font-black text-center text-[#111111]">Login</h2>
            <input type="email" name="email" placeholder="Email" required class="w-full bg-slate-50 border p-3 rounded-xl text-xs">
            <input type="password" name="password" placeholder="Password" required class="w-full bg-slate-50 border p-3 rounded-xl text-xs">
            <button type="submit" class="w-full btn-primary-grad font-bold p-3 rounded-xl text-xs">Sign In</button>
            <a href="/register" class="block text-center text-xs text-[#2563EB] font-bold">Create Customer Account</a>
        </form>
    </body>
    </html>
    `);
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) return res.send("<script>alert('Invalid Email/Password'); window.location='/login';</script>");
    req.session.user = user;
    if (user.role === 'Super Admin') return res.redirect('/admin');
    return res.redirect('/');
});

app.get('/register', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Register</title>${themeHeadStyles}</head>
    <body class="flex items-center justify-center min-h-screen p-4">
        <form action="/register" method="POST" class="glass-card p-6 w-full space-y-3">
            <h2 class="text-xl font-black text-center text-[#111111]">Customer Sign Up</h2>
            <input type="text" name="name" placeholder="Full Name" required class="w-full bg-slate-50 border p-3 rounded-xl text-xs">
            <input type="email" name="email" placeholder="Email" required class="w-full bg-slate-50 border p-3 rounded-xl text-xs">
            <input type="text" name="phone" placeholder="Phone" required class="w-full bg-slate-50 border p-3 rounded-xl text-xs">
            <input type="password" name="password" placeholder="Password" required class="w-full bg-slate-50 border p-3 rounded-xl text-xs">
            <button type="submit" class="w-full btn-primary-grad font-bold p-3 rounded-xl text-xs">Register</button>
            <a href="/login" class="block text-center text-xs text-slate-500">Back to Login</a>
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

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// ================= MOBILE SUPER ADMIN HUB ================= //

app.get('/admin', requireAdmin, (req, res) => {
    const s = db.settings;

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Admin Dashboard</title>
        ${themeHeadStyles}
    </head>
    <body class="p-3 space-y-4">
        <!-- Header with View Site Button -->
        <div class="flex justify-between items-center bg-white p-3 rounded-2xl border">
            <div>
                <h1 class="font-black text-sm text-[#111111]">ADMIN HUB</h1>
                <p class="text-[10px] text-slate-400">Control Panel</p>
            </div>
            <a href="/" target="_blank" class="blue-emerald-grad px-3 py-1.5 rounded-xl text-xs font-bold shadow">
                <i class="fa-solid fa-globe mr-1"></i> View Site
            </a>
        </div>

        <!-- Orders Management & Approval System -->
        <section class="glass-card p-4 space-y-3">
            <h2 class="text-xs font-black uppercase text-[#111111] flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span> Orders & WhatsApp Payment Approval (${db.orders.length})
            </h2>

            ${db.orders.length === 0 ? `<p class="text-xs text-slate-400">No customer orders yet.</p>` : `
                <div class="space-y-3">
                    ${db.orders.map(o => `
                        <div class="bg-slate-50 border p-3 rounded-xl space-y-2 text-xs">
                            <div class="flex justify-between font-bold">
                                <span class="text-[#2563EB]">${o.id}</span>
                                <span class="text-emerald-700 font-black">PKR ${o.totalAmount}</span>
                            </div>
                            <div class="space-y-0.5 text-slate-600">
                                <div><strong>Customer:</strong> ${o.customerName}</div>
                                <div><strong>Mobile:</strong> ${o.phone} | <strong>WA:</strong> ${o.whatsapp}</div>
                                <div><strong>Address:</strong> ${o.address}</div>
                            </div>

                            <form action="/admin/orders/approve" method="POST" class="pt-2 border-t space-y-2">
                                <input type="hidden" name="orderId" value="${o.id}">
                                <div class="grid grid-cols-2 gap-2">
                                    <input type="text" name="courierName" placeholder="Courier (TCS/Leopard)" value="${o.courierName}" required class="bg-white border p-2 rounded-lg text-xs">
                                    <input type="text" name="trackingNumber" placeholder="Tracking Number" value="${o.trackingNumber}" required class="bg-white border p-2 rounded-lg text-xs">
                                </div>
                                <button type="submit" class="w-full bg-emerald-600 text-white font-bold py-2 rounded-lg text-xs">
                                    Approve & Send Tracking Info
                                </button>
                            </form>
                        </div>
                    `).join('')}
                </div>
            `}
        </section>

        <!-- Categories Control -->
        <section class="glass-card p-4 space-y-3">
            <h2 class="text-xs font-black uppercase text-[#111111]">Add Category (With Image)</h2>
            <form action="/admin/categories/add" method="POST" enctype="multipart/form-data" class="space-y-2">
                <input type="text" name="name" placeholder="Category Name" required class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs">
                <input type="file" name="coverPhoto" accept="image/*" required class="w-full text-xs">
                <button type="submit" class="w-full btn-primary-grad font-bold py-2.5 rounded-xl text-xs">Add Category</button>
            </form>
        </section>

        <!-- Product Upload -->
        <section class="glass-card p-4 space-y-3">
            <h2 class="text-xs font-black uppercase text-[#111111]">Upload Product</h2>
            <form action="/admin/products/add" method="POST" enctype="multipart/form-data" class="space-y-2">
                <input type="text" name="title" placeholder="Product Title" required class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs">
                <input type="text" name="price" placeholder="Price (PKR)" required class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs">
                <select name="categoryId" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs font-bold">
                    ${db.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
                <input type="file" name="productImages" accept="image/*" multiple required class="w-full text-xs">
                <textarea name="description" placeholder="Product Description..." class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs h-16"></textarea>
                <button type="submit" class="w-full purple-grad font-bold py-2.5 rounded-xl text-xs">Publish Product</button>
            </form>
        </section>
    </body>
    </html>
    `);
});

// Admin Controllers
app.post('/admin/categories/add', requireAdmin, upload.single('coverPhoto'), (req, res) => {
    const { name } = req.body;
    const coverPhoto = req.file ? '/uploads/' + req.file.filename : '';
    db.categories.push({ id: "cat_" + Date.now(), name, coverPhoto });
    saveData(db);
    res.redirect('/admin');
});

app.post('/admin/products/add', requireAdmin, upload.array('productImages', 10), (req, res) => {
    const { title, price, categoryId, description } = req.body;
    const images = req.files ? req.files.map(f => '/uploads/' + f.filename) : [];
    db.products.push({ id: "prod_" + Date.now(), title, price, categoryId, description, images });
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
    res.redirect('/admin');
});

app.listen(PORT, () => console.log('Mobile First Store Running on Port ' + PORT));
