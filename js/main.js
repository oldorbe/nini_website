/**
 * Myrel Chernick Portfolio - Main JavaScript
 */

/** Default project ID when none in URL */
const DEFAULT_PROJECT_ID = 'punchdrunk';

/** Site title suffix for document.title */
const SITE_TITLE = 'Artist Portfolio';

/** Content paths (must match admin/config.yml and content/ files) */
const CONTENT_PATHS = {
    site: 'content/site.json',
    home: 'content/home.json',
    about: 'content/about.json',
    images: 'content/images.json',
    videotapes: 'content/videotapes.json',
    texts: 'content/texts.json'
};

/** Fallback data when fetch fails (e.g. opening HTML from file://) */
const FALLBACK_SITE = { heading: 'Artist Portfolio' };
const FALLBACK_HOME = {
    slides: [
        { image: 'https://picsum.photos/seed/art1/900/600', caption: 'Luminous Forms - 2023' },
        { image: 'https://picsum.photos/seed/art2/900/600', caption: 'Shadow Play - 2022' },
        { image: 'https://picsum.photos/seed/art3/900/600', caption: 'Light Passages - 2021' },
        { image: 'https://picsum.photos/seed/art4/900/600', caption: 'Reflected Moments - 2020' }
    ],
    excerpt: 'A visual artist working with light, space, and language. Creating multimedia installations and single-channel video works that explore perception, memory, and the spaces between words. Based in New York City.'
};
const FALLBACK_ABOUT = {
    body: '<p>A visual artist and writer based in New York City.</p><p>During the 1990s, the artist developed and curated Maternal Metaphors.</p>',
    resumeUrl: 'resume.html'
};
const FALLBACK_IMAGES = {
    projects: [
        { id: 'punchdrunk', title: 'Punchdrunk', year: '2023', images: [{ src: 'https://picsum.photos/seed/punchdrunk1/1200/825', alt: 'Punchdrunk - View 1' }, { src: 'https://picsum.photos/seed/punchdrunk2/1200/825', alt: 'Punchdrunk - View 2' }, { src: 'https://picsum.photos/seed/punchdrunk3/1200/825', alt: 'Punchdrunk - View 3' }, { src: 'https://picsum.photos/seed/punchdrunk4/1200/825', alt: 'Punchdrunk - View 4' }, { src: 'https://picsum.photos/seed/punchdrunk5/1200/825', alt: 'Punchdrunk - View 5' }] },
        { id: 'dangling-participles', title: 'Dangling Participles', year: '2022', images: [{ src: 'https://picsum.photos/seed/dangE1/1200/825', alt: 'Dangling Participles - View 1' }, { src: 'https://picsum.photos/seed/dangling-participles2/1200/825', alt: 'Dangling Participles - View 2' }, { src: 'https://picsum.photos/seed/dangling-participles3/1200/825', alt: 'Dangling Participles - View 3' }, { src: 'https://picsum.photos/seed/dangling-participles4/1200/825', alt: 'Dangling Participles - View 4' }, { src: 'https://picsum.photos/seed/dangling-participles5/1200/825', alt: 'Dangling Participles - View 5' }] },
        { id: 'domestic-interventions', title: 'Domestic Interventions', year: '2021', images: [{ src: 'https://picsum.photos/seed/domesticE1/1200/825', alt: 'Domestic Interventions - View 1' }, { src: 'https://picsum.photos/seed/domestic-interventions2/1200/825', alt: 'Domestic Interventions - View 2' }, { src: 'https://picsum.photos/seed/domestic-interventions3/1200/825', alt: 'Domestic Interventions - View 3' }, { src: 'https://picsum.photos/seed/domestic-interventions4/1200/825', alt: 'Domestic Interventions - View 4' }, { src: 'https://picsum.photos/seed/domestic-interventions5/1200/825', alt: 'Domestic Interventions - View 5' }] },
        { id: 'she-was-she-wasnt', title: "She was, she wasn't", year: '2020', images: [{ src: 'https://picsum.photos/seed/shewasE1/1200/825', alt: "She was, she wasn't - View 1" }, { src: 'https://picsum.photos/seed/she-was-she-wasnt2/1200/825', alt: "She was, she wasn't - View 2" }, { src: 'https://picsum.photos/seed/she-was-she-wasnt3/1200/825', alt: "She was, she wasn't - View 3" }, { src: 'https://picsum.photos/seed/she-was-she-wasnt4/1200/825', alt: "She was, she wasn't - View 4" }, { src: 'https://picsum.photos/seed/she-was-she-wasnt5/1200/825', alt: "She was, she wasn't - View 5" }] },
        { id: 'your-hands-are-tied', title: 'Your Hands Are Tied', year: '2019', images: [{ src: 'https://picsum.photos/seed/handsE1/1200/825', alt: 'Your Hands Are Tied - View 1' }, { src: 'https://picsum.photos/seed/your-hands-are-tied2/1200/825', alt: 'Your Hands Are Tied - View 2' }, { src: 'https://picsum.photos/seed/your-hands-are-tied3/1200/825', alt: 'Your Hands Are Tied - View 3' }, { src: 'https://picsum.photos/seed/your-hands-are-tied4/1200/825', alt: 'Your Hands Are Tied - View 4' }, { src: 'https://picsum.photos/seed/your-hands-are-tied5/1200/825', alt: 'Your Hands Are Tied - View 5' }] },
        { id: 'room-full-of-women', title: 'A Room Full of Women', year: '2018', images: [{ src: 'https://picsum.photos/seed/womenE1/1200/825', alt: 'A Room Full of Women - View 1' }, { src: 'https://picsum.photos/seed/room-full-of-women2/1200/825', alt: 'A Room Full of Women - View 2' }, { src: 'https://picsum.photos/seed/room-full-of-women3/1200/825', alt: 'A Room Full of Women - View 3' }, { src: 'https://picsum.photos/seed/room-full-of-women4/1200/825', alt: 'A Room Full of Women - View 4' }, { src: 'https://picsum.photos/seed/room-full-of-women5/1200/825', alt: 'A Room Full of Women - View 5' }] },
        { id: 'woman-mystery', title: 'Woman Mystery/Femme Mystère', year: '2017', images: [{ src: 'https://picsum.photos/seed/mysteryE1/1200/825', alt: 'Woman Mystery/Femme Mystère - View 1' }, { src: 'https://picsum.photos/seed/woman-mystery2/1200/825', alt: 'Woman Mystery/Femme Mystère - View 2' }, { src: 'https://picsum.photos/seed/woman-mystery3/1200/825', alt: 'Woman Mystery/Femme Mystère - View 3' }, { src: 'https://picsum.photos/seed/woman-mystery4/1200/825', alt: 'Woman Mystery/Femme Mystère - View 4' }, { src: 'https://picsum.photos/seed/woman-mystery5/1200/825', alt: 'Woman Mystery/Femme Mystère - View 5' }] },
        { id: 'dont-make-waves', title: "Don't Make Waves", year: '2016', images: [{ src: 'https://picsum.photos/seed/wavesE1/1200/825', alt: "Don't Make Waves - View 1" }, { src: 'https://picsum.photos/seed/dont-make-waves2/1200/825', alt: "Don't Make Waves - View 2" }, { src: 'https://picsum.photos/seed/dont-make-waves3/1200/825', alt: "Don't Make Waves - View 3" }, { src: 'https://picsum.photos/seed/dont-make-waves4/1200/825', alt: "Don't Make Waves - View 4" }, { src: 'https://picsum.photos/seed/dont-make-waves5/1200/825', alt: "Don't Make Waves - View 5" }] },
        { id: 'parts-of-speech', title: 'Parts of Speech', year: '2015', images: [{ src: 'https://picsum.photos/seed/speechE1/1200/825', alt: 'Parts of Speech - View 1' }, { src: 'https://picsum.photos/seed/parts-of-speech2/1200/825', alt: 'Parts of Speech - View 2' }, { src: 'https://picsum.photos/seed/parts-of-speech3/1200/825', alt: 'Parts of Speech - View 3' }, { src: 'https://picsum.photos/seed/parts-of-speech4/1200/825', alt: 'Parts of Speech - View 4' }, { src: 'https://picsum.photos/seed/parts-of-speech5/1200/825', alt: 'Parts of Speech - View 5' }] },
        { id: 'surprise', title: 'Surprise', year: '2014', images: [{ src: 'https://picsum.photos/seed/surpriseE1/1200/825', alt: 'Surprise - View 1' }, { src: 'https://picsum.photos/seed/surprise2/1200/825', alt: 'Surprise - View 2' }, { src: 'https://picsum.photos/seed/surprise3/1200/825', alt: 'Surprise - View 3' }, { src: 'https://picsum.photos/seed/surprise4/1200/825', alt: 'Surprise - View 4' }, { src: 'https://picsum.photos/seed/surprise5/1200/825', alt: 'Surprise - View 5' }] },
        { id: 'opposite', title: 'Opposite', year: '2013', images: [{ src: 'https://picsum.photos/seed/oppositeE1/1200/825', alt: 'Opposite - View 1' }, { src: 'https://picsum.photos/seed/opposite2/1200/825', alt: 'Opposite - View 2' }, { src: 'https://picsum.photos/seed/opposite3/1200/825', alt: 'Opposite - View 3' }, { src: 'https://picsum.photos/seed/opposite4/1200/825', alt: 'Opposite - View 4' }, { src: 'https://picsum.photos/seed/opposite5/1200/825', alt: 'Opposite - View 5' }] },
        { id: 'halfway-there', title: 'Halfway there', year: '2012', images: [{ src: 'https://picsum.photos/seed/halfwayE1/1200/825', alt: 'Halfway there - View 1' }, { src: 'https://picsum.photos/seed/halfway-there2/1200/825', alt: 'Halfway there - View 2' }, { src: 'https://picsum.photos/seed/halfway-there3/1200/825', alt: 'Halfway there - View 3' }, { src: 'https://picsum.photos/seed/halfway-there4/1200/825', alt: 'Halfway there - View 4' }, { src: 'https://picsum.photos/seed/halfway-there5/1200/825', alt: 'Halfway there - View 5' }] },
        { id: 'chills', title: 'Chills', year: '2011', images: [{ src: 'https://picsum.photos/seed/chillsE1/1200/825', alt: 'Chills - View 1' }, { src: 'https://picsum.photos/seed/chills2/1200/825', alt: 'Chills - View 2' }, { src: 'https://picsum.photos/seed/chills3/1200/825', alt: 'Chills - View 3' }, { src: 'https://picsum.photos/seed/chills4/1200/825', alt: 'Chills - View 4' }, { src: 'https://picsum.photos/seed/chills5/1200/825', alt: 'Chills - View 5' }] },
        { id: 'she-paused', title: 'She Paused', year: '2010', images: [{ src: 'https://picsum.photos/seed/pausedE1/1200/825', alt: 'She Paused - View 1' }, { src: 'https://picsum.photos/seed/she-paused2/1200/825', alt: 'She Paused - View 2' }, { src: 'https://picsum.photos/seed/she-paused3/1200/825', alt: 'She Paused - View 3' }, { src: 'https://picsum.photos/seed/she-paused4/1200/825', alt: 'She Paused - View 4' }, { src: 'https://picsum.photos/seed/she-paused5/1200/825', alt: 'She Paused - View 5' }] },
        { id: 'blue-grotto', title: 'Blue Grotto', year: '2009', images: [{ src: 'https://picsum.photos/seed/grottoE1/1200/825', alt: 'Blue Grotto - View 1' }, { src: 'https://picsum.photos/seed/blue-grotto2/1200/825', alt: 'Blue Grotto - View 2' }, { src: 'https://picsum.photos/seed/blue-grotto3/1200/825', alt: 'Blue Grotto - View 3' }, { src: 'https://picsum.photos/seed/blue-grotto4/1200/825', alt: 'Blue Grotto - View 4' }, { src: 'https://picsum.photos/seed/blue-grotto5/1200/825', alt: 'Blue Grotto - View 5' }] },
        { id: '1976', title: '1976', year: '2008', images: [{ src: 'https://picsum.photos/seed/art1976E1/1200/825', alt: '1976 - View 1' }, { src: 'https://picsum.photos/seed/1976-2/1200/825', alt: '1976 - View 2' }, { src: 'https://picsum.photos/seed/1976-3/1200/825', alt: '1976 - View 3' }, { src: 'https://picsum.photos/seed/1976-4/1200/825', alt: '1976 - View 4' }, { src: 'https://picsum.photos/seed/1976-5/1200/825', alt: '1976 - View 5' }] }
    ]
};
const FALLBACK_VIDEOTAPES = {
    projects: [
        { id: 'dangling-participles', title: 'Dangling Participles', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail: 'https://picsum.photos/seed/vidDang/300/250', description: 'Video description placeholder.' },
        { id: 'esprit-descalier', title: "Esprit d'escalier", videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail: 'https://picsum.photos/seed/vidEsprit/300/200', description: 'Video description placeholder.' },
        { id: 'sam-tanya-17', title: 'Sam Tanya 17', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail: 'https://picsum.photos/seed/vidSam/300/180', description: 'Video description placeholder.' },
        { id: 'out-my-window', title: 'Out my window', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail: 'https://picsum.photos/seed/vidWindow/300/220', description: 'Video description placeholder.' },
        { id: 'she-and-i', title: 'She and I', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail: 'https://picsum.photos/seed/vidShe/300/190', description: 'Video description placeholder.' },
        { id: 'mommy-mommy', title: 'Mommy Mommy', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail: 'https://picsum.photos/seed/vidMommy/300/240', description: 'Video description placeholder.' },
        { id: 'she-was-she-wasnt', title: "She was, she wasn't", videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail: 'https://picsum.photos/seed/vidShewas/300/210', description: 'Video description placeholder.' },
        { id: 'she-was-french', title: "She was, she wasn't French version", videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail: 'https://picsum.photos/seed/vidFrench/300/200', description: 'Video description placeholder.' }
    ]
};
const FALLBACK_TEXTS = {
    entries: [
        { id: 'mapping-maternal', title: 'Mapping the Maternal: Art, Ethics and the Anthropocene', featuredImage: 'https://picsum.photos/seed/text1/400/300', body: 'Sample body text. Replace in Decap CMS.', attachments: [] },
        { id: 'm-word', title: 'The M Word', featuredImage: 'https://picsum.photos/seed/text2/400/300', body: 'Sample body text.', attachments: [] },
        { id: 'maternal-metaphors', title: 'Maternal Metaphors catalog', featuredImage: 'https://picsum.photos/seed/text3/400/300', body: 'Sample body text.', attachments: [] },
        { id: 'time-passes', title: 'Time Passes', featuredImage: 'https://picsum.photos/seed/text4/400/300', body: 'Sample body text.', attachments: [] },
        { id: 'living-cobwebs', title: 'Living With Cobwebs', featuredImage: 'https://picsum.photos/seed/text5/400/300', body: 'Sample body text.', attachments: [] },
        { id: 'studio-visit', title: 'The Studio Visit', featuredImage: 'https://picsum.photos/seed/text6/400/300', body: 'Sample body text.', attachments: [] }
    ]
};

