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

  // Initial Seed Data
  const defaultDB = {
    courses: [
      {
        id: '1',
        title: 'UGC NET Psychology',
        description: 'Complete preparation for UGC NET entrance exam with comprehensive syllabus coverage.',
        duration: '6 Months',
        fees: '8999',
        faculty: 'Dr. Sarah Jenkins',
        image: 'images/course_ugc_net.png',
        batches: [
          { id: '1_online', type: 'Online', name: 'Batch 1', timings: 'Mon, Wed, Fri 8 AM' },
          { id: '1_offline', type: 'Offline', name: 'Batch 2', timings: 'Mon 2 PM, Wed 5 PM, Sat 7 PM' },
          { id: '1_custom', type: 'Custom', name: 'Custom', timings: 'Flexible Timings' }
        ]
      },
      {
        id: '2',
        title: 'MA Psychology',
        description: 'In-depth learning for future leaders. Advanced counseling theories and practices.',
        duration: '2 Years',
        fees: '24000',
        faculty: 'Dr. Rajesh Kumar',
        image: 'images/course_ma.png',
        batches: [
          { id: '2_online', type: 'Online', name: 'Batch 1', timings: 'Mon, Wed, Fri 8 AM' },
          { id: '2_offline', type: 'Offline', name: 'Batch 2', timings: 'Mon 2 PM, Wed 5 PM, Sat 7 PM' },
          { id: '2_custom', type: 'Custom', name: 'Custom', timings: 'Flexible Timings' }
        ]
      },
      {
        id: '3',
        title: 'CUET PG Psychology',
        description: 'Crack CUET PG with confidence. Specialized mock tests and concepts.',
        duration: '3 Months',
        fees: '6999',
        faculty: 'Dr. Sarah Jenkins',
        image: 'images/course_cuet.png',
        batches: [
          { id: '3_online', type: 'Online', name: 'Batch 1', timings: 'Mon, Wed, Fri 8 AM' },
          { id: '3_offline', type: 'Offline', name: 'Batch 2', timings: 'Mon 2 PM, Wed 5 PM, Sat 7 PM' },
          { id: '3_custom', type: 'Custom', name: 'Custom', timings: 'Flexible Timings' }
        ]
      },
      {
        id: '4',
        title: 'TISSNET Psychology',
        description: 'Specialized coaching for TISSNET entrance. Structured curriculum and guidance.',
        duration: '3 Months',
        fees: '7499',
        faculty: 'Prof. Ananya Sen',
        image: 'images/course_tissnet.png',
        batches: [
          { id: '4_online', type: 'Online', name: 'Batch 1', timings: 'Mon, Wed, Fri 8 AM' },
          { id: '4_offline', type: 'Offline', name: 'Batch 2', timings: 'Mon 2 PM, Wed 5 PM, Sat 7 PM' },
          { id: '4_custom', type: 'Custom', name: 'Custom', timings: 'Flexible Timings' }
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
      if (!data.courses || !data.faculty || !data.assets) {
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
          const db = loadDB();
          return db.faculty;
        }
      } else {
        const db = loadDB();
        return db.faculty;
      }
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
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('email', email)
            .limit(1)
            .maybeSingle();
          if (error) throw error;
          return data;
        } catch (e) {
          console.error("Supabase getProfileByEmail failed:", e);
          return null;
        }
      }
      return null;
    },

    createProfile: async function (profile) {
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient
            .from('profiles')
            .insert(profile)
            .select()
            .single();
          if (error) throw error;
          return data;
        } catch (e) {
          console.error("Supabase createProfile failed:", e);
          return null;
        }
      }
      return null;
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
          return true;
        } catch (e) {
          console.error("Supabase enrollInCourse failed:", e);
          throw e;
        }
      } else {
        const db = loadDB();
        if (!db.enrollments) db.enrollments = [];
        db.enrollments.push({
          id: Date.now().toString(),
          student_id: studentId,
          course_id: courseId.toString(),
          batch_id: batchId,
          status: 'active',
          enrolled_at: new Date().toISOString()
        });
        saveDB(db);
        return true;
      }
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
          console.error("Supabase getStudentAttendance failed:", e);
          return [];
        }
      }
      return [];
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
          console.error("Supabase getEnrolledStudents failed:", e);
          return [];
        }
      }
      return [];
    },

    getStudentEnrollments: async function (studentId) {
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient
            .from('enrollments')
            .select('*, courses(*)')
            .eq('student_id', studentId);
          if (error) throw error;
          
          if (!data) return [];

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

          return data.filter(e => e.courses !== null).map(e => {
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
              batch: batchDetails,
              status: e.status
            };
          });
        } catch (e) {
          console.error("Supabase getStudentEnrollments failed:", e);
          return [];
        }
      } else {
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
            batch: batchDetails,
            status: e.status
          };
        });
      }
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
