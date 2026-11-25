const categoriesList = [
    "Shirt", "T Shirt", "Polo Shirt", "Panabi", "Jeans",
    "Formal Pant", "Cargo Pant", "Gabardine Pant", "Joggers", "Hoodie",
    "Jacket", "Sweater", "Blazer", "Underwear & Boxers", "Socks",
    "Saree", "Three Piece", "Two Piece", "Kurti", "Gown",
    "Burkha & Abaya", "Hijab & Scarf", "Lehenga", "Palazzo & Leggings", "Tops",
    "Men's Watch", "Ladies Watch", "Smart Watch", "Sunglasses", "Wallet & Card Holder",
    "Belt", "Cap & Hat", "Backpack", "Handbag & Purse", "Shoes & Sneakers",
    "Sandals & Loafers", "Perfume & Attar", "Jewellery", "Kids Wear", "Combo Pack"
];

const placeholderSlotImg = "https://via.placeholder.com/120x120?text=Select+Item";

let products = JSON.parse(localStorage.getItem('store_products')) || [
    { id: 1, name: "Casual Denim Shirt", price: 1200, category: "Shirt", size: "M, L, XL", desc: "100% pure cotton shirt", img: "https://picsum.photos/300/300?random=1", isFeatured: true },
    { id: 2, name: "Premium Polo T-Shirt", price: 650, category: "T Shirt", size: "L, XL", desc: "Comfortable daily wear", img: "https://picsum.photos/300/300?random=2", isFeatured: true },
    { id: 3, name: "Slim Fit Jeans", price: 1500, category: "Jeans", size: "30, 32, 34", desc: "Stretchable denim", img: "https://picsum.photos/300/300?random=3", isFeatured: true },
    { id: 4, name: "Katan Saree", price: 3500, category: "Saree", size: "Free Size", desc: "Traditional party wear", img: "https://picsum.photos/300/300?random=4", isFeatured: true },
    { id: 5, name: "Classic Chronograph Watch", price: 1850, category: "Men's Watch", size: "Adjustable", desc: "Water-resistant everyday timepiece", img: "https://picsum.photos/300/300?random=5", isFeatured: false },
    { id: 6, name: "Festival Combo Pack", price: 2290, category: "Combo Pack", size: "M, L, XL", desc: "Shirt + Belt + Wallet combo offer", img: "https://picsum.photos/300/300?random=6", isFeatured: false }
];

let banners = JSON.parse(localStorage.getItem('store_banners')) || [
    "https://picsum.photos/1200/420?random=10",
    "https://picsum.photos/1200/420?random=11",
    "https://picsum.photos/1200/420?random=12"
];

let reviews = JSON.parse(localStorage.getItem('store_reviews')) || [
    { name: "Tanvir Ahmed", comment: "Fabric quality was top notch! Highly recommended.", fit: "True to Size", images: ["https://picsum.photos/200/200?random=20"] },
    { name: "Nusrat Jahan", comment: "Saree fabric is really smooth and gorgeous.", fit: "True to Size", images: [] }
];

let orders = JSON.parse(localStorage.getItem('store_orders')) || [];
let siteLogo = localStorage.getItem('site_logo') || "";

let cart = [];
let wishlist = [];
let slideIndex = 0;
let slideInterval;
let activeCombo = null;
let currentStylePersona = "men";

document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    renderLogo();
    renderBanners();
    renderProducts();
    renderReviews();
    setupComboDropdowns();
    updateLookCard();
    renderAdminOrdersList();
    renderAdminAnalytics();
    startSlider();

    document.addEventListener('click', (e) => {
        const popup = document.getElementById('categoryPopup');
        const menuBtn = document.getElementById('categoryMenuBtn');
        if (popup && popup.classList.contains('show')) {
            if (!popup.contains(e.target) && (!menuBtn || !menuBtn.contains(e.target))) {
                closeCategoryPopup();
            }
        }
    });
});

function renderCategories() {
    const popupGrid = document.getElementById('categoryPopupGrid');
    const adminCatSelect = document.getElementById('pCat');
    const homeStrip = document.getElementById('homeCategoryStrip');

    if (popupGrid) {
        popupGrid.innerHTML = categoriesList.map((cat, index) => {
            const safeCat = cat.replace(/'/g, "\\'");
            return `<button type="button" class="category-chip-btn" onclick="filterCategory('${safeCat}')">${index + 1}. ${cat}</button>`;
        }).join('');
    }

    if (adminCatSelect) {
        adminCatSelect.innerHTML = categoriesList.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    }

    if (homeStrip) {
        const popularCats = categoriesList.slice(0, 12);
        homeStrip.innerHTML = popularCats.map(cat => {
            const safeCat = cat.replace(/'/g, "\\'");
            return `<button type="button" class="home-cat-pill" onclick="filterCategory('${safeCat}')">${cat}</button>`;
        }).join('');
    }
}

function renderLogo() {
    const logoImg = document.getElementById('headerLogoImg');
    const shopTitle = document.getElementById('headerShopTitle');
    shopTitle.style.display = "block";

    if (siteLogo && siteLogo.trim() !== "") {
        logoImg.src = siteLogo;
        logoImg.style.display = "block";
    } else {
        logoImg.style.display = "none";
    }
}

function renderBanners() {
    const wrapper = document.getElementById('sliderWrapper');
    if(wrapper) wrapper.innerHTML = banners.map(url => `<img src="${url}">`).join('');
}

function startSlider() {
    clearInterval(slideInterval);
    if(banners.length > 0) {
        slideInterval = setInterval(() => {
            slideIndex = (slideIndex + 1) % banners.length;
            const wrapper = document.getElementById('sliderWrapper');
            if(wrapper) wrapper.style.transform = `translateX(-${slideIndex * 100}%)`;
        }, 2000);
    }
}

function showView(viewName) {
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(viewName + 'View');
    if (target) target.classList.add('active');
    closeCategoryPopup();
    if (viewName === 'newArrivals') renderGrid('newArrivalsGrid', [...products].reverse());
    if (viewName === 'flashSale') renderGrid('flashSaleGrid', products);
}

function toggleCategoryPopup(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('categoryPopup').classList.toggle('show');
}

function openCategoryPopupFromPage() {
    document.getElementById('categoryPopup').classList.add('show');
}

function closeCategoryPopup() {
    const popup = document.getElementById('categoryPopup');
    if(popup) popup.classList.remove('show');
}

function filterCategory(catName) {
    showView('category');
    document.getElementById('categoryTitle').innerText = "Category: " + catName;
    const filtered = products.filter(p => p.category.toLowerCase() === catName.toLowerCase());
    renderGrid('categoryGrid', filtered);
}

function handleSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    showView('category');
    document.getElementById('categoryTitle').innerText = `Search Results: "${query}"`;
    const filtered = products.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
    renderGrid('categoryGrid', filtered);
}

function renderProducts() {
    const featuredList = products.filter(p => p.isFeatured === true);
    const newestFirst = [...products].reverse();

    renderGrid('featuredGrid', featuredList);
    renderGrid('homeFlashSaleGrid', products.slice(0, 4));
    renderGrid('homeNewArrivalsGrid', newestFirst.slice(0, 4));

    renderGrid('newArrivalsGrid', newestFirst);
    renderGrid('flashSaleGrid', products);
    setupComboDropdowns();
}

function renderGrid(containerId, list) {
    const container = document.getElementById(containerId);
    if(!container) return;
    if(list.length === 0) {
        container.innerHTML = "<p>No products found in this category yet.</p>";
        return;
    }
    container.innerHTML = list.map(p => `
        <div class="product-card">
            <img src="${p.img}" alt="${p.name}">
            <h3>${p.name}</h3>
            <div class="price">৳${p.price}</div>
            <div class="details">${p.desc}</div>
            <div class="size">Size: ${p.size} | Cat: ${p.category}</div>
            <div class="card-actions">
                <button class="btn-add-cart" onclick="addToCart(${p.id})">Add to Cart</button>
                <button class="btn-wishlist" onclick="addToWishlist(${p.id})"><i class="fa-solid fa-heart"></i></button>
            </div>
        </div>
    `).join('');
}

function setStylePersona(persona) {
    currentStylePersona = persona;
    const btnMen = document.getElementById('btnStyleMen');
    const btnWomen = document.getElementById('btnStyleWomen');
    const label = document.getElementById('lookbookPersonaLabel');

    if (btnMen) btnMen.classList.toggle('active', persona === 'men');
    if (btnWomen) btnWomen.classList.toggle('active', persona === 'women');
    if (label) {
        label.innerText = persona === 'men' ? "Men's Curated Look" : "Women's Curated Look";
    }
}

function setupComboDropdowns() {
    const sel1 = document.getElementById('comboItem1');
    const sel2 = document.getElementById('comboItem2');
    const sel3 = document.getElementById('comboItem3');
    if(!sel1 || !sel2 || !sel3) return;

    const optionsHtml = products.map(p => `<option value="${p.id}">${p.name} (৳${p.price})</option>`).join('');
    sel1.innerHTML = `<option value="">Select Shirt / Topwear</option>` + optionsHtml;
    sel2.innerHTML = `<option value="">Select Jeans / Bottomwear</option>` + optionsHtml;
    sel3.innerHTML = `<option value="">Select Watch / Accessory</option>` + optionsHtml;
}

function syncSingleLookSlot(selectId, imgId, nameId, cardId, prod) {
    const imgEl = document.getElementById(imgId);
    const nameEl = document.getElementById(nameId);
    const cardEl = document.getElementById(cardId);
    const selectEl = document.getElementById(selectId);

    if (prod && selectEl && selectEl.value) {
        if (imgEl) imgEl.src = prod.img;
        if (nameEl) nameEl.innerText = `${prod.name} (৳${prod.price})`;
        if (cardEl) cardEl.classList.add('filled');
    } else {
        if (imgEl) imgEl.src = placeholderSlotImg;
        if (nameEl) nameEl.innerText = "Not selected";
        if (cardEl) cardEl.classList.remove('filled');
    }
}

function updateLookCard() {
    const id1 = Number(document.getElementById('comboItem1')?.value);
    const id2 = Number(document.getElementById('comboItem2')?.value);
    const id3 = Number(document.getElementById('comboItem3')?.value);

    const p1 = products.find(p => p.id === id1);
    const p2 = products.find(p => p.id === id2);
    const p3 = products.find(p => p.id === id3);

    syncSingleLookSlot('comboItem1', 'lookImg1', 'lookName1', 'slotCard1', p1);
    syncSingleLookSlot('comboItem2', 'lookImg2', 'lookName2', 'slotCard2', p2);
    syncSingleLookSlot('comboItem3', 'lookImg3', 'lookName3', 'slotCard3', p3);

    const statusEl = document.getElementById('lookbookStatusText');
    const pickedCount = [p1, p2, p3].filter(Boolean).length;
    if (statusEl) {
        if (pickedCount === 3) {
            statusEl.innerText = `Complete 3-Item Look Ready (${currentStylePersona === 'men' ? "Men's" : "Women's"} Style)`;
        } else {
            statusEl.innerText = `${pickedCount}/3 items matched — select remaining items for 10% combo discount`;
        }
    }
}

function randomizeComboLook() {
    if (products.length === 0) return;
    const personas = ['men', 'women'];
    setStylePersona(personas[Math.floor(Math.random() * personas.length)]);

    const pickRandomId = () => products[Math.floor(Math.random() * products.length)].id;
    document.getElementById('comboItem1').value = pickRandomId();
    document.getElementById('comboItem2').value = pickRandomId();
    document.getElementById('comboItem3').value = pickRandomId();

    updateLookCard();
    calculateComboTotal();
}

async function generateCombinedOutfitPreview() {
    const ids = [
        Number(document.getElementById('comboItem1')?.value),
        Number(document.getElementById('comboItem2')?.value),
        Number(document.getElementById('comboItem3')?.value)
    ];

    const selectedItems = ids
        .map(id => products.find(p => p.id === id))
        .filter(Boolean);

    const statusEl = document.getElementById('combinedLookStatus');
    const imgEl = document.getElementById('combinedLookImg');
    const noteEl = document.getElementById('stylistNoteBox');

    if (selectedItems.length === 0) {
        if (statusEl) statusEl.innerText = "আগে অন্তত ১টি বা ৩টি আইটেম সিলেক্ট করুন।";
        return;
    }

    if (statusEl) statusEl.innerText = "Combined look ও Style Match তৈরি হচ্ছে...";

    try {
        const res = await fetch("http://127.0.0.1:5000/api/generate-look", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                persona: currentStylePersona,
                items: selectedItems
            })
        });

        if (!res.ok) {
            throw new Error("Python server response error");
        }

        const data = await res.json();
        if (data.ok && data.image && imgEl) {
            imgEl.src = data.image;
            imgEl.style.display = "block";
            if (noteEl && data.stylist_note) {
                noteEl.innerText = data.stylist_note;
                noteEl.style.display = "block";
            }
            if (statusEl) {
                statusEl.innerText = data.message || "Look ready.";
            }
            return;
        }
        throw new Error(data.error || "Invalid response");
    } catch (err) {
        if (statusEl) {
            statusEl.innerText = "Python ব্যাকএন্ড (port 5000) চালু নেই। আগে app.py রান করুন।";
        }
    }
}

