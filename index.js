const UNSPLASH_ACCESS_KEY = 'wN6E8FS_1VQxFsREVwjzGyRE4beUFzzvvkVEQahu1_w'

const searchBox = document.querySelector('.header-input-field');
let isSearching = false;

const imagesContainer = document.querySelector('.images-container')
let currentPage = 1;
const loadMoreBtn = document.querySelector('.load-more-btn')
const imageCache = new Map();

async function fetchImages() {
  try {

    if (imageCache.has(currentPage)) {
      console.log("Using cached data");
      renderImages(imageCache.get(currentPage));
      return;
    }

    const response = await fetch(`https://api.unsplash.com/photos?page=${currentPage}&client_id=${UNSPLASH_ACCESS_KEY}`)

    if (!response.ok) {
      throw new Error("Failed to fetch images");
    }

    const data = await response.json();

    imageCache.set(currentPage, data);

    if (data.length === 0) {
      loadMoreBtn.style.display = "none";
      return; 
    }

    renderImages(data);
  } catch (error) {
    console.error("Error fetching images:", error)
  }  
}



function renderImages(images) {
  images.forEach(image => {
    const imageCard = document.createElement('li');
    imageCard.classList.add('image-card')

    imageCard.innerHTML = `
    <img src="${image.urls.small}" alt="${image.alt_description || "Unsplash Image"}" />
    <div class="details-n-utilities">
        <div class="image-author">
          <i class="fa-solid fa-camera"></i>
          <p>${image.user.name}</p>
        </div>
        <div class="utilities">
          <button class="download-btn">
            <i class="fa-solid fa-download"></i>
          </button>
        </div>
      </div>
    `

    imageCard.querySelector('img').addEventListener('click', () => {
      createModal(image); // Pass the image data to create the modal
    });

 // Add event listener to the download button
 const downloadBtn = imageCard.querySelector('.download-btn');
 downloadBtn.addEventListener('click', () => {
   downloadImage(image.urls.full, image.alt_description || "download");
 });


    imagesContainer.appendChild(imageCard);
  });
}

function downloadImage(url, filename) {
  // Create a temporary anchor element
  const a = document.createElement('a');
  a.href = url; // Set the image URL as the anchor's href
  a.target = '_blank'; // Ensure it opens in a new tab if needed
  a.download = `${filename}.jpg`; // Set the filename

  // Append the anchor to the document body
  document.body.appendChild(a);

  // Programmatically trigger the download
  a.click();

  // Remove the anchor from the DOM
  document.body.removeChild(a);
}

async function searchImages(query) {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&page=${currentPage}&per_page=10&client_id=${UNSPLASH_ACCESS_KEY}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch search results");
    }

    const data = await response.json();

    if (data.results.length === 0) {
      loadMoreBtn.style.display = "none";
      alert("No results found for your search!");
      return;
    }

    renderImages(data.results);
  } catch (error) {
    console.error("Error searching images:", error);
    alert("An error occurred while fetching search results.");
  }
}

// Handle search input
searchBox.addEventListener('keyup', (e) => {
  if (e.key === 'Enter' && searchBox.value.trim() !== '') {
    const query = searchBox.value.trim();
    imagesContainer.innerHTML = ''; // Clear current images
    currentPage = 1; // Reset to first page
    isSearching = true; // Enable search mode
    searchImages(query);
  }
});



document.addEventListener("DOMContentLoaded", fetchImages);

loadMoreBtn.addEventListener('click', () => {
  currentPage++;
  if (isSearching) {
    const query = searchBox.value.trim();
    searchImages(query);
  } else {
    fetchImages();
  }
})

function createModal(image) {
  // Create modal structure
  const modal = document.createElement('div');
  modal.classList.add('modal'); // Add a modal class

  modal.innerHTML = `
    <div class="container">
      <div class="details-n-utilities">
        <div class="image-author">
          <i class="fa-solid fa-camera"></i>
          <p>${image.user.name}</p>
        </div>
        <div class="utilities">
          <button class="download-btn">
            <i class="fa-solid fa-download"></i>
          </button>
          <button class="close-btn">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
      </div>
      <div class="modal-image">
        <img src="${image.urls.regular}" alt="${image.alt_description || "Modal Image"}" />
      </div>
    </div>
  `;

  // Append the modal to the body
  document.body.appendChild(modal);

  // Add event listener to close the modal when the close button is clicked
  const closeBtn = modal.querySelector('.close-btn');
  closeBtn.addEventListener('click', () => {
    modal.remove(); // Remove the modal when closed
  });

  // Optionally, close the modal if the user clicks outside the modal container
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

 // Handle download button click
 const downloadBtn = modal.querySelector('.download-btn');
 downloadBtn.addEventListener('click', () => {
   // Create an <a> tag for downloading the image
   const a = document.createElement('a');
   a.href = image.urls.full; // Use the full-size image URL
   a.target = '_blank'; // Make sure the download happens in a new tab
   a.download = `${image.alt_description || "download"}.jpg`; // Set the file name for download

   // Append the <a> element to the DOM temporarily
   document.body.appendChild(a);

   // Trigger the download by clicking the <a> element programmatically
   a.click();

   // Remove the <a> element after the download is triggered
   document.body.removeChild(a);
 });
}

