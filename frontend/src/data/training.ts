export type LearningModule = {
  title: string
  resourceSlug: string
}

export type LearningPath = {
  slug: string
  title: string
  audience: string
  summary: string
  nextStep: string
  modules: LearningModule[]
}

export type Workshop = {
  slug: string
  title: string
  summary: string
  dateLabel: string
  format: string
  audience: string
  status: 'upcoming' | 'archived'
  actionLabel: string
  actionUrl: string
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
    title: 'Starting Your First GBRC Project',
    audience: 'First-time users and new labs',
    summary:
      'Use this path to understand how GBRC works, what to prepare before outreach, and when to move from orientation into consultation or project intake.',
    nextStep:
      'Begin with the Getting Started guide, then schedule a consultation if you need design help or open project intake if your scope is ready to describe.',
    modules: [
      {
        title: 'How GBRC supports projects from planning through data delivery',
        resourceSlug: 'new-user-onboarding-guide',
      },
      {
        title: 'When to use Getting Started, Contact, or Project Intake',
        resourceSlug: 'contact-and-support-routes',
      },
      {
        title: 'What to gather before your first consultation',
        resourceSlug: 'new-user-onboarding-guide',
      },
    ],
  },
  {
    slug: 'sample-preparation',
    title: 'Preparing Samples for Submission',
    audience: 'Labs approaching handoff to the core',
    summary:
      'Focus on sample quality, quantification expectations, labeling, and the practical checks that reduce delays at submission.',
    nextStep:
      'Review the sample submission guidelines, then confirm any quality or packaging questions with GBRC before delivery.',
    modules: [
      {
        title: 'Quality thresholds, Qubit/Nanodrop, and RIN expectations',
        resourceSlug: 'sample-submission-guidelines',
      },
      {
        title: 'Packaging, tube labeling, and submission handoff',
        resourceSlug: 'sample-submission-guidelines',
      },
      {
        title: 'Common readiness issues that slow sequencing workflows',
        resourceSlug: 'sample-submission-guidelines',
      },
    ],
  },
  {
    slug: 'sequencing-strategy',
    title: 'Planning Sequencing Strategy',
    audience: 'PIs and project leads',
    summary:
      'Choose the right sequencing and library preparation approach by aligning platform, sample constraints, expected outputs, and analysis needs.',
    nextStep:
      'Bring your research question, sample constraints, desired outputs, and timeline into a planning consultation.',
    modules: [
      {
        title: 'Choosing between Aviti, PacBio, amplicon, and RNA-focused workflows',
        resourceSlug: 'sequencing-services-overview',
      },
      {
        title: 'Balancing throughput, budget, turnaround time, and library prep complexity',
        resourceSlug: 'project-intake-guide',
      },
      {
        title: 'Planning for downstream data delivery and interpretation',
        resourceSlug: 'consultation-support-playbook',
      },
    ],
  },
  {
    slug: 'data-analysis',
    title: 'Receiving and Interpreting Data',
    audience: 'Researchers receiving results',
    summary:
      'Orient your team to common file outputs, QC interpretation, and when to use standard deliverables versus custom bioinformatics support.',
    nextStep:
      'Map your analysis questions before data delivery so GBRC can help you plan the right support level early.',
    modules: [
      {
        title: 'Understanding file delivery, retention, and access expectations',
        resourceSlug: 'new-user-onboarding-guide',
      },
      {
        title: 'QC interpretation, alignment context, and common downstream analysis stages',
        resourceSlug: 'consultation-support-playbook',
      },
      {
        title: 'When to request custom bioinformatics consultation',
        resourceSlug: 'consultation-support-playbook',
      },
    ],
  },
]

