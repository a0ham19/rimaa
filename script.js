const formatCurrency = value => `${new Intl.NumberFormat("ar-EG").format(value)} ج.م`;
const cart = loadCart();
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const cartButton = document.getElementById("cartButton");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
let cartHasRendered = false;
const addFeedbackTimers = new WeakMap();
let cartToastTimer = 0;

function sanitizeCartQuantity(value) {
  return parseCartQuantity(value) ?? 1;
}

function parseCartQuantity(value) {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !value.trim()) return null;
  const quantity = Number(value);
  return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : null;
}

function addCartQuantities(first, second) {
  const current = parseCartQuantity(first);
  const added = parseCartQuantity(second);
  if (current === null || added === null) return null;
  return current > Number.MAX_SAFE_INTEGER - added
    ? Number.MAX_SAFE_INTEGER
    : current + added;
}

function sanitizeCartPrice(value) {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !value.trim()) return null;
  const price = Number(value);
  if (!Number.isFinite(price) || price < 0) return null;
  const cents = Math.round((price + Number.EPSILON) * 100);
  return Number.isSafeInteger(cents) ? cents / 100 : null;
}

function getCartItemKey(item) {
  const productId = typeof item.productId === "string" ? item.productId.trim() : "";
  const name = typeof item.name === "string" ? item.name.trim() : "";
  return JSON.stringify([productId, name]);
}

function getCartItemCount(items = cart) {
  return items.reduce((total, item) => {
    const quantity = parseCartQuantity(item.quantity);
    if (quantity === null) return total;
    return total > Number.MAX_SAFE_INTEGER - quantity
      ? Number.MAX_SAFE_INTEGER
      : total + quantity;
  }, 0);
}

function calculateCartSubtotal(items = cart) {
  const total = items.reduce((sum, item) => {
    const price = sanitizeCartPrice(item.priceNumber);
    const quantity = parseCartQuantity(item.quantity);
    return price === null || quantity === null ? sum : sum + price * quantity;
  }, 0);
  return Math.round((total + Number.EPSILON) * 100) / 100;
}

function loadCart() {
  try {
    const stored = JSON.parse(localStorage.getItem("rimaa-cart") || "[]");
    if (!Array.isArray(stored)) return [];
    const restored = new Map();
    stored.forEach(item => {
      if (!item || typeof item.name !== "string" || !item.name.trim()) return;
      const productId = typeof item.productId === "string" ? item.productId.trim() : "";
      if (!productId) return;
      const priceNumber = sanitizeCartPrice(item.priceNumber);
      if (priceNumber === null) return;
      const quantity = parseCartQuantity(item.quantity);
      if (quantity === null) return;
      const normalized = {
        ...item,
        name: item.name.trim(),
        price: formatCurrency(priceNumber),
        priceNumber,
        quantity,
        productId,
        image: typeof item.image === "string" && item.image.trim()
          ? item.image
          : "assets/product3.jpg"
      };
      const key = getCartItemKey(normalized);
      const existing = restored.get(key);
      if (existing) {
        existing.quantity = addCartQuantities(existing.quantity, quantity);
      } else {
        restored.set(key, normalized);
      }
    });
    return Array.from(restored.values());
  } catch (error) {
    console.warn("Unable to load the saved cart; starting with an empty cart.", error);
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem("rimaa-cart", JSON.stringify(cart));
  } catch (error) {
    console.warn("Unable to save the cart to local storage.", error);
  }
}

