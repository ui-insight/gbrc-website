import { MapPin, Mail, Phone, Clock } from 'lucide-react'

export default function Contact() {
  return (
    <>
      {/* Header */}
      <section className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-neutral-300 max-w-2xl">
            Get in touch to schedule a consultation, ask about our services, or plan
            your next genomics project.
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Details */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                Get in Touch
              </h2>
              <div className="space-y-6">
                <ContactItem
                  icon={<MapPin className="h-5 w-5" />}
                  label="Location"
                  value="IRIC 210, 685 S. Line Street, Moscow, Idaho 83844"
                />
                <ContactItem
                  icon={<Mail className="h-5 w-5" />}
                  label="Email"
                  value="gbrc@uidaho.edu"
                />
                <ContactItem
                  icon={<Phone className="h-5 w-5" />}
                  label="Phone"
                  value="Contact details coming soon"
                />
                <ContactItem
                  icon={<Clock className="h-5 w-5" />}
                  label="Hours"
                  value="Monday - Friday, 8:00 AM - 5:00 PM PT"
                />
              </div>
            </div>

            {/* Consultation Info */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                Schedule a Consultation
              </h2>
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6">
                <p className="text-neutral-600 mb-4">
                  We offer free consultations for all prospective and current users.
                  During your consultation, we can help with:
                </p>
                <ul className="space-y-2 text-neutral-600 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-uidaho-gold font-bold">-</span>
                    Experimental design and technology selection
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-uidaho-gold font-bold">-</span>
                    Sample preparation and submission requirements
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-uidaho-gold font-bold">-</span>
                    Bioinformatics analysis planning
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-uidaho-gold font-bold">-</span>
                    Budget estimation and timeline planning
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-uidaho-gold font-bold">-</span>
                    Grant proposal support for genomics aims
                  </li>
                </ul>
                <div className="mt-6">
                  <a
                    href="mailto:gbrc@uidaho.edu"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-uidaho-gold text-neutral-900 rounded-lg font-semibold hover:bg-uidaho-gold-dark transition-colors no-underline"
                  >
                    <Mail className="h-4 w-4" />
                    Email Us to Schedule
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function ContactItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-uidaho-gold mt-0.5">{icon}</div>
      <div>
        <p className="font-semibold text-neutral-900 text-sm">{label}</p>
        <p className="text-neutral-600">{value}</p>
      </div>
    </div>
  )
}
