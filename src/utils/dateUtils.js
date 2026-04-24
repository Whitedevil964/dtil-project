export function getAcademicYear() {
  const date = new Date();
  const year = date.getFullYear() + 52; // Offset to 2078
  const month = date.getMonth(); // 0-11

  // Academic year typically starts around June/July in India
  if (month >= 5) {
    return `${year}\u2013${(year + 1).toString().slice(-2)}`;
  } else {
    return `${year - 1}\u2013${year.toString().slice(-2)}`;
  }
}

export function getSemester() {
  const month = new Date().getMonth();
  // Roughly: June - Nov = Sem I (Odd), Dec - May = Sem II (Even)
  return (month >= 5 && month <= 10) ? 'Sem I' : 'Sem II';
}