const categoryGalleries = document.querySelectorAll(".category-gallery");
const diffusersGrid = document.getElementById("diffusersGrid");
const diffuserProductGroups = [
  {
    productNumbers: [1, 2, 3, 4],
    name: "فواحة الدولاب الكبيرة 🌸",
    price: 35,
    descriptionKey: "wardrobe"
  },
  {
    productNumbers: [5],
    name: "فواحة الحمام أو العربية 🌸",
    price: 65,
    descriptionKey: "bathroom"
  },
  {
    productNumbers: [6],
    name: "فواحة الدولاب الصغيرة – وردة عباد الشمس 🌻",
    price: 35,
    descriptionKey: "sunflower"
  },
  {
    productNumbers: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    name: "فواحات ورده",
    price: 35
  },
  {
    productNumbers: [18],
    name: "فواحات ميني – قلب وسحابة ☁️❤️",
    price: 30,
    descriptionKey: "mini"
  }
];
const candleholderProducts = {
  1: { name: "شمعدان الثلاثه مع بعض", price: 120 },
  2: { name: "شمعدان الثلاثه مع بعض", price: 120 },
  3: { name: "شمعدان معدن", price: 150 },
  4: { name: "شمعدان للسبوع (الواحده)", price: 45 }
};
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
  const isCandleCategory = [
    "candles-gallery",
    "flower-candles-gallery",
    "shaped-candles-gallery",
    "tea-lights-gallery",
    "winter-gallery"
  ].includes(section.id);
  const images = Array.from(grid.querySelectorAll(".collection-photo img"));
  const cards = images.map((image, imageIndex) => {
    productIndex++;
    const originalProductNumber = Number(image.closest(".collection-photo")?.dataset.productNumber);
    const productNumber = originalProductNumber || (imageIndex + 1);
    const diffuserProduct = section.id === "diffusers-gallery"
      ? diffuserProductGroups.find(group => group.productNumbers.includes(productNumber))
      : null;
    const candleholderProduct = section.id === "candleholders-gallery"
      ? candleholderProducts[productNumber]
      : null;
    const isMiniDiffuser = diffuserProduct?.descriptionKey === "mini";
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
    const isLargeBubblesCandle =
      section.id === "shaped-candles-gallery" && productNumber === 4;
    const isSingleTeaLight =
      section.id === "tea-lights-gallery" && productNumber === 1;
    const isScentedTeaLight =
      section.id === "tea-lights-gallery" && productNumber === 2;
    const isRoseTeaLight =
      section.id === "tea-lights-gallery" && productNumber === 3;
    const isHeartTeaLight =
      section.id === "tea-lights-gallery" && productNumber === 4;
    const isButterflyTeaLight =
      section.id === "tea-lights-gallery" && productNumber === 5;
    const isShapedTeaLight =
      section.id === "tea-lights-gallery" &&
      (productNumber === 3 || productNumber === 4 || productNumber === 5);
    const isDriedFlowers = section.id === "dried-flowers-gallery";
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
    const mappedCategoryProductName = diffuserProduct?.name || candleholderProduct?.name;
    const name = isCandleJar
      ? "جار معطر 30 جرام 🕯️"
      : isPumpkinCandle
        ? "شمعة جار اليقطينة – كونكريت 🎃"
        : isScentedCoconutVanillaJar
          ? "جار شمع معطر – جوز الهند والفانيليا 🥥"
        : isScentedBerryJar
          ? "جار شمع معطر – التوت والفراولة 🍓"
        : isBerryVanillaJar
          ? "جار شمع معطر – التوت والفانيليا 🫐"
        : isAmberVanillaJar
          ? "جار شمع معطر – العنبر والفانيليا 🤎"
        : isStrawberryVanillaJar
          ? "جار شمع معطر – الفراولة والفانيليا 🍓"
        : isMuskJasmineJar
          ? "جار شمع معطر – المسك والياسمين 🤍"
        : mappedCategoryProductName
          ? mappedCategoryProductName
          : isJouriGiftBoxCandle
            ? "شمعة وردة الجوري في علبة هدايا 🌹"
          : isSingleRoseCandle
                      ? "شمعة وردة الكرومبة 🌷"
                        : isJouriRoseCandle
                          ? "شمعة وردة الجوري 🌹"
                          : isSunflowerRoseCandle
                              ? "شمعة وردة عباد الشمس 🌻"
                            : isTulipRoseCandle
                              ? "شمعة وردة التوليب 🌷"
                              : isLocalRoseCandle
                                ? "شمعة الورد البلدي 🌹"
                                : isSmallBubblesCandle
                                  ? "شمعة بابلز الصغيرة 🫧"
                                  : isElephantCandle
                                    ? "شمعة الفيلة 🐘"
                                    : isLargeBubblesCandle
                                        ? "شمعة بابلز الكبيرة 🫧"
                                        : isSingleTeaLight
                                          ? "شمعة تي لايت مدوّرة – أبيض (غير معطرة) 🤍"
                                          : isScentedTeaLight
                                              ? "شمعة تي لايت مدوّرة معطرة – أحمر ❤️"
                                              : isRoseTeaLight
                                                ? "شمعة تي لايت بشكل وردة – معطرة 🌸"
                                                : isHeartTeaLight
                                                  ? "شمعة تي لايت بشكل قلب – معطرة ❤️"
                                                    : isButterflyTeaLight
                                                      ? "شمعة تي لايت بشكل فراشة – معطرة 🦋"
                                                      : isShapedTeaLight
                                              ? "تي لايت اشكال (الواحده)"
                                              : isDriedFlowers
                                                ? "الورد المجفف 👀"
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
      : diffuserProduct?.price !== undefined
        ? diffuserProduct.price
      : candleholderProduct
        ? candleholderProduct.price
      : isSmallBubblesCandle
        ? 55
      : isElephantCandle
        ? 50
      : isLargeBubblesCandle
        ? 170
      : isSingleTeaLight
        ? 15
      : isScentedTeaLight
        ? 30
      : isShapedTeaLight
        ? 35
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
    const imageLink = document.createElement("a");
    const titleLink = document.createElement("a");
    const productId = `${section.id}-${productNumber}`;

    card.className = isCandleCategory ? "product-card candle-spotlight" : "product-card";
    card.dataset.name = name;
    card.dataset.price = String(priceNumber);
    card.dataset.productId = productId;
    card.dataset.categoryGallery = section.id;
    if (diffuserProduct?.descriptionKey === "wardrobe") {
      card.dataset.description =
        "الوصف: قطعة معطرة تُستخدم لتعطير الدولاب والحفاظ على رائحة الملابس والمفروشات منعشة ومعطرة.\n\nطريقة الاستخدام: توضع داخل الدولاب أو بين الملابس، وتُترك لتعطير المساحة المحيطة بها.\n\nمميزاتها: تساعد على انتشار الرائحة داخل الدولاب، وتمنح ملابسك رائحة لطيفة كلما فتحتيه.";
    }
    if (diffuserProduct?.descriptionKey === "bathroom") {
      card.dataset.description =
        "الوصف: فواحة معطرة بحجم عملي، مناسبة لتعطير الحمام أو السيارة، وتتميز برائحة واضحة ومنتشرة ممكن توصل لباقي أرجاء البيت.\n\nطريقة الاستخدام: توضع في الحمام أو داخل السيارة في مكان ثابت ومناسب.\n\nمميزاتها: مش بس للحمام أو العربية، ريحتها ممكن تنتشر في البيت كله حسب مساحة المكان والتهوية.";
    }
    if (diffuserProduct?.descriptionKey === "sunflower") {
      card.dataset.description =
        "الوصف: فواحة معطرة بتصميم وردة عباد الشمس، تجمع بين الشكل اللطيف والرائحة المميزة، وتضيف لمسة جمالية لدولابك.\n\nطريقة الاستخدام: توضع داخل الدولاب أو بين الملابس لتعطير المساحة المحيطة بها.\n\nمميزاتها: حجم صغير وعملي، مناسب للدولاب والأدراج والمساحات الصغيرة.";
    }
    if (isMiniDiffuser) {
      card.dataset.description =
        "الوصف: فواحات معطرة صغيرة بأشكال لطيفة، مناسبة لتعطير الشنط والأدراج ووحدات التخزين والمساحات الصغيرة.\n\nطريقة الاستخدام: توضع داخل الشنطة أو الدرج أو مكان التخزين لتعطيره وإضافة رائحة جميلة لمحتوياته.\n\nمميزاتها: حجم صغير وعملي، تجمع بين التعطير والشكل الكيوت.";
    }
    if (isDriedFlowers) {
      card.dataset.description =
        "الوصف: لمسة جمالية بسيطة تضيف رقة وأناقة لأي مكان، ومناسب لتزيين السفرة في العشاء الرومانسي وأعياد الميلاد والمناسبات المختلفة.\n\nالاستخدامات:\n\n- تزيين السفرة والديكورات الرومانسية.\n- تنسيق أعياد الميلاد والمناسبات.\n- إضافة لمسة جمالية لتصوير المنتجات.";
    }
    if (isSingleRoseCandle) {
      card.dataset.description =
        "الوصف: شمعة بتصميم وردة الكرومبة المميز، تجمع بين شكل الوردة الطبيعي والتفاصيل الرقيقة، لتكون قطعة ديكور لطيفة تضيف لمسة جمالية لأي مكان.\n\nالاستخدام: مناسبة للديكور والهدايا، ويمكن إشعالها للاستمتاع بإضاءة دافئة وأجواء هادئة.";
    }
    if (isJouriGiftBoxCandle) {
      card.dataset.description =
        "الوصف: شمعة بتصميم وردة الجوري بتفاصيلها الرقيقة وبتلاتها المتناسقة، تجمع بين جمال الورد والإضاءة الدافئة، وتضيف لمسة أنيقة لأي ركن.\n\nالاستخدام: مناسبة للديكور والهدايا والمناسبات المميزة، ويمكن إشعالها لإضفاء أجواء هادئة ولطيفة.";
    }
    if (isJouriRoseCandle) {
      card.dataset.description =
        "الوصف: شمعة بتصميم وردة الجوري بتفاصيلها الرقيقة وبتلاتها المتناسقة، تجمع بين جمال الورد والإضاءة الدافئة، وتضيف لمسة أنيقة لأي ركن.\n\nالاستخدام: مناسبة للديكور والهدايا والمناسبات المميزة، ويمكن إشعالها لإضفاء أجواء هادئة ولطيفة.";
    }
    if (isSunflowerRoseCandle) {
      card.dataset.description =
        "الوصف: شمعة بتصميم وردة عباد الشمس، بتفاصيل جميلة تضيف لمسة مبهجة ومميزة للديكور.\n\nالاستخدامات:\n\n- تزيين البانيو لإضافة أجواء رومانسية وهادية.\n- استخدامها بدلًا من شموع التي لايت في تزيين السفرة.\n- مناسبة للهدايا وتنسيقات المناسبات.";
    }
    if (isTulipRoseCandle) {
      card.dataset.description =
        "الوصف: شمعة بتصميم زهرة التوليب الرقيقة، بتفاصيل بسيطة وأنيقة تجمع بين جمال الورد ولمسة الديكور المميزة.\n\nالاستخدامات:\n\n- تزيين أركان البيت وإضافة لمسة رقيقة.\n- مناسبة للهدايا والمناسبات المختلفة.\n- استخدامها في تنسيق السفرة والديكورات الرومانسية.";
    }
    if (isLocalRoseCandle) {
      card.dataset.description =
        "الوصف: شمعة بتصميم الوردة البلدي بتفاصيل بتلاتها الطبيعية، تجمع بين البساطة والرقة، وتضيف لمسة وردية أنيقة لأي مكان.\n\nالأحجام المتاحة:\n\n- حجم كبير.\n- حجم صغير.\n\nالاستخدام: مناسبة للديكور والهدايا وتنسيق المناسبات، ويمكن استخدامها لإضافة أجواء دافئة ومميزة.";
    }
    if (isSmallBubblesCandle) {
      card.dataset.description =
        "الوصف: شمعة بتصميم فقاعات متناسقة، بشكل عصري وبسيط يضيف لمسة ديكورية مميزة لأي ركن.\n\nالاستخدام: مناسبة لتزيين الغرف والمكاتب، وتنسيق الهدايا والبوكسات والمناسبات المختلفة.";
    }
    if (isElephantCandle) {
      card.dataset.description =
        "الوصف: شمعة بتصميم فيل لطيف ومميز، بتفاصيل رقيقة تضيف لمسة مرحة وجميلة للديكور.\n\nالاستخدام: مناسبة لهدايا استقبال المولود والسبوع، وتزيين غرف الأطفال وتنسيق البوكسات والهدايا.";
    }
    if (isLargeBubblesCandle) {
      card.dataset.description =
        "الوصف: شمعة بتصميم الفقاعات المميز بحجم أكبر، تجمع بين الشكل العصري والأناقة، وتعتبر قطعة ديكورية تلفت الانتباه وتضيف لمسة مختلفة للمكان.\n\nالاستخدام: مناسبة لتزيين أركان البيت والمكاتب، وتنسيق الهدايا والبوكسات والمناسبات.";
    }
    if (isSingleTeaLight) {
      card.dataset.description =
        "الوصف: شمعة صغيرة بتصميم دائري بسيط ولون أبيض كلاسيكي، مناسبة للإضاءة والديكور دون إضافة أي رائحة عطرية.\n\nالاستخدام: مناسبة للشمعدانات والفوانيس، وتزيين السفرة والبانيو والديكورات الرومانسية والمناسبات المختلفة.\n\nمميزاتها: اختيار مثالي للي بيفضلوا الإضاءة الهادية بدون عطور.";
    }
    if (isScentedTeaLight) {
      card.dataset.description =
        "الوصف: شمعة تي لايت صغيرة باللون الأحمر، بتصميم بسيط وأنيق، تجمع بين الإضاءة الهادئة والرائحة العطرية اللطيفة.\n\nالاستخدام: مناسبة للاستخدام في الشمعدانات والفوانيس، وتزيين السفرة والديكورات الرومانسية والمناسبات المختلفة.\n\nمميزاتها: تضيف لمسة من الدفء واللون للمكان، مع رائحة عطرية مميزة.";
    }
    if (isRoseTeaLight) {
      card.dataset.description =
        "الوصف: شمعة تي لايت بتصميم وردة رقيق، تجمع بين الشكل الجمالي والإضاءة الهادئة مع رائحة عطرية لطيفة.\n\nالاستخدام: مناسبة للشمعدانات وتزيين السفرة والديكورات الرومانسية، وكمان لإضافة لمسة مميزة للهدايا والمناسبات.\n\nمميزاتها: شكل وردة أنيق يجمع بين التعطير والديكور في قطعة واحدة.";
    }
    if (isHeartTeaLight) {
      card.dataset.description =
        "الوصف: شمعة تي لايت بتصميم قلب رقيق، تجمع بين الشكل الرومانسي والإضاءة الهادئة مع رائحة عطرية لطيفة.\n\nالاستخدام: مناسبة لتزيين السفرة في المناسبات الرومانسية، وتنسيق الهدايا والبوكسات، وإضافة لمسة مميزة للديكور.\n\nمميزاتها: تصميم لطيف يجمع بين الرائحة العطرية والأجواء الرومانسية.";
    }
    if (isButterflyTeaLight) {
      card.dataset.description =
        "الوصف: شمعة تي لايت بتصميم فراشة رقيق ومميز، تجمع بين الشكل اللطيف والإضاءة الهادئة مع رائحة عطرية جميلة.\n\nالاستخدام: مناسبة لتزيين السفرة والديكورات، وتنسيق الهدايا والبوكسات والمناسبات المختلفة.\n\nمميزاتها: تصميم مختلف يضيف لمسة رقيقة ومبهجة لأي مكان.";
    }
    if (isCandleJar) {
      card.dataset.description =
        "حجم صغير وعملي، مناسب للتوزيعات والهدايا، وكمان مثالي لتجربة أي عطر قبل اختيار الحجم الأكبر. يُستخدم لتعطير المساحات المناسبة لحجمه. ❤️";
    }
    if (isPumpkinCandle) {
      card.dataset.description =
        "الوزن: 80 جرام.\n\nالوصف: شمعة معطرة داخل جار كونكريت بتصميم اليقطينة، تجمع بين الرائحة المميزة والشكل الديكوري الأنيق.\n\nالعطر: اختاري العطر المفضل ليكي من الروائح المتاحة.\n\nالاستخدام: لتعطير المكان وإضافة لمسة جمالية لديكور البيت.\n\nميزة إضافية: بعد انتهاء الشمعة، تقدري تعيدي استخدام الجار كمنظّم للإكسسوارات أو الأدوات الصغيرة.";
    }
    if (isScentedCoconutVanillaJar) {
      card.dataset.description =
        "الوصف: مزيج دافئ وناعم من جوز الهند الكريمي والفانيليا الحلوة، برائحة هادية ومريحة تفكّرك بأجواء الحلويات والحليب الكريمي وأجواء شهر رمضان المبارك.\n\nالحجم: اختاري الحجم المناسب ليكي من الأحجام المتاحة.\n\nالاستخدام: يُستخدم لتعطير المكان وإضافة أجواء دافئة ومميزة للبيت.";
    }
    if (isScentedBerryJar) {
      card.dataset.description =
        "الوصف: من الروائح الشوجري (الحلوة)، مزيج فاكهي يجمع بين حلاوة الفراولة ولمسة التوت الغنية، برائحة سكرية منعشة تشبه حلوى الفواكه الحمراء.\n\nالحجم: اختاري الحجم المناسب ليكي من الأحجام المتاحة.\n\nالاستخدام: يُستخدم في الفواحة لتعطير المكان وإضافة رائحة حلوة ومميزة.";
    }
    if (isBerryVanillaJar) {
      card.dataset.description =
        "الوصف: من الروائح الشوجري الهادية، مزيج بين حلاوة التوت الفاكهية ونعومة الفانيليا الكريمية، برائحة سكرية رقيقة ومتوازنة من غير ما تكون حادة أو تقيلة.\n\nالحجم: اختاري الحجم المناسب ليكي من الأحجام المتاحة.\n\nالاستخدام: يُستخدم في تعطير المكان وإضافة لمسة حلوة وهادية.";
    }
    if (isStrawberryVanillaJar) {
      card.dataset.description =
        "الوصف: من الروائح الشوجري الهادية، مزيج يجمع بين حلاوة الفراولة الفاكهية ونعومة الفانيليا الكريمية، برائحة سكرية رقيقة ودافئة تشبه حلوى الفراولة بالفانيليا.\n\nالحجم: اختاري الحجم المناسب ليكي من الأحجام المتاحة.\n\nالاستخدام: يُستخدم في تعطير المكان وإضافة لمسة حلوة وناعمة.";
    }
    if (isAmberVanillaJar) {
      card.dataset.description =
        "الوصف: من الروائح الدافئة والشرقية، مزيج يجمع بين عمق العنبر ولمسة الفانيليا الكريمية الحلوة، برائحة ناعمة وغنية فيها إحساس بالفخامة والهدوء.\n\nالحجم: اختاري الحجم المناسب ليكي من الأحجام المتاحة.\n\nالاستخدام: يُستخدم في الفواحة لتعطير المكان وإضافة أجواء دافئة ومميزة.\n\nاقتراح هدية: اختيار لطيف ومختلف لهدية خطيبك أو زوجك أو أخوكي، وكمان هدية مناسبة لمكتب العمل.";
    }
    if (isMuskJasmineJar) {
      card.dataset.description =
        "الوصف: من الروائح الهادية والناعمة، مزيج يجمع بين نظافة المسك ونعومة زهور الياسمين، برائحة زهرية منعشة ونظيفة فيها إحساس بالانتعاش والراحة.\n\nالحجم: اختاري الحجم المناسب ليكي من الأحجام المتاحة.\n\nالاستخدام: يُستخدم في تعطير المكان وإضافة أجواء منعشة وهادية.";
    }
    imageWrapper.className = "product-image";
    info.className = "product-info";
    type.textContent = categoryName;
    title.textContent = name;
    imageLink.className = "product-image-link";
    imageLink.href = `#product/${encodeURIComponent(productId)}`;
    imageLink.dataset.productLink = productId;
    imageLink.setAttribute("aria-label", `عرض تفاصيل ${name}`);
    titleLink.className = "product-title-link";
    titleLink.href = imageLink.href;
    titleLink.dataset.productLink = productId;
    titleLink.append(title);
    bottom.className = "product-bottom";
    price.textContent = formatCurrency(priceNumber);
    addButton.className = "add-button";
    addButton.type = "button";
    addButton.textContent = "أضيفي للسلة";
    quickAdd.className = "quick-add";
    quickAdd.type = "button";
    quickAdd.setAttribute("aria-label", `إضافة ${name} إلى السلة`);
    quickAdd.textContent = "+";

    imageLink.append(image);
    imageWrapper.append(imageLink, quickAdd);
    bottom.append(price, addButton);
    info.append(type, titleLink);

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
          selectedProductVariants.set(card.dataset.productId, {
            grams: String(variant.grams),
            option: ""
          });
          price.textContent = formatCurrency(variant.price);
          applyCatalogFilters();
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
          selectedProductVariants.set(card.dataset.productId, {
            grams: "",
            option: variant.label
          });
          price.textContent = formatCurrency(variant.price);
          applyCatalogFilters();
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
          selectedProductVariants.set(card.dataset.productId, {
            grams: "",
            option: variant.label
          });
          price.textContent = formatCurrency(variant.price);
          applyCatalogFilters();
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

const catalogGrid = document.getElementById("shopProductGrid");
const catalogCards = Array.from(document.querySelectorAll(".product-card"));
const catalogCategory = document.getElementById("catalogCategory");
const catalogSearchInput = document.getElementById("catalogSearchInput");
const modalSearchInput = document.getElementById("searchInput");
const clearCatalogSearch = document.getElementById("clearCatalogSearch");
const catalogPriceMin = document.getElementById("catalogPriceMin");
const catalogPriceMax = document.getElementById("catalogPriceMax");
const catalogSort = document.getElementById("catalogSort");
const catalogFilters = document.getElementById("catalogFilters");
const catalogFilterBackdrop = document.getElementById("catalogFilterBackdrop");
const openCatalogFilters = document.getElementById("openCatalogFilters");
const catalogFilterMedia = window.matchMedia("(max-width: 760px)");
const catalogCategoryNames = new Map(
  Array.from(categoryGalleries, gallery => [
    gallery.id,
    gallery.querySelector(".collection-heading h2")?.textContent.replace(/^مجموعة\s*/, "").trim() || ""
  ])
);

catalogCards.forEach((card, index) => {
  card.dataset.catalogOrder = String(index);
  catalogGrid.append(card);
});

Array.from(new Set(catalogCards.map(card => card.dataset.categoryGallery)))
  .filter(Boolean)
  .forEach(categoryId => {
    const option = document.createElement("option");
    option.value = categoryId;
    option.textContent = catalogCategoryNames.get(categoryId) || categoryId;
    catalogCategory.append(option);
  });

function normalizeCatalogText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("ar")
    .trim()
    .replace(/\s+/g, " ");
}

function getCatalogSearchText(card) {
  return [
    card.dataset.name,
    card.querySelector(".product-info > p")?.textContent,
    card.dataset.scent,
    card.dataset.description
  ]
    .map(normalizeCatalogText)
    .filter(Boolean)
    .join(" ");
}

function readPriceFilter(input) {
  if (!input.value.trim()) {
    input.removeAttribute("aria-invalid");
    return null;
  }
  const value = Number(input.value);
  const isValid = Number.isFinite(value) && value >= 0;
  input.setAttribute("aria-invalid", String(!isValid));
  return isValid ? value : null;
}

function getCatalogPrice(card) {
  const rawPrice = card.dataset.price;
  if (typeof rawPrice !== "string" || !rawPrice.trim()) return null;
  const price = Number(rawPrice);
  return Number.isFinite(price) && price >= 0 ? price : null;
}

function renderActiveCatalogFilters(query, minimum, maximum) {
  const container = document.getElementById("catalogActiveFilters");
  const filters = [];
  const categoryId = catalogCategory.value;

  if (query) filters.push({ key: "search", label: `البحث: ${catalogSearchInput.value.trim()}` });
  if (categoryId) {
    filters.push({
      key: "category",
      label: `التصنيف: ${catalogCategory.options[catalogCategory.selectedIndex].textContent}`
    });
  }
  if (minimum !== null) filters.push({ key: "minimum", label: `من ${formatCurrency(minimum)}` });
  if (maximum !== null) filters.push({ key: "maximum", label: `حتى ${formatCurrency(maximum)}` });

  container.replaceChildren();
  filters.forEach(filter => {
    const chip = document.createElement("button");
    const label = document.createElement("span");
    const close = document.createElement("span");
    chip.type = "button";
    chip.className = "catalog-filter-chip";
    chip.dataset.filterKey = filter.key;
    chip.setAttribute("aria-label", `إزالة ${filter.label}`);
    label.textContent = filter.label;
    close.textContent = "×";
    close.setAttribute("aria-hidden", "true");
    chip.append(label, close);
    container.append(chip);
  });
  container.hidden = filters.length === 0;
  document.getElementById("clearCatalogFilters").hidden = filters.length === 0;
}

function applyCatalogFilters({ animate = true } = {}) {
  const query = normalizeCatalogText(catalogSearchInput.value);
  const queryTerms = query ? query.split(" ") : [];
  const categoryId = catalogCategory.value;
  const minimum = readPriceFilter(catalogPriceMin);
  const maximum = readPriceFilter(catalogPriceMax);
  const matchingCards = [];

  catalogCards.forEach(card => {
    const searchableText = getCatalogSearchText(card);
    const rawPrice = getCatalogPrice(card);
    const validPrice = rawPrice !== null;
    const matchesSearch = queryTerms.every(term => searchableText.includes(term));
    const matchesCategory = !categoryId || card.dataset.categoryGallery === categoryId;
    const matchesMinimum = minimum === null || (validPrice && rawPrice >= minimum);
    const matchesMaximum = maximum === null || (validPrice && rawPrice <= maximum);
    const matches = matchesSearch && matchesCategory && matchesMinimum && matchesMaximum;

    card.style.display = matches ? "" : "none";
    if (matches) matchingCards.push(card);
  });

  const sortMode = catalogSort.value;
  matchingCards.sort((first, second) => {
    const firstPrice = getCatalogPrice(first);
    const secondPrice = getCatalogPrice(second);
    const firstHasPrice = firstPrice !== null;
    const secondHasPrice = secondPrice !== null;

    if (sortMode === "price-ascending" || sortMode === "price-descending") {
      if (firstHasPrice !== secondHasPrice) return firstHasPrice ? -1 : 1;
      if (firstHasPrice && firstPrice !== secondPrice) {
        return sortMode === "price-ascending" ? firstPrice - secondPrice : secondPrice - firstPrice;
      }
    } else if (sortMode === "name-ascending") {
      const byName = (first.dataset.name || "").localeCompare(second.dataset.name || "", "ar");
      if (byName) return byName;
    }

    return Number(first.dataset.catalogOrder) - Number(second.dataset.catalogOrder);
  });

  matchingCards.forEach(card => catalogGrid.append(card));
  const count = new Intl.NumberFormat("ar-EG");
  document.getElementById("catalogResultCount").textContent =
    `${count.format(matchingCards.length)} من ${count.format(catalogCards.length)} منتج`;
  document.getElementById("productEmptyState").hidden = matchingCards.length !== 0;
  modalSearchInput.value = catalogSearchInput.value;
  clearCatalogSearch.hidden = !catalogSearchInput.value.trim();
  renderActiveCatalogFilters(query, minimum, maximum);

  if (animate) {
    catalogGrid.classList.remove("is-updating");
    void catalogGrid.offsetWidth;
    catalogGrid.classList.add("is-updating");
  }
}

function syncCatalogSearch(value) {
  catalogSearchInput.value = value;
  modalSearchInput.value = value;
  applyCatalogFilters();
}

function clearCatalogState() {
  catalogSearchInput.value = "";
  modalSearchInput.value = "";
  catalogCategory.value = "";
  catalogPriceMin.value = "";
  catalogPriceMax.value = "";
  applyCatalogFilters();
}

function closeCatalogFilterDrawer(restoreFocus = true) {
  if (!catalogFilterMedia.matches || !catalogFilters.classList.contains("is-open")) return;
  catalogFilters.classList.remove("is-open");
  catalogFilterBackdrop.hidden = true;
  document.body.classList.remove("catalog-filters-open");
  catalogFilters.setAttribute("aria-hidden", "true");
  catalogFilters.inert = true;
  catalogFilters.removeAttribute("role");
  catalogFilters.removeAttribute("aria-modal");
  openCatalogFilters.setAttribute("aria-expanded", "false");
  if (restoreFocus) openCatalogFilters.focus();
}

function openCatalogFilterDrawer() {
  if (!catalogFilterMedia.matches) return;
  catalogFilters.classList.add("is-open");
  catalogFilterBackdrop.hidden = false;
  document.body.classList.add("catalog-filters-open");
  catalogFilters.setAttribute("aria-hidden", "false");
  catalogFilters.setAttribute("role", "dialog");
  catalogFilters.setAttribute("aria-modal", "true");
  catalogFilters.inert = false;
  openCatalogFilters.setAttribute("aria-expanded", "true");
  document.getElementById("closeCatalogFilters").focus();
}

function syncCatalogFilterMode() {
  if (catalogFilterMedia.matches) {
    catalogFilters.setAttribute("aria-hidden", "true");
    catalogFilters.inert = true;
    catalogFilters.removeAttribute("role");
    catalogFilters.removeAttribute("aria-modal");
    openCatalogFilters.setAttribute("aria-expanded", "false");
  } else {
    catalogFilters.classList.remove("is-open");
    catalogFilterBackdrop.hidden = true;
    document.body.classList.remove("catalog-filters-open");
    catalogFilters.setAttribute("aria-hidden", "false");
    catalogFilters.inert = false;
    catalogFilters.removeAttribute("role");
    catalogFilters.removeAttribute("aria-modal");
    openCatalogFilters.setAttribute("aria-expanded", "false");
  }
}

catalogSearchInput.addEventListener("input", event => syncCatalogSearch(event.currentTarget.value));
modalSearchInput.addEventListener("input", event => syncCatalogSearch(event.currentTarget.value));
clearCatalogSearch.addEventListener("click", () => syncCatalogSearch(""));
catalogCategory.addEventListener("change", () => applyCatalogFilters());
catalogPriceMin.addEventListener("input", () => applyCatalogFilters());
catalogPriceMax.addEventListener("input", () => applyCatalogFilters());
catalogSort.addEventListener("change", () => applyCatalogFilters());
document.getElementById("clearCatalogFilters").addEventListener("click", clearCatalogState);
document.getElementById("resetCatalog").addEventListener("click", clearCatalogState);
document.getElementById("applyCatalogFilters").addEventListener("click", () => closeCatalogFilterDrawer());
document.getElementById("closeCatalogFilters").addEventListener("click", () => closeCatalogFilterDrawer());
catalogFilterBackdrop.addEventListener("click", () => closeCatalogFilterDrawer());
openCatalogFilters.addEventListener("click", openCatalogFilterDrawer);
document.getElementById("catalogActiveFilters").addEventListener("click", event => {
  const chip = event.target.closest("[data-filter-key]");
  if (!chip) return;
  if (chip.dataset.filterKey === "search") {
    catalogSearchInput.value = "";
    modalSearchInput.value = "";
  } else if (chip.dataset.filterKey === "category") {
    catalogCategory.value = "";
  } else if (chip.dataset.filterKey === "minimum") {
    catalogPriceMin.value = "";
  } else if (chip.dataset.filterKey === "maximum") {
    catalogPriceMax.value = "";
  }
  applyCatalogFilters();
});
document.addEventListener("keydown", event => {
  if (event.key !== "Tab" || !catalogFilterMedia.matches || !catalogFilters.classList.contains("is-open")) return;
  const focusable = Array.from(catalogFilters.querySelectorAll(
    "button:not([disabled]):not([hidden]), select:not([disabled]), input:not([disabled])"
  )).filter(element => element.getClientRects().length);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
if (catalogFilterMedia.addEventListener) {
  catalogFilterMedia.addEventListener("change", syncCatalogFilterMode);
} else {
  catalogFilterMedia.addListener(syncCatalogFilterMode);
}
syncCatalogFilterMode();
applyCatalogFilters({ animate: false });

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let revealObserver;
const hero = document.querySelector(".hero");
const sceneImages = new Set();
const ambientSections = document.querySelectorAll(".categories, .products-section, .story");
const interactiveCards = document.querySelectorAll(".product-card");
const magneticElements = document.querySelectorAll(".hero .primary-button, .checkout-button");

document.querySelectorAll(".hero h1").forEach(heading => {
  Array.from(heading.childNodes).forEach(node => {
    if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) return;
    const line = document.createElement("span");
    line.className = "hero-line";
    line.textContent = node.textContent;
    heading.replaceChild(line, node);
  });
});
document.body.classList.add("motion-ready");

function scrollToElement(element) {
  element.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth" });
}

function updateHeroParallax() {
  if (!hero || reducedMotion.matches || window.matchMedia("(pointer: coarse)").matches) return;
  const bounds = hero.getBoundingClientRect();
  if (bounds.bottom <= 0) return;
  const offset = Math.min(Math.max(-bounds.top * 0.045, 0), 24);
  hero.style.setProperty("--hero-parallax", `${offset.toFixed(1)}px`);
}

let parallaxFrame = 0;
function updateScrollMotion() {
  parallaxFrame = 0;
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? Math.min(window.scrollY / scrollableHeight, 1) : 0;
  document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));
  updateHeroParallax();
  if (reducedMotion.matches) return;

  const intensity = window.matchMedia("(max-width: 700px), (pointer: coarse)").matches ? 0.45 : 1;
  sceneImages.forEach(image => {
    const bounds = image.getBoundingClientRect();
    const progressThroughView = Math.min(Math.max(
      (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height),
      0
    ), 1);
    const centeredProgress = progressThroughView - 0.5;
    image.style.setProperty("--scene-shift", `${(centeredProgress * 14 * intensity).toFixed(1)}px`);
    image.style.setProperty("--scene-scale", (1.025 + progressThroughView * 0.02 * intensity).toFixed(3));
    if (image.closest(".story-image")) {
      const centerOffset = (bounds.top + bounds.height * 0.5 - window.innerHeight * 0.52) / (window.innerHeight * 0.72);
      const candlelight = Math.max(0, 1 - Math.abs(centerOffset)) * intensity;
      image.style.setProperty("--candlelight", (candlelight * 0.68).toFixed(3));
    }
  });
}

