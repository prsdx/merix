export const MOCK_JD = {
  title: "Senior Frontend Engineer",
  company: "TechCorp India",
  department: "Engineering",
  location: "Bengaluru, Karnataka",
  summary:
    "Looking for a frontend engineer with 5+ years of experience building production React applications. Must have strong TypeScript skills, experience with state management, and a track record of shipping performant web applications.",
};

export interface SkillMatch {
  skill: string;
  required: boolean;
  evidence: string;
}

export interface SkillGap {
  skill: string;
  required: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  filename: string;
  score: number;
  matched_skills: SkillMatch[];
  missing_skills: SkillGap[];
  rationale: string;
}

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: "1",
    name: "Rahul Sharma",
    filename: "rahul_sharma_resume.pdf",
    score: 94,
    matched_skills: [
      { skill: "React", required: true, evidence: "Led migration from class components to hooks across 12 micro-frontends at Infosys (2022–2024)" },
      { skill: "TypeScript", required: true, evidence: "Introduced strict TypeScript across the team, reducing runtime errors by 40%" },
      { skill: "State Management", required: true, evidence: "Architected Redux Toolkit store for multi-tenant dashboard serving 50k DAU" },
      { skill: "Performance", required: true, evidence: "Achieved 95 Lighthouse score by implementing code-splitting, lazy hydration, and tree-shaking" },
      { skill: "Testing", required: false, evidence: "Wrote 200+ unit and integration tests using Jest and React Testing Library" },
      { skill: "CI/CD", required: false, evidence: "Set up GitHub Actions pipeline with automated deploy previews on Vercel" },
    ],
    missing_skills: [{ skill: "GraphQL", required: false }],
    rationale:
      "Rahul demonstrates deep expertise across all required skills with strong production evidence. His TypeScript migration and performance optimization track record are particularly compelling.",
  },
  {
    id: "2",
    name: "Priya Patel",
    filename: "priya_patel_cv.pdf",
    score: 87,
    matched_skills: [
      { skill: "React", required: true, evidence: "Built and maintained component library used by 4 product teams at Zomato" },
      { skill: "TypeScript", required: true, evidence: "Migrated legacy JavaScript codebase to TypeScript over 6 months" },
      { skill: "State Management", required: true, evidence: "Used Zustand for lightweight state in customer-facing ordering flow" },
      { skill: "Performance", required: true, evidence: "Reduced bundle size by 35% through dynamic imports and lazy loading" },
    ],
    missing_skills: [{ skill: "Testing", required: false }, { skill: "CI/CD", required: false }],
    rationale:
      "Priya has strong frontend fundamentals with production experience at scale. Her component library work at Zomato shows architectural thinking.",
  },
  {
    id: "3",
    name: "Arjun Menon",
    filename: "arjun_menon.pdf",
    score: 82,
    matched_skills: [
      { skill: "React", required: true, evidence: "Developed customer portal SPA using React 18 with Server Components at TCS" },
      { skill: "TypeScript", required: true, evidence: "Enforced strict typing with shared type packages across monorepo" },
      { skill: "CI/CD", required: false, evidence: "Automated deployment pipeline reducing release cycle from 2 weeks to 2 days" },
    ],
    missing_skills: [
      { skill: "State Management", required: true },
      { skill: "Performance", required: true },
      { skill: "Testing", required: false },
    ],
    rationale:
      "Arjun has solid enterprise React experience but lacks explicit evidence for state management and performance optimization at senior level.",
  },
  {
    id: "4",
    name: "Sneha Iyer",
    filename: "sneha_iyer.pdf",
    score: 76,
    matched_skills: [
      { skill: "React", required: true, evidence: "Built 6 customer-facing modules using React hooks and context at Swiggy" },
      { skill: "State Management", required: true, evidence: "Used Redux for order-state management across web and mobile-web" },
      { skill: "Performance", required: true, evidence: "Implemented virtualized lists for large order history views" },
    ],
    missing_skills: [
      { skill: "TypeScript", required: true },
      { skill: "Testing", required: false },
      { skill: "CI/CD", required: false },
    ],
    rationale:
      "Sneha has practical React experience but the lack of TypeScript and testing is concerning for a senior role.",
  },
  {
    id: "5",
    name: "Vikram Deshmukh",
    filename: "vikram_deshmukh.pdf",
    score: 71,
    matched_skills: [
      { skill: "React", required: true, evidence: "Core contributor to open-source React component library with 2k+ GitHub stars" },
      { skill: "TypeScript", required: true, evidence: "All open-source contributions in TypeScript with exhaustive type definitions" },
      { skill: "GraphQL", required: false, evidence: "Built GraphQL federation gateway for microservices at Razorpay" },
    ],
    missing_skills: [
      { skill: "State Management", required: true },
      { skill: "Performance", required: true },
      { skill: "Testing", required: false },
    ],
    rationale:
      "Vikram's open-source credibility and TypeScript depth are impressive, but lacks production state management evidence.",
  },
  {
    id: "6",
    name: "Ananya Reddy",
    filename: "ananya_reddy.pdf",
    score: 63,
    matched_skills: [
      { skill: "React", required: true, evidence: "Built internal dashboard using React and Material-UI at Flipkart" },
      { skill: "TypeScript", required: true, evidence: "Added TypeScript to new feature modules" },
    ],
    missing_skills: [
      { skill: "State Management", required: true },
      { skill: "Performance", required: true },
      { skill: "Testing", required: false },
      { skill: "CI/CD", required: false },
      { skill: "GraphQL", required: false },
    ],
    rationale:
      "Ananya has relevant product experience but the resume is light on depth for required senior-level skills.",
  },
  {
    id: "7",
    name: "Karan Joshi",
    filename: "karan_joshi.pdf",
    score: 58,
    matched_skills: [
      { skill: "React", required: true, evidence: "2 years of React development at a Series A startup" },
      { skill: "Testing", required: false, evidence: "Wrote unit tests with Jest" },
    ],
    missing_skills: [
      { skill: "TypeScript", required: true },
      { skill: "State Management", required: true },
      { skill: "Performance", required: true },
      { skill: "CI/CD", required: false },
      { skill: "GraphQL", required: false },
    ],
    rationale:
      "Karan is a mid-level candidate with potential but not enough evidence for a senior frontend position.",
  },
  {
    id: "8",
    name: "Meera Kapoor",
    filename: "meera_kapoor.pdf",
    score: 52,
    matched_skills: [
      { skill: "React", required: true, evidence: "Freelance React projects for 2 startups, built customer-facing dashboards" },
    ],
    missing_skills: [
      { skill: "TypeScript", required: true },
      { skill: "State Management", required: true },
      { skill: "Performance", required: true },
      { skill: "Testing", required: false },
      { skill: "CI/CD", required: false },
    ],
    rationale:
      "Meera shows initiative with freelance work but the resume doesn't demonstrate senior-level scale or complexity.",
  },
  {
    id: "9",
    name: "Deepak Gupta",
    filename: "deepak_gupta.pdf",
    score: 44,
    matched_skills: [
      { skill: "React", required: true, evidence: "Completed React Nanodegree and built 3 portfolio projects" },
    ],
    missing_skills: [
      { skill: "TypeScript", required: true },
      { skill: "State Management", required: true },
      { skill: "Performance", required: true },
      { skill: "Testing", required: false },
      { skill: "CI/CD", required: false },
      { skill: "GraphQL", required: false },
    ],
    rationale: "Career-switcher with portfolio projects but no production experience. Potentially a good junior hire.",
  },
  {
    id: "10",
    name: "Ritu Agarwal",
    filename: "ritu_agarwal.pdf",
    score: 38,
    matched_skills: [
      { skill: "React", required: true, evidence: "Built a college project using React and Firebase" },
    ],
    missing_skills: [
      { skill: "TypeScript", required: true },
      { skill: "State Management", required: true },
      { skill: "Performance", required: true },
      { skill: "Testing", required: false },
      { skill: "CI/CD", required: false },
      { skill: "GraphQL", required: false },
    ],
    rationale: "Entry-level candidate with a single college project. Not suitable for a senior role.",
  },
];

export function getScoreColor(score: number): "green" | "amber" | "red" {
  if (score >= 75) return "green";
  if (score >= 50) return "amber";
  return "red";
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return "Strong Fit";
  if (score >= 70) return "Good Fit";
  if (score >= 50) return "Moderate Fit";
  return "Weak Fit";
}
