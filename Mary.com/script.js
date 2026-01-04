
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initUploadPreview();
    initLightbox();
});

/**
 * Mobile Menu Functionality
 */
function initMobileMenu() {
    const menuBtn = document.querySelector('header button'); // Assuming the first button in header is menu
    if (!menuBtn) return;

    // Create Overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transform transition-transform duration-300 translate-x-full flex flex-col items-center justify-center gap-8';
    overlay.innerHTML = `
        <button class="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10">
            <span class="material-symbols-outlined text-4xl">close</span>
        </button>
        <nav class="flex flex-col gap-6 text-center">
            <a href="Aguleri.html" class="text-2xl font-bold text-white hover:text-primary transition-colors">Home</a>
            <a href="weekly.html" class="text-2xl font-bold text-white hover:text-primary transition-colors">Events & Gallery</a>
            <a href="upload.html" class="text-2xl font-bold text-white hover:text-primary transition-colors">Upload</a>
            <a href="#" class="text-2xl font-bold text-white hover:text-primary transition-colors">Prayers</a>
            <a href="#" class="text-2xl font-bold text-white hover:text-primary transition-colors">Donate</a>
        </nav>
    `;
    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector('button');
    const links = overlay.querySelectorAll('a');

    function openMenu() {
        overlay.classList.remove('translate-x-full');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        overlay.classList.add('translate-x-full');
        document.body.style.overflow = '';
    }

    menuBtn.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);
    
    // Close menu when a link is clicked
    links.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
}

/**
 * Upload Preview Functionality
 */
function initUploadPreview() {
    const fileInput = document.getElementById('dropzone-file');
    const dropZone = fileInput?.closest('label');
    
    if (!fileInput || !dropZone) return;

    const originalContent = dropZone.innerHTML;

    function handleFile(file) {
        if (!file) return;

        // Check if image
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                dropZone.innerHTML = `
                    <div class="relative w-full h-full flex items-center justify-center p-2">
                        <img src="${e.target.result}" class="max-h-full max-w-full rounded-lg object-contain" />
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                            <span class="text-white text-sm font-medium">Click to change</span>
                        </div>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        } else {
            // Generic file feedback
            dropZone.innerHTML = `
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <span class="material-symbols-outlined text-[48px] text-green-500 mb-3">check_circle</span>
                    <p class="mb-2 text-sm text-gray-900 dark:text-white font-bold">${file.name}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">File selected</p>
                </div>
                <input id="dropzone-file" type="file" class="hidden" />
            `;
            // Re-attach input since we wiped it
            dropZone.querySelector('input').addEventListener('change', (e) => handleFile(e.target.files[0]));
        }
    }

    fileInput.addEventListener('change', (e) => {
        handleFile(e.target.files[0]);
    });

    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.classList.add('border-primary', 'bg-blue-50', 'dark:bg-blue-900/20');
    }

    function unhighlight(e) {
        dropZone.classList.remove('border-primary', 'bg-blue-50', 'dark:bg-blue-900/20');
    }

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFile(files[0]);
    }, false);
}

/**
 * Lightbox Gallery Functionality
 */
function initLightbox() {
    // Select all elements with data-alt attribute (cards with background images)
    const galleryItems = document.querySelectorAll('[data-alt]');
    
    if (galleryItems.length === 0) return;

    // Create Lightbox
    const lightbox = document.createElement('div');
    lightbox.className = 'fixed inset-0 z-[60] bg-black/95 backdrop-blur hidden flex flex-col items-center justify-center';
    lightbox.innerHTML = `
        <button id="lightbox-close" class="absolute top-4 right-4 p-2 text-white/70 hover:text-white">
            <span class="material-symbols-outlined text-4xl">close</span>
        </button>
        <div class="relative max-w-[90vw] max-h-[80vh]">
            <img id="lightbox-img" src="" class="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" />
        </div>
        <p id="lightbox-caption" class="mt-4 text-white text-lg font-medium text-center max-w-md px-4"></p>
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('#lightbox-img');
    const lightboxCaption = lightbox.querySelector('#lightbox-caption');
    const closeBtn = lightbox.querySelector('#lightbox-close');

    function openLightbox(url, caption) {
        lightboxImg.src = url;
        lightboxCaption.textContent = caption;
        lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.add('hidden');
        lightboxImg.src = '';
        document.body.style.overflow = '';
    }

    // Process elements to find image URL and attach click listener
    galleryItems.forEach(item => {
        let bgImage = item.style.backgroundImage;
        let url = '';

        // Extract URL from background-image: url("...")
        if (bgImage) {
            const match = bgImage.match(/url\(["']?([^"']*)["']?\)/);
            if (match) url = match[1];
        }

        // Add visual cue that it's clickable
        item.classList.add('cursor-zoom-in');
        
        item.addEventListener('click', (e) => {
            // Don't open if clicking a button inside (like the 'See All' link if nested)
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
            
            const caption = item.getAttribute('data-alt') || '';
            if (url) openLightbox(url, caption);
        });
    });

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
}
