import type { Notice, User } from '@/types';

export const MOCK_ADMIN: User = {
  id: '1',
  name: 'Admin',
  email: 'admin@noticeboard.edu',
  role: 'admin',
};

export const MOCK_NOTICES: Notice[] = [
  {
    id: '1',
    title: 'End Semester Examination Schedule 2024',
    description:
      'The End Semester Examinations for all departments will commence from May 15, 2024. Students are advised to check the detailed schedule on the university portal. Hall tickets can be downloaded from the student dashboard. Ensure you carry a valid ID proof along with the hall ticket.',
    category: 'Academic',
    status: 'active',
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 10).toISOString(), // 10h
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    author: 'Admin',
    attachments: [
      { id: 'a1', name: 'exam_schedule.pdf', url: '#', type: 'pdf', size: 245000 },
    ],
    isPinned: true,
    views: 1240,
  },
  {
    id: '2',
    title: 'Annual Sports Meet Registration Open',
    description:
      'Registrations are now open for the Annual Sports Meet 2024. Students can participate in athletics, swimming, basketball, football, cricket, and badminton. Last date to register is April 30, 2024. Contact the Sports Department for more details.',
    category: 'Sports',
    status: 'active',
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    author: 'Admin',
    attachments: [],
    isPinned: false,
    views: 567,
  },
  {
    id: '3',
    title: 'URGENT: Campus Wi-Fi Maintenance Tonight',
    description:
      'The campus network will undergo scheduled maintenance tonight from 11 PM to 3 AM. All internet services will be temporarily unavailable during this window. Please plan your work accordingly and download any necessary resources before 10 PM.',
    category: 'Urgent',
    status: 'active',
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(), // 6h
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    author: 'Admin',
    attachments: [],
    isPinned: true,
    views: 2103,
  },
  {
    id: '4',
    title: 'Cultural Fest "Rhythm 2024" — Call for Performers',
    description:
      'We are looking for talented performers for our Annual Cultural Fest "Rhythm 2024" scheduled on May 20-22. Categories include dance, music, drama, standup comedy, and fine arts. Submit your applications along with a 2-minute performance video.',
    category: 'Cultural',
    status: 'active',
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    author: 'Admin',
    attachments: [
      { id: 'a2', name: 'fest_poster.png', url: 'https://picsum.photos/seed/fest/800/600', type: 'image', size: 180000 },
    ],
    isPinned: false,
    views: 890,
  },
  {
    id: '5',
    title: 'Library Subscription Update — New Journals Added',
    description:
      'The library has subscribed to 15 new international journals in Engineering, Sciences, and Humanities. Access them via the library portal using your student credentials. Physical copies will also be available at the reference section from next week.',
    category: 'Administrative',
    status: 'active',
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    author: 'Admin',
    attachments: [
      { id: 'a3', name: 'journal_list.pdf', url: '#', type: 'pdf', size: 95000 },
    ],
    isPinned: false,
    views: 320,
  },
  {
    id: '6',
    title: 'Guest Lecture: Machine Learning in Healthcare',
    description:
      'Dr. Priya Sharma, CTO of MedAI Labs, will deliver a guest lecture on the applications of Machine Learning in modern healthcare. The lecture will be held in the Main Auditorium on April 28, 2024 at 2 PM. All students and faculty are welcome.',
    category: 'Events',
    status: 'active',
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(), // 18h
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    author: 'Admin',
    attachments: [],
    isPinned: false,
    views: 455,
  },
  {
    id: '7',
    title: 'Fee Payment Deadline Reminder',
    description:
      'This is a reminder that the last date for payment of tuition fees for the upcoming semester is April 30, 2024. Students who fail to pay by the deadline will be charged a late fee of Rs. 500 per day. Payments can be made through the student portal or at the accounts office.',
    category: 'Administrative',
    status: 'expired',
    expiryDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    author: 'Admin',
    attachments: [],
    isPinned: false,
    views: 3421,
  },
  {
    id: '8',
    title: 'Inter-College Hackathon 2024',
    description:
      'Register your teams for the Inter-College Hackathon 2024! Problem statements will be released on the day of the event. Teams of 2-4 students are eligible. Prizes worth Rs. 1,00,000 to be won. Registration closes April 25, 2024.',
    category: 'Events',
    status: 'active',
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    author: 'Admin',
    attachments: [
      { id: 'a4', name: 'hackathon_brochure.pdf', url: '#', type: 'pdf', size: 320000 },
    ],
    isPinned: false,
    views: 1876,
  },
];