function calculateComboTotal() {
    const id1 = Number(document.getElementById('comboItem1').value);
    const id2 = Number(document.getElementById('comboItem2').value);
    const id3 = Number(document.getElementById('comboItem3').value);

    if(!id1 || !id2 || !id3) {
        document.getElementById('comboSummaryText').innerText = "Select 3 items to build your custom outfit.";
        document.getElementById('comboOrigPrice').innerText = "৳0";
        document.getElementById('comboDiscPrice').innerText = "৳0";
        activeCombo = null;
        return;
    }

    const p1 = products.find(p => p.id === id1);
    const p2 = products.find(p => p.id === id2);
    const p3 = products.find(p => p.id === id3);

    const origTotal = p1.price + p2.price + p3.price;
    const discTotal = Math.round(origTotal * 0.9);

    activeCombo = {
        name: `Custom Combo Pack (${p1.name} + ${p2.name} + ${p3.name})`,
        price: discTotal
    };

    document.getElementById('comboSummaryText').innerText = `${p1.name} + ${p2.name} + ${p3.name}`;
    document.getElementById('comboOrigPrice').innerText = `৳${origTotal}`;
    document.getElementById('comboDiscPrice').innerText = `৳${discTotal}`;
}

function addComboToCart() {
    if(!activeCombo) {
        alert("Please select all 3 items to build your combo first!");
        return;
    }
    cart.push({
        id: Date.now(),
        name: activeCombo.name,
        price: activeCombo.price
    });
    updateHeaderCounters();
    renderCartModal();
    alert("Combo package added to your cart with 10% Discount!");
}

