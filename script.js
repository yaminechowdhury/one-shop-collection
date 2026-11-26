const CLOUDINARY_CLOUD_NAME = "go4lgpen";
const CLOUDINARY_UPLOAD_PRESET = "oneshop_unsigned";

const SUPABASE_URL = "https://eqeascdqnzjwqaghmccp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxZWFzY2Rxbnpqd3FhZ2htY2NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU2MjcyMzksImV4cCI6MjExMTIwMzIzOX0.hUJtTuTBsxxxlZxkIbpHSqp5W2cchhX_yEa4mDvHWEI";

const EMAILJS_PUBLIC_KEY = "";
const EMAILJS_SERVICE_ID = "";
const EMAILJS_TEMPLATE_ID = "";

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

const SIZE_PRESETS = {
    letter: ["S", "M", "L", "XL", "XXL"],
    waist: ["28", "30", "32", "34", "36", "38"],
    free: ["Free Size"],
    none: ["No Size"]
};

const defaultBanners = [
    "https://picsum.photos/1200/420?random=10",
    "https://picsum.photos/1200/420?random=11",
    "https://picsum.photos/1200/420?random=12"
];

const placeholderSlotImg = "https://via.placeholder.com/120x120?text=Select+Item";

const starterProducts = [
    { id: 1, name: "Casual Denim Shirt", price: 1200, category: "Shirt", size: "M, L, XL", description: "100% pure cotton shirt", img: "https://picsum.photos/300/300?random=1", is_featured: true, is_stock_out: false },
    { id: 2, name: "Premium Polo T-Shirt", price: 650, category: "T Shirt", size: "L, XL", description: "Comfortable daily wear", img: "https://picsum.photos/300/300?random=2", is_featured: true, is_stock_out: false },
    { id: 3, name: "Slim Fit Jeans", price: 1500, category: "Jeans", size: "30, 32, 34", description: "Stretchable denim", img: "https://picsum.photos/300/300?random=3", is_featured: true, is_stock_out: false },
    { id: 4, name: "Katan Saree", price: 3500, category: "Saree", size: "Free Size", description: "Traditional party wear", img: "https://picsum.photos/300/300?random=4", is_featured: true, is_stock_out: false },
    { id: 5, name: "Classic Chronograph Watch", price: 1850, category: "Men's Watch", size: "No Size", description: "Water-resistant everyday timepiece", img: "https://picsum.photos/300/300?random=5", is_featured: false, is_stock_out: false },
    { id: 6, name: "Festival Combo Pack", price: 2290, category: "Combo Pack", size: "M, L, XL", description: "Shirt + Belt + Wallet combo offer", img: "https://picsum.photos/300/300?random=6", is_featured: false, is_stock_out: false }
];

function normalizeProduct(row) {
    return {
        id: Number(row.id),
        name: row.name,
        price: Number(row.price),
        category: row.category,
        size: row.size || "No Size",
        desc: row.description ?? row.desc ?? "",
        img: row.img,
        isFeatured: Boolean(row.is_featured ?? row.isFeatured),
        isStockOut: Boolean(row.is_stock_out ?? row.isStockOut)
    };
}

function toDbProduct(prod) {
    return {
        id: Number(prod.id),
        name: prod.name,
        price: Number(prod.price),
        category: prod.category,
        size: prod.size || "No Size",
        description: prod.desc ?? prod.description ?? "",
        img: prod.img,
        is_featured: Boolean(prod.isFeatured ?? prod.is_featured),
        is_stock_out: Boolean(prod.isStockOut ?? prod.is_stock_out)
    };
}

async function sbRequest(path, options = {}) {
    const url = `${SUPABASE_URL}/rest/v1/${path}`;
    const headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        ...(options.headers || {})
    };
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Supabase error ${res.status}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

function readOrdersFromStorage() {
    try {
        return JSON.parse(localStorage.getItem('store_orders')) || [];
    } catch (_) {
        return [];
    }
}

let products = (JSON.parse(localStorage.getItem('store_products')) || starterProducts).map(normalizeProduct);
let banners = JSON.parse(localStorage.getItem('store_banners')) || [...defaultBanners];
let reviews = JSON.parse(localStorage.getItem('store_reviews')) || [
    { name: "Tanvir Ahmed", comment: "Fabric quality was top notch! Highly recommended.", fit: "True to Size", images: ["https://picsum.photos/200/200?random=20"] },
    { name: "Nusrat Jahan", comment: "Saree fabric is really smooth and gorgeous.", fit: "True to Size", images: [] }
];

let orders = readOrdersFromStorage();
let siteLogo = localStorage.getItem('site_logo') || "";

let cart = [];
let wishlist = [];
let selectedProductIds = new Set();
let slideIndex = 0;
let slideInterval;
let activeCombo = null;
let currentStylePersona = "men";
let editingProductId = null;

function safeSaveStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (err) {
        alert("ব্রাউজারের স্টোরেজ (LocalStorage) প্রায় ভরে গেছে!");
        return false;
    }
}

function showSyncNotice(msg, isError = false) {
    console[isError ? "error" : "log"]("[Supabase Sync]:", msg);
    const footerP = document.querySelector(".main-footer > p");
    if (footerP) {
        footerP.innerHTML = `&copy; 2026 One Shop Collection. All Rights Reserved. | <span style="color:${isError ? '#f87171' : '#4ade80'}; font-weight:600;">${msg}</span>`;
    }
}

