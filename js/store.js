/**
 * G-Mart LocalStorage Store Manager
 */
(function (window) {
    "use strict";

    const INITIAL_PRODUCTS = [
        { id: 1, name: "Brocoli", category: "Vegetables", price: 2.99, image: "img/vegetable-item-6.jpg", unit: "kg", rating: 5, desc: "Fresh organic brocoli harvested directly from local farms. Rich in vitamins and minerals." },
        { id: 2, name: "Big Banana", category: "Fruits", price: 4.99, image: "img/vegetable-item-3.png", unit: "kg", rating: 4, desc: "Sweet and nutritious organic bananas rich in potassium and healthy energy." },
        { id: 3, name: "Fresh Apples", category: "Fruits", price: 3.99, image: "img/fruite-item-5.jpg", unit: "kg", rating: 5, desc: "Crisp and juicy red apples sourced directly from high-altitude organic orchards." },
        { id: 4, name: "Organic Orange", category: "Fruits", price: 2.99, image: "img/fruite-item-4.jpg", unit: "kg", rating: 4, desc: "Vitamin C packed citrus oranges freshly picked at peak sweetness." },
        { id: 5, name: "Fresh Strawberries", category: "Fruits", price: 5.99, image: "img/fruite-item-1.jpg", unit: "kg", rating: 5, desc: "Delicious ripe red strawberries full of natural flavor and aroma." },
        { id: 6, name: "Potatoes", category: "Vegetables", price: 2.49, image: "img/vegetable-item-5.jpg", unit: "kg", rating: 4, desc: "Farm fresh potatoes ideal for roasting, baking, and everyday cooking." },
        { id: 7, name: "Fresh Raspberries", category: "Fruits", price: 4.50, image: "img/fruite-item-2.jpg", unit: "kg", rating: 5, desc: "Handpicked sweet and juicy raspberries full of antioxidants." },
        { id: 8, name: "Organic Tomatoes", category: "Vegetables", price: 3.19, image: "img/vegetable-item-4.jpg", unit: "kg", rating: 4, desc: "Red ripe organic tomatoes perfect for salads, sauces, and fresh cooking." },
        { id: 9, name: "Fresh Grapes", category: "Fruits", price: 3.49, image: "img/fruite-item-3.jpg", unit: "kg", rating: 4, desc: "Sweet seedless green grapes packed with freshness and crunch." },
        { id: 10, name: "Bell Pepper", category: "Vegetables", price: 2.79, image: "img/vegetable-item-1.jpg", unit: "kg", rating: 4, desc: "Crisp and vibrant bell peppers grown under organic greenhouse conditions." },
        { id: 11, name: "Awesome Brocoli", category: "Vegetables", price: 3.35, image: "img/vegetable-item-2.jpg", unit: "kg", rating: 5, desc: "Premium grade organic brocoli stalks packed with nutrients." },
        { id: 12, name: "Fresh Parsley", category: "Fresh", price: 1.99, image: "img/featur-1.jpg", unit: "bunch", rating: 4, desc: "Fragrant and fresh green parsley herbs." }
    ];

    const GMartStore = {
        // Initialize Storage
        init: function () {
            if (!localStorage.getItem("gmart_products")) {
                localStorage.setItem("gmart_products", JSON.stringify(INITIAL_PRODUCTS));
            }
            if (!localStorage.getItem("gmart_cart")) {
                localStorage.setItem("gmart_cart", JSON.stringify([
                    { id: 1, name: "Brocoli", price: 2.99, image: "img/vegetable-item-6.jpg", quantity: 1 },
                    { id: 2, name: "Big Banana", price: 4.99, image: "img/vegetable-item-3.png", quantity: 2 }
                ]));
            }
            if (!localStorage.getItem("gmart_orders")) {
                localStorage.setItem("gmart_orders", JSON.stringify([]));
            }
            if (!localStorage.getItem("gmart_coupon")) {
                localStorage.setItem("gmart_coupon", JSON.stringify(null));
            }

            this.updateBadge();
            this.bindGlobalEvents();
        },

        // Get Products
        getProducts: function () {
            try {
                return JSON.parse(localStorage.getItem("gmart_products")) || INITIAL_PRODUCTS;
            } catch (e) {
                return INITIAL_PRODUCTS;
            }
        },

        getProductById: function (id) {
            const products = this.getProducts();
            return products.find(p => p.id == id) || products[0];
        },

        // Cart Management
        getCart: function () {
            try {
                return JSON.parse(localStorage.getItem("gmart_cart")) || [];
            } catch (e) {
                return [];
            }
        },

        saveCart: function (cart) {
            localStorage.setItem("gmart_cart", JSON.stringify(cart));
            this.updateBadge();
        },

        addToCart: function (item) {
            let cart = this.getCart();
            const existingIndex = cart.findIndex(c => c.id == item.id || (c.name && c.name.toLowerCase() === item.name.toLowerCase()));
            const addQty = parseInt(item.quantity || 1, 10);

            if (existingIndex > -1) {
                cart[existingIndex].quantity = (parseInt(cart[existingIndex].quantity, 10) || 0) + addQty;
            } else {
                cart.push({
                    id: item.id || Date.now(),
                    name: item.name,
                    price: parseFloat(item.price) || 0.00,
                    image: item.image || "img/vegetable-item-1.jpg",
                    quantity: addQty
                });
            }

            this.saveCart(cart);
            this.showToast(`Added <strong>${item.name}</strong> to your cart!`, "success");
        },

        updateCartQuantity: function (id, qty) {
            let cart = this.getCart();
            const index = cart.findIndex(c => c.id == id);
            if (index > -1) {
                if (qty <= 0) {
                    cart.splice(index, 1);
                    this.showToast("Item removed from cart.", "info");
                } else {
                    cart[index].quantity = parseInt(qty, 10);
                }
                this.saveCart(cart);
            }
        },

        removeFromCart: function (id) {
            let cart = this.getCart();
            const updated = cart.filter(c => c.id != id);
            this.saveCart(updated);
            this.showToast("Item removed from cart.", "info");
        },

        clearCart: function () {
            localStorage.setItem("gmart_cart", JSON.stringify([]));
            localStorage.removeItem("gmart_coupon");
            this.updateBadge();
        },

        getCartSubtotal: function () {
            const cart = this.getCart();
            return cart.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity, 10)), 0);
        },

        getCartItemCount: function () {
            const cart = this.getCart();
            return cart.reduce((sum, item) => sum + parseInt(item.quantity, 10), 0);
        },

        // Coupon handling
        getAppliedCoupon: function () {
            try {
                return JSON.parse(localStorage.getItem("gmart_coupon"));
            } catch (e) {
                return null;
            }
        },

        applyCoupon: function (code) {
            const cleanCode = (code || "").trim().toUpperCase();
            if (cleanCode === "FRESH10" || cleanCode === "GMART10") {
                const coupon = { code: cleanCode, discountPercent: 10, type: "percent" };
                localStorage.setItem("gmart_coupon", JSON.stringify(coupon));
                this.showToast("Coupon Applied! 10% discount added.", "success");
                return { success: true, message: "10% discount applied!" };
            } else if (cleanCode === "SAVE5" || cleanCode === "PROMO5") {
                const coupon = { code: cleanCode, discountAmount: 5.00, type: "fixed" };
                localStorage.setItem("gmart_coupon", JSON.stringify(coupon));
                this.showToast("Coupon Applied! $5.00 discount added.", "success");
                return { success: true, message: "$5.00 discount applied!" };
            } else {
                this.showToast("Invalid Coupon Code. Try FRESH10 or SAVE5", "danger");
                return { success: false, message: "Invalid coupon code." };
            }
        },

        // Orders Management
        placeOrder: function (orderDetails) {
            let orders = [];
            try {
                orders = JSON.parse(localStorage.getItem("gmart_orders")) || [];
            } catch (e) {
                orders = [];
            }

            const newOrder = {
                orderId: "GMART-" + Math.floor(100000 + Math.random() * 900000),
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                items: this.getCart(),
                subtotal: orderDetails.subtotal,
                shipping: orderDetails.shipping,
                discount: orderDetails.discount,
                total: orderDetails.total,
                billing: orderDetails.billing,
                paymentMethod: orderDetails.paymentMethod || "Direct Bank Transfer"
            };

            orders.unshift(newOrder);
            localStorage.setItem("gmart_orders", JSON.stringify(orders));

            // Save user info for future checkouts
            if (orderDetails.billing) {
                localStorage.setItem("gmart_user", JSON.stringify(orderDetails.billing));
            }

            this.clearCart();
            return newOrder;
        },

        getUserProfile: function () {
            try {
                return JSON.parse(localStorage.getItem("gmart_user")) || null;
            } catch (e) {
                return null;
            }
        },

        // Update Navbar Badge Counter
        updateBadge: function () {
            const totalCount = this.getCartItemCount();
            const badges = document.querySelectorAll(".cart-badge, nav .fa-shopping-bag + span, nav a[href*='cart'] span");
            badges.forEach(b => {
                b.textContent = totalCount;
            });
        },

        // Toast Notifications
        showToast: function (message, type = "success") {
            let container = document.getElementById("gmart-toast-container");
            if (!container) {
                container = document.createElement("div");
                container.id = "gmart-toast-container";
                container.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: 99999; display: flex; flex-direction: column; gap: 10px;";
                document.body.appendChild(container);
            }

            const toast = document.createElement("div");
            const bgClass = type === "success" ? "bg-success" : type === "danger" ? "bg-danger" : "bg-primary";
            toast.className = `toast align-items-center text-white ${bgClass} border-0 show`;
            toast.setAttribute("role", "alert");
            toast.style.cssText = "min-width: 260px; box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15); transition: all 0.3s ease;";

            toast.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body fs-6 py-3 px-4">
                        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'} me-2"></i> ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            `;

            container.appendChild(toast);

            const closeBtn = toast.querySelector(".btn-close");
            closeBtn.addEventListener("click", () => toast.remove());

            setTimeout(() => {
                toast.style.opacity = "0";
                setTimeout(() => toast.remove(), 300);
            }, 3500);
        },

        // Bind global search & nav behaviors
        bindGlobalEvents: function () {
            document.addEventListener("DOMContentLoaded", () => {
                GMartStore.updateBadge();

                // Search Modals & inputs
                const searchInputs = document.querySelectorAll("#searchModal input, .fruite search input");
                searchInputs.forEach(input => {
                    input.addEventListener("keypress", (e) => {
                        if (e.key === "Enter" && input.value.trim() !== "") {
                            window.location.href = `shop.html?search=${encodeURIComponent(input.value.trim())}`;
                        }
                    });
                });

                const searchButtons = document.querySelectorAll("#search-icon-1, .btn-search-trigger");
                searchButtons.forEach(btn => {
                    btn.addEventListener("click", () => {
                        const input = btn.parentElement.querySelector("input");
                        if (input && input.value.trim() !== "") {
                            window.location.href = `shop.html?search=${encodeURIComponent(input.value.trim())}`;
                        }
                    });
                });

                // Attach delegator for any "Add to cart" click across the page
                document.addEventListener("click", function (e) {
                    const btn = e.target.closest("a, button");
                    if (btn && btn.textContent && btn.textContent.toLowerCase().includes("add to cart")) {
                        e.preventDefault();

                        const card = btn.closest(".fruite-item, .vegetable-item, .vesitable-item, .border.rounded, .col-lg-6, .row, .col-md-6, .col-lg-4, .col-lg-3") || btn.parentElement.parentElement;
                        let name = "Fresh Organic Item";
                        let price = 2.99;
                        let image = "img/vegetable-item-1.jpg";
                        let quantity = 1;

                        if (card) {
                            const h4 = card.querySelector("h4, h5, .h4, .h5");
                            if (h4 && h4.textContent.trim()) {
                                name = h4.textContent.trim();
                            }

                            const img = card.querySelector("img");
                            if (img && img.getAttribute("src")) {
                                image = img.getAttribute("src");
                            }

                            const priceElem = card.querySelector(".text-dark.fs-5, .fw-bold, p.fs-5, h5, .price");
                            if (priceElem) {
                                const match = priceElem.textContent.match(/[\d.]+/);
                                if (match) price = parseFloat(match[0]);
                            }

                            const qtyInput = card.querySelector(".quantity input, input.form-control");
                            if (qtyInput && !isNaN(parseInt(qtyInput.value, 10))) {
                                quantity = parseInt(qtyInput.value, 10);
                            }
                        }

                        GMartStore.addToCart({
                            id: Date.now(),
                            name: name,
                            price: price,
                            image: image,
                            quantity: quantity
                        });
                    }
                });
            });
        }
    };

    window.GMartStore = GMartStore;
    GMartStore.init();
})(window);
