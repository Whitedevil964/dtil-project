// ============================================================
// REAL DATA FROM PDF: All Div (A-G) Time Table DYPCOEI
// FY B.Tech Semester II, 2025-2026, W.E.F. 09/02/2026
// ============================================================

import { ALL_STUDENTS } from './allStudents';

export { ALL_STUDENTS };

export const SUBJECTS = {
  AEC:  { name: 'Advanced Engineering Calculus',          abbr: 'AEC',  color: '#8b5cf6' },
  MEC:  { name: 'Modern Engineering Chemistry',           abbr: 'MEC',  color: '#f59e0b' },
  MEE:  { name: 'Modern Electrical Engineering',          abbr: 'MEE',  color: '#3b82f6' },
  GUI:  { name: 'Graphical User Interface',               abbr: 'GUI',  color: '#10b981' },
  OOP:  { name: 'Object Oriented Programming (C++)',      abbr: 'OOP',  color: '#e11d48' },
  ADE:  { name: 'Analog & Digital Electronics',           abbr: 'ADE',  color: '#06b6d4' },
  MEP:  { name: 'Modern Engineering Physics',             abbr: 'MEP',  color: '#a855f7' },
  MR:   { name: 'Mechanics for Robotics',                 abbr: 'MR',   color: '#f97316' },
  DTIL: { name: 'Design Thinking & Idea Lab',             abbr: 'DTIL', color: '#84cc16' },
  IKS:  { name: 'Indian Knowledge System',               abbr: 'IKS',  color: '#ec4899' },
  MPW:  { name: 'Manufacturing Practice Workshop',        abbr: 'MPW',  color: '#14b8a6' },
  PCS:  { name: 'Professional Communication Skills',      abbr: 'PCS',  color: '#6366f1' },
};