async function syncFromSupabase() {
    try {
        showSyncNotice("Syncing with Supabase...");
        const [dbProds, dbBanners] = await Promise.all([
            sbRequest("products?select=*&order=id.asc"),
            sbRequest("banners?select=*&order=id.asc")
        ]);

        if (Array.isArray(dbProds) && dbProds.length > 0) {
            products = dbProds.map(normalizeProduct);
            safeSaveStorage('store_products', products);
        } else if (products.length > 0) {
            await sbRequest("products?on_conflict=id", {
                method: "POST",
                headers: { "Prefer": "resolution=merge-duplicates,return=minimal" },
                body: JSON.stringify(products.map(toDbProduct))
            });
        }

        if (Array.isArray(dbBanners) && dbBanners.length > 0) {
            banners = dbBanners.map(b => b.img);
            safeSaveStorage('store_banners', banners);
        } else if (banners.length > 0) {
            const payload = banners.map((url, i) => ({ id: Date.now() + i, img: url }));
            await sbRequest("banners?on_conflict=id", {
                method: "POST",
                headers: { "Prefer": "resolution=merge-duplicates,return=minimal" },
                body: JSON.stringify(payload)
            });
        }

        renderProducts();
        renderBanners();
        startSlider();
        renderAdminProductList();
        renderAdminBannerList();
        renderAdminAnalytics();
        showSyncNotice(`Supabase Connected (${products.length} products, ${banners.length} banners)`);
    } catch (err) {
        showSyncNotice(`Supabase Sync Error: ${err.message}`, true);
    }
}

function detectSizeGroup(sizeStr) {
    const clean = (sizeStr || "").trim().toLowerCase();
    if (!clean || clean === "no size" || clean === "none" || clean.includes("no size")) {
        return "none";
    }
    if (clean === "free size" || clean === "free" || clean.includes("free size")) {
        return "free";
    }
    const parts = clean.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.some(p => SIZE_PRESETS.waist.includes(p))) {
        return "waist";
    }
    return "letter";
}

function buildSizePickerUI(prefix, initialSizeStr = "S, M, L, XL, XXL") {
    const group = detectSizeGroup(initialSizeStr);
    const activeSet = new Set(
        (initialSizeStr || "")
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
    );

    return `
        <div id="${prefix}_sizePickerBox" style="border:1px solid #cbd5e1; border-radius:6px; padding:10px; background:#f8fafc; margin:6px 0;">
            <label style="font-size:12px; font-weight:700; color:#1e293b; display:block; margin-bottom:6px;">Size Option:</label>
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px;">
                <button type="button" id="${prefix}_grp_letter" onclick="switchSizePickerGroup('${prefix}', 'letter')" style="padding:5px 9px; font-size:11px; border-radius:4px; border:1px solid #2563eb; cursor:pointer; background:${group === 'letter' ? '#2563eb' : '#fff'}; color:${group === 'letter' ? '#fff' : '#2563eb'}; font-weight:600;">S, M, L, XL, XXL</button>
                <button type="button" id="${prefix}_grp_waist" onclick="switchSizePickerGroup('${prefix}', 'waist')" style="padding:5px 9px; font-size:11px; border-radius:4px; border:1px solid #2563eb; cursor:pointer; background:${group === 'waist' ? '#2563eb' : '#fff'}; color:${group === 'waist' ? '#fff' : '#2563eb'}; font-weight:600;">28, 30, 32, 34, 36, 38</button>
                <button type="button" id="${prefix}_grp_free" onclick="switchSizePickerGroup('${prefix}', 'free')" style="padding:5px 9px; font-size:11px; border-radius:4px; border:1px solid #059669; cursor:pointer; background:${group === 'free' ? '#059669' : '#fff'}; color:${group === 'free' ? '#fff' : '#059669'}; font-weight:600;">Free Size</button>
                <button type="button" id="${prefix}_grp_none" onclick="switchSizePickerGroup('${prefix}', 'none')" style="padding:5px 9px; font-size:11px; border-radius:4px; border:1px solid #64748b; cursor:pointer; background:${group === 'none' ? '#475569' : '#fff'}; color:${group === 'none' ? '#fff' : '#334155'}; font-weight:600;">No Size</button>
            </div>
            <div id="${prefix}_sizeChecks" style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
                ${renderSizeCheckboxesHtml(prefix, group, activeSet)}
            </div>
            <input type="hidden" id="${prefix}_sizeGroupVal" value="${group}">
        </div>
    `;
}

function renderSizeCheckboxesHtml(prefix, group, checkedSet = null) {
    if (group === "none") {
        return `<span style="font-size:12px; color:#475569; font-weight:600;">No Size সিলেক্ট করা আছে — কোনো সাইজ বা অপশন থাকবে না।</span>`;
    }
    if (group === "free") {
        return `<span style="font-size:12px; color:#047857; font-weight:600;">Free Size সিলেক্ট করা আছে — কাস্টমারের কাছে কোনো সাইজ সিলেক্টর দেখাবে না।</span>`;
    }
    const list = group === "waist" ? SIZE_PRESETS.waist : SIZE_PRESETS.letter;
    return list.map(sz => {
        const isChecked = checkedSet ? checkedSet.has(sz) : true;
        return `
            <label style="display:inline-flex; align-items:center; gap:4px; font-size:12px; background:#fff; border:1px solid #cbd5e1; padding:3px 8px; border-radius:4px; cursor:pointer;">
                <input type="checkbox" class="${prefix}_sz_cb" value="${sz}" ${isChecked ? 'checked' : ''}>
                <span>${sz}</span>
            </label>
        `;
    }).join('');
}

function switchSizePickerGroup(prefix, group) {
    const grpValEl = document.getElementById(`${prefix}_sizeGroupVal`);
    const checksEl = document.getElementById(`${prefix}_sizeChecks`);
    if (grpValEl) grpValEl.value = group;

    const btnLetter = document.getElementById(`${prefix}_grp_letter`);
    const btnWaist = document.getElementById(`${prefix}_grp_waist`);
    const btnFree = document.getElementById(`${prefix}_grp_free`);
    const btnNone = document.getElementById(`${prefix}_grp_none`);

    if (btnLetter) {
        btnLetter.style.background = group === "letter" ? "#2563eb" : "#fff";
        btnLetter.style.color = group === "letter" ? "#fff" : "#2563eb";
    }
    if (btnWaist) {
        btnWaist.style.background = group === "waist" ? "#2563eb" : "#fff";
        btnWaist.style.color = group === "waist" ? "#fff" : "#2563eb";
    }
    if (btnFree) {
        btnFree.style.background = group === "free" ? "#059669" : "#fff";
        btnFree.style.color = group === "free" ? "#fff" : "#059669";
    }
    if (btnNone) {
        btnNone.style.background = group === "none" ? "#475569" : "#fff";
        btnNone.style.color = group === "none" ? "#fff" : "#334155";
    }

    if (checksEl) {
        checksEl.innerHTML = renderSizeCheckboxesHtml(prefix, group, null);
    }
}

