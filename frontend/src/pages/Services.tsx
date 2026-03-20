import { useState } from 'react'
import {
  Dna,
  FlaskConical,
  BarChart3,
  Microscope,
  ArrowRight,
  ChevronDown,
} from 'lucide-react'

const serviceCategories = [
  {
    icon: <Microscope className="h-7 w-7" />,
    name: 'Sample Preparation',
    description: 'DNA extraction, quality assessment, and sample processing.',
    services: [
      { name: 'Fragment Analysis', detail: 'Agilent and AATI fragment analysis for size and quality' },
      { name: 'Nanodrop Quantification', detail: 'UV-Vis spectrophotometric measurement of nucleic acid concentration and purity' },
      { name: 'Qubit Quantification', detail: 'Fluorometric quantification for accurate DNA and RNA concentration measurement' },
      { name: 'Size Selection', detail: 'Blue Pippin and bead-based size selection' },
      { name: 'DNA Isolation (time pending)', detail: 'High-quality genomic DNA extraction from diverse sample types' },
    ],
  },
  {
    icon: <Dna className="h-7 w-7" />,
    name: 'Library Preparation',
    description: 'Comprehensive library construction services for sequencing on multiple platforms.',
    services: [
      { name: 'PacBio Library Preparation', detail: 'SMRTbell library construction for HiFi and CLR sequencing' },
      { name: 'Whole Genome Library Preparation', detail: 'Comprehensive genomic DNA library construction for whole genome sequencing' },
      { name: 'Targeted Library Preparation', detail: 'Enrichment-based library construction for targeted sequencing panels' },
      { name: 'Amplicon Library Preparation', detail: 'PCR-based amplicon library construction for targeted regions' },
      { name: 'RNA-seq Library Preparation', detail: 'mRNA and total RNA library construction with ribosomal depletion' },
      { name: 'Oxford Nanopore Library Preparation', detail: 'Library construction for long-read nanopore sequencing' },
      { name: 'Iso-Seq Library Preparation', detail: 'Full-length isoform sequencing for transcriptome characterization' },
    ],
  },
  {
    icon: <FlaskConical className="h-7 w-7" />,
    name: 'Aviti Sequencing',
    description: 'Short-read sequencing on the Aviti platform, fully compatible with Illumina libraries, for diverse genomic applications.',
    services: [
      { name: 'Aviti Sequencing Run', detail: 'Flexible run configurations for high-throughput sequencing' },
    ],
  },
  {
    icon: <BarChart3 className="h-7 w-7" />,
    name: 'Bioinformatics',
    description: 'Computational analysis and custom consultation from QC to publication-ready figures.',
    services: [
      { name: 'Custom Consultation', detail: 'Project-specific bioinformatics pipelines and analysis' },
      { name: 'Standard Analysis', detail: '• QC\n• Alignment\n• Variant calling\n• Differential expression' },
      { name: 'Training', detail: 'Hands-on bioinformatics training for researchers' },
    ],
  },
]

