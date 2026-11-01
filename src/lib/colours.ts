// The block to get out is the only red one.
export const STAR = '#e5484d';

const OTHERS = [
  '#3b82f6',
  '#2fa36b',
  '#f2b200',
  '#f76b15',
  '#8e4ec6',
  '#f472b6',
  '#14a3b8',
];

export const colourOf = (k: number) => OTHERS[(k - 1) % OTHERS.length];