function getSelectedSizeFromPicker(prefix) {
    const grpValEl = document.getElementById(`${prefix}_sizeGroupVal`);
    const group = grpValEl ? grpValEl.value : "none";
    if (group === "none") return "No Size";
    if (group === "free") return "Free Size";

    const checked = Array.from(document.querySelectorAll(`.${prefix}_sz_cb:checked`)).map(cb => cb.value.trim());
    if (checked.length === 0) {
        const fallbackList = group === "waist" ? SIZE_PRESETS.waist : SIZE_PRESETS.letter;
        return fallbackList.join(", ");
    }
    return checked.join(", ");
}

function injectAddProductSizePicker() {
    const pSizeEl = document.getElementById('pSize');
    if (!pSizeEl) return;
    if (document.getElementById('addProd_sizePickerBox')) return;

    const container = document.createElement('div');
    container.innerHTML = buildSizePickerUI('addProd', pSizeEl.value || "S, M, L, XL, XXL");
    pSizeEl.style.display = "none";
    pSizeEl.parentNode.insertBefore(container.firstElementChild, pSizeEl.nextSibling);
}

function bindAddProductFormDirectly() {
    const pNameEl = document.getElementById('pName');
    const formEl = pNameEl?.closest('form') || document.querySelector('#adminAddProduct form');
    if (formEl && !formEl.dataset.boundSaveProduct) {
        formEl.dataset.boundSaveProduct = "1";
        formEl.addEventListener("submit", handleAddProduct);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    injectAddProductSizePicker();
    bindAddProductFormDirectly();
    renderLogo();
    renderBanners();
    renderProducts();
    renderReviews();
    setupComboDropdowns();
    updateLookCard();
    renderAdminOrdersList();
    renderAdminAnalytics();
    startSlider();
    syncFromSupabase();

    document.addEventListener('click', (e) => {
        const popup = document.getElementById('categoryPopup');
        const menuBtn = document.getElementById('categoryMenuBtn');
        if (popup && popup.classList.contains('show')) {
            if (!popup.contains(e.target) && (!menuBtn || !menuBtn.contains(e.target))) {
                closeCategoryPopup();
            }
        }

        const btn = e.target.closest("button");
        if (btn) {
            const txt = (btn.innerText || "").trim().toLowerCase();
            if (txt === "save product") {
                const formEl = btn.closest("form") || document.getElementById('pName')?.closest('form');
                if (!formEl || btn.type !== "submit") {
                    e.preventDefault();
                    handleAddProduct(e);
                }
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
    if (shopTitle) shopTitle.style.display = "block";

    if (logoImg) {
        if (siteLogo && siteLogo.trim() !== "") {
            logoImg.src = siteLogo;
            logoImg.style.display = "block";
        } else {
            logoImg.style.display = "none";
        }
    }
}

function renderBanners() {
    const wrapper = document.getElementById('sliderWrapper');
    if (wrapper) {
        if (!banners || banners.length === 0) {
            banners = [...defaultBanners];
        }
        wrapper.innerHTML = banners.map(url => `<img src="${url}" alt="Store Banner">`).join('');
        slideIndex = 0;
        wrapper.style.transform = `translateX(0%)`;
    }
}

function startSlider() {
    clearInterval(slideInterval);
    if (banners.length > 0) {
        slideInterval = setInterval(() => {
            slideIndex = (slideIndex + 1) % banners.length;
            const wrapper = document.getElementById('sliderWrapper');
            if (wrapper) wrapper.style.transform = `translateX(-${slideIndex * 100}%)`;
        }, 2500);
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
    document.getElementById('categoryPopup')?.classList.toggle('show');
}

function openCategoryPopupFromPage() {
    document.getElementById('categoryPopup')?.classList.add('show');
}

function closeCategoryPopup() {
    const popup = document.getElementById('categoryPopup');
    if (popup) popup.classList.remove('show');
}

function filterCategory(catName) {
    showView('category');
    const titleEl = document.getElementById('categoryTitle');
    if (titleEl) titleEl.innerText = "Category: " + catName;
    const filtered = products.filter(p => p.category.toLowerCase() === catName.toLowerCase());
    renderGrid('categoryGrid', filtered);
}

function handleSearch() {
    const query = (document.getElementById('searchInput')?.value || "").toLowerCase();
    showView('category');
    const titleEl = document.getElementById('categoryTitle');
    if (titleEl) titleEl.innerText = `Search Results: "${query}"`;
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

function isFreeSizeValue(sizeStr) {
    const clean = (sizeStr || "").trim().toLowerCase();
    return clean === "free size" || clean === "free" || clean.includes("free size");
}

function isNoSizeValue(sizeStr) {
    const clean = (sizeStr || "").trim().toLowerCase();
    return !clean || clean === "no size" || clean === "none" || clean.includes("no size");
}

function renderGrid(containerId, list) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (list.length === 0) {
        container.innerHTML = "<p>No products found in this category yet.</p>";
        return;
    }

    container.innerHTML = list.map(p => {
        const noSize = isNoSizeValue(p.size);
        const freeSize = isFreeSizeValue(p.size);
        const sizeChoices = (!noSize && !freeSize)
            ? p.size.split(',').map(s => s.trim()).filter(Boolean)
            : [];
        const isStockOut = Boolean(p.isStockOut);

        let sizeSelectorHtml = "";
        if (!noSize && !freeSize && sizeChoices.length > 0) {
            sizeSelectorHtml = `
                <div style="margin:6px 0;">
                    <label style="font-size:11px; font-weight:600; color:#334155;">Size:</label>
                    <select id="cardSize_${containerId}_${p.id}" ${isStockOut ? 'disabled' : ''} style="width:100%; padding:4px 6px; font-size:12px; border:1px solid #cbd5e1; border-radius:4px; margin-top:2px;">
                        ${sizeChoices.map(sz => `<option value="${sz}">${sz}</option>`).join('')}
                    </select>
                </div>
            `;
        }

        return `
            <div class="product-card" style="position:relative;">
                ${isStockOut ? `<span style="position:absolute; top:8px; right:8px; background:#dc2626; color:#fff; font-size:11px; font-weight:bold; padding:3px 8px; border-radius:999px; z-index:2;">Stock Out</span>` : ''}
                <img src="${p.img}" alt="${p.name}" style="${isStockOut ? 'opacity:0.55; filter:grayscale(35%);' : ''}">
                <h3>${p.name}</h3>
                <div class="price">৳${p.price}</div>
                <div class="details">${p.desc}</div>
                ${sizeSelectorHtml}
                <div class="card-actions">
                    <button class="btn-add-cart" ${isStockOut ? 'disabled style="background:#94a3b8; cursor:not-allowed;"' : `onclick="addToCart(${p.id}, '${containerId}')"`}>
                        ${isStockOut ? 'Stock Out' : 'Add to Cart'}
                    </button>
                    <button class="btn-wishlist" onclick="addToWishlist(${p.id})"><i class="fa-solid fa-heart"></i></button>
                </div>
            </div>
        `;
    }).join('');
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
    if (!sel1 || !sel2 || !sel3) return;

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


function calculateComboTotal() {
    const id1 = Number(document.getElementById('comboItem1')?.value);
    const id2 = Number(document.getElementById('comboItem2')?.value);
    const id3 = Number(document.getElementById('comboItem3')?.value);

    if (!id1 || !id2 || !id3) {
        const sumEl = document.getElementById('comboSummaryText');
        const origEl = document.getElementById('comboOrigPrice');
        const discEl = document.getElementById('comboDiscPrice');
        if (sumEl) sumEl.innerText = "Select 3 items to build your custom outfit.";
        if (origEl) origEl.innerText = "৳0";
        if (discEl) discEl.innerText = "৳0";
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
        price: discTotal,
        selectedSize: ""
    };

    document.getElementById('comboSummaryText').innerText = `${p1.name} + ${p2.name} + ${p3.name}`;
    document.getElementById('comboOrigPrice').innerText = `৳${origTotal}`;
    document.getElementById('comboDiscPrice').innerText = `৳${discTotal}`;
}

function addComboToCart() {
    if (!activeCombo) {
        alert("Please select all 3 items to build your combo first!");
        return;
    }
    cart.push({
        id: Date.now(),
        name: activeCombo.name,
        price: activeCombo.price,
        selectedSize: ""
    });
    updateHeaderCounters();
    renderCartModal();
    alert("Combo package added to your cart with 10% Discount!");
}

function renderReviews() {
    const container = document.getElementById('reviewsContainer');
    const photoOnly = document.getElementById('photoOnlyCheck')?.checked || false;
    if (!container) return;

    let displayReviews = reviews;
    if (photoOnly) {
        displayReviews = reviews.filter(r => r.images && r.images.length > 0);
    }

    if (displayReviews.length === 0) {
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
        safeSaveStorage('store_reviews', reviews);
        renderReviews();
        renderAdminAnalytics();
        closeModal('addReviewModal');
        alert("Review submitted successfully!");
        e.target.reset();
    });
}

function handleTrackOrder() {
    orders = readOrdersFromStorage();
    const phone = (document.getElementById('trackPhoneInput')?.value || "").trim();
    const resultBox = document.getElementById('trackResult');
    if (!resultBox) return;

    if (!phone) {
        resultBox.innerHTML = "<p style='color:red;'>Please enter a phone number.</p>";
        return;
    }

    const userOrders = orders.filter(o => String(o.phone).trim() === phone);
    if (userOrders.length === 0) {
        resultBox.innerHTML = "<p style='color:#777;'>No orders found with this phone number.</p>";
    } else {
        resultBox.innerHTML = userOrders.map(o => `
            <div style="background:#f1f2f6; padding:15px; border-radius:6px; margin-bottom:10px;">
                <p><strong>Order ID:</strong> #${o.id}</p>
                <p><strong>Customer Name:</strong> ${o.name}</p>
                <p><strong>Address:</strong> ${o.address || 'N/A'}</p>
                <p><strong>Total Amount:</strong> ৳${o.total}</p>
                <p><strong>Status:</strong> <span style="color:${o.status === 'Cancelled' ? 'red' : 'green'}; font-weight:bold;">${o.status}</span></p>
            </div>
        `).join('');
    }
}

function addToCart(id, containerId = "") {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    if (p.isStockOut) {
        alert("এই প্রোডাক্টটি বর্তমানে Stock Out রয়েছে।");
        return;
    }

    let chosenSize = "";
    if (!isNoSizeValue(p.size)) {
        if (isFreeSizeValue(p.size)) {
            chosenSize = "Free Size";
        } else {
            const selEl = containerId ? document.getElementById(`cardSize_${containerId}_${id}`) : null;
            chosenSize = selEl ? selEl.value : (p.size.split(',')[0]?.trim() || "");
        }
    }

    cart.push({
        id: p.id,
        name: p.name,
        price: p.price,
        selectedSize: chosenSize
    });
    updateHeaderCounters();
    renderCartModal();
}

function addToWishlist(id) {
    const p = products.find(prod => prod.id === id);
    if (p && !wishlist.some(w => w.id === id)) wishlist.push(p);
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
    if (!container) return;
    if (cart.length === 0) {
        container.innerHTML = "<p style='color:#777; text-align:center;'>Your cart is empty.</p>";
    } else {
        container.innerHTML = cart.map((item, idx) => `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid #eee; padding-bottom:4px;">
                <span style="font-size:13px;">${item.name}${item.selectedSize ? ` <strong style="color:#1d4ed8;">(${item.selectedSize})</strong>` : ''}</span>
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
    if (!container) return;
    container.innerHTML = wishlist.map(item => `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px; align-items:center;">
            <span style="font-size:13px;">${item.name} (৳${item.price})</span>
            <button onclick="addToCart(${item.id})" style="background:#1a365d; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px;">Add Cart</button>
        </div>
    `).join('');
}

async function sendOrderEmailAlert(order, areaText) {
    if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) return;
    try {
        await fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                service_id: EMAILJS_SERVICE_ID,
                template_id: EMAILJS_TEMPLATE_ID,
                user_id: EMAILJS_PUBLIC_KEY,
                template_params: {
                    order_id: `#${order.id}`,
                    customer_name: order.name,
                    phone: order.phone,
                    address: order.address,
                    delivery_zone: areaText,
                    items: order.items.map(i => `${i.name}${i.selectedSize ? ` (${i.selectedSize})` : ''} - ৳${i.price}`).join(", "),
                    total: `৳${order.total}`
                }
            })
        });
    } catch (err) {
        console.warn("Email alert failed:", err.message);
    }
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

    orders = readOrdersFromStorage();
    orders.unshift(newOrder);
    safeSaveStorage('store_orders', orders);
    sendOrderEmailAlert(newOrder, areaText);

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
        ${order.items.map(i => `<div style="display:flex; justify-content:space-between; font-size:12px;"><span>- ${i.name}${i.selectedSize ? ` (${i.selectedSize})` : ''}</span><span>৳${i.price}</span></div>`).join('')}
        <hr style="margin: 10px 0; border-top: 1px dashed #333;">
        <p style="display:flex; justify-content:space-between;"><span>Subtotal:</span> <span>৳${order.subtotal}</span></p>
        <p style="display:flex; justify-content:space-between;"><span>Delivery Fee:</span> <span>৳${order.deliveryFee}</span></p>
        <h4 style="display:flex; justify-content:space-between; color:#1a365d; margin-top:5px;"><span>Grand Total:</span> <span>৳${order.total}</span></h4>
    `;
}

function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('show');
    el.style.display = "flex";
    el.style.zIndex = "99999";
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('show');
    el.style.display = "none";
}

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
    if (pin === '239855') {
        closeModal('adminPassModal');
        openModal('adminPanelModal');
        injectAddProductSizePicker();
        bindAddProductFormDirectly();
        renderAdminProductList();
        renderAdminBannerList();
        renderAdminOrdersList();
        renderAdminAnalytics();
        syncFromSupabase();
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
    if (tabId === 'addProduct') {
        injectAddProductSizePicker();
        bindAddProductFormDirectly();
    }
}

function renderAdminAnalytics() {
    orders = readOrdersFromStorage();
    const totalRev = orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0);
    document.getElementById('statTotalProducts').innerText = products.length;
    document.getElementById('statTotalOrders').innerText = orders.length;
    document.getElementById('statRevenue').innerText = `৳${totalRev}`;
    document.getElementById('statReviews').innerText = reviews.length;

    const list = document.getElementById('analyticsSummaryList');
    if (list) {
        list.innerHTML = `
            <li>Total Active Products in Catalog: <strong>${products.length}</strong> across 40 Categories.</li>
            <li>Stock Out Products: <strong>${products.filter(p => p.isStockOut).length}</strong></li>
            <li>Active Banners on Home Slider: <strong>${banners.length}</strong></li>
            <li>Processing Orders: <strong>${orders.filter(o => o.status === 'Processing').length}</strong> | Cancelled: <strong>${orders.filter(o => o.status === 'Cancelled').length}</strong></li>
        `;
    }
}

function renderAdminOrdersList() {
    orders = readOrdersFromStorage();
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
            <p style="font-size:11px; color:#475569; margin-top:4px;">
                <strong>Items:</strong> ${o.items.map(i => `${i.name}${i.selectedSize ? ` (${i.selectedSize})` : ''}`).join(', ')}
            </p>
            <div style="margin-top:8px; display:flex; align-items:center; gap:8px;">
                <span style="font-size:12px;">Status: <strong style="color:${o.status === 'Cancelled' ? '#dc2626' : '#16a34a'};">${o.status}</strong></span>
                <select onchange="updateOrderStatus(${o.id}, this.value)" style="padding:4px 8px; font-size:12px;">
                    <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                    <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </div>
        </div>
    `).join('');
}

function updateOrderStatus(orderId, newStatus) {
    orders = readOrdersFromStorage();
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        safeSaveStorage('store_orders', orders);
        renderAdminOrdersList();
        renderAdminAnalytics();
    }
}