function renderReviews() {
    const container = document.getElementById('reviewsContainer');
    const photoOnly = document.getElementById('photoOnlyCheck')?.checked || false;
    if(!container) return;

    let displayReviews = reviews;
    if (photoOnly) {
        displayReviews = reviews.filter(r => r.images && r.images.length > 0);
    }

    if(displayReviews.length === 0) {
        container.innerHTML = "<p>No customer reviews match your filter.</p>";
        return;
    }

    container.innerHTML = displayReviews.map(r => `
        <div class="review-card">
            <h4><i class="fa-solid fa-user-circle"></i> ${r.name}</h4>
            ${r.fit ? `<span class="fit-tag"><i class="fa-solid fa-shirt"></i> Fit: ${r.fit}</span>` : ''}
            <p>${r.comment}</p>
            ${r.images && r.images.length > 0 ? `
                <div class="review-images-grid">
                    ${r.images.map(imgUrl => `<img src="${imgUrl}">`).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

function handleReviewSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('revName').value;
    const comment = document.getElementById('revComment').value;
    const fit = document.getElementById('revFit').value;
    const fileInput = document.getElementById('revImages');
    const files = Array.from(fileInput.files).slice(0, 4);

    const imagePromises = files.map(file => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    });

    Promise.all(imagePromises).then(base64Images => {
        const newReview = { name: name, comment: comment, fit: fit, images: base64Images };
        reviews.unshift(newReview);
        localStorage.setItem('store_reviews', JSON.stringify(reviews));
        renderReviews();
        renderAdminAnalytics();
        closeModal('addReviewModal');
        alert("Review submitted successfully!");
        e.target.reset();
    });
}

function handleTrackOrder() {
    const phone = document.getElementById('trackPhoneInput').value.trim();
    const resultBox = document.getElementById('trackResult');
    if(!phone) {
        resultBox.innerHTML = "<p style='color:red;'>Please enter a phone number.</p>";
        return;
    }
    const userOrders = orders.filter(o => o.phone === phone);
    if(userOrders.length === 0) {
        resultBox.innerHTML = "<p style='color:#777;'>No orders found with this phone number.</p>";
    } else {
        resultBox.innerHTML = userOrders.map(o => `
            <div style="background:#f1f2f6; padding:15px; border-radius:6px; margin-bottom:10px;">
                <p><strong>Order ID:</strong> #${o.id}</p>
                <p><strong>Customer Name:</strong> ${o.name}</p>
                <p><strong>Address:</strong> ${o.address || 'N/A'}</p>
                <p><strong>Total Amount:</strong> ৳${o.total}</p>
                <p><strong>Status:</strong> <span style="color:green; font-weight:bold;">${o.status}</span></p>
            </div>
        `).join('');
    }
}

function addToCart(id) {
    const p = products.find(prod => prod.id === id);
    cart.push(p);
    updateHeaderCounters();
    renderCartModal();
}

function addToWishlist(id) {
    const p = products.find(prod => prod.id === id);
    if (!wishlist.some(w => w.id === id)) wishlist.push(p);
    updateHeaderCounters();
    renderWishlistModal();
}

function updateHeaderCounters() {
    document.getElementById('cartCount').innerText = cart.length;
    document.getElementById('wishlistCount').innerText = wishlist.length;
    
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const deliveryFee = cart.length > 0 ? Number(document.getElementById('deliveryArea').value) : 0;
    const grandTotal = subtotal + deliveryFee;

    document.getElementById('cartTotal').innerText = `৳${grandTotal}`;
    document.getElementById('cartSubtotal').innerText = `৳${subtotal}`;
    document.getElementById('deliveryChargeText').innerText = `৳${deliveryFee}`;
    document.getElementById('cartModalTotal').innerText = `৳${grandTotal}`;
}

function renderCartModal() {
    const container = document.getElementById('cartItemsList');
    if (cart.length === 0) {
        container.innerHTML = "<p style='color:#777; text-align:center;'>Your cart is empty.</p>";
    } else {
        container.innerHTML = cart.map((item, idx) => `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid #eee; padding-bottom:4px;">
                <span style="font-size:13px;">${item.name}</span>
                <span style="font-size:13px; font-weight:bold;">৳${item.price} <button onclick="removeFromCart(${idx})" style="color:red; background:none; border:none; cursor:pointer; margin-left:5px; font-size:15px;">&times;</button></span>
            </div>
        `).join('');
    }
    updateHeaderCounters();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateHeaderCounters();
    renderCartModal();
}

function renderWishlistModal() {
    const container = document.getElementById('wishlistItemsList');
    container.innerHTML = wishlist.map((item, idx) => `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px; align-items:center;">
            <span style="font-size:13px;">${item.name} (৳${item.price})</span>
            <button onclick="addToCart(${item.id})" style="background:#1a365d; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px;">Add Cart</button>
        </div>
    `).join('');
}

function handleOrderConfirm(e) {
    e.preventDefault();
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    
    const name = document.getElementById('custName').value;
    const phone = document.getElementById('custPhone').value;
    const address = document.getElementById('custAddress').value;
    const deliveryAreaSelect = document.getElementById('deliveryArea');
    const areaText = deliveryAreaSelect.options[deliveryAreaSelect.selectedIndex].text;
    
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const deliveryFee = Number(deliveryAreaSelect.value);
    const totalAmount = subtotal + deliveryFee;

    const newOrder = {
        id: Math.floor(100000 + Math.random() * 900000),
        name: name,
        phone: phone,
        address: address,
        items: [...cart],
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: totalAmount,
        status: "Processing",
        date: new Date().toLocaleDateString()
    };

    orders.unshift(newOrder);
    localStorage.setItem('store_orders', JSON.stringify(orders));

    renderAdminOrdersList();
    renderAdminAnalytics();
    generateInvoiceSlip(newOrder, areaText);

    cart = [];
    updateHeaderCounters();
    renderCartModal();
    closeModal('cartModal');
    document.getElementById('orderForm').reset();
    openModal('invoiceModal');
}

function generateInvoiceSlip(order, areaText) {
    const container = document.getElementById('invoiceDetails');
    container.innerHTML = `
        <p><strong>Order ID:</strong> #${order.id}</p>
        <p><strong>Date:</strong> ${order.date}</p>
        <p><strong>Customer Name:</strong> ${order.name}</p>
        <p><strong>Phone:</strong> ${order.phone}</p>
        <p><strong>Address:</strong> ${order.address}</p>
        <p><strong>Delivery Zone:</strong> ${areaText}</p>
        <hr style="margin: 10px 0; border-top: 1px solid #ccc;">
        <p><strong>Items Ordered:</strong></p>
        ${order.items.map(i => `<div style="display:flex; justify-content:space-between; font-size:12px;"><span>- ${i.name}</span><span>৳${i.price}</span></div>`).join('')}
        <hr style="margin: 10px 0; border-top: 1px dashed #333;">
        <p style="display:flex; justify-content:space-between;"><span>Subtotal:</span> <span>৳${order.subtotal}</span></p>
        <p style="display:flex; justify-content:space-between;"><span>Delivery Fee:</span> <span>৳${order.deliveryFee}</span></p>
        <h4 style="display:flex; justify-content:space-between; color:#1a365d; margin-top:5px;"><span>Grand Total:</span> <span>৳${order.total}</span></h4>
    `;
}

function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }

let isLoginMode = true;
function openAuthModal() { openModal('authModal'); }

function switchAuthTab(type) {
    isLoginMode = (type === 'login');
    document.getElementById('loginTabBtn').classList.toggle('active', isLoginMode);
    document.getElementById('regTabBtn').classList.toggle('active', !isLoginMode);
    
    document.getElementById('regNameInput').style.display = isLoginMode ? 'none' : 'block';
    document.getElementById('regNameInput').required = !isLoginMode;
    
    document.getElementById('authSubmitBtn').innerText = isLoginMode ? 'Login' : 'Register';
}

function handleAuthSubmit(e) {
    e.preventDefault();
    const phone = document.getElementById('authPhone').value;
    const name = document.getElementById('regNameInput').value;
    
    document.getElementById('userLabel').innerText = isLoginMode ? phone : name;
    closeModal('authModal');
    alert(isLoginMode ? "Login successful!" : `Welcome ${name}, registration successful!`);
}

function openAdminPassModal() {
    closeModal('authModal');
    openModal('adminPassModal');
}

function verifyAdminPin() {
    const pin = document.getElementById('adminPinInput').value;
    if(pin === '239855') {
        closeModal('adminPassModal');
        openModal('adminPanelModal');
        renderAdminProductList();
        renderAdminBannerList();
        renderAdminOrdersList();
        renderAdminAnalytics();
    } else {
        alert('Incorrect Admin Password!');
    }
}

