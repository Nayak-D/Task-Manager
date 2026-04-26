require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');
const Notice = require('../models/Notice');

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany({});
  await Notice.deleteMany({});

  // Create admin user — plain passwords, the pre('save') hook hashes them
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@college.edu',
    password: 'admin123',
    role: 'admin',
  });

  // Create student user
  await User.create({
    name: 'Student User',
    email: 'student@college.edu',
    password: 'student123',
    role: 'student',
  });

  const now = new Date();
  const future = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const notices = [
    {
      title: 'Mid-Term Exam Schedule',
      description: 'The mid-term examination schedule has been released. All students must check their respective timetables and report to the examination hall 15 minutes early. No electronic devices are permitted.',
      category: 'Exam',
      expiryDate: future(7),
      isPinned: true,
      emailAlert: true,
      author: admin.name,
      authorId: admin._id,
    },
    {
      title: 'Diwali Holiday Notice',
      description: 'The college will remain closed from October 28 to November 2 on account of Diwali celebrations. All classes and administrative offices will resume on November 3.',
      category: 'Holiday',
      expiryDate: future(10),
      isPinned: false,
      emailAlert: true,
      author: admin.name,
      authorId: admin._id,
    },
    {
      title: 'Urgent: Campus WiFi Maintenance',
      description: 'The campus WiFi network will undergo emergency maintenance tonight from 11 PM to 3 AM. Please save your work and log out of all college systems before 10:45 PM.',
      category: 'Urgent',
      expiryDate: future(1),
      isPinned: true,
      emailAlert: true,
      author: admin.name,
      authorId: admin._id,
    },
    {
      title: 'Final Exam Hall Tickets Available',
      description: 'Hall tickets for the final semester examinations are now available for download from the student portal. Students who have pending fees will not be issued hall tickets.',
      category: 'Exam',
      expiryDate: future(14),
      isPinned: false,
      emailAlert: false,
      author: admin.name,
      authorId: admin._id,
    },
    {
      title: 'Summer Vacation Schedule',
      description: 'Summer vacation will commence from May 15 and classes will resume on June 10. The hostel will remain partially operational. Contact the admin office for more details.',
      category: 'Holiday',
      expiryDate: future(20),
      isPinned: false,
      emailAlert: false,
      author: admin.name,
      authorId: admin._id,
    },
    {
      title: 'Annual Cultural Fest Registrations Open',
      description: 'Registrations for the Annual Cultural Fest are now open. Students can participate in dance, music, drama, and art competitions. Last date for registration is next Friday.',
      category: 'Cultural',
      expiryDate: future(5),
      isPinned: false,
      emailAlert: false,
      author: admin.name,
      authorId: admin._id,
    },
    {
      title: 'Library Timing Changes',
      description: 'The central library will now operate from 8 AM to 9 PM on weekdays and 9 AM to 5 PM on weekends starting next month. Plan your study sessions accordingly.',
      category: 'Administrative',
      expiryDate: future(30),
      isPinned: false,
      emailAlert: false,
      author: admin.name,
      authorId: admin._id,
    },
    {
      title: 'Draft: Upcoming Sports Day',
      description: 'Sports Day will be held on the college grounds. More details to follow.',
      category: 'Sports',
      expiryDate: future(15),
      status: 'draft',
      isPinned: false,
      emailAlert: false,
      author: admin.name,
      authorId: admin._id,
    },
    {
      title: 'Scheduled: Semester Results',
      description: 'Semester results will be published on the student portal. Students will receive email notifications.',
      category: 'Academic',
      expiryDate: future(5),
      status: 'scheduled',
      scheduledAt: future(2),
      isPinned: false,
      emailAlert: true,
      author: admin.name,
      authorId: admin._id,
    },
  ];

  await Notice.insertMany(notices);

  console.log('✅ Database seeded successfully!');
  console.log('Admin credentials:   admin@college.edu / admin123');
  console.log('Student credentials: student@college.edu / student123');
  process.exit(0);
};

seedData().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