/**
 * Load content JSON from path; on failure use fallback for that content type.
 * @param {string} path - e.g. 'content/images.json'
 * @returns {Promise<object>} - { projects } or { entries } depending on path
 */
function loadContent(path) {
    const fallbacks = {
        [CONTENT_PATHS.site]: FALLBACK_SITE,
        [CONTENT_PATHS.home]: FALLBACK_HOME,
        [CONTENT_PATHS.about]: FALLBACK_ABOUT,
        [CONTENT_PATHS.images]: FALLBACK_IMAGES,
        [CONTENT_PATHS.videotapes]: FALLBACK_VIDEOTAPES,
        [CONTENT_PATHS.texts]: FALLBACK_TEXTS
    };
    return fetch(path)
        .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
        .catch(() => fallbacks[path] || { projects: [], entries: [] });
}

document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initSiteHeading();
    initHomePage();
    initAboutPage();
    initProjectGallery();
    initDropdownMenu();
    initProjectNavigation();
    initImagesGallery();
    initVideotapesGallery();
    initTextsGallery();
    initVideoDetailPage();
    initTextDetailPage();
    initNavFromContent();
});

/** Cached site heading from site.json (set by initSiteHeading); use for document.title */
function getSiteTitle() {
    return (typeof window !== 'undefined' && window.__siteHeading) ? window.__siteHeading : SITE_TITLE;
}

