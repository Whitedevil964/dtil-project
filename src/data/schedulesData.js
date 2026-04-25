const P = {
  1: '9:15 – 10:15',
  2: '10:15 – 11:15',
  3: '11:30 – 12:30',
  4: '12:30 – 1:30',
  5: '2:15 – 3:15',
  6: '3:15 – 4:15'
};

function slot(period, subject, teacher, room, note = null) {
  return { period, time: P[period], subject, teacher, room, note };
}

function free(period, note = 'Free') {
  return { period, time: P[period], subject: null, teacher: null, room: null, note };
}

function prac(period, note) {
  return { period, time: P[period], subject: 'PRACTICAL', teacher: 'Various', room: 'Labs', note };
}

export const ALL_DIV_SCHEDULES = {
  A: {
    monday: [
      slot(1, 'AEC', 'SMG', 'A021'),
      slot(2, 'OOP', 'MBS', 'A021'),
      slot(3, 'AEC', 'SMG', 'A021', 'Tutorial A1/A2/A3'),
      free(4, 'TG Contact Hour'),
      prac(5, 'A1:GUI | A2:OOP | A3:DTIL'),
      prac(6, 'A1:GUI | A2:OOP | A3:DTIL'),
    ],
    tuesday: [
      slot(1, 'MEC', 'PAD', 'A021'),
      slot(2, 'AEC', 'SMG', 'A021'),
      slot(3, 'AEC', 'SMG', 'A021', 'Tutorial A2/A3/A1'),
      slot(4, 'MEC', 'PAD', 'A021'),
      prac(5, 'A1:MEC | A2:IKS | A3:MEE'),
      prac(6, 'A1:MEC | A2:IKS | A3:MEE'),
    ],
    wednesday: [
      slot(1, 'MEE', 'SSJ', 'A021'),
      free(2, 'Library Hours'),
      slot(3, 'AEC', 'SMG', 'A021', 'Tutorial A3/A1/A2'),
      slot(4, 'AEC', 'SMG', 'A021'),
      prac(5, 'A2:GUI | A3:OOP | A1:DTIL'),
      prac(6, 'A2:GUI | A3:OOP | A1:DTIL'),
    ],
    thursday: [
      slot(1, 'AEC', 'SMG', 'A021'),
      slot(2, 'MEE', 'SSJ', 'A021'),
      prac(3, 'A3:MEC | A1:IKS | A2:MEE'),
      prac(4, 'A3:MEC | A1:IKS | A2:MEE'),
      prac(5, 'A2:MEC | A3:IKS | A1:MEE'),
      prac(6, 'A2:MEC | A3:IKS | A1:MEE'),
    ],
    friday: [
      slot(1, 'GUI', 'SNM', 'A021'),
      slot(2, 'GUI', 'SNM', 'A021'),
      slot(3, 'OOP', 'MBS', 'A021'),
      slot(4, 'MEC', 'PAD', 'A021'),
      prac(5, 'A3:GUI | A1:OOP | A2:DTIL'),
      prac(6, 'A3:GUI | A1:OOP | A2:DTIL'),
    ]
  },
  B: {
    monday: [
      slot(1, 'MEE', 'SSJ', 'A023'),
      slot(2, 'MEC', 'PAD', 'A023'),
      prac(3, 'B1:MEC | B2:IKS | B3:MEE'),
      prac(4, 'B1:MEC | B2:IKS | B3:MEE'),
      slot(5, 'AEC', 'SMG', 'A023'),
      slot(6, 'AEC', 'SMG', 'A023', 'Tutorial B1/B3'),
    ],
    tuesday: [
      slot(1, 'OOP', 'MBS', 'A023'),
      slot(2, 'MEE', 'SSJ', 'A023'),
      prac(3, 'B1:GUI | B2:OOP | B3:DTIL'),
      prac(4, 'B1:GUI | B2:OOP | B3:DTIL'),
      slot(5, 'AEC', 'SMG', 'A023'),
      slot(6, 'AEC', 'SMG', 'A023', 'Tutorial B2/B1'),
    ],
    wednesday: [
      prac(1, 'B2:GUI | B3:OOP | B1:DTIL'),
      prac(2, 'B2:GUI | B3:OOP | B1:DTIL'),
      prac(3, 'B2:MEC | B3:LIB | B1:MEE'),
      prac(4, 'B2:MEC | B3:LIB | B1:MEE'),
      slot(5, 'AEC', 'SMG', 'A023', 'Tutorial B3/B1'),
      slot(6, 'IKS', 'SMG', 'A023'),
    ],
    thursday: [
      slot(1, 'OOP', 'MBS', 'A023'),
      slot(2, 'MEC', 'PAD', 'A023'),
      prac(3, 'B3:GUI | B1:OOP | B2:DTIL'),
      prac(4, 'B3:GUI | B1:OOP | B2:DTIL'),
      slot(5, 'AEC', 'SMG', 'A023'),
      free(6, 'TG Contact Hour'),
    ],
    friday: [
      slot(1, 'GUI', 'AA', 'A023'),
      slot(2, 'GUI', 'AA', 'A023'),
      prac(3, 'B3:MEC | B1:IKS | B2:MEE'),
      prac(4, 'B3:MEC | B1:IKS | B2:MEE'),
      slot(5, 'AEC', 'SMG', 'A023'),
      slot(6, 'MEC', 'PAD', 'A023'),
    ]
  },
  C: {
    monday: [
      prac(1, 'C1:MEC | C2:IKS | C3:MEE'),
      prac(2, 'C1:MEC | C2:IKS | C3:MEE'),
      slot(3, 'AEC', 'RAP', 'A026'),
      slot(4, 'OOP', 'PNB', 'A026'),
      slot(5, 'MEC', 'MSA', 'A026'),
      slot(6, 'GUI', 'AV', 'A026'),
    ],
    tuesday: [
      prac(1, 'C1:GUI | C2:OOP | C3:DTIL'),
      prac(2, 'C1:GUI | C2:OOP | C3:DTIL'),
      slot(3, 'MEE', 'VS', 'A026'),
      slot(4, 'AEC', 'RAP', 'A026'),
      slot(5, 'OOP', 'PNB', 'A026'),
      slot(6, 'MEC', 'MSA', 'A026'),
    ],
    wednesday: [
      prac(1, 'C2:MEC | C3:IKS | C1:MEE'),
      prac(2, 'C2:MEC | C3:IKS | C1:MEE'),
      slot(3, 'AEC', 'RAP', 'A026'),
      slot(4, 'MEE', 'VS', 'A026'),
      slot(5, 'AEC', 'RAP', 'A026', 'Tutorial C1/C2'),
      slot(6, 'MEC', 'MSA', 'A026'),
    ],
    thursday: [
      prac(1, 'C2:GUI | C3:OOP | C1:LIB'),
      prac(2, 'C2:GUI | C3:OOP | C1:LIB'),
      slot(3, 'AEC', 'RAP', 'A026'),
      slot(4, 'GUI', 'AV', 'A026'),
      slot(5, 'AEC', 'RAP', 'A026', 'Tutorial C2/C1'),
      free(6, 'TG Contact Hour'),
    ],
    friday: [
      prac(1, 'C3:MEC | C1:IKS | C2:MEE'),
      prac(2, 'C3:MEC | C1:IKS | C2:MEE'),
      prac(3, 'C3:GUI | C1:OOP | C2:DTIL'),
      prac(4, 'C3:GUI | C1:OOP | C2:DTIL'),
      slot(5, 'AEC', 'RAP', 'A027', 'Tutorial C3/C1'),
      prac(6, 'C1:DTIL | C2:LIB | C3:LIB'),
    ]
  },
  D: {
    monday: [
      prac(1, 'D1:GUI | D2:OOP | D3:DTIL'),
      prac(2, 'D1:GUI | D2:OOP | D3:DTIL'),
      prac(3, 'D1:MEC | D2:IKS | D3:MEE'),
      prac(4, 'D1:MEC | D2:IKS | D3:MEE'),
      slot(5, 'AEC', 'RAP', 'A212', 'Tutorial D3/D1'),
      slot(6, 'AEC', 'RAP', 'A212'),
    ],
    tuesday: [
      prac(1, 'D2:MEC | D3:IKS | D1:MEE'),
      prac(2, 'D2:MEC | D3:IKS | D1:MEE'),
      slot(3, 'AEC', 'RAP', 'A212'),
      slot(4, 'OOP', 'PNB', 'A212'),
      slot(5, 'MEC', 'MSA', 'A212'),
      slot(6, 'AEC', 'RAP', 'A212', 'Tutorial D2/D3'),
    ],
    wednesday: [
      prac(1, 'D2:GUI | D3:OOP | D1:DTIL'),
      prac(2, 'D2:GUI | D3:OOP | D1:DTIL'),
      slot(3, 'GUI', 'AV', 'A212'),
      slot(4, 'AEC', 'RAP', 'A212'),
      slot(5, 'MEE', 'VS', 'A212'),
      slot(6, 'OOP', 'PNB', 'A212'),
    ],
    thursday: [
      prac(1, 'D3:MEC | D1:IKS | D2:MEE'),
      prac(2, 'D3:MEC | D1:IKS | D2:MEE'),
      slot(3, 'MEE', 'VS', 'A212'),
      free(4, 'Library Hours'),
      slot(5, 'MEC', 'MSA', 'A212'),
      slot(6, 'GUI', 'AV', 'A212'),
    ],
    friday: [
      prac(1, 'D3:GUI | D1:OOP | D2:DTIL'),
      prac(2, 'D3:GUI | D1:OOP | D2:DTIL'),
      slot(3, 'AEC', 'RAP', 'A212'),
      free(4, 'TG Contact Hour'),
      slot(5, 'MEC', 'MSA', 'A212'),
      slot(6, 'AEC', 'RAP', 'A212', 'Tutorial D1/D3'),
    ]
  },
  E: {
    monday: [
      slot(1, 'GUI', 'RRJ', 'A213'),
      free(2, 'Library Hours'),
      prac(3, 'E1:GUI | E2:OOP | E3:DTIL'),
      prac(4, 'E1:GUI | E2:OOP | E3:DTIL'),
      slot(5, 'MEE', 'VS', 'A213'),
      slot(6, 'AEC', 'SRS', 'A213', 'Tutorial E3/E1'),
    ],
    tuesday: [
      slot(1, 'AEC', 'SRS', 'A213'),
      slot(2, 'AEC', 'SRS', 'A213'),
      prac(3, 'E1:MEC | E2:IKS | E3:MEE'),
      prac(4, 'E1:MEC | E2:IKS | E3:MEE'),
      free(5, 'TG Contact Hour'),
      slot(6, 'MEE', 'VS', 'A213'),
    ],
    wednesday: [
      slot(1, 'MEC', 'PAD', 'A213'),
      slot(2, 'MEC', 'PAD', 'A213'),
      prac(3, 'E2:GUI | E3:OOP | E1:DTIL'),
      prac(4, 'E2:GUI | E3:OOP | E1:DTIL'),
      slot(5, 'AEC', 'SRS', 'A213'),
      slot(6, 'AEC', 'SRS', 'A213', 'Tutorial E2/E1'),
    ],
    thursday: [
      prac(1, 'E2:MEC | E3:IKS | E1:MEE'),
      prac(2, 'E2:MEC | E3:IKS | E1:MEE'),
      prac(3, 'E3:MEC | E1:IKS | E2:MEE'),
      prac(4, 'E3:MEC | E1:IKS | E2:MEE'),
      slot(5, 'OOP', 'PNB', 'A213'),
      slot(6, 'AEC', 'SRS', 'A213', 'Tutorial E1/E3'),
    ],
    friday: [
      slot(1, 'GUI', 'RRJ', 'A213'),
      slot(2, 'MEC', 'PAD', 'A213'),
      prac(3, 'E3:GUI | E1:OOP | E2:DTIL'),
      prac(4, 'E3:GUI | E1:OOP | E2:DTIL'),
      slot(5, 'AEC', 'SRS', 'A213'),
      slot(6, 'OOP', 'PNB', 'A213'),
    ]
  },
  F: {
    monday: [
      slot(1, 'AEC', 'SSM', 'A210'),
      slot(2, 'OOP', 'PJK', 'A210'),
      prac(3, 'F1:AEC(T) | F2:LIB | F3:LIB'),
      slot(4, 'MEP', 'PMR', 'A210'),
      prac(5, 'F1:MEP | F2:IKS | F3:ADE'),
      prac(6, 'F1:MEP | F2:IKS | F3:ADE'),
    ],
    tuesday: [
      slot(1, 'MEP', 'PMR', 'A210'),
      slot(2, 'AEC', 'SSM', 'A210'),
      prac(3, 'F2:AEC(T) | F1:LIB | F3:LIB'),
      slot(4, 'OOP', 'PJK', 'A210'),
      prac(5, 'F2:MR | F3:MPW | F1:OOP'),
      prac(6, 'F2:MR | F3:MPW | F1:OOP'),
    ],
    wednesday: [
      slot(1, 'MR', 'SSP', 'A210'),
      slot(2, 'MR', 'SSP', 'A210'),
      prac(3, 'F3:AEC(T) | F1:LIB | F2:LIB'),
      slot(4, 'ADE', 'SBM', 'A210'),
      prac(5, 'F2:MEP | F3:IKS | F1:ADE'),
      prac(6, 'F2:MEP | F3:IKS | F1:ADE'),
    ],
    thursday: [
      slot(1, 'AEC', 'SSM', 'A210'),
      free(2, 'TG Contact Hour'),
      prac(3, 'F1:MR | F2:MPW | F3:OOP'),
      prac(4, 'F1:MR | F2:MPW | F3:OOP'),
      prac(5, 'F3:MR | F1:MPW | F2:OOP'),
      prac(6, 'F3:MR | F1:MPW | F2:OOP'),
    ],
    friday: [
      slot(1, 'AEC', 'SSM', 'A210'),
      slot(2, 'ADE', 'SBM', 'A210'),
      free(3, 'Library Hours'),
      slot(4, 'MEP', 'PMR', 'A210'),
      prac(5, 'F3:MEP | F1:IKS | F2:ADE'),
      prac(6, 'F3:MEP | F1:IKS | F2:ADE'),
    ]
  },
  G: {
    monday: [
      slot(1, 'ADE', 'SBM', 'A211'),
      slot(2, 'MR', 'YDN', 'A211'),
      prac(3, 'G1:MR | G2:MPW | G3:OOP'),
      prac(4, 'G1:MR | G2:MPW | G3:OOP'),
      slot(5, 'MR', 'YDN', 'A211'),
      prac(6, 'G1:AEC(T) | G2:LIB | G3:LIB'),
    ],
    tuesday: [
      slot(1, 'OOP', 'PJK', 'A211'),
      slot(2, 'ADE', 'SBM', 'A211'),
      prac(3, 'G1:MEP | G2:IKS | G3:ADE'),
      prac(4, 'G1:MEP | G2:IKS | G3:ADE'),
      slot(5, 'AEC', 'SSM', 'A211'),
      prac(6, 'G2:AEC(T) | G1:LIB | G3:LIB'),
    ],
    wednesday: [
      slot(1, 'MEP', 'PMR', 'A211'),
      slot(2, 'MEP', 'PMR', 'A211'),
      prac(3, 'G2:MR | G3:MPW | G1:OOP'),
      prac(4, 'G2:MR | G3:MPW | G1:OOP'),
      slot(5, 'AEC', 'SSM', 'A211'),
      prac(6, 'G3:AEC(T) | G1:LIB | G2:LIB'),
    ],
    thursday: [
      prac(1, 'G2:MEP | G3:IKS | G1:ADE'),
      prac(2, 'G2:MEP | G3:IKS | G1:ADE'),
      prac(3, 'G3:MEP | G1:IKS | G2:ADE'),
      prac(4, 'G3:MEP | G1:IKS | G2:ADE'),
      slot(5, 'AEC', 'SSM', 'A211'),
      slot(6, 'AEC', 'SSM', 'A211'),
    ],
    friday: [
      free(1, 'TG Contact Hour'),
      slot(2, 'MEP', 'PMR', 'A211'),
      prac(3, 'G3:MR | G1:MPW | G2:OOP'),
      prac(4, 'G3:MR | G1:MPW | G2:OOP'),
      slot(5, 'OOP', 'PJK', 'A211'),
      free(6, 'Library Hours'),
    ]
  }
};

