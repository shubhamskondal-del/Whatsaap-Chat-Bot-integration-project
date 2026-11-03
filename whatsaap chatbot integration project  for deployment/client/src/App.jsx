import { useState } from 'react'
import './App.css'
 
const initialForm = { name: '', whatsapp: '', email: '', city: '', message: '' }
 
const fields = [
  { name: 'name',     label: 'Full Name',       type: 'text',  placeholder: 'John Doe',         icon: '👤' },
  { name: 'whatsapp', label: 'WhatsApp Number',  type: 'tel',   placeholder: '+91 98765 43210',  icon: '📱' },
  { name: 'email',    label: 'Email Address',    type: 'email', placeholder: 'john@example.com', icon: '✉️' },
  { name: 'city',     label: 'City',             type: 'text',  placeholder: 'Mumbai',           icon: '📍' },
]
 
export default function App() {
  const [form, setForm]       = useState(initialForm)
  const [status, setStatus]   = useState(null)
  const [focused, setFocused] = useState(null)
 
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
 
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setForm(initialForm)
    } catch {
      alert('Failed to save. Make sure server is running.')
    }
  }
 
  return (
    <div className="page">
      <div className="blob blob1" />
      <div className="blob blob2" />
      <div className="blob blob3" />
 
      <div className="wrapper">
        <div className="left-panel">
          <div className="wa-logo">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="url(#wg)"/>
              <path d="M22.5 9.5A9 9 0 0 0 7.1 20.3L6 26l5.8-1.5A9 9 0 1 0 22.5 9.5Zm-6.5 13.8a7.4 7.4 0 0 1-3.8-1l-.3-.2-3.1.8.8-3-.2-.3a7.5 7.5 0 1 1 6.6 3.7Zm4.1-5.6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1l-.7.9c-.1.1-.2.2-.4.1a6.4 6.4 0 0 1-1.9-1.2 7 7 0 0 1-1.3-1.6c-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.1 5 5 0 0 0 1.1 2.7 11.5 11.5 0 0 0 4.4 3.9c.6.3 1.1.4 1.5.3a2.6 2.6 0 0 0 1.7-1.2 2 2 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3Z" fill="#fff"/>
              <defs>
                <linearGradient id="wg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#25d366"/>
                  <stop offset="1" stopColor="#128c7e"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1>Connect with us on <span>WhatsApp</span></h1>
          <p>Drop your details and our team will reach out to you personally within minutes.</p>
          <ul className="perks">
            <li><span className="perk-icon">⚡</span> Instant response</li>
            <li><span className="perk-icon">🔒</span> 100% private & secure</li>
            <li><span className="perk-icon">🌍</span> Available worldwide</li>
          </ul>
          <div className="left-footer">Trusted by <strong>10,000+</strong> users globally</div>
        </div>
 
        <div className="right-panel">
          {status === 'success' ? (
            <div className="success-state">
              <div className="success-ring"><span>✓</span></div>
              <h2>You're all set!</h2>
              <p>Your details have been saved. We'll WhatsApp you shortly!</p>
              <button className="btn-again" onClick={() => setStatus(null)}>↩ Submit another</button>
            </div>
          ) : (
            <>
              <div className="form-heading">
                <h2>Get in Touch</h2>
                <p>Fill the form below — takes 30 seconds</p>
              </div>
              <form onSubmit={handleSubmit} className="form">
                {fields.map(({ name, label, type, placeholder, icon }) => (
                  <div className={`field ${focused === name ? 'field--focused' : ''}`} key={name}>
                    <label htmlFor={name}>{label}</label>
                    <div className="input-wrap">
                      <span className="field-icon">{icon}</span>
                      <input
                        id={name} name={name} type={type}
                        placeholder={placeholder}
                        value={form[name]}
                        onChange={handleChange}
                        onFocus={() => setFocused(name)}
                        onBlur={() => setFocused(null)}
                        required
                      />
                    </div>
                  </div>
                ))}
                <div className={`field ${focused === 'message' ? 'field--focused' : ''}`}>
                  <label htmlFor="message">Message <span className="optional">(optional)</span></label>
                  <div className="input-wrap input-wrap--textarea">
                    <span className="field-icon">💬</span>
                    <textarea
                      id="message" name="message" rows={3}
                      placeholder="What would you like to discuss?"
                      value={form.message}
                      onChange={handleChange}
                      onFocus={() => setFocused('message')}
                      onBlur={() => setFocused(null)}
                    />
                  </div>
                </div>
                <button type="submit" className="btn-submit">
                  <span>Send via WhatsApp</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}