async function uploadImageSmart(fileInput, maxWidth, maxHeight, quality) {
    const file = fileInput?.files?.[0];
    if (!file) {
        throw new Error("কোনো ছবি সিলেক্ট করা হয়নি।");
    }

    if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
        const response = await fetch(endpoint, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Cloudinary-তে ছবি আপলোড করা যায়নি।");
        }

        const result = await response.json();
        if (result && result.secure_url) {
            return result.secure_url;
        }
        throw new Error("Cloudinary থেকে বৈধ URL পাওয়া যায়নি।");
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL("image/jpeg", quality));
            };
            img.onerror = () => resolve(e.target.result);
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error("ফাইল পড়তে সমস্যা হয়েছে।"));
        reader.readAsDataURL(file);
    });
}

async function handleAddProduct(e) {
    if (e && typeof e.preventDefault === "function") {
        e.preventDefault();
    }

    const nameInput = document.getElementById('pName');
    const priceInput = document.getElementById('pPrice');
    const catInput = document.getElementById('pCat');
    const descInput = document.getElementById('pDesc');
    const fileInput = document.getElementById('pImgFile');
    const featInput = document.getElementById('pIsFeatured');

    const formEl =
        (e && e.target && e.target.tagName === "FORM")
            ? e.target
            : nameInput?.closest('form') || document.querySelector('#adminAddProduct form');

    const submitBtn =
        formEl?.querySelector('button[type="submit"]') ||
        formEl?.querySelector('button') ||
        document.querySelector('#adminAddProduct button');

    const nameVal = (nameInput?.value || "").trim();
    const priceVal = Number(priceInput?.value || 0);
    const catVal = catInput?.value || categoriesList[0] || "Shirt";
    const descVal = (descInput?.value || "").trim();
    const isFeaturedChecked = Boolean(featInput?.checked);

    if (!nameVal) {
        alert("Product Name লেখো ভাই!");
        nameInput?.focus();
        return;
    }
    if (!priceVal || priceVal <= 0) {
        alert("সঠিক Price লেখো!");
        priceInput?.focus();
        return;
    }
    if (!fileInput?.files?.[0]) {
        alert("আগে একটা ছবি সিলেক্ট করো!");
        return;
    }

    const prevText = submitBtn ? submitBtn.innerText : "Save Product";

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = "Uploading...";
        }

        const imgUrl = await uploadImageSmart(fileInput, 600, 600, 0.78);

        const chosenSizes = document.getElementById('addProd_sizePickerBox')
            ? getSelectedSizeFromPicker('addProd')
            : (document.getElementById('pSize')?.value || "No Size");

        const newProd = {
            id: Math.floor(Date.now() / 1000) * 1000 + Math.floor(Math.random() * 900),
            name: nameVal,
            price: priceVal,
            img: imgUrl,
            category: catVal,
            size: chosenSizes,
            desc: descVal,
            isFeatured: isFeaturedChecked,
            isStockOut: false
        };

        try {
            await sbRequest("products", {
                method: "POST",
                headers: { "Prefer": "return=minimal" },
                body: JSON.stringify(toDbProduct(newProd))
            });
            showSyncNotice("Product saved to Supabase!");
        } catch (sbErr) {
            console.warn("Supabase insert failed:", sbErr);
            showSyncNotice("Saved locally (Supabase error)", true);
            alert("প্রোডাক্ট লোকালি সেভ হয়েছে, কিন্তু Supabase-এ সমস্যা: " + (sbErr?.message || sbErr));
        }

        products.push(newProd);
        safeSaveStorage('store_products', products);
        renderProducts();
        renderAdminProductList();
        renderAdminAnalytics();

        alert("Product added successfully!");
        if (formEl) formEl.reset();
        if (document.getElementById('addProd_sizePickerBox')) {
            switchSizePickerGroup('addProd', 'letter');
        }
    } catch (err) {
        console.error("Add product failed:", err);
        alert("ছবি বা প্রোডাক্ট সেভ করতে সমস্যা হয়েছে: " + (err?.message || err));
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = prevText || "Save Product";
        }
    }
}

