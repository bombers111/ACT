export default function SurveyComplete() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f2ec',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: '48px 40px',
        maxWidth: 480,
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h1 style={{ color: '#1a3d2b', marginBottom: 12, fontSize: '1.5rem' }}>
          Thank you — your response has been recorded.
        </h1>
        <p style={{ color: '#555', lineHeight: 1.6, marginBottom: 8 }}>
          Your expert input will be used to calibrate the MCA weights for the
          ACT Agro-regenerative Citrus Tool.
        </p>
        <p style={{ color: '#888', fontSize: '0.9rem' }}>
          You can close this tab.
        </p>
      </div>
    </div>
  );
}
