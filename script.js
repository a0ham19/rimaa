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
    const originalProductNumber = Number(image.closest(".collection-photo")?.dataset.productNumber);
    const productNumber = originalProductNumber || (imageIndex + 1);
    const isSmallWardrobeDiffuser =
      section.id === "diffusers-gallery" && productNumber >= 1 && productNumber <= 4;
    const isArabicBathroomDiffuser =
      section.id === "diffusers-gallery" && productNumber === 5;
    const isRoseDiffuser =
      section.id === "diffusers-gallery" && productNumber >= 6 && productNumber <= 16;
    const isNamedRoseDiffuser =
      section.id === "diffusers-gallery" && productNumber >= 6 && productNumber <= 17;
    const isMiniDiffuser =
      section.id === "diffusers-gallery" && productNumber === 18;
    const isThreeCandleholders =
      section.id === "candleholders-gallery" &&
      (productNumber === 1 || productNumber === 2);
    const isMetalCandleholder =
      section.id === "candleholders-gallery" && productNumber === 3;
    const isSingleSevouCandleholder =
      section.id === "candleholders-gallery" && productNumber === 4;
    const isSingleRoseCandle =
      section.id === "flower-candles-gallery" && productNumber === 1;
    const isJouriGiftBoxCandle =
      section.id === "flower-candles-gallery" && productNumber === 2;
    const isJouriRoseCandle =
      section.id === "flower-candles-gallery" && productNumber === 3;
    const isSunflowerRoseCandle =
      section.id === "flower-candles-gallery" && productNumber === 4;
    const isTulipRoseCandle =
      section.id === "flower-candles-gallery" && productNumber === 5;
    const isLocalRoseCandle =
      section.id === "flower-candles-gallery" && productNumber === 6;
    const isSmallBubblesCandle =
      section.id === "shaped-candles-gallery" && productNumber === 1;
    const isElephantCandle =
      section.id === "shaped-candles-gallery" && productNumber === 2;
    const isBubblesCandle =
      section.id === "shaped-candles-gallery" && productNumber === 3;
    const isLargeBubblesCandle =
      section.id === "shaped-candles-gallery" && productNumber === 4;
    const isSingleTeaLight =
      section.id === "tea-lights-gallery" && productNumber === 1;
    const isScentedTeaLight =
      section.id === "tea-lights-gallery" && productNumber === 2;
    const isShapedTeaLight =
      section.id === "tea-lights-gallery" &&
      (productNumber === 3 || productNumber === 4 || productNumber === 5);
    const isPumpkinCandle =
      section.id === "candles-gallery" && productNumber === 4;
    const isCandleJar =
      section.id === "candles-gallery" && productNumber === 3;
    const isScentedCoconutVanillaJar =
      section.id === "candles-gallery" && productNumber === 6;
    const isScentedBerryJar =
      section.id === "candles-gallery" && productNumber === 7;
    const isBerryVanillaJar =
      section.id === "candles-gallery" && productNumber === 8;
    const isAmberVanillaJar =
      section.id === "candles-gallery" && productNumber === 9;
    const isStrawberryVanillaJar =
      section.id === "candles-gallery" && productNumber === 10;
    const isMuskJasmineJar =
      section.id === "candles-gallery" && productNumber === 11;
    const localRoseVariants = [
      { label: "الكبيره", price: 65 },
      { label: "الصغيره", price: 27 }
    ];
    const miniDiffuserVariants = [
      { label: "10 قلوب", price: 30 },
      { label: "6 سحابات", price: 30 },
      { label: "الاثنين معًا", price: 60 }
    ];
    const name = isCandleJar
      ? "جار شمع"
      : isPumpkinCandle
        ? "شمعه اليقطينه"
        : isScentedCoconutVanillaJar
          ? "جار شمع معطر (جوز هند وفانيليا)"
        : isScentedBerryJar
          ? "جار شمع معطر (توت وفراوله)"
        : isBerryVanillaJar
          ? "جار شمع (توت و فانيليا)"
        : isAmberVanillaJar
          ? "جار شمع (عنبر وفانيليا)"
        : isStrawberryVanillaJar
          ? "جار شمع (فراوله وفانيليا)"
        : isMuskJasmineJar
          ? "جار شمع (مسك وياسمين)"
        : isSmallWardrobeDiffuser
        ? "فواحات دولاب صغيرة"
      : isArabicBathroomDiffuser
        ? "فواحات حمام عربيه"
        : isRoseDiffuser
          ? "فواحات ورده"
          : isNamedRoseDiffuser
            ? "فواحات ورده"
            : isMiniDiffuser
              ? "فواحات ميني للشنط التخزين / الادراج"
              : isThreeCandleholders
                ? "شمعدان الثلاثه مع بعض"
                : isMetalCandleholder
                  ? "شمعدان معدن"
                  : isSingleSevouCandleholder
                    ? "شمعدان للسبوع (الواحده)"
                    : isSingleRoseCandle
                      ? "شمع ورده (الواحده)"
                      : isJouriGiftBoxCandle
                        ? "شمعه جوري بعلبه هدايا"
                        : isJouriRoseCandle
                          ? "ورده جوري"
                          : isSunflowerRoseCandle
                            ? "شمعه ورده عباد الشمس (الوحده)"
                            : isTulipRoseCandle
                              ? "ورده التوليب (الوحده)"
                              : isLocalRoseCandle
                                ? "ورده بلدي"
                                : isSmallBubblesCandle
                                  ? "شمع بابلز صغيره (الوحده)"
                                  : isElephantCandle
                                    ? "شمع فيل فلفوله"
                                    : isBubblesCandle
                                      ? "شمع بابلز"
                                      : isLargeBubblesCandle
                                        ? "شمع بابلز كبير"
                                        : isSingleTeaLight
                                          ? "تي لايت (الواحده)"
                                          : isScentedTeaLight
                                            ? "تي لايت معطر (الواحده)"
                                            : isShapedTeaLight
                                              ? "تي لايت اشكال (الواحده)"
                                              : `${categoryName} ${new Intl.NumberFormat("ar-EG").format(productNumber)}`;
    const fixedCandleJarPrices =
      section.id === "candles-gallery"
        ? { 1: 200, 2: 200, 3: 65, 4: 200 }
        : null;
    const candleJarNumber = productNumber;
    const hasWeightVariants =
      section.id === "candles-gallery" && candleJarNumber >= 5 && candleJarNumber <= 11;
    const weightVariants = [
      { grams: 50, price: 140 },
      { grams: 80, price: 170 },
      { grams: 100, price: 190 },
      { grams: 130, price: 220 },
      { grams: 150, price: 250 },
      { grams: 170, price: 275 },
      { grams: 180, price: 285 }
    ];
    const candleJarPrice = fixedCandleJarPrices?.[candleJarNumber];
    const priceNumber = hasWeightVariants
      ? weightVariants[0].price
      : isLocalRoseCandle
        ? localRoseVariants[0].price
      : isSmallBubblesCandle
        ? 55
      : isElephantCandle
        ? 50
      : isBubblesCandle
        ? 55
      : isLargeBubblesCandle
        ? 170
      : isSingleTeaLight
        ? 15
      : isScentedTeaLight
        ? 30
      : isShapedTeaLight
        ? 35
      : isMiniDiffuser
        ? miniDiffuserVariants[0].price
      : isThreeCandleholders
        ? 120
      : isMetalCandleholder
        ? 150
      : isSingleSevouCandleholder
        ? 45
      : isSingleRoseCandle
        ? 20
      : isJouriGiftBoxCandle
        ? 100
      : isJouriRoseCandle
        ? 65
      : isSunflowerRoseCandle
        ? 25
      : isTulipRoseCandle
        ? 35
      : section.id === "dried-flowers-gallery"
        ? 30
        : isSmallWardrobeDiffuser
          ? 35
          : isArabicBathroomDiffuser
            ? 65
            : isRoseDiffuser
              ? 35
              : candleJarPrice
                ? candleJarPrice
                : 100 + ((productIndex - 1) % 8) * 25;
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
    info.append(type, title);

    if (hasWeightVariants) {
      const weightOptions = document.createElement("div");
      weightOptions.className = "weight-options";
      weightOptions.setAttribute("role", "group");
      weightOptions.setAttribute("aria-label", `خيارات وزن ${name}`);
      weightVariants.forEach((variant, variantIndex) => {
        const option = document.createElement("button");
        option.type = "button";
        option.className = "weight-option";
        option.dataset.grams = String(variant.grams);
        option.dataset.price = String(variant.price);
        if (variantIndex === 0) option.classList.add("active");
        option.innerHTML = `<strong>${new Intl.NumberFormat("ar-EG").format(variant.grams)} جرام</strong><span>${formatCurrency(variant.price)}</span>`;
        option.setAttribute("aria-pressed", variantIndex === 0 ? "true" : "false");
        option.addEventListener("click", () => {
          weightOptions.querySelectorAll(".weight-option").forEach(item => {
            item.classList.remove("active");
            item.setAttribute("aria-pressed", "false");
          });
          option.classList.add("active");
          option.setAttribute("aria-pressed", "true");
          card.dataset.price = variant.price;
          card.dataset.grams = variant.grams;
          price.textContent = formatCurrency(variant.price);
        });
        weightOptions.append(option);
      });
      card.dataset.grams = "50";
      info.append(weightOptions);
    }

    if (isMiniDiffuser) {
      const miniOptions = document.createElement("div");
      miniOptions.className = "weight-options";
      miniOptions.setAttribute("role", "group");
      miniOptions.setAttribute("aria-label", `خيارات ${name}`);
      miniDiffuserVariants.forEach((variant, variantIndex) => {
        const option = document.createElement("button");
        option.type = "button";
        option.className = "weight-option";
        option.dataset.option = variant.label;
        option.dataset.price = String(variant.price);
        if (variantIndex === 0) option.classList.add("active");
        option.innerHTML = `<strong>${variant.label}</strong><span>${formatCurrency(variant.price)}</span>`;
        option.setAttribute("aria-pressed", variantIndex === 0 ? "true" : "false");
        option.addEventListener("click", () => {
          miniOptions.querySelectorAll(".weight-option").forEach(item => {
            item.classList.remove("active");
            item.setAttribute("aria-pressed", "false");
          });
          option.classList.add("active");
          option.setAttribute("aria-pressed", "true");
          card.dataset.price = String(variant.price);
          card.dataset.option = variant.label;
          price.textContent = formatCurrency(variant.price);
        });
        miniOptions.append(option);
      });
      card.dataset.option = miniDiffuserVariants[0].label;
      info.append(miniOptions);
    }

    if (isLocalRoseCandle) {
      const sizeOptions = document.createElement("div");
      sizeOptions.className = "weight-options";
      sizeOptions.setAttribute("role", "group");
      sizeOptions.setAttribute("aria-label", `خيارات حجم ${name}`);
      localRoseVariants.forEach((variant, variantIndex) => {
        const option = document.createElement("button");
        option.type = "button";
        option.className = "weight-option";
        option.dataset.option = variant.label;
        option.dataset.price = String(variant.price);
        if (variantIndex === 0) option.classList.add("active");
        option.innerHTML = `<strong>${variant.label}</strong><span>${formatCurrency(variant.price)}</span>`;
        option.setAttribute("aria-pressed", variantIndex === 0 ? "true" : "false");
        option.addEventListener("click", () => {
          sizeOptions.querySelectorAll(".weight-option").forEach(item => {
            item.classList.remove("active");
            item.setAttribute("aria-pressed", "false");
          });
          option.classList.add("active");
          option.setAttribute("aria-pressed", "true");
          card.dataset.price = String(variant.price);
          card.dataset.option = variant.label;
          price.textContent = formatCurrency(variant.price);
        });
        sizeOptions.append(option);
      });
      card.dataset.option = localRoseVariants[0].label;
      info.append(sizeOptions);
    }

    info.append(bottom);
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

document.querySelectorAll(".category-card[href^='#'], .bestseller-category[href^='#'], .dropdown a[href^='#']").forEach(link => {
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
      const grams = card.dataset.grams;
      const option = card.dataset.option;
      const name = grams
        ? `${card.dataset.name} - ${new Intl.NumberFormat("ar-EG").format(Number(grams))} جرام`
        : option
          ? `${card.dataset.name} - ${option}`
          : card.dataset.name;
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