function scheduleScrollMotion() {
  if (parallaxFrame) return;
  parallaxFrame = window.requestAnimationFrame(updateScrollMotion);
}

window.addEventListener("scroll", scheduleScrollMotion, { passive: true });
window.addEventListener("resize", scheduleScrollMotion, { passive: true });
scheduleScrollMotion();

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });

  document.querySelectorAll(
    ".section-heading > p, .section-heading > h2, .row-heading > .text-link, .trust-strip > div, .category-card, .bestseller-category, .product-card, .collection-heading .section-heading > p, .collection-heading .section-heading > h2, .collection-photo, .story-image, .story-content > *, .footer > div"
  ).forEach(element => {
    const siblingIndex = Array.from(element.parentElement.children).indexOf(element);
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay", `${Math.min(siblingIndex * 55, 220)}ms`);
    revealObserver.observe(element);
  });

  const sceneObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        sceneImages.add(entry.target);
        scheduleScrollMotion();
      } else {
        sceneImages.delete(entry.target);
        entry.target.style.removeProperty("--scene-shift");
        entry.target.style.removeProperty("--scene-scale");
        entry.target.style.removeProperty("--candlelight");
      }
    });
  }, { rootMargin: "80px 0px" });
  document.querySelectorAll(".story-image img, .bestseller-category img, .category-card.warm img")
    .forEach(image => sceneObserver.observe(image));
}

