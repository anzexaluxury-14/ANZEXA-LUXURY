const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Directory Setup
const publicDir = path.join(__dirname, 'public');
const uploadDir = path.join(__dirname, 'public/uploads');
[publicDir, uploadDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Storage Engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const dataFile = path.join(__dirname, 'data.json');

// Default Database Structure
const defaultData = {
    settings: {
        siteTitle: "ANZEXA | Pure Luxury Store",
        metaDescription: "High-End Pure Gold & Luxury E-Commerce Engine",
        logoUrl: "",
        currency: "PKR Rs.",
        whatsappNumber: "923000000000",
        phoneNumber: "+92 300 0000000",
        businessEmail: "info@anzexa.com",
        address: "Main Luxury Avenue, Pakistan",
        socialLinks: {
            instagram: "https://instagram.com",
            facebook: "https://facebook.com",
            tiktok: "https://tiktok.com",
            telegram: "https://t.me"
        },
        customCSS: "",
        currentTheme: {
            bg: "#0A0A0A",
            cardBg: "#121212",
            accent: "#F3C623",
            text: "#FFFFFF",
            border: "rgba(243, 198, 35, 0.25)"
        }
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

// App Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(uploadDir));
app.use(session({
    secret: 'anzexa_luxury_engine_secret_2026',
    resave: false,
    saveUninitialized: true
}));

// Auth Middlewares
function requireAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'Super Admin') return next();
    return res.redirect('/login');
}

function requireAuth(req, res, next) {
    if (req.session.user) return next();
    return res.redirect('/login');
}

// ================= FRONTEND ROUTES ================= //

// Home / Storefront
app.get('/', (req, res) => {
    const s = db.settings;
    const theme = s.currentTheme;

    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${s.siteTitle}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            body { background-color: ${theme.bg}; color: ${theme.text}; }
            .card-theme { background-color: ${theme.cardBg}; border: 1px solid ${theme.border}; }
            .accent-btn { background-color: ${theme.accent}; color: #000; font-weight: bold; }
            .accent-text { color: ${theme.accent}; }
            ${s.customCSS}
        </style>
    </head>
    <body class="min-h-screen flex flex-col">
        <!-- Header -->
        <header class="sticky top-0 z-50 card-theme backdrop-blur-md px-6 py-4 flex justify-between items-center">
            <a href="/" class="flex items-center gap-3">
                ${s.logoUrl ? `<img src="${s.logoUrl}" class="h-10 object-contain">` : `<span class="text-2xl font-black accent-text uppercase tracking-widest">${s.siteTitle.split('|')[0]}</span>`}
            </a>
            <div class="flex items-center gap-4 text-sm">
                <a href="#categories" class="hidden md:inline hover:opacity-80">Categories</a>
                <a href="#products" class="hidden md:inline hover:opacity-80">Products</a>
                <a href="#complaints" class="hidden md:inline hover:opacity-80">Complain Box</a>
                ${req.session.user ? `
                    <a href="${req.session.user.role === 'Super Admin' ? '/admin' : '/dashboard'}" class="accent-text font-bold"><i class="fa-solid fa-user"></i> ${req.session.user.name}</a>
                    <a href="/logout" class="text-xs text-red-400">Logout</a>
                ` : `
                    <a href="/login" class="px-4 py-2 rounded-xl accent-btn">Login</a>
                    <a href="/register" class="px-4 py-2 rounded-xl border border-amber-500/30 accent-text">Register</a>
                `}
            </div>
        </header>

        <!-- Hero -->
        <section class="max-w-6xl mx-auto px-4 py-12 text-center space-y-4">
            <h1 class="text-4xl md:text-6xl font-serif font-black tracking-tight">${s.siteTitle}</h1>
            <p class="text-zinc-400 max-w-xl mx-auto text-sm md:text-base">${s.metaDescription}</p>
        </section>

        <!-- Categories Section -->
        <section id="categories" class="max-w-6xl mx-auto px-4 py-6 w-full">
            <h2 class="text-xl font-bold mb-4 accent-text"><i class="fa-solid fa-layer-group"></i> Categories</h2>
            ${db.categories.length === 0 ? `<p class="text-xs text-zinc-500">No categories added yet.</p>` : `
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${db.categories.map(c => `
                        <div class="card-theme rounded-2xl p-3 flex items-center gap-3">
                            <img src="${c.coverPhoto || 'https://via.placeholder.com/100'}" class="w-12 h-12 rounded-xl object-cover">
                            <span class="font-semibold text-sm">${c.name}</span>
                        </div>
                    `).join('')}
                </div>
            `}
        </section>

        <!-- Product Grid -->
        <section id="products" class="max-w-6xl mx-auto px-4 py-8 w-full flex-1">
            <h2 class="text-xl font-bold mb-6 accent-text"><i class="fa-solid fa-boxes-stacked"></i> Products</h2>
            ${db.products.length === 0 ? `<div class="text-center py-12 text-zinc-500">No products available in the store. Add products from Admin Panel.</div>` : `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    ${db.products.map(p => `
                        <div class="card-theme rounded-3xl overflow-hidden flex flex-col justify-between hover:scale-[1.01] transition">
                            <div>
                                <img src="${p.imageUrl || 'https://via.placeholder.com/300'}" class="w-full h-56 object-cover">
                                <div class="p-5 space-y-2">
                                    <div class="text-amber-400 text-xs"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i> (5.0)</div>
                                    <h3 class="font-bold text-lg">${p.title}</h3>
                                    <p class="text-xs text-zinc-400 line-clamp-2">${p.description}</p>
                                </div>
                            </div>
                            <div class="p-5 pt-0 space-y-3">
                                <div class="text-2xl font-black accent-text">${s.currency} ${Number(p.price).toLocaleString()}</div>
                                <a href="https://wa.me/${s.whatsappNumber}?text=I%20want%20to%20order:%20${encodeURIComponent(p.title)}%20Price:%20${p.price}" target="_blank" class="accent-btn text-center py-3 rounded-2xl text-xs uppercase tracking-wider block">
                                    <i class="fa-brands fa-whatsapp text-sm"></i> Order via WhatsApp
                                </a>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </section>

        <!-- Complaint Box -->
        <section id="complaints" class="max-w-2xl mx-auto px-4 py-8 w-full">
            <div class="card-theme p-6 rounded-3xl space-y-4">
                <h3 class="font-bold text-lg accent-text"><i class="fa-solid fa-triangle-exclamation"></i> Customer Complaint / Feedback Box</h3>
                <form action="/complaint/submit" method="POST" class="space-y-3">
                    <input type="text" name="name" placeholder="Your Name" required class="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
                    <input type="text" name="phone" placeholder="WhatsApp / Phone Number" required class="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
                    <textarea name="message" placeholder="Type your complaint or issue here..." required class="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm h-24"></textarea>
                    <button type="submit" class="w-full accent-btn py-3 rounded-xl">Submit Complaint</button>
                </form>
            </div>
        </section>

        <!-- Floating WhatsApp Widget -->
        <a href="https://wa.me/${s.whatsappNumber}" target="_blank" class="fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center text-2xl shadow-2xl z-50 hover:scale-110 transition">
            <i class="fa-brands fa-whatsapp"></i>
        </a>

        <!-- Footer -->
        <footer class="card-theme mt-12 py-8 px-6 text-center text-xs space-y-3 text-zinc-400">
            <p>${s.address} | Phone: ${s.phoneNumber} | Email: ${s.businessEmail}</p>
            <div class="flex justify-center gap-4 text-base accent-text">
                <a href="${s.socialLinks.instagram}"><i class="fa-brands fa-instagram"></i></a>
                <a href="${s.socialLinks.facebook}"><i class="fa-brands fa-facebook"></i></a>
                <a href="${s.socialLinks.tiktok}"><i class="fa-brands fa-tiktok"></i></a>
                <a href="${s.socialLinks.telegram}"><i class="fa-brands fa-telegram"></i></a>
            </div>
            <p>© 2026 ${s.siteTitle}. All Rights Reserved.</p>
        </footer>
    </body>
    </html>
    `);
});

// Submit Complaint Route
app.post('/complaint/submit', (req, res) => {
    const { name, phone, message } = req.body;
    db.complaints.push({
        id: "comp_" + Date.now(),
        name,
        phone,
        message,
        date: new Date().toLocaleString()
    });
    saveData(db);
    res.send("<script>alert('Complaint submitted successfully!'); window.location='/';</script>");
});

// ================= AUTH SYSTEM ================= //

app.get('/login', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Login | ANZEXA</title><script src="https://cdn.tailwindcss.com"></script></head>
    <body class="bg-zinc-950 text-white flex items-center justify-center min-h-screen p-4">
        <form action="/login" method="POST" class="bg-zinc-900 border border-amber-500/30 p-8 rounded-3xl max-w-sm w-full space-y-4">
            <h2 class="text-2xl font-bold text-amber-400 text-center">Account Login</h2>
            <div>
                <label class="text-xs text-zinc-400">Email Address</label>
                <input type="email" name="email" required class="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm mt-1 focus:outline-none focus:border-amber-400">
            </div>
            <div>
                <label class="text-xs text-zinc-400">Password</label>
                <input type="password" name="password" required class="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm mt-1 focus:outline-none focus:border-amber-400">
            </div>
            <button type="submit" class="w-full bg-amber-400 text-black font-bold p-3 rounded-xl hover:bg-amber-300">Login</button>
            <div class="flex justify-between text-xs text-zinc-400 pt-2">
                <a href="/register" class="hover:underline">Create Account</a>
                <a href="/register-reseller" class="hover:underline text-amber-400">Join as Reseller</a>
            </div>
        </form>
    </body>
    </html>
    `);
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.send("<script>alert('Invalid Email or Password'); window.location='/login';</script>");
    }
    if (user.role === 'Reseller' && user.status !== 'Approved') {
        return res.send("<script>alert('Your Reseller account is pending Super-Admin Approval.'); window.location='/login';</script>");
    }
    req.session.user = user;
    if (user.role === 'Super Admin') return res.redirect('/admin');
    return res.redirect('/');
});

app.get('/register', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Register | ANZEXA</title><script src="https://cdn.tailwindcss.com"></script></head>
    <body class="bg-zinc-950 text-white flex items-center justify-center min-h-screen p-4">
        <form action="/register" method="POST" class="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-sm w-full space-y-4">
            <h2 class="text-2xl font-bold text-amber-400 text-center">Create Customer Account</h2>
            <input type="text" name="name" placeholder="Full Name" required class="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
            <input type="email" name="email" placeholder="Email Address" required class="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
            <input type="text" name="phone" placeholder="Phone Number" required class="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
            <input type="password" name="password" placeholder="Password" required class="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
            <button type="submit" class="w-full bg-amber-400 text-black font-bold p-3 rounded-xl">Register Account</button>
            <p class="text-xs text-center text-zinc-500"><a href="/login" class="underline">Already have an account? Login</a></p>
        </form>
    </body>
    </html>
    `);
});

app.post('/register', (req, res) => {
    const { name, email, phone, password } = req.body;
    db.users.push({
        id: "usr_" + Date.now(),
        name,
        email,
        phone,
        password,
        role: "Customer",
        status: "Approved",
        idCardNumber: "N/A"
    });
    saveData(db);
    res.send("<script>alert('Account created successfully! Please login.'); window.location='/login';</script>");
});

app.get('/register-reseller', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Reseller Registration | ANZEXA</title><script src="https://cdn.tailwindcss.com"></script></head>
    <body class="bg-zinc-950 text-white flex items-center justify-center min-h-screen p-4">
        <form action="/register-reseller" method="POST" class="bg-zinc-900 border border-amber-500/30 p-8 rounded-3xl max-w-md w-full space-y-4">
            <h2 class="text-2xl font-bold text-amber-400 text-center">Join as Official Reseller</h2>
            <input type="text" name="name" placeholder="Full Name" required class="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
            <input type="email" name="email" placeholder="Email Address" required class="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
            <input type="text" name="phone" placeholder="WhatsApp / Mobile Number" required class="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
            <input type="text" name="idCardNumber" placeholder="CNIC / National ID Card Number" required class="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
            <input type="password" name="password" placeholder="Account Password" required class="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
            <button type="submit" class="w-full bg-amber-400 text-black font-bold p-3 rounded-xl">Submit Reseller Application</button>
        </form>
    </body>
    </html>
    `);
});

