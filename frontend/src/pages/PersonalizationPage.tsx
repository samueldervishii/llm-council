import useTitle from '../hooks/useTitle'
import './ArticlePage.css'

function PersonalizationPage() {
  useTitle('Personalization')

  return (
    <div className="article-page">
      <div className="article-hero">
        <nav className="article-breadcrumb">
          <a href="/">Cortex</a>
          <span>/</span>
          <span>Help</span>
        </nav>
        <h1>Understanding Cortex's Personalization Features</h1>
      </div>

      <div className="article-container">
        <p className="article-intro">
          Cortex offers several ways to personalize your experience through your profile settings.
          These help Cortex better understand and meet your needs in every conversation.
        </p>

        <div className="article-toc">
          <h4>On this page</h4>
          <ul>
            <li><a href="#profile-preferences">Profile Preferences</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#best-practices">Best Practices</a></li>
            <li><a href="#privacy">Privacy</a></li>
          </ul>
        </div>

        <section id="profile-preferences">
          <h2>Profile Preferences</h2>
          <p>
            Profile preferences are account-wide settings that help Cortex understand your general
            preferences. These are set in <a href="/settings?tab=general">Settings &rarr; General</a> and
            include:
          </p>
          <ul>
            <li>
              <strong>Display name &amp; username</strong> &mdash; How Cortex addresses you in conversations
              and how you appear in shared sessions.
            </li>
            <li>
              <strong>Field of work</strong> &mdash; Helps Cortex tailor responses to your professional
              context. An engineer will get different explanations than a student or marketer.
            </li>
            <li>
              <strong>Personal preferences</strong> &mdash; Free-form instructions that apply to all your
              conversations. For example: "I primarily code in Python", "Keep explanations concise",
              or "I'm a beginner in machine learning".
            </li>
          </ul>
        </section>

        <section id="how-it-works">
          <h2>How It Works</h2>
          <p>
            When you start a conversation, Cortex includes your profile context alongside your message.
            This means the AI model can:
          </p>
          <ul>
            <li>Adjust the technical depth of explanations based on your field of work</li>
            <li>Follow your communication preferences (brief vs. detailed, formal vs. casual)</li>
            <li>Remember your tools and technologies without you having to repeat them</li>
            <li>Provide examples relevant to your domain</li>
          </ul>
          <p>
            Your preferences apply to <strong>all conversations</strong> automatically. You don't need to
            re-explain your background in each new chat.
          </p>
        </section>

        <section id="best-practices">
          <h2>Best Practices</h2>
          <p>To get the most out of personalization:</p>
          <ul>
            <li>
              <strong>Be specific</strong> &mdash; "I'm a 3rd-year CS student writing my thesis on NLP"
              is more useful than "I'm a student".
            </li>
            <li>
              <strong>State your tools</strong> &mdash; Mentioning your programming languages, frameworks,
              or tools helps Cortex give relevant code examples.
            </li>
            <li>
              <strong>Set communication style</strong> &mdash; If you prefer concise answers, say so.
              If you want step-by-step explanations, mention that.
            </li>
            <li>
              <strong>Update regularly</strong> &mdash; As your needs change, update your preferences
              to keep responses relevant.
            </li>
          </ul>
        </section>

        <section id="privacy">
          <h2>Privacy</h2>
          <p>
            Your profile information is stored securely in your account and is only used to personalize
            your own conversations. It is never shared with other users or used for purposes other than
            improving your Cortex experience.
          </p>
          <p>
            You can update or clear your preferences at any time from
            your <a href="/settings?tab=general">profile settings</a>.
          </p>
        </section>

        <div className="article-footer">
          <p>
            Have questions? Start a new conversation with Cortex and ask for help.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PersonalizationPage
