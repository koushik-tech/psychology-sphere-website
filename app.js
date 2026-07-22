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

  // Update connection status badge based on Supabase database live connectivity
  const dbBadge = document.getElementById("db-connection-badge");
  if (dbBadge) {
    if (window.AppDB.isLive()) {
      dbBadge.textContent = "Live Database";
      dbBadge.style.backgroundColor = "#10b981";
      dbBadge.style.color = "#ffffff";
    } else {
      dbBadge.textContent = "Mock Local Storage";
      dbBadge.style.backgroundColor = "#f59e0b";
      dbBadge.style.color = "#ffffff";
    }
  }

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

      if (role === "student") {
        try {
          // Ensure student profile exists in profiles table
          let studentProfile = await window.AppDB.getProfileByEmail(email);
          if (!studentProfile) {
            await window.AppDB.createProfile({
              id: generateUUID(),
              full_name: email.split("@")[0].toUpperCase(),
              email: email,
              role: "student"
            });
          }
        } catch (err) {
          console.error("Failed to check/create student profile:", err);
        }
      }
      
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

    if (tabId === "student-attendance") {
      renderStudentAttendance();
    }

    if (tabId === "student-courses") {
      renderStudentCourses();
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

  // --- FACULTY LIVE ATTENDANCE LOADING & REGISTERING ---
  const loadFacultyAttBtn = document.getElementById("btn-load-faculty-att");
  const facultyAttTableWrapper = document.getElementById("faculty-att-table-wrapper");
  if (loadFacultyAttBtn && facultyAttTableWrapper) {
    loadFacultyAttBtn.addEventListener("click", async () => {
      const programSel = document.getElementById("att-program-sel");
      if (!programSel) return;
      
      const programTitle = programSel.options[programSel.selectedIndex].text.trim();
      
      // Resolve the database course ID for this program
      const courses = await window.AppDB.getCourses();
      const course = courses.find(c => c.title.toLowerCase() === programTitle.toLowerCase());
      
      if (!course) {
        showToast("Selected program does not exist in courses table.", "error");
        return;
      }
      
      // Store course ID on the wrapper element for saving later
      facultyAttTableWrapper.setAttribute("data-course-id", course.id);
      
      const tbody = facultyAttTableWrapper.querySelector("tbody");
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Loading class list...</td></tr>`;
        facultyAttTableWrapper.style.display = "block";
        
        try {
          const students = await window.AppDB.getEnrolledStudents(course.id);
          if (students.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-secondary); padding: 1.5rem;">No students enrolled in this program yet.</td></tr>`;
            return;
          }
          
          tbody.innerHTML = "";
          students.forEach(student => {
            const row = document.createElement("tr");
            row.setAttribute("data-student-id", student.id);
            row.innerHTML = `
              <td style="font-weight:600;">${student.name}</td>
              <td>${student.email}</td>
              <td><input type="radio" name="att-${student.id}" value="present" checked></td>
              <td><input type="radio" name="att-${student.id}" value="absent"></td>
              <td><input type="radio" name="att-${student.id}" value="late"></td>
            `;
            tbody.appendChild(row);
          });
          showToast(`Loaded ${students.length} enrolled students.`, "success");
        } catch (e) {
          console.error("Failed to load class list:", e);
          tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#ef4444;">Error loading class list from database.</td></tr>`;
        }
      }
    });
  }

  const saveFacultyAttBtn = document.getElementById("btn-save-faculty-att");
  if (saveFacultyAttBtn) {
    saveFacultyAttBtn.addEventListener("click", async () => {
      const dateInput = document.getElementById("att-date-sel");
      if (!dateInput || !dateInput.value) {
        showToast("Please select a date to mark attendance.", "error");
        return;
      }
      
      const dateStr = dateInput.value;
      const courseId = facultyAttTableWrapper.getAttribute("data-course-id");
      
      if (!courseId) {
        showToast("No active class list loaded to save.", "error");
        return;
      }
      
      const rows = facultyAttTableWrapper.querySelectorAll("tbody tr[data-student-id]");
      if (rows.length === 0) {
        showToast("No student records to save.", "error");
        return;
      }
      
      const records = [];
      rows.forEach(row => {
        const studentId = row.getAttribute("data-student-id");
        const statusVal = row.querySelector(`input[name="att-${studentId}"]:checked`).value;
        records.push({
          student_id: studentId,
          course_id: parseInt(courseId),
          date: dateStr,
          status: statusVal,
          marked_by: null
        });
      });
      
      try {
        await window.AppDB.saveAttendanceRecords(records);
        showToast(`Attendance synchronized successfully for ${dateStr}!`, "success");
      } catch (err) {
        console.error("Failed to save attendance:", err);
        const detailMsg = err && err.message ? err.message : "Database connection error";
        showToast(`Failed to synchronize attendance: ${detailMsg}`, "error");
      }
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
      const onlineTimings = document.getElementById("ac-online-timings").value.trim() || "Mon, Wed, Fri 8 AM";
      const offlineTimings = document.getElementById("ac-offline-timings").value.trim() || "Mon 2 PM, Wed 5 PM, Sat 7 PM";

      const courseId = Date.now().toString();
      const newCourse = {
        id: courseId,
        title: title,
        description: `Complete study program in ${title} assigned under our expert guidance.`,
        duration: duration,
        fees: fees,
        faculty: faculty,
        image: '', // default placeholder
        batches: [
          { id: courseId + '_online', type: 'Online', name: 'Batch 1', timings: onlineTimings },
          { id: courseId + '_offline', type: 'Offline', name: 'Batch 2', timings: offlineTimings },
          { id: courseId + '_custom', type: 'Custom', name: 'Custom', timings: 'Flexible Timings' }
        ]
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
  const courseModalContent = document.getElementById("course-modal-content");

  const closeCourseModal = () => {
    if (courseDetailModal) courseDetailModal.classList.remove("active");
  };

  if (courseDetailModal) {
    courseDetailModal.addEventListener("click", (e) => {
      if (e.target.closest("#course-modal-close") || e.target === courseDetailModal) {
        closeCourseModal();
      }
    });
  }

  // --- ADMISSION INQUIRY FORM ---
  const inquiryForm = document.getElementById("public-inquiry-form");
  if (inquiryForm) {
    inquiryForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("inq-name").value.trim();
      const email = document.getElementById("inq-email").value.trim();
      const phone = document.getElementById("inq-phone").value.trim();
      
      const courseSelect = document.getElementById("inq-course");
      const courseTitle = courseSelect.options[courseSelect.selectedIndex].text.trim();

      try {
        await window.AppDB.saveInquiry({
          name: name,
          email: email,
          phone: phone,
          courseInterest: courseTitle
        });
        showToast("Your admission inquiry has been submitted successfully!", "success");
      } catch (err) {
        console.error("Admission inquiry submission failed:", err);
        showToast("Failed to submit inquiry. Please try again.", "error");
      }

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
      bindCourseDetailsClicks(courses);
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

    // Dynamic Program Select for Mark Attendance
    const attProgramSel = document.getElementById("att-program-sel");
    if (attProgramSel) {
      const courses = await window.AppDB.getCourses();
      attProgramSel.innerHTML = courses.map(c => `<option value="${c.id}">${c.title}</option>`).join("");
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  async function renderStudentAttendance() {
    const tbody = document.querySelector("#student-attendance-tab tbody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Loading attendance logs...</td></tr>`;

    if (!loggedInUser || loggedInUser.role !== "student") return;

    try {
      const studentProfile = await window.AppDB.getProfileByEmail(loggedInUser.email);
      if (!studentProfile) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-secondary);">No student profile found. Please try again.</td></tr>`;
        return;
      }

      const logs = await window.AppDB.getStudentAttendance(studentProfile.id);
      if (logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-secondary);">No attendance records found in the database.</td></tr>`;
        return;
      }

      tbody.innerHTML = "";
      logs.forEach(log => {
        const row = document.createElement("tr");
        const statusClean = (log.status || "present").toLowerCase();
        const badgeClass = statusClean === "present" ? "badge-success" : 
                            (statusClean === "late" ? "badge-warning" : "badge-danger");
        const statusFormatted = statusClean.charAt(0).toUpperCase() + statusClean.slice(1);
        
        row.innerHTML = `
          <td>${log.date}</td>
          <td style="font-weight:600;">${log.courseTitle}</td>
          <td><span class="badge ${badgeClass}">${statusFormatted}</span></td>
        `;
        tbody.appendChild(row);
      });
    } catch (e) {
      console.error("Failed to render student attendance:", e);
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#ef4444;">Error loading attendance logs from database.</td></tr>`;
    }
  }

  async function renderStudentCourses() {
    const grid = document.getElementById("student-enrolled-courses-grid");
    const select = document.getElementById("student-enroll-course-sel");
    const batchSelect = document.getElementById("student-enroll-batch-sel");
    const batchGroup = document.getElementById("student-enroll-batch-group");
    if (!grid || !select) return;

    grid.innerHTML = `<div style="grid-column: span 2; text-align:center; padding: 1rem;">Loading enrolled courses...</div>`;
    
    if (!loggedInUser || loggedInUser.role !== "student") return;

    try {
      // 1. Get student profile
      const studentProfile = await window.AppDB.getProfileByEmail(loggedInUser.email);
      if (!studentProfile) {
        grid.innerHTML = `<div style="grid-column: span 2; text-align:center; color:var(--text-secondary); padding: 1rem;">No student profile found. Please try again.</div>`;
        return;
      }

      // 2. Fetch all courses and enrollments
      const [allCourses, enrollments] = await Promise.all([
        window.AppDB.getCourses(),
        window.AppDB.getStudentEnrollments(studentProfile.id)
      ]);

      // 3. Render active enrolled courses
      if (enrollments.length === 0) {
        grid.innerHTML = `<div style="grid-column: span 2; text-align:center; color:var(--text-secondary); padding: 1.5rem; background: #f8fafc; border:1px solid var(--border-color); border-radius: 8px;">You are not enrolled in any programs yet. Select a course below to enroll.</div>`;
      } else {
        grid.innerHTML = "";
        enrollments.forEach(e => {
          const card = document.createElement("div");
          card.className = "card";
          
          let batchHtml = "";
          if (e.batch) {
            let badgeStyle = "background:#e0e7ff; color:#3730a3;"; // Online (indigo)
            if (e.batch.type.toLowerCase() === "offline") {
              badgeStyle = "background:#fee2e2; color:#991b1b;"; // Offline (red)
            } else if (e.batch.type.toLowerCase() === "custom") {
              badgeStyle = "background:#fef3c7; color:#92400e;"; // Custom (amber)
            }
            
            batchHtml = `
              <div style="margin-top:0.75rem; padding-top:0.75rem; border-top:1px solid var(--border-color); font-size:0.8rem;">
                <strong>Batch:</strong> <span class="badge" style="${badgeStyle} padding:2px 6px; font-size:0.75rem; border-radius:4px; font-weight:600; text-transform:uppercase;">${e.batch.type}</span>
                <span style="font-weight:600; color:var(--text-primary); margin-left:0.25rem;">${e.batch.name}</span>
                <div style="margin-top:0.35rem; font-size:0.75rem; color:#64748b; display:flex; align-items:center; gap:0.25rem;">
                  <i data-lucide="clock" style="width:12px; height:12px; flex-shrink:0;"></i> ${e.batch.timings}
                </div>
              </div>
            `;
          }

          card.innerHTML = `
            <span class="badge badge-primary" style="margin-bottom:0.75rem;">Active Program</span>
            <h3 style="font-size:1.15rem; margin-bottom:0.5rem;">${e.courseTitle}</h3>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.75rem;">Duration: ${e.courseDuration}</p>
            <div style="background:#f8fafc; border:1px solid var(--border-color); padding:0.75rem; border-radius:8px; font-size:0.8rem;">
              <strong>Status:</strong> <span style="font-weight:600; color:#3b20a6;">${e.status.charAt(0).toUpperCase() + e.status.slice(1)}</span>
            </div>
            ${batchHtml}
          `;
          grid.appendChild(card);
        });
      }

      // 4. Populate available courses dropdown (excluding already enrolled ones)
      const enrolledIds = enrollments.map(e => e.courseId.toString());
      const availableCourses = allCourses.filter(c => !enrolledIds.includes(c.id.toString()));

      const enrollBtn = document.getElementById("btn-student-enroll-now");
      if (availableCourses.length === 0) {
        select.innerHTML = `<option value="">No new programs available</option>`;
        if (batchSelect) {
          batchSelect.innerHTML = `<option value="">N/A</option>`;
          batchSelect.disabled = true;
        }
        if (enrollBtn) enrollBtn.disabled = true;
      } else {
        select.innerHTML = availableCourses.map(c => `<option value="${c.id}">${c.title}</option>`).join("");
        if (enrollBtn) enrollBtn.disabled = false;
        
        // Populate batch options dynamically
        const updateBatchDropdown = () => {
          const courseId = select.value;
          const course = availableCourses.find(c => c.id.toString() === courseId);
          if (course && course.batches && batchSelect) {
            batchSelect.innerHTML = course.batches.map(b => `<option value="${b.id}">[${b.type}] ${b.name} - ${b.timings}</option>`).join("");
            batchSelect.disabled = false;
            if (batchGroup) batchGroup.style.display = "block";
          } else if (batchSelect) {
            batchSelect.innerHTML = `<option value="">No slots available</option>`;
            batchSelect.disabled = true;
          }
        };
        
        select.onchange = updateBatchDropdown;
        updateBatchDropdown();
      }

      // 5. Bind Enroll button click (one-time setup if not already bound)
      if (enrollBtn && !enrollBtn.dataset.bound) {
        enrollBtn.dataset.bound = "true";
        enrollBtn.addEventListener("click", async () => {
          const courseId = select.value;
          const batchId = batchSelect ? batchSelect.value : null;
          if (!courseId) return;

          try {
            enrollBtn.disabled = true;
            enrollBtn.textContent = "Enrolling...";
            await window.AppDB.enrollInCourse(courseId, studentProfile.id, batchId);
            showToast("Successfully enrolled in the program!", "success");
            // Reload the view
            await renderStudentCourses();
          } catch (err) {
            console.error("Dashboard enrollment failed:", err);
            showToast("Failed to complete enrollment. Please try again.", "error");
          } finally {
            enrollBtn.disabled = false;
            enrollBtn.textContent = "Enroll Now";
          }
        });
      }

      if (window.lucide) {
        window.lucide.createIcons();
      }

    } catch (e) {
      console.error("Failed to render student courses:", e);
      grid.innerHTML = `<div style="grid-column: span 2; text-align:center; color:#ef4444; padding: 1rem;">Error loading courses from database.</div>`;
    }
  }

  function bindCourseDetailsClicks(courses) {
    if (!courses) return;
    document.querySelectorAll(".course-card-premium").forEach(card => {
      card.addEventListener("click", () => {
        const courseId = card.getAttribute("data-course-id");
        const course = courses.find(c => c.id === courseId);
        
        if (course && courseDetailModal && courseModalContent) {
          const feeFormatted = isNaN(Number(course.fees)) ? course.fees : `₹ ${Number(course.fees).toLocaleString("en-IN")}`;
          
          let batchesHtml = "";
          if (course.batches && course.batches.length > 0) {
            batchesHtml = `
              <h4 style="margin-bottom:0.75rem; color:#3b20a6; font-weight:700;">Select Learning Batch</h4>
              <div class="modal-batch-selection" style="display:flex; flex-direction:column; gap:0.75rem; margin-bottom:2rem; text-align:left;">
                ${course.batches.map((b, idx) => {
                  let iconName = "monitor";
                  if (b.type.toLowerCase() === "offline") iconName = "map-pin";
                  else if (b.type.toLowerCase() === "custom") iconName = "settings";
                  
                  return `
                    <label style="display:flex; align-items:center; gap:0.75rem; border:1px solid var(--border-color); padding:0.75rem 1rem; border-radius:8px; cursor:pointer; background:#f8fafc; font-size:0.875rem; transition: all 0.2s ease;">
                      <input type="radio" name="modal-batch-radio" value="${b.id}" ${idx === 0 ? 'checked' : ''} style="margin:0; accent-color:#3b20a6;">
                      <div style="display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:#e0e7ff; color:#3730a3; flex-shrink:0;">
                        <i data-lucide="${iconName}" style="width:14px; height:14px;"></i>
                      </div>
                      <div style="flex:1;">
                        <div style="font-weight:600; color:var(--text-primary); font-size:0.85rem;">[${b.type}] ${b.name}</div>
                        <div style="color:var(--text-secondary); font-size:0.75rem; margin-top:0.15rem;">${b.timings}</div>
                      </div>
                    </label>
                  `;
                }).join('')}
              </div>
            `;
          }

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

            ${batchesHtml}

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

              // Get selected batch ID
              const selectedRadio = courseModalContent.querySelector('input[name="modal-batch-radio"]:checked');
              const batchId = selectedRadio ? selectedRadio.value : null;

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
                  await window.AppDB.enrollInCourse(course.id, studentProfile.id, batchId);
                  showToast(`Successfully enrolled in ${course.title}!`, "success");
                  // Reload dashboard if visual
                  if (document.getElementById("portal-dashboard").style.display !== "none") {
                    await renderStudentCourses();
                  }
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
        
        let onlineTiming = "Mon, Wed, Fri 8 AM";
        let offlineTiming = "Mon 2 PM, Wed 5 PM, Sat 7 PM";
        if (course.batches) {
          const onlineB = course.batches.find(b => b.type === "Online");
          if (onlineB) onlineTiming = onlineB.timings;
          const offlineB = course.batches.find(b => b.type === "Offline");
          if (offlineB) offlineTiming = offlineB.timings;
        }

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
            
            <div style="margin-top:0.5rem; display:flex; flex-direction:column; gap:0.35rem; padding:0.5rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; margin-bottom:0.75rem;">
              <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.75rem;">
                <span style="font-weight:600; width:100px; color:#3730a3;">Online Batch:</span>
                <input type="text" class="db-batch-online-input" style="flex:1; padding:2px 6px; border:1px solid #cbd5e1; border-radius:4px; font-size:0.75rem;" value="${onlineTiming}">
              </div>
              <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.75rem;">
                <span style="font-weight:600; width:100px; color:#991b1b;">Offline Batch:</span>
                <input type="text" class="db-batch-offline-input" style="flex:1; padding:2px 6px; border:1px solid #cbd5e1; border-radius:4px; font-size:0.75rem;" value="${offlineTiming}">
              </div>
            </div>

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
            const cardEl = btn.closest(".db-row-card");
            const onlineInp = cardEl.querySelector(".db-batch-online-input");
            const offlineInp = cardEl.querySelector(".db-batch-offline-input");
            
            course.image = linkVal;
            
            // Save modified batch timings
            if (course.batches) {
              const onlineB = course.batches.find(b => b.type === "Online");
              if (onlineB && onlineInp) onlineB.timings = onlineInp.value.trim();
              const offlineB = course.batches.find(b => b.type === "Offline");
              if (offlineB && offlineInp) offlineB.timings = offlineInp.value.trim();
            } else {
              course.batches = [
                { id: id + '_online', type: 'Online', name: 'Batch 1', timings: onlineInp ? onlineInp.value.trim() : "Mon, Wed, Fri 8 AM" },
                { id: id + '_offline', type: 'Offline', name: 'Batch 2', timings: offlineInp ? offlineInp.value.trim() : "Mon 2 PM, Wed 5 PM, Sat 7 PM" },
                { id: id + '_custom', type: 'Custom', name: 'Custom', timings: 'Flexible Timings' }
              ];
            }
            
            await window.AppDB.saveCourse(course);
            showToast(`Course details and batch timings for "${course.title}" updated!`, "success");
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