export default function Services() {
  const [aviti24Open, setAviti24Open] = useState(false)

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
                    <p className="text-neutral-600 text-sm mt-1 whitespace-pre-line">{service.detail}</p>
                  </div>
                ))}
              </div>

              {/* AVITI24 Dropdown */}
              {category.name === 'Aviti Sequencing' && (
                <div className="border-t border-neutral-200">
                  <button
                    onClick={() => setAviti24Open(!aviti24Open)}
                    className="w-full flex items-center justify-between p-6 bg-neutral-50 hover:bg-neutral-100 transition-colors text-left"
                  >
                    <div>
                      <h3 className="font-semibold text-neutral-900">
                        About the Element AVITI24
                      </h3>
                      <p className="text-neutral-600 text-sm mt-1">
                        Platform specifications, throughput, and capabilities
                      </p>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-neutral-500 transition-transform ${
                        aviti24Open ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {aviti24Open && (
                    <div className="p-6 bg-white space-y-6 text-sm text-neutral-700">
                      <p>
                        The GBRC operates the <strong>Element AVITI24</strong>, a next-generation
                        benchtop sequencer that delivers high-throughput, high-accuracy short-read
                        sequencing fully compatible with standard Illumina libraries.
                      </p>

                      <p>
                        The AVITI24 is the first and only <strong>5D multiomics platform</strong>,
                        uniquely capable of performing both next-generation sequencing and in situ
                        spatial biology on a single instrument. Using Element's
                        {' '}<strong>Teton CytoProfiling</strong> workflow, researchers can simultaneously
                        detect RNA transcripts, protein markers, and tissue morphology directly in
                        intact tissue sections — all on the same flow cell. This enables spatially
                        resolved, multi-analyte profiling that connects gene expression and protein
                        abundance to their precise locations within complex tissues, providing
                        biological context that bulk or single-cell approaches alone cannot capture.
                        The dual flow cell design allows a spatial multiomics run and a standard
                        sequencing run to proceed concurrently, maximizing instrument utilization.
                      </p>

                      <div>
                        <h4 className="font-semibold text-neutral-900 mb-2">Sequencing Kits &amp; Output</h4>
                        <p className="mb-2">
                          Cloudbreak sequencing kits are available in three output levels per flow cell,
                          with flexible read lengths to match any experimental scale:
                        </p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border border-neutral-200 rounded-lg overflow-hidden">
                            <thead className="bg-neutral-100">
                              <tr>
                                <th className="px-4 py-2 font-semibold text-neutral-900">Output Level</th>
                                <th className="px-4 py-2 font-semibold text-neutral-900">Reads / Flow Cell</th>
                                <th className="px-4 py-2 font-semibold text-neutral-900">Read Lengths</th>
                                <th className="px-4 py-2 font-semibold text-neutral-900">Est. Run Time</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                              <tr>
                                <td className="px-4 py-2">High Output</td>
                                <td className="px-4 py-2"><strong>1.5 B</strong></td>
                                <td className="px-4 py-2">2×75, 2×150, 2×300</td>
                                <td className="px-4 py-2">24–60 hrs</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-2">Medium Output</td>
                                <td className="px-4 py-2"><strong>750 M</strong></td>
                                <td className="px-4 py-2">2×75, 2×150, 2×300</td>
                                <td className="px-4 py-2">24–60 hrs</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-2">Low Output</td>
                                <td className="px-4 py-2"><strong>375 M</strong></td>
                                <td className="px-4 py-2">2×75, 2×150, 2×300</td>
                                <td className="px-4 py-2">24–60 hrs</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <p className="mt-2 text-xs text-neutral-500">
                          Dual flow cells run independently — combine any two output levels in a single run
                          for up to 3 B total reads. AVITI OS v3.4+ boosts output ~50%.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-neutral-900 mb-2">Throughput &amp; Capacity</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Up to <strong>3 billion reads</strong> per run across dual flow cells</li>
                          <li>Up to <strong>1.5 billion reads per flow cell</strong></li>
                          <li>Dual independent flow cells with flexible, asynchronous start times for maximum lab efficiency</li>
                          <li>AVITI OS v3.4+ delivers ~50% increased sequencing output</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-neutral-900 mb-2">Read Length &amp; Flexibility</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Flexible read lengths from <strong>2×75 bp</strong> up to <strong>2×300 bp</strong></li>
                          <li>Dual index and UMI support on all configurations</li>
                          <li>Two 2×150 runs with indexing generate up to 600 GB and 2 billion reads in ~38 hours</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-neutral-900 mb-2">Data Quality</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Industry-leading accuracy: <strong>≥90% of bases at Q40</strong> and <strong>≥70% at Q50</strong> with Cloudbreak UltraQ chemistry</li>
                          <li>Onboard image processing system delivers real-time, publication-ready data quality</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-neutral-900 mb-2">Illumina Compatibility</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Fully compatible with standard Illumina library preparations — no protocol changes required</li>
                          <li>Run existing Illumina libraries directly on the AVITI24 with equivalent or better results</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-neutral-900 mb-2">Applications</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Whole genome sequencing</li>
                          <li>Targeted and amplicon sequencing</li>
                          <li>RNA-seq and gene expression profiling</li>
                          <li>Single-cell sequencing (10x Genomics compatible)</li>
                          <li>Metagenomics and microbiome studies</li>
                          <li>Spatial multiomics (RNA, protein, and morphology co-detection)</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