if (!reducedMotion.matches && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  ambientSections.forEach(section => {
    section.addEventListener("pointermove", event => {
      const bounds = section.getBoundingClientRect();
      const radius = Math.min(210, window.innerWidth * 0.44, bounds.width / 2, bounds.height / 2);
      const x = Math.max(radius, Math.min(event.clientX - bounds.left, bounds.width - radius));
      const y = Math.max(radius, Math.min(event.clientY - bounds.top, bounds.height - radius));
      section.style.setProperty("--light-x", `${x}px`);
      section.style.setProperty("--light-y", `${y}px`);
      section.classList.add("is-lit");
    }, { passive: true });
    section.addEventListener("pointerleave", () => section.classList.remove("is-lit"));
  });

  magneticElements.forEach(element => {
    element.addEventListener("pointermove", event => {
      const bounds = element.getBoundingClientRect();
      const x = (event.clientX - bounds.left - bounds.width / 2) / bounds.width;
      const y = (event.clientY - bounds.top - bounds.height / 2) / bounds.height;
      element.style.setProperty("--magnetic-x", `${(x * 4).toFixed(1)}px`);
      element.style.setProperty("--magnetic-y", `${(y * 3).toFixed(1)}px`);
    }, { passive: true });
    element.addEventListener("pointerleave", () => {
      element.style.removeProperty("--magnetic-x");
      element.style.removeProperty("--magnetic-y");
    });
  });

  interactiveCards.forEach(card => {
    let tiltFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    card.addEventListener("pointerenter", () => {
      if (card.classList.contains("candle-spotlight")) card.classList.add("is-candlelit");
    });
    card.addEventListener("pointermove", event => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (tiltFrame) return;
      tiltFrame = window.requestAnimationFrame(() => {
        tiltFrame = 0;
        const bounds = card.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (pointerX - bounds.left - bounds.width / 2) / (bounds.width / 2)));
        const y = Math.max(-1, Math.min(1, (pointerY - bounds.top - bounds.height / 2) / (bounds.height / 2)));
        card.style.setProperty("--tilt-x", `${(x * 1.1).toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${(-y * 1.1).toFixed(2)}deg`);
        card.style.setProperty("--image-x", `${(x * 2.5).toFixed(1)}px`);
        card.style.setProperty("--image-y", `${(y * 2.5).toFixed(1)}px`);
        card.classList.add("is-tilting");
      });
    }, { passive: true });
    card.addEventListener("pointerleave", () => {
      if (tiltFrame) window.cancelAnimationFrame(tiltFrame);
      tiltFrame = 0;
      card.classList.remove("is-tilting");
      card.classList.remove("is-candlelit");
      ["--tilt-x", "--tilt-y", "--image-x", "--image-y"].forEach(property => {
        card.style.removeProperty(property);
      });
    });
  });
}

