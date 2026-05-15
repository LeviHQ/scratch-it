export type Template = {
  id: string;
  name: string;
  emoji: string;
  message: string;
  gradient: string;
  scratchColor: string;
  scratchLabel: string;
};

export const TEMPLATES: Template[] = [
  {
    id: "birthday",
    name: "Birthday Surprise",
    emoji: "🎂",
    message: "Happy Birthday!\nWishing you a year full of joy, laughter, and cake. 🎉",
    gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fad0c4 100%)",
    scratchColor: "#e85d75",
    scratchLabel: "Scratch for your birthday surprise ✨",
  },
  {
    id: "salary",
    name: "First Salary",
    emoji: "💸",
    message: "Your first paycheck is here!\nProud of you. Treat yourself — you earned it. 💼",
    gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
    scratchColor: "#c87f1f",
    scratchLabel: "Scratch to reveal 💰",
  },
  {
    id: "exam",
    name: "Exam Result",
    emoji: "🎓",
    message: "You did it!\nAll those late nights paid off. So proud of you. 📚",
    gradient: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
    scratchColor: "#3a6fb0",
    scratchLabel: "Scratch to see your result 🤞",
  },
  {
    id: "diwali",
    name: "Diwali Gift",
    emoji: "🪔",
    message: "Happy Diwali!\nMay your life sparkle with joy, prosperity, and endless light. ✨",
    gradient: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
    scratchColor: "#a8460b",
    scratchLabel: "Scratch for your Diwali gift 🪔",
  },
  {
    id: "anniversary",
    name: "Anniversary",
    emoji: "💞",
    message: "Happy Anniversary!\nEvery year with you is my favorite year. ❤️",
    gradient: "linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)",
    scratchColor: "#a83158",
    scratchLabel: "Scratch with love 💌",
  },
  {
    id: "promotion",
    name: "Job Got / Promotion",
    emoji: "🚀",
    message: "Congratulations!\nThis is just the beginning of something amazing. 🎯",
    gradient: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
    scratchColor: "#1f7a5a",
    scratchLabel: "Scratch to celebrate 🚀",
  },
];

export const getTemplate = (id?: string | null) => TEMPLATES.find((t) => t.id === id);
