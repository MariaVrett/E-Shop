document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector('.simple-search-bar input');
    const searchButton = document.querySelector('.simple-search-bar button');
    const productList = document.getElementById('productList');

    searchButton.addEventListener("click", async () => {
        const query = searchInput.value.trim();
        try {
            const response = await fetch(`http://127.0.0.1:5000/search?name=${encodeURIComponent(query)}`);
            const products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error("Search error:", error);
        }
    });

    function displayProducts(products) {
        productList.innerHTML = ''; // Clear previous
        products.forEach(product => {
            const div = document.createElement('div');
            div.className = 'product';

            const img = document.createElement('img');
            img.src = product.image;
            img.alt = product.name;
            img.style.cursor = "pointer";

            // Add click-to-like event
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
                        alert(`👍 Το προϊόν "${product.name}" πήρε Like!`);
                    } else {
                        alert(`❌ Σφάλμα: ${result.error}`);
                    }
                } catch (err) {
                    console.error("Like error:", err);
                }
            });

            const title = document.createElement('h3');
            title.textContent = product.name;

            const desc = document.createElement('p');
            desc.textContent = product.description;

            div.appendChild(img);
            div.appendChild(title);
            div.appendChild(desc);

            productList.appendChild(div);
        });
    }
});
