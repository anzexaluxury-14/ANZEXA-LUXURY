const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Uploads Directory Setup
const publicDir = path.join(__dirname, 'public');
const uploadDir = path.join(__dirname, 'public/uploads');
[publicDir, uploadDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'))
});
const upload = multer({ storage });

const dataFile = path.join(__dirname, 'data.json');

const defaultData = {
    settings: {
        siteTitle: "ANZEXA | Luxury Boutique Store",
        metaDescription: "Premium Exclusive Collection & Products",
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
    vouchers: [],
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
    secret: 'anzexa_lux_secret_2026',
    resave: false,
    saveUninitialized: true
}));

function requireAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'Super Admin') return next();
    return res.redirect('/login');
}

// Common Head CSS component including User's exact Color & Gradient Design System
const themeHeadStyles = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --pure-white: #FFFFFF;
            --soft-white: #F8FAFC;
            --deep-black: #111111;
            --charcoal: #1E1E1E;
            --royal-blue: #2563EB;
            --light-blue: #60A5FA;
            --emerald-green: #10B981;
            --soft-purple: #7C3AED;
            --luxury-gold: #D4AF37;
            --silver: #E5E7EB;
            --glass-border: rgba(255, 255, 255, 0.18);
            --glass-bg: rgba(255, 255, 255, 0.10);
            --shadow-subtle: 0 10px 25px -5px rgba(0, 0, 0, 0.12);
        }

        body {
            background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);
            color: #111111;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            min-height: 100vh;
        }

        .btn-primary-grad {
            background: linear-gradient(135deg, #2563EB 0%, #60A5FA 100%);
            color: #FFFFFF;
            box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.39);
        }
        .btn-primary-grad:hover {
            opacity: 0.95;
            box-shadow: 0 6px 20px 0 rgba(59, 130, 246, 0.5);
        }

        .hero-dark-grad {
            background: linear-gradient(135deg, #111111 0%, #0F172A 55%, #1E3A8A 100%);
            color: #FFFFFF;
        }

        .blue-emerald-grad {
            background: linear-gradient(135deg, #2563EB 0%, #10B981 100%);
        }

        .purple-grad {
            background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
        }

        .glass-card {
            background: #FFFFFF;
            border: 1px solid #E5E7EB;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
            border-radius: 1.5rem;
        }

        .glow-blue { box-shadow: 0 0 20px #3B82F6; }
        .glow-green { box-shadow: 0 0 20px #34D399; }
        .glow-purple { box-shadow: 0 0 20px #8B5CF6; }
        .glow-gold { box-shadow: 0 0 20px #FACC15; }

        .gold-badge {
            background: #D4AF37;
            color: #FFFFFF;
        }
    </style>
`;

// ================= FRONTEND STORE ================= //

app.get('/', (req, res) => {
    const s = db.settings;

    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>${s.siteTitle}</title>
        ${themeHeadStyles}
    </head>
    <body class="flex flex-col">
        <!-- Header -->
        <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
            <a href="/" class="flex items-center gap-3">
                ${s.logoUrl ? `<img src="${s.logoUrl}" class="h-10 object-contain">` : `<span class="text-2xl font-black tracking-widest text-[#111111]">${s.siteTitle.split('|')[0]}</span>`}
            </a>
            <div class="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
                <a href="#categories" class="hidden md:inline hover:text-[#2563EB]">Categories</a>
                <a href="#products" class="hidden md:inline hover:text-[#2563EB]">Products</a>
                <a href="#complaints" class="hidden md:inline hover:text-[#2563EB]">Support</a>
                ${req.session.user ? `
                    <a href="${req.session.user.role === 'Super Admin' ? '/admin' : '/dashboard'}" class="text-[#2563EB] font-bold"><i class="fa-solid fa-user"></i> ${req.session.user.name}</a>
                    <a href="/logout" class="text-red-500 hover:underline">Logout</a>
                ` : `
                    <a href="/login" class="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-[#111111]">Login</a>
                    <a href="/register" class="px-4 py-2 rounded-xl btn-primary-grad font-bold">Register</a>
                `}
            </div>
        </header>

        <!-- Hero Section with Dark Gradient Theme -->
        <section class="max-w-6xl mx-auto my-6 px-6 py-12 rounded-3xl hero-dark-grad text-center space-y-4 shadow-2xl relative overflow-hidden">
            <span class="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-400 text-black">Official Store</span>
            <h1 class="text-3xl md:text-5xl font-black tracking-tight">${s.siteTitle}</h1>
            <p class="text-slate-300 max-w-xl mx-auto text-sm md:text-base">${s.metaDescription}</p>
        </section>

        <!-- Categories Section -->
        <section id="categories" class="max-w-6xl mx-auto px-6 py-6 w-full">
            <h2 class="text-lg font-black mb-4 uppercase tracking-wider text-[#111111] flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-[#2563EB] inline-block"></span> Categories
            </h2>
            ${db.categories.length === 0 ? `<p class="text-xs text-slate-400">No categories added yet.</p>` : `
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${db.categories.map(c => `
                        <div class="glass-card p-3 flex items-center gap-3 hover:border-[#2563EB] transition">
                            <img src="${c.coverPhoto || '/uploads/placeholder.jpg'}" class="w-12 h-12 rounded-xl object-cover bg-slate-100">
                            <span class="font-bold text-sm text-[#111111]">${c.name}</span>
                        </div>
                    `).join('')}
                </div>
            `}
        </section>

        <!-- Products Section -->
        <section id="products" class="max-w-6xl mx-auto px-6 py-8 w-full flex-1">
            <h2 class="text-lg font-black mb-6 uppercase tracking-wider text-[#111111] flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-[#10B981] inline-block"></span> Featured Collection
            </h2>
            ${db.products.length === 0 ? `<div class="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">No products available in store right now.</div>` : `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    ${db.products.map(p => `
                        <div class="glass-card overflow-hidden flex flex-col justify-between hover:scale-[1.01] transition">
                            <div>
                                <div class="flex overflow-x-auto snap-x snap-mandatory h-64 bg-slate-100">
                                    ${(p.images && p.images.length > 0 ? p.images : ['/uploads/placeholder.jpg']).map(img => `
                                        <img src="${img}" class="w-full h-full object-cover flex-shrink-0 snap-center">
                                    `).join('')}
                                </div>
                                <div class="p-5 space-y-2">
                                    <div class="text-[#D4AF37] text-xs"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i> (5.0)</div>
                                    <h3 class="font-bold text-base text-[#111111]">${p.title}</h3>
                                    <p class="text-xs text-slate-500 line-clamp-2">${p.description}</p>
                                </div>
                            </div>
                            <div class="p-5 pt-0 space-y-3">
                                <div class="text-2xl font-black text-[#111111]">${s.currency} ${Number(p.price).toLocaleString()}</div>
                                <a href="https://wa.me/${s.whatsappNumber}?text=I%20want%20to%20order:%20${encodeURIComponent(p.title)}" target="_blank" class="w-full blue-emerald-grad text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider block text-center shadow-lg">
                                    <i class="fa-brands fa-whatsapp text-sm"></i> Instant Order via WhatsApp
                                </a>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </section>

        <!-- Complaints Box -->
        <section id="complaints" class="max-w-2xl mx-auto px-6 py-8 w-full">
            <div class="glass-card p-6 space-y-4">
                <h3 class="font-bold text-base text-[#111111] uppercase tracking-wider"><i class="fa-solid fa-headset text-[#7C3AED]"></i> Customer Support & Complaints</h3>
                <form action="/complaint/submit" method="POST" class="space-y-3">
                    <input type="text" name="name" placeholder="Full Name" required class="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-sm focus:outline-none focus:border-[#2563EB]">
                    <input type="text" name="phone" placeholder="WhatsApp Number" required class="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-sm focus:outline-none focus:border-[#2563EB]">
                    <textarea name="message" placeholder="Type your complaint or message..." required class="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-sm h-24 focus:outline-none focus:border-[#2563EB]"></textarea>
                    <button type="submit" class="w-full purple-grad text-white font-bold py-3 rounded-xl text-sm uppercase">Submit Message</button>
                </form>
            </div>
        </section>

        <!-- Floating WhatsApp Glow Button -->
        <a href="https://wa.me/${s.whatsappNumber}" target="_blank" class="fixed bottom-6 right-6 w-14 h-14 bg-[#10B981] text-white rounded-full flex items-center justify-center text-2xl z-50 glow-green hover:scale-110 transition">
            <i class="fa-brands fa-whatsapp"></i>
        </a>

        <!-- Footer -->
        <footer class="border-t border-slate-200 mt-12 py-8 px-6 text-center text-xs text-slate-500 space-y-2 bg-white">
            <p>${s.address} | Contact: ${s.phoneNumber} | Email: ${s.businessEmail}</p>
            <p>© 2026 ${s.siteTitle}. All Rights Reserved.</p>
        </footer>
    </body>
    </html>
    `);
});

app.post('/complaint/submit', (req, res) => {
    const { name, phone, message } = req.body;
    db.complaints.push({ id: "comp_" + Date.now(), name, phone, message, date: new Date().toLocaleString() });
    saveData(db);
    res.send("<script>alert('Complaint submitted!'); window.location='/';</script>");
});

// ================= AUTH SYSTEM ================= //

app.get('/login', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Login | Store</title>${themeHeadStyles}</head>
    <body class="flex items-center justify-center min-h-screen p-4">
        <form action="/login" method="POST" class="glass-card p-8 max-w-sm w-full space-y-4">
            <h2 class="text-2xl font-black text-center text-[#111111]">Account Login</h2>
            <div>
                <label class="text-xs font-bold text-slate-600">Email Address</label>
                <input type="email" name="email" required class="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-sm mt-1 focus:outline-none">
            </div>
            <div>
                <label class="text-xs font-bold text-slate-600">Password</label>
                <input type="password" name="password" required class="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-sm mt-1 focus:outline-none">
            </div>
            <button type="submit" class="w-full btn-primary-grad font-bold p-3 rounded-xl">Sign In</button>
            <div class="flex justify-between text-xs pt-2 border-t border-slate-100">
                <a href="/register" class="text-[#2563EB] hover:underline">Customer Register</a>
                <a href="/register-reseller" class="text-[#7C3AED] font-bold hover:underline">Apply as Reseller</a>
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
    if (user.role === 'Reseller' && user.status !== 'Approved') return res.send("<script>alert('Reseller account pending approval.'); window.location='/login';</script>");
    req.session.user = user;
    if (user.role === 'Super Admin') return res.redirect('/admin');
    return res.redirect('/');
});

app.get('/register', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Register Customer</title>${themeHeadStyles}</head>
    <body class="flex items-center justify-center min-h-screen p-4">
        <form action="/register" method="POST" class="glass-card p-8 max-w-sm w-full space-y-4">
            <h2 class="text-2xl font-black text-center text-[#111111]">Customer Sign Up</h2>
            <input type="text" name="name" placeholder="Full Name" required class="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-sm">
            <input type="email" name="email" placeholder="Email Address" required class="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-sm">
            <input type="text" name="phone" placeholder="Phone Number" required class="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-sm">
            <input type="password" name="password" placeholder="Password" required class="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-sm">
            <button type="submit" class="w-full btn-primary-grad font-bold p-3 rounded-xl">Create Account</button>
            <p class="text-xs text-center text-slate-500 pt-2"><a href="/login" class="underline">Already have an account? Login</a></p>
        </form>
    </body>
    </html>
    `);
});

app.post('/register', (req, res) => {
    const { name, email, phone, password } = req.body;
    db.users.push({ id: "usr_" + Date.now(), name, email, phone, password, role: "Customer", status: "Approved", idCardNumber: "N/A" });
    saveData(db);
    res.send("<script>alert('Account created! Please login.'); window.location='/login';</script>");
});

app.get('/register-reseller', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Reseller Registration</title>${themeHeadStyles}</head>
    <body class="flex items-center justify-center min-h-screen p-4">
        <form action="/register-reseller" method="POST" class="glass-card p-8 max-w-md w-full space-y-4">
            <h2 class="text-2xl font-black text-center text-[#111111]">Reseller Application</h2>
            <input type="text" name="name" placeholder="Full Name" required class="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-sm">
            <input type="email" name="email" placeholder="Email Address" required class="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-sm">
            <input type="text" name="phone" placeholder="WhatsApp / Mobile" required class="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-sm">
            <input type="text" name="idCardNumber" placeholder="CNIC / ID Card Number" required class="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-sm">
            <input type="password" name="password" placeholder="Password" required class="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-sm">
            <button type="submit" class="w-full purple-grad text-white font-bold p-3 rounded-xl">Submit Application</button>
            <p class="text-xs text-center text-slate-500 pt-2"><a href="/login" class="underline">Back to Login</a></p>
        </form>
    </body>
    </html>
    `);
});

app.post('/register-reseller', (req, res) => {
    const { name, email, phone, idCardNumber, password } = req.body;
    db.users.push({ id: "usr_" + Date.now(), name, email, phone, idCardNumber, password, role: "Reseller", status: "Pending" });
    saveData(db);
    res.send("<script>alert('Reseller request sent for admin approval!'); window.location='/login';</script>");
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// ================= SUPER ADMIN HUB ================= //

app.get('/admin', requireAdmin, (req, res) => {
    const s = db.settings;
    const resellers = db.users.filter(u => u.role === 'Reseller');

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Super Admin Dashboard</title>
        ${themeHeadStyles}
    </head>
    <body class="min-h-screen flex bg-slate-50">
        <aside class="w-64 bg-white border-r border-slate-200 p-6 space-y-6 hidden md:block shadow-sm">
            <h1 class="text-xl font-black text-[#111111] tracking-wider">SUPER ADMIN</h1>
            <nav class="space-y-2 text-sm font-bold">
                <a href="#logo" class="block p-3 rounded-xl hover:bg-slate-100 text-[#111111]"><i class="fa-solid fa-image mr-2 text-[#2563EB]"></i> Upload Logo</a>
                <a href="#resellers" class="block p-3 rounded-xl hover:bg-slate-100 text-[#111111]"><i class="fa-solid fa-id-card mr-2 text-[#7C3AED]"></i> Resellers (${resellers.length})</a>
                <a href="#categories" class="block p-3 rounded-xl hover:bg-slate-100 text-[#111111]"><i class="fa-solid fa-layer-group mr-2 text-[#10B981]"></i> Categories (${db.categories.length})</a>
                <a href="#products" class="block p-3 rounded-xl hover:bg-slate-100 text-[#111111]"><i class="fa-solid fa-boxes-stacked mr-2 text-[#D4AF37]"></i> Products (${db.products.length})</a>
                <a href="/" target="_blank" class="block p-3 rounded-xl btn-primary-grad font-bold mt-4 text-center"><i class="fa-solid fa-globe mr-2"></i> View Live Store</a>
            </nav>
        </aside>

        <main class="flex-1 p-8 space-y-8 overflow-y-auto">
            <!-- Logo Upload -->
            <section id="logo" class="glass-card p-6 space-y-4">
                <h2 class="text-lg font-black text-[#111111]"><i class="fa-solid fa-upload text-[#2563EB]"></i> Direct Logo Upload</h2>
                <form action="/admin/logo/upload" method="POST" enctype="multipart/form-data" class="flex items-center gap-4">
                    <input type="file" name="logo" accept="image/*" required class="bg-slate-50 border border-slate-300 p-2 rounded-xl text-xs">
                    <button type="submit" class="btn-primary-grad font-bold px-5 py-2 rounded-xl text-sm">Upload Logo</button>
                </form>
            </section>

            <!-- Category Upload -->
            <section id="categories" class="glass-card p-6 space-y-4">
                <h2 class="text-lg font-black text-[#111111]"><i class="fa-solid fa-layer-group text-[#10B981]"></i> Add Category</h2>
                <form action="/admin/categories/add" method="POST" enctype="multipart/form-data" class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" name="name" placeholder="Category Name" required class="bg-slate-50 border border-slate-300 p-3 rounded-xl text-sm">
                    <input type="file" name="coverPhoto" accept="image/*" required class="bg-slate-50 border border-slate-300 p-2 rounded-xl text-xs">
                    <button type="submit" class="blue-emerald-grad text-white font-bold p-3 rounded-xl text-sm">Add Category</button>
                </form>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
                    ${db.categories.map(c => `
                        <div class="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex justify-between items-center">
                            <div class="flex items-center gap-2">
                                <img src="${c.coverPhoto}" class="w-8 h-8 rounded-lg object-cover">
                                <span class="text-xs font-bold">${c.name}</span>
                            </div>
                            <a href="/admin/categories/delete/${c.id}" class="text-red-500 text-xs"><i class="fa-solid fa-trash"></i></a>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Product Upload with Multi-Photos -->
            <section id="products" class="glass-card p-6 space-y-4">
                <h2 class="text-lg font-black text-[#111111]"><i class="fa-solid fa-plus text-[#D4AF37]"></i> Add Product (Multi-Photos Gallery Upload)</h2>
                <form action="/admin/products/add" method="POST" enctype="multipart/form-data" class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" name="title" placeholder="Product Title" required class="bg-slate-50 border border-slate-300 p-3 rounded-xl text-sm">
                    <input type="text" name="price" placeholder="Price (PKR)" required class="bg-slate-50 border border-slate-300 p-3 rounded-xl text-sm">
                    <select name="categoryId" class="bg-slate-50 border border-slate-300 p-3 rounded-xl text-sm">
                        ${db.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                    <div class="md:col-span-3 bg-slate-50 border border-slate-300 p-4 rounded-xl space-y-2">
                        <label class="text-xs font-bold text-slate-700">Select Multiple Images from Gallery:</label>
                        <input type="file" name="productImages" accept="image/*" multiple required class="w-full text-xs">
                    </div>
                    <textarea name="description" placeholder="Product Description" class="md:col-span-3 bg-slate-50 border border-slate-300 p-3 rounded-xl text-sm h-20"></textarea>
                    <button type="submit" class="md:col-span-3 btn-primary-grad font-bold p-3 rounded-xl text-sm">Publish Product</button>
                </form>

                <h3 class="font-bold text-sm pt-4">Existing Products (${db.products.length})</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    ${db.products.map(p => `
                        <div class="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-2">
                            <div class="flex gap-1 overflow-x-auto h-24">
                                ${(p.images || []).map(img => `<img src="${img}" class="h-full w-20 object-cover rounded-lg">`).join('')}
                            </div>
                            <h4 class="font-bold text-sm">${p.title}</h4>
                            <p class="text-xs font-bold text-blue-600">PKR ${p.price}</p>
                            <a href="/admin/products/delete/${p.id}" class="block text-center bg-red-100 text-red-600 py-1 rounded text-xs font-semibold">Delete</a>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Reseller Verification -->
            <section id="resellers" class="glass-card p-6 space-y-4">
                <h2 class="text-lg font-black text-[#111111]"><i class="fa-solid fa-id-card text-[#7C3AED]"></i> Reseller Management</h2>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead class="bg-slate-100 font-bold">
                            <tr>
                                <th class="p-3">Name</th>
                                <th class="p-3">Contact</th>
                                <th class="p-3">CNIC / ID</th>
                                <th class="p-3">Status</th>
                                <th class="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${resellers.map(r => `
                                <tr class="border-b border-slate-200">
                                    <td class="p-3 font-bold">${r.name}</td>
                                    <td class="p-3">${r.email}<br>${r.phone}</td>
                                    <td class="p-3 font-mono font-bold">${r.idCardNumber}</td>
                                    <td class="p-3"><span class="px-2 py-1 rounded text-[10px] font-bold ${r.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${r.status}</span></td>
                                    <td class="p-3 flex gap-2">
                                        <a href="/admin/reseller/approve/${r.id}" class="bg-emerald-600 text-white px-2 py-1 rounded font-bold">Approve</a>
                                        <a href="/admin/reseller/reject/${r.id}" class="bg-red-600 text-white px-2 py-1 rounded font-bold">Reject</a>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    </body>
    </html>
    `);
});

// Admin Controllers
app.post('/admin/logo/upload', requireAdmin, upload.single('logo'), (req, res) => {
    if (req.file) {
        db.settings.logoUrl = '/uploads/' + req.file.filename;
        saveData(db);
    }
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
    db.categories = db.categories.filter(x => x.id !== req.params.id);
    saveData(db);
    res.redirect('/admin');
});

app.post('/admin/products/add', requireAdmin, upload.array('productImages', 10), (req, res) => {
    const { title, price, categoryId, description } = req.body;
    const images = req.files ? req.files.map(f => '/uploads/' + f.filename) : [];
    
    db.products.push({
        id: "prod_" + Date.now(),
        title,
        price,
        categoryId,
        description,
        images
    });
    saveData(db);
    res.redirect('/admin');
});

app.get('/admin/products/delete/:id', requireAdmin, (req, res) => {
    db.products = db.products.filter(x => x.id !== req.params.id);
    saveData(db);
    res.redirect('/admin');
});

app.get('/admin/reseller/approve/:id', requireAdmin, (req, res) => {
    const u = db.users.find(x => x.id === req.params.id);
    if (u) u.status = 'Approved';
    saveData(db);
    res.redirect('/admin');
});

app.get('/admin/reseller/reject/:id', requireAdmin, (req, res) => {
    db.users = db.users.filter(x => x.id !== req.params.id);
    saveData(db);
    res.redirect('/admin');
});

app.listen(PORT, () => console.log('System Running with Custom Color System on Port ' + PORT));