/**
 * Load site.json and set heading in logo, sidebar, and browser tab (all pages).
 */
function initSiteHeading() {
    loadContent(CONTENT_PATHS.site).then(function(data) {
        var heading = (data && data.heading) ? String(data.heading).trim() : SITE_TITLE;
        window.__siteHeading = heading;
        document.querySelectorAll('.logo a, .sidebar-header h2').forEach(function(el) { el.textContent = heading; });
        var t = document.title;
        if (t.indexOf(' - ') !== -1) {
            document.title = t.replace(/\s*-\s*[\s\S]*$/, ' - ' + heading);
        } else {
            document.title = heading;
        }
    });
}

/**
 * Home page: hero slider and excerpt from content/home.json. Calls initSlider after rendering.
 */
function initHomePage() {
    var slider = document.querySelector('.hero-slider');
    if (!slider) return;
    var container = slider.querySelector('.slider-container');
    var dotsWrap = slider.querySelector('.slider-dots');
    loadContent(CONTENT_PATHS.home).then(function(data) {
        var slides = (data && data.slides) ? data.slides : [];
        if (container && slides.length > 0) {
            container.innerHTML = slides.map(function(s, i) {
                var img = (s.image || '').trim();
                var cap = escapeHtml((s.caption || '').trim());
                return '<div class="slide' + (i === 0 ? ' active' : '') + '"><img src="' + (img || '') + '" alt="' + cap + '"><div class="slide-caption">' + cap + '</div></div>';
            }).join('');
        }
        if (dotsWrap && slides.length > 0) {
            dotsWrap.innerHTML = slides.map(function(_, i) {
                return '<button class="slider-dot' + (i === 0 ? ' active' : '') + '" aria-label="Slide ' + (i + 1) + '"></button>';
            }).join('');
        }
        initSlider();
        var excerptEl = document.getElementById('home-excerpt');
        if (excerptEl && data && data.excerpt) {
            excerptEl.textContent = data.excerpt;
        }
    });
}

