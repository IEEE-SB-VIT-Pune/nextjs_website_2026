export interface Question {
  id: number;
  text: string;
  type: "mcq";
  options: string[];
  answer: string;
}

const questions: Question[] = [
  {
    id: 1,
    text: "What does CPU stand for?",
    type: "mcq",
    options: [
      "Central Processing Unit",
      "Computer Personal Unit",
      "Central Program Utility",
      "Computer Processing Unit",
    ],
    answer: "Central Processing Unit",
  },
  {
    id: 2,
    text: "Which device is used to type on a computer?",
    type: "mcq",
    options: ["Mouse", "Monitor", "Keyboard", "Speaker"],
    answer: "Keyboard",
  },
  {
    id: 3,
    text: "What does 'www' stand for in a website address?",
    type: "mcq",
    options: [
      "World Wide Web",
      "Wide World Web",
      "Web World Wide",
      "World Web Wide",
    ],
    answer: "World Wide Web",
  },
  {
    id: 4,
    text: "Which of these is a web browser?",
    type: "mcq",
    options: ["Excel", "Google Chrome", "Photoshop", "PowerPoint"],
    answer: "Google Chrome",
  },
  {
    id: 5,
    text: "What symbol is used in every email address?",
    type: "mcq",
    options: ["#", "&", "@", "$"],
    answer: "@",
  },
  {
    id: 6,
    text: "What does PDF stand for?",
    type: "mcq",
    options: [
      "Portable Document Format",
      "Personal Data File",
      "Printed Document File",
      "Public Document Format",
    ],
    answer: "Portable Document Format",
  },
  {
    id: 7,
    text: "Which key do you press to make a letter uppercase?",
    type: "mcq",
    options: ["Tab", "Ctrl", "Shift", "Alt"],
    answer: "Shift",
  },
  {
    id: 8,
    text: "What does Wi-Fi allow you to do?",
    type: "mcq",
    options: [
      "Print documents",
      "Connect to the internet wirelessly",
      "Charge your phone",
      "Take screenshots",
    ],
    answer: "Connect to the internet wirelessly",
  },
  {
    id: 9,
    text: "Which company created the iPhone?",
    type: "mcq",
    options: ["Samsung", "Google", "Apple", "Microsoft"],
    answer: "Apple",
  },
  {
    id: 10,
    text: "What does USB stand for?",
    type: "mcq",
    options: [
      "Universal Serial Bus",
      "Ultra Speed Bandwidth",
      "Unified System Bridge",
      "Universal System Backup",
    ],
    answer: "Universal Serial Bus",
  },
  {
    id: 11,
    text: "What is the shortcut to copy something on a computer?",
    type: "mcq",
    options: ["Ctrl + V", "Ctrl + Z", "Ctrl + C", "Ctrl + X"],
    answer: "Ctrl + C",
  },
  {
    id: 12,
    text: "Which of these is a social media platform?",
    type: "mcq",
    options: ["Windows", "Instagram", "Linux", "Excel"],
    answer: "Instagram",
  },
  {
    id: 13,
    text: "What does GPS stand for?",
    type: "mcq",
    options: [
      "Global Positioning System",
      "General Processing System",
      "Global Program Software",
      "Geographic Position Service",
    ],
    answer: "Global Positioning System",
  },
  {
    id: 14,
    text: "Which of these stores data permanently on a computer?",
    type: "mcq",
    options: ["RAM", "Hard Drive", "CPU", "Monitor"],
    answer: "Hard Drive",
  },
  {
    id: 15,
    text: "What is Google primarily known as?",
    type: "mcq",
    options: [
      "A video game",
      "A search engine",
      "An operating system",
      "A programming language",
    ],
    answer: "A search engine",
  },
];

export function getShuffledQuestions(count: number = 10): Question[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export default questions;