function updateSelectedCountLabel() {
    const countEl = document.getElementById('selectedProductCount');
    if (countEl) countEl.innerText = selectedProductIds.size;
}

function toggleProductSelection(id, checked) {
    if (checked) {
        selectedProductIds.add(id);
    } else {
        selectedProductIds.delete(id);
    }
    updateSelectedCountLabel();
}

function toggleSelectAllProducts(checked) {
    const searchVal = (document.getElementById('adminProdSearch')?.value || "").toLowerCase();
    const visibleList = products.filter(p =>
        p.name.toLowerCase().includes(searchVal) || p.category.toLowerCase().includes(searchVal)
    );
    if (checked) {
        visibleList.forEach(p => selectedProductIds.add(p.id));
    } else {
        visibleList.forEach(p => selectedProductIds.delete(p.id));
    }
    renderAdminProductList();
}

async function bulkToggleFeature(makeFeatured) {
    if (selectedProductIds.size === 0) {
        alert("আগে অন্তত ১টি প্রোডাক্ট সিলেক্ট করুন।");
        return;
    }
    const ids = Array.from(selectedProductIds);
    try {
        await sbRequest(`products?id=in.(${ids.join(",")})`, {
            method: "PATCH",
            headers: { "Prefer": "return=minimal" },
            body: JSON.stringify({ is_featured: makeFeatured })
        });
    } catch (err) {
        console.warn("Supabase bulk update warning:", err.message);
    }

    products = products.map(p => selectedProductIds.has(p.id) ? { ...p, isFeatured: makeFeatured } : p);
    safeSaveStorage('store_products', products);
    renderProducts();
    renderAdminProductList();
    alert(makeFeatured ? "সিলেক্ট করা প্রোডাক্টগুলো Featured করা হয়েছে।" : "সিলেক্ট করা প্রোডাক্টগুলো Featured থেকে সরানো হয়েছে।");
}