/**
 * About page: body and resume link from content/about.json.
 */
function initAboutPage() {
    var wrap = document.getElementById('about-content');
    if (!wrap) return;
    loadContent(CONTENT_PATHS.about).then(function(data) {
        if (!data) return;
        var body = (data.body || '').trim();
        var resumeUrl = (data.resumeUrl || 'resume.html').trim();
        wrap.innerHTML = '<h2>About</h2>' + (body ? body : '') + '<p class="mt-20"><a href="' + escapeHtml(resumeUrl) + '">Resume »</a></p>';
    });
}

/**
 * Render images list from content into #images-gallery
 */
function initImagesGallery() {
    const container = document.getElementById('images-gallery');
    if (!container) return;
    loadContent(CONTENT_PATHS.images).then(function(data) {
        const projects = data.projects || [];
        container.innerHTML = projects.map(function(p) {
            const firstImg = (p.images && p.images[0]) ? p.images[0] : { src: '', alt: p.title };
            return '<article class="gallery-item"><a href="project-detail.html?id=' + encodeURIComponent(p.id) + '"><img src="' + (firstImg.src || '') + '" alt="' + escapeHtml(firstImg.alt || p.title) + '"><h3 class="gallery-item-title">' + escapeHtml(p.title) + '</h3></a></article>';
        }).join('');
    });
}

