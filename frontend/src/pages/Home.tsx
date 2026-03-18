import { Link } from 'react-router-dom'
import {
  Dna,
  FlaskConical,
  BarChart3,
  Users,
  BookOpen,
  ArrowRight,
  Microscope,
  Cpu,
  Workflow,
} from 'lucide-react'

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-neutral-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-uidaho-gold/20 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1 w-12 bg-uidaho-gold rounded" />
              <span className="text-uidaho-gold font-medium text-sm uppercase tracking-wider">
                University of Idaho
              </span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              Genomics &amp; Bioinformatics{' '}
              <span className="text-uidaho-gold">Resources Core</span>
            </h1>
            <p className="text-xl text-neutral-300 leading-relaxed mb-8 max-w-2xl">
              Enabling cutting-edge genomic research through state-of-the-art sequencing,
              bioinformatics analysis, and expert consultation. Your research partner from
              experimental design to data interpretation.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://my.ilabsolutions.com/service_center/show_external/3232/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-uidaho-gold text-neutral-900 rounded-lg font-semibold hover:bg-uidaho-gold-dark transition-colors no-underline"
              >
                Request Services
                <ArrowRight className="h-5 w-5" />
              </a>
              <Link
                to="/getting-started"
                className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-600 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-colors no-underline"
              >
                Getting Started Guide
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interdisciplinary Triangle */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              The Interdisciplinary Triangle of Collaboration
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              We bring together principal investigators, bioinformaticians, and molecular
              scientists to deliver comprehensive genomic solutions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TriangleCard
              icon={<Users className="h-8 w-8" />}
              title="Principal Investigators"
              description="Collaborate with our team from experimental design through publication. We help translate your research questions into optimized genomic workflows."
            />
            <TriangleCard
              icon={<Cpu className="h-8 w-8" />}
              title="Bioinformaticians"
              description="Expert computational analysis from quality control and alignment to differential expression, variant calling, and custom pipelines."
            />
            <TriangleCard
              icon={<Microscope className="h-8 w-8" />}
              title="Molecular Scientists"
              description="Skilled bench scientists operating ~$1.8M in specialized genomic equipment with rigorous quality control at every step."
            />
          </div>
        </div>
      </section>

      {/* Core Services Overview */}
      <section className="bg-neutral-50 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Core Services</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Comprehensive genomic services from sample preparation to data analysis.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceCard
              icon={<Dna className="h-6 w-6" />}
              title="PacBio Sequencing"
              description="Long-read HiFi and CLR sequencing for genome assembly, structural variant detection, and full-length transcript analysis."
            />
            <ServiceCard
              icon={<FlaskConical className="h-6 w-6" />}
              title="Illumina Sequencing"
              description="Short-read sequencing on NextSeq, MiSeq, and NovaSeq platforms for a wide range of genomic applications."
            />
            <ServiceCard
              icon={<Workflow className="h-6 w-6" />}
              title="RNA Sequencing"
              description="Bulk and single-cell RNA-seq for transcriptome profiling, gene expression, and pathway analysis."
            />
            <ServiceCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Bioinformatics"
              description="Standard and custom computational analysis including alignment, variant calling, differential expression, and more."
            />
            <ServiceCard
              icon={<Microscope className="h-6 w-6" />}
              title="Sample Preparation"
              description="DNA/RNA isolation, library preparation, size selection, and quality assessment with fragment analysis."
            />
            <ServiceCard
              icon={<BookOpen className="h-6 w-6" />}
              title="Consultation"
              description="Free expert consultation for experimental design, technology selection, and project planning."
            />
          </div>
          <div className="text-center mt-10">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-uidaho-gold-dark font-semibold hover:underline no-underline"
            >
              View full service catalog
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Consultation CTA */}
      <section className="bg-uidaho-gold py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Free Consultation
          </h2>
          <p className="text-lg text-neutral-800 max-w-2xl mx-auto mb-8">
            Not sure where to start? Schedule a free consultation with our team. We'll
            help you design your experiment, choose the right technology, and plan your
            analysis pipeline.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-3 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-colors no-underline"
          >
            Schedule a Consultation
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Publications / Acknowledgment */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <BookOpen className="h-10 w-10 text-uidaho-gold mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Publication Acknowledgment
            </h2>
            <p className="text-neutral-600 mb-6">
              If our services contributed to your research, please include the following
              acknowledgment in your publications:
            </p>
            <blockquote className="bg-neutral-50 border-l-4 border-uidaho-gold p-6 rounded-r-lg text-left">
              <p className="text-neutral-700 italic">
                "Data collection and analyses performed by the University of Idaho IIDS
                Genomics and Bioinformatics Resource Core Facility, RRID:SCR_026416"
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Getting Started CTA */}
      <section className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto mb-8">
            New to GBRC? Check out our getting started guide to learn how to submit
            samples, request services, and access your data.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/getting-started"
              className="inline-flex items-center gap-2 px-6 py-3 bg-uidaho-gold text-neutral-900 rounded-lg font-semibold hover:bg-uidaho-gold-dark transition-colors no-underline"
            >
              Getting Started Guide
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="https://my.ilabsolutions.com/service_center/show_external/3232/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-600 rounded-lg font-semibold hover:bg-neutral-800 transition-colors no-underline text-white"
            >
              iLab Service Portal
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

function TriangleCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 text-uidaho-gold rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-neutral-900 mb-3">{title}</h3>
      <p className="text-neutral-600 leading-relaxed">{description}</p>
    </div>
  )
}

function ServiceCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-md hover:border-uidaho-gold/30 transition-all">
      <div className="inline-flex items-center justify-center w-10 h-10 bg-primary-50 text-uidaho-gold rounded-lg mb-3">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-600 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
