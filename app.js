/* Psychology Sphere - Core Application Logic & Router */

// 1. Supabase Configuration Block
// Input your Supabase credentials here to connect to your live database.
const SUPABASE_CONFIG = {
  url: "https://ghldkcokjlxugsgqqhxn.supabase.co", // e.g. "https://your-project.supabase.co"
  anonKey: "sb_publishable_gXiAe-KDUTIumozOJHa-tg_M2waJ56L" // e.g. "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
};

let supabase = null;
let isMockMode = true;

// Initialize Supabase if keys are provided
if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
  try {
    supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    isMockMode = false;
    console.log("Connected to Supabase successfully.");
  } catch (err) {
    console.error("Failed to initialize Supabase client. Running in Mock Mode.", err);
    isMockMode = true;
  }
} else {
  console.warn("Supabase keys not found in app.js. Running in Mock Mode (In-Memory Database).");
}

// 2. In-Memory Mock Database (Stateful, satisfies 'No localStorage/sessionStorage' for SPA)
const mockDB = {
  profiles: [
    { id: "s1", full_name: "John Doe", email: "student@test.com", role: "student", phone: "+1 555 0199" },
    { id: "f1", full_name: "Dr. Sarah Jenkins", email: "faculty@test.com", role: "faculty", phone: "+1 555 0188" },
    { id: "a1", full_name: "Admin Coordinator", email: "admin@test.com", role: "admin", phone: "+1 555 0177" }
  ],
  courses: [
    { id: 1, title: "UGC NET Psychology", description: "Complete preparation for UGC NET entrance exam with comprehensive syllabus coverage.", duration: "6 Months", fees: 8999, faculty_id: "f1", image_url: "images/course_ugc_net.png" },
    { id: 2, title: "MA Psychology", description: "In-depth learning for future leaders. Advanced counseling theories and practices.", duration: "2 Years", fees: 24000, faculty_id: "f1", image_url: "images/course_ma.png" },
    { id: 3, title: "CUET PG Psychology", description: "Crack CUET PG with confidence. Specialized mock tests and concepts.", duration: "3 Months", fees: 6999, faculty_id: "f1", image_url: "images/course_cuet.png" },
    { id: 4, title: "TISSNET Psychology", description: "Specialized coaching for TISSNET entrance. Structured curriculum and guidance.", duration: "3 Months", fees: 7499, faculty_id: "f1", image_url: "images/course_tissnet.png" }
  ],
  enrollments: [
    { id: 1, student_id: "s1", course_id: 1, status: "active", enrolled_at: "2026-06-01T10:00:00Z" }
  ],
  fees: [
    { id: 1, student_id: "s1", course_id: 1, amount: 8999, status: "pending", due_date: "2026-07-15", paid_at: null, payment_method: null, receipt_no: null }
  ],
  attendance: [
    { id: 1, student_id: "s1", course_id: 1, date: "2026-06-25", status: "present", marked_by: "f1" },
    { id: 2, student_id: "s1", course_id: 1, date: "2026-06-26", status: "present", marked_by: "f1" },
    { id: 3, student_id: "s1", course_id: 1, date: "2026-06-29", status: "absent", marked_by: "f1" }
  ],
  live_classes: [
    { id: 1, course_id: 1, title: "Introduction to Cognitive Behavior Therapy (CBT)", scheduled_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), meeting_link: "https://zoom.us/mock-meeting-ps", status: "scheduled" },
    { id: 2, course_id: 2, title: "Diagnostic Criteria & DSM-5 Assessment", scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), meeting_link: "https://zoom.us/mock-meeting-ps2", status: "scheduled" }
  ],
  recorded_sessions: [
    { id: 1, course_id: 1, title: "History and Origins of Psychology", description: "A detailed timeline of clinical psychology from Freud to Modern Cognitive Science.", video_url: "https://www.w3schools.com/html/mov_bbb.mp4" }
  ],
  notices: [
    { id: 1, title: "Upcoming Live Demo Class", content: "Join us for a free masterclass on Child Psychology this Sunday at 11:00 AM.", target_role: "all", created_at: "2026-06-30T09:00:00Z" },
    { id: 2, title: "Term Fee Notice", content: "Please clear pending fees before the 15th of this month to avoid portal interruptions.", target_role: "student", created_at: "2026-06-29T10:00:00Z" }
  ],
  audit_logs: [
    { id: 1, user_id: "a1", action: "System Initialized", details: "Memory store populated with seed elements", created_at: "2026-06-30T18:00:00Z" }
  ]
};

