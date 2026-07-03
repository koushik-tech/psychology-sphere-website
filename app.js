/* Psychology Sphere - Core Application Client Interactions */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // --- MOBILE NAVIGATION DRAWER ---
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }

  // Close mobile navigation drawer when clicking a link
  document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
      if (navLinks) {
        navLinks.classList.remove("active");
      }
    });
  });

  // --- ACCORDION TOGGLE (FAQ) ---
  document.querySelectorAll(".accordion-header").forEach(header => {
    header.addEventListener("click", () => {
      const item = header.parentElement;
      
      // Close all other items
      document.querySelectorAll(".accordion-item").forEach(i => {
        if (i !== item) {
          i.classList.remove("active");
        }
      });
      
      // Toggle current item
      item.classList.toggle("active");
    });
  });

  // --- LOGIN MODAL HANDLING ---
  const loginModal = document.getElementById("login-modal");
  const loginTrigger = document.getElementById("btn-login-trigger");
  const loginClose = document.getElementById("login-modal-close");
  const footerLoginTriggers = document.querySelectorAll(".footer-login-trigger");

  const openLoginModal = (e) => {
    if (e) e.preventDefault();
    if (loginModal) loginModal.classList.add("active");
  };

  const closeLoginModal = () => {
    if (loginModal) loginModal.classList.remove("active");
  };

  if (loginTrigger) loginTrigger.addEventListener("click", openLoginModal);
  if (loginClose) loginClose.addEventListener("click", closeLoginModal);
  footerLoginTriggers.forEach(trigger => trigger.addEventListener("click", openLoginModal));

  // Handle Login form submit
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Login Successful! Welcome to your Portal Dashboard.", "success");
      closeLoginModal();
      loginForm.reset();
    });
  }

  // Close modal when clicking outside box
  window.addEventListener("click", (e) => {
    if (e.target === loginModal) closeLoginModal();
  });

  // --- COURSE DETAILS MODAL POPUPS ---
  const coursesData = {
    "1": {
      title: "UGC NET Psychology",
      description: "Complete preparation for UGC NET entrance exam with comprehensive syllabus coverage.",
      duration: "6 Months",
      fees: "₹ 8,999"
    },
    "2": {
      title: "MA Psychology",
      description: "In-depth learning for future leaders. Advanced counseling theories and practices.",
      duration: "2 Years",
      fees: "₹ 24,000"
    },
    "3": {
      title: "CUET PG Psychology",
      description: "Crack CUET PG with confidence. Specialized mock tests and concepts.",
      duration: "3 Months",
      fees: "₹ 6,999"
    },
    "4": {
      title: "TISSNET Psychology",
      description: "Specialized coaching for TISSNET entrance. Structured curriculum and guidance.",
      duration: "3 Months",
      fees: "₹ 7,499"
    }
  };

  const courseDetailModal = document.getElementById("course-detail-modal");
  const courseModalClose = document.getElementById("course-modal-close");
  const courseModalContent = document.getElementById("course-modal-content");

  const closeCourseModal = () => {
    if (courseDetailModal) courseDetailModal.classList.remove("active");
  };

  if (courseModalClose) {
    courseModalClose.addEventListener("click", closeCourseModal);
  }

  document.querySelectorAll(".course-card-premium").forEach(card => {
    card.addEventListener("click", () => {
      const courseId = card.getAttribute("data-course-id");
      const course = coursesData[courseId];
      if (course && courseDetailModal && courseModalContent) {
        courseModalContent.innerHTML = `
          <span class="badge badge-primary" style="margin-bottom:0.75rem;">Syllabus Overview</span>
          <h2 style="margin-bottom:0.5rem; font-size:1.5rem; font-weight:800; color:#0f172a;">${course.title}</h2>
          <p style="margin-bottom:1.5rem; font-size:0.95rem; color:#475569; line-height:1.5;">${course.description}</p>
          
          <h4 style="margin-bottom:0.5rem; color:#3b20a6; font-weight:700;">Curriculum Modules</h4>
          <ul style="list-style:none; padding:0; margin-bottom:2rem; display:flex; flex-direction:column; gap:0.5rem; text-align:left;">
            <li style="display:flex; gap:0.5rem; font-size:0.875rem; color:#475569;"><i data-lucide="check" style="width:16px; color:#059669; flex-shrink:0;"></i> Module 1: Foundations & Historical Timeline</li>
            <li style="display:flex; gap:0.5rem; font-size:0.875rem; color:#475569;"><i data-lucide="check" style="width:16px; color:#059669; flex-shrink:0;"></i> Module 2: Research Design & Experimental Methods</li>
            <li style="display:flex; gap:0.5rem; font-size:0.875rem; color:#475569;"><i data-lucide="check" style="width:16px; color:#059669; flex-shrink:0;"></i> Module 3: Clinical Case Histories & Assessments</li>
            <li style="display:flex; gap:0.5rem; font-size:0.875rem; color:#475569;"><i data-lucide="check" style="width:16px; color:#059669; flex-shrink:0;"></i> Module 4: Mock Entrance Exams & Practice Papers</li>
          </ul>

          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #f1f3f7; padding-top:1.25rem;">
            <div>
              <div style="font-size:0.75rem; color:#94a3b8; font-weight:700; text-transform:uppercase;">Total Fees</div>
              <div style="font-size:1.45rem; font-weight:800; color:#3b20a6;">${course.fees}</div>
            </div>
            <button class="btn btn-hero-primary btn-enroll-now" style="font-size:0.85rem; padding:0.6rem 1.25rem;">Enroll Program</button>
          </div>
        `;
        courseDetailModal.classList.add("active");
        if (window.lucide) {
          window.lucide.createIcons();
        }

        // Bind Enroll Program action
        const enrollBtn = courseModalContent.querySelector(".btn-enroll-now");
        if (enrollBtn) {
          enrollBtn.addEventListener("click", () => {
            closeCourseModal();
            showToast(`Enrollment request for ${course.title} sent successfully!`, "success");
          });
        }
      }
    });
  });

  // --- ADMISSION INQUIRY FORM ---
  const inquiryForm = document.getElementById("public-inquiry-form");
  if (inquiryForm) {
    inquiryForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Inquiry submitted successfully! Admissions team will contact you soon.", "success");
      inquiryForm.reset();
    });
  }

  // --- LIVE DEMO ACTION ---
  const demoBtn = document.getElementById("btn-demo-trigger");
  if (demoBtn) {
    demoBtn.addEventListener("click", () => {
      showToast("Accessing Zoom Meeting room. Connecting audio...", "info");
      setTimeout(() => {
        window.open("https://zoom.us", "_blank");
      }, 1000);
    });
  }

  const joinBtn = document.querySelector(".btn-join-meeting");
  if (joinBtn) {
    joinBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("Connecting to live whiteboard session...", "success");
      setTimeout(() => {
        window.open("https://zoom.us", "_blank");
      }, 1000);
    });
  }

  // --- SMOOTH SCROLLING NAV HIGHLIGHTS ---
  const sections = document.querySelectorAll("section[id]");
  window.addEventListener("scroll", () => {
    const scrollY = window.pageYOffset;
    
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute("id");
      
      const link = document.querySelector(`.nav-links a[href*=${sectionId}]`);
      if (link) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      }
    });
  });

  // --- TOAST NOTIFICATION SYSTEM ---
  function showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let iconName = "info";
    if (type === "success") iconName = "check-circle";
    if (type === "error") iconName = "alert-triangle";
    
    toast.innerHTML = `
      <i data-lucide="${iconName}"></i>
      <span>${message}</span>
    `;
    
    container.appendChild(toast);
    if (window.lucide) {
      window.lucide.createIcons();
    }
    
    // Animate out
    setTimeout(() => {
      toast.style.animation = "slideIn 0.3s ease reverse forwards";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
});
