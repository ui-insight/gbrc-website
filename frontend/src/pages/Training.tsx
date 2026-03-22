import { useDeferredValue, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Compass,
  GraduationCap,
  CheckCircle2,
  PlayCircle,
  Search,
  X,
} from 'lucide-react'
import {
  learningPaths,
  type LearningPath,
  resources,
  type ResourceType,
  type TrainingResource,
  workshops,
} from '../data/training'

const sectionPreviews = [
  {
    icon: <Compass className="h-6 w-6" />,
    title: 'Learning Paths',
    description:
      'Guided pathways for new users, sample preparation, sequencing planning, data analysis, and bioinformatics tools.',
  },
  {
    icon: <CalendarDays className="h-6 w-6" />,
    title: 'Workshops',
    description:
      'A home for upcoming training sessions, formats, audiences, and registration actions.',
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: 'Resource Library',
    description:
      'Tutorials, SOPs, videos, templates, and practical reference materials organized for quick discovery.',
  },
]

const audienceCards = [
  {
    title: 'New GBRC Users',
    description:
      'Start with orientation material, core workflows, and the best next step for your first project.',
  },
  {
    title: 'Active Researchers',
    description:
      'Find focused tutorials and checklists for sample prep, sequencing decisions, and project execution.',
  },
  {
    title: 'Advanced Practitioners',
    description:
      'Use the center as a launch point for workshops, deeper analysis resources, and ongoing skill development.',
  },
]

export default function Training() {
  const [selectedPathSlug, setSelectedPathSlug] = useState(learningPaths[0]?.slug ?? '')
  const [resourceSearch, setResourceSearch] = useState('')
  const [resourceFilter, setResourceFilter] = useState<'All' | ResourceType>('All')
  const [audienceFilter, setAudienceFilter] = useState('All')
  const [topicFilter, setTopicFilter] = useState('All')
  const deferredResourceSearch = useDeferredValue(resourceSearch)
  const selectedPath =
    learningPaths.find((path) => path.slug === selectedPathSlug) ?? learningPaths[0]
  const featuredWorkshop = workshops[0]
  const upcomingWorkshops = workshops.slice(1)
  const resourceFilters: Array<'All' | ResourceType> = [
    'All',
    'Tutorial',
    'Video',
    'SOP',
    'Template',
    'Guide',
  ]
  const audienceFilters = ['All', ...new Set(resources.map((resource) => resource.audience))]
  const topicFilters = ['All', ...new Set(resources.map((resource) => resource.topic))]
  const resourcesBySlug = Object.fromEntries(
    resources.map((resource) => [resource.slug, resource] as const)
  )
  const normalizedSearch = deferredResourceSearch.trim().toLowerCase()
  const filteredResources = resources.filter((resource) => {
    const matchesType = resourceFilter === 'All' || resource.type === resourceFilter
    const matchesAudience =
      audienceFilter === 'All' || resource.audience === audienceFilter
    const matchesTopic = topicFilter === 'All' || resource.topic === topicFilter
    const matchesSearch =
      normalizedSearch.length === 0 ||
      [
        resource.title,
        resource.description,
        resource.topic,
        resource.audience,
        resource.type,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch)

    return matchesType && matchesAudience && matchesTopic && matchesSearch
  })

  return (
    <>
      <section className="bg-neutral-900 text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-uidaho-gold text-sm font-medium mb-6">
              <GraduationCap className="h-4 w-4" />
              Training & Learning Center
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-5">
              Learn GBRC workflows with guided paths, workshops, and practical resources.
            </h1>
            <p className="text-lg text-neutral-300 max-w-3xl leading-relaxed">
              The Training Center is the front door for GBRC learning content, helping
              researchers move from onboarding to confident execution across sample prep,
              sequencing strategy, and downstream analysis.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                to="/getting-started"
                className="inline-flex items-center gap-2 px-6 py-3 bg-uidaho-gold text-neutral-900 rounded-lg font-semibold hover:bg-uidaho-gold-dark transition-colors no-underline"
              >
                Start With Getting Started
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-600 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-colors no-underline"
              >
                Ask About Training
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 max-w-3xl">
              <HeroStat
                label="Learning Paths"
                value={learningPaths.length.toString()}
                description="Guided pathways for common GBRC workflows"
              />
              <HeroStat
                label="Workshops"
                value={workshops.length.toString()}
                description="Starter event entries ready for future publishing"
              />
              <HeroStat
                label="Resources"
                value={resources.length.toString()}
                description="Tutorials, guides, SOPs, templates, and videos"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">
              What This Center Will Include
            </h2>
            <p className="text-neutral-600 text-lg">
              The first release focuses on clear, curated GBRC training content that can
              grow into richer discovery, events, and learning experiences over time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sectionPreviews.map((section) => (
              <div
                key={section.title}
                className="bg-neutral-50 border border-neutral-200 rounded-xl p-6"
              >
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-uidaho-gold/15 text-uidaho-gold mb-4">
                  {section.icon}
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {section.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">{section.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">
              Built Around How Researchers Learn
            </h2>
            <p className="text-neutral-600 text-lg">
              This page is structured to support onboarding, just-in-time learning, and
              deeper training for recurring GBRC users.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {audienceCards.map((card) => (
              <div
                key={card.title}
                className="bg-white border border-neutral-200 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {card.title}
                </h3>
                <p className="text-neutral-600">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">
              Current Training Content
            </h2>
            <p className="text-neutral-600 text-lg">
              This release curates practical GBRC-specific learning content now, while
              leaving room for richer discovery and integrations later.
            </p>
          </div>

          <section className="space-y-5">
            <div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-2">
                Learning Paths
              </h3>
              <p className="text-neutral-600 max-w-3xl">
                Guided pathways for the most common ways researchers engage with GBRC.
                Choose a path to see the key modules and recommended next move.
              </p>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.35fr] gap-6 items-start">
              <div className="space-y-3">
                {learningPaths.map((path) => (
                  <LearningPathCard
                    key={path.slug}
                    path={path}
                    isActive={selectedPath?.slug === path.slug}
                    onSelect={() => setSelectedPathSlug(path.slug)}
                  />
                ))}
              </div>

              {selectedPath && (
                <div className="bg-neutral-900 text-white rounded-3xl p-7 lg:p-8">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full bg-white/10 text-uidaho-gold text-sm font-medium">
                      {selectedPath.audience}
                    </span>
                    <span className="text-sm text-neutral-400">
                      {selectedPath.modules.length} module
                      {selectedPath.modules.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <h4 className="text-3xl font-semibold mb-3">{selectedPath.title}</h4>
                  <p className="text-neutral-300 text-lg leading-relaxed max-w-2xl mb-7">
                    {selectedPath.summary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-7">
                    {selectedPath.modules.map((module, index) => (
                      <div
                        key={module.title}
                        className="rounded-2xl bg-white/5 border border-white/10 p-5"
                      >
                        <div className="text-xs uppercase tracking-wide text-neutral-400 mb-2">
                          Module {index + 1}
                        </div>
                        <div className="font-medium text-white mb-4">{module.title}</div>
                        <LearningModuleLink
                          resource={resourcesBySlug[module.resourceSlug]}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl bg-uidaho-gold text-neutral-900 p-5">
                    <div className="text-xs uppercase tracking-wide font-semibold mb-2">
                      Recommended Next Step
                    </div>
                    <p className="text-sm lg:text-base leading-relaxed">
                      {selectedPath.nextStep}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-2">
                Upcoming Workshops
              </h3>
              <p className="text-neutral-600 max-w-3xl">
                Workshop topics are framed around the real planning, submission, and data
                interpretation moments where GBRC users most often need training.
              </p>
            </div>
            {workshops.length === 0 ? (
              <div className="bg-neutral-50 border border-dashed border-neutral-300 rounded-2xl p-8">
                <div className="text-lg font-semibold text-neutral-900 mb-2">
                  No workshops are listed yet.
                </div>
                <p className="text-neutral-600 mb-5 max-w-2xl">
                  The Training Center is ready for workshop publishing. Until sessions are
                  scheduled, users should contact GBRC directly to ask about training
                  availability and recommended next steps.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 text-uidaho-gold-dark font-semibold no-underline hover:underline"
                >
                  Contact GBRC
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
                {featuredWorkshop && (
                  <div className="bg-neutral-900 text-white rounded-3xl p-7 lg:p-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-uidaho-gold text-sm font-medium mb-5">
                      <CalendarDays className="h-4 w-4" />
                      Featured workshop
                    </div>
                    <div className="text-sm font-medium text-neutral-300 mb-2">
                      {featuredWorkshop.dateLabel}
                    </div>
                    <h4 className="text-3xl font-semibold mb-4">
                      {featuredWorkshop.title}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                        <div className="text-xs uppercase tracking-wide text-neutral-400 mb-1">
                          Format
                        </div>
                        <div className="font-medium text-white">{featuredWorkshop.format}</div>
                      </div>
                      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                        <div className="text-xs uppercase tracking-wide text-neutral-400 mb-1">
                          Audience
                        </div>
                        <div className="font-medium text-white">{featuredWorkshop.audience}</div>
                      </div>
                    </div>
                    <Link
                      to={featuredWorkshop.registrationUrl}
                      className="inline-flex items-center gap-2 px-5 py-3 bg-uidaho-gold text-neutral-900 rounded-xl font-semibold no-underline hover:bg-uidaho-gold-dark transition-colors"
                    >
                      {featuredWorkshop.registrationLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}

                <div className="space-y-4">
                  {upcomingWorkshops.length > 0 ? (
                    upcomingWorkshops.map((workshop) => (
                      <div
                        key={workshop.slug}
                        className="bg-white border border-neutral-200 rounded-2xl p-5"
                      >
                        <div className="text-sm font-medium text-uidaho-gold mb-2">
                          {workshop.dateLabel}
                        </div>
                        <h4 className="text-xl font-semibold text-neutral-900 mb-2">
                          {workshop.title}
                        </h4>
                        <div className="space-y-1 text-sm text-neutral-600 mb-4">
                          <div>Format: {workshop.format}</div>
                          <div>Audience: {workshop.audience}</div>
                        </div>
                        <Link
                          to={workshop.registrationUrl}
                          className="inline-flex items-center gap-2 text-uidaho-gold-dark font-semibold no-underline hover:underline"
                        >
                          {workshop.registrationLabel}
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="bg-neutral-50 border border-dashed border-neutral-300 rounded-2xl p-6">
                      <div className="font-semibold text-neutral-900 mb-2">
                        More workshops coming soon
                      </div>
                      <p className="text-sm text-neutral-600">
                        As the calendar grows, additional sessions will appear here with
                        direct registration actions.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="space-y-5">
            <div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-2">
                Resource Library
              </h3>
              <p className="text-neutral-600 max-w-3xl">
                A curated library of tutorials, guides, videos, SOPs, and templates for
                common GBRC learning needs.
              </p>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 lg:p-6 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                <label className="relative block lg:w-[26rem]">
                  <Search className="h-4 w-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={resourceSearch}
                    onChange={(event) => setResourceSearch(event.target.value)}
                    placeholder="Search resources by title, topic, audience, or description"
                    className="w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-11 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-uidaho-gold/40 focus:border-uidaho-gold/40"
                  />
                  {resourceSearch && (
                    <button
                      type="button"
                      onClick={() => setResourceSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700"
                      aria-label="Clear resource search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setResourceSearch('')
                    setResourceFilter('All')
                    setAudienceFilter('All')
                    setTopicFilter('All')
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  Reset filters
                </button>
              </div>

              <div className="space-y-3">
                <FilterRow
                  label="Type"
                  options={resourceFilters}
                  selected={resourceFilter}
                  onSelect={(value) => setResourceFilter(value as 'All' | ResourceType)}
                />
                <FilterRow
                  label="Audience"
                  options={audienceFilters}
                  selected={audienceFilter}
                  onSelect={setAudienceFilter}
                />
                <FilterRow
                  label="Topic"
                  options={topicFilters}
                  selected={topicFilter}
                  onSelect={setTopicFilter}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {resourceFilter !== 'All' && <ActiveFilterChip label={`Type: ${resourceFilter}`} />}
              {audienceFilter !== 'All' && <ActiveFilterChip label={`Audience: ${audienceFilter}`} />}
              {topicFilter !== 'All' && <ActiveFilterChip label={`Topic: ${topicFilter}`} />}
              {normalizedSearch && <ActiveFilterChip label={`Search: ${resourceSearch}`} />}
            </div>
            <div className="text-sm text-neutral-500">
              Showing {filteredResources.length} resource
              {filteredResources.length === 1 ? '' : 's'}
              {resourceFilter === 'All' ? '' : ` in ${resourceFilter}`}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <div
                  key={resource.slug}
                  className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      {resource.type}
                    </span>
                    {resource.duration && (
                      <span className="text-xs text-neutral-500">{resource.duration}</span>
                    )}
                  </div>
                  <h4 className="text-lg font-semibold text-neutral-900 mb-2">
                    {resource.title}
                  </h4>
                  <div className="text-sm text-uidaho-gold mb-2">
                    {resource.topic} · {resource.audience}
                  </div>
                  <p className="text-neutral-600 text-sm mb-4">{resource.description}</p>
                  <Link
                    to={resource.linkUrl}
                    className="inline-flex items-center gap-2 text-uidaho-gold-dark font-semibold no-underline hover:underline"
                  >
                    {resource.linkLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
            {filteredResources.length === 0 && (
              <div className="bg-neutral-50 border border-dashed border-neutral-300 rounded-2xl p-6">
                <div className="font-semibold text-neutral-900 mb-2">
                  No resources match this filter yet
                </div>
                <p className="text-neutral-600 text-sm">
                  Keep the structure in place and add more resources over time as the
                  Training Center expands.
                </p>
              </div>
            )}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 lg:p-7">
              <div className="text-sm font-medium text-uidaho-gold mb-2">Support handoff</div>
              <h4 className="text-2xl font-semibold text-neutral-900 mb-3">
                Need something more specific than a guide or workshop?
              </h4>
              <p className="text-neutral-600 max-w-3xl mb-5">
                The library is designed to help users self-serve, but some needs are best
                handled through direct consultation, project intake, or a service request.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 text-uidaho-gold-dark font-semibold no-underline hover:underline"
                >
                  Contact the team
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/project-intake"
                  className="inline-flex items-center gap-2 text-uidaho-gold-dark font-semibold no-underline hover:underline"
                >
                  Start project intake
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="bg-uidaho-gold py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <PlayCircle className="h-10 w-10 text-neutral-900 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-neutral-900 mb-3">
            Need help choosing the right learning path?
          </h2>
          <p className="text-neutral-800 text-lg max-w-2xl mx-auto mb-8">
            If you are unsure where to begin, start with project intake or contact the
            team for guidance on training, services, and recommended next steps.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/project-intake"
              className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-colors no-underline"
            >
              Open Project Intake
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-900 text-neutral-900 rounded-lg font-semibold hover:bg-amber-400 transition-colors no-underline"
            >
              Contact GBRC
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

function LearningModuleLink({
  resource,
}: {
  resource?: TrainingResource
}) {
  if (!resource) {
    return <div className="text-sm text-neutral-400">Linked resource coming soon.</div>
  }

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs uppercase tracking-wide text-uidaho-gold">
          {resource.type}
        </span>
        {resource.duration && (
          <span className="text-xs text-neutral-400">{resource.duration}</span>
        )}
      </div>
      <div className="font-medium text-white mb-1">{resource.title}</div>
      <div className="text-sm text-neutral-300 mb-3">{resource.description}</div>
      <Link
        to={resource.linkUrl}
        className="inline-flex items-center gap-2 text-uidaho-gold font-semibold no-underline hover:underline"
      >
        {resource.linkLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

function FilterRow({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string
  options: string[]
  selected: string
  onSelect: (value: string) => void
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="text-sm font-medium text-neutral-600 sm:w-20 shrink-0">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selected === option
                ? 'bg-neutral-900 text-white'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function ActiveFilterChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 text-sm font-medium">
      {label}
    </span>
  )
}

function HeroStat({
  label,
  value,
  description,
}: {
  label: string
  value: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-wide text-neutral-400 mb-2">{label}</div>
      <div className="text-3xl font-semibold text-white mb-1">{value}</div>
      <p className="text-sm text-neutral-400 leading-relaxed">{description}</p>
    </div>
  )
}

function LearningPathCard({
  path,
  isActive,
  onSelect,
}: {
  path: LearningPath
  isActive: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-2xl border p-5 transition-all ${
        isActive
          ? 'border-uidaho-gold bg-amber-50 shadow-sm'
          : 'border-neutral-200 bg-neutral-50 hover:bg-white hover:border-neutral-300'
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="text-sm font-medium text-uidaho-gold mb-1">{path.audience}</div>
          <h4 className="text-lg font-semibold text-neutral-900">{path.title}</h4>
        </div>
        {isActive && <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />}
      </div>
      <p className="text-neutral-600 text-sm leading-relaxed mb-3">{path.summary}</p>
      <div className="text-xs uppercase tracking-wide text-neutral-500">
        {path.modules.length} module{path.modules.length === 1 ? '' : 's'}
      </div>
    </button>
  )
}
