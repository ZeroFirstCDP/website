// ZeroFirst Tracking System
const ZeroFirstTracker = {
    // Initialize tracking
    init() {
        console.log('ZeroFirst Tracker initialized');
        this.setupEventListeners();
    },

    // Generic event tracking function
    trackEvent(eventName, eventData = {}) {
        const timestamp = new Date().toISOString();
        const user = JSON.parse(localStorage.getItem('user'));
        
        // Add user data if available
        if (user) {
            eventData.userId = user.email;
            eventData.userName = user.name;
            eventData.userAge = user.age;
            eventData.userGender = user.gender;
        }
        
        // Add common properties
        eventData.timestamp = timestamp;
        eventData.page = window.location.pathname;
        eventData.referrer = document.referrer;
        
        // Log the event (in real scenario, this would send to your analytics API)
        console.log(`[ZeroFirst Event] ${eventName}:`, eventData);
        
        // Store events in localStorage for demo purposes
        let events = JSON.parse(localStorage.getItem('zeroFirstEvents')) || [];
        events.push({ eventName, eventData });
        localStorage.setItem('zeroFirstEvents', JSON.stringify(events));
    },
    
    // Track page view
    trackPageView(pageName) {
        this.trackEvent('Page Viewed', {
            pageName: pageName,
            url: window.location.href
        });
    },
    
    // Track user sign up
    trackSignUp(userData) {
        this.trackEvent('Signed Up', {
            name: userData.name,
            email: userData.email,
            age: userData.age,
            gender: userData.gender
        });
    },
    
    // Track user sign in
    trackSignIn(userData) {
        this.trackEvent('Signed In', {
            email: userData.email,
            loginTime: new Date().toISOString()
        });
    },
    
    // Track user sign out
    trackSignOut(userData) {
        this.trackEvent('Signed Out', {
            email: userData.email,
            logoutTime: new Date().toISOString()
        });
    },
    
    // Track article view
    trackArticleView(articleData) {
        this.trackEvent('Article Viewed', {
            articleId: articleData.id,
            articleTitle: articleData.title,
            articleCategory: articleData.category,
            author: articleData.author,
            readTime: articleData.readTime
        });
    },
    
    // Track category view
    trackCategoryView(categoryName) {
        this.trackEvent('Category Viewed', {
            categoryName: categoryName,
            viewTime: new Date().toISOString()
        });
    },
    
    // Track ad click
    trackAdClick(adData) {
        this.trackEvent('Ad Clicked', {
            adId: adData.id,
            adPosition: adData.position,
            adType: adData.type
        });
    },
    
    // Track survey submission
    trackSurveySubmission(surveyData) {
        this.trackEvent('Survey Submitted', {
            visitFrequency: surveyData.visitFrequency,
            favoriteSport: surveyData.favoriteSport,
            rating: surveyData.rating
        });
    },
    
    // Track scroll depth
    trackScrollDepth(depth) {
        this.trackEvent('Scroll Depth Reached', {
            depth: depth,
            maxScroll: document.documentElement.scrollHeight
        });
    },
    
    // Set up event listeners
    setupEventListeners() {
        // Track page view on load
        this.trackPageView(document.title);
        
        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            const currentDepth = Math.floor(scrollPercentage / 25) * 25; // Track 25%, 50%, 75%, 100%
            
            if (currentDepth > maxScroll && currentDepth <= 100) {
                maxScroll = currentDepth;
                this.trackScrollDepth(currentDepth);
            }
        });
    }
};

// Initialize the tracker when the script loads
document.addEventListener('DOMContentLoaded', () => {
    ZeroFirstTracker.init();
});