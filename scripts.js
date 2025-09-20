// Main site scripts: Handles navigation, blog loading, and site configuration
// This file makes your site work - it loads content and handles user interactions

// Site configuration and data
let siteConfig = {};
let blogPosts = [];

// Initialize the site when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadSiteConfig();
    setupNavigation();
    
    // Load appropriate content based on page
    if (document.getElementById('recent-posts-grid')) {
        loadRecentPosts();
    }
    
    if (document.getElementById('posts-list')) {
        loadAllPosts();
    }
});

// Load site configuration from JSON file
async function loadSiteConfig() {
    try {
        const response = await fetch('site-config.json');
        siteConfig = await response.json();
        
        // Update site title and footer
        updateSiteElements();
        
    } catch (error) {
        console.log('Using default configuration');
        // Default config if file not found
        siteConfig = {
            siteName: "My Modern Blog",
            menu: { "Home": "index.html", "Blog": "blog.html" },
            footer: { text: "© 2025 My Blog. All rights reserved." },
            homepage: {
                heroTitle: "Welcome to My Blog",
                heroTagline: "Sharing thoughts, ideas, and stories from my journey"
            }
        };
        updateSiteElements();
    }
}

// Update site elements with config data
function updateSiteElements() {
    // Update site title
    const siteTitleElements = document.querySelectorAll('.site-title');
    siteTitleElements.forEach(el => {
        el.textContent = siteConfig.siteName || "My Modern Blog";
    });
    
    // Update footer
    const footerElement = document.getElementById('footer-text');
    if (footerElement) {
        footerElement.textContent = siteConfig.footer?.text || "© 2025 My Blog. All rights reserved.";
    }
    
    // Update homepage hero text
    const heroTitle = document.getElementById('hero-title');
    if (heroTitle) {
        heroTitle.textContent = siteConfig.homepage?.heroTitle || "Welcome to My Blog";
    }
    
    const heroTagline = document.getElementById('hero-tagline');
    if (heroTagline) {
        heroTagline.textContent = siteConfig.homepage?.heroTagline || "Sharing thoughts, ideas, and stories";
    }
}

// Setup navigation menu
function setupNavigation() {
    const navMenu = document.getElementById('nav-menu');
    if (!navMenu) return;
    
    navMenu.innerHTML = '';
    
    // Create menu items from config
    const menu = siteConfig.menu || { "Home": "index.html", "Blog": "blog.html" };
    
    Object.entries(menu).forEach(([title, url]) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = url;
        a.textContent = title;
        li.appendChild(a);
        navMenu.appendChild(li);
    });
}

// Load blog posts from posts index
async function loadBlogPosts() {
    if (blogPosts.length > 0) return blogPosts; // Already loaded
    
    try {
        const response = await fetch('posts-data.json');
        const data = await response.json();
        blogPosts = data.posts || [];
        
        // Sort posts by date (newest first)
        blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return blogPosts;
    } catch (error) {
        console.error('Error loading posts:', error);
        // Fallback to empty array if file not found
        blogPosts = [];
        return blogPosts;
    }
}

// Load recent posts for homepage
async function loadRecentPosts() {
    const posts = await loadBlogPosts();
    const recentPostsGrid = document.getElementById('recent-posts-grid');
    
    if (!recentPostsGrid) return;
    
    const recentPosts = posts.slice(0, siteConfig.homepage?.recentPostsCount || 3);
    
    recentPostsGrid.innerHTML = '';
    
    recentPosts.forEach(post => {
        const postCard = createPostCard(post);
        recentPostsGrid.appendChild(postCard);
    });
}

// Load all posts for blog page
async function loadAllPosts() {
    const posts = await loadBlogPosts();
    const postsList = document.getElementById('posts-list');
    
    if (!postsList) return;
    
    postsList.innerHTML = '';
    
    posts.forEach(post => {
        const postItem = createPostListItem(post);
        postsList.appendChild(postItem);
    });
}

// Create post card for homepage grid
function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    
    card.innerHTML = `
        <div class="post-card-image"></div>
        <div class="post-card-content">
            <h3>${post.title}</h3>
            <div class="post-card-meta">
                <span class="post-date">${formatDate(post.date)}</span>
            </div>
            <p>${post.excerpt}</p>
            <a href="post.html?slug=${post.slug}" class="read-more">Read More →</a>
        </div>
    `;
    
    return card;
}

// Create post item for blog listing
function createPostListItem(post) {
    const item = document.createElement('article');
    item.className = 'post-item';
    
    item.innerHTML = `
        <h2><a href="post.html?slug=${post.slug}">${post.title}</a></h2>
        <div class="post-item-meta">
            <span class="post-date">${formatDate(post.date)}</span>
        </div>
        <div class="post-item-excerpt">
            ${post.excerpt}
        </div>
    `;
    
    return item;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Smooth scrolling for anchor links
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});