/**
 * Render videotapes list from content into #videotapes-gallery
 */
function initVideotapesGallery() {
    const container = document.getElementById('videotapes-gallery');
    if (!container) return;
    loadContent(CONTENT_PATHS.videotapes).then(function(data) {
        const projects = data.projects || [];
        container.innerHTML = projects.map(function(p) {
            const thumb = p.thumbnail || '';
            return '<article class="gallery-item"><a href="video-detail.html?id=' + encodeURIComponent(p.id) + '"><img src="' + thumb + '" alt="' + escapeHtml(p.title) + '"><h3 class="gallery-item-title">' + escapeHtml(p.title) + '</h3></a></article>';
        }).join('');
    });
}

/**
 * Render texts list from content into #texts-gallery
 */
function initTextsGallery() {
    const container = document.getElementById('texts-gallery');
    if (!container) return;
    loadContent(CONTENT_PATHS.texts).then(function(data) {
        const entries = data.entries || [];
        container.innerHTML = entries.map(function(e) {
            const img = e.featuredImage || '';
            return '<article class="gallery-item"><a href="text-detail.html?id=' + encodeURIComponent(e.id) + '"><img src="' + img + '" alt="' + escapeHtml(e.title) + '"><h3 class="gallery-item-title">' + escapeHtml(e.title) + '</h3></a></article>';
        }).join('');
    });
}

function escapeHtml(s) {
    if (!s) return '';
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
}

/**
 * Fill header dropdowns and sidebar submenus from content (images, videotapes, texts).
 */