function replayAnimation(element, className) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

function animateProductToCart(card, sourceImage = card.querySelector(".product-image img")) {
  if (reducedMotion.matches || window.matchMedia("(hover: none)").matches) return;
  const imageBounds = sourceImage.getBoundingClientRect();
  const cartBounds = cartButton.getBoundingClientRect();
  if (!imageBounds.width || imageBounds.bottom < 0 || imageBounds.top > window.innerHeight) return;

  const flyingImage = sourceImage.cloneNode();
  if (typeof flyingImage.animate !== "function") return;
  flyingImage.setAttribute("aria-hidden", "true");
  Object.assign(flyingImage.style, {
    position: "fixed",
    top: `${imageBounds.top}px`,
    left: `${imageBounds.left}px`,
    width: `${imageBounds.width}px`,
    height: `${imageBounds.height}px`,
    objectFit: "cover",
    borderRadius: "2px",
    boxShadow: "0 8px 24px rgba(32,24,21,.18)",
    pointerEvents: "none",
    zIndex: "70"
  });
  document.body.append(flyingImage);
  const travelX = cartBounds.left + cartBounds.width / 2 - (imageBounds.left + imageBounds.width / 2);
  const travelY = cartBounds.top + cartBounds.height / 2 - (imageBounds.top + imageBounds.height / 2);
  const animation = flyingImage.animate([
    { transform: "translate(0, 0) scale(1)", opacity: .9 },
    { transform: `translate(${travelX}px, ${travelY}px) scale(.16)`, opacity: .25 }
  ], { duration: 460, easing: "cubic-bezier(.2,.65,.3,1)" });
  animation.onfinish = () => flyingImage.remove();
  animation.oncancel = () => flyingImage.remove();
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePanels();
    closeCatalogFilterDrawer();
  }
  if (event.key === "Tab") {
    const activeDrawer = cartDrawer.classList.contains("open")
      ? cartDrawer
      : checkoutDrawer?.classList.contains("open")
        ? checkoutDrawer
        : null;
    if (!activeDrawer) return;
    const focusable = Array.from(activeDrawer.querySelectorAll(
      "button:not([disabled]):not([hidden]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]"
    )).filter(element => element.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("open");
  document.body.classList.add("cart-open");
  const closeButton = document.getElementById("closeCart");
  window.setTimeout(() => closeButton.focus({ preventScroll: true }), 120);
}
function closePanels() {
  cartDrawer.classList.remove("open");
  document.getElementById("checkoutDrawer").classList.remove("open");
  document.getElementById("searchPanel").classList.remove("open");
  successModal?.classList.remove("open");
  overlay.classList.remove("open");
  document.body.classList.remove("cart-open");
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
  catalogCards.forEach(card => {
    card.style.display = "";
    catalogGrid.append(card);
  });
  applyCatalogFilters({ animate: false });
}

function showCategoryGalleryProducts(gallery) {
  const grid = gallery.querySelector(".collection-grid");
  if (!grid) return;
  const cards = catalogCards.filter(card => card.dataset.categoryGallery === gallery.id);
  cards.forEach(card => { card.style.display = ""; });
  grid.replaceChildren(...cards);
}

const productDetailPage = document.getElementById("productDetails");
const productDetailContent = document.getElementById("productDetailContent");
const productNotFound = document.getElementById("productNotFound");
const productDetailImage = document.getElementById("productDetailImage");
const productMainImage = document.getElementById("productMainImage");
const productDetailOptions = document.getElementById("productDetailOptions");
const productDetailQuantity = document.getElementById("productQuantity");
const productDetailAdd = document.getElementById("productDetailAdd");
const productLightbox = document.getElementById("productLightbox");
let activeProductCard = null;
let activeProductVariant = {};
let productReturnContext = null;
let movedRelatedCards = [];
const selectedProductVariants = new Map();
let productDetailAddCooldown = false;
let productDetailAddCooldownTimer = 0;

function getProductVariant(card, option = null) {
  const grams = option
    ? option.dataset.grams || ""
    : card.dataset.grams || "";
  const variantOption = option
    ? option.dataset.option || ""
    : card.dataset.option || "";
  if (option && !grams && !variantOption) return null;
  if (grams && (!Number.isSafeInteger(Number(grams)) || Number(grams) <= 0)) return null;
  const priceNumber = sanitizeCartPrice(option ? option.dataset.price : card.dataset.price);
  if (priceNumber === null) return null;
  return { grams, option: variantOption, priceNumber };
}

function canAddProductDetailToCart() {
  return Boolean(
    activeProductCard &&
    typeof activeProductCard.dataset.productId === "string" &&
    activeProductCard.dataset.productId.trim() &&
    typeof activeProductCard.dataset.name === "string" &&
    activeProductCard.dataset.name.trim() &&
    activeProductVariant &&
    sanitizeCartPrice(activeProductVariant.priceNumber) !== null &&
    parseCartQuantity(productDetailQuantity.textContent) !== null
  );
}

function updateProductDetailAddButton() {
  productDetailAdd.disabled = productDetailAddCooldown || !canAddProductDetailToCart();
}

function restoreRelatedCards() {
  movedRelatedCards
    .sort((a, b) => a.index - b.index)
    .forEach(({ card, parent, index, wasVisible, display }) => {
      const before = Array.from(parent.children).filter(child => child !== card)[index] || null;
      parent.insertBefore(card, before);
      card.style.display = display;
      if (!wasVisible) card.classList.remove("is-visible");
    });
  movedRelatedCards = [];
  document.getElementById("relatedProductsGrid").replaceChildren();
  document.getElementById("relatedProductsSection").hidden = true;
}

function closeProductPage() {
  restoreRelatedCards();
  activeProductCard = null;
  productDetailPage.hidden = true;
  document.body.classList.remove("product-view");
}

function getProductCard(productId) {
  return Array.from(document.querySelectorAll(".product-card"))
    .find(card => card.dataset.productId === productId);
}

function showRelatedProducts(card) {
  const relatedCards = catalogCards
    .filter(related =>
      related.dataset.categoryGallery === card.dataset.categoryGallery &&
      related.dataset.productId !== card.dataset.productId
    )
    .slice(0, 4);
  const relatedGrid = document.getElementById("relatedProductsGrid");

  const relatedRecords = relatedCards.map(related => {
    const parent = related.parentElement;
    return {
      card: related,
      parent,
      index: Array.from(parent.children).indexOf(related),
      wasVisible: related.classList.contains("is-visible"),
      display: related.style.display
    };
  });
  relatedRecords.forEach(record => {
    const { card: related } = record;
    movedRelatedCards.push({
      ...record
    });
    related.style.display = "";
    related.classList.add("is-visible");
    relatedGrid.append(related);
    related.querySelectorAll(".reveal").forEach(element => revealObserver?.observe(element));
  });
  document.getElementById("relatedProductsSection").hidden = relatedCards.length === 0;
}

function renderProductDetails(productId) {
  restoreRelatedCards();
  activeProductCard = getProductCard(productId);
  const name = typeof activeProductCard?.dataset.name === "string"
    ? activeProductCard.dataset.name.trim()
    : "";
  const productAvailable = Boolean(activeProductCard && name);
  if (!productAvailable) activeProductCard = null;
  productDetailPage.hidden = false;
  productDetailContent.hidden = !productAvailable;
  productNotFound.hidden = productAvailable;
  document.body.classList.remove("category-view");
  document.body.classList.add("product-view");

  if (!productAvailable) {
    activeProductVariant = null;
    productDetailAdd.disabled = true;
    productNotFound.querySelector("h1").focus({ preventScroll: true });
    return;
  }

  const image = activeProductCard.querySelector(".product-image img");
  const category = activeProductCard.querySelector(".product-info > p")?.textContent.trim() || "";
  const categoryLink = document.getElementById("productCategoryLink");
  const categoryGallery = activeProductCard.dataset.categoryGallery;
  const sourceOptions = Array.from(activeProductCard.querySelectorAll(".weight-options .weight-option"));
  const cardProductId = activeProductCard.dataset.productId;
  const savedVariant = selectedProductVariants.get(cardProductId);
  const selectedOption = sourceOptions.find(option =>
    savedVariant &&
    (option.dataset.grams || "") === savedVariant.grams &&
    (option.dataset.option || "") === savedVariant.option
  ) || sourceOptions.find(option => option.classList.contains("active"));

  document.getElementById("productDetailTitle").textContent = name;
  document.getElementById("productBreadcrumbName").textContent = name;
  const productDetailCategory = document.getElementById("productDetailCategory");
  productDetailCategory.textContent = category;
  productDetailCategory.hidden = !category;
  categoryLink.textContent = category;
  categoryLink.href = categoryGallery ? `#${categoryGallery}` : "#products";
  categoryLink.hidden = !category;
  categoryLink.nextElementSibling.hidden = !category;
  const imageSource = image?.getAttribute("src")?.trim() || "";
  productDetailImage.alt = image?.alt?.trim() || name;
  productDetailImage.classList.remove("image-unavailable");
  productMainImage.disabled = true;
  productMainImage.setAttribute(
    "aria-label",
    imageSource ? `عرض صورة ${name} بحجم أكبر` : `صورة ${name} غير متاحة`
  );
  productDetailImage.hidden = true;
  productDetailImage.removeAttribute("src");
  if (imageSource) {
    productDetailImage.setAttribute("src", imageSource);
  } else {
    productMainImage.classList.add("image-unavailable");
  }
  productDetailQuantity.textContent = "1";
  productDetailOptions.replaceChildren();
  productDetailOptions.hidden = sourceOptions.length === 0;

  activeProductVariant = sourceOptions.length
    ? selectedOption ? getProductVariant(activeProductCard, selectedOption) : null
    : getProductVariant(activeProductCard);
  const productDetailPrice = document.getElementById("productDetailPrice");
  productDetailPrice.textContent = activeProductVariant
    ? formatCurrency(activeProductVariant.priceNumber)
    : "";
  productDetailPrice.hidden = !activeProductVariant;
  const productDescription = document.getElementById("productDetailDescription");
  const description = activeProductCard.dataset.description?.trim() || "";
  productDescription.textContent = description;
  productDescription.hidden = !description;
  updateProductDetailAddButton();

  if (sourceOptions.length) {
    productDetailOptions.setAttribute("role", "group");
    productDetailOptions.setAttribute("aria-label", `خيارات ${name}`);
    sourceOptions.forEach(sourceOption => {
      const option = sourceOption.cloneNode(true);
      const isSelected = sourceOption === selectedOption;
      option.classList.toggle("active", isSelected);
      option.setAttribute("aria-pressed", isSelected ? "true" : "false");
      option.disabled = getProductVariant(activeProductCard, sourceOption) === null;
      option.addEventListener("click", () => {
        const variant = getProductVariant(activeProductCard, option);
        if (!variant) return;
        productDetailOptions.querySelectorAll(".weight-option").forEach(button => {
          button.classList.remove("active");
          button.setAttribute("aria-pressed", "false");
        });
        option.classList.add("active");
        option.setAttribute("aria-pressed", "true");
        activeProductVariant = variant;
        selectedProductVariants.set(cardProductId, {
          grams: variant.grams,
          option: variant.option
        });
        productDetailPrice.textContent = formatCurrency(variant.priceNumber);
        productDetailPrice.hidden = false;
        updateProductDetailAddButton();
      });
      productDetailOptions.append(option);
    });
  }

  showRelatedProducts(activeProductCard);
  document.getElementById("productDetailTitle").focus({ preventScroll: true });
}

function showCategoryGallery(gallery, { updateHistory = false, shouldScroll = true, shouldFocus = true } = {}) {
  if (!gallery) return;
  closeProductPage();
  closeCategoryView();
  categoryGalleries.forEach(section => { section.hidden = section !== gallery; });
  showCategoryGalleryProducts(gallery);
  document.body.classList.add("category-view");
  gallery.querySelectorAll(".reveal").forEach(element => revealObserver?.observe(element));
  if (updateHistory) history.pushState({ rimaaCategory: gallery.id }, "", `#${gallery.id}`);
  if (shouldScroll) scrollToElement(gallery);
  if (shouldFocus) {
    const heading = gallery.querySelector(".collection-heading h2");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
  }
}

function showStore(target = "products", updateHistory = true) {
  closeProductPage();
  closeCategoryView();
  if (updateHistory) history.pushState({}, "", `#${target}`);
  scrollToElement(document.getElementById(target));
}

function showHome() {
  closeProductPage();
  closeCategoryView();
  history.pushState({}, "", `${window.location.pathname}${window.location.search}`);
  window.scrollTo(0, 0);
}

function openProductPage(productId, originLink) {
  if (!document.body.classList.contains("product-view")) {
    const visibleGallery = Array.from(categoryGalleries).find(gallery => !gallery.hidden);
    productReturnContext = {
      galleryId: visibleGallery?.id || null,
      scrollY: window.scrollY,
      focusElement: originLink || document.activeElement
    };
  }
  history.pushState({ rimaaProduct: productId }, "", `#product/${encodeURIComponent(productId)}`);
  renderProductDetails(productId);
  window.scrollTo(0, 0);
}

function syncProductRoute() {
  const routeMatch = window.location.hash.match(/^#product\/(.+)$/);
  if (routeMatch) {
    let productId = routeMatch[1];
    try {
      productId = decodeURIComponent(productId);
    } catch {
      // Keep the raw route so invalid product links show the not-found state.
    }
    if (!productReturnContext) productReturnContext = { galleryId: null, scrollY: 0 };
    renderProductDetails(productId);
    window.scrollTo(0, 0);
    return;
  }

  closeProductPage();
  const routeGallery = Array.from(categoryGalleries)
    .find(gallery => window.location.hash === `#${gallery.id}`);
  const gallery = routeGallery || (productReturnContext?.galleryId
    ? document.getElementById(productReturnContext.galleryId)
    : null);
  if (gallery) {
    showCategoryGallery(gallery, { shouldScroll: false, shouldFocus: false });
    if (productReturnContext?.focusElement?.isConnected) {
      productReturnContext.focusElement.focus({ preventScroll: true });
    }
    window.scrollTo(0, productReturnContext?.scrollY || 0);
  } else {
    closeCategoryView();
  }
}

document.addEventListener("click", event => {
  const link = event.target.closest("[data-product-link]");
  if (!link) return;
  event.preventDefault();
  openProductPage(link.dataset.productLink, link);
});

document.querySelectorAll("[data-product-home]").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    if (productReturnContext?.galleryId) {
      const gallery = document.getElementById(productReturnContext.galleryId);
      showCategoryGallery(gallery, { updateHistory: true });
    } else {
      showStore();
    }
  });
});

