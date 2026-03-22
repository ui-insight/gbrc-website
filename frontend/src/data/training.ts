export type LearningPath = {
  slug: string
  title: string
  audience: string
  summary: string
  nextStep: string
  modules: string[]
}

export type Workshop = {
  slug: string
  title: string
  dateLabel: string
  format: string
  audience: string
  registrationLabel: string
  registrationUrl: string
}

export type ResourceType = 'Tutorial' | 'Video' | 'SOP' | 'Template' | 'Guide'

export type TrainingResource = {
  slug: string
  title: string
  type: ResourceType
  audience: string
  topic: string
  description: string
  duration?: string
  linkLabel: string
  linkUrl: string
}

export const learningPaths: LearningPath[] = [
  {
    slug: 'new-to-gbrc',
    title: 'New to GBRC',
    audience: 'First-time users',
    summary:
      'Start here for orientation, service awareness, and the sequence of actions that gets a first project moving.',
    nextStep: 'Begin with the Getting Started guide, then schedule a consultation or submit project intake.',
    modules: [
      'How GBRC supports projects',
      'When to use consultation vs project intake',
      'What to prepare before your first meeting',
    ],
  },
  {
    slug: 'sample-preparation',
    title: 'Preparing Samples',
    audience: 'Labs approaching submission',
    summary:
      'Focus on sample quality, submission readiness, and the questions that shape a smoother handoff to the core.',
    nextStep: 'Review submission requirements and confirm your sample plan before delivery.',
    modules: [
      'Quality thresholds and quantification basics',
      'Packaging, labeling, and sample handoff',
      'Common issues that slow down sequencing',
    ],
  },
  {
    slug: 'sequencing-strategy',
    title: 'Planning a Sequencing Project',
    audience: 'PIs and project leads',
    summary:
      'Use this path to choose an appropriate platform, align the workflow to your research question, and plan for downstream analysis.',
    nextStep: 'Bring project goals, sample constraints, and expected outputs into a planning consultation.',
    modules: [
      'Choosing between common sequencing approaches',
      'Balancing throughput, timeline, and budget',
      'Planning for data delivery and analysis',
    ],
  },
  {
    slug: 'data-analysis',
    title: 'Analyzing Data',
    audience: 'Researchers receiving results',
    summary:
      'Orient users to common downstream analysis decisions, interpretation support, and when to ask for bioinformatics help.',
    nextStep: 'Map your analysis questions before data delivery so support needs are clear early.',
    modules: [
      'Understanding outputs and file handoff',
      'QC, alignment, and common analysis stages',
      'When to request consultation for custom analysis',
    ],
  },
]

export const workshops: Workshop[] = [
  {
    slug: 'intro-gbrc',
    title: 'Introduction to Working with GBRC',
    dateLabel: 'April 10, 2026',
    format: 'In person',
    audience: 'New users and lab coordinators',
    registrationLabel: 'Request a seat',
    registrationUrl: '/contact',
  },
  {
    slug: 'sample-qc',
    title: 'Sample QC and Submission Readiness',
    dateLabel: 'April 24, 2026',
    format: 'Hybrid',
    audience: 'Researchers preparing submissions',
    registrationLabel: 'Ask about registration',
    registrationUrl: '/contact',
  },
  {
    slug: 'analysis-bootcamp',
    title: 'Sequencing Data Analysis Bootcamp',
    dateLabel: 'May 8, 2026',
    format: 'Virtual',
    audience: 'Researchers beginning downstream analysis',
    registrationLabel: 'Join interest list',
    registrationUrl: '/contact',
  },
]

export const resources: TrainingResource[] = [
  {
    slug: 'first-project-checklist',
    title: 'First Project Consultation Checklist',
    type: 'Template',
    audience: 'New users',
    topic: 'Onboarding',
    description:
      'A short checklist for what to gather before your first GBRC planning conversation.',
    duration: '10 min',
    linkLabel: 'Use the getting started guide',
    linkUrl: '/getting-started',
  },
  {
    slug: 'sample-submission-guide',
    title: 'Sample Submission Basics',
    type: 'Guide',
    audience: 'Submitting labs',
    topic: 'Sample prep',
    description:
      'A practical walkthrough of what to confirm before handing samples to the core.',
    duration: '12 min',
    linkLabel: 'Review getting started',
    linkUrl: '/getting-started',
  },
  {
    slug: 'project-intake-overview',
    title: 'Using Project Intake for Early Planning',
    type: 'Tutorial',
    audience: 'PIs and project leads',
    topic: 'Planning',
    description:
      'An orientation to the intake flow and when it is the best starting point for a new project.',
    duration: '8 min',
    linkLabel: 'Open project intake',
    linkUrl: '/project-intake',
  },
  {
    slug: 'service-selection-video',
    title: 'Choosing Services for a New Project',
    type: 'Video',
    audience: 'Researchers comparing options',
    topic: 'Sequencing strategy',
    description:
      'A short explainer for how to think about services, workflows, and sequencing decisions.',
    duration: '15 min',
    linkLabel: 'Browse services',
    linkUrl: '/services',
  },
  {
    slug: 'analysis-support-sop',
    title: 'When to Ask for Bioinformatics Support',
    type: 'SOP',
    audience: 'Researchers receiving data',
    topic: 'Analysis',
    description:
      'A practical reference for when standard outputs are enough and when custom help is worth requesting.',
    duration: '6 min',
    linkLabel: 'Contact the team',
    linkUrl: '/contact',
  },
  {
    slug: 'training-request-path',
    title: 'How to Request the Right Next Step',
    type: 'Tutorial',
    audience: 'All users',
    topic: 'Support',
    description:
      'Guidance on when to contact GBRC directly, use project intake, or move into a service request workflow.',
    duration: '5 min',
    linkLabel: 'Contact GBRC',
    linkUrl: '/contact',
  },
]
