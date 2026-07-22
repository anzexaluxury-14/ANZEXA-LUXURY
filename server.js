const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const dataFile = path.join(__dirname, 'data.json');

const defaultData = {
    settings: {
        siteTitle: "ANZEXA | Pure Gold Collection",
        phone1: "+92 300 0290111",
        phone2: "+971 56 439 0792",
        whatsapp: "923000290111",
        email: "anzexaluxury@gmail.com",
        bgColor: "#09090b",
        accentColor: "#D4AF37",
        navBg: "rgba(10, 10, 12, 0.92)",
        cardBg: "rgba(20, 20, 24, 0.95)"
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
            return JSON.parse(rawData);
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

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

app.use(session({
    secret: 'anzexa_super_secret_2026',
    resave: false,
    saveUninitialized: true
}));

const ADMIN_USER = "ANZEXA140786@";
const ADMIN_PASS = "ANZA1414786";

const adminAuth = (req, res, next) => {
    if (req.session && req.session.isAdmin) next();
    else res.redirect('/customer/login');
};

app.get('/', (req, res) => {
    const loggedInUser = req.session.customer || null;
    const isAdmin = req.session.isAdmin || false;
    const s = storeData.settings;

    res.send(`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${s.siteTitle}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            :root {
                --bg-color: #09090b;
                --accent-color: #D4AF37;
                --accent-gold-light: #F3E5AB;
                --beige-bg: #1c1a17;
                --nav-bg: rgba(12, 12, 14, 0.95);
                --card-bg: #121215;
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
                background-color: var(--bg-color); 
                color: #f5f5f7; 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            .nav-bar { 
                background-color: var(--nav-bg); 
                backdrop-filter: blur(14px);
                border-bottom: 1px solid rgba(212, 175, 55, 0.25);
            }
            .btn-gold { 
                background: linear-gradient(135deg, #F3E5AB, #D4AF37, #AA7C11); 
                color: #000000; 
                font-weight: 900;
                box-shadow: 0 4px 20px rgba(212, 175, 55, 0.25);
                transition: all 0.2s ease;
            }
            .btn-gold:active { transform: scale(0.97); }
            .card-style { 
                background: var(--card-bg); 
                border-radius: 20px; 
                border: 1px solid rgba(212, 175, 55, 0.2); 
                backdrop-filter: blur(8px);
                transition: transform 0.2s ease, border-color 0.2s ease;
            }
            .card-style:hover { border-color: rgba(212, 175, 55, 0.6); }
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            .gold-text {
                background: linear-gradient(135deg, #FFF5C0, #D4AF37, #996515);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .gold-border { border-color: rgba(212, 175, 55, 0.3); }
        </style>
    </head>
    <body class="pb-16">

        <header class="nav-bar sticky top-0 z-40 px-4 py-3.5 flex justify-between items-center">
            <a href="/" class="font-black text-xl flex items-center gap-2 tracking-wider">
                <span class="text-amber-400 text-2xl">👑</span> <span class="gold-text tracking-widest font-serif">ANZEXA</span>
            </a>
            <div class="flex items-center gap-3">
                <button onclick="toggleCart()" class="relative text-amber-300 text-lg p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <i class="fas fa-shopping-bag"></i>
                    <span id="cart-count" class="btn-gold text-[9px] rounded-full px-1.5 py-0.5 absolute -top-1.5 -right-1.5 border border-black">0</span>
                </button>
                ${isAdmin ? `
                    <a href="/admin/dashboard" class="btn-gold text-[10px] px-3 py-2 rounded-xl">ADMIN</a>
                    <a href="/customer/logout" class="text-xs text-red-400 font-bold px-1">Exit</a>
                ` : loggedInUser ? `
                    <span class="text-xs font-bold text-amber-200">Hi, ${loggedInUser.name}</span>
                    <a href="/customer/logout" class="text-xs text-red-400 font-bold">Logout</a>
                ` : `
                    <a href="/customer/login" class="text-xs font-bold text-amber-200 px-2 py-1">Login</a>
                    <a href="/customer/register" class="btn-gold text-xs px-3 py-2 rounded-xl">Sign Up</a>
                `}
            </div>
        </header>

        ${storeData.orders.length > 0 ? `
            <div class="mx-4 mt-4 p-3.5 bg-gradient-to-r from-stone-900 via-amber-950/30 to-zinc-900 rounded-2xl border gold-border text-white flex justify-between items-center">
                <div>
                    <h4 class="text-xs font-black gold-text flex items-center gap-1.5"><i class="fas fa-box"></i> Live Orders Tracker</h4>
                    <p class="text-[10px] text-zinc-400">View real-time delivery status</p>
                </div>
                <button onclick="openTrackModal()" class="btn-gold px-3 py-1.5 rounded-xl text-xs">My Orders</button>
            </div>
        ` : ''}

        <section class="mx-4 mt-4 p-6 rounded-3xl space-y-3 relative overflow-hidden" style="background: linear-gradient(145deg, #181614, #09090b); border: 1px solid rgba(212, 175, 55, 0.35);">
            <span class="text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest text-amber-300 bg-amber-500/10 border border-amber-500/30">PURE GOLD EDITION 2026</span>
            <h1 class="text-2xl font-serif font-bold leading-snug gold-text">Crafted Elegance & Luxury</h1>
            <p class="text-xs text-zinc-400">Premium quality products curated exclusively for you.</p>

            <!-- Search Bar -->
            <div class="mt-4 relative">
                <input type="text" id="searchInput" onkeyup="filterProducts()" placeholder="Search products..." class="w-full bg-zinc-900/90 border gold-border p-3 rounded-2xl text-xs text-amber-100 outline-none pl-9 focus:border-amber-400"/>
                <i class="fas fa-search absolute left-3 top-3.5 text-amber-500 text-xs"></i>
            </div>
        </section>

        <!-- Categories Bar -->
        ${storeData.categories.length > 0 ? `
            <div class="mx-4 mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                <button onclick="filterCategory('ALL')" class="btn-gold px-4 py-2 rounded-xl text-xs whitespace-nowrap">All Items</button>
                ${storeData.categories.map(c => `
                    <button onclick="filterCategory('${c.name}')" class="bg-zinc-900 border gold-border text-amber-200 px-4 py-2 rounded-xl text-xs whitespace-nowrap font-bold">${c.name}</button>
                `).join('')}
            </div>
        ` : ''}

        <section id="products" class="mt-5 px-4">
            ${storeData.products.length === 0 ? `
                <div class="text-center text-zinc-500 p-10 card-style m-2 space-y-2">
                    <i class="fas fa-gem text-4xl text-amber-500/30"></i>
                    <p class="text-xs font-semibold text-zinc-400">No luxury items available right now.</p>
                </div>
            ` : `
                <div id="product-grid" class="grid grid-cols-2 gap-3.5">
                    ${storeData.products.map(p => {
                        const reviews = p.reviews || [];
                        const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '5.0';
                        const safeTitle = p.title.replace(/'/g, "\\'");
                        return `
                        <div class="card-style p-3 flex flex-col justify-between product-card" data-title="${p.title.toLowerCase()}" data-category="${p.category || ''}">
                            <div>
                                <div class="w-full h-40 bg-zinc-950 rounded-2xl overflow-hidden mb-2.5 relative border border-white/5">
                                    ${p.images && p.images.length > 0 ? `<img src="${p.images[0]}" class="w-full h-full object-cover"/>` : '<div class="flex justify-center items-center h-full text-zinc-700"><i class="fas fa-image text-2xl"></i></div>'}
                                </div>
                                <div class="flex justify-between items-center text-[9px] font-bold text-amber-400 mb-1">
                                    <span class="uppercase tracking-widest">${p.category || 'Luxury'}</span>
                                    <span><i class="fas fa-star text-amber-300"></i> ${avgRating}</span>
                                </div>
                                <h3 class="text-xs font-bold text-zinc-100 truncate">${p.title}</h3>
                            </div>
                            <div class="mt-3">
                                <p class="text-xs font-black gold-text">PKR ${Number(p.price).toLocaleString()}</p>
                                <button onclick="event.stopPropagation(); addToCart('${p.id}', '${safeTitle}', ${p.price})" class="btn-gold w-full py-2.5 rounded-xl text-[10px] mt-2 flex items-center justify-center gap-1.5 uppercase tracking-wider">
                                    <i class="fas fa-bag-shopping"></i> Add To Bag
                                </button>
                                <button onclick="openProductModal('${p.id}')" class="w-full text-center text-[10px] text-amber-300/80 font-bold mt-2">Quick View</button>
                            </div>
                        </div>
                    `}).join('')}
                </div>
            `}
        </section>

        <!-- Product Modal -->
        <div id="productModal" class="fixed inset-0 bg-black/90 backdrop-blur-md z-50 hidden justify-center items-end sm:items-center p-0 sm:p-4">
            <div class="w-full max-w-md bg-zinc-950 border gold-border rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto text-zinc-100 shadow-2xl">
                <div class="flex justify-between items-center border-b gold-border pb-3">
                    <span id="modalCategory" class="text-[10px] font-black uppercase tracking-widest text-amber-400"></span>
                    <button onclick="closeProductModal()" class="w-8 h-8 rounded-full bg-zinc-800 text-amber-300 font-bold flex items-center justify-center">&times;</button>
                </div>
                
                <div class="w-full h-64 bg-zinc-900 rounded-2xl overflow-hidden relative border gold-border">
                    <img id="modalMainImg" src="" class="w-full h-full object-cover"/>
                </div>

                <div id="modalThumbnails" class="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar"></div>

                <div class="space-y-1">
                    <h2 id="modalTitle" class="font-bold text-base text-white"></h2>
                    <p id="modalPrice" class="font-black text-lg gold-text"></p>
                    <p id="modalDesc" class="text-xs text-zinc-400 mt-2 leading-relaxed bg-zinc-900/50 p-3 rounded-xl border border-white/5"></p>
                </div>

                <div class="border-t gold-border pt-3 space-y-3">
                    <h3 class="text-xs font-black uppercase tracking-widest gold-text"><i class="fas fa-comments mr-1"></i> Customer Ratings & Comments</h3>
                    <div id="reviewsList" class="space-y-2 max-h-40 overflow-y-auto pr-1"></div>

                    <form onsubmit="submitReview(event)" class="bg-zinc-900/60 p-3 rounded-2xl border gold-border space-y-2">
                        <input type="hidden" id="reviewProductId"/>
                        <div class="flex gap-2 items-center justify-between">
                            <span class="text-xs text-zinc-300 font-bold">Select Rating:</span>
                            <select id="reviewRating" class="bg-zinc-950 text-amber-300 font-bold text-xs p-1.5 rounded-xl border gold-border outline-none">
                                <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                                <option value="4">⭐⭐⭐⭐ (4/5)</option>
                                <option value="3">⭐⭐⭐ (3/5)</option>
                                <option value="2">⭐⭐ (2/5)</option>
                                <option value="1">⭐ (1/5)</option>
                            </select>
                        </div>
                        <input type="text" id="reviewName" placeholder="Your Name *" required class="w-full bg-zinc-950 border gold-border p-2.5 rounded-xl text-xs text-white outline-none"/>
                        <textarea id="reviewComment" placeholder="Write your comment here..." required class="w-full bg-zinc-950 border gold-border p-2.5 rounded-xl text-xs text-white outline-none h-16"></textarea>
                        <button type="submit" class="btn-gold w-full py-2.5 rounded-xl text-xs uppercase tracking-wider">Post Review</button>
                    </form>
                </div>

                <div class="pt-2">
                    <button id="modalAddBtn" onclick="" class="btn-gold w-full py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2">
                        <i class="fas fa-bag-shopping"></i> ADD TO BAG
                    </button>
                </div>
            </div>
        </div>

        <!-- Cart Drawer -->
        <div id="cartDrawer" class="fixed inset-0 bg-black/90 backdrop-blur-md z-50 hidden justify-end">
            <div class="w-full max-w-sm bg-zinc-950 border-l gold-border h-full p-5 flex flex-col justify-between overflow-y-auto text-zinc-100">
                <div>
                    <div class="flex justify-between items-center border-b gold-border pb-3">
                        <h3 class="font-bold text-sm gold-text uppercase tracking-wider flex items-center gap-2"><i class="fas fa-shopping-bag"></i> Shopping Bag</h3>
                        <button onclick="toggleCart()" class="w-8 h-8 rounded-full bg-zinc-800 text-amber-300 font-bold flex items-center justify-center">&times;</button>
                    </div>
                    <div id="cartItemsList" class="mt-4 space-y-2"></div>

                    <div id="checkoutForm" class="hidden mt-6 pt-4 border-t gold-border space-y-3">
                        <h4 class="font-black text-xs gold-text uppercase tracking-widest">Delivery Details</h4>
                        <form onsubmit="submitOrder(event)" class="space-y-2.5">
                            <input type="text" id="custName" placeholder="Full Name *" required class="w-full bg-zinc-900 border gold-border p-3 rounded-xl text-xs text-white outline-none"/>
                            <input type="tel" id="custPhone" placeholder="Phone Number *" required class="w-full bg-zinc-900 border gold-border p-3 rounded-xl text-xs text-white outline-none"/>
                            <input type="tel" id="custWhatsapp" placeholder="WhatsApp Number *" required class="w-full bg-zinc-900 border gold-border p-3 rounded-xl text-xs text-white outline-none"/>
                            <input type="text" id="custCity" placeholder="City *" required class="w-full bg-zinc-900 border gold-border p-3 rounded-xl text-xs text-white outline-none"/>
                            <textarea id="custAddress" placeholder="Complete Delivery Address *" required class="w-full bg-zinc-900 border gold-border p-3 rounded-xl text-xs text-white outline-none h-20"></textarea>
                            <select id="paymentMethod" class="w-full bg-zinc-900 border gold-border p-3 rounded-xl text-xs text-amber-300 font-bold outline-none">
                                <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                                <option value="Online Bank Transfer">Online Bank Transfer</option>
                            </select>
                            <button type="submit" class="btn-gold w-full py-3.5 rounded-xl text-xs uppercase tracking-widest mt-2">CONFIRM & PLACE ORDER</button>
                        </form>
                    </div>
                </div>

                <div id="cartFooter" class="border-t gold-border pt-4 mt-4">
                    <div class="flex justify-between font-black text-xs mb-3 text-zinc-200">
                        <span>Total Amount:</span>
                        <span id="cartTotalPrice" class="gold-text text-sm">PKR 0</span>
                    </div>
                    <button onclick="showCheckout()" id="checkoutBtn" class="btn-gold w-full py-3.5 rounded-xl text-xs uppercase tracking-widest">Proceed To Checkout</button>
                </div>
            </div>
        </div>

        <!-- Order Track Modal -->
        <div id="trackModal" class="fixed inset-0 bg-black/90 backdrop-blur-md z-50 hidden justify-center items-center p-4">
            <div class="w-full max-w-sm bg-zinc-950 border gold-border rounded-3xl p-5 space-y-3 text-zinc-100">
                <div class="flex justify-between items-center border-b gold-border pb-3">
                    <h3 class="font-bold text-xs uppercase tracking-widest gold-text">Order Tracking Status</h3>
                    <button onclick="closeTrackModal()" class="w-7 h-7 rounded-full bg-zinc-800 text-amber-300 font-bold flex items-center justify-center">&times;</button>
                </div>
                <div id="userOrdersList" class="space-y-3 max-h-80 overflow-y-auto pr-1">
                    ${storeData.orders.length === 0 ? '<p class="text-xs text-zinc-500 text-center py-4">No orders placed yet.</p>' : storeData.orders.map(o => `
                        <div class="border gold-border bg-zinc-900/60 p-3.5 rounded-2xl text-xs space-y-1.5">
                            <div class="flex justify-between font-extrabold">
                                <span>Order #${o.id}</span>
                                <span class="${o.status === 'Approved' ? 'text-emerald-400' : 'text-amber-400'}">${o.status}</span>
                            </div>
                            <p class="text-[10px] text-zinc-400">Items: ${o.items.map(i => i.title + ' (x'+i.qty+')').join(', ')}</p>
                            <p class="font-black gold-text">Total: PKR ${o.total.toLocaleString()}</p>
                            ${o.courier ? `
                                <div class="bg-zinc-950 p-2.5 rounded-xl border gold-border mt-2 space-y-0.5">
                                    <p class="font-bold text-[10px] text-zinc-300">Courier: ${o.courier}</p>
                                    <p class="text-[11px] font-mono text-amber-300 font-bold">Tracking ID: ${o.trackingCode}</p>
                                </div>
                            ` : '<p class="text-[10px] text-zinc-500 italic mt-1">Tracking details will appear after Admin Approval.</p>'}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <script>
            const allProducts = ${JSON.stringify(storeData.products)};
            let cart = [];

            function filterProducts() {
                const query = document.getElementById('searchInput').value.toLowerCase();
                const cards = document.querySelectorAll('.product-card');
                cards.forEach(card => {
                    const title = card.getAttribute('data-title');
                    card.style.display = title.includes(query) ? 'flex' : 'none';
                });
            }

            function filterCategory(cat) {
                const cards = document.querySelectorAll('.product-card');
                cards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if(cat === 'ALL' || category === cat) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            }

            function openProductModal(id) {
                const product = allProducts.find(p => p.id == id);
                if (!product) return;

                document.getElementById('reviewProductId').value = product.id;
                document.getElementById('modalCategory').innerText = product.category || 'LUXURY';
                document.getElementById('modalTitle').innerText = product.title;
                document.getElementById('modalPrice').innerText = 'PKR ' + Number(product.price).toLocaleString();
                document.getElementById('modalDesc').innerText = product.description || 'No detailed description provided.';
                
                const revList = document.getElementById('reviewsList');
                const reviews = product.reviews || [];
                if(reviews.length === 0) {
                    revList.innerHTML = '<p class="text-[11px] text-zinc-500 italic">No reviews yet. Be the first to comment!</p>';
                } else {
                    revList.innerHTML = reviews.map(r => '<div class="bg-zinc-900 p-2.5 rounded-xl border gold-border space-y-1 text-xs"><div class="flex justify-between items-center font-bold"><span class="text-zinc-200">' + r.name + '</span><span class="text-amber-400">' + '⭐'.repeat(r.rating) + '</span></div><p class="text-zinc-400 text-[11px]">' + r.comment + '</p></div>').join('');
                }

                const mainImg = document.getElementById('modalMainImg');
                const thumbsDiv = document.getElementById('modalThumbnails');
                thumbsDiv.innerHTML = '';

                if (product.images && product.images.length > 0) {
                    mainImg.src = product.images[0];
                    product.images.forEach((img, idx) => {
                        const thumb = document.createElement('img');
                        thumb.src = img;
                        thumb.className = 'w-14 h-14 object-cover rounded-xl border-2 cursor-pointer flex-shrink-0 transition-all ' + (idx === 0 ? 'border-amber-400 scale-105' : 'border-transparent opacity-60');
                        thumb.onclick = () => {
                            mainImg.src = img;
                            Array.from(thumbsDiv.children).forEach(c => {
                                c.classList.remove('border-amber-400', 'scale-105');
                                c.classList.add('border-transparent', 'opacity-60');
                            });
                            thumb.classList.remove('border-transparent', 'opacity-60');
                            thumb.classList.add('border-amber-400', 'scale-105');
                        };
                        thumbsDiv.appendChild(thumb);
                    });
                } else {
                    mainImg.src = '';
                }

                document.getElementById('modalAddBtn').onclick = () => {
                    addToCart(product.id, product.title, product.price);
                    closeProductModal();
                };

                const modal = document.getElementById('productModal');
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }

            function closeProductModal() {
                const modal = document.getElementById('productModal');
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }

            async function submitReview(e) {
                e.preventDefault();
                const productId = document.getElementById('reviewProductId').value;
                const name = document.getElementById('reviewName').value;
                const rating = Number(document.getElementById('reviewRating').value);
                const comment = document.getElementById('reviewComment').value;

                const res = await fetch('/product/add-review', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId, name, rating, comment })
                });

                if(res.ok) {
                    alert('Review submitted!');
                    location.reload();
                }
            }

            function toggleCart() {
                const drawer = document.getElementById('cartDrawer');
                drawer.classList.toggle('hidden');
                drawer.classList.toggle('flex');
            }

            function addToCart(id, title, price) {
                const existing = cart.find(item => item.id === id);
                if (existing) existing.qty += 1;
                else cart.push({ id, title, price, qty: 1 });
                updateCartUI();
                alert('Added to your bag!');
            }

            function updateCartUI() {
                document.getElementById('cart-count').innerText = cart.reduce((sum, item) => sum + item.qty, 0);
                const list = document.getElementById('cartItemsList');
                let total = 0;
                if(cart.length === 0) {
                    list.innerHTML = '<p class="text-xs text-zinc-500 text-center py-6">Your bag is empty</p>';
                    document.getElementById('checkoutBtn').style.display = 'none';
                } else {
                    document.getElementById('checkoutBtn').style.display = 'block';
                    list.innerHTML = cart.map(item => {
                        total += item.price * item.qty;
                        return '<div class="flex justify-between items-center text-xs py-2 border-b gold-border"><span>' + item.title + ' <span class="text-amber-400 font-bold">(x' + item.qty + ')</span></span><span class="font-bold gold-text">PKR ' + (item.price * item.qty).toLocaleString() + '</span></div>';
                    }).join('');
                }
                document.getElementById('cartTotalPrice').innerText = 'PKR ' + total.toLocaleString();
            }

            function showCheckout() {
                if(cart.length === 0) return;
                document.getElementById('checkoutForm').classList.remove('hidden');
                document.getElementById('checkoutBtn').classList.add('hidden');
            }

            async function submitOrder(e) {
                e.preventDefault();
                const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
                const name = document.getElementById('custName').value;
                const phone = document.getElementById('custPhone').value;
                const whatsapp = document.getElementById('custWhatsapp').value;
                const city = document.getElementById('custCity').value;
                const address = document.getElementById('custAddress').value;
                const paymentMethod = document.getElementById('paymentMethod').value;

                const orderData = { name, phone, whatsapp, city, address, paymentMethod, items: cart, total };

                const res = await fetch('/customer/place-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                });

                const data = await res.json();
                if(data.success) {
                    alert('Order Placed Successfully!');
                    location.reload();
                }
            }

            function openTrackModal() { document.getElementById('trackModal').classList.remove('hidden'); document.getElementById('trackModal').classList.add('flex'); }
            function closeTrackModal() { document.getElementById('trackModal').classList.add('hidden'); }
        </script>
    </body>
    </html>`);
});

app.post('/product/add-review', (req, res) => {
    const { productId, name, rating, comment } = req.body;
    const product = storeData.products.find(p => p.id == productId);
    if (product) {
        if (!product.reviews) product.reviews = [];
        product.reviews.unshift({
            id: Date.now(),
            name,
            rating: Number(rating),
            comment,
            date: new Date().toLocaleDateString()
        });
        saveStoreData();
        return res.json({ success: true });
    }
    res.status(404).json({ success: false });
});

app.post('/customer/place-order', (req, res) => {
    const { name, phone, whatsapp, city, address, paymentMethod, items, total } = req.body;
    const newOrder = {
        id: Date.now().toString().slice(-6),
        name, phone, whatsapp, city, address, paymentMethod, items, total,
        status: 'Pending Payment', courier: '', trackingCode: '',
        date: new Date().toLocaleDateString()
    };
    storeData.orders.unshift(newOrder);
    saveStoreData();
    res.json({ success: true, orderId: newOrder.id });
});

app.get('/customer/register', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Register</title><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-950 text-zinc-100 flex items-center justify-center min-h-screen p-4"><div class="w-full max-w-sm bg-zinc-900 border border-amber-500/30 p-6 rounded-3xl shadow-2xl space-y-4"><h2 class="text-center font-black text-sm text-amber-400 uppercase tracking-widest">Create Account</h2><form action="/customer/register" method="POST" class="space-y-3"><input type="text" name="name" placeholder="Full Name" required class="w-full bg-zinc-950 border border-amber-500/30 p-3 rounded-xl text-xs outline-none focus:border-amber-400"/><input type="email" name="email" placeholder="Email Address" required class="w-full bg-zinc-950 border border-amber-500/30 p-3 rounded-xl text-xs outline-none focus:border-amber-400"/><input type="password" name="password" placeholder="Password" required class="w-full bg-zinc-950 border border-amber-500/30 p-3 rounded-xl text-xs outline-none focus:border-amber-400"/><button type="submit" class="w-full bg-gradient-to-r from-amber-300 via-amber-500 to-amber-700 text-black font-black py-3.5 rounded-xl text-xs tracking-widest">REGISTER</button></form><p class="text-center text-xs text-zinc-500">Already have an account? <a href="/customer/login" class="text-amber-400 font-bold">Login</a></p></div></body></html>`);
});

app.post('/customer/register', (req, res) => {
    const { name, email, password } = req.body;
    storeData.users.push({ id: Date.now(), name, email, password });
    saveStoreData();
    req.session.customer = { name, email };
    res.redirect('/');
});

app.get('/customer/login', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Login</title><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-zinc-950 text-zinc-100 flex items-center justify-center min-h-screen p-4"><div class="w-full max-w-sm bg-zinc-900 border border-amber-500/30 p-6 rounded-3xl shadow-2xl space-y-4"><h2 class="text-center font-black text-sm text-amber-400 uppercase tracking-widest">Account Login</h2><form action="/customer/login" method="POST" class="space-y-3"><input type="text" name="identifier" placeholder="Username / Email" required class="w-full bg-zinc-950 border border-amber-500/30 p-3 rounded-xl text-xs outline-none focus:border-amber-400"/><input type="password" name="password" placeholder="Password" required class="w-full bg-zinc-950 border border-amber-500/30 p-3 rounded-xl text-xs outline-none focus:border-amber-400"/><button type="submit" class="w-full bg-gradient-to-r from-amber-300 via-amber-500 to-amber-700 text-black font-black py-3.5 rounded-xl text-xs tracking-widest">LOGIN</button></form><p class="text-center text-xs text-zinc-500">New customer? <a href="/customer/register" class="text-amber-400 font-bold">Create Account</a></p></div></body></html>`);
});