document.querySelector(".header .brand").addEventListener("click", event => {
  if (!document.body.classList.contains("product-view") && !document.body.classList.contains("category-view")) return;
  event.preventDefault();
  showHome();
});

document.getElementById("productCategoryLink").addEventListener("click", event => {
  event.preventDefault();
  const gallery = document.getElementById(activeProductCard?.dataset.categoryGallery);
  showCategoryGallery(gallery, { updateHistory: true });
});

document.getElementById("productQuantityDecrease").addEventListener("click", () => {
  const quantity = sanitizeCartQuantity(productDetailQuantity.textContent);
  productDetailQuantity.textContent = String(Math.max(1, quantity - 1));
  updateProductDetailAddButton();
});
document.getElementById("productQuantityIncrease").addEventListener("click", () => {
  const quantity = addCartQuantities(productDetailQuantity.textContent, 1);
  if (quantity !== null) {
    productDetailQuantity.textContent = String(quantity);
    updateProductDetailAddButton();
  }
});

productMainImage.addEventListener("click", () => {
  if (!productDetailImage.getAttribute("src") || productMainImage.disabled) return;
  const lightboxImage = document.getElementById("productLightboxImage");
  lightboxImage.src = productDetailImage.src;
  lightboxImage.alt = productDetailImage.alt;
  productLightbox.showModal();
});
productDetailImage.addEventListener("error", () => {
  productDetailImage.hidden = true;
  productMainImage.disabled = true;
  productMainImage.classList.add("image-unavailable");
  productMainImage.setAttribute("aria-label", `صورة ${productDetailImage.alt} غير متاحة`);
});
productDetailImage.addEventListener("load", () => {
  productDetailImage.hidden = false;
  productMainImage.disabled = false;
  productMainImage.classList.remove("image-unavailable");
  productMainImage.setAttribute("aria-label", `عرض صورة ${productDetailImage.alt} بحجم أكبر`);
});
document.getElementById("closeProductLightbox").addEventListener("click", () => productLightbox.close());
productLightbox.addEventListener("click", event => {
  if (event.target === productLightbox) productLightbox.close();
});
productLightbox.addEventListener("keydown", event => {
  if (event.key === "Escape") productLightbox.close();
});
window.addEventListener("popstate", syncProductRoute);

categoryGalleries.forEach(section => {
  const returnLink = section.querySelector(".category-return");
  const heading = section.querySelector(".collection-heading");
  if (returnLink && heading) heading.after(returnLink);
});

document.querySelectorAll("#nav a").forEach(link => {
  link.addEventListener("click", () => {
    document.getElementById("nav").classList.remove("open");
    closeProductPage();
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
    showCategoryGallery(gallery, { shouldFocus: false });
  });
});
document.querySelectorAll(".category-return").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    closeCategoryView();
    scrollToElement(document.getElementById("categories"));
  });
});

const footerYear = document.getElementById("footerYear");
if (footerYear) footerYear.textContent = String(new Date().getFullYear());

document.getElementById("searchButton").addEventListener("click", () => {
  document.getElementById("searchPanel").classList.add("open");
  modalSearchInput.value = catalogSearchInput.value;
  setTimeout(() => modalSearchInput.focus(), 350);
});
document.getElementById("closeSearch").addEventListener("click", closePanels);

function runSearch() {
  syncCatalogSearch(modalSearchInput.value);
  document.getElementById("searchPanel").classList.remove("open");
  scrollToElement(document.getElementById("products"));
}

document.getElementById("searchSubmit").addEventListener("click", runSearch);
document.getElementById("searchInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") runSearch();
});

const checkoutDrawer = document.getElementById("checkoutDrawer");
const successModal = document.getElementById("successModal");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutConfirmButton = document.getElementById("checkoutConfirmButton");
let checkoutSubmitting = false;

function renderCheckoutTotals() {
  const subtotal = calculateCartSubtotal();
  document.getElementById("checkoutSubtotal").textContent = formatCurrency(subtotal);
  document.getElementById("checkoutShipping").textContent = "يُحدد عبر واتساب";
  document.getElementById("checkoutTotal").textContent = formatCurrency(subtotal);
}

function formatCheckoutQuantity(quantity) {
  return new Intl.NumberFormat("ar-EG").format(quantity);
}

function formatWhatsAppNumber(value) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
}

function cleanWhatsAppText(value) {
  return String(value || "")
    .replace(/[\u{1F000}-\u{1FAFF}\u2600-\u27BF]/gu, "")
    .replace(/\s+/g, " ")
    .replace(/[–—]/g, "-")
    .trim();
}

