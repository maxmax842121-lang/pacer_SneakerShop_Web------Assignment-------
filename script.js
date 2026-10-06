// ================= DATA =================
const products = [
  { id: 1, name: "Glide Runner",  cat: "Running",   price: 120, color: "#2340e8", bg: "#dfe5ff", tag: "New" },
  { id: 2, name: "Court Classic", cat: "Lifestyle", price: 90,  color: "#f4f4f4", bg: "#e8e2d6" },
  { id: 3, name: "Trail Hawk",    cat: "Outdoor",   price: 140, color: "#3f7d4e", bg: "#dbeadf", tag: "Bestseller" },
  { id: 4, name: "Street Low",    cat: "Lifestyle", price: 85,  color: "#202328", bg: "#d9dce1" },
  { id: 5, name: "Sprint Pro",    cat: "Running",   price: 160, color: "#ff8a1f", bg: "#ffe7cf", tag: "New" },
  { id: 6, name: "Mini Hopper",   cat: "Kids",      price: 55,  color: "#c04ab0", bg: "#f6dcf1" },
  { id: 7, name: "Pitch Master",  cat: "Football",  price: 110, color: "#d7263d", bg: "#fadadd" },
  { id: 8, name: "Cloud Walk",    cat: "Lifestyle", price: 99,  old: 130, color: "#8fa3b8", bg: "#e1e8ef", tag: "Sale" },
  { id: 9, name: "Ridge Boot",    cat: "Outdoor",   price: 175, color: "#7a5230", bg: "#efe1d3" },
  { id: 10, name: "Tiny Dash",    cat: "Kids",      price: 49,  old: 65, color: "#18a999", bg: "#d4f1ec", tag: "Sale" },
];
const categories = ["All", "Running", "Lifestyle", "Outdoor", "Football", "Kids", "Sale"];

// ================= STATE =================
let cart = [];              // [{ id, qty }]
let orders = [];            // past orders
let wishlist = new Set();   // product ids
let user = { name: "Guest Runner", email: "guest@pacer.shop", points: 250 };
let searchCat = "All";
let ordersTab = "cart";

// ================= HELPERS =================
const $ = (sel) => document.querySelector(sel);
const money = (n) => "$" + n.toFixed(2);
const findProduct = (id) => products.find((p) => p.id === id);

// Simple sneaker drawing, coloured per product
function shoeSVG(color) {
  return `<svg viewBox="0 0 140 70" style="stroke:none">
    <path d="M10 46 C10 30 20 22 34 21 L52 18 C58 28 70 33 86 35 L118 40 C128 42 132 48 131 54 L10 54 Z" fill="${color}"/>
    <path d="M52 18 C58 28 70 33 86 35" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="2"/>
    <path d="M60 24 l6 -4 M66 28 l6 -4 M72 31 l6 -4" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M30 40 C50 44 80 44 104 46" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="3" stroke-linecap="round"/>
    <rect x="7" y="52" width="127" height="9" rx="4.5" fill="#f7f7f2" stroke="rgba(0,0,0,.18)"/>
  </svg>`;
}

function productCard(p) {
  const liked = wishlist.has(p.id);
  return `
  <article class="card">
    <div class="card-img" style="background:${p.bg}">
      ${p.tag ? `<span class="tag">${p.tag}</span>` : ""}
      <button class="heart ${liked ? "on" : ""}" data-action="wish" data-id="${p.id}" aria-label="Save ${p.name}">
        <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>
      </button>
      ${shoeSVG(p.color)}
    </div>
    <div class="card-body">
      <h3>${p.name}</h3>
      <span class="muted small">${p.cat}</span>
      <span class="price">${money(p.price)}${p.old ? `<s>${money(p.old)}</s>` : ""}</span>
      <button class="add-btn" data-action="add" data-id="${p.id}">Add to bag</button>
    </div>
  </article>`;
}

function showToast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 1800);
}

// ================= PAGE SWITCHING =================
function goTo(page) {
  document.querySelectorAll(".page").forEach((s) => s.classList.remove("active"));
  $("#page-" + page).classList.add("active");

  // highlight the matching bottom-nav button
  document.querySelectorAll(".nav-btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.page === page)
  );

  if (page === "search") renderSearch();
  if (page === "orders") renderOrders();
  if (page === "profile") renderProfile();

  closeMenu();
  window.scrollTo({ top: 0 });
}

function openMenu() {
  $("#drawer").classList.add("open");
  $("#overlay").classList.add("show");
  $("#drawer").setAttribute("aria-hidden", "false");
}
function closeMenu() {
  $("#drawer").classList.remove("open");
  $("#overlay").classList.remove("show");
  $("#drawer").setAttribute("aria-hidden", "true");
}

// ================= RENDER: HOME =================
function renderHome() {
  $("#hero-shoe").innerHTML = shoeSVG("#2340e8");
  $("#home-cats").innerHTML = categories.slice(1)
    .map((c) => `<button class="chip" data-action="cat" data-cat="${c}">${c}</button>`).join("");
  $("#home-grid").innerHTML = products.filter((p) => p.tag !== "Sale").slice(0, 8).map(productCard).join("");
}

// ================= RENDER: SEARCH =================
function renderSearch() {
  const q = $("#search-input").value.trim().toLowerCase();

  $("#search-chips").innerHTML = categories
    .map((c) => `<button class="chip ${c === searchCat ? "active" : ""}" data-action="filter" data-cat="${c}">${c}</button>`)
    .join("");

  const results = products.filter((p) => {
    const inCat = searchCat === "All" || p.cat === searchCat || (searchCat === "Sale" && p.tag === "Sale");
    const colorWords = { "#202328": "black", "#f4f4f4": "white", "#2340e8": "blue", "#d7263d": "red", "#3f7d4e": "green" };
    const text = (p.name + " " + p.cat + " " + (colorWords[p.color] || "")).toLowerCase();
    return inCat && text.includes(q);
  });

  $("#result-count").textContent = `${results.length} ${results.length === 1 ? "shoe" : "shoes"} found`;
  $("#search-grid").innerHTML = results.length
    ? results.map(productCard).join("")
    : `<div class="empty"><p>No shoes match “${q}”. Try another word or pick a different category.</p>
       <button class="btn ghost" data-action="clear-search">Clear search</button></div>`;
}

// ================= RENDER: ORDERS =================
function cartTotals() {
  const subtotal = cart.reduce((sum, item) => sum + findProduct(item.id).price * item.qty, 0);
  const shipping = subtotal === 0 || subtotal >= 75 ? 0 : 7.99;
  return { subtotal, shipping, total: subtotal + shipping };
}

function renderOrders() {
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === ordersTab));
  $("#cart-view").hidden = ordersTab !== "cart";
  $("#history-view").hidden = ordersTab !== "history";

  // --- Bag ---
  if (cart.length === 0) {
    $("#cart-view").innerHTML = `<div class="empty"><p>Your bag is empty. Find a pair you like and add it here.</p>
      <button class="btn primary" data-action="go" data-page="search">Browse shoes</button></div>`;
  } else {
    const { subtotal, shipping, total } = cartTotals();
    $("#cart-view").innerHTML = cart.map((item) => {
      const p = findProduct(item.id);
      return `<div class="line-item">
        <div class="line-thumb" style="background:${p.bg}">${shoeSVG(p.color)}</div>
        <div class="line-info">
          <h3>${p.name}</h3>
          <span class="muted small">${money(p.price)} each</span>
          <div class="qty">
            <button data-action="dec" data-id="${p.id}" aria-label="One less">−</button>
            <span>${item.qty}</span>
            <button data-action="inc" data-id="${p.id}" aria-label="One more">+</button>
          </div>
        </div>
        <div style="text-align:right">
          <strong>${money(p.price * item.qty)}</strong><br>
          <button class="remove" data-action="remove" data-id="${p.id}">Remove</button>
        </div>
      </div>`;
    }).join("") + `
      <div class="summary">
        <div class="summary-row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
        <div class="summary-row"><span>Delivery</span><span>${shipping ? money(shipping) : "Free"}</span></div>
        <div class="summary-row total"><span>Total</span><span>${money(total)}</span></div>
        <button class="btn primary" data-action="checkout">Place order</button>
      </div>`;
  }

  // --- Past orders ---
  $("#history-view").innerHTML = orders.length
    ? orders.map((o) => `<div class="order">
        <div class="order-head"><strong>Order ${o.id}</strong><span class="status">${o.status}</span></div>
        <p class="muted small">${o.date}</p>
        <p>${o.items.map((i) => `${findProduct(i.id).name} ×${i.qty}`).join(", ")}</p>
        <p><strong>${money(o.total)}</strong></p>
      </div>`).join("")
    : `<div class="empty"><p>You haven't placed any orders yet.</p></div>`;
}

function checkout() {
  if (!cart.length) return;
  const { total } = cartTotals();
  orders.unshift({
    id: "#PC" + Math.floor(10000 + Math.random() * 90000),
    date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    items: cart.map((i) => ({ ...i })),
    total,
    status: "Processing",
  });
  user.points += Math.round(total);
  cart = [];
  ordersTab = "history";
  updateBadge();
  renderOrders();
  showToast(`Order placed. You earned ${Math.round(total)} points.`);
}

// ================= RENDER: PROFILE =================
function renderProfile() {
  const initials = user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  $("#avatar").textContent = initials || "?";
  $("#profile-name").textContent = user.name;
  $("#profile-email").textContent = user.email;
  $("#input-name").value = user.name;
  $("#input-email").value = user.email;

  const goal = 500;
  const progress = user.points % goal;
  $("#points-num").textContent = user.points;
  $("#points-bar").style.width = (progress / goal) * 100 + "%";
  $("#points-text").textContent = `${goal - progress} more points until your next $25 reward.`;

  const saved = products.filter((p) => wishlist.has(p.id));
  $("#wish-grid").innerHTML = saved.length
    ? saved.map(productCard).join("")
    : `<div class="empty"><p>Tap the heart on any shoe to save it here.</p></div>`;
}

// ================= INFO PAGES (from menu) =================
const infoPages = {
  help: `<h1 class="page-title">Help &amp; FAQ</h1>
    <p><strong>How long does delivery take?</strong><br>Standard delivery takes 3–5 working days.</p>
    <p><strong>Can I change my order?</strong><br>You can change it within 1 hour of placing it from the Orders page.</p>
    <p><strong>How do points work?</strong><br>You earn 1 point per dollar. Every 500 points becomes a $25 reward.</p>`,
  returns: `<h1 class="page-title">Returns</h1>
    <p>Return unworn shoes within 30 days for a full refund.</p>
    <ul><li>Open Orders and choose the order.</li><li>Print the free return label.</li><li>Drop it at any post office.</li></ul>`,
  stores: `<h1 class="page-title">Find a store</h1>
    <p><strong>Pacer Downtown</strong><br>120 Market Street · Open 10am–8pm</p>
    <p><strong>Pacer Riverside Mall</strong><br>Level 2, Unit 14 · Open 10am–9pm</p>`,
  about: `<h1 class="page-title">About Pacer</h1>
    <p>Pacer makes everyday sneakers for walking, running and playing. This site is a student project built with HTML, CSS and JavaScript.</p>`,
};

function showInfo(key) {
  $("#info-content").innerHTML = infoPages[key];
  goTo("info");
}

// ================= CART ACTIONS =================
function addToCart(id) {
  const item = cart.find((i) => i.id === id);
  item ? item.qty++ : cart.push({ id, qty: 1 });
  updateBadge();
  showToast(`${findProduct(id).name} added to bag`);
}
function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
  updateBadge();
  renderOrders();
}
function updateBadge() {
  $("#cart-count").textContent = cart.reduce((n, i) => n + i.qty, 0);
}
function toggleWish(id) {
  wishlist.has(id) ? wishlist.delete(id) : wishlist.add(id);
  showToast(wishlist.has(id) ? "Saved to wishlist" : "Removed from wishlist");
  // re-draw whichever page is showing so the heart updates
  renderHome();
  if ($("#page-search").classList.contains("active")) renderSearch();
  if ($("#page-profile").classList.contains("active")) renderProfile();
}

// ================= ONE CLICK HANDLER FOR EVERYTHING =================
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const id = Number(el.dataset.id);

  switch (el.dataset.action) {
    case "go":          goTo(el.dataset.page); break;
    case "menu-open":   openMenu(); break;
    case "menu-close":  closeMenu(); break;
    case "cat":         searchCat = el.dataset.cat; goTo("search"); break;
    case "filter":      searchCat = el.dataset.cat; renderSearch(); break;
    case "clear-search": $("#search-input").value = ""; searchCat = "All"; renderSearch(); break;
    case "add":         addToCart(id); break;
    case "wish":        toggleWish(id); break;
    case "inc":         changeQty(id, 1); break;
    case "dec":         changeQty(id, -1); break;
    case "remove":      changeQty(id, -999); break;
    case "checkout":    checkout(); break;
    case "tab":         ordersTab = el.dataset.tab; renderOrders(); break;
    case "info":        showInfo(el.dataset.info); break;
    case "save-profile":
      user.name = $("#input-name").value.trim() || user.name;
      user.email = $("#input-email").value.trim() || user.email;
      renderProfile();
      showToast("Changes saved");
      break;
    case "signout":
      cart = []; wishlist.clear(); updateBadge(); renderHome();
      user = { name: "Guest Runner", email: "guest@pacer.shop", points: 0 };
      goTo("home");
      showToast("Signed out");
      break;
  }
});

// live search while typing
$("#search-input").addEventListener("input", renderSearch);

// Escape key closes the menu
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

// dark mode switch
$("#dark-toggle").addEventListener("change", (e) => {
  document.documentElement.dataset.theme = e.target.checked ? "dark" : "light";
});

// ================= START =================
$("#drawer-cats").innerHTML = categories.slice(1)
  .map((c) => `<button class="drawer-link big" data-action="cat" data-cat="${c}">${c}</button>`).join("");
renderHome();
updateBadge();