// Current Session State (in-memory)
let currentUser = null;

// Helper to push Audit Logs
function addAuditLog(userId, action, details) {
  const log = {
    id: mockDB.audit_logs.length + 1,
    user_id: userId,
    action: action,
    details: details,
    created_at: new Date().toISOString()
  };
  mockDB.audit_logs.unshift(log);
}

// 3. Auth Management Functions
const AuthService = {
  async signup(fullName, email, password, phone, role) {
    if (isMockMode) {
      // Simulate network
      await new Promise(r => setTimeout(r, 600));
      if (mockDB.profiles.some(p => p.email === email)) {
        throw new Error("Email already registered");
      }
      const newId = "user_" + Math.random().toString(36).substr(2, 9);
      const newProfile = { id: newId, full_name: fullName, email, phone, role, created_at: new Date().toISOString() };
      mockDB.profiles.push(newProfile);
      
      // Auto enroll in Course 1 for demo purposes if student
      if (role === 'student') {
        mockDB.enrollments.push({ id: mockDB.enrollments.length + 1, student_id: newId, course_id: 1, status: "active", enrolled_at: new Date().toISOString() });
        mockDB.fees.push({ id: mockDB.fees.length + 1, student_id: newId, course_id: 1, amount: 499, status: "pending", due_date: new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0] });
      }
      
      currentUser = newProfile;
      addAuditLog(newId, "User Signup", `Registered as ${role}: ${fullName}`);
      return newProfile;
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role: role, phone: phone }
        }
      });
      if (error) throw error;
      
      // Fetch profile (trigger may take a millisecond)
      await new Promise(r => setTimeout(r, 500));
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      currentUser = profile;
      return profile;
    }
  },

  async login(email, password) {
    if (isMockMode) {
      await new Promise(r => setTimeout(r, 500));
      const profile = mockDB.profiles.find(p => p.email === email);
      if (!profile) {
        throw new Error("Invalid email or password");
      }
      // In mock, any password matches
      currentUser = profile;
      addAuditLog(profile.id, "User Login", `Authenticated user: ${profile.full_name}`);
      return profile;
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: profile, error: pError } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      if (pError) throw pError;
      currentUser = profile;
      return profile;
    }
  },

  async logout() {
    if (isMockMode) {
      if (currentUser) addAuditLog(currentUser.id, "User Logout", `Signed out session`);
      currentUser = null;
      return true;
    } else {
      const { error } = await supabase.auth.signOut();
      currentUser = null;
      if (error) throw error;
    }
  },

  getCurrentUser() {
    return currentUser;
  }
};