function renderCheckoutSummary() {
  const itemCount = getCartItemCount();
  const subtotal = calculateCartSubtotal();
  document.getElementById("checkoutItemCount").textContent =
    `${formatCheckoutQuantity(itemCount)} ${itemCount === 1 ? "منتج" : "منتجات"}`;
  renderCheckoutTotals();

  const summaryItems = document.getElementById("checkoutSummaryItems");
  summaryItems.replaceChildren();
  cart.forEach(item => {
    const price = sanitizeCartPrice(item.priceNumber);
    if (price === null) return;
    const quantity = sanitizeCartQuantity(item.quantity);
    const row = document.createElement("div");
    row.className = "checkout-summary-item";
    const image = document.createElement("img");
    image.src = item.image || "assets/product3.jpg";
    image.alt = "";
    image.onerror = () => {
      image.onerror = null;
      image.src = "assets/product3.jpg";
    };
    const details = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = item.name;
    const meta = document.createElement("small");
    meta.textContent = `${formatCheckoutQuantity(quantity)} × ${formatCurrency(price)}`;
    details.append(name, meta);
    const lineTotal = document.createElement("b");
    lineTotal.textContent = formatCurrency(Math.round(price * quantity * 100) / 100);
    row.append(image, details, lineTotal);
    summaryItems.append(row);
  });
  checkoutConfirmButton.disabled = cart.length === 0 || checkoutSubmitting;
}

function setCheckoutFieldError(field, message) {
  if (!field) return;
  const fieldWrapper = field.closest(".checkout-field");
  const errorId = field.getAttribute("aria-describedby");
  const error = errorId ? document.getElementById(errorId) : null;
  if (fieldWrapper) fieldWrapper.classList.toggle("has-error", Boolean(message));
  field.setAttribute("aria-invalid", message ? "true" : "false");
  if (error) error.textContent = message || "";
}

function validateEgyptianPhone(value) {
  const normalized = String(value || "").replace(/[^\d+]/g, "").replace(/^\+20/, "0");
  return /^01[0-25][0-9]{8}$/.test(normalized);
}

function validateCheckoutField(field) {
  if (!field) return true;
  const value = String(field.value || "").trim();
  let message = "";
  if (field.name === "name" && !value) message = "من فضلك اكتب الاسم الكامل.";
  if (field.name === "phone" && !value) message = "من فضلك اكتب رقم الهاتف.";
  else if (field.name === "phone" && value && !validateEgyptianPhone(value)) {
    message = "من فضلك اكتب رقم هاتف مصري صحيح.";
  }
  if (field.name === "governorate" && !value) message = "من فضلك اختاري المحافظة.";
  if (field.name === "area" && !value) message = "من فضلك اكتب المدينة أو المنطقة.";
  if (field.name === "address" && !value) message = "من فضلك اكتب عنوان التوصيل بالتفصيل.";
  setCheckoutFieldError(field, message);
  return !message;
}

function validateCheckoutForm() {
  const fields = Array.from(checkoutForm.querySelectorAll("[name='name'], [name='phone'], [name='governorate'], [name='area'], [name='address']"));
  const valid = fields.map(validateCheckoutField).every(Boolean);
  if (!valid) {
    fields.find(field => field.getAttribute("aria-invalid") === "true")?.focus();
  }
  return valid;
}

checkoutForm.querySelectorAll("[name='name'], [name='phone'], [name='governorate'], [name='area'], [name='address']").forEach(field => {
  field.addEventListener("blur", () => validateCheckoutField(field));
  field.addEventListener(field.tagName === "SELECT" ? "change" : "input", () => {
    if (field.getAttribute("aria-invalid") === "true") validateCheckoutField(field);
    if (field.name === "governorate") renderCheckoutTotals();
  });
});

document.getElementById("checkoutPhone").addEventListener("blur", event => {
  let phone = event.currentTarget.value.trim();
  if (phone.startsWith("+20")) phone = `0${phone.slice(3)}`;
  phone = phone.replace(/[^\d]/g, "");
  event.currentTarget.value = phone;
  validateCheckoutField(event.currentTarget);
});

document.getElementById("checkoutButton").addEventListener("click", () => {
  if (!cart.length) {
    openCart();
    return;
  }
  renderCheckoutSummary();
  cartDrawer.classList.remove("open");
  checkoutDrawer.classList.add("open");
  document.body.classList.add("cart-open");
  window.setTimeout(() => document.getElementById("closeCheckout").focus({ preventScroll: true }), 120);
});

document.getElementById("closeCheckout").addEventListener("click", closePanels);

