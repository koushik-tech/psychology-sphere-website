/* Psychology Sphere - Client-side Database Layer using LocalStorage */

(function (global) {
  const DB_KEY = 'psychology_sphere_db';

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
        image: 'images/course_ugc_net.png'
      },
      {
        id: '2',
        title: 'MA Psychology',
        description: 'In-depth learning for future leaders. Advanced counseling theories and practices.',
        duration: '2 Years',
        fees: '24000',
        faculty: 'Dr. Rajesh Kumar',
        image: 'images/course_ma.png'
      },
      {
        id: '3',
        title: 'CUET PG Psychology',
        description: 'Crack CUET PG with confidence. Specialized mock tests and concepts.',
        duration: '3 Months',
        fees: '6999',
        faculty: 'Dr. Sarah Jenkins',
        image: 'images/course_cuet.png'
      },
      {
        id: '4',
        title: 'TISSNET Psychology',
        description: 'Specialized coaching for TISSNET entrance. Structured curriculum and guidance.',
        duration: '3 Months',
        fees: '7499',
        faculty: 'Prof. Ananya Sen',
        image: 'images/course_tissnet.png'
      }
    ],
    faculty: [
      {
        id: '1',
        name: 'Dr. Sarah Jenkins',
        role: 'Ph.D. / Senior Lecturer',
        specialization: 'Clinical Counseling. 10+ Years of coaching entrance aspirants.',
        avatar: 'SJ',
        image: '' // empty by default, will fall back to initials unless Google Drive link is provided
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

  // Internal operations
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
        // Merge or reset
        const merged = Object.assign({}, defaultDB, data);
        saveDB(merged);
        return merged;
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

  // Expose the API
  const AppDB = {
    // Helper URL converter
    getGoogleDriveDirectLink: getGoogleDriveDirectLink,

    // Course Methods
    getCourses: function () {
      const db = loadDB();
      return db.courses;
    },
    saveCourse: function (course) {
      const db = loadDB();
      const existingIdx = db.courses.findIndex(c => c.id === course.id);
      if (existingIdx !== -1) {
        db.courses[existingIdx] = course;
      } else {
        db.courses.push(course);
      }
      saveDB(db);
      return course;
    },
    deleteCourse: function (id) {
      const db = loadDB();
      db.courses = db.courses.filter(c => c.id !== id);
      saveDB(db);
    },

    // Faculty Methods
    getFaculty: function () {
      const db = loadDB();
      return db.faculty;
    },
    saveFaculty: function (member) {
      const db = loadDB();
      const existingIdx = db.faculty.findIndex(f => f.id === member.id);
      if (existingIdx !== -1) {
        db.faculty[existingIdx] = member;
      } else {
        db.faculty.push(member);
      }
      saveDB(db);
      return member;
    },

    // Asset Methods
    getAssets: function () {
      const db = loadDB();
      return db.assets;
    },
    saveAsset: function (key, value) {
      const db = loadDB();
      db.assets[key] = value;
      saveDB(db);
      return value;
    },

    // Full Reset
    reset: function () {
      saveDB(defaultDB);
      return defaultDB;
    }
  };

  // Attach to window global
  global.AppDB = AppDB;

})(window);