// 4. Database operations interface
const DatabaseService = {
  async getCourses() {
    if (isMockMode) {
      return [...mockDB.courses];
    } else {
      const { data, error } = await supabase.from('courses').select('*, profiles(full_name)');
      if (error) throw error;
      return data.map(c => ({...c, faculty_name: c.profiles?.full_name || 'Unassigned'}));
    }
  },

  async addCourse(title, description, duration, fees, facultyId) {
    if (isMockMode) {
      const newCourse = {
        id: mockDB.courses.length + 1,
        title,
        description,
        duration,
        fees: parseFloat(fees),
        faculty_id: facultyId
      };
      mockDB.courses.push(newCourse);
      addAuditLog(currentUser?.id, "Course Created", `Added Course: ${title}`);
      return newCourse;
    } else {
      const { data, error } = await supabase.from('courses').insert([{ title, description, duration, fees, faculty_id: facultyId }]).select();
      if (error) throw error;
      return data[0];
    }
  },

  async deleteCourse(id) {
    if (isMockMode) {
      const index = mockDB.courses.findIndex(c => c.id === parseInt(id));
      if (index !== -1) {
        const title = mockDB.courses[index].title;
        mockDB.courses.splice(index, 1);
        addAuditLog(currentUser?.id, "Course Deleted", `Removed Course ID ${id}: ${title}`);
      }
      return true;
    } else {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },

  async getProfilesByRole(role) {
    if (isMockMode) {
      return mockDB.profiles.filter(p => p.role === role);
    } else {
      const { data, error } = await supabase.from('profiles').select('*').eq('role', role);
      if (error) throw error;
      return data;
    }
  },

  async getNotices(role) {
    if (isMockMode) {
      return mockDB.notices.filter(n => n.target_role === 'all' || n.target_role === role);
    } else {
      const { data, error } = await supabase.from('notices').select('*').or(`target_role.eq.all,target_role.eq.${role}`);
      if (error) throw error;
      return data;
    }
  },

  async addNotice(title, content, targetRole) {
    if (isMockMode) {
      const newNotice = { id: mockDB.notices.length + 1, title, content, target_role: targetRole, created_at: new Date().toISOString() };
      mockDB.notices.unshift(newNotice);
      addAuditLog(currentUser?.id, "Notice Broadcasted", `Added Notice: ${title}`);
      return newNotice;
    } else {
      const { data, error } = await supabase.from('notices').insert([{ title, content, target_role: targetRole }]).select();
      if (error) throw error;
      return data[0];
    }
  },

  // Student specific data
  async getStudentDashboardData(studentId) {
    if (isMockMode) {
      const enrollments = mockDB.enrollments.filter(e => e.student_id === studentId);
      const enrolledCourses = enrollments.map(e => mockDB.courses.find(c => c.id === e.course_id)).filter(Boolean);
      
      const attendance = mockDB.attendance.filter(a => a.student_id === studentId);
      const fees = mockDB.fees.filter(f => f.student_id === studentId);
      
      // Live classes for student's enrolled courses
      const courseIds = enrolledCourses.map(c => c.id);
      const liveClasses = mockDB.live_classes.filter(l => courseIds.includes(l.course_id));
      const recorded = mockDB.recorded_sessions.filter(r => courseIds.includes(r.course_id));
      
      return { enrolledCourses, attendance, fees, liveClasses, recorded };
    } else {
      const { data: enrollments } = await supabase.from('enrollments').select('*, courses(*)').eq('student_id', studentId);
      const { data: attendance } = await supabase.from('attendance').select('*').eq('student_id', studentId);
      const { data: fees } = await supabase.from('fees').select('*, courses(*)').eq('student_id', studentId);
      
      const courseIds = enrollments?.map(e => e.course_id) || [];
      
      let liveClasses = [];
      let recorded = [];
      if (courseIds.length > 0) {
        const { data: lClasses } = await supabase.from('live_classes').select('*').in('course_id', courseIds);
        const { data: rSessions } = await supabase.from('recorded_sessions').select('*').in('course_id', courseIds);
        liveClasses = lClasses || [];
        recorded = rSessions || [];
      }
      
      return {
        enrolledCourses: enrollments?.map(e => e.courses) || [],
        attendance: attendance || [],
        fees: fees || [],
        liveClasses,
        recorded
      };
    }
  },

  async payFee(feeId, paymentMethod) {
    const receiptNo = "REC-" + Math.floor(100000 + Math.random() * 900000);
    if (isMockMode) {
      const fee = mockDB.fees.find(f => f.id === parseInt(feeId));
      if (fee) {
        fee.status = "paid";
        fee.paid_at = new Date().toISOString();
        fee.payment_method = paymentMethod;
        fee.receipt_no = receiptNo;
        addAuditLog(currentUser?.id, "Fee Paid", `Paid Fee ID ${feeId} via ${paymentMethod}. Receipt: ${receiptNo}`);
      }
      return fee;
    } else {
      const { data, error } = await supabase.from('fees').update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_method: paymentMethod,
        receipt_no: receiptNo
      }).eq('id', feeId).select();
      if (error) throw error;
      return data[0];
    }
  },

  // Faculty specific data
  async getFacultyDashboardData(facultyId) {
    if (isMockMode) {
      const courses = mockDB.courses.filter(c => c.faculty_id === facultyId);
      const courseIds = courses.map(c => c.id);
      
      // Students enrolled in these courses
      const enrollments = mockDB.enrollments.filter(e => courseIds.includes(e.course_id));
      const studentIds = [...new Set(enrollments.map(e => e.student_id))];
      const students = mockDB.profiles.filter(p => studentIds.includes(p.id));
      
      // Attendance records for these courses
      const attendance = mockDB.attendance.filter(a => courseIds.includes(a.course_id));
      const liveClasses = mockDB.live_classes.filter(l => courseIds.includes(l.course_id));
      
      return { courses, students, enrollments, attendance, liveClasses };
    } else {
      const { data: courses } = await supabase.from('courses').select('*').eq('faculty_id', facultyId);
      const courseIds = courses?.map(c => c.id) || [];
      
      let enrollments = [];
      let students = [];
      let attendance = [];
      let liveClasses = [];
      
      if (courseIds.length > 0) {
        const { data: enrolls } = await supabase.from('enrollments').select('*, profiles(*)').in('course_id', courseIds);
        enrollments = enrolls || [];
        const studentIds = [...new Set(enrollments.map(e => e.student_id))];
        
        if (studentIds.length > 0) {
          const { data: studs } = await supabase.from('profiles').select('*').in('id', studentIds);
          students = studs || [];
        }
        
        const { data: att } = await supabase.from('attendance').select('*').in('course_id', courseIds);
        attendance = att || [];
        
        const { data: live } = await supabase.from('live_classes').select('*').in('course_id', courseIds);
        liveClasses = live || [];
      }
      
      return { courses, students, enrollments, attendance, liveClasses };
    }
  },

  async markAttendance(studentId, courseId, date, status, facultyId) {
    if (isMockMode) {
      const index = mockDB.attendance.findIndex(a => a.student_id === studentId && a.course_id === parseInt(courseId) && a.date === date);
      if (index !== -1) {
        mockDB.attendance[index].status = status;
        mockDB.attendance[index].marked_by = facultyId;
      } else {
        mockDB.attendance.push({
          id: mockDB.attendance.length + 1,
          student_id: studentId,
          course_id: parseInt(courseId),
          date,
          status,
          marked_by: facultyId,
          created_at: new Date().toISOString()
        });
      }
      addAuditLog(facultyId, "Attendance Logged", `Marked Student ${studentId} as ${status} for Course ${courseId} on ${date}`);
      return true;
    } else {
      // Upsert pattern
      const { error } = await supabase.from('attendance').upsert({
        student_id: studentId,
        course_id: courseId,
        date,
        status,
        marked_by: facultyId
      }, { onConflict: 'student_id,course_id,date' });
      if (error) throw error;
      return true;
    }
  },

  async scheduleLiveClass(courseId, title, scheduledAt, meetingLink) {
    if (isMockMode) {
      const newClass = {
        id: mockDB.live_classes.length + 1,
        course_id: parseInt(courseId),
        title,
        scheduled_at: new Date(scheduledAt).toISOString(),
        meeting_link: meetingLink,
        status: "scheduled"
      };
      mockDB.live_classes.push(newClass);
      addAuditLog(currentUser?.id, "Live Class Scheduled", `Created class: ${title}`);
      return newClass;
    } else {
      const { data, error } = await supabase.from('live_classes').insert([{
        course_id: courseId,
        title,
        scheduled_at: scheduledAt,
        meeting_link: meetingLink
      }]).select();
      if (error) throw error;
      return data[0];
    }
  },

  // Admin specific data
  async getAdminDashboardData() {
    if (isMockMode) {
      const students = mockDB.profiles.filter(p => p.role === 'student');
      const faculty = mockDB.profiles.filter(p => p.role === 'faculty');
      const courses = [...mockDB.courses];
      const enrollments = [...mockDB.enrollments];
      const fees = [...mockDB.fees];
      const attendance = [...mockDB.attendance];
      const logs = [...mockDB.audit_logs];
      
      return { students, faculty, courses, enrollments, fees, attendance, logs };
    } else {
      const { data: profiles } = await supabase.from('profiles').select('*');
      const { data: courses } = await supabase.from('courses').select('*, profiles(full_name)');
      const { data: enrollments } = await supabase.from('enrollments').select('*');
      const { data: fees } = await supabase.from('fees').select('*');
      const { data: attendance } = await supabase.from('attendance').select('*');
      const { data: logs } = await supabase.from('audit_logs').select('*, profiles(full_name)').order('created_at', { ascending: false });
      
      const students = profiles?.filter(p => p.role === 'student') || [];
      const faculty = profiles?.filter(p => p.role === 'faculty') || [];
      const coursesWithFaculty = courses?.map(c => ({...c, faculty_name: c.profiles?.full_name || 'Unassigned'})) || [];
      const logsWithUser = logs?.map(l => ({...l, user_name: l.profiles?.full_name || 'System'})) || [];
      
      return { students, faculty, courses: coursesWithFaculty, enrollments, fees, attendance, logs: logsWithUser };
    }
  }
};