function initNavFromContent() {
    function renderImages(projects) {
        return (projects || []).map(function(p) {
            return '<li><a href="project-detail.html?id=' + encodeURIComponent(p.id) + '">' + escapeHtml(p.title) + '</a></li>';
        }).join('');
    }
    function renderVideotapes(projects) {
        return (projects || []).map(function(p) {
            return '<li><a href="video-detail.html?id=' + encodeURIComponent(p.id) + '">' + escapeHtml(p.title) + '</a></li>';
        }).join('');
    }
    function renderTexts(entries) {
        return (entries || []).map(function(e) {
            return '<li><a href="text-detail.html?id=' + encodeURIComponent(e.id) + '">' + escapeHtml(e.title) + '</a></li>';
        }).join('');
    }
    Promise.all([
        loadContent(CONTENT_PATHS.images),
        loadContent(CONTENT_PATHS.videotapes),
        loadContent(CONTENT_PATHS.texts)
    ]).then(function(results) {
        var inst = results[0].projects || [];
        var vid = results[1].projects || [];
        var txt = results[2].entries || [];
        var dropMenus = document.querySelectorAll('.main-nav .dropdown .dropdown-menu');
        if (dropMenus.length >= 3) {
            dropMenus[0].innerHTML = renderImages(inst);
            dropMenus[1].innerHTML = renderVideotapes(vid);
            dropMenus[2].innerHTML = renderTexts(txt);
        }
        document.querySelectorAll('.sidebar-nav > li').forEach(function(li) {
            var a = li.querySelector('a');
            var sub = li.querySelector('ul.submenu');
            if (!a || !sub) return;
            var href = (a.getAttribute('href') || '');
            if (href.indexOf('images') !== -1) sub.innerHTML = renderImages(inst);
            else if (href.indexOf('videotapes') !== -1) sub.innerHTML = renderVideotapes(vid);
            else if (href.indexOf('texts') !== -1) sub.innerHTML = renderTexts(txt);
        });
        document.querySelectorAll('[data-nav="images"]').forEach(function(el) { el.innerHTML = renderImages(inst); });
        document.querySelectorAll('[data-nav="videotapes"]').forEach(function(el) { el.innerHTML = renderVideotapes(vid); });
        document.querySelectorAll('[data-nav="texts"]').forEach(function(el) { el.innerHTML = renderTexts(txt); });
    });
}

/**
 * Video detail page: fill from content/videotapes.json by ?id=
 */
function initVideoDetailPage() {
    var embed = document.getElementById('video-embed');
    if (!embed) return;
    var urlParams = new URLSearchParams(window.location.search);
    var id = urlParams.get('id');
    loadContent(CONTENT_PATHS.videotapes).then(function(data) {
        var projects = data.projects || [];
        var project = id ? projects.find(function(p) { return p.id === id; }) : projects[0];
        if (!project) return;
        document.getElementById('video-title').textContent = project.title;
        document.title = project.title + ' - ' + getSiteTitle();
        embed.src = project.videoUrl || '';
        var infoTitle = document.getElementById('video-info-title');
        if (infoTitle) infoTitle.textContent = project.title;
        var desc = document.getElementById('video-description');
        if (desc) {
            var descRaw = project.description || '';
            var descIsHtml = descRaw.trim().startsWith('<') || /<[a-z][\s\S]*>/i.test(descRaw);
            if (descIsHtml) {
                desc.innerHTML = descRaw;
            } else {
                desc.textContent = descRaw;
            }
        }
    });
}

/**
 * Text detail page: fill from content/texts.json by ?id=
 */
