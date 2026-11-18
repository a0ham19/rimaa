const formatCurrency = value => `${new Intl.NumberFormat("ar-EG").format(value)} ج.م`;
const cart = loadCart();
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
function loadCart() {
  try {
    const stored = JSON.parse(localStorage.getItem("rimaa-cart") || "[]");
    if (!Array.isArray(stored)) return [];
    return stored
      .filter(item => item && item.name && item.priceNumber)
      .map(item => ({
        ...item,
        price: formatCurrency(Number(item.priceNumber)),
        quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1
      }));
  } catch {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem("rimaa-cart", JSON.stringify(cart));
  } catch {
    // The cart remains usable for this visit if storage is unavailable.
  }
}

const categoryGalleries = document.querySelectorAll(".category-gallery");
const diffusersGrid = document.getElementById("diffusersGrid");
for (let index = 1; index <= 18; index++) {
  const image = document.createElement("img");
  const photo = document.createElement("figure");

  photo.className = "collection-photo";
  image.src = `assets/diffusers/diffuser-${String(index).padStart(2, "0")}.jpeg`;
  image.alt = `صورة فواحة من رِمَاء رقم ${index}`;
  image.loading = "lazy";
  photo.append(image);
  diffusersGrid.append(photo);
}

let productIndex = 0;
categoryGalleries.forEach(section => {
  const grid = section.querySelector(".collection-grid");
  if (!grid) return;

  const categoryName = section.querySelector(".collection-heading h2").textContent.replace(/^مجموعة\s*/, "");
  const images = Array.from(grid.querySelectorAll(".collection-photo img"));
  const count = section.querySelector(".collection-count");
  if (count) count.textContent = `${new Intl.NumberFormat("ar-EG").format(images.length)} منتج · أسعار تجريبية بالجنيه`;

  const cards = images.map((image, imageIndex) => {
    productIndex++;
    const priceNumber = 100 + ((productIndex - 1) % 8) * 25;
    const name = `${categoryName} ${new Intl.NumberFormat("ar-EG").format(imageIndex + 1)}`;
    const card = document.createElement("article");
    const imageWrapper = document.createElement("div");
    const info = document.createElement("div");
    const type = document.createElement("p");
    const title = document.createElement("h3");
    const bottom = document.createElement("div");
    const price = document.createElement("strong");
    const addButton = document.createElement("button");
    const quickAdd = document.createElement("button");

    card.className = "product-card";
    card.dataset.name = name;
    card.dataset.price = String(priceNumber);
    imageWrapper.className = "product-image";
    info.className = "product-info";
    type.textContent = categoryName;
    title.textContent = name;
    bottom.className = "product-bottom";
    price.textContent = formatCurrency(priceNumber);
    addButton.className = "add-button";
    addButton.type = "button";
    addButton.textContent = "أضيفي للسلة";
    quickAdd.className = "quick-add";
    quickAdd.type = "button";
    quickAdd.setAttribute("aria-label", `إضافة ${name} إلى السلة`);
    quickAdd.textContent = "+";

    imageWrapper.append(image, quickAdd);
    bottom.append(price, addButton);
    info.append(type, title, bottom);
    card.append(imageWrapper, info);
    return card;
  });

  grid.classList.add("product-grid");
  grid.replaceChildren(...cards);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePanels();
  }
});

function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("open");
}
function closePanels() {
  cartDrawer.classList.remove("open");
  document.getElementById("checkoutDrawer").classList.remove("open");
  document.getElementById("searchPanel").classList.remove("open");
  successModal?.classList.remove("open");
  overlay.classList.remove("open");
}

document.getElementById("cartButton").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closePanels);
overlay.addEventListener("click", closePanels);

document.getElementById("shopMenuButton").addEventListener("click", (event) => {
  event.stopPropagation();
  document.querySelector(".dropdown").classList.toggle("open");
});
document.addEventListener("click", () => document.querySelector(".dropdown").classList.remove("open"));

document.getElementById("menuButton").addEventListener("click", () => {
  document.getElementById("nav").classList.toggle("open");
});
function closeCategoryView() {
  document.body.classList.remove("category-view");
  categoryGalleries.forEach(section => { section.hidden = true; });
}

categoryGalleries.forEach(section => {
  const returnLink = section.querySelector(".category-return");
  const heading = section.querySelector(".collection-heading");
  if (returnLink && heading) heading.after(returnLink);
});

document.querySelectorAll("#nav a").forEach(link => {
  link.addEventListener("click", () => {
    document.getElementById("nav").classList.remove("open");
    const target = link.getAttribute("href");
    if (!target || target === "#" || !document.querySelector(target)?.classList.contains("category-gallery")) {
      closeCategoryView();
    }
  });
});