export function getScheduleForBatch(weeklySchedule, batchName) {
  if (!batchName) return weeklySchedule;
  const newSchedule = {};
  for (const day in weeklySchedule) {
    newSchedule[day] = weeklySchedule[day].map(slot => {
      const newSlot = { ...slot };
      
      if (newSlot.subject === 'PRACTICAL' && newSlot.note) {
        const parts = newSlot.note.split('|').map(s => s.trim());
        const myBatchPart = parts.find(p => p.startsWith(batchName + ':'));
        if (myBatchPart) {
          let subjStr = myBatchPart.split(':')[1].trim();
          if (subjStr === 'LIB') {
            newSlot.subject = null;
            newSlot.note = 'Library Hours';
          } else {
            if (subjStr.includes('(T)')) {
               newSlot.subject = subjStr.replace('(T)', '');
               newSlot.note = 'Tutorial';
            } else {
               newSlot.subject = subjStr;
               newSlot.note = 'Practical Lab';
            }
          }
        } else {
           newSlot.subject = null;
           newSlot.note = 'Free';
        }
      }
      else if (newSlot.note && newSlot.note.includes('Tutorial')) {
        const batches = newSlot.note.replace('Tutorial', '').trim().split('/');
        if (!batches.includes(batchName)) {
           newSlot.subject = null;
           newSlot.note = 'Free';
           newSlot.teacher = null;
           newSlot.room = null;
        }
      }
      return newSlot;
    });
  }
  return newSchedule;
}
