document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector('.simple-search-bar input');
    const searchButton = document.querySelector('.simple-search-bar button');
    const productList = document.getElementById('productList');

    // ➤ Φόρτωσε τα πιο δημοφιλή προϊόντα μόλις φορτώσει η σελίδα
    fetchPopularProducts();

    // ➤ Αναζήτηση με Enter
    searchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            searchButton.click();
        }
    });

    // ➤ Αναζήτηση με click
    searchButton.addEventListener("click", () => {
        const query = searchInput.value.trim();
        if (query) {
            fetchSearchResults(query);
        }
    });

    async function fetchPopularProducts() {
        try {
            const response = await fetch('http://127.0.0.1:5000/popular-products');
            const products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error("Σφάλμα κατά τη φόρτωση δημοφιλών προϊόντων:", error);
        }
    }

    async function fetchSearchResults(query) {
        try {
            const response = await fetch(`http://127.0.0.1:5000/search?name=${encodeURIComponent(query)}`);
            const products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error("Σφάλμα στην αναζήτηση:", error);
        }
    }

    function displayProducts(products) {
        productList.innerHTML = ''; // Καθαρισμός

        if (!products.length) {
            productList.innerHTML = '<p>Δεν βρέθηκαν προϊόντα.</p>';
            return;
        }

        products.forEach(product => {
            const div = document.createElement('div');
            div.className = 'product';

            const img = document.createElement('img');
            img.src = '/static/' + product.image.replace(/^\/+/, '');
            img.alt = product.name;
            img.style.cursor = "pointer";

            const title = document.createElement('h3');
            title.textContent = product.name;

            const desc = document.createElement('p');
            desc.textContent = product.description;

            const likes = document.createElement('p');
            likes.textContent = `Likes: ${product.likes || 0}`;
            likes.className = 'likes-count';

            // ➤ Like με click
            img.addEventListener("click", async () => {
                try {
                    const res = await fetch('http://127.0.0.1:5000/like', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ product_id: product._id })
                    });

                    const result = await res.json();
                    if (res.ok) {
                        product.likes += 1;
                        likes.textContent = `Likes: ${product.likes}`;
                    } else {
                        console.error("Σφάλμα Like:", result.error);
                    }
                } catch (err) {
                    console.error("Like error:", err);
                }
            });

            div.appendChild(img);
            div.appendChild(title);
            div.appendChild(desc);
            div.appendChild(likes);

            productList.appendChild(div);
        });
    }
});
