document.addEventListener("DOMContentLoaded", async function () {
    const slideshow = document.querySelector('.slideshow');

    try {
        const response = await fetch('http://127.0.0.1:5000/popular-products');
        const products = await response.json();

        slideshow.innerHTML = ''; // Καθαρίζει παλιές εικόνες

        products.forEach((product, index) => {
            const img = document.createElement('img');
            img.src = '/static/' + product.image; 
            img.alt = product.name;
            img.style.animationDelay = `${index * 5}s`;
            slideshow.appendChild(img);
        });

    } catch (error) {
        console.error("Slideshow error:", error);
    }
});
