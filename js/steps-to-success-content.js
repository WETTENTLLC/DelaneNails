/**
 * Steps to Success Content Module
 * Ensures information about the Steps to Success program is available
 */

(function() {
  console.log('Steps to Success content module loaded');
  
  // Wait for WebsiteContent to be available
  function ensureStepsContent() {
    if (typeof WebsiteContent !== 'undefined') {
      const content = WebsiteContent.getContent();
      
      // Check if Steps page exists in content
      if (!content.pages || !content.pages.steps) {
        console.log('Adding Steps to Success content');
        
        // Add Steps to Success page if missing
        if (!content.pages) content.pages = {};
        
        content.pages.steps = {
          id: 'steps',
          title: 'Steps To Success',
          url: 'steps-to-success.html',
          summary: "DNNC Steps to Success is our nonprofit initiative empowering women through mentorship and career advancement programs. Our goal is to provide support, education, and opportunities for women to achieve their professional goals in the beauty industry and beyond.",
          keywords: ['steps to success', 'program', 'initiative', 'foundation', 'nonprofit', 'empowerment']
        };
        
        // Add some sections
        if (!content.sections) content.sections = [];
        
        content.sections.push({
          id: 'steps-mission',
          title: 'Our Mission',
          content: "The mission of Steps to Success is to empower women through education, mentorship, and career development opportunities in the beauty industry and beyond.",
          pageId: 'steps',
          pageTitle: 'Steps To Success',
          pageUrl: 'steps-to-success.html'
        });
        
        content.sections.push({
          id: 'steps-programs',
          title: 'Our Programs',
          content: "We offer mentorship programs, educational workshops, scholarship opportunities, and career placement assistance to help women achieve their professional goals.",
          pageId: 'steps',
          pageTitle: 'Steps To Success',
          pageUrl: 'steps-to-success.html'
        });
        
        console.log('Steps to Success content added successfully');
      } else {
        console.log('Steps to Success content already exists');
      }
      
      // Add a direct handler for Steps to Success queries
      window.handleStepsToSuccessQuery = function() {
        return {
          title: 'Steps To Success',
          summary: "DNNC Steps to Success is our nonprofit initiative empowering women through mentorship and career advancement programs. Our goal is to provide support, education, and opportunities for women to achieve their professional goals in the beauty industry and beyond.",
          url: 'steps-to-success.html',
          sections: [
            {
              title: 'Our Mission',
              content: "The mission of Steps to Success is to empower women through education, mentorship, and career development opportunities in the beauty industry and beyond."
            },
            {
              title: 'Our Programs',
              content: "We offer mentorship programs, educational workshops, scholarship opportunities, and career placement assistance to help women achieve their professional goals."
            }
          ]
        };
      };
    } else {
      console.warn('WebsiteContent not available yet, will try again shortly');
      setTimeout(ensureStepsContent, 1000);
    }
  }
  
  // Run after a slight delay to ensure WebsiteContent has loaded
  setTimeout(ensureStepsContent, 1000);
})();