export const TEACHERS = {
  SNM: { name: 'Dr. S. N. Mali',       abbr: 'SNM', subjects: ['AEC'], id: 't_snm', email: 'snmali@dypcoei.edu.in',    password: 'teacher123' },
  PAD: { name: 'Dr. Purshootam Desai', abbr: 'PAD', subjects: ['AEC'], id: 't_pad', email: 'pdesai@dypcoei.edu.in',   password: 'teacher123' },
  AA:  { name: 'Dr. Alpana Adsul',     abbr: 'AA',  subjects: ['MEC'], id: 't_aa',  email: 'aadsul@dypcoei.edu.in',   password: 'teacher123' },
  MSA: { name: 'Mrs. Manisha Asane',   abbr: 'MSA', subjects: ['MEC'], id: 't_msa', email: 'masane@dypcoei.edu.in',   password: 'teacher123' },
  YDN: { name: 'Mr. Yogesh Nagvekar',  abbr: 'YDN', subjects: ['MEE','MR'], id: 't_ydn', email: 'ynagvekar@dypcoei.edu.in', password: 'teacher123' },
  SBM: { name: 'Mrs. Savita More',     abbr: 'SBM', subjects: ['MEE','ADE'], id: 't_sbm', email: 'smore@dypcoei.edu.in', password: 'teacher123' },
  SSP: { name: 'Mr. Sandesh Patil',    abbr: 'SSP', subjects: ['GUI','MR','IKS'], id: 't_ssp', email: 'spatil@dypcoei.edu.in', password: 'teacher123' },
  TBJ: { name: 'Ms. Tanuja Jaybhaye',  abbr: 'TBJ', subjects: ['GUI'], id: 't_tbj', email: 'tjaybhaye@dypcoei.edu.in', password: 'teacher123' },
  SMG: { name: 'Mr. Shubham Gade',     abbr: 'SMG', subjects: ['OOP'], id: 't_smg', email: 'sgade@dypcoei.edu.in',    password: 'teacher123' },
  SSJ: { name: 'Mr. Sujit Jalkote',    abbr: 'SSJ', subjects: ['OOP'], id: 't_ssj', email: 'sjalkote@dypcoei.edu.in', password: 'teacher123' },
  RAP: { name: 'Mr. Ramchandra Popale',abbr: 'RAP', subjects: ['ADE','AEC'], id: 't_rap', email: 'rpopale@dypcoei.edu.in', password: 'teacher123' },
  VS:  { name: 'Dr. Varsha Sase',      abbr: 'VS',  subjects: ['ADE','MEE'], id: 't_vs', email: 'vsase@dypcoei.edu.in', password: 'teacher123' },
  SSM: { name: 'Mrs. Sarita Mali',     abbr: 'SSM', subjects: ['MEP','AEC'], id: 't_ssm', email: 'smali@dypcoei.edu.in', password: 'teacher123' },
  PNB: { name: 'Mrs. Priyanka Bikkad', abbr: 'PNB', subjects: ['MEP','OOP'], id: 't_pnb', email: 'pbikkad@dypcoei.edu.in', password: 'teacher123' },
  SRS: { name: 'Dr. Sopan Shinde',     abbr: 'SRS', subjects: ['MR'], id: 't_srs', email: 'sshinde@dypcoei.edu.in', password: 'teacher123' },
  MBS: { name: 'Miss Mrunalini Shinde',abbr: 'MBS', subjects: ['MR','OOP','GUI'], id: 't_mbs', email: 'mshinde@dypcoei.edu.in', password: 'teacher123' },
  SNE: { name: 'Mr. Suraj Erbatnwar',  abbr: 'SNE', subjects: ['DTIL','IKS'], id: 't_sne', email: 'serbatnwar@dypcoei.edu.in', password: 'teacher123' },
  PJK: { name: 'Miss Pranali Kamble',  abbr: 'PJK', subjects: ['DTIL','OOP'], id: 't_pjk', email: 'pkamble@dypcoei.edu.in', password: 'teacher123' },
  PMR: { name: 'Dr. Pooja Raste',      abbr: 'PMR', subjects: ['IKS','MEP'], id: 't_pmr', email: 'praste@dypcoei.edu.in', password: 'teacher123' },
  RRJ: { name: 'Mrs. Rasika Jadhao',   abbr: 'RRJ', subjects: ['IKS','GUI'], id: 't_rrj', email: 'rjadhao@dypcoei.edu.in', password: 'teacher123' },
  SMK: { name: 'Mr. Shubham Kavhar',   abbr: 'SMK', subjects: ['MPW','MR'], id: 't_smk', email: 'skavhar@dypcoei.edu.in', password: 'teacher123' },
  AV:  { name: 'Miss Amisha Vasaikar', abbr: 'AV',  subjects: ['MPW','GUI'], id: 't_av',  email: 'avasaikar@dypcoei.edu.in', password: 'teacher123' },
  AP:  { name: 'Mr. Ashok Patil',      abbr: 'AP',  subjects: ['PCS','DTIL'], id: 't_ap',  email: 'apatil@dypcoei.edu.in', password: 'teacher123' },
  SJ:  { name: 'Mr. Siddhi Jadhav',    abbr: 'SJ',  subjects: ['PCS','MPW'], id: 't_sj',  email: 'sjadhav@dypcoei.edu.in', password: 'teacher123' },
};

