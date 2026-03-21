import { Target, Award, Users, BookOpen, Mail, Phone, ExternalLink } from 'lucide-react'

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

      {/* Team */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-10 text-center">
            Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sarah Hendricks */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 text-center">
              <img src="https://www.iids.uidaho.edu/img/people/shendricks.jpg" alt="Sarah Hendricks" className="w-20 h-20 rounded-full object-cover mx-auto mb-4" />
              <h3 className="font-semibold text-neutral-900 text-lg">Sarah Hendricks</h3>
              <p className="text-uidaho-gold font-medium text-sm mb-4">Bioinformatic Data Scientist</p>
              <div className="space-y-2 text-sm text-neutral-600">
                <a href="mailto:shendricks@uidaho.edu" className="flex items-center justify-center gap-2 hover:text-uidaho-gold transition-colors">
                  <Mail className="h-4 w-4" />
                  shendricks@uidaho.edu
                </a>
                <a href="https://sarahhendricks.weebly.com/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 hover:text-uidaho-gold transition-colors">
                  <ExternalLink className="h-4 w-4" />
                  Personal Website
                </a>
              </div>
            </div>

            {/* Dan New */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 text-center">
              <div className="w-20 h-20 bg-uidaho-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">DN</span>
              </div>
              <h3 className="font-semibold text-neutral-900 text-lg">Dan New</h3>
              <p className="text-uidaho-gold font-medium text-sm mb-4">Lab Manager</p>
              <div className="space-y-2 text-sm text-neutral-600">
                <a href="mailto:dnew@uidaho.edu" className="flex items-center justify-center gap-2 hover:text-uidaho-gold transition-colors">
                  <Mail className="h-4 w-4" />
                  dnew@uidaho.edu
                </a>
                <a href="tel:208-885-7023" className="flex items-center justify-center gap-2 hover:text-uidaho-gold transition-colors">
                  <Phone className="h-4 w-4" />
                  208-885-7023
                </a>
              </div>
            </div>

            {/* Austin Kobernuss */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 text-center">
              <img src="https://www.iids.uidaho.edu/img/people/akobernuss.jpg" alt="Austin Kobernuss" className="w-20 h-20 rounded-full object-cover mx-auto mb-4" />
              <h3 className="font-semibold text-neutral-900 text-lg">Austin Kobernuss</h3>
              <p className="text-uidaho-gold font-medium text-sm mb-4">Lab Coordinator</p>
              <div className="space-y-2 text-sm text-neutral-600">
                <a href="mailto:akobernuss@uidaho.edu" className="flex items-center justify-center gap-2 hover:text-uidaho-gold transition-colors">
                  <Mail className="h-4 w-4" />
                  akobernuss@uidaho.edu
                </a>
                <a href="tel:208-885-7023" className="flex items-center justify-center gap-2 hover:text-uidaho-gold transition-colors">
                  <Phone className="h-4 w-4" />
                  208-885-7023
                </a>
              </div>
            </div>
          </div>
          <p className="text-center text-neutral-500 italic mt-10">
            Steering Committee — coming soon.
          </p>
        </div>
      </section>
    </>
  )
}
