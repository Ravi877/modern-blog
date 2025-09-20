// Post page script: Handles loading and displaying individual blog posts
// This file loads the specific post content when someone clicks on a blog post

// Load individual post content
document.addEventListener('DOMContentLoaded', function() {
    loadPostContent();
});

// Get post slug from URL parameters
function getPostSlug() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('slug');
}

// Load and display post content
async function loadPostContent() {
    const slug = getPostSlug();
    if (!slug) {
        showPostNotFound();
        return;
    }
    
    try {
        // Load posts index
        const response = await fetch('posts-data.json');
        const data = await response.json();
        const posts = data.posts || [];
        
        const post = posts.find(p => p.slug === slug);
        
        if (!post) {
            showPostNotFound();
            return;
        }
        
        // Load the actual markdown content
        const postResponse = await fetch(`blog-posts/${post.filename}`);
        const markdownContent = await postResponse.text();
        
        // Extract content after front matter
        const contentParts = markdownContent.split('---');
        const actualContent = contentParts.length > 2 ? contentParts.slice(2).join('---').trim() : markdownContent;
        
        // Update page title
        document.title = `${post.title} - ${siteConfig.siteName || 'My Modern Blog'}`;
        
        // Update post elements
        updatePostContent(post, actualContent);
        
        // Setup post navigation
        setupPostNavigation(post, posts);
        
    } catch (error) {
        console.error('Error loading post:', error);
        showPostNotFound();
    }
}

// Update post content on page
function updatePostContent(post, content) {
    // Update post title
    const titleElement = document.getElementById('post-title');
    if (titleElement) {
        titleElement.textContent = post.title;
    }
    
    // Update post date
    const dateElement = document.getElementById('post-date');
    if (dateElement) {
        dateElement.textContent = formatDate(post.date);
    }
    
    // Update post body
    const bodyElement = document.getElementById('post-body');
    if (bodyElement) {
        // Convert markdown to HTML
        const htmlContent = convertMarkdownToHTML(content);
        bodyElement.innerHTML = htmlContent;
    }
}

// Simple markdown to HTML converter
function convertMarkdownToHTML(markdown) {
    let html = markdown;
    
    // Convert headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Convert bold text
    html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
    
    // Convert italic text
    html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
    
    // Convert line breaks to paragraphs
    const paragraphs = html.split('\n\n');
    html = paragraphs.map(p => {
        if (p.trim() && !p.startsWith('<h') && !p.startsWith('<ul') && !p.startsWith('<ol')) {
            return `<p>${p.trim()}</p>`;
        }
        return p;
    }).join('\n');
    
    // Convert single line breaks to <br> within paragraphs
    html = html.replace(/\n/g, '<br>');
    
    return html;
}

// Setup navigation between posts
function setupPostNavigation(currentPost, allPosts) {
    const currentIndex = allPosts.findIndex(p => p.slug === currentPost.slug);
    
    const prevLink = document.getElementById('prev-post');
    const nextLink = document.getElementById('next-post');
    
    if (prevLink && nextLink) {
        // Previous post
        if (currentIndex > 0) {
            const prevPost = allPosts[currentIndex - 1];
            prevLink.href = `post.html?slug=${prevPost.slug}`;
            prevLink.textContent = `← ${prevPost.title}`;
            prevLink.style.display = 'block';
        } else {
            prevLink.style.display = 'none';
        }
        
        // Next post
        if (currentIndex < allPosts.length - 1) {
            const nextPost = allPosts[currentIndex + 1];
            nextLink.href = `post.html?slug=${nextPost.slug}`;
            nextLink.textContent = `${nextPost.title} →`;
            nextLink.style.display = 'block';
        } else {
            nextLink.style.display = 'none';
        }
    }
}

// Show post not found message
function showPostNotFound() {
    const titleElement = document.getElementById('post-title');
    const bodyElement = document.getElementById('post-body');
    
    if (titleElement) {
        titleElement.textContent = 'Post Not Found';
    }
    
    if (bodyElement) {
        bodyElement.innerHTML = `
            <div style="text-align: center; padding: 40px 0;">
                <h2>Sorry, this post could not be found.</h2>
                <p>The post you're looking for might have been moved or deleted.</p>
                <a href="blog.html" class="cta-button" style="display: inline-block; margin-top: 20px;">
                    View All Posts
                </a>
            </div>
        `;
    }
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