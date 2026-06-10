export default function Welcome({ onStart }) {
  return (
    <div className="welcome-screen">
      <div className="welcome-card">
        <div className="logo-area">
          <h1>ACT</h1>
          <p className="logo-sub">Agro-regenerative Citrus Tool</p>
        </div>

        <div className="welcome-body">
          <p className="welcome-intro">
            This tool helps you assess how regenerative your Valencia citrus farm is,
            identify your biggest opportunities, and take concrete next steps.
          </p>

          <div className="welcome-how">
            <div className="how-step">
              <div>
                <strong>Answer 29 questions</strong>
                <p>About your soil, water, biodiversity, inputs and more</p>
              </div>
            </div>
            <div className="how-step">
              <div>
                <strong>Get your MCA score</strong>
                <p>Weighted across 10 regenerative criteria</p>
              </div>
            </div>
            <div className="how-step">
              <div>
                <strong>See your priorities</strong>
                <p>Clear next steps for your weakest areas</p>
              </div>
            </div>
          </div>

          <div className="welcome-note">
            Based on the <strong>Iberian Regenerative Agriculture Criteria 2026</strong> (CREAF / Asociación de Agricultura Regenerativa), adapted for citrus farming in Valencia.
          </div>
        </div>

        <button className="btn-primary btn-large" onClick={onStart}>
          Start Assessment
        </button>
      </div>
    </div>
  );
}
