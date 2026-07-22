const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Storage Folders Setup
const publicDir = path.join(__dirname, 'public');
const uploadDir = path.join(__dirname, 'public/uploads');
[publicDir, uploadDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Configure Multer for Direct File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'))
});
const upload = multer({ storage });

const dataFile = path.join(__dirname, 'data.json');

const defaultData = {
    settings: {
        siteTitle: "ANZEXA | Pure Luxury Store",
        metaDescription: "High-End Pure Gold & Luxury E-Commerce Engine",
        logoUrl: "",
        currency: "PKR Rs.",
        whatsappNumber: "923000000000",
        phoneNumber: "+92 300 0000000",
        businessEmail: "info@anzexa.com",
        address: "Pakistan",
        socialLinks: { instagram: "#", facebook: "#", tiktok: "#", telegram: "#" },
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
            body { background-color: ${theme.bg}; color: ${theme.text}; }
            .card-theme { background-color: ${theme.cardBg}; border: 1px solid ${theme.border}; }
            .accent-btn { background-color: ${theme.accent}; color: #000; font-weight: bold; }
            .accent-text { color: ${theme.accent}; }
            ${s.customCSS}
        </style>
    </head>
    <body class="min-h-screen flex flex-col">
        <header class="sticky top-0 z-50 card-theme backdrop-blur-md px-6 py-4 flex justify-between items-center">
            <a href="/" class="flex items-center gap-3">
                ${s.logoUrl ? `<img src="${s.logoUrl}" class="h-10 object-contain">` : `<span class="text-2xl font-black accent-text uppercase tracking-widest">${s.siteTitle.split('|')[0]}</span>`}
            </a>
            <div class="flex items-center gap-4 text-sm">
                <a href="#categories" class="hidden md:inline hover:opacity-80">Categories</a>
                <a href="#products" class="hidden md:inline hover:opacity-80">Products</a>
                <a href="#complaints" class="hidden md:inline hover:opacity-80">Complaints</a>
                ${req.session.user ? `
                    <a href="${req.session.user.role === 'Super Admin' ? '/admin' : '/dashboard'}" class="accent-text font-bold"><i class="fa-solid fa-user"></i> ${req.session.user.name}</a>
                    <a href="/logout" class="text-xs text-red-400">Logout</a>
                ` : `
                    <a href="/login" class="px-4 py-2 rounded-xl accent-btn">Login</a>
                `}
            </div>
        </header>

        <section class="max-w-6xl mx-auto px-4 py-12 text-center space-y-4">
            <h1 class="text-4xl md:text-6xl font-serif font-black tracking-tight">${s.siteTitle}</h1>
            <p class="text-zinc-400 max-w-xl mx-auto text-sm md:text-base">${s.metaDescription}</p>
        </section>

        <!-- Categories Section -->
        <section id="categories" class="max-w-6xl mx-auto px-4 py-6 w-full">
            <h2 class="text-xl font-bold mb-4 accent-text"><i class="fa-solid fa-layer-group"></i> Categories</h2>
            ${db.categories.length === 0 ? `<p class="text-xs text-zinc-500">No categories created yet.</p>` : `
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${db.categories.map(c => `
                        <div class="card-theme rounded-2xl p-3 flex items-center gap-3">
                            <img src="${c.coverPhoto || '/uploads/placeholder.jpg'}" class="w-12 h-12 rounded-xl object-cover">
                            <span class="font-semibold text-sm">${c.name}</span>
                        </div>
                    `).join('')}
                </div>
            `}
        </section>

        <!-- Product Grid -->
        <section id="products" class="max-w-6xl mx-auto px-4 py-8 w-full flex-1">
            <h2 class="text-xl font-bold mb-6 accent-text"><i class="fa-solid fa-boxes-stacked"></i> Products</h2>
            ${db.products.length === 0 ? `<div class="text-center py-12 text-zinc-500">No products uploaded yet. Please add products from Admin Panel.</div>` : `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    ${db.products.map(p => `
                        <div class="card-theme rounded-3xl overflow-hidden flex flex-col justify-between hover:scale-[1.01] transition">
                            <div>
                                <!-- Multi-Image Carousel / Preview -->
                                <div class="flex overflow-x-auto snap-x snap-mandatory h-60 bg-black/50">
                                    ${(p.images && p.images.length > 0 ? p.images : ['/uploads/placeholder.jpg']).map(img => `
                                        <img src="${img}" class="w-full h-full object-cover flex-shrink-0 snap-center">
                                    `).join('')}
                                </div>
                                <div class="p-5 space-y-2">
                                    <div class="text-amber-400 text-xs"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i> (5.0)</div>
                                    <h3 class="font-bold text-lg">${p.title}</h3>
                                    <p class="text-xs text-zinc-400 line-clamp-2">${p.description}</p>
                                </div>
                            </div>
                            <div class="p-5 pt-0 space-y-3">
                                <div class="text-2xl font-black accent-text">${s.currency} ${Number(p.price).toLocaleString()}</div>
                                <a href="https://wa.me/${s.whatsappNumber}?text=I%20want%20to%20order:%20${encodeURIComponent(p.title)}" target="_blank" class="accent-btn text-center py-3 rounded-2xl text-xs uppercase tracking-wider block">
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

        <a href="https://wa.me/${s.whatsappNumber}" target="_blank" class="fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center text-2xl shadow-2xl z-50">
            <i class="fa-brands fa-whatsapp"></i>
        </a>
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

// ================= AUTH ================= //

app.get('/login', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Login | ANZEXA</title><script src="https://cdn.tailwindcss.com"></script></head>
    <body class="bg-zinc-950 text-white flex items-center justify-center min-h-screen p-4">
        <form action="/login" method="POST" class="bg-zinc-900 border border-amber-500/30 p-8 rounded-3xl max-w-sm w-full space-y-4">
            <h2 class="text-2xl font-bold text-amber-400 text-center">Admin / Account Login</h2>
            <input type="email" name="email" placeholder="Email" required class="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
            <input type="password" name="password" placeholder="Password" required class="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
            <button type="submit" class="w-full bg-amber-400 text-black font-bold p-3 rounded-xl">Login</button>
            <div class="flex justify-between text-xs text-zinc-400 pt-2">
                <a href="/register" class="hover:underline">Register Customer</a>
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
    <head><title>Register | ANZEXA</title><script src="https://cdn.tailwindcss.com"></script></head>
    <body class="bg-zinc-950 text-white flex items-center justify-center min-h-screen p-4">
        <form action="/register" method="POST" class="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-sm w-full space-y-4">
            <h2 class="text-2xl font-bold text-amber-400 text-center">Customer Register</h2>
            <input type="text" name="name" placeholder="Full Name" required class="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
            <input type="email" name="email" placeholder="Email Address" required class="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
            <input type="text" name="phone" placeholder="Phone Number" required class="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
            <input type="password" name="password" placeholder="Password" required class="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
            <button type="submit" class="w-full bg-amber-400 text-black font-bold p-3 rounded-xl">Register</button>
        </form>
    </body>
    </html>
    `);
});

app.post('/register', (req, res) => {
    const { name, email, phone, password } = req.body;
    db.users.push({ id: "usr_" + Date.now(), name, email, phone, password, role: "Customer", status: "Approved", idCardNumber: "N/A" });
    saveData(db);
    res.send("<script>alert('Account created! Login now.'); window.location='/login';</script>");
});

app.get('/register-reseller', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Reseller Registration | ANZEXA</title><script src="https://cdn.tailwindcss.com"></script></head>
    <body class="bg-zinc-950 text-white flex items-center justify-center min-h-screen p-4">
        <form action="/register-reseller" method="POST" class="bg-zinc-900 border border-amber-500/30 p-8 rounded-3xl max-w-md w-full space-y-4">
            <h2 class="text-2xl font-bold text-amber-400 text-center">Reseller Application</h2>
            <input type="text" name="name" placeholder="Full Name" required class="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
            <input type="email" name="email" placeholder="Email" required class="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
            <input type="text" name="phone" placeholder="WhatsApp Number" required class="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
            <input type="text" name="idCardNumber" placeholder="CNIC / ID Card Number" required class="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
            <input type="password" name="password" placeholder="Password" required class="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
            <button type="submit" class="w-full bg-amber-400 text-black font-bold p-3 rounded-xl">Submit Application</button>
        </form>
    </body>
    </html>
    `);
});

app.post('/register-reseller', (req, res) => {
    const { name, email, phone, idCardNumber, password } = req.body;
    db.users.push({ id: "usr_" + Date.now(), name, email, phone, idCardNumber, password, role: "Reseller", status: "Pending" });
    saveData(db);
    res.send("<script>alert('Reseller request submitted!'); window.location='/login';</script>");
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
        <title>Super Admin Control Hub</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-zinc-950 text-white min-h-screen flex">
        <aside class="w-64 bg-zinc-900 border-r border-amber-500/20 p-6 space-y-6 hidden md:block">
            <h1 class="text-xl font-black text-amber-400 tracking-wider">ANZEXA ADMIN</h1>
            <nav class="space-y-2 text-sm">
                <a href="#logo" class="block p-3 rounded-xl hover:bg-zinc-800"><i class="fa-solid fa-image mr-2"></i> Custom Logo</a>
                <a href="#resellers" class="block p-3 rounded-xl hover:bg-zinc-800"><i class="fa-solid fa-id-card mr-2"></i> Resellers (${resellers.length})</a>
                <a href="#categories" class="block p-3 rounded-xl hover:bg-zinc-800"><i class="fa-solid fa-layer-group mr-2"></i> Categories (${db.categories.length})</a>
                <a href="#products" class="block p-3 rounded-xl hover:bg-zinc-800"><i class="fa-solid fa-boxes-stacked mr-2"></i> Upload Products</a>
                <a href="#complaints" class="block p-3 rounded-xl hover:bg-zinc-800"><i class="fa-solid fa-comments mr-2"></i> Complaints (${db.complaints.length})</a>
                <a href="/" target="_blank" class="block p-3 rounded-xl text-emerald-400 hover:bg-zinc-800"><i class="fa-solid fa-globe mr-2"></i> Live Store View</a>
            </nav>
        </aside>

        <main class="flex-1 p-8 space-y-8 overflow-y-auto">
            <!-- Logo Upload -->
            <section id="logo" class="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4">
                <h2 class="text-xl font-bold text-amber-400"><i class="fa-solid fa-upload"></i> Upload Custom Store Logo</h2>
                <form action="/admin/logo/upload" method="POST" enctype="multipart/form-data" class="flex items-center gap-4">
                    <input type="file" name="logo" accept="image/*" required class="bg-zinc-950 border border-zinc-800 p-2 rounded-xl text-xs text-zinc-400">
                    <button type="submit" class="bg-amber-400 text-black font-bold px-5 py-2 rounded-xl text-sm">Upload Logo</button>
                </form>
            </section>

            <!-- Direct Photo Upload Category Section -->
            <section id="categories" class="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4">
                <h2 class="text-xl font-bold text-amber-400"><i class="fa-solid fa-layer-group"></i> Add Category (Direct Image Upload)</h2>
                <form action="/admin/categories/add" method="POST" enctype="multipart/form-data" class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" name="name" placeholder="Category Name" required class="bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
                    <input type="file" name="coverPhoto" accept="image/*" required class="bg-zinc-950 border border-zinc-800 p-2 rounded-xl text-xs text-zinc-400">
                    <button type="submit" class="bg-amber-400 text-black font-bold p-3 rounded-xl">Add Category</button>
                </form>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
                    ${db.categories.map(c => `
                        <div class="bg-zinc-950 border border-zinc-800 p-3 rounded-2xl flex justify-between items-center">
                            <div class="flex items-center gap-2">
                                <img src="${c.coverPhoto}" class="w-8 h-8 rounded-lg object-cover">
                                <span class="text-xs font-bold">${c.name}</span>
                            </div>
                            <a href="/admin/categories/delete/${c.id}" class="text-red-400 text-xs"><i class="fa-solid fa-trash"></i></a>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Direct Multi-Photo Upload Product Section -->
            <section id="products" class="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4">
                <h2 class="text-xl font-bold text-amber-400"><i class="fa-solid fa-plus"></i> Upload Product (Multiple Gallery Photos)</h2>
                <form action="/admin/products/add" method="POST" enctype="multipart/form-data" class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" name="title" placeholder="Product Title" required class="bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
                    <input type="text" name="price" placeholder="Price in PKR" required class="bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
                    <select name="categoryId" class="bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm">
                        ${db.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                    <div class="md:col-span-3 bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-2">
                        <label class="text-xs text-amber-400 font-bold block">Select Product Photos (Multiple Photos allowed):</label>
                        <input type="file" name="productImages" accept="image/*" multiple required class="w-full text-xs text-zinc-400">
                    </div>
                    <textarea name="description" placeholder="Product Description" class="md:col-span-3 bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm h-20"></textarea>
                    <button type="submit" class="md:col-span-3 bg-amber-400 text-black font-bold p-3 rounded-xl">Publish Product</button>
                </form>

                <h3 class="font-bold text-sm pt-4">Existing Products (${db.products.length})</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    ${db.products.map(p => `
                        <div class="bg-zinc-950 border border-zinc-800 p-3 rounded-2xl space-y-2">
                            <div class="flex gap-1 overflow-x-auto h-24">
                                ${(p.images || []).map(img => `<img src="${img}" class="h-full w-20 object-cover rounded-lg">`).join('')}
                            </div>
                            <h4 class="font-bold text-sm">${p.title}</h4>
                            <p class="text-xs text-amber-400">PKR ${p.price}</p>
                            <a href="/admin/products/delete/${p.id}" class="block text-center bg-red-500/20 text-red-400 py-1 rounded text-xs">Delete Product</a>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Reseller Approvals -->
            <section id="resellers" class="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4">
                <h2 class="text-xl font-bold text-amber-400"><i class="fa-solid fa-id-card"></i> Resellers (${resellers.length})</h2>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead class="bg-zinc-950 text-amber-400">
                            <tr>
                                <th class="p-3">Name</th>
                                <th class="p-3">Contact</th>
                                <th class="p-3">ID Card</th>
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
                                    <td class="p-3">${r.status}</td>
                                    <td class="p-3 flex gap-2">
                                        <a href="/admin/reseller/approve/${r.id}" class="bg-emerald-500 text-black px-2 py-1 rounded">Approve</a>
                                        <a href="/admin/reseller/reject/${r.id}" class="bg-red-500 text-white px-2 py-1 rounded">Reject</a>
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

// Admin Post Handlers with Direct File Upload
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

app.listen(PORT, () => console.log('ANZEXA Direct Upload Server running on port ' + PORT));
