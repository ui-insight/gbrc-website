import {
  Dna,
  FlaskConical,
  Workflow,
  BarChart3,
  Microscope,
  ArrowRight,
} from 'lucide-react'

const serviceCategories = [
  {
    icon: <Dna className="h-7 w-7" />,
    name: 'PacBio Sequencing',
    description: 'Long-read sequencing on the PacBio platform for genome assembly, structural variants, and isoform analysis.',
    services: [
      { name: 'PacBio Library Preparation', detail: 'SMRTbell library construction for HiFi and CLR sequencing' },
      { name: 'PacBio SMRTcell Sequencing', detail: 'HiFi and CLR sequencing runs with real-time quality monitoring' },
      { name: 'Iso-Seq Library Prep', detail: 'Full-length isoform sequencing for transcriptome characterization' },
    ],
  },
  {
    icon: <FlaskConical className="h-7 w-7" />,
    name: 'Illumina Sequencing',
    description: 'Short-read sequencing on NextSeq, MiSeq, and NovaSeq platforms for diverse genomic applications.',
    services: [
      { name: 'DNA Library Preparation', detail: 'Whole genome, targeted, and amplicon library construction' },
      { name: 'Illumina Sequencing Run', detail: 'Flexible run configurations across multiple platforms' },
      { name: 'Genotyping', detail: 'SNP genotyping and amplicon-based variant detection' },
    ],
  },
  {
    icon: <Workflow className="h-7 w-7" />,
    name: 'RNA Sequencing',
    description: 'Transcriptome analysis from bulk RNA-seq to single-cell approaches.',
    services: [
      { name: 'RNA-seq Library Prep', detail: 'mRNA and total RNA library construction with ribosomal depletion' },
      { name: 'Single-cell RNA-seq', detail: '10x Genomics Chromium workflows for single-cell transcriptomics' },
      { name: 'Small RNA Sequencing', detail: 'miRNA and small RNA profiling' },
    ],
  },
  {
    icon: <BarChart3 className="h-7 w-7" />,
    name: 'Bioinformatics',
    description: 'Computational analysis and custom consultation from QC to publication-ready figures.',
    services: [
      { name: 'Standard Analysis', detail: 'Alignment, QC, differential expression, and variant calling' },
      { name: 'Custom Consultation', detail: 'Project-specific bioinformatics pipelines and analysis' },
      { name: 'Training & Workshops', detail: 'Hands-on bioinformatics training for researchers' },
    ],
  },
  {
    icon: <Microscope className="h-7 w-7" />,
    name: 'Sample Preparation',
    description: 'DNA/RNA extraction, quality assessment, and sample processing.',
    services: [
      { name: 'DNA Isolation', detail: 'High-quality genomic DNA extraction from diverse sample types' },
      { name: 'RNA Isolation', detail: 'Total RNA extraction with RIN quality assessment' },
      { name: 'Fragment Analysis', detail: 'Agilent and AATI fragment analysis for size and quality' },
      { name: 'Size Selection', detail: 'Blue Pippin and bead-based size selection' },
    ],
  },
]

export default function Services() {
  return (
    <>
      {/* Header */}
      <section className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Services</h1>
          <p className="text-xl text-neutral-300 max-w-2xl">
            Comprehensive genomic services from sample preparation through data analysis.
            View pricing and request services through our iLab portal.
          </p>
        </div>
      </section>

      {/* Service Categories */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {serviceCategories.map((category) => (
            <div
              key={category.name}
              className="border border-neutral-200 rounded-xl overflow-hidden"
            >
              <div className="bg-neutral-50 p-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="text-uidaho-gold">{category.icon}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900">
                      {category.name}
                    </h2>
                    <p className="text-neutral-600 mt-1">{category.description}</p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-neutral-100">
                {category.services.map((service) => (
                  <div key={service.name} className="p-6 hover:bg-neutral-50 transition-colors">
                    <h3 className="font-semibold text-neutral-900">{service.name}</h3>
                    <p className="text-neutral-600 text-sm mt-1">{service.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="bg-uidaho-gold py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">
            View Pricing & Request Services
          </h2>
          <p className="text-neutral-800 mb-6">
            Detailed pricing for internal, external, and corporate rates is available on
            our iLab portal.
          </p>
          <a
            href="https://my.ilabsolutions.com/service_center/show_external/3232/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-colors no-underline"
          >
            Go to iLab Portal
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>
    </>
  )
}
