/* =========================================================
   MOLAS WAEC PAGE
   NAVIGATION + BACK TO TOP
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  
  /* =====================================================
     MOBILE NAVIGATION
  ===================================================== */
  
  const menuButton = document.querySelector(".mobile-menu-btn");
  const mainNav = document.querySelector(".main-nav");
  
  if (menuButton && mainNav) {
    
    menuButton.addEventListener("click", () => {
      
      const isOpen = mainNav.classList.toggle("show");
      
      menuButton.setAttribute(
        "aria-expanded",
        isOpen ? "true" : "false"
      );
      
      menuButton.setAttribute(
        "aria-label",
        isOpen ?
        "Close navigation menu" :
        "Open navigation menu"
      );
      
    });
    
    
    /* Close menu when a normal nav link is clicked */
    
    mainNav.querySelectorAll("a").forEach(link => {
      
      link.addEventListener("click", () => {
        
        if (
          !link.parentElement.classList.contains("nav-dropdown")
        ) {
          
          mainNav.classList.remove("show");
          
          menuButton.setAttribute(
            "aria-expanded",
            "false"
          );
          
          menuButton.setAttribute(
            "aria-label",
            "Open navigation menu"
          );
          
        }
        
      });
      
    });
    
    
    /* Close menu when clicking outside */
    
    document.addEventListener("click", event => {
      
      if (
        mainNav.classList.contains("show") &&
        !mainNav.contains(event.target) &&
        !menuButton.contains(event.target)
      ) {
        
        mainNav.classList.remove("show");
        
        menuButton.setAttribute(
          "aria-expanded",
          "false"
        );
        
        menuButton.setAttribute(
          "aria-label",
          "Open navigation menu"
        );
        
      }
      
    });
    
    
    /* Close mobile menu when screen becomes desktop */
    
    window.addEventListener("resize", () => {
      
      if (window.innerWidth > 900) {
        
        mainNav.classList.remove("show");
        
        menuButton.setAttribute(
          "aria-expanded",
          "false"
        );
        
        menuButton.setAttribute(
          "aria-label",
          "Open navigation menu"
        );
        
      }
      
    });
    
  }
  
  
  /* =====================================================
     MOBILE DROPDOWNS
     NEWS + ADMISSIONS
  ===================================================== */
  
  const dropdowns =
    document.querySelectorAll(".nav-dropdown");
  
  dropdowns.forEach(dropdown => {
    
    const trigger =
      dropdown.querySelector(":scope > a");
    
    if (!trigger) return;
    
    trigger.addEventListener("click", event => {
      
      /*
       * On mobile, prevent the # link
       * from jumping to the top.
       */
      
      if (window.innerWidth <= 900) {
        
        event.preventDefault();
        
        dropdowns.forEach(otherDropdown => {
          
          if (otherDropdown !== dropdown) {
            
            otherDropdown.classList.remove("open");
            
          }
          
        });
        
        dropdown.classList.toggle("open");
        
      }
      
    });
    
  });
  
  
  /* =====================================================
     BACK TO TOP
  ===================================================== */
  
  const topButton =
    document.querySelector(".molas-top");
  
  if (topButton) {
    
    window.addEventListener("scroll", () => {
      
      if (window.scrollY > 500) {
        
        topButton.classList.add("show");
        
      } else {
        
        topButton.classList.remove("show");
        
      }
      
    });
    
    
    topButton.addEventListener("click", () => {
      
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
      
    });
    
  }
  /* =====================================================
   WAEC SCROLL REVEAL ANIMATIONS
===================================================== */

const animatedElements = document.querySelectorAll(
  ".waec-hero-content, " +
  ".waec-hero-visual, " +
  ".section-heading, " +
  ".waec-hub-card, " +
  ".waec-resource-card, " +
  ".waec-news-card, " +
  ".waec-info-box, " +
  ".waec-cta"
);


if ("IntersectionObserver" in window) {
  
  const waecObserver =
    new IntersectionObserver(
      (entries, observer) => {
        
        entries.forEach(entry => {
          
          if (entry.isIntersecting) {
            
            entry.target.classList.add(
              "waec-visible"
            );
            
            observer.unobserve(
              entry.target
            );
            
          }
          
        });
        
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
      }
    );
  
  
  animatedElements.forEach(element => {
    
    waecObserver.observe(element);
    
  });
  
} else {
  
  animatedElements.forEach(element => {
    
    element.classList.add(
      "waec-visible"
    );
    
  });
  
}
});