app.post('/customer/login', (req, res) => {
    const { identifier, password } = req.body;
    if (identifier === ADMIN_USER && password === ADMIN_PASS) {
        req.session.isAdmin = true;
        return res.redirect('/admin/dashboard');
    }
    const user = storeData.users.find(u => u.email === identifier && u.password === password);
    if (user) {
        req.session.customer = user;
        return res.redirect('/');
    }
    res.send("<script>alert('Invalid Credentials'); window.location='/customer/login';</script>");
});

app.get('/customer/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/admin/dashboard', adminAuth, (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Admin Dashboard</title><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></head><body class="bg-zinc-950 text-zinc-100 p-4 space-y-4"><div class="max-w-xl mx-auto space-y-4">
    
    <div class="flex justify-between items-center bg-zinc-900 border border-amber-500/30 p-4 rounded-2xl">
        <h1 class="text-xs font-black uppercase tracking-widest text-amber-400">👑 ANZEXA Admin</h1>
        <a href="/" class="text-xs bg-amber-500 text-black font-black px-3.5 py-2 rounded-xl">View Store</a>
    </div>

    <div class="bg-zinc-900 border border-amber-500/30 p-4 rounded-2xl space-y-3">
        <div class="flex justify-between items-center border-b border-amber-500/20 pb-2">
            <h3 class="font-black text-xs text-amber-400 uppercase tracking-widest"><i class="fas fa-shopping-cart mr-1"></i> Customer Orders (${storeData.orders.length})</h3>
        </div>

        ${storeData.orders.length === 0 ? '<p class="text-xs text-zinc-500 py-3 text-center">No orders placed yet.</p>' : storeData.orders.map(o => `
            <div class="border border-amber-500/20 rounded-2xl p-3.5 space-y-2 bg-zinc-950">
                <div class="flex justify-between items-center">
                    <span class="font-black text-xs text-zinc-100">Order #${o.id}</span>
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${o.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}">${o.status}</span>
                </div>
                <div class="text-xs space-y-1 bg-zinc-900/60 p-3 rounded-xl border border-white/5 text-zinc-300">
                    <p><strong>Customer:</strong> ${o.name}</p>
                    <p><strong>Phone:</strong> ${o.phone}</p>
                    <p><strong>City:</strong> ${o.city}</p>
                    <p><strong>Address:</strong> ${o.address}</p>
                    <p><strong>Payment Method:</strong> <span class="font-bold text-amber-400">${o.paymentMethod}</span></p>
                    <p><strong>Items:</strong> ${o.items.map(i => i.title + ' (x'+i.qty+')').join(', ')}</p>
                    <p class="text-xs font-black text-amber-400 pt-1">Total: PKR ${o.total.toLocaleString()}</p>
                </div>
                <form action="/admin/approve-order" method="POST" class="pt-2 border-t border-amber-500/20 space-y-2">
                    <input type="hidden" name="orderId" value="${o.id}"/>
                    <div class="grid grid-cols-2 gap-2">
                        <input type="text" name="courier" value="${o.courier}" placeholder="Courier (e.g. TCS)" required class="bg-zinc-900 border border-amber-500/20 p-2 rounded-xl text-xs outline-none text-white"/>
                        <input type="text" name="trackingCode" value="${o.trackingCode}" placeholder="Tracking Code" required class="bg-zinc-900 border border-amber-500/20 p-2 rounded-xl text-xs outline-none text-white"/>
                    </div>
                    <button type="submit" class="bg-amber-500 text-black w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider">Approve & Send Tracking Code</button>
                </form>
            </div>
        `).join('')}
    </div>

    <div class="bg-zinc-900 border border-amber-500/30 p-4 rounded-2xl space-y-3">
        <h3 class="font-black text-xs text-amber-400 uppercase tracking-widest">Manage Categories</h3>
        <form action="/admin/add-category" method="POST" enctype="multipart/form-data" class="space-y-2">
            <input type="text" name="categoryName" placeholder="New Category Name" required class="w-full bg-zinc-950 border border-amber-500/30 p-2.5 rounded-xl text-xs text-white outline-none"/>
            <input type="file" name="categoryImage" accept="image/*" class="w-full bg-zinc-950 border border-amber-500/30 p-2 rounded-xl text-xs text-zinc-400"/>
            <button type="submit" class="bg-amber-500 text-black w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider">Add Category</button>
        </form>
    </div>

    <form action="/admin/add-product" method="POST" enctype="multipart/form-data" class="bg-zinc-900 border border-amber-500/30 p-4 rounded-2xl space-y-3">
        <h3 class="font-black text-xs text-amber-400 uppercase tracking-widest">Add Product</h3>
        <input type="text" name="title" placeholder="Product Title" required class="w-full bg-zinc-950 border border-amber-500/30 p-2.5 rounded-xl text-xs text-white outline-none"/>
        <select name="category" class="w-full bg-zinc-950 border border-amber-500/30 p-2.5 rounded-xl text-xs text-amber-300 outline-none font-bold">
            <option value="">Select Category</option>
            ${storeData.categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
        </select>
        <input type="number" name="price" placeholder="Price (PKR)" required class="w-full bg-zinc-950 border border-amber-500/30 p-2.5 rounded-xl text-xs text-white outline-none"/>
        <textarea name="description" placeholder="Description" class="w-full bg-zinc-950 border border-amber-500/30 p-2.5 rounded-xl text-xs text-white outline-none h-20"></textarea>
        <input type="file" name="productImages" accept="image/*" multiple class="w-full bg-zinc-950 border border-amber-500/30 p-2 rounded-xl text-xs text-zinc-400"/>
        <button type="submit" class="bg-amber-500 text-black w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider">Publish Product</button>
    </form>

    </div>
    </body></html>`);
});

app.post('/admin/approve-order', adminAuth, (req, res) => {
    const { orderId, courier, trackingCode } = req.body;
    const order = storeData.orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'Approved';
        order.courier = courier;
        order.trackingCode = trackingCode;
        saveStoreData();
    }
    res.redirect('/admin/dashboard');
});

app.post('/admin/add-category', adminAuth, upload.single('categoryImage'), (req, res) => {
    const { categoryName } = req.body;
    let imgPath = '';
    if (req.file) imgPath = `/uploads/${req.file.filename}`;
    if (categoryName) {
        storeData.categories.push({ id: Date.now().toString(), name: categoryName, image: imgPath });
        saveStoreData();
    }
    res.redirect('/admin/dashboard');
});

app.post('/admin/add-product', adminAuth, upload.fields([{ name: 'productImages', maxCount: 10 }]), (req, res) => {
    let imagesList = [];
    if (req.files && req.files['productImages']) {
        imagesList = req.files['productImages'].map(f => `/uploads/${f.filename}`);
    }
    storeData.products.unshift({
        id: Date.now(),
        title: req.body.title,
        category: req.body.category,
        price: Number(req.body.price),
        description: req.body.description || '',
        images: imagesList,
        reviews: []
    });
    saveStoreData();
    res.redirect('/admin/dashboard');
});

app.listen(PORT, () => console.log('Server running on port ' + PORT));
