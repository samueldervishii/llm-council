import useTitle from '../hooks/useTitle'
import './ArticlePage.css'

function UsagePolicyPage() {
  useTitle('Usage Policy')

  return (
    <div className="article-page">
      <div className="article-hero">
        <nav className="article-breadcrumb">
          <a href="/">Cortex</a>
          <span>/</span>
          <span>Legal</span>
        </nav>
        <h1>Usage Policy</h1>
        <p className="article-hero-date">Effective March 31, 2026</p>
      </div>

      <div className="article-container">
        <p className="article-intro">
          This Usage Policy applies to all users of Cortex. It is intended to ensure a safe,
          respectful, and productive experience for everyone.
        </p>

        <section>
          <h2>Acceptable Use</h2>
          <p>Cortex is designed to help you with:</p>
          <ul>
            <li>Academic writing, research, and thesis development</li>
            <li>Learning new concepts and getting explanations</li>
            <li>Brainstorming and organizing ideas</li>
            <li>Drafting, editing, and improving documents</li>
            <li>Programming assistance and code review</li>
            <li>General knowledge questions and professional tasks</li>
          </ul>
        </section>

        <section>
          <h2>Prohibited Use</h2>
          <p>You may not use Cortex to:</p>
          <ul>
            <li>
              <strong>Generate harmful content</strong> &mdash; Including content that promotes violence,
              harassment, discrimination, or illegal activities.
            </li>
            <li>
              <strong>Deceive or manipulate</strong> &mdash; Creating misinformation, impersonating others,
              or generating fraudulent content.
            </li>
            <li>
              <strong>Violate intellectual property</strong> &mdash; Systematically reproducing copyrighted
              material or generating content that infringes on others' rights.
            </li>
            <li>
              <strong>Compromise security</strong> &mdash; Attempting to exploit vulnerabilities, access
              other users' data, or circumvent safety measures.
            </li>
            <li>
              <strong>Submit academic work dishonestly</strong> &mdash; Presenting AI-generated content
              as entirely your own work without proper disclosure, where your institution's policies
              require it.
            </li>
          </ul>
        </section>

        <section>
          <h2>AI Model &amp; Limitations</h2>
          <p>
            Cortex is powered by Anthropic's Claude, and all conversations are subject
            to <a href="https://www.anthropic.com/legal/aup" target="_blank" rel="noopener noreferrer">Anthropic's Usage Policy</a>.
          </p>
          <p>
            AI responses may sometimes be inaccurate, incomplete, or outdated.
            You should always verify important information independently. Cortex is a tool
            to assist your work, not a replacement for critical thinking or professional advice.
          </p>
        </section>

        <section>
          <h2>Your Data</h2>
          <ul>
            <li>Your conversations are stored securely and are only accessible to you.</li>
            <li>Shared sessions are visible only to those with the unique share link.</li>
            <li>You can export or delete your data at any time from <a href="/settings?tab=data">Settings &rarr; Data</a>.</li>
            <li>File uploads (PDF, DOCX, TXT) are stored alongside your conversations and can be removed by deleting the session.</li>
          </ul>
        </section>

        <section>
          <h2>Account Responsibility</h2>
          <p>
            You are responsible for all activity under your account. Keep your credentials secure
            and do not share your account with others. Cortex reserves the right to suspend accounts
            that violate this policy.
          </p>
        </section>

        <section>
          <h2>Rate Limits</h2>
          <p>
            To ensure fair usage for all users, Cortex applies reasonable rate limits including
            a daily message quota and minimum intervals between messages. These limits may be
            adjusted as the platform grows.
          </p>
        </section>

        <section>
          <h2>Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. Continued use of Cortex after changes
            are posted constitutes acceptance of the updated policy.
          </p>
        </section>

        <div className="article-footer">
          <p>
            Questions about this policy? Reach out via <a href="https://github.com/samueldervishii/cortex" target="_blank" rel="noopener noreferrer">GitHub</a>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default UsagePolicyPage
