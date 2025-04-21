// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    
    // Check if user is logged in
    function checkAuth() {
        const user = JSON.parse(localStorage.getItem('user'));
        const authButtons = document.getElementById('authButtons');
        const userProfile = document.getElementById('userProfile');
        const userName = document.getElementById('userName');
        
        if (user) {
            authButtons.style.display = 'none';
            userProfile.style.display = 'flex';
            userName.textContent = `Welcome, ${user.name}`;
            
            // Show survey after user has viewed 3 articles
            checkSurveyEligibility();
        } else {
            authButtons.style.display = 'flex';
            userProfile.style.display = 'none';
        }
    }
    
    // Modal functionality
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const closeButtons = document.getElementsByClassName('close');
    
    // Open modals
    if (loginBtn) {
        loginBtn.onclick = () => loginModal.style.display = 'block';
    }
    if (signupBtn) {
        signupBtn.onclick = () => signupModal.style.display = 'block';
    }
    
    // Close modals
    Array.from(closeButtons).forEach(button => {
        button.onclick = function() {
            loginModal.style.display = 'none';
            signupModal.style.display = 'none';
        }
    });
    
    window.onclick = function(event) {
        if (event.target == loginModal) loginModal.style.display = 'none';
        if (event.target == signupModal) signupModal.style.display = 'none';
    }
    
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.onsubmit = function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // Simulate login (accept any email/password for demo)
            const user = {
                email: email,
                name: 'Demo User',
                age: 30,
                gender: 'prefer_not_to_say'
            };
            
            localStorage.setItem('user', JSON.stringify(user));
            loginModal.style.display = 'none';
            checkAuth();
            
            // Track sign in
            ZeroFirstTracker.trackSignIn(user);
        }
    }
    
    // Signup form submission
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.onsubmit = function(e) {
            e.preventDefault();
            const user = {
                name: document.getElementById('signupName').value,
                email: document.getElementById('signupEmail').value,
                password: document.getElementById('signupPassword').value,
                age: document.getElementById('signupAge').value,
                gender: document.getElementById('signupGender').value
            };
            
            localStorage.setItem('user', JSON.stringify(user));
            signupModal.style.display = 'none';
            checkAuth();
            
            // Track sign up
            ZeroFirstTracker.trackSignUp(user);
        }
    }
    
    // Logout functionality
    if (logoutBtn) {
        logoutBtn.onclick = function() {
            const user = JSON.parse(localStorage.getItem('user'));
            
            // Track sign out
            ZeroFirstTracker.trackSignOut(user);
            
            localStorage.removeItem('user');
            checkAuth();
        }
    }
    
    // Article click handling - with actual navigation
    document.querySelectorAll('.main-story, .side-story, .news-card').forEach(item => {
        item.addEventListener('click', function(e) {
            // Check if clicking on an actual link (like category tags)
            if (e.target.tagName.toLowerCase() === 'a') {
                return; // Let default link behavior handle it
            }
            
            const title = this.querySelector('h3').textContent;
            const category = this.querySelector('.category-tag').textContent;
            const articleId = this.dataset.articleId;
            
            // Create article data object
            const articleData = {
                id: articleId,
                title: title,
                category: category,
                author: this.querySelector('.story-meta span')?.textContent || this.querySelector('.news-meta span')?.textContent,
                readTime: Math.floor(Math.random() * 10) + 3
            };
            
            // Track article view
            ZeroFirstTracker.trackArticleView(articleData);
            
            // Store articles viewed for survey eligibility
            let articlesViewed = JSON.parse(localStorage.getItem('articlesViewed')) || [];
            articlesViewed.push(articleId);
            localStorage.setItem('articlesViewed', JSON.stringify(articlesViewed));
            
            // Create URL-friendly slug from title
            const slug = title.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
            
            // Navigate to article page
            if (articleId === '1') {
                // Special handling for the Liverpool article which has a separate page
                window.location.href = `article-liverpool-secures-last-minute-victory-with-stunning-header.html`;
            } else {
                // For other articles, you could redirect to a generic article template
                window.location.href = `article-${slug}.html`;
            }
        });
    });
    
    // Category click handling - with actual navigation
    document.querySelectorAll('.nav-links a[data-category]').forEach(link => {
        link.addEventListener('click', function(e) {
            const category = this.dataset.category;
            ZeroFirstTracker.trackCategoryView(category);
            
            // Special handling for Football category which has a separate page
            if (category === 'Football') {
                window.location.href = 'category-football.html';
            } else {
                // For other categories, you could redirect to a generic category template
                window.location.href = `category-${category.toLowerCase()}.html`;
            }
        });
    });
    
    // Ensure category tags within articles don't interfere with article clicks
    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent article click handler from firing
            const category = this.textContent;
            
            // Track category view
            ZeroFirstTracker.trackCategoryView(category);
            
            // Navigate to category page
            if (category === 'Football') {
                window.location.href = 'category-football.html';
            } else {
                window.location.href = `category-${category.toLowerCase()}.html`;
            }
        });
    });
    
    // Ad click handling
    document.querySelectorAll('.promo-box').forEach(promo => {
        promo.addEventListener('click', function() {
            const promoData = {
                id: this.dataset.promoId,
                position: this.closest('.sidebar-promo') ? 'sidebar' : 'featured',
                type: this.querySelector('img').alt
            };
            
            ZeroFirstTracker.trackAdClick(promoData);
        });
    });
    
    // Survey functionality
    function checkSurveyEligibility() {
        const articlesViewed = JSON.parse(localStorage.getItem('articlesViewed')) || [];
        const surveyCompleted = localStorage.getItem('surveyCompleted');
        const surveySection = document.getElementById('surveySection');
        
        if (surveySection && articlesViewed.length >= 3 && !surveyCompleted) {
            surveySection.style.display = 'block';
        }
    }
    
    const surveyForm = document.getElementById('surveyForm');
    if (surveyForm) {
        surveyForm.onsubmit = function(e) {
            e.preventDefault();
            
            const surveyData = {
                visitFrequency: this.visitFrequency.value,
                favoriteSport: this.favoriteSport.value,
                rating: this.rating.value
            };
            
            ZeroFirstTracker.trackSurveySubmission(surveyData);
            
            localStorage.setItem('surveyCompleted', 'true');
            document.getElementById('surveySection').style.display = 'none';
            
            alert('Thank you for completing the survey!');
        }
    }
    
    // Initialize auth state
    checkAuth();
    
    // Hover effects (visual feedback)
    const storyCards = document.querySelectorAll('.main-story, .side-story, .news-card');
    
    storyCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = 'none';
        });
    });
});