// 5. Toast Notification System
const Toast = {
  show(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'info';
    if (type === 'success') iconClass = 'check-circle';
    if (type === 'error') iconClass = 'alert-triangle';
    
    toast.innerHTML = `
      <i data-lucide="${iconClass}"></i>
      <span>${message}</span>
    `;
    
    container.appendChild(toast);
    lucide.createIcons();
    
    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

// 6. Router Engine (Single Page Application hash-routing)
const Router = {
  routes: {},
  currentPath: '',

  register(path, renderFn) {
    this.routes[path] = renderFn;
  },

  async navigate(path) {
    window.location.hash = path;
  },

  async handleRoute() {
    const hash = window.location.hash || '#home';
    this.currentPath = hash;
    
    // Auth route guards
    const user = AuthService.getCurrentUser();
    const isDashboard = hash.startsWith('#student') || hash.startsWith('#faculty') || hash.startsWith('#admin');
    
    if (isDashboard && !user) {
      Toast.show("Please login to access this portal.", "error");
      window.location.hash = '#login';
      return;
    }
    
    // Role-specific check
    if (user) {
      if (hash.startsWith('#student') && user.role !== 'student') {
        window.location.hash = `#${user.role}`;
        return;
      }
      if (hash.startsWith('#faculty') && user.role !== 'faculty') {
        window.location.hash = `#${user.role}`;
        return;
      }
      if (hash.startsWith('#admin') && user.role !== 'admin') {
        window.location.hash = `#${user.role}`;
        return;
      }
      
      // Redirect login/signup to dashboard if already logged in
      if ((hash === '#login' || hash === '#signup')) {
        window.location.hash = `#${user.role}`;
        return;
      }
    }
    
    // Highlight Nav Links
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === hash) {
        a.classList.add('active');
      }
    });
    
    // Close mobile menus if open
    const navLinks = document.getElementById('nav-links');
    if (navLinks) navLinks.classList.remove('active');
    
    const renderFn = this.routes[hash] || this.routes['#home'];
    
    // Main mounting transition
    const mainContainer = document.getElementById('app-mount');
    if (mainContainer) {
      mainContainer.style.opacity = '0';
      mainContainer.style.transform = 'translateY(10px)';
      mainContainer.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      
      setTimeout(async () => {
        try {
          await renderFn(mainContainer);
          mainContainer.style.opacity = '1';
          mainContainer.style.transform = 'translateY(0)';
          lucide.createIcons();
        } catch (err) {
          console.error("Routing Render Error", err);
          mainContainer.innerHTML = `<div class="container section text-center"><h2>Error Loading View</h2><p>${err.message}</p></div>`;
          mainContainer.style.opacity = '1';
          mainContainer.style.transform = 'translateY(0)';
        }
      }, 200);
    }
  },

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    // Run on first load
    this.handleRoute();
  }
};

// Export services globally so pages can access them
window.AuthService = AuthService;
window.DatabaseService = DatabaseService;
window.Toast = Toast;
window.Router = Router;
window.isMockMode = isMockMode;