async function bulkDeleteProducts() {
    if (selectedProductIds.size === 0) {
        alert("আগে অন্তত ১টি প্রোডাক্ট সিলেক্ট করুন।");
        return;
    }
    if (!confirm(`আপনি কি ${selectedProductIds.size}টি প্রোডাক্ট একসাথে ডিলিট করতে চান?`)) {
        return;
    }
    const ids = Array.from(selectedProductIds);
    try {
        await sbRequest(`products?id=in.(${ids.join(",")})`, {
            method: "DELETE",
            headers: { "Prefer": "return=minimal" }
        });
    } catch (err) {
        console.warn("Supabase bulk delete warning:", err.message);
    }

    products = products.filter(p => !selectedProductIds.has(p.id));
    selectedProductIds.clear();
    safeSaveStorage('store_products', products);
    renderProducts();
    renderAdminProductList();
    renderAdminAnalytics();
    alert("সিলেক্ট করা প্রোডাক্টগুলো ডিলিট করা হয়েছে।");
}

function renderAdminProductList() {
    const container = document.getElementById('adminProductList');
    if (!container) return;

    const searchVal = (document.getElementById('adminProdSearch')?.value || "").toLowerCase();
    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchVal) || p.category.toLowerCase().includes(searchVal)
    );

    updateSelectedCountLabel();

    if (filtered.length === 0) {
        container.innerHTML = "<p style='color:#777; font-size:13px;'>No matching products found.</p>";
        return;
    }

    container.innerHTML = filtered.map(p => `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; padding:8px; border-bottom:1px solid #ddd; background:${p.isStockOut ? '#fef2f2' : 'transparent'};">
            <div style="display:flex; align-items:center; gap:10px;">
                <input type="checkbox" ${selectedProductIds.has(p.id) ? 'checked' : ''} onchange="toggleProductSelection(${p.id}, this.checked)" style="width:16px; height:16px; cursor:pointer;">
                <div>
                    <strong>${p.name}</strong> (${p.category}) - ৳${p.price}
                    <br><span style="font-size:11px; color:#475569;">Size Mode: ${p.size || 'No Size'}</span>
                    <br>
                    <span style="font-size:11px; color:${p.isFeatured ? 'green' : 'gray'}; margin-right:8px;">${p.isFeatured ? '⭐ Featured' : 'Not Featured'}</span>
                    <span style="font-size:11px; font-weight:bold; color:${p.isStockOut ? '#dc2626' : '#2563eb'};">${p.isStockOut ? 'Stock Out' : 'In Stock'}</span>
                </div>
            </div>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <button type="button" onclick="openEditProductModal(${p.id})" style="background:#2563eb; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">Edit</button>
                <button type="button" onclick="toggleStockOut(${p.id})" style="background:${p.isStockOut ? '#16a34a' : '#dc2626'}; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">
                    ${p.isStockOut ? 'In Stock' : 'Stock Out'}
                </button>
                <button type="button" onclick="toggleFeature(${p.id})" style="background:${p.isFeatured ? '#f39c12' : '#27ae60'}; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">
                    ${p.isFeatured ? 'Remove Featured' : 'Make Featured'}
                </button>
                <button type="button" onclick="deleteProduct(${p.id})" style="background:red; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">Delete</button>
            </div>
        </div>
    `).join('');
}

