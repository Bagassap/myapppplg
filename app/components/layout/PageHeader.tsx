interface PageHeaderProps {
  icon: string;
  title: string;
  subtitle?: string;
}

export default function PageHeader({ icon, title, subtitle }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: subtitle ? 20 : 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: subtitle ? 4 : 0 }}>
        <div
          style={{ width: 4, height: 32, background: "#ACEC00", borderRadius: 2, flexShrink: 0 }}
        />
        <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
        <h1
          style={{
            color: "var(--text-primary)",
            fontWeight: 700,
            fontSize: 28,
            margin: 0,
            letterSpacing: "-0.5px",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
      </div>
      {subtitle && (
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 13,
            margin: 0,
            paddingLeft: 16,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
