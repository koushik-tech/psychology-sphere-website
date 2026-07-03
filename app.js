/* Psychology Sphere - Client Interactions & Mock Portals */

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

  // --- PUBLIC LOGIN MODAL ---
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

  // Automatically open login modal if requested in query parameters
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("openLogin") === "true") {
    openLoginModal();
  }

  // Quick Login Pre-population and Submit Trigger
  document.querySelectorAll(".btn-quick-login").forEach(btn => {
    btn.addEventListener("click", () => {
      const role = btn.getAttribute("data-role");
      const email = btn.getAttribute("data-email");
      
      const emailInput = document.getElementById("login-email");
      const passwordInput = document.getElementById("login-password");
      const roleSelect = document.getElementById("login-role");
      
      if (emailInput && passwordInput && roleSelect) {
        emailInput.value = email;
        passwordInput.value = "demo1234";
        roleSelect.value = role;
        
        // Auto submit
        document.getElementById("login-form").dispatchEvent(new Event("submit"));
      }
    });
  });

  // --- LOGIN LOGIC & DASHBOARD MOUNTING ---
  const publicWebsite = document.getElementById("public-website");
  const portalDashboard = document.getElementById("portal-dashboard");
  const studentMenu = document.getElementById("student-menu");
  const facultyMenu = document.getElementById("faculty-menu");
  const adminMenu = document.getElementById("admin-menu");
  
  const sidebarAvatar = document.getElementById("sidebar-avatar-char");
  const sidebarUsername = document.getElementById("sidebar-username-txt");
  const sidebarUserrole = document.getElementById("sidebar-userrole-txt");
  const dashboardTabTitle = document.getElementById("dashboard-tab-title");

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value;
      const role = document.getElementById("login-role").value;
      
      // Determine Display name
      let displayName = "Student User";
      if (role === "student") displayName = email.split("@")[0].toUpperCase();
      if (role === "faculty") displayName = "Dr. Sarah Jenkins";
      if (role === "admin") displayName = "System Administrator";

      // Hide public site and show dashboard container
      if (publicWebsite && portalDashboard) {
        publicWebsite.style.display = "none";
        portalDashboard.style.display = "block";
        window.scrollTo(0, 0);
      }

      // Hide all sidebar menus and enable the correct one
      if (studentMenu) studentMenu.style.display = "none";
      if (facultyMenu) facultyMenu.style.display = "none";
      if (adminMenu) adminMenu.style.display = "none";

      // Reset active tabs in sidebar links
      document.querySelectorAll(".sidebar-menu-rewrite a").forEach(l => l.classList.remove("active"));

      if (role === "student") {
        if (studentMenu) studentMenu.style.display = "block";
        const firstLink = studentMenu.querySelector("a");
        if (firstLink) firstLink.classList.add("active");
        
        if (sidebarAvatar) sidebarAvatar.textContent = displayName.charAt(0);
        if (sidebarUsername) sidebarUsername.textContent = displayName;
        if (sidebarUserrole) sidebarUserrole.textContent = "Student Scholar";
        
        switchDashboardTab("student-overview", "Dashboard Overview");
      } else if (role === "faculty") {
        if (facultyMenu) facultyMenu.style.display = "block";
        const firstLink = facultyMenu.querySelector("a");
        if (firstLink) firstLink.classList.add("active");
        
        if (sidebarAvatar) sidebarAvatar.textContent = "SJ";
        if (sidebarUsername) sidebarUsername.textContent = "Dr. Sarah Jenkins";
        if (sidebarUserrole) sidebarUserrole.textContent = "Faculty Mentor";
        
        switchDashboardTab("faculty-classes", "Class Schedules");
      } else if (role === "admin") {
        if (adminMenu) adminMenu.style.display = "block";
        const firstLink = adminMenu.querySelector("a");
        if (firstLink) firstLink.classList.add("active");
        
        if (sidebarAvatar) sidebarAvatar.textContent = "A";
        if (sidebarUsername) sidebarUsername.textContent = "System Admin";
        if (sidebarUserrole) sidebarUserrole.textContent = "Office Coordinator";
        
        switchDashboardTab("admin-analytics", "Analytics Desk");
      }

      closeLoginModal();
      showToast(`Welcome back, ${displayName}! Logged in successfully.`, "success");
      loginForm.reset();
    });
  }

  // --- LOGOUT LOGIC ---
  const logoutBtn = document.getElementById("btn-logout-trigger");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (publicWebsite && portalDashboard) {
        portalDashboard.style.display = "none";
        publicWebsite.style.display = "block";
        window.location.hash = "#home";
      }
      showToast("Logged out successfully.", "info");
    });
  }

  // --- DASHBOARD SIDEBAR TAB NAVIGATION ---
  document.querySelectorAll(".sidebar-menu-rewrite a").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const tabId = link.getAttribute("data-tab");
      const tabTitle = link.textContent.trim();
      
      // Update active state in sidebar links
      document.querySelectorAll(".sidebar-menu-rewrite a").forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      
      switchDashboardTab(tabId, tabTitle);
    });
  });

  function switchDashboardTab(tabId, title) {
    if (dashboardTabTitle) {
      dashboardTabTitle.textContent = title;
    }
    
    // Hide all dashboard tab views
    document.querySelectorAll(".dashboard-tab-view").forEach(tab => {
      tab.style.display = "none";
    });
    
    // Show current tab view
    const targetTab = document.getElementById(`${tabId}-tab`);
    if (targetTab) {
      targetTab.style.display = "block";
    }
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Close modals when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === loginModal) closeLoginModal();
  });


  // --- STUDENT MOCK INVOICE UPI PAYMENT ---
  const checkoutModal = document.getElementById("checkout-modal");
  const checkoutClose = document.getElementById("checkout-modal-close");
  const payTriggerBtns = document.querySelectorAll(".btn-pay-fees-mock");

  const openCheckoutModal = (e) => {
    if (e) e.preventDefault();
    if (checkoutModal) checkoutModal.classList.add("active");
  };

  const closeCheckoutModal = () => {
    if (checkoutModal) checkoutModal.classList.remove("active");
  };

  payTriggerBtns.forEach(btn => btn.addEventListener("click", openCheckoutModal));
  if (checkoutClose) checkoutClose.addEventListener("click", closeCheckoutModal);

  const mockPayBtn = document.getElementById("btn-mock-pay");
  if (mockPayBtn) {
    mockPayBtn.addEventListener("click", () => {
      showToast("UPI Payment transaction verified! Receipt REC-492984 generated.", "success");
      closeCheckoutModal();
      
      // Dynamically remove the unpaid row and update pending balance on dashboard
      const tableRow = document.querySelector(".btn-pay-fees-mock").closest("tr");
      if (tableRow) {
        tableRow.innerHTML = `
          <td style="font-weight:600;">MA Psychology Tuition Installment</td>
          <td>2026-07-01</td>
          <td>₹ 2,500</td>
          <td><span class="badge badge-success">Paid</span></td>
          <td><button class="btn btn-outline btn-sm" style="border-radius:20px; font-size:0.75rem;"><i data-lucide="download" style="width:12px;"></i> Receipt</button></td>
        `;
        if (window.lucide) window.lucide.createIcons();
      }

      // Update metrics
      const metricValues = document.querySelectorAll(".metric-value");
      if (metricValues[2]) {
        metricValues[2].textContent = "₹ 0";
        metricValues[2].style.color = "#059669";
      }
    });
  }

  // --- FACULTY MOCK ATTENDANCE LOADING & REGISTERING ---
  const loadFacultyAttBtn = document.getElementById("btn-load-faculty-att");
  const facultyAttTableWrapper = document.getElementById("faculty-att-table-wrapper");
  if (loadFacultyAttBtn && facultyAttTableWrapper) {
    loadFacultyAttBtn.addEventListener("click", () => {
      facultyAttTableWrapper.style.display = "block";
      showToast("Class list registry loaded successfully.", "info");
    });
  }

  const saveFacultyAttBtn = document.getElementById("btn-save-faculty-att");
  if (saveFacultyAttBtn) {
    saveFacultyAttBtn.addEventListener("click", () => {
      showToast("Attendance logs successfully synchronized with Cloud Server!", "success");
    });
  }


  // --- ADMIN COURSE MANAGEMENT ---
  const adminAddCourseModal = document.getElementById("admin-add-course-modal");
  const adminAddCourseClose = document.getElementById("admin-add-course-close");
  const adminAddCourseTrigger = document.getElementById("btn-admin-add-course");

  const openAdminAddModal = () => {
    if (adminAddCourseModal) adminAddCourseModal.classList.add("active");
  };

  const closeAdminAddModal = () => {
    if (adminAddCourseModal) adminAddCourseModal.classList.remove("active");
  };

  if (adminAddCourseTrigger) adminAddCourseTrigger.addEventListener("click", openAdminAddModal);
  if (adminAddCourseClose) adminAddCourseClose.addEventListener("click", closeAdminAddModal);

  const addCourseForm = document.getElementById("admin-add-course-form");
  if (addCourseForm) {
    addCourseForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("ac-title").value;
      const duration = document.getElementById("ac-duration").value;
      const fees = document.getElementById("ac-fees").value;
      const faculty = document.getElementById("ac-faculty").value;

      // Add row to mock table
      const coursesTableBody = document.querySelector("#admin-courses-table tbody");
      if (coursesTableBody) {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td style="font-weight:600;">${title}</td>
          <td>${duration}</td>
          <td>₹ ${Number(fees).toLocaleString("en-IN")}</td>
          <td>${faculty}</td>
          <td><button class="btn btn-outline btn-sm btn-delete-course-mock" style="border-color:#ef4444; color:#ef4444; padding:0.25rem 0.5rem;"><i data-lucide="trash-2" style="width:16px;"></i></button></td>
        `;
        coursesTableBody.appendChild(row);
        bindDeleteCourseMockButtons();
        if (window.lucide) window.lucide.createIcons();
      }

      // Update analytics stats
      const studentsVal = document.getElementById("admin-students-val");
      if (studentsVal) {
        studentsVal.textContent = parseInt(studentsVal.textContent) + 15; // mock increase
      }

      showToast(`New course offering "${title}" added successfully!`, "success");
      closeAdminAddModal();
      addCourseForm.reset();
    });
  }

  function bindDeleteCourseMockButtons() {
    document.querySelectorAll(".btn-delete-course-mock").forEach(btn => {
      // Avoid stacking events
      btn.onclick = null;
      btn.onclick = () => {
        if (confirm("Are you sure you want to remove this course and all associated enrollments?")) {
          btn.closest("tr").remove();
          showToast("Course record successfully deleted from database.", "success");
        }
      };
    });
  }
  bindDeleteCourseMockButtons();


  // --- ADMIN NOTICE BROADCASTING ---
  const adminNoticeForm = document.getElementById("admin-notice-form");
  const adminNoticesFeed = document.getElementById("admin-notices-feed");
  if (adminNoticeForm) {
    adminNoticeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("nt-title").value;
      const target = document.getElementById("nt-role").value.toUpperCase();
      const content = document.getElementById("nt-content").value;

      if (adminNoticesFeed) {
        const notice = document.createElement("div");
        notice.style.cssText = "background:#f8fafc; border:1px solid #e2e8f0; padding:1rem; border-radius:8px; margin-top:0.75rem;";
        notice.innerHTML = `
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
            <strong style="font-size:0.95rem;">${title}</strong>
            <span class="badge badge-primary">${target}</span>
          </div>
          <p style="font-size:0.8rem; color:var(--text-secondary); margin:0;">${content}</p>
        `;
        adminNoticesFeed.insertBefore(notice, adminNoticesFeed.firstChild);
      }

      showToast("Notice broadcasted successfully to student/faculty channels!", "success");
      adminNoticeForm.reset();
    });
  }


  // --- PUBLIC COURSE DETAILS MODAL POPUPS ---
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
