export const SKILL_CATEGORIES = {
  "Frontend": [
    "React", "Next.js", "Vue.js", "Angular", "TypeScript", "JavaScript",
    "HTML/CSS", "TailwindCSS", "Framer Motion", "Redux", "GraphQL",
  ],
  "Backend": [
    "Node.js", "Python", "Go", "Rust", "Java", "C#", "PHP", "Ruby",
    "Express.js", "FastAPI", "Django", "Spring Boot", "NestJS",
  ],
  "Database": [
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Supabase",
    "Drizzle ORM", "Prisma", "SQL",
  ],
  "DevOps & Cloud": [
    "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Vercel", "CI/CD",
    "Terraform", "Linux", "Nginx",
  ],
  "AI & Data": [
    "Machine Learning", "PyTorch", "TensorFlow", "LangChain", "OpenAI API",
    "Data Analysis", "Pandas", "NumPy", "Computer Vision", "NLP",
  ],
  "Mobile": [
    "React Native", "Flutter", "Swift", "Kotlin", "iOS", "Android",
  ],
  "Tools": [
    "Git", "Figma", "Jira", "Agile / Scrum", "REST APIs", "WebSockets",
    "Testing", "Storybook",
  ],
} as const;

export const ALL_SKILLS = Object.values(SKILL_CATEGORIES).flat();
export type Skill = (typeof ALL_SKILLS)[number];
