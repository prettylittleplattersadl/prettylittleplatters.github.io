const menuItems = [
  {
    icon: "SG",
    script: "Signature",
    label: "Graze",
    description:
      "Our signature grazing selection featuring premium cheeses, cured meats, seasonal fruit, dips, crackers and gourmet accompaniments.",
    sizes: [
      ["Box (up to 10)", 170],
      ["Platter (10 - 20)", 290],
      ["Platter (20 - 30)", 420],
    ],
  },
  {
    icon: "MC",
    script: "Meat &",
    label: "Cheese",
    description:
      "A classic charcuterie-style selection with artisan cheeses, premium cured meats and savoury accompaniments.",
    sizes: [
      ["Box (up to 10)", 185],
      ["Platter (10 - 20)", 320],
      ["Platter (20 - 30)", 470],
    ],
  },
  {
    icon: "ST",
    script: "Sweet",
    label: "Treats",
    description:
      "A beautifully styled sweet selection featuring chocolates, baked treats, fresh fruit and dessert-inspired grazing.",
    sizes: [
      ["Box (up to 10)", 180],
      ["Platter (10 - 20)", 310],
      ["Platter (20 - 30)", 450],
    ],
  },
];

const selected = [];
const menuGrid = document.querySelector("#menuGrid");
const cartItems = document.querySelector("#cartItems");
const cartTotal = document.querySelector("#cartTotal");
const orderForm = document.querySelector("#orderForm");
const formStatus = document.querySelector("#formStatus");

function money(value) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

function fromMoney(value) {
  return `From ${money(value)}`;
}

function renderMenu() {
  menuGrid.innerHTML = menuItems
    .map((item, itemIndex) => {
      const sizes = item.sizes
        .map(
          ([name, price], sizeIndex) => `
            <button type="button" data-item="${itemIndex}" data-size="${sizeIndex}">
              <span>${name}</span>
              <strong>${fromMoney(price)}</strong>
            </button>
          `
        )
        .join("");

      return `
        <article class="menu-card">
          <div class="menu-icon" aria-hidden="true">${item.icon}</div>
          <h3 class="menu-title">${item.script}<span>${item.label}</span></h3>
          <p>${item.description}</p>
          <div class="size-actions" aria-label="Add ${item.script} ${item.label} sizes">
            ${sizes}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderCart() {
  if (!selected.length) {
    cartItems.textContent = "No items selected yet.";
    cartTotal.textContent = "Estimated total from: $0";
    syncSelectedButtons();
    return;
  }

  cartItems.innerHTML = selected
    .map(
      (entry, index) => `
        <div class="cart-row">
          <div class="cart-item-summary">
            <span>${entry.title} - ${entry.size}</span>
            <strong>${fromMoney(entry.price)} each</strong>
          </div>
          <div class="quantity-control" aria-label="Quantity for ${entry.title}">
            <button type="button" aria-label="Decrease quantity" data-quantity="${index}" data-change="-1">-</button>
            <span>Qty ${entry.quantity}</span>
            <button type="button" aria-label="Increase quantity" data-quantity="${index}" data-change="1">+</button>
          </div>
          <strong>${fromMoney(entry.price * entry.quantity)}</strong>
          <button class="cart-remove" type="button" aria-label="Remove ${entry.title}" data-remove="${index}">&times;</button>
        </div>
      `
    )
    .join("");

  const total = selected.reduce((sum, entry) => sum + entry.price * entry.quantity, 0);
  cartTotal.textContent = `Estimated total from: ${money(total)}`;
  syncSelectedButtons();
}

function syncSelectedButtons() {
  document.querySelectorAll(".size-actions button").forEach((button) => {
    const isSelected = selected.some(
      (entry) =>
        entry.itemIndex === Number(button.dataset.item) &&
        entry.sizeIndex === Number(button.dataset.size)
    );
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", isSelected ? "true" : "false");
  });
}

menuGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-item]");
  if (!button) return;

  const itemIndex = Number(button.dataset.item);
  const sizeIndex = Number(button.dataset.size);
  const selectedIndex = selected.findIndex(
    (entry) => entry.itemIndex === itemIndex && entry.sizeIndex === sizeIndex
  );

  if (selectedIndex >= 0) {
    selected.splice(selectedIndex, 1);
    renderCart();
    return;
  }

  const item = menuItems[itemIndex];
  const [size, price] = item.sizes[sizeIndex];
  selected.push({
    itemIndex,
    sizeIndex,
    title: `${item.script} ${item.label}`,
    size,
    price,
    quantity: 1,
  });
  renderCart();
});

cartItems.addEventListener("click", (event) => {
  const quantityButton = event.target.closest("button[data-quantity]");
  if (quantityButton) {
    const index = Number(quantityButton.dataset.quantity);
    const change = Number(quantityButton.dataset.change);
    selected[index].quantity = Math.max(1, selected[index].quantity + change);
    renderCart();
    return;
  }

  const button = event.target.closest("button[data-remove]");
  if (!button) return;

  selected.splice(Number(button.dataset.remove), 1);
  renderCart();
});

orderForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitBtn = orderForm.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  formStatus.textContent = "Sending…";

  const data = new FormData(orderForm);
  const items = selected.length
    ? selected
        .map(
          (entry) =>
            `- ${entry.title}, ${entry.size}, Qty ${entry.quantity}, ${fromMoney(entry.price * entry.quantity)}`
        )
        .join("\n")
    : "- No platter selected yet";

  const total = selected.reduce((sum, entry) => sum + entry.price * entry.quantity, 0);
  const message = [
    `Name: ${data.get("name")}`,
    `Email: ${data.get("email")}`,
    `Phone: ${data.get("phone") || ""}`,
    `Event date: ${data.get("date") || ""}`,
    "",
    "Selected items:",
    items,
    "",
    `Estimated total from: ${money(total)}`,
    "",
    `Notes: ${data.get("notes") || ""}`,
  ].join("\n");

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: "bbb82989-213b-4013-bde9-e8db6e3e1ba0",
        subject: "Pretty Little Platters order enquiry",
        from_name: data.get("name"),
        email: data.get("email"),
        replyto: data.get("email"),
        message,
      }),
    });

    const result = await res.json();
    if (result.success) {
      formStatus.textContent = "Enquiry sent! We'll be in touch soon.";
      orderForm.reset();
      selected.length = 0;
      renderCart();
    } else {
      throw new Error(result.message || "Submission failed");
    }
  } catch {
    formStatus.textContent = "Something went wrong. Please email us directly at hello@prettylittleplattersadl.com.au";
  } finally {
    submitBtn.disabled = false;
  }
});

renderMenu();
renderCart();
