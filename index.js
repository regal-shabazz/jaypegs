
const accessKey = 'wN6E8FS_1VQxFsREVwjzGyRE4beUFzzvvkVEQahu1_w'


const searchInput = document.querySelector('.header.search-input');
const gallery = document.querySelector('.gallery .images');
const loadMoreButton = document.querySelector('.load-more');

let query = ''; 
let page = 1;  


async function fetchImages(searchQuery = '', pageNumber = 1) {
  const url = searchQuery 
    ? `https://api.unsplash.com/search/photos?query=${searchQuery}&page=${pageNumber}&per_page=12&client_id=${accessKey}`
    : `https://api.unsplash.com/photos?page=${pageNumber}&per_page=12&client_id=${accessKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return searchQuery ? data.results : data; 
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
}



function renderImages(images) {
  const imageCards = images.map(image => `
    <li class="cards">
      <img src="${image.urls.small}" 
      alt="${image.alt_description || 'Image'}"
      data-large="${image.urls.full}" 
      data-photographer="${image.user.name}" 
      data-download="${image.links.download_location}"  />
      <div class="details">
        <div class="photographer">
          <i class="fa-solid fa-camera"></i>
          <span>PC:</span>
          <span class="photographer-name">${image.user.name}</span>
        </div>
        <button class="download-btn" data-download="${image.links.download_location}">
          <i class="fa-solid fa-download"></i>
        </button>
      </div>
    </li>
  `).join('');
  gallery.innerHTML += imageCards;

  const downloadButtons = document.querySelectorAll('.download-btn');
  downloadButtons.forEach(button => {
    button.addEventListener('click', () => {
      const downloadLocation = button.getAttribute('data-download');
      openInNewTab(downloadLocation);
    });
  });


const galleryImages = document.querySelectorAll('.gallery .cards img');
const modal = document.querySelector('.modal');
const modalImage = modal.querySelector('.preview-image img');
const modalPhotographerName = modal.querySelector('.photographer-name');
const modalDownloadButton = modal.querySelector('.fa-download');
const modalCloseButton = modal.querySelector('.fa-times');

galleryImages.forEach(image => {
  image.addEventListener('click', () => {
    const largeImageUrl = image.getAttribute('data-large'); 
    const photographerName = image.getAttribute('data-photographer'); 
    const downloadLink = image.getAttribute('data-download'); 

    // Set modal content
    modalImage.src = largeImageUrl;
    modalPhotographerName.textContent = photographerName;
    modalDownloadButton.setAttribute('data-download', downloadLink);

    // Show the modal
    modal.style.display = 'block';
  });
});

// Close the modal
modalCloseButton.addEventListener('click', () => {
  modal.style.display = 'none'; // Hide the modal
});

// Close the modal when clicking outside the container
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// Handle download button click
modalDownloadButton.addEventListener('click', () => {
  const downloadLink = modalDownloadButton.getAttribute('data-download'); // Get the download URL
  openDownload(downloadLink); // Open the download in a new tab
});

function openDownload(downloadLocation) {
  const url = `${downloadLocation}&client_id=${accessKey}`; // Use download location URL

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch download URL');
      }
      return response.json();
    })
    .then(data => {
      // `data.url` contains the actual image download URL
      window.open(data.url, '_blank'); // Open the download link in a new tab
    })
    .catch(error => console.error('Error downloading image:', error));
}


}



// Open URL in a new tab
function openInNewTab(downloadLocation) {
  const url = `${downloadLocation}&client_id=${accessKey}`;
  
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch download URL');
      }
      return response.json();
    })
    .then(data => {
      // Open the actual image URL in a new tab
      window.open(data.url, '_blank');
    })
    .catch(error => console.error('Error opening download link:', error));
}



// Handle Search
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    query = searchInput.value.trim();
    page = 1; // Reset to first page
    gallery.innerHTML = ''; // Clear gallery
    fetchImages(query, page).then(renderImages);
  }
});

// Handle "Load More" Button
loadMoreButton.addEventListener('click', () => {
  page++; // Increment page
  fetchImages(query, page).then(renderImages);
});



// Initial Load
fetchImages().then(renderImages);