app.post('/register-reseller', (req, res) => {
    const { name, email, phone, idCardNumber, password } = req.body;
    db.users.push({
        id: "usr_" + Date.now(),
        name,
        email,
        phone,
        idCardNumber,
        password,
        role: "Reseller",
        status: "Pending"
    });
    saveData(db);
    res.send("<script>alert('Reseller Application submitted! Pending Super-Admin Approval.'); window.location='/login';</script>");
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
        <title>Super Admin Full Control Hub</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-zinc-950 text-white min-h-screen flex">
        <!-- Sidebar -->
        <aside class="w-64 bg-zinc-900 border-r border-amber-500/20 p-6 space-y-6 hidden md:block">
            <h1 class="text-xl font-black text-amber-400 tracking-wider">ANZEXA ADMIN</h1>
            <nav class="space-y-2 text-sm">
                <a href="#stats" class="block p-3 rounded-xl bg-amber-400/10 text-amber-400 font-bold"><i class="fa-solid fa-chart-pie mr-2"></i> Dashboard Stats</a>
                <a href="#resellers" class="block p-3 rounded-xl hover:bg-zinc-800"><i class="fa-solid fa-id-card mr-2"></i> Resellers (${resellers.length})</a>
                <a href="#categories" class="block p-3 rounded-xl hover:bg-zinc-800"><i class="fa-solid fa-layer-group mr-2"></i> Categories (${db.categories.length})</a>
                <a href="#products" class="block p-3 rounded-xl hover:bg-zinc-800"><i class="fa-solid fa-boxes-stacked mr-2"></i> Products (${db.products.length})</a>
                <a href="#vouchers" class="block p-3 rounded-xl hover:bg-zinc-800"><i class="fa-solid fa-ticket mr-2"></i> Vouchers (${db.vouchers.length})</a>
                <a href="#complaints" class="block p-3 rounded-xl hover:bg-zinc-800"><i class="fa-solid fa-comments mr-2"></i> Complaints (${db.complaints.length})</a>
                <a href="/" target="_blank" class="block p-3 rounded-xl hover:bg-zinc-800 text-emerald-400"><i class="fa-solid fa-globe mr-2"></i> View Live Store</a>
            </nav>
        </aside>

        <main class="flex-1 p-8 space-y-8 overflow-y-auto">
            <!-- Stats -->
            <section id="stats" class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                    <span class="text-xs text-zinc-400">Total Users</span>
                    <h3 class="text-2xl font-bold text-amber-400">${db.users.length}</h3>
                </div>
                <div class="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                    <span class="text-xs text-zinc-400">Total Products</span>
                    <h3 class="text-2xl font-bold text-amber-400">${db.products.length}</h3>
                </div>
                <div class="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                    <span class="text-xs text-zinc-400">Reseller Requests</span>
                    <h3 class="text-2xl font-bold text-amber-400">${db.users.filter(u => u.status === 'Pending').length}</h3>
                </div>
                <div class="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                    <span class="text-xs text-zinc-400">Complaints</span>
                    <h3 class="text-2xl font-bold text-amber-400">${db.complaints.length}</h3>
                </div>
            </section>

            <!-- Reseller Approvals -->
            <section id="resellers" class="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4">
                <h2 class="text-xl font-bold text-amber-400"><i class="fa-solid fa-id-card"></i> Reseller Approvals & Details</h2>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead class="bg-zinc-950 text-amber-400">
                            <tr>
                                <th class="p-3">Name</th>
                                <th class="p-3">Email / Phone</th>
                                <th class="p-3">CNIC / ID Card</th>
                                <th class="p-3">Status</th>
                                <th class="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${resellers.map(r => `
                                <tr class="border-b border-zinc-800">
                                    <td class="p-3 font-bold">${r.name}</td>
                                    <td class="p-3">${r.email}<br>${r.phone}</td>
                                    <td class="p-3 font-mono text-amber-300">${r.idCardNumber}</td>
                                    <td class="p-3"><span class="px-2 py-1 rounded text-[10px] ${r.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}">${r.status}</span></td>
                                    <td class="p-3 flex gap-2">
                                        <a href="/admin/reseller/approve/${r.id}" class="bg-emerald-500 text-black px-3 py-1 rounded font-bold">Approve</a>
                                        <a href="/admin/reseller/reject/${r.id}" class="bg-red-500 text-white px-3 py-1 rounded font-bold">Reject</a>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Category Control -->
            <section id="categories" class="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4">
                <h2 class="text-xl font-bold text-amber-400"><i class="fa-solid fa-layer-group"></i> Create Category with Photo</h2>
                <form action="/admin/categories/add" method="POST" class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" name="name" placeholder="Category Name" required class="bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
                    <input type="text" name="coverPhoto" placeholder="Category Image URL" required class="bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
                    <button type="submit" class="bg-amber-400 text-black font-bold p-3 rounded-xl">Add Category</button>
                </form>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                    ${db.categories.map(c => `
                        <div class="bg-zinc-950 border border-zinc-800 p-3 rounded-2xl flex justify-between items-center">
                            <span class="text-xs font-bold">${c.name}</span>
                            <a href="/admin/categories/delete/${c.id}" class="text-red-400 text-xs"><i class="fa-solid fa-trash"></i></a>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Product Control -->
            <section id="products" class="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4">
                <h2 class="text-xl font-bold text-amber-400"><i class="fa-solid fa-plus"></i> Add Product</h2>
                <form action="/admin/products/add" method="POST" class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" name="title" placeholder="Product Title" required class="bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
                    <input type="text" name="price" placeholder="Price in PKR" required class="bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
                    <input type="text" name="imageUrl" placeholder="Image URL" class="bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
                    <textarea name="description" placeholder="Description" class="md:col-span-3 bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm h-20"></textarea>
                    <button type="submit" class="md:col-span-3 bg-amber-400 text-black font-bold p-3 rounded-xl">Publish Product</button>
                </form>
                
                <h3 class="font-bold text-sm pt-4">Existing Products (${db.products.length})</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    ${db.products.map(p => `
                        <div class="bg-zinc-950 border border-zinc-800 p-3 rounded-2xl space-y-2">
                            <img src="${p.imageUrl}" class="h-24 w-full object-cover rounded-xl">
                            <h4 class="font-bold text-sm">${p.title}</h4>
                            <p class="text-xs text-amber-400">PKR ${p.price}</p>
                            <a href="/admin/products/delete/${p.id}" class="block text-center bg-red-500/20 text-red-400 py-1 rounded text-xs">Delete Product</a>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Complaints View -->
            <section id="complaints" class="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4">
                <h2 class="text-xl font-bold text-amber-400"><i class="fa-solid fa-comments"></i> Complaints Box Messages</h2>
                <div class="space-y-2">
                    ${db.complaints.map(c => `
                        <div class="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-1">
                            <div class="flex justify-between text-xs text-amber-400">
                                <span>${c.name} (${c.phone})</span>
                                <span>${c.date}</span>
                            </div>
                            <p class="text-xs text-zinc-300">${c.message}</p>
                        </div>
                    `).join('')}
                </div>
            </section>
        </main>
    </body>
    </html>
    `);
});

// Admin Actions
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

app.post('/admin/categories/add', requireAdmin, (req, res) => {
    const { name, coverPhoto } = req.body;
    db.categories.push({ id: "cat_" + Date.now(), name, coverPhoto });
    saveData(db);
    res.redirect('/admin');
});

app.get('/admin/categories/delete/:id', requireAdmin, (req, res) => {
    db.categories = db.categories.filter(x => x.id !== req.params.id);
    saveData(db);
    res.redirect('/admin');
});

app.post('/admin/products/add', requireAdmin, (req, res) => {
    const { title, price, imageUrl, description } = req.body;
    db.products.push({ id: "prod_" + Date.now(), title, price, imageUrl, description });
    saveData(db);
    res.redirect('/admin');
});

app.get('/admin/products/delete/:id', requireAdmin, (req, res) => {
    db.products = db.products.filter(x => x.id !== req.params.id);
    saveData(db);
    res.redirect('/admin');
});

app.listen(PORT, () => console.log('ANZEXA Full System running on port ' + PORT));
