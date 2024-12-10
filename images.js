document.addEventListener('DOMContentLoaded', function () {
    const sections = [
        { id: 'contentContainerC', label: 'C', name: 'My Videos' },
        { id: 'contentContainerD', label: 'D', name: 'Other Videos' },
        { id: 'contentContainerE', label: 'E', name: 'Car Photos' },
        { id: 'contentContainerF', label: 'F', name: 'Other Photos' }
    ];
    const apiKey = 'AIzaSyBh82Bqe-FfnZdzjGSVwmrpdKiURhhHaZ4'; // Replace with your Google Sheets API key
    const sheetId = '1Vn9sSmLbbMvZ9lJO1HxhuU4v1Sjs7Hs7jOlZT2c-9ms'; // Replace with your Google Sheet ID

    async function fetchContentFromSheet(range) {
        try {
            const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(`Error fetching data: ${data.error.message}`);
            }

            return data.values.slice(1).flat(); // Remove headers and flatten the array
        } catch (error) {
            console.error('Error fetching content:', error);
            return [];
        }
    }

    function displayContent(contentArray, containerId) {
        const contentContainer = document.getElementById(containerId);
        contentArray.forEach(url => {
            if (url) {
                if (url.includes('vimeo.com')) {
                    createVimeoElement(url, contentContainer);
                } else if (url.endsWith('.mp4')) {
                    createVideoElement(url, contentContainer);
                } else {
                    createImageElement(url, contentContainer);
                }
            }
        });
    }

    function createImageElement(src, container) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Image from sheet';
        img.onclick = () => openModal(src, 'image');
        container.appendChild(img);
    }

    function createVimeoElement(src, container) {
        const iframe = document.createElement('iframe');
        const vimeoID = src.split('/').pop(); // Extract the Vimeo video ID
        iframe.src = `https://player.vimeo.com/video/${vimeoID}`;
        iframe.width = "640";
        iframe.height = "360";
        iframe.frameBorder = "0";
        iframe.allow = "autoplay; fullscreen; picture-in-picture";
        iframe.title = "Vimeo Video";
        container.appendChild(iframe);
    }

    function createVideoElement(src, container) {
        const video = document.createElement('video');
        video.src = src;
        video.controls = true;
        video.onerror = () => console.error('Error loading video:', src);
        video.onclick = () => openModal(src, 'video');
        container.appendChild(video);
    }

    function openModal(src, type) {
        const modal = document.getElementById('modal');
        const modalImage = document.getElementById('modalImage');
        const modalVideo = document.getElementById('modalVideo');
        const modalIframe = document.getElementById('modalIframe');

        modal.style.display = 'block';

        if (type === 'image') {
            modalImage.style.display = 'block';
            modalVideo.style.display = 'none';
            modalIframe.style.display = 'none';
            modalImage.src = src;
        } else if (type === 'video') {
            if (src.includes('vimeo.com')) {
                modalIframe.style.display = 'block';
                modalVideo.style.display = 'none';
                modalImage.style.display = 'none';
                const vimeoID = src.split('/').pop(); // Extract the Vimeo video ID
                modalIframe.src = `https://player.vimeo.com/video/${vimeoID}`;
            } else {
                modalVideo.style.display = 'block';
                modalIframe.style.display = 'none';
                modalImage.style.display = 'none';
                modalVideo.src = src;
            }
        }
    }

    function closeModal() {
        const modal = document.getElementById('modal');
        modal.style.display = 'none';
        document.getElementById('modalImage').src = '';
        document.getElementById('modalVideo').src = '';
        document.getElementById('modalIframe').src = '';
    }

    document.getElementById('closeModal').onclick = closeModal;

    sections.forEach(async section => {
        const content = await fetchContentFromSheet(`Images!${section.label}1:${section.label}`);
        displayContent(content, section.id);
    });
});