async function toggleStockOut(id) {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    const nextVal = !p.isStockOut;
    try {
        await sbRequest(`products?id=eq.${id}`, {
            method: "PATCH",
            headers: { "Prefer": "return=minimal" },
            body: JSON.stringify({ is_stock_out: nextVal })
        });
    } catch (err) {
        console.warn("Supabase stock update warning:", err.message);
    }
    p.isStockOut = nextVal;
    safeSaveStorage('store_products', products);
    renderProducts();
    renderAdminProductList();
    renderAdminAnalytics();
    showSyncNotice(`${p.name}: ${nextVal ? 'Stock Out' : 'In Stock'}`);
}

function openEditProductModal(id) {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    editingProductId = id;

    let editModal = document.getElementById('editProductModal');
    if (editModal) {
        editModal.remove();
    }

    const modalDiv = document.createElement('div');
    modalDiv.id = 'editProductModal';
    modalDiv.className = 'modal-overlay show';
    modalDiv.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.65); display:flex; align-items:center; justify-content:center; z-index:99999;";
    modalDiv.innerHTML = `
        <div class="modal-box" style="background:#fff; border-radius:8px; max-width:520px; width:92%; max-height:90vh; overflow-y:auto; box-shadow:0 10px 30px rgba(0,0,0,0.3);">
            <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; border-bottom:1px solid #e2e8f0;">
                <h3 style="margin:0; font-size:16px;">Edit Product</h3>
                <button type="button" onclick="closeModal('editProductModal')" style="border:none; background:none; font-size:24px; line-height:1; cursor:pointer;">&times;</button>
            </div>
            <form id="editProductForm" onsubmit="handleSaveEditProduct(event)" style="padding:15px; display:flex; flex-direction:column; gap:10px;">
                <div>
                    <label style="font-size:12px; font-weight:bold;">Name:</label>
                    <input type="text" id="editPName" required style="width:100%; padding:7px; font-size:13px; border:1px solid #cbd5e1; border-radius:4px; margin-top:3px;">
                </div>
                <div>
                    <label style="font-size:12px; font-weight:bold;">Price (৳):</label>
                    <input type="number" id="editPPrice" required style="width:100%; padding:7px; font-size:13px; border:1px solid #cbd5e1; border-radius:4px; margin-top:3px;">
                </div>
                <div>
                    <label style="font-size:12px; font-weight:bold;">Category:</label>
                    <select id="editPCat" style="width:100%; padding:7px; font-size:13px; border:1px solid #cbd5e1; border-radius:4px; margin-top:3px;">
                        ${categoriesList.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                </div>
                ${buildSizePickerUI('editProd', p.size || "No Size")}
                <div>
                    <label style="font-size:12px; font-weight:bold;">Description:</label>
                    <textarea id="editPDesc" rows="2" style="width:100%; padding:7px; font-size:13px; border:1px solid #cbd5e1; border-radius:4px; margin-top:3px;"></textarea>
                </div>
                <div>
                    <label style="font-size:12px; font-weight:bold;">New Picture (Optional):</label>
                    <input type="file" id="editPImgFile" accept="image/*" style="width:100%; font-size:12px; margin-top:3px;">
                </div>
                <div style="display:flex; gap:16px; margin-top:4px;">
                    <label style="font-size:13px; cursor:pointer;"><input type="checkbox" id="editPIsFeatured"> Featured</label>
                    <label style="font-size:13px; cursor:pointer; color:#dc2626; font-weight:600;"><input type="checkbox" id="editPIsStockOut"> Stock Out</label>
                </div>
                <button type="submit" style="background:#16a34a; color:white; padding:9px; border:none; border-radius:4px; font-weight:bold; cursor:pointer; margin-top:6px;">Save Changes</button>
            </form>
        </div>
    `;
    document.body.appendChild(modalDiv);

    document.getElementById('editPName').value = p.name;
    document.getElementById('editPPrice').value = p.price;
    document.getElementById('editPCat').value = p.category;
    document.getElementById('editPDesc').value = p.desc || "";
    document.getElementById('editPIsFeatured').checked = Boolean(p.isFeatured);
    document.getElementById('editPIsStockOut').checked = Boolean(p.isStockOut);
}

