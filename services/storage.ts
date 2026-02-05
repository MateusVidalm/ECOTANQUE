
export const saveToStorage = (key: string, data: any) => {
  localStorage.setItem(`ecofuel_${key}`, JSON.stringify(data));
};

export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  const saved = localStorage.getItem(`ecofuel_${key}`);
  return saved ? JSON.parse(saved) : defaultValue;
};