function initTextDetailPage() {
    var container = document.getElementById('text-detail-body');
    if (!container) return;
    var urlParams = new URLSearchParams(window.location.search);
    var id = urlParams.get('id');
    loadContent(CONTENT_PATHS.texts).then(function(data) {
        var entries = data.entries || [];
        var entry = id ? entries.find(function(e) { return e.id === id; }) : entries[0];
        if (!entry) return;
        document.title = entry.title + ' - ' + getSiteTitle();
        var breadcrumbEl = document.getElementById('text-detail-breadcrumb');
        if (breadcrumbEl) breadcrumbEl.textContent = entry.title;
        var titleEl = document.getElementById('text-detail-title');
        if (titleEl) titleEl.textContent = entry.title;
        var imgEl = document.getElementById('text-detail-image');
        if (imgEl && entry.featuredImage) { imgEl.src = entry.featuredImage; imgEl.alt = entry.title; imgEl.style.display = ''; } else if (imgEl) imgEl.style.display = 'none';
        var raw = entry.body || '';
        // If body looks like HTML (starts with < or contains tags), render directly; otherwise use marked or escape
        var isHtml = raw.trim().startsWith('<') || /<[a-z][\s\S]*>/i.test(raw);
        if (isHtml) {
            container.innerHTML = raw;
        } else {
            container.innerHTML = (typeof marked !== 'undefined' && marked.parse) ? marked.parse(raw) : escapeHtml(raw).replace(/\n/g, '<br>');
        }
        var attachEl = document.getElementById('text-detail-attachments');
        if (attachEl && entry.attachments && entry.attachments.length) {
            attachEl.innerHTML = entry.attachments.map(function(a) {
                return '<a href="' + (a.url || '#') + '" target="_blank" rel="noopener">' + escapeHtml(a.label || a.url || 'Link') + '</a>';
            }).join(' ');
            attachEl.style.display = '';
        } else if (attachEl) attachEl.style.display = 'none';
    });
}

/**
 * Mobile Menu Toggle
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (!menuToggle || !sidebar) return;
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        if (overlay) overlay.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    });
    
    if (overlay) {
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Close menu on link click
    const sidebarLinks = sidebar.querySelectorAll('a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function() {
            sidebar.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

/**
 * Homepage Slider/Carousel
 */
function initSlider() {
    const slider = document.querySelector('.hero-slider');
    if (!slider) return;
    
    const slides = slider.querySelectorAll('.slide');
    const dots = slider.querySelectorAll('.slider-dot');
    const prevBtn = slider.querySelector('.slider-prev');
    const nextBtn = slider.querySelector('.slider-next');
    
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    let autoSlideInterval;
    
    function showSlide(index) {
        // Handle wrap-around
        if (index >= slides.length) index = 0;
        if (index < 0) index = slides.length - 1;
        
        // Update slides
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        
        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        
        currentSlide = index;
    }
    
    function nextSlide() {
        showSlide(currentSlide + 1);
    }
    
    function prevSlide() {
        showSlide(currentSlide - 1);
    }
    
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 5000);
    }
    
    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }
    
    // Event listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            prevSlide();
            stopAutoSlide();
            startAutoSlide();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            nextSlide();
            stopAutoSlide();
            startAutoSlide();
        });
    }
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            showSlide(index);
            stopAutoSlide();
            startAutoSlide();
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            stopAutoSlide();
            startAutoSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            stopAutoSlide();
            startAutoSlide();
        }
    });
    
    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    slider.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    slider.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
            stopAutoSlide();
            startAutoSlide();
        }
    }
    
    // Start auto-slide
    startAutoSlide();
    
    // Pause on hover
    slider.addEventListener('mouseenter', stopAutoSlide);
    slider.addEventListener('mouseleave', startAutoSlide);
}

/**
 * Project Detail Gallery - New version with side arrows (data from content/images.json)
 */
function initProjectGallery() {
    const galleryWrapper = document.querySelector('.project-gallery-wrapper');
    
    if (galleryWrapper) {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id') || DEFAULT_PROJECT_ID;
        loadContent(CONTENT_PATHS.images).then(function(data) {
            const projects = data.projects || [];
            const current = projects.find(function(p) { return p.id === projectId; }) || projects[0];
            const images = (current && current.images && current.images.length) ? current.images : [];
            initNewProjectGallery(galleryWrapper, images);
        });
        return;
    }
    
    // Legacy gallery with thumbnails
    const gallery = document.querySelector('.project-gallery');
    if (!gallery) return;
    
    const mainImage = gallery.querySelector('.project-image img');
    const thumbnails = gallery.querySelectorAll('.project-thumb');
    const prevBtn = gallery.querySelector('.project-nav-btn.prev');
    const nextBtn = gallery.querySelector('.project-nav-btn.next');
    
    if (!mainImage || thumbnails.length === 0) return;
    
    let currentIndex = 0;
    const images = Array.from(thumbnails).map(thumb => ({
        src: thumb.dataset.full || thumb.src,
        alt: thumb.alt
    }));
    
    function showImage(index) {
        if (index >= images.length) index = 0;
        if (index < 0) index = images.length - 1;
        
        mainImage.src = images[index].src;
        mainImage.alt = images[index].alt;
        
        thumbnails.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
        
        currentIndex = index;
    }
    
    // Thumbnail clicks
    thumbnails.forEach((thumb, index) => {
        thumb.addEventListener('click', function() {
            showImage(index);
        });
    });
    
    // Navigation buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            showImage(currentIndex - 1);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            showImage(currentIndex + 1);
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            showImage(currentIndex - 1);
        } else if (e.key === 'ArrowRight') {
            showImage(currentIndex + 1);
        }
    });
}

