// Define o objeto global ZeroFirstTracker que usará a biblioteca de analytics
window.ZeroFirstTracker = {
    // Track sign up
    trackSignUp: function(user) {
        if (window.analytics && window.analytics.identify) {
            // First identify the user
            window.analytics.identify(user.email, {
                name: user.name,
                email: user.email,
                age: user.age,
                gender: user.gender
            });
            
            // Then track the sign up event
            window.analytics.track('User Sign Up', {
                method: 'form'
            });
        }
    },
    
    // Track sign in
    trackSignIn: function(user) {
        if (window.analytics && window.analytics.identify) {
            // Identify the user
            window.analytics.identify(user.email, {
                name: user.name,
                email: user.email,
                age: user.age,
                gender: user.gender
            });
            
            // Track the sign in event
            window.analytics.track('User Sign In', {
                method: 'form'
            });
        }
    },
    
    // Track sign out
    trackSignOut: function(user) {
        if (window.analytics && window.analytics.track) {
            window.analytics.track('User Sign Out');
        }
    },
    
    // Track article view
    trackArticleView: function(articleData) {
        if (window.analytics && window.analytics.track) {
            window.analytics.track('Article View', {
                article_id: articleData.id,
                title: articleData.title,
                category: articleData.category,
                author: articleData.author,
                read_time: articleData.readTime
            });
        }
    },
    
    // Track category view 
    trackCategoryView: function(category) {
        if (window.analytics && window.analytics.track) {
            window.analytics.track('Category View', {
                category: category
            });
            
            // Also track as a page view
            window.analytics.page('Category: ' + category, {
                category: category
            });
        }
    },
    
    // Track ad click
    trackAdClick: function(promoData) {
        if (window.analytics && window.analytics.track) {
            window.analytics.track('Ad Click', {
                ad_id: promoData.id,
                position: promoData.position,
                type: promoData.type
            });
        }
    },
    
    // Track survey submission
    trackSurveySubmission: function(surveyData) {
        if (window.analytics && window.analytics.track) {
            window.analytics.track('Survey Submission', surveyData);
        }
    },

    // General Identify Call ✅ (NEW)
    identify: function(userTraits) {
        if (window.analytics && window.analytics.identify) {
            window.analytics.identify(userTraits);
        }
    },
    
    // Track page view (general)
    trackPageView: function(pageName, properties) {
        if (window.analytics && window.analytics.page) {
            window.analytics.page(pageName, properties || {});
        }
    }
};

// Track initial page view for current page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    ZeroFirstTracker.trackPageView(document.title || 'Home');
});