// ============================
// DIVISION C – Class Room A026
// Class Teacher: Mr. Ramchandra Popale (RAP)
// ============================
// Timings: 1=9:15-10:15, 2=10:15-11:15, break 11:15-11:30
//          3=11:30-12:30, 4=12:30-1:30, lunch 1:30-2:15
//          5=2:15-3:15,   6=3:15-4:15
export const DIV_C_SCHEDULE = {
  monday: [
    { period: 1, time: '9:15 – 10:15',  subject: null,  teacher: null, room: null, note: 'Free' },
    { period: 2, time: '10:15 – 11:15', subject: null,  teacher: null, room: null, note: 'Free' },
    { period: 3, time: '11:30 – 12:30', subject: 'AEC', teacher: 'RAP', room: 'A026' },
    { period: 4, time: '12:30 – 1:30',  subject: 'OOP', teacher: 'PNB', room: 'A026' },
    { period: 5, time: '2:15 – 3:15',   subject: 'MEC', teacher: 'MSA', room: 'A026' },
    { period: 6, time: '3:15 – 4:15',   subject: 'GUI', teacher: 'AV',  room: 'A026' },
  ],
  tuesday: [
    { period: 1, time: '9:15 – 10:15',  subject: null,  teacher: null, room: null, note: 'Free' },
    { period: 2, time: '10:15 – 11:15', subject: null,  teacher: null, room: null, note: 'Free' },
    { period: 3, time: '11:30 – 12:30', subject: 'MEE', teacher: 'VS',  room: 'A026' },
    { period: 4, time: '12:30 – 1:30',  subject: 'AEC', teacher: 'RAP', room: 'A026' },
    { period: 5, time: '2:15 – 3:15',   subject: 'OOP', teacher: 'PNB', room: 'A026' },
    { period: 6, time: '3:15 – 4:15',   subject: 'MEC', teacher: 'MSA', room: 'A026' },
  ],
  wednesday: [
    { period: 1, time: '9:15 – 10:15',  subject: null,  teacher: null, room: null, note: 'Free' },
    { period: 2, time: '10:15 – 11:15', subject: null,  teacher: null, room: null, note: 'Free' },
    { period: 3, time: '11:30 – 12:30', subject: 'AEC', teacher: 'RAP', room: 'A026' },
    { period: 4, time: '12:30 – 1:30',  subject: 'MEE', teacher: 'VS',  room: 'A026' },
    { period: 5, time: '2:15 – 3:15',   subject: 'AEC', teacher: 'RAP', room: 'A026' },  // Tutorial C1
    { period: 6, time: '3:15 – 4:15',   subject: 'MEC', teacher: 'MSA', room: 'A026' },
  ],
  thursday: [
    { period: 1, time: '9:15 – 10:15',  subject: null,  teacher: null, room: null, note: 'Free' },
    { period: 2, time: '10:15 – 11:15', subject: null,  teacher: null, room: null, note: 'Free' },
    { period: 3, time: '11:30 – 12:30', subject: 'AEC', teacher: 'RAP', room: 'A026' },
    { period: 4, time: '12:30 – 1:30',  subject: 'GUI', teacher: 'AV',  room: 'A026' },
    { period: 5, time: '2:15 – 3:15',   subject: 'AEC', teacher: 'RAP', room: 'A026' }, // Tutorial C2
    { period: 6, time: '3:15 – 4:15',   subject: null,  teacher: null, room: null, note: 'TG Contact Hour' },
  ],
  friday: [
    { period: 3, time: '11:30 – 12:30', subject: 'DTIL', teacher: 'AP', room: 'A026', note: 'C1 only' },
    { period: 4, time: '12:30 – 1:30',  subject: null,   teacher: null, room: null, note: 'Library Hours' },
    { period: 5, time: '2:15 – 3:15',   subject: 'AEC',  teacher: 'RAP', room: 'A026' }, // Tutorial C3
    { period: 6, time: '3:15 – 4:15',   subject: 'DTIL', teacher: 'AP', room: 'A026', note: 'C1 Lab' },
  ],
};

// All divisions' class teachers
export const DIVISIONS = {
  A: { classTeacher: 'Mrs. Savita More (SBM)', room: 'A022' },
  B: { classTeacher: 'Dr. Purshootam Desai (PAD)', room: 'A023' },
  C: { classTeacher: 'Mr. Ramchandra Popale (RAP)', room: 'A026' },
  D: { classTeacher: 'Mrs. Manisha Asane (MSA)', room: 'A0212' },
  E: { classTeacher: 'Mrs. Rasika Jadhao (RRJ)', room: 'A0213' },
  F: { classTeacher: 'Dr. Pooja Raste (PMR)', room: 'A0210' },
  G: { classTeacher: 'Miss Pranali Kamble (PJK)', room: 'A0211' },
};

// All students from PDF are now in ALL_STUDENTS
