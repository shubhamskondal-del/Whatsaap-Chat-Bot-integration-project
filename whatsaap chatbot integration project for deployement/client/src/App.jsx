import { useState } from 'react'
import './App.css'

const initialForm = {
  name: '',
  whatsapp: '',
  email: '',
  city: '',
  message: '',
}

const fields = [
  {
    name: 'name',
    label: 'Full name',
    type: 'text',
    placeholder: 'e.g. Shubham Kaundal',
    icon: 'user',
    autoComplete: 'name',
  },
  {
    name: 'whatsapp',
    label: 'WhatsApp number',
    type: 'tel',
    placeholder: '+91 98765 43210',
    icon: 'phone',
    autoComplete: 'tel',
  },
  {
    name: 'email',
    label: 'Work email',
    type: 'email',
    placeholder: 'you@company.com',
    icon: 'mail',
    autoComplete: 'email',
  },
  {
    name: 'city',
    label: 'City',
    type: 'text',
    placeholder: 'e.g. Mumbai',
    icon: 'pin',
    autoComplete: 'address-level2',
  },
]

function FieldIcon({ name }) {
  const common = {
    width: 19,
    height: 19,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  const paths = {
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.7-3.1 3.2-5 7-5s6.3 1.9 7 5" /></>,
    phone: <><path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M10 18h4" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    message: <><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-3.5-.7L4 20l1.4-3.5A7.2 7.2 0 0 1 4 12c0-4.1 3.6-7.5 8-7.5s8 3.1 8 7Z" /></>,
  }

  return <svg {...common}>{paths[name]}</svg>
}

function WhatsAppMark({ small = false }) {
  return (
    <span className={`wa-mark ${small ? 'wa-mark--small' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path d="M16 3.2A12.5 12.5 0 0 0 5.2 22.1L3.5 28.5l6.6-1.7A12.5 12.5 0 1 0 16 3.2Z" fill="currentColor" />
        <path d="M22.3 19.1c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6.1-.2 0-.4 0-.6-.1-.2-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.7s1.2 3.1 1.4 3.3c.2.2 2.3 3.5 5.6 4.9.8.3 1.4.5 1.9.6.8.2 1.5.2 2 .1.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.3.2-1.5-.1-.1-.3-.2-.6-.4Z" fill="#fff" />
      </svg>
    </span>
  )
}

export default function App() {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(null)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('submitting')
    setError('')

    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.message || 'We could not submit your details. Please try again.')
      }

      setStatus('success')
      setForm(initialForm)
    } catch (submitError) {
      setError(
        submitError.message === 'Failed to fetch'
          ? 'We could not connect right now. Please check your connection and try again.'
          : submitError.message
      )
      setStatus('idle')
    }
  }

  const resetForm = () => {
    setStatus('idle')
    setError('')
    setForm(initialForm)
  }

  return (
    <main className="page-shell">
      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />

      <header className="topbar">
        <a className="brand" href="/" aria-label="Connect home">
          <WhatsAppMark small />
          <span>Connect<span className="brand-dot">.</span></span>
        </a>
        <div className="topbar-note">
          <span className="live-dot" />
          <span>Digital engagement experience</span>
        </div>
      </header>

      <section className="main-layout">
        <aside className="intro-panel">
          <div className="eyebrow"><span className="eyebrow-line" /> A BETTER WAY TO CONNECT</div>
          <h1>Conversations that move <span>business forward.</span></h1>
          <p className="intro-copy">
            One simple step to start a meaningful conversation. Share your details
            and our team will connect with you on WhatsApp.
          </p>

          <div className="conversation-card" aria-label="Example WhatsApp conversation">
            <div className="conversation-head">
              <div className="conversation-avatar"><WhatsAppMark small /></div>
              <div>
                <strong>Connect Support</strong>
                <span><i /> Typically replies quickly</span>
              </div>
              <span className="verified-mark" title="Verified experience">✓</span>
            </div>
            <div className="chat-body">
              <div className="chat-date">TODAY</div>
              <div className="chat-bubble chat-bubble--received">
                Hello! 👋 Thanks for reaching out. How can we help you today?
                <span>10:42 AM</span>
              </div>
              <div className="chat-bubble chat-bubble--sent">
                I'd like to know more.
                <span>10:43 AM <b>✓✓</b></span>
              </div>
              <div className="chat-bubble chat-bubble--received">
                Absolutely. Our team will be happy to assist.
                <span>10:43 AM</span>
              </div>
            </div>
            <div className="conversation-foot">
              <span className="lock-icon">⌑</span>
              Your details are handled with care
            </div>
          </div>

          <div className="trust-row">
            <div className="trust-item">
              <span className="trust-icon">↗</span>
              <div><strong>Simple</strong><small>Quick to complete</small></div>
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <span className="trust-icon trust-icon--shield">✓</span>
              <div><strong>Secure</strong><small>Privacy-conscious</small></div>
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <span className="trust-icon trust-icon--chat">◎</span>
              <div><strong>Personal</strong><small>Human connection</small></div>
            </div>
          </div>
        </aside>

        <section className="form-card">
          <div className="form-card-top">
            <div className="form-icon"><WhatsAppMark /></div>
            <span className="form-kicker">LET'S GET STARTED</span>
          </div>

          {status === 'success' ? (
            <div className="success-state" role="status" aria-live="polite">
              <div className="success-icon"><span>✓</span></div>
              <div className="success-label">SUBMISSION RECEIVED</div>
              <h2>Thank you, {form.name || 'there'}!</h2>
              <p>Your details have been securely submitted. Our team will reach out to you on WhatsApp.</p>
              <button className="secondary-button" type="button" onClick={resetForm}>
                Submit another response <span>↗</span>
              </button>
            </div>
          ) : (
            <>
              <div className="form-heading">
                <div className="step-label">YOUR DETAILS <span>01 / 01</span></div>
                <h2>Let’s start a conversation.</h2>
                <p>Tell us a little about yourself. It only takes a moment.</p>
              </div>

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="fields-grid">
                  {fields.map(({ name, label, type, placeholder, icon, autoComplete }, index) => (
                    <div
                      className={`field ${focused === name ? 'field--focused' : ''}`}
                      key={name}
                    >
                      <label htmlFor={name}>{label}<span className="required">*</span></label>
                      <div className="input-wrap">
                        <span className="field-icon"><FieldIcon name={icon} /></span>
                        <input
                          id={name}
                          name={name}
                          type={type}
                          placeholder={placeholder}
                          value={form[name]}
                          onChange={handleChange}
                          onFocus={() => setFocused(name)}
                          onBlur={() => setFocused(null)}
                          autoComplete={autoComplete}
                          required
                          maxLength={name === 'whatsapp' ? 20 : 120}
                        />
                        {index === 1 && <span className="country-code">INTL.</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={`field field--message ${focused === 'message' ? 'field--focused' : ''}`}>
                  <label htmlFor="message">How can we help? <span className="optional">OPTIONAL</span></label>
                  <div className="input-wrap input-wrap--textarea">
                    <span className="field-icon"><FieldIcon name="message" /></span>
                    <textarea
                      id="message"
                      name="message"
                      rows={3}
                      placeholder="Share a few details about what you're looking for..."
                      value={form.message}
                      onChange={handleChange}
                      onFocus={() => setFocused('message')}
                      onBlur={() => setFocused(null)}
                      maxLength={500}
                    />
                  </div>
                  <div className="textarea-meta"><span>Give us a little context</span><span>{form.message.length}/500</span></div>
                </div>

                {error && <div className="error-message" role="alert">{error}</div>}

                <button className="submit-button" type="submit" disabled={status === 'submitting'}>
                  {status === 'submitting' ? (
                    <><span className="spinner" /> Submitting your details...</>
                  ) : (
                    <>Continue on WhatsApp <span className="button-arrow">↗</span></>
                  )}
                </button>

                <p className="privacy-note">
                  <span>♧</span> Your information is used only to respond to your enquiry.
                </p>
              </form>
            </>
          )}
          <div className="card-footer">
            <span>POWERED BY CONVERSATION</span>
            <span className="footer-mark"><WhatsAppMark small /> WhatsApp</span>
          </div>
        </section>
      </section>

      <footer className="page-footer">
        <span>© {new Date().getFullYear()} Connect Experience</span>
        <span>Thoughtful conversations. Better outcomes.</span>
      </footer>
    </main>
  )
}
