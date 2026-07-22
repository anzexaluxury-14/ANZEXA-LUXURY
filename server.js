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
        siteTitle: "ANZEXA | Boutique & Store",
        metaDescription: "Exclusive Collection & Premium Products",
        logoUrl: "",
        currency: "PKR Rs.",
        whatsappNumber: "923000000000",
        phoneNumber: "+92 300 0000000",
        businessEmail: "info@anzexa.com",
        address: "Pakistan",
        socialLinks: { instagram: "#", facebook: "#", tiktok: "#", telegram: "#" },
        currentTheme: {
            bg: "#FFFFFF",
            cardBg: "#FDFBF7",
            accent: "#D4B996",
            text: "#111111",
            border: "#E8E2D5"
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(uploadDir));
app.use(session({
    secret: 'anzexa_luxury_engine_secret_2026',
    resave: false,
    saveUninitialized: true
}));

function requireAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'Super Admin') return next();
    return res.redirect('/login');
}

// ================= FRONTEND ================= //

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
            body { background-color: ${theme.bg}; color: ${theme.text}; font-family: sans-serif; }
            .card-theme { background-color: ${theme.cardBg}; border: 1px solid ${theme.border}; }
            .accent-btn { background-color: ${theme.accent}; color: #111; font-weight: bold; }
            .accent-text { color: #8C6D46; }
        </style>
    </head>
    <body class="min-h-screen flex flex-col">
        <!-- Header -->
        <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200 px-6 py-4 flex justify-between items-center shadow-sm">
            <a href="/" class="flex items-center gap-3">
                ${s.logoUrl ? `<img src="${s.logoUrl}" class="h-12 object-contain">` : `<span class="text-2xl font-serif font-black tracking-widest text-stone-900">${s.siteTitle.split('|')[0]}</span>`}
            </a>
            <div class="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider">
                <a href="#categories" class="hidden md:inline hover:text-stone-600">Categories</a>
                <a href="#products" class="hidden md:inline hover:text-stone-600">Products</a>
                <a href="#complaints" class="hidden md:inline hover:text-stone-600">Complaints</a>
                ${req.session.user ? `
                    <a href="${req.session.user.role === 'Super Admin' ? '/admin' : '/dashboard'}" class="accent-text font-bold"><i class="fa-solid fa-user"></i> ${req.session.user.name}</a>
                    <a href="/logout" class="text-red-500 hover:underline">Logout</a>
                ` : `
                    <a href="/login" class="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-100">Login</a>
                    <a href="/register" class="px-4 py-2 rounded-xl accent-btn">Register</a>
                `}
            </div>
        </header>

        <!-- Hero Section -->
        <section class="max-w-6xl mx-auto px-4 py-12 text-center space-y-3">
            <h1 class="text-4xl md:text-6xl font-serif font-bold text-stone-900 tracking-tight">${s.siteTitle}</h1>
            <p class="text-stone-500 max-w-xl mx-auto text-sm md:text-base">${s.metaDescription}</p>
        </section>

        <!-- Categories Section -->
        <section id="categories" class="max-w-6xl mx-auto px-4 py-6 w-full">
            <h2 class="text-lg font-bold mb-4 uppercase tracking-wider text-stone-800"><i class="fa-solid fa-layer-group accent-text"></i> Categories</h2>
            ${db.categories.length === 0 ? `<p class="text-xs text-stone-400">No categories added yet.</p>` : `
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${db.categories.map(c => `
                        <div class="card-theme rounded-2xl p-3 flex items-center gap-3 shadow-sm hover:shadow transition">
                            <img src="${c.coverPhoto || '/uploads/placeholder.jpg'}" class="w-12 h-12 rounded-xl object-cover bg-stone-200">
                            <span class="font-bold text-sm text-stone-800">${c.name}</span>
                        </div>
                    `).join('')}
                </div>
            `}
        </section>

        <!-- Products Section -->
        <section id="products" class="max-w-6xl mx-auto px-4 py-8 w-full flex-1">
            <h2 class="text-lg font-bold mb-6 uppercase tracking-wider text-stone-800"><i class="fa-solid fa-boxes-stacked accent-text"></i> Store Products</h2>
            ${db.products.length === 0 ? `<div class="text-center py-16 text-stone-400 border-2 border-dashed border-stone-200 rounded-3xl">No products available in store. Add products from Super Admin Panel.</div>` : `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    ${db.products.map(p => `
                        <div class="card-theme rounded-3xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition">
                            <div>
                                <div class="flex overflow-x-auto snap-x snap-mandatory h-64 bg-stone-100">
                                    ${(p.images && p.images.length > 0 ? p.images : ['/uploads/placeholder.jpg']).map(img => `
                                        <img src="${img}" class="w-full h-full object-cover flex-shrink-0 snap-center">
                                    `).join('')}
                                </div>
                                <div class="p-5 space-y-2">
                                    <div class="text-amber-600 text-xs"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i> (5.0)</div>
                                    <h3 class="font-bold text-base text-stone-900">${p.title}</h3>
                                    <p class="text-xs text-stone-500 line-clamp-2">${p.description}</p>
                                </div>
                            </div>
                            <div class="p-5 pt-0 space-y-3">
                                <div class="text-2xl font-black text-stone-900">${s.currency} ${Number(p.price).toLocaleString()}</div>
                                <a href="https://wa.me/${s.whatsappNumber}?text=I%20want%20to%20order:%20${encodeURIComponent(p.title)}" target="_blank" class="accent-btn text-center py-3 rounded-2xl text-xs uppercase tracking-wider block hover:opacity-90">
                                    <i class="fa-brands fa-whatsapp text-sm"></i> Order via WhatsApp
                                </a>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </section>

        <!-- Complaints Box -->
        <section id="complaints" class="max-w-2xl mx-auto px-4 py-8 w-full">
            <div class="card-theme p-6 rounded-3xl space-y-4 shadow-sm">
                <h3 class="font-bold text-base text-stone-800 uppercase tracking-wider"><i class="fa-solid fa-comment-dots accent-text"></i> Customer Complaint / Feedback Box</h3>
                <form action="/complaint/submit" method="POST" class="space-y-3">
                    <input type="text" name="name" placeholder="Your Full Name" required class="w-full bg-white border border-stone-300 p-3 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-500">
                    <input type="text" name="phone" placeholder="WhatsApp / Phone Number" required class="w-full bg-white border border-stone-300 p-3 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-500">
                    <textarea name="message" placeholder="Type your complaint or suggestion..." required class="w-full bg-white border border-stone-300 p-3 rounded-xl text-sm text-stone-800 h-24 focus:outline-none focus:border-stone-500"></textarea>
                    <button type="submit" class="w-full accent-btn py-3 rounded-xl text-sm uppercase">Submit Message</button>
                </form>
            </div>
        </section>

        <!-- Floating WhatsApp -->
        <a href="https://wa.me/${s.whatsappNumber}" target="_blank" class="fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center text-2xl shadow-xl z-50 hover:scale-105 transition">
            <i class="fa-brands fa-whatsapp"></i>
        </a>

        <!-- Footer -->
        <footer class="border-t border-stone-200 mt-12 py-8 px-6 text-center text-xs text-stone-500 space-y-2">
            <p>${s.address} | Phone: ${s.phoneNumber} | Email: ${s.businessEmail}</p>
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
    res.send("<script>alert('Complaint submitted successfully!'); window.location='/';</script>");
});

// ================= AUTH SYSTEM ================= //

app.get('/login', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Login | ANZEXA</title><script src="https://cdn.tailwindcss.com"></script></head>
    <body class="bg-stone-100 text-stone-900 flex items-center justify-center min-h-screen p-4">
        <form action="/login" method="POST" class="bg-white border border-stone-200 shadow-xl p-8 rounded-3xl max-w-sm w-full space-y-4">
            <h2 class="text-2xl font-serif font-bold text-center text-stone-800">Account Login</h2>
            <p class="text-xs text-center text-stone-500">Super Admin, Reseller or Customer Login</p>
            <div>
                <label class="text-xs text-stone-600 font-bold">Email Address</label>
                <input type="email" name="email" required class="w-full bg-stone-50 border border-stone-300 p-3 rounded-xl text-sm mt-1 focus:outline-none">
            </div>
            <div>
                <label class="text-xs text-stone-600 font-bold">Password</label>
                <input type="password" name="password" required class="w-full bg-stone-50 border border-stone-300 p-3 rounded-xl text-sm mt-1 focus:outline-none">
            </div>
            <button type="submit" class="w-full bg-stone-900 text-white font-bold p-3 rounded-xl hover:bg-stone-800">Sign In</button>
            <div class="flex justify-between text-xs text-stone-600 pt-2 border-t border-stone-100">
                <a href="/register" class="hover:underline">Create Customer Account</a>
                <a href="/register-reseller" class="hover:underline font-bold text-stone-800">Join as Reseller</a>
            </div>
        </form>
    </body>
    </html>
    `);
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) return res.send("<script>alert('Invalid Email or Password'); window.location='/login';</script>");
    if (user.role === 'Reseller' && user.status !== 'Approved') return res.send("<script>alert('Your Reseller account is pending Super Admin Approval.'); window.location='/login';</script>");
    req.session.user = user;
    if (user.role === 'Super Admin') return res.redirect('/admin');
    return res.redirect('/');
});

app.get('/register', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Register Customer | ANZEXA</title><script src="https://cdn.tailwindcss.com"></script></head>
    <body class="bg-stone-100 text-stone-900 flex items-center justify-center min-h-screen p-4">
        <form action="/register" method="POST" class="bg-white border border-stone-200 shadow-xl p-8 rounded-3xl max-w-sm w-full space-y-4">
            <h2 class="text-2xl font-serif font-bold text-center text-stone-800">Customer Registration</h2>
            <input type="text" name="name" placeholder="Full Name" required class="w-full bg-stone-50 border border-stone-300 p-3 rounded-xl text-sm">
            <input type="email" name="email" placeholder="Email Address" required class="w-full bg-stone-50 border border-stone-300 p-3 rounded-xl text-sm">
            <input type="text" name="phone" placeholder="Phone Number" required class="w-full bg-stone-50 border border-stone-300 p-3 rounded-xl text-sm">
            <input type="password" name="password" placeholder="Password" required class="w-full bg-stone-50 border border-stone-300 p-3 rounded-xl text-sm">
            <button type="submit" class="w-full bg-stone-900 text-white font-bold p-3 rounded-xl">Create Account</button>
            <p class="text-xs text-center text-stone-500 pt-2"><a href="/login" class="underline">Already have an account? Login</a></p>
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
    <head><title>Reseller Application | ANZEXA</title><script src="https://cdn.tailwindcss.com"></script></head>
    <body class="bg-stone-100 text-stone-900 flex items-center justify-center min-h-screen p-4">
        <form action="/register-reseller" method="POST" class="bg-white border border-stone-200 shadow-xl p-8 rounded-3xl max-w-md w-full space-y-4">
            <h2 class="text-2xl font-serif font-bold text-center text-stone-800">Apply as Official Reseller</h2>
            <input type="text" name="name" placeholder="Full Name" required class="w-full bg-stone-50 border border-stone-300 p-3 rounded-xl text-sm">
            <input type="email" name="email" placeholder="Email Address" required class="w-full bg-stone-50 border border-stone-300 p-3 rounded-xl text-sm">
            <input type="text" name="phone" placeholder="WhatsApp / Mobile Number" required class="w-full bg-stone-50 border border-stone-300 p-3 rounded-xl text-sm">
            <input type="text" name="idCardNumber" placeholder="CNIC / National ID Card Number" required class="w-full bg-stone-50 border border-stone-300 p-3 rounded-xl text-sm">
            <input type="password" name="password" placeholder="Account Password" required class="w-full bg-stone-50 border border-stone-300 p-3 rounded-xl text-sm">
            <button type="submit" class="w-full bg-stone-900 text-white font-bold p-3 rounded-xl">Submit Reseller Details</button>
            <p class="text-xs text-center text-stone-500 pt-2"><a href="/login" class="underline">Back to Login</a></p>
        </form>
    </body>
    </html>
    `);
});