document.getElementById("checkoutForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (checkoutSubmitting) return;
  if (!cart.length) {
    checkoutDrawer.classList.remove("open");
    openCart();
    return;
  }
  if (!validateCheckoutForm()) return;

  checkoutSubmitting = true;
  checkoutConfirmButton.disabled = true;
  checkoutConfirmButton.setAttribute("aria-busy", "true");
  checkoutConfirmButton.classList.add("is-loading");
  checkoutConfirmButton.querySelector("span").textContent = "جارٍ مراجعة الطلب...";

  window.setTimeout(() => {
    const orderNumber = `RIM-${Math.floor(1000 + Math.random() * 9000)}`;
    document.getElementById("orderNumber").textContent = orderNumber;
    const summary = document.getElementById("successSummary");
    const quantity = getCartItemCount();
    const subtotal = calculateCartSubtotal();
    summary.innerHTML = `
      <div><span>${formatCheckoutQuantity(quantity)} ${quantity === 1 ? "منتج" : "منتجات"}</span><strong>${formatCurrency(subtotal)}</strong></div>
      <p>سعر الشحن وطريقة الدفع النهائية سيتم تأكيدهما عبر واتساب.</p>
    `;
    const formData = new FormData(checkoutForm);
    document.getElementById("successMessage").textContent =
      "تم تجهيز الطلب. افتح واتساب وأرسل الرسالة ليتم تأكيد الطلب وسعر الشحن وطريقة الدفع معك.";
    const orderLines = cart.map((item, index) => {
      const quantity = parseCartQuantity(item.quantity);
      return [
        `${index + 1}. ${cleanWhatsAppText(item.name)}`,
        `الكمية: ${formatWhatsAppNumber(quantity)}`
      ].join("\n");
    }).join("\n");
    const orderMessage = [
      "طلب جديد من موقع رِمَاء",
      `رقم الطلب: ${orderNumber}`,
      "",
      "المنتجات:",
      orderLines,
      "",
      `المجموع الفرعي: ${formatWhatsAppNumber(subtotal)} ج.م`,
      "الشحن: يحدده المسؤول ويتفق مع العميل",
      "طريقة الدفع: يتم تأكيدها مع العميل",
      "",
      "بيانات العميل:",
      `الاسم: ${cleanWhatsAppText(formData.get("name"))}`,
      `رقم الهاتف: ${cleanWhatsAppText(formData.get("phone"))}`,
      `المحافظة: ${cleanWhatsAppText(formData.get("governorate"))}`,
      `المدينة أو المنطقة: ${cleanWhatsAppText(formData.get("area"))}`,
      `العنوان بالتفصيل: ${cleanWhatsAppText(formData.get("address"))}`,
      `ملاحظات: ${cleanWhatsAppText(formData.get("notes")) || "لا يوجد"}`
    ].join("\n");
    const whatsappUrl = `https://wa.me/201013950918?text=${encodeURIComponent(orderMessage)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    checkoutDrawer.classList.remove("open");
    overlay.classList.add("open");
    successModal.classList.add("open");
    document.body.classList.add("cart-open");
    checkoutSubmitting = false;
    checkoutConfirmButton.disabled = false;
    checkoutConfirmButton.removeAttribute("aria-busy");
    checkoutConfirmButton.classList.remove("is-loading");
    checkoutConfirmButton.querySelector("span").textContent = "تأكيد الطلب";
  }, 850);
});

document.getElementById("closeSuccess").addEventListener("click", () => {
  successModal.classList.remove("open");
  overlay.classList.remove("open");
  document.body.classList.remove("cart-open");
  scrollToElement(document.getElementById("products"));
});

function renderCart() {
  for (let index = cart.length - 1; index >= 0; index--) {
    const item = cart[index];
    const validPrice = sanitizeCartPrice(item.priceNumber);
    const validQuantity = parseCartQuantity(item.quantity);
    if (
      validPrice === null ||
      validQuantity === null ||
      typeof item.name !== "string" ||
      !item.name.trim() ||
      typeof item.productId !== "string" ||
      !item.productId.trim()
    ) {
      cart.splice(index, 1);
      continue;
    }
    item.name = item.name.trim();
    item.priceNumber = validPrice;
    item.price = formatCurrency(validPrice);
    item.quantity = validQuantity;
    item.productId = item.productId.trim();
    item.image = typeof item.image === "string" && item.image.trim()
      ? item.image
      : "assets/product3.jpg";
  }
  const quantity = getCartItemCount();
  const quantityChanged = cartCount.textContent !== String(quantity);
  cartCount.textContent = quantity;
  cartCount.hidden = quantity === 0;
  cartCount.setAttribute("aria-label", quantity === 1 ? "عنصر واحد في السلة" : `${quantity} عناصر في السلة`);
  if (cartHasRendered && quantityChanged) replayAnimation(cartCount, "cart-count-bump");
  const total = calculateCartSubtotal();
  const formattedTotal = formatCurrency(total);
  if (cartHasRendered && cartTotal.textContent !== formattedTotal) {
    cartTotal.textContent = formattedTotal;
    replayAnimation(cartTotal, "total-updating");
  } else {
    cartTotal.textContent = formattedTotal;
  }
  const checkoutTotal = document.getElementById("checkoutTotal");
  if (checkoutTotal && checkoutTotal.textContent !== formattedTotal) {
    checkoutTotal.textContent = formattedTotal;
  }

  const previousLines = new Map(
    Array.from(cartItems.querySelectorAll(".cart-line"), line => [line.dataset.cartKey, line])
  );
  if (!cart.length) {
    previousLines.forEach(line => removeCartLine(line));
    if (!cartItems.querySelector(".empty-cart [data-action='continue-shopping']")) {
      cartItems.querySelector(".empty-cart")?.remove();
      cartItems.append(createEmptyCartState());
    }
  } else {
    cartItems.querySelector(".empty-cart")?.remove();
    cart.forEach((item, index) => {
      const cartKey = getCartItemKey(item);
      let line = previousLines.get(cartKey);
      if (line) {
        previousLines.delete(cartKey);
        line.classList.remove("is-removing");
        line.removeAttribute("aria-hidden");
        line.querySelectorAll("button").forEach(button => { button.disabled = false; });
        updateCartLine(line, item, index, cartHasRendered);
      } else {
        line = createCartLine(item, index, cartHasRendered);
        cartItems.append(line);
      }
    });
    previousLines.forEach(line => removeCartLine(line));
  }
  cartHasRendered = true;
  document.getElementById("checkoutButton").disabled = cart.length === 0;
  if (typeof renderCheckoutSummary === "function") renderCheckoutSummary();
  saveCart();
}

function createEmptyCartState() {
  const emptyCart = document.createElement("div");
  emptyCart.className = "empty-cart";
  emptyCart.innerHTML = `
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M8 13h5l4 21h17l4-16H15"/>
      <circle cx="21" cy="38" r="2"/>
      <circle cx="33" cy="38" r="2"/>
      <path d="M21 12c0-4 3-7 7-7s7 3 7 7"/>
    </svg>
    <h3>سلتك تنتظر تفاصيل جميلة</h3>
    <p>اختاري ما يعجبك وأضيفي لمسات رِمَاء إلى منزلك.</p>
    <button type="button" class="empty-cart-button" data-action="continue-shopping">متابعة التسوق</button>
  `;
  return emptyCart;
}

function createCartLine(item, index, animate) {
  const line = document.createElement("div");
  line.className = "cart-line";
  line.dataset.name = item.name;
  line.dataset.cartKey = getCartItemKey(item);
  line.innerHTML = `
    <img class="cart-thumb" src="${item.image}" alt="">
    <div class="cart-line-info"><strong></strong><small></small><b></b></div>
    <div class="cart-quantity">
      <button type="button" data-action="decrease" aria-label="تقليل الكمية">−</button>
      <span></span>
      <button type="button" data-action="increase" aria-label="زيادة الكمية">+</button>
      <button type="button" class="cart-remove" data-action="remove" aria-label="حذف">×</button>
    </div>
  `;
  if (animate && !reducedMotion.matches) line.classList.add("is-entering");
  line.addEventListener("animationend", event => {
    if (event.animationName === "cart-line-enter") line.classList.remove("is-entering");
  });
  updateCartLine(line, item, index, false);
  return line;
}

function updateCartLine(line, item, index, animateQuantity) {
  line.dataset.name = item.name;
  line.dataset.cartKey = getCartItemKey(item);
  const thumb = line.querySelector(".cart-thumb");
  thumb.src = item.image || "assets/product3.jpg";
  thumb.onerror = () => {
    thumb.onerror = null;
    thumb.src = "assets/product3.jpg";
  };
  line.querySelector("strong").textContent = item.name;
  line.querySelector("small").textContent = `${item.quantity} × ${item.price}`;
  line.querySelector("b").textContent = formatCurrency(
    Math.round((item.priceNumber * item.quantity + Number.EPSILON) * 100) / 100
  );
  const quantity = line.querySelector(".cart-quantity span");
  const quantityText = String(item.quantity);
  quantity.setAttribute("aria-live", "polite");
  quantity.setAttribute("aria-label", `الكمية ${quantityText}`);
  if (quantity.textContent !== quantityText) {
    quantity.textContent = quantityText;
    if (animateQuantity) replayAnimation(quantity, "quantity-updated");
  }
  line.querySelectorAll("button[data-action]").forEach(button => {
    button.dataset.index = String(index);
  });
  const decreaseButton = line.querySelector('[data-action="decrease"]');
  decreaseButton.disabled = item.quantity <= 1;
  decreaseButton.setAttribute("aria-label", item.quantity <= 1 ? "الحد الأدنى للكمية هو واحد" : "تقليل الكمية");
}

function removeCartLine(line) {
  if (line.classList.contains("is-removing")) return;
  line.classList.add("is-removing");
  line.setAttribute("aria-hidden", "true");
  line.querySelectorAll("button").forEach(button => { button.disabled = true; });
  const removeAfterTransition = event => {
    if (event.target !== line || event.propertyName !== "max-height") return;
    line.removeEventListener("transitionend", removeAfterTransition);
    if (line.classList.contains("is-removing")) line.remove();
  };
  line.addEventListener("transitionend", removeAfterTransition);
  window.setTimeout(() => {
    if (line.classList.contains("is-removing")) line.remove();
  }, 350);
}

cartItems.addEventListener("click", event => {
  const continueButton = event.target.closest('[data-action="continue-shopping"]');
  if (continueButton) {
    closePanels();
    scrollToElement(document.getElementById("products"));
    return;
  }
  const button = event.target.closest("button[data-action]");
  if (!button || !cartItems.contains(button)) return;
  const index = Number(button.dataset.index);
  if (!Number.isSafeInteger(index) || index < 0) return;
  const item = cart[index];
  if (!item) return;

  if (button.dataset.action === "remove") {
    cart.splice(index, 1);
  } else if (button.dataset.action === "increase") {
    const quantity = addCartQuantities(item.quantity, 1);
    if (quantity !== null) item.quantity = quantity;
  } else if (button.dataset.action === "decrease") {
    item.quantity = Math.max(1, sanitizeCartQuantity(item.quantity) - 1);
  }
  renderCart();
});

function showCartToast(productName) {
  const toast = document.getElementById("cartToast");
  const message = document.getElementById("cartToastMessage");
  if (!toast || !message) return;
  message.textContent = `${productName || "المنتج"} أُضيف إلى السلة`;
  toast.hidden = false;
  toast.classList.remove("is-visible");
  void toast.offsetWidth;
  toast.classList.add("is-visible");
  window.clearTimeout(cartToastTimer);
  cartToastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
    window.setTimeout(() => {
      if (!toast.classList.contains("is-visible")) toast.hidden = true;
    }, 260);
  }, 2200);
}
function addProductToCart(card, options = {}) {
  const productId = typeof card.dataset.productId === "string" ? card.dataset.productId.trim() : "";
  const baseName = typeof card.dataset.name === "string" ? card.dataset.name.trim() : "";
  const grams = options.grams !== undefined ? options.grams : card.dataset.grams;
  const gramsText = grams === undefined || grams === null ? "" : String(grams).trim();
  const gramsNumber = gramsText ? Number(gramsText) : null;
  const option = options.option !== undefined ? options.option : card.dataset.option;
  if (!productId || !baseName) {
    console.error("Cart item rejected: product ID or name is missing.");
    return;
  }
  if (gramsText && (!Number.isSafeInteger(gramsNumber) || gramsNumber <= 0)) {
    console.error("Cart item rejected: variant weight is invalid.");
    return;
  }
  if (option !== undefined && option !== null && typeof option !== "string") {
    console.error("Cart item rejected: variant name is invalid.");
    return;
  }
  const optionName = typeof option === "string" ? option.trim() : "";
  const name = gramsText
    ? `${baseName} - ${new Intl.NumberFormat("ar-EG").format(gramsNumber)} جرام`
    : optionName
      ? `${baseName} - ${optionName}`
      : baseName;
  const priceNumber = sanitizeCartPrice(
    options.priceNumber !== undefined ? options.priceNumber : card.dataset.price
  );
  if (priceNumber === null) {
    console.error("Cart item rejected: price is missing or invalid.");
    return;
  }
  const quantity = options.quantity === undefined ? 1 : parseCartQuantity(options.quantity);
  if (quantity === null) {
    console.error("Cart item rejected: quantity is invalid.");
    return;
  }
  const image = card.querySelector(".product-image img")?.getAttribute("src") || "assets/product3.jpg";
  const cartItem = {
    name,
    price: formatCurrency(priceNumber),
    priceNumber,
    image,
    quantity,
    productId
  };
  const cartItemKey = getCartItemKey(cartItem);
  const existing = cart.find(item => getCartItemKey(item) === cartItemKey);
  if (existing) {
    const updatedQuantity = addCartQuantities(existing.quantity, quantity);
    if (updatedQuantity === null) return;
    existing.quantity = updatedQuantity;
    existing.priceNumber = priceNumber;
    existing.price = formatCurrency(priceNumber);
    existing.image = image;
  } else {
    cart.push(cartItem);
  }

  if (!reducedMotion.matches && card.classList.contains("candle-spotlight")) {
    replayAnimation(card, "candle-ignition");
  }
  animateProductToCart(card, options.sourceImage);
  replayAnimation(cartButton, "cart-bump");
  replayAnimation(cartButton.querySelector("svg"), "cart-icon-bump");

  const addButton = options.feedbackButton || card.querySelector(".add-button");
  if (!addButton.classList.contains("is-added")) {
    addButton.dataset.previousAriaLabel = addButton.getAttribute("aria-label") || "";
    if (addButton.classList.contains("product-detail-add")) {
      addButton.dataset.previousText = addButton.textContent;
    }
  }
  addButton.setAttribute("aria-label", `تمت إضافة ${baseName} إلى السلة`);
  addButton.classList.add("is-added");
  if (addButton.classList.contains("product-detail-add")) addButton.textContent = "تمت الإضافة ✓";
  replayAnimation(addButton, "add-feedback");
  window.clearTimeout(addFeedbackTimers.get(addButton));
  addFeedbackTimers.set(addButton, window.setTimeout(() => {
    if (addButton.isConnected && addButton.classList.contains("is-added")) {
      addButton.classList.remove("is-added");
      if (addButton.dataset.previousAriaLabel) {
        addButton.setAttribute("aria-label", addButton.dataset.previousAriaLabel);
      } else {
        addButton.removeAttribute("aria-label");
      }
      if (addButton.classList.contains("product-detail-add") && addButton.dataset.previousText) {
        addButton.textContent = addButton.dataset.previousText;
      }
      delete addButton.dataset.previousAriaLabel;
      delete addButton.dataset.previousText;
    }
    addFeedbackTimers.delete(addButton);
  }, 1400));
  showCartToast(name);
  renderCart();
  openCart();
}

document.querySelectorAll(".product-card").forEach(card => {
  card.querySelectorAll(".add-button, .quick-add").forEach(button => {
    button.addEventListener("click", () => addProductToCart(card));
  });
});

productDetailAdd.addEventListener("click", () => {
  if (productDetailAddCooldown || !canAddProductDetailToCart()) return;
  productDetailAddCooldown = true;
  updateProductDetailAddButton();
  addProductToCart(activeProductCard, {
    ...activeProductVariant,
    priceText: formatCurrency(activeProductVariant.priceNumber),
    quantity: Number(productDetailQuantity.textContent),
    feedbackButton: productDetailAdd,
    sourceImage: productDetailImage
  });
  window.clearTimeout(productDetailAddCooldownTimer);
  productDetailAddCooldownTimer = window.setTimeout(() => {
    productDetailAddCooldown = false;
    updateProductDetailAddButton();
  }, 450);
});

renderCart();
if (window.location.hash.startsWith("#product/")) syncProductRoute();
