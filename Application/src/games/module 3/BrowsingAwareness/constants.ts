import type { Level } from './types';

export const LEVELS: Level[] = [
  {
    id: 1,
    title: "The Address Bar",
    description: "The address bar (URL bar) is where you type the exact address of a website.",
    task: "Go to 'google.com' by typing it in the address bar.",
    targetUrl: "google.com",
    expectedAction: 'url',
    hint: "Click the long white bar at the top and type 'google.com', then press Enter.",
    points: 20,
  },
  {
    id: 2,
    title: "Search vs. URL",
    description: "Sometimes you don't know the exact address. That's when you use a search engine.",
    task: "Search for 'cute cats' using the search bar on the page.",
    targetSearch: "cute cats",
    expectedAction: 'search',
    hint: "Look for the search box in the middle of the page, not the address bar at the top.",
    points: 20,
  },
  {
    id: 3,
    title: "Going Back",
    description: "The 'Back' button takes you to the page you just visited.",
    task: "You've gone too far! Use the 'Back' button to return to the search results.",
    expectedAction: 'back',
    hint: "Look for the arrow pointing left (←) in the top-left corner.",
    points: 20,
  },
  {
    id: 4,
    title: "Safety First (HTTPS)",
    description: "Secure websites have a padlock icon and start with 'https://'.",
    task: "Identify the secure website by clicking the padlock icon in the address bar.",
    expectedAction: 'identify_secure',
    hint: "Look for the lock icon next to the website address.",
    points: 20,
  },
  {
    id: 5,
    title: "Avoiding Distractions",
    description: "The web is full of distractions. Stay focused on your goal!",
    task: "Click the 'Official Download' link, but ignore the flashy 'WINNER' pop-ups.",
    expectedAction: 'click_link',
    hint: "Only click links that look like real text, not big blinking buttons.",
    distractions: ["You won a prize!", "Click here for free money!", "URGENT: Update needed!"],
    points: 20,
  }
];
