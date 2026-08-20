/* Psychology Sphere - Client-side Database Layer using LocalStorage and Supabase */

(function (global) {
  const DB_KEY = 'psychology_sphere_db';

  // --- SUPABASE CONFIGURATION ---
  // Input your Supabase credentials here. 
  // If left as defaults, the application will automatically run in LocalStorage mode.
  const SUPABASE_URL = 'https://ghldkcokjlxugsgqqhxn.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_gXiAe-KDUTIumozOJHa-tg_M2waJ56L';

  const isSupabaseConfigured =
    SUPABASE_URL &&
    SUPABASE_URL !== 'YOUR_SUPABASE_URL' &&
    SUPABASE_ANON_KEY &&
    SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';

  let supabaseClient = null;
  if (isSupabaseConfigured && typeof supabase !== 'undefined') {
    try {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log("Supabase successfully initialized.");
    } catch (e) {
      console.error("Failed to initialize Supabase client: ", e);
    }
  } else {
    console.warn("Supabase is not configured or SDK is missing. Falling back to LocalStorage database.");
  }

  // Helper to extract Google Drive file ID and build a direct embeddable link
  function getGoogleDriveDirectLink(url) {
    if (!url) return '';
    const urlStr = url.trim();

    // Check if it's already a direct link or not a Google Drive link
    if (!urlStr.includes('drive.google.com') && !urlStr.includes('docs.google.com')) {
      return urlStr;
    }

    let fileId = '';
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/i,
      /[?&]id=([a-zA-Z0-9_-]+)/i,
      /\/open\?id=([a-zA-Z0-9_-]+)/i,
      /\/file\/d\/([a-zA-Z0-9_-]+)\/view/i
    ];

    for (const pattern of patterns) {
      const match = urlStr.match(pattern);
      if (match && match[1]) {
        fileId = match[1];
        break;
      }
    }

    if (fileId) {
      // Use lh3.googleusercontent.com/d/FILE_ID format for direct hotlinking
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }

    return urlStr;
  }

  // Helper to hash password using SHA-256 (asynchronously, native browser Web Crypto API)
  async function hashPassword(password) {
    if (!password) return '';
    try {
      const msgBuffer = new TextEncoder().encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.error("SHA-256 Hashing failed, returning plain text fallback:", e);
      return password;
    }
  }

  // Initial Seed Data
  const defaultDB = {
    courses: [
      {
        id: '1',
        title: 'Introduction to Psychology',
        description: 'Explore the foundational principles of human behavior, cognitive science, emotions, and research methods. KOUSHIK DAS',
        duration: '3 Months',
        fees: '499',
        faculty: 'Dr. Sarah Jenkins',
        image: 'https://drive.google.com/file/d/1T3Bc5OZGwzAB5LhrlSiN9MBkhssfuK_m/view?usp=sharing',
        batches: [
          { id: '1_online', type: 'Online', name: 'Batch 1', timings: 'Mon, Wed, Fri 8 AM' },
          { id: '1_offline', type: 'Offline', name: 'Batch 2', timings: 'Mon 2 PM, Wed 5 PM, Sat 7 PM' },
          { id: '1_custom', type: 'Custom', name: 'Custom', timings: 'Flexible Timings' }
        ]
      },
      {
        id: '2',
        title: 'Clinical Psychology & Counseling',
        description: 'Advanced training in psychiatric diagnostics, clinical therapeutic methods, and practical counseling designs.',
        duration: '6 Months',
        fees: '899',
        faculty: 'Dr. Sarah Jenkins',
        image: 'https://drive.google.com/file/d/1Q1z-ot8-aJxRRG3Kb1xVIgYAggVTdYXF/view?usp=drive_link',
        batches: [
          { id: '2_online', type: 'Online', name: 'Batch 1', timings: 'Mon, Wed, Fri 8 AM' },
          { id: '2_offline', type: 'Offline', name: 'Batch 2', timings: 'Mon 2 PM, Wed 5 PM, Sat 7 PM' },
          { id: '2_custom', type: 'Custom', name: 'Custom', timings: 'Flexible Timings' }
        ]
      },
      {
        id: '3',
        title: 'Child & Adolescent Development',
        description: 'Analyze behavioral psychology, neurological development, and family dynamics from infancy to adolescence.',
        duration: '4 Months',
        fees: '599',
        faculty: 'Prof. Ananya Sen',
        image: 'https://drive.google.com/file/d/1DNlnrPsMCYrhrW01t7RFy26cuG3-ViAY/view?usp=drive_link',
        batches: [
          { id: '3_online', type: 'Online', name: 'Batch 1', timings: 'Mon, Wed, Fri 8 AM' },
          { id: '3_offline', type: 'Offline', name: 'Batch 2', timings: 'Mon 2 PM, Wed 5 PM, Sat 7 PM' },
          { id: '3_custom', type: 'Custom', name: 'Custom', timings: 'Flexible Timings' }
        ]
      },
      {
        id: '4',
        title: 'Cognitive Neuropsychology',
        description: 'Delve into brain-behavior relationships, memory architectures, executive functions, and neural mapping.',
        duration: '5 Months',
        fees: '749',
        faculty: 'Dr. Sarah Jenkins',
        image: 'https://drive.google.com/file/d/111DybtLL0b8kQTXDiqgN4WrnctcRwnWB/view?usp=drive_link',
        batches: [
          { id: '4_online', type: 'Online', name: 'Batch 1', timings: 'Mon, Wed, Fri 8 AM' },
          { id: '4_offline', type: 'Offline', name: 'Batch 2', timings: 'Mon 2 PM, Wed 5 PM, Sat 7 PM' },
          { id: '4_custom', type: 'Custom', name: 'Custom', timings: 'Flexible Timings' }
        ]
      },
      {
        id: '5',
        title: 'Research Methodologies & Statistics',
        description: 'Master quantitative/qualitative analysis, research setups, SPSS operations, and journal thesis structures.',
        duration: '3 Months',
        fees: '399',
        faculty: 'Dr. Sarah Jenkins',
        image: 'https://drive.google.com/file/d/1x3MIow2LHA8H65y4fp7vphc6wqKhYf78/view?usp=drive_link',
        batches: [
          { id: '5_online', type: 'Online', name: 'Batch 1', timings: 'Mon, Wed, Fri 8 AM' },
          { id: '5_offline', type: 'Offline', name: 'Batch 2', timings: 'Mon 2 PM, Wed 5 PM, Sat 7 PM' },
          { id: '5_custom', type: 'Custom', name: 'Custom', timings: 'Flexible Timings' }
        ]
      },
      {
        id: '11',
        title: 'UGC NET Psychology',
        description: 'Complete preparation for UGC NET entrance exam with comprehensive syllabus coverage.',
        duration: '6 Months',
        fees: '8999',
        faculty: 'Dr. Sarah Jenkins',
        image: 'images/course_ugc_net.png',
        batches: [
          { id: '11_online', type: 'Online', name: 'Batch 1', timings: 'Mon, Wed, Fri 8 AM' },
          { id: '11_offline', type: 'Offline', name: 'Batch 2', timings: 'Mon 2 PM, Wed 5 PM, Sat 7 PM' },
          { id: '11_custom', type: 'Custom', name: 'Custom', timings: 'Flexible Timings' }
        ]
      },
      {
        id: '12',
        title: 'WBCS PsychologY',
        description: 'In-depth learning for future leaders. Advanced counseling theories and practices.',
        duration: '2 Years',
        fees: '24000',
        faculty: 'Dr. Rajesh Kumar',
        image: 'images/course_ma.png',
        batches: [
          { id: '12_online', type: 'Online', name: 'Batch 1', timings: 'Mon, Wed, Fri 8 AM' },
          { id: '12_offline', type: 'Offline', name: 'Batch 2', timings: 'Mon 2 PM, Wed 5 PM, Sat 7 PM' },
          { id: '12_custom', type: 'Custom', name: 'Custom', timings: 'Flexible Timings' }
        ]
      },
      {
        id: '13',
        title: 'CUET PG Psychology TEST KOUSHIK',
        description: 'Crack CUET PG with confidence. Specialized mock tests and concepts.',
        duration: '3 Months',
        fees: '6999',
        faculty: 'Dr. Sarah Jenkins',
        image: 'images/course_cuet.png',
        batches: [
          { id: '13_online', type: 'Online', name: 'Batch 1', timings: 'Mon, Wed, Fri 8 AM' },
          { id: '13_offline', type: 'Offline', name: 'Batch 2', timings: 'Mon 2 PM, Wed 5 PM, Sat 7 PM' },
          { id: '13_custom', type: 'Custom', name: 'Custom', timings: 'Flexible Timings' }
        ]
      },
      {
        id: '14',
        title: 'TISSNET Psychology',
        description: 'Specialized coaching for TISSNET entrance. Structured curriculum and guidance.',
        duration: '3 Months',
        fees: '7499',
        faculty: 'Prof. Ananya Sen',
        image: 'images/course_tissnet.png',
        batches: [
          { id: '14_online', type: 'Online', name: 'Batch 1', timings: 'Mon, Wed, Fri 8 AM' },
          { id: '14_offline', type: 'Offline', name: 'Batch 2', timings: 'Mon 2 PM, Wed 5 PM, Sat 7 PM' },
          { id: '14_custom', type: 'Custom', name: 'Custom', timings: 'Flexible Timings' }
        ]
      }
    ],
    faculty: [
      {
        id: '1',
        name: 'Dr. Sarah Jenkins',
        role: 'Ph.D. / Senior Lecturer',
        specialization: 'Clinical Counseling. 10+ Years of coaching entrance aspirants.',
        avatar: 'SJ',
        image: '' // empty by default
      },
      {
        id: '2',
        name: 'Dr. Rajesh Kumar',
        role: 'Ph.D. / Cognitive Scientist',
        specialization: 'Research Methods & Neuropsychology. Former DU professor.',
        avatar: 'RK',
        image: ''
      },
      {
        id: '3',
        name: 'Prof. Ananya Sen',
        role: 'M.Phil. / Senior Mentor',
        specialization: 'Child Development & Counseling. 8+ Years teaching.',
        avatar: 'AS',
        image: ''
      }
    ],
    assets: {
      hero_student_image: 'images/student_cutout.png'
    },
    profiles: [
      {
        id: '1',
        full_name: 'Dr. Sarah Jenkins',
        email: 'faculty@psysphere.edu',
        role: 'faculty',
        password: 'demo1234',
        academic_role: 'Ph.D. / Senior Lecturer',
        specialization: 'Clinical Counseling. 10+ Years of coaching entrance aspirants.',
        avatar: 'SJ'
      },
      {
        id: '2',
        full_name: 'Dr. Rajesh Kumar',
        email: 'rajesh@psysphere.edu',
        role: 'faculty',
        password: 'demo1234',
        academic_role: 'Ph.D. / Cognitive Scientist',
        specialization: 'Research Methods & Neuropsychology. Former DU professor.',
        avatar: 'RK'
      },
      {
        id: '3',
        full_name: 'Prof. Ananya Sen',
        email: 'ananya@psysphere.edu',
        role: 'faculty',
        password: 'demo1234',
        academic_role: 'M.Phil. / Senior Mentor',
        specialization: 'Child Development & Counseling. 8+ Years teaching.',
        avatar: 'AS'
      },
      {
        id: 'student-default-id',
        full_name: 'STUDENT SCHOLAR',
        email: 'student@psysphere.edu',
        role: 'student',
        password: 'demo1234'
      },
      {
        id: 'admin-default-id',
        full_name: 'System Admin',
        email: 'admin@psysphere.edu',
        role: 'admin',
        password: 'demo1234'
      }
    ],
    enrollments: [
      {
        id: 'enroll-1',
        student_id: 'student-default-id',
        course_id: '1',
        batch_id: '1_online',
        status: 'active',
        enrolled_at: '2026-06-01T08:00:00.000Z'
      },
      {
        id: 'enroll-2',
        student_id: 'student-default-id',
        course_id: '2',
        batch_id: '2_online',
        status: 'active',
        enrolled_at: '2026-06-01T08:00:00.000Z'
      }
    ],
    attendance: [
      {
        id: 'att-1',
        student_id: 'student-default-id',
        course_id: '1',
        date: '2026-06-25',
        status: 'present'
      },
      {
        id: 'att-2',
        student_id: 'student-default-id',
        course_id: '2',
        date: '2026-06-26',
        status: 'present'
      },
      {
        id: 'att-3',
        student_id: 'student-default-id',
        course_id: '1',
        date: '2026-06-29',
        status: 'absent'
      }
    ],
    payments: [
      {
        id: 'pay-1',
        student_id: 'student-default-id',
        description: 'MA Psychology Tuition Installment',
        date: '2026-07-01',
        amount: '2500',
        status: 'pending'
      },
      {
        id: 'pay-2',
        student_id: 'student-default-id',
        description: 'UGC NET Study Materials Fee',
        date: '2026-06-15',
        amount: '1200',
        status: 'paid'
      }
    ],
    payment_settings: {
      upi_id: 'payment@psychologysphere',
      payee_name: 'Psychology Sphere',
      static_qr_url: '',
      auto_approve: true,
      test_mode: false
    }
  };

  // LocalStorage fallback utilities
  function loadDB() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (!raw) {
        saveDB(defaultDB);
        return defaultDB;
      }
      const data = JSON.parse(raw);
      // Ensure all keys exist
      if (!data.courses || !data.faculty || !data.assets || !data.profiles || !data.enrollments || !data.attendance || !data.payments || !data.payment_settings) {
        const merged = Object.assign({}, defaultDB, data);
        saveDB(merged);
        return merged;
      }
      // Migration: Ensure all existing courses in LocalStorage have default batches
      let migrationUpdated = false;
      data.courses.forEach(c => {
        if (!c.batches) {
          c.batches = [
            { id: c.id + '_online', type: 'Online', name: 'Batch 1', timings: 'Mon, Wed, Fri 8 AM' },
            { id: c.id + '_offline', type: 'Offline', name: 'Batch 2', timings: 'Mon 2 PM, Wed 5 PM, Sat 7 PM' },
            { id: c.id + '_custom', type: 'Custom', name: 'Custom', timings: 'Flexible Timings' }
          ];
          migrationUpdated = true;
        }
      });
      if (migrationUpdated) {
        saveDB(data);
      }
      return data;
    } catch (e) {
      console.error('Failed to load local DB, resetting to defaults.', e);
      saveDB(defaultDB);
      return defaultDB;
    }
  }

  function saveDB(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  }

  // Expose the API (all DB operations are async to support Supabase seamlessly)
  const AppDB = {
    // Helper URL converter
    getGoogleDriveDirectLink: getGoogleDriveDirectLink,

    // Secure authentication methods
    signIn: async function (email, password, role) {
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
          });
          if (error) {
            // Only allow auto-activation/first-time setup for student/faculty roles.
            // Admin accounts MUST be pre-created securely in the database.
            if (role !== 'admin') {
              let profile = await this.getProfileByEmail(email);
              
              // Check if it's one of our seeded default profiles
              const defaultProfile = defaultDB.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
              if (!profile && defaultProfile && defaultProfile.role === role && password === 'demo1234') {
                console.log("Seeding default profile. Registering Auth first...");
                const signUpResult = await supabaseClient.auth.signUp({
                  email: email,
                  password: password
                });
                if (signUpResult.error) throw signUpResult.error;
                
                const user = signUpResult.data.user;
                if (user) {
                  profile = await this.createProfile({
                    id: user.id,
                    email: defaultProfile.email,
                    full_name: defaultProfile.full_name,
                    role: defaultProfile.role,
                    academic_role: defaultProfile.academic_role || null,
                    specialization: defaultProfile.specialization || null,
                    avatar: defaultProfile.avatar || null
                  });
                  return profile;
                }
              } else if (profile && profile.role === role) {
                // Pre-registered profile exists (e.g. created by admin), register credentials in Auth
                console.log("Auto-activating Supabase Auth account for profile:", email);
                const signUpResult = await supabaseClient.auth.signUp({
                  email: email,
                  password: password
                });
                if (signUpResult.error) throw signUpResult.error;
                
                // Align profile id with the new Supabase Auth UUID if they differ
                const user = signUpResult.data.user;
                if (user && user.id !== profile.id) {
                  console.log("Updating profile ID to match Supabase Auth UUID...");
                  await supabaseClient
                    .from('profiles')
                    .update({ id: user.id })
                    .eq('email', email);
                  profile.id = user.id;
                }
                return profile;
              }
            }
            throw error;
          }
          
          const profile = await this.getProfileByEmail(email);
          if (!profile) {
            throw new Error("No associated user profile was found in public.profiles table.");
          }
          if (profile.role !== role) {
            throw new Error("Portal mismatch: Selected role does not match account role.");
          }
          return profile;
        } catch (e) {
          console.error("Supabase signIn failed:", e);
          // If it is a standard authentication/credentials or role mismatch error, 
          // throw it directly to the user instead of falling back to LocalStorage.
          if (e.message && (
            e.message.includes("credentials") || 
            e.message.includes("not found") || 
            e.message.includes("Portal mismatch") || 
            e.message.includes("No associated user profile") ||
            e.message.includes("confirmed")
          )) {
            throw e;
          }
          console.warn("Attempting LocalStorage fallback due to connection/network error...");
        }
      }

      // LocalStorage / Fallback Auth
      const db = loadDB();
      if (!db.profiles) db.profiles = [];
      const profile = db.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (!profile) {
        throw new Error("No account found with this email. Please check your credentials.");
      }

      if (profile.role !== role) {
        throw new Error("Portal mismatch: Selected role does not match account role.");
      }

      // Compare password
      const enteredHash = await hashPassword(password);
      const savedPassword = profile.password;
      const isDefaultMockAccount = (email.toLowerCase() === 'student@psysphere.edu' || email.toLowerCase() === 'faculty@psysphere.edu' || email.toLowerCase() === 'admin@psysphere.edu');

      const match = (savedPassword === enteredHash || (isDefaultMockAccount && savedPassword === password) || savedPassword === password);
      if (!match) {
        throw new Error("Incorrect password. Please try again.");
      }
      return profile;
    },

    signUp: async function (email, password, profileDetails) {
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password
          });
          if (error) throw error;

          const user = data.user;
          if (!user) throw new Error("Auth user creation failed.");

          const newProfile = {
            id: user.id,
            email: email,
            full_name: profileDetails.full_name,
            role: profileDetails.role,
            academic_role: profileDetails.academic_role || null,
            specialization: profileDetails.specialization || null,
            avatar: profileDetails.avatar || null,
            image: profileDetails.image || null
          };

          const savedProfile = await this.createProfile(newProfile);
          
          // Sync with LocalStorage backup
          const db = loadDB();
          if (!db.profiles) db.profiles = [];
          const existingIdx = db.profiles.findIndex(p => p.email.toLowerCase() === email.toLowerCase());
          const hashedPassword = await hashPassword(password);
          const localProfile = { ...newProfile, password: hashedPassword };
          if (existingIdx !== -1) {
            db.profiles[existingIdx] = localProfile;
          } else {
            db.profiles.push(localProfile);
          }
          saveDB(db);

          return { ...savedProfile, password: password };
        } catch (e) {
          console.error("Supabase signUp failed, falling back to LocalStorage:", e);
          throw e;
        }
      }

      // LocalStorage mode
      const db = loadDB();
      if (!db.profiles) db.profiles = [];
      const existingProfile = db.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (existingProfile) {
        throw new Error("An account with this email already exists.");
      }

      const hashedPassword = await hashPassword(password);
      const generatedId = profileDetails.id || (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36));
      const newProfile = {
        id: generatedId,
        email: email,
        full_name: profileDetails.full_name,
        role: profileDetails.role,
        academic_role: profileDetails.academic_role || null,
        specialization: profileDetails.specialization || null,
        avatar: profileDetails.avatar || null,
        image: profileDetails.image || null,
        password: hashedPassword
      };
      
      db.profiles.push(newProfile);
      saveDB(db);
      return newProfile;
    },

    // Course Methods
    getCourses: async function () {
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient
            .from('courses')
            .select('*, profiles(full_name)')
            .order('created_at', { ascending: true });

          if (error) throw error;

          if (!data || data.length === 0) {
            // If empty, return default courses
            return defaultDB.courses;
          }

          // Fetch batches if Supabase batches table exists
          let batchesByCourse = {};
          try {
            const { data: batchesData, error: batchesError } = await supabaseClient
              .from('batches')
              .select('*');
            if (!batchesError && batchesData) {
              batchesData.forEach(b => {
                const cId = b.course_id.toString();
                if (!batchesByCourse[cId]) batchesByCourse[cId] = [];
                batchesByCourse[cId].push({
                  id: b.id,
                  type: b.type,
                  name: b.name,
                  timings: b.timings
                });
              });
            }
          } catch (e) {
            console.warn("Could not fetch batches from Supabase table 'batches', falling back to defaults.", e);
          }

          return data.map(c => {
            const courseIdStr = c.id.toString();
            return {
              id: courseIdStr,
              title: c.title,
              description: c.description || '',
              duration: c.duration || '',
              fees: c.fees ? c.fees.toString() : '0',
              faculty: c.profiles?.full_name || 'Dr. Sarah Jenkins',
              image: c.image || c.image_url || 'images/course_ugc_net.png',
              batches: batchesByCourse[courseIdStr] || [
                { id: courseIdStr + '_online', type: 'Online', name: 'Batch 1', timings: 'Mon, Wed, Fri 8 AM' },
                { id: courseIdStr + '_offline', type: 'Offline', name: 'Batch 2', timings: 'Mon 2 PM, Wed 5 PM, Sat 7 PM' },
                { id: courseIdStr + '_custom', type: 'Custom', name: 'Custom', timings: 'Flexible Timings' }
              ]
            };
          });
        } catch (err) {
          console.error("Supabase getCourses failed, falling back to local database.", err);
          const db = loadDB();
          return db.courses;
        }
      } else {
        const db = loadDB();
        return db.courses;
      }
    },

    saveCourse: async function (course) {
      if (supabaseClient) {
        try {
          // Attempt to resolve the faculty name to a profiles UUID
          let faculty_id = null;
          if (course.faculty) {
            const { data: profile } = await supabaseClient
              .from('profiles')
              .select('id')
              .eq('full_name', course.faculty)
              .eq('role', 'faculty')
              .limit(1)
              .maybeSingle();

            if (profile) {
              faculty_id = profile.id;
            }
          }

          // Build insertion payload mapping to standard course schema
          const payload = {
            title: course.title,
            description: course.description || '',
            duration: course.duration || '',
            fees: isNaN(Number(course.fees)) ? 0 : Number(course.fees),
            faculty_id: faculty_id,
            image: course.image || ''
          };

          // Try to parse id to use for upsert. If it is client-generated, use it.
          const numericId = parseInt(course.id);
          if (course.id && !isNaN(numericId) && numericId > 1000000000) {
            payload.id = numericId;
          }

          let dbCourseId = null;
          try {
            const { data: savedCourse, error } = await supabaseClient
              .from('courses')
              .upsert(payload)
              .select()
              .maybeSingle();
            if (!error && savedCourse) {
              dbCourseId = savedCourse.id;
            }
          } catch (upsertErr) {
            const { error } = await supabaseClient
              .from('courses')
              .upsert(payload);
            if (error) throw error;
          }

          if (!dbCourseId) {
            dbCourseId = numericId;
            if (!dbCourseId) {
              try {
                const { data: fetchedCourse } = await supabaseClient
                  .from('courses')
                  .select('id')
                  .eq('title', course.title)
                  .limit(1)
                  .maybeSingle();
                if (fetchedCourse) dbCourseId = fetchedCourse.id;
              } catch (fErr) {}
            }
          }

          // Save batches if batches array exists and batches table is supported
          if (course.batches && dbCourseId) {
            try {
              const batchesPayload = course.batches.map(b => ({
                id: b.id.includes('_') ? b.id : `${dbCourseId}_${b.type.toLowerCase()}`,
                course_id: dbCourseId,
                type: b.type,
                name: b.name,
                timings: b.timings
              }));
              await supabaseClient
                .from('batches')
                .upsert(batchesPayload);
            } catch (e) {
              console.warn("Could not save batches to Supabase batches table:", e);
            }
          }
          return course;
        } catch (err) {
          console.error("Supabase saveCourse failed, writing to LocalStorage.", err);
          // Fallback to local storage write
          const db = loadDB();
          const existingIdx = db.courses.findIndex(c => c.id === course.id);
          if (existingIdx !== -1) {
            if (!course.batches && db.courses[existingIdx].batches) {
              course.batches = db.courses[existingIdx].batches;
            }
            db.courses[existingIdx] = course;
          } else {
            if (!course.batches) {
              course.batches = [
                { id: course.id + '_online', type: 'Online', name: 'Batch 1', timings: 'Mon, Wed, Fri 8 AM' },
                { id: course.id + '_offline', type: 'Offline', name: 'Batch 2', timings: 'Mon 2 PM, Wed 5 PM, Sat 7 PM' },
                { id: course.id + '_custom', type: 'Custom', name: 'Custom', timings: 'Flexible Timings' }
              ];
            }
            db.courses.push(course);
          }
          saveDB(db);
          return course;
        }
      } else {
        const db = loadDB();
        const existingIdx = db.courses.findIndex(c => c.id === course.id);
        if (existingIdx !== -1) {
          if (!course.batches && db.courses[existingIdx].batches) {
            course.batches = db.courses[existingIdx].batches;
          }
          db.courses[existingIdx] = course;
        } else {
          if (!course.batches) {
            course.batches = [
              { id: course.id + '_online', type: 'Online', name: 'Batch 1', timings: 'Mon, Wed, Fri 8 AM' },
              { id: course.id + '_offline', type: 'Offline', name: 'Batch 2', timings: 'Mon 2 PM, Wed 5 PM, Sat 7 PM' },
              { id: course.id + '_custom', type: 'Custom', name: 'Custom', timings: 'Flexible Timings' }
            ];
          }
          db.courses.push(course);
        }
        saveDB(db);
        return course;
      }
    },

    deleteCourse: async function (id) {
      if (supabaseClient) {
        try {
          // If the ID is a numeric string/bigint, we parse it
          const numericId = parseInt(id);
          if (!isNaN(numericId)) {
            const { error } = await supabaseClient
              .from('courses')
              .delete()
              .eq('id', numericId);

            if (error) throw error;
          }
        } catch (err) {
          console.error("Supabase deleteCourse failed, removing from LocalStorage.", err);
          const db = loadDB();
          db.courses = db.courses.filter(c => c.id !== id);
          saveDB(db);
        }
      } else {
        const db = loadDB();
        db.courses = db.courses.filter(c => c.id !== id);
        saveDB(db);
      }
    },

    // Faculty Methods (fetched from public.profiles table where role = 'faculty')
    getFaculty: async function () {
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('role', 'faculty')
            .order('created_at', { ascending: true });

          if (error) throw error;

          if (!data || data.length === 0) {
            return defaultDB.faculty;
          }

          return data.map(f => ({
            id: f.id,
            name: f.full_name,
            role: f.academic_role || 'Lecturer / Instructor',
            specialization: f.specialization || 'Coaching entrance aspirants.',
            avatar: f.avatar || f.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
            image: f.image || f.image_url || ''
          }));
        } catch (err) {
          console.error("Supabase getFaculty failed, falling back to LocalStorage.", err);
        }
      }
      // LocalStorage mode or fallback
      const db = loadDB();
      if (!db.profiles) db.profiles = [];
      const localFaculty = db.profiles.filter(p => p.role === 'faculty');
      if (localFaculty.length > 0) {
        return localFaculty.map(f => ({
          id: f.id,
          name: f.full_name,
          role: f.academic_role || 'Lecturer / Instructor',
          specialization: f.specialization || 'Coaching entrance aspirants.',
          avatar: f.avatar || f.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
          image: f.image || ''
        }));
      }
      return db.faculty;
    },

    saveFaculty: async function (member) {
      if (supabaseClient) {
        try {
          const payload = {
            id: member.id, // UUID in Supabase
            full_name: member.name,
            academic_role: member.role,
            specialization: member.specialization,
            avatar: member.avatar,
            image: member.image
          };

          const { error } = await supabaseClient
            .from('profiles')
            .upsert(payload);

          if (error) throw error;
          return member;
        } catch (err) {
          console.error("Supabase saveFaculty failed, writing to LocalStorage.", err);
          const db = loadDB();
          const existingIdx = db.faculty.findIndex(f => f.id === member.id);
          if (existingIdx !== -1) {
            db.faculty[existingIdx] = member;
          } else {
            db.faculty.push(member);
          }
          // Keep profiles in sync
          if (!db.profiles) db.profiles = [];
          const profIdx = db.profiles.findIndex(p => p.id === member.id);
          if (profIdx !== -1) {
            db.profiles[profIdx].full_name = member.name;
            db.profiles[profIdx].academic_role = member.role;
            db.profiles[profIdx].specialization = member.specialization;
            db.profiles[profIdx].avatar = member.avatar;
            db.profiles[profIdx].image = member.image;
          }
          saveDB(db);
          return member;
        }
      } else {
        const db = loadDB();
        const existingIdx = db.faculty.findIndex(f => f.id === member.id);
        if (existingIdx !== -1) {
          db.faculty[existingIdx] = member;
        } else {
          db.faculty.push(member);
        }
        // Keep profiles in sync
        if (!db.profiles) db.profiles = [];
        const profIdx = db.profiles.findIndex(p => p.id === member.id);
        if (profIdx !== -1) {
          db.profiles[profIdx].full_name = member.name;
          db.profiles[profIdx].academic_role = member.role;
          db.profiles[profIdx].specialization = member.specialization;
          db.profiles[profIdx].avatar = member.avatar;
          db.profiles[profIdx].image = member.image;
        }
        saveDB(db);
        return member;
      }
    },

    // Asset Methods (Keep client-side configuration locally in LocalStorage)
    getAssets: async function () {
      const db = loadDB();
      return db.assets;
    },

    saveAsset: async function (key, value) {
      const db = loadDB();
      db.assets[key] = value;
      saveDB(db);
      return value;
    },

    // Profile & Enrollment Methods
    getProfileByEmail: async function (email) {
      let supabaseProfile = null;
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('email', email)
            .limit(1)
            .maybeSingle();
          if (!error && data) {
            supabaseProfile = data;
          }
        } catch (e) {
          console.error("Supabase getProfileByEmail failed:", e);
        }
      }

      // LocalStorage lookup
      const db = loadDB();
      if (!db.profiles) db.profiles = [];
      const localProfile = db.profiles.find(p => p.email.toLowerCase() === email.toLowerCase()) || null;

      if (supabaseProfile) {
        // Merge Supabase profile with local password credentials
        return {
          ...supabaseProfile,
          password: localProfile ? localProfile.password : (email.toLowerCase() === 'student@psysphere.edu' || email.toLowerCase() === 'faculty@psysphere.edu' || email.toLowerCase() === 'admin@psysphere.edu' ? 'demo1234' : undefined)
        };
      }
      return localProfile;
    },

    createProfile: async function (profile) {
      // Always store in LocalStorage first to backup password
      const db = loadDB();
      if (!db.profiles) db.profiles = [];
      const existingIdx = db.profiles.findIndex(p => p.email.toLowerCase() === profile.email.toLowerCase());
      if (existingIdx !== -1) {
        db.profiles[existingIdx] = profile;
      } else {
        db.profiles.push(profile);
      }
      saveDB(db);

      if (supabaseClient) {
        try {
          // Strip the password field since it is not in the live public.profiles schema
          const { password, ...supabaseProfile } = profile;
          const { data, error } = await supabaseClient
            .from('profiles')
            .insert(supabaseProfile)
            .select()
            .single();
          if (error) throw error;
          return { ...data, password: profile.password };
        } catch (e) {
          console.error("Supabase createProfile failed:", e);
        }
      }
      return profile;
    },

    enrollInCourse: async function (courseId, studentId, batchId) {
      if (supabaseClient) {
        try {
          const { error } = await supabaseClient
            .from('enrollments')
            .insert({
              student_id: studentId,
              course_id: parseInt(courseId),
              batch_id: batchId,
              status: 'active'
            });
          if (error) {
            console.warn("Supabase enroll with batchId failed, retrying without batch:", error);
            const { error: retryError } = await supabaseClient
              .from('enrollments')
              .insert({
                student_id: studentId,
                course_id: parseInt(courseId),
                status: 'active'
              });
            if (retryError) throw retryError;
          }

          // Try to insert invoice in Supabase payments table
          try {
            const db = loadDB();
            const localCourse = db.courses.find(c => c.id === courseId.toString());
            let courseTitle = localCourse ? localCourse.title : 'Psychology Program';
            let courseFees = localCourse ? localCourse.fees : '2500';

            const { data: supabaseCourse } = await supabaseClient
              .from('courses')
              .select('title, fees')
              .eq('id', parseInt(courseId))
              .maybeSingle();
            if (supabaseCourse) {
              courseTitle = supabaseCourse.title;
              courseFees = supabaseCourse.fees || '2500';
            }

            await supabaseClient
              .from('payments')
              .insert({
                student_id: studentId,
                description: courseTitle + ' Tuition Installment',
                amount: courseFees.toString(),
                status: 'pending',
                date: new Date().toISOString().split('T')[0]
              });
          } catch (payErr) {
            console.warn("Could not insert payment into Supabase payments table:", payErr);
          }
        } catch (e) {
          console.error("Supabase enrollInCourse failed, falling back to LocalStorage:", e);
        }
      }
      
      // LocalStorage fallback (always runs to ensure local/offline database health)
      const db = loadDB();
      if (!db.enrollments) db.enrollments = [];
      const alreadyEnrolled = db.enrollments.some(e => e.student_id === studentId && e.course_id === courseId.toString());
      if (!alreadyEnrolled) {
        db.enrollments.push({
          id: Date.now().toString(),
          student_id: studentId,
          course_id: courseId.toString(),
          batch_id: batchId,
          status: 'active',
          enrolled_at: new Date().toISOString()
        });
      }

      // Generate dynamic pending invoice for the newly enrolled program in LocalStorage
      if (!db.payments) db.payments = [];
      const course = db.courses.find(c => c.id === courseId.toString());
      const invoiceDescription = (course ? course.title : 'Psychology Program') + ' Tuition Installment';
      const invoiceAmount = course ? course.fees : '2500';

      const alreadyHasPayment = db.payments.some(p => p.student_id === studentId && p.description === invoiceDescription && p.status === 'pending');
      if (!alreadyHasPayment) {
        db.payments.push({
          id: 'pay-' + Date.now().toString() + Math.random().toString().substring(2, 6),
          student_id: studentId,
          description: invoiceDescription,
          date: new Date().toISOString().split('T')[0],
          amount: invoiceAmount,
          status: 'pending'
        });
      }

      saveDB(db);
      return true;
    },

    getStudentAttendance: async function (studentId) {
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient
            .from('attendance')
            .select('*, courses(title)')
            .eq('student_id', studentId)
            .order('date', { ascending: false });
          if (error) throw error;
          
          return data.map(a => ({
            date: a.date,
            courseTitle: a.courses?.title || 'Psychology Course',
            status: a.status
          }));
        } catch (e) {
          console.error("Supabase getStudentAttendance failed, falling back to LocalStorage:", e);
        }
      }
      
      // LocalStorage fallback
      const db = loadDB();
      if (!db.attendance) db.attendance = [];
      const records = db.attendance.filter(a => a.student_id === studentId);
      return records.map(a => {
        const course = db.courses.find(c => c.id === a.course_id.toString());
        return {
          date: a.date,
          courseTitle: course ? course.title : 'Psychology Course',
          status: a.status
        };
      });
    },

    getEnrolledStudents: async function (courseId) {
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient
            .from('enrollments')
            .select('*, profiles(*)')
            .eq('course_id', parseInt(courseId));
          if (error) throw error;
          
          if (!data) return [];
          return data.filter(e => e.profiles !== null).map(e => ({
            id: e.profiles.id,
            name: e.profiles.full_name,
            email: e.profiles.email
          }));
        } catch (e) {
          console.error("Supabase getEnrolledStudents failed, falling back to LocalStorage:", e);
        }
      }
      
      // LocalStorage fallback
      const db = loadDB();
      if (!db.enrollments) db.enrollments = [];
      if (!db.profiles) db.profiles = [];
      const courseEnrollments = db.enrollments.filter(e => e.course_id === courseId.toString());
      return courseEnrollments.map(e => {
        const profile = db.profiles.find(p => p.id === e.student_id);
        return {
          id: e.student_id,
          name: profile ? profile.full_name : 'Unknown Student',
          email: profile ? profile.email : ''
        };
      });
    },

    getStudentEnrollments: async function (studentId) {
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient
            .from('enrollments')
            .select('*, courses(*)')
            .eq('student_id', studentId);
          if (error) throw error;
          
          if (data && data.length > 0) {
            const validEnrollments = data.filter(e => e.courses !== null);
            if (validEnrollments.length > 0) {
              // Try to fetch batches from Supabase batches table
              let allBatches = [];
              try {
                const { data: batchesData } = await supabaseClient
                  .from('batches')
                  .select('*');
                if (batchesData) allBatches = batchesData;
              } catch (e) {
                console.warn("Could not load batches from Supabase table 'batches' for enrollments lookup:", e);
              }

              return validEnrollments.map(e => {
                const courseIdStr = e.courses.id.toString();
                // Find batch in allBatches
                let batchDetails = allBatches.find(b => b.id === e.batch_id && b.course_id.toString() === courseIdStr);
                if (!batchDetails) {
                  // Generate standard mock batches for this course as fallback
                  const mockBatches = [
                    { id: courseIdStr + '_online', type: 'Online', name: 'Batch 1', timings: 'Mon, Wed, Fri 8 AM' },
                    { id: courseIdStr + '_offline', type: 'Offline', name: 'Batch 2', timings: 'Mon 2 PM, Wed 5 PM, Sat 7 PM' },
                    { id: courseIdStr + '_custom', type: 'Custom', name: 'Custom', timings: 'Flexible Timings' }
                  ];
                  batchDetails = mockBatches.find(b => b.id === e.batch_id) || mockBatches[0];
                }
                return {
                  id: e.id,
                  courseId: e.courses.id,
                  courseTitle: e.courses.title,
                  courseDuration: e.courses.duration,
                  courseFees: e.courses.fees,
                  batch: batchDetails,
                  status: e.status
                };
              });
            }
          }
          // If no Supabase enrollments or course is empty, trigger LocalStorage fallback
          throw new Error("No valid enrollments found in Supabase");
        } catch (e) {
          console.error("Supabase getStudentEnrollments failed, falling back to LocalStorage:", e);
        }
      }

      // LocalStorage fallback
      const db = loadDB();
      if (!db.enrollments) db.enrollments = [];
      const studentEnrollments = db.enrollments.filter(e => e.student_id === studentId);
      return studentEnrollments.map(e => {
        const course = db.courses.find(c => c.id === e.course_id);
        let batchDetails = null;
        if (course && course.batches && e.batch_id) {
          batchDetails = course.batches.find(b => b.id === e.batch_id);
        }
        return {
          id: e.id,
          courseId: e.course_id,
          courseTitle: course ? course.title : 'Unknown Course',
          courseDuration: course ? course.duration : 'N/A',
          courseFees: course ? course.fees : '0',
          batch: batchDetails,
          status: e.status
        };
      });
    },

    saveAttendanceRecords: async function (records) {
      if (supabaseClient) {
        try {
          const { error } = await supabaseClient
            .from('attendance')
            .upsert(records, { onConflict: 'student_id,course_id,date' });
          if (error) throw error;
          return true;
        } catch (e) {
          console.error("Supabase saveAttendanceRecords failed:", e);
          throw e;
        }
      } else {
        const db = loadDB();
        if (!db.attendance) db.attendance = [];
        records.forEach(r => {
          const existingIdx = db.attendance.findIndex(a => a.student_id === r.student_id && a.course_id === r.course_id.toString() && a.date === r.date);
          if (existingIdx !== -1) {
            db.attendance[existingIdx] = {
              id: db.attendance[existingIdx].id,
              ...r,
              course_id: r.course_id.toString()
            };
          } else {
            db.attendance.push({
              id: Date.now().toString() + Math.random().toString(),
              ...r,
              course_id: r.course_id.toString()
            });
          }
        });
        saveDB(db);
        return true;
      }
    },

    saveInquiry: async function (inquiry) {
      if (supabaseClient) {
        try {
          const { error } = await supabaseClient
            .from('inquiries')
            .insert({
              name: inquiry.name,
              email: inquiry.email,
              phone: inquiry.phone || null,
              course_interest: inquiry.courseInterest
            });
          if (error) throw error;
          return true;
        } catch (err) {
          console.error("Supabase saveInquiry failed, falling back to LocalStorage.", err);
          const db = loadDB();
          if (!db.inquiries) db.inquiries = [];
          db.inquiries.push({
            id: Date.now().toString(),
            ...inquiry,
            created_at: new Date().toISOString()
          });
          saveDB(db);
          return true;
        }
      } else {
        const db = loadDB();
        if (!db.inquiries) db.inquiries = [];
        db.inquiries.push({
          id: Date.now().toString(),
          ...inquiry,
          created_at: new Date().toISOString()
        });
        saveDB(db);
        return true;
      }
    },

    getStudentPayments: async function (studentId) {
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient
            .from('payments')
            .select('*')
            .eq('student_id', studentId)
            .order('date', { ascending: false });
          if (error) throw error;
          return (data || []).map(p => ({
            id: p.id,
            studentId: p.student_id,
            courseId: p.course_id,
            description: p.description,
            amount: p.amount ? p.amount.toString() : '0',
            status: p.status,
            date: p.date || p.payment_date || new Date().toISOString(),
            monthsCovered: p.months_covered,
            yearCovered: p.year_covered
          }));
        } catch (e) {
          console.error("Supabase getStudentPayments failed:", e);
        }
      }
      
      // LocalStorage fallback
      const db = loadDB();
      if (!db.payments) db.payments = [];
      return db.payments
        .filter(p => p.student_id === studentId)
        .map(p => ({
          id: p.id,
          studentId: p.student_id,
          courseId: p.course_id,
          description: p.description,
          amount: p.amount ? p.amount.toString() : '0',
          status: p.status,
          date: p.date,
          monthsCovered: p.monthsCovered || p.months_covered,
          yearCovered: p.yearCovered || p.year_covered
        }));
    },

    saveStudentPayment: async function (paymentRecord) {
      const description = paymentRecord.description + (paymentRecord.transactionId ? ' (UTR: ' + paymentRecord.transactionId + ')' : '');
      if (supabaseClient) {
        try {
          const { error } = await supabaseClient
            .from('payments')
            .insert({
              id: paymentRecord.id,
              student_id: paymentRecord.studentId,
              course_id: paymentRecord.courseId ? parseInt(paymentRecord.courseId) : null,
              description: description,
              amount: paymentRecord.amount.toString(),
              status: paymentRecord.status,
              date: paymentRecord.date,
              months_covered: paymentRecord.monthsCovered,
              year_covered: paymentRecord.yearCovered
            });
          if (error) throw error;
          return true;
        } catch (e) {
          console.error("Supabase saveStudentPayment failed:", e);
          throw e;
        }
      }

      // LocalStorage fallback
      const db = loadDB();
      if (!db.payments) db.payments = [];
      db.payments.push({
        id: paymentRecord.id,
        student_id: paymentRecord.studentId,
        course_id: paymentRecord.courseId ? paymentRecord.courseId.toString() : null,
        description: description,
        amount: paymentRecord.amount,
        status: paymentRecord.status,
        date: paymentRecord.date,
        monthsCovered: paymentRecord.monthsCovered,
        yearCovered: paymentRecord.yearCovered,
        transactionId: paymentRecord.transactionId || null
      });
      saveDB(db);
      return true;
    },

    payInvoice: async function (invoiceId, transactionId) {
      const db = loadDB();
      if (!db.payments) db.payments = [];
      const invoice = db.payments.find(p => p.id === invoiceId);
      
      let status = 'paid';
      if (db.payment_settings && db.payment_settings.auto_approve === false) {
        status = 'pending';
      }

      const descriptionSuffix = transactionId ? ' (UTR: ' + transactionId + ')' : '';
      const updatedDescription = invoice ? (invoice.description + descriptionSuffix) : undefined;

      if (supabaseClient) {
        try {
          const updateObj = { status: status };
          if (updatedDescription) {
            updateObj.description = updatedDescription;
          }
          const { error } = await supabaseClient
            .from('payments')
            .update(updateObj)
            .eq('id', invoiceId);
          if (error && invoice) {
            await supabaseClient
              .from('payments')
              .update(updateObj)
              .eq('student_id', invoice.student_id)
              .eq('description', invoice.description);
          }
        } catch (e) {
          console.error("Supabase payInvoice failed:", e);
        }
      }

      if (invoice) {
        invoice.status = status;
        invoice.transactionId = transactionId || null;
        if (updatedDescription) {
          invoice.description = updatedDescription;
        }
        saveDB(db);
        return true;
      }
      return false;
    },

    getPaymentSettings: async function () {
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient
            .from('payment_settings')
            .select('*')
            .limit(1)
            .single();
          if (!error && data) {
            return {
              upi_id: data.upi_id,
              payee_name: data.payee_name,
              static_qr_url: data.static_qr_url,
              auto_approve: data.auto_approve,
              test_mode: data.test_mode
            };
          }
        } catch (e) {
          console.warn("Supabase getPaymentSettings failed, using LocalStorage:", e);
        }
      }
      const db = loadDB();
      if (!db.payment_settings) {
        db.payment_settings = {
          upi_id: 'payment@psychologysphere',
          payee_name: 'Psychology Sphere',
          static_qr_url: '',
          auto_approve: true,
          test_mode: false
        };
        saveDB(db);
      }
      return db.payment_settings;
    },

    savePaymentSettings: async function (settings) {
      if (supabaseClient) {
        try {
          await supabaseClient
            .from('payment_settings')
            .upsert({
              id: 1,
              upi_id: settings.upi_id,
              payee_name: settings.payee_name,
              static_qr_url: settings.static_qr_url,
              auto_approve: settings.auto_approve,
              test_mode: settings.test_mode,
              updated_at: new Date().toISOString()
            });
        } catch (e) {
          console.error("Supabase savePaymentSettings failed:", e);
        }
      }
      const db = loadDB();
      db.payment_settings = {
        upi_id: settings.upi_id,
        payee_name: settings.payee_name,
        static_qr_url: settings.static_qr_url || '',
        auto_approve: settings.auto_approve !== false,
        test_mode: settings.test_mode === true
      };
      saveDB(db);
      return true;
    },

    getAllPayments: async function () {
      if (supabaseClient) {
        try {
          // Fetch payments
          const { data: paymentsData, error: payErr } = await supabaseClient
            .from('payments')
            .select('*')
            .order('date', { ascending: false });
          if (payErr) throw payErr;

          // Fetch student profiles
          const { data: profilesData, error: profErr } = await supabaseClient
            .from('profiles')
            .select('id, full_name')
            .eq('role', 'student');
          
          const profileMap = {};
          if (!profErr && profilesData) {
            profilesData.forEach(p => {
              profileMap[p.id] = p.full_name;
            });
          }

          if (paymentsData) {
            return paymentsData.map(p => ({
              id: p.id,
              studentId: p.student_id,
              studentName: profileMap[p.student_id] || 'Unknown Student',
              courseId: p.course_id,
              description: p.description,
              amount: p.amount ? p.amount.toString() : '0',
              status: p.status,
              date: p.date,
              monthsCovered: p.months_covered,
              yearCovered: p.year_covered,
              transactionId: p.transaction_id || (p.description && p.description.includes('(UTR: ') ? p.description.split('(UTR: ')[1].replace(')', '') : null)
            }));
          }
        } catch (e) {
          console.warn("Supabase getAllPayments failed, falling back to LocalStorage:", e);
        }
      }
      const db = loadDB();
      const payments = db.payments || [];
      const profiles = db.profiles || [];
      return payments.map(p => {
        const student = profiles.find(pr => pr.id === p.student_id);
        return {
          id: p.id,
          studentId: p.student_id,
          studentName: student ? student.full_name : 'Unknown Student',
          courseId: p.course_id,
          description: p.description,
          amount: p.amount,
          status: p.status,
          date: p.date,
          monthsCovered: p.monthsCovered,
          yearCovered: p.yearCovered,
          transactionId: p.transactionId || (p.description && p.description.includes('(UTR: ') ? p.description.split('(UTR: ')[1].replace(')', '') : null)
        };
      });
    },

    approvePayment: async function (paymentId) {
      if (supabaseClient) {
        try {
          await supabaseClient
            .from('payments')
            .update({ status: 'paid' })
            .eq('id', paymentId);
        } catch (e) {
          console.error("Supabase approvePayment failed:", e);
        }
      }
      const db = loadDB();
      const payment = db.payments?.find(p => p.id === paymentId);
      if (payment) {
        payment.status = 'paid';
        saveDB(db);
        return true;
      }
      return false;
    },

    rejectPayment: async function (paymentId) {
      if (supabaseClient) {
        try {
          await supabaseClient
            .from('payments')
            .update({ status: 'failed' })
            .eq('id', paymentId);
        } catch (e) {
          console.error("Supabase rejectPayment failed:", e);
        }
      }
      const db = loadDB();
      const payment = db.payments?.find(p => p.id === paymentId);
      if (payment) {
        payment.status = 'failed';
        saveDB(db);
        return true;
      }
      return false;
    },

    isLive: function () {
      return supabaseClient !== null;
    },

    // Reset database back to default LocalStorage states
    reset: async function () {
      if (supabaseClient) {
        try {
          // Clear courses on live DB
          await supabaseClient.from('courses').delete().neq('id', 0);
        } catch (e) {
          console.error("Failed to reset courses in Supabase: ", e);
        }
      }
      saveDB(defaultDB);
      return defaultDB;
    }
  };

  // Attach to window global
  global.AppDB = AppDB;

})(window);
