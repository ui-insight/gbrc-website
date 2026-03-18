import { Target, Award, Users, BookOpen } from 'lucide-react'

export default function About() {
  return (
    <>
      {/* Header */}
      <section className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">About GBRC</h1>
          <p className="text-xl text-neutral-300 max-w-2xl">
            The IIDS Genomics and Bioinformatics Resources Core at the University of
            Idaho.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4 mb-8">
            <Target className="h-8 w-8 text-uidaho-gold flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Our Mission</h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                The GBRC serves as a functional extension of your laboratory, providing
                access to ~$1.8 million in specialized genomic equipment and expert
                personnel. Our mission is to enable researchers across the University of
                Idaho and beyond to leverage cutting-edge genomic technologies in their
                research programs.
              </p>
              <p className="text-neutral-600 leading-relaxed">
                We operate on the "Interdisciplinary Triangle of Collaboration" model,
                bringing together PIs, bioinformaticians, and molecular scientists to
                ensure every project benefits from comprehensive expertise at each stage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-neutral-900 text-center mb-10">
            What Sets Us Apart
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-neutral-200 rounded-xl p-6 text-center">
              <Award className="h-8 w-8 text-uidaho-gold mx-auto mb-4" />
              <h3 className="font-semibold text-neutral-900 mb-2">Expert Consultation</h3>
              <p className="text-neutral-600 text-sm">
                Free consultation from experimental design through data interpretation,
                ensuring your project is set up for success.
              </p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl p-6 text-center">
              <Users className="h-8 w-8 text-uidaho-gold mx-auto mb-4" />
              <h3 className="font-semibold text-neutral-900 mb-2">
                Open Access Model
              </h3>
              <p className="text-neutral-600 text-sm">
                Available to all University of Idaho researchers as well as external
                academic and industry partners.
              </p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl p-6 text-center">
              <BookOpen className="h-8 w-8 text-uidaho-gold mx-auto mb-4" />
              <h3 className="font-semibold text-neutral-900 mb-2">
                Training & Education
              </h3>
              <p className="text-neutral-600 text-sm">
                Hands-on workshops and training in genomic technologies and
                bioinformatics analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team - placeholder for real content */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">
            Our Team
          </h2>
          <p className="text-center text-neutral-500 italic">
            Team member profiles coming soon. Contact us at the information below for
            inquiries.
          </p>
        </div>
      </section>
    </>
  )
}