export const workshops: Workshop[] = [
  {
    slug: 'project-planning-clinic',
    title: 'Project Planning Clinic: From Research Question to Sequencing Plan',
    summary:
      'A planning-focused session on choosing services, scoping support needs, and arriving at a workable sequencing strategy before submission.',
    dateLabel: 'April 10, 2026 · Noon PT',
    format: 'In person',
    audience: 'New users, PIs, and lab managers',
    status: 'upcoming',
    actionLabel: 'Reserve a consultation-style seat',
    actionUrl: '/contact',
  },
  {
    slug: 'sample-readiness-workshop',
    title: 'Sample Readiness Workshop: QC, Quantification, and Submission Handoff',
    summary:
      'A practical workshop on concentration thresholds, RNA quality expectations, sample packaging, and avoiding common submission mistakes.',
    dateLabel: 'April 24, 2026 · 10:00 AM PT',
    format: 'Hybrid',
    audience: 'Researchers preparing DNA or RNA submissions',
    status: 'upcoming',
    actionLabel: 'Ask about workshop registration',
    actionUrl: '/contact',
  },
  {
    slug: 'data-delivery-session',
    title: 'After the Run: Understanding QC, Deliverables, and Analysis Handoffs',
    summary:
      'A session for labs receiving data who want help interpreting deliverables, understanding QC context, and deciding when custom support is needed.',
    dateLabel: 'May 8, 2026 · 1:00 PM PT',
    format: 'Virtual',
    audience: 'Researchers receiving data and bioinformatics collaborators',
    status: 'upcoming',
    actionLabel: 'Join the interest list',
    actionUrl: '/contact',
  },
  {
    slug: 'orientation-archive',
    title: 'Archived Session: GBRC Orientation for New Labs',
    summary:
      'A previous orientation covering consultation, submission flow, iLab expectations, and how projects move from intake to data delivery.',
    dateLabel: 'Recorded February 2026',
    format: 'Recorded session',
    audience: 'New labs and incoming trainees',
    status: 'archived',
    actionLabel: 'Use the onboarding guide',
    actionUrl: '/getting-started',
  },
  {
    slug: 'service-selection-archive',
    title: 'Archived Session: Choosing Between GBRC Service Pathways',
    summary:
      'A prior training session on how sample type, goals, and turnaround constraints influence service and sequencing decisions.',
    dateLabel: 'Recorded January 2026',
    format: 'Recorded session',
    audience: 'Researchers comparing workflows',
    status: 'archived',
    actionLabel: 'Review current services',
    actionUrl: '/services',
  },
]

export const resources: TrainingResource[] = [
  {
    slug: 'new-user-onboarding-guide',
    title: 'New User Onboarding Guide',
    type: 'Template',
    audience: 'First-time users',
    topic: 'Onboarding',
    description:
      'Use the GBRC onboarding sequence to move from iLab registration to consultation, submission, project tracking, and data delivery.',
    duration: '15 min',
    linkLabel: 'Read the getting started guide',
    linkUrl: '/getting-started',
  },
  {
    slug: 'sample-submission-guidelines',
    title: 'Sample Submission Guidelines',
    type: 'Guide',
    audience: 'Submitting labs',
    topic: 'Sample prep',
    description:
      'Review concentration thresholds, RNA quality expectations, tube labeling, and handoff requirements before bringing material to the core.',
    duration: '12 min',
    linkLabel: 'Review submission guidance',
    linkUrl: '/getting-started',
  },
  {
    slug: 'project-intake-guide',
    title: 'When to Use Project Intake',
    type: 'Tutorial',
    audience: 'PIs and project leads',
    topic: 'Planning',
    description:
      'Understand when the intake flow is the best way to frame a new project, collect project details, and start a more structured planning conversation.',
    duration: '8 min',
    linkLabel: 'Open project intake',
    linkUrl: '/project-intake',
  },
  {
    slug: 'sequencing-services-overview',
    title: 'Choosing Between GBRC Service Pathways',
    type: 'Video',
    audience: 'Researchers comparing options',
    topic: 'Sequencing strategy',
    description:
      'A guided overview of sample prep, library preparation, Aviti sequencing, and bioinformatics support so projects start with the right workflow.',
    duration: '15 min',
    linkLabel: 'Browse services and FAQs',
    linkUrl: '/services',
  },
  {
    slug: 'consultation-support-playbook',
    title: 'Consultation and Analysis Support Playbook',
    type: 'SOP',
    audience: 'Researchers receiving data',
    topic: 'Analysis',
    description:
      'Use this reference to distinguish standard deliverables from the moments when custom analysis planning or bioinformatics consultation will save time.',
    duration: '7 min',
    linkLabel: 'Schedule a consultation',
    linkUrl: '/contact',
  },
  {
    slug: 'contact-and-support-routes',
    title: 'Choosing the Right Support Route',
    type: 'Tutorial',
    audience: 'All users',
    topic: 'Support',
    description:
      'Learn when to email GBRC directly, when to use project intake, and when to move into the iLab portal for service execution.',
    duration: '6 min',
    linkLabel: 'Contact GBRC',
    linkUrl: '/contact',
  },
]
