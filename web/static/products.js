document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector('.simple-search-bar input');
    const searchButton = document.querySelector('.simple-search-bar button');
    const productList = document.getElementById('productList');

    // Φόρτωσε όλα τα προϊόντα κατά την αρχική φόρτωση της σελίδας
    fetchProducts("");

    // Υποστήριξη Enter για αναζήτηση
    searchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            searchButton.click();
        }
    });

    searchButton.addEventListener("click", () => {
        const query = searchInput.value.trim();
        fetchProducts(query);
    });

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim();
        fetchProducts(query);
    });

    async function fetchProducts(query) {
        try {
            const url = query
                ? `http://127.0.0.1:5000/search?name=${encodeURIComponent(query)}`
                : `http://127.0.0.1:5000/search`;

            const response = await fetch(url);
            const products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error("Σφάλμα κατά τη φόρτωση προϊόντων:", error);
        }
    }

    function displayProducts(products) {
    productList.innerHTML = ''; // Καθαρισμός παλιών προϊόντων

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
        desc.className = 'description';

        const productContent = document.createElement('div');
        productContent.className = 'product-content';
        productContent.appendChild(img);
        productContent.appendChild(title);
        productContent.appendChild(desc);

        const bottomInfo = document.createElement('div');
        bottomInfo.className = 'bottom-info';

        const likes = document.createElement('p');
        likes.textContent = `Likes: ${product.likes || 0}`;
        likes.className = 'likes-count';

        const price = document.createElement('p');
        price.textContent = `${product.price?.toFixed(2) || '0.00'} €`;
        price.className = 'price';

        bottomInfo.appendChild(likes);
        bottomInfo.appendChild(price);

        div.appendChild(productContent);
        div.appendChild(bottomInfo);

        // Like click
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
                    console.error("Σφάλμα κατά το Like:", result.error);
                }
            } catch (err) {
                console.error("Like error:", err);
            }
        });

        productList.appendChild(div);
    });
}

});