function switchAdminTab(tabId, ev) {
    document.querySelectorAll('.admin-tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-tabs button').forEach(b => b.classList.remove('active'));
    const targetTab = document.getElementById('admin' + tabId.charAt(0).toUpperCase() + tabId.slice(1));
    if (targetTab) targetTab.classList.add('active');
    if (ev && ev.target) ev.target.classList.add('active');
}

function renderAdminAnalytics() {
    const totalRev = orders.reduce((sum, o) => sum + o.total, 0);
    document.getElementById('statTotalProducts').innerText = products.length;
    document.getElementById('statTotalOrders').innerText = orders.length;
    document.getElementById('statRevenue').innerText = `৳${totalRev}`;
    document.getElementById('statReviews').innerText = reviews.length;

    const list = document.getElementById('analyticsSummaryList');
    if(list) {
        list.innerHTML = `
            <li>Total Active Products in Catalog: <strong>${products.length}</strong> across 40 Categories.</li>
            <li>Processing Orders: <strong>${orders.filter(o => o.status === 'Processing').length}</strong></li>
            <li>Delivered Orders: <strong>${orders.filter(o => o.status === 'Delivered').length}</strong></li>
            <li>Photo-Verified Customer Reviews: <strong>${reviews.filter(r => r.images && r.images.length > 0).length}</strong></li>
        `;
    }
}

function renderAdminOrdersList() {
    const container = document.getElementById('adminOrdersList');
    if (!container) return;
    if (orders.length === 0) {
        container.innerHTML = "<p style='color:#777;'>No orders placed yet.</p>";
        return;
    }
    container.innerHTML = orders.map(o => `
        <div style="border:1px solid #e2e8f0; padding:10px; border-radius:6px; margin-bottom:10px; background:#f8fafc;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong>Order #${o.id} - ${o.name}</strong>
                <span style="font-size:12px; font-weight:bold; color:#1a365d;">৳${o.total}</span>
            </div>
            <p style="font-size:12px; color:#555; margin-top:4px;">Phone: ${o.phone} | Address: ${o.address || 'N/A'}</p>
            <div style="margin-top:8px; display:flex; align-items:center; gap:8px;">
                <span style="font-size:12px;">Status: <strong>${o.status}</strong></span>
                <select onchange="updateOrderStatus(${o.id}, this.value)" style="padding:4px 8px; font-size:12px;">
                    <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                    <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                </select>
            </div>
        </div>
    `).join('');
}