async function handleSaveEditProduct(e) {
    e.preventDefault();
    const p = products.find(prod => prod.id === editingProductId);
    if (!p) return;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = "Saving...";
        }

        const fileInput = document.getElementById('editPImgFile');
        let imgUrl = p.img;
        if (fileInput && fileInput.files && fileInput.files[0]) {
            imgUrl = await uploadImageSmart(fileInput, 600, 600, 0.78);
        }

        p.name = document.getElementById('editPName').value;
        p.price = Number(document.getElementById('editPPrice').value);
        p.category = document.getElementById('editPCat').value;
        p.size = getSelectedSizeFromPicker('editProd');
        p.desc = document.getElementById('editPDesc').value;
        p.img = imgUrl;
        p.isFeatured = document.getElementById('editPIsFeatured').checked;
        p.isStockOut = document.getElementById('editPIsStockOut').checked;

        await sbRequest(`products?id=eq.${p.id}`, {
            method: "PATCH",
            headers: { "Prefer": "return=minimal" },
            body: JSON.stringify(toDbProduct(p))
        });

        safeSaveStorage('store_products', products);
        renderProducts();
        renderAdminProductList();
        renderAdminAnalytics();
        closeModal('editProductModal');
        showSyncNotice("Product updated on Supabase!");
        alert("Product updated successfully!");
    } catch (err) {
        alert("Edit Error: " + err.message);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = "Save Changes";
        }
    }
}

async function toggleFeature(id) {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    const nextVal = !p.isFeatured;
    try {
        await sbRequest(`products?id=eq.${id}`, {
            method: "PATCH",
            headers: { "Prefer": "return=minimal" },
            body: JSON.stringify({ is_featured: nextVal })
        });
    } catch (err) {
        console.warn("Supabase feature update warning:", err.message);
    }
    p.isFeatured = nextVal;
    safeSaveStorage('store_products', products);
    renderProducts();
    renderAdminProductList();
}

async function deleteProduct(id) {
    try {
        await sbRequest(`products?id=eq.${id}`, {
            method: "DELETE",
            headers: { "Prefer": "return=minimal" }
        });
        products = products.filter(p => p.id !== id);
        selectedProductIds.delete(id);
        safeSaveStorage('store_products', products);
        renderProducts();
        renderAdminProductList();
        renderAdminAnalytics();
        showSyncNotice("Product deleted from Supabase.");
    } catch (err) {
        alert("Delete Error: " + err.message);
    }
}

async function handleAddBanner(e) {
    e.preventDefault();
    const fileInput = document.getElementById('bImgFile');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = "Uploading Banner...";
        }

        const bannerUrl = await uploadImageSmart(fileInput, 1100, 420, 0.72);
        const newBannerId = Date.now();

        await sbRequest("banners", {
            method: "POST",
            headers: { "Prefer": "return=minimal" },
            body: JSON.stringify({ id: newBannerId, img: bannerUrl })
        });

        banners.push(bannerUrl);
        safeSaveStorage('store_banners', banners);
        renderBanners();
        renderAdminBannerList();
        renderAdminAnalytics();
        startSlider();
        showSyncNotice("Banner saved to Supabase!");
        alert("Banner slide added & synced to Supabase!");
        e.target.reset();
    } catch (err) {
        showSyncNotice(`Add Banner Error: ${err.message}`, true);
        alert("সমস্যা হয়েছে: " + (err.message || "Banner যোগ করা যায়নি।"));
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = "Add Banner Slide";
        }
    }
}

async function resetDefaultBanners() {
    banners = [...defaultBanners];
    safeSaveStorage('store_banners', banners);
    renderBanners();
    renderAdminBannerList();
    renderAdminAnalytics();
    startSlider();
    alert("Default banners restored.");
}

function renderAdminBannerList() {
    const container = document.getElementById('bannerListAdmin');
    if (!container) return;
    container.innerHTML = banners.map((b, idx) => `
        <div class="banner-admin-row">
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="${b}" class="banner-admin-thumb" alt="Banner ${idx + 1}">
                <span style="font-size:12px; font-weight:600;">Banner #${idx + 1}</span>
            </div>
            <button onclick="deleteBanner(${idx})" style="color:red; border:none; background:none; cursor:pointer; font-weight:bold;">Delete</button>
        </div>
    `).join('');
}

async function deleteBanner(idx) {
    const targetUrl = banners[idx];
    try {
        if (targetUrl) {
            await sbRequest(`banners?img=eq.${encodeURIComponent(targetUrl)}`, {
                method: "DELETE",
                headers: { "Prefer": "return=minimal" }
            });
        }
        banners.splice(idx, 1);
        if (banners.length === 0) {
            banners = [...defaultBanners];
        }
        safeSaveStorage('store_banners', banners);
        renderBanners();
        renderAdminBannerList();
        renderAdminAnalytics();
        startSlider();
        showSyncNotice("Banner updated on Supabase.");
    } catch (err) {
        alert("Banner Delete Error: " + err.message);
    }
}

async function handleUpdateLogo(e) {
    e.preventDefault();
    const fileInput = document.getElementById('logoFile');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = "Uploading Logo...";
        }

        const logoUrl = await uploadImageSmart(fileInput, 200, 200, 0.85);
        siteLogo = logoUrl;
        localStorage.setItem('site_logo', siteLogo);
        renderLogo();
        alert("Website logo updated successfully!");
        e.target.reset();
    } catch (err) {
        alert(err.message || "Logo আপডেট করতে সমস্যা হয়েছে।");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = "Update Website Logo";
        }
    }
}

function handleRemoveLogo() {
    siteLogo = "";
    localStorage.removeItem('site_logo');
    renderLogo();
    alert("Logo removed.");
}

function forceFixSaveProductButton() {
    const pSizeEl = document.getElementById('pSize');
    if (pSizeEl) {
        pSizeEl.required = false;
        pSizeEl.removeAttribute('required');
        pSizeEl.style.display = 'none';
    }

    const formEl =
        document.getElementById('pName')?.closest('form') ||
        document.querySelector('#adminAddProduct form');

    if (formEl) {
        formEl.setAttribute('novalidate', 'true');
        formEl.onsubmit = function(ev) {
            ev.preventDefault();
            handleAddProduct(ev);
            return false;
        };
    }

    const allButtons = Array.from(document.querySelectorAll('button'));
    const saveBtn = allButtons.find(b => (b.innerText || '').trim().toLowerCase() === 'save product');
    if (saveBtn) {
        saveBtn.type = 'button';
        saveBtn.onclick = function(ev) {
            ev.preventDefault();
            handleAddProduct(ev);
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    forceFixSaveProductButton();
    setInterval(forceFixSaveProductButton, 1500);
});