/**
 * New Project Gallery with side arrows (no thumbnails). Images from content or empty.
 */
function initNewProjectGallery(wrapper, images) {
    images = images || [];
    const mainImage = wrapper.querySelector('#main-image');
    const imageLink = wrapper.querySelector('#image-link');
    const prevBtn = wrapper.querySelector('#prev-image');
    const nextBtn = wrapper.querySelector('#next-image');
    
    if (!mainImage) return;
    
    let currentIndex = 0;
    
    function updateArrowVisibility() {
        if (prevBtn) prevBtn.classList.toggle('hidden', images.length <= 1 || currentIndex === 0);
        if (nextBtn) nextBtn.classList.toggle('hidden', images.length <= 1 || currentIndex === images.length - 1);
    }
    
    function showImage(index) {
        if (index < 0) index = 0;
        if (index >= images.length) index = Math.max(0, images.length - 1);
        if (images.length === 0) return;
        var img = images[index];
        mainImage.src = img.src || '';
        mainImage.alt = img.alt || '';
        if (imageLink) imageLink.href = img.src || '#';
        currentIndex = index;
        updateArrowVisibility();
    }
    
    // Navigation buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentIndex > 0) {
                showImage(currentIndex - 1);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (currentIndex < images.length - 1) {
                showImage(currentIndex + 1);
            }
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
            showImage(currentIndex - 1);
        } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
            showImage(currentIndex + 1);
        }
    });
    
    if (images.length > 0) {
        showImage(0);
    }
}

/**
 * Initialize Project Navigation (Previous/Next, title, year - data from content/images.json)
 */
function initProjectNavigation() {
    const projectNavContainer = document.querySelector('.project-nav-container');
    if (!projectNavContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id') || DEFAULT_PROJECT_ID;

    loadContent(CONTENT_PATHS.images).then(function(data) {
        const projects = data.projects || [];
        const currentIndex = projects.findIndex(function(p) { return p.id === projectId; });
        if (currentIndex === -1) return;
        const currentProject = projects[currentIndex];

        const projectTitleEl = document.getElementById('project-title');
        const projectYearEl = document.getElementById('project-year');
        const mainImage = document.getElementById('main-image');
        const imageLink = document.getElementById('image-link');

        if (projectTitleEl) projectTitleEl.textContent = currentProject.title;
        if (projectYearEl) projectYearEl.textContent = currentProject.year;
        document.title = currentProject.title + ' - ' + getSiteTitle();

        if (currentProject.images && currentProject.images[0]) {
            if (mainImage) { mainImage.src = currentProject.images[0].src; mainImage.alt = currentProject.images[0].alt; }
            if (imageLink) imageLink.href = currentProject.images[0].src;
        }

        const prevProjectLink = document.getElementById('prev-project');
        const nextProjectLink = document.getElementById('next-project');
        if (prevProjectLink) {
            if (currentIndex > 0) {
                prevProjectLink.href = 'project-detail.html?id=' + encodeURIComponent(projects[currentIndex - 1].id);
                prevProjectLink.classList.remove('hidden');
            } else {
                prevProjectLink.classList.add('hidden');
            }
        }
        if (nextProjectLink) {
            if (currentIndex < projects.length - 1) {
                nextProjectLink.href = 'project-detail.html?id=' + encodeURIComponent(projects[currentIndex + 1].id);
                nextProjectLink.classList.remove('hidden');
            } else {
                nextProjectLink.classList.add('hidden');
            }
        }
    });
}

/**
 * Dropdown Menu (Desktop)
 */
function initDropdownMenu() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (!toggle || !menu) return;
        
        // For touch devices
        toggle.addEventListener('click', function(e) {
            if (window.innerWidth <= 992) {
                e.preventDefault();
                dropdown.classList.toggle('open');
            }
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown.open').forEach(d => {
                d.classList.remove('open');
            });
        }
    });
}

/**
 * Smooth scroll for anchor links
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