function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        localStorage.setItem('store_orders', JSON.stringify(orders));
        renderAdminOrdersList();
        renderAdminAnalytics();
    }
}

function convertFileToBase64(fileInput, callback) {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) { callback(e.target.result); };
    reader.readAsDataURL(file);
}

function handleAddProduct(e) {
    e.preventDefault();
    const fileInput = document.getElementById('pImgFile');
    const isFeaturedChecked = document.getElementById('pIsFeatured').checked;
    
    convertFileToBase64(fileInput, (base64Img) => {
        const newProd = {
            id: Date.now(),
            name: document.getElementById('pName').value,
            price: Number(document.getElementById('pPrice').value),
            img: base64Img,
            category: document.getElementById('pCat').value,
            size: document.getElementById('pSize').value,
            desc: document.getElementById('pDesc').value,
            isFeatured: isFeaturedChecked
        };
        products.push(newProd);
        localStorage.setItem('store_products', JSON.stringify(products));
        renderProducts();
        renderAdminProductList();
        renderAdminAnalytics();
        alert("Product added successfully!");
        e.target.reset();
    });
}

function renderAdminProductList() {
    const container = document.getElementById('adminProductList');
    if(!container) return;
    container.innerHTML = products.map(p => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; border-bottom:1px solid #ddd;">
            <div>
                <strong>${p.name}</strong> (${p.category}) - ৳${p.price}
                <br><span style="font-size:11px; color:${p.isFeatured ? 'green' : 'gray'};">${p.isFeatured ? '⭐ Featured' : 'Not Featured'}</span>
            </div>
            <div style="display:flex; gap:8px;">
                <button onclick="toggleFeature(${p.id})" style="background:${p.isFeatured ? '#f39c12' : '#27ae60'}; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">
                    ${p.isFeatured ? 'Remove Featured' : 'Make Featured'}
                </button>
                <button onclick="deleteProduct(${p.id})" style="background:red; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">Delete</button>
            </div>
        </div>
    `).join('');
}

function toggleFeature(id) {
    const p = products.find(prod => prod.id === id);
    if(p) {
        p.isFeatured = !p.isFeatured;
        localStorage.setItem('store_products', JSON.stringify(products));
        renderProducts();
        renderAdminProductList();
    }
}

function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    localStorage.setItem('store_products', JSON.stringify(products));
    renderProducts();
    renderAdminProductList();
    renderAdminAnalytics();
}

function handleAddBanner(e) {
    e.preventDefault();
    const fileInput = document.getElementById('bImgFile');

    convertFileToBase64(fileInput, (base64Img) => {
        banners.push(base64Img);
        localStorage.setItem('store_banners', JSON.stringify(banners));
        renderBanners();
        renderAdminBannerList();
        startSlider();
        alert("Banner slide added successfully!");
        e.target.reset();
    });
}

function renderAdminBannerList() {
    const container = document.getElementById('bannerListAdmin');
    if(!container) return;
    container.innerHTML = banners.map((b, idx) => `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
            <span style="font-size:12px;">Banner #${idx + 1}</span>
            <button onclick="deleteBanner(${idx})" style="color:red; border:none; background:none; cursor:pointer; font-weight:bold;">Delete</button>
        </div>
    `).join('');
}

function deleteBanner(idx) {
    banners.splice(idx, 1);
    localStorage.setItem('store_banners', JSON.stringify(banners));
    renderBanners();
    renderAdminBannerList();
    startSlider();
}

function handleUpdateLogo(e) {
    e.preventDefault();
    const fileInput = document.getElementById('logoFile');

    convertFileToBase64(fileInput, (base64Img) => {
        siteLogo = base64Img;
        localStorage.setItem('site_logo', siteLogo);
        renderLogo();
        alert("Website logo updated successfully!");
        e.target.reset();
    });
}

function handleRemoveLogo() {
    siteLogo = "";
    localStorage.removeItem('site_logo');
    renderLogo();
    alert("Logo removed.");
}