document.querySelectorAll(".category-card[href^='#'], .dropdown a[href^='#']").forEach(link => {
  link.addEventListener("click", event => {
    const gallery = document.querySelector(link.getAttribute("href"));
    if (!gallery?.classList.contains("category-gallery")) {
      if (document.body.classList.contains("category-view")) closeCategoryView();
      return;
    }
    event.preventDefault();
    categoryGalleries.forEach(section => { section.hidden = true; });
    gallery.hidden = false;
    document.body.classList.add("category-view");
    gallery.scrollIntoView({ behavior: "smooth" });
  });
});
document.querySelectorAll(".category-return").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    closeCategoryView();
    document.getElementById("categories").scrollIntoView({ behavior: "smooth" });
  });
});

document.getElementById("searchButton").addEventListener("click", () => {
  document.getElementById("searchPanel").classList.add("open");
  setTimeout(() => document.getElementById("searchInput").focus(), 350);
});
document.getElementById("closeSearch").addEventListener("click", closePanels);

function runSearch() {
  const query = document.getElementById("searchInput").value.trim();
  const normalizedQuery = query.toLocaleLowerCase("ar");
  let matches = 0;
  document.querySelectorAll(".search-empty").forEach(item => item.remove());
  document.querySelectorAll(".product-card").forEach(card => {
    const visible = !normalizedQuery || card.textContent.toLocaleLowerCase("ar").includes(normalizedQuery);
    card.style.display = visible ? "" : "none";
    if (visible) matches++;
  });
  document.getElementById("searchPanel").classList.remove("open");
  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
  if (!matches) document.querySelector(".products-grid").insertAdjacentHTML("beforeend", '<p class="search-empty">لا توجد منتجات مطابقة حاليًا</p>');
}

document.getElementById("searchSubmit").addEventListener("click", runSearch);
document.getElementById("searchInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") runSearch();
});

const checkoutDrawer = document.getElementById("checkoutDrawer");
const successModal = document.getElementById("successModal");

document.getElementById("checkoutButton").addEventListener("click", () => {
  if (!cart.length) return;
  document.getElementById("checkoutTotal").textContent = cartTotal.textContent;
  cartDrawer.classList.remove("open");
  checkoutDrawer.classList.add("open");
});

document.getElementById("closeCheckout").addEventListener("click", closePanels);

document.getElementById("checkoutForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const orderNumber = `RIM-${Math.floor(1000 + Math.random() * 9000)}`;
  document.getElementById("orderNumber").textContent = orderNumber;
  checkoutDrawer.classList.remove("open");
  overlay.classList.add("open");
  successModal.classList.add("open");
  cart.length = 0;
  renderCart();
  saveCart();
  event.currentTarget.reset();
});

document.getElementById("closeSuccess").addEventListener("click", () => {
  successModal.classList.remove("open");
  overlay.classList.remove("open");
  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
});

function renderCart() {
  const quantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = quantity;
  if (!cart.length) {
    cartItems.innerHTML = '<p class="empty-cart">سلتك فارغة حاليًا</p>';
    cartTotal.textContent = formatCurrency(0);
    saveCart();
    return;
  }
  cartItems.innerHTML = cart.map((item, index) => `
    <div class="cart-line">
      <img class="cart-thumb" src="${item.image}" alt="">
      <div><strong>${item.name}</strong><small>${item.quantity} × ${item.price}</small></div>
      <div class="cart-quantity">
        <button type="button" data-action="decrease" data-index="${index}" aria-label="تقليل الكمية">−</button>
        <span>${item.quantity}</span>
        <button type="button" data-action="increase" data-index="${index}" aria-label="زيادة الكمية">+</button>
        <button type="button" class="cart-remove" data-action="remove" data-index="${index}" aria-label="حذف">×</button>
      </div>
    </div>
  `).join("");
  const total = cart.reduce((sum, item) => sum + item.priceNumber * item.quantity, 0);
  cartTotal.textContent = formatCurrency(total);
  cartItems.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      const action = button.dataset.action;
      if (action === "remove") {
        cart.splice(index, 1);
      } else if (action === "increase") {
        cart[index].quantity++;
      } else if (cart[index].quantity > 1) {
        cart[index].quantity--;
      } else {
        cart.splice(index, 1);
      }
      renderCart();
    });
  });
  saveCart();
}

document.querySelectorAll(".product-card").forEach(card => {
  card.querySelectorAll(".add-button, .quick-add").forEach(button => {
    button.addEventListener("click", () => {
      const name = card.dataset.name;
      const priceText = card.querySelector(".product-bottom strong").textContent;
      const priceNumber = Number(card.dataset.price || priceText.match(/\d+/)?.[0] || 0);
      const image = card.querySelector("img").getAttribute("src");
      const existing = cart.find(item => item.name === name);
      if (existing) {
        existing.quantity++;
      } else {
        cart.push({ name, price: priceText, priceNumber, image, quantity: 1 });
      }
      renderCart();
      openCart();
    });
  });
});

renderCart();
