/* Psychology Sphere - Client Interactions & Mock Portals */

document.addEventListener("DOMContentLoaded", () => {
  let loggedInUser = null;

  function generateUUID() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Initialize Database Rendering on Startup
  renderMainWebsite();
  initDatabaseManager();

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
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value;
      const role = document.getElementById("login-role").value;
      
      // Store user session details
      loggedInUser = { email: email, role: role };
      
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
      loggedInUser = null;
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
    
    if (tabId === "admin-db") {
      renderDatabaseTable(activeDbTable);
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
    addCourseForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("ac-title").value;
      const duration = document.getElementById("ac-duration").value;
      const fees = document.getElementById("ac-fees").value;
      const faculty = document.getElementById("ac-faculty").value;

      const newCourse = {
        id: Date.now().toString(),
        title: title,
        description: `Complete study program in ${title} assigned under our expert guidance.`,
        duration: duration,
        fees: fees,
        faculty: faculty,
        image: '' // default placeholder
      };
      
      await window.AppDB.saveCourse(newCourse);
      await renderMainWebsite();

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
      btn.onclick = null;
      btn.onclick = async () => {
        if (confirm("Are you sure you want to remove this course and all associated enrollments?")) {
          const courseId = btn.getAttribute("data-id");
          await window.AppDB.deleteCourse(courseId);
          await renderMainWebsite();
          showToast("Course record successfully deleted from database.", "success");
        }
      };
    });
  }


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
  const courseDetailModal = document.getElementById("course-detail-modal");
  const courseModalClose = document.getElementById("course-modal-close");
  const courseModalContent = document.getElementById("course-modal-content");

  const closeCourseModal = () => {
    if (courseDetailModal) courseDetailModal.classList.remove("active");
  };

  if (courseModalClose) {
    courseModalClose.addEventListener("click", closeCourseModal);
  }

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

  // --- DATABASE & RENDERING INTEGRATION LOGIC ---
  async function renderMainWebsite() {
    // 1. Render Hero Image
    const heroImgEl = document.getElementById("hero-student-image");
    if (heroImgEl) {
      const assets = await window.AppDB.getAssets();
      const heroLink = assets.hero_student_image;
      heroImgEl.src = window.AppDB.getGoogleDriveDirectLink(heroLink);
    }

    // 2. Render Courses Grid
    const coursesGrid = document.getElementById("home-courses-grid");
    if (coursesGrid) {
      coursesGrid.innerHTML = "";
      const courses = await window.AppDB.getCourses();
      courses.forEach(course => {
        const card = document.createElement("div");
        card.className = "course-card-premium";
        card.setAttribute("data-course-id", course.id);
        
        const directLink = window.AppDB.getGoogleDriveDirectLink(course.image);
        const feeFormatted = isNaN(Number(course.fees)) ? course.fees : `₹ ${Number(course.fees).toLocaleString("en-IN")}`;
        
        card.innerHTML = `
          <div class="course-card-image-box">
            <img src="${directLink}" alt="${course.title}" onerror="this.src='images/course_ugc_net.png';">
          </div>
          <div class="course-card-body-content">
            <h4>${course.title}</h4>
            <p class="description-text">${course.description}</p>
            <div class="course-card-footer-box">
              <span class="course-card-duration-text">Duration: <strong>${course.duration}</strong></span>
              <span class="course-card-price-value">${feeFormatted}</span>
            </div>
          </div>
        `;
        coursesGrid.appendChild(card);
      });
      bindCourseDetailsClicks();
    }

    // 3. Render Faculty Grid
    const facultyGrid = document.getElementById("home-faculty-grid");
    if (facultyGrid) {
      facultyGrid.innerHTML = "";
      const facultyList = await window.AppDB.getFaculty();
      facultyList.forEach(faculty => {
        const card = document.createElement("div");
        card.className = "card text-center faculty-card-rewrite";
        
        const hasPhoto = faculty.image && faculty.image.trim() !== "";
        const directPhotoLink = hasPhoto ? window.AppDB.getGoogleDriveDirectLink(faculty.image) : "";
        
        card.innerHTML = `
          ${hasPhoto 
            ? `<div class="faculty-avatar-rewrite" style="overflow:hidden; background:transparent; border:1px solid var(--border-color); padding:0;"><img src="${directPhotoLink}" style="width:100%; height:100%; object-fit:cover;" onerror="this.parentElement.innerHTML='${faculty.avatar}';"></div>` 
            : `<div class="faculty-avatar-rewrite">${faculty.avatar}</div>`}
          <h3 style="font-size:1.25rem; margin-bottom:0.25rem;">${faculty.name}</h3>
          <p class="subtitle" style="font-size:0.75rem; font-weight:700; margin-bottom:1rem;">${faculty.role}</p>
          <p style="font-size:0.875rem; color:var(--text-secondary); line-height:1.5;">${faculty.specialization}</p>
          <div class="faculty-socials">
            <a href="#"><i data-lucide="linkedin"></i></a>
            <a href="#"><i data-lucide="mail"></i></a>
          </div>
        `;
        facultyGrid.appendChild(card);
      });
    }

    // 4. Render Admin Manage Courses Table
    const coursesTableBody = document.querySelector("#admin-courses-table tbody");
    if (coursesTableBody) {
      coursesTableBody.innerHTML = "";
      const courses = await window.AppDB.getCourses();
      courses.forEach(course => {
        const row = document.createElement("tr");
        const feeFormatted = isNaN(Number(course.fees)) ? course.fees : `₹ ${Number(course.fees).toLocaleString("en-IN")}`;
        
        row.innerHTML = `
          <td style="font-weight:600;">${course.title}</td>
          <td>${course.duration}</td>
          <td>${feeFormatted}</td>
          <td>${course.faculty}</td>
          <td><button class="btn btn-outline btn-sm btn-delete-course-mock" data-id="${course.id}" style="border-color:#ef4444; color:#ef4444; padding:0.25rem 0.5rem;"><i data-lucide="trash-2" style="width:16px;"></i></button></td>
        `;
        coursesTableBody.appendChild(row);
      });
      bindDeleteCourseMockButtons();
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function bindCourseDetailsClicks() {
    document.querySelectorAll(".course-card-premium").forEach(card => {
      card.addEventListener("click", async () => {
        const courseId = card.getAttribute("data-course-id");
        const courses = await window.AppDB.getCourses();
        const course = courses.find(c => c.id === courseId);
        
        if (course && courseDetailModal && courseModalContent) {
          const feeFormatted = isNaN(Number(course.fees)) ? course.fees : `₹ ${Number(course.fees).toLocaleString("en-IN")}`;
          
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
                <div style="font-size:1.45rem; font-weight:800; color:#3b20a6;">${feeFormatted}</div>
              </div>
              <button class="btn btn-hero-primary btn-enroll-now" style="font-size:0.85rem; padding:0.6rem 1.25rem;">Enroll Program</button>
            </div>
          `;
          courseDetailModal.classList.add("active");
          if (window.lucide) {
            window.lucide.createIcons();
          }

          const enrollBtn = courseModalContent.querySelector(".btn-enroll-now");
          if (enrollBtn) {
            enrollBtn.addEventListener("click", async () => {
              if (!loggedInUser || loggedInUser.role !== "student") {
                showToast("Please login as a Student to enroll in this course!", "error");
                openLoginModal();
                return;
              }

              try {
                // Get or create student profile in profiles table
                let studentProfile = await window.AppDB.getProfileByEmail(loggedInUser.email);
                if (!studentProfile) {
                  studentProfile = await window.AppDB.createProfile({
                    id: generateUUID(),
                    full_name: loggedInUser.email.split("@")[0].toUpperCase(),
                    email: loggedInUser.email,
                    role: "student"
                  });
                }
                
                if (studentProfile) {
                  await window.AppDB.enrollInCourse(course.id, studentProfile.id);
                  showToast(`Successfully enrolled in ${course.title}!`, "success");
                } else {
                  showToast("Failed to create student profile. Please try again.", "error");
                }
              } catch (err) {
                console.error("Enrollment failed:", err);
                showToast("Failed to complete course enrollment. Please try again.", "error");
              }
              closeCourseModal();
            });
          }
        }
      });
    });
  }

  // --- DATABASE MANAGER ---
  let activeDbTable = "courses";
  
  function initDatabaseManager() {
    // Bind DB sub-tab buttons
    document.querySelectorAll(".db-tab-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        document.querySelectorAll(".db-tab-btn").forEach(b => {
          b.classList.remove("active");
          b.style.color = "var(--text-secondary)";
          b.style.fontWeight = "500";
          b.style.borderColor = "transparent";
        });
        
        btn.classList.add("active");
        btn.style.color = "var(--primary-color)";
        btn.style.fontWeight = "700";
        btn.style.borderColor = "var(--primary-color)";
        
        activeDbTable = btn.getAttribute("data-table");
        await renderDatabaseTable(activeDbTable);
      });
    });

    // Bind DB Reset Button
    const dbResetBtn = document.getElementById("btn-db-reset");
    if (dbResetBtn) {
      dbResetBtn.addEventListener("click", async () => {
        if (confirm("Are you sure you want to reset the database to defaults? All custom Google Drive links will be restored to local assets.")) {
          await window.AppDB.reset();
          await renderMainWebsite();
          await renderDatabaseTable(activeDbTable);
          showToast("Database successfully restored to defaults.", "info");
        }
      });
    }
  }

  async function renderDatabaseTable(tableName) {
    const explorer = document.getElementById("db-table-explorer");
    if (!explorer) return;
    
    explorer.innerHTML = "";
    
    if (tableName === "courses") {
      const courses = await window.AppDB.getCourses();
      courses.forEach(course => {
        const card = document.createElement("div");
        card.className = "db-row-card";
        
        const directLink = window.AppDB.getGoogleDriveDirectLink(course.image);
        
        card.innerHTML = `
          <div class="db-preview-container">
            ${course.image ? `<img src="${directLink}" class="db-preview-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
            <div class="db-preview-placeholder" style="${course.image ? 'display:none;' : 'display:flex;'}">
              <i data-lucide="image" style="width:24px; height:24px;"></i>
              <span style="margin-top:0.25rem;">No Preview</span>
            </div>
          </div>
          <div class="db-row-details">
            <div class="db-row-title">${course.title}</div>
            <div class="db-row-meta">ID: <code>${course.id}</code> | Mentor: ${course.faculty} | Duration: ${course.duration}</div>
            <div class="db-input-group">
              <input type="text" class="db-link-input" placeholder="Paste Google Drive image link" value="${course.image || ''}">
              <button class="db-save-btn" data-id="${course.id}"><i data-lucide="save" style="width:14px; height:14px;"></i> Save</button>
            </div>
          </div>
        `;
        
        explorer.appendChild(card);
      });
    } else if (tableName === "faculty") {
      const facultyList = await window.AppDB.getFaculty();
      facultyList.forEach(faculty => {
        const card = document.createElement("div");
        card.className = "db-row-card";
        
        const directLink = window.AppDB.getGoogleDriveDirectLink(faculty.image);
        
        card.innerHTML = `
          <div class="db-preview-container">
            ${faculty.image ? `<img src="${directLink}" class="db-preview-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
            <div class="db-preview-placeholder" style="${faculty.image ? 'display:none;' : 'display:flex;'}">
              <i data-lucide="user" style="width:24px; height:24px;"></i>
              <span style="margin-top:0.25rem;">Fallback: ${faculty.avatar}</span>
            </div>
          </div>
          <div class="db-row-details">
            <div class="db-row-title">${faculty.name}</div>
            <div class="db-row-meta">ID: <code>${faculty.id}</code> | Role: ${faculty.role}</div>
            <div class="db-input-group">
              <input type="text" class="db-link-input" placeholder="Paste Google Drive image link" value="${faculty.image || ''}">
              <button class="db-save-btn" data-id="${faculty.id}"><i data-lucide="save" style="width:14px; height:14px;"></i> Save</button>
            </div>
          </div>
        `;
        
        explorer.appendChild(card);
      });
    } else if (tableName === "assets") {
      const assets = await window.AppDB.getAssets();
      Object.keys(assets).forEach(key => {
        const val = assets[key];
        const card = document.createElement("div");
        card.className = "db-row-card";
        
        const directLink = window.AppDB.getGoogleDriveDirectLink(val);
        const displayLabel = key === 'hero_student_image' ? 'Hero Section Student Illustration' : key;
        
        card.innerHTML = `
          <div class="db-preview-container">
            ${val ? `<img src="${directLink}" class="db-preview-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
            <div class="db-preview-placeholder" style="${val ? 'display:none;' : 'display:flex;'}">
              <i data-lucide="image" style="width:24px; height:24px;"></i>
              <span style="margin-top:0.25rem;">No Preview</span>
            </div>
          </div>
          <div class="db-row-details">
            <div class="db-row-title">${displayLabel}</div>
            <div class="db-row-meta">Key: <code>${key}</code></div>
            <div class="db-input-group">
              <input type="text" class="db-link-input" placeholder="Paste Google Drive image link" value="${val || ''}">
              <button class="db-save-btn" data-key="${key}"><i data-lucide="save" style="width:14px; height:14px;"></i> Save</button>
            </div>
          </div>
        `;
        
        explorer.appendChild(card);
      });
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
    
    // Bind Save buttons
    explorer.querySelectorAll(".db-save-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const input = btn.previousElementSibling;
        const linkVal = input.value.trim();
        
        if (tableName === "courses") {
          const id = btn.getAttribute("data-id");
          const courses = await window.AppDB.getCourses();
          const course = courses.find(c => c.id === id);
          if (course) {
            course.image = linkVal;
            await window.AppDB.saveCourse(course);
            showToast(`Course image for "${course.title}" updated in database!`, "success");
          }
        } else if (tableName === "faculty") {
          const id = btn.getAttribute("data-id");
          const facultyList = await window.AppDB.getFaculty();
          const faculty = facultyList.find(f => f.id === id);
          if (faculty) {
            faculty.image = linkVal;
            await window.AppDB.saveFaculty(faculty);
            showToast(`Faculty photo for "${faculty.name}" updated in database!`, "success");
          }
        } else if (tableName === "assets") {
          const key = btn.getAttribute("data-key");
          await window.AppDB.saveAsset(key, linkVal);
          showToast(`Asset "${key}" updated in database!`, "success");
        }
        
        // Refresh site dynamic UI
        await renderMainWebsite();
        // Refresh explorer view to show updated previews
        await renderDatabaseTable(tableName);
      });
    });
  }
});
