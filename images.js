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
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                createYouTubeEmbed(url, contentContainer);
            } else if (url.endsWith('.mp4')) {
                createVideoElement(url, contentContainer);
            } 
			else if (url.includes('vimeo.com')) {
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
    if (src.includes("mega.nz")) {
        const link = document.createElement('a');
        link.href = src;
        link.target = "_blank";
        link.textContent = "View Video on Mega.nz";
        link.style.display = "block";
        link.style.margin = "10px 0";
        container.appendChild(link);
    } else if (src.includes("youtube.com") || src.includes("youtu.be")) {
        const iframe = document.createElement('iframe');
        const videoId = extractYouTubeID(src);
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.allow = "autoplay; fullscreen; picture-in-picture";
        iframe.frameBorder = "0";
        iframe.style.width = "100%";
        iframe.style.height = "auto";
        iframe.style.aspectRatio = "16/9"; // Ensures the proper aspect ratio
        iframe.style.borderRadius = "10px";
        iframe.style.marginBottom = "10px";
        container.appendChild(iframe);
    } else {
        const video = document.createElement('video');
        video.src = src;
        video.controls = true;
        video.onerror = () => console.error('Error loading video:', src);
        video.onclick = () => openModal(src, 'video');
        container.appendChild(video);
    }
}

function extractYouTubeID(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}
function createYouTubeEmbed(src, container) {
    const videoId = extractYouTubeID(src);
    if (videoId) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.allow = "autoplay; fullscreen; picture-in-picture";
        iframe.frameBorder = "0";
        iframe.style.width = "100%";
        iframe.style.height = "auto";
        iframe.style.aspectRatio = "16/9";
        iframe.style.borderRadius = "10px";
        iframe.style.marginBottom = "10px";
        container.appendChild(iframe);

        const premiereNotice = document.createElement('div');
        premiereNotice.textContent = "Note: This is a YouTube Premiere. Content may not be available until the scheduled time.";
        premiereNotice.style.color = "#fff";
        premiereNotice.style.textAlign = "center";
        premiereNotice.style.fontSize = "14px";
        container.appendChild(premiereNotice);
    } else {
        console.error("Invalid YouTube video URL:", src);
    }
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
