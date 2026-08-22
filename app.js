/* Psychology Sphere - Client Interactions & Mock Portals */

document.addEventListener("DOMContentLoaded", () => {
  console.log("Psychology Sphere App controller (v1.0.6) successfully loaded.");
  let loggedInUser = null;
  let editingCourseId = null;

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
  const footerLoginTriggers = document.querySelectorAll(".footer-login-trigger");

  const signupForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");
  const loginToggleWrapper = document.getElementById("login-toggle-wrapper");
  const signupToggleWrapper = document.getElementById("signup-toggle-wrapper");
  const modalTitle = document.getElementById("modal-title");
  const modalSubtitle = document.getElementById("modal-subtitle");

  const showSignupForm = (e) => {
    if (e) e.preventDefault();
    if (loginForm) loginForm.style.display = "none";
    if (loginToggleWrapper) loginToggleWrapper.style.display = "none";
    if (signupForm) signupForm.style.display = "block";
    if (signupToggleWrapper) signupToggleWrapper.style.display = "block";
    if (modalTitle) modalTitle.textContent = "Create Account";
    if (modalSubtitle) modalSubtitle.textContent = "Join the Psychology Sphere";
  };

  const showLoginForm = (e) => {
    if (e) e.preventDefault();
    if (signupForm) signupForm.style.display = "none";
    if (signupToggleWrapper) signupToggleWrapper.style.display = "none";
    if (loginForm) loginForm.style.display = "block";
    if (loginToggleWrapper) loginToggleWrapper.style.display = "block";
    if (modalTitle) modalTitle.textContent = "Welcome Back!";
    if (modalSubtitle) modalSubtitle.textContent = "Login to your learning portal";
  };

  const toggleToSignup = document.getElementById("toggle-to-signup");
  const toggleToLogin = document.getElementById("toggle-to-login");

  if (toggleToSignup) toggleToSignup.addEventListener("click", showSignupForm);
  if (toggleToLogin) toggleToLogin.addEventListener("click", showLoginForm);

  const openLoginModal = (e) => {
    if (e) e.preventDefault();
    if (loginModal) loginModal.classList.add("active");
    
    // Update database status indicator
    const statusIndicator = document.getElementById("db-status-indicator");
    if (statusIndicator) {
      if (window.AppDB.isSupabaseConnected()) {
        statusIndicator.innerHTML = '<span style="color:#16a34a; font-weight:600;"><i data-lucide="database" style="width:12px; height:12px; display:inline-block; margin-right:3px; vertical-align:middle;"></i> Connected to Supabase</span>';
      } else {
        statusIndicator.innerHTML = '<span style="color:#d97706; font-weight:600;"><i data-lucide="database-backup" style="width:12px; height:12px; display:inline-block; margin-right:3px; vertical-align:middle;"></i> Running in LocalStorage Fallback Mode</span>';
      }
      if (window.lucide) window.lucide.createIcons();
    }
  };

  const closeLoginModal = () => {
    if (loginModal) loginModal.classList.remove("active");
    showLoginForm();
    if (loginForm) loginForm.reset();
    if (signupForm) signupForm.reset();
  };

  if (loginTrigger) loginTrigger.addEventListener("click", openLoginModal);
  footerLoginTriggers.forEach(trigger => trigger.addEventListener("click", openLoginModal));

  if (loginModal) {
    loginModal.addEventListener("click", (e) => {
      if (e.target.closest("#login-modal-close") || e.target === loginModal) {
        closeLoginModal();
      }
    });
  }

  // Automatically open login modal if requested in query parameters
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("openLogin") === "true") {
    openLoginModal();
  }

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

  // Unified login and mounting logic
  function loginAndMountDashboard(profile) {
    const role = profile.role;
    const email = profile.email;
    const displayName = profile.full_name || email.split("@")[0].toUpperCase();

    // Store user session details
    loggedInUser = { email: email, role: role };

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
      
      const avatarText = profile.avatar || displayName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || "FT";
      if (sidebarAvatar) sidebarAvatar.textContent = avatarText;
      if (sidebarUsername) sidebarUsername.textContent = displayName;
      if (sidebarUserrole) sidebarUserrole.textContent = "Faculty Mentor";
      
      switchDashboardTab("faculty-classes", "Class Schedules");
    } else if (role === "admin") {
      if (adminMenu) adminMenu.style.display = "block";
      const firstLink = adminMenu.querySelector("a");
      if (firstLink) firstLink.classList.add("active");
      
      if (sidebarAvatar) sidebarAvatar.textContent = "A";
      if (sidebarUsername) sidebarUsername.textContent = displayName;
      if (sidebarUserrole) sidebarUserrole.textContent = "Office Coordinator";
      
      switchDashboardTab("admin-analytics", "Analytics Desk");
    }

    closeLoginModal();
    showToast(`Welcome back, ${displayName}! Logged in successfully.`, "success");
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;
      const role = document.getElementById("login-role").value;
      
      try {
        const profile = await window.AppDB.signIn(email, password, role);
        loginAndMountDashboard(profile);
        loginForm.reset();
      } catch (err) {
        console.error("Login verification failed:", err);
        showToast(err.message || "An error occurred during log in. Please try again.", "error");
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("signup-name").value.trim();
      const email = document.getElementById("signup-email").value.trim();
      const password = document.getElementById("signup-password").value;
      const role = document.getElementById("signup-role").value;

      try {
        // Verify email doesn't already exist
        const existingProfile = await window.AppDB.getProfileByEmail(email);
        if (existingProfile) {
          showToast("An account with this email already exists.", "error");
          return;
        }

        // Build new profile payload
        const newProfile = {
          full_name: name,
          email: email,
          role: role
        };

        // Create profile using AppDB.signUp
        const result = await window.AppDB.signUp(email, password, newProfile);
        if (result) {
          loginAndMountDashboard(result);
          signupForm.reset();
        } else {
          showToast("Failed to create account. Please try again.", "error");
        }
      } catch (err) {
        console.error("Signup failed:", err);
        showToast(err.message || "An error occurred during sign up. Please try again.", "error");
      }
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
    
    if (tabId === "student-overview") {
      renderStudentOverview();
    }

    if (tabId === "student-payments") {
      renderStudentPayments();
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

    if (tabId === "admin-payment-settings") {
      renderAdminPaymentSettings();
    }

    if (tabId === "admin-students") {
      renderAdminStudents();
    }
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // --- DYNAMIC STUDENT OVERVIEW & PAYMENTS RENDERERS ---
  async function renderStudentOverview() {
    if (!loggedInUser || loggedInUser.role !== "student") return;

    try {
      const studentProfile = await window.AppDB.getProfileByEmail(loggedInUser.email);
      if (!studentProfile) return;

      const [enrollments, attendanceLogs, payments] = await Promise.all([
        window.AppDB.getStudentEnrollments(studentProfile.id),
        window.AppDB.getStudentAttendance(studentProfile.id),
        window.AppDB.getStudentPayments(studentProfile.id)
      ]);

      // 1. My Courses count
      const coursesCountEl = document.getElementById("student-courses-count");
      if (coursesCountEl) {
        coursesCountEl.textContent = enrollments.length;
      }

      // 2. Attendance Average percentage
      const attendancePercentEl = document.getElementById("student-attendance-percent");
      if (attendancePercentEl) {
        if (attendanceLogs.length === 0) {
          attendancePercentEl.textContent = "0%";
        } else {
          const presentLogs = attendanceLogs.filter(l => l.status === "present" || l.status === "late");
          const percentage = Math.round((presentLogs.length / attendanceLogs.length) * 100);
          attendancePercentEl.textContent = `${percentage}%`;
        }
      }

      // 3. Pending balance card (Total Enrolled Course Fees - Total Paid Fees)
      const pendingInvoiceEl = document.getElementById("student-pending-invoice");
      const pendingInvoiceDueEl = document.getElementById("student-pending-invoice-due");
      if (pendingInvoiceEl && pendingInvoiceDueEl) {
        const totalCourseFees = enrollments.reduce((acc, curr) => acc + parseFloat(curr.courseFees || 0), 0);
        const paidPayments = payments.filter(p => p.status === "paid");
        const totalPaidFees = paidPayments.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
        
        const pendingAmount = Math.max(0, totalCourseFees - totalPaidFees);
        if (pendingAmount === 0) {
          pendingInvoiceEl.textContent = "₹ 0";
          pendingInvoiceEl.style.color = "#059669";
          pendingInvoiceDueEl.textContent = "No fees pending";
        } else {
          pendingInvoiceEl.textContent = `₹ ${pendingAmount.toLocaleString('en-IN')}`;
          pendingInvoiceEl.style.color = "#dc2626";
          pendingInvoiceDueEl.textContent = "Outstanding Balance";
        }
      }

      // 4. Live Broadcast schedule
      const broadcastTimeEl = document.getElementById("student-broadcast-time");
      const broadcastSubjectEl = document.getElementById("student-broadcast-subject");
      if (broadcastTimeEl && broadcastSubjectEl) {
        if (enrollments.length === 0) {
          broadcastTimeEl.textContent = "No sessions";
          broadcastTimeEl.style.fontSize = "1rem";
          broadcastSubjectEl.textContent = "None scheduled";
        } else {
          broadcastTimeEl.textContent = "Today, 6:00 PM";
          broadcastTimeEl.style.fontSize = "1.15rem";
          broadcastSubjectEl.textContent = enrollments[0].courseTitle || "Research Methods";
        }
      }

      // 5. Active courses lists
      const progressListEl = document.getElementById("student-active-programs-list");
      if (progressListEl) {
        if (enrollments.length === 0) {
          progressListEl.innerHTML = `<div style="font-size:0.85rem; color:var(--text-secondary);">No active enrollments. Go to "Enroll Courses" to begin.</div>`;
        } else {
          progressListEl.innerHTML = "";
          const baseProgress = [75, 60, 45];
          enrollments.forEach((e, idx) => {
            const progress = baseProgress[idx % baseProgress.length];
            const item = document.createElement("div");
            item.innerHTML = `
              <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.35rem;">
                <strong>${e.courseTitle}</strong>
                <span>${progress}%</span>
              </div>
              <div class="progress-bar-bg-rewrite"><div class="progress-bar-fill-rewrite" style="width:${progress}%;"></div></div>
            `;
            progressListEl.appendChild(item);
          });
        }
      }
    } catch (e) {
      console.error("Failed to render student overview metrics:", e);
    }
  }

  async function renderStudentPayments() {
    const tbody = document.getElementById("student-payments-tbody");
    const courseSel = document.getElementById("student-pay-course-sel");
    const yearSel = document.getElementById("student-pay-year-sel");
    const monthsGrid = document.getElementById("payment-months-grid");
    const selectedMonthsCountEl = document.getElementById("selected-months-count");
    const monthlyInstallmentEl = document.getElementById("payment-monthly-installment");
    const calculatedTotalEl = document.getElementById("payment-calculated-total");
    const autoPayToggle = document.getElementById("student-autopay-toggle");
    const payBtn = document.getElementById("btn-pay-selected-fees");

    if (!tbody || !courseSel || !yearSel || !monthsGrid) return;

    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Loading transaction records...</td></tr>`;

    if (!loggedInUser || loggedInUser.role !== "student") return;

    try {
      const studentProfile = await window.AppDB.getProfileByEmail(loggedInUser.email);
      if (!studentProfile) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-secondary);">No student profile found. Please try again.</td></tr>`;
        return;
      }

      // Fetch student enrollments and payment history
      const [enrollments, payments] = await Promise.all([
        window.AppDB.getStudentEnrollments(studentProfile.id),
        window.AppDB.getStudentPayments(studentProfile.id)
      ]);

      // 1. Populate enrolled course dropdown options
      if (!courseSel.dataset.bound) {
        courseSel.dataset.bound = "true";
        if (enrollments.length === 0) {
          courseSel.innerHTML = `<option value="">No enrolled programs found</option>`;
        } else {
          courseSel.innerHTML = enrollments.map(e => `<option value="${e.courseId}" data-duration="${e.courseDuration}" data-fees="${e.courseFees}">${e.courseTitle}</option>`).join("");
        }
        
        // Bind change listeners to re-render month checkboxes on course or year selection change
        courseSel.addEventListener("change", updateMonthsAndLedger);
        yearSel.addEventListener("change", updateMonthsAndLedger);
      }

      // Local helper to update months checklist and calculations
      function updateMonthsAndLedger() {
        const courseId = courseSel.value;
        const year = yearSel.value;
        if (!courseId) {
          monthsGrid.innerHTML = `<div style="grid-column: span 3; font-size:0.8rem; color:var(--text-secondary); text-align:center; padding:1rem;">Select a course to begin.</div>`;
          return;
        }

        const selectedCourseOption = courseSel.options[courseSel.selectedIndex];
        const totalFees = parseFloat(selectedCourseOption.getAttribute("data-fees") || "0");
        const durationStr = selectedCourseOption.getAttribute("data-duration") || "6 Months";
        const durationMonths = durationStr.toLowerCase().includes("month") ? parseInt(durationStr) : 6;
        const monthlyInstallment = Math.round(totalFees / (durationMonths || 6));

        monthlyInstallmentEl.textContent = `₹ ${monthlyInstallment.toLocaleString('en-IN')}`;

        // Get paid and pending verification months for this course and year from payment history
        const paidMonths = new Set();
        const pendingVerifyMonths = new Set();
        payments.forEach(p => {
          if (p.courseId && p.courseId.toString() === courseId.toString() && p.yearCovered === year.toString()) {
            if (p.status === 'paid' && p.monthsCovered) {
              p.monthsCovered.split(",").forEach(m => paidMonths.add(m.trim()));
            } else if (p.status === 'pending' && p.transactionId && p.monthsCovered) {
              p.monthsCovered.split(",").forEach(m => pendingVerifyMonths.add(m.trim()));
            }
          }
        });

        // Generate month checklist
        const monthsList = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];

        monthsGrid.innerHTML = "";
        monthsList.forEach(month => {
          const isPaid = paidMonths.has(month);
          const isPendingVerify = pendingVerifyMonths.has(month);
          const isDisabled = isPaid || isPendingVerify;
          const wrapper = document.createElement("label");
          wrapper.style.cssText = "display:flex; align-items:center; gap:0.35rem; font-size:0.75rem; border:1px solid var(--border-color); padding:0.35rem 0.5rem; border-radius:4px; cursor:pointer; background:#ffffff; transition: all 0.2s;";
          
          let subLabel = `₹ ${monthlyInstallment.toLocaleString('en-IN')}`;
          if (isPaid) {
            wrapper.style.background = "#dcfce7";
            wrapper.style.borderColor = "#bbf7d0";
            wrapper.style.cursor = "not-allowed";
            subLabel = "Paid";
          } else if (isPendingVerify) {
            wrapper.style.background = "#fffbeb";
            wrapper.style.borderColor = "#fef3c7";
            wrapper.style.cursor = "not-allowed";
            subLabel = "Under Verification";
          }
          
          wrapper.innerHTML = `
            <input type="checkbox" value="${month}" ${isDisabled ? "checked disabled" : ""} class="payment-month-cb" style="margin:0; accent-color:#3b20a6;">
            <div style="flex:1;">
              <div style="font-weight:600; color:${isPaid ? "#166534" : (isPendingVerify ? "#d97706" : "var(--text-primary)")};">${month}</div>
              <div style="font-size:0.65rem; color:var(--text-secondary); margin-top:0.05rem;">${subLabel}</div>
            </div>
          `;
          monthsGrid.appendChild(wrapper);
        });

        // Add event listeners to active checkboxes to update counts and sums
        monthsGrid.querySelectorAll(".payment-month-cb:not(:disabled)").forEach(cb => {
          cb.addEventListener("change", recalculateFees);
        });

        recalculateFees();
      }

      function recalculateFees() {
        const checkedCbs = monthsGrid.querySelectorAll(".payment-month-cb:checked:not(:disabled)");
        const selectedCount = checkedCbs.length;

        const selectedCourseOption = courseSel.options[courseSel.selectedIndex];
        if (!selectedCourseOption) return;

        const totalFees = parseFloat(selectedCourseOption.getAttribute("data-fees") || "0");
        const durationStr = selectedCourseOption.getAttribute("data-duration") || "6 Months";
        const durationMonths = durationStr.toLowerCase().includes("month") ? parseInt(durationStr) : 6;
        const monthlyInstallment = Math.round(totalFees / (durationMonths || 6));
        const totalDue = selectedCount * monthlyInstallment;

        selectedMonthsCountEl.textContent = selectedCount;
        calculatedTotalEl.textContent = `₹ ${totalDue.toLocaleString('en-IN')}`;

        if (selectedCount > 0) {
          payBtn.removeAttribute("disabled");
        } else {
          payBtn.setAttribute("disabled", "true");
        }
      }

      // Initial run for the currently selected course
      updateMonthsAndLedger();

      // 2. Render payments ledger table body (transaction history)
      if (payments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-secondary); padding:2rem;">No transaction receipts found.</td></tr>`;
      } else {
        tbody.innerHTML = "";
        payments.forEach(p => {
          const row = document.createElement("tr");
          row.style.borderBottom = "1px solid var(--border-color)";

          // Format Date & Time beautifully
          let formattedDateTime = "";
          try {
            const d = new Date(p.date);
            if (!isNaN(d.getTime())) {
              formattedDateTime = d.toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              });
            } else {
              formattedDateTime = p.date;
            }
          } catch (e) {
            formattedDateTime = p.date;
          }

          // Try to resolve Course Program name from course ID or description
          const matchingEnrollment = enrollments.find(e => e.courseId.toString() === (p.courseId || "").toString());
          const courseTitle = matchingEnrollment ? matchingEnrollment.courseTitle : p.description.split(" Tuition")[0];

          // Format Months range, e.g. July - September
          let coverageText = "Tuition Fee";
          if (p.monthsCovered) {
            const monthsArr = p.monthsCovered.split(",").map(m => m.trim());
            if (monthsArr.length === 1) {
              coverageText = `${monthsArr[0]} ${p.yearCovered || ""}`;
            } else if (monthsArr.length > 1) {
              coverageText = `${monthsArr[0]} - ${monthsArr[monthsArr.length - 1]} ${p.yearCovered || ""}`;
            }
          }

          // Status & Action buttons
          let statusBadge = "";
          let actionButton = "";

          if (p.status === "paid") {
            statusBadge = `<span class="badge" style="background:#dcfce7; color:#15803d; font-weight:600; font-size:0.75rem; border-radius:4px; padding:2px 6px;">Paid</span>`;
            actionButton = `
              <button class="btn btn-outline btn-sm btn-receipt-download" style="border-radius:20px; font-size:0.7rem; padding:2px 8px; margin-left:0.5rem;" data-id="${p.id}">
                <i data-lucide="download" style="width:10px; margin-right:2px;"></i> Receipt
              </button>
            `;
          } else if (p.status === "pending" && p.transactionId) {
            statusBadge = `<span class="badge" style="background:#fffbeb; color:#d97706; font-weight:600; font-size:0.75rem; border-radius:4px; padding:2px 6px;">Verifying</span>`;
            actionButton = `<span style="font-size:0.7rem; color:#94a3b8; font-style:italic; margin-left:0.5rem;">Awaiting verification</span>`;
          } else if (p.status === "failed") {
            statusBadge = `<span class="badge" style="background:#fee2e2; color:#b91c1c; font-weight:600; font-size:0.75rem; border-radius:4px; padding:2px 6px;">Failed</span>`;
            actionButton = `<span style="font-size:0.7rem; color:#ef4444; font-weight:600; margin-left:0.5rem;">Declined</span>`;
          } else { // pending unpaid invoice
            statusBadge = `<span class="badge" style="background:#ffedd5; color:#ea580c; font-weight:600; font-size:0.75rem; border-radius:4px; padding:2px 6px;">Pending</span>`;
            actionButton = `
              <button class="btn btn-sm btn-pay-pending-invoice" style="border-radius:20px; font-size:0.7rem; padding:2px 8px; margin-left:0.5rem; background:#3b20a6; color:white; border:none; cursor:pointer;" data-id="${p.id}" data-amount="${p.amount}" data-desc="${p.description}">
                Pay Now
              </button>
            `;
          }

          row.innerHTML = `
            <td style="padding:0.75rem 0.5rem; font-size:0.8rem; font-weight:500;">${formattedDateTime}</td>
            <td style="padding:0.75rem 0.5rem; font-size:0.8rem; font-weight:600; color:var(--text-primary);">${courseTitle}</td>
            <td style="padding:0.75rem 0.5rem; font-size:0.8rem;"><span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:600; border-radius:4px; font-size:0.75rem;">${coverageText}</span></td>
            <td style="padding:0.75rem 0.5rem; font-size:0.8rem; font-weight:700; color:#15803d;">₹ ${parseFloat(p.amount || 0).toLocaleString('en-IN')}</td>
            <td style="padding:0.75rem 0.5rem; font-size:0.8rem; display:flex; align-items:center; gap:0.25rem;">
              ${statusBadge}
              ${actionButton}
            </td>
          `;
          tbody.appendChild(row);
        });

        // Bind Receipt buttons
        tbody.querySelectorAll(".btn-receipt-download").forEach(btn => {
          btn.addEventListener("click", () => {
            const rId = btn.getAttribute("data-id");
            showToast(`Receipt PDF download generated for transaction ${rId}!`, "success");
          });
        });

        // Bind Pay Now buttons for pending invoices
        tbody.querySelectorAll(".btn-pay-pending-invoice").forEach(btn => {
          btn.addEventListener("click", () => {
            const invoiceId = btn.getAttribute("data-id");
            const amount = btn.getAttribute("data-amount");
            const desc = btn.getAttribute("data-desc");
            setupAndOpenCheckout(invoiceId, amount, desc);
          });
        });
      }

      // Bind Pay Fees Button Click
      if (!payBtn.dataset.bound) {
        payBtn.dataset.bound = "true";
        payBtn.addEventListener("click", () => {
          const checkedCbs = monthsGrid.querySelectorAll(".payment-month-cb:checked:not(:disabled)");
          const monthsToPay = Array.from(checkedCbs).map(cb => cb.value);
          const courseId = courseSel.value;
          const year = yearSel.value;
          const isAutoPay = autoPayToggle.checked;

          const selectedCourseOption = courseSel.options[courseSel.selectedIndex];
          const totalFees = parseFloat(selectedCourseOption.getAttribute("data-fees") || "0");
          const durationStr = selectedCourseOption.getAttribute("data-duration") || "6 Months";
          const durationMonths = durationStr.toLowerCase().includes("month") ? parseInt(durationStr) : 6;
          const monthlyInstallment = Math.round(totalFees / (durationMonths || 6));
          const totalDue = monthsToPay.length * monthlyInstallment;

          const courseTitle = selectedCourseOption.text.split(" (")[0];

          setupAndOpenCheckout(
            "dynamic-fee-checkout",
            totalDue,
            `${courseTitle} Tuition Fee`,
            {
              courseId,
              year,
              months: monthsToPay.join(","),
              isAutoPay
            }
          );
        });
      }

      if (window.lucide) {
        window.lucide.createIcons();
      }
    } catch (e) {
      console.error("Failed to render student payments:", e);
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#ef4444;">Error loading payments registry.</td></tr>`;
    }
  }

  // --- STUDENT MOCK INVOICE UPI PAYMENT ---
  const checkoutModal = document.getElementById("checkout-modal");
  
  const setupAndOpenCheckout = async (invoiceId, amount, description, details = {}) => {
    const checkoutModal = document.getElementById("checkout-modal");
    if (!checkoutModal) return;

    // Fetch active settings
    const settings = await window.AppDB.getPaymentSettings();
    const payeeName = settings.payee_name || "Psychology Sphere";
    const upiId = settings.upi_id || "payment@psychologysphere";
    const staticQrUrl = settings.static_qr_url || "";
    const isTestMode = settings.test_mode === true;
    const qrAmount = isTestMode ? "1" : amount;

    // Set attributes
    checkoutModal.setAttribute("data-current-invoice-id", invoiceId);
    checkoutModal.setAttribute("data-pay-amount", amount);
    if (details.courseId) checkoutModal.setAttribute("data-pay-course-id", details.courseId);
    if (details.year) checkoutModal.setAttribute("data-pay-year", details.year);
    if (details.months) checkoutModal.setAttribute("data-pay-months", details.months);
    checkoutModal.setAttribute("data-pay-autopay", details.isAutoPay ? "true" : "false");

    // Pre-fill UI
    document.getElementById("checkout-amount").textContent = "₹ " + parseFloat(amount).toLocaleString('en-IN');
    document.getElementById("checkout-payee-name").textContent = payeeName;
    document.getElementById("checkout-payee-upi").textContent = upiId;
    document.getElementById("checkout-utr-input").value = ""; // clear previous

    const testModeBadge = document.getElementById("checkout-test-mode-badge");
    if (testModeBadge) {
      testModeBadge.style.display = isTestMode ? "inline-block" : "none";
    }

    const qrImg = document.getElementById("checkout-qr-img");
    const qrPlaceholder = document.getElementById("checkout-qr-placeholder");

    if (staticQrUrl && staticQrUrl.trim() !== "") {
      // Display static QR image
      const directLink = window.AppDB.getGoogleDriveDirectLink(staticQrUrl);
      qrImg.src = directLink;
      qrImg.style.display = "block";
      if (qrPlaceholder) qrPlaceholder.style.display = "none";
    } else {
      // Generate dynamic QR code
      const transactionNote = encodeURIComponent(`Fees_${description.replace(/\s+/g, '_')}`);
      const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${qrAmount}&cu=INR&tn=${transactionNote}`;
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;
      
      qrImg.src = qrApiUrl;
      qrImg.style.display = "block";
      if (qrPlaceholder) qrPlaceholder.style.display = "none";
    }

    checkoutModal.classList.add("active");
  };

  const closeCheckoutModal = () => {
    if (checkoutModal) {
      checkoutModal.classList.remove("active");
      checkoutModal.removeAttribute("data-current-invoice-id");
      checkoutModal.removeAttribute("data-pay-course-id");
      checkoutModal.removeAttribute("data-pay-year");
      checkoutModal.removeAttribute("data-pay-months");
      checkoutModal.removeAttribute("data-pay-amount");
      checkoutModal.removeAttribute("data-pay-autopay");
    }
  };

  if (checkoutModal) {
    checkoutModal.addEventListener("click", (e) => {
      if (e.target.closest("#checkout-modal-close") || e.target === checkoutModal) {
        closeCheckoutModal();
      }
    });
  }

  const submitPaymentBtn = document.getElementById("btn-submit-payment");
  if (submitPaymentBtn) {
    submitPaymentBtn.addEventListener("click", async () => {
      const checkoutModal = document.getElementById("checkout-modal");
      if (!checkoutModal) return;

      const invoiceId = checkoutModal.getAttribute("data-current-invoice-id");
      const utrInput = document.getElementById("checkout-utr-input");
      const utr = utrInput ? utrInput.value.trim() : "";

      // Validate UTR (must be 12 digit numeric)
      if (!/^\d{12}$/.test(utr)) {
        showToast("Please enter a valid 12-digit UPI Transaction Ref (UTR) number.", "error");
        return;
      }

      const settings = await window.AppDB.getPaymentSettings();
      const status = settings.auto_approve ? "paid" : "pending";

      if (invoiceId === "dynamic-fee-checkout") {
        try {
          const studentProfile = await window.AppDB.getProfileByEmail(loggedInUser.email);
          const courseId = checkoutModal.getAttribute("data-pay-course-id");
          const year = checkoutModal.getAttribute("data-pay-year");
          const monthsStr = checkoutModal.getAttribute("data-pay-months");
          const amount = checkoutModal.getAttribute("data-pay-amount");
          const isAutoPay = checkoutModal.getAttribute("data-pay-autopay") === "true";

          const courses = await window.AppDB.getCourses();
          const course = courses.find(c => c.id.toString() === courseId.toString());
          const courseTitle = course ? course.title : "Psychology Program";

          const paymentRecord = {
            id: 'pay-' + Date.now().toString() + Math.random().toString().substring(2, 6),
            studentId: studentProfile.id,
            courseId: courseId,
            description: `${courseTitle} Tuition Fee ${isAutoPay ? '(Auto-Pay Configured)' : ''}`,
            amount: amount,
            status: status,
            date: new Date().toISOString(),
            monthsCovered: monthsStr,
            yearCovered: year,
            transactionId: utr
          };

          const success = await window.AppDB.saveStudentPayment(paymentRecord);
          if (success) {
            if (status === "paid") {
              showToast(`UPI Payment verified! Receipt generated for ${monthsStr.split(',').join(', ')}.`, "success");
            } else {
              showToast(`Transaction UTR registered! Awaiting admin approval.`, "info");
            }
            closeCheckoutModal();
            await renderStudentPayments();
            await renderStudentOverview();
          } else {
            showToast("Failed to complete transaction.", "error");
          }
        } catch (err) {
          console.error("Payment confirmation failed:", err);
          showToast("Payment failed. Please try again.", "error");
        }
      } else if (invoiceId) {
        try {
          const paid = await window.AppDB.payInvoice(invoiceId, utr);
          if (paid) {
            if (status === "paid") {
              showToast("UPI Payment verified! Receipt generated.", "success");
            } else {
              showToast("Transaction UTR registered! Awaiting admin approval.", "info");
            }
            closeCheckoutModal();
            await renderStudentPayments();
            await renderStudentOverview();
          } else {
            showToast("Failed to complete transaction.", "error");
          }
        } catch (err) {
          console.error("Payment confirmation failed:", err);
          showToast("Payment failed. Please try again.", "error");
        }
      } else {
        showToast("Payment transaction submitted!", "success");
        closeCheckoutModal();
      }
    });
  }

  // --- ADMIN PAYMENT SETTINGS RENDERING & FORM HANDLING ---
  async function renderAdminPaymentSettings() {
    const form = document.getElementById("admin-payment-settings-form");
    if (!form) return;

    // Fetch active settings
    const settings = await window.AppDB.getPaymentSettings();
    
    // Set inputs
    document.getElementById("admin-pay-upi-id").value = settings.upi_id || "";
    document.getElementById("admin-pay-payee-name").value = settings.payee_name || "";
    document.getElementById("admin-pay-static-qr").value = settings.static_qr_url || "";
    document.getElementById("admin-pay-auto-approve").checked = settings.auto_approve !== false;
    document.getElementById("admin-pay-test-mode").checked = settings.test_mode === true;

    // Update Live Preview QR Code
    updateAdminPreviewQR();

    // Render pending payment approval ledger
    await renderAdminPendingPaymentsList();

    // Setup live preview change triggers
    const inputs = ["admin-pay-upi-id", "admin-pay-payee-name", "admin-pay-static-qr"];
    inputs.forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.oninput = null;
        input.oninput = updateAdminPreviewQR;
      }
    });

    const checkboxes = ["admin-pay-test-mode", "admin-pay-auto-approve"];
    checkboxes.forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.onchange = null;
        input.onchange = updateAdminPreviewQR;
      }
    });
  }

  function updateAdminPreviewQR() {
    const upiId = document.getElementById("admin-pay-upi-id").value.trim();
    const payeeName = document.getElementById("admin-pay-payee-name").value.trim();
    const staticQrUrl = document.getElementById("admin-pay-static-qr").value.trim();
    const testMode = document.getElementById("admin-pay-test-mode").checked;

    const previewName = payeeName || "Psychology Sphere";
    const previewUpi = upiId || "payment@psychologysphere";
    const previewAmount = testMode ? "1" : "2500";

    document.getElementById("admin-preview-payee-tag").textContent = previewName;
    document.getElementById("admin-preview-upi-tag").textContent = previewUpi;

    // Update the visual amount label in preview card
    const previewContainer = document.getElementById("admin-preview-qr-container");
    if (previewContainer && previewContainer.parentElement) {
      const amountTag = previewContainer.parentElement.querySelector("span:last-child");
      if (amountTag) {
        amountTag.textContent = "₹ " + parseFloat(previewAmount).toLocaleString('en-IN');
      }
    }

    const qrImg = document.getElementById("admin-preview-qr-img");
    const qrIcon = document.getElementById("admin-preview-qr-icon");

    if (staticQrUrl) {
      const directLink = window.AppDB.getGoogleDriveDirectLink(staticQrUrl);
      qrImg.src = directLink;
      qrImg.style.display = "block";
      if (qrIcon) qrIcon.style.display = "none";
    } else {
      const upiUrl = `upi://pay?pa=${previewUpi}&pn=${encodeURIComponent(previewName)}&am=${previewAmount}&cu=INR&tn=Preview`;
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;
      
      qrImg.src = qrApiUrl;
      qrImg.style.display = "block";
      if (qrIcon) qrIcon.style.display = "none";
    }
  }

  const settingsForm = document.getElementById("admin-payment-settings-form");
  if (settingsForm) {
    settingsForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const upiId = document.getElementById("admin-pay-upi-id").value.trim();
      const payeeName = document.getElementById("admin-pay-payee-name").value.trim();
      const staticQrUrl = document.getElementById("admin-pay-static-qr").value.trim();
      const autoApprove = document.getElementById("admin-pay-auto-approve").checked;
      const testMode = document.getElementById("admin-pay-test-mode").checked;

      const success = await window.AppDB.savePaymentSettings({
        upi_id: upiId,
        payee_name: payeeName,
        static_qr_url: staticQrUrl,
        auto_approve: autoApprove,
        test_mode: testMode
      });

      if (success) {
        showToast("UPI settings updated successfully!", "success");
        updateAdminPreviewQR();
      } else {
        showToast("Failed to save configurations.", "error");
      }
    });
  }

  async function renderAdminPendingPaymentsList() {
    const tbody = document.getElementById("admin-pending-payments-tbody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-secondary);">Loading pending verifications...</td></tr>`;

    try {
      const payments = await window.AppDB.getAllPayments();
      const pending = payments.filter(p => p.status === "pending" && p.transactionId);

      if (pending.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align:center; padding:2rem; color:var(--text-secondary);">No payments pending verification.</td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = "";
      pending.forEach(p => {
        const row = document.createElement("tr");
        row.style.borderBottom = "1px solid var(--border-color)";

        let formattedDate = p.date;
        try {
          const d = new Date(p.date);
          if (!isNaN(d.getTime())) {
            formattedDate = d.toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }) + " " + d.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit'
            });
          }
        } catch (e) {}

        row.innerHTML = `
          <td style="padding:0.75rem 0.5rem; font-size:0.8rem; font-weight:600; color:var(--text-primary);">${p.studentName}</td>
          <td style="padding:0.75rem 0.5rem; font-size:0.8rem;">${p.description}</td>
          <td style="padding:0.75rem 0.5rem; font-size:0.8rem; color:var(--text-secondary);">${formattedDate}</td>
          <td style="padding:0.75rem 0.5rem; font-size:0.8rem; font-weight:700; color:#15803d;">₹ ${parseFloat(p.amount || 0).toLocaleString('en-IN')}</td>
          <td style="padding:0.75rem 0.5rem; font-size:0.8rem; font-family:monospace; font-weight:700; color:#2563eb;">${p.transactionId || "N/A"}</td>
          <td style="padding:0.75rem 0.5rem; font-size:0.8rem; text-align:center; display:flex; gap:0.5rem; justify-content:center;">
            <button class="btn btn-sm btn-approve-pay" data-id="${p.id}" style="background:#10b981; color:white; border:none; padding:4px 10px; border-radius:4px; font-weight:700; cursor:pointer;">
              Approve
            </button>
            <button class="btn btn-sm btn-reject-pay" data-id="${p.id}" style="background:#ef4444; color:white; border:none; padding:4px 10px; border-radius:4px; font-weight:700; cursor:pointer;">
              Reject
            </button>
          </td>
        `;

        tbody.appendChild(row);
      });

      // Bind action buttons
      tbody.querySelectorAll(".btn-approve-pay").forEach(btn => {
        btn.onclick = async () => {
          const pId = btn.getAttribute("data-id");
          const success = await window.AppDB.approvePayment(pId);
          if (success) {
            showToast("Payment transaction approved successfully!", "success");
            await renderAdminPaymentSettings();
          } else {
            showToast("Failed to approve payment.", "error");
          }
        };
      });

      tbody.querySelectorAll(".btn-reject-pay").forEach(btn => {
        btn.onclick = async () => {
          if (confirm("Are you sure you want to reject this payment record?")) {
            const pId = btn.getAttribute("data-id");
            const success = await window.AppDB.rejectPayment(pId);
            if (success) {
              showToast("Payment transaction rejected.", "warning");
              await renderAdminPaymentSettings();
            } else {
              showToast("Failed to reject payment.", "error");
            }
          }
        };
      });

    } catch (e) {
      console.error("Failed to render pending payments:", e);
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#ef4444;">Error loading pending verifications.</td></tr>`;
    }
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
  const adminAddCourseTrigger = document.getElementById("btn-admin-add-course");

  // Dynamic faculty select populator
  async function populateFacultySelect() {
    const acFaculty = document.getElementById("ac-faculty");
    if (!acFaculty) return;
    try {
      const facultyList = await window.AppDB.getFaculty();
      acFaculty.innerHTML = "";
      facultyList.forEach(faculty => {
        const option = document.createElement("option");
        option.value = faculty.name;
        option.textContent = faculty.name;
        acFaculty.appendChild(option);
      });
    } catch (e) {
      console.error("Failed to populate faculty dropdown:", e);
    }
  }

  function renderAdminBatches(batches) {
    const container = document.getElementById("admin-batches-container");
    if (!container) return;
    container.innerHTML = "";

    if (!batches || batches.length === 0) {
      container.innerHTML = `<div style="text-align:center; color:var(--text-secondary); font-size:0.85rem; padding:1rem;">No batches configured. Click 'Add Batch' to create one.</div>`;
      return;
    }

    batches.forEach((batch, idx) => {
      const batchDiv = document.createElement("div");
      batchDiv.className = "admin-batch-item";
      batchDiv.style.cssText = "border: 1px solid var(--border-color); padding: 0.75rem; border-radius: 8px; background: #f8fafc; position: relative;";
      
      const timingsStr = Array.isArray(batch.timings) ? batch.timings.join(', ') : (batch.timings || '');
      const maxSel = batch.maxSelectable !== undefined ? batch.maxSelectable : (batch.max_selectable !== undefined ? batch.max_selectable : 0);

      batchDiv.innerHTML = `
        <span class="btn-remove-batch" style="position: absolute; top: 8px; right: 8px; cursor: pointer; color: #dc2626; font-size: 0.75rem; font-weight: bold; background: #fee2e2; border-radius: 12px; padding: 2px 6px;">Remove &times;</span>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
          <div>
            <label style="font-size: 0.7rem; font-weight: 600; color: var(--text-secondary); display:block; margin-bottom: 2px;">Batch Name</label>
            <input type="text" class="form-control batch-name-input" placeholder="e.g. Weekday Morning" value="${batch.name || ''}" style="height: 30px; font-size: 0.8rem; padding: 0 0.5rem; border-radius: 4px; width:100%;" required>
          </div>
          <div>
            <label style="font-size: 0.7rem; font-weight: 600; color: var(--text-secondary); display:block; margin-bottom: 2px;">Type</label>
            <select class="form-control batch-type-select" style="height: 30px; font-size: 0.8rem; padding: 0 0.5rem; border-radius: 4px; width:100%;" required>
              <option value="Online" ${batch.type === 'Online' ? 'selected' : ''}>Online</option>
              <option value="Offline" ${batch.type === 'Offline' ? 'selected' : ''}>Offline</option>
              <option value="Custom" ${batch.type === 'Custom' ? 'selected' : ''}>Custom</option>
            </select>
          </div>
        </div>
        <div style="margin-bottom: 0.5rem;">
          <label style="font-size: 0.7rem; font-weight: 600; color: var(--text-secondary); display:block; margin-bottom: 2px;">Timings (comma separated)</label>
          <input type="text" class="form-control batch-timings-input" placeholder="e.g. Mon 10 AM, Wed 12 PM" value="${timingsStr}" style="height: 30px; font-size: 0.8rem; padding: 0 0.5rem; border-radius: 4px; width:100%;" required>
        </div>
        <div>
          <label style="font-size: 0.7rem; font-weight: 600; color: var(--text-secondary); display:block; margin-bottom: 2px;">Selection Rule</label>
          <select class="form-control batch-rule-select" style="height: 30px; font-size: 0.8rem; padding: 0 0.5rem; border-radius: 4px; width:100%;" required>
            <option value="0" ${Number(maxSel) === 0 ? 'selected' : ''}>Student must attend all timings</option>
            <option value="1" ${Number(maxSel) === 1 ? 'selected' : ''}>Student must select exactly 1 timing</option>
            <option value="2" ${Number(maxSel) === 2 ? 'selected' : ''}>Student can select up to 2 timings</option>
          </select>
        </div>
        <input type="hidden" class="batch-id-input" value="${batch.id || ''}">
      `;

      // Bind delete button
      batchDiv.querySelector(".btn-remove-batch").addEventListener("click", () => {
        batchDiv.remove();
        if (container.querySelectorAll(".admin-batch-item").length === 0) {
          container.innerHTML = `<div style="text-align:center; color:var(--text-secondary); font-size:0.85rem; padding:1rem;">No batches configured. Click 'Add Batch' to create one.</div>`;
        }
      });

      container.appendChild(batchDiv);
    });
  }

  // Bind Add Batch button
  const adminAddBatchBtn = document.getElementById("btn-admin-add-batch");
  if (adminAddBatchBtn) {
    adminAddBatchBtn.onclick = () => {
      const container = document.getElementById("admin-batches-container");
      if (container && container.querySelectorAll(".admin-batch-item").length === 0) {
        container.innerHTML = "";
      }
      renderAdminBatches([{ id: '', name: '', type: 'Online', timings: [], maxSelectable: 0 }]);
    };
  }

  const openAdminAddModal = async () => {
    await populateFacultySelect();
    editingCourseId = null;
    const titleEl = document.getElementById("admin-course-modal-title");
    const submitEl = document.getElementById("admin-course-modal-submit");
    if (titleEl) titleEl.textContent = "Add New Course Offering";
    if (submitEl) submitEl.textContent = "Create Course Record";
    if (addCourseForm) addCourseForm.reset();
    
    // Render default batches
    renderAdminBatches([
      { id: '', name: 'Weekday Batch', type: 'Online', timings: ['Mon 10 AM', 'Wed 12 PM', 'Sat 7 PM'], maxSelectable: 0 },
      { id: '', name: 'Weekend Intensive', type: 'Offline', timings: ['Sun 10 AM', 'Wed 5 PM'], maxSelectable: 0 }
    ]);

    if (adminAddCourseModal) adminAddCourseModal.classList.add("active");
  };

  const closeAdminAddModal = () => {
    if (adminAddCourseModal) adminAddCourseModal.classList.remove("active");
  };

  if (adminAddCourseTrigger) adminAddCourseTrigger.addEventListener("click", openAdminAddModal);

  if (adminAddCourseModal) {
    adminAddCourseModal.addEventListener("click", (e) => {
      if (e.target.closest("#admin-add-course-close") || e.target === adminAddCourseModal) {
        closeAdminAddModal();
      }
    });
  }

  const addCourseForm = document.getElementById("admin-add-course-form");
  if (addCourseForm) {
    addCourseForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("ac-title").value;
      const duration = document.getElementById("ac-duration").value;
      const fees = document.getElementById("ac-fees").value;
      const faculty = document.getElementById("ac-faculty").value;

      // Extract dynamic batches from UI
      const batchItems = document.querySelectorAll(".admin-batch-item");
      const batches = [];
      batchItems.forEach(item => {
        const id = item.querySelector(".batch-id-input").value;
        const name = item.querySelector(".batch-name-input").value.trim();
        const type = item.querySelector(".batch-type-select").value;
        const timingsVal = item.querySelector(".batch-timings-input").value;
        const timings = timingsVal.split(",").map(t => t.trim()).filter(t => t.length > 0);
        const maxSelectable = parseInt(item.querySelector(".batch-rule-select").value);

        batches.push({
          id: id,
          name: name,
          type: type,
          timings: timings,
          maxSelectable: maxSelectable
        });
      });

      if (editingCourseId) {
        // Edit mode
        const updatedCourse = {
          id: editingCourseId,
          title: title,
          description: `Complete study program in ${title} assigned under our expert guidance.`,
          duration: duration,
          fees: fees,
          faculty: faculty,
          image: '',
          batches: batches
        };

        // Keep old description and image if they exist
        try {
          const courses = await window.AppDB.getCourses();
          const orig = courses.find(c => c.id === editingCourseId);
          if (orig) {
            updatedCourse.image = orig.image;
            updatedCourse.description = orig.description;
          }
        } catch (err) {}

        await window.AppDB.saveCourse(updatedCourse);
        showToast(`Course details for "${title}" updated successfully!`, "success");
      } else {
        // Add mode
        const courseId = Date.now().toString();
        // Scope new batches with course IDs
        batches.forEach((b, idx) => {
          if (!b.id) {
            b.id = courseId + '_' + b.name.replace(/\s+/g, '_').toLowerCase() + '_' + Math.random().toString(36).substring(2, 6);
          }
        });
        const newCourse = {
          id: courseId,
          title: title,
          description: `Complete study program in ${title} assigned under our expert guidance.`,
          duration: duration,
          fees: fees,
          faculty: faculty,
          image: '',
          batches: batches
        };
        
        await window.AppDB.saveCourse(newCourse);

        // Update analytics stats
        const studentsVal = document.getElementById("admin-students-val");
        if (studentsVal) {
          studentsVal.textContent = parseInt(studentsVal.textContent) + 15;
        }

        showToast(`New course offering "${title}" added successfully!`, "success");
      }
      
      await renderMainWebsite();
      closeAdminAddModal();
      addCourseForm.reset();
    });
  }

  // --- ADMIN FACULTY MANAGEMENT ---
  const adminAddFacultyModal = document.getElementById("admin-add-faculty-modal");
  
  const openAdminAddFacultyModal = () => {
    if (adminAddFacultyModal) {
      adminAddFacultyModal.classList.add("active");
      const passInp = document.getElementById("af-password");
      if (passInp && !passInp.value) {
        passInp.value = "demo1234";
      }
    }
  };

  const closeAdminAddFacultyModal = () => {
    if (adminAddFacultyModal) adminAddFacultyModal.classList.remove("active");
  };

  if (adminAddFacultyModal) {
    adminAddFacultyModal.addEventListener("click", (e) => {
      if (e.target.closest("#admin-add-faculty-close") || e.target === adminAddFacultyModal) {
        closeAdminAddFacultyModal();
      }
    });
  }

  const addFacultyForm = document.getElementById("admin-add-faculty-form");
  if (addFacultyForm) {
    addFacultyForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("af-name").value.trim();
      const email = document.getElementById("af-email").value.trim();
      const password = document.getElementById("af-password").value;
      const designation = document.getElementById("af-role").value.trim();
      const specialization = document.getElementById("af-specialization").value.trim();
      const imageLink = document.getElementById("af-image").value.trim();

      try {
        const existingProfile = await window.AppDB.getProfileByEmail(email);
        if (existingProfile) {
          showToast("A user profile with this email already exists.", "error");
          return;
        }

        const newProfile = {
          id: generateUUID(),
          full_name: name,
          email: email,
          role: "faculty",
          password: password,
          academic_role: designation,
          specialization: specialization,
          avatar: name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || "FT",
          image: imageLink
        };

        const result = await window.AppDB.createProfile(newProfile);
        if (result) {
          showToast(`Faculty profile for "${name}" created successfully!`, "success");
          closeAdminAddFacultyModal();
          addFacultyForm.reset();
          
          if (activeDbTable === "faculty") {
            await renderDatabaseTable("faculty");
          }
          await renderMainWebsite();
        } else {
          showToast("Failed to create faculty profile. Please try again.", "error");
        }
      } catch (err) {
        console.error("Faculty creation failed:", err);
        showToast("An error occurred. Please try again.", "error");
      }
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

  function bindEditCourseButtons() {
    document.querySelectorAll(".btn-edit-course").forEach(btn => {
      btn.onclick = null;
      btn.onclick = async () => {
        const courseId = btn.getAttribute("data-id");
        try {
          const courses = await window.AppDB.getCourses();
          const course = courses.find(c => c.id === courseId);
          if (course) {
            editingCourseId = courseId;
            await populateFacultySelect();

            document.getElementById("ac-title").value = course.title;
            document.getElementById("ac-duration").value = course.duration;
            document.getElementById("ac-fees").value = course.fees;
            document.getElementById("ac-faculty").value = course.faculty;

            if (course.batches && course.batches.length > 0) {
              renderAdminBatches(course.batches);
            } else {
              renderAdminBatches([
                { id: course.id + '_online', name: 'Batch 1', type: 'Online', timings: ['Mon 8 AM', 'Wed 8 AM', 'Fri 8 AM'], maxSelectable: 0 },
                { id: course.id + '_offline', name: 'Batch 2', type: 'Offline', timings: ['Mon 2 PM', 'Wed 5 PM', 'Sat 7 PM'], maxSelectable: 0 },
                { id: course.id + '_custom', name: 'Custom', type: 'Custom', timings: ['Flexible Timings'], maxSelectable: 0 }
              ]);
            }

            const titleEl = document.getElementById("admin-course-modal-title");
            const submitEl = document.getElementById("admin-course-modal-submit");
            if (titleEl) titleEl.textContent = "Edit Course Details";
            if (submitEl) submitEl.textContent = "Update Course Record";

            if (adminAddCourseModal) adminAddCourseModal.classList.add("active");
          }
        } catch (e) {
          console.error("Failed to load course details for edit:", e);
          showToast("Failed to load course details.", "error");
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
          <td>
            <button class="btn btn-outline btn-sm btn-edit-course" data-id="${course.id}" style="border-color:#3b20a6; color:#3b20a6; padding:0.25rem 0.5rem; margin-right: 0.25rem;"><i data-lucide="edit-3" style="width:16px;"></i></button>
            <button class="btn btn-outline btn-sm btn-delete-course-mock" data-id="${course.id}" style="border-color:#ef4444; color:#ef4444; padding:0.25rem 0.5rem;"><i data-lucide="trash-2" style="width:16px;"></i></button>
          </td>
        `;
        coursesTableBody.appendChild(row);
      });
      bindDeleteCourseMockButtons();
      bindEditCourseButtons();
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
            
            const timingsStr = (e.selectedTimings && e.selectedTimings.length > 0)
              ? e.selectedTimings.join(', ')
              : (Array.isArray(e.batch.timings) ? e.batch.timings.join(', ') : e.batch.timings);

            batchHtml = `
              <div style="margin-top:0.75rem; padding-top:0.75rem; border-top:1px solid var(--border-color); font-size:0.8rem;">
                <strong>Batch:</strong> <span class="badge" style="${badgeStyle} padding:2px 6px; font-size:0.75rem; border-radius:4px; font-weight:600; text-transform:uppercase;">${e.batch.type}</span>
                <span style="font-weight:600; color:var(--text-primary); margin-left:0.25rem;">${e.batch.name}</span>
                <div style="margin-top:0.35rem; font-size:0.75rem; color:#64748b; display:flex; align-items:center; gap:0.25rem;">
                  <i data-lucide="clock" style="width:12px; height:12px; flex-shrink:0;"></i> 
                  <span><strong>Schedule:</strong> ${timingsStr}</span>
                </div>
              </div>
            `;
          }

          const feeVal = Number(e.courseFees);
          const feeFormatted = isNaN(feeVal) ? e.courseFees : `₹ ${feeVal.toLocaleString("en-IN")}`;
          const durationMonths = e.courseDuration.toLowerCase().includes("month") ? parseInt(e.courseDuration) : 6;
          const installmentVal = isNaN(feeVal) ? 2500 : Math.round(feeVal / (durationMonths || 6));
          const installmentFormatted = `₹ ${installmentVal.toLocaleString("en-IN")}/month`;

          card.innerHTML = `
            <span class="badge badge-primary" style="margin-bottom:0.75rem;">Active Program</span>
            <h3 style="font-size:1.15rem; margin-bottom:0.5rem;">${e.courseTitle}</h3>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.75rem;">Duration: ${e.courseDuration}</p>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem; margin-bottom:0.75rem; font-size:0.75rem; background:#f8fafc; border:1px solid var(--border-color); padding:0.75rem; border-radius:8px;">
              <div>
                <strong style="color:var(--text-secondary);">Total Program Fee</strong>
                <div style="font-weight:700; color:#3b20a6; font-size:0.9rem; margin-top:0.15rem;">${feeFormatted}</div>
              </div>
              <div>
                <strong style="color:var(--text-secondary);">Installment Plan</strong>
                <div style="font-weight:700; color:#059669; font-size:0.9rem; margin-top:0.15rem;">${installmentFormatted}</div>
              </div>
            </div>

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
        
        const timingsGroup = document.getElementById("student-enroll-timings-group");
        const timingsContainer = document.getElementById("student-enroll-timings-container");
        const timingsLabel = document.getElementById("student-enroll-timings-label");

        const updateEnrollmentTimings = () => {
          if (!timingsGroup || !timingsContainer) return;
          const courseId = select.value;
          const batchId = batchSelect.value;
          const course = availableCourses.find(c => c.id.toString() === courseId);
          if (!course || !course.batches) {
            timingsGroup.style.display = "none";
            return;
          }
          const batch = course.batches.find(b => b.id === batchId);
          if (!batch || !batch.timings || batch.timings.length === 0) {
            timingsGroup.style.display = "none";
            return;
          }

          timingsGroup.style.display = "block";
          timingsContainer.innerHTML = "";

          const maxSelectable = batch.maxSelectable !== undefined ? batch.maxSelectable : 0;

          if (Number(maxSelectable) === 1) {
            timingsLabel.textContent = "Select 1 Timing Option (Required)";
            batch.timings.forEach((t, idx) => {
              const itemDiv = document.createElement("div");
              itemDiv.style.cssText = "display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0;";
              itemDiv.innerHTML = `
                <input type="radio" name="enroll-timing-radio" id="timing-radio-${idx}" value="${t}" ${idx === 0 ? 'checked' : ''} style="cursor: pointer;">
                <label for="timing-radio-${idx}" style="cursor: pointer; font-size: 0.85rem; font-weight: 500;">${t}</label>
              `;
              timingsContainer.appendChild(itemDiv);
            });
          } else if (Number(maxSelectable) > 1) {
            timingsLabel.textContent = `Select Timings (Up to ${maxSelectable} slots)`;
            batch.timings.forEach((t, idx) => {
              const itemDiv = document.createElement("div");
              itemDiv.style.cssText = "display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0;";
              itemDiv.innerHTML = `
                <input type="checkbox" class="enroll-timing-checkbox" id="timing-checkbox-${idx}" value="${t}" style="cursor: pointer;">
                <label for="timing-checkbox-${idx}" style="cursor: pointer; font-size: 0.85rem; font-weight: 500;">${t}</label>
              `;
              
              const chk = itemDiv.querySelector("input");
              chk.addEventListener("change", () => {
                const checked = timingsContainer.querySelectorAll(".enroll-timing-checkbox:checked");
                if (checked.length > maxSelectable) {
                  chk.checked = false;
                  showToast(`You can select at most ${maxSelectable} timings for this batch.`, "warning");
                }
              });

              timingsContainer.appendChild(itemDiv);
            });
          } else {
            timingsLabel.textContent = "Class Timings (You attend all sessions)";
            batch.timings.forEach((t, idx) => {
              const itemDiv = document.createElement("div");
              itemDiv.style.cssText = "display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0;";
              itemDiv.innerHTML = `
                <input type="checkbox" id="timing-checkbox-${idx}" value="${t}" checked disabled style="cursor: default;">
                <label for="timing-checkbox-${idx}" style="font-size: 0.85rem; font-weight: 500; color: var(--text-primary);">${t}</label>
              `;
              timingsContainer.appendChild(itemDiv);
            });
          }
        };

        // Populate batch options dynamically
        const updateBatchDropdown = () => {
          const courseId = select.value;
          const course = availableCourses.find(c => c.id.toString() === courseId);
          if (course && course.batches && batchSelect) {
            batchSelect.innerHTML = course.batches.map(b => {
              const timingsStr = Array.isArray(b.timings) ? b.timings.join(', ') : b.timings;
              return `<option value="${b.id}">[${b.type}] ${b.name} - ${timingsStr}</option>`;
            }).join("");
            batchSelect.disabled = false;
            if (batchGroup) batchGroup.style.display = "block";
            updateEnrollmentTimings();
          } else if (batchSelect) {
            batchSelect.innerHTML = `<option value="">No slots available</option>`;
            batchSelect.disabled = true;
            if (timingsGroup) timingsGroup.style.display = "none";
          }
        };
        
        select.onchange = updateBatchDropdown;
        batchSelect.onchange = updateEnrollmentTimings;
        updateBatchDropdown();
      }

      // 5. Bind Enroll button click (one-time setup if not already bound)
      if (enrollBtn && !enrollBtn.dataset.bound) {
        enrollBtn.dataset.bound = "true";
        enrollBtn.addEventListener("click", async () => {
          const courseId = select.value;
          const batchId = batchSelect ? batchSelect.value : null;
          if (!courseId) return;

          let selectedTimings = [];
          const course = availableCourses.find(c => c.id.toString() === courseId);
          if (course && course.batches && batchId) {
            const batch = course.batches.find(b => b.id === batchId);
            if (batch) {
              const maxSelectable = batch.maxSelectable !== undefined ? batch.maxSelectable : 0;
              if (Number(maxSelectable) === 1) {
                const checkedRadio = timingsContainer.querySelector("input[name='enroll-timing-radio']:checked");
                if (checkedRadio) {
                  selectedTimings.push(checkedRadio.value);
                } else {
                  showToast("Please select a timing slot to enroll.", "warning");
                  return;
                }
              } else if (Number(maxSelectable) > 1) {
                const checkboxes = timingsContainer.querySelectorAll(".enroll-timing-checkbox:checked");
                checkboxes.forEach(cb => selectedTimings.push(cb.value));
                if (selectedTimings.length === 0) {
                  showToast("Please select at least one timing slot to enroll.", "warning");
                  return;
                }
              } else {
                selectedTimings = Array.isArray(batch.timings) ? batch.timings : [batch.timings];
              }
            }
          }

          try {
            enrollBtn.disabled = true;
            enrollBtn.textContent = "Enrolling...";
            const currentProfile = await window.AppDB.getProfileByEmail(loggedInUser.email);
            if (!currentProfile) {
              showToast("No active student profile found. Please log in again.", "error");
              return;
            }
            await window.AppDB.enrollInCourse(courseId, currentProfile.id, batchId, selectedTimings);
            await renderStudentCourses();
            await renderStudentOverview();
            showToast("Successfully enrolled in the program!", "success");
            if (timingsGroup) timingsGroup.style.display = "none";
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
                    await renderStudentOverview();
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
      // Add a header/button for creating new faculty profiles
      const headerDiv = document.createElement("div");
      headerDiv.style.marginBottom = "1.5rem";
      headerDiv.style.display = "flex";
      headerDiv.style.justifyContent = "flex-end";
      headerDiv.innerHTML = `
        <button class="btn btn-primary" id="btn-admin-add-faculty" style="border-radius:20px; font-size:0.8rem; padding:0.5rem 1.25rem;">
          <i data-lucide="user-plus" style="width:14px; height:14px; margin-right:4px;"></i> Add Faculty Profile
        </button>
      `;
      explorer.appendChild(headerDiv);
      
      const addFacultyBtn = headerDiv.querySelector("#btn-admin-add-faculty");
      if (addFacultyBtn) {
        addFacultyBtn.addEventListener("click", openAdminAddFacultyModal);
      }

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
    } else if (tableName === "payments") {
      const payments = await window.AppDB.getAllPayments();
      payments.forEach(p => {
        const card = document.createElement("div");
        card.className = "db-row-card";
        
        let statusColor = "#ea580c";
        if (p.status === "paid") statusColor = "#166534";
        if (p.status === "failed") statusColor = "#b91c1c";

        let formattedDate = p.date;
        try {
          const d = new Date(p.date);
          if (!isNaN(d.getTime())) {
            formattedDate = d.toLocaleString('en-IN');
          }
        } catch (e) {}

        card.innerHTML = `
          <div class="db-preview-container" style="display:flex; flex-direction:column; align-items:center; justify-content:center; background:#f8fafc; font-size:1.4rem; font-weight:800; color:${statusColor}; text-align:center; padding:1rem;">
            ₹ ${parseFloat(p.amount || 0).toLocaleString('en-IN')}
            <span style="font-size:0.65rem; font-weight:600; text-transform:uppercase; margin-top:0.25rem; color:${statusColor}; background:${p.status==='paid'?'#dcfce7':(p.status==='failed'?'#fee2e2':'#ffedd5')}; padding:2px 8px; border-radius:10px;">${p.status}</span>
          </div>
          <div class="db-row-details">
            <div class="db-row-title" style="font-size:0.95rem;">${p.description}</div>
            <div class="db-row-meta" style="margin-top:0.35rem;">
              <strong>Student Name:</strong> ${p.studentName}<br>
              <strong>UTR No:</strong> <code style="color:#2563eb; font-weight:bold;">${p.transactionId || 'None'}</code>
            </div>
            <div class="db-row-meta" style="margin-top:0.25rem;">
              <strong>Date & Time:</strong> ${formattedDate}
            </div>
            <div style="margin-top:0.5rem; font-size:0.7rem; color:var(--text-secondary);">
              Payment ID: <code>${p.id}</code>
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

  async function renderAdminStudents() {
    const tableBody = document.querySelector("#admin-students-table tbody");
    if (!tableBody) return;

    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Loading student records...</td></tr>`;

    try {
      const enrollments = await window.AppDB.getAllStudentEnrollments();

      const courseFilter = document.getElementById("student-filter-course");
      const sessionFilter = document.getElementById("student-filter-session");

      const selectedCourse = courseFilter ? courseFilter.value : "all";
      const selectedSession = sessionFilter ? sessionFilter.value : "all";

      if (courseFilter) {
        const uniqueCourses = [...new Set(enrollments.map(e => e.courseTitle))].sort();
        courseFilter.innerHTML = '<option value="all">All Courses</option>' + 
          uniqueCourses.map(title => `<option value="${title}">${title}</option>`).join('');
        courseFilter.value = selectedCourse;
        
        if (courseFilter.value !== selectedCourse) {
          courseFilter.value = "all";
        }
      }

      if (sessionFilter) {
        const uniqueSessions = [...new Set(enrollments.map(e => e.session))].sort((a, b) => b.localeCompare(a));
        sessionFilter.innerHTML = '<option value="all">All Sessions</option>' + 
          uniqueSessions.map(yr => `<option value="${yr}">Session ${yr}</option>`).join('');
        sessionFilter.value = selectedSession;

        if (sessionFilter.value !== selectedSession) {
          sessionFilter.value = "all";
        }
      }

      function updateTable() {
        const cVal = courseFilter ? courseFilter.value : "all";
        const sVal = sessionFilter ? sessionFilter.value : "all";

        const filtered = enrollments.filter(e => {
          const matchCourse = (cVal === "all" || e.courseTitle === cVal);
          const matchSession = (sVal === "all" || e.session === sVal);
          return matchCourse && matchSession;
        });

        if (filtered.length === 0) {
          tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-secondary); padding: 1.5rem;">No student records found matching the selected filters.</td></tr>`;
          return;
        }

        tableBody.innerHTML = filtered.map(e => {
          const statusClean = (e.status || "active").toLowerCase();
          const badgeClass = statusClean === "active" ? "badge-success" : "badge-secondary";
          
          let formattedDate = e.enrolledAt;
          try {
            const d = new Date(e.enrolledAt);
            if (!isNaN(d.getTime())) {
              formattedDate = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            }
          } catch (err) {}

          return `
            <tr>
              <td style="font-weight:600;">${e.studentName}</td>
              <td style="font-size:0.8rem; font-family:monospace; color:var(--text-secondary);">${e.studentEmail}</td>
              <td style="font-weight:500;">${e.courseTitle}</td>
              <td>${e.batchName}</td>
              <td>${formattedDate} <span style="font-size:0.7rem; color:#64748b; font-weight:600; display:block;">(Session ${e.session})</span></td>
              <td><span class="badge ${badgeClass}" style="text-transform:uppercase; font-size:0.65rem;">${e.status}</span></td>
            </tr>
          `;
        }).join('');
      }

      if (courseFilter) {
        courseFilter.onchange = null;
        courseFilter.onchange = () => updateTable();
      }
      if (sessionFilter) {
        sessionFilter.onchange = null;
        sessionFilter.onchange = () => updateTable();
      }

      updateTable();

    } catch (e) {
      console.error("Failed to render admin student management table:", e);
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#ef4444;">Error loading student records.</td></tr>`;
    }
  }
});
