export type Language = 'th' | 'en';

export const translations = {
  en: {
    brandSubtitle: 'Meeting Rooms',
    myBookings: 'My Bookings',
    signInDemo: 'Sign In / Demo',
    signOut: 'Sign Out',
    adminBadge: 'ADMIN',
    
    // Hero
    heroBadge: 'Workspace Management',
    heroTitle: 'Modern Conference & Meeting Room Booking',
    heroDesc: 'Effortlessly discover, schedule, and manage meeting spaces for your team. Real-time availability tracking with intelligent collision conflict prevention.',
    statRooms: 'Available Rooms',
    statCapacity: 'Total Capacity',
    statToday: "Today's Bookings",
    statStatus: 'System Status',
    statusActive: 'Operational',
    bookNowBtn: 'Book a Room',
    viewScheduleBtn: 'View Schedule',
    
    // Banner
    conflictActive: 'Collision Conflict Detection Active:',
    conflictDesc: 'If you try to book any room during a time slot that overlaps with an existing reservation, the server executes',
    conflictAction: 'and immediately returns a clean 409 Conflict response with details of who booked it.',
    
    // Schedule
    scheduleTitle: 'Room Availability Timeline',
    scheduleDesc: 'Real-time visual schedule. Avoid overlapping reservations.',
    dateLabel: 'Date:',
    availableAllDay: 'Available all day',
    bookSlot: '+ Book Slot',
    
    // Rooms
    roomsTitle: 'Conference Rooms',
    roomsDesc: 'Select any room below to reserve custom time slots',
    quickReservation: '+ Quick Reservation',
    seats: 'seats',
    instantConfirmation: 'Instant Confirmation',
    bookRoom: 'Book Room',
    
    // Booking Modal
    modalSubtitle: 'Reservation',
    modalTitle: 'Book a Meeting Room',
    modalDesc: 'Select date and time slot. Collision conflict detection is applied automatically.',
    selectRoomLabel: 'Select Room',
    meetingTitleLabel: 'Meeting Title',
    meetingTitlePlaceholder: 'e.g. Q4 Sprint Planning, Client Pitch',
    dateLabelModal: 'Date',
    startTimeLabel: 'Start Time',
    endTimeLabel: 'End Time',
    cancelButton: 'Cancel',
    confirmButton: 'Confirm Reservation',
    checkingCollision: 'Checking collision...',
    
    // My Bookings
    myBookingsTitle: 'My Meeting Bookings',
    myBookingsDesc: 'Manage your upcoming and past room reservations',
    noBookings: "You haven't booked any rooms yet.",
    cancelBookingConfirm: 'Are you sure you want to cancel this booking?',
    
    // Auth Modal
    signInTitle: 'Sign in to RoomReserve',
    registerTitle: 'Create an Account',
    signInDesc: 'Access your reservations and manage bookings',
    registerDesc: 'Register to book meeting rooms',
    demoTitle: '1-Click Demo Accounts (Instant Test)',
    demoUser: 'Employee Demo',
    demoAdmin: 'Admin Demo',
    fullNameLabel: 'Full Name',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    alreadyHaveAccount: 'Already have an account? Sign In',
    noAccount: "Don't have an account? Register",
    signInGoogle: 'Continue with Google',
    signInGithub: 'Continue with GitHub',
    orContinueWith: 'Or continue with credentials',
    oauthDemoNotice: 'Demo OAuth mode is active (set API keys in .env for production)',
    
    // Footer
    footerText: 'RoomReserve • Modern Meeting Room Management System',
    footerDeploy: 'Corporate Workspace Solution',

    // Toast & Notifications
    toastBookingSuccess: 'Meeting room booked successfully!',
    toastCancelSuccess: 'Booking cancelled successfully.',
    toastRoomCreated: 'Room created successfully.',
    toastRoomUpdated: 'Room updated successfully.',
    toastRoomDeleted: 'Room deleted successfully.',
    
    // Booking Validations
    errPastTime: 'Cannot select a start time in the past for today.',
    errMaxDuration: 'Booking duration cannot exceed 4 hours per reservation.',
    errMaxAdvance: 'Cannot book more than 30 days in advance.',
    errRoomMaintenance: 'This room is currently under maintenance and cannot be booked.',
    durationNotice: 'Duration',
    maxDurationNotice: '(Max 4 hrs)',

    // Admin Dashboard
    adminDashboardBtn: 'Admin Dashboard',
    adminModalTitle: 'System Management',
    adminModalDesc: 'Configure conference rooms, toggle maintenance, and oversee company reservations.',
    tabRooms: 'Room Management',
    tabBookings: 'All Reservations',
    addRoomBtn: '+ Add Room',
    editRoomTitle: 'Edit Room',
    createRoomTitle: 'Add New Room',
    roomNameLabel: 'Room Name',
    roomCapacityLabel: 'Capacity (Seats)',
    roomLocationLabel: 'Location',
    roomAmenitiesLabel: 'Amenities (e.g. Projector, TV)',
    maintenanceLabel: 'Maintenance Mode (Temporarily Closed)',
    maintenanceBadge: 'Under Maintenance',
    activeBadge: 'Available',
    toggleMaintenance: 'Toggle Maintenance',
    confirmDeleteRoom: 'Are you sure you want to delete this room? All associated bookings will be removed.',
    adminCancelBookingConfirm: 'Are you sure you want to cancel this reservation as Admin?',
    searchBookingsPlaceholder: 'Search by meeting title, room, or user...',
    allBookingsCount: 'Total Bookings',
    saveRoomBtn: 'Save Room',

    // Search & Filter
    searchRoomPlaceholder: 'Search by room name, floor, or amenities...',
    filterCapacity: 'Capacity',
    allCapacities: 'All Sizes',
    smallRoom: '1 - 4 seats',
    mediumRoom: '5 - 10 seats',
    largeRoom: '11+ seats',
    filterAmenities: 'Amenities',
    allAmenities: 'All Equipment',
    availableOnly: 'Available only',
    clearFilters: 'Clear Filters',
    roomsFound: 'rooms found',
    noRoomsMatch: 'No conference rooms match your filter criteria.',
    resetFilterBtn: 'Reset Filters',
    filtersBtn: 'Filters',
    hideFiltersBtn: 'Hide Filters',
    statusFilter: 'Availability',

    // Check-in & Auto-Release
    checkInBtn: 'Check-in to Room',
    checkInSuccess: 'Checked in successfully! Room is ready for your meeting.',
    checkedInBadge: 'Checked In',
    pendingCheckInBadge: 'Pending Check-in',
    checkInWindowNotice: 'Check-in opens 15m before start time',
    autoReleasedBadge: 'Auto-Released (No-Show)',
    statusCheckedIn: 'Checked In',
    statusAutoReleased: 'Auto-Released (No-Show)',
  },
  th: {
    brandSubtitle: 'ระบบจองห้องประชุม',
    myBookings: 'การจองของฉัน',
    signInDemo: 'เข้าสู่ระบบ / บัญชีทดสอบ',
    signOut: 'ออกจากระบบ',
    adminBadge: 'ผู้ดูแลระบบ',
    
    // Hero
    heroBadge: 'ระบบบริหารพื้นที่ประชุม',
    heroTitle: 'ระบบจองห้องประชุมออนไลน์สำหรับองค์กร',
    heroDesc: 'ค้นหาและจองห้องประชุมที่พร้อมใช้งานสำหรับทีมของคุณได้อย่างสะดวกรวดเร็ว ตรวจสอบคิวว่างแบบเรียลไทม์ และมีระบบป้องกันการจองเวลาชนกันอัตโนมัติ',
    statRooms: 'ห้องประชุมที่พร้อมใช้งาน',
    statCapacity: 'ความจุรวมทั้งหมด',
    statToday: 'รายการจองวันนี้',
    statStatus: 'สถานะระบบ',
    statusActive: 'พร้อมให้บริการ',
    bookNowBtn: 'จองห้องประชุมทันที',
    viewScheduleBtn: 'ดูตารางการจอง',
    
    // Banner
    conflictActive: 'ระบบป้องกันการจองเวลาซ้อนทำงานอยู่:',
    conflictDesc: 'หากคุณพยายามจองห้องในช่วงเวลาที่คาบเกี่ยวกับคิวจองเดิมที่มีอยู่แล้ว ระบบหลังบ้านจะคำนวณผ่านสมการ',
    conflictAction: 'และปฏิเสธทันทีด้วยรหัส HTTP 409 Conflict พร้อมแสดงชื่อผู้จองก่อนหน้า',
    
    // Schedule
    scheduleTitle: 'ไทม์ไลน์สถานะห้องประชุม',
    scheduleDesc: 'ตรวจสอบตารางคิวห้องแบบเรียลไทม์ หลีกเลี่ยงการจองเวลาชนกัน',
    dateLabel: 'วันที่:',
    availableAllDay: 'ว่างตลอดทั้งวัน',
    bookSlot: '+ จองเวลานี้',
    
    // Rooms
    roomsTitle: 'ห้องประชุมทั้งหมด',
    roomsDesc: 'เลือกห้องประชุมที่ต้องการเพื่อระบุช่วงเวลาการจอง',
    quickReservation: '+ จองด่วน',
    seats: 'ที่นั่ง',
    instantConfirmation: 'ยืนยันการจองทันที',
    bookRoom: 'จองห้องนี้',
    
    // Booking Modal
    modalSubtitle: 'การจองห้อง',
    modalTitle: 'แบบฟอร์มจองห้องประชุม',
    modalDesc: 'เลือกวันที่และระบุช่วงเวลา ระบบจะตรวจสอบเวลาชนกันให้อัตโนมัติ',
    selectRoomLabel: 'เลือกห้องประชุม',
    meetingTitleLabel: 'หัวข้อการประชุม',
    meetingTitlePlaceholder: 'เช่น วางแผนประจำสัปดาห์, นัดคุยงานลูกค้า',
    dateLabelModal: 'วันที่',
    startTimeLabel: 'เวลาเริ่มต้น',
    endTimeLabel: 'เวลาสิ้นสุด',
    cancelButton: 'ยกเลิก',
    confirmButton: 'ยืนยันการจอง',
    checkingCollision: 'กำลังตรวจสอบเวลาชนกัน...',
    
    // My Bookings
    myBookingsTitle: 'รายการจองของฉัน',
    myBookingsDesc: 'ดูและจัดการรายการจองห้องประชุมทั้งหมดของคุณ',
    noBookings: 'คุณยังไม่มีรายการจองห้องประชุมในขณะนี้',
    cancelBookingConfirm: 'คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้?',
    
    // Auth Modal
    signInTitle: 'เข้าสู่ระบบ RoomReserve',
    registerTitle: 'ลงทะเบียนบัญชีใหม่',
    signInDesc: 'เข้าสู่ระบบเพื่อจองห้องและจัดการรายการของคุณ',
    registerDesc: 'สมัครสมาชิกเพื่อเริ่มต้นใช้งานระบบจองห้องประชุม',
    demoTitle: 'ปุ่มลัดบัญชีทดสอบ 1-Click (สำหรับทดลองเล่นทันที)',
    demoUser: 'ทดสอบสิทธิ์พนักงาน',
    demoAdmin: 'ทดสอบสิทธิ์ผู้ดูแลระบบ',
    fullNameLabel: 'ชื่อ - นามสกุล',
    emailLabel: 'อีเมล',
    passwordLabel: 'รหัสผ่าน',
    alreadyHaveAccount: 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ',
    noAccount: 'ยังไม่มีบัญชี? สมัครสมาชิก',
    signInGoogle: 'เข้าสู่ระบบด้วย Google',
    signInGithub: 'เข้าสู่ระบบด้วย GitHub',
    orContinueWith: 'หรือเข้าสู่ระบบด้วยอีเมล',
    oauthDemoNotice: 'ใช้งานโหมด Demo OAuth (ตั้งค่า API keys ใน .env เพื่อเชื่อมต่อจริง)',
    
    // Footer
    footerText: 'RoomReserve • Modern Meeting Room Management System',
    footerDeploy: 'Corporate Workspace Solution',

    // Toast & Notifications
    toastBookingSuccess: 'จองห้องประชุมสำเร็จเรียบร้อยแล้ว!',
    toastCancelSuccess: 'ยกเลิกการจองเรียบร้อยแล้ว',
    toastRoomCreated: 'เพิ่มห้องประชุมใหม่สำเร็จ',
    toastRoomUpdated: 'อัปเดตข้อมูลห้องประชุมสำเร็จ',
    toastRoomDeleted: 'ลบห้องประชุมสำเร็จ',
    
    // Booking Validations
    errPastTime: 'ไม่สามารถเลือกเวลาเริ่มต้นที่ผ่านมาแล้วในวันนี้ได้',
    errMaxDuration: 'ระยะเวลาการจองต้องไม่เกิน 4 ชั่วโมงต่อครั้ง',
    errMaxAdvance: 'ไม่สามารถจองล่วงหน้าเกิน 30 วันได้',
    errRoomMaintenance: 'ห้องประชุมนี้กำลังปิดปรับปรุงชั่วคราว ไม่สามารถจองได้',
    durationNotice: 'ระยะเวลา',
    maxDurationNotice: '(สูงสุด 4 ชม.)',

    // Admin Dashboard
    adminDashboardBtn: 'จัดการระบบ',
    adminModalTitle: 'ศูนย์จัดการระบบสำหรับผู้ดูแล (Admin Control)',
    adminModalDesc: 'จัดการห้องประชุม, สลับโหมดปิดปรับปรุง, และดูแลรายการจองทั้งหมดในองค์กร',
    tabRooms: 'จัดการห้องประชุม',
    tabBookings: 'รายการจองทั้งหมดในองค์กร',
    addRoomBtn: '+ เพิ่มห้องประชุม',
    editRoomTitle: 'แก้ไขข้อมูลห้องประชุม',
    createRoomTitle: 'เพิ่มห้องประชุมใหม่',
    roomNameLabel: 'ชื่อห้องประชุม',
    roomCapacityLabel: 'ความจุ (ที่นั่ง)',
    roomLocationLabel: 'สถานที่ตั้ง / ชั้น',
    roomAmenitiesLabel: 'อุปกรณ์และสิ่งอำนวยความสะดวก (เช่น 4K TV, จอโปรเจกเตอร์)',
    maintenanceLabel: 'โหมดปิดปรับปรุง (ปิดใช้งานชั่วคราว)',
    maintenanceBadge: 'ปิดปรับปรุงชั่วคราว',
    activeBadge: 'พร้อมใช้งาน',
    toggleMaintenance: 'สลับโหมดปิดปรับปรุง',
    confirmDeleteRoom: 'คุณแน่ใจหรือไม่ว่าต้องการลบห้องนี้? ประวัติการจองทั้งหมดที่เกี่ยวข้องจะถูกลบไปด้วย',
    adminCancelBookingConfirm: 'คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้ในฐานะผู้ดูแลระบบ?',
    searchBookingsPlaceholder: 'ค้นหาจากหัวข้อ, ชื่อห้อง, หรือผู้จอง...',
    allBookingsCount: 'รายการจองทั้งหมด',
    saveRoomBtn: 'บันทึกข้อมูล',

    // Search & Filter
    searchRoomPlaceholder: 'ค้นหาชื่อห้อง, ชั้น, หรืออุปกรณ์...',
    filterCapacity: 'ความจุห้อง',
    allCapacities: 'ทุกขนาด',
    smallRoom: '1 - 4 ที่นั่ง',
    mediumRoom: '5 - 10 ที่นั่ง',
    largeRoom: '11+ ที่นั่ง',
    filterAmenities: 'อุปกรณ์',
    allAmenities: 'อุปกรณ์ทั้งหมด',
    availableOnly: 'เฉพาะห้องพร้อมใช้งาน',
    clearFilters: 'ล้างตัวกรอง',
    roomsFound: 'ห้องที่ตรงเงื่อนไข',
    noRoomsMatch: 'ไม่พบห้องประชุมที่ตรงกับเงื่อนไขการค้นหา',
    resetFilterBtn: 'รีเซ็ตตัวกรอง',
    filtersBtn: 'ตัวกรอง',
    hideFiltersBtn: 'ซ่อนตัวกรอง',
    statusFilter: 'สถานะห้อง',

    // Check-in & Auto-Release
    checkInBtn: 'เช็คอินเข้าห้อง',
    checkInSuccess: 'เช็คอินสำเร็จ! ยืนยันการเข้าใช้งานห้องประชุมเรียบร้อย',
    checkedInBadge: 'เช็คอินแล้ว',
    pendingCheckInBadge: 'รอเช็คอิน',
    checkInWindowNotice: 'เปิดให้เช็คอิน 15 นาทีก่อนเริ่ม',
    autoReleasedBadge: 'ยกเลิกอัตโนมัติ (ไม่มาเช็คอินใน 15 นาที)',
    statusCheckedIn: 'เช็คอินแล้ว',
    statusAutoReleased: 'ปล่อยห้อง (ไม่มาใช้)',
  },
};

export const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

export const EN_MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const EN_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatDateDMY(
  dateInput: string | Date,
  lang: Language,
  formatType: 'full' | 'short' = 'short'
): string {
  let day: number;
  let monthIdx: number;
  let year: number;

  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const parts = dateInput.split('-').map(Number);
    year = parts[0];
    monthIdx = parts[1] - 1;
    day = parts[2];
  } else {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return '';
    day = d.getDate();
    monthIdx = d.getMonth();
    year = d.getFullYear();
  }

  if (lang === 'th') {
    const thaiYear = year + 543;
    const monthStr = formatType === 'full' ? THAI_MONTHS_FULL[monthIdx] : THAI_MONTHS_SHORT[monthIdx];
    return `${day} ${monthStr} ${thaiYear}`;
  } else {
    const monthStr = formatType === 'full' ? EN_MONTHS_FULL[monthIdx] : EN_MONTHS_SHORT[monthIdx];
    return `${day} ${monthStr} ${year}`;
  }
}
