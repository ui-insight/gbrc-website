import { ArrowRight, CheckCircle2 } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Register on iLab',
    description:
      'Create an account on the iLab service portal. You will need your University of Idaho credentials or create an external user account.',
  },
  {
    number: '02',
    title: 'Schedule a Consultation',
    description:
      'Meet with our team to discuss your project goals, experimental design, and the best sequencing strategy for your research questions.',
  },
  {
    number: '03',
    title: 'Submit Your Samples',
    description:
      'Follow our sample submission guidelines to prepare and deliver your samples. We will perform quality assessment upon receipt.',
  },
  {
    number: '04',
    title: 'Track Your Project',
    description:
      'Monitor progress through the iLab portal. You will receive notifications at key milestones including QC results and run completion.',
  },
  {
    number: '05',
    title: 'Receive Your Data',
    description:
      'Access your sequencing data and analysis results. Our bioinformatics team can provide standard or custom analysis pipelines.',
  },
]

const sampleGuidelines = [
  'Minimum DNA concentration: 10 ng/uL (Qubit quantified)',
  'Minimum RNA RIN: 7.0 for RNA-seq applications',
  'Samples should be submitted in 1.5 mL low-bind microcentrifuge tubes',
  'Label tubes clearly with sample ID matching your iLab submission',
  'Include a completed sample submission form with your delivery',
  'Store samples at appropriate temperature during transport',
]

export default function GettingStarted() {
  return (
    <>
      {/* Header */}
      <section className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Getting Started</h1>
          <p className="text-xl text-neutral-300 max-w-2xl">
            New to GBRC? Follow these steps to submit your first project and start
            generating data.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-uidaho-gold text-neutral-900 font-bold text-lg flex items-center justify-center">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-px h-full bg-neutral-200 mx-auto mt-2" />
                  )}
                </div>
                <div className="pb-8">
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Guidelines */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Sample Submission Guidelines
          </h2>
          <div className="bg-white border border-neutral-200 rounded-xl p-6">
            <ul className="space-y-3">
              {sampleGuidelines.map((guideline) => (
                <li key={guideline} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-700">{guideline}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Data Policies */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Data Policies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6">
              <h3 className="font-semibold text-neutral-900 mb-2">Data Retention</h3>
              <p className="text-neutral-600 text-sm">
                Raw sequencing data is retained for one year from the date of generation.
                Please download your data promptly. Extended storage can be arranged upon
                request.
              </p>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6">
              <h3 className="font-semibold text-neutral-900 mb-2">Data Access</h3>
              <p className="text-neutral-600 text-sm">
                Data access is restricted to the submitting lab until all associated
                charges have been settled. Contact us if you need to share data with
                collaborators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-uidaho-gold py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">Ready to Begin?</h2>
          <p className="text-neutral-800 mb-6">
            Register on iLab to get started, or contact us for a free consultation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://my.ilabsolutions.com/service_center/show_external/3232/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-colors no-underline"
            >
              Register on iLab
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