app.post('/register-reseller', (req, res) => {
    const { name, email, phone, idCardNumber, password } = req.body;
    db.users.push({ id: "usr_" + Date.now(), name, email, phone, idCardNumber, password, role: "Reseller", status: "Pending" });
    saveData(db);
    res.send("<script>alert('Reseller Application submitted! Awaiting Super Admin approval.'); window.location='/login';</script>");
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
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-stone-100 text-stone-900 min-h-screen flex">
        <aside class="w-64 bg-white border-r border-stone-200 p-6 space-y-6 hidden md:block shadow-sm">
            <h1 class="text-xl font-serif font-black text-stone-900 tracking-wider">ANZEXA ADMIN</h1>
            <nav class="space-y-2 text-sm">
                <a href="#logo" class="block p-3 rounded-xl hover:bg-stone-100 font-semibold text-stone-700"><i class="fa-solid fa-image mr-2"></i> Custom Logo</a>
                <a href="#resellers" class="block p-3 rounded-xl hover:bg-stone-100 font-semibold text-stone-700"><i class="fa-solid fa-id-card mr-2"></i> Resellers (${resellers.length})</a>
                <a href="#categories" class="block p-3 rounded-xl hover:bg-stone-100 font-semibold text-stone-700"><i class="fa-solid fa-layer-group mr-2"></i> Categories (${db.categories.length})</a>
                <a href="#products" class="block p-3 rounded-xl hover:bg-stone-100 font-semibold text-stone-700"><i class="fa-solid fa-boxes-stacked mr-2"></i> Products (${db.products.length})</a>
                <a href="#complaints" class="block p-3 rounded-xl hover:bg-stone-100 font-semibold text-stone-700"><i class="fa-solid fa-comments mr-2"></i> Complaints (${db.complaints.length})</a>
                <a href="/" target="_blank" class="block p-3 rounded-xl bg-stone-900 text-white font-bold mt-4 text-center"><i class="fa-solid fa-globe mr-2"></i> View Live Store</a>
            </nav>
        </aside>

        <main class="flex-1 p-8 space-y-8 overflow-y-auto">
            <!-- Logo Upload -->
            <section id="logo" class="bg-white border border-stone-200 p-6 rounded-3xl space-y-4 shadow-sm">
                <h2 class="text-lg font-bold text-stone-800"><i class="fa-solid fa-upload text-stone-500"></i> Direct Logo Upload</h2>
                <form action="/admin/logo/upload" method="POST" enctype="multipart/form-data" class="flex items-center gap-4">
                    <input type="file" name="logo" accept="image/*" required class="bg-stone-50 border border-stone-300 p-2 rounded-xl text-xs text-stone-600">
                    <button type="submit" class="bg-stone-900 text-white font-bold px-5 py-2 rounded-xl text-sm">Upload Logo</button>
                </form>
            </section>

            <!-- Category Direct Upload -->
            <section id="categories" class="bg-white border border-stone-200 p-6 rounded-3xl space-y-4 shadow-sm">
                <h2 class="text-lg font-bold text-stone-800"><i class="fa-solid fa-layer-group text-stone-500"></i> Add Category (Direct Photo Upload)</h2>
                <form action="/admin/categories/add" method="POST" enctype="multipart/form-data" class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" name="name" placeholder="Category Name" required class="bg-stone-50 border border-stone-300 p-3 rounded-xl text-sm">
                    <input type="file" name="coverPhoto" accept="image/*" required class="bg-stone-50 border border-stone-300 p-2 rounded-xl text-xs text-stone-600">
                    <button type="submit" class="bg-stone-900 text-white font-bold p-3 rounded-xl text-sm">Add Category</button>
                </form>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
                    ${db.categories.map(c => `
                        <div class="bg-stone-50 border border-stone-200 p-3 rounded-2xl flex justify-between items-center">
                            <div class="flex items-center gap-2">
                                <img src="${c.coverPhoto}" class="w-8 h-8 rounded-lg object-cover">
                                <span class="text-xs font-bold text-stone-800">${c.name}</span>
                            </div>
                            <a href="/admin/categories/delete/${c.id}" class="text-red-500 text-xs hover:underline"><i class="fa-solid fa-trash"></i></a>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Product Upload with Multi-Photos -->
            <section id="products" class="bg-white border border-stone-200 p-6 rounded-3xl space-y-4 shadow-sm">
                <h2 class="text-lg font-bold text-stone-800"><i class="fa-solid fa-plus text-stone-500"></i> Upload Product (Direct Multi-Photos Upload)</h2>
                <form action="/admin/products/add" method="POST" enctype="multipart/form-data" class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" name="title" placeholder="Product Title" required class="bg-stone-50 border border-stone-300 p-3 rounded-xl text-sm">
                    <input type="text" name="price" placeholder="Price in PKR" required class="bg-stone-50 border border-stone-300 p-3 rounded-xl text-sm">
                    <select name="categoryId" class="bg-stone-50 border border-stone-300 p-3 rounded-xl text-sm">
                        ${db.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                    <div class="md:col-span-3 bg-stone-50 border border-stone-300 p-4 rounded-xl space-y-2">
                        <label class="text-xs font-bold text-stone-700">Select Multiple Product Photos from Gallery:</label>
                        <input type="file" name="productImages" accept="image/*" multiple required class="w-full text-xs text-stone-600">
                    </div>
                    <textarea name="description" placeholder="Product Description" class="md:col-span-3 bg-stone-50 border border-stone-300 p-3 rounded-xl text-sm h-20"></textarea>
                    <button type="submit" class="md:col-span-3 bg-stone-900 text-white font-bold p-3 rounded-xl text-sm">Publish Product</button>
                </form>

                <h3 class="font-bold text-sm pt-4 text-stone-800">Existing Products (${db.products.length})</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    ${db.products.map(p => `
                        <div class="bg-stone-50 border border-stone-200 p-3 rounded-2xl space-y-2">
                            <div class="flex gap-1 overflow-x-auto h-24">
                                ${(p.images || []).map(img => `<img src="${img}" class="h-full w-20 object-cover rounded-lg">`).join('')}
                            </div>
                            <h4 class="font-bold text-sm text-stone-900">${p.title}</h4>
                            <p class="text-xs font-bold text-amber-800">PKR ${p.price}</p>
                            <a href="/admin/products/delete/${p.id}" class="block text-center bg-red-100 text-red-600 py-1 rounded text-xs font-semibold">Delete Product</a>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Resellers Control -->
            <section id="resellers" class="bg-white border border-stone-200 p-6 rounded-3xl space-y-4 shadow-sm">
                <h2 class="text-lg font-bold text-stone-800"><i class="fa-solid fa-id-card text-stone-500"></i> Reseller Approvals & Details</h2>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead class="bg-stone-100 text-stone-800 font-bold">
                            <tr>
                                <th class="p-3">Name</th>
                                <th class="p-3">Contact</th>
                                <th class="p-3">CNIC / ID Card</th>
                                <th class="p-3">Status</th>
                                <th class="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${resellers.map(r => `
                                <tr class="border-b border-stone-200">
                                    <td class="p-3 font-bold">${r.name}</td>
                                    <td class="p-3">${r.email}<br>${r.phone}</td>
                                    <td class="p-3 font-mono font-bold text-stone-700">${r.idCardNumber}</td>
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

            <!-- Complaints View -->
            <section id="complaints" class="bg-white border border-stone-200 p-6 rounded-3xl space-y-4 shadow-sm">
                <h2 class="text-lg font-bold text-stone-800"><i class="fa-solid fa-comments text-stone-500"></i> Customer Complaints Box</h2>
                <div class="space-y-2">
                    ${db.complaints.map(c => `
                        <div class="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-1">
                            <div class="flex justify-between text-xs font-bold text-stone-700">
                                <span>${c.name} (${c.phone})</span>
                                <span class="text-stone-400">${c.date}</span>
                            </div>
                            <p class="text-xs text-stone-600">${c.message}</p>
                        </div>
                    `).join('')}
                </div>
            </section>
        </main>
    </body>
    </html>
    `);
});

// Admin Route Processors
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

app.listen(PORT, () => console.log('ANZEXA White-Beige System running on port ' + PORT));
