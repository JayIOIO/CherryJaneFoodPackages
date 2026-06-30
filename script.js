document.addEventListener("DOMContentLoaded", () => {

    // ====== BUSINESS CONTACT SETTINGS — EDIT THESE TO MATCH YOUR REAL DETAILS ======
    const BUSINESS_EMAIL = "cherryjanefoodpackages@gmail.com"; // <-- put your real email here
    const BUSINESS_PHONE = "09207074255"; // <-- used for SMS/Text
    const MESSENGER_USERNAME = "crisanto.salenga.79#"; // <-- your Facebook Page username (from facebook.com/yourpage)
    // ===================================================================================

    const CART_KEY = "cherryJaneCart";

    // --- 1. MOBILE NAVBAR CONTROLS ---
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    // --- 2. CART PERSISTENCE HELPERS (shared across pages via localStorage) ---
    function loadCart() {
        try {
            return JSON.parse(localStorage.getItem(CART_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        renderCartBadge();
    }

    function formatPeso(amount) {
        return "₱" + amount.toLocaleString("en-PH", { maximumFractionDigits: 0 });
    }

    function renderCartBadge() {
        const cart = loadCart();
        const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
        const badge = document.getElementById('cartCount');
        if (badge) badge.textContent = totalQty;
    }

    function addToCart(name, price, qty) {
        const cart = loadCart();
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += qty;
        } else {
            cart.push({ name, price, quantity: qty });
        }
        saveCart(cart);
    }

    renderCartBadge();

    // --- 3. DYNAMIC BENTO POPUP WINDOW CONTROLS (View Package + Add to Cart) ---
    const bentoModal = document.getElementById('bentoPackageModal');

    if (bentoModal) {
        const bentoCloseBtn = bentoModal.querySelector('.bento-modal-close');
        const bentoActionBtns = document.querySelectorAll('.view-pkg-btn');
        const bentoModalTitle = document.getElementById('bentoModalTitle');
        const bentoModalPax = document.getElementById('bentoModalPax');
        const bentoModalPrice = document.getElementById('bentoModalPrice');
        const bentoGridContainer = document.getElementById('bentoGridContainer');
        const bentoOrderBtn = document.getElementById('bentoOrderBtn');
        const bentoQtyValue = document.getElementById('bentoQtyValue');
        const bentoQtyMinus = document.getElementById('bentoQtyMinus');
        const bentoQtyPlus = document.getElementById('bentoQtyPlus');

        let currentQty = 1;

        const resetQty = () => {
            currentQty = 1;
            if (bentoQtyValue) bentoQtyValue.textContent = currentQty;
        };

        if (bentoQtyMinus) {
            bentoQtyMinus.addEventListener('click', () => {
                if (currentQty > 1) currentQty -= 1;
                bentoQtyValue.textContent = currentQty;
            });
        }
        if (bentoQtyPlus) {
            bentoQtyPlus.addEventListener('click', () => {
                currentQty += 1;
                bentoQtyValue.textContent = currentQty;
            });
        }

        bentoActionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                bentoModalTitle.textContent = btn.getAttribute('data-title');
                bentoModalPax.textContent = btn.getAttribute('data-pax');
                bentoModalPrice.textContent = btn.getAttribute('data-price');

                bentoGridContainer.className = "bento-gallery-grid";
                bentoGridContainer.classList.add(btn.getAttribute('data-grid-type'));
                bentoGridContainer.innerHTML = btn.getAttribute('data-inclusions');

                resetQty();
                bentoModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            });
        });

        const closeBentoModal = () => {
            bentoModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        };

        if (bentoCloseBtn) bentoCloseBtn.addEventListener('click', closeBentoModal);

        if (bentoOrderBtn) {
            bentoOrderBtn.addEventListener('click', () => {
                const itemName = bentoModalTitle.textContent;
                const itemPrice = parseFloat(bentoModalPrice.textContent.replace(/[^0-9.-]+/g, ""));

                addToCart(itemName, itemPrice, currentQty);

                const originalText = bentoOrderBtn.textContent;
                bentoOrderBtn.textContent = "Added to Cart! ✓";
                bentoOrderBtn.style.backgroundColor = "#28a745";

                setTimeout(() => {
                    bentoOrderBtn.textContent = originalText;
                    bentoOrderBtn.style.backgroundColor = "";
                    closeBentoModal();
                }, 700);
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === bentoModal) closeBentoModal();
        });
    }

    // --- 3b. FOOD MENU (A-LA-CARTE) DIRECT ADD-TO-CART BUTTONS ---
    const directAddBtns = document.querySelectorAll('.add-to-cart-direct');
    directAddBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const itemName = btn.getAttribute('data-name');
            const itemPrice = parseFloat(btn.getAttribute('data-price').replace(/[^0-9.-]+/g, ""));

            addToCart(itemName, itemPrice, 1);

            const originalText = btn.textContent;
            btn.textContent = "Added! ✓";
            btn.style.backgroundColor = "#28a745";
            btn.disabled = true;

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = "";
                btn.disabled = false;
            }, 700);
        });
    });

    // --- 4. CART MODAL: render, quantity edit, remove ---
    const cartModal = document.getElementById('cartModal');
    const cartToggle = document.getElementById('cartToggle');
    const cartModalClose = document.getElementById('cartModalClose');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartItemCount = document.getElementById('cartItemCount');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const checkoutBtn = document.getElementById('checkoutBtn');

    function renderCartItems() {
        if (!cartItemsList) return;
        const cart = loadCart();

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p class="cart-empty-msg">Your cart is empty. Browse our packages and add something delicious!</p>';
            cartItemCount.textContent = "0 items";
            cartTotalPrice.textContent = formatPeso(0);
            checkoutBtn.disabled = true;
            return;
        }

        let total = 0;
        cartItemsList.innerHTML = cart.map((item, index) => {
            const subtotal = item.price * item.quantity;
            total += subtotal;
            return `
                <div class="cart-item" data-index="${index}">
                    <div class="cart-item-info">
                        <div class="name">${item.name}</div>
                        <div class="unit-price">${formatPeso(item.price)} each</div>
                    </div>
                    <div class="cart-item-controls">
                        <div class="qty-stepper">
                            <button type="button" class="qty-btn cart-qty-minus" aria-label="Decrease quantity">−</button>
                            <span>${item.quantity}</span>
                            <button type="button" class="qty-btn cart-qty-plus" aria-label="Increase quantity">+</button>
                        </div>
                        <div class="cart-item-subtotal">${formatPeso(subtotal)}</div>
                        <button type="button" class="cart-item-remove" aria-label="Remove item">&times;</button>
                    </div>
                </div>
            `;
        }).join('');

        const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartItemCount.textContent = totalQty + (totalQty === 1 ? " item" : " items");
        cartTotalPrice.textContent = formatPeso(total);
        checkoutBtn.disabled = false;
    }

    if (cartItemsList) {
        cartItemsList.addEventListener('click', (e) => {
            const itemEl = e.target.closest('.cart-item');
            if (!itemEl) return;
            const index = parseInt(itemEl.getAttribute('data-index'), 10);
            const cart = loadCart();
            if (!cart[index]) return;

            if (e.target.classList.contains('cart-qty-plus')) {
                cart[index].quantity += 1;
                saveCart(cart);
                renderCartItems();
            } else if (e.target.classList.contains('cart-qty-minus')) {
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                } else {
                    cart.splice(index, 1);
                }
                saveCart(cart);
                renderCartItems();
            } else if (e.target.classList.contains('cart-item-remove')) {
                cart.splice(index, 1);
                saveCart(cart);
                renderCartItems();
            }
        });
    }

    function openCartModal() {
        renderCartItems();
        cartModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeCartModal() {
        cartModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    if (cartToggle && cartModal) {
        cartToggle.addEventListener('click', openCartModal);
        if (cartModalClose) cartModalClose.addEventListener('click', closeCartModal);
        window.addEventListener('click', (e) => {
            if (e.target === cartModal) closeCartModal();
        });
    }

    // --- 5. CHECKOUT MODAL: build order summary, send via Email / Messenger / SMS ---
    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutModalClose = document.getElementById('checkoutModalClose');
    const checkoutSummary = document.getElementById('checkoutSummary');
    const custName = document.getElementById('custName');
    const custPhone = document.getElementById('custPhone');
    const custDate = document.getElementById('custDate');
    const custNotes = document.getElementById('custNotes');
    const sendEmailBtn = document.getElementById('sendEmailBtn');
    const sendMessengerBtn = document.getElementById('sendMessengerBtn');
    const sendTextBtn = document.getElementById('sendTextBtn');

    function buildOrderText() {
        const cart = loadCart();
        const lines = cart.map(item => `- ${item.name} x${item.quantity} = ${formatPeso(item.price * item.quantity)}`);
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const name = custName.value.trim() || "(not provided)";
        const phone = custPhone.value.trim() || "(not provided)";
        const date = custDate.value || "(not provided)";
        const notes = custNotes.value.trim() || "(none)";

        return `ORDER — CHERRY JANE FOOD PACKAGES

Customer: ${name}
Contact Number: ${phone}
Date Needed: ${date}
Delivery Address / Notes: ${notes}

ORDER DETAILS:
${lines.join('\n')}

TOTAL: ${formatPeso(total)}`;
    }

    function refreshCheckoutSummary() {
        if (checkoutSummary) checkoutSummary.textContent = buildOrderText();
    }

    function validateCustomerInfo() {
        if (!custName.value.trim() || !custPhone.value.trim()) {
            alert("Please enter your Name and Contact Number before sending your order.");
            return false;
        }
        const cart = loadCart();
        if (cart.length === 0) {
            alert("Your cart is empty. Please add a package or item first.");
            return false;
        }
        return true;
    }

    function openCheckoutModal() {
        if (!checkoutModal) return;
        refreshCheckoutSummary();
        closeCartModal();
        checkoutModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeCheckoutModal() {
        checkoutModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckoutModal);
    if (checkoutModalClose) checkoutModalClose.addEventListener('click', closeCheckoutModal);
    if (checkoutModal) {
        window.addEventListener('click', (e) => {
            if (e.target === checkoutModal) closeCheckoutModal();
        });
        [custName, custPhone, custDate, custNotes].forEach(field => {
            if (field) field.addEventListener('input', refreshCheckoutSummary);
        });
    }

    if (sendEmailBtn) {
        sendEmailBtn.addEventListener('click', () => {
            if (!validateCustomerInfo()) return;
            const subject = `New Order from ${custName.value.trim()}`;
            const body = buildOrderText();
            const mailtoLink = `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailtoLink;
        });
    }

    if (sendMessengerBtn) {
        sendMessengerBtn.addEventListener('click', () => {
            if (!validateCustomerInfo()) return;
            const text = buildOrderText();

            const openMessenger = () => {
                window.open(`https://m.me/${MESSENGER_USERNAME}`, "_blank");
            };

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    alert("Your order details have been copied! Paste them into the Messenger chat that just opened.");
                    openMessenger();
                }).catch(() => {
                    alert("Couldn't copy automatically — please type or paste your order details into Messenger manually.");
                    openMessenger();
                });
            } else {
                alert("Please copy your order details from the box above and paste them into Messenger.");
                openMessenger();
            }
        });
    }

    if (sendTextBtn) {
        sendTextBtn.addEventListener('click', () => {
            if (!validateCustomerInfo()) return;
            const text = buildOrderText();
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const smsLink = isIOS ?
                `sms:${BUSINESS_PHONE}&body=${encodeURIComponent(text)}` :
                `sms:${BUSINESS_PHONE}?body=${encodeURIComponent(text)}`;
            window.location.href = smsLink;
        });
    }

    // --- 6. AUTOMATIC INFINITE CAROUSEL CLONING ---
    const carouselTrack = document.querySelector('.carousel-track');
    if (carouselTrack) {
        const originalItems = Array.from(carouselTrack.children);
        originalItems.forEach(item => {
            const clone = item.cloneNode(true);
            carouselTrack.appendChild(clone);
